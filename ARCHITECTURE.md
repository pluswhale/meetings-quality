# 🏗️ Project Architecture

## Overview
Enterprise-level architecture with clear separation of concerns, atomic components, and type-safe code.

---

## 📂 Folder Structure

```
meetings-quality/
│
├── 📁 constants/                    # Type-safe constants
│   ├── meetings.ts                  # Meeting enums, labels, config
│   ├── tasks.ts                     # Task enums and labels
│   └── index.ts                     # ⭐ Central export
│
├── 📁 utils/                        # Pure utility functions
│   ├── meeting.utils.ts             # Business logic helpers
│   ├── date.utils.ts                # Date formatting
│   └── index.ts                     # ⭐ Central export
│
├── 📁 hooks/                        # Custom React hooks
│   ├── useMeetingData.ts            # Fetch meeting with polling
│   ├── useVotingInfo.ts             # Fetch voting info
│   ├── usePhaseSubmissions.ts       # Fetch submissions
│   ├── useApi.ts                    # Generic API hook
│   └── index.ts                     # ⭐ Central export
│
├── 📁 components/                   # Atomic UI components
│   ├── 📁 ui/                       # Generic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   │
│   ├── 📁 meeting/                  # Meeting-specific components
│   │   ├── PhaseIndicator.tsx       # 🔹 Phase stepper
│   │   ├── CreatorWarningBanner.tsx # 🔹 Warning UI
│   │   │
│   │   ├── 📁 VotingStatus/         # Voting status atoms
│   │   │   ├── VotingProgressBar.tsx
│   │   │   ├── ParticipantStatusCard.tsx
│   │   │   ├── AllSubmittedBanner.tsx
│   │   │   └── VotingStatusPanel.tsx    # 🔸 Container
│   │   │
│   │   └── index.ts                 # ⭐ Export all
│   │
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── index.ts                     # ⭐ Central export
│
├── 📁 screens/                      # Page-level components
│   ├── Dashboard.tsx                # ✅ Refactored
│   ├── MeetingDetail.tsx            # ✅ Refactored
│   ├── CreateMeeting.tsx
│   ├── TaskDetail.tsx
│   └── AuthScreens.tsx
│
├── 📁 src/api/                      # Generated API
│   └── generated/
│       ├── meetingsQualityAPI.schemas.ts  # ⭐ Source of truth
│       ├── meetings/meetings.ts
│       ├── tasks/tasks.ts
│       └── models/                  # Individual model files
│
└── 📁 store/                        # Global state
    └── store.ts                     # Zustand store
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      USER INTERFACE                      │
│                      (screens/)                          │
│                                                          │
│  ┌────────────────┐         ┌────────────────┐         │
│  │  Dashboard     │         │ MeetingDetail  │         │
│  └────────┬───────┘         └────────┬───────┘         │
│           │                          │                  │
└───────────┼──────────────────────────┼──────────────────┘
            │                          │
            │                          │
┌───────────▼──────────────────────────▼──────────────────┐
│               BUSINESS LOGIC LAYER                       │
│              (hooks/ + utils/)                           │
│                                                          │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Custom Hooks    │    │  Utility Funcs   │          │
│  │  - useMeeting    │    │  - isCreator     │          │
│  │  - useVoting     │    │  - getNextPhase  │          │
│  │  - useSubmission │    │  - formatDate    │          │
│  └────────┬─────────┘    └────────┬─────────┘          │
│           │                       │                     │
└───────────┼───────────────────────┼─────────────────────┘
            │                       │
            │                       │
┌───────────▼───────────────────────▼─────────────────────┐
│                  PRESENTATION LAYER                      │
│                  (components/)                           │
│                                                          │
│  ┌─────────────────────────────────────────┐           │
│  │         Atomic Components                │           │
│  │  - PhaseIndicator                        │           │
│  │  - VotingProgressBar                     │           │
│  │  - ParticipantStatusCard                 │           │
│  │  - CreatorWarningBanner                  │           │
│  └─────────────────────────────────────────┘           │
│                                                          │
└──────────────────────────────────────────────────────────┘
            │
            │
┌───────────▼──────────────────────────────────────────────┐
│                    DATA LAYER                            │
│               (src/api/generated/)                       │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │        Generated API Clients                │         │
│  │  - useMeetingsControllerFindOne            │         │
│  │  - useMeetingsControllerSubmitEmotional... │         │
│  │  - useTasksControllerCreate                │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       │
┌──────────────────────▼───────────────────────────────────┐
│                    BACKEND API                           │
│         (meetings-quality-backend)                       │
│                                                          │
│  - POST /meetings/{id}/emotional-evaluations            │
│  - POST /meetings/{id}/understanding-contributions      │
│  - POST /meetings/{id}/task-plannings                   │
│  - GET  /meetings/{id}/voting-info                      │
│  - GET  /meetings/{id}/phase-submissions                │
│  - POST /tasks                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔗 Import Chain

```
Screen Component (Dashboard.tsx)
    │
    ├─→ imports Constants
    │   └─→ from constants/meetings.ts
    │       └─→ re-exports from generated schemas
    │
    ├─→ imports Utils
    │   └─→ from utils/meeting.utils.ts
    │       └─→ uses constants
    │
    ├─→ imports Hooks
    │   └─→ from hooks/useMeetingData.ts
    │       └─→ uses API clients + constants
    │
    └─→ imports Components
        └─→ from components/meeting/
            └─→ uses constants + utils
