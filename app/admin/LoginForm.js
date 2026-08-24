'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ noPasswordConfigured }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Não foi possível entrar.');
        return;
      }
      router.refresh();
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="login-wrap">
        <div className="login-card">
          <h1>Eventos yBra</h1>
          <p>Acesso restrito ao painel administrativo.</p>

          {noPasswordConfigured ? (
            <p className="error-note" style={{ textAlign: 'left' }}>
              A variável <strong>ADMIN_PASSWORD</strong> ainda não foi configurada nas
              Environment Variables do projeto na Vercel. Configure-a e faça um novo deploy para
              habilitar o login.
            </p>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn solid" style={{ width: '100%', marginTop: 20, justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
              {error && <p className="error-note">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
