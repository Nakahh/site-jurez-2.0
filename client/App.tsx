import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NotificationProvider } from "@/components/NotificationSystem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initPerformanceMonitoring } from "@/lib/performance";
import { optimizationManager } from "@/lib/optimizationManager";
import {
  LazyIndex,
  LazyLogin,
  LazySobre,
  LazyContato,
  LazySimulador,
  LazyDesenvolvedor,
  LazyBlog,
  LazyImoveis,
  LazyImovel,
  LazyComparador,
  LazyCorretorDashboard,
  LazyAdminDashboard,
  LazyClienteDashboard,
  LazyMarketingDashboard,
  LazyDesenvolvedorDashboard,
  LazyNotFound,
  preloadRoute,
} from "./components/LazyRoutes";

// Import individual pages for corretor
import { lazy, Suspense } from "react";
const LazyCorretorLeads = lazy(() => import("./pages/CorretorLeads"));
const LazyCorretorImoveis = lazy(() => import("./pages/CorretorImoveis"));
const LazyAssistenteDashboard = lazy(
  () => import("./pages/dashboards/AssistenteDashboard"),
);
const LazyBlogPost = lazy(() => import("./pages/BlogPost"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Initialize performance monitoring
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  initPerformanceMonitoring();
}

const App = () => {
  // Intelligent preloading based on user behavior patterns
  useEffect(() => {
    // Preload critical routes after initial render
    const preloadCriticalRoutes = () => {
      const currentPath = window.location.pathname;

      // If on homepage, likely to visit imoveis or login
      if (currentPath === "/") {
        setTimeout(() => {
          preloadRoute("imoveis");
          preloadRoute("login");
        }, 2000);
      }

      // If on login, likely to visit dashboard
      if (currentPath === "/login") {
        setTimeout(() => {
          preloadRoute("dashboard-corretor");
          preloadRoute("dashboard-admin");
          preloadRoute("dashboard-cliente");
        }, 1000);
      }

      // If authenticated (has token), preload dashboard routes
      const token = localStorage.getItem("token");
      if (token) {
        setTimeout(() => {
          preloadRoute("dashboard-corretor");
          preloadRoute("dashboard-admin");
          preloadRoute("dashboard-cliente");
        }, 500);
      }
    };

    // Mouse hover preloading for navigation links
    const handleLinkHover = (event: Event) => {
      const target = event.target as HTMLAnchorElement;
      if (target.tagName === "A" && target.href) {
        const path = new URL(target.href).pathname;
        const routeMap: Record<string, string> = {
          "/imoveis": "imoveis",
          "/login": "login",
          "/dashboard/corretor": "dashboard-corretor",
          "/dashboard/admin": "dashboard-admin",
          "/dashboard/cliente": "dashboard-cliente",
        };

        const routeKey = routeMap[path];
        if (routeKey) {
          preloadRoute(routeKey);
        }
      }
    };

    // Setup preloading
    preloadCriticalRoutes();
    document.addEventListener("mouseover", handleLinkHover);

    return () => {
      document.removeEventListener("mouseover", handleLinkHover);
    };
  }, []);

  // Initialize global optimizations
  useEffect(() => {
    // The optimization manager is already initialized globally
    // Add any app-specific optimizations here

    // Cleanup on unmount (though App never unmounts)
    return () => {
      // optimizationManager.destroy();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LazyIndex />} />
                <Route path="/login" element={<LazyLogin />} />
                <Route path="/register" element={<LazyLogin />} />
                <Route path="/sobre" element={<LazySobre />} />
                <Route path="/contato" element={<LazyContato />} />
                <Route path="/simulador" element={<LazySimulador />} />
                <Route path="/desenvolvedor" element={<LazyDesenvolvedor />} />
                <Route path="/blog" element={<LazyBlog />} />
                <Route
                  path="/blog/post/:id"
                  element={
                    <Suspense fallback={<div>Carregando...</div>}>
                      <LazyBlogPost />
                    </Suspense>
                  }
                />
                <Route path="/imoveis" element={<LazyImoveis />} />
                <Route path="/imovel/:id" element={<LazyImovel />} />
                <Route path="/comparador" element={<LazyComparador />} />
                <Route
                  path="/dashboard/corretor"
                  element={<LazyCorretorDashboard />}
                />
                <Route
                  path="/corretor/leads"
                  element={
                    <Suspense fallback={<div>Carregando...</div>}>
                      <LazyCorretorLeads />
                    </Suspense>
                  }
                />
                <Route
                  path="/corretor/imoveis"
                  element={
                    <Suspense fallback={<div>Carregando...</div>}>
                      <LazyCorretorImoveis />
                    </Suspense>
                  }
                />
                <Route
                  path="/dashboard/admin"
                  element={<LazyAdminDashboard />}
                />
                <Route
                  path="/dashboard/cliente"
                  element={<LazyClienteDashboard />}
                />
                <Route
                  path="/dashboard/marketing"
                  element={<LazyMarketingDashboard />}
                />
                <Route
                  path="/dashboard/desenvolvedor"
                  element={<LazyDesenvolvedorDashboard />}
                />
                <Route
                  path="/dashboard/assistente"
                  element={
                    <Suspense fallback={<div>Carregando...</div>}>
                      <LazyAssistenteDashboard />
                    </Suspense>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<LazyNotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
