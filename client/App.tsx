import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Simulador from "./pages/Simulador";
import Desenvolvedor from "./pages/Desenvolvedor";
import Blog from "./pages/Blog";
import Imoveis from "./pages/Imoveis";
import Imovel from "./pages/Imovel";
import Comparador from "./pages/Comparador";
import CorretorDashboard from "./pages/dashboards/CorretorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ClienteDashboard from "./pages/dashboards/ClienteDashboard";
import MarketingDashboard from "./pages/dashboards/MarketingDashboard";
import DesenvolvedorDashboard from "./pages/dashboards/DesenvolvedorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
