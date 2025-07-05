import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Eye,
  Share2,
  MessageCircle,
  Target,
  Instagram,
  Search,
  Globe,
  Smartphone,
  ArrowUp,
  ArrowDown,
  Calendar,
  DollarSign,
  Filter,
  Download,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";

interface MarketingStats {
  totalLeads: number;
  conversaoLeads: number;
  visualizacoes: number;
  compartilhamentos: number;
  seguidoresInstagram: number;
  alcanceTotal: number;
  custoPorLead: number;
  roiCampanhas: number;
}

interface CampanhaData {
  nome: string;
  tipo: string;
  status: string;
  orcamento: number;
  gasto: number;
  leads: number;
  conversoes: number;
  dataInicio: string;
  dataFim: string;
}

interface MetricasPorMes {
  mes: string;
  leads: number;
  conversoes: number;
  gasto: number;
  roi: number;
}

const campanhas: CampanhaData[] = [
  {
    nome: "Apartamentos Setor Oeste",
    tipo: "Google Ads",
    status: "ATIVA",
    orcamento: 2000,
    gasto: 1450,
    leads: 45,
    conversoes: 8,
    dataInicio: "2024-01-01",
    dataFim: "2024-01-31",
  },
  {
    nome: "Casas Jardim Goiás",
    tipo: "Facebook Ads",
    status: "PAUSADA",
    orcamento: 1500,
    gasto: 1200,
    leads: 32,
    conversoes: 5,
    dataInicio: "2024-01-01",
    dataFim: "2024-01-31",
  },
  {
    nome: "Instagram Stories",
    tipo: "Instagram",
    status: "ATIVA",
    orcamento: 800,
    gasto: 650,
    leads: 28,
    conversoes: 4,
    dataInicio: "2024-01-15",
    dataFim: "2024-02-15",
  },
];

const metricas: MetricasPorMes[] = [
  { mes: "Out", leads: 85, conversoes: 12, gasto: 3200, roi: 2.5 },
  { mes: "Nov", leads: 102, conversoes: 18, gasto: 3800, roi: 3.2 },
  { mes: "Dez", leads: 125, conversoes: 22, gasto: 4200, roi: 3.8 },
  { mes: "Jan", leads: 135, conversoes: 25, gasto: 4500, roi: 4.1 },
];

const fontesLeads = [
  { name: "Google Ads", value: 40, color: "#4285F4" },
  { name: "Facebook Ads", value: 30, color: "#1877F2" },
  { name: "Instagram", value: 20, color: "#E4405F" },
  { name: "Site Orgânico", value: 10, color: "#34A853" },
];

export default function MarketingDashboard() {
  const [stats, setStats] = useState<MarketingStats>({
    totalLeads: 0,
    conversaoLeads: 0,
    visualizacoes: 0,
    compartilhamentos: 0,
    seguidoresInstagram: 0,
    alcanceTotal: 0,
    custoPorLead: 0,
    roiCampanhas: 0,
  });

  const [periodo, setPeriodo] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados de marketing
    setTimeout(() => {
      setStats({
        totalLeads: 285,
        conversaoLeads: 18.5,
        visualizacoes: 45280,
        compartilhamentos: 1250,
        seguidoresInstagram: 8750,
        alcanceTotal: 125000,
        custoPorLead: 35.5,
        roiCampanhas: 4.2,
      });
      setLoading(false);
    }, 1000);
  }, [periodo]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-800">Carregando dados de marketing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-purple-900">
                Dashboard Marketing
              </h1>
              <p className="text-purple-700">
                Análise de campanhas e performance digital
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-40 border-purple-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Relatório
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Target className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Total de Leads
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">285</div>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {stats.conversaoLeads}%
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                +2.1% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Custo por Lead
              </CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatPrice(stats.custoPorLead)}
              </div>
              <p className="text-xs text-red-600 flex items-center">
                <ArrowDown className="w-3 h-3 mr-1" />
                -8% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                ROI Campanhas
              </CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {stats.roiCampanhas}x
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                +0.3x vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance ao Longo do Tempo */}
          <Card className="lg:col-span-2 border-purple-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-purple-900">
                Performance das Campanhas
              </CardTitle>
              <CardDescription>Leads e conversões por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversoes"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fontes de Leads */}
          <Card className="border-purple-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-purple-900">Fontes de Leads</CardTitle>
              <CardDescription>Distribuição por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={fontesLeads}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {fontesLeads.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Social Media Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Instagram
              </CardTitle>
              <Instagram className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-900">
                {formatNumber(stats.seguidoresInstagram)}
              </div>
              <p className="text-xs text-purple-600">seguidores</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Visualizações
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-900">
                {formatNumber(stats.visualizacoes)}
              </div>
              <p className="text-xs text-purple-600">este mês</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Compartilhamentos
              </CardTitle>
              <Share2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-900">
                {formatNumber(stats.compartilhamentos)}
              </div>
              <p className="text-xs text-purple-600">este mês</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Alcance Total
              </CardTitle>
              <Globe className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-900">
                {formatNumber(stats.alcanceTotal)}
              </div>
              <p className="text-xs text-purple-600">pessoas alcançadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Campanhas Ativas */}
        <Card className="border-purple-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-purple-900">Campanhas Ativas</CardTitle>
            <CardDescription>
              Monitoramento de performance por campanha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campanhas.map((campanha, index) => (
                <div
                  key={index}
                  className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-purple-900">
                        {campanha.nome}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant={
                            campanha.status === "ATIVA"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            campanha.status === "ATIVA"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {campanha.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-purple-300 text-purple-700"
                        >
                          {campanha.tipo}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-700">
                        Orçamento: {formatPrice(campanha.orcamento)}
                      </p>
                      <p className="text-sm text-purple-700">
                        Gasto: {formatPrice(campanha.gasto)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-sm text-purple-600">Leads</p>
                      <p className="text-lg font-bold text-purple-900">
                        {campanha.leads}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-purple-600">Conversões</p>
                      <p className="text-lg font-bold text-purple-900">
                        {campanha.conversoes}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-purple-600">Taxa Conversão</p>
                      <p className="text-lg font-bold text-purple-900">
                        {((campanha.conversoes / campanha.leads) * 100).toFixed(
                          1,
                        )}
                        %
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-purple-600">Custo/Lead</p>
                      <p className="text-lg font-bold text-purple-900">
                        {formatPrice(campanha.gasto / campanha.leads)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-purple-600 mb-1">
                      <span>Progresso do Orçamento</span>
                      <span>
                        {((campanha.gasto / campanha.orcamento) * 100).toFixed(
                          1,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(campanha.gasto / campanha.orcamento) * 100}
                      className="h-2 bg-purple-100"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-300 text-purple-700"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ChatBubble />
    </div>
  );
}
