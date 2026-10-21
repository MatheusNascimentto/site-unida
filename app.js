(() => {
  'use strict';
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => [...scope.querySelectorAll(s)];
  const cfg = window.UNIDA_CONFIG || {};
  const stored = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  // The approved design keeps motion active on all devices. Old UI preferences
  // no longer disable it, and no recurring animation or scroll hijacking is used.
  document.documentElement.classList.remove('motion-reduced');
  document.documentElement.classList.add('motion-full');
  const mobileMotion = matchMedia('(max-width: 760px)');
  const animations = new Set();
  function animate(el, frames, options = {}) {
    if (!el?.animate) return null;
    const animation = el.animate(frames, { duration: 640, easing: 'cubic-bezier(.16,1,.3,1)', ...options });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    return animation;
  }
  async function entrance() {
    await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 650))]);
    const small = mobileMotion.matches;
    const photo = $('.hero-photo');
    animate(photo, [{ opacity: .1, transform: `scale(${small ? 1.09 : 1.065})` }, { opacity: 1, transform: 'scale(1)' }], { duration: small ? 1550 : 1900, fill: 'backwards' });
    animate($('.location-label'), [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, delay: 80, fill: 'backwards' });
    animate($('.history-pill'), [{ opacity: 0, transform: 'translateY(18px) scale(.94)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 800, delay: 150, fill: 'backwards' });
    $$('.hero-title .title-line > span').forEach((line, i) => animate(line, [{ transform: 'translateY(110%)', opacity: .15 }, { transform: 'translateY(0)', opacity: 1 }], { duration: small ? 1000 : 1100, delay: 230 + i * 120, fill: 'backwards' }));
    [$('.hero-description'), $('.hero-actions'), $('.panorama-caption'), $('.panorama-scroll')].forEach((el, i) => animate(el, [{ opacity: 0, transform: `translateY(${small ? 26 : 18}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: 800, delay: 540 + i * 100, fill: 'backwards' }));
    $$('.solution-thread path').forEach((line, i) => animate(line, [{ strokeDasharray: '1', strokeDashoffset: '1' }, { strokeDasharray: '1', strokeDashoffset: '0' }], { duration: 1100, delay: 250 + i * 100, fill: 'backwards' }));
    // A finite cue introduces scrolling without an endless decorative loop.
    animate($('.scroll-cue'), [{ transform: 'translateY(-5px)', opacity: .35 }, { transform: 'translateY(7px)', opacity: 1 }, { transform: 'translateY(0)', opacity: .7 }], { duration: 1600, delay: 900 });
  }
  entrance();
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        const small = mobileMotion.matches;
        const siblings = [...target.parentElement.children].filter(el => el.hasAttribute('data-reveal'));
        // Mobile cards enter individually; desktop neighbors form a short sequence.
        const delay = small ? 0 : Math.min(siblings.indexOf(target), 3) * 90;
        if (target.matches('figure,.video-cover')) {
          const img = $('img', target);
          animate(img, [{ transform: 'scale(1.075)' }, { transform: 'scale(1)' }], { duration: small ? 1100 : 1200, delay });
          animate(target, [{ opacity: .25, transform: `translateY(${small ? 38 : 24}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: 850, delay });
        } else {
          animate(target, [{ opacity: .12, transform: `translateY(${small ? 42 : 28}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: small ? 900 : 800, delay });
        }
        target.dataset.motionEntered = 'true';
      });
    }, { threshold: .12, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach(el => observer.observe(el));
  }
  let scrollPending = false, activeStory = -1;
  const story = $('.story-scroll'), steps = $$('.story-step'), words = ['Ouvir.', 'Explicar.', 'Acompanhar.'];
  const progressLine = $('.scroll-progress'), hero = $('.hero-panorama'), drift = $('.hero-photo-drift');
  const mobileStage = $('.story-mobile-stage');
  function onScroll() {
    scrollPending = false;
    const total = document.documentElement.scrollHeight - innerHeight;
    if (progressLine) progressLine.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
    if (hero && drift) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const distance = Math.max(0, -rect.top);
        const y = Math.min(mobileMotion.matches ? 48 : 100, distance * (mobileMotion.matches ? .1 : .16));
        drift.style.transform = `translate3d(0,${y}px,0)`;
      }
    }
    if (!story || !steps.length) return;
    const at = steps.reduce((best, step, i) => {
      const r = step.getBoundingClientRect();
      const distance = Math.abs(r.top + r.height / 2 - innerHeight * .58);
      return distance < best.distance ? { index: i, distance } : best;
    }, { index: 0, distance: Infinity }).index;
    if (at !== activeStory) {
      activeStory = at;
      steps.forEach((step, i) => step.classList.toggle('is-active', i === at));
      const word = $('.story-word');
      if (word) { word.textContent = words[at]; animate(word, [{ opacity: .15 }, { opacity: 1 }], { duration: 350 }); }
      if (mobileStage) {
        $('.story-mobile-count', mobileStage).textContent = `0${at + 1} / 03`;
        const label = $('.story-mobile-word', mobileStage); label.textContent = words[at];
        animate(label, [{ opacity: .1, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450 });
        $$('.story-mobile-track i', mobileStage).forEach((el, i) => el.classList.toggle('is-active', i <= at));
      }
    }
    steps.forEach(step => {
      const r = step.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight * .82 - r.top) / Math.max(1, r.height)));
      step.style.setProperty('--step-progress', progress);
    });
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

  // Analytics is optional. No GA request occurs before an informed opt-in.
  let analyticsReady = false;
  const validGA = typeof cfg.ga4MeasurementId === 'string' && /^G-[A-Z0-9]+$/.test(cfg.ga4MeasurementId);
  const consentKey = 'unida-cookie-choice-v1';
  function analyticsConsent() {
    try {
      const choice = JSON.parse(stored(consentKey) || 'null');
      return choice && choice.measurementId === cfg.ga4MeasurementId && choice.expiresAt > Date.now() && ['granted','denied'].includes(choice.analytics) ? choice.analytics : null;
    } catch { return null; }
  }
  function track(name, parameters = {}) {
    if (!analyticsReady || analyticsConsent() !== 'granted') return;
    window.gtag('event', name, { page_path: location.pathname, ...parameters });
  }
  function analyticsStart() {
    if (!validGA || analyticsReady || analyticsConsent() !== 'granted') return;
    window.dataLayer = window.dataLayer || [];
    window['ga-disable-' + cfg.ga4MeasurementId] = false;
    window.gtag = function () { window.dataLayer.push(arguments); };
    const pageLocation = new URL(location.origin + location.pathname);
    const query = new URLSearchParams(location.search);
    ['utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term'].forEach(key => { if (query.has(key)) pageLocation.searchParams.set(key, query.get(key).slice(0,120)); });
    window.gtag('js', new Date());
    window.gtag('config', cfg.ga4MeasurementId, { page_location: pageLocation.href, page_title: document.title, allow_google_signals: false, allow_ad_personalization_signals: false });
    if (!$('script[data-unida-analytics]')) {
      const script = document.createElement('script'); script.async = true; script.dataset.unidaAnalytics = 'true'; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4MeasurementId); document.head.append(script);
    }
    analyticsReady = true;
  }
  function analyticsStop() {
    if (!validGA) return;
    window['ga-disable-' + cfg.ga4MeasurementId] = true;
    analyticsReady = false;
    const parts = location.hostname.split('.');
    const domains = [null, ...parts.map((_,i) => parts.slice(i).join('.')).filter(domain => domain.includes('.') && !['vercel.app','com.br','net.br','org.br'].includes(domain))];
    document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]).filter(name => /^_ga(?:_|$)/.test(name)).forEach(name => {
      domains.forEach(domain => { document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax'; });
    });
  }
  function consentPrompt(force = false) {
    if (!validGA || (!force && analyticsConsent())) return;
    if ($('.consent-panel')) return;
    const trigger = document.activeElement;
    const aside = document.createElement('aside'); aside.className = 'consent-panel'; aside.setAttribute('aria-labelledby','consent-title');
    aside.innerHTML = '<h2 id="consent-title">Sua escolha de cookies</h2><p>Podemos usar o Google Analytics para entender as páginas visitadas e os cliques nos contatos. A análise é opcional e começa apenas se você permitir. <a href="/privacidade/#cookies">Saiba mais</a>.</p><div class="consent-actions"><button type="button" data-consent="denied">Recusar análise</button><button type="button" data-consent="granted">Permitir análise</button></div>';
    document.body.append(aside);
    $$('[data-consent]',aside).forEach(button => button.addEventListener('click',() => {
      const choice = button.dataset.consent;
      save(consentKey,JSON.stringify({analytics:choice,measurementId:cfg.ga4MeasurementId,expiresAt:Date.now()+180*24*60*60*1000}));
      if (choice === 'granted') analyticsStart(); else analyticsStop();
      aside.remove(); if (force) trigger?.focus();
    }));
    if (force) $('[data-consent="denied"]',aside).focus();
  }
  analyticsStart(); consentPrompt();
  $$('[data-consent-reset]').forEach(button => { button.hidden = !validGA; button.addEventListener('click',() => consentPrompt(true)); });
  const settings = $('[data-analytics-settings]'); if (settings) settings.hidden = !validGA;
  const info = $('[data-analytics-info]');
  if (info) info.textContent = validGA ? 'A análise de navegação é opcional. Você pode permitir ou recusar o uso do Google Analytics sem perder o acesso ao site.' : 'Não usamos cookies de publicidade nem análise de navegação. Nenhuma autorização de cookies opcionais é solicitada nesta configuração.';

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
        if (status) { status.hidden = false; status.textContent = source === 'instagram' ? 'Publicações mais recentes recebidas pela integração.' : 'Comentários com texto, ordenados pela data de publicação. Fonte: Google Maps.'; }
        if (source === 'reviews' && Number.isFinite(data.averageRating) && Number.isInteger(data.totalReviewCount)) {
          const score = $('.review-score'); if (score) { $('strong', score).textContent = data.averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); score.lastElementChild.textContent = `${data.totalReviewCount} avaliações`; const stars = $('.stars', score); stars.textContent = '★'.repeat(Math.round(data.averageRating)); stars.setAttribute('aria-label', `${data.averageRating} de 5 estrelas`); }
        }
      }
    } catch { /* A failed integration must not block navigation or masquerade as live data. */ }
  }
  document.addEventListener('unida:contact-form', () => track('contact_form_whatsapp', { location: document.body.dataset.page }));
  socialData('instagram'); socialData('reviews');
})();

(() => {
 const video=document.querySelector('#hero-background-video');
 const button=document.querySelector('.hero-video-toggle');
 const photo=document.querySelector('.hero-photo');
 const hero=document.querySelector('.hero-panorama');
 if(!video||!button||!hero)return;
 let userPaused=false,inView=true,pendingPlay=null;
 video.defaultMuted=true;
 video.muted=true;
 video.playsInline=true;
 video.autoplay=true;
 video.setAttribute('muted','');
 video.setAttribute('playsinline','');
 video.setAttribute('webkit-playsinline','');
 const source=matchMedia('(max-width: 760px)').matches?'/assets/hero-escritorio-mobile.mp4':'/assets/hero-escritorio.mp4';
 if(video.getAttribute('src')!==source){video.src=source;video.load();}
 const label=()=>{
  const paused=video.paused;
  button.querySelector('[data-video-label]').textContent=paused?'Reproduzir vídeo':'Pausar vídeo';
  button.querySelector('[data-video-glyph]').setAttribute('d',paused?'M8 5v14l11-7z':'M7 5h3v14H7zM14 5h3v14h-3z');
  button.setAttribute('aria-label',paused?'Reproduzir vídeo de fundo':'Pausar vídeo de fundo');
  button.title=paused?'Reproduzir vídeo':'Pausar vídeo';
 };
 const play=()=>{
  if(userPaused||!inView||document.hidden||pendingPlay)return;
  // Muted inline playback is requested on entry and again when media is ready.
  // Browser power/data restrictions may still require the first interaction.
  video.muted=true;
  pendingPlay=video.play();
  pendingPlay?.catch(()=>{}).finally(()=>{pendingPlay=null;label();});
 };
 video.addEventListener('playing',()=>{photo.classList.add('video-ready');label();});
 video.addEventListener('pause',label);
 video.addEventListener('error',()=>{photo.classList.remove('video-ready');label();});
 ['loadeddata','canplay'].forEach(event=>video.addEventListener(event,play));
 button.addEventListener('click',()=>{if(video.paused){userPaused=false;play();}else{userPaused=true;video.pause();}});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
  inView=entries[0].isIntersecting;
  if(!inView)video.pause();else play();
 },{threshold:0}).observe(hero);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else play();});
 // A first touch anywhere retries only browser-blocked playback, never a user pause.
 const retry=event=>{if(!event.target.closest('.hero-video-toggle')&&video.paused)play();};
 document.addEventListener('pointerdown',retry,{passive:true});
 document.addEventListener('touchend',retry,{passive:true});
 document.addEventListener('click',retry,{passive:true});
 addEventListener('pageshow',play);
 label();play();
})();
