// Tipos de usuários e autenticação
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
  ativo: boolean;
  papel: Papel;
  googleId?: string;
  avatar?: string;
  criadoEm: Date;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  expires: string;
}

// Enums
export enum Papel {
  ADMIN = "ADMIN",
  CORRETOR = "CORRETOR",
  ASSISTENTE = "ASSISTENTE",
  CLIENTE = "CLIENTE",
  MARKETING = "MARKETING",
  DESENVOLVEDOR = "DESENVOLVEDOR",
}

export enum TipoImovel {
  CASA = "CASA",
  APARTAMENTO = "APARTAMENTO",
  TERRENO = "TERRENO",
  COMERCIAL = "COMERCIAL",
  RURAL = "RURAL",
}

export enum Finalidade {
  VENDA = "VENDA",
  ALUGUEL = "ALUGUEL",
  AMBOS = "AMBOS",
}

export enum StatusImovel {
  DISPONIVEL = "DISPONIVEL",
  VENDIDO = "VENDIDO",
  ALUGADO = "ALUGADO",
  RESERVADO = "RESERVADO",
  INATIVO = "INATIVO",
}

export enum StatusLead {
  PENDENTE = "PENDENTE",
  ASSUMIDO = "ASSUMIDO",
  EXPIRADO = "EXPIRADO",
  CONVERTIDO = "CONVERTIDO",
  PERDIDO = "PERDIDO",
}

// Interfaces dos modelos
export interface Imovel {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoImovel;
  finalidade: Finalidade;
  preco: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  fotos: string[];
  status: StatusImovel;
  destaque: boolean;
  corretorId: string;
  corretor?: Usuario;
  criadoEm: Date;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  mensagem: string;
  origem: string;
  status: StatusLead;
  corretorId?: string;
  corretor?: Usuario;
  imovelId?: string;
  imovel?: Imovel;
  respostaIa?: string;
  criadoEm: Date;
}

export interface Visita {
  id: string;
  dataHora: Date;
  status: string;
  observacoes?: string;
  clienteId: string;
  cliente?: Usuario;
  imovelId: string;
  imovel?: Imovel;
  criadoEm: Date;
}

export interface Contrato {
  id: string;
  tipo: string;
  valor: number;
  dataInicio: Date;
  dataFim?: Date;
  status: string;
  termos: string;
  clienteId: string;
  cliente?: Usuario;
  imovelId: string;
  imovel?: Imovel;
  corretorId: string;
  criadoEm: Date;
}

export interface Comissao {
  id: string;
  valor: number;
  percentual: number;
  status: string;
  dataPagamento?: Date;
  corretorId: string;
  corretor?: Usuario;
  contratoId: string;
  contrato?: Contrato;
  criadoEm: Date;
}

// Requests e responses da API
export interface CreateImovelRequest {
  titulo: string;
  descricao: string;
  tipo: TipoImovel;
  finalidade: Finalidade;
  preco: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  endereco: string;
  bairro: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  fotos: string[];
  destaque?: boolean;
}

export interface CreateLeadRequest {
  nome: string;
  telefone: string;
  email?: string;
  mensagem: string;
  imovelId?: string;
}

export interface UpdateCorretorRequest {
  whatsapp?: string;
  ativo?: boolean;
}

export interface ChatMessage {
  id: string;
  conteudo: string;
  remetente: "usuario" | "ia";
  timestamp: Date;
}

export interface ChatRequest {
  mensagem: string;
  usuarioId?: string;
  contexto?: string;
}

export interface ChatResponse {
  resposta: string;
  timestamp: Date;
}

// Filtros e paginação
export interface FiltroImoveis {
  tipo?: TipoImovel;
  finalidade?: Finalidade;
  precoMin?: number;
  precoMax?: number;
  quartos?: number;
  banheiros?: number;
  bairro?: string;
  cidade?: string;
  status?: StatusImovel;
}

export interface Paginacao {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard types
export interface DashboardStats {
  totalImoveis: number;
  imoveisDisponiveis: number;
  imoveisVendidos: number;
  imoveisAlugados: number;
  leadsAtivos: number;
  visitasAgendadas: number;
  comissoesTotal: number;
  comissoesPendentes: number;
}

export interface CorretorStats extends DashboardStats {
  meusImoveis: number;
  meusLeads: number;
  minhasVisitas: number;
  minhasComissoes: number;
}

// N8N Integration
export interface N8NLeadWebhook {
  nome: string;
  telefone: string;
  mensagem: string;
  imovelId?: string;
}

export interface N8NCorretorResponse {
  corretorId: string;
  leadId: string;
  mensagem: string;
}

// Constants
export const CONTATOS = {
  empresa: {
    whatsapp: "5562985563505",
    instagram: "imoveissiqueiracampos",
    email: "SiqueiraCamposImoveisGoiania@gmail.com",
  },
  desenvolvedor: {
    whatsapp: "5517981805327",
    instagram: "kryon.ix",
    nome: "Vitor Jayme Fernandes Ferreira",
  },
};

export const SUBDOMINIOS = {
  main: "www.siqueicamposimoveis.com.br",
  cliente: "cliente.siqueicamposimoveis.com.br",
  app: "app.siqueicamposimoveis.com.br",
  // Private subdomains - não devem aparecer na interface
  _admin: "admin.siqueicamposimoveis.com.br", // Admin interno
  _corretor: "corretor.siqueicamposimoveis.com.br", // Corretor/Assistente interno
  _marketing: "mkt.siqueicamposimoveis.com.br", // Marketing interno
  _dev: "dev.siqueicamposimoveis.com.br", // Desenvolvimento interno
};
