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
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Calendar,
  Phone,
  Eye,
  Grid,
  List,
  SlidersHorizontal,
  ChevronDown,
  Star,
  DollarSign,
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
}

const imoveis: Imovel[] = [
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
    fotos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    ],
    destaque: true,
    descricao:
      "Apartamento moderno com acabamento de alto padrão, sacada gourmet e área de lazer completa.",
    caracteristicas: [
      "Sacada gourmet",
      "Área de lazer",
      "Segurança 24h",
      "Academia",
    ],
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
    fotos: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=600&h=400&fit=crop",
    ],
    destaque: false,
    descricao:
      "Casa com quintal amplo, área gourmet e localização privilegiada próxima ao centro.",
    caracteristicas: [
      "Quintal amplo",
      "Área gourmet",
      "Piscina",
      "Portão eletrônico",
    ],
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
    fotos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop",
    ],
    destaque: false,
    descricao:
      "Apartamento ideal para jovens profissionais, próximo à UFG e com fácil acesso ao centro.",
    caracteristicas: ["Próximo UFG", "Mobiliado", "Internet fibra", "Elevador"],
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
    fotos: [
      "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
    ],
    destaque: true,
    descricao:
      "Casa de luxo com vista panorâmica da cidade, acabamento premium e área de lazer completa.",
    caracteristicas: [
      "Vista panorâmica",
      "Acabamento premium",
      "Área de lazer",
      "Segurança",
    ],
  },
  {
    id: "5",
    titulo: "Apartamento para Locação no Setor Bueno",
    preco: 2500,
    area: 90,
    quartos: 2,
    banheiros: 2,
    vagas: 1,
    endereco: "Avenida T-9, 654",
    bairro: "Setor Bueno",
    cidade: "Goiânia",
    tipo: TipoImovel.APARTAMENTO,
    finalidade: Finalidade.ALUGUEL,
    status: StatusImovel.DISPONIVEL,
    fotos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    ],
    destaque: false,
    descricao:
      "Apartamento semimobiliado em localização central, próximo a shopping e restaurantes.",
    caracteristicas: [
      "Semimobiliado",
      "Central",
      "Próximo shopping",
      "Transporte fácil",
    ],
  },
  {
    id: "6",
    titulo: "Terreno Comercial na Marginal Botafogo",
    preco: 1200000,
    area: 1000,
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    endereco: "Marginal Botafogo, 888",
    bairro: "Setor Central",
    cidade: "Goiânia",
    tipo: TipoImovel.COMERCIAL,
    finalidade: Finalidade.VENDA,
    status: StatusImovel.DISPONIVEL,
    fotos: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    ],
    destaque: false,
    descricao:
      "Terreno comercial estratégico para empreendimentos, com alta visibilidade e fluxo.",
    caracteristicas: [
      "Alta visibilidade",
      "Estratégico",
      "Comercial",
      "Grande fluxo",
    ],
  },
];

const ViewMode = {
  GRID: "grid",
  LIST: "list",
} as const;

