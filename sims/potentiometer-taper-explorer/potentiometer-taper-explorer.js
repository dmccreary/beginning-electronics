// Potentiometer Taper Explorer
// CANVAS_HEIGHT: 545
// Bloom Level: Apply (L3) - Verb: demonstrate, predict
// Learning objective: Given a potentiometer with an adjustable wiper position,
// predict and observe how a linear taper and a logarithmic taper produce
// different resistance values for the same wiper rotation, and locate the trim
// pot adjustment screw on a rendered trimmer potentiometer.
//
// Taper models, as a fraction of full resistance at wiper position p (0..1):
//   linear       f = p
//   logarithmic  f = (10^p - 1) / 9      an audio-taper approximation
// The log curve starts shallow and rises steeply, which is why a volume knob
// feels even to the ear while a linear one feels like it does nothing at first
// and then jumps.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 460;
let controlHeight = 85;      // 2 rows + padding
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 18;
let sliderLeftMargin = 190;
let defaultTextSize = 16;

// ---- Controls ----
let wiperSlider;
let taperButton;
let resetButton;

// ---- State ----
let wiper = 50;              // percent of full rotation
let taper = 'linear';        // 'linear' | 'log'
let showScrewInfo = false;
let screwBox = null;
let plot = {};

const TOTAL_OHMS = 10000;    // a 10K pot, the usual kit part

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

  taperButton = createButton('Taper: Linear');
  taperButton.position(10, drawHeight + 8);
  taperButton.mousePressed(toggleTaper);

  resetButton = createButton('Reset');
  resetButton.position(140, drawHeight + 8);
  resetButton.mousePressed(resetAll);

  wiperSlider = createSlider(0, 100, wiper, 1);
  wiperSlider.position(sliderLeftMargin, drawHeight + 45);
  wiperSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A rendered rotary potentiometer whose wiper moves with a slider, ' +
           'beside a rendered trimmer potentiometer with an adjustment screw. ' +
           'A graph plots both the linear and logarithmic taper curves, with a ' +
           'marker showing the resistance at the current wiper position on the ' +
           'active curve.', LABEL);
}

