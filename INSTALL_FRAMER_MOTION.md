# Installing Framer Motion

Framer Motion has been added to your `package.json`, but due to npm permission issues, it needs to be installed manually.

## Quick Install

### Option 1: Fix npm permissions (Recommended)

Run this command in your terminal to fix npm permissions:

```bash
sudo chown -R $(whoami) ~/.npm
```

Then install:

```bash
cd /Users/egordultsev/dev/web/meetings-quality
npm install
```

### Option 2: Clear npm cache

If option 1 doesn't work:

```bash
npm cache clean --force
cd /Users/egordultsev/dev/web/meetings-quality
npm install
```

### Option 3: Use different package manager

If npm continues to have issues, you can use yarn:

```bash
npm install -g yarn
cd /Users/egordultsev/dev/web/meetings-quality
yarn install
```

## Verify Installation

After installation, verify Framer Motion is installed:

```bash
npm list framer-motion
```

You should see:
```
framer-motion@11.15.0
```

## Test the Animations

Run your dev server:

```bash
npm run dev
```

Then:
1. Open your browser to the dev server URL
2. Log in to your app
3. Resize the browser to mobile view (or use mobile device)
4. Click the hamburger menu icon
5. Watch the beautiful animations! 🎉

## What's Animated?

- ✨ Sidebar slides in with spring physics
- 🎭 Backdrop fades in smoothly
- 💫 Close button rotates and scales on hover
- 🎨 Navigation items slide in with stagger effect
- 👤 User avatar pops in
- 📱 All buttons have hover/tap feedback
- 🎪 Page content fades in gracefully

## Need Help?

If you continue to have npm issues:

1. Check Node.js version: `node --version` (should be 20.x)
2. Check npm version: `npm --version`
3. Try updating npm: `sudo npm install -g npm@latest`
4. Check write permissions: `ls -la ~/.npm`

For more help, see:
- `components/ANIMATIONS_README.md` - Full animation documentation
- `components/SidebarExample.tsx` - Usage examples
