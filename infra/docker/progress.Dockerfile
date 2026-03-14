FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json
COPY services/progress/package*.json ./services/progress/

# Copy shared package
COPY packages/shared ./packages/shared

# Install dependencies inside progress service
WORKDIR /app/services/progress
RUN npm install

# Copy prisma
COPY services/progress/prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY services/progress/src ./src
COPY services/progress/tsconfig.json ./

# Go back to root
WORKDIR /app

# Build service
RUN cd services/progress && npm run build

EXPOSE 3004

WORKDIR /app/services/progress
CMD ["npm", "run", "start"]