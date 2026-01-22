# API Usage Examples

This document shows how to use the API configuration and hooks in your React components.

## Using the API Configuration Directly

```typescript
import { API_ENDPOINTS } from './config/api';

// In your component
const response = await fetch(API_ENDPOINTS.auth.login, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
```

## Using the useApi Hook

```typescript
import { useApi } from './hooks/useApi';

function LoginComponent() {
  const { makeRequest, loading, error, endpoints } = useApi();

  const handleLogin = async (email: string, password: string) => {
    const data = await makeRequest(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data) {
      console.log('Login successful', data);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={() => handleLogin('user@example.com', 'password')}>
        Login
      </button>
    </div>
  );
}
```

## Using with Authentication Token

```typescript
import { useApi } from './hooks/useApi';

function MeetingsComponent() {
  const token = 'your-jwt-token'; // Get from your auth state
  const { makeRequest, endpoints } = useApi({ token });

  const fetchMeetings = async () => {
    const meetings = await makeRequest(endpoints.meetings.base, {
      method: 'GET',
    });
    
    return meetings;
  };

  const createMeeting = async (meetingData) => {
    const newMeeting = await makeRequest(endpoints.meetings.base, {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
    
    return newMeeting;
  };

  // ... component JSX
}
```

## Available Endpoints

All endpoints are defined in `config/api.ts`:

### Auth
- `endpoints.auth.login` - POST /auth/login
- `endpoints.auth.register` - POST /auth/register
- `endpoints.auth.profile` - GET /auth/profile

### Users
- `endpoints.users.base` - /users
- `endpoints.users.byId(id)` - /users/:id

### Meetings
- `endpoints.meetings.base` - /meetings
- `endpoints.meetings.byId(id)` - /meetings/:id
- `endpoints.meetings.changePhase(id)` - /meetings/:id/phase
- `endpoints.meetings.submitSummary(id)` - /meetings/:id/summary
- `endpoints.meetings.submitEvaluation(id)` - /meetings/:id/evaluation

### Tasks
- `endpoints.tasks.base` - /tasks
- `endpoints.tasks.byId(id)` - /tasks/:id
- `endpoints.tasks.byMeeting(meetingId)` - /tasks?meetingId=:meetingId

### WebSocket
- `endpoints.websocket.url` - WebSocket connection URL

## WebSocket Connection Example

```typescript
import { io } from 'socket.io-client';
import { API_ENDPOINTS } from './config/api';

const socket = io(API_ENDPOINTS.websocket.url, {
  auth: {
    token: 'your-jwt-token',
  },
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('meetingUpdated', (data) => {
  console.log('Meeting updated:', data);
});
```

## Error Handling

The `useApi` hook automatically handles errors and provides them via the `error` state:

```typescript
const { makeRequest, error } = useApi({ token });

const result = await makeRequest(endpoint, options);

if (result) {
  // Success
} else if (error) {
  // Handle error
  console.error(error);
}
```

## TypeScript Types

Define your response types for type safety:

```typescript
interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

const data = await makeRequest<LoginResponse>(endpoints.auth.login, {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

if (data) {
  console.log(data.user.name); // Type-safe!
}
```
