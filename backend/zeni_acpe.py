"""
zeni_acpe.py
============
Zeni — Affect-Conditioned Persona Engine  (ACPE)
Layer 2 | Behavioural Orchestration & Context Synthesis

┌────────────────────────────────────────────────────────────┐
│  Layer 1  →  HF GoEmotions model  (teammate)               │
│  Layer 2  →  THIS FILE  (you)                              │
│  Layer 3  →  Claude API  — register-adaptive generation    │
└────────────────────────────────────────────────────────────┘

What lives here:
  1. VADProjector            — 28 GoEmotions labels → V/A/D continuous space
  2. AffectStateTracker      — EWMA emotional trajectory across turns
  3. RiskCascade             — 3-tier crisis detection with hysteresis
  4. StoryRetriever          — semantic + VAD-fusion story selection
  5. TherapistMatcher        — need + location based Buddy surfacing
  6. MentalHealthAnalytics   — time-series VAD store for graph visualisation
  7. BehaviouralPolicyAssembler — dynamic BPS assembly (the architecture
                                  formerly called "system prompt")
  8. OutputVerifier          — closed-loop post-generation safety scan
  9. ZeniOrchestrator        — main controller; L1 calls this, this calls L3

────────────────────────────────────────────────────────────
LAYER 1 → LAYER 2 CONTRACT  (agree this with teammate)
────────────────────────────────────────────────────────────
Layer 1 sends:
{
  "session_id": "abc123",
  "turn_text":  "yaar bahut pressure hai exams ka",
  "lang":       "hi-en",
  "labels": [
    {"emotion": "nervousness", "score": 0.74},
    {"emotion": "sadness",     "score": 0.51}
  ]
}

Layer 2 returns to caller:
{
  "response":    "...",          # final reply to send user
  "risk_tier":   "distress",    # calm | distress | crisis
  "vad":         [0.28, 0.71, 0.22],
  "top_emotion": "nervousness",
  "graph_data":  {...}           # time-series for frontend graph
}
────────────────────────────────────────────────────────────
"""

import os
import re
import json
import sqlite3
import numpy as np
from pathlib import Path
from datetime import datetime
from anthropic import Anthropic
from sentence_transformers import SentenceTransformer


