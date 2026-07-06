# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
# Fly routes to internal_port 8080 (see fly.toml); the server reads PORT.
ENV PORT=8080


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules. This is an npm workspaces monorepo, so every workspace's
# package.json must be present before `npm ci` or their devDependencies
# (typescript, vite, tsx, ...) will not be installed.
COPY package-lock.json package.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci --include=dev

# Copy application code
COPY . .

# Build all workspaces (shared -> server -> client)
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Copy built application (includes shared/dist, server/dist, client/dist)
COPY --from=build /app /app

# Start the server, which also serves the built client on the same port
EXPOSE 8080
CMD [ "npm", "run", "start" ]
