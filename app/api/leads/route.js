import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { isAuthenticated } from '../../../lib/auth';
import { getLeads, saveLeads } from '../../../lib/data';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (!body.nome || !body.email || !body.whatsapp) {
    return NextResponse.json({ error: 'Preencha nome, e-mail e WhatsApp.' }, { status: 400 });
  }
  const data = await getLeads();
  data.items = data.items || [];
  data.items.unshift({
    id: randomUUID(),
    createdAt: Date.now(),
    nome: body.nome,
    email: body.email,
    whatsapp: body.whatsapp,
    cidade: body.cidade || '',
  });
  await saveLeads(data);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const ok = await isAuthenticated();
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const data = await getLeads();
  return NextResponse.json(data);
}
