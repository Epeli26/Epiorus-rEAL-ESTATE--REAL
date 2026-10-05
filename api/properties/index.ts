import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../_db.js';
import { isAuthenticated } from '../_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = getSql();

  if (req.method === 'GET') {
    const rows = (await sql`SELECT * FROM properties ORDER BY created_at DESC`) as Record<string, any>[];
    res.status(200).json(rows.map(toProperty));
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = Date.now();
    const [row] = (await sql`
      INSERT INTO properties (id, title, location, price, type, beds, baths, sqm, image, images, featured, description)
      VALUES (
        ${id},
        ${String(body.title ?? '')},
        ${String(body.location ?? '')},
        ${String(body.price ?? '')},
        ${String(body.type ?? 'house')},
        ${String(body.beds ?? '-')},
        ${String(body.baths ?? '-')},
        ${String(body.sqm ?? '')},
        ${String(body.image ?? '')},
        ${JSON.stringify(body.images ?? [])}::jsonb,
        ${Boolean(body.featured)},
        ${String(body.description ?? '')}
      )
      RETURNING *
    `) as Record<string, any>[];
    res.status(201).json(toProperty(row));
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

function toProperty(row: Record<string, any>) {
  return {
    id: Number(row.id),
    title: row.title,
    location: row.location,
    price: row.price,
    type: row.type,
    beds: row.beds,
    baths: row.baths,
    sqm: row.sqm,
    image: row.image,
    images: row.images ?? [],
    featured: row.featured,
    description: row.description,
  };
}
