import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  ArrowLeft,
  Plus,
  DollarSign,
  Bed,
  Bath,
  Car,
  Calendar,
  TrendingUp,
  Activity,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Imovel {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  preco: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  status: string;
  fotos?: string[];
  descricao: string;
  visualizacoes: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = "primary",
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  color?: string;
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div
            className={`h-12 w-12 bg-${color}/10 rounded-full flex items-center justify-center`}
          >
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CorretorImoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroFinalidade, setFiltroFinalidade] = useState("TODAS");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    carregarImoveis();
  }, []);

  const carregarImoveis = async () => {
    try {
      // Dados simulados mais robustos
      const imoveisSimulados: Imovel[] = [
        {
          id: "1",
          titulo: "Apartamento Moderno no Setor Bueno",
          tipo: "APARTAMENTO",
          finalidade: "VENDA",
          preco: 650000,
          area: 120.5,
          quartos: 3,
          banheiros: 2,
          vagas: 2,
          endereco: "Rua T-30, 1234",
          bairro: "Setor Bueno",
          cidade: "Goiânia",
          estado: "GO",
          status: "DISPONIVEL",
          descricao:
            "Apartamento de alto padrão com 3 quartos, sendo 1 suíte, 2 banheiros, sala ampla, cozinha planejada, área de serviço e 2 vagas de garagem. Localizado em uma das regiões mais valorizadas de Goiânia.",
          visualizacoes: 45,
          criadoEm: new Date("2024-12-15T10:30:00"),
          atualizadoEm: new Date("2025-01-05T14:20:00"),
          fotos: [
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          ],
        },
        {
          id: "2",
          titulo: "Casa Térrea no Jardim Goiás",
          tipo: "CASA",
          finalidade: "VENDA",
          preco: 450000,
          area: 250.0,
          quartos: 4,
          banheiros: 3,
          vagas: 3,
          endereco: "Rua das Flores, 567",
          bairro: "Jardim Goiás",
          cidade: "Goiânia",
          estado: "GO",
          status: "VENDIDO",
          descricao:
            "Casa espaçosa com 4 quartos, sendo 2 suítes, 3 banheiros, sala de estar, sala de jantar, cozinha, área gourmet, piscina e 3 vagas de garagem. Terreno de 400m².",
          visualizacoes: 123,
          criadoEm: new Date("2024-11-20T09:15:00"),
          atualizadoEm: new Date("2024-12-28T16:45:00"),
          fotos: [
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          ],
        },
        {
          id: "3",
          titulo: "Apartamento para Aluguel no Setor Oeste",
          tipo: "APARTAMENTO",
          finalidade: "ALUGUEL",
          preco: 2500,
          area: 85.0,
          quartos: 2,
          banheiros: 2,
          vagas: 1,
          endereco: "Avenida T-1, 890",
          bairro: "Setor Oeste",
          cidade: "Goiânia",
          estado: "GO",
          status: "ALUGADO",
          descricao:
            "Apartamento mobiliado com 2 quartos, 2 banheiros, sala, cozinha americana e 1 vaga de garagem. Próximo ao centro da cidade.",
          visualizacoes: 78,
          criadoEm: new Date("2024-10-05T14:30:00"),
          atualizadoEm: new Date("2024-12-15T11:20:00"),
          fotos: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          ],
        },
        {
          id: "4",
          titulo: "Terreno no Setor Sul",
          tipo: "TERRENO",
          finalidade: "VENDA",
          preco: 180000,
          area: 600.0,
          quartos: 0,
          banheiros: 0,
          vagas: 0,
          endereco: "Rua 135, Quadra 45, Lote 15",
          bairro: "Setor Sul",
          cidade: "Goiânia",
          estado: "GO",
          status: "DISPONIVEL",
          descricao:
            "Terreno plano de 600m² em área nobre, pronto para construção. Documentação regular e financiamento disponível.",
          visualizacoes: 32,
          criadoEm: new Date("2024-12-01T08:45:00"),
          atualizadoEm: new Date("2024-12-20T10:15:00"),
          fotos: [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          ],
        },
        {
          id: "5",
          titulo: "Casa de Luxo no Jardim América",
          tipo: "CASA",
          finalidade: "VENDA",
          preco: 1200000,
          area: 450.0,
          quartos: 5,
          banheiros: 4,
          vagas: 4,
          endereco: "Rua das Orquídeas, 123",
          bairro: "Jardim América",
          cidade: "Goiânia",
          estado: "GO",
          status: "DISPONIVEL",
          descricao:
            "Casa de alto padrão com 5 quartos, sendo 3 suítes, 4 banheiros, sala de cinema, área gourmet completa, piscina aquecida e 4 vagas de garagem.",
          visualizacoes: 156,
          criadoEm: new Date("2024-09-10T16:20:00"),
          atualizadoEm: new Date("2025-01-02T09:30:00"),
          fotos: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          ],
        },
        {
          id: "6",
          titulo: "Loft Moderno no Centro",
          tipo: "APARTAMENTO",
          finalidade: "ALUGUEL",
          preco: 1800,
          area: 60.0,
          quartos: 1,
          banheiros: 1,
          vagas: 1,
          endereco: "Rua 44, 789",
          bairro: "Centro",
          cidade: "Goiânia",
          estado: "GO",
          status: "DISPONIVEL",
          descricao:
            "Loft moderno totalmente mobiliado no centro de Goiânia. Ideal para executivos.",
          visualizacoes: 89,
          criadoEm: new Date("2024-11-15T12:10:00"),
          atualizadoEm: new Date("2024-12-30T15:45:00"),
        },
      ];

      setImoveis(imoveisSimulados);
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

  const imoveisFiltrados = imoveis.filter((imovel) => {
    const matchTipo = filtroTipo === "TODOS" || imovel.tipo === filtroTipo;
    const matchFinalidade =
      filtroFinalidade === "TODAS" || imovel.finalidade === filtroFinalidade;
    const matchStatus =
      filtroStatus === "TODOS" || imovel.status === filtroStatus;
    const matchBusca =
      busca === "" ||
      imovel.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      imovel.bairro.toLowerCase().includes(busca.toLowerCase()) ||
      imovel.endereco.toLowerCase().includes(busca.toLowerCase());

    return matchTipo && matchFinalidade && matchStatus && matchBusca;
  });

  const getImoveisByTab = () => {
    switch (activeTab) {
      case "disponiveis":
        return imoveisFiltrados.filter(
          (imovel) => imovel.status === "DISPONIVEL",
        );
      case "vendidos":
        return imoveisFiltrados.filter((imovel) => imovel.status === "VENDIDO");
      case "alugados":
        return imoveisFiltrados.filter((imovel) => imovel.status === "ALUGADO");
      default:
        return imoveisFiltrados;
    }
  };

  const stats = {
    total: imoveis.length,
    disponiveis: imoveis.filter((i) => i.status === "DISPONIVEL").length,
    vendidos: imoveis.filter((i) => i.status === "VENDIDO").length,
    alugados: imoveis.filter((i) => i.status === "ALUGADO").length,
    valorTotal: imoveis
      .filter((i) => i.status === "DISPONIVEL")
      .reduce((acc, i) => acc + i.preco, 0),
    visualizacaoMedia:
      imoveis.length > 0
        ? Math.round(
            imoveis.reduce((acc, i) => acc + i.visualizacoes, 0) /
              imoveis.length,
          )
        : 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DISPONIVEL":
        return "default";
      case "VENDIDO":
        return "success";
      case "ALUGADO":
        return "secondary";
      case "RESERVADO":
        return "warning";
      case "INATIVO":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "CASA":
        return Home;
      case "APARTAMENTO":
        return Home;
      case "TERRENO":
        return MapPin;
      default:
        return Home;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando imóveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/corretor">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Meus Imóveis
              </h1>
              <p className="text-muted-foreground">
                Gerencie todo o seu portfólio de imóveis
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Imóvel
            </Button>
            <img
              src="https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=250"
              alt="Siqueira Campos Imóveis"
              className="h-12 w-auto dark:hidden"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatsCard
            title="Total"
            value={stats.total}
            icon={Home}
            color="blue"
          />
          <StatsCard
            title="Disponíveis"
            value={stats.disponiveis}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Vendidos"
            value={stats.vendidos}
            icon={DollarSign}
            color="yellow"
          />
          <StatsCard
            title="Alugados"
            value={stats.alugados}
            icon={Calendar}
            color="purple"
          />
          <StatsCard
            title="Valor Portfólio"
            value={formatarPreco(stats.valorTotal)}
            icon={TrendingUp}
            color="green"
            description="Disponíveis"
          />
          <StatsCard
            title="Visualizações"
            value={stats.visualizacaoMedia}
            icon={Eye}
            color="blue"
            description="Média por imóvel"
          />
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Buscar por título, bairro ou endereço..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os Tipos</SelectItem>
                    <SelectItem value="CASA">Casa</SelectItem>
                    <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                    <SelectItem value="TERRENO">Terreno</SelectItem>
                    <SelectItem value="COMERCIAL">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={filtroFinalidade}
                  onValueChange={setFiltroFinalidade}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Finalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas</SelectItem>
                    <SelectItem value="VENDA">Venda</SelectItem>
                    <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                    <SelectItem value="AMBOS">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os Status</SelectItem>
                    <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                    <SelectItem value="VENDIDO">Vendido</SelectItem>
                    <SelectItem value="ALUGADO">Alugado</SelectItem>
                    <SelectItem value="RESERVADO">Reservado</SelectItem>
                    <SelectItem value="INATIVO">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs com Imóveis */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todos">Todos ({stats.total})</TabsTrigger>
            <TabsTrigger value="disponiveis">
              Disponíveis ({stats.disponiveis})
            </TabsTrigger>
            <TabsTrigger value="vendidos">
              Vendidos ({stats.vendidos})
            </TabsTrigger>
            <TabsTrigger value="alugados">
              Alugados ({stats.alugados})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "todos" && "Todos os Imóveis"}
                  {activeTab === "disponiveis" && "Imóveis Disponíveis"}
                  {activeTab === "vendidos" && "Imóveis Vendidos"}
                  {activeTab === "alugados" && "Imóveis Alugados"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getImoveisByTab().map((imovel) => {
                    const IconeTipo = getTipoIcon(imovel.tipo);
                    return (
                      <div
                        key={imovel.id}
                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Imagem */}
                        <div className="relative h-48 bg-muted">
                          {imovel.fotos && imovel.fotos[0] ? (
                            <img
                              src={imovel.fotos[0]}
                              alt={imovel.titulo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IconeTipo className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <Badge
                              variant={getStatusColor(imovel.status) as any}
                            >
                              {imovel.status}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge variant="outline" className="bg-white/90">
                              {imovel.finalidade}
                            </Badge>
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <div className="flex items-center space-x-1 text-white text-xs bg-black/60 rounded px-2 py-1">
                              <Eye className="h-3 w-3" />
                              <span>{imovel.visualizacoes}</span>
                            </div>
                          </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-6">
                          <div className="mb-4">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2">
                              {imovel.titulo}
                            </h3>
                            <p className="text-muted-foreground flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              {imovel.endereco}, {imovel.bairro}
                            </p>
                          </div>

                          {/* Características */}
                          {imovel.tipo !== "TERRENO" && (
                            <div className="flex items-center space-x-4 mb-4 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Bed className="h-4 w-4 mr-1" />
                                {imovel.quartos} quartos
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <Bath className="h-4 w-4 mr-1" />
                                {imovel.banheiros} banheiros
                              </div>
                              {imovel.vagas && imovel.vagas > 0 && (
                                <div className="flex items-center text-muted-foreground">
                                  <Car className="h-4 w-4 mr-1" />
                                  {imovel.vagas} vagas
                                </div>
                              )}
                            </div>
                          )}

                          {/* Área */}
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground">
                              Área: {imovel.area}m²
                            </p>
                          </div>

                          {/* Preço e Ações */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-primary">
                                {formatarPreco(imovel.preco)}
                                {imovel.finalidade === "ALUGUEL" && (
                                  <span className="text-sm font-normal text-muted-foreground">
                                    /mês
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline">{imovel.tipo}</Badge>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Informações adicionais */}
                          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>
                                Criado:{" "}
                                {imovel.criadoEm.toLocaleDateString("pt-BR")}
                              </span>
                              <span>
                                Atualizado:{" "}
                                {imovel.atualizadoEm.toLocaleDateString(
                                  "pt-BR",
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {getImoveisByTab().length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        Nenhum imóvel encontrado com os filtros aplicados
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
