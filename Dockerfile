FROM node:18-alpine

WORKDIR /usr/src/app

# Copy root and backend configs
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN npm --prefix backend install --omit=dev

# Copy project files
COPY backend ./backend
COPY frontend ./frontend
COPY README.md ./

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "backend/server.js"]
