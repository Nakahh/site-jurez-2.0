import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Calendar,
  Phone,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Mail,
  MessageCircle,
  ArrowLeft,
  Check,
  Camera,
  Map,
  Info,
  Calculator,
  Download,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";
import { TipoImovel, Finalidade, StatusImovel } from "@shared/types";

interface Imovel {
  id: string;
  titulo: string;
  preco: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: TipoImovel;
  finalidade: Finalidade;
  status: StatusImovel;
  fotos: string[];
  destaque: boolean;
  descricao: string;
  caracteristicas: string[];
  comodidades: string[];
  proximidades: string[];
  corretor: {
    nome: string;
    telefone: string;
    email: string;
    foto: string;
  };
  condominio?: number;
  iptu?: number;
  latitude?: number;
  longitude?: number;
}

const imovelExample: Imovel = {
  id: "1",
  titulo: "Apartamento Luxuoso no Jardim Goiás",
  preco: 450000,
  area: 120,
  quartos: 3,
  banheiros: 2,
  vagas: 2,
  endereco: "Rua das Rosas, 123",
  bairro: "Jardim Goiás",
  cidade: "Goiânia",
  tipo: TipoImovel.APARTAMENTO,
  finalidade: Finalidade.VENDA,
  status: StatusImovel.DISPONIVEL,
  fotos: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
  ],
  destaque: true,
  descricao: `Apartamento moderno com acabamento de alto padrão, localizado em uma das regiões mais valorizadas de Goiânia. O imóvel conta com ampla sala de estar integrada à varanda gourmet, cozinha planejada com bancada em granito, três dormitórios sendo uma suíte master com closet e banheiro com hidromassagem.

O condomínio oferece uma infraestrutura completa com piscina, academia, salão de festas, quadra poliesportiva, playground e segurança 24 horas. Localização privilegiada com fácil acesso ao Flamboyant Shopping, principais avenidas e transporte público.

Ideal para famílias que buscam conforto, segurança e qualidade de vida em um dos bairros mais nobres da capital.`,
  caracteristicas: [
    "Sacada gourmet",
    "Cozinha planejada",
    "Suíte master",
    "Closet",
    "Hidromassagem",
    "Ar condicionado",
    "Aquecimento solar",
    "Interfone",
  ],
  comodidades: [
    "Piscina adulto e infantil",
    "Academia equipada",
    "Salão de festas",
    "Quadra poliesportiva",
    "Playground",
    "Segurança 24h",
    "Portaria",
    "Elevador",
    "Gerador",
    "Sistema de combate a incêndio",
  ],
  proximidades: [
    "Flamboyant Shopping - 800m",
    "Colégio Sesi - 500m",
    "Hospital Encore - 1.2km",
    "Parque Vaca Brava - 1.5km",
    "UFG - 3km",
    "Aeroporto - 8km",
    "Centro da cidade - 4km",
  ],
  corretor: {
    nome: "Juarez Siqueira",
    telefone: "(62) 9 8556-3505",
    email: "juarez@siqueicamposimoveis.com.br",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  condominio: 450,
  iptu: 120,
  latitude: -16.686,
  longitude: -49.2648,
};

