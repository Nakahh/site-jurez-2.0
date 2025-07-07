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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  User,
  Home,
  Target,
  Activity,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  CalendarDays,
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  Bell,
  MessageSquare,
} from "lucide-react";

interface CalendarConfig {
  googleClientId?: string;
  googleClientSecret?: string;
  googleRefreshToken?: string;
  calendarId?: string;
  connected: boolean;
  autoSync: boolean;
  notificationSettings: {
    email: boolean;
    whatsapp: boolean;
    minutesBefore: number;
  };
}

interface Agendamento {
  id: string;
  googleEventId?: string;
  clienteNome: string;
  clienteEmail?: string;
  clienteTelefone: string;
  imovelId: string;
  imovelTitulo: string;
  imovelEndereco: string;
  dataHora: Date;
  duracao: number; // minutos
  status: "agendado" | "confirmado" | "realizado" | "cancelado" | "reagendado";
  observacoes?: string;
  corretorId: string;
  corretorNome: string;
  criadoEm: Date;
  lembreteEnviado: boolean;
  origem: "site" | "whatsapp" | "manual" | "n8n";
}

interface CalendarStats {
  totalAgendamentos: number;
  agendamentosHoje: number;
  agendamentosProximaSemana: number;
  taxaComparecimento: number;
  visitasRealizadas: number;
  visitasCanceladas: number;
  tempoMedioVisita: number;
}

interface DisponibilidadeSlot {
  dayOfWeek: number; // 0 = domingo, 1 = segunda, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  breakStartTime?: string; // "12:00"
  breakEndTime?: string; // "13:00"
  active: boolean;
}