// Fraction of total resistance for a given wiper fraction.
function taperFraction(p, which) {
  if (which === 'log') return (pow(10, p) - 1) / 9;
  return p;
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

  wiper = wiperSlider.value();
  const p = wiper / 100;
  const fracLin = taperFraction(p, 'linear');
  const fracLog = taperFraction(p, 'log');
  const frac = taper === 'log' ? fracLog : fracLin;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Potentiometer Tapers', canvasWidth / 2, 6);

  const stacked = canvasWidth < 660;
  let partsW;
  if (stacked) {
    partsW = canvasWidth;
    plot = { x: margin + 40, y: drawHeight * 0.46, w: canvasWidth - margin * 2 - 46,
             h: drawHeight * 0.40 };
  } else {
    partsW = canvasWidth * 0.40;
    plot = { x: partsW + 46, y: 44, w: canvasWidth - partsW - 46 - margin, h: drawHeight - 116 };
  }

  drawPot(partsW, p, stacked);
  drawTrimPot(partsW, stacked);
  drawGraph(p, fracLin, fracLog);
  drawReadout(frac, fracLin, fracLog);
  if (showScrewInfo) drawScrewInfo();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The rotary potentiometer
// ---------------------------------------------------------------------------

function drawPot(areaW, p, stacked) {
  const cx = areaW / 2;
  const cy = stacked ? 118 : 150;
  const r = min(66, areaW * 0.26);

  // Body
  noStroke();
  fill('gainsboro');
  circle(cx, cy, r * 2);
  fill('darkgray');
  circle(cx, cy, r * 1.72);

  // Track arc: a real pot sweeps about 270 degrees, not a full turn
  const a0 = radians(135);
  const a1 = radians(405);
  noFill();
  stroke('dimgray');
  strokeWeight(9);
  arc(cx, cy, r * 1.34, r * 1.34, a0, a1);

  // The filled portion up to the wiper
  stroke(taper === 'log' ? '#E8710A' : 'mediumblue');
  strokeWeight(9);
  arc(cx, cy, r * 1.34, r * 1.34, a0, a0 + (a1 - a0) * p);

  // Knob and pointer
  noStroke();
  fill('white');
  circle(cx, cy, r * 0.9);
  const ang = a0 + (a1 - a0) * p;
  stroke('black');
  strokeWeight(4);
  line(cx, cy, cx + cos(ang) * r * 0.42, cy + sin(ang) * r * 0.42);

  // Three terminals
  noStroke();
  fill('goldenrod');
  for (let i = -1; i <= 1; i++) rect(cx + i * 18 - 4, cy + r + 2, 8, 14, 2);
  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text('wiper', cx, cy + r + 18);

  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(13);
  text('potentiometer — turn by hand', cx, cy - r - 8);
}

// ---------------------------------------------------------------------------
// The trimmer potentiometer
// ---------------------------------------------------------------------------

function drawTrimPot(areaW, stacked) {
  const cx = areaW / 2;
  const cy = stacked ? 236 : 316;
  const s = 34;

  noStroke();
  fill('cornflowerblue');
  rect(cx - s, cy - s * 0.7, s * 2, s * 1.4, 4);

  // The adjustment screw with its slot
  fill('gainsboro');
  circle(cx, cy - 2, s * 0.9);
  stroke('dimgray');
  strokeWeight(4);
  line(cx - s * 0.3, cy - 2, cx + s * 0.3, cy - 2);

  // Pins
  noStroke();
  fill('goldenrod');
  for (let i = -1; i <= 1; i++) rect(cx + i * 16 - 3, cy + s * 0.7, 6, 12, 2);

  screwBox = { x: cx - s * 0.55, y: cy - s * 0.55, w: s * 1.1, h: s * 1.1 };
  if (showScrewInfo) {
    noFill();
    stroke('#E8710A');
    strokeWeight(3);
    circle(cx, cy - 2, s * 1.1);
  }

  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(13);
  text('trimmer — click the screw', cx, cy - s * 0.7 - 6);
}

// ---------------------------------------------------------------------------
// The dual-curve graph
// ---------------------------------------------------------------------------

function gx(p) { return plot.x + p * plot.w; }
function gy(f) { return plot.y + plot.h - f * plot.h; }

function drawGraph(p, fracLin, fracLog) {
  // Plot background and grid
  noStroke();
  fill('white');
  rect(plot.x, plot.y, plot.w, plot.h);

  stroke('gainsboro');
  strokeWeight(1);
  for (let i = 0; i <= 4; i++) {
    const y = plot.y + (i / 4) * plot.h;
    line(plot.x, y, plot.x + plot.w, y);
    const x = plot.x + (i / 4) * plot.w;
    line(x, plot.y, x, plot.y + plot.h);
  }

  stroke('gray');
  strokeWeight(2);
  line(plot.x, plot.y, plot.x, plot.y + plot.h);
  line(plot.x, plot.y + plot.h, plot.x + plot.w, plot.y + plot.h);

  // Both curves always drawn, so the comparison is the default view
  drawCurve('linear', 'mediumblue', taper === 'linear');
  drawCurve('log', '#E8710A', taper === 'log');

  // Marker on the active curve
  const frac = taper === 'log' ? fracLog : fracLin;
  noStroke();
  fill(taper === 'log' ? '#E8710A' : 'mediumblue');
  circle(gx(p), gy(frac), 12);

  // Axis labels
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(12);
  text('wiper rotation →', plot.x + plot.w / 2, plot.y + plot.h + 6);
  textAlign(RIGHT, CENTER);
  text('100%', plot.x - 6, plot.y);
  text('0%', plot.x - 6, plot.y + plot.h);

  push();
  translate(plot.x - 34, plot.y + plot.h / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, CENTER);
  text('resistance', 0, 0);
  pop();

  // Legend
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  fill('mediumblue');
  text('— linear', plot.x + 8, plot.y + 6);
  fill('#E8710A');
  text('— logarithmic', plot.x + 8, plot.y + 22);

  // Hovering the plot reports both curves at once, for direct comparison
  if (mouseX >= plot.x && mouseX <= plot.x + plot.w &&
      mouseY >= plot.y && mouseY <= plot.y + plot.h) {
    const hp = (mouseX - plot.x) / plot.w;
    drawCompareTooltip(hp);
  }
}

function drawCurve(which, col, active) {
  noFill();
  stroke(col);
  strokeWeight(active ? 4 : 2);
  if (!active) drawingContext.setLineDash([5, 5]);
  beginShape();
  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    vertex(gx(p), gy(taperFraction(p, which)));
  }
  endShape();
  drawingContext.setLineDash([]);
}

