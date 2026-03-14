FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm install
COPY . .
RUN npm run build --workspace backend
WORKDIR /app/backend
CMD ["npm", "run", "start"]
