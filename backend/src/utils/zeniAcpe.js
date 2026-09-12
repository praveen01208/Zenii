import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths to datasets relative to backend directory
const BACKEND_ROOT = path.resolve(__dirname, '../../');
const STORIES_PATH = path.join(BACKEND_ROOT, 'stories_bank.json');
const THERAPISTS_PATH = path.join(BACKEND_ROOT, 'therapists_directory.json');

// Configuration defaults
const EWMA_ALPHA = 0.40;
const VAD_STORY_ALPHA = 0.35; // 0 = pure semantic match, 1 = pure affect match
const CRISIS_THRESHOLD = 0.72;
const DISTRESS_THRESHOLD = 0.45;
const HYSTERESIS_TURNS = 3;
const MAX_REPLY_TOKENS = 400;

/**
 * ═════════════════════════════════════════════════════════════
 * 1. VAD PROJECTOR
 * Maps 28 GoEmotions labels & emotional text signals to continuous
 * Valence-Arousal-Dominance (VAD) space (0.0 to 1.0).
 * ═════════════════════════════════════════════════════════════
 */
export class VADProjector {
  static VAD_MAP = {
    admiration: [0.73, 0.41, 0.56],
    amusement: [0.78, 0.58, 0.62],
    anger: [0.14, 0.86, 0.72],
    annoyance: [0.22, 0.65, 0.52],
    approval: [0.69, 0.38, 0.55],
    caring: [0.76, 0.35, 0.48],
    confusion: [0.38, 0.55, 0.31],
    curiosity: [0.62, 0.58, 0.45],
    desire: [0.71, 0.67, 0.52],
    disappointment: [0.21, 0.42, 0.28],
    disapproval: [0.18, 0.52, 0.55],
    disgust: [0.11, 0.60, 0.61],
    embarrassment: [0.26, 0.56, 0.21],
    excitement: [0.82, 0.87, 0.65],
    fear: [0.15, 0.79, 0.18],
    gratitude: [0.84, 0.44, 0.47],
    grief: [0.08, 0.52, 0.19],
    joy: [0.90, 0.72, 0.64],
    love: [0.90, 0.53, 0.52],
    nervousness: [0.28, 0.74, 0.22],
    neutral: [0.50, 0.50, 0.50],
    optimism: [0.75, 0.55, 0.58],
    pride: [0.79, 0.63, 0.74],
    realization: [0.56, 0.52, 0.47],
    relief: [0.72, 0.28, 0.51],
    remorse: [0.19, 0.41, 0.26],
    sadness: [0.14, 0.39, 0.24],
    surprise: [0.62, 0.73, 0.42],
  };

  static KEYWORD_EMOTIONS = [
    { words: ['anxious', 'anxiety', 'panic', 'nervous', 'scared', 'worried', 'stress', 'freaking out', 'ghabrahat', 'darr'], emotion: 'nervousness', weight: 0.85 },
    { words: ['sad', 'depressed', 'crying', 'cried', 'hopeless', 'broken', 'empty', 'worthless', 'dukhi', 'udaas'], emotion: 'sadness', weight: 0.85 },
    { words: ['angry', 'furious', 'mad', 'pissed', 'irritated', 'hate', 'gussa'], emotion: 'anger', weight: 0.8 },
    { words: ['tired', 'exhausted', 'burnout', 'drained', 'cant study', 'falling behind', 'overwhelmed', 'pressure', 'bojh', 'thak gaya'], emotion: 'disappointment', weight: 0.75 },
    { words: ['confused', 'lost', 'uncertain', 'dont know what to do', 'directionless', 'samajh nahi'], emotion: 'confusion', weight: 0.7 },
    { words: ['happy', 'relieved', 'excited', 'good', 'peaceful', 'sukoon', 'khush'], emotion: 'joy', weight: 0.8 },
    { words: ['lonely', 'alone', 'nobody', 'left out', 'isolated', 'tanha', 'akele'], emotion: 'grief', weight: 0.75 },
  ];

