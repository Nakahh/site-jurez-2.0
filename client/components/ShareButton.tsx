import { useState } from "react";
import {
  Share2,
  Copy,
  MessageCircle,
  Facebook,
  Twitter,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  imovelId: string;
  title: string;
  className?: string;
}

export function ShareButton({ imovelId, title, className }: ShareButtonProps) {
  const { toast } = useToast();
  const url = `${window.location.origin}/imovel/${imovelId}`;
  const shareText = `Confira este imóvel: ${title}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description:
          "O link do imóvel foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const shareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, "_blank");
  };

  const shareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: url,
        });
      } catch (error) {
        console.log("Compartilhamento cancelado");
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className={`h-10 w-10 p-0 bg-white/90 hover:bg-white ${className}`}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copiar link</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={shareWhatsApp}>
          <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
          <span>WhatsApp</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareFacebook}>
          <Facebook className="mr-2 h-4 w-4 text-blue-600" />
          <span>Facebook</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareTwitter}>
          <Twitter className="mr-2 h-4 w-4 text-blue-400" />
          <span>Twitter</span>
        </DropdownMenuItem>

        {navigator.share && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={shareNative}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Compartilhar...</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
