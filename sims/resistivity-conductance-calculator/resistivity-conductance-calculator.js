// Resistivity and Conductance Calculator
// CANVAS_HEIGHT: 455
// Bloom Level: Apply (L3) - Verb: calculate
// Learning objective: Calculate a wire's resistance from its resistivity,
// length and cross-sectional area, and calculate its conductance as the
// reciprocal of that resistance, by adjusting a material dropdown and
// length/thickness sliders and reading the live-updated results.
//
// Model:  R = rho * L / A      (L in metres, A in square metres)
//         G = 1 / R            (conductance, in siemens)

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 340;
let controlHeight = 115;     // 3 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let sliderLeftMargin = 230;
let defaultTextSize = 16;

// ---- Controls ----
let materialSelect;
let lengthSlider;
let areaSlider;

// ---- State ----
let lengthCm = 20;
let areaMm2 = 1;
let dotPhase = 0;
let mouseOverCanvas = false;

// Resistivity in ohm-metres at roughly room temperature.
const MATERIALS = {
  'Copper':   { rho: 1.68e-8, tint: 'peru',       note: 'the standard wiring metal' },
  'Aluminum': { rho: 2.65e-8, tint: 'silver',     note: 'lighter, slightly worse than copper' },
  'Nichrome': { rho: 1.10e-6, tint: 'indianred',  note: 'deliberately resistive — used in heating elements' },
  'Rubber':   { rho: 1.0e13,  tint: 'darkseagreen', note: 'practically an insulator!' }
};

function setup() {
  updateCanvasSize();
  // Cap the backing store below the Retina default. At density 2 a full-width
  // canvas asks the compositor for 4x the pixels every frame, which stalls a
  // machine whose compositor has no headroom. 1.5 cuts that ~44% while staying
  // visibly sharper than a full cap to 1.
  pixelDensity(1.5);

  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  materialSelect = createSelect();
  materialSelect.position(120, drawHeight + 8);
  for (const name in MATERIALS) materialSelect.option(name);
  materialSelect.selected('Copper');

  lengthSlider = createSlider(1, 100, lengthCm, 1);
  lengthSlider.position(sliderLeftMargin, drawHeight + 8 + 35);
  lengthSlider.size(canvasWidth - sliderLeftMargin - margin);

  areaSlider = createSlider(0.1, 10, areaMm2, 0.1);
  areaSlider.position(sliderLeftMargin, drawHeight + 8 + 70);
  areaSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A schematic wire that stretches and thickens as length and ' +
           'cross-sectional-area sliders move, tinted by the selected material. ' +
           'Readouts show the material resistivity, the calculated resistance ' +
           'and the calculated conductance, and a dot stream inside the wire ' +
           'moves faster when conductance is higher.', LABEL);
}