```

**Result:** Clear dependency hierarchy, no circular dependencies

---

## 🎯 Component Hierarchy

### Atomic Design Pattern

```
🔹 Atoms (10-30 lines)
  - VotingProgressBar
  - ParticipantStatusCard
  - AllSubmittedBanner
  - CreatorWarningBanner

🔸 Molecules (30-50 lines)
  - VotingStatusPanel (composed of atoms)
  - PhaseIndicator (composed of atoms)

🔶 Organisms (50-150 lines)
  - EmotionalEvaluationPhase
  - UnderstandingContributionPhase
  - TaskPlanningPhase

📄 Pages (200-500 lines)
  - Dashboard (uses organisms)
  - MeetingDetail (uses organisms)
```

---

## 📊 Type Safety Flow

```
Backend OpenAPI Spec
    │
    ├─→ generates schemas
    │   └─→ meetingsQualityAPI.schemas.ts
    │       │
    │       ├─→ MeetingResponseDtoCurrentPhase enum
    │       ├─→ MeetingResponseDtoStatus enum
    │       └─→ All DTOs
    │
    └─→ generates API hooks
        └─→ meetings/meetings.ts
            ├─→ useMeetingsControllerFindOne
            ├─→ useMeetingsControllerSubmitEmotional...
            └─→ useTasksControllerCreate

Constants Layer
    │
    └─→ re-exports schemas + adds labels
        └─→ constants/meetings.ts
            ├─→ export { MeetingResponseDtoCurrentPhase }
            └─→ export const PHASE_LABELS = {...}

Application Code
    │
    └─→ imports from constants
        └─→ Full type safety + autocomplete
```

---

## 🎨 Styling Architecture

```
Tailwind CSS
    │
    ├─→ Utility-first classes
    │   └─→ Consistent spacing, colors, typography
    │
    ├─→ Component-level customization
    │   └─→ Responsive, accessible
    │
    └─→ Theme-based colors
        ├─→ Blue: Primary actions, current phase
        ├─→ Green: Success, completed
        ├─→ Yellow/Amber: Warnings, pending
        ├─→ Red: Errors, toxicity
        └─→ Purple/Pink: Special panels
