# 🚀 KRYONIX INFRAESTRUTURA AUTOMATIZADA

> **Sistema de deploy automatizado completo para infraestrutura imobiliária profissional**

## 📋 Visão Geral

Este projeto implementa uma infraestrutura completa e automatizada para hospedar dois sistemas distintos:

- 🔷 **meuboot.site** - Painel administrativo com ferramentas de gestão
- 🔶 **siqueicamposimoveis.com.br** - Plataforma imobiliária pública

### 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR UBUNTU 24.04                    │
├─────────────────────────────────────────────────────────────┤
│                      TRAEFIK PROXY                          │
│           (SSL Automático + Roteamento Reverso)             │
├───────────────────────┬─────────────────────────────────────┤
│   STACK ADMINISTRATIVA │         STACK PÚBLICA              │
│      (meuboot.site)    │   (siqueicamposimoveis.com.br)     │
├───────────────────────┼─────────────────────────────────────┤
│ • Portainer           │ • React/TypeScript App             │
│ • N8N Workflows       │ • Express.js API                   │
│ • MinIO Storage       │ • PostgreSQL                       │
│ • Grafana Monitoring  │ • Redis Cache                      │
│ • PostgreSQL Admin    │ • Nginx Frontend                   │
│ • Adminer DB          │ • Portainer Local                  │
│ • Webhook Listener    │ • Auto-Deploy GitHub               │
└───────────────────────┴──────────────────────────────────��──┘
```

## 🎯 Características Principais

### ✨ **Automação Completa**

- ⚡ Deploy em um comando: `sudo ./install-infra.sh`
- 🔄 Configuração zero-touch sem input humano
- 🛡️ Autocorreção e recuperação de falhas
- 📊 Interface visual com progresso e logs

### 🔒 **Segurança Avançada**

- 🏆 SSL automático com Let's Encrypt
- 🔐 Certificados auto-renováveis
- 🛡️ Firewall UFW configurado
- 🚫 Fail2ban contra ataques
- 🔑 Senhas geradas automaticamente

### 🐳 **Docker & Orquestração**

- 🌊 Docker Swarm para alta disponibilidade
- 📦 Stacks isoladas por domínio
- 🔄 Deploy sem downtime
- 📈 Escalabilidade horizontal
- 💾 Volumes persistentes

### 🌐 **Proxy Reverso Inteligente**

- 🚦 Traefik v3 com roteamento automático
- 🔀 Load balancing integrado
- 📊 Métricas e monitoramento
- 🔒 Headers de segurança automáticos
- 🌍 Suporte multi-domínio

### 📈 **Monitoramento & Logs**

- 🔍 Watchdog automático a cada 5 minutos
- 📊 Grafana dashboards prontos
- 📝 Logs centralizados
- 🚨 Alertas automáticos
- 💾 Backup automático diário

## 🚀 Instalação Rápida

### Pré-requisitos

- Ubuntu 24.04 LTS
- 24GB+ RAM (recomendado)
- 100GB+ armazenamento
- Conexão à internet
- Acesso root
- Domínios configurados no DNS

### 1️⃣ Validação Prévia

```bash
# Clone ou baixe os arquivos
git clone <repository>
cd <directory>

# Validar ambiente
sudo ./validate-final.sh
```

### 2️⃣ Instalação

```bash
# Executar instalação completa
sudo ./install-infra.sh

