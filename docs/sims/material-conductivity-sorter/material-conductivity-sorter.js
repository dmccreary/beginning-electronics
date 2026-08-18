// Material Conductivity Sorter
// CANVAS_HEIGHT: 500
// Bloom Level: Understand (L2) - Verb: classify
// Learning objective: Classify everyday materials as a conductor, insulator or
// semiconductor material, by dragging each material card into the correct one
// of three labeled bins and receiving immediate right/wrong feedback.
//
// Sorting concrete, familiar objects builds the category boundary faster than
// reading definitions, so every card is something a learner has held.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let defaultTextSize = 16;

// ---- Controls ----
let resetButton;
let revealButton;

// ---- State ----
let cards = [];
let dragging = null;      // index of the card currently held
let dragDX = 0, dragDY = 0;
let score = 0;
let attempts = 0;
let hoverCard = -1;
let flash = { bin: null, ok: false, until: 0 };
let shakePhase = 0;

const BINS = [
  { key: 'conductor',     label: 'Conductor',              tint: 'honeydew',  edge: 'seagreen' },
  { key: 'insulator',     label: 'Insulator',              tint: 'whitesmoke', edge: 'slategray' },
  { key: 'semiconductor', label: 'Semiconductor Material', tint: 'papayawhip', edge: 'darkorange' }
];

const MATERIALS = [
  { name: 'Copper wire',     bin: 'conductor',     why: 'Metals let electrons move freely — copper is the standard wire metal.' },
  { name: 'Aluminum foil',   bin: 'conductor',     why: 'Another metal, so charge moves through it easily.' },
  { name: 'Rubber',          bin: 'insulator',     why: 'Electrons are locked in place, which is why wire insulation is rubber.' },
  { name: 'Glass',           bin: 'insulator',     why: 'A very good insulator — it blocks current almost completely.' },
  { name: 'Plastic',         bin: 'insulator',     why: 'Cheap and non-conducting, so it covers most jumper wires.' },
  { name: 'Wood',            bin: 'insulator',     why: 'Dry wood does not conduct; its electrons are tightly bound.' },
  { name: 'Silicon chip',    bin: 'semiconductor', why: 'Conducts only under the right conditions — that is what makes switching possible.' },
  { name: 'Pencil graphite', bin: 'conductor',     why: 'Graphite is a form of carbon that conducts, which is why pencil lines carry current.' },
  { name: 'Salt water',      bin: 'conductor',     why: 'Dissolved salt lets charge move through the water.' },
  { name: 'Steel paperclip', bin: 'conductor',     why: 'Steel is a metal, so it conducts.' }
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

  resetButton = createButton('Reset');
  resetButton.position(10, drawHeight + 10);
  resetButton.mousePressed(resetBoard);

  revealButton = createButton('Reveal All');
  revealButton.position(80, drawHeight + 10);
  revealButton.mousePressed(revealAll);

  buildCards();

  describe('Ten material cards — copper wire, aluminum foil, rubber, glass, ' +
           'plastic, wood, a silicon chip, pencil graphite, salt water and a ' +
           'steel paperclip — are dragged into one of three bins labeled ' +
           'Conductor, Insulator and Semiconductor Material. Each drop gives ' +
           'immediate right or wrong feedback and updates a score out of ten.', LABEL);
}