function drawCompareTooltip(p) {
  const lin = taperFraction(p, 'linear');
  const lg = taperFraction(p, 'log');
  const lines = [
    nf(p * 100, 1, 0) + '% rotation',
    'linear: ' + formatOhms(lin * TOTAL_OHMS),
    'log: ' + formatOhms(lg * TOTAL_OHMS)
  ];
  textSize(12);
  let w = 0;
  for (const l of lines) w = max(w, textWidth(l));
  w += 18;
  const h = 14 + lines.length * 16;
  let x = mouseX + 12, y = mouseY - h - 8;
  if (x + w > plot.x + plot.w) x = mouseX - w - 12;
  if (y < plot.y) y = mouseY + 14;

  fill(255, 255, 255, 246);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, h, 6);

  noStroke();
  textAlign(LEFT, TOP);
  for (let i = 0; i < lines.length; i++) {
    fill(i === 1 ? 'mediumblue' : (i === 2 ? '#E8710A' : 'black'));
    text(lines[i], x + 9, y + 7 + i * 16);
  }
}

// ---------------------------------------------------------------------------
// Readout
// ---------------------------------------------------------------------------

function drawReadout(frac, fracLin, fracLog) {
  const x = margin, w = canvasWidth - 2 * margin;
  const y = drawHeight - 62;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, 54, 8);

  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(14);
  text(wiper + '% rotation = ' + nf(frac * 100, 1, 0) + '% of total resistance  =  ' +
       formatOhms(frac * TOTAL_OHMS), x + 12, y + 8);

  fill('gray');
  textSize(12);
  text('same rotation on the other taper would give ' +
       formatOhms((taper === 'log' ? fracLin : fracLog) * TOTAL_OHMS) +
       ' — that difference is the whole point of taper.', x + 12, y + 30, w - 24);
}

function drawScrewInfo() {
  const x = margin, w = min(360, canvasWidth - 2 * margin);
  const y = 60;

  fill('lightyellow');
  stroke('goldenrod');
  strokeWeight(2);
  rect(x, y, w, 76, 8);

  noStroke();
  fill('darkgoldenrod');
  textAlign(LEFT, TOP);
  textSize(13);
  text('Trimmer adjustment screw', x + 12, y + 8);
  fill('black');
  text('Turned with a small screwdriver for an infrequent, precise calibration ' +
       'adjustment — not everyday hands-on control like the knob above.',
       x + 12, y + 28, w - 24);
}

function formatOhms(v) {
  if (v >= 1000) {
    const k = v / 1000;
    return (k === floor(k) ? k : nf(k, 1, 2)) + ' kΩ';
  }
  return nf(v, 1, 0) + ' Ω';
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Wiper: ' + wiper + '%', 10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (screwBox && mouseX >= screwBox.x && mouseX <= screwBox.x + screwBox.w &&
      mouseY >= screwBox.y && mouseY <= screwBox.y + screwBox.h) {
    showScrewInfo = !showScrewInfo;
    return;
  }
  // Clicking anywhere else dismisses the callout
  if (showScrewInfo) showScrewInfo = false;
}

function toggleTaper() {
  taper = taper === 'linear' ? 'log' : 'linear';
  taperButton.html(taper === 'linear' ? 'Taper: Linear' : 'Taper: Logarithmic');
}

function resetAll() {
  wiperSlider.value(50);
  taper = 'linear';
  taperButton.html('Taper: Linear');
  showScrewInfo = false;
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  wiperSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
