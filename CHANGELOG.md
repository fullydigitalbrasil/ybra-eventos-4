# Changelog — Eventos yBra

Todas as atualizações do sistema ficam registradas aqui, da mais recente para a mais antiga.
Cada versão corresponde a um commit no Git — dá pra ver o histórico completo com `git log`,
comparar duas versões com `git diff` ou voltar para qualquer ponto anterior se precisar.

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