function buildCards() {
  cards = [];
  for (let i = 0; i < MATERIALS.length; i++) {
    cards.push({
      idx: i,
      placed: null,     // bin key once correctly sorted
      x: 0, y: 0,       // current position, assigned by layoutTray()
      w: 118, h: 46
    });
  }
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
  textSize(22);
  text('Sort the Materials', canvasWidth / 2, 8);

  shakePhase += 0.5;

  layoutTray();
  drawBins();
  drawCards();
  drawScore();
  if (hoverCard >= 0 && dragging === null) drawHint();

  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const TRAY_TOP = 40;

// Unsorted cards sit in a wrapping tray at the top. Sorted cards are stacked
// inside their bin.
function layoutTray() {
  const gap = 8;
  const cw = 118, ch = 46;
  const perRow = max(2, floor((canvasWidth - 2 * margin + gap) / (cw + gap)));
  let n = 0;

  for (const c of cards) {
    c.w = cw; c.h = ch;
    if (c.placed || (dragging !== null && cards[dragging] === c)) continue;
    const col = n % perRow;
    const row = floor(n / perRow);
    c.x = margin + col * (cw + gap);
    c.y = TRAY_TOP + row * (ch + gap);
    n++;
  }
  // How tall the tray grew, so bins can start below it
  const rows = max(1, ceil(n / perRow));
  trayBottom = TRAY_TOP + rows * (ch + gap);
}

let trayBottom = 120;

function binRects() {
  const stackedBins = canvasWidth < 620;
  const top = trayBottom + 12;
  const avail = drawHeight - top - 36;
  const out = [];

  if (stackedBins) {
    const h = (avail - 2 * 8) / 3;
    for (let i = 0; i < 3; i++) {
      out.push({ x: margin, y: top + i * (h + 8), w: canvasWidth - 2 * margin, h: h });
    }
  } else {
    const gap = 10;
    const w = (canvasWidth - 2 * margin - 2 * gap) / 3;
    for (let i = 0; i < 3; i++) {
      out.push({ x: margin + i * (w + gap), y: top, w: w, h: avail });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function drawBins() {
  const rects = binRects();
  for (let i = 0; i < BINS.length; i++) {
    const b = BINS[i];
    const r = rects[i];

    let dx = 0;
    let edge = b.edge;
    let weight = 2;
    // Feedback flash: green for a correct drop, red plus a shake for a wrong one
    if (flash.bin === b.key && millis() < flash.until) {
      edge = flash.ok ? 'green' : 'crimson';
      weight = 4;
      if (!flash.ok) dx = sin(shakePhase) * 4;
    }

    fill(b.tint);
    stroke(edge);
    strokeWeight(weight);
    rect(r.x + dx, r.y, r.w, r.h, 10);

    noStroke();
    fill('black');
    textAlign(CENTER, TOP);
    textSize(15);
    text(b.label, r.x + dx + 4, r.y + 8, r.w - 8);
  }
}

function drawCards() {
  const rects = binRects();

  // Sorted cards, stacked inside their bin
  const counts = { conductor: 0, insulator: 0, semiconductor: 0 };
  for (const c of cards) {
    if (!c.placed) continue;
    const bi = BINS.findIndex(b => b.key === c.placed);
    const r = rects[bi];
    const slot = counts[c.placed]++;
    const cw = min(c.w, r.w - 16);
    c.x = r.x + (r.w - cw) / 2;
    c.y = r.y + 32 + slot * (c.h - 12);
    drawCard(c, cw, true);
  }

  // Unsorted cards in the tray
  for (const c of cards) {
    if (c.placed) continue;
    if (dragging !== null && cards[dragging] === c) continue;
    drawCard(c, c.w, false);
  }

  // The held card draws last so it floats above everything
  if (dragging !== null) drawCard(cards[dragging], cards[dragging].w, false, true);
}

function drawCard(c, w, sorted, held) {
  const m = MATERIALS[c.idx];

  push();
  if (held) {
    // A soft shadow makes it obvious which card is in hand
    noStroke();
    fill(0, 0, 0, 30);
    rect(c.x + 3, c.y + 4, w, c.h, 8);
  }
  fill(sorted ? 'white' : 'lavenderblush');
  stroke(held ? 'darkorange' : 'gray');
  strokeWeight(held ? 3 : 1);
  rect(c.x, c.y, w, c.h, 8);

  drawMaterialIcon(m.bin, m.name, c.x + 20, c.y + c.h / 2);

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(14);
  text(m.name, c.x + 36, c.y + c.h / 2, w - 42);
  pop();
}

// A small glyph per material so cards are recognizable at a glance.
function drawMaterialIcon(binKey, name, cx, cy) {
  push();
  translate(cx, cy);
  strokeWeight(2);

  if (name === 'Copper wire')          { stroke('peru');       noFill(); line(-9, 4, 9, -4); }
  else if (name === 'Aluminum foil')   { stroke('silver');     fill('gainsboro'); rect(-8, -7, 16, 14, 2); }
  else if (name === 'Rubber')          { stroke('dimgray');    fill('darkslategray'); ellipse(0, 0, 17, 12); }
  else if (name === 'Glass')           { stroke('lightblue');  fill(230, 245, 255, 180); rect(-7, -8, 14, 16, 2); }
  else if (name === 'Plastic')         { stroke('steelblue');  fill('lightskyblue'); rect(-8, -6, 16, 12, 4); }
  else if (name === 'Wood')            { stroke('saddlebrown'); fill('burlywood'); rect(-8, -7, 16, 14, 2); }
  else if (name === 'Silicon chip')    { stroke('dimgray');    fill('darkslategray'); rect(-7, -6, 14, 12, 1); }
  else if (name === 'Pencil graphite') { stroke('goldenrod');  fill('khaki'); triangle(-7, 7, 0, -8, 7, 7); }
  else if (name === 'Salt water')      { stroke('steelblue');  fill('lightcyan'); arc(0, 0, 18, 16, 0, PI); }
  else                                 { stroke('slategray');  noFill(); arc(0, 0, 16, 16, PI * 0.2, PI * 1.6); }
  pop();
}

function drawScore() {
  noStroke();
  fill('black');
  textAlign(RIGHT, TOP);
  textSize(defaultTextSize);
  text('Correct: ' + score + ' / ' + MATERIALS.length, canvasWidth - margin, 14);
}

// Hint tooltip, available before sorting so the activity stays encouraging.
function drawHint() {
  const m = MATERIALS[cards[hoverCard].idx];
  const msg = m.why;
  textSize(14);
  const w = min(300, canvasWidth - 20);
  let x = mouseX + 14;
  let y = mouseY - 52;
  if (x + w > canvasWidth) x = canvasWidth - w - 4;
  if (y < 2) y = mouseY + 18;

  fill(255, 255, 255, 245);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, 46, 6);

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  text(msg, x + 10, y + 7, w - 20);
}

function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(14);
  text('Drag a card into a bin. Hover a card for a hint.', 175, drawHeight + 25);
}

// ---------------------------------------------------------------------------
// Interaction - drag and drop
// ---------------------------------------------------------------------------

function mouseMoved() {
  hoverCard = cardAt(mouseX, mouseY);
}

function mousePressed() {
  const i = cardAt(mouseX, mouseY);
  // Sorted cards stay put; only unsorted ones can be picked up
  if (i >= 0 && !cards[i].placed) {
    dragging = i;
    dragDX = mouseX - cards[i].x;
    dragDY = mouseY - cards[i].y;
  }
}

function mouseDragged() {
  if (dragging === null) return;
  cards[dragging].x = mouseX - dragDX;
  cards[dragging].y = mouseY - dragDY;
}

function mouseReleased() {
  if (dragging === null) return;
  const c = cards[dragging];
  const m = MATERIALS[c.idx];
  const rects = binRects();

  // Which bin was the card dropped on?
  let dropped = -1;
  const cx = c.x + c.w / 2;
  const cy = c.y + c.h / 2;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) { dropped = i; break; }
  }

  if (dropped >= 0) {
    attempts++;
    const binKey = BINS[dropped].key;
    const correct = binKey === m.bin;
    flash = { bin: binKey, ok: correct, until: millis() + 700 };
    if (correct) {
      c.placed = binKey;
      score++;
    }
    // A wrong card simply returns to the tray on the next layout pass
  }

  dragging = null;
}

function resetBoard() {
  score = 0;
  attempts = 0;
  flash = { bin: null, ok: false, until: 0 };
  buildCards();
}

// Fills in every card correctly, for review after at least one attempt.
function revealAll() {
  if (attempts === 0) return;
  for (const c of cards) c.placed = MATERIALS[c.idx].bin;
  score = MATERIALS.length;
}

function cardAt(px, py) {
  // Search backwards so the topmost card wins
  for (let i = cards.length - 1; i >= 0; i--) {
    const c = cards[i];
    const w = c.placed ? min(c.w, 200) : c.w;
    if (px >= c.x && px <= c.x + w && py >= c.y && py <= c.y + c.h) return i;
  }
  return -1;
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
