# Docker & Docker Compose Setup - Phase 1 Complete ✅

## Fixed Issues

### 1. ✅ Missing `auth_data` Volume
- **Problem**: `auth-db` service referenced undefined `auth_data` volume
- **Solution**: Added `auth_data:` to the volumes section in `docker-compose.yml`

### 2. ✅ Auth Service Not Routed in Gateway
- **Problem**: Auth service wasn't accessible through the API Gateway
- **Solution**: 
  - Added `/api/auth` proxy route in `services/gateway/src/server.ts`
  - Updated `docker-compose.yml` to pass `AUTH_SERVICE_URL` to gateway
  - Added gateway dependency on `auth-service`

### 3. ✅ Auth Dockerfile Improvements
- **Problem**: Dockerfile had wrong comments and path issues
- **Solution**:
  - Fixed to properly handle optional `package-lock.json`
  - Added Prisma client generation during build
  - Added database migration execution on container startup
  - Uses entrypoint script to run migrations before starting service

### 4. ✅ Environment Configuration
- Auth service properly configured with:
  - `DATABASE_URL` pointing to Docker service: `postgresql://auth_user:auth_pass@auth-db:5432/auth_db`
  - `PORT=3004` matching docker-compose
  - `JWT_SECRET` set (change in production!)

---

## Before Running Docker Compose

### Step 1: Generate Initial Prisma Migration

```bash
cd c:\Users\MSI\Desktop\PFE Project\test\story-game\services\auth

# Generate Prisma client
npx prisma generate

# Create initial migration (interactive - creates migration files)
npx prisma migrate dev --name init
```

This will:
- Create `prisma/migrations/[timestamp]_init/` directory with SQL files
- Generate the Prisma client
- Create the actual database tables

**IMPORTANT**: These migration files MUST exist before Docker can run `prisma migrate deploy`.

### Step 2: (Optional) Verify locally first

```bash
# Make sure you have a local PostgreSQL running on port 5432
# Update DATABASE_URL in .env to local if needed for testing

npm run dev
# Should start on http://localhost:3004
```

### Step 3: Build and Run with Docker

```bash
# From the project root
cd c:\Users\MSI\Desktop\PFE Project\test\story-game

docker compose up --build
```

This will now:
- Build all services including auth-service
- Create all databases and volumes
- Run Prisma migrations automatically
- Start all services on their configured ports
- Gateway accessible at `http://localhost:3000/api/auth`

---

## Testing the Setup

### Health Check (Gateway)
```bash
curl http://localhost:3000/health
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "parent@example.com",
    "name": "John Doe",
    "role": "PARENT"
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## Docker Compose Network

All services are on the `story-network` bridge network:
- **Gateway** (port 3000) → routes to services
- **Auth Service** (port 3004/3004 internal) ← authenticated users
- **Content Service** (port 3001) ← authenticated requests (Phase 2)
- **Progress Service** (port 3002) ← authenticated requests (Phase 2)
- **Auth DB** (port 5435 external, 5432 internal)
- **Content DB** (port 5433 external, 5432 internal)
- **Progress DB** (port 5434 external, 5432 internal)

---

## Troubleshooting

### "docker: invalid compose project"
- Check all volume definitions exist
- Run: `docker compose config` to validate syntax

### Auth service won't start
- Check logs: `docker compose logs auth-service`
- Ensure database migrations ran: `docker compose logs auth-db`
- Verify DATABASE_URL in docker-compose.yml matches service name

### Can't connect to auth-service from gateway
- Services must be on same network (✅ configured)
- Use internal DNS: `http://auth-service:3004` (✅ configured)

---

## Next Steps

**Phase 2**: Add JWT validation middleware to Gateway
- Intercept all requests (except `/api/auth`)
- Verify JWT signature
- Inject `x-user-id` and `x-user-role` headers
- Return 401 if invalid

**Phase 3**: Update Frontend Auth.js config
- Delegate login to Auth Service via Gateway
- Store JWT in Auth.js session
- Add logout functionality
