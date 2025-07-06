import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { ChatMessage, ChatRequest, ChatResponse } from "@shared/types";

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      conteudo:
        "Olá! Sou a assistente da Siqueira Campos Imóveis. Como posso ajudar você hoje? 😊",
      remetente: "ia",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conteudo: inputMessage,
      remetente: "usuario",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const request: ChatRequest = {
        mensagem: inputMessage,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          conteudo: data.resposta,
          remetente: "ia",
          timestamp: new Date(data.timestamp),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Erro na resposta da API");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        conteudo:
          "Desculpe, ocorreu um erro. Tente novamente ou entre em contato conosco pelo WhatsApp.",
        remetente: "ia",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3 bg-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
              <CardTitle className="text-lg">Chat ao Vivo</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/80">
            Assistente virtual da Siqueira Campos
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.remetente === "usuario"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.remetente === "usuario"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.remetente === "usuario"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.remetente === "usuario" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.remetente === "usuario"
                        ? "bg-primary text-white"
                        : "bg-white border shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.conteudo}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.remetente === "usuario"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-white border shadow-sm rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce delay-100"></div>
                      <div className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInputMessage("Gostaria de agendar uma visita")
                }
                className="text-xs"
              >
                Agendar visita
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInputMessage("Tenho interesse em comprar um imóvel")
                }
                className="text-xs"
              >
                Comprar imóvel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage("Quero alugar um apartamento")}
                className="text-xs"
              >
                Alugar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
