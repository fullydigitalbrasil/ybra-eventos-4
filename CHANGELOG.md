# Changelog — Eventos yBra

Todas as atualizações do sistema ficam registradas aqui, da mais recente para a mais antiga.
Cada versão corresponde a um commit no Git — dá pra ver o histórico completo com `git log`,
comparar duas versões com `git diff` ou voltar para qualquer ponto anterior se precisar.

## [1.2.0] — Remoção de botões do topo, miniaturas mais leves e lightbox no iframe

- Removidos os botões "Quero receber o próximo convite" e "Ver últimos eventos" do
  topo (hero) da página.
- As miniaturas de fotos (destaques e álbum completo) agora carregam versões
  redimensionadas e comprimidas, geradas automaticamente pelo Next.js, em vez da
  foto original em alta resolução enviada pelo /admin. Isso reduz bastante o peso
  da página — em testes, uma miniatura que antes pesava ~190KB passou a pesar
  cerca de 8 a 13KB. A foto em qualidade original continua sendo usada quando o
  item é aberto em destaque (lightbox).
- Corrigido: quando a página está embutida numa Página do Shopify (iframe), abrir
  uma foto em destaque abria a visualização no meio da página inteira, exigindo
  rolar a tela pra cima ou pra baixo até encontrá-la. Agora a página que embute
  (Shopify) avisa qual trecho está realmente visível na tela, e a visualização
  abre exatamente nessa área — sem precisar rolar. Esse ajuste só afeta o uso
  dentro do iframe; acessando a página diretamente, o comportamento continua o
  mesmo de sempre.
- **Atenção:** essa versão exige também atualizar o arquivo colado na Página do
  Shopify (`shopify-embed.html`) — a versão anterior não envia a informação de
  área visível que a correção do lightbox precisa.

## [1.1.0] — Suporte a embutir a página dentro do Shopify (iframe)

- A página agora detecta quando está sendo carregada dentro de um `<iframe>` (por
  exemplo, embutida numa Página do Shopify) e avisa automaticamente a altura real do
  conteúdo pra página de fora, pra o iframe se ajustar sem cortar conteúdo nem sobrar
  espaço em branco. Isso não muda nada em quem acessa a página diretamente (fora de
  iframe) — o comportamento só entra em ação quando está embutida.
- Corrigido um bug em que, dentro do iframe, algumas seções que usavam "altura da
  tela" (o topo/hero, por exemplo) entravam num loop de crescimento infinito, já que
  dentro de um iframe "altura da tela" passa a significar "altura do próprio iframe".
  Agora essas seções usam a altura do próprio conteúdo quando embutidas.
- Testado localmente simulando uma Página do Shopify com o iframe: a altura fica
  estável e o conteúdo aparece por completo, sem cortes.

## [1.0.2] — Remoção de textos de aviso/instrução

- Removida a nota "* Depoimentos de exemplo — substitua por relatos reais de convidados
  antes de publicar." abaixo dos depoimentos.
- Removido o texto "Envie fotos e vídeos pelo painel administrativo em /admin..." no
  final do álbum.
- Removida também a regra de CSS `.album-note`, que só era usada por esse texto.

## [1.0.1] — Ajuste de espaço no hero

- A caixa de vídeo/foto principal do topo (hero) estava deixando um espaço vazio grande
  demais em telas muito largas (monitores ultrawide). Aumentei a largura máxima do
  conteúdo do hero para a caixa ocupar mais espaço e sobrar menos vazio ao lado.
- Mudança isolada só no hero — nenhuma outra seção da página foi afetada.

## [1.0.0] — Início do controle de versões

Ponto de partida do versionamento. A partir daqui, toda atualização feita no site vira uma
nova versão registrada aqui e no histórico do Git.

Estado do sistema nesta versão:

- Site público "Eventos yBra" com hero (foto/vídeo principal), seção "A experiência",
  destaques dos últimos eventos, depoimentos (exemplo), álbum completo com filtros por
  edição e paginação, e formulário de captação de leads para o próximo evento.
- Design em tema claro (preto/verde `#435953`), sem header nem footer.
- 4 pedras preciosas decorativas espalhadas pela página (fundo transparente, tamanhos e
  posições variados, ocultas em telas pequenas).
- Painel `/admin` protegido por senha (`ADMIN_PASSWORD`), com:
  - upload de múltiplas fotos/vídeos de uma vez (armazenados no Vercel Blob);
  - marcação de mídia em destaque e definição do vídeo/foto "Hero" do topo;
  - visualização e exportação (CSV) dos leads recebidos.
