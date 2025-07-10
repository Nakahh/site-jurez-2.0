#!/bin/bash

# Oracle Auto-Update Setup Script
# Execute: sudo bash oracle-auto-update-fix.sh

set -e

echo "🔧 Configurando auto-atualização GitHub no Oracle..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
    error "Execute como root: sudo bash $0"
    exit 1
fi

log "Iniciando configuração..."

# 1. Encontrar diretório do projeto
PROJECT_DIR=""
for dir in "/opt/site-jurez-2.0" "/opt/mega-deploy/app/site-jurez-2.0" "/home/ubuntu/site-jurez-2.0"; do
    if [ -d "$dir" ]; then
        PROJECT_DIR="$dir"
        log "Projeto encontrado em: $PROJECT_DIR"
        break
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    warning "Projeto não encontrado. Clonando..."
    mkdir -p /opt
    cd /opt
    git clone https://github.com/Nakahh/site-jurez-2.0
    PROJECT_DIR="/opt/site-jurez-2.0"
    log "Projeto clonado em: $PROJECT_DIR"
fi

# 2. Verificar Git
cd "$PROJECT_DIR"
log "Verificando repositório Git..."
git fetch origin
COMMITS_BEHIND=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")
log "Commits atrás da main: $COMMITS_BEHIND"

# 3. Criar diretório para auto-update
mkdir -p /opt/auto-update

# 4. Criar script de atualização
log "Criando script de atualização..."
cat > /opt/auto-update/update.sh << 'EOF'
#!/bin/bash

# Auto-update script
PROJECT_DIR="/opt/site-jurez-2.0"
LOG_FILE="/var/log/auto-update.log"

# Encontrar projeto
if [ ! -d "$PROJECT_DIR" ]; then
    for dir in "/opt/mega-deploy/app/site-jurez-2.0" "/home/ubuntu/site-jurez-2.0"; do
        if [ -d "$dir" ]; then
            PROJECT_DIR="$dir"
            break
        fi
    done
fi

if [ ! -d "$PROJECT_DIR" ]; then
    echo "[$(date)] ERROR: Projeto não encontrado" >> "$LOG_FILE"
    exit 1
fi

cd "$PROJECT_DIR"

echo "[$(date)] Verificando atualizações..." >> "$LOG_FILE"

# Verificar atualizações
git fetch origin 2>/dev/null
BEHIND=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")

if [ "$BEHIND" -gt 0 ]; then
    echo "[$(date)] Encontradas $BEHIND atualizações" >> "$LOG_FILE"
    
    # Backup
    cp -r . "/tmp/backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
    
    # Atualizar
    git pull origin main >> "$LOG_FILE" 2>&1
    
    # Instalar dependências
    if [ -f "package.json" ]; then
        echo "[$(date)] Instalando dependências..." >> "$LOG_FILE"
        npm install >> "$LOG_FILE" 2>&1
    fi
    
    # Reiniciar serviços
    if [ -f "docker-compose.yml" ]; then
        echo "[$(date)] Reiniciando containers..." >> "$LOG_FILE"
        docker-compose down >> "$LOG_FILE" 2>&1
        docker-compose up -d --build >> "$LOG_FILE" 2>&1
    fi
    
    echo "[$(date)] Atualização concluída!" >> "$LOG_FILE"
else
    echo "[$(date)] Projeto atualizado" >> "$LOG_FILE"
fi
EOF

chmod +x /opt/auto-update/update.sh

# 5. Configurar cron job
log "Configurando cron job..."
(crontab -l 2>/dev/null | grep -v "auto-update"; echo "*/10 * * * * /opt/auto-update/update.sh") | crontab -

# 6. Criar webhook server
log "Criando servidor webhook..."
cat > /opt/auto-update/webhook.py << 'EOF'
#!/usr/bin/env python3
import http.server
import socketserver
import subprocess
import json
from datetime import datetime

PORT = 9999

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook':
            try:
                content_length = int(self.headers['Content-Length'])
                payload = self.rfile.read(content_length)
                data = json.loads(payload.decode('utf-8'))

                if data.get('ref') == 'refs/heads/main':
                    print(f"[{datetime.now()}] Webhook recebido")
                    
                    result = subprocess.run(['/opt/auto-update/update.sh'],
                                          capture_output=True, text=True)
                    
                    if result.returncode == 0:
                        self.send_response(200)
                        self.end_headers()
                        self.wfile.write(b'OK')
                    else:
                        self.send_response(500)
                        self.end_headers()
                        self.wfile.write(b'ERROR')
                else:
                    self.send_response(200)
                    self.end_headers()
            except Exception as e:
                print(f"Erro: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), WebhookHandler) as httpd:
        print(f'Webhook server na porta {PORT}')
        httpd.serve_forever()
EOF

chmod +x /opt/auto-update/webhook.py

# 7. Criar serviço systemd
log "Configurando serviço webhook..."
cat > /etc/systemd/system/github-webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook Auto Update
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /opt/auto-update/webhook.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 8. Ativar serviço
systemctl daemon-reload
systemctl enable github-webhook.service
systemctl start github-webhook.service

# 9. Criar script de status
cat > /opt/auto-update/status.sh << 'EOF'
#!/bin/bash
echo "=== STATUS AUTO-UPDATE ==="
echo "Webhook: $(systemctl is-active github-webhook.service)"
echo "Cron: $(crontab -l | grep auto-update | wc -l) job(s)"
echo "Porta 9999: $(netstat -tulpn | grep :9999 | wc -l) ativa"

if [ -f "/var/log/auto-update.log" ]; then
    echo "Último log:"
    tail -3 /var/log/auto-update.log
fi

echo ""
echo "=== PROJETO ==="
cd /opt/site-jurez-2.0 2>/dev/null || cd /opt/mega-deploy/app/site-jurez-2.0 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Dir: $(pwd)"
    echo "Branch: $(git branch --show-current)"
    git fetch origin 2>/dev/null
    BEHIND=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")
    echo "Commits atrás: $BEHIND"
fi
EOF

chmod +x /opt/auto-update/status.sh

# 10. Executar primeira atualização
log "Executando primeira atualização..."
/opt/auto-update/update.sh

# 11. Verificar status
sleep 2
log "Verificando status dos serviços..."

if systemctl is-active --quiet github-webhook.service; then
    log "✅ Webhook ativo"
else
    error "❌ Webhook com problema"
fi

if crontab -l | grep -q auto-update; then
    log "✅ Cron job configurado"
else
    error "❌ Cron job não encontrado"
fi

# 12. Mostrar informações finais
echo ""
echo -e "${BLUE}========================${NC}"
echo -e "${GREEN}✅ CONFIGURAÇÃO CONCLUÍDA${NC}"
echo -e "${BLUE}========================${NC}"
echo ""
echo "🔗 Webhook URL: http://144.22.212.82:9999/webhook"
echo "📊 Status: /opt/auto-update/status.sh"
echo "📝 Logs: tail -f /var/log/auto-update.log"
echo "🔄 Update manual: /opt/auto-update/update.sh"
echo ""
echo "Configure no GitHub:"
echo "Settings > Webhooks > Add webhook"
echo "URL: http://144.22.212.82:9999/webhook"
echo "Content type: application/json"
echo ""

# Executar status
/opt/auto-update/status.sh

log "🎉 Auto-atualização configurada!"
