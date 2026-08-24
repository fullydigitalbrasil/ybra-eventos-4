import { put, list, del } from '@vercel/blob';

const MEDIA_PATH = 'data/media.json';
const LEADS_PATH = 'data/leads.json';

async function readJson(pathname, fallback) {
  try {
    const { blobs } = await list({ prefix: pathname });
    const found = blobs.find((b) => b.pathname === pathname);
    if (!found) return fallback;
    const res = await fetch(found.url, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return await res.json();
  } catch (e) {
    return fallback;
  }
}

async function writeJson(pathname, data) {
  const { blobs } = await list({ prefix: pathname });
  const existing = blobs.find((b) => b.pathname === pathname);
  if (existing) {
    try {
      await del(existing.url);
    } catch (e) {
      // ignore
    }
  }
  await put(pathname, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export async function getMedia() {
  return readJson(MEDIA_PATH, { items: [] });
}

export async function saveMedia(data) {
  await writeJson(MEDIA_PATH, data);
}

export async function getLeads() {
  return readJson(LEADS_PATH, { items: [] });
}

export async function saveLeads(data) {
  await writeJson(LEADS_PATH, data);
}
