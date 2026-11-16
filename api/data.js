import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

const REPO_OWNER = 'ferhat-yldz';
const REPO_NAME = 'asiyanrestoran';
const FILE_PATH = 'server/data.json';

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // --- GET ---
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // 1. Önce GitHub API üzerinden en güncel dosyayı çekmeyi dene
    if (githubToken) {
      try {
        const ghRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AsiyanRestoran-App'
          }
        });
        if (ghRes.ok) {
          const ghJson = await ghRes.json();
          if (ghJson.content) {
            const decoded = Buffer.from(ghJson.content, 'base64').toString('utf-8');
            return res.status(200).json(JSON.parse(decoded));
          }
        }
      } catch (err) {
        console.error('GitHub GET error:', err);
      }
    }

    // 2. Vercel KV varsa oradan çek
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
      } catch (err) {
        console.error('KV GET error:', err);
      }
    }

    // 3. Fallback: Yerel server/data.json
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
    const payloadStr = typeof body === 'string' ? body : JSON.stringify(body, null, 2);

    let savedToGithub = false;

    // 1. GitHub API ile doğrudan depoya commit atma
    if (githubToken) {
      try {
        // Mevcut dosyanın SHA değerini öğren
        let sha = null;
        const checkRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AsiyanRestoran-App'
          }
        });
        if (checkRes.ok) {
          const checkJson = await checkRes.json();
          sha = checkJson.sha;
        }

        // Dosyayı GitHub'da güncelle
        const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AsiyanRestoran-App'
          },
          body: JSON.stringify({
            message: 'Yönetim Paneli: Menü ve ayarlar güncellendi',
            content: Buffer.from(payloadStr).toString('base64'),
            sha: sha,
            branch: 'main'
          })
        });

        if (putRes.ok) {
          savedToGithub = true;
        } else {
          const errBody = await putRes.text();
          console.error('GitHub PUT failed:', putRes.status, errBody);
        }
      } catch (err) {
        console.error('GitHub PUT error:', err);
      }
    }

    // 2. Vercel KV varsa oraya da yaz
    if (kvUrl && kvToken) {
      try {
        await fetch(`${kvUrl}/set/asiyan_data`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payloadStr)
        });
      } catch (err) {}
    }

    // 3. Yerel diske de yazmayı dene
    try {
      const dataPath = path.join(process.cwd(), 'server', 'data.json');
      fs.writeFileSync(dataPath, payloadStr, 'utf-8');
    } catch (e) {}

    if (savedToGithub) {
      return res.status(200).json({
        ok: true,
        storage: 'github',
        message: 'Değişiklikler doğrudan GitHub deponuza kaydedildi ve canlıya aktarılıyor.'
      });
    }

    if (kvUrl && kvToken) {
      return res.status(200).json({
        ok: true,
        storage: 'vercel-kv',
        message: 'Değişiklikler KV veritabanına kaydedildi.'
      });
    }

    return res.status(200).json({
      ok: true,
      storage: 'ephemeral',
      warning: 'GitHub Token henüz Vercel\'e eklenmedi. Verilerin kalıcı olması için Vercel Environment Variables kısmına GITHUB_TOKEN eklenmelidir.'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
