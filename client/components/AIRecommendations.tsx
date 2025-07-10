import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  Target,
  MapPin,
  Heart,
  Eye,
  Zap,
  Star,
  ArrowRight,
  Sparkles,
  Calculator,
  Clock,
  Home as HomeIcon,
} from "lucide-react";
import { EnhancedPropertyCard } from "./EnhancedPropertyCard";

interface AIInsight {
  type: "price_trend" | "neighborhood" | "investment" | "lifestyle";
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

interface PropertyRecommendation {
  id: string;
  titulo: string;
  preco: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: any;
  finalidade: any;
  status: any;
  fotos: string[];
  destaque: boolean;
  caracteristicas: string[];
  precoM2: number;
  matchScore: number;
  aiReason: string;
}

interface AIRecommendationsProps {
  userPreferences?: {
    budget?: number;
    preferredNeighborhoods?: string[];
    propertyTypes?: string[];
    minRooms?: number;
    maxCommute?: number;
  };
  userBehavior?: {
    recentViews: string[];
    favorites: string[];
    searches: Array<{ term: string; timestamp: Date }>;
  };
}

export function AIRecommendations({
  userPreferences = {},
  userBehavior = { recentViews: [], favorites: [], searches: [] },
}: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<
    PropertyRecommendation[]
  >([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recommendations" | "insights">(
    "recommendations",
  );

  useEffect(() => {
    generateRecommendations();
  }, [userPreferences, userBehavior]);

  const generateRecommendations = async () => {
    setIsLoading(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI-generated insights
    const mockInsights: AIInsight[] = [
      {
        type: "price_trend",
        title: "Tendência de Valorização",
        description:
          "Imóveis no Jardim Goiás têm valorizado 8% ao ano nos últimos 3 anos. É um bom momento para investir.",
        confidence: 87,
        action: "Ver imóveis no Jardim Goiás",
      },
      {
        type: "neighborhood",
        title: "Bairro Recomendado",
        description:
          "Baseado no seu perfil, o Setor Oeste oferece o melhor custo-benefício para suas necessidades.",
        confidence: 92,
        action: "Explorar Setor Oeste",
      },
      {
        type: "investment",
        title: "Oportunidade de Investimento",
        description:
          "Apartamentos de 2 quartos para aluguel têm rentabilidade média de 0.7% ao mês em Goiânia.",
        confidence: 81,
        action: "Ver oportunidades",
      },
      {
        type: "lifestyle",
        title: "Compatibilidade de Estilo",
        description:
          "Com base em seus favoritos, você prefere imóveis modernos com área de lazer completa.",
        confidence: 95,
        action: "Ver imóveis similares",
      },
    ];

    // Mock AI-recommended properties
    const mockRecommendations: PropertyRecommendation[] = [
      {
        id: "ai-1",
        titulo: "Apartamento Inteligente no Jardim Goiás",
        preco: 420000,
        area: 110,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        endereco: "Rua das Orquídeas, 456",
        bairro: "Jardim Goiás",
        cidade: "Goiânia",
        tipo: "APARTAMENTO",
        finalidade: "VENDA",
        status: "DISPONIVEL",
        fotos: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
        ],
        destaque: true,
        caracteristicas: ["Smart Home", "Varanda Gourmet", "Academia"],
        precoM2: 3818,
        matchScore: 94,
        aiReason:
          "Alta compatibilidade com seu perfil: localização valorizada + amenidades modernas",
      },
      {
        id: "ai-2",
        titulo: "Casa com Potencial de Valorização",
        preco: 350000,
        area: 150,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        endereco: "Rua dos Ipês, 789",
        bairro: "Setor Oeste",
        cidade: "Goiânia",
        tipo: "CASA",
        finalidade: "VENDA",
        status: "DISPONIVEL",
        fotos: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
        ],
        destaque: false,
        caracteristicas: ["Quintal", "Garagem Coberta", "Área Gourmet"],
        precoM2: 2333,
        matchScore: 89,
        aiReason:
          "Excelente custo-benefício + bairro em crescimento + adequado ao seu orçamento",
      },
      {
        id: "ai-3",
        titulo: "Investimento Rentável na Aldeota",
        preco: 280000,
        area: 85,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        endereco: "Avenida Universitária, 321",
        bairro: "Aldeota",
        cidade: "Goiânia",
        tipo: "APARTAMENTO",
        finalidade: "VENDA",
        status: "DISPONIVEL",
        fotos: [
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop",
        ],
        destaque: false,
        caracteristicas: ["Próximo UFG", "Mobiliado", "Pronto para Alugar"],
        precoM2: 3294,
        matchScore: 85,
        aiReason:
          "Alto potencial de locação + proximidade universidade + ROI estimado 8.4% a.a.",
      },
    ];

    setInsights(mockInsights);
    setRecommendations(mockRecommendations);
    setIsLoading(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "price_trend":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "neighborhood":
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case "investment":
        return <Calculator className="w-5 h-5 text-purple-600" />;
      case "lifestyle":
        return <Heart className="w-5 h-5 text-pink-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-100";
    if (confidence >= 80) return "text-blue-600 bg-blue-100";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-amber-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-amber-900">
                  IA Analisando Suas Preferências
                </CardTitle>
                <p className="text-amber-600 text-sm">
                  Gerando recomendações personalizadas...
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-purple-500 animate-spin" />
                <span className="text-amber-700">
                  Analisando histórico de buscas
                </span>
              </div>
              <Progress value={33} className="h-2" />

              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="text-amber-700">
                  Identificando padrões de preferência
                </span>
              </div>
              <Progress value={66} className="h-2" />

              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-500 animate-bounce" />
                <span className="text-amber-700">
                  Gerando recomendações inteligentes
                </span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-amber-900">
            Recomendações da IA
          </h2>
        </div>
        <p className="text-xl text-amber-700 max-w-3xl mx-auto">
          Nossa inteligência artificial analisou seu perfil e selecionou os
          imóveis mais adequados para você
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 border border-amber-200 shadow-sm">
          <Button
            variant={activeTab === "recommendations" ? "default" : "ghost"}
            onClick={() => setActiveTab("recommendations")}
            className={`${
              activeTab === "recommendations"
                ? "bg-amber-600 text-white"
                : "text-amber-700"
            } transition-all`}
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Imóveis Recomendados
          </Button>
          <Button
            variant={activeTab === "insights" ? "default" : "ghost"}
            onClick={() => setActiveTab("insights")}
            className={`${
              activeTab === "insights"
                ? "bg-amber-600 text-white"
                : "text-amber-700"
            } transition-all`}
          >
            <Brain className="w-4 h-4 mr-2" />
            Insights do Mercado
          </Button>
        </div>
      </div>

      {activeTab === "recommendations" && (
        <div className="space-y-8">
          {recommendations.map((property, index) => (
            <div key={property.id} className="relative">
              <div className="absolute -left-4 top-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          <Star className="w-3 h-3 mr-1" />
                          {property.matchScore}% compatível
                        </Badge>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Sparkles className="w-3 h-3 mr-1" />
                          IA Recomenda
                        </Badge>
                      </div>
                      <CardTitle className="text-amber-900">
                        {property.titulo}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-900">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 0,
                        }).format(property.preco)}
                      </div>
                      <div className="text-sm text-amber-600">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(property.precoM2)}
                        /m²
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <img
                        src={property.fotos[0]}
                        alt={property.titulo}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <div className="space-y-4">
                        <div className="flex items-center text-amber-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {property.endereco}, {property.bairro}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-amber-700">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {property.quartos}
                            </span>
                            <span className="ml-1">quartos</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {property.banheiros}
                            </span>
                            <span className="ml-1">banheiros</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">{property.area}</span>
                            <span className="ml-1">m²</span>
                          </div>
                          {property.vagas && (
                            <div className="flex items-center">
                              <span className="font-medium">
                                {property.vagas}
                              </span>
                              <span className="ml-1">vagas</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-start space-x-3">
                            <Brain className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-purple-900 mb-1">
                                Por que a IA recomenda:
                              </h4>
                              <p className="text-purple-700 text-sm">
                                {property.aiReason}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {property.caracteristicas
                            .slice(0, 3)
                            .map((caracteristica) => (
                              <Badge
                                key={caracteristica}
                                variant="secondary"
                                className="bg-amber-100 text-amber-800"
                              >
                                {caracteristica}
                              </Badge>
                            ))}
                        </div>

                        <div className="flex gap-3">
                          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          <Button
                            variant="outline"
                            className="border-amber-300 text-amber-700"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Favoritar
                          </Button>
                          <Button
                            variant="outline"
                            className="border-purple-300 text-purple-700"
                          >
                            <Calculator className="w-4 h-4 mr-2" />
                            Simular
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {activeTab === "insights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <Card
              key={index}
              className="border-amber-200 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getInsightIcon(insight.type)}
                    <CardTitle className="text-lg text-amber-900">
                      {insight.title}
                    </CardTitle>
                  </div>
                  <Badge
                    className={`${getConfidenceColor(insight.confidence)} border-0`}
                  >
                    {insight.confidence}% confiança
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 mb-4">{insight.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-amber-600 mb-1">
                    <span>Confiança da IA</span>
                    <span>{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-2" />
                </div>

                {insight.action && (
                  <Button
                    variant="outline"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    {insight.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Preferences */}
      <div className="mt-12 text-center">
        <Card className="border-amber-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-amber-600" />
              <h3 className="text-xl font-semibold text-amber-900">
                Refinar Recomendações
              </h3>
            </div>
            <p className="text-amber-700 mb-6">
              Atualize suas preferências para receber recomendações ainda mais
              precisas
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Target className="w-4 h-4 mr-2" />
                Atualizar Preferências
              </Button>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Ver Histórico
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
