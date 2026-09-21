import { mountScene } from './scene.mjs';

const root = document.documentElement;
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-toggle');

// Honour ?motion=quiet as a shareable, link-level preference.
root.dataset.motion = new URLSearchParams(location.search).get('motion') === 'quiet' ? 'quiet' : 'full';
root.classList.add('has-js');

mountScene();

function updateMotion() {
  const quiet = media.matches || root.dataset.motion === 'quiet';
  motionButton.textContent = media.matches ? 'Motion reduced by your system' : quiet ? 'Enable motion' : 'Reduce motion';
  motionButton.setAttribute('aria-pressed', String(quiet));
  motionButton.disabled = media.matches;
  document.dispatchEvent(new Event('studio:configuration'));
}

motionButton.addEventListener('click', () => {
  root.dataset.motion = root.dataset.motion === 'quiet' ? 'full' : 'quiet';
  const url = new URL(location.href);
  if (root.dataset.motion === 'quiet') url.searchParams.set('motion', 'quiet');
  else url.searchParams.delete('motion');
  try { history.replaceState(null, '', url.href); } catch {}
  updateMotion();
});

media.addEventListener?.('change', updateMotion);
updateMotion();

document.querySelector('#year').textContent = String(new Date().getFullYear());

// Mark the section currently in view so the masthead reads as navigation.
const sections = [...document.querySelectorAll('main .band')];
const navLinks = new Map([...document.querySelectorAll('.masthead nav a[href^="#"]')].map(a => [a.hash.slice(1), a]));
if ('IntersectionObserver' in window && sections.length) {
  const seen = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? seen.add(entry.target.id) : seen.delete(entry.target.id));
    const current = sections.find(section => seen.has(section.id));
    navLinks.forEach((link, id) => link.setAttribute('aria-current', current && current.id === id ? 'true' : 'false'));
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(section => observer.observe(section));
}
