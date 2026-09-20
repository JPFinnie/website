export const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (start, end, n) => { const t = clamp((n - start) / (end - start)); return t * t * (3 - 2 * t); };
// Time-based damping feels the same on 60 Hz and 120 Hz displays.
export const followScroll = (current, target, milliseconds) => target + (current - target) * Math.exp(-milliseconds / 90);
// Measured display aperture in the original artwork. Kept separate from camera math.
export const aperture = Object.freeze({ x: 691 / 1672, y: 479 / 940, width: 298 / 1672, height: 159 / 940, aspect: 1672 / 940 });
export function sceneFrame(progress, width, height, still = false, screen = aperture) {
  const p = clamp(progress);
  const imageWidth = Math.max(width, height * screen.aspect);
  const imageHeight = imageWidth / screen.aspect;
  const left = (width - imageWidth) / 2;
  const top = (height - imageHeight) / 2;
  const sx = left + imageWidth * screen.x;
  const sy = top + imageHeight * screen.y;
  const sw = imageWidth * screen.width;
  const sh = imageHeight * screen.height;
  const cx = sx + sw / 2;
  const cy = sy + sh / 2;
  const mobile = width <= 760;
  const inset = mobile ? 0 : clamp(width * .035, 28, 64);
  const final = { x: inset, y: mobile ? 72 : 104, width: width - inset * 2, height: Math.max(200, height - (mobile ? 72 : 158)) };
  // Arrive at the final panel width instead of overshooting and shrinking back.
  const finalScale = Math.max(1, final.width / sw);
  const travel = still ? 0 : smooth(.06, .98, p);
  const scale = still ? 1 : Math.exp(Math.log(finalScale) * travel);
  const focusX = mix(cx, width / 2, travel);
  const focusY = mix(cy, height / 2, travel);
  const imageX = focusX - (screen.x + screen.width / 2) * imageWidth * scale;
  const imageY = focusY - (screen.y + screen.height / 2) * imageHeight * scale;
  const takeover = still ? (p >= .5 ? 1 : 0) : smooth(mobile ? .28 : .48, 1, p);
  const shell = {
    x: mix(focusX - sw * scale / 2, final.x, takeover),
    y: mix(focusY - sh * scale / 2, final.y, takeover),
    width: mix(sw * scale, final.width, takeover),
    height: mix(sh * scale, final.height, takeover)
  };
  return {
    imageWidth, imageHeight, imageX: still ? left : imageX, imageY: still ? top : imageY, scale,
    shell, final, hero: still ? (p < .5 ? 1 : 0) : 1 - smooth(.01, .19, p),
    scenery: still ? (p < .5 ? 1 : 0) : 1 - smooth(.83, .99, p),
    desktop: still ? (p >= .5 ? 1 : 0) : smooth(.72, .91, p),
    mini: still ? (p < .5 ? 1 : 0) : 1 - smooth(.68, .85, p),
    ready: still ? p >= .5 : p >= .96
  };
}

