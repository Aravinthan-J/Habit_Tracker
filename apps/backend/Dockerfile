# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/api-client/package*.json ./packages/api-client/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/shared-utils/package*.json ./packages/shared-utils/

# Install ALL dependencies (root first, then backend)
RUN npm ci
RUN npm run build:shared
WORKDIR /app/apps/backend
RUN npm ci
RUN npm run generate

# Copy source code
WORKDIR /app
COPY . .

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
