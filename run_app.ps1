Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "                     GapFinder AI (Hackathon 2026)" -ForegroundColor Green
Write-Host "               Find What the Student Doesn't Know" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$baseDir\backend`" && ..\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Vite React Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$baseDir\frontend`" && npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "GapFinder AI is now running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Green

Start-Process "http://localhost:5173"

