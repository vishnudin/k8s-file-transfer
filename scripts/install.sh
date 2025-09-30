#!/bin/bash

# K8s File Transfer Installation Script
# This script downloads and installs the latest version of K8s File Transfer

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="your-username"  # Replace with actual GitHub username
REPO_NAME="k8s-file-transfer"
APP_NAME="Kubernetes File Transfer"
INSTALL_DIR="/Applications"

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🚀 K8s File Transfer Installer${NC}"
echo "This script will download and install the latest version of K8s File Transfer"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This installer is only for macOS"
    exit 1
fi

# Detect architecture
ARCH=$(uname -m)
if [[ "$ARCH" == "x86_64" ]]; then
    ARCH_NAME="Intel"
    FILE_SUFFIX=""
elif [[ "$ARCH" == "arm64" ]]; then
    ARCH_NAME="Apple Silicon"
    FILE_SUFFIX="-arm64"
else
    print_error "Unsupported architecture: $ARCH"
    exit 1
fi

print_info "Detected: macOS $ARCH_NAME"

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v curl &> /dev/null; then
    print_error "curl is required but not installed"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    print_warning "kubectl is not installed. K8s File Transfer requires kubectl to function."
    echo "Install kubectl first: https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_step "Prerequisites check completed"

# Get latest release info
echo -e "${BLUE}🔍 Fetching latest release information...${NC}"
LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest")

if [[ $? -ne 0 ]]; then
    print_error "Failed to fetch release information"
    exit 1
fi

VERSION=$(echo "$LATEST_RELEASE" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
if [[ -z "$VERSION" ]]; then
    print_error "Could not determine latest version"
    exit 1
fi

print_info "Latest version: $VERSION"

# Construct download URL
DMG_NAME="Kubernetes File Transfer-${VERSION#v}${FILE_SUFFIX}.dmg"
DOWNLOAD_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/download/$VERSION/$DMG_NAME"

print_info "Download URL: $DOWNLOAD_URL"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
DMG_PATH="$TEMP_DIR/$DMG_NAME"

# Download the DMG
echo -e "${BLUE}⬇️  Downloading $DMG_NAME...${NC}"
if ! curl -L -o "$DMG_PATH" "$DOWNLOAD_URL"; then
    print_error "Failed to download $DMG_NAME"
    rm -rf "$TEMP_DIR"
    exit 1
fi

print_step "Download completed"

# Verify the download
if [[ ! -f "$DMG_PATH" ]]; then
    print_error "Downloaded file not found"
    rm -rf "$TEMP_DIR"
    exit 1
fi

FILE_SIZE=$(stat -f%z "$DMG_PATH" 2>/dev/null || echo "0")
if [[ "$FILE_SIZE" -lt 1000000 ]]; then  # Less than 1MB is suspicious
    print_error "Downloaded file seems too small (${FILE_SIZE} bytes)"
    rm -rf "$TEMP_DIR"
    exit 1
fi

print_step "Download verified"

# Mount the DMG
echo -e "${BLUE}💿 Mounting disk image...${NC}"
MOUNT_POINT=$(hdiutil attach "$DMG_PATH" -nobrowse -quiet | grep "/Volumes" | awk '{print $3}')

if [[ -z "$MOUNT_POINT" ]]; then
    print_error "Failed to mount disk image"
    rm -rf "$TEMP_DIR"
    exit 1
fi

print_step "Disk image mounted at $MOUNT_POINT"

# Check if app exists in the mounted volume
APP_SOURCE="$MOUNT_POINT/$APP_NAME.app"
if [[ ! -d "$APP_SOURCE" ]]; then
    print_error "Application not found in disk image"
    hdiutil detach "$MOUNT_POINT" -quiet
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Check if app already exists
APP_DEST="$INSTALL_DIR/$APP_NAME.app"
if [[ -d "$APP_DEST" ]]; then
    print_warning "K8s File Transfer is already installed"
    read -p "Replace existing installation? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        hdiutil detach "$MOUNT_POINT" -quiet
        rm -rf "$TEMP_DIR"
        exit 0
    fi
    
    echo -e "${BLUE}🗑️  Removing existing installation...${NC}"
    rm -rf "$APP_DEST"
fi

# Copy the application
echo -e "${BLUE}📦 Installing application...${NC}"
if ! cp -R "$APP_SOURCE" "$INSTALL_DIR/"; then
    print_error "Failed to copy application to $INSTALL_DIR"
    hdiutil detach "$MOUNT_POINT" -quiet
    rm -rf "$TEMP_DIR"
    exit 1
fi

print_step "Application installed to $APP_DEST"

# Unmount the DMG
echo -e "${BLUE}💿 Cleaning up...${NC}"
hdiutil detach "$MOUNT_POINT" -quiet
rm -rf "$TEMP_DIR"

print_step "Cleanup completed"

# Set executable permissions (just in case)
chmod +x "$APP_DEST/Contents/MacOS/"*

echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
echo ""
echo -e "${BLUE}📱 How to launch:${NC}"
echo "• From Finder: Go to Applications and double-click 'Kubernetes File Transfer'"
echo "• From Terminal: open '$APP_DEST'"
echo "• From Spotlight: Press Cmd+Space and type 'Kubernetes File Transfer'"
echo ""
echo -e "${BLUE}🔧 Prerequisites reminder:${NC}"
echo "• Make sure kubectl is installed and configured"
echo "• Ensure you have access to your Kubernetes clusters"
echo "• The app may require permission on first launch (System Preferences > Security & Privacy)"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• GitHub: https://github.com/$REPO_OWNER/$REPO_NAME"
echo "• Issues: https://github.com/$REPO_OWNER/$REPO_NAME/issues"
echo ""
echo -e "${GREEN}Happy file transferring! 🚀${NC}"
