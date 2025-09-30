# Creating a Homebrew Package for K8s File Transfer

This guide explains how to convert the Kubernetes File Transfer application into a Homebrew package.

## Prerequisites

1. **GitHub Repository**: Create a public GitHub repository for your project
2. **GitHub Releases**: Upload the built application files as GitHub releases
3. **Homebrew Tap**: Create a Homebrew tap repository (optional but recommended)

## Step 1: Prepare the Application for Distribution

### 1.1 Build the Application
```bash
# Build the production version
npm run dist

# This creates files in the dist/ directory:
# - Kubernetes File Transfer-1.0.0-mac.zip (Intel)
# - Kubernetes File Transfer-1.0.0-arm64-mac.zip (Apple Silicon)
# - Kubernetes File Transfer-1.0.0.dmg (Intel)
# - Kubernetes File Transfer-1.0.0-arm64.dmg (Apple Silicon)
```

### 1.2 Create GitHub Repository
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Kubernetes File Transfer GUI"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/k8s-file-transfer.git
git branch -M main
git push -u origin main
```

### 1.3 Create GitHub Release
1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `Kubernetes File Transfer v1.0.0`
5. Upload the following files:
   - `Kubernetes File Transfer-1.0.0-mac.zip`
   - `Kubernetes File Transfer-1.0.0-arm64-mac.zip`
   - `Kubernetes File Transfer-1.0.0.dmg`
   - `Kubernetes File Transfer-1.0.0-arm64.dmg`

## Step 2: Calculate SHA256 Checksums

```bash
# Calculate checksums for the zip files
shasum -a 256 "dist/Kubernetes File Transfer-1.0.0-mac.zip"
shasum -a 256 "dist/Kubernetes File Transfer-1.0.0-arm64-mac.zip"
```

## Step 3: Create Homebrew Formula

### 3.1 Option A: Submit to Homebrew Core (Recommended for popular tools)
1. Fork the [Homebrew/homebrew-core](https://github.com/Homebrew/homebrew-core) repository
2. Create a new formula file: `Formula/k/k8s-file-transfer.rb`
3. Submit a pull request

### 3.2 Option B: Create Your Own Tap (Easier for personal projects)

#### Create a Homebrew Tap Repository
```bash
# Create a new repository named: homebrew-k8s-tools
# Repository URL: https://github.com/YOUR_USERNAME/homebrew-k8s-tools
```

#### Add the Formula
Create `Formula/k8s-file-transfer.rb` in your tap repository:

```ruby
class K8sFileTransfer < Formula
  desc "GUI application for transferring files between local machine and Kubernetes pods"
  homepage "https://github.com/YOUR_USERNAME/k8s-file-transfer"
  version "1.0.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/YOUR_USERNAME/k8s-file-transfer/releases/download/v1.0.0/Kubernetes.File.Transfer-1.0.0-mac.zip"
      sha256 "YOUR_INTEL_SHA256_HERE"
    else
      url "https://github.com/YOUR_USERNAME/k8s-file-transfer/releases/download/v1.0.0/Kubernetes.File.Transfer-1.0.0-arm64-mac.zip"
      sha256 "YOUR_ARM64_SHA256_HERE"
    end
  end

  depends_on "kubectl"
  depends_on macos: ">= :big_sur"

  def install
    prefix.install "Kubernetes File Transfer.app"
    bin.write_exec_script "#{prefix}/Kubernetes File Transfer.app/Contents/MacOS/Kubernetes File Transfer"
  end

  def caveats
    <<~EOS
      To use k8s-file-transfer, you need:
      1. kubectl installed and configured with access to your Kubernetes clusters
      2. Proper permissions to list pods and execute kubectl cp commands

      Launch the application from Applications folder or run:
        k8s-file-transfer

      For more information, visit: https://github.com/YOUR_USERNAME/k8s-file-transfer
    EOS
  end

  test do
    assert_predicate prefix/"Kubernetes File Transfer.app", :exist?
  end
end
```

## Step 4: Test the Formula

```bash
# Add your tap
brew tap YOUR_USERNAME/k8s-tools

# Install the formula
brew install k8s-file-transfer

# Test the installation
k8s-file-transfer --version
```

## Step 5: Usage Instructions

### Installation
```bash
# Add the tap
brew tap YOUR_USERNAME/k8s-tools

# Install the application
brew install k8s-file-transfer
```

### Usage
```bash
# Launch the GUI application
k8s-file-transfer

# Or open from Applications folder
open "/Applications/Kubernetes File Transfer.app"
```

## Step 6: Maintenance

### Updating the Formula
1. Build new version: `npm run dist`
2. Create new GitHub release with updated files
3. Update the formula with new version and SHA256 checksums
4. Test the updated formula

### Version Management
```bash
# Update version in package.json
npm version patch  # or minor, major

# Rebuild and release
npm run dist
# Upload to GitHub releases
# Update Homebrew formula
```

## Alternative Distribution Methods

### 1. Direct DMG Distribution
- Distribute the `.dmg` files directly
- Users can download and install manually
- No Homebrew dependency

### 2. Mac App Store
- Requires Apple Developer account
- More complex submission process
- Wider distribution reach

### 3. Electron Auto-Updater
- Built-in update mechanism
- Requires update server setup
- Seamless user experience

## Security Considerations

1. **Code Signing**: The application is already signed with your developer certificate
2. **Notarization**: Consider notarizing for better macOS compatibility
3. **Checksums**: Always provide SHA256 checksums for verification
4. **HTTPS**: Use HTTPS URLs for all downloads

## Example Complete Workflow

```bash
# 1. Build the application
npm run dist

# 2. Calculate checksums
shasum -a 256 "dist/Kubernetes File Transfer-1.0.0-mac.zip"
shasum -a 256 "dist/Kubernetes File Transfer-1.0.0-arm64-mac.zip"

# 3. Create GitHub release and upload files

# 4. Update Homebrew formula with new checksums

# 5. Test installation
brew uninstall k8s-file-transfer  # if previously installed
brew install k8s-file-transfer

# 6. Verify
k8s-file-transfer
```

This approach makes your Kubernetes File Transfer tool easily installable via Homebrew, providing a professional distribution method for macOS users.
