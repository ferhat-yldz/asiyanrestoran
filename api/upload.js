export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

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

    // Vercel Blob varsa oraya yüklemeyi dene
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const buffer = Buffer.from(data.split(',').pop(), 'base64');
        const ext = name ? name.substring(name.lastIndexOf('.')) : '.jpg';
        const filename = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const blob = await put(filename, buffer, { access: 'public' });
        return res.status(200).json({ url: blob.url });
      } catch (e) {
        console.error('Blob upload error:', e);
      }
    }

    // Blob tanımlı değilse doğrudan Data URL döndürülür (tarayıcıda kusursuz çalışır)
    return res.status(200).json({ url: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
