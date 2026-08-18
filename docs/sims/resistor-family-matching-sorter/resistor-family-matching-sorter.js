// Resistor Family Matching Sorter
// CANVAS_HEIGHT: 500
// Bloom Level: Understand (L2) - Verb: classify, identify
// Learning objective: Given five resistor-type cards and five shuffled
// behavior-description cards, match each resistor type to the one description
// that correctly explains how and why its resistance changes.
//
// A wrong attempt deliberately explains something true about the type that was
// clicked WITHOUT naming its correct partner, so the learner is nudged back to
// the table rather than handed the answer.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 14;
let defaultTextSize = 16;

// ---- Controls ----
let checkButton;
let shuffleButton;

// ---- State ----
let typeOrder = [];        // display order of the type cards
let behaviorOrder = [];    // display order of the behavior cards
let pickedType = null;     // id of the type card awaiting a partner
let matches = {};          // typeId -> behaviorId, once locked in
let wrongFlash = null;     // { typeId, behaviorId, until }
let message = null;
let revealed = false;
let attempts = 0;

const TYPES = [
  { id: 0, name: 'Fixed Resistor',
    behavior: 'Its resistance is set when it is made and never changes.',
    hint: 'A fixed resistor has no moving part and no sensing element at all.' },
  { id: 1, name: 'Potentiometer',
    behavior: 'A knob slides a wiper along a track, so you can vary the resistance by hand while the circuit runs.',
    hint: 'A potentiometer is built to be adjusted often, by hand, during normal use.' },
  { id: 2, name: 'Trimmer Resistor',
    behavior: 'A tiny screw-adjusted version, set once during calibration and then left alone.',
    hint: 'A trimmer is adjustable, but it is meant to be set once and then forgotten.' },
  { id: 3, name: 'Photoresistor (LDR)',
    behavior: 'Its resistance falls as the light shining on it gets brighter.',
    hint: 'A photoresistor senses something in its environment rather than being adjusted by you.' },
  { id: 4, name: 'Thermistor',
    behavior: 'Its resistance changes as its own temperature changes.',
    hint: 'A thermistor senses something in its environment rather than being adjusted by you.' }
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

  checkButton = createButton('Check All');
  checkButton.position(10, drawHeight + 10);
  checkButton.mousePressed(checkAll);

  shuffleButton = createButton('Shuffle Again');
  shuffleButton.position(95, drawHeight + 10);
  shuffleButton.mousePressed(shuffleCards);

  shuffleCards();

  describe('Five resistor-type cards and five shuffled behavior descriptions. ' +
           'Clicking a type card and then a behavior card proposes a match; ' +
           'correct pairs lock in green with a connecting line, incorrect ones ' +
           'flash red and explain something true about that resistor type ' +
           'without revealing its partner.', LABEL);
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
  text('Match the Resistor to its Behavior', canvasWidth / 2, 6);

  drawConnectors();
  drawTypeCards();
  drawBehaviorCards();
  drawMessage();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout - two columns when there is room, otherwise two stacked rows
// ---------------------------------------------------------------------------

function isTwoColumn() {
  return canvasWidth >= 620;
}

function typeRect(i) {
  const top = 32;
  if (isTwoColumn()) {
    const w = (canvasWidth - 3 * margin) * 0.36;
    const h = 52;
    return { x: margin, y: top + i * (h + 8), w: w, h: h };
  }
  const w = (canvasWidth - 2 * margin - 4 * 4) / 5;
  return { x: margin + i * (w + 4), y: top, w: w, h: 56 };
}

function behaviorRect(i) {
  const top = 32;
  if (isTwoColumn()) {
    const typeW = (canvasWidth - 3 * margin) * 0.36;
    const w = canvasWidth - typeW - 3 * margin;
    const h = 52;
    return { x: margin * 2 + typeW, y: top + i * (h + 8), w: w, h: h };
  }
  const w = canvasWidth - 2 * margin;
  const h = (drawHeight - top - 56 - 8 - 46 - 20) / 5;
  return { x: margin, y: top + 56 + 12 + i * (h + 4), w: w, h: h };
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function drawTypeCards() {
  for (let slot = 0; slot < typeOrder.length; slot++) {
    const id = typeOrder[slot];
    const r = typeRect(slot);
    const locked = matches[id] !== undefined;
    const picked = pickedType === id;
    const flashing = wrongFlash && wrongFlash.typeId === id && millis() < wrongFlash.until;

    fill(locked ? 'honeydew' : (picked ? 'lightyellow' : 'white'));
    stroke(flashing ? 'crimson' : (locked ? 'seagreen' : (picked ? '#E8710A' : 'silver')));
    strokeWeight(locked || picked || flashing ? 3 : 1);
    rect(r.x, r.y, r.w, r.h, 8);

    drawTypeIcon(id, r.x + 20, r.y + r.h / 2);

    noStroke();
    fill('black');
    textAlign(LEFT, CENTER);
    textSize(isTwoColumn() ? 14 : 11);
    text(TYPES[id].name, r.x + 38, r.y + r.h / 2, r.w - 44);
  }
}

function drawBehaviorCards() {
  for (let slot = 0; slot < behaviorOrder.length; slot++) {
    const id = behaviorOrder[slot];
    const r = behaviorRect(slot);
    const locked = isBehaviorLocked(id);
    const flashing = wrongFlash && wrongFlash.behaviorId === id && millis() < wrongFlash.until;

    fill(locked ? 'honeydew' : 'white');
    stroke(flashing ? 'crimson' : (locked ? 'seagreen' : 'silver'));
    strokeWeight(locked || flashing ? 3 : 1);
    rect(r.x, r.y, r.w, r.h, 8);

    noStroke();
    fill('black');
    textAlign(LEFT, CENTER);
    textSize(isTwoColumn() ? 13 : 12);
    text(TYPES[id].behavior, r.x + 10, r.y + r.h / 2, r.w - 20);
  }
}

// Lines joining each locked pair.
function drawConnectors() {
  for (const key in matches) {
    const typeId = int(key);
    const behaviorId = matches[key];
    const ti = typeOrder.indexOf(typeId);
    const bi = behaviorOrder.indexOf(behaviorId);
    if (ti < 0 || bi < 0) continue;

    const a = typeRect(ti);
    const b = behaviorRect(bi);

    stroke('seagreen');
    strokeWeight(2);
    noFill();
    if (isTwoColumn()) {
      line(a.x + a.w, a.y + a.h / 2, b.x, b.y + b.h / 2);
    } else {
      line(a.x + a.w / 2, a.y + a.h, b.x + 8, b.y + b.h / 2);
    }
  }
}

function drawTypeIcon(id, cx, cy) {
  push();
  translate(cx, cy);
  strokeWeight(2);

  if (id === 0) {
    // Fixed: a plain banded body
    noStroke(); fill('wheat'); rect(-12, -6, 24, 12, 2);
    fill('saddlebrown'); rect(-7, -6, 3, 12);
    fill('firebrick'); rect(-1, -6, 3, 12);
  } else if (id === 1) {
    // Potentiometer: body with a knob and an arrow
    noStroke(); fill('wheat'); rect(-12, -4, 24, 10, 2);
    stroke('dimgray'); noFill(); line(0, -4, 0, -12);
    fill('darkslategray'); noStroke(); circle(0, -13, 9);
  } else if (id === 2) {
    // Trimmer: body with a screw slot
    noStroke(); fill('lightsteelblue'); rect(-11, -8, 22, 16, 2);
    stroke('dimgray'); line(-4, 0, 4, 0);
    noFill(); circle(0, 0, 11);
  } else if (id === 3) {
    // LDR: squiggle face plus light rays
    noStroke(); fill('lightgoldenrodyellow'); circle(0, 0, 17);
    stroke('saddlebrown'); noFill();
    beginShape(); vertex(-6, -3); vertex(-2, 3); vertex(2, -3); vertex(6, 3); endShape();
    stroke('goldenrod');
    line(-11, -11, -8, -8); line(11, -11, 8, -8);
  } else {
    // Thermistor: a little thermometer
    noStroke(); fill('gainsboro'); rect(-3, -11, 6, 15, 3);
    fill('crimson'); circle(0, 6, 10); rect(-2, -4, 4, 10);
  }
  pop();
}

function drawMessage() {
  const y = drawHeight - 40;
  const x = margin, w = canvasWidth - 2 * margin;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, 34, 6);

  noStroke();
  textAlign(LEFT, CENTER);
  textSize(13);

  if (message) {
    fill(message.ok ? 'darkgreen' : 'crimson');
    text(message.text, x + 10, y + 17, w - 20);
  } else {
    fill('dimgray');
    text('Click a resistor type, then click its matching behavior.', x + 10, y + 17, w - 20);
  }
}

function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  text('Matched: ' + Object.keys(matches).length + ' / 5', 205, drawHeight + 25);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0 || mouseY > drawHeight) return;

  // A type card
  for (let slot = 0; slot < typeOrder.length; slot++) {
    const id = typeOrder[slot];
    if (matches[id] !== undefined) continue;   // already locked
    if (inRect(typeRect(slot), mouseX, mouseY)) {
      pickedType = (pickedType === id) ? null : id;
      message = null;
      return;
    }
  }

  // A behavior card, only meaningful once a type is picked
  if (pickedType === null) return;
  for (let slot = 0; slot < behaviorOrder.length; slot++) {
    const id = behaviorOrder[slot];
    if (isBehaviorLocked(id)) continue;
    if (inRect(behaviorRect(slot), mouseX, mouseY)) {
      attemptMatch(pickedType, id);
      return;
    }
  }
}

