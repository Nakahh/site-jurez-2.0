import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NotificationProvider } from "@/components/NotificationSystem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { initPerformanceMonitoring } from "@/lib/performance";
import { optimizationManager } from "@/lib/optimizationManager";
import { LazyRoutes } from "./components/LazyRoutes";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
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
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <LazyRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
