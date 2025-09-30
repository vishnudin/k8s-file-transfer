# K8s File Transfer - Distribution Guide

This guide provides a complete overview of how to package and distribute the Kubernetes File Transfer application as a Homebrew package.

## 🎯 Overview

The application is now configured for professional distribution with multiple installation methods:

1. **Homebrew Package** (Recommended for developers)
2. **Direct Download** (DMG files for manual installation)
3. **Automated Installation Script**
4. **Build from Source**

## 📦 What's Been Created

### 1. Build Configuration
- **Enhanced electron-builder config** in `package.json`
- **Universal builds** for Intel and Apple Silicon Macs
- **Multiple output formats**: DMG, ZIP, and app bundles
- **Code signing** with your developer certificate

### 2. Distribution Files
```
dist/
├── Kubernetes File Transfer-1.0.0.dmg              # Intel DMG
├── Kubernetes File Transfer-1.0.0-arm64.dmg        # Apple Silicon DMG
├── Kubernetes File Transfer-1.0.0-mac.zip          # Intel ZIP (for Homebrew)
├── Kubernetes File Transfer-1.0.0-arm64-mac.zip    # Apple Silicon ZIP (for Homebrew)
└── ...
```

### 3. Homebrew Formula
- **Template formula** in `homebrew/k8s-file-transfer.rb`
- **Architecture detection** for Intel vs Apple Silicon
- **Dependency management** (kubectl requirement)
- **Installation scripts** and caveats

### 4. Automation Scripts
- **`scripts/release.sh`**: Complete release automation
- **`scripts/install.sh`**: User-friendly installation script
- **`.github/workflows/release.yml`**: GitHub Actions for automated releases

### 5. Documentation
- **`HOMEBREW_SETUP.md`**: Detailed Homebrew packaging guide
- **Updated README.md**: Multiple installation options
- **Release notes template**: Professional release documentation

## 🚀 Quick Start: Creating Your First Release

### Step 1: Prepare Repository
```bash
# 1. Create GitHub repository
git init
git add .
git commit -m "Initial commit: K8s File Transfer"
git remote add origin https://github.com/YOUR_USERNAME/k8s-file-transfer.git
git push -u origin main
```

### Step 2: Create Release
```bash
# 2. Run the automated release script
./scripts/release.sh

# This creates everything in the release/ directory:
# - Built applications for both architectures
# - SHA256 checksums
# - Homebrew formula with correct checksums
# - Release notes
```

### Step 3: GitHub Release
```bash
# 3. Create GitHub release
git tag v1.0.0
git push origin v1.0.0

# Upload files from release/ directory to GitHub release
# Or use GitHub CLI:
gh release create v1.0.0 release/* --title "K8s File Transfer v1.0.0" --notes-file release/RELEASE_NOTES.md
```

### Step 4: Homebrew Tap
```bash
# 4. Create Homebrew tap repository
# Repository name: homebrew-k8s-tools
# Add the generated formula from release/k8s-file-transfer.rb
```

## 🍺 Homebrew Distribution Options

### Option A: Personal Tap (Recommended for starting)
1. Create repository: `homebrew-k8s-tools`
2. Add formula: `Formula/k8s-file-transfer.rb`
3. Users install with:
   ```bash
   brew tap YOUR_USERNAME/k8s-tools
   brew install k8s-file-transfer
   ```

### Option B: Homebrew Core (For popular tools)
1. Fork `Homebrew/homebrew-core`
2. Add formula to `Formula/k/k8s-file-transfer.rb`
3. Submit pull request
4. Users install with:
   ```bash
   brew install k8s-file-transfer
   ```

## 📋 Installation Methods for Users

### 1. Homebrew (Recommended)
```bash
brew tap YOUR_USERNAME/k8s-tools
brew install k8s-file-transfer
k8s-file-transfer
```

### 2. Automated Script
```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/k8s-file-transfer/main/scripts/install.sh | bash
```

### 3. Manual Download
- Download DMG from GitHub releases
- Drag to Applications folder
- Launch from Applications or Spotlight

### 4. Build from Source
```bash
git clone https://github.com/YOUR_USERNAME/k8s-file-transfer.git
cd k8s-file-transfer
npm install --legacy-peer-deps
npm start  # Development
npm run dist  # Production build
```

## 🔧 Maintenance

### Updating the Application
1. **Update version** in `package.json`
2. **Run release script**: `./scripts/release.sh`
3. **Create GitHub release** with new files
4. **Update Homebrew formula** with new checksums
5. **Test installation**: `brew reinstall k8s-file-transfer`

### Version Management
```bash
# Semantic versioning
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# Then run release process
./scripts/release.sh
```

## 🔐 Security & Signing

### Current Status
- ✅ **Code signed** with your Apple Developer certificate
- ⚠️ **Not notarized** (optional for distribution)
- ✅ **SHA256 checksums** provided for verification

### For Enhanced Security
1. **Apple Notarization**: Submit to Apple for notarization
2. **GPG Signing**: Sign releases with GPG key
3. **Reproducible Builds**: Ensure consistent build outputs

## 📊 Distribution Analytics

### Tracking Downloads
- **GitHub Releases**: Built-in download statistics
- **Homebrew Analytics**: Available through Homebrew
- **Custom Analytics**: Add telemetry to application (optional)

### User Feedback
- **GitHub Issues**: Bug reports and feature requests
- **Homebrew Issues**: Installation and packaging problems
- **User Surveys**: Collect usage feedback

## 🎯 Next Steps

### Immediate Actions
1. **Replace placeholders**: Update `YOUR_USERNAME` in all files
2. **Test locally**: Run `./scripts/release.sh` to verify build
3. **Create GitHub repo**: Upload code and create first release
4. **Set up Homebrew tap**: Create tap repository with formula

### Future Enhancements
1. **Auto-updater**: Implement in-app update mechanism
2. **Windows/Linux**: Extend to other platforms
3. **Mac App Store**: Submit for wider distribution
4. **CI/CD**: Automate entire release process

## 📞 Support

### For Developers
- **Build Issues**: Check `package.json` and dependencies
- **Signing Problems**: Verify Apple Developer certificate
- **Distribution Questions**: See `HOMEBREW_SETUP.md`

### For Users
- **Installation Help**: Use automated install script
- **Usage Questions**: Check main README.md
- **Bug Reports**: GitHub Issues

## 🎉 Success Metrics

Your application is ready for professional distribution when:
- ✅ Builds successfully for both Intel and Apple Silicon
- ✅ Creates proper DMG and ZIP files
- ✅ Generates valid Homebrew formula
- ✅ Installs correctly via all methods
- ✅ Launches and functions as expected
- ✅ Provides clear user documentation

**Congratulations! Your K8s File Transfer application is now ready for professional distribution via Homebrew and other channels.** 🚀
