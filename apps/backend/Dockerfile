# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
WORKDIR /app/apps/backend
RUN npm install

# Generate Prisma client
RUN npm run generate

# Copy the simple server
COPY simple-server.js ./simple-server.js

# Expose port
EXPOSE 3000

# Start the simple JavaScript server
CMD ["node", "simple-server.js"]
