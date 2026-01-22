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

# Install dependencies with ts-node
RUN npm ci
RUN npm install -g ts-node

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/apps/backend
RUN npm run generate

# Expose port
EXPOSE 3000

# Start the server with ts-node
CMD ["ts-node", "src/server.ts"]
