/* ==========================================================
   Minas Milk - comportamento do site
   ========================================================== */
(function () {
  'use strict';

  var CFG = window.MINAS_MILK || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Config: links, textos e blocos opcionais ---------- */
  function applyConfig() {
    $$('[data-cfg-tel]').forEach(function (a) {
      if (CFG.telefone) { a.href = 'tel:' + CFG.telefone; }
      if (CFG.telefoneExibicao) { a.textContent = CFG.telefoneExibicao; }
    });
    // E-mail: só aparece se estiver preenchido em site-config.js
    $$('[data-cfg-mail]').forEach(function (a) {
      if (!CFG.email) { return; }
      a.href = 'mailto:' + CFG.email; a.textContent = CFG.email; a.hidden = false;
      var li = a.closest('li'); if (li) { li.hidden = false; }
    });
    $$('[data-cfg-wa]').forEach(function (a) {
      if (CFG.whatsapp) {
        a.href = 'https://wa.me/' + CFG.whatsapp;
        if (CFG.whatsappExibicao) { a.textContent = CFG.whatsappExibicao; }
      } else {
        var li = a.closest('li'); if (li) { li.hidden = true; }
      }
    });
    $$('[data-cfg-instagram]').forEach(function (a) { if (CFG.instagram) { a.href = CFG.instagram; } });
    // Facebook: só aparece se o link estiver preenchido em site-config.js
    if (CFG.facebook) {
      $$('[data-cfg-facebook]').forEach(function (a) { a.href = CFG.facebook; a.hidden = false; });
      $$('[data-cfg-facebook-sep]').forEach(function (s) { s.hidden = false; });
      $$('[data-cfg-facebook-handle]').forEach(function (p) { p.textContent = CFG.facebookExibicao || 'Facebook da Minas Milk'; });
    }

    if (CFG.horario) {
      $('#horario-texto').textContent = CFG.horario;
      $('#horario-item').hidden = false;
    }
    if (CFG.certificacoes && CFG.certificacoes.length) {
      var row = $('#certificacoes');
      CFG.certificacoes.forEach(function (c) {
        var s = document.createElement('span'); s.className = 'cert'; s.textContent = c; row.appendChild(s);
      });
      row.hidden = false;
    }
    if (!CFG.whatsapp) { $('#btn-wa').hidden = true; }
    if (!CFG.email) { $('#btn-mail').hidden = true; }
    var y = $('#ano'); if (y) { y.textContent = new Date().getFullYear(); }
  }

  /* ---------- Cabeçalho e menu ---------- */
  var header = $('.site-header');
  var toggle = $('.nav-toggle');
  var nav = $('#menu');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) { setMenu(false); } });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });

  /* ---------- Link ativo no menu ---------- */
  var sectionToNav = {
    inicio: 'inicio', historia: 'historia',
    produtos: 'produtos', queijos: 'produtos', requeijoes: 'produtos', bebidas: 'produtos', doces: 'produtos',
    producao: 'producao', produtores: 'produtores', galeria: 'galeria', redes: 'contato', contato: 'contato'
  };
  var navLinks = $$('.nav-list a');
  function setActive(id) {
    var target = sectionToNav[id];
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + target;
      if (on) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
    });
  }
  function updateActive() {
    var probe = header.offsetHeight + window.innerHeight * 0.3;
    var current = 'inicio';
    Object.keys(sectionToNav).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= probe) { current = id; }
    });
    setActive(current);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () { updateActive(); updateTimeline(); ticking = false; });
  }, { passive: true });

  /* ---------- Revelar ao rolar ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Linha do tempo ---------- */
  var timeline = $('#timeline');
  var tlItems = $$('.tl-item', timeline);
  function updateTimeline() {
    if (!timeline) { return; }
    var r = timeline.getBoundingClientRect();
    var vh = window.innerHeight;
    var progress = (vh * 0.65 - r.top) / r.height;
    progress = Math.max(0, Math.min(1, progress));
    timeline.style.setProperty('--tl-pct', progress.toFixed(3));
    tlItems.forEach(function (it) {
      var ir = it.getBoundingClientRect();
      it.classList.toggle('is-on', ir.top < vh * 0.65);
    });
  }

  /* ---------- Orçamento (lista de produtos) ---------- */
  var KEY = 'mm_orcamento';
  var basket = [];
  try { basket = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { basket = []; }
  if (!Array.isArray(basket)) { basket = []; }

  function saveBasket() { try { sessionStorage.setItem(KEY, JSON.stringify(basket)); } catch (e) { /* sem armazenamento */ } }
  function inBasket(id) { return basket.some(function (b) { return b.id === id; }); }

  var pill = $('#basket-pill');
  var pillCount = $('#basket-count');
  var listEl = $('#basket-list');
  var emptyEl = $('#basket-empty');

  function renderBasket() {
    pillCount.textContent = basket.length;
    pill.hidden = basket.length === 0;
    emptyEl.hidden = basket.length > 0;
    listEl.textContent = '';
    basket.forEach(function (b) {
      var item = document.createElement('span'); item.className = 'basket-item';
      var label = document.createElement('span'); label.textContent = b.name;
      var rm = document.createElement('button'); rm.type = 'button';
      rm.setAttribute('aria-label', 'Remover ' + b.name + ' do orçamento');
      rm.innerHTML = '<svg aria-hidden="true"><use href="#i-x"/></svg>';
      rm.addEventListener('click', function () { removeFromBasket(b.id); });
      item.appendChild(label); item.appendChild(rm); listEl.appendChild(item);
    });
    $$('.card').forEach(function (card) {
      var btn = $('.card-add', card);
      var on = inBasket(card.dataset.id);
      btn.setAttribute('aria-pressed', String(on));
      $('.lbl', btn).textContent = on ? 'No orçamento' : 'Adicionar ao orçamento';
    });
  }
  function removeFromBasket(id) {
    basket = basket.filter(function (b) { return b.id !== id; });
    saveBasket(); renderBasket();
  }
  $$('.card').forEach(function (card) {
    $('.card-add', card).addEventListener('click', function () {
      var id = card.dataset.id;
      if (inBasket(id)) { removeFromBasket(id); }
      else { basket.push({ id: id, name: card.dataset.name }); saveBasket(); renderBasket(); }
    });
  });

  document.addEventListener('mm:card-change', renderBasket);

  /* ---------- Busca de produtos ---------- */
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var search = $('#busca');
  var status = $('#busca-status');
  var cards = $$('.card');
  var catSections = $$('[data-cat]');
  function runSearch() {
    var q = norm(search.value).trim();
    var shown = 0;
    cards.forEach(function (c) {
      var match = !q || norm(c.dataset.search).indexOf(q) !== -1;
      c.hidden = !match;
      if (match) { shown++; }
    });
    catSections.forEach(function (sec) {
      var visible = $$('.card', sec).some(function (c) { return !c.hidden; });
      $('.product-grid', sec).hidden = !visible;
      $('.empty-note', sec).hidden = visible || !q;
    });
    if (!q) { status.textContent = ''; }
    else if (shown === 0) { status.textContent = 'Nenhum produto encontrado. Tente outra palavra.'; }
    else { status.textContent = shown + (shown === 1 ? ' produto encontrado' : ' produtos encontrados') + ' nas seções abaixo.'; }
  }
  search.addEventListener('input', runSearch);
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && search.value.trim()) {
      e.preventDefault();
      var first = cards.filter(function (c) { return !c.hidden; })[0];
      if (first) { first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); }
    }
  });

  /* ---------- Atalhos de assunto (ex.: parceria) ---------- */
  $$('[data-assunto]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = $('#assunto');
      Array.prototype.forEach.call(sel.options, function (o) { if (o.text === a.dataset.assunto) { sel.value = o.value || o.text; } });
    });
  });

  /* ---------- Formulário ---------- */
  var form = $('#form-contato');
  var formStatus = $('#form-status');
  var clicked = 'whatsapp';
  $$('button[type=submit]', form).forEach(function (b) {
    b.addEventListener('click', function () { clicked = b.dataset.canal; });
  });

  function setError(id, msg) {
    var input = $('#' + id); var out = $('#erro-' + id);
    out.textContent = msg || '';
    if (msg) { input.setAttribute('aria-invalid', 'true'); } else { input.removeAttribute('aria-invalid'); }
    return !msg;
  }
  function validate() {
    var nome = $('#nome').value.trim();
    var tel = $('#telefone').value.replace(/\D/g, '');
    var email = $('#email').value.trim();
    var msg = $('#mensagem').value.trim();
    var ok = true;
    ok = setError('nome', nome.length < 2 ? 'Escreva seu nome.' : '') && ok;
    ok = setError('telefone', (tel.length < 10 || tel.length > 13) ? 'Informe o telefone com DDD, por exemplo (35) 90000-0000.' : '') && ok;
    ok = setError('email', (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? 'Esse e-mail parece incompleto.' : '') && ok;
    ok = setError('mensagem', (!msg && basket.length === 0) ? 'Escreva uma mensagem ou marque pelo menos um produto.' : '') && ok;
    if (!ok) {
      var firstBad = $('[aria-invalid="true"]', form); if (firstBad) { firstBad.focus(); }
    }
    return ok;
  }
  function buildMessage() {
    var lines = ['Olá, Minas Milk! Meu nome é ' + $('#nome').value.trim() + '.'];
    lines.push('Assunto: ' + $('#assunto').value + '.');
    lines.push('Telefone: ' + $('#telefone').value.trim() + '.');
    var email = $('#email').value.trim(); if (email) { lines.push('E-mail: ' + email + '.'); }
    if (basket.length) {
      lines.push('', 'Produtos de interesse:');
      basket.forEach(function (b) { lines.push('- ' + b.name); });
    }
    var msg = $('#mensagem').value.trim(); if (msg) { lines.push('', msg); }
    return lines.join('\n');
  }
  function showStatus(text, isError) {
    formStatus.textContent = text; formStatus.hidden = false;
    formStatus.classList.toggle('is-error', !!isError);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formStatus.hidden = true;
    if (!validate()) { return; }
    var text = buildMessage();
    if (clicked === 'whatsapp' && CFG.whatsapp) {
      window.open('https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      showStatus('WhatsApp aberto com a mensagem pronta. É só tocar em enviar.');
    } else if (CFG.email) {
      var subject = 'Contato pelo site: ' + $('#assunto').value;
      window.location.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      showStatus('Seu app de e-mail abriu com a mensagem pronta. Confira e envie.');
    } else {
      showStatus('Os canais de envio ainda não foram configurados. Use o telefone da seção ao lado.', true);
    }
  });
  ['nome', 'telefone', 'email', 'mensagem'].forEach(function (id) {
    $('#' + id).addEventListener('input', function () { setError(id, ''); });
  });

  /* ---------- Galeria e lightbox ---------- */
  var gItems = $$('.g-item');
  var lb = $('#lightbox');
  var lbImg = $('img', lb);
  var lbCount = $('#lb-count');
  var lbIndex = 0;
  var lastFocus = null;

  gItems.forEach(function (btn) {
    var img = $('img', btn);
    if (img) { img.addEventListener('error', function () { img.remove(); btn.dataset.broken = '1'; }); }
  });
  function visibleItems() { return gItems.filter(function (b) { return !b.dataset.broken && $('img', b); }); }
  function openLb(index) {
    var items = visibleItems();
    if (!items.length) { return; }
    lbIndex = (index + items.length) % items.length;
    var img = $('img', items[lbIndex]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCount.textContent = (lbIndex + 1) + ' de ' + items.length;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  }
  function closeLb() {
    lb.hidden = true; document.body.style.overflow = '';
    if (lastFocus) { lastFocus.focus(); }
  }
  gItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var items = visibleItems(); lastFocus = btn;
      openLb(items.indexOf(btn));
    });
  });
  $('.lb-close', lb).addEventListener('click', closeLb);
  $('.lb-prev', lb).addEventListener('click', function () { openLb(lbIndex - 1); });
  $('.lb-next', lb).addEventListener('click', function () { openLb(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) { closeLb(); } });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) { return; }
    if (e.key === 'Escape') { closeLb(); }
    else if (e.key === 'ArrowLeft') { openLb(lbIndex - 1); }
    else if (e.key === 'ArrowRight') { openLb(lbIndex + 1); }
    else if (e.key === 'Tab') {
      var f = $$('button', lb); var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Início ---------- */
  applyConfig();
  renderBasket();
  updateActive();
  updateTimeline();
})();
