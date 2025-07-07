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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Server,
  Database,
  Code,
  Monitor,
  Globe,
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Terminal,
  GitBranch,
  Bug,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Key,
  Lock,
  Unlock,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  Users,
  Home,
  Target,
} from "lucide-react";
import { SystemMonitoring } from "@/components/SystemMonitoring";

interface SystemStats {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  apiRequests: number;
  errorRate: number;
  responseTime: number;
  databaseConnections: number;
  serverStatus: "ONLINE" | "OFFLINE" | "MAINTENANCE";
}

interface SecurityEvent {
  id: string;
  type:
    | "LOGIN_ATTEMPT"
    | "ACCESS_DENIED"
    | "SUSPICIOUS_ACTIVITY"
    | "DATA_BREACH";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  ip: string;
  userAgent?: string;
  timestamp: Date;
  resolved: boolean;
}

interface BackupInfo {
  id: string;
  type: "FULL" | "INCREMENTAL" | "DATABASE";
  size: string;
  status: "COMPLETED" | "RUNNING" | "FAILED";
  timestamp: Date;
  duration: string;
}

interface ApiEndpoint {
  id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  status: "ACTIVE" | "DEPRECATED" | "MAINTENANCE";
  requests24h: number;
  avgResponseTime: number;
  errorRate: number;
  lastUsed: Date;
}

