const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const stage = $('#stage');
const stageWrap = $('#stageWrap');
const layerA = $('#layerA');
const layerB = $('#layerB');
const mask = $('#mask');
const badge = $('#badge');
const sceneList = $('#sceneList');
const sceneCount = $('#sceneCount');
const jsonOut = $('#jsonOut');
const idInput = $('#idInput');
const panSelect = $('#panSelect');
const maxX = $('#maxX');
const maxY = $('#maxY');
const transitionSelect = $('#transitionSelect');

let activeIndex = 0;
let activeLayer = layerA;
let passiveLayer = layerB;
let isTransitioning = false;
let drag = null;

function placeholder({ title, subtitle, a, b, c, wide = false }) {
  const vb = wide ? '0 0 1600 900' : '0 0 707 1536';
  const w = wide ? 1600 : 707;
  const h = wide ? 900 : 1536;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">
    <defs>
      <radialGradient id="g" cx="38%" cy="22%" r="66%"><stop offset="0" stop-color="${a}"/><stop offset=".58" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="18%" cy="18%" r="18%" fill="rgba(255,255,255,.18)" filter="url(#soft)"/>
    <circle cx="78%" cy="32%" r="22%" fill="rgba(255,220,180,.22)" filter="url(#soft)"/>
    <circle cx="58%" cy="76%" r="31%" fill="rgba(255,185,220,.15)" filter="url(#soft)"/>
    <path d="M0 ${h * .68} C ${w * .22} ${h * .59}, ${w * .44} ${h * .77}, ${w} ${h * .61} L ${w} ${h} L0 ${h}Z" fill="rgba(30,18,24,.36)"/>
    <rect x="${w * .08}" y="${h * .1}" width="${w * .84}" height="${h * .78}" rx="38" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="4"/>
    <text x="50%" y="46%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="${wide ? 70 : 48}" font-weight="800" fill="rgba(255,255,255,.88)">${title}</text>
    <text x="50%" y="52%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="${wide ? 28 : 24}" fill="rgba(255,255,255,.68)">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

let scenes = [
  {
    id: 'coffee_001_base',
    label: '咖啡角远景 / 环境图',
    src: placeholder({ title: 'coffee_001_base', subtitle: '远景：环境、窗、咖啡热气', a: '#ffd2bf', b: '#b987a6', c: '#24162b' }),
    panMode: 'static',
    defaultPosition: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
    maxMove: { x: 0, y: 0 },
    transition: 'soft-fade',
    effects: ['steam', 'sparkles', 'warm']
  },
  {
    id: 'coffee_002_lap_closeup',
    label: '坐到 Alex 腿上 / 第一人称近景',
    src: placeholder({ title: 'coffee_002_lap_closeup', subtitle: '近景：手臂环脖子、暖光靠近', a: '#ffe0c0', b: '#c97891', c: '#1d1322' }),
    panMode: 'pan-y',
    defaultPosition: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
    maxMove: { x: 0, y: 90 },
    transition: 'zoom-blur',
    effects: ['steam', 'warm']
  },
  {
    id: 'wide_window_test_001',
    label: '横向大图 pan-x 测试',
    src: placeholder({ title: 'wide_window_test_001', subtitle: '横图：只允许左右拖动', a: '#a8d9ff', b: '#8069c8', c: '#171c33', wide: true }),
    panMode: 'pan-x',
    defaultPosition: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
    maxMove: { x: 180, y: 0 },
    transition: 'light-sweep',
    effects: ['sparkles']
  },
  {
    id: 'rain_glass_test_001',
    label: '雨雾玻璃感测试',
    src: placeholder({ title: 'rain_glass_test_001', subtitle: '雨 / 雾 / 玻璃叠层', a: '#d7e8ff', b: '#6a7fb1', c: '#131b2a' }),
    panMode: 'pan-xy',
    defaultPosition: { x: 0, y: 0 },
    position: { x: 0, y: 0 },
    maxMove: { x: 80, y: 120 },
    transition: 'dream-ripple',
    effects: ['rainFog', 'sparkles']
  }
];

const current = () => scenes[activeIndex];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function movable(scene, axis) {
  if (scene.panMode === 'static') return false;
  if (scene.panMode === 'pan-xy') return true;
  return scene.panMode === `pan-${axis}`;
}
function applyLayer(layer, scene) {
  layer.style.backgroundImage = `url("${scene.src}")`;
  layer.style.backgroundPosition = `calc(50% + ${scene.position.x}px) calc(50% + ${scene.position.y}px)`;
  layer.style.backgroundSize = 'cover';
}
function setFx(scene) {
  $$('.fx').forEach(el => el.classList.remove('on'));
  scene.effects.forEach(id => $('#' + id)?.classList.add('on'));
}
function makeSparkles() {
  const box = $('#sparkles');
  box.innerHTML = '';
  Array.from({ length: 30 }).forEach(() => {
    const dot = document.createElement('i');
    dot.style.setProperty('--x', `${8 + Math.random() * 84}%`);
    dot.style.setProperty('--y', `${8 + Math.random() * 84}%`);
    dot.style.setProperty('--s', `${1.8 + Math.random() * 3.6}px`);
    dot.style.setProperty('--t', `${2.2 + Math.random() * 3.4}s`);
    dot.style.setProperty('--d', `${Math.random() * -4}s`);
    box.appendChild(dot);
  });
}
function renderList() {
  sceneCount.textContent = `${scenes.length} scenes`;
  sceneList.innerHTML = '';
  scenes.forEach((scene, index) => {
    const item = document.createElement('button');
    item.className = `sceneItem ${index === activeIndex ? 'on' : ''}`;
    item.type = 'button';
    item.innerHTML = `<span class="thumb" style="background-image:url('${scene.src}')"></span><span><span class="name">${scene.id}</span><span class="small">${scene.label}</span></span><span class="mode">${scene.panMode}</span>`;
    item.addEventListener('click', () => go(index, scene.transition));
    sceneList.appendChild(item);
  });
}
function renderForm() {
  const scene = current();
  idInput.value = scene.id;
  panSelect.value = scene.panMode;
  maxX.value = scene.maxMove.x;
  maxY.value = scene.maxMove.y;
  transitionSelect.value = scene.transition;
  $$('.checks input').forEach(input => input.checked = scene.effects.includes(input.value));
  badge.textContent = `${scene.panMode} · x:${Math.round(scene.position.x)} y:${Math.round(scene.position.y)}`;
}
function renderJson() {
  jsonOut.textContent = JSON.stringify({
    lab: 'scene-motion-lab',
    activeSceneId: current().id,
    scenes: scenes.map(({ src, ...scene }) => ({ ...scene, src: src.startsWith('data:') || src.startsWith('blob:') ? '[local-or-placeholder-image]' : src }))
  }, null, 2);
}
function renderAll() {
  applyLayer(activeLayer, current());
  setFx(current());
  renderList();
  renderForm();
  renderJson();
}
function runMask(type) {
  mask.className = 'mask';
  void mask.offsetWidth;
  if (['warm-mask', 'light-sweep', 'dark-fade', 'dream-ripple'].includes(type)) {
    mask.classList.add(type);
    setTimeout(() => mask.className = 'mask', 980);
  }
}
function go(nextIndex, transition = current().transition) {
  if (isTransitioning || nextIndex === activeIndex) return;
  isTransitioning = true;
  const nextScene = scenes[nextIndex];
  const leaving = activeLayer;
  const entering = passiveLayer;
  applyLayer(entering, nextScene);
  stage.className = `stage transition-${transition}`;
  leaving.classList.add('leaving');
  entering.classList.add('entering');
  runMask(transition);
  setTimeout(() => {
    leaving.className = 'scene';
    entering.className = 'scene active';
    activeIndex = nextIndex;
    activeLayer = entering;
    passiveLayer = leaving;
    stage.className = 'stage';
    setFx(nextScene);
    renderList();
    renderForm();
    renderJson();
    isTransitioning = false;
  }, 940);
}
function saveForm() {
  const scene = current();
  scene.id = idInput.value.trim() || scene.id;
  scene.panMode = panSelect.value;
  scene.maxMove.x = Number(maxX.value) || 0;
  scene.maxMove.y = Number(maxY.value) || 0;
  scene.transition = transitionSelect.value;
  scene.effects = $$('.checks input:checked').map(input => input.value);
  scene.position.x = clamp(scene.position.x, -scene.maxMove.x, scene.maxMove.x);
  scene.position.y = clamp(scene.position.y, -scene.maxMove.y, scene.maxMove.y);
  renderAll();
}
function down(e) {
  const scene = current();
  if (scene.panMode === 'static' || isTransitioning) return;
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: scene.position.x, oy: scene.position.y };
  activeLayer.classList.add('dragging');
  stage.setPointerCapture(e.pointerId);
}
function move(e) {
  if (!drag) return;
  const scene = current();
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (movable(scene, 'x')) scene.position.x = clamp(drag.ox + dx, -scene.maxMove.x, scene.maxMove.x);
  if (movable(scene, 'y')) scene.position.y = clamp(drag.oy + dy, -scene.maxMove.y, scene.maxMove.y);
  applyLayer(activeLayer, scene);
  renderForm();
  renderJson();
}
function up(e) {
  if (!drag) return;
  try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
  activeLayer.classList.remove('dragging');
  drag = null;
}