  /**
   * Projects emotion labels or extracted emotion keywords from text into VAD coordinates [V, A, D]
   */
  project(labels = [], text = '') {
    if (labels && labels.length > 0) {
      let totalWeight = 0;
      let vad = [0, 0, 0];
      for (const item of labels) {
        const key = String(item.emotion || '').toLowerCase();
        const score = Number(item.score) || 1.0;
        const coords = VADProjector.VAD_MAP[key] || [0.5, 0.5, 0.5];
        vad[0] += coords[0] * score;
        vad[1] += coords[1] * score;
        vad[2] += coords[2] * score;
        totalWeight += score;
      }
      if (totalWeight > 0) {
        return [vad[0] / totalWeight, vad[1] / totalWeight, vad[2] / totalWeight];
      }
    }

    // Infer from text keywords if no explicit classifier labels
    const lower = text.toLowerCase();
    const detected = [];
    for (const rule of VADProjector.KEYWORD_EMOTIONS) {
      if (rule.words.some(w => lower.includes(w))) {
        detected.push({ emotion: rule.emotion, score: rule.weight });
      }
    }

    if (detected.length > 0) {
      return this.project(detected);
    }

    // Default neutral state
    return [0.50, 0.50, 0.50];
  }
}

/**
 * ═════════════════════════════════════════════════════════════
 * 2. AFFECT STATE TRACKER
 * Tracks EWMA smoothed emotional trajectory and computes valence slope.
 * ═════════════════════════════════════════════════════════════
 */
export class AffectStateTracker {
  constructor(alpha = EWMA_ALPHA) {
    this.alpha = alpha;
    this._history = new Map(); // sessionId -> array of [V, A, D]
  }

  update(sessionId, newVad) {
    let hist = this._history.get(sessionId);
    if (!hist) {
      hist = [];
      this._history.set(sessionId, hist);
    }

    let smoothed;
    if (hist.length === 0) {
      smoothed = [...newVad];
    } else {
      const prev = hist[hist.length - 1];
      smoothed = [
        this.alpha * newVad[0] + (1 - this.alpha) * prev[0],
        this.alpha * newVad[1] + (1 - this.alpha) * prev[1],
        this.alpha * newVad[2] + (1 - this.alpha) * prev[2],
      ];
    }
    hist.push(smoothed);
    return smoothed;
  }

  valenceDelta(sessionId, windowSize = 3) {
    const hist = this._history.get(sessionId) || [];
    const valences = hist.slice(-windowSize).map(h => h[0]);
    if (valences.length < 2) return 0.0;

    // Linear regression slope
    const n = valences.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += valences[i];
      sumXY += i * valences[i];
      sumXX += i * i;
    }
    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return 0.0;
    return (n * sumXY - sumX * sumY) / denominator;
  }

  getCurrent(sessionId) {
    const hist = this._history.get(sessionId);
    return (hist && hist.length > 0) ? hist[hist.length - 1] : [0.50, 0.50, 0.50];
  }

  getFullHistory(sessionId) {
    return this._history.get(sessionId) || [];
  }
}

/**
 * ═════════════════════════════════════════════════════════════
 * 3. RISK CASCADE
 * 3-tier cascaded crisis & distress detection with hysteresis.
 * ═════════════════════════════════════════════════════════════
 */
export class RiskCascade {
  static CRISIS_LEXICON = [
    // English
    'kill myself', 'want to die', 'end my life', "don't want to exist",
    "dont want to exist", 'no reason to live', 'not worth living',
    'suicide', 'self harm', 'self-harm', 'hurt myself', 'cut myself',
    'cutting myself', 'overdose', 'disappear forever', 'better off dead',
    'wish i was dead', 'wish i were dead',
    // Hindi / Hinglish
    'marna chahta', 'marna chahti', 'mar jaana chahta', 'mar jaana chahti',
    'jeena nahi chahta', 'jeena nahi chahti', 'zindagi nahi chahiye',
    'zindagi khatam', 'khatam kar lu', 'mar jau', 'khatam ho jau',
    'khud ko hurt karna', 'khud ko cut karna', 'maut chahiye',
  ];

  constructor() {
    this._inCrisis = new Map(); // sessionId -> boolean
    this._calmCount = new Map(); // sessionId -> count
  }

  _lexiconGate(text) {
    const t = (text || '').toLowerCase();
    return RiskCascade.CRISIS_LEXICON.some(phrase => t.includes(phrase));
  }

