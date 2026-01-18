# 🚀 Quick Deploy to GitHub Pages

## Step-by-Step (5 Minutes)

### 1️⃣ Install Dependencies

```bash
npm install
```

If permission error:
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

---

### 2️⃣ Update Repository Name (if needed)

Open `vite.config.ts` and change this line to match your GitHub repository name:

```typescript
base: '/meetings-quality/' // ← Change to your repo name
```

**Examples:**
- If repo is `my-app`: `base: '/my-app/'`
- If repo is `meetings-quality`: `base: '/meetings-quality/'` ✅ (already set)

---

### 3️⃣ Commit Your Code

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### 4️⃣ Deploy!

```bash
npm run deploy
```

This will:
- ✅ Build your app
- ✅ Create `gh-pages` branch
- ✅ Push to GitHub

---

### 5️⃣ Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

---

### 6️⃣ Access Your Site

Wait 1-3 minutes, then visit:

```
https://[your-username].github.io/meetings-quality/
```

**Example:**
```
https://egordultsev.github.io/meetings-quality/
```

---

## 🔄 Update Your Site

Whenever you make changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
npm run deploy
```

Done! Changes live in 1-3 minutes.

---

## ⚠️ Common Issues

### Blank page or 404?
→ Check `base` in `vite.config.ts` matches your repo name

### Permission errors?
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

### CSS not loading?
→ Make sure `base` ends with `/` like `/repo-name/`

---

## 📋 Quick Commands

```bash
npm install          # Install dependencies
npm run dev          # Run locally
npm run build        # Build for production
npm run preview      # Test build locally
npm run deploy       # Deploy to GitHub Pages
```

---

## ✅ Checklist

Before deploying:
- [ ] `base` in `vite.config.ts` = your repo name
- [ ] Code committed and pushed
- [ ] `npm run build` works

After deploying:
- [ ] GitHub Pages enabled
- [ ] Site loads at GitHub Pages URL
- [ ] All features work

---

**Need more details?** See `DEPLOYMENT.md`

**Happy deploying! 🎉**
