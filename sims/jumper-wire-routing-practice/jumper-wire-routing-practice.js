// Jumper Wire Routing Practice
// CANVAS_HEIGHT: 470
// Bloom Level: Apply (L3) - Verb: construct, demonstrate
// Learning objective: Construct a valid connection between two highlighted
// breadboard tie points by selecting the correct jumper wire type
// (male-to-male or male-to-female) for the situation and routing a wire
// between them without crossing the gutter incorrectly or bridging the
// power rails.
//
// The board itself is drawn by breadboard-lib.js, the same renderer the
// Breadboard Anatomy Explorer uses, so the board a learner practises on here
// is pixel-for-pixel the board they already met earlier in the chapter.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 420;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let defaultTextSize = 16;

// ---- Controls ----
let newRoundButton;
let routingCheckbox;

// ---- State ----
let target = null;         // { a: {row,col}, b: {row,col}, needsFemale, bIsHeader }
let wireType = null;       // 'mm' | 'mf'
let firstPick = null;      // first tie point clicked while routing
let routed = null;         // the completed path, as a list of {row,col} corners
let feedback = null;       // { ok, msg }
let completed = 0;
let showMessy = false;
let trayBoxes = {};

const COLS = 30;
const ROWS_TOP = ['a', 'b', 'c', 'd', 'e'];
const ROWS_BOTTOM = ['f', 'g', 'h', 'i', 'j'];

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  newRoundButton = createButton('New Round');
  newRoundButton.position(10, drawHeight + 10);
  newRoundButton.mousePressed(newRound);

  routingCheckbox = createCheckbox('Show Neat vs. Messy Routing', false);
  routingCheckbox.position(110, drawHeight + 12);
  routingCheckbox.changed(() => showMessy = routingCheckbox.checked());

  newRound(true);

  describe('A solderless breadboard with two highlighted target tie points and ' +
           'a tray holding a male-to-male and a male-to-female jumper wire. ' +
           'The learner picks a wire type, then clicks the two targets to route ' +
           'a grid-aligned wire between them, and gets immediate feedback on ' +
           'whether the wire type and routing are correct.', LABEL);
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
  text('Jumper Wire Routing Practice', canvasWidth / 2, 6);

  // The board occupies the upper area; the tray and instruction sit below it.
  const trayH = 76;
  const boardTop = 34;
  const boardH = drawHeight - boardTop - trayH - 30;
  bbLayout(margin, boardTop, canvasWidth - 2 * margin, boardH, COLS, { supply: false });
  bbDrawBoard();

  drawTargets();
  if (routed) drawRoutedWire();
  if (showMessy) drawRoutingComparison();

  drawTray(drawHeight - trayH - 4, trayH);
  drawInstruction();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Rounds
// ---------------------------------------------------------------------------

