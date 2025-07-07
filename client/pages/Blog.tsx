import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Search,
  ArrowRight,
  Home,
  TrendingUp,
  MapPin,
  FileText,
  Heart,
  Share2,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";
import { SharedNavigation } from "@/components/SharedNavigation";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: number;
  image: string;
  tags: string[];
  featured: boolean;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Como Escolher o Imóvel Ideal para Investimento em Goiânia",
    excerpt:
      "Descubra as melhores estratégias para investir no mercado imobiliário goiano e maximize seus retornos.",
    content: `O mercado imobiliário de Goiânia oferece excelentes oportunidades para investidores. A cidade tem crescido consistentemente, com novos bairros sendo desenvolvidos e uma economia forte baseada no agronegócio.

Principais fatores a considerar:

1. **Localização**: Procure por bairros em crescimento como Jardim Goiás, Setor Oeste e Aldeota.

2. **Infraestrutura**: Verifique proximidade com escolas, hospitais, shopping centers e transporte público.

3. **Potencial de valorização**: Analise os projetos de desenvolvimento urbano previstos para a região.

4. **Rentabilidade**: Compare o valor do aluguel com o preço de venda para calcular o yield.

5. **Documentação**: Sempre verifique toda a documentação do imóvel antes de comprar.`,
    category: "Investimento",
    author: "Juarez Siqueira",
    publishedAt: "2024-01-15T10:00:00Z",
    readTime: 8,
    image:
      "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&h=400&fit=crop",
    tags: ["Investimento", "Goiânia", "Mercado Imobiliário"],
    featured: true,
  },
  {
    id: "2",
    title: "Documentos Necessários para Comprar seu Primeiro Imóvel",
    excerpt:
      "Guia completo com todos os documentos que você precisa ter em mãos para realizar a compra do seu primeiro imóvel.",
    content: `Comprar o primeiro imóvel é um momento especial e requer preparação adequada. Aqui está a lista completa de documentos necessários:

**Documentos Pessoais:**
- RG e CPF
- Comprovante de renda
- Declaração de imposto de renda dos últimos 2 anos
- Extratos bancários dos últimos 3 meses
- Certidão de casamento (se aplicável)

**Para Financiamento:**
- Comprovante de trabalho
- Declaração de dependentes
- Comprovante de patrimônio

**Documentos do Imóvel:**
- Escritura ou contrato de compra e venda
- Certidão de ônus reais
- IPTU quitado
- Habite-se

Nosso corretor pode te ajudar em todo esse processo!`,
    category: "Documentação",
    author: "Equipe Siqueira Campos",
    publishedAt: "2024-01-10T14:30:00Z",
    readTime: 5,
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    tags: ["Documentação", "Primeira Compra", "Financiamento"],
    featured: false,
  },
  {
    id: "3",
    title: "Tendências do Mercado Imobiliário em 2024",
    excerpt:
      "Análise das principais tendências que estão moldando o mercado imobiliário brasileiro neste ano.",
    content: `O mercado imobiliário brasileiro está passando por transformações importantes em 2024:

**1. Sustentabilidade em Foco**
Imóveis com certificação verde e tecnologias sustentáveis estão em alta demanda.

**2. Home Office Permanente**
Espaços para trabalho em casa continuam sendo prioridade para compradores.

**3. Tecnologia Integrada**
Smart homes com automação residencial ganham cada vez mais espaço.

**4. Localização Estratégica**
Proximidade a centros comerciais e transporte público valoriza os imóveis.

**5. Financiamento Digital**
Processos mais ágeis e digitalizados facilitam a compra.

Em Goiânia, essas tendências se refletem principalmente nos bairros nobres como Jardim Goiás e Setor Oeste.`,
    category: "Mercado",
    author: "Juarez Siqueira",
    publishedAt: "2024-01-05T09:00:00Z",
    readTime: 6,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
    tags: ["Tendências", "2024", "Mercado", "Tecnologia"],
    featured: true,
  },
  {
    id: "4",
    title: "Vantagens de Morar nos Principais Bairros de Goiânia",
    excerpt:
      "Conheça as características e vantagens dos bairros mais procurados da capital goiana.",
    content: `Goiânia oferece diversos bairros com características únicas. Aqui estão os mais procurados:

**Jardim Goiás**
- Bairro nobre com excelente infraestrutura
- Proximidade ao Flamboyant Shopping
- Ótimas opções de restaurantes e lazer

**Setor Oeste**
- Região central e bem localizada
- Fácil acesso ao centro e outras regiões
- Boa oferta de serviços

**Aldeota**
- Bairro em crescimento
- Boas opções de lazer noturno
- Proximidade à UFG

**Setor Bueno**
- Região consolidada
- Excelente infraestrutura comercial
- Boa valorização imobiliária

**Alto da Glória**
- Vista privilegiada da cidade
- Casas com terrenos amplos
- Ambiente familiar e tranquilo

Cada bairro tem suas particularidades. Nossa equipe pode te ajudar a escolher o ideal para seu perfil!`,
    category: "Localização",
    author: "Equipe Siqueira Campos",
    publishedAt: "2024-01-01T16:00:00Z",
    readTime: 7,
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop",
    tags: ["Goiânia", "Bairros", "Localização", "Moradia"],
    featured: false,
  },
];

