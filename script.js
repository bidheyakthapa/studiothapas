/* Studio Thapas — site script.
   All editable content lives in /content/*.json (managed in the admin at /admin/).
   Pages: home (/), service (/service/?s=<id>), gallery (/gallery/), 404. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const PAGE = document.body.dataset.page;
  const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Thumbnails via Cloudflare Image Transformations. Turn on only after the site is served
  // by Cloudflare and Images → Transformations is enabled for studiothapas.com.np.
  const CLOUDFLARE_IMAGES = false;
  const CAN_TRANSFORM = CLOUDFLARE_IMAGES && /(^|\.)studiothapas\.com\.np$/.test(location.hostname);
  const HOME_PREVIEW = 12;
  const SERVICE_PER_PAGE = 12;
  const GALLERY_PER_PAGE = 24;

  const DEFAULTS = {
    settings: {
      phone: '+977 9841419161',
      whatsapp: '9779841419161',
      address: 'Kageshwori Manohara, Kathmandu, Nepal',
      hours: 'Every day · 8:00 AM – 8:00 PM',
      socials: [],
    },
    hero: {
      eyebrow: 'Kathmandu, Nepal',
      title: 'Every moment',
      title_emphasis: 'deserves to be remembered.',
      text: '',
      images: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=90'],
    },
  };
  const WHATSAPP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const list = value => (Array.isArray(value) ? value : []);
  const pad = n => String(n).padStart(2, '0');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = url => (/^(https?:|mailto:|tel:|\/|#)/i.test(String(url || '').trim()) ? String(url).trim() : '#');
  const paragraphs = text => String(text || '').trim().split(/\n\s*\n/).filter(Boolean)
    .map(p => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('');
  const serviceUrl = id => `/service/?s=${encodeURIComponent(id)}`;
  const whatsappUrl = (number, text) => `https://wa.me/${String(number || '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  const external = 'target="_blank" rel="noopener noreferrer"';
  const scrollBehavior = REDUCED_MOTION ? 'auto' : 'smooth';

  /* ---------- Images ---------- */
  // Returns a resized URL when the image host supports it, otherwise the original.
  function sized(src, width) {
    if (!src) return '';
    let url;
    try { url = new URL(src, location.href); } catch { return src; }
    if (url.hostname === 'images.unsplash.com') {
      url.searchParams.set('w', String(width));
      url.searchParams.set('auto', 'format');
      return url.href;
    }
    if (CAN_TRANSFORM && (url.origin === location.origin || /(^|\.)studiothapas\.com\.np$/.test(url.hostname))) {
      const source = url.origin === location.origin ? url.pathname.slice(1) : url.href;
      return `/cdn-cgi/image/width=${width},quality=85,format=auto,fit=scale-down/${source}`;
    }
    return src;
  }
  function imgAttrs(src, { widths = [480, 800, 1200], sizes = '100vw', lazy = true, alt = '' } = {}) {
    const resizable = sized(src, widths[0]) !== src;
    const main = resizable ? sized(src, widths[Math.min(1, widths.length - 1)]) : src;
    let attrs = `src="${esc(main)}" alt="${esc(alt)}" data-fallback="${esc(src)}" decoding="async"`;
    if (resizable) attrs += ` srcset="${esc(widths.map(w => `${sized(src, w)} ${w}w`).join(', '))}" sizes="${esc(sizes)}"`;
    if (lazy) attrs += ' loading="lazy"';
    return attrs;
  }
  // If a resized version fails (e.g. monthly resize limit reached), fall back to the original file.
  document.addEventListener('error', e => {
    const img = e.target;
    if (img.tagName !== 'IMG' || !img.dataset.fallback || img.dataset.failed) return;
    img.dataset.failed = '1';
    img.removeAttribute('srcset');
    img.src = img.dataset.fallback;
  }, true);
  document.addEventListener('load', e => {
    if (e.target.classList?.contains('gallery-photo')) e.target.classList.add('loaded');
  }, true);

  /* ---------- Content ---------- */
  const requests = {};
  const getJSON = name => (requests[name] ||= fetch(`/content/${name}.json`, { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .catch(err => { console.warn(`Could not load content/${name}.json`, err); return null; }));
  const loadAll = async names => Object.fromEntries(await Promise.all(names.map(async n => [n, await getJSON(n)])));

  const getSettings = raw => ({ ...DEFAULTS.settings, ...(raw || {}) });
  const getServices = raw => list(raw).filter(s => s && s.id && s.title);
  const sortAlbums = raw => list(raw)
    .map((album, i) => ({ ...album, photos: list(album?.photos).filter(Boolean), order: i }))
    .filter(album => album.photos.length)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || a.order - b.order);
  const toPhotos = (albums, servicesById) => albums.flatMap(album => album.photos.map(src => ({
    src, title: album.title || '', service: servicesById.get(album.service) || null,
  })));
  // A varied selection: one photo from each recent album in turn.
  function mixPhotos(albums, servicesById, limit) {
    const queues = albums.map(album => toPhotos([album], servicesById));
    const out = [];
    while (out.length < limit && queues.some(q => q.length)) queues.forEach(q => { if (q.length && out.length < limit) out.push(q.shift()); });
    return out;
  }

  /* ---------- Scroll reveal ---------- */
  const revealObserver = 'IntersectionObserver' in window && !REDUCED_MOTION
    ? new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');
      revealObserver.unobserve(el);
      // Remove the reveal styles afterwards so hover transitions use their normal timing.
      const delay = parseFloat(el.style.getPropertyValue('--delay')) || 0;
      setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.removeProperty('--delay'); }, 900 + delay * 1000);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })
    : null;
  function reveal(elements, stagger = 0) {
    elements.forEach((el, i) => {
      if (!revealObserver) { el.classList.remove('reveal'); return; }
      el.classList.add('reveal');
      if (stagger) el.style.setProperty('--delay', `${Math.min(i, 6) * stagger}s`);
      revealObserver.observe(el);
    });
  }

  /* ---------- Header, footer, floating buttons ---------- */
  function initHeader() {
    const header = $('#siteHeader');
    const toggle = $('.menu-toggle', header);
    const nav = $('#siteNav');
    const setOpen = open => {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', e => { if (nav.classList.contains('open') && !header.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); } });
    addEventListener('resize', () => { if (innerWidth > 860) setOpen(false); });

    const onScroll = () => {
      header.classList.toggle('scrolled', scrollY > 10);
      $('.fab-top')?.classList.toggle('show', scrollY > 700);
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const links = $$('a[data-section]', nav);
    const mark = id => links.forEach(a => a.classList.toggle('active', a.dataset.section === id));
    if (PAGE === 'home') {
      // Same-page links: scroll instead of reloading.
      $$('a[href^="/#"]').forEach(a => a.setAttribute('href', a.getAttribute('href').slice(1)));
      $$('a[href="/"]').forEach(a => a.setAttribute('href', '#home'));
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) mark(en.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
        links.forEach(a => { const s = document.getElementById(a.dataset.section); if (s) io.observe(s); });
      }
    } else if (PAGE === 'gallery') mark('gallery');
    else if (PAGE === 'service') mark('services');
  }

  function renderFooter(settings) {
    const footer = $('#siteFooter');
    if (!footer) return;
    const links = list(settings.socials).filter(l => l && l.label && l.url)
      .map(l => `<a href="${esc(safeUrl(l.url))}" ${external}>${esc(l.label)}</a>`).join('');
    footer.innerHTML = `
      <a class="brand" href="${PAGE === 'home' ? '#home' : '/'}"><span class="brand-mark">ST</span><span>STUDIO <b>THAPAS</b><small>PHOTOGRAPHY • CINEMATOGRAPHY • PRINTING</small></span></a>
      <p>Capturing moments. Creating memories.</p>
      <nav class="footer-links" aria-label="Social links">${links}<a href="${esc(whatsappUrl(settings.whatsapp))}" ${external}>WhatsApp</a></nav>
      <div class="footer-contact"><a href="tel:${esc(String(settings.phone).replace(/[^\d+]/g, ''))}">${esc(settings.phone)}</a> · ${esc(settings.hours)}</div>
      <small>© ${new Date().getFullYear()} Studio Thapas. All rights reserved.</small>`;
  }

  function renderFloating(settings) {
    const wrap = document.createElement('div');
    wrap.className = 'floating';
    wrap.innerHTML = `<button class="fab fab-top" type="button" aria-label="Back to top">↑</button>
      <a class="fab" href="${esc(whatsappUrl(settings.whatsapp, 'Hello Studio Thapas, I would like to know more.'))}" ${external} aria-label="Chat with us on WhatsApp">${WHATSAPP_ICON}</a>`;
    document.body.append(wrap);
    $('.fab-top', wrap).addEventListener('click', () => scrollTo({ top: 0, behavior: scrollBehavior }));
    $('.fab-top', wrap).classList.toggle('show', scrollY > 700);
  }

  /* ---------- Lightbox ---------- */
  const Lightbox = (() => {
    let root, stage, img, spinner, caption, counter, zoomLabel, prevBtn, nextBtn, closeBtn;
    let items = [], index = 0, zoom = 1, tx = 0, ty = 0, lastFocus = null, moved = false;
    const pointers = new Map();
    let drag = null, pinch = null;

    function build() {
      root = document.createElement('div');
      root.className = 'photo-lightbox';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', 'Photo viewer');
      root.setAttribute('aria-hidden', 'true');
      root.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Close photo viewer">×</button>
        <div class="lightbox-toolbar"><button type="button" data-zoom="-1" aria-label="Zoom out">−</button><button type="button" class="zoom-level" data-zoom="0" aria-label="Reset zoom">100%</button><button type="button" data-zoom="1" aria-label="Zoom in">+</button></div>
        <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous photo">‹</button>
        <button class="lightbox-nav lightbox-next" type="button" aria-label="Next photo">›</button>
        <div class="lightbox-stage"><img alt=""><span class="lightbox-spinner"></span></div>
        <div class="lightbox-bar"><div class="lightbox-caption"></div><span class="lightbox-count"></span></div>`;
      document.body.append(root);
      stage = $('.lightbox-stage', root); img = $('img', stage); spinner = $('.lightbox-spinner', root);
      caption = $('.lightbox-caption', root); counter = $('.lightbox-count', root); zoomLabel = $('.zoom-level', root);
      prevBtn = $('.lightbox-prev', root); nextBtn = $('.lightbox-next', root); closeBtn = $('.lightbox-close', root);

      closeBtn.addEventListener('click', close);
      prevBtn.addEventListener('click', () => show(index - 1));
      nextBtn.addEventListener('click', () => show(index + 1));
      $$('[data-zoom]', root).forEach(b => b.addEventListener('click', () => {
        const step = Number(b.dataset.zoom);
        setZoom(step === 0 ? 1 : zoom + step * 0.5);
      }));
      stage.addEventListener('wheel', e => { e.preventDefault(); setZoom(zoom + (e.deltaY < 0 ? 0.2 : -0.2)); }, { passive: false });
      img.addEventListener('dblclick', () => setZoom(zoom > 1 ? 1 : 2));
      stage.addEventListener('click', e => { if (e.target === stage && !moved) close(); });
      stage.addEventListener('pointerdown', e => {
        if (e.button !== undefined && e.button !== 0) return;
        moved = false;
        stage.setPointerCapture?.(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 1) {
          drag = { x: e.clientX, y: e.clientY, tx, ty };
          if (zoom > 1) stage.classList.add('dragging');
        } else if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: zoom };
          drag = null;
        }
      });
      stage.addEventListener('pointermove', e => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch && pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          setZoom(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d);
          moved = true;
        } else if (drag) {
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
          if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
          if (zoom > 1) { tx = drag.tx + dx; ty = drag.ty + dy; clampPan(); apply(); }
        }
      });
      const end = e => {
        if (!pointers.has(e.pointerId)) return;
        pointers.delete(e.pointerId);
        stage.classList.remove('dragging');
        if (pointers.size < 2) pinch = null;
        if (drag && zoom === 1 && e.type === 'pointerup') {
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) show(index + (dx < 0 ? 1 : -1));
        }
        if (!pointers.size) drag = null;
      };
      stage.addEventListener('pointerup', end);
      stage.addEventListener('pointercancel', end);
      root.addEventListener('keydown', e => {
        if (e.key === 'Tab') { // keep focus inside the viewer
          const focusable = $$('button:not(:disabled), a[href]', root);
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      document.addEventListener('keydown', e => {
        if (!root.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') show(index + 1);
        else if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === '+' || e.key === '=') setZoom(zoom + 0.5);
        else if (e.key === '-') setZoom(zoom - 0.5);
      });
      addEventListener('resize', () => { if (root.classList.contains('open')) { clampPan(); apply(); } });
    }
    function apply() {
      img.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
      zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
      stage.classList.toggle('zoomed', zoom > 1);
    }
    function clampPan() {
      const maxX = Math.max(0, (img.offsetWidth * zoom - stage.clientWidth) / 2);
      const maxY = Math.max(0, (img.offsetHeight * zoom - stage.clientHeight) / 2);
      tx = Math.min(maxX, Math.max(-maxX, tx));
      ty = Math.min(maxY, Math.max(-maxY, ty));
    }
    function setZoom(value) {
      zoom = Math.min(4, Math.max(1, Math.round(value * 100) / 100));
      if (zoom === 1) { tx = 0; ty = 0; }
      clampPan();
      apply();
    }
    function show(i) {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      const item = items[index];
      setZoom(1);
      img.classList.add('swapping');
      spinner.classList.add('show');
      const preload = new Image();
      preload.onload = preload.onerror = () => {
        if (items[index] !== item) return;
        img.src = item.src;
        img.alt = item.title ? `${item.title} – Studio Thapas` : 'Studio Thapas photograph';
        img.classList.remove('swapping');
        spinner.classList.remove('show');
      };
      preload.src = item.src;
      const svc = item.service;
      const onThisService = PAGE === 'service' && svc && new URLSearchParams(location.search).get('s') === svc.id;
      caption.innerHTML = `<b>${esc(item.title || 'Studio Thapas')}</b>${svc && !onThisService ? `<a href="${serviceUrl(svc.id)}#work">More ${esc(svc.short_name || svc.title)} <span class="arrow">→</span></a>` : ''}`;
      counter.textContent = `${index + 1} / ${items.length}`;
      prevBtn.disabled = nextBtn.disabled = items.length < 2;
      [index + 1, index - 1].forEach(n => { const next = items[(n + items.length) % items.length]; if (next) new Image().src = next.src; });
    }
    function open(list, i) {
      if (!root) build();
      items = list;
      lastFocus = document.activeElement;
      root.classList.add('open');
      root.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      show(i);
      closeBtn.focus();
    }
    function close() {
      root.classList.remove('open');
      root.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => { if (!root.classList.contains('open')) img.removeAttribute('src'); }, 300);
      lastFocus?.focus?.({ preventScroll: true });
    }
    return { open };
  })();

  /* ---------- Gallery grid with pagination ---------- */
  function photoItem(photo, i, showService) {
    const svc = photo.service;
    const label = svc ? (svc.short_name || svc.title) : '';
    return `<figure class="gallery-item">
      <button class="gallery-open" type="button" data-index="${i}" aria-label="View ${esc(photo.title || 'photo')} full screen">
        <img class="gallery-photo" ${imgAttrs(photo.src, { widths: [400, 640, 960, 1280], sizes: '(max-width: 700px) 50vw, 33vw', alt: photo.title ? `${photo.title}${label ? ` – ${label}` : ''}` : 'Studio Thapas photograph' })}>
      </button>
      <figcaption class="gallery-caption"><span>${esc(photo.title || 'Studio Thapas')}</span>${showService && svc ? `<a href="${serviceUrl(svc.id)}#work">${esc(label)}</a>` : ''}</figcaption>
    </figure>`;
  }
  function pageNumbers(current, total) {
    const keep = new Set([1, total, current - 1, current, current + 1]);
    if (current <= 3) [2, 3, 4].forEach(n => keep.add(n));
    if (current >= total - 2) [total - 1, total - 2, total - 3].forEach(n => keep.add(n));
    const nums = [...keep].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
    const out = [];
    nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) out.push('gap'); out.push(n); });
    return out;
  }
  function createGallery({ grid, pagination, perPage, showService = true, emptyHtml, onPageChange }) {
    let photos = [], page = 1;
    function render() {
      const pages = Math.max(1, Math.ceil(photos.length / perPage));
      page = Math.min(Math.max(1, page), pages);
      const start = (page - 1) * perPage;
      const slice = photos.slice(start, start + perPage);
      grid.innerHTML = slice.length
        ? slice.map((p, i) => photoItem(p, start + i, showService)).join('')
        : `<p class="gallery-empty">${emptyHtml}</p>`;
      if (!pagination) return;
      if (pages < 2) { pagination.innerHTML = ''; return; }
      pagination.innerHTML = `<button type="button" class="page-step" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Previous page">‹ Prev</button>${
        pageNumbers(page, pages).map(n => (n === 'gap' ? '<span class="gap" aria-hidden="true">…</span>'
          : `<button type="button" data-page="${n}" ${n === page ? 'aria-current="page"' : ''} aria-label="Page ${n}">${n}</button>`)).join('')
      }<button type="button" class="page-step" data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="Next page">Next ›</button>`;
    }
    grid.addEventListener('click', e => {
      const button = e.target.closest('.gallery-open');
      if (button) Lightbox.open(photos, Number(button.dataset.index));
    });
    pagination?.addEventListener('click', e => {
      const button = e.target.closest('button[data-page]');
      if (!button || button.disabled) return;
      page = Number(button.dataset.page);
      render();
      onPageChange?.(page);
    });
    return {
      set(newPhotos, newPage = 1) { photos = newPhotos; page = newPage; render(); },
      get page() { return page; },
      get pages() { return Math.max(1, Math.ceil(photos.length / perPage)); },
      get total() { return photos.length; },
    };
  }
  const skeletonPhotos = n => Array.from({ length: n }, (_, i) => `<div class="skeleton skeleton-photo" style="height:${[260, 340, 200, 300, 240, 380][i % 6]}px"></div>`).join('');

  /* ---------- Shared renderers ---------- */
  function serviceCard(service, number) {
    return `<a class="service-card" href="${serviceUrl(service.id)}">
      <div class="card-media"><img ${imgAttrs(service.cover, { widths: [480, 800, 1200], sizes: '(max-width: 700px) 100vw, (max-width: 950px) 50vw, 33vw', alt: service.title })}></div>
      <div class="card-body"><small>${pad(number)} / ${esc(service.tagline || '')}</small><h3>${esc(service.title)}</h3><p>${esc(service.summary || '')}</p><span class="card-link">Explore <span class="arrow">→</span></span></div>
    </a>`;
  }
  function packageCard(pkg, href) {
    const featured = Boolean(pkg.featured);
    return `<article class="package-card${featured ? ' featured' : ''}">
      ${featured ? '<span class="popular-tag">POPULAR CHOICE</span>' : ''}
      <p class="package-label">${esc(pkg.label || '')}</p><h3>${esc(pkg.name)}</h3><div class="price">${esc(pkg.price || '')}</div>
      <p>${esc(pkg.summary || '')}</p>
      <ul>${list(pkg.features).filter(Boolean).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <a class="btn ${featured ? 'gold' : 'outline'} package-cta" href="${esc(href(pkg))}" data-package="${esc(pkg.name)}" data-service="${esc(pkg.service || '')}">Enquire / Book</a>
    </article>`;
  }
  function renderPackageGrid(grid, packages, href) {
    grid.className = `package-grid${packages.length && packages.length < 5 ? ` count-${packages.length}` : ''}`;
    grid.innerHTML = packages.map(p => packageCard(p, href)).join('');
    reveal($$('.package-card', grid), 0.07);
  }
  // Content renders after the browser has already jumped to #anchor, which pushes the
  // target down. Re-align instantly, and keep it aligned while photos above it load,
  // until the visitor scrolls by themselves.
  function scrollToHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    const html = document.documentElement;
    const align = () => {
      html.style.scrollBehavior = 'auto';
      target.scrollIntoView({ block: 'start' });
      html.style.scrollBehavior = '';
    };
    let userScrolled = false;
    const stop = () => { userScrolled = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(type => addEventListener(type, stop, { once: true, passive: true }));
    align();
    if (!('ResizeObserver' in window)) return;
    const observer = new ResizeObserver(() => { if (!userScrolled) align(); });
    observer.observe(document.body);
    setTimeout(() => observer.disconnect(), 4000);
  }

  /* ---------- Home ---------- */
  function renderHero(raw) {
    const hero = { ...DEFAULTS.hero, ...(raw || {}) };
    const images = list(hero.images).filter(Boolean);
    if (!images.length) images.push(...DEFAULTS.hero.images);
    $('#heroEyebrow').textContent = hero.eyebrow || '';
    $('#heroTitle').textContent = hero.title || '';
    $('#heroEmphasis').textContent = hero.title_emphasis || '';
    $('#heroText').textContent = hero.text || '';
    $('#heroContent').classList.add('ready');

    const media = $('#heroMedia');
    media.innerHTML = images.map((src, i) => `<img ${imgAttrs(src, { widths: [800, 1400, 2000, 2600], sizes: '100vw', lazy: i > 0 })}${i === 0 ? ' fetchpriority="high"' : ''}>`).join('');
    const slides = $$('img', media);
    const dots = $('#heroDots');
    let current = 0, timer = null;
    const go = n => {
      slides[current].classList.remove('active', 'zoom');
      current = (n + slides.length) % slides.length;
      const slide = slides[current];
      slide.classList.add('active');
      if (!REDUCED_MOTION) { void slide.offsetWidth; slide.classList.add('zoom'); }
      $$('button', dots).forEach((d, i) => { d.classList.toggle('active', i === current); d.setAttribute('aria-pressed', String(i === current)); });
    };
    const restart = () => {
      clearInterval(timer);
      if (slides.length > 1 && !REDUCED_MOTION) timer = setInterval(() => { if (!document.hidden) go(current + 1); }, 6500);
    };
    if (slides.length > 1) {
      dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Show photo ${i + 1}"></button>`).join('');
      dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { go($$('button', dots).indexOf(b)); restart(); } });
    }
    go(0);
    restart();
  }

  function initContactForm(settings, services, packages) {
    const form = $('#bookingForm');
    const serviceSelect = $('#formService');
    const packageSelect = $('#formPackage');
    serviceSelect.innerHTML = services.map(s => `<option value="${esc(s.title)}" data-id="${esc(s.id)}">${esc(s.title)}</option>`).join('') + '<option value="Other">Other</option>';
    packageSelect.innerHTML = '<option value="">Choose a package</option>' + packages
      .map(p => { const text = p.price ? `${p.name} - ${p.price}` : p.name; return `<option value="${esc(text)}" data-name="${esc(p.name)}">${esc(text)}</option>`; }).join('');

    const select = (serviceId, packageName) => {
      if (serviceId) { const o = $$('option', serviceSelect).find(opt => opt.dataset.id === serviceId); if (o) serviceSelect.value = o.value; }
      if (packageName) { const o = $$('option', packageSelect).find(opt => opt.dataset.name === packageName); if (o) packageSelect.value = o.value; }
    };
    const highlight = () => { form.classList.add('highlight'); setTimeout(() => form.classList.remove('highlight'), 1800); };
    const params = new URLSearchParams(location.search);
    if (params.get('service') || params.get('package')) { select(params.get('service'), params.get('package')); highlight(); }

    document.addEventListener('click', e => {
      const cta = e.target.closest('.package-cta');
      if (cta && cta.getAttribute('href') === '#contact') { select(cta.dataset.service, cta.dataset.package); highlight(); }
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const message = `Hello Studio Thapas,\nName: ${data.get('name')}\nPhone: ${data.get('phone')}\nService: ${data.get('service')}\nPackage: ${data.get('package') || 'Not selected'}\nMessage: ${data.get('message') || ''}`;
      window.open(whatsappUrl(settings.whatsapp, message), '_blank', 'noopener');
    });

    $('#contactDetails').innerHTML = `
      <p><b>Call / WhatsApp</b><br><a href="tel:${esc(String(settings.phone).replace(/[^\d+]/g, ''))}">${esc(settings.phone)}</a> · <a href="${esc(whatsappUrl(settings.whatsapp))}" ${external}>Chat on WhatsApp ↗</a></p>
      <p><b>Visit our studio</b><br>${esc(settings.address).replace(/\n/g, '<br>')}</p>
      <p><b>Opening hours</b><br>${esc(settings.hours)}</p>`;
  }

  function initHomeGallery(albums, services, servicesById) {
    const grid = $('#homeGrid');
    const filters = $('#homeFilters');
    const more = $('#homeMore');
    const all = toPhotos(albums, servicesById);
    const counts = new Map();
    all.forEach(p => { if (p.service) counts.set(p.service.id, (counts.get(p.service.id) || 0) + 1); });
    const withPhotos = services.filter(s => counts.get(s.id));
    const gallery = createGallery({ grid, perPage: HOME_PREVIEW, emptyHtml: 'New photographs are coming soon.' });

    if (!all.length) {
      filters.hidden = true;
      gallery.set([]);
      more.innerHTML = '<p>Explore our services to see what we offer.</p><a class="btn dark-outline" href="#services">View Services</a>';
      return;
    }
    filters.innerHTML = `<button class="gallery-filter active" type="button" data-filter="all" aria-pressed="true">All Photos <span class="count">${all.length}</span></button>${
      withPhotos.map(s => `<button class="gallery-filter" type="button" data-filter="${esc(s.id)}" aria-pressed="false">${esc(s.short_name || s.title)} <span class="count">${counts.get(s.id)}</span></button>`).join('')}`;
    const show = id => {
      $$('.gallery-filter', filters).forEach(b => { const on = b.dataset.filter === id; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
      if (id === 'all') {
        gallery.set(mixPhotos(albums, servicesById, HOME_PREVIEW));
        more.innerHTML = `<p>A selection of our latest work. Browse the full gallery, or open a service to see everything we've shot for it.</p>
          <a class="btn dark-outline" href="/gallery/">View Full Gallery <span class="arrow">→</span></a>`;
      } else {
        const svc = servicesById.get(id);
        const photos = all.filter(p => p.service && p.service.id === id);
        gallery.set(photos);
        const name = esc(svc.short_name || svc.title);
        more.innerHTML = `<p>Showing ${Math.min(HOME_PREVIEW, photos.length)} of ${photos.length} ${name} photos.</p>
          <div class="button-row"><a class="btn gold" href="${serviceUrl(id)}#work">See All ${name} Work <span class="arrow">→</span></a><a class="btn dark-outline" href="/gallery/?service=${encodeURIComponent(id)}">Open in Gallery</a></div>`;
      }
    };
    filters.addEventListener('click', e => { const b = e.target.closest('.gallery-filter'); if (b) show(b.dataset.filter); });
    show('all');
  }

  async function initHome(data, settings) {
    renderHero(data.home?.hero);
    const services = getServices(data.services);
    const servicesById = new Map(services.map(s => [s.id, s]));
    const packages = list(data.packages).filter(p => p && p.name);

    const serviceGrid = $('#serviceGrid');
    serviceGrid.innerHTML = services.map((s, i) => serviceCard(s, i + 1)).join('');
    reveal($$('.service-card', serviceGrid), 0.07);
    const note = data.home?.services_note;
    if (note) { $('#servicesNote span').textContent = note; $('#servicesNote').hidden = false; }

    $('#packagesIntro').textContent = data.home?.packages_intro || '';
    $('#packagesNote').textContent = data.home?.packages_note || '';
    renderPackageGrid($('#packageGrid'), packages, () => '#contact');
    $('#packages').hidden = !packages.length;

    initHomeGallery(sortAlbums(data.gallery), services, servicesById);
    initContactForm(settings, services, packages);
    scrollToHash();
  }

  /* ---------- Service page ---------- */
  function initService(data, settings) {
    const params = new URLSearchParams(location.search);
    const id = params.get('s');
    const services = getServices(data.services);
    const servicesById = new Map(services.map(s => [s.id, s]));
    const position = services.findIndex(s => s.id === id);
    const svc = services[position];

    if (!svc) {
      $$('#main > section').forEach(s => { s.hidden = s.id !== 'svcMissing'; });
      document.title = 'Service Not Found | Studio Thapas';
      return;
    }
    const name = svc.short_name || svc.title;
    document.title = `${svc.title} | Studio Thapas`;
    $('meta[name="description"]')?.setAttribute('content', svc.summary || svc.title);

    const heroMedia = $('#svcHeroMedia');
    heroMedia.innerHTML = svc.cover ? `<img ${imgAttrs(svc.cover, { widths: [800, 1400, 2000, 2600], sizes: '100vw', lazy: false })} fetchpriority="high">` : '';
    const heroImg = $('img', heroMedia);
    if (heroImg) heroImg.classList.add('active');
    $('#svcCrumb').textContent = name;
    $('#svcEyebrow').textContent = `${pad(position + 1)} / ${svc.tagline || 'Service'}`;
    $('#svcTitle').textContent = svc.title;
    $('#svcSummary').textContent = svc.summary || '';

    const book = `/?service=${encodeURIComponent(svc.id)}#contact`;
    const wa = whatsappUrl(settings.whatsapp, `Hello Studio Thapas, I'm interested in ${svc.title}.`);
    ['#svcBook', '#svcEnquire', '#ctaBook'].forEach(sel => $(sel).setAttribute('href', book));
    ['#svcWhatsapp', '#ctaWhatsapp'].forEach(sel => $(sel).setAttribute('href', wa));

    $('#svcDescription').innerHTML = paragraphs(svc.description || svc.summary);
    const highlights = list(svc.highlights).filter(Boolean);
    $('#svcHighlights').innerHTML = highlights.map(h => `<li>${esc(h)}</li>`).join('');
    if (!highlights.length) { $('#svcHighlights').hidden = true; $('.svc-aside-title').textContent = 'Plan your session'; }

    const packages = list(data.packages).filter(p => p && p.name && p.service === svc.id);
    if (packages.length) {
      $('#svcPackages').hidden = false;
      renderPackageGrid($('#svcPackageGrid'), packages, p => `/?service=${encodeURIComponent(svc.id)}&package=${encodeURIComponent(p.name)}#contact`);
    }

    const photos = toPhotos(sortAlbums(data.gallery).filter(a => a.service === svc.id), servicesById);
    $('#workEyebrow').textContent = photos.length ? `${name} · ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}` : name;
    $('#workTitle').innerHTML = `Our ${esc(name)} <em>work</em>`;
    $('#workInfo').textContent = photos.length ? 'Click any photo to view it full screen and zoom in.' : '';
    const workSection = $('#work');
    const gallery = createGallery({
      grid: $('#svcGrid'), pagination: $('#svcPagination'), perPage: SERVICE_PER_PAGE, showService: false,
      emptyHtml: 'Photos for this service are coming soon. <a class="text-link" href="/gallery/">Browse the full gallery <span class="arrow">→</span></a>',
      onPageChange: page => {
        const url = new URL(location.href);
        url.searchParams.set('page', page);
        url.hash = 'work';
        history.pushState({ page }, '', url);
        workSection.scrollIntoView({ behavior: scrollBehavior });
      },
    });
    const pageFromUrl = () => Math.max(1, parseInt(new URLSearchParams(location.search).get('page'), 10) || 1);
    gallery.set(photos, pageFromUrl());
    addEventListener('popstate', () => gallery.set(photos, pageFromUrl()));

    const others = services.filter(s => s.id !== svc.id);
    const start = others.findIndex(s => services.indexOf(s) > position);
    const related = Array.from({ length: Math.min(3, others.length) }, (_, i) => others[((start < 0 ? 0 : start) + i) % others.length]);
    $('#relatedGrid').innerHTML = related.map(s => serviceCard(s, services.indexOf(s) + 1)).join('');
    $('#related').hidden = !related.length;
    reveal($$('.service-card', $('#relatedGrid')), 0.08);
    scrollToHash();
  }

  /* ---------- Gallery page ---------- */
  function initGalleryPage(data) {
    const services = getServices(data.services);
    const servicesById = new Map(services.map(s => [s.id, s]));
    const all = toPhotos(sortAlbums(data.gallery), servicesById);
    const counts = new Map();
    all.forEach(p => { if (p.service) counts.set(p.service.id, (counts.get(p.service.id) || 0) + 1); });
    const filters = $('#galleryFilters');
    const info = $('#galleryInfo');
    const serviceLink = $('#galleryServiceLink');
    const filterSection = filters.closest('section');

    filters.innerHTML = `<button class="gallery-filter" type="button" data-filter="">All Photos <span class="count">${all.length}</span></button>${
      services.filter(s => counts.get(s.id)).map(s => `<button class="gallery-filter" type="button" data-filter="${esc(s.id)}">${esc(s.short_name || s.title)} <span class="count">${counts.get(s.id)}</span></button>`).join('')}`;
    filters.hidden = !all.length;

    const readState = () => {
      const p = new URLSearchParams(location.search);
      const service = servicesById.has(p.get('service')) ? p.get('service') : '';
      return { service, page: Math.max(1, parseInt(p.get('page'), 10) || 1) };
    };
    const writeState = state => {
      const url = new URL(location.href);
      url.search = '';
      if (state.service) url.searchParams.set('service', state.service);
      if (state.page > 1) url.searchParams.set('page', state.page);
      history.pushState(state, '', url);
    };
    let state = readState();
    const gallery = createGallery({
      grid: $('#galleryGrid'), pagination: $('#galleryPagination'), perPage: GALLERY_PER_PAGE,
      emptyHtml: 'New photographs are coming soon.',
      onPageChange: page => { state = { ...state, page }; writeState(state); update(false); filterSection.scrollIntoView({ behavior: scrollBehavior }); },
    });
    function update(rerender = true) {
      const svc = servicesById.get(state.service);
      const photos = svc ? all.filter(p => p.service && p.service.id === svc.id) : all;
      if (rerender) gallery.set(photos, state.page);
      state.page = gallery.page;
      $$('.gallery-filter', filters).forEach(b => { const on = b.dataset.filter === state.service; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
      const first = (gallery.page - 1) * GALLERY_PER_PAGE + 1;
      const last = Math.min(gallery.total, gallery.page * GALLERY_PER_PAGE);
      info.textContent = gallery.total ? `Showing ${first}–${last} of ${gallery.total} ${svc ? `${svc.short_name || svc.title} ` : ''}photos` : '';
      serviceLink.hidden = !svc;
      if (svc) { serviceLink.href = serviceUrl(svc.id); serviceLink.innerHTML = `About ${esc(svc.short_name || svc.title)} <span class="arrow">→</span>`; }
      document.title = svc ? `${svc.short_name || svc.title} Photos | Studio Thapas Gallery` : 'Gallery | Studio Thapas';
    }
    filters.addEventListener('click', e => {
      const b = e.target.closest('.gallery-filter');
      if (!b) return;
      state = { service: b.dataset.filter, page: 1 };
      writeState(state);
      update();
    });
    addEventListener('popstate', () => { state = readState(); update(); });
    update();
  }

  /* ---------- Boot ---------- */
  async function boot() {
    initHeader();
    const needs = {
      home: ['settings', 'home', 'services', 'packages', 'gallery'],
      service: ['settings', 'services', 'packages', 'gallery'],
      gallery: ['settings', 'services', 'gallery'],
    }[PAGE] || ['settings'];

    if (PAGE === 'home') { $('#serviceGrid').innerHTML = '<div class="skeleton skeleton-card"></div>'.repeat(6); $('#homeGrid').innerHTML = skeletonPhotos(6); }
    if (PAGE === 'service') $('#svcGrid').innerHTML = skeletonPhotos(6);
    if (PAGE === 'gallery') $('#galleryGrid').innerHTML = skeletonPhotos(9);
    reveal($$('.reveal'));

    const data = await loadAll(needs);
    const settings = getSettings(data.settings);
    renderFooter(settings);
    renderFloating(settings);
    if (PAGE === 'home') initHome(data, settings);
    else if (PAGE === 'service') initService(data, settings);
    else if (PAGE === 'gallery') initGalleryPage(data);
  }
  boot();
})();
