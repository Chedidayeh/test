# AI Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY services/ai/package.json services/ai/package-lock.json ./

RUN npm ci --omit=dev

# Copy source code
COPY services/ai/src ./src
COPY services/ai/tsconfig.json ./

# Build TypeScript (if needed)
RUN npm run build 2>/dev/null || echo "No build script, running direct"

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start service
CMD ["npm", "start"]
