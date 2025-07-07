// Sistema central de configurações da aplicação
export interface SystemConfig {
  // Configurações da empresa
  company: {
    name: string;
    cnpj: string;
    phone: string;
    email: string;
    address: string;
    logo: string;
    logoDark: string;
    website: string;
    creci: string;
  };

  // Configurações de integração
  integrations: {
    whatsapp: {
      businessId: string;
      accessToken: string;
      enabled: boolean;
    };
    email: {
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      smtpPassword: string;
      enabled: boolean;
    };
    maps: {
      googleMapsApiKey: string;
      enabled: boolean;
    };
    storage: {
      type: "local" | "s3" | "cloudinary";
      s3Bucket?: string;
      s3Region?: string;
      s3AccessKey?: string;
      s3SecretKey?: string;
      cloudinaryCloudName?: string;
      cloudinaryApiKey?: string;
      cloudinaryApiSecret?: string;
      enabled: boolean;
    };
    payment: {
      stripePublicKey: string;
      stripeSecretKey: string;
      pixKey: string;
      pixType: "cpf" | "cnpj" | "email" | "random";
      enabled: boolean;
    };
    analytics: {
      googleAnalyticsId: string;
      facebookPixelId: string;
      enabled: boolean;
    };
  };

  // Configurações do sistema
  system: {
    environment: "development" | "staging" | "production";
    maintenanceMode: boolean;
    debugMode: boolean;
    maxUploadSize: number;
    sessionTimeout: number;
    backupFrequency: "daily" | "weekly" | "monthly";
    autoBackup: boolean;
    logLevel: "error" | "warn" | "info" | "debug";
  };

  // Configurações de notificação
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    webhookUrl: string;
    slackWebhook: string;
  };

  // Configurações de segurança
  security: {
    twoFactorEnabled: boolean;
    passwordExpiry: number;
    maxLoginAttempts: number;
    sessionEncryption: boolean;
    sslEnabled: boolean;
    corsOrigins: string[];
  };

  // Configurações de marketing
  marketing: {
    facebookPageId: string;
    instagramBusinessId: string;
    linkedinPageId: string;
    autoPostingEnabled: boolean;
    leadScoring: boolean;
    emailCampaignsEnabled: boolean;
  };

  // Configurações de CRM
  crm: {
    leadAutoAssignment: boolean;
    visitReminderTime: number;
    followUpSchedule: number[];
    pipelineStages: string[];
    customFields: { name: string; type: string; required: boolean }[];
  };
}

// Configuração padrão
export const defaultConfig: SystemConfig = {
  company: {
    name: "Siqueira Campos Imóveis",
    cnpj: "",
    phone: "(62) 9 8556-3505",
    email: "contato@siqueiracampos.com.br",
    address: "Goiânia - GO",
    logo: "https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=200",
    logoDark:
      "https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-escuro-e97fe8?format=webp&width=200",
    website: "https://siqueiracampos.com.br",
    creci: "12345-GO",
  },

  integrations: {
    whatsapp: {
      businessId: "",
      accessToken: "",
      enabled: false,
    },
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      enabled: false,
    },
    maps: {
      googleMapsApiKey: "",
      enabled: false,
    },
    storage: {
      type: "local",
      enabled: true,
    },
    payment: {
      stripePublicKey: "",
      stripeSecretKey: "",
      pixKey: "",
      pixType: "cnpj",
      enabled: false,
    },
    analytics: {
      googleAnalyticsId: "",
      facebookPixelId: "",
      enabled: false,
    },
  },

  system: {
    environment: "development",
    maintenanceMode: false,
    debugMode: true,
    maxUploadSize: 10,
    sessionTimeout: 30,
    backupFrequency: "daily",
    autoBackup: true,
    logLevel: "info",
  },

  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    webhookUrl: "",
    slackWebhook: "",
  },

  security: {
    twoFactorEnabled: false,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    sessionEncryption: true,
    sslEnabled: true,
    corsOrigins: ["http://localhost:3000"],
  },

  marketing: {
    facebookPageId: "",
    instagramBusinessId: "",
    linkedinPageId: "",
    autoPostingEnabled: false,
    leadScoring: true,
    emailCampaignsEnabled: true,
  },

  crm: {
    leadAutoAssignment: true,
    visitReminderTime: 30,
    followUpSchedule: [1, 3, 7, 15, 30],
    pipelineStages: [
      "Novo",
      "Qualificado",
      "Proposta",
      "Negociação",
      "Fechamento",
    ],
    customFields: [],
  },
};

