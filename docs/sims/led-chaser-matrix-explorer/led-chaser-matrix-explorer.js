// LED Chaser and Matrix Wiring Explorer
// CANVAS_HEIGHT: 520
// Bloom Level: Understand (L2) / Apply (L3) - Verb: compare, demonstrate, differentiate
// Learning objective: Compare how six LEDs are wired under parallel LED wiring
// versus an LED matrix layout, and demonstrate a blinking output pattern by
// starting a chaser sequence and observing which single LED is lit at each step.
//
// The wire count is the whole comparison:
//   parallel  6 LEDs x (one supply wire + one return wire)   = 12 wires
//   matrix    2 row wires + 3 column wires                   =  5 wires
// The matrix saves wires by making each LED share its row and column with
// others - which is exactly why only one can be lit at a time, and why a
// chaser (one LED at a time) is the natural thing to run on it.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// ---- Controls ----
let modeButton, playButton, resetButton;
let speedSlider;

// ---- State ----
let matrixMode = false;
let chasing = false;
let step = 0;
let lastStep = 0;
let speed = 5;
let hoverLed = -1;
let ledPts = [];
let mouseOverCanvas = false;
let panel = {};

const COLS = 20;
const N = 6;

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

  modeButton = createButton('Mode: Parallel');
  modeButton.position(10, drawHeight + 10);
  modeButton.mousePressed(toggleMode);

  playButton = createButton('Play Chaser');
  playButton.position(140, drawHeight + 10);
  playButton.mousePressed(toggleChaser);

  resetButton = createButton('Reset');
  resetButton.position(250, drawHeight + 10);
  resetButton.mousePressed(resetAll);

  speedSlider = createSlider(1, 10, speed, 1);
  speedSlider.position(sliderLeftMargin, drawHeight + 45);
  speedSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('Six LEDs on a breadboard, shown either as six independent parallel ' +
           'branches with twelve wires or as a two-by-three matrix with five ' +
           'row and column wires. A chaser sequence lights one LED at a time, ' +
           'and a live wire-count readout shows the trade-off between the two ' +
           'wiring styles.', LABEL);
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

  speed = speedSlider.value();

  // Advance the chaser on its own clock, only while the pointer is over the
  // canvas so the page does not blink away while a student reads around it.
  if (chasing && mouseOverCanvas) {
    const period = map(speed, 1, 10, 900, 90);
    if (millis() - lastStep > period) {
      lastStep = millis();
      step = (step + 1) % N;
    }
  }

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('LED Chaser: Parallel vs Matrix', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  let boardX, boardY, boardW, boardH;
  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.46;
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

  if (matrixMode) drawMatrix(); else drawParallel();
  drawPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Parallel wiring: six independent branches
// ---------------------------------------------------------------------------

function drawParallel() {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('c');

  ledPts = [];
  for (let i = 0; i < N; i++) {
    const x = bbColX(4 + i * 2.4);
    const lit = chasing ? (i === step) : false;

    // its own supply wire, its own resistor, its own return wire
    stroke(lit ? 'crimson' : '#C3C9CF');
    strokeWeight(2);
    line(x, railPlus, x, row - 26);
    drawResistorGlyph(x, row - 16);
    line(x, row - 8, x, row - 6);
    stroke(lit ? 'crimson' : '#C3C9CF');
    line(x, row + 14, x, railMinus);

    drawLed(x, row, lit, i);
    ledPts.push({ x: x, y: row, i: i });

    noStroke();
    fill(lit ? 'black' : 'gray');
    textAlign(CENTER, TOP);
    textSize(10);
    text('LED ' + (i + 1), x, row + 18);
  }

  labelRails(railPlus, railMinus);
}

// ---------------------------------------------------------------------------
// Matrix wiring: 2 rows x 3 columns sharing wires
// ---------------------------------------------------------------------------

function drawMatrix() {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const rowYs = [bbRowY('b'), bbRowY('h')];
  const colXs = [bbColX(6), bbColX(10), bbColX(14)];

  // The two row wires and three column wires - five in total
  for (let r = 0; r < 2; r++) {
    const active = chasing && floor(step / 3) === r;
    stroke(active ? 'crimson' : '#C3C9CF');
    strokeWeight(active ? 3 : 2);
    line(colXs[0] - 26, rowYs[r], colXs[2] + 26, rowYs[r]);
    noStroke();
    fill(active ? 'crimson' : 'gray');
    textAlign(RIGHT, CENTER);
    textSize(11);
    text('row ' + (r + 1), colXs[0] - 30, rowYs[r]);
  }
  for (let c = 0; c < 3; c++) {
    const active = chasing && (step % 3) === c;
    stroke(active ? 'mediumblue' : '#C3C9CF');
    strokeWeight(active ? 3 : 2);
    line(colXs[c], rowYs[0] - 26, colXs[c], rowYs[1] + 26);
    noStroke();
    fill(active ? 'mediumblue' : 'gray');
    textAlign(CENTER, BOTTOM);
    textSize(11);
    text('col ' + (c + 1), colXs[c], rowYs[0] - 30);
  }

  // The six LEDs sit at the intersections
  ledPts = [];
  for (let i = 0; i < N; i++) {
    const r = floor(i / 3), c = i % 3;
    const lit = chasing && i === step;
    drawLed(colXs[c], rowYs[r], lit, i);
    ledPts.push({ x: colXs[c], y: rowYs[r], i: i });

    noStroke();
    fill(lit ? 'black' : 'gray');
    textAlign(CENTER, TOP);
    textSize(10);
    text('r' + (r + 1) + 'c' + (c + 1), colXs[c], rowYs[r] + 16);
  }

  labelRails(railPlus, railMinus);
}

function labelRails(railPlus, railMinus) {
  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('+V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);
}

function drawLed(x, y, lit, i) {
  const hovered = hoverLed === i;
  noStroke();
  if (lit) {
    fill(255, 200, 60, 110);
    circle(x, y, 30);
  }
  if (hovered) {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    circle(x, y, 26);
  }
  noStroke();
  fill(lit ? 'gold' : '#D8DDE2');
  arc(x, y, 16, 19, PI, TWO_PI);
  rect(x - 8, y, 16, 5);
  stroke('#8B95A0');
  strokeWeight(2);
  line(x + 1, y + 5, x + 7, y + 5);
}

function drawResistorGlyph(cx, y) {
  noStroke();
  fill('wheat');
  rect(cx - 6, y - 9, 12, 18, 2);
  fill('firebrick'); rect(cx - 6, y - 4, 12, 3);
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function drawPanel() {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // The headline number: the wire count
  fill('gray');
  textSize(11);
  text('WIRES NEEDED', padX, ty);
  ty += 16;
  fill(matrixMode ? 'darkgreen' : 'black');
  textSize(28);
  text(matrixMode ? '5 wires' : '12 wires', padX, ty);
  ty += 34;

  fill('black');
  textSize(13);
  if (matrixMode) {
    text('Matrix: 2 row wires + 3 column wires. Each LED shares its row with ' +
         'two others and its column with one other, so a single LED is picked ' +
         'by choosing one row and one column.', padX, ty, innerW);
  } else {
    text('Parallel: each LED gets its own supply wire and its own return wire — ' +
         '6 × 2 = 12. Every branch is independent, so any combination of LEDs ' +
         'can be on at once.', padX, ty, innerW);
  }
  ty += 68;

  // Which LED is lit right now
  fill('gray');
  textSize(11);
  text('CHASER', padX, ty);
  ty += 16;
  fill(chasing ? 'darkorange' : 'dimgray');
  textSize(14);
  if (!chasing) {
    text('Stopped. Press Play Chaser to light the LEDs one at a time.', padX, ty, innerW);
  } else if (matrixMode) {
    const r = floor(step / 3) + 1, c = (step % 3) + 1;
    text('Lit: row ' + r + ', column ' + c + '  (LED ' + (step + 1) + ' of 6)',
         padX, ty, innerW);
  } else {
    text('Lit: LED ' + (step + 1) + ' of 6', padX, ty, innerW);
  }
  ty += 44;

  // Hover explanation
  if (hoverLed >= 0) {
    const r = floor(hoverLed / 3) + 1, c = (hoverLed % 3) + 1;
    fill('#E8710A');
    textSize(12);
    text(matrixMode
      ? 'This LED sits where row ' + r + ' crosses column ' + c + '. It lights ' +
        'only when that row and that column are both driven — which is why a ' +
        'matrix shows one LED at a time.'
      : 'This LED is its own branch, with its own resistor and its own pair of ' +
        'wires. Nothing it does affects the other five.', padX, ty, innerW);
    ty += 68;
  }

  fill('gray');
  textSize(12);
  text('The matrix trades independence for wires: fewer connections, but only ' +
       'one LED lit at any instant.', padX, ty, innerW);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Speed: ' + speed, 10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mouseMoved() {
  hoverLed = -1;
  for (const p of ledPts) {
    if (dist(mouseX, mouseY, p.x, p.y) <= 14) hoverLed = p.i;
  }
}

function toggleMode() {
  matrixMode = !matrixMode;
  modeButton.html('Mode: ' + (matrixMode ? 'Matrix' : 'Parallel'));
}

function toggleChaser() {
  chasing = !chasing;
  playButton.html(chasing ? 'Stop Chaser' : 'Play Chaser');
  lastStep = millis();
}

function resetAll() {
  matrixMode = false;
  chasing = false;
  step = 0;
  modeButton.html('Mode: Parallel');
  playButton.html('Play Chaser');
  speedSlider.value(5);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  speedSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
