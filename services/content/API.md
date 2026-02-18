# Content Service API Documentation

Professional content service API for the Readdly platform. Manages stories, roadmaps, worlds, challenges, and age groups.

## Service Architecture

```
src/
├── controllers/        # Request handlers & response formatting
│   ├── story.controller.ts
│   ├── roadmap.controller.ts
│   ├── world.controller.ts
│   ├── challenge.controller.ts
│   └── age-group.controller.ts
├── services/          # Business logic & data access layer
│   ├── story.service.ts
│   ├── roadmap.service.ts
│   ├── world.service.ts
│   ├── challenge.service.ts
│   └── age-group.service.ts
├── routes/            # API endpoint definitions
│   ├── story.routes.ts
│   ├── roadmap.routes.ts
│   ├── world.routes.ts
│   ├── challenge.routes.ts
│   ├── age-group.routes.ts
│   └── index.ts       # Route aggregator
├── types/             # TypeScript DTOs & Interfaces
│   └── index.ts
├── utils/             # Utility functions
│   ├── logger.ts      # Structured logging
│   └── response.ts    # Response formatting helpers
└── server.ts          # Express app setup & middleware
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL
- Environment variables configured in `.env`

### Installation
```bash
npm install
npx prisma migrate dev
```

### Development
```bash
npm run dev          # Start with ts-node
npm run dev:watch   # Start with auto-reload
npm run build       # Build TypeScript
npm start           # Run built version
```

## API Endpoints

All endpoints are prefixed with `/api`

### Stories
```
GET    /api/stories                    - List all stories with pagination & filters
GET    /api/stories/:id                - Get single story with all details
GET    /api/stories/world/:worldId     - Get stories in a specific world
GET    /api/stories/count              - Get total stories count
```

**Query Parameters:**
- `limit` (number, default: 20, max: 100) - Results per page
- `offset` (number, default: 0) - Pagination offset
- `worldId` (string) - Filter by world
- `difficulty` (number) - Filter by difficulty (1-5)
- `isMandatory` (boolean) - Filter by mandatory status

**Example:**
```
GET /api/stories?limit=10&offset=0&worldId=world-123&difficulty=3
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "story-1",
      "worldId": "world-1",
      "title": "The Lost Treasure",
      "description": "...",
      "difficulty": 3,
      "isMandatory": true,
      "order": 1,
      "chapters": [...],
      "createdAt": "2026-02-17T...",
      "updatedAt": "2026-02-17T..."
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "pages": 5
  },
  "timestamp": "2026-02-17T..."
}
```

### Roadmaps
```
GET    /api/roadmaps                      - List all roadmaps
GET    /api/roadmaps/:id                  - Get single roadmap with worlds
GET    /api/roadmaps/age-group/:ageGroupId - Get roadmaps for age group
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "roadmap-1",
    "ageGroupId": "age-group-1",
    "themeId": "theme-1",
    "worlds": [
      {
        "id": "world-1",
        "roadmapId": "roadmap-1",
        "name": "Ancient Egypt",
        "description": "...",
        "imageUrl": "...",
        "order": 1,
        "locked": false,
        "requiredStarCount": 0,
        "stories": [...]
      }
    ],
    "createdAt": "2026-02-17T...",
    "updatedAt": "2026-02-17T..."
  },
  "timestamp": "2026-02-17T..."
}
```

### Worlds
```
GET    /api/worlds                    - List all worlds
GET    /api/worlds/:id                - Get single world with stories
GET    /api/worlds/roadmap/:roadmapId - Get worlds in a roadmap
```

### Age Groups
```
GET    /api/age-groups     - List all age groups with roadmaps
GET    /api/age-groups/:id - Get single age group
```

### Challenges
```
GET    /api/challenges                   - List challenges with pagination
GET    /api/challenges/:id               - Get single challenge with answers
GET    /api/challenges/chapter/:chapterId - Get challenges in a chapter
```

**Query Parameters:**
- `limit` (number, default: 20) - Results per page
- `offset` (number, default: 0) - Pagination offset
- `chapterId` (string) - Filter by chapter
- `storyId` (string) - Filter by story
- `type` (string) - Filter by challenge type (MULTIPLE_CHOICE, TRUE_FALSE, RIDDLE, CHOOSE_ENDING, MORAL_DECISION)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "timestamp": "2026-02-17T10:30:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "pages": 5
  },
  "timestamp": "2026-02-17T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Optional detailed message",
  "timestamp": "2026-02-17T10:30:00.000Z"
}
```

## HTTP Status Codes

- `200` - OK: Request successful
- `400` - Bad Request: Invalid parameters
- `404` - Not Found: Resource doesn't exist
- `500` - Internal Server Error: Server error

## Logging

The service uses structured JSON logging with levels:
- `ERROR` - Critical errors
- `WARN` - Warnings
- `INFO` - General information (default)
- `DEBUG` - Detailed debug information

Set log level via `LOG_LEVEL` environment variable:
```bash
LOG_LEVEL=debug npm run dev
```

## Error Handling

All endpoints include:
- Input validation
- Try-catch error handling
- Structured error logging
- User-friendly error messages

## Database Schema

See `prisma/schema.prisma` for the complete data model:

```
AgeGroup
  ├── Roadmap (1:N)
      ├── Theme (1:1)
      └── World (1:N)
          └── Story (1:N)
              └── Chapter (1:N)
                  └── Challenge (1:1)
                      └── Answer (1:N)

Level (Leveling system)
Milestone (Achievements)
  └── Badge (1:N)
```

## Performance

### Pagination
- Default limit: 20 items
- Maximum limit: 100 items
- Always use pagination for list endpoints

### Database Indexes
- `ageGroupId` on Roadmap
- `roadmapId` on World
- `worldId` on Story
- `storyId` on Chapter
- `chapterId` on Challenge
- `challengeId` on Answer
- `milestoneId` on Badge

## Testing with curl

```bash
# List stories
curl http://localhost:3003/api/stories?limit=5

# Get single story
curl http://localhost:3003/api/stories/story-id

# Get roadmaps
curl http://localhost:3003/api/roadmaps

# Get age groups
curl http://localhost:3003/api/age-groups

# Health check
curl http://localhost:3003/health
```

## Environment Variables

```env
PORT=3003
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/readdly
LOG_LEVEL=info
```

## Next Steps

- [ ] Implement CREATE endpoints (admin only)
- [ ] Implement UPDATE endpoints (admin only)
- [ ] Implement DELETE endpoints (admin only)
- [ ] Add JWT authentication middleware
- [ ] Add role-based access control (RBAC)
- [ ] Add request validation middleware
- [ ] Add OpenAPI/Swagger documentation
- [ ] Add integration tests
- [ ] Add performance monitoring
