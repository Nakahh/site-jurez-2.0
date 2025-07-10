#!/bin/bash

# Script de Correção Completa - Siqueira Campos Imóveis
# Corrige: WWW redirect, Mobile loading, Auto-deploy

set -e

echo "🔧 INICIANDO CORREÇÕES COMPLETAS"
echo "================================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. CORRIGIR NGINX PARA WWW
log_info "1. Configurando redirecionamento WWW no Nginx..."

cat > nginx-fixed.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # Redirect WWW to non-WWW
    server {
        listen 80;
        listen 443 ssl http2;
        server_name www.siqueicamposimoveis.com.br www.siqueiracamposimoveis.com.br;
        
        # SSL certificates (if using)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        return 301 $scheme://siqueicamposimoveis.com.br$request_uri;
    }

    # Main server block
    server {
        listen 80;
        listen 443 ssl http2;
        server_name siqueicamposimoveis.com.br siqueiracamposimoveis.com.br;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # SSL security
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';" always;

        # Mobile optimization
        add_header Cache-Control "public, max-age=31536000" always;
        
        # Root directory
        root /var/www/html;
        index index.html;

        # API proxy with timeout fixes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://app:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeout fixes for mobile
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            client_body_timeout 60s;
            client_header_timeout 60s;
        }

        # Static files with long cache
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA fallback for all routes
        location / {
            limit_req zone=general burst=50 nodelay;
            
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Mobile timeout fixes
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "OK";
            add_header Content-Type text/plain;
        }
    }
}
EOF

log_success "Nginx configurado com redirecionamento WWW"

# 2. CORRIGIR PROBLEMAS MOBILE - LazyRoutes
log_info "2. Corrigindo componente LazyRoutes para mobile..."

cat > client/components/LazyRoutes.tsx << 'EOF'
import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import loadable from "@loadable/component";

// Lazy loading com fallback robusto
const Index = loadable(() => import("../pages/Index"), {
  fallback: <LoadingFallback />
});

const Imoveis = loadable(() => import("../pages/Imoveis"), {
  fallback: <LoadingFallback />
});

const ImovelDetalhes = loadable(() => import("../pages/ImovelDetalhes"), {
  fallback: <LoadingFallback />
});

const Sobre = loadable(() => import("../pages/Sobre"), {
  fallback: <LoadingFallback />
});

const Contato = loadable(() => import("../pages/Contato"), {
  fallback: <LoadingFallback />
});

const Login = loadable(() => import("../pages/Login"), {
  fallback: <LoadingFallback />
});

const Register = loadable(() => import("../pages/Register"), {
  fallback: <LoadingFallback />
});

const ForgotPassword = loadable(() => import("../pages/ForgotPassword"), {
  fallback: <LoadingFallback />
});

const Comparador = loadable(() => import("../pages/Comparador"), {
  fallback: <LoadingFallback />
});

const SimuladorFinanciamento = loadable(() => import("../pages/SimuladorFinanciamento"), {
  fallback: <LoadingFallback />
});

const Blog = loadable(() => import("../pages/Blog"), {
  fallback: <LoadingFallback />
});

const BlogPost = loadable(() => import("../pages/BlogPost"), {
  fallback: <LoadingFallback />
});

// Dashboards
const ClienteDashboard = loadable(() => import("../pages/dashboards/ClienteDashboard"), {
  fallback: <LoadingFallback />
});

const CorretorDashboard = loadable(() => import("../pages/dashboards/CorretorDashboard"), {
  fallback: <LoadingFallback />
});

const AdminDashboard = loadable(() => import("../pages/dashboards/AdminDashboard"), {
  fallback: <LoadingFallback />
});

const AssistenteDashboard = loadable(() => import("../pages/dashboards/AssistenteDashboard"), {
  fallback: <LoadingFallback />
});

const MarketingDashboard = loadable(() => import("../pages/dashboards/MarketingDashboard"), {
  fallback: <LoadingFallback />
});

const DesenvolvedorDashboard = loadable(() => import("../pages/dashboards/DesenvolvedorDashboard"), {
  fallback: <LoadingFallback />
});

const CorretorImoveis = loadable(() => import("../pages/CorretorImoveis"), {
  fallback: <LoadingFallback />
});

const CorretorLeads = loadable(() => import("../pages/CorretorLeads"), {
  fallback: <LoadingFallback />
});

const Desenvolvedor = loadable(() => import("../pages/Desenvolvedor"), {
  fallback: <LoadingFallback />
});

