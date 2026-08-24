const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Check if Next.js standalone server exists
const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standalonePath)) {
  // If pre-built standalone server exists, delegate to it
  require(standalonePath);
} else {
  // Otherwise, start standard Next.js production server
  const next = require('next');
  const dev = process.env.NODE_ENV !== 'production';
  const port = process.env.PORT || 3000;
  const app = next({ dev, dir: __dirname });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Nilasa Storefront ready on port / iisnode pipe: ${port}`);
    });
  });
}
