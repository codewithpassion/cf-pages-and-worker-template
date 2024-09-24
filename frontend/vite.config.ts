import react from '@vitejs/plugin-react-swc';
import sizeOf from 'image-size';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { imagetools } from 'vite-imagetools';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  console.error("@@@@@@@@@@@@@@@@@@", env, mode)
  if (!env.VITE_API_URL) {
    throw new Error('VITE_API_URL is required as a secret');
  }
  return {
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    server: {
      proxy: {
        '/api': {
          // target: 'https://api.dev.overlaplifeecho.solutions.rockyshoreslabs.io',
          target: "http://localhost:8787",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    plugins: [
      react(),
      imagetools({
        defaultDirectives: (url) => {
          if (url.pathname.includes('photos')) {
            const dimensions = sizeOf(url.pathname);
            let w = 800;
            let h = Math.round(dimensions.height! * (w / dimensions.width!));
            if (dimensions.height! > dimensions.width!) {
              h = 800;
              w = Math.round(dimensions.width! * (h / dimensions.height!));
            }

            return new URLSearchParams({
              format: 'webp',
              quality: '85',
              width: `${w}`,
              height: `${h}`,
            })
          }
          return new URLSearchParams()
        }
      }),
      // ViteImageOptimizer({}),
    ],
    resolve: {
      alias: {
        // "@": "../src",
        "@": path.resolve(__dirname, "./src"),
      },
    }
  }
})