$('#prevBtn').addEventListener('click', () => go((activeIndex - 1 + scenes.length) % scenes.length));
$('#nextBtn').addEventListener('click', () => go((activeIndex + 1) % scenes.length));
$('#walkBtn').addEventListener('click', () => {
  const from = scenes.findIndex(s => s.id === 'coffee_001_base');
  const to = scenes.findIndex(s => s.id === 'coffee_002_lap_closeup');
  if (activeIndex !== from && from >= 0) {
    go(from, 'soft-fade');
    setTimeout(() => go(to, 'zoom-blur'), 1040);
  } else if (to >= 0) {
    go(to, 'zoom-blur');
    setTimeout(() => runMask('warm-mask'), 120);
  }
});
$('#applyBtn').addEventListener('click', saveForm);
$('#resetBtn').addEventListener('click', () => { current().position = { ...current().defaultPosition }; renderAll(); });
$$('.checks input').forEach(input => input.addEventListener('change', saveForm));
[panSelect, transitionSelect, maxX, maxY, idInput].forEach(el => el.addEventListener('change', saveForm));
$$('.ratioBtns button').forEach(btn => btn.addEventListener('click', () => { stageWrap.className = `stageWrap ${btn.dataset.ratio}`; }));
$('#debugBtn').addEventListener('click', () => document.body.classList.toggle('debug'));
$('#copyBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(jsonOut.textContent);
    $('#copyBtn').textContent = '已复制';
  } catch (_) {
    $('#copyBtn').textContent = '复制失败';
  }
  setTimeout(() => $('#copyBtn').textContent = '复制', 900);
});
$('#upload').addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '_').toLowerCase();
  scenes.push({ id: `local_${base || 'image'}_${Date.now().toString().slice(-5)}`, label: `本地导入：${file.name}`, src: url, panMode: 'pan-xy', defaultPosition: { x: 0, y: 0 }, position: { x: 0, y: 0 }, maxMove: { x: 140, y: 140 }, transition: 'zoom-blur', effects: [] });
  go(scenes.length - 1, 'zoom-blur');
  e.target.value = '';
});
stage.addEventListener('pointerdown', down);
stage.addEventListener('pointermove', move);
stage.addEventListener('pointerup', up);
stage.addEventListener('pointercancel', up);
stage.addEventListener('lostpointercapture', up);
makeSparkles();
renderAll();
