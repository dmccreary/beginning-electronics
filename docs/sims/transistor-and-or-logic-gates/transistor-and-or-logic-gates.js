// Transistor AND and OR Gates
// CANVAS_HEIGHT: 585
// Bloom Level: Apply (L3) - Verb: demonstrate, predict, verify
// Learning objective: Given a breadboard with two NPN transistors wired in
// series (AND) and two wired in parallel (OR), predict and then verify the
// output LED's state and the matching truth-table row for every combination
// of two input buttons on each gate.
//
// The whole idea in one line each:
//   SERIES   both transistors are in the same current path, so BOTH must
//            conduct for anything to reach the LED  ->  Y = A · B
//   PARALLEL each transistor has its own path to ground, so EITHER one
//            conducting is enough                   ->  Y = A + B
//
// Interaction note: the specification asks for press-and-hold, but a mouse has
// one pointer and the AND gate needs two inputs down at once. Buttons latch on
// click instead. The logic being taught is unchanged.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 535;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let resetButton;

// ---- State ----
let inputs = { A: false, B: false, C: false, D: false };
let btnBoxes = {};
let flowPhase = 0;
let mouseOverCanvas = false;
let panel = {};

const COLS = 20;

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

  resetButton = createButton('Reset');
  resetButton.position(10, drawHeight + 10);
  resetButton.mousePressed(() => inputs = { A: false, B: false, C: false, D: false });

  describe('A breadboard split into two halves: an AND gate built from two NPN ' +
           'transistors in series, and an OR gate built from two in parallel. ' +
           'Four latching input buttons drive them, each gate has its own ' +
           'output LED, and two live truth tables fill in the row matching the ' +
           'current inputs.', LABEL);
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

  const andOut = inputs.A && inputs.B;      // series: both required
  const orOut = inputs.C || inputs.D;       // parallel: either will do

  if (mouseOverCanvas) flowPhase += 0.02;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Transistor AND and OR Gates', canvasWidth / 2, 6);

  const stacked = canvasWidth < 720;
  let boardX, boardW;
  if (stacked) {
    boardX = margin; boardW = canvasWidth - 2 * margin;
    panel = { x: margin, y: drawHeight * 0.62, w: canvasWidth - 2 * margin,
              h: drawHeight * 0.36 };
  } else {
    boardX = margin; boardW = canvasWidth * 0.58;
    panel = { x: boardX + boardW + 10, y: 32, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 46 };
  }

  // Two half-height boards, one per gate
  const halfH = (drawHeight - 84) / 2;
  bbLayout(boardX, 50, boardW, halfH, COLS, { supply: false });
  drawGateHalf('AND', andOut);

  bbLayout(boardX, 50 + halfH + 20, boardW, halfH, COLS, { supply: false });
  drawGateHalf('OR', orOut);

  drawPanel(andOut, orOut);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// One gate on its own board
// ---------------------------------------------------------------------------

function drawGateHalf(kind, out) {
  bbDrawBoard();

  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('c');
  const isAnd = kind === 'AND';
  const keys = isAnd ? ['A', 'B'] : ['C', 'D'];

  const xBtn1 = bbColX(3), xBtn2 = bbColX(6);
  const xT1 = bbColX(10), xT2 = bbColX(13);
  const xLed = bbColX(17);

  // supply into the LED and its resistor, then down to the transistors
  stroke(out ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  noFill();
  line(xLed, railPlus, xLed, row - 22);
  drawResistorGlyph(xLed, row - 14);
  drawLed(xLed, row + 2, out);

  if (isAnd) {
    // SERIES: LED -> T1 -> T2 -> ground. One path, both must conduct.
    stroke(out ? 'crimson' : '#C3C9CF');
    line(xLed, row + 14, xLed, row + 26);
    line(xT2 + 14, row + 26, xLed, row + 26);
    drawTransistor(xT2, row + 26, inputs[keys[1]], keys[1]);
    stroke(inputs[keys[1]] ? 'crimson' : '#C3C9CF');
    line(xT2 - 14, row + 26, xT1 + 14, row + 26);
    drawTransistor(xT1, row + 26, inputs[keys[0]], keys[0]);
    stroke(out ? 'crimson' : '#C3C9CF');
    line(xT1 - 14, row + 26, bbColX(2), row + 26);
    line(bbColX(2), row + 26, bbColX(2), railMinus);
  } else {
    // PARALLEL: LED -> both transistors, each with its own path to ground.
    stroke(out ? 'crimson' : '#C3C9CF');
    line(xLed, row + 14, xLed, row + 20);
    line(xT1, row + 20, xLed, row + 20);
    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? xT1 : xT2;
      const on = inputs[keys[i]];
      stroke(on ? 'crimson' : '#C3C9CF');
      line(x, row + 20, x, row + 26);
      drawTransistorV(x, row + 34, on, keys[i]);
      line(x, row + 42, x, railMinus);
    }
    stroke(out ? 'crimson' : '#C3C9CF');
    line(xT1, row + 20, xT2, row + 20);
  }

  // the two input buttons, each feeding its transistor's base
  for (let i = 0; i < 2; i++) {
    const k = keys[i];
    const bx = i === 0 ? xBtn1 : xBtn2;
    drawInputButton(bx, row - 14, k);
  }

  // heading
  noStroke();
  fill(isAnd ? '#2878A8' : '#6953B8');
  textAlign(LEFT, TOP);
  textSize(13);
  text(isAnd ? 'AND — transistors in SERIES   (Y = A · B)'
             : 'OR — transistors in PARALLEL   (Y = C + D)', BB.x + 4, BB.y - 16);
}

