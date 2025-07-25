#!/bin/bash

echo "🚀 Starting Render.com deployment..."

# Debug information
echo "📁 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

# Check if we're in production environment
if [ "$NODE_ENV" = "production" ]; then
    echo "📊 Production environment detected"
    
    # Verify build output
    echo "🔍 Verifying build output..."
    if [ -d "dist" ]; then
        echo "✅ dist directory found"
        echo "📁 dist directory contents:"
        ls -la dist/
        
        if [ -f "dist/index.js" ]; then
            echo "✅ dist/index.js found"
            echo "📄 First few lines of dist/index.js:"
            head -5 dist/index.js
        else
            echo "❌ dist/index.js not found"
            echo "🔨 Attempting to rebuild..."
            npm run build
            if [ -f "dist/index.js" ]; then
                echo "✅ Rebuild successful"
            else
                echo "❌ Rebuild failed"
                exit 1
            fi
        fi
    else
        echo "❌ dist directory not found"
        echo "🔨 Running build..."
        npm run build
        if [ -d "dist" ]; then
            echo "✅ Build successful"
        else
            echo "❌ Build failed"
            exit 1
        fi
    fi
    
    # Wait for database to be ready
    echo "⏳ Waiting for database connection..."
    sleep 10
    
    # Run database migrations
    echo "🔄 Running database migrations..."
    npm run migrate
    
    # Run seed data if needed (optional)
    # echo "🌱 Running seed data..."
    # npm run seed
    
    echo "✅ Database setup completed"
else
    echo "🔧 Development environment - skipping production setup"
fi

echo "🎉 Deployment script completed" 