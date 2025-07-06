import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
  preloadRoute,
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
          <Route path="/" element={<LazyIndex />} />
          <Route path="/login" element={<LazyLogin />} />
          <Route path="/register" element={<LazyLogin />} />
          <Route path="/sobre" element={<LazySobre />} />
          <Route path="/contato" element={<LazyContato />} />
          <Route path="/simulador" element={<LazySimulador />} />
          <Route path="/desenvolvedor" element={<LazyDesenvolvedor />} />
          <Route path="/blog" element={<LazyBlog />} />
          <Route path="/imoveis" element={<LazyImoveis />} />
          <Route path="/imovel/:id" element={<LazyImovel />} />
          <Route path="/comparador" element={<LazyComparador />} />
          <Route
            path="/dashboard/corretor"
            element={<LazyCorretorDashboard />}
          />
          <Route path="/dashboard/admin" element={<LazyAdminDashboard />} />
          <Route path="/dashboard/cliente" element={<LazyClienteDashboard />} />
          <Route
            path="/dashboard/marketing"
            element={<LazyMarketingDashboard />}
          />
          <Route
            path="/dashboard/desenvolvedor"
            element={<LazyDesenvolvedorDashboard />}
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<LazyNotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
