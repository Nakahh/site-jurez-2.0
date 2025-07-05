import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Scale,
  Brain,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Calculator,
  Eye,
  Heart,
  Share2,
  X,
  Zap,
  Target,
  DollarSign,
} from "lucide-react";

interface Property {
  id: string;
  titulo: string;
  preco: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  tipo: string;
  finalidade: string;
  foto: string;
  caracteristicas: string[];
  comodidades: string[];
  precoM2: number;
  valorEstimado?: number;
  potencialValorizacao?: number;
  scoreIA?: number;
}

interface ComparisonInsight {
  type: "price" | "location" | "amenities" | "investment" | "lifestyle";
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  winner?: string; // property ID
}

interface PropertyComparisonProps {
  properties: Property[];
  onRemoveProperty: (id: string) => void;
  onClearAll: () => void;
}

export function PropertyComparison({
  properties,
  onRemoveProperty,
  onClearAll,
}: PropertyComparisonProps) {
  const [insights, setInsights] = useState<ComparisonInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvancedComparison, setShowAdvancedComparison] = useState(false);

  useEffect(() => {
    if (properties.length >= 2) {
      generateInsights();
    }
  }, [properties]);

  const generateInsights = async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockInsights: ComparisonInsight[] = [
      {
        type: "price",
        title: "Melhor Custo-Benefício",
        description: `${properties[1]?.titulo} oferece melhor valor por m² (${formatPrice(properties[1]?.precoM2 || 0)}/m²)`,
        recommendation:
          "Considerando área e localização, oferece excelente relação custo-benefício",
        confidence: 87,
        winner: properties[1]?.id,
      },
      {
        type: "location",
        title: "Localização Estratégica",
        description: `${properties[0]?.titulo} está em bairro com maior valorização`,
        recommendation:
          "Jardim Goiás tem valorizado 8% ao ano, sendo melhor para investimento a longo prazo",
        confidence: 92,
        winner: properties[0]?.id,
      },
      {
        type: "amenities",
        title: "Infraestrutura e Comodidades",
        description:
          "Comparando amenidades disponíveis e qualidade de vida oferecida",
        recommendation:
          "Propriedades com área de lazer completa tendem a ter melhor aceitação no mercado",
        confidence: 84,
      },
      {
        type: "investment",
        title: "Potencial de Investimento",
        description:
          "Análise de ROI e potencial de valorização baseada em dados de mercado",
        recommendation:
          "Imóveis próximos a universidades têm maior demanda para locação",
        confidence: 78,
      },
    ];

    setInsights(mockInsights);
    setIsAnalyzing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPricePerM2 = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const hasFeature = (property: Property, feature: string) => {
    return (
      property.caracteristicas.includes(feature) ||
      property.comodidades.includes(feature)
    );
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "price":
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case "location":
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case "amenities":
        return <Star className="w-5 h-5 text-purple-600" />;
      case "investment":
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBestValue = (values: number[]) => {
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    return { maxValue, minValue };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  // Get all unique features for comparison
  const allFeatures = Array.from(
    new Set([
      ...properties.flatMap((p) => p.caracteristicas),
      ...properties.flatMap((p) => p.comodidades),
    ]),
  );

  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <Scale className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-amber-900 mb-2">
          Nenhum imóvel para comparar
        </h3>
        <p className="text-amber-700">
          Adicione pelo menos 2 imóveis para começar a comparação
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-900 flex items-center">
            <Scale className="w-6 h-6 mr-2" />
            Comparação Inteligente
          </h2>
          <p className="text-amber-600">
            {properties.length} imóveis selecionados para comparação
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedComparison(true)}
            className="border-purple-300 text-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            Análise IA
          </Button>
          <Button
            variant="outline"
            onClick={onClearAll}
            className="border-red-300 text-red-700"
          >
            Limpar Todos
          </Button>
        </div>
      </div>

      {/* Property Cards Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {properties.map((property) => (
          <Card key={property.id} className="border-amber-200 shadow-md">
            <div className="relative">
              <img
                src={property.foto}
                alt={property.titulo}
                className="w-full h-32 object-cover"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveProperty(property.id)}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
              {property.scoreIA && (
                <Badge
                  className={`absolute top-2 left-2 ${getScoreColor(property.scoreIA)}`}
                >
                  {property.scoreIA}% IA
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-amber-900 text-sm mb-2 line-clamp-2">
                {property.titulo}
              </h3>
              <div className="text-lg font-bold text-amber-900 mb-1">
                {formatPrice(property.preco)}
              </div>
              <div className="text-xs text-amber-600 mb-2">
                {formatPricePerM2(property.precoM2)}/m²
              </div>
              <div className="flex justify-between text-xs text-amber-700">
                <span>{property.quartos}q</span>
                <span>{property.banheiros}b</span>
                <span>{property.area}m²</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Comparison Table */}
      <Card className="border-amber-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-900">Comparação Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Característica</TableHead>
                  {properties.map((property, index) => (
                    <TableHead key={property.id} className="text-center">
                      Imóvel {index + 1}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Preço</TableCell>
                  {properties.map((property) => {
                    const prices = properties.map((p) => p.preco);
                    const { minValue } = getBestValue(prices);
                    const isBest = property.preco === minValue;
                    return (
                      <TableCell
                        key={property.id}
                        className={`text-center ${isBest ? "bg-green-50 font-bold text-green-800" : ""}`}
                      >
                        {formatPrice(property.preco)}
                        {isBest && (
                          <CheckCircle className="w-4 h-4 inline ml-1" />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Preço/m²</TableCell>
                  {properties.map((property) => {
                    const prices = properties.map((p) => p.precoM2);
                    const { minValue } = getBestValue(prices);
                    const isBest = property.precoM2 === minValue;
                    return (
                      <TableCell
                        key={property.id}
                        className={`text-center ${isBest ? "bg-green-50 font-bold text-green-800" : ""}`}
                      >
                        {formatPricePerM2(property.precoM2)}
                        {isBest && (
                          <CheckCircle className="w-4 h-4 inline ml-1" />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Área</TableCell>
                  {properties.map((property) => {
                    const areas = properties.map((p) => p.area);
                    const { maxValue } = getBestValue(areas);
                    const isBest = property.area === maxValue;
                    return (
                      <TableCell
                        key={property.id}
                        className={`text-center ${isBest ? "bg-green-50 font-bold text-green-800" : ""}`}
                      >
                        {property.area}m²
                        {isBest && (
                          <CheckCircle className="w-4 h-4 inline ml-1" />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Quartos</TableCell>
                  {properties.map((property) => (
                    <TableCell key={property.id} className="text-center">
                      {property.quartos}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Banheiros</TableCell>
                  {properties.map((property) => (
                    <TableCell key={property.id} className="text-center">
                      {property.banheiros}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Vagas</TableCell>
                  {properties.map((property) => (
                    <TableCell key={property.id} className="text-center">
                      {property.vagas || 0}
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Bairro</TableCell>
                  {properties.map((property) => (
                    <TableCell key={property.id} className="text-center">
                      {property.bairro}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card className="border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Insights da Inteligência Artificial
              {isAnalyzing && <div className="ml-2 animate-spin">⚡</div>}
            </CardTitle>
            <p className="text-purple-600">
              Análise baseada em dados de mercado e padrões de comportamento
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 border border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50"
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-purple-700 mb-2">
                        {insight.description}
                      </p>
                      <p className="text-xs text-purple-600 mb-3">
                        {insight.recommendation}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-purple-600">
                            Confiança:
                          </span>
                          <Progress
                            value={insight.confidence}
                            className="w-16 h-2"
                          />
                          <span className="text-xs font-medium text-purple-800">
                            {insight.confidence}%
                          </span>
                        </div>
                        {insight.winner && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Star className="w-3 h-3 mr-1" />
                            Recomendado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Comparison */}
      {allFeatures.length > 0 && (
        <Card className="border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-amber-900">
              Características e Comodidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Característica</TableHead>
                    {properties.map((property, index) => (
                      <TableHead key={property.id} className="text-center">
                        Imóvel {index + 1}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allFeatures.slice(0, 10).map((feature) => (
                    <TableRow key={feature}>
                      <TableCell className="font-medium">{feature}</TableCell>
                      {properties.map((property) => (
                        <TableCell key={property.id} className="text-center">
                          {hasFeature(property, feature) ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          <Calculator className="w-4 h-4 mr-2" />
          Simular Financiamento
        </Button>
        <Button variant="outline" className="border-amber-300 text-amber-700">
          <Heart className="w-4 h-4 mr-2" />
          Favoritar Selecionados
        </Button>
        <Button variant="outline" className="border-amber-300 text-amber-700">
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar Comparação
        </Button>
      </div>

      {/* Advanced Comparison Dialog */}
      <Dialog
        open={showAdvancedComparison}
        onOpenChange={setShowAdvancedComparison}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Análise Avançada com IA
            </DialogTitle>
            <DialogDescription>
              Comparação detalhada com insights de mercado e recomendações
              personalizadas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Detailed scoring for each property */}
            {properties.map((property, index) => (
              <Card key={property.id} className="border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900">
                    Análise: {property.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Score IA Geral</h4>
                      <div className="flex items-center space-x-2 mb-4">
                        <Progress
                          value={property.scoreIA || 85}
                          className="flex-1"
                        />
                        <span className="font-bold">
                          {property.scoreIA || 85}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-purple-600">
                            Custo-Benefício:
                          </span>
                          <Progress value={88} className="mt-1" />
                        </div>
                        <div>
                          <span className="text-sm text-purple-600">
                            Localização:
                          </span>
                          <Progress value={92} className="mt-1" />
                        </div>
                        <div>
                          <span className="text-sm text-purple-600">
                            Potencial Valorização:
                          </span>
                          <Progress value={76} className="mt-1" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Recomendação IA</h4>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-purple-700">
                          {index === 0
                            ? "Excelente localização com alto potencial de valorização. Ideal para investimento a longo prazo."
                            : "Ótimo custo-benefício com boa estrutura. Recomendado para moradia própria."}
                        </p>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Pontos Fortes:</h5>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-2" />
                            Localização valorizada
                          </li>
                          <li className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-2" />
                            Boa estrutura predial
                          </li>
                          <li className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-2" />
                            Preço competitivo
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedComparison(false)}
              >
                Fechar
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Eye className="w-4 h-4 mr-2" />
                Ver Recomendação Final
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
