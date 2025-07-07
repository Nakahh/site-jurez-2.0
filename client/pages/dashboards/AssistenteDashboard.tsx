import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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
  Users,
  Home,
  MessageSquare,
  Calendar,
  Phone,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Car,
  Star,
  Mail,
  FileText,
  Activity,
  Target,
  TrendingUp,
  User,
  AlertCircle,
  BookOpen,
  Settings,
  Bell,
  UserCheck,
  CalendarCheck,
  X,
  Trash2,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { WhatsAppIntegration } from "@/components/WhatsAppIntegration";
import { CalendarIntegration } from "@/components/CalendarIntegration";

interface AssistenteStats {
  leadsAtribuidos: number;
  leadsContatados: number;
  visitasAgendadas: number;
  visitasRealizadas: number;
  seguimentosAtivos: number;
  tarefasPendentes: number;
  clientesAtivos: number;
  mediaResposta: string; // tempo médio de resposta
}

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  mensagem: string;
  origem: string;
  status:
    | "NOVO"
    | "CONTATADO"
    | "AGENDADO"
    | "VISITOU"
    | "INTERESSADO"
    | "PERDIDO";
  imovelId?: string;
  corretor: string;
  prioridade: "ALTA" | "MEDIA" | "BAIXA";
  criadoEm: Date;
  ultimoContato?: Date;
}

interface Agendamento {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  imovelTitulo: string;
  imovelEndereco: string;
  dataHora: Date;
  status: "AGENDADO" | "CONFIRMADO" | "REALIZADO" | "CANCELADO";
  corretor: string;
  observacoes?: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  prazo: Date;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
  prioridade: "ALTA" | "MEDIA" | "BAIXA";
  tipo: "LIGACAO" | "EMAIL" | "VISITA" | "DOCUMENTO" | "SEGUIMENTO";
  leadId?: string;
  agendamentoId?: string;
}

