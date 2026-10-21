/*
 * Numerical results transcribed from Tables 2 (simulation) and 3 (real world,
 * pooled) of the camera-ready manuscript.
 * Each entry is [reference-step success rate, one-step success rate, TOST verdict,
 * 90% CI low, 90% CI high], with the CI on the paired gap SR_ref − SR_1 in pp.
 * Simulation verdicts follow Table 2's colouring. No real-world 90% CI lies within
 * ±3 pp, so the real-world view shows the CI itself instead of the verdict.
 * CIs come from TOST_analysis/gen_tost_verdict_tables.py (δ = 3 pp, α = 0.05).
 */
const models = [
  {
    name: 'DiT',
    detail: '211M · baseline',
    steps: 10,
    scores: {
      libero: [89.9, 91.9, 'inc', -3.6, -0.27],
      libero10: [68.4, 53.8, 'ref', 10.06, 19.05],
      plus: [30.8, 28.6, 'inc', 1.29, 3.1],
      plus10: [22, 14.5, 'ref', 6.04, 8.81],
      real: [28.5, 30, 'inc', -5.01, 2.01],
    },
  },
  {
    name: 'SmolVLA',
    detail: '450M parameters',
    steps: 10,
    scores: {
      libero: [72.2, 82, 'one', -11.91, -7.68],
      libero10: [34.6, 44.2, 'one', -13.6, -5.55],
      plus: [4.8, 5, 'eq', -0.72, 0.21],
      plus10: [1.2, 0.7, 'eq', 0.13, 1.01],
    },
  },
  {
    name: 'X-VLA',
    detail: '900M parameters',
    steps: 10,
    scores: {
      libero: [97.6, 97.3, 'eq', -0.36, 0.91],
      libero10: [96.2, 96, 'eq', -1.48, 1.89],
      plus: [70.3, 70.4, 'eq', -0.57, 0.28],
      plus10: [67.4, 66.9, 'eq', -0.42, 1.45],
      calvin: [71, 70, 'inc', -1.03, 3.03],
      twin: [65.5, 65.1, 'eq', -0.23, 1.07],
      twinrand: [24.3, 23.3, 'eq', 0.39, 1.69],
      real: [29.2, 30.5, 'inc', -3.36, 0.85],
    },
  },
  {
    name: 'FLOWER',
    detail: '947M parameters',
    steps: 4,
    // FLOWER's authors use 5 steps on real hardware.
    realSteps: 5,
    scores: {
      libero: [97.3, 96.5, 'eq', -0.13, 1.75],
      libero10: [89.6, 83.6, 'ref', 3.04, 9],
      plus: [77.6, 74.4, 'inc', 2.51, 3.88],
      plus10: [72, 59.3, 'ref', 11.24, 14.24],
      calvin: [78.5, 75.5, 'inc', 0.41, 4.59],
      real: [59.8, 63.2, 'inc', -7.72, 0.74],
    },
  },
  {
    name: 'π₀.₅',
    detail: '3.3B parameters',
    steps: 10,
    scores: {
      libero: [98.5, 98.9, 'eq', -0.95, 0.26],
      libero10: [94.4, 94.4, 'eq', -2.1, 2.1],
      plus: [86.4, 86.3, 'eq', -0.39, 0.63],
      plus10: [77.6, 76.1, 'eq', 0.25, 2.62],
      real: [79, 78.5, 'inc', -2.97, 3.98],
    },
  },
  {
    name: 'LAP',
    detail: '3.3B parameters',
    steps: 10,
    scores: {
      libero: [97.7, 98.8, 'eq', -1.84, -0.33],
      libero10: [90.2, 92, 'inc', -4.35, 0.72],
      plus: [77.6, 76.9, 'eq', 0.08, 1.33],
      plus10: [66.4, 65.7, 'eq', -0.51, 2.02],
      real: [74.2, 70.5, 'inc', 0.74, 6.76],
    },
  },
  {
    name: 'XR-0',
    detail: '4.7B parameters',
    steps: 5,
    scores: {
      libero: [97.3, 97, 'eq', -0.34, 0.89],
      libero10: [96.8, 97.4, 'eq', -2.18, 0.93],
      plus: [75.8, 76.5, 'eq', -1.22, -0.17],
      plus10: [70.2, 69.6, 'eq', -0.46, 1.74],
      calvin: [87.2, 88.1, 'eq', -2.33, 0.52],
      real: [71, 70.5, 'inc', -2.87, 3.87],
    },
  },
];

const verdicts = {
  eq: 'Equivalent',
  ref: 'Ref. better',
  one: '1 step better',
  inc: 'Inconclusive',
};

const notes = {
  libero: 'SGO aggregates the Spatial, Goal, and Object suites.',
  libero10: 'Long-horizon LIBERO-10: gaps are larger for some smaller policies.',
  plus: 'LIBERO+ tests robustness under perturbations. SGO pools three suites.',
  plus10: 'Long-horizon tasks under distribution shift expose residual step-count gaps.',
  calvin: 'ABC → D transfer: success on all 5 tasks in a chain. Available checkpoints only.',
  twin: 'Bimanual manipulation, clean setting. X-VLA is the only available checkpoint.',
  twinrand: 'Bimanual manipulation, randomized setting. Available checkpoint only.',
  real: 'Four Franka tasks pooled, 400 paired rollouts per variant. At this budget no CI fits within ±3 pp.',
};

