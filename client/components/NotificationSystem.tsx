import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  X,
  Check,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Home,
  Calendar,
  MessageCircle,
  DollarSign,
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: "lead" | "visit" | "contract" | "system" | "marketing";
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "info",
    title: "Novo Lead Recebido",
    message: "Maria Silva demonstrou interesse em apartamento no Jardim Goiás",
    timestamp: new Date(Date.now() - 300000), // 5 min ago
    read: false,
    category: "lead",
    actionUrl: "/leads/1",
  },
  {
    id: "2",
    type: "success",
    title: "Visita Agendada",
    message: "João Santos agendou visita para amanhã às 14h",
    timestamp: new Date(Date.now() - 1800000), // 30 min ago
    read: false,
    category: "visit",
    actionUrl: "/visitas/2",
  },
  {
    id: "3",
    type: "warning",
    title: "Contrato Vencendo",
    message: "Contrato de locação #123 vence em 30 dias",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: true,
    category: "contract",
    actionUrl: "/contratos/123",
  },
  {
    id: "4",
    type: "info",
    title: "Nova Campanha Ativa",
    message: "Campanha 'Apartamentos Setor Oeste' foi ativada",
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    read: true,
    category: "marketing",
    actionUrl: "/marketing/campanhas/4",
  },
];

export function NotificationSystem() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  useEffect(() => {
    // Simular notificações em tempo real
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          id: Date.now().toString(),
          type: "info" as const,
          title: "Novo Interesse",
          message: "Cliente interessado em casa no Setor Oeste",
          timestamp: new Date(),
          read: false,
          category: "lead" as const,
        },
        {
          id: Date.now().toString(),
          type: "success" as const,
          title: "Lead Convertido",
          message: "Lead convertido em venda!",
          timestamp: new Date(),
          read: false,
          category: "contract" as const,
        },
      ];

      if (Math.random() > 0.7) {
        // 30% chance
        const randomNotification =
          randomNotifications[
            Math.floor(Math.random() * randomNotifications.length)
          ];
        setNotifications((prev) => [randomNotification, ...prev.slice(0, 9)]); // Keep last 10
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "lead":
        return <User className="w-4 h-4" />;
      case "visit":
        return <Calendar className="w-4 h-4" />;
      case "contract":
        return <DollarSign className="w-4 h-4" />;
      case "marketing":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
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
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 md:w-96 shadow-lg border-amber-200 z-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-lg text-amber-900">
              Notificações
            </CardTitle>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-amber-600 hover:text-amber-800"
                >
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-amber-600">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação no momento</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-amber-100 hover:bg-amber-50 transition-colors ${
                        !notification.read ? "bg-amber-25" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {getNotificationIcon(notification.category)}
                              <h4
                                className={`text-sm font-medium ${
                                  !notification.read
                                    ? "text-amber-900"
                                    : "text-amber-700"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-amber-500">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeNotification(notification.id)
                                }
                                className="p-1 h-auto"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-amber-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-amber-100 text-amber-800"
                            >
                              {notification.category}
                            </Badge>
                            <div className="flex space-x-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs p-1 h-auto text-amber-600 hover:text-amber-800"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Marcar como lida
                                </Button>
                              )}
                              {notification.actionUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs p-1 h-auto text-amber-600 hover:text-amber-800"
                                >
                                  Ver detalhes
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
