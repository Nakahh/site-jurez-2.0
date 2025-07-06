-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "whatsapp" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "papel" TEXT NOT NULL DEFAULT 'CLIENTE',
    "googleId" TEXT,
    "avatar" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "imoveis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "finalidade" TEXT NOT NULL,
    "preco" REAL NOT NULL,
    "area" REAL NOT NULL,
    "quartos" INTEGER NOT NULL,
    "banheiros" INTEGER NOT NULL,
    "vagas" INTEGER,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "fotos" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "corretorId" TEXT NOT NULL,
    CONSTRAINT "imoveis_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "mensagem" TEXT,
    "origem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "corretorId" TEXT,
    "imovelId" TEXT,
    CONSTRAINT "leads_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leads_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    CONSTRAINT "favoritos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favoritos_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "visitas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataHora" DATETIME NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AGENDADA',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "clienteId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "leadId" TEXT,
    CONSTRAINT "visitas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "visitas_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "visitas_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "clienteId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    CONSTRAINT "contratos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contratos_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comissoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "valor" REAL NOT NULL,
    "percentual" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" DATETIME,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "corretorId" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    CONSTRAINT "comissoes_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comissoes_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remetenteId" TEXT NOT NULL,
    "leadId" TEXT,
    CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mensagens_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "notificacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "logs_sistema" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,
    CONSTRAINT "logs_sistema_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_googleId_key" ON "usuarios"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_usuarioId_imovelId_key" ON "favoritos"("usuarioId", "imovelId");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_numero_key" ON "contratos"("numero");
