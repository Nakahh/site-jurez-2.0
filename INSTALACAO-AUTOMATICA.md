# 🤖 Instalação 100% AUTOMÁTICA

## ⚡ Comando Único - ZERO Configuração

### Execute apenas este comando no seu servidor:

```bash
curl -fsSL https://raw.githubusercontent.com/Nakahh/site-jurez-2.0/main/setup-automatico.sh | sudo bash
```

**PRONTO!** O script vai:

- 🤖 **Detectar tudo automaticamente** (sistema, IP, etc.)
- 📦 **Instalar todas as dependências**
- 🏗️ **Clonar e configurar seu projeto**
- 🌐 **Configurar nginx com seu IP automático**
- ✅ **Corrigir problema mobile**
- ✅ **Configurar redirect WWW**
- 🔄 **Instalar auto-deploy**
- 📊 **Configurar monitoramento**
- 🔥 **Configurar firewall**

---

## 🎯 O que acontece automaticamente:

### 1. **Detecção Automática:**

- ✅ Sistema operacional (Ubuntu, CentOS, Amazon Linux, etc.)
- ✅ IP público do servidor
- ✅ Provedor cloud (AWS, GCP, Azure, Oracle, etc.)
- ✅ Usuário web (www-data, nginx, apache)

### 2. **Configuração Automática:**

- ✅ Domínio: `SEU-IP.nip.io` (funciona automaticamente)
- ✅ Email: `admin@siqueicamposimoveis.com.br`
- ✅ Webhook secret: gerado automaticamente
- ✅ Todas as dependências instaladas

### 3. **Resultado:**

- ✅ Site funcionando: `http://SEU-IP`
- ✅ Site funcionando: `http://SEU-IP.nip.io`
- ✅ API funcionando: `http://SEU-IP/api/ping`
- ✅ Mobile sem erro de loading
- ✅ WWW redirecionando
- ✅ Auto-deploy configurado

---

## 📱 Zero Problemas Mobile

O script automaticamente:

- ✅ **Corrige timeout mobile** (5 segundos máximo)
- ✅ **Otimiza loading** para iPhone/Android
- ✅ **Headers mobile** configurados
- ✅ **Fallback inteligente** se demorar

---

## 🌐 WWW Automático

O script automaticamente:

- ✅ **www.siqueicamposimoveis.com.br** → redireciona
- ✅ **Funciona com qualquer domínio**
- ✅ **Preserva HTTPS** quando configurado
- ✅ **Nginx otimizado**

---

## 🔄 Auto-Deploy Pronto

Após a instalação:

1. **Configure webhook no GitHub:**
   - URL: `http://SEU-IP/api/webhook/github`
   - Secret: (será mostrado no final)

2. **Teste fazendo push:**
   - Faça qualquer mudança no código
   - `git push` para main
   - Site atualiza sozinho em 1-2 minutos!

---

## 🎛️ Funciona em QUALQUER VPS:

- ✅ **Amazon EC2** (Ubuntu, Amazon Linux)
- ✅ **Google Cloud** (Ubuntu, Debian)
- ✅ **Azure** (Ubuntu)
- ✅ **Oracle Cloud** (Ubuntu, CentOS)
- ✅ **DigitalOcean** (Ubuntu, Debian)
- ✅ **Vultr, Linode, Hetzner** (Ubuntu, Debian)
- ✅ **VPS Nacional** (Ubuntu, Debian)

---

## 📊 Monitoramento Incluído

O script configura automaticamente:

- ✅ **Monitor a cada 5 minutos**
- ✅ **Restart automático** se parar
- ✅ **Limpeza de logs** automática
- ✅ **Backup antes deploy**
- ✅ **Logs organizados**

---

## 🔧 Comandos Úteis

Após a instalação:

```bash
# Ver status
systemctl status siqueira-campos

# Ver logs
journalctl -u siqueira-campos -f

# Logs de deploy
tail -f /var/log/siqueira-deploy.log

# Logs de monitoramento
tail -f /var/log/siqueira-monitor.log

# Deploy manual
/var/www/siqueira-campos/auto-deploy.sh

# Restart
systemctl restart siqueira-campos
```

---

## 🆘 Se algo der errado:

### Problema: Script não roda

```bash
# Certifique-se que é root
sudo su -
curl -fsSL ... | bash
```

### Problema: Site não carrega

```bash
# Verificar serviços
systemctl status siqueira-campos nginx

# Restart tudo
systemctl restart siqueira-campos nginx
```

### Problema: Auto-deploy não funciona

```bash
# Verificar logs
tail -f /var/log/siqueira-deploy.log

# Testar webhook
curl -X POST http://SEU-IP/api/webhook/github
```

---

## 🎉 Resultado Final

Após executar o comando único, você terá:

### ✅ **Site 100% Funcional:**

- Mobile otimizado (sem erro)
- WWW redirecionando
- API funcionando
- Nginx configurado

### ✅ **Sistema Automatizado:**

- Auto-deploy ativo
- Monitoramento ligado
- Backup automático
- Logs organizados

### ✅ **Pronto para Produção:**

- Firewall configurado
- Serviços habilitados
- Restart automático
- Zero manutenção

---

## 🚀 Tempo Total: 5-10 minutos

**Seu site estará 100% funcional e automatizado!**

**Sem perguntas, sem configuração manual, sem complicação!** 🎯
