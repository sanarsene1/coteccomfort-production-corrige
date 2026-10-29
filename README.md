# COMFORT TECHNOLOGIES COTEC

Site vitrine + assistante **COTEC IA**. Le projet est compatible Node 20.12+ et fonctionne sans Ollama en production.

## Lancer localement

```bash
cp .env.example .env
npm install
npm start
```

Puis ouvrir : http://localhost:3000

## Variables d’environnement

Le fichier `.env.example` contient déjà les variables utiles :
- `PORT`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `AI_PROVIDER`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`

Important :
- Ne jamais pousser le vrai `.env` sur GitHub
- Pour Render, met les variables depuis le panneau d’administration, pas dans le dépôt

## Structure

```
server.js          serveur principal : pages HTML + API backend
ai/knowledge.js    informations COTEC et prompt système
ai/grok.js         client IA (compatible Gemini / Ollama)
ai/local.js        moteur de secours sans clé API
ai/kb.json         base de connaissances technique
lib/db.js          connexion MySQL + création des tables
public/            pages, CSS, JS, images et vidéos
```

## IA

- Si `AI_API_KEY` est présente, le chatbot peut s’appuyer sur une IA externe.
- Sans clé, le moteur local prend automatiquement le relais.
- Ollama n’est pas requis pour le site ; il est optionnel et ne doit pas être déployé sur Render pour ce projet.

## Déploiement Render

### Prérequis
- Site Node sur Render
- Base MySQL externe (Railway, Aiven, DigitalOcean, etc.)

### Configuration Render
- Build Command : `npm install`
- Start Command : `npm start`
- Ajouter ces variables d’environnement dans Render :
  - `DB_HOST`
  - `DB_PORT`
  - `DB_DATABASE`
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `AI_PROVIDER`
  - `AI_API_KEY` (facultatif)
  - `AI_BASE_URL` (facultatif)
  - `AI_MODEL` (facultatif)

## Notes de production

- Le site est conçu pour être servi par un hébergeur Node standard.
- La base MySQL doit rester externe pour un déploiement propre et stable.
- Les messages WhatsApp sont gérés via la base et non pas en dur dans chaque page HTML.
