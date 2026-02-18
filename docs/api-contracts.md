# API Contracts — Readly MVP v1

---

## 1. Authentication Service

### 1.1 Register (Parent/Admin)

**Endpoint :** `POST /api/auth/register`

**Request Body :**
```json
{
  "email": "parent@example.com",
  "password": "SecurePassword123!",
  "name": "Parent Name"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "user-123-uuid",
    "email": "parent@example.com",
    "name": "Parent Name",
    "role": "PARENT"
  }
}
```

Notes:
- The registration endpoint creates the user but does NOT issue a JWT. Authentication (JWT issuance) is handled by the login endpoint.

**Errors:**
- `400 Bad Request`: Missing/invalid fields (e.g. missing `email`, `password`, or `name`, or password too short).
- `409 Conflict`: User already exists with the provided email.

Example 400 response:
```json
{
  "error": "Missing required fields: email, password, name"
}
```

Example 409 response:
```json
{
  "error": "User already exists with this email"
}
```

---

### 1.2 Login

**Endpoint :** `POST /api/auth/login`

**Request Body :**
```json
{
  "email": "parent@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK) :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123-uuid",
    "email": "parent@example.com",
    "name": "Parent Name",
    "role": "PARENT"
  },
  "expiresIn": 86400
}
```

Notes:
- Successful login issues a JWT (`token`) and also creates a server-side session record. The token expiry is 24 hours by default (`expiresIn: 86400`).

**Error (401 Unauthorized):**
```json
{
  "error": "No account found with this email"
}
```

or

```json
{
  "error": "Password is incorrect, please try again"
}
```

---

### 1.3 Google OAuth (temporarily disabled)

The Google OAuth token verification endpoint has been removed from the public API surface for now. If/when OAuth is reintroduced, the contract will be updated with request/response examples and migration notes.

---

### 1.4 Create Child Profile

**Endpoint :** `POST /api/auth/children`

**Headers :**
```
Authorization: Bearer <parentJWT>
```

**Request Body :**
```json
{
  "name": "Emma",
  "age": 8,
  "avatarUrl": "https://example.com/avatar-green.png"
}
```

**Response (201 Created) :**
```json
{
  "childId": "child-789-uuid",
  "name": "Emma",
  "age": 8,
  "accessCode": "ABC123DEF",
  "parentId": "user-123-uuid",
  "createdAt": "2026-02-12T10:00:00Z"
}
```

---

### 1.5 Login as Child

**Endpoint :** `POST /api/auth/login-child`

**Request Body :**
```json
{
  "accessCode": "ABC123DEF"
}
```

**Response (200 OK) :**
```json
{
  "childId": "child-789-uuid",
  "parentId": "user-123-uuid",
  "name": "Emma",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "child",
  "expiresIn": 86400
}
```

---

### 1.6 Health Check

**Endpoint :** `GET /api/health`

**Response (200 OK) :**
```json
{
  "status": "healthy",
  "service": "gateway",
  "timestamp": "2026-02-12T10:00:00Z"
}
```

---

## 2. Content Service

### 2.1 Get Stories (Published Only)

**Endpoint :** `GET /api/stories`

**Query Parameters :**
- `level` : "beginner" | "intermediate" | "advanced" (optional)
- `limit` : 20 (default)
- `offset` : 0 (default)