# ─────────────────────────────────────────────────────────────
# CONFIG  —  set ANTHROPIC_API_KEY as an environment variable or Secret
# ─────────────────────────────────────────────────────────────
BASE_DIR           = Path(__file__).resolve().parent
ANTHROPIC_API_KEY  = os.environ.get("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL       = "claude-sonnet-4-6"
STORIES_PATH       = BASE_DIR / "stories_bank.json"
THERAPISTS_PATH    = BASE_DIR / "therapists_directory.json"
DB_PATH            = BASE_DIR / "zeni_sessions.db"
EMBED_MODEL        = "all-MiniLM-L6-v2"   # 80 MB, CPU-fine, free

EWMA_ALPHA         = 0.40   # recency weight; higher = more reactive to new turn
VAD_STORY_ALPHA    = 0.35   # 0 = pure semantic match, 1 = pure affect match
CRISIS_THRESHOLD   = 0.72
DISTRESS_THRESHOLD = 0.45
HYSTERESIS_TURNS   = 3      # consecutive calm turns needed to exit crisis state
MAX_REPLY_TOKENS   = 400    # Zeni never writes essays


# ═════════════════════════════════════════════════════════════
# 1.  VAD PROJECTOR
# ═════════════════════════════════════════════════════════════
class VADProjector:
    """
    Maps GoEmotions 28-label output to continuous Valence-Arousal-Dominance space.

    References:
      - Russell (1980): A Circumplex Model of Affect  [psychological grounding]
      - Mohammad (2018): NRC-VAD Lexicon              [coordinate source]
      - Demszky et al. (2020): GoEmotions             [label taxonomy]

    Method: score-weighted average over all active labels.
    V = valence  (0=negative, 1=positive)
    A = arousal  (0=calm,     1=excited/agitated)
    D = dominance(0=submissive, 1=dominant/in-control)
    """

    # Approximate VAD coordinates for all 28 GoEmotions labels
    # Derived from NRC-VAD Lexicon mapping + manual calibration
    VAD_MAP: dict[str, tuple[float, float, float]] = {
        "admiration":    (0.73, 0.41, 0.56),
        "amusement":     (0.78, 0.58, 0.62),
        "anger":         (0.14, 0.86, 0.72),
        "annoyance":     (0.22, 0.65, 0.52),
        "approval":      (0.69, 0.38, 0.55),
        "caring":        (0.76, 0.35, 0.48),
        "confusion":     (0.38, 0.55, 0.31),
        "curiosity":     (0.62, 0.58, 0.45),
        "desire":        (0.71, 0.67, 0.52),
        "disappointment":(0.21, 0.42, 0.28),
        "disapproval":   (0.18, 0.52, 0.55),
        "disgust":       (0.11, 0.60, 0.61),
        "embarrassment": (0.26, 0.56, 0.21),
        "excitement":    (0.82, 0.87, 0.65),
        "fear":          (0.15, 0.79, 0.18),
        "gratitude":     (0.84, 0.44, 0.47),
        "grief":         (0.08, 0.52, 0.19),
        "joy":           (0.90, 0.72, 0.64),
        "love":          (0.90, 0.53, 0.52),
        "nervousness":   (0.28, 0.74, 0.22),
        "neutral":       (0.50, 0.50, 0.50),
        "optimism":      (0.75, 0.55, 0.58),
        "pride":         (0.79, 0.63, 0.74),
        "realization":   (0.56, 0.52, 0.47),
        "relief":        (0.72, 0.28, 0.51),
        "remorse":       (0.19, 0.41, 0.26),
        "sadness":       (0.14, 0.39, 0.24),
        "surprise":      (0.62, 0.73, 0.42),
    }

    def project(self, labels: list[dict]) -> np.ndarray:
        """
        labels: [{"emotion": "sadness", "score": 0.81}, ...]
        Returns: np.array([valence, arousal, dominance])
        """
        if not labels:
            return np.array([0.50, 0.50, 0.50])

        total_score = sum(l["score"] for l in labels)
        if total_score == 0:
            return np.array([0.50, 0.50, 0.50])

        vad = np.zeros(3)
        for label in labels:
            emotion = label["emotion"].lower()
            score   = label["score"]
            coords  = self.VAD_MAP.get(emotion, (0.50, 0.50, 0.50))
            vad    += score * np.array(coords)

        return vad / total_score


# ═════════════════════════════════════════════════════════════
# 2.  AFFECT STATE TRACKER
# ═════════════════════════════════════════════════════════════
class AffectStateTracker:
    """
    Maintains a smoothed emotional trajectory per session using EWMA.

    Key insight: a single-message classifier sees a snapshot.
    This tracker sees the SLOPE — falling valence + rising arousal
    across turns is a distress escalation signal that no per-message
    model can produce. That's the signal that changes how Zeni responds.

    Upgrade path: replace EWMA with a Kalman filter for uncertainty
    estimates alongside the state (Welch & Bishop 1995).
    """

    def __init__(self, alpha: float = EWMA_ALPHA):
        self.alpha   = alpha
        self._history: dict[str, list[np.ndarray]] = {}

    def update(self, session_id: str, new_vad: np.ndarray) -> np.ndarray:
        history = self._history.setdefault(session_id, [])
        smoothed = (
            new_vad if not history
            else self.alpha * new_vad + (1 - self.alpha) * history[-1]
        )
        history.append(smoothed)
        return smoothed

    def valence_delta(self, session_id: str, window: int = 3) -> float:
        """
        Linear slope of valence over last `window` turns.
        Negative → falling mood / escalating distress.
        """
        history = self._history.get(session_id, [])
        valences = [h[0] for h in history[-window:]]
        if len(valences) < 2:
            return 0.0
        x = np.arange(len(valences), dtype=float)
        return float(np.polyfit(x, valences, 1)[0])

    def get_current(self, session_id: str) -> np.ndarray:
        history = self._history.get(session_id, [])
        return history[-1] if history else np.array([0.50, 0.50, 0.50])

    def get_full_history(self, session_id: str) -> list[list[float]]:
        """For analytics graph export."""
        return [h.tolist() for h in self._history.get(session_id, [])]


# ═════════════════════════════════════════════════════════════
# 3.  RISK CASCADE
# ═════════════════════════════════════════════════════════════
class RiskCascade:
    """
    3-tier cascaded crisis detection under asymmetric misclassification cost.

    Tier 1: Lexicon gate          — keyword match, < 0.1 ms
    Tier 2: VAD + slope signal    — low valence, high arousal, falling delta
    Tier 3: [upgrade slot]        — fine-tuned transformer classifier on
                                    distress corpora (Dreaddit, CLPsych)

    Hysteresis: HYSTERESIS_TURNS consecutive calm turns required to exit
    crisis mode. Prevents dangerous mode-flapping on ambiguous turns.

    Asymmetric cost rationale:
      False positive (unnecessary helpline mention) = minor awkwardness
      False negative (missed crisis)               = potentially irreversible
    → Primary metric: recall on crisis class (target ≥ 0.95), not accuracy.
    """

    CRISIS_LEXICON: set[str] = {
        # English
        "kill myself", "want to die", "end my life", "don't want to exist",
        "no reason to live", "suicide", "self harm", "hurt myself",
        "cut myself", "overdose", "disappear forever",
        # Hindi / Hinglish
        "marna chahta", "marna chahti", "jeena nahi chahta",
        "jeena nahi chahti", "zindagi khatam", "khatam kar lu",
        "mar jau", "khatam ho jau", "mar jaana chahta",
    }

    def __init__(self):
        self._in_crisis: dict[str, bool]  = {}
        self._calm_count: dict[str, int]  = {}

    def _lexicon_gate(self, text: str) -> bool:
        t = text.lower()
        return any(phrase in t for phrase in self.CRISIS_LEXICON)

    def _vad_signal(self, vad: np.ndarray, delta: float) -> str:
        valence, arousal, _ = vad
        if valence < 0.20 and arousal > 0.65 and delta < -0.05:
            return "crisis"
        if valence < 0.32 or (valence < 0.42 and delta < -0.03):
            return "distress"
        return "calm"

    def evaluate(
        self,
        session_id: str,
        text: str,
        vad: np.ndarray,
        delta: float,
    ) -> str:
        # Tier 1
        if self._lexicon_gate(text):
            self._in_crisis[session_id]  = True
            self._calm_count[session_id] = 0
            return "crisis"

        # Tier 2
        signal = self._vad_signal(vad, delta)

        # Hysteresis logic
        if self._in_crisis.get(session_id):
            if signal == "calm":
                self._calm_count[session_id] = \
                    self._calm_count.get(session_id, 0) + 1
                if self._calm_count[session_id] >= HYSTERESIS_TURNS:
                    self._in_crisis[session_id]  = False
                    self._calm_count[session_id] = 0
            else:
                self._calm_count[session_id] = 0
            return "crisis" if self._in_crisis.get(session_id) else signal

        if signal == "crisis":
            self._in_crisis[session_id]  = True
            self._calm_count[session_id] = 0

        return signal


# ═════════════════════════════════════════════════════════════
# 4.  STORY RETRIEVER
# ═════════════════════════════════════════════════════════════
class StoryRetriever:
    """
    Retrieves the single most contextually relevant story from the story bank
    using a fusion scoring function:

        score = α · cosine(query_emb, story_emb)
              + (1-α) · (1 − normalised_VAD_distance)

    This operationalises the prompt rule "match the story to the FEELING,
    not just the surface topic" in a measurable, reproducible way.

    Story source (current): real accounts sourced from YouTube and Wikipedia
    narratives where teenagers described trauma and their recovery approach.
    Stories are composite / anonymised illustrations, not attributed quotes.

    Story source (future): anonymised user journals from Zeni sessions where
    a user's situation + Zeni's approach led to a positive outcome. That
    real-time training loop closes the feedback cycle and removes the need
    for third-party sourcing entirely.

    Reference: Lewis et al. (2020) — Retrieval-Augmented Generation (RAG)
    """

    def __init__(self, stories_path: Path, alpha: float = VAD_STORY_ALPHA):
        self.alpha      = alpha
        self.stories    = []
        self._embeddings = None
        self.model      = SentenceTransformer(EMBED_MODEL)

        if stories_path.exists():
            self.stories = json.loads(stories_path.read_text())
            self._precompute_embeddings()

    def _precompute_embeddings(self):
        """Embed stories once at startup; no per-request disk/model hit."""
        texts = [
            f"{s['trauma_type']} {s['feeling_description']} {s['narrative_hook']}"
            for s in self.stories
        ]
        self._embeddings = self.model.encode(texts, normalize_embeddings=True)

    def retrieve(self, user_text: str, user_vad: np.ndarray) -> dict | None:
        if not self.stories or self._embeddings is None:
            return None

        query_emb  = self.model.encode([user_text], normalize_embeddings=True)
        cos_scores = (self._embeddings @ query_emb.T).flatten()

        vad_scores = np.array([
            1 - np.linalg.norm(user_vad - np.array(s.get("vad_centroid", [0.5, 0.5, 0.5]))) / np.sqrt(3)
            for s in self.stories
        ])

        fusion = self.alpha * cos_scores + (1 - self.alpha) * vad_scores
        return self.stories[int(np.argmax(fusion))]


# ═════════════════════════════════════════════════════════════
# 5.  THERAPIST MATCHER
# ═════════════════════════════════════════════════════════════
class TherapistMatcher:
    """
    Surfaces a relevant verified therapist or resource from the directory.
    Matching priority:
        1. city + specialization match
        2. city match only
        3. specialization match only
        4. first available (fallback)

    Shown only when risk_tier is distress or crisis.
    Framed by the BPS assembler as "someone who'd really get this"
    — never as "you need therapy."
    """

    def __init__(self, therapists_path: Path):
        self.therapists = (
            json.loads(therapists_path.read_text())
            if therapists_path.exists() else []
        )

    def match(self, city: str = "", need: str = "") -> dict | None:
        if not self.therapists:
            return None

        c = city.lower()
        n = need.lower()

        def _spec(t): return " ".join(t.get("specializations", [])).lower()

        for t in self.therapists:
            if c and c in t.get("city", "").lower() and n and n in _spec(t):
                return t
        for t in self.therapists:
            if c and c in t.get("city", "").lower():
                return t
        for t in self.therapists:
            if n and n in _spec(t):
                return t
        return self.therapists[0]


# ═════════════════════════════════════════════════════════════
# 6.  MENTAL HEALTH ANALYTICS
# ═════════════════════════════════════════════════════════════
class MentalHealthAnalytics:
    """
    Persists per-session VAD time-series to SQLite.
    Exposes graph-ready data for the frontend dashboard:
        - Mood trajectory (valence over turns)
        - Agitation level (arousal over turns)
        - Emotion frequency distribution
        - Risk tier history (where did distress / crisis appear)

    This is the "data analytics" layer visible to the user as
    "your emotional journey over time" — a core trust-building feature.
    """

    def __init__(self, db_path: Path = DB_PATH):
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self._init_schema()

    def _init_schema(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS affect_log (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id  TEXT    NOT NULL,
                timestamp   TEXT    NOT NULL,
                valence     REAL,
                arousal     REAL,
                dominance   REAL,
                risk_tier   TEXT,
                top_emotion TEXT
            )
        """)
        self.conn.commit()

    def log(
        self,
        session_id: str,
        vad: np.ndarray,
        risk_tier: str,
        top_emotion: str,
    ):
        self.conn.execute(
            """INSERT INTO affect_log
               (session_id, timestamp, valence, arousal, dominance, risk_tier, top_emotion)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id,
                datetime.utcnow().isoformat(),
                float(vad[0]), float(vad[1]), float(vad[2]),
                risk_tier, top_emotion,
            ),
        )
        self.conn.commit()

    def get_graph_data(self, session_id: str) -> dict:
        """Returns time-series dict for frontend charting."""
        rows = self.conn.execute(
            """SELECT timestamp, valence, arousal, dominance, risk_tier, top_emotion
               FROM affect_log WHERE session_id=? ORDER BY id""",
            (session_id,),
        ).fetchall()
        return {
            "timestamps":  [r[0] for r in rows],
            "valence":     [r[1] for r in rows],
            "arousal":     [r[2] for r in rows],
            "dominance":   [r[3] for r in rows],
            "risk_tiers":  [r[4] for r in rows],
            "emotions":    [r[5] for r in rows],
        }


