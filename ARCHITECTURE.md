# MeetingQuality — Frontend Architecture Overview

> **Audience:** Business Analysts, Product Owners, Customers  
> **Purpose:** Describes what the application does, how its screens are structured, who can see what, and how the pieces connect.  
> **Last updated:** March 2026

---

## 1. What the Application Does

**MeetingQuality** is a structured meeting facilitation platform. After (or during) a meeting, participants work through a guided sequence of evaluation steps:

1. Rate each other's emotional contribution
2. Assess their own understanding and distribute contribution credit across the team
3. Commit to a personal task that arose from the meeting
4. (Optionally) Evaluate the importance of everyone else's tasks

The meeting **Creator** controls the pace — they advance the meeting through phases and have an admin view of all submitted answers in real time. **Participants** fill in the forms for each phase and can revisit earlier phases to update their answers.

---

## 2. User Roles

There are exactly **two roles**. A role is determined per-meeting — the same user can be a Creator in one meeting and a Participant in another.

| Role | How determined | Key privileges |
|---|---|---|
| **Creator** | User who created the meeting | Advances phases, sees all submissions, approves / rejects tasks |
| **Participant** | Any other user who joined | Fills in forms, can revisit past phases to update answers |

---

## 3. Application Pages

```
/                          → Auto-redirects (login if not authenticated, dashboard if authenticated)
/login                     → Login screen
/register                  → Registration screen
/dashboard                 → Main hub — meetings list + tasks list
/meeting/create            → Create a new meeting
/meeting/:id               → The active meeting room (all phases happen here)
/task/:id                  → View / edit a personal task
```

---

## 4. Page-by-Page Breakdown

---

### 4.1 Login — `/login`

**Visible to:** Unauthenticated users only (automatically redirected to Dashboard if already logged in)

**What the user sees:**
- Email field
- Password field
- "Sign In" button
- Link to the Registration page
- Error banner if credentials are invalid

**What happens on success:**
- JWT token is saved locally (persists across browser refresh)
- User is redirected to `/dashboard`

**Components used:**

```
LoginView
  └── AuthLayout          (shared auth page wrapper — handles title, subtitle, error banner)
        └── Input         (shared UI — email field)
        └── Input         (shared UI — password field)
        └── Button        (shared UI — submit)
```

---

### 4.2 Registration — `/register`

**Visible to:** Unauthenticated users only

**What the user sees:**
- Full name field
- Email field
- Password field
- "Create Account" button
- Link to Login page

**Components used:**

```
RegisterView
  └── AuthLayout
        └── Input (x3)
        └── Button
```

---

### 4.3 Dashboard — `/dashboard`

**Visible to:** All authenticated users

**What the user sees:**
- Left sidebar with two tabs: **Meetings** and **Tasks** + Logout button
- URL parameter `?tab=meetings` or `?tab=tasks` controls which content is shown

**Meetings tab:**

| Element | Description |
|---|---|
| Filter pills | Current / Past / Upcoming |
| Meeting cards grid | Each card: title, current phase badge (color-coded), creation date |
| "Create meeting" button | Navigates to `/meeting/create` |

**Tasks tab:**

| Element | Description |
|---|---|
| Task cards grid | Each card: task description, deadline, status badge (In progress / Completed) |
| Click a card | Navigates to `/task/:id` |

**Components used:**

```
DashboardView
  └── DashboardSidebar     (tab navigation: Meetings / Tasks + Logout)
  └── MeetingsFilter       (filter pills: Current / Past / Upcoming)
  └── Card (per meeting)
        └── Badge           (phase status)
  └── Card (per task)
        └── Badge           (completion status)
```

---

### 4.4 Create Meeting — `/meeting/create`

**Visible to:** Any authenticated user

**What the user sees:**
- Meeting title field
- Main question field — the central topic the meeting will evaluate (multi-line)
- Date & time picker for the scheduled meeting time
- "Create" button

**What happens on success:**
- Meeting is created with status `upcoming`
- User (the creator) is redirected to the new meeting room at `/meeting/:id`

**Components used:**

```
CreateMeetingView
  └── Input         (title)
  └── Input         (main question, textarea)
  └── DateTimePicker (shared UI)
  └── Button         (submit)
```

---

### 4.5 Meeting Room — `/meeting/:id`

This is the most complex screen. Its layout and available controls change based on:
- The current **meeting phase**
- Whether the current user is the **Creator** or a **Participant**

#### Overall layout

