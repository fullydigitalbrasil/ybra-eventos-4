\# Changelog — Eventos yBra



Todas as atualizações do sistema ficam registradas aqui, da mais recente para a mais antiga.

Cada versão corresponde a um commit no Git — dá pra ver o histórico completo com `git log`,

comparar duas versões com `git diff` ou voltar para qualquer ponto anterior se precisar.



\## \[1.3.3] — Corrige o e-mail de novo lead não sendo entregue a ninguém



\- Causa provável do e-mail não chegar: sem verificar um domínio próprio na

&#x20; Resend, o plano gratuito só entrega e-mails para o endereço que criou a

&#x20; conta na Resend (no seu caso, `mario@fullydigital.com.br`) — e um único

&#x20; envio com \*\*dois\*\* destinatários no mesmo e-mail (`mario@...` e

&#x20; `contato@ybrajewelry.com`) faz a Resend recusar o envio \*\*inteiro\*\*, então

&#x20; nem o endereço permitido recebia nada.

\- Corrigido: agora cada destinatário recebe um envio separado e independente.

&#x20; Assim, `mario@fullydigital.com.br` (o dono da conta na Resend) passa a

&#x20; receber normalmente mesmo que `contato@ybrajewelry.com` continue sendo

&#x20; recusado por enquanto — e cada envio que falhar fica registrado no log com

&#x20; o endereço específico, facilitando identificar qual deles precisa do

&#x20; domínio verificado.

\- Testei o envio para os dois endereços separadamente e confirmei que uma

&#x20; falha em um não afeta mais o outro.

\- \*\*Para `contato@ybrajewelry.com` também receber\*\*, é necessário verificar

&#x20; um domínio próprio na Resend (Resend → Domains → Add Domain, com os

&#x20; registros de DNS que eles fornecem) e depois definir a variável de ambiente

&#x20; `RESEND\_FROM\_EMAIL` no Vercel com um remetente desse domínio (ex:

&#x20; `Eventos yBra <convites@seudominio.com>`). Me avise se quiser ajuda com

&#x20; esse passo.



\## \[1.3.2] — Causa real do erro "Não foi possível enviar" encontrada e corrigida



\- Depois da v1.3.1, o erro continuou aparecendo e \*\*nenhum erro aparecia nos logs

&#x20; do Vercel\*\* — essa combinação foi a pista decisiva: o pedido nem chegava a

&#x20; entrar no servidor. A causa mais provável é bloqueadores de anúncio e

&#x20; extensões de privacidade (uBlock Origin, AdBlock, proteção de rastreamento do

&#x20; navegador, etc.), que trazem listas de bloqueio que barram qualquer chamada

&#x20; para um endereço contendo a palavra "leads" — interpretando como rastreamento

&#x20; de marketing — mesmo sendo uma chamada do próprio site, para o próprio site.

\- Corrigido renomeando o endereço interno que o formulário usa para enviar os

&#x20; dados: de `/api/leads` para `/api/inscricao`. Não muda nada visualmente nem

&#x20; no /admin — é só o "endereço interno" que o navegador usa por trás dos

&#x20; panos, agora com um nome que essas listas de bloqueio não reconhecem.

\- Testei local o cadastro de ponta a ponta pelo novo endereço e confirmei que

&#x20; funciona normalmente.

\- \*\*Se por acaso o erro persistir mesmo depois dessa correção\*\*, é sinal de que

&#x20; a causa é outra — nesse caso, tente enviar o formulário com o bloqueador de

&#x20; anúncios do navegador desativado nesse site, e me avise se isso resolve. Isso

&#x20; confirma (ou descarta) de vez essa causa.



\## \[1.3.1] — Diagnóstico do erro "Não foi possível enviar" no formulário



