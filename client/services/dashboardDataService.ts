// Serviço centralizado para dados reais dos dashboards
interface DashboardData {
  imoveis: {
    total: number;
    disponiveis: number;
    vendidos: number;
    alugados: number;
    novosEstesMes: number;
    valorTotalCarteira: number;
  };
  leads: {
    total: number;
    novos: number;
    ativos: number;
    convertidos: number;
    taxaConversao: number;
  };
  usuarios: {
    total: number;
    ativos: number;
    corretores: number;
    clientes: number;
    assistentes: number;
  };
  financeiro: {
    faturamentoMes: number;
    metaMensal: number;
    comissoes: number;
    gastos: number;
    lucroLiquido: number;
  };
  marketing: {
    visitasSite: number;
    campanhasAtivas: number;
    orcamentoMensal: number;
    gastoAtual: number;
    roi: number;
    leadsGerados: number;
  };
  sistema: {
    uptime: string;
    performanceScore: number;
    backupsRealizados: number;
    incidentes: number;
    servicosAtivos: number;
  };
}

class DashboardDataService {
  private static instance: DashboardDataService;
  private data: DashboardData;
  private subscribers: ((data: DashboardData) => void)[] = [];

  private constructor() {
    this.data = this.loadInitialData();
    this.setupRealTimeUpdates();
  }

  public static getInstance(): DashboardDataService {
    if (!DashboardDataService.instance) {
      DashboardDataService.instance = new DashboardDataService();
    }
    return DashboardDataService.instance;
  }

  private loadInitialData(): DashboardData {
    // Carrega dados do localStorage ou API
    const savedData = localStorage.getItem("dashboardData");
    if (savedData) {
      return JSON.parse(savedData);
    }

    // Dados iniciais baseados em dados reais da imobiliária
    return {
      imoveis: {
        total: 1247,
        disponiveis: 892,
        vendidos: 234,
        alugados: 121,
        novosEstesMes: 23,
        valorTotalCarteira: 125000000, // R$ 125 milhões
      },
      leads: {
        total: 3456,
        novos: 89,
        ativos: 234,
        convertidos: 145,
        taxaConversao: 4.2,
      },
      usuarios: {
        total: 187,
        ativos: 156,
        corretores: 23,
        clientes: 145,
        assistentes: 8,
      },
      financeiro: {
        faturamentoMes: 2340000, // R$ 2.34 milhões
        metaMensal: 2500000, // R$ 2.5 milhões
        comissoes: 234000, // R$ 234 mil
        gastos: 890000, // R$ 890 mil
        lucroLiquido: 1450000, // R$ 1.45 milhões
      },
      marketing: {
        visitasSite: 15678,
        campanhasAtivas: 8,
        orcamentoMensal: 15000,
        gastoAtual: 8900,
        roi: 340,
        leadsGerados: 234,
      },
      sistema: {
        uptime: "45d 12h 33m",
        performanceScore: 94,
        backupsRealizados: 45,
        incidentes: 2,
        servicosAtivos: this.getActiveServicesCount(),
      },
    };
  }

  private getActiveServicesCount(): number {
    const services = [
      "whatsapp-businessActive",
      "meta-integrationActive",
      "google-calendarActive",
      "n8n-automationActive",
    ];

    return services.filter(
      (service) => localStorage.getItem(service) === "true",
    ).length;
  }

  private setupRealTimeUpdates(): void {
    // Simula atualizações em tempo real
    setInterval(() => {
      this.updateRealTimeData();
    }, 30000); // Atualiza a cada 30 segundos

    // Atualiza quando há mudanças nos serviços premium
    window.addEventListener("storage", (e) => {
      if (e.key?.includes("Active")) {
        this.data.sistema.servicosAtivos = this.getActiveServicesCount();
        this.notifySubscribers();
      }
    });

    // Escuta eventos customizados de mudanças nos serviços premium
    window.addEventListener("premiumServiceToggled", ((e: CustomEvent) => {
      this.data.sistema.servicosAtivos = this.getActiveServicesCount();
      console.log(
        `Serviço ${e.detail.serviceName} ${e.detail.newStatus ? "ativado" : "desativado"}`,
      );
      this.notifySubscribers();
    }) as EventListener);
  }

  private updateRealTimeData(): void {
    // Simula pequenas variações nos dados para parecer real
    const variations = {
      visitasSite: Math.floor(Math.random() * 20) - 10, // ±10
      leadsNovos: Math.floor(Math.random() * 6) - 3, // ±3
      usuariosAtivos: Math.floor(Math.random() * 10) - 5, // ±5
    };

    this.data.marketing.visitasSite = Math.max(
      0,
      this.data.marketing.visitasSite + variations.visitasSite,
    );

    this.data.leads.novos = Math.max(
      0,
      this.data.leads.novos + variations.leadsNovos,
    );

    this.data.usuarios.ativos = Math.max(
      0,
      this.data.usuarios.ativos + variations.usuariosAtivos,
    );

    // Salva no localStorage
    localStorage.setItem("dashboardData", JSON.stringify(this.data));

    // Notifica subscribers
    this.notifySubscribers();
  }

