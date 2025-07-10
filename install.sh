#!/bin/bash

# Instalador Rápido - Siqueira Campos Imóveis
# Execute: curl -fsSL https://raw.githubusercontent.com/Nakahh/site-jurez-2.0/main/install.sh | sudo bash

set -e

echo "🚀 Instalador Rápido - Siqueira Campos Imóveis"
echo "============================================="

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Este script deve ser executado como root (sudo)"
   exit 1
fi

# Baixar script completo
echo "📥 Baixando script de setup..."
curl -fsSL https://raw.githubusercontent.com/Nakahh/site-jurez-2.0/main/setup-server-complete.sh -o /tmp/setup-server-complete.sh
chmod +x /tmp/setup-server-complete.sh

# Executar
echo "🚀 Iniciando setup completo..."
bash /tmp/setup-server-complete.sh

# Limpar
rm -f /tmp/setup-server-complete.sh

echo "✅ Instalação concluída!"
