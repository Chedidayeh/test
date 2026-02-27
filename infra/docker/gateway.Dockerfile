# Gateway Service Dockerfile
FROM node:18-slim

WORKDIR /app

# Install production dependencies
COPY services/gateway/package.json services/gateway/package-lock.json ./
RUN npm install

# Copy shared packages
COPY packages/shared ./packages/shared

# Copy source code
COPY services/gateway/src ./src
COPY services/gateway/tsconfig.json ./

# Rewrite path alias for flat Docker layout
RUN sed -i 's|../../packages/shared|./packages/shared|g' tsconfig.json

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001


# Start service
CMD ["npm", "run", "start"]
