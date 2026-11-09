/* =========================================================
   Vitta OdontoClínic — interações
   ========================================================= */
(function () {
  'use strict';

  /* EDITAR: número de WhatsApp da clínica (somente dígitos, com DDI 55) */
  var WHATSAPP = '5582993350068';
  var WA_DEFAULT = 'Olá! Vim pelo site e gostaria de agendar uma consulta na Vitta OdontoClínic.';

  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text || WA_DEFAULT);
  }

  /* ---------- Links de WhatsApp ---------- */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink();
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Header ---------- */
  var header = document.getElementById('header');
  var waFloat = document.querySelector('.wa-float');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    if (!body.classList.contains('menu-open')) {
      if (y > 500 && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    waFloat.classList.toggle('is-visible', y > 400);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
    body.classList.toggle('is-locked', open);
    if (open) header.classList.remove('is-hidden');
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1100 && menu.classList.contains('is-open')) setMenu(false); });

  /* ---------- Reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Link ativo ---------- */
  var navLinks = document.querySelectorAll('.nav__link');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'tratamentos', 'sobre', 'resultados', 'clinica', 'depoimentos', 'contato'].forEach(function (id) {
      var s = document.getElementById(id); if (s) spy.observe(s);
    });
  }

  /* ---------- Tratamentos (lista + painel) ---------- */
  var treats = document.querySelectorAll('.treat');
  var tImg = document.getElementById('treat-img');
  var tTitle = document.getElementById('treat-title');
  var tText = document.getElementById('treat-text');
  var tLink = document.querySelector('[data-wa-treat]');
  var desktop = window.matchMedia('(min-width: 961px)');

  function activate(item, fromHover) {
    if (item.classList.contains('is-active')) {
      // no mobile, tocar no item aberto fecha o acordeão
      if (!fromHover && !desktop.matches) {
        item.classList.remove('is-active');
        item.querySelector('.treat__head').setAttribute('aria-expanded', 'false');
      }
      return;
    }
    treats.forEach(function (t) {
      t.classList.remove('is-active');
      t.querySelector('.treat__head').setAttribute('aria-expanded', 'false');
    });
    item.classList.add('is-active');
    item.querySelector('.treat__head').setAttribute('aria-expanded', 'true');

    var name = item.querySelector('.treat__name').textContent;
    var bodyImg = item.querySelector('.treat__body img');
    tTitle.textContent = name;
    tText.textContent = item.querySelector('.treat__body p').textContent;
    tLink.href = waLink('Olá! Vim pelo site e gostaria de agendar uma avaliação para ' + name.toLowerCase() + '.');
    tImg.classList.add('is-fading');
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      tImg.src = item.dataset.img;
      tImg.alt = bodyImg ? bodyImg.alt : '';
      requestAnimationFrame(function () { tImg.classList.remove('is-fading'); });
    };
    pre.src = item.dataset.img;
  }
  treats.forEach(function (item) {
    var head = item.querySelector('.treat__head');
    head.addEventListener('click', function () { activate(item, false); });
    head.addEventListener('mouseenter', function () { if (desktop.matches) activate(item, true); });
  });
  tLink.href = waLink('Olá! Vim pelo site e gostaria de agendar uma avaliação para implantes dentários.');

  /* ---------- Resultados (carrossel) ---------- */
  var track = document.getElementById('results-track');
  var RESULTS = [];
  for (var i = 1; i <= 15; i++) {
    var n = (i < 10 ? '0' : '') + i;
    RESULTS.push({ src: 'assets/img/resultado-' + n + '.jpg', cap: 'Antes e depois · Caso ' + n });
  }
  RESULTS.forEach(function (r, idx) {
    var b = document.createElement('button');
    b.className = 'result';
    b.setAttribute('aria-label', 'Ampliar resultado ' + (idx + 1) + ' — antes e depois');
    b.innerHTML = '<img src="' + r.src + '" alt="Antes e depois de tratamento odontológico, caso ' + (idx + 1) + '" loading="lazy" draggable="false"><span class="result__tag">Antes · Depois</span>';
    b.addEventListener('click', function () { openLightbox(RESULTS, idx); });
    track.appendChild(b);
  });

  function step(dir) {
    var card = track.querySelector('.result');
    var w = card ? card.getBoundingClientRect().width + 18 : 300;
    track.scrollBy({ left: dir * w * (window.innerWidth > 900 ? 2 : 1), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  document.getElementById('res-prev').addEventListener('click', function () { step(-1); });
  document.getElementById('res-next').addEventListener('click', function () { step(1); });

  // arrastar com o mouse
  var down = false, startX = 0, startLeft = 0, moved = false;
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
  });
  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
    track.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', function () {
    if (!down) return;
    down = false;
    setTimeout(function () { track.classList.remove('is-dragging'); }, 0);
  });
  track.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  /* ---------- Galeria da clínica ---------- */
  var CLINIC = [
    { src: 'assets/img/clinica-recepcao.jpg', cap: 'Recepção' },
    { src: 'assets/img/clinica-entrada.jpg', cap: 'Entrada' },
    { src: 'assets/img/clinica-consultorio.jpg', cap: 'Consultório' },
    { src: 'assets/img/clinica-espera.jpg', cap: 'Sala de espera' }
  ];
  document.querySelectorAll('[data-gallery]').forEach(function (b) {
    b.addEventListener('click', function () { openLightbox(CLINIC, Number(b.dataset.gallery)); });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var lbSet = [], lbIndex = 0, lbReturn = null;

  function showLb() {
    var it = lbSet[lbIndex];
    lbImg.src = it.src;
    lbImg.alt = it.cap;
    lbCap.textContent = it.cap + '  ·  ' + (lbIndex + 1) + ' / ' + lbSet.length;
  }
  function openLightbox(set, idx) {
    lbSet = set; lbIndex = idx; lbReturn = document.activeElement;
    showLb();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    lb.querySelector('[data-lb-close]').focus();
  }
  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    if (lbReturn) lbReturn.focus({ preventScroll: true });
  }
  function lbStep(d) { lbIndex = (lbIndex + d + lbSet.length) % lbSet.length; showLb(); }
  lb.querySelector('[data-lb-close]').addEventListener('click', closeLightbox);
  lb.querySelector('[data-lb-prev]').addEventListener('click', function () { lbStep(-1); });
  lb.querySelector('[data-lb-next]').addEventListener('click', function () { lbStep(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__figure')) closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lbStep(1);
      if (e.key === 'ArrowLeft') lbStep(-1);
      if (e.key === 'Tab') {
        var f = lb.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    } else if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
    }
  });
  // swipe no lightbox (celular)
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1);
    tx = null;
  });

  /* ---------- Formulário → WhatsApp ---------- */
  var form = document.getElementById('contact-form');
  var status = form.querySelector('.form__status');
  var tel = form.querySelector('[name="telefone"]');
  tel.addEventListener('input', function () {
    var d = tel.value.replace(/\D/g, '').slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    tel.value = out;
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.querySelector('[name="nome"]');
    var ok = true;
    [[nome, 2], [tel, 10]].forEach(function (pair) {
      var valid = pair[0].value.replace(/\s/g, '').length >= pair[1];
      pair[0].closest('.field').classList.toggle('is-invalid', !valid);
      if (!valid && ok) { pair[0].focus(); ok = false; }
    });
    if (!ok) { status.textContent = 'Preencha seu nome e WhatsApp para continuar.'; return; }

    var d = new FormData(form);
    var lines = [
      'Olá! Vim pelo site e gostaria de agendar uma consulta.',
      '',
      '*Nome:* ' + d.get('nome'),
      '*WhatsApp:* ' + d.get('telefone'),
      '*Tratamento:* ' + d.get('tratamento'),
      '*Melhor período:* ' + d.get('periodo')
    ];
    if ((d.get('mensagem') || '').trim()) lines.push('', '*Mensagem:* ' + d.get('mensagem').trim());
    status.textContent = 'Abrindo o WhatsApp…';
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });
  form.querySelectorAll('input').forEach(function (el) {
    el.addEventListener('input', function () {
      var f = el.closest('.field'); if (f) f.classList.remove('is-invalid');
      status.textContent = '';
    });
  });

  /* ---------- Ano ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
