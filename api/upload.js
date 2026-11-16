export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

const REPO_OWNER = 'ferhat-yldz';
const REPO_NAME = 'asiyanrestoran';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization || '';
  if (!auth.includes('asiyan') && auth.length < 10) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }

  try {
    const { name, data } = req.body || {};
    if (!data) return res.status(400).json({ error: 'Dosya verisi bulunamadı' });

    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const base64Content = data.includes(',') ? data.split(',').pop() : data;
    const ext = name ? name.substring(name.lastIndexOf('.')).toLowerCase() : '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

    // 1. GitHub API ile doğrudan depoya fotoğraf yükleme
    if (githubToken) {
      try {
        const ghRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/uploads/${filename}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AsiyanRestoran-App'
          },
          body: JSON.stringify({
            message: `Fotoğraf yüklendi: ${filename}`,
            content: base64Content,
            branch: 'main'
          })
        });

        if (ghRes.ok) {
          // Yüklenen dosya GitHub'a işlendi, yolu döner
          return res.status(200).json({ url: `/uploads/${filename}` });
        }
      } catch (err) {
        console.error('GitHub photo upload error:', err);
      }
    }

    // 2. Vercel Blob varsa oraya yüklemeyi dene
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const buffer = Buffer.from(base64Content, 'base64');
        const blob = await put(`uploads/${filename}`, buffer, { access: 'public' });
        return res.status(200).json({ url: blob.url });
      } catch (e) {}
    }

    // 3. Doğrudan Data URL döndürülür (tarayıcıda anında çalışır)
    return res.status(200).json({ url: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
