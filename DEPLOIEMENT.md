# Guide de déploiement Railway

## Prérequis
- Compte GitHub (gratuit)
- Compte Railway (gratuit) → railway.app

---

## Étape 1 — Pousser le code sur GitHub

```bash
# Dans le dossier devoir-ai
git init
git add .
git commit -m "DevoirAI v1.0"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/devoir-ai.git
git push -u origin main
```

---

## Étape 2 — Déployer le Backend sur Railway

1. Va sur **railway.app** → "New Project"
2. Clique **"Deploy from GitHub repo"**
3. Sélectionne ton repo → dossier **`backend`**
4. Railway détecte automatiquement le Dockerfile

### Variables d'environnement à configurer sur Railway :

| Variable | Valeur |
|---|---|
| `GEMINI_API_KEY` | Ta clé Gemini |
| `GROQ_API_KEY` | Ta clé Groq |
| `OPENROUTER_API_KEY` | Ta clé OpenRouter |
| `SECRET_KEY` | `ab64b17bc2387b30bbc5e344f5a7cbbb6475acf586eb02e4dd434fc7fec9f240` |
| `EMAIL_ENABLED` | `true` |
| `SMTP_USER` | `affothibauthoyochi@gmail.com` |
| `SMTP_PASSWORD` | `kbdtrfvbqmwijxon` |
| `EMAIL_FROM` | `DevoirAI <affothibauthoyochi@gmail.com>` |
| `ALLOWED_ORIGINS` | `https://TON-FRONTEND.railway.app` |
| `APP_BASE_URL` | `https://TON-BACKEND.railway.app` |

### Ajouter une base PostgreSQL :
1. Dans Railway → "New" → "Database" → "PostgreSQL"
2. Copie la variable `DATABASE_URL` générée automatiquement
3. Elle sera au format `postgres://user:pass@host/db`
4. Notre code la convertit automatiquement en asyncpg

---

## Étape 3 — Déployer le Frontend sur Railway

1. Nouveau projet Railway → GitHub → dossier **`frontend`**
2. Variables d'environnement :

| Variable | Valeur |
|---|---|
| `VITE_API_URL` | `https://TON-BACKEND.railway.app` |

3. Ajouter `serve` pour servir le build :
```bash
npm install -g serve
```

---

## Étape 4 — Mettre à jour le Frontend pour pointer vers le backend en prod

Dans `frontend/src/api/client.ts`, l'URL de l'API doit pointer vers le backend Railway.
Le fichier est déjà configuré avec `VITE_API_URL` via les variables d'environnement.

---

## Alternative : Render (aussi gratuit)

1. **render.com** → New → Web Service → GitHub
2. Pour le backend : Runtime = Docker, Branch = main, Root = backend
3. Pour le frontend : Static Site, Build = `npm run build`, Publish = `dist`

---

## Résultat final

- Backend : `https://devoir-ai-backend.railway.app`
- Frontend : `https://devoir-ai-frontend.railway.app`
- API Docs : `https://devoir-ai-backend.railway.app/docs`
