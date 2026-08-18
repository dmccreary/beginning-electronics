// Circuit Continuity Fault Tester
// CANVAS_HEIGHT: 520
// Bloom Level: Analyze (L4) - Verb: examine
// Learning objective: Examine a simple circuit diagram containing a voltage
// source, one or more circuit elements and a current path, and use a virtual
// multimeter continuity tester to identify which segment of the path contains
// a circuit fault, by clicking test-probe points and interpreting the
// tester's pass/fail feedback.
//
// Testing model - and why it is built this way:
// A continuity test is done with the power OFF and the battery out of the
// loop. What is left is an open CHAIN of segments running from the battery's
// positive terminal (TP1) around through the load to the negative terminal
// (TP6). Two probe points have continuity only when every segment between
// them along that chain is intact. Modelling it as a closed loop would be
// wrong: a single break in a closed loop still leaves a path the long way
// round, so every test would read "connected" and the exercise would teach
// nothing.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 470;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let defaultTextSize = 16;

// ---- Controls ----
let newButton;
let revealButton;

// ---- State ----
let faultIndex = 0;        // which segment is broken (0 .. SEGMENTS-1)
let probeA = null;         // first selected test point
let probeB = null;         // second selected test point
let lastResult = null;     // { ok, from, to }
let revealed = false;
let testLog = [];
let tests = 0;

// Five segments joining six test points along the chain.
const SEGMENTS = 5;
const TP_LABELS = ['TP1', 'TP2', 'TP3', 'TP4', 'TP5', 'TP6'];
// What lies on each segment, used in the reveal explanation.
const SEGMENT_PARTS = [
  'the wire from the battery to the resistor',
  'the resistor lead',
  'the wire between the resistor and the LED',
  'the LED lead',
  'the return wire back to the battery'
];
const FAULT_KINDS = [
  'a broken wire', 'a disconnected component lead', 'a broken wire',
  'a disconnected component lead', 'a broken wire'
];

let tp = [];               // test-point positions, recomputed each frame
let panel = {};

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

  newButton = createButton('New Circuit');
  newButton.position(10, drawHeight + 10);
  newButton.mousePressed(newCircuit);

  revealButton = createButton('Reveal Fault');
  revealButton.position(115, drawHeight + 10);
  revealButton.mousePressed(revealFault);

  newCircuit();

  describe('A circuit loop containing a battery, a resistor and an LED, with ' +
           'six numbered test points along the current path. One segment is ' +
           'randomly broken. Clicking two test points runs a continuity test ' +
           'and reports pass or fail, building a test log that narrows down ' +
           'where the fault is.', LABEL);
}

