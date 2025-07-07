import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  imovelId: string;
  className?: string;
}

export function FavoriteButton({ imovelId, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFavorite = async () => {
    // Verificar se o usuário está logado
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para favoritar imóveis.",
        variant: "destructive",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/login")}
          >
            Fazer Login
          </Button>
        ),
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/favoritos/${imovelId}`, {
        method: isFavorited ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
        toast({
          title: isFavorited
            ? "Removido dos favoritos"
            : "Adicionado aos favoritos",
          description: isFavorited
            ? "Imóvel removido da sua lista de favoritos."
            : "Imóvel adicionado à sua lista de favoritos.",
        });
      } else {
        throw new Error("Erro ao favoritar imóvel");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível favoritar o imóvel. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className={`h-10 w-10 p-0 bg-white/90 hover:bg-white ${className}`}
      onClick={handleFavorite}
      disabled={isLoading}
    >
      <Heart
        className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
      />
    </Button>
  );
}
