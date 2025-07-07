// Sistema centralizado para gerenciamento de serviços premium
import { useState, useEffect } from "react";

export interface PremiumService {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  category: "communication" | "automation" | "integration" | "productivity";
  requiredFor: string[]; // Quais roles precisam deste serviço
  dependencies?: string[]; // Serviços que dependem deste
}

export const PREMIUM_SERVICES: Record<string, PremiumService> = {
  "whatsapp-business": {
    id: "whatsapp-business",
    name: "WhatsApp Business Integration",
    description:
      "Integração completa com Evolution API para automação de leads",
    price: 197.0,
    features: [
      "Resposta automática de leads",
      "Distribuição inteligente para corretores",
      "Fallback após 15 minutos",
      "Histórico completo de conversas",
      "Notificações em tempo real",
      "N8N Integration Premium",
    ],
    category: "communication",
    requiredFor: ["ADMIN", "CORRETOR", "ASSISTENTE"],
  },
  "meta-integration": {
    id: "meta-integration",
    name: "Meta Business Integration",
    description:
      "Integração com Facebook e Instagram para publicação automática",
    price: 197.0,
    features: [
      "Publicação automática Instagram/Facebook",
      "Estatísticas em tempo real",
      "Gestão de campanhas",
      "Auto-posting de imóveis",
      "Analytics avançadas",
      "N8N Integration Premium",
    ],
    category: "integration",
    requiredFor: ["MARKETING", "ADMIN"],
  },
  "google-calendar": {
    id: "google-calendar",
    name: "Google Calendar Integration",
    description: "Agendamento automático de visitas com sincronização",
    price: 97.0,
    features: [
      "Sincronização com Google Calendar",
      "Agendamento automático de visitas",
      "Lembretes por email e WhatsApp",
      "Gestão de disponibilidade",
      "Relatórios de agendamentos",
      "N8N Integration",
    ],
    category: "productivity",
    requiredFor: ["ADMIN", "CORRETOR", "ASSISTENTE"],
  },
  "n8n-automation": {
    id: "n8n-automation",
    name: "N8N Automation Integration",
    description: "Automação completa de processos e integrações com APIs",
    price: 147.0,
    features: [
      "Workflows automáticos",
      "Integração com múltiplas APIs",
      "Processamento de dados",
      "Notificações automáticas",
      "Backup de workflows",
      "Suporte técnico especializado",
    ],
    category: "automation",
    requiredFor: ["ADMIN", "CORRETOR", "ASSISTENTE", "MARKETING"],
  },
};

class PremiumServicesManager {
  private static instance: PremiumServicesManager;
  private subscribers: Set<(services: Record<string, boolean>) => void> =
    new Set();
  private services: Record<string, boolean> = {};

  private constructor() {
    this.loadServices();
    this.setupEventListeners();
  }

  public static getInstance(): PremiumServicesManager {
    if (!PremiumServicesManager.instance) {
      PremiumServicesManager.instance = new PremiumServicesManager();
    }
    return PremiumServicesManager.instance;
  }

  private loadServices(): void {
    Object.keys(PREMIUM_SERVICES).forEach((serviceId) => {
      this.services[serviceId] =
        localStorage.getItem(`${serviceId}Active`) === "true";
    });
  }

  private setupEventListeners(): void {
    // Escutar mudanças no localStorage
    window.addEventListener("storage", (e) => {
      if (e.key?.includes("Active")) {
        this.loadServices();
        this.notifySubscribers();
      }
    });

    // Escutar eventos customizados
    window.addEventListener("premiumServiceToggled", ((e: CustomEvent) => {
      this.loadServices();
      this.notifySubscribers();
    }) as EventListener);
  }

  public isServiceActive(serviceId: string): boolean {
    return this.services[serviceId] || false;
  }

  public getActiveServices(): string[] {
    return Object.keys(this.services).filter(
      (serviceId) => this.services[serviceId],
    );
  }

  public getInactiveServices(): string[] {
    return Object.keys(this.services).filter(
      (serviceId) => !this.services[serviceId],
    );
  }

  public getServicesForRole(role: string): string[] {
    return Object.values(PREMIUM_SERVICES)
      .filter((service) => service.requiredFor.includes(role.toUpperCase()))
      .map((service) => service.id);
  }

  public getInactiveServicesForRole(role: string): PremiumService[] {
    const requiredServices = this.getServicesForRole(role);
    return requiredServices
      .filter((serviceId) => !this.isServiceActive(serviceId))
      .map((serviceId) => PREMIUM_SERVICES[serviceId])
      .filter(Boolean);
  }

  public getTotalCost(serviceIds?: string[]): number {
    const services = serviceIds || this.getActiveServices();
    return services.reduce((total, serviceId) => {
      const service = PREMIUM_SERVICES[serviceId];
      return total + (service ? service.price : 0);
    }, 0);
  }

