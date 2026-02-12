# 🚀 GitHub Pages Deployment Guide

## Quick Deploy (3 Steps)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `tbo` (or any name you prefer)
3. **Don't** initialize with README (we already have code)
4. Click "Create repository"

### Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: TravelSphere app with all features"

# Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tbo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to GitHub Pages

```bash
# Deploy (this will build and publish to gh-pages branch)
npm run deploy
```

That's it! Your app will be live at:
**https://YOUR_USERNAME.github.io/tbo/**

---

## 📝 Important Notes

### 1. Update Base URL

If your repository name is different from `tbo`, update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/YOUR_REPO_NAME/', // Change this
  // ...
})
```

### 2. Environment Variables

The `.env` file is NOT deployed (it's in .gitignore for security).

For production, you have two options:

**Option A: Use Mock Data (Current Setup)**
- The app already falls back to mock data
- No API key needed
- Works immediately

**Option B: Add API Key to GitHub Secrets**
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add `VITE_OPENAI_API_KEY` as a secret
3. Update the build workflow to use it

### 3. Enable GitHub Pages

After deploying:

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **gh-pages** branch
4. Click **Save**
5. Wait 1-2 minutes for deployment

Your site will be live at: `https://YOUR_USERNAME.github.io/tbo/`

---

## 🔄 Update Deployment

Whenever you make changes:

```bash
# 1. Commit your changes
git add .
git commit -m "Your update message"
git push

# 2. Deploy
npm run deploy
```

---

## 🛠️ Troubleshooting

### Issue: 404 Error

**Solution**: Make sure `base` in `vite.config.ts` matches your repo name:
```typescript
base: '/tbo/', // Must match your GitHub repo name
```

### Issue: Blank Page

**Solution**: Check browser console for errors. Usually a base URL mismatch.

### Issue: API Not Working

**Solution**: The app uses mock data by default. This is intentional for the demo.

---

## 📊 What Gets Deployed

✅ All React components
✅ All CSS styles
✅ All images and assets
✅ Optimized production build
✅ Code splitting for performance
✅ Minified and compressed

❌ `.env` file (excluded for security)
❌ `node_modules` (not needed)
❌ Source TypeScript files (compiled to JS)

---

## 🎯 Features Available in Deployment

- ✅ Login page
- ✅ Destination browsing
- ✅ Confidence scores
- ✅ VR previews
- ✅ Trip planning
- ✅ Itinerary generation
- ✅ Booking system
- ✅ Special offers
- ✅ All with mock data

---

## 🔒 Security Notes

1. **API Key**: Not included in deployment (in .gitignore)
2. **Mock Data**: Used by default in production
3. **HTTPS**: GitHub Pages uses HTTPS automatically
4. **No Backend**: Frontend-only deployment

---

## 📱 Testing Deployment

After deployment, test these:

1. Open the live URL
2. Click "Try Demo Account"
3. Browse destinations
4. Plan a trip
5. Generate itinerary
6. Check offers tab
7. Test booking flow

---

## 🎨 Custom Domain (Optional)

To use a custom domain:

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. Add a `CNAME` file to `/public` folder with your domain
3. Configure DNS settings at your domain provider
4. Update GitHub Pages settings

---

## 📚 Additional Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router with GitHub Pages](https://create-react-app.dev/docs/deployment/#github-pages)

---

## ✅ Deployment Checklist

- [ ] Created GitHub repository
- [ ] Updated `base` in vite.config.ts
- [ ] Committed all code
- [ ] Pushed to GitHub
- [ ] Ran `npm run deploy`
- [ ] Enabled GitHub Pages in settings
- [ ] Tested live URL
- [ ] Verified all features work

---

**Your app is ready to deploy!** 🚀

Just follow the 3 steps above and your TravelSphere app will be live on the internet!
