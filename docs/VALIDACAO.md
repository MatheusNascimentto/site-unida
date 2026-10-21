# Validação da implementação — 20/10/2026

Código entregue em HTML, CSS e JavaScript, sem dependências npm. Esta verificação foi local; não houve deploy, push Git ou alteração do site antigo.

## Conferido

- `node scripts/check.mjs`: cinco páginas com H1 único, títulos e descrições distintos, canonical absoluto, JSON-LD válido, imagens com dimensões/alt, links internos presentes, IDs sem duplicação e sintaxe JavaScript válida.
- `node scripts/build.mjs`: saída estática gerada em dist/, com indexação e Analytics desativados na configuração atual.
- Build em ambiente isolado: protótipo em produção continua noindex; Preview continua noindex mesmo com indexable=true; produção com indexable=true libera indexação. A página 404 permanece noindex. Origem canonical, token de verificação, aviso de protótipo e ID GA4 respondem às configurações.
- Rotas /, /solucoes/, /a-unida/, /contato/ e /privacidade/: HTTP 200. Rota inexistente: HTTP 404. Vídeo: HTTP 206 para requisição parcial de 1024 bytes.
- Navegador desktop: Poppins carregada, navegação entre páginas, seletor de soluções por clique e seta do teclado, acordeão de dúvidas, assunto no link de WhatsApp.
- Vídeo institucional: abertura em diálogo, duração de 1min45s reconhecida, reprodução iniciada por ação do usuário e pausa ao fechar.
- Celular: menu abre e navega; contato sem rolagem horizontal em larguras de 390 e 320 px.
- Motion: preferência inicial de movimento reduzido respeitada; opção explícita para ativar movimentos funciona e persiste; traço e palavra da narrativa mudam durante a rolagem (Ouvir → Explicar).
- Privacidade: nenhum script do Google Analytics carregado com a configuração atual. Nenhum erro ou aviso de console retornado na sessão local inspecionada.
- Adaptador social: HTTP 405 para método inválido, 400 para fonte inválida e 503 explícito quando não configurado.

## Dependências para lançamento

Revisar textos de serviços, contatos, imagens, logo e conteúdo do vídeo com a Unida. Definir fotos novas e legendas do vídeo. O MP4 e a logo raster foram preservados dos materiais existentes.

Instagram e avaliações ainda usam prévias identificadas. O adaptador de feed está preparado, mas a integração real exige escolher/configurar um provedor autorizado. Não foi feita conexão OAuth, scraping nem teste com contas reais.

Definir domínio principal, remover aviso de protótipo, habilitar indexação na produção aprovada, cadastrar IDs reais de GA4/Search Console e validar o consentimento e os eventos com a propriedade de teste. Search Console por DNS depende do painel do domínio.

Após publicar: conferir redirecionamentos do domínio e das URLs antigas, Lighthouse/PageSpeed em dispositivos reais, Rich Results Test, sitemap no Search Console e recebimento de eventos no GA4. Nenhuma pontuação de desempenho ou ranking de busca está sendo afirmada nesta entrega.
