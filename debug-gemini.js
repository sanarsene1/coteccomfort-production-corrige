const fs = require('fs');
const path = require('path');
const envFile = path.join(__dirname, '.env');
const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
const env = {};
for (const line of lines) {
  if (!line || line.trim().startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i < 0) continue;
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const base = env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const model = env.AI_MODEL || 'gemini-2.0-flash';
const apiKey = env.AI_API_KEY;
console.log('MODEL', model);
console.log('BASE', base);
fetch(`${base}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Bonjour, réponds simplement en une phrase.' }] }]
  })
}).then(async (res) => {
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text.slice(0, 800));
}).catch((err) => {
  console.error('ERR', err);
  process.exitCode = 1;
});