export function mountScene() {
  const root = document.documentElement;
  const journey = document.querySelector('#journey');
  const stage = document.querySelector('#scene-stage');
  const world = document.querySelector('#world-plane');
  const shell = document.querySelector('#screen-shell');
  const desktop = document.querySelector('#desktop');
  const copy = document.querySelector('.hero-copy');
  const mini = document.querySelector('.screen-preview');
  const cue = document.querySelector('.scroll-cue');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  let progress = 0;
  let active = false;
  let focusInside = false;
  let focusOutside = false;
  let dimensionsDirty = true;
  let width = 0, height = 0, range = 1, journeyTop = 0;
  let lastTime = null;
  let snapNext = true;
  const quiet = () => media.matches || root.dataset.motion === 'quiet';
  function paint(time) {
    scheduled = false;
    if (dimensionsDirty) {
      width = stage.clientWidth;
      height = stage.clientHeight;
      range = Math.max(1, journey.offsetHeight - height);
      journeyTop = window.scrollY + journey.getBoundingClientRect().top;
      const layout = sceneFrame(1, width, height, quiet());
      world.style.width = `${layout.imageWidth}px`;
      world.style.height = `${layout.imageHeight}px`;
      desktop.style.width = `${layout.final.width}px`;
      desktop.style.height = `${layout.final.height}px`;
      dimensionsDirty = false;
    }
    if (!width || !height) return;
    const target = clamp((window.scrollY - journeyTop) / range);
    const elapsed = lastTime === null ? 16.67 : clamp(time - lastTime, 0, 64);
    lastTime = time;
    progress = snapNext || quiet() ? target : followScroll(progress, target, elapsed);
    snapNext = false;
    if (Math.abs(target - progress) < .0001) progress = target;
    const frame = sceneFrame(progress, width, height, quiet());
    world.style.transform = `translate3d(${frame.imageX}px,${frame.imageY}px,0) scale(${frame.scale})`;
    world.parentElement.style.opacity = String(frame.scenery);
    shell.style.transform = `translate3d(${frame.shell.x}px,${frame.shell.y}px,0)`;
    shell.style.width = `${frame.shell.width}px`;
    shell.style.height = `${frame.shell.height}px`;
    shell.style.borderRadius = `${width <= 760 ? 4 * (1 - smooth(.7, 1, progress)) : 4 + 10 * smooth(.7, 1, progress)}px`;
    desktop.style.transform = `scale(${frame.shell.width / frame.final.width})`;
    desktop.style.opacity = String(frame.desktop);
    mini.style.opacity = String(frame.mini);
    copy.style.opacity = String(frame.hero);
    copy.style.transform = `translateY(${quiet() ? 0 : -progress * 80}px)`;
    copy.inert = frame.hero < .1;
    cue.style.opacity = String(frame.hero);
    cue.inert = frame.hero < .1;
    root.classList.toggle('in-desktop', frame.ready);
    root.classList.toggle('past-intro', progress > .16);
    desktop.inert = !frame.ready;
    desktop.setAttribute('aria-hidden', String(!frame.ready));
    shell.classList.toggle('is-ready', frame.ready);
    // Returning to the scene must not leave keyboard focus inside a now-inert desktop.
    if (active && !frame.ready && desktop.contains(document.activeElement)) document.querySelector('.identity').focus({ preventScroll: true });
    if (frame.ready && focusInside) { desktop.querySelector('#about').focus({ preventScroll: true }); focusInside = false; }
    if (frame.hero > .9 && focusOutside) { document.querySelector('#enter-studio').focus({ preventScroll: true }); focusOutside = false; }
    active = frame.ready;
    if (progress !== target) update();
    else lastTime = null;
  }
  function update() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
  function refresh() { root.classList.toggle('is-still', quiet()); dimensionsDirty = true; snapNext = true; update(); }
  function enter(instant = false, focus = false) {
    focusInside = focus;
    if (instant || quiet()) snapNext = true;
    const top = window.scrollY + journey.getBoundingClientRect().top + journey.offsetHeight - stage.clientHeight;
    window.scrollTo({ top, behavior: instant || quiet() ? 'instant' : 'smooth' });
  }
  document.querySelectorAll('[data-enter]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault(); enter(button.dataset.instant === 'true', event.detail === 0);
  }));
  function returnToPhoto(event) {
    event?.preventDefault();
    focusOutside = true;
    window.scrollTo({ top: window.scrollY + journey.getBoundingClientRect().top, behavior: quiet() ? 'instant' : 'smooth' });
    try { const url = new URL(location.href); url.hash = ''; history.replaceState(null,'',url.href); } catch {}
  }
  document.querySelector('#return-world').addEventListener('click', returnToPhoto);
  document.querySelector('[data-return]').addEventListener('click', returnToPhoto);
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { dimensionsDirty = true; update(); }, { passive: true });
  media.addEventListener?.('change', refresh);
  document.addEventListener('studio:configuration', refresh);
  document.addEventListener('studio:enter', () => enter(true));
  if ('ResizeObserver' in window) new ResizeObserver(() => { dimensionsDirty = true; update(); }).observe(stage);
  refresh();
  return { update, enter, get progress() { return progress; } };
}
