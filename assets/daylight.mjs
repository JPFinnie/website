// The desk keeps the visitor's hours. The opening scene is lit for the time
// where they are — dawn, day, dusk or night — and the ending is a little later
// again, so time passes while they read. A footer switch tries the others, and
// ?light=night (or dawn, day, dusk) shares a particular hour.
export const DAYPARTS = Object.freeze(['dawn', 'day', 'dusk', 'night']);
const NAMES = { dawn: 'dawn', day: 'daytime', dusk: 'dusk', night: 'night' };
// An hour that stands for each part, for greeting a visitor who picked one.
const TYPICAL = { dawn: 6, day: 13, dusk: 18, night: 23 };

export function daypartAt(hour) {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}
export const laterThan = part => DAYPARTS[(DAYPARTS.indexOf(part) + 1) % DAYPARTS.length];

export function greetingAt(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning.';
  if (hour >= 12 && hour < 17) return 'Good afternoon.';
  if (hour >= 17 && hour < 22) return 'Good evening.';
  return 'Up late?';
}

// The switch steps: your time → dawn → day → dusk → night → your time.
export const nextChoice = choice => choice === 'auto' ? DAYPARTS[0] : choice === 'night' ? 'auto' : laterThan(choice);
export const parseChoice = value => DAYPARTS.includes(value) ? value : 'auto';

export function mountDaylight() {
  const opening = document.querySelector('#journey');
  const ending = document.querySelector('#outro');
  const greeting = document.querySelector('.screen-greeting');
  const button = document.querySelector('#daylight-toggle');
  let choice = parseChoice(new URLSearchParams(location.search).get('light'));

  function apply() {
    const hour = new Date().getHours();
    const part = choice === 'auto' ? daypartAt(hour) : choice;
    if (opening) opening.dataset.daypart = part;
    if (ending) ending.dataset.daypart = laterThan(part);
    if (greeting) greeting.textContent = greetingAt(choice === 'auto' ? hour : TYPICAL[part]);
    if (button) button.textContent = choice === 'auto' ? `Desk light: ${NAMES[part]} (your time)` : `Desk light: ${NAMES[part]}`;
  }

  if (button) {
    button.hidden = false;
    button.addEventListener('click', () => {
      choice = nextChoice(choice);
      const url = new URL(location.href);
      if (choice === 'auto') url.searchParams.delete('light'); else url.searchParams.set('light', choice);
      try { history.replaceState(null, '', url.href); } catch {}
      apply();
    });
  }
  apply();
  // A visitor who stays past sunset sees the light change.
  setInterval(() => { if (choice === 'auto') apply(); }, 5 * 60 * 1000);
  return { apply };
}
