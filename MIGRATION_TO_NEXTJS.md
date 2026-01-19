# 🚀 Migration to Next.js + MongoDB

## Overview

Migrating from **localStorage** to **Next.js + MongoDB** backend.

### Current Stack:
- ⚡ Vite + React
- 💾 localStorage for data
- 🎨 Tailwind CSS
- 🎭 Framer Motion

### New Stack:
- ⚡ Next.js 14 (App Router)
- 💾 MongoDB + Mongoose
- 🔐 JWT Authentication
- 🎨 Tailwind CSS (kept)
- 🎭 Framer Motion (kept)
- 🌐 API Routes

---

## 🎯 Architecture

### Frontend (Next.js Client Components)
- Same React components
- Replace `useStore` with API calls
- Keep all UI/UX unchanged

### Backend (Next.js API Routes)
- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/meetings` - CRUD operations
- `/api/tasks` - CRUD operations
- `/api/evaluations` - Submit evaluations

### Database (MongoDB)
- **Users** collection
- **Meetings** collection
- **Tasks** collection
- **Evaluations** collection

---

## 📁 New Project Structure

```
meetings-quality-nextjs/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── meeting/
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── task/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   └── me/
│   │   │       └── route.ts
│   │   ├── meetings/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── evaluations/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           (keep existing)
│   ├── Layout.tsx    (adapt for Next.js)
│   └── Sidebar.tsx   (keep)
├── lib/
│   ├── mongodb.ts    (DB connection)
│   ├── auth.ts       (JWT helpers)
│   └── api-client.ts (Frontend API wrapper)
├── models/
│   ├── User.ts
│   ├── Meeting.ts
│   ├── Task.ts
│   └── Evaluation.ts
├── middleware.ts     (Auth middleware)
└── types/           (keep existing)
```

---

## 🗄️ MongoDB Schema

### User Model
```typescript
{
  _id: ObjectId,
  fullName: string,
  email: string (unique),
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Meeting Model
```typescript
{
  _id: ObjectId,
  title: string,
  question: string,
  creatorId: ObjectId (ref: User),
  currentPhase: enum,
  participantIds: ObjectId[] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```typescript
{
  _id: ObjectId,
  meetingId: ObjectId (ref: Meeting),
  authorId: ObjectId (ref: User),
  description: string,
  deadline: Date,
  contributionImportance: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Evaluation Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  meetingId: ObjectId (ref: Meeting),
  understandingScore: number,
  influenceScores: Map<ObjectId, number>,
  emotionalImpacts: Map<ObjectId, number>,
  toxicParticipants: ObjectId[],
  taskDescription: string?,
  deadline: Date?,
  contributionImportance: number?,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

### Current (localStorage):
```
Login → Save to localStorage → Access app
```

### New (JWT):
```
Login → API → JWT Token → HTTP-only Cookie → Access app
```

**Benefits:**
- ✅ Secure (no token in localStorage)
- ✅ Auto-refresh
- ✅ Server-side validation
- ✅ Cross-device sync

---

## 🔄 API Migration Map

### Current → New

| Current (localStorage) | New (API Endpoint) |
|------------------------|-------------------|
| `login(email)` | `POST /api/auth/login` |
| `register(name, email)` | `POST /api/auth/register` |
| `logout()` | `POST /api/auth/logout` |
| `createMeeting(...)` | `POST /api/meetings` |
| `updateMeetingPhase(...)` | `PATCH /api/meetings/[id]` |
| `submitEvaluation(...)` | `POST /api/evaluations` |
| `updateTask(...)` | `PATCH /api/tasks/[id]` |
| `meetings` array | `GET /api/meetings` |
| `tasks` array | `GET /api/tasks` |
| `evaluations` array | `GET /api/evaluations` |

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "framer-motion": "^11.18.2",
    "@floating-ui/react": "^0.27.16",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8"
  }
}
```

---

## 🌐 Free Hosting Options

### Option 1: Vercel + MongoDB Atlas (Recommended)

**Vercel (Frontend + API):**
- ✅ Free tier: Unlimited personal projects
- ✅ Automatic deployments from Git
- ✅ Built for Next.js
- ✅ Serverless functions for API
- 🌐 https://vercel.com

**MongoDB Atlas (Database):**
- ✅ Free tier: 512MB storage
- ✅ Shared cluster
- ✅ Perfect for small projects
- 🌐 https://www.mongodb.com/atlas

**Deployment:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect Vercel to GitHub
vercel --prod

# 3. Add MongoDB URI to Vercel env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
```

