// Solder Joint Quality Classifier
// CANVAS_HEIGHT: 520
// Bloom Level: Evaluate (L5) - Verb: judge, assess
// Learning objective: Given eight rendered solder-joint examples on a perfboard
// pad, sort each into a "Good Joint" or "Cold Joint" bin by judging its shine,
// shape and coverage, and justify each judgment against a three-criteria rubric.
//
// The joints are drawn procedurally rather than photographed, so each of the
// three criteria can be varied independently. That matters pedagogically: a
// learner can meet a joint that is dull but well-shaped, or glossy but only
// half-covering the pad, instead of only ever seeing all-good or all-bad
// examples where any single cue would give the answer away.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 470;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 18;
let defaultTextSize = 16;

// ---- Controls ----
let checkButton;
let newSetButton;

// ---- State ----
let joints = [];
let dragging = null;
let dragDX = 0, dragDY = 0;
let hoverJoint = -1;
let lastFeedback = null;   // { ok, msg }
let tally = null;          // { correct, total } once Check All has run

const BINS = [
  { key: 'good', label: 'Good Joint', tint: 'honeydew',   edge: 'seagreen' },
  { key: 'cold', label: 'Cold Joint', tint: 'mistyrose',  edge: 'indianred' }
];

// A joint is good only when all three criteria pass. Any single failure makes
// it a cold joint, which is exactly the judgment the rubric asks for.
function makeJoint(i, shine, shape, coverage) {
  const good = (shine === 'glossy' && shape === 'cone' && coverage === 'full');
  return {
    id: i, shine: shine, shape: shape, coverage: coverage, good: good,
    placed: null, x: 0, y: 0, w: 74, h: 74, correct: null
  };
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

  checkButton = createButton('Check All');
  checkButton.position(10, drawHeight + 10);
  checkButton.mousePressed(checkAll);

  newSetButton = createButton('New Set');
  newSetButton.position(95, drawHeight + 10);
  newSetButton.mousePressed(newSet);

  newSet();

  describe('Eight rendered solder joints on perfboard pads, each varying in ' +
           'shine, shape and coverage, are sorted into a Good Joint bin or a ' +
           'Cold Joint bin. Each sort gives immediate feedback naming the ' +
           'visual cue that decided it, and a Check All button tallies the ' +
           'final score against a three-criteria rubric.', LABEL);
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
  text('Good Joint or Cold Joint?', canvasWidth / 2, 6);

  layoutTray();
  drawRubric();
  drawBins();
  drawJoints();
  drawFeedback();
  if (hoverJoint >= 0 && dragging === null) drawHoverCallout();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const TRAY_TOP = 32;
let trayBottom = 120;

function layoutTray() {
  const gap = 6;
  const jw = 74, jh = 74;
  const perRow = max(2, floor((canvasWidth - 2 * margin + gap) / (jw + gap)));
  let n = 0;

  for (const j of joints) {
    j.w = jw; j.h = jh;
    if (j.placed || (dragging !== null && joints[dragging] === j)) continue;
    const col = n % perRow;
    const row = floor(n / perRow);
    j.x = margin + col * (jw + gap);
    j.y = TRAY_TOP + row * (jh + gap);
    n++;
  }
  const rows = max(1, ceil(n / perRow));
  trayBottom = TRAY_TOP + rows * (jh + gap);
}

function rubricRect() {
  return { x: margin, y: trayBottom + 6, w: canvasWidth - 2 * margin, h: 52 };
}

function binRects() {
  const r = rubricRect();
  const top = r.y + r.h + 8;
  const avail = drawHeight - top - 40;
  const gap = 12;
  const w = (canvasWidth - 2 * margin - gap) / 2;
  return [
    { x: margin, y: top, w: w, h: avail },
    { x: margin + w + gap, y: top, w: w, h: avail }
  ];
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function drawRubric() {
  const r = rubricRect();
  fill('lightyellow');
  stroke('goldenrod');
  strokeWeight(1);
  rect(r.x, r.y, r.w, r.h, 8);

  noStroke();
  fill('darkgoldenrod');
  textAlign(LEFT, TOP);
  textSize(13);
  text('A good joint passes all three:', r.x + 10, r.y + 7);
  fill('black');
  text('shine — glossy, not dull     shape — a smooth cone, not a lumpy blob     ' +
       'coverage — the pad fully coated, not partly bare',
       r.x + 10, r.y + 25, r.w - 20);
}

function drawBins() {
  const rects = binRects();
  for (let i = 0; i < BINS.length; i++) {
    const b = BINS[i], r = rects[i];
    fill(b.tint);
    stroke(b.edge);
    strokeWeight(2);
    rect(r.x, r.y, r.w, r.h, 10);

    noStroke();
    fill('black');
    textAlign(CENTER, TOP);
    textSize(15);
    text(b.label, r.x, r.y + 8, r.w);
  }
}

function drawJoints() {
  const rects = binRects();
  const counts = { good: 0, cold: 0 };

  // Sorted joints, tiled inside their bin
  for (const j of joints) {
    if (!j.placed) continue;
    const bi = BINS.findIndex(b => b.key === j.placed);
    const r = rects[bi];
    const perRow = max(1, floor((r.w - 12) / 60));
    const slot = counts[j.placed]++;
    j.x = r.x + 8 + (slot % perRow) * 60;
    j.y = r.y + 30 + floor(slot / perRow) * 58;
    drawJoint(j, 54);
  }

  // Unsorted joints in the tray
  for (const j of joints) {
    if (j.placed) continue;
    if (dragging !== null && joints[dragging] === j) continue;
    drawJoint(j, j.w);
  }

  if (dragging !== null) drawJoint(joints[dragging], joints[dragging].w, true);
}

// One joint: a copper pad, a wire lead, and the solder fillet whose shine,
// shape and coverage are all driven by the joint's parameters.
function drawJoint(j, size, held) {
  const cx = j.x + size / 2;
  const cy = j.y + size / 2;
  const s = size / 74;   // scale factor relative to the tray size

  push();

  // Card behind the joint
  if (held) {
    noStroke();
    fill(0, 0, 0, 30);
    rect(j.x + 3, j.y + 4, size, size, 8);
  }
  fill('white');
  if (j.correct === true)       { stroke('seagreen');  strokeWeight(3); }
  else if (j.correct === false) { stroke('crimson');   strokeWeight(3); }
  else if (held)                { stroke('#E8710A');   strokeWeight(3); }
  else                          { stroke('silver');    strokeWeight(1); }
  rect(j.x, j.y, size, size, 8);

  // Perfboard pad. Kept deliberately small so the solder, not the pad,
  // dominates the card - the three cues all live in the solder.
  const padY = cy + 14 * s;
  noStroke();
  fill('peru');
  circle(cx, padY, 40 * s);
  fill('sienna');
  circle(cx, padY, 31 * s);

  // Wire lead coming down into the pad
  stroke('silver');
  strokeWeight(5 * s);
  line(cx, j.y + 8 * s, cx, padY);

  // The solder fillet. Glossy joints are a bright, cool silver; dull joints a
  // flat, warm gray - a contrast that survives being shrunk to bin size.
  const body = j.shine === 'glossy' ? '#C8CFD6' : '#8C8880';
  const edge = j.shine === 'glossy' ? '#8E9AA6' : '#6E6A63';

  stroke(edge);
  strokeWeight(1.5 * s);
  fill(body);

  if (j.shape === 'cone') {
    // A clean fillet: a smooth cone that wets outward onto the pad
    const w = j.coverage === 'full' ? 40 * s : 23 * s;
    beginShape();
    vertex(cx - w / 2, padY + 3 * s);
    bezierVertex(cx - w / 2.6, padY - 9 * s, cx - 4 * s, cy - 12 * s, cx, cy - 15 * s);
    bezierVertex(cx + 4 * s, cy - 12 * s, cx + w / 2.6, padY - 9 * s, cx + w / 2, padY + 3 * s);
    endShape(CLOSE);
  } else {
    // A blob: a bulging ball sitting on the pad instead of wetting it
    const w = j.coverage === 'full' ? 38 * s : 26 * s;
    ellipse(cx, cy - 1 * s, w, w * 1.05);
    ellipse(cx - w * 0.22, cy - 8 * s, w * 0.6, w * 0.55);
    ellipse(cx + w * 0.24, cy + 2 * s, w * 0.5, w * 0.45);
  }

  // Specular highlight - the shine cue, present only on glossy joints
  if (j.shine === 'glossy') {
    noStroke();
    fill(255, 255, 255, 225);
    ellipse(cx - 6 * s, cy - 6 * s, 11 * s, 6 * s);
    fill(255, 255, 255, 120);
    ellipse(cx + 5 * s, cy + 2 * s, 6 * s, 3 * s);
  }

  // Partial coverage leaves a visibly bare crescent of copper
  if (j.coverage === 'partial') {
    noFill();
    stroke('darkorange');
    strokeWeight(2.5 * s);
    arc(cx, padY, 36 * s, 36 * s, -0.35, PI * 0.75);
  }

  pop();
}

function drawFeedback() {
  const y = drawHeight - 30;
  noStroke();
  textAlign(LEFT, TOP);
  textSize(13);

  if (tally) {
    fill(tally.correct === tally.total ? 'darkgreen' : 'crimson');
    text('Score: ' + tally.correct + ' / ' + tally.total +
         (tally.correct === tally.total
           ? ' — every joint judged correctly.'
           : ' — red cards show the ones to look at again.'),
         margin, y, canvasWidth - 2 * margin);
    return;
  }

  if (lastFeedback) {
    fill(lastFeedback.ok ? 'darkgreen' : 'crimson');
    text(lastFeedback.msg, margin, y, canvasWidth - 2 * margin);
    return;
  }

  fill('dimgray');
  text('Drag each joint into a bin. Hover a joint first to read its shine, ' +
       'shape and coverage.', margin, y, canvasWidth - 2 * margin);
}

// A neutral description - it names the three cues without giving the verdict.
function drawHoverCallout() {
  const j = joints[hoverJoint];
  const msg = 'shine: ' + j.shine + '   shape: ' +
              (j.shape === 'cone' ? 'smooth cone' : 'lumpy blob') +
              '   coverage: ' + (j.coverage === 'full' ? 'pad fully coated' : 'pad partly bare');

  textSize(13);
  const w = min(300, textWidth(msg) + 20);
  let x = mouseX + 14;
  let y = mouseY - 36;
  if (x + w > canvasWidth) x = canvasWidth - w - 4;
  if (y < 2) y = mouseY + 18;

  fill(255, 255, 255, 245);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, 30, 6);

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  text(msg, x + 10, y + 8, w - 20);
}

function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  const sorted = joints.filter(j => j.placed).length;
  text('Sorted: ' + sorted + ' / ' + joints.length, 175, drawHeight + 25);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mouseMoved() {
  hoverJoint = jointAt(mouseX, mouseY);
}

function mousePressed() {
  const i = jointAt(mouseX, mouseY);
  if (i >= 0) {
    dragging = i;
    dragDX = mouseX - joints[i].x;
    dragDY = mouseY - joints[i].y;
  }
}

function mouseDragged() {
  if (dragging === null) return;
  joints[dragging].x = mouseX - dragDX;
  joints[dragging].y = mouseY - dragDY;
}

function mouseReleased() {
  if (dragging === null) return;
  const j = joints[dragging];
  const rects = binRects();

  const cx = j.x + j.w / 2;
  const cy = j.y + j.h / 2;
  let dropped = -1;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) { dropped = i; break; }
  }

  if (dropped >= 0) {
    const binKey = BINS[dropped].key;
    j.placed = binKey;
    const wantedGood = binKey === 'good';
    const ok = wantedGood === j.good;
    j.correct = ok;
    lastFeedback = { ok: ok, msg: explain(j, ok) };
    tally = null;
  }

  dragging = null;
}

