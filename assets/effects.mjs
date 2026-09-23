// Everything that happens after the screen opens: the page reacts to where the
// reader is and how they are moving. Each effect reads layout that was
// measured once (and again whenever the page reflows), never on every frame,
// and each one steps aside when motion is turned off.
import { clamp } from './scene.mjs';

// How far a reading line has travelled through a block, 0..1.
export const progressThrough = (top, height, line) => height > 0 ? clamp((line - top) / height) : 0;
// The last block whose top the reading line has passed, or -1 before the first.
export function currentIndex(tops, line) {
  let index = -1;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= line) index = i;
  return index;
}
// The reading line sits two-fifths down the viewport, and only in the last
// stretch of the page sweeps to its bottom edge, so a short final section
// still reads as reached once the page can scroll no further.
export const readingLine = (y, viewport, max) => {
  const runway = viewport * .2;
  const sweep = max > runway ? clamp((y - (max - runway)) / runway) : 1;
  return y + viewport * (.4 + .6 * sweep);
};
// Seamless looping for the toolkit marquee: any offset folds into [0, span).
export const wrapOffset = (x, span) => span > 0 ? ((x % span) + span) % span : 0;

const pageTop = el => { let y = 0; for (; el; el = el.offsetParent) y += el.offsetTop; return y; };
const EASE = 'cubic-bezier(.16,1,.3,1)';

