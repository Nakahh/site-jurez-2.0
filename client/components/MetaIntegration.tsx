import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Instagram,
  Facebook,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  TrendingUp,
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Play,
  Pause,
  Crown,
  Zap,
} from "lucide-react";

interface MetaStats {
  instagram: {
    followers: number;
    posts: number;
    engagement: number;
    reach: number;
    impressions: number;
    profile_views: number;
    website_clicks: number;
  };
  facebook: {
    followers: number;
    posts: number;
    engagement: number;
    reach: number;
    impressions: number;
    page_views: number;
    link_clicks: number;
  };
}

interface AutoPostSettings {
  instagram: boolean;
  facebook: boolean;
  includePrice: boolean;
  includeContact: boolean;
  hashtagsEnabled: boolean;
  customHashtags: string;
  autoDescription: boolean;
}

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  active: boolean;
  price: number;
}

export function MetaIntegration({ userRole }: { userRole: string }) {
  const [metaStats, setMetaStats] = useState<MetaStats | null>(null);
  const [autoPostSettings, setAutoPostSettings] = useState<AutoPostSettings>({
    instagram: false,
    facebook: false,
    includePrice: true,
    includeContact: true,
    hashtagsEnabled: true,
    customHashtags: "#imoveis #goiania #venda #aluguel #siqueiracampos",
    autoDescription: true,
  });
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [premiumActive, setPremiumActive] = useState(false);

  const premiumFeatures: PremiumFeature[] = [
    {
      id: "meta-integration",
      name: "Integração Meta (Facebook + Instagram)",
      description: "Publicação automática e estatísticas em tempo real",
      active: premiumActive,
      price: 197.0,
    },
  ];

  useEffect(() => {
    loadMetaData();
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      // Verificar se o serviço premium está ativo
      const premiumStatus = localStorage.getItem("metaIntegrationActive");
      setPremiumActive(premiumStatus === "true");
    } catch (error) {
      console.error("Erro ao verificar status premium:", error);
    }
  };

  const loadMetaData = async () => {
    if (!premiumActive) return;

    setLoading(true);
    try {
      // Simular dados da API do Meta
      const statsSimuladas: MetaStats = {
        instagram: {
          followers: 15600,
          posts: 234,
          engagement: 8.3,
          reach: 45600,
          impressions: 125400,
          profile_views: 3400,
          website_clicks: 890,
        },
        facebook: {
          followers: 8900,
          posts: 189,
          engagement: 6.7,
          reach: 23400,
          impressions: 89200,
          page_views: 2100,
          link_clicks: 450,
        },
      };

      setMetaStats(statsSimuladas);
      setConnected(true);
    } catch (error) {
      console.error("Erro ao carregar dados Meta:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMeta = async () => {
    if (!premiumActive) {
      alert(
        "Esta funcionalidade requer o plano Premium Meta. Ative o serviço no Dashboard do Desenvolvedor.",
      );
      return;
    }

    setLoading(true);
    try {
      // Simular conexão com Meta
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnected(true);
      await loadMetaData();

      alert("Conectado com Meta Business Suite com sucesso!");
    } catch (error) {
      console.error("Erro ao conectar com Meta:", error);
      alert("Erro ao conectar com Meta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectMeta = () => {
    setConnected(false);
    setMetaStats(null);
    alert("Desconectado do Meta Business Suite.");
  };

  const updateAutoPostSettings = (
    key: keyof AutoPostSettings,
    value: boolean | string,
  ) => {
    setAutoPostSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // Simular salvamento das configurações
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem(
        "metaAutoPostSettings",
        JSON.stringify(autoPostSettings),
      );
      alert("Configurações salvas com sucesso!");
      setShowSettings(false);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

  const simulateAutoPost = async (propertyData: any) => {
    if (!connected || !premiumActive) return;

    try {
      const postContent = generatePostContent(propertyData);

      if (autoPostSettings.instagram) {
        await postToInstagram(postContent, propertyData.images[0]);
      }

      if (autoPostSettings.facebook) {
        await postToFacebook(postContent, propertyData.images[0]);
      }

      return { success: true, message: "Posts criados automaticamente!" };
    } catch (error) {
      console.error("Erro ao criar posts automáticos:", error);
      return { success: false, message: "Erro ao criar posts." };
    }
  };

  const generatePostContent = (property: any) => {
    let content = "";

    if (autoPostSettings.autoDescription) {
      content = `🏠 ${property.titulo}\n\n`;
      content += `📍 ${property.endereco}, ${property.bairro}\n`;
      content += `🛏️ ${property.quartos} quartos | 🚿 ${property.banheiros} banheiros\n`;

      if (autoPostSettings.includePrice) {
        content += `💰 ${property.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}\n\n`;
      }

      if (autoPostSettings.includeContact) {
        content += `📞 Entre em contato conosco!\n`;
        content += `📱 WhatsApp: (62) 9 8556-3505\n\n`;
      }

      if (autoPostSettings.hashtagsEnabled) {
        content += autoPostSettings.customHashtags;
      }
    }

    return content;
  };

  const postToInstagram = async (content: string, image: string) => {
    // Simular chamada para API do Instagram via n8n
    console.log("Posting to Instagram:", { content, image });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { id: "ig_" + Date.now(), success: true };
  };

  const postToFacebook = async (content: string, image: string) => {
    // Simular chamada para API do Facebook via n8n
    console.log("Posting to Facebook:", { content, image });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { id: "fb_" + Date.now(), success: true };
  };

  if (!premiumActive) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-8 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-bold mb-2">Integração Meta Premium</h3>
          <p className="text-muted-foreground mb-4">
            Conecte-se ao Facebook e Instagram para publicação automática e
            estatísticas em tempo real.
          </p>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white mb-4">
            R$ 197,00/mês
          </Badge>
          <p className="text-sm text-muted-foreground">
            Ative este serviço no Dashboard do Desenvolvedor para começar a
            usar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Instagram className="w-6 h-6 text-pink-600" />
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <span>Integração Meta Business</span>
            </div>
            <Badge
              variant={connected ? "default" : "secondary"}
              className={connected ? "bg-green-600" : ""}
            >
              {connected ? "CONECTADO" : "DESCONECTADO"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {connected
                  ? "Conectado ao Meta Business Suite. Dados sincronizados em tempo real."
                  : "Conecte sua conta Meta Business para ativar a publicação automática."}
              </p>
              {connected && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Instagram: Ativo</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Facebook: Ativo</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {connected ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectMeta}
                  >
                    Desconectar
                  </Button>
                </>
              ) : (
                <Button onClick={handleConnectMeta} disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Conectar Meta Business
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {connected && metaStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instagram Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Instagram className="w-5 h-5 mr-2 text-pink-600" />
                Instagram Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metaStats.instagram.followers.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metaStats.instagram.engagement}%
                  </p>
                  <p className="text-sm text-muted-foreground">Engajamento</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metaStats.instagram.reach.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Alcance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metaStats.instagram.website_clicks}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliques no Site
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facebook Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                Facebook Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metaStats.facebook.followers.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metaStats.facebook.engagement}%
                  </p>
                  <p className="text-sm text-muted-foreground">Engajamento</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metaStats.facebook.reach.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Alcance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {metaStats.facebook.link_clicks}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cliques em Links
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configurações de Auto-Post */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações de Publicação Automática</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-instagram">Instagram</Label>
                <Switch
                  id="auto-instagram"
                  checked={autoPostSettings.instagram}
                  onCheckedChange={(checked) =>
                    updateAutoPostSettings("instagram", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-facebook">Facebook</Label>
                <Switch
                  id="auto-facebook"
                  checked={autoPostSettings.facebook}
                  onCheckedChange={(checked) =>
                    updateAutoPostSettings("facebook", checked)
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-price">Incluir preço no post</Label>
                <Switch
                  id="include-price"
                  checked={autoPostSettings.includePrice}
                  onCheckedChange={(checked) =>
                    updateAutoPostSettings("includePrice", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="include-contact">Incluir contato</Label>
                <Switch
                  id="include-contact"
                  checked={autoPostSettings.includeContact}
                  onCheckedChange={(checked) =>
                    updateAutoPostSettings("includeContact", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hashtags-enabled">Hashtags automáticas</Label>
                <Switch
                  id="hashtags-enabled"
                  checked={autoPostSettings.hashtagsEnabled}
                  onCheckedChange={(checked) =>
                    updateAutoPostSettings("hashtagsEnabled", checked)
                  }
                />
              </div>
            </div>

            {autoPostSettings.hashtagsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="custom-hashtags">Hashtags personalizadas</Label>
                <Input
                  id="custom-hashtags"
                  value={autoPostSettings.customHashtags}
                  onChange={(e) =>
                    updateAutoPostSettings("customHashtags", e.target.value)
                  }
                  placeholder="#imoveis #goiania #venda"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancelar
              </Button>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Função para ser usada quando um imóvel é criado
export const createAutoPost = async (propertyData: any) => {
  const settings = JSON.parse(
    localStorage.getItem("metaAutoPostSettings") || "{}",
  );
  const premiumActive =
    localStorage.getItem("metaIntegrationActive") === "true";

  if (!premiumActive || (!settings.instagram && !settings.facebook)) {
    return { success: false, message: "Auto-post não configurado" };
  }

  try {
    // Simular criação de posts
    const results = [];

    if (settings.instagram) {
      results.push({
        platform: "Instagram",
        success: true,
        id: "ig_" + Date.now(),
      });
    }

    if (settings.facebook) {
      results.push({
        platform: "Facebook",
        success: true,
        id: "fb_" + Date.now(),
      });
    }

    return {
      success: true,
      message: `Posts criados automaticamente: ${results.map((r) => r.platform).join(", ")}`,
      results,
    };
  } catch (error) {
    return { success: false, message: "Erro ao criar posts automáticos" };
  }
};
