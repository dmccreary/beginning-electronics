// RC Charge and Discharge Explorer
// CANVAS_HEIGHT: 515
// Bloom Level: Apply (L3) - Verb: calculate, demonstrate
// Learning objective: Given an RC circuit with adjustable resistor and
// capacitor values, calculate the resulting RC time constant and predict, then
// verify, how long the capacitor takes to reach roughly 63%, 86%, 95% and 99%
// of its final voltage while charging or discharging.
//
// Model:  tau = R x C   (ohms x farads = seconds)
// The curve itself is the real exponential, but every label a learner reads is
// the chapter's rule-of-thumb percentage at 1t/2t/3t/5t. That keeps the numbers
// matching the table above without asking a junior-high reader to handle e^-x.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 400;
let controlHeight = 115;     // 3 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// ---- Controls ----
let rSlider, cSlider;
let modeButton, resetButton;

// ---- State ----
let rIndex = 2;              // index into R_VALUES, default 1K
let cMicro = 100;            // capacitance in microfarads
let charging = true;
let elapsed = 0;             // seconds of simulated time
let running = false;         // MicroSims start paused
let mouseOverCanvas = false;
let plot = {};

const VSUPPLY = 5;
// This chapter's kit resistors, used as the slider's snap points.
const R_VALUES = [220, 330, 1000, 10000];
// The rule-of-thumb table from the chapter text.
const MARKERS = [
  { taus: 1, pct: 63 },
  { taus: 2, pct: 86 },
  { taus: 3, pct: 95 },
  { taus: 5, pct: 99 }
];

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

  modeButton = createButton('Charge');
  modeButton.position(10, drawHeight + 8);
  modeButton.mousePressed(toggleMode);

  resetButton = createButton('Reset');
  resetButton.position(95, drawHeight + 8);
  resetButton.mousePressed(resetAll);

  // The R slider steps through the four kit values rather than sweeping
  // continuously, so every setting is a resistor the learner actually owns.
  rSlider = createSlider(0, R_VALUES.length - 1, rIndex, 1);
  rSlider.position(sliderLeftMargin, drawHeight + 8 + 35);
  rSlider.size(canvasWidth - sliderLeftMargin - margin);

  // C runs 1 to 1000 uF on a log scale so the small end stays controllable.
  // 67 lands on 100 uF, the chapter's worked example.
  cSlider = createSlider(0, 100, 67, 1);
  cSlider.position(sliderLeftMargin, drawHeight + 8 + 70);
  cSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A voltage-versus-time graph for an RC circuit, with markers at one, ' +
           'two, three and five time constants labeled 63, 86, 95 and 99 percent. ' +
           'Sliders set the resistor to one of the kit values and the capacitor ' +
           'from 1 to 1000 microfarads, and a panel shows the time-constant ' +
           'equation with those numbers substituted in.', LABEL);
}

function sliderToMicro(v) {
  const uf = pow(10, (v / 100) * 3);   // 1 .. 1000
  if (uf >= 100) return round(uf / 10) * 10;
  if (uf >= 10) return round(uf);
  return round(uf * 10) / 10;
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

  rIndex = rSlider.value();
  cMicro = sliderToMicro(cSlider.value());

  const r = R_VALUES[rIndex];
  const c = cMicro * 1e-6;          // microfarads -> farads
  const tau = r * c;                // seconds

  // The window always shows 6 time constants, so the curve shape is the same
  // regardless of tau and only the axis numbers change.
  const tMax = tau * 6;

  if (running && mouseOverCanvas) {
    elapsed += deltaTime / 1000;
    if (elapsed > tMax) elapsed = tMax;
  }

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('RC Charge and Discharge', canvasWidth / 2, 6);

  computePlot();
  drawGrid(tMax);
  drawMarkers(tau, tMax);
  drawCurve(tau, tMax);
  drawCapacitor(tau);
  drawReadout(r, c, tau);
  if (mouseOverCanvas) drawHoverProbe(tau, tMax);
  drawControlLabels(r);
}

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

