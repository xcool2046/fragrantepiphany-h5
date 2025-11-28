# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
# The output will be in /app/dist
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /var/www/html

# Copy custom Nginx configuration
# We assume nginx.conf is in the root of the repo, so we need to adjust the context in docker-compose
# OR we can copy it from the build context if we adjust docker-compose.
# Let's assume we will mount it or copy it. 
# For a self-contained image, it's better to COPY it.
# However, the current nginx.conf is in the root ../nginx.conf relative to frontend/
# So we will handle nginx.conf in docker-compose for now to keep it simple, 
# OR we can update the build context.

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
