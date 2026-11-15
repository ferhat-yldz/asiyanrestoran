export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers.authorization || '';
  if (auth.includes('asiyan') || auth.length > 10) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ error: 'Yetkisiz' });
}
