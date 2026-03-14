# story-game

Minimal start guide (local dev)

Prerequisites
- Node.js (LTS) and npm

Quick start
1. Install root dependencies:

	`npm install`

2. Build shared packages and the web app:

	`npm run build`

3. Run the web app (apps/web):

	`cd apps/web`
	`npm run dev`

4. Install service dependencies:

	`npm run install:all`

5. Set the `DATABASE_URL` environment variable for services using Prisma (example PowerShell):

	`$env:DATABASE_URL="postgres://user:pass@localhost:5432/db"`

6. Generate Prisma clients:

	`npm run prisma:generate`

7. Build all services:

	`npm run build:all`

8. Start services:

	`npm run start:all` or `npm run dev`

Notes
- Use the `apps/web` dev server for frontend work and run backend services in parallel for full functionality.