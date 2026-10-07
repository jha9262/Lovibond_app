import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// This plugin replaces unused heavy libraries with empty modules at build time.
// The libraries remain in package.json but contribute zero bytes to the bundle.
function excludeUnusedLibs(): Plugin {
  const stubbedModules = [
    'html2pdf.js',
    '@google/genai',
    'express',
    'dotenv',
    'react-icons',
  ];

  return {
    name: 'exclude-unused-libs',
    enforce: 'pre',
    resolveId(source: string) {
      // Match exact package names or deep imports like 'jspdf/dist/...'
      if (stubbedModules.some(mod => source === mod || source.startsWith(mod + '/'))) {
        return { id: `\0stub:${source}`, moduleSideEffects: false };
      }
      return null;
    },
    load(id: string) {
      if (id.startsWith('\0stub:')) {
        // Return an empty module — any named imports will resolve to undefined
        return 'export default {}';
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [excludeUnusedLibs(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      minify: 'terser' as const,
      terserOptions: {
        compress: {
          passes: 5,
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.warn', 'console.info', 'console.debug', 'console.error'],
          dead_code: true,
          unused: true,
          pure_getters: true,
          unsafe_math: true,
          collapse_vars: true,
          reduce_vars: true,
          hoist_funs: true,
          booleans_as_integers: false,
          unsafe_comps: false,
          toplevel: true,
        },
        mangle: {
          toplevel: true,
        },
      },
      sourcemap: false,
      emptyOutDir: false,
      cssMinify: true,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          entryFileNames: 'assets/scripts.js',
          assetFileNames: 'assets/styles.[ext]',
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
