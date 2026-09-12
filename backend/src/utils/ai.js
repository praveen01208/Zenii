/**
 * Central AI Utility for ZenMind Backend
 * Supports Anthropic Claude (Primary) with fallback to OpenAI/Groq compatible providers.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Format conversation history into valid Anthropic messages format:
 * - Must start with 'user' role
 * - Roles must alternate between 'user' and 'assistant'
 * - Messages must have non-empty text content
 */
function sanitizeAnthropicMessages(messages) {
  const sanitized = [];

  for (const msg of messages) {
    const role = msg.role === 'assistant' ? 'assistant' : 'user';
    const content = typeof msg.content === 'string' ? msg.content.trim() : '';
    if (!content) continue;

    if (sanitized.length > 0 && sanitized[sanitized.length - 1].role === role) {
      // Merge consecutive same-role messages
      sanitized[sanitized.length - 1].content += `\n\n${content}`;
    } else {
      sanitized.push({ role, content });
    }
  }

  // Ensure conversation starts with a user message
  if (sanitized.length > 0 && sanitized[0].role !== 'user') {
    sanitized.unshift({ role: 'user', content: 'Hello' });
  }

  return sanitized;
}

/**
 * Call Anthropic Claude Messages API
 */
export async function callClaude({
  messages,
  system,
  maxTokens = 800,
  temperature = 0.7,
  model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
  apiKey = process.env.ANTHROPIC_API_KEY,
} = {}) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('Anthropic API key is not configured.');
  }

  const formattedMessages = sanitizeAnthropicMessages(messages);
  if (formattedMessages.length === 0) {
    throw new Error('No valid messages provided for Claude.');
  }

  const payload = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: formattedMessages,
  };

  if (system) {
    payload.system = system;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error(`[Claude API] Error ${response.status}:`, errBody);
    throw new Error(`Claude API returned status ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const text = data?.content?.map(c => (c.type === 'text' ? c.text : '')).join('') || '';
  return text.trim();
}

/**
 * Call OpenAI/Groq compatible chat completions API
 */
export async function callOpenAICompatible({
  messages,
  system,
  maxTokens = 400,
  temperature = 0.5,
  model = process.env.AI_MODEL || 'llama-3.1-8b-instant',
  apiUrl = process.env.AI_API_URL || 'https://api.groq.com/openai/v1',
  apiKey = process.env.AI_API_KEY,
} = {}) {
  const key = apiKey || process.env.AI_API_KEY;
  if (!key) return null;

  const formattedMessages = [];
  if (system) {
    formattedMessages.push({ role: 'system', content: system });
  }
  for (const m of messages) {
    if (m.content) {
      formattedMessages.push({ role: m.role, content: m.content });
    }
  }

  const res = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[OpenAI/Groq API] Error ${res.status}:`, errText);
    return null;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

/**
 * Unified single-prompt or multi-prompt helper.
 * Uses Claude when ANTHROPIC_API_KEY is configured; otherwise falls back to Groq/OpenAI.
 */
export async function callAI(promptOrMessages, {
  system = '',
  maxTokens = 600,
  temperature = 0.6,
  model,
} = {}) {
  const messages = typeof promptOrMessages === 'string'
    ? [{ role: 'user', content: promptOrMessages }]
    : promptOrMessages;

  // 1. Try Claude first if API key is present
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claudeModel = model || process.env.ANTHROPIC_FAST_MODEL || 'claude-haiku-4-5-20251001';
      return await callClaude({
        messages,
        system,
        maxTokens,
        temperature,
        model: claudeModel,
      });
    } catch (err) {
      console.warn('[AI Utility] Claude request failed, attempting fallback...', err.message);
    }
  }

  // 2. Fallback to OpenAI / Groq
  if (process.env.AI_API_KEY) {
    return await callOpenAICompatible({
      messages,
      system,
      maxTokens,
      temperature,
      model,
    });
  }

  throw new Error('No AI provider is configured. Please check ANTHROPIC_API_KEY or AI_API_KEY.');
}

import {
  vadProjector,
  affectTracker,
  riskCascade,
  storyRetriever,
  therapistMatcher,
  bpsAssembler,
  outputVerifier,
  detectLanguage,
  INDIA_CRISIS_RESOURCES,
} from './zeniAcpe.js';

/**
 * Standard Zeni Persona & Prompt for ZenChat (legacy fallback reference)
 */
