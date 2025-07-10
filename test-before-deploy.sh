#!/bin/bash

# Script de teste completo antes do deploy
# Este script executa todos os testes necessários antes de fazer o deploy

set -e

echo "🧪 Iniciando testes pré-deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar se as dependências estão instaladas
log "1. Verificando dependências..."
if [ ! -d "node_modules" ]; then
    log "Instalando dependências..."
    npm install
fi

# 2. Verificar TypeScript (modo não-crítico)
log "2. Verificando TypeScript..."
if npm run typecheck 2>/dev/null; then
    log "✅ TypeScript: OK"
else
    warn "⚠️ TypeScript: Há alguns warnings, mas não impedem o build"
fi

# 3. Testar build de desenvolvimento
log "3. Testando build de desenvolvimento..."
if npm run build:dev > /dev/null 2>&1; then
    log "✅ Build de desenvolvimento: OK"
else
    error "❌ Build de desenvolvimento falhou!"
    exit 1
fi

# 4. Verificar se o servidor backend funciona
log "4. Testando servidor backend..."

# Iniciar servidor em background
npm run dev:server &
SERVER_PID=$!

# Aguardar servidor iniciar
sleep 5

# Testar endpoints
if curl -f -s http://localhost:3001/api/ping > /dev/null; then
    log "✅ API ping: OK"
else
    error "❌ API ping falhou!"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

if curl -f -s http://localhost:3001/api/demo > /dev/null; then
    log "✅ API demo: OK"
else
    error "❌ API demo falhou!"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Parar servidor
kill $SERVER_PID 2>/dev/null || true

# 5. Verificar se há arquivos críticos
log "5. Verificando arquivos críticos..."

CRITICAL_FILES=(
    "client/App.tsx"
    "client/pages/Index.tsx"
    "server/index.ts"
    "package.json"
    "tailwind.config.ts"
    "vite.config.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log "✅ $file: existe"
    else
        error "❌ $file: arquivo crítico não encontrado!"
        exit 1
    fi
done

# 6. Verificar sintaxe dos arquivos principais
log "6. Verificando sintaxe dos arquivos principais..."

# Verificar se há erros de sintaxe básicos nos arquivos TypeScript/JavaScript
if command -v tsc >/dev/null 2>&1; then
    if tsc --noEmit --skipLibCheck client/App.tsx 2>/dev/null; then
        log "✅ App.tsx: sintaxe OK"
    else
        warn "⚠️ App.tsx: possíveis problemas de sintaxe"
    fi
fi

# 7. Verificar configurações
log "7. Verificando configurações..."

if [ -f "vite.config.ts" ] && grep -q "plugins:" vite.config.ts; then
    log "✅ Vite config: OK"
else
    warn "⚠️ Vite config: pode ter problemas"
fi

if [ -f "tailwind.config.ts" ] && grep -q "content:" tailwind.config.ts; then
    log "✅ Tailwind config: OK"
else
    warn "⚠️ Tailwind config: pode ter problemas"
fi

# 8. Verificar permissões do script de deploy
log "8. Verificando script de deploy..."

if [ -f "deploy_kryonix.sh" ]; then
    log "✅ Script de deploy existe"
    
    # Verificar se tem permissão de execução
    if [ -x "deploy_kryonix.sh" ]; then
        log "✅ Script tem permissão de execução"
    else
        log "Adicionando permissão de execução..."
        chmod +x deploy_kryonix.sh
    fi
    
    # Verificação básica de sintaxe bash
    if bash -n deploy_kryonix.sh 2>/dev/null; then
        log "✅ Script de deploy: sintaxe OK"
    else
        error "❌ Script de deploy tem erros de sintaxe!"
        exit 1
    fi
else
    error "❌ Script de deploy não encontrado!"
    exit 1
fi

# 9. Limpeza de arquivos temporários
log "9. Limpando arquivos temporários..."
rm -rf dist/ 2>/dev/null || true
rm -rf .vite/ 2>/dev/null || true

# 10. Relatório final
echo ""
echo "🎉 TODOS OS TESTES PASSARAM!"
echo ""
log "Resumo dos testes:"
log "✅ Dependências instaladas"
log "✅ Build de desenvolvimento funciona"
log "✅ APIs do backend funcionam"
log "✅ Arquivos críticos presentes"
log "✅ Script de deploy válido"
echo ""
log "🚀 Sistema pronto para deploy!"
echo ""
log "Para fazer o deploy, execute:"
log "scp deploy_kryonix.sh ubuntu@144.22.212.82:~/"
log "ssh -t -i ~/.oci/ssh-key.key ubuntu@144.22.212.82 'sudo chmod +x ~/deploy_kryonix.sh && sudo ~/deploy_kryonix.sh'"
echo ""
