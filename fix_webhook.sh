#!/bin/bash

echo "🔧 Corrigindo webhook GitHub..."

# Script de deploy
cat > /usr/local/bin/github-webhook.sh << 'EOF'
#!/bin/bash
cd /opt/site-jurez-2.0 && git pull && docker-compose -f /opt/kryonix/docker-compose.yml up -d --build frontend backend
EOF
chmod +x /usr/local/bin/github-webhook.sh

# Script Python para webhook
cat > /usr/local/bin/webhook-server.py << 'EOF'
#!/usr/bin/env python3
import http.server
import socketserver
import subprocess

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook':
            try:
                subprocess.run(['/usr/local/bin/github-webhook.sh'], check=True)
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Deploy executado com sucesso!')
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(f'Erro no deploy: {str(e)}'.encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    PORT = 9999
    with socketserver.TCPServer(('', PORT), WebhookHandler) as httpd:
        print(f'Webhook server rodando na porta {PORT}')
        httpd.serve_forever()
EOF
chmod +x /usr/local/bin/webhook-server.py

# Service file corrigido
cat > /etc/systemd/system/github-webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook Auto Deploy
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/webhook-server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Recarregar e iniciar
systemctl daemon-reload
systemctl stop github-webhook.service 2>/dev/null || true
systemctl enable github-webhook.service
systemctl start github-webhook.service

echo "✅ Webhook corrigido!"
echo "🔗 URL: http://144.22.212.82:9999/webhook"
echo "📝 Configure no GitHub: Settings > Webhooks > Add webhook"
