// APIs integration service for real estate data

interface CEPResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

interface FinancingRate {
  bank: string;
  rate: number;
  conditions: string;
  maxTerm: number;
  maxFinancing: number;
}

interface PropertyValuation {
  estimatedValue: number;
  confidence: number;
  comparables: Array<{
    address: string;
    value: number;
    distance: number;
  }>;
}

export class APIService {
  // ViaCEP API for address lookup
  static async searchCEP(cep: string): Promise<CEPResponse | null> {
    try {
      const cleanCEP = cep.replace(/\D/g, "");
      if (cleanCEP.length !== 8) return null;

      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCEP}/json/`,
      );
      const data = await response.json();

      if (data.erro) return null;
      return data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return null;
    }
  }

  // Mock financing rates API (in production, integrate with real bank APIs)
  static async getFinancingRates(): Promise<FinancingRate[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        bank: "Caixa Econômica Federal",
        rate: 8.16,
        conditions: "Relacionamento + Conta Salário",
        maxTerm: 420, // months
        maxFinancing: 1500000,
      },
      {
        bank: "Banco do Brasil",
        rate: 8.99,
        conditions: "Cliente BB + Débito Automático",
        maxTerm: 420,
        maxFinancing: 1200000,
      },
      {
        bank: "Santander",
        rate: 9.49,
        conditions: "Relacionamento Premium",
        maxTerm: 360,
        maxFinancing: 1000000,
      },
      {
        bank: "Itaú",
        rate: 9.75,
        conditions: "Conta Corrente + Seguro",
        maxTerm: 360,
        maxFinancing: 1000000,
      },
      {
        bank: "Bradesco",
        rate: 9.89,
        conditions: "Cliente Prime",
        maxTerm: 360,
        maxFinancing: 800000,
      },
    ];
  }

  // Mock property valuation API
  static async estimatePropertyValue(
    address: string,
    area: number,
    rooms: number,
    neighborhood: string,
  ): Promise<PropertyValuation> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock calculation based on neighborhood
    const neighborhoodMultipliers: Record<string, number> = {
      "Jardim Goiás": 4200,
      "Setor Oeste": 3800,
      Aldeota: 3200,
      "Alto da Glória": 5500,
      "Setor Bueno": 4000,
      Marista: 4500,
      "Vila Brasília": 2800,
      Campinas: 2500,
    };

    const basePrice = neighborhoodMultipliers[neighborhood] || 3000;
    const roomMultiplier = 1 + (rooms - 1) * 0.15;
    const estimatedValue = area * basePrice * roomMultiplier;

    // Add some variance for realism
    const variance = 0.15;
    const finalValue = estimatedValue * (1 + (Math.random() - 0.5) * variance);

    return {
      estimatedValue: Math.round(finalValue),
      confidence: Math.round(75 + Math.random() * 20), // 75-95%
      comparables: [
        {
          address: `Rua ${Math.floor(Math.random() * 999)}, ${neighborhood}`,
          value: Math.round(finalValue * (0.9 + Math.random() * 0.2)),
          distance: Math.round(Math.random() * 500 + 100),
        },
        {
          address: `Avenida ${Math.floor(Math.random() * 999)}, ${neighborhood}`,
          value: Math.round(finalValue * (0.9 + Math.random() * 0.2)),
          distance: Math.round(Math.random() * 800 + 200),
        },
        {
          address: `Quadra ${Math.floor(Math.random() * 99)}, ${neighborhood}`,
          value: Math.round(finalValue * (0.9 + Math.random() * 0.2)),
          distance: Math.round(Math.random() * 300 + 50),
        },
      ],
    };
  }

  // Mock Google Places API for nearby amenities
  static async getNearbyAmenities(lat: number, lng: number, type: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockAmenities = {
      school: [
        { name: "Colégio Sesi", distance: 500, rating: 4.5 },
        { name: "Escola Municipal", distance: 800, rating: 4.2 },
        { name: "Colégio Objetivo", distance: 1200, rating: 4.7 },
      ],
      hospital: [
        { name: "Hospital Encore", distance: 1200, rating: 4.4 },
        { name: "Clínica Santa Genoveva", distance: 800, rating: 4.3 },
        { name: "Hospital Araújo Jorge", distance: 2500, rating: 4.6 },
      ],
      shopping: [
        { name: "Flamboyant Shopping", distance: 800, rating: 4.5 },
        { name: "Shopping Cerrado", distance: 1500, rating: 4.3 },
        { name: "Goiânia Shopping", distance: 3000, rating: 4.4 },
      ],
      bank: [
        { name: "Banco do Brasil", distance: 300, rating: 4.0 },
        { name: "Caixa Econômica", distance: 450, rating: 3.9 },
        { name: "Santander", distance: 600, rating: 4.1 },
      ],
    };

    return mockAmenities[type as keyof typeof mockAmenities] || [];
  }

  // Mock IPTU calculation API
  static async calculateIPTU(
    propertyValue: number,
    area: number,
    city: string = "Goiânia",
  ): Promise<{ annual: number; monthly: number; rate: number }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock IPTU calculation for Goiânia
    // In reality, this would connect to municipal APIs
    const baseRate = 0.006; // 0.6% of property value
    let rate = baseRate;

    // Progressive rate based on property value
    if (propertyValue > 500000) rate = 0.008;
    if (propertyValue > 1000000) rate = 0.01;
    if (propertyValue > 2000000) rate = 0.012;

    const annual = propertyValue * rate;
    const monthly = annual / 12;

    return {
      annual: Math.round(annual),
      monthly: Math.round(monthly),
      rate: rate * 100, // Convert to percentage
    };
  }

  // Mock weather API for property location
  static async getLocationWeather(lat: number, lng: number) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock weather data for Goiânia region
    const mockWeather = {
      temperature: Math.round(22 + Math.random() * 12), // 22-34°C
      humidity: Math.round(45 + Math.random() * 30), // 45-75%
      condition: ["Ensolarado", "Parcialmente Nublado", "Nublado"][
        Math.floor(Math.random() * 3)
      ],
      windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
      uv: Math.round(3 + Math.random() * 8), // UV index 3-11
    };

    return mockWeather;
  }

  // Mock crime statistics API
  static async getNeighborhoodSafety(neighborhood: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock safety data
    const safetyScores: Record<string, number> = {
      "Jardim Goiás": 85,
      "Setor Oeste": 78,
      Aldeota: 72,
      "Alto da Glória": 88,
      "Setor Bueno": 82,
      Marista: 86,
      "Vila Brasília": 65,
      Campinas: 60,
    };

    const score = safetyScores[neighborhood] || 70;

    return {
      safetyScore: score,
      crimesPerMonth: Math.round((100 - score) * 0.3),
      lastUpdate: new Date().toISOString(),
      trend: score > 75 ? "improving" : score > 60 ? "stable" : "declining",
    };
  }

  // Mock public transport API
  static async getPublicTransport(lat: number, lng: number) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockTransport = {
      busStops: [
        {
          name: "Terminal Padre Pelágio",
          distance: 400,
          lines: ["201", "202", "301"],
        },
        {
          name: "Praça da Bíblia",
          distance: 800,
          lines: ["101", "205", "401"],
        },
        { name: "Setor Oeste", distance: 600, lines: ["102", "203", "302"] },
      ],
      metroStations: [
        { name: "Estação Goiânia", distance: 2500, line: "Linha 1" },
      ],
      walkScore: Math.round(60 + Math.random() * 30), // 60-90
      transitScore: Math.round(50 + Math.random() * 40), // 50-90
    };

    return mockTransport;
  }

  // WhatsApp API integration
  static async sendWhatsAppMessage(phone: string, message: string) {
    try {
      // In production, integrate with Evolution API or similar
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, message }),
      });

      return await response.json();
    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error);
      throw error;
    }
  }

  // Email API integration
  static async sendEmail(to: string, subject: string, content: string) {
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, content }),
      });

      return await response.json();
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      throw error;
    }
  }
}
