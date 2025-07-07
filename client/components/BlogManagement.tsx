import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Tag,
  User,
  Clock,
  BookOpen,
  TrendingUp,
  Heart,
  MessageSquare,
  Share2,
  BarChart3,
  Download,
  Globe,
  Image,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  authorId: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  publishDate: Date;
  scheduledDate?: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  postCount: number;
}

interface BlogManagementProps {
  userRole: "ADMIN" | "MARKETING" | "CORRETOR";
}

export function BlogManagement({ userRole }: BlogManagementProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    author: "",
    dateFrom: "",
    dateTo: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    category: "",
    tags: "",
    status: "DRAFT" as BlogPost["status"],
    scheduledDate: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockPosts: BlogPost[] = [
        {
          id: "1",
          title: "Como Escolher o Imóvel Ideal para Investimento em Goiânia",
          slug: "como-escolher-imovel-ideal-investimento-goiania",
          excerpt:
            "Descubra as melhores estratégias para investir no mercado imobiliário goiano e maximize seus retornos.",
          content: `# Como Escolher o Imóvel Ideal para Investimento em Goiânia

O mercado imobiliário de Goiânia oferece excelentes oportunidades para investidores...

## Principais fatores a considerar:

1. **Localização**: Procure por bairros em crescimento
2. **Infraestrutura**: Verifique proximidade com serviços
3. **Potencial de valorização**: Analise projetos futuros
`,
          featuredImage:
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop",
          category: "Investimento",
          tags: ["investimento", "goiania", "mercado-imobiliario"],
          author: "Juarez Siqueira",
          authorId: "author1",
          status: "PUBLISHED",
          publishDate: new Date("2024-01-15"),
          views: 1250,
          likes: 45,
          comments: 12,
          shares: 8,
          seoTitle: "Investimento Imobiliário em Goiânia - Guia Completo",
          seoDescription:
            "Aprenda como escolher o imóvel ideal para investimento em Goiânia com dicas de especialistas.",
          seoKeywords: "investimento imobiliário, goiânia, comprar imóvel",
          readingTime: 8,
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "2",
          title: "Documentos Necessários para Comprar seu Primeiro Imóvel",
          slug: "documentos-necessarios-comprar-primeiro-imovel",
          excerpt:
            "Guia completo com todos os documentos que você precisa ter em mãos para realizar a compra do seu primeiro imóvel.",
          content: "Conteúdo do artigo sobre documentos...",
          featuredImage:
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
          category: "Documentação",
          tags: ["documentos", "primeira-compra", "financiamento"],
          author: "Ana Silva",
          authorId: "author2",
          status: "DRAFT",
          publishDate: new Date(),
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          readingTime: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCategories: BlogCategory[] = [
        {
          id: "1",
          name: "Investimento",
          slug: "investimento",
          color: "blue",
          postCount: 15,
        },
        {
          id: "2",
          name: "Documentação",
          slug: "documentacao",
          color: "green",
          postCount: 8,
        },
        {
          id: "3",
          name: "Mercado",
          slug: "mercado",
          color: "purple",
          postCount: 12,
        },
        {
          id: "4",
          name: "Localização",
          slug: "localizacao",
          color: "orange",
          postCount: 6,
        },
        {
          id: "5",
          name: "Financiamento",
          slug: "financiamento",
          color: "red",
          postCount: 10,
        },
      ];

      setPosts(mockPosts);
      setCategories(mockCategories);
    } catch (error) {
      console.error("Erro ao carregar dados do blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      category: "",
      tags: "",
      status: "DRAFT",
      scheduledDate: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    });
  };

  const handleCreatePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Título e conteúdo são obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: formData.title,
        slug: formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        excerpt: formData.excerpt || formData.content.substring(0, 200) + "...",
        content: formData.content,
        featuredImage:
          formData.featuredImage ||
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        author: localStorage.getItem("userName") || "Admin",
        authorId: localStorage.getItem("userId") || "admin1",
        status: formData.status,
        publishDate: formData.status === "PUBLISHED" ? new Date() : new Date(),
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate)
          : undefined,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
        seoKeywords: formData.seoKeywords,
        readingTime: Math.ceil(formData.content.split(" ").length / 200),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setPosts((prev) => [newPost, ...prev]);
      setShowCreateDialog(false);
      resetForm();
      alert("Artigo criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar artigo:", error);
      alert("Erro ao criar artigo");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = async () => {
    if (!selectedPost || !formData.title.trim() || !formData.content.trim()) {
      alert("Título e conteúdo são obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      const updatedPost: BlogPost = {
        ...selectedPost,
        title: formData.title,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + "...",
        content: formData.content,
        featuredImage: formData.featuredImage || selectedPost.featuredImage,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status: formData.status,
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate)
          : undefined,
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
        seoKeywords: formData.seoKeywords,
        readingTime: Math.ceil(formData.content.split(" ").length / 200),
        updatedAt: new Date(),
      };

      setPosts((prev) =>
        prev.map((post) => (post.id === selectedPost.id ? updatedPost : post)),
      );
      setShowEditDialog(false);
      setSelectedPost(null);
      resetForm();
      alert("Artigo atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar artigo:", error);
      alert("Erro ao atualizar artigo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.",
      )
    ) {
      try {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        alert("Artigo excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir artigo:", error);
        alert("Erro ao excluir artigo");
      }
    }
  };

  const handleViewPost = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      window.open(`/blog/${post.slug}`, "_blank");
    }
  };

  const getStatusColor = (status: BlogPost["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "ARCHIVED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || post.status === filters.status;
    const matchesCategory =
      !filters.category || post.category === filters.category;
    const matchesAuthor =
      !filters.author ||
      post.author.toLowerCase().includes(filters.author.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory && matchesAuthor;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento do Blog</h2>
          <p className="text-muted-foreground">
            Crie e gerencie artigos para o blog da imobiliária
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="PUBLISHED">Publicado</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="SCHEDULED">Agendado</SelectItem>
              <SelectItem value="ARCHIVED">Arquivado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Artigo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Artigo</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Título do artigo"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="excerpt">Resumo</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Resumo do artigo (usado na listagem)"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Conteúdo completo do artigo (suporta Markdown)"
                    rows={10}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="PUBLISHED">Publicar Agora</SelectItem>
                      <SelectItem value="SCHEDULED">Agendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="ex: investimento, goiania, mercado"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="featuredImage">URL da Imagem Destacada</Label>
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredImage: e.target.value,
                      })
                    }
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                {formData.status === "SCHEDULED" && (
                  <div className="md:col-span-2">
                    <Label htmlFor="scheduledDate">Data de Publicação</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduledDate: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {/* SEO Fields */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">SEO (Opcional)</h3>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="seoTitle">Título SEO</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                    placeholder="Título otimizado para motores de busca"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="seoDescription">Descrição SEO</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Descrição para motores de busca (máx 160 caracteres)"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="seoKeywords">Palavras-chave SEO</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      setFormData({ ...formData, seoKeywords: e.target.value })
                    }
                    placeholder="palavra1, palavra2, palavra3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreatePost} disabled={loading}>
                  {loading ? "Criando..." : "Criar Artigo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-xs text-muted-foreground">
                  Total de Artigos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {posts.filter((p) => p.status === "PUBLISHED").length}
                </p>
                <p className="text-xs text-muted-foreground">Publicados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {posts.reduce((sum, p) => sum + p.views, 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total de Visualizações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {posts.reduce((sum, p) => sum + p.likes, 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total de Curtidas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-24 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {post.publishDate.toLocaleDateString("pt-BR")}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.readingTime} min
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {post.views}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPost(post.id)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPost(post);
                          setFormData({
                            title: post.title,
                            excerpt: post.excerpt,
                            content: post.content,
                            featuredImage: post.featuredImage,
                            category: post.category,
                            tags: post.tags.join(", "),
                            status: post.status,
                            scheduledDate: post.scheduledDate
                              ? post.scheduledDate.toISOString().slice(0, 16)
                              : "",
                            seoTitle: post.seoTitle || "",
                            seoDescription: post.seoDescription || "",
                            seoKeywords: post.seoKeywords || "",
                          });
                          setShowEditDialog(true);
                        }}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePost(post.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum artigo encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || Object.values(filters).some(Boolean)
              ? "Tente ajustar os filtros ou termo de busca."
              : "Crie seu primeiro artigo para começar."}
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Artigo
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Artigo</DialogTitle>
          </DialogHeader>
          {/* Same form fields as create dialog */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Título do artigo"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit-content">Conteúdo *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Conteúdo completo do artigo"
                rows={10}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="PUBLISHED">Publicado</SelectItem>
                  <SelectItem value="SCHEDULED">Agendado</SelectItem>
                  <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditPost} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
