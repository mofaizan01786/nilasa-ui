const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = process.env.PORT || 3000;
const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

function normalizeUrl(req) {
  // 1. In IIS + iisnode, IIS rewrites the internal request to 'server.js'
  // and stores the actual requested URL in the 'x-original-url' (or 'x-rewrite-url') header.
  let url = '/';

  if (req.headers && req.headers['x-original-url']) {
    url = req.headers['x-original-url'];
  } else if (req.headers && req.headers['x-rewrite-url']) {
    url = req.headers['x-rewrite-url'];
  } else if (req.url && !req.url.startsWith('/server.js')) {
    url = req.url;
  } else if (req.url && req.url.startsWith('/server.js/')) {
    url = req.url.substring('/server.js'.length);
  }

  if (!url || url === '') {
    url = '/';
  }

  // 2. Strip /nilasa sub-folder prefix if IIS application is deployed under /nilasa
  if (url === '/nilasa') {
    url = '/';
  } else if (url.startsWith('/nilasa/')) {
    url = url.substring('/nilasa'.length);
  } else if (url.startsWith('/nilasa?')) {
    url = '/' + url.substring('/nilasa'.length);
  }

  if (!url.startsWith('/')) {
    url = '/' + url;
  }

  return url;
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      req.url = normalizeUrl(req);
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Storefront error:', err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Nilasa Storefront listening on port / pipe: ${port}`);
  });
}).catch((err) => {
  console.error('Error starting Next.js application:', err);
  process.exit(1);
});
