#!/bin/bash

# K8s File Transfer Release Script
# This script automates the build and release process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="k8s-file-transfer"
VERSION=$(node -p "require('./package.json').version")
DIST_DIR="dist"
RELEASE_DIR="release"

echo -e "${BLUE}🚀 Starting release process for ${APP_NAME} v${VERSION}${NC}"

# Function to print colored output
print_step() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "git is not installed"
    exit 1
fi

print_step "Prerequisites check passed"

# Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf "$DIST_DIR"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
print_step "Cleaned previous builds"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
print_step "Dependencies installed"

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build
print_step "Application built successfully"

# Test the built application
echo -e "${BLUE}🧪 Testing built application...${NC}"
if [[ -f "dist/mac/Kubernetes File Transfer.app/Contents/MacOS/Kubernetes File Transfer" ]]; then
    print_step "Application executable found"
else
    print_error "Application executable not found"
    exit 1
fi

# Check if build files exist
INTEL_ZIP="$DIST_DIR/Kubernetes File Transfer-${VERSION}-mac.zip"
ARM64_ZIP="$DIST_DIR/Kubernetes File Transfer-${VERSION}-arm64-mac.zip"
INTEL_DMG="$DIST_DIR/Kubernetes File Transfer-${VERSION}.dmg"
ARM64_DMG="$DIST_DIR/Kubernetes File Transfer-${VERSION}-arm64.dmg"

if [[ ! -f "$INTEL_ZIP" ]]; then
    print_error "Intel ZIP file not found: $INTEL_ZIP"
    exit 1
fi

if [[ ! -f "$ARM64_ZIP" ]]; then
    print_error "ARM64 ZIP file not found: $ARM64_ZIP"
    exit 1
fi

print_step "Build files verified"

# Calculate checksums
echo -e "${BLUE}🔐 Calculating checksums...${NC}"
INTEL_SHA256=$(shasum -a 256 "$INTEL_ZIP" | cut -d' ' -f1)
ARM64_SHA256=$(shasum -a 256 "$ARM64_ZIP" | cut -d' ' -f1)

echo "Intel SHA256: $INTEL_SHA256"
echo "ARM64 SHA256: $ARM64_SHA256"

# Copy files to release directory
echo -e "${BLUE}📁 Preparing release files...${NC}"
cp "$INTEL_ZIP" "$RELEASE_DIR/"
cp "$ARM64_ZIP" "$RELEASE_DIR/"
cp "$INTEL_DMG" "$RELEASE_DIR/"
cp "$ARM64_DMG" "$RELEASE_DIR/"

# Create checksums file
cat > "$RELEASE_DIR/checksums.txt" << EOF
# SHA256 Checksums for K8s File Transfer v${VERSION}

## ZIP Files (for Homebrew)
Intel (x64):  $INTEL_SHA256  Kubernetes File Transfer-${VERSION}-mac.zip
ARM64:        $ARM64_SHA256  Kubernetes File Transfer-${VERSION}-arm64-mac.zip

## DMG Files (for manual installation)
Intel (x64):  $(shasum -a 256 "$INTEL_DMG" | cut -d' ' -f1)  Kubernetes File Transfer-${VERSION}.dmg
ARM64:        $(shasum -a 256 "$ARM64_DMG" | cut -d' ' -f1)  Kubernetes File Transfer-${VERSION}-arm64.dmg
EOF

print_step "Release files prepared"

# Create Homebrew formula with actual checksums
echo -e "${BLUE}🍺 Generating Homebrew formula...${NC}"
cat > "$RELEASE_DIR/k8s-file-transfer.rb" << EOF
class K8sFileTransfer < Formula
  desc "GUI application for transferring files between local machine and Kubernetes pods"
  homepage "https://github.com/your-username/k8s-file-transfer"
  version "${VERSION}"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/your-username/k8s-file-transfer/releases/download/v${VERSION}/Kubernetes.File.Transfer-${VERSION}-mac.zip"
      sha256 "${INTEL_SHA256}"
    else
      url "https://github.com/your-username/k8s-file-transfer/releases/download/v${VERSION}/Kubernetes.File.Transfer-${VERSION}-arm64-mac.zip"
      sha256 "${ARM64_SHA256}"
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

      For more information, visit: https://github.com/your-username/k8s-file-transfer
    EOS
  end

  test do
    assert_predicate prefix/"Kubernetes File Transfer.app", :exist?
  end
