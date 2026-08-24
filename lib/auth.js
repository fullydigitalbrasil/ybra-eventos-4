import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'ybra_admin';

function getSecret() {
  const pwd = process.env.ADMIN_PASSWORD || '';
  return crypto.createHash('sha256').update('ybra-eventos-salt::' + pwd).digest('hex');
}

export function makeToken() {
  return crypto.createHmac('sha256', getSecret()).update('authenticated').digest('hex');
}

export async function isAuthenticated() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = makeToken();
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function checkPassword(pwd) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const a = Buffer.from(String(pwd || ''));
  const b = Buffer.from(process.env.ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
