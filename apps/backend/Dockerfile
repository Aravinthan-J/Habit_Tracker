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

# Create startup script
RUN echo '#!/bin/sh\n\
echo "=== Starting Habity API ==="\n\
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."\n\
echo ""\n\
echo "=== Running Prisma Migrations ==="\n\
npx prisma migrate deploy || { echo "Migration failed!"; exit 1; }\n\
echo ""\n\
echo "=== Migrations Complete ==="\n\
echo ""\n\
echo "=== Starting Node Server ==="\n\
node dist/server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start server with migrations
CMD ["/bin/sh", "/app/start.sh"]
