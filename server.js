'use strict';

const path = require('node:path');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const UM_ANO = 1000 * 60 * 60 * 24 * 365;

// A Brasil Cloud roda a aplicação atrás de um proxy (NGINX).
// Sem isso, req.protocol vem sempre como "http" e o redirect de HTTPS entra em loop.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ---------- segurança ----------
// Domínios do Google Tag Manager, Analytics e Ads.
// Se o marketing adicionar outra ferramenta (Meta Pixel, RD Station, chat),
// o domínio dela precisa entrar nas listas abaixo ou a tag é bloqueada em silêncio.
const GOOGLE_SCRIPTS = [
  'https://www.googletagmanager.com',
  'https://tagmanager.google.com',
  'https://www.google-analytics.com',
  'https://ssl.google-analytics.com',
  'https://www.googleadservices.com',
  'https://googleads.g.doubleclick.net',
  'https://www.google.com',
  'https://www.google.com.br'
];
const GOOGLE_CONNECT = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://analytics.google.com',
  'https://*.analytics.google.com',
  'https://*.google-analytics.com',
  'https://stats.g.doubleclick.net',
  'https://www.google.com',
  'https://www.google.com.br',
  'https://googleads.g.doubleclick.net'
];
const GOOGLE_IMGS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://www.google.com',
  'https://www.google.com.br',
  'https://googleads.g.doubleclick.net',
  'https://stats.g.doubleclick.net'
];
const GOOGLE_FRAMES = [
  'https://www.googletagmanager.com',
  'https://td.doubleclick.net',
  'https://bid.g.doubleclick.net'
];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // 'unsafe-inline' é exigido pelo GTM: o snippet é inline e as tags que o
        // marketing cria no painel também são injetadas inline. Sem isso, toda tag
        // nova quebra sem aviso. É o trade-off consciente de usar GTM.
        scriptSrc: ["'self'", "'unsafe-inline'", ...GOOGLE_SCRIPTS],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', ...GOOGLE_IMGS],
        connectSrc: ["'self'", ...GOOGLE_CONNECT],
        frameSrc: [...GOOGLE_FRAMES],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
);

// ---------- compressão ----------
app.use(compression());

// ---------- canonical: força https + www ----------
// Ative com CANONICAL_HOST=www.populardaconstrucao.com.br quando o domínio estiver apontado.
const CANONICAL_HOST = process.env.CANONICAL_HOST;
app.use((req, res, next) => {
  if (!CANONICAL_HOST) return next();
  const host = req.headers.host;
  const inseguro = req.protocol !== 'https';
  if (inseguro || host !== CANONICAL_HOST) {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }
  next();
});

// ---------- healthcheck ----------
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime(), node: process.version });
});

// ---------- estáticos ----------
// Assets com hash de conteúdo poderiam ser imutáveis; como os nomes são fixos,
// usamos um ano com revalidação por ETag.
app.use(
  '/assets',
  express.static(path.join(PUBLIC_DIR, 'assets'), {
    maxAge: UM_ANO,
    etag: true,
    lastModified: true
  })
);

app.use(
  express.static(PUBLIC_DIR, {
    extensions: ['html'],
    maxAge: '1h',
    etag: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  })
);

// ---------- rotas amigáveis (tudo é uma página só) ----------
const ANCORAS = {
  '/empresa': '#empresa',
  '/na-loja': '#loja',
  '/historia': '#historia',
  '/app': '#app',
  '/app-cashback': '#app',
  '/unidades': '#unidades',
  '/contato': '#unidades',
  '/lojas': '#unidades'
};

for (const [rota, ancora] of Object.entries(ANCORAS)) {
  app.get(rota, (req, res) => res.redirect(301, `/${ancora}`));
}

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).type('html').send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Página não encontrada | Popular da Construção</title>
<link rel="icon" href="/assets/icon-32.png" sizes="32x32">
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FFCB01;color:#241B16;
       font-family:system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;padding:24px}
  img{width:120px;height:auto;margin-bottom:28px}
  h1{font-size:clamp(28px,7vw,44px);margin:0 0 12px;letter-spacing:-.03em}
  p{margin:0 0 28px;font-size:17px;color:#4A3418;max-width:42ch}
  a{display:inline-block;background:#241B16;color:#fff;text-decoration:none;
    padding:14px 26px;border-radius:999px;font-weight:600}
</style></head>
<body>
  <main>
    <img src="/assets/tijolo-popular.webp" alt="">
    <h1>Essa página não existe</h1>
    <p>O endereço que você abriu não está no ar. Volte para a página inicial para encontrar as lojas e o app.</p>
    <a href="/">Ir para o início</a>
  </main>
</body></html>`);
});

// ---------- erro ----------
app.use((err, req, res, next) => {
  console.error('[erro]', err);
  res.status(500).type('text').send('Erro interno. Tente novamente em instantes.');
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Popular da Construção no ar em http://${HOST}:${PORT} (Node ${process.version})`);
});

// Encerramento limpo — o painel da Brasil Cloud reinicia o container com SIGTERM.
for (const sinal of ['SIGTERM', 'SIGINT']) {
  process.on(sinal, () => {
    console.log(`${sinal} recebido, encerrando...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
