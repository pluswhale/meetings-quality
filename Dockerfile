# Frontend Dockerfile for React + Vite
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Install dependencies again in case package.json changed (for dev with volumes)
CMD ["sh", "-c", "npm install && npm run dev"]