// Sistema de configuração reativo
class SystemConfigManager {
  private config: SystemConfig;
  private listeners: ((config: SystemConfig) => void)[] = [];

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SystemConfig {
    try {
      const savedConfig = localStorage.getItem("systemConfig");
      if (savedConfig) {
        return { ...defaultConfig, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.warn("Erro ao carregar configuração salva:", error);
    }
    return defaultConfig;
  }

  private saveConfig(): void {
    try {
      localStorage.setItem("systemConfig", JSON.stringify(this.config));
      this.notifyListeners();
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.config));
  }

  public getConfig(): SystemConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  public updateSection<K extends keyof SystemConfig>(
    section: K,
    updates: Partial<SystemConfig[K]>,
  ): void {
    this.config[section] = { ...this.config[section], ...updates };
    this.saveConfig();
  }

  public subscribe(listener: (config: SystemConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public resetToDefaults(): void {
    this.config = { ...defaultConfig };
    this.saveConfig();
  }

  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  public importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = { ...defaultConfig, ...importedConfig };
      this.saveConfig();
      return true;
    } catch (error) {
      console.error("Erro ao importar configuração:", error);
      return false;
    }
  }

  // Helpers para valores específicos
  public getCompanyInfo() {
    return this.config.company;
  }

  public getIntegrationConfig(integration: keyof SystemConfig["integrations"]) {
    return this.config.integrations[integration];
  }

  public isMaintenanceMode(): boolean {
    return this.config.system.maintenanceMode;
  }

  public isFeatureEnabled(feature: string): boolean {
    // Check if specific features are enabled
    switch (feature) {
      case "whatsapp":
        return this.config.integrations.whatsapp.enabled;
      case "email":
        return this.config.integrations.email.enabled;
      case "maps":
        return this.config.integrations.maps.enabled;
      case "payments":
        return this.config.integrations.payment.enabled;
      case "analytics":
        return this.config.integrations.analytics.enabled;
      case "backups":
        return this.config.system.autoBackup;
      case "notifications":
        return this.config.notifications.emailNotifications;
      case "security":
        return this.config.security.twoFactorEnabled;
      case "marketing":
        return this.config.marketing.autoPostingEnabled;
      default:
        return false;
    }
  }

  // Generate environment variables for backend
  public generateEnvFile(): string {
    const env = [];

    // Company settings
    env.push(`COMPANY_NAME="${this.config.company.name}"`);
    env.push(`COMPANY_PHONE="${this.config.company.phone}"`);
    env.push(`COMPANY_EMAIL="${this.config.company.email}"`);

    // Database
    env.push(`NODE_ENV=${this.config.system.environment}`);
    env.push(`MAINTENANCE_MODE=${this.config.system.maintenanceMode}`);

    // Integrations
    if (this.config.integrations.whatsapp.enabled) {
      env.push(
        `WHATSAPP_BUSINESS_ID="${this.config.integrations.whatsapp.businessId}"`,
      );
      env.push(
        `WHATSAPP_ACCESS_TOKEN="${this.config.integrations.whatsapp.accessToken}"`,
      );
    }

    if (this.config.integrations.email.enabled) {
      env.push(`SMTP_HOST="${this.config.integrations.email.smtpHost}"`);
      env.push(`SMTP_PORT=${this.config.integrations.email.smtpPort}`);
      env.push(`SMTP_USER="${this.config.integrations.email.smtpUser}"`);
      env.push(
        `SMTP_PASSWORD="${this.config.integrations.email.smtpPassword}"`,
      );
    }

    if (this.config.integrations.maps.enabled) {
      env.push(
        `GOOGLE_MAPS_API_KEY="${this.config.integrations.maps.googleMapsApiKey}"`,
      );
    }

    if (this.config.integrations.payment.enabled) {
      env.push(
        `STRIPE_PUBLIC_KEY="${this.config.integrations.payment.stripePublicKey}"`,
      );
      env.push(
        `STRIPE_SECRET_KEY="${this.config.integrations.payment.stripeSecretKey}"`,
      );
      env.push(`PIX_KEY="${this.config.integrations.payment.pixKey}"`);
    }

    if (this.config.integrations.analytics.enabled) {
      env.push(
        `GOOGLE_ANALYTICS_ID="${this.config.integrations.analytics.googleAnalyticsId}"`,
      );
      env.push(
        `FACEBOOK_PIXEL_ID="${this.config.integrations.analytics.facebookPixelId}"`,
      );
    }

    // Security
    env.push(`TWO_FACTOR_ENABLED=${this.config.security.twoFactorEnabled}`);
    env.push(`MAX_LOGIN_ATTEMPTS=${this.config.security.maxLoginAttempts}`);
    env.push(`SESSION_TIMEOUT=${this.config.system.sessionTimeout}`);

    return env.join("\n");
  }
}

// Export singleton instance
export const systemConfig = new SystemConfigManager();

// React hook for using config in components
export function useSystemConfig() {
  const [config, setConfig] = React.useState<SystemConfig>(() =>
    systemConfig.getConfig(),
  );

  React.useEffect(() => {
    const unsubscribe = systemConfig.subscribe(setConfig);
    return unsubscribe;
  }, []);

  return {
    config,
    updateConfig: (updates: Partial<SystemConfig>) =>
      systemConfig.updateConfig(updates),
    updateSection: <K extends keyof SystemConfig>(
      section: K,
      updates: Partial<SystemConfig[K]>,
    ) => systemConfig.updateSection(section, updates),
    resetToDefaults: () => systemConfig.resetToDefaults(),
    exportConfig: () => systemConfig.exportConfig(),
    importConfig: (configJson: string) => systemConfig.importConfig(configJson),
    isFeatureEnabled: (feature: string) =>
      systemConfig.isFeatureEnabled(feature),
    generateEnvFile: () => systemConfig.generateEnvFile(),
  };
}

// Utility for checking if React is available
const React = typeof window !== "undefined" && (window as any).React;
