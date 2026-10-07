// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const configuredTarget = env.VITE_API_BASE_URL || env.VITE_ESP32_IP || '192.168.0.114';
  const apiTarget = configuredTarget.includes('://')
    ? configuredTarget.replace(/\/$/, '')
    : `http://${configuredTarget.replace(/\/$/, '')}`;

  // Allow self-signed certificates in local development when proxying to ESP32 HTTPS
  if (apiTarget.startsWith('https://')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      minify: 'terser' as const, // Use terser for more aggressive compression
      terserOptions: {
        compress: { passes: 2 },
        mangle: true,
      },
      sourcemap: false,          // Disables debugging maps to save a massive chunk of file space
      cssMinify: true,           // Strips all whitespace and comments from Tailwind styles
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          // Forces predictable, static names so our package.json automation script can find them
          entryFileNames: 'assets/scripts.js',
          assetFileNames: 'assets/styles.[ext]'
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      https: fs.existsSync(path.resolve(__dirname, 'dev-server-key.pem')) && fs.existsSync(path.resolve(__dirname, 'dev-server-cert.pem'))
        ? {
            key: fs.readFileSync(path.resolve(__dirname, 'dev-server-key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'dev-server-cert.pem')),
          }
        : undefined,
      proxy: {
        // Proxy device API endpoints through localhost to avoid browser CORS checks.
        '^/(?!LIVE$)[A-Z][A-Z0-9_]*': {
          target: apiTarget,
          changeOrigin: true,
          secure: false, // Bypass self-signed SSL certificate validation for ESP32 HTTPS
          ws: true,
          configure: (proxy) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('[Vite Proxy Error - API]', err.message);
            });
          },
        },
        '/ws': {
          target: apiTarget,
          changeOrigin: true,
          secure: false, // Bypass self-signed SSL certificate validation for ESP32 WSS
          ws: true,
          configure: (proxy) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('[Vite Proxy Error - WS]', err.message);
            });
          },
        },
      },
    },
  };
});
