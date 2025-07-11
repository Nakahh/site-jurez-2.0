import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  NotificationBell,
  UserSwitcher,
} from "@/components/NotificationSystem";
import {
  Home,
  Building2,
  BookOpen,
  Scale,
  Calculator,
  MessageCircle,
  Info,
  Menu,
  X,
  LayoutDashboard,
  ArrowLeft,
  Settings,
} from "lucide-react";

interface NavigationProps {
  variant?: "default" | "dashboard";
  showBackButton?: boolean;
  dashboardTitle?: string;
}

export function SharedNavigation({
  variant = "default",
  showBackButton = false,
  dashboardTitle,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard =
    variant === "dashboard" || location.pathname.startsWith("/dashboard");

  const handleDashboardNavigation = () => {
    try {
      const userRole = localStorage.getItem("currentUserRole") || "ADMIN";
      const dashboardRoutes: Record<string, string> = {
        ADMIN: "/dashboard/admin",
        CORRETOR: "/dashboard/corretor",
        ASSISTENTE: "/dashboard/assistente",
        MARKETING: "/dashboard/marketing",
        DESENVOLVEDOR: "/dashboard/desenvolvedor",
        CLIENTE: "/dashboard/cliente",
      };
      const targetRoute = dashboardRoutes[userRole] || "/dashboard/admin";

      // Add debug logging
      console.log(
        "Navigating to dashboard:",
        targetRoute,
        "for role:",
        userRole,
      );

      navigate(targetRoute);
    } catch (error) {
      console.error("Error navigating to dashboard:", error);
      // Fallback navigation
      navigate("/dashboard/admin");
    }
  };

  const navigationItems = [
    { to: "/", label: "Início", icon: <Home className="w-4 h-4" /> },
    {
      to: "/imoveis",
      label: "Imóveis",
      icon: <Building2 className="w-4 h-4" />,
    },
    { to: "/blog", label: "Blog", icon: <BookOpen className="w-4 h-4" /> },
    {
      to: "/comparador",
      label: "Comparador",
      icon: <Scale className="w-4 h-4" />,
    },
    {
      to: "/simulador",
      label: "Simulador",
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      to: "/contato",
      label: "Contato",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    { to: "/sobre", label: "Sobre", icon: <Info className="w-4 h-4" /> },
  ];

  const quickActions = [
    {
      label: "Agendar Visita",
      action: () => navigate("/imoveis"),
      icon: "📅",
    },
    {
      label: "Simular Financiamento",
      action: () => navigate("/simulador"),
      icon: "💰",
    },
    {
      label: "Comparar Imóveis",
      action: () => navigate("/comparador"),
      icon: "⚖️",
    },
    {
      label: "Favoritos",
      action: () => alert("Funcionalidade em desenvolvimento"),
      icon: "❤️",
    },
  ];

  return (
    <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo and Dashboard Info */}
        <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=300"
              alt="Siqueira Campos Imóveis"
              className="h-10 lg:h-12 w-auto dark:hidden"
            />
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=300"
              alt="Siqueira Campos Imóveis"
              className="hidden h-10 lg:h-12 w-auto dark:block"
            />
          </Link>

          {isDashboard && dashboardTitle && (
            <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-border min-w-0">
              <LayoutDashboard className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-foreground truncate">
                {dashboardTitle}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Button
              key={item.to}
              variant={location.pathname === item.to ? "default" : "ghost"}
              size="sm"
              asChild
              className="h-9 px-3"
            >
              <Link to={item.to} className="flex items-center space-x-2">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        {/* Actions and Controls */}
        <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
          {/* Quick Actions Dropdown - Hidden on small screens */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <span className="text-xs hidden lg:inline">Ações</span>
                  <span className="text-xs lg:hidden">⚡</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={action.action}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <UserSwitcher />
          <NotificationBell />

          {/* Dashboard Navigation Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                📊
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Acessar Dashboard</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  console.log("Navigating to Admin Dashboard");
                  navigate("/dashboard/admin");
                }}
              >
                👑 Administrador
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Navigating to Corretor Dashboard");
                  navigate("/dashboard/corretor");
                }}
              >
                🏠 Corretor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Navigating to Assistente Dashboard");
                  navigate("/dashboard/assistente");
                }}
              >
                📋 Assistente
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Navigating to Marketing Dashboard");
                  navigate("/dashboard/marketing");
                }}
              >
                📊 Marketing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Navigating to Desenvolvedor Dashboard");
                  navigate("/dashboard/desenvolvedor");
                }}
              >
                💻 Desenvolvedor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Navigating to Cliente Dashboard");
                  navigate("/dashboard/cliente");
                }}
              >
                👤 Cliente
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDashboardNavigation}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard Atual (</span>
                <span className="sm:hidden">Atual (</span>
                {localStorage.getItem("currentUserRole") || "ADMIN"})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {/* Auth Buttons - Hidden on Dashboards and small screens */}
          {!isDashboard && (
            <div className="hidden lg:flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Cadastrar</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-card/95 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.to}
                variant={location.pathname === item.to ? "default" : "ghost"}
                className="w-full justify-start h-12 text-left"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to={item.to} className="flex items-center space-x-3">
                  {item.icon}
                  <span className="text-base">{item.label}</span>
                </Link>
              </Button>
            ))}

            <div className="pt-4 border-t border-border/50 space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground px-2 mb-3">
                Ações Rápidas
              </h4>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-12 text-left"
                  onClick={() => {
                    action.action();
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="mr-3 text-lg">{action.icon}</span>
                  <span className="text-base">{action.label}</span>
                </Button>
              ))}
            </div>

            {!isDashboard && (
              <div className="pt-4 border-t border-border/50 space-y-3">
                <Button variant="outline" className="w-full h-12" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <span className="text-base">Entrar</span>
                  </Link>
                </Button>
                <Button className="w-full h-12" asChild>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <span className="text-base">Cadastrar</span>
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