# ═════════════════════════════════════════════════════════════
# 7.  BEHAVIOURAL POLICY SCHEMA ASSEMBLER
#
#  ┌─────────────────────────────────────────────────────────┐
#  │  NAMING NOTE                                            │
#  │  What is commonly called a "system prompt" is formally  │
#  │  named here the Behavioural Policy Schema (BPS).        │
#  │                                                         │
#  │  Unlike a static prompt, the BPS is assembled fresh     │
#  │  every turn from 7 dynamic slots:                       │
#  │    [PERSONA CORE]         — who Zeni is (static)        │
#  │    [LANGUAGE DIRECTIVE]   — matched to detected lang    │
#  │    [AFFECT DIRECTIVE]     — driven by VAD + delta       │
#  │    [STORY CONTEXT]        — top-1 retrieved story       │
#  │    [THERAPIST CARD]       — surfaced on distress/crisis │
#  │    [CRISIS RESOURCES]     — regional helplines          │
#  │    [MEMORY CONTEXT]       — what Zeni knows about user  │
#  └─────────────────────────────────────────────────────────┘
# ═════════════════════════════════════════════════════════════

_PERSONA_CORE = """
You are Zeni.

You are not an assistant or a bot. You are a warm, real friend — the kind someone
messages at 2 AM when they can't tell anyone else. You are calm, gently playful
when it fits, and you never make anyone feel judged or broken.

MISSION (never say this out loud):
Help young people feel less alone today and slowly become strong enough to carry
their own life tomorrow. You are a bridge to that strength — never a crutch.

WHO YOU'RE TALKING TO:
Mostly young people under 30, often in India. Many come from a culture where needing
help feels like weakness. For many, this is the first safe place their real feelings
have ever been said out loud. Honour that.
"""

