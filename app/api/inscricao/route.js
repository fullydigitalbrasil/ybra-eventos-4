import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { isAuthenticated } from '../../../lib/auth';
import { getLeads, saveLeads } from '../../../lib/data';
import { sendLeadNotification } from '../../../lib/email';

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

  const lead = {
    id: randomUUID(),
    createdAt: Date.now(),
    nome: body.nome,
    email: body.email,
    whatsapp: body.whatsapp,
    cidade: body.cidade || '',
  };

  // Salvar o lead é a parte que realmente não pode falhar em silêncio: antes,
  // um erro aqui (ex: problema de acesso ao Vercel Blob) derrubava a rota
  // inteira sem responder um JSON de erro, e a pessoa via só a mensagem
  // genérica "Não foi possível enviar. Tente novamente." — sem pista nenhuma
  // do que houve. Agora capturamos o erro, registramos o motivo real nos
  // logs do Vercel (Deployments → seu deploy → Runtime Logs) e respondemos
  // com uma mensagem específica.
  try {
    const data = await getLeads();
    data.items = data.items || [];
    data.items.unshift(lead);
    await saveLeads(data);
  } catch (err) {
    console.error('Falha ao salvar lead (Vercel Blob):', err);
    return NextResponse.json(
      { error: 'Não foi possível salvar seu cadastro agora. Tente novamente em instantes.' },
      { status: 500 }
    );
  }

  // Avisa por e-mail que chegou um novo cadastro. Isso nunca deve impedir a
  // resposta de sucesso pra pessoa que preencheu o formulário — o cadastro já
  // está salvo no passo acima independente do e-mail funcionar ou não.
  await sendLeadNotification(lead);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const ok = await isAuthenticated();
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const data = await getLeads();
  return NextResponse.json(data);
}