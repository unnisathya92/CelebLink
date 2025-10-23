#!/bin/bash

# CelebLink Deployment Script
echo "🚀 Starting CelebLink deployment..."

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Add all changes
echo "📦 Adding changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "✅ No changes to commit"
else
  # Commit changes
  echo "💾 Committing changes..."
  git commit -m "Deploy: $(date +"%Y-%m-%d %H:%M:%S")" -m "🤖 Generated with Claude Code" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push origin $CURRENT_BRANCH

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✨ Deployment complete!"
echo "🔗 Your app will be live at the URL shown above"
