# 🚀 SISTEMA KRYONIX

Sistema de Deploy Completo e Autônomo para VPS Oracle Ubuntu 22.04

## 📋 Visão Geral

O **KRYONIX** é um sistema de deploy automatizado que configura uma infraestrutura completa em sua VPS Oracle, incluindo:

- ✅ **Docker + Docker Compose + Docker Swarm**
- ✅ **Traefik (Reverse Proxy com HTTPS automático)**
- ✅ **PostgreSQL + Redis + Adminer**
- ✅ **Portainer (Gerenciamento Docker)**
- ✅ **N8N (Automação de Workflows)**
- ✅ **Evolution API (WhatsApp Business)**
- ✅ **MinIO (Object Storage)**
- ✅ **Grafana + Prometheus (Monitoramento)**
- ✅ **ChatGPT Stack (IA)**
- ✅ **GitHub Webhook (Auto-deploy)**
- ✅ **DNS Automático via GoDaddy API**

---

## 🎯 Pré-requisitos

### Servidor

- **VPS Oracle Ubuntu 22.04**
- **Mínimo: 2 CPU, 8GB RAM, 50GB SSD**
- **Recomendado: 2 CPU, 12GB RAM, 220GB SSD**
- **Acesso root via SSH**

### Domínios

- `siqueicamposimoveis.com.br` (IP: 144.22.212.82)
- `meuboot.site` (mesma VPS)

### APIs Necessárias

- **GoDaddy API Key**: `gHptA5P64dTz_LmKXsM49Ms7Ntiru4sSqSu`
- **GoDaddy API Secret**: `TdJ5fnnBQwvGEbE8Ps9MMd`
- **OpenAI API Key** (para ChatGPT Stack)

---

## 🚀 Instalação Rápida

### Método 1: Instalação Automática (Recomendado)

```bash
# 1. Conectar como root
sudo su -

# 2. Baixar o instalador
wget https://raw.githubusercontent.com/seu-repo/kryonix/main/install_kryonix.sh

# 3. Dar permissão e executar
chmod +x install_kryonix.sh
./install_kryonix.sh
```

### Método 2: Instalação Manual

```bash
# 1. Conectar como root
sudo su -

# 2. Baixar todos os arquivos
wget https://raw.githubusercontent.com/seu-repo/kryonix/main/deploy_kryonix_complete.sh
wget https://raw.githubusercontent.com/seu-repo/kryonix/main/docker-compose.kryonix.yml
wget https://raw.githubusercontent.com/seu-repo/kryonix/main/github-webhook.sh
wget https://raw.githubusercontent.com/seu-repo/kryonix/main/prometheus.yml

# 3. Dar permissões
chmod +x deploy_kryonix_complete.sh
chmod +x github-webhook.sh

# 4. Executar instalação
./deploy_kryonix_complete.sh
```

---

## 🌐 Serviços Disponíveis

Após a instalação, todos os serviços estarão disponíveis com **HTTPS válido**:

### 📊 Monitoramento & Gestão

- 🐳 **Portainer**: https://portainer.siqueicamposimoveis.com.br
- 🐳 **Portainer (MeuBoot)**: https://portainer.meuboot.site
- 🔀 **Traefik Dashboard**: https://traefik.siqueicamposimoveis.com.br
- 📊 **Grafana**: https://grafana.siqueicamposimoveis.com.br
- 📈 **Prometheus**: https://prometheus.siqueicamposimoveis.com.br

### 🗄️ Banco de Dados & Storage

- 🗄️ **Adminer**: https://adminer.siqueicamposimoveis.com.br
- 📦 **MinIO Console**: https://minio.siqueicamposimoveis.com.br
- 📦 **MinIO API**: https://storage.siqueicamposimoveis.com.br

### 🤖 Automação & IA

- 🔗 **N8N (Siqueira)**: https://n8n.siqueicamposimoveis.com.br
- 🔗 **N8N (MeuBoot)**: https://n8n.meuboot.site
- 🔗 **N8N Webhook**: https://webhookn8n.meuboot.site
- 🤖 **ChatGPT Stack**: https://chatgpt.siqueicamposimoveis.com.br
- 🤖 **Bot Assistant**: https://bot.siqueicamposimoveis.com.br

### 📱 WhatsApp & Comunicação

- 📱 **Evolution API (Main)**: https://evolution.siqueicamposimoveis.com.br
- 📱 **Evolution API (Boot)**: https://evo.meuboot.site

---

## 🔐 Credenciais Padrão

### Portainer

- **Usuário**: `vitorfernandes`
- **Senha**: `Vitor@123456`

### Grafana

