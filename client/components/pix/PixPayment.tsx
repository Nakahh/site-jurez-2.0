import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Download,
  Eye,
  Settings,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Zap,
} from "lucide-react";

interface PixConfig {
  chavePix: string;
  tipoConta: string;
  banco: string;
  agencia: string;
  conta: string;
  nomeRecebedor: string;
  cpfCnpj: string;
  ativo: boolean;
  taxaProcessamento: number;
  limiteDiario: number;
  limiteMensal: number;
}

interface PixTransaction {
  id: string;
  valor: number;
  descricao: string;
  chavePagador: string;
  nomeRecebedor: string;
  status: "PENDENTE" | "CONCLUIDO" | "CANCELADO" | "ESTORNADO";
  dataTransacao: Date;
  dataVencimento: Date;
  cobrancaId: string;
  qrCode: string;
  txId: string;
}

interface PixStatistics {
  totalTransacoes: number;
  valorTotal: number;
  transacoesConcluidas: number;
  transacoesPendentes: number;
  ticketMedio: number;
  taxaConversao: number;
  tempoMedioRecebimento: number;
}

export default function PixPayment() {
  const [config, setConfig] = useState<PixConfig>({
    chavePix: "",
    tipoConta: "CORRENTE",
    banco: "001",
    agencia: "",
    conta: "",
    nomeRecebedor: "",
    cpfCnpj: "",
    ativo: false,
    taxaProcessamento: 2.5,
    limiteDiario: 10000,
    limiteMensal: 100000,
  });

  const [transacoes, setTransacoes] = useState<PixTransaction[]>([]);
  const [stats, setStats] = useState<PixStatistics>({
    totalTransacoes: 0,
    valorTotal: 0,
    transacoesConcluidas: 0,
    transacoesPendentes: 0,
    ticketMedio: 0,
    taxaConversao: 0,
    tempoMedioRecebimento: 0,
  });

  const [novaCobranca, setNovaCobranca] = useState({
    valor: "",
    descricao: "",
    vencimento: "",
  });

  const [loading, setLoading] = useState(true);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [gerandoCobranca, setGerandoCobranca] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        const transacoesSimuladas: PixTransaction[] = [
          {
            id: "1",
            valor: 1500,
            descricao: "Entrada apartamento Setor Bueno",
            chavePagador: "user@email.com",
            nomeRecebedor: "João Silva",
            status: "CONCLUIDO",
            dataTransacao: new Date(),
            dataVencimento: new Date(),
            cobrancaId: "COB123456",
            qrCode: "00020126580014br.gov.bcb.pix013636...",
            txId: "TX789123",
          },
          {
            id: "2",
            valor: 5000,
            descricao: "Sinal casa Jardim Goiás",
            chavePagador: "+5562999887766",
            nomeRecebedor: "Maria Santos",
            status: "PENDENTE",
            dataTransacao: new Date(),
            dataVencimento: new Date(Date.now() + 24 * 60 * 60 * 1000),
            cobrancaId: "COB123457",
            qrCode: "00020126580014br.gov.bcb.pix013636...",
            txId: "TX789124",
          },
        ];

        const statsSimuladas: PixStatistics = {
          totalTransacoes: 45,
          valorTotal: 125000,
          transacoesConcluidas: 38,
          transacoesPendentes: 7,
          ticketMedio: 2777.78,
          taxaConversao: 84.4,
          tempoMedioRecebimento: 2.5,
        };

        setTransacoes(transacoesSimuladas);
        setStats(statsSimuladas);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dados PIX:", error);
      setLoading(false);
    }
  };

  const salvarConfiguracao = async () => {
    setSalvandoConfig(true);
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Configuração PIX salva:", config);
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    } finally {
      setSalvandoConfig(false);
    }
  };

  const gerarCobrancaPix = async () => {
    setGerandoCobranca(true);
    try {
      // Simular geração de cobrança
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const novaTransacao: PixTransaction = {
        id: Date.now().toString(),
        valor: parseFloat(novaCobranca.valor),
        descricao: novaCobranca.descricao,
        chavePagador: "",
        nomeRecebedor: config.nomeRecebedor,
        status: "PENDENTE",
        dataTransacao: new Date(),
        dataVencimento: new Date(novaCobranca.vencimento),
        cobrancaId: `COB${Date.now()}`,
        qrCode: "00020126580014br.gov.bcb.pix013636...",
        txId: `TX${Date.now()}`,
      };

      setTransacoes([novaTransacao, ...transacoes]);
      setNovaCobranca({ valor: "", descricao: "", vencimento: "" });
    } catch (error) {
      console.error("Erro ao gerar cobrança:", error);
    } finally {
      setGerandoCobranca(false);
    }
  };

  const copiarChavePix = () => {
    navigator.clipboard.writeText(config.chavePix);
  };

  const copiarQrCode = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode);
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONCLUIDO":
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case "PENDENTE":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
        );
      case "CANCELADO":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case "ESTORNADO":
        return <Badge className="bg-gray-100 text-gray-800">Estornado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Carregando sistema PIX...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sistema PIX</h2>
          <p className="text-slate-600">
            Gestão completa de pagamentos via PIX
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            className={
              config.ativo
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          >
            {config.ativo ? "Ativo" : "Inativo"}
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-slate-600 hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Cobrança
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gerar Cobrança PIX</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={novaCobranca.valor}
                    onChange={(e) =>
                      setNovaCobranca({
                        ...novaCobranca,
                        valor: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva o motivo da cobrança"
                    value={novaCobranca.descricao}
                    onChange={(e) =>
                      setNovaCobranca({
                        ...novaCobranca,
                        descricao: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vencimento">Data de Vencimento</Label>
                  <Input
                    id="vencimento"
                    type="datetime-local"
                    value={novaCobranca.vencimento}
                    onChange={(e) =>
                      setNovaCobranca({
                        ...novaCobranca,
                        vencimento: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={gerarCobrancaPix}
                  disabled={gerandoCobranca}
                  className="w-full"
                >
                  {gerandoCobranca ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Gerar Cobrança
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transações
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransacoes}</div>
            <p className="text-xs text-slate-600">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(stats.valorTotal)}
            </div>
            <p className="text-xs text-slate-600">Recebido este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaConversao}%</div>
            <p className="text-xs text-slate-600">Cobranças pagas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Banknote className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatarValor(stats.ticketMedio)}
            </div>
            <p className="text-xs text-slate-600">Por transação</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transacoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="transacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transações PIX</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacoes.map((transacao) => (
                    <TableRow key={transacao.id}>
                      <TableCell>
                        {transacao.dataTransacao.toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{transacao.descricao}</TableCell>
                      <TableCell>{formatarValor(transacao.valor)}</TableCell>
                      <TableCell>{getStatusBadge(transacao.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copiarQrCode(transacao.qrCode)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
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

        <TabsContent value="configuracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração PIX</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Sistema PIX Ativo
                  </Label>
                  <p className="text-sm text-slate-600">
                    Habilitar recebimento via PIX
                  </p>
                </div>
                <Switch
                  checked={config.ativo}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, ativo: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="chavePix">Chave PIX</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="chavePix"
                      placeholder="sua.chave@pix.com"
                      value={config.chavePix}
                      onChange={(e) =>
                        setConfig({ ...config, chavePix: e.target.value })
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copiarChavePix}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="nomeRecebedor">Nome do Recebedor</Label>
                  <Input
                    id="nomeRecebedor"
                    placeholder="Siqueira Campos Imóveis"
                    value={config.nomeRecebedor}
                    onChange={(e) =>
                      setConfig({ ...config, nomeRecebedor: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    placeholder="00.000.000/0001-00"
                    value={config.cpfCnpj}
                    onChange={(e) =>
                      setConfig({ ...config, cpfCnpj: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="banco">Banco</Label>
                  <Select
                    value={config.banco}
                    onValueChange={(value) =>
                      setConfig({ ...config, banco: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="001">Banco do Brasil</SelectItem>
                      <SelectItem value="104">Caixa Econômica</SelectItem>
                      <SelectItem value="237">Bradesco</SelectItem>
                      <SelectItem value="341">Itaú</SelectItem>
                      <SelectItem value="033">Santander</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    placeholder="0000"
                    value={config.agencia}
                    onChange={(e) =>
                      setConfig({ ...config, agencia: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    placeholder="00000-0"
                    value={config.conta}
                    onChange={(e) =>
                      setConfig({ ...config, conta: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="taxaProcessamento">
                    Taxa de Processamento (%)
                  </Label>
                  <Input
                    id="taxaProcessamento"
                    type="number"
                    step="0.1"
                    value={config.taxaProcessamento}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        taxaProcessamento: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="limiteDiario">Limite Diário (R$)</Label>
                  <Input
                    id="limiteDiario"
                    type="number"
                    value={config.limiteDiario}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        limiteDiario: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={salvarConfiguracao}
                disabled={salvandoConfig}
                className="w-full"
              >
                {salvandoConfig ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Salvar Configuração
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Recebimentos concluídos:
                  </span>
                  <span className="font-semibold">
                    {stats.transacoesConcluidas}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pendentes:</span>
                  <span className="font-semibold">
                    {stats.transacoesPendentes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Tempo médio recebimento:
                  </span>
                  <span className="font-semibold">
                    {stats.tempoMedioRecebimento}h
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">Total do mês:</span>
                  <span className="font-bold text-green-600">
                    {formatarValor(stats.valorTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Relatório Mensal
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Extrato de Transações
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Auditoria de Segurança
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Backup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
