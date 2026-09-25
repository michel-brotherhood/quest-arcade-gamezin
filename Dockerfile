FROM node:22-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@10.4.1

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
