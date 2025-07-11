# 🚀 Como Usar - Deploy Siqueira Campos Imóveis

## ⚡ Instalação Rápida (3 comandos)

```bash
# 1. Tornar executável
chmod +x *.sh

# 2. Executar deploy
sudo ./install-infra.sh

# 3. Verificar sistema
sudo ./check-system.sh
```

## 📋 Pré-requisitos

- ✅ Ubuntu 20.04+ ou Debian 11+
- ✅ Mínimo 8GB RAM (recomendado 24GB)
- ✅ Acesso root/sudo
- ✅ Domínios apontando para o servidor:
  - `siqueicamposimoveis.com.br`
  - `meuboot.site`

## 🎯 O Que Será Instalado

### 🌐 Serviços Web

- **Traefik** - Proxy reverso + SSL automático
- **Portainer** - Gerenciamento Docker
- **N8N** - Automação de workflows
- **Evolution API** - WhatsApp Business
- **Grafana** - Monitoramento
- **MinIO** - Armazenamento de arquivos
- **Adminer** - Interface do banco

### 🏗️ Aplicação Principal

- **Frontend React** - Site imobiliário
- **Backend Express** - API REST
- **PostgreSQL** - Banco de dados
- **Redis** - Cache
- **Webhook** - Deploy automático GitHub

## 🔐 Credenciais

Após a instalação, todas as senhas estarão em:

```
/opt/senhas-sistema.txt
```

## 🌐 URLs de Acesso

### 🔷 meuboot.site (Painel)

- Portainer: https://meuboot.site
- Traefik: https://traefik.meuboot.site
- N8N: https://n8n.meuboot.site
- Grafana: https://grafana.meuboot.site
- MinIO: https://minio.meuboot.site
- Adminer: https://adminer.meuboot.site
- Evolution: https://evo.meuboot.site

### 🔷 siqueicamposimoveis.com.br (Site)

- Site: https://siqueicamposimoveis.com.br
- API: https://api.siqueicamposimoveis.com.br
- Portainer: https://portainer.siqueicamposimoveis.com.br
- Webhook: https://webhook.siqueicamposimoveis.com.br

## 🔄 GitHub Webhook

### Configuração Automática:

1. Vá em: **Settings > Webhooks**
2. **Payload URL**: `https://webhook.siqueicamposimoveis.com.br`
3. **Content Type**: `application/json`
4. **Secret**: Conteúdo de `/opt/webhook-secret.txt`
5. **Events**: Just the push event
6. **Active**: ✅

### Auto-Deploy:

- Push na branch `main` = deploy automático
- Logs em: `/var/log/auto-deploy.log`

## 📊 Monitoramento

### Verificar Status:

```bash
# Status geral
sudo ./check-system.sh

# Serviços Docker
docker service ls

# Logs
tail -f /var/log/kryonix-deploy/deploy.log
```

### Comandos Úteis:

```bash
# Ver senhas
sudo cat /opt/senhas-sistema.txt

# Logs do Traefik
docker service logs traefik_traefik

# Restart de um serviço
docker service update --force [nome-do-serviço]

# Backup do banco
docker exec $(docker ps -q -f "name=postgres") pg_dump -U sitejuarez bdsitejuarez > backup.sql
```

## ⚠️ Solução de Problemas

### SSL não funcionando:

```bash
# Verificar DNS
dig +short siqueicamposimoveis.com.br

# Logs do Traefik
docker service logs traefik_traefik --tail 50
```

### Serviço não iniciando:

```bash
# Verificar recursos
free -h
df -h

# Logs específicos
docker service logs [nome-do-serviço]
```

### Webhook não funcionando:

```bash
# Testar webhook
curl -X POST https://webhook.siqueicamposimoveis.com.br/health

# Logs do webhook
docker service logs webhook_webhook
```

## 🔧 Configurações Pós-Deploy

### 1. N8N (Automação)

- Acesse: https://n8n.siqueicamposimoveis.com.br
- Importe workflow do repositório
- Configure credenciais PostgreSQL

### 2. Evolution API (WhatsApp)

- Acesse: https://evo.siqueicamposimoveis.com.br
- Crie nova instância
- Escaneie QR Code
- Configure webhook para N8N

### 3. Grafana (Monitoramento)

- Acesse: https://grafana.siqueicamposimoveis.com.br
- Configure PostgreSQL como datasource
- Importe dashboards de monitoramento

## 📞 Suporte

**Desenvolvido por**: Kryonix - Vitor Jayme

- **WhatsApp**: (17) 9 8180-5327
- **Instagram**: @kryon.ix

## 📁 Arquivos Incluídos

- `install-infra.sh` - Script principal de instalação
- `quick-start.sh` - Início rápido com verificações
- `check-system.sh` - Verificação e monitoramento
- `make-executable.sh` - Tornar scripts executáveis
- `README-DEPLOY.md` - Documentação completa
- `COMO-USAR.md` - Este arquivo

---

**✨ Sistema Enterprise Pronto para Produção ✨**
