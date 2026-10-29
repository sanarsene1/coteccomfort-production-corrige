// Serveur COTEC : sert le site (dossier public/) et l’API /api/chat.
// Aucune dépendance. Node 20+ requis.

import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { askGrok, aiConfig, getLastError } from './ai/grok.js';
import { hashPassword, verifyPassword } from './lib/auth.js';
import { ensureDatabase, pool } from './lib/db.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');

// Chargement du fichier .env (natif, sans dotenv)
if (existsSync(path.join(root, '.env')) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.join(root, '.env'));
  } catch (err) {
    console.error('[env] lecture impossible :', err.message);
  }
}

const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 20_000;
const MAX_MESSAGE = 800;
const MAX_TURNS = 20;
const RATE_LIMIT = 20; // messages par minute et par IP

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// ---------- mémoire de conversation (en RAM, expire après 30 min) ----------
const conversations = new Map();
const TTL = 30 * 60 * 1000;

function history(id) {
  const c = conversations.get(id);
  return c ? c.messages : [];
}
function remember(id, message, reply) {
  const messages = [...history(id), { role: 'user', text: message }, { role: 'assistant', text: reply }].slice(-MAX_TURNS);
  conversations.set(id, { messages, at: Date.now() });
}
setInterval(() => {
  const now = Date.now();
  for (const [id, c] of conversations) if (now - c.at > TTL) conversations.delete(id);
  for (const [ip, r] of hits) if (now - r.start > 60_000) hits.delete(ip);
}, 5 * 60 * 1000).unref();

// ---------- limitation de débit ----------
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const r = hits.get(ip);
  if (!r || now - r.start > 60_000) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  r.count += 1;
  return r.count > RATE_LIMIT;
}

// ---------- utilitaires ----------
function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleRegister(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { ok: false, error: 'Requête invalide.' });
  }

  const username = String(payload?.username || '').trim();
  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');

  if (!username || !email || !password) {
    return json(res, 400, { ok: false, error: 'Nom d’utilisateur, email et mot de passe requis.' });
  }

  if (password.length < 6) {
    return json(res, 400, { ok: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length) {
      return json(res, 409, { ok: false, error: 'Un compte existe déjà avec cet e-mail.' });
    }

    const userId = randomUUID();
    const { hash, salt } = await hashPassword(password);
    await pool.execute(
      'INSERT INTO users (id, username, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, username, email, hash, salt]
    );

    return json(res, 201, {
      ok: true,
      user: { id: userId, username, email },
      message: 'Compte créé avec succès.'
    });
  } catch (error) {
    console.error('[mysql:register]', error);
    return json(res, 500, { ok: false, error: 'Impossible de créer le compte.' });
  }
}

async function handleLogin(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { ok: false, error: 'Requête invalide.' });
  }

  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');

  if (!email || !password) {
    return json(res, 400, { ok: false, error: 'Email et mot de passe requis.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, password_hash, password_salt FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!rows.length) {
      return json(res, 401, { ok: false, error: 'Identifiants invalides.' });
    }

    const user = rows[0];
    const isValid = await verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      return json(res, 401, { ok: false, error: 'Identifiants invalides.' });
    }

    return json(res, 200, {
      ok: true,
      user: { id: user.id, username: user.username, email: user.email },
      message: 'Connexion réussie.'
    });
  } catch (error) {
    console.error('[mysql:login]', error);
    return json(res, 500, { ok: false, error: 'Connexion impossible pour le moment.' });
  }
}

async function handleChat(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  if (limited(ip)) return json(res, 429, { ok: false, error: 'Trop de messages, patientez un instant.' });

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (err) {
    return json(res, err.message === 'too_large' ? 413 : 400, { ok: false, error: 'Requête invalide.' });
  }

  const message = String(payload?.message || '').trim().slice(0, MAX_MESSAGE);
  const rawId = String(payload?.conversationId || '');
  const id = /^[a-zA-Z0-9_-]{8,64}$/.test(rawId) ? rawId : `anon-${ip}`;
  if (!message) return json(res, 400, { ok: false, error: 'Message vide.' });

  const past = history(id);
  const reply = await askGrok(message, past);
  if (!reply) {
    const detail = getLastError() || 'L’IA COTEC n’est pas disponible pour le moment. Réessayez plus tard.';
    return json(res, 503, {
      ok: false,
      error: detail
    });
  }
  remember(id, message, reply);
  json(res, 200, { ok: true, reply, source: 'ai' });
}

async function handleWhatsAppMessages(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, error: 'Méthode non autorisée.' });
  }

  const url = new URL(req.url, 'http://localhost');
  const keyName = url.searchParams.get('key');

  try {
    if (keyName) {
      const [rows] = await pool.execute(
        'SELECT key_name, phone_number, message FROM whatsapp_message_templates WHERE key_name = ? LIMIT 1',
        [keyName]
      );

      if (!rows.length) {
        return json(res, 404, { ok: false, error: 'Message WhatsApp introuvable.' });
      }

      return json(res, 200, { ok: true, message: rows[0] });
    }

    const [rows] = await pool.execute(
      'SELECT key_name, phone_number, message FROM whatsapp_message_templates ORDER BY key_name ASC'
    );

    return json(res, 200, { ok: true, messages: rows });
  } catch (error) {
    console.error('[mysql:whatsapp-templates]', error);
    return json(res, 500, { ok: false, error: 'Impossible de récupérer les messages WhatsApp.' });
  }
}