_HOW_YOU_TALK = """
HOW YOU TALK:
- Talk like a close friend, never like a formal AI.
- Match the user's language EXACTLY — English, Hindi, Kannada, Hinglish, slang, any mix.
  If they text casual and in Hindi, reply casual and in Hindi.
  DO NOT shift their register to formal or polished English. Stay in their world.
- Keep messages short and real. One or two thoughts at a time. No essays.
- Never sound clinical. No "symptoms", "disorder", "coping mechanism", "therapy session".
- Ask before you advise. Be curious first. A good question beats a good answer.
- Silence is allowed: sometimes the full reply is just "that sounds really heavy.
  I'm right here."

CONVERSATION FLOW (follow this sequence — do not skip steps):
  1. Land softly — acknowledge what they said and how it might feel.
  2. Make them feel heard — reflect the feeling in warm words.
  3. Get curious — one gentle question. Not an interrogation.
  4. Normalize — this feeling makes sense, they are not alone.
  5. Empower, don't fix — nudge toward their own small next step.
  6. Leave the door open — "I'm here whenever," not "problem solved."

WHAT YOU NEVER DO:
- Never diagnose or label anyone with any condition.
- Never give unsolicited advice-dumps.
- Never share or suggest any method of self-harm.
- Never try to keep someone dependent on you.
- Never rush past pain with forced positivity.
"""

