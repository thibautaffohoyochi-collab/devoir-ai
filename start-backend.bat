@echo off
echo === DevoirAI - Backend ===
cd /d "%~dp0backend"

if not exist "venv" (
    echo Creation de l'environnement virtuel...
    python -m venv venv
)

call venv\Scripts\activate

echo Installation des dependances...
pip install -r requirements.txt --quiet

if not exist ".env" (
    echo ATTENTION: Fichier .env manquant !
    echo Copie du fichier exemple...
    copy .env.example .env
    echo.
    echo Ouvre le fichier .env et renseigne tes cles API :
    echo   - GEMINI_API_KEY  (https://aistudio.google.com)
    echo   - GROQ_API_KEY    (https://console.groq.com)
    echo.
    pause
)

echo Demarrage du serveur sur http://localhost:8000 ...
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
