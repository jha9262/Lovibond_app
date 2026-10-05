import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');
const packageCacheDir = path.resolve(rootDir, '.package_cache');

// Ensure cache directory exists
if (!fs.existsSync(packageCacheDir)) {
  fs.mkdirSync(packageCacheDir, { recursive: true });
}

/**
 * Builds and packages assets for a specific protocol (HTTP or HTTPS)
 * @param {'http' | 'https'} mode 
 */
function buildPackage(mode) {
  const isHttps = mode === 'https';
  const wsProtocol = isHttps ? 'wss' : 'ws';
  const packagePrefix = isHttps ? 'https' : 'http';

  console.log(`\n======================================================`);
  console.log(`🔨 Building ESP32 Package for [${mode.toUpperCase()}] (WebSocket: ${wsProtocol}://)`);
  console.log(`======================================================`);

  // Clean raw assets dir before build if it exists
  if (fs.existsSync(assetsDir)) {
    fs.rmSync(assetsDir, { recursive: true, force: true });
  }

  // 1. Run Vite build with environment variable set for protocol
  console.log(`📦 Running Vite build with VITE_WS_PROTOCOL=${wsProtocol}...`);
  execSync('npx vite build --config vite.config.gzip.ts', {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_BASE_URL: '',
      VITE_DEVICE_WS_URL: '',
      VITE_WS_PROTOCOL: wsProtocol,
    },
  });

  if (!fs.existsSync(assetsDir)) {
    throw new Error('Assets directory not found. Ensure vite build completed successfully.');
  }

  // 2. Discover built assets
  const allFiles = fs.readdirSync(assetsDir);
  const jsFiles = allFiles.filter(f => f.endsWith('.js'));
  const cssFiles = allFiles.filter(f => f.endsWith('.css'));
  const htmlFile = path.join(distDir, 'index.html');

  if (jsFiles.length === 0 || cssFiles.length === 0) {
    throw new Error('Compiled assets not found in dist/assets.');
  }

  console.log(`📁 Found ${jsFiles.length} JS file(s) and ${cssFiles.length} CSS file(s)`);

  // 3. Gzip JS files (max compression)
  const gzFiles = [];
  for (const jsFile of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, jsFile));
    const gzName = 'scripts.gz';
    console.log(`📦 Compressing ${jsFile} (${(content.length / 1024).toFixed(1)} KB) with max Gzip (level 9)...`);
    const compressed = zlib.gzipSync(content, { level: 9 });
    fs.writeFileSync(path.join(distDir, gzName), compressed);
    gzFiles.push(gzName);
    console.log(`   → ${gzName}: ${(compressed.length / 1024).toFixed(1)} KB`);
  }

  // 4. Gzip CSS files (max compression)
  for (const cssFile of cssFiles) {
    const content = fs.readFileSync(path.join(assetsDir, cssFile));
    const gzName = 'styles.gz';
    console.log(`📦 Compressing ${cssFile} (${(content.length / 1024).toFixed(1)} KB) with max Gzip (level 9)...`);
    const compressed = zlib.gzipSync(content, { level: 9 });
    fs.writeFileSync(path.join(distDir, gzName), compressed);
    gzFiles.push(gzName);
    console.log(`   → ${gzName}: ${(compressed.length / 1024).toFixed(1)} KB`);
  }

  // 5. Rewrite index.html to point to gzipped root files
  console.log('📝 Injecting dynamic root mapping pointers into index.html...');
  let htmlContent = fs.readFileSync(htmlFile, 'utf8');
  htmlContent = htmlContent.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
  htmlContent = htmlContent.replace(/<link[^>]*href="[^"]*\.css"[^>]*>/g, '');

  let scriptTags = '\n    <script type="module" crossorigin src="./scripts.gz"></script>';
  let styleTags = '\n    <link rel="stylesheet" crossorigin href="./styles.gz">';
  htmlContent = htmlContent.replace('</head>', `${scriptTags}${styleTags}\n  </head>`);
  fs.writeFileSync(htmlFile, htmlContent);

  // 6. Purge uncompressed assets folder
  console.log('🧹 Purging raw uncompressed assets folder...');
  fs.rmSync(assetsDir, { recursive: true, force: true });

  // 7. Bundle into deployment zip archive in packageCacheDir
  const targetZipName = `${packagePrefix}_deployment_package.zip`;
  const cachedZipPath = path.join(packageCacheDir, targetZipName);

  console.log(`🤐 Archiving assets into ${targetZipName}...`);
  const filesToZip = ['index.html', ...gzFiles].join(' ');

  // Create temporary zip in dist, then move to cache
  execSync(`zip -9q "${targetZipName}" ${filesToZip}`, { cwd: distDir });
  fs.copyFileSync(path.join(distDir, targetZipName), cachedZipPath);

  // If HTTP, also cache deployment_package.zip
  if (mode === 'http') {
    fs.copyFileSync(cachedZipPath, path.join(packageCacheDir, 'deployment_package.zip'));
  }

  const stats = fs.statSync(cachedZipPath);
  const finalSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`✅ [${mode.toUpperCase()}] Package Generated: ${targetZipName} (${finalSizeKB} KB)`);

  return { mode, targetZipName, sizeKB: finalSizeKB };
}

