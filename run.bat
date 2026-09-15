@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

title MOIL AI Platform - Master Launcher

set "CLI_MODE=0"

:: -----------------------------------------------------------------------------
:: CLI Argument Router (e.g. "run.bat frontend", "run.bat both", "run.bat ml")
:: -----------------------------------------------------------------------------
if /i "%~1"=="frontend"  ( set "CLI_MODE=1" & goto :START_FRONTEND )
if /i "%~1"=="web"       ( set "CLI_MODE=1" & goto :START_FRONTEND )
if /i "%~1"=="1"         ( set "CLI_MODE=1" & goto :START_FRONTEND )

if /i "%~1"=="streamlit" ( set "CLI_MODE=1" & goto :START_STREAMLIT )
if /i "%~1"=="python"    ( set "CLI_MODE=1" & goto :START_STREAMLIT )
if /i "%~1"=="ml"        ( set "CLI_MODE=1" & goto :START_STREAMLIT )
if /i "%~1"=="2"         ( set "CLI_MODE=1" & goto :START_STREAMLIT )

if /i "%~1"=="both"      ( set "CLI_MODE=1" & goto :START_BOTH )
if /i "%~1"=="all"       ( set "CLI_MODE=1" & goto :START_BOTH )
if /i "%~1"=="full"      ( set "CLI_MODE=1" & goto :START_BOTH )
if /i "%~1"=="3"         ( set "CLI_MODE=1" & goto :START_BOTH )

if /i "%~1"=="pipeline"  ( set "CLI_MODE=1" & goto :RUN_PIPELINE )
if /i "%~1"=="train"     ( set "CLI_MODE=1" & goto :RUN_PIPELINE )
if /i "%~1"=="4"         ( set "CLI_MODE=1" & goto :RUN_PIPELINE )

if /i "%~1"=="install"   ( set "CLI_MODE=1" & goto :INSTALL_DEPS )
if /i "%~1"=="deps"      ( set "CLI_MODE=1" & goto :INSTALL_DEPS )
if /i "%~1"=="5"         ( set "CLI_MODE=1" & goto :INSTALL_DEPS )

if /i "%~1"=="build"     ( set "CLI_MODE=1" & goto :BUILD_FRONTEND )
if /i "%~1"=="6"         ( set "CLI_MODE=1" & goto :BUILD_FRONTEND )

:MENU
cls
echo ===============================================================================
echo       MOIL LIMITED - REMOTE SENSING ^& CRITICAL MINERAL PLATFORM (SIH)
echo ===============================================================================
echo.
echo   [1] Start Primary Web Platform  (Vite + React @ http://localhost:3000)
echo   [2] Start Streamlit ML Engine   (Python ML Hub @ http://localhost:8501)
echo   [3] Launch Full Stack (BOTH)    (Spawns separate servers + opens browser)
echo   [4] Retrain ML Models ^& Sync   (Runs AI pipeline + syncs data to frontend)
echo   [5] Install / Verify All Deps   (Node npm packages + Python pip)
echo   [6] Build Production Web Bundle (Vite production build)
echo   [0] Exit
echo.
echo ===============================================================================
set "CHOICE=1"
set /p "CHOICE=Select an option [1-6, default=1]: "

if "%CHOICE%"=="1" goto :START_FRONTEND
if "%CHOICE%"=="2" goto :START_STREAMLIT
if "%CHOICE%"=="3" goto :START_BOTH
if "%CHOICE%"=="4" goto :RUN_PIPELINE
if "%CHOICE%"=="5" goto :INSTALL_DEPS
if "%CHOICE%"=="6" goto :BUILD_FRONTEND
if "%CHOICE%"=="0" goto :EXIT_PROMPT
goto :MENU

:CHECK_NODE
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo.
    if "!CLI_MODE!"=="0" pause
    exit /b 1
)
exit /b 0

:CHECK_PYTHON
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python is not found in your system PATH!
    echo Please install Python 3.9+ from: https://python.org/
    echo.
    if "!CLI_MODE!"=="0" pause
    exit /b 1
)
exit /b 0

:CHECK_NODE_MODULES
if not exist "%~dp0frontend\node_modules" (
    echo.
    echo [*] 'node_modules' folder not found in frontend.
    echo [*] Installing frontend npm packages automatically...
    call npm --prefix "%~dp0frontend" install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install npm dependencies.
        if "!CLI_MODE!"=="0" pause
        exit /b 1
    )
)
exit /b 0

