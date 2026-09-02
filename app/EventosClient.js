'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// Tamanho das miniaturas do grid (álbum/destaques): pede ao Next.js uma versão
// bem menor e comprimida da foto original, em vez da imagem em alta resolução
// enviada pelo /admin. Isso reduz muito o peso da página — a foto original em
// alta qualidade continua sendo usada quando o item é aberto no lightbox.
const TILE_SIZES = '(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 300px';

function MediaTile({ item, onOpen }) {
  return (
    <div className="tile" onClick={() => onOpen(item)}>
      {item.type === 'video' ? (
        <video src={item.url} muted playsInline preload="metadata" />
      ) : (
        <Image
          src={item.url}
          alt={item.caption || item.event}
          fill
          sizes={TILE_SIZES}
          quality={60}
          style={{ objectFit: 'cover' }}
        />
      )}
      {item.type === 'video' && (
        <div className="tile-play">
          <PlayIcon />
        </div>
      )}
      <div className="tile-overlay">
        <div>
          <div className="tile-name">{item.event}</div>
          {item.caption && <div className="tile-meta">{item.caption}</div>}
        </div>
      </div>
    </div>
  );
}

function EmptyTile({ label }) {
  return (
    <div className="ph">
      <div className="ph-empty-label">{label}</div>
    </div>
  );
}

const ALBUM_PAGE_SIZE = 12;

