// The opening scene: the camera flies toward the monitor in the artwork, then
// the screen detaches and opens out to fill the viewport, becoming the page.
// The page's content is never inside the scene — it simply follows it.
export const clamp = (n, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const mix = (a, b, t) => a + (b - a) * t;
export const smooth = (start, end, n) => { const t = clamp((n - start) / (end - start)); return t * t * (3 - 2 * t); };
// Time-based damping feels the same on 60 Hz and 120 Hz displays.
export const followScroll = (current, target, milliseconds, tau = 90) => target + (current - target) * Math.exp(-milliseconds / tau);
// Measured display aperture in the original artwork.
export const aperture = Object.freeze({ x: 691 / 1672, y: 479 / 940, width: 298 / 1672, height: 159 / 940, aspect: 1672 / 940 });

// The two acts. The screen only starts opening once the approach has finished,
// so the frame never tears away from the monitor it is supposed to be.
const APPROACH = Object.freeze({ start: 0, end: .58 });
const OPEN = Object.freeze({ start: .58, end: 1 });

export function sceneFrame(progress, width, height, still = false, screen = aperture) {
  const p = clamp(progress);
  // Cover the stage with the artwork, never letting it letterbox. A phone held
  // upright gets a tighter crop: fitting this landscape to a tall viewport
  // otherwise spends most of the screen on empty sky.
  const tall = height / width > 1.4;
  const cover = Math.max(width, height * screen.aspect);
  const imageWidth = tall ? cover * 1.15 : cover;
  const imageHeight = imageWidth / screen.aspect;
  const left = (width - imageWidth) / 2;
  const top = (height - imageHeight) / 2;
  // Fly in until the monitor reads as a screen rather than a detail.
  const share = tall ? .95 : width <= 760 ? .88 : .62;
  const maxScale = clamp(share * width / (imageWidth * screen.width), 1, 6);
  const travel = still ? 0 : smooth(APPROACH.start, APPROACH.end, p);
  const scale = still ? 1 : mix(1, maxScale, travel);
  // Anchor point: the middle of the display, drawn toward the middle of the stage.
  const anchorX = screen.x + screen.width / 2;
  const anchorY = screen.y + screen.height / 2;
  const restX = left + imageWidth * anchorX;
  const naturalY = top + imageHeight * anchorY;
  // On a tall crop there is vertical room to spare, so the desk is framed on
  // the monitor from the first frame instead of drifting up from the skyline.
  const restY = tall ? height * .54 : naturalY;
  const focusX = still ? restX : mix(restX, width / 2, travel);
  const focusY = still ? naturalY : mix(restY, height * .46, travel);
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
    // The wallpaper and its instruction are lit from the first frame, and burn
    // off as the screen opens onto the page.
    face: still ? 1 : 1 - smooth(.60, .86, p),
    // The page the screen opens onto.
    surface: still ? 1 : smooth(.66, .94, p),
    // Once the screen owns the viewport the landscape behind it is redundant.
    scenery: still ? 1 : 1 - smooth(.62, .94, p),
    opened: p >= OPEN.end - 1e-9
  };
}

export function mountScene({ glide } = {}) {
  const root = document.documentElement;
  const journey = document.querySelector('#journey');
  const stage = document.querySelector('#scene-stage');
  const world = document.querySelector('#world-plane');
  const frame = document.querySelector('.world-frame');
  const shell = document.querySelector('#screen-shell');
  const face = document.querySelector('.screen-face');
  const page = document.querySelector('.screen-page');
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
      page.style.width = `${width}px`;
      page.style.height = `${height}px`;
      dirty = false;
    }
    if (!width || !height) return;
    const target = clamp((window.scrollY - journeyTop) / range);
    const elapsed = lastTime === null ? 16.67 : clamp(time - lastTime, 0, 64);
    lastTime = time;
    // When the scroll engine is already easing the wheel, the camera follows
    // it closely instead of adding a second, laggier layer of smoothing.
    progress = snapNext || quiet() ? target : followScroll(progress, target, elapsed, glide?.smoothing ? 28 : 90);
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
    // The instruction stops being a target the moment it stops being legible.
    face.style.pointerEvents = f.face > .5 ? 'auto' : 'none';
    page.style.transform = `scale(${f.shell.width / width})`;
    page.style.opacity = String(f.surface);
    root.classList.toggle('past-intro', progress > .12);
    root.classList.toggle('screen-open', f.open > .55);
    if (progress !== target) update(); else lastTime = null;
  }
  function update() { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }
  function refresh() { root.classList.toggle('is-still', quiet()); dirty = true; snapNext = true; update(); }

  function openScreen(instant = false) {
    if (glide) glide.to(journeyTop + range, { instant: instant || quiet() });
    else window.scrollTo({ top: journeyTop + range, behavior: instant || quiet() ? 'instant' : 'smooth' });
  }
  // Tabbing into the page behind the wallpaper opens the screen, so focus is
  // never sitting on something the reader cannot see.
  page.addEventListener('focusin', () => { if (!quiet() && progress < .9) openScreen(true); });
  // The instruction on the screen is a real link: clicking the monitor works too.
  document.querySelectorAll('[data-open-screen]').forEach(control => control.addEventListener('click', event => {
    // With motion off there is no screen to open, so the link does what it says
    // it does and takes the reader to the section itself.
    if (quiet()) return;
    event.preventDefault();
    openScreen();
  }));

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { dirty = true; update(); }, { passive: true });
  media.addEventListener?.('change', refresh);
  document.addEventListener('studio:configuration', refresh);
  if ('ResizeObserver' in window) new ResizeObserver(() => { dirty = true; update(); }).observe(stage);
  refresh();
  return { update, refresh, get progress() { return progress; } };
}
