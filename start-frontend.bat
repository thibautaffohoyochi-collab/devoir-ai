@echo off
echo === DevoirAI - Frontend ===
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installation des dependances npm...
    npm install
)

echo Demarrage du frontend sur http://localhost:5173 ...
npm run dev
