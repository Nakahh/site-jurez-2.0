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
  Users,
  UserPlus,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Share2,
  Download,
  Settings,
  Zap,
  Brain,
  Bot,
} from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  endereco?: string;
  cidade: string;
  estado: string;
  status: "LEAD" | "PROSPECT" | "CLIENTE" | "INATIVO";
  origem: string;
  dataRegistro: Date;
  ultimoContato: Date;
  proximoFollowUp?: Date;
  scoreEngajamento: number;
  valorPotencial: number;
  etapaFunil: string;
  interesses: string[];
  observacoes?: string;
  corretor?: string;
  historico: InteracaoHistorico[];
  tags: string[];
}

interface InteracaoHistorico {
  id: string;
  tipo: "LIGACAO" | "EMAIL" | "WHATSAPP" | "VISITA" | "REUNIAO" | "PROPOSTA";
  descricao: string;
  data: Date;
  usuario: string;
  resultado: "POSITIVO" | "NEGATIVO" | "NEUTRO";
  proximaAcao?: string;
}

interface FunilVendas {
  etapa: string;
  quantidade: number;
  valor: number;
  taxaConversao: number;
  tempoMedio: number;
}

interface CampanhaMarketing {
  id: string;
  nome: string;
  tipo: "EMAIL" | "SMS" | "WHATSAPP" | "PUSH" | "SOCIAL_MEDIA";
  status: "RASCUNHO" | "ATIVA" | "PAUSADA" | "CONCLUIDA";
  segmento: string[];
  mensagem: string;
  dataInicio: Date;
  dataFim: Date;
  enviados: number;
  abertos: number;
  cliques: number;
  conversoes: number;
  investimento: number;
  roi: number;
}

interface AutomacaoWorkflow {
  id: string;
  nome: string;
  trigger: string;
  condicoes: string[];
  acoes: string[];
  ativo: boolean;
  execucoes: number;
  sucessos: number;
  criadoEm: Date;
}

const dadosFunil: FunilVendas[] = [
  {
    etapa: "Lead",
    quantidade: 150,
    valor: 2250000,
    taxaConversao: 100,
    tempoMedio: 0,
  },
  {
    etapa: "Qualificado",
    quantidade: 89,
    valor: 1780000,
    taxaConversao: 59.3,
    tempoMedio: 3.2,
  },
  {
    etapa: "Apresentação",
    quantidade: 45,
    valor: 1125000,
    taxaConversao: 50.6,
    tempoMedio: 8.5,
  },
  {
    etapa: "Proposta",
    quantidade: 28,
    valor: 840000,
    taxaConversao: 62.2,
    tempoMedio: 12.3,
  },
  {
    etapa: "Negociação",
    quantidade: 18,
    valor: 540000,
    taxaConversao: 64.3,
    tempoMedio: 18.7,
  },
  {
    etapa: "Fechado",
    quantidade: 12,
    valor: 420000,
    taxaConversao: 66.7,
    tempoMedio: 25.4,
  },
];

const performanceMensal = [
  { mes: "Jan", leadsNovos: 45, conversoes: 8, vendas: 12 },
  { mes: "Fev", leadsNovos: 52, conversoes: 10, vendas: 15 },
  { mes: "Mar", leadsNovos: 38, conversoes: 12, vendas: 18 },
  { mes: "Abr", leadsNovos: 67, conversoes: 15, vendas: 22 },
  { mes: "Mai", leadsNovos: 78, conversoes: 18, vendas: 25 },
  { mes: "Jun", leadsNovos: 65, conversoes: 20, vendas: 28 },
];

