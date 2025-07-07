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
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

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
      alert(`Redirecionando para agenda para agendar com ${lead.nome}`);
      setActiveTab("agendamentos");
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="suporte">Suporte</TabsTrigger>
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
                          <SelectItem value="indicacao">Indicação</SelectItem>
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
    </DashboardLayout>
  );
}
