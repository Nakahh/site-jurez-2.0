import { useEffect, useRef } from "react";
import { MapPin, Navigation, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  address: string;
  title: string;
  zoom?: number;
  height?: string;
}

export function GoogleMap({
  latitude,
  longitude,
  address,
  title,
  zoom = 15,
  height = "400px",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    initializeMap();
  }, [latitude, longitude]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    // Verificar se o Google Maps está disponível
    if (typeof window !== "undefined" && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      });

      // Adicionar marcador
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: title,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#8B4513"/>
              <circle cx="16" cy="12" r="6" fill="white"/>
              <circle cx="16" cy="12" r="3" fill="#8B4513"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      // InfoWindow com informações do imóvel
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${title}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      mapInstanceRef.current = map;

      // Mostrar InfoWindow inicialmente
      infoWindow.open(map, marker);
    } else {
      // Fallback se Google Maps não estiver disponível
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border-radius: 8px;">
            <div style="text-align: center; padding: 20px;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8B4513" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <h3 style="margin: 10px 0 5px 0; font-size: 16px; font-weight: bold; color: #333;">${title}</h3>
              <p style="margin: 0; font-size: 14px; color: #666;">${address}</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Mapa será carregado em breve</p>
            </div>
          </div>
        `;
      }
    }
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: userLat, longitude: userLng } = position.coords;
          const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${latitude},${longitude}`;
          window.open(url, "_blank");
        },
        () => {
          // Fallback se não conseguir localização
          const url = `https://www.google.com/maps/dir//${latitude},${longitude}`;
          window.open(url, "_blank");
        },
      );
    } else {
      // Fallback se geolocalização não for suportada
      const url = `https://www.google.com/maps/dir//${latitude},${longitude}`;
      window.open(url, "_blank");
    }
  };

  const expandMap = () => {
    openInGoogleMaps();
  };

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="rounded-lg overflow-hidden shadow-md"
      />

      {/* Controles personalizados */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 hover:bg-white shadow-md"
          onClick={getDirections}
          title="Obter direções"
        >
          <Navigation className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 hover:bg-white shadow-md"
          onClick={expandMap}
          title="Abrir no Google Maps"
        >
          <Expand className="h-4 w-4" />
        </Button>
      </div>

      {/* Informações sobre o local */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md max-w-xs">
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para carregar Google Maps API
export function useGoogleMaps(apiKey?: string) {
  useEffect(() => {
    // Verificar se já está carregado
    if (window.google) return;

    // Criar script para carregar Google Maps
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey || "YOUR_API_KEY"}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google Maps carregado com sucesso");
    };

    script.onerror = () => {
      console.error("Erro ao carregar Google Maps");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup se necessário
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]',
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [apiKey]);
}

// Componente wrapper que carrega a API automaticamente
export function GoogleMapWithLoader(props: GoogleMapProps) {
  useGoogleMaps(); // Carregar API automaticamente

  return <GoogleMap {...props} />;
}

// Extensões do tipo Window para TypeScript
declare global {
  interface Window {
    google: any;
  }
}
