#!/bin/bash

# Script to update Electron icon in development
# This replaces the default Electron icon with our custom icon

echo "🎨 Updating Electron icon..."

# Check if our custom icon exists
if [ ! -f "build-icons/icon.icns" ]; then
    echo "❌ Custom icon not found at build-icons/icon.icns"
    echo "   Run the icon generation process first"
    exit 1
fi

# Find Electron app bundle
ELECTRON_APP="node_modules/electron/dist/Electron.app"
ELECTRON_ICON="$ELECTRON_APP/Contents/Resources/electron.icns"

if [ ! -f "$ELECTRON_ICON" ]; then
    echo "❌ Electron app not found at $ELECTRON_APP"
    echo "   Make sure Electron is installed"
    exit 1
fi

# Backup original icon (if not already backed up)
if [ ! -f "$ELECTRON_ICON.backup" ]; then
    echo "📦 Backing up original Electron icon..."
    cp "$ELECTRON_ICON" "$ELECTRON_ICON.backup"
fi

# Replace with our custom icon
echo "🔄 Replacing Electron icon..."
cp "build-icons/icon.icns" "$ELECTRON_ICON"

# Clear icon cache
echo "🧹 Clearing icon cache..."
rm -rf ~/Library/Caches/com.apple.iconservices.store 2>/dev/null || true

# Restart Dock to refresh icons
echo "🔄 Restarting Dock..."
killall Dock 2>/dev/null || true

echo "✅ Electron icon updated successfully!"
echo "   The new icon should appear in the dock when you run the app"
