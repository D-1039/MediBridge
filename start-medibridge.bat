@echo off
setlocal enabledelayedexpansion

REM ---- Edit this if the project moves ----
set "PROJECT_ROOT=D:\Dhruv\Hackathon\MediBridge Hack_Aarambh\MediBridge Hack_Aarambh\MediBridge"
set "BACKEND=%PROJECT_ROOT%\backend"
set "FRONTEND=%PROJECT_ROOT%\frontend"
set "OCR_SERVICE=%PROJECT_ROOT%\ocr-service"

set "OCR_PORT=8000"
set "OCR_HEALTH_URL=http://127.0.0.1:8000/health"

echo ============================================
echo  Starting MediBridge dev environment (no Docker)
echo ============================================

REM ---------------------------------------------------------
REM Step 0: Verify the OCR venv and its required runtime dependencies.
REM ---------------------------------------------------------
if not exist "%OCR_SERVICE%\venv\Scripts\python.exe" (
    echo Setting up for the first time: creating the OCR Python virtual environment...
    python -m venv "%OCR_SERVICE%\venv"
    if errorlevel 1 (
        echo ERROR: Could not create the OCR virtual environment. Startup stopped.
        exit /b 1
    )
    echo Installing OCR dependencies from requirements.txt...
    "%OCR_SERVICE%\venv\Scripts\python.exe" -m pip install -r "%OCR_SERVICE%\requirements.txt"
    if errorlevel 1 (
        echo ERROR: OCR dependency installation failed. Startup stopped.
        exit /b 1
    )
) else (
    "%OCR_SERVICE%\venv\Scripts\python.exe" -c "import uvicorn, paddleocr" 2>nul
    if errorlevel 1 (
        echo Dependencies incomplete, reinstalling from requirements.txt...
        "%OCR_SERVICE%\venv\Scripts\python.exe" -m pip install -r "%OCR_SERVICE%\requirements.txt"
        if errorlevel 1 (
            echo ERROR: OCR dependency reinstallation failed. Startup stopped.
            exit /b 1
        )
    )
)

echo Environment OK, starting service.

REM ---------------------------------------------------------
REM Step 0.5: Make sure port 8000 is actually free before
REM launching a new OCR process. A leftover process from a
REM previous run (window closed without stopping the server,
REM crashed nodemon-style restart, etc.) otherwise causes a
REM bind failure ("only one usage of each socket address is
REM normally permitted") the next time this script runs.
REM ---------------------------------------------------------
echo Checking if port %OCR_PORT% is already in use...

set "OCR_EXISTING_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:"LISTENING" ^| findstr ":%OCR_PORT% "') do (
    set "OCR_EXISTING_PID=%%P"
)

if defined OCR_EXISTING_PID (
    echo Port %OCR_PORT% is already in use by PID !OCR_EXISTING_PID!.
    echo This is almost always a leftover OCR process from a previous run.
    choice /M "Kill it and continue"
    if errorlevel 2 (
        echo Aborting startup - free port %OCR_PORT% manually and rerun.
        exit /b 1
    )
    taskkill /PID !OCR_EXISTING_PID! /F >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Could not kill PID !OCR_EXISTING_PID!. Free the port manually and rerun.
        exit /b 1
    )
    echo Killed PID !OCR_EXISTING_PID!. Waiting a moment for the port to release...
    timeout /t 2 /nobreak >nul
) else (
    echo Port %OCR_PORT% is free.
)

REM ---------------------------------------------------------
REM Step 1: Start the OCR service (PaddleOCR) via its venv -
REM takes longest to warm up, so it goes first.
REM ---------------------------------------------------------
echo [1/4] Starting OCR service...

wt -w new -d "%OCR_SERVICE%" cmd /k "venv\Scripts\python -m uvicorn app:app --host 0.0.0.0 --port %OCR_PORT%"

echo Waiting for OCR service to become healthy at %OCR_HEALTH_URL% ...

set /a OCR_RETRIES=0
:WAIT_OCR
curl.exe -s -o nul -w "%%{http_code}" %OCR_HEALTH_URL% > "%TEMP%\ocr_status.txt" 2>nul
set /p OCR_STATUS=<"%TEMP%\ocr_status.txt"
if "!OCR_STATUS!"=="200" (
    echo OCR service is healthy.
    goto OCR_READY
)
set /a OCR_RETRIES+=1
if !OCR_RETRIES! GEQ 30 (
    echo WARNING: OCR service did not respond healthy after 60s.
    echo Continuing anyway - ocr-suggest calls may fail until it's up.
    goto OCR_READY
)
timeout /t 2 /nobreak >nul
goto WAIT_OCR

:OCR_READY

REM ---------------------------------------------------------
REM Step 2: Start the database
REM ---------------------------------------------------------
echo [2/4] Starting database...
wt -w 0 nt -d "%BACKEND%" cmd /k "npm run db:start"

REM Give the DB a few seconds to accept connections
timeout /t 5 /nobreak >nul

REM ---------------------------------------------------------
REM Step 3: Start the backend
REM ---------------------------------------------------------
echo [3/4] Starting backend...
wt -w 0 nt -d "%BACKEND%" cmd /k "npm run dev:clean"

REM Give the backend a moment to bind its port before frontend starts
timeout /t 3 /nobreak >nul

REM ---------------------------------------------------------
REM Step 4: Start the frontend
REM ---------------------------------------------------------
echo [4/4] Starting frontend...
wt -w 0 nt -d "%FRONTEND%" cmd /k "npm run dev"

echo ============================================
echo  All services launching. Check the new tabs.
echo  Order: OCR service -^> Database -^> Backend -^> Frontend
echo ============================================

endlocal