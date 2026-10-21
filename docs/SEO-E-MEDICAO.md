# Base de SEO e medição

## Implementado

- Conteúdo completo e links em HTML, sem depender de renderização cliente.
- Poppins, layout responsivo, um H1 por página, títulos e descrições únicos.
- Canonical absoluto, Open Graph, Twitter Card e idioma pt-BR.
- Dados estruturados AccountingService, WebSite, WebPage/ContactPage/AboutPage e BreadcrumbList. Sem estrelas de avaliações próprias, números inventados ou horários não confirmados.
- Sitemap das páginas institucionais; robots e meta robots controlados por configuração e ambiente.
- Breadcrumbs visíveis, navegação interna e página 404. URLs antigas /fale-conosco/ e /faq/ têm redirecionamentos definidos. O restante das URLs antigas exige inventário antes da migração; não redirecionar todos os artigos para a home indiscriminadamente.
- Dimensões explícitas nas imagens, lazy loading abaixo da dobra, vídeo sem preload automático. JS sem bibliotecas e sem dependência npm.
- Rotas Vercel estáticas e adaptador social isolado do navegador.

## Prévia e produção

Default: indexação desativada. A liberação exige `indexable: true` e ambiente de produção. Não deixar essa opção desativada por engano no lançamento. Confirmar o domínio principal antes de enviar o sitemap ao Search Console. Um sitemap preparado não equivale a envio ou indexação confirmada.

## Google Analytics 4

Nenhum identificador foi inventado e nenhum script do Analytics carrega sem consentimento. Depois de configurar um ID real na produção, é exibida escolha de medição. Eventos customizados:

| Evento | Quando |
| --- | --- |
| contact_whatsapp | Clique no botão/link WhatsApp |
| contact_phone | Clique no telefone |
| contact_email | Clique no e-mail |
| client_portal_click | Acesso ao Onvio |
| directions_click | Clique na rota |
| select_solution | Escolha de necessidade |
| select_contact_topic | Escolha do assunto |
| video_open | Abertura do vídeo |
| instagram_click | Clique no perfil ou post |

Os eventos medem cliques, não comprovam atendimento, conversa enviada ou venda. Não emitir generate_lead como se o clique confirmasse um contato recebido. Eventos não incluem mensagens, documentos ou os dados pessoais do visitante. O endereço de página enviado só preserva parâmetros de campanha conhecidos (UTM). Revisar com o responsável a configuração da propriedade e suas opções de coleta antes de ativar.

Validar com GA4 DebugView/Realtime após criar propriedade e publicar. Search Console é uma conexão separada, sem necessidade de instalar rastreador para verificar o site.

## Pendências antes da migração

1. Confirmar domínio, DNS, redirecionamento entre domínios e www.
2. Validar portfólio, contatos, data/história da empresa e registros profissionais que forem divulgados.
3. Refinar logo oficial, fotografias, capa/legendas do vídeo e política de privacidade com o responsável.
4. Conectar e testar os serviços sociais, incluindo atribuições e critérios de ordenação.
5. Revisar conteúdo das páginas, dados estruturados com Rich Results Test, performance móvel no domínio (Lighthouse/PageSpeed) e navegação por teclado.
6. Criar/verificar a propriedade Search Console e enviar sitemap; criar GA4 e configurar eventos relevantes. Revisar uso de consentimento/cookies no contexto final do site.
7. Liberar indexação na produção. Conferir resposta HTTP, canonical e robots efetivamente servidos, além das páginas antigas que já recebiam tráfego.

## Referências

- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/analytics/devguides/collection/ga4/events
- https://vercel.com/docs/project-configuration

Não há garantia de ranking, aprovação de resultado enriquecido ou pontuação de Core Web Vitals sem medição no ambiente final. As checagens locais não substituem essa validação.
