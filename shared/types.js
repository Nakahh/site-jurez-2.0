// Enums
export var Papel;
(function (Papel) {
    Papel["ADMIN"] = "ADMIN";
    Papel["CORRETOR"] = "CORRETOR";
    Papel["ASSISTENTE"] = "ASSISTENTE";
    Papel["CLIENTE"] = "CLIENTE";
    Papel["MARKETING"] = "MARKETING";
    Papel["DESENVOLVEDOR"] = "DESENVOLVEDOR";
})(Papel || (Papel = {}));
export var TipoImovel;
(function (TipoImovel) {
    TipoImovel["CASA"] = "CASA";
    TipoImovel["APARTAMENTO"] = "APARTAMENTO";
    TipoImovel["TERRENO"] = "TERRENO";
    TipoImovel["COMERCIAL"] = "COMERCIAL";
    TipoImovel["RURAL"] = "RURAL";
})(TipoImovel || (TipoImovel = {}));
export var Finalidade;
(function (Finalidade) {
    Finalidade["VENDA"] = "VENDA";
    Finalidade["ALUGUEL"] = "ALUGUEL";
    Finalidade["AMBOS"] = "AMBOS";
})(Finalidade || (Finalidade = {}));
export var StatusImovel;
(function (StatusImovel) {
    StatusImovel["DISPONIVEL"] = "DISPONIVEL";
    StatusImovel["VENDIDO"] = "VENDIDO";
    StatusImovel["ALUGADO"] = "ALUGADO";
    StatusImovel["RESERVADO"] = "RESERVADO";
    StatusImovel["INATIVO"] = "INATIVO";
})(StatusImovel || (StatusImovel = {}));
export var StatusLead;
(function (StatusLead) {
    StatusLead["PENDENTE"] = "PENDENTE";
    StatusLead["ASSUMIDO"] = "ASSUMIDO";
    StatusLead["EXPIRADO"] = "EXPIRADO";
    StatusLead["CONVERTIDO"] = "CONVERTIDO";
    StatusLead["PERDIDO"] = "PERDIDO";
})(StatusLead || (StatusLead = {}));
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
