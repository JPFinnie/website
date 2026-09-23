import { mountScene, mountOutro } from './scene.mjs';
import { mountGlide } from './glide.mjs';
import { mountEffects } from './effects.mjs';
import { mountViewer } from './viewer.mjs';
import { mountCursor } from './cursor.mjs';
import { mountDaylight } from './daylight.mjs';

const root = document.documentElement;
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-toggle');

// Honour ?motion=quiet as a shareable, link-level preference.
root.dataset.motion = new URLSearchParams(location.search).get('motion') === 'quiet' ? 'quiet' : 'full';
root.classList.add('has-js');

const quiet = () => media.matches || root.dataset.motion === 'quiet';
mountDaylight();
const glide = mountGlide({ quiet });
mountScene({ glide });
mountEffects({ glide, quiet });
mountOutro({ glide });
const cursor = mountCursor({ quiet });
mountViewer({ glide, quiet, cursor });

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
