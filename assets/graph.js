/* james-finnie.com — hero knowledge graph ("obsidian brain", vanilla canvas)
   An organisational context graph: 5 clusters (people / decisions / docs /
   agents / data), gentle force layout, cursor-reactive highlighting. */

(function(){
'use strict';

const canvas = document.getElementById('graph');
if (!canvas || !canvas.getContext) return;
const ctx = canvas.getContext('2d');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- palette (mirrors CSS tokens / legend) ---- */
const CLUSTERS = [
  { key: 'people',    color: '#22d3ee', hub: 'team' },
  { key: 'decisions', color: '#818cf8', hub: 'PR-FAQ' },
  { key: 'docs',      color: '#34d399', hub: 'wiki' },
  { key: 'agents',    color: '#fbbf24', hub: 'skills.md' },
  { key: 'data',      color: '#f472b6', hub: 'context' },
];
const MEMBER_NAMES = {
  people:    ['j.doe', 'a.khan', 'm.chen', 's.patel', 'r.silva', 'k.wong', 'design', 'eng', 'exec'],
  decisions: ['adr-014', 'bet-07', 'one-pager', 'six-pager', 'tradeoff', 'kill-list', 'why', 'scope'],
  docs:      ['notes.md', 'spec-v2', 'runbook', 'faq', 'brief', 'readme', 'postmortem', 'glossary'],
  agents:    ['loop-01', 'evals', 'prompts', 'tools', 'critic', 'planner', 'builder', 'review'],
  data:      ['events', 'metrics', 'graph-db', 'embeddings', 'sessions', 'signals', 'index', 'traces'],
};
const DIM = 'rgba(125,138,155,';
const EDGE = 'rgba(168,179,194,';
const HI = '#67e8f9';

/* ---- graph data ---- */
const nodes = [], edges = [];
const rand = (a, b) => a + Math.random() * (b - a);

CLUSTERS.forEach((c, ci) => {
  const hub = { id: nodes.length, cluster: ci, label: c.hub, hub: true, r: 5, x: 0, y: 0, vx: 0, vy: 0 };
  nodes.push(hub);
  MEMBER_NAMES[c.key].forEach(name => {
    const n = { id: nodes.length, cluster: ci, label: name, hub: false, r: rand(2.2, 3.6), x: 0, y: 0, vx: 0, vy: 0 };
    nodes.push(n);
    edges.push([hub.id, n.id]);
  });
});
// intra-cluster cross links (members of same cluster)
CLUSTERS.forEach((c, ci) => {
  const members = nodes.filter(n => n.cluster === ci && !n.hub);
  for (let i = 0; i < 4; i++) {
    const a = members[Math.floor(Math.random() * members.length)];
    const b = members[Math.floor(Math.random() * members.length)];
    if (a !== b) edges.push([a.id, b.id]);
  }
});
// hub ring + sparse cross-cluster links
const hubs = nodes.filter(n => n.hub);
for (let i = 0; i < hubs.length; i++) edges.push([hubs[i].id, hubs[(i + 1) % hubs.length].id]);
edges.push([hubs[0].id, hubs[2].id], [hubs[1].id, hubs[3].id], [hubs[2].id, hubs[4].id]);
for (let i = 0; i < 6; i++) {
  const a = nodes[Math.floor(Math.random() * nodes.length)];
  const b = nodes[Math.floor(Math.random() * nodes.length)];
  if (a !== b && a.cluster !== b.cluster && !a.hub && !b.hub) edges.push([a.id, b.id]);
}
const neighbours = nodes.map(() => new Set());
edges.forEach(([a, b]) => { neighbours[a].add(b); neighbours[b].add(a); });

/* ---- sizing ---- */
let W = 0, H = 0, anchors = [];
function resize(){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const R = Math.min(W, H) * .30;
  anchors = CLUSTERS.map((c, i) => {
    const a = -Math.PI / 2 + i * (2 * Math.PI / CLUSTERS.length);
    return { x: W / 2 + Math.cos(a) * R, y: H / 2 + Math.sin(a) * R };
  });
}
resize();
// seed positions around anchors
nodes.forEach(n => {
  const a = anchors[n.cluster];
  n.x = a.x + rand(-30, 30);
  n.y = a.y + rand(-30, 30);
});
new ResizeObserver(() => { resize(); if (!running) draw(); }).observe(canvas);

/* ---- pointer ---- */
const pointer = { x: -1e4, y: -1e4, active: false };
let hovered = null;
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;       // touch: autonomous drift only
  const r = canvas.getBoundingClientRect();
  pointer.x = e.clientX - r.left;
  pointer.y = e.clientY - r.top;
  pointer.active = true;
  if (reduceMotion) { pickHovered(); draw(); }
});
canvas.addEventListener('pointerleave', () => {
  pointer.active = false; pointer.x = -1e4; pointer.y = -1e4; hovered = null;
  if (reduceMotion) draw();
});
function pickHovered(){
  hovered = null;
  let best = 26 * 26;
  for (const n of nodes) {
    const dx = n.x - pointer.x, dy = n.y - pointer.y, d = dx * dx + dy * dy;
    if (d < best) { best = d; hovered = n; }
  }
}

