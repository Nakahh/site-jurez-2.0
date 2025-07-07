import { ReactNode } from "react";
import { SharedNavigation } from "./SharedNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  HelpCircle,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createDashboardActions } from "@/utils/dashboardActions";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showStats?: boolean;
  userRole?: string;
}

// Enhanced dashboard statistics
const getDashboardStats = (userRole: string) => {
  const baseStats = {
    ADMIN: [
      {
        label: "Total Imóveis",
        value: "1,234",
        change: "+12%",
        positive: true,
      },
      { label: "Usuários Ativos", value: "156", change: "+8%", positive: true },
      { label: "Vendas do Mês", value: "45", change: "+15%", positive: true },
      { label: "Receita", value: "R$ 2.3M", change: "+22%", positive: true },
    ],
    CORRETOR: [
      { label: "Meus Imóveis", value: "23", change: "+3%", positive: true },
      { label: "Leads Ativos", value: "12", change: "+5%", positive: true },
      { label: "Vendas no Mês", value: "4", change: "+2%", positive: true },
      { label: "Comissões", value: "R$ 45K", change: "+18%", positive: true },
    ],
    MARKETING: [
      { label: "Campanhas Ativas", value: "8", change: "+2%", positive: true },
      { label: "CTR Médio", value: "3.2%", change: "+0.8%", positive: true },
      { label: "Conversões", value: "89", change: "+25%", positive: true },
      { label: "ROI", value: "340%", change: "+45%", positive: true },
    ],
    CLIENTE: [
      { label: "Favoritos", value: "5", change: "+2%", positive: true },
      { label: "Visitas", value: "3", change: "+1%", positive: true },
      { label: "Propostas", value: "1", change: "0%", positive: true },
      { label: "Economia", value: "R$ 125K", change: "+8%", positive: true },
    ],
    ASSISTENTE: [
      { label: "Atendimentos", value: "45", change: "+12%", positive: true },
      { label: "Agendamentos", value: "18", change: "+6%", positive: true },
      { label: "Documentos", value: "32", change: "+9%", positive: true },
      { label: "Satisfação", value: "98%", change: "+2%", positive: true },
    ],
    DESENVOLVEDOR: [
      { label: "Uptime", value: "99.9%", change: "0%", positive: true },
      { label: "Performance", value: "1.2s", change: "-0.3s", positive: true },
      { label: "Usuários Online", value: "234", change: "+45", positive: true },
      { label: "API Calls", value: "15.2K", change: "+2.1K", positive: true },
    ],
  };

  return baseStats[userRole as keyof typeof baseStats] || baseStats.ADMIN;
};

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  showStats = true,
  userRole = "ADMIN",
}: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardActions = createDashboardActions(navigate);
  const stats = getDashboardStats(userRole);

  // Get dashboard-specific quick actions
  const getQuickActions = () => {
    switch (userRole) {
      case "CORRETOR":
        return [
          {
            label: "Novo Lead",
            href: "/dashboard/corretor#leads",
            icon: "👤",
            action: () =>
              navigate("/dashboard/corretor", {
                state: { activeTab: "leads", showNew: true },
              }),
          },
          {
            label: "Agendar Visita",
            href: "/dashboard/corretor#agendamentos",
            icon: "📅",
            action: () =>
              navigate("/dashboard/corretor", {
                state: { activeTab: "agendamentos", showNew: true },
              }),
          },
          {
            label: "Cadastrar Imóvel",
            href: "/corretor/imoveis",
            icon: "🏠",
            action: () => navigate("/corretor/imoveis"),
          },
          {
            label: "Relatório de Vendas",
            href: "/dashboard/corretor#relatorios",
            icon: "📊",
            action: () =>
              navigate("/dashboard/corretor", {
                state: { activeTab: "relatorios" },
              }),
          },
        ];
      case "MARKETING":
        return [
          {
            label: "Nova Campanha",
            href: "/dashboard/marketing#campanhas",
            icon: "📱",
            action: () =>
              navigate("/dashboard/marketing", {
                state: { activeTab: "campanhas", showNew: true },
              }),
          },
          {
            label: "Análise de Público",
            href: "/dashboard/marketing#analytics",
            icon: "👥",
            action: () =>
              navigate("/dashboard/marketing", {
                state: { activeTab: "analytics" },
              }),
          },
          {
            label: "Post Social",
            href: "/dashboard/marketing#conteudo",
            icon: "📸",
            action: () =>
              navigate("/dashboard/marketing", {
                state: { activeTab: "conteudo", showNew: true },
              }),
          },
          {
            label: "Relatório ROI",
            href: "/dashboard/marketing#analytics",
            icon: "💰",
            action: () =>
              navigate("/dashboard/marketing", {
                state: { activeTab: "analytics" },
              }),
          },
        ];
      case "CLIENTE":
        return [
          {
            label: "Buscar Imóveis",
            href: "/imoveis",
            icon: "🔍",
            action: () => navigate("/imoveis"),
          },
          {
            label: "Meus Favoritos",
            href: "/dashboard/cliente#favoritos",
            icon: "❤️",
            action: () =>
              navigate("/dashboard/cliente", {
                state: { activeTab: "favoritos" },
              }),
          },
          {
            label: "Agendar Visita",
            href: "/dashboard/cliente#agendamentos",
            icon: "📅",
            action: () =>
              navigate("/dashboard/cliente", {
                state: { activeTab: "agendamentos", showNew: true },
              }),
          },
          {
            label: "Simulador",
            href: "/simulador",
            icon: "🧮",
            action: () => navigate("/simulador"),
          },
        ];
      case "ASSISTENTE":
        return [
          {
            label: "Novo Lead",
            href: "/dashboard/assistente#leads",
            icon: "👤",
            action: () =>
              navigate("/dashboard/assistente", {
                state: { activeTab: "leads", showNew: true },
              }),
          },
          {
            label: "Agendar Visita",
            href: "/dashboard/assistente#agendamentos",
            icon: "📅",
            action: () =>
              navigate("/dashboard/assistente", {
                state: { activeTab: "agendamentos", showNew: true },
              }),
          },
          {
            label: "Tarefas",
            href: "/dashboard/assistente#tarefas",
            icon: "✅",
            action: () =>
              navigate("/dashboard/assistente", {
                state: { activeTab: "tarefas" },
              }),
          },
          {
            label: "Relatórios",
            href: "/dashboard/assistente#relatorios",
            icon: "📊",
            action: () =>
              navigate("/dashboard/assistente", {
                state: { activeTab: "relatorios" },
              }),
          },
        ];
      case "DESENVOLVEDOR":
        return [
          {
            label: "Monitoramento",
            href: "/dashboard/desenvolvedor#monitoramento",
            icon: "📊",
            action: () =>
              navigate("/dashboard/desenvolvedor", {
                state: { activeTab: "monitoramento" },
              }),
          },
          {
            label: "Backup",
            href: "/dashboard/desenvolvedor#backup",
            icon: "💾",
            action: () =>
              navigate("/dashboard/desenvolvedor", {
                state: { activeTab: "backup" },
              }),
          },
          {
            label: "Logs",
            href: "/dashboard/desenvolvedor#logs",
            icon: "📝",
            action: () =>
              navigate("/dashboard/desenvolvedor", {
                state: { activeTab: "logs" },
              }),
          },
          {
            label: "Configurações",
            href: "/dashboard/desenvolvedor#configuracoes",
            icon: "⚙️",
            action: () =>
              navigate("/dashboard/desenvolvedor", {
                state: { activeTab: "configuracoes" },
              }),
          },
        ];
      default:
        return [
          {
            label: "Relatórios",
            href: "/dashboard/admin#relatorios",
            icon: "📊",
            action: () =>
              navigate("/dashboard/admin", {
                state: { activeTab: "relatorios" },
              }),
          },
          {
            label: "Configurações",
            href: "/dashboard/admin#configuracoes",
            icon: "⚙️",
            action: () =>
              navigate("/dashboard/admin", {
                state: { activeTab: "configuracoes" },
              }),
          },
          {
            label: "Backup",
            href: "/dashboard/admin#backup",
            icon: "💾",
            action: () =>
              navigate("/dashboard/admin", { state: { activeTab: "backup" } }),
          },
          {
            label: "Logs do Sistema",
            href: "/dashboard/admin#logs",
            icon: "📝",
            action: () =>
              navigate("/dashboard/admin", { state: { activeTab: "logs" } }),
          },
        ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SharedNavigation variant="dashboard" dashboardTitle={title} />

      <div className="container mx-auto px-4 py-6">
        {/* Dashboard Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-6 lg:mb-8">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {title}
              </h1>
              <Badge variant="secondary" className="h-6 w-fit">
                {userRole}
              </Badge>
            </div>
            {subtitle && (
              <p className="text-muted-foreground text-base lg:text-lg">
                {subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Atualizado agora</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Sistema Online</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:flex-shrink-0">
            {actions}
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => dashboardActions.openSettings(userRole)}
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => dashboardActions.openHelp()}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ajuda</span>
              <span className="sm:hidden">?</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-4 lg:p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      {stat.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold truncate">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
                    <TrendingUp
                      className={`w-4 h-4 ${stat.positive ? "text-green-500" : "text-red-500"}`}
                    />
                    <span
                      className={`text-xs sm:text-sm font-medium ${stat.positive ? "text-green-500" : "text-red-500"}`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
            <h2 className="text-lg font-semibold">Ações Rápidas</h2>
            <Badge variant="outline" className="text-xs w-fit">
              <Zap className="w-3 h-3 mr-1" />
              Atalhos
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 lg:p-4 flex flex-col items-center space-y-2 hover:bg-primary/5 min-h-[80px]"
                onClick={action.action || (() => navigate(action.href))}
              >
                <span className="text-xl lg:text-2xl">{action.icon}</span>
                <span className="text-xs text-center leading-tight line-clamp-2">
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
