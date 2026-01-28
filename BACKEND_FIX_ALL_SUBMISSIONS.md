# Backend Task: Fix `/meetings/:id/all-submissions` Endpoint

## Problem
The frontend is calling `GET /meetings/:id/all-submissions` but the endpoint is either:
1. Not returning data in the correct format
2. Missing the `submissions` field in the response
3. Not properly implemented

## Current Error
```
TypeError: Cannot read properties of undefined (reading 'submissions')
at fetchAllSubmissions (useMeetingDetailViewModel.ts:131)
```

## What Frontend Expects

### Request
```
GET /meetings/:id/all-submissions
Authorization: Bearer {token}
```

### Expected Response Format
```json
{
  "meetingId": "6974f8a5465053ef9139ab8b",
  "submissions": {
    "emotional_evaluation": {
      "697661b4950aa8c3fe16857b": {
        "participant": {
          "_id": "697661b4950aa8c3fe16857b",
          "fullName": "John Doe",
          "email": "john@example.com"
        },
        "submitted": true,
        "submittedAt": "2026-01-27T10:00:00Z",
        "evaluations": [
          {
            "targetParticipant": {
              "_id": "6974c5d9d5a897de85ca695b",
              "fullName": "Jane Smith"
            },
            "emotionalScale": 75,
            "isToxic": false
          }
        ]
      },
      "6974c5d9d5a897de85ca695b": {
        "participant": {
          "_id": "6974c5d9d5a897de85ca695b",
          "fullName": "Jane Smith",
          "email": "jane@example.com"
        },
        "submitted": false
      }
    },
    "understanding_contribution": {
      "697661b4950aa8c3fe16857b": {
        "participant": {
          "_id": "697661b4950aa8c3fe16857b",
          "fullName": "John Doe",
          "email": "john@example.com"
        },
        "submitted": true,
        "submittedAt": "2026-01-27T10:05:00Z",
        "understandingScore": 85,
        "contributions": [
          {
            "participant": {
              "_id": "697661b4950aa8c3fe16857b",
              "fullName": "John Doe"
            },
            "contributionPercentage": 40
          },
          {
            "participant": {
              "_id": "6974c5d9d5a897de85ca695b",
              "fullName": "Jane Smith"
            },
            "contributionPercentage": 60
          }
        ]
      }
    },
    "task_planning": {
      "697661b4950aa8c3fe16857b": {
        "participant": {
          "_id": "697661b4950aa8c3fe16857b",
          "fullName": "John Doe",
          "email": "john@example.com"
        },
        "submitted": true,
        "submittedAt": "2026-01-27T10:10:00Z",
        "taskDescription": "Implement user dashboard",
        "deadline": "2026-02-01T00:00:00Z",
        "expectedContributionPercentage": 70
      }
    }
  }
}
```

## Key Points

### 1. Response MUST Have `submissions` Field
The root response object MUST contain a `submissions` field:

```typescript
{
  meetingId: string,
  submissions: {
    emotional_evaluation?: { ... },
    understanding_contribution?: { ... },
    task_planning?: { ... }
  }
}
```

### 2. All Participants Should Be Included
For each phase, include **ALL** meeting participants, even if they haven't submitted:

```typescript
// If user hasn't submitted yet
{
  "userId": {
    "participant": { _id, fullName, email },
    "submitted": false
  }
}

// If user has submitted
{
  "userId": {
    "participant": { _id, fullName, email },
    "submitted": true,
    "submittedAt": "2026-01-27T10:00:00Z",
    // ... phase-specific data
  }
}
```

### 3. Phase-Specific Data Structures

#### Emotional Evaluation
```typescript
{
  "userId": {
    "participant": { _id, fullName, email },
    "submitted": boolean,
    "submittedAt"?: string,
    "evaluations"?: [
      {
        "targetParticipant": { _id, fullName },
        "emotionalScale": number,
        "isToxic": boolean
      }
    ]
  }
}
```

#### Understanding Contribution
```typescript
{
  "userId": {
    "participant": { _id, fullName, email },
    "submitted": boolean,
    "submittedAt"?: string,
    "understandingScore"?: number,
    "contributions"?: [
      {
        "participant": { _id, fullName },
        "contributionPercentage": number
      }
    ]
  }
}
```

#### Task Planning
```typescript
{
  "userId": {
    "participant": { _id, fullName, email },
    "submitted": boolean,
    "submittedAt"?: string,
    "taskDescription"?: string,
    "deadline"?: string,
    "expectedContributionPercentage"?: number
  }
}
```

## Implementation Pseudocode

