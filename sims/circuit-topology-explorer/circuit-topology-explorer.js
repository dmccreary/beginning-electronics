// Circuit Topology Explorer - nodes, branches and loops
// CANVAS_HEIGHT: 480
// Bloom Level: Remember (L1) - Verb: identify
// Learning objective: Identify the nodes, branches and loops in a
// series-parallel circuit (one battery, one series resistor, and two parallel
// resistors) by clicking each part of the diagram and reading its definition
// in an infobox.
//
// Teaching point built into the layout: nodes C and D are drawn at two
// separate places on the page but are the SAME electrical node. Clicking
// either one flashes both, so "topology describes connection, not position"
// becomes something the learner sees rather than something they are told.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 430;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let defaultTextSize = 16;

// ---- Controls ----
let loopButton;
let resetButton;

// ---- State ----
let selected = null;       // 'node:A' | 'branch:R1' | 'loop'
let loopActive = false;
let pulsePhase = 0;
let mouseOverCanvas = false;

// Layout, recomputed each frame
let stacked = false;
let geo = {};              // node positions and branch paths
let panel = {};

// Node A and B are ordinary nodes. C and D are two drawn points that belong
// to the same electrical node (the bottom rail).
const SAME_NODE = { C: 'D', D: 'C' };

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  loopButton = createButton('Highlight a Loop');
  loopButton.position(10, drawHeight + 10);
  loopButton.mousePressed(toggleLoop);

  resetButton = createButton('Reset View');
  resetButton.position(150, drawHeight + 10);
  resetButton.mousePressed(resetView);

  describe('A series-parallel circuit with a battery, one series resistor and ' +
           'two parallel resistors. Four labeled node dots and three branches ' +
           'can be clicked to read definitions of node, branch and loop. A ' +
           'button traces one closed loop around the circuit.', LABEL);
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
  text('Circuit Topology Explorer', canvasWidth / 2, 8);

  if (mouseOverCanvas) pulsePhase += 0.06;

  drawBranches();
  if (loopActive) drawLoopOverlay();
  drawNodes();
  drawInfoPanel();

  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function computeLayout() {
  stacked = canvasWidth < 640;

  let diagramRight, diagramBottom;
  if (stacked) {
    diagramRight = canvasWidth;
    diagramBottom = drawHeight * 0.60;
    panel = { x: 10, y: diagramBottom + 6, w: canvasWidth - 20, h: drawHeight - diagramBottom - 16 };
  } else {
    diagramRight = canvasWidth * 0.64;
    diagramBottom = drawHeight;
    panel = { x: diagramRight + 10, y: 46, w: canvasWidth - diagramRight - 20, h: drawHeight - 62 };
  }

  const lx = margin + 26;
  const rx = max(diagramRight - margin - 20, lx + 180);
  const ty = 72;
  const by = diagramBottom - (stacked ? 26 : 74);

  // Node A: top-left, straight off the battery's positive plate
  // Node B: after the series resistor, where the two parallel branches split
  // Node C: where the parallel branches rejoin
  // Node D: the battery's negative side - electrically identical to C
  const splitX = lx + (rx - lx) * 0.46;
  const midY = (ty + by) / 2;

  geo = {
    lx: lx, rx: rx, ty: ty, by: by, midY: midY, splitX: splitX,
    A: { x: lx, y: ty },
    B: { x: splitX, y: ty },
    C: { x: rx, y: by },
    D: { x: lx, y: by },
    upperY: ty,
    lowerY: by
  };
}

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

