#!/bin/bash

echo "🔍 Verifying deployment structure..."

# Check if we're in the right directory
echo "📁 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

# Check if dist directory exists
if [ -d "dist" ]; then
    echo "✅ dist directory found"
    echo "📁 dist directory contents:"
    ls -la dist/
    
    # Check if index.js exists
    if [ -f "dist/index.js" ]; then
        echo "✅ dist/index.js found"
        echo "📄 First few lines of index.js:"
        head -5 dist/index.js
    else
        echo "❌ dist/index.js not found"
        exit 1
    fi
else
    echo "❌ dist directory not found"
    echo "🔨 Running build..."
    npm run build
    
    if [ -d "dist" ]; then
        echo "✅ Build successful, dist directory created"
    else
        echo "❌ Build failed"
        exit 1
    fi
fi

# Check package.json
echo "📦 Package.json main field:"
node -e "console.log(require('./package.json').main)"

# Check if the main file exists
MAIN_FILE=$(node -e "console.log(require('./package.json').main)")
if [ -f "$MAIN_FILE" ]; then
    echo "✅ Main file $MAIN_FILE exists"
else
    echo "❌ Main file $MAIN_FILE not found"
    exit 1
fi

echo "✅ Deployment verification completed successfully" 