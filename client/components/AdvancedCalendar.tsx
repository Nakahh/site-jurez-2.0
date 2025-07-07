import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Download,
  Bell,
  Users,
  Home,
} from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: "VISITA" | "REUNIAO" | "LIGACAO" | "AVALIACAO" | "OUTRO";
  status: "AGENDADO" | "CONFIRMADO" | "REALIZADO" | "CANCELADO" | "REAGENDADO";
  priority: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName: string;
  notes?: string;
  reminders: number[]; // minutes before
  tags: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarProps {
  userRole: "CORRETOR" | "ASSISTENTE" | "ADMIN";
  userId: string;
  userName: string;
}

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

const appointmentTypes = [
  { value: "VISITA", label: "Visita ao Imóvel", icon: Home, color: "blue" },
  { value: "REUNIAO", label: "Reunião", icon: Users, color: "green" },
  { value: "LIGACAO", label: "Ligação", icon: Phone, color: "yellow" },
  { value: "AVALIACAO", label: "Avaliação", icon: MapPin, color: "purple" },
  { value: "OUTRO", label: "Outro", icon: Calendar, color: "gray" },
];

const statusColors = {
  AGENDADO: "bg-blue-100 text-blue-800",
  CONFIRMADO: "bg-green-100 text-green-800",
  REALIZADO: "bg-green-200 text-green-900",
  CANCELADO: "bg-red-100 text-red-800",
  REAGENDADO: "bg-yellow-100 text-yellow-800",
};

const priorityColors = {
  BAIXA: "bg-gray-100 text-gray-600",
  MEDIA: "bg-blue-100 text-blue-600",
  ALTA: "bg-orange-100 text-orange-600",
  URGENTE: "bg-red-100 text-red-600",
};

