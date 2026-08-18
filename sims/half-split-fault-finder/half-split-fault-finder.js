// Half-Split Fault Finder
// CANVAS_HEIGHT: 545
// Bloom Level: Analyze (L4) - Verb: examine, distinguish, trace
// Learning objective: Given a rendered six-stage breadboard circuit with
// exactly one hidden fault, use a virtual multimeter in voltage mode to test
// the midpoint of the remaining suspect range, apply the result to eliminate
// half of the remaining stages, and repeat until the single faulty stage is
// identified in three or fewer measurements.
//
// Why half-splitting works, and why this sim forces it:
// Six stages take up to six tests one at a time, but only three by halving.
// Each measurement asks one question - "has the signal survived this far?" -
// and whichever answer comes back, half the remaining suspects are eliminated.
// Only the correct midpoint is clickable, because a learner who is allowed to
// poke around at random never discovers why the method is faster.
//
// The circuit is a single series path, so voltage is present at every test
// point BEFORE the fault and absent at every point AFTER it. That is what
// makes a single reading decisive.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 465;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let powerButton, newFaultButton;
let diagnoseSelect, diagnoseButton;

// ---- State ----
let powered = false;
let faultStage = 0;          // 0..5, the stage that is broken
let lo = 0, hi = 5;          // the remaining suspect range, inclusive
let log = [];
let tested = {};             // tp index -> reading text
let solved = false;
let verdict = null;
let glowPhase = 0;
let mouseOverCanvas = false;
let tpBoxes = {};
let panel = {};

const VS = 5.0;
const COLS = 20;

// Six stages between seven test points. TP0 is the battery, TP6 the LED cathode.
const STAGES = [
  { name: 'SW1',        short: 'SW1' },
  { name: 'R1 (330 Ω)', short: 'R1' },
  { name: 'the wire between R1 and R2', short: 'wire' },
  { name: 'R2 (220 Ω)', short: 'R2' },
  { name: 'D1 (diode)', short: 'D1' },
  { name: 'D2 (the LED)', short: 'D2' }
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

  powerButton = createButton('Power On');
  powerButton.position(10, drawHeight + 10);
  powerButton.mousePressed(togglePower);

  newFaultButton = createButton('New Fault');
  newFaultButton.position(105, drawHeight + 10);
  newFaultButton.mousePressed(newFault);

  diagnoseSelect = createSelect();
  diagnoseSelect.position(105, drawHeight + 45);
  diagnoseSelect.option('-- name the faulty stage --');
  for (const s of STAGES) diagnoseSelect.option(s.name);
  diagnoseButton = createButton('Diagnose');
  diagnoseButton.position(330, drawHeight + 45);
  diagnoseButton.mousePressed(diagnose);

  newFault();

  describe('A six-stage series circuit on a breadboard with one hidden fault. ' +
           'Only the correct half-split midpoint test point is clickable at any ' +
           'moment. Each reading eliminates half the remaining suspect stages ' +
           'and is added to a running log, until one stage remains and can be ' +
           'named.', LABEL);
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

  if (mouseOverCanvas) glowPhase += 0.05;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Half-Split Fault Finding', canvasWidth / 2, 6);

  const stacked = canvasWidth < 720;
  let boardX, boardY, boardW, boardH;
  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.44;
    panel = { x: margin, y: boardY + boardH + 6, w: canvasWidth - 2 * margin,
              h: drawHeight - boardY - boardH - 12 };
  } else {
    boardX = margin; boardY = 30;
    boardW = canvasWidth * 0.55;
    boardH = drawHeight - 44;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 44 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  drawCircuit();
  drawPanel();
  drawControlLabels();
}

// The midpoint of the remaining suspect range - the only legal next test.
function nextTp() {
  if (lo >= hi) return -1;
  return floor((lo + hi + 1) / 2);   // a test point index, 1..5
}

