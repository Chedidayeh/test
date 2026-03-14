FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json
COPY services/auth/package*.json ./services/auth/

# Copy shared package
COPY packages/shared ./packages/shared

# Install dependencies inside auth service
WORKDIR /app/services/auth
RUN npm install

# Copy prisma
COPY services/auth/prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY services/auth/src ./src
COPY services/auth/tsconfig.json ./

# Go back to root
WORKDIR /app

# Build service
RUN cd services/auth && npm run build

EXPOSE 3002

WORKDIR /app/services/auth
CMD ["npm", "run", "start"]