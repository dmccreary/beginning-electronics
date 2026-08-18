// RGB LED Color Mixer
// CANVAS_HEIGHT: 585
// Bloom Level: Apply (L3) - Verb: demonstrate, predict, apply
// Learning objective: Given three brightness sliders wired to a common-cathode
// RGB LED on a breadboard, predict and observe the resulting blended color,
// and reproduce the common mixes (yellow, magenta, cyan, white).
//
// Additive mixing: an RGB LED is three separate dies sharing one lens. Their
// light adds, so red + green reads as yellow, red + blue as magenta, green +
// blue as cyan, and all three together as white. That is the opposite of
// mixing paint, which is why the results surprise people the first time.
//
// Common cathode vs common anode: the shared pin is either the ground side
// (cathode) or the supply side (anode). It changes which way current runs
// through each die and therefore which logic level turns a channel ON, but it
// does not change the color you get from a given brightness triple.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 400;
let controlHeight = 185;     // 5 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 150;
let defaultTextSize = 16;

// ---- Controls ----
let rSlider, gSlider, bSlider;
let presetButtons = [];
let typeButton, resetButton;

// ---- State ----
let commonCathode = true;
let hoverDie = -1;
let diePts = [];
let flowPhase = 0;
let mouseOverCanvas = false;
let panel = {};

const COLS = 20;
const RES_COLS = [4, 7, 10];
const LED_COL = 15;

const PRESETS = [
  { name: 'Yellow',  v: [255, 255, 0] },
  { name: 'Magenta', v: [255, 0, 255] },
  { name: 'Cyan',    v: [0, 255, 255] },
  { name: 'White',   v: [255, 255, 255] }
];

const CHANNELS = [
  { name: 'Red',   col: [255, 60, 60] },
  { name: 'Green', col: [60, 220, 90] },
  { name: 'Blue',  col: [70, 130, 255] }
];

function setup() {
  updateCanvasSize();
  // Cap the backing store at one device pixel per CSS pixel. At the Retina
  // default a full-width canvas asks the compositor for 4x the pixels every
  // frame, which can stall the compositor on a loaded machine.
  pixelDensity(1);

  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  // Row 1: presets and reset
  for (let i = 0; i < PRESETS.length; i++) {
    const b = createButton(PRESETS[i].name);
    b.mousePressed(() => applyPreset(i));
    presetButtons.push(b);
  }
  resetButton = createButton('Reset');
  resetButton.mousePressed(resetAll);

  // Row 2: the shared-pin type
  typeButton = createButton('Common Cathode');
  typeButton.mousePressed(() => {
    commonCathode = !commonCathode;
    typeButton.html(commonCathode ? 'Common Cathode' : 'Common Anode');
  });

  // Rows 3-5: the three brightness sliders
  rSlider = makeSlider(2);
  gSlider = makeSlider(3);
  bSlider = makeSlider(4);

  layoutControls();

  describe('A breadboard circuit with three resistors feeding a common-cathode ' +
           'RGB LED drawn as three colored dies inside one lens. Three ' +
           'brightness sliders mix the channels additively, a swatch shows the ' +
           'blended result, and preset buttons snap to yellow, magenta, cyan ' +
           'and white.', LABEL);
}

function makeSlider(row) {
  const s = createSlider(0, 255, 0, 1);
  s.position(sliderLeftMargin, drawHeight + 8 + row * 35);
  s.size(canvasWidth - sliderLeftMargin - margin);
  return s;
}

