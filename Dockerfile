# Frontend Dockerfile for React + Vite
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Copy wait script
COPY wait-for-openapi.sh /app/wait-for-openapi.sh
RUN chmod +x /app/wait-for-openapi.sh

# Expose the port
EXPOSE 3000

# Install dependencies again in case package.json changed (for dev with volumes)
# Wait for backend OpenAPI and generate API client before starting
CMD ["sh", "-c", "npm install && /app/wait-for-openapi.sh"]