export function CalendarIntegration({
  userRole,
}: {
  userRole: "CORRETOR" | "ASSISTENTE";
}) {
  const [config, setConfig] = useState<CalendarConfig>({
    connected: false,
    autoSync: true,
    notificationSettings: {
      email: true,
      whatsapp: true,
      minutesBefore: 60,
    },
  });
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [stats, setStats] = useState<CalendarStats>({
    totalAgendamentos: 0,
    agendamentosHoje: 0,
    agendamentosProximaSemana: 0,
    taxaComparecimento: 0,
    visitasRealizadas: 0,
    visitasCanceladas: 0,
    tempoMedioVisita: 45,
  });
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeSlot[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("config");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);

  // Estados para novo agendamento
  const [novoAgendamento, setNovoAgendamento] = useState({
    clienteNome: "",
    clienteEmail: "",
    clienteTelefone: "",
    imovelId: "",
    imovelTitulo: "",
    imovelEndereco: "",
    dataHora: "",
    duracao: 45,
    observacoes: "",
  });

  useEffect(() => {
    carregarDados();
    carregarDisponibilidade();
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem("token");
      const [configResponse, agendamentosResponse, statsResponse] =
        await Promise.all([
          fetch("/api/calendar/config", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/calendar/agendamentos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/calendar/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfig(configData);
      }

      if (agendamentosResponse.ok) {
        const agendamentosData = await agendamentosResponse.json();
        setAgendamentos(
          agendamentosData.map((a: any) => ({
            ...a,
            dataHora: new Date(a.dataHora),
            criadoEm: new Date(a.criadoEm),
          })),
        );
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const carregarDisponibilidade = () => {
    // Carregar disponibilidade padrão
    const disponibilidadePadrao: DisponibilidadeSlot[] = [
      {
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "18:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        active: true,
      }, // Segunda
      {
        dayOfWeek: 2,
        startTime: "08:00",
        endTime: "18:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        active: true,
      }, // Terça
      {
        dayOfWeek: 3,
        startTime: "08:00",
        endTime: "18:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        active: true,
      }, // Quarta
      {
        dayOfWeek: 4,
        startTime: "08:00",
        endTime: "18:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        active: true,
      }, // Quinta
      {
        dayOfWeek: 5,
        startTime: "08:00",
        endTime: "18:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        active: true,
      }, // Sexta
      { dayOfWeek: 6, startTime: "08:00", endTime: "12:00", active: true }, // Sábado
      { dayOfWeek: 0, startTime: "09:00", endTime: "12:00", active: false }, // Domingo
    ];
    setDisponibilidade(disponibilidadePadrao);
  };

  const conectarGoogleCalendar = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/calendar/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          window.open(data.authUrl, "_blank");
          setMessage(
            "Complete a autorização no Google para conectar o calendário",
          );
        } else {
          setConfig((prev) => ({ ...prev, connected: true }));
          setMessage("Google Calendar conectado com sucesso!");
        }
      } else {
        setError("Erro ao conectar com Google Calendar");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const salvarConfig = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/calendar/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage("Configuração salva com sucesso!");
        carregarDados();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao salvar configuração");
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const criarAgendamento = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/calendar/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...novoAgendamento,
          dataHora: new Date(novoAgendamento.dataHora),
        }),
      });

      if (response.ok) {
        setMessage("Agendamento criado com sucesso!");
        setShowNewEvent(false);
        setNovoAgendamento({
          clienteNome: "",
          clienteEmail: "",
          clienteTelefone: "",
          imovelId: "",
          imovelTitulo: "",
          imovelEndereco: "",
          dataHora: "",
          duracao: 45,
          observacoes: "",
        });
        carregarDados();
      } else {
        setError("Erro ao criar agendamento");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusAgendamento = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/calendar/agendamentos/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setMessage("Status atualizado com sucesso!");
        carregarDados();
      } else {
        setError("Erro ao atualizar status");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const enviarLembrete = async (agendamentoId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/calendar/agendamentos/${agendamentoId}/lembrete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setMessage("Lembrete enviado com sucesso!");
        carregarDados();
      } else {
        setError("Erro ao enviar lembrete");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const salvarDisponibilidade = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/calendar/disponibilidade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(disponibilidade),
      });

      if (response.ok) {
        setMessage("Disponibilidade salva com sucesso!");
      } else {
        setError("Erro ao salvar disponibilidade");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    return days[dayOfWeek];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "realizado":
        return "bg-emerald-100 text-emerald-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      case "reagendado":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    }
    return numbers;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Google Calendar Integration</span>
            {config.connected ? (
              <Badge className="bg-green-100 text-green-800">Conectado</Badge>
            ) : (
              <Badge variant="secondary">Desconectado</Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={carregarDados}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="disponibilidade">Disponibilidade</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Configuração */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Google Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="ID do cliente Google API"
                    value={config.googleClientId || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        googleClientId: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="clientSecret">Google Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Secret do cliente Google API"
                    value={config.googleClientSecret || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        googleClientSecret: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="calendarId">ID do Calendário</Label>
                  <Input
                    id="calendarId"
                    placeholder="primary ou ID específico"
                    value={config.calendarId || "primary"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        calendarId: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Sincronização Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Sincronizar agendamentos automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={config.autoSync}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, autoSync: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Notificações</h4>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Lembrete por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes por email
                    </p>
                  </div>
                  <Switch
                    checked={config.notificationSettings.email}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          email: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Lembrete por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes por WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={config.notificationSettings.whatsapp}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          whatsapp: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="minutesBefore">
                    Minutos antes do lembrete
                  </Label>
                  <Select
                    value={config.notificationSettings.minutesBefore.toString()}
                    onValueChange={(value) =>
                      setConfig((prev) => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          minutesBefore: parseInt(value),
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="1440">1 dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {!config.connected && (
                <Button
                  onClick={conectarGoogleCalendar}
                  disabled={
                    loading ||
                    !config.googleClientId ||
                    !config.googleClientSecret
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Conectar Google Calendar
                </Button>
              )}
              <Button onClick={salvarConfig} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </TabsContent>

          {/* Agendamentos */}
          <TabsContent value="agendamentos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Agendamentos</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button size="sm" onClick={() => setShowNewEvent(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {agendamentos.map((agendamento) => (
                <Card key={agendamento.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">
                          {agendamento.clienteNome}
                        </h4>
                        <Badge className={getStatusColor(agendamento.status)}>
                          {agendamento.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{agendamento.origem}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {agendamento.dataHora.toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {agendamento.dataHora.toLocaleTimeString(
                                "pt-BR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}{" "}
                              ({agendamento.duracao}min)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatarTelefone(agendamento.clienteTelefone)}
                            </span>
                          </div>
                          {agendamento.clienteEmail && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{agendamento.clienteEmail}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <span>{agendamento.imovelTitulo}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">
                              {agendamento.imovelEndereco}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{agendamento.corretorNome}</span>
                          </div>
                        </div>
                      </div>

                      {agendamento.observacoes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {agendamento.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {agendamento.status === "agendado" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              atualizarStatusAgendamento(
                                agendamento.id,
                                "confirmado",
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => enviarLembrete(agendamento.id)}
                            disabled={agendamento.lembreteEnviado}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            {agendamento.lembreteEnviado
                              ? "Enviado"
                              : "Lembrete"}
                          </Button>
                        </>
                      )}

                      {agendamento.status === "confirmado" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            atualizarStatusAgendamento(
                              agendamento.id,
                              "realizado",
                            )
                          }
                        >
                          <CalendarCheck className="h-4 w-4 mr-2" />
                          Realizado
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAgendamento(agendamento)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Disponibilidade */}
          <TabsContent value="disponibilidade" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Horários de Disponibilidade
              </h3>
              <Button onClick={salvarDisponibilidade}>
                Salvar Disponibilidade
              </Button>
            </div>

            <div className="space-y-4">
              {disponibilidade.map((slot, index) => (
                <Card key={slot.dayOfWeek} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-24">
                        <Label className="font-semibold">
                          {getDayName(slot.dayOfWeek)}
                        </Label>
                      </div>

                      {slot.active && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              setDisponibilidade((prev) =>
                                prev.map((s) =>
                                  s.dayOfWeek === slot.dayOfWeek
                                    ? { ...s, startTime: e.target.value }
                                    : s,
                                ),
                              )
                            }
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">
                            às
                          </span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              setDisponibilidade((prev) =>
                                prev.map((s) =>
                                  s.dayOfWeek === slot.dayOfWeek
                                    ? { ...s, endTime: e.target.value }
                                    : s,
                                ),
                              )
                            }
                            className="w-24"
                          />

                          {slot.breakStartTime && (
                            <>
                              <span className="text-sm text-muted-foreground ml-4">
                                Pausa:
                              </span>
                              <Input
                                type="time"
                                value={slot.breakStartTime}
                                onChange={(e) =>
                                  setDisponibilidade((prev) =>
                                    prev.map((s) =>
                                      s.dayOfWeek === slot.dayOfWeek
                                        ? {
                                            ...s,
                                            breakStartTime: e.target.value,
                                          }
                                        : s,
                                    ),
                                  )
                                }
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">
                                às
                              </span>
                              <Input
                                type="time"
                                value={slot.breakEndTime}
                                onChange={(e) =>
                                  setDisponibilidade((prev) =>
                                    prev.map((s) =>
                                      s.dayOfWeek === slot.dayOfWeek
                                        ? { ...s, breakEndTime: e.target.value }
                                        : s,
                                    ),
                                  )
                                }
                                className="w-24"
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <Switch
                      checked={slot.active}
                      onCheckedChange={(checked) =>
                        setDisponibilidade((prev) =>
                          prev.map((s) =>
                            s.dayOfWeek === slot.dayOfWeek
                              ? { ...s, active: checked }
                              : s,
                          ),
                        )
                      }
                    />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Calendário */}
          <TabsContent value="calendario" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Calendário de Visitas</h3>
              <Button
                variant="outline"
                onClick={() =>
                  window.open("https://calendar.google.com", "_blank")
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Google Calendar
              </Button>
            </div>

            <Card className="p-6">
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p>Visualização do calendário seria implementada aqui</p>
                  <p className="text-sm">Integrando com Google Calendar API</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Agendamentos
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalAgendamentos}
                    </p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hoje</p>
                    <p className="text-2xl font-bold">
                      {stats.agendamentosHoje}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Taxa de Comparecimento
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.taxaComparecimento.toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    <p className="text-2xl font-bold">
                      {stats.tempoMedioVisita}min
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agendamentos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Agendados</span>
                      <Badge variant="secondary">
                        {
                          agendamentos.filter((a) => a.status === "agendado")
                            .length
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Confirmados</span>
                      <Badge className="bg-green-100 text-green-800">
                        {
                          agendamentos.filter((a) => a.status === "confirmado")
                            .length
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Realizados</span>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        {
                          agendamentos.filter((a) => a.status === "realizado")
                            .length
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cancelados</span>
                      <Badge variant="destructive">
                        {
                          agendamentos.filter((a) => a.status === "cancelado")
                            .length
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agendamentos
                      .filter(
                        (a) =>
                          a.dataHora > new Date() && a.status !== "cancelado",
                      )
                      .slice(0, 5)
                      .map((agendamento) => (
                        <div
                          key={agendamento.id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">
                              {agendamento.clienteNome}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {agendamento.dataHora.toLocaleDateString("pt-BR")}{" "}
                              às{" "}
                              {agendamento.dataHora.toLocaleTimeString(
                                "pt-BR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <Badge className={getStatusColor(agendamento.status)}>
                            {agendamento.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog para novo agendamento */}
        <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clienteNome">Nome do Cliente</Label>
                  <Input
                    id="clienteNome"
                    value={novoAgendamento.clienteNome}
                    onChange={(e) =>
                      setNovoAgendamento((prev) => ({
                        ...prev,
                        clienteNome: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="clienteTelefone">Telefone</Label>
                  <Input
                    id="clienteTelefone"
                    value={formatarTelefone(novoAgendamento.clienteTelefone)}
                    onChange={(e) =>
                      setNovoAgendamento((prev) => ({
                        ...prev,
                        clienteTelefone: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="clienteEmail">Email (opcional)</Label>
                  <Input
                    id="clienteEmail"
                    type="email"
                    value={novoAgendamento.clienteEmail}
                    onChange={(e) =>
                      setNovoAgendamento((prev) => ({
                        ...prev,
                        clienteEmail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dataHora">Data e Hora</Label>
                  <Input
                    id="dataHora"
                    type="datetime-local"
                    value={novoAgendamento.dataHora}
                    onChange={(e) =>
                      setNovoAgendamento((prev) => ({
                        ...prev,
                        dataHora: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="imovelTitulo">Imóvel</Label>
                  <Input
                    id="imovelTitulo"
                    value={novoAgendamento.imovelTitulo}
                    onChange={(e) =>
                      setNovoAgendamento((prev) => ({
                        ...prev,
                        imovelTitulo: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="duracao">Duração (minutos)</Label>
                  <Select
                    value={novoAgendamento.duracao.toString()}
                    onValueChange={(value) =>
                      setNovoAgendamento((prev) => ({
                        ...prev,
                        duracao: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h 30min</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="imovelEndereco">Endereço do Imóvel</Label>
                <Input
                  id="imovelEndereco"
                  value={novoAgendamento.imovelEndereco}
                  onChange={(e) =>
                    setNovoAgendamento((prev) => ({
                      ...prev,
                      imovelEndereco: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={novoAgendamento.observacoes}
                  onChange={(e) =>
                    setNovoAgendamento((prev) => ({
                      ...prev,
                      observacoes: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewEvent(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={criarAgendamento}
                  disabled={
                    loading ||
                    !novoAgendamento.clienteNome ||
                    !novoAgendamento.dataHora
                  }
                >
                  {loading ? "Criando..." : "Criar Agendamento"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
