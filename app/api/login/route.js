import { NextResponse } from 'next/server';
import { checkPassword, makeToken, COOKIE_NAME } from '../../../lib/auth';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PASSWORD não configurada no projeto Vercel.' },
      { status: 500 }
    );
  }
  if (!checkPassword(body.password)) {
    return NextResponse.json({ ok: false, error: 'Senha incorreta.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
