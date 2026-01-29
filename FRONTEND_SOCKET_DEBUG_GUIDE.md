# Frontend Socket.IO Debugging Guide ✅

## 🔧 Issues Fixed

### 1. **CRITICAL: Wrong Token Key**

**Problem**:
```typescript
// ❌ WRONG - Token not found
const token = localStorage.getItem('token');
```

**Solution**:
```typescript
// ✅ CORRECT - Matches auth.store.ts
const token = localStorage.getItem('auth_token');
```

**Impact**: Socket was connecting without authentication, causing backend to reject connection immediately.

---

### 2. **Enhanced Debugging Logs**

Added comprehensive logging at every step:

#### **Connection Phase**:
```
🔌 Connecting to Socket.IO: http://localhost:3002
🔑 Using token: eyJhbGciOiJIUzI1NI...
✅ Socket.IO connected successfully
   Socket ID: abc123
   Connected to: http://localhost:3002
```

#### **Join Phase**:
```
🚀 Auto-join triggered: connected = true meetingId = meeting_456
📥 Joining meeting room: meeting_456
📨 join_meeting response received: { success: true, ... }
✅ Joined meeting room successfully
👥 Active participants: 2
👥 Participant list: [
  { userId: 'user1', name: 'John Doe' },
  { userId: 'user2', name: 'Jane Smith' }
]
```

#### **Update Phase**:
```
📢 participants_updated event received
   Event meeting ID: meeting_456
   Current meeting ID: meeting_456
   Match: true
🔄 Participants updated: 2 active
👥 Updated participant list: [...]
```

#### **State Changes**:
```
🔍 useSocket state update:
   Connected: true
   Participants: 2
   Meeting ID: meeting_456
   Participant IDs: ['user1', 'user2']
```

---

## 🧪 How to Debug

### **Step 1: Check Token**

Open browser console before opening meeting:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('auth_token'));

// Should return JWT token like:
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**If null**: You're not logged in or token expired

---

### **Step 2: Check Socket Connection**

Navigate to meeting page and watch console:

**Expected**:
```
🔌 Connecting to Socket.IO: <url>
🔑 Using token: <token-prefix>...
✅ Socket.IO connected successfully
   Socket ID: <socket-id>
```

**If you see**:
```
🔴 Socket.IO connection error: Unauthorized
```
- Token is invalid or expired
- Backend JWT_SECRET doesn't match
- Backend auth guard rejecting token

**If you see**:
```
🔴 No auth token found in localStorage!
💡 Available keys: [...]
```
- User not logged in
- Token stored under wrong key

---

### **Step 3: Check Auto-Join**

After connection, should auto-join:

**Expected**:
```
🚀 Auto-join triggered: connected = true meetingId = <id>
📥 Joining meeting room: <meetingId>
📨 join_meeting response received: { success: true, participants: [...] }
✅ Joined meeting room successfully
👥 Active participants: N
```

**If stuck at**:
```
⏸️ Auto-join waiting: { isConnected: false, meetingId: true, socket: true }
```
- Socket not connected yet
- Check Step 2 for connection errors

**If no auto-join at all**:
- meetingId is null
- Check ViewModel is passing meetingId correctly

---

### **Step 4: Check Participant Updates**

When another user joins/leaves:

**Expected**:
```
📢 participants_updated event received
   Event meeting ID: <meetingId>
   Current meeting ID: <meetingId>
   Match: true
🔄 Participants updated: N active
👥 Updated participant list: [...]
```

**If event not received**:
- Backend not broadcasting
- Check backend logs for `[JOIN] Broadcasting to room...`
- Verify user successfully joined room

**If event received but ignored**:
```
📢 participants_updated event received
   Event meeting ID: meeting_123
   Current meeting ID: meeting_456
   Match: false
⏭️ Ignoring update for different meeting
```
- Meeting ID mismatch
- Multiple meeting tabs open?

---

### **Step 5: Verify Participant List in ViewModel**

Check if ViewModel receives the participants:

