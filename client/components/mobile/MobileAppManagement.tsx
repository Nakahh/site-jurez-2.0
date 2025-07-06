import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Users,
  Bell,
  Star,
  Activity,
  Settings,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  Upload,
  Code,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  MessageSquare,
  Globe,
  Share2,
} from "lucide-react";

interface AppVersion {
  id: string;
  versao: string;
  plataforma: "iOS" | "Android" | "React Native";
  status: "DESENVOLVIMENTO" | "TESTE" | "PRODUCAO" | "DESCONTINUADA";
  dataLancamento: Date;
  downloads: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  features: string[];
  bugs: number;
  crashes: number;
  retencao: {
    dia1: number;
    dia7: number;
    dia30: number;
  };
  changelog: string;
}

interface NotificacaoPush {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: "PROMOCIONAL" | "INFORMATIVO" | "EMERGENCIAL" | "PERSONAL";
  segmento: string[];
  agendamento: Date;
  status: "AGENDADA" | "ENVIADA" | "CANCELADA";
  enviadas: number;
  abertas: number;
  cliques: number;
  conversoes: number;
  criadoEm: Date;
}

interface UsuarioApp {
  id: string;
  nome: string;
  email: string;
  plataforma: "iOS" | "Android";
  versaoApp: string;
  registroEm: Date;
  ultimoAcesso: Date;
  sessoes: number;
  tempoMedioSessao: number;
  pusksHabilitados: boolean;
  localizacaoPermitida: boolean;
  scoreEngajamento: number;
  valorGerado: number;
}

interface MetricasApp {
  usuariosAtivos: {
    diarios: number;
    semanais: number;
    mensais: number;
  };
  downloads: {
    total: number;
    diarios: number;
    crescimento: number;
  };
  retencao: {
    dia1: number;
    dia7: number;
    dia30: number;
  };
  performance: {
    tempoCarregamento: number;
    crashes: number;
    avaliacaoMedia: number;
  };
  receita: {
    total: number;
    arpu: number;
    conversao: number;
  };
}

const dadosUsuariosAtivos = [
  { data: "01/06", diarios: 1250, semanais: 3200, mensais: 8900 },
  { data: "08/06", diarios: 1380, semanais: 3450, mensais: 9200 },
  { data: "15/06", diarios: 1420, semanais: 3680, mensais: 9800 },
  { data: "22/06", diarios: 1580, semanais: 3920, mensais: 10500 },
  { data: "29/06", diarios: 1650, semanais: 4150, mensais: 11200 },
];

const dadosPlataformas = [
  { name: "Android", value: 65, color: "#3b82f6" },
  { name: "iOS", value: 35, color: "#10b981" },
];

