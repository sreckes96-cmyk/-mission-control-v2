#!/bin/bash
# Mission Control v2.0 Launcher
# Opens the application in your default browser

APP_PATH="$(cd "$(dirname "$0")" && pwd)/build/index.html"

echo "🚀 Launching Mission Control v2.0..."

# Detect OS and open accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$APP_PATH"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$APP_PATH" 2>/dev/null || firefox "$APP_PATH" || google-chrome "$APP_PATH"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash)
    start "$APP_PATH"
else
    echo "Please open: $APP_PATH"
fi

echo "✅ Mission Control v2.0 opened in your browser!"
