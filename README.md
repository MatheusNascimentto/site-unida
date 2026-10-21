# Unida — site institucional

HTML, CSS e JavaScript sem framework e sem dependências npm. Quatro páginas de conteúdo e página de privacidade. Feito para GitHub e Vercel. O código é versionado no GitHub; a hospedagem é feita pela Vercel.

## Estrutura

```
index.html                 início
solucoes/index.html        soluções
a-unida/index.html         empresa e vídeo
contato/index.html         canais e localização
privacidade/index.html     navegação e medição opcional
styles.css                 identidade e responsividade
app.js                     motion e interações
config.js                  configuração pública da prévia
site.config.json           configuração usada no build
assets/                    fotografias, logo e vídeo
api/social.js              adaptador server-side para feeds
scripts/                   servidor local, build e checagens
vercel.json                build, rotas e cabeçalhos
robots.txt / sitemap.xml   base local para buscadores
```

## Rodar localmente

Usar Node.js 22 ou superior:

```sh
npm run dev
```

Abrir `http://127.0.0.1:4173`. Use HTTP; abrir index.html por duplo clique não resolve rotas absolutas e APIs corretamente. `npm run check` verifica metadados, links locais e sintaxe; `npm run build` gera `dist/`.

## GitHub e Vercel

1. Subir o conteúdo desta pasta no repositório. Não subir `.env`, `.vercel`, `node_modules` ou `dist`.
2. Importar o repositório na Vercel, com Root Directory apontando para esta pasta se estiver dentro de outro repositório.
3. Framework Preset: Other; Build Command: `npm run build`; Output Directory: `dist`. `vercel.json` já declara a configuração.
4. Confirmar domínio principal antes de indexar. `siteUrl` usa `https://unidasolucoes.com.br`, o endereço enviado pelo usuário, mas o Google/site antigo também referenciam `orgunida.com.br`. Escolher o domínio e definir redirecionamentos de domínio no painel Vercel/DNS antes da migração.

A publicação e a conexão de contas são etapas separadas do código versionado. Os arquivos podem ser editados diretamente. O build copia somente os arquivos públicos necessários para dist; documentação e configurações do projeto não fazem parte da saída estática.

## SEO, Analytics e Search Console

Editar `site.config.json` e fazer novo build/deploy:

- `siteUrl`: origem HTTPS principal. Alimenta canonical, Open Graph, JSON-LD e sitemap.
- `indexable`: está `false` enquanto o protótipo é avaliado. Quando estiver pronto, definir `true`. Builds Vercel de Preview continuam com `noindex` mesmo com essa opção ligada. Para testar produção localmente, definir NODE_ENV=production ao executar o build.
- `ga4MeasurementId`: vazio até criar/confirmar uma propriedade real GA4; depois inserir o ID público `G-...`. Não é token secreto. Analytics só é ativado no build de produção e mediante consentimento do visitante.
- `searchConsoleVerification`: token público de verificação HTML, caso esse método seja escolhido. A propriedade de domínio exige TXT no DNS; o site não cria a conta/propriedade nem verifica sozinho.

O documento `docs/SEO-E-MEDICAO.md` explica detalhes e pendências. SEO não garante posição ou indexação. A análise final de performance, Rich Results e Search Console será feita no domínio publicado.

## Conteúdo e integrações

O vídeo é o MP4 original recuperado do site antigo. A capa usa a fachada enquanto não se escolhe um frame. Revisar o conteúdo antigo e produzir legendas antes da publicação. O símbolo circular e a assinatura UNIDA enviados pelo cliente estão reunidos em um SVG que incorpora os arquivos originais. Não é uma vetorização; um arquivo oficial em vetor poderá substituí-lo futuramente.

Fotos do Instagram são registros reais usados para a prévia; não representam os três últimos posts. Avaliações são recortes de consulta pública com fonte e data de prévia. **Instagram e Google ainda não atualizam automaticamente** sem conectar os provedores. Ver `docs/INTEGRACOES.md`.

O portfólio resumido, as fotografias e os contatos precisam de revisão pela Unida. FLEXCERT e o feed de notícias foram excluídos. Não há formulário que simule envio. WhatsApp, telefone, e-mail, rota e Onvio são links reais e podem abrir serviços externos.

## Motion

Fachada panorâmica com degradê, entrada coordenada do título, foto e ações. A rolagem move a foto com amplitude curta e revela grupos de conteúdo. No celular, as entradas têm deslocamento e duração próprios; a narrativa possui indicador compacto de etapa fixo durante sua seção. Rolagem nativa, sem reprodução automática de vídeo e sem animações em loop. Movimentos ativos por padrão conforme a direção aprovada, sem botão no rodapé e sem depender da preferência antiga salva no navegador.
