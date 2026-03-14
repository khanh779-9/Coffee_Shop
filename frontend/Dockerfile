FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install
COPY . .
WORKDIR /app/frontend
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