export default function AdvancedCRM() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [campanhas, setCampanhas] = useState<CampanhaMarketing[]>([]);
  const [automacoes, setAutomacoes] = useState<AutomacaoWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
    origem: "",
    interesse: "",
    observacoes: "",
  });

  const [novaCampanha, setNovaCampanha] = useState({
    nome: "",
    tipo: "EMAIL",
    segmento: "",
    mensagem: "",
    dataInicio: "",
    dataFim: "",
  });

  const [filtros, setFiltros] = useState({
    status: "",
    origem: "",
    etapa: "",
    corretor: "",
    busca: "",
  });

  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalNovaCampanha, setModalNovaCampanha] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null,
  );

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        const clientesSimulados: Cliente[] = [
          {
            id: "1",
            nome: "João Silva",
            email: "joao@email.com",
            telefone: "(62) 99999-9999",
            cpf: "123.456.789-00",
            cidade: "Goiânia",
            estado: "GO",
            status: "PROSPECT",
            origem: "SITE",
            dataRegistro: new Date(),
            ultimoContato: new Date(),
            scoreEngajamento: 85,
            valorPotencial: 450000,
            etapaFunil: "Qualificado",
            interesses: ["APARTAMENTO", "SETOR_BUENO"],
            corretor: "Maria Santos",
            historico: [
              {
                id: "h1",
                tipo: "LIGACAO",
                descricao: "Primeiro contato - muito interessado",
                data: new Date(),
                usuario: "Maria Santos",
                resultado: "POSITIVO",
                proximaAcao: "Agendar visita",
              },
            ],
            tags: ["VIP", "URGENTE"],
          },
        ];

        const campanhasSimuladas: CampanhaMarketing[] = [
          {
            id: "1",
            nome: "Newsletter Semanal",
            tipo: "EMAIL",
            status: "ATIVA",
            segmento: ["TODOS"],
            mensagem: "Novos lançamentos esta semana...",
            dataInicio: new Date(),
            dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            enviados: 1250,
            abertos: 425,
            cliques: 78,
            conversoes: 12,
            investimento: 500,
            roi: 240,
          },
        ];

        const automacoesSimuladas: AutomacaoWorkflow[] = [
          {
            id: "1",
            nome: "Welcome Series - Novos Leads",
            trigger: "NOVO_LEAD",
            condicoes: ["origem = SITE", "interesse = APARTAMENTO"],
            acoes: [
              "ENVIAR_EMAIL_BOAS_VINDAS",
              "AGENDAR_LIGACAO_2_DIAS",
              "ADICIONAR_TAG_APARTAMENTO",
            ],
            ativo: true,
            execucoes: 145,
            sucessos: 132,
            criadoEm: new Date(),
          },
        ];

        setClientes(clientesSimulados);
        setCampanhas(campanhasSimuladas);
        setAutomacoes(automacoesSimuladas);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const criarCliente = async () => {
    try {
      const novoClienteData: Cliente = {
        id: Date.now().toString(),
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
        cidade: "Goiânia",
        estado: "GO",
        status: "LEAD",
        origem: novoCliente.origem,
        dataRegistro: new Date(),
        ultimoContato: new Date(),
        scoreEngajamento: 0,
        valorPotencial: 0,
        etapaFunil: "Lead",
        interesses: novoCliente.interesse ? [novoCliente.interesse] : [],
        observacoes: novoCliente.observacoes,
        historico: [],
        tags: [],
      };

      setClientes([novoClienteData, ...clientes]);
      setModalNovoCliente(false);
      resetFormularioCliente();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    }
  };

  const criarCampanha = async () => {
    try {
      const novaCampanhaData: CampanhaMarketing = {
        id: Date.now().toString(),
        nome: novaCampanha.nome,
        tipo: novaCampanha.tipo as any,
        status: "RASCUNHO",
        segmento: [novaCampanha.segmento],
        mensagem: novaCampanha.mensagem,
        dataInicio: new Date(novaCampanha.dataInicio),
        dataFim: new Date(novaCampanha.dataFim),
        enviados: 0,
        abertos: 0,
        cliques: 0,
        conversoes: 0,
        investimento: 0,
        roi: 0,
      };

      setCampanhas([novaCampanhaData, ...campanhas]);
      setModalNovaCampanha(false);
      resetFormularioCampanha();
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
    }
  };

  const resetFormularioCliente = () => {
    setNovoCliente({
      nome: "",
      email: "",
      telefone: "",
      origem: "",
      interesse: "",
      observacoes: "",
    });
  };

  const resetFormularioCampanha = () => {
    setNovaCampanha({
      nome: "",
      tipo: "EMAIL",
      segmento: "",
      mensagem: "",
      dataInicio: "",
      dataFim: "",
    });
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LEAD":
        return <Badge className="bg-blue-100 text-blue-800">Lead</Badge>;
      case "PROSPECT":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Prospect</Badge>
        );
      case "CLIENTE":
        return <Badge className="bg-green-100 text-green-800">Cliente</Badge>;
      case "INATIVO":
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCampanhaStatusBadge = (status: string) => {
    switch (status) {
      case "RASCUNHO":
        return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case "ATIVA":
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case "PAUSADA":
        return <Badge className="bg-yellow-100 text-yellow-800">Pausada</Badge>;
      case "CONCLUIDA":
        return <Badge className="bg-blue-100 text-blue-800">Concluída</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calcularTaxaAbertura = (campanha: CampanhaMarketing) => {
    return campanha.enviados > 0
      ? ((campanha.abertos / campanha.enviados) * 100).toFixed(1)
      : "0";
  };

  const calcularTaxaClique = (campanha: CampanhaMarketing) => {
    return campanha.abertos > 0
      ? ((campanha.cliques / campanha.abertos) * 100).toFixed(1)
      : "0";
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    return (
      (!filtros.status || cliente.status === filtros.status) &&
      (!filtros.origem || cliente.origem === filtros.origem) &&
      (!filtros.etapa || cliente.etapaFunil === filtros.etapa) &&
      (!filtros.corretor || cliente.corretor === filtros.corretor) &&
      (!filtros.busca ||
        cliente.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        cliente.email.toLowerCase().includes(filtros.busca.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Carregando CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CRM Avançado</h2>
          <p className="text-slate-600">
            Gestão completa de relacionamento com clientes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Bot className="w-4 h-4 mr-2" />
            Automação
          </Button>
          <Dialog open={modalNovoCliente} onOpenChange={setModalNovoCliente}>
            <DialogTrigger asChild>
              <Button className="bg-slate-600 hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      placeholder="João Silva"
                      value={novoCliente.nome}
                      onChange={(e) =>
                        setNovoCliente({ ...novoCliente, nome: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="joao@email.com"
                      value={novoCliente.email}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      placeholder="(62) 99999-9999"
                      value={novoCliente.telefone}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          telefone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="origem">Origem</Label>
                    <Select
                      value={novoCliente.origem}
                      onValueChange={(value) =>
                        setNovoCliente({ ...novoCliente, origem: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SITE">Site</SelectItem>
                        <SelectItem value="FACEBOOK">Facebook</SelectItem>
                        <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                        <SelectItem value="GOOGLE">Google</SelectItem>
                        <SelectItem value="INDICACAO">Indicação</SelectItem>
                        <SelectItem value="WALK_IN">Walk-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="interesse">Interesse Principal</Label>
                    <Select
                      value={novoCliente.interesse}
                      onValueChange={(value) =>
                        setNovoCliente({ ...novoCliente, interesse: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de imóvel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                        <SelectItem value="CASA">Casa</SelectItem>
                        <SelectItem value="KITNET">Kitnet</SelectItem>
                        <SelectItem value="COBERTURA">Cobertura</SelectItem>
                        <SelectItem value="COMERCIAL">Comercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Informações adicionais sobre o cliente"
                      value={novoCliente.observacoes}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          observacoes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setModalNovoCliente(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={criarCliente}
                    disabled={!novoCliente.nome || !novoCliente.email}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Cliente
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
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
            <p className="text-xs text-slate-600">+12% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Ativos</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientes.filter((c) => c.status === "LEAD").length}
            </div>
            <p className="text-xs text-slate-600">Novos hoje: 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-slate-600">Lead → Cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV Médio</CardTitle>
            <Star className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarValor(485000)}</div>
            <p className="text-xs text-slate-600">Lifetime Value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clientes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="funil">Funil de Vendas</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="automacao">Automação</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="busca">Buscar</Label>
                  <Input
                    id="busca"
                    placeholder="Nome ou e-mail"
                    value={filtros.busca}
                    onChange={(e) =>
                      setFiltros({ ...filtros, busca: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="statusFiltro">Status</Label>
                  <Select
                    value={filtros.status}
                    onValueChange={(value) =>
                      setFiltros({ ...filtros, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="PROSPECT">Prospect</SelectItem>
                      <SelectItem value="CLIENTE">Cliente</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="origemFiltro">Origem</Label>
                  <Select
                    value={filtros.origem}
                    onValueChange={(value) =>
                      setFiltros({ ...filtros, origem: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="SITE">Site</SelectItem>
                      <SelectItem value="FACEBOOK">Facebook</SelectItem>
                      <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                      <SelectItem value="GOOGLE">Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="etapaFiltro">Etapa Funil</Label>
                  <Select
                    value={filtros.etapa}
                    onValueChange={(value) =>
                      setFiltros({ ...filtros, etapa: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Qualificado">Qualificado</SelectItem>
                      <SelectItem value="Apresentação">Apresentação</SelectItem>
                      <SelectItem value="Proposta">Proposta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="corretorFiltro">Corretor</Label>
                  <Select
                    value={filtros.corretor}
                    onValueChange={(value) =>
                      setFiltros({ ...filtros, corretor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                      <SelectItem value="João Oliveira">
                        João Oliveira
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFiltros({
                        status: "",
                        origem: "",
                        etapa: "",
                        corretor: "",
                        busca: "",
                      })
                    }
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Clientes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Clientes ({clientesFiltrados.length} de {clientes.length})
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Campanha
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Valor Potencial</TableHead>
                    <TableHead>Último Contato</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cliente.nome}</p>
                          <p className="text-sm text-slate-600">
                            {cliente.email}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            {cliente.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(cliente.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cliente.etapaFunil}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={cliente.scoreEngajamento}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {cliente.scoreEngajamento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cliente.valorPotencial > 0
                          ? formatarValor(cliente.valorPotencial)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {cliente.ultimoContato.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setClienteSelecionado(cliente)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funil" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Funil de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dadosFunil} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="etapa" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="leadsNovos"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversoes"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="vendas"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Taxa Conversão</TableHead>
                    <TableHead>Tempo Médio</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosFunil.map((etapa) => (
                    <TableRow key={etapa.etapa}>
                      <TableCell className="font-medium">
                        {etapa.etapa}
                      </TableCell>
                      <TableCell>{etapa.quantidade}</TableCell>
                      <TableCell>{formatarValor(etapa.valor)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            etapa.taxaConversao > 60
                              ? "bg-green-100 text-green-800"
                              : etapa.taxaConversao > 40
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {etapa.taxaConversao.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{etapa.tempoMedio} dias</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Analisar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campanhas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Campanhas de Marketing</h3>
            <Dialog
              open={modalNovaCampanha}
              onOpenChange={setModalNovaCampanha}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Campanha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nomeCampanha">Nome da Campanha</Label>
                      <Input
                        id="nomeCampanha"
                        placeholder="Newsletter Semanal"
                        value={novaCampanha.nome}
                        onChange={(e) =>
                          setNovaCampanha({
                            ...novaCampanha,
                            nome: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipoCampanha">Tipo</Label>
                      <Select
                        value={novaCampanha.tipo}
                        onValueChange={(value) =>
                          setNovaCampanha({ ...novaCampanha, tipo: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMAIL">E-mail</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          <SelectItem value="PUSH">
                            Push Notification
                          </SelectItem>
                          <SelectItem value="SOCIAL_MEDIA">
                            Redes Sociais
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="segmentoCampanha">Segmento</Label>
                      <Select
                        value={novaCampanha.segmento}
                        onValueChange={(value) =>
                          setNovaCampanha({ ...novaCampanha, segmento: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar segmento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODOS">Todos</SelectItem>
                          <SelectItem value="LEADS">Apenas Leads</SelectItem>
                          <SelectItem value="PROSPECTS">Prospects</SelectItem>
                          <SelectItem value="CLIENTES">Clientes</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dataInicioCampanha">Data Início</Label>
                      <Input
                        id="dataInicioCampanha"
                        type="datetime-local"
                        value={novaCampanha.dataInicio}
                        onChange={(e) =>
                          setNovaCampanha({
                            ...novaCampanha,
                            dataInicio: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="mensagemCampanha">Mensagem</Label>
                    <Textarea
                      id="mensagemCampanha"
                      placeholder="Conteúdo da campanha..."
                      rows={4}
                      value={novaCampanha.mensagem}
                      onChange={(e) =>
                        setNovaCampanha({
                          ...novaCampanha,
                          mensagem: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setModalNovaCampanha(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={criarCampanha}
                      disabled={!novaCampanha.nome || !novaCampanha.mensagem}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Criar Campanha
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
                    <TableHead>Campanha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviados</TableHead>
                    <TableHead>Taxa Abertura</TableHead>
                    <TableHead>Taxa Clique</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campanhas.map((campanha) => (
                    <TableRow key={campanha.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campanha.nome}</p>
                          <p className="text-sm text-slate-600">
                            Segmento: {campanha.segmento.join(", ")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{campanha.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        {getCampanhaStatusBadge(campanha.status)}
                      </TableCell>
                      <TableCell>{campanha.enviados}</TableCell>
                      <TableCell>{calcularTaxaAbertura(campanha)}%</TableCell>
                      <TableCell>{calcularTaxaClique(campanha)}%</TableCell>
                      <TableCell>
                        <span
                          className={
                            campanha.roi > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {campanha.roi > 0 ? "+" : ""}
                          {campanha.roi}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automacao" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Automações e Workflows</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Automação
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Automação</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execuções</TableHead>
                    <TableHead>Taxa Sucesso</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automacoes.map((automacao) => (
                    <TableRow key={automacao.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{automacao.nome}</p>
                          <p className="text-sm text-slate-600">
                            {automacao.acoes.length} ações configuradas
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{automacao.trigger}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            automacao.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {automacao.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>{automacao.execucoes}</TableCell>
                      <TableCell>
                        {(
                          (automacao.sucessos / automacao.execucoes) *
                          100
                        ).toFixed(1)}
                        %
                      </TableCell>
                      <TableCell>
                        {automacao.criadoEm.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Origem dos Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Site:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-24 h-2" />
                      <span className="font-semibold">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Facebook:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={25} className="w-24 h-2" />
                      <span className="font-semibold">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Instagram:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={15} className="w-24 h-2" />
                      <span className="font-semibold">15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Google:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={10} className="w-24 h-2" />
                      <span className="font-semibold">10%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Indicação:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={5} className="w-24 h-2" />
                      <span className="font-semibold">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Chave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">CAC (Custo Aquisição):</span>
                  <span className="font-semibold">{formatarValor(1250)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">LTV (Lifetime Value):</span>
                  <span className="font-semibold">{formatarValor(485000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ratio LTV/CAC:</span>
                  <span className="font-semibold text-green-600">388:1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tempo Médio Conversão:</span>
                  <span className="font-semibold">25.4 dias</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">Churn Rate:</span>
                  <span className="font-semibold">2.8%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  <span>Exportar Clientes</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  <span>Relatório Detalhado</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Send className="w-6 h-6 mb-2" />
                  <span>Campanha Massa</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Settings className="w-6 h-6 mb-2" />
                  <span>Configurar KPIs</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
