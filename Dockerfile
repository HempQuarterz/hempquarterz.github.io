# ============================================================================
# All4Yah Multi-Stage Dockerfile
# ============================================================================
# Builds both frontend and backend into a single optimized image
#
# Usage:
#   docker build -t all4yah .
#   docker run -p 80:80 -p 3001:3001 all4yah
# ============================================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./
RUN npm install --production

# Copy source
COPY backend/ ./

# Stage 3: Production Image
FROM node:20-alpine AS production

# Install nginx
RUN apk add --no-cache nginx

# Create app directory
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html

# Copy backend
COPY --from=backend-builder /app/backend /app/backend

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Expose ports
EXPOSE 80 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start both nginx and node
CMD ["/start.sh"]