```typescript
async getAllSubmissions(meetingId: string, userId: string) {
  // 1. Verify user is creator of meeting
  const meeting = await Meeting.findById(meetingId);
  if (meeting.creatorId !== userId) {
    throw new ForbiddenException('Only creator can view all submissions');
  }

  // 2. Get all participants
  const participants = await User.find({ _id: { $in: meeting.participantIds } });

  // 3. Initialize response structure
  const response = {
    meetingId,
    submissions: {
      emotional_evaluation: {},
      understanding_contribution: {},
      task_planning: {}
    }
  };

  // 4. For each participant, get their submissions
  for (const participant of participants) {
    // Emotional evaluations
    const emotionalEval = meeting.emotionalEvaluations?.find(
      e => e.participantId.toString() === participant._id.toString()
    );
    
    response.submissions.emotional_evaluation[participant._id] = {
      participant: {
        _id: participant._id,
        fullName: participant.fullName,
        email: participant.email
      },
      submitted: !!emotionalEval,
      ...(emotionalEval && {
        submittedAt: emotionalEval.submittedAt,
        evaluations: emotionalEval.evaluations.map(eval => ({
          targetParticipant: {
            _id: eval.targetParticipantId._id,
            fullName: eval.targetParticipantId.fullName
          },
          emotionalScale: eval.emotionalScale,
          isToxic: eval.isToxic
        }))
      })
    };

    // Understanding contributions
    const understandingContrib = meeting.understandingContributions?.find(
      u => u.participantId.toString() === participant._id.toString()
    );
    
    response.submissions.understanding_contribution[participant._id] = {
      participant: {
        _id: participant._id,
        fullName: participant.fullName,
        email: participant.email
      },
      submitted: !!understandingContrib,
      ...(understandingContrib && {
        submittedAt: understandingContrib.submittedAt,
        understandingScore: understandingContrib.understandingScore,
        contributions: understandingContrib.contributions.map(c => ({
          participant: {
            _id: c.participantId._id,
            fullName: c.participantId.fullName
          },
          contributionPercentage: c.contributionPercentage
        }))
      })
    };

    // Task planning
    const taskPlanning = meeting.taskPlannings?.find(
      t => t.participantId.toString() === participant._id.toString()
    );
    
    response.submissions.task_planning[participant._id] = {
      participant: {
        _id: participant._id,
        fullName: participant.fullName,
        email: participant.email
      },
      submitted: !!taskPlanning,
      ...(taskPlanning && {
        submittedAt: taskPlanning.submittedAt,
        taskDescription: taskPlanning.taskDescription,
        deadline: taskPlanning.deadline,
        expectedContributionPercentage: taskPlanning.expectedContributionPercentage
      })
    };
  }

  return response;
}
```

## Testing

### Test Case 1: No Submissions Yet
**Meeting**: 2 participants, no one submitted yet

**Expected Response**:
```json
{
  "meetingId": "...",
  "submissions": {
    "emotional_evaluation": {
      "user1": { "participant": {...}, "submitted": false },
      "user2": { "participant": {...}, "submitted": false }
    },
    "understanding_contribution": {
      "user1": { "participant": {...}, "submitted": false },
      "user2": { "participant": {...}, "submitted": false }
    },
    "task_planning": {
      "user1": { "participant": {...}, "submitted": false },
      "user2": { "participant": {...}, "submitted": false }
    }
  }
}
```

### Test Case 2: Partial Submissions
**Meeting**: 2 participants, user1 submitted emotions, user2 didn't

**Expected Response**:
```json
{
  "meetingId": "...",
  "submissions": {
    "emotional_evaluation": {
      "user1": {
        "participant": {...},
        "submitted": true,
        "submittedAt": "...",
        "evaluations": [...]
      },
      "user2": {
        "participant": {...},
        "submitted": false
      }
    },
    // ... other phases
  }
}
```

## Common Mistakes to Avoid

❌ **Wrong**: Returning only submitted data
```json
{
  "submissions": {
    "emotional_evaluation": {
      "user1": { ... }  // Only user1, missing user2
    }
  }
}
```

✅ **Correct**: Include all participants
```json
{
  "submissions": {
    "emotional_evaluation": {
      "user1": { "submitted": true, ... },
      "user2": { "submitted": false }
    }
  }
}
```

❌ **Wrong**: Missing `submissions` wrapper
```json
{
  "emotional_evaluation": { ... },  // Missing "submissions" wrapper
  "understanding_contribution": { ... }
}
```

✅ **Correct**: Wrap in `submissions` object
```json
{
  "meetingId": "...",
  "submissions": {
    "emotional_evaluation": { ... },
    "understanding_contribution": { ... }
  }
}
```

## Security
- ✅ Only meeting creator can access this endpoint
- ✅ Verify JWT token
- ✅ Verify user is creator: `meeting.creatorId === userId`
- ✅ Return 403 if not creator

## Performance
- Consider caching this response (invalidate on new submissions)
- Use `.lean()` in Mongoose for faster queries
- Populate participant data efficiently

## Questions?
If anything is unclear, check the full specification in `BACKEND_REQUIREMENTS.md`
