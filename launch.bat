@echo off
REM Mission Control v2.0 Launcher for Windows
REM Opens the application in your default browser

echo 🚀 Launching Mission Control v2.0...

start "" "%~dp0build\index.html"

echo ✅ Mission Control v2.0 opened in your browser!
timeout /t 2 >nul
