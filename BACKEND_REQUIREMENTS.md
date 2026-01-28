# Backend API Requirements for Meeting Room Features

## Overview
Need to add real-time participant tracking and simplified voting data endpoints for the meeting quality platform.

## New Endpoints Required

### 1. Join Meeting Room
**POST** `/meetings/:id/join`

**Description**: Mark participant as actively present in meeting room

**Request**: No body needed (user from JWT)

**Response**:
```json
{
  "meetingId": "string",
  "userId": "string",
  "joinedAt": "2026-01-27T10:00:00Z",
  "activeParticipants": [
    {
      "_id": "user_id",
      "fullName": "string",
      "email": "string",
      "isActive": true,
      "joinedAt": "2026-01-27T10:00:00Z"
    }
  ]
}
```

### 2. Leave Meeting Room
**POST** `/meetings/:id/leave`

**Description**: Mark participant as no longer active (optional - can also handle via timeout)

**Request**: No body needed

**Response**:
```json
{
  "success": true
}
```

### 3. Get Active Participants
**GET** `/meetings/:id/active-participants`

**Description**: Get list of currently active participants in meeting room

**Response**:
```json
{
  "meetingId": "string",
  "activeParticipants": [
    {
      "_id": "user_id",
      "fullName": "string",
      "email": "string",
      "isActive": true,
      "joinedAt": "2026-01-27T10:00:00Z",
      "lastSeen": "2026-01-27T10:15:00Z"
    }
  ],
  "totalParticipants": 5,
  "activeCount": 3
}
```

### 4. Get All Phase Submissions (Simplified)
**GET** `/meetings/:id/all-submissions`

**Description**: Get all submissions from all phases in a simplified format for creator popover

**Response**:
```json
{
  "meetingId": "string",
  "submissions": {
    "emotional_evaluation": {
      "participantId_1": {
        "participant": {
          "_id": "string",
          "fullName": "string",
          "email": "string"
        },
        "submitted": true,
        "submittedAt": "2026-01-27T10:00:00Z",
        "evaluations": [
          {
            "targetParticipant": { "_id": "string", "fullName": "string" },
            "emotionalScale": 50,
            "isToxic": false
          }
        ]
      }
    },
    "understanding_contribution": {
      "participantId_1": {
        "participant": { "_id": "string", "fullName": "string" },
        "submitted": true,
        "submittedAt": "2026-01-27T10:05:00Z",
        "understandingScore": 85,
        "contributions": [
          {
            "participant": { "_id": "string", "fullName": "string" },
            "contributionPercentage": 30
          }
        ]
      }
    },
    "task_planning": {
      "participantId_1": {
        "participant": { "_id": "string", "fullName": "string" },
        "submitted": true,
        "submittedAt": "2026-01-27T10:10:00Z",
        "taskDescription": "string",
        "deadline": "2026-02-01T00:00:00Z",
        "expectedContributionPercentage": 50
      }
    }
  }
}
```

## Implementation Notes

### Participant Tracking
- Consider using a "lastSeen" timestamp that updates on any activity
- Auto-mark as inactive if no activity for 5 minutes
- Store in Redis for performance (optional)
- Emit WebSocket events for real-time updates (optional but recommended)

### Simplified Submissions Format
- Current `/meetings/:id/phase-submissions` can be deprecated or kept for backward compatibility
- New format should be flatter and easier to display in UI
- Include participant info inline to avoid extra lookups
- Only return data for phases that have submissions

### Performance Considerations
- Cache active participants list
- Add pagination if participant count is high (>50)
- Consider WebSocket for real-time active participant updates

### Security
- Verify user is a participant of the meeting
- Only meeting creator can view all submissions
- Participants can only see if others have submitted (not the content)

## Migration Steps
1. Add new endpoints
2. Test with existing frontend
3. Update OpenAPI spec
4. Run `npm run api:gen` on frontend to regenerate types
5. Frontend will be updated to use new endpoints

## Questions for Backend Team
1. Should we use WebSockets for real-time participant tracking?
2. Should we auto-kick inactive participants or just mark as inactive?
3. Do you prefer Redis or database for tracking active users?
4. Should join/leave be automatic on page load/unload or manual?
