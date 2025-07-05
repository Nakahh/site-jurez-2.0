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
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Calendar,
  FileText,
  MessageCircle,
  MapPin,
  Phone,
  User,
  Clock,
  Home,
  ChevronRight,
  Star,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";

interface DashboardStats {
  favoritos: number;
  visitas: number;
  contratos: number;
  mensagens: number;
}

interface Favorito {
  id: string;
  imovel: {
    id: string;
    titulo: string;
    preco: number;
    endereco: string;
    bairro: string;
    tipo: string;
    fotos: string[];
  };
}

interface Visita {
  id: string;
  dataHora: string;
  status: string;
  imovel: {
    titulo: string;
    endereco: string;
  };
  corretor: {
    nome: string;
    whatsapp: string;
  };
}

interface Contrato {
  id: string;
  tipo: string;
  valor: number;
  status: string;
  dataInicio: string;
  imovel: {
    titulo: string;
    endereco: string;
  };
}

export default function ClienteDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    favoritos: 0,
    visitas: 0,
    contratos: 0,
    mensagens: 0,
  });

  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados do cliente
    setTimeout(() => {
      setStats({
        favoritos: 8,
        visitas: 3,
        contratos: 1,
        mensagens: 12,
      });

      setFavoritos([
        {
          id: "1",
          imovel: {
            id: "1",
            titulo: "Apartamento 3 Quartos - Setor Oeste",
            preco: 450000,
            endereco: "Rua das Flores, 123",
            bairro: "Setor Oeste",
            tipo: "APARTAMENTO",
            fotos: [
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
            ],
          },
        },
        {
          id: "2",
          imovel: {
            id: "2",
            titulo: "Casa 4 Quartos - Jardim Goiás",
            preco: 650000,
            endereco: "Avenida Central, 456",
            bairro: "Jardim Goiás",
            tipo: "CASA",
            fotos: [
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
            ],
          },
        },
      ]);

      setVisitas([
        {
          id: "1",
          dataHora: "2024-01-20T14:00:00Z",
          status: "AGENDADA",
          imovel: {
            titulo: "Apartamento 3 Quartos - Setor Oeste",
            endereco: "Rua das Flores, 123",
          },
          corretor: {
            nome: "João Silva",
            whatsapp: "62985563505",
          },
        },
      ]);

      setContratos([
        {
          id: "1",
          tipo: "ALUGUEL",
          valor: 2500,
          status: "ATIVO",
          dataInicio: "2024-01-01T00:00:00Z",
          imovel: {
            titulo: "Apartamento 2 Quartos - Centro",
            endereco: "Rua do Centro, 789",
          },
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">
                Meu Dashboard
              </h1>
              <p className="text-amber-700">
                Gerencie seus imóveis favoritos e contratos
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <User className="w-4 h-4 mr-2" />
                Meu Perfil
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Phone className="w-4 h-4 mr-2" />
                Falar com Corretor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-amber-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">
                Favoritos
              </CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {stats.favoritos}
              </div>
              <p className="text-xs text-amber-600">Imóveis salvos</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">
                Visitas
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {stats.visitas}
              </div>
              <p className="text-xs text-amber-600">Agendadas</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">
                Contratos
              </CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {stats.contratos}
              </div>
              <p className="text-xs text-amber-600">Ativos</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">
                Mensagens
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {stats.mensagens}
              </div>
              <p className="text-xs text-amber-600">Não lidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="favoritos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-amber-200">
            <TabsTrigger
              value="favoritos"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger
              value="visitas"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Visitas
            </TabsTrigger>
            <TabsTrigger
              value="contratos"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
            >
              <FileText className="w-4 h-4 mr-2" />
              Contratos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favoritos">
            <Card className="border-amber-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Meus Imóveis Favoritos
                </CardTitle>
                <CardDescription>
                  Imóveis que você marcou como favoritos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {favoritos.map((favorito) => (
                      <div
                        key={favorito.id}
                        className="border border-amber-200 rounded-lg p-4 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex space-x-4">
                          <img
                            src={favorito.imovel.fotos[0]}
                            alt={favorito.imovel.titulo}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-amber-900">
                                  {favorito.imovel.titulo}
                                </h3>
                                <p className="text-sm text-amber-700 flex items-center mt-1">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {favorito.imovel.endereco},{" "}
                                  {favorito.imovel.bairro}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-amber-900">
                                  {formatPrice(favorito.imovel.preco)}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-100 text-amber-800"
                                >
                                  {favorito.imovel.tipo}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Remover Favorito
                              </Button>
                              <Button
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                Ver Detalhes
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitas">
            <Card className="border-amber-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900">Minhas Visitas</CardTitle>
                <CardDescription>
                  Visitas agendadas e realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visitas.map((visita) => (
                    <div
                      key={visita.id}
                      className="border border-amber-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-amber-900">
                            {visita.imovel.titulo}
                          </h3>
                          <p className="text-sm text-amber-700 flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {visita.imovel.endereco}
                          </p>
                          <p className="text-sm text-amber-700 flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(visita.dataHora)}
                          </p>
                          <p className="text-sm text-amber-700 flex items-center mt-1">
                            <User className="w-4 h-4 mr-1" />
                            Corretor: {visita.corretor.nome}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 mb-2">
                            {visita.status}
                          </Badge>
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-700"
                            >
                              Remarcar
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Ligar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contratos">
            <Card className="border-amber-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-amber-900">Meus Contratos</CardTitle>
                <CardDescription>Contratos de aluguel e compra</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contratos.map((contrato) => (
                    <div
                      key={contrato.id}
                      className="border border-amber-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-amber-900">
                            {contrato.imovel.titulo}
                          </h3>
                          <p className="text-sm text-amber-700 flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {contrato.imovel.endereco}
                          </p>
                          <p className="text-sm text-amber-700 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Desde: {formatDate(contrato.dataInicio)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-900">
                            {formatPrice(contrato.valor)}/mês
                          </p>
                          <Badge className="bg-green-100 text-green-800 mb-2">
                            {contrato.status}
                          </Badge>
                          <div>
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              {contrato.tipo}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-300 text-amber-700"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Ver Contrato
                        </Button>
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Falar com Administração
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ChatBubble />
    </div>
  );
}