- **Usuário**: `admin`
- **Senha**: `kryonix_grafana_password_2024`

### N8N

- **Usuário**: `kryonix`
- **Senha**: `kryonix_n8n_password_2024`

### PostgreSQL

- **Usuário**: `kryonix_user`
- **Senha**: `kryonix_strong_password_2024`
- **Database**: `kryonix_main`

### MinIO

- **Usuário**: `kryonix_minio_admin`
- **Senha**: `kryonix_minio_password_2024`

### Redis

- **Senha**: `kryonix_redis_password_2024`

---

## ⚙️ Configurações Importantes

### GitHub Webhook

- **URL**: `http://144.22.212.82:9999/webhook`
- **Secret**: `kryonix_webhook_secret_2024`
- **Content-Type**: `application/json`

### SMTP (N8N/Notificações)

- **Host**: `smtp.gmail.com`
- **Porta**: `465`
- **Usuário**: `vitor.nakahh@gmail.com`
- **Senha**: `@Vitor.12345@`

### Diretórios Importantes

- **Projeto**: `/opt/site-jurez-2.0`
- **Configurações**: `/opt/kryonix/`
- **Logs**: `/var/log/kryonix-webhook.log`

---

## 📝 Comandos Úteis

### Docker

```bash
# Ver status dos serviços
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f traefik

# Reiniciar todos os serviços
docker-compose restart

# Parar todos os serviços
docker-compose down

# Iniciar todos os serviços
docker-compose up -d
```

### Webhook GitHub

```bash
# Status do webhook
systemctl status kryonix-webhook

# Restart do webhook
systemctl restart kryonix-webhook

# Logs do webhook
journalctl -u kryonix-webhook -f

# Atualização manual do projeto
kryonix-update
```

### Monitoramento

```bash
# Verificar uso de recursos
docker stats

# Verificar espaço em disco
df -h

# Verificar logs do sistema
journalctl -f

# Verificar firewall
ufw status
```

---

## 🔧 Troubleshooting

### Problema: Serviços não iniciam

```bash
# Verificar logs
docker-compose logs

# Verificar espaço em disco
df -h

# Verificar memória
free -h

# Reiniciar Docker
systemctl restart docker
```

### Problema: HTTPS não funciona

```bash
# Verificar certificados Traefik
docker logs kryonix-traefik

# Verificar DNS
nslookup portainer.siqueicamposimoveis.com.br

# Forçar renovação de certificados
docker-compose restart traefik
```

### Problema: Webhook não funciona

```bash
# Verificar status
systemctl status kryonix-webhook

# Verificar logs
tail -f /var/log/kryonix-webhook.log

# Testar webhook manualmente
curl -X POST http://localhost:9999/webhook
```

### Problema: Banco de dados

```bash
# Conectar ao PostgreSQL
docker exec -it kryonix-postgres psql -U kryonix_user -d kryonix_main

# Verificar status
docker exec kryonix-postgres pg_isready

# Backup do banco
docker exec kryonix-postgres pg_dump -U kryonix_user kryonix_main > backup.sql
```

---

## 🔄 Atualizações

O sistema possui **auto-update** via webhook do GitHub. A cada push no repositório, o sistema será atualizado automaticamente.

### Atualização Manual

```bash
# Executar update manual
kryonix-update

# Verificar se há atualizações pendentes
cd /opt/site-jurez-2.0
git status
```

---

## 🛡️ Segurança

### Firewall (UFW)

- **SSH**: Porta 22
- **HTTP**: Porta 80
- **HTTPS**: Porta 443
- **Serviços internos**: Portas 3000-9000
- **Webhook**: Porta 9999

### Backup Automático

- **Configurações**: `/backup/`
- **Banco de dados**: Backup diário automático
- **Código**: Git repository

### Monitoramento

- **Grafana**: Dashboards em tempo real
- **Prometheus**: Métricas detalhadas
- **Logs**: Centralizados via Docker

---

## 📞 Suporte

Para suporte e dúvidas:

- **Email**: vitor.nakahh@gmail.com
- **Documentação**: Este README
- **Logs**: `/var/log/kryonix-webhook.log`

---

## 🎯 Próximos Passos

Após a instalação:

1. ✅ Acesse o Portainer e configure seus containers
2. ✅ Configure o N8N com seus workflows
3. ✅ Conecte a Evolution API ao WhatsApp Business
4. ✅ Configure o ChatGPT Stack com sua API key
5. ✅ Monitore o sistema via Grafana
6. ✅ Configure o webhook no GitHub

---

**🚀 Sistema KRYONIX - Infraestrutura completa e automatizada!**
