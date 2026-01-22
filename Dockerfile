# Frontend Dockerfile for React + Vite
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using install instead of ci for flexibility)
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
