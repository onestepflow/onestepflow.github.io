/* Figure 1: rates exported by scripts/export-overview.py. No chart dependencies. */
(() => {
  const container = document.querySelector('#overview-interactive');
  const svg = document.querySelector('#overview-chart');
  const tooltip = document.querySelector('#overview-tooltip');
  if (!container || !svg || !tooltip) return;
  const ns = 'http://www.w3.org/2000/svg';
  const names = ['DiT', 'SmolVLA', 'X-VLA', 'FLOWER', 'π₀.₅', 'LAP', 'XR-0'];
  const sizes = ['211M', '450M', '900M', '947M', '3.3B', '3.3B', '4.7B'];
  const paths = ['M-5,-3 -3,-5 0,-2 3,-5 5,-3 2,0 5,3 3,5 0,2 -3,5 -5,3 -2,0Z',
    'M-5,-4 5,-4 0,5Z', 'M0,-5 5,-1 3,5 -3,5 -5,-1Z', 'M-4,-4 H4 V4 H-4Z',
    'M0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2Z',
    'M0,-5 5,4 -5,4Z', 'M-2,-5 H2 V-2 H5 V2 H2 V5 H-2 V2 H-5 V-2 H-2Z'];
  const suiteColors = ['#882255', '#117733', '#cc6677', '#ddcc77'];
  const calvinColors = ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'];
  function node(tag, attrs, parent = svg, text) {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text !== undefined) el.textContent = text;
    parent.append(el);
    return el;
  }
  function color(p) {
    if (p.panel === 0) return suiteColors[['Spatial', 'Object', 'Goal', 'LIBERO-10'].indexOf(p.benchmark.split(' · ')[1])];
    if (p.panel === 1) return p.benchmark.includes('Randomized') ? '#ff6600' : '#87ceeb';
    if (p.panel === 2) return calvinColors[Number(p.benchmark.slice(-1)) - 1];
    return '#4477aa';
  }
  const origin = (panel) => 47 + panel * 294;
  const sx = (p) => origin(p.panel) + (p.x + 3) * 240 / 106;
  const sy = (p) => 281 - (p.y + 3) * 240 / 106;
  let active = [];
  let targets = [];
  function hide() {
    tooltip.hidden = true;
    active.forEach(el => el.classList.remove('is-active'));
    active = [];
  }
  function show(indices) {
    hide();
    tooltip.replaceChildren();
    indices.forEach(i => {
      const { point: p, element } = targets[i];
      active.push(element);
      element.classList.add('is-active');
      const row = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = `${p.model} (${sizes[names.indexOf(p.model)]}) · ${p.benchmark}`;
      const values = document.createElement('div');
      values.textContent = `${p.x.toFixed(2)}% (${p.steps}-step reference) · ${p.y.toFixed(2)}% (1 step)`;
      row.append(title, values);
      tooltip.append(row);
    });
    tooltip.hidden = false;
    const bounds = active[0].getBoundingClientRect();
    const box = container.getBoundingClientRect();
    const left = Math.max(0, Math.min(bounds.left - box.left, box.width - tooltip.offsetWidth));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${bounds.bottom - box.top + 10}px`;
  }
  fetch('assets/overview-points.json').then(r => {
    if (!r.ok) throw new Error('Figure data unavailable');
    return r.json();
  }).then(points => {
    ['LIBERO / LIBERO+', 'RoboTwin', 'CALVIN ABC→D', 'Real world'].forEach((title, panel) => {
      const left = origin(panel);
      node('text', { x: left + 120, y: 24, 'text-anchor': 'middle', class: 'overview-title' }, svg, title);
      node('rect', { x: left, y: 41, width: 240, height: 240, fill: 'white', stroke: '#333' });
      [0, 25, 50, 75, 100].forEach(v => {
        const x = sx({ panel, x: v }), y = sy({ y: v });
        node('path', { d: `M${x},41 V281 M${left},${y} H${left + 240}`, stroke: '#e4e4e4', fill: 'none' });
        node('text', { x, y: 299, 'text-anchor': 'middle' }, svg, v);
        if (!panel) node('text', { x: left - 8, y: y + 4, 'text-anchor': 'end' }, svg, v);
      });
      node('path', { d: `M${left},281 L${left + 240},41`, stroke: '#222', 'stroke-dasharray': '5 3' });
      node('text', { x: left + 120, y: 320, 'text-anchor': 'middle' }, svg, 'ref-step SR (%)');
      const subset = points.filter(p => p.panel === panel);
      const within = Math.round(100 * subset.filter(p => Math.abs(p.x - p.y) <= 3 + 1e-9).length / subset.length);
      node('text', { x: left + 232, y: 268, 'text-anchor': 'end', class: 'overview-note' }, svg, `|Δ| ≤ 3 pp: ${within}%`);
      const labels = panel === 0 ? ['Spatial', 'Object', 'Goal', 'LIBERO-10'] : panel === 1 ? ['Clean', 'Randomized'] : panel === 2 ? ['SR1', 'SR2', 'SR3', 'SR4', 'SR5'] : ['Real world suite'];
      labels.forEach((label, i) => {
        const fill = panel === 0 ? suiteColors[i] : panel === 1 ? ['#87ceeb', '#ff6600'][i] : panel === 2 ? calvinColors[i] : '#4477aa';
        node('circle', { cx: left + 14, cy: 58 + i * 17, r: 4, fill, stroke: '#333' });
        node('text', { x: left + 25, y: 62 + i * 17 }, svg, label);
      });
      if (!panel) {
        node('circle', { cx: left + 14, cy: 126, r: 5, fill: '#bbb', stroke: '#111', 'stroke-width': 1.6 }, svg);
        node('text', { x: left + 25, y: 130, class: 'overview-small' }, svg, 'LIBERO');
        node('circle', { cx: left + 14, cy: 143, r: 5, fill: '#bbb', stroke: 'none' }, svg);
        node('text', { x: left + 25, y: 147, class: 'overview-small' }, svg, 'LIBERO+');
      }
    });
    node('text', { transform: 'translate(13 161) rotate(-90)', 'text-anchor': 'middle' }, svg, '1-step SR (%)');
    names.forEach((name, i) => {
      node('path', { d: paths[i], transform: `translate(${95 + i * 163} 355)`, fill: '#aab2bf', stroke: '#263242' });
      node('text', { x: 108 + i * 163, y: 359 }, svg, `${name} (${sizes[i]})`);
    });
    targets = points.map((p, i) => {
      const label = `${p.model}, ${p.benchmark}, x: ${p.x.toFixed(2)} percent reference (${p.steps} steps), y: ${p.y.toFixed(2)} percent one step`;
      const element = node('path', { d: paths[names.indexOf(p.model)], transform: `translate(${sx(p)} ${sy(p)})`,
        fill: color(p), stroke: p.benchmark.startsWith('LIBERO+') ? 'none' : p.panel === 0 ? '#111' : '#263242',
        'stroke-width': p.panel === 0 ? 1.6 : 0.8,
        tabindex: i === 0 ? 0 : -1, role: 'button', 'aria-label': label, class: 'overview-point' });
      element.addEventListener('focus', () => show([i]));
      element.addEventListener('blur', hide);
      element.addEventListener('keydown', event => {
        if (event.key === 'Escape') return hide();
        const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!delta && !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        if (!delta) return show([i]);
        const next = targets[(i + delta + targets.length) % targets.length].element;
        element.setAttribute('tabindex', '-1');
        next.setAttribute('tabindex', '0');
        next.focus();
      });
      return { point: p, element };
    });
    function pick(event) {
      const rect = svg.getBoundingClientRect();
      const x = (event.clientX - rect.left) * 1200 / rect.width;
      const y = (event.clientY - rect.top) * 390 / rect.height;
      const distances = points.map(p => Math.hypot(sx(p) - x, sy(p) - y));
      const best = Math.min(...distances);
      if (best > 10 * 1200 / rect.width) return hide();
      // Include coincident markers so covered points remain discoverable.
      const nearest = points[distances.indexOf(best)];
      show(points.flatMap((p, i) => Math.hypot(sx(p) - sx(nearest), sy(p) - sy(nearest)) < 0.5 ? [i] : []));
    }
    svg.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') pick(e); });
    svg.addEventListener('pointerdown', pick);
    container.addEventListener('pointerleave', () => {
      if (!active.includes(document.activeElement)) hide();
    });
    container.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    container.querySelector('.overview-scroll').addEventListener('scroll', () => {
      const focused = targets.findIndex(t => t.element === document.activeElement);
      if (focused >= 0 && !tooltip.hidden) show([focused]);
      else hide();
    });
    window.addEventListener('resize', hide);
    document.addEventListener('pointerdown', e => { if (!container.contains(e.target)) hide(); });
    document.querySelector('#overview-fallback').hidden = true;
    container.hidden = false;
  }).catch(() => { /* Keep the original figure if data cannot be loaded. */ });
})();
