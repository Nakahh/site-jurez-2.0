import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  Server,
  Database,
  Code,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Shield,
  Zap,
  Activity,
  RefreshCw,
  Terminal,
  Bug,
  GitBranch,
  Monitor,
  FileText,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";

interface SystemStats {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  responseTime: number;
}

interface LogEntry {
  id: string;
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  message: string;
  timestamp: string;
  source: string;
}

interface PerformanceData {
  time: string;
  requests: number;
  errors: number;
  responseTime: number;
  cpu: number;
  memory: number;
}

const performanceData: PerformanceData[] = [
  {
    time: "00:00",
    requests: 150,
    errors: 2,
    responseTime: 245,
    cpu: 35,
    memory: 68,
  },
  {
    time: "04:00",
    requests: 89,
    errors: 1,
    responseTime: 189,
    cpu: 25,
    memory: 65,
  },
  {
    time: "08:00",
    requests: 320,
    errors: 5,
    responseTime: 312,
    cpu: 45,
    memory: 72,
  },
  {
    time: "12:00",
    requests: 450,
    errors: 8,
    responseTime: 387,
    cpu: 65,
    memory: 78,
  },
  {
    time: "16:00",
    requests: 380,
    errors: 6,
    responseTime: 298,
    cpu: 55,
    memory: 75,
  },
  {
    time: "20:00",
    requests: 290,
    errors: 3,
    responseTime: 234,
    cpu: 40,
    memory: 70,
  },
];

const logs: LogEntry[] = [
  {
    id: "1",
    level: "INFO",
    message: "Sistema iniciado com sucesso",
    timestamp: "2024-01-20T10:30:00Z",
    source: "system",
  },
  {
    id: "2",
    level: "WARNING",
    message: "Uso de memória acima de 75%",
    timestamp: "2024-01-20T10:28:00Z",
    source: "monitor",
  },
  {
    id: "3",
    level: "ERROR",
    message: "Falha na conexão com banco de dados",
    timestamp: "2024-01-20T10:25:00Z",
    source: "database",
  },
  {
    id: "4",
    level: "INFO",
    message: "Backup automático concluído",
    timestamp: "2024-01-20T10:20:00Z",
    source: "backup",
  },
  {
    id: "5",
    level: "DEBUG",
    message: "Query executada: SELECT * FROM usuarios",
    timestamp: "2024-01-20T10:15:00Z",
    source: "database",
  },
];

export default function DesenvolvedorDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    uptime: "0d 0h 0m",
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    activeUsers: 0,
    totalRequests: 0,
    errorRate: 0,
    responseTime: 0,
  });

  const [logLevel, setLogLevel] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados do sistema
    setTimeout(() => {
      setStats({
        uptime: "15d 8h 42m",
        cpuUsage: 45,
        memoryUsage: 68,
        diskUsage: 34,
        activeUsers: 127,
        totalRequests: 45280,
        errorRate: 0.8,
        responseTime: 298,
      });
      setLoading(false);
    }, 1000);

    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        cpuUsage: Math.max(
          20,
          Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10),
        ),
        memoryUsage: Math.max(
          50,
          Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5),
        ),
        activeUsers: Math.max(
          80,
          Math.min(
            200,
            prev.activeUsers + Math.floor((Math.random() - 0.5) * 20),
          ),
        ),
        responseTime: Math.max(
          150,
          Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50),
        ),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (uptime: string) => uptime;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num);
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800";
      case "INFO":
        return "bg-blue-100 text-blue-800";
      case "DEBUG":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLogs =
    logLevel === "ALL" ? logs : logs.filter((log) => log.level === logLevel);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-800">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Dashboard Developer
              </h1>
              <p className="text-slate-700">
                Monitoramento e administração do sistema
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <Activity className="w-3 h-3 mr-1" />
                Sistema Online
              </Badge>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Console
              </Button>
              <Button className="bg-slate-600 hover:bg-slate-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800">
                Uptime
              </CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatUptime(stats.uptime)}
              </div>
              <p className="text-xs text-slate-600">Sistema estável</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800">
                Usuários Ativos
              </CardTitle>
              <Monitor className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.activeUsers)}
              </div>
              <p className="text-xs text-slate-600">Conectados agora</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800">
                Requests Total
              </CardTitle>
              <Network className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatNumber(stats.totalRequests)}
              </div>
              <p className="text-xs text-slate-600">Hoje</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-800">
                Tempo Resposta
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.responseTime}ms
              </div>
              <p className="text-xs text-slate-600">Média atual</p>
            </CardContent>
          </Card>
        </div>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Cpu className="w-5 h-5 mr-2" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Utilização</span>
                <span className="text-sm font-medium text-slate-900">
                  {stats.cpuUsage}%
                </span>
              </div>
              <Progress value={stats.cpuUsage} className="h-3 bg-slate-100" />
              <p className="text-xs text-slate-500 mt-2">4 cores / 8 threads</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Memory className="w-5 h-5 mr-2" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Utilização</span>
                <span className="text-sm font-medium text-slate-900">
                  {stats.memoryUsage}%
                </span>
              </div>
              <Progress
                value={stats.memoryUsage}
                className="h-3 bg-slate-100"
              />
              <p className="text-xs text-slate-500 mt-2">5.4GB / 8GB usados</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <HardDrive className="w-5 h-5 mr-2" />
                Disk Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Utilização</span>
                <span className="text-sm font-medium text-slate-900">
                  {stats.diskUsage}%
                </span>
              </div>
              <Progress value={stats.diskUsage} className="h-3 bg-slate-100" />
              <p className="text-xs text-slate-500 mt-2">34GB / 100GB usados</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Chart */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900">
                Performance em Tempo Real
              </CardTitle>
              <CardDescription>
                Monitoramento de requests e tempo de resposta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="responseTime"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Resources Chart */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900">
                Recursos do Sistema
              </CardTitle>
              <CardDescription>CPU e Memória ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* System Logs */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-slate-900">
                  Logs do Sistema
                </CardTitle>
                <CardDescription>
                  Monitoramento de eventos e erros
                </CardDescription>
              </div>
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-40 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os logs</SelectItem>
                  <SelectItem value="ERROR">Apenas erros</SelectItem>
                  <SelectItem value="WARNING">Apenas avisos</SelectItem>
                  <SelectItem value="INFO">Apenas info</SelectItem>
                  <SelectItem value="DEBUG">Apenas debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Badge className={getLogLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900 font-medium">
                            {log.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-slate-500">
                              {new Date(log.timestamp).toLocaleString("pt-BR")}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-xs border-slate-300 text-slate-600"
                            >
                              {log.source}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {log.level === "ERROR" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Bug className="w-3 h-3 mr-1" />
                          Investigar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-300"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Logs
                </Button>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Conexões:</span>
                  <span>45/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Queries/min:</span>
                  <span>1,240</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Server className="w-5 h-5 mr-2" />
                API Server
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-300"
                >
                  <Activity className="w-3 h-3 mr-1" />
                  Monitor
                </Button>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Requests/min:</span>
                  <span>2,850</span>
                </div>
                <div className="flex justify-between">
                  <span>Error rate:</span>
                  <span>{stats.errorRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Protected
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-300"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Audit
                </Button>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>SSL Status:</span>
                  <span>Valid</span>
                </div>
                <div className="flex justify-between">
                  <span>Last scan:</span>
                  <span>2h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChatBubble />
    </div>
  );
}
