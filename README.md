# DevoirAI 🎓

Plateforme web sécurisée qui aide les étudiants à traiter leurs devoirs avec l'IA.

## Fonctionnalités

- Upload : PDF, DOCX, PPTX, TXT (max 10 MB)
- Détection automatique du format de sortie demandé
- Résolution par IA avec un ton étudiant naturel
- Export : PDF, Word, PowerPoint selon les consignes
- Dashboard avec historique des devoirs
- Authentification JWT sécurisée
- LLM Gratuit : Google Gemini + Groq en fallback

---

## Installation

### 1. Clés API gratuites

**Google Gemini (principal) :**
→ https://aistudio.google.com → "Get API key" → copier la clé

**Groq (fallback) :**
→ https://console.groq.com → "Create API key" → copier la clé

---

### 2. Backend

```bash
cd devoir-ai/backend

# Créer l'environnement virtuel
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
copy .env.example .env
# Ouvrir .env et renseigner GEMINI_API_KEY et GROQ_API_KEY

# Lancer le serveur
uvicorn app.main:app --reload --port 8000
```

Le backend sera disponible sur http://localhost:8000
Documentation API : http://localhost:8000/docs

---

### 3. Frontend

```bash
cd devoir-ai/frontend

# Installer les dépendances
npm install

# Lancer le serveur de dev
npm run dev
```

L'app sera disponible sur http://localhost:5173

---

## Structure du projet

```
devoir-ai/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── models.py         # Base de données
│   │   ├── schemas.py        # Validation Pydantic
│   │   ├── security.py       # JWT + Auth
│   │   ├── routers/
│   │   │   ├── auth.py       # Register/Login
│   │   │   └── devoirs.py    # Upload/Download
│   │   └── services/
│   │       ├── extractor.py  # Extraction texte
│   │       ├── llm.py        # Gemini + Groq
│   │       └── exporter.py   # Export PDF/Word/PPT
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── DashboardPage.tsx
        │   ├── UploadPage.tsx
        │   └── DevoirDetailPage.tsx
        ├── api/          # Appels API
        └── store/        # État global (Zustand)
```

## Sécurité

- Authentification JWT Bearer
- Validation des types de fichiers (côté serveur)
- Limite de taille 10 MB
- Isolation des données par utilisateur
- Rate limiting sur les endpoints sensibles
- Pas de stockage permanent des fichiers sources