export default function Imoveis() {
  const [filteredImoveis, setFilteredImoveis] = useState<Imovel[]>(imoveis);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<keyof typeof ViewMode>("GRID");
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    tipo: "",
    finalidade: "",
    bairro: "",
    precoMin: [0],
    precoMax: [2000000],
    quartos: "",
    banheiros: "",
    vagas: "",
    areaMin: [0],
    areaMax: [500],
  });

  const [sortBy, setSortBy] = useState("relevancia");

  useEffect(() => {
    let filtered = imoveis;

    // Busca por texto
    if (searchTerm) {
      filtered = filtered.filter(
        (imovel) =>
          imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          imovel.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
          imovel.endereco.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtros específicos
    if (filters.tipo) {
      filtered = filtered.filter((imovel) => imovel.tipo === filters.tipo);
    }

    if (filters.finalidade) {
      filtered = filtered.filter(
        (imovel) => imovel.finalidade === filters.finalidade,
      );
    }

    if (filters.bairro) {
      filtered = filtered.filter((imovel) =>
        imovel.bairro.toLowerCase().includes(filters.bairro.toLowerCase()),
      );
    }

    if (filters.quartos) {
      filtered = filtered.filter(
        (imovel) => imovel.quartos >= parseInt(filters.quartos),
      );
    }

    if (filters.banheiros) {
      filtered = filtered.filter(
        (imovel) => imovel.banheiros >= parseInt(filters.banheiros),
      );
    }

    if (filters.vagas) {
      filtered = filtered.filter(
        (imovel) => (imovel.vagas || 0) >= parseInt(filters.vagas),
      );
    }

    // Filtro de preço
    filtered = filtered.filter(
      (imovel) =>
        imovel.preco >= filters.precoMin[0] &&
        imovel.preco <= filters.precoMax[0],
    );

    // Filtro de área
    filtered = filtered.filter(
      (imovel) =>
        imovel.area >= filters.areaMin[0] && imovel.area <= filters.areaMax[0],
    );

    // Ordenação
    switch (sortBy) {
      case "preco-menor":
        filtered.sort((a, b) => a.preco - b.preco);
        break;
      case "preco-maior":
        filtered.sort((a, b) => b.preco - a.preco);
        break;
      case "area-maior":
        filtered.sort((a, b) => b.area - a.area);
        break;
      case "area-menor":
        filtered.sort((a, b) => a.area - b.area);
        break;
      default:
        // Relevancia - destaques primeiro
        filtered.sort((a, b) => {
          if (a.destaque && !b.destaque) return -1;
          if (!a.destaque && b.destaque) return 1;
          return 0;
        });
    }

    setFilteredImoveis(filtered);
  }, [searchTerm, filters, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const clearFilters = () => {
    setFilters({
      tipo: "",
      finalidade: "",
      bairro: "",
      precoMin: [0],
      precoMax: [2000000],
      quartos: "",
      banheiros: "",
      vagas: "",
      areaMin: [0],
      areaMax: [500],
    });
    setSearchTerm("");
  };

  const bairros = [...new Set(imoveis.map((imovel) => imovel.bairro))];

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
              <span className="text-amber-900 font-medium">Imóveis</span>
              <Link
                to="/sobre"
                className="text-amber-700 hover:text-amber-900 transition-colors"
              >
                Sobre
              </Link>
              <Link
                to="/contato"
                className="text-amber-700 hover:text-amber-900 transition-colors"
              >
                Contato
              </Link>
            </nav>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Phone className="w-4 h-4 mr-2" />
              Contato
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
              <Input
                placeholder="Buscar por bairro, endereço ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 border-amber-300 focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2">
              <Dialog open={showFilters} onOpenChange={setShowFilters}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Filtros Avançados</DialogTitle>
                    <DialogDescription>
                      Refine sua busca para encontrar o imóvel ideal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Tipo e Finalidade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-amber-900 mb-2 block">
                          Tipo de Imóvel
                        </label>
                        <Select
                          value={filters.tipo}
                          onValueChange={(value) =>
                            setFilters({ ...filters, tipo: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os tipos</SelectItem>
                            <SelectItem value={TipoImovel.CASA}>
                              Casa
                            </SelectItem>
                            <SelectItem value={TipoImovel.APARTAMENTO}>
                              Apartamento
                            </SelectItem>
                            <SelectItem value={TipoImovel.TERRENO}>
                              Terreno
                            </SelectItem>
                            <SelectItem value={TipoImovel.COMERCIAL}>
                              Comercial
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-amber-900 mb-2 block">
                          Finalidade
                        </label>
                        <Select
                          value={filters.finalidade}
                          onValueChange={(value) =>
                            setFilters({ ...filters, finalidade: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a finalidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value={Finalidade.VENDA}>
                              Venda
                            </SelectItem>
                            <SelectItem value={Finalidade.ALUGUEL}>
                              Aluguel
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Bairro */}
                    <div>
                      <label className="text-sm font-medium text-amber-900 mb-2 block">
                        Bairro
                      </label>
                      <Select
                        value={filters.bairro}
                        onValueChange={(value) =>
                          setFilters({ ...filters, bairro: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o bairro" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os bairros</SelectItem>
                          {bairros.map((bairro) => (
                            <SelectItem key={bairro} value={bairro}>
                              {bairro}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Faixa de Preço */}
                    <div>
                      <label className="text-sm font-medium text-amber-900 mb-4 block">
                        Faixa de Preço: {formatPrice(filters.precoMin[0])} -{" "}
                        {formatPrice(filters.precoMax[0])}
                      </label>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-amber-700 mb-1 block">
                            Preço Mínimo
                          </label>
                          <Slider
                            value={filters.precoMin}
                            onValueChange={(value) =>
                              setFilters({ ...filters, precoMin: value })
                            }
                            max={2000000}
                            step={10000}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-amber-700 mb-1 block">
                            Preço Máximo
                          </label>
                          <Slider
                            value={filters.precoMax}
                            onValueChange={(value) =>
                              setFilters({ ...filters, precoMax: value })
                            }
                            max={2000000}
                            step={10000}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Características */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-amber-900 mb-2 block">
                          Quartos
                        </label>
                        <Select
                          value={filters.quartos}
                          onValueChange={(value) =>
                            setFilters({ ...filters, quartos: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Quartos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Qualquer</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-amber-900 mb-2 block">
                          Banheiros
                        </label>
                        <Select
                          value={filters.banheiros}
                          onValueChange={(value) =>
                            setFilters({ ...filters, banheiros: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Banheiros" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Qualquer</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-amber-900 mb-2 block">
                          Vagas
                        </label>
                        <Select
                          value={filters.vagas}
                          onValueChange={(value) =>
                            setFilters({ ...filters, vagas: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Vagas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Qualquer</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Área */}
                    <div>
                      <label className="text-sm font-medium text-amber-900 mb-4 block">
                        Área: {filters.areaMin[0]}m² - {filters.areaMax[0]}m²
                      </label>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-amber-700 mb-1 block">
                            Área Mínima
                          </label>
                          <Slider
                            value={filters.areaMin}
                            onValueChange={(value) =>
                              setFilters({ ...filters, areaMin: value })
                            }
                            max={500}
                            step={10}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-amber-700 mb-1 block">
                            Área Máxima
                          </label>
                          <Slider
                            value={filters.areaMax}
                            onValueChange={(value) =>
                              setFilters({ ...filters, areaMax: value })
                            }
                            max={500}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex-1 border-amber-300 text-amber-700"
                      >
                        Limpar Filtros
                      </Button>
                      <Button
                        onClick={() => setShowFilters(false)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Aplicar Filtros
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex border border-amber-300 rounded-md">
                <Button
                  variant={viewMode === "GRID" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("GRID")}
                  className={
                    viewMode === "GRID"
                      ? "bg-amber-600 text-white"
                      : "text-amber-700"
                  }
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "LIST" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("LIST")}
                  className={
                    viewMode === "LIST"
                      ? "bg-amber-600 text-white"
                      : "text-amber-700"
                  }
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sort and Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-amber-700">
              {filteredImoveis.length} imóveis encontrados
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] border-amber-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Relevância</SelectItem>
                <SelectItem value="preco-menor">Menor preço</SelectItem>
                <SelectItem value="preco-maior">Maior preço</SelectItem>
                <SelectItem value="area-maior">Maior área</SelectItem>
                <SelectItem value="area-menor">Menor área</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Properties Grid/List */}
        <div
          className={
            viewMode === "GRID"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }
        >
          {filteredImoveis.map((imovel) => (
            <Card
              key={imovel.id}
              className={`overflow-hidden border-amber-200 shadow-md hover:shadow-lg transition-shadow group ${
                viewMode === "LIST" ? "flex flex-col md:flex-row" : ""
              }`}
            >
              <div
                className={`relative ${viewMode === "LIST" ? "md:w-1/3" : ""}`}
              >
                <img
                  src={imovel.fotos[0]}
                  alt={imovel.titulo}
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                    viewMode === "LIST"
                      ? "w-full h-48 md:h-full"
                      : "w-full h-64"
                  }`}
                />
                {imovel.destaque && (
                  <Badge className="absolute top-3 left-3 bg-amber-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/90 hover:bg-white p-2 h-8 w-8"
                  >
                    <Heart className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/90 hover:bg-white p-2 h-8 w-8"
                  >
                    <Share2 className="w-4 h-4 text-amber-600" />
                  </Button>
                </div>
              </div>
              <div className={viewMode === "LIST" ? "md:w-2/3" : ""}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800"
                    >
                      {imovel.finalidade}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-amber-700"
                    >
                      {imovel.tipo}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-amber-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {imovel.titulo}
                  </CardTitle>
                  <div className="flex items-center text-sm text-amber-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {imovel.endereco}, {imovel.bairro}
                  </div>
                  <div className="text-2xl font-bold text-amber-900">
                    {formatPrice(imovel.preco)}
                    {imovel.finalidade === Finalidade.ALUGUEL && (
                      <span className="text-sm font-normal text-amber-600">
                        /mês
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-4 mb-4 text-sm text-amber-700">
                    {imovel.quartos > 0 && (
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {imovel.quartos}
                      </div>
                    )}
                    {imovel.banheiros > 0 && (
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {imovel.banheiros}
                      </div>
                    )}
                    {imovel.vagas && imovel.vagas > 0 && (
                      <div className="flex items-center">
                        <Car className="w-4 h-4 mr-1" />
                        {imovel.vagas}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Maximize className="w-4 h-4 mr-1" />
                      {imovel.area}m²
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 mb-4 line-clamp-2">
                    {imovel.descricao}
                  </p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {imovel.caracteristicas
                      .slice(0, 3)
                      .map((caracteristica) => (
                        <Badge
                          key={caracteristica}
                          variant="secondary"
                          className="text-xs bg-amber-50 text-amber-700 border border-amber-200"
                        >
                          {caracteristica}
                        </Badge>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {filteredImoveis.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-amber-900 mb-4">
              Nenhum imóvel encontrado
            </h3>
            <p className="text-amber-700 mb-6">
              Tente ajustar os filtros ou termos de busca.
            </p>
            <Button
              onClick={clearFilters}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Limpar todos os filtros
            </Button>
          </div>
        )}

        {/* Load More Button */}
        {filteredImoveis.length > 0 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Carregar mais imóveis
            </Button>
          </div>
        )}
      </div>

      <ChatBubble />
    </div>
  );
}
