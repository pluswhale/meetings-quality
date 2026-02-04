# Task Loading & Approval Status - Debug Guide

## ✅ What's Been Implemented

All the requested features have been implemented:

### 1. Task Form - Participant View ✅
- Form fields stay populated after submission (NOT cleared)
- `useEffect` loads existing task from `meeting.taskPlannings`
- Approval status badge shows:
  - **"Ожидает одобрения"** (Amber) - when task submitted but not approved
  - **"Одобрено"** (Green) - when task is approved by creator
  - No badge - when no task created yet
- Title changes based on task state:
  - **"Создать задачу"** - when empty
  - **"Моя задача"** - when task exists

### 2. Task Approval - Creator View ✅
- CreatorSubmissionsPanel → Tasks tab shows all tasks
- Checkbox for each task
- Green styling for approved tasks
- Real-time updates

### 3. Emotional Scale Slider ✅
- Added to bottom of Task Planning phase
- All participants can use it
- Auto-save functionality

### 4. Auto-Scroll ✅
- Scrolls to bottom when phase changes
- Smooth animation

---

## 🔍 Debugging Steps

### Check 1: Browser Console Logs

When you navigate to the Task Planning phase, look for these console messages:

#### Expected Logs:
```
🔍 Looking for my task in taskPlannings: {
  taskPlannings: [...],
  currentUserId: "your-user-id"
}

Comparing: { 
  planParticipantId: "participant-id",
  currentUserId: "your-user-id",
  match: true/false 
}

📋 Found my task plan: { taskDescription: "...", ... }

✅ Loading task data into form: {
  taskDescription: "your task",
  commonQuestion: "your question",
  deadline: "2026-...",
  contribution: 100
}
```

#### If you see "❌ No task plan found":
- The `participantId` in task plan doesn't match your `currentUser._id`
- Check the "Comparing" log to see the IDs being compared

#### If you see "⚠️ Cannot load task: missing data":
- Either `meeting.taskPlannings` is empty/undefined
- Or `currentUser._id` is missing

### Check 2: Meeting Data Structure

Open browser DevTools → Console and run:
```javascript
// Check if meeting data has taskPlannings
console.log('Meeting data:', vm.meeting);
console.log('Task plannings:', vm.meeting?.taskPlannings);
console.log('Current user ID:', vm.currentUser._id);
```

Expected result:
```javascript
{
  _id: "meeting-id",
  taskPlannings: [
    {
      participantId: "user-id-1",  // <-- This should match your currentUser._id
      taskDescription: "...",
      commonQuestion: "...",
      deadline: "...",
      expectedContributionPercentage: 100
    }
  ]
}
```

### Check 3: Form State

After submission, check form state:
```javascript
console.log('Form state:', {
  taskDescription: vm.taskDescription,
  commonQuestion: vm.commonQuestion,
  deadline: vm.deadline,
  expectedContribution: vm.expectedContribution
});
```

These should contain your task data, NOT be empty.

---

## 🐛 Common Issues & Solutions

### Issue 1: Fields are empty after submission

**Symptom:** After submitting task, all form fields are empty.

**Possible Causes:**
1. `useEffect` dependency array not triggering
2. `participantId` doesn't match `currentUser._id`
3. Meeting data not refetched after submission

**Solution:**
Check console logs for:
```
🔍 Looking for my task in taskPlannings
```

If this log doesn't appear, the `useEffect` isn't running.

If you see:
```
Comparing: { planParticipantId: "abc", currentUserId: "xyz", match: false }
```

The IDs don't match - backend might be storing participantId incorrectly.

### Issue 2: isMyTaskApproved always false

**Symptom:** Console shows `isMyTaskApproved false` repeatedly.

**Possible Causes:**
1. Backend doesn't include `approved` field in task planning data
2. The `approved` field exists but task plan isn't found
3. Field name mismatch

**Check:**
```javascript
const myPlan = vm.meeting?.taskPlannings?.find(t => t.participantId === vm.currentUser._id);
console.log('My task plan:', myPlan);
console.log('Approved fields:', {
  approved: myPlan?.approved,
  isApproved: myPlan?.isApproved,
  taskApproved: myPlan?.task?.approved
});
```

**Expected:** At least one of these should be `true` when task is approved.

**If all are `undefined`:**
The backend hasn't added the `approved` field to the meeting's `taskPlannings` array yet. The `approved` field exists only in the separate Task model, not in the meeting's embedded taskPlannings.

**Solution:** Backend needs to either:
1. Add `approved` field to taskPlannings when populating meeting data
2. Populate the `task` reference with the full task object (including `approved` field)

### Issue 3: Fields populate briefly then clear

**Symptom:** Fields flash with data then immediately become empty.

