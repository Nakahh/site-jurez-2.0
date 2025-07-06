import { lazy, Suspense } from "react";
import { cn } from "@/lib/utils";

// Loading component
const PageLoader = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "min-h-screen flex items-center justify-center bg-background",
      className,
    )}
  >
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  </div>
);

// Error fallback
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-destructive mb-2">
        Erro ao carregar página
      </h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
      >
        Recarregar
      </button>
    </div>
  </div>
);

// Create lazy components with loading states
const createLazyComponent = (importFunc: () => Promise<any>) => {
  return lazy(importFunc);
};

// Lazy load all pages for optimal performance
export const LazyIndex = createLazyComponent(() => import("../pages/Index"));

export const LazyLogin = createLazyComponent(() => import("../pages/Login"));

export const LazySobre = createLazyComponent(() => import("../pages/Sobre"));

export const LazyContato = createLazyComponent(
  () => import("../pages/Contato"),
);

export const LazySimulador = createLazyComponent(
  () => import("../pages/Simulador"),
);

export const LazyDesenvolvedor = createLazyComponent(
  () => import("../pages/Desenvolvedor"),
);

export const LazyBlog = createLazyComponent(() => import("../pages/Blog"));

export const LazyImoveis = createLazyComponent(
  () => import("../pages/Imoveis"),
);

export const LazyImovel = createLazyComponent(() => import("../pages/Imovel"));

export const LazyComparador = createLazyComponent(
  () => import("../pages/Comparador"),
);

// Dashboard components
export const LazyCorretorDashboard = createLazyComponent(
  () => import("../pages/dashboards/CorretorDashboard"),
);

export const LazyAdminDashboard = createLazyComponent(
  () => import("../pages/dashboards/AdminDashboard"),
);

export const LazyClienteDashboard = createLazyComponent(
  () => import("../pages/dashboards/ClienteDashboard"),
);

export const LazyMarketingDashboard = createLazyComponent(
  () => import("../pages/dashboards/MarketingDashboard"),
);

export const LazyDesenvolvedorDashboard = createLazyComponent(
  () => import("../pages/dashboards/DesenvolvedorDashboard"),
);

export const LazyNotFound = createLazyComponent(
  () => import("../pages/NotFound"),
);

export { PageLoader, ErrorFallback };
