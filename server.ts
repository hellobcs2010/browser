import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './server/proxyHandler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API routes handled by proxyHandler
app.use(async (req, res, next) => {
  if (req.url && req.url.startsWith('/api/')) {
    try {
      const handled = await handleApiRequest(req, res);
      if (handled) return;
    } catch (err) {
      console.error('[Aether Server Error]', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
  }
  next();
});

// Serve static frontend in production
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`<!DOCTYPE html><html><body><h2>Aether Browser Starting up...</h2><p>Please refresh in a few seconds.</p><script>setTimeout(() => window.location.reload(), 2000);</script></body></html>`);
  }
});

app.listen(PORT, () => {
  console.log(`[Aether Browser Server] Running on http://localhost:${PORT}`);
});

