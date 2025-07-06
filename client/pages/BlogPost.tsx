import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  Star,
  ChevronRight,
  Eye,
  ThumbsUp,
  BookOpen,
  Tag,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishedAt: Date;
  readTime: number;
  image: string;
  tags: string[];
  views: number;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  publishedAt: Date;
  avatar?: string;
}

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    carregarPost();
  }, [id]);

  const carregarPost = async () => {
    try {
      // Simular carregamento do post baseado no ID
      const postsData: { [key: string]: BlogPost } = {
        "1": {
          id: "1",
          title: "Como Escolher o Imóvel Ideal para Investimento em Goiânia",
          content: `
## Introdução

O mercado imobiliário de Goiânia oferece excelentes oportunidades para investidores. A cidade tem crescido consistentemente, com novos bairros sendo desenvolvidos e uma economia forte baseada no agronegócio.

## Principais fatores a considerar

### 1. Localização estratégica

A localização é o fator mais importante em qualquer investimento imobiliário. Procure por bairros em crescimento como:

- **Jardim Goiás**: Bairro nobre com excelente infraestrutura
- **Setor Oeste**: Região central e bem localizada  
- **Aldeota**: Bairro em crescimento com boa oferta de lazer
- **Alto da Glória**: Vista privilegiada e ambiente familiar

### 2. Infraestrutura e comodidades

Verifique a proximidade com:
- Escolas de qualidade
- Hospitais e postos de saúde
- Shopping centers e comércio
- Transporte público
- Áreas de lazer e parques

### 3. Potencial de valorização

Analise os projetos de desenvolvimento urbano previstos para a região:
- Novos empreendimentos comerciais
- Melhorias no transporte público
- Obras de infraestrutura
- Crescimento populacional da região

### 4. Rentabilidade do investimento

Compare o valor do aluguel com o preço de venda para calcular o yield:

**Fórmula do Yield = (Valor do aluguel anual ÷ Valor do imóvel) × 100**

Um bom yield em Goiânia fica entre 6% e 8% ao ano.

### 5. Documentação em ordem

Sempre verifique:
- Escritura registrada
- IPTU em dia
- Certidão de ônus reais
- Habite-se
- Regularização junto ao município

## Bairros mais procurados para investimento

### Jardim Goiás
- **Perfil**: Alto padrão
- **Yield médio**: 6-7%
- **Público**: Famílias de alta renda
- **Diferenciais**: Proximidade ao Flamboyant Shopping

### Setor Oeste  
- **Perfil**: Classe média alta
- **Yield médio**: 7-8%
- **Público**: Profissionais liberais
- **Diferenciais**: Localização central

### Aldeota
- **Perfil**: Jovem e dinâmico
- **Yield médio**: 8-9%
- **Público**: Universitários e jovens profissionais
- **Diferenciais**: Vida noturna ativa

## Dicas finais

1. **Diversifique**: Não coloque todos os recursos em um único imóvel
2. **Pesquise**: Visite diferentes bairros e compare preços
3. **Consulte especialistas**: Tenha apoio de corretores experientes
4. **Planeje**: Defina seus objetivos de prazo e rentabilidade
5. **Monitore**: Acompanhe o mercado constantemente

## Conclusão

Investir no mercado imobiliário de Goiânia pode ser muito lucrativo se feito com planejamento e conhecimento. A cidade oferece oportunidades em diferentes faixas de preço e perfis de investimento.

Para mais informações e ajuda especializada, entre em contato com nossa equipe da Siqueira Campos Imóveis. Temos mais de 15 anos de experiência no mercado goiano e podemos te ajudar a encontrar o investimento ideal.
          `,
          excerpt:
            "Descubra as melhores estratégias para investir no mercado imobiliário goiano e maximize seus retornos.",
          category: "Investimento",
          author: {
            name: "Juarez Siqueira Campos",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            bio: "Corretor de imóveis há mais de 15 anos, especialista no mercado de Goiânia. CRECI 12345-J",
          },
          publishedAt: new Date("2024-01-15T10:00:00Z"),
          readTime: 8,
          image:
            "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&h=400&fit=crop",
          tags: ["Investimento", "Goiânia", "Mercado Imobiliário", "Dicas"],
          views: 1243,
          likes: 89,
          comments: [
            {
              id: "1",
              author: "Maria Silva",
              content:
                "Excelente artigo! Me ajudou muito a entender melhor o mercado de Goiânia.",
              publishedAt: new Date("2024-01-16T09:00:00Z"),
              avatar:
                "https://images.unsplash.com/photo-1494790108755-2616b612b5ff?w=50&h=50&fit=crop&crop=face",
            },
            {
              id: "2",
              author: "João Santos",
              content:
                "Muito útil! Gostaria de saber mais sobre o bairro Jardim Goiás.",
              publishedAt: new Date("2024-01-16T14:30:00Z"),
            },
          ],
        },
        "2": {
          id: "2",
          title: "Documentos Necessários para Comprar seu Primeiro Imóvel",
          content: `
## Guia Completo de Documentação

Comprar o primeiro imóvel é um momento especial e requer preparação adequada. Este guia te ajudará a reunir todos os documentos necessários para tornar o processo mais simples e ágil.

## Documentos Pessoais

### Para o comprador
- **RG e CPF** (originais e cópias)
- **Comprovante de estado civil**
- **Comprovante de residência** (últimos 3 meses)
- **Declaração de imposto de renda** (últimos 2 anos)
- **Comprovante de renda** (últimos 3 meses)
- **Extratos bancários** (últimos 3 meses)

### Se casado
- **Certidão de casamento atualizada**
- **Declaração do cônjuge** (se não participar da compra)
- **Documentos do cônjuge** (RG, CPF, comprovante de renda)

## Para Financiamento Bancário

### Documentação profissional
- **Carteira de trabalho** (páginas principais)
- **Declaração do empregador**
- **Últimos holerites**
- **Comprovante de outros rendimentos**

### Para autônomos
- **Declaração de imposto de renda** completa
- **Comprovantes de renda** (últimos 6 meses)
- **Extratos bancários** (últimos 6 meses)
- **Declaração de próprio punho** da atividade exercida

## Documentos do Imóvel

### Documentação básica
- **Escritura ou contrato de compra e venda**
- **Certidão de ônus reais** (atualizada)
- **IPTU quitado** (últimos 5 anos)
- **Taxa de lixo quitada**
- **Habite-se** (para imóveis novos)

### Condomínio (se aplicável)
- **Convenção do condomínio**
- **Ata de assembleia** (última)
- **Demonstrativo financeiro**
- **Quitação das taxas condominiais**

## Processo de Financiamento

### Etapas principais
1. **Pré-aprovação**: Análise inicial dos documentos
2. **Avaliação do imóvel**: Vistoria técnica do banco
3. **Aprovação final**: Liberação do crédito
4. **Assinatura**: Contrato de financiamento

### Documentos adicionais
- **Comprovante de entrada** (35% do valor)
- **Seguro do imóvel**
- **Avaliação técnica** (paga pelo comprador)

## Custos Envolvidos

### Taxas obrigatórias
- **ITBI**: 2% sobre o valor do imóvel
- **Cartório**: Aproximadamente 1% do valor
- **Registro**: Taxa fixa do cartório
- **Avaliação**: R$ 400 a R$ 800

### Custos opcionais
- **Vistoria técnica**: R$ 300 a R$ 500
- **Assessoria jurídica**: 0,5% a 1% do valor
- **Seguro residencial**: Valor anual variável

## Cronograma Típico

### Semana 1-2
- Reunir documentação pessoal
- Solicitar pré-aprovação do financiamento
- Definir valor máximo de compra

### Semana 3-4  
- Buscar imóveis na faixa de preço
- Agendar visitas
- Fazer propostas

### Semana 5-6
- Negociar condições
- Solicitar documentação do imóvel
- Enviar documentos para o banco

### Semana 7-8
- Aguardar avaliação bancária
- Finalizar negociação
- Assinar contratos

## Dicas Importantes

### Documentação
✅ **Mantenha tudo organizado** em pastas separadas
✅ **Faça cópias** de todos os documentos
✅ **Atualize documentos** próximos ao vencimento
✅ **Tenha originais** sempre à disposição

### Negociação
✅ **Pesquise preços** na região
✅ **Verifique débitos** do imóvel
✅ **Negocie prazos** de entrega da documentação
✅ **Tenha alternativas** de imóveis

## Quando Buscar Ajuda

### Procure um corretor se:
- É sua primeira compra
- Não tem tempo para pesquisar
- Quer negociar melhores condições
- Precisa de orientação jurídica

### Nossa equipe oferece:
- **Consultoria gratuita** sobre documentação
- **Acompanhamento** em todo processo
- **Parcerias** com bancos e cartórios
- **Suporte jurídico** especializado

## Conclusão

A documentação pode parecer complexa, mas com organização e orientação adequada, o processo se torna muito mais simples. Nossa equipe da Siqueira Campos está sempre pronta para te ajudar em cada etapa da compra do seu primeiro imóvel.

Entre em contato conosco e realize o sonho da casa própria com toda segurança e tranquilidade!
          `,
          excerpt:
            "Guia completo com todos os documentos que você precisa ter em mãos para realizar a compra do seu primeiro imóvel.",
          category: "Documentação",
          author: {
            name: "Equipe Siqueira Campos",
            avatar:
              "https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=150",
            bio: "Equipe especializada em documentação imobiliária com mais de 15 anos de experiência.",
          },
          publishedAt: new Date("2024-01-10T14:30:00Z"),
          readTime: 5,
          image:
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
          tags: ["Documentação", "Primeira Compra", "Financiamento", "Guia"],
          views: 867,
          likes: 62,
          comments: [],
        },
      };

      const postData = postsData[id || "1"];
      if (postData) {
        setPost(postData);
      }
    } catch (error) {
      console.error("Erro ao carregar post:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleLike = () => {
    setLiked(!liked);
    if (post) {
      setPost({
        ...post,
        likes: liked ? post.likes - 1 : post.likes + 1,
      });
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && post) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: "Visitante",
        content: newComment,
        publishedAt: new Date(),
      };

      setPost({
        ...post,
        comments: [...post.comments, comment],
      });
      setNewComment("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
          <Button asChild>
            <Link to="/blog">Voltar para o Blog</Link>
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
              className="text-foreground hover:text-primary transition-colors"
            >
              Imóveis
            </Link>
            <Link
              to="/blog"
              className="text-foreground hover:text-primary transition-colors font-medium"
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/blog" className="hover:text-primary">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{post.title}</span>
        </nav>

        {/* Voltar */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Blog
          </Link>
        </Button>

        {/* Hero Image */}
        <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <Badge className="mb-4 bg-primary">{post.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {post.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            {/* Meta informações */}
            <div className="flex items-center space-x-6 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} min de leitura</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>{post.views} visualizações</span>
              </div>
            </div>

            {/* Conteúdo do artigo */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: post.content.replace(/\n/g, "<br>"),
                  }}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <div className="flex items-center space-x-2 mb-8">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ações do artigo */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleLike}
                      className={liked ? "text-red-600 border-red-600" : ""}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`}
                      />
                      {post.likes} {post.likes === 1 ? "Curtida" : "Curtidas"}
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      Artigo útil? Deixe seu comentário!
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comentários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comentários ({post.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Formulário de comentário */}
                <div className="border rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">Deixe seu comentário</h4>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Escreva seu comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Publicar Comentário
                    </Button>
                  </div>
                </div>

                {/* Lista de comentários */}
                <div className="space-y-6">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.avatar ? (
                          <img
                            src={comment.avatar}
                            alt={comment.author}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-semibold">{comment.author}</h5>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.publishedAt)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {post.comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Seja o primeiro a comentar!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Autor */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Autor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{post.author.name}</h4>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm ml-1">Especialista</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {post.author.bio}
                </p>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contatar
                </Button>
              </CardContent>
            </Card>

            {/* Artigos relacionados */}
            <Card>
              <CardHeader>
                <CardTitle>Artigos Relacionados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Link
                    to="/blog/post/2"
                    className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <h5 className="font-semibold text-sm mb-1">
                      Documentos para Comprar seu Primeiro Imóvel
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      5 min de leitura
                    </p>
                  </Link>
                  <Link
                    to="/blog/post/3"
                    className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <h5 className="font-semibold text-sm mb-1">
                      Tendências do Mercado Imobiliário 2024
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      6 min de leitura
                    </p>
                  </Link>
                  <Link
                    to="/blog/post/4"
                    className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <h5 className="font-semibold text-sm mb-1">
                      Vantagens de Morar nos Principais Bairros
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      7 min de leitura
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Receba dicas exclusivas sobre o mercado imobiliário
                </p>
                <div className="space-y-2">
                  <Input placeholder="Seu melhor email" />
                  <Button className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Inscrever-se
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
