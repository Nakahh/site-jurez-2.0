import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
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
  Star,
  Zap,
  CheckCircle,
  Camera,
  TrendingUp,
  Clock,
} from "lucide-react";
import { TipoImovel, Finalidade, StatusImovel } from "@shared/types";

interface Property {
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
  caracteristicas: string[];
  precoM2: number;
  recemAdicionado?: boolean;
  valorizado?: boolean;
}

interface EnhancedPropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  onShare?: (property: Property) => void;
  onScheduleVisit?: (id: string) => void;
  isFavorite?: boolean;
  showComparison?: boolean;
  onCompare?: (id: string) => void;
}

export function EnhancedPropertyCard({
  property,
  onFavorite,
  onShare,
  onScheduleVisit,
  isFavorite = false,
  showComparison = false,
  onCompare,
}: EnhancedPropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showQuickView, setShowQuickView] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPricePerM2 = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property.titulo,
        text: `Confira este ${property.tipo.toLowerCase()} em ${property.bairro}!`,
        url: `/imovel/${property.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/imovel/${property.id}`,
      );
      // Show toast notification
    }
  };

  const getStatusBadge = () => {
    switch (property.status) {
      case StatusImovel.DISPONIVEL:
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disponível
          </Badge>
        );
      case StatusImovel.RESERVADO:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Reservado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="group overflow-hidden border-amber-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
      {/* Image Gallery */}
      <div className="relative overflow-hidden">
        <div
          className="relative h-64 bg-gray-100 cursor-pointer"
          onClick={() =>
            setCurrentImageIndex((prev) =>
              prev === property.fotos.length - 1 ? 0 : prev + 1,
            )
          }
        >
          <img
            src={property.fotos[currentImageIndex]}
            alt={property.titulo}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsImageLoading(false)}
          />

          {/* Loading Skeleton */}
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Image Counter */}
          {property.fotos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
              <Camera className="w-3 h-3 inline mr-1" />
              {currentImageIndex + 1}/{property.fotos.length}
            </div>
          )}

          {/* Image Dots Indicator */}
          {property.fotos.length > 1 && (
            <div className="absolute bottom-3 left-3 flex space-x-1">
              {property.fotos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Badges and Quick Actions */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {property.destaque && (
            <Badge className="bg-amber-600 text-white shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Destaque
            </Badge>
          )}
          {property.recemAdicionado && (
            <Badge className="bg-blue-600 text-white shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              Novo
            </Badge>
          )}
          {property.valorizado && (
            <Badge className="bg-green-600 text-white shadow-lg">
              <TrendingUp className="w-3 h-3 mr-1" />
              Valorizado
            </Badge>
          )}
          {getStatusBadge()}
        </div>

        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    onFavorite?.(property.id);
                  }}
                  className="bg-white/90 hover:bg-white p-2 h-8 w-8 backdrop-blur-sm"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFavorite
                        ? "text-red-500 fill-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isFavorite
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    shareProperty();
                  }}
                  className="bg-white/90 hover:bg-white p-2 h-8 w-8 backdrop-blur-sm"
                >
                  <Share2 className="w-4 h-4 text-amber-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartilhar imóvel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {showComparison && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      onCompare?.(property.id);
                    }}
                    className="bg-white/90 hover:bg-white p-2 h-8 w-8 backdrop-blur-sm"
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-[1px]">
                      <div className="bg-amber-600 rounded-[1px]"></div>
                      <div className="bg-amber-600 rounded-[1px]"></div>
                      <div className="bg-amber-600 rounded-[1px]"></div>
                      <div className="bg-amber-600 rounded-[1px]"></div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comparar imóvel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Content */}
      <CardHeader className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {property.finalidade}
          </Badge>
          <Badge variant="outline" className="border-amber-300 text-amber-700">
            {property.tipo}
          </Badge>
        </div>

        <CardTitle className="text-lg text-amber-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-tight">
          {property.titulo}
        </CardTitle>

        <div className="flex items-center text-sm text-amber-600 mt-1">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {property.endereco}, {property.bairro}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-900">
            {formatPrice(property.preco)}
            {property.finalidade === Finalidade.ALUGUEL && (
              <span className="text-sm font-normal text-amber-600">/mês</span>
            )}
          </div>
          <div className="text-sm text-amber-600">
            {formatPricePerM2(property.precoM2)}/m²
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {/* Property Features */}
        <div className="flex items-center gap-4 mb-4 text-sm text-amber-700">
          {property.quartos > 0 && (
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span className="font-medium">{property.quartos}</span>
            </div>
          )}
          {property.banheiros > 0 && (
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span className="font-medium">{property.banheiros}</span>
            </div>
          )}
          {property.vagas && property.vagas > 0 && (
            <div className="flex items-center">
              <Car className="w-4 h-4 mr-1" />
              <span className="font-medium">{property.vagas}</span>
            </div>
          )}
          <div className="flex items-center">
            <Maximize className="w-4 h-4 mr-1" />
            <span className="font-medium">{property.area}m²</span>
          </div>
        </div>

        {/* Key Features */}
        <div className="flex gap-1 flex-wrap mb-4">
          {property.caracteristicas.slice(0, 3).map((caracteristica) => (
            <Badge
              key={caracteristica}
              variant="secondary"
              className="text-xs bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              {caracteristica}
            </Badge>
          ))}
          {property.caracteristicas.length > 3 && (
            <Badge
              variant="secondary"
              className="text-xs bg-gray-50 text-gray-600 border"
            >
              +{property.caracteristicas.length - 3}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Link to={`/imovel/${property.id}`} className="block">
            <Button
              size="sm"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white transition-all hover:shadow-md"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onScheduleVisit?.(property.id)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Agendar visita</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ligar para corretor</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Quick View Dialog */}
        <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="w-full mt-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
              onClick={() => setShowQuickView(true)}
            >
              Visualização rápida
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{property.titulo}</DialogTitle>
              <DialogDescription>
                {property.endereco}, {property.bairro}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img
                  src={property.fotos[0]}
                  alt={property.titulo}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-amber-900">
                    {formatPrice(property.preco)}
                  </div>
                  <div className="text-sm text-amber-600">
                    {formatPricePerM2(property.precoM2)}/m²
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-amber-700">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    {property.quartos}
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {property.banheiros}
                  </div>
                  <div className="flex items-center">
                    <Maximize className="w-4 h-4 mr-1" />
                    {property.area}m²
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/imovel/${property.id}`} className="flex-1">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                      Ver Completo
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => onScheduleVisit?.(property.id)}
                    className="border-amber-300 text-amber-700"
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
