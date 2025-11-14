# Multi-stage build for React + Vite application

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json only (exclude package-lock.json for Alpine compatibility)
# This allows npm to download platform-specific binaries like @rollup/rollup-linux-x64-musl
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL

# Set environment variables for build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_BASE_URL=${VITE_WS_BASE_URL}

# Build the application (TypeScript type-check + production build)
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy custom nginx configuration as template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set default backend URL (can be overridden at runtime)
ENV BACKEND_URL=http://localhost:8080

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx with entrypoint
CMD ["/docker-entrypoint.sh"]