export default function AssistenteDashboard() {
  const [stats, setStats] = useState<AssistenteStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [novoLead, setNovoLead] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState(false);
  const [showCriarImovel, setShowCriarImovel] = useState(false);
  const [selectedPropertyImages, setSelectedPropertyImages] = useState<
    string[]
  >([]);
  const [showAgendarVisita, setShowAgendarVisita] = useState(false);
  const [showWhatsAppBusiness, setShowWhatsAppBusiness] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  // Funções para gerenciar visitas
  const handleConfirmarVisita = (visitaId: string) => {
    setAgendamentos((prev) =>
      prev.map((agend) =>
        agend.id === visitaId ? { ...agend, status: "CONFIRMADA" } : agend,
      ),
    );
    alert("Visita confirmada com sucesso!");
  };

  // Funções para gerenciar leads
  const handleLigarLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      const phoneNumber = lead.telefone.replace(/\D/g, "");
      window.open(`tel:${phoneNumber}`, "_self");
    }
  };

  const handleWhatsAppLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      const message = `Olá ${lead.nome}! Sou da Siqueira Campos Imóveis. Gostaria de conversar sobre suas necessidades imobiliárias.`;
      const whatsappUrl = `https://wa.me/55${lead.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleAgendarLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setShowAgendarVisita(true);
    }
  };

  const handleEditarLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      const newStatus = prompt(
        "Novo status (NOVO, QUALIFICADO, REUNIAO, PROPOSTA, FECHAMENTO):",
        lead.status,
      );
      if (newStatus) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
        );
        alert("Lead atualizado com sucesso!");
      }
    }
  };

  // Funções para agendamentos
  const handleLigarAgendamento = (agendId: string) => {
    const agend = agendamentos.find((a) => a.id === agendId);
    if (agend) {
      const phoneNumber = agend.clienteTelefone.replace(/\D/g, "");
      window.open(`tel:${phoneNumber}`, "_self");
    }
  };

  const handleEditarAgendamento = (agendId: string) => {
    const agend = agendamentos.find((a) => a.id === agendId);
    if (agend) {
      const newDate = prompt(
        "Nova data (YYYY-MM-DD):",
        agend.dataHora.toISOString().split("T")[0],
      );
      if (newDate) {
        setAgendamentos((prev) =>
          prev.map((a) =>
            a.id === agendId ? { ...a, dataHora: new Date(newDate) } : a,
          ),
        );
        alert("Agendamento atualizado!");
      }
    }
  };

  const handleConfirmarAgendamento = (agendId: string) => {
    setAgendamentos((prev) =>
      prev.map((agend) =>
        agend.id === agendId ? { ...agend, status: "CONFIRMADA" } : agend,
      ),
    );
    alert("Agendamento confirmado!");
  };

  const handleDetalhesAgendamento = (agendId: string) => {
    const agend = agendamentos.find((a) => a.id === agendId);
    if (agend) {
      alert(
        `Detalhes do Agendamento:\n\nCliente: ${agend.clienteNome}\nTelefone: ${agend.clienteTelefone}\nImóvel: ${agend.imovelTitulo}\nData: ${agend.dataHora.toLocaleString("pt-BR")}\nStatus: ${agend.status}`,
      );
    }
  };

  // Funções para tarefas
  const handleConcluirTarefa = (tarefaId: string) => {
    setTarefas((prev) =>
      prev.map((tarefa) =>
        tarefa.id === tarefaId
          ? { ...tarefa, status: "CONCLUIDA", dataFinalizacao: new Date() }
          : tarefa,
      ),
    );
    alert("Tarefa concluída!");
  };

  const handleEditarTarefa = (tarefaId: string) => {
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (tarefa) {
      const newTitle = prompt("Novo título:", tarefa.titulo);
      if (newTitle) {
        setTarefas((prev) =>
          prev.map((t) => (t.id === tarefaId ? { ...t, titulo: newTitle } : t)),
        );
        alert("Tarefa atualizada!");
      }
    }
  };

  // Funções para suporte
  const handleLigarSuporte = () => {
    window.open("tel:+5562985563505", "_self");
  };

  const handleEnviarMensagem = () => {
    const message = "Olá! Preciso de ajuda com o sistema da imobiliária.";
    const whatsappUrl = `https://wa.me/5562985563505?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const carregarDados = async () => {
    try {
      // Simular dados do assistente
      const statsSimuladas: AssistenteStats = {
        leadsAtribuidos: 45,
        leadsContatados: 32,
        visitasAgendadas: 12,
        visitasRealizadas: 8,
        seguimentosAtivos: 18,
        tarefasPendentes: 7,
        clientesAtivos: 23,
        mediaResposta: "2h 15m",
      };

      const leadsSimulados: Lead[] = [
        {
          id: "1",
          nome: "Maria Silva",
          telefone: "(62) 99999-1234",
          email: "maria@email.com",
          mensagem: "Interessada em apartamento no Setor Bueno, até R$ 400.000",
          origem: "Site",
          status: "NOVO",
          imovelId: "apt-001",
          corretor: "Juarez Siqueira",
          prioridade: "ALTA",
          criadoEm: new Date(),
        },
        {
          id: "2",
          nome: "João Santos",
          telefone: "(62) 98888-5678",
          mensagem: "Preciso de casa no Jardim Goiás com 3 quartos",
          origem: "WhatsApp",
          status: "CONTATADO",
          corretor: "Carlos Silva",
          prioridade: "MEDIA",
          criadoEm: new Date(Date.now() - 86400000),
          ultimoContato: new Date(Date.now() - 3600000),
        },
        {
          id: "3",
          nome: "Ana Costa",
          telefone: "(62) 97777-9012",
          email: "ana@email.com",
          mensagem: "Quero alugar apartamento mobiliado",
          origem: "Instagram",
          status: "AGENDADO",
          corretor: "Juarez Siqueira",
          prioridade: "MEDIA",
          criadoEm: new Date(Date.now() - 172800000),
        },
      ];

      const agendamentosSimulados: Agendamento[] = [
        {
          id: "1",
          clienteNome: "Ana Costa",
          clienteTelefone: "(62) 97777-9012",
          imovelTitulo: "Apartamento Moderno no Setor Bueno",
          imovelEndereco: "Rua T-30, 1234 - Setor Bueno",
          dataHora: new Date(Date.now() + 86400000), // Amanhã
          status: "CONFIRMADO",
          corretor: "Juarez Siqueira",
          observacoes: "Cliente prefere período da manhã",
        },
        {
          id: "2",
          clienteNome: "Carlos Ferreira",
          clienteTelefone: "(62) 96666-3456",
          imovelTitulo: "Casa Térrea no Jardim Goiás",
          imovelEndereco: "Rua das Flores, 567 - Jardim Goiás",
          dataHora: new Date(Date.now() + 172800000), // Depois de amanhã
          status: "AGENDADO",
          corretor: "Carlos Silva",
        },
        {
          id: "3",
          clienteNome: "Fernanda Lima",
          clienteTelefone: "(62) 95555-7890",
          imovelTitulo: "Apartamento para Aluguel",
          imovelEndereco: "Avenida T-1, 890 - Setor Oeste",
          dataHora: new Date(Date.now() - 86400000), // Ontem
          status: "REALIZADO",
          corretor: "Juarez Siqueira",
          observacoes: "Cliente demonstrou interesse",
        },
      ];

      const tarefasSimuladas: Tarefa[] = [
        {
          id: "1",
          titulo: "Ligar para Maria Silva",
          descricao: "Primeira abordagem do lead recebido hoje",
          prazo: new Date(Date.now() + 3600000), // 1 hora
          status: "PENDENTE",
          prioridade: "ALTA",
          tipo: "LIGACAO",
          leadId: "1",
        },
        {
          id: "2",
          titulo: "Confirmar visita da Ana Costa",
          descricao: "Confirmar visita agendada para amanhã",
          prazo: new Date(Date.now() + 43200000), // 12 horas
          status: "PENDENTE",
          prioridade: "ALTA",
          tipo: "LIGACAO",
          agendamentoId: "1",
        },
        {
          id: "3",
          titulo: "Enviar documentos para João Santos",
          descricao: "Enviar documentação do financiamento por email",
          prazo: new Date(Date.now() + 86400000), // 24 horas
          status: "EM_ANDAMENTO",
          prioridade: "MEDIA",
          tipo: "EMAIL",
          leadId: "2",
        },
      ];

      setStats(statsSimuladas);
      setLeads(leadsSimulados);
      setAgendamentos(agendamentosSimulados);
      setTarefas(tarefasSimuladas);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOVO":
        return "bg-blue-100 text-blue-800";
      case "CONTATADO":
        return "bg-yellow-100 text-yellow-800";
      case "AGENDADO":
      case "CONFIRMADO":
        return "bg-green-100 text-green-800";
      case "VISITOU":
      case "REALIZADO":
        return "bg-purple-100 text-purple-800";
      case "INTERESSADO":
        return "bg-orange-100 text-orange-800";
      case "PERDIDO":
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      case "PENDENTE":
        return "bg-gray-100 text-gray-800";
      case "EM_ANDAMENTO":
        return "bg-blue-100 text-blue-800";
      case "CONCLUIDA":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "ALTA":
        return "bg-red-100 text-red-800";
      case "MEDIA":
        return "bg-yellow-100 text-yellow-800";
      case "BAIXA":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const MetricCard = ({
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
      title="Dashboard Assistente"
      subtitle="Gerencie leads, agendamentos e suporte aos corretores"
      userRole="ASSISTENTE"
      actions={
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notificações</span>
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        </div>
      }
    >
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
          <TabsTrigger value="leads" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Leads</span>
            <span className="sm:hidden">👥</span>
          </TabsTrigger>
          <TabsTrigger value="agendamentos" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Agendamentos</span>
            <span className="sm:hidden">📅</span>
          </TabsTrigger>
          <TabsTrigger value="tarefas" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Tarefas</span>
            <span className="sm:hidden">✓</span>
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Integrações</span>
            <span className="sm:hidden">🔗</span>
          </TabsTrigger>
          <TabsTrigger value="suporte" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Suporte</span>
            <span className="sm:hidden">🛠️</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Leads Atribuídos"
                  value={stats.leadsAtribuidos}
                  icon={Users}
                  description="Total sob sua responsabilidade"
                  color="blue"
                />
                <MetricCard
                  title="Leads Contatados"
                  value={stats.leadsContatados}
                  icon={Phone}
                  description={`${((stats.leadsContatados / stats.leadsAtribuidos) * 100).toFixed(0)}% de conversão`}
                  color="green"
                />
                <MetricCard
                  title="Visitas Agendadas"
                  value={stats.visitasAgendadas}
                  icon={Calendar}
                  description={`${stats.visitasRealizadas} já realizadas`}
                  color="purple"
                />
                <MetricCard
                  title="Tarefas Pendentes"
                  value={stats.tarefasPendentes}
                  icon={CheckCircle}
                  description="Precisam de atenção"
                  color="orange"
                />
              </div>

              {/* Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Seguimentos Ativos"
                  value={stats.seguimentosAtivos}
                  icon={Activity}
                  description="Leads em acompanhamento"
                  color="indigo"
                />
                <MetricCard
                  title="Clientes Ativos"
                  value={stats.clientesAtivos}
                  icon={UserCheck}
                  description="Em processo de negociação"
                  color="teal"
                />
                <MetricCard
                  title="Tempo Médio Resposta"
                  value={stats.mediaResposta}
                  icon={Clock}
                  description="Para primeiro contato"
                  color="pink"
                />
                <MetricCard
                  title="Taxa de Conversão"
                  value={`${((stats.visitasRealizadas / stats.leadsAtribuidos) * 100).toFixed(1)}%`}
                  icon={Target}
                  description="Leads → Visitas"
                  color="cyan"
                />
              </div>

              {/* Resumo de Atividades */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Atividades Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">Novo lead: Maria Silva</p>
                          <p className="text-sm text-muted-foreground">
                            Interessada em apartamento no Setor Bueno
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Há 10 minutos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">
                            Visita confirmada: Ana Costa
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Apartamento no Setor Bueno - Amanhã 10h
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Há 1 hora
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">
                            Documento enviado: João Santos
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Documentação de financiamento via email
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Há 2 horas
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Próximas Ações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tarefas
                        .filter((t) => t.status === "PENDENTE")
                        .slice(0, 3)
                        .map((tarefa) => (
                          <div
                            key={tarefa.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{tarefa.titulo}</p>
                              <p className="text-sm text-muted-foreground">
                                {tarefa.descricao}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Prazo: {tarefa.prazo.toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={getPriorityColor(tarefa.prioridade)}
                              >
                                {tarefa.prioridade}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConcluirTarefa(tarefa.id)}
                                title="Concluir tarefa"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ações Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900"
                  onClick={() => setShowCriarImovel(true)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Home className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Cadastrar Imóvel</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Adicione um novo imóvel com todas as informações e fotos
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900"
                  onClick={() => setShowWhatsAppBusiness(true)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      WhatsApp Business
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Central de mensagens e atendimento via WhatsApp
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900"
                  onClick={() => setActiveTab("agendamentos")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarCheck className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Agendar Visitas</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Gerencie e organize todas as visitas dos clientes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
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
              <Dialog open={novoLead} onOpenChange={setNovoLead}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Novo Lead</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input placeholder="Nome do cliente" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input placeholder="(62) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Origem</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Como chegou até n��s" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="site">Site</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="indicacao">Indicaç��o</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Mensagem/Interesse</Label>
                      <Textarea
                        placeholder="Descreva o interesse do cliente..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Corretor Responsável</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o corretor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="juarez">
                            Juarez Siqueira
                          </SelectItem>
                          <SelectItem value="carlos">Carlos Silva</SelectItem>
                          <SelectItem value="maria">Maria Santos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALTA">Alta</SelectItem>
                          <SelectItem value="MEDIA">Média</SelectItem>
                          <SelectItem value="BAIXA">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setNovoLead(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={() => setNovoLead(false)}>
                      Cadastrar Lead
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Lista de Leads */}
          <div className="space-y-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{lead.nome}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{lead.telefone}</span>
                          </div>
                          {lead.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{lead.email}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {lead.criadoEm.toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{lead.corretor}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {lead.mensagem}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <Badge className={getPriorityColor(lead.prioridade)}>
                            {lead.prioridade}
                          </Badge>
                          <Badge variant="outline">{lead.origem}</Badge>
                          {lead.ultimoContato && (
                            <span className="text-xs text-muted-foreground">
                              Último contato:{" "}
                              {lead.ultimoContato.toLocaleString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLigarLead(lead.id)}
                        title="Ligar para o lead"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Ligar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWhatsAppLead(lead.id)}
                        title="Enviar WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAgendarLead(lead.id)}
                        title="Agendar visita"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Agendar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditarLead(lead.id)}
                        title="Editar lead"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
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
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Calendário
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar por Status
              </Button>
            </div>
          </div>

          {/* Lista de Agendamentos */}
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <Card
                key={agendamento.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {agendamento.clienteNome}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {agendamento.clienteTelefone}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {agendamento.corretor}
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="font-semibold">
                            {agendamento.imovelTitulo}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {agendamento.imovelEndereco}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold">
                            {agendamento.dataHora.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        {agendamento.observacoes && (
                          <p className="text-sm text-muted-foreground mb-3">
                            Obs: {agendamento.observacoes}
                          </p>
                        )}
                        <Badge className={getStatusColor(agendamento.status)}>
                          {agendamento.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {agendamento.status === "AGENDADO" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleConfirmarAgendamento(agendamento.id)
                          }
                          title="Confirmar agendamento"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLigarAgendamento(agendamento.id)}
                        title="Ligar para cliente"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Ligar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditarAgendamento(agendamento.id)}
                        title="Editar agendamento"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDetalhesAgendamento(agendamento.id)
                        }
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tarefas */}
        <TabsContent value="tarefas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Minhas Tarefas</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Dialog open={novaTarefa} onOpenChange={setNovaTarefa}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Tarefa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input placeholder="Título da tarefa" />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea placeholder="Descreva a tarefa..." rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo da tarefa" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LIGACAO">Ligação</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="VISITA">Visita</SelectItem>
                            <SelectItem value="DOCUMENTO">Documento</SelectItem>
                            <SelectItem value="SEGUIMENTO">
                              Seguimento
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALTA">Alta</SelectItem>
                            <SelectItem value="MEDIA">Média</SelectItem>
                            <SelectItem value="BAIXA">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Prazo</Label>
                      <Input type="datetime-local" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setNovaTarefa(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={() => setNovaTarefa(false)}>
                      Criar Tarefa
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Lista de Tarefas */}
          <div className="grid gap-4">
            {tarefas.map((tarefa) => (
              <Card
                key={tarefa.id}
                className={`hover:shadow-lg transition-shadow ${
                  tarefa.status === "CONCLUIDA" ? "opacity-75" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          tarefa.status === "CONCLUIDA"
                            ? "bg-green-100"
                            : tarefa.prioridade === "ALTA"
                              ? "bg-red-100"
                              : "bg-primary/10"
                        }`}
                      >
                        {tarefa.tipo === "LIGACAO" && (
                          <Phone
                            className={`h-6 w-6 ${
                              tarefa.status === "CONCLUIDA"
                                ? "text-green-600"
                                : tarefa.prioridade === "ALTA"
                                  ? "text-red-600"
                                  : "text-primary"
                            }`}
                          />
                        )}
                        {tarefa.tipo === "EMAIL" && (
                          <Mail
                            className={`h-6 w-6 ${
                              tarefa.status === "CONCLUIDA"
                                ? "text-green-600"
                                : tarefa.prioridade === "ALTA"
                                  ? "text-red-600"
                                  : "text-primary"
                            }`}
                          />
                        )}
                        {tarefa.tipo === "VISITA" && (
                          <Calendar
                            className={`h-6 w-6 ${
                              tarefa.status === "CONCLUIDA"
                                ? "text-green-600"
                                : tarefa.prioridade === "ALTA"
                                  ? "text-red-600"
                                  : "text-primary"
                            }`}
                          />
                        )}
                        {tarefa.tipo === "DOCUMENTO" && (
                          <FileText
                            className={`h-6 w-6 ${
                              tarefa.status === "CONCLUIDA"
                                ? "text-green-600"
                                : tarefa.prioridade === "ALTA"
                                  ? "text-red-600"
                                  : "text-primary"
                            }`}
                          />
                        )}
                        {tarefa.tipo === "SEGUIMENTO" && (
                          <Activity
                            className={`h-6 w-6 ${
                              tarefa.status === "CONCLUIDA"
                                ? "text-green-600"
                                : tarefa.prioridade === "ALTA"
                                  ? "text-red-600"
                                  : "text-primary"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {tarefa.titulo}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {tarefa.descricao}
                        </p>
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Prazo: {tarefa.prazo.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(tarefa.status)}>
                            {tarefa.status}
                          </Badge>
                          <Badge
                            className={getPriorityColor(tarefa.prioridade)}
                          >
                            {tarefa.prioridade}
                          </Badge>
                          <Badge variant="outline">{tarefa.tipo}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {tarefa.status !== "CONCLUIDA" && (
                        <Button
                          size="sm"
                          onClick={() => handleConcluirTarefa(tarefa.id)}
                          title="Concluir tarefa"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditarTarefa(tarefa.id)}
                        title="Editar tarefa"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Suporte */}
        <TabsContent value="suporte" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Central de Suporte</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Documentação */}
            <Card>
              <CardHeader>
                <CardTitle>Documentação e Guias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open("/manual-assistente.pdf", "_blank")
                  }
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manual do Assistente
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open("/processos-atendimento.pdf", "_blank")
                  }
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Processos de Atendimento
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open("/guia-leads.pdf", "_blank")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Como Gerenciar Leads
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open("/guia-agendamentos.pdf", "_blank")
                  }
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendamento de Visitas
                </Button>
              </CardContent>
            </Card>

            {/* Contatos Importantes */}
            <Card>
              <CardHeader>
                <CardTitle>Contatos Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Juarez Siqueira</p>
                    <p className="text-sm text-muted-foreground">
                      Corretor Principal
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Carlos Silva</p>
                    <p className="text-sm text-muted-foreground">Corretor</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">Suporte Técnico</p>
                    <p className="text-sm text-muted-foreground">
                      Problemas no sistema
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome de Exibição</Label>
                  <Input defaultValue="Assistente do Corretor" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="assistente@siqueicamposimoveis.com.br" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input defaultValue="(62) 99999-9999" />
                </div>
                <Button className="w-full">Salvar Alterações</Button>
              </CardContent>
            </Card>

            {/* Estatísticas Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Minhas Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Leads Processados (Mês)</span>
                  <span className="font-bold">45</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Conversão</span>
                  <span className="font-bold text-green-600">71%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo Médio Resposta</span>
                  <span className="font-bold">2h 15m</span>
                </div>
                <div className="flex justify-between">
                  <span>Satisfação do Cliente</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-bold">4.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Criação de Imóveis */}
      {showCriarImovel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Cadastrar Novo Imóvel</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCriarImovel(false);
                    setSelectedPropertyImages([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Informações Básicas
                    </h4>

                    <div className="space-y-2">
                      <Label>Título do Imóvel *</Label>
                      <Input placeholder="Ex: Apartamento moderno no Setor Bueno" />
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição Completa *</Label>
                      <Textarea
                        className="h-24"
                        placeholder="Descreva o imóvel detalhadamente..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="APARTAMENTO">
                              Apartamento
                            </SelectItem>
                            <SelectItem value="CASA">Casa</SelectItem>
                            <SelectItem value="TERRENO">Terreno</SelectItem>
                            <SelectItem value="COMERCIAL">Comercial</SelectItem>
                            <SelectItem value="RURAL">Rural</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Finalidade *</Label>
                        <Select>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Preço (R$) *</Label>
                        <Input type="number" placeholder="650000" step="1000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Área Total (m²) *</Label>
                        <Input type="number" placeholder="89" step="0.01" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Quartos</Label>
                        <Input type="number" placeholder="3" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>Banheiros</Label>
                        <Input type="number" placeholder="2" min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>Vagas</Label>
                        <Input type="number" placeholder="2" min="0" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>IPTU Anual (R$)</Label>
                        <Input type="number" placeholder="3500" step="100" />
                      </div>
                      <div className="space-y-2">
                        <Label>Ano de Construção</Label>
                        <Input
                          type="number"
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
                      <Label>Endereço Completo *</Label>
                      <Input placeholder="Rua T-30, 1234, Apartamento 802" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bairro *</Label>
                        <Input placeholder="Setor Bueno" />
                      </div>
                      <div className="space-y-2">
                        <Label>CEP</Label>
                        <Input placeholder="74223-030" maxLength={9} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cidade *</Label>
                        <Input placeholder="Goiânia" defaultValue="Goiânia" />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado *</Label>
                        <Input
                          placeholder="GO"
                          defaultValue="GO"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Latitude</Label>
                        <Input
                          type="number"
                          placeholder="-16.6868"
                          step="0.0001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Longitude</Label>
                        <Input
                          type="number"
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
                        <Label>Valor do Condomínio (R$/mês)</Label>
                        <Input type="number" placeholder="450" step="10" />
                      </div>
                    </div>

                    {/* WhatsApp Integration */}
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-3">Integração WhatsApp</h5>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="whatsapp-alerts"
                            className="rounded"
                          />
                          <label
                            htmlFor="whatsapp-alerts"
                            className="text-sm font-medium"
                          >
                            Receber alertas via WhatsApp quando houver interesse
                          </label>
                        </div>
                        <div className="space-y-2">
                          <Label>Mensagem automática para interessados</Label>
                          <Textarea
                            className="h-16"
                            placeholder="Olá! Vi que você tem interesse neste imóvel. Sou da Siqueira Campos Imóveis e posso te ajudar com mais informações!"
                            defaultValue="Olá! Vi que você tem interesse neste imóvel. Sou da Siqueira Campos Imóveis e posso te ajudar com mais informações!"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Características e Amenidades */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Características
                    </h4>
                    <div className="space-y-2">
                      <Label>Características do Imóvel</Label>
                      <Textarea
                        className="h-20"
                        placeholder="Ex: Reformado recentemente&#10;Móveis planejados&#10;Varanda gourmet"
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
                      <Label>Amenidades Disponíveis</Label>
                      <Textarea
                        className="h-20"
                        placeholder="Ex: Piscina&#10;Academia&#10;Salão de festas&#10;Playground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Digite uma amenidade por linha
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload de Imagens */}
                <div>
                  <h4 className="font-semibold text-lg border-b pb-2 mb-4">
                    Fotos do Imóvel
                  </h4>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="property-images-assistente"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            const newImages = files.map(
                              (file, index) =>
                                `https://images.unsplash.com/photo-${1560518883 + selectedPropertyImages.length + index}?w=200&h=150&fit=crop`,
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
                        htmlFor="property-images-assistente"
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
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          {selectedPropertyImages.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md border"
                              />
                              <button
                                type="button"
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

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            {selectedPropertyImages.length} foto(s)
                            selecionada(s) • A primeira foto será usada como
                            capa
                          </p>
                          <Button
                            type="button"
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
                      </>
                    )}
                  </div>
                </div>

                {/* Configurações Adicionais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Configurações
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="destaque-assistente"
                          className="rounded"
                        />
                        <label
                          htmlFor="destaque-assistente"
                          className="text-sm font-medium"
                        >
                          Exibir como imóvel em destaque
                        </label>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select defaultValue="DISPONIVEL">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DISPONIVEL">
                              Disponível
                            </SelectItem>
                            <SelectItem value="RESERVADO">Reservado</SelectItem>
                            <SelectItem value="VENDIDO">Vendido</SelectItem>
                            <SelectItem value="ALUGADO">Alugado</SelectItem>
                            <SelectItem value="INATIVO">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Notificações WhatsApp
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="whatsapp-lead"
                          className="rounded"
                          defaultChecked
                        />
                        <label
                          htmlFor="whatsapp-lead"
                          className="text-sm font-medium"
                        >
                          Notificar quando houver novo interesse
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="whatsapp-visit"
                          className="rounded"
                          defaultChecked
                        />
                        <label
                          htmlFor="whatsapp-visit"
                          className="text-sm font-medium"
                        >
                          Notificar quando agendarem visita
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="whatsapp-question"
                          className="rounded"
                          defaultChecked
                        />
                        <label
                          htmlFor="whatsapp-question"
                          className="text-sm font-medium"
                        >
                          Notificar quando fizerem perguntas
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rodapé com botões */}
                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button
                      type="submit"
                      className="flex-1 sm:flex-none sm:px-8"
                      size="lg"
                      onClick={() => {
                        alert(
                          "🎉 Imóvel criado com sucesso!\n\n✅ Todas as informações foram salvas\n✅ Fotos carregadas\n✅ Notificações WhatsApp ativadas\n✅ Sistema pronto para receber leads!",
                        );
                        setShowCriarImovel(false);
                        setSelectedPropertyImages([]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Imóvel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowCriarImovel(false);
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
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamento de Visitas */}
      {showAgendarVisita && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Agendar Visita</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAgendarVisita(false);
                    setSelectedLead(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold">Cliente</h4>
                  <p className="text-sm">{selectedLead.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLead.telefone}
                  </p>
                  {selectedLead.email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedLead.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Data da Visita</Label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="17:00">17:00</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Imóvel de Interesse</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apt1">
                        Apartamento Setor Bueno - R$ 650.000
                      </SelectItem>
                      <SelectItem value="casa1">
                        Casa Jardim Goiás - R$ 450.000
                      </SelectItem>
                      <SelectItem value="apt2">
                        Apartamento Setor Oeste - R$ 380.000
                      </SelectItem>
                      <SelectItem value="casa2">
                        Casa Aldeia do Vale - R$ 520.000
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Corretor Responsável</Label>
                  <Select defaultValue="juarez">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juarez">
                        Juarez Siqueira Campos
                      </SelectItem>
                      <SelectItem value="carlos">Carlos Silva</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Observações sobre a visita..."
                    className="h-20"
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h5 className="font-medium">Confirmação Automática</h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="whatsapp-confirm"
                        className="rounded"
                        defaultChecked
                      />
                      <label htmlFor="whatsapp-confirm" className="text-sm">
                        Enviar confirmação via WhatsApp
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="email-confirm"
                        className="rounded"
                      />
                      <label htmlFor="email-confirm" className="text-sm">
                        Enviar confirmação por email
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sms-confirm"
                        className="rounded"
                      />
                      <label htmlFor="sms-confirm" className="text-sm">
                        Enviar lembrete por SMS
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Simular agendamento
                    const message = `Olá ${selectedLead.nome}! Sua visita foi agendada. Em breve enviaremos os detalhes via WhatsApp.`;
                    alert(`✅ Visita agendada com sucesso!\n\n${message}`);

                    // Enviar WhatsApp
                    const whatsappMessage = `Olá ${selectedLead.nome}!

Sua visita foi agendada com sucesso! 🏠

📅 Data: [Data selecionada]
🕐 Horário: [Horário selecionado]
📍 Imóvel: [Imóvel selecionado]
👨‍💼 Corretor: [Corretor responsável]

Em caso de dúvidas, estou à disposição!

Siqueira Campos Imóveis
📱 (62) 9 8556-3505`;

                    const phoneNumber = selectedLead.telefone.replace(
                      /\D/g,
                      "",
                    );
                    window.open(
                      `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`,
                      "_blank",
                    );

                    setShowAgendarVisita(false);
                    setSelectedLead(null);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Visita
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAgendarVisita(false);
                    setSelectedLead(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal WhatsApp Business */}
      {showWhatsAppBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-green-600" />
                  WhatsApp Business - Central de Atendimento
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWhatsAppBusiness(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ações Rápidas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Ações Rápidas
                  </h4>

                  <div className="space-y-3">
                    <Button
                      className="w-full justify-start bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        const message =
                          "Olá! Sou da Siqueira Campos Imóveis. Como posso ajudá-lo hoje?";
                        window.open(
                          `https://wa.me/5562985563505?text=${encodeURIComponent(message)}`,
                          "_blank",
                        );
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Abrir WhatsApp Web
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const message =
                          "Bom dia! Temos imóveis incríveis disponíveis. Gostaria de conhecer nossas opções?";
                        navigator.clipboard.writeText(message);
                        alert("Mensagem copiada para a área de transferência!");
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Copiar Mensagem de Bom Dia
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const contacts = leads
                          .map((lead) => `${lead.nome}: ${lead.telefone}`)
                          .join("\n");
                        navigator.clipboard.writeText(contacts);
                        alert("Lista de contatos copiada!");
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Copiar Lista de Leads
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">
                      Mensagens Pré-definidas
                    </h5>
                    <div className="space-y-2">
                      {[
                        "Olá! Temos o imóvel perfeito para você. Gostaria de agendar uma visita?",
                        "Boa tarde! Vi seu interesse em nossos imóveis. Posso ajudá-lo com mais informações?",
                        "Olá! Temos uma promoção especial para este mês. Gostaria de conhecer?",
                        "Bom dia! Há novidades em imóveis que podem interessar você!",
                        "Olá! Seu financiamento foi aprovado. Podemos prosseguir com a documentação?",
                      ].map((msg, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <p className="text-sm mb-2">{msg}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(msg);
                              alert("Mensagem copiada!");
                            }}
                          >
                            Copiar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Leads Recentes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Leads para Contatar
                  </h4>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {leads.slice(0, 8).map((lead) => (
                      <div key={lead.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold">{lead.nome}</h5>
                            <p className="text-sm text-muted-foreground">
                              {lead.telefone}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.origem} •{" "}
                              {lead.criadoEm.toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Badge
                            className={
                              lead.status === "NOVO"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </div>

                        <p className="text-sm mb-3 line-clamp-2">
                          {lead.mensagem}
                        </p>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              const message = `Olá ${lead.nome}! Vi seu interesse em nossos imóveis. Sou da Siqueira Campos Imóveis e gostaria de ajudá-lo. ${lead.mensagem ? `Sobre sua mensagem: "${lead.mensagem}"` : ""} Como posso ajudá-lo?`;
                              const phoneNumber = lead.telefone.replace(
                                /\D/g,
                                "",
                              );
                              window.open(
                                `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`,
                                "_blank",
                              );
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const phoneNumber = lead.telefone.replace(
                                /\D/g,
                                "",
                              );
                              window.open(`tel:+55${phoneNumber}`, "_self");
                            }}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Ligar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estatísticas WhatsApp */}
              <div className="border-t mt-6 pt-6">
                <h4 className="font-semibold text-lg mb-4">
                  Estatísticas de Atendimento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">127</div>
                    <div className="text-sm text-muted-foreground">
                      Mensagens Enviadas
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">89%</div>
                    <div className="text-sm text-muted-foreground">
                      Taxa de Resposta
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      2.5h
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tempo M��dio Resposta
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">45</div>
                    <div className="text-sm text-muted-foreground">
                      Leads Convertidos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
