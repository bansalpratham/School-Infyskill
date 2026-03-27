FROM node:20-alpine

ARG SERVICE_DIR

WORKDIR /app

# Avoid npm v10 resolver edge cases in some dependency trees
RUN npm i -g npm@9

# Copy only the target service folder to avoid leaking host node_modules / pnpm artifacts
COPY ${SERVICE_DIR}/package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund; \
    else \
      npm install --omit=dev --legacy-peer-deps --no-audit --no-fund; \
    fi

COPY ${SERVICE_DIR} ./

CMD ["sh", "-c", "if grep -q '\"start\"' package.json; then npm start; else node server.js; fi"]
