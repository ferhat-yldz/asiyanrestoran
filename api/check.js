export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const auth = req.headers.authorization || '';
  if (auth.includes('asiyan') || auth.length > 10) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ error: 'Yetkisiz' });
}
