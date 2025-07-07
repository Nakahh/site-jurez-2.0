import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Crown,
  AlertCircle,
  MessageSquare,
  Calendar,
  Settings,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumServiceAlertProps {
  userRole: string;
  services?: string[]; // Specific services to check, if not provided, checks all relevant for role
}

export function PremiumServiceAlert({
  userRole,
  services,
}: PremiumServiceAlertProps) {
  const navigate = useNavigate();
  const [inactiveServices, setInactiveServices] = useState<string[]>([]);

  const serviceConfig = {
    "whatsapp-business": {
      name: "WhatsApp Business",
      price: 197.0,
      icon: MessageSquare,
      description: "Automação de leads e atendimento via WhatsApp",
    },
    "n8n-automation": {
      name: "N8N Automation",
      price: 147.0,
      icon: Zap,
      description: "Automação de processos e integrações",
    },
    "google-calendar": {
      name: "Google Calendar",
      price: 97.0,
      icon: Calendar,
      description: "Agendamento automático de visitas",
    },
    "meta-integration": {
      name: "Meta Business",
      price: 197.0,
      icon: Crown,
      description: "Publicação automática Facebook e Instagram",
    },
  };

  const roleServices = {
    ADMIN: ["whatsapp-business", "n8n-automation", "google-calendar"],
    CORRETOR: ["whatsapp-business", "n8n-automation", "google-calendar"],
    ASSISTENTE: ["whatsapp-business", "n8n-automation", "google-calendar"],
    MARKETING: ["meta-integration"],
  };

  useEffect(() => {
    checkServices();

    // Escutar mudanças nos serviços premium
    const handleServiceToggle = (e: CustomEvent) => {
      console.log("PremiumServiceAlert: Serviço alterado", e.detail);
      checkServices();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("Active")) {
        checkServices();
      }
    };

    window.addEventListener(
      "premiumServiceToggled",
      handleServiceToggle as EventListener,
    );
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "premiumServiceToggled",
        handleServiceToggle as EventListener,
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [userRole, services]);

  const checkServices = () => {
    const servicesToCheck =
      services || roleServices[userRole as keyof typeof roleServices] || [];
    const inactive: string[] = [];

    servicesToCheck.forEach((serviceId) => {
      const isActive = localStorage.getItem(`${serviceId}Active`) === "true";
      if (!isActive) {
        inactive.push(serviceId);
      }
    });

    setInactiveServices(inactive);
  };

  const getTotalValue = () => {
    return inactiveServices.reduce((total, serviceId) => {
      return (
        total +
        (serviceConfig[serviceId as keyof typeof serviceConfig]?.price || 0)
      );
    }, 0);
  };

  const handleActivateService = () => {
    navigate("/dashboard/desenvolvedor", { state: { activeTab: "premium" } });
  };

  if (inactiveServices.length === 0) {
    return null; // No inactive services, don't show alert
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 mb-6">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Serviços Premium Inativos
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              {inactiveServices.length === 1
                ? "1 serviço premium está inativo"
                : `${inactiveServices.length} serviços premium estão inativos`}
              . Ative para ter acesso completo às automações.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {inactiveServices.map((serviceId) => {
                const service =
                  serviceConfig[serviceId as keyof typeof serviceConfig];
                if (!service) return null;

                const Icon = service.icon;
                return (
                  <div
                    key={serviceId}
                    className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border"
                  >
                    <Icon className="h-4 w-4 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {service.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {service.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      R$ {service.price.toFixed(0)}/mês
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Valor total:
              </span>
              <Badge className="bg-yellow-600 text-white">
                R$ {getTotalValue().toFixed(0)}/mês
              </Badge>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={handleActivateService}
              className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Ativar Serviços
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Simplified version for smaller spaces
export function PremiumServiceBanner({ userRole }: { userRole: string }) {
  const navigate = useNavigate();
  const [hasInactiveServices, setHasInactiveServices] = useState(false);

  const roleServices = {
    ADMIN: ["whatsapp-business", "n8n-automation", "google-calendar"],
    CORRETOR: ["whatsapp-business", "n8n-automation", "google-calendar"],
    ASSISTENTE: ["whatsapp-business", "n8n-automation", "google-calendar"],
    MARKETING: ["meta-integration"],
  };

  useEffect(() => {
    const servicesToCheck =
      roleServices[userRole as keyof typeof roleServices] || [];
    const hasInactive = servicesToCheck.some((serviceId) => {
      return localStorage.getItem(`${serviceId}Active`) !== "true";
    });
    setHasInactiveServices(hasInactive);
  }, [userRole]);

  if (!hasInactiveServices) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-950 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                Serviços Premium Disponíveis
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Ative automações para melhorar sua produtividade
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              navigate("/dashboard/desenvolvedor", {
                state: { activeTab: "premium" },
              })
            }
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Ver Serviços
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
