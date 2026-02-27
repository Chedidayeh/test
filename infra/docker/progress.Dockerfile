# Progress Service Dockerfile
FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install production dependencies
COPY services/progress/package.json services/progress/package-lock.json ./
RUN npm install

# Copy shared packages
COPY packages/shared ./packages/shared

# Copy Prisma schema
COPY services/progress/prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY services/progress/src ./src
COPY services/progress/tsconfig.json ./

# Rewrite path alias for flat Docker layout
RUN sed -i 's|../../packages/shared|./packages/shared|g' tsconfig.json

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3004


# Start service
CMD ["npm", "run", "start"]
