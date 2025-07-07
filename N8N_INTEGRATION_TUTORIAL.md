# Tutorial Completo de Integração N8N - Sistema Imobiliário Siqueira Campos

## Visão Geral

Este tutorial explica como configurar integrações N8N para automatizar processos no sistema imobiliário, incluindo WhatsApp, Meta (Facebook/Instagram), Google Calendar e automações de marketing.

## Pré-requisitos

### 1. Conta N8N

- Criar conta em https://n8n.io/
- Plano Business recomendado para produção
- Instalar N8N local ou usar cloud

### 2. APIs Necessárias

- Meta Business API (Facebook/Instagram)
- WhatsApp Business API (Evolution API)
- Google Calendar API
- OpenAI API (opcional para IA)

## Configuração Inicial N8N

### 1. Instalar N8N (Local)

```bash
# Via npm
npm install n8n -g

# Via Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Configurar Variáveis de Ambiente

```bash
# .env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=suasenha123
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://seudominio.com
```

## Integração 1: WhatsApp Business (R$ 197,00/mês)

### Fluxo: Auto-resposta de Leads

1. **Trigger Webhook**: Receber lead do site
2. **Function**: Processar dados do lead
3. **WhatsApp API**: Enviar mensagem automática
4. **Google Sheets**: Salvar lead
5. **Delay**: Aguardar 15 minutos
6. **Condition**: Verificar se foi respondido
7. **WhatsApp API**: Notificar corretor se não respondido

```json
{
  "meta": {
    "instanceName": "Workflow Template"
  },
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "lead-whatsapp",
        "options": {}
      },
      "id": "webhook-lead",
      "name": "Webhook Lead",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [200, 300]
    },
    {
      "parameters": {
        "functionCode": "// Processar dados do lead\nconst lead = items[0].json;\n\n// Formatar mensagem automática\nconst mensagem = `Olá ${lead.nome}! 👋\n\nRecebemos seu interesse pelo imóvel: ${lead.imovel}\n\nEm breve um de nossos corretores entrará em contato.\n\n📱 Siqueira Campos Imóveis\n📞 (62) 3251-5505`;\n\nreturn [{\n  json: {\n    ...lead,\n    mensagem_automatica: mensagem,\n    telefone_formatado: lead.telefone.replace(/\\D/g, '')\n  }\n}];"
      },
      "id": "processar-lead",
      "name": "Processar Lead",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [400, 300]
    },
    {
      "parameters": {
        "url": "https://api.evolutionapi.com/message/sendText/instance1",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "{\n  \"number\": \"{{$json.telefone_formatado}}\",\n  \"text\": \"{{$json.mensagem_automatica}}\"\n}",
        "options": {
          "headers": {
            "apikey": "SUA_API_KEY_EVOLUTION"
          }
        }
      },
      "id": "enviar-whatsapp",
      "name": "Enviar WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [600, 300]
    },
    {
      "parameters": {
        "unit": "minutes",
        "value": 15
      },
      "id": "aguardar-15min",
      "name": "Aguardar 15min",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1,
      "position": [800, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.status_resposta}}",
              "operation": "notEqual",
              "value2": "respondido"
            }
          ]
        }
      },
      "id": "verificar-resposta",
      "name": "Verificar Resposta",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1000, 300]
    }
  ],
  "connections": {
    "Webhook Lead": {
      "main": [
        [
          {
            "node": "Processar Lead",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Processar Lead": {
      "main": [
        [
          {
            "node": "Enviar WhatsApp",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enviar WhatsApp": {
      "main": [
        [
          {
            "node": "Aguardar 15min",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Aguardar 15min": {
      "main": [
        [
          {
            "node": "Verificar Resposta",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Integração 2: Meta Business (R$ 197,00/mês)

### Fluxo: Auto-post de Imóveis

1. **Trigger Webhook**: Receber dados do imóvel criado
2. **Function**: Gerar conteúdo do post
3. **Meta API**: Publicar no Instagram
4. **Meta API**: Publicar no Facebook
5. **Database**: Registrar publicação

```json
{
  "meta": {
    "instanceName": "Auto Post Imoveis"
  },
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "novo-imovel",
        "options": {}
      },
      "id": "webhook-imovel",
      "name": "Webhook Novo Imóvel",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [200, 300]
    },
    {
      "parameters": {
        "functionCode": "// Gerar conteúdo para redes sociais\nconst imovel = items[0].json;\n\n// Gerar descrição automática\nconst descricao = `🏠 ${imovel.titulo}\n\n📍 ${imovel.endereco}, ${imovel.bairro}\n🛏️ ${imovel.quartos} quartos | 🚿 ${imovel.banheiros} banheiros\n🚗 ${imovel.vagas} vagas\n\n💰 ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.preco)}\n\n📞 Entre em contato conosco!\n📱 WhatsApp: (62) 9 8556-3505\n\n#imoveis #goiania #venda #aluguel #siqueiracampos #${imovel.bairro.toLowerCase().replace(/\\s+/g, '')}`;\n\nreturn [{\n  json: {\n    ...imovel,\n    post_content: descricao,\n    hashtags: `#imoveis #goiania #${imovel.tipo.toLowerCase()} #${imovel.finalidade.toLowerCase()} #siqueiracampos`,\n    image_url: imovel.fotos[0] || 'https://via.placeholder.com/800x600'\n  }\n}];"
      },
      "id": "gerar-conteudo",
      "name": "Gerar Conteúdo",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [400, 300]
    },
    {
      "parameters": {
        "url": "https://graph.facebook.com/v18.0/{{$json.instagram_account_id}}/media",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "{\n  \"image_url\": \"{{$json.image_url}}\",\n  \"caption\": \"{{$json.post_content}}\",\n  \"access_token\": \"{{$json.instagram_access_token}}\"\n}",
        "options": {}
      },
      "id": "post-instagram",
      "name": "Post Instagram",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [600, 250]
    },
    {
      "parameters": {
        "url": "https://graph.facebook.com/v18.0/{{$json.facebook_page_id}}/photos",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "{\n  \"url\": \"{{$json.image_url}}\",\n  \"caption\": \"{{$json.post_content}}\",\n  \"access_token\": \"{{$json.facebook_access_token}}\"\n}",
        "options": {}
      },
      "id": "post-facebook",
      "name": "Post Facebook",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [600, 350]
    }
  ],
  "connections": {
    "Webhook Novo Imóvel": {
      "main": [
        [
          {
            "node": "Gerar Conteúdo",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Gerar Conteúdo": {
      "main": [
        [
          {
            "node": "Post Instagram",
            "type": "main",
            "index": 0
          },
          {
            "node": "Post Facebook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Integração 3: Google Calendar (R$ 97,00/mês)

### Fluxo: Agendamento Automático

1. **Trigger Webhook**: Receber solicitação de agendamento
2. **Google Calendar**: Verificar disponibilidade
3. **Condition**: Verificar se horário está livre
4. **Google Calendar**: Criar evento
5. **Email**: Enviar confirmação
6. **WhatsApp**: Enviar lembrete

```json
{
  "meta": {
    "instanceName": "Agendamento Automatico"
  },
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "agendar-visita",
        "options": {}
      },
      "id": "webhook-agendamento",
      "name": "Webhook Agendamento",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [200, 300]
    },
    {
      "parameters": {
        "operation": "getAll",
        "calendarId": "primary",
        "options": {
          "timeMin": "={{$json.data_inicio}}",
          "timeMax": "={{$json.data_fim}}"
        }
      },
      "id": "verificar-calendario",
      "name": "Verificar Calendário",
      "type": "n8n-nodes-base.googleCalendar",
      "typeVersion": 1,
      "position": [400, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.length}}",
              "operation": "equal",
              "value2": 0
            }
          ]
        }
      },
      "id": "horario-livre",
      "name": "Horário Livre?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [600, 300]
    },
    {
      "parameters": {
        "operation": "create",
        "calendarId": "primary",
        "summary": "Visita Imóvel - {{$json.cliente_nome}}",
        "start": {
          "dateTime": "={{$json.data_agendamento}}"
        },
        "end": {
          "dateTime": "={{$json.data_fim}}"
        },
        "description": "Visita ao imóvel: {{$json.imovel_titulo}}\\nCliente: {{$json.cliente_nome}}\\nTelefone: {{$json.cliente_telefone}}",
        "attendees": [
          {
            "email": "{{$json.cliente_email}}"
          }
        ]
      },
      "id": "criar-evento",
      "name": "Criar Evento",
      "type": "n8n-nodes-base.googleCalendar",
      "typeVersion": 1,
      "position": [800, 250]
    }
  ],
  "connections": {
    "Webhook Agendamento": {
      "main": [
        [
          {
            "node": "Verificar Calendário",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Verificar Calendário": {
      "main": [
        [
          {
            "node": "Horário Livre?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Horário Livre?": {
      "main": [
        [
          {
            "node": "Criar Evento",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Configuração das APIs

### 1. Meta Business API

```javascript
// Configuração no N8N
const metaConfig = {
  app_id: "SEU_APP_ID",
  app_secret: "SEU_APP_SECRET",
  access_token: "SEU_ACCESS_TOKEN",
  page_id: "SEU_PAGE_ID",
  instagram_account_id: "SEU_INSTAGRAM_ID",
};

// Função para obter token de longa duração
const getLongLivedToken = async () => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${metaConfig.app_id}&client_secret=${metaConfig.app_secret}&fb_exchange_token=${metaConfig.access_token}`,
  );
  return response.json();
};
```

### 2. WhatsApp Business API (Evolution)

```bash
# Instalar Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
npm install
npm run build

# Configurar .env
DATABASE_URL="postgresql://user:pass@localhost:5432/evolution"
JWT_SECRET="your-jwt-secret"
API_KEY="your-api-key"
```

### 3. Google Calendar API

```javascript
// Configuração OAuth2
const googleConfig = {
  client_id: "SEU_CLIENT_ID",
  client_secret: "SEU_CLIENT_SECRET",
  redirect_uri: "https://seudominio.com/oauth/callback",
  scope: "https://www.googleapis.com/auth/calendar",
};
```

## Webhooks do Sistema

### 1. Webhook para Novo Lead

```javascript
// No seu sistema React/Express
const enviarLeadParaN8N = async (leadData) => {
  try {
    await fetch("https://seudominio-n8n.com/webhook/lead-whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: leadData.nome,
        telefone: leadData.telefone,
        email: leadData.email,
        mensagem: leadData.mensagem,
        imovel: leadData.imovel_titulo,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Erro ao enviar lead para N8N:", error);
  }
};
```

### 2. Webhook para Novo Imóvel

```javascript
// Atualizar CorretorDashboard para incluir auto-post
import { createAutoPost } from "@/components/MetaIntegration";

const handleCriarImovel = async (imovelData) => {
  try {
    // Salvar imóvel no banco
    const imovel = await salvarImovel(imovelData);

    // Verificar se auto-post está ativo
    const metaActive = localStorage.getItem("metaIntegrationActive") === "true";

    if (metaActive) {
      // Enviar para N8N
      await fetch("https://seudominio-n8n.com/webhook/novo-imovel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imovel),
      });

      // Feedback para usuário
      toast({
        title: "Sucesso!",
        description:
          "Imóvel criado e publicado automaticamente nas redes sociais!",
      });
    }
  } catch (error) {
    console.error("Erro:", error);
  }
};
```

### 3. Webhook para Agendamento

```javascript
const agendarVisitaAutomatica = async (agendamentoData) => {
  try {
    const response = await fetch(
      "https://seudominio-n8n.com/webhook/agendar-visita",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente_nome: agendamentoData.clienteNome,
          cliente_telefone: agendamentoData.clienteTelefone,
          cliente_email: agendamentoData.clienteEmail,
          imovel_titulo: agendamentoData.imovelTitulo,
          data_agendamento: agendamentoData.dataHora,
          data_fim: new Date(
            agendamentoData.dataHora.getTime() + 60 * 60 * 1000,
          ), // +1 hora
          corretor_email: agendamentoData.corretorEmail,
        }),
      },
    );

    return response.json();
  } catch (error) {
    console.error("Erro ao agendar visita:", error);
  }
};
```

## Monitoramento e Logs

### 1. Dashboard de Monitoramento N8N

```javascript
// Função para verificar status dos workflows
const verificarStatusWorkflows = async () => {
  try {
    const response = await fetch(
      "https://seudominio-n8n.com/api/v1/workflows",
      {
        headers: {
          Authorization: "Bearer SEU_TOKEN_N8N",
        },
      },
    );

    const workflows = await response.json();

    return workflows.map((workflow) => ({
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      lastExecution: workflow.lastExecution,
      status: workflow.status,
    }));
  } catch (error) {
    console.error("Erro ao verificar workflows:", error);
    return [];
  }
};
```

### 2. Logs de Execução

```javascript
// No DesenvolvedorDashboard, adicionar seção de logs N8N
const carregarLogsN8N = async () => {
  try {
    const response = await fetch(
      "https://seudominio-n8n.com/api/v1/executions",
      {
        headers: {
          Authorization: "Bearer SEU_TOKEN_N8N",
        },
      },
    );

    return response.json();
  } catch (error) {
    console.error("Erro ao carregar logs:", error);
    return [];
  }
};
```

## Custos e Planos

### Resumo de Custos Mensais:

1. **WhatsApp Business Integration**: R$ 197,00/mês

   - Evolution API hosting
   - Automação de leads
   - N8N workflows

2. **Meta Business Integration**: R$ 197,00/mês

   - Facebook/Instagram API
   - Auto-posting
   - Analytics avançadas

3. **Google Calendar Integration**: R$ 97,00/mês

   - Google Calendar API
   - Agendamento automático
   - Notificações

4. **N8N Premium Workflows**: R$ 297,00/mês
   - Workflows ilimitados
   - Backup automático
   - Suporte premium

**Total Máximo**: R$ 788,00/mês (todos os serviços)

## Implementação no Sistema

### 1. Atualizar createAutoPost no MetaIntegration

```javascript
// client/components/MetaIntegration.tsx - já implementado
export const createAutoPost = async (propertyData) => {
  // Enviar para N8N webhook
  const response = await fetch(
    "https://seudominio-n8n.com/webhook/novo-imovel",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(propertyData),
    },
  );

  return response.json();
};
```

### 2. Atualizar CorretorDashboard

```javascript
// Incluir no handleSubmit do formulário de criação de imóvel
if (metaIntegrationActive) {
  const autoPostResult = await createAutoPost(imovelData);
  if (autoPostResult.success) {
    toast({
      title: "Sucesso!",
      description: "Imóvel criado e publicado automaticamente!",
    });
  }
}
```

## Segurança

### 1. Autenticação N8N

```bash
# Configurar autenticação básica
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=senha-super-segura

# Configurar HTTPS
N8N_PROTOCOL=https
N8N_SSL_KEY=/path/to/private.key
N8N_SSL_CERT=/path/to/certificate.crt
```

### 2. Rate Limiting

```javascript
// Implementar rate limiting nos webhooks
const rateLimiter = {
  whatsapp: new Map(),
  meta: new Map(),
  calendar: new Map(),
};

const checkRateLimit = (type, identifier) => {
  const now = Date.now();
  const requests = rateLimiter[type].get(identifier) || [];

  // Limpar requests antigos (últimos 5 minutos)
  const recent = requests.filter((time) => now - time < 5 * 60 * 1000);

  if (recent.length >= 10) {
    // Máximo 10 requests por 5 minutos
    return false;
  }

  recent.push(now);
  rateLimiter[type].set(identifier, recent);
  return true;
};
```

## Conclusão

Este tutorial fornece uma base completa para implementar todas as integrações N8N no sistema imobiliário. As automações melhoram significativamente a eficiência operacional e a experiência do cliente.

### Próximos Passos:

1. Configurar ambiente N8N
2. Implementar webhooks no sistema
3. Configurar APIs (Meta, WhatsApp, Google)
4. Testar workflows
5. Implementar monitoramento
6. Ativar serviços premium no dashboard

### Suporte:

Para implementação ou dúvidas técnicas, entre em contato:

- **Email**: dev@siqueiracamposimoveis.com.br
- **WhatsApp**: (62) 9 8556-3505
- **Documentação**: https://docs.siqueiracamposimoveis.com.br
