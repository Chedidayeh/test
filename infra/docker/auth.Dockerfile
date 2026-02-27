FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/auth/package*.json ./
RUN npm install

# Copy shared packages
COPY packages/shared ./packages/shared

COPY services/auth/prisma ./prisma
RUN npx prisma generate

COPY services/auth/src ./src
COPY services/auth/tsconfig.json ./

# Rewrite path alias for flat Docker layout
RUN sed -i 's|../../packages/shared|./packages/shared|g' tsconfig.json

RUN npm run build

EXPOSE 3002
CMD ["npm", "run", "start"]