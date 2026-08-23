const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist-package');
const zipFile = path.join(rootDir, 'nilasa-frontend-publish.zip');

const skipBuild = process.argv.includes('--skip-build');
const keepDist = process.argv.includes('--keep-dist');

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

// Ensure web.config is included for IIS/iisnode
const webConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <defaultDocument>
      <files>
        <clear />
        <add value="server.js" />
      </files>
    </defaultDocument>

    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>

    <iisnode
      nodeProcessCommandLine="node.exe"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
      devErrorsEnabled="true"
      loggingEnabled="true"
      logDirectory="iisnode"
      watchedFiles="web.config;*.js"
    />

    <rewrite>
      <rules>
        <rule name="ExistingFiles" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" />
          </conditions>
          <action type="None" />
        </rule>

        <rule name="StaticChunks" stopProcessing="true">
          <match url="^_next/static/(.*)$" />
          <action type="Rewrite" url=".next/static/{R:1}" />
        </rule>

        <rule name="PublicAssets" stopProcessing="true">
          <match url="^([^/]+(\.(jpg|jpeg|png|gif|svg|webp|ico|txt|xml|woff|woff2|ttf|css|js)))$" />
          <conditions>
            <add input="{DOCUMENT_ROOT}\\public\\{R:1}" matchType="IsFile" />
          </conditions>
          <action type="Rewrite" url="public/{R:1}" />
        </rule>

        <rule name="DynamicRoutes">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>

    <staticContent>
      <remove fileExtension=".json" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <remove fileExtension=".jpg" />
      <mimeMap fileExtension=".jpg" mimeType="image/jpeg" />
      <remove fileExtension=".jpeg" />
      <mimeMap fileExtension=".jpeg" mimeType="image/jpeg" />
      <remove fileExtension=".png" />
      <mimeMap fileExtension=".png" mimeType="image/png" />
      <remove fileExtension=".PNG" />
      <mimeMap fileExtension=".PNG" mimeType="image/png" />
      <remove fileExtension=".webp" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
      <remove fileExtension=".svg" />
      <mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
      <remove fileExtension=".ico" />
      <mimeMap fileExtension=".ico" mimeType="image/x-icon" />
      <remove fileExtension=".woff" />
      <mimeMap fileExtension=".woff" mimeType="font/woff" />
      <remove fileExtension=".woff2" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>

    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
`;

if (fs.existsSync(path.join(rootDir, 'web.config'))) {
  fs.copyFileSync(path.join(rootDir, 'web.config'), path.join(distDir, 'web.config'));
} else {
  fs.writeFileSync(path.join(distDir, 'web.config'), webConfigXml, 'utf8');
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

if (!keepDist) {
  console.log('5. Cleaning up temp dist folder...');
  try {
    fs.rmSync(distDir, { recursive: true, force: true });
  } catch (e) {}
}

const stats = fs.statSync(zipFile);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`✅ SUCCESS! nilasa-frontend-publish.zip created (${sizeMB} MB)`);
