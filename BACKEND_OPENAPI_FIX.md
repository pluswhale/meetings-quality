# OpenAPI Spec - Missing Response Schemas

## Issue
The new endpoints (`/meetings/:id/join`, `/meetings/:id/leave`, `/meetings/:id/active-participants`, `/meetings/:id/all-submissions`) are defined in the OpenAPI spec but their response schemas are incomplete. This prevents `orval` from generating TypeScript types.

## Required Fixes

### 1. Active Participants Endpoint

**Path**: `/meetings/{id}/active-participants`

**Current Response** (line 731-733):
```json
"200": {
  "description": "Список активных участников"
}
```

**Should be**:
```json
"200": {
  "description": "Список активных участников",
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/ActiveParticipantsResponseDto"
      }
    }
  }
}
```

### 2. All Submissions Endpoint

**Path**: `/meetings/{id}/all-submissions`

**Current Response** (line 764-766):
```json
"200": {
  "description": "Все ответы участников по всем фазам в упрощенном формате"
}
```

**Should be**:
```json
"200": {
  "description": "Все ответы участников по всем фазам в упрощенном формате",
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/AllSubmissionsResponseDto"
      }
    }
  }
}
```

## Required Schema Definitions

Add these to `components/schemas` in the OpenAPI spec:

### ActiveParticipantsResponseDto
```json
"ActiveParticipantsResponseDto": {
  "type": "object",
  "properties": {
    "meetingId": {
      "type": "string",
      "description": "ID встречи"
    },
    "activeParticipants": {
      "type": "array",
      "description": "Список активных участников",
      "items": {
        "type": "object",
        "properties": {
          "_id": {
            "type": "string"
          },
          "fullName": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "isActive": {
            "type": "boolean"
          },
          "joinedAt": {
            "type": "string",
            "format": "date-time"
          },
          "lastSeen": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["_id", "fullName", "email", "isActive", "joinedAt"]
      }
    },
    "totalParticipants": {
      "type": "number",
      "description": "Общее количество участников"
    },
    "activeCount": {
      "type": "number",
      "description": "Количество активных участников"
    }
  },
  "required": ["meetingId", "activeParticipants", "totalParticipants", "activeCount"]
}
```

### AllSubmissionsResponseDto
```json
"AllSubmissionsResponseDto": {
  "type": "object",
  "properties": {
    "meetingId": {
      "type": "string"
    },
    "submissions": {
      "type": "object",
      "properties": {
        "emotional_evaluation": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/components/schemas/EmotionalEvaluationSubmission"
          }
        },
        "understanding_contribution": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/components/schemas/UnderstandingContributionSubmission"
          }
        },
        "task_planning": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/components/schemas/TaskPlanningSubmission"
          }
        }
      }
    }
  },
  "required": ["meetingId", "submissions"]
}
```

### EmotionalEvaluationSubmission
```json
"EmotionalEvaluationSubmission": {
  "type": "object",
  "properties": {
    "participant": {
      "type": "object",
      "properties": {
        "_id": { "type": "string" },
        "fullName": { "type": "string" },
        "email": { "type": "string" }
      },
      "required": ["_id", "fullName", "email"]
    },
    "submitted": {
      "type": "boolean"
    },
    "submittedAt": {
      "type": "string",
      "format": "date-time",
      "nullable": true
    },
    "evaluations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "targetParticipant": {
            "type": "object",
            "properties": {
              "_id": { "type": "string" },
              "fullName": { "type": "string" }
            },
            "required": ["_id", "fullName"]
          },
          "emotionalScale": {
            "type": "number"
          },
          "isToxic": {
            "type": "boolean"
          }
        },
        "required": ["targetParticipant", "emotionalScale", "isToxic"]
      }
    }
  },
  "required": ["participant", "submitted"]
}
```

### UnderstandingContributionSubmission
```json
"UnderstandingContributionSubmission": {
  "type": "object",
  "properties": {
    "participant": {
      "type": "object",
      "properties": {
        "_id": { "type": "string" },
        "fullName": { "type": "string" },
        "email": { "type": "string" }
      },
      "required": ["_id", "fullName", "email"]
    },
    "submitted": {
      "type": "boolean"
    },
    "submittedAt": {
      "type": "string",
      "format": "date-time",
      "nullable": true
    },
    "understandingScore": {
      "type": "number"
    },
    "contributions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "participant": {
            "type": "object",
            "properties": {
              "_id": { "type": "string" },
              "fullName": { "type": "string" }
            },
            "required": ["_id", "fullName"]
          },
          "contributionPercentage": {
            "type": "number"
          }
        },
        "required": ["participant", "contributionPercentage"]
      }
    }
  },
  "required": ["participant", "submitted"]
}
```

### TaskPlanningSubmission
```json
"TaskPlanningSubmission": {
  "type": "object",
  "properties": {
    "participant": {
      "type": "object",
      "properties": {
        "_id": { "type": "string" },
        "fullName": { "type": "string" },
        "email": { "type": "string" }
      },
      "required": ["_id", "fullName", "email"]
    },
    "submitted": {
      "type": "boolean"
    },
    "submittedAt": {
      "type": "string",
      "format": "date-time",
      "nullable": true
    },
    "taskDescription": {
      "type": "string"
    },
    "deadline": {
      "type": "string",
      "format": "date-time"
    },
    "expectedContributionPercentage": {
      "type": "number"
    }
  },
  "required": ["participant", "submitted"]
}
```

## Security Scheme Issue

Also fix the JWT-auth security scheme (line ~1800+):

**Current**:
```json
"JWT-auth": {
  "type": "http",
  "scheme": "bearer",
  "bearerFormat": "JWT",
  "description": "Введите токен в формате: Bearer {token}"
}
```

**Should be**:
```json
"JWT-auth": {
  "type": "http",
  "scheme": "bearer",
  "bearerFormat": "JWT"
}
```

(Remove the `description` field as it's causing validation errors)

## Steps to Fix

1. Update the OpenAPI spec in your NestJS backend
2. Regenerate the OpenAPI JSON file
3. Copy the updated `openapi.json` to the frontend project
4. Run `npm run api:gen` on the frontend

## Alternative (Quick Fix)

If you can't update the backend immediately, the frontend can use manual API calls (see `src/features/meeting-detail/api/meeting-room.api.ts` that I'll create).
