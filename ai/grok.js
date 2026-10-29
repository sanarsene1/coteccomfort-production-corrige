// Client Grok (xAI) : API compatible OpenAI /chat/completions.
// Fonctionne aussi avec tout fournisseur compatible via XAI_BASE_URL.

import { SYSTEM_PROMPT } from './knowledge.js';

const TIMEOUT_MS = 20000;
let lastError = null;

export function getLastError() {
  return lastError;
}

export function clearLastError() {
  lastError = null;
}

export function aiConfig() {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const rawBaseUrl = (process.env.AI_BASE_URL || '').trim();
  const isGemini = provider === 'gemini' || rawBaseUrl.includes('generativelanguage.googleapis.com');
  const isOllama = provider === 'ollama'
    || rawBaseUrl.includes('127.0.0.1:11434')
    || rawBaseUrl.includes('localhost:11434')
    || rawBaseUrl.includes('ollama.com')
    || rawBaseUrl.includes('ollama');
  const kind = isOllama ? 'ollama' : (isGemini ? 'gemini' : 'gemini');
  const configuredModel = process.env.AI_MODEL || (isOllama ? 'gemma4:cloud' : 'gemini-3.8-flash');
  return {
    provider: kind,
    apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.XAI_API_KEY || '',
    baseUrl: (rawBaseUrl || (isOllama ? 'http://127.0.0.1:11434' : 'https://generativelanguage.googleapis.com/v1beta')).replace(/\/+$/, ''),
    model: configuredModel
  };
}

// L’utilisateur ne doit jamais voir le nom du modèle ou du fournisseur.
const LEAK = /\b(grok|groq|xai|x\.ai|openai|chatgpt|gemini|llama|mistral|mod[eè]le de langage|large language model|llm)\b/i;
const LEAK_PATTERNS = [
  /\bWelcomeFast\b/i,
  /\bGoogle Workspace Connectors\b/i,
  /\bStart building in minutes\b/i,
  /\bOpenAI-compatible\b/i,
  /\bAPI Reference\b/i,
  /\bCookbooks\b/i,
  /\bRate Limits\b/i,
  /\bOpenAI base URL\b/i,
  /\bThis page helpful\b/i,
  /\bLearn More\b/i,
  /\bFast LLM inference\b/i
];

function clean(text) {
  return String(text || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

function isLikelyIncomplete(text) {
  const value = clean(text);
  if (!value) return true;
  if (/[,!;:][\s]*$/.test(value)) return true;
  if (!/[.!?]["')\]]?[\s]*$/.test(value)) return true;
  return false;
}

export function isApiLeakOutput(text) {
  const value = clean(text);
  if (!value) return false;
  return LEAK.test(value) || LEAK_PATTERNS.some((pattern) => pattern.test(value));
}

export async function askGrok(message, history = []) {
  const { apiKey, baseUrl, model, provider } = aiConfig();
  lastError = null;

  if (provider === 'ollama') {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const messages = [
        {
          role: 'system',
          content: `${SYSTEM_PROMPT}\n\nRègle absolue : réponds en français, en phrases complètes, et termine toujours par un point final ou un point d’interrogation.`
        },
        ...history.slice(-10).map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.text || '')
        })),
        { role: 'user', content: String(message || '') }
      ];

      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: { temperature: 0.5, num_predict: 400 }
        })
      });

      if (!res.ok) {
        const payload = await res.text();
        lastError = `Ollama ${model} ${res.status}: ${payload.slice(0, 250)}`;
        console.error('[ia]', lastError);
        return null;
      }

      const data = await res.json();
      const reply = clean(data?.message?.content || '');

      if (!reply || reply.length < 2) {
        lastError = `réponse vide pour ${model}`;
        console.error('[ia]', lastError);
        return null;
      }
      if (isLikelyIncomplete(reply)) {
        lastError = `réponse incomplète pour ${model}: ${reply.slice(0, 180)}`;
        console.error('[ia]', lastError);
        return null;
      }
      if (isApiLeakOutput(reply)) {
        lastError = `réponse de fuite d’API pour ${model}`;
        console.error('[ia]', lastError);
        return null;
      }
      return reply;
    } catch (err) {
      lastError = `appel impossible Ollama (${model}) : ${err.name === 'AbortError' ? 'délai dépassé' : err.message}`;
      console.error('[ia]', lastError);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  if (!apiKey) {
    lastError = 'Aucune clé API Gemini configurée.';
    return null;
  }

  const modelCandidates = [
    process.env.AI_MODEL || 'gemini-3.8-flash',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ].filter((value, index, arr) => value && arr.indexOf(value) === index);

  let attemptError = null;
  for (const modelCandidate of modelCandidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const contents = [
        ...history.slice(-10).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.text || '') }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const res = await fetch(`${baseUrl}/models/${modelCandidate}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nRègle absolue : réponds en français, en phrases complètes, et termine toujours par un point final ou un point d’interrogation.` }] },
          contents,
          generationConfig: { temperature: 0.5, maxOutputTokens: 400 }
        })
      });

      if (!res.ok) {
        const payload = await res.text();
        const detail = payload.slice(0, 250);
        attemptError = `Gemini ${modelCandidate} ${res.status}: ${detail}`;
        lastError = attemptError;
        console.error(`[ia] ${lastError}`);
        if (res.status !== 404 && res.status !== 400) return null;
        continue;
      }

      const data = await res.json();
      const reply = clean(data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join(''));

      if (!reply || reply.length < 2) {
        attemptError = `réponse vide pour ${modelCandidate}`;
        lastError = attemptError;
        continue;
      }
      if (isLikelyIncomplete(reply)) {
        attemptError = `réponse incomplète pour ${modelCandidate}: ${reply.slice(0, 180)}`;
        lastError = attemptError;
        console.error('[ia]', lastError);
        continue;
      }
      if (isApiLeakOutput(reply)) {
        attemptError = `réponse de fuite d’API pour ${modelCandidate}`;
        lastError = attemptError;
        console.error('[ia]', lastError);
        continue;
      }
      return reply;
    } catch (err) {
      attemptError = `appel impossible (${modelCandidate}) : ${err.name === 'AbortError' ? 'délai dépassé' : err.message}`;
      lastError = attemptError;
      console.error('[ia]', lastError);
      if (err.name !== 'AbortError') return null;
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError) console.error('[ia] tous les modèles Gemini ont échoué :', lastError);
  return null;
}
