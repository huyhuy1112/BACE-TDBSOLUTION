/**
 * cPanel / Passenger startup for the Next.js web app.
 * Setup Node.js App → Application startup file: app.js
 *
 * Before start on server:
 *   npm install
 *   npm run build -w @bace/shared
 *   npm run build -w @bace/web
 */
const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const next = require('next');

const port = Number(process.env.PORT) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const dir = path.join(__dirname, 'apps', 'web');

const app = next({ dev, dir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log(`BACE web ready on port ${port} (dir=${dir}, dev=${dev})`);
    });
  })
  .catch((err) => {
    console.error('Failed to start Next.js', err);
    process.exit(1);
  });
