#!/bin/bash

echo "🚀 Starting Render.com deployment..."

# Check if we're in production environment
if [ "$NODE_ENV" = "production" ]; then
    echo "📊 Production environment detected"
    
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