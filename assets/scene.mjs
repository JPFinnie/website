// The opening scene: the camera flies toward the monitor in the artwork, then
// the screen detaches and opens out to fill the viewport, becoming the page.
// The page's content is never inside the scene — it simply follows it.
export const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (start, end, n) => { const t = clamp((n - start) / (end - start)); return t * t * (3 - 2 * t); };
// Time-based damping feels the same on 60 Hz and 120 Hz displays.
export const followScroll = (current, target, milliseconds) => target + (current - target) * Math.exp(-milliseconds / 90);
// Measured display aperture in the original artwork.
export const aperture = Object.freeze({ x: 691 / 1672, y: 479 / 940, width: 298 / 1672, height: 159 / 940, aspect: 1672 / 940 });

// The two acts. The screen only starts opening once the approach has finished,
// so the frame never tears away from the monitor it is supposed to be.
const APPROACH = Object.freeze({ start: 0, end: .58 });
const OPEN = Object.freeze({ start: .58, end: 1 });

export function sceneFrame(progress, width, height, still = false, screen = aperture) {
  const p = clamp(progress);
  // Cover the stage with the artwork, never letting it letterbox.
  const imageWidth = Math.max(width, height * screen.aspect);
  const imageHeight = imageWidth / screen.aspect;
  const left = (width - imageWidth) / 2;
  const top = (height - imageHeight) / 2;
  // Fly in until the monitor reads as a screen rather than a detail.
  const share = width <= 760 ? .84 : .62;
  const maxScale = clamp(share * width / (imageWidth * screen.width), 1, 6);
  const travel = still ? 0 : smooth(APPROACH.start, APPROACH.end, p);
  const scale = still ? 1 : mix(1, maxScale, travel);
  // Anchor point: the middle of the display, drawn toward the middle of the stage.
  const anchorX = screen.x + screen.width / 2;
  const anchorY = screen.y + screen.height / 2;
  const restX = left + imageWidth * anchorX;
  const restY = top + imageHeight * anchorY;
  const focusX = still ? restX : mix(restX, width / 2, travel);
  const focusY = still ? restY : mix(restY, height * .46, travel);
  // Panning must never expose an edge, so the plane is held against the stage.
  const imageX = still ? left : clamp(focusX - anchorX * imageWidth * scale, width - imageWidth * scale, 0);
  const imageY = still ? top : clamp(focusY - anchorY * imageHeight * scale, height - imageHeight * scale, 0);
  // Where the display sits in the artwork, at this moment, in stage pixels.
  const lens = {
    x: imageX + imageWidth * screen.x * scale,
    y: imageY + imageHeight * screen.y * scale,
    width: imageWidth * screen.width * scale,
    height: imageHeight * screen.height * scale
  };
  // Act two: that same rectangle grows into the whole viewport.
  const open = still ? 0 : smooth(OPEN.start, OPEN.end, p);
  const shell = {
    x: mix(lens.x, 0, open),
    y: mix(lens.y, 0, open),
    width: mix(lens.width, width, open),
    height: mix(lens.height, height, open),
    radius: mix(width <= 760 ? 3 : 5, 0, open)
  };
  return {
    imageWidth, imageHeight, imageX, imageY, scale, lens, shell, open,
    hero: still ? 1 : 1 - smooth(.03, .26, p),
    // The wallpaper lights up on approach, then burns off to reveal the surface.
    face: still ? 1 : smooth(.12, .42, p) * (1 - smooth(.72, .95, p)),
    // What is on the screen once it has opened.
    surface: still ? 0 : smooth(.74, .96, p),
    // Once the screen owns the viewport the landscape behind it is redundant.
    scenery: still ? 1 : 1 - smooth(.62, .94, p),
    opened: p >= OPEN.end - 1e-9
  };
}

export function mountScene() {
  const root = document.documentElement;
  const journey = document.querySelector('#journey');
  const stage = document.querySelector('#scene-stage');
  const world = document.querySelector('#world-plane');
  const frame = document.querySelector('.world-frame');
  const shell = document.querySelector('#screen-shell');
  const face = document.querySelector('.screen-face');
  const surface = document.querySelector('.screen-page');
  const copy = document.querySelector('.hero-copy');
  const cue = document.querySelector('.scroll-cue');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false, progress = 0, dirty = true, snapNext = true, lastTime = null;
  let width = 0, height = 0, range = 1, journeyTop = 0;
  const quiet = () => media.matches || root.dataset.motion === 'quiet';

  function paint(time) {
    scheduled = false;
    if (dirty) {
      width = stage.clientWidth;
      height = stage.clientHeight;
      range = Math.max(1, journey.offsetHeight - height);
      journeyTop = window.scrollY + journey.getBoundingClientRect().top;
      const layout = sceneFrame(0, width, height, quiet());
      world.style.width = `${layout.imageWidth}px`;
      world.style.height = `${layout.imageHeight}px`;
      // The screen's contents are laid out at full size and scaled down into
      // the monitor, so type reflows once at load rather than on every frame.
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
      dirty = false;
    }
    if (!width || !height) return;
    const target = clamp((window.scrollY - journeyTop) / range);
    const elapsed = lastTime === null ? 16.67 : clamp(time - lastTime, 0, 64);
    lastTime = time;
    progress = snapNext || quiet() ? target : followScroll(progress, target, elapsed);
    snapNext = false;
    if (Math.abs(target - progress) < .0001) progress = target;
    const f = sceneFrame(progress, width, height, quiet());
    world.style.transform = `translate3d(${f.imageX}px,${f.imageY}px,0) scale(${f.scale})`;
    frame.style.opacity = String(f.scenery);
    shell.style.transform = `translate3d(${f.shell.x}px,${f.shell.y}px,0)`;
    shell.style.width = `${f.shell.width}px`;
    shell.style.height = `${f.shell.height}px`;
    shell.style.borderRadius = `${f.shell.radius}px`;
    shell.style.opacity = String(f.open > 0 ? 1 : Math.max(f.face, 0) > 0 ? 1 : 0);
    face.style.opacity = String(f.face);
    surface.style.transform = `scale(${f.shell.width / width})`;
    surface.style.opacity = String(f.surface);
    surface.inert = f.surface < .6;
    copy.style.opacity = String(f.hero);
    copy.style.transform = quiet() ? 'none' : `translate3d(0,${-progress * 70}px,0)`;
    copy.inert = f.hero < .1;
    cue.style.opacity = String(f.hero);
    cue.inert = f.hero < .1;
    root.classList.toggle('past-intro', progress > .12);
    root.classList.toggle('screen-open', f.open > .55);
    if (progress !== target) update(); else lastTime = null;
  }
  function update() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
  function refresh() { root.classList.toggle('is-still', quiet()); dirty = true; snapNext = true; update(); }

  // "Scroll to open" should work as a click for anyone who would rather not.
  document.querySelectorAll('[data-open-screen]').forEach(control => control.addEventListener('click', event => {
    // With motion off there is no screen to open, so the link does what it says
    // it does and takes the reader to the section itself.
    if (quiet()) return;
    event.preventDefault();
    window.scrollTo({ top: journeyTop + range, behavior: 'smooth' });
  }));

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { dirty = true; update(); }, { passive: true });
  media.addEventListener?.('change', refresh);
  document.addEventListener('studio:configuration', refresh);
  if ('ResizeObserver' in window) new ResizeObserver(() => { dirty = true; update(); }).observe(stage);
  refresh();
  return { update, refresh, get progress() { return progress; } };
}