```

---

## 🔐 Permission Architecture

```
                    ┌──────────────┐
                    │   USER       │
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼─────┐        ┌─────▼──────┐
         │  CREATOR   │        │ PARTICIPANT │
         └──────┬─────┘        └─────┬───────┘
                │                     │
                │                     │
    ┌───────────┼─────────────────────┼──────────────┐
    │           │                     │              │
    │  Phase 1: │  Discussion         │              │
    │           │  ✅ View            │  ✅ View     │
    │           │  ❌ Submit          │  ❌ Submit   │
    │           │                     │              │
    │  Phase 2: │  Emotional          │              │
    │           │  ✅ View Stats      │  ✅ Submit   │
    │           │  ❌ Submit          │              │
    │           │  ✅ Switch Phase    │              │
    │           │                     │              │
    │  Phase 3: │  Understanding      │              │
    │           │  ✅ View Stats      │  ✅ Submit   │
    │           │  ❌ Submit          │              │
    │           │  ✅ Switch Phase    │              │
    │           │                     │              │
    │  Phase 4: │  Task Planning      │              │
    │           │  ✅ Create Task     │  ✅ Create   │
    │           │  ✅ View Stats      │              │
    │           │  ✅ Switch Phase    │              │
    │           │                     │              │
    │  Phase 5: │  Finished           │              │
    │           │  ✅ View Results    │  ✅ View     │
    │           │                     │              │
    └───────────┴─────────────────────┴──────────────┘
```

---

## 📈 Scalability

### Easy to Add New Features

**Example: Add a new phase**

1. **Update backend** → generates new enum
2. **Add to constants:**
```typescript
// constants/meetings.ts
export const PHASE_LABELS = {
  ...existing,
  [MeetingResponseDtoCurrentPhase.new_phase]: 'Новая фаза',
};
```

3. **Create component:**
```typescript
// components/meeting/NewPhaseComponent.tsx
export const NewPhaseComponent = () => {...};
```

4. **Use in screen:**
```typescript
// screens/MeetingDetail.tsx
{phase === MeetingResponseDtoCurrentPhase.new_phase && (
  <NewPhaseComponent />
)}
```

**Done!** Type-safe, maintainable, testable.

---

## 🧪 Testing Strategy

```
Unit Tests
  └─→ utils/*.test.ts
      ├─ isUserCreator()
      ├─ getNextPhase()
      └─ calculateContributionTotal()

Component Tests
  └─→ components/**/*.test.tsx
      ├─ <PhaseIndicator />
      ├─ <VotingProgressBar />
      └─ <ParticipantStatusCard />

