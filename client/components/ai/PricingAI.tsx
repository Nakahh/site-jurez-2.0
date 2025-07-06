import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  MapPin,
  Home,
  DollarSign,
  Activity,
  Settings,
  RefreshCw,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Calculator,
  Database,
  Cpu,
} from "lucide-react";

interface AvaliacaoIA {
  id: string;
  imovelId: string;
  endereco: string;
  tipo: string;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  precoSugerido: number;
  precoMinimo: number;
  precoMaximo: number;
  confianca: number;
  fatoresInfluencia: FatorInfluencia[];
  comparaveis: Comparavel[];
  tendenciaMercado: string;
  dataAvaliacao: Date;
  status: "PROCESSANDO" | "CONCLUIDA" | "ERRO";
}

interface FatorInfluencia {
  fator: string;
  impacto: number;
  descricao: string;
  categoria: "POSITIVO" | "NEGATIVO" | "NEUTRO";
}

interface Comparavel {
  id: string;
  endereco: string;
  preco: number;
  area: number;
  similaridade: number;
  distancia: number;
  dataVenda: Date;
}

interface ConfiguracaoIA {
  modeloAtivo: string;
  precisaoMinima: number;
  atualizacaoAutomatica: boolean;
  fontesDados: string[];
  intervaloAnalise: number;
  alertasPreco: boolean;
  comparaveisMinimos: number;
  raioComparacao: number;
}

interface DadosMercado {
  regiao: string;
  precoMedio: number;
  variacao: number;
  volumeVendas: number;
  tempoMedioVenda: number;
  tendencia: "ALTA" | "BAIXA" | "ESTAVEL";
}

const dadosMercadoSimulados: DadosMercado[] = [
  {
    regiao: "Setor Bueno",
    precoMedio: 8500,
    variacao: 2.3,
    volumeVendas: 45,
    tempoMedioVenda: 62,
    tendencia: "ALTA",
  },
  {
    regiao: "Setor Oeste",
    precoMedio: 7200,
    variacao: -1.2,
    volumeVendas: 38,
    tempoMedioVenda: 78,
    tendencia: "BAIXA",
  },
  {
    regiao: "Jardim Goiás",
    precoMedio: 9800,
    variacao: 0.8,
    volumeVendas: 52,
    tempoMedioVenda: 45,
    tendencia: "ESTAVEL",
  },
];

const tendenciasPreco = [
  { mes: "Jan", precoMedio: 7500, volume: 120 },
  { mes: "Fev", precoMedio: 7650, volume: 135 },
  { mes: "Mar", precoMedio: 7800, volume: 142 },
  { mes: "Abr", precoMedio: 7750, volume: 128 },
  { mes: "Mai", precoMedio: 7900, volume: 155 },
  { mes: "Jun", precoMedio: 8100, volume: 168 },
];

