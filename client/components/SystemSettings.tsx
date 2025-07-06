import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Save,
  RefreshCw,
  Download,
  Upload,
  Database,
  Mail,
  MessageSquare,
  Globe,
  Shield,
  Bell,
  Palette,
  User,
  Building,
  Key,
  Smartphone,
  Monitor,
  Clock,
  DollarSign,
  FileText,
  Camera,
  Map,
  Phone,
  Users,
  Home,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface SystemConfig {
  empresa: {
    nome: string;
    cnpj: string;
    email: string;
    telefone: string;
    endereco: string;
    creci: string;
    site: string;
    logoClaro: string;
    logoEscuro: string;
  };
  email: {
    smtp: string;
    porta: number;
    usuario: string;
    senha: string;
    ssl: boolean;
  };
  whatsapp: {
    numero: string;
    token: string;
    webhook: string;
    ativo: boolean;
  };
  integracao: {
    googleMaps: string;
    openAI: string;
    zapier: string;
    mailchimp: string;
  };
  aparencia: {
    tema: "claro" | "escuro" | "auto";
    corPrimaria: string;
    corSecundaria: string;
    fonte: string;
    logoPersonalizada: boolean;
  };
  notificacoes: {
    novoLead: boolean;
    visitaAgendada: boolean;
    vendaRealizada: boolean;
    sistemaCritico: boolean;
    relatorios: boolean;
    marketing: boolean;
  };
  backup: {
    automatico: boolean;
    frequencia: "diario" | "semanal" | "mensal";
    retencao: number;
    local: "local" | "nuvem";
    notificar: boolean;
  };
  seguranca: {
    autenticacaoDupla: boolean;
    tentativasLogin: number;
    tempoSessao: number;
    forcarHTTPS: boolean;
    logAuditoria: boolean;
  };
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    empresa: {
      nome: "Siqueira Campos Imóveis",
      cnpj: "12.345.678/0001-90",
      email: "contato@siqueicamposimoveis.com.br",
      telefone: "(62) 9 8556-3505",
      endereco: "Goiânia - GO",
      creci: "12345-J",
      site: "https://siqueicamposimoveis.com.br",
      logoClaro: "",
      logoEscuro: "",
    },
    email: {
      smtp: "smtp.gmail.com",
      porta: 587,
      usuario: "sistema@siqueicamposimoveis.com.br",
      senha: "",
      ssl: true,
    },
    whatsapp: {
      numero: "5562985563505",
      token: "",
      webhook: "",
      ativo: true,
    },
    integracao: {
      googleMaps: "",
      openAI: "",
      zapier: "",
      mailchimp: "",
    },
    aparencia: {
      tema: "auto",
      corPrimaria: "#8B4513",
      corSecundaria: "#D2691E",
      fonte: "Inter",
      logoPersonalizada: true,
    },
    notificacoes: {
      novoLead: true,
      visitaAgendada: true,
      vendaRealizada: true,
      sistemaCritico: true,
      relatorios: false,
      marketing: true,
    },
    backup: {
      automatico: true,
      frequencia: "diario",
      retencao: 30,
      local: "nuvem",
      notificar: true,
    },
    seguranca: {
      autenticacaoDupla: true,
      tentativasLogin: 5,
      tempoSessao: 60,
      forcarHTTPS: true,
      logAuditoria: true,
    },
  });

  const [activeTab, setActiveTab] = useState("empresa");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Configurações salvas:", config);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (service: string) => {
    setTesting(service);
    try {
      // Simular teste de conexão
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log(`Testando ${service}...`);
    } finally {
      setTesting(null);
    }
  };

  const handleReset = () => {
    // Reset para configurações padrão
    setConfig({
      ...config,
      // valores padrão
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Configurações do Sistema</h2>
          <p className="text-muted-foreground">
            Configure todos os aspectos do sistema imobiliário
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="comunicacao">Comunicação</TabsTrigger>
          <TabsTrigger value="integracao">Integrações</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="avancado">Avançado</TabsTrigger>
        </TabsList>

        {/* Informações da Empresa */}
        <TabsContent value="empresa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={config.empresa.nome}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        empresa: { ...config.empresa, nome: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={config.empresa.cnpj}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        empresa: { ...config.empresa, cnpj: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Principal</Label>
                  <Input
                    type="email"
                    value={config.empresa.email}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        empresa: { ...config.empresa, email: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={config.empresa.telefone}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        empresa: {
                          ...config.empresa,
                          telefone: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>CRECI</Label>
                  <Input
                    value={config.empresa.creci}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        empresa: { ...config.empresa, creci: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Site</Label>
                  <Input
                    value={config.empresa.site}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        empresa: { ...config.empresa, site: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea
                  value={config.empresa.endereco}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      empresa: { ...config.empresa, endereco: e.target.value },
                    })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo (Tema Claro)</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={config.empresa.logoClaro}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          empresa: {
                            ...config.empresa,
                            logoClaro: e.target.value,
                          },
                        })
                      }
                      placeholder="URL da logo para tema claro"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Logo (Tema Escuro)</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={config.empresa.logoEscuro}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          empresa: {
                            ...config.empresa,
                            logoEscuro: e.target.value,
                          },
                        })
                      }
                      placeholder="URL da logo para tema escuro"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comunicação */}
        <TabsContent value="comunicacao" className="space-y-6">
          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Configurações de Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input
                    value={config.email.smtp}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        email: { ...config.email, smtp: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input
                    type="number"
                    value={config.email.porta}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        email: {
                          ...config.email,
                          porta: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Input
                    value={config.email.usuario}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        email: { ...config.email, usuario: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={config.email.senha}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        email: { ...config.email, senha: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.email.ssl}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        email: { ...config.email, ssl: checked },
                      })
                    }
                  />
                  <Label>Usar SSL/TLS</Label>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleTest("email")}
                  disabled={testing === "email"}
                >
                  {testing === "email" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                WhatsApp Business API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={config.whatsapp.numero}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        whatsapp: {
                          ...config.whatsapp,
                          numero: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Token da API</Label>
                  <Input
                    type="password"
                    value={config.whatsapp.token}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        whatsapp: {
                          ...config.whatsapp,
                          token: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={config.whatsapp.webhook}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      whatsapp: {
                        ...config.whatsapp,
                        webhook: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.whatsapp.ativo}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        whatsapp: { ...config.whatsapp, ativo: checked },
                      })
                    }
                  />
                  <Label>WhatsApp Ativo</Label>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleTest("whatsapp")}
                  disabled={testing === "whatsapp"}
                >
                  {testing === "whatsapp" ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Testar API
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                APIs e Integrações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Google Maps API</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      value={config.integracao.googleMaps}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          integracao: {
                            ...config.integracao,
                            googleMaps: e.target.value,
                          },
                        })
                      }
                      placeholder="Chave da API do Google Maps"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest("maps")}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>OpenAI API</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      value={config.integracao.openAI}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          integracao: {
                            ...config.integracao,
                            openAI: e.target.value,
                          },
                        })
                      }
                      placeholder="Chave da API OpenAI"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest("openai")}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zapier Webhook</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={config.integracao.zapier}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          integracao: {
                            ...config.integracao,
                            zapier: e.target.value,
                          },
                        })
                      }
                      placeholder="URL do webhook Zapier"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest("zapier")}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mailchimp API</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      value={config.integracao.mailchimp}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          integracao: {
                            ...config.integracao,
                            mailchimp: e.target.value,
                          },
                        })
                      }
                      placeholder="Chave da API Mailchimp"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest("mailchimp")}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="aparencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Personalização Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select
                    value={config.aparencia.tema}
                    onValueChange={(value: "claro" | "escuro" | "auto") =>
                      setConfig({
                        ...config,
                        aparencia: { ...config.aparencia, tema: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claro">Claro</SelectItem>
                      <SelectItem value="escuro">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fonte</Label>
                  <Select
                    value={config.aparencia.fonte}
                    onValueChange={(value) =>
                      setConfig({
                        ...config,
                        aparencia: { ...config.aparencia, fonte: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={config.aparencia.corPrimaria}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aparencia: {
                            ...config.aparencia,
                            corPrimaria: e.target.value,
                          },
                        })
                      }
                      className="w-16"
                    />
                    <Input
                      value={config.aparencia.corPrimaria}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aparencia: {
                            ...config.aparencia,
                            corPrimaria: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={config.aparencia.corSecundaria}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aparencia: {
                            ...config.aparencia,
                            corSecundaria: e.target.value,
                          },
                        })
                      }
                      className="w-16"
                    />
                    <Input
                      value={config.aparencia.corSecundaria}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          aparencia: {
                            ...config.aparencia,
                            corSecundaria: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.aparencia.logoPersonalizada}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      aparencia: {
                        ...config.aparencia,
                        logoPersonalizada: checked,
                      },
                    })
                  }
                />
                <Label>Usar Logo Personalizada</Label>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Preview</h4>
                <div
                  className="p-4 rounded border-2"
                  style={{
                    borderColor: config.aparencia.corPrimaria,
                    backgroundColor: `${config.aparencia.corPrimaria}10`,
                  }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{ color: config.aparencia.corPrimaria }}
                  >
                    Exemplo de título
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: config.aparencia.corSecundaria }}
                  >
                    Exemplo de texto secundário
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Novo Lead</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando um novo lead for cadastrado
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoes.novoLead}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificacoes: {
                          ...config.notificacoes,
                          novoLead: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Visita Agendada</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando uma visita for agendada
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoes.visitaAgendada}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificacoes: {
                          ...config.notificacoes,
                          visitaAgendada: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Venda Realizada</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando uma venda for realizada
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoes.vendaRealizada}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificacoes: {
                          ...config.notificacoes,
                          vendaRealizada: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre problemas críticos do sistema
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoes.sistemaCritico}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificacoes: {
                          ...config.notificacoes,
                          sistemaCritico: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Relatórios</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar relatórios periódicos por email
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoes.relatorios}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificacoes: {
                          ...config.notificacoes,
                          relatorios: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre campanhas e performance
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoes.marketing}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificacoes: {
                          ...config.notificacoes,
                          marketing: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Configurações de Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={config.backup.frequencia}
                    onValueChange={(value: "diario" | "semanal" | "mensal") =>
                      setConfig({
                        ...config,
                        backup: { ...config.backup, frequencia: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retenção (dias)</Label>
                  <Input
                    type="number"
                    value={config.backup.retencao}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        backup: {
                          ...config.backup,
                          retencao: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Local de Armazenamento</Label>
                  <Select
                    value={config.backup.local}
                    onValueChange={(value: "local" | "nuvem") =>
                      setConfig({
                        ...config,
                        backup: { ...config.backup, local: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="nuvem">Nuvem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.backup.automatico}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        backup: { ...config.backup, automatico: checked },
                      })
                    }
                  />
                  <Label>Backup Automático</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.backup.notificar}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        backup: { ...config.backup, notificar: checked },
                      })
                    }
                  />
                  <Label>Notificar sobre Status dos Backups</Label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Executar Backup Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Máximo de Tentativas de Login</Label>
                  <Input
                    type="number"
                    value={config.seguranca.tentativasLogin}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seguranca: {
                          ...config.seguranca,
                          tentativasLogin: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo de Sessão (minutos)</Label>
                  <Input
                    type="number"
                    value={config.seguranca.tempoSessao}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        seguranca: {
                          ...config.seguranca,
                          tempoSessao: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.seguranca.autenticacaoDupla}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        seguranca: {
                          ...config.seguranca,
                          autenticacaoDupla: checked,
                        },
                      })
                    }
                  />
                  <Label>Autenticação de Dois Fatores</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.seguranca.forcarHTTPS}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        seguranca: {
                          ...config.seguranca,
                          forcarHTTPS: checked,
                        },
                      })
                    }
                  />
                  <Label>Forçar HTTPS</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.seguranca.logAuditoria}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        seguranca: {
                          ...config.seguranca,
                          logAuditoria: checked,
                        },
                      })
                    }
                  />
                  <Label>Log de Auditoria</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas */}
        <TabsContent value="avancado" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Exportar Configurações
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Upload className="h-6 w-6 mb-2" />
                  Importar Configurações
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Reset Completo
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Logs do Sistema
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive">
                        Zona de Perigo
                      </h4>
                      <p className="text-sm text-destructive/80 mb-3">
                        Essas ações são irreversíveis e podem afetar todo o
                        sistema.
                      </p>
                      <Button variant="destructive" size="sm">
                        Reset Factory
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
