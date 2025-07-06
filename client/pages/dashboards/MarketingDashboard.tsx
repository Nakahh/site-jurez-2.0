import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Mail,
  Share2,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Megaphone,
  MessageSquare,
  Instagram,
  Facebook,
  Globe,
  Search,
  Calendar,
  DollarSign,
  Settings,
  Bell,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Camera,
  Video,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ThumbsUp,
  Heart,
  Filter,
} from "lucide-react";

// Types
interface Campanha {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  orcamento: number;
  gastoAtual: number;
  alcance: number;
  cliques: number;
  conversoes: number;
  ctr: number;
  cpc: number;
  roas: number;
  dataInicio: Date;
  dataFim: Date;
  plataforma: string;
  objetivo: string;
}

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  origem: string;
  campanha?: string;
  status: string;
  valorPotencial: number;
  criadoEm: Date;
}

interface ConteudoSocial {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  plataforma: string[];
  status: string;
  agendamento?: Date;
  engajamento: {
    curtidas: number;
    comentarios: number;
    compartilhamentos: number;
    salvamentos: number;
  };
  alcance: number;
  impressoes: number;
  criadoEm: Date;
}

interface MetricasMarketing {
  visitasWebsite: number;
  leadsGerados: number;
  taxaConversao: number;
  custoLead: number;
  roas: number;
  alcanceTotal: number;
  engajamentoTotal: number;
  seguidoresGanhos: number;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = "primary",
  trend,
  percentage,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  color?: string;
  trend?: string;
  percentage?: number;
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div
            className={`h-12 w-12 bg-${color}/10 rounded-full flex items-center justify-center`}
          >
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
        {(trend || percentage !== undefined) && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            {trend && (
              <div className="flex items-center">
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${
                    percentage && percentage > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    percentage && percentage > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {trend}
                </span>
              </div>
            )}
            {percentage !== undefined && (
              <span
                className={`text-sm font-bold ${
                  percentage > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {percentage > 0 ? "+" : ""}
                {percentage}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MarketingDashboard() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conteudos, setConteudos] = useState<ConteudoSocial[]>([]);
  const [metricas, setMetricas] = useState<MetricasMarketing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Dados simulados ultra-robustos
      const campanhasSimuladas: Campanha[] = [
        {
          id: "1",
          nome: "Lançamento Residencial Bueno Park",
          tipo: "PAID_SOCIAL",
          status: "ATIVA",
          orcamento: 15000,
          gastoAtual: 8750,
          alcance: 45000,
          cliques: 1250,
          conversoes: 23,
          ctr: 2.78,
          cpc: 7.0,
          roas: 4.2,
          dataInicio: new Date("2025-01-01"),
          dataFim: new Date("2025-01-31"),
          plataforma: "Facebook + Instagram",
          objetivo: "Geração de Leads",
        },
        {
          id: "2",
          nome: "Google Ads - Apartamentos Goiânia",
          tipo: "SEARCH",
          status: "ATIVA",
          orcamento: 10000,
          gastoAtual: 6200,
          alcance: 28000,
          cliques: 890,
          conversoes: 31,
          ctr: 3.18,
          cpc: 6.97,
          roas: 5.1,
          dataInicio: new Date("2024-12-15"),
          dataFim: new Date("2025-02-15"),
          plataforma: "Google Ads",
          objetivo: "Vendas",
        },
        {
          id: "3",
          nome: "Retargeting - Visitantes Website",
          tipo: "DISPLAY",
          status: "PAUSADA",
          orcamento: 5000,
          gastoAtual: 3400,
          alcance: 12500,
          cliques: 450,
          conversoes: 8,
          ctr: 3.6,
          cpc: 7.56,
          roas: 2.8,
          dataInicio: new Date("2024-12-01"),
          dataFim: new Date("2025-01-15"),
          plataforma: "Google Display",
          objetivo: "Conversão",
        },
      ];

      const leadsSimulados: Lead[] = [
        {
          id: "1",
          nome: "Maria Silva",
          telefone: "(62) 9 8888-7777",
          email: "maria@email.com",
          origem: "Facebook Ads",
          campanha: "Lançamento Residencial Bueno Park",
          status: "QUALIFICADO",
          valorPotencial: 650000,
          criadoEm: new Date("2025-01-06T14:30:00"),
        },
        {
          id: "2",
          nome: "João Santos",
          telefone: "(62) 9 7777-6666",
          email: "joao@email.com",
          origem: "Google Ads",
          campanha: "Google Ads - Apartamentos Goiânia",
          status: "NOVO",
          valorPotencial: 450000,
          criadoEm: new Date("2025-01-06T10:15:00"),
        },
        {
          id: "3",
          nome: "Ana Costa",
          telefone: "(62) 9 6666-5555",
          origem: "Instagram",
          campanha: "Lançamento Residencial Bueno Park",
          status: "CONVERTIDO",
          valorPotencial: 380000,
          criadoEm: new Date("2025-01-05T16:45:00"),
        },
      ];

      const conteudosSimulados: ConteudoSocial[] = [
        {
          id: "1",
          tipo: "POST_IMAGEM",
          titulo: "Apartamento dos Sonhos no Setor Bueno",
          descricao:
            "Conheça nosso novo lançamento com vista panorâmica e acabamento de luxo! 🏢✨",
          plataforma: ["Instagram", "Facebook"],
          status: "PUBLICADO",
          engajamento: {
            curtidas: 245,
            comentarios: 18,
            compartilhamentos: 12,
            salvamentos: 34,
          },
          alcance: 8500,
          impressoes: 12400,
          criadoEm: new Date("2025-01-05T09:00:00"),
        },
        {
          id: "2",
          tipo: "VIDEO",
          titulo: "Tour Virtual - Casa Jardim Goiás",
          descricao:
            "Faça um tour virtual pela nossa casa modelo e apaixone-se! 🏠💕",
          plataforma: ["Instagram", "YouTube"],
          status: "AGENDADO",
          agendamento: new Date("2025-01-08T18:00:00"),
          engajamento: {
            curtidas: 0,
            comentarios: 0,
            compartilhamentos: 0,
            salvamentos: 0,
          },
          alcance: 0,
          impressoes: 0,
          criadoEm: new Date("2025-01-06T15:30:00"),
        },
        {
          id: "3",
          tipo: "STORIES",
          titulo: "Dica de Financiamento",
          descricao: "Saiba como conseguir o melhor financiamento imobiliário",
          plataforma: ["Instagram"],
          status: "RASCUNHO",
          engajamento: {
            curtidas: 0,
            comentarios: 0,
            compartilhamentos: 0,
            salvamentos: 0,
          },
          alcance: 0,
          impressoes: 0,
          criadoEm: new Date("2025-01-06T11:20:00"),
        },
      ];

      const metricasSimuladas: MetricasMarketing = {
        visitasWebsite: 15420,
        leadsGerados: 89,
        taxaConversao: 5.77,
        custoLead: 152.3,
        roas: 4.1,
        alcanceTotal: 85500,
        engajamentoTotal: 1890,
        seguidoresGanhos: 234,
      };

      setCampanhas(campanhasSimuladas);
      setLeads(leadsSimulados);
      setConteudos(conteudosSimulados);
      setMetricas(metricasSimuladas);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const formatarNumero = (numero: number) => {
    return new Intl.NumberFormat("pt-BR").format(numero);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard de Marketing
            </h1>
            <p className="text-muted-foreground">
              Controle total das campanhas, leads e performance de marketing
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Alertas
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=250"
              alt="Siqueira Campos Imóveis"
              className="h-14 w-auto dark:hidden"
            />
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=250"
              alt="Siqueira Campos Imóveis"
              className="hidden h-14 w-auto dark:block"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="configuracoes">Config</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* ROI Alert */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      🎯 Performance Excepcional!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      ROAS médio de 4.1x - 310% acima da meta do setor
                      imobiliário
                    </p>
                    <div className="flex items-center space-x-4">
                      <Button>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar Report
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-green-600">4.1x</p>
                    <p className="text-sm text-muted-foreground">ROAS Médio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas Principais */}
            {metricas && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Visitas Website"
                  value={formatarNumero(metricas.visitasWebsite)}
                  icon={Eye}
                  description="Este mês"
                  color="blue"
                  trend="+23% vs mês anterior"
                  percentage={23}
                />
                <StatsCard
                  title="Leads Gerados"
                  value={metricas.leadsGerados}
                  icon={Users}
                  description={`Taxa: ${metricas.taxaConversao}%`}
                  color="green"
                  trend="+18% vs mês anterior"
                  percentage={18}
                />
                <StatsCard
                  title="Custo por Lead"
                  value={formatarMoeda(metricas.custoLead)}
                  icon={DollarSign}
                  description="Média das campanhas"
                  color="yellow"
                  trend="-12% vs mês anterior"
                  percentage={-12}
                />
                <StatsCard
                  title="ROAS"
                  value={`${metricas.roas}x`}
                  icon={TrendingUp}
                  description="Return on Ad Spend"
                  color="purple"
                  trend="+15% vs mês anterior"
                  percentage={15}
                />
              </div>
            )}

            {/* Performance por Canal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        canal: "Google Ads",
                        leads: 31,
                        custo: 216,
                        roas: 5.1,
                        cor: "bg-blue-500",
                      },
                      {
                        canal: "Facebook + Instagram",
                        leads: 23,
                        custo: 380,
                        roas: 4.2,
                        cor: "bg-purple-500",
                      },
                      {
                        canal: "Google Display",
                        leads: 8,
                        custo: 425,
                        roas: 2.8,
                        cor: "bg-green-500",
                      },
                      {
                        canal: "WhatsApp Business",
                        leads: 27,
                        custo: 45,
                        roas: 8.9,
                        cor: "bg-green-600",
                      },
                    ].map((canal) => (
                      <div
                        key={canal.canal}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded-full ${canal.cor}`}
                          ></div>
                          <div>
                            <p className="font-medium">{canal.canal}</p>
                            <p className="text-sm text-muted-foreground">
                              {canal.leads} leads • Custo:{" "}
                              {formatarMoeda(canal.custo)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{canal.roas}x</p>
                          <p className="text-sm text-muted-foreground">ROAS</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        etapa: "Impressões",
                        quantidade: 156000,
                        taxa: 100,
                        cor: "bg-blue-100",
                      },
                      {
                        etapa: "Cliques",
                        quantidade: 4850,
                        taxa: 3.1,
                        cor: "bg-blue-200",
                      },
                      {
                        etapa: "Visitas Landing",
                        quantidade: 3920,
                        taxa: 2.5,
                        cor: "bg-blue-300",
                      },
                      {
                        etapa: "Leads",
                        quantidade: 89,
                        taxa: 2.3,
                        cor: "bg-blue-500",
                      },
                      {
                        etapa: "Vendas",
                        quantidade: 12,
                        taxa: 13.5,
                        cor: "bg-blue-700",
                      },
                    ].map((etapa) => (
                      <div key={etapa.etapa} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{etapa.etapa}</p>
                          <div className="text-right">
                            <p className="font-bold">
                              {formatarNumero(etapa.quantidade)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {etapa.taxa}%
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${etapa.cor} transition-all duration-500`}
                            style={{
                              width: `${Math.min(etapa.taxa * 10, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conteúdo Recente */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo de Melhor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {conteudos.slice(0, 3).map((conteudo) => (
                    <div
                      key={conteudo.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{conteudo.tipo}</Badge>
                        <Badge
                          variant={
                            conteudo.status === "PUBLICADO"
                              ? "default"
                              : conteudo.status === "AGENDADO"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {conteudo.status}
                        </Badge>
                      </div>
                      <h4 className="font-bold mb-2">{conteudo.titulo}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {conteudo.descricao.substring(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{conteudo.engajamento.curtidas}</span>
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span>{conteudo.engajamento.comentarios}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatarNumero(conteudo.alcance)} alcance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campanhas */}
          <TabsContent value="campanhas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Campanhas</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </div>
            </div>

            {/* Stats de Campanhas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Campanhas Ativas"
                value={campanhas.filter((c) => c.status === "ATIVA").length}
                icon={Activity}
                color="green"
              />
              <StatsCard
                title="Orçamento Total"
                value={formatarMoeda(
                  campanhas.reduce((acc, c) => acc + c.orcamento, 0),
                )}
                icon={DollarSign}
                color="blue"
              />
              <StatsCard
                title="Gasto Atual"
                value={formatarMoeda(
                  campanhas.reduce((acc, c) => acc + c.gastoAtual, 0),
                )}
                icon={TrendingUp}
                color="purple"
              />
              <StatsCard
                title="CTR Médio"
                value={`${(
                  campanhas.reduce((acc, c) => acc + c.ctr, 0) /
                  campanhas.length
                ).toFixed(2)}%`}
                icon={MousePointer}
                color="orange"
              />
            </div>

            {/* Lista de Campanhas */}
            <Card>
              <CardHeader>
                <CardTitle>Todas as Campanhas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campanhas.map((campanha) => (
                    <div
                      key={campanha.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold">{campanha.nome}</h3>
                          <Badge
                            variant={
                              campanha.status === "ATIVA"
                                ? "default"
                                : campanha.status === "PAUSADA"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {campanha.status}
                          </Badge>
                          <Badge variant="outline">{campanha.tipo}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Orçamento</p>
                            <p className="font-medium">
                              {formatarMoeda(campanha.orcamento)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Gasto Atual</p>
                            <p className="font-medium">
                              {formatarMoeda(campanha.gastoAtual)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Conversões</p>
                            <p className="font-medium">{campanha.conversoes}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">ROAS</p>
                            <p className="font-bold text-green-600">
                              {campanha.roas}x
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso do Orçamento</span>
                            <span>
                              {Math.round(
                                (campanha.gastoAtual / campanha.orcamento) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min((campanha.gastoAtual / campanha.orcamento) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Leads de Marketing</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Importar Leads
                </Button>
              </div>
            </div>

            {/* Stats de Leads */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Leads"
                value={leads.length}
                icon={Users}
                color="blue"
              />
              <StatsCard
                title="Qualificados"
                value={leads.filter((l) => l.status === "QUALIFICADO").length}
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Convertidos"
                value={leads.filter((l) => l.status === "CONVERTIDO").length}
                icon={Target}
                color="purple"
              />
              <StatsCard
                title="Valor Potencial"
                value={formatarMoeda(
                  leads.reduce((acc, l) => acc + l.valorPotencial, 0),
                )}
                icon={DollarSign}
                color="green"
              />
            </div>

            {/* Lista de Leads */}
            <Card>
              <CardHeader>
                <CardTitle>Leads Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{lead.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.telefone}
                            {lead.email && ` • ${lead.email}`}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{lead.origem}</Badge>
                            {lead.campanha && (
                              <Badge variant="outline" className="text-xs">
                                {lead.campanha}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">
                          {formatarMoeda(lead.valorPotencial)}
                        </p>
                        <Badge
                          variant={
                            lead.status === "CONVERTIDO"
                              ? "default"
                              : lead.status === "QUALIFICADO"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {lead.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lead.criadoEm.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo */}
          <TabsContent value="conteudo" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Conteúdo</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendário
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Conteúdo
                </Button>
              </div>
            </div>

            {/* Stats de Conteúdo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Posts Publicados"
                value={conteudos.filter((c) => c.status === "PUBLICADO").length}
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Agendados"
                value={conteudos.filter((c) => c.status === "AGENDADO").length}
                icon={Clock}
                color="yellow"
              />
              <StatsCard
                title="Engajamento Total"
                value={formatarNumero(
                  conteudos.reduce(
                    (acc, c) =>
                      acc +
                      c.engajamento.curtidas +
                      c.engajamento.comentarios +
                      c.engajamento.compartilhamentos,
                    0,
                  ),
                )}
                icon={Heart}
                color="red"
              />
              <StatsCard
                title="Alcance Total"
                value={formatarNumero(
                  conteudos.reduce((acc, c) => acc + c.alcance, 0),
                )}
                icon={Eye}
                color="blue"
              />
            </div>

            {/* Lista de Conteúdos */}
            <Card>
              <CardHeader>
                <CardTitle>Biblioteca de Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {conteudos.map((conteudo) => (
                    <div
                      key={conteudo.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{conteudo.tipo}</Badge>
                          {conteudo.plataforma.map((plat) => (
                            <Badge
                              key={plat}
                              variant="secondary"
                              className="text-xs"
                            >
                              {plat}
                            </Badge>
                          ))}
                        </div>
                        <Badge
                          variant={
                            conteudo.status === "PUBLICADO"
                              ? "default"
                              : conteudo.status === "AGENDADO"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {conteudo.status}
                        </Badge>
                      </div>

                      <h4 className="font-bold mb-2">{conteudo.titulo}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {conteudo.descricao}
                      </p>

                      {conteudo.status === "PUBLICADO" && (
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>{conteudo.engajamento.curtidas}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            <span>{conteudo.engajamento.comentarios}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Share2 className="h-4 w-4 text-green-500" />
                            <span>
                              {conteudo.engajamento.compartilhamentos}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span>{formatarNumero(conteudo.alcance)}</span>
                          </div>
                        </div>
                      )}

                      {conteudo.agendamento && (
                        <p className="text-sm text-muted-foreground mb-3">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Agendado para{" "}
                          {conteudo.agendamento.toLocaleDateString(
                            "pt-BR",
                          )} às{" "}
                          {conteudo.agendamento.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analytics Avançado</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Período
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Tendência de Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600 mb-2">
                      +47%
                    </p>
                    <p className="text-muted-foreground">vs mês anterior</p>
                    <div className="mt-4 h-32 bg-gradient-to-t from-green-100 to-green-50 rounded-lg flex items-end justify-center">
                      <LineChart className="h-16 w-16 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Custo por Aquisição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600 mb-2">
                      -23%
                    </p>
                    <p className="text-muted-foreground">
                      Redução no CPA médio
                    </p>
                    <div className="mt-4 h-32 bg-gradient-to-t from-blue-100 to-blue-50 rounded-lg flex items-end justify-center">
                      <TrendingUp className="h-16 w-16 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Engajamento Social</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-600 mb-2">
                      +89%
                    </p>
                    <p className="text-muted-foreground">
                      Crescimento do engajamento
                    </p>
                    <div className="mt-4 h-32 bg-gradient-to-t from-purple-100 to-purple-50 rounded-lg flex items-end justify-center">
                      <Heart className="h-16 w-16 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Avançados */}
            <Card>
              <CardHeader>
                <CardTitle>Insights de IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      insight:
                        "🎯 Campanhas no Facebook têm 34% melhor performance nas terças e quintas entre 19h-21h",
                      acao: "Ajustar agendamento",
                      impacto: "Alto",
                    },
                    {
                      insight:
                        "📱 Usuários mobile têm 67% mais probabilidade de converter em formulários simplificados",
                      acao: "Otimizar landing pages",
                      impacto: "Alto",
                    },
                    {
                      insight:
                        "🏠 Imóveis com tours virtuais geram 3.2x mais leads qualificados",
                      acao: "Investir em conteúdo 360°",
                      impacto: "Médio",
                    },
                    {
                      insight:
                        "💰 Keywords 'financiamento' e 'entrada facilitada' têm CPC 45% menor",
                      acao: "Expandir campanhas",
                      impacto: "Alto",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium mb-1">{item.insight}</p>
                        <p className="text-sm text-muted-foreground">
                          Ação recomendada: {item.acao}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            item.impacto === "Alto"
                              ? "default"
                              : item.impacto === "Médio"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {item.impacto}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="configuracoes" className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações de Marketing</h2>

            {/* Integrações */}
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    nome: "Google Ads",
                    status: "Conectado",
                    icon: Search,
                    descricao: "Campanhas de busca e display",
                  },
                  {
                    nome: "Facebook Business",
                    status: "Conectado",
                    icon: Facebook,
                    descricao: "Facebook e Instagram Ads",
                  },
                  {
                    nome: "Google Analytics",
                    status: "Conectado",
                    icon: BarChart3,
                    descricao: "Análise de website",
                  },
                  {
                    nome: "WhatsApp Business API",
                    status: "Pendente",
                    icon: MessageSquare,
                    descricao: "Automação de mensagens",
                  },
                ].map((integracao) => (
                  <div
                    key={integracao.nome}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <integracao.icon className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{integracao.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {integracao.descricao}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          integracao.status === "Conectado"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {integracao.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        {integracao.status === "Conectado"
                          ? "Gerenciar"
                          : "Conectar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Automações */}
            <Card>
              <CardHeader>
                <CardTitle>Automações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-resposta WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      Resposta automática para novos contatos
                    </p>
                  </div>
                  <Button size="sm">Configurar</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nutrição de Leads</p>
                    <p className="text-sm text-muted-foreground">
                      Email marketing automático para leads
                    </p>
                  </div>
                  <Button size="sm">Configurar</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Remarketing Pixel</p>
                    <p className="text-sm text-muted-foreground">
                      Rastreamento para campanhas de retargeting
                    </p>
                  </div>
                  <Button size="sm">Configurar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
