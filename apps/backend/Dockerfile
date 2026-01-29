# Use Node.js 20 LTS
FROM node:20-alpine

# Build argument for cache invalidation (optional)
ARG BUILD_DATE
ARG GIT_COMMIT

# Set working directory
WORKDIR /app

# Copy package files
COPY apps/backend/package*.json ./

# Install ALL dependencies (need TypeScript to build)
RUN npm install

# Copy entire prisma directory (schema + migrations)
COPY apps/backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY apps/backend/src ./src
COPY apps/backend/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Run migrations and start REAL server
CMD npx prisma migrate deploy && node dist/server.js
