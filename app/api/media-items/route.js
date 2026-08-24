import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { del } from '@vercel/blob';
import { isAuthenticated } from '../../../lib/auth';
import { getMedia, saveMedia } from '../../../lib/data';

export async function GET() {
  const data = await getMedia();
  return NextResponse.json(data);
}

export async function POST(req) {
  const ok = await isAuthenticated();
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  // Aceita um item único ({url, type, ...}) ou um lote ({items: [{url, type, ...}, ...]})
  const incoming = Array.isArray(body.items) ? body.items : [body];

  const now = Date.now();
  const newOnes = incoming
    .filter((item) => item && item.url && item.type)
    .map((item) => ({
      id: randomUUID(),
      createdAt: now,
      url: item.url,
      type: item.type, // 'photo' | 'video'
      event: item.event || 'Geral',
      caption: item.caption || '',
      highlight: !!item.highlight,
      hero: !!item.hero,
    }));

  if (!newOnes.length) {
    return NextResponse.json({ error: 'campos obrigatórios ausentes' }, { status: 400 });
  }

  const data = await getMedia();
  data.items = data.items || [];

  // Só um item pode ser o "Hero" (vídeo/foto principal do topo) por vez.
  const incomingHasHero = newOnes.some((i) => i.hero);
  if (incomingHasHero) {
    data.items = data.items.map((i) => (i.hero ? { ...i, hero: false } : i));
    // se vier mais de um marcado como hero no mesmo lote, mantém só o último
    let heroAssigned = false;
    for (let i = newOnes.length - 1; i >= 0; i--) {
      if (newOnes[i].hero) {
        if (heroAssigned) newOnes[i].hero = false;
        heroAssigned = true;
      }
    }
  }

  // Mantém o mesmo comportamento de "mais recente primeiro" que o unshift item a item teria.
  data.items = [...newOnes.reverse(), ...data.items];
  await saveMedia(data);
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const ok = await isAuthenticated();
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id, hero } = await req.json();
  if (!id) return NextResponse.json({ error: 'id ausente' }, { status: 400 });

  const data = await getMedia();
  data.items = data.items || [];
  const exists = data.items.some((i) => i.id === id);
  if (!exists) return NextResponse.json({ error: 'item não encontrado' }, { status: 404 });

  if (hero) {
    // Só um item pode ser o Hero por vez.
    data.items = data.items.map((i) => ({ ...i, hero: i.id === id }));
  } else {
    data.items = data.items.map((i) => (i.id === id ? { ...i, hero: false } : i));
  }

  await saveMedia(data);
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const ok = await isAuthenticated();
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const data = await getMedia();
  data.items = data.items || [];
  const target = data.items.find((i) => i.id === id);
  data.items = data.items.filter((i) => i.id !== id);
  await saveMedia(data);

  if (target?.url) {
    try {
      await del(target.url);
    } catch (e) {
      // arquivo pode já não existir; ignora
    }
  }

  return NextResponse.json(data);
}
