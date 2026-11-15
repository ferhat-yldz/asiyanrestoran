// Bağımlılıksız Node.js sunucusu: API + admin + build edilmiş React sitesi
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'asiyan123';
const DATA = path.join(__dirname, 'data.json');
const UP = path.join(ROOT, 'uploads');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(UP, { recursive: true });
if (!fs.existsSync(DATA)) fs.copyFileSync(path.join(__dirname, 'seed.json'), DATA);

const tokens = new Set();
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.gif': 'image/gif' };
const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, { 'Content-Type': type });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = req => new Promise(r => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => r(Buffer.concat(c).toString())); });
const authed = req => tokens.has((req.headers.authorization || '').replace('Bearer ', ''));

http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  try {
    if (url === '/api/data' && req.method === 'GET') return send(res, 200, fs.readFileSync(DATA));
    if (url === '/api/login' && req.method === 'POST') {
      const b = JSON.parse((await readBody(req)) || '{}');
      if (b.user === ADMIN_USER && b.pass === ADMIN_PASS) {
        const t = crypto.randomBytes(24).toString('hex'); tokens.add(t);
        return send(res, 200, { token: t });
      }
      return send(res, 401, { error: 'Hatalı giriş' });
    }
    if (url === '/api/check' && req.method === 'GET') return authed(req) ? send(res, 200, { ok: true }) : send(res, 401, { error: 'Yetkisiz' });
    if (url === '/api/data' && req.method === 'PUT') {
      if (!authed(req)) return send(res, 401, { error: 'Yetkisiz' });
      const body = await readBody(req); JSON.parse(body);
      fs.writeFileSync(DATA, body); return send(res, 200, { ok: true });
    }
    if (url === '/api/upload' && req.method === 'POST') {
      if (!authed(req)) return send(res, 401, { error: 'Yetkisiz' });
      const b = JSON.parse(await readBody(req));
      const ext = path.extname(b.name || '.jpg').toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4'].includes(ext)) return send(res, 400, { error: 'Geçersiz dosya' });
      const name = crypto.randomBytes(6).toString('hex') + ext;
      fs.writeFileSync(path.join(UP, name), Buffer.from(b.data.split(',').pop(), 'base64'));
      return send(res, 200, { url: '/uploads/' + name });
    }
    let file = url.startsWith('/uploads/') ? path.join(UP, path.basename(url)) : path.join(DIST, url);
    if (!file.startsWith(UP) && !file.startsWith(DIST)) return send(res, 403, 'Yasak', 'text/plain');
    if (!(fs.existsSync(file) && fs.statSync(file).isFile())) file = path.join(DIST, 'index.html'); // SPA
    if (!fs.existsSync(file)) return send(res, 404, 'Önce "npm run build" çalıştırın', 'text/plain');
    send(res, 200, fs.readFileSync(file), mime[path.extname(file)] || 'application/octet-stream');
  } catch (e) { send(res, 500, { error: e.message }); }
}).listen(PORT, () => console.log(`Aşiyan: http://localhost:${PORT}  |  Admin: http://localhost:${PORT}/admin`));
