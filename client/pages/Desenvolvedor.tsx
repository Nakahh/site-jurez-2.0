import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Smartphone,
  Globe,
  Database,
  Zap,
  Users,
  MessageCircle,
  Instagram,
  Phone,
  Mail,
  Github,
  Linkedin,
  Star,
  CheckCircle,
  Rocket,
  Brain,
  Shield,
  Award,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

export default function Desenvolvedor() {
  const [activeTab, setActiveTab] = useState("sobre");

  const servicos = [
    {
      icon: Globe,
      titulo: "Desenvolvimento Web",
      descricao:
        "Sites e aplicações web modernas com React, Next.js e TypeScript",
      tecnologias: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
      icon: Smartphone,
      titulo: "Aplicativos Mobile",
      descricao: "Apps nativos e híbridos para iOS e Android",
      tecnologias: ["React Native", "Flutter", "Expo", "Firebase"],
    },
    {
      icon: Database,
      titulo: "Backend & APIs",
      descricao: "Sistemas robustos com Node.js, Python e bancos de dados",
      tecnologias: ["Node.js", "Python", "PostgreSQL", "MongoDB"],
    },
    {
      icon: Brain,
      titulo: "Inteligência Artificial",
      descricao: "Integração de IA e automação inteligente",
      tecnologias: ["OpenAI", "N8N", "Machine Learning", "Chatbots"],
    },
    {
      icon: Shield,
      titulo: "DevOps & Cloud",
      descricao: "Deploy seguro e escalável na nuvem",
      tecnologias: ["Docker", "AWS", "Vercel", "CI/CD"],
    },
    {
      icon: Zap,
      titulo: "Automação",
      descricao: "Automatização de processos e integrações",
      tecnologias: ["N8N", "Zapier", "APIs", "Webhooks"],
    },
  ];

  const projetos = [
    {
      nome: "Siqueira Campos Imóveis",
      descricao: "Sistema completo de imobiliária com IA e automação",
      tecnologias: ["React", "Node.js", "PostgreSQL", "N8N", "WhatsApp API"],
      status: "Concluído",
      imagem:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    },
    {
      nome: "E-commerce Plus",
      descricao: "Plataforma de vendas online com IA para recomendações",
      tecnologias: ["Next.js", "Stripe", "AI", "TypeScript"],
      status: "Em Desenvolvimento",
      imagem:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    },
    {
      nome: "HealthTech App",
      descricao: "Aplicativo de telemedicina com agendamentos inteligentes",
      tecnologias: ["React Native", "Firebase", "WebRTC"],
      status: "Concluído",
      imagem:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
    },
  ];

  const depoimentos = [
    {
      nome: "Juarez Siqueira Campos",
      empresa: "Siqueira Campos Imóveis",
      depoimento:
        "A Kryonix transformou completamente nosso negócio. O sistema desenvolvido automatizou nossos processos e aumentou nossa eficiência em 300%.",
      foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
    },
    {
      nome: "Maria Silva",
      empresa: "TechStart",
      depoimento:
        "Profissionalismo excepcional! O Vitor entendeu nossa necessidade e entregou uma solução que superou nossas expectativas.",
      foto: "https://images.unsplash.com/photo-1494790108755-2616b612b5ff?w=100&h=100&fit=crop&crop=face",
      rating: 5,
    },
    {
      nome: "Carlos Santos",
      empresa: "Digital Solutions",
      depoimento:
        "Trabalho de alta qualidade, prazo cumprido e suporte excelente. Recomendo a Kryonix para qualquer projeto de tecnologia.",
      foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 dark:bg-gray-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/logo-kryonix-8ad11b?format=webp&width=150"
              alt="Kryonix"
              className="h-10 w-auto"
            />
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Kryonix
              </div>
              <div className="text-xs text-muted-foreground">
                Tecnologia de Ponta
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <a
                href="https://wa.me/5517981805327"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contato
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <img
                src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/logo-kryonix-8ad11b?format=webp&width=300"
                alt="Kryonix"
                className="w-48 h-48 mx-auto mb-6 object-contain"
              />
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Kryonix
                </span>
              </h1>
              <p className="text-2xl md:text-3xl font-light text-gray-600 dark:text-gray-300 mb-4">
                Transformando ideias em soluções digitais
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Desenvolvimento de software de alta qualidade com tecnologias de
                ponta. Especialistas em React, Node.js, IA e automação.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Code className="h-4 w-4 mr-2" />
                Full Stack Developer
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Brain className="h-4 w-4 mr-2" />
                AI Specialist
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2" />
                Automation Expert
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                asChild
              >
                <a
                  href="https://wa.me/5517981805327"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Conversar no WhatsApp
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                asChild
              >
                <a
                  href="https://instagram.com/kryon.ix"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  @kryon.ix
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navegação */}
      <section className="py-8 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-8">
            {[
              { id: "sobre", label: "Sobre" },
              { id: "servicos", label: "Serviços" },
              { id: "projetos", label: "Projetos" },
              { id: "depoimentos", label: "Depoimentos" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-muted-foreground hover:text-blue-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      {activeTab === "sobre" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Sobre a Kryonix
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Nossa Missão</h3>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      A Kryonix nasceu com o propósito de democratizar a
                      tecnologia, criando soluções digitais que transformam
                      negócios e melhoram a vida das pessoas.
                    </p>
                    <p>
                      Liderada por{" "}
                      <strong>Vitor Jayme Fernandes Ferreira</strong>, nossa
                      equipe combina expertise técnica com visão estratégica
                      para entregar projetos que superam expectativas.
                    </p>
                    <p>
                      Especializamos em desenvolvimento full-stack, inteligência
                      artificial e automação, sempre utilizando as tecnologias
                      mais modernas do mercado.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="text-center p-6">
                    <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-bold text-2xl">50+</h4>
                    <p className="text-muted-foreground">Projetos Entregues</p>
                  </Card>
                  <Card className="text-center p-6">
                    <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-bold text-2xl">100%</h4>
                    <p className="text-muted-foreground">
                      Clientes Satisfeitos
                    </p>
                  </Card>
                  <Card className="text-center p-6">
                    <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-bold text-2xl">5+</h4>
                    <p className="text-muted-foreground">Anos de Experiência</p>
                  </Card>
                  <Card className="text-center p-6">
                    <Lightbulb className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-bold text-2xl">24/7</h4>
                    <p className="text-muted-foreground">Suporte Disponível</p>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="p-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                  <h3 className="text-xl font-bold mb-4 text-center">
                    Por que escolher a Kryonix?
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Qualidade Garantida</h4>
                      <p className="text-sm text-muted-foreground">
                        Código limpo e documentado
                      </p>
                    </div>
                    <div className="text-center">
                      <Rocket className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Entrega Rápida</h4>
                      <p className="text-sm text-muted-foreground">
                        Projetos no prazo
                      </p>
                    </div>
                    <div className="text-center">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Suporte Completo</h4>
                      <p className="text-sm text-muted-foreground">
                        Acompanhamento pós-entrega
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
                  <h3 className="text-xl font-bold mb-6 text-center">
                    Conheça nosso CEO
                  </h3>
                  <div className="text-center">
                    <img
                      src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/ceo-kryonix-1fa447?format=webp&width=200"
                      alt="Vitor Jayme - CEO Kryonix"
                      className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
                    />
                    <h4 className="text-lg font-bold mb-2">
                      Vitor Jayme Fernandes Ferreira
                    </h4>
                    <p className="text-primary font-semibold mb-2">
                      CEO & Founder
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Desenvolvedor Full Stack especialista em React, Node.js e
                      Inteligência Artificial. Apaixonado por criar soluções
                      inovadoras que transformam negócios.
                    </p>
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="https://wa.me/5517981805327"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="https://instagram.com/kryon.ix"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="h-4 w-4 mr-1" />
                          Instagram
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Serviços */}
      {activeTab === "servicos" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nossos Serviços
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Soluções completas para transformar sua ideia em realidade
                digital
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicos.map((servico, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 dark:from-blue-900 dark:to-cyan-900">
                      <servico.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-center">
                      {servico.titulo}
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      {servico.descricao}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {servico.tecnologias.map((tech, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projetos */}
      {activeTab === "projetos" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Projetos em Destaque
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Alguns dos projetos que desenvolvemos com excelência
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projetos.map((projeto, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={projeto.imagem}
                    alt={projeto.nome}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{projeto.nome}</h3>
                      <Badge
                        variant={
                          projeto.status === "Concluído"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {projeto.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {projeto.descricao}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {projeto.tecnologias.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Depoimentos */}
      {activeTab === "depoimentos" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                O que nossos clientes dizem
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Depoimentos reais de quem confiou na Kryonix
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {depoimentos.map((depoimento, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {renderStars(depoimento.rating)}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{depoimento.depoimento}"
                    </p>
                    <div className="flex items-center">
                      <img
                        src={depoimento.foto}
                        alt={depoimento.nome}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                      <div>
                        <div className="font-semibold">{depoimento.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {depoimento.empresa}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar sua ideia em realidade?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e vamos conversar sobre seu próximo
            projeto. Transformamos ideias em soluções digitais de sucesso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
              asChild
            >
              <a
                href="https://wa.me/5517981805327"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp: (17) 9 8180-5327
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              asChild
            >
              <a
                href="https://instagram.com/kryon.ix"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-5 w-5" />
                Instagram: @kryon.ix
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/logo-kryonix-8ad11b?format=webp&width=100"
                  alt="Kryonix"
                  className="h-8 w-auto"
                />
                <div>
                  <div className="text-xl font-bold">Kryonix</div>
                  <div className="text-sm text-gray-400">
                    Tecnologia de Ponta
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Transformando ideias em soluções digitais inovadoras.
                Desenvolvimento de software de alta qualidade.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Serviços</h3>
              <div className="space-y-3 text-gray-300">
                <div>Desenvolvimento Web</div>
                <div>Aplicativos Mobile</div>
                <div>Inteligência Artificial</div>
                <div>Automação</div>
                <div>DevOps & Cloud</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Contato</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-3 text-blue-400" />
                  <a href="tel:+5517981805327">(17) 9 8180-5327</a>
                </div>
                <div className="flex items-center text-gray-300">
                  <MessageCircle className="h-5 w-5 mr-3 text-green-400" />
                  <a
                    href="https://wa.me/5517981805327"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
                <div className="flex items-center text-gray-300">
                  <Instagram className="h-5 w-5 mr-3 text-pink-400" />
                  <a
                    href="https://instagram.com/kryon.ix"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @kryon.ix
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Kryonix. Todos os direitos reservados.</p>
            <p className="mt-2">CEO: Vitor Jayme Fernandes Ferreira</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