# ☕ Aguarde 15-30 minutos...
# 🎉 Pronto! Infraestrutura funcionando
```

### 3️⃣ Configuração Final

1. **DNS**: Aponte os domínios para o IP do servidor
2. **GitHub**: Configure webhook conforme instruções
3. **Acessos**: Use credenciais exibidas no relatório

## 📁 Estrutura de Arquivos

```
├── install-infra.sh           # 🔧 Script principal de instalação
├── validate-final.sh          # ✅ Validador de ambiente
├── test-infrastructure.sh     # 🧪 Testes de integração
├── backup-system.sh           # 💾 Sistema de backup
├── restore-backup.sh          # 🔄 Restauração de backup
├── update-system.sh           # 🔄 Atualizador do sistema
├── Dockerfile                 # 🐳 Container da aplicação
├── docker-compose.dev.yml     # 🛠️ Ambiente de desenvolvimento
├── .env.production            # ⚙️ Configurações de produção
└── README-KRYONIX-INFRA.md    # 📖 Esta documentação
```

## 🌐 Serviços Disponíveis

### 🔷 Domínio Administrativo (meuboot.site)

| Serviço       | URL                            | Descrição                      |
| ------------- | ------------------------------ | ------------------------------ |
| **Portainer** | `https://meuboot.site`         | 🐳 Gerenciamento de containers |
| **Traefik**   | `https://traefik.meuboot.site` | 🌐 Dashboard do proxy          |
| **N8N**       | `https://n8n.meuboot.site`     | 🔄 Automação de workflows      |
| **MinIO**     | `https://minio.meuboot.site`   | 🗄️ Storage de arquivos         |
| **Grafana**   | `https://grafana.meuboot.site` | 📊 Dashboards e métricas       |
| **Adminer**   | `https://adminer.meuboot.site` | 💾 Interface de banco          |
| **Webhook**   | `https://webhook.meuboot.site` | 🔗 Listener para deploys       |

### 🔶 Domínio Público (siqueicamposimoveis.com.br)

| Serviço       | URL                                            | Descrição               |
| ------------- | ---------------------------------------------- | ----------------------- |
| **Website**   | `https://siqueicamposimoveis.com.br`           | 🏠 Site público         |
| **API**       | `https://api.siqueicamposimoveis.com.br`       | 🔌 Backend da aplicação |
| **Portainer** | `https://portainer.siqueicamposimoveis.com.br` | 🐳 Gerenciamento local  |

## 🔧 Comandos Úteis

### 📊 Monitoramento

```bash
# Status dos containers
docker ps

# Logs em tempo real
docker logs -f <container_name>

# Verificar saúde do sistema
/opt/kryonix/scripts/watchdog.sh

# Relatório de status
cat /opt/kryonix/deploy-summary.txt
```

### 🔄 Operações

```bash
# Reiniciar stack administrativa
cd /opt/kryonix/stacks/admin && docker-compose restart

# Reiniciar stack pública
cd /opt/kryonix/stacks/public && docker-compose restart

# Deploy manual da aplicação
/opt/kryonix/scripts/deploy.sh

# Atualizar sistema completo
/opt/kryonix/scripts/update-system.sh
```

### 💾 Backup & Restauração

```bash
# Fazer backup completo
/opt/kryonix/scripts/backup-system.sh

# Restaurar backup (substituir data)
/opt/kryonix/scripts/restore-backup.sh 20240101_120000

# Listar backups disponíveis
ls -la /opt/kryonix/backups/
```

## 🔗 Configuração do Webhook GitHub

Para deploy automático, configure no GitHub:

1. **Repositório** → Settings → Webhooks → Add webhook
2. **Payload URL**: `https://webhook.meuboot.site/hooks/deploy-public`
3. **Content type**: `application/json`
4. **Secret**: `<WEBHOOK_SECRET do relatório>`
5. **Events**: `Just the push event`
6. **Active**: ✅

## 📈 Monitoramento & Alertas

### 🔍 Watchdog Automático

- Verificação a cada 5 minutos
- Reinício automático de serviços falhados
- Alertas em caso de problemas
- Renovação automática de SSL

### 📊 Métricas Disponíveis

- **Grafana**: Dashboards visuais
- **Traefik**: Métricas de proxy
- **Docker**: Status dos containers
- **Sistema**: CPU, memória, disco

### 📝 Logs Centralizados

```bash
# Logs principais
tail -f /opt/kryonix/logs/kryonix-install.log

# Logs do watchdog
tail -f /opt/kryonix/logs/watchdog.log

# Logs de deploy
tail -f /opt/kryonix/logs/deploy.log
```

