import { mountScene } from './scene.mjs';
const root = document.documentElement;
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-toggle');
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
  // The default-open disclosure must not rewrite the opening scene's URL.
  if (document.querySelector('#desktop').getAttribute('aria-hidden') === 'true') return;
  if (item.open) {
    setRoute(`about/${item.id}`);
  } else if (location.hash === `#about/${item.id}`) setRoute('about');
}));
function syncRoute() {
  const hash = location.hash;
  if (['#about','#desktop','#about/experience','#about/approach','#about/background','#about/practice'].includes(hash)) {
    scene.enter(true);
    const id = hash.endsWith('/background') ? 'experience' : hash.endsWith('/practice') ? 'approach' : (hash.split('/')[1] || 'experience');
    details.forEach(item => { item.open = item.id === id; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const container = document.querySelector('#about');
      const target = document.getElementById(id);
      if (!target) return;
      const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
      container.scrollTo({top: Math.max(0, container.scrollTop + offset - 24), behavior:'instant'});
      target.querySelector('summary').focus({preventScroll:true});
    }));
  }
}
window.addEventListener('popstate',syncRoute);
window.addEventListener('hashchange',syncRoute);
syncRoute();
