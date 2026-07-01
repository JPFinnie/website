/* james-finnie.com — interactions (vanilla, zero deps) */

/* Vercel Web Analytics + Speed Insights stubs */
window.va = window.va || function(){ (window.vaq = window.vaq || []).push(arguments); };
window.si = window.si || function(){ (window.siq = window.siq || []).push(arguments); };

(function(){
'use strict';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---- scroll progress + header state ---- */
(function(){
  const prog = document.querySelector('.progress');
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    prog.style.setProperty('--p', p + '%');
    header.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });
})();

/* ---- scroll reveals ---- */
(function(){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---- active section highlight in nav ---- */
(function(){
  const links = [...document.querySelectorAll('.header__nav a')];
  if (!links.length) return;
  const byId = {};
  links.forEach(a => { byId[a.getAttribute('href').slice(1)] = a; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const link = byId[e.target.id];
      if (!link) return;
      if (e.isIntersecting) {
        links.forEach(a => a.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'true');
      } else if (link.hasAttribute('aria-current')) {
        link.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  Object.keys(byId).forEach(id => {
    const sec = document.getElementById(id);
    if (sec) io.observe(sec);
  });
})();

/* ---- clock + year ---- */
(function(){
  const el = document.getElementById('clock');
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
  if (!el) return;
  function tick(){
    const opts = { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', hour12: false };
    el.textContent = new Date().toLocaleTimeString('en-GB', opts) + '  TOR';
  }
  tick(); setInterval(tick, 1000 * 15);
})();

/* ---- mobile menu ---- */
(function(){
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  if (!btn || !menu) return;
  const focusables = () => [...menu.querySelectorAll('a')];
  let open = false;

  function setOpen(next){
    open = next;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      focusables()[0].focus();
    } else {
      menu.classList.remove('is-open');
      const done = () => { menu.hidden = true; };
      reduceMotion ? done() : menu.addEventListener('transitionend', done, { once: true });
      btn.focus();
    }
  }

  btn.addEventListener('click', () => setOpen(!open));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key !== 'Tab') return;
    const els = [btn, ...focusables()];
    const i = els.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); els[els.length - 1].focus(); }
    else if (!e.shiftKey && i === els.length - 1) { e.preventDefault(); els[0].focus(); }
  });
  // close if resized up to desktop nav
  matchMedia('(min-width: 961px)').addEventListener('change', (e) => {
    if (e.matches && open) setOpen(false);
  });
})();

/* ---- hero text-generate (word streaming) ---- */
(function(){
  function streamify(root){
    const spans = [];
    (function walk(node){
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(tok => {
            if (tok === '') return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
            const s = document.createElement('span');
            s.className = 'tg-word';
            s.textContent = tok;
            frag.appendChild(s);
            spans.push(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    })(root);
    return spans;
  }
  function run(sel, base, step){
    const el = document.querySelector(sel);
    if (!el) return base;
    const words = streamify(el);
    if (reduceMotion) { words.forEach(w => w.classList.add('is-in')); return base; }
    words.forEach((w, i) => setTimeout(() => w.classList.add('is-in'), base + i * step));
    return base + words.length * step;
  }
  const afterTitle = run('.hero__title', 120, 110);
  run('.hero__lede', afterTitle + 120, 42);
})();

/* ---- pointer-driven decoration (fine pointers only) ---- */
if (finePointer && !reduceMotion) {

  /* cyan dot-grid glow following the cursor */
  (function(){
    const glow = document.createElement('div');
    glow.className = 'grid-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.prepend(glow);
    document.body.classList.add('has-pointer');
    const root = document.documentElement;
    let x = innerWidth / 2, y = innerHeight / 2, raf = 0;
    window.addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        root.style.setProperty('--mx', x + 'px');
        root.style.setProperty('--my', y + 'px');
        raf = 0;
      });
    }, { passive: true });
  })();

  /* card spotlight — radial highlight tracks the cursor inside cards */
  (function(){
    document.querySelectorAll('.focus-grid, .projects, .principles').forEach(grid => {
      grid.addEventListener('pointermove', (e) => {
        const card = e.target.closest('.fcard, .pcard, .principle');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--sx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--sy', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  })();
}

})();
