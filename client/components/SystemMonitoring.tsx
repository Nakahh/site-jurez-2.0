import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  Zap,
  RefreshCw,
  Activity,
  Clock,
  Shield,
  Globe,
  Monitor,
  Settings,
} from "lucide-react";

interface SystemStatus {
  name: string;
  status: "ONLINE" | "OFFLINE" | "WARNING" | "ERROR";
  uptime: string;
  lastCheck: Date;
  responseTime: number;
  details?: string;
}

interface ServerMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
  errors: number;
}

interface SystemAlert {
  id: string;
  type: "WARNING" | "ERROR" | "INFO";
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function SystemMonitoring() {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [metrics, setMetrics] = useState<ServerMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    connections: 0,
    errors: 0,
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Initialize systems
    const initialSystems: SystemStatus[] = [
      {
        name: "API Principal",
        status: "ONLINE",
        uptime: "99.9%",
        lastCheck: new Date(),
        responseTime: 45,
        details: "Todas as rotas funcionando normalmente",
      },
      {
        name: "Banco de Dados",
        status: "ONLINE",
        uptime: "99.8%",
        lastCheck: new Date(),
        responseTime: 12,
        details: "PostgreSQL - Pool de conexões: 8/20",
      },
      {
        name: "Sistema de Arquivos",
        status: "WARNING",
        uptime: "98.5%",
        lastCheck: new Date(),
        responseTime: 150,
        details: "Espaço em disco baixo (15% livre)",
      },
      {
        name: "Serviço de Email",
        status: "ONLINE",
        uptime: "99.2%",
        lastCheck: new Date(),
        responseTime: 200,
        details: "SMTP configurado - Fila: 2 emails",
      },
      {
        name: "CDN/Assets",
        status: "ONLINE",
        uptime: "99.9%",
        lastCheck: new Date(),
        responseTime: 25,
        details: "CloudFlare - Cache hit rate: 94%",
      },
      {
        name: "Sistema de Backup",
        status: "ONLINE",
        uptime: "100%",
        lastCheck: new Date(),
        responseTime: 0,
        details: "Último backup: 02:00 - Sucesso",
      },
    ];

    setSystems(initialSystems);
    generateRandomMetrics();
    generateSystemAlerts();
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      updateSystemStatus();
      generateRandomMetrics();
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const generateRandomMetrics = () => {
    setMetrics({
      cpu: Math.random() * 100,
      memory: 60 + Math.random() * 30,
      disk: 75 + Math.random() * 10,
      network: Math.random() * 50,
      connections: Math.floor(50 + Math.random() * 100),
      errors: Math.floor(Math.random() * 5),
    });
  };

  const updateSystemStatus = () => {
    setSystems((prev) =>
      prev.map((system) => {
        const randomChange = Math.random();
        let newStatus = system.status;

        // Small chance of status change
        if (randomChange < 0.02) {
          // 2% chance of change
          if (system.status === "ONLINE") {
            newStatus = Math.random() < 0.7 ? "WARNING" : "ERROR";
          } else if (system.status === "WARNING") {
            newStatus = Math.random() < 0.5 ? "ONLINE" : "ERROR";
          } else if (system.status === "ERROR") {
            newStatus = "WARNING";
          }
        } else if (randomChange < 0.05 && system.status !== "ONLINE") {
          // 3% chance of recovery
          newStatus = "ONLINE";
        }

        return {
          ...system,
          status: newStatus,
          lastCheck: new Date(),
          responseTime: system.responseTime + (Math.random() - 0.5) * 20,
        };
      }),
    );
  };

  const generateSystemAlerts = () => {
    const initialAlerts: SystemAlert[] = [
      {
        id: "1",
        type: "WARNING",
        title: "Espaço em Disco Baixo",
        message: "Sistema de arquivos com apenas 15% de espaço livre",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        resolved: false,
      },
      {
        id: "2",
        type: "INFO",
        title: "Backup Concluído",
        message: "Backup automático realizado com sucesso às 02:00",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolved: true,
      },
      {
        id: "3",
        type: "ERROR",
        title: "Falha na Conexão Externa",
        message: "API externa de CEP temporariamente indisponível",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        resolved: true,
      },
    ];

    setAlerts(initialAlerts);
  };

  const getStatusColor = (status: SystemStatus["status"]) => {
    switch (status) {
      case "ONLINE":
        return "text-green-600 bg-green-100";
      case "WARNING":
        return "text-yellow-600 bg-yellow-100";
      case "ERROR":
        return "text-red-600 bg-red-100";
      case "OFFLINE":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: SystemStatus["status"]) => {
    switch (status) {
      case "ONLINE":
        return <CheckCircle className="h-4 w-4" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4" />;
      case "ERROR":
        return <AlertTriangle className="h-4 w-4" />;
      case "OFFLINE":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleFixSystem = async (systemName: string) => {
    try {
      // Simulate system fix
      setSystems((prev) =>
        prev.map((system) =>
          system.name === systemName
            ? {
                ...system,
                status: "ONLINE",
                details: "Sistema restaurado automaticamente",
              }
            : system,
        ),
      );

      // Add success alert
      const newAlert: SystemAlert = {
        id: Date.now().toString(),
        type: "INFO",
        title: "Sistema Restaurado",
        message: `${systemName} foi restaurado com sucesso`,
        timestamp: new Date(),
        resolved: true,
      };

      setAlerts((prev) => [newAlert, ...prev]);
      alert(`${systemName} foi restaurado com sucesso!`);
    } catch (error) {
      alert("Erro ao tentar restaurar o sistema. Contate o suporte técnico.");
    }
  };

  const handleRestartService = async (systemName: string) => {
    try {
      // Simulate service restart
      setSystems((prev) =>
        prev.map((system) =>
          system.name === systemName
            ? { ...system, status: "ONLINE", details: "Serviço reiniciado" }
            : system,
        ),
      );

      alert(`${systemName} foi reiniciado com sucesso!`);
    } catch (error) {
      alert("Erro ao reiniciar o serviço.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento do Sistema</h2>
          <p className="text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateSystemStatus();
              generateRandomMetrics();
              setLastUpdate(new Date());
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systems.map((system) => (
          <Card key={system.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{system.name}</CardTitle>
                <Badge className={getStatusColor(system.status)}>
                  {getStatusIcon(system.status)}
                  <span className="ml-1">{system.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Uptime:</span>
                  <span className="font-semibold">{system.uptime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Resposta:</span>
                  <span className="font-semibold">
                    {Math.round(system.responseTime)}ms
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {system.details}
                </div>
                <div className="text-xs text-muted-foreground">
                  Última verificação:{" "}
                  {system.lastCheck.toLocaleTimeString("pt-BR")}
                </div>

                {system.status !== "ONLINE" && (
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleFixSystem(system.name)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Corrigir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleRestartService(system.name)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reiniciar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Server Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas do Servidor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <span className="text-sm font-bold">
                  {Math.round(metrics.cpu)}%
                </span>
              </div>
              <Progress value={metrics.cpu} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Memória</span>
                </div>
                <span className="text-sm font-bold">
                  {Math.round(metrics.memory)}%
                </span>
              </div>
              <Progress value={metrics.memory} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Disco</span>
                </div>
                <span className="text-sm font-bold">
                  {Math.round(metrics.disk)}%
                </span>
              </div>
              <Progress value={metrics.disk} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Rede</span>
                </div>
                <span className="text-sm font-bold">
                  {Math.round(metrics.network)} MB/s
                </span>
              </div>
              <Progress value={(metrics.network / 50) * 100} className="h-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>Conexões Ativas</span>
              </div>
              <span className="text-lg font-bold">{metrics.connections}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Erros/Min</span>
              </div>
              <span className="text-lg font-bold">{metrics.errors}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum alerta ativo
              </p>
            ) : (
              alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={`${
                    alert.type === "ERROR"
                      ? "border-red-200 bg-red-50"
                      : alert.type === "WARNING"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                  } ${alert.resolved ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {alert.type === "ERROR" && (
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      {alert.type === "WARNING" && (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      {alert.type === "INFO" && (
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <AlertDescription className="text-sm">
                          {alert.message}
                        </AlertDescription>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.timestamp.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          Resolvido
                        </Badge>
                      )}
                      {!alert.resolved && alert.type !== "INFO" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setAlerts((prev) =>
                              prev.map((a) =>
                                a.id === alert.id
                                  ? { ...a, resolved: true }
                                  : a,
                              ),
                            )
                          }
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