export default function MobileAppManagement() {
  const [versoes, setVersoes] = useState<AppVersion[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoPush[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioApp[]>([]);
  const [metricas, setMetricas] = useState<MetricasApp>({
    usuariosAtivos: { diarios: 0, semanais: 0, mensais: 0 },
    downloads: { total: 0, diarios: 0, crescimento: 0 },
    retencao: { dia1: 0, dia7: 0, dia30: 0 },
    performance: { tempoCarregamento: 0, crashes: 0, avaliacaoMedia: 0 },
    receita: { total: 0, arpu: 0, conversao: 0 },
  });

  const [novaVersao, setNovaVersao] = useState({
    versao: "",
    plataforma: "React Native",
    changelog: "",
    features: "",
  });

  const [novaNotificacao, setNovaNotificacao] = useState({
    titulo: "",
    mensagem: "",
    tipo: "INFORMATIVO",
    segmento: "TODOS",
    agendamento: "",
  });

  const [loading, setLoading] = useState(true);
  const [modalNovaVersao, setModalNovaVersao] = useState(false);
  const [modalNotificacao, setModalNotificacao] = useState(false);
  const [publicandoVersao, setPublicandoVersao] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        const versoesSimuladas: AppVersion[] = [
          {
            id: "1",
            versao: "2.1.0",
            plataforma: "React Native",
            status: "PRODUCAO",
            dataLancamento: new Date(),
            downloads: 15420,
            avaliacaoMedia: 4.6,
            totalAvaliacoes: 2890,
            features: [
              "Tour Virtual 360°",
              "Filtros Avançados",
              "Notificações Push",
              "Favoritos Sincronizados",
            ],
            bugs: 3,
            crashes: 12,
            retencao: { dia1: 68, dia7: 45, dia30: 28 },
            changelog:
              "• Adicionado tour virtual 360°\n• Melhorias de performance\n• Correções de bugs",
          },
          {
            id: "2",
            versao: "2.0.5",
            plataforma: "React Native",
            status: "DESCONTINUADA",
            dataLancamento: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            downloads: 12850,
            avaliacaoMedia: 4.4,
            totalAvaliacoes: 2120,
            features: ["Busca por Localização", "Chat Integrado"],
            bugs: 8,
            crashes: 28,
            retencao: { dia1: 62, dia7: 38, dia30: 22 },
            changelog:
              "• Implementado chat em tempo real\n• Busca por geolocalização",
          },
        ];

        const notificacoesSimuladas: NotificacaoPush[] = [
          {
            id: "1",
            titulo: "Novos Imóveis Disponíveis",
            mensagem: "Confira os lançamentos desta semana no Setor Bueno!",
            tipo: "PROMOCIONAL",
            segmento: ["TODOS"],
            agendamento: new Date(),
            status: "ENVIADA",
            enviadas: 8420,
            abertas: 3890,
            cliques: 890,
            conversoes: 45,
            criadoEm: new Date(),
          },
        ];

        const usuariosSimulados: UsuarioApp[] = [
          {
            id: "1",
            nome: "João Silva",
            email: "joao@email.com",
            plataforma: "Android",
            versaoApp: "2.1.0",
            registroEm: new Date(),
            ultimoAcesso: new Date(),
            sessoes: 45,
            tempoMedioSessao: 8.5,
            pusksHabilitados: true,
            localizacaoPermitida: true,
            scoreEngajamento: 85,
            valorGerado: 450000,
          },
        ];

        const metricasSimuladas: MetricasApp = {
          usuariosAtivos: { diarios: 1650, semanais: 4150, mensais: 11200 },
          downloads: { total: 28270, diarios: 245, crescimento: 12.5 },
          retencao: { dia1: 68, dia7: 45, dia30: 28 },
          performance: {
            tempoCarregamento: 2.3,
            crashes: 12,
            avaliacaoMedia: 4.6,
          },
          receita: { total: 156000, arpu: 13.92, conversao: 3.2 },
        };

        setVersoes(versoesSimuladas);
        setNotificacoes(notificacoesSimuladas);
        setUsuarios(usuariosSimulados);
        setMetricas(metricasSimuladas);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const publicarVersao = async () => {
    setPublicandoVersao(true);
    try {
      // Simular processo de build e publicação
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const novaVersaoData: AppVersion = {
        id: Date.now().toString(),
        versao: novaVersao.versao,
        plataforma: novaVersao.plataforma as any,
        status: "DESENVOLVIMENTO",
        dataLancamento: new Date(),
        downloads: 0,
        avaliacaoMedia: 0,
        totalAvaliacoes: 0,
        features: novaVersao.features.split(",").map((f) => f.trim()),
        bugs: 0,
        crashes: 0,
        retencao: { dia1: 0, dia7: 0, dia30: 0 },
        changelog: novaVersao.changelog,
      };

      setVersoes([novaVersaoData, ...versoes]);
      setModalNovaVersao(false);
      resetFormularioVersao();
    } catch (error) {
      console.error("Erro ao publicar versão:", error);
    } finally {
      setPublicandoVersao(false);
    }
  };

  const enviarNotificacao = async () => {
    try {
      const novaNotificacaoData: NotificacaoPush = {
        id: Date.now().toString(),
        titulo: novaNotificacao.titulo,
        mensagem: novaNotificacao.mensagem,
        tipo: novaNotificacao.tipo as any,
        segmento: [novaNotificacao.segmento],
        agendamento: new Date(novaNotificacao.agendamento),
        status: "AGENDADA",
        enviadas: 0,
        abertas: 0,
        cliques: 0,
        conversoes: 0,
        criadoEm: new Date(),
      };

      setNotificacoes([novaNotificacaoData, ...notificacoes]);
      setModalNotificacao(false);
      resetFormularioNotificacao();
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
    }
  };

  const resetFormularioVersao = () => {
    setNovaVersao({
      versao: "",
      plataforma: "React Native",
      changelog: "",
      features: "",
    });
  };

  const resetFormularioNotificacao = () => {
    setNovaNotificacao({
      titulo: "",
      mensagem: "",
      tipo: "INFORMATIVO",
      segmento: "TODOS",
      agendamento: "",
    });
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarNumero = (numero: number) => {
    return new Intl.NumberFormat("pt-BR").format(numero);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DESENVOLVIMENTO":
        return (
          <Badge className="bg-blue-100 text-blue-800">Desenvolvimento</Badge>
        );
      case "TESTE":
        return <Badge className="bg-yellow-100 text-yellow-800">Teste</Badge>;
      case "PRODUCAO":
        return <Badge className="bg-green-100 text-green-800">Produção</Badge>;
      case "DESCONTINUADA":
        return (
          <Badge className="bg-gray-100 text-gray-800">Descontinuada</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNotificacaoStatusBadge = (status: string) => {
    switch (status) {
      case "AGENDADA":
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case "ENVIADA":
        return <Badge className="bg-green-100 text-green-800">Enviada</Badge>;
      case "CANCELADA":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calcularTaxaAbertura = (notificacao: NotificacaoPush) => {
    return notificacao.enviadas > 0
      ? ((notificacao.abertas / notificacao.enviadas) * 100).toFixed(1)
      : "0";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Carregando dados do app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Gestão do App Mobile
          </h2>
          <p className="text-slate-600">
            Controle completo do aplicativo React Native
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Code className="w-4 h-4 mr-2" />
            DevTools
          </Button>
          <Dialog open={modalNovaVersao} onOpenChange={setModalNovaVersao}>
            <DialogTrigger asChild>
              <Button className="bg-slate-600 hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Versão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Publicar Nova Versão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="versao">Número da Versão</Label>
                    <Input
                      id="versao"
                      placeholder="2.2.0"
                      value={novaVersao.versao}
                      onChange={(e) =>
                        setNovaVersao({ ...novaVersao, versao: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="plataforma">Plataforma</Label>
                    <Select
                      value={novaVersao.plataforma}
                      onValueChange={(value) =>
                        setNovaVersao({ ...novaVersao, plataforma: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="React Native">
                          React Native
                        </SelectItem>
                        <SelectItem value="iOS">iOS Nativo</SelectItem>
                        <SelectItem value="Android">Android Nativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="features">Novas Features</Label>
                  <Input
                    id="features"
                    placeholder="Feature 1, Feature 2, Feature 3"
                    value={novaVersao.features}
                    onChange={(e) =>
                      setNovaVersao({ ...novaVersao, features: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="changelog">Changelog</Label>
                  <Textarea
                    id="changelog"
                    placeholder="• Adiciona nova funcionalidade X&#10;• Corrige bug Y&#10;• Melhora performance Z"
                    rows={6}
                    value={novaVersao.changelog}
                    onChange={(e) =>
                      setNovaVersao({
                        ...novaVersao,
                        changelog: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setModalNovaVersao(false)}
                    disabled={publicandoVersao}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={publicarVersao}
                    disabled={publicandoVersao || !novaVersao.versao}
                  >
                    {publicandoVersao ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarNumero(metricas.usuariosAtivos.diarios)}
            </div>
            <p className="text-xs text-slate-600">Diários (DAU)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarNumero(metricas.downloads.total)}
            </div>
            <p className="text-xs text-slate-600">
              +{formatarNumero(metricas.downloads.diarios)} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricas.performance.avaliacaoMedia}
            </div>
            <p className="text-xs text-slate-600">App Store & Play Store</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(metricas.receita.total)}
            </div>
            <p className="text-xs text-slate-600">
              ARPU: {formatarValor(metricas.receita.arpu)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="versoes">Versões</TabsTrigger>
          <TabsTrigger value="notificacoes">Push Notifications</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usuários Ativos */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosUsuariosAtivos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="diarios"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="semanais"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="mensais"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Plataforma */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosPlataformas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosPlataformas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Métricas de Retenção */}
            <Card>
              <CardHeader>
                <CardTitle>Retenção de Usuários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Dia 1:</span>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={metricas.retencao.dia1}
                      className="w-24 h-2"
                    />
                    <span className="font-semibold">
                      {metricas.retencao.dia1}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Dia 7:</span>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={metricas.retencao.dia7}
                      className="w-24 h-2"
                    />
                    <span className="font-semibold">
                      {metricas.retencao.dia7}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Dia 30:</span>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={metricas.retencao.dia30}
                      className="w-24 h-2"
                    />
                    <span className="font-semibold">
                      {metricas.retencao.dia30}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance do App */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tempo de carregamento:</span>
                  <span className="font-semibold">
                    {metricas.performance.tempoCarregamento}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Crashes (últimos 7 dias):
                  </span>
                  <span className="font-semibold">
                    {metricas.performance.crashes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxa de conversão:</span>
                  <span className="font-semibold">
                    {metricas.receita.conversao}%
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">Crescimento downloads:</span>
                  <span className="font-semibold text-green-600">
                    +{metricas.downloads.crescimento}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="versoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Versões do Aplicativo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Versão</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Bugs/Crashes</TableHead>
                    <TableHead>Lançamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versoes.map((versao) => (
                    <TableRow key={versao.id}>
                      <TableCell className="font-medium">
                        {versao.versao}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {versao.plataforma.includes("Android") && (
                            <Smartphone className="w-4 h-4 text-green-500" />
                          )}
                          {versao.plataforma.includes("iOS") && (
                            <Smartphone className="w-4 h-4 text-blue-500" />
                          )}
                          <span>{versao.plataforma}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(versao.status)}</TableCell>
                      <TableCell>{formatarNumero(versao.downloads)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{versao.avaliacaoMedia}</span>
                          <span className="text-sm text-slate-600">
                            ({versao.totalAvaliacoes})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-red-600">{versao.bugs} bugs</div>
                          <div className="text-orange-600">
                            {versao.crashes} crashes
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {versao.dataLancamento.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          {versao.status === "DESENVOLVIMENTO" && (
                            <Button size="sm">
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Push Notifications</h3>
            <Dialog open={modalNotificacao} onOpenChange={setModalNotificacao}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Notificação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Push Notification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        placeholder="Ex: Novos Imóveis Disponíveis"
                        value={novaNotificacao.titulo}
                        onChange={(e) =>
                          setNovaNotificacao({
                            ...novaNotificacao,
                            titulo: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={novaNotificacao.tipo}
                        onValueChange={(value) =>
                          setNovaNotificacao({
                            ...novaNotificacao,
                            tipo: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INFORMATIVO">
                            Informativo
                          </SelectItem>
                          <SelectItem value="PROMOCIONAL">
                            Promocional
                          </SelectItem>
                          <SelectItem value="EMERGENCIAL">
                            Emergencial
                          </SelectItem>
                          <SelectItem value="PERSONAL">
                            Personalizada
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="segmento">Segmento</Label>
                      <Select
                        value={novaNotificacao.segmento}
                        onValueChange={(value) =>
                          setNovaNotificacao({
                            ...novaNotificacao,
                            segmento: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODOS">Todos</SelectItem>
                          <SelectItem value="ANDROID">Android</SelectItem>
                          <SelectItem value="IOS">iOS</SelectItem>
                          <SelectItem value="ATIVOS">
                            Usuários Ativos
                          </SelectItem>
                          <SelectItem value="INATIVOS">
                            Usuários Inativos
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="agendamento">Agendamento</Label>
                      <Input
                        id="agendamento"
                        type="datetime-local"
                        value={novaNotificacao.agendamento}
                        onChange={(e) =>
                          setNovaNotificacao({
                            ...novaNotificacao,
                            agendamento: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea
                      id="mensagem"
                      placeholder="Texto da notificação push"
                      rows={3}
                      value={novaNotificacao.mensagem}
                      onChange={(e) =>
                        setNovaNotificacao({
                          ...novaNotificacao,
                          mensagem: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setModalNotificacao(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={enviarNotificacao}
                      disabled={
                        !novaNotificacao.titulo || !novaNotificacao.mensagem
                      }
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Agendar Envio
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notificação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviadas</TableHead>
                    <TableHead>Taxa Abertura</TableHead>
                    <TableHead>Conversões</TableHead>
                    <TableHead>Agendamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificacoes.map((notificacao) => (
                    <TableRow key={notificacao.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notificacao.titulo}</p>
                          <p className="text-sm text-slate-600 max-w-xs truncate">
                            {notificacao.mensagem}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{notificacao.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        {getNotificacaoStatusBadge(notificacao.status)}
                      </TableCell>
                      <TableCell>
                        {formatarNumero(notificacao.enviadas)}
                      </TableCell>
                      <TableCell>
                        {calcularTaxaAbertura(notificacao)}%
                      </TableCell>
                      <TableCell>{notificacao.conversoes}</TableCell>
                      <TableCell>
                        {notificacao.agendamento.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          {notificacao.status === "AGENDADA" && (
                            <Button size="sm" variant="outline">
                              <Pause className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários do Aplicativo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Versão App</TableHead>
                    <TableHead>Sessões</TableHead>
                    <TableHead>Tempo Médio</TableHead>
                    <TableHead>Engajamento</TableHead>
                    <TableHead>Último Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{usuario.nome}</p>
                          <p className="text-sm text-slate-600">
                            {usuario.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Smartphone className="w-4 h-4" />
                          <span>{usuario.plataforma}</span>
                        </div>
                      </TableCell>
                      <TableCell>{usuario.versaoApp}</TableCell>
                      <TableCell>{usuario.sessoes}</TableCell>
                      <TableCell>{usuario.tempoMedioSessao}min</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={usuario.scoreEngajamento}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {usuario.scoreEngajamento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {usuario.ultimoAcesso.toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">
                    +{metricas.downloads.crescimento}%
                  </div>
                  <p className="text-slate-600">Crescimento mensal</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Downloads hoje:</span>
                      <span className="font-semibold">
                        {formatarNumero(metricas.downloads.diarios)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total geral:</span>
                      <span className="font-semibold">
                        {formatarNumero(metricas.downloads.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita e Monetização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Receita total:</span>
                  <span className="font-semibold">
                    {formatarValor(metricas.receita.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ARPU:</span>
                  <span className="font-semibold">
                    {formatarValor(metricas.receita.arpu)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxa conversão:</span>
                  <span className="font-semibold">
                    {metricas.receita.conversao}%
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">LTV estimado:</span>
                  <span className="font-semibold text-green-600">
                    {formatarValor(metricas.receita.arpu * 24)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios Avançados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  <span>Relatório Completo</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Target className="w-6 h-6 mb-2" />
                  <span>Análise de Cohort</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="w-6 h-6 mb-2" />
                  <span>Funil de Conversão</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Globe className="w-6 h-6 mb-2" />
                  <span>Analytics Firebase</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
