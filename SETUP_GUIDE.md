# Frontend API Setup Guide

This guide explains how to complete the Orval + React Query setup for your frontend.

## ⚠️ Important: Complete These Steps First

Due to npm permission issues, you need to manually complete the installation:

### 1. Fix npm cache permissions (if needed)
```bash
sudo chown -R $(whoami) ~/.npm
```

### 2. Install dependencies
```bash
cd frontend
npm install
```

This will install:
- `@tanstack/react-query` - Data fetching/caching library
- `@tanstack/react-query-devtools` - Dev tools for debugging queries
- `axios` - HTTP client
- `orval` - OpenAPI to TypeScript/React Query generator

### 3. Generate API client from OpenAPI spec
```bash
npm run generate:api
```

This command will:
- Read the OpenAPI spec from `../backend/generated/openapi.json`
- Generate TypeScript types for all DTOs
- Generate React Query hooks for all endpoints
- Output to `src/api/generated/`

## 📁 Generated Files Structure

After running `npm run generate:api`, you'll have:

```
src/api/generated/
├── models/                    # TypeScript types from OpenAPI schemas
│   ├── authResponseDto.ts
│   ├── createMeetingDto.ts
│   ├── meetingResponseDto.ts
│   ├── taskResponseDto.ts
│   └── ...
├── auth/                      # Auth endpoints
│   └── auth.ts                # Login, register, getProfile hooks
├── meetings/                  # Meetings endpoints  
│   └── meetings.ts            # CRUD operations for meetings
├── tasks/                     # Tasks endpoints
│   └── tasks.ts               # CRUD operations for tasks
└── users/                     # Users endpoints
    └── users.ts               # User management
```

## 🎯 How to Use Generated Hooks

### Example: Login

```typescript
import { useAuthControllerLogin } from './src/api/generated/auth/auth';
import { useStore } from './store';

function LoginForm() {
  const { mutate: login, isPending, error } = useAuthControllerLogin();
  const setAuth = useStore(state => state.setAuth);

  const handleSubmit = (email: string, password: string) => {
    login(
      { data: { email, password } },
      {
        onSuccess: (data) => {
          setAuth(data.user, data.access_token);
          // Navigate to dashboard
        },
        onError: (err) => {
          console.error('Login failed:', err);
        },
      }
    );
  };

  return (/* ... */);
}
```

### Example: Fetch Meetings

```typescript
import { useMeetingsControllerFindAll } from './src/api/generated/meetings/meetings';

function Dashboard() {
  const { data: meetings, isLoading, error, refetch } = useMeetingsControllerFindAll();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {meetings?.map(meeting => (
        <div key={meeting._id}>{meeting.title}</div>
      ))}
    </div>
  );
}
```

### Example: Create Meeting

```typescript
import { useMeetingsControllerCreate } from './src/api/generated/meetings/meetings';
import { queryClient } from './src/providers/QueryProvider';

function CreateMeetingForm() {
  const { mutate: createMeeting, isPending } = useMeetingsControllerCreate();

  const handleSubmit = (title: string, question: string, participantIds: string[]) => {
    createMeeting(
      { data: { title, question, participantIds } },
      {
        onSuccess: () => {
          // Invalidate meetings query to refetch
          queryClient.invalidateQueries({ queryKey: ['meetings'] });
          // Navigate to dashboard
        },
      }
    );
  };

  return (/* ... */);
}
```

### Example: Update Meeting Phase

```typescript
import { useMeetingsControllerChangePhase } from './src/api/generated/meetings/meetings';

function MeetingControls({ meetingId }: { meetingId: string }) {
  const { mutate: changePhase } = useMeetingsControllerChangePhase();

  const handleNextPhase = (newPhase: string) => {
    changePhase(
      { id: meetingId, data: { phase: newPhase } },
      {
        onSuccess: () => {
          // Refetch meeting details
          queryClient.invalidateQueries({ queryKey: ['meetings', meetingId] });
        },
      }
    );
  };

  return (/* ... */);
}
```

## 🔄 What Changed

### Before (Old Local Storage Approach)
- ❌ No type safety
- ❌ Manual localStorage management
- ❌ No caching or automatic refetching
- ❌ No loading/error states
- ❌ Manual state synchronization

### After (Orval + React Query)
- ✅ Full type safety from OpenAPI spec
- ✅ Automatic caching and background refetching
- ✅ Built-in loading/error states
- ✅ Automatic request deduplication
- ✅ Optimistic updates support
- ✅ Dev tools for debugging

## 🚀 Next Steps

1. Run `npm install` in the frontend directory
2. Run `npm run generate:api` to generate the API client
3. Check the generated files in `src/api/generated/`
4. The screens are already updated to use the generated hooks!
5. Start your Docker containers: `docker compose up`
6. Access the app at http://localhost:3000

## 🐛 Troubleshooting

### "Cannot find module" errors
Make sure you've run `npm run generate:api` after installing dependencies.

### Types are wrong
The backend OpenAPI spec might have changed. Regenerate with:
```bash
cd ../backend && npm run openapi:generate
cd ../frontend && npm run generate:api
```

### Authentication errors
Check that your axios instance is correctly adding the Bearer token from localStorage.

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Orval Documentation](https://orval.dev/)
- [Your Backend API Docs](http://localhost:4000/api)