export function mountEffects({ glide, quiet }) {
  const root = document.documentElement;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const main = document.querySelector('main');
  const sections = [...main.querySelectorAll('.band[id]')];
  const navLinks = new Map([...document.querySelectorAll('.masthead nav a[href^="#"]')].map(a => [a.hash.slice(1), a]));

  const rail = buildRail(sections);
  const pill = buildNavPill();
  const timeline = buildTimeline();
  const contact = buildContact();
  const portrait = document.querySelector('.portrait img');
  const footer = document.querySelector('.site-footer');
  splitHeadings();
  const reveals = mountReveals();
  const filter = mountFilter();
  const marquee = mountMarquee();
  mountPointerEffects();
  mountKeyboard();

  let layout = null;
  function measure() {
    const tops = sections.map(pageTop);
    layout = {
      vh: window.innerHeight,
      max: Math.max(0, root.scrollHeight - window.innerHeight),
      tops,
      heights: sections.map(s => s.offsetHeight),
      roles: timeline && { top: pageTop(timeline.list), height: timeline.list.offsetHeight, items: timeline.items.map(pageTop) },
      contact: contact && { top: pageTop(contact.section), height: contact.section.offsetHeight },
      about: portrait && { top: tops[0], height: sections[0].offsetHeight }
    };
    rail.segments.forEach((seg, i) => { seg.style.flexGrow = String(layout.heights[i]); });
    pill.place();
    filter?.place();
    marquee?.measure();
  }

  let active = null, onDark = null;
  const last = new Map();
  // Only touch the DOM when a value has actually moved.
  const set = (el, prop, value) => { if (last.get(el)?.[prop] === value) return; last.set(el, { ...last.get(el), [prop]: value }); el.style.setProperty(prop, value); };

  function frame(y) {
    if (!layout) return;
    const { vh, max, tops, heights } = layout;
    const line = readingLine(y, vh, max);
    const still = quiet();

    // Section rail: each segment fills as its section is read.
    tops.forEach((top, i) => set(rail.segments[i], '--p', (progressThrough(top, heights[i], line)).toFixed(4)));
    const index = currentIndex(tops, line);
    const id = index >= 0 ? sections[index].id : null;
    if (id !== active) {
      active = id;
      rail.segments.forEach((seg, i) => seg.classList.toggle('is-active', i === index));
      navLinks.forEach((link, key) => link.setAttribute('aria-current', key === id ? 'true' : 'false'));
      pill.place();
    }
    const dark = !!layout.contact && y + vh / 2 >= layout.contact.top;
    if (dark !== onDark) { onDark = dark; rail.element.classList.toggle('on-dark', dark); }

    // Experience: the timeline draws itself down the page.
    if (layout.roles) {
      const probe = y + vh * .6;
      set(timeline.progress, '--p', progressThrough(layout.roles.top, layout.roles.height, probe).toFixed(4));
      timeline.items.forEach((item, i) => item.classList.toggle('is-past', layout.roles.items[i] + 30 <= probe));
    }

    // Contact: the dark panel rises into place, and its headline lights up
    // letter by letter as it arrives.
    if (layout.contact) {
      const { top } = layout.contact;
      const rise = still ? 1 : clamp((y + vh - top) / (vh * .75));
      const inset = ((1 - rise) * Math.min(56, window.innerWidth * .04)).toFixed(2);
      const radius = ((1 - rise) * 36).toFixed(2);
      const clip = rise >= 1 ? 'none' : `inset(0 ${inset}px 0 ${inset}px round ${radius}px ${radius}px 0 0)`;
      set(contact.section, 'clip-path', clip);
      set(footer, 'clip-path', rise >= 1 ? 'none' : `inset(0 ${inset}px)`);
      const lit = still ? 1 : clamp((y + vh * .82 - top) / (vh * .42));
      const count = Math.round(lit * contact.chars.length);
      if (count !== contact.count) {
        contact.count = count;
        contact.chars.forEach((ch, i) => ch.classList.toggle('lit', i < count));
      }
    }

    // About: the portrait drifts a little slower than the page around it.
    if (layout.about && fine.matches) {
      const t = progressThrough(layout.about.top - vh, layout.about.height + vh, y);
      set(portrait, 'transform', still ? 'none' : `translate3d(0,${((t - .5) * -9).toFixed(2)}%,0) scale(1.12)`);
    }
  }

  measure();
  glide.subscribe(frame);
  if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); glide.refresh(); }).observe(main);
  window.addEventListener('resize', () => { measure(); glide.refresh(); }, { passive: true });
  document.fonts?.ready.then(() => { measure(); glide.refresh(); });

  function configure() {
    const still = quiet();
    reveals.configure(still);
    marquee?.configure(still);
    if (still) document.querySelectorAll('.card, .contact .button').forEach(el => { el.style.transform = ''; });
    last.clear();
    glide.refresh();
  }
  document.addEventListener('studio:configuration', configure);
  configure();

  // ---------- Rail ----------
  function buildRail(list) {
    const element = document.createElement('nav');
    element.className = 'rail';
    // The masthead is the navigation for assistive technology; the rail is a
    // pointer-sized map of the same thing, so it is kept out of the way.
    element.setAttribute('aria-hidden', 'true');
    const segments = list.map(section => {
      const label = section.querySelector('.eyebrow')?.textContent.trim() || section.id;
      const seg = document.createElement('a');
      seg.className = 'rail-seg';
      seg.href = `#${section.id}`;
      seg.tabIndex = -1;
      seg.innerHTML = '<span class="rail-bar"><span class="rail-fill"></span></span><span class="rail-label"></span>';
      seg.querySelector('.rail-label').textContent = label;
      element.append(seg);
      return seg;
    });
    const keys = document.createElement('span');
    keys.className = 'rail-keys';
    keys.innerHTML = '<kbd>J</kbd><kbd>K</kbd>';
    element.append(keys);
    document.body.append(element);
    return { element, segments };
  }

  // ---------- Masthead pill ----------
  function buildNavPill() {
    const nav = document.querySelector('.masthead nav');
    const element = document.createElement('span');
    element.className = 'nav-pill';
    element.setAttribute('aria-hidden', 'true');
    nav.prepend(element);
    let hover = null;
    nav.addEventListener('pointerover', e => { const a = e.target.closest('a'); if (a && fine.matches) { hover = a; place(); } });
    nav.addEventListener('pointerleave', () => { hover = null; place(); });
    function place() {
      const link = hover || (active && navLinks.get(active));
      element.classList.toggle('is-on', !!link);
      if (!link) return;
      element.style.width = `${link.offsetWidth}px`;
      element.style.transform = `translateX(${link.offsetLeft}px)`;
    }
    return { place };
  }

  // ---------- Timeline ----------
  function buildTimeline() {
    const list = document.querySelector('.roles');
    if (!list) return null;
    const progress = document.createElement('span');
    progress.className = 'roles-progress';
    progress.setAttribute('aria-hidden', 'true');
    list.prepend(progress);
    root.classList.add('has-timeline');
    return { list, progress, items: [...list.querySelectorAll('.role')] };
  }

  // ---------- Contact ----------
  function buildContact() {
    const section = document.querySelector('.contact');
    const heading = section?.querySelector('h2');
    if (!heading) return null;
    const chars = [];
    splitInto(heading, word => {
      const span = document.createElement('span');
      span.className = 'word';
      for (const letter of word) {
        const ch = document.createElement('span');
        ch.className = 'ch';
        ch.textContent = letter;
        span.append(ch);
        chars.push(ch);
      }
      return span;
    });
    return { section, chars, count: -1 };
  }

  // ---------- Headings ----------
  function splitHeadings() {
    main.querySelectorAll('.band:not(.contact) h2').forEach(heading => {
      let i = 0;
      splitInto(heading, word => {
        const outer = document.createElement('span');
        outer.className = 'w';
        const inner = document.createElement('span');
        inner.textContent = word;
        inner.style.setProperty('--i', String(i++));
        outer.append(inner);
        return outer;
      });
    });
  }
  // Keeps the heading's text whole for screen readers and search, and draws
  // an animated copy of it for everyone else.
  function splitInto(heading, makeWord) {
    const text = heading.textContent.trim();
    const spoken = document.createElement('span');
    spoken.className = 'visually-hidden';
    spoken.textContent = text;
    const drawn = document.createElement('span');
    drawn.setAttribute('aria-hidden', 'true');
    text.split(/\s+/).forEach((word, i) => { if (i) drawn.append(' '); drawn.append(makeWord(word)); });
    heading.replaceChildren(spoken, drawn);
    heading.dataset.split = '';
  }

  // ---------- Reveals ----------
  function mountReveals() {
    const groups = [
      ['.band .eyebrow', () => 0],
      ['.band h2[data-split]', () => 0],
      ['.lead, .section-lead', () => 120],
      ['.band p:not(.lead):not(.section-lead):not(.eyebrow):not(.visually-hidden)', () => 160],
      ['.filter, .facts, .links, .contact-actions', () => 200],
      ['.portrait', () => 0],
      ['.card', i => (i % 3) * 90],
      ['.role, .education', () => 0],
      ['.toolkit-row', i => i * 110]
    ];
    const targets = [];
    groups.forEach(([selector, delay]) => main.querySelectorAll(selector).forEach((el, i) => {
      if (el.parentElement.closest('.card, .role, .education, .contact-actions')) return;
      if (el.hasAttribute('data-reveal')) return;
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', `${delay(i)}ms`);
      targets.push(el);
    }));
    // An element clipped away entirely never intersects anything, so the
    // portrait is watched through its parent.
    const watched = new Map();
    targets.forEach(el => {
      const watch = el.matches('.portrait') ? el.parentElement : el;
      watched.set(watch, [...(watched.get(watch) || []), el]);
    });
    let observer = null;
    return {
      configure(still) {
        if (still || !('IntersectionObserver' in window)) {
          observer?.disconnect();
          targets.forEach(el => el.classList.add('is-in'));
          root.classList.remove('reveal-ready');
          return;
        }
        if (observer) return;
        root.classList.add('reveal-ready');
        observer = new IntersectionObserver(entries => entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          watched.get(entry.target).forEach(el => el.classList.add('is-in'));
          observer.unobserve(entry.target);
        }), { rootMargin: '0px 0px -8% 0px', threshold: 0 });
        watched.forEach((els, watch) => { if (els.some(el => !el.classList.contains('is-in'))) observer.observe(watch); });
      },
      reveal(el) { el.classList.add('is-in'); if (watched.has(el)) observer?.unobserve(el); }
    };
  }

  // ---------- Work filter ----------
  function mountFilter() {
    const control = document.querySelector('.filter');
    const cards = [...document.querySelectorAll('.cards .card')];
    const status = document.querySelector('#work-status');
    if (!control || !cards.length) return null;
    const buttons = [...control.querySelectorAll('button')];
    const thumb = control.querySelector('.filter-thumb');
    control.hidden = false;
    cards.forEach((card, i) => card.style.setProperty('--n', `"${String(i + 1).padStart(2, '0')}"`));

    function place() {
      const pressed = buttons.find(b => b.getAttribute('aria-pressed') === 'true');
      thumb.style.width = `${pressed.offsetWidth}px`;
      thumb.style.transform = `translateX(${pressed.offsetLeft - 4}px)`;
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      place();
      const kind = button.dataset.filter;
      // FLIP: note where every card was, change the layout, then animate each
      // one from its old place to its new one.
      const before = new Map(cards.map(card => [card, { rect: card.getBoundingClientRect(), hidden: card.hidden }]));
      cards.forEach(card => { card.hidden = !(kind === 'all' || card.dataset.kind === kind); card.style.transform = ''; });
      const shown = cards.filter(card => !card.hidden);
      status.textContent = kind === 'all' ? `Showing all ${shown.length} projects.` : `Showing ${shown.length} projects ${kind === 'bank' ? 'at the bank' : 'built independently'}.`;
      if (quiet()) { shown.forEach(card => reveals.reveal(card)); return; }
      shown.forEach((card, i) => {
        reveals.reveal(card);
        const was = before.get(card);
        if (was.hidden) {
          card.animate([{ opacity: 0, transform: 'translateY(18px) scale(.97)' }, { opacity: 1, transform: 'none' }],
            { duration: 560, delay: 60 + i * 55, easing: EASE, fill: 'backwards' });
          return;
        }
        const now = card.getBoundingClientRect();
        const dx = was.rect.left - now.left, dy = was.rect.top - now.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        card.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 620, easing: EASE });
      });
    }));
    return { place };
  }

  // ---------- Toolkit marquee ----------
  function mountMarquee() {
    const rows = [...document.querySelectorAll('.toolkit-row')];
    if (!rows.length) return null;
    const lanes = rows.map((row, i) => {
      const list = row.querySelector('.tags');
      const viewport = document.createElement('div');
      viewport.className = 'marquee';
      const track = document.createElement('div');
      track.className = 'marquee-track';
      const copy = list.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      list.replaceWith(viewport);
      track.append(list, copy);
      viewport.append(track);
      const lane = { viewport, track, list, direction: i % 2 ? 1 : -1, offset: 0, speed: 0, span: 0, hover: false };
      viewport.addEventListener('pointerenter', () => { lane.hover = true; });
      viewport.addEventListener('pointerleave', () => { lane.hover = false; });
      return lane;
    });
    let running = false, visible = false, lastTime = null, heading = 1, enabled = false;
    function measure() { lanes.forEach(lane => { lane.span = lane.list.offsetWidth; }); }
    function tick(time) {
      if (!enabled || !visible) { running = false; lastTime = null; return; }
      const elapsed = lastTime === null ? 16.67 : clamp(time - lastTime, 0, 64);
      lastTime = time;
      const velocity = glide.velocity;
      // Scrolling back up turns the conveyor around; scrolling fast speeds it up.
      if (Math.abs(velocity) > .05) heading = Math.sign(velocity);
      const boost = Math.min(Math.abs(velocity) * .45, 1.6);
      lanes.forEach(lane => {
        const want = lane.hover ? 0 : .032 + boost;
        lane.speed = want + (lane.speed - want) * Math.exp(-elapsed / 220);
        lane.offset += lane.direction * heading * lane.speed * elapsed;
        lane.track.style.transform = `translate3d(${-wrapOffset(lane.offset, lane.span)}px,0,0)`;
      });
      requestAnimationFrame(tick);
    }
    function start() { if (!running && enabled && visible) { running = true; requestAnimationFrame(tick); } }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); start(); })
        .observe(document.querySelector('.toolkit-rows'));
    } else visible = true;
    return {
      measure,
      configure(still) {
        enabled = !still;
        lanes.forEach(lane => {
          lane.viewport.classList.toggle('is-running', enabled);
          if (!enabled) lane.track.style.transform = '';
        });
        measure();
        start();
      }
    };
  }

  // ---------- Pointer ----------
  function mountPointerEffects() {
    // Cards tilt toward the pointer, with a light that follows it.
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointermove', event => {
        if (!fine.matches || quiet() || event.pointerType !== 'mouse') return;
        const r = card.getBoundingClientRect();
        const x = (event.clientX - r.left) / r.width, y = (event.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        card.classList.add('is-tilting');
        card.style.transform = `perspective(1000px) rotateX(${((.5 - y) * 4).toFixed(2)}deg) rotateY(${((x - .5) * 5).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.classList.remove('is-tilting'); card.style.transform = ''; });
    });
    // The contact buttons lean toward the pointer, as if magnetised.
    document.querySelectorAll('.contact .button').forEach(button => {
      button.addEventListener('pointermove', event => {
        if (!fine.matches || quiet() || event.pointerType !== 'mouse') return;
        const r = button.getBoundingClientRect();
        const dx = event.clientX - (r.left + r.width / 2), dy = event.clientY - (r.top + r.height / 2);
        button.classList.add('is-magnet');
        button.style.transform = `translate(${(dx * .18).toFixed(2)}px,${(dy * .32).toFixed(2)}px)`;
      });
      button.addEventListener('pointerleave', () => { button.classList.remove('is-magnet'); button.style.transform = ''; });
    });
  }

  // ---------- Keyboard ----------
  // J and K step through the sections, the way a reader skims a feed.
  function mountKeyboard() {
    document.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (event.target.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
      const key = event.key.toLowerCase();
      if (key !== 'j' && key !== 'k') return;
      const y = window.scrollY;
      // The first stop is the opened screen, so stepping back from About
      // lands on the page's own opening rather than all the way on the desk.
      const journey = document.querySelector('#journey');
      const opening = root.classList.contains('is-still') || !journey ? 0 : journey.offsetHeight - window.innerHeight;
      const stops = [opening, ...sections.map(s => glide.offsetOf(s))];
      const next = key === 'j' ? stops.find(top => top > y + 8) : [...stops].reverse().find(top => top < y - 8);
      if (next === undefined && key === 'j') return;
      event.preventDefault();
      glide.to(next ?? 0);
    });
  }
}
