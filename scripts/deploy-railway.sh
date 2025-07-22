#!/bin/bash

# Railway Deployment Script
# This script helps you deploy your application to Railway

echo "🚀 Railway Deployment Script"
echo "=============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI found"
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
else
    echo "✅ Already logged in to Railway"
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Link to Railway project (if not already linked)
echo "🔗 Linking to Railway project..."
railway link

# Run migrations
echo "🗄️ Running database migrations..."
railway run npm run migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed"
else
    echo "❌ Migrations failed"
    exit 1
fi

# Optional: Run seeds
read -p "🌱 Do you want to run database seeds? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Running database seeds..."
    railway run npm run seed
fi

echo "🎉 Deployment completed!"
echo "📊 Check your Railway dashboard for the deployment status"
echo "🔗 Your app should be available at: https://your-app-name.railway.app" 