function draw() {
  updateCanvasSize();

  // Background regions - required MicroSim standard
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  lengthCm = lengthSlider.value();
  areaMm2 = areaSlider.value();
  const matName = materialSelect.value();
  const mat = MATERIALS[matName];

  // ---- The resistivity model ----
  const lengthM = lengthCm / 100;        // cm  -> m
  const areaM2 = areaMm2 * 1e-6;         // mm2 -> m2
  const resistance = mat.rho * lengthM / areaM2;
  const conductance = 1 / resistance;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  text('Resistivity and Conductance', canvasWidth / 2, 8);

  drawWire(mat, matName, conductance);
  drawResults(mat, matName, resistance, conductance);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The wire
// ---------------------------------------------------------------------------

function drawWire(mat, matName, conductance) {
  const stackedLayout = canvasWidth < 620;
  const areaW = stackedLayout ? canvasWidth : canvasWidth * 0.58;

  // Wire length maps 1..100 cm onto the available drawing width.
  const maxLen = areaW - 2 * margin - 30;
  const wireLen = map(lengthCm, 1, 100, 60, maxLen);
  // Thickness maps 0.1..10 mm2 onto a visible pixel band.
  const wireThick = map(areaMm2, 0.1, 10, 6, 46);

  const cx = areaW / 2;
  const cy = stackedLayout ? 118 : 150;
  const x0 = cx - wireLen / 2;
  const x1 = cx + wireLen / 2;

  // Terminal caps
  noStroke();
  fill('dimgray');
  rect(x0 - 12, cy - wireThick / 2 - 4, 12, wireThick + 8, 2);
  rect(x1, cy - wireThick / 2 - 4, 12, wireThick + 8, 2);

  // The wire body, tinted by material
  fill(mat.tint);
  stroke('gray');
  strokeWeight(1);
  rect(x0, cy - wireThick / 2, wireLen, wireThick, 3);

  // Dot stream: speed tracks conductance on a log scale so the range from
  // copper to rubber stays visible instead of saturating.
  const logG = Math.log10(max(conductance, 1e-20));
  const speed = constrain(map(logG, -6, 3, 0, 1), 0, 1);
  if (mouseOverCanvas) dotPhase += 0.004 + speed * 0.02;

  const dots = 9;
  noStroke();
  fill(speed < 0.02 ? 'gray' : 'white');
  for (let i = 0; i < dots; i++) {
    const t = ((dotPhase + i / dots) % 1);
    const dx = x0 + 8 + t * (wireLen - 16);
    circle(dx, cy, min(7, wireThick * 0.45));
  }

  // Dimension callouts
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(defaultTextSize);
  text(lengthCm + ' cm', cx, cy + wireThick / 2 + 14);

  textAlign(RIGHT, CENTER);
  text(nf(areaMm2, 1, 1) + ' mm²', x0 - 18, cy);

  // Callout for the insulator case, where the stream stalls
  if (matName === 'Rubber') {
    noStroke();
    fill('darkgreen');
    textAlign(CENTER, TOP);
    textSize(17);
    text('practically an insulator!', cx, cy + wireThick / 2 + 40);
  }
}

// ---------------------------------------------------------------------------
// Results panel
// ---------------------------------------------------------------------------

function drawResults(mat, matName, resistance, conductance) {
  const stackedLayout = canvasWidth < 620;
  const x = stackedLayout ? margin : canvasWidth * 0.60;
  const w = stackedLayout ? canvasWidth - 2 * margin : canvasWidth - x - margin;
  const y = stackedLayout ? drawHeight - 128 : 52;
  const h = stackedLayout ? 118 : drawHeight - 70;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, h, 10);

  const padX = x + 14;
  let ty = y + 14;

  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(17);
  text(matName, padX, ty);
  ty += 24;

  fill('dimgray');
  textSize(14);
  text(mat.note, padX, ty, w - 28);
  ty += 30;

  fill('black');
  textSize(defaultTextSize);
  text('Resistivity ρ', padX, ty);
  fill('mediumblue');
  text(formatSci(mat.rho) + ' Ω·m', padX, ty + 20);
  ty += 50;

  fill('black');
  text('Resistance R = ρL/A', padX, ty);
  fill('darkorange');
  textSize(18);
  text(formatSI(resistance, 'Ω'), padX, ty + 20);
  ty += 52;

  fill('black');
  textSize(defaultTextSize);
  text('Conductance G = 1/R', padX, ty);
  fill('seagreen');
  textSize(18);
  text(formatSI(conductance, 'S'), padX, ty + 20);
}

// Auto-scaling SI formatter so copper (milliohms) and rubber (exaohms) are
// both readable without a wall of zeros.
function formatSI(v, unit) {
  if (!isFinite(v)) return '∞ ' + unit;
  const a = abs(v);
  const table = [
    [1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''],
    [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']
  ];
  // Outside the prefix range, fall back to scientific notation
  if (a >= 1e15 || (a > 0 && a < 1e-13)) return formatSci(v) + ' ' + unit;
  for (const [scale, prefix] of table) {
    if (a >= scale) {
      const n = v / scale;
      const s = n >= 100 ? nf(n, 1, 1) : nf(n, 1, 2);
      return trimZeros(s) + ' ' + prefix + unit;
    }
  }
  return trimZeros(nf(v, 1, 2)) + ' ' + unit;
}

function formatSci(v) {
  if (v === 0) return '0';
  const e = floor(Math.log10(abs(v)));
  const m = v / pow(10, e);
  return trimZeros(nf(m, 1, 2)) + ' × 10' + superscript(e);
}

// Canvas text has no rich formatting, so exponents use Unicode superscript
// glyphs rather than a literal caret.
function superscript(n) {
  const digits = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const neg = n < 0;
  let s = '';
  let a = abs(n);
  if (a === 0) s = digits[0];
  while (a > 0) {
    s = digits[a % 10] + s;
    a = floor(a / 10);
  }
  return (neg ? '⁻' : '') + s;
}

function trimZeros(s) {
  if (s.indexOf('.') < 0) return s;
  return s.replace(/0+$/, '').replace(/\.$/, '');
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Material:', 10, drawHeight + 20);
  text('Length: ' + lengthCm + ' cm', 10, drawHeight + 20 + 35);
  text('Area: ' + nf(areaMm2, 1, 1) + ' mm²', 10, drawHeight + 20 + 70);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  const w = canvasWidth - sliderLeftMargin - margin;
  lengthSlider.size(w);
  areaSlider.size(w);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
