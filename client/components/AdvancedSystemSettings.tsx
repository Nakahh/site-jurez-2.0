import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Save,
  Download,
  Upload,
  RefreshCw,
  Building,
  Smartphone,
  Mail,
  MapPin,
  CreditCard,
  BarChart3,
  Shield,
  MessageSquare,
  Globe,
  Database,
  Bell,
  Key,
  CheckCircle,
  AlertTriangle,
  Info,
  Copy,
  FileText,
} from "lucide-react";
import { useSystemConfig, SystemConfig } from "@/utils/systemConfig";

interface AdvancedSystemSettingsProps {
  userRole: "ADMIN" | "DESENVOLVEDOR" | "MARKETING" | "CORRETOR" | "ASSISTENTE";
}

export function AdvancedSystemSettings({
  userRole,
}: AdvancedSystemSettingsProps) {
  const {
    config,
    updateSection,
    resetToDefaults,
    exportConfig,
    importConfig,
    generateEnvFile,
  } = useSystemConfig();

  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showEnvDialog, setShowEnvDialog] = useState(false);
  const [importData, setImportData] = useState("");

  // Check permissions based on user role
  const canEditSection = (section: string) => {
    switch (section) {
      case "company":
        return ["ADMIN", "MARKETING"].includes(userRole);
      case "integrations":
        return ["ADMIN", "DESENVOLVEDOR"].includes(userRole);
      case "system":
        return ["ADMIN", "DESENVOLVEDOR"].includes(userRole);
      case "security":
        return ["ADMIN", "DESENVOLVEDOR"].includes(userRole);
      case "marketing":
        return ["ADMIN", "MARKETING"].includes(userRole);
      case "crm":
        return ["ADMIN", "CORRETOR", "ASSISTENTE"].includes(userRole);
      default:
        return userRole === "ADMIN";
    }
  };

  const showMessage = (
    text: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showMessage("Configurações salvas com sucesso!", "success");
    } catch (error) {
      showMessage("Erro ao salvar configurações", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      resetToDefaults();
      showMessage("Configurações restauradas para o padrão", "success");
      setShowConfirmReset(false);
    } catch (error) {
      showMessage("Erro ao restaurar configurações", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const configData = exportConfig();
    const blob = new Blob([configData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sistema-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage("Configurações exportadas com sucesso!");
  };

  const handleImport = () => {
    try {
      if (importConfig(importData)) {
        showMessage("Configurações importadas com sucesso!", "success");
        setImportData("");
      } else {
        showMessage("Erro no formato do arquivo de configuração", "error");
      }
    } catch (error) {
      showMessage("Erro ao importar configurações", "error");
    }
  };

  const handleCopyEnv = () => {
    const envData = generateEnvFile();
    navigator.clipboard.writeText(envData);
    showMessage("Variáveis de ambiente copiadas para área de transferência!");
  };

  const tabs = [
    { id: "company", label: "Empresa", icon: Building },
    { id: "integrations", label: "Integrações", icon: Globe },
    { id: "system", label: "Sistema", icon: Database },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "marketing", label: "Marketing", icon: BarChart3 },
    { id: "crm", label: "CRM", icon: MessageSquare },
    { id: "notifications", label: "Notificações", icon: Bell },
  ].filter((tab) => canEditSection(tab.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
          <p className="text-muted-foreground">
            Configure todos os aspectos do sistema de acordo com suas
            necessidades
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEnvDialog(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            .env
          </Button>
          <Dialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Restauração</DialogTitle>
              </DialogHeader>
              <p>
                Tem certeza que deseja restaurar todas as configurações para o
                padrão? Esta ação não pode ser desfeita.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmReset(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Restaurar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center space-x-2"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input
                    id="company-name"
                    value={config.company.name}
                    onChange={(e) =>
                      updateSection("company", { name: e.target.value })
                    }
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="company-cnpj">CNPJ</Label>
                  <Input
                    id="company-cnpj"
                    value={config.company.cnpj}
                    onChange={(e) =>
                      updateSection("company", { cnpj: e.target.value })
                    }
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="company-phone">Telefone</Label>
                  <Input
                    id="company-phone"
                    value={config.company.phone}
                    onChange={(e) =>
                      updateSection("company", { phone: e.target.value })
                    }
                    placeholder="(00) 0 0000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={config.company.email}
                    onChange={(e) =>
                      updateSection("company", { email: e.target.value })
                    }
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="company-creci">CRECI</Label>
                  <Input
                    id="company-creci"
                    value={config.company.creci}
                    onChange={(e) =>
                      updateSection("company", { creci: e.target.value })
                    }
                    placeholder="12345-GO"
                  />
                </div>
                <div>
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={config.company.website}
                    onChange={(e) =>
                      updateSection("company", { website: e.target.value })
                    }
                    placeholder="https://empresa.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company-address">Endereço</Label>
                <Textarea
                  id="company-address"
                  value={config.company.address}
                  onChange={(e) =>
                    updateSection("company", { address: e.target.value })
                  }
                  placeholder="Endereço completo da empresa"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-logo">Logo (Tema Claro)</Label>
                  <Input
                    id="company-logo"
                    value={config.company.logo}
                    onChange={(e) =>
                      updateSection("company", { logo: e.target.value })
                    }
                    placeholder="URL da logo para tema claro"
                  />
                </div>
                <div>
                  <Label htmlFor="company-logo-dark">Logo (Tema Escuro)</Label>
                  <Input
                    id="company-logo-dark"
                    value={config.company.logoDark}
                    onChange={(e) =>
                      updateSection("company", { logoDark: e.target.value })
                    }
                    placeholder="URL da logo para tema escuro"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          {/* WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>WhatsApp Business</span>
                <Switch
                  checked={config.integrations.whatsapp.enabled}
                  onCheckedChange={(enabled) =>
                    updateSection("integrations", {
                      whatsapp: { ...config.integrations.whatsapp, enabled },
                    })
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp-business-id">Business ID</Label>
                  <Input
                    id="whatsapp-business-id"
                    value={config.integrations.whatsapp.businessId}
                    onChange={(e) =>
                      updateSection("integrations", {
                        whatsapp: {
                          ...config.integrations.whatsapp,
                          businessId: e.target.value,
                        },
                      })
                    }
                    placeholder="ID da conta business"
                    disabled={!config.integrations.whatsapp.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-token">Access Token</Label>
                  <Input
                    id="whatsapp-token"
                    type="password"
                    value={config.integrations.whatsapp.accessToken}
                    onChange={(e) =>
                      updateSection("integrations", {
                        whatsapp: {
                          ...config.integrations.whatsapp,
                          accessToken: e.target.value,
                        },
                      })
                    }
                    placeholder="Token de acesso"
                    disabled={!config.integrations.whatsapp.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Configurações de Email</span>
                <Switch
                  checked={config.integrations.email.enabled}
                  onCheckedChange={(enabled) =>
                    updateSection("integrations", {
                      email: { ...config.integrations.email, enabled },
                    })
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <Input
                    id="smtp-host"
                    value={config.integrations.email.smtpHost}
                    onChange={(e) =>
                      updateSection("integrations", {
                        email: {
                          ...config.integrations.email,
                          smtpHost: e.target.value,
                        },
                      })
                    }
                    placeholder="smtp.gmail.com"
                    disabled={!config.integrations.email.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-port">Porta SMTP</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={config.integrations.email.smtpPort}
                    onChange={(e) =>
                      updateSection("integrations", {
                        email: {
                          ...config.integrations.email,
                          smtpPort: parseInt(e.target.value),
                        },
                      })
                    }
                    placeholder="587"
                    disabled={!config.integrations.email.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-user">Usuário SMTP</Label>
                  <Input
                    id="smtp-user"
                    value={config.integrations.email.smtpUser}
                    onChange={(e) =>
                      updateSection("integrations", {
                        email: {
                          ...config.integrations.email,
                          smtpUser: e.target.value,
                        },
                      })
                    }
                    placeholder="usuario@gmail.com"
                    disabled={!config.integrations.email.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-password">Senha SMTP</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={config.integrations.email.smtpPassword}
                    onChange={(e) =>
                      updateSection("integrations", {
                        email: {
                          ...config.integrations.email,
                          smtpPassword: e.target.value,
                        },
                      })
                    }
                    placeholder="senha ou app password"
                    disabled={!config.integrations.email.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Maps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Google Maps</span>
                <Switch
                  checked={config.integrations.maps.enabled}
                  onCheckedChange={(enabled) =>
                    updateSection("integrations", {
                      maps: { ...config.integrations.maps, enabled },
                    })
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="maps-api-key">API Key</Label>
                <Input
                  id="maps-api-key"
                  type="password"
                  value={config.integrations.maps.googleMapsApiKey}
                  onChange={(e) =>
                    updateSection("integrations", {
                      maps: {
                        ...config.integrations.maps,
                        googleMapsApiKey: e.target.value,
                      },
                    })
                  }
                  placeholder="Chave da API do Google Maps"
                  disabled={!config.integrations.maps.enabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="environment">Ambiente</Label>
                  <Select
                    value={config.system.environment}
                    onValueChange={(value: any) =>
                      updateSection("system", { environment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">
                        Desenvolvimento
                      </SelectItem>
                      <SelectItem value="staging">Homologação</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="log-level">Nível de Log</Label>
                  <Select
                    value={config.system.logLevel}
                    onValueChange={(value: any) =>
                      updateSection("system", { logLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max-upload">Tamanho Máximo Upload (MB)</Label>
                  <Input
                    id="max-upload"
                    type="number"
                    value={config.system.maxUploadSize}
                    onChange={(e) =>
                      updateSection("system", {
                        maxUploadSize: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="session-timeout">
                    Timeout da Sessão (min)
                  </Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={config.system.sessionTimeout}
                    onChange={(e) =>
                      updateSection("system", {
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativa página de manutenção para todos os usuários
                    </p>
                  </div>
                  <Switch
                    checked={config.system.maintenanceMode}
                    onCheckedChange={(maintenanceMode) =>
                      updateSection("system", { maintenanceMode })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Debug</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe informações de debug no console
                    </p>
                  </div>
                  <Switch
                    checked={config.system.debugMode}
                    onCheckedChange={(debugMode) =>
                      updateSection("system", { debugMode })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Realiza backup automático dos dados
                    </p>
                  </div>
                  <Switch
                    checked={config.system.autoBackup}
                    onCheckedChange={(autoBackup) =>
                      updateSection("system", { autoBackup })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Environment Variables Dialog */}
      <Dialog open={showEnvDialog} onOpenChange={setShowEnvDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Variáveis de Ambiente (.env)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copie as variáveis abaixo para seu arquivo .env no servidor:
            </p>
            <Textarea
              value={generateEnvFile()}
              readOnly
              rows={15}
              className="font-mono text-xs"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEnvDialog(false)}>
                Fechar
              </Button>
              <Button onClick={handleCopyEnv}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
