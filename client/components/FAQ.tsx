import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "Como posso financiar um imóvel?",
    answer:
      "Oferecemos parcerias com os principais bancos do mercado. Nossa equipe te ajuda a encontrar as melhores condições de financiamento, incluindo programas como Casa Verde e Amarela, FGTS e financiamentos convencionais. O processo inclui análise de crédito, simulação e acompanhamento até a aprovação.",
  },
  {
    question: "Quais documentos preciso para comprar um imóvel?",
    answer:
      "Para comprar um imóvel você precisará de: RG, CPF, comprovante de renda dos últimos 3 meses, declaração de imposto de renda dos últimos 2 anos, extratos bancários, certidão de casamento (se aplicável) e comprovante de residência. Para financiamento, documentos adicionais podem ser solicitados pelo banco.",
  },
  {
    question: "Vocês fazem avaliação de imóveis?",
    answer:
      "Sim! Fazemos avaliação gratuita de imóveis para clientes que desejam vender ou comprar. Nossa equipe experiente analisa localização, estado de conservação, mercado local e comparativos para determinar o valor justo do imóvel.",
  },
  {
    question: "Como funciona o processo de venda?",
    answer:
      "O processo inclui: 1) Avaliação gratuita do seu imóvel; 2) Elaboração de estratégia de marketing; 3) Fotos profissionais e divulgação; 4) Agendamento e acompanhamento de visitas; 5) Negociação com interessados; 6) Documentação e fechamento do negócio.",
  },
  {
    question: "Vocês atendem em quais bairros de Goiânia?",
    answer:
      "Atendemos em toda Goiânia e região metropolitana, com especialização nos principais bairros como Jardim Goiás, Setor Oeste, Setor Bueno, Aldeota, Alto da Glória, Park Lozandes, Residencial Eldorado e muitos outros.",
  },
  {
    question: "Como agendar uma visita?",
    answer:
      "Você pode agendar uma visita através do nosso site, WhatsApp (62) 9 8556-3505, ou ligando diretamente. Temos horários flexíveis, incluindo finais de semana. Nossos corretores especializados acompanham todas as visitas.",
  },
  {
    question: "Vocês trabalham com permuta?",
    answer:
      "Sim, trabalhamos com permuta de imóveis. Avaliamos ambos os imóveis e fazemos a negociação considerando as diferenças de valor. É uma excelente opção para quem quer trocar de imóvel sem precisar vender primeiro.",
  },
  {
    question: "Qual a comissão cobrada?",
    answer:
      "Nossa comissão segue o padrão do mercado e varia conforme o tipo de transação. Oferecemos o melhor custo-benefício da região, com serviços completos incluindo marketing, documentação e acompanhamento pós-venda.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Esclarecemos as principais dúvidas sobre compra, venda e aluguel de
            imóveis em Goiânia
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-6 border-0 bg-card/80 backdrop-blur-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-border/50"
                >
                  <AccordionTrigger className="text-left hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </div>
    </section>
  );
}
