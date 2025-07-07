import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Target,
  BarChart3,
  FileText,
  Settings,
  Bell,
  UserPlus,
  PlusCircle,
  CalendarDays,
  CheckSquare,
  Star,
  Award,
  X,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AdvancedCalendar } from "@/components/AdvancedCalendar";
import { DashboardLayout } from "@/components/DashboardLayout";
import { WhatsAppIntegration } from "@/components/WhatsAppIntegration";
import { CalendarIntegration } from "@/components/CalendarIntegration";

// Types
interface CorretorStats {
  totalImoveis: number;
  imoveisDisponiveis: number;
  imoveisVendidos: number;
  imoveisAlugados: number;
  meusLeads: number;
  leadsAtivos: number;
  leadsConvertidos: number;
  visitasAgendadas: number;
  visitasRealizadas: number;
  minhasComissoes: number;
  comissoesTotais: number;
  metaMensal: number;
  vendaMes: number;
}

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  mensagem: string;
  origem: string;
  status: string;
  imovelId?: string;
  criadoEm: Date;
}

interface Imovel {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  status: string;
  fotos?: string[];
  criadoEm: Date;
}

interface Agendamento {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  imovelTitulo: string;
  imovelEndereco: string;
  dataHora: Date;
  status: string;
  observacoes?: string;
}

