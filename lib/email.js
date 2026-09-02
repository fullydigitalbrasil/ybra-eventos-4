import { Resend } from 'resend';

// Endereço que aparece como remetente do e-mail. O domínio "resend.dev" é o
// domínio de testes do Resend — funciona sem nenhuma configuração, mas só
// entrega e-mails para o endereço usado para criar a conta no Resend. Depois
// que você verificar um domínio próprio na Resend (ver README/CHANGELOG),
// defina a variável de ambiente RESEND_FROM_EMAIL no Vercel (ex:
// "Eventos yBra <convites@ybrajoalheria.com.br>") pra poder enviar pra
// qualquer endereço, sem essa limitação.
const FROM = process.env.RESEND_FROM_EMAIL || 'Eventos yBra <onboarding@resend.dev>';

// Para quem os e-mails de novo lead são enviados por padrão. Pode ser
// sobrescrito a qualquer momento (sem precisar mexer no código) definindo a
// variável de ambiente LEADS_NOTIFY_EMAILS no Vercel, com um ou mais
// endereços separados por vírgula.
const DEFAULT_RECIPIENTS = ['mario@fullydigital.com.br', 'contato@ybrajewelry.com'];

function getRecipients() {
  const raw = process.env.LEADS_NOTIFY_EMAILS;
  if (!raw) return DEFAULT_RECIPIENTS;
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : DEFAULT_RECIPIENTS;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Envia um e-mail avisando sobre um novo cadastro (lead) no formulário
// "Quero receber o convite". Se algo der errado (chave não configurada,
// serviço fora do ar, endereço não permitido etc.), a função não lança
// erro — só registra no log. O cadastro do lead já foi salvo antes dessa
// etapa ser chamada, então um problema no envio do e-mail nunca deve
// impedir a pessoa de se cadastrar.
export async function sendLeadNotification(lead) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      'RESEND_API_KEY não configurada no Vercel — o lead foi salvo normalmente, mas o e-mail de aviso não foi enviado.'
    );
    return;
  }

  const recipients = getRecipients();
  const createdAt = lead.createdAt ? new Date(lead.createdAt) : new Date();
  const dataHora = createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif; font-size:15px; color:#1b1e1c; line-height:1.6;">
      <h2 style="margin:0 0 18px; font-size:19px;">Novo cadastro para o próximo evento yBra</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0; color:#5c635f;">Nome</td><td><strong>${escapeHtml(lead.nome)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#5c635f;">E-mail</td><td>${escapeHtml(lead.email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#5c635f;">WhatsApp</td><td>${escapeHtml(lead.whatsapp)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#5c635f;">Cidade</td><td>${escapeHtml(lead.cidade || '—')}</td></tr>
      </table>
      <p style="color:#8b9089; font-size:12px; margin-top:22px;">Recebido em ${escapeHtml(dataHora)} · também disponível em /admin</p>
    </div>
  `;

  const resend = new Resend(apiKey);

  // Enviamos um e-mail POR destinatário (em vez de um único envio com todos
  // no "to") de propósito: sem verificar um domínio próprio na Resend, o
  // plano gratuito só entrega e-mails para o endereço que criou a conta na
  // Resend — e, nos testes, um "to" com mais de um endereço faz a Resend
  // recusar o envio inteiro (nem o destinatário permitido recebe nada).
  // Enviando um por um, o destinatário permitido recebe normalmente mesmo
  // que os outros falhem, e cada falha fica registrada separadamente no log.
  const results = await Promise.allSettled(
    recipients.map(async (to) => {
      const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: `Novo cadastro — Eventos yBra: ${lead.nome}`,
        html,
      });
      if (error) throw error;
    })
  );

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`Falha ao enviar e-mail de novo lead para ${recipients[i]}:`, result.reason);
    }
  });
}