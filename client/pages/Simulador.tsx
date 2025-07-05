import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Calculator,
  Home,
  DollarSign,
  Calendar,
  TrendingUp,
  Info,
  Download,
  Share2,
  MessageCircle,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";

interface SimulacaoResult {
  valorPrestacao: number;
  valorTotal: number;
  valorJuros: number;
  renda_necessaria: number;
  valorEntrada: number;
  valorFinanciado: number;
}

export default function Simulador() {
  const [valorImovel, setValorImovel] = useState(300000);
  const [valorEntrada, setValorEntrada] = useState(60000);
  const [prazoAnos, setPrazoAnos] = useState(20);
  const [taxaJuros, setTaxaJuros] = useState(9.5);
  const [resultado, setResultado] = useState<SimulacaoResult | null>(null);
  const [sistema, setSistema] = useState<"sac" | "price">("sac");

  useEffect(() => {
    calcularFinanciamento();
  }, [valorImovel, valorEntrada, prazoAnos, taxaJuros, sistema]);

  const calcularFinanciamento = () => {
    const valorFinanciado = valorImovel - valorEntrada;
    const taxaMensal = taxaJuros / 100 / 12;
    const numeroMeses = prazoAnos * 12;

    let valorPrestacao: number;
    let valorTotal: number;

    if (sistema === "price") {
      // Sistema PRICE (prestações fixas)
      valorPrestacao =
        (valorFinanciado * taxaMensal * Math.pow(1 + taxaMensal, numeroMeses)) /
        (Math.pow(1 + taxaMensal, numeroMeses) - 1);
      valorTotal = valorPrestacao * numeroMeses;
    } else {
      // Sistema SAC (prestações decrescentes)
      const amortizacao = valorFinanciado / numeroMeses;
      const jurosPrimeiraPrestacao = valorFinanciado * taxaMensal;
      valorPrestacao = amortizacao + jurosPrimeiraPrestacao;

      // Cálculo do valor total no SAC
      let totalJuros = 0;
      let saldoDevedor = valorFinanciado;
      for (let i = 0; i < numeroMeses; i++) {
        const juros = saldoDevedor * taxaMensal;
        totalJuros += juros;
        saldoDevedor -= amortizacao;
      }
      valorTotal = valorFinanciado + totalJuros;
    }

    const valorJuros = valorTotal - valorFinanciado;
    const renda_necessaria = valorPrestacao / 0.3; // 30% da renda

    setResultado({
      valorPrestacao,
      valorTotal: valorTotal + valorEntrada,
      valorJuros,
      renda_necessaria,
      valorEntrada,
      valorFinanciado,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const bancos = [
    {
      nome: "Caixa Econômica Federal",
      taxa: "8.16% a 12.25%",
      prazo: "Até 35 anos",
      entrada: "Mínimo 20%",
      logo: "🏦",
    },
    {
      nome: "Banco do Brasil",
      taxa: "8.99% a 11.75%",
      prazo: "Até 35 anos",
      entrada: "Mínimo 20%",
      logo: "🏛️",
    },
    {
      nome: "Itaú",
      taxa: "9.49% a 13.25%",
      prazo: "Até 35 anos",
      entrada: "Mínimo 30%",
      logo: "🏪",
    },
    {
      nome: "Bradesco",
      taxa: "9.29% a 12.95%",
      prazo: "Até 35 anos",
      entrada: "Mínimo 20%",
      logo: "🏢",
    },
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
            <Link
              to="/simulador"
              className="text-foreground hover:text-primary transition-colors font-medium"
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
            Simulador de Financiamento
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Calcule as parcelas do seu financiamento imobiliário e descubra qual
            o valor ideal do seu investimento
          </p>
        </div>
      </section>

      {/* Simulador */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Calculator className="mr-2 h-6 w-6" />
                  Dados do Financiamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Valor do Imóvel */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">
                      Valor do Imóvel
                    </Label>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(valorImovel)}
                    </span>
                  </div>
                  <Slider
                    value={[valorImovel]}
                    onValueChange={(value) => setValorImovel(value[0])}
                    max={2000000}
                    min={50000}
                    step={10000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>R$ 50.000</span>
                    <span>R$ 2.000.000</span>
                  </div>
                </div>

                {/* Valor da Entrada */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">
                      Valor da Entrada
                    </Label>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(valorEntrada)}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        {((valorEntrada / valorImovel) * 100).toFixed(1)}% do
                        valor
                      </div>
                    </div>
                  </div>
                  <Slider
                    value={[valorEntrada]}
                    onValueChange={(value) => setValorEntrada(value[0])}
                    max={valorImovel * 0.8}
                    min={valorImovel * 0.1}
                    step={5000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>10% do valor</span>
                    <span>80% do valor</span>
                  </div>
                </div>

                {/* Prazo */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">
                      Prazo do Financiamento
                    </Label>
                    <span className="text-lg font-bold text-primary">
                      {prazoAnos} anos
                    </span>
                  </div>
                  <Slider
                    value={[prazoAnos]}
                    onValueChange={(value) => setPrazoAnos(value[0])}
                    max={35}
                    min={5}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5 anos</span>
                    <span>35 anos</span>
                  </div>
                </div>

                {/* Taxa de Juros */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">
                      Taxa de Juros (ao ano)
                    </Label>
                    <span className="text-lg font-bold text-primary">
                      {formatPercent(taxaJuros)}
                    </span>
                  </div>
                  <Slider
                    value={[taxaJuros]}
                    onValueChange={(value) => setTaxaJuros(value[0])}
                    max={15}
                    min={6}
                    step={0.1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>6.0%</span>
                    <span>15.0%</span>
                  </div>
                </div>

                {/* Sistema de Amortização */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    Sistema de Amortização
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSistema("sac")}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        sistema === "sac"
                          ? "border-primary bg-primary/10"
                          : "border-muted"
                      }`}
                    >
                      <div className="font-semibold">SAC</div>
                      <div className="text-sm text-muted-foreground">
                        Prestações decrescentes
                      </div>
                    </button>
                    <button
                      onClick={() => setSistema("price")}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        sistema === "price"
                          ? "border-primary bg-primary/10"
                          : "border-muted"
                      }`}
                    >
                      <div className="font-semibold">PRICE</div>
                      <div className="text-sm text-muted-foreground">
                        Prestações fixas
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultados */}
            <div className="space-y-6">
              {resultado && (
                <>
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl">
                        <TrendingUp className="mr-2 h-6 w-6" />
                        Resultado da Simulação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-primary/10 rounded-lg">
                          <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                          <div className="text-sm text-muted-foreground mb-1">
                            {sistema === "sac"
                              ? "Primeira Parcela"
                              : "Valor da Parcela"}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(resultado.valorPrestacao)}
                          </div>
                        </div>

                        <div className="text-center p-6 bg-muted/50 rounded-lg">
                          <Home className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <div className="text-sm text-muted-foreground mb-1">
                            Renda Necessária
                          </div>
                          <div className="text-2xl font-bold">
                            {formatCurrency(resultado.renda_necessaria)}
                          </div>
                        </div>

                        <div className="text-center p-6 bg-muted/50 rounded-lg">
                          <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <div className="text-sm text-muted-foreground mb-1">
                            Valor Total
                          </div>
                          <div className="text-xl font-bold">
                            {formatCurrency(resultado.valorTotal)}
                          </div>
                        </div>

                        <div className="text-center p-6 bg-muted/50 rounded-lg">
                          <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <div className="text-sm text-muted-foreground mb-1">
                            Juros Totais
                          </div>
                          <div className="text-xl font-bold">
                            {formatCurrency(resultado.valorJuros)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg dark:bg-blue-950/20">
                        <h4 className="font-semibold mb-2">Resumo:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Valor do Imóvel:</span>
                            <span>{formatCurrency(valorImovel)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor da Entrada:</span>
                            <span>
                              {formatCurrency(resultado.valorEntrada)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor Financiado:</span>
                            <span>
                              {formatCurrency(resultado.valorFinanciado)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prazo:</span>
                            <span>
                              {prazoAnos} anos ({prazoAnos * 12} meses)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxa de Juros:</span>
                            <span>{formatPercent(taxaJuros)} ao ano</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4 mt-6">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4">
                          Gostou da simulação?
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Fale com nossos especialistas para tirar suas dúvidas
                          e encontrar as melhores condições
                        </p>
                        <Button size="lg" className="w-full" asChild>
                          <Link to="/contato">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Falar com Especialista
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Parceiros Bancários */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nossos Parceiros Bancários
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trabalhamos com os principais bancos do país para oferecer as
              melhores condições de financiamento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bancos.map((banco, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{banco.logo}</div>
                  <h3 className="font-bold text-lg mb-4">{banco.nome}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Taxa: </span>
                      <span className="text-primary">{banco.taxa}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Prazo: </span>
                      <span>{banco.prazo}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Entrada: </span>
                      <span>{banco.entrada}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dicas */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Dicas para seu Financiamento
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conselhos importantes para conseguir o melhor financiamento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">
                  💰 Organize suas Finanças
                </h3>
                <p className="text-muted-foreground">
                  Quite suas pendências, tenha nome limpo e comprove renda
                  estável para conseguir melhores condições.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">📊 Compare Propostas</h3>
                <p className="text-muted-foreground">
                  Pesquise em diferentes bancos e compare não apenas a taxa, mas
                  também tarifas e custos extras.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">🏠 Use o FGTS</h3>
                <p className="text-muted-foreground">
                  O FGTS pode ser usado como entrada ou para abater o saldo
                  devedor, reduzindo o valor financiado.
                </p>
              </CardContent>
            </Card>
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
                  <span>(62) 9 8556-3505</span>
                </div>
                <div className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                  <span>@imoveissiqueiracampos</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span>Goiânia - GO</span>
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