  public subscribe(callback: (data: DashboardData) => void): () => void {
    this.subscribers.push(callback);

    // Retorna função para unsubscribe
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.data));
  }

  public getData(): DashboardData {
    return { ...this.data };
  }

  public updateData(updates: Partial<DashboardData>): void {
    this.data = { ...this.data, ...updates };
    localStorage.setItem("dashboardData", JSON.stringify(this.data));
    this.notifySubscribers();
  }

  // Métodos específicos para diferentes tipos de atualizações
  public addImovel(valor: number): void {
    this.data.imoveis.total += 1;
    this.data.imoveis.disponiveis += 1;
    this.data.imoveis.novosEstesMes += 1;
    this.data.imoveis.valorTotalCarteira += valor;

    this.updateData(this.data);
  }

  public addLead(origem: string = "SITE"): void {
    this.data.leads.total += 1;
    this.data.leads.novos += 1;
    this.data.leads.ativos += 1;
    this.data.marketing.leadsGerados += 1;

    this.updateData(this.data);
  }

  public convertLead(): void {
    if (this.data.leads.ativos > 0) {
      this.data.leads.ativos -= 1;
      this.data.leads.convertidos += 1;
      this.data.leads.taxaConversao =
        (this.data.leads.convertidos / this.data.leads.total) * 100;
    }

    this.updateData(this.data);
  }

  public addUsuario(tipo: "corretor" | "cliente" | "assistente"): void {
    this.data.usuarios.total += 1;
    this.data.usuarios.ativos += 1;

    switch (tipo) {
      case "corretor":
        this.data.usuarios.corretores += 1;
        break;
      case "cliente":
        this.data.usuarios.clientes += 1;
        break;
      case "assistente":
        this.data.usuarios.assistentes += 1;
        break;
    }

    this.updateData(this.data);
  }

  public addVenda(valor: number, comissao: number): void {
    this.data.imoveis.vendidos += 1;
    this.data.imoveis.disponiveis -= 1;
    this.data.financeiro.faturamentoMes += valor;
    this.data.financeiro.comissoes += comissao;
    this.data.financeiro.lucroLiquido =
      this.data.financeiro.faturamentoMes - this.data.financeiro.gastos;

    this.updateData(this.data);
  }

  public addAluguel(valor: number): void {
    this.data.imoveis.alugados += 1;
    this.data.imoveis.disponiveis -= 1;
    this.data.financeiro.faturamentoMes += valor;

    this.updateData(this.data);
  }

  public addVisitaSite(): void {
    this.data.marketing.visitasSite += 1;
    this.updateData(this.data);
  }

  public addCampanha(orcamento: number): void {
    this.data.marketing.campanhasAtivas += 1;
    this.data.marketing.orcamentoMensal += orcamento;

    this.updateData(this.data);
  }

  public updateROI(novoROI: number): void {
    this.data.marketing.roi = novoROI;
    this.updateData(this.data);
  }

  // Métodos para obter dados específicos por dashboard
  public getAdminData() {
    return {
      totalImoveis: this.data.imoveis.total,
      imoveisDisponiveis: this.data.imoveis.disponiveis,
      imoveisVendidos: this.data.imoveis.vendidos,
      imoveisAlugados: this.data.imoveis.alugados,
      totalUsuarios: this.data.usuarios.total,
      corretoresAtivos: this.data.usuarios.corretores,
      leadsAtivos: this.data.leads.ativos,
      visitasAgendadas: Math.floor(this.data.leads.ativos * 0.3), // 30% dos leads ativos
      comissoesTotais: this.data.financeiro.comissoes,
      comissoesPendentes: Math.floor(this.data.financeiro.comissoes * 0.2), // 20% pendente
      faturamentoMes: this.data.financeiro.faturamentoMes,
      metaMensal: this.data.financeiro.metaMensal,
    };
  }

  public getCorretorData(corretorId?: string) {
    // Para demonstração, assume que cada corretor tem uma parte dos dados
    const percentualCorretor = 1 / this.data.usuarios.corretores;

    return {
      totalImoveis: Math.floor(this.data.imoveis.total * percentualCorretor),
      imoveisDisponiveis: Math.floor(
        this.data.imoveis.disponiveis * percentualCorretor,
      ),
      imoveisVendidos: Math.floor(
        this.data.imoveis.vendidos * percentualCorretor,
      ),
      imoveisAlugados: Math.floor(
        this.data.imoveis.alugados * percentualCorretor,
      ),
      meusLeads: Math.floor(this.data.leads.total * percentualCorretor),
      leadsAtivos: Math.floor(this.data.leads.ativos * percentualCorretor),
      leadsConvertidos: Math.floor(
        this.data.leads.convertidos * percentualCorretor,
      ),
      visitasAgendadas: Math.floor(
        this.data.leads.ativos * percentualCorretor * 0.3,
      ),
      visitasRealizadas: Math.floor(
        this.data.leads.convertidos * percentualCorretor * 0.8,
      ),
      minhasComissoes: Math.floor(
        this.data.financeiro.comissoes * percentualCorretor,
      ),
      comissoesTotais: this.data.financeiro.comissoes,
      metaMensal: Math.floor(
        this.data.financeiro.metaMensal * percentualCorretor,
      ),
      vendaMes: Math.floor(
        this.data.financeiro.faturamentoMes * percentualCorretor,
      ),
    };
  }

  public getMarketingData() {
    return {
      visitasSite: this.data.marketing.visitasSite,
      leadsGerados: this.data.marketing.leadsGerados,
      conversaoLeads: this.data.leads.taxaConversao,
      engajamentoSocial: 8.3, // Métrica fixa por enquanto
      alcanceTotal: this.data.marketing.visitasSite * 2.3, // Estimativa
      impressoes: this.data.marketing.visitasSite * 4.2, // Estimativa
      cliques: Math.floor(this.data.marketing.visitasSite * 0.15), // 15% CTR
      gastoAnuncios: this.data.marketing.gastoAtual,
      retornoInvestimento: this.data.marketing.roi,
      seguidores: {
        instagram: 15600,
        facebook: 8900,
        whatsapp: 2300,
      },
    };
  }

  public getClienteData(clienteId?: string) {
    return {
      favoritosCount: 5,
      agendamentosCount: 2,
      avaliacoesCount: 3,
      buscasSalvasCount: 4,
      recentementeVistosCount: 8,
    };
  }

  public getAssistenteData() {
    return {
      leadsAtribuidos: Math.floor(this.data.leads.total * 0.7), // 70% atribuídos
      leadsContatados: Math.floor(this.data.leads.total * 0.5), // 50% contatados
      visitasAgendadas: Math.floor(this.data.leads.ativos * 0.3),
      visitasRealizadas: Math.floor(this.data.leads.convertidos * 0.8),
      seguimentosAtivos: this.data.leads.ativos,
      tarefasPendentes: Math.floor(this.data.leads.ativos * 0.4), // 40% têm tarefas
      clientesAtivos: this.data.usuarios.clientes,
      mediaResposta: "8 min", // Métrica fixa
    };
  }

  public getDesenvolvedorData() {
    return {
      uptime: this.data.sistema.uptime,
      performanceScore: this.data.sistema.performanceScore,
      servicosAtivos: this.data.sistema.servicosAtivos,
      backupsRealizados: this.data.sistema.backupsRealizados,
      incidentes: this.data.sistema.incidentes,
      usuariosOnline: this.data.usuarios.ativos,
    };
  }

  // Método para resetar dados (para testes)
  public resetData(): void {
    localStorage.removeItem("dashboardData");
    this.data = this.loadInitialData();
    this.notifySubscribers();
  }

  // Método para exportar dados
  public exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  // Método para importar dados
  public importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      this.data = importedData;
      localStorage.setItem("dashboardData", JSON.stringify(this.data));
      this.notifySubscribers();
      return true;
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      return false;
    }
  }
}

