import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PDFGeneratorOptions {
  title: string;
  content?: any;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  includeHeader?: boolean;
  includeFooter?: boolean;
  author?: string;
  subject?: string;
}

interface ReportData {
  titulo: string;
  subtitulo?: string;
  dataGeracao: Date;
  autor: string;
  dados: any[];
  graficos?: string[];
  observacoes?: string;
  periodo?: string;
}

export class ModernPDFGenerator {
  private doc: jsPDF;
  private logoUrl =
    "https://cdn.builder.io/api/v1/assets/f2a517b8d4884b66a8a5c1be8bd00feb/siqueira-campos-para-fundo-claro-6b4bbf?format=webp&width=200";
  private primaryColor = [139, 69, 19] as const; // Brown theme
  private secondaryColor = [245, 158, 11] as const; // Amber
  private textColor = [55, 65, 81] as const; // Gray-700

  constructor(options: PDFGeneratorOptions) {
    this.doc = new jsPDF({
      orientation: options.orientation || "portrait",
      unit: "mm",
      format: options.format || "a4",
    });

    // Metadata
    this.doc.setProperties({
      title: options.title,
      subject: options.subject || "Relatório Siqueira Campos Imóveis",
      author: options.author || "Siqueira Campos Imóveis",
      keywords: "relatório, imóveis, siqueira campos",
      creator: "Sistema Siqueira Campos",
    });
  }

  private async addLogo(x: number = 20, y: number = 15, width: number = 50) {
    try {
      // For now, we'll add a text-based logo since image loading needs to be handled differently
      this.doc.setFontSize(16);
      this.doc.setTextColor(
        this.primaryColor[0],
        this.primaryColor[1],
        this.primaryColor[2],
      );
      this.doc.setFont("helvetica", "bold");
      this.doc.text("SIQUEIRA CAMPOS", x, y);
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.text("IMÓVEIS", x, y + 5);
    } catch (error) {
      console.warn("Erro ao carregar logo:", error);
    }
  }

  private addHeader(titulo: string, subtitulo?: string) {
    // Logo
    this.addLogo();

    // Header background
    this.doc.setFillColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    this.doc.rect(0, 0, 210, 35, "F");

    // White text on header
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(titulo, 80, 20);

    if (subtitulo) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(subtitulo, 80, 28);
    }

