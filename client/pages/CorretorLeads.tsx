import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  X,
  ArrowLeft,
  Plus,
  Calendar,
  Target,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  mensagem: string;
  origem: string;
  status: string;
  imovelId?: string;
  imovelTitulo?: string;
  criadoEm: Date;
  ultimoContato?: Date;
  observacoes?: string;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = "primary",
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  color?: string;
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
      </CardContent>
    </Card>
  );
}

export default function CorretorLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroOrigem, setFiltroOrigem] = useState("TODAS");
  const [busca, setBusca] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    carregarLeads();
  }, []);

  const carregarLeads = async () => {
    try {
      // Dados simulados mais robustos
      const leadsSimulados: Lead[] = [
        {
          id: "1",
          nome: "Maria Oliveira",
          telefone: "(62) 9 8765-4321",
          email: "maria@email.com",
          mensagem:
            "Interessada em apartamento no Setor Bueno, 3 quartos, até R$ 600.000",
          origem: "SITE",
          status: "PENDENTE",
          imovelTitulo: "Apartamento Moderno no Setor Bueno",
          criadoEm: new Date("2025-01-06T10:30:00"),
          observacoes: "Primeira compra, precisa de financiamento",
        },
        {
          id: "2",
          nome: "Carlos Santos",
          telefone: "(62) 9 9876-5432",
          email: "carlos@email.com",
          mensagem:
            "Procuro casa com piscina no Jardim Goiás para família grande",
          origem: "WHATSAPP",
          status: "ASSUMIDO",
          criadoEm: new Date("2025-01-05T14:20:00"),
          ultimoContato: new Date("2025-01-06T09:15:00"),
          observacoes:
            "Cliente muito interessado, tem condições de pagamento à vista",
        },
        {
          id: "3",
          nome: "Ana Costa",
          telefone: "(62) 9 7777-8888",
          email: "ana@email.com",
          mensagem: "Preciso de apartamento para alugar próximo ao centro",
          origem: "TELEFONE",
          status: "CONVERTIDO",
          criadoEm: new Date("2025-01-04T16:45:00"),
          ultimoContato: new Date("2025-01-05T11:30:00"),
          observacoes: "Contrato assinado, entrega em 15 dias",
        },
        {
          id: "4",
          nome: "Pedro Silva",
          telefone: "(62) 9 6666-7777",
          mensagem: "Quero investir em imóveis para renda",
          origem: "FACEBOOK",
          status: "ASSUMIDO",
          criadoEm: new Date("2025-01-03T08:15:00"),
          ultimoContato: new Date("2025-01-06T14:00:00"),
          observacoes: "Investidor experiente, busca rentabilidade acima de 6%",
        },
        {
          id: "5",
          nome: "Joana Pereira",
          telefone: "(62) 9 5555-6666",
          email: "joana@email.com",
          mensagem: "Primeira casa própria, preciso de orientação completa",
          origem: "INSTAGRAM",
          status: "PENDENTE",
          criadoEm: new Date("2025-01-02T12:30:00"),
        },
        {
          id: "6",
          nome: "Roberto Lima",
          telefone: "(62) 9 4444-5555",
          mensagem: "Casa no Jardim América, orçamento até 800k",
          origem: "INDICACAO",
          status: "EXPIRADO",
          criadoEm: new Date("2024-12-28T15:20:00"),
          observacoes: "Cliente não respondeu após 3 tentativas de contato",
        },
      ];

      setLeads(leadsSimulados);
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const leadsFiltrados = leads.filter((lead) => {
    const matchStatus =
      filtroStatus === "TODOS" || lead.status === filtroStatus;
    const matchOrigem =
      filtroOrigem === "TODAS" || lead.origem === filtroOrigem;
    const matchBusca =
      busca === "" ||
      lead.nome.toLowerCase().includes(busca.toLowerCase()) ||
      lead.telefone.includes(busca) ||
      lead.mensagem.toLowerCase().includes(busca.toLowerCase());

    return matchStatus && matchOrigem && matchBusca;
  });

  const getLeadsByTab = () => {
    switch (activeTab) {
      case "pendentes":
        return leadsFiltrados.filter((lead) => lead.status === "PENDENTE");
      case "assumidos":
        return leadsFiltrados.filter((lead) => lead.status === "ASSUMIDO");
      case "convertidos":
        return leadsFiltrados.filter((lead) => lead.status === "CONVERTIDO");
      default:
        return leadsFiltrados;
    }
  };

  const stats = {
    total: leads.length,
    pendentes: leads.filter((l) => l.status === "PENDENTE").length,
    assumidos: leads.filter((l) => l.status === "ASSUMIDO").length,
    convertidos: leads.filter((l) => l.status === "CONVERTIDO").length,
    expirados: leads.filter((l) => l.status === "EXPIRADO").length,
    taxaConversao:
      leads.length > 0
        ? Math.round(
            (leads.filter((l) => l.status === "CONVERTIDO").length /
              leads.length) *
              100,
          )
        : 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return "secondary";
      case "ASSUMIDO":
        return "default";
      case "CONVERTIDO":
        return "success";
      case "EXPIRADO":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getOrigemColor = (origem: string) => {
    switch (origem) {
      case "SITE":
        return "blue";
      case "WHATSAPP":
        return "green";
      case "TELEFONE":
        return "purple";
      case "FACEBOOK":
        return "blue";
      case "INSTAGRAM":
        return "pink";
      case "INDICACAO":
        return "yellow";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/corretor">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestão de Leads
              </h1>
              <p className="text-muted-foreground">
                Gerencie todos os seus leads de forma eficiente
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=250"
              alt="Siqueira Campos Imóveis"
              className="h-12 w-auto dark:hidden"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard
            title="Total"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Pendentes"
            value={stats.pendentes}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Assumidos"
            value={stats.assumidos}
            icon={Activity}
            color="blue"
          />
          <StatsCard
            title="Convertidos"
            value={stats.convertidos}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Expirados"
            value={stats.expirados}
            icon={X}
            color="red"
          />
          <StatsCard
            title="Taxa Conversão"
            value={`${stats.taxaConversao}%`}
            icon={Target}
            color="purple"
          />
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Buscar por nome, telefone ou mensagem..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os Status</SelectItem>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="ASSUMIDO">Assumido</SelectItem>
                    <SelectItem value="CONVERTIDO">Convertido</SelectItem>
                    <SelectItem value="EXPIRADO">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas as Origens</SelectItem>
                    <SelectItem value="SITE">Site</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="TELEFONE">Telefone</SelectItem>
                    <SelectItem value="FACEBOOK">Facebook</SelectItem>
                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                    <SelectItem value="INDICACAO">Indicação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs com Leads */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todos">Todos ({stats.total})</TabsTrigger>
            <TabsTrigger value="pendentes">
              Pendentes ({stats.pendentes})
            </TabsTrigger>
            <TabsTrigger value="assumidos">
              Assumidos ({stats.assumidos})
            </TabsTrigger>
            <TabsTrigger value="convertidos">
              Convertidos ({stats.convertidos})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "todos" && "Todos os Leads"}
                  {activeTab === "pendentes" && "Leads Pendentes"}
                  {activeTab === "assumidos" && "Leads Assumidos"}
                  {activeTab === "convertidos" && "Leads Convertidos"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getLeadsByTab().map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-lg">{lead.nome}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {lead.telefone}
                                </span>
                                {lead.email && (
                                  <span className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {lead.email}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {lead.criadoEm.toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={getStatusColor(lead.status) as any}
                              >
                                {lead.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-${getOrigemColor(lead.origem)}-600`}
                              >
                                {lead.origem}
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">
                              Mensagem:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {lead.mensagem}
                            </p>
                          </div>

                          {lead.imovelTitulo && (
                            <div className="mb-3">
                              <p className="text-sm font-medium">
                                Imóvel de Interesse:
                              </p>
                              <p className="text-sm text-primary">
                                {lead.imovelTitulo}
                              </p>
                            </div>
                          )}

                          {lead.observacoes && (
                            <div className="mb-3">
                              <p className="text-sm font-medium">
                                Observações:
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lead.observacoes}
                              </p>
                            </div>
                          )}

                          {lead.ultimoContato && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Último contato:{" "}
                                {lead.ultimoContato.toLocaleDateString("pt-BR")}{" "}
                                às{" "}
                                {lead.ultimoContato.toLocaleTimeString(
                                  "pt-BR",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Ligar
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  ))}

                  {getLeadsByTab().length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        Nenhum lead encontrado com os filtros aplicados
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
