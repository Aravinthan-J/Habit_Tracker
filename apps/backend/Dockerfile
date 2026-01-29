# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Force cache bust - remove this line after first successful deploy
ENV CACHE_BUST=2026-01-29

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
CMD npx prisma migrate deploy && node simple-server.js