function layoutControls() {
  let x = 10;
  for (const b of presetButtons) { b.position(x, drawHeight + 8); b.size(74, 24); x += 80; }
  resetButton.position(x, drawHeight + 8); resetButton.size(58, 24);

  typeButton.position(10, drawHeight + 43);
  typeButton.size(150, 24);

  const w = canvasWidth - sliderLeftMargin - margin;
  rSlider.position(sliderLeftMargin, drawHeight + 8 + 2 * 35); rSlider.size(w);
  gSlider.position(sliderLeftMargin, drawHeight + 8 + 3 * 35); gSlider.size(w);
  bSlider.position(sliderLeftMargin, drawHeight + 8 + 4 * 35); bSlider.size(w);
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

  const v = [rSlider.value(), gSlider.value(), bSlider.value()];

  if (mouseOverCanvas) flowPhase += 0.02;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('RGB LED Color Mixer', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  let boardX, boardY, boardW, boardH;
  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.52;
    panel = { x: margin, y: boardY + boardH + 6, w: canvasWidth - 2 * margin,
              h: drawHeight - boardY - boardH - 12 };
  } else {
    boardX = margin; boardY = 30;
    boardW = canvasWidth * 0.58;
    boardH = drawHeight - 44;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 44 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  drawCircuit(v);
  drawPanel(v);
  drawControlLabels(v);
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(v) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('c');
  const xLed = bbColX(LED_COL);

  // Three branches, one per color channel
  diePts = [];
  for (let i = 0; i < 3; i++) {
    const x = bbColX(RES_COLS[i]);
    const on = v[i] > 0;
    const c = CHANNELS[i].col;
    const branchY = row - 30 + i * 30;

    stroke(on ? color(c[0], c[1], c[2]) : '#C3C9CF');
    strokeWeight(2);
    noFill();
    // from the supply rail (or the shared anode) into the resistor, then across
    line(x, railPlus, x, branchY);
    drawResistorGlyph(x + 22, branchY, CHANNELS[i].name.charAt(0));
    line(x + 38, branchY, xLed - 16, branchY);

    if (on) {
      drawFlow([[x, railPlus, x, branchY], [x, branchY, xLed - 16, branchY]],
               map(v[i], 0, 255, 3, 7), color(c[0], c[1], c[2]),
               map(v[i], 0, 255, 0.2, 1.0));
    }

    noStroke();
    fill(on ? color(c[0], c[1], c[2]) : 'gray');
    textAlign(RIGHT, CENTER);
    textSize(11);
    text(CHANNELS[i].name.charAt(0), x - 6, branchY);
  }

  // The shared pin: to ground for common cathode, to the supply otherwise
  stroke(commonCathode ? 'dimgray' : 'crimson');
  strokeWeight(3);
  line(xLed, row + 34, xLed, railMinus);

  drawRgbLed(xLed, row, v);

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('+V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  // Placed under the LED, not up by the rails, where it collided with the
  // rail markings.
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text(commonCathode ? 'common cathode → ground' : 'common anode → +V',
       xLed, row + 40);
}

// One lens holding three separate dies, each glowing at its own brightness.
function drawRgbLed(x, y, v) {
  // the blended halo
  const blend = color(v[0], v[1], v[2]);
  const total = (v[0] + v[1] + v[2]) / 765;
  if (total > 0.01) {
    noStroke();
    fill(red(blend), green(blend), blue(blend), 90 * total + 20);
    circle(x, y, 78 + total * 22);
  }

  // lens body
  noStroke();
  fill(235, 238, 241, 210);
  arc(x, y + 8, 48, 56, PI, TWO_PI);
  rect(x - 24, y + 8, 48, 12, 0, 0, 4, 4);
  stroke('#B6BDC4');
  strokeWeight(1);
  noFill();
  arc(x, y + 8, 48, 56, PI, TWO_PI);

  // three dies inside
  diePts = [];
  for (let i = 0; i < 3; i++) {
    const dx = x + (i - 1) * 13;
    const dy = y - 4;
    const c = CHANNELS[i].col;
    const lvl = v[i] / 255;
    noStroke();
    fill(c[0], c[1], c[2], 60 + 195 * lvl);
    circle(dx, dy, 15);
    if (lvl > 0.05) {
      fill(255, 255, 255, 160 * lvl);
      circle(dx - 2, dy - 3, 5);
    }
    diePts.push({ x: dx, y: dy, i: i });
    if (hoverDie === i) {
      noFill();
      stroke('#E8710A');
      strokeWeight(2);
      circle(dx, dy, 21);
    }
  }

  // four legs: three anodes plus the shared pin
  stroke('#9AA3AB');
  strokeWeight(2);
  for (let i = 0; i < 4; i++) line(x - 15 + i * 10, y + 20, x - 15 + i * 10, y + 34);

  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(11);
  text('RGB LED', x, y - 34);
}

function drawResistorGlyph(cx, y, label) {
  noStroke();
  fill('wheat');
  rect(cx - 8, y - 6, 16, 12, 2);
  fill('firebrick'); rect(cx - 3, y - 6, 3, 12);
}

function drawFlow(legs, size, col, density) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(2, floor(total / 40 * density));
  noStroke();
  fill(col);
  for (let i = 0; i < dots; i++) {
    let d = ((flowPhase * density + i / dots) % 1) * total;
    for (const l of legs) {
      const len = dist(l[0], l[1], l[2], l[3]);
      if (d <= len) {
        const t = len === 0 ? 0 : d / len;
        circle(lerp(l[0], l[2], t), lerp(l[1], l[3], t), size);
        break;
      }
      d -= len;
    }
  }
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function drawPanel(v) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // The blended swatch, which is the whole point
  fill('gray');
  textSize(11);
  text('BLENDED RESULT', padX, ty);
  ty += 16;
  fill(v[0], v[1], v[2]);
  stroke('silver');
  strokeWeight(1);
  rect(padX, ty, innerW, 46, 6);
  ty += 54;

  noStroke();
  fill('black');
  textSize(14);
  text('R ' + v[0] + '   G ' + v[1] + '   B ' + v[2], padX, ty);
  ty += 24;

  fill('mediumblue');
  textSize(13);
  text(describeMix(v), padX, ty, innerW);
  ty += 46;

  // Hover explanation
  if (hoverDie >= 0) {
    const c = CHANNELS[hoverDie];
    fill('#E8710A');
    textSize(12);
    text('The ' + c.name.toLowerCase() + ' die, currently at ' + v[hoverDie] +
         ' of 255. It has its own resistor and its own wire — the three dies ' +
         'just happen to share one lens.', padX, ty, innerW);
    ty += 56;
  }

  fill('gray');
  textSize(12);
  text(commonCathode
    ? 'Common cathode: the shared pin goes to ground, so a channel lights when ' +
      'its own pin is driven HIGH.'
    : 'Common anode: the shared pin goes to +V, so a channel lights when its ' +
      'own pin is pulled LOW — the logic is inverted, but the color is not.',
    padX, ty, innerW);
}

// Names the recognisable mixes so a learner can check their prediction.
function describeMix(v) {
  const [r, g, b] = v;
  const hi = 200, lo = 55;
  const on = c => c >= hi, off = c => c <= lo;

  if (off(r) && off(g) && off(b)) return 'All three channels off — no current, no light.';
  if (on(r) && on(g) && on(b)) return 'White — all three channels at full. Additive mixing adds up to white light.';
  if (on(r) && on(g) && off(b)) return 'Yellow — red and green together. Nothing about this is intuitive from paint mixing.';
  if (on(r) && off(g) && on(b)) return 'Magenta — red and blue together.';
  if (off(r) && on(g) && on(b)) return 'Cyan — green and blue together.';
  if (on(r) && off(g) && off(b)) return 'Red only.';
  if (off(r) && on(g) && off(b)) return 'Green only.';
  if (off(r) && off(g) && on(b)) return 'Blue only.';
  return 'A blend of all the channels that are on. Try a preset to hit an exact mix.';
}

function drawControlLabels(v) {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  for (let i = 0; i < 3; i++) {
    const c = CHANNELS[i].col;
    fill(c[0], c[1], c[2]);
    text(CHANNELS[i].name + ': ' + v[i], 10, drawHeight + 20 + (i + 2) * 35);
  }
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mouseMoved() {
  hoverDie = -1;
  for (const p of diePts) {
    if (dist(mouseX, mouseY, p.x, p.y) <= 11) hoverDie = p.i;
  }
}

function applyPreset(i) {
  const v = PRESETS[i].v;
  rSlider.value(v[0]);
  gSlider.value(v[1]);
  bSlider.value(v[2]);
}

function resetAll() {
  rSlider.value(0);
  gSlider.value(0);
  bSlider.value(0);
  commonCathode = true;
  typeButton.html('Common Cathode');
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
