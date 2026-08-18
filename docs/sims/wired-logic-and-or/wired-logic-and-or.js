// Wired Logic: AND and OR - Breadboard MicroSim
// CANVAS_HEIGHT: 545
//
// Two switches in series light one LED; two switches in parallel light another.
// That is all an AND gate and an OR gate are before any chip is involved: a
// series path needs every switch closed, a parallel path needs only one. Live
// truth tables fill in as the learner sets the inputs.
//
// Circuit chapters: 16 - Switches, Buttons and Wired Logic
//                   24 - Boolean Logic and Transistor Gates

let containerWidth;
let canvasWidth = 800;
let drawHeight = 500;
let controlHeight = 45;        // 1 row x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let defaultTextSize = 16;

let boardTop = 48;
let readoutHeight = 52;

let startButton, resetButton, tableCheckbox;
let isRunning = false;

function setup() {
  updateCanvasSize();
  // Cap the backing store at one device pixel per CSS pixel. At the Retina
  // default a full-width canvas asks the compositor for 4x the pixels every
  // frame, which can stall the compositor on a loaded machine.
  pixelDensity(1);

  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  startButton = createButton('Start');
  startButton.position(10, drawHeight + 8);
  startButton.mousePressed(toggleSimulation);

  resetButton = createButton('Reset');
  resetButton.position(80, drawHeight + 8);
  resetButton.mousePressed(resetSimulation);

  tableCheckbox = createCheckbox(' Show truth tables', true);
  tableCheckbox.position(150, drawHeight + 8);

  bbLayout(margin, boardTop, 400, 300, 20);
  bbReset();

  // Supply on the top rails, jumpered down so the bottom half has power too
  bbBattery({pos: 'T+1', neg: 'T-1', volts: 5, label: 'BAT'});
  bbWire({a: 'T+3', b: 'B+3', color: 'red'});
  bbWire({a: 'T-4', b: 'B-4', color: 'black'});

  // --- AND: two switches in SERIES, top half ---
  // Current has one path, so it needs BOTH switches closed to get through.
  // The resistor sits in row a and the LED in row c so their value labels land
  // at different heights instead of jostling for the same strip of board.
  bbWire({a: 'T+5', b: 'a5', color: 'red'});
  bbSwitch({a: 'c5', b: 'c9', label: 'A', key: '1'});
  bbSwitch({a: 'c9', b: 'c13', label: 'B', key: '2'});
  bbResistor({a: 'a13', b: 'a16', ohms: 220, label: 'R1'});
  bbLED({anode: 'c16', cathode: 'c19', color: 'red', label: 'D1'});
  bbWire({a: 'a19', b: 'T-19', color: 'black'});

  // --- OR: two switches in PARALLEL, bottom half ---
  // Both switches bridge the same pair of nets, so EITHER one completes the
  // circuit on its own. Rows f and j keep them far enough apart that a click
  // can never land on both.
  bbWire({a: 'B+5', b: 'j5', color: 'red'});
  bbSwitch({a: 'f5', b: 'f9', label: 'C', key: '3'});
  bbSwitch({a: 'j5', b: 'j9', label: 'D', key: '4'});
  bbResistor({a: 'h9', b: 'h13', ohms: 220, label: 'R2'});
  bbLED({anode: 'f13', cathode: 'f16', color: 'green', label: 'D2'});
  bbWire({a: 'j16', b: 'B-16', color: 'black'});

  describe('A breadboard wired as two logic gates. Switches A and B in series ' +
    'light the red LED only when both are closed, an AND gate. Switches C and D ' +
    'in parallel light the green LED when either is closed, an OR gate. Live ' +
    'truth tables mark the row matching the current switch settings.', LABEL);
}

