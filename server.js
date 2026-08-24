const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
process.env.NODE_ENV = 'production';

// Check if Next.js standalone build exists
const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');

function normalizeUrl(req) {
  let url = req.url || '/';

  // 1. If IIS / iisnode forwarded the original requested URL via headers
  if (req.headers) {
    if (req.headers['x-original-url']) {
      url = req.headers['x-original-url'];
    } else if (req.headers['x-rewrite-url']) {
      url = req.headers['x-rewrite-url'];
    } else if (req.headers['x-forwarded-url']) {
      url = req.headers['x-forwarded-url'];
    }
  }

  // 2. Remove /server.js rewrite artifact if present
  if (url.startsWith('/server.js')) {
    url = url.replace(/^\/server\.js/, '') || '/';
  }

  // 3. Normalize subsite folder /nilasa if requested directly
  if (url === '/nilasa') {
    url = '/';
  } else if (url.startsWith('/nilasa/')) {
    url = url.replace(/^\/nilasa\//, '/');
  }

  return url;
}

// ── Next.js Application Handler ──
let handler;

if (fs.existsSync(standalonePath)) {
  const NextServer = require('next/dist/server/next-server').default;
  let nextConfig = {};
  try {
    const requiredServerFiles = require(path.join(__dirname, '.next', 'required-server-files.json'));
    nextConfig = requiredServerFiles.config || {};
  } catch (e) {}

  const nextApp = new NextServer({
    hostname: '0.0.0.0',
    port: typeof port === 'number' ? port : 3000,
    dir: __dirname,
    dev: false,
    customServer: false,
    conf: nextConfig,
  });
  handler = nextApp.getRequestHandler();
} else {
  const next = require('next');
  const app = next({ dev: false, dir: __dirname });
  handler = app.getRequestHandler();
}

const server = createServer(async (req, res) => {
  try {
    req.url = normalizeUrl(req);
    const parsedUrl = parse(req.url, true);
    await handler(req, res, parsedUrl);
  } catch (err) {
    console.error('Nilasa Storefront request error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
});

server.listen(port, () => {
  console.log(`> Nilasa Storefront active and listening on port / pipe: ${port}`);
});