// Retorna algo como [1, '…', 4, 5, 6, '…', 20] para não listar centenas de páginas.
function getPageNumbers(current, total) {
  const pages = [];
  const add = (p) => pages.push(p);
  const window = 1;
  add(1);
  if (current - window > 2) add('…');
  for (let p = Math.max(2, current - window); p <= Math.min(total - 1, current + window); p++) {
    add(p);
  }
  if (current + window < total - 1) add('…');
  if (total > 1) add(total);
  return pages;
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Paginação do álbum">
      <button
        className="page-btn page-arrow"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        ‹
      </button>
      {getPageNumbers(page, totalPages).map((p, idx) =>
        p === '…' ? (
          <span className="page-ellipsis" key={`e${idx}`}>
            …
          </span>
        ) : (
          <button
            key={p}
            className={`page-btn${p === page ? ' active' : ''}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        className="page-btn page-arrow"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
      >
        ›
      </button>
    </nav>
  );
}

export default function EventosClient({ items }) {
  const [filter, setFilter] = useState('all');
  const [albumPage, setAlbumPage] = useState(1);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [formState, setFormState] = useState({ nome: '', email: '', whatsapp: '', cidade: '' });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [visibleWindow, setVisibleWindow] = useState(null);

  // Quando essa página é embutida via <iframe> (ex: dentro de uma Página do
  // Shopify), avisa a altura real do conteúdo pra página que está por fora
  // poder ajustar a altura do iframe dinamicamente — evita cortar conteúdo
  // ou sobrar espaço em branco. Se não estiver dentro de um iframe, isso
  // simplesmente não tem efeito nenhum (o postMessage não é escutado por ninguém).
  useEffect(() => {
    if (window.self === window.top) return; // não está em iframe, não precisa

    setIsEmbedded(true);

    // Sinaliza pro CSS que estamos num iframe, pra seções que usam altura da
    // tela (100vh/100svh — ex: hero) passarem a usar a altura do próprio
    // conteúdo. Isso evita um loop de crescimento infinito (ver globals.css).
    document.documentElement.classList.add('in-iframe');

    function reportHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'ybra-eventos-height', height }, '*');
    }

    reportHeight();
    const ro = new ResizeObserver(() => reportHeight());
    ro.observe(document.documentElement);
    window.addEventListener('load', reportHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('load', reportHeight);
    };
  }, []);

  // Dentro de um iframe "esticado" pra caber todo o conteúdo (sem barra de
  // rolagem própria — ver acima), "position:fixed" deixa de significar
  // "fixo na tela do visitante" e passa a significar "fixo no iframe
  // inteiro", que é do tamanho de toda a página. Resultado: o lightbox abria
  // no meio do iframe inteiro, não no meio do que a pessoa está realmente
  // vendo — daí a sensação de "abriu, mas preciso rolar pra achar a foto".
  // Pra corrigir, a página de fora (ver shopify-embed.html) nos avisa, a
  // cada scroll, qual faixa do iframe está atualmente visível na tela real.
  // Usamos essa faixa pra posicionar o lightbox exatamente aí.
  useEffect(() => {
    function handleMessage(e) {
      const data = e.data;
      if (data && data.type === 'ybra-eventos-viewport') {
        setVisibleWindow({ top: data.top, height: data.height });
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const lightboxStyle =
    isEmbedded && visibleWindow
      ? { position: 'absolute', top: visibleWindow.top, height: visibleWindow.height, left: 0, right: 0 }
      : undefined;

  const heroMedia = useMemo(() => items.find((i) => i.hero) || null, [items]);

  const highlights = useMemo(() => {
    const flagged = items.filter((i) => i.highlight);
    return (flagged.length ? flagged : items).slice(0, 8);
  }, [items]);

  const eventNames = useMemo(() => {
    const set = new Set(items.map((i) => i.event).filter(Boolean));
    return Array.from(set);
  }, [items]);

  const albumItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.event === filter);
  }, [items, filter]);

  const albumTotalPages = Math.max(1, Math.ceil(albumItems.length / ALBUM_PAGE_SIZE));

  useEffect(() => {
    if (albumPage > albumTotalPages) setAlbumPage(1);
  }, [albumTotalPages, albumPage]);

  const pagedAlbumItems = useMemo(() => {
    const start = (albumPage - 1) * ALBUM_PAGE_SIZE;
    return albumItems.slice(start, start + ALBUM_PAGE_SIZE);
  }, [albumItems, albumPage]);

  function selectFilter(name) {
    setFilter(name);
    setAlbumPage(1);
  }

  function goToAlbumPage(p) {
    const clamped = Math.min(Math.max(1, p), albumTotalPages);
    setAlbumPage(clamped);
    const el = document.getElementById('album');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submitLead(e) {
    e.preventDefault();
    setFormError('');
    if (!consent) {
      setFormError('Aceite receber novidades para continuar.');
      return;
    }
    setSubmitting(true);
    try {
      // Obs: esse endpoint tem o nome "/api/inscricao" (em vez de algo como
      // "/api/leads") de propósito — bloqueadores de anúncio e extensões de
      // privacidade (uBlock, AdBlock, proteção de rastreamento do navegador)
      // costumam ter listas de bloqueio que barram qualquer URL contendo a
      // palavra "leads" ou "lead", achando que é rastreamento de marketing.
      // Isso derrubava o pedido silenciosamente, sem chegar nem perto do
      // servidor — daí o forms sempre falhar sem nenhum registro nos logs.
      const res = await fetch('/api/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Não foi possível enviar. Tente novamente.');
      }
      setSubmitted(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="site">
      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-lines" />
        <img src="/gems/gem-white.png" alt="" aria-hidden="true" className="gem-decor gem-hero" />
        <div className="wrap hero-content">
          <div className="hero-grid">
            <div className="hero-top">
              <div className="hero-kicker">
                <span className="rule" />
                <span className="eyebrow">Eventos yBra</span>
              </div>
              <h1>
                Cocktail, design e <em>brasilidade</em>
                <br />
                que faz a yBra brilhar.
              </h1>
              <p className="hero-sub">
                Um encontro entre peças, pessoas e histórias — showroom, arte, música e conversa
                em um só lugar. Reviva os últimos encontros e garanta seu lugar no próximo.
              </p>
            </div>

            <div className="hero-media">
              {heroMedia ? (
                heroMedia.type === 'video' ? (
                  <video src={heroMedia.url} autoPlay muted loop playsInline />
                ) : (
                  <img src={heroMedia.url} alt={heroMedia.caption || heroMedia.event} />
                )
              ) : (
                <EmptyTile label="Vídeo (ou foto) principal do topo — envie pelo /admin e marque como “Hero”" />
              )}
            </div>
          </div>
        </div>
        <div className="wrap" style={{ position: 'relative', zIndex: 2, marginTop: 70 }}>
          <div className="scroll-hint">
            <span className="dot" /> Role para explorar
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto wrap" id="manifesto">
        <img src="/gems/gem-red.png" alt="" aria-hidden="true" className="gem-decor gem-manifesto" loading="lazy" />
        <div className="manifesto-grid">
          <div>
            <span className="eyebrow">A experiência</span>
            <h2 style={{ marginTop: 16 }}>
              Mais que um lançamento.
              <br />
              Um encontro.
            </h2>
          </div>
          <div className="manifesto-copy">
            <p>
              Os Eventos yBra nasceram para transformar o lançamento de uma coleção em uma noite
              inteira de pertencimento. Reunimos showroom, cocktail autoral, curadoria de arte e
              música em ambientes cuidadosamente escolhidos — sempre com a comunidade que inspira
              cada peça que criamos no centro da experiência.
            </p>
            <p>
              É onde você experimenta as novidades antes de qualquer vitrine, conhece de perto o
              processo por trás de cada joia e se conecta com pessoas que, como você, entendem que
              joia também é linguagem, afirmação e presença.
            </p>
          </div>
        </div>
        <div className="pillars">
          <div className="pillar">
            <div className="num">01</div>
            <h4>Cocktail</h4>
            <p>Drinks autorais e ambientação sensorial assinada, pensada peça por peça.</p>
          </div>
          <div className="pillar">
            <div className="num">02</div>
            <h4>Network</h4>
            <p>Encontros reais, sem filtros — a comunidade yBra em uma só sala.</p>
          </div>
          <div className="pillar">
            <div className="num">03</div>
            <h4>Design</h4>
            <p>Bastidores da coleção, materiais e processo contados por quem cria.</p>
          </div>
          <div className="pillar">
            <div className="num">04</div>
            <h4>Showroom</h4>
            <p>As peças da nova coleção para ver, sentir e experimentar antes de todo mundo.</p>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="highlights" id="galeria">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Últimos eventos</span>
              <h2>
                Um pouco do que já
                <br />
                vivemos juntos.
              </h2>
            </div>
            <p>
              {items.length
                ? 'Fotos e vídeos reais dos últimos encontros yBra.'
                : 'Assim que você enviar fotos e vídeos pelo admin, eles aparecem aqui automaticamente.'}
            </p>
          </div>
          <div className="media-grid">
            {highlights.length > 0
              ? highlights.map((item) => (
                  <MediaTile key={item.id} item={item} onOpen={setLightboxItem} />
                ))
              : [0, 1, 2, 3].map((i) => (
                  <EmptyTile key={i} label="Aguardando conteúdo — envie pelo /admin" />
                ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="experience wrap">
        <span className="eyebrow">Por dentro da noite</span>
        <h2 style={{ marginTop: 16, fontSize: 'clamp(28px,4vw,42px)', fontStyle: 'italic', maxWidth: 600 }}>
          Três camadas em cada edição.
        </h2>
        <div className="exp-grid">
          <div className="exp-card">
            <h3>Cocktail & Ambientação</h3>
            <p>
              Espaços curados, iluminação autoral e uma carta de drinks assinada para o clima de
              cada coleção — pensados para durar na memória tanto quanto as peças.
            </p>
          </div>
          <div className="exp-card">
            <h3>Showroom & Novidades</h3>
            <p>
              As peças mais recentes em exposição para ver e experimentar de perto, com
              atendimento personalizado e lançamentos em primeira mão.
            </p>
          </div>
          <div className="exp-card">
            <h3>Conexões & Cultura</h3>
            <p>
              Música, arte e conversa entre convidados que compartilham os mesmos valores — a
              comunidade que dá sentido a cada peça yBra.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="wrap">
          <span className="eyebrow">O clima da noite</span>
          <h2 style={{ marginTop: 16, fontSize: 'clamp(28px,4vw,42px)', fontStyle: 'italic', maxWidth: 600 }}>
            O que fica depois do evento.
          </h2>
          <div className="t-grid">
            <div className="t-card">
              <span className="quote-mark">"</span>
              <p className="quote">
                Essa coleção Casual, toda inspirada em Brasil, eu amei.
              </p>
              <span className="who">Luciana Gimenez</span>
            </div>
            <div className="t-card">
              <span className="quote-mark">"</span>
              <p className="quote">
                I now have my own little bit of Brazil! Thank you.
              </p>
              <span className="who">Richard</span>
            </div>
            <div className="t-card">
              <span className="quote-mark">"</span>
              <p className="quote">
                Que evento maravilhoso, já quero o próximo.
              </p>
              <span className="who">Jhennifer Mesquita</span>
            </div>
          </div>
        </div>
      </section>

      {/* ALBUM */}
      <section className="album wrap" id="album">
        <div className="section-head">
          <div>
            <span className="eyebrow">Álbum completo</span>
            <h2>
              Fotos e vídeos de
              <br />
              todas as edições.
            </h2>
          </div>
          <p>Clique em qualquer item para abrir em destaque. Organize por edição usando os filtros.</p>
        </div>
        {eventNames.length > 0 && (
          <div className="album-tabs">
            <button
              className={`tab${filter === 'all' ? ' active' : ''}`}
              onClick={() => selectFilter('all')}
            >
              Todos
            </button>
            {eventNames.map((name) => (
              <button
                key={name}
                className={`tab${filter === name ? ' active' : ''}`}
                onClick={() => selectFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        <div className="media-grid">
          {pagedAlbumItems.length > 0
            ? pagedAlbumItems.map((item) => (
                <MediaTile key={item.id} item={item} onOpen={setLightboxItem} />
              ))
            : [0, 1, 2, 3, 4, 5].map((i) => (
                <EmptyTile key={i} label="Espaço reservado para fotos e vídeos" />
              ))}
        </div>

        <div className="album-footer">
          {albumItems.length > 0 && (
            <p className="album-count">
              {albumItems.length} {albumItems.length === 1 ? 'item' : 'itens'}
              {albumTotalPages > 1 && ` · página ${albumPage} de ${albumTotalPages}`}
            </p>
          )}
          <Pagination page={albumPage} totalPages={albumTotalPages} onChange={goToAlbumPage} />
        </div>

        <img src="/gems/gem-green.png" alt="" aria-hidden="true" className="gem-decor gem-album" loading="lazy" />
      </section>

      {lightboxItem && (
        <div className="lightbox open" onClick={() => setLightboxItem(null)} style={lightboxStyle}>
          <span className="lightbox-close" onClick={() => setLightboxItem(null)}>
            Fechar ✕
          </span>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            {lightboxItem.type === 'video' ? (
              <video src={lightboxItem.url} controls autoPlay />
            ) : (
              <img src={lightboxItem.url} alt={lightboxItem.caption || lightboxItem.event} />
            )}
          </div>
        </div>
      )}

      {/* NEXT EVENT / LEAD FORM */}
      <section className="next" id="proximo">
        <img src="/gems/gem-blue.png" alt="" aria-hidden="true" className="gem-decor gem-next" loading="lazy" />
        <div className="wrap next-grid">
          <div>
            <div className="next-status">
              <span className="dot" />
              <span>Próxima edição em preparação</span>
            </div>
            <h2>
              O próximo capítulo
              <br />
              já está sendo escrito.
            </h2>
            <p className="lead-copy">
              Data e local serão revelados em breve, primeiro para quem estiver na lista. Deixe
              seus dados e seja convidado(a) entre os primeiros a saber — antes de qualquer
              anúncio público.
            </p>
            <a
              href="https://ybrajoalheria.com.br/pages/data-sharing-opt-out?view=sobre-a-ybra"
              className="btn"
              style={{ marginTop: 6 }}
              target="_top"
            >
              Conhecer a yBra ↗
            </a>
          </div>

          <div>
            <form className="lead-form" onSubmit={submitLead}>
              {!submitted ? (
                <>
                  <div className="row2">
                    <div className="field">
                      <label htmlFor="nome">Nome completo</label>
                      <input
                        id="nome"
                        required
                        placeholder="Seu nome"
                        value={formState.nome}
                        onChange={(e) => setFormState((s) => ({ ...s, nome: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="whatsapp">WhatsApp</label>
                      <input
                        id="whatsapp"
                        required
                        placeholder="(11) 90000-0000"
                        value={formState.whatsapp}
                        onChange={(e) => setFormState((s) => ({ ...s, whatsapp: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={formState.email}
                      onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="cidade">Cidade</label>
                    <input
                      id="cidade"
                      placeholder="Onde você mora"
                      value={formState.cidade}
                      onChange={(e) => setFormState((s) => ({ ...s, cidade: e.target.value }))}
                    />
                  </div>
                  <div className="consent">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <label htmlFor="consent">
                      Aceito receber novidades, convites e comunicações da yBra por e-mail e
                      WhatsApp.
                    </label>
                  </div>
                  <button type="submit" className="btn solid" disabled={submitting}>
                    {submitting ? 'Enviando…' : 'Quero receber o convite'}
                  </button>
                  {formError && <p className="error-note">{formError}</p>}
                  <p className="form-note">
                    Suas informações são usadas apenas para convites e novidades da yBra. Sem spam.
                  </p>
                </>
              ) : (
                <div className="thanks">
                  <div className="glyph">✓</div>
                  <h3>Convite garantido.</h3>
                  <p>
                    Você está na lista. Avisaremos em primeira mão assim que a data do próximo
                    evento yBra for revelada.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}