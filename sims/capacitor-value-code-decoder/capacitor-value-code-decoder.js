// Capacitor Value Code Decoder
// CANVAS_HEIGHT: 500
// Bloom Level: Apply (L3) - Verb: calculate, convert
// Learning objective: Given a 3-digit capacitor value code, calculate the
// capacitance in picofarads using the digit-and-multiplier rule, then convert
// that value into nanofarads and microfarads.
//
// The rule: the first two digits are the base number, the third says how many
// zeros to add, and the result is in picofarads.
//   104  ->  10 followed by 4 zeros  =  100,000 pF  =  100 nF  =  0.1 uF

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 420;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let defaultTextSize = 16;

// ---- Controls ----
let digitSelects = [];
let presetButtons = [];
let randomButton, resetButton;

// ---- State ----
let digits = [1, 0, 4];      // the default code, 104
let hoverCode = false;
let activeDigit = -1;        // which digit selector was touched last
let panel = {};

const PRESETS = ['104', '223', '471', '105'];

function setup() {
  updateCanvasSize();
  // Cap the backing store at one device pixel per CSS pixel. At the Retina
  // default a full-width canvas asks the compositor for 4x the pixels every
  // frame, which can stall the compositor on a loaded machine.
  pixelDensity(1);

  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  for (let i = 0; i < PRESETS.length; i++) {
    const b = createButton(PRESETS[i]);
    b.mousePressed(() => setCode(PRESETS[i], i));
    presetButtons.push(b);
  }

  randomButton = createButton('Random Code');
  randomButton.mousePressed(randomCode);

  resetButton = createButton('Reset');
  resetButton.mousePressed(() => setCode('104', -1));

  for (let i = 0; i < 3; i++) {
    const s = createSelect();
    for (let d = 0; d <= 9; d++) s.option(str(d));
    s.selected(str(digits[i]));
    s.changed(() => { digits[i] = int(s.value()); activeDigit = i; });
    digitSelects.push(s);
  }

  layoutControls();

  describe('A rendered ceramic capacitor with a three-digit code printed on it. ' +
           'Three digit selectors change the code, and a readout shows the ' +
           'resulting capacitance simultaneously in picofarads, nanofarads and ' +
           'microfarads, with the calculation broken into stages.', LABEL);
}

function layoutControls() {
  // Row 1: presets, then Random and Reset
  let x = 10;
  for (const b of presetButtons) { b.position(x, drawHeight + 8); b.size(46, 24); x += 52; }
  randomButton.position(x, drawHeight + 8); randomButton.size(104, 24); x += 110;
  resetButton.position(x, drawHeight + 8); resetButton.size(56, 24);

  // Row 2: the three digit selectors
  for (let i = 0; i < 3; i++) {
    digitSelects[i].position(96 + i * 62, drawHeight + 44);
    digitSelects[i].size(50, 24);
  }
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

  // ---- The decode ----
  const base = digits[0] * 10 + digits[1];
  const pf = base * pow(10, digits[2]);
  const nf_ = pf / 1000;
  const uf = pf / 1e6;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Capacitor Code Decoder', canvasWidth / 2, 6);

  const stacked = canvasWidth < 640;
  let capW;
  if (stacked) {
    capW = canvasWidth;
    panel = { x: margin, y: drawHeight * 0.46, w: canvasWidth - 2 * margin, h: drawHeight * 0.46 };
  } else {
    capW = canvasWidth * 0.44;
    panel = { x: capW + 10, y: 34, w: canvasWidth - capW - 10 - margin, h: drawHeight - 48 };
  }

  drawCapacitor(capW, stacked);
  drawReadout(base, pf, nf_, uf);
  if (hoverCode) drawStageTooltip(base, pf, nf_, uf);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The capacitor
// ---------------------------------------------------------------------------

function drawCapacitor(areaW, stacked) {
  const cx = areaW / 2;
  const cy = stacked ? 130 : 190;
  const r = min(96, areaW * 0.32);

  // Radial leads
  stroke('silver');
  strokeWeight(5);
  line(cx - r * 0.36, cy + r * 0.75, cx - r * 0.36, cy + r * 0.75 + 52);
  line(cx + r * 0.36, cy + r * 0.75, cx + r * 0.36, cy + r * 0.75 + 52);

  // Disc body
  noStroke();
  fill('#C8A66B');
  ellipse(cx, cy, r * 2, r * 1.72);
  fill('#B8955C');
  arc(cx, cy, r * 2, r * 1.72, 0.2, PI - 0.2);

  // The printed code
  const code = '' + digits[0] + digits[1] + digits[2];
  fill('black');
  textAlign(CENTER, CENTER);
  textSize(min(40, r * 0.52));
  text(code, cx, cy - r * 0.08);

  // A hint that the code is hoverable
  fill(60, 60, 60, 160);
  textSize(11);
  text('hover the code', cx, cy + r * 0.42);

  const codeBox = { x: cx - r * 0.6, y: cy - r * 0.45, w: r * 1.2, h: r * 0.7 };
  hoverCode = mouseX >= codeBox.x && mouseX <= codeBox.x + codeBox.w &&
              mouseY >= codeBox.y && mouseY <= codeBox.y + codeBox.h;

  if (hoverCode) {
    noFill();
    stroke('#E8710A');
    strokeWeight(3);
    rect(codeBox.x, codeBox.y, codeBox.w, codeBox.h, 6);
  }
}

// ---------------------------------------------------------------------------
// Readout - every stage of the conversion is visible at once
// ---------------------------------------------------------------------------

function drawReadout(base, pf, nf_, uf) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 14;
  const innerW = panel.w - 28;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // Stage 1 - the raw code
  fill('gray');
  textSize(12);
  text('STAGE 1 — the printed code', padX, ty);
  ty += 16;
  fill('black');
  textSize(20);
  text('' + digits[0] + digits[1] + digits[2], padX, ty);
  ty += 30;

  // Stage 2 - split into base and multiplier
  fill('gray');
  textSize(12);
  text('STAGE 2 — split it up', padX, ty);
  ty += 16;
  fill('black');
  textSize(14);
  text('base number ' + base + ', then add ' + digits[2] + ' zero' +
       (digits[2] === 1 ? '' : 's') + '  (× ' + addThousands(str(pow(10, digits[2]))) + ')',
       padX, ty, innerW);
  ty += 36;

  // Stage 3 - picofarads
  fill('gray');
  textSize(12);
  text('STAGE 3 — the value in picofarads', padX, ty);
  ty += 16;
  fill('mediumblue');
  textSize(19);
  text(addThousands(str(pf)) + ' pF', padX, ty);
  ty += 30;

  // Stage 4 - the same value in the units people actually use
  fill('gray');
  textSize(12);
  text('STAGE 4 — the same value, other units', padX, ty);
  ty += 18;
  fill('seagreen');
  textSize(17);
  text(trimNum(nf_) + ' nF', padX, ty);
  ty += 24;
  fill('darkviolet');
  text(trimNum(uf) + ' µF', padX, ty);
}

