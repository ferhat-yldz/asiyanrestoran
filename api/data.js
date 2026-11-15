import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

const getLocalData = () => {
  try {
    const dataPath = path.join(process.cwd(), 'server', 'data.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    const seedPath = path.join(process.cwd(), 'server', 'seed.json');
    if (fs.existsSync(seedPath)) {
      return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Local data read error:', e);
  }
  return null;
};

export default async function handler(req, res) {
  // CORS & caching headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // --- GET ---
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (kvUrl && kvToken) {
      try {
        const kvRes = await fetch(`${kvUrl}/get/asiyan_data`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        if (kvRes.ok) {
          const json = await kvRes.json();
          if (json.result) {
            const data = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
            return res.status(200).json(data);
          }
        }

        // KV boş ise yerel veriyi alıp KV'ye tohumlayalım (otomatik seed)
        const initial = getLocalData();
        if (initial) {
          await fetch(`${kvUrl}/set/asiyan_data`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${kvToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(initial))
          });
          return res.status(200).json(initial);
        }
      } catch (err) {
        console.error('KV GET error:', err);
      }
    }

    // KV yoksa veya hata verdiyse yerel data.json'u dön
    const local = getLocalData();
    if (local) return res.status(200).json(local);

    return res.status(200).json({ site: {}, categories: [], products: [], gallery: [] });
  }

  // --- PUT ---
  if (req.method === 'PUT') {
    const auth = req.headers.authorization || '';
    if (!auth.includes('asiyan') && auth.length < 10) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }

    const body = req.body;
    if (!body) return res.status(400).json({ error: 'Veri boş' });
    const payloadStr = typeof body === 'string' ? body : JSON.stringify(body);

    let savedToKv = false;
    if (kvUrl && kvToken) {
      try {
        const kvRes = await fetch(`${kvUrl}/set/asiyan_data`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payloadStr)
        });
        if (kvRes.ok) {
          savedToKv = true;
        } else {
          console.error('KV SET failed:', await kvRes.text());
        }
      } catch (err) {
        console.error('KV PUT error:', err);
      }
    }

    // Yerel dosya sistemine yazmayı dene (lokal ortamda ise kalıcı olsun)
    try {
      const dataPath = path.join(process.cwd(), 'server', 'data.json');
      fs.writeFileSync(dataPath, payloadStr, 'utf-8');
    } catch (e) {
      // Vercel read-only filesystem'de beklenen durum
    }

    if (savedToKv) {
      return res.status(200).json({
        ok: true,
        storage: 'vercel-kv',
        message: 'Değişiklikler canlı Vercel KV veritabanına başarıyla kaydedildi.'
      });
    }

    return res.status(200).json({
      ok: true,
      storage: 'ephemeral',
      warning: 'Vercel KV deposu henüz bağlanmadı. Canlı sitede değişikliklerin kalıcı olması için Vercel panelinden "Storage > KV" aktif edilmelidir.'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