## 🔒 Credenciais Padrão

> **⚠️ IMPORTANTE**: Todas as senhas são geradas automaticamente e exibidas no relatório final

### 👤 Acesso Administrativo

- **Usuário**: `admin`
- **Senha**: `<gerada automaticamente>`

### 💾 Banco de Dados

- **PostgreSQL**: `<senha gerada>`
- **Redis**: `<senha gerada>`

### 🔑 Tokens de Segurança

- **JWT Secret**: `<gerado automaticamente>`
- **Webhook Secret**: `<gerado automaticamente>`

## 🆘 Solução de Problemas

### ❌ Problemas Comuns

**1. Containers não iniciam**

```bash
# Verificar logs
docker logs <container_name>

# Verificar recursos
free -h && df -h

# Reiniciar stack
cd /opt/kryonix/stacks/admin && docker-compose restart
```

**2. SSL não funciona**

```bash
# Verificar certificados
certbot certificates

# Renovar manualmente
certbot renew --force-renewal

# Verificar DNS
nslookup <dominio>
```

**3. Deploy falha**

```bash
# Verificar webhook
curl -X POST https://webhook.meuboot.site/hooks/deploy-public

# Verificar logs de deploy
tail -f /opt/kryonix/logs/deploy.log

# Deploy manual
/opt/kryonix/scripts/deploy.sh
```

### 🔧 Recuperação de Emergência

**1. Restaurar backup**

```bash
# Listar backups
ls /opt/kryonix/backups/

# Restaurar
./restore-backup.sh <data_backup>
```

**2. Reinstalar infraestrutura**

```bash
# Limpeza completa
docker system prune -af --volumes

# Reinstalar
sudo ./install-infra.sh
```

**3. Resetar completamente**

```bash
# ⚠️ CUIDADO: Remove tudo
rm -rf /opt/kryonix/
docker system prune -af --volumes
sudo ./install-infra.sh
```

## 📋 Checklist de Produção

### ✅ Antes do Deploy

- [ ] DNS dos domínios configurado
- [ ] Servidor Ubuntu 24.04 LTS
- [ ] 24GB+ RAM disponível
- [ ] Conectividade com internet
- [ ] Acesso root ao servidor

### ✅ Pós Deploy

- [ ] Todos os serviços acessíveis via HTTPS
- [ ] Certificados SSL válidos
- [ ] Webhook GitHub configurado
- [ ] Backup automático funcionando
- [ ] Watchdog monitorando
- [ ] Credenciais salvas com segurança

### ✅ Manutenção

- [ ] Backup semanal manual
- [ ] Atualização mensal do sistema
- [ ] Monitoramento de logs
- [ ] Verificação de certificados
- [ ] Teste de restauração

## 🤝 Suporte

### 📞 Contatos

- **Autor**: Kryonix - IA Fusion
- **Versão**: 2.0.0
- **Criado**: 2024

### 📚 Documentação Adicional

- Traefik: https://traefik.io/traefik/
- Docker: https://docs.docker.com/
- Let's Encrypt: https://letsencrypt.org/
- N8N: https://n8n.io/

### 🐛 Reportar Problemas

1. Verificar logs em `/opt/kryonix/logs/`
2. Executar `./validate-final.sh`
3. Incluir saída dos comandos acima
4. Descrever passos para reproduzir

---

## 🎉 Conclusão

Esta infraestrutura automatizada foi desenvolvida para ser:

- ⚡ **Rápida**: Deploy em menos de 30 minutos
- 🛡️ **Segura**: SSL automático e configurações hardened
- 🔄 **Resiliente**: Auto-recuperação e monitoramento
- 📈 **Escalável**: Preparada para crescimento
- 🎯 **Profissional**: Pronta para produção

**🚀 Execute `sudo ./install-infra.sh` e tenha sua infraestrutura funcionando!**

---

_Desenvolvido com ❤️ pela IA Fusion para automatizar sua infraestrutura de forma profissional e segura._
