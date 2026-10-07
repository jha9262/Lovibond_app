import { build } from 'vite';
import path from 'path';

const rootDir = process.cwd();

async function run() {
  await build({
    configFile: path.resolve(rootDir, 'vite.config.gzip.ts'),
    build: {
      write: false,
    },
    plugins: [
      {
        name: 'size-breakdown',
        generateBundle(_, bundle) {
          for (const [name, chunk] of Object.entries(bundle)) {
            if (chunk.type === 'chunk') {
              console.log(`\n======================================================`);
              console.log(`Chunk: ${name} (Total minified: ${(chunk.code.length / 1024).toFixed(1)} KB)`);
              console.log(`======================================================`);

              const pkgMap = {};
              for (const [id, mod] of Object.entries(chunk.modules)) {
                let pkgName = 'Your App Code (src/)';
                if (id.includes('node_modules/')) {
                  const segs = id.split('node_modules/')[1].split('/');
                  pkgName = segs[0].startsWith('@') ? `${segs[0]}/${segs[1]}` : segs[0];
                }
                pkgMap[pkgName] = (pkgMap[pkgName] || 0) + mod.renderedLength;
              }

              const sorted = Object.entries(pkgMap).sort((a, b) => b[1] - a[1]);
              console.log('\nTop Packages by size:');
              let cumulative = 0;
              for (const [pkg, bytes] of sorted) {
                const kb = bytes / 1024;
                cumulative += kb;
                const pct = ((bytes / chunk.code.length) * 100).toFixed(1);
                console.log(`  • ${pkg.padEnd(28)}: ${kb.toFixed(1).padStart(7)} KB (${pct.padStart(4)}%)`);
              }
              console.log(`\nTotal Modules Rendered: ${cumulative.toFixed(1)} KB`);
            }
          }
        },
      },
    ],
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