// Main execution CLI
try {
  const args = process.argv.slice(2);
  const requestedMode = args[0] ? args[0].toLowerCase().replace('--', '') : 'http';

  const results = [];
    if (requestedMode === 'https') {
      results.push(buildPackage('https'));
    } else if (requestedMode === 'all') {
      results.push(buildPackage('http'));
      results.push(buildPackage('https'));
    } else {
      // Default to HTTP only
      results.push(buildPackage('http'));
      // Clean up any old HTTPS zips so only HTTP zip exists
      const httpsZips = [
        path.join(rootDir, 'dist_https.zip'),
        path.join(distDir, 'https_deployment_package.zip'),
        path.join(packageCacheDir, 'https_deployment_package.zip')
      ];
      for (const f of httpsZips) {
        if (fs.existsSync(f)) {
          try { fs.unlinkSync(f); } catch (_) { }
        }
      }
    }

    // Sync cached packages to both dist/ and rootDir
    console.log('\n📦 Synchronizing distribution packages to dist/ and root...');
    const cachedFiles = fs.readdirSync(packageCacheDir).filter(f => f.endsWith('.zip'));

    for (const file of cachedFiles) {
      const srcPath = path.join(packageCacheDir, file);
      // Copy into dist/
      fs.copyFileSync(srcPath, path.join(distDir, file));

      // Also copy with convenient root names
      if (file === 'http_deployment_package.zip') {
        fs.copyFileSync(srcPath, path.join(rootDir, 'dist_http.zip'));
        fs.copyFileSync(srcPath, path.join(rootDir, 'dist.zip'));
      } else if (file === 'https_deployment_package.zip') {
        fs.copyFileSync(srcPath, path.join(rootDir, 'dist_https.zip'));
      } else if (file === 'deployment_package.zip') {
        fs.copyFileSync(srcPath, path.join(rootDir, 'dist.zip'));
      }
    }

    console.log(`\n======================================================`);
    if (requestedMode === 'http') {
      console.log(`🎉 HTTP ESP32 Deployment Package Ready:`);
      console.log(`   • Flash Package: dist.zip (or dist_http.zip)`);
      console.log(`   • Protocol:      HTTP + WebSocket (ws://)`);
    } else {
      console.log(`🎉 All ESP32 Deployment Packages Ready:`);
      console.log(`   • HTTP Package:  dist/http_deployment_package.zip & dist_http.zip`);
      console.log(`   • HTTPS Package: dist/https_deployment_package.zip & dist_https.zip`);
      console.log(`   • Default:       dist/deployment_package.zip & dist.zip`);
    }
    console.log(`======================================================\n`);
  } catch (error) {
    console.error('❌ Pipeline Error:', error.message);
    process.exit(1);
  }
