# Content Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY services/content/package.json services/content/package-lock.json ./

RUN npm install

# Copy source code
COPY services/content/src ./src
COPY services/content/tsconfig.json ./

# Build TypeScript (if needed)
RUN npm run build

# Expose port
EXPOSE 3003


# Start service
CMD ["npm", "run", "start"]