function draw() {
  updateCanvasSize();

  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(24);
  text('Wired Logic: Series is AND, Parallel is OR', canvasWidth / 2, 10);

  // Below 700px the tables and the board cannot both be legible, so the board
  // takes the whole width and the readout carries the logic state instead.
  const showTables = tableCheckbox.checked() && canvasWidth >= 700;
  const boardW = showTables ? (canvasWidth - margin * 3) * 0.66
                            : (canvasWidth - margin * 2);
  const boardH = drawHeight - boardTop - readoutHeight;
  bbLayout(margin, boardTop, boardW, boardH, 20);

  bbSolve(isRunning);
  bbDrawBoard();
  bbDrawParts();

  const a = bbPart('A').closed, b = bbPart('B').closed;
  const c = bbPart('C').closed, d = bbPart('D').closed;

  if (showTables) {
    const sx = margin * 2 + boardW;
    const sw = canvasWidth - sx - margin;
    drawTruthTable(sx, boardTop, sw, 'AND  -  A and B in series',
                   ['A', 'B'], [0, 0, 0, 1], a, b, bbIsOn('D1', 1), 'crimson');
    drawTruthTable(sx, boardTop + boardH / 2 + 6, sw, 'OR  -  C and D in parallel',
                   ['C', 'D'], [0, 1, 1, 1], c, d, bbIsOn('D2', 1), 'green');
  }

  // Readout
  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(canvasWidth < 560 ? 13 : defaultTextSize);
  const y = drawHeight - readoutHeight + 6;
  text('A=' + bit(a) + ' B=' + bit(b) + '  →  AND = ' + bit(bbIsOn('D1', 1)) +
       '        C=' + bit(c) + ' D=' + bit(d) + '  →  OR = ' + bit(bbIsOn('D2', 1)),
       margin, y);
  fill('dimgray');
  text('Click the switches on the board, or press 1, 2, 3, 4 to toggle them.',
       margin, y + 22);

  cursor(bbHovering() ? HAND : ARROW);
}

function bit(v) { return v ? '1' : '0'; }

/**
 * A four-row truth table with the live row highlighted.
 *
 * The highlight is what turns the table from a thing to memorize into a
 * readout: the learner flips a switch on the board and watches the marker jump
 * to the matching row.
 */
function drawTruthTable(x, y, w, title, names, outputs, in0, in1, lit, accent) {
  const rowH = 22;
  const h = rowH * 6 + 10;
  push();
  rectMode(CORNER);
  stroke('silver');
  strokeWeight(1);
  fill('white');
  rect(x, y, w, h, 4);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(14);
  text(title, x + w / 2, y + 6);

  const colX = [x + w * 0.22, x + w * 0.45, x + w * 0.75];
  let ry = y + 6 + rowH;

  textSize(13);
  fill('dimgray');
  textAlign(CENTER, CENTER);
  text(names[0], colX[0], ry);
  text(names[1], colX[1], ry);
  text('LED', colX[2], ry);
  stroke('gainsboro');
  line(x + 8, ry + rowH / 2, x + w - 8, ry + rowH / 2);
  noStroke();

  for (let i = 0; i < 4; i++) {
    const bit0 = i >> 1, bit1 = i & 1;
    const live = (bit0 === (in0 ? 1 : 0)) && (bit1 === (in1 ? 1 : 0));
    ry += rowH;

    if (live) {
      fill(accent === 'green' ? color(220, 245, 220) : color(255, 228, 230));
      rect(x + 6, ry - rowH / 2 + 2, w - 12, rowH - 4, 3);
    }
    fill(live ? 'black' : 'gray');
    textSize(live ? 15 : 13);
    textAlign(CENTER, CENTER);
    text(bit0, colX[0], ry);
    text(bit1, colX[1], ry);
    // The output column shows a filled dot for 1 so the pattern reads at a
    // glance - three dark rows and one bright one is the shape of AND.
    if (outputs[i]) { fill(accent); circle(colX[2], ry, live ? 13 : 10); }
    else { noFill(); stroke('darkgray'); strokeWeight(1); circle(colX[2], ry, 10); noStroke(); }
  }
  pop();
}

function toggleSimulation() {
  isRunning = !isRunning;
  startButton.html(isRunning ? 'Pause' : 'Start');
}

function resetSimulation() {
  for (const name of ['A', 'B', 'C', 'D']) bbPart(name).closed = false;
}

function mousePressed()  { bbMousePressed(); }
function mouseReleased() { bbReleaseAll(); }
function keyPressed()    { bbKeyPressed(); }
function keyReleased()   { bbKeyReleased(); }

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
