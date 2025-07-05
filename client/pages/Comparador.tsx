import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  X,
  Home,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  XCircle,
  Star,
  Eye,
  Calendar,
  Phone,
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
  foto: string;
  caracteristicas: string[];
  comodidades: string[];
  condominio?: number;
  iptu?: number;
  precoM2: number;
}

const availableImoveis: Imovel[] = [
  {
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
    foto: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    caracteristicas: [
      "Sacada gourmet",
      "Cozinha planejada",
      "Suíte master",
      "Closet",
      "Hidromassagem",
      "Ar condicionado",
    ],
    comodidades: [
      "Piscina",
      "Academia",
      "Salão de festas",
      "Segurança 24h",
      "Portaria",
      "Elevador",
    ],
    condominio: 450,
    iptu: 120,
    precoM2: 3750,
  },
  {
    id: "2",
    titulo: "Casa Espaçosa no Setor Oeste",
    preco: 650000,
    area: 200,
    quartos: 4,
    banheiros: 3,
    vagas: 3,
    endereco: "Avenida Central, 456",
    bairro: "Setor Oeste",
    cidade: "Goiânia",
    tipo: TipoImovel.CASA,
    finalidade: Finalidade.VENDA,
    status: StatusImovel.DISPONIVEL,
    foto: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
    caracteristicas: [
      "Quintal amplo",
      "Área gourmet",
      "Piscina",
      "Portão eletrônico",
      "Churrasqueira",
      "Jardim",
    ],
    comodidades: [
      "Piscina privativa",
      "Área gourmet",
      "Jardim",
      "Portão eletrônico",
      "Churrasqueira",
    ],
    iptu: 180,
    precoM2: 3250,
  },
  {
    id: "3",
    titulo: "Apartamento Moderno na Aldeota",
    preco: 280000,
    area: 80,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    endereco: "Rua das Palmeiras, 789",
    bairro: "Aldeota",
    cidade: "Goiânia",
    tipo: TipoImovel.APARTAMENTO,
    finalidade: Finalidade.VENDA,
    status: StatusImovel.DISPONIVEL,
    foto: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop",
    caracteristicas: [
      "Próximo UFG",
      "Mobiliado",
      "Internet fibra",
      "Balcão americano",
      "Varanda",
    ],
    comodidades: ["Elevador", "Portaria", "Interfone", "Salão de festas"],
    condominio: 280,
    iptu: 80,
    precoM2: 3500,
  },
  {
    id: "4",
    titulo: "Casa de Alto Padrão no Alto da Glória",
    preco: 850000,
    area: 300,
    quartos: 5,
    banheiros: 4,
    vagas: 4,
    endereco: "Rua do Mirante, 321",
    bairro: "Alto da Glória",
    cidade: "Goiânia",
    tipo: TipoImovel.CASA,
    finalidade: Finalidade.VENDA,
    status: StatusImovel.DISPONIVEL,
    foto: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400&h=300&fit=crop",
    caracteristicas: [
      "Vista panorâmica",
      "Acabamento premium",
      "Área de lazer",
      "Segurança",
      "Paisagismo",
      "Home theater",
    ],
    comodidades: [
      "Piscina grande",
      "Área gourmet",
      "Home theater",
      "Escritório",
      "Jardim paisagístico",
      "Segurança 24h",
    ],
    iptu: 250,
    precoM2: 2833,
  },
];

