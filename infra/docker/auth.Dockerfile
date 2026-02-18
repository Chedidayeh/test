FROM node:18

WORKDIR /app

COPY services/auth/package*.json ./
RUN npm install

COPY services/auth/prisma ./prisma
RUN npx prisma generate

COPY services/auth/src ./src
COPY services/auth/tsconfig.json ./

RUN npm run build

EXPOSE 3002
CMD ["npm", "run", "start"]