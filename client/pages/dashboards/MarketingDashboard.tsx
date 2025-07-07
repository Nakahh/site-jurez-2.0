import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  MousePointer,
  Share2,
  Heart,
  Phone,
  Calendar,
  Target,
  DollarSign,
  PieChart,
  Activity,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Plus,
  Edit,
  Trash2,
  Settings,
  Download,
  Filter,
  Search,
  Camera,
  Video,
  FileText,
  Megaphone,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { BlogManagement } from "@/components/BlogManagement";

interface MarketingStats {
  visitasSite: number;
  leadsGerados: number;
  conversaoLeads: number;
  engajamentoSocial: number;
  alcanceTotal: number;
  impressoes: number;
  cliques: number;
  gastoAnuncios: number;
  retornoInvestimento: number;
  seguidores: {
    instagram: number;
    facebook: number;
    whatsapp: number;
  };
}

interface Campanha {
  id: string;
  nome: string;
  tipo: "SOCIAL_MEDIA" | "GOOGLE_ADS" | "EMAIL" | "BLOG";
  status: "ATIVA" | "PAUSADA" | "FINALIZADA" | "RASCUNHO";
  inicio: Date;
  fim?: Date;
  orcamento: number;
  gastoAtual: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  ctr: number; // Click Through Rate
  cpc: number; // Cost Per Click
  objetivo: string;
}

interface ConteudoSocial {
  id: string;
  tipo: "POST" | "STORY" | "REEL" | "VIDEO";
  titulo: string;
  descricao: string;
  plataforma: "INSTAGRAM" | "FACEBOOK" | "WHATSAPP" | "BLOG";
  agendadoPara?: Date;
  status: "AGENDADO" | "PUBLICADO" | "RASCUNHO";
  engajamento?: {
    curtidas: number;
    comentarios: number;
    compartilhamentos: number;
    salvamentos: number;
  };
  imagem?: string;
}

