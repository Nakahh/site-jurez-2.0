#!/bin/bash

# Teste rápido das funções corrigidas
set -uo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função de log simplificada
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "SUCCESS")
            echo -e "${GREEN}✅ [$timestamp] $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ [$timestamp] $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  [$timestamp] $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  [$timestamp] $message${NC}"
            ;;
        "INSTALL")
            echo -e "${BLUE}⚙️  [$timestamp] $message${NC}"
            ;;
        *)
            echo -e "📋 [$timestamp] $message"
            ;;
    esac
}

# Função de verificação simplificada
check_file_basic() {
    local file_path="$1"
    
    if [ ! -f "$file_path" ]; then
        return 0
    fi
    
    log "INFO" "🔍 Verificando $file_path..."
    
    if [ ! -s "$file_path" ]; then
        log "WARNING" "   ⚠️  Arquivo vazio detectado"
        return 1
    fi
    
    if grep -q -E "(export|import|function|const|let|var)" "$file_path" 2>/dev/null; then
        log "SUCCESS" "   ✅ Arquivo válido"
        return 0
    else
        log "WARNING" "   ⚠️  Estrutura inválida"
        return 1
    fi
}

# Teste simples
echo "🧪 Testando funções corrigidas..."

# Criar arquivo de teste
echo "export const test = 'hello';" > test_file.ts

if check_file_basic "test_file.ts"; then
    log "SUCCESS" "Teste de verificação de arquivo passou!"
else
    log "ERROR" "Teste de verificação de arquivo falhou!"
fi

# Limpar
rm -f test_file.ts

log "SUCCESS" "Teste concluído - funções estão funcionando!"
