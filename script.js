/*
 * Numerical results transcribed from Table 3 of the supplied manuscript.
 * Each pair is [reference-step success rate, one-step success rate].
 */
const models = [
  {
    name: 'DiT',
    detail: '211M · baseline',
    steps: 10,
    scores: {
      libero: [89.9, 91.9],
      libero10: [68.4, 53.8],
      plus: [30.8, 28.6],
      plus10: [22, 14.5],
    },
  },
  {
    name: 'SmolVLA',
    detail: '450M parameters',
    steps: 10,
    scores: {
      libero: [72.2, 82],
      libero10: [34.6, 44.2],
      plus: [4.8, 5],
      plus10: [1.2, 0.7],
    },
  },
  {
    name: 'X-VLA',
    detail: '950M parameters',
    steps: 10,
    scores: {
      libero: [97.6, 97.3],
      libero10: [96.2, 96],
      plus: [70.3, 70.4],
      plus10: [67.4, 66.9],
      calvin: [71, 70],
      twin: [65.5, 65.1],
      twinrand: [24.3, 23.3],
    },
  },
  {
    name: 'FLOWER',
    detail: '947M parameters',
    steps: 4,
    scores: {
      libero: [97.3, 96.5],
      libero10: [89.6, 83.6],
      plus: [77.6, 74.4],
      plus10: [72, 59.3],
      calvin: [78.5, 75.5],
    },
  },
  {
    name: 'π₀.₅',
    detail: '2.3B parameters',
    steps: 10,
    scores: {
      libero: [98.5, 98.9],
      libero10: [94.4, 94.4],
      plus: [86.4, 86.3],
      plus10: [77.6, 76.1],
    },
  },
  {
    name: 'LAP',
    detail: '3.3B parameters',
    steps: 10,
    scores: {
      libero: [97.7, 98.8],
      libero10: [90.2, 92],
      plus: [77.6, 76.9],
      plus10: [66.4, 65.7],
    },
  },
  {
    name: 'XR-0',
    detail: '4.7B parameters',
    steps: 5,
    scores: {
      libero: [97.3, 97],
      libero10: [96.8, 97.4],
      plus: [75.8, 76.5],
      plus10: [70.2, 69.6],
      calvin: [87.2, 88.1],
    },
  },
];

const notes = {
  libero: 'SGO aggregates the Spatial, Goal, and Object suites.',
  libero10: 'Long-horizon LIBERO-10: gaps are larger for some smaller policies.',
  plus: 'LIBERO+ tests robustness under perturbations. SGO pools three suites.',
  plus10: 'Long-horizon tasks under distribution shift expose residual step-count gaps.',
  calvin: 'ABC → D transfer: success on all 5 tasks in a chain. Available checkpoints only.',
  twin: 'Bimanual manipulation, clean setting. X-VLA is the only available checkpoint.',
  twinrand: 'Bimanual manipulation, randomized setting. Available checkpoint only.',
};

const benchmarkSelect = document.querySelector('#benchmark');
const resultsChart = document.querySelector('#results-chart');
const benchmarkNote = document.querySelector('#benchmark-note');

function renderResults() {
  const benchmark = benchmarkSelect.value;

  resultsChart.innerHTML = models
    .filter((model) => model.scores[benchmark])
    .map((model) => {
      const [reference, one] = model.scores[benchmark];
      const oneLabel = one.toFixed(1);
      const referenceLabel = reference.toFixed(1);

      return `
        <div
          class="chart-row"
          role="group"
          aria-label="${model.name}: one step ${oneLabel} percent; ${model.steps} reference steps ${referenceLabel} percent."
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
            <strong>${oneLabel}</strong>
            <span class="slash">/</span>
            <span>${referenceLabel}</span>
          </div>
        </div>
      `;
    })
    .join('');

  benchmarkNote.textContent = notes[benchmark];
}

if (benchmarkSelect && resultsChart && benchmarkNote) {
  benchmarkSelect.addEventListener('change', renderResults);
  renderResults();
}

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
