import { neon } from '@neondatabase/serverless';
import { PROPERTIES } from '../src/propertiesData.ts';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL env var is required');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seed() {
  for (const property of PROPERTIES) {
    await sql`
      INSERT INTO properties (id, title, location, price, type, beds, baths, sqm, image, images, featured, description)
      VALUES (
        ${property.id},
        ${property.title},
        ${property.location},
        ${property.price},
        ${property.type},
        ${String(property.beds)},
        ${String(property.baths)},
        ${String(property.sqm)},
        ${property.image},
        ${JSON.stringify(property.images)}::jsonb,
        ${Boolean((property as any).featured)},
        ${property.description}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        location = EXCLUDED.location,
        price = EXCLUDED.price,
        type = EXCLUDED.type,
        beds = EXCLUDED.beds,
        baths = EXCLUDED.baths,
        sqm = EXCLUDED.sqm,
        image = EXCLUDED.image,
        images = EXCLUDED.images,
        featured = EXCLUDED.featured,
        description = EXCLUDED.description,
        updated_at = now()
    `;
  }
  console.log(`Seeded ${PROPERTIES.length} properties.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
