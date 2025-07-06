import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Camera,
  Video,
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
  Download,
  Upload,
  Share2,
  MapPin,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Settings,
  Monitor,
  Smartphone,
  Headphones,
  Globe,
  BarChart3,
  Calendar,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

interface TourVirtual {
  id: string;
  titulo: string;
  imovelId: string;
  imovelTitulo: string;
  endereco: string;
  status: "CRIANDO" | "PROCESSANDO" | "ATIVO" | "INATIVO" | "ERRO";
  tipoTour: "360_FOTO" | "360_VIDEO" | "INTERATIVO" | "REALIDADE_VIRTUAL";
  duracao: number;
  totalComodos: number;
  qualidade: "HD" | "FULL_HD" | "4K" | "8K";
  criadoEm: Date;
  atualizadoEm: Date;
  visualizacoes: number;
  tempoMedioVisita: number;
  taxaEngajamento: number;
  compartilhamentos: number;
  pontos: PontoInterativo[];
  configuracoes: ConfiguracaoTour;
  urlPublica: string;
  urlEmbed: string;
}

interface PontoInterativo {
  id: string;
  comodo: string;
  posicaoX: number;
  posicaoY: number;
  tipo: "INFORMACAO" | "NAVEGACAO" | "DESTAQUE" | "MULTIMEDIA";
  titulo: string;
  descricao: string;
  conteudo?: string;
  linkDestino?: string;
  icone: string;
  cor: string;
  ativo: boolean;
}

interface ConfiguracaoTour {
  autoPlay: boolean;
  mostrarControles: boolean;
  permitirFullscreen: boolean;
  sobreposicaoLogo: boolean;
  musicaFundo: boolean;
  narracaoVoz: boolean;
  idiomas: string[];
  qualidadeAdaptiva: boolean;
  analytics: boolean;
  leadCapture: boolean;
}

interface AnalyticsTour {
  visualizacoesDiarias: number[];
  tempoMedioSessao: number;
  paginasMaisVistas: string[];
  dispositivosUtilizados: { [key: string]: number };
  origemVisitas: { [key: string]: number };
  taxaConversao: number;
  leadsGerados: number;
}

interface Equipamento {
  id: string;
  nome: string;
  tipo: "CAMERA_360" | "DRONE" | "GIMBAL" | "MICROFONE" | "ILUMINACAO";
  marca: string;
  modelo: string;
  status: "DISPONIVEL" | "EM_USO" | "MANUTENCAO" | "INDISPONIVEL";
  ultimoUso: Date;
  proximaManutencao: Date;
  bateria?: number;
  observacoes?: string;
}