**In ViewModel logs**, should see:
```
📋 Socket.IO participants for voting: ['User 1', 'User 2']
🔌 Socket connected: true | Active count: 2
```

**If empty**:
```
⚠️ No socket participants or allUsers available
```
- `socketParticipants` is empty
- `allUsers` query failed
- Check Step 3 & 4

---

## 🔍 Common Issues & Solutions

### **Issue 1: "No auth token found"**

**Logs**:
```
🔴 No auth token found in localStorage!
💡 Available keys: [...]
```

**Cause**: User not authenticated

**Solution**:
1. Log in again
2. Check auth.store.ts is saving token correctly
3. Verify login API returns token

---

### **Issue 2: "Connection error: Unauthorized"**

**Logs**:
```
🔴 Socket.IO connection error: Unauthorized
   Error details: <error>
   Token present: true
   Socket URL: <url>
```

**Cause**: Backend rejecting token

**Solutions**:
1. Check token hasn't expired:
   ```javascript
   // Decode JWT (paste token at jwt.io)
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Expires:', new Date(payload.exp * 1000));
   ```
2. Verify JWT_SECRET matches between frontend and backend
3. Check backend logs for authentication error details

---

### **Issue 3: "Join response: { success: false }"**

**Logs**:
```
📨 join_meeting response received: { success: false, error: "..." }
❌ Failed to join meeting: <error>
```

