FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

# Production stage
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json* ./
RUN npm install --production

# Entrypoint for the CLI
ENTRYPOINT ["node", "dist/cli/cli.js"]
CMD ["help"]
