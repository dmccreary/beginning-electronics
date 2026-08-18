// Full Resistor Color Code Decoder
// CANVAS_HEIGHT: 500
// Bloom Level: Apply (L3) - Verb: calculate, decode
// Learning objective: Given a rendered resistor showing four color bands drawn
// from the complete ten-color digit code, the multiplier band, and a gold or
// silver tolerance band, calculate the resistor's exact value in ohms and its
// tolerance range.
//
// This is the full system Chapter 9 promised and Chapter 10 narrowed to four
// values. Bands 1 and 2 are digits, band 3 is the multiplier (which may be
// gold or silver for values below 10 ohms), and band 4 is the tolerance.
//
//   yellow-violet-red-gold  =  4, 7, x100, +/-5%  =  4,700 ohms +/- 5%

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let defaultTextSize = 16;

// ---- Controls ----
let randomButton, revealButton, resetButton;

// ---- State ----
let bands = ['yellow', 'violet', 'red', 'gold'];
let hoverBand = -1;
let hidden = false;          // true after Random Resistor, until Reveal
let bandBoxes = [];

// The complete ten-color digit code, plus the two tolerance-only colors.
const COLORS = {
  black:  { digit: 0, mult: 1,      swatch: '#111111', text: 'white' },
  brown:  { digit: 1, mult: 10,     swatch: '#7B3F00', text: 'white' },
  red:    { digit: 2, mult: 100,    swatch: '#C62828', text: 'white' },
  orange: { digit: 3, mult: 1000,   swatch: '#EF6C00', text: 'black' },
  yellow: { digit: 4, mult: 10000,  swatch: '#F9D423', text: 'black' },
  green:  { digit: 5, mult: 1e5,    swatch: '#2E7D32', text: 'white' },
  blue:   { digit: 6, mult: 1e6,    swatch: '#1565C0', text: 'white' },
  violet: { digit: 7, mult: 1e7,    swatch: '#6A1B9A', text: 'white' },
  gray:   { digit: 8, mult: 1e8,    swatch: '#757575', text: 'white' },
  white:  { digit: 9, mult: 1e9,    swatch: '#F5F5F5', text: 'black' },
  gold:   { digit: null, mult: 0.1,  tol: 5,  swatch: '#C9A227', text: 'black' },
  silver: { digit: null, mult: 0.01, tol: 10, swatch: '#B8B8B8', text: 'black' }
};

const DIGIT_COLORS = ['black', 'brown', 'red', 'orange', 'yellow',
                      'green', 'blue', 'violet', 'gray', 'white'];
const MULT_COLORS = DIGIT_COLORS.concat(['gold', 'silver']);
const TOL_COLORS = ['gold', 'silver'];

function validColors(bandIndex) {
  if (bandIndex === 3) return TOL_COLORS;
  if (bandIndex === 2) return MULT_COLORS;
  return DIGIT_COLORS;
}

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

  randomButton = createButton('Random Resistor');
  randomButton.position(10, drawHeight + 10);
  randomButton.mousePressed(randomResistor);

  revealButton = createButton('Reveal Value');
  revealButton.position(135, drawHeight + 10);
  revealButton.mousePressed(() => hidden = false);

  resetButton = createButton('Reset');
  resetButton.position(245, drawHeight + 10);
  resetButton.mousePressed(resetAll);

  describe('A rendered resistor with four color bands. Clicking any band cycles ' +
           'it through the colors valid for that position. A readout shows the ' +
           'decoded resistance and its tolerance range, and a Random Resistor ' +
           'button hides the answer so the value can be decoded by eye first.', LABEL);
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

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Resistor Color Code Decoder', canvasWidth / 2, 6);

  drawResistor();
  drawReadout();
  drawSwatchLegend();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The resistor
// ---------------------------------------------------------------------------

function drawResistor() {
  const cx = canvasWidth / 2;
  const cy = 130;
  const bodyW = min(canvasWidth - 2 * margin - 90, 340);
  const bodyH = 84;
  const x0 = cx - bodyW / 2;

  // Leads
  stroke('silver');
  strokeWeight(6);
  line(x0 - 42, cy, x0, cy);
  line(x0 + bodyW, cy, x0 + bodyW + 42, cy);

  // Body
  noStroke();
  fill('wheat');
  rect(x0, cy - bodyH / 2, bodyW, bodyH, 18);
  fill('burlywood');
  rect(x0, cy - bodyH / 2, 14, bodyH, 18, 0, 0, 18);
  rect(x0 + bodyW - 14, cy - bodyH / 2, 14, bodyH, 0, 18, 18, 0);

  // Four bands: three grouped at the left, the tolerance band set apart at
  // the right, exactly the way a real resistor is printed.
  const bandW = 20;
  const startX = x0 + bodyW * 0.11;
  const step = (bodyW * 0.40) / 2;
  const tolX = x0 + bodyW * 0.80;

  bandBoxes = [];
  for (let i = 0; i < 4; i++) {
    const bx = (i === 3) ? tolX : startX + i * step;
    const c = COLORS[bands[i]];

    noStroke();
    fill(c.swatch);
    rect(bx, cy - bodyH / 2, bandW, bodyH);
    // White needs an outline or it vanishes against the tan body
    if (bands[i] === 'white') {
      noFill(); stroke('gray'); strokeWeight(1);
      rect(bx, cy - bodyH / 2, bandW, bodyH);
    }

    bandBoxes.push({ x: bx, y: cy - bodyH / 2, w: bandW, h: bodyH });

    if (hoverBand === i) {
      noFill();
      stroke('#E8710A');
      strokeWeight(3);
      rect(bx - 3, cy - bodyH / 2 - 3, bandW + 6, bodyH + 6, 3);
    }
  }

  hoverBand = -1;
  for (let i = 0; i < 4; i++) {
    const b = bandBoxes[i];
    if (mouseX >= b.x - 5 && mouseX <= b.x + b.w + 5 && mouseY >= b.y && mouseY <= b.y + b.h) {
      hoverBand = i;
    }
  }

  // Captions
  noStroke();
  fill('gray');
  textAlign(CENTER, TOP);
  textSize(11);
  const captions = ['1st digit', '2nd digit', 'multiplier', 'tolerance'];
  for (let i = 0; i < 4; i++) {
    text(captions[i], bandBoxes[i].x + bandW / 2, cy + bodyH / 2 + 8);
  }

  // Click hint
  fill('dimgray');
  textAlign(CENTER, TOP);
  textSize(12);
  text('click any band to change its color', cx, cy + bodyH / 2 + 26);
}