  public canActivateService(serviceId: string): {
    canActivate: boolean;
    reasons: string[];
  } {
    const service = PREMIUM_SERVICES[serviceId];
    if (!service) {
      return { canActivate: false, reasons: ["Serviço não encontrado"] };
    }

    const reasons: string[] = [];
    let canActivate = true;

    // Verificar dependências
    if (service.dependencies) {
      service.dependencies.forEach((depId) => {
        if (!this.isServiceActive(depId)) {
          const depService = PREMIUM_SERVICES[depId];
          if (depService) {
            reasons.push(`Requer ${depService.name} ativo`);
            canActivate = false;
          }
        }
      });
    }

    return { canActivate, reasons };
  }

  public activateService(serviceId: string): boolean {
    const { canActivate, reasons } = this.canActivateService(serviceId);

    if (!canActivate) {
      console.warn(`Não é possível ativar ${serviceId}:`, reasons);
      return false;
    }

    localStorage.setItem(`${serviceId}Active`, "true");

    // Compatibilidade com nomes antigos
    const compatNames = {
      "meta-integration": "metaIntegrationActive",
      "whatsapp-business": "whatsappBusinessActive",
      "google-calendar": "googleCalendarActive",
      "n8n-automation": "n8nAutomationActive",
    };

    const compatName = compatNames[serviceId as keyof typeof compatNames];
    if (compatName) {
      localStorage.setItem(compatName, "true");
    }

    this.loadServices();
    this.notifySubscribers();

    // Disparar evento customizado
    window.dispatchEvent(
      new CustomEvent("premiumServiceToggled", {
        detail: {
          serviceId,
          newStatus: true,
          serviceName: PREMIUM_SERVICES[serviceId]?.name,
        },
      }),
    );

    return true;
  }

  public deactivateService(serviceId: string): boolean {
    localStorage.setItem(`${serviceId}Active`, "false");

    // Compatibilidade com nomes antigos
    const compatNames = {
      "meta-integration": "metaIntegrationActive",
      "whatsapp-business": "whatsappBusinessActive",
      "google-calendar": "googleCalendarActive",
      "n8n-automation": "n8nAutomationActive",
    };

    const compatName = compatNames[serviceId as keyof typeof compatNames];
    if (compatName) {
      localStorage.setItem(compatName, "false");
    }

    // Verificar e desativar serviços dependentes
    Object.values(PREMIUM_SERVICES).forEach((service) => {
      if (
        service.dependencies?.includes(serviceId) &&
        this.isServiceActive(service.id)
      ) {
        this.deactivateService(service.id);
      }
    });

    this.loadServices();
    this.notifySubscribers();

    // Disparar evento customizado
    window.dispatchEvent(
      new CustomEvent("premiumServiceToggled", {
        detail: {
          serviceId,
          newStatus: false,
          serviceName: PREMIUM_SERVICES[serviceId]?.name,
        },
      }),
    );

    return true;
  }

  public subscribe(
    callback: (services: Record<string, boolean>) => void,
  ): () => void {
    this.subscribers.add(callback);

    // Enviar estado atual imediatamente
    callback(this.services);

    // Retornar função de unsubscribe
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.services));
  }

  public getServiceStatus(
    serviceId: string,
  ): "active" | "inactive" | "unknown" {
    if (!PREMIUM_SERVICES[serviceId]) return "unknown";
    return this.isServiceActive(serviceId) ? "active" : "inactive";
  }

  public getSystemSummary(): {
    totalServices: number;
    activeServices: number;
    inactiveServices: number;
    totalCost: number;
    monthlySavings: number;
  } {
    const totalServices = Object.keys(PREMIUM_SERVICES).length;
    const activeServices = this.getActiveServices().length;
    const inactiveServices = totalServices - activeServices;
    const totalCost = this.getTotalCost();
    const totalPossibleCost = this.getTotalCost(Object.keys(PREMIUM_SERVICES));
    const monthlySavings = totalPossibleCost - totalCost;

    return {
      totalServices,
      activeServices,
      inactiveServices,
      totalCost,
      monthlySavings,
    };
  }
}

// Hook React para usar o manager
export const usePremiumServices = () => {
  const [services, setServices] = useState<Record<string, boolean>>({});
  const manager = PremiumServicesManager.getInstance();

  useEffect(() => {
    const unsubscribe = manager.subscribe(setServices);
    return unsubscribe;
  }, [manager]);

  return {
    services,
    isActive: (serviceId: string) => manager.isServiceActive(serviceId),
    activate: (serviceId: string) => manager.activateService(serviceId),
    deactivate: (serviceId: string) => manager.deactivateService(serviceId),
    getActiveServices: () => manager.getActiveServices(),
    getInactiveServicesForRole: (role: string) =>
      manager.getInactiveServicesForRole(role),
    getTotalCost: (serviceIds?: string[]) => manager.getTotalCost(serviceIds),
    canActivate: (serviceId: string) => manager.canActivateService(serviceId),
    getSystemSummary: () => manager.getSystemSummary(),
    SERVICES: PREMIUM_SERVICES,
  };
};

// Exportar instância singleton
export const premiumServicesManager = PremiumServicesManager.getInstance();
