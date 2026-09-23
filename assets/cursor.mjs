// A small piece of the monitor's wallpaper that follows the pointer. Its
// colour shifts with where it is on the screen, it swells over anything that
// can be clicked, and it says what a click will do. The system cursor is never
// hidden; this only keeps it company.
import { clamp } from './scene.mjs';
import { damp } from './glide.mjs';

// What a click on this element will do, in a word or two.
export function cursorLabel(target) {
  if (!target?.closest) return null;
  if (target.closest('.sheet-step')) return target.closest('.sheet-step').dataset.step === '1' ? 'Next' : 'Back';
  if (target.closest('.sheet-close')) return 'Close';
  const link = target.closest('a[href], button');
  if (link?.matches('a[href^="mailto:"]')) return 'Email';
  if (link?.matches('a[target="_blank"]')) return 'Visit';
  if (link?.matches('a[href="#top"]') && link.closest('.outro')) return 'Again';
  if (!link && target.closest('.card.is-openable')) return 'Open';
  if (link?.matches('.card-open')) return 'Open';
  return link ? '' : null;
}

export function mountCursor({ quiet }) {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const element = document.createElement('div');
  element.className = 'glow-cursor';
  element.setAttribute('aria-hidden', 'true');
  element.innerHTML = '<span class="glow-core"><span class="glow-label"></span></span>';
  document.body.append(element);
  const core = element.querySelector('.glow-core');
  const labelEl = element.querySelector('.glow-label');

  let x = -200, y = -200, tx = x, ty = y, running = false, last = null, shown = false, state = null;
  const enabled = () => fine.matches && !quiet();

  function tick(time) {
    const elapsed = last === null ? 16.67 : clamp(time - last, 0, 64);
    last = time;
    x = damp(x, tx, elapsed, 55);
    y = damp(y, ty, elapsed, 55);
    if (Math.abs(x - tx) < .1 && Math.abs(y - ty) < .1) { x = tx; y = ty; }
    element.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    // Travelling across the screen slides the wallpaper beneath the glow, so
    // it picks up the violet, the orange and the pink as it goes.
    core.style.backgroundPosition = `${(x / window.innerWidth * 100).toFixed(1)}% ${(y / window.innerHeight * 100).toFixed(1)}%`;
    if (x !== tx || y !== ty) requestAnimationFrame(tick);
    else { running = false; last = null; }
  }
  function run() { if (!running) { running = true; requestAnimationFrame(tick); } }

  function show(on) {
    if (on === shown) return;
    shown = on;
    element.classList.toggle('is-on', on);
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !enabled()) { show(false); return; }
    tx = event.clientX; ty = event.clientY;
    if (!shown) { x = tx; y = ty; }
    show(true);
    const label = cursorLabel(event.target);
    const next = label === null ? 'idle' : label === '' ? 'link' : `label:${label}`;
    if (next !== state) {
      state = next;
      element.classList.toggle('is-link', label !== null);
      element.classList.toggle('has-label', !!label);
      if (label) labelEl.textContent = label;
    }
    run();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => show(false));
  window.addEventListener('blur', () => show(false));
  window.addEventListener('pointerdown', () => element.classList.add('is-down'), { passive: true });
  window.addEventListener('pointerup', () => element.classList.remove('is-down'), { passive: true });
  document.addEventListener('studio:configuration', () => { if (!enabled()) show(false); });

  return {
    // An open modal dialog sits in the top layer, above everything else on the
    // page; the glow moves into it so it is not left behind underneath.
    host(parent) {
      parent.append(element);
      // What was under the pointer a moment ago is no longer there.
      state = 'idle';
      element.classList.remove('is-link', 'has-label', 'is-down');
    }
  };
}