function draw() {
  updateCanvasSize();
  computeLayout();

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
  textSize(22);
  text('Continuity Fault Tester', canvasWidth / 2, 8);

  drawCircuit();
  drawMeterPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function computeLayout() {
  const stacked = canvasWidth < 660;
  let diagRight, diagBottom;

  if (stacked) {
    diagRight = canvasWidth;
    diagBottom = drawHeight * 0.52;
    panel = { x: 10, y: diagBottom + 6, w: canvasWidth - 20, h: drawHeight - diagBottom - 16 };
  } else {
    diagRight = canvasWidth * 0.62;
    diagBottom = drawHeight;
    panel = { x: diagRight + 10, y: 44, w: canvasWidth - diagRight - 20, h: drawHeight - 60 };
  }

  const lx = margin + 20;
  const rx = max(diagRight - margin - 16, lx + 190);
  const ty = 76;
  const by = diagBottom - (stacked ? 30 : 120);
  const midY = (ty + by) / 2;

  // The chain runs: TP1 (battery +) -> along the top -> down the right ->
  // back along the bottom -> TP6 (battery -).
  tp = [
    { x: lx, y: midY - 26, label: 'TP1' },   // battery positive
    { x: lx, y: ty,        label: 'TP2' },   // top-left corner
    { x: (lx + rx) / 2, y: ty, label: 'TP3' },   // between resistor and LED
    { x: rx, y: ty,        label: 'TP4' },   // top-right corner
    { x: rx, y: by,        label: 'TP5' },   // bottom-right corner
    { x: lx, y: by,        label: 'TP6' }    // battery negative side
  ];
  tp.midY = midY;
  tp.lx = lx; tp.rx = rx; tp.ty = ty; tp.by = by;
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit() {
  // Battery between TP1 and TP6 on the left edge
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  line(tp.lx, tp.midY + 26, tp.lx, tp.by);

  stroke('darkorange');
  strokeWeight(4);
  line(tp.lx - 17, tp.midY - 26, tp.lx + 17, tp.midY - 26);
  stroke('dimgray');
  line(tp.lx - 9, tp.midY + 26, tp.lx + 9, tp.midY + 26);

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(14);
  text('battery', tp.lx + 24, tp.midY);

  // The five chain segments
  for (let i = 0; i < SEGMENTS; i++) {
    drawSegment(i);
  }

  // Resistor on segment 1 (between TP2 and TP3), LED on segment 3
  drawResistorBetween(tp[1], tp[2]);
  drawLedBetween(tp[2], tp[3]);

  // Test points last so they sit on top
  for (let i = 0; i < tp.length; i++) {
    const p = tp[i];
    const isProbe = probeA === i || probeB === i;
    noStroke();
    if (isProbe) {
      fill(255, 165, 0, 90);
      circle(p.x, p.y, 30);
    }
    fill(isProbe ? 'darkorange' : 'mediumblue');
    circle(p.x, p.y, 14);

    fill('black');
    textAlign(CENTER, BOTTOM);
    textSize(13);
    // Offset labels away from the wire so they stay readable
    const off = (p.y === tp.by) ? 26 : -12;
    text(p.label, p.x, p.y + off);
  }
}

// Highlights a segment green or red once it has been included in a test.
function drawSegment(i) {
  const a = tp[i];
  const b = tp[i + 1];
  const broken = (i === faultIndex);

  let col = 'steelblue';
  let weight = 3;

  if (lastResult && i >= min(lastResult.from, lastResult.to) && i < max(lastResult.from, lastResult.to)) {
    col = lastResult.ok ? 'green' : 'crimson';
    weight = 6;
  }
  if (revealed && broken) {
    col = 'crimson';
    weight = 6;
  }

  stroke(col);
  strokeWeight(weight);
  noFill();

  if (broken && (revealed || (lastResult && !lastResult.ok))) {
    // Draw the break as a visible gap once the learner has evidence of it
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = (b.x - a.x), dy = (b.y - a.y);
    const len = sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    line(a.x, a.y, mx - ux * 9, my - uy * 9);
    line(mx + ux * 9, my + uy * 9, b.x, b.y);
  } else {
    line(a.x, a.y, b.x, b.y);
  }
}

function drawResistorBetween(a, b) {
  const cx = (a.x + b.x) / 2;
  const y = a.y;
  const w = min(70, abs(b.x - a.x) * 0.55);
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  const x0 = cx - w / 2;
  beginShape();
  vertex(x0, y);
  const zig = 6;
  const s = w / zig;
  for (let i = 0; i < zig; i++) vertex(x0 + s * (i + 0.5), y + (i % 2 === 0 ? -10 : 10));
  vertex(cx + w / 2, y);
  endShape();

  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text('resistor', cx, y - 16);
}

function drawLedBetween(a, b) {
  const cx = (a.x + b.x) / 2;
  const y = a.y;
  noStroke();
  fill('lightsteelblue');
  triangle(cx - 12, y - 11, cx - 12, y + 11, cx + 10, y);
  stroke('dimgray');
  strokeWeight(4);
  line(cx + 10, y - 12, cx + 10, y + 12);

  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text('LED', cx, y - 18);
}

// ---------------------------------------------------------------------------
// Multimeter panel
// ---------------------------------------------------------------------------

function drawMeterPanel() {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(17);
  text('Continuity Tester', padX, ty);
  ty += 26;

  // The meter display
  const dispH = 52;
  fill('darkslategray');
  noStroke();
  rect(padX, ty, innerW, dispH, 6);

  textAlign(CENTER, CENTER);
  if (!lastResult) {
    fill('lightgray');
    textSize(24);
    text('- - -', padX + innerW / 2, ty + dispH / 2);
  } else if (lastResult.ok) {
    fill('lightgreen');
    textSize(22);
    text('✓  continuity', padX + innerW / 2, ty + dispH / 2);
  } else {
    fill('lightcoral');
    textSize(22);
    text('✗  no continuity', padX + innerW / 2, ty + dispH / 2);
  }
  ty += dispH + 12;

  // Message line
  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);
  fill('dimgray');
  let msg;
  if (!lastResult) {
    msg = probeA === null
      ? 'Click a test point to place the first probe.'
      : 'Now click a second test point to run the test.';
  } else {
    msg = lastResult.ok
      ? 'Continuity — this path is connected.'
      : 'No continuity — this path is broken.';
  }
  text(msg, padX, ty, innerW);
  ty += 40;

  // Reveal explanation
  if (revealed) {
    fill('crimson');
    textSize(14);
    const kind = FAULT_KINDS[faultIndex];
    const where = SEGMENT_PARTS[faultIndex];
    text('Fault found: ' + kind + ' in ' + where + ' (between ' +
         TP_LABELS[faultIndex] + ' and ' + TP_LABELS[faultIndex + 1] + '). ' +
         'In real life this shows up as an LED that will not light even ' +
         'though the battery is good.', padX, ty, innerW);
    ty += 92;
  }

  // Test log
  fill('black');
  textSize(14);
  text('Test log', padX, ty);
  ty += 20;

  fill('dimgray');
  textSize(13);
  const maxRows = max(0, floor((panel.y + panel.h - ty - 8) / 17));
  const start = max(0, testLog.length - maxRows);
  for (let i = start; i < testLog.length; i++) {
    text(testLog[i], padX, ty);
    ty += 17;
  }
  if (testLog.length === 0) {
    text('no tests yet', padX, ty);
  }
}

function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(14);
  text('Click two test points to probe between them.', 215, drawHeight + 25);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0 || mouseY > drawHeight) return;

  for (let i = 0; i < tp.length; i++) {
    if (dist(mouseX, mouseY, tp[i].x, tp[i].y) <= 16) {
      if (probeA === null) {
        probeA = i;
        probeB = null;
        lastResult = null;
      } else if (i === probeA) {
        probeA = null;                 // clicking the same point clears it
      } else {
        probeB = i;
        runTest(probeA, probeB);
      }
      return;
    }
  }
}

// Continuity holds when every segment between the two probes is intact.
function runTest(a, b) {
  const lo = min(a, b);
  const hi = max(a, b);
  const ok = !(faultIndex >= lo && faultIndex < hi);

  lastResult = { ok: ok, from: lo, to: hi };
  tests++;
  testLog.push(TP_LABELS[lo] + ' → ' + TP_LABELS[hi] + '  ' + (ok ? 'PASS' : 'FAIL'));

  // Leave the probes shown so the learner can see what was just measured,
  // then reset for the next test.
  probeA = null;
  probeB = null;
}

function newCircuit() {
  faultIndex = floor(random(SEGMENTS));
  probeA = null;
  probeB = null;
  lastResult = null;
  revealed = false;
  testLog = [];
  tests = 0;
}

// Available once the learner has actually done some narrowing down.
function revealFault() {
  if (tests < 2) {
    testLog.push('run at least two tests first');
    return;
  }
  revealed = true;
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
