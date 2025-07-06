import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Instagram,
} from "lucide-react";
import { ChatBubble } from "@/components/ChatBubble";

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  assunto: string;
  mensagem: string;
  tipo: string;
}

export default function Contato() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    telefone: "",
    email: "",
    assunto: "",
    mensagem: "",
    tipo: "geral",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          mensagem: `${formData.assunto}\n\n${formData.mensagem}`,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          nome: "",
          telefone: "",
          email: "",
          assunto: "",
          mensagem: "",
          tipo: "geral",
        });
      } else {
        throw new Error("Erro ao enviar mensagem");
      }
    } catch (err) {
      setError("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const horariosFuncionamento = [
    { dia: "Segunda à Sexta", horario: "08:00 - 18:00" },
    { dia: "Sábado", horario: "08:00 - 12:00" },
    { dia: "Domingo", horario: "Fechado" },
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
              to="/blog"
              className="text-foreground hover:text-primary transition-colors"
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
              to="/simulador"
              className="text-foreground hover:text-primary transition-colors"
            >
              Simulador
            </Link>
            <Link
              to="/contato"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Contato
            </Link>
            <Link
              to="/sobre"
              className="text-foreground hover:text-primary transition-colors"
            >
              Sobre
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
            Entre em Contato
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos aqui para ajudar você a encontrar o imóvel dos seus sonhos.
            Entre em contato conosco e tire todas as suas dúvidas.
          </p>
        </div>
      </section>

      {/* Contato Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Envie uma Mensagem</CardTitle>
                <p className="text-muted-foreground">
                  Preencha o formulário abaixo e nossa equipe entrará em contato
                  em breve.
                </p>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-6">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      Mensagem enviada com sucesso! Nossa equipe entrará em
                      contato em breve.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        required
                        placeholder="(62) 9 9999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo de Solicitação</Label>
                    <select
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="w-full p-3 rounded-md border border-input bg-background"
                    >
                      <option value="geral">Informações Gerais</option>
                      <option value="compra">Quero Comprar</option>
                      <option value="venda">Quero Vender</option>
                      <option value="aluguel">Quero Alugar</option>
                      <option value="locacao">Quero Locar</option>
                      <option value="avaliacao">Avaliação de Imóvel</option>
                      <option value="financiamento">Financiamento</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="assunto">Assunto *</Label>
                    <Input
                      id="assunto"
                      name="assunto"
                      value={formData.assunto}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Interesse em apartamento no Setor Bueno"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mensagem">Mensagem *</Label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      required
                      placeholder="Descreva detalhadamente sua necessidade..."
                      rows={5}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Informações de Contato */}
            <div className="space-y-8">
              {/* Contatos Diretos */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Fale Diretamente Conosco</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Telefone</h3>
                      <p className="text-muted-foreground">
                        Ligue agora e fale com nossos especialistas
                      </p>
                      <a
                        href="tel:+5562985563505"
                        className="font-semibold text-primary hover:underline"
                      >
                        (62) 9 8556-3505
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors dark:bg-green-950/20 dark:hover:bg-green-950/30">
                    <div className="bg-green-100 rounded-full p-3 dark:bg-green-900">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">WhatsApp</h3>
                      <p className="text-muted-foreground">
                        Atendimento rápido e personalizado
                      </p>
                      <a
                        href="https://wa.me/5562985563505"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-green-600 hover:underline"
                      >
                        Conversar no WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-muted-foreground">
                        Envie sua dúvida por email
                      </p>
                      <a
                        href="mailto:SiqueiraCamposImoveisGoiania@gmail.com"
                        className="font-semibold text-primary hover:underline"
                      >
                        SiqueiraCamposImoveisGoiania@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:from-pink-100 hover:to-purple-100 transition-colors dark:from-pink-950/20 dark:to-purple-950/20">
                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-full p-3 dark:from-pink-900 dark:to-purple-900">
                      <Instagram className="h-6 w-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Instagram</h3>
                      <p className="text-muted-foreground">
                        Acompanhe nossos imóveis
                      </p>
                      <a
                        href="https://instagram.com/imoveissiqueiracampos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-pink-600 hover:underline"
                      >
                        @imoveissiqueiracampos
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horário de Funcionamento */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Horário de Funcionamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {horariosFuncionamento.map((horario, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-muted last:border-0"
                      >
                        <span className="font-medium">{horario.dia}</span>
                        <span className="text-muted-foreground">
                          {horario.horario}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg dark:bg-blue-950/20">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>Dica:</strong> Para atendimento mais rápido,
                      use nosso WhatsApp disponível 24h!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Localização */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Nossa Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Endereço</h3>
                      <p className="text-muted-foreground">
                        Atendemos toda a região metropolitana de Goiânia
                      </p>
                      <p className="font-medium">Goiânia - GO</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        📍 Realizamos visitas e atendimentos em todos os bairros
                        de Goiânia e região metropolitana. Entre em contato para
                        agendar.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Rápido */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Respostas rápidas para as dúvidas mais comuns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Como agendar uma visita?</h3>
                <p className="text-muted-foreground text-sm">
                  Entre em contato via WhatsApp, telefone ou preencha nosso
                  formulário. Agendamos visitas de segunda a sábado.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  Vocês auxiliam com financiamento?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Sim! Temos parcerias com os principais bancos e auxiliamos
                  todo o processo de financiamento imobiliário.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  Qual o prazo para avaliação?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Realizamos avaliações em até 48h após o agendamento, com
                  relatório completo e sugestões de preço.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  Atendem aos finais de semana?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Atendemos aos sábados pela manhã e via WhatsApp estamos
                  disponíveis 24h para emergências.
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
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <a href="tel:+5562985563505">(62) 9 8556-3505</a>
                </div>
                <div className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-5 w-5 mr-3 text-primary" />
                  <a
                    href="https://instagram.com/imoveissiqueiracampos"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @imoveissiqueiracampos
                  </a>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  Goiânia - GO
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