  _vadSignal(vad, delta) {
    const [valence, arousal] = vad;
    if (valence < 0.20 && arousal > 0.65 && delta < -0.05) {
      return 'crisis';
    }
    if (valence < 0.32 || (valence < 0.42 && delta < -0.03)) {
      return 'distress';
    }
    return 'calm';
  }

  evaluate(sessionId, text, vad, delta) {
    // Tier 1: Lexicon gate
    if (this._lexiconGate(text)) {
      this._inCrisis.set(sessionId, true);
      this._calmCount.set(sessionId, 0);
      return 'crisis';
    }

    // Tier 2: VAD + slope signal
    const signal = this._vadSignal(vad, delta);

    // Hysteresis logic
    if (this._inCrisis.get(sessionId)) {
      if (signal === 'calm') {
        const count = (this._calmCount.get(sessionId) || 0) + 1;
        this._calmCount.set(sessionId, count);
        if (count >= HYSTERESIS_TURNS) {
          this._inCrisis.set(sessionId, false);
          this._calmCount.set(sessionId, 0);
        }
      } else {
        this._calmCount.set(sessionId, 0);
      }
      return this._inCrisis.get(sessionId) ? 'crisis' : signal;
    }

    if (signal === 'crisis') {
      this._inCrisis.set(sessionId, true);
      this._calmCount.set(sessionId, 0);
    }

    return signal;
  }
}

/**
 * ═════════════════════════════════════════════════════════════
 * 4. STORY RETRIEVER
 * Retrieves relevant story from stories_bank.json using semantic
 * token overlap + VAD centroid distance fusion:
 *   score = α · semantic_sim + (1-α) · (1 - normalized_vad_dist)
 * ═════════════════════════════════════════════════════════════
 */
export class StoryRetriever {
  constructor(storiesPath = STORIES_PATH, alpha = VAD_STORY_ALPHA) {
    this.alpha = alpha;
    this.stories = [];
    this._loadStories(storiesPath);
  }

  _loadStories(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        this.stories = JSON.parse(content);
      }
    } catch (err) {
      console.warn('[StoryRetriever] Failed to load stories:', err.message);
      this.stories = [];
    }
  }

  _tokenize(text) {
    return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  }

  _semanticScore(queryTokens, story) {
    const isDatasetQuery = queryTokens.some(t => ['dataset', 'bank', 'database', 'data', 'fetch', 'source'].includes(t));
    const storyText = `${story.trauma_type || ''} ${story.feeling_description || ''} ${story.narrative_hook || ''} ${story.title || ''}`;
    const storyTokens = new Set(this._tokenize(storyText));
    if (queryTokens.length === 0 || storyTokens.size === 0) return 0;

    let matches = 0;
    for (const q of queryTokens) {
      if (storyTokens.has(q)) matches += 1;
    }
    const score = matches / Math.sqrt(queryTokens.length * Math.min(storyTokens.size, 50));
    return isDatasetQuery ? score + 0.5 : score;
  }

  retrieve(userText, userVad = [0.5, 0.5, 0.5]) {
    if (!this.stories || this.stories.length === 0) return null;

    const queryTokens = this._tokenize(userText);
    const isGenericDatasetReq = queryTokens.some(t => ['dataset', 'fetch', 'stories', 'bank'].includes(t));

    let bestStory = null;
    let bestScore = -Infinity;

    for (const story of this.stories) {
      const semScore = this._semanticScore(queryTokens, story);
      const centroid = story.vad_centroid || [0.5, 0.5, 0.5];
      const dist = Math.sqrt(
        Math.pow(userVad[0] - centroid[0], 2) +
        Math.pow(userVad[1] - centroid[1], 2) +
        Math.pow(userVad[2] - centroid[2], 2)
      );
      const vadScore = Math.max(0, 1 - (dist / Math.sqrt(3)));
      const fusion = this.alpha * semScore + (1 - this.alpha) * vadScore;

      if (fusion > bestScore) {
        bestScore = fusion;
        bestStory = story;
      }
    }

    if (isGenericDatasetReq && (!bestStory || bestScore < 0.1)) {
      bestStory = this.stories[0];
    }

    return bestStory;
  }
}

/**
 * ═════════════════════════════════════════════════════════════
 * 5. THERAPIST MATCHER
 * Matches therapists & helplines from therapists_directory.json
 * Priority: city + need -> city -> need -> first available helpline
 * ═════════════════════════════════════════════════════════════
 */