function drawStageTooltip(base, pf, nf_, uf) {
  const lines = [
    'first two digits → ' + base,
    'third digit ' + digits[2] + ' → add ' + digits[2] + ' zero' + (digits[2] === 1 ? '' : 's'),
    '= ' + addThousands(str(pf)) + ' pF',
    '= ' + trimNum(nf_) + ' nF  =  ' + trimNum(uf) + ' µF'
  ];
  textSize(13);
  let w = 0;
  for (const l of lines) w = max(w, textWidth(l));
  w += 20;
  const h = 16 + lines.length * 18;
  let x = mouseX + 14, y = mouseY - h - 8;
  if (x + w > canvasWidth) x = canvasWidth - w - 4;
  if (y < 2) y = mouseY + 18;

  fill(255, 255, 255, 248);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, h, 6);

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  for (let i = 0; i < lines.length; i++) text(lines[i], x + 10, y + 8 + i * 18);
}

// Formats a number without a wall of trailing zeros.
function trimNum(v) {
  if (v === 0) return '0';
  let s;
  if (v >= 1000) s = addThousands(str(round(v)));
  else if (v >= 1) s = str(round(v * 1000) / 1000);
  else s = str(round(v * 1e6) / 1e6);
  return s;
}

function addThousands(s) {
  const parts = s.split('.');
  let intPart = parts[0], out = '', count = 0;
  for (let i = intPart.length - 1; i >= 0; i--) {
    out = intPart.charAt(i) + out;
    count++;
    if (count % 3 === 0 && i > 0) out = ',' + out;
  }
  return parts.length > 1 ? out + '.' + parts[1] : out;
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(14);
  text('Digits:', 10, drawHeight + 56);
  fill('gray');
  textSize(11);
  const labels = ['1st', '2nd', 'mult'];
  for (let i = 0; i < 3; i++) text(labels[i], 96 + i * 62 + 14, drawHeight + 36);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function setCode(code, which) {
  for (let i = 0; i < 3; i++) {
    digits[i] = int(code.charAt(i));
    digitSelects[i].selected(code.charAt(i));
  }
  activeDigit = which;
}

function randomCode() {
  // Keep the multiplier in a range that yields values a beginner would meet
  const d = [floor(random(1, 10)), floor(random(0, 10)), floor(random(0, 6))];
  setCode('' + d[0] + d[1] + d[2], -1);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  layoutControls();
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
