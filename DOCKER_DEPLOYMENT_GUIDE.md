# Docker Deployment Guide for Meetings Quality App

This guide will help you containerize both frontend and backend applications and deploy them to Digital Ocean.

## Prerequisites

- Docker and Docker Compose installed locally
- Digital Ocean account
- GitHub repositories for both projects
- MongoDB Atlas account (or you can use MongoDB in Docker)

## Project Structure

```
meetings-quality/          # Frontend repo
meetings-quality-api/      # Backend repo
```

## Part 1: Dockerizing the Backend (NestJS API)

### 1.1 Create Backend Dockerfile

In your `meetings-quality-api` repository, create `Dockerfile`:

```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
```

### 1.2 Create Backend .dockerignore

```
node_modules
dist
.git
.env
*.md
.vscode
.eslintrc.js
.prettierrc
coverage
.github
```

### 1.3 Backend Environment Variables

Create `.env.production` (don't commit this file):

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/meetings-quality
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:5173
```

## Part 2: Dockerizing the Frontend (React + Vite)

### 2.1 Create Frontend Dockerfile

In your `meetings-quality` repository, create `Dockerfile`:

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2.2 Create nginx.conf

Create `nginx.conf` in your frontend repository:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (optional, if you want to proxy API calls through nginx)
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2.3 Create Frontend .dockerignore

```
node_modules
dist
.git
.env
*.md
.vscode
.github
coverage
terminals
```

### 2.4 Update Frontend vite.config.ts

Remove the GitHub Pages base path for Docker deployment:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Remove or comment out the base for Docker deployment
  // base: '/meetings-quality/',
});
```

## Part 3: Docker Compose Setup

### 3.1 Create docker-compose.yml

Create this file in a parent directory that contains both repositories, or in one of them:

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongo:
    image: mongo:7.0
    container_name: meetings-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: meetings-quality
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"
    networks:
      - meetings-network

  # Backend API
  backend:
    build:
      context: ./meetings-quality-api
      dockerfile: Dockerfile
    container_name: meetings-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/meetings-quality
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=7d
      - FRONTEND_URL=http://localhost:5173
    depends_on:
      - mongo
    networks:
      - meetings-network
    command: sh -c "sleep 10 && node dist/main"

  # Frontend Application
  frontend:
    build:
      context: ./meetings-quality
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:3000/api
    container_name: meetings-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - meetings-network

networks:
  meetings-network:
    driver: bridge

volumes:
  mongo-data:
    driver: local
```

### 3.2 Create .env file for docker-compose

Create `.env` in the same directory as `docker-compose.yml`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Part 4: Local Testing

### 4.1 Build and Run Locally

```bash
# Clone both repositories in the same directory
cd ~
mkdir meetings-quality-docker
cd meetings-quality-docker

git clone https://github.com/pluswhale/meetings-quality-api.git
git clone https://github.com/pluswhale/meetings-quality.git

# Create docker-compose.yml and .env in this directory

# Build and start all services
docker-compose up --build

# To run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### 4.2 Test the Application

- Frontend: http://localhost
- Backend API: http://localhost:3000/api
- Backend API Docs: http://localhost:3000/api-json

## Part 5: Deploy to Digital Ocean

### Option A: Using Docker Droplet

#### 5.1 Create a Droplet

1. Log in to Digital Ocean
2. Create → Droplets
3. Choose **Docker** from Marketplace
4. Select plan (minimum $6/month recommended)
5. Choose datacenter region
6. Add SSH key
7. Create Droplet

#### 5.2 Connect to Droplet

```bash
ssh root@your_droplet_ip
```

#### 5.3 Clone Repositories

```bash
cd /opt
mkdir meetings-quality-app
cd meetings-quality-app

git clone https://github.com/pluswhale/meetings-quality-api.git
git clone https://github.com/pluswhale/meetings-quality.git
```

#### 5.4 Setup Environment

```bash
# Create .env file
nano .env
```

Add:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### 5.5 Update docker-compose.yml for Production

Update the frontend build args and backend environment:

```yaml
services:
  frontend:
    build:
      context: ./meetings-quality
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://YOUR_DROPLET_IP:3000/api
    # ... rest of config

  backend:
    environment:
      - FRONTEND_URL=http://YOUR_DROPLET_IP
    # ... rest of config
```

#### 5.6 Start Services

```bash
docker-compose up -d --build
```

#### 5.7 Setup Firewall

```bash
# Allow necessary ports
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw enable
```

### Option B: Using Digital Ocean App Platform

#### 5.1 Deploy Backend

1. Go to App Platform → Create App
2. Connect your GitHub repository (meetings-quality-api)
3. Select branch: main
4. Configure:
   - Type: Web Service
   - Build Command: `npm ci && npm run build`
   - Run Command: `node dist/main`
   - Port: 3000
5. Add Environment Variables:
   - `MONGODB_URI`: (use MongoDB Atlas)
   - `JWT_SECRET`: your secret
   - `JWT_EXPIRATION`: 7d
   - `FRONTEND_URL`: (will add after frontend deployment)
6. Deploy

#### 5.2 Deploy Frontend

1. App Platform → Add Component
2. Connect your GitHub repository (meetings-quality)
3. Configure:
   - Type: Static Site
   - Build Command: `npm ci && npm run build`
   - Output Directory: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: your backend URL from step 5.1
5. Deploy

#### 5.3 Update CORS

Go back to backend environment and update `FRONTEND_URL` with your frontend URL.

## Part 6: Production Considerations

### 6.1 Use MongoDB Atlas

Instead of MongoDB in Docker:

```yaml
backend:
  environment:
    - MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/meetings-quality
```

### 6.2 Setup SSL/HTTPS

For Digital Ocean Droplet, use Let's Encrypt:

```bash
# Install certbot
apt update
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com
```

Update nginx.conf for SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of config
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 6.3 Setup Domain

1. Buy domain
2. Add A record pointing to your Droplet IP
3. Update `VITE_API_URL` to use your domain
4. Update `FRONTEND_URL` in backend

### 6.4 Monitoring and Logs

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps

# Restart services
docker-compose restart backend
docker-compose restart frontend
```

### 6.5 Automated Deployment

Create `deploy.sh` on your server:

```bash
#!/bin/bash

cd /opt/meetings-quality-app

# Pull latest changes
cd meetings-quality-api && git pull && cd ..
cd meetings-quality && git pull && cd ..

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Clean up old images
docker system prune -f
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it to deploy updates:
```bash
./deploy.sh
```

## Cost Estimation (Digital Ocean)

### Droplet Option:
- Droplet (2GB RAM, 1 CPU): $12/month
- MongoDB Atlas (Free tier): $0
- Domain: ~$12/year
- **Total: ~$13/month**

### App Platform Option:
- Backend (Basic): $5/month
- Frontend (Static): $3/month
- MongoDB Atlas (Free tier): $0
- Domain: ~$12/year
- **Total: ~$9/month**

## Troubleshooting

### Backend won't connect to MongoDB
```bash
# Check if MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### Frontend can't reach backend
- Check `VITE_API_URL` is correct
- Check CORS settings in backend
- Check if backend port is accessible

### Port conflicts
```bash
# Check what's using port 80
lsof -i :80

# Stop conflicting service
systemctl stop apache2  # or nginx
```

## Summary

**For Production, I recommend:**
1. **App Platform** for ease of deployment and auto-scaling
2. **MongoDB Atlas** for managed database
3. **Custom domain** with SSL for security

**For Development/Testing:**
1. Use docker-compose locally
2. Use Droplet if you need more control

Choose based on your budget and technical requirements!