// The three branches the learner can click. The battery is drawn but is not
// one of the three named branches, matching the chapter's vocabulary.
function branchPaths() {
  const g = geo;
  const parYTop = g.ty;
  const parYBot = g.ty + (g.by - g.ty) * 0.46;
  return {
    R1: { pts: [[g.A.x, g.ty], [g.B.x, g.ty]], label: 'R1', comps: 'the series resistor R1' },
    R2: { pts: [[g.B.x, parYTop], [g.rx, parYTop], [g.rx, g.by]], label: 'R2', comps: 'the parallel resistor R2' },
    R3: { pts: [[g.B.x, parYTop], [g.B.x, parYBot], [g.rx, parYBot], [g.rx, g.by]], label: 'R3', comps: 'the parallel resistor R3' }
  };
}

function drawBranches() {
  const g = geo;
  const paths = branchPaths();

  // Battery on the left edge, between node A and node D
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  line(g.A.x, g.ty, g.A.x, g.midY - 9);
  line(g.A.x, g.midY + 9, g.A.x, g.by);
  stroke('darkorange');
  strokeWeight(4);
  line(g.A.x - 17, g.midY - 9, g.A.x + 17, g.midY - 9);
  stroke('dimgray');
  line(g.A.x - 9, g.midY + 9, g.A.x + 9, g.midY + 9);

  // Bottom rail joins D to C - this whole rail is one electrical node
  stroke(isSel('node:C') || isSel('node:D') ? 'darkorange' : 'steelblue');
  strokeWeight(isSel('node:C') || isSel('node:D') ? 5 : 3);
  line(g.D.x, g.by, g.C.x, g.by);

  // The three named branches
  for (const key of ['R1', 'R2', 'R3']) {
    const p = paths[key];
    const sel = isSel('branch:' + key);
    stroke(sel ? 'darkorange' : 'steelblue');
    strokeWeight(sel ? 5 : 3);
    noFill();
    beginShape();
    for (const pt of p.pts) vertex(pt[0], pt[1]);
    endShape();
  }

  // Resistor glyphs drawn on their branches
  drawResistorOn(paths.R1, 'R1');
  drawResistorOn(paths.R2, 'R2');
  drawResistorOn(paths.R3, 'R3');
}

// Places a zigzag at the midpoint of the branch's longest horizontal run.
function drawResistorOn(path, label) {
  const seg = longestHorizontal(path.pts);
  if (!seg) return;
  const cx = (seg[0] + seg[2]) / 2;
  const y = seg[1];
  const w = min(70, abs(seg[2] - seg[0]) * 0.6);

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
  textSize(15);
  text(label, cx, y - 16);
}

