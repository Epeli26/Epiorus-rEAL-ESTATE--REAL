import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

/** Lazily initializes the Firebase Admin app from service-account env vars. */
function getFirebaseApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error(
      'Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_STORAGE_BUCKET.'
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Vercel/CI env vars store the key with literal "\n" sequences; restore real newlines.
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
    storageBucket,
  });
}

export function getStorageBucket() {
  return getStorage(getFirebaseApp()).bucket();
}