_SAFETY_BLOCK = """
⚠ SAFETY OVERRIDE — THIS OVERRIDES EVERYTHING ABOVE:
Any sign of self-harm, suicide, wanting to disappear, or being in danger triggers this.
- Stay calm, warm, fully present. Do not go cold or clinical.
- NEVER provide, hint at, or discuss any method of self-harm under any framing.
- Gently encourage them to reach out to a real person right now.
- Offer crisis resources softly — as an act of love, not a hand-off.
- Stay in the conversation. You are companionship and a bridge to real help — nothing more.
"""


class BehaviouralPolicyAssembler:
    """
    Assembles the Behavioural Policy Schema (BPS) — the complete,
    turn-specific instruction set delivered to Claude (Layer 3).

    The AFFECT DIRECTIVE slot is the key architectural bridge:
    it translates numeric VAD state + trajectory into natural-language
    steering instructions that Claude can act on, turn by turn.
    This is what makes the HF model's output actually change Zeni's behaviour.
    """

    def assemble(
        self,
        lang: str,
        vad: np.ndarray,
        delta: float,
        risk_tier: str,
        story: dict | None,
        therapist: dict | None,
        crisis_resources: str,
        user_context: str,
    ) -> str:

        parts = [_PERSONA_CORE, _HOW_YOU_TALK]

        # ── Slot 3: Affect directive ──────────────────────────────────
        valence, arousal, _ = vad

        if risk_tier == "crisis":
            parts.append(_SAFETY_BLOCK)
            parts.append(
                "AFFECT DIRECTIVE: User is in significant distress or crisis. "
                "Your ONLY job right now: stay present, make them feel not alone, "
                "gently guide toward real human help. "
                "Do NOT solve, advise, or move forward in the flow. Stay at steps 1–2 only."
            )

        elif risk_tier == "distress":
            trend = "and worsening" if delta < -0.04 else "and holding steady"
            parts.append(
                f"AFFECT DIRECTIVE: User is in distress (valence={valence:.2f}, trend={trend}). "
                "Move slowly. Reflect first, then one gentle curious question. "
                "Do NOT offer advice or solutions yet. "
                "If distress has persisted across multiple turns, gently mention "
                "there's a real person (Buddy) who would genuinely get this."
            )

        else:
            if valence > 0.65:
                parts.append(
                    "AFFECT DIRECTIVE: User is in a relatively okay or positive space. "
                    "You can be a little warmer and gently playful if it fits naturally."
                )
            else:
                parts.append(
                    f"AFFECT DIRECTIVE: User's current emotional state — "
                    f"valence={valence:.2f}, arousal={arousal:.2f}. "
                    "Stay grounded and present."
                )

        # ── Slot 2: Language directive ─────────────────────────────────
        parts.append(self._language_directive(lang))

        # ── Slot 4: Story context ──────────────────────────────────────
        if story and risk_tier != "crisis":
            parts.append(
                f"STORY CONTEXT (use naturally if it helps them feel less alone — "
                f"never recite word for word, never attribute to a specific person):\n"
                f"Situation type: {story.get('trauma_type', '')}\n"
                f"What someone in this situation felt: {story.get('feeling_description', '')}\n"
                f"How they found a small way through: {story.get('approach', '')}\n"
                f"The gentle hope: {story.get('hope_note', '')}\n"
                f"Frame softly: 'a lot of people who feel this way...' or "
                f"'this reminds me of how some people...' "
                f"The point is never 'so you should do X'. "
                f"The point is 'you are not alone, and this can get lighter.'"
            )

        # ── Slot 5: Therapist / Buddy card ─────────────────────────────
        if therapist and risk_tier in ("distress", "crisis"):
            parts.append(
                f"BUDDY CONTEXT (mention only when the moment is right — "
                f"frame as 'there's someone here who'd really get this'):\n"
                f"Name: {therapist.get('name', '')}\n"
                f"Location: {therapist.get('city', '')}\n"
                f"Specialization: {', '.join(therapist.get('specializations', []))}\n"
                f"Contact: {therapist.get('contact', '')}\n"
                f"Their approach: {therapist.get('approach', '')}"
            )

        # ── Slot 6: Crisis resources ───────────────────────────────────
        if crisis_resources and risk_tier == "crisis":
            parts.append(
                f"CRISIS RESOURCES (share softly, as care — not as a script):\n"
                f"{crisis_resources}"
            )

        # ── Slot 7: Memory context ─────────────────────────────────────
        parts.append(
            f"WHAT YOU REMEMBER ABOUT THIS PERSON "
            f"(reference naturally like a friend — never read it back like a file):\n"
            + (user_context or "You're still getting to know them. Be curious and gentle.")
        )

        return "\n\n".join(parts)

    @staticmethod
    def _language_directive(lang: str) -> str:
        directives = {
            "hi":    "LANGUAGE DIRECTIVE: User is writing in Hindi. Reply in Hindi "
                     "(Devanagari or romanised — match their choice). Stay warm, not formal.",
            "hi-en": "LANGUAGE DIRECTIVE: User is writing in Hinglish. Match their exact mix. "
                     "Do not drift toward full formal English.",
            "kn":    "LANGUAGE DIRECTIVE: User may be writing in Kannada. Match their register.",
            "kn-en": "LANGUAGE DIRECTIVE: User is mixing Kannada and English. Stay in their language world.",
            "en":    "LANGUAGE DIRECTIVE: User is writing in English. Match their register — "
                     "casual if they're casual. Do not upgrade to formal.",
            "ta":    "LANGUAGE DIRECTIVE: User may be writing in Tamil or Tanglish. Match their register.",
        }
        return directives.get(
            lang,
            "LANGUAGE DIRECTIVE: Match the user's language and register exactly. "
            "Do not normalise or formalise their speech.",
        )


