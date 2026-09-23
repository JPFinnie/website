// The project viewer. A card opens the way the monitor did: its own rectangle
// grows until it is the whole viewport, and the project is laid out large
// inside it. Previous and next step through whatever the filter is showing;
// closing folds the sheet back into the card it came from.
import { clamp } from './scene.mjs';

const EASE = 'cubic-bezier(.16,1,.3,1)';

// The clip that shows only a given rectangle of the viewport.
export function insetFor(rect, width, height, radius = 12) {
  const top = clamp(rect.top, 0, height), left = clamp(rect.left, 0, width);
  const right = clamp(width - rect.right, 0, width), bottom = clamp(height - rect.bottom, 0, height);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}
// Stepping through a list that wraps at both ends.
export const step = (index, delta, length) => length ? ((index + delta) % length + length) % length : -1;

export function mountViewer({ glide, quiet, cursor }) {
  const root = document.documentElement;
  const cards = [...document.querySelectorAll('.cards .card')];
  if (!cards.length || typeof HTMLDialogElement !== 'function') return null;

  // Every card gets a real button, so the viewer is reachable by keyboard; the
  // rest of the card is a pointer shortcut to the same button.
  cards.forEach(card => {
    const title = card.querySelector('h3').textContent.replace('↗', '').trim();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-open';
    button.setAttribute('aria-label', `Open project: ${title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.innerHTML = '<span aria-hidden="true"></span>';
    card.append(button);
    card.classList.add('is-openable');
    button.addEventListener('click', event => { event.stopPropagation(); open(card); });
    card.addEventListener('click', event => {
      if (event.target.closest('a, button') || String(getSelection?.() || '').trim()) return;
      open(card);
    });
  });

  const sheet = document.createElement('dialog');
  sheet.className = 'sheet';
  sheet.setAttribute('aria-labelledby', 'sheet-title');
  sheet.innerHTML = `
    <div class="sheet-inner">
      <div class="sheet-bar">
        <p class="sheet-count"><span class="sheet-index"></span> / <span class="sheet-total"></span></p>
        <button type="button" class="sheet-close" aria-label="Close project"><span aria-hidden="true"></span></button>
      </div>
      <article class="sheet-body">
        <p class="sheet-num" aria-hidden="true"></p>
        <p class="sheet-tag"></p>
        <h2 class="sheet-title" id="sheet-title" tabindex="-1"></h2>
        <p class="sheet-text"></p>
        <ul class="sheet-meta" aria-label="Built with"></ul>
        <a class="sheet-visit" target="_blank" rel="noopener noreferrer" hidden>Visit the live product <span aria-hidden="true">&#8599;</span></a>
      </article>
      <nav class="sheet-nav" aria-label="Projects">
        <button type="button" class="sheet-step" data-step="-1"><span class="sheet-step-dir"><span aria-hidden="true">&larr;</span> Previous</span><span class="sheet-step-title"></span></button>
        <button type="button" class="sheet-step" data-step="1"><span class="sheet-step-dir">Next <span aria-hidden="true">&rarr;</span></span><span class="sheet-step-title"></span></button>
      </nav>
    </div>`;
  document.body.append(sheet);
  const $ = selector => sheet.querySelector(selector);
  const body = $('.sheet-body');
  let current = null, busy = false;

  const visible = () => cards.filter(card => !card.hidden);
  const number = card => String(cards.indexOf(card) + 1).padStart(2, '0');

  function fill(card) {
    current = card;
    const list = visible();
    const index = list.indexOf(card);
    const link = card.querySelector('h3 a');
    $('.sheet-num').textContent = number(card);
    $('.sheet-index').textContent = String(index + 1).padStart(2, '0');
    $('.sheet-total').textContent = String(list.length).padStart(2, '0');
    $('.sheet-tag').textContent = card.querySelector('.card-tag').textContent;
    $('.sheet-title').textContent = card.querySelector('h3').textContent.replace('↗', '').trim();
    $('.sheet-text').textContent = card.querySelector('p:not(.card-tag):not(.card-meta)').textContent;
    $('.sheet-meta').replaceChildren(...card.querySelector('.card-meta').textContent.split(/\s*[·•]\s*/).filter(Boolean).map(item => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
    const visit = $('.sheet-visit');
    visit.hidden = !link;
    if (link) visit.href = link.href;
    sheet.dataset.kind = card.dataset.kind;
    const [previous, next] = [list[step(index, -1, list.length)], list[step(index, 1, list.length)]];
    const single = list.length < 2;
    sheet.querySelectorAll('.sheet-step').forEach((button, i) => {
      const target = i ? next : previous;
      button.hidden = single;
      button.querySelector('.sheet-step-title').textContent = target.querySelector('h3').textContent.replace('↗', '').trim();
    });
  }

  function open(card) {
    if (busy || sheet.open) return;
    fill(card);
    const rect = card.getBoundingClientRect();
    root.style.setProperty('--lock-gap', `${window.innerWidth - root.clientWidth}px`);
    root.classList.add('sheet-open');
    sheet.scrollTop = 0;
    sheet.showModal();
    cursor?.host(sheet);
    // Focus lands on the project's title, so it is announced first and no
    // focus ring flashes on the close button after a click.
    $('.sheet-title').focus({ preventScroll: true });
    if (quiet()) return;
    busy = true;
    const [w, h] = [window.innerWidth, window.innerHeight];
    sheet.animate([{ clipPath: insetFor(rect, w, h) }, { clipPath: insetFor({ top: 0, left: 0, right: w, bottom: h }, w, h, 0) }],
      { duration: 720, easing: EASE }).finished.finally(() => { busy = false; });
    $('.sheet-inner').animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }],
      { duration: 700, delay: 160, easing: EASE, fill: 'backwards' });
  }

  async function close() {
    if (busy || !sheet.open) return;
    const card = current;
    const finish = () => {
      sheet.close();
      root.classList.remove('sheet-open');
      cursor?.host(document.body);
      card.querySelector('.card-open').focus({ preventScroll: true });
      busy = false;
    };
    if (quiet()) { finish(); return; }
    busy = true;
    // The reader may have stepped to a card that is off screen; bring it into
    // view behind the sheet so there is somewhere to fold back into.
    let rect = card.getBoundingClientRect();
    const [w, h] = [window.innerWidth, window.innerHeight];
    if (rect.bottom < 80 || rect.top > h - 80) {
      glide.to(window.scrollY + rect.top - (h - rect.height) / 2, { instant: true });
      rect = card.getBoundingClientRect();
    }
    $('.sheet-inner').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
    const fold = sheet.animate([{ clipPath: insetFor({ top: 0, left: 0, right: w, bottom: h }, w, h, 0) }, { clipPath: insetFor(rect, w, h) }],
      { duration: 560, easing: EASE, fill: 'forwards' });
    await fold.finished.catch(() => {});
    finish();
    sheet.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  }

  async function go(delta) {
    const list = visible();
    if (busy || list.length < 2) return;
    const next = list[step(list.indexOf(current), delta, list.length)];
    if (quiet()) { fill(next); return; }
    busy = true;
    await body.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-delta * 48}px)` }],
      { duration: 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).finished.catch(() => {});
    fill(next);
    sheet.scrollTop = 0;
    body.getAnimations().forEach(animation => animation.cancel());
    body.animate([{ opacity: 0, transform: `translateX(${delta * 48}px)` }, { opacity: 1, transform: 'none' }],
      { duration: 520, easing: EASE });
    busy = false;
  }

  $('.sheet-close').addEventListener('click', close);
  sheet.querySelectorAll('.sheet-step').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.step))));
  // Escape folds the sheet away rather than letting it vanish.
  sheet.addEventListener('cancel', event => { event.preventDefault(); close(); });
  sheet.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
  });
  return { open, close };
}
