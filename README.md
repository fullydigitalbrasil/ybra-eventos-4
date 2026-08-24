# Eventos yBra — site + admin de mídia

Site dinâmico da página "Eventos yBra": galeria, álbum e formulário de lead
já vêm do banco de mídia gerenciado por um painel `/admin` protegido por senha,
onde você mesmo sobe fotos e vídeos sem mexer em código.

## Passo a passo para publicar

### 1. Deploy inicial
1. Acesse https://vercel.com/drop
2. Arraste este `.zip` (ou a pasta descompactada) para a página.
3. Dê um nome ao projeto (ex: `eventos-ybra`) e clique em **Deploy**.

Nesse primeiro deploy o site já sobe, mas o admin ainda não funciona —
faltam duas coisas para configurar (abaixo).

### 2. Criar o armazenamento de mídia (Vercel Blob)
1. Abra o projeto recém-criado no painel da Vercel.
2. Vá em **Storage** → **Create Database** → **Blob**.
3. Dê um nome (ex: `midia-eventos`) e conecte ao projeto.
   A Vercel cria automaticamente as variáveis de ambiente necessárias
   (`BLOB_READ_WRITE_TOKEN` etc.) — não precisa copiar nada manualmente.

### 3. Definir a senha do admin
1. No projeto, vá em **Settings** → **Environment Variables**.
2. Adicione uma variável chamada `ADMIN_PASSWORD` com a senha que você quiser usar.
3. Salve.

### 4. Reimplantar (redeploy)
1. Vá na aba **Deployments**.
2. No deployment mais recente, abra o menu (`⋯`) e clique em **Redeploy**.

Pronto — depois desse redeploy:

- O site fica em `https://SEU-PROJETO.vercel.app/`
- O painel de administração fica em `https://SEU-PROJETO.vercel.app/admin`
  (entre com a senha definida em `ADMIN_PASSWORD`)

## Usando o admin

- **Aba Mídia**: envie fotos ou vídeos, escolha o nome do evento/edição
  (isso vira automaticamente um filtro no álbum do site) e, opcionalmente,
  marque "Destacar na home" para aparecer na seção "Últimos Eventos".
  Fotos e vídeos aparecem no site imediatamente, sem precisar de novo deploy.
- **Aba Leads**: mostra todas as pessoas que preencheram o formulário de
  interesse no próximo evento, com botão para exportar em CSV.

## Controle de versões

Este projeto agora usa Git para registrar todas as atualizações do sistema.
Cada mudança vira um commit com data, autor e descrição — dá pra ver o
histórico completo, comparar versões ou voltar para qualquer ponto anterior.
O resumo de cada versão fica em [`CHANGELOG.md`](./CHANGELOG.md).

### Publicando atualizações a partir de agora (GitHub + Vercel)

Em vez de reenviar um `.zip` pelo vercel.com/drop a cada mudança (o que sempre
cria um projeto novo), o ideal é conectar este repositório ao GitHub e importar
esse repositório na Vercel uma única vez. Depois disso, cada atualização é só
um `git push` — a Vercel publica automaticamente e mantém o histórico de
deployments ligado a cada commit (com rollback de 1 clique).

**Configuração única (só precisa fazer uma vez):**

1. Crie um repositório vazio no GitHub (github.com → New repository). Não
   marque nenhuma opção de inicializar com README/gitignore — este projeto já
   traz tudo pronto.
2. No terminal, dentro da pasta do projeto:
   ```
   git remote add origin https://github.com/SEU-USUARIO/eventos-ybra.git
   git push -u origin main
   ```
3. Na Vercel: **Add New** → **Project** → **Import Git Repository** → selecione
   este repositório. A Vercel detecta que é Next.js automaticamente.
4. Configure de novo (só uma vez, neste novo projeto): o Blob Storage
   (**Storage** → **Create Database** → **Blob**) e a variável `ADMIN_PASSWORD`
   (**Settings** → **Environment Variables**), exatamente como no primeiro deploy.

**A partir daí, toda atualização é:**
```
git add -A
git commit -m "descrição da mudança"
git push
```
A Vercel publica sozinha em segundos, e você sempre pode ver o histórico de
versões tanto no GitHub (`git log`) quanto na aba **Deployments** da Vercel.

## Migração futura para Shopify

Quando migrar para a Shopify, o conteúdo (fotos, vídeos, textos dos leads)
pode ser exportado a partir do admin (CSV de leads; os links de mídia ficam
salvos no Vercel Blob e podem ser baixados) para recriar a página na loja.
