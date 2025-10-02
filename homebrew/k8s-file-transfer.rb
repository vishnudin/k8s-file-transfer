class K8sFileTransfer < Formula
  desc "GUI application for transferring files between local machine and Kubernetes pods"
  homepage "https://github.com/vishnudin/k8s-file-transfer"
  version "1.0.2"
  license "MIT"

  on_macos do
    if Hardware::CPU.intel?
      url "https://github.com/vishnudin/k8s-file-transfer/releases/download/v1.0.2/Kubernetes.File.Transfer-1.0.2-mac.zip"
      sha256 "0c4c07df3403daeb317add40dc41e28c8fc546ca2d09ec887d07831bed3eaf94"
    else
      url "https://github.com/vishnudin/k8s-file-transfer/releases/download/v1.0.2/Kubernetes.File.Transfer-1.0.2-arm64-mac.zip"
      sha256 "26fbf333a6f91b338a8410a231a1f20f61890fa8cf6878602229878898c3707c"
    end
  end

  depends_on "kubectl"

  # Skip automatic linkage fixing for Electron apps
  def self.needs_linkage_fixing?
    false
  end

  def install
    prefix.install "Kubernetes File Transfer.app"

    # Create a symlink in bin for command line access
    (bin/"k8s-file-transfer").write <<~EOS
      #!/bin/bash
      exec "#{prefix}/Kubernetes File Transfer.app/Contents/MacOS/Kubernetes File Transfer" "$@"
    EOS
  end

  def caveats
    <<~EOS
      To use k8s-file-transfer, you need:
      1. kubectl installed and configured with access to your Kubernetes clusters
      2. Proper permissions to list pods and execute kubectl cp commands

      The application has been installed to:
        #{prefix}/Kubernetes File Transfer.app

      You can launch it with:
        k8s-file-transfer

      Or open it directly:
        open "#{prefix}/Kubernetes File Transfer.app"

      For more information, visit: https://github.com/vishnudin/k8s-file-transfer
    EOS
  end

  test do
    assert_predicate prefix/"Kubernetes File Transfer.app", :exist?
    assert_predicate bin/"k8s-file-transfer", :exist?
  end
end
