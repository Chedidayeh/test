# Content Service Dockerfile
FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install production dependencies
COPY services/content/package.json services/content/package-lock.json ./

RUN npm install

# Copy shared packages for path alias resolution
COPY packages/shared ./packages/shared

# Copy Prisma schema
COPY services/content/prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY services/content/src ./src
COPY services/content/tsconfig.json ./

# Build TypeScript (if needed)
RUN npm run build

# Expose port
EXPOSE 3003


# Start service
CMD ["npm", "run", "start"]
