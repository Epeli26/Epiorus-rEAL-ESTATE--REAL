import { randomUUID } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthenticated } from './_auth.js';

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

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    res.status(500).json({ error: 'Image uploads are not configured. Set IMAGEKIT_PRIVATE_KEY.' });
    return;
  }

  const fileName = `property-${randomUUID()}.${EXTENSION_BY_MIME_TYPE[match[1]]}`;
  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(bytes)], { type: match[1] }), fileName);
  formData.append('fileName', fileName);
  formData.append('folder', '/properties');

  const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}` },
    body: formData,
  });

  if (!uploadResponse.ok) {
    let message = `ImageKit upload failed (HTTP ${uploadResponse.status})`;
    try {
      const details = (await uploadResponse.json()) as { message?: string };
      if (details.message) message = details.message;
    } catch {
      // Keep the HTTP status message when ImageKit does not return JSON.
    }
    res.status(502).json({ error: message });
    return;
  }

  const uploaded = (await uploadResponse.json()) as { url?: unknown };
  if (typeof uploaded.url !== 'string') {
    res.status(502).json({ error: 'ImageKit did not return an image URL' });
    return;
  }
  res.status(201).json({ imageUrl: uploaded.url });
}