// Round 1 is always the simple case - two ordinary holes on the same side of
// the gutter - so the learner's first success is a plain male-to-male run.
function newRound(first) {
  const kind = first === true ? 0 : floor(random(4));

  let a, b, bIsHeader = false;

  if (kind === 0) {
    // Same side of the gutter, two ordinary holes
    const rows = random() < 0.5 ? ROWS_TOP : ROWS_BOTTOM;
    a = { row: random(rows), col: floor(random(2, 12)) };
    b = { row: random(rows), col: floor(random(16, COLS - 1)) };
  } else if (kind === 1) {
    // Across the gutter
    a = { row: random(ROWS_TOP), col: floor(random(2, 14)) };
    b = { row: random(ROWS_BOTTOM), col: floor(random(14, COLS - 1)) };
  } else if (kind === 2) {
    // One end on a power rail
    a = { row: random(ROWS_TOP), col: floor(random(3, COLS - 2)) };
    b = { row: random() < 0.5 ? 'T+' : 'B-', col: floor(random(3, COLS - 2)) };
  } else {
    // A sensor module pin header - this is the male-to-female case
    a = { row: random(ROWS_TOP.concat(ROWS_BOTTOM)), col: floor(random(3, COLS - 2)) };
    b = { row: 'header', col: floor(random(4, COLS - 6)) };
    bIsHeader = true;
  }

  target = { a: a, b: b, bIsHeader: bIsHeader, needsFemale: bIsHeader };
  wireType = null;
  firstPick = null;
  routed = null;
  feedback = null;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

// Where a tie point sits on screen. The pin-header target floats just above
// the board, standing in for a module plugged in beside it.
function pointXY(p) {
  if (p.row === 'header') {
    return { x: bbColX(p.col), y: BB.y - BB.pitch * 1.4 };
  }
  return { x: bbColX(p.col), y: bbRowY(p.row) };
}

function drawTargets() {
  for (const key of ['a', 'b']) {
    const p = target[key];
    const xy = pointXY(p);

    if (p.row === 'header') {
      // A small pin-header module sitting above the board
      noStroke();
      fill('darkslateblue');
      rect(xy.x - BB.pitch * 1.6, xy.y - BB.pitch * 0.9, BB.pitch * 3.2, BB.pitch * 1.5, 3);
      fill('gold');
      for (let i = -1; i <= 1; i++) circle(xy.x + i * BB.pitch, xy.y + BB.pitch * 0.5, BB.pitch * 0.35);
      noStroke();
      fill('black');
      textAlign(CENTER, BOTTOM);
      textSize(11);
      text('module', xy.x, xy.y - BB.pitch * 1.0);
    }

    // Target ring
    const done = routed !== null;
    noFill();
    stroke(done ? 'seagreen' : '#E8710A');
    strokeWeight(3);
    circle(xy.x, xy.y, BB.pitch * 1.5);

    // Address label
    noStroke();
    fill('black');
    textAlign(CENTER, TOP);
    textSize(11);
    const label = p.row === 'header' ? 'header' : rowColLabel(p);
    text(label, xy.x, xy.y + BB.pitch * 0.9);
  }
}

function rowColLabel(p) {
  if (p.row === 'T+') return '+ rail';
  if (p.row === 'T-') return '− rail';
  if (p.row === 'B+') return '+ rail';
  if (p.row === 'B-') return '− rail';
  return 'row ' + p.row + ', col ' + p.col;
}

// The routed wire runs along the grid: up out of the hole, across, then down
// into the destination - never a diagonal, which is the routing habit the
// chapter is teaching.
function routePath(a, b) {
  const pa = pointXY(a);
  const pb = pointXY(b);
  // Run the horizontal leg through the center channel when crossing the
  // gutter, otherwise just above the higher of the two points.
  const laneY = min(pa.y, pb.y) - BB.pitch * 1.2;
  return [
    { x: pa.x, y: pa.y },
    { x: pa.x, y: laneY },
    { x: pb.x, y: laneY },
    { x: pb.x, y: pb.y }
  ];
}

function drawRoutedWire() {
  const pts = routed;
  const col = feedback && !feedback.ok ? 'crimson' : (wireType === 'mf' ? 'darkviolet' : '#B35309');

  stroke(col);
  strokeWeight(4);
  noFill();
  beginShape();
  for (const p of pts) vertex(p.x, p.y);
  endShape();

  // End plugs
  noStroke();
  fill(col);
  circle(pts[0].x, pts[0].y, 8);
  circle(pts[pts.length - 1].x, pts[pts.length - 1].y, 8);
}

// Side-by-side reminder of what tidy routing buys you.
function drawRoutingComparison() {
  const a = target.a, b = target.b;
  const pa = pointXY(a), pb = pointXY(b);

  // The messy version: a single diagonal straight line
  stroke('indianred');
  strokeWeight(2);
  drawingContext.setLineDash([6, 5]);
  line(pa.x, pa.y, pb.x, pb.y);
  drawingContext.setLineDash([]);

  noStroke();
  fill('indianred');
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text('messy: diagonal across the board', (pa.x + pb.x) / 2, (pa.y + pb.y) / 2 - 6);
}

// ---------------------------------------------------------------------------
// Supply tray
// ---------------------------------------------------------------------------

function drawTray(y, h) {
  const boxW = min(220, (canvasWidth - 3 * margin) / 2);
  const y0 = y + 6;
  // Leave clear space under the tray for the instruction / feedback line.
  const boxH = h - 32;

  trayBoxes = {
    mm: { x: margin, y: y0, w: boxW, h: boxH },
    mf: { x: margin + boxW + 14, y: y0, w: boxW, h: boxH }
  };

  drawWireOption('mm', 'Male-to-male', 'both ends are pins', '#B35309');
  drawWireOption('mf', 'Male-to-female', 'one end is a socket', 'darkviolet');

  // Running counter
  noStroke();
  fill('black');
  textAlign(RIGHT, CENTER);
  textSize(defaultTextSize);
  text('Connections completed: ' + completed, canvasWidth - margin, y0 + (h - 24) / 2);
}

function drawWireOption(key, title, sub, col) {
  const b = trayBoxes[key];
  const sel = wireType === key;

  fill(sel ? 'lightyellow' : 'white');
  stroke(sel ? '#E8710A' : 'silver');
  strokeWeight(sel ? 3 : 1);
  rect(b.x, b.y, b.w, b.h, 8);

  // A little wire glyph: a pin on the left, pin or socket on the right
  const cy = b.y + 20;
  stroke(col);
  strokeWeight(3);
  line(b.x + 14, cy, b.x + 62, cy);
  noStroke();
  fill(col);
  triangle(b.x + 8, cy - 3, b.x + 8, cy + 3, b.x + 14, cy);   // male pin
  if (key === 'mm') {
    triangle(b.x + 68, cy - 3, b.x + 68, cy + 3, b.x + 62, cy);
  } else {
    noFill();
    stroke(col);
    strokeWeight(3);
    rect(b.x + 62, cy - 5, 9, 10, 2);                          // female socket
  }

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(14);
  text(title, b.x + 82, b.y + 8);
  fill('dimgray');
  textSize(12);
  text(sub, b.x + 82, b.y + 26);
}

// ---------------------------------------------------------------------------
// Instruction and feedback line
// ---------------------------------------------------------------------------

function drawInstruction() {
  const y = drawHeight - 12;
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(14);

  if (feedback) {
    fill(feedback.ok ? 'darkgreen' : 'crimson');
    text(feedback.msg, margin, y);
    return;
  }

  fill('dimgray');
  let msg;
  if (!wireType) {
    msg = 'Step 1 — pick a jumper wire type, then connect ' +
          rowColLabel(target.a) + ' to ' + rowColLabel(target.b) + '.';
  } else if (!firstPick) {
    msg = 'Step 2 — click the first target ring, then the second, to route the wire.';
  } else {
    msg = 'Now click the other target ring to finish the run.';
  }
  text(msg, margin, y);
}

function drawControlLabels() {
  // Both controls carry their own labels.
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0) return;

  // Tray selection
  for (const key of ['mm', 'mf']) {
    const b = trayBoxes[key];
    if (b && mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      wireType = key;
      feedback = null;
      return;
    }
  }

  if (!wireType || routed) return;

  // Target rings
  for (const key of ['a', 'b']) {
    const p = target[key];
    const xy = pointXY(p);
    if (dist(mouseX, mouseY, xy.x, xy.y) <= BB.pitch) {
      if (!firstPick) {
        firstPick = key;
      } else if (firstPick !== key) {
        routed = routePath(target[firstPick], target[key]);
        checkConnection();
      }
      return;
    }
  }
}

