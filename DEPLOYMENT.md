# 🚀 GitHub Pages Deployment Guide

Complete guide to deploy your MeetingQuality app to GitHub Pages.

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Git installed on your computer
- ✅ Your project pushed to GitHub repository

---

## ⚙️ Setup (Already Done!)

The following has been configured for you:

### 1. Package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.2.0"
  }
}
```

### 2. Vite Config
```typescript
{
  base: '/meetings-quality/' // Your repository name
}
```

---

## 🔧 Installation

Run this command to install gh-pages:

```bash
npm install
```

If you get permission errors, run:
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

---

## 🚀 Deployment Steps

### Step 1: Make Sure Your Code is Committed

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to GitHub Pages

```bash
npm run deploy
```

This command will:
1. Build your app (`npm run build`)
2. Create/update `gh-pages` branch
3. Push the built files to GitHub Pages

### Step 3: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

### Step 4: Wait for Deployment

- GitHub will deploy your site (takes 1-3 minutes)
- You'll see a green checkmark when ready
- Your site will be available at:
  ```
  https://[your-username].github.io/meetings-quality/
  ```

---

## 🔄 Updating Your Deployed App

Whenever you make changes:

```bash
# 1. Commit your changes
git add .
git commit -m "Your update message"
git push origin main

# 2. Deploy the updates
npm run deploy
```

That's it! Your changes will be live in 1-3 minutes.

---

## 🎯 Important Notes

### Base URL Configuration

The `base` in `vite.config.ts` must match your repository name:

```typescript
base: '/meetings-quality/' // Change if your repo has different name
```

**If your repository name is different:**
1. Open `vite.config.ts`
2. Change `base: '/meetings-quality/'` to `base: '/your-repo-name/'`
3. Redeploy: `npm run deploy`

### Custom Domain (Optional)

If you want to use a custom domain:

1. Create a file named `CNAME` in the `public` folder:
   ```
   yourdomain.com
   ```

2. Configure DNS at your domain provider:
   ```
   Type: CNAME
   Name: www (or @)
   Value: [your-username].github.io
   ```

3. In GitHub Settings → Pages, add your custom domain

---

## 🐛 Troubleshooting

### Issue: 404 Error on Deployed Site

**Solution:** Check that `base` in `vite.config.ts` matches your repository name exactly.

```typescript
// If repo is "my-app"
base: '/my-app/'

// If using custom domain or root
base: '/'
```

### Issue: Blank Page After Deployment

**Causes:**
1. Wrong base URL
2. Build errors

**Solutions:**
```bash
# Check build locally
npm run build
npm run preview

# If preview works, redeploy
npm run deploy
```

### Issue: CSS/JS Not Loading

**Solution:** Ensure `base` is set correctly in `vite.config.ts`

### Issue: Router Issues (404 on Refresh)

GitHub Pages doesn't support client-side routing by default.

**Solution:** Add a `404.html` that redirects to `index.html`:

Create `public/404.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>MeetingQuality</title>
    <script>
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/'">
  </head>
  <body></body>
</html>
```

Then in `index.html`, add before closing `</body>`:
```html
<script>
  (function(){
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect != location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

### Issue: npm Permission Errors

```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
npm install
```

---

## 📊 Deployment Checklist

Before deploying:

- [ ] All changes committed and pushed to GitHub
- [ ] `base` in `vite.config.ts` matches repository name
- [ ] `npm run build` works locally
- [ ] `npm run preview` shows app correctly
- [ ] No console errors in preview

After deploying:

- [ ] GitHub Pages enabled in repository settings
- [ ] `gh-pages` branch exists
- [ ] Site accessible at GitHub Pages URL
- [ ] All routes work correctly
- [ ] CSS and images load properly
- [ ] LocalStorage works (for login/data)

---

## 🎨 Environment Variables

If you're using environment variables (like API keys):

### For GitHub Pages:

1. **Don't commit `.env` files!**
2. Use GitHub Secrets for sensitive data
3. For public config, use `import.meta.env`:

```typescript
const apiUrl = import.meta.env.VITE_API_URL || 'default-value';
```

### In GitHub Actions (Advanced):

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_KEY: ${{ secrets.API_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🔗 Useful Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Deploy with clean cache
npm run build && npm run deploy
```

---

## 📱 Testing Your Deployment

### Local Testing Before Deploy:

```bash
# Build and preview
npm run build
npm run preview
```

Open `http://localhost:4173` and test:
- ✅ All pages load
- ✅ Navigation works
- ✅ Login/register works
- ✅ Data persists (localStorage)
- ✅ No console errors

### After Deployment:

Visit your GitHub Pages URL and test:
- ✅ Homepage loads
- ✅ Can navigate to all routes
- ✅ Can create meetings
- ✅ Can create tasks
- ✅ Mobile sidebar works
- ✅ All animations work

---

## 🎯 Quick Deploy Workflow

```bash
# 1. Make changes to your code
# ... edit files ...

# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Add new feature"
git push origin main

# 4. Deploy
npm run deploy

# 5. Wait 1-3 minutes and check your site!
```

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [gh-pages Package](https://github.com/tschaub/gh-pages)

---

## 🎉 Success!

Once deployed, share your app:
```
https://[your-username].github.io/meetings-quality/
```

**Example:**
```
https://egordultsev.github.io/meetings-quality/
```

---

## 💡 Pro Tips

1. **Always test locally** before deploying
2. **Use meaningful commit messages** for easy tracking
3. **Deploy frequently** to catch issues early
4. **Check GitHub Actions** tab for deployment status
5. **Use browser DevTools** to debug issues
6. **Clear browser cache** if changes don't appear

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review GitHub Pages deployment status in your repo
3. Check browser console for errors
4. Verify `base` URL in `vite.config.ts`
5. Try clearing cache and redeploying

---

Made with ❤️ for MeetingQuality

**Happy Deploying! 🚀**
