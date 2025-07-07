import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  MapPin,
  Calendar,
  Clock,
  User,
  Home,
  CheckCircle,
  AlertCircle,
  X,
  Paperclip,
  Smile,
} from "lucide-react";
import { useNotificationActions } from "./NotificationSystem";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: "CLIENT" | "BROKER";
  content: string;
  timestamp: Date;
  status: "SENT" | "DELIVERED" | "READ";
  type: "TEXT" | "IMAGE" | "LOCATION" | "PROPERTY";
  metadata?: {
    propertyId?: string;
    propertyTitle?: string;
    location?: { lat: number; lng: number };
    imageUrl?: string;
  };
}

interface ChatRoom {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  brokerId: string;
  brokerName: string;
  brokerPhone: string;
  propertyId?: string;
  propertyTitle?: string;
  status: "ACTIVE" | "CLOSED";
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
}

interface ScheduleRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  propertyId: string;
  propertyTitle: string;
  preferredDate: Date;
  preferredTime: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  acceptedBy?: string;
  brokerName?: string;
  brokerPhone?: string;
  createdAt: Date;
}

export function ChatSystem({
  propertyId,
  propertyTitle,
}: {
  propertyId?: string;
  propertyTitle?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { notifyNewMessage, notifyVisitScheduled } = useNotificationActions();

  useEffect(() => {
    // Simular carregamento de salas de chat
    loadChatRooms();
  }, []);

  const loadChatRooms = () => {
    const mockRooms: ChatRoom[] = [
      {
        id: "1",
        clientId: "client-1",
        clientName: "Maria Silva",
        clientPhone: "62999991234",
        brokerId: "broker-1",
        brokerName: "Juarez Siqueira",
        brokerPhone: "62985563505",
        propertyId: "1",
        propertyTitle: "Apartamento Setor Bueno",
        status: "ACTIVE",
        unreadCount: 2,
        createdAt: new Date(Date.now() - 86400000), // 1 dia atrás
        lastMessage: {
          id: "msg-1",
          senderId: "client-1",
          senderName: "Maria Silva",
          senderType: "CLIENT",
          content: "Gostaria de agendar uma visita para amanhã",
          timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
          status: "DELIVERED",
          type: "TEXT",
        },
      },
      {
        id: "2",
        clientId: "client-2",
        clientName: "João Santos",
        clientPhone: "62988885678",
        brokerId: "broker-2",
        brokerName: "Carlos Silva",
        brokerPhone: "62987654321",
        propertyId: "2",
        propertyTitle: "Casa Jardim Goiás",
        status: "ACTIVE",
        unreadCount: 0,
        createdAt: new Date(Date.now() - 172800000), // 2 dias atrás
      },
    ];

    setChatRooms(mockRooms);
  };

  const loadMessages = (roomId: string) => {
    // Simular carregamento de mensagens
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        senderId: "client-1",
        senderName: "Maria Silva",
        senderType: "CLIENT",
        content: "Olá! Tenho interesse neste apartamento.",
        timestamp: new Date(Date.now() - 7200000), // 2 horas atrás
        status: "READ",
        type: "TEXT",
      },
      {
        id: "2",
        senderId: "broker-1",
        senderName: "Juarez Siqueira",
        senderType: "BROKER",
        content:
          "Olá Maria! Fico feliz pelo seu interesse. Este apartamento é realmente excelente. Posso te passar mais informações?",
        timestamp: new Date(Date.now() - 7000000),
        status: "READ",
        type: "TEXT",
      },
      {
        id: "3",
        senderId: "client-1",
        senderName: "Maria Silva",
        senderType: "CLIENT",
        content: "Sim, por favor! Gostaria de saber sobre o condomínio.",
        timestamp: new Date(Date.now() - 6800000),
        status: "READ",
        type: "TEXT",
      },
      {
        id: "4",
        senderId: "broker-1",
        senderName: "Juarez Siqueira",
        senderType: "BROKER",
        content:
          "O condomínio é R$ 350/mês e inclui portaria 24h, piscina, academia e salão de festas. É um dos mais completos da região!",
        timestamp: new Date(Date.now() - 6600000),
        status: "READ",
        type: "TEXT",
      },
      {
        id: "5",
        senderId: "client-1",
        senderName: "Maria Silva",
        senderType: "CLIENT",
        content: "Gostaria de agendar uma visita para amanhã",
        timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
        status: "DELIVERED",
        type: "TEXT",
      },
    ];

    setMessages(mockMessages);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "Você",
      senderType: "CLIENT",
      content: newMessage,
      timestamp: new Date(),
      status: "SENT",
      type: "TEXT",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simular envio via WhatsApp
    const whatsappMessage = `*Nova mensagem via site*\n\nCliente: ${selectedRoom.clientName}\nImóvel: ${selectedRoom.propertyTitle}\n\nMensagem: ${newMessage}`;

    const whatsappUrl = `https://wa.me/55${selectedRoom.brokerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");

    // Notificar corretor sobre nova mensagem
    notifyNewMessage(selectedRoom.clientName, selectedRoom.propertyTitle);

    // Simular notificação para outros sistemas
    setTimeout(() => {
      // Notificar assistente sobre mensagem não respondida
      if (Math.random() > 0.5) {
        const { addNotification } = useNotificationActions();
        addNotification({
          type: "MENSAGEM_CHAT",
          title: "Mensagem Não Respondida",
          message: `Cliente ${selectedRoom.clientName} aguarda resposta há 5 minutos`,
          priority: "MEDIUM",
          userRole: "ASSISTENTE",
          actionUrl: "/chat",
          actionLabel: "Verificar Chat",
        });
      }
    }, 5000); // Simular atraso de 5 segundos

    // Simular resposta automática
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: selectedRoom.brokerId,
        senderName: selectedRoom.brokerName,
        senderType: "BROKER",
        content: "Recebi sua mensagem! Vou responder em breve pelo WhatsApp.",
        timestamp: new Date(),
        status: "DELIVERED",
        type: "TEXT",
      };
      setMessages((prev) => [...prev, autoReply]);
    }, 2000);
  };

  const openWhatsAppDirect = (room: ChatRoom) => {
    const message = `Olá ${room.brokerName}! Tenho interesse no imóvel: ${room.propertyTitle}. Gostaria de mais informações.`;
    const whatsappUrl = `https://wa.me/55${room.brokerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-xs h-8 w-full flex items-center justify-center">
          <MessageSquare className="h-3 w-3 mr-1" />
          Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* Lista de Conversas */}
          <div className="w-1/3 border-r flex flex-col">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Conversas</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      loadMessages(room.id);
                    }}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 mb-2 ${
                      selectedRoom?.id === room.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {room.brokerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm truncate">
                            {room.brokerName}
                          </h4>
                          {room.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {room.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {room.propertyTitle}
                        </p>
                        {room.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {room.lastMessage.content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(room.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {chatRooms.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa iniciada</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedRoom ? (
              <>
                {/* Header do Chat */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedRoom.brokerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedRoom.brokerName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedRoom.propertyTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openWhatsAppDirect(selectedRoom)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mensagens */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderType === "CLIENT"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderType === "CLIENT"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.senderType === "CLIENT" && (
                              <div className="flex items-center">
                                {message.status === "SENT" && (
                                  <CheckCircle className="h-3 w-3 opacity-50" />
                                )}
                                {message.status === "DELIVERED" && (
                                  <div className="flex">
                                    <CheckCircle className="h-3 w-3 opacity-70" />
                                    <CheckCircle className="h-3 w-3 opacity-70 -ml-2" />
                                  </div>
                                )}
                                {message.status === "READ" && (
                                  <div className="flex">
                                    <CheckCircle className="h-3 w-3 text-blue-500" />
                                    <CheckCircle className="h-3 w-3 text-blue-500 -ml-2" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input de Mensagem */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          sendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button size="sm" variant="outline">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    As mensagens serão enviadas via WhatsApp para o corretor
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Sistema de Agendamento
export function ScheduleVisitSystem({
  propertyId,
  propertyTitle,
}: {
  propertyId: string;
  propertyTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>(
    [],
  );
  const { notifyVisitScheduled } = useNotificationActions();

  useEffect(() => {
    loadScheduleRequests();
  }, []);

  const loadScheduleRequests = () => {
    // Simular carregamento de solicitações
    const mockRequests: ScheduleRequest[] = [
      {
        id: "1",
        clientName: "Ana Costa",
        clientPhone: "62977779012",
        clientEmail: "ana@email.com",
        propertyId: "1",
        propertyTitle: "Apartamento Setor Bueno",
        preferredDate: new Date(Date.now() + 86400000), // Amanhã
        preferredTime: "10:00",
        message: "Prefiro período da manhã",
        status: "PENDING",
        createdAt: new Date(),
      },
    ];

    setScheduleRequests(mockRequests);
  };

  const handleScheduleRequest = (formData: any) => {
    const request: ScheduleRequest = {
      id: Date.now().toString(),
      clientName: formData.name,
      clientPhone: formData.phone,
      clientEmail: formData.email,
      propertyId,
      propertyTitle,
      preferredDate: new Date(formData.date),
      preferredTime: formData.time,
      message: formData.message,
      status: "PENDING",
      createdAt: new Date(),
    };

    setScheduleRequests((prev) => [request, ...prev]);

    // Notificar todos os corretores
    notifyVisitScheduled(
      request.clientName,
      request.propertyTitle,
      `${new Date(request.preferredDate).toLocaleDateString("pt-BR")} às ${request.preferredTime}`,
    );

    // Enviar para WhatsApp do corretor principal
    const whatsappMessage = `🏠 *NOVA SOLICITAÇÃO DE VISITA*

📋 *Detalhes da Visita:*
• Imóvel: ${propertyTitle}
• Cliente: ${formData.name}
• Telefone: ${formData.phone}
• Data: ${new Date(formData.date).toLocaleDateString("pt-BR")}
• Horário: ${formData.time}
${formData.message ? `• Observação: ${formData.message}` : ""}

⚡ *RESPONDA PRIMEIRO PARA FICAR COM A VISITA!*

Para aceitar, responda: SIM
Para recusar, responda: NÃO`;

    // Enviar para múltiplos corretores (sistema de corrida)
    const corretores = [
      { nome: "Juarez Siqueira", telefone: "62985563505" },
      { nome: "Carlos Silva", telefone: "62987654321" },
      { nome: "Maria Santos", telefone: "62999888777" },
    ];

    corretores.forEach((corretor) => {
      const url = `https://wa.me/55${corretor.telefone}?text=${encodeURIComponent(whatsappMessage)}`;
      // Abrir em nova aba para cada corretor
      setTimeout(() => {
        window.open(url, "_blank");
      }, 500);
    });

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Visita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Visita</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              name: formData.get("name"),
              phone: formData.get("phone"),
              email: formData.get("email"),
              date: formData.get("date"),
              time: formData.get("time"),
              message: formData.get("message"),
            };
            handleScheduleRequest(data);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome completo *</label>
            <Input name="name" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone *</label>
            <Input name="phone" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input name="email" type="email" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data preferida *</label>
              <Input name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Horário *</label>
              <Input name="time" type="time" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              name="message"
              placeholder="Alguma preferência de horário ou observação..."
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">
                  Como funciona?
                </h4>
                <p className="text-blue-800 text-xs">
                  Sua solicitação será enviada para nossos corretores via
                  WhatsApp. O primeiro que responder ficará com a visita!
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Solicitar Visita
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