/* ---- click ripple ---- */
const ripples = [];
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  let target = null, best = 30 * 30;
  for (const n of nodes) {
    const dx = n.x - x, dy = n.y - y, d = dx * dx + dy * dy;
    if (d < best) { best = d; target = n; }
  }
  if (target && !reduceMotion) ripples.push({ x: target.x, y: target.y, r: target.r + 2, a: .6, color: CLUSTERS[target.cluster].color });
});

/* ---- physics ---- */
function step(){
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const a = anchors[n.cluster];
    // anchor pull
    n.vx += (a.x - n.x) * .0024;
    n.vy += (a.y - n.y) * .0024;
    // repulsion
    for (let j = i + 1; j < nodes.length; j++) {
      const m = nodes[j];
      let dx = n.x - m.x, dy = n.y - m.y;
      let d2 = dx * dx + dy * dy;
      if (d2 < 1) d2 = 1;
      if (d2 < 9000) {
        const f = 9 / d2;
        dx *= f; dy *= f;
        n.vx += dx; n.vy += dy;
        m.vx -= dx; m.vy -= dy;
      }
    }
    // cursor as a soft attractor
    if (pointer.active) {
      const dx = pointer.x - n.x, dy = pointer.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < 140 && d > 1) {
        const f = .012 * (1 - d / 140);
        n.vx += dx / d * f * 60;
        n.vy += dy / d * f * 60;
      }
    }
    // ambient drift
    n.vx += rand(-.008, .008);
    n.vy += rand(-.008, .008);
  }
  // edge springs
  for (const [ai, bi] of edges) {
    const a = nodes[ai], b = nodes[bi];
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 1;
    const rest = (a.hub || b.hub) ? 40 : 50;
    const f = (d - rest) * .0025;
    const fx = dx / d * f, fy = dy / d * f;
    a.vx += fx; a.vy += fy;
    b.vx -= fx; b.vy -= fy;
  }
  // integrate
  for (const n of nodes) {
    n.vx *= .9; n.vy *= .9;
    n.x += Math.max(-2.4, Math.min(2.4, n.vx));
    n.y += Math.max(-2.4, Math.min(2.4, n.vy));
    const pad = 14;
    n.x = Math.max(pad, Math.min(W - pad, n.x));
    n.y = Math.max(pad, Math.min(H - pad, n.y));
  }
}

/* ---- render ---- */
function draw(){
  ctx.clearRect(0, 0, W, H);
  const hi = hovered ? neighbours[hovered.id] : null;

  // edges
  ctx.lineWidth = 1;
  for (const [ai, bi] of edges) {
    const a = nodes[ai], b = nodes[bi];
    let stroke = EDGE + '.16)';
    if (hovered) {
      stroke = (ai === hovered.id || bi === hovered.id) ? 'rgba(103,232,249,.6)' : EDGE + '.05)';
    }
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    rp.r += 1.6; rp.a -= .018;
    if (rp.a <= 0) { ripples.splice(i, 1); continue; }
    ctx.strokeStyle = rp.color;
    ctx.globalAlpha = rp.a;
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // nodes
  for (const n of nodes) {
    const isHover = hovered === n;
    const isNear = hi && hi.has(n.id);
    let alpha = 1;
    if (hovered && !isHover && !isNear) alpha = .22;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = isHover ? HI : CLUSTERS[n.cluster].color;
    if (isHover) { ctx.shadowColor = HI; ctx.shadowBlur = 14; }
    ctx.beginPath();
    ctx.arc(n.x, n.y, isHover ? n.r + 1.5 : n.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // labels: hubs always, others on hover/neighbour
    if (n.hub || isHover || (isNear && n.r > 3)) {
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = isHover ? HI : (n.hub ? DIM + (hovered && !isHover && !isNear ? '.3)' : '.9)') : DIM + '.75)');
      ctx.fillText(n.label, n.x + n.r + 5, n.y + 3);
    }
    ctx.globalAlpha = 1;
  }
}

/* ---- loop / lifecycle ---- */
let running = false, rafId = 0, visible = true;

function frame(){
  if (!reduceMotion) { pickHovered(); step(); }
  draw();
  if (running) rafId = requestAnimationFrame(frame);
}
function setRunning(next){
  if (next === running) return;
  running = next;
  if (running) rafId = requestAnimationFrame(frame);
  else cancelAnimationFrame(rafId);
}

// settle the layout before first paint
for (let i = 0; i < 240; i++) step();

if (reduceMotion) {
  draw();  // static frame; hover still re-draws via pointermove handler
} else {
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    setRunning(visible && !document.hidden);
  }, { threshold: 0 });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
}

})();
