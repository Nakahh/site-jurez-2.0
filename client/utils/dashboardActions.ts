import { NavigateFunction } from "react-router-dom";

// Common dashboard actions utility
export class DashboardActions {
  private navigate: NavigateFunction;

  constructor(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  // Navigation actions
  navigateToPage(path: string, openInNewTab = false) {
    if (openInNewTab) {
      window.open(path, "_blank");
    } else {
      this.navigate(path);
    }
  }

  navigateToDashboard(userRole: string, tab?: string, showNew = false) {
    const role = userRole.toLowerCase();
    const path = `/dashboard/${role}`;

    if (tab || showNew) {
      this.navigate(path, {
        state: {
          activeTab: tab,
          showNew,
        },
      });
    } else {
      this.navigate(path);
    }
  }

  // Property actions
  viewProperty(propertyId: string) {
    this.navigate(`/imovel/${propertyId}`);
  }

  editProperty(propertyId: string, userRole: string) {
    // Navigate to property edit page based on user role
    if (userRole === "ADMIN") {
      this.navigateToDashboard("admin", "imoveis", false);
    } else if (userRole === "CORRETOR") {
      this.navigate(`/corretor/imoveis`);
    }
  }

  scheduleVisit(propertyId: string, userRole: string) {
    if (userRole === "CLIENTE") {
      this.navigateToDashboard("cliente", "agendamentos", true);
    } else {
      this.navigateToDashboard(userRole.toLowerCase(), "agendamentos", true);
    }
  }

  // Lead actions
  createLead(userRole: string) {
    this.navigateToDashboard(userRole.toLowerCase(), "leads", true);
  }

  editLead(leadId: string, userRole: string) {
    this.navigateToDashboard(userRole.toLowerCase(), "leads", false);
  }

  contactLead(phone: string, method: "call" | "whatsapp" = "call") {
    const cleanPhone = phone.replace(/\D/g, "");

    if (method === "call") {
      window.open(`tel:+55${cleanPhone}`, "_self");
    } else {
      const message =
        "Olá! Sou da Siqueira Campos Imóveis. Vi seu interesse e gostaria de ajudá-lo.";
      window.open(
        `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    }
  }

  // Report actions
  generateReport(reportType: string, userRole: string) {
    console.log(`Generating ${reportType} report for ${userRole}`);

    // In a real implementation, this would call the appropriate service
    const reportData = {
      date: new Date().toISOString(),
      type: reportType,
      user: userRole,
      data: {},
    };

    // Simulate report generation
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return Promise.resolve("Report generated successfully");
  }

  // Settings actions
  openSettings(userRole: string) {
    this.navigateToDashboard(userRole.toLowerCase(), "configuracoes");
  }

  openHelp() {
    this.navigate("/help");
  }

  // Marketing actions
  createCampaign() {
    this.navigateToDashboard("marketing", "campanhas", true);
  }

  createContent() {
    this.navigateToDashboard("marketing", "conteudo", true);
  }

  // Developer actions
  viewLogs() {
    this.navigateToDashboard("desenvolvedor", "logs");
  }

  performBackup() {
    console.log("Performing system backup...");
    return Promise.resolve("Backup completed successfully");
  }

  // Admin actions
  manageUsers() {
    this.navigateToDashboard("admin", "usuarios");
  }

  viewSystemStatus() {
    this.navigateToDashboard("admin", "sistema");
  }

  // Utility actions
  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Copied to clipboard:", text);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  }

  downloadFile(url: string, filename: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // External integrations
  openWhatsAppBusiness() {
    window.open("https://business.whatsapp.com/", "_blank");
  }

  openGoogleCalendar() {
    window.open("https://calendar.google.com/", "_blank");
  }

  // Search and filter actions
  searchProperties(criteria: any) {
    const params = new URLSearchParams();
    Object.keys(criteria).forEach((key) => {
      if (criteria[key]) {
        params.append(key, criteria[key]);
      }
    });

    this.navigate(`/imoveis?${params.toString()}`);
  }

  // Notification actions
  markNotificationAsRead(notificationId: string) {
    console.log("Marking notification as read:", notificationId);
    // In real implementation, this would call an API
  }

  // Export/Import actions
  exportData(dataType: string, format: "csv" | "json" | "pdf" = "csv") {
    console.log(`Exporting ${dataType} as ${format}`);
    return this.generateReport(dataType, "export");
  }

  importData(file: File) {
    console.log("Importing data from file:", file.name);
    // In real implementation, this would process the file
    return Promise.resolve("Data imported successfully");
  }
}

// Factory function to create dashboard actions
export const createDashboardActions = (navigate: NavigateFunction) => {
  return new DashboardActions(navigate);
};

// Common action handlers that can be used across dashboards
export const commonHandlers = {
  handleError: (error: any, message = "Ocorreu um erro") => {
    console.error("Dashboard error:", error);
    alert(`${message}: ${error.message || error}`);
  },

  handleSuccess: (message = "Operação realizada com sucesso") => {
    console.log("Success:", message);
    // In real implementation, this might show a toast notification
  },

  confirmAction: (message: string, onConfirm: () => void) => {
    if (confirm(message)) {
      onConfirm();
    }
  },

  formatCurrency: (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  },

  formatDate: (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  },

  formatPhone: (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    }
    return phone;
  },
};
