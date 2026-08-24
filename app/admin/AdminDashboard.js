'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';

function csvEscape(val) {
  const s = String(val ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export default function AdminDashboard({ initialMedia, initialLeads }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState('media');
  const [media, setMedia] = useState(initialMedia);
  const [leads] = useState(initialLeads);

  const [eventName, setEventName] = useState('');
  const [caption, setCaption] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [hero, setHero] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadError, setUploadError] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    const files = Array.from(fileInputRef.current?.files || []);
    if (!files.length) {
      setUploadError(true);
      setUploadMsg('Escolha ao menos um arquivo.');
      return;
    }
    if (!eventName.trim()) {
      setUploadError(true);
      setUploadMsg('Informe o nome do evento/edição.');
      return;
    }

    setUploading(true);
    setUploadError(false);

    const uploaded = [];
    const failed = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadMsg(
        files.length > 1
          ? `Enviando ${i + 1} de ${files.length}: ${file.name}`
          : `Enviando ${file.name}…`
      );
      try {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        uploaded.push({
          url: blob.url,
          type: file.type.startsWith('video') ? 'video' : 'photo',
          event: eventName.trim(),
          caption: caption.trim(),
          highlight,
          hero,
        });
      } catch (err) {
        failed.push({ name: file.name, message: err.message || 'erro desconhecido' });
      }
    }

    if (uploaded.length) {
      setUploadMsg('Salvando informações…');
      try {
        const res = await fetch('/api/media-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: uploaded }),
        });
        if (!res.ok) throw new Error('Falha ao salvar itens no álbum.');
        const data = await res.json();
        setMedia(data.items || []);
      } catch (err) {
        failed.push({ name: '(salvar no álbum)', message: err.message });
      }
    }

    if (failed.length) {
      setUploadError(true);
      setUploadMsg(
        `${uploaded.length} de ${files.length} arquivo(s) enviado(s). Falharam: ${failed
          .map((f) => `${f.name} (${f.message})`)
          .join('; ')}`
      );
    } else {
      setUploadError(false);
      setUploadMsg(
        files.length > 1
          ? `${uploaded.length} arquivos enviados com sucesso!`
          : 'Enviado com sucesso!'
      );
      setCaption('');
      setHighlight(false);
      setHero(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta mídia da página?')) return;
    const res = await fetch('/api/media-items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const data = await res.json();
      setMedia(data.items || []);
    }
  }

  async function handleSetHero(id, value) {
    const res = await fetch('/api/media-items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, hero: value }),
    });
    if (res.ok) {
      const data = await res.json();
      setMedia(data.items || []);
    }
  }

  function exportCsv() {
    const header = ['Nome', 'E-mail', 'WhatsApp', 'Cidade', 'Data'];
    const rows = leads.map((l) => [
      l.nome,
      l.email,
      l.whatsapp,
      l.cidade,
      new Date(l.createdAt).toLocaleString('pt-BR'),
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-eventos-ybra.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <div className="admin-header">
          <div className="logo">
            yBra <span>Admin</span>
          </div>
          <div className="admin-actions">
            <a href="/" className="btn" target="_blank" rel="noreferrer">
              Ver site ↗
            </a>
            <button className="btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={tab === 'media' ? 'active' : ''} onClick={() => setTab('media')}>
            Mídia ({media.length})
          </button>
          <button className={tab === 'leads' ? 'active' : ''} onClick={() => setTab('leads')}>
            Leads ({leads.length})
          </button>
        </div>

        {tab === 'media' && (
          <>
            <div className="upload-card">
              <h3>Enviar foto ou vídeo</h3>
              <form className="upload-grid" onSubmit={handleUpload}>
                <div className="field" style={{ gridColumn: '1/-1' }}>
                  <label>Arquivos (fotos e/ou vídeos)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    required
                  />
                  <span className="field-hint">
                    Selecione vários de uma vez (segure Ctrl ou Cmd ao clicar) — todos usarão o
                    mesmo evento, legenda e destaque abaixo.
                  </span>
                </div>
                <div className="field">
                  <label>Nome do evento / edição</label>
                  <input
                    placeholder="Ex: Coleção Îagûara — São Paulo"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Legenda (opcional)</label>
                  <input
                    placeholder="Ex: Showroom & Cocktail"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="highlight"
                    checked={highlight}
                    onChange={(e) => setHighlight(e.target.checked)}
                  />
                  <label htmlFor="highlight">Destacar na seção "Últimos Eventos" da home</label>
                </div>
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="hero"
                    checked={hero}
                    onChange={(e) => setHero(e.target.checked)}
                  />
                  <label htmlFor="hero">
                    Usar como vídeo/foto principal do topo (Hero) — envie só 1 arquivo por vez
                    marcando esta opção
                  </label>
                </div>
                <div className="upload-actions">
                  <button type="submit" className="btn solid" disabled={uploading}>
                    {uploading ? 'Enviando…' : 'Enviar mídia'}
                  </button>
                  {uploadMsg && (
                    <span className={`upload-status${uploadError ? ' error' : ''}`}>
                      {uploadMsg}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {media.length === 0 ? (
              <p className="empty-note">Nenhuma mídia enviada ainda. Use o formulário acima.</p>
            ) : (
              <div className="admin-media-grid">
                {media.map((item) => (
                  <div className="admin-media-item" key={item.id}>
                    <span className="badge">{item.type === 'video' ? 'Vídeo' : 'Foto'}</span>
                    {item.hero && <span className="badge badge-hero">Hero</span>}
                    <button className="del-btn" onClick={() => handleDelete(item.id)} title="Remover">
                      ✕
                    </button>
                    <div className="thumb">
                      {item.type === 'video' ? (
                        <video src={item.url} muted />
                      ) : (
                        <img src={item.url} alt={item.caption || item.event} />
                      )}
                    </div>
                    <div className="meta">
                      <div className="ev">{item.event}</div>
                      {item.caption && <div className="cap">{item.caption}</div>}
                    </div>
                    <button
                      type="button"
                      className="hero-toggle"
                      onClick={() => handleSetHero(item.id, !item.hero)}
                    >
                      {item.hero ? 'Remover do topo' : 'Usar como principal do topo'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'leads' && (
          <>
            <div className="leads-toolbar">
              <p style={{ color: 'var(--cream-dim)', fontSize: 13.5 }}>
                Pessoas que pediram convite para o próximo evento.
              </p>
              <button className="btn" onClick={exportCsv} disabled={!leads.length}>
                Exportar CSV
              </button>
            </div>
            {leads.length === 0 ? (
              <p className="empty-note">Nenhum lead recebido ainda.</p>
            ) : (
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>WhatsApp</th>
                    <th>Cidade</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td>{l.nome}</td>
                      <td>{l.email}</td>
                      <td>{l.whatsapp}</td>
                      <td>{l.cidade}</td>
                      <td>{new Date(l.createdAt).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
