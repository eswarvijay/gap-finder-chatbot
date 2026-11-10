@echo off
title GapFinder AI - Starter
echo ==============================================================================
echo                      GapFinder AI (Hackathon 2026)
echo                Find What the Student Doesn't Know
echo ==============================================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "GapFinder AI Backend" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite React Frontend on http://localhost:5173 ...
start "GapFinder AI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ==============================================================================
echo GapFinder AI is now running!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo ==============================================================================
start http://localhost:5173
pause

