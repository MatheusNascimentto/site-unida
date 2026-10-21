(() => {
  'use strict';
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
  const cfg = window.UNIDA_CONFIG || {};
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const stored = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const reduced = () => document.documentElement.classList.contains('motion-reduced');
  const animations = new Set();
  function animate(el, frames, options = {}) {
    if (!el || reduced() || !el.animate) return null;
    const animation = el.animate(frames, { duration: 640, easing: 'cubic-bezier(.16,1,.3,1)', ...options });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    return animation;
  }
  function resetMotion() {
    animations.forEach(a => a.cancel()); animations.clear();
    $$('.brand-arc path,.solution-thread path,.story-line').forEach(p => { p.style.strokeDashoffset = ''; });
    const progress = $('.scroll-progress'); if (progress) progress.style.transform = 'scaleX(0)';
    $$('.story-step').forEach(s => s.classList.add('is-active'));
  }
  const motionButton = $('.motion-toggle');
  function applyMotionSetting() {
    const preference = stored('unida-reduce-motion');
    const manual = preference === 'true';
    const full = preference === 'false';
    const isReduced = manual || (!full && mq.matches);
    document.documentElement.classList.toggle('motion-reduced', isReduced);
    document.documentElement.classList.toggle('motion-full', full);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed', String(isReduced));
      motionButton.textContent = isReduced ? 'Ativar movimentos neste site' : 'Reduzir movimentos';
      motionButton.title = !preference && mq.matches ? 'Movimento reduzido conforme seu sistema. Você pode ativar os efeitos apenas neste site.' : '';
    }
    if (reduced()) resetMotion();
    else queueMicrotask(() => { activeStory = -1; onScroll(); });
  }
  applyMotionSetting();
  mq.addEventListener('change', applyMotionSetting);
  motionButton?.addEventListener('click', () => { save('unida-reduce-motion', String(!reduced())); applyMotionSetting(); });

  // A single entrance sequence. Base content is visible even if animation fails.
  async function entrance() {
    if (reduced()) return;
    await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 800))]);
    if (reduced()) return;
    $$('.hero-title .title-line > span').forEach((line, i) => animate(line, [{ transform: 'translateY(112%)', opacity: .1 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 820, delay: i * 85, fill: 'backwards' }));
    const facade = $('.hero .facade-frame');
    animate(facade, [{ clipPath: 'inset(0 0 0 100% round 18px)', opacity: .35 }, { clipPath: 'inset(0 0 0 0 round 18px)', opacity: 1 }], { duration: 1000, delay: 140, fill: 'backwards' });
    $$('.hero .brand-arc path,.contact-intro .brand-arc path,.solution-thread path').forEach((line, i) => animate(line, [{ strokeDasharray: '1', strokeDashoffset: '1' }, { strokeDasharray: '1', strokeDashoffset: '0' }], { duration: 1100, delay: 240 + i * 100, fill: 'backwards' }));
    animate($('.hero-description'), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, delay: 250, fill: 'backwards' });
  }
  entrance();
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (target.matches('figure,.video-cover')) {
          animate(target, [{ clipPath: 'inset(12% 0 0 0 round 18px)', opacity: .45 }, { clipPath: 'inset(0 0 0 0 round 18px)', opacity: 1 }], { duration: 700 });
        } else animate(target, [{ opacity: .25, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550 });
      });
    }, { threshold: .12 });
    reveals.forEach(el => observer.observe(el));
  }
  let scrollPending = false, activeStory = -1;
  const story = $('.story-scroll'), steps = $$('.story-step'), words = ['Ouvir.', 'Explicar.', 'Acompanhar.'];
  const progressLine = $('.scroll-progress');
  function onScroll() {
    scrollPending = false;
    if (reduced()) return;
    const total = document.documentElement.scrollHeight - innerHeight;
    if (progressLine) progressLine.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
    if (!story || !steps.length) return;
    const at = steps.reduce((best, step, i) => Math.abs(step.getBoundingClientRect().top + step.offsetHeight / 2 - innerHeight * .55) < best.distance ? { index: i, distance: Math.abs(step.getBoundingClientRect().top + step.offsetHeight / 2 - innerHeight * .55) } : best, { index: 0, distance: Infinity }).index;
    if (at !== activeStory) {
      activeStory = at;
      steps.forEach((step, i) => step.classList.toggle('is-active', i === at));
      const word = $('.story-word'); if (word) { word.textContent = words[at]; animate(word, [{ opacity: .1 }, { opacity: 1 }], { duration: 300 }); }
    }
    const rect = story.getBoundingClientRect();
    const value = Math.max(0, Math.min(1, (innerHeight * .8 - rect.top) / Math.max(1, rect.height - innerHeight * .2)));
    const path = $('.story-line'); if (path) { path.style.strokeDasharray = '1'; path.style.strokeDashoffset = String(1 - value); }
  }
  addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll, { passive: true }); onScroll();

  const menuButton = $('.menu-toggle'), menu = $('.mobile-menu');
  function closeMenu(returnFocus = true) {
    if (!menu || menu.hidden) return;
    menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu');
    if (returnFocus) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const open = menu.hidden;
    if (!open) { closeMenu(); return; }
    menu.hidden = false; menuButton.setAttribute('aria-expanded', 'true'); menuButton.setAttribute('aria-label', 'Fechar menu');
    animate(menu, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360 });
    $('a', menu)?.focus();
  });
  document.addEventListener('keydown', event => {
    if (!menu || menu.hidden) return;
    if (event.key === 'Escape') { closeMenu(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [menuButton, ...$$('a', menu)];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', event => { if (menu && !menu.hidden && !event.target.closest('.site-header')) closeMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 760) closeMenu(false); }, { passive: true });

  function bindDialog(dialog, openSelector, closeSelector) {
    if (!dialog) return;
    let trigger;
    $$(openSelector).forEach(button => button.addEventListener('click', () => {
      if (dialog.open) return;
      trigger = button; closeMenu(false); dialog.showModal(); document.body.classList.add('modal-open');
      animate(dialog, [{ opacity: .2, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240 });
      dialog.dispatchEvent(new Event('unida:open'));
    }));
    $$(closeSelector, dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); trigger?.focus(); });
  }
  bindDialog($('.video-dialog'), '[data-video-open]', '[data-video-close]');
  bindDialog($('.preview-dialog'), '[data-preview-open]', '[data-preview-close]');
  const videoDialog = $('.video-dialog'), video = $('video', videoDialog || document);
  videoDialog?.addEventListener('unida:open', () => { video?.play().catch(() => {}); track('video_open', { location: document.body.dataset.page }); });
  videoDialog?.addEventListener('close', () => video?.pause());

  const solutionData = {
    abrir: { title: 'Da ideia aos próximos passos.', text: 'Conte o que você quer construir. Vamos orientar o começo, considerando a atividade e a realidade da sua empresa.', button: 'Quero abrir minha empresa', subject: 'Olá! Quero conversar sobre a abertura da minha empresa.' },
    trocar: { title: 'Um novo começo para a contabilidade.', text: 'Quer mudar de contador? Converse sobre o seu momento e entenda como organizar a transição.', button: 'Quero trocar de contador', subject: 'Olá! Quero conversar sobre a troca de contador.' },
    cuidar: { title: 'Mais clareza no dia a dia.', text: 'Impostos, rotina contábil ou folha da equipe: conte o que sua empresa precisa resolver agora.', button: 'Quero cuidar da minha empresa', subject: 'Olá! Já tenho uma empresa e gostaria de conhecer o atendimento da Unida.' }
  };
  const toWhatsApp = text => 'https://wa.me/5515997996473?text=' + encodeURIComponent(text);
  const tabs = $$('[data-solution]'), panel = $('#solution-panel');
  let panelAnimation;
  function selectSolution(key, updateURL = true) {
    const data = solutionData[key]; if (!data || !panel) return;
    panelAnimation?.cancel();
    tabs.forEach(tab => { const selected = tab.dataset.solution === key; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'tab-' + key);
    $('[data-solution-title]').textContent = data.title;
    $('[data-solution-text]').textContent = data.text;
    const cta = $('[data-solution-cta]'); $('span', cta).textContent = data.button; cta.href = toWhatsApp(data.subject);
    const symbol = $('.panel-symbol'); const tabIcon = $(`#tab-${key} .icon-disc svg`); if (symbol && tabIcon) symbol.replaceChildren(tabIcon.cloneNode(true));
    panelAnimation = animate(panel, [{ opacity: .25, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240 });
    const line = $('.connection path'); animate(line, [{ strokeDasharray: '1', strokeDashoffset: '1' }, { strokeDasharray: '1', strokeDashoffset: '0' }], { duration: 360 });
    if (updateURL) { const url = new URL(location.href); url.searchParams.set('momento', key); history.replaceState(null, '', url); track('select_solution', { solution: key }); }
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectSolution(tab.dataset.solution));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); tabs[next].focus(); selectSolution(tabs[next].dataset.solution); }
    });
  });
  if (panel) selectSolution(new URLSearchParams(location.search).get('momento') || 'abrir', false);
  const topics = $$('[data-topic]');
  topics.forEach(button => button.addEventListener('click', () => {
    topics.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const key = button.dataset.topic;
    const text = solutionData[key]?.subject || 'Olá! Gostaria de conversar com a Unida sobre minha empresa.';
    const cta = $('[data-contact-cta]'); if (cta) cta.href = toWhatsApp(text);
    track('select_contact_topic', { topic: key });
  }));
  $$('details').forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) animate($('.service-answer', detail) || $('p', detail), [{ opacity: .1, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240 });
  }));

  // GA4 is off until a real ID and explicit visitor consent are configured.
  let analyticsReady = false;
  const validGA = typeof cfg.ga4MeasurementId === 'string' && /^G-[A-Z0-9]+$/.test(cfg.ga4MeasurementId);
  function track(name, parameters = {}) {
    if (!analyticsReady || stored('unida-analytics-consent') !== 'granted') return;
    window.gtag('event', name, { page_path: location.pathname, ...parameters });
  }
  function analyticsStart() {
    if (!validGA || analyticsReady || stored('unida-analytics-consent') !== 'granted') return;
    window.dataLayer = window.dataLayer || [];
    window['ga-disable-' + cfg.ga4MeasurementId] = false;
    window.gtag = function () { window.dataLayer.push(arguments); };
    const pageLocation = new URL(location.origin + location.pathname);
    const query = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content', 'utm_term'].forEach(key => { if (query.has(key)) pageLocation.searchParams.set(key, query.get(key).slice(0, 120)); });
    window.gtag('js', new Date());
    window.gtag('config', cfg.ga4MeasurementId, { page_location: pageLocation.href, page_title: document.title, allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script'); script.async = true; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4MeasurementId); document.head.append(script);
    analyticsReady = true;
  }
  function consentPrompt(force = false) {
    if (!validGA || (!force && stored('unida-analytics-consent'))) return;
    if ($('.consent-panel')) return;
    const aside = document.createElement('aside'); aside.className = 'consent-panel'; aside.setAttribute('aria-labelledby', 'consent-title');
    aside.innerHTML = '<h2 id="consent-title">Podemos medir a navegação?</h2><p>Com sua permissão, usamos o Google Analytics para entender quais páginas e contatos ajudam mais. A navegação funciona sem ele. <a href="/privacidade/">Saiba mais</a>.</p><div class="consent-actions"><button type="button" data-consent="denied">Continuar sem medição</button><button type="button" data-consent="granted">Permitir medição</button></div>';
    document.body.append(aside);
    $$('[data-consent]', aside).forEach(button => button.addEventListener('click', () => { save('unida-analytics-consent', button.dataset.consent); if (button.dataset.consent === 'granted') analyticsStart(); else if (analyticsReady) { window['ga-disable-' + cfg.ga4MeasurementId] = true; analyticsReady = false; } aside.remove(); }));
  }
  analyticsStart(); consentPrompt();
  $$('[data-consent-reset]').forEach(button => button.addEventListener('click', () => consentPrompt(true)));
  if (!validGA) {
    $$('[data-consent-reset]').forEach(button => { button.disabled = true; button.textContent = 'Medição não ativada nesta versão'; });
    const info = $('[data-analytics-info]'); if (info) info.textContent = 'Nenhum identificador do Google Analytics foi configurado. O rastreador não é carregado.';
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]'); if (!link) return;
    const href = link.getAttribute('href') || '';
    let name;
    if (href.startsWith('https://wa.me/')) name = 'contact_whatsapp';
    else if (href.startsWith('tel:')) name = 'contact_phone';
    else if (href.startsWith('mailto:')) name = 'contact_email';
    else if (href.includes('onvio.com.br')) name = 'client_portal_click';
    else if (href.includes('maps.app.goo.gl')) name = 'directions_click';
    else if (href.includes('instagram.com/')) name = 'instagram_click';
    if (name) track(name, { location: document.body.dataset.page });
  });

  // Same-origin server adapter, deliberately no credentials or provider secrets here.
  // Returns explicit unconfigured state until the company authorizes an integration.
  async function socialData(source) {
    const root = source === 'instagram' ? $('[data-instagram-grid]') : $('[data-review-grid]');
    if (!root || !cfg.socialEndpoint) return;
    try {
      const endpoint = new URL(cfg.socialEndpoint, location.origin);
      if (endpoint.origin !== location.origin) return;
      endpoint.searchParams.set('source', source);
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(7000), credentials: 'same-origin' });
      if (!response.ok) return;
      const data = await response.json();
      if (data.status !== 'success' || !Array.isArray(data.items) || !data.items.length) return;
      const https = (value, hosts) => { try { const url = new URL(value); return url.protocol === 'https:' && hosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host)) ? url.href : null; } catch { return null; } };
      const safe = text => String(text || '').slice(0, 500);
      const cards = [];
      if (source === 'instagram') {
        const items = data.items.filter(item => Number.isFinite(Date.parse(item.publishedAt))).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3);
        for (const item of items) {
          const href = https(item.permalink, ['instagram.com']);
          const image = https(item.thumbnailUrl, ['cdninstagram.com', 'fbcdn.net', 'instagram.com']);
          if (!href || !image) continue;
          const card = document.createElement('a'); card.className = 'social-card'; card.href = href; card.target = '_blank'; card.rel = 'noopener noreferrer';
          const wrap = document.createElement('div'); wrap.className = 'social-image'; const img = document.createElement('img'); img.src = image; img.alt = safe(item.caption) || 'Publicação da Unida no Instagram'; img.loading = 'lazy'; img.width = 360; img.height = 480; wrap.append(img);
          const caption = document.createElement('span'); caption.textContent = safe(item.caption).slice(0, 90) || 'Ver publicação no Instagram'; card.append(wrap, caption); cards.push(card);
        }
      } else {
        const items = data.items.filter(item => item.text && Number.isFinite(Date.parse(item.createdAt))).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3);
        for (const item of items) {
          const href = https(item.sourceUrl, ['google.com', 'share.google', 'maps.app.goo.gl']); if (!href) continue;
          const card = document.createElement('article'); card.className = 'review';
          const rating = Math.max(1, Math.min(5, Math.round(Number(item.rating) || 1)));
          const stars = document.createElement('span'); stars.className = 'stars'; stars.textContent = '★'.repeat(rating); stars.setAttribute('aria-label', `${rating} de 5 estrelas`);
          const quote = document.createElement('blockquote'); quote.textContent = safe(item.text);
          const author = document.createElement('strong'); author.textContent = safe(item.authorName);
          const link = document.createElement('a'); link.className = 'text-link'; link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Conferir no Google';
          card.append(stars, quote, author, document.createElement('br'), link); cards.push(card);
        }
      }
      if (cards.length) {
        root.replaceChildren(...cards);
        const status = $(source === 'instagram' ? '[data-instagram-status]' : '[data-review-status]');
        if (status) status.textContent = source === 'instagram' ? 'Publicações mais recentes recebidas pela integração.' : 'Comentários com texto, ordenados pela data de publicação. Fonte: Google Maps.';
        if (source === 'reviews' && Number.isFinite(data.averageRating) && Number.isInteger(data.totalReviewCount)) {
          const score = $('.review-score'); if (score) { $('strong', score).textContent = data.averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); score.lastElementChild.textContent = `${data.totalReviewCount} avaliações`; const stars = $('.stars', score); stars.textContent = '★'.repeat(Math.round(data.averageRating)); stars.setAttribute('aria-label', `${data.averageRating} de 5 estrelas`); }
        }
      }
    } catch { /* A failed integration must not block navigation or masquerade as live data. */ }
  }
  socialData('instagram'); socialData('reviews');
})();
