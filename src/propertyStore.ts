export const PROPERTY_STORAGE_KEY = 'epirus_admin_properties_v1';
export const INQUIRY_STORAGE_KEY = 'epirus_admin_inquiries_v1';

export type AdminProperty = {
  id: number;
  title: string;
  location: string;
  price: string;
  type: string;
  beds: number | string;
  baths: number | string;
  sqm: number | string;
  image: string;
  images: string[];
  featured?: boolean;
  description: string;
};

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  locations: string;
  types: string;
  budget: string;
  contactMethod: string;
  bestTime: string;
  message: string;
};

function readCache<T>(key: string, defaults: T): T {
  if (typeof window === 'undefined') return defaults;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaults;
  } catch {
    return defaults;
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/** Local cache used only as an instant-render fallback before the API responds. */
export function loadStoredProperties<T>(defaults: T[]): T[] {
  return readCache(PROPERTY_STORAGE_KEY, defaults);
}

/** Fetches live properties from the database. Falls back to the cached/default list on failure. */
export async function fetchProperties<T>(defaults: T[]): Promise<T[]> {
  try {
    const response = await fetch('/api/properties');
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const properties = (await response.json()) as T[];
    writeCache(PROPERTY_STORAGE_KEY, properties);
    return properties;
  } catch {
    return readCache(PROPERTY_STORAGE_KEY, defaults);
  }
}

export async function createProperty(property: Omit<AdminProperty, 'id'>): Promise<AdminProperty> {
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(property),
  });
  if (!response.ok) throw new Error('Failed to create property');
  return response.json();
}

export async function updateProperty(property: AdminProperty): Promise<AdminProperty> {
  const response = await fetch(`/api/properties/${property.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(property),
  });
  if (!response.ok) throw new Error('Failed to update property');
  return response.json();
}

export async function deleteProperty(id: number): Promise<void> {
  const response = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete property');
}

export function loadInquiries(): Inquiry[] {
  return readCache<Inquiry[]>(INQUIRY_STORAGE_KEY, []);
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const response = await fetch('/api/inquiries');
  if (!response.ok) throw new Error('Failed to load inquiries');
  const inquiries = (await response.json()) as Inquiry[];
  writeCache(INQUIRY_STORAGE_KEY, inquiries);
  return inquiries;
}

export async function saveInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<void> {
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inquiry),
  });
  if (!response.ok) throw new Error('Failed to submit inquiry');
}

export async function adminLogin(password: string): Promise<boolean> {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return response.ok;
}

export async function adminLogout(): Promise<void> {
  await fetch('/api/logout', { method: 'POST' });
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/session');
    if (!response.ok) return false;
    const data = (await response.json()) as { authenticated: boolean };
    return data.authenticated;
  } catch {
    return false;
  }
}
