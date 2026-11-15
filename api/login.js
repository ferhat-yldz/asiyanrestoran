export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, pass } = req.body || {};
  if (user === 'admin' && pass === 'asiyan123') {
    return res.status(200).json({ token: 'asiyan-auth-token-valid' });
  }

  return res.status(401).json({ error: 'Hatalı giriş' });
}