export default function Comparador() {
  const [selectedImoveis, setSelectedImoveis] = useState<Imovel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredImoveis, setFilteredImoveis] =
    useState<Imovel[]>(availableImoveis);

  useEffect(() => {
    if (searchTerm) {
      const filtered = availableImoveis.filter(
        (imovel) =>
          imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          imovel.bairro.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredImoveis(filtered);
    } else {
      setFilteredImoveis(availableImoveis);
    }
  }, [searchTerm]);

  const addToComparison = (imovel: Imovel) => {
    if (
      selectedImoveis.length < 3 &&
      !selectedImoveis.find((i) => i.id === imovel.id)
    ) {
      setSelectedImoveis([...selectedImoveis, imovel]);
    }
  };

  const removeFromComparison = (imovelId: string) => {
    setSelectedImoveis(selectedImoveis.filter((i) => i.id !== imovelId));
  };

  const clearComparison = () => {
    setSelectedImoveis([]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatPricePerM2 = (price: number) => {
    return (
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price) + "/m²"
    );
  };

  const hasCharacteristic = (imovel: Imovel, characteristic: string) => {
    return (
      imovel.caracteristicas.includes(characteristic) ||
      imovel.comodidades.includes(characteristic)
    );
  };

  // Get all unique characteristics for comparison
  const allCharacteristics = Array.from(
    new Set([
      ...selectedImoveis.flatMap((i) => i.caracteristicas),
      ...selectedImoveis.flatMap((i) => i.comodidades),
    ]),
  );

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
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-amber-700 hover:text-amber-900 transition-colors"
              >
                Início
              </Link>
              <Link
                to="/imoveis"
                className="text-amber-700 hover:text-amber-900 transition-colors"
              >
                Imóveis
              </Link>
              <span className="text-amber-900 font-medium">Comparador</span>
            </nav>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Phone className="w-4 h-4 mr-2" />
              Contato
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Compare Imóveis
          </h1>
          <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto">
            Compare até 3 imóveis lado a lado e tome a melhor decisão
          </p>
          <Badge className="bg-white/20 text-white px-4 py-2">
            {selectedImoveis.length}/3 imóveis selecionados
          </Badge>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Selection */}
          <div className="lg:col-span-1">
            <Card className="border-amber-200 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-amber-900">
                  Selecionar Imóveis
                </CardTitle>
                <CardDescription>
                  Escolha até 3 imóveis para comparar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar imóveis..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-amber-300"
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredImoveis.map((imovel) => (
                      <div
                        key={imovel.id}
                        className={`border rounded-lg p-3 transition-all ${
                          selectedImoveis.find((i) => i.id === imovel.id)
                            ? "border-amber-500 bg-amber-50"
                            : "border-amber-200 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex space-x-3">
                          <img
                            src={imovel.foto}
                            alt={imovel.titulo}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-amber-900 text-sm truncate">
                              {imovel.titulo}
                            </h4>
                            <p className="text-xs text-amber-600 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {imovel.bairro}
                            </p>
                            <p className="text-sm font-bold text-amber-900">
                              {formatPrice(imovel.preco)}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-amber-600 mt-1">
                              <span>{imovel.quartos}q</span>
                              <span>{imovel.banheiros}b</span>
                              <span>{imovel.area}m²</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          {selectedImoveis.find((i) => i.id === imovel.id) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromComparison(imovel.id)}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remover
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToComparison(imovel)}
                              disabled={selectedImoveis.length >= 3}
                              className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Comparar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedImoveis.length > 0 && (
                    <div className="pt-4 border-t border-amber-200">
                      <Button
                        variant="outline"
                        onClick={clearComparison}
                        className="w-full border-amber-300 text-amber-700"
                      >
                        Limpar Comparação
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <div className="lg:col-span-2">
            {selectedImoveis.length === 0 ? (
              <Card className="border-amber-200 shadow-lg">
                <CardContent className="py-16 text-center">
                  <Home className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-amber-900 mb-2">
                    Nenhum imóvel selecionado
                  </h3>
                  <p className="text-amber-700 mb-6">
                    Selecione até 3 imóveis da lista ao lado para começar a
                    comparação
                  </p>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Ver Todos os Imóveis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Property Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedImoveis.map((imovel) => (
                    <Card
                      key={imovel.id}
                      className="border-amber-200 shadow-md"
                    >
                      <div className="relative">
                        <img
                          src={imovel.foto}
                          alt={imovel.titulo}
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromComparison(imovel.id)}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1 h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-amber-900 text-sm mb-2 line-clamp-2">
                          {imovel.titulo}
                        </h4>
                        <div className="text-lg font-bold text-amber-900 mb-2">
                          {formatPrice(imovel.preco)}
                        </div>
                        <div className="flex justify-between text-xs text-amber-600">
                          <span>{imovel.quartos} quartos</span>
                          <span>{imovel.area}m²</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-300 text-amber-700"
                          >
                            <Calendar className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Comparison Table */}
                <Card className="border-amber-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-amber-900">
                      Comparação Detalhada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold text-amber-900">
                              Características
                            </TableHead>
                            {selectedImoveis.map((imovel) => (
                              <TableHead
                                key={imovel.id}
                                className="text-center font-semibold text-amber-900"
                              >
                                Imóvel {selectedImoveis.indexOf(imovel) + 1}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              Preço
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center font-bold text-amber-900"
                              >
                                {formatPrice(imovel.preco)}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              Preço por m²
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center text-amber-700"
                              >
                                {formatPricePerM2(imovel.precoM2)}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              Área
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center text-amber-700"
                              >
                                {imovel.area}m²
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              Quartos
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center text-amber-700"
                              >
                                {imovel.quartos}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              Banheiros
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center text-amber-700"
                              >
                                {imovel.banheiros}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              Vagas
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center text-amber-700"
                              >
                                {imovel.vagas || 0}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              Bairro
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center text-amber-700"
                              >
                                {imovel.bairro}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              Tipo
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center"
                              >
                                <Badge className="bg-amber-100 text-amber-800">
                                  {imovel.tipo}
                                </Badge>
                              </TableCell>
                            ))}
                          </TableRow>
                          {selectedImoveis.some((i) => i.condominio) && (
                            <TableRow>
                              <TableCell className="font-medium text-amber-800">
                                Condomínio
                              </TableCell>
                              {selectedImoveis.map((imovel) => (
                                <TableCell
                                  key={imovel.id}
                                  className="text-center text-amber-700"
                                >
                                  {imovel.condominio
                                    ? formatPrice(imovel.condominio)
                                    : "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell className="font-medium text-amber-800">
                              IPTU
                            </TableCell>
                            {selectedImoveis.map((imovel) => (
                              <TableCell
                                key={imovel.id}
                                className="text-center text-amber-700"
                              >
                                {imovel.iptu ? formatPrice(imovel.iptu) : "-"}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Characteristics Comparison */}
                {allCharacteristics.length > 0 && (
                  <Card className="border-amber-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-amber-900">
                        Características e Comodidades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold text-amber-900">
                                Item
                              </TableHead>
                              {selectedImoveis.map((imovel) => (
                                <TableHead
                                  key={imovel.id}
                                  className="text-center font-semibold text-amber-900"
                                >
                                  Imóvel {selectedImoveis.indexOf(imovel) + 1}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allCharacteristics.map((characteristic) => (
                              <TableRow key={characteristic}>
                                <TableCell className="font-medium text-amber-800">
                                  {characteristic}
                                </TableCell>
                                {selectedImoveis.map((imovel) => (
                                  <TableCell
                                    key={imovel.id}
                                    className="text-center"
                                  >
                                    {hasCharacteristic(
                                      imovel,
                                      characteristic,
                                    ) ? (
                                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Simular Financiamento
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Falar com Corretor
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatBubble />
    </div>
  );
}
