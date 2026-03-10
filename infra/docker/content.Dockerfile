# Content Service Dockerfile
FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install production dependencies
COPY services/content/package.json services/content/package-lock.json ./
RUN npm ci

# Copy shared packages
COPY packages/shared ./packages/shared

# Copy Prisma schema
COPY services/content/prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY services/content/src ./src
COPY services/content/tsconfig.json ./

# Rewrite path alias for flat Docker layout
RUN sed -i 's|../../packages/shared|./packages/shared|g' tsconfig.json

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3003


# Start service
CMD ["npm", "run", "start"]
