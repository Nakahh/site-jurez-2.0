import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  PenTool,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Eye,
  Send,
  Users,
  Shield,
  Calendar,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Share2,
  Archive,
  History,
} from "lucide-react";

interface Contrato {
  id: string;
  titulo: string;
  tipoContrato: string;
  imovelId?: string;
  imovelTitulo?: string;
  valor: number;
  signatarios: Signatario[];
  status:
    | "RASCUNHO"
    | "AGUARDANDO_ASSINATURAS"
    | "ASSINADO"
    | "CANCELADO"
    | "VENCIDO";
  criadoEm: Date;
  prazoAssinatura: Date;
  assinadoEm?: Date;
  documentoUrl?: string;
  template: string;
  observacoes?: string;
}

interface Signatario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipo: "COMPRADOR" | "VENDEDOR" | "FIADOR" | "TESTEMUNHA" | "PROCURADOR";
  status: "PENDENTE" | "ASSINADO" | "REJEITADO";
  assinadoEm?: Date;
  ipAssinatura?: string;
  certificadoDigital?: boolean;
}

interface TemplateContrato {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  conteudo: string;
  ativo: boolean;
  versao: string;
  criadoEm: Date;
}

interface AssinaturaStats {
  totalContratos: number;
  contratosAssinados: number;
  contratosAguardando: number;
  contratosCancelados: number;
  tempoMedioAssinatura: number;
  taxaAssinatura: number;
}