// Bold the higher success rate; ties stay plain, as in the paper's tables.
function formatRate(value, other, series) {
  const tag = value > other ? 'strong' : 'span';
  return `<${tag} class="rate-${series}">${value.toFixed(1)}</${tag}>`;
}

// Signed, one decimal, typographic minus: −0.1, +1.8.
function formatGap(value) {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return '0.0';
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toFixed(1)}`;
}

const benchmarkSelect = document.querySelector('#benchmark');
const resultsChart = document.querySelector('#results-chart');
const benchmarkNote = document.querySelector('#benchmark-note');
const benchmarkSource = document.querySelector('#benchmark-source');
const lastHeading = document.querySelector('#chart-last-heading');

function renderResults() {
  const benchmark = benchmarkSelect.value;
  const isReal = benchmark === 'real';

  resultsChart.innerHTML = models
    .filter((model) => model.scores[benchmark])
    .map((model) => {
      const [reference, one, verdict, ciLow, ciHigh] = model.scores[benchmark];
      const steps = isReal && model.realSteps ? model.realSteps : model.steps;
      const ci = `[${formatGap(ciLow)}, ${formatGap(ciHigh)}]`;
      const ciLabel = `90% CI of the gap ${ci} percentage points`;
      const lastColumn = isReal
        ? `<div class="chart-ci" aria-hidden="true">${ci}</div>`
        : `<div class="chart-verdict" aria-hidden="true">
            <span class="verdict verdict-${verdict}">${verdicts[verdict]}</span>
          </div>
          <div class="chart-ci-popup" aria-hidden="true">
            90% CI <strong>${ci}</strong> pp
          </div>`;

      return `
        <div
          class="chart-row"
          role="group"
          ${isReal ? '' : 'tabindex="0"'}
          aria-label="${model.name}: one step ${one.toFixed(1)} percent; ${steps} reference steps ${reference.toFixed(1)} percent; ${isReal ? ciLabel : `TOST: ${verdicts[verdict]}; ${ciLabel}`}."
        >
          <div class="chart-model">
            ${model.name}
            <small>${model.detail}</small>
          </div>
          <div class="chart-bars" aria-hidden="true">
            <div class="chart-bar one" style="--value: ${one}%"></div>
            <div class="chart-bar reference" style="--value: ${reference}%"></div>
          </div>
          <div class="chart-value" aria-hidden="true">
            ${formatRate(one, reference, 'one')}
            <span class="slash">/</span>
            ${formatRate(reference, one, 'reference')}
          </div>
          ${lastColumn}
        </div>
      `;
    })
    .join('');

  if (lastHeading) {
    lastHeading.textContent = isReal ? 'Δ 90% CI (PP)' : 'TOST';
  }

  benchmarkNote.textContent = notes[benchmark];

  if (benchmarkSource) {
    benchmarkSource.textContent = `Source: Table ${benchmark === 'real' ? 3 : 2}`;
  }
}

if (benchmarkSelect && resultsChart && benchmarkNote) {
  benchmarkSelect.addEventListener('change', renderResults);
  renderResults();
}

/*
 * Term tooltips open on hover and focus through CSS. This adds tap-to-toggle,
 * Escape to dismiss, and keeps the popup inside the viewport.
 */
const termTips = document.querySelectorAll('.term-tip');

function fitPopup(popup) {
  popup.style.left = '0px';
  const overflow =
    popup.getBoundingClientRect().right - (document.documentElement.clientWidth - 18);

  if (overflow > 0) {
    popup.style.left = `${-overflow}px`;
  }
}

termTips.forEach((tip) => {
  const trigger = tip.querySelector('.term-tip-trigger');
  const popup = tip.querySelector('.term-tip-popup');

  tip.addEventListener('mouseenter', () => {
    tip.classList.remove('is-dismissed');
    fitPopup(popup);
  });
  tip.addEventListener('focusin', () => fitPopup(popup));

  trigger.addEventListener('click', () => {
    const open = !tip.classList.contains('is-open');

    tip.classList.toggle('is-open', open);
    tip.classList.toggle('is-dismissed', !open);
    fitPopup(popup);
  });

  tip.addEventListener('focusout', () => {
    tip.classList.remove('is-open', 'is-dismissed');
  });
});

document.addEventListener('click', (event) => {
  termTips.forEach((tip) => {
    if (!tip.contains(event.target)) {
      tip.classList.remove('is-open');
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    termTips.forEach((tip) => {
      if (tip.matches(':hover, :focus-within, .is-open')) {
        tip.classList.remove('is-open');
        tip.classList.add('is-dismissed');
      }
    });
  }
});

const copyButton = document.querySelector('#copy-citation');
const citation = document.querySelector('#bibtex');
const copyStatus = document.querySelector('#copy-status');

if (copyButton && citation && copyStatus) {
  const copyLabel = copyButton.querySelector('span');
  let resetCopy;

  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(citation.textContent);
      copyLabel.textContent = 'Copied!';
      copyStatus.textContent = 'BibTeX copied to clipboard.';

      clearTimeout(resetCopy);
      resetCopy = setTimeout(() => {
        copyLabel.textContent = 'Copy BibTeX';
        copyStatus.textContent = '';
      }, 3500);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();

      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = 'Citation selected. Press Ctrl+C (or ⌘C on Mac) to copy.';
    }
  });
}

// Robot rollout videos autoplay; respect a reduced-motion preference by pausing them.
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.task-video video').forEach((video) => {
    video.pause();
    video.removeAttribute('autoplay');
    video.controls = true;
  });
}
