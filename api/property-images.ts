import { randomUUID } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthenticated } from './_auth.js';
import { getStorageBucket } from './_firebase.js';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const DATA_URL_PATTERN = /^data:(image\/(?:gif|jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const dataUrl = (req.body as { dataUrl?: unknown } | undefined)?.dataUrl;
  if (typeof dataUrl !== 'string') {
    res.status(400).json({ error: 'An image is required' });
    return;
  }

  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) {
    res.status(400).json({ error: 'Upload a JPEG, PNG, WebP, or GIF image' });
    return;
  }

  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    res.status(413).json({ error: 'Each image must be smaller than 2 MB after compression' });
    return;
  }

  const fileName = `properties/property-${randomUUID()}.${EXTENSION_BY_MIME_TYPE[match[1]]}`;

  try {
    const bucket = getStorageBucket();
    const file = bucket.file(fileName);
    await file.save(bytes, {
      contentType: match[1],
      resumable: false,
    });
    await file.makePublic();
    res.status(201).json({ imageUrl: file.publicUrl() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Firebase Storage upload failed';
    res.status(502).json({ error: message });
  }
}