const categories = [
  "Todos",
  "Investimento",
  "Documentação",
  "Mercado",
  "Localização",
  "Financiamento",
];

export default function Blog() {
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let filtered = articles;

    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(
        (article) => article.category === selectedCategory,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    setFilteredArticles(filtered);
  }, [selectedCategory, searchTerm]);

  const featuredArticles = articles.filter((article) => article.featured);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <SharedNavigation />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Blog Siqueira Campos
          </h1>
          <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto">
            Dicas, tendências e insights sobre o mercado imobiliário em Goiânia
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
            <Input
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-amber-900 bg-white border-0 rounded-full shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">
              Artigos em Destaque
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden border-amber-200 shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 left-4 bg-amber-600 text-white">
                      Destaque
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center space-x-4 text-sm text-amber-600 mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime} min
                      </div>
                    </div>
                    <CardTitle className="text-amber-900 group-hover:text-amber-700 transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-amber-700">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-amber-700">
                          {article.author}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        asChild
                      >
                        <Link to={`/blog/post/${article.id}`}>
                          Ler mais
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Categories Filter */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "border-amber-300 text-amber-700 hover:bg-amber-50"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* Articles Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles
              .filter((article) => !article.featured)
              .map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden border-amber-200 shadow-md hover:shadow-lg transition-shadow group"
                >
                  <div className="relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-amber-600 text-white">
                      {article.category}
                    </Badge>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center space-x-3 text-xs text-amber-600 mb-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {article.readTime} min
                      </div>
                    </div>
                    <CardTitle className="text-lg text-amber-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-amber-700 line-clamp-2">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-amber-600" />
                        <span className="text-xs text-amber-700">
                          {article.author}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                        >
                          <Heart className="w-3 h-3 text-amber-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                        >
                          <Share2 className="w-3 h-3 text-amber-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-amber-100 text-amber-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      asChild
                    >
                      <Link to={`/blog/post/${article.id}`}>
                        <FileText className="w-3 h-3 mr-2" />
                        Ler artigo completo
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-amber-900 mb-4">
                Nenhum artigo encontrado
              </h3>
              <p className="text-amber-700 mb-6">
                Tente ajustar os filtros ou pesquisar por outros termos.
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory("Todos");
                  setSearchTerm("");
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </section>

        {/* Newsletter Subscription */}
        <section className="mt-16 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 rounded-2xl">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Receba nossas novidades</h3>
            <p className="text-amber-100 mb-6">
              Cadastre-se em nossa newsletter e receba dicas exclusivas sobre o
              mercado imobiliário em Goiânia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Seu melhor e-mail"
                className="flex-1 bg-white text-amber-900 border-0"
              />
              <Button className="bg-amber-800 hover:bg-amber-900 text-white">
                Inscrever-se
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-amber-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img
                src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-6b4bbf?format=webp&width=150"
                alt="Siqueira Campos Imóveis"
                className="h-8 w-auto mb-4"
              />
              <p className="text-amber-200">
                Realizando sonhos imobiliários em Goiânia com excelência e
                confiança.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Blog</h4>
              <ul className="space-y-2 text-amber-200">
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Artigos Recentes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Dicas de Investimento
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Tendências do Mercado
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-amber-200">
                <li>(62) 9 8556-3505</li>
                <li>SiqueiraCamposImoveisGoiania@gmail.com</li>
                <li>@imoveissiqueiracampos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Desenvolvido por</h4>
              <p className="text-amber-200">
                <Link
                  to="/desenvolvedor"
                  className="hover:text-white transition-colors"
                >
                  KRYONIX
                </Link>
              </p>
            </div>
          </div>
          <Separator className="my-8 bg-amber-800" />
          <div className="text-center text-amber-200">
            <p>
              © 2024 Siqueira Campos Imóveis. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      <ChatBubble />
    </div>
  );
}
