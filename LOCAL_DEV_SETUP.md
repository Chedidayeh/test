# Local Development Setup - 504 Gateway Timeout Fix

## Problem Summary
- Gateway can't connect to auth service (504 Gateway Timeout)
- Auth service database not initialized
- Frontend pointing to wrong gateway port

## What We Fixed
✅ Gateway now uses `localhost:3002-3005` for local development
✅ Frontend now points to `localhost:3001` 
✅ Created `.env.local` files for all services

## What You Need To Do

### Option 1: Run with Docker (Recommended for Local Dev)

**Fastest way - Docker handles all database setup:**

```powershell
cd "C:\Users\MSI\Desktop\PFE Project\test\story-game"
docker compose up --build
```

This will:
- Start all services on correct ports
- Set up PostgreSQL databases automatically
- Run Prisma migrations
- Everything connected properly

Then test:
```powershell
# In another terminal
curl http://localhost:3001/health
```

---

### Option 2: Local Development (Without Docker)

If you want to run services locally, you need PostgreSQL.

#### Step 1: Install & Start PostgreSQL

**Windows:**
```powershell
# Using chocolatey
choco install postgresql

# Then start PostgreSQL service
# It runs on port 5432 by default
```

**Or Docker just for databases:**
```powershell
docker run --name postgres-dev `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  -d postgres:15

# Create the auth database
docker exec postgres-dev psql -U postgres -c "CREATE DATABASE auth_db;"
docker exec postgres-dev psql -U postgres -c "CREATE USER auth_user WITH PASSWORD 'auth_pass';"
docker exec postgres-dev psql -U postgres -c "ALTER USER auth_user CREATEDB;"
```

#### Step 2: Create Prisma Migrations for Auth Service

```powershell
cd "C:\Users\MSI\Desktop\PFE Project\test\story-game\services\auth"

# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init
```

This will:
- Create database tables
- Generate migration files in `prisma/migrations/`

#### Step 3: Start Services in Order

**Terminal 1 - Auth Service:**
```powershell
cd "C:\Users\MSI\Desktop\PFE Project\test\story-game\services\auth"
npm run dev
# Should see: Auth Service started on port 3002
```

**Terminal 2 - Gateway:**
```powershell
cd "C:\Users\MSI\Desktop\PFE Project\test\story-game\services\gateway"
npm run dev
# Should see: Gateway running on port 3001
```

**Terminal 3 - Web App:**
```powershell
cd "C:\Users\MSI\Desktop\PFE Project\test\story-game\apps\web"
npm run dev
# Should see: ready - started server on 0.0.0.0:3000
```

#### Step 4: Test the Flow

1. Open http://localhost:3000 in browser
2. Click "Sign up"
3. Fill form: email, password (8+ chars), name
4. Click "Create account"

---

## Expected Results

✅ Registration success: User created, token generated, redirected to dashboard
✅ Logs: Look for `[LoginForm] Auto sign-in successful`
✅ No 504 errors
✅ No CORS errors

## Troubleshooting

**Still getting 504 Gateway Timeout?**
- Check auth service is running on 3002: `curl http://localhost:3002/health`
- Check gateway can reach it: `curl http://localhost:3001/health`
- Check .env.local files are created in each service folder

**Database connection error?**
- Update `DATABASE_URL` in `services/auth/.env.local` to match your PostgreSQL
- Default for local: `postgresql://postgres:postgres@localhost:5432/auth_db`

**CORS errors?**
- Clear browser cache: Ctrl+Shift+Delete
- Restart all services
- Check NEXT_PUBLIC_GATEWAY_URL in `apps/web/.env.local`

---

## Recommended: Use Docker Option 1

It's the simplest - everything works out of the box! ✨