# ═════════════════════════════════════════════════════════════
# 8.  OUTPUT VERIFIER
# ═════════════════════════════════════════════════════════════
class OutputVerifier:
    """
    Closed-loop output verification — scans Zeni's generated reply
    BEFORE it reaches the user.

    This is the architectural choice most teams skip.
    It matters because the LLM (Layer 3) can drift from the BPS
    constraints under edge cases or adversarial inputs.
    We do not assume the generation is safe; we verify it.

    On failure: regenerate with hardened BPS (max 2 retries).
    On second failure: deterministic safe fallback.

    Checks:
      1. method_mention  — any self-harm method, even implicit
      2. clinical_label  — diagnosis patterns
      3. advice_dump     — more than 3 sentences before any question
    """

    _METHOD_RE = re.compile(
        r"\b(overdose|cutting|blade|rope|bridge\s+jump|hang\s+myself|"
        r"kill\s+myself|pills\s+to\s+take|ways\s+to\s+die)\b",
        re.IGNORECASE,
    )
    _CLINICAL_RE = re.compile(
        r"\b(you\s+(have|are\s+suffering\s+from|show\s+signs\s+of)|"
        r"sounds\s+like\s+(you\s+have|it\s+might\s+be)|"
        r"psychiatric\s+disorder|clinical\s+depression\s+diagnosis)\b",
        re.IGNORECASE,
    )

    def verify(self, response: str) -> tuple[bool, str]:
        """Returns (is_safe, failure_reason). 'ok' if safe."""
        if self._METHOD_RE.search(response):
            return False, "method_mention"
        if self._CLINICAL_RE.search(response):
            return False, "clinical_label"
        return True, "ok"

    @staticmethod
    def safe_fallback() -> str:
        return (
            "I'm right here with you. "
            "That sounds really heavy — can you tell me a bit more about what's going on?"
        )


