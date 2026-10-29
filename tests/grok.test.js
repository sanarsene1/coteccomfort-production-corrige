import test from 'node:test';
import assert from 'node:assert/strict';
import { aiConfig, isApiLeakOutput } from '../ai/grok.js';
import { COTEC } from '../ai/knowledge.js';

test('bloque les réponses marketing / docs Groq qui ne sont pas du contenu COTEC', () => {
  assert.equal(isApiLeakOutput('WelcomeFast LLM inference, OpenAI-compatible. Simple to integrate, easy to scale.'), true);
  assert.equal(isApiLeakOutput('Bonjour, je suis COTEC IA. Je peux vous renseigner sur Internet, Starlink, les installations, la maintenance, les tarifs, les stages et formations.'), false);
});

test('détecte le fournisseur Ollama sans clé API', () => {
  const prevProvider = process.env.AI_PROVIDER;
  const prevBaseUrl = process.env.AI_BASE_URL;
  const prevModel = process.env.AI_MODEL;
  const prevKey = process.env.AI_API_KEY;

  try {
    process.env.AI_PROVIDER = 'ollama';
    process.env.AI_BASE_URL = 'http://127.0.0.1:11434';
    process.env.AI_MODEL = 'qwen3:1.7b';
    delete process.env.AI_API_KEY;

    const config = aiConfig();
    assert.equal(config.provider, 'ollama');
    assert.equal(config.baseUrl, 'http://127.0.0.1:11434');
    assert.equal(config.model, 'qwen3:1.7b');
    assert.equal(config.apiKey, '');
  } finally {
    if (prevProvider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = prevProvider;
    if (prevBaseUrl === undefined) delete process.env.AI_BASE_URL; else process.env.AI_BASE_URL = prevBaseUrl;
    if (prevModel === undefined) delete process.env.AI_MODEL; else process.env.AI_MODEL = prevModel;
    if (prevKey === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = prevKey;
  }
});

test('conserve les infos officielles COTEC dans la base de connaissance', () => {
  assert.equal(COTEC.nom, 'COMFORT TECHNOLOGIES COTEC');
  assert.equal(COTEC.ville, 'Butembo, Nord-Kivu, RDC');
  assert.equal(COTEC.pdg, 'Désiré Kambale');
  assert.equal(COTEC.adresse, 'immeuble Kisumba, rue Kinshasa, en face de la COODEFI, Butembo');
  assert.equal(COTEC.juridique, 'RCCM CD/BbO/RCCM/24-B-342 ; Id. nat. 19-F4300-N51715H');
});