// The rules the round is graded against.
function checkConnection() {
  const a = target.a, b = target.b;

  // Rule 1 - a module pin header needs a male-to-female jumper
  if (target.needsFemale && wireType !== 'mf') {
    feedback = { ok: false, msg: 'A module pin header is a socket, so this run needs a ' +
                                 'male-to-female jumper — a male-to-male will not seat in it.' };
    return;
  }
  if (!target.needsFemale && wireType === 'mf') {
    feedback = { ok: false, msg: 'Both ends are breadboard holes, so a male-to-male jumper ' +
                                 'is the right choice here.' };
    return;
  }

  // Rule 2 - never bridge the + rail to the - rail
  if (bridgesRails(a, b)) {
    feedback = { ok: false, msg: 'That bridges the + and − rails — check Chapter 6\'s ' +
                                 'warning about shorting the rails.' };
    return;
  }

  feedback = { ok: true, msg: wireType === 'mf'
    ? 'Nice — male-to-female is right when one end plugs onto a module pin header.'
    : 'Nice — male-to-male is right for two breadboard holes.' };
  completed++;
}

function bridgesRails(a, b) {
  const plus = r => r === 'T+' || r === 'B+';
  const minus = r => r === 'T-' || r === 'B-';
  return (plus(a.row) && minus(b.row)) || (minus(a.row) && plus(b.row));
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  // The routed path is stored in pixels, so it must be recomputed at the new
  // scale rather than left pointing at stale coordinates.
  if (routed && firstPick) {
    const other = firstPick === 'a' ? 'b' : 'a';
    routed = routePath(target[firstPick], target[other]);
  }
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
