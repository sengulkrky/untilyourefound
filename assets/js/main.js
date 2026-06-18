/* =============================================================
   Until you're Found — site interactions
   ============================================================= */
(function () {
  'use strict';

  /* ---------- Footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('top');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 20); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navlinks');
  menuBtn.addEventListener('click', function () { navLinks.classList.toggle('open'); });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { navLinks.classList.remove('open'); });
  });

  /* ---------- Journey: expand on click ---------- */
  document.querySelectorAll('#journey-list .stage').forEach(function (stage) {
    stage.addEventListener('click', function () { stage.classList.toggle('open'); });
  });

  /* ---------- Journey: scroll reveal ---------- */
  var journey = document.getElementById('journey-list');
  if (journey && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    journey.classList.add('reveal');
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { journey.classList.add('in-view'); obs.disconnect(); }
      });
    }, { threshold: 0.25 }).observe(journey);
  }

  /* ---------- Language switch (NL default, EN option) ---------- */
  var LANG_KEY = 'uyf-lang';

  function applyLang(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.nl === undefined) el.dataset.nl = el.innerHTML;
      el.innerHTML = (lang === 'en') ? el.dataset.en : el.dataset.nl;
    });

    document.querySelectorAll('[data-en-ph]').forEach(function (el) {
      if (el.dataset.nlPh === undefined) el.dataset.nlPh = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', (lang === 'en') ? el.dataset.enPh : el.dataset.nlPh);
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    window.__lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  var savedLang = 'nl';
  try { savedLang = localStorage.getItem(LANG_KEY) || 'nl'; } catch (e) {}

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.dataset.lang); });
  });
  applyLang(savedLang);

  /* ---------- Contact form (Web3Forms) ---------- */
  var form = document.getElementById('contactForm');
  if (!form) return;

  function showSuccess() {
    var en = window.__lang === 'en';
    form.querySelector('.form-fields').outerHTML =
      '<div class="form-success">' +
        '<div class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 13l4 4L19 7"/></svg></div>' +
        '<h3>' + (en ? 'Message sent!' : 'Bericht verzonden!') + '</h3>' +
        '<p>' + (en
          ? 'Thanks for reaching out — I\u2019ll get back to you within a day.'
          : 'Bedankt voor je bericht — ik kom binnen een dag bij je terug.') + '</p>' +
      '</div>';
  }

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var en = window.__lang === 'en';
    var btn = form.querySelector('button[type=submit]');
    var key = (form.elements.access_key && form.elements.access_key.value) || '';

    // Demo mode: until a real Web3Forms key is set, just show the thank-you.
    if (!key || key.indexOf('YOUR-') === 0) { showSuccess(); return; }

    var original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = en ? 'Sending\u2026' : 'Versturen\u2026';

    try {
      var res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      var json = await res.json();
      if (json.success) { showSuccess(); }
      else { throw new Error(json.message || 'submit failed'); }
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = original;
      alert(en
        ? 'Sorry, something went wrong sending your message. Please email sengul.krky03@gmail.com directly.'
        : 'Sorry, er ging iets mis bij het versturen. Mail gerust rechtstreeks naar sengul.krky03@gmail.com.');
    }
  });
})();
