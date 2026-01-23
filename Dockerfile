# Frontend Dockerfile for React + Vite
FROM node:20-alpine

WORKDIR /app

# Install wget for health checks and OpenAPI fetching
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Install dependencies again in case package.json changed (for dev with volumes)
# Wait for backend OpenAPI and generate API client before starting
CMD ["sh", "-c", "npm install"]