**Response (200 OK) :**
```json
{
  "stories": [
    {
      "storyId": "story-1-uuid",
      "title": "The Lost Treasure",
      "description": "An adventure story for young readers",
      "level": "intermediate",
      "coverImageUrl": "https://example.com/cover.jpg",
      "estimatedReadTime": 15,
      "publishedAt": "2026-02-01T00:00:00Z",
      "riddleCount": 5
    },
    {
      "storyId": "story-2-uuid",
      "title": "Magic Forest",
      "description": "A tale of mystery and discovery",
      "level": "beginner",
      "coverImageUrl": "https://example.com/magic-forest.jpg",
      "estimatedReadTime": 10,
      "publishedAt": "2026-02-05T00:00:00Z",
      "riddleCount": 3
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### 2.2 Get Story Detail (with Riddles)

**Endpoint :** `GET /api/stories/:storyId`

**Response (200 OK) :**
```json
{
  "storyId": "story-1-uuid",
  "title": "The Lost Treasure",
  "description": "An adventure story for young readers",
  "level": "intermediate",
  "content": [
    {
      "nodeId": "node-1",
      "type": "text",
      "text": "Once upon a time, in a land far away...",
      "imageUrl": "https://example.com/node1.jpg"
    },
    {
      "nodeId": "node-2",
      "type": "riddle",
      "riddle": {
        "riddleId": "riddle-1-uuid",
        "statement": "I have a face and two hands, but no arms or legs. What am I?",
        "difficulty": "easy",
        "acceptedAnswers": ["clock", "watch"],
        "hints": [
          {
            "level": 1,
            "text": "I'm usually hanging on a wall",
            "imageUrl": null
          },
          {
            "level": 2,
            "text": "I help you know the time",
            "imageUrl": "https://example.com/clock-hint.jpg"
          },
          {
            "level": 3,
            "text": "The answer is CLOCK",
            "imageUrl": null
          }
        ]
      }
    }
  ],
  "publishedAt": "2026-02-01T00:00:00Z"
}
```

---

### 2.3 Create Story (Admin Only)

**Endpoint :** `POST /api/stories`

**Headers :**
```
Authorization: Bearer <adminJWT>
```

**Request Body :**
```json
{
  "title": "The Lost Treasure",
  "description": "An adventure story",
  "level": "intermediate",
  "coverImageUrl": "https://example.com/cover.jpg",
  "content": [
    {
      "nodeId": "node-1",
      "type": "text",
      "text": "Once upon a time...",
      "imageUrl": null
    },
    {
      "nodeId": "node-2",
      "type": "riddle",
      "riddleData": {
        "statement": "What am I?",
        "difficulty": "easy",
        "acceptedAnswers": ["answer1", "answer2"],
        "hints": [
          { "level": 1, "text": "Hint 1" },
          { "level": 2, "text": "Hint 2" },
          { "level": 3, "text": "Hint 3" }
        ]
      }
    }
  ]
}
```

**Response (201 Created) :**
```json
{
  "storyId": "story-123-uuid",
  "status": "draft",
  "message": "Story created successfully"
}
```

**Error (403 Forbidden) :**
```json
{
  "error": "Only administrators can create stories",
  "code": "PERMISSION_DENIED"
}
```

---

### 2.4 Publish Story (Admin Only)

**Endpoint :** `PUT /api/stories/:storyId/publish`

**Headers :**
```
Authorization: Bearer <adminJWT>
```

**Response (200 OK) :**
```json
{
  "storyId": "story-123-uuid",
  "status": "published",
  "publishedAt": "2026-02-12T10:00:00Z"
}
```

---

### 2.5 Health Check

**Endpoint :** `GET /api/content/health`

**Response (200 OK) :**
```json
{
  "status": "healthy",
  "service": "content-service",
  "database": "connected"
}
```

---

## 3. Progress Service

### 3.1 Record Attempt

**Endpoint :** `POST /api/attempts`

**Headers :**
```
Authorization: Bearer <JWT>
Content-Type: application/json
x-user-id: child-789-uuid
x-user-role: child
```

**Request Body :**
```json
{
  "storyId": "story-1-uuid",
  "riddleId": "riddle-1-uuid",
  "nodeId": "node-2",
  "submittedAnswer": "clock",
  "timeToAnswer": 45
}
```

**Response (201 Created) :**
```json
{
  "attemptId": "attempt-123-uuid",
  "childId": "child-789-uuid",
  "storyId": "story-1-uuid",
  "riddleId": "riddle-1-uuid",
  "result": "correct",
  "feedback": "Correct! A clock has a face and two hands!",
  "stars": 3,
  "hintsUsed": 0,
  "recordedAt": "2026-02-12T10:00:00Z"
}
```

---

### 3.2 Get Child Metrics

**Endpoint :** `GET /api/users/:childId/metrics`

**Headers :**
```
Authorization: Bearer <parentJWT>
x-user-id: user-123-uuid
x-user-role: parent
```

**Query Parameters :**
- `from` : Start date (ISO 8601, optional)
- `to` : End date (ISO 8601, optional)

**Response (200 OK) :**
```json
{
  "childId": "child-789-uuid",
  "childName": "Emma",
  "period": {
    "from": "2026-02-01T00:00:00Z",
    "to": "2026-02-12T23:59:59Z"
  },
  "totalAttempts": 47,
  "correctAttempts": 35,
  "successRate": 0.744,
  "totalTimeSpent": 725,
  "averageTimePerRiddle": 15.4,
  "hintsUsed": 12,
  "hintsPerAttempt": 0.26,
  "totalStarsEarned": 89,
  "storiesCompleted": 4,
  "topFailedRiddles": [
    {
      "riddleId": "riddle-5-uuid",
      "statement": "What has ears but cannot hear?",
      "failureCount": 3
    },
    {
      "riddleId": "riddle-8-uuid",
      "statement": "I have cities but no houses. What am I?",
      "failureCount": 2
    }
  ]
}
```

---

### 3.3 Get Story Top Failed Riddles

**Endpoint :** `GET /api/stories/:storyId/top-failed`

**Headers :**
```
Authorization: Bearer <adminJWT>
```

**Query Parameters :**
- `limit` : 10 (default)

**Response (200 OK) :**
```json
{
  "storyId": "story-1-uuid",
  "storyTitle": "The Lost Treasure",
  "topFailedRiddles": [
    {
      "riddleId": "riddle-3-uuid",
      "statement": "What moves but has no legs?",
      "failureCount": 156,
      "successRate": 0.38,
      "averageHintsUsed": 1.2
    },
    {
      "riddleId": "riddle-7-uuid",
      "statement": "I can be cracked, made, told, and played. What am I?",
      "failureCount": 142,
      "successRate": 0.42,
      "averageHintsUsed": 1.5
    }
  ]
}
```

---

### 3.4 Health Check

**Endpoint :** `GET /api/progress/health`

**Response (200 OK) :**
```json
{
  "status": "healthy",
  "service": "progress-service",
  "database": "connected"
}
```

---

## 4. AI Service

### 4.1 Validate Answer (Semantic)

**Endpoint :** `POST /api/ai/validate-answer`

**Headers :**
```
Authorization: Bearer <JWT>
Content-Type: application/json
x-user-id: child-789-uuid
```

**Request Body :**
```json
{
  "riddleId": "riddle-1-uuid",
  "submittedAnswer": "wrist watch",
  "acceptedAnswers": ["clock", "watch"],
  "hintsUsed": 1
}
```

**Response (200 OK) :**
```json
{
  "status": "almost_correct",
  "isCorrect": false,
  "similarity": 0.82,
  "feedback": "Close! But the main answer is CLOCK.",
  "suggestions": ["clock"]
}
```

**Alternative Response (Correct) :**
```json
{
  "status": "correct",
  "isCorrect": true,
  "similarity": 1.0,
  "feedback": "Excellent! That is correct!",
  "suggestions": []
}
```

---

### 4.2 Generate Hint

**Endpoint :** `POST /api/ai/generate-hint`

**Headers :**
```
Authorization: Bearer <JWT>
x-user-id: child-789-uuid
```

**Request Body :**
```json
{
  "riddleId": "riddle-1-uuid",
  "riddleStatement": "I have a face and two hands, but no arms or legs. What am I?",
  "hintLevel": 1,
  "context": "Lost Treasure story, section about time"
}
```

**Response (200 OK) :**
```json
{
  "hintId": "hint-1-uuid",
  "hintLevel": 1,
  "hintText": "I'm usually hanging on a wall",
  "hintImageUrl": null
}
```

---

### 4.3 Health Check

**Endpoint :** `GET /api/ai/health`

**Response (200 OK) :**
```json
{
  "status": "healthy",
  "service": "ai-service",
  "mode": "mock"
}
```

---

## Error Responses (Standard)

All endpoints may return standardized error responses.

### 400 Bad Request
```json
{
  "error": "Invalid request payload",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid token",
  "code": "AUTH_REQUIRED"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "code": "PERMISSION_DENIED"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Summary

| Service | Endpoint | Method | Auth | Role |
|---------|----------|--------|------|------|
| Auth | `/api/auth/register` | POST | - | public |
| Auth | `/api/auth/login` | POST | - | public |
| Auth | `/api/auth/verify-google` | POST | - | public |
| Auth | `/api/auth/children` | POST | JWT | parent |
| Auth | `/api/auth/login-child` | POST | - | public |
| Content | `GET /api/stories` | GET | optional | public |
| Content | `GET /api/stories/:storyId` | GET | optional | public |
| Content | `POST /api/stories` | POST | JWT | admin |
| Content | `PUT /api/stories/:storyId/publish` | PUT | JWT | admin |
| Progress | `POST /api/attempts` | POST | JWT | child |
| Progress | `GET /api/users/:childId/metrics` | GET | JWT | parent/admin |
| Progress | `GET /api/stories/:storyId/top-failed` | GET | JWT | admin |
| AI | `POST /api/ai/validate-answer` | POST | JWT | child |
| AI | `POST /api/ai/generate-hint` | POST | JWT | child |

---

**Next Step :** Implémenter les endpoints dans Express, tester avec Postman/Insomnia, puis intégrer au frontend.