---

### Option 2: Railway + MongoDB Atlas

**Railway:**
- ✅ Free tier: $5 credit/month
- ✅ Deploy from GitHub
- ✅ Easy environment variables
- 🌐 https://railway.app

---

### Option 3: Render + MongoDB Atlas

**Render:**
- ✅ Free tier for web services
- ✅ Auto-deploy from Git
- ✅ Background workers
- 🌐 https://render.com

---

## 🚀 Migration Steps

### Phase 1: Setup (1 hour)
1. Create new Next.js project
2. Install dependencies
3. Setup MongoDB connection
4. Create database models

### Phase 2: Backend API (2-3 hours)
1. Create authentication endpoints
2. Create meeting endpoints
3. Create task endpoints
4. Create evaluation endpoints
5. Add middleware for auth

### Phase 3: Frontend Migration (2-3 hours)
1. Copy existing components
2. Replace Zustand store with API client
3. Update all data fetching
4. Add loading states
5. Add error handling

### Phase 4: Testing (1 hour)
1. Test all flows
2. Test authentication
3. Test CRUD operations
4. Fix bugs

### Phase 5: Deployment (30 minutes)
1. Setup MongoDB Atlas
2. Deploy to Vercel
3. Configure environment variables
4. Test production

**Total Time: 6-8 hours**

---

## ⚡ Quick Start Commands

### Create New Project
```bash
# Create Next.js app
npx create-next-app@latest meetings-quality-nextjs --typescript --tailwind --app

cd meetings-quality-nextjs

# Install dependencies
npm install mongoose bcryptjs jsonwebtoken framer-motion @floating-ui/react zustand

# Install dev dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Environment Variables
Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meetings
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Run Development
```bash
npm run dev
```

---

## 📊 Comparison

| Feature | Current (localStorage) | New (MongoDB) |
|---------|----------------------|---------------|
| **Data Persistence** | Browser only | Cloud database |
| **Multi-device** | ❌ No | ✅ Yes |
| **Collaboration** | ❌ No | ✅ Yes |
| **Security** | ⚠️ Client-side | ✅ Server-side |
| **Scalability** | ❌ Limited | ✅ Unlimited |
| **Real-time** | ❌ No | ✅ Possible |
| **Backup** | ❌ No | ✅ Automatic |
| **Search** | ⚠️ Limited | ✅ Full-text |

---

## 🎯 Benefits of Migration

### For Users:
- ✅ Data persists across devices
- ✅ Can access from any browser
- ✅ Secure authentication
- ✅ Faster load times
- ✅ Real collaboration possible

### For Development:
- ✅ Professional architecture
- ✅ Easier to scale
- ✅ Better debugging
- ✅ API for mobile app later
- ✅ Analytics possible

---

## 🐛 Potential Challenges

### Challenge 1: Authentication
**Solution:** Use JWT in HTTP-only cookies

### Challenge 2: API Rate Limits
**Solution:** Use SWR for caching and revalidation

### Challenge 3: Data Migration
**Solution:** No existing data to migrate (localStorage only)

### Challenge 4: Complexity
**Solution:** Start simple, add features incrementally

---

## 📚 Next Steps

1. **Read this guide** ✅
2. **Setup MongoDB Atlas** (10 min)
3. **Create Next.js project** (5 min)
4. **Follow step-by-step guide** (in next file)
5. **Deploy to Vercel** (10 min)

---

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Vercel Deployment](https://vercel.com/docs)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Best Practices](https://jwt.io/introduction)

---

**Ready to start? Let's begin with the step-by-step implementation!**

See `NEXTJS_IMPLEMENTATION.md` for detailed code examples.
