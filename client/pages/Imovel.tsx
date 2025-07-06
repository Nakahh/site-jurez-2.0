import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Ruler,
  Calendar,
  Phone,
  MessageSquare,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Play,
  Camera,
  ArrowLeft,
  Star,
  User,
  Building,
  Shield,
  Zap,
  Home,
  CheckCircle,
  Clock,
  Mail,
  WhatsappIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { useToast } from "@/hooks/use-toast";

interface ImovelDetalhes {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  finalidade: string;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  area: number;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  latitude: number;
  longitude: number;
  fotos: string[];
  caracteristicas: string[];
  amenidades: string[];
  corretor: {
    nome: string;
    foto: string;
    telefone: string;
    email: string;
    creci: string;
  };
  condominio?: {
    valor: number;
    amenidades: string[];
  };
  iptu?: number;
  anoConstucao?: number;
  status: string;
  criadoEm: Date;
  visualizacoes: number;
}

export default function ImovelPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [imovel, setImovel] = useState<ImovelDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoAtual, setFotoAtual] = useState(0);
  const [agendarVisita, setAgendarVisita] = useState(false);
  const [contatoCorretor, setContatoCorretor] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    carregarImovel();
  }, [id]);

  const carregarImovel = async () => {
    try {
      // Simular carregamento do imóvel
      const imovelSimulado: ImovelDetalhes = {
        id: id || "1",
        titulo: "Apartamento Moderno no Setor Bueno",
        descricao: `Apartamento totalmente reformado com acabamento de alto padrão. Localizado em uma das regiões mais valorizadas de Goiânia, o Setor Bueno, próximo a shoppings, escolas e hospitais.

        O imóvel conta com 3 quartos sendo 1 suíte master com closet, sala de estar e jantar integradas, cozinha planejada com ilha, área de serviço separada e varanda gourmet com churrasqueira.

        Condomínio com infraestrutura completa incluindo piscina, academia, salão de festas, brinquedoteca, quadra de tênis e segurança 24h.`,
        tipo: "APARTAMENTO",
        finalidade: "VENDA",
        preco: 650000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 89,
        endereco: "Rua T-30, 1234, Apartamento 802",
        bairro: "Setor Bueno",
        cidade: "Goiânia",
        cep: "74223-030",
        latitude: -16.6868,
        longitude: -49.2643,
        fotos: [
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1571079570759-8d8f1c5b8a6c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        ],
        caracteristicas: [
          "Reformado recentemente",
          "Móveis planejados",
          "Varanda gourmet",
          "Closet na suíte",
          "Cozinha com ilha",
          "Área de serviço separada",
          "Porcelanato",
          "Ar condicionado",
        ],
        amenidades: [
          "Piscina",
          "Academia",
          "Salão de festas",
          "Brinquedoteca",
          "Quadra de tênis",
          "Segurança 24h",
          "Portaria",
          "Elevador",
        ],
        corretor: {
          nome: "Juarez Siqueira Campos",
          foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          telefone: "(62) 9 8556-3505",
          email: "juarez@siqueicamposimoveis.com.br",
          creci: "12345-J",
        },
        condominio: {
          valor: 350,
          amenidades: [
            "Taxa de administração",
            "Limpeza",
            "Segurança",
            "Manutenção",
          ],
        },
        iptu: 180,
        anoConstucao: 2018,
        status: "DISPONIVEL",
        criadoEm: new Date(),
        visualizacoes: 145,
      };

      setImovel(imovelSimulado);
    } catch (error) {
      console.error("Erro ao carregar imóvel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do imóvel.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(preco);
  };

  const proximaFoto = () => {
    if (imovel?.fotos) {
      setFotoAtual((prev) => (prev + 1) % imovel.fotos.length);
    }
  };

  const fotoAnterior = () => {
    if (imovel?.fotos) {
      setFotoAtual(
        (prev) => (prev - 1 + imovel.fotos.length) % imovel.fotos.length,
      );
    }
  };

  const abrirWhatsApp = (mensagem: string) => {
    const numeroLimpo = imovel?.corretor.telefone.replace(/\D/g, "");
    const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  const handleAgendarVisita = (data: any) => {
    const mensagem = `Olá ${imovel?.corretor.nome}! Gostaria de agendar uma visita para o imóvel: ${imovel?.titulo} - ${imovel?.endereco}. Data preferida: ${data.data} às ${data.hora}. Meu nome é ${data.nome} e meu telefone é ${data.telefone}.`;

    // Enviar notificação para o sistema
    toast({
      title: "Solicitação de visita enviada!",
      description: "O corretor receberá sua solicitação e entrará em contato.",
    });

    abrirWhatsApp(mensagem);
    setAgendarVisita(false);
  };

  const handleContatoCorretor = (mensagem: string) => {
    const textoCompleto = `Olá ${imovel?.corretor.nome}! Tenho interesse no imóvel: ${imovel?.titulo} - ${imovel?.endereco}. ${mensagem}`;
    abrirWhatsApp(textoCompleto);
    setContatoCorretor(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando imóvel...</p>
        </div>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Imóvel não encontrado</h1>
          <Button asChild>
            <Link to="/imoveis">Voltar para Imóveis</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=300"
              alt="Siqueira Campos Imóveis"
              className="h-14 w-auto dark:hidden"
            />
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=300"
              alt="Siqueira Campos Imóveis"
              className="hidden h-14 w-auto dark:block"
            />
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Início
            </Link>
            <Link
              to="/imoveis"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Imóveis
            </Link>
            <Link
              to="/blog"
              className="text-foreground hover:text-primary transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/comparador"
              className="text-foreground hover:text-primary transition-colors"
            >
              Comparador
            </Link>
            <Link
              to="/sobre"
              className="text-foreground hover:text-primary transition-colors"
            >
              Sobre
            </Link>
            <Link
              to="/contato"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contato
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Cadastrar</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <span>/</span>
          <Link to="/imoveis" className="hover:text-primary">
            Imóveis
          </Link>
          <span>/</span>
          <span className="text-foreground">{imovel.titulo}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galeria de Fotos */}
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={imovel.fotos[fotoAtual]}
                  alt={`${imovel.titulo} - Foto ${fotoAtual + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={fotoAnterior}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={proximaFoto}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded">
                  {fotoAtual + 1} / {imovel.fotos.length}
                </div>
              </div>

              {/* Miniaturas */}
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {imovel.fotos.map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => setFotoAtual(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === fotoAtual
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={foto}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Detalhes do Imóvel */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{imovel.titulo}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {imovel.endereco}, {imovel.bairro} - {imovel.cidade}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <FavoriteButton imovelId={imovel.id} />
                    <ShareButton imovelId={imovel.id} title={imovel.titulo} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-5 w-5 text-primary" />
                    <span>{imovel.quartos} quartos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bath className="h-5 w-5 text-primary" />
                    <span>{imovel.banheiros} banheiros</span>
                  </div>
                  {imovel.vagas && (
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5 text-primary" />
                      <span>{imovel.vagas} vagas</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-5 w-5 text-primary" />
                    <span>{imovel.area} m²</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary mb-4">
                  {formatarPreco(imovel.preco)}
                  {imovel.finalidade === "ALUGUEL" && (
                    <span className="text-lg font-normal text-muted-foreground">
                      /mês
                    </span>
                  )}
                </div>

                {(imovel.condominio || imovel.iptu) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    {imovel.condominio && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Condomínio:
                        </span>
                        <span className="font-semibold ml-2">
                          {formatarPreco(imovel.condominio.valor)}
                        </span>
                      </div>
                    )}
                    {imovel.iptu && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          IPTU:
                        </span>
                        <span className="font-semibold ml-2">
                          {formatarPreco(imovel.iptu)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {imovel.descricao}
                </p>

                {/* Características */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">
                    Características
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {imovel.caracteristicas.map((caracteristica, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{caracteristica}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenidades do Condomínio */}
                {imovel.amenidades.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      Amenidades do Condomínio
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {imovel.amenidades.map((amenidade, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span>{amenidade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mapa */}
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Mapa interativo será carregado aqui
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {imovel.endereco}, {imovel.bairro} - {imovel.cidade}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">CEP:</span>
                    <span className="font-semibold ml-2">{imovel.cep}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bairro:</span>
                    <span className="font-semibold ml-2">{imovel.bairro}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card do Corretor */}
            <Card>
              <CardHeader>
                <CardTitle>Corretor Responsável</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={imovel.corretor.foto}
                    alt={imovel.corretor.nome}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{imovel.corretor.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      CRECI: {imovel.corretor.creci}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm ml-1">4.9 (127 avaliações)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setContatoCorretor(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Falar com Corretor
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setAgendarVisita(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Visita
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      abrirWhatsApp(
                        `Olá! Tenho interesse no imóvel ${imovel.titulo}`,
                      )
                    }
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {imovel.corretor.telefone}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código:</span>
                  <span className="font-semibold">#{imovel.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-semibold">{imovel.tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Finalidade:</span>
                  <span className="font-semibold">{imovel.finalidade}</span>
                </div>
                {imovel.anoConstucao && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ano:</span>
                    <span className="font-semibold">{imovel.anoConstucao}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visualizações:</span>
                  <span className="font-semibold">{imovel.visualizacoes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publicado:</span>
                  <span className="font-semibold">
                    {imovel.criadoEm.toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">
                    Disponível
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog Agendar Visita */}
      <Dialog open={agendarVisita} onOpenChange={setAgendarVisita}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Visita</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                nome: formData.get("nome"),
                telefone: formData.get("telefone"),
                email: formData.get("email"),
                data: formData.get("data"),
                hora: formData.get("hora"),
                mensagem: formData.get("mensagem"),
              };
              handleAgendarVisita(data);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input id="telefone" name="telefone" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data preferida *</Label>
                <Input id="data" name="data" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Horário *</Label>
                <Input id="hora" name="hora" type="time" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem (opcional)</Label>
              <Textarea
                id="mensagem"
                name="mensagem"
                placeholder="Alguma observação especial..."
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setAgendarVisita(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Agendar Visita
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Contato Corretor */}
      <Dialog open={contatoCorretor} onOpenChange={setContatoCorretor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Falar com o Corretor</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const mensagem = formData.get("mensagem") as string;
              handleContatoCorretor(mensagem);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="mensagem-corretor">Sua mensagem</Label>
              <Textarea
                id="mensagem-corretor"
                name="mensagem"
                placeholder="Digite sua mensagem para o corretor..."
                rows={4}
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setContatoCorretor(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar WhatsApp
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
