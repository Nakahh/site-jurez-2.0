# Multi-stage build para otimização máxima
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Instalar dependências
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build da aplicação
FROM base AS builder
COPY package.json package-lock.json* ./
COPY tsconfig*.json ./
RUN npm ci

COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build do frontend e backend
RUN npm run build
RUN npm run build:server

# Imagem de produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Definir permissões
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/api/ping || exit 1

CMD ["node", "dist/server/start.js"]