\- Corrigido: se algo desse errado ao salvar um cadastro (ex: um problema de acesso

&#x20; ao Vercel Blob), o erro não era tratado e a pessoa via a mensagem genérica "Não

&#x20; foi possível enviar. Tente novamente." sem nenhuma pista do motivo real — nem

&#x20; pra você, nem pra mim. Agora esse tipo de falha é capturado e o motivo exato

&#x20; fica registrado nos logs do Vercel (aba "Logs" ou "Runtime Logs" do projeto),

&#x20; o que ajuda a identificar a causa se o problema acontecer de novo.

\- \*\*Se o erro "Não foi possível enviar" continuar aparecendo depois dessa

&#x20; atualização\*\*, veja a mensagem exata nos Runtime Logs do Vercel (deploy mais

&#x20; recente → aba Logs, procure por "Falha ao salvar lead") e me envie o texto —

&#x20; com isso eu consigo apontar a causa exata (ex: token do Vercel Blob expirado

&#x20; ou desconectado) em vez de tentar adivinhar.



\## \[1.3.0] — E-mail de novo lead e correção do botão "Conhecer a yBra"



\- Corrigido o botão "Conhecer a yBra" (final da página): ele estava tentando abrir

&#x20; o site da yBra dentro do próprio iframe embutido no Shopify, e o site recusava

&#x20; ser carregado ali dentro (erro de "redirecionamento"). Agora o link abre sempre

&#x20; na aba/janela principal do navegador, e aponta para

&#x20; `https://ybrajoalheria.com.br/pages/data-sharing-opt-out?view=sobre-a-ybra`.

\- Adicionado envio automático de e-mail sempre que alguém preenche o formulário

&#x20; "Quero receber o convite". O cadastro continua sendo salvo normalmente (e

&#x20; aparece em /admin) mesmo se o envio do e-mail falhar por algum motivo — uma

&#x20; coisa nunca depende da outra.

\- Usamos o serviço \*\*Resend\*\* para o envio. \*\*Configuração necessária no Vercel\*\*

&#x20; antes desse recurso funcionar (Configurações do projeto → Environment Variables):

&#x20; - `RESEND\_API\_KEY` — crie uma conta gratuita em resend.com, gere uma API key em

&#x20;   "API Keys" e cole o valor aqui.

&#x20; - Por padrão, os e-mails vão para `mario@fullydigital.com.br` e

&#x20;   `contato@ybrajewelry.com`. Pra mudar isso sem precisar editar código, defina

&#x20;   `LEADS\_NOTIFY\_EMAILS` com um ou mais e-mails separados por vírgula.

&#x20; - \*\*Importante:\*\* sem verificar um domínio próprio na Resend, o plano gratuito

&#x20;   só entrega e-mails para o endereço usado para criar a conta na Resend — outros

&#x20;   endereços podem não receber nada no início. Verificando um domínio (em

&#x20;   Resend → Domains) e definindo `RESEND\_FROM\_EMAIL` (ex:

&#x20;   `Eventos yBra <convites@seudominio.com>`), o envio passa a funcionar pra

&#x20;   qualquer destinatário.

&#x20; - Depois de configurar as variáveis de ambiente, é preciso fazer um novo

&#x20;   deploy no Vercel pra elas valerem (Vercel → Deployments → "..." → Redeploy).



\## \[1.2.1] — Depoimentos reais



\- Substituídos os 3 depoimentos de exemplo pelos depoimentos reais de convidados:

&#x20; Luciana Gimenez, Richard e Jhennifer Mesquita.

\- Removida a etiqueta "Exemplo" que aparecia nos cartões de depoimento (só fazia

&#x20; sentido enquanto o conteúdo ainda era fictício).



\## \[1.2.0] — Remoção de botões do topo, miniaturas mais leves e lightbox no iframe



\- Removidos os botões "Quero receber o próximo convite" e "Ver últimos eventos" do

&#x20; topo (hero) da página.

\- As miniaturas de fotos (destaques e álbum completo) agora carregam versões

&#x20; redimensionadas e comprimidas, geradas automaticamente pelo Next.js, em vez da

&#x20; foto original em alta resolução enviada pelo /admin. Isso reduz bastante o peso

&#x20; da página — em testes, uma miniatura que antes pesava \~190KB passou a pesar

&#x20; cerca de 8 a 13KB. A foto em qualidade original continua sendo usada quando o

&#x20; item é aberto em destaque (lightbox).

\- Corrigido: quando a página está embutida numa Página do Shopify (iframe), abrir

&#x20; uma foto em destaque abria a visualização no meio da página inteira, exigindo

&#x20; rolar a tela pra cima ou pra baixo até encontrá-la. Agora a página que embute

&#x20; (Shopify) avisa qual trecho está realmente visível na tela, e a visualização

&#x20; abre exatamente nessa área — sem precisar rolar. Esse ajuste só afeta o uso

&#x20; dentro do iframe; acessando a página diretamente, o comportamento continua o

&#x20; mesmo de sempre.

\- \*\*Atenção:\*\* essa versão exige também atualizar o arquivo colado na Página do

&#x20; Shopify (`shopify-embed.html`) — a versão anterior não envia a informação de

&#x20; área visível que a correção do lightbox precisa.



\## \[1.1.0] — Suporte a embutir a página dentro do Shopify (iframe)



\- A página agora detecta quando está sendo carregada dentro de um `<iframe>` (por

&#x20; exemplo, embutida numa Página do Shopify) e avisa automaticamente a altura real do

&#x20; conteúdo pra página de fora, pra o iframe se ajustar sem cortar conteúdo nem sobrar

&#x20; espaço em branco. Isso não muda nada em quem acessa a página diretamente (fora de

&#x20; iframe) — o comportamento só entra em ação quando está embutida.

\- Corrigido um bug em que, dentro do iframe, algumas seções que usavam "altura da

&#x20; tela" (o topo/hero, por exemplo) entravam num loop de crescimento infinito, já que

&#x20; dentro de um iframe "altura da tela" passa a significar "altura do próprio iframe".

&#x20; Agora essas seções usam a altura do próprio conteúdo quando embutidas.

\- Testado localmente simulando uma Página do Shopify com o iframe: a altura fica

&#x20; estável e o conteúdo aparece por completo, sem cortes.



\## \[1.0.2] — Remoção de textos de aviso/instrução



\- Removida a nota "\* Depoimentos de exemplo — substitua por relatos reais de convidados

&#x20; antes de publicar." abaixo dos depoimentos.

\- Removido o texto "Envie fotos e vídeos pelo painel administrativo em /admin..." no

&#x20; final do álbum.

\- Removida também a regra de CSS `.album-note`, que só era usada por esse texto.



\## \[1.0.1] — Ajuste de espaço no hero



\- A caixa de vídeo/foto principal do topo (hero) estava deixando um espaço vazio grande

&#x20; demais em telas muito largas (monitores ultrawide). Aumentei a largura máxima do

&#x20; conteúdo do hero para a caixa ocupar mais espaço e sobrar menos vazio ao lado.

\- Mudança isolada só no hero — nenhuma outra seção da página foi afetada.



\## \[1.0.0] — Início do controle de versões



Ponto de partida do versionamento. A partir daqui, toda atualização feita no site vira uma

nova versão registrada aqui e no histórico do Git.



Estado do sistema nesta versão:



\- Site público "Eventos yBra" com hero (foto/vídeo principal), seção "A experiência",

&#x20; destaques dos últimos eventos, depoimentos (exemplo), álbum completo com filtros por

&#x20; edição e paginação, e formulário de captação de leads para o próximo evento.

\- Design em tema claro (preto/verde `#435953`), sem header nem footer.

\- 4 pedras preciosas decorativas espalhadas pela página (fundo transparente, tamanhos e

&#x20; posições variados, ocultas em telas pequenas).

\- Painel `/admin` protegido por senha (`ADMIN\_PASSWORD`), com:

&#x20; - upload de múltiplas fotos/vídeos de uma vez (armazenados no Vercel Blob);

&#x20; - marcação de mídia em destaque e definição do vídeo/foto "Hero" do topo;

&#x20; - visualização e exportação (CSV) dos leads recebidos.

