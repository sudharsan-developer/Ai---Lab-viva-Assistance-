@echo off
title Viva System - Launcher
color 0A
cls

echo.
echo  ============================================================
echo    AI-Powered Viva Preparation System - Auto Startup
echo  ============================================================
echo.

:: ─── STEP 1: Check if MongoDB is running ────────────────────────
echo  [1/4] Checking MongoDB...
powershell -NoProfile -Command "Test-NetConnection -ComputerName 127.0.0.1 -Port 27017 -InformationLevel Quiet 2>$null" > "%TEMP%\mongo_check.txt" 2>&1
findstr /i "True" "%TEMP%\mongo_check.txt" >nul 2>&1
if %errorlevel% equ 0 (
    echo         MongoDB is already running on port 27017. OK
) else (
    echo         MongoDB not running. Starting MongoDB...
    if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
        if not exist "C:\data\db" mkdir "C:\data\db"
        start "MongoDB" /min "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db" --port 27017 --logpath "C:\data\mongod.log"
        echo         MongoDB starting... waiting 5 seconds
        timeout /t 5 /nobreak >nul
    ) else (
        echo  [WARNING] MongoDB executable not found.
        echo            Please start MongoDB manually before using the app.
    )
)

:: ─── STEP 2: Free port 5000 if occupied ─────────────────────────
echo.
echo  [2/4] Checking port 5000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 "') do (
    echo         Port 5000 in use by PID %%a. Stopping old process...
    taskkill /PID %%a /F >nul 2>&1
    timeout /t 1 /nobreak >nul
)
echo         Port 5000 is free. OK

:: ─── STEP 3: Free port 3000 if occupied ─────────────────────────
echo.
echo  [3/4] Checking port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 "') do (
    echo         Port 3000 in use by PID %%a. Stopping old process...
    taskkill /PID %%a /F >nul 2>&1
    timeout /t 1 /nobreak >nul
)
echo         Port 3000 is free. OK

:: ─── STEP 4: Start Backend in new window ────────────────────────
echo.
echo  [4/4] Starting Backend and Frontend...
echo.

start "Viva Backend - Port 5000" /D "D:\Demo project\viva-system\backend" cmd /k "color 0B && echo. && echo  === VIVA BACKEND (Node.js Express - Port 5000) === && echo. && node server.js"

:: Wait 4 seconds for backend to connect to MongoDB
timeout /t 4 /nobreak >nul

:: ─── STEP 5: Start Frontend in new window ───────────────────────
start "Viva Frontend - Port 3000" /D "D:\Demo project\viva-system\frontend" cmd /k "color 05 && echo. && echo  === VIVA FRONTEND (React - Port 3000) === && echo. && set BROWSER=none && npm start"

:: ─── STEP 6: Open browser after a delay ─────────────────────────
echo  Waiting for services to start (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
echo  Opening app in browser...
start "" "http://localhost:3000"

echo.
echo  ============================================================
echo    System started! Close this window when done.
echo    Backend logs: Blue terminal window
echo    Frontend logs: Purple terminal window
echo  ============================================================
echo.
echo  Login Credentials:
echo    Staff:   srinivasan / staff123  (or revathi, selvi, dhanalakshmi)
echo    Student: 25pca04001 / student123  (register number as username)
echo.
pause
