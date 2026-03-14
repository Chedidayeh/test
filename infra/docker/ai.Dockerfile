FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json
COPY services/ai/package*.json ./services/ai/

# Copy shared package
COPY packages/shared ./packages/shared

# Install dependencies inside ai service
WORKDIR /app/services/ai
RUN npm install

# Copy prisma
COPY services/ai/prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY services/ai/src ./src
COPY services/ai/tsconfig.json ./

# Go back to root
WORKDIR /app

# Build service
RUN cd services/ai && npm run build

EXPOSE 3005

WORKDIR /app/services/ai
CMD ["npm", "run", "start"]