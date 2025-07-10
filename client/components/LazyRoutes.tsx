import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import loadable from "@loadable/component";

// Lazy loading com fallback robusto para mobile
const Index = loadable(() => import("../pages/Index"), {
  fallback: <LoadingFallback />,
});

const Imoveis = loadable(() => import("../pages/Imoveis"), {
  fallback: <LoadingFallback />,
});

const ImovelDetalhes = loadable(() => import("../pages/Imovel"), {
  fallback: <LoadingFallback />,
});

const Sobre = loadable(() => import("../pages/Sobre"), {
  fallback: <LoadingFallback />,
});

const Contato = loadable(() => import("../pages/Contato"), {
  fallback: <LoadingFallback />,
});

const Login = loadable(() => import("../pages/Login"), {
  fallback: <LoadingFallback />,
});

const Register = loadable(() => import("../pages/Login"), {
  fallback: <LoadingFallback />,
});

const ForgotPassword = loadable(() => import("../pages/ForgotPassword"), {
  fallback: <LoadingFallback />,
});

const Comparador = loadable(() => import("../pages/Comparador"), {
  fallback: <LoadingFallback />,
});

const SimuladorFinanciamento = loadable(
  () => import("../pages/SimuladorFinanciamento"),
  {
    fallback: <LoadingFallback />,
  },
);

const Blog = loadable(() => import("../pages/Blog"), {
  fallback: <LoadingFallback />,
});

const BlogPost = loadable(() => import("../pages/BlogPost"), {
  fallback: <LoadingFallback />,
});

// Dashboards
const ClienteDashboard = loadable(
  () => import("../pages/dashboards/ClienteDashboard"),
  {
    fallback: <LoadingFallback />,
  },
);

const CorretorDashboard = loadable(
  () => import("../pages/dashboards/CorretorDashboard"),
  {
    fallback: <LoadingFallback />,
  },
);

const AdminDashboard = loadable(
  () => import("../pages/dashboards/AdminDashboard"),
  {
    fallback: <LoadingFallback />,
  },
);

const AssistenteDashboard = loadable(
  () => import("../pages/dashboards/AssistenteDashboard"),
  {
    fallback: <LoadingFallback />,
  },
);

const MarketingDashboard = loadable(
  () => import("../pages/dashboards/MarketingDashboard"),
  {
    fallback: <LoadingFallback />,
  },
);

const DesenvolvedorDashboard = loadable(
  () => import("../pages/dashboards/DesenvolvedorDashboard"),
  {
    fallback: <LoadingFallback />,
  },
);

const CorretorImoveis = loadable(() => import("../pages/CorretorImoveis"), {
  fallback: <LoadingFallback />,
});

const CorretorLeads = loadable(() => import("../pages/CorretorLeads"), {
  fallback: <LoadingFallback />,
});

const Desenvolvedor = loadable(() => import("../pages/Desenvolvedor"), {
  fallback: <LoadingFallback />,
});

const NotFound = loadable(() => import("../pages/NotFound"), {
  fallback: <LoadingFallback />,
});

function LoadingFallback() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Carregando...");
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 15;
      });
    }, 100);

    // Timeout de segurança para mobile - mais rápido
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
      setLoadingText("Redirecionando...");
      // Redirecionar direto para home sem lazy loading
      window.location.href = "/";
    }, 5000); // 5 segundos apenas

    const textInterval = setInterval(() => {
      const texts = [
        "Carregando...",
        "Preparando interface...",
        "Quase pronto...",
      ];
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
      clearTimeout(timeout);
    };
  }, []);

  if (timeoutReached) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏠</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Redirecionando...</h2>
            <p className="text-muted-foreground mb-4">
              Carregando página inicial
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Ir para Página Inicial
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-sm mx-auto p-6 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏠</span>
          </div>
          <h1 className="text-xl font-bold text-primary">Siqueira Campos</h1>
          <p className="text-sm text-muted-foreground">Imóveis</p>
        </div>

        <div className="mb-6 relative">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-secondary rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <p className="text-muted-foreground font-medium mb-2">{loadingText}</p>

        <div className="text-xs text-muted-foreground mt-4">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

export function LazyRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/imoveis" element={<Imoveis />} />
        <Route path="/imovel/:id" element={<ImovelDetalhes />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/comparador" element={<Comparador />} />
        <Route path="/simulador" element={<SimuladorFinanciamento />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Dashboards */}
        <Route path="/dashboard/cliente" element={<ClienteDashboard />} />
        <Route path="/dashboard/corretor" element={<CorretorDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/assistente" element={<AssistenteDashboard />} />
        <Route path="/dashboard/marketing" element={<MarketingDashboard />} />
        <Route
          path="/dashboard/desenvolvedor"
          element={<DesenvolvedorDashboard />}
        />

        <Route path="/corretor/imoveis" element={<CorretorImoveis />} />
        <Route path="/corretor/leads" element={<CorretorLeads />} />
        <Route path="/desenvolvedor" element={<Desenvolvedor />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