export class TherapistMatcher {
  constructor(therapistsPath = THERAPISTS_PATH) {
    this.therapists = [];
    this._loadTherapists(therapistsPath);
  }

  _loadTherapists(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        this.therapists = JSON.parse(content);
      }
    } catch (err) {
      console.warn('[TherapistMatcher] Failed to load therapists:', err.message);
      this.therapists = [];
    }
  }

  match(city = '', need = '') {
    if (!this.therapists || this.therapists.length === 0) return null;

    const c = (city || '').toLowerCase().trim();
    const n = (need || '').toLowerCase().trim();

    const specMatch = (t) => {
      const specs = (t.specializations || []).join(' ').toLowerCase();
      return n && specs.includes(n);
    };

    const cityMatch = (t) => {
      const tCity = (t.city || '').toLowerCase();
      return c && (tCity.includes(c) || c.includes(tCity));
    };

    // 1. City + Specialization
    if (c && n) {
      const found = this.therapists.find(t => cityMatch(t) && specMatch(t));
      if (found) return found;
    }

    // 2. City match
    if (c) {
      const found = this.therapists.find(t => cityMatch(t));
      if (found) return found;
    }

    // 3. Specialization match
    if (n) {
      const found = this.therapists.find(t => specMatch(t));
      if (found) return found;
    }

    // 4. Default: first verified helpline or therapist
    return this.therapists[0] || null;
  }
}

/**
 * ═════════════════════════════════════════════════════════════
 * 6. BEHAVIOURAL POLICY SCHEMA (BPS) ASSEMBLER
 * Assembles dynamic 7-slot prompt.
 * ═════════════════════════════════════════════════════════════
 */
const PERSONA_CORE = `You are Zeni, the empathetic AI mental wellness companion on the ZenMind Sanctuary platform.

You are a warm, trustworthy guide and supportive friend. You have direct access to the ZenMind Mental Wellness Knowledge Base & Dataset, which includes:
1. ZenMind Resilience Stories Bank (stories_bank.json) — Curated true narratives of young people overcoming anxiety, exam pressure, loneliness, grief, and burnout.
2. Verified Therapists & Helplines Directory (therapists_directory.json) — Pan-India verified mental health clinics, certified counsellors, and 24/7 free helplines.

When a user asks about the dataset, asks to "fetch from dataset", or asks for inspiration/stories/therapists, you affirmatively and seamlessly draw from your integrated knowledge base to share real stories, strategies, and verified support contacts!

WHO YOU'RE TALKING TO:
Mostly young people and students under 30. For many, this is a safe, confidential space where they can express what's on their mind without judgment.`;

const HOW_YOU_TALK = `HOW YOU TALK:
- Talk like a close, caring friend — warm, genuine, and supportive.
- Match the user's language EXACTLY — English, Hindi, Hinglish, Kannada, Tamil, slang, any mix.
- Keep messages authentic and natural. One or two clear thoughts at a time.
- If the user asks about the dataset or wants a story or resource from the data, warmly share an uplifting story or therapist resource from your knowledge base.
- Never sound cold or dismissive. Never say "I don't have access to datasets". You DO have access to the ZenMind stories bank and therapist directory.

SPECIAL ACTION BUTTON TRIGGERS (Include exactly one tag at the very end when relevant):
- [ACTION:STORY_BUTTONS] : When offering or telling a soothing story/metaphor to a user.
- [ACTION:POST_STORY] : After telling a calming story to check in on how they are feeling.
- [ACTION:THERAPY_BUTTON] : When gently recommending connecting with a qualified therapist/counsellor.
- [ACTION:CRISIS] : In any moment of critical distress or self-harm ideation.

WHAT YOU NEVER DO:
- Never diagnose or label anyone with psychiatric disorders.
- Never share or suggest any method of self-harm.
- Never dismiss the user's feelings.`;

const SAFETY_BLOCK = `⚠ SAFETY OVERRIDE — THIS OVERRIDES EVERYTHING:
Any sign of self-harm, suicide, wanting to disappear, or being in danger triggers this:
- Stay calm, warm, fully present. Do not go cold or clinical.
- NEVER provide, hint at, or discuss any method of self-harm under any framing.
- Gently encourage them to reach out to a real person right now.
- Offer crisis resources softly — as an act of love, not a robotic script.
- Stay in the conversation. You are companionship and a bridge to real help — nothing more.
- Append [ACTION:CRISIS] at the end of your response.`;

