/*
 * Numerical results transcribed from Tables 2 (simulation) and 3 (real world,
 * pooled) of the camera-ready manuscript.
 * Each entry is [reference-step success rate, one-step success rate, TOST verdict].
 * Simulation verdicts follow Table 2's colouring. No real-world 90% CI lies within
 * ±3 pp, so every real-world verdict is inconclusive.
 */
const models = [
  {
    name: 'DiT',
    detail: '211M · baseline',
    steps: 10,
    scores: {
      libero: [89.9, 91.9, 'inc'],
      libero10: [68.4, 53.8, 'ref'],
      plus: [30.8, 28.6, 'inc'],
      plus10: [22, 14.5, 'ref'],
      real: [28.5, 30, 'inc'],
    },
  },
  {
    name: 'SmolVLA',
    detail: '450M parameters',
    steps: 10,
    scores: {
      libero: [72.2, 82, 'one'],
      libero10: [34.6, 44.2, 'one'],
      plus: [4.8, 5, 'eq'],
      plus10: [1.2, 0.7, 'eq'],
    },
  },
  {
    name: 'X-VLA',
    detail: '900M parameters',
    steps: 10,
    scores: {
      libero: [97.6, 97.3, 'eq'],
      libero10: [96.2, 96, 'eq'],
      plus: [70.3, 70.4, 'eq'],
      plus10: [67.4, 66.9, 'eq'],
      calvin: [71, 70, 'inc'],
      twin: [65.5, 65.1, 'eq'],
      twinrand: [24.3, 23.3, 'eq'],
      real: [29.2, 30.5, 'inc'],
    },
  },
  {
    name: 'FLOWER',
    detail: '947M parameters',
    steps: 4,
    // FLOWER's authors use 5 steps on real hardware.
    realSteps: 5,
    scores: {
      libero: [97.3, 96.5, 'eq'],
      libero10: [89.6, 83.6, 'ref'],
      plus: [77.6, 74.4, 'inc'],
      plus10: [72, 59.3, 'ref'],
      calvin: [78.5, 75.5, 'inc'],
      real: [59.8, 63.2, 'inc'],
    },
  },
  {
    name: 'π₀.₅',
    detail: '3.3B parameters',
    steps: 10,
    scores: {
      libero: [98.5, 98.9, 'eq'],
      libero10: [94.4, 94.4, 'eq'],
      plus: [86.4, 86.3, 'eq'],
      plus10: [77.6, 76.1, 'eq'],
      real: [79, 78.5, 'inc'],
    },
  },
  {
    name: 'LAP',
    detail: '3.3B parameters',
    steps: 10,
    scores: {
      libero: [97.7, 98.8, 'eq'],
      libero10: [90.2, 92, 'inc'],
      plus: [77.6, 76.9, 'eq'],
      plus10: [66.4, 65.7, 'eq'],
      real: [74.2, 70.5, 'inc'],
    },
  },
  {
    name: 'XR-0',
    detail: '4.7B parameters',
    steps: 5,
    scores: {
      libero: [97.3, 97, 'eq'],
      libero10: [96.8, 97.4, 'eq'],
      plus: [75.8, 76.5, 'eq'],
      plus10: [70.2, 69.6, 'eq'],
      calvin: [87.2, 88.1, 'eq'],
      real: [71, 70.5, 'inc'],
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

const benchmarkSelect = document.querySelector('#benchmark');
const resultsChart = document.querySelector('#results-chart');
const benchmarkNote = document.querySelector('#benchmark-note');
const benchmarkSource = document.querySelector('#benchmark-source');

function renderResults() {
  const benchmark = benchmarkSelect.value;

  resultsChart.innerHTML = models
    .filter((model) => model.scores[benchmark])
    .map((model) => {
      const [reference, one, verdict] = model.scores[benchmark];
      const steps = benchmark === 'real' && model.realSteps ? model.realSteps : model.steps;

      return `
        <div
          class="chart-row"
          role="group"
          aria-label="${model.name}: one step ${one.toFixed(1)} percent; ${steps} reference steps ${reference.toFixed(1)} percent; TOST: ${verdicts[verdict]}."
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
          <div class="chart-verdict" aria-hidden="true">
            <span class="verdict verdict-${verdict}">${verdicts[verdict]}</span>
          </div>
        </div>
      `;
    })
    .join('');

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
