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
  FileText,
  X,
} from "lucide-react";
import {
  generateSalesReport,
  generatePerformanceReport,
  generateCustomReport,
} from "@/utils/pdfGenerator";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PremiumServiceAlert,
  PremiumServiceBanner,
} from "@/components/PremiumServiceAlert";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states for functionality
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [selectedPropertyImages, setSelectedPropertyImages] = useState<
    string[]
  >([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    carregarDados();
  }, []);

  // Button functionality handlers
  const handleNotifications = () => {
    setShowNotifications(true);
    // Could also navigate to notifications page
    console.log("Opening notifications");
  };

  const handleNewItem = () => {
    setShowNewModal(true);
    console.log("Opening new item modal");
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
    console.log("Opening settings");
  };

  const handleHelp = () => {
    setShowHelpModal(true);
    console.log("Opening help");
  };

  const handleFilter = () => {
    setShowFilterModal(true);
    console.log("Opening filter options");
  };

  const handleExport = async () => {
    try {
      const { generateSalesReport } = await import("@/utils/pdfGenerator");
      await generateSalesReport();

      // Simular download do arquivo
      const blob = new Blob(
        ["Relatório de vendas - " + new Date().toLocaleString()],
        { type: "text/csv" },
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-vendas-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso!",
        description: "Relatório exportado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório",
        variant: "destructive",
      });
    }
  };

  const handleNewTransaction = () => {
    setShowNewTransactionModal(true);
    console.log("Opening new transaction modal");
  };

  const handleNewProperty = () => {
    setShowNewPropertyModal(true);
    console.log("Opening new property modal");
  };

  const handleNewUser = () => {
    setShowNewUserModal(true);
    console.log("Opening new user modal");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    console.log("Searching for:", term);
  };

  const handleViewReport = (reportId: string) => {
    try {
      console.log("Viewing report:", reportId);

      // Simular abertura de relatório em nova aba
      const reportUrl = `/relatorio/${reportId}`;
      window.open(reportUrl, "_blank");

      toast({
        title: "Relatório aberto",
        description: `Relatório ${reportId} foi aberto em uma nova aba.`,
      });
    } catch (error) {
      console.error("Erro ao visualizar relatório:", error);
      toast({
        title: "Erro",
        description: "Erro ao visualizar relatório",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async (reportId: string, tipo: string) => {
    try {
      // Instead of trying to download from non-existent API, generate a demo report
      console.log("Downloading report:", reportId, tipo);

      // For demo purposes, generate a new report
      const {
        generateSalesReport,
        generatePerformanceReport,
        generateCustomReport,
      } = await import("@/utils/pdfGenerator");

      switch (tipo.toLowerCase()) {
        case "vendas":
          await generateSalesReport();
          break;
        case "performance":
          await generatePerformanceReport();
          break;
        default:
          await generateCustomReport(reportId, `Relatório ${tipo}`);
      }

      toast({
        title: "Download concluído",
        description: `Relatório ${tipo} baixado com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao baixar relatório:", error);
      toast({
        title: "Erro",
        description: "Erro ao baixar relatório. Tente novamente.",
        variant: "destructive",
      });
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
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardContent className="p-4 lg:p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <div
            className={`h-10 w-10 lg:h-12 lg:w-12 bg-${color}/10 rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`h-5 w-5 lg:h-6 lg:w-6 text-${color}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-auto pt-3 border-t">
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 mr-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-green-600 font-medium truncate">
              {trend}
            </span>
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
    <DashboardLayout
      title="Dashboard Administrativo"
      subtitle="Controle total do seu negócio imobiliário"
      userRole="ADMIN"
      actions={
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNotifications}
            className="w-full sm:w-auto"
          >
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notificações</span>
          </Button>
          <Button
            size="sm"
            onClick={handleNewItem}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Novo</span>
          </Button>
        </div>
      }
    >
      <PremiumServiceAlert userRole="ADMIN" />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
          <TabsTrigger value="servicos" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Serviços</span>
            <span className="sm:hidden">💎</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Financeiro</span>
            <span className="sm:hidden">$</span>
          </TabsTrigger>
          <TabsTrigger value="imoveis" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Imóveis</span>
            <span className="sm:hidden">🏠</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Usuários</span>
            <span className="sm:hidden">👥</span>
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Relatórios</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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

              {/* Atalhos Administrativos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Atalhos Administrativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => handleGenerateReport("Vendas")}
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-xs">Relatórios</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={handleSettings}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="text-xs">Configurações</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => {
                        alert(
                          "Backup iniciado! Você receberá uma notificação quando concluído.",
                        );
                      }}
                    >
                      <Download className="h-5 w-5" />
                      <span className="text-xs">Backup</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => {
                        alert(
                          "Logs do sistema:\n- Login admin 14:30\n- Novo imóvel adicionado 14:25\n- Backup concluído 13:00",
                        );
                      }}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-xs">Logs do Sistema</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Serviços Premium */}
        <TabsContent value="servicos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestão de Serviços Premium</h2>
            <Button
              onClick={() =>
                navigate("/dashboard/desenvolvedor", {
                  state: { activeTab: "premium" },
                })
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Serviços
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Business */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <span>WhatsApp Business</span>
                  </div>
                  <Badge
                    variant={
                      localStorage.getItem("whatsapp-businessActive") === "true"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {localStorage.getItem("whatsapp-businessActive") === "true"
                      ? "ATIVO"
                      : "INATIVO"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automação completa de leads via WhatsApp com Evolution API
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Preço mensal:</span>
                    <span className="font-bold text-green-600">R$ 197,00</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Resposta automática • N8N Integration • Fallback 15min
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meta Business */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <span>Meta Business</span>
                  </div>
                  <Badge
                    variant={
                      localStorage.getItem("meta-integrationActive") === "true"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {localStorage.getItem("meta-integrationActive") === "true"
                      ? "ATIVO"
                      : "INATIVO"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Publicação automática no Instagram e Facebook
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Preço mensal:</span>
                    <span className="font-bold text-blue-600">R$ 197,00</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Auto-posting • Analytics • Campanhas automáticas
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Calendar */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <span>Google Calendar</span>
                  </div>
                  <Badge
                    variant={
                      localStorage.getItem("google-calendarActive") === "true"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {localStorage.getItem("google-calendarActive") === "true"
                      ? "ATIVO"
                      : "INATIVO"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Agendamento automático de visitas e sincronização
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Preço mensal:</span>
                    <span className="font-bold text-orange-600">R$ 97,00</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Sync automático • Lembretes • Convites
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* N8N Automation */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <span>N8N Automation</span>
                  </div>
                  <Badge
                    variant={
                      localStorage.getItem("n8n-automationActive") === "true"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {localStorage.getItem("n8n-automationActive") === "true"
                      ? "ATIVO"
                      : "INATIVO"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automação completa de processos e integrações
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Preço mensal:</span>
                    <span className="font-bold text-purple-600">R$ 147,00</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Workflows ilimitados • APIs • Backup automático
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Financeiro */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
            <CardHeader>
              <CardTitle>Resumo de Custos dos Serviços Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {localStorage.getItem("whatsapp-businessActive") === "true"
                      ? "R$ 197"
                      : "R$ 0"}
                  </p>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {localStorage.getItem("meta-integrationActive") === "true"
                      ? "R$ 197"
                      : "R$ 0"}
                  </p>
                  <p className="text-sm text-muted-foreground">Meta</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {localStorage.getItem("google-calendarActive") === "true"
                      ? "R$ 97"
                      : "R$ 0"}
                  </p>
                  <p className="text-sm text-muted-foreground">Calendar</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {localStorage.getItem("n8n-automationActive") === "true"
                      ? "R$ 147"
                      : "R$ 0"}
                  </p>
                  <p className="text-sm text-muted-foreground">N8N</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Mensal:</span>
                  <span className="text-2xl font-bold text-primary">
                    R${" "}
                    {(
                      (localStorage.getItem("whatsapp-businessActive") ===
                      "true"
                        ? 197
                        : 0) +
                      (localStorage.getItem("meta-integrationActive") === "true"
                        ? 197
                        : 0) +
                      (localStorage.getItem("google-calendarActive") === "true"
                        ? 97
                        : 0) +
                      (localStorage.getItem("n8n-automationActive") === "true"
                        ? 147
                        : 0)
                    ).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Controle Financeiro</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFilter}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button
                size="sm"
                onClick={handleNewTransaction}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
                            (t) => t.tipo === "ENTRADA" && t.status === "PAGO",
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
                              acc + (t.tipo === "ENTRADA" ? t.valor : -t.valor),
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
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div
                        className={`h-3 w-3 rounded-full flex-shrink-0 ${
                          transacao.tipo === "ENTRADA"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {transacao.descricao}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {transacao.categoria} •{" "}
                          {transacao.data.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                      <div className="text-left sm:text-right">
                        <p
                          className={`font-bold text-sm sm:text-base ${
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
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Buscar imóveis..."
                  className="px-3 py-2 border rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(searchTerm)}
                  className="w-full sm:w-auto"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFilter}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button
                size="sm"
                onClick={handleNewProperty}
                className="w-full sm:w-auto"
              >
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
                    <p className="text-3xl font-bold">{stats?.totalImoveis}</p>
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
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            console.log("Viewing property:", imovel.id)
                          }
                          className="w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-1 sm:mr-0" />
                          <span className="sm:hidden">Ver</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            console.log("Editing property:", imovel.id)
                          }
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4 mr-1 sm:mr-0" />
                          <span className="sm:hidden">Editar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              confirm(
                                "Tem certeza que deseja excluir este imóvel?",
                              )
                            ) {
                              console.log("Deleting property:", imovel.id);
                              alert("Imóvel excluído com sucesso!");
                            }
                          }}
                          className="w-full sm:w-auto text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
                          <span className="sm:hidden">Excluir</span>
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
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  className="px-3 py-2 border rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(searchTerm)}
                  className="w-full sm:w-auto"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFilter}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Filtrar por Papel</span>
                <span className="lg:hidden">Filtrar</span>
              </Button>
              <Button
                size="sm"
                onClick={handleNewUser}
                className="w-full sm:w-auto"
              >
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
                    <p className="text-3xl font-bold">{stats?.totalUsuarios}</p>
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
                    ultimoLogin: "Hoje às 11:15",
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
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            alert(
                              `Perfil de ${usuario.nome}:\n\nEmail: ${usuario.email}\nFunção: ${usuario.papel}\nStatus: ${usuario.ativo ? "Ativo" : "Inativo"}\nÚltimo login: ${usuario.ultimoLogin}`,
                            );
                          }}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-1 sm:mr-0" />
                          <span className="sm:hidden">Ver</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const novoNome = prompt("Nome:", usuario.nome);
                            const novoEmail = prompt("Email:", usuario.email);
                            if (novoNome && novoEmail) {
                              alert("Usuário atualizado com sucesso!");
                            }
                          }}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4 mr-1 sm:mr-0" />
                          <span className="sm:hidden">Editar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProperty(usuario);
                            setShowSettingsModal(true);
                          }}
                          className="w-full sm:w-auto"
                        >
                          <Settings className="h-4 w-4 mr-1 sm:mr-0" />
                          <span className="sm:hidden">Config</span>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const periodo = prompt(
                    "Selecione o período:",
                    "Últimos 30 dias",
                  );
                  if (periodo) {
                    alert(`Período selecionado: ${periodo}`);
                  }
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Período
              </Button>
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button size="sm" onClick={handleExport}>
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
                descricao: "Taxa de conversão, origem dos leads e efetividade",
                icon: TrendingUp,
                color: "bg-purple-100 text-purple-600",
                stats: "23% taxa de conversão",
              },
              {
                titulo: "Análise de Mercado",
                descricao: "Tendências de preços, demanda e oferta por região",
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
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const novoEmail = prompt(
                          "Email para envio:",
                          "admin@siqueicamposimoveis.com.br",
                        );
                        const novoDia = prompt("Dia do mês (1-31):", "1");
                        if (novoEmail && novoDia) {
                          alert(
                            "Configurações do relatório mensal atualizadas!",
                          );
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        alert(
                          "Configurações do Relatório Mensal:\n\n- Formato: PDF\n- Idioma: Português\n- Incluir gráficos: Sim\n- Envio automático: Ativo",
                        );
                      }}
                      className="w-full sm:w-auto"
                    >
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
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const novoDia = prompt(
                          "Dia da semana (1=Segunda, 7=Domingo):",
                          "1",
                        );
                        const novoHorario = prompt("Horário (HH:MM):", "08:00");
                        if (novoDia && novoHorario) {
                          alert(
                            "Configurações do relatório semanal atualizadas!",
                          );
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const confirmar = confirm(
                          "Deseja ativar o relatório automático de Performance Semanal?",
                        );
                        if (confirmar) {
                          alert(
                            "Relatório de Performance Semanal ativado! Será enviado toda segunda-feira às 08:00.",
                          );
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
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

      {/* Modals */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Notificações</h3>
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Novo lead recebido</p>
                <p className="text-sm text-muted-foreground">
                  João Silva interessado em apartamento
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">Visita agendada</p>
                <p className="text-sm text-muted-foreground">
                  Maria Santos - Casa Jardim Goiás
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowNotifications(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Criar Novo</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewModal(false);
                  handleNewProperty();
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Imóvel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewModal(false);
                  handleNewUser();
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Usuário
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewModal(false);
                  handleNewTransaction();
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Transação
              </Button>
              <Button variant="outline" onClick={() => setShowNewModal(false)}>
                <FileText className="h-4 w-4 mr-2" />
                Relatório
              </Button>
            </div>
            <Button
              onClick={() => setShowNewModal(false)}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Central de Ajuda</h3>
            <div className="space-y-3 mb-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Como adicionar um imóvel?</h4>
                <p className="text-sm text-muted-foreground">
                  Vá em Imóveis, clique em Novo Imóvel e preencha os dados
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Como gerar relatórios?</h4>
                <p className="text-sm text-muted-foreground">
                  Acesse a aba Relatórios e clique em baixar
                </p>
              </div>
            </div>
            <Button onClick={() => setShowHelpModal(false)} className="w-full">
              Fechar
            </Button>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Configurações</h3>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tema</label>
                <select className="w-full p-2 border rounded">
                  <option>Claro</option>
                  <option>Escuro</option>
                  <option>Automático</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Idioma</label>
                <select className="w-full p-2 border rounded">
                  <option>Português</option>
                  <option>English</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notificações</label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">
                    Receber notificações por email
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  alert("Configurações salvas!");
                  setShowSettingsModal(false);
                }}
                className="flex-1"
              >
                Salvar
              </Button>
              <Button
                onClick={() => setShowSettingsModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Filtros</h3>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <select className="w-full p-2 border rounded">
                  <option>Últimos 7 dias</option>
                  <option>Últimos 30 dias</option>
                  <option>Últimos 3 meses</option>
                  <option>Este ano</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select className="w-full p-2 border rounded">
                  <option>Todos</option>
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select className="w-full p-2 border rounded">
                  <option>Todos</option>
                  <option>Pago</option>
                  <option>Pendente</option>
                  <option>Cancelado</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  alert("Filtros aplicados!");
                  setShowFilterModal(false);
                }}
                className="flex-1"
              >
                Aplicar
              </Button>
              <Button
                onClick={() => setShowFilterModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showNewTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Nova Transação</h3>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select className="w-full p-2 border rounded">
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Descrição da transação"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <select className="w-full p-2 border rounded">
                  <option>Comissão</option>
                  <option>Marketing</option>
                  <option>Operacional</option>
                  <option>Outros</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  alert("Transação criada com sucesso!");
                  setShowNewTransactionModal(false);
                }}
                className="flex-1"
              >
                Criar
              </Button>
              <Button
                onClick={() => setShowNewTransactionModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showNewPropertyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Novo Imóvel</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewPropertyModal(false);
                    setSelectedPropertyImages([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Informações Básicas
                  </h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Título do Imóvel *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-md"
                      placeholder="Ex: Apartamento moderno no Setor Bueno"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Descrição Completa *
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md h-24"
                      placeholder="Descreva o imóvel detalhadamente..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo *</label>
                      <select className="w-full p-3 border rounded-md">
                        <option value="">Selecione o tipo</option>
                        <option value="APARTAMENTO">Apartamento</option>
                        <option value="CASA">Casa</option>
                        <option value="TERRENO">Terreno</option>
                        <option value="COMERCIAL">Comercial</option>
                        <option value="RURAL">Rural</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Finalidade *
                      </label>
                      <select className="w-full p-3 border rounded-md">
                        <option value="">Selecione a finalidade</option>
                        <option value="VENDA">Venda</option>
                        <option value="ALUGUEL">Aluguel</option>
                        <option value="AMBOS">Ambos</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Preço (R$) *
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="650000"
                        step="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Área Total (m²) *
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="89"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quartos</label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="3"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Banheiros</label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="2"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vagas</label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="2"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        IPTU Anual (R$)
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="3500"
                        step="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Ano de Construção
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="2018"
                        min="1900"
                        max="2025"
                      />
                    </div>
                  </div>
                </div>

                {/* Localização */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Localização
                  </h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Endereço Completo *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-md"
                      placeholder="Rua T-30, 1234, Apartamento 802"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bairro *</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-md"
                        placeholder="Setor Bueno"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CEP</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-md"
                        placeholder="74223-030"
                        maxLength="9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cidade *</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-md"
                        placeholder="Goiânia"
                        defaultValue="Goiânia"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estado *</label>
                      <input
                        type="text"
                        className="w-full p-3 border rounded-md"
                        placeholder="GO"
                        defaultValue="GO"
                        maxLength="2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Latitude</label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="-16.6868"
                        step="0.0001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Longitude</label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="-49.2643"
                        step="0.0001"
                      />
                    </div>
                  </div>

                  {/* Condomínio */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">
                      Condomínio (se aplicável)
                    </h5>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Valor do Condomínio (R$/mês)
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-md"
                        placeholder="450"
                        step="10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Características e Amenidades */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Características
                  </h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Características do Imóvel
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md h-20"
                      placeholder="Ex: Reformado recentemente, Móveis planejados, Varanda gourmet (uma por linha)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Digite uma característica por linha
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Amenidades do Condomínio
                  </h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Amenidades Disponíveis
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md h-20"
                      placeholder="Ex: Piscina, Academia, Salão de festas, Playground (uma por linha)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Digite uma amenidade por linha
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload de Imagens */}
              <div className="mt-6">
                <h4 className="font-semibold text-lg border-b pb-2 mb-4">
                  Fotos do Imóvel
                </h4>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="property-images"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          // Simular URLs das imagens para preview
                          const newImages = files.map(
                            (file, index) =>
                              `https://images.unsplash.com/photo-${1560518883 + index}?w=200&h=150&fit=crop`,
                          );
                          setSelectedPropertyImages((prev) => [
                            ...prev,
                            ...newImages,
                          ]);
                          alert(
                            `${files.length} foto(s) adicionada(s) com sucesso!`,
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor="property-images"
                      className="cursor-pointer flex flex-col items-center space-y-3"
                    >
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Plus className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Clique para adicionar fotos
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ou arraste e solte aqui
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Formatos aceitos: JPG, PNG, WebP (máx. 10MB cada)
                        </p>
                      </div>
                    </label>
                  </div>

                  {selectedPropertyImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {selectedPropertyImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          <button
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setSelectedPropertyImages((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                              alert(`Foto ${index + 1} removida!`);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                              Capa
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPropertyImages.length > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {selectedPropertyImages.length} foto(s) selecionada(s) •
                        A primeira foto será usada como capa
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          if (confirm("Deseja remover todas as fotos?")) {
                            setSelectedPropertyImages([]);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover Todas
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Configurações Adicionais */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Configurações
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="destaque"
                        className="rounded"
                      />
                      <label htmlFor="destaque" className="text-sm font-medium">
                        Exibir como imóvel em destaque
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select className="w-full p-3 border rounded-md">
                        <option value="DISPONIVEL">Disponível</option>
                        <option value="RESERVADO">Reservado</option>
                        <option value="VENDIDO">Vendido</option>
                        <option value="ALUGADO">Alugado</option>
                        <option value="INATIVO">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Corretor Responsável
                  </h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Corretor</label>
                    <select className="w-full p-3 border rounded-md">
                      <option value="">Selecionar corretor</option>
                      <option value="1">Juarez Siqueira Campos</option>
                      <option value="2">Carlos Silva</option>
                      <option value="3">Maria Santos</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé com botões */}
            <div className="border-t p-6">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={() => {
                    // Aqui você implementaria a lógica de salvamento
                    alert(
                      "🎉 Imóvel criado com sucesso!\n\nTodas as informações foram salvas:\n• Dados básicos\n• Localização\n• Características\n• Amenidades\n• Fotos\n• Configurações\n\nO imóvel já está disponível no sistema!",
                    );
                    setShowNewPropertyModal(false);
                  }}
                  className="flex-1 sm:flex-none sm:px-8"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Imóvel
                </Button>
                <Button
                  onClick={() => {
                    setShowNewPropertyModal(false);
                    setSelectedPropertyImages([]);
                  }}
                  variant="outline"
                  className="flex-1 sm:flex-none sm:px-8"
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Campos obrigatórios devem ser preenchidos
              </p>
            </div>
          </div>
        </div>
      )}

      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Novo Usuário</h3>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  placeholder="usuario@email.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded"
                  placeholder="(62) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Função</label>
                <select className="w-full p-2 border rounded">
                  <option>Cliente</option>
                  <option>Corretor</option>
                  <option>Admin</option>
                  <option>Marketing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha Temporária</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  placeholder="Senha temporária"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  alert("Usuário criado com sucesso!");
                  setShowNewUserModal(false);
                }}
                className="flex-1"
              >
                Criar
              </Button>
              <Button
                onClick={() => setShowNewUserModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