export default function DesenvolvedorDashboard() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Simular dados do sistema
      const statsSimuladas: SystemStats = {
        uptime: "15d 8h 42m",
        cpuUsage: Math.floor(Math.random() * 30) + 10,
        memoryUsage: Math.floor(Math.random() * 40) + 30,
        diskUsage: 67,
        activeUsers: Math.floor(Math.random() * 50) + 20,
        apiRequests: Math.floor(Math.random() * 1000) + 5000,
        errorRate: Math.random() * 2,
        responseTime: Math.floor(Math.random() * 100) + 50,
        databaseConnections: Math.floor(Math.random() * 10) + 5,
        serverStatus: "ONLINE",
      };

      const securityEventsSimulados: SecurityEvent[] = [
        {
          id: "1",
          type: "SUSPICIOUS_ACTIVITY",
          severity: "HIGH",
          message: "Múltiplas tentativas de login falharam para admin",
          ip: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          timestamp: new Date(),
          resolved: false,
        },
        {
          id: "2",
          type: "LOGIN_ATTEMPT",
          severity: "LOW",
          message: "Login bem-sucedido de novo dispositivo",
          ip: "192.168.1.105",
          timestamp: new Date(Date.now() - 3600000),
          resolved: true,
        },
        {
          id: "3",
          type: "ACCESS_DENIED",
          severity: "MEDIUM",
          message: "Tentativa de acesso negada ao endpoint /api/admin",
          ip: "203.0.113.42",
          timestamp: new Date(Date.now() - 7200000),
          resolved: true,
        },
      ];

      const backupsSimulados: BackupInfo[] = [
        {
          id: "1",
          type: "FULL",
          size: "2.3 GB",
          status: "COMPLETED",
          timestamp: new Date(),
          duration: "15m 32s",
        },
        {
          id: "2",
          type: "DATABASE",
          size: "450 MB",
          status: "COMPLETED",
          timestamp: new Date(Date.now() - 86400000),
          duration: "3m 45s",
        },
        {
          id: "3",
          type: "INCREMENTAL",
          size: "156 MB",
          status: "COMPLETED",
          timestamp: new Date(Date.now() - 172800000),
          duration: "1m 23s",
        },
      ];

      const apiEndpointsSimulados: ApiEndpoint[] = [
        {
          id: "1",
          path: "/api/imoveis",
          method: "GET",
          status: "ACTIVE",
          requests24h: 1543,
          avgResponseTime: 89,
          errorRate: 0.2,
          lastUsed: new Date(),
        },
        {
          id: "2",
          path: "/api/leads",
          method: "POST",
          status: "ACTIVE",
          requests24h: 234,
          avgResponseTime: 156,
          errorRate: 1.1,
          lastUsed: new Date(Date.now() - 300000),
        },
        {
          id: "3",
          path: "/api/usuarios",
          method: "GET",
          status: "ACTIVE",
          requests24h: 567,
          avgResponseTime: 67,
          errorRate: 0.5,
          lastUsed: new Date(Date.now() - 600000),
        },
        {
          id: "4",
          path: "/api/auth/login",
          method: "POST",
          status: "ACTIVE",
          requests24h: 89,
          avgResponseTime: 234,
          errorRate: 5.6,
          lastUsed: new Date(Date.now() - 1800000),
        },
      ];

      setSystemStats(statsSimuladas);
      setSecurityEvents(securityEventsSimulados);
      setBackups(backupsSimulados);
      setApiEndpoints(apiEndpointsSimulados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
      case "COMPLETED":
      case "ACTIVE":
        return "text-green-600";
      case "MAINTENANCE":
      case "RUNNING":
        return "text-yellow-600";
      case "OFFLINE":
      case "FAILED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "bg-blue-100 text-blue-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    status,
    description,
    color = "primary",
  }: {
    title: string;
    value: string | number;
    icon: any;
    status?: string;
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
            {status && (
              <Badge
                className={`mt-2 ${getStatusColor(status)} bg-transparent`}
                variant="outline"
              >
                {status}
              </Badge>
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
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Técnico
            </h1>
            <p className="text-muted-foreground">
              Monitoramento e administração do sistema
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="maintenance-mode">Modo Manutenção</Label>
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
            <Button variant="outline" size="sm" onClick={carregarDados}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
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
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="api">APIs</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {systemStats && (
              <>
                {/* Status Geral do Sistema */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Status do Servidor"
                    value={systemStats.serverStatus}
                    icon={Server}
                    status={systemStats.serverStatus}
                    description={`Uptime: ${systemStats.uptime}`}
                    color="green"
                  />
                  <MetricCard
                    title="Usuários Ativos"
                    value={systemStats.activeUsers}
                    icon={Users}
                    description="Sessões ativas no sistema"
                    color="blue"
                  />
                  <MetricCard
                    title="Requisições API"
                    value={systemStats.apiRequests.toLocaleString()}
                    icon={Activity}
                    description="Últimas 24 horas"
                    color="purple"
                  />
                  <MetricCard
                    title="Taxa de Erro"
                    value={`${systemStats.errorRate.toFixed(2)}%`}
                    icon={AlertTriangle}
                    description="Últimas 24 horas"
                    color={systemStats.errorRate > 5 ? "red" : "green"}
                  />
                </div>

                {/* Métricas de Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Uso da CPU</h4>
                        <Cpu className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{systemStats.cpuUsage}%</span>
                          <span
                            className={
                              systemStats.cpuUsage > 80
                                ? "text-red-600"
                                : systemStats.cpuUsage > 60
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }
                          >
                            {systemStats.cpuUsage > 80
                              ? "Alto"
                              : systemStats.cpuUsage > 60
                                ? "Médio"
                                : "Normal"}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              systemStats.cpuUsage > 80
                                ? "bg-red-600"
                                : systemStats.cpuUsage > 60
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                            }`}
                            style={{ width: `${systemStats.cpuUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Memória RAM</h4>
                        <HardDrive className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{systemStats.memoryUsage}%</span>
                          <span
                            className={
                              systemStats.memoryUsage > 85
                                ? "text-red-600"
                                : systemStats.memoryUsage > 70
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }
                          >
                            {systemStats.memoryUsage > 85
                              ? "Alto"
                              : systemStats.memoryUsage > 70
                                ? "Médio"
                                : "Normal"}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              systemStats.memoryUsage > 85
                                ? "bg-red-600"
                                : systemStats.memoryUsage > 70
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                            }`}
                            style={{ width: `${systemStats.memoryUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Disco</h4>
                        <Database className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{systemStats.diskUsage}%</span>
                          <span
                            className={
                              systemStats.diskUsage > 90
                                ? "text-red-600"
                                : systemStats.diskUsage > 75
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }
                          >
                            {systemStats.diskUsage > 90
                              ? "Crítico"
                              : systemStats.diskUsage > 75
                                ? "Atenção"
                                : "Normal"}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              systemStats.diskUsage > 90
                                ? "bg-red-600"
                                : systemStats.diskUsage > 75
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                            }`}
                            style={{ width: `${systemStats.diskUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Resp. Média</h4>
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{systemStats.responseTime}ms</span>
                          <span
                            className={
                              systemStats.responseTime > 500
                                ? "text-red-600"
                                : systemStats.responseTime > 200
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }
                          >
                            {systemStats.responseTime > 500
                              ? "Lento"
                              : systemStats.responseTime > 200
                                ? "Médio"
                                : "Rápido"}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              systemStats.responseTime > 500
                                ? "bg-red-600"
                                : systemStats.responseTime > 200
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                            }`}
                            style={{
                              width: `${Math.min((systemStats.responseTime / 1000) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alertas Críticos */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Alertas do Sistema</h3>
                  {systemStats.diskUsage > 90 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Espaço em Disco Crítico</AlertTitle>
                      <AlertDescription>
                        O espaço em disco está {systemStats.diskUsage}% ocupado.
                        Considere fazer limpeza ou expandir o armazenamento.
                      </AlertDescription>
                    </Alert>
                  )}
                  {systemStats.errorRate > 5 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Taxa de Erro Elevada</AlertTitle>
                      <AlertDescription>
                        A taxa de erro atual é{" "}
                        {systemStats.errorRate.toFixed(2)}%. Verifique os logs
                        para identificar problemas.
                      </AlertDescription>
                    </Alert>
                  )}
                  {systemStats.cpuUsage > 80 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Uso Alto de CPU</AlertTitle>
                      <AlertDescription>
                        A CPU está {systemStats.cpuUsage}% ocupada. Monitor os
                        processos em execução.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Monitoramento */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Monitoramento em Tempo Real
              </h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Logs
                </Button>
                <Button variant="outline" size="sm">
                  <Terminal className="h-4 w-4 mr-2" />
                  Console
                </Button>
              </div>
            </div>

            {/* Logs do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600">[INFO]</span>
                    <span className="text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <span>Sistema iniciado com sucesso</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">[DEBUG]</span>
                    <span className="text-muted-foreground">
                      {new Date(Date.now() - 60000).toLocaleTimeString()}
                    </span>
                    <span>Conexão com banco de dados estabelecida</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-600">[WARN]</span>
                    <span className="text-muted-foreground">
                      {new Date(Date.now() - 120000).toLocaleTimeString()}
                    </span>
                    <span>Taxa de CPU alta detectada: 85%</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600">[INFO]</span>
                    <span className="text-muted-foreground">
                      {new Date(Date.now() - 180000).toLocaleTimeString()}
                    </span>
                    <span>Backup automático concluído</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-red-600">[ERROR]</span>
                    <span className="text-muted-foreground">
                      {new Date(Date.now() - 240000).toLocaleTimeString()}
                    </span>
                    <span>Falha na autenticação para IP 203.0.113.42</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Performance em Tempo Real */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Requisições por Minuto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Gráfico de requisições em tempo real
                    <br />
                    (Implementação do gráfico seria aqui)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Gráfico de tempo de resposta
                    <br />
                    (Implementação do gráfico seria aqui)
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Centro de Segurança</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Scan Segurança
                </Button>
                <Button variant="outline" size="sm">
                  <Lock className="h-4 w-4 mr-2" />
                  Auditoria
                </Button>
              </div>
            </div>

            {/* Eventos de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle>Eventos de Segurança Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            event.resolved ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-semibold">{event.message}</p>
                          <p className="text-sm text-muted-foreground">
                            IP: {event.ip} •{" "}
                            {event.timestamp.toLocaleString("pt-BR")}
                          </p>
                          {event.userAgent && (
                            <p className="text-xs text-muted-foreground">
                              User Agent: {event.userAgent}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!event.resolved && (
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Segurança */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Acesso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-muted-foreground">
                        Requer código adicional no login
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Bloqueio por IP</Label>
                      <p className="text-sm text-muted-foreground">
                        Bloquear IPs suspeitos automaticamente
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Log de Auditoria</Label>
                      <p className="text-sm text-muted-foreground">
                        Registrar todas as ações do sistema
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificados SSL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        siqueicamposimoveis.com.br
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Válido até: 15/08/2025
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Válido
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        api.siqueicamposimoveis.com.br
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Válido até: 22/07/2025
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Válido
                    </Badge>
                  </div>
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renovar Certificados
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backups */}
          <TabsContent value="backups" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Backups</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Backup
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Backup
                </Button>
              </div>
            </div>

            {/* Histórico de Backups */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Database className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">Backup {backup.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {backup.timestamp.toLocaleString("pt-BR")} •{" "}
                            {backup.size} • Duração: {backup.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            backup.status === "COMPLETED"
                              ? "default"
                              : backup.status === "RUNNING"
                                ? "secondary"
                                : "destructive"
                          }
                          className={getStatusColor(backup.status)}
                        >
                          {backup.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Backup */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Backup Automático</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequência de Backup</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="monthly">Mensalmente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Retenção (dias)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Executar backups automaticamente
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar email sobre status dos backups
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APIs */}
          <TabsContent value="api" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Monitoramento de APIs</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Endpoint
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Documentação
                </Button>
              </div>
            </div>

            {/* Lista de Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Endpoints da API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={
                            endpoint.method === "GET"
                              ? "default"
                              : endpoint.method === "POST"
                                ? "secondary"
                                : endpoint.method === "PUT"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <div>
                          <p className="font-bold">{endpoint.path}</p>
                          <p className="text-sm text-muted-foreground">
                            Última requisição:{" "}
                            {endpoint.lastUsed.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-xl font-bold">
                            {endpoint.requests24h}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requisições
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">
                            {endpoint.avgResponseTime}ms
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Resp. Média
                          </p>
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-xl font-bold ${
                              endpoint.errorRate > 5
                                ? "text-red-600"
                                : endpoint.errorRate > 2
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {endpoint.errorRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Erro</p>
                        </div>
                        <Badge
                          variant={
                            endpoint.status === "ACTIVE"
                              ? "default"
                              : endpoint.status === "DEPRECATED"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {endpoint.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="config" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Config
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Config
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configurações Gerais */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Sistema</Label>
                    <Input defaultValue="Siqueira Campos Imóveis" />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Base</Label>
                    <Input defaultValue="https://siqueicamposimoveis.com.br" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Administrador</Label>
                    <Input defaultValue="admin@siqueicamposimoveis.com.br" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="America/Sao_Paulo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">
                          America/Sao_Paulo
                        </SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Notificação */}
              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas de Sistema</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber alertas críticos por email
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Relatórios Diários</Label>
                      <p className="text-sm text-muted-foreground">
                        Relatório diário de performance
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações de Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Status dos backups automáticos
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Email para Alertas</Label>
                    <Input defaultValue="admin@siqueicamposimoveis.com.br" />
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cache TTL (segundos)</Label>
                    <Input type="number" defaultValue="3600" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Connections DB</Label>
                    <Input type="number" defaultValue="20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Limit (req/min)</Label>
                    <Input type="number" defaultValue="100" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compressão GZIP</Label>
                      <p className="text-sm text-muted-foreground">
                        Comprimir respostas da API
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Segurança */}
              <Card>
                <CardHeader>
                  <CardTitle>Segurança Avançada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tempo Sessão (minutos)</Label>
                    <Input type="number" defaultValue="60" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tentativas Login</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>CORS Habilitado</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir requisições cross-origin
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>HTTPS Obrigatório</Label>
                      <p className="text-sm text-muted-foreground">
                        Redirecionar HTTP para HTTPS
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Configurações</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