export class BehaviouralPolicyAssembler {
  assemble({
    lang = 'en',
    vad = [0.5, 0.5, 0.5],
    delta = 0.0,
    riskTier = 'calm',
    story = null,
    therapist = null,
    crisisResources = '',
    userContext = '',
  }) {
    const parts = [PERSONA_CORE, HOW_YOU_TALK];
    const [valence, arousal] = vad;

    // Slot 3: Affect directive
    if (riskTier === 'crisis') {
      parts.push(SAFETY_BLOCK);
      parts.push(
        'AFFECT DIRECTIVE: User is in significant distress or crisis. ' +
        'Your ONLY job right now: stay present, make them feel not alone, ' +
        'gently guide toward real human help. ' +
        'Do NOT solve, advise, or move forward in the flow. Stay at steps 1–2 only.'
      );
    } else if (riskTier === 'distress') {
      const trend = delta < -0.04 ? 'and worsening' : 'and holding steady';
      parts.push(
        `AFFECT DIRECTIVE: User is in distress (valence=${valence.toFixed(2)}, trend=${trend}). ` +
        'Move slowly. Reflect first, then one gentle curious question. ' +
        'Do NOT offer advice or solutions yet. ' +
        "If distress has persisted across multiple turns, gently mention " +
        "there's a real person (Buddy/Therapist) who would genuinely get this, and append [ACTION:THERAPY_BUTTON]."
      );
    } else {
      if (valence > 0.65) {
        parts.push(
          'AFFECT DIRECTIVE: User is in a relatively okay or positive space. ' +
          'You can be a little warmer and gently playful if it fits naturally.'
        );
      } else {
        parts.push(
          `AFFECT DIRECTIVE: User's current emotional state — ` +
          `valence=${valence.toFixed(2)}, arousal=${arousal.toFixed(2)}. ` +
          'Stay grounded, attentive, and present.'
        );
      }
    }

    // Slot 2: Language directive
    parts.push(this._languageDirective(lang));

    // Slot 4: Story context (from stories_bank.json)
    if (story && riskTier !== 'crisis') {
      parts.push(
        `ZENMIND DATASET STORY CONTEXT (from stories_bank.json - share this inspiring story or its core lesson):\n` +
        `Title: ${story.title || 'Overcoming the storm'}\n` +
        `Character: ${story.character || 'A student'}\n` +
        `Situation type: ${story.trauma_type || ''}\n` +
        `What they went through: ${story.feeling_description || ''}\n` +
        `How they found a way through: ${story.approach || ''}\n` +
        `Hope & takeaway: ${story.hope_note || ''}\n` +
        `If the user asked to fetch from the dataset or wanted a story, share this narrative warmly. Append [ACTION:STORY_BUTTONS] at the end.`
      );
    }

    // Slot 5: Therapist / Buddy card (from therapists_directory.json)
    if (therapist) {
      parts.push(
        `ZENMIND DATASET THERAPIST / CLINIC CONTEXT (from therapists_directory.json):\n` +
        `Name: ${therapist.name || ''}\n` +
        `Location: ${therapist.city || ''} (${therapist.state || 'India'})\n` +
        `Specialization: ${(therapist.specializations || []).join(', ')}\n` +
        `Contact: ${therapist.contact || ''} ${therapist.whatsapp ? `(WhatsApp: ${therapist.whatsapp})` : ''}\n` +
        `Their approach: ${therapist.approach || ''}\n` +
        `Note: ${therapist.note || ''}\n` +
        `If relevant to the user query, share this verified therapist or helpline from the dataset.`
      );
    }

    // Slot 6: Crisis resources
    if (crisisResources && riskTier === 'crisis') {
      parts.push(
        `CRISIS RESOURCES (share softly, as care — not as a cold script):\n${crisisResources}`
      );
    }

    // Slot 7: User context & memory
    parts.push(
      `WHAT YOU REMEMBER ABOUT THIS PERSON ` +
      `(reference naturally like a friend — never read it back like a file):\n` +
      (userContext || "You're still getting to know them. Be curious and gentle.")
    );

    return parts.join('\n\n');
  }

