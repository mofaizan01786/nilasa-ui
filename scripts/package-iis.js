const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist-package');
const zipFile = path.join(rootDir, 'nilasa-frontend-publish.zip');

const skipBuild = process.argv.includes('--skip-build');

if (!skipBuild) {
  console.log('1. Building Next.js production bundle...');
  execSync('npx next build', { stdio: 'inherit' });
}

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('2. Copying standalone output...');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
copyDirRecursive(standaloneDir, distDir);

// Copy static assets to .next/static and _next/static
const staticDir = path.join(rootDir, '.next', 'static');
copyDirRecursive(staticDir, path.join(distDir, '.next', 'static'));
copyDirRecursive(staticDir, path.join(distDir, '_next', 'static'));

// Copy public assets to public/ and root
const publicDir = path.join(rootDir, 'public');
copyDirRecursive(publicDir, path.join(distDir, 'public'));
copyDirRecursive(publicDir, distDir);

// Copy data folder (navigation.json, banners.json)
const dataDir = path.join(rootDir, 'data');
if (fs.existsSync(dataDir)) {
  copyDirRecursive(dataDir, path.join(distDir, 'data'));
}

// Copy web.config and .env
if (fs.existsSync(path.join(rootDir, 'web.config'))) {
  fs.copyFileSync(path.join(rootDir, 'web.config'), path.join(distDir, 'web.config'));
}
if (fs.existsSync(path.join(rootDir, '.env'))) {
  fs.copyFileSync(path.join(rootDir, '.env'), path.join(distDir, '.env'));
}

console.log('3. Writing SmarterASP.NET iisnode-compatible server.js...');

// Extract nextConfig from standalone server.js
const standaloneServerJs = fs.readFileSync(path.join(standaloneDir, 'server.js'), 'utf8');
const configMatch = standaloneServerJs.match(/const nextConfig = ({[\s\S]*?})\n\nprocess\.env\.__NEXT_PRIVATE_STANDALONE_CONFIG/);
const nextConfigStr = configMatch ? configMatch[1] : '{}';

const customServerJs = `const http = require('http');
const path = require('path');

process.env.NODE_ENV = 'production';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.chdir(__dirname);

// Dynamic port (supports named pipe from iisnode on SmarterASP.NET or integer port)
const port = process.env.PORT || 3000;

const nextConfig = ${nextConfigStr};
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

const NextServer = require('next/dist/server/next-server').default;

const nextApp = new NextServer({
  hostname: 'localhost',
  port: typeof port === 'number' ? port : 3000,
  dir: __dirname,
  dev: false,
  customServer: false,
  conf: nextConfig,
});

const handler = nextApp.getRequestHandler();

const server = http.createServer(async (req, res) => {
  try {
    // Restore original URL forwarded by IIS / iisnode
    if (req.headers && req.headers['x-original-url']) {
      req.url = req.headers['x-original-url'];
    } else if (req.url && req.url.startsWith('/server.js')) {
      req.url = req.url.replace(/^\\/server\\.js/, '') || '/';
    }

    await handler(req, res);
  } catch (err) {
    console.error('Request handler error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

// Listen on iisnode named pipe or TCP port
server.listen(port, () => {
  console.log('Nilasa Storefront listening on ' + port);
});
`;

fs.writeFileSync(path.join(distDir, 'server.js'), customServerJs, 'utf8');

console.log('4. Creating nilasa-frontend-publish.zip...');
try {
  if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
  }
} catch (e) {}

execSync(`tar -a -c -f "${zipFile}" -C "${distDir}" *`, { stdio: 'inherit' });

console.log('5. Cleaning up temp dist folder...');
try {
  fs.rmSync(distDir, { recursive: true, force: true });
} catch (e) {}

const stats = fs.statSync(zipFile);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`✅ SUCCESS! nilasa-frontend-publish.zip created (${sizeMB} MB)`);
