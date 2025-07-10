# Configuração do GitHub Webhook para Auto-Deploy

Este guia mostra como configurar o webhook no GitHub para ativar o auto-deploy do seu site.

## 1. Configurar o Webhook no GitHub

### Passo 1: Acessar as configurações do repositório

1. Vá para o seu repositório: https://github.com/Nakahh/site-jurez-2.0
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Webhooks**
4. Clique em **Add webhook** (Adicionar webhook)

### Passo 2: Configurar o webhook

Preencha os campos:

- **Payload URL**: `https://seu-dominio.com.br/api/webhook/github`
  - Substitua `seu-dominio.com.br` pelo seu domínio real
  - Exemplo: `https://siqueicamposimoveis.com.br/api/webhook/github`

- **Content type**: `application/json`

- **Secret**: Crie uma senha forte (será usada para validar as requisições)
  - Exemplo: `minha-senha-super-secreta-123`
  - **IMPORTANTE**: Anote esta senha, você precisará dela no servidor

- **Which events would you like to trigger this webhook?**
  - Selecione: **Just the push event** (Apenas evento de push)

- **Active**: ✅ Marque esta opção

### Passo 3: Salvar

Clique em **Add webhook**

## 2. Configurar a Senha no Servidor

### Opção A: Usando variável de ambiente

```bash
export GITHUB_WEBHOOK_SECRET="minha-senha-super-secreta-123"
```

### Opção B: Criar arquivo .env

```bash
echo "GITHUB_WEBHOOK_SECRET=minha-senha-super-secreta-123" >> .env
```

## 3. Deploy Inicial

### Usando Docker Compose:

```bash
# Parar containers existentes
docker-compose down

# Usar o novo compose com auto-deploy
docker-compose -f docker-compose.autodeploy.yml up -d --build

# Verificar logs
docker-compose -f docker-compose.autodeploy.yml logs -f
```

### Usando Docker simples:

```bash
# Build da imagem
docker build -f Dockerfile.autodeploy -t siqueira-campos:latest .

# Executar container
docker run -d \
  --name siqueira-campos-app \
  -p 3000:3000 \
  -p 3001:3001 \
  -e GITHUB_WEBHOOK_SECRET="minha-senha-super-secreta-123" \
  -v $(pwd):/app \
  --restart unless-stopped \
  siqueira-campos:latest
```

## 4. Testar o Sistema

### Teste manual do webhook:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main"}' \
  https://seu-dominio.com.br/api/webhook/github
```

### Teste completo:

1. Faça uma mudança no código
2. Commit e push para a branch main
3. Verifique os logs do servidor
4. Confirme que o site foi atualizado

## 5. Monitoramento

### Verificar logs do auto-deploy:

```bash
# Logs do container
docker logs siqueira-campos-app

# Logs do auto-deploy
docker exec siqueira-campos-app tail -f /var/log/auto-deploy.log

# Status dos processos
docker exec siqueira-campos-app supervisorctl status
```

### Verificar saúde da aplicação:

```bash
curl https://seu-dominio.com.br/api/ping
```

## 6. Resolução de Problemas

### Webhook não está sendo chamado:

- Verifique se a URL do webhook está correta
- Teste a conectividade: `curl https://seu-dominio.com.br/api/ping`
- Verifique os logs do GitHub (aba Recent Deliveries no webhook)

### Erro de autenticação:

- Verifique se a `GITHUB_WEBHOOK_SECRET` está configurada corretamente
- Confirme que a senha no GitHub e no servidor são idênticas

### Deploy falhando:

- Verifique os logs: `docker logs siqueira-campos-app`
- Acesse o container: `docker exec -it siqueira-campos-app bash`
- Execute o script manualmente: `./scripts/auto-deploy.sh`

### Site não atualiza:

- Verifique se o build foi executado: `ls -la dist/`
- Reinicie o container: `docker restart siqueira-campos-app`
- Verifique se o supervisor está funcionando: `docker exec siqueira-campos-app supervisorctl status`

## 7. Segurança

- ✅ Use HTTPS para o webhook
- ✅ Configure uma senha forte para o webhook
- ✅ Execute a aplicação como usuário não-root
- ✅ Mantenha os logs para auditoria
- ✅ Use o healthcheck para monitoramento

## 8. Backup Automático

Antes de cada deploy, o sistema cria automaticamente um backup da versão anterior:

```bash
# Listar backups
docker images | grep backup

# Restaurar backup se necessário
docker tag siqueira-campos:backup-20231215-143022 siqueira-campos:latest
docker restart siqueira-campos-app
```

---

## Status do Sistema

Após configurar tudo, seu workflow será:

1. 🔧 **Você faz mudanças no código**
2. 📤 **Git push para a branch main**
3. 📡 **GitHub envia webhook para seu servidor**
4. 🔐 **Servidor valida a autenticidade**
5. 📥 **Faz pull das mudanças**
6. 📦 **Instala dependências**
7. 🏗️ **Executa o build**
8. 🧪 **Roda testes básicos**
9. 🔄 **Reinicia a aplicação**
10. ✅ **Site atualizado automaticamente!**

**Tempo estimado do deploy**: 1-3 minutos
