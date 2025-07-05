import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar usuários de exemplo
  const adminPassword = await bcrypt.hash("admin123", 12);
  const corretorPassword = await bcrypt.hash("corretor123", 12);
  const clientePassword = await bcrypt.hash("cliente123", 12);

  // Admin
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@siqueicamposimoveis.com.br" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@siqueicamposimoveis.com.br",
      senha: adminPassword,
      papel: "ADMIN",
      ativo: true,
    },
  });

  // Corretor Juarez (Dono)
  const juarez = await prisma.usuario.upsert({
    where: { email: "juarez@siqueicamposimoveis.com.br" },
    update: {},
    create: {
      nome: "Juarez Siqueira Campos",
      email: "juarez@siqueicamposimoveis.com.br",
      senha: corretorPassword,
      papel: "CORRETOR",
      whatsapp: "5562985563505",
      ativo: true,
    },
  });

  // Corretor exemplo
  const corretor = await prisma.usuario.upsert({
    where: { email: "corretor@siqueicamposimoveis.com.br" },
    update: {},
    create: {
      nome: "Carlos Silva",
      email: "corretor@siqueicamposimoveis.com.br",
      senha: corretorPassword,
      papel: "CORRETOR",
      whatsapp: "5562999887766",
      ativo: true,
    },
  });

  // Assistente
  const assistente = await prisma.usuario.upsert({
    where: { email: "assistente@siqueicamposimoveis.com.br" },
    update: {},
    create: {
      nome: "Maria Santos",
      email: "assistente@siqueicamposimoveis.com.br",
      senha: corretorPassword,
      papel: "ASSISTENTE",
      whatsapp: "5562988776655",
      ativo: true,
    },
  });

  // Cliente exemplo
  const cliente = await prisma.usuario.upsert({
    where: { email: "cliente@siqueicamposimoveis.com.br" },
    update: {},
    create: {
      nome: "João da Silva",
      email: "cliente@siqueicamposimoveis.com.br",
      senha: clientePassword,
      papel: "CLIENTE",
      ativo: true,
    },
  });

  // Marketing
  const marketing = await prisma.usuario.upsert({
    where: { email: "marketing@siqueicamposimoveis.com.br" },
    update: {},
    create: {
      nome: "Ana Marketing",
      email: "marketing@siqueicamposimoveis.com.br",
      senha: corretorPassword,
      papel: "MARKETING",
      ativo: true,
    },
  });

  // Desenvolvedor (Kryonix)
  const dev = await prisma.usuario.upsert({
    where: { email: "dev@kryonix.dev" },
    update: {},
    create: {
      nome: "Vitor Jayme Fernandes Ferreira",
      email: "dev@kryonix.dev",
      senha: corretorPassword,
      papel: "DESENVOLVEDOR",
      whatsapp: "5517981805327",
      ativo: true,
    },
  });

  console.log("👥 Usuários criados:", {
    admin: admin.email,
    juarez: juarez.email,
    corretor: corretor.email,
    assistente: assistente.email,
    cliente: cliente.email,
    marketing: marketing.email,
    dev: dev.email,
  });

  // Criar imóveis de exemplo
  const imoveis = [
    {
      titulo: "Apartamento Moderno no Setor Bueno",
      descricao:
        "Apartamento de alto padrão com 3 quartos, sendo 1 suíte, 2 banheiros, sala ampla, cozinha planejada, área de serviço e 2 vagas de garagem. Localizado em uma das regiões mais valorizadas de Goiânia.",
      tipo: "APARTAMENTO",
      finalidade: "VENDA",
      preco: 650000,
      area: 120.5,
      quartos: 3,
      banheiros: 2,
      vagas: 2,
      endereco: "Rua T-30, 1234",
      bairro: "Setor Bueno",
      cidade: "Goiânia",
      estado: "GO",
      cep: "74210-060",
      fotos: [
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      status: "DISPONIVEL",
      destaque: true,
      corretorId: juarez.id,
    },
    {
      titulo: "Casa Térrea no Jardim Goiás",
      descricao:
        "Casa espaçosa com 4 quartos, sendo 2 suítes, 3 banheiros, sala de estar, sala de jantar, cozinha, área gourmet, piscina e 3 vagas de garagem. Terreno de 400m².",
      tipo: "CASA",
      finalidade: "VENDA",
      preco: 450000,
      area: 250.0,
      quartos: 4,
      banheiros: 3,
      vagas: 3,
      endereco: "Rua das Flores, 567",
      bairro: "Jardim Goiás",
      cidade: "Goiânia",
      estado: "GO",
      cep: "74805-120",
      fotos: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      status: "DISPONIVEL",
      destaque: true,
      corretorId: corretor.id,
    },
    {
      titulo: "Apartamento para Aluguel no Setor Oeste",
      descricao:
        "Apartamento mobiliado com 2 quartos, 2 banheiros, sala, cozinha americana e 1 vaga de garagem. Próximo ao centro da cidade.",
      tipo: "APARTAMENTO",
      finalidade: "ALUGUEL",
      preco: 2500,
      area: 85.0,
      quartos: 2,
      banheiros: 2,
      vagas: 1,
      endereco: "Avenida T-1, 890",
      bairro: "Setor Oeste",
      cidade: "Goiânia",
      estado: "GO",
      cep: "74110-010",
      fotos: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      status: "DISPONIVEL",
      destaque: true,
      corretorId: assistente.id,
    },
    {
      titulo: "Terreno no Setor Sul",
      descricao:
        "Terreno plano de 600m² em área nobre, pronto para construção. Documentação regular e financiamento disponível.",
      tipo: "TERRENO",
      finalidade: "VENDA",
      preco: 180000,
      area: 600.0,
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      endereco: "Rua 135, Quadra 45, Lote 15",
      bairro: "Setor Sul",
      cidade: "Goiânia",
      estado: "GO",
      cep: "74080-100",
      fotos: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      status: "DISPONIVEL",
      destaque: false,
      corretorId: juarez.id,
    },
    {
      titulo: "Casa de Luxo no Jardim América",
      descricao:
        "Casa de alto padrão com 5 quartos, sendo 3 suítes, 4 banheiros, sala de cinema, área gourmet completa, piscina aquecida e 4 vagas de garagem.",
      tipo: "CASA",
      finalidade: "VENDA",
      preco: 1200000,
      area: 450.0,
      quartos: 5,
      banheiros: 4,
      vagas: 4,
      endereco: "Rua das Orquídeas, 123",
      bairro: "Jardim América",
      cidade: "Goiânia",
      estado: "GO",
      cep: "74255-030",
      fotos: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      ],
      status: "DISPONIVEL",
      destaque: true,
      corretorId: corretor.id,
    },
  ];

  for (const imovelData of imoveis) {
    await prisma.imovel.create({
      data: imovelData,
    });
  }

  console.log("🏠 Imóveis criados:", imoveis.length);

  // Criar alguns leads de exemplo
  const leads = [
    {
      nome: "Maria Oliveira",
      telefone: "5562987654321",
      email: "maria@email.com",
      mensagem:
        "Gostaria de agendar uma visita para o apartamento no Setor Bueno",
      origem: "SITE",
      status: "PENDENTE",
    },
    {
      nome: "Pedro Santos",
      telefone: "5562912345678",
      email: "pedro@email.com",
      mensagem: "Tenho interesse na casa do Jardim Goiás",
      origem: "WHATSAPP",
      status: "ASSUMIDO",
      corretorId: corretor.id,
    },
    {
      nome: "Ana Costa",
      telefone: "5562999887766",
      mensagem: "Procuro apartamento para alugar no centro",
      origem: "TELEFONE",
      status: "CONVERTIDO",
      corretorId: juarez.id,
    },
  ];

  for (const leadData of leads) {
    await prisma.lead.create({
      data: leadData,
    });
  }

  console.log("📧 Leads criados:", leads.length);

  // Criar logs de sistema
  await prisma.logSistema.create({
    data: {
      acao: "SEED_DATABASE",
      detalhes: "Banco de dados inicializado com dados de exemplo",
      usuarioId: admin.id,
    },
  });

  console.log("✅ Seed do banco de dados concluído com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
