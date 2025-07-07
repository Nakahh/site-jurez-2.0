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
  Heart,
  Home,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Star,
  Eye,
  MapPin,
  Bed,
  Bath,
  Car,
  DollarSign,
  Plus,
  Settings,
  Bell,
  User,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  Target,
  TrendingUp,
  Activity,
  Mail,
  Phone,
  Edit,
  Trash2,
  Share2,
  BookmarkPlus,
  CalendarDays,
  AlertCircle,
  Download,
  Camera,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

// Types
interface Imovel {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  preco: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  fotos: string[];
  status: string;
  corretor: {
    nome: string;
    telefone: string;
    avatar?: string;
  };
  favoritadoEm?: Date;
  visualizadoEm?: Date;
}

interface Agendamento {
  id: string;
  imovel: Imovel;
  dataHora: Date;
  status: string;
  observacoes?: string;
  corretor: {
    nome: string;
    telefone: string;
  };
}

interface Avaliacao {
  id: string;
  imovel: Imovel;
  nota: number;
  comentario: string;
  data: Date;
  aprovada: boolean;
}

interface BuscaSalva {
  id: string;
  nome: string;
  filtros: {
    tipo?: string;
    finalidade?: string;
    precoMin?: number;
    precoMax?: number;
    quartos?: number;
    bairro?: string;
  };
  alertasAtivos: boolean;
  criadaEm: Date;
  ultimaNotificacao?: Date;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = "primary",
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  color?: string;
  trend?: string;
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
        {trend && (
          <div className="flex items-center mt-4 pt-4 border-t">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Modal para comparar imóveis
function ComparadorModal({
  isOpen,
  onClose,
  imoveis,
}: {
  isOpen: boolean;
  onClose: () => void;
  imoveis: Imovel[];
}) {
  const [imoveisSelecionados, setImoveisSelecionados] = useState<Imovel[]>([]);

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(preco);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparar Imóveis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Imóveis */}
          <div>
            <h3 className="font-bold mb-4">
              Selecione até 4 imóveis para comparar:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imoveis.slice(0, 8).map((imovel) => (
                <div
                  key={imovel.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    imoveisSelecionados.find((i) => i.id === imovel.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => {
                    if (imoveisSelecionados.find((i) => i.id === imovel.id)) {
                      setImoveisSelecionados((prev) =>
                        prev.filter((i) => i.id !== imovel.id),
                      );
                    } else if (imoveisSelecionados.length < 4) {
                      setImoveisSelecionados((prev) => [...prev, imovel]);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={imovel.fotos[0]}
                      alt={imovel.titulo}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{imovel.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {imovel.bairro}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {formatarPreco(imovel.preco)}
                      </p>
                    </div>
                    {imoveisSelecionados.find((i) => i.id === imovel.id) && (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparação */}
          {imoveisSelecionados.length >= 2 && (
            <div>
              <h3 className="font-bold mb-4">Comparação:</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-300 p-2 text-left">
                        Característica
                      </th>
                      {imoveisSelecionados.map((imovel) => (
                        <th
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center min-w-[200px]"
                        >
                          <div>
                            <img
                              src={imovel.fotos[0]}
                              alt={imovel.titulo}
                              className="w-full h-24 object-cover rounded mb-2"
                            />
                            <p className="text-sm font-medium">
                              {imovel.titulo}
                            </p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">
                        Preço
                      </td>
                      {imoveisSelecionados.map((imovel) => (
                        <td
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center"
                        >
                          <span className="font-bold text-primary">
                            {formatarPreco(imovel.preco)}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">
                        Tipo
                      </td>
                      {imoveisSelecionados.map((imovel) => (
                        <td
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {imovel.tipo}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">
                        Área
                      </td>
                      {imoveisSelecionados.map((imovel) => (
                        <td
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {imovel.area}m²
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">
                        Quartos
                      </td>
                      {imoveisSelecionados.map((imovel) => (
                        <td
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {imovel.quartos}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">
                        Banheiros
                      </td>
                      {imoveisSelecionados.map((imovel) => (
                        <td
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {imovel.banheiros}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">
                        Vagas
                      </td>
                      {imoveisSelecionados.map((imovel) => (
                        <td
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {imovel.vagas || 0}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">
                        Bairro
                      </td>
                      {imoveisSelecionados.map((imovel) => (
                        <td
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {imovel.bairro}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">
                        Preço/m²
                      </td>
                      {imoveisSelecionados.map((imovel) => (
                        <td
                          key={imovel.id}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {formatarPreco(imovel.preco / imovel.area)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ClienteDashboard() {
  const [favoritos, setFavoritos] = useState<Imovel[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [buscasSalvas, setBuscasSalvas] = useState<BuscaSalva[]>([]);
  const [recentementeVistos, setRecentementeVistos] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showComparador, setShowComparador] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Dados simulados ultra-robustos
      const favoritosSimulados: Imovel[] = [
        {
          id: "1",
          titulo: "Apartamento Moderno no Setor Bueno",
          tipo: "APARTAMENTO",
          finalidade: "VENDA",
          preco: 650000,
          area: 120.5,
          quartos: 3,
          banheiros: 2,
          vagas: 2,
          endereco: "Rua T-30, 1234",
          bairro: "Setor Bueno",
          cidade: "Goiânia",
          fotos: [
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          ],
          status: "DISPONIVEL",
          corretor: {
            nome: "Juarez Siqueira",
            telefone: "(62) 9 8556-3505",
          },
          favoritadoEm: new Date("2025-01-05T14:30:00"),
        },
        {
          id: "2",
          titulo: "Casa Térrea no Jardim Goiás",
          tipo: "CASA",
          finalidade: "VENDA",
          preco: 450000,
          area: 250.0,
          quartos: 4,
          banheiros: 3,
          vagas: 3,
          endereco: "Rua das Flores, 567",
          bairro: "Jardim Goiás",
          cidade: "Goiânia",
          fotos: [
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          ],
          status: "DISPONIVEL",
          corretor: {
            nome: "Carlos Silva",
            telefone: "(62) 9 9999-8888",
          },
          favoritadoEm: new Date("2025-01-04T10:15:00"),
        },
      ];

      const agendamentosSimulados: Agendamento[] = [
        {
          id: "1",
          imovel: favoritosSimulados[0],
          dataHora: new Date("2025-01-08T14:00:00"),
          status: "AGENDADA",
          observacoes: "Interessado em conhecer a área de lazer",
          corretor: {
            nome: "Juarez Siqueira",
            telefone: "(62) 9 8556-3505",
          },
        },
        {
          id: "2",
          imovel: favoritosSimulados[1],
          dataHora: new Date("2025-01-10T10:30:00"),
          status: "CONFIRMADA",
          observacoes: "Visita com a família",
          corretor: {
            nome: "Carlos Silva",
            telefone: "(62) 9 9999-8888",
          },
        },
      ];

      const avaliacoesSimuladas: Avaliacao[] = [
        {
          id: "1",
          imovel: favoritosSimulados[0],
          nota: 5,
          comentario:
            "Apartamento excelente, muito bem localizado e com ótimo acabamento!",
          data: new Date("2025-01-03T16:20:00"),
          aprovada: true,
        },
      ];

      const buscasSalvasSimuladas: BuscaSalva[] = [
        {
          id: "1",
          nome: "Apartamentos Setor Bueno",
          filtros: {
            tipo: "APARTAMENTO",
            finalidade: "VENDA",
            precoMin: 400000,
            precoMax: 800000,
            quartos: 3,
            bairro: "Setor Bueno",
          },
          alertasAtivos: true,
          criadaEm: new Date("2024-12-20T09:00:00"),
          ultimaNotificacao: new Date("2025-01-02T11:30:00"),
        },
        {
          id: "2",
          nome: "Casas Jardim Goiás",
          filtros: {
            tipo: "CASA",
            finalidade: "VENDA",
            precoMin: 300000,
            precoMax: 600000,
            bairro: "Jardim Goiás",
          },
          alertasAtivos: false,
          criadaEm: new Date("2024-12-15T14:45:00"),
        },
      ];

      setFavoritos(favoritosSimulados);
      setAgendamentos(agendamentosSimulados);
      setAvaliacoes(avaliacoesSimuladas);
      setBuscasSalvas(buscasSalvasSimuladas);
      setRecentementeVistos(favoritosSimulados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(preco);
  };

  const stats = {
    favoritos: favoritos.length,
    agendamentos: agendamentos.filter(
      (a) => a.status === "AGENDADA" || a.status === "CONFIRMADA",
    ).length,
    avaliacoes: avaliacoes.length,
    buscasSalvas: buscasSalvas.length,
    visitasRealizadas: 8,
    economiaMedia: 15000,
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
              Dashboard do Cliente
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus imóveis favoritos, agendamentos e muito mais
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            <TabsTrigger value="buscas">Buscas Salvas</TabsTrigger>
            <TabsTrigger value="vistos">Recentes</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Recomendação Personalizada */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      🎯 Recomendação Personalizada
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Baseado no seu perfil e preferências, encontramos imóveis
                      perfeitos para você!
                    </p>
                    <div className="flex items-center space-x-4">
                      <Button>
                        <Search className="h-4 w-4 mr-2" />
                        Ver Recomendações
                      </Button>
                      <Button variant="outline">
                        <Target className="h-4 w-4 mr-2" />
                        Refinar Perfil
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">23</p>
                    <p className="text-sm text-muted-foreground">
                      novos imóveis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard
                title="Imóveis Favoritos"
                value={stats.favoritos}
                icon={Heart}
                description="Suas escolhas salvas"
                color="red"
                trend="+2 esta semana"
              />
              <StatsCard
                title="Agendamentos"
                value={stats.agendamentos}
                icon={Calendar}
                description="Próximas visitas"
                color="blue"
              />
              <StatsCard
                title="Avaliações"
                value={stats.avaliacoes}
                icon={Star}
                description="Suas reviews"
                color="yellow"
              />
              <StatsCard
                title="Buscas Salvas"
                value={stats.buscasSalvas}
                icon={BookmarkPlus}
                description="Alertas ativos"
                color="green"
              />
              <StatsCard
                title="Visitas Realizadas"
                value={stats.visitasRealizadas}
                icon={CheckCircle}
                description="Total histórico"
                color="purple"
              />
              <StatsCard
                title="Economia Média"
                value={formatarPreco(stats.economiaMedia)}
                icon={DollarSign}
                description="Por negociação"
                color="green"
                trend="Baseado no histórico"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold mb-2">Buscar Imóveis</h3>
                  <p className="text-sm text-muted-foreground">
                    Encontre o imóvel dos seus sonhos
                  </p>
                </CardContent>
              </Card>

              <Card
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setShowComparador(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2">Comparar Imóveis</h3>
                  <p className="text-sm text-muted-foreground">
                    Compare até 4 imóveis lado a lado
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold mb-2">Agendar Visita</h3>
                  <p className="text-sm text-muted-foreground">
                    Marque uma visita com corretor
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-bold mb-2">Chat com Corretor</h3>
                  <p className="text-sm text-muted-foreground">
                    Tire suas dúvidas em tempo real
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Próximos Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Próximas Visitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agendamentos.slice(0, 3).map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={agendamento.imovel.fotos[0]}
                          alt={agendamento.imovel.titulo}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-bold">
                            {agendamento.imovel.titulo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {agendamento.imovel.bairro}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {agendamento.dataHora.toLocaleDateString(
                              "pt-BR",
                            )}{" "}
                            às{" "}
                            {agendamento.dataHora.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            agendamento.status === "CONFIRMADA"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {agendamento.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {agendamento.corretor.nome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favoritos */}
          <TabsContent value="favoritos" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Imóveis Favoritos</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button onClick={() => setShowComparador(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comparar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {favoritos.map((imovel) => (
                <Card
                  key={imovel.id}
                  className="border-0 shadow-lg overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={imovel.fotos[0]}
                      alt={imovel.titulo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90"
                      >
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="default">{imovel.finalidade}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{imovel.titulo}</h3>
                    <p className="text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {imovel.endereco}, {imovel.bairro}
                    </p>

                    <div className="flex items-center space-x-4 mb-4 text-sm">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {imovel.quartos} quartos
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {imovel.banheiros} banheiros
                      </div>
                      {imovel.vagas && (
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-1" />
                          {imovel.vagas} vagas
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {formatarPreco(imovel.preco)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Favoritado em{" "}
                          {imovel.favoritadoEm?.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Agendamentos */}
          <TabsContent value="agendamentos" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Agendamentos de Visitas</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Visita
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Agendadas"
                value={
                  agendamentos.filter((a) => a.status === "AGENDADA").length
                }
                icon={Clock}
                color="yellow"
              />
              <StatsCard
                title="Confirmadas"
                value={
                  agendamentos.filter((a) => a.status === "CONFIRMADA").length
                }
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Total Realizadas"
                value={stats.visitasRealizadas}
                icon={Calendar}
                color="blue"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Visitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agendamentos.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={agendamento.imovel.fotos[0]}
                          alt={agendamento.imovel.titulo}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <p className="font-bold text-lg">
                            {agendamento.imovel.titulo}
                          </p>
                          <p className="text-muted-foreground mb-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {agendamento.imovel.endereco},{" "}
                            {agendamento.imovel.bairro}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {agendamento.dataHora.toLocaleDateString(
                              "pt-BR",
                            )}{" "}
                            às{" "}
                            {agendamento.dataHora.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <User className="h-3 w-3 inline mr-1" />
                            Corretor: {agendamento.corretor.nome}
                          </p>
                          {agendamento.observacoes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Obs: {agendamento.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge
                          variant={
                            agendamento.status === "CONFIRMADA"
                              ? "default"
                              : agendamento.status === "AGENDADA"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {agendamento.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avaliações */}
          <TabsContent value="avaliacoes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Minhas Avaliações</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Avaliações"
                value={stats.avaliacoes}
                icon={Star}
                color="yellow"
              />
              <StatsCard
                title="Nota Média"
                value="4.8"
                icon={Star}
                color="yellow"
                description="Suas avaliações"
              />
              <StatsCard
                title="Aprovadas"
                value={avaliacoes.filter((a) => a.aprovada).length}
                icon={CheckCircle}
                color="green"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {avaliacoes.map((avaliacao) => (
                    <div
                      key={avaliacao.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg"
                    >
                      <img
                        src={avaliacao.imovel.fotos[0]}
                        alt={avaliacao.imovel.titulo}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold">{avaliacao.imovel.titulo}</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < avaliacao.nota
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge
                              variant={
                                avaliacao.aprovada ? "default" : "secondary"
                              }
                            >
                              {avaliacao.aprovada ? "APROVADA" : "PENDENTE"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {avaliacao.comentario}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {avaliacao.data.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buscas Salvas */}
          <TabsContent value="buscas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Buscas Salvas</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Busca
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Buscas Ativas"
                value={buscasSalvas.filter((b) => b.alertasAtivos).length}
                icon={Bell}
                color="blue"
              />
              <StatsCard
                title="Total Salvas"
                value={stats.buscasSalvas}
                icon={BookmarkPlus}
                color="green"
              />
              <StatsCard
                title="Novos Resultados"
                value="12"
                icon={Target}
                color="orange"
                description="Última semana"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Suas Buscas Salvas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buscasSalvas.map((busca) => (
                    <div
                      key={busca.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-bold">{busca.nome}</h3>
                          <Badge
                            variant={
                              busca.alertasAtivos ? "default" : "secondary"
                            }
                          >
                            {busca.alertasAtivos ? "ALERTAS ATIVOS" : "PAUSADO"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {busca.filtros.tipo && (
                            <Badge variant="outline">
                              {busca.filtros.tipo}
                            </Badge>
                          )}
                          {busca.filtros.finalidade && (
                            <Badge variant="outline">
                              {busca.filtros.finalidade}
                            </Badge>
                          )}
                          {busca.filtros.bairro && (
                            <Badge variant="outline">
                              {busca.filtros.bairro}
                            </Badge>
                          )}
                          {busca.filtros.quartos && (
                            <Badge variant="outline">
                              {busca.filtros.quartos} quartos
                            </Badge>
                          )}
                          {busca.filtros.precoMin && busca.filtros.precoMax && (
                            <Badge variant="outline">
                              {formatarPreco(busca.filtros.precoMin)} -{" "}
                              {formatarPreco(busca.filtros.precoMax)}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Criada em {busca.criadaEm.toLocaleDateString("pt-BR")}
                          {busca.ultimaNotificacao && (
                            <>
                              {" "}
                              • Última notificação:{" "}
                              {busca.ultimaNotificacao.toLocaleDateString(
                                "pt-BR",
                              )}
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recentemente Vistos */}
          <TabsContent value="vistos" className="space-y-6">
            <h2 className="text-2xl font-bold">Recentemente Visualizados</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentementeVistos.map((imovel) => (
                <Card
                  key={imovel.id}
                  className="border-0 shadow-lg overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={imovel.fotos[0]}
                      alt={imovel.titulo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="default">{imovel.finalidade}</Badge>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <p className="text-white text-xs bg-black/60 rounded px-2 py-1">
                        Visto há 2 dias
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{imovel.titulo}</h3>
                    <p className="text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {imovel.endereco}, {imovel.bairro}
                    </p>

                    <div className="flex items-center space-x-4 mb-4 text-sm">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {imovel.quartos} quartos
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {imovel.banheiros} banheiros
                      </div>
                      {imovel.vagas && (
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-1" />
                          {imovel.vagas} vagas
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-primary">
                        {formatarPreco(imovel.preco)}
                      </p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <h2 className="text-2xl font-bold">Meu Perfil</h2>

            {/* Configurações de Perfil */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input defaultValue="João da Silva" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue="joao@email.com" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input defaultValue="(62) 9 9999-8888" />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input defaultValue="000.000.000-00" />
                  </div>
                </div>
                <Button>Salvar Alterações</Button>
              </CardContent>
            </Card>

            {/* Preferências */}
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Busca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo Preferido</Label>
                    <Select defaultValue="APARTAMENTO">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASA">Casa</SelectItem>
                        <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                        <SelectItem value="TERRENO">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Finalidade</Label>
                    <Select defaultValue="VENDA">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VENDA">Venda</SelectItem>
                        <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Faixa de Preço Mínima</Label>
                    <Input placeholder="R$ 200.000" />
                  </div>
                  <div>
                    <Label>Faixa de Preço Máxima</Label>
                    <Input placeholder="R$ 800.000" />
                  </div>
                  <div>
                    <Label>Bairros de Interesse</Label>
                    <Textarea
                      placeholder="Setor Bueno, Jardim Goiás, Centro..."
                      rows={3}
                    />
                  </div>
                </div>
                <Button>Salvar Preferências</Button>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novos Imóveis</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificação quando houver novos imóveis que
                      correspondam às suas buscas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mudanças de Preço</p>
                    <p className="text-sm text-muted-foreground">
                      Ser notificado quando imóveis favoritos tiverem mudança de
                      preço
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembretes de Visita</p>
                    <p className="text-sm text-muted-foreground">
                      Receber lembretes sobre visitas agendadas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Newsletter</p>
                    <p className="text-sm text-muted-foreground">
                      Receber newsletter semanal com dicas e novidades do
                      mercado
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Comparador */}
      <ComparadorModal
        isOpen={showComparador}
        onClose={() => setShowComparador(false)}
        imoveis={[...favoritos, ...recentementeVistos]}
      />
    </div>
  );
}
