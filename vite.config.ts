import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  // Otimizações mobile
  build: {
    target: "es2015",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-select"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Otimizações dev para mobile
  server: {
    port: 3000,
    host: true,
    cors: true,
  },
  // Preview otimizado
  preview: {
    port: 3000,
    host: true,
  },
  // Otimizações de performance
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    exclude: ["next-themes"],
  },

  // Configurações para resolver warnings do next-themes
  define: {
    global: "globalThis",
  },
});