export default function PricingAI() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoIA[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoIA>({
    modeloAtivo: "modelo_v2_premium",
    precisaoMinima: 85,
    atualizacaoAutomatica: true,
    fontesDados: ["FIPE", "CRECI", "PORTAL_IMOVEIS"],
    intervaloAnalise: 24,
    alertasPreco: true,
    comparaveisMinimos: 5,
    raioComparacao: 2,
  });

  const [novaAvaliacao, setNovaAvaliacao] = useState({
    endereco: "",
    tipo: "",
    area: "",
    quartos: "",
    banheiros: "",
    vagas: "",
  });

  const [loading, setLoading] = useState(true);
  const [processandoAvaliacao, setProcessandoAvaliacao] = useState(false);
  const [stats, setStats] = useState({
    avaliacoesProcessadas: 0,
    precisaoMedia: 0,
    economiaTempo: 0,
    precosPreditos: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        const avaliacoesSimuladas: AvaliacaoIA[] = [
          {
            id: "1",
            imovelId: "imovel1",
            endereco: "Rua T-25, 123 - Setor Bueno",
            tipo: "APARTAMENTO",
            area: 120,
            quartos: 3,
            banheiros: 2,
            vagas: 2,
            precoSugerido: 450000,
            precoMinimo: 420000,
            precoMaximo: 480000,
            confianca: 92,
            fatoresInfluencia: [
              {
                fator: "Localização privilegiada",
                impacto: 15,
                descricao: "Proximidade com centros comerciais",
                categoria: "POSITIVO",
              },
              {
                fator: "Idade do imóvel",
                impacto: -8,
                descricao: "Construção de 2015",
                categoria: "NEGATIVO",
              },
            ],
            comparaveis: [
              {
                id: "c1",
                endereco: "Rua T-23, 456",
                preco: 445000,
                area: 118,
                similaridade: 94,
                distancia: 0.3,
                dataVenda: new Date(),
              },
            ],
            tendenciaMercado: "ALTA",
            dataAvaliacao: new Date(),
            status: "CONCLUIDA",
          },
        ];

        const statsSimuladas = {
          avaliacoesProcessadas: 125,
          precisaoMedia: 91.5,
          economiaTempo: 480,
          precosPreditos: 89,
        };

        setAvaliacoes(avaliacoesSimuladas);
        setStats(statsSimuladas);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const processarAvaliacao = async () => {
    setProcessandoAvaliacao(true);
    try {
      // Simular processamento de IA
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const novaAvaliacaoData: AvaliacaoIA = {
        id: Date.now().toString(),
        imovelId: Date.now().toString(),
        endereco: novaAvaliacao.endereco,
        tipo: novaAvaliacao.tipo,
        area: parseFloat(novaAvaliacao.area),
        quartos: parseInt(novaAvaliacao.quartos),
        banheiros: parseInt(novaAvaliacao.banheiros),
        vagas: parseInt(novaAvaliacao.vagas),
        precoSugerido: Math.floor(Math.random() * 500000) + 300000,
        precoMinimo: 0,
        precoMaximo: 0,
        confianca: Math.floor(Math.random() * 20) + 80,
        fatoresInfluencia: [],
        comparaveis: [],
        tendenciaMercado: "ALTA",
        dataAvaliacao: new Date(),
        status: "PROCESSANDO",
      };

      novaAvaliacaoData.precoMinimo = novaAvaliacaoData.precoSugerido * 0.9;
      novaAvaliacaoData.precoMaximo = novaAvaliacaoData.precoSugerido * 1.1;

      setAvaliacoes([novaAvaliacaoData, ...avaliacoes]);
      setNovaAvaliacao({
        endereco: "",
        tipo: "",
        area: "",
        quartos: "",
        banheiros: "",
        vagas: "",
      });

      // Simular conclusão do processamento
      setTimeout(() => {
        setAvaliacoes((prev) =>
          prev.map((avaliacao) =>
            avaliacao.id === novaAvaliacaoData.id
              ? { ...avaliacao, status: "CONCLUIDA" as const }
              : avaliacao,
          ),
        );
      }, 2000);
    } catch (error) {
      console.error("Erro ao processar avaliação:", error);
    } finally {
      setProcessandoAvaliacao(false);
    }
  };

  const salvarConfiguracao = async () => {
    try {
      console.log("Configuração salva:", configuracao);
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarNumero = (numero: number) => {
    return new Intl.NumberFormat("pt-BR").format(numero);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSANDO":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>
        );
      case "CONCLUIDA":
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case "ERRO":
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTendenciaBadge = (tendencia: string) => {
    switch (tendencia) {
      case "ALTA":
        return (
          <Badge className="bg-green-100 text-green-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            Alta
          </Badge>
        );
      case "BAIXA":
        return (
          <Badge className="bg-red-100 text-red-800">
            <TrendingDown className="w-3 h-3 mr-1" />
            Baixa
          </Badge>
        );
      case "ESTAVEL":
        return <Badge className="bg-blue-100 text-blue-800">Estável</Badge>;
      default:
        return <Badge variant="outline">{tendencia}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Carregando sistema de IA...</p>
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
            IA para Precificação
          </h2>
          <p className="text-slate-600">
            Avaliação automática de imóveis com inteligência artificial
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800">
            <Brain className="w-3 h-3 mr-1" />
            IA Ativa
          </Badge>
          <Button
            onClick={processarAvaliacao}
            disabled={processandoAvaliacao}
            className="bg-slate-600 hover:bg-slate-700"
          >
            {processandoAvaliacao ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Nova Avaliação
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações IA</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avaliacoesProcessadas}
            </div>
            <p className="text-xs text-slate-600">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Precisão Média
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.precisaoMedia}%</div>
            <p className="text-xs text-slate-600">Acurácia do modelo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Economia de Tempo
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.economiaTempo}h</div>
            <p className="text-xs text-slate-600">Horas economizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Preços Preditos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.precosPreditos}</div>
            <p className="text-xs text-slate-600">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="avaliacoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="mercado">Análise de Mercado</TabsTrigger>
          <TabsTrigger value="configuracao">Configuração IA</TabsTrigger>
          <TabsTrigger value="treinamento">Modelo & Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="avaliacoes" className="space-y-6">
          {/* Formulário Nova Avaliação */}
          <Card>
            <CardHeader>
              <CardTitle>Nova Avaliação por IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro"
                    value={novaAvaliacao.endereco}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        endereco: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={novaAvaliacao.tipo}
                    onValueChange={(value) =>
                      setNovaAvaliacao({ ...novaAvaliacao, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                      <SelectItem value="CASA">Casa</SelectItem>
                      <SelectItem value="KITNET">Kitnet</SelectItem>
                      <SelectItem value="COBERTURA">Cobertura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="120"
                    value={novaAvaliacao.area}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        area: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="quartos">Quartos</Label>
                  <Input
                    id="quartos"
                    type="number"
                    placeholder="3"
                    value={novaAvaliacao.quartos}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        quartos: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="banheiros">Banheiros</Label>
                  <Input
                    id="banheiros"
                    type="number"
                    placeholder="2"
                    value={novaAvaliacao.banheiros}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        banheiros: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vagas">Vagas</Label>
                  <Input
                    id="vagas"
                    type="number"
                    placeholder="2"
                    value={novaAvaliacao.vagas}
                    onChange={(e) =>
                      setNovaAvaliacao({
                        ...novaAvaliacao,
                        vagas: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Avaliações */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Preço Sugerido</TableHead>
                    <TableHead>Faixa de Preço</TableHead>
                    <TableHead>Confiança</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {avaliacoes.map((avaliacao) => (
                    <TableRow key={avaliacao.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{avaliacao.endereco}</p>
                          <p className="text-sm text-slate-600">
                            {avaliacao.tipo} • {avaliacao.area}m² •{" "}
                            {avaliacao.quartos}Q
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          {formatarValor(avaliacao.precoSugerido)}
                        </div>
                        <p className="text-sm text-slate-600">
                          {formatarValor(
                            avaliacao.precoSugerido / avaliacao.area,
                          )}
                          /m²
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatarValor(avaliacao.precoMinimo)}</p>
                          <p>{formatarValor(avaliacao.precoMaximo)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={avaliacao.confianca}
                            className="w-16 h-2"
                          />
                          <span className="text-sm font-medium">
                            {avaliacao.confianca}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(avaliacao.status)}</TableCell>
                      <TableCell>
                        {avaliacao.dataAvaliacao.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
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
        </TabsContent>

        <TabsContent value="mercado" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendências de Preço */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Preço</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tendenciasPreco}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="precoMedio"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Volume de Vendas */}
            <Card>
              <CardHeader>
                <CardTitle>Volume de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tendenciasPreco}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Dados por Região */}
          <Card>
            <CardHeader>
              <CardTitle>Análise por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Região</TableHead>
                    <TableHead>Preço Médio/m²</TableHead>
                    <TableHead>Variação</TableHead>
                    <TableHead>Volume Vendas</TableHead>
                    <TableHead>Tempo Médio Venda</TableHead>
                    <TableHead>Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosMercadoSimulados.map((regiao) => (
                    <TableRow key={regiao.regiao}>
                      <TableCell className="font-medium">
                        {regiao.regiao}
                      </TableCell>
                      <TableCell>{formatarValor(regiao.precoMedio)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            regiao.variacao > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {regiao.variacao > 0 ? "+" : ""}
                          {regiao.variacao}%
                        </span>
                      </TableCell>
                      <TableCell>{regiao.volumeVendas}</TableCell>
                      <TableCell>{regiao.tempoMedioVenda} dias</TableCell>
                      <TableCell>
                        {getTendenciaBadge(regiao.tendencia)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Modelo de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="modelo">Modelo Ativo</Label>
                  <Select
                    value={configuracao.modeloAtivo}
                    onValueChange={(value) =>
                      setConfiguracao({ ...configuracao, modeloAtivo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modelo_v1_basico">
                        Modelo v1 Básico
                      </SelectItem>
                      <SelectItem value="modelo_v2_premium">
                        Modelo v2 Premium
                      </SelectItem>
                      <SelectItem value="modelo_v3_experimental">
                        Modelo v3 Experimental
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="precisaoMinima">Precisão Mínima (%)</Label>
                  <Input
                    id="precisaoMinima"
                    type="number"
                    min="70"
                    max="99"
                    value={configuracao.precisaoMinima}
                    onChange={(e) =>
                      setConfiguracao({
                        ...configuracao,
                        precisaoMinima: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="comparaveisMinimos">
                    Comparáveis Mínimos
                  </Label>
                  <Input
                    id="comparaveisMinimos"
                    type="number"
                    min="3"
                    max="20"
                    value={configuracao.comparaveisMinimos}
                    onChange={(e) =>
                      setConfiguracao({
                        ...configuracao,
                        comparaveisMinimos: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="raioComparacao">
                    Raio de Comparação (km)
                  </Label>
                  <Input
                    id="raioComparacao"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={configuracao.raioComparacao}
                    onChange={(e) =>
                      setConfiguracao({
                        ...configuracao,
                        raioComparacao: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Atualização Automática</Label>
                    <p className="text-sm text-slate-600">
                      Atualizar preços automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={configuracao.atualizacaoAutomatica}
                    onCheckedChange={(checked) =>
                      setConfiguracao({
                        ...configuracao,
                        atualizacaoAutomatica: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Preço</Label>
                    <p className="text-sm text-slate-600">
                      Notificar sobre variações significativas
                    </p>
                  </div>
                  <Switch
                    checked={configuracao.alertasPreco}
                    onCheckedChange={(checked) =>
                      setConfiguracao({
                        ...configuracao,
                        alertasPreco: checked,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={salvarConfiguracao} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treinamento" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status do Modelo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Última atualização:</span>
                  <span className="font-semibold">Hoje, 08:30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Dados de treinamento:</span>
                  <span className="font-semibold">45.892 imóveis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Acurácia atual:</span>
                  <span className="font-semibold text-green-600">91.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Próximo treinamento:</span>
                  <span className="font-semibold">Em 6 dias</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fontes de Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">FIPE ZAP:</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">CRECI-GO:</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Portal Imóveis:</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Cartório de Registro:</span>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Database className="w-4 h-4 mr-2" />
                  Gerenciar Fontes
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance do Modelo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">91.5%</div>
                  <p className="text-sm text-slate-600">Precisão Geral</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">2.3s</div>
                  <p className="text-sm text-slate-600">Tempo Médio</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    99.8%
                  </div>
                  <p className="text-sm text-slate-600">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
