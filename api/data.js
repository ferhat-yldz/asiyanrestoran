import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  try {
    const dataPath = path.join(process.cwd(), 'server', 'data.json');
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf-8');
      return res.status(200).send(content);
    }
    const seedPath = path.join(process.cwd(), 'server', 'seed.json');
    if (fs.existsSync(seedPath)) {
      const content = fs.readFileSync(seedPath, 'utf-8');
      return res.status(200).send(content);
    }
  } catch (err) {
    // fallback
  }

  res.status(200).json({ status: 'ok' });
}