export function AdvancedCalendar({
  userRole,
  userId,
  userName,
}: CalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    assignedTo: "",
    priority: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "VISITA" as Appointment["type"],
    priority: "MEDIA" as Appointment["priority"],
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    propertyTitle: "",
    propertyAddress: "",
    assignedTo: "",
    location: "",
    notes: "",
    reminders: [15, 60], // 15 min and 1 hour before
  });

  useEffect(() => {
    loadAppointments();
  }, [currentDate, filters]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          title: "Visita - Apartamento Centro",
          description: "Visita agendada para apartamento no centro da cidade",
          date: new Date(),
          startTime: "10:00",
          endTime: "11:00",
          type: "VISITA",
          status: "CONFIRMADO",
          priority: "ALTA",
          clientName: "Maria Silva",
          clientPhone: "(62) 9 8765-4321",
          clientEmail: "maria@email.com",
          propertyId: "prop1",
          propertyTitle: "Apartamento Centro",
          propertyAddress: "Rua das Flores, 123 - Centro",
          assignedTo: userId,
          assignedToName: userName,
          createdBy: userId,
          createdByName: userName,
          reminders: [15, 60],
          tags: ["vip", "primeira-visita"],
          location: "Rua das Flores, 123 - Centro",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          title: "Avaliação - Casa Jardim Goiás",
          description: "Avaliação de imóvel para venda",
          date: new Date(Date.now() + 86400000), // Tomorrow
          startTime: "14:00",
          endTime: "15:30",
          type: "AVALIACAO",
          status: "AGENDADO",
          priority: "MEDIA",
          clientName: "João Santos",
          clientPhone: "(62) 9 9876-5432",
          propertyTitle: "Casa Jardim Goiás",
          propertyAddress: "Rua dos Ipês, 456 - Jardim Goiás",
          assignedTo: userId,
          assignedToName: userName,
          createdBy: userId,
          createdByName: userName,
          reminders: [30],
          tags: ["avaliacao"],
          location: "Rua dos Ipês, 456 - Jardim Goiás",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setAppointments(mockAppointments);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "VISITA",
      priority: "MEDIA",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      propertyTitle: "",
      propertyAddress: "",
      assignedTo: "",
      location: "",
      notes: "",
      reminders: [15, 60],
    });
  };

  const handleCreateAppointment = async () => {
    setLoading(true);
    try {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        status: "AGENDADO",
        priority: formData.priority,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        propertyTitle: formData.propertyTitle,
        propertyAddress: formData.propertyAddress,
        assignedTo: formData.assignedTo || userId,
        assignedToName: userName,
        createdBy: userId,
        createdByName: userName,
        notes: formData.notes,
        reminders: formData.reminders,
        tags: [],
        location: formData.location,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setAppointments((prev) => [...prev, newAppointment]);
      setShowCreateDialog(false);
      resetForm();

      // Send WhatsApp notification
      if (formData.clientPhone) {
        const message = `Olá ${formData.clientName}! Sua ${formData.type.toLowerCase()} foi agendada para ${new Date(formData.date).toLocaleDateString("pt-BR")} às ${formData.startTime}. Endereço: ${formData.location}`;
        const whatsappUrl = `https://wa.me/55${formData.clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      }

      alert("Agendamento criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: Appointment["status"],
  ) => {
    try {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: newStatus, updatedAt: new Date() }
            : apt,
        ),
      );

      alert(`Status atualizado para ${newStatus}`);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status");
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        setAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointmentId),
        );
        alert("Agendamento excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        alert("Erro ao excluir agendamento");
      }
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(
      (apt) =>
        apt.date.toDateString() === date.toDateString() &&
        (filters.status === "" || apt.status === filters.status) &&
        (filters.type === "" || apt.type === filters.type) &&
        (filters.priority === "" || apt.priority === filters.priority) &&
        (searchTerm === "" ||
          apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.clientName.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add previous month's trailing days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const day = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }

    // Add next month's leading days to complete the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }

    return days;
  };

  const exportCalendar = () => {
    const csvData = [
      [
        "Data",
        "Horário",
        "Título",
        "Tipo",
        "Status",
        "Cliente",
        "Telefone",
        "Endereço",
      ],
      ...appointments.map((apt) => [
        apt.date.toLocaleDateString("pt-BR"),
        `${apt.startTime} - ${apt.endTime}`,
        apt.title,
        apt.type,
        apt.status,
        apt.clientName,
        apt.clientPhone,
        apt.location || "",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Agenda</h2>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos e compromissos
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar agendamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="AGENDADO">Agendado</SelectItem>
              <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
              <SelectItem value="REALIZADO">Realizado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {appointmentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={exportCalendar}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Visita - Apartamento Centro"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                      <SelectItem value="MEDIA">Média</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                      <SelectItem value="URGENTE">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startTime">Horário Início *</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) =>
                      setFormData({ ...formData, startTime: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="endTime">Horário Fim *</Label>
                  <Select
                    value={formData.endTime}
                    onValueChange={(value) =>
                      setFormData({ ...formData, endTime: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="clientName">Nome do Cliente *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Telefone *</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, clientPhone: e.target.value })
                    }
                    placeholder="(62) 9 8765-4321"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location">Endereço/Local</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Endereço do imóvel ou local do encontro"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Detalhes do agendamento..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateAppointment}
                  disabled={loading || !formData.title || !formData.clientName}
                >
                  {loading ? "Criando..." : "Criar Agendamento"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
          >
            Mês
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
          >
            Semana
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("day")}
          >
            Dia
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {view === "month" && (
            <div className="grid grid-cols-7 gap-0">
              {/* Week Headers */}
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-medium border-b bg-muted/50"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {getDaysInMonth(currentDate).map(
                ({ date, isCurrentMonth }, index) => {
                  const dayAppointments = getAppointmentsForDate(date);
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 border-b border-r cursor-pointer hover:bg-muted/50 ${
                        !isCurrentMonth
                          ? "text-muted-foreground bg-muted/20"
                          : ""
                      } ${isToday ? "bg-blue-50" : ""}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div
                        className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1 mt-1">
                        {dayAppointments.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className={`text-xs p-1 rounded truncate ${statusColors[apt.status]}`}
                            title={`${apt.startTime} - ${apt.title}`}
                          >
                            {apt.startTime} {apt.title}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayAppointments.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {appointments
          .filter(
            (apt) =>
              (filters.status === "" || apt.status === filters.status) &&
              (filters.type === "" || apt.type === filters.type) &&
              (searchTerm === "" ||
                apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.clientName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())),
          )
          .map((appointment) => (
            <Card
              key={appointment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{appointment.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {appointment.date.toLocaleDateString("pt-BR")} •{" "}
                      {appointment.startTime} - {appointment.endTime}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Badge className={statusColors[appointment.status]}>
                      {appointment.status}
                    </Badge>
                    <Badge className={priorityColors[appointment.priority]}>
                      {appointment.priority}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.clientName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.clientPhone}</span>
                  </div>
                  {appointment.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{appointment.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {appointment.status === "AGENDADO" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(appointment.id, "CONFIRMADO")
                      }
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmar
                    </Button>
                  )}
                  {appointment.status === "CONFIRMADO" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(appointment.id, "REALIZADO")
                      }
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar Realizado
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const whatsappUrl = `https://wa.me/55${appointment.clientPhone.replace(/\D/g, "")}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteAppointment(appointment.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {appointments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro agendamento para começar a organizar sua agenda.
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Agendamento
          </Button>
        </div>
      )}
    </div>
  );
}
