@echo off
title Viva System - Stop All Services
color 0C
cls

echo.
echo  ============================================================
echo    Stopping All Viva System Services...
echo  ============================================================
echo.

echo  Stopping Node.js processes (Backend + Frontend)...
taskkill /F /IM node.exe >nul 2>&1
echo  Node.js stopped.

echo  Stopping npm processes...
taskkill /F /IM "npm.cmd" >nul 2>&1
taskkill /F /IM "npm" >nul 2>&1

echo.
echo  All Viva System services have been stopped.
echo  MongoDB continues running (restart PC to stop it, or stop it manually).
echo.
pause