Integration Tests
  └─→ screens/*.test.tsx
      ├─ <Dashboard />
      └─ <MeetingDetail />

E2E Tests
  └─→ e2e/*.spec.ts
      ├─ Meeting flow
      └─ Task creation
```

---

## 📦 Module Boundaries

```
┌──────────────────────────────────────────────┐
│                  Screens                     │
│  (Orchestrates everything)                   │
│  ↓ can import from ↓                         │
├──────────────────────────────────────────────┤
│               Components                     │
│  (Presentational, reusable)                  │
│  ↓ can import from ↓                         │
├──────────────────────────────────────────────┤
│                  Hooks                       │
│  (Data fetching, side effects)               │
│  ↓ can import from ↓                         │
├──────────────────────────────────────────────┤
│                  Utils                       │
│  (Pure functions, no dependencies)           │
│  ↓ can import from ↓                         │
├──────────────────────────────────────────────┤
│                Constants                     │
│  (Enums, config, no dependencies)            │
│  ↓ can import from ↓                         │
├──────────────────────────────────────────────┤
│            Generated API Types               │
│  (Source of truth, auto-generated)           │
└──────────────────────────────────────────────┘
```

**Rules:**
- ✅ Higher layers can import from lower layers
- ❌ Lower layers CANNOT import from higher layers
- ✅ Same-level imports are OK if no circular dependencies

---

## 🎯 Separation of Concerns

### Each Layer Has One Job

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **Constants** | Define enums, labels, config | `PHASE_LABELS` |
| **Utils** | Pure business logic | `isUserCreator()` |
| **Hooks** | Data fetching, side effects | `useMeetingData()` |
| **Components** | Presentation only | `<PhaseIndicator />` |
| **Screens** | Orchestration | `<MeetingDetail />` |

---

## 🌟 Best Practices Applied

### 1. DRY (Don't Repeat Yourself)
✅ Logic centralized in utils
✅ Labels centralized in constants
✅ Data fetching centralized in hooks

### 2. SOLID Principles
✅ **Single Responsibility:** Each component does one thing
✅ **Open/Closed:** Easy to extend, hard to break
✅ **Liskov Substitution:** Components are interchangeable
✅ **Interface Segregation:** Small, focused interfaces
✅ **Dependency Inversion:** Depend on abstractions (types)

### 3. Clean Code
✅ Descriptive names
✅ Small functions (<20 lines)
✅ Small components (<50 lines)
✅ Type-safe throughout
✅ No magic numbers
✅ No magic strings

### 4. React Best Practices
✅ Custom hooks for logic
✅ Atomic components
✅ Props drilling avoided
✅ Proper key usage
✅ Memoization where needed

---

## 📏 Code Standards

### Naming Conventions
```typescript
// Components: PascalCase
PhaseIndicator
VotingStatusPanel

// Functions: camelCase
isUserCreator()
getNextPhase()

// Constants: UPPER_SNAKE_CASE
POLLING_INTERVALS
PHASE_LABELS

// Enums: PascalCase (from generated)
MeetingResponseDtoCurrentPhase
```

### File Organization
```typescript
// 1. Imports (grouped)
import React from 'react';                    // External
import { useStore } from '@/store';          // Internal
import { PHASE_LABELS } from '@/constants';  // Constants
import { isUserCreator } from '@/utils';     // Utils
import { PhaseIndicator } from '@/components'; // Components

// 2. Types/Interfaces
interface MyComponentProps {...}

// 3. Component
export const MyComponent: React.FC<Props> = () => {
  // 3.1. Hooks
  const { data } = useMeetingData(id);
  
  // 3.2. State
  const [value, setValue] = useState(0);
  
  // 3.3. Derived values
  const isCreator = isUserCreator(meeting, userId);
  
  // 3.4. Handlers
  const handleClick = () => {...};
  
  // 3.5. Early returns
  if (!data) return <Loading />;
  
  // 3.6. Render
  return <div>...</div>;
};
```

---

## 🚀 Performance Optimizations

### 1. Code Splitting
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./screens/Dashboard'));
```

### 2. Memoization
```typescript
// Expensive calculations
const total = useMemo(
  () => calculateContributionTotal(contributions),
  [contributions]
);
```

### 3. Query Optimization
```typescript
// Polling only when needed
enabled: isCreator && !isFinished
```

### 4. Component Optimization
```typescript
// Small components = faster renders
<VotingProgressBar />  // 30 lines, fast re-render
```

---

## 🎓 Developer Guide

### Adding a New Feature

1. **Check if it needs:**
   - New constants? → Add to `constants/`
   - Business logic? → Add to `utils/`
   - Data fetching? → Add to `hooks/`
   - UI component? → Add to `components/`

2. **Follow the pattern:**
   - Use existing code as template
   - Import from centralized locations
   - Keep components small
   - Add proper types

3. **Test:**
   - Write unit tests for utils
   - Write component tests
   - Verify no linter errors

### Code Review Checklist

When reviewing PRs:
- [ ] No magic strings
- [ ] Uses enums from generated models
- [ ] Components under 50 lines
- [ ] Logic extracted to utils
- [ ] Data fetching uses hooks
- [ ] Proper TypeScript types
- [ ] No linter errors
- [ ] Follows existing patterns

---

## 📚 Resources

### Internal Docs
- `REFACTORING_GUIDE.md` - Architecture overview
- `QUICK_START_REFACTORED.md` - Quick reference
- `IMPLEMENTATION_COMPLETE_SUMMARY.md` - Feature summary

### Code Examples
- `constants/meetings.ts` - Constant patterns
- `utils/meeting.utils.ts` - Utility patterns
- `hooks/useMeetingData.ts` - Hook patterns
- `components/meeting/PhaseIndicator.tsx` - Component patterns

---

## ✨ Summary

**Before:** 
- Monolithic components
- Magic strings everywhere
- Hard to maintain
- No clear structure

**After:**
- Atomic architecture
- Type-safe enums
- Easy to maintain
- Clear structure
- **Senior-level quality** ✅

The codebase is now **production-ready** and **team-friendly**! 🎉