export default function VirtualTour360() {
  const [tours, setTours] = useState<TourVirtual[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsTour>({
    visualizacoesDiarias: [45, 52, 38, 67, 78, 65, 84],
    tempoMedioSessao: 4.2,
    paginasMaisVistas: ["Sala de Estar", "Quarto Master", "Cozinha"],
    dispositivosUtilizados: { Desktop: 45, Mobile: 35, Tablet: 20 },
    origemVisitas: { Direto: 40, Redes_Sociais: 35, Site: 25 },
    taxaConversao: 12.5,
    leadsGerados: 23,
  });

  const [novoTour, setNovoTour] = useState({
    titulo: "",
    imovelId: "",
    tipoTour: "360_FOTO",
    qualidade: "FULL_HD",
    comodos: "",
  });

  const [novoPonto, setNovoPonto] = useState({
    comodo: "",
    tipo: "INFORMACAO",
    titulo: "",
    descricao: "",
    posicaoX: 50,
    posicaoY: 50,
  });

  const [loading, setLoading] = useState(true);
  const [criandoTour, setCriandoTour] = useState(false);
  const [modalNovoTour, setModalNovoTour] = useState(false);
  const [modalPontos, setModalPontos] = useState(false);
  const [tourSelecionado, setTourSelecionado] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        const toursSimulados: TourVirtual[] = [
          {
            id: "1",
            titulo: "Tour Virtual - Apartamento Setor Bueno",
            imovelId: "imovel1",
            imovelTitulo: "Apartamento 301 - Setor Bueno",
            endereco: "Rua T-25, 123 - Setor Bueno",
            status: "ATIVO",
            tipoTour: "360_FOTO",
            duracao: 8.5,
            totalComodos: 6,
            qualidade: "4K",
            criadoEm: new Date(),
            atualizadoEm: new Date(),
            visualizacoes: 245,
            tempoMedioVisita: 4.2,
            taxaEngajamento: 78,
            compartilhamentos: 12,
            pontos: [],
            configuracoes: {
              autoPlay: false,
              mostrarControles: true,
              permitirFullscreen: true,
              sobreposicaoLogo: true,
              musicaFundo: false,
              narracaoVoz: true,
              idiomas: ["pt-BR", "en-US"],
              qualidadeAdaptiva: true,
              analytics: true,
              leadCapture: true,
            },
            urlPublica: "https://tour.siqueicampos.com.br/tour/1",
            urlEmbed: "https://tour.siqueicampos.com.br/embed/1",
          },
        ];

        const equipamentosSimulados: Equipamento[] = [
          {
            id: "1",
            nome: "Insta360 Pro 2",
            tipo: "CAMERA_360",
            marca: "Insta360",
            modelo: "Pro 2",
            status: "DISPONIVEL",
            ultimoUso: new Date(),
            proximaManutencao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            bateria: 85,
            observacoes: "Última calibração em 15/01/2024",
          },
          {
            id: "2",
            nome: "DJI Mavic Air 2",
            tipo: "DRONE",
            marca: "DJI",
            modelo: "Mavic Air 2",
            status: "EM_USO",
            ultimoUso: new Date(),
            proximaManutencao: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            bateria: 62,
          },
        ];

        setTours(toursSimulados);
        setEquipamentos(equipamentosSimulados);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const criarTour = async () => {
    setCriandoTour(true);
    try {
      // Simular criação e processamento
      const tourId = Date.now().toString();

      // Simular upload com progresso
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const novoTourData: TourVirtual = {
        id: tourId,
        titulo: novoTour.titulo,
        imovelId: novoTour.imovelId,
        imovelTitulo: `Imóvel ${novoTour.imovelId}`,
        endereco: "Endereço do imóvel",
        status: "PROCESSANDO",
        tipoTour: novoTour.tipoTour as any,
        duracao: 0,
        totalComodos: parseInt(novoTour.comodos),
        qualidade: novoTour.qualidade as any,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        visualizacoes: 0,
        tempoMedioVisita: 0,
        taxaEngajamento: 0,
        compartilhamentos: 0,
        pontos: [],
        configuracoes: {
          autoPlay: false,
          mostrarControles: true,
          permitirFullscreen: true,
          sobreposicaoLogo: true,
          musicaFundo: false,
          narracaoVoz: false,
          idiomas: ["pt-BR"],
          qualidadeAdaptiva: true,
          analytics: true,
          leadCapture: false,
        },
        urlPublica: `https://tour.siqueicampos.com.br/tour/${tourId}`,
        urlEmbed: `https://tour.siqueicampos.com.br/embed/${tourId}`,
      };

      setTours([novoTourData, ...tours]);
      setModalNovoTour(false);
      setUploadProgress(0);
      resetFormulario();

      // Simular conclusão do processamento
      setTimeout(() => {
        setTours((prev) =>
          prev.map((tour) =>
            tour.id === tourId
              ? { ...tour, status: "ATIVO" as const, duracao: 6.8 }
              : tour,
          ),
        );
      }, 3000);
    } catch (error) {
      console.error("Erro ao criar tour:", error);
    } finally {
      setCriandoTour(false);
    }
  };

  const resetFormulario = () => {
    setNovoTour({
      titulo: "",
      imovelId: "",
      tipoTour: "360_FOTO",
      qualidade: "FULL_HD",
      comodos: "",
    });
  };

  const adicionarPonto = () => {
    const ponto: PontoInterativo = {
      id: Date.now().toString(),
      comodo: novoPonto.comodo,
      posicaoX: novoPonto.posicaoX,
      posicaoY: novoPonto.posicaoY,
      tipo: novoPonto.tipo as any,
      titulo: novoPonto.titulo,
      descricao: novoPonto.descricao,
      icone: "info",
      cor: "#3b82f6",
      ativo: true,
    };

    if (tourSelecionado) {
      setTours((prev) =>
        prev.map((tour) =>
          tour.id === tourSelecionado
            ? { ...tour, pontos: [...tour.pontos, ponto] }
            : tour,
        ),
      );
    }

    setNovoPonto({
      comodo: "",
      tipo: "INFORMACAO",
      titulo: "",
      descricao: "",
      posicaoX: 50,
      posicaoY: 50,
    });
  };

  const compartilharTour = (tour: TourVirtual) => {
    navigator.clipboard.writeText(tour.urlPublica);
  };

  const formatarDuracao = (minutos: number) => {
    const min = Math.floor(minutos);
    const seg = Math.floor((minutos - min) * 60);
    return `${min}:${seg.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CRIANDO":
        return <Badge className="bg-blue-100 text-blue-800">Criando</Badge>;
      case "PROCESSANDO":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>
        );
      case "ATIVO":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "INATIVO":
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case "ERRO":
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEquipamentoStatusBadge = (status: string) => {
    switch (status) {
      case "DISPONIVEL":
        return (
          <Badge className="bg-green-100 text-green-800">Disponível</Badge>
        );
      case "EM_USO":
        return <Badge className="bg-blue-100 text-blue-800">Em Uso</Badge>;
      case "MANUTENCAO":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>
        );
      case "INDISPONIVEL":
        return <Badge className="bg-red-100 text-red-800">Indisponível</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Carregando tours virtuais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Tours Virtuais 360°
          </h2>
          <p className="text-slate-600">
            Cria��ão e gestão de experiências imersivas
          </p>
        </div>
        <Dialog open={modalNovoTour} onOpenChange={setModalNovoTour}>
          <DialogTrigger asChild>
            <Button className="bg-slate-600 hover:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Tour Virtual</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título do Tour</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Tour Virtual - Apartamento Setor Bueno"
                    value={novoTour.titulo}
                    onChange={(e) =>
                      setNovoTour({ ...novoTour, titulo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="imovelId">ID do Imóvel</Label>
                  <Input
                    id="imovelId"
                    placeholder="imovel123"
                    value={novoTour.imovelId}
                    onChange={(e) =>
                      setNovoTour({ ...novoTour, imovelId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tipoTour">Tipo de Tour</Label>
                  <Select
                    value={novoTour.tipoTour}
                    onValueChange={(value) =>
                      setNovoTour({ ...novoTour, tipoTour: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="360_FOTO">360° Fotos</SelectItem>
                      <SelectItem value="360_VIDEO">360° Vídeo</SelectItem>
                      <SelectItem value="INTERATIVO">
                        Tour Interativo
                      </SelectItem>
                      <SelectItem value="REALIDADE_VIRTUAL">
                        Realidade Virtual
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="qualidade">Qualidade</Label>
                  <Select
                    value={novoTour.qualidade}
                    onValueChange={(value) =>
                      setNovoTour({ ...novoTour, qualidade: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HD">HD (720p)</SelectItem>
                      <SelectItem value="FULL_HD">Full HD (1080p)</SelectItem>
                      <SelectItem value="4K">4K (2160p)</SelectItem>
                      <SelectItem value="8K">8K (4320p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="comodos">Número de Cômodos</Label>
                  <Input
                    id="comodos"
                    type="number"
                    placeholder="6"
                    value={novoTour.comodos}
                    onChange={(e) =>
                      setNovoTour({ ...novoTour, comodos: e.target.value })
                    }
                  />
                </div>
              </div>

              {criandoTour && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Upload em progresso...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setModalNovoTour(false)}
                  disabled={criandoTour}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={criarTour}
                  disabled={criandoTour || !novoTour.titulo}
                >
                  {criandoTour ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Criar Tour
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tours Ativos</CardTitle>
            <Camera className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tours.filter((t) => t.status === "ATIVO").length}
            </div>
            <p className="text-xs text-slate-600">Em funcionamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tours.reduce((acc, tour) => acc + tour.visualizacoes, 0)}
            </div>
            <p className="text-xs text-slate-600">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.tempoMedioSessao}min
            </div>
            <p className="text-xs text-slate-600">Por sessão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.taxaConversao}%</div>
            <p className="text-xs text-slate-600">Visitantes → Leads</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tours" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tours">Meus Tours</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="tours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tours Virtuais</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tour</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visualizações</TableHead>
                    <TableHead>Engajamento</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tours.map((tour) => (
                    <TableRow key={tour.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tour.titulo}</p>
                          <p className="text-sm text-slate-600">
                            {tour.endereco} • {tour.totalComodos} cômodos
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tour.tipoTour}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(tour.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tour.visualizacoes}</p>
                          <p className="text-sm text-slate-600">
                            {formatarDuracao(tour.tempoMedioVisita)} médio
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={tour.taxaEngajamento}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {tour.taxaEngajamento}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tour.atualizadoEm.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => compartilharTour(tour)}
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTourSelecionado(tour.id);
                              setModalPontos(true);
                            }}
                          >
                            <MapPin className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Modal Pontos Interativos */}
          <Dialog open={modalPontos} onOpenChange={setModalPontos}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Pontos Interativos</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="comodo">Cômodo</Label>
                    <Input
                      id="comodo"
                      placeholder="Sala de Estar"
                      value={novoPonto.comodo}
                      onChange={(e) =>
                        setNovoPonto({ ...novoPonto, comodo: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipoPonto">Tipo</Label>
                    <Select
                      value={novoPonto.tipo}
                      onValueChange={(value) =>
                        setNovoPonto({ ...novoPonto, tipo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INFORMACAO">Informação</SelectItem>
                        <SelectItem value="NAVEGACAO">Navegação</SelectItem>
                        <SelectItem value="DESTAQUE">Destaque</SelectItem>
                        <SelectItem value="MULTIMEDIA">Multimídia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tituloPonto">Título</Label>
                    <Input
                      id="tituloPonto"
                      placeholder="Título do ponto"
                      value={novoPonto.titulo}
                      onChange={(e) =>
                        setNovoPonto({ ...novoPonto, titulo: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricaoPonto">Descrição</Label>
                    <Input
                      id="descricaoPonto"
                      placeholder="Descrição"
                      value={novoPonto.descricao}
                      onChange={(e) =>
                        setNovoPonto({
                          ...novoPonto,
                          descricao: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={adicionarPonto}
                  disabled={!novoPonto.comodo || !novoPonto.titulo}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Ponto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Equipamentos</CardTitle>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Equipamento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bateria</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Próxima Manutenção</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipamentos.map((equipamento) => (
                    <TableRow key={equipamento.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{equipamento.nome}</p>
                          <p className="text-sm text-slate-600">
                            {equipamento.marca} {equipamento.modelo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{equipamento.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        {getEquipamentoStatusBadge(equipamento.status)}
                      </TableCell>
                      <TableCell>
                        {equipamento.bateria ? (
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={equipamento.bateria}
                              className="w-16 h-2"
                            />
                            <span className="text-sm">
                              {equipamento.bateria}%
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {equipamento.ultimoUso.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {equipamento.proximaManutencao.toLocaleDateString(
                          "pt-BR",
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Utilizados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.dispositivosUtilizados).map(
                  ([dispositivo, porcentagem]) => (
                    <div
                      key={dispositivo}
                      className="flex justify-between items-center"
                    >
                      <span className="text-slate-600">{dispositivo}:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={porcentagem} className="w-24 h-2" />
                        <span className="font-semibold">{porcentagem}%</span>
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Origem das Visitas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.origemVisitas).map(
                  ([origem, porcentagem]) => (
                    <div
                      key={origem}
                      className="flex justify-between items-center"
                    >
                      <span className="text-slate-600">
                        {origem.replace("_", " ")}:
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress value={porcentagem} className="w-24 h-2" />
                        <span className="font-semibold">{porcentagem}%</span>
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cômodos Mais Visitados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.paginasMaisVistas.map((comodo, index) => (
                  <div
                    key={comodo}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span>{comodo}</span>
                    </div>
                    <Badge variant="outline">
                      {Math.floor(Math.random() * 50) + 50}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Leads gerados:</span>
                  <span className="font-semibold">
                    {analytics.leadsGerados}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxa de conversão:</span>
                  <span className="font-semibold">
                    {analytics.taxaConversao}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tempo médio sessão:</span>
                  <span className="font-semibold">
                    {analytics.tempoMedioSessao} min
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">ROI estimado:</span>
                  <span className="font-semibold text-green-600">+245%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Globais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-play de tours</Label>
                      <p className="text-sm text-slate-600">
                        Iniciar automaticamente
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mostrar controles</Label>
                      <p className="text-sm text-slate-600">
                        Exibir barra de controle
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Permitir fullscreen</Label>
                      <p className="text-sm text-slate-600">
                        Botão de tela cheia
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sobreposição de logo</Label>
                      <p className="text-sm text-slate-600">
                        Marca d'água da empresa
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analytics avançado</Label>
                      <p className="text-sm text-slate-600">
                        Rastreamento detalhado
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Captura de leads</Label>
                      <p className="text-sm text-slate-600">
                        Formulário integrado
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