// Each behavior belongs to exactly one type, so the ids line up directly.
function attemptMatch(typeId, behaviorId) {
  attempts++;
  if (typeId === behaviorId) {
    matches[typeId] = behaviorId;
    pickedType = null;
    message = { ok: true, text: TYPES[typeId].name + ' — correct. ' + TYPES[typeId].behavior };
  } else {
    wrongFlash = { typeId: typeId, behaviorId: behaviorId, until: millis() + 600 };
    pickedType = null;
    // Says something true about the picked type without naming its partner.
    message = { ok: false, text: 'Not that one. ' + TYPES[typeId].hint };
  }
}

function isBehaviorLocked(behaviorId) {
  if (revealed) return true;
  for (const k in matches) if (matches[k] === behaviorId) return true;
  return false;
}

// Fills in whatever is left, but only after the learner has actually tried.
function checkAll() {
  if (attempts === 0) {
    message = { ok: false, text: 'Try matching at least one pair first.' };
    return;
  }
  for (const t of TYPES) matches[t.id] = t.id;
  revealed = true;
  pickedType = null;
  message = { ok: true, text: 'All five pairs shown. The defining question is always: ' +
                              'does the resistance change, and what changes it?' };
}

function shuffleCards() {
  typeOrder = shuffled(TYPES.map(t => t.id));
  behaviorOrder = shuffled(TYPES.map(t => t.id));
  matches = {};
  pickedType = null;
  wrongFlash = null;
  message = null;
  revealed = false;
  attempts = 0;
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function inRect(r, px, py) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
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
