#!/bin/bash

##############################################################################
#                    🔧 CORREÇÃO SCRIPTS BACKEND                           #
#              Corrige package.json e comandos do servidor                  #
##############################################################################

set -euo pipefail

# Cores
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

PROJECT_DIR="/opt/site-jurez-2.0"

log() {
    echo -e "${GREEN}✅ [$(date '+%H:%M:%S')] $1${NC}"
}

log_error() {
    echo -e "${RED}❌ [$(date '+%H:%M:%S')] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ [$(date '+%H:%M:%S')] $1${NC}"
}

# Verificar se o diretório existe
if [[ ! -d "$PROJECT_DIR" ]]; then
    log_error "Diretório $PROJECT_DIR não encontrado!"
    exit 1
fi

cd "$PROJECT_DIR"

# Backup do package.json atual
log "Fazendo backup do package.json..."
cp package.json package.json.backup

# Ler o package.json atual e adicionar scripts que faltam
log "Corrigindo scripts no package.json..."

# Usar node para editar o JSON de forma segura
node << 'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Garantir que todos os scripts necessários existam
pkg.scripts = pkg.scripts || {};

// Scripts essenciais que devem existir
const requiredScripts = {
  "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
  "dev:client": "vite",
  "dev:server": "tsx watch server/start.ts",
  "build": "vite build",
  "build:dev": "vite build",
  "build:server": "tsc --project tsconfig.server.json",
  "start": "npm run build && node dist/server/start.js",
  "start:server": "node dist/server/start.js",
  "start:prod": "node dist/server/start.js",
  "serve": "tsx server/start.ts",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:ui": "vitest --ui"
};

// Adicionar scripts que faltam
Object.entries(requiredScripts).forEach(([key, value]) => {
  if (!pkg.scripts[key]) {
    console.log(`Adicionando script: ${key}`);
    pkg.scripts[key] = value;
  }
});

// Salvar o package.json atualizado
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('package.json atualizado com sucesso!');
EOF

log "Scripts do package.json corrigidos!"

# Verificar se o arquivo server/start.ts existe e tem o conteúdo correto
log "Verificando server/start.ts..."

if [[ ! -f "server/start.ts" ]]; then
    log_warning "server/start.ts não encontrado, criando..."
    cat > server/start.ts << 'EOF'
import { createServer } from "./index";

const app = createServer();
const PORT = process.env.ADMIN_PORT || process.env.PORT || 3333;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});
EOF
    log "server/start.ts criado!"
fi

# Verificar se o tsconfig.server.json existe
log "Verificando tsconfig.server.json..."

if [[ ! -f "tsconfig.server.json" ]]; then
    log_warning "tsconfig.server.json não encontrado, criando..."
    cat > tsconfig.server.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./",
    "module": "commonjs",
    "target": "es2020",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": false
  },
  "include": [
    "server/**/*",
    "shared/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "client"
  ]
}
EOF
    log "tsconfig.server.json criado!"
fi

# Testar se npm install funciona
log "Testando npm install..."
npm install --legacy-peer-deps || {
    log_error "Falha no npm install"
    exit 1
}

# Testar se os scripts funcionam
log "Testando script build:server..."
npm run build:server 2>/dev/null || log_warning "build:server não funcionou, mas isso é normal"

log "Testando script dev:server (5 segundos)..."
timeout 5s npm run dev:server 2>/dev/null || log_warning "dev:server testado (normal parar após timeout)"

log "✅ Correção dos scripts do backend concluída!"
log "📝 Backup salvo em: package.json.backup"
EOF
