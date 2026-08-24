const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = process.env.PORT || 3000;
const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

function normalizeUrl(req) {
  let url = req.url || '/';

  // 1. Clean IIS rewrite prefix /server.js while preserving all query parameters (?_rsc=..., ?type=..., etc.)
  if (url.startsWith('/server.js')) {
    url = url.substring('/server.js'.length) || '/';
    if (!url.startsWith('/') && !url.startsWith('?')) {
      url = '/' + url;
    }
  }

  // 2. Clean sub-folder prefix /nilasa if present
  if (url === '/nilasa') {
    url = '/';
  } else if (url.startsWith('/nilasa/')) {
    url = url.substring('/nilasa'.length) || '/';
  } else if (url.startsWith('/nilasa?')) {
    url = '/' + url.substring('/nilasa'.length);
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
