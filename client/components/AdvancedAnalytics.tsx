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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Home,
  DollarSign,
  Target,
  Calendar,
  MapPin,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Share2,
  Heart,
  Search,
  Filter,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";

interface AnalyticsData {
  visitors: {
    total: number;
    unique: number;
    returning: number;
    bounce_rate: number;
    avg_session: string;
  };
  properties: {
    total_views: number;
    favorites: number;
    shares: number;
    contact_requests: number;
    schedule_requests: number;
  };
  conversion: {
    leads: number;
    conversion_rate: number;
    cost_per_lead: number;
    roi: number;
  };
  geographic: Array<{
    city: string;
    visitors: number;
    percentage: number;
  }>;
  device: Array<{
    type: string;
    users: number;
    percentage: number;
  }>;
  traffic_sources: Array<{
    source: string;
    users: number;
    percentage: number;
  }>;
  popular_searches: Array<{
    term: string;
    count: number;
    trend: "up" | "down" | "stable";
  }>;
  top_properties: Array<{
    id: string;
    title: string;
    views: number;
    favorites: number;
    inquiries: number;
  }>;
}

const mockAnalyticsData: AnalyticsData = {
  visitors: {
    total: 12450,
    unique: 8320,
    returning: 4130,
    bounce_rate: 32.5,
    avg_session: "3m 45s",
  },
  properties: {
    total_views: 45280,
    favorites: 2340,
    shares: 890,
    contact_requests: 456,
    schedule_requests: 234,
  },
  conversion: {
    leads: 156,
    conversion_rate: 3.4,
    cost_per_lead: 85.5,
    roi: 245,
  },
  geographic: [
    { city: "Goiânia", visitors: 8420, percentage: 67.6 },
    { city: "Anápolis", visitors: 1850, percentage: 14.9 },
    { city: "Aparecida", visitors: 950, percentage: 7.6 },
    { city: "Brasília", visitors: 680, percentage: 5.5 },
    { city: "Outros", visitors: 550, percentage: 4.4 },
  ],
  device: [
    { type: "Mobile", users: 7470, percentage: 60 },
    { type: "Desktop", users: 3735, percentage: 30 },
    { type: "Tablet", users: 1245, percentage: 10 },
  ],
  traffic_sources: [
    { source: "Orgânico", users: 5480, percentage: 44 },
    { source: "Direto", users: 3115, percentage: 25 },
    { source: "Social Media", users: 2490, percentage: 20 },
    { source: "Pago", users: 1365, percentage: 11 },
  ],
  popular_searches: [
    { term: "apartamento jardim goiás", count: 450, trend: "up" },
    { term: "casa setor oeste", count: 320, trend: "up" },
    { term: "terreno aldeota", count: 280, trend: "stable" },
    { term: "comercial centro", count: 180, trend: "down" },
    { term: "aluguel 2 quartos", count: 620, trend: "up" },
  ],
  top_properties: [
    {
      id: "1",
      title: "Apartamento Luxuoso Jardim Goiás",
      views: 890,
      favorites: 45,
      inquiries: 12,
    },
    {
      id: "2",
      title: "Casa Moderna Setor Oeste",
      views: 720,
      favorites: 38,
      inquiries: 9,
    },
    {
      id: "3",
      title: "Cobertura Alto da Glória",
      views: 650,
      favorites: 52,
      inquiries: 15,
    },
  ],
};

const timeSeriesData = [
  { month: "Jan", visitors: 8500, leads: 85, conversions: 12 },
  { month: "Fev", visitors: 9200, leads: 92, conversions: 15 },
  { month: "Mar", visitors: 10100, leads: 108, conversions: 18 },
  { month: "Abr", visitors: 11300, leads: 125, conversions: 22 },
  { month: "Mai", visitors: 12450, leads: 156, conversions: 28 },
];

const COLORS = ["#d97706", "#f59e0b", "#fbbf24", "#fcd34d", "#fde68a"];

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setData(mockAnalyticsData);
    setIsLoading(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">
            Analytics Avançado
          </h2>
          <p className="text-amber-600">
            Insights detalhados sobre performance do site
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-amber-300 text-amber-700"
          >
            {isLoading ? "Atualizando..." : "Atualizar"}
          </Button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-amber-300 rounded-md text-amber-700 bg-white"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Visitantes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {formatNumber(data.visitors.total)}
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Visualizações
            </CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {formatNumber(data.properties.total_views)}
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Taxa Conversão
            </CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {data.conversion.conversion_rate}%
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +0.5% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              ROI
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {data.conversion.roi}%
            </div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="visitors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-amber-50">
          <TabsTrigger value="visitors">Visitantes</TabsTrigger>
          <TabsTrigger value="properties">Imóveis</TabsTrigger>
          <TabsTrigger value="geographic">Geografia</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Tendência de Visitantes
                </CardTitle>
                <CardDescription>
                  Evolução mensal de visitantes e conversões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="#d97706"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="#059669"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">Dispositivos</CardTitle>
                <CardDescription>
                  Distribuição por tipo de dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.device}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                      label={({ type, percentage }) =>
                        `${type}: ${percentage}%`
                      }
                    >
                      {data.device.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Visitor Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Únicos vs Retornando
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Únicos</span>
                      <span>{formatNumber(data.visitors.unique)}</span>
                    </div>
                    <Progress
                      value={(data.visitors.unique / data.visitors.total) * 100}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Retornando</span>
                      <span>{formatNumber(data.visitors.returning)}</span>
                    </div>
                    <Progress
                      value={
                        (data.visitors.returning / data.visitors.total) * 100
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Sessão Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-900 mb-2">
                    {data.visitors.avg_session}
                  </div>
                  <p className="text-sm text-amber-600">Tempo no site</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  Taxa de Rejeição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-900 mb-2">
                    {data.visitors.bounce_rate}%
                  </div>
                  <p className="text-sm text-green-600">
                    Abaixo da média do setor
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Performance de Imóveis
                </CardTitle>
                <CardDescription>Interações com propriedades</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: "Visualizações",
                        value: data.properties.total_views,
                      },
                      { name: "Favoritos", value: data.properties.favorites },
                      { name: "Compartilh.", value: data.properties.shares },
                      {
                        name: "Contatos",
                        value: data.properties.contact_requests,
                      },
                      {
                        name: "Agendamentos",
                        value: data.properties.schedule_requests,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d97706" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Top Imóveis por Views
                </CardTitle>
                <CardDescription>
                  Propriedades mais visualizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.top_properties.map((property, index) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-amber-900">
                          {property.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-amber-600">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {property.views}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {property.favorites}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {property.inquiries}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Distribuição Geográfica
                </CardTitle>
                <CardDescription>Visitantes por cidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.geographic.map((location) => (
                    <div key={location.city} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-amber-900 font-medium">
                          {location.city}
                        </span>
                        <span className="text-amber-600">
                          {formatNumber(location.visitors)} (
                          {location.percentage}%)
                        </span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Fontes de Tráfego
                </CardTitle>
                <CardDescription>Como os usuários chegam</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.traffic_sources}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                      label={({ source, percentage }) =>
                        `${source}: ${percentage}%`
                      }
                    >
                      {data.traffic_sources.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">
                Termos de Busca Populares
              </CardTitle>
              <CardDescription>O que os usuários mais procuram</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.popular_searches.map((search) => (
                  <div
                    key={search.term}
                    className="flex items-center justify-between p-3 border border-amber-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Search className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-900">
                        {search.term}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-600">{search.count}</span>
                      {getTrendIcon(search.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