:START_FRONTEND
call :CHECK_NODE
call :CHECK_NODE_MODULES
echo.
echo [*] Starting MOIL AI React Frontend on http://localhost:3000 ...
echo [*] Opening browser in 2 seconds...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
cd /d "%~dp0frontend"
npm run dev
goto :END

:START_STREAMLIT
call :CHECK_PYTHON
echo.
echo [*] Starting MOIL Streamlit ML Engine on http://localhost:8501 ...
echo [*] Opening browser...
cd /d "%~dp0claude"
streamlit run app.py
goto :END

:START_BOTH
call :CHECK_NODE
call :CHECK_PYTHON
call :CHECK_NODE_MODULES
echo.
echo ===============================================================================
echo   Launching Full Stack Platform (Frontend + Streamlit ML)
echo ===============================================================================
echo [*] 1. Launching React Frontend Server (Port 3000)...
start "MOIL AI - React Frontend (Port 3000)" cmd /k "cd /d ""%~dp0frontend"" && title MOIL AI - Frontend Server && npm run dev"
echo [*] 2. Launching Streamlit ML Dashboard (Port 8501)...
start "MOIL AI - Streamlit Dashboard (Port 8501)" cmd /k "cd /d ""%~dp0claude"" && title MOIL AI - Streamlit ML Engine && streamlit run app.py"
echo [*] 3. Opening browsers...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000 & start http://localhost:8501"
echo.
echo [OK] Both servers have been launched in dedicated command windows!
if "!CLI_MODE!"=="1" goto :END
echo Press any key to return to menu or close this window.
pause
goto :MENU

:RUN_PIPELINE
call :CHECK_PYTHON
echo.
echo ===============================================================================
echo   RUNNING FULL AI TRAINING PIPELINE ^& DATA SYNC
echo ===============================================================================
cd /d "%~dp0claude"
echo [*] [1/4] Generating synthetic geospatial & production datasets...
python data_generator.py
if %errorlevel% neq 0 ( 
    echo [ERROR] data_generator failed!
    if "!CLI_MODE!"=="0" pause
    goto :MENU 
)

echo [*] [2/4] Training ore prospectivity model (AlphaEarth + Random Forest)...
python train_prospectivity.py
if %errorlevel% neq 0 ( 
    echo [ERROR] train_prospectivity failed!
    if "!CLI_MODE!"=="0" pause
    goto :MENU 
)

echo [*] [3/4] Training shortfall forecast model (Multivariate Linear + Fallback)...
python train_forecast.py
if %errorlevel% neq 0 ( 
    echo [ERROR] train_forecast failed!
    if "!CLI_MODE!"=="0" pause
    goto :MENU 
)

echo [*] [4/4] Exporting model metrics and geospatial grids to Frontend...
python export_data_for_frontend.py
if %errorlevel% neq 0 ( 
    echo [ERROR] export_data_for_frontend failed!
    if "!CLI_MODE!"=="0" pause
    goto :MENU 
)

echo.
echo [SUCCESS] Full AI pipeline trained and data synced to frontend/src/data!
echo.
if "!CLI_MODE!"=="1" goto :END
pause
goto :MENU

:INSTALL_DEPS
call :CHECK_NODE
call :CHECK_PYTHON
echo.
echo ===============================================================================
echo   INSTALLING ALL PROJECT DEPENDENCIES
echo ===============================================================================
echo [*] Installing frontend npm packages...
cd /d "%~dp0frontend"
call npm install
echo.
echo [*] Installing Python pip requirements...
cd /d "%~dp0claude"
call pip install -r requirements.txt
echo.
echo [SUCCESS] All dependencies installed successfully!
if "!CLI_MODE!"=="1" goto :END
pause
goto :MENU

:BUILD_FRONTEND
call :CHECK_NODE
call :CHECK_NODE_MODULES
echo.
echo ===============================================================================
echo   BUILDING FRONTEND PRODUCTION BUNDLE
echo ===============================================================================
cd /d "%~dp0frontend"
call npm run build
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Production build generated in frontend\dist\
) else (
    echo [ERROR] Build failed.
)
if "!CLI_MODE!"=="1" goto :END
pause
goto :MENU

:EXIT_PROMPT
exit /b 0

:END
