#!/bin/bash

# GitHub Release Creation Script for Kubernetes File Transfer
# This script creates a GitHub release and uploads distribution files

set -e

VERSION="1.0.0"
REPO="vishnudin/k8s-file-transfer"
RELEASE_NAME="Kubernetes File Transfer v${VERSION}"
TAG_NAME="v${VERSION}"

# Release notes
RELEASE_NOTES="🎉 **Initial Release: Kubernetes File Transfer v${VERSION}**

A desktop application that simplifies file operations between your local machine and Kubernetes pods!

## ✨ **Features**
- **Bidirectional file transfer**: Upload and download files with drag & drop
- **Multi-container support**: Automatically detects containers in pods  
- **Real-time progress tracking**: See transfer status and history
- **Clean interface**: Built with Electron + React + Material-UI
- **Custom transfer icon**: Professional branding with blue gradient design

## 📥 **Installation**

### macOS
- **Intel Macs**: Download \`Kubernetes File Transfer-1.0.0.dmg\`
- **Apple Silicon**: Download \`Kubernetes File Transfer-1.0.0-arm64.dmg\`
- **ZIP files**: Also available for both architectures

### Homebrew (Coming Soon)
\`\`\`bash
brew install vishnudin/tap/k8s-file-transfer
\`\`\`

## 🔧 **Prerequisites**
- kubectl installed and configured
- Access to a Kubernetes cluster

## 🚀 **Usage**
1. Launch the application
2. Select your namespace and pod
3. Choose container (if multiple)
4. Drag & drop files or use the file picker
5. Monitor transfer progress in real-time

## 🛠 **Tech Stack**
- Electron + React + Material-UI
- kubectl integration
- macOS code signing and notarization ready

## 🐛 **Known Issues**
- Windows and Linux support coming in future releases
- Large file transfers (>1GB) may take time

## 🤝 **Contributing**
Contributions welcome! Please see our GitHub repository for guidelines.

---
**Full Changelog**: https://github.com/${REPO}/commits/v${VERSION}"

echo "🚀 Creating GitHub Release for Kubernetes File Transfer v${VERSION}"
echo "Repository: ${REPO}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    echo ""
    echo "Or install via Homebrew:"
    echo "brew install gh"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

# Check if dist files exist
DIST_FILES=(
    "dist/Kubernetes File Transfer-1.0.0.dmg"
    "dist/Kubernetes File Transfer-1.0.0-arm64.dmg"
    "dist/Kubernetes File Transfer-1.0.0-mac.zip"
    "dist/Kubernetes File Transfer-1.0.0-arm64-mac.zip"
)

echo "📋 Checking distribution files..."
for file in "${DIST_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Missing file: $file"
        echo "Please run 'npm run build' first"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

echo ""
echo "📦 Creating release..."

# Create the release
gh release create "$TAG_NAME" \
    --repo "$REPO" \
    --title "$RELEASE_NAME" \
    --notes "$RELEASE_NOTES" \
    "${DIST_FILES[@]}"

echo ""
echo "🎉 Release created successfully!"
echo "🔗 View at: https://github.com/${REPO}/releases/tag/${TAG_NAME}"
echo ""
echo "📋 Next steps:"
echo "1. Update Homebrew formula URLs if needed"
echo "2. Announce on social media"
echo "3. Update documentation"