    // Reset text color
    this.doc.setTextColor(
      this.textColor[0],
      this.textColor[1],
      this.textColor[2],
    );
  }

  private addFooter(pageNumber: number = 1) {
    const pageHeight = this.doc.internal.pageSize.height;

    // Footer line
    this.doc.setDrawColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    this.doc.setLineWidth(0.5);
    this.doc.line(20, pageHeight - 20, 190, pageHeight - 20);

    // Footer text
    this.doc.setFontSize(8);
    this.doc.setTextColor(128, 128, 128);
    this.doc.text(
      "Siqueira Campos Imóveis - Realizando sonhos há mais de 15 anos",
      20,
      pageHeight - 15,
    );

    this.doc.text(`Página ${pageNumber}`, 190, pageHeight - 15, {
      align: "right",
    });

    this.doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      105,
      pageHeight - 10,
      { align: "center" },
    );
  }

  public async generateSalesReport(data: ReportData): Promise<void> {
    this.addHeader(data.titulo, data.subtitulo);

    let yPosition = 50;

    // Informações do relatório
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    this.doc.text("Informações do Relatório", 20, yPosition);

    yPosition += 10;
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(
      this.textColor[0],
      this.textColor[1],
      this.textColor[2],
    );

    const infoData = [
      ["Período:", data.periodo || "Dezembro 2024"],
      ["Gerado por:", data.autor],
      ["Data de geração:", data.dataGeracao.toLocaleDateString("pt-BR")],
      ["Total de vendas:", data.dados.length.toString()],
    ];

    infoData.forEach(([label, value]) => {
      this.doc.text(label, 20, yPosition);
      this.doc.text(value, 60, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Tabela de vendas
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    this.doc.text("Vendas Realizadas", 20, yPosition);

    yPosition += 10;

    // Headers da tabela
    const headers = ["Imóvel", "Corretor", "Valor", "Data"];
    const columnWidths = [60, 40, 30, 30];
    let xPosition = 20;

    this.doc.setFillColor(
      this.secondaryColor[0],
      this.secondaryColor[1],
      this.secondaryColor[2],
    );
    this.doc.rect(20, yPosition - 5, 160, 8, "F");

    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255);

    headers.forEach((header, i) => {
      this.doc.text(header, xPosition + 2, yPosition);
      xPosition += columnWidths[i];
    });

    yPosition += 10;
    this.doc.setTextColor(
      this.textColor[0],
      this.textColor[1],
      this.textColor[2],
    );
    this.doc.setFont("helvetica", "normal");

    // Dados da tabela
    data.dados.forEach((venda, index) => {
      if (yPosition > 250) {
        // Nova página se necessário
        this.addFooter(1);
        this.doc.addPage();
        this.addHeader(data.titulo, data.subtitulo);
        yPosition = 50;
      }

      xPosition = 20;

      // Zebra striping
      if (index % 2 === 0) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(20, yPosition - 3, 160, 6, "F");
      }

      const rowData = [
        venda.imovel,
        venda.corretor,
        `R$ ${venda.valor.toLocaleString("pt-BR")}`,
        venda.data,
      ];

      rowData.forEach((data, i) => {
        this.doc.text(data, xPosition + 2, yPosition);
        xPosition += columnWidths[i];
      });

      yPosition += 8;
    });

    // Resumo financeiro
    yPosition += 10;
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    this.doc.text("Resumo Financeiro", 20, yPosition);

    yPosition += 10;
    const totalVendas = data.dados.reduce((sum, venda) => sum + venda.valor, 0);
    const ticketMedio = totalVendas / data.dados.length;

    this.doc.setFillColor(240, 253, 244);
    this.doc.rect(20, yPosition - 5, 160, 25, "F");

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(
      this.textColor[0],
      this.textColor[1],
      this.textColor[2],
    );

    const resumoData = [
      ["Total de vendas:", `R$ ${totalVendas.toLocaleString("pt-BR")}`],
      ["Número de transações:", data.dados.length.toString()],
      ["Ticket médio:", `R$ ${ticketMedio.toLocaleString("pt-BR")}`],
    ];

    resumoData.forEach(([label, value], index) => {
      this.doc.text(label, 25, yPosition + index * 6);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(value, 100, yPosition + index * 6);
      this.doc.setFont("helvetica", "normal");
    });

    // Observações
    if (data.observacoes) {
      yPosition += 35;
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(
        this.primaryColor[0],
        this.primaryColor[1],
        this.primaryColor[2],
      );
      this.doc.text("Observações", 20, yPosition);

      yPosition += 8;
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(
        this.textColor[0],
        this.textColor[1],
        this.textColor[2],
      );

      const lines = this.doc.splitTextToSize(data.observacoes, 160);
      this.doc.text(lines, 20, yPosition);
    }

    this.addFooter(1);
  }

  public async generatePerformanceReport(data: ReportData): Promise<void> {
    this.addHeader(data.titulo, data.subtitulo);

    let yPosition = 50;

    // Performance dos corretores
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(
      this.primaryColor[0],
      this.primaryColor[1],
      this.primaryColor[2],
    );
    this.doc.text("Performance dos Corretores", 20, yPosition);

    yPosition += 15;

    // Headers da tabela
    const headers = [
      "Corretor",
      "Vendas",
      "Volume (R$)",
      "Comissão",
      "Performance",
    ];
    const columnWidths = [40, 25, 35, 30, 30];
    let xPosition = 20;

    this.doc.setFillColor(
      this.secondaryColor[0],
      this.secondaryColor[1],
      this.secondaryColor[2],
    );
    this.doc.rect(20, yPosition - 5, 160, 8, "F");

    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255);

    headers.forEach((header, i) => {
      this.doc.text(header, xPosition + 2, yPosition);
      xPosition += columnWidths[i];
    });

    yPosition += 10;
    this.doc.setTextColor(
      this.textColor[0],
      this.textColor[1],
      this.textColor[2],
    );
    this.doc.setFont("helvetica", "normal");

    // Dados dos corretores
    data.dados.forEach((corretor, index) => {
      xPosition = 20;

      if (index % 2 === 0) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(20, yPosition - 3, 160, 6, "F");
      }

      const performance =
        corretor.vendas >= 5
          ? "Excelente"
          : corretor.vendas >= 3
            ? "Boa"
            : "Regular";

      const rowData = [
        corretor.nome,
        corretor.vendas.toString(),
        `${(corretor.volume / 1000).toFixed(0)}k`,
        `R$ ${corretor.comissao.toLocaleString("pt-BR")}`,
        performance,
      ];

      rowData.forEach((data, i) => {
        this.doc.text(data, xPosition + 2, yPosition);
        xPosition += columnWidths[i];
      });

      yPosition += 8;
    });

    this.addFooter(1);
  }

  public save(filename: string): void {
    this.doc.save(filename);
  }

  public async saveFromHTML(
    elementId: string,
    filename: string,
  ): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Elemento não encontrado");
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    this.addHeader("Relatório Personalizado");
    let position = 40;

    this.doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position;

    while (heightLeft >= 0) {
      this.doc.addPage();
      this.addHeader("Relatório Personalizado");
      position = 40 - heightLeft;
      this.doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 40;
    }

    this.addFooter(1);
    this.save(filename);
  }
}

// Funções utilitárias para geração de relatórios específicos
export const generateSalesReport = async (dados: any[]) => {
  const generator = new ModernPDFGenerator({
    title: "Relatório de Vendas",
    author: "Siqueira Campos Imóveis",
    subject: "Relatório de Vendas Mensal",
    content: dados,
  });

  const reportData: ReportData = {
    titulo: "Relatório de Vendas",
    subtitulo: "Análise completa das vendas realizadas",
    dataGeracao: new Date(),
    autor: "Sistema Administrativo",
    periodo: "Dezembro 2024",
    dados: dados,
    observacoes:
      "Este relatório apresenta um panorama completo das vendas realizadas no período, incluindo métricas de performance e análise financeira detalhada.",
  };

  await generator.generateSalesReport(reportData);
  generator.save(
    `relatorio-vendas-${new Date().toISOString().split("T")[0]}.pdf`,
  );
};

export const generatePerformanceReport = async (dados: any[]) => {
  const generator = new ModernPDFGenerator({
    title: "Relatório de Performance",
    author: "Siqueira Campos Imóveis",
    subject: "Análise de Performance dos Corretores",
    content: dados,
  });

  const reportData: ReportData = {
    titulo: "Relatório de Performance",
    subtitulo: "Análise de desempenho dos corretores",
    dataGeracao: new Date(),
    autor: "Administração",
    periodo: "Q4 2024",
    dados: dados,
  };

  await generator.generatePerformanceReport(reportData);
  generator.save(
    `relatorio-performance-${new Date().toISOString().split("T")[0]}.pdf`,
  );
};

export const generateCustomReport = async (
  elementId: string,
  title: string,
) => {
  const generator = new ModernPDFGenerator({
    title: title,
    author: "Siqueira Campos Imóveis",
    content: null,
  });

  await generator.saveFromHTML(
    elementId,
    `${title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
  );
};
