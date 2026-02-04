# Meeting UI Extension - Implementation Summary

## Overview
Extended the meeting UI with voting progress tracking, task visibility rules, task approval workflow, and real-time updates via WebSocket events.

## Features Implemented

### 1. Pending Voters Display ✅
**Location:** `src/features/meeting-detail/components/PendingVotersPanel.tsx`

- **API Integration:** Created manual API function for `GET /meetings/:id/pending-voters`
  - File: `src/features/meeting-detail/api/pending-voters.api.ts`
  - Fallback handling for when endpoint is not yet implemented on backend
  
- **Real-time Updates:** Component automatically refetches when:
  - `meeting_updated` socket event is received
  - `participants_updated` socket event is received
  
- **Features:**
  - Shows list of participants who haven't submitted their vote
  - Displays online status indicator (green dot) for active participants
  - Shows participant name, email, and avatar
  - Success state when all participants have voted
  - Only visible to meeting creators

### 2. Socket Event Listeners ✅
**Location:** `src/features/meeting-detail/hooks/useSocket.ts`

- Added listener for `meeting_updated` event
- Dispatches browser custom event for view model to consume
- Triggers refetch of:
  - Pending voters list
  - Meeting data
  - Phase submissions
  - Tasks (when approval changes)

### 3. Task Visibility Rules ✅
**Location:** `src/features/meeting-detail/components/PhaseContent.tsx`

Implemented logic in `renderTaskEvaluationPhase()`:

- **Participants:**
  - See ONLY their own task (always visible)
  - See other participants' tasks ONLY if approved
  - Info banner explaining visibility rules
  
- **Meeting Creator:**
  - Always sees all tasks (approved and unapproved)
  - No restrictions on task visibility

### 4. Task Editing Restrictions ✅
**Location:** `src/features/meeting-detail/components/TaskPlanningForm.tsx`

- Tasks can be edited ONLY if `isApproved === false`
- When approved:
  - All input fields become read-only (disabled state)
  - Visual feedback: grayed out with "cursor-not-allowed"
  - Info banner explaining why editing is locked
  - Submit button is hidden
  
- Approval status passed via `isMyTaskApproved` prop from view model

### 5. Task Approval (Creator Only) ✅
**Location:** 
- `src/features/meeting-detail/components/CreatorSubmissionsPanel.tsx` (TasksTab)
- `src/features/meeting-detail/useMeetingDetailViewModel.ts` (approval logic)

- **Checkbox UI:**
  - Visible only to meeting creator
  - Shows "Одобрить" when unchecked, "Одобрено" when checked
  - Visual distinction: green styling for approved tasks
  - Disabled during API call (prevents double-clicks)
  
- **API Call:**
  - Endpoint: `PATCH /tasks/:id/approve`
  - Toggles current approval status
  - Success: Refetches meeting data and submissions
  - Error: Shows toast notification
  
- **Visual Feedback:**
  - Approved tasks have green border and background
  - Green vertical stripe on left side of card
  - Badge shows approval status

### 6. View Model Updates ✅
**Location:** `src/features/meeting-detail/useMeetingDetailViewModel.ts`

**New State:**
- `pendingVoters`: Array of voters who haven't submitted (with online status)
- `isMyTaskApproved`: Boolean indicating if current user's task is approved
- `isApprovingTask`: Loading state for approval mutation

**New Handlers:**
- `handleApproveTask(taskId, currentStatus)`: Toggles task approval

**Socket Event Handling:**
- Listens to `meeting_updated` browser custom event
- Listens to `participants_updated` browser custom event
- Refetches pending voters when events are received

**API Integration:**
- Uses `useQuery` for pending voters with polling
- Combines pending voters with socket participant data for online status
- Mutation for task approval with optimistic updates

### 7. Type Updates ✅
**Location:** `src/features/meeting-detail/types.ts`

- Added `PendingVoter` interface
- Updated `MeetingDetailViewModel` to include `pendingVoters` and approval handlers
- Fixed `PhaseSubmissions` to match API response format (underscore naming)

## Integration Points

### MeetingDetailView
- Integrated `PendingVotersPanel` component (visible for creators only)
- Passes `pendingVoters`, loading state, and current phase
- Positioned above `CreatorSubmissionsPanel`

