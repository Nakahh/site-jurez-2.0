# 🔄 CONFIGURAÇÃO DE AUTO-ATUALIZAÇÃO GITHUB

## 📋 DIAGNÓSTICO DO PROBLEMA

Baseado na análise dos seus scripts, o sistema de auto-atualização GitHub não está ativo no momento. Você tem os scripts criados, mas eles não estão executando.

## ✅ SOLUÇÃO RÁPIDA

### 1. Execute o script de verificação no seu servidor:

```bash
# No seu servidor Oracle
sudo su
cd /opt
wget -O check-update.sh https://raw.githubusercontent.com/Nakahh/site-jurez-2.0/main/check-and-setup-auto-update.sh
chmod +x check-update.sh
./check-update.sh
```

### 2. Ou configure manualmente:

```bash
# 1. Encontrar seu projeto
cd /opt
find . -name "site-jurez-2.0" -type d 2>/dev/null

# 2. Se não encontrou, procurar em outros locais
find /home -name "site-jurez-2.0" -type d 2>/dev/null
find /var/www -name "site-jurez-2.0" -type d 2>/dev/null

# 3. Ir para o diretório do projeto
cd /opt/site-jurez-2.0  # (ou onde encontrou)

# 4. Verificar status Git
git status
git fetch origin
git log --oneline -5

# 5. Verificar se há atualizações pendentes
git rev-list HEAD...origin/main --count
```

## 🔧 CONFIGURAÇÃO AUTOMÁTICA

### Script de atualização automática:

```bash
# Criar diretório para scripts
sudo mkdir -p /opt/auto-update

# Criar script de atualização
sudo tee /opt/auto-update/update.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="/opt/site-jurez-2.0"
LOG_FILE="/var/log/auto-update.log"

# Procurar projeto se não existir no local padrão
if [ ! -d "$PROJECT_DIR" ]; then
    for dir in "/opt/mega-deploy/app/site-jurez-2.0" "/home/ubuntu/site-jurez-2.0"; do
        if [ -d "$dir" ]; then
            PROJECT_DIR="$dir"
            break
        fi
    done
fi

cd "$PROJECT_DIR" || exit 1

echo "[$(date)] Verificando atualizações..." >> "$LOG_FILE"

# Verificar atualizações
git fetch origin
BEHIND=$(git rev-list HEAD...origin/main --count)

if [ "$BEHIND" -gt 0 ]; then
    echo "[$(date)] Encontradas $BEHIND atualizações, aplicando..." >> "$LOG_FILE"

    # Backup antes de atualizar
    cp -r . "/tmp/backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true

    # Atualizar
    git pull origin main

    # Instalar dependências se necessário
    if [ -f "package.json" ]; then
        npm install
    fi

    # Reiniciar serviços
    if [ -f "docker-compose.yml" ]; then
        docker-compose down && docker-compose up -d --build
    fi

    echo "[$(date)] Atualização concluída!" >> "$LOG_FILE"
else
    echo "[$(date)] Projeto já está atualizado" >> "$LOG_FILE"
fi
EOF

# Dar permissão de execução
sudo chmod +x /opt/auto-update/update.sh

# Configurar cron para executar a cada 10 minutos
(sudo crontab -l 2>/dev/null; echo "*/10 * * * * /opt/auto-update/update.sh") | sudo crontab -

echo "✅ Auto-atualização configurada!"
echo "📝 Logs em: /var/log/auto-update.log"
```

## 🌐 CONFIGURAÇÃO DO WEBHOOK GITHUB

### 1. No GitHub:

1. Vá para Settings > Webhooks
2. Add webhook
3. URL: `http://SEU_IP_ORACLE:9999/webhook`
4. Content type: `application/json`
5. Trigger: `Just the push event`

### 2. Configurar servidor webhook:

```bash
# Criar servidor webhook
sudo tee /opt/auto-update/webhook.py << 'EOF'
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
                    print(f"[{datetime.now()}] Webhook recebido - Atualizando...")

                    result = subprocess.run(['/opt/auto-update/update.sh'],
                                          capture_output=True, text=True)

                    if result.returncode == 0:
                        self.send_response(200)
                        self.end_headers()
                        self.wfile.write(b'Atualizado com sucesso!')
                    else:
                        self.send_response(500)
                        self.end_headers()
                        self.wfile.write(b'Erro na atualizacao')
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

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), WebhookHandler) as httpd:
        print(f'Webhook server rodando na porta {PORT}')
        httpd.serve_forever()
EOF

sudo chmod +x /opt/auto-update/webhook.py

# Criar serviço systemd
sudo tee /etc/systemd/system/webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /opt/auto-update/webhook.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Ativar serviço
sudo systemctl daemon-reload
sudo systemctl enable webhook.service
sudo systemctl start webhook.service

echo "✅ Webhook configurado na porta 9999"
```

## 🔍 VERIFICAÇÃO

### Testar se está funcionando:

```bash
# Verificar status dos serviços
sudo systemctl status webhook.service

# Verificar cron jobs
sudo crontab -l

# Verificar logs
tail -f /var/log/auto-update.log

# Teste manual de atualização
sudo /opt/auto-update/update.sh

# Verificar portas
netstat -tulpn | grep 9999
```

## 📊 MONITORAMENTO

### Script de status:

```bash
sudo tee /opt/auto-update/status.sh << 'EOF'
#!/bin/bash
echo "🔍 STATUS AUTO-ATUALIZAÇÃO"
echo "========================="
echo "Webhook: $(systemctl is-active webhook.service)"
echo "Cron: $(crontab -l | grep update | wc -l) job(s)"
echo "Porta 9999: $(netstat -tulpn | grep :9999 | wc -l) ativa"
echo "Último log: $(tail -1 /var/log/auto-update.log 2>/dev/null || echo 'Nenhum')"
echo ""
echo "📁 Projeto:"
cd /opt/site-jurez-2.0 2>/dev/null || cd /opt/mega-deploy/app/site-jurez-2.0 2>/dev/null || echo "Projeto não encontrado"
if [ $? -eq 0 ]; then
    echo "Diretório: $(pwd)"
    echo "Branch: $(git branch --show-current)"
    echo "Último commit: $(git log -1 --oneline)"
    git fetch origin
    BEHIND=$(git rev-list HEAD...origin/main --count)
    echo "Commits atrás: $BEHIND"
fi
EOF

sudo chmod +x /opt/auto-update/status.sh
```

## 🚨 TROUBLESHOOTING

### Problemas comuns:

1. **Projeto não encontrado**: Verifique onde está o diretório
2. **Webhook não responde**: Verifique se a porta 9999 está aberta
3. **Git pull falha**: Verifique permissões e conflitos
4. **Docker não reinicia**: Verifique se docker-compose está instalado

### Comandos úteis:

```bash
# Ver todos os processos relacionados
ps aux | grep -E "(git|webhook|node)"

# Ver portas em uso
netstat -tulpn | grep -E ":(80|443|3000|9999)"

# Logs do sistema
journalctl -u webhook.service -f

# Forçar atualização manual
cd /opt/site-jurez-2.0 && git pull origin main
```

## 🎯 RESULTADO ESPERADO

Após configurar:

- ✅ Cron job verificando atualizações a cada 10 minutos
- ✅ Webhook GitHub na porta 9999
- ✅ Logs em /var/log/auto-update.log
- ✅ Atualização automática a cada push no GitHub

Execute o script de status para verificar: `sudo /opt/auto-update/status.sh`
