#!/bin/bash

# Oracle Auto-Update Complete Fix
# Execute: sudo bash oracle-fix-complete.sh

set +e  # Não parar em erros para poder tratar

echo "🔧 Configurando auto-atualização GitHub no Oracle (FIXED)..."

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

log "Iniciando configuração corrigida..."

# 1. Encontrar diretório do projeto
PROJECT_DIR="/opt/site-jurez-2.0"
if [ -d "$PROJECT_DIR" ]; then
    log "Projeto encontrado em: $PROJECT_DIR"
else
    error "Projeto não encontrado em $PROJECT_DIR"
    exit 1
fi

# 2. Verificar se há atualizações pendentes
cd "$PROJECT_DIR"
log "Verificando status do repositório..."
git fetch origin 2>/dev/null
COMMITS_BEHIND=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")
log "Commits atrás da main: $COMMITS_BEHIND"

# 3. Aplicar atualizações se necessário
if [ "$COMMITS_BEHIND" -gt 0 ]; then
    log "Aplicando $COMMITS_BEHIND atualizações..."
    
    # Backup antes de atualizar
    cp -r . "/tmp/backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
    
    # Atualizar
    git pull origin main
    
    # Instalar dependências se necessário
    if [ -f "package.json" ]; then
        log "Instalando dependências..."
        npm install
    fi
    
    log "✅ Projeto atualizado!"
else
    log "✅ Projeto já está atualizado"
fi

# 4. Criar diretório para auto-update
mkdir -p /opt/auto-update

# 5. Criar script de atualização
log "Criando script de atualização..."
cat > /opt/auto-update/update.sh << 'EOF'
#!/bin/bash

PROJECT_DIR="/opt/site-jurez-2.0"
LOG_FILE="/var/log/auto-update.log"

# Criar arquivo de log se não existir
touch "$LOG_FILE"

echo "[$(date)] === VERIFICANDO ATUALIZAÇÕES ===" >> "$LOG_FILE"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "[$(date)] ERROR: Projeto não encontrado em $PROJECT_DIR" >> "$LOG_FILE"
    exit 1
fi

cd "$PROJECT_DIR"

# Verificar atualizações
git fetch origin 2>>"$LOG_FILE"
BEHIND=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")

echo "[$(date)] Commits atrás: $BEHIND" >> "$LOG_FILE"

if [ "$BEHIND" -gt 0 ]; then
    echo "[$(date)] Aplicando $BEHIND atualizações..." >> "$LOG_FILE"
    
    # Backup
    cp -r . "/tmp/backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
    
    # Atualizar
    if git pull origin main >> "$LOG_FILE" 2>&1; then
        echo "[$(date)] ✅ Git pull executado com sucesso" >> "$LOG_FILE"
        
        # Instalar dependências se necessário
        if [ -f "package.json" ]; then
            echo "[$(date)] Instalando dependências..." >> "$LOG_FILE"
            npm install >> "$LOG_FILE" 2>&1
        fi
        
        # Reiniciar serviços se necessário
        if [ -f "docker-compose.yml" ]; then
            echo "[$(date)] Reiniciando containers..." >> "$LOG_FILE"
            docker-compose down >> "$LOG_FILE" 2>&1
            docker-compose up -d --build >> "$LOG_FILE" 2>&1
        fi
        
        echo "[$(date)] ✅ Atualização concluída!" >> "$LOG_FILE"
    else
        echo "[$(date)] ❌ Erro no git pull" >> "$LOG_FILE"
    fi
else
    echo "[$(date)] ✅ Projeto já está atualizado" >> "$LOG_FILE"
fi

echo "[$(date)] === FIM DA VERIFICAÇÃO ===" >> "$LOG_FILE"
EOF

chmod +x /opt/auto-update/update.sh

# 6. Configurar cron job (com tratamento de erro)
log "Configurando cron job..."

# Criar diretório cron se não existir
mkdir -p /var/spool/cron/crontabs 2>/dev/null || true

# Tentar configurar cron de diferentes formas
if command -v crontab >/dev/null 2>&1; then
    # Método 1: crontab padrão
    (crontab -l 2>/dev/null | grep -v "auto-update"; echo "*/10 * * * * /opt/auto-update/update.sh") | crontab - 2>/dev/null
    if [ $? -eq 0 ]; then
        log "✅ Cron job configurado via crontab"
    else
        # Método 2: arquivo direto
        warning "Tentando método alternativo para cron..."
        echo "*/10 * * * * /opt/auto-update/update.sh" > /var/spool/cron/crontabs/root 2>/dev/null || true
        chmod 600 /var/spool/cron/crontabs/root 2>/dev/null || true
        
        # Método 3: cron.d
        echo "*/10 * * * * root /opt/auto-update/update.sh" > /etc/cron.d/auto-update 2>/dev/null || true
        chmod 644 /etc/cron.d/auto-update 2>/dev/null || true
        
        log "✅ Cron job configurado via métodos alternativos"
    fi
else
    warning "Crontab não disponível, usando systemd timer..."
    
    # Criar timer systemd como alternativa
    cat > /etc/systemd/system/auto-update.service << 'EOF'
[Unit]
Description=Auto Update Project

[Service]
Type=oneshot
ExecStart=/opt/auto-update/update.sh
EOF

    cat > /etc/systemd/system/auto-update.timer << 'EOF'
[Unit]
Description=Auto Update Timer
Requires=auto-update.service

[Timer]
OnCalendar=*:0/10
Persistent=true

[Install]
WantedBy=timers.target
EOF

    systemctl daemon-reload
    systemctl enable auto-update.timer
    systemctl start auto-update.timer
    log "✅ Timer systemd configurado"
fi

# 7. Criar webhook server
log "Criando servidor webhook..."
cat > /opt/auto-update/webhook.py << 'EOF'
#!/usr/bin/env python3
import http.server
import socketserver
import subprocess
import json
import os
from datetime import datetime

PORT = 9999
LOG_FILE = "/var/log/webhook.log"

def log_webhook(message):
    with open(LOG_FILE, "a") as f:
        f.write(f"[{datetime.now()}] {message}\n")
    print(f"[{datetime.now()}] {message}")

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/status':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Webhook server is running!')
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == '/webhook':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                payload = self.rfile.read(content_length)
                
                if content_length > 0:
                    data = json.loads(payload.decode('utf-8'))
                    
                    if data.get('ref') == 'refs/heads/main':
                        log_webhook("Webhook recebido para branch main")
                        
                        result = subprocess.run(['/opt/auto-update/update.sh'],
                                              capture_output=True, text=True, timeout=300)
                        
                        if result.returncode == 0:
                            log_webhook("Atualização executada com sucesso")
                            self.send_response(200)
                            self.send_header('Content-type', 'text/plain')
                            self.end_headers()
                            self.wfile.write(b'Atualizado com sucesso!')
                        else:
                            log_webhook(f"Erro na atualização: {result.stderr}")
                            self.send_response(500)
                            self.send_header('Content-type', 'text/plain')
                            self.end_headers()
                            self.wfile.write(b'Erro na atualizacao')
                    else:
                        log_webhook(f"Webhook ignorado - branch: {data.get('ref', 'unknown')}")
                        self.send_response(200)
                        self.end_headers()
                else:
                    log_webhook("Webhook recebido sem payload")
                    self.send_response(200)
                    self.end_headers()
                    
            except json.JSONDecodeError:
                log_webhook("Erro: payload não é JSON válido")
                self.send_response(400)
                self.end_headers()
            except Exception as e:
                log_webhook(f"Erro no webhook: {str(e)}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Silenciar logs padrão

if __name__ == '__main__':
    # Criar arquivo de log
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    try:
        with socketserver.TCPServer(('', PORT), WebhookHandler) as httpd:
            log_webhook(f"Webhook server iniciado na porta {PORT}")
            log_webhook(f"Status: http://144.22.212.82:{PORT}/status")
            log_webhook(f"Webhook: http://144.22.212.82:{PORT}/webhook")
            httpd.serve_forever()
    except Exception as e:
        log_webhook(f"Erro ao iniciar servidor: {e}")
EOF

chmod +x /opt/auto-update/webhook.py

# 8. Configurar serviço systemd para webhook
log "Configurando serviço webhook..."
cat > /etc/systemd/system/github-webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook Auto Update
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/auto-update
ExecStart=/usr/bin/python3 /opt/auto-update/webhook.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 9. Ativar e iniciar serviços
systemctl daemon-reload
systemctl enable github-webhook.service
systemctl start github-webhook.service

# 10. Criar script de status
log "Criando script de status..."
cat > /opt/auto-update/status.sh << 'EOF'
#!/bin/bash
echo "==============================="
echo "🔍 STATUS AUTO-UPDATE ORACLE"
echo "==============================="
echo ""

# Status do webhook
echo "🔗 WEBHOOK:"
if systemctl is-active --quiet github-webhook.service; then
    echo "  ✅ Serviço: ATIVO"
    if netstat -tulpn | grep :9999 >/dev/null 2>&1; then
        echo "  ✅ Porta 9999: ABERTA"
    else
        echo "  ⚠️ Porta 9999: FECHADA"
    fi
else
    echo "  ❌ Serviço: INATIVO"
fi

# Status do cron
echo ""
echo "⏰ AGENDAMENTO:"
if crontab -l 2>/dev/null | grep auto-update >/dev/null; then
    echo "  ✅ Cron job: CONFIGURADO"
elif systemctl is-active --quiet auto-update.timer 2>/dev/null; then
    echo "  ✅ Systemd timer: ATIVO"
elif [ -f "/etc/cron.d/auto-update" ]; then
    echo "  ✅ Cron.d: CONFIGURADO"
else
    echo "  ❌ Agendamento: NÃO ENCONTRADO"
fi

# Status do projeto
echo ""
echo "📁 PROJETO:"
if [ -d "/opt/site-jurez-2.0" ]; then
    cd /opt/site-jurez-2.0
    echo "  📍 Diretório: $(pwd)"
    echo "  🌿 Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
    
    git fetch origin 2>/dev/null
    BEHIND=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")
    if [ "$BEHIND" -eq 0 ]; then
        echo "  ✅ Status: ATUALIZADO"
    else
        echo "  ⚠️ Status: $BEHIND commit(s) atrás"
    fi
else
    echo "  ❌ Projeto não encontrado"
fi

# Logs recentes
echo ""
echo "📝 LOGS RECENTES:"
if [ -f "/var/log/auto-update.log" ]; then
    echo "  Auto-update:"
    tail -3 /var/log/auto-update.log | sed 's/^/    /'
fi

if [ -f "/var/log/webhook.log" ]; then
    echo "  Webhook:"
    tail -3 /var/log/webhook.log | sed 's/^/    /'
fi

echo ""
echo "🔧 URLs DE TESTE:"
echo "  Status: http://144.22.212.82:9999/status"
echo "  Webhook: http://144.22.212.82:9999/webhook"
echo ""
echo "📊 Executado em: $(date)"
echo "==============================="
EOF

chmod +x /opt/auto-update/status.sh

# 11. Testar serviços
log "Testando configuração..."
sleep 3

# Verificar webhook
if systemctl is-active --quiet github-webhook.service; then
    log "✅ Webhook service ativo"
else
    warning "⚠️ Webhook service com problema"
    systemctl restart github-webhook.service
fi

# Verificar porta
if netstat -tulpn | grep :9999 >/dev/null 2>&1; then
    log "✅ Porta 9999 aberta"
else
    warning "⚠️ Porta 9999 não está aberta"
fi

# 12. Executar primeira verificação
log "Executando primeira verificação..."
/opt/auto-update/update.sh

# 13. Mostrar informações finais
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✅ CONFIGURAÇÃO CONCLUÍDA!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "🌐 INFORMAÇÕES DO WEBHOOK:"
echo "  URL: http://144.22.212.82:9999/webhook"
echo "  Status: http://144.22.212.82:9999/status"
echo ""
echo "📊 COMANDOS ÚTEIS:"
echo "  Status: /opt/auto-update/status.sh"
echo "  Update manual: /opt/auto-update/update.sh"
echo "  Logs: tail -f /var/log/auto-update.log"
echo "  Webhook logs: tail -f /var/log/webhook.log"
echo ""
echo "⚙️ CONFIGURAÇÃO NO GITHUB:"
echo "  1. Ir para: Settings > Webhooks"
echo "  2. Add webhook"
echo "  3. URL: http://144.22.212.82:9999/webhook"
echo "  4. Content type: application/json"
echo "  5. Events: Just the push event"
echo ""

# Executar status final
sleep 2
/opt/auto-update/status.sh

log "🎉 Setup completo! Seu site agora atualiza automaticamente."