export const ZENI_SYSTEM_PROMPT = `You are Zeni, a warm, empathetic, and thoughtful AI mental wellness companion for teenagers and young adults on the ZenMind platform.`;

/**
 * Generates a full Zeni response using ACPE Pipeline & Datasets (stories_bank.json & therapists_directory.json)
 */
export async function generateZeniChatReply({
  sessionId = 'default_session',
  conversationHistory = [],
  latestUserMessage = '',
  labels = [],
  userCity = '',
  userContext = '',
  model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
}) {
  const fullMessages = [
    ...conversationHistory,
    { role: 'user', content: latestUserMessage },
  ];

  // 1. Project to VAD continuous space
  const rawVad = vadProjector.project(labels, latestUserMessage);

  // 2. EWMA affect tracking & valence delta
  const smoothedVad = affectTracker.update(sessionId, rawVad);
  const delta = affectTracker.valenceDelta(sessionId);

  // 3. 3-Tier Risk Cascade evaluation
  const riskTier = riskCascade.evaluate(sessionId, latestUserMessage, smoothedVad, delta);

  // 4. Story retrieval from stories_bank.json (skip in acute crisis)
  let story = null;
  if (riskTier !== 'crisis') {
    story = storyRetriever.retrieve(latestUserMessage, smoothedVad);
  }

  // 5. Therapist matching from therapists_directory.json
  let therapist = null;
  if (riskTier === 'distress' || riskTier === 'crisis') {
    const need = story?.trauma_type || '';
    therapist = therapistMatcher.match(userCity, need);
  }

  // 6. Language detection & BPS Assembly
  const lang = detectLanguage(latestUserMessage);
  const bps = bpsAssembler.assemble({
    lang,
    vad: smoothedVad,
    delta,
    riskTier,
    story,
    therapist,
    crisisResources: INDIA_CRISIS_RESOURCES,
    userContext,
  });

  // 7. Gated temperature for safety (lower temp in crisis)
  const temperature = riskTier === 'crisis' ? 0.35 : 0.75;
  const maxTokens = riskTier === 'crisis' ? 300 : 500;

  // 8. Call Claude (or fallback to OpenAI / Groq)
  let rawReply = '';
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      rawReply = await callClaude({
        messages: fullMessages,
        system: bps,
        maxTokens,
        temperature,
        model,
      });
    } catch (err) {
      console.warn('[Zeni ACPE] Claude call failed, falling back to Groq/OpenAI:', err.message);
    }
  }

  if (!rawReply && process.env.AI_API_KEY) {
    rawReply = await callOpenAICompatible({
      messages: fullMessages,
      system: bps,
      maxTokens,
      temperature,
    });
  }

  if (!rawReply) {
    // If external AI key is absent, provide a warm fallback response
    rawReply = outputVerifier.safeFallback();
  }

  // 9. Closed-loop output verification
  const verification = outputVerifier.verify(rawReply);
  if (!verification.isSafe) {
    console.warn(`[Zeni ACPE] Safety scan flagged output: ${verification.reason}. Regenerating...`);
    const hardenedBps = `${bps}\n\n⚠ REGENERATION OVERRIDE: Previous output failed safety check (${verification.reason}). Regenerate warmly and safely with zero clinical labels or method references.`;

    try {
      if (process.env.ANTHROPIC_API_KEY) {
        rawReply = await callClaude({
          messages: fullMessages,
          system: hardenedBps,
          maxTokens: 300,
          temperature: 0.25,
          model,
        });
      } else if (process.env.AI_API_KEY) {
        rawReply = await callOpenAICompatible({
          messages: fullMessages,
          system: hardenedBps,
          maxTokens: 300,
          temperature: 0.25,
        });
      }
    } catch (e) {
      console.error('[Zeni ACPE] Regeneration error:', e.message);
    }

    const secondCheck = outputVerifier.verify(rawReply);
    if (!secondCheck.isSafe) {
      rawReply = outputVerifier.safeFallback();
    }
  }

  return {
    reply: rawReply,
    riskTier,
    vad: smoothedVad,
    delta,
    topEmotion: labels?.[0]?.emotion || (smoothedVad[0] < 0.35 ? 'distress' : 'calm'),
    matchedStory: story?.title || null,
    matchedTherapist: therapist?.name || null,
  };
}

