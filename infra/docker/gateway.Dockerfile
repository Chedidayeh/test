FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json
COPY services/gateway/package*.json ./services/gateway/

# Copy shared package
COPY packages/shared ./packages/shared

# Install dependencies inside gateway service
WORKDIR /app/services/gateway
RUN npm install


# Copy source code
COPY services/gateway/src ./src
COPY services/gateway/tsconfig.json ./

# Go back to root
WORKDIR /app

# Build service
RUN cd services/gateway && npm run build

EXPOSE 3001

WORKDIR /app/services/gateway
CMD ["npm", "run", "start"]