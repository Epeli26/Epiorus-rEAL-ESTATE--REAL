import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionCookie } from './_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: 'Admin login is not configured' });
    return;
  }

  const { password } = (req.body ?? {}) as { password?: string };
  if (typeof password !== 'string' || password !== adminPassword) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  res.status(200).json({ ok: true });
}
