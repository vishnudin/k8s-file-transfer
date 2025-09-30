# Kubernetes File Transfer

A desktop application for transferring files between your local machine and Kubernetes pods with a user-friendly GUI.

![App Screenshot](https://via.placeholder.com/800x500?text=Kubernetes+File+Transfer+App)

## ✨ Features

- 🔄 **Bidirectional File Transfer**: Upload to and download from Kubernetes pods
- 🎯 **Multi-Container Support**: Automatically handles pods with multiple containers  
- 📊 **Real-time Progress**: Visual progress tracking for all transfers
- 📝 **Transfer History**: Keep track of all your file operations
- 🔧 **Context Management**: Easy switching between Kubernetes contexts and namespaces
- 🎨 **Modern UI**: Clean, intuitive interface built with Material-UI

## 🚀 Quick Start

### Download & Install

**Option 1: DMG (Recommended)**
1. Download the latest DMG from [Releases](https://github.com/vishnudin/k8s-file-transfer/releases)
2. Open the DMG and drag to Applications
3. Launch from Applications or Spotlight

**Option 2: ZIP Archive**
1. Download the ZIP from [Releases](https://github.com/vishnudin/k8s-file-transfer/releases)
2. Extract and move to Applications folder

### Prerequisites

- ✅ **kubectl** installed and configured
- ✅ **macOS** (Intel or Apple Silicon)
- ✅ **Kubernetes cluster access**

## 🎯 Usage

1. **Select Context** → Choose your kubectl context
2. **Pick Namespace** → Select the target namespace  
3. **Choose Pod** → Select the pod for file transfer
4. **Select Container** → Pick container (auto-selected for single-container pods)
5. **Transfer Files** → Upload or download with real-time progress

## 🛠️ Development

```bash
# Clone and setup
git clone https://github.com/vishnudin/k8s-file-transfer.git
cd k8s-file-transfer
npm install

# Development mode
npm run start-dev

# Production build
npm start

# Build distributables
npm run build
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Build and run production version |
| `npm run start-dev` | Development mode with hot reload |
| `npm run start-debug` | Run with DevTools enabled |
| `npm run build` | Build DMG and ZIP packages |

## 📦 Distribution Files

The `dist/` folder contains ready-to-distribute files:

- `Kubernetes File Transfer-1.0.0.dmg` (Intel Mac)
- `Kubernetes File Transfer-1.0.0-arm64.dmg` (Apple Silicon)
- ZIP archives for both architectures

## 🔧 Tech Stack

- **Frontend**: React + Material-UI
- **Desktop**: Electron
- **Kubernetes**: kubectl CLI integration
- **File Operations**: Native FS APIs + kubectl cp

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "kubectl not found" | Install kubectl and add to PATH |
| "No contexts available" | Configure kubectl contexts |
| Permission errors | Check Kubernetes RBAC permissions |
| App won't start | Download latest version, check Console.app |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Electron, React, and Material-UI**