// Feedback always names the specific cue that decided the joint, so the
// learner leaves with a reusable rule rather than a right/wrong mark.
function explain(j, ok) {
  const fails = [];
  if (j.shine !== 'glossy') fails.push('the surface is dull, not glossy');
  if (j.shape !== 'cone') fails.push('the solder sits as a lumpy blob instead of a smooth cone');
  if (j.coverage !== 'full') fails.push('part of the pad is still bare');

  if (j.good) {
    return ok
      ? 'Correct — glossy, a smooth cone, and the pad fully coated. All three criteria pass.'
      : 'Not quite — this one passes all three criteria: glossy, smooth cone, pad fully coated.';
  }
  const why = fails.join('; ');
  return ok
    ? 'Correct — cold joint: ' + why + '.'
    : 'Look again — ' + why + '. Any single failure makes it a cold joint.';
}

function jointAt(px, py) {
  for (let i = joints.length - 1; i >= 0; i--) {
    const j = joints[i];
    const size = j.placed ? 54 : j.w;
    if (px >= j.x && px <= j.x + size && py >= j.y && py <= j.y + size) return i;
  }
  return -1;
}

function checkAll() {
  if (joints.some(j => !j.placed)) return;   // disabled until all eight are sorted
  const correct = joints.filter(j => j.correct).length;
  tally = { correct: correct, total: joints.length };
  lastFeedback = null;
}

// A fresh set: always four good joints, and four cold ones that each fail a
// different combination of criteria so no single cue is a giveaway.
function newSet() {
  const coldVariants = [
    ['dull', 'cone', 'full'],       // fails shine only
    ['glossy', 'blob', 'full'],     // fails shape only
    ['glossy', 'cone', 'partial'],  // fails coverage only
    ['dull', 'blob', 'partial']     // fails all three
  ];

  const list = [];
  for (let i = 0; i < 4; i++) list.push(makeJoint(i, 'glossy', 'cone', 'full'));
  for (let i = 0; i < coldVariants.length; i++) {
    const v = coldVariants[i];
    list.push(makeJoint(4 + i, v[0], v[1], v[2]));
  }

  // Fisher-Yates so the good ones are not always first
  for (let i = list.length - 1; i > 0; i--) {
    const k = floor(random(i + 1));
    const t = list[i]; list[i] = list[k]; list[k] = t;
  }

  joints = list;
  dragging = null;
  lastFeedback = null;
  tally = null;
  hoverJoint = -1;
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
