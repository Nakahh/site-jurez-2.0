import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Car,
  Heart,
  Share2,
  Calendar,
  Phone,
  MessageCircle,
  Home,
  Building,
  DollarSign,
  Filter,
  Star,
  CheckCircle,
  BookOpen,
  BarChart3,
  HelpCircle,
  Scale,
  Menu,
  X,
  Eye,
} from "lucide-react";
import { Imovel, TipoImovel, Finalidade } from "@shared/types";
import { ChatBubble } from "@/components/ChatBubble";
import { EnhancedSearch } from "@/components/EnhancedSearch";
import { PropertyCardSkeleton } from "@/components/LoadingSkeleton";
import { NotificationSystem } from "@/components/NotificationSystem";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  NotificationBell,
  UserSwitcher,
} from "@/components/NotificationSystem";
import { FAQ } from "@/components/FAQ";
import { ChatSystem, ScheduleVisitSystem } from "@/components/ChatSystem";

export default function Index() {
  const [imoveisDestaque, setImoveisDestaque] = useState<Imovel[]>([]);
  const [filtros, setFiltros] = useState({
    tipo: "",
    finalidade: "",
    preco: "",
    quartos: "",
    bairro: "",
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    carregarImoveisDestaque();

    // Add event listeners for custom events
    const handleScheduleVisit = (e: CustomEvent) => {
      const { propertyId, propertyTitle } = e.detail;
      // You could trigger a modal or other action here
      console.log("Schedule visit for:", propertyTitle);
    };

    const handleOpenChat = (e: CustomEvent) => {
      const { propertyId, propertyTitle } = e.detail;
      // You could trigger a modal or other action here
      console.log("Open chat for:", propertyTitle);
    };

    window.addEventListener(
      "scheduleVisit",
      handleScheduleVisit as EventListener,
    );
    window.addEventListener("openChat", handleOpenChat as EventListener);

    return () => {
      window.removeEventListener(
        "scheduleVisit",
        handleScheduleVisit as EventListener,
      );
      window.removeEventListener("openChat", handleOpenChat as EventListener);
    };
  }, []);

  const carregarImoveisDestaque = async () => {
    try {
      const response = await fetch("/api/imoveis/destaque");
      if (response.ok) {
        const data = await response.json();
        setImoveisDestaque(data);
      }
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
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

  // Dados de exemplo para demonstração
  const imoveisExemplo = [
    {
      id: "1",
      titulo: "Apartamento Moderno no Setor Bueno",
      bairro: "Setor Bueno",
      cidade: "Goiânia",
      preco: 650000,
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      finalidade: Finalidade.VENDA,
      fotos: [
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: "2",
      titulo: "Casa Térrea no Jardim Goiás",
      bairro: "Jardim Goiás",
      cidade: "Goiânia",
      preco: 450000,
      quartos: 4,
      banheiros: 3,
      vagas: 3,
      finalidade: Finalidade.VENDA,
      fotos: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: "3",
      titulo: "Apartamento para Aluguel no Setor Oeste",
      bairro: "Setor Oeste",
      cidade: "Goiânia",
      preco: 2500,
      quartos: 2,
      banheiros: 2,
      vagas: 1,
      finalidade: Finalidade.ALUGUEL,
      fotos: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      ],
    },
  ];

  const imoveisParaExibir =
    imoveisDestaque.length > 0 ? imoveisDestaque : imoveisExemplo;

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
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Início
            </Link>
            <Link
              to="/imoveis"
              className="text-foreground hover:text-primary transition-colors"
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
              to="/simulador"
              className="text-foreground hover:text-primary transition-colors"
            >
              Simulador
            </Link>
            <Link
              to="/contato"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contato
            </Link>
            <Link
              to="/sobre"
              className="text-foreground hover:text-primary transition-colors"
            >
              Sobre
            </Link>
          </nav>

          <div className="flex items-center space-x-1">
            <UserSwitcher />
            <NotificationBell />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const userRole =
                  localStorage.getItem("currentUserRole") || "ADMIN";
                const dashboardMap: Record<string, string> = {
                  ADMIN: "/dashboard/admin",
                  CORRETOR: "/dashboard/corretor",
                  ASSISTENTE: "/dashboard/assistente",
                  MARKETING: "/dashboard/marketing",
                  DESENVOLVEDOR: "/dashboard/desenvolvedor",
                  CLIENTE: "/dashboard/cliente",
                };
                window.location.href =
                  dashboardMap[userRole] || "/dashboard/admin";
              }}
              className="text-xs h-8 px-2"
            >
              📊
            </Button>
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card/95 backdrop-blur-sm">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link
                to="/"
                className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/imoveis"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Imóveis
              </Link>
              <Link
                to="/blog"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/comparador"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comparador
              </Link>
              <Link
                to="/simulador"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Simulador
              </Link>
              <Link
                to="/contato"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contato
              </Link>
              <Link
                to="/sobre"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </Link>
              <div className="pt-4 border-t border-border/50 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Cadastrar
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
        <div className="relative text-center text-white space-y-8 max-w-5xl px-4 z-10">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight animate-fade-in">
            Encontre seu próximo lar
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Na Siqueira Campos Imóveis, realizamos o sonho da casa própria em
            Goiânia com excelência e confiança
          </p>

          {/* Enhanced Search */}
          <EnhancedSearch />
        </div>
      </section>

      {/* Imóveis em Destaque */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Imóveis em Destaque
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Conheça nossa seleção especial de imóveis com as melhores
              localizações e preços de Goiânia
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground text-lg">
                Carregando imóveis...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {imoveisParaExibir.map((imovel, index) => (
                <Card
                  key={imovel.id}
                  className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-card/80 backdrop-blur-sm"
                >
                  <div className="relative">
                    <img
                      src={
                        imovel.fotos?.[0] ||
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                      }
                      alt={imovel.titulo}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <FavoriteButton imovelId={imovel.id} />
                      <ShareButton imovelId={imovel.id} title={imovel.titulo} />
                    </div>
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-semibold">
                      {imovel.finalidade === Finalidade.VENDA
                        ? "Venda"
                        : "Aluguel"}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {imovel.titulo}
                      </h3>
                      <p className="text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        {imovel.bairro}, {imovel.cidade}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 mb-6 text-sm font-medium">
                      <div className="flex items-center text-muted-foreground">
                        <Bed className="h-5 w-5 mr-2 text-primary" />
                        {imovel.quartos} quartos
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Bath className="h-5 w-5 mr-2 text-primary" />
                        {imovel.banheiros} banheiros
                      </div>
                      {imovel.vagas && (
                        <div className="flex items-center text-muted-foreground">
                          <Car className="h-5 w-5 mr-2 text-primary" />
                          {imovel.vagas} vagas
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-primary">
                        {formatarPreco(Number(imovel.preco))}
                        {imovel.finalidade === Finalidade.ALUGUEL && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /mês
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {/* Botão principal */}
                        <Button
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90 font-medium"
                          asChild
                        >
                          <Link to={`/imovel/${imovel.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Link>
                        </Button>

                        {/* Botões de ação em linha */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 flex items-center justify-center"
                            onClick={() => {
                              // Trigger schedule visit dialog
                              const event = new CustomEvent("scheduleVisit", {
                                detail: {
                                  propertyId: imovel.id,
                                  propertyTitle: imovel.titulo,
                                },
                              });
                              window.dispatchEvent(event);
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Visita
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 flex items-center justify-center"
                            onClick={() => {
                              // Trigger chat dialog
                              const event = new CustomEvent("openChat", {
                                detail: {
                                  propertyId: imovel.id,
                                  propertyTitle: imovel.titulo,
                                },
                              });
                              window.dispatchEvent(event);
                            }}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                        </div>

                        {/* Botão de compartilhar */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs h-8 flex items-center justify-center"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: imovel.titulo,
                                text: `Confira este imóvel: ${imovel.titulo}`,
                                url: `${window.location.origin}/imovel/${imovel.id}`,
                              });
                            } else {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/imovel/${imovel.id}`,
                              );
                              alert(
                                "Link copiado para a área de transferência!",
                              );
                            }
                          }}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Button size="lg" className="px-8 py-4 text-lg" asChild>
              <Link to="/imoveis">Ver todos os imóveis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nossa Experiência em Números
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Mais de 15 anos conectando pessoas aos seus lares dos sonhos
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-3 group-hover:scale-110 transition-transform">
                500+
              </div>
              <div className="text-lg text-primary-foreground/80">
                Imóveis disponíveis
              </div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-3 group-hover:scale-110 transition-transform">
                1000+
              </div>
              <div className="text-lg text-primary-foreground/80">
                Clientes satisfeitos
              </div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-3 group-hover:scale-110 transition-transform">
                15+
              </div>
              <div className="text-lg text-primary-foreground/80">
                Anos de experiência
              </div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-3 group-hover:scale-110 transition-transform">
                50+
              </div>
              <div className="text-lg text-primary-foreground/80">
                Bairros atendidos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Nossos Serviços
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Oferecemos uma experiência completa para compra, venda e aluguel
              de imóveis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 bg-card/50">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Compra e Venda</h3>
              <p className="text-muted-foreground mb-4">
                Assessoria completa para compra e venda de imóveis com toda
                segurança jurídica e transparência.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/imoveis">Ver Imóveis</Link>
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 bg-card/50">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Locação</h3>
              <p className="text-muted-foreground mb-4">
                Gestão completa de loca��ão com contratos seguros e
                acompanhamento personalizado.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/imoveis">Ver Aluguéis</Link>
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 bg-card/50">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Financiamento</h3>
              <p className="text-muted-foreground mb-4">
                Parcerias com os principais bancos para as melhores condições de
                financiamento.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/simulador">Simular</Link>
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow border-0 bg-card/50">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Comparador</h3>
              <p className="text-muted-foreground mb-4">
                Compare diferentes imóveis lado a lado para tomar a melhor
                decisão de compra.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/comparador">Comparar</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Depoimentos reais de quem confiou na Siqueira Campos para realizar
              seus sonhos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 border-0 bg-card/80">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "Atendimento excepcional! A equipe me ajudou a encontrar a casa
                perfeita para minha família. Profissionalismo e dedicação do
                início ao fim."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold">MR</span>
                </div>
                <div>
                  <div className="font-semibold">Maria Regina</div>
                  <div className="text-sm text-muted-foreground">
                    Cliente - Compra
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 bg-card/80">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "Vendi meu apartamento rapidamente e pelo preço justo. A equipe
                é muito competente e sempre disponível para esclarecer dúvidas."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold">CS</span>
                </div>
                <div>
                  <div className="font-semibold">Carlos Silva</div>
                  <div className="text-sm text-muted-foreground">
                    Cliente - Venda
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-0 bg-card/80">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "Encontrei o apartamento ideal para alugar. Todo o processo foi
                transparente e sem complicações. Recomendo!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold">AS</span>
                </div>
                <div>
                  <div className="font-semibold">Ana Santos</div>
                  <div className="text-sm text-muted-foreground">
                    Cliente - Locação
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Blog Imobiliário
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Fique por dentro das últimas tendências e dicas do mercado
              imobiliário
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 bg-card/80">
              <img
                src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=250&fit=crop"
                alt="Investimento Imobiliário"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  Investimento
                </Badge>
                <h3 className="text-xl font-bold mb-3">
                  Como Escolher o Imóvel Ideal para Investimento
                </h3>
                <p className="text-muted-foreground mb-4">
                  Descubra as melhores estratégias para investir no mercado
                  imobiliário goiano e maximize seus retornos.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      8 min de leitura
                    </span>
                  </div>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/blog">Ler mais</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 bg-card/80">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop"
                alt="Documentação"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  Documentação
                </Badge>
                <h3 className="text-xl font-bold mb-3">
                  Documentos para Comprar seu Primeiro Imóvel
                </h3>
                <p className="text-muted-foreground mb-4">
                  Guia completo com todos os documentos necessários para
                  realizar a compra do seu primeiro imóvel.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      5 min de leitura
                    </span>
                  </div>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/blog">Ler mais</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 bg-card/80">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop"
                alt="Tendências"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  Mercado
                </Badge>
                <h3 className="text-xl font-bold mb-3">
                  Tendências do Mercado Imobiliário em 2024
                </h3>
                <p className="text-muted-foreground mb-4">
                  Análise das principais tendências que estão moldando o mercado
                  imobiliário brasileiro neste ano.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      6 min de leitura
                    </span>
                  </div>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/blog">Ler mais</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/blog">
                <BookOpen className="mr-2 h-5 w-5" />
                Ver todos os artigos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <footer className="bg-card border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img
                src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=250"
                alt="Siqueira Campos Imóveis"
                className="h-16 w-auto mb-6 dark:hidden"
              />
              <img
                src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=250"
                alt="Siqueira Campos Imóveis"
                className="hidden h-16 w-auto mb-6 dark:block"
              />
              <p className="text-muted-foreground mb-4">
                Realizando sonhos imobiliários em Goiânia há mais de 15 anos com
                confiança e transparência.
              </p>
              <div className="flex items-center text-primary">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">CRECI Licenciado</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Navegação</h3>
              <div className="space-y-3">
                <Link
                  to="/imoveis"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Imóveis
                </Link>
                <Link
                  to="/blog"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
                <Link
                  to="/comparador"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Comparador
                </Link>
                <Link
                  to="/simulador"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Simulador
                </Link>
                <Link
                  to="/contato"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </Link>
                <Link
                  to="/sobre"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Sobre nós
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Contato</h3>
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <a href="tel:+5562985563505">(62) 9 8556-3505</a>
                </div>
                <div className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-5 w-5 mr-3 text-primary" />
                  <a
                    href="https://instagram.com/imoveissiqueiracampos"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @imoveissiqueiracampos
                  </a>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  Goiânia - GO
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Desenvolvido por</h3>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/logo-kryonix-8ad11b?format=webp&width=100"
                  alt="Kryonix"
                  className="h-8 w-auto"
                />
                <div className="text-sm">
                  <Link
                    to="/desenvolvedor"
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    Kryonix
                  </Link>
                  <div className="text-muted-foreground">
                    Tecnologia de ponta
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Soluções digitais para o mercado imobiliário
              </p>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>
              &copy; 2024 Siqueira Campos Imóveis. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}
