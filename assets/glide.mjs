// Glide: the page's scroll engine. A mouse wheel moves in coarse, jerky
// notches; here each notch sets a destination and the page eases toward it.
// Travel between sections is an eased flight rather than a jump. Everything
// is still native scrolling underneath — the scrollbar, keyboard, find-in-page
// and touch all work as they always do, and simply hand control back.
import { clamp } from './scene.mjs';

// Exponential damping, measured in time rather than frames so a 120 Hz display
// glides exactly like a 60 Hz one.
export const damp = (current, target, milliseconds, tau = 110) => target + (current - target) * Math.exp(-milliseconds / tau);

// Wheel events arrive in pixels, lines or pages depending on the device.
export function wheelPixels(event, pageHeight) {
  const unit = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? pageHeight * .9 : 1;
  return event.deltaY * unit;
}

// A notched mouse wheel sends large whole steps; a trackpad sends a stream of
// small ones that already carry the finger's inertia. The trackpad is followed
// more tightly so the page never feels like it is lagging the hand.
export const wheelTau = delta => Math.abs(delta) >= 50 ? 120 : 55;

// Flights between sections: long enough to read as travel, never so long
// that the reader is waiting on the page.
export const travelTime = distance => clamp(380 + Math.sqrt(Math.abs(distance)) * 13, 380, 1250);
export const easeInOutQuart = t => t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;

export function mountGlide({ quiet }) {
  const root = document.documentElement;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let current = window.scrollY, target = current, written = current, tau = 110;
  let running = false, last = null, flight = null;
  // Velocity, for effects that react to how fast the reader is moving.
  let velocity = 0, sampleY = window.scrollY, sampleTime = performance.now();
  const listeners = new Set();
  let emitScheduled = false;

  const limit = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const smoothWheel = () => fine.matches && !quiet();

  function emit(time) {
    emitScheduled = false;
    const y = window.scrollY;
    const elapsed = Math.max(1, time - sampleTime);
    velocity = damp(velocity, (y - sampleY) / elapsed, elapsed, 60);
    sampleY = y; sampleTime = time;
    listeners.forEach(fn => fn(y));
  }
  function scheduleEmit() { if (!emitScheduled) { emitScheduled = true; requestAnimationFrame(emit); } }

  function tick(time) {
    const elapsed = last === null ? 16.67 : clamp(time - last, 0, 64);
    last = time;
    if (flight) {
      if (flight.start === null) flight.start = time;
      const t = clamp((time - flight.start) / flight.duration);
      current = flight.from + (flight.to - flight.from) * easeInOutQuart(t);
      if (t >= 1) { const done = flight.done; flight = null; target = current; done?.(); }
    } else {
      current = damp(current, target, elapsed, tau);
      if (Math.abs(target - current) < .4) current = target;
    }
    written = current;
    window.scrollTo(0, current);
    if (flight || current !== target) requestAnimationFrame(tick);
    else { running = false; last = null; }
  }
  function run() { if (!running) { running = true; requestAnimationFrame(tick); } }
  function stop() { flight = null; running = false; last = null; current = target = window.scrollY; }

  window.addEventListener('wheel', event => {
    if (!smoothWheel() || event.ctrlKey || event.defaultPrevented) return;
    // Sideways gestures and anything inside its own scroller stay native.
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (scrollsItself(event.target, event.deltaY)) return;
    event.preventDefault();
    const delta = wheelPixels(event, window.innerHeight);
    if (flight) { flight = null; target = current; }
    else if (!running) current = target = window.scrollY;
    tau = wheelTau(delta);
    target = clamp(target + delta, 0, limit());
    run();
  }, { passive: false });

  // Anything that moves the page other than this engine — the keyboard, the
  // scrollbar, a touch, find-in-page — wins, and the engine re-synchronises.
  window.addEventListener('scroll', () => {
    scheduleEmit();
    if (running && Math.abs(window.scrollY - written) <= 2) return;
    if (running) stop();
    current = target = window.scrollY;
  }, { passive: true });
  window.addEventListener('resize', () => { target = clamp(target, 0, limit()); scheduleEmit(); }, { passive: true });

  function to(y, { instant = false, done } = {}) {
    const destination = clamp(y, 0, limit());
    if (instant || quiet()) {
      stop();
      window.scrollTo(0, destination);
      current = target = written = destination;
      done?.();
      return;
    }
    current = window.scrollY;
    flight = { from: current, to: destination, start: null, duration: travelTime(destination - current), done };
    run();
  }

  function offsetOf(element) {
    const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    return element.getBoundingClientRect().top + window.scrollY - padding;
  }

  // In-page links fly rather than jump, and still behave like links: the URL
  // updates, and focus follows the reader to where they arrived.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href^="#"]');
    if (!link || link.classList.contains('skip')) return;
    const hash = link.getAttribute('href');
    const destination = hash === '#top' ? document.body : hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!destination) return;
    event.preventDefault();
    const y = destination === document.body ? 0 : offsetOf(destination);
    to(y, { done: () => {
      try { history.pushState(null, '', hash); } catch {}
      if (destination !== document.body) {
        if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
        destination.focus({ preventScroll: true });
      }
    } });
  });

  root.classList.add('has-glide');
  return {
    to, offsetOf,
    subscribe(fn) { listeners.add(fn); fn(window.scrollY); return () => listeners.delete(fn); },
    refresh: scheduleEmit,
    // Velocity decays on its own once the page comes to rest.
    get velocity() { return velocity * Math.exp(-(performance.now() - sampleTime) / 140); },
    get smoothing() { return smoothWheel(); }
  };
}

// True when the element under the wheel can scroll further in that direction
// by itself, in which case the page must leave the gesture alone.
function scrollsItself(node, deltaY) {
  for (let el = node; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.hasAttribute?.('data-native-scroll')) return true;
    if (el.scrollHeight <= el.clientHeight) continue;
    const overflow = getComputedStyle(el).overflowY;
    if (overflow !== 'auto' && overflow !== 'scroll') continue;
    if (deltaY < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
  }
  return false;
}