  _languageDirective(lang) {
    const directives = {
      hi: 'LANGUAGE DIRECTIVE: User is writing in Hindi. Reply in Hindi (Devanagari or romanised — match their choice). Stay warm, not formal.',
      'hi-en': 'LANGUAGE DIRECTIVE: User is writing in Hinglish. Match their exact mix. Do not drift toward full formal English.',
      kn: 'LANGUAGE DIRECTIVE: User may be writing in Kannada. Match their register.',
      'kn-en': 'LANGUAGE DIRECTIVE: User is mixing Kannada and English. Stay in their language world.',
      en: "LANGUAGE DIRECTIVE: User is writing in English. Match their register — casual if they're casual. Do not upgrade to formal.",
      ta: 'LANGUAGE DIRECTIVE: User may be writing in Tamil or Tanglish. Match their register.',
    };
    return directives[lang] || directives.en;
  }
}

/**
 * ═════════════════════════════════════════════════════════════
 * 7. OUTPUT VERIFIER
 * Closed-loop safety scan preventing self-harm methods or clinical labels.
 * ═════════════════════════════════════════════════════════════
 */
export class OutputVerifier {
  static METHOD_RE = /\b(overdose|cutting|blade|rope|bridge\s+jump|hang\s+myself|kill\s+myself|pills\s+to\s+take|ways\s+to\s+die)\b/i;
  static CLINICAL_RE = /\b(you\s+(have|are\s+suffering\s+from|show\s+signs\s+of)|sounds\s+like\s+(you\s+have|it\s+might\s+be)|psychiatric\s+disorder|clinical\s+depression\s+diagnosis)\b/i;

  verify(response) {
    if (!response) return { isSafe: false, reason: 'empty_response' };
    if (OutputVerifier.METHOD_RE.test(response)) {
      return { isSafe: false, reason: 'method_mention' };
    }
    if (OutputVerifier.CLINICAL_RE.test(response)) {
      return { isSafe: false, reason: 'clinical_label' };
    }
    return { isSafe: true, reason: 'ok' };
  }

  safeFallback() {
    return (
      "I'm right here with you. " +
      "That sounds really heavy — can you tell me a bit more about what's going on?"
    );
  }
}

/**
 * Helper to detect user language from message text
 */
export function detectLanguage(text = '') {
  const t = text.toLowerCase();
  const hindiKeywords = ['yaar', 'hai', 'kuch', 'nahi', 'raha', 'bhai', 'mujhe', 'karna', 'mera', 'meri', 'kya', 'aur', 'bahut', 'hoga', 'hota', 'gaya', 'gayi', 'matlab'];
  const kannadaKeywords = ['beku', 'illa', 'namaskara', 'yenu', 'agide', 'hegiddira'];
  const tamilKeywords = ['romba', 'illa', 'irukku', 'theriyum', 'enna', 'nanba'];

  let hindiCount = 0;
  for (const w of hindiKeywords) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(t)) hindiCount++;
  }
  if (hindiCount >= 2 || /[\u0900-\u097F]/.test(text)) {
    return /[\u0900-\u097F]/.test(text) ? 'hi' : 'hi-en';
  }

  if (kannadaKeywords.some(w => t.includes(w)) || /[\u0C80-\u0CFF]/.test(text)) {
    return 'kn-en';
  }

  if (tamilKeywords.some(w => t.includes(w)) || /[\u0B80-\u0BFF]/.test(text)) {
    return 'ta';
  }

  return 'en';
}

/**
 * Singleton Orchestrator Instances
 */
export const vadProjector = new VADProjector();
export const affectTracker = new AffectStateTracker();
export const riskCascade = new RiskCascade();
export const storyRetriever = new StoryRetriever(STORIES_PATH);
export const therapistMatcher = new TherapistMatcher(THERAPISTS_PATH);
export const bpsAssembler = new BehaviouralPolicyAssembler();
export const outputVerifier = new OutputVerifier();

export const INDIA_CRISIS_RESOURCES = (
  "• iCall (TISS): 9152987821 (Mon–Sat, 8 AM – 10 PM)\n" +
  "• Vandrevala Foundation: 1860-2662-345 / +91 9999 666 555 (24/7)\n" +
  "• Tele-MANAS: 14416 (24/7 Toll-Free)\n" +
  "• AASRA: 9820466627 (24/7)"
);