function drawInputButton(x, y, key) {
  const down = inputs[key];
  const w = 32, h = 26;
  btnBoxes[key] = { x: x - w / 2, y: y - h / 2, w: w, h: h };

  noStroke();
  fill(down ? 'darkorange' : 'gainsboro');
  rect(x - w / 2, y - h / 2, w, h, 4);
  fill(down ? 'saddlebrown' : 'darkslategray');
  circle(x, y, 12);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(12);
  text(key, x, y + h / 2 + 2);
  fill(down ? 'darkorange' : 'gray');
  textSize(9);
  text(down ? 'HIGH' : 'LOW', x, y + h / 2 + 16);
}

function drawTransistor(x, y, on, key) {
  noStroke();
  fill(on ? '#3A4A3A' : '#2E2E2E');
  arc(x, y, 30, 30, PI, TWO_PI);
  rect(x - 15, y, 30, 6);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(8);
  text(key, x, y - 7);
}

function drawTransistorV(x, y, on, key) {
  noStroke();
  fill(on ? '#3A4A3A' : '#2E2E2E');
  arc(x, y, 28, 28, PI, TWO_PI);
  rect(x - 14, y, 28, 6);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(8);
  text(key, x, y - 6);
}

function drawResistorGlyph(x, y) {
  noStroke();
  fill('wheat');
  rect(x - 7, y - 9, 14, 18, 2);
  fill('firebrick'); rect(x - 7, y - 3, 14, 3);
}

function drawLed(x, y, lit) {
  noStroke();
  if (lit) {
    fill(255, 200, 60, 120);
    circle(x, y, 30);
  }
  fill(lit ? 'gold' : '#D8DDE2');
  arc(x, y, 17, 20, PI, TWO_PI);
  rect(x - 8.5, y, 17, 5);
}

// ---------------------------------------------------------------------------
// Truth tables
// ---------------------------------------------------------------------------

function drawPanel(andOut, orOut) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 10;

  ty = drawTruthTable('AND', ['A', 'B'], (a, b) => a && b, padX, ty, innerW);
  ty += 14;
  ty = drawTruthTable('OR', ['C', 'D'], (a, b) => a || b, padX, ty, innerW);

  noStroke();
  fill('dimgray');
  textAlign(LEFT, TOP);
  textSize(11);
  const hint = !andOut
    ? 'Press A and B together to fill in the AND gate\'s last row.'
    : 'Both transistors are conducting, so the one current path is complete.';
  text(hint, padX, ty + 6, innerW);
}

function drawTruthTable(title, keys, fn, x, y, w) {
  noStroke();
  fill(title === 'AND' ? '#2878A8' : '#6953B8');
  textAlign(LEFT, TOP);
  textSize(12);
  text(title + ' gate', x, y);
  y += 18;

  const rowH = 20;
  const colW = w / 3;

  // header
  noStroke();
  fill('gray');
  textSize(11);
  textAlign(CENTER, TOP);
  text(keys[0], x + colW * 0.5, y);
  text(keys[1], x + colW * 1.5, y);
  text('Y', x + colW * 2.5, y);
  y += 16;

  const now = [inputs[keys[0]] ? 1 : 0, inputs[keys[1]] ? 1 : 0];
  for (let a = 0; a <= 1; a++) {
    for (let b = 0; b <= 1; b++) {
      const isNow = now[0] === a && now[1] === b;
      const out = fn(a === 1, b === 1) ? 1 : 0;

      if (isNow) {
        noStroke();
        fill(255, 236, 200);
        rect(x - 4, y - 2, w + 8, rowH, 3);
      }
      noStroke();
      fill(isNow ? 'black' : '#98A1A9');
      textAlign(CENTER, TOP);
      textSize(12);
      text(a, x + colW * 0.5, y);
      text(b, x + colW * 1.5, y);
      // Only the row matching the live inputs shows its output: the rest are
      // for the learner to fill in by trying every combination.
      fill(isNow ? (out ? 'darkgreen' : 'crimson') : '#C3C9CF');
      text(isNow ? out : '?', x + colW * 2.5, y);

      if (isNow) {
        noStroke();
        fill('#E8710A');
        textAlign(LEFT, TOP);
        text('▸', x - 12, y);
      }
      y += rowH;
    }
  }
  return y;
}

function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  text('Click the A, B, C and D buttons on the board to toggle each input.',
       80, drawHeight + 25);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  for (const k in btnBoxes) {
    const b = btnBoxes[k];
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      inputs[k] = !inputs[k];
      return;
    }
  }
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