**Common Causes**:
1. **Meeting not found**: Meeting ID invalid
2. **Not authorized**: User not in meeting.participantIds
3. **Already joined**: Socket already in room (shouldn't fail, just updates)

**Solution**: Check backend logs for specific error

---

### **Issue 4: Participants update but UI doesn't show them**

**Logs**:
```
🔄 Participants updated: 2 active
👥 Updated participant list: [{ userId: 'user1', ... }]
```

But UI still empty.

**Cause**: ViewModel filtering or not using socketParticipants

**Solution**: Check `meetingParticipants` calculation in ViewModel:
```typescript
// Should use socketParticipants
const meetingParticipants = useMemo(() => {
  if (!socketParticipants || !allUsers) return [];
  // ...
}, [socketParticipants, allUsers, currentUser]);
```

**Debug**:
```javascript
// In ViewModel, log the calculation result
console.log('📋 meetingParticipants:', meetingParticipants);
```

---

### **Issue 5: "Cannot join: socket not ready"**

**Logs**:
```
⚠️ Cannot join: socket not ready
   socket: true
   meetingId: meeting_456
   isConnected: false
```

**Cause**: Auto-join called before socket connected

**Solution**: This is normal! Wait for connection:
```
✅ Socket.IO connected successfully
🚀 Auto-join triggered...
📥 Joining meeting room...
```

If stuck here forever, check connection issues (Step 2).

---

### **Issue 6: Multiple Leave Events**

**Logs**:
```
🚪 Component unmounting, leaving meeting
🚪 Page unloading, leaving meeting
📤 Leaving meeting room: meeting_456
📤 Leaving meeting room: meeting_456
```

**Cause**: Both unmount and beforeunload firing

**Impact**: Harmless, backend handles duplicate leaves gracefully

**Optional Fix**: Track if already left to avoid duplicate emits

---

## 📊 Expected Log Flow (Happy Path)

### **Page Load → Meeting Join**:
```
1. 🔌 Connecting to Socket.IO: http://localhost:3002
2. 🔑 Using token: eyJ...
3. ✅ Socket.IO connected successfully
   Socket ID: abc123
4. 🚀 Auto-join triggered: connected = true
5. 📥 Joining meeting room: meeting_456
6. 👂 Registering participants_updated listener
7. 📨 join_meeting response received: { success: true }
8. ✅ Joined meeting room successfully
9. 👥 Active participants: 1
10. 🔍 useSocket state update:
    Connected: true
    Participants: 1
11. 📋 Socket.IO participants for voting: ['Current User']
```

### **Another User Joins**:
```
1. 📢 participants_updated event received
   Event meeting ID: meeting_456
   Current meeting ID: meeting_456
   Match: true
2. 🔄 Participants updated: 2 active
3. 👥 Updated participant list: [
     { userId: 'user1', name: 'Current User' },
     { userId: 'user2', name: 'Other User' }
   ]
4. 🔍 useSocket state update:
   Connected: true
   Participants: 2
5. 📋 Socket.IO participants for voting: ['Current User', 'Other User']
```

### **User Leaves**:
```
1. 🚪 Component unmounting, leaving meeting
2. 📤 Leaving meeting room: meeting_456
3. ✅ Left meeting room successfully
4. 🧹 Cleaning up Socket.IO connection
5. ❌ Socket.IO disconnected: io client disconnect
```

---

## 🎯 Checklist for Troubleshooting

**Before debugging, verify**:

- [ ] User is logged in (token in localStorage)
- [ ] Token is valid (not expired)
- [ ] Backend Socket.IO server is running
- [ ] VITE_API_URL is set correctly
- [ ] Meeting ID is valid
- [ ] User is invited to meeting (in participantIds)

**Connection Phase**:
- [ ] Socket connects successfully
- [ ] No "Unauthorized" error
- [ ] Socket ID appears in logs
- [ ] Auto-join triggers after connection

**Join Phase**:
- [ ] join_meeting event emitted
- [ ] Backend returns success: true
- [ ] Participant count > 0
- [ ] participants_updated listener registered

**Update Phase**:
- [ ] participants_updated events received
- [ ] Meeting IDs match
- [ ] Participant list updates in state
- [ ] ViewModel receives updated list

**UI Phase**:
- [ ] meetingParticipants calculated from socketParticipants
- [ ] Not accidentally filtered out
- [ ] Component re-renders with new data
- [ ] UI shows participant names/count

---

## 🔬 Manual Testing

### **Test 1: Single User**
1. Log in
2. Create/join meeting
3. Check console for connection logs
4. Verify you appear in participant list

**Expected**: 1 participant (yourself)

---

### **Test 2: Multiple Users**
1. Open meeting in tab A
2. Open same meeting in incognito tab B (different user)
3. Both tabs should show 2 participants
4. Close tab B
5. Tab A should show 1 participant

**Expected**: Real-time updates in both directions

---

### **Test 3: Reconnection**
1. Join meeting
2. Disconnect internet
3. Wait for disconnect log
4. Reconnect internet
5. Watch for reconnection and auto-rejoin

**Expected**: Seamless reconnection

---

### **Test 4: Page Refresh**
1. Join meeting with another user
2. Refresh page
3. Should reconnect and see both users

**Expected**: State recovers after refresh

---

## 📁 Files Modified

1. ✅ `src/features/meeting-detail/hooks/useSocket.ts`
   - Fixed token key (`auth_token` not `token`)
   - Added comprehensive logging at every step
   - Added error details in connection failure
   - Added state change debugging

2. ✅ `FRONTEND_SOCKET_DEBUG_GUIDE.md` (this file)
   - Complete debugging guide
   - Common issues and solutions
   - Expected log patterns
   - Testing procedures

---

## 🚀 Next Steps

1. **Clear Browser Cache**: Remove old localStorage data
2. **Fresh Login**: Ensure new token is stored
3. **Open Meeting**: Check console logs follow happy path
4. **Test Multi-User**: Open in multiple tabs/browsers
5. **Verify Backend**: Check backend logs match frontend events

---

## ✅ Success Indicators

**System Working**:
```
✅ Socket.IO connected successfully
✅ Joined meeting room successfully
👥 Active participants: N (N > 0)
🔍 useSocket state update: Participants: N
📋 Socket.IO participants for voting: ['User 1', 'User 2']
```

**System NOT Working**:
```
❌ One of these is failing:
- Connection
- Join
- Participant list
- UI rendering
```

Use the logs to identify which step is failing, then apply the solutions above! 🎯
