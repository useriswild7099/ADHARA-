@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

title MOIL AI - Streamlit ML Engine

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not found in PATH.
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo [*] Starting Streamlit ML Dashboard on http://localhost:8501 ...
streamlit run app.py
if %errorlevel% neq 0 (
    pause
)
