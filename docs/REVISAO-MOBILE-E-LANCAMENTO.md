# Revisão de 21/10/2026

## Interface e reprodução

Marca reduzida no cabeçalho e rodapé. Área do Cliente preservada em uma linha, sem encolhimento do botão ou sobreposição com menu em telas pequenas. Controle do vídeo com SVG de pausa/play, centralizado em 32px.

Hero com arquivo móvel explícito, preload automático, muted/defaultMuted, playsinline e tentativas no carregamento, retorno à aba e primeira interação. Respeita pausa escolhida pelo visitante e pausa fora da tela. Um bloqueio do navegador ou modo de economia ainda pode impedir autoplay: não é possível garantir sua execução em todo dispositivo.

As fotos disponíveis são capas de 360×640px. A galeria deixa de ampliá-las/cortá-las em painéis de cerca de 500px e usa colunas de até 280px com proporção original. Não foram inventados rostos ou detalhes por IA. Nitidez fotográfica plena em telas de alta densidade depende de originais maiores fornecidos pela equipe. Uma capa adicional consultada não era a mesma foto e foi descartada.

Avisos de capa provisória, novas fotos, prévia do Google e capas de exemplo retirados da interface. Isso não conecta as integrações.

## Fontes sociais

Google Maps conferido novamente em 21/10/2026: nota 5,0, quatro avaliações. Os comentários de Luan Oliveira e Eluana Mota exibidos no site correspondem aos textos da ficha; o primeiro é um trecho. Não houve sincronização automática. Manter acesso à fonte e não anunciar os cartões como avaliações mais recentes ou ao vivo.

As três capas do Instagram são referências estáticas de posts reais, não um feed e nem garantia dos três últimos posts. Os dois reels de 2025 aparecem nas primeiras posições da grade consultada; o terceiro é de outubro de 2026. Não assumir ordem cronológica pela posição visual do perfil.

Para atualizar automaticamente: escolher API/provedor autorizado, obter autorização da conta profissional Meta e da ficha Google verificada conforme caminho escolhido, adaptar respostas ao contrato de `api/social.js`, configurar URLs/tokens no servidor Vercel, ativar `socialEndpoint`, e validar ordenação/atribuições/expiração/falhas. Consulta na abertura da home; atraso e cache dependem do provedor. Detalhes em INTEGRACOES.md. Não há credenciais presentes ou autorização de contas concluída.

## Privacidade

Removida a seção genérica de atualizações. Textos longos sobre hospedagem/cookies substituídos por explicação curta da navegação. Direitos e canal de atendimento permanecem porque o visitante precisa saber como exercer seus direitos. Sem GA/pixel/embeds ativos, o frontend atual não cria cookies de análise/publicidade nem exibe consentimento opcional; isso não significa ausência de dados técnicos tratados pela hospedagem. Novos rastreadores ou widgets exigem nova revisão. A rotina já existente só inicia GA com consentimento se um ID válido for configurado.

## SEO e lançamento

Base técnica presente: HTML estático, headings, descrições próprias, canonical, dados estruturados, alt/dimensões das imagens, sitemap, robots, rotas e redirecionamentos conhecidos. Título da aba preserva a escolha expressa do cliente, igual nas páginas; títulos específicos por página podem ser avaliados futuramente.

Não declarar pronto para indexação: `site.config.json` ainda tem `indexable: false`, GA e Search Console vazios. A prévia deve continuar bloqueada. Antes da migração, confirmar domínio, liberar indexação só em produção, validar robots/canonical/sitemap servidos, configurar Search Console, mapear URLs antigas para redirects e medir PageSpeed/Core Web Vitals no domínio. Verificar o link de website da ficha Google: nesta consulta apontava para orgunida.com.br. Não foi alterada a ficha.

## Validação

`npm run check`, `npm run check:consent`, `node scripts/check-video.mjs` e build. Browser: autoplay real em Chromium com viewport 390px e 320px, pausa/retomada e ausência de sobreposição/overflow. Não equivale a teste físico em iOS/Safari. Fotos e política revisadas no navegador.

## Referências primárias

- https://webkit.org/blog/6784/new-video-policies-for-ios/
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
- https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares
- https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf
