#!/bin/bash
echo "Building TeleMsg Desktop for Linux..."
echo

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

# 清理旧的构建文件
if [ -d "dist" ]; then
    echo "Cleaning old build files..."
    rm -rf dist
fi
if [ -d "dist-electron" ]; then
    echo "Cleaning old electron build files..."
    rm -rf dist-electron
fi

# 构建应用
echo "Building web application..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Failed to build web application"
    exit 1
fi

echo "Building Linux executable..."
npm run build:linux
if [ $? -ne 0 ]; then
    echo "Error: Failed to build Linux executable"
    exit 1
fi

echo
echo "Build completed successfully!"
echo "Output directory: dist-electron"
echo

# 列出构建文件
if [ -d "dist-electron" ]; then
    echo "Generated files:"
    ls -la dist-electron/
fi