// ---------------------------------------------------------------------------
// Readout
// ---------------------------------------------------------------------------

function value() {
  const d1 = COLORS[bands[0]].digit;
  const d2 = COLORS[bands[1]].digit;
  const mult = COLORS[bands[2]].mult;
  return (d1 * 10 + d2) * mult;
}

function drawReadout() {
  const x = margin, w = canvasWidth - 2 * margin;
  const y = 236, h = 110;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);

  // Hovering a band always wins - it is the teaching affordance
  if (hoverBand >= 0) {
    const c = COLORS[bands[hoverBand]];
    const roles = ['first digit', 'second digit', 'multiplier', 'tolerance'];
    let meaning;
    if (hoverBand < 2) meaning = bands[hoverBand] + ' means ' + c.digit;
    else if (hoverBand === 2) meaning = bands[hoverBand] + ' means × ' + formatMult(c.mult);
    else meaning = bands[hoverBand] + ' means ± ' + c.tol + '%';

    fill('#E8710A');
    textSize(13);
    text('Band ' + (hoverBand + 1) + ' — ' + roles[hoverBand], x + 14, y + 10);
    fill('black');
    textSize(17);
    text(meaning, x + 14, y + 32);
    fill('gray');
    textSize(12);
    text('click to cycle through the colors valid for this position',
         x + 14, y + 60, w - 28);
    return;
  }

  if (hidden) {
    fill('dimgray');
    textSize(15);
    text('Decode it by eye first, then press Reveal Value.', x + 14, y + 14, w - 28);
    return;
  }

  const ohms = value();
  const tol = COLORS[bands[3]].tol;
  const lo = ohms * (1 - tol / 100);
  const hi = ohms * (1 + tol / 100);

  fill('gray');
  textSize(12);
  text('DECODED VALUE', x + 14, y + 10);

  fill('black');
  textSize(26);
  text(formatOhms(ohms) + '  ± ' + tol + '%', x + 14, y + 28);

  fill('mediumblue');
  textSize(14);
  text('anywhere from ' + formatOhms(lo) + ' to ' + formatOhms(hi),
       x + 14, y + 62, w - 28);

  fill('gray');
  textSize(12);
  const d1 = COLORS[bands[0]].digit, d2 = COLORS[bands[1]].digit;
  text(bands[0] + ' (' + d1 + '), ' + bands[1] + ' (' + d2 + '), ' +
       bands[2] + ' (× ' + formatMult(COLORS[bands[2]].mult) + ')',
       x + 14, y + 84, w - 28);
}

// A compact legend so the ten-color code is visible while decoding.
function drawSwatchLegend() {
  const x = margin, w = canvasWidth - 2 * margin;
  const y = 356;

  noStroke();
  fill('gray');
  textAlign(LEFT, TOP);
  textSize(12);
  text('the ten digit colors', x, y);

  const sw = min(38, (w - 20) / 10);
  for (let i = 0; i < DIGIT_COLORS.length; i++) {
    const name = DIGIT_COLORS[i];
    const bx = x + i * sw;
    noStroke();
    fill(COLORS[name].swatch);
    rect(bx, y + 18, sw - 3, 26, 3);
    if (name === 'white') { noFill(); stroke('gray'); strokeWeight(1); rect(bx, y + 18, sw - 3, 26, 3); }

    noStroke();
    fill(COLORS[name].text);
    textAlign(CENTER, CENTER);
    textSize(13);
    text(i, bx + (sw - 3) / 2, y + 31);
  }
}

function formatOhms(v) {
  if (v >= 1e6) return trimNum(v / 1e6) + ' MΩ';
  if (v >= 1000) return trimNum(v / 1000) + ' kΩ';
  return trimNum(v) + ' Ω';
}

function formatMult(m) {
  if (m >= 1000) return addThousands(str(m));
  if (m >= 1) return str(m);
  return str(m);
}

function trimNum(v) {
  const r = round(v * 1000) / 1000;
  return addThousands(str(r));
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
  // All three controls are labeled buttons.
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (hoverBand < 0) return;
  const list = validColors(hoverBand);
  const i = list.indexOf(bands[hoverBand]);
  bands[hoverBand] = list[(i + 1) % list.length];
  hidden = false;   // the learner is now building a value deliberately
}

function randomResistor() {
  bands[0] = DIGIT_COLORS[floor(random(1, DIGIT_COLORS.length))];  // avoid a leading zero
  bands[1] = DIGIT_COLORS[floor(random(DIGIT_COLORS.length))];
  // Keep the multiplier in a range that produces a real-world value
  bands[2] = MULT_COLORS[floor(random(0, 7))];
  bands[3] = TOL_COLORS[floor(random(TOL_COLORS.length))];
  hidden = true;
}

function resetAll() {
  bands = ['yellow', 'violet', 'red', 'gold'];
  hidden = false;
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