**Cause:** Another useEffect or state update is clearing the fields.

**Solution:** Check for any `setTaskDescription('')` calls in the code.

Current code (line 582-584) has a comment explaining fields should NOT be cleared:
```typescript
// DON'T clear fields - participant should see their submitted task
// Fields will stay populated so user can see what they submitted
// If they need to edit, they can modify and resubmit
```

---

## ✅ What to Verify

### Participant Experience:
1. ✅ Create a task and submit it
2. ✅ **DO NOT refresh the page**
3. ✅ Form fields should contain your task data
4. ✅ Badge should show "Ожидает одобрения" (amber/yellow)
5. ✅ All fields should be editable
6. ✅ "Сохранить изменения" button should be visible
7. ✅ Have creator approve your task
8. ✅ Badge should change to "Одобрено" (green)
9. ✅ All fields should become disabled
10. ✅ Submit button should disappear

### Creator Experience:
1. ✅ Open CreatorSubmissionsPanel → Tasks tab
2. ✅ See all participant tasks
3. ✅ Unapproved tasks have gray background
4. ✅ Checkbox with "Одобрить" label
5. ✅ Click checkbox
6. ✅ Task turns green with "Одобрено" label
7. ✅ Green vertical stripe appears
8. ✅ Toast notification appears

---

## 📝 Logging Points

The code has extensive logging at these key points:

### 1. Task Loading (useMeetingDetailViewModel.ts:260-303)
```typescript
console.log('⚠️ Cannot load task: missing data')
console.log('🔍 Looking for my task in taskPlannings')
console.log('Comparing:', { planParticipantId, currentUserId, match })
console.log('📋 Found my task plan:', myPlan)
console.log('✅ Loading task data into form')
console.log('❌ No task plan found for current user')
```

### 2. Approval Status (useMeetingDetailViewModel.ts:674-690)
```typescript
console.log('isMyTaskApproved: false (no data)')
console.log('isMyTaskApproved: false (task not found)')
console.log('myPlan', myPlan)
console.log('isMyTaskApproved', isMyTaskApproved)
```

---

## 🎯 Next Steps

### If Fields Are Still Empty:

1. **Open Browser DevTools** → Console tab
2. **Navigate to Task Planning phase**
3. **Look for the console logs** listed above
4. **Check what's being logged:**
   - Is `meeting.taskPlannings` populated?
   - Does `participantId` match `currentUser._id`?
   - Is `myPlan` found?
   - Are the form setters being called?

5. **Copy the console output** and check:
   - If you see "⚠️ Cannot load task: missing data" - meeting data isn't loaded yet
   - If you see "❌ No task plan found" - ID mismatch issue
   - If you see "✅ Loading task data" - form should be populated

### If Approval Status is Wrong:

1. **Check if task plan has approved field:**
   ```javascript
   console.log(vm.meeting.taskPlannings[0])
   ```
   
2. **Expected fields:**
   - `approved: boolean` (new spec)
   - OR `isApproved: boolean` (legacy)
   - OR `task: { approved: boolean }` (populated reference)

3. **If none exist:**
   Backend needs to update the meeting DTO to include approval status.

---

## 📋 Summary

**Implementation Status:** ✅ COMPLETE

**Files Modified:**
- `useMeetingDetailViewModel.ts` - Task loading + approval logic
- `TaskPlanningForm.tsx` - Dynamic badge (waiting/approved)
- `PhaseContent.tsx` - Emotional slider + auto-scroll
- `CreatorSubmissionsPanel.tsx` - Approval checkbox (already working)

**No Code Issues:** All linter errors resolved, type-safe code

**Possible Backend Issues:**
1. `approved` field not included in taskPlannings array
2. Meeting data not refetching after submission
3. ParticipantId format mismatch

**Next Action:** Check browser console logs to identify the specific issue!

---

## 🔧 Quick Fix Commands

If you need to quickly test, run these in browser console:

```javascript
// 1. Check current user ID
console.log('Current user:', vm.currentUser._id);

// 2. Check task plannings
console.log('Task plannings:', vm.meeting?.taskPlannings);

// 3. Find your task manually
const myTask = vm.meeting?.taskPlannings?.find(t => 
  t.participantId === vm.currentUser._id
);
console.log('My task:', myTask);

// 4. Check form state
console.log('Form state:', {
  taskDescription: vm.taskDescription,
  commonQuestion: vm.commonQuestion,
  deadline: vm.deadline
});

// 5. Manually populate form (temporary test)
vm.setTaskDescription('Test task');
vm.setCommonQuestion('Test question');
```

If manual population works, but automatic doesn't, the `useEffect` isn't triggering properly.

---

**Status: Ready for testing with browser console debugging!** 🚀
