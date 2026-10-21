# Vídeo, formulário e identidade — 21/10/2026

- Vídeo de fundo aprovado aplicado na inicial: loop de 6,25 s, sem áudio, 435 KB em 1280x720; variante móvel de 189 KB em 854x480. Reprodução automática, pausa manual, pausa fora da tela e imagem alternativa. O vídeo completo continua sendo aberto pelo visitante.
- Caixa de contato na inicial e em /contato/, com painel azul, canais reais e formulário branco. Nome, assunto e mensagem obrigatórios; telefone/e-mail opcionais. O formulário abre o WhatsApp com o texto pronto. O visitante confirma o envio no WhatsApp. Não há endpoint de e-mail, gravação em banco ou armazenamento local dos dados.
- A página de privacidade foi atualizada para esses recursos. O único evento de Analytics para o formulário usa nome e localização da página; não contém os campos pessoais.
- WhatsApp flutuante azul no canto inferior direito das cinco páginas. Ícone corrigido com o vetor do projeto Simple Icons, mantendo sua proporção original. Fonte: https://github.com/simple-icons/simple-icons/blob/develop/icons/whatsapp.svg .
- CNPJ fornecido pelo cliente no rodapé e no JSON-LD: 07.599.989/0001-40.
- Título da aba padronizado por solicitação do cliente: Unida Contabilidade e Soluções. Descrições e dados das páginas continuam específicos.
- Favicon vetorizado a partir do símbolo circular original fornecido, sem imagem raster embutida no SVG. Alternativas PNG em 32 px e Apple Touch em 180 px. A nova URL evita reutilizar o favicon antigo em cache.

Verificações: build e checagem do projeto; destinatário/assunto/codificação e rejeição de campos inválidos na composição da mensagem; validação HTML dos campos vazios e preenchidos no navegador; layout sem transbordamento nas larguras 320, 390 e 1440 px; vídeo reproduzindo sem som; formulário e CNPJ em Contato; console da sessão inspecionada sem erros ou avisos. Não foi enviada mensagem de teste para o WhatsApp.

A conferência móvel usa viewport do navegador; comportamento de autoplay ainda depende das permissões e das preferências de economia de dados/bateria de cada aparelho. A imagem alternativa permanece disponível. Indexação e Analytics continuam conforme a configuração anterior; integrações sociais ainda dependem das conexões documentadas.