function computePlot() {
  const panelW = canvasWidth < 620 ? 0 : 190;
  plot = {
    x: margin + 46,
    y: 40,
    w: canvasWidth - margin * 2 - 46 - panelW,
    h: drawHeight - 40 - 78
  };
}

// Voltage as a fraction of the supply, at time t.
function level(t, tau) {
  const frac = 1 - Math.exp(-t / tau);
  return charging ? frac : 1 - frac;
}

function px(t, tMax) { return plot.x + (t / tMax) * plot.w; }
function py(v) { return plot.y + plot.h - v * plot.h; }

function drawGrid(tMax) {
  // Plot background
  noStroke();
  fill('white');
  rect(plot.x, plot.y, plot.w, plot.h);

  stroke('gainsboro');
  strokeWeight(1);
  for (let i = 0; i <= 4; i++) {
    const y = plot.y + (i / 4) * plot.h;
    line(plot.x, y, plot.x + plot.w, y);
  }

  // Axes
  stroke('gray');
  strokeWeight(2);
  line(plot.x, plot.y, plot.x, plot.y + plot.h);
  line(plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);

  // Y axis labels - voltage
  noStroke();
  fill('black');
  textAlign(RIGHT, CENTER);
  textSize(12);
  for (let i = 0; i <= 4; i++) {
    const v = VSUPPLY * (1 - i / 4);
    text(nf(v, 1, 1) + ' V', plot.x - 6, plot.y + (i / 4) * plot.h);
  }

  // The x-axis caption sits inside the plot: the tau markers occupy the strip
  // just below the axis, and the readout box occupies the strip below that.
  textAlign(RIGHT, BOTTOM);
  textSize(12);
  fill('gray');
  text('Time →', plot.x + plot.w - 6, plot.y + plot.h - 6);

  push();
  translate(plot.x - 38, plot.y + plot.h / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, CENTER);
  text('Voltage', 0, 0);
  pop();
}

// The 1t/2t/3t/5t markers with the chapter's rule-of-thumb percentages.
function drawMarkers(tau, tMax) {
  for (const m of MARKERS) {
    const t = m.taus * tau;
    if (t > tMax) continue;
    const x = px(t, tMax);
    const pct = charging ? m.pct : 100 - m.pct;
    const y = py(pct / 100);

    stroke('lightsteelblue');
    strokeWeight(1);
    drawingContext.setLineDash([4, 4]);
    line(x, plot.y, x, plot.y + plot.h);
    drawingContext.setLineDash([]);

    noStroke();
    fill('steelblue');
    circle(x, y, 7);

    fill('dimgray');
    textAlign(CENTER, TOP);
    textSize(11);
    text(m.taus + 'τ', x, plot.y + plot.h + 4);
    textAlign(CENTER, BOTTOM);
    fill('steelblue');
    text(pct + '%', x, y - 7);
  }
}

function drawCurve(tau, tMax) {
  noFill();
  stroke(charging ? 'mediumblue' : 'dimgray');
  strokeWeight(3);
  beginShape();
  const steps = 160;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tMax;
    vertex(px(t, tMax), py(level(t, tau)));
  }
  endShape();

  // The moving dot showing where the simulation currently is
  const v = level(elapsed, tau);
  noStroke();
  fill('darkorange');
  circle(px(elapsed, tMax), py(v), 12);

  fill('black');
  textAlign(LEFT, BOTTOM);
  textSize(13);
  const label = nf(v * VSUPPLY, 1, 2) + ' V  (' + nf(v * 100, 1, 0) + '%)';
  const lx = min(px(elapsed, tMax) + 10, plot.x + plot.w - textWidth(label) - 4);
  text(label, lx, py(v) - 10);
}

