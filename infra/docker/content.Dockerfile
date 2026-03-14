FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json
COPY services/content/package*.json ./services/content/

# Copy shared package
COPY packages/shared ./packages/shared

# Install dependencies inside content service
WORKDIR /app/services/content
RUN npm install

# Copy prisma
COPY services/content/prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY services/content/src ./src
COPY services/content/tsconfig.json ./

# Go back to root
WORKDIR /app

# Build service
RUN cd services/content && npm run build

EXPOSE 3003

WORKDIR /app/services/content
CMD ["npm", "run", "start"]