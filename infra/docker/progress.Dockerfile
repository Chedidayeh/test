# Progress Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY services/progress/package.json services/progress/package-lock.json ./

RUN npm install

# Copy source code
COPY services/progress/src ./src
COPY services/progress/tsconfig.json ./

# Build TypeScript (if needed)
RUN npm run build

# Expose port
EXPOSE 3002


# Start service
CMD ["npm", "run", "start"]