export default function MarketingDashboard() {
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [conteudos, setConteudos] = useState<ConteudoSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [novaCampanha, setNovaCampanha] = useState(false);
  const [novoConteudo, setNovoConteudo] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const handleExportReport = async () => {
    try {
      // Generate marketing report data
      const marketingData = [
        {
          campanha: "Jardim Goiás Premium",
          tipo: "Social Media",
          orcamento: 8000,
          gastoAtual: 4200,
          conversoes: 45,
          roi: "235%",
        },
        {
          campanha: "Casas Aldeota",
          tipo: "Google Ads",
          orcamento: 5000,
          gastoAtual: 3800,
          conversoes: 32,
          roi: "180%",
        },
        {
          campanha: "Apartamentos Centro",
          tipo: "Email Marketing",
          orcamento: 1500,
          gastoAtual: 1200,
          conversoes: 28,
          roi: "220%",
        },
        {
          campanha: "Blog Imobiliário",
          tipo: "SEO/Conteúdo",
          orcamento: 2000,
          gastoAtual: 1800,
          conversoes: 15,
          roi: "150%",
        },
      ];

      // Create a simple report
      const reportContent = `
        <div id="marketing-report" style="padding: 20px; font-family: Arial, sans-serif;">
          <h1>Relatório de Marketing - ${new Date().toLocaleDateString("pt-BR")}</h1>
          <h2>Resumo de Campanhas</h2>
          <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 10px;">Campanha</th>
              <th style="padding: 10px;">Tipo</th>
              <th style="padding: 10px;">Orçamento</th>
              <th style="padding: 10px;">Gasto Atual</th>
              <th style="padding: 10px;">Conversões</th>
              <th style="padding: 10px;">ROI</th>
            </tr>
            ${marketingData
              .map(
                (item) => `
              <tr>
                <td style="padding: 10px;">${item.campanha}</td>
                <td style="padding: 10px;">${item.tipo}</td>
                <td style="padding: 10px;">R$ ${item.orcamento.toLocaleString("pt-BR")}</td>
                <td style="padding: 10px;">R$ ${item.gastoAtual.toLocaleString("pt-BR")}</td>
                <td style="padding: 10px;">${item.conversoes}</td>
                <td style="padding: 10px;">${item.roi}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
          <br>
          <p><strong>Total de Leads Gerados:</strong> ${stats?.leadsGerados || 0}</p>
          <p><strong>Taxa de Conversão:</strong> ${stats?.conversaoLeads || 0}%</p>
          <p><strong>Alcance Total:</strong> ${stats?.alcanceTotal?.toLocaleString("pt-BR") || 0}</p>
        </div>
      `;

      // Create temporary element
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = reportContent;
      document.body.appendChild(tempDiv);

      // Import and use the PDF generator
      const { generateCustomReport } = await import("@/utils/pdfGenerator");
      await generateCustomReport("marketing-report", "Relatório de Marketing");

      // Cleanup
      document.body.removeChild(tempDiv);

      alert("Relatório de marketing exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      alert("Erro ao exportar relatório. Tente novamente.");
    }
  };

  const carregarDados = async () => {
    try {
      // Simular dados de marketing
      const statsSimuladas: MarketingStats = {
        visitasSite: 12450,
        leadsGerados: 156,
        conversaoLeads: 12.5,
        engajamentoSocial: 8.3,
        alcanceTotal: 45600,
        impressoes: 234500,
        cliques: 3420,
        gastoAnuncios: 4500,
        retornoInvestimento: 320,
        seguidores: {
          instagram: 15600,
          facebook: 8900,
          whatsapp: 2300,
        },
      };

      const campanhasSimuladas: Campanha[] = [
        {
          id: "1",
          nome: "Lançamento Jardim Goiás Premium",
          tipo: "SOCIAL_MEDIA",
          status: "ATIVA",
          inicio: new Date("2024-12-01"),
          fim: new Date("2025-01-31"),
          orcamento: 8000,
          gastoAtual: 4200,
          impressoes: 89000,
          cliques: 1250,
          conversoes: 45,
          ctr: 1.4,
          cpc: 3.36,
          objetivo: "Gerar leads para lançamento imobiliário",
        },
        {
          id: "2",
          nome: "Google Ads - Apartamentos Setor Oeste",
          tipo: "GOOGLE_ADS",
          status: "ATIVA",
          inicio: new Date("2024-11-15"),
          orcamento: 5000,
          gastoAtual: 3400,
          impressoes: 156000,
          cliques: 890,
          conversoes: 23,
          ctr: 0.57,
          cpc: 3.82,
          objetivo: "Aumentar vendas de apartamentos",
        },
        {
          id: "3",
          nome: "Newsletter Dezembro",
          tipo: "EMAIL",
          status: "FINALIZADA",
          inicio: new Date("2024-12-01"),
          fim: new Date("2024-12-31"),
          orcamento: 500,
          gastoAtual: 400,
          impressoes: 12000,
          cliques: 450,
          conversoes: 18,
          ctr: 3.75,
          cpc: 0.89,
          objetivo: "Engajar base de clientes",
        },
      ];

      const conteudosSimulados: ConteudoSocial[] = [
        {
          id: "1",
          tipo: "POST",
          titulo: "Casa dos Sonhos no Jardim Goiás",
          descricao:
            "🏡 Sua casa dos sonhos te espera! Casa térrea com 3 quartos, piscina e área gourmet no coração do Jardim Goiás. #JardimGoias #CasaDosSonhos",
          plataforma: "INSTAGRAM",
          agendadoPara: new Date("2025-01-07T10:00:00"),
          status: "AGENDADO",
          imagem:
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=400&fit=crop",
        },
        {
          id: "2",
          tipo: "STORY",
          titulo: "Tour Virtual - Apartamento Setor Bueno",
          descricao:
            "✨ Tour virtual exclusivo! Apartamento moderno com vista incrível. Deslize para conhecer cada detalhe.",
          plataforma: "INSTAGRAM",
          status: "PUBLICADO",
          engajamento: {
            curtidas: 234,
            comentarios: 12,
            compartilhamentos: 45,
            salvamentos: 67,
          },
        },
        {
          id: "3",
          tipo: "REEL",
          titulo: "Dicas para Primeira Compra",
          descricao:
            "📝 5 dicas essenciais para quem está comprando o primeiro imóvel! Salve este post e compartilhe com quem precisa.",
          plataforma: "INSTAGRAM",
          status: "RASCUNHO",
        },
      ];

      setStats(statsSimuladas);
      setCampanhas(campanhasSimuladas);
      setConteudos(conteudosSimulados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = "primary",
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down";
    trendValue?: string;
    color?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trendValue && (
              <div className="flex items-center mt-2">
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${
                    trend === "up" ? "text-green-600" : "text-red-600"
                  } ${trend === "down" ? "rotate-180" : ""}`}
                />
                <span
                  className={`text-sm font-medium ${
                    trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div
            className={`h-12 w-12 bg-${color}/10 rounded-full flex items-center justify-center`}
          >
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
              Dashboard Marketing
            </h1>
            <p className="text-muted-foreground">
              Gerencie campanhas, conteúdo e análises de marketing
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
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
            <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Visitas ao Site"
                    value={stats.visitasSite.toLocaleString()}
                    icon={Eye}
                    trend="up"
                    trendValue="+23%"
                    color="blue"
                  />
                  <MetricCard
                    title="Leads Gerados"
                    value={stats.leadsGerados}
                    icon={Users}
                    trend="up"
                    trendValue="+18%"
                    color="green"
                  />
                  <MetricCard
                    title="Taxa de Conversão"
                    value={formatPercentage(stats.conversaoLeads)}
                    icon={Target}
                    trend="up"
                    trendValue="+2.3%"
                    color="purple"
                  />
                  <MetricCard
                    title="ROI"
                    value={formatPercentage(stats.retornoInvestimento)}
                    icon={DollarSign}
                    trend="up"
                    trendValue="+45%"
                    color="yellow"
                  />
                </div>

                {/* Redes Sociais e Engajamento */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Share2 className="mr-2 h-5 w-5" />
                        Redes Sociais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Instagram className="h-6 w-6 text-pink-600" />
                            <span>Instagram</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {stats.seguidores.instagram.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              seguidores
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Facebook className="h-6 w-6 text-blue-600" />
                            <span>Facebook</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {stats.seguidores.facebook.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              seguidores
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="h-6 w-6 text-green-600" />
                            <span>WhatsApp</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {stats.seguidores.whatsapp.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              contatos
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Performance Anúncios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Impressões</span>
                          <span className="font-bold">
                            {stats.impressoes.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Cliques</span>
                          <span className="font-bold">
                            {stats.cliques.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>CTR Médio</span>
                          <span className="font-bold text-green-600">
                            {((stats.cliques / stats.impressoes) * 100).toFixed(
                              2,
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Gasto Total</span>
                          <span className="font-bold">
                            {formatCurrency(stats.gastoAnuncios)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Campanhas Ativas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campanhas Ativas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campanhas
                        .filter((c) => c.status === "ATIVA")
                        .map((campanha) => (
                          <div
                            key={campanha.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Megaphone className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-bold">{campanha.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {campanha.tipo} • CTR: {campanha.ctr}%
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {campanha.conversoes} conversões
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(campanha.gastoAtual)} /{" "}
                                {formatCurrency(campanha.orcamento)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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
                <Dialog open={novaCampanha} onOpenChange={setNovaCampanha}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Campanha
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Nova Campanha</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome da Campanha</Label>
                        <Input placeholder="Ex: Lançamento Setor Oeste" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SOCIAL_MEDIA">
                              Redes Sociais
                            </SelectItem>
                            <SelectItem value="GOOGLE_ADS">
                              Google Ads
                            </SelectItem>
                            <SelectItem value="EMAIL">
                              Email Marketing
                            </SelectItem>
                            <SelectItem value="BLOG">Blog/SEO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Orçamento</Label>
                        <Input type="number" placeholder="5000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <Input type="date" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Objetivo</Label>
                        <Textarea placeholder="Descreva o objetivo da campanha..." />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setNovaCampanha(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={() => setNovaCampanha(false)}>
                        Criar Campanha
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Lista de Campanhas */}
            <div className="grid gap-6">
              {campanhas.map((campanha) => (
                <Card
                  key={campanha.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Megaphone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{campanha.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {campanha.objetivo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            campanha.status === "ATIVA"
                              ? "default"
                              : campanha.status === "PAUSADA"
                                ? "secondary"
                                : campanha.status === "FINALIZADA"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {campanha.status}
                        </Badge>
                        <Badge variant="outline">{campanha.tipo}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {campanha.impressoes.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Impressões
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {campanha.cliques.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Cliques</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {campanha.conversoes}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Conversões
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {formatCurrency(campanha.gastoAtual)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Gasto / {formatCurrency(campanha.orcamento)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            CTR:
                          </span>
                          <span className="font-bold">{campanha.ctr}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            CPC:
                          </span>
                          <span className="font-bold">
                            {formatCurrency(campanha.cpc)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                <Dialog open={novoConteudo} onOpenChange={setNovoConteudo}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Conteúdo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Conteúdo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo de Conteúdo</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="POST">Post</SelectItem>
                              <SelectItem value="STORY">Story</SelectItem>
                              <SelectItem value="REEL">Reel</SelectItem>
                              <SelectItem value="VIDEO">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Plataforma</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a plataforma" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INSTAGRAM">
                                Instagram
                              </SelectItem>
                              <SelectItem value="FACEBOOK">Facebook</SelectItem>
                              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                              <SelectItem value="BLOG">Blog</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input placeholder="Título do conteúdo" />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                          placeholder="Descrição e texto do post..."
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Agendar para</Label>
                        <Input type="datetime-local" />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setNovoConteudo(false)}
                      >
                        Salvar Rascunho
                      </Button>
                      <Button onClick={() => setNovoConteudo(false)}>
                        Agendar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Conteúdo Agendado */}
            <div className="grid gap-6">
              {conteudos.map((conteudo) => (
                <Card
                  key={conteudo.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        {conteudo.imagem && (
                          <img
                            src={conteudo.imagem}
                            alt={conteudo.titulo}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">
                            {conteudo.titulo}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {conteudo.descricao}
                          </p>
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline">{conteudo.tipo}</Badge>
                            <div className="flex items-center space-x-2">
                              {conteudo.plataforma === "INSTAGRAM" && (
                                <Instagram className="h-4 w-4 text-pink-600" />
                              )}
                              {conteudo.plataforma === "FACEBOOK" && (
                                <Facebook className="h-4 w-4 text-blue-600" />
                              )}
                              {conteudo.plataforma === "WHATSAPP" && (
                                <MessageSquare className="h-4 w-4 text-green-600" />
                              )}
                              <span className="text-sm">
                                {conteudo.plataforma}
                              </span>
                            </div>
                            {conteudo.agendadoPara && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {conteudo.agendadoPara.toLocaleDateString(
                                    "pt-BR",
                                  )}{" "}
                                  às{" "}
                                  {conteudo.agendadoPara.toLocaleTimeString(
                                    "pt-BR",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
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
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {conteudo.engajamento && (
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-xl font-bold">
                            {conteudo.engajamento.curtidas}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Curtidas
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">
                            {conteudo.engajamento.comentarios}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Comentários
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">
                            {conteudo.engajamento.compartilhamentos}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Compartilhamentos
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">
                            {conteudo.engajamento.salvamentos}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Salvamentos
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
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

            {/* Métricas Detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tráfego do Site</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Visitantes Únicos</span>
                      <span className="font-bold">8,431</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visualizações</span>
                      <span className="font-bold">12,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo Médio</span>
                      <span className="font-bold">2m 34s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Rejeição</span>
                      <span className="font-bold text-green-600">42%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Origem do Tráfego</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Orgânico</span>
                      <span className="font-bold">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redes Sociais</span>
                      <span className="font-bold">32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Anúncios Pagos</span>
                      <span className="font-bold">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Direto</span>
                      <span className="font-bold">8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dispositivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Mobile</span>
                      <span className="font-bold">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desktop</span>
                      <span className="font-bold">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tablet</span>
                      <span className="font-bold">4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leads */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Leads de Marketing</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar por Origem
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Lista
                </Button>
              </div>
            </div>

            {/* Funil de Conversão */}
            <Card>
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span>Visitantes do Site</span>
                    <span className="font-bold text-xl">12,450</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span>Leads Gerados</span>
                    <span className="font-bold text-xl">1,543</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <span>Leads Qualificados</span>
                    <span className="font-bold text-xl">389</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <span>Oportunidades</span>
                    <span className="font-bold text-xl">156</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <span>Vendas Fechadas</span>
                    <span className="font-bold text-xl">45</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