```
MeetingDetailView
  └── MeetingHeader
        └── Back button
        └── Meeting title + creation date
        └── PhaseIndicator (step bar)
  └── [Creator only] PendingVotersPanel
  └── [Creator only] CreatorSubmissionsPanel (admin view of all answers)
  └── PhaseContent (the form for the current phase)
        └── UnderstandingScorePanel (always visible, all phases except Finished)
        └── [Phase-specific form — see section 4.5.3]
        └── [Creator only] "Next Phase" / "Finish" button
```

---

#### 4.5.1 Phase Indicator (step bar)

Displayed at the top of the meeting room. Shows the sequence of phases.

| User | Behavior when clicking a phase |
|---|---|
| **Creator** | Jumps the entire meeting to that phase (all participants see the change) |
| **Participant** | Can only click phases that have already passed — opens that phase locally so they can update their answers |

When a participant is viewing a past phase, a yellow **"Viewing previous phase"** banner appears with a "Return to current" button.

---

#### 4.5.2 Creator-only panels (always visible to creator during an active meeting)

**Pending Voters Panel**
- Shows a list of participants who haven't submitted for the current phase yet
- Each entry shows the participant's name and an online indicator (green dot = currently connected)

**Creator Submissions Panel (Admin View)**
- Tabbed panel with three tabs: **Emotions** / **Understanding** / **Tasks**
- Refreshes automatically when any participant submits
- On the **Tasks** tab: creator can click "Approve" or "Unapprove" on each task

```
CreatorSubmissionsPanel
  └── MeetingSubmissionsView
        └── Tab: Эмоции (Emotions)     — per-participant emotional scores
        └── Tab: Понимание (Understanding) — understanding % + contribution %
        └── Tab: Задачи (Tasks)        — task list with Approve / Unapprove buttons
```

---

#### 4.5.3 Phase-specific forms

---

**Phase 1 — Emotional Evaluation ("Обсуждение")**

> Who fills it in: **All participants** (Creator fills it in too, but does not see other results)

What the participant sees:
- A table listing every other meeting participant
- For each person: an emotional scale slider (−100 to +100) and a "Toxic" checkbox
- Submissions auto-save on every slider change; a manual "Save" button is also available

```
PhaseContent → EmotionalEvaluationTable
  └── (one row per participant)
        └── Participant name + avatar
        └── Slider (−100 → +100)
        └── Checkbox "Toxic"
```

---

**Phase 2 — Understanding & Contribution ("Вклад")**

> Who fills it in: **All participants**

What the participant sees:
- **Understanding score slider** (always visible across all active phases — top of page) — self-assessment of how well they understood the meeting topic (0–100%)
- **Contribution table** — distribute percentage credit across all other participants; the total must equal exactly 100%
- Validation error shown if total ≠ 100% when submitting

```
PhaseContent
  └── UnderstandingScorePanel   (self-assessment, always visible)
  └── ContributionDistributionPanel
        └── (one row per participant)
              └── Participant name
              └── % input slider / number field
        └── Total % indicator (shows current sum, turns green at 100%)
```

---

**Phase 3 — Task Planning ("Задачи")**

> Who fills it in: **All participants**

What the participant sees:
- **Global understanding** — text area: how the participant understood the meeting's main goal
- **My task** — text area: what task they are personally committing to
- **Time estimate** — numeric field (hours)
- **Deadline** — date picker
- **Expected contribution %** — slider (0–100%)
- **Emotional state slider** — self-reported emotional state about the task
- "Save changes" button

If the creator has **approved** the participant's task, all fields become read-only and a green "Approved" badge is shown. An informational note says "Task approved by organizer. Editing is locked."

```
PhaseContent
  └── TaskPlanningForm
        └── Textarea (global understanding)
        └── Textarea (task description)
        └── Input (estimate hours)
        └── DateTimePicker (deadline)
        └── Slider (expected contribution %)
        └── "Approved" badge (if approved)
        └── Button "Save changes" (hidden if approved)
  └── TaskEmotionalScaleSlider
        └── Slider (emotional state)
```

---

**Finished phase — `/meeting/:id` (finished state)**

When the meeting creator advances past the last phase, the meeting is marked **Finished**. The meeting room switches to a full read-only summary view.

What the user sees:
- Complete list of all phase results across all participants:
  - Emotional evaluation scores (averages, top/bottom rated participants)
  - Understanding scores per participant
  - Contribution distribution summary
  - All submitted tasks with approval status
  - Task importance evaluation results (if available)
- "Back to Dashboard" button

```
FinishedPhaseView
  └── CreatorStatsPanels       (aggregated stats)
  └── PhaseSubmissionsDisplay  (full response detail per participant)
  └── Button "Back to Dashboard"
```

---

### 4.6 Task Detail — `/task/:id`

**Visible to:** Task author (edit mode) or any authenticated user (read-only mode)

**What the user sees:**
- Task description (editable if author)
- Deadline (editable if author)
- Meeting reference (which meeting this task came from)
- Completion status badge
- "Save" button (visible to author only)

**Components used:**

```
TaskDetailView
  └── TaskForm
        └── Input (description)
        └── DateTimePicker (deadline)
        └── Badge (completion status)
  └── Button "Save" (author only)
```

---

## 5. Real-Time Behaviour

The meeting room uses **Socket.IO** for live updates. No page refresh is needed.

| Event | What triggers it | What updates |
|---|---|---|
| Participant joins | User opens `/meeting/:id` | Participant appears in the online list |
| Participant leaves | User closes the tab / disconnects | Participant removed from online list |
| Submission received | Any participant saves a form | Creator's admin panel refreshes; Pending Voters list updates |
| Task approved/rejected | Creator clicks Approve/Unapprove | Participant's form locks/unlocks; task list refreshes |
| Phase changed | Creator advances phase | All participants' screens switch to the new phase form |

---

## 6. Notification System

The application uses brief **toast notifications** (pop-up messages, top-right corner) to communicate results:

| Trigger | Toast type | Message |
|---|---|---|
| Successfully saved an evaluation | ✅ Success | "Оценка сохранена" |
| New participant submission (creator) | ✨ Success | "Получена новая эмоциональная оценка!" etc. |
| Phase changed | ✅ Success | "Фаза изменена на: [name]" |
| Validation error | ❌ Error | e.g. "Общий вклад должен быть 100%" |
| API failure | ❌ Error | Backend error message |

---

## 7. Navigation Map

```
                    ┌─────────────────────┐
                    │       /login        │
                    │   /register         │
                    └──────────┬──────────┘
                               │ authenticated
                               ▼
                    ┌─────────────────────┐
                    │     /dashboard      │
                    │   Meetings | Tasks  │
                    └──────┬──────┬───────┘
                           │      │
              create mtg   │      │  click task
                           ▼      ▼
               ┌──────────────┐  ┌──────────┐
               │/meeting/     │  │/task/:id │
               │  create      │  └──────────┘
               └──────┬───────┘
                      │ created
                      ▼
               ┌──────────────────────────────────────┐
               │         /meeting/:id                 │
               │                                      │
               │  Phase 1: Emotional Evaluation       │
               │      ↓  (creator advances)           │
               │  Phase 2: Understanding & Contrib.   │
               │      ↓                               │
               │  Phase 3: Task Planning              │
               │      ↓                               │
               │  [Finished] → /meeting/create        │
               └──────────────────────────────────────┘
```

---

## 8. Data Flow Summary (Non-Technical)

```
Browser
  │
  ├── On load: reads saved login token → restores session automatically
  │
  ├── Every 2 seconds: silently checks for meeting / submission updates
  │   (no manual refresh needed)
  │
  ├── In real time via WebSocket:
  │     new submissions → updates admin panel + pending voters list
  │     phase change → all users' screens switch simultaneously
  │     task approved → participant's form locks immediately
  │
  └── On user action (form save, phase advance):
        sends data to server → server confirms → UI updates
```

---

## 9. Shared Design System

All screens use a consistent set of UI building blocks:

| Component | Used for |
|---|---|
| **Button** | All actions (6 styles: primary, secondary, success, danger, ghost, outline) |
| **Input** | Text, email, password fields with label + validation message |
| **Card** | Meeting cards, task cards, form containers |
| **Badge** | Status indicators (phase, completion, approval) |
| **Avatar** | Participant avatars with initials fallback |
| **Slider** | Emotional scale, contribution %, understanding % |
| **DateTimePicker** | Deadline selection |

---

## 10. Feature Modules (Technical Summary for Analysts)

| Module | Screen(s) | Primary responsibility |
|---|---|---|
| `auth` | `/login`, `/register` | Authentication, session management |
| `dashboard` | `/dashboard` | Meetings list, tasks list, tab/filter state |
| `create-meeting` | `/meeting/create` | Meeting creation form |
| `meeting-detail` | `/meeting/:id` | All meeting phases, real-time presence, creator admin |
| `meeting` | Used inside `meeting-detail` | Submissions display component, shared submission types |
| `task-detail` | `/task/:id` | Individual task view and edit |

---

*This document describes the frontend only. Backend API contracts, database schema, and infrastructure are covered in separate documents.*
