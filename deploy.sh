#!/bin/bash

# 🕉️ ABCSteps Vivek Platform - Divine One-Click Deployment Script 🕉️
# विद्या ददाति विनयं - Knowledge bestows humility

echo "🔱 Starting Divine Deployment Process..."
echo "Choose your cloud chariot:"
echo "1) Vercel (Recommended - Fastest)"
echo "2) Netlify"
echo "3) Railway"
echo "4) Fly.io"
echo "5) Render"
echo "6) All platforms"

read -p "Enter your choice (1-6): " choice

# Build the application first
echo "🏗️ Building the sacred application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check errors above."
    exit 1
fi

echo "✅ Build successful! Deploying to chosen platform..."

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        npm run deploy:vercel
        ;;
    2)
        echo "🌐 Deploying to Netlify..."
        npm run deploy:netlify
        ;;
    3)
        echo "🚂 Deploying to Railway..."
        npm run deploy:railway
        ;;
    4)
        echo "✈️ Deploying to Fly.io..."
        npm run deploy:fly
        ;;
    5)
        echo "🎨 Deploying to Render..."
        npm run deploy:render
        ;;
    6)
        echo "🌟 Deploying to ALL platforms..."
        npm run deploy:vercel &
        npm run deploy:netlify &
        npm run deploy:railway &
        wait
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo "🙏 Deployment complete! May knowledge flow freely through your platform."
echo "॥ सा विद्या या विमुक्तये ॥"