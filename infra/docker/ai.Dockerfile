# AI Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY services/ai/package.json services/ai/package-lock.json ./

RUN npm install

# Copy source code
COPY services/ai/src ./src
COPY services/ai/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3005

# Start service
CMD ["npm", "run", "start"]
