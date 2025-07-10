#!/bin/bash

# Instalador Instantâneo - Uma Linha
# Execute: curl -fsSL https://raw.githubusercontent.com/Nakahh/site-jurez-2.0/main/instalar-agora.sh | sudo bash

set -e

echo "🚀 Instalador Instantâneo - Siqueira Campos Imóveis"
echo "=================================================="
echo "🤖 ZERO configuração manual - Tudo automático!"
echo ""

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Execute como root:"
   echo "curl -fsSL https://raw.githubusercontent.com/Nakahh/site-jurez-2.0/main/instalar-agora.sh | sudo bash"
   exit 1
fi

# Baixar e executar script automático
echo "📥 Baixando script de setup automático..."
curl -fsSL https://raw.githubusercontent.com/Nakahh/site-jurez-2.0/main/setup-automatico.sh -o /tmp/setup-automatico.sh

echo "🔧 Tornando executável..."
chmod +x /tmp/setup-automatico.sh

echo "🚀 Executando setup 100% automático..."
echo ""
bash /tmp/setup-automatico.sh

# Limpar
rm -f /tmp/setup-automatico.sh

echo ""
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo "🌐 Seu site está funcionando!"