// Components
function WhatsAppIntegrationCard({ onUpdate }: { onUpdate: () => void }) {
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
        headers: { Authorization: `Bearer ${token}` },
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
    const numbers = value.replace(/\D/g, "");
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
          <Badge variant={ativo ? "default" : "secondary"}>
            {ativo ? "ATIVO" : "INATIVO"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div>
              <Label className="text-sm font-medium">
                Status para receber leads
              </Label>
              <p className="text-xs text-muted-foreground">
                Quando ativo, você receberá novos leads automaticamente
              </p>
            </div>
            <Switch
              checked={ativo}
              onCheckedChange={setAtivo}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || !whatsapp}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
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
  color = "primary",
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: string;
  color?: string;
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
      <CardContent className="p-4 lg:p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <div
            className={`h-10 w-10 lg:h-12 lg:w-12 bg-${color}/10 rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`h-5 w-5 lg:h-6 lg:w-6 text-${color}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-auto pt-3 border-t">
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 mr-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-green-600 font-medium truncate">
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Modal para criar imóvel completo
function CriarImovelModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    finalidade: "",
    preco: "",
    area: "",
    quartos: "",
    banheiros: "",
    vagas: "",
    endereco: "",
    bairro: "",
    cidade: "Goiânia",
    estado: "GO",
    cep: "",
    latitude: "",
    longitude: "",
    descricao: "",
    caracteristicas: "",
    amenidades: "",
    iptu: "",
    anoConstucao: "",
    valorCondominio: "",
    destaque: false,
    status: "DISPONIVEL",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/imoveis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          preco: parseFloat(formData.preco),
          area: parseFloat(formData.area),
          quartos: parseInt(formData.quartos),
          banheiros: parseInt(formData.banheiros),
          vagas: formData.vagas ? parseInt(formData.vagas) : 0,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          iptu: formData.iptu ? parseFloat(formData.iptu) : null,
          anoConstucao: formData.anoConstucao
            ? parseInt(formData.anoConstucao)
            : null,
          valorCondominio: formData.valorCondominio
            ? parseFloat(formData.valorCondominio)
            : null,
          caracteristicas: formData.caracteristicas
            .split("\n")
            .filter((c) => c.trim()),
          amenidades: formData.amenidades.split("\n").filter((a) => a.trim()),
          fotos: selectedImages,
        }),
      });

      if (response.ok) {
        onSuccess();
        handleCloseModal();
        alert(
          "🎉 Imóvel criado com sucesso! Todas as informações foram salvas.",
        );
      }
    } catch (error) {
      console.error("Erro ao criar imóvel:", error);
      alert("Erro ao criar imóvel. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedImages([]);
    setFormData({
      titulo: "",
      tipo: "",
      finalidade: "",
      preco: "",
      area: "",
      quartos: "",
      banheiros: "",
      vagas: "",
      endereco: "",
      bairro: "",
      cidade: "Goiânia",
      estado: "GO",
      cep: "",
      latitude: "",
      longitude: "",
      descricao: "",
      caracteristicas: "",
      amenidades: "",
      iptu: "",
      anoConstucao: "",
      valorCondominio: "",
      destaque: false,
      status: "DISPONIVEL",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Cadastrar Novo Imóvel</h3>
            <Button variant="ghost" size="sm" onClick={handleCloseModal}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Informações Básicas
                </h4>

                <div className="space-y-2">
                  <Label>Título do Imóvel *</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                    placeholder="Ex: Apartamento moderno no Setor Bueno"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição Completa *</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    className="h-24"
                    placeholder="Descreva o imóvel detalhadamente..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tipo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                        <SelectItem value="CASA">Casa</SelectItem>
                        <SelectItem value="TERRENO">Terreno</SelectItem>
                        <SelectItem value="COMERCIAL">Comercial</SelectItem>
                        <SelectItem value="RURAL">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Finalidade *</Label>
                    <Select
                      value={formData.finalidade}
                      onValueChange={(value) =>
                        setFormData({ ...formData, finalidade: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a finalidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VENDA">Venda</SelectItem>
                        <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                        <SelectItem value="AMBOS">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preço (R$) *</Label>
                    <Input
                      type="number"
                      value={formData.preco}
                      onChange={(e) =>
                        setFormData({ ...formData, preco: e.target.value })
                      }
                      placeholder="650000"
                      step="1000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Área Total (m²) *</Label>
                    <Input
                      type="number"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      placeholder="89"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quartos</Label>
                    <Input
                      type="number"
                      value={formData.quartos}
                      onChange={(e) =>
                        setFormData({ ...formData, quartos: e.target.value })
                      }
                      placeholder="3"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Banheiros</Label>
                    <Input
                      type="number"
                      value={formData.banheiros}
                      onChange={(e) =>
                        setFormData({ ...formData, banheiros: e.target.value })
                      }
                      placeholder="2"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vagas</Label>
                    <Input
                      type="number"
                      value={formData.vagas}
                      onChange={(e) =>
                        setFormData({ ...formData, vagas: e.target.value })
                      }
                      placeholder="2"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>IPTU Anual (R$)</Label>
                    <Input
                      type="number"
                      value={formData.iptu}
                      onChange={(e) =>
                        setFormData({ ...formData, iptu: e.target.value })
                      }
                      placeholder="3500"
                      step="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano de Construção</Label>
                    <Input
                      type="number"
                      value={formData.anoConstucao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          anoConstucao: e.target.value,
                        })
                      }
                      placeholder="2018"
                      min="1900"
                      max="2025"
                    />
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Localização
                </h4>

                <div className="space-y-2">
                  <Label>Endereço Completo *</Label>
                  <Input
                    value={formData.endereco}
                    onChange={(e) =>
                      setFormData({ ...formData, endereco: e.target.value })
                    }
                    placeholder="Rua T-30, 1234, Apartamento 802"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bairro *</Label>
                    <Input
                      value={formData.bairro}
                      onChange={(e) =>
                        setFormData({ ...formData, bairro: e.target.value })
                      }
                      placeholder="Setor Bueno"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={formData.cep}
                      onChange={(e) =>
                        setFormData({ ...formData, cep: e.target.value })
                      }
                      placeholder="74223-030"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade *</Label>
                    <Input
                      value={formData.cidade}
                      onChange={(e) =>
                        setFormData({ ...formData, cidade: e.target.value })
                      }
                      placeholder="Goiânia"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Input
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value })
                      }
                      placeholder="GO"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      placeholder="-16.6868"
                      step="0.0001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      placeholder="-49.2643"
                      step="0.0001"
                    />
                  </div>
                </div>

                {/* Condomínio */}
                <div className="border-t pt-4">
                  <h5 className="font-medium mb-3">
                    Condomínio (se aplicável)
                  </h5>
                  <div className="space-y-2">
                    <Label>Valor do Condomínio (R$/mês)</Label>
                    <Input
                      type="number"
                      value={formData.valorCondominio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          valorCondominio: e.target.value,
                        })
                      }
                      placeholder="450"
                      step="10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Características e Amenidades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Características
                </h4>
                <div className="space-y-2">
                  <Label>Características do Imóvel</Label>
                  <Textarea
                    value={formData.caracteristicas}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        caracteristicas: e.target.value,
                      })
                    }
                    className="h-20"
                    placeholder="Ex: Reformado recentemente&#10;Móveis planejados&#10;Varanda gourmet"
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite uma caracter��stica por linha
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Amenidades do Condomínio
                </h4>
                <div className="space-y-2">
                  <Label>Amenidades Disponíveis</Label>
                  <Textarea
                    value={formData.amenidades}
                    onChange={(e) =>
                      setFormData({ ...formData, amenidades: e.target.value })
                    }
                    className="h-20"
                    placeholder="Ex: Piscina&#10;Academia&#10;Salão de festas&#10;Playground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite uma amenidade por linha
                  </p>
                </div>
              </div>
            </div>

            {/* Upload de Imagens */}
            <div>
              <h4 className="font-semibold text-lg border-b pb-2 mb-4">
                Fotos do Imóvel
              </h4>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="property-images-corretor"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        const newImages = files.map(
                          (file, index) =>
                            `https://images.unsplash.com/photo-${1560518883 + selectedImages.length + index}?w=200&h=150&fit=crop`,
                        );
                        setSelectedImages((prev) => [...prev, ...newImages]);
                        alert(
                          `${files.length} foto(s) adicionada(s) com sucesso!`,
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor="property-images-corretor"
                    className="cursor-pointer flex flex-col items-center space-y-3"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Clique para adicionar fotos</p>
                      <p className="text-sm text-muted-foreground">
                        ou arraste e solte aqui
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos aceitos: JPG, PNG, WebP (máx. 10MB cada)
                      </p>
                    </div>
                  </label>
                </div>

                {selectedImages.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {selectedImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setSelectedImages((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                              alert(`Foto ${index + 1} removida!`);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                              Capa
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {selectedImages.length} foto(s) selecionada(s) • A
                        primeira foto será usada como capa
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          if (confirm("Deseja remover todas as fotos?")) {
                            setSelectedImages([]);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover Todas
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Configurações Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Configurações
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="destaque-corretor"
                      className="rounded"
                      checked={formData.destaque}
                      onChange={(e) =>
                        setFormData({ ...formData, destaque: e.target.checked })
                      }
                    />
                    <label
                      htmlFor="destaque-corretor"
                      className="text-sm font-medium"
                    >
                      Exibir como imóvel em destaque
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                        <SelectItem value="RESERVADO">Reservado</SelectItem>
                        <SelectItem value="VENDIDO">Vendido</SelectItem>
                        <SelectItem value="ALUGADO">Alugado</SelectItem>
                        <SelectItem value="INATIVO">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé com botões */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none sm:px-8"
                  size="lg"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Criando..." : "Criar Imóvel"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="outline"
                  className="flex-1 sm:flex-none sm:px-8"
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Campos obrigatórios devem ser preenchidos
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Modal para cadastrar lead
function CadastrarLeadModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    mensagem: "",
    origem: "MANUAL",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          nome: "",
          telefone: "",
          email: "",
          mensagem: "",
          origem: "MANUAL",
        });
      }
    } catch (error) {
      console.error("Erro ao cadastrar lead:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Cadastrar Novo Lead</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: João da Silva"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
              placeholder="Ex: (62) 9 8556-3505"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ex: joao@email.com"
            />
          </div>

          <div>
            <Label htmlFor="origem">Origem</Label>
            <Select
              value={formData.origem}
              onValueChange={(value) =>
                setFormData({ ...formData, origem: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="SITE">Site</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="TELEFONE">Telefone</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                <SelectItem value="INDICACAO">Indicação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem/Interesse</Label>
            <Textarea
              id="mensagem"
              value={formData.mensagem}
              onChange={(e) =>
                setFormData({ ...formData, mensagem: e.target.value })
              }
              placeholder="Descreva o interesse do cliente..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CorretorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<CorretorStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCriarImovel, setShowCriarImovel] = useState(false);
  const [showCadastrarLead, setShowCadastrarLead] = useState(false);
  const [selectedPropertyImages, setSelectedPropertyImages] = useState<
    string[]
  >([]);
  const [showAgendarVisita, setShowAgendarVisita] = useState(false);
  const [showWhatsAppBusiness, setShowWhatsAppBusiness] = useState(false);
  const [showViewLeadModal, setShowViewLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [selectedLeadCorretor, setSelectedLeadCorretor] = useState<Lead | null>(
    null,
  );
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  useEffect(() => {
    carregarDados();
    // Handle navigation state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.showNew) {
      switch (location.state.activeTab) {
        case "leads":
          setShowCadastrarLead(true);
          break;
        case "imoveis":
          setShowCriarImovel(true);
          break;
        case "agendamentos":
          setShowAgendarVisita(true);
          break;
      }
    }
  }, [location.state]);

  // Funções para gerenciar leads
  const handleViewLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedLeadCorretor(lead);
      setShowViewLeadModal(true);
    }
  };

  const handleEditLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedLeadCorretor(lead);
      setShowEditLeadModal(true);
    }
  };

  const handleCallLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      const phoneNumber = lead.telefone.replace(/\D/g, "");
      window.open(`tel:${phoneNumber}`, "_self");
    }
  };

  const handleWhatsAppLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      const message = `Olá ${lead.nome}! Sou da Siqueira Campos Imóveis. Vi seu interesse e gostaria de conversar sobre opções de imóveis.`;
      const whatsappUrl = `https://wa.me/55${lead.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  // Funções para gerenciar imóveis
  const handleViewProperty = (propertyId: string) => {
    const property = imoveis.find((p) => p.id === propertyId);
    if (property) {
      // Abrir página de detalhes do imóvel
      navigate(`/imovel/${propertyId}`);
    }
  };

  const handleEditProperty = (propertyId: string) => {
    const property = imoveis.find((p) => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setShowEditPropertyModal(true);
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.",
      )
    ) {
      setImoveis((prev) => prev.filter((p) => p.id !== propertyId));
      alert("Imóvel excluído com sucesso!");
    }
  };

  const handleScheduleVisit = (propertyId: string) => {
    const property = imoveis.find((p) => p.id === propertyId);
    if (property) {
      setActiveTab("agenda");
      alert(`Redirecionando para agenda para ${property.titulo}`);
    }
  };

  const handleGeneratePerformanceReport = async () => {
    try {
      const performanceData = [
        {
          nome: "Vendas Dezembro",
          vendas: stats?.imoveisVendidos || 0,
          volume: 850000,
          comissao: 25500,
        },
        {
          nome: "Performance Mensal",
          vendas: stats?.leadsConvertidos || 0,
          volume: 650000,
          comissao: 19500,
        },
        {
          nome: "Meta vs Realizado",
          vendas: 5,
          volume: stats?.vendaMes || 0,
          comissao: stats?.minhasComissoes || 0,
        },
      ];

      const { generatePerformanceReport } = await import(
        "@/utils/pdfGenerator"
      );
      await generatePerformanceReport(performanceData);

      alert("Relatório de performance gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    }
  };

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Carregar dados simulados mais robustos
      const statsSimuladas: CorretorStats = {
        totalImoveis: 23,
        imoveisDisponiveis: 18,
        imoveisVendidos: 3,
        imoveisAlugados: 2,
        meusLeads: 45,
        leadsAtivos: 12,
        leadsConvertidos: 8,
        visitasAgendadas: 6,
        visitasRealizadas: 15,
        minhasComissoes: 45000,
        comissoesTotais: 125000,
        metaMensal: 50000,
        vendaMes: 38000,
      };

      const leadsSimulados: Lead[] = [
        {
          id: "1",
          nome: "Maria Oliveira",
          telefone: "(62) 9 8765-4321",
          email: "maria@email.com",
          mensagem: "Interessada em apartamento no Setor Bueno",
          origem: "SITE",
          status: "PENDENTE",
          criadoEm: new Date(),
        },
        {
          id: "2",
          nome: "Carlos Santos",
          telefone: "(62) 9 9876-5432",
          mensagem: "Procuro casa com piscina no Jardim Goi��s",
          origem: "WHATSAPP",
          status: "ASSUMIDO",
          criadoEm: new Date(),
        },
      ];

      const imoveisSimulados: Imovel[] = [
        {
          id: "1",
          titulo: "Apartamento Moderno no Setor Bueno",
          tipo: "APARTAMENTO",
          finalidade: "VENDA",
          preco: 650000,
          quartos: 3,
          banheiros: 2,
          vagas: 2,
          endereco: "Rua T-30, 1234",
          bairro: "Setor Bueno",
          cidade: "Goiânia",
          status: "DISPONIVEL",
          criadoEm: new Date(),
        },
      ];

      const agendamentosSimulados: Agendamento[] = [
        {
          id: "1",
          clienteNome: "Ana Costa",
          clienteTelefone: "(62) 9 8888-7777",
          imovelTitulo: "Apartamento Setor Bueno",
          imovelEndereco: "Rua T-30, 1234",
          dataHora: new Date("2025-01-08T14:00:00"),
          status: "AGENDADA",
          observacoes: "Cliente preferiu horário da tarde",
        },
      ];

      setStats(statsSimuladas);
      setLeads(leadsSimulados);
      setImoveis(imoveisSimulados);
      setAgendamentos(agendamentosSimulados);
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
    <DashboardLayout
      title="Dashboard do Corretor"
      subtitle="Gerencie seus leads, imóveis e agenda de forma eficiente"
      userRole="CORRETOR"
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
          <Button size="sm" onClick={() => setShowCriarImovel(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Imóvel
          </Button>
        </div>
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Leads</span>
            <span className="sm:hidden">👥</span>
          </TabsTrigger>
          <TabsTrigger value="imoveis" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Imóveis</span>
            <span className="sm:hidden">🏠</span>
          </TabsTrigger>
          <TabsTrigger value="agenda" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Agenda</span>
            <span className="sm:hidden">��</span>
          </TabsTrigger>
          <TabsTrigger value="vendas" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Vendas</span>
            <span className="sm:hidden">💰</span>
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Config</span>
            <span className="sm:hidden">⚙���</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Meta Progress */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Meta Mensal</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatarPreco(stats?.vendaMes || 0)} de{" "}
                    {formatarPreco(stats?.metaMensal || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {stats
                      ? Math.round((stats.vendaMes / stats.metaMensal) * 100)
                      : 0}
                    %
                  </p>
                  <Badge variant="default">
                    {stats && stats.vendaMes >= stats.metaMensal
                      ? "META BATIDA!"
                      : "EM PROGRESSO"}
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats ? Math.min((stats.vendaMes / stats.metaMensal) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatsCard
                title="Meus Imóveis"
                value={stats.totalImoveis}
                icon={Home}
                description={`${stats.imoveisDisponiveis} disponíveis`}
                trend={`+${stats.imoveisVendidos} vendidos este mês`}
              />
              <StatsCard
                title="Leads Ativos"
                value={stats.leadsAtivos}
                icon={Users}
                description={`${stats.leadsConvertidos} convertidos`}
                trend={`${Math.round((stats.leadsConvertidos / stats.meusLeads) * 100)}% taxa de conversão`}
                color="green"
              />
              <StatsCard
                title="Comissões"
                value={formatarPreco(stats.minhasComissoes)}
                icon={DollarSign}
                description="Este mês"
                trend={`${formatarPreco(stats.comissoesTotais)} total`}
                color="yellow"
              />
              <StatsCard
                title="Visitas Agendadas"
                value={stats.visitasAgendadas}
                icon={Calendar}
                description={`${stats.visitasRealizadas} realizadas`}
                trend="Para esta semana"
                color="purple"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full"
              onClick={() => setShowCadastrarLead(true)}
            >
              <CardContent className="p-4 lg:p-6 text-center h-full flex flex-col justify-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <UserPlus className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-2 text-sm lg:text-base">
                  Cadastrar Lead
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                  Adicione um novo prospecto manualmente
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full"
              onClick={() => setShowCriarImovel(true)}
            >
              <CardContent className="p-4 lg:p-6 text-center h-full flex flex-col justify-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <PlusCircle className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2 text-sm lg:text-base">
                  Cadastrar Imóvel
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                  Adicione um novo imóvel ao portfólio
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full"
              onClick={() => setActiveTab("agenda")}
            >
              <CardContent className="p-4 lg:p-6 text-center h-full flex flex-col justify-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <CalendarDays className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Ver Agenda</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize seus agendamentos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ferramentas de Vendas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900"
              onClick={() => setShowWhatsAppBusiness(true)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">WhatsApp Business</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Central de atendimento e mensagens para leads
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900"
              onClick={() => setActiveTab("agendamentos")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Agendar Visitas</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Organize e gerencie todas as visitas dos clientes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* WhatsApp Integration */}
          <WhatsAppIntegrationCard onUpdate={carregarDados} />
        </TabsContent>

        {/* Leads */}
        <TabsContent value="leads" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestão de Leads</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button onClick={() => setShowCadastrarLead(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lead
              </Button>
            </div>
          </div>

          {/* Stats de Leads */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total de Leads"
              value={stats?.meusLeads || 0}
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="Leads Ativos"
              value={stats?.leadsAtivos || 0}
              icon={Activity}
              color="green"
            />
            <StatsCard
              title="Convertidos"
              value={stats?.leadsConvertidos || 0}
              icon={CheckSquare}
              color="yellow"
            />
            <StatsCard
              title="Taxa Conversão"
              value={`${stats ? Math.round((stats.leadsConvertidos / stats.meusLeads) * 100) : 0}%`}
              icon={Target}
              color="purple"
            />
          </div>

          {/* Lista de Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Leads Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{lead.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.telefone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.mensagem.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge
                          variant={
                            lead.status === "ASSUMIDO" ? "default" : "secondary"
                          }
                        >
                          {lead.status}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          {lead.origem}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(lead.criadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewLead(lead.id)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditLead(lead.id)}
                          title="Editar lead"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCallLead(lead.id)}
                          title="Ligar"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWhatsAppLead(lead.id)}
                          title="WhatsApp"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLeadCorretor(lead);
                            setShowAgendarVisita(true);
                          }}
                          title="Agendar Visita"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imóveis */}
        <TabsContent value="imoveis" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Meus Imóveis</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button onClick={() => setShowCriarImovel(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Imóvel
              </Button>
            </div>
          </div>

          {/* Stats de Imóveis */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total"
              value={stats?.totalImoveis || 0}
              icon={Home}
              color="blue"
            />
            <StatsCard
              title="Disponíveis"
              value={stats?.imoveisDisponiveis || 0}
              icon={CheckCircle}
              color="green"
            />
            <StatsCard
              title="Vendidos"
              value={stats?.imoveisVendidos || 0}
              icon={DollarSign}
              color="yellow"
            />
            <StatsCard
              title="Alugados"
              value={stats?.imoveisAlugados || 0}
              icon={Calendar}
              color="purple"
            />
          </div>

          {/* Lista de Imóveis */}
          <Card>
            <CardHeader>
              <CardTitle>Portfólio de Imóveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imoveis.map((imovel) => (
                  <div
                    key={imovel.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Home className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{imovel.titulo}</p>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {imovel.endereco}, {imovel.bairro}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {imovel.quartos} quartos • {imovel.banheiros}{" "}
                          banheiros
                          {imovel.vagas ? ` • ${imovel.vagas} vagas` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">
                          {formatarPreco(imovel.preco)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{imovel.tipo}</Badge>
                          <Badge
                            variant={
                              imovel.status === "DISPONIVEL"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {imovel.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProperty(imovel.id)}
                          title="Ver imóvel"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProperty(imovel.id)}
                          title="Editar imóvel"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProperty(imovel.id)}
                          title="Excluir imóvel"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScheduleVisit(imovel.id)}
                          title="Agendar visita"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agenda */}
        <TabsContent value="agenda" className="space-y-6">
          <AdvancedCalendar
            userRole="CORRETOR"
            userId={localStorage.getItem("userId") || "corretor1"}
            userName={localStorage.getItem("userName") || "Corretor"}
          />
        </TabsContent>

        {/* Vendas */}
        <TabsContent value="vendas" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Performance de Vendas</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePerformanceReport}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatório
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ranking
                    </p>
                    <p className="text-3xl font-bold">#2</p>
                    <p className="text-sm text-muted-foreground">
                      Entre os corretores
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <Badge variant="default">TOP PERFORMER</Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Avaliação
                    </p>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold mr-2">4.8</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < 5
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      42 avaliações
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Eficiência
                    </p>
                    <p className="text-3xl font-bold">92%</p>
                    <p className="text-sm text-muted-foreground">
                      Leads convertidos
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <Badge variant="default">ALTA EFICIÊNCIA</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Vendas */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "1",
                    cliente: "João Silva",
                    imovel: "Apartamento Setor Bueno",
                    valor: 650000,
                    comissao: 19500,
                    data: "2024-12-15",
                    status: "FINALIZADA",
                  },
                  {
                    id: "2",
                    cliente: "Maria Santos",
                    imovel: "Casa Jardim Goiás",
                    valor: 450000,
                    comissao: 13500,
                    data: "2024-12-08",
                    status: "FINALIZADA",
                  },
                ].map((venda) => (
                  <div
                    key={venda.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold">{venda.cliente}</p>
                        <p className="text-sm text-muted-foreground">
                          {venda.imovel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(venda.data).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatarPreco(venda.valor)}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Comissão: {formatarPreco(venda.comissao)}
                      </p>
                      <Badge variant="default">{venda.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="configuracoes" className="space-y-6">
          <h2 className="text-2xl font-bold">Configurações</h2>

          {/* Integrações Premium */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <WhatsAppIntegration userRole="CORRETOR" />
            <CalendarIntegration userRole="CORRETOR" />
          </div>

          {/* Configurações de Notificação */}
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novos Leads</p>
                  <p className="text-sm text-muted-foreground">
                    Receber notificação quando um novo lead chegar
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Agendamentos</p>
                  <p className="text-sm text-muted-foreground">
                    Lembrete de visitas agendadas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Metas</p>
                  <p className="text-sm text-muted-foreground">
                    Progresso da meta mensal
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Corretor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo</Label>
                  <Input defaultValue="Carlos Silva" />
                </div>
                <div>
                  <Label>CRECI</Label>
                  <Input defaultValue="12345-GO" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue="carlos@siqueicamposimoveis.com.br" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input defaultValue="(62) 9 9999-8888" />
                </div>
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CriarImovelModal
        isOpen={showCriarImovel}
        onClose={() => setShowCriarImovel(false)}
        onSuccess={carregarDados}
      />

      <CadastrarLeadModal
        isOpen={showCadastrarLead}
        onClose={() => setShowCadastrarLead(false)}
        onSuccess={carregarDados}
      />

      {/* Modal de Agendamento de Visitas */}
      {showAgendarVisita && selectedLeadCorretor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Agendar Visita</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAgendarVisita(false);
                    setSelectedLeadCorretor(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold">Cliente</h4>
                  <p className="text-sm">{selectedLeadCorretor.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLeadCorretor.telefone}
                  </p>
                  {selectedLeadCorretor.email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedLeadCorretor.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Data da Visita</Label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="17:00">17:00</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Imóvel de Interesse</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      {imoveis.slice(0, 5).map((imovel) => (
                        <SelectItem key={imovel.id} value={imovel.id}>
                          {imovel.titulo} - {formatarPreco(imovel.preco)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Observações sobre a visita..."
                    className="h-20"
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h5 className="font-medium">Confirmação Automática</h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="whatsapp-confirm-corretor"
                        className="rounded"
                        defaultChecked
                      />
                      <label
                        htmlFor="whatsapp-confirm-corretor"
                        className="text-sm"
                      >
                        Enviar confirmação via WhatsApp
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="email-confirm-corretor"
                        className="rounded"
                      />
                      <label
                        htmlFor="email-confirm-corretor"
                        className="text-sm"
                      >
                        Enviar confirmação por email
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="calendar-reminder"
                        className="rounded"
                        defaultChecked
                      />
                      <label htmlFor="calendar-reminder" className="text-sm">
                        Adicionar à minha agenda
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Simular agendamento
                    const whatsappMessage = `Olá ${selectedLeadCorretor.nome}!

Sua visita foi agendada com sucesso! ��

📅 Data: [Data selecionada]
🕐 Horário: [Horário selecionado]
📍 Imóvel: [Imóvel selecionado]
👨‍💼 Corretor: Juarez Siqueira Campos

Qualquer dúvida, estou à disposição!

Siqueira Campos Imóveis
📱 (62) 9 8556-3505`;

                    const phoneNumber = selectedLeadCorretor.telefone.replace(
                      /\D/g,
                      "",
                    );
                    window.open(
                      `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`,
                      "_blank",
                    );

                    alert(
                      "✅ Visita agendada com sucesso!\n\nConfirmação enviada via WhatsApp.",
                    );
                    setShowAgendarVisita(false);
                    setSelectedLeadCorretor(null);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar e Confirmar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAgendarVisita(false);
                    setSelectedLeadCorretor(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal WhatsApp Business */}
      {showWhatsAppBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-green-600" />
                  WhatsApp Business - Central do Corretor
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWhatsAppBusiness(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ações Rápidas do Corretor */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Ferramentas de Vendas
                  </h4>

                  <div className="space-y-3">
                    <Button
                      className="w-full justify-start bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        window.open("https://web.whatsapp.com/", "_blank");
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Abrir WhatsApp Web
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const message =
                          "🏠 Novos imóveis disponíveis na Siqueira Campos!\n\nOlá! Tenho ótimas oportunidades que podem interessar você. Gostaria de conhecer?";
                        navigator.clipboard.writeText(message);
                        alert("Mensagem de prospecção copiada!");
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Copiar Mensagem de Prospecção
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const message =
                          "Olá! Sou corretor da Siqueira Campos Imóveis. Vi que você tem interesse em imóveis. Como posso ajudá-lo a encontrar a casa dos seus sonhos?";
                        navigator.clipboard.writeText(message);
                        alert("Mensagem de apresentação copiada!");
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mensagem de Apresentação
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">Templates de Mensagens</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {[
                        "🏠 Ol��! Tenho um imóvel perfeito para seu perfil. Gostaria de agendar uma visita?",
                        "📍 Ótima localização no Setor Bueno! Este apartamento pode ser o que você procura.",
                        "💰 Condições especiais de financiamento! Vamos conversar sobre as possibilidades?",
                        "🔑 Apartamento pronto para morar! Quando podemos agendar uma visita?",
                        "📋 Documentação aprovada! Podemos dar início ao processo de compra.",
                        "🎯 Investimento garantido! Este imóvel tem grande potencial de valorização.",
                        "🏆 Oportunidade única! Imóvel com desconto especial para este mês.",
                      ].map((msg, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <p className="text-sm mb-2">{msg}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(msg);
                              alert("Mensagem copiada!");
                            }}
                          >
                            Copiar Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Leads para Contato */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">
                    Seus Leads - Contato Direto
                  </h4>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {leads.slice(0, 6).map((lead) => (
                      <div key={lead.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold">{lead.nome}</h5>
                            <p className="text-sm text-muted-foreground">
                              {lead.telefone}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.origem} •{" "}
                              {new Date(lead.criadoEm).toLocaleDateString(
                                "pt-BR",
                              )}
                            </p>
                          </div>
                          <Badge
                            className={
                              lead.status === "NOVO"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </div>

                        <p className="text-sm mb-3 line-clamp-2">
                          {lead.mensagem}
                        </p>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              const message = `Olá ${lead.nome}! Sou Juarez da Siqueira Campos Imóveis. ${lead.mensagem ? `Vi sua mensagem: "${lead.mensagem}".` : ""} Como posso ajudá-lo a encontrar o imóvel ideal?`;
                              const phoneNumber = lead.telefone.replace(
                                /\D/g,
                                "",
                              );
                              window.open(
                                `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`,
                                "_blank",
                              );
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLeadCorretor(lead);
                              setShowAgendarVisita(true);
                              setShowWhatsAppBusiness(false);
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Agendar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estatísticas do Corretor */}
              <div className="border-t mt-6 pt-6">
                <h4 className="font-semibold text-lg mb-4">
                  Suas Estatísticas WhatsApp
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {leads.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Leads Ativos
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">94%</div>
                    <div className="text-sm text-muted-foreground">
                      Taxa de Resposta
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      1.8h
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tempo Médio Resposta
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats?.imoveisVendidos || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Vendas via WhatsApp
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização de Lead */}
      {showViewLeadModal && selectedLeadCorretor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Detalhes do Lead</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowViewLeadModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Nome</Label>
                  <p className="text-muted-foreground">
                    {selectedLeadCorretor.nome}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Telefone</Label>
                  <p className="text-muted-foreground">
                    {selectedLeadCorretor.telefone}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p className="text-muted-foreground">
                    {selectedLeadCorretor.email || "Não informado"}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge variant="secondary">
                    {selectedLeadCorretor.status}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Origem</Label>
                  <p className="text-muted-foreground">
                    {selectedLeadCorretor.origem}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Data</Label>
                  <p className="text-muted-foreground">
                    {selectedLeadCorretor.criadoEm.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Mensagem</Label>
                <p className="text-muted-foreground p-3 bg-muted rounded-lg">
                  {selectedLeadCorretor.mensagem}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    const phoneNumber = selectedLeadCorretor.telefone.replace(
                      /\D/g,
                      "",
                    );
                    window.open(`tel:${phoneNumber}`, "_self");
                  }}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const message = `Olá ${selectedLeadCorretor.nome}! Sou da Siqueira Campos Imóveis.`;
                    const whatsappUrl = `https://wa.me/55${selectedLeadCorretor.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Lead */}
      {showEditLeadModal && selectedLeadCorretor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Editar Lead</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditLeadModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Atualizar lead
                  alert("Lead atualizado com sucesso!");
                  setShowEditLeadModal(false);
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-nome">Nome</Label>
                    <Input
                      id="edit-nome"
                      defaultValue={selectedLeadCorretor.nome}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-telefone">Telefone</Label>
                    <Input
                      id="edit-telefone"
                      defaultValue={selectedLeadCorretor.telefone}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      defaultValue={selectedLeadCorretor.email}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select defaultValue={selectedLeadCorretor.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOVO">Novo</SelectItem>
                        <SelectItem value="CONTATADO">Contatado</SelectItem>
                        <SelectItem value="QUALIFICADO">Qualificado</SelectItem>
                        <SelectItem value="PROPOSTA">Proposta</SelectItem>
                        <SelectItem value="CONVERTIDO">Convertido</SelectItem>
                        <SelectItem value="PERDIDO">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-observacoes">Observações</Label>
                  <Textarea
                    id="edit-observacoes"
                    placeholder="Adicionar observações sobre o lead..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Salvar Alterações
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditLeadModal(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Propriedade */}
      {showEditPropertyModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Editar Imóvel</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditPropertyModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Atualizar propriedade
                  alert("Imóvel atualizado com sucesso!");
                  setShowEditPropertyModal(false);
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-titulo">Título</Label>
                    <Input
                      id="edit-titulo"
                      defaultValue={selectedProperty.titulo}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-preco">Preço</Label>
                    <Input
                      id="edit-preco"
                      type="number"
                      defaultValue={selectedProperty.preco}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-tipo">Tipo</Label>
                    <Select defaultValue={selectedProperty.tipo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                        <SelectItem value="CASA">Casa</SelectItem>
                        <SelectItem value="TERRENO">Terreno</SelectItem>
                        <SelectItem value="COMERCIAL">Comercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-finalidade">Finalidade</Label>
                    <Select defaultValue={selectedProperty.finalidade}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VENDA">Venda</SelectItem>
                        <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                        <SelectItem value="AMBOS">Venda e Aluguel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-quartos">Quartos</Label>
                    <Input
                      id="edit-quartos"
                      type="number"
                      defaultValue={selectedProperty.quartos}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-banheiros">Banheiros</Label>
                    <Input
                      id="edit-banheiros"
                      type="number"
                      defaultValue={selectedProperty.banheiros}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-endereco">Endereço</Label>
                  <Input
                    id="edit-endereco"
                    defaultValue={selectedProperty.endereco}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-descricao">Descrição</Label>
                  <Textarea
                    id="edit-descricao"
                    defaultValue={selectedProperty.descricao}
                    rows={4}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Salvar Alterações
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditPropertyModal(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
