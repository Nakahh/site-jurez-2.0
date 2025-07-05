import React, { memo, useState, useCallback } from "react";
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OptimizedImage from "./OptimizedImage";
import { useIntersectionObserver } from "@/hooks/usePerformance";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  type: string;
  featured?: boolean;
}

interface OptimizedPropertyCardProps {
  property: Property;
  onFavorite?: (propertyId: string) => void;
  onView?: (propertyId: string) => void;
  isFavorited?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  index?: number;
}

const OptimizedPropertyCard = memo(
  ({
    property,
    onFavorite,
    onView,
    isFavorited = false,
    loading = false,
    style,
    index,
  }: OptimizedPropertyCardProps) => {
    const [imageIndex, setImageIndex] = useState(0);
    const { targetRef, isIntersecting } = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: "50px",
    });

    const handleFavorite = useCallback(() => {
      onFavorite?.(property.id);
    }, [onFavorite, property.id]);

    const handleView = useCallback(() => {
      onView?.(property.id);
    }, [onView, property.id]);

    const nextImage = useCallback(() => {
      setImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1,
      );
    }, [property.images.length]);

    const prevImage = useCallback(() => {
      setImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1,
      );
    }, [property.images.length]);

    const formatPrice = useCallback((price: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }, []);

    if (loading) {
      return (
        <Card
          className="h-96 animate-pulse bg-gray-200"
          style={style}
          ref={targetRef}
        >
          <CardContent className="p-0">
            <div className="h-48 bg-gray-300 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
              <div className="h-4 bg-gray-300 rounded w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        className={cn(
          "group overflow-hidden hover:shadow-lg transition-all duration-300 h-96",
          "transform hover:-translate-y-1",
          property.featured && "ring-2 ring-yellow-400",
        )}
        style={style}
        ref={targetRef}
      >
        <CardContent className="p-0">
          {/* Image Section with Carousel */}
          <div className="relative h-48 overflow-hidden">
            {isIntersecting && (
              <>
                <OptimizedImage
                  src={property.images[imageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index !== undefined && index < 3}
                />

                {/* Image Navigation */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Imagem anterior"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Próxima imagem"
                    >
                      →
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                      {property.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            i === imageIndex ? "bg-white" : "bg-white/50",
                          )}
                          aria-label={`Ir para imagem ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {property.featured && (
                    <Badge className="bg-yellow-500 text-yellow-900">
                      Destaque
                    </Badge>
                  )}
                  <Badge variant="secondary">{property.type}</Badge>
                </div>

                {/* Favorite Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "absolute top-2 right-2 bg-black/20 hover:bg-black/40",
                    "backdrop-blur-sm",
                    isFavorited && "text-red-500",
                  )}
                  onClick={handleFavorite}
                  aria-label={
                    isFavorited
                      ? "Remover dos favoritos"
                      : "Adicionar aos favoritos"
                  }
                >
                  <Heart
                    className={cn("h-4 w-4", isFavorited && "fill-current")}
                  />
                </Button>
              </>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Price */}
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(property.price)}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>

            {/* Features */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  <span>{property.area}m²</span>
                </div>
              </div>
            </div>

            {/* View Button */}
            <Button
              onClick={handleView}
              className="w-full mt-3"
              size="sm"
              aria-label={`Ver detalhes de ${property.title}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  },
);

OptimizedPropertyCard.displayName = "OptimizedPropertyCard";

export default OptimizedPropertyCard;
