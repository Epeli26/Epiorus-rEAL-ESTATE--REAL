import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from '../_db.ts';
import { isAuthenticated } from '../_auth.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const id = Number(req.query.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const sql = getSql();

  if (req.method === 'PUT') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const [row] = (await sql`
      UPDATE properties SET
        title = ${String(body.title ?? '')},
        location = ${String(body.location ?? '')},
        price = ${String(body.price ?? '')},
        type = ${String(body.type ?? 'house')},
        beds = ${String(body.beds ?? '-')},
        baths = ${String(body.baths ?? '-')},
        sqm = ${String(body.sqm ?? '')},
        image = ${String(body.image ?? '')},
        images = ${JSON.stringify(body.images ?? [])}::jsonb,
        featured = ${Boolean(body.featured)},
        description = ${String(body.description ?? '')},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `) as Record<string, any>[];
    if (!row) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(200).json(toProperty(row));
    return;
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM properties WHERE id = ${id}`;
    res.status(204).end();
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
