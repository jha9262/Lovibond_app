// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
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
    },
  };
});
