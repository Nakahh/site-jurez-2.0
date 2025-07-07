import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  Video,
  FileText,
  Users,
  Home,
  Settings,
  Shield,
  Zap,
  Calendar,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SharedNavigation } from "@/components/SharedNavigation";

interface HelpSection {
  id: string;
  title: string;
  icon: any;
  description: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
}

export default function Help() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("geral");

  const helpSections: HelpSection[] = [
    {
      id: "geral",
      title: "Guia Geral",
      icon: BookOpen,
      description: "Informações básicas sobre o sistema",
      articles: [
        {
          id: "getting-started",
          title: "Como começar a usar o sistema",
          summary: "Primeiros passos para usar a plataforma eficientemente",
          content: `
            # Como começar a usar o sistema

            Bem-vindo ao sistema da Siqueira Campos Imóveis! Este guia vai te ajudar a começar.

            ## Fazendo Login
            1. Acesse a página de login
            2. Digite suas credenciais
            3. Escolha seu perfil (Administrador, Corretor, Cliente, etc.)

            ## Navegação
            - Use o menu superior para acessar as páginas principais
            - O dashboard é sua página inicial personalizada
            - Use o botão "📊" no menu para acessar diferentes dashboards

            ## Dicas Importantes
            - Mantenha seus dados sempre atualizados
            - Use os filtros para encontrar informações rapidamente
            - Entre em contato conosco se precisar de ajuda
          `,
          tags: ["início", "login", "navegação"],
        },
        {
          id: "navigation",
          title: "Navegação pelo sistema",
          summary: "Como se mover entre as diferentes seções",
          content: `
            # Navegação pelo Sistema

            ## Menu Principal
            O menu superior contém todas as páginas principais:
            - **Início**: Página inicial com destaques
            - **Imóveis**: Busca e visualização de propriedades
            - **Blog**: Artigos e notícias do mercado
            - **Comparador**: Compare até 4 imóveis
            - **Simulador**: Calcule financiamentos
            - **Contato**: Fale conosco

            ## Dashboards
            Cada tipo de usuário tem seu dashboard específico:
            - **Admin**: Gestão completa do sistema
            - **Corretor**: Leads, imóveis e vendas
            - **Marketing**: Campanhas e análises
            - **Cliente**: Favoritos e agendamentos
            - **Assistente**: Atendimento e suporte
            - **Desenvolvedor**: Sistema e monitoramento

            ## Ações Rápidas
            Cada dashboard possui ações rápidas para tarefas comuns.
          `,
          tags: ["navegação", "menu", "dashboard"],
        },
      ],
    },
    {
      id: "imoveis",
      title: "Imóveis",
      icon: Home,
      description: "Como gerenciar e buscar imóveis",
      articles: [
        {
          id: "search-properties",
          title: "Como buscar imóveis",
          summary: "Use filtros avançados para encontrar o imóvel ideal",
          content: `
            # Como Buscar Imóveis

            ## Busca Simples
            1. Acesse a página "Imóveis"
            2. Digite uma palavra-chave na barra de busca
            3. Pressione Enter ou clique em buscar

            ## Filtros Avançados
            Use os filtros para refinar sua busca:
            - **Tipo**: Apartamento, Casa, Terreno, etc.
            - **Finalidade**: Venda, Aluguel ou Ambos
            - **Faixa de Preço**: Defina valores mínimo e máximo
            - **Quartos**: Número de quartos desejado
            - **Bairro**: Escolha a região preferida
            - **Área**: Tamanho em metros quadrados

            ## Dicas de Busca
            - Use palavras-chave específicas
            - Combine múltiplos filtros
            - Salve suas buscas frequentes
            - Ative alertas para novos imóveis
          `,
          tags: ["busca", "filtros", "imóveis"],
        },
        {
          id: "property-details",
          title: "Detalhes do imóvel",
          summary: "Como visualizar e interpretar informações dos imóveis",
          content: `
            # Detalhes do Imóvel

            ## Informações Básicas
            - **Preço**: Valor de venda ou aluguel
            - **Área**: Tamanho em m²
            - **Quartos/Banheiros**: Distribuição dos cômodos
            - **Vagas**: Número de vagas na garagem

            ## Localização
            - **Endereço completo**
            - **Bairro e cidade**
            - **Mapa interativo**
            - **Pontos de interesse próximos**

            ## Fotos e Virtual Tour
            - Galeria de fotos em alta resolução
            - Tour virtual 360° (quando disponível)
            - Plantas baixas
            - Vídeos promocionais

            ## Ações Disponíveis
            - **Favoritar**: Salve imóveis de interesse
            - **Compartilhar**: Envie por WhatsApp, email ou redes sociais
            - **Agendar Visita**: Marque uma visita presencial
            - **Contatar Corretor**: Fale diretamente com o responsável
          `,
          tags: ["detalhes", "fotos", "visita"],
        },
      ],
    },
    {
      id: "usuarios",
      title: "Usuários",
      icon: Users,
      description: "Gerenciamento de contas e perfis",
      articles: [
        {
          id: "user-roles",
          title: "Tipos de usuário",
          summary: "Entenda os diferentes perfis e permissões",
          content: `
            # Tipos de Usuário

            ## Administrador
            - Acesso completo ao sistema
            - Gerencia usuários, imóveis e configurações
            - Visualiza relatórios e estatísticas
            - Controla integrações e backup

            ## Corretor
            - Gerencia seus imóveis e leads
            - Agenda visitas e follow-ups
            - Acessa relatórios de vendas
            - Integração com WhatsApp

            ## Marketing
            - Cria e gerencia campanhas
            - Produz conteúdo para redes sociais
            - Analisa métricas de engajamento
            - Gerencia blog e SEO

            ## Cliente
            - Busca e favorita imóveis
            - Agenda visitas
            - Salva buscas personalizadas
            - Recebe alertas de novos imóveis

            ## Assistente
            - Atende leads e clientes
            - Agenda visitas para corretores
            - Gerencia tarefas e follow-ups
            - Produz relatórios de atendimento

            ## Desenvolvedor
            - Monitora sistema e performance
            - Gerencia integrações técnicas
            - Controla backup e segurança
            - Analisa logs e erros
          `,
          tags: ["usuários", "perfis", "permissões"],
        },
      ],
    },
    {
      id: "dashboard",
      title: "Dashboard",
      icon: BarChart3,
      description: "Como usar os painéis de controle",
      articles: [
        {
          id: "dashboard-overview",
          title: "Visão geral do dashboard",
          summary: "Entenda as métricas e indicadores principais",
          content: `
            # Dashboard - Visão Geral

            ## Métricas Principais
            Cada dashboard mostra indicadores importantes:
            - **Números totais**: Quantidade de itens (imóveis, leads, etc.)
            - **Tendências**: Crescimento ou queda percentual
            - **Metas**: Progresso em relação aos objetivos
            - **Performance**: Indicadores de eficiência

            ## Ações Rápidas
            Botões de acesso rápido para tarefas comuns:
            - Criar novos itens
            - Acessar seções específicas
            - Gerar relatórios
            - Abrir ferramentas externas

            ## Personalização
            - Filtros por período
            - Ordenação de dados
            - Exportação de relatórios
            - Configurações personalizadas

            ## Dicas de Uso
            - Atualize regularmente os dados
            - Use os filtros para análises específicas
            - Exporte relatórios para análises externas
            - Configure alertas para métricas importantes
          `,
          tags: ["dashboard", "métricas", "relatórios"],
        },
      ],
    },
    {
      id: "integracoes",
      title: "Integrações",
      icon: Zap,
      description: "WhatsApp, Google Calendar e outras ferramentas",
      articles: [
        {
          id: "whatsapp-integration",
          title: "Integração com WhatsApp",
          summary: "Configure e use o WhatsApp Business",
          content: `
            # Integração com WhatsApp

            ## Configuração Inicial
            1. Acesse seu dashboard
            2. Vá para a seção de configurações
            3. Configure seu número do WhatsApp Business
            4. Ative as notificações automáticas

            ## Recursos Disponíveis
            - **Contato direto**: Clique para falar com leads
            - **Mensagens pré-definidas**: Templates prontos
            - **Envio em massa**: Para múltiplos contatos
            - **Integração com leads**: Resposta automática

            ## Dicas de Uso
            - Mantenha mensagens profissionais
            - Responda rapidamente aos contatos
            - Use templates para agilizar atendimento
            - Configure horário de funcionamento

            ## Problemas Comuns
            - **Número não reconhecido**: Verifique o formato
            - **Mensagens não enviando**: Confirme conexão
            - **Templates não carregando**: Atualize a página
          `,
          tags: ["whatsapp", "integração", "mensagens"],
        },
        {
          id: "calendar-integration",
          title: "Google Calendar",
          summary: "Sincronize agendamentos com o Google Calendar",
          content: `
            # Integração com Google Calendar

            ## Configuração
            1. Acesse as configurações do seu dashboard
            2. Clique em "Conectar Google Calendar"
            3. Autorize o acesso à sua conta Google
            4. Configure as preferências de sincronização

            ## Funcionalidades
            - **Sincronização automática**: Agendamentos aparecem no Google
            - **Lembretes**: Notificações antes das visitas
            - **Convites**: Envio automático para clientes
            - **Disponibilidade**: Controle de horários livres

            ## Benefícios
            - Organização centralizada
            - Acesso em qualquer dispositivo
            - Compartilhamento com equipe
            - Backup automático de agendamentos
          `,
          tags: ["calendar", "google", "agendamentos"],
        },
      ],
    },
    {
      id: "suporte",
      title: "Suporte",
      icon: HelpCircle,
      description: "Como obter ajuda e suporte técnico",
      articles: [
        {
          id: "contact-support",
          title: "Como entrar em contato",
          summary: "Canais disponíveis para suporte e dúvidas",
          content: `
            # Como Entrar em Contato

            ## Canais de Suporte

            ### WhatsApp
            - **Número**: (62) 9 8556-3505
            - **Horário**: Segunda a Sexta, 8h às 18h
            - **Para**: Dúvidas rápidas e suporte imediato

            ### Email
            - **Endereço**: suporte@siqueiracamposimoveis.com.br
            - **Resposta**: Até 24 horas úteis
            - **Para**: Solicitações detalhadas e documentação

            ### Telefone
            - **Número**: (62) 3251-5505
            - **Horário**: Segunda a Sexta, 8h às 18h
            - **Para**: Suporte telefônico e emergências

            ## Informações para Incluir
            Ao entrar em contato, forneça:
            - Seu nome e tipo de usuário
            - Descrição detalhada do problema
            - Passos que levaram ao erro
            - Screenshots (se aplicável)
            - Navegador e dispositivo usado

            ## Tipos de Suporte
            - **Técnico**: Problemas no sistema
            - **Funcional**: Dúvidas sobre uso
            - **Comercial**: Informações sobre planos
            - **Treinamento**: Capacitação de equipe
          `,
          tags: ["suporte", "contato", "ajuda"],
        },
      ],
    },
  ];

  const filteredSections = helpSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.articles.some(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      ),
  );

  const activeHelpSection = helpSections.find(
    (section) => section.id === activeSection,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SharedNavigation showBackButton />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Central de Ajuda
            </h1>
            <p className="text-muted-foreground">
              Encontre respostas para suas dúvidas sobre o sistema
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar artigos de ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon className="w-4 h-4 mr-2" />
                    {section.title}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open("https://wa.me/5562985563505", "_blank")
                  }
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => (window.location.href = "tel:6232515505")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Telefone
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    (window.location.href =
                      "mailto:suporte@siqueiracamposimoveis.com.br")
                  }
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeHelpSection && (
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <activeHelpSection.icon className="w-6 h-6 mr-3" />
                      {activeHelpSection.title}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {activeHelpSection.description}
                    </p>
                  </CardHeader>
                </Card>

                {/* Articles */}
                <div className="space-y-4">
                  {activeHelpSection.articles.map((article) => (
                    <Card key={article.id}>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {article.title}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          {article.summary}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans">
                            {article.content}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