function longestHorizontal(pts) {
  let best = null, bestLen = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (abs(a[1] - b[1]) < 1) {
      const len = abs(a[0] - b[0]);
      if (len > bestLen) { bestLen = len; best = [a[0], a[1], b[0], b[1]]; }
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

function drawNodes() {
  for (const name of ['A', 'B', 'C', 'D']) {
    const p = geo[name];
    const sel = isSel('node:' + name);
    // A node's twin also pulses, so "same node" is visible at both points
    const twin = SAME_NODE[name];
    const twinSel = twin && isSel('node:' + twin);

    if (sel || twinSel) {
      const r = 20 + sin(pulsePhase) * 5;
      noStroke();
      fill(255, 165, 0, 90);
      circle(p.x, p.y, r * 2);
    }

    noStroke();
    fill(sel ? 'darkorange' : 'mediumblue');
    circle(p.x, p.y, 15);

    fill('black');
    textAlign(CENTER, BOTTOM);
    textSize(15);
    text(name, p.x, p.y - 13);
  }

  // Callout naming the shared node, shown while C or D is selected
  if (isSel('node:C') || isSel('node:D')) {
    const midX = (geo.C.x + geo.D.x) / 2;
    noStroke();
    fill('darkorange');
    textAlign(CENTER, TOP);
    textSize(15);
    text('same node!', midX, geo.by + 8);
  }
}

// ---------------------------------------------------------------------------
// Loop overlay
// ---------------------------------------------------------------------------

// Traces battery -> R1 -> R2 -> back along the bottom rail.
function drawLoopOverlay() {
  const g = geo;
  const dash = (sin(pulsePhase * 1.4) + 1) * 0.5;
  stroke(255, 140, 0, 120 + dash * 100);
  strokeWeight(9);
  noFill();
  beginShape();
  vertex(g.A.x, g.midY);
  vertex(g.A.x, g.ty);
  vertex(g.B.x, g.ty);
  vertex(g.rx, g.ty);
  vertex(g.rx, g.by);
  vertex(g.D.x, g.by);
  vertex(g.A.x, g.midY);
  endShape();
}

// ---------------------------------------------------------------------------
// Infobox
// ---------------------------------------------------------------------------

function drawInfoPanel() {
  fill(255, 255, 255, 235);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 14;

  noStroke();
  textAlign(LEFT, TOP);

  if (!selected) {
    fill('dimgray');
    textSize(defaultTextSize);
    text('Click a node, a branch, or the Loop button to explore this ' +
         "circuit's topology.", padX, ty, innerW);
    return;
  }

  let title = '', body = '';

  if (selected.indexOf('node:') === 0) {
    const n = selected.split(':')[1];
    const count = branchesAtNode(n);
    title = 'Node ' + n;
    body = 'A connection point where two or more components meet. ' +
           'This node connects ' + count + ' branches.';
    if (SAME_NODE[n]) {
      body += '  Notice that ' + n + ' and ' + SAME_NODE[n] +
              ' are drawn far apart but are the same electrical node — ' +
              'topology is about connection, not position.';
    }
  } else if (selected.indexOf('branch:') === 0) {
    const b = selected.split(':')[1];
    const paths = branchPaths();
    title = 'Circuit Branch — ' + b;
    body = 'A single path between two nodes. This branch contains: ' +
           paths[b].comps + '.';
  } else if (selected === 'loop') {
    title = 'Loop';
    body = 'A closed path that returns to its starting node without reusing ' +
           'a branch. This circuit has more than one possible loop!';
  }

  fill('black');
  textSize(18);
  text(title, padX, ty, innerW);
  ty += 28;

  fill('dimgray');
  textSize(defaultTextSize);
  text(body, padX, ty, innerW);
}

// How many branches meet at a node in this particular circuit.
function branchesAtNode(n) {
  if (n === 'A') return 2;   // battery + R1
  if (n === 'B') return 3;   // R1 + R2 + R3
  return 3;                  // C/D rail: R2 + R3 + battery
}

function drawControlLabels() {
  // Both controls are buttons, so there is nothing extra to label here.
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0 || mouseY > drawHeight) return;

  // Nodes first - they sit on top of the wires
  for (const name of ['A', 'B', 'C', 'D']) {
    const p = geo[name];
    if (dist(mouseX, mouseY, p.x, p.y) <= 15) {
      selected = 'node:' + name;
      return;
    }
  }

  // Then branches
  const paths = branchPaths();
  for (const key of ['R1', 'R2', 'R3']) {
    if (nearPolyline(paths[key].pts, mouseX, mouseY, 8)) {
      selected = 'branch:' + key;
      return;
    }
  }
}

function nearPolyline(pts, px, py, tol) {
  for (let i = 0; i < pts.length - 1; i++) {
    if (nearSegment(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], px, py, tol)) return true;
  }
  return false;
}

function nearSegment(x1, y1, x2, y2, px, py, tol) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, x1, y1) <= tol;
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = constrain(t, 0, 1);
  return dist(px, py, x1 + t * dx, y1 + t * dy) <= tol;
}

function isSel(key) {
  return selected === key;
}

function toggleLoop() {
  loopActive = !loopActive;
  loopButton.html(loopActive ? 'Hide the Loop' : 'Highlight a Loop');
  if (loopActive) selected = 'loop';
  else if (selected === 'loop') selected = null;
}

function resetView() {
  selected = null;
  loopActive = false;
  loopButton.html('Highlight a Loop');
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
