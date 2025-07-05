import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Award,
  Users,
  Home,
  Calendar,
  Star,
  CheckCircle,
  Building,
  Heart,
  Target,
  Shield,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";

interface Membro {
  id: string;
  nome: string;
  cargo: string;
  especialidade: string;
  whatsapp?: string;
  foto: string;
  experiencia: string;
}

export default function Sobre() {
  const [membros, setMembros] = useState<Membro[]>([]);

  useEffect(() => {
    carregarMembros();
  }, []);

  const carregarMembros = async () => {
    // Simular carregamento de membros da equipe
    const membrosExemplo: Membro[] = [
      {
        id: "1",
        nome: "Juarez Siqueira Campos",
        cargo: "Diretor Geral",
        especialidade: "Vendas de Alto Padrão",
        whatsapp: "5562985563505",
        foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        experiencia: "15+ anos",
      },
      {
        id: "2",
        nome: "Carlos Silva",
        cargo: "Corretor Sênior",
        especialidade: "Apartamentos e Casas",
        whatsapp: "5562999887766",
        foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        experiencia: "8+ anos",
      },
      {
        id: "3",
        nome: "Maria Santos",
        cargo: "Assistente Comercial",
        especialidade: "Locação Residencial",
        whatsapp: "5562988776655",
        foto: "https://images.unsplash.com/photo-1494790108755-2616b612b5ff?w=300&h=300&fit=crop&crop=face",
        experiencia: "5+ anos",
      },
    ];

    setMembros(membrosExemplo);
  };

  const valores = [
    {
      icon: Shield,
      titulo: "Confiança",
      descricao: "Transparência e honestidade em todas as nossas negociações",
    },
    {
      icon: Heart,
      titulo: "Comprometimento",
      descricao: "Dedicação total para realizar o sonho da casa própria",
    },
    {
      icon: Target,
      titulo: "Excelência",
      descricao: "Atendimento de qualidade superior e resultados eficazes",
    },
    {
      icon: Users,
      titulo: "Relacionamento",
      descricao: "Construindo laços duradouros com nossos clientes",
    },
  ];

  const estatisticas = [
    { numero: "15+", label: "Anos de experiência" },
    { numero: "1000+", label: "Clientes atendidos" },
    { numero: "500+", label: "Imóveis negociados" },
    { numero: "98%", label: "Clientes satisfeitos" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=200"
              alt="Siqueira Campos Imóveis"
              className="h-10 w-auto dark:hidden"
            />
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=200"
              alt="Siqueira Campos Imóveis"
              className="hidden h-10 w-auto dark:block"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
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
              to="/sobre"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Sobre
            </Link>
            <Link
              to="/contato"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contato
            </Link>
            <Link
              to="/simulador"
              className="text-foreground hover:text-primary transition-colors"
            >
              Simulador
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sobre a Siqueira Campos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Há mais de 15 anos realizando sonhos imobiliários em Goiânia com
            dedicação, transparência e excelência no atendimento.
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nossa História
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  A Siqueira Campos Imóveis nasceu em 2009 com o sonho de
                  transformar a vida das pessoas através da realização do sonho
                  da casa própria. Fundada por Juarez Siqueira Campos, a empresa
                  começou como uma pequena imobiliária de bairro e cresceu até
                  se tornar uma das principais referências em Goiânia.
                </p>
                <p>
                  Ao longo dos anos, construímos nossa reputação baseada em três
                  pilares fundamentais: <strong>confiança</strong>,{" "}
                  <strong>transparência</strong> e <strong>excelência</strong>{" "}
                  no atendimento. Cada cliente que passa por nossas portas não é
                  apenas um número, mas uma história de vida que nos orgulhamos
                  de fazer parte.
                </p>
                <p>
                  Hoje, com mais de 1000 famílias atendidas e centenas de
                  imóveis negociados, continuamos firmes em nosso propósito:
                  conectar pessoas aos seus lares dos sonhos.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Fachada da imobiliária"
                className="rounded-lg shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Equipe trabalhando"
                className="rounded-lg shadow-lg mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Atendimento ao cliente"
                className="rounded-lg shadow-lg -mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Casa dos sonhos"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nossos Números
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Resultados que falam por si só
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {estatisticas.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl md:text-6xl font-bold mb-2 group-hover:scale-110 transition-transform">
                  {stat.numero}
                </div>
                <div className="text-lg text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossos Valores
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Os princípios que norteiam todas as nossas ações e decisões
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valores.map((valor, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-8">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <valor.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{valor.titulo}</h3>
                  <p className="text-muted-foreground">{valor.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Equipe */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossa Equipe
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Profissionais experientes e dedicados ao seu sucesso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {membros.map((membro) => (
              <Card
                key={membro.id}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-8">
                  <img
                    src={membro.foto}
                    alt={membro.nome}
                    className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                  />
                  <h3 className="text-xl font-bold mb-2">{membro.nome}</h3>
                  <Badge variant="secondary" className="mb-2">
                    {membro.cargo}
                  </Badge>
                  <p className="text-muted-foreground mb-4">
                    {membro.especialidade}
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {membro.experiencia}
                    </div>
                  </div>
                  {membro.whatsapp && (
                    <Button size="sm" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Conversar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certificações */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Certificações e Parcerias
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reconhecimento e parcerias que garantem qualidade e segurança
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">CRECI Licenciado</h3>
              <p className="text-muted-foreground">
                Registro profissional ativo no Conselho Regional de Corretores
                de Imóveis
              </p>
            </Card>

            <Card className="text-center p-8">
              <Building className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Parceiro CEF</h3>
              <p className="text-muted-foreground">
                Correspondente bancário autorizado da Caixa Econômica Federal
              </p>
            </Card>

            <Card className="text-center p-8">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">ISO 9001</h3>
              <p className="text-muted-foreground">
                Certificação de qualidade em gestão e atendimento ao cliente
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para encontrar seu novo lar?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudar você a realizar o sonho da casa
            própria. Entre em contato conosco hoje mesmo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contato">
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar Conosco
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link
                to="/imoveis"
                className="text-white border-white hover:bg-white hover:text-primary"
              >
                <Home className="mr-2 h-5 w-5" />
                Ver Imóveis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img
                src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=150"
                alt="Siqueira Campos Imóveis"
                className="h-12 w-auto mb-6 dark:hidden"
              />
              <img
                src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=150"
                alt="Siqueira Campos Imóveis"
                className="hidden h-12 w-auto mb-6 dark:block"
              />
              <p className="text-muted-foreground mb-4">
                Realizando sonhos imobiliários em Goiânia há mais de 15 anos.
              </p>
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
                  to="/sobre"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Sobre nós
                </Link>
                <Link
                  to="/contato"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </Link>
                <Link
                  to="/simulador"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Simulador
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
              <Link to="/desenvolvedor" className="block">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/logo-kryonix-8ad11b?format=webp&width=100"
                    alt="Kryonix"
                    className="h-8 w-auto"
                  />
                  <div className="text-sm">
                    <div className="font-semibold hover:text-primary transition-colors">
                      Kryonix
                    </div>
                    <div className="text-muted-foreground">
                      Tecnologia de ponta
                    </div>
                  </div>
                </div>
              </Link>
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