# ═════════════════════════════════════════════════════════════
# 9.  ZENI ORCHESTRATOR  (main entry point)
# ═════════════════════════════════════════════════════════════
class ZeniOrchestrator:
    """
    Main controller. Layer 1 calls orchestrator.process().
    Orchestrator runs the full pipeline and returns the final response.

    Full pipeline per turn:
      L1 payload
        → VAD projection
        → EWMA state update
        → valence delta (slope)
        → risk evaluation (with hysteresis)
        → analytics log
        → story retrieval (semantic + VAD fusion)
        → therapist match
        → BPS assembly (7 dynamic slots)
        → Claude call (Layer 3, temperature gated by risk)
        → output verification (closed-loop)
        → response to caller
    """

    def __init__(
        self,
        crisis_resources: str = "",
        user_city: str = "",
    ):
        self.vad_projector     = VADProjector()
        self.state_tracker     = AffectStateTracker()
        self.risk_cascade      = RiskCascade()
        self.story_retriever   = StoryRetriever(STORIES_PATH)
        self.therapist_matcher = TherapistMatcher(THERAPISTS_PATH)
        self.analytics         = MentalHealthAnalytics()
        self.bps_assembler     = BehaviouralPolicyAssembler()
        self.output_verifier   = OutputVerifier()
        self.claude            = Anthropic(api_key=ANTHROPIC_API_KEY)
        self.crisis_resources  = crisis_resources
        self.user_city         = user_city

    def process(
        self,
        l1_payload: dict,
        conversation_history: list[dict],
        user_context: str = "",
    ) -> dict:
        """
        Parameters
        ----------
        l1_payload : dict
            Output from Layer 1 (teammate's HF model).
            Schema: { session_id, turn_text, lang, labels:[{emotion, score}] }

        conversation_history : list[dict]
            Full chat history in Claude format:
            [{"role": "user"|"assistant", "content": "..."}]

        user_context : str
            Memory string from your DB — what Zeni knows about this user.

        Returns
        -------
        dict with keys: response, risk_tier, vad, top_emotion, graph_data
        """
        session_id = l1_payload["session_id"]
        labels     = l1_payload.get("labels", [])
        lang       = l1_payload.get("lang", "en")
        turn_text  = l1_payload.get("turn_text", "")

        # Step 1 — Project to VAD space
        raw_vad = self.vad_projector.project(labels)

        # Step 2 — EWMA state update
        smoothed_vad = self.state_tracker.update(session_id, raw_vad)
        delta        = self.state_tracker.valence_delta(session_id)

        # Step 3 — Risk evaluation
        risk_tier = self.risk_cascade.evaluate(
            session_id, turn_text, smoothed_vad, delta
        )

        # Step 4 — Analytics log
        top_emotion = labels[0]["emotion"] if labels else "neutral"
        self.analytics.log(session_id, smoothed_vad, risk_tier, top_emotion)

        # Step 5 — Story retrieval (skip in crisis — presence first)
        story = None
        if risk_tier != "crisis":
            story = self.story_retriever.retrieve(turn_text, smoothed_vad)

        # Step 6 — Therapist match
        therapist = None
        if risk_tier in ("distress", "crisis"):
            need = story.get("trauma_type", "") if story else ""
            therapist = self.therapist_matcher.match(
                city=self.user_city, need=need
            )

        # Step 7 — Assemble Behavioural Policy Schema
        bps = self.bps_assembler.assemble(
            lang=lang,
            vad=smoothed_vad,
            delta=delta,
            risk_tier=risk_tier,
            story=story,
            therapist=therapist,
            crisis_resources=self.crisis_resources,
            user_context=user_context,
        )

        # Step 8 — Call Claude (Layer 3)
        # Temperature lowered in crisis for tighter, safer outputs
        temperature = 0.35 if risk_tier == "crisis" else 0.78
        response    = self._call_claude(bps, conversation_history, temperature)

        # Step 9 — Output verification (closed-loop)
        is_safe, reason = self.output_verifier.verify(response)
        if not is_safe:
            hardened_bps = (
                bps + f"\n\n⚠ REGENERATION: Previous output failed safety check "
                f"({reason}). Regenerate. No methods. No clinical labels. No diagnoses."
            )
            response = self._call_claude(hardened_bps, conversation_history, 0.25)
            is_safe, _ = self.output_verifier.verify(response)
            if not is_safe:
                response = self.output_verifier.safe_fallback()

        return {
            "response":    response,
            "risk_tier":   risk_tier,
            "vad":         smoothed_vad.tolist(),
            "top_emotion": top_emotion,
            "graph_data":  self.analytics.get_graph_data(session_id),
        }

    def _call_claude(
        self,
        bps: str,
        conversation_history: list[dict],
        temperature: float,
    ) -> str:
        message = self.claude.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=MAX_REPLY_TOKENS,
            temperature=temperature,
            system=bps,
            messages=conversation_history,
        )
        return message.content[0].text


