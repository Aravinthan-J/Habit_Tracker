# Use Node.js 20 LTS
FROM node:20-alpine

# Build argument for cache invalidation (optional)
ARG BUILD_DATE
ARG GIT_COMMIT

# Set working directory
WORKDIR /app

# Copy package files
COPY apps/backend/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy entire prisma directory (schema + migrations)
COPY apps/backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy the simple server
COPY apps/backend/simple-server.js ./

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD echo "=== Checking migrations ===" && \
    ls -la prisma/ && \
    ls -la prisma/migrations/ && \
    echo "=== Running migrations ===" && \
    npx prisma migrate deploy && \
    echo "=== Migration complete. Starting server ===" && \
    node simple-server.js
