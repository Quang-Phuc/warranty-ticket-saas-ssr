import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/** ✅ FAVICON: serve trước static + cache ngắn để khỏi “dính 1 năm” */
function sendIcon(res: Response, filename: string, contentType: string) {
  res.setHeader('Content-Type', contentType);
  // cache ngắn + revalidate (đỡ bị stuck icon cũ)
  res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  res.sendFile(join(browserDistFolder, filename));
}

app.get('/favicon.ico', (_req, res) => sendIcon(res, 'favicon.ico', 'image/x-icon'));
app.get('/favicon-48x48.png', (_req, res) => sendIcon(res, 'favicon-48x48.png', 'image/png'));
app.get('/apple-touch-icon.png', (_req, res) => sendIcon(res, 'apple-touch-icon.png', 'image/png'));

// ✅ robots/sitemap TRƯỚC catch-all
app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(join(browserDistFolder, 'robots.txt'));
});

app.get('/sitemap.xml', (_req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(join(browserDistFolder, 'sitemap.xml'));
});

// static assets
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    // ✅ exclude icon khỏi cache 1y (thêm chắc)
    setHeaders: (res, path) => {
      const lower = path.toLowerCase();
      if (
        lower.endsWith('/favicon.ico') ||
        lower.endsWith('/favicon-48x48.png') ||
        lower.endsWith('/apple-touch-icon.png')
      ) {
        res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
      }
    },
  }),
);

// SSR catch-all CUỐI CÙNG
app.all('*', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.method === 'GET' && !req.url.includes('.')) {
      res.setHeader('Cache-Control', 'public, max-age=120');
    }

    const response = await angularApp.handle(req);

    if (response) {
      await writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('SSR error:', err);
  res.status(500).send('Internal server error');
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => console.log(`Node server listening on ${port}`));
}

export const reqHandler = createNodeRequestHandler(app);
