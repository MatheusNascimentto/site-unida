# Integrações automáticas — estado atual

As seções estão implementadas no frontend, com conteúdo de prévia explicitamente identificado. A sincronização automática **ainda não está conectada**. Não existe token de Instagram, OAuth de Google ou serviço de widget contratado neste projeto.

O endpoint `/api/social?source=instagram` ou `source=reviews` é uma função Vercel. Sem configuração retorna HTTP 503 com `status: unconfigured`, e o layout mantém a prévia identificada. O servidor local reproduz esse estado. Erros de serviço não são apresentados como atualizações bem-sucedidas.

## Conectar um provedor autorizado

Configurar `UNIDA_INSTAGRAM_FEED_URL` e/ou `UNIDA_REVIEWS_FEED_URL` no servidor Vercel, apontando para um provedor ou adaptador autorizado que normalize os dados nos formatos abaixo. Se o provedor exigir Bearer, usar o respectivo `UNIDA_INSTAGRAM_FEED_TOKEN`/`UNIDA_REVIEWS_FEED_TOKEN`. As variáveis não vão para o navegador. Não são os tokens brutos da Meta/Google: o provedor/adaptador precisa transformar as respostas para este contrato.

Escolher o serviço com a Unida e validar acesso, custo, regras de armazenamento, atribuições e renovação da autorização. Uma resposta direta da Graph API ou da Business Profile API NÃO corresponde a este contrato sem um adaptador. Não usar scraping ou hotlinks fixos de mídia expirada como solução final.

Depois de configurar e testar o provedor, definir `socialEndpoint` como `/api/social` em `site.config.json` e gerar novo build. O valor inicial vazio mantém a prévia sem consultas a uma integração ainda inexistente. Para testes locais, o servidor de desenvolvimento retorna o estado não configurado, sem carregar credenciais.

### Instagram

```json
{"status":"success","items":[{"permalink":"https://www.instagram.com/p/ID_REAL/","thumbnailUrl":"https://scontent.cdninstagram.com/ARQUIVO_REAL","caption":"Legenda real","publishedAt":"2026-10-20T12:00:00Z"}]}
```

Retornar posts recentes por data de publicação, com dados reais. O endpoint normaliza, ordena e limita a três. Fixados não ganham prioridade pela posição no perfil. O frontend aceita mídia HTTPS dos domínios Instagram/CDN da Meta e links para Instagram; se o provedor hospedar capas em outro domínio legítimo, revisar a allowlist explicitamente. Reels são representados por capa e link ao original, sem baixar e hospedar cópias.

### Google

```json
{"status":"success","averageRating":5,"totalReviewCount":4,"items":[{"authorName":"Autor real","rating":5,"text":"Comentário real","sourceUrl":"https://share.google/LINK_REAL","createdAt":"2026-06-20T12:00:00Z"}]}
```

O adaptador deverá preservar dados e atribuições exigidos pelo serviço escolhido, incluindo foto/perfil do autor quando o provedor exigir esses elementos. O componente atual é a base visual; revisar atribuições antes de ativar um provedor específico. Não presumir conformidade de qualquer API apenas por mostrar um nome.

Ordenar por criação, não por última edição. Comentários sem texto são excluídos da lista e isso é indicado na interface. Média/total representam a ficha inteira, não apenas os comentários exibidos. O provedor deve enviar pelo menos as avaliações recentes necessárias antes da limitação; o endpoint processa até 50 itens. Não adicionar `aggregateRating` da própria empresa ao schema para tentar obter estrelas na busca.

## Atualização e validação

O frontend consulta uma vez ao abrir a home. A frequência de atualização na origem dependerá do provedor. Não existe promessa de sincronização instantânea, polling contínuo ou automação agendada criada. Mostrar os dados obtidos, sem animação que simule novos comentários.

Testar autorização, resposta verdadeira, ordenação, remoção de post, expiração de mídia, limites, atribuições e falhas antes de declarar a integração ativa. Confirmar se a política do provedor permite a prévia estática existente; substituí-la por dados reais ou ocultá-la no lançamento final.