### Real-time Updates Flow
```
Socket Event (meeting_updated/participants_updated)
  ↓
useSocket hook dispatches browser custom event
  ↓
useMeetingDetailViewModel listens to custom event
  ↓
Refetches: pendingVoters + meeting data + submissions
  ↓
UI automatically updates via React Query
```

## UX Enhancements

### Pending Voters Panel
- **Empty State:** Green success banner when all voted
- **Loading State:** Spinner with loading message
- **Pending State:** Blue info banner with participant cards
- **Online Indicators:** Green dot for active participants
- **Avatar Badges:** First letter of name in colored circle

### Task Approval Workflow
- **Visual Hierarchy:** Approved tasks visually distinct (green theme)
- **Checkbox Design:** Custom styled with checkmark icon
- **Status Badge:** "Одобрено" / "Одобрить" with color coding
- **Loading State:** Disabled checkbox during API call
- **Toast Notifications:** Success/error feedback

### Task Editing Lock
- **Clear Feedback:** Blue info banner explaining lock reason
- **Disabled State:** All fields grayed out with appropriate cursor
- **Approval Badge:** Green badge at top of form
- **Hidden Submit:** Button removed for approved tasks

## Error Handling

### Pending Voters API
- Graceful fallback if endpoint not implemented (returns empty array)
- Console warning for debugging
- Doesn't break UI if API fails

### Task Approval
- Toast notification on success/error
- Automatic refetch on success
- No state corruption on failure

### Socket Connection
- Automatic reconnection if disconnected
- Console logging for debugging
- Falls back to polling if WebSocket fails

## Backend Requirements

To fully support these features, the backend must implement:

1. **Endpoint:** `GET /meetings/:id/pending-voters`
   - Returns: `{ meetingId, currentPhase, pendingVoters[], totalPending }`
   - Should only return active participants who haven't submitted

2. **Endpoint:** `PATCH /tasks/:id/approve`
   - Body: `{ isApproved: boolean }`
   - Updates task approval status
   - Triggers `meeting_updated` socket event

3. **Socket Events:**
   - Emit `meeting_updated` when:
     - Phase changes
     - Task is approved/unapproved
     - Any meeting data changes
   - Emit `participants_updated` when:
     - Participant joins/leaves
     - Participant submits vote

4. **Meeting/Task Data:**
   - Include `isApproved` field in task planning submissions
   - Include `task.isApproved` for linked task objects

## Testing Recommendations

1. **Pending Voters:**
   - Verify list updates when participant submits
   - Check online indicators reflect socket connection
   - Test empty state when all voted

2. **Task Visibility:**
   - Participant should not see unapproved tasks from others
   - Participant should see approved tasks
   - Creator should see all tasks always

3. **Task Editing:**
   - Unapproved task should be editable
   - Approved task should be read-only
   - Submit button should hide for approved tasks

4. **Task Approval:**
   - Checkbox should toggle approval
   - UI should update immediately
   - Socket event should trigger refetch for other users
   - Approved tasks should become visible to participants

5. **Real-time Updates:**
   - Connect with two users
   - Have one submit - other should see pending list update
   - Approve task - participant should see it appear in evaluation list

## Files Modified

### New Files
- `src/features/meeting-detail/components/PendingVotersPanel.tsx`
- `src/features/meeting-detail/api/pending-voters.api.ts`

### Modified Files
- `src/features/meeting-detail/hooks/useSocket.ts`
- `src/features/meeting-detail/useMeetingDetailViewModel.ts`
- `src/features/meeting-detail/types.ts`
- `src/features/meeting-detail/components/PhaseContent.tsx`
- `src/features/meeting-detail/components/TaskPlanningForm.tsx`
- `src/features/meeting-detail/components/CreatorSubmissionsPanel.tsx`
- `src/features/meeting-detail/MeetingDetailView.tsx`

## Notes

- Pending voters API uses manual implementation (not generated) until backend OpenAPI spec is updated
- All changes are backward compatible
- No breaking changes to existing functionality
- Follows existing code style and patterns
- Type-safe implementation with proper TypeScript types
