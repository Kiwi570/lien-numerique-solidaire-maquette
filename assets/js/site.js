/* Le Lien Numérique Solidaire — maquette « Le Fil »
   Un seul script pour les trois pages. Tout ce qui est utile (menu, formulaire, simulateur, filtres)
   marche sans animation ; les animations s'ajoutent quand GSAP est là et que le visiteur ne demande pas le calme. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, NS = 'http://www.w3.org/2000/svg';
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var confort = root.classList.contains('confort');
  var calme = confort || reduit;
  var pointeurFin = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G = window.gsap, ST = window.ScrollTrigger;
  var avecGsap = !!(G && ST);
  var lenis = null;

  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function stocker(type, cle, val) { try { window[type].setItem(cle, val); return true; } catch (e) { return false; } }
  function lire(type, cle) { try { return window[type].getItem(cle); } catch (e) { return null; } }
  function effacer(type, cle) { try { window[type].removeItem(cle); } catch (e) { /* rien */ } }
  function el(tag, attrs, parent) {
    var n = d.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function couleur(nom) { return getComputedStyle(root).getPropertyValue(nom).trim() || '#B5452A'; }
  function hauteurEntete() { var e = $('.entete'); return e ? e.offsetHeight : 70; }
  function graine(txt) { var h = 2166136261; for (var i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function hasard(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ------------------------------------------------------------ Mode confort */
  function initConfort() {
    $$('.bouton-confort').forEach(function (b) {
      var actif = root.classList.contains('confort');
      b.setAttribute('aria-pressed', actif ? 'true' : 'false');
      b.querySelector('span').textContent = actif ? 'Mode confort activé' : 'Mode confort';
      b.addEventListener('click', function () {
        var v = !root.classList.contains('confort');
        var ok = stocker('localStorage', 'lns-confort', v ? '1' : '0');
        if (ok) {
          stocker('sessionStorage', 'lns-defilement', String(window.scrollY / Math.max(1, d.documentElement.scrollHeight)));
          location.reload();
        } else {
          root.classList.toggle('confort', v);
          $$('.bouton-confort').forEach(function (x) { x.setAttribute('aria-pressed', v ? 'true' : 'false'); x.querySelector('span').textContent = v ? 'Mode confort activé' : 'Mode confort'; });
        }
      });
    });
    var r = lire('sessionStorage', 'lns-defilement');
    if (r) {
      effacer('sessionStorage', 'lns-defilement');
      window.addEventListener('load', function () { window.scrollTo(0, parseFloat(r) * d.documentElement.scrollHeight); });
    }
  }

  /* ------------------------------------------------------------ Menu mobile */
  function initMenu() {
    var b = $('.burger'), m = $('#menu-mobile');
    if (!b || !m) return;
    function fermer() { m.hidden = true; b.setAttribute('aria-expanded', 'false'); }
    b.addEventListener('click', function () {
      var ouvert = b.getAttribute('aria-expanded') === 'true';
      m.hidden = ouvert; b.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
      if (!ouvert) { var a = $('a', m); if (a) a.focus(); }
    });
    $$('a', m).forEach(function (a) { a.addEventListener('click', fermer); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) { fermer(); b.focus(); } });
  }

  /* ------------------------------------------------------------ Visuels */
  var ICONES = {
    mains: 'M30 24h44a6 6 0 0 1 6 6v58a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6V30a6 6 0 0 1 6-6ZM48 86h8M80 52c10-2 18 2 22 10l6 14M84 66c8 0 12 4 14 10M14 70c6-4 10-4 14 0',
    tablette: 'M36 22h48a6 6 0 0 1 6 6v64a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6ZM56 90h8',
    smartphone: 'M44 16h32a5 5 0 0 1 5 5v78a5 5 0 0 1-5 5H44a5 5 0 0 1-5-5V21a5 5 0 0 1 5-5ZM55 24h10M57 96h6M50 46h20M50 56h14',
    ordinateur: 'M28 32h64v44H28ZM16 86h88l-6 8H22ZM52 54h16',
    enveloppe: 'M20 34h80v52H20ZM20 34l40 30 40-30M20 86l30-26M100 86 70 60',
    bouclier: 'M60 16l34 12v26c0 24-16 40-34 48-18-8-34-24-34-48V28ZM46 58l10 10 20-22',
    fenetre: 'M30 18h60v84H30ZM60 18v84M30 48h60M36 58h18M36 66h18M36 74h18M66 58h18M66 66h18M66 74h18',
    tasses: 'M18 60h32v14a14 14 0 0 1-14 14h-4a14 14 0 0 1-14-14ZM50 64h5a6 6 0 0 1 0 12h-5M64 60h32v14a14 14 0 0 1-14 14h-4a14 14 0 0 1-14-14ZM34 50c-3-5 3-8 0-13M80 50c-3-5 3-8 0-13M10 96h100',
    porte: 'M36 106V18h48v88M26 106h68M74 62h3M84 30l18-8M84 50h20',
    carnet: 'M32 18h56v86H32ZM42 18v86M52 38h26M52 50h26M52 62h18M70 80l16-16 6 6-16 16h-6Z',
    appel: 'M34 26c-8 8-8 22 4 38s30 28 42 30c6 1 10-3 12-8l-14-10-8 6c-8-4-16-12-20-20l6-8-10-14c-4 1-8 3-12 6Z',
    rue: 'M10 104V46h24v58M34 104V30h30v74M64 104V54h22v50M86 104V38h24v66M16 58h12M16 74h12M40 44h18M40 62h18M40 80h18M70 66h10M92 52h12M92 70h12',
    groupe: 'M16 88h88M26 88v16M94 88v16M36 62a10 10 0 1 1 0-.1ZM60 56a10 10 0 1 1 0-.1ZM84 62a10 10 0 1 1 0-.1ZM22 88c0-10 6-14 14-14s14 4 14 14M46 82c0-10 6-14 14-14s14 4 14 14M70 88c0-10 6-14 14-14s14 4 14 14',
    fauteuil: 'M32 60V36a10 10 0 0 1 10-10h36a10 10 0 0 1 10 10v24M22 60h76v22H22ZM28 82v18M92 82v18M48 48h24',
    agenda: 'M22 28h76v70H22ZM22 46h76M40 18v18M80 18v18M34 60h12M54 60h12M74 60h12M34 76h12M54 76h12',
    portrait: 'M60 26a18 18 0 1 1-.1 0ZM26 104c4-22 18-32 34-32s30 10 34 32',
    aube: 'M38 106V18h44v88M38 18l-14 10v78M86 46l20-10M88 64h22M86 82l20 10M10 106h100',
    silhouette: 'M60 18a9 9 0 1 1-.1 0ZM60 38v30M60 44l-14 18M60 44l14 14M60 68l-12 34M60 68l14 32M20 104h80',
    chaises: 'M60 26a34 34 0 1 1-.1 0ZM58 18h4M58 102h4M18 58v4M102 58v4M30 30l3 3M88 88l3 3M88 32l3-3M30 90l3-3',
    port: 'M10 82h100M22 94h76M34 106h52M40 82a20 20 0 0 1 40 0M84 82V36M84 40l16 34H84'
  };
  var IMAGES = window.LNS_IMAGES || {};

  function provisoire(fig) {
    var nom = fig.getAttribute('data-img') || 'visuel';
    var icone = ICONES[fig.getAttribute('data-icone')] || ICONES.tablette;
    var nuit = fig.classList.contains('visuel--nuit');
    var r = hasard(graine(nom));
    var c1 = nuit ? '#143B57' : '#F0DDBF', c2 = nuit ? '#0C2233' : '#DDB58C', raie = nuit ? 'rgba(243,201,164,.16)' : 'rgba(255,240,210,.55)';
    var ang = -30 + r() * 20, x0 = 160 + r() * 120;
    var raies = '';
    for (var i = 0; i < 9; i++) raies += '<rect x="' + (x0 - 40) + '" y="' + (60 + i * 34) + '" width="260" height="15" fill="' + raie + '"/>';
    var y1 = 80 + r() * 120, y2 = 300 + r() * 120;
    var fil = 'M-20 ' + y1.toFixed(0) + 'C' + (90 + r() * 60).toFixed(0) + ' ' + (y1 + 120).toFixed(0) + ' ' + (220 + r() * 60).toFixed(0) + ' ' + (y2 - 160).toFixed(0) + ' 420 ' + y2.toFixed(0);
    var source = fig.getAttribute('data-source') === 'S' ? 'Photo du site à venir' : 'Visuel provisoire';
    var dedans = $('.visuel__dedans', fig) || fig;
    dedans.innerHTML = '<div class="visuel__provisoire" aria-hidden="true">' +
      '<svg class="ph-fond" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g-' + nom + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
      '<rect width="400" height="500" fill="url(#g-' + nom + ')"/><g transform="rotate(' + ang.toFixed(1) + ' 200 250)" style="filter:blur(3px)">' + raies + '</g>' +
      '<path d="' + fil + '" fill="none" stroke="#B5452A" stroke-width="2.5" stroke-linecap="round" opacity=".85"/></svg>' +
      '<svg class="ph-icone" viewBox="0 0 120 120"><path d="' + icone + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<span class="visuel__etiquette" aria-hidden="true">' + source + ' · <b>' + nom + '</b></span>';
  }

  function photo(fig) {
    var nom = fig.getAttribute('data-img'), tailles = IMAGES[nom];
    if (!tailles) return false;
    var mob = fig.getAttribute('data-img-mobile'), tMob = mob && IMAGES[mob];
    var alt = fig.getAttribute('aria-label') || '';
    var srcset = function (n, t) { return t.map(function (w) { return 'assets/img/' + n + '-' + w + '.webp ' + w + 'w'; }).join(', '); };
    var html = '<picture>' + (tMob ? '<source media="(max-width: 700px)" srcset="' + srcset(mob, tMob) + '" sizes="100vw">' : '') +
      '<img src="assets/img/' + nom + '-' + tailles[0] + '.webp" srcset="' + srcset(nom, tailles) + '" sizes="(max-width: 900px) 100vw, 50vw" alt="' + alt.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async"></picture>';
    var dedans = $('.visuel__dedans', fig) || fig;
    dedans.innerHTML = html;
    fig.removeAttribute('role'); fig.removeAttribute('aria-label');
    var img = $('img', fig);
    if (fig.closest('.heros, .heros-page')) img.loading = 'eager';
    img.addEventListener('load', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }, { once: true });
    return true;
  }

  function initVisuels() {
    $$('.visuel[data-img]').forEach(function (f) { if (!photo(f)) provisoire(f); });
    $$('[data-logo]').forEach(function (t) {
      var n = t.getAttribute('data-logo'), tl = IMAGES[n];
      if (!tl) return;
      t.innerHTML = '<img src="assets/img/' + n + '-' + tl[0] + '.webp" alt="" style="width:76%;height:auto;position:relative;z-index:1">';
      t.classList.add('tampon--logo');
    });
  }

  /* ------------------------------------------------------------ Étapes : copies pour le téléphone */
  function initEtapesCopies() {
    var pile = $$('.etapes__pile .visuel'), etapes = $$('.etape');
    etapes.forEach(function (li, k) {
      if (!pile[k]) return;
      var c = pile[k].cloneNode(true);
      c.classList.remove('visuel--cadre', 'actif');
      li.insertBefore(c, li.firstChild);
    });
  }

  /* ------------------------------------------------------------ Copier */
  function initCopier() {
    $$('[data-copier]').forEach(function (b) {
      b.addEventListener('click', function () {
        var txt = b.getAttribute('data-copier');
        var montrer = function (m) { var o = b.textContent; b.textContent = m; setTimeout(function () { b.textContent = o === m ? 'Copier' : o; }, 1800); };
        var selectionner = function () {
          var v = b.parentNode.querySelector('.coord__valeur');
          if (v) { var s = window.getSelection(); s.removeAllRanges(); var rg = d.createRange(); rg.selectNodeContents(v); s.addRange(rg); }
          montrer('Sélectionné');
        };
        try {
          navigator.clipboard.writeText(txt).then(function () { montrer('Copié'); }, selectionner);
        } catch (e) { selectionner(); }
      });
    });
  }

  /* ------------------------------------------------------------ Formulaire de rendez-vous */
  function initFormulaire() {
    var f = $('[data-formulaire]');
    $$('[data-pour]').forEach(function (a) {
      a.addEventListener('click', function () {
        var v = a.getAttribute('data-pour');
        if (f) { var r = $('input[name="pour"][value="' + v + '"]', f); if (r) r.checked = true; }
        else stocker('sessionStorage', 'lns-pour', v);
      });
    });
    if (!f) return;
    var memo = lire('sessionStorage', 'lns-pour');
    if (memo) { effacer('sessionStorage', 'lns-pour'); var rr = $('input[name="pour"][value="' + memo + '"]', f); if (rr) rr.checked = true; }

    var pas = 1, etapes = $$('.etape-form', f), suiv = $('[data-form-suivant]', f), ret = $('[data-form-retour]', f);
    var nav = $('[data-form-nav]', f), conf = $('[data-confirmation]', f), err = $('[data-form-erreur]', f), annonce = $('[data-form-annonce]', f);
    var avance = $('.progression .avance', f), cercles = $$('.progression circle', f);
    var long = avance.getTotalLength();
    avance.style.strokeDasharray = long; avance.style.strokeDashoffset = long;

    function montrer(n) {
      pas = n;
      etapes.forEach(function (e) { e.hidden = +e.getAttribute('data-pas') !== n; });
      ret.hidden = n === 1;
      suiv.textContent = n === 3 ? 'Envoyer ma demande' : 'Continuer';
      avance.style.strokeDashoffset = long * (1 - (n - 1) / 2);
      cercles.forEach(function (c, i) { c.classList.toggle('fait', i < n); });
      annonce.textContent = 'Étape ' + n + ' sur 3';
      var cible = $('.etape-form:not([hidden]) legend', f);
      if (cible) { cible.setAttribute('tabindex', '-1'); cible.focus({ preventScroll: true }); }
    }
    suiv.addEventListener('click', function () {
      if (pas < 3) { montrer(pas + 1); return; }
      var nom = f.elements.nom.value.trim(), tel = f.elements.tel.value.replace(/\D/g, '');
      if (!nom || tel.length < 10) {
        err.textContent = !nom ? 'Indiquez votre nom pour que Florent sache qui rappeler.' : 'Indiquez un numéro de téléphone à 10 chiffres, par exemple 06 12 34 56 78.';
        err.hidden = false;
        (!nom ? f.elements.nom : f.elements.tel).focus();
        return;
      }
      err.hidden = true;
      var moment = (f.querySelector('input[name="moment"]:checked') || {}).value;
      var quand = moment === 'matin' ? 'en matinée' : moment === 'apres-midi' ? "dans l'après-midi" : 'dès que possible';
      $('[data-confirmation-texte]', f).textContent = 'Florent vous rappelle ' + quand + ' au ' + f.elements.tel.value.trim() + ' pour fixer la visite découverte gratuite.';
      etapes.forEach(function (e) { e.hidden = true; });
      nav.hidden = true; conf.hidden = false;
      cercles.forEach(function (c) { c.classList.add('fait'); }); avance.style.strokeDashoffset = 0;
      conf.focus();
    });
    ret.addEventListener('click', function () { if (pas > 1) montrer(pas - 1); });
    $('[data-form-recommencer]', f).addEventListener('click', function () { f.reset(); conf.hidden = true; nav.hidden = false; montrer(1); });
    f.addEventListener('submit', function (e) { e.preventDefault(); });
    montrer(1);
    if (d.activeElement && d.activeElement.closest && d.activeElement.closest('legend')) d.activeElement.blur();
  }

  /* ------------------------------------------------------------ Simulateur */
  var euros = function (v) { return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(v) + ' €'; };
  function initCalculateurs() {
    $$('[data-calc]').forEach(function (c) {
      var range = $('input[type="range"]', c), out = $('output', c), radios = $$('input[type="radio"]', c), raccourcis = $$('[data-heures]', c);
      var paye = $('[data-calc-paye]', c), credit = $('[data-calc-credit]', c), reel = $('[data-calc-reel]', c), forfait = $('[data-calc-forfait]', c), alerte = $('[data-calc-alerte]', c);
      var etat = { reel: 150 };
      function maj(anime) {
        var taux = +(c.querySelector('input[type="radio"]:checked') || radios[0]).value, h = +range.value;
        var cout = taux * h, cr = Math.min(cout, 3000) * 0.5, r = cout - cr;
        out.textContent = h + (h > 1 ? ' heures' : ' heure');
        paye.textContent = euros(cout); credit.textContent = '− ' + euros(cr);
        alerte.hidden = cout <= 3000;
        forfait.textContent = taux === 30 && h === 10 ? 'Forfait Sérénité' : taux === 30 && h === 20 ? 'Forfait Prestige' : taux === 15 ? 'Tarif solidaire' : 'Tarif standard';
        raccourcis.forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-heures') === h ? 'true' : 'false'); });
        if (anime && avecGsap && !calme) {
          G.to(etat, { reel: r, duration: .5, ease: 'power2.out', onUpdate: function () { reel.textContent = euros(Math.round(etat.reel * 100) / 100); } });
        } else { etat.reel = r; reel.textContent = euros(r); }
      }
      range.addEventListener('input', function () { maj(true); });
      radios.forEach(function (r) { r.addEventListener('change', function () { maj(true); }); });
      raccourcis.forEach(function (b) { b.addEventListener('click', function () { range.value = b.getAttribute('data-heures'); maj(true); }); });
      maj(false);
    });
  }

  /* ------------------------------------------------------------ Filtre des services */
  function initFiltre() {
    var boutons = $$('[data-filtre]'), cartes = $$('.service'), annonce = $('[data-filtre-annonce]');
    if (!boutons.length) return;
    boutons.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filtre');
        boutons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var etat = (avecGsap && window.Flip && !calme) ? Flip.getState(cartes) : null;
        var n = 0;
        cartes.forEach(function (c) { var ok = f === 'tout' || (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1; c.hidden = !ok; if (ok) n++; });
        if (etat) {
          Flip.from(etat, { duration: .6, ease: 'power2.inOut', absolute: true, scale: true,
            onEnter: function (e) { return G.fromTo(e, { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .5 }); },
            onLeave: function (e) { return G.to(e, { opacity: 0, scale: .92, duration: .35 }); },
            onComplete: function () { ST.refresh(); } });
        } else if (avecGsap) { ST.refresh(); }
        if (annonce) annonce.textContent = n + (n > 1 ? ' services affichés' : ' service affiché');
      });
    });
  }

  /* ------------------------------------------------------------ Carte brodée */
  var ZONES = [
    { id: 'nord', cx: 272, cy: 104, rx: 118, ry: 72, t: 'Nord', s: '13e – 16e' },
    { id: 'centre', cx: 205, cy: 238, rx: 66, ry: 52, t: 'Centre', s: '1er – 6e' },
    { id: 'septieme', cx: 150, cy: 322, rx: 34, ry: 30, t: '7e', s: '' },
    { id: 'sud', cx: 300, cy: 364, rx: 92, ry: 52, t: 'Sud', s: '8e – 9e' },
    { id: 'est', cx: 418, cy: 240, rx: 82, ry: 68, t: 'Est', s: '10e – 12e' },
    { id: 'voisines', cx: 478, cy: 92, rx: 64, ry: 44, t: 'Allauch', s: 'Plan-de-Cuques', v: true },
    { id: 'voisines', cx: 546, cy: 362, rx: 44, ry: 58, t: 'Aubagne', s: '', v: true }
  ];
  function blob(z) {
    var r = hasard(graine(z.t)), n = 9, pts = [];
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, k = .9 + r() * .18; pts.push([z.cx + Math.cos(a) * z.rx * k, z.cy + Math.sin(a) * z.ry * k]); }
    var p = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var j = 0; j < n; j++) {
      var p0 = pts[(j - 1 + n) % n], p1 = pts[j], p2 = pts[(j + 1) % n], p3 = pts[(j + 2) % n];
      p += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return p + 'Z';
  }
  function initCarte() {
    var svg = $('[data-carte]');
    if (!svg) return;
    el('path', { class: 'mer', d: 'M0 0H64C84 80 74 150 112 200C132 228 104 262 120 300C136 342 172 382 232 402C302 424 384 444 470 470H0Z' }, svg);
    el('path', { class: 'cote', d: 'M64 0C84 80 74 150 112 200C132 228 104 262 120 300C136 342 172 382 232 402C302 424 384 444 470 470' }, svg);
    var mer = el('text', { class: 'mer-nom', x: 26, y: 420, transform: 'rotate(-18 26 420)' }, svg); mer.textContent = 'Mer Méditerranée';
    var groupes = {};
    ZONES.forEach(function (z) {
      var g = groupes[z.id] || (groupes[z.id] = el('g', { class: 'zone', 'data-zone': z.id }, svg));
      var p = el('path', { class: 'zone-fond' + (z.v ? ' voisine' : ''), d: blob(z) }, g);
      var points = el('g', { class: z.v ? 'voisine-points' : '' }, g);
      var L = p.getTotalLength();
      for (var s = 0; s < L; s += 12) {
        var a = p.getPointAtLength(s), b = p.getPointAtLength(Math.min(L, s + 6.5));
        el('line', { class: 'point', x1: a.x.toFixed(1), y1: a.y.toFixed(1), x2: b.x.toFixed(1), y2: b.y.toFixed(1) }, points);
      }
      var t = el('text', { x: z.cx, y: z.cy + (z.s ? -2 : 5), 'text-anchor': 'middle' }, g); t.textContent = z.t;
      if (z.s) { var u = el('text', { class: 'petit', x: z.cx, y: z.cy + 16, 'text-anchor': 'middle' }, g); u.textContent = z.s; }
    });
    var vp = el('g', {}, svg);
    el('circle', { cx: 122, cy: 258, r: 5, fill: '#B5452A' }, vp);
    var vt = el('text', { class: 'petit', x: 112, y: 280, 'text-anchor': 'end' }, vp); vt.textContent = 'Vieux-Port';
    var boutons = $$('[data-zone]').filter(function (b) { return b.tagName === 'BUTTON'; });
    function activer(id, fixe) {
      $$('g.zone', svg).forEach(function (g) { g.classList.toggle('actif', g.getAttribute('data-zone') === id); });
      if (fixe !== undefined) boutons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-zone') === id && fixe ? 'true' : 'false'); });
    }
    var fixe = null;
    boutons.forEach(function (b) {
      var id = b.getAttribute('data-zone');
      b.addEventListener('mouseenter', function () { activer(id); });
      b.addEventListener('mouseleave', function () { activer(fixe); });
      b.addEventListener('click', function () { fixe = fixe === id ? null : id; activer(fixe, !!fixe); });
    });
    $$('g.zone', svg).forEach(function (g) {
      g.addEventListener('mouseenter', function () { activer(g.getAttribute('data-zone')); });
      g.addEventListener('mouseleave', function () { activer(fixe); });
    });
    svg._points = $$('.point', svg);
  }

  /* ================================================================ ANIMATIONS (GSAP) */

  /* ---------- Le fil global ---------- */
  var fil = null;
  function initFil() {
    var sections = $$('[data-fil-section]');
    if (!sections.length) return;
    var svg = el('svg', { class: 'fil-global', 'aria-hidden': 'true', focusable: 'false' });
    var ombre = el('path', { class: 'fil-global__ombre' }, svg);
    var trace = el('path', { class: 'fil-global__trace' }, svg);
    var gNoeuds = el('g', {}, svg);
    var aiguille = el('g', { class: 'aiguille' }, svg);
    el('line', { x1: -22, y1: 0, x2: 6, y2: 0 }, aiguille);
    el('ellipse', { cx: -17, cy: 0, rx: 3.2, ry: 1.4 }, aiguille);
    d.body.appendChild(svg);
    fil = { svg: svg, trace: trace, ombre: ombre, aiguille: aiguille, noeuds: [], total: 0, ys: [], xs: [], ls: [] };

    function construire() {
      var W = d.documentElement.clientWidth, H = d.body.offsetHeight, sy = window.scrollY;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.height = H + 'px';
      var env = $('.enveloppe'), cs = getComputedStyle(env);
      var marge = Math.max(0, (W - Math.min(W, parseFloat(cs.maxWidth) || 1320)) / 2), goutt = parseFloat(cs.paddingLeft) || 20;
      var xG = marge + goutt * (W < 700 ? .38 : .42), xD = W - xG, onde = Math.max(5, Math.min(14, W * .009));
      var X = function (s) { return s === 'gauche' ? xG : s === 'centre' ? W / 2 : xD; };
      var rect = function (e) { var r = e.getBoundingClientRect(); return { t: r.top + sy, b: r.bottom + sy, l: r.left, r: r.right }; };
      var p, cx, cy, depart = $('[data-lien]');
      if (depart) {
        var m = depart.getScreenCTM(), pt = depart.ownerSVGElement.createSVGPoint();
        var anime = !calme && window.MorphSVGPlugin;
        pt.x = anime ? 596 : 204; pt.y = anime ? 88 : 82;
        var q = pt.matrixTransform(m); cx = q.x; cy = q.y + sy;
      } else { var r0 = rect(sections[0]); cx = X(sections[0].getAttribute('data-fil-section')); cy = r0.t + 30; }
      p = 'M' + cx.toFixed(1) + ' ' + cy.toFixed(1);
      sections.forEach(function (s, i) {
        var r = rect(s), x = X(s.getAttribute('data-fil-section'));
        var haut = i === 0 && depart ? Math.max(cy + 80, r.t + 60) : r.t + 50, bas = r.b - 50;
        var k = (haut - cy) * .55;
        if (i === 0 && depart) p += 'C' + (cx + 160) + ' ' + cy + ' ' + x + ' ' + (haut - k) + ' ' + x + ' ' + haut;
        else p += 'C' + cx + ' ' + (cy + k) + ' ' + x + ' ' + (haut - k) + ' ' + x + ' ' + haut;
        var fin = s.querySelector('[data-fil-fin]');
        if (fin) {
          var rf = rect(fin), yf = rf.b - 2, xa = rf.l, xb = rf.r;
          var kk = (yf - haut) * .5;
          p += 'C' + x + ' ' + (haut + kk) + ' ' + (xa - 60) + ' ' + yf + ' ' + xa + ' ' + yf;
          p += 'C' + (xa + (xb - xa) * .33) + ' ' + (yf + 6) + ' ' + (xa + (xb - xa) * .66) + ' ' + (yf - 6) + ' ' + xb + ' ' + yf;
          p += 'C' + (xb + 12) + ' ' + (yf - 30) + ' ' + (xb + 38) + ' ' + (yf - 16) + ' ' + (xb + 24) + ' ' + (yf - 2) + 'S' + (xb + 4) + ' ' + (yf - 10) + ' ' + (xb + 20) + ' ' + (yf - 18) + 'L' + (xb + 50) + ' ' + (yf - 4);
          cx = xb + 50; cy = yf - 4; return;
        }
        var sens = x < W / 2 ? 1 : -1, h = bas - haut;
        if (h > 40) p += 'C' + (x + onde * sens) + ' ' + (haut + h * .33) + ' ' + (x - onde * sens) + ' ' + (haut + h * .66) + ' ' + x + ' ' + bas;
        cx = x; cy = Math.max(bas, haut);
      });
      trace.setAttribute('d', p); ombre.setAttribute('d', p);
      var L = trace.getTotalLength(); fil.total = L;
      var ys = [], xs = [], ls = [], maxY = -1e9;
      for (var s = 0; s <= L; s += 8) { var q2 = trace.getPointAtLength(s); maxY = Math.max(maxY, q2.y); ys.push(maxY); xs.push(q2.x); ls.push(s); }
      fil.ys = ys; fil.xs = xs; fil.ls = ls;
      trace.style.strokeDasharray = L + ' ' + L; ombre.style.strokeDasharray = L + ' ' + L;
      // nœuds sur les étapes
      gNoeuds.innerHTML = ''; fil.noeuds = [];
      $$('[data-noeuds] .etape').forEach(function (et) {
        var yk = rect(et).t + 34, i = indice(yk), xk = xs[i] || xD;
        var dk = 'M' + xk + ' ' + (yk - 22) + 'C' + (xk + 22) + ' ' + (yk - 16) + ' ' + (xk + 18) + ' ' + (yk + 14) + ' ' + xk + ' ' + (yk + 9) + 'S' + (xk - 18) + ' ' + (yk - 12) + ' ' + xk + ' ' + (yk - 6) + 'S' + (xk + 9) + ' ' + (yk + 18) + ' ' + xk + ' ' + (yk + 22);
        var n = el('path', { class: 'fil-global__noeud', d: dk }, gNoeuds);
        var ln = n.getTotalLength(); n.style.strokeDasharray = ln; n.style.strokeDashoffset = calme ? 0 : ln;
        n.style.transformOrigin = xk + 'px ' + yk + 'px'; n.style.transformBox = 'view-box';
        fil.noeuds.push({ el: n, y: yk, l: ln, fait: calme });
      });
      dessiner();
    }
    function indice(y) { var a = 0, b = fil.ys.length - 1; while (a < b) { var m = (a + b) >> 1; if (fil.ys[m] < y) a = m + 1; else b = m; } return a; }
    function dessiner() {
      if (!fil.total) return;
      if (calme) { trace.style.strokeDashoffset = 0; ombre.style.strokeDashoffset = 0; aiguille.style.display = 'none'; return; }
      var cible = window.scrollY + window.innerHeight * .72, i = indice(cible), l = fil.ls[i] || 0;
      if (cible > fil.ys[fil.ys.length - 1]) l = fil.total;
      trace.style.strokeDashoffset = fil.total - l; ombre.style.strokeDashoffset = fil.total - l;
      var j = Math.max(0, i - 2), x = fil.xs[i], y = fil.ys[i];
      var ang = Math.atan2(y - fil.ys[j], x - fil.xs[j]) * 180 / Math.PI;
      aiguille.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (isFinite(ang) ? ang.toFixed(1) : 90) + ')');
      aiguille.style.opacity = l >= fil.total - 2 ? 0 : 1;
      fil.noeuds.forEach(function (n) {
        var doit = cible > n.y;
        if (doit !== n.fait) {
          n.fait = doit;
          G.to(n.el, { strokeDashoffset: doit ? 0 : n.l, duration: doit ? .9 : .3, ease: 'power2.out' });
          if (doit) G.fromTo(n.el, { scale: 1.5 }, { scale: 1, duration: 1, ease: 'elastic.out(1, .5)' });
        }
      });
    }
    fil.construire = construire; fil.dessiner = dessiner;
    ST.addEventListener('refresh', construire);
    if (lenis) lenis.on('scroll', dessiner); else window.addEventListener('scroll', function () { requestAnimationFrame(dessiner); }, { passive: true });
    var minuterie;
    if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(minuterie); minuterie = setTimeout(construire, 180); }).observe(d.body);
    construire();
  }

  /* ---------- Fil-curseur ---------- */
  function initCorde() {
    if (calme || !pointeurFin) return;
    var cv = d.createElement('canvas'); cv.className = 'fil-curseur'; cv.setAttribute('aria-hidden', 'true'); d.body.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
    var N = 20, SEG = 8, P = [], souris = { x: -100, y: -100, vu: false }, crochet = null, derniere = 0, opa = 0;
    for (var i = 0; i < N; i++) P.push({ x: -100, y: -100 + i * SEG, ox: -100, oy: -100 + i * SEG });
    function taille() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    taille(); window.addEventListener('resize', taille);
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!souris.vu) { P.forEach(function (p, k) { p.x = p.ox = e.clientX; p.y = p.oy = e.clientY + k * SEG; }); }
      souris.x = e.clientX; souris.y = e.clientY; souris.vu = true; derniere = performance.now();
    }, { passive: true });
    d.addEventListener('mouseleave', function () { souris.vu = false; });
    var trait = couleur('--terre');
    G.ticker.add(function () {
      var t = performance.now(), actif = souris.vu && t - derniere < 5000;
      opa += ((actif ? 1 : 0) - opa) * .08;
      if (opa < .01) { ctx.clearRect(0, 0, cv.width, cv.height); return; }
      P[0].x = souris.x + 2; P[0].y = souris.y + 14;
      for (var i = 1; i < N; i++) { var p = P[i], vx = (p.x - p.ox) * .965, vy = (p.y - p.oy) * .965; p.ox = p.x; p.oy = p.y; p.x += vx; p.y += vy + .42; }
      if (crochet) { var r = crochet.getBoundingClientRect(); var fx = r.left + 10, fy = r.top + r.height / 2; P[N - 1].x += (fx - P[N - 1].x) * .35; P[N - 1].y += (fy - P[N - 1].y) * .35; }
      for (var it = 0; it < 6; it++) {
        for (var j = 0; j < N - 1; j++) {
          var a = P[j], b = P[j + 1], dx = b.x - a.x, dy = b.y - a.y, dist = Math.sqrt(dx * dx + dy * dy) || .001, diff = (dist - SEG) / dist;
          if (j === 0) { b.x -= dx * diff; b.y -= dy * diff; } else { a.x += dx * diff * .5; a.y += dy * diff * .5; b.x -= dx * diff * .5; b.y -= dy * diff * .5; }
        }
        P[0].x = souris.x + 2; P[0].y = souris.y + 14;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalAlpha = opa * .9; ctx.strokeStyle = trait; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(P[0].x, P[0].y);
      for (var k = 1; k < N - 1; k++) { var mx = (P[k].x + P[k + 1].x) / 2, my = (P[k].y + P[k + 1].y) / 2; ctx.quadraticCurveTo(P[k].x, P[k].y, mx, my); }
      ctx.lineTo(P[N - 1].x, P[N - 1].y); ctx.stroke();
    });
    $$('.magnetique').forEach(function (b) {
      var qx = G.quickTo(b, 'x', { duration: .45, ease: 'power3.out' }), qy = G.quickTo(b, 'y', { duration: .45, ease: 'power3.out' });
      b.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .22); qy((e.clientY - r.top - r.height / 2) * .32); crochet = b; });
      b.addEventListener('pointerleave', function () { qx(0); qy(0); crochet = null; });
    });
  }

  /* ---------- Prix coupé en deux ---------- */
  function couperPrix(pc, delai) {
    var avant = $('.prix-coupe__avant', pc), haut = $('.prix-coupe__moitie--haut', pc), bas = $('.prix-coupe__moitie--bas', pc), trait = $('.prix-coupe__trait', pc), apres = $('.prix-coupe__apres', pc);
    pc.classList.add('anime');
    var encre = couleur('--encre'), douce = couleur('--encre-douce');
    G.set(avant, { scale: 1.6, color: encre });
    G.set(apres, { opacity: 0, x: -10 });
    G.set(trait, { scaleX: 0, rotation: -14, opacity: 1 });
    var tl = G.timeline({ delay: delai || 0, paused: true });
    tl.to(trait, { scaleX: 1, duration: .38, ease: 'power3.in' })
      .set(bas, { visibility: 'visible' })
      .set(haut, { clipPath: 'inset(0 0 48% 0)' })
      .to(bas, { y: 46, rotation: 14, opacity: 0, duration: .7, ease: 'power2.in' })
      .to(avant, { scale: 1, color: douce, duration: .45, ease: 'power3.inOut' }, '-=.35')
      .set(haut, { clipPath: 'inset(0 0 0% 0)' })
      .to(apres, { opacity: 1, x: 0, duration: .55, ease: 'back.out(2)' }, '-=.2');
    return tl;
  }
  function initPrix() {
    $$('[data-prix-coupe]').forEach(function (pc) {
      if (pc.closest('.heros')) return; // déclenché par l'ouverture
      var tl = couperPrix(pc);
      ST.create({ trigger: pc, start: 'top 82%', once: true, onEnter: function () { tl.play(); } });
    });
  }

  /* ---------- Ouverture de l'accueil ---------- */
  function ouverture() {
    var lien = $('[data-lien]');
    if (!lien) return;
    var point = $('[data-lien-point]'), titre = $('.heros__titre'), visuel = $('.heros__visuel .visuel'), tampon = $('.heros__tampon');
    var pc = $('.heros [data-prix-coupe]');
    var L = lien.getTotalLength();
    G.set(lien, { strokeDasharray: L, strokeDashoffset: L });
    G.set(point, { scale: 0, transformOrigin: '50% 50%' });
    var sp = SplitText.create(titre, { type: 'words', mask: 'words' });
    G.set(sp.words, { yPercent: 115 });
    G.set(['.heros .surtitre', '.heros__chapo', '.heros .actions', '.heros__prix'], { opacity: 0, y: 18 });
    G.set(visuel, { clipPath: 'polygon(0% 0%, 0% 0%, -30% 100%, -30% 100%)' });
    G.set(tampon, { scale: 0, rotation: -40 });
    var tlp = pc ? couperPrix(pc) : null;
    var tl = G.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.heros .surtitre', { opacity: 1, y: 0, duration: .5 }, .1)
      .to(lien, { strokeDashoffset: 0, duration: 1.05, ease: 'power1.inOut' }, .15)
      .to(point, { scale: 1, duration: .3, ease: 'back.out(3)' }, .72)
      .to(visuel, { clipPath: 'polygon(0% 0%, 130% 0%, 100% 100%, -30% 100%)', duration: 1.1, ease: 'power3.inOut' }, .55)
      .to(sp.words, { yPercent: 0, duration: .85, stagger: .045 }, .95)
      .to(point, { scale: 0, duration: .2 }, 1.2)
      .set(lien, { strokeDasharray: 'none' }, 1.2)
      .to(lien, { morphSVG: 'M8 88C150 92 350 84 596 88', duration: .75, ease: 'power2.inOut' }, 1.2)
      .to(['.heros__chapo', '.heros .actions', '.heros__prix'], { opacity: 1, y: 0, duration: .6, stagger: .08 }, 1.45)
      .to(tampon, { scale: 1, rotation: -10, duration: .7, ease: 'back.out(2.2)' }, 1.75);
    if (tlp) tl.add(function () { tlp.play(); }, 1.9);
    var image = $('.heros__visuel .visuel__dedans');
    if (image) G.to(image, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.heros', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Titres de section ---------- */
  function initTitres() {
    $$('[data-titre-anime]').forEach(function (t) {
      SplitText.create(t, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: function (self) {
        return G.from(self.lines, { yPercent: 105, duration: .95, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 86%', once: true } });
      } });
    });
    $$('.tete-section .chapo, .tete-section .surtitre').forEach(function (c) {
      G.from(c, { opacity: 0, y: 18, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
    });
  }

  /* ---------- Révélation des visuels et parallaxe ---------- */
  function initVisuelsAnimes() {
    $$('.visuel').forEach(function (v) {
      if (v.closest('.heros, .etapes__pile, .etiquette, .service') || v.closest('.heros-page')) return;
      G.from(v, { clipPath: 'inset(14% 6% 14% 6%)', duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: v, start: 'top 88%', once: true } });
    });
    $$('.engagements__visuel .visuel, .zone__rue .visuel, .structures__visuel .visuel, .final-r .visuel').forEach(function (v) {
      var dd = $('.visuel__dedans', v); if (!dd) return;
      dd.style.inset = '-9% 0';
      G.fromTo(dd, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: v, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.heros-page .visuel').forEach(function (v) {
      G.from(v, { clipPath: 'polygon(0% 0%, 0% 0%, -30% 100%, -30% 100%)', duration: 1.3, ease: 'power3.inOut', delay: .2 });
    });
  }

  /* ---------- Repères ---------- */
  function initReperes() {
    var c = $('[data-compteur]');
    if (!c) return;
    var pts = $('[data-points]'), n = +pts.getAttribute('data-points');
    for (var i = 0; i < n; i++) pts.appendChild(d.createElement('i'));
    var cible = +c.getAttribute('data-compteur'), o = { v: 0 };
    var tl = G.timeline({ paused: true });
    tl.to(o, { v: cible, duration: 1.8, ease: 'power2.out', onUpdate: function () { c.textContent = Math.round(o.v); } }, 0)
      .from($$('i', pts), { scaleX: 0, opacity: 0, duration: .25, stagger: 1.5 / n, ease: 'power1.out' }, 0);
    ST.create({ trigger: c, start: 'top 85%', once: true, onEnter: function () { tl.play(); } });
    G.from('.reperes__liste li', { y: 40, opacity: 0, rotation: -2, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.reperes__liste', start: 'top 85%', once: true } });
  }

  /* ---------- Galerie horizontale et étiquettes ---------- */
  function initGalerie() {
    var g = $('[data-galerie]');
    if (g && !calme) {
      var mm = G.matchMedia();
      mm.add('(min-width: 1024px)', function () {
        g.classList.add('horizontale');
        var piste = $('.galerie__piste', g);
        var dist = function () { var gauche = piste.getBoundingClientRect().left - g.getBoundingClientRect().left - (G.getProperty(piste, 'x') || 0); return Math.max(0, piste.scrollWidth - (g.clientWidth - gauche)); };
        G.to(piste, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: g, start: 'center 54%', end: function () { return '+=' + dist(); }, pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1 } });
        return function () { g.classList.remove('horizontale'); G.set(piste, { clearProps: 'x' }); };
      });
    }
    $$('[data-incline]').forEach(function (c) {
      var svg = el('svg', { class: 'etiquette__contour', 'aria-hidden': 'true' }, c);
      var r = el('rect', { x: 1, y: 1, rx: 8, width: '100%', height: '100%' }, svg);
      var per = function () { var b = c.getBoundingClientRect(); return 2 * (b.width + b.height) + 40; };
      G.set(r, { strokeDasharray: 3000, strokeDashoffset: 3000 });
      if (!pointeurFin || calme) return;
      var rx = G.quickTo(c, 'rotationX', { duration: .5, ease: 'power3.out' }), ry = G.quickTo(c, 'rotationY', { duration: .5, ease: 'power3.out' });
      G.set(c, { transformPerspective: 900 });
      c.addEventListener('pointerenter', function () { var p = per(); G.fromTo(r, { strokeDasharray: p, strokeDashoffset: p }, { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }); });
      c.addEventListener('pointermove', function (e) { var b = c.getBoundingClientRect(); ry(((e.clientX - b.left) / b.width - .5) * 10); rx(-((e.clientY - b.top) / b.height - .5) * 8); });
      c.addEventListener('pointerleave', function () { rx(0); ry(0); G.to(r, { strokeDashoffset: per(), duration: .5 }); });
    });
  }

  /* ---------- Florent ---------- */
  function initFlorent() {
    var ligne = $('.frise__ligne i');
    if (!ligne) return;
    G.fromTo(ligne, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.frise', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    $$('.frise li').forEach(function (li) { ST.create({ trigger: li, start: 'top 66%', onEnter: function () { li.classList.add('atteint'); }, onLeaveBack: function () { li.classList.remove('atteint'); } }); });
    G.from('.valeurs li', { y: 20, opacity: 0, stagger: .07, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: '.valeurs', start: 'top 88%', once: true } });
  }

  /* ---------- Engagements : dessins d'un trait et écho ---------- */
  function initEngagements() {
    $$('.engagement svg path').forEach(function (p) {
      var L = p.getTotalLength(); G.set(p, { strokeDasharray: L, strokeDashoffset: L });
      G.to(p, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: p.closest('.engagement'), start: 'top 85%', once: true } });
    });
    $$('[data-echo]').forEach(function (e) {
      var copies = [], mot = e.textContent;
      for (var i = 0; i < 4; i++) { var c = d.createElement('span'); c.className = 'echo__copie'; c.setAttribute('aria-hidden', 'true'); c.textContent = mot; e.appendChild(c); copies.push(c); }
      G.set(copies, { opacity: 0 });
      var jouer = function () {
        G.timeline().to(copies, { y: function (i) { return -(i + 1) * 0.95 + 'em'; }, opacity: function (i) { return .7 - i * .15; }, duration: .5, stagger: .08, ease: 'power2.out' })
          .to(copies, { y: 0, opacity: 0, duration: .5, stagger: { each: .06, from: 'end' }, ease: 'power2.in' }, '+=.35');
      };
      ST.create({ trigger: e, start: 'top 75%', once: true, onEnter: jouer });
      e.closest('.engagement').addEventListener('pointerenter', jouer);
    });
  }

  /* ---------- Étapes ---------- */
  function initEtapes() {
    var pile = $$('.etapes__pile .visuel'), etapes = $$('.etape');
    if (!pile.length) return;
    var pileEl = $('.etapes__pile'); pileEl.classList.add('pret');
    var activer = function (k) { pile.forEach(function (v, i) { v.classList.toggle('actif', i === k); }); };
    activer(0);
    etapes.forEach(function (li, k) {
      ST.create({ trigger: li, start: 'top 62%', end: 'bottom 38%', onToggle: function (s) { if (s.isActive) activer(k); } });
      G.from(li, { opacity: .25, duration: .6, scrollTrigger: { trigger: li, start: 'top 75%', end: 'top 45%', scrub: true } });
    });
    G.from('.seance li', { x: -24, opacity: 0, stagger: .1, duration: .6, scrollTrigger: { trigger: '.seance', start: 'top 85%', once: true } });
  }

  /* ---------- Carte, avis, tampons, FAQ, crédit ---------- */
  function initCarteAnimee() {
    var svg = $('[data-carte]');
    if (!svg || !svg._points) return;
    G.from(svg._points, { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: .2, stagger: { each: .004 }, ease: 'none', scrollTrigger: { trigger: svg, start: 'top 80%', once: true } });
    G.from($$('text', svg), { opacity: 0, duration: .6, stagger: .05, delay: 1, scrollTrigger: { trigger: svg, start: 'top 80%', once: true } });
  }
  function initAvis() {
    var cartes = $$('.carte-postale');
    if (!cartes.length) return;
    var corde = $('.avis__corde .corde path');
    if (corde) { var L = corde.getTotalLength(); G.fromTo(corde, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: corde, start: 'top 85%', once: true } }); }
    G.from(cartes, { y: -60, opacity: 0, rotation: function (i) { return i % 2 ? 14 : -14; }, duration: 1.1, stagger: .15, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '.avis__cartes', start: 'top 82%', once: true } });
    var quick = cartes.map(function (c) { return G.quickTo(c, 'rotation', { duration: .9, ease: 'elastic.out(1, .35)' }); });
    ST.create({ trigger: '.avis', start: 'top bottom', end: 'bottom top', onUpdate: function (s) {
      var v = Math.max(-7, Math.min(7, s.getVelocity() / 260));
      quick.forEach(function (q, i) { q(v * (i % 2 ? -.8 : 1)); });
      clearTimeout(s._repos); s._repos = setTimeout(function () { quick.forEach(function (q) { q(0); }); }, 120);
    } });
  }
  function initTampons() {
    var t = $$('.tampon');
    if (!t.length) return;
    G.from(t, { scale: 1.7, opacity: 0, duration: .45, stagger: .18, ease: 'power4.in', scrollTrigger: { trigger: '.garanties__grille', start: 'top 82%', once: true },
      onComplete: function () { G.fromTo('.garanties__grille', { x: -3 }, { x: 0, duration: .4, ease: 'elastic.out(1, .3)' }); } });
  }
  function initFaq() {
    $$('.faq details').forEach(function (dt) {
      dt.addEventListener('toggle', function () {
        if (dt.open) G.from($('.faq__reponse', dt), { height: 0, opacity: 0, duration: .45, ease: 'power2.out', clearProps: 'height' });
        setTimeout(function () { ST.refresh(); }, 480);
      });
    });
  }
  function initCredit() {
    var z = $('[data-credit]');
    if (!z) return;
    var p = $('.credit__fil path', z); if (p) { var L = p.getTotalLength(); G.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: z, start: 'top 80%', once: true } }); }
    G.from($$('.credit li', z), { y: 40, opacity: 0, stagger: .2, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: z, start: 'top 80%', once: true } });
  }
  function initListes() {
    [['.engagements__grille .engagement'], ['.cartes-tarifs .carte-tarif'], ['.formats .format'], ['.accomp li'], ['.etapes-r li'], ['.publics li'], ['.services-liste .service']].forEach(function (s) {
      var els = $$(s[0]); if (!els.length) return;
      G.from(els, { y: 36, opacity: 0, duration: .75, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: els[0].parentNode, start: 'top 85%', once: true } });
    });
  }
  function initReinsertion() {
    var n = $('[data-noeud-emmele]');
    if (!n) return;
    G.to(n, { morphSVG: n.getAttribute('data-droit'), ease: 'none', scrollTrigger: { trigger: '.heros-page', start: 'top top+=60', end: 'bottom 30%', scrub: .6 } });
    var L = n.getTotalLength(); G.fromTo(n, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: .3 });
  }

  /* ---------- Lumière de persienne (WebGL) ---------- */
  function initPersienne() {
    var cvs = $$('canvas[data-persienne]');
    if (!cvs.length) return;
    import('./persienne.js').then(function (m) {
      cvs.forEach(function (c) { if (m.lancer(c, c.getAttribute('data-persienne'), calme)) root.classList.add('webgl-ok'); });
    }).catch(function () { /* la version CSS reste affichée */ });
  }

  /* ---------- Défilement fluide ---------- */
  function initDefilement() {
    if (calme || !window.Lenis) return;
    lenis = new Lenis({ lerp: .11, wheelMultiplier: .95, smoothWheel: true });
    window.lnsLenis = lenis;
    lenis.on('scroll', ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
    $$('a[href*="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var url = new URL(a.href, location.href);
        if (url.pathname !== location.pathname || !url.hash) return;
        var cible = d.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!cible) return;
        e.preventDefault();
        lenis.scrollTo(cible, { offset: -(hauteurEntete() + 20), duration: 1.4 });
        history.replaceState(null, '', url.hash);
        setTimeout(function () { cible.setAttribute('tabindex', '-1'); cible.focus({ preventScroll: true }); }, 1400);
      });
    });
  }

  /* ================================================================ Démarrage */
  initConfort(); initMenu(); initEtapesCopies(); initVisuels(); initCopier(); initFormulaire(); initCalculateurs(); initFiltre(); initCarte();
  initPersienne();
  if (!avecGsap) return;
  G.registerPlugin(ST);
  if (window.SplitText) G.registerPlugin(SplitText);
  if (window.MorphSVGPlugin) G.registerPlugin(MorphSVGPlugin);
  if (window.Flip) G.registerPlugin(Flip);

  function demarrer() {
    if (demarrer.fait) return; demarrer.fait = true;
    initDefilement();
    if (!calme) {
      if (window.SplitText) { ouverture(); initTitres(); }
      initVisuelsAnimes(); initReperes(); initGalerie(); initFlorent(); initEngagements(); initEtapes(); initPrix();
      initCarteAnimee(); initAvis(); initTampons(); initFaq(); initCredit(); initListes();
      if (window.MorphSVGPlugin) initReinsertion();
      initCorde();
    } else {
      initGalerie(); initEtapes();
    }
    initFil();
    ST.refresh();
    if (location.hash && d.getElementById(location.hash.slice(1))) {
      setTimeout(function () { var c = d.getElementById(location.hash.slice(1)); if (lenis) lenis.scrollTo(c, { offset: -(hauteurEntete() + 20), immediate: true }); else c.scrollIntoView(); }, 60);
    }
  }
  if (d.fonts && d.fonts.ready) { d.fonts.ready.then(demarrer); setTimeout(demarrer, 1600); } else demarrer();
})();
