@echo off
REM Mission Control v2.0 - GitHub Setup Script for Windows
REM This script helps you initialize your Git repository

echo ========================================
echo Mission Control v2.0 - GitHub Setup
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed!
    echo.
    echo Please install Git first:
    echo   Download from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed
git --version
echo.

REM Check if already initialized
if exist .git (
    echo [WARNING] Git repository already exists in this directory
    set /p continue="Do you want to continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)

REM Get user information
echo Let's set up your Git configuration
echo.

set /p user_name="Enter your name: "
set /p user_email="Enter your email (same as GitHub): "

REM Configure Git
git config --global user.name "%user_name%"
git config --global user.email "%user_email%"

echo.
echo [OK] Git configured with:
echo    Name: %user_name%
echo    Email: %user_email%
echo.

REM Initialize repository if needed
if not exist .git (
    echo Initializing Git repository...
    git init
    echo [OK] Repository initialized
) else (
    echo [OK] Using existing repository
)
echo.

REM Add files
echo Adding files to Git...
git add .
echo [OK] Files added
echo.

REM Show status
echo Current status:
git status
echo.

REM Create first commit
set /p create_commit="Create initial commit? (y/n): "
if /i "%create_commit%"=="y" (
    git commit -m "Initial commit: Mission Control v2.0 with all features"
    echo [OK] Initial commit created
) else (
    echo [SKIP] Skipped commit - run 'git commit -m "your message"' manually
)
echo.

REM Connect to GitHub
echo ========================================
echo Connect to GitHub
echo ========================================
echo.
echo First, create a repository on GitHub:
echo   1. Go to https://github.com/new
echo   2. Name it: mission-control-v2
echo   3. Don't add README, .gitignore, or license
echo   4. Click 'Create repository'
echo.

set /p repo_created="Have you created the GitHub repository? (y/n): "

if /i "%repo_created%"=="y" (
    set /p github_user="Enter your GitHub username: "
    set /p repo_name="Enter repository name (default: mission-control-v2): "
    
    if "%repo_name%"=="" set repo_name=mission-control-v2
    
    set github_url=https://github.com/%github_user%/%repo_name%.git
    
    echo.
    echo Connecting to: %github_url%
    
    REM Check if remote already exists
    git remote get-url origin >nul 2>&1
    if not errorlevel 1 (
        echo [WARNING] Remote 'origin' already exists
        git remote set-url origin %github_url%
        echo [OK] Updated remote URL
    ) else (
        git remote add origin %github_url%
        echo [OK] Remote added
    )
    
    echo.
    set /p push_now="Push to GitHub now? (y/n): "
    
    if /i "%push_now%"=="y" (
        echo.
        echo Pushing to GitHub...
        echo.
        echo Note: You'll need to authenticate with GitHub
        echo       Use your Personal Access Token as password
        echo.
        
        git branch -M main
        git push -u origin main
        
        if errorlevel 1 (
            echo.
            echo [ERROR] Push failed. Common issues:
            echo    1. Need Personal Access Token (not password^)
            echo       Get one at: https://github.com/settings/tokens
            echo    2. Repository doesn't exist on GitHub
            echo    3. Wrong username or repository name
            echo.
            echo Try again with: git push -u origin main
        ) else (
            echo.
            echo ========================================
            echo SUCCESS! Your code is now on GitHub!
            echo ========================================
            echo.
            echo View it at: https://github.com/%github_user%/%repo_name%
        )
    )
) else (
    echo.
    echo [INFO] Run these commands when ready:
    echo    git remote add origin https://github.com/YOUR-USERNAME/mission-control-v2.git
    echo    git branch -M main
    echo    git push -u origin main
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo    - View: GITHUB_SETUP_GUIDE.md for detailed instructions
echo    - Keep: GIT_QUICK_REFERENCE.md as a handy reference
echo    - Read: README.md to understand the project
echo.
echo Daily workflow:
echo    git pull          # Get latest changes
echo    # ... make changes ...
echo    git add .
echo    git commit -m "What you did"
echo    git push          # Upload changes
echo.
echo Happy coding!
echo.
pause