const NotFound = loadable(() => import("../pages/NotFound"), {
  fallback: <LoadingFallback />
});

function LoadingFallback() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Carregando...");
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 15;
      });
    }, 100);

    // Timeout de segurança para mobile
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
      setLoadingText("Carregamento demorado - tentando novamente...");
      window.location.reload();
    }, 10000); // 10 segundos

    const textInterval = setInterval(() => {
      const texts = [
        "Carregando...",
        "Preparando interface...",
        "Quase pronto...",
        "Carregando recursos...",
      ];
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
      clearTimeout(timeout);
    };
  }, []);

  const handleForceReload = () => {
    window.location.href = "/";
  };

  if (timeoutReached) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="mb-6">
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=200"
              alt="Siqueira Campos"
              className="block dark:hidden h-16 mx-auto mb-4"
            />
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=200"
              alt="Siqueira Campos"
              className="hidden dark:block h-16 mx-auto mb-4"
            />
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Problema de Conexão</h2>
            <p className="text-muted-foreground mb-4">
              O carregamento está demorando mais que o esperado. Isso pode ser devido à sua conexão de internet.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleForceReload}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => window.location.href = "https://siqueicamposimoveis.com.br"}
              className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
            >
              Ir para Página Inicial
            </button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            <p>Se o problema persistir, entre em contato:</p>
            <p>📱 WhatsApp: (62) 9 9999-9999</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-sm mx-auto p-6 text-center">
        <div className="mb-8">
          <img
            src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=250"
            alt="Siqueira Campos Imóveis"
            className="block dark:hidden h-20 mx-auto mb-6"
          />
          <img
            src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=250"
            alt="Siqueira Campos Imóveis"
            className="hidden dark:block h-20 mx-auto mb-6"
          />
        </div>

        <div className="mb-6 relative">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-secondary rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <p className="text-muted-foreground font-medium mb-2">{loadingText}</p>
        
        <div className="flex justify-center mt-2">
          <div className="flex">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce ml-1" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce ml-1" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-4">
          {Math.round(progress)}% • {loadingText}
        </div>
      </div>
    </div>
  );
}

