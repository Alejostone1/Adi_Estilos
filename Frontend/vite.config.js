import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const API_TARGET = env.VITE_API_URL || 'http://localhost:3000';
  const FILES_TARGET = env.VITE_FILES_URL || 'http://localhost:3000';

  return {
    plugins: [
      react(),
      // ✅ AÑADIR PARA VERCEL
      mode === 'production' && {
        name: 'vercel-static'
      }
    ],

    // ✅ CONFIGURACIÓN PARA PRODUCCIÓN
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 500, // Reducir límite para chunks más pequeños
      // ✅ OPTIMIZACIONES CRÍTICAS
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React
            vendor: ['react', 'react-dom'],
            // Router
            router: ['react-router-dom'],
            // UI Libraries
            ui: ['antd', 'lucide-react'],
            // Charts
            charts: ['recharts'],
            // Utils
            utils: ['axios', 'dayjs']
          },
          // Optimizar chunk splitting automático
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `assets/[name]-[hash].js`;
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        }
      },
      // Optimización de assets
      assetsInlineLimit: 4096,
      cssCodeSplit: true
    },
    
    // ✅ SERVIDOR SOLO DESARROLLO
    server: mode === 'development' ? {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: FILES_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    } : undefined,
    
    // ✅ PREVIEW PARA TESTING
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
