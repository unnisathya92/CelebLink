# CelebLink Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy (Easiest)

1. **Connect GitHub to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository: `unnisathya92/CelebLink`
   - Vercel will auto-detect Next.js settings

2. **Add Environment Variables**:
   - In Vercel dashboard, go to: Settings → Environment Variables
   - Add: `OPENAI_API_KEY` = `your-openai-api-key`
   - Click "Deploy"

3. **Done!** Your app will be live at `https://celeblink.vercel.app` (or similar)

### Option 2: CLI Deploy (Automated)

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Run Deploy Script**:
   ```bash
   npm run deploy
   ```
   OR
   ```bash
   ./deploy.sh
   ```

3. **Production Deploy**:
   ```bash
   npm run vercel:prod
   ```

## 🔧 Environment Variables Setup

### For Vercel:
```bash
# In Vercel Dashboard → Settings → Environment Variables
OPENAI_API_KEY=your-openai-api-key-here
```

### For Local Development:
Create `.env` file:
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

## 📦 GitHub Actions Auto-Deploy

Every push to `main` or `claude/**` branches automatically deploys to Vercel!

**Setup Required**:
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN`: Get from vercel.com/account/tokens
   - `VERCEL_ORG_ID`: Get from vercel.com/[team]/settings
   - `VERCEL_PROJECT_ID`: Get from vercel.com/[team]/[project]/settings
   - `OPENAI_API_KEY`: Your OpenAI API key

## 🌐 Other Deployment Options

### Netlify:
```bash
npm run build
netlify deploy --prod --dir=.next
```

### Railway:
```bash
railway up
```

### Docker:
```dockerfile
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Then:
```bash
docker build -t celeblink .
docker run -p 3000:3000 -e OPENAI_API_KEY=your-key celeblink
```

## ✅ Verify Deployment

After deployment:
1. Visit your live URL
2. Test searching for two celebrities
3. Check that connections are being found
4. Verify images are loading correctly

## 🔍 Troubleshooting

### Build Fails:
- Check that `OPENAI_API_KEY` is set in environment variables
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

### Images Not Loading:
- Check CORS settings
- Verify Wikimedia/Wikidata API is accessible
- Check browser console for errors

### API Errors:
- Verify OpenAI API key is valid and has credits
- Check API rate limits
- Review server logs in Vercel dashboard

## 📊 Monitoring

- **Vercel Dashboard**: View deployment logs, analytics, and errors
- **GitHub Actions**: Monitor automated deployments
- **Vercel Analytics**: Track performance and usage

## 🔄 Update Deployment

Simply push to GitHub:
```bash
git add .
git commit -m "Update: description"
git push
```

Vercel will automatically rebuild and deploy!

## 🎉 That's It!

Your CelebLink app is now live and will auto-deploy on every push to GitHub!