// A capacitor icon whose fill tracks the current charge level.
function drawCapacitor(tau) {
  const v = level(elapsed, tau);
  const x = plot.x + plot.w + 14;
  const y = plot.y + 10;
  if (x + 40 > canvasWidth - margin) return;   // no room in the narrow layout

  const w = 26, h = 64;
  noStroke();
  fill('gainsboro');
  rect(x, y, w, h, 3);
  fill('steelblue');
  rect(x, y + h * (1 - v), w, h * v, 3);

  stroke('dimgray');
  strokeWeight(2);
  line(x + w / 2, y - 10, x + w / 2, y);
  line(x + w / 2, y + h, x + w / 2, y + h + 10);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('cap', x + w / 2, y + h + 12);
}

// ---------------------------------------------------------------------------
// Readout - the equation with real numbers in it
// ---------------------------------------------------------------------------

function drawReadout(r, c, tau) {
  const x = margin;
  const y = drawHeight - 68;
  const w = canvasWidth - 2 * margin;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, 60, 8);

  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(13);
  text('τ = R × C', x + 12, y + 8);

  fill('mediumblue');
  textSize(14);
  text('τ = ' + r + ' Ω × ' + formatFarads(c) + ' = ' + formatSeconds(tau),
       x + 12, y + 26);

  fill('gray');
  textSize(12);
  textAlign(RIGHT, TOP);
  text(charging ? 'charging toward ' + VSUPPLY + ' V' : 'discharging toward 0 V',
       x + w - 12, y + 8);
  text('5τ ≈ ' + formatSeconds(tau * 5) + ' to finish', x + w - 12, y + 28);
}

function formatFarads(c) {
  const uf = c * 1e6;
  return (uf >= 10 ? nf(uf, 1, 0) : nf(uf, 1, 1)) + ' µF';
}

function formatSeconds(s) {
  if (s >= 1) return nf(s, 1, 2) + ' s';
  if (s >= 0.001) return nf(s * 1000, 1, 1) + ' ms';
  return nf(s * 1e6, 1, 0) + ' µs';
}

// Hovering the plot reports elapsed time in multiples of tau.
function drawHoverProbe(tau, tMax) {
  if (mouseX < plot.x || mouseX > plot.x + plot.w) return;
  if (mouseY < plot.y || mouseY > plot.y + plot.h) return;

  const t = ((mouseX - plot.x) / plot.w) * tMax;
  const v = level(t, tau);
  const taus = t / tau;

  stroke('darkorange');
  strokeWeight(1);
  line(mouseX, plot.y, mouseX, plot.y + plot.h);

  const lines = [
    nf(taus, 1, 2) + ' τ  (' + formatSeconds(t) + ')',
    nf(v * 100, 1, 0) + '% charged  =  ' + nf(v * VSUPPLY, 1, 2) + ' V'
  ];
  textSize(12);
  let w = 0;
  for (const l of lines) w = max(w, textWidth(l));
  w += 18;
  let bx = mouseX + 12;
  let by = plot.y + 8;
  if (bx + w > plot.x + plot.w) bx = mouseX - w - 12;

  noStroke();
  fill(255, 255, 255, 245);
  stroke('gray');
  strokeWeight(1);
  rect(bx, by, w, 42, 6);

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  for (let i = 0; i < lines.length; i++) text(lines[i], bx + 9, by + 7 + i * 16);
}

function drawControlLabels(r) {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('R: ' + r + ' Ω', 10, drawHeight + 18 + 35);
  text('C: ' + (cMicro >= 10 ? cMicro : nf(cMicro, 1, 1)) + ' µF', 10, drawHeight + 18 + 70);

  fill('dimgray');
  textSize(12);
  text(running ? 'running — move off the canvas to pause' : 'paused',
       170, drawHeight + 21);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

// One button drives both the mode and the run state: pressing it starts the
// curve moving in the named direction, which is what a learner expects.
function toggleMode() {
  charging = !charging;
  elapsed = 0;
  running = true;
  modeButton.html(charging ? 'Charge' : 'Discharge');
}

function resetAll() {
  rSlider.value(2);
  cSlider.value(67);
  charging = true;
  elapsed = 0;
  running = false;
  modeButton.html('Charge');
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  const w = canvasWidth - sliderLeftMargin - margin;
  rSlider.size(w);
  cSlider.size(w);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
