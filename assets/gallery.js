import { mountScene } from './scene.mjs';
const root = document.documentElement;
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-toggle');
const photo = document.querySelector('#photo-dialog');
const photoButton = document.querySelector('#view-photo');
const details = [...document.querySelectorAll('.disclosures details')];
root.dataset.motion = new URLSearchParams(location.search).get('motion') === 'quiet' ? 'quiet' : 'full';
root.classList.add('has-js');
const scene = mountScene();
function updateMotion() {
  const quiet = media.matches || root.dataset.motion === 'quiet';
  motionButton.textContent = quiet ? (media.matches ? 'Motion reduced' : 'Enable motion') : 'Reduce motion';
  motionButton.setAttribute('aria-pressed', String(quiet));
  motionButton.disabled = media.matches;
  document.dispatchEvent(new Event('studio:configuration'));
}
motionButton.addEventListener('click', () => {
  root.dataset.motion = root.dataset.motion === 'quiet' ? 'full' : 'quiet';
  const url = new URL(location.href);
  root.dataset.motion === 'quiet' ? url.searchParams.set('motion','quiet') : url.searchParams.delete('motion');
  try { history.replaceState(null,'',url.href); } catch {}
  updateMotion();
});
media.addEventListener?.('change', updateMotion);
updateMotion();
function setRoute(hash) { try { const url = new URL(location.href); url.hash = hash; history.replaceState(null,'',url.href); } catch {} }
details.forEach(item => item.addEventListener('toggle', () => {
  if (item.open) {
    details.forEach(other => { if (other !== item) other.open = false; });
    setRoute(`about/${item.id}`);
  } else if (location.hash === `#about/${item.id}`) setRoute('about');
}));
function syncRoute() {
  const hash = location.hash;
  if (['#about','#desktop','#about/experience','#about/approach','#about/background','#about/practice'].includes(hash)) {
    scene.enter(true);
    const id = hash.endsWith('/background') ? 'experience' : hash.endsWith('/practice') ? 'approach' : hash.split('/')[1];
    details.forEach(item => { item.open = item.id === id; });
  }
}
window.addEventListener('popstate',syncRoute);
window.addEventListener('hashchange',syncRoute);
syncRoute();
photoButton.addEventListener('click', () => { if (typeof photo.showModal === 'function') { photo.showModal(); document.body.classList.add('photo-open'); } });
document.querySelector('#close-photo').addEventListener('click', () => photo.close());
photo.addEventListener('click', event => { if (event.target === photo) photo.close(); });
photo.addEventListener('close', () => { document.body.classList.remove('photo-open'); photoButton.focus({preventScroll:true}); });
