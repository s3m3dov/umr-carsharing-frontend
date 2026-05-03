import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    fs: {
      strict: false,
    },
    // Dev proxy: forwards service-prefixed paths to the local API gateway.
    // Use this when VITE_API_BASE_URL is empty (same-origin requests, no CORS needed).
    // Target the gateway port — default is 8081 based on local dev setup.
    proxy: {
      '/actuator':             { target: 'http://34.54.55.0', changeOrigin: true },
      '/auth-service':         { target: 'http://34.54.55.0', changeOrigin: true },
      '/user-service':         { target: 'http://34.54.55.0', changeOrigin: true },
      '/trip-service':         { target: 'http://34.54.55.0', changeOrigin: true },
      '/review-service':       { target: 'http://34.54.55.0', changeOrigin: true },
      '/notification-service': { target: 'http://34.54.55.0', changeOrigin: true },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure proper path handling for production builds
    outDir: "dist",
  },
}));