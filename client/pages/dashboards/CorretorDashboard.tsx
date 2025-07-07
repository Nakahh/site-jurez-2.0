import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Home,
  MessageSquare,
  DollarSign,
  Phone,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  TrendingUp,
  Activity,
  Smartphone,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Target,
  BarChart3,
  FileText,
  Settings,
  Bell,
  UserPlus,
  PlusCircle,
  CalendarDays,
  CheckSquare,
  Star,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";

// Types
interface CorretorStats {
  totalImoveis: number;
  imoveisDisponiveis: number;
  imoveisVendidos: number;
  imoveisAlugados: number;
  meusLeads: number;
  leadsAtivos: number;
  leadsConvertidos: number;
  visitasAgendadas: number;
  visitasRealizadas: number;
  minhasComissoes: number;
  comissoesTotais: number;
  metaMensal: number;
  vendaMes: number;
}

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  mensagem: string;
  origem: string;
  status: string;
  imovelId?: string;
  criadoEm: Date;
}

interface Imovel {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  status: string;
  fotos?: string[];
  criadoEm: Date;
}

interface Agendamento {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  imovelTitulo: string;
  imovelEndereco: string;
  dataHora: Date;
  status: string;
  observacoes?: string;
}

// Components
function WhatsAppIntegrationCard({ onUpdate }: { onUpdate: () => void }) {
  const [whatsapp, setWhatsapp] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/corretor/info", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWhatsapp(data.whatsapp || "");
        setAtivo(data.ativo);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/corretor/whatsapp", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ whatsapp, ativo }),
      });

      if (response.ok) {
        setMessage("Configurações salvas com sucesso!");
        onUpdate();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao salvar configurações");
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatarWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    }
    return numbers;
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          <span>Integração WhatsApp</span>
          <Badge variant={ativo ? "default" : "secondary"}>
            {ativo ? "ATIVO" : "INATIVO"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="whatsapp" className="text-sm font-medium">
              Número do WhatsApp
            </Label>
            <Input
              id="whatsapp"
              placeholder="(62) 9 8556-3505"
              value={formatarWhatsApp(whatsapp)}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div>
              <Label className="text-sm font-medium">
                Status para receber leads
              </Label>
              <p className="text-xs text-muted-foreground">
                Quando ativo, você receberá novos leads automaticamente
              </p>
            </div>
            <Switch
              checked={ativo}
              onCheckedChange={setAtivo}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || !whatsapp}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCard({
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

// Modal para criar imóvel
function CriarImovelModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    finalidade: "",
    preco: "",
    area: "",
    quartos: "",
    banheiros: "",
    vagas: "",
    endereco: "",
    bairro: "",
    cidade: "Goiânia",
    estado: "GO",
    cep: "",
    descricao: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/imoveis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco),
          area: parseFloat(formData.area),
          quartos: parseInt(formData.quartos),
          banheiros: parseInt(formData.banheiros),
          vagas: formData.vagas ? parseInt(formData.vagas) : 0,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          titulo: "",
          tipo: "",
          finalidade: "",
          preco: "",
          area: "",
          quartos: "",
          banheiros: "",
          vagas: "",
          endereco: "",
          bairro: "",
          cidade: "Goiânia",
          estado: "GO",
          cep: "",
          descricao: "",
        });
      }
    } catch (error) {
      console.error("Erro ao criar imóvel:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Cadastrar Novo Imóvel</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="titulo">Título do Imóvel</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                placeholder="Ex: Apartamento moderno no Setor Bueno"
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASA">Casa</SelectItem>
                  <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                  <SelectItem value="TERRENO">Terreno</SelectItem>
                  <SelectItem value="COMERCIAL">Comercial</SelectItem>
                  <SelectItem value="RURAL">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="finalidade">Finalidade</Label>
              <Select
                value={formData.finalidade}
                onValueChange={(value) =>
                  setFormData({ ...formData, finalidade: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a finalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VENDA">Venda</SelectItem>
                  <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                  <SelectItem value="AMBOS">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                type="number"
                value={formData.preco}
                onChange={(e) =>
                  setFormData({ ...formData, preco: e.target.value })
                }
                placeholder="Ex: 450000"
                required
              />
            </div>

            <div>
              <Label htmlFor="area">Área (m²)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                placeholder="Ex: 120.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="quartos">Quartos</Label>
              <Input
                id="quartos"
                type="number"
                value={formData.quartos}
                onChange={(e) =>
                  setFormData({ ...formData, quartos: e.target.value })
                }
                placeholder="Ex: 3"
                required
              />
            </div>

            <div>
              <Label htmlFor="banheiros">Banheiros</Label>
              <Input
                id="banheiros"
                type="number"
                value={formData.banheiros}
                onChange={(e) =>
                  setFormData({ ...formData, banheiros: e.target.value })
                }
                placeholder="Ex: 2"
                required
              />
            </div>

            <div>
              <Label htmlFor="vagas">Vagas de Garagem</Label>
              <Input
                id="vagas"
                type="number"
                value={formData.vagas}
                onChange={(e) =>
                  setFormData({ ...formData, vagas: e.target.value })
                }
                placeholder="Ex: 2"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) =>
                  setFormData({ ...formData, endereco: e.target.value })
                }
                placeholder="Ex: Rua T-30, 1234"
                required
              />
            </div>

            <div>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) =>
                  setFormData({ ...formData, bairro: e.target.value })
                }
                placeholder="Ex: Setor Bueno"
                required
              />
            </div>

            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) =>
                  setFormData({ ...formData, cep: e.target.value })
                }
                placeholder="Ex: 74210-060"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Descreva as características e diferenciais do imóvel..."
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Imóvel"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para cadastrar lead
function CadastrarLeadModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    mensagem: "",
    origem: "MANUAL",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          nome: "",
          telefone: "",
          email: "",
          mensagem: "",
          origem: "MANUAL",
        });
      }
    } catch (error) {
      console.error("Erro ao cadastrar lead:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Cadastrar Novo Lead</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: João da Silva"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
              placeholder="Ex: (62) 9 8556-3505"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ex: joao@email.com"
            />
          </div>

          <div>
            <Label htmlFor="origem">Origem</Label>
            <Select
              value={formData.origem}
              onValueChange={(value) =>
                setFormData({ ...formData, origem: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Manual</SelectItem>
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
            <Label htmlFor="mensagem">Mensagem/Interesse</Label>
            <Textarea
              id="mensagem"
              value={formData.mensagem}
              onChange={(e) =>
                setFormData({ ...formData, mensagem: e.target.value })
              }
              placeholder="Descreva o interesse do cliente..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CorretorDashboard() {
  const [stats, setStats] = useState<CorretorStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCriarImovel, setShowCriarImovel] = useState(false);
  const [showCadastrarLead, setShowCadastrarLead] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const handleGeneratePerformanceReport = async () => {
    try {
      const performanceData = [
        {
          nome: "Vendas Dezembro",
          vendas: stats?.imoveisVendidos || 0,
          volume: 850000,
          comissao: 25500,
        },
        {
          nome: "Performance Mensal",
          vendas: stats?.leadsConvertidos || 0,
          volume: 650000,
          comissao: 19500,
        },
        {
          nome: "Meta vs Realizado",
          vendas: 5,
          volume: stats?.vendaMes || 0,
          comissao: stats?.minhasComissoes || 0,
        },
      ];

      const { generatePerformanceReport } = await import(
        "@/utils/pdfGenerator"
      );
      await generatePerformanceReport(performanceData);

      alert("Relatório de performance gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    }
  };

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Carregar dados simulados mais robustos
      const statsSimuladas: CorretorStats = {
        totalImoveis: 23,
        imoveisDisponiveis: 18,
        imoveisVendidos: 3,
        imoveisAlugados: 2,
        meusLeads: 45,
        leadsAtivos: 12,
        leadsConvertidos: 8,
        visitasAgendadas: 6,
        visitasRealizadas: 15,
        minhasComissoes: 45000,
        comissoesTotais: 125000,
        metaMensal: 50000,
        vendaMes: 38000,
      };

      const leadsSimulados: Lead[] = [
        {
          id: "1",
          nome: "Maria Oliveira",
          telefone: "(62) 9 8765-4321",
          email: "maria@email.com",
          mensagem: "Interessada em apartamento no Setor Bueno",
          origem: "SITE",
          status: "PENDENTE",
          criadoEm: new Date(),
        },
        {
          id: "2",
          nome: "Carlos Santos",
          telefone: "(62) 9 9876-5432",
          mensagem: "Procuro casa com piscina no Jardim Goiás",
          origem: "WHATSAPP",
          status: "ASSUMIDO",
          criadoEm: new Date(),
        },
      ];

      const imoveisSimulados: Imovel[] = [
        {
          id: "1",
          titulo: "Apartamento Moderno no Setor Bueno",
          tipo: "APARTAMENTO",
          finalidade: "VENDA",
          preco: 650000,
          quartos: 3,
          banheiros: 2,
          vagas: 2,
          endereco: "Rua T-30, 1234",
          bairro: "Setor Bueno",
          cidade: "Goiânia",
          status: "DISPONIVEL",
          criadoEm: new Date(),
        },
      ];

      const agendamentosSimulados: Agendamento[] = [
        {
          id: "1",
          clienteNome: "Ana Costa",
          clienteTelefone: "(62) 9 8888-7777",
          imovelTitulo: "Apartamento Setor Bueno",
          imovelEndereco: "Rua T-30, 1234",
          dataHora: new Date("2025-01-08T14:00:00"),
          status: "AGENDADA",
          observacoes: "Cliente preferiu horário da tarde",
        },
      ];

      setStats(statsSimuladas);
      setLeads(leadsSimulados);
      setImoveis(imoveisSimulados);
      setAgendamentos(agendamentosSimulados);
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
              Dashboard do Corretor
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus leads, imóveis e agenda de forma eficiente
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
              className="h-12 w-auto dark:hidden"
            />
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=250"
              alt="Siqueira Campos Imóveis"
              className="hidden h-12 w-auto dark:block"
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="imoveis">Imóveis</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="configuracoes">Config</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Meta Progress */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Meta Mensal</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatarPreco(stats?.vendaMes || 0)} de{" "}
                      {formatarPreco(stats?.metaMensal || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {stats
                        ? Math.round((stats.vendaMes / stats.metaMensal) * 100)
                        : 0}
                      %
                    </p>
                    <Badge variant="default">
                      {stats && stats.vendaMes >= stats.metaMensal
                        ? "META BATIDA!"
                        : "EM PROGRESSO"}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats ? Math.min((stats.vendaMes / stats.metaMensal) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Meus Imóveis"
                  value={stats.totalImoveis}
                  icon={Home}
                  description={`${stats.imoveisDisponiveis} disponíveis`}
                  trend={`+${stats.imoveisVendidos} vendidos este mês`}
                />
                <StatsCard
                  title="Leads Ativos"
                  value={stats.leadsAtivos}
                  icon={Users}
                  description={`${stats.leadsConvertidos} convertidos`}
                  trend={`${Math.round((stats.leadsConvertidos / stats.meusLeads) * 100)}% taxa de conversão`}
                  color="green"
                />
                <StatsCard
                  title="Comissões"
                  value={formatarPreco(stats.minhasComissoes)}
                  icon={DollarSign}
                  description="Este mês"
                  trend={`${formatarPreco(stats.comissoesTotais)} total`}
                  color="yellow"
                />
                <StatsCard
                  title="Visitas Agendadas"
                  value={stats.visitasAgendadas}
                  icon={Calendar}
                  description={`${stats.visitasRealizadas} realizadas`}
                  trend="Para esta semana"
                  color="purple"
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setShowCadastrarLead(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2">Cadastrar Lead</h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione um novo prospecto manualmente
                  </p>
                </CardContent>
              </Card>

              <Card
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setShowCriarImovel(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold mb-2">Cadastrar Imóvel</h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione um novo imóvel ao portfólio
                  </p>
                </CardContent>
              </Card>

              <Card
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setActiveTab("agenda")}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold mb-2">Ver Agenda</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize seus agendamentos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* WhatsApp Integration */}
            <WhatsAppIntegrationCard onUpdate={carregarDados} />
          </TabsContent>

          {/* Leads */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Leads</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button onClick={() => setShowCadastrarLead(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lead
                </Button>
              </div>
            </div>

            {/* Stats de Leads */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total de Leads"
                value={stats?.meusLeads || 0}
                icon={Users}
                color="blue"
              />
              <StatsCard
                title="Leads Ativos"
                value={stats?.leadsAtivos || 0}
                icon={Activity}
                color="green"
              />
              <StatsCard
                title="Convertidos"
                value={stats?.leadsConvertidos || 0}
                icon={CheckSquare}
                color="yellow"
              />
              <StatsCard
                title="Taxa Conversão"
                value={`${stats ? Math.round((stats.leadsConvertidos / stats.meusLeads) * 100) : 0}%`}
                icon={Target}
                color="purple"
              />
            </div>

            {/* Lista de Leads */}
            <Card>
              <CardHeader>
                <CardTitle>Leads Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{lead.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.telefone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lead.mensagem.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge
                            variant={
                              lead.status === "ASSUMIDO"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {lead.status}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            {lead.origem}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(lead.criadoEm).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Imóveis */}
          <TabsContent value="imoveis" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Meus Imóveis</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button onClick={() => setShowCriarImovel(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Imóvel
                </Button>
              </div>
            </div>

            {/* Stats de Imóveis */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total"
                value={stats?.totalImoveis || 0}
                icon={Home}
                color="blue"
              />
              <StatsCard
                title="Disponíveis"
                value={stats?.imoveisDisponiveis || 0}
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Vendidos"
                value={stats?.imoveisVendidos || 0}
                icon={DollarSign}
                color="yellow"
              />
              <StatsCard
                title="Alugados"
                value={stats?.imoveisAlugados || 0}
                icon={Calendar}
                color="purple"
              />
            </div>

            {/* Lista de Imóveis */}
            <Card>
              <CardHeader>
                <CardTitle>Portfólio de Imóveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imoveis.map((imovel) => (
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
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {imovel.endereco}, {imovel.bairro}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {imovel.quartos} quartos • {imovel.banheiros}{" "}
                            banheiros
                            {imovel.vagas ? ` • ${imovel.vagas} vagas` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-primary text-lg">
                            {formatarPreco(imovel.preco)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{imovel.tipo}</Badge>
                            <Badge
                              variant={
                                imovel.status === "DISPONIVEL"
                                  ? "default"
                                  : "secondary"
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

          {/* Agenda */}
          <TabsContent value="agenda" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Agenda de Visitas</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Hoje
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Visita
                </Button>
              </div>
            </div>

            {/* Calendar Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Hoje"
                value="3"
                icon={Calendar}
                description="Visitas agendadas"
                color="blue"
              />
              <StatsCard
                title="Esta Semana"
                value={stats?.visitasAgendadas || 0}
                icon={CalendarDays}
                description="Total agendadas"
                color="green"
              />
              <StatsCard
                title="Realizadas"
                value={stats?.visitasRealizadas || 0}
                icon={CheckSquare}
                description="Este mês"
                color="yellow"
              />
              <StatsCard
                title="Taxa Sucesso"
                value="85%"
                icon={Target}
                description="Conversão"
                color="purple"
              />
            </div>

            {/* Lista de Agendamentos */}
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
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">{agendamento.clienteNome}</p>
                          <p className="text-sm text-muted-foreground">
                            {agendamento.clienteTelefone}
                          </p>
                          <p className="text-sm font-medium">
                            {agendamento.imovelTitulo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {agendamento.imovelEndereco}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold">
                            {agendamento.dataHora.toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {agendamento.dataHora.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <Badge
                            variant={
                              agendamento.status === "AGENDADA"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {agendamento.status}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendas */}
          <TabsContent value="vendas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Performance de Vendas</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePerformanceReport}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatório
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Ranking
                      </p>
                      <p className="text-3xl font-bold">#2</p>
                      <p className="text-sm text-muted-foreground">
                        Entre os corretores
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <Badge variant="default">TOP PERFORMER</Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Avaliação
                      </p>
                      <div className="flex items-center">
                        <p className="text-3xl font-bold mr-2">4.8</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < 5
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        42 avaliações
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Eficiência
                      </p>
                      <p className="text-3xl font-bold">92%</p>
                      <p className="text-sm text-muted-foreground">
                        Leads convertidos
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <Badge variant="default">ALTA EFICIÊNCIA</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Histórico de Vendas */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "1",
                      cliente: "João Silva",
                      imovel: "Apartamento Setor Bueno",
                      valor: 650000,
                      comissao: 19500,
                      data: "2024-12-15",
                      status: "FINALIZADA",
                    },
                    {
                      id: "2",
                      cliente: "Maria Santos",
                      imovel: "Casa Jardim Goiás",
                      valor: 450000,
                      comissao: 13500,
                      data: "2024-12-08",
                      status: "FINALIZADA",
                    },
                  ].map((venda) => (
                    <div
                      key={venda.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold">{venda.cliente}</p>
                          <p className="text-sm text-muted-foreground">
                            {venda.imovel}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(venda.data).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatarPreco(venda.valor)}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Comissão: {formatarPreco(venda.comissao)}
                        </p>
                        <Badge variant="default">{venda.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="configuracoes" className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações</h2>

            <WhatsAppIntegrationCard onUpdate={carregarDados} />

            {/* Configurações de Notificação */}
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novos Leads</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificação quando um novo lead chegar
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Agendamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Lembrete de visitas agendadas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Metas</p>
                    <p className="text-sm text-muted-foreground">
                      Progresso da meta mensal
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Perfil */}
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Corretor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input defaultValue="Carlos Silva" />
                  </div>
                  <div>
                    <Label>CRECI</Label>
                    <Input defaultValue="12345-GO" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue="carlos@siqueicamposimoveis.com.br" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input defaultValue="(62) 9 9999-8888" />
                  </div>
                </div>
                <Button>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CriarImovelModal
        isOpen={showCriarImovel}
        onClose={() => setShowCriarImovel(false)}
        onSuccess={carregarDados}
      />

      <CadastrarLeadModal
        isOpen={showCadastrarLead}
        onClose={() => setShowCadastrarLead(false)}
        onSuccess={carregarDados}
      />
    </div>
  );
}