end
EOF

print_step "Homebrew formula generated"

# Create release notes
echo -e "${BLUE}📝 Generating release notes...${NC}"
cat > "$RELEASE_DIR/RELEASE_NOTES.md" << EOF
# K8s File Transfer v${VERSION}

## 🎉 Features
- **Intuitive GUI**: Clean, modern interface built with Material-UI
- **Bidirectional Transfer**: Upload files to pods or download files from pods
- **Kubernetes Integration**: Automatically detects kubectl contexts, namespaces, and pods
- **Multi-Container Support**: Automatically handles pods with multiple containers
- **Transfer History**: Keep track of all your file transfers with detailed logs
- **Progress Tracking**: Real-time progress indicators for file transfers
- **Error Handling**: Comprehensive error reporting and user feedback
- **Cross-Platform**: Works on macOS (Intel and Apple Silicon)

## 📦 Installation

### Via Homebrew (Recommended)
\`\`\`bash
# Add the tap (replace with your actual GitHub username)
brew tap your-username/k8s-tools

# Install the application
brew install k8s-file-transfer

# Launch
k8s-file-transfer
\`\`\`

### Manual Installation
1. Download the appropriate file for your Mac:
   - **Intel Macs**: \`Kubernetes File Transfer-${VERSION}.dmg\`
   - **Apple Silicon Macs**: \`Kubernetes File Transfer-${VERSION}-arm64.dmg\`
2. Open the DMG file
3. Drag the application to your Applications folder

## 🔧 Prerequisites
- macOS Big Sur (11.0) or later
- kubectl installed and configured
- Access to Kubernetes clusters

## 📋 Usage
1. Launch the application
2. Select your kubectl context, namespace, and pod
3. Choose transfer direction (upload/download)
4. Select files and specify paths
5. Monitor transfer progress

## 🔐 Verification
Verify the download integrity using SHA256 checksums:
\`\`\`
shasum -a 256 "Kubernetes File Transfer-${VERSION}-mac.zip"
# Should match: ${INTEL_SHA256}

shasum -a 256 "Kubernetes File Transfer-${VERSION}-arm64-mac.zip"  
# Should match: ${ARM64_SHA256}
\`\`\`

## 🐛 Known Issues
- First launch may require allowing the app in System Preferences > Security & Privacy
- Some kubectl contexts may require additional authentication

## 📞 Support
- GitHub Issues: https://github.com/your-username/k8s-file-transfer/issues
- Documentation: https://github.com/your-username/k8s-file-transfer/blob/main/README.md
EOF

print_step "Release notes generated"

# Display summary
echo -e "${BLUE}📊 Release Summary${NC}"
echo "Version: $VERSION"
echo "Files created in $RELEASE_DIR/:"
ls -la "$RELEASE_DIR/"

echo -e "${GREEN}🎉 Release preparation complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the files in the $RELEASE_DIR/ directory"
echo "2. Create a GitHub release with tag v$VERSION"
echo "3. Upload all files from $RELEASE_DIR/ to the GitHub release"
echo "4. Update your Homebrew tap repository with the new formula"
echo "5. Test the installation: brew install k8s-file-transfer"

echo -e "${BLUE}🔗 Useful commands:${NC}"
echo "git tag v$VERSION"
echo "git push origin v$VERSION"
echo "gh release create v$VERSION $RELEASE_DIR/* --title \"K8s File Transfer v$VERSION\" --notes-file $RELEASE_DIR/RELEASE_NOTES.md"
