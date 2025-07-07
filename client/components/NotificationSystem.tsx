import { useState, useEffect, createContext, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  X,
  Check,
  AlertCircle,
  MessageSquare,
  Calendar,
  Home,
  DollarSign,
  Users,
  Settings,
  TrendingUp,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  ChevronDown,
  UserPlus,
  Megaphone,
  AlertTriangle,
  Info,
} from "lucide-react";

export interface Notification {
  id: string;
  type:
    | "NOVO_LEAD"
    | "VISITA_AGENDADA"
    | "VISITA_CONFIRMADA"
    | "VENDA_REALIZADA"
    | "MENSAGEM_CHAT"
    | "SISTEMA"
    | "MARKETING"
    | "FINANCEIRO"
    | "URGENTE";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  userId?: string;
  userRole:
    | "ADMIN"
    | "CORRETOR"
    | "CLIENTE"
    | "MARKETING"
    | "DESENVOLVEDOR"
    | "ASSISTENTE"
    | "ALL";
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    leadId?: string;
    imovelId?: string;
    agendamentoId?: string;
    corretorId?: string;
    valor?: number;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Usuários de exemplo para todos os papéis
export const exampleUsers = {
  ADMIN: {
    id: "admin1",
    name: "João Administrador",
    email: "admin@siqueiracampos.com.br",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  CORRETOR: {
    id: "corretor1",
    name: "Ana Corretora",
    email: "ana@siqueiracampos.com.br",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5ff?w=100&h=100&fit=crop&crop=face",
  },
  ASSISTENTE: {
    id: "assistente1",
    name: "Maria Assistente",
    email: "maria@siqueiracampos.com.br",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  MARKETING: {
    id: "marketing1",
    name: "Carlos Marketing",
    email: "carlos@siqueiracampos.com.br",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  DESENVOLVEDOR: {
    id: "dev1",
    name: "Pedro Desenvolvedor",
    email: "pedro@kryonix.dev",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  CLIENTE: {
    id: "cliente1",
    name: "José Cliente",
    email: "jose@email.com",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face",
  },
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  userRole: string;
  currentUser: typeof exampleUsers.ADMIN;
  switchUser: (role: keyof typeof exampleUsers) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userRole, setUserRole] = useState<string>("ADMIN"); // Simular papel do usuário
  const [currentUser, setCurrentUser] = useState(exampleUsers.ADMIN);

  // Função para alternar entre usuários para demonstração
  const switchUser = (role: keyof typeof exampleUsers) => {
    setUserRole(role);
    setCurrentUser(exampleUsers[role]);
    // Save current user role to localStorage for demo button
    localStorage.setItem("currentUserRole", role);
    localStorage.setItem("userId", exampleUsers[role].id);
    localStorage.setItem("userName", exampleUsers[role].name);
  };

  useEffect(() => {
    // Simular notificações iniciais baseadas no papel do usuário
    const initialNotifications: Notification[] = [
      {
        id: "1",
        type: "NOVO_LEAD",
        title: "Novo Lead Recebido",
        message:
          "Maria Silva demonstrou interesse em apartamento no Setor Bueno",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
        read: false,
        priority: "HIGH",
        userRole: "CORRETOR",
        actionUrl: "/dashboard/corretor",
        actionLabel: "Ver Lead",
        metadata: { leadId: "lead-123" },
      },
      {
        id: "2",
        type: "VISITA_AGENDADA",
        title: "Visita Agendada",
        message:
          "João Santos agendou visita para amanhã às 10h - Casa Jardim Goiás",
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min atrás
        read: false,
        priority: "MEDIUM",
        userRole: "CORRETOR",
        actionUrl: "/corretor/agendamentos",
        actionLabel: "Ver Agendamento",
        metadata: { agendamentoId: "ag-456", imovelId: "im-789" },
      },
      {
        id: "3",
        type: "SISTEMA",
        title: "Backup Concluído",
        message: "Backup automático realizado com sucesso às 02:00",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
        read: true,
        priority: "LOW",
        userRole: "DESENVOLVEDOR",
        metadata: {},
      },
      {
        id: "4",
        type: "MARKETING",
        title: "Campanha Performance",
        message: "Campanha 'Lançamento Jardim Goiás' atingiu 100 leads!",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
        read: false,
        priority: "MEDIUM",
        userRole: "MARKETING",
        actionUrl: "/dashboard/marketing",
        actionLabel: "Ver Campanha",
      },
      {
        id: "5",
        type: "VENDA_REALIZADA",
        title: "🎉 Venda Realizada!",
        message:
          "Apartamento Setor Bueno vendido por R$ 650.000 - Corretor: Juarez",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h atrás
        read: false,
        priority: "HIGH",
        userRole: "ALL",
        actionUrl: "/dashboard/admin",
        actionLabel: "Ver Detalhes",
        metadata: { valor: 650000, corretorId: "juarez" },
      },
      {
        id: "6",
        type: "NOVO_LEAD",
        title: "Lead Qualificado",
        message: "Cliente com pré-aprovação bancária - Roberto Silva",
        timestamp: new Date(Date.now() - 75 * 60 * 1000), // 1h15 atrás
        read: false,
        priority: "URGENT",
        userRole: "ASSISTENTE",
        actionUrl: "/dashboard/assistente",
        actionLabel: "Qualificar Lead",
      },
      {
        id: "7",
        type: "MENSAGEM_CHAT",
        title: "Nova Mensagem no Chat",
        message: "Cliente perguntou sobre financiamento - Apartamento Centro",
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1h30 atrás
        read: false,
        priority: "HIGH",
        userRole: "ALL",
        actionUrl: "/chat",
        actionLabel: "Responder",
      },
      {
        id: "8",
        type: "SISTEMA",
        title: "Atualização do Sistema",
        message: "Nova versão 2.1.0 instalada com sucesso",
        timestamp: new Date(Date.now() - 120 * 60 * 1000), // 2h atrás
        read: false,
        priority: "MEDIUM",
        userRole: "DESENVOLVEDOR",
        actionUrl: "/dashboard/desenvolvedor",
        actionLabel: "Ver Logs",
      },
      {
        id: "9",
        type: "FINANCEIRO",
        title: "Comissão Processada",
        message: "Comissão de R$ 25.000 processada para Ana Corretora",
        timestamp: new Date(Date.now() - 150 * 60 * 1000), // 2h30 atrás
        read: false,
        priority: "MEDIUM",
        userRole: "ADMIN",
        actionUrl: "/dashboard/admin",
        actionLabel: "Ver Relatório",
      },
    ];

    setNotifications(initialNotifications);

    // Simular chegada de novas notificações
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          type: "MENSAGEM_CHAT" as const,
          title: "Nova Mensagem",
          message: "Cliente enviou mensagem sobre apartamento",
          priority: "MEDIUM" as const,
          userRole: "CORRETOR" as const,
          actionUrl: "/chat",
        },
        {
          type: "NOVO_LEAD" as const,
          title: "Lead Urgente",
          message: "Lead VIP interessado em casa de alto padrão",
          priority: "URGENT" as const,
          userRole: "CORRETOR" as const,
          actionUrl: "/dashboard/corretor",
        },
      ];

      if (Math.random() < 0.3) {
        // 30% de chance a cada intervalo
        const randomNotif =
          randomNotifications[
            Math.floor(Math.random() * randomNotifications.length)
          ];
        addNotification(randomNotif);
      }
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Fallback: try to create a simple beep with Audio API
      console.warn("Web Audio API not supported, using fallback");
    }
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Play notification sound
    playNotificationSound();

    // Mostrar notificação nativa do browser
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: newNotification.id,
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.userRole === userRole || n.userRole === "ALL"),
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: notifications.filter(
          (n) => n.userRole === userRole || n.userRole === "ALL",
        ),
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        userRole,
        currentUser,
        switchUser,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}

// Componente para alternar entre usuários (demonstração)
export function UserSwitcher() {
  const { userRole, currentUser, switchUser } = useNotifications();

  const userRoles = [
    { key: "ADMIN" as const, label: "Administrador", icon: "👑" },
    { key: "CORRETOR" as const, label: "Corretor", icon: "🏠" },
    { key: "ASSISTENTE" as const, label: "Assistente", icon: "📋" },
    { key: "MARKETING" as const, label: "Marketing", icon: "📱" },
    { key: "DESENVOLVEDOR" as const, label: "Desenvolvedor", icon: "💻" },
    { key: "CLIENTE" as const, label: "Cliente", icon: "👤" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-5 h-5 rounded-full"
          />
          <span className="hidden md:inline">{currentUser.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Trocar Usuário (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userRoles.map((role) => (
          <DropdownMenuItem
            key={role.key}
            onClick={() => switchUser(role.key)}
            className={userRole === role.key ? "bg-primary/10" : ""}
          >
            <span className="mr-2">{role.icon}</span>
            {role.label}
            {userRole === role.key && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    userRole,
  } = useNotifications();

  useEffect(() => {
    // Solicitar permissão para notificações
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "NOVO_LEAD":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "VISITA_AGENDADA":
      case "VISITA_CONFIRMADA":
        return <Calendar className="h-4 w-4 text-green-600" />;
      case "VENDA_REALIZADA":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "MENSAGEM_CHAT":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case "SISTEMA":
        return <Settings className="h-4 w-4 text-gray-600" />;
      case "MARKETING":
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case "FINANCEIRO":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case "URGENTE":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "border-l-red-500 bg-red-50";
      case "HIGH":
        return "border-l-orange-500 bg-orange-50";
      case "MEDIUM":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-hidden p-0"
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Notificações</h3>
              <p className="text-xs text-muted-foreground">Papel: {userRole}</p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? "bg-accent/50" : ""
                  } hover:bg-accent/70 cursor-pointer transition-colors`}
                  onClick={() => {
                    markAsRead(notification.id);
                    // Auto-remove notification after 2 seconds
                    setTimeout(() => {
                      removeNotification(notification.id);
                    }, 2000);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4
                          className={`text-sm font-medium ${!notification.read ? "font-semibold" : ""}`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.actionLabel && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 10 && (
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full text-sm">
              Ver todas as notificações
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook para adicionar notificações de qualquer lugar da aplicação
export function useNotificationActions() {
  const { addNotification } = useNotifications();

  const notifyNewLead = (leadName: string, leadSource: string) => {
    addNotification({
      type: "NOVO_LEAD",
      title: "Novo Lead Recebido",
      message: `${leadName} demonstrou interesse via ${leadSource}`,
      priority: "HIGH",
      userRole: "CORRETOR",
      actionUrl: "/dashboard/corretor",
      actionLabel: "Ver Lead",
    });
  };

  const notifyVisitScheduled = (
    clientName: string,
    propertyTitle: string,
    date: string,
  ) => {
    addNotification({
      type: "VISITA_AGENDADA",
      title: "Nova Visita Agendada",
      message: `${clientName} agendou visita para ${propertyTitle} em ${date}`,
      priority: "MEDIUM",
      userRole: "CORRETOR",
      actionUrl: "/corretor/agendamentos",
      actionLabel: "Ver Agendamento",
    });
  };

  const notifySaleCompleted = (
    propertyTitle: string,
    value: number,
    brokerName: string,
  ) => {
    addNotification({
      type: "VENDA_REALIZADA",
      title: "🎉 Venda Realizada!",
      message: `${propertyTitle} vendido por ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)} - Corretor: ${brokerName}`,
      priority: "HIGH",
      userRole: "ALL",
      actionUrl: "/dashboard/admin",
      actionLabel: "Ver Detalhes",
      metadata: { valor: value },
    });
  };

  const notifyNewMessage = (senderName: string, propertyTitle?: string) => {
    addNotification({
      type: "MENSAGEM_CHAT",
      title: "Nova Mensagem",
      message: `${senderName} enviou uma mensagem${propertyTitle ? ` sobre ${propertyTitle}` : ""}`,
      priority: "MEDIUM",
      userRole: "CORRETOR",
      actionUrl: "/chat",
      actionLabel: "Ver Conversa",
    });
  };

  const notifySystemAlert = (
    title: string,
    message: string,
    priority: Notification["priority"] = "MEDIUM",
  ) => {
    addNotification({
      type: "SISTEMA",
      title,
      message,
      priority,
      userRole: "DESENVOLVEDOR",
    });
  };

  return {
    notifyNewLead,
    notifyVisitScheduled,
    notifySaleCompleted,
    notifyNewMessage,
    notifySystemAlert,
  };
}
