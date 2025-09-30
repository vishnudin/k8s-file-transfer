#!/bin/bash

# Homebrew Tap Setup Script for Kubernetes File Transfer
# This script helps set up a Homebrew tap repository

set -e

TAP_REPO="homebrew-tap"
GITHUB_USER="vishnudin"
FORMULA_NAME="k8s-file-transfer"

echo "🍺 Setting up Homebrew Tap for Kubernetes File Transfer"
echo "Tap repository: ${GITHUB_USER}/${TAP_REPO}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

echo "📋 Instructions for setting up Homebrew Tap:"
echo ""
echo "1️⃣  Create a new repository called 'homebrew-tap':"
echo "   gh repo create ${GITHUB_USER}/${TAP_REPO} --public --description \"Homebrew tap for Kubernetes File Transfer and other tools\""
echo ""
echo "2️⃣  Clone the repository:"
echo "   git clone https://github.com/${GITHUB_USER}/${TAP_REPO}.git"
echo "   cd ${TAP_REPO}"
echo ""
echo "3️⃣  Create the Formula directory:"
echo "   mkdir -p Formula"
echo ""
echo "4️⃣  Copy the formula file:"
echo "   cp ../k8s-file-transfer/homebrew/${FORMULA_NAME}.rb Formula/"
echo ""
echo "5️⃣  Commit and push:"
echo "   git add Formula/${FORMULA_NAME}.rb"
echo "   git commit -m \"Add ${FORMULA_NAME} formula\""
echo "   git push origin main"
echo ""
echo "6️⃣  Test the tap locally:"
echo "   brew tap ${GITHUB_USER}/tap"
echo "   brew install ${FORMULA_NAME}"
echo ""
echo "🎯 **Alternative: Automated Setup**"
echo "Would you like to run the automated setup? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Running automated setup..."
    
    # Create the repository
    echo "📦 Creating repository..."
    gh repo create "${GITHUB_USER}/${TAP_REPO}" --public --description "Homebrew tap for Kubernetes File Transfer and other tools" || echo "Repository might already exist"
    
    # Clone to a temporary directory
    TEMP_DIR=$(mktemp -d)
    echo "📥 Cloning to temporary directory: $TEMP_DIR"
    cd "$TEMP_DIR"
    git clone "https://github.com/${GITHUB_USER}/${TAP_REPO}.git"
    cd "${TAP_REPO}"
    
    # Create Formula directory
    echo "📁 Creating Formula directory..."
    mkdir -p Formula
    
    # Copy formula file
    echo "📄 Copying formula file..."
    cp "${OLDPWD}/homebrew/${FORMULA_NAME}.rb" "Formula/"
    
    # Create README
    echo "📝 Creating README..."
    cat > README.md << EOF
# Homebrew Tap for ${GITHUB_USER}

This is a Homebrew tap containing formulas for various tools.

## Installation

\`\`\`bash
brew tap ${GITHUB_USER}/tap
\`\`\`

## Available Formulas

### k8s-file-transfer

A desktop application for easy file transfers with Kubernetes pods.

\`\`\`bash
brew install k8s-file-transfer
\`\`\`

**Features:**
- Bidirectional file transfer with K8s pods
- Multi-container support
- Real-time progress tracking
- Built with Electron + React

**Prerequisites:**
- kubectl installed and configured

## Usage

After installation, launch the application:
\`\`\`bash
# The app will be installed to /Applications on macOS
open "/Applications/Kubernetes File Transfer.app"
\`\`\`

## Issues

Please report issues at: https://github.com/${GITHUB_USER}/k8s-file-transfer/issues
EOF
    
    # Commit and push
    echo "💾 Committing and pushing..."
    git add .
    git commit -m "Initial tap setup with ${FORMULA_NAME} formula

- Add ${FORMULA_NAME} formula for Kubernetes File Transfer
- Add README with installation instructions
- Support for both Intel and Apple Silicon Macs"
    git push origin main
    
    echo ""
    echo "✅ Homebrew tap setup complete!"
    echo "🔗 Repository: https://github.com/${GITHUB_USER}/${TAP_REPO}"
    echo ""
    echo "🧪 Test the installation:"
    echo "   brew tap ${GITHUB_USER}/tap"
    echo "   brew install ${FORMULA_NAME}"
    
    # Cleanup
    cd "$OLDPWD"
    rm -rf "$TEMP_DIR"
else
    echo ""
    echo "📋 Manual setup instructions provided above."
    echo "Copy the formula file from: homebrew/${FORMULA_NAME}.rb"
fi

echo ""
echo "🎉 Homebrew tap is ready!"
echo "Users can now install with:"
echo "   brew tap ${GITHUB_USER}/tap"
echo "   brew install ${FORMULA_NAME}"