// Voltage at test point i: full supply before the fault, nothing after it.
function voltageAt(i) {
  if (!powered) return 0;
  return i <= faultStage ? VS : 0;
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit() {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('c');

  const x0 = bbColX(2);
  const x6 = bbColX(18);
  const step = (x6 - x0) / 6;
  const tpX = i => x0 + i * step;

  // Series path, drawn segment by segment so the break can be shown
  for (let s = 0; s < 6; s++) {
    const live = powered && s < faultStage;
    const broken = powered && s === faultStage && solved;
    stroke(broken ? 'crimson' : (live ? 'crimson' : '#C3C9CF'));
    strokeWeight(3);
    if (broken) {
      const mx = (tpX(s) + tpX(s + 1)) / 2;
      line(tpX(s), row, mx - 8, row);
      line(mx + 8, row, tpX(s + 1), row);
    } else {
      line(tpX(s), row, tpX(s + 1), row);
    }
    // stage glyph at the midpoint
    drawStageGlyph((tpX(s) + tpX(s + 1)) / 2, row, s);
  }

  // supply in at TP0, return out at TP6
  stroke(powered ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(tpX(0), railPlus, tpX(0), row);
  line(tpX(6), row, tpX(6), railMinus);

  // Test points. Only the current half-split midpoint is live.
  const want = nextTp();
  tpBoxes = {};
  for (let i = 0; i <= 6; i++) {
    const active = powered && !solved && i === want;
    drawTestPoint(tpX(i), row - 30, i, active);
  }

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(VS + ' V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  // Suspect range marker under the board
  if (powered && !solved) {
    const a = tpX(lo), b = tpX(hi + 1);
    stroke('#E8710A');
    strokeWeight(3);
    line(a, row + 42, b, row + 42);
    line(a, row + 36, a, row + 48);
    line(b, row + 36, b, row + 48);
    noStroke();
    fill('#B4650F');
    textAlign(CENTER, TOP);
    textSize(11);
    text('still suspect: ' + (hi - lo + 1) + ' stage' + (hi - lo ? 's' : ''),
         (a + b) / 2, row + 52);
  }
}

function drawStageGlyph(x, y, s) {
  noStroke();
  if (s === 0) {           // SW1
    fill('gainsboro');
    rect(x - 12, y - 9, 24, 18, 3);
    fill(powered ? 'saddlebrown' : 'darkslategray');
    circle(x, y, 9);
  } else if (s === 1 || s === 3) {   // resistors
    fill('wheat');
    rect(x - 14, y - 6, 28, 12, 2);
    fill('firebrick'); rect(x - 4, y - 6, 3, 12);
  } else if (s === 4) {    // diode
    fill('#2E2E2E');
    rect(x - 12, y - 8, 24, 16, 2);
    fill('gainsboro'); rect(x + 6, y - 8, 5, 16);
  } else if (s === 5) {    // LED
    fill('#E4A79F');
    arc(x, y + 2, 18, 20, PI, TWO_PI);
    rect(x - 9, y + 2, 18, 5);
  }
  noStroke();
  fill('gray');
  textAlign(CENTER, TOP);
  textSize(10);
  text(STAGES[s].short, x, y + 14);
}

function drawTestPoint(x, y, i, active) {
  const r = 13;
  tpBoxes[i] = { x: x - r, y: y - r, w: r * 2, h: r * 2 };

  noStroke();
  if (active) {
    fill(232, 113, 10, 70 + sin(glowPhase) * 30);
    circle(x, y, r * 2.6);
  }
  const done = tested[i] !== undefined;
  fill(active ? '#E8710A' : (done ? '#A8B4BF' : '#D8DDE2'));
  circle(x, y, r * 2);

  fill(active ? 'white' : 'dimgray');
  textAlign(CENTER, CENTER);
  textSize(11);
  text(i, x, y);

  if (done) {
    noStroke();
    fill(tested[i] === VS ? 'darkgreen' : 'crimson');
    textAlign(CENTER, BOTTOM);
    textSize(10);
    text(nf(tested[i], 1, 1) + 'V', x, y - r - 2);
  }
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
  let ty = panel.y + 10;

  noStroke();
  textAlign(LEFT, TOP);

  fill('gray');
  textSize(11);
  text('VOLTAGE MODE', padX, ty);
  ty += 15;

  // meter display
  noStroke();
  fill('darkslategray');
  rect(padX, ty, innerW, 44, 6);
  textAlign(CENTER, CENTER);
  const last = log.length ? log[log.length - 1] : null;
  fill(last ? (last.v === VS ? 'lightgreen' : 'lightcoral') : 'lightgray');
  textSize(22);
  text(last ? nf(last.v, 1, 2) + ' V' : '- - -', padX + innerW / 2, ty + 22);
  ty += 54;

  noStroke();
  textAlign(LEFT, TOP);

  if (verdict) {
    fill(verdict.ok ? 'darkgreen' : 'crimson');
    textSize(13);
    text(verdict.text, padX, ty, innerW);
    ty += 74;
  } else if (!powered) {
    fill('dimgray');
    textSize(12);
    text('Switch the power on. The LED will stay dark — one of the six stages ' +
         'is broken, and your job is to find which in three tests or fewer.',
         padX, ty, innerW);
    ty += 56;
  } else if (lo >= hi) {
    fill('darkgreen');
    textSize(12);
    text('One stage left: ' + STAGES[lo].name + '. Name it below to confirm.',
         padX, ty, innerW);
    ty += 40;
  } else {
    fill('black');
    textSize(12);
    text('Test point ' + nextTp() + ' is the midpoint of the ' + (hi - lo + 1) +
         ' stages still in question. Click it — whatever it reads, half of ' +
         'them are ruled out.', padX, ty, innerW);
    ty += 56;
  }

  // The running log
  fill('gray');
  textSize(11);
  text('TEST LOG', padX, ty);
  ty += 16;
  fill('dimgray');
  textSize(11);
  if (!log.length) {
    text('no measurements yet', padX, ty);
  } else {
    for (const e of log) {
      fill(e.v === VS ? 'darkgreen' : 'crimson');
      text('TP' + e.tp + ': ' + nf(e.v, 1, 1) + ' V — ' + e.note, padX, ty, innerW);
      ty += 26;
    }
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(14);
  text('Diagnose:', 10, drawHeight + 57);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (!powered || solved) return;
  const want = nextTp();
  if (want < 0) return;
  const b = tpBoxes[want];
  if (!b) return;
  if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
    takeReading(want);
  }
}

// One reading halves the suspect range.
function takeReading(i) {
  const v = voltageAt(i);
  tested[i] = v;

  let note;
  if (v === VS) {
    // Signal survived this far, so every stage before it is fine.
    note = 'the signal got this far, so stages before it are fine';
    lo = i;
  } else {
    // Nothing here, so the break is at or before this point.
    note = 'nothing reaching this point, so the break is before it';
    hi = i - 1;
  }
  log.push({ tp: i, v: v, note: note });
  verdict = null;
}

function diagnose() {
  const choice = diagnoseSelect.value();
  const idx = STAGES.findIndex(s => s.name === choice);
  if (idx < 0) {
    verdict = { ok: false, text: 'Pick a stage from the list first.' };
    return;
  }
  if (lo < hi) {
    verdict = { ok: false, text: 'There are still ' + (hi - lo + 1) + ' stages in ' +
                'question. Keep half-splitting until only one is left — guessing ' +
                'early is what the method is designed to avoid.' };
    return;
  }
  if (idx === faultStage) {
    solved = true;
    verdict = { ok: true, text: 'Correct — the fault is at ' + STAGES[faultStage].name +
                '. You found it in ' + log.length + ' measurement' +
                (log.length === 1 ? '' : 's') + '. Testing one stage at a time ' +
                'could have taken six.' };
  } else {
    verdict = { ok: false, text: 'Not that one. Your own log narrowed it to ' +
                STAGES[lo].name + ' — trust the measurements over the hunch.' };
  }
}

function togglePower() {
  powered = !powered;
  powerButton.html(powered ? 'Power Off' : 'Power On');
}

function newFault() {
  faultStage = floor(random(STAGES.length));
  lo = 0; hi = STAGES.length - 1;
  log = [];
  tested = {};
  solved = false;
  verdict = null;
  powered = false;
  powerButton.html('Power On');
  diagnoseSelect.selected('-- name the faulty stage --');
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
