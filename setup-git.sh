#!/bin/bash

# Mission Control v2.0 - GitHub Setup Script
# This script helps you initialize your Git repository

echo "🚀 Mission Control v2.0 - GitHub Setup"
echo "========================================"
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "Please install Git first:"
    echo "  - Windows: https://git-scm.com/download/win"
    echo "  - Mac: Install Xcode Command Line Tools"
    echo "  - Linux: sudo apt-get install git"
    exit 1
fi

echo "✅ Git is installed ($(git --version))"
echo ""

# Check if already initialized
if [ -d .git ]; then
    echo "⚠️  Git repository already exists in this directory"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get user information
echo "📝 Let's set up your Git configuration"
echo ""

read -p "Enter your name: " user_name
read -p "Enter your email (same as GitHub): " user_email

# Configure Git
git config --global user.name "$user_name"
git config --global user.email "$user_email"

echo "✅ Git configured with:"
echo "   Name: $user_name"
echo "   Email: $user_email"
echo ""

# Initialize repository if needed
if [ ! -d .git ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Repository initialized"
else
    echo "✅ Using existing repository"
fi
echo ""

# Add files
echo "📦 Adding files to Git..."
git add .
echo "✅ Files added"
echo ""

# Show status
echo "📊 Current status:"
git status
echo ""

# Create first commit
read -p "Create initial commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Initial commit: Mission Control v2.0 with all features"
    echo "✅ Initial commit created"
else
    echo "⏭️  Skipped commit - run 'git commit -m \"your message\"' manually"
fi
echo ""

# Connect to GitHub
echo "🔗 Connect to GitHub"
echo ""
echo "First, create a repository on GitHub:"
echo "  1. Go to https://github.com/new"
echo "  2. Name it: mission-control-v2"
echo "  3. Don't add README, .gitignore, or license"
echo "  4. Click 'Create repository'"
echo ""
read -p "Have you created the GitHub repository? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your GitHub username: " github_user
    read -p "Enter repository name (default: mission-control-v2): " repo_name
    repo_name=${repo_name:-mission-control-v2}
    
    github_url="https://github.com/$github_user/$repo_name.git"
    
    echo ""
    echo "🔗 Connecting to: $github_url"
    
    # Check if remote already exists
    if git remote get-url origin &> /dev/null; then
        echo "⚠️  Remote 'origin' already exists"
        git remote set-url origin "$github_url"
        echo "✅ Updated remote URL"
    else
        git remote add origin "$github_url"
        echo "✅ Remote added"
    fi
    
    echo ""
    read -p "Push to GitHub now? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📤 Pushing to GitHub..."
        echo ""
        echo "Note: You'll need to authenticate with GitHub"
        echo "      Use your Personal Access Token as password"
        echo ""
        
        git branch -M main
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 SUCCESS! Your code is now on GitHub!"
            echo ""
            echo "View it at: https://github.com/$github_user/$repo_name"
        else
            echo ""
            echo "❌ Push failed. Common issues:"
            echo "   1. Need Personal Access Token (not password)"
            echo "      Get one at: https://github.com/settings/tokens"
            echo "   2. Repository doesn't exist on GitHub"
            echo "   3. Wrong username or repository name"
            echo ""
            echo "Try again with: git push -u origin main"
        fi
    fi
else
    echo "ℹ️  Run these commands when ready:"
    echo "   git remote add origin https://github.com/YOUR-USERNAME/mission-control-v2.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   - View: GITHUB_SETUP_GUIDE.md for detailed instructions"
echo "   - Keep: GIT_QUICK_REFERENCE.md as a handy reference"
echo "   - Read: README.md to understand the project"
echo ""
echo "💡 Daily workflow:"
echo "   git pull          # Get latest changes"
echo "   # ... make changes ..."
echo "   git add ."
echo "   git commit -m \"What you did\""
echo "   git push          # Upload changes"
echo ""
echo "Happy coding! 🚀"
