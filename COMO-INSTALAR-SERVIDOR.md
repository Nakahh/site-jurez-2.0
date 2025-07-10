# 🚀 Como Instalar no Seu Servidor

## ✅ Método 1: Instalação Automática (Recomendado)

### Conecte no seu servidor e execute:

```bash
# Baixar e executar script automático
curl -fsSL https://raw.githubusercontent.com/Nakahh/site-jurez-2.0/main/auto-vps-setup.sh | sudo bash
```

**Isso é tudo!** O script vai:

- ✅ Detectar seu sistema automaticamente
- ✅ Instalar todas as dependências
- ✅ Configurar nginx com redirect WWW
- ✅ Corrigir problema mobile
- ✅ Configurar SSL automático
- ✅ Instalar auto-deploy
- ✅ Configurar monitoramento

---

## ✅ Método 2: Instalação Manual

Se preferir fazer passo a passo:

### 1. Conectar no servidor

```bash
ssh root@seu-servidor
# ou
ssh ubuntu@seu-servidor
sudo su -
```

### 2. Baixar os scripts

```bash
git clone https://github.com/Nakahh/site-jurez-2.0.git
cd site-jurez-2.0
```

### 3. Executar setup

```bash
chmod +x auto-vps-setup.sh
./auto-vps-setup.sh
```

---

## 📋 O que o script vai perguntar:

1. **Domínio**: Ex: `siqueicamposimoveis.com.br`
2. **Email**: Ex: `admin@siqueicamposimoveis.com.br`

**Só isso!** O resto é automático.

---

## ✅ Funciona em:

- ✅ **Ubuntu** (18.04, 20.04, 22.04, 24.04)
- ✅ **Debian** (10, 11, 12)
- ✅ **CentOS** (7, 8, 9)
- ✅ **Amazon Linux** (1, 2)
- ✅ **Oracle Cloud** (Ubuntu/CentOS)
- ✅ **DigitalOcean** (Ubuntu/Debian)
- ✅ **Google Cloud** (Ubuntu/Debian)
- ✅ **Azure** (Ubuntu)
- ✅ **AWS** (Ubuntu/Amazon Linux)

---

## 🎯 Depois da instalação:

### ✅ Seu site estará funcionando em:

- `https://siqueicamposimoveis.com.br`
- `https://www.siqueicamposimoveis.com.br` (redireciona)

### ✅ Configure webhook GitHub:

1. Vá em: https://github.com/Nakahh/site-jurez-2.0/settings/hooks
2. Clique "Add webhook"
3. URL: `https://siqueicamposimoveis.com.br/api/webhook/github`
4. Secret: (será mostrado no final da instalação)
5. Events: "Just the push event"

### ✅ Teste o auto-deploy:

1. Faça qualquer mudança no código
2. `git push` para a branch main
3. Aguarde 1-2 minutos
4. Site será atualizado automaticamente!

---

## 🔧 Comandos úteis:

```bash
# Ver status
systemctl status siqueira-campos

# Ver logs
journalctl -u siqueira-campos -f

# Restart manual
systemctl restart siqueira-campos

# Deploy manual
/var/www/siqueira-campos/auto-deploy.sh

# Ver logs nginx
tail -f /var/log/nginx/access.log
```

---

## 🆘 Resolução de problemas:

### Site não carrega:

```bash
systemctl status siqueira-campos
systemctl status nginx
```

### SSL não funciona:

```bash
certbot renew
systemctl restart nginx
```

### Auto-deploy não funciona:

```bash
tail -f /var/log/siqueira-deploy.log
```

---

## 📞 Suporte:

Se algo der errado:

1. **Verifique logs**: `journalctl -u siqueira-campos -f`
2. **Teste API**: `curl https://siqueicamposimoveis.com.br/api/ping`
3. **Restart tudo**: `systemctl restart siqueira-campos nginx`

---

## 🎉 Resultado Final:

Após a instalação você terá:

- ✅ **Site funcionando** com HTTPS
- ✅ **Mobile otimizado** (sem erro de loading)
- ✅ **WWW redirecionando** automaticamente
- ✅ **Auto-deploy** configurado
- ✅ **SSL renovação** automática
- ✅ **Monitoramento** ativo
- ✅ **Firewall** configurado
- ✅ **Backup** automático antes deploy

**Tempo total**: 5-10 minutos

**Seu site estará 100% funcional e automatizado!** 🚀
