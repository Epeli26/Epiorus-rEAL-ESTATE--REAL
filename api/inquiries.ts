import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from './_db';
import { isAuthenticated } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = getSql();

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = `inquiry-${Date.now()}`;
    await sql`
      INSERT INTO inquiries (id, name, email, phone, interest, locations, types, budget, contact_method, best_time, message)
      VALUES (
        ${id},
        ${String(body.name ?? '')},
        ${String(body.email ?? '')},
        ${String(body.phone ?? '')},
        ${String(body.interest ?? '')},
        ${String(body.locations ?? '')},
        ${String(body.types ?? '')},
        ${String(body.budget ?? '')},
        ${String(body.contactMethod ?? '')},
        ${String(body.bestTime ?? '')},
        ${String(body.message ?? '')}
      )
    `;
    res.status(201).json({ ok: true, id });
    return;
  }

  if (req.method === 'GET') {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const rows = (await sql`SELECT * FROM inquiries ORDER BY created_at DESC`) as Record<string, any>[];
    res.status(200).json(
      rows.map((row: Record<string, any>) => ({
        id: row.id,
        createdAt: row.created_at,
        name: row.name,
        email: row.email,
        phone: row.phone,
        interest: row.interest,
        locations: row.locations,
        types: row.types,
        budget: row.budget,
        contactMethod: row.contact_method,
        bestTime: row.best_time,
        message: row.message,
      }))
    );
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
