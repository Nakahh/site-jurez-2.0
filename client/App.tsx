import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initPerformanceMonitoring } from "@/lib/performance";
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
} from "./components/LazyRoutes";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/desenvolvedor" element={<Desenvolvedor />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/imoveis" element={<Imoveis />} />
          <Route path="/imovel/:id" element={<Imovel />} />
          <Route path="/comparador" element={<Comparador />} />
          <Route path="/dashboard/corretor" element={<CorretorDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/cliente" element={<ClienteDashboard />} />
          <Route path="/dashboard/marketing" element={<MarketingDashboard />} />
          <Route
            path="/dashboard/desenvolvedor"
            element={<DesenvolvedorDashboard />}
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
