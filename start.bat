@echo off
echo ========================================
echo One Piece App - Quick Start Script
echo ========================================
echo.

echo [1/4] Installing Mobile Dependencies...
cd mobile
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install mobile dependencies
    pause
    exit /b 1
)
echo.

echo [2/4] Installing Backend Dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo.

echo [3/4] Starting Backend Server...
start "One Piece Backend" cmd /k "npm run dev"
timeout /t 3 >nul
echo.

echo [4/4] Starting Expo Development Server...
cd ..\mobile
start "Expo Dev Server" cmd /k "npm start"
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend Server: Running in separate window
echo Expo Dev Server: Running in separate window
echo.
echo Next Steps:
echo 1. Scan QR code with Expo Go on your iPhone
echo 2. Configure server URL in app settings
echo    (Use: http://YOUR_IP:3000)
echo.
echo To find your IP: Open Command Prompt and type "ipconfig"
echo Look for "IPv4 Address" under your WiFi adapter
echo.
pause