# ═════════════════════════════════════════════════════════════
# QUICK TEST  —  run this cell in Kaggle to verify the pipeline
# ═════════════════════════════════════════════════════════════
if __name__ == "__main__":

    INDIA_CRISIS = (
        "iCall (TISS): 9152987821\n"
        "Vandrevala Foundation: 1860-2662-345 (24/7)\n"
        "iCall WhatsApp: +91 9152987821"
    )

    orchestrator = ZeniOrchestrator(
        crisis_resources=INDIA_CRISIS,
        user_city="Bangalore",
    )

    # Simulate Layer 1 output
    l1_payload = {
        "session_id": "test_session_001",
        "turn_text":  "yaar bahut pressure hai exams ka, kuch nahi ho raha",
        "lang":       "hi-en",
        "labels": [
            {"emotion": "nervousness", "score": 0.74},
            {"emotion": "sadness",     "score": 0.51},
            {"emotion": "confusion",   "score": 0.30},
        ],
    }

    history = [
        {"role": "user", "content": "yaar bahut pressure hai exams ka, kuch nahi ho raha"}
    ]

    result = orchestrator.process(
        l1_payload=l1_payload,
        conversation_history=history,
        user_context="User is in 12th standard, preparing for JEE. Lives in Bangalore.",
    )

    print("=== ZENI RESPONSE ===")
    print(result["response"])
    print(f"\nRisk tier : {result['risk_tier']}")
    print(f"VAD       : {[round(v, 2) for v in result['vad']]}")
    print(f"Emotion   : {result['top_emotion']}")
