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
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=150"
              alt="Siqueira Campos Imóveis"
              className="h-10 w-auto dark:hidden"
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

          {/* Outros tabs (placeholder) */}
          <TabsContent value="imoveis">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Imóveis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Módulo de gestão de imóveis em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Módulo de gestão de usuários em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Avançados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Módulo de relatórios em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
