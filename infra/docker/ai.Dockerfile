FROM node:18-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/ai/package*.json ./
RUN npm install

# Copy shared packages
COPY packages/shared ./packages/shared

COPY services/ai/prisma ./prisma
RUN npx prisma generate

COPY services/ai/src ./src
COPY services/ai/tsconfig.json ./

# Rewrite path alias for flat Docker layout
RUN sed -i 's|../../packages/shared|./packages/shared|g' tsconfig.json

RUN npm run build

EXPOSE 3005
CMD ["npm", "run", "start"]