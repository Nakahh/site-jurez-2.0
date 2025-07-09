#!/bin/bash

##############################################################################
#                      🔄 KRYONIX GITHUB WEBHOOK                            #
#              Sistema de Auto-Update via GitHub Webhook                    #
##############################################################################

set -euo pipefail

# Configurações
PROJECT_DIR="/opt/site-jurez-2.0"
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"
WEBHOOK_PORT="9999"
WEBHOOK_SECRET="kryonix_webhook_secret_2024"
LOG_FILE="/var/log/kryonix-webhook.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

# Clonar ou atualizar repositório
setup_repository() {
    log "🔄 Configurando repositório GitHub..."
    
    if [ -d "$PROJECT_DIR" ]; then
        warning "Diretório $PROJECT_DIR já existe. Atualizando..."
        cd "$PROJECT_DIR"
        git fetch origin
        git reset --hard origin/main
        git clean -fd
    else
        log "Clonando repositório..."
        git clone "$GITHUB_REPO" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    # Configurar permissões
    chown -R ubuntu:ubuntu "$PROJECT_DIR" 2>/dev/null || true
    
    log "✅ Repositório configurado!"
}

# Criar webhook server em Python
create_webhook_server() {
    log "🔗 Criando servidor webhook..."
    
    cat > /opt/kryonix/webhook-server.py << 'EOF'
#!/usr/bin/env python3
import json
import hashlib
import hmac
import subprocess
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

WEBHOOK_SECRET = "kryonix_webhook_secret_2024"
PROJECT_DIR = "/opt/site-jurez-2.0"
LOG_FILE = "/var/log/kryonix-webhook.log"

def log_message(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")
    print(f"[{timestamp}] {message}")

def verify_signature(payload, signature):
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

def update_project():
    try:
        os.chdir(PROJECT_DIR)
        
        # Git pull
        result = subprocess.run(
            ["git", "pull", "origin", "main"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            log_message("✅ Projeto atualizado com sucesso!")
            
            # Executar npm install se package.json foi modificado
            if os.path.exists("package.json"):
                log_message("📦 Instalando dependências...")
                npm_result = subprocess.run(
                    ["npm", "install"],
                    capture_output=True,
                    text=True,
                    timeout=300
                )
                
                if npm_result.returncode == 0:
                    log_message("✅ Dependências instaladas!")
                else:
                    log_message(f"❌ Erro ao instalar dependências: {npm_result.stderr}")
            
            # Restart do serviço se necessário
            if os.path.exists("docker-compose.yml"):
                log_message("🔄 Reiniciando serviços Docker...")
                subprocess.run(["docker-compose", "down"], timeout=30)
                subprocess.run(["docker-compose", "up", "-d"], timeout=120)
                log_message("✅ Serviços reiniciados!")
            
        else:
            log_message(f"❌ Erro no git pull: {result.stderr}")
            
    except Exception as e:
        log_message(f"❌ Erro na atualização: {str(e)}")

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/webhook":
            content_length = int(self.headers['Content-Length'])
            payload = self.rfile.read(content_length)
            
            signature = self.headers.get('X-Hub-Signature-256')
            
            if signature and verify_signature(payload, signature):
                try:
                    data = json.loads(payload.decode('utf-8'))
                    
                    if data.get('ref') == 'refs/heads/main':
                        log_message("🔔 Webhook recebido - Atualizando projeto...")
                        update_project()
                        
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.end_headers()
                        self.wfile.write(b'{"status": "success"}')
                    else:
                        log_message("ℹ️ Push em branch diferente de main - Ignorando")
                        self.send_response(200)
                        self.end_headers()
                        
                except json.JSONDecodeError:
                    log_message("❌ Payload JSON inválido")
                    self.send_response(400)
                    self.end_headers()
            else:
                log_message("❌ Assinatura inválida")
                self.send_response(401)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suprimir logs padrão do servidor HTTP
        pass

if __name__ == "__main__":
    server = HTTPServer(('0.0.0.0', 9999), WebhookHandler)
    log_message("🚀 Servidor webhook iniciado na porta 9999")
    server.serve_forever()
EOF
    
    chmod +x /opt/kryonix/webhook-server.py
    
    log "✅ Servidor webhook criado!"
}

# Criar serviço systemd para o webhook
create_webhook_service() {
    log "⚙️ Criando serviço systemd..."
    
    cat > /etc/systemd/system/kryonix-webhook.service << EOF
[Unit]
Description=Kryonix GitHub Webhook Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/kryonix
ExecStart=/usr/bin/python3 /opt/kryonix/webhook-server.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Recarregar systemd e iniciar serviço
    systemctl daemon-reload
    systemctl enable kryonix-webhook.service
    systemctl start kryonix-webhook.service
    
    log "✅ Serviço webhook configurado!"
}

# Criar script de atualização manual
create_update_script() {
    log "📝 Criando script de atualização manual..."
    
    cat > /usr/local/bin/kryonix-update << 'EOF'
#!/bin/bash

PROJECT_DIR="/opt/site-jurez-2.0"
LOG_FILE="/var/log/kryonix-webhook.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔄 Iniciando atualização manual do projeto..."

if [ ! -d "$PROJECT_DIR" ]; then
    log "❌ Diretório do projeto não encontrado!"
    exit 1
fi

cd "$PROJECT_DIR"

log "📥 Fazendo git pull..."
git pull origin main

if [ $? -eq 0 ]; then
    log "✅ Projeto atualizado com sucesso!"
    
    if [ -f "package.json" ]; then
        log "📦 Instalando dependências..."
        npm install
    fi
    
    if [ -f "docker-compose.yml" ]; then
        log "🔄 Reiniciando serviços..."
        docker-compose down
        docker-compose up -d
    fi
    
    log "✅ Atualização concluída!"
else
    log "❌ Erro na atualização!"
    exit 1
fi
EOF
    
    chmod +x /usr/local/bin/kryonix-update
    
    log "✅ Script de atualização criado! Use: kryonix-update"
}

# Configurar cron para verificações periódicas
setup_cron() {
    log "⏰ Configurando cron para verificações periódicas..."
    
    # Adicionar tarefa cron para verificar atualizações a cada 5 minutos
    (crontab -l 2>/dev/null || true; echo "*/5 * * * * cd $PROJECT_DIR && git fetch origin && if [ \$(git rev-list HEAD...origin/main --count) -gt 0 ]; then /usr/local/bin/kryonix-update; fi") | crontab -
    
    log "✅ Cron configurado!"
}

# Função principal
main() {
    log "🚀 Configurando sistema de auto-update GitHub..."
    
    # Instalar dependências Python
    apt-get update
    apt-get install -y python3 python3-pip git cron
    
    setup_repository
    create_webhook_server
    create_webhook_service
    create_update_script
    setup_cron
    
    # Testar serviço
    sleep 2
    if systemctl is-active --quiet kryonix-webhook.service; then
        log "✅ Webhook configurado e funcionando!"
        log "🔗 URL do webhook: http://$SERVER_IP:9999/webhook"
        log "🔑 Secret: $WEBHOOK_SECRET"
    else
        error "❌ Erro ao iniciar serviço webhook!"
        systemctl status kryonix-webhook.service
    fi
    
    log "🎉 Sistema de auto-update configurado com sucesso!"
}

# Executar se script for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
