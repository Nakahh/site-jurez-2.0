import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
import { CorretorStats, Lead, Imovel, Comissao } from "@shared/types";

interface WhatsAppIntegrationCardProps {
  onUpdate: () => void;
}

function WhatsAppIntegrationCard({ onUpdate }: WhatsAppIntegrationCardProps) {
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica máscara (XX) X XXXX-XXXX
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📱 <strong>Configure seu WhatsApp</strong> para receber
            automaticamente os leads atendidos pela nossa assistente
            inteligente. Quando você estiver com o status <strong>ATIVO</strong>
            , receberá os contatos por ordem de chegada.
          </p>
        </div>

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
            <p className="text-xs text-muted-foreground mt-1">
              Digite apenas números. Ex: 62985563505
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                Status para receber leads
              </Label>
              <p className="text-xs text-muted-foreground">
                Quando ativo, você receberá novos leads automaticamente
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={ativo}
                onCheckedChange={setAtivo}
                className="data-[state=checked]:bg-green-600"
              />
              <Badge variant={ativo ? "default" : "secondary"}>
                {ativo ? "ATIVO" : "INATIVO"}
              </Badge>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || !whatsapp}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </div>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ <strong>Como funciona:</strong> Quando um cliente enviar uma
            mensagem no site, você receberá uma notificação no WhatsApp.
            Responda com <strong>"ASSUMIR"</strong> para ficar responsável pelo
            atendimento.
          </p>
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
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
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
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
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

export default function CorretorDashboard() {
  const [stats, setStats] = useState<CorretorStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsRes, leadsRes, imoveisRes] = await Promise.all([
        fetch("/api/corretor/stats", { headers }),
        fetch("/api/corretor/leads?limit=5", { headers }),
        fetch("/api/corretor/imoveis?limit=5", { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.data);
      }

      if (imoveisRes.ok) {
        const imoveisData = await imoveisRes.json();
        setImoveis(imoveisData.data);
      }
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
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard do Corretor
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus leads, imóveis e configurações
            </p>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=150"
            alt="Siqueira Campos Imóveis"
            className="h-12 w-auto dark:hidden"
          />
        </div>

        {/* WhatsApp Integration */}
        <WhatsAppIntegrationCard onUpdate={carregarDados} />

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Meus Imóveis"
              value={stats.totalImoveis}
              icon={Home}
              description={`${stats.imoveisDisponiveis} disponíveis`}
            />
            <StatsCard
              title="Meus Leads"
              value={stats.totalLeads}
              icon={Users}
              description={`${stats.leadsAssumidos} assumidos`}
              trend={`${Math.round(stats.taxaConversaoLeads)}% taxa de conversão`}
            />
            <StatsCard
              title="Comissões"
              value={formatarPreco(stats.totalComissoes)}
              icon={DollarSign}
              description={`${formatarPreco(stats.comissoesPagas)} recebidas`}
            />
            <StatsCard
              title="Visitas Agendadas"
              value={stats.visitasAgendadas}
              icon={Calendar}
              description="Para esta semana"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leads Recentes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Leads Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum lead ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{lead.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lead.telefone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.mensagem.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            lead.status === "ASSUMIDO" ? "default" : "secondary"
                          }
                        >
                          {lead.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(lead.criadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Ver todos os leads
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meus Imóveis */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Meus Imóveis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imoveis.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum imóvel cadastrado</p>
                  <Button className="mt-4">Cadastrar Imóvel</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {imoveis.map((imovel) => (
                    <div
                      key={imovel.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{imovel.titulo}</h4>
                        <p className="text-sm text-muted-foreground">
                          {imovel.bairro}, {imovel.cidade}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatarPreco(Number(imovel.preco))}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            imovel.status === "DISPONIVEL"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {imovel.status}
                        </Badge>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Ver todos os imóveis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Atividade Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    Novo lead recebido para apartamento no Setor Bueno
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Há 2 horas - Via WhatsApp
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Visita agendada confirmada</p>
                  <p className="text-xs text-muted-foreground">
                    Há 4 horas - Casa Jardim Goiás
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Imóvel atualizado com sucesso</p>
                  <p className="text-xs text-muted-foreground">
                    Ontem - Preço alterado
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