export default function Imovel() {
  const { id } = useParams();
  const [imovel] = useState<Imovel>(imovelExample);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [contactForm, setContactForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    mensagem: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    data: "",
    horario: "",
    observacoes: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === imovel.fotos.length - 1 ? 0 : prev + 1,
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? imovel.fotos.length - 1 : prev - 1,
    );
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form:", contactForm);
    setShowContactForm(false);
    // Aqui implementaria o envio do formulário
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Schedule form:", scheduleForm);
    setShowScheduleForm(false);
    // Aqui implementaria o agendamento
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: imovel.titulo,
        text: imovel.descricao,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Mostrar toast de sucesso
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=150"
                alt="Siqueira Campos Imóveis"
                className="h-8 w-auto"
              />
            </Link>
            <Link
              to="/imoveis"
              className="flex items-center text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para listagem
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-amber-600">
            <Link to="/" className="hover:text-amber-800">
              Início
            </Link>
            <span>/</span>
            <Link to="/imoveis" className="hover:text-amber-800">
              Imóveis
            </Link>
            <span>/</span>
            <span className="text-amber-800 font-medium">{imovel.titulo}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <Card className="overflow-hidden border-amber-200 shadow-lg">
              <div className="relative">
                <img
                  src={imovel.fotos[currentPhotoIndex]}
                  alt={`${imovel.titulo} - Foto ${currentPhotoIndex + 1}`}
                  className="w-full h-96 object-cover"
                />
                {imovel.destaque && (
                  <Badge className="absolute top-4 left-4 bg-amber-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="bg-white/90 hover:bg-white p-2 h-8 w-8"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"}`}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={shareProperty}
                    className="bg-white/90 hover:bg-white p-2 h-8 w-8"
                  >
                    <Share2 className="w-4 h-4 text-amber-600" />
                  </Button>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentPhotoIndex + 1} / {imovel.fotos.length}
                </div>
                {imovel.fotos.length > 1 && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 h-8 w-8"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 h-8 w-8"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {imovel.fotos.slice(0, 4).map((foto, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`relative overflow-hidden rounded border-2 ${
                        currentPhotoIndex === index
                          ? "border-amber-500"
                          : "border-amber-200"
                      }`}
                    >
                      <img
                        src={foto}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-16 object-cover hover:scale-105 transition-transform"
                      />
                      {index === 3 && imovel.fotos.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold">
                          +{imovel.fotos.length - 4}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Details */}
            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <Badge className="bg-amber-100 text-amber-800">
                        {imovel.finalidade}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-amber-300 text-amber-700"
                      >
                        {imovel.tipo}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl text-amber-900">
                      {imovel.titulo}
                    </CardTitle>
                    <div className="flex items-center text-amber-600 mt-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {imovel.endereco}, {imovel.bairro}, {imovel.cidade}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-amber-900">
                      {formatPrice(imovel.preco)}
                    </div>
                    {imovel.finalidade === Finalidade.ALUGUEL && (
                      <div className="text-sm text-amber-600">
                        + Condomínio: {formatPrice(imovel.condominio || 0)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {imovel.quartos > 0 && (
                    <div className="flex items-center text-amber-700">
                      <Bed className="w-5 h-5 mr-2" />
                      <span className="font-medium">{imovel.quartos}</span>
                      <span className="ml-1">quartos</span>
                    </div>
                  )}
                  {imovel.banheiros > 0 && (
                    <div className="flex items-center text-amber-700">
                      <Bath className="w-5 h-5 mr-2" />
                      <span className="font-medium">{imovel.banheiros}</span>
                      <span className="ml-1">banheiros</span>
                    </div>
                  )}
                  {imovel.vagas && imovel.vagas > 0 && (
                    <div className="flex items-center text-amber-700">
                      <Car className="w-5 h-5 mr-2" />
                      <span className="font-medium">{imovel.vagas}</span>
                      <span className="ml-1">vagas</span>
                    </div>
                  )}
                  <div className="flex items-center text-amber-700">
                    <Maximize className="w-5 h-5 mr-2" />
                    <span className="font-medium">{imovel.area}</span>
                    <span className="ml-1">m²</span>
                  </div>
                </div>

                <Tabs defaultValue="descricao" className="mt-6">
                  <TabsList className="grid w-full grid-cols-4 bg-amber-50">
                    <TabsTrigger value="descricao">Descrição</TabsTrigger>
                    <TabsTrigger value="caracteristicas">
                      Características
                    </TabsTrigger>
                    <TabsTrigger value="comodidades">Comodidades</TabsTrigger>
                    <TabsTrigger value="localizacao">Localização</TabsTrigger>
                  </TabsList>
                  <TabsContent value="descricao" className="mt-6">
                    <div className="prose max-w-none text-amber-900">
                      {imovel.descricao
                        .split("\n\n")
                        .map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="caracteristicas" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {imovel.caracteristicas.map((caracteristica) => (
                        <div
                          key={caracteristica}
                          className="flex items-center text-amber-700"
                        >
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          {caracteristica}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="comodidades" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {imovel.comodidades.map((comodidade) => (
                        <div
                          key={comodidade}
                          className="flex items-center text-amber-700"
                        >
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          {comodidade}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="localizacao" className="mt-6">
                    <div className="space-y-4">
                      <div className="bg-amber-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-amber-900 mb-2">
                          Proximidades
                        </h4>
                        <div className="space-y-2">
                          {imovel.proximidades.map((proximidade) => (
                            <div
                              key={proximidade}
                              className="flex items-center text-amber-700"
                            >
                              <MapPin className="w-4 h-4 mr-2" />
                              {proximidade}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-600">
                          <Map className="w-12 h-12 mx-auto mb-2" />
                          <p>Mapa interativo</p>
                          <p className="text-sm">
                            Latitude: {imovel.latitude}, Longitude:{" "}
                            {imovel.longitude}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Interessado neste imóvel?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog
                  open={showContactForm}
                  onOpenChange={setShowContactForm}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Entrar em Contato
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Entre em Contato</DialogTitle>
                      <DialogDescription>
                        Preencha os dados para falar conosco sobre este imóvel
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <Input
                        placeholder="Seu nome"
                        value={contactForm.nome}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            nome: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Seu telefone"
                        value={contactForm.telefone}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            telefone: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Seu e-mail"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                      <Textarea
                        placeholder="Sua mensagem..."
                        value={contactForm.mensagem}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            mensagem: e.target.value,
                          })
                        }
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowContactForm(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                        >
                          Enviar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={showScheduleForm}
                  onOpenChange={setShowScheduleForm}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Visita
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agendar Visita</DialogTitle>
                      <DialogDescription>
                        Escolha o melhor horário para visitar este imóvel
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleScheduleSubmit} className="space-y-4">
                      <Input
                        placeholder="Seu nome"
                        value={scheduleForm.nome}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            nome: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Seu telefone"
                        value={scheduleForm.telefone}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            telefone: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Seu e-mail"
                        value={scheduleForm.email}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        type="date"
                        value={scheduleForm.data}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            data: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        type="time"
                        value={scheduleForm.horario}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            horario: e.target.value,
                          })
                        }
                        required
                      />
                      <Textarea
                        placeholder="Observações (opcional)"
                        value={scheduleForm.observacoes}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            observacoes: e.target.value,
                          })
                        }
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowScheduleForm(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                        >
                          Agendar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Simular Financiamento
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Ficha do Imóvel
                </Button>
              </CardContent>
            </Card>

            {/* Broker Info */}
            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">Seu Corretor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={imovel.corretor.foto}
                    alt={imovel.corretor.nome}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-amber-900">
                      {imovel.corretor.nome}
                    </h4>
                    <p className="text-sm text-amber-600">
                      Corretor especializado
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-amber-700">
                    <Phone className="w-4 h-4 mr-2" />
                    {imovel.corretor.telefone}
                  </div>
                  <div className="flex items-center text-amber-700">
                    <Mail className="w-4 h-4 mr-2" />
                    {imovel.corretor.email}
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  Chamar no WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="border-amber-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Informações Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-600">Código do imóvel:</span>
                    <span className="font-medium text-amber-900">
                      #{imovel.id}
                    </span>
                  </div>
                  {imovel.condominio && (
                    <div className="flex justify-between">
                      <span className="text-amber-600">Condomínio:</span>
                      <span className="font-medium text-amber-900">
                        {formatPrice(imovel.condominio)}
                      </span>
                    </div>
                  )}
                  {imovel.iptu && (
                    <div className="flex justify-between">
                      <span className="text-amber-600">IPTU:</span>
                      <span className="font-medium text-amber-900">
                        {formatPrice(imovel.iptu)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-amber-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {imovel.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-amber-900 mb-8">
            Imóveis Similares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Aqui seriam carregados imóveis similares */}
            <div className="text-center text-amber-600 py-12 col-span-full">
              <Info className="w-12 h-12 mx-auto mb-4" />
              <p>Imóveis similares serão carregados aqui</p>
            </div>
          </div>
        </div>
      </div>

      <ChatBubble />
    </div>
  );
}