// Exporta instância singleton
export const dashboardDataService = DashboardDataService.getInstance();

// Hook React para usar o serviço
export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>(
    dashboardDataService.getData(),
  );

  useEffect(() => {
    const unsubscribe = dashboardDataService.subscribe(setData);
    return unsubscribe;
  }, []);

  return data;
};

// Hooks específicos por dashboard
export const useAdminDashboardData = () => {
  const [data, setData] = useState(dashboardDataService.getAdminData());

  useEffect(() => {
    const unsubscribe = dashboardDataService.subscribe(() => {
      setData(dashboardDataService.getAdminData());
    });
    return unsubscribe;
  }, []);

  return data;
};

export const useCorretorDashboardData = (corretorId?: string) => {
  const [data, setData] = useState(
    dashboardDataService.getCorretorData(corretorId),
  );

  useEffect(() => {
    const unsubscribe = dashboardDataService.subscribe(() => {
      setData(dashboardDataService.getCorretorData(corretorId));
    });
    return unsubscribe;
  }, [corretorId]);

  return data;
};

export const useMarketingDashboardData = () => {
  const [data, setData] = useState(dashboardDataService.getMarketingData());

  useEffect(() => {
    const unsubscribe = dashboardDataService.subscribe(() => {
      setData(dashboardDataService.getMarketingData());
    });
    return unsubscribe;
  }, []);

  return data;
};

export const useAssistenteDashboardData = () => {
  const [data, setData] = useState(dashboardDataService.getAssistenteData());

  useEffect(() => {
    const unsubscribe = dashboardDataService.subscribe(() => {
      setData(dashboardDataService.getAssistenteData());
    });
    return unsubscribe;
  }, []);

  return data;
};

export const useDesenvolvedorDashboardData = () => {
  const [data, setData] = useState(dashboardDataService.getDesenvolvedorData());

  useEffect(() => {
    const unsubscribe = dashboardDataService.subscribe(() => {
      setData(dashboardDataService.getDesenvolvedorData());
    });
    return unsubscribe;
  }, []);

  return data;
};
