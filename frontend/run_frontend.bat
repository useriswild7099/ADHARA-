@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

title MOIL AI - Frontend Web Server

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "%~dp0node_modules" (
    echo [*] Installing dependencies...
    call npm install
)

echo [*] Starting Vite React frontend server on http://localhost:3000 ...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
npm run dev
if %errorlevel% neq 0 (
    pause
)
