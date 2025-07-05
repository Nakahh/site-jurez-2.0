import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Loader2,
  TrendingUp,
  Filter,
  X,
  Home,
  Building,
  TreePine,
  Store,
} from "lucide-react";
import { TipoImovel, Finalidade } from "@shared/types";

interface SearchFilters {
  bairro: string;
  tipo: string;
  finalidade: string;
  quartos: string;
  precoMin: string;
  precoMax: string;
}

interface CEPData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

interface NeighborhoodSuggestion {
  name: string;
  count: number;
  avgPrice: number;
}

const neighborhoodSuggestions: NeighborhoodSuggestion[] = [
  { name: "Jardim Goiás", count: 45, avgPrice: 450000 },
  { name: "Setor Oeste", count: 32, avgPrice: 380000 },
  { name: "Aldeota", count: 28, avgPrice: 320000 },
  { name: "Alto da Glória", count: 18, avgPrice: 650000 },
  { name: "Setor Bueno", count: 25, avgPrice: 420000 },
];

export function EnhancedSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    bairro: "",
    tipo: "",
    finalidade: "",
    quartos: "",
    precoMin: "",
    precoMax: "",
  });

  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    NeighborhoodSuggestion[]
  >([]);
  const [cepData, setCepData] = useState<CEPData | null>(null);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filters.bairro) {
      const filtered = neighborhoodSuggestions.filter((suggestion) =>
        suggestion.name.toLowerCase().includes(filters.bairro.toLowerCase()),
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && filters.bairro.length > 1);
    } else {
      setShowSuggestions(false);
    }
  }, [filters.bairro]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchByCEP = async (cep: string) => {
    if (cep.length === 8 || (cep.length === 9 && cep.includes("-"))) {
      setIsLoadingCEP(true);
      try {
        const cleanCEP = cep.replace(/\D/g, "");
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCEP}/json/`,
        );
        const data = await response.json();

        if (!data.erro) {
          setCepData(data);
          setFilters((prev) => ({ ...prev, bairro: data.bairro }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    // Simular busca
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSearching(false);

    // Aqui integraria com a API real de busca
    console.log("Buscando com filtros:", filters);
  };

  const clearFilters = () => {
    setFilters({
      bairro: "",
      tipo: "",
      finalidade: "",
      quartos: "",
      precoMin: "",
      precoMax: "",
    });
    setCepData(null);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CASA":
        return <Home className="w-4 h-4" />;
      case "APARTAMENTO":
        return <Building className="w-4 h-4" />;
      case "TERRENO":
        return <TreePine className="w-4 h-4" />;
      case "COMERCIAL":
        return <Store className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl animate-slide-up relative">
      <div className="space-y-4">
        {/* Search Input with Suggestions */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
            <Input
              placeholder="Buscar por bairro, CEP ou região..."
              value={filters.bairro}
              onChange={(e) => {
                setFilters({ ...filters, bairro: e.target.value });
                // Auto-detectar CEP
                const value = e.target.value.replace(/\D/g, "");
                if (value.length === 8) {
                  searchByCEP(value);
                }
              }}
              className="pl-10 pr-10 h-12 border-0 bg-muted/50 text-lg font-medium"
            />
            {isLoadingCEP && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5 animate-spin" />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-50 border border-amber-200 shadow-lg">
              <div className="p-2 space-y-1">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.name}
                    onClick={() => {
                      setFilters({ ...filters, bairro: suggestion.name });
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-900">
                        {suggestion.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800"
                      >
                        {suggestion.count} imóveis
                      </Badge>
                      <span className="text-sm text-amber-600">
                        Média: {formatPrice(suggestion.avgPrice)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* CEP Info */}
        {cepData && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Localizado em: {cepData.bairro}, {cepData.localidade} -{" "}
              {cepData.uf}
            </span>
          </div>
        )}

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select
            value={filters.tipo}
            onValueChange={(value) => setFilters({ ...filters, tipo: value })}
          >
            <SelectTrigger className="h-12 border-0 bg-muted/50">
              <div className="flex items-center space-x-2">
                {getTypeIcon(filters.tipo)}
                <SelectValue placeholder="Tipo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value={TipoImovel.CASA}>
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Casa</span>
                </div>
              </SelectItem>
              <SelectItem value={TipoImovel.APARTAMENTO}>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Apartamento</span>
                </div>
              </SelectItem>
              <SelectItem value={TipoImovel.TERRENO}>
                <div className="flex items-center space-x-2">
                  <TreePine className="w-4 h-4" />
                  <span>Terreno</span>
                </div>
              </SelectItem>
              <SelectItem value={TipoImovel.COMERCIAL}>
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4" />
                  <span>Comercial</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.finalidade}
            onValueChange={(value) =>
              setFilters({ ...filters, finalidade: value })
            }
          >
            <SelectTrigger className="h-12 border-0 bg-muted/50">
              <SelectValue placeholder="Finalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value={Finalidade.VENDA}>Venda</SelectItem>
              <SelectItem value={Finalidade.ALUGUEL}>Aluguel</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.quartos}
            onValueChange={(value) =>
              setFilters({ ...filters, quartos: value })
            }
          >
            <SelectTrigger className="h-12 border-0 bg-muted/50">
              <SelectValue placeholder="Quartos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Qualquer</SelectItem>
              <SelectItem value="1">1+ quarto</SelectItem>
              <SelectItem value="2">2+ quartos</SelectItem>
              <SelectItem value="3">3+ quartos</SelectItem>
              <SelectItem value="4">4+ quartos</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Preço mín"
              value={filters.precoMin}
              onChange={(e) =>
                setFilters({ ...filters, precoMin: e.target.value })
              }
              className="h-12 border-0 bg-muted/50"
            />
            <Input
              placeholder="Preço máx"
              value={filters.precoMax}
              onChange={(e) =>
                setFilters({ ...filters, precoMax: e.target.value })
              }
              className="h-12 border-0 bg-muted/50"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="h-12 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                  onClick={() => setFilters({ ...filters, [key]: "" })}
                >
                  {key}: {value}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              );
            })}
          </div>
        )}

        {/* Quick Suggestions */}
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700 font-medium">
            Buscar por:
          </span>
          <div className="flex flex-wrap gap-2">
            {["Jardim Goiás", "Setor Oeste", "Aldeota"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setFilters({ ...filters, bairro: suggestion })}
                className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