export default function DigitalSignature() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [templates, setTemplates] = useState<TemplateContrato[]>([]);
  const [stats, setStats] = useState<AssinaturaStats>({
    totalContratos: 0,
    contratosAssinados: 0,
    contratosAguardando: 0,
    contratosCancelados: 0,
    tempoMedioAssinatura: 0,
    taxaAssinatura: 0,
  });

  const [novoContrato, setNovoContrato] = useState({
    titulo: "",
    tipoContrato: "",
    template: "",
    imovelId: "",
    valor: "",
    prazoAssinatura: "",
    observacoes: "",
  });

  const [novoSignatario, setNovoSignatario] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    tipo: "COMPRADOR",
  });

  const [signatarios, setSignatarios] = useState<Signatario[]>([]);
  const [loading, setLoading] = useState(true);
  const [criandoContrato, setCriandoContrato] = useState(false);
  const [modalNovoContrato, setModalNovoContrato] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        const contratosSimulados: Contrato[] = [
          {
            id: "1",
            titulo: "Contrato de Compra e Venda - Apt 301",
            tipoContrato: "COMPRA_VENDA",
            imovelId: "imovel1",
            imovelTitulo: "Apartamento 301 - Setor Bueno",
            valor: 350000,
            signatarios: [
              {
                id: "s1",
                nome: "João Silva",
                email: "joao@email.com",
                cpf: "123.456.789-00",
                telefone: "(62) 99999-9999",
                tipo: "COMPRADOR",
                status: "ASSINADO",
                assinadoEm: new Date(),
                ipAssinatura: "192.168.1.100",
                certificadoDigital: true,
              },
              {
                id: "s2",
                nome: "Maria Santos",
                email: "maria@email.com",
                cpf: "987.654.321-00",
                telefone: "(62) 88888-8888",
                tipo: "VENDEDOR",
                status: "PENDENTE",
              },
            ],
            status: "AGUARDANDO_ASSINATURAS",
            criadoEm: new Date(),
            prazoAssinatura: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            template: "template_compra_venda",
            observacoes: "Contrato padrão de compra e venda",
          },
        ];

        const templatesSimulados: TemplateContrato[] = [
          {
            id: "template_compra_venda",
            nome: "Contrato de Compra e Venda",
            categoria: "VENDA",
            descricao: "Template padrão para contratos de compra e venda",
            conteudo: "Conteúdo do template...",
            ativo: true,
            versao: "2.1",
            criadoEm: new Date(),
          },
          {
            id: "template_locacao",
            nome: "Contrato de Locação",
            categoria: "LOCACAO",
            descricao: "Template para contratos de locação residencial",
            conteudo: "Conteúdo do template...",
            ativo: true,
            versao: "1.8",
            criadoEm: new Date(),
          },
        ];

        const statsSimuladas: AssinaturaStats = {
          totalContratos: 24,
          contratosAssinados: 18,
          contratosAguardando: 5,
          contratosCancelados: 1,
          tempoMedioAssinatura: 3.2,
          taxaAssinatura: 85.7,
        };

        setContratos(contratosSimulados);
        setTemplates(templatesSimulados);
        setStats(statsSimuladas);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const criarContrato = async () => {
    setCriandoContrato(true);
    try {
      // Simular criação de contrato
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const contratoId = Date.now().toString();
      const novoContratoData: Contrato = {
        id: contratoId,
        titulo: novoContrato.titulo,
        tipoContrato: novoContrato.tipoContrato,
        imovelId: novoContrato.imovelId,
        valor: parseFloat(novoContrato.valor),
        signatarios: signatarios,
        status: "RASCUNHO",
        criadoEm: new Date(),
        prazoAssinatura: new Date(novoContrato.prazoAssinatura),
        template: novoContrato.template,
        observacoes: novoContrato.observacoes,
      };

      setContratos([novoContratoData, ...contratos]);
      setModalNovoContrato(false);
      resetFormulario();
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
    } finally {
      setCriandoContrato(false);
    }
  };

  const resetFormulario = () => {
    setNovoContrato({
      titulo: "",
      tipoContrato: "",
      template: "",
      imovelId: "",
      valor: "",
      prazoAssinatura: "",
      observacoes: "",
    });
    setSignatarios([]);
  };

  const adicionarSignatario = () => {
    const signatario: Signatario = {
      id: Date.now().toString(),
      nome: novoSignatario.nome,
      email: novoSignatario.email,
      cpf: novoSignatario.cpf,
      telefone: novoSignatario.telefone,
      tipo: novoSignatario.tipo as any,
      status: "PENDENTE",
    };

    setSignatarios([...signatarios, signatario]);
    setNovoSignatario({
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      tipo: "COMPRADOR",
    });
  };

  const removerSignatario = (id: string) => {
    setSignatarios(signatarios.filter((s) => s.id !== id));
  };

  const enviarParaAssinatura = async (contratoId: string) => {
    try {
      // Simular envio para assinatura
      const contratosAtualizados = contratos.map((contrato) =>
        contrato.id === contratoId
          ? { ...contrato, status: "AGUARDANDO_ASSINATURAS" as const }
          : contrato,
      );
      setContratos(contratosAtualizados);
    } catch (error) {
      console.error("Erro ao enviar contrato:", error);
    }
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RASCUNHO":
        return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case "AGUARDANDO_ASSINATURAS":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Aguardando</Badge>
        );
      case "ASSINADO":
        return <Badge className="bg-green-100 text-green-800">Assinado</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case "VENCIDO":
        return <Badge className="bg-orange-100 text-orange-800">Vencido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSignatarioStatusBadge = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
        );
      case "ASSINADO":
        return <Badge className="bg-green-100 text-green-800">Assinado</Badge>;
      case "REJEITADO":
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calcularProgresso = (signatarios: Signatario[]) => {
    const assinados = signatarios.filter((s) => s.status === "ASSINADO").length;
    return (assinados / signatarios.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Carregando contratos...</p>
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
            Assinatura Digital
          </h2>
          <p className="text-slate-600">
            Gestão completa de contratos e assinaturas digitais
          </p>
        </div>
        <Dialog open={modalNovoContrato} onOpenChange={setModalNovoContrato}>
          <DialogTrigger asChild>
            <Button className="bg-slate-600 hover:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Contrato</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título do Contrato</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Contrato de Compra e Venda - Apt 301"
                    value={novoContrato.titulo}
                    onChange={(e) =>
                      setNovoContrato({
                        ...novoContrato,
                        titulo: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
                  <Select
                    value={novoContrato.tipoContrato}
                    onValueChange={(value) =>
                      setNovoContrato({ ...novoContrato, tipoContrato: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPRA_VENDA">
                        Compra e Venda
                      </SelectItem>
                      <SelectItem value="LOCACAO">Locação</SelectItem>
                      <SelectItem value="CESSAO">Cessão de Direitos</SelectItem>
                      <SelectItem value="PROCURACAO">Procuração</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={novoContrato.template}
                    onValueChange={(value) =>
                      setNovoContrato({ ...novoContrato, template: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor">Valor do Contrato (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={novoContrato.valor}
                    onChange={(e) =>
                      setNovoContrato({
                        ...novoContrato,
                        valor: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="prazoAssinatura">Prazo para Assinatura</Label>
                  <Input
                    id="prazoAssinatura"
                    type="datetime-local"
                    value={novoContrato.prazoAssinatura}
                    onChange={(e) =>
                      setNovoContrato({
                        ...novoContrato,
                        prazoAssinatura: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais sobre o contrato"
                  value={novoContrato.observacoes}
                  onChange={(e) =>
                    setNovoContrato({
                      ...novoContrato,
                      observacoes: e.target.value,
                    })
                  }
                />
              </div>

              {/* Signatários */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Signatários</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="nomeSignatario">Nome</Label>
                    <Input
                      id="nomeSignatario"
                      placeholder="Nome completo"
                      value={novoSignatario.nome}
                      onChange={(e) =>
                        setNovoSignatario({
                          ...novoSignatario,
                          nome: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailSignatario">E-mail</Label>
                    <Input
                      id="emailSignatario"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={novoSignatario.email}
                      onChange={(e) =>
                        setNovoSignatario({
                          ...novoSignatario,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpfSignatario">CPF</Label>
                    <Input
                      id="cpfSignatario"
                      placeholder="000.000.000-00"
                      value={novoSignatario.cpf}
                      onChange={(e) =>
                        setNovoSignatario({
                          ...novoSignatario,
                          cpf: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefoneSignatario">Telefone</Label>
                    <Input
                      id="telefoneSignatario"
                      placeholder="(62) 99999-9999"
                      value={novoSignatario.telefone}
                      onChange={(e) =>
                        setNovoSignatario({
                          ...novoSignatario,
                          telefone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipoSignatario">Tipo</Label>
                    <Select
                      value={novoSignatario.tipo}
                      onValueChange={(value) =>
                        setNovoSignatario({ ...novoSignatario, tipo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPRADOR">Comprador</SelectItem>
                        <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                        <SelectItem value="FIADOR">Fiador</SelectItem>
                        <SelectItem value="TESTEMUNHA">Testemunha</SelectItem>
                        <SelectItem value="PROCURADOR">Procurador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={adicionarSignatario}
                      disabled={!novoSignatario.nome || !novoSignatario.email}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {signatarios.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Signatários adicionados:</h4>
                    {signatarios.map((signatario) => (
                      <div
                        key={signatario.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{signatario.nome}</p>
                          <p className="text-sm text-slate-600">
                            {signatario.email} • {signatario.tipo}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removerSignatario(signatario.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setModalNovoContrato(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={criarContrato}
                  disabled={criandoContrato || signatarios.length === 0}
                >
                  {criandoContrato ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Criar Contrato
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
            <CardTitle className="text-sm font-medium">
              Total Contratos
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContratos}</div>
            <p className="text-xs text-slate-600">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contratosAssinados}</div>
            <p className="text-xs text-slate-600">Concluídos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Assinatura
            </CardTitle>
            <PenTool className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaAssinatura}%</div>
            <p className="text-xs text-slate-600">Índice de aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.tempoMedioAssinatura}d
            </div>
            <p className="text-xs text-slate-600">Para assinatura</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contratos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="contratos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratos.map((contrato) => (
                    <TableRow key={contrato.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contrato.titulo}</p>
                          <p className="text-sm text-slate-600">
                            {contrato.signatarios.length} signatário(s)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatarValor(contrato.valor)}</TableCell>
                      <TableCell>{getStatusBadge(contrato.status)}</TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress
                            value={calcularProgresso(contrato.signatarios)}
                          />
                          <p className="text-xs text-slate-600 mt-1">
                            {
                              contrato.signatarios.filter(
                                (s) => s.status === "ASSINADO",
                              ).length
                            }
                            /{contrato.signatarios.length}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contrato.prazoAssinatura.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          {contrato.status === "RASCUNHO" && (
                            <Button
                              size="sm"
                              onClick={() => enviarParaAssinatura(contrato.id)}
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                          )}
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

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Templates de Contrato</CardTitle>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.nome}</p>
                          <p className="text-sm text-slate-600">
                            {template.descricao}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{template.categoria}</TableCell>
                      <TableCell>{template.versao}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            template.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {template.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Archive className="w-3 h-3" />
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

        <TabsContent value="auditoria" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Auditoria de Assinaturas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Assinaturas válidas:</span>
                  <span className="font-semibold text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Certificados digitais:</span>
                  <span className="font-semibold">15/18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tempo médio processo:</span>
                  <span className="font-semibold">3.2 dias</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">Última auditoria:</span>
                  <span className="font-semibold">Hoje, 14:30</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificação Digital</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">ICP-Brasil válido:</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Selo de tempo:</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Integridade docs:</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Shield className="w-4 h-4 mr-2" />
                  Relatório Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
