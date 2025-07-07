import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Home,
  DollarSign,
  TrendingUp,
  Activity,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Search,
  Settings,
  Shield,
  Bell,
} from "lucide-react";
import {
  generateSalesReport,
  generatePerformanceReport,
  generateCustomReport,
} from "@/utils/pdfGenerator";

interface DashboardStats {
  totalImoveis: number;
  imoveisDisponiveis: number;
  imoveisVendidos: number;
  imoveisAlugados: number;
  totalUsuarios: number;
  corretoresAtivos: number;
  leadsAtivos: number;
  visitasAgendadas: number;
  comissoesTotais: number;
  comissoesPendentes: number;
  faturamentoMes: number;
  metaMensal: number;
}

interface Transacao {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  descricao: string;
  valor: number;
  categoria: string;
  data: Date;
  status: "PENDENTE" | "PAGO" | "CANCELADO";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    carregarDados();
  }, []);

  const handleViewReport = (reportId: string) => {
    // Open report in new tab for viewing
    const reportUrl = `/api/reports/${reportId}/view`;
    window.open(reportUrl, "_blank");
  };

  const handleDownloadReport = async (reportId: string, tipo: string) => {
    try {
      // Simulate downloading existing report
      const link = document.createElement("a");
      link.href = `/api/reports/${reportId}/download`;
      link.download = `relatorio-${tipo.toLowerCase()}-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // For demo purposes, generate a new report
      await handleGenerateReport(tipo);
    } catch (error) {
      console.error("Erro ao baixar relatório:", error);
      alert("Erro ao baixar relatório. Tente novamente.");
    }
  };

  const handleGenerateReport = async (tipo: string) => {
    try {
      switch (tipo) {
        case "Vendas":
          const dadosVendas = [
            {
              imovel: "Apartamento Centro",
              corretor: "Ana Silva",
              valor: 350000,
              data: "15/12/2024",
            },
            {
              imovel: "Casa Jardim Goiás",
              corretor: "João Santos",
              valor: 450000,
              data: "20/12/2024",
            },
            {
              imovel: "Apartamento Setor Bueno",
              corretor: "Maria Costa",
              valor: 280000,
              data: "22/12/2024",
            },
            {
              imovel: "Casa Aldeia do Vale",
              corretor: "Carlos Lima",
              valor: 520000,
              data: "28/12/2024",
            },
            {
              imovel: "Apartamento Vila Nova",
              corretor: "Ana Silva",
              valor: 310000,
              data: "30/12/2024",
            },
          ];
          await generateSalesReport(dadosVendas);
          break;
        case "Performance":
          const dadosPerformance = [
            { nome: "Ana Silva", vendas: 8, volume: 2400000, comissao: 72000 },
            {
              nome: "João Santos",
              vendas: 6,
              volume: 1800000,
              comissao: 54000,
            },
            {
              nome: "Maria Costa",
              vendas: 5,
              volume: 1500000,
              comissao: 45000,
            },
            {
              nome: "Carlos Lima",
              vendas: 4,
              volume: 1200000,
              comissao: 36000,
            },
          ];
          await generatePerformanceReport(dadosPerformance);
          break;
        case "Financeiro":
          // Generate financial report with custom layout
          await generateCustomReport("financial-chart", "Relatório Financeiro");
          break;
        default:
          alert("Tipo de relatório não reconhecido");
      }
      alert("Relatório gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    }
  };

  const carregarDados = async () => {
    try {
      // Simular dados do dashboard admin
      const statsSimuladas: DashboardStats = {
        totalImoveis: 156,
        imoveisDisponiveis: 89,
        imoveisVendidos: 45,
        imoveisAlugados: 22,
        totalUsuarios: 234,
        corretoresAtivos: 8,
        leadsAtivos: 23,
        visitasAgendadas: 12,
        comissoesTotais: 125000,
        comissoesPendentes: 45000,
        faturamentoMes: 380000,
        metaMensal: 500000,
      };

      const transacoesSimuladas: Transacao[] = [
        {
          id: "1",
          tipo: "ENTRADA",
          descricao: "Comissão - Apartamento Setor Bueno",
          valor: 15000,
          categoria: "Comissão",
          data: new Date(),
          status: "PAGO",
        },
        {
          id: "2",
          tipo: "SAIDA",
          descricao: "Marketing Digital - Google Ads",
          valor: 2500,
          categoria: "Marketing",
          data: new Date(),
          status: "PAGO",
        },
        {
          id: "3",
          tipo: "ENTRADA",
          descricao: "Taxa de Administração - Casa Jardim Goiás",
          valor: 800,
          categoria: "Taxa",
          data: new Date(),
          status: "PENDENTE",
        },
        {
          id: "4",
          tipo: "SAIDA",
          descricao: "Comissão Corretor - Carlos Silva",
          valor: 12000,
          categoria: "Comissão",
          data: new Date(),
          status: "PENDENTE",
        },
      ];

      setStats(statsSimuladas);
      setTransacoes(transacoesSimuladas);
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

  const StatsCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    color = "primary",
  }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: string;
    color?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
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
        {trend && (
          <div className="flex items-center mt-4 pt-4 border-t">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600 font-medium">{trend}</span>
          </div>
        )}
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
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground">
              Controle total do seu negócio imobiliário
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="imoveis">Imóveis</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Faturamento Mensal"
                    value={formatCurrency(stats.faturamentoMes)}
                    icon={DollarSign}
                    description={`Meta: ${formatCurrency(stats.metaMensal)}`}
                    trend={`${((stats.faturamentoMes / stats.metaMensal) * 100).toFixed(0)}% da meta`}
                    color="green"
                  />
                  <StatsCard
                    title="Total de Imóveis"
                    value={stats.totalImoveis}
                    icon={Home}
                    description={`${stats.imoveisDisponiveis} disponíveis`}
                    trend="+12 este mês"
                  />
                  <StatsCard
                    title="Usuários Ativos"
                    value={stats.totalUsuarios}
                    icon={Users}
                    description={`${stats.corretoresAtivos} corretores ativos`}
                    trend="+5 novos esta semana"
                  />
                  <StatsCard
                    title="Leads Ativos"
                    value={stats.leadsAtivos}
                    icon={Activity}
                    description={`${stats.visitasAgendadas} visitas agendadas`}
                    trend="+8 hoje"
                  />
                </div>

                {/* Gráficos e Resumos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance de Vendas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Performance de Vendas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Vendas</span>
                          <span className="font-bold">
                            {stats.imoveisVendidos}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(stats.imoveisVendidos / 60) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Locações</span>
                          <span className="font-bold">
                            {stats.imoveisAlugados}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(stats.imoveisAlugados / 30) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status das Comissões */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="mr-2 h-5 w-5" />
                        Status das Comissões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Total Acumulado</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(stats.comissoesTotais)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Pendentes</span>
                          <span className="font-bold text-orange-600">
                            {formatCurrency(stats.comissoesPendentes)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Pagas</span>
                          <span className="font-bold text-blue-600">
                            {formatCurrency(
                              stats.comissoesTotais - stats.comissoesPendentes,
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Financeiro */}
          <TabsContent value="financeiro" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Controle Financeiro</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Entradas
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          transacoes
                            .filter(
                              (t) =>
                                t.tipo === "ENTRADA" && t.status === "PAGO",
                            )
                            .reduce((acc, t) => acc + t.valor, 0),
                        )}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Saídas
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(
                          transacoes
                            .filter(
                              (t) => t.tipo === "SAIDA" && t.status === "PAGO",
                            )
                            .reduce((acc, t) => acc + t.valor, 0),
                        )}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          transacoes
                            .filter((t) => t.status === "PAGO")
                            .reduce(
                              (acc, t) =>
                                acc +
                                (t.tipo === "ENTRADA" ? t.valor : -t.valor),
                              0,
                            ),
                        )}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Transações */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transacoes.map((transacao) => (
                    <div
                      key={transacao.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            transacao.tipo === "ENTRADA"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium">{transacao.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {transacao.categoria} •{" "}
                            {transacao.data.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transacao.tipo === "ENTRADA"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transacao.tipo === "ENTRADA" ? "+" : "-"}
                            {formatCurrency(transacao.valor)}
                          </p>
                          <Badge
                            variant={
                              transacao.status === "PAGO"
                                ? "default"
                                : transacao.status === "PENDENTE"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {transacao.status}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestão de Imóveis */}
          <TabsContent value="imoveis" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Imóveis</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Imóvel
                </Button>
              </div>
            </div>

            {/* Status dos Imóveis */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total de Imóveis
                      </p>
                      <p className="text-3xl font-bold">
                        {stats?.totalImoveis}
                      </p>
                    </div>
                    <Home className="h-12 w-12 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Disponíveis
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats?.imoveisDisponiveis}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Vendidos
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats?.imoveisVendidos}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Alugados
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {stats?.imoveisAlugados}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Imóveis */}
            <Card>
              <CardHeader>
                <CardTitle>Imóveis Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "1",
                      titulo: "Apartamento Moderno no Setor Bueno",
                      endereco: "Rua T-30, 1234 - Setor Bueno",
                      preco: 650000,
                      tipo: "APARTAMENTO",
                      status: "DISPONIVEL",
                      corretor: "Juarez Siqueira",
                      visualizacoes: 45,
                    },
                    {
                      id: "2",
                      titulo: "Casa Térrea no Jardim Goiás",
                      endereco: "Rua das Flores, 567 - Jardim Goiás",
                      preco: 450000,
                      tipo: "CASA",
                      status: "VENDIDO",
                      corretor: "Carlos Silva",
                      visualizacoes: 123,
                    },
                    {
                      id: "3",
                      titulo: "Apartamento para Aluguel no Setor Oeste",
                      endereco: "Avenida T-1, 890 - Setor Oeste",
                      preco: 2500,
                      tipo: "APARTAMENTO",
                      status: "ALUGADO",
                      corretor: "Maria Santos",
                      visualizacoes: 78,
                    },
                  ].map((imovel) => (
                    <div
                      key={imovel.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Home className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-bold">{imovel.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {imovel.endereco}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Corretor: {imovel.corretor} • {imovel.visualizacoes}{" "}
                            visualizações
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {formatCurrency(imovel.preco)}
                            {imovel.preco < 5000 && (
                              <span className="text-sm font-normal">/mês</span>
                            )}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{imovel.tipo}</Badge>
                            <Badge
                              variant={
                                imovel.status === "DISPONIVEL"
                                  ? "default"
                                  : imovel.status === "VENDIDO"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {imovel.status}
                            </Badge>
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
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestão de Usuários */}
          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar por Papel
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>
            </div>

            {/* Estatísticas de Usuários */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Usuários
                      </p>
                      <p className="text-3xl font-bold">
                        {stats?.totalUsuarios}
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Corretores Ativos
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats?.corretoresAtivos}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Clientes
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats
                          ? stats?.totalUsuarios - stats?.corretoresAtivos - 2
                          : 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Novos (Este Mês)
                      </p>
                      <p className="text-3xl font-bold text-orange-600">23</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "1",
                      nome: "Administrador",
                      email: "admin@siqueicamposimoveis.com.br",
                      papel: "ADMIN",
                      ativo: true,
                      ultimoLogin: "Hoje às 09:30",
                      avatar: "A",
                    },
                    {
                      id: "2",
                      nome: "Juarez Siqueira Campos",
                      email: "juarez@siqueicamposimoveis.com.br",
                      papel: "CORRETOR",
                      ativo: true,
                      ultimoLogin: "Hoje às 14:20",
                      avatar: "J",
                    },
                    {
                      id: "3",
                      nome: "Carlos Silva",
                      email: "corretor@siqueicamposimoveis.com.br",
                      papel: "CORRETOR",
                      ativo: true,
                      ultimoLogin: "Ontem às 16:45",
                      avatar: "C",
                    },
                    {
                      id: "4",
                      nome: "Maria Santos",
                      email: "assistente@siqueicamposimoveis.com.br",
                      papel: "ASSISTENTE",
                      ativo: true,
                      ultimoLogin: "Hoje ��s 11:15",
                      avatar: "M",
                    },
                    {
                      id: "5",
                      nome: "João da Silva",
                      email: "cliente@siqueicamposimoveis.com.br",
                      papel: "CLIENTE",
                      ativo: true,
                      ultimoLogin: "Há 2 dias",
                      avatar: "J",
                    },
                    {
                      id: "6",
                      nome: "Ana Marketing",
                      email: "marketing@siqueicamposimoveis.com.br",
                      papel: "MARKETING",
                      ativo: true,
                      ultimoLogin: "Hoje às 08:30",
                      avatar: "A",
                    },
                  ].map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary">
                            {usuario.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {usuario.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Último login: {usuario.ultimoLogin}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge
                            variant={
                              usuario.papel === "ADMIN"
                                ? "destructive"
                                : usuario.papel === "CORRETOR"
                                  ? "default"
                                  : usuario.papel === "ASSISTENTE"
                                    ? "secondary"
                                    : usuario.papel === "MARKETING"
                                      ? "outline"
                                      : "secondary"
                            }
                          >
                            {usuario.papel}
                          </Badge>
                          <div className="flex items-center mt-1">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                usuario.ativo ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            <span className="text-xs text-muted-foreground">
                              {usuario.ativo ? "Ativo" : "Inativo"}
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Avançados */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Relatórios Avançados</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Período
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Relatórios Disponíveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  titulo: "Relatório de Vendas",
                  descricao:
                    "Análise completa de vendas por período, corretor e região",
                  icon: BarChart3,
                  color: "bg-blue-100 text-blue-600",
                  stats: "45 vendas este mês",
                },
                {
                  titulo: "Performance de Corretores",
                  descricao: "Ranking e métricas de performance dos corretores",
                  icon: Users,
                  color: "bg-green-100 text-green-600",
                  stats: "8 corretores ativos",
                },
                {
                  titulo: "Análise Financeira",
                  descricao: "Receitas, despesas, comissões e lucratividade",
                  icon: DollarSign,
                  color: "bg-yellow-100 text-yellow-600",
                  stats: formatCurrency(380000) + " faturamento",
                },
                {
                  titulo: "Leads e Conversões",
                  descricao:
                    "Taxa de conversão, origem dos leads e efetividade",
                  icon: TrendingUp,
                  color: "bg-purple-100 text-purple-600",
                  stats: "23% taxa de conversão",
                },
                {
                  titulo: "Análise de Mercado",
                  descricao:
                    "Tendências de preços, demanda e oferta por região",
                  icon: PieChart,
                  color: "bg-orange-100 text-orange-600",
                  stats: "156 imóveis cadastrados",
                },
                {
                  titulo: "Relatório de Visitas",
                  descricao: "Agendamentos, realizações e feedback das visitas",
                  icon: Calendar,
                  color: "bg-indigo-100 text-indigo-600",
                  stats: "12 visitas agendadas",
                },
              ].map((relatorio, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${relatorio.color}`}>
                        <relatorio.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">{relatorio.titulo}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {relatorio.descricao}
                        </p>
                        <p className="text-xs font-medium text-primary">
                          {relatorio.stats}
                        </p>
                        <Button
                          size="sm"
                          className="mt-4 w-full"
                          onClick={() => handleGenerateReport(relatorio.tipo)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Gerar Relatório
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Relatórios Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Gerados Recentemente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "1",
                      nome: "Relatório de Vendas - Dezembro 2024",
                      tipo: "Vendas",
                      dataGeracao: "06/01/2025 às 10:30",
                      geradoPor: "Administrador",
                      tamanho: "2.3 MB",
                      formato: "PDF",
                    },
                    {
                      id: "2",
                      nome: "Performance Corretores - Q4 2024",
                      tipo: "Performance",
                      dataGeracao: "05/01/2025 às 14:15",
                      geradoPor: "Juarez Siqueira",
                      tamanho: "1.8 MB",
                      formato: "Excel",
                    },
                    {
                      id: "3",
                      nome: "Análise Financeira - Anual 2024",
                      tipo: "Financeiro",
                      dataGeracao: "03/01/2025 às 09:45",
                      geradoPor: "Administrador",
                      tamanho: "4.1 MB",
                      formato: "PDF",
                    },
                    {
                      id: "4",
                      nome: "Leads e Conversões - Dezembro",
                      tipo: "Leads",
                      dataGeracao: "02/01/2025 às 16:20",
                      geradoPor: "Maria Santos",
                      tamanho: "1.2 MB",
                      formato: "Excel",
                    },
                  ].map((relatorio) => (
                    <div
                      key={relatorio.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{relatorio.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Gerado por {relatorio.geradoPor} em{" "}
                            {relatorio.dataGeracao}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{relatorio.tipo}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {relatorio.tamanho} • {relatorio.formato}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReport(relatorio.id)}
                          title="Visualizar relatório"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadReport(relatorio.id, relatorio.tipo)
                          }
                          title="Baixar relatório"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agendamento de Relatórios */}
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Automáticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold">Relatório Mensal de Vendas</h4>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enviado todo dia 1º do mês para
                      admin@siqueicamposimoveis.com.br
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-1" />
                        Config
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold">Performance Semanal</h4>
                      <Badge variant="secondary">Pausado</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enviado toda segunda-feira para toda equipe de corretores
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Activity className="h-4 w-4 mr-1" />
                        Ativar
                      </Button>
                    </div>
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