async function handleComments(req, res) {
  try {
    const [columns] = await pool.execute('SHOW COLUMNS FROM comments');
    const fields = columns.map((column) => column.Field);
    const usesLegacyFields = fields.includes('author') && fields.includes('text');
    const usesModernFields = fields.includes('author_name') && fields.includes('content');

    if (req.method === 'GET') {
      let rows;
      if (usesLegacyFields) {
        [rows] = await pool.execute(
          'SELECT id, author, service, text, status, created_at FROM comments WHERE status IN (?, ?) ORDER BY created_at DESC LIMIT 200',
          ['approved', 'pending']
        );
      } else if (usesModernFields) {
        [rows] = await pool.execute(
          'SELECT id, author_name AS author, email, content AS text, status, created_at FROM comments WHERE status IN (?, ?) ORDER BY created_at DESC LIMIT 200',
          ['approved', 'pending']
        );
      } else {
        [rows] = await pool.execute(
          'SELECT id, author_name AS author, email, content AS text, status, created_at FROM comments ORDER BY created_at DESC LIMIT 200'
        );
      }

      const normalized = (rows || []).map((row) => ({
        id: row.id,
        author: row.author || row.author_name || 'Client COTEC',
        service: row.service || 'Service client',
        text: row.text || row.content || '',
        status: row.status || 'approved',
        created_at: row.created_at,
      }));

      return json(res, 200, { ok: true, comments: normalized });
    }

    if (req.method === 'POST') {
      let payload;
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        return json(res, 400, { ok: false, error: 'Requête invalide.' });
      }

      const author = String(payload?.author || 'Client COTEC').trim();
      const service = String(payload?.service || 'Service client').trim();
      const text = String(payload?.text || '').trim();

      if (!text) {
        return json(res, 400, { ok: false, error: 'Le commentaire est vide.' });
      }

      if (usesLegacyFields) {
        const [result] = await pool.execute(
          'INSERT INTO comments (author, service, text, status, created_at) VALUES (?, ?, ?, ?, NOW())',
          [author || 'Client COTEC', service || 'Service client', text.slice(0, 1000), 'approved']
        );

        const [rows] = await pool.execute(
          'SELECT id, author, service, text, status, created_at FROM comments WHERE id = ? LIMIT 1',
          [result.insertId]
        );

        return json(res, 201, { ok: true, comment: rows[0] || null });
      }

      const [result] = await pool.execute(
        'INSERT INTO comments (author_name, email, content, status, created_at) VALUES (?, ?, ?, ?, NOW())',
        [author || 'Client COTEC', null, text.slice(0, 1000), 'approved']
      );

      const [rows] = await pool.execute(
        'SELECT id, author_name AS author, email, content AS text, status, created_at FROM comments WHERE id = ? LIMIT 1',
        [result.insertId]
      );

      return json(res, 201, { ok: true, comment: rows[0] || null });
    }

    return json(res, 405, { ok: false, error: 'Méthode non autorisée.' });
  } catch (error) {
    console.error('[mysql:comments]', error);
    return json(res, 500, { ok: false, error: 'Impossible de récupérer les commentaires.' });
  }
}

async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(publicDir, rel));
  if (!file.startsWith(publicDir + path.sep)) {
    res.writeHead(403, SECURITY_HEADERS);
    return res.end('Interdit');
  }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    const ext = path.extname(file).toLowerCase();
    const body = await readFile(file);
    const isPublicAsset = ['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'].includes(ext);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': isPublicAsset ? 'no-store, no-cache, must-revalidate, max-age=0' : 'no-cache',
      ...SECURITY_HEADERS
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
    res.end('<!doctype html><meta charset="utf-8"><title>Page introuvable</title><p style="font-family:sans-serif;padding:2rem">Page introuvable. <a href="/">Retour à l’accueil COTEC</a></p>');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname === '/health') return json(res, 200, { ok: true, ai: Boolean(aiConfig().apiKey), db: true });
    if (pathname === '/api/auth/register') {
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Méthode non autorisée.' });
      return await handleRegister(req, res);
    }
    if (pathname === '/api/auth/login') {
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Méthode non autorisée.' });
      return await handleLogin(req, res);
    }
    if (pathname === '/api/chat') {
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Méthode non autorisée.' });
      return await handleChat(req, res);
    }
    if (pathname === '/api/whatsapp/messages') {
      return await handleWhatsAppMessages(req, res);
    }
    if (pathname === '/api/comments') {
      return await handleComments(req, res);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, SECURITY_HEADERS);
      return res.end();
    }
    return await serveStatic(req, res, pathname);
  } catch (err) {
    console.error('[serveur]', err);
    if (!res.headersSent) json(res, 500, { ok: false, error: 'Erreur interne.' });
  }
});

async function startServer() {
  try {
    await ensureDatabase();
    server.listen(PORT, () => {
      const { apiKey, model, provider } = aiConfig();
      console.log(`COTEC en ligne : http://localhost:${PORT}`);
      console.log('Auth locale MySQL activée : base cotec');
      if (provider === 'ollama') {
        console.log(`IA : Ollama activé (${model}), aucun jeton requis. Assure-toi d’avoir lancé : ollama pull ${model}`);
      } else {
        console.log(apiKey ? `IA : modèle externe activé (${model}), clé chargée depuis .env` : 'IA : clé absente, moteur local de secours actif');
      }
    });
  } catch (error) {
    console.error('[mysql:init]', error);
    process.exit(1);
  }
}

startServer();
