import { lazy } from "react";

// Loading component
export const PageLoader = ({ className }: { className?: string }) => (
  <div
    className={`min-h-screen flex items-center justify-center bg-background ${className}`}
  >
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  </div>
);

// Simple lazy components without additional wrappers
export const LazyIndex = lazy(() => import("../pages/Index"));
export const LazyLogin = lazy(() => import("../pages/Login"));
export const LazySobre = lazy(() => import("../pages/Sobre"));
export const LazyContato = lazy(() => import("../pages/Contato"));
export const LazySimulador = lazy(() => import("../pages/Simulador"));
export const LazyDesenvolvedor = lazy(() => import("../pages/Desenvolvedor"));
export const LazyBlog = lazy(() => import("../pages/Blog"));
export const LazyImoveis = lazy(() => import("../pages/Imoveis"));
export const LazyImovel = lazy(() => import("../pages/Imovel"));
export const LazyComparador = lazy(() => import("../pages/Comparador"));

// Dashboard components
export const LazyCorretorDashboard = lazy(
  () => import("../pages/dashboards/CorretorDashboard"),
);
export const LazyAdminDashboard = lazy(
  () => import("../pages/dashboards/AdminDashboard"),
);
export const LazyClienteDashboard = lazy(
  () => import("../pages/dashboards/ClienteDashboard"),
);
export const LazyMarketingDashboard = lazy(
  () => import("../pages/dashboards/MarketingDashboard"),
);
export const LazyDesenvolvedorDashboard = lazy(
  () => import("../pages/dashboards/DesenvolvedorDashboard"),
);
export const LazyNotFound = lazy(() => import("../pages/NotFound"));
