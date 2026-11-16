/* Momac Holdings: menu, group map, preview review tools. No dependencies. */
(function () {
  'use strict';

  // --- mobile menu ---------------------------------------------------------
  var toggle = document.getElementById('nav-toggle');
  var header = document.querySelector('header.site');
  function setMenu(open) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) setMenu(false);
    });
  }

  // --- group map: one company open at a time -------------------------------
  // <details name="group"> does this natively in current browsers; this keeps
  // older ones in step.
  var cos = Array.prototype.slice.call(document.querySelectorAll('details.gm-co'));
  cos.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      cos.forEach(function (other) { if (other !== d && other.open) other.open = false; });
    });
  });

  // --- preview review tools (absent from the production build) -------------
  var btn = document.getElementById('sources-toggle');
  if (btn) {
    var root = document.documentElement;
    var panel = document.getElementById('review-panel');
    var tip = document.getElementById('review-tip');
    var facts = Array.prototype.slice.call(document.querySelectorAll('[data-fact]'));
    var gaps = Array.prototype.slice.call(document.querySelectorAll('[data-tbd]'));
    panel.querySelector('[data-count=facts]').textContent = facts.length;
    panel.querySelector('[data-count=gaps]').textContent = gaps.length;

    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      root.classList.toggle('show-sources', on);
      panel.hidden = !on;
      tip.hidden = true;
      facts.forEach(function (el) {
        if (on && !el.matches('a, button, summary, input')) el.setAttribute('tabindex', '0');
        else if (!on && el.getAttribute('tabindex') === '0') el.removeAttribute('tabindex');
      });
    });

    function show(el) {
      if (!root.classList.contains('show-sources')) return;
      tip.textContent = tip.getAttribute('data-prefix') + el.getAttribute('data-src');
      tip.hidden = false;
      var r = el.getBoundingClientRect();
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
      var top = r.bottom + 8 + h > window.innerHeight ? r.top - h - 8 : r.bottom + 8;
      tip.style.left = left + 'px';
      tip.style.top = Math.max(8, top) + 'px';
    }
    function hide() { tip.hidden = true; }
    facts.forEach(function (el) {
      el.addEventListener('mouseenter', function () { show(el); });
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', function () { show(el); });
      el.addEventListener('blur', hide);
    });

    var next = document.getElementById('next-placeholder');
    var at = -1;
    if (!gaps.length) next.hidden = true;
    next.addEventListener('click', function () {
      at = (at + 1) % gaps.length;
      var el = gaps[at];
      var d = el.closest('details');
      if (d && !d.open) d.open = true;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    });
  }
})();
