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
  Smartphone,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3,
  Copy,
  ExternalLink,
  PlayCircle,
  PauseCircle,
  Activity,
  Zap,
  Target,
  Send,
  Phone,
  Calendar,
  User,
  TrendingUp,
  Eye,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

interface WhatsAppConfig {
  whatsapp: string;
  ativo: boolean;
  evolutionApiUrl?: string;
  evolutionToken?: string;
  n8nWebhookUrl?: string;
  fallbackMessage?: string;
  responseDelay?: number;
}

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  mensagem: string;
  status: "pendente" | "assumido" | "expirado";
  origem: string;
  criadoEm: Date;
  corretorId?: string;
  corretorNome?: string;
}

interface WhatsAppMessage {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  type: "incoming" | "outgoing";
  status: "sent" | "delivered" | "read";
}

interface WhatsAppStats {
  totalLeads: number;
  leadsRespondidos: number;
  tempoMedioResposta: number;
  taxaConversao: number;
  mensagensEnviadas: number;
  mensagensRecebidas: number;
  corretoresAtivos: number;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: "greeting" | "lead_response" | "follow_up" | "closing";
  variables: string[];
}

export function WhatsAppIntegration({
  userRole,
}: {
  userRole: "CORRETOR" | "ASSISTENTE";
}) {
  const [config, setConfig] = useState<WhatsAppConfig>({
    whatsapp: "",
    ativo: false,
    fallbackMessage:
      "No momento não temos corretores disponíveis. Entraremos em contato em breve.",
    responseDelay: 2,
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [stats, setStats] = useState<WhatsAppStats>({
    totalLeads: 0,
    leadsRespondidos: 0,
    tempoMedioResposta: 0,
    taxaConversao: 0,
    mensagensEnviadas: 0,
    mensagensRecebidas: 0,
    corretoresAtivos: 0,
  });
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("config");
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    carregarDados();
    carregarTemplates();
    const interval = setInterval(carregarMensagens, 10000); // Atualizar mensagens a cada 10s
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem("token");
      const [configResponse, leadsResponse, statsResponse] = await Promise.all([
        fetch("/api/whatsapp/config", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/whatsapp/leads", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/whatsapp/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfig(configData);
        setIsConnected(!!configData.evolutionToken);
      }

      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setLeads(leadsData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const carregarMensagens = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/whatsapp/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const carregarTemplates = () => {
    const templatesDefault: MessageTemplate[] = [
      {
        id: "1",
        name: "Boas-vindas",
        content:
          "Olá {{nome}}! Obrigado pelo contato. Sou {{corretor}} da Siqueira Campos Imóveis. Como posso ajudá-lo?",
        category: "greeting",
        variables: ["nome", "corretor"],
      },
      {
        id: "2",
        name: "Resposta Lead",
        content:
          "Olá {{nome}}! Vi seu interesse no imóvel {{imovel}}. Posso agendar uma visita para você. Quando seria melhor?",
        category: "lead_response",
        variables: ["nome", "imovel"],
      },
      {
        id: "3",
        name: "Follow-up",
        content:
          "Olá {{nome}}! Como está? Gostaria de saber se ainda tem interesse no imóvel que conversamos. Posso esclarecer alguma dúvida?",
        category: "follow_up",
        variables: ["nome"],
      },
      {
        id: "4",
        name: "Proposta",
        content:
          "{{nome}}, preparei uma proposta especial para o imóvel. Você gostaria de conversar sobre as condições?",
        category: "closing",
        variables: ["nome"],
      },
    ];
    setTemplates(templatesDefault);
  };

  const salvarConfig = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/whatsapp/config", {
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

  const testarConexao = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ whatsapp: config.whatsapp }),
      });

      if (response.ok) {
        setMessage("Conexão testada com sucesso!");
        setIsConnected(true);
      } else {
        setError("Falha na conexão. Verifique as configurações.");
        setIsConnected(false);
      }
    } catch (err) {
      setError("Erro ao testar conexão.");
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async (telefone: string, mensagem: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ telefone, mensagem }),
      });

      if (response.ok) {
        setMessage("Mensagem enviada com sucesso!");
        carregarMensagens();
      } else {
        setError("Erro ao enviar mensagem");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const assumirLead = async (leadId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/whatsapp/leads/${leadId}/assumir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Lead assumido com sucesso!");
        carregarDados();
      } else {
        setError("Erro ao assumir lead");
      }
    } catch (err) {
      setError("Erro de conexão");
    }
  };

  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    }
    return numbers;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage("Texto copiado!");
  };

  const abrirWhatsAppWeb = (telefone: string, mensagem?: string) => {
    const cleanPhone = telefone.replace(/\D/g, "");
    const encodedMessage = mensagem ? encodeURIComponent(mensagem) : "";
    const url = `https://web.whatsapp.com/send?phone=55${cleanPhone}${mensagem ? `&text=${encodedMessage}` : ""}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <span>WhatsApp Business</span>
            {isConnected ? (
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
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Configuração */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp">Número WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(62) 9 8556-3505"
                    value={formatarTelefone(config.whatsapp)}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        whatsapp: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="evolutionUrl">Evolution API URL</Label>
                  <Input
                    id="evolutionUrl"
                    placeholder="https://api.evolution.com/instance/123"
                    value={config.evolutionApiUrl || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        evolutionApiUrl: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="evolutionToken">Evolution API Token</Label>
                  <Input
                    id="evolutionToken"
                    type="password"
                    placeholder="Token da Evolution API"
                    value={config.evolutionToken || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        evolutionToken: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="n8nWebhook">N8N Webhook URL</Label>
                  <Input
                    id="n8nWebhook"
                    placeholder="https://n8n.exemplo.com/webhook/lead-site"
                    value={config.n8nWebhookUrl || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        n8nWebhookUrl: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fallbackMessage">Mensagem de Fallback</Label>
                  <Textarea
                    id="fallbackMessage"
                    placeholder="Mensagem quando nenhum corretor está disponível"
                    value={config.fallbackMessage || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        fallbackMessage: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="responseDelay">
                    Delay de Resposta (segundos)
                  </Label>
                  <Input
                    id="responseDelay"
                    type="number"
                    min="1"
                    max="60"
                    value={config.responseDelay || 2}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        responseDelay: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label>Status de Recebimento</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativo para receber leads automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={config.ativo}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, ativo: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={testarConexao}
                variant="outline"
                disabled={loading}
              >
                <Activity className="h-4 w-4 mr-2" />
                Testar Conexão
              </Button>
              <Button
                onClick={salvarConfig}
                disabled={loading || !config.whatsapp}
              >
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </TabsContent>

          {/* Leads */}
          <TabsContent value="leads" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Leads Recebidos</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {leads.map((lead) => (
                <Card key={lead.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{lead.nome}</h4>
                        <Badge
                          variant={
                            lead.status === "assumido"
                              ? "default"
                              : lead.status === "pendente"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {lead.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{lead.origem}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        📞 {formatarTelefone(lead.telefone)}
                      </p>
                      <p className="text-sm">{lead.mensagem}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {lead.criadoEm.toLocaleString("pt-BR")}
                        {lead.corretorNome &&
                          ` • Assumido por ${lead.corretorNome}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {lead.status === "pendente" &&
                        userRole === "CORRETOR" && (
                          <Button
                            size="sm"
                            onClick={() => assumirLead(lead.id)}
                          >
                            Assumir
                          </Button>
                        )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirWhatsAppWeb(lead.telefone)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mensagens */}
          <TabsContent value="messages" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Chat WhatsApp</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://web.whatsapp.com", "_blank")
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir WhatsApp Web
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 ${
                    msg.type === "outgoing" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-xs ${
                      msg.type === "outgoing"
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.type === "outgoing"
                          ? "text-green-100"
                          : "text-gray-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("pt-BR")} • {msg.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && selectedLead && newMessage) {
                    enviarMensagem(selectedLead.telefone, newMessage);
                    setNewMessage("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (selectedLead && newMessage) {
                    enviarMensagem(selectedLead.telefone, newMessage);
                    setNewMessage("");
                  }
                }}
                disabled={!selectedLead || !newMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Templates de Mensagem</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(template.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.content}
                  </p>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge
                          key={variable}
                          variant="secondary"
                          className="text-xs"
                        >
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Leads
                    </p>
                    <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Taxa de Resposta
                    </p>
                    <p className="text-2xl font-bold">
                      {(
                        (stats.leadsRespondidos / stats.totalLeads) * 100 || 0
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    <p className="text-2xl font-bold">
                      {stats.tempoMedioResposta}min
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Corretores Ativos
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.corretoresAtivos}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Gráfico de performance seria implementado aqui
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status dos Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Pendentes</span>
                      <Badge variant="secondary">
                        {leads.filter((l) => l.status === "pendente").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Assumidos</span>
                      <Badge variant="default">
                        {leads.filter((l) => l.status === "assumido").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Expirados</span>
                      <Badge variant="destructive">
                        {leads.filter((l) => l.status === "expirado").length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