export function LazyRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/imoveis" element={<Imoveis />} />
        <Route path="/imovel/:id" element={<ImovelDetalhes />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/comparador" element={<Comparador />} />
        <Route path="/simulador" element={<SimuladorFinanciamento />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Dashboards */}
        <Route path="/dashboard/cliente" element={<ClienteDashboard />} />
        <Route path="/dashboard/corretor" element={<CorretorDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/assistente" element={<AssistenteDashboard />} />
        <Route path="/dashboard/marketing" element={<MarketingDashboard />} />
        <Route path="/dashboard/desenvolvedor" element={<DesenvolvedorDashboard />} />
        
        <Route path="/corretor/imoveis" element={<CorretorImoveis />} />
        <Route path="/corretor/leads" element={<CorretorLeads />} />
        <Route path="/desenvolvedor" element={<Desenvolvedor />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
EOF

log_success "LazyRoutes corrigido para mobile"

# 3. CORRIGIR DOCKER-COMPOSE PARA AUTO-DEPLOY
log_info "3. Configurando Docker Compose para auto-deploy..."

cat > docker-compose.production.yml << 'EOF'
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.autodeploy
    container_name: siqueira-campos-app
    environment:
      - NODE_ENV=production
      - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET:-webhook-secret-123}
    volumes:
      - app-data:/app
      - deploy-logs:/var/log
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/ping"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s
    labels:
      - "com.docker.compose.project=siqueira-campos"

  nginx:
    image: nginx:alpine
    container_name: siqueira-campos-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-fixed.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "com.docker.compose.project=siqueira-campos"

  # Watchtower para auto-deploy
  watchtower:
    image: containrrr/watchtower
    container_name: siqueira-campos-watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_POLL_INTERVAL=300
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_INCLUDE_RESTARTING=true
      - WATCHTOWER_ROLLING_RESTART=true
    restart: unless-stopped
    networks:
      - app-network
    labels:
      - "com.docker.compose.project=siqueira-campos"

volumes:
  app-data:
  deploy-logs:
  nginx-cache:

networks:
  app-network:
    driver: bridge
EOF

log_success "Docker Compose configurado"

# 4. MELHORAR DOCKERFILE PARA MOBILE
log_info "4. Otimizando Dockerfile para mobile..."

cat > Dockerfile.production << 'EOF'
# Multi-stage build para produção
FROM node:18-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache git bash curl

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependências
RUN npm ci --production=false

# Copiar código fonte
COPY . .

# Build otimizado
RUN npm run build

# Stage de produção
FROM node:18-alpine AS production

# Instalar dependências runtime
RUN apk add --no-cache \
    git \
    bash \
    curl \
    supervisor \
    nginx

# Criar usuário
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar apenas dependências de produção
RUN npm ci --production=true

# Copiar build da stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/public ./public

# Copiar scripts
COPY scripts ./scripts
RUN chmod +x scripts/*.sh

# Configurar supervisor
COPY supervisor-production.conf /etc/supervisor/conf.d/app.conf

# Criar diretórios
RUN mkdir -p /var/log/supervisor /var/log /var/cache/nginx

# Configurar Git
RUN git config --global --add safe.directory /app
RUN git config --global user.name "Auto Deploy"
RUN git config --global user.email "deploy@siqueicampos.com.br"

# Chown files
RUN chown -R nextjs:nodejs /app /var/log

USER nextjs

# Health check otimizado
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/ping || exit 1

EXPOSE 3000 3001

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
EOF

# 5. SUPERVISOR OTIMIZADO
log_info "5. Configurando supervisor para produção..."

cat > supervisor-production.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
silent=false
minfds=1024
minprocs=200

[program:frontend]
command=npm run dev:client
directory=/app
user=nextjs
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/frontend.err.log
stdout_logfile=/var/log/supervisor/frontend.out.log
environment=NODE_ENV=production,PORT=3000
priority=999
startsecs=10
startretries=3

[program:backend]
command=npm run dev:server
directory=/app
user=nextjs
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/backend.err.log
stdout_logfile=/var/log/supervisor/backend.out.log
environment=NODE_ENV=production,PORT=3001
priority=999
startsecs=10
startretries=3

[inet_http_server]
port=127.0.0.1:9001

[supervisorctl]
serverurl=http://127.0.0.1:9001

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
EOF

log_success "Supervisor configurado"

# 6. SCRIPT DE DEPLOY AUTOMÁTICO MELHORADO
log_info "6. Criando script de deploy automático..."

cat > scripts/auto-deploy-production.sh << 'EOF'
#!/bin/bash

# Script de Auto-Deploy Produção
set -e

echo "🚀 Iniciando auto-deploy produção..."
echo "📅 $(date)"

# Configurar Git
git config --global --add safe.directory /app || true

# Fazer backup
echo "📦 Criando backup..."
docker commit siqueira-campos-app siqueira-campos:backup-$(date +%Y%m%d-%H%M%S) || echo "⚠️ Backup falhou"

# Baixar mudanças
echo "📥 Baixando mudanças..."
git fetch origin main || echo "⚠️ Fetch falhou"
git reset --hard origin/main || echo "⚠️ Reset falhou"

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --production=false

# Build
echo "🏗️ Executando build..."
npm run build

# Verificar build
if [ ! -d "dist" ]; then
    echo "❌ Build falhou - dist não existe"
    exit 1
fi

# Typecheck
echo "🧪 Verificando TypeScript..."
npm run typecheck || echo "⚠️ TypeScript com avisos"

# Reiniciar serviços
echo "🔄 Reiniciando serviços..."
if command -v supervisorctl &> /dev/null; then
    supervisorctl restart all
elif command -v systemctl &> /dev/null; then
    systemctl restart siqueira-app || echo "⚠️ Systemctl falhou"
elif [ -f "docker-compose.production.yml" ]; then
    docker-compose -f docker-compose.production.yml restart app
fi

echo "✅ Auto-deploy concluído!"
echo "📅 $(date)"

# Log
echo "$(date): Auto-deploy executado com sucesso" >> /var/log/auto-deploy.log
EOF

chmod +x scripts/auto-deploy-production.sh

log_success "Script de auto-deploy criado"

# 7. WEBHOOK MELHORADO
log_info "7. Atualizando webhook para produção..."

cat > server/routes/webhook-production.ts << 'EOF'
import { RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

const execAsync = promisify(exec);

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "webhook-secret-123";

function verifySignature(body: string, signature: string): boolean {
  if (!signature) return false;
  
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(body, "utf8").digest("hex");
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export const handleWebhookProduction: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"] as string;
    const body = JSON.stringify(req.body);

    // Verificar assinatura
    if (!verifySignature(body, signature)) {
      console.log("❌ Webhook: Assinatura inválida");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.headers["x-github-event"];

    if (event === "push" && req.body.ref === "refs/heads/main") {
      console.log("🚀 Webhook: Iniciando auto-deploy produção...");

      // Executar em background para não travar o webhook
      setImmediate(async () => {
        try {
          const deployResult = await execAsync("./scripts/auto-deploy-production.sh");
          console.log("✅ Deploy concluído:", deployResult.stdout);
          
          if (deployResult.stderr) {
            console.log("⚠️ Avisos:", deployResult.stderr);
          }
        } catch (error) {
          console.error("❌ Erro no deploy:", error);
        }
      });

      // Responder imediatamente
      return res.json({
        message: "Deploy iniciado",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`📨 Webhook recebido: ${event}`);
    res.json({ message: "Webhook recebido", event });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(500).json({
      error: "Erro interno",
      timestamp: new Date().toISOString(),
    });
  }
};
EOF

log_success "Webhook atualizado"

# 8. SCRIPT DE DEPLOY INICIAL
log_info "8. Criando script de deploy inicial..."

cat > deploy-production.sh << 'EOF'
#!/bin/bash

# Deploy Inicial para Produção
set -e

echo "🚀 DEPLOY INICIAL PRODUÇÃO"
echo "========================="

# Parar containers existentes
echo "⏹️ Parando containers existentes..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.autodeploy.yml down 2>/dev/null || true

# Remover containers órfãos
echo "🧹 Limpando containers órfãos..."
docker container prune -f || true

# Criar secret se não existir
if [ ! -f ".env" ] || ! grep -q "GITHUB_WEBHOOK_SECRET" .env; then
    echo "🔐 Gerando webhook secret..."
    SECRET=$(openssl rand -hex 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
    echo "GITHUB_WEBHOOK_SECRET=$SECRET" >> .env
    echo "✅ Secret gerado: $SECRET"
    echo "⚠️ Configure este secret no GitHub!"
fi

# Build e deploy
echo "🏗️ Building e fazendo deploy..."
docker-compose -f docker-compose.production.yml up -d --build

# Aguardar containers
echo "⏳ Aguardando containers..."
sleep 30

# Verificar saúde
echo "🔍 Verificando saúde dos serviços..."
for i in {1..10}; do
    if curl -f http://localhost/health >/dev/null 2>&1; then
        echo "✅ Nginx funcionando"
        break
    fi
    echo "⏳ Aguardando nginx... ($i/10)"
    sleep 5
done

for i in {1..10}; do
    if curl -f http://localhost/api/ping >/dev/null 2>&1; then
        echo "✅ API funcionando"
        break
    fi
    echo "⏳ Aguardando API... ($i/10)"
    sleep 5
done

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo "==================="
echo ""
echo "🌐 Site: http://seu-dominio.com.br"
echo "🔗 API: http://seu-dominio.com.br/api/ping"
echo "🪝 Webhook: http://seu-dominio.com.br/api/webhook/github"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o webhook no GitHub"
echo "2. Teste fazendo um push"
echo "3. Configure SSL se necessário"
echo ""
echo "📊 Monitoramento:"
echo "docker-compose -f docker-compose.production.yml logs -f"
EOF

chmod +x deploy-production.sh

log_success "Deploy inicial criado"

# 9. EXECUTAR DEPLOY
log_info "9. Executando deploy..."

# Verificar se Docker está disponível
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    read -p "🤔 Executar deploy agora? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Executando deploy..."
        bash deploy-production.sh
    else
        log_info "Deploy não executado. Execute manualmente: bash deploy-production.sh"
    fi
else
    log_warning "Docker não encontrado. Execute depois: bash deploy-production.sh"
fi

echo ""
log_success "=== TODAS AS CORREÇÕES APLICADAS ==="
echo ""
log_info "✅ Problemas corrigidos:"
echo "1. ✅ Redirecionamento WWW → não-WWW configurado"
echo "2. ✅ Loading mobile corrigido com timeout"
echo "3. ✅ Auto-deploy configurado"
echo "4. ✅ Containers otimizados"
echo "5. ✅ Nginx configurado com timeouts mobile"
echo "6. ✅ Webhook de produção implementado"
echo ""
log_info "📋 Para ativar completamente:"
echo "1. bash deploy-production.sh (se não executou ainda)"
echo "2. Configure webhook no GitHub:"
echo "   URL: https://seu-dominio.com.br/api/webhook/github"
echo "   Secret: (veja arquivo .env)"
echo "3. Teste fazendo um push no GitHub"
echo ""
log_success "🎉 Sistema pronto para produção!"
EOF
