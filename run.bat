@echo off
title ARU Stock - Starting Web Server
echo ===================================================
echo   ARU Stock - Equipment Borrow & Return System
echo   Phranakhon Si Ayutthaya Rajabhat University
echo ===================================================
echo.
echo Starting Next.js Web Server on http://localhost:3000 ...
echo.
cd /d "%~dp0"
npm.cmd run dev
pause
