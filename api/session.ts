import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthenticated } from './_auth.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ authenticated: isAuthenticated(req) });
}
