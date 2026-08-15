// Diode Test Mode Explorer
// CANVAS_HEIGHT: 540
// Bloom Level: Understand (L2) / Apply (L3) - Verb: interpret, demonstrate, classify
// Learning objective: Given a multimeter set to diode-test mode and four
// out-of-circuit diode/LED samples, probe each in both directions and
// interpret the reading — a forward voltage, an overload indicator, or a low
// voltage both ways — to classify the part as good, shorted or open.
//
// What diode-test mode actually does: it pushes a small known current through
// the part and reports the voltage that develops. So the readings mean:
//
//   forward voltage one way, OL the other  -> good; it conducts one way only
//   near zero volts BOTH ways              -> shorted; it conducts both ways
//   OL BOTH ways                           -> open; it conducts neither way
//
// The classification only makes sense after BOTH directions are known, which
// is why the classify buttons stay locked until the learner has reversed the
// probes and taken the second reading.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 460;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let reverseButton, newSetButton;
let classifyButtons = [];

// ---- State ----
let samples = [];            // shuffled each round
let selected = -1;
let forward = true;
let seen = {};               // sampleIndex -> {fwd: bool, rev: bool}
let verdict = null;          // { ok, text }
let glowPhase = 0;
let mouseOverCanvas = false;
let cardBoxes = [];
let panel = {};

// The four kinds. Reading values are what a real meter shows in diode mode.
const KINDS = {
  good:   { name: 'Good Diode',  fwd: '0.62 V', rev: 'OL', answer: 'Good',
            why: 'It conducts one way and blocks the other — that is exactly what a diode should do.' },
  led:    { name: 'Good Red LED', fwd: '1.87 V', rev: 'OL', answer: 'Good',
            why: 'An LED is a diode too. Its forward reading is higher than a plain diode, and it glows faintly while the meter probes it.' },
  short:  { name: 'Shorted',     fwd: '0.04 V', rev: '0.04 V', answer: 'Shorted',
            why: 'Near zero volts in BOTH directions means current passes freely either way — the junction has failed closed.' },
  open:   { name: 'Open',        fwd: 'OL',     rev: 'OL', answer: 'Open',
            why: 'OL in BOTH directions means nothing gets through either way — the junction has failed open, or a lead is broken.' }
};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  reverseButton = createButton('Reverse Probes');
  reverseButton.position(10, drawHeight + 10);
  reverseButton.mousePressed(() => { forward = !forward; noteSeen(); });

  newSetButton = createButton('New Set');
  newSetButton.position(140, drawHeight + 10);
  newSetButton.mousePressed(newSet);

  const answers = ['Good', 'Shorted', 'Open'];
  let x = 240;
  for (const a of answers) {
    const b = createButton(a);
    b.position(x, drawHeight + 10);
    b.size(78, 24);
    b.mousePressed(() => classify(a));
    classifyButtons.push(b);
    x += 86;
  }

  newSet();

  describe('Four out-of-circuit diode samples and a multimeter fixed in ' +
           'diode-test mode. Clicking a sample takes a reading in the current ' +
           'probe direction; reversing the probes gives the other direction. ' +
           'Once both directions are known, three buttons classify the part as ' +
           'good, shorted or open.', LABEL);
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
  text('Diode Test Mode', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  const cardsBottom = 176;
  if (stacked) {
    panel = { x: margin, y: cardsBottom + 130, w: canvasWidth - 2 * margin,
              h: drawHeight - cardsBottom - 140 };
  } else {
    panel = { x: canvasWidth * 0.46, y: cardsBottom + 10,
              w: canvasWidth * 0.54 - margin, h: drawHeight - cardsBottom - 20 };
  }

  drawCards();
  drawMeter(stacked, cardsBottom);
  drawPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Sample cards
// ---------------------------------------------------------------------------

function drawCards() {
  const gap = 10;
  const w = (canvasWidth - 2 * margin - gap * 3) / 4;
  const y = 38, h = 128;

  cardBoxes = [];
  for (let i = 0; i < samples.length; i++) {
    const x = margin + i * (w + gap);
    const box = { x: x, y: y, w: w, h: h };
    cardBoxes.push(box);

    const isSel = selected === i;
    const done = seen[i] && seen[i].fwd && seen[i].rev;

    fill(isSel ? 'lightyellow' : 'white');
    stroke(isSel ? '#E8710A' : (done ? 'seagreen' : 'silver'));
    strokeWeight(isSel || done ? 3 : 1);
    rect(x, y, w, h, 8);

    // The part itself. Deliberately drawn identically for every sample: you
    // cannot tell a shorted diode from a good one by looking at it, which is
    // the whole reason for testing.
    const cx = x + w / 2, cy = y + 52;
    const isLed = samples[i] === 'led';
    if (isLed) drawLedGlyph(cx, cy, isSel && forward && lit(i));
    else drawDiodeGlyph(cx, cy);

    noStroke();
    fill('black');
    textAlign(CENTER, TOP);
    textSize(12);
    text('Sample ' + (i + 1), x + 4, y + h - 42, w - 8);
    fill('gray');
    textSize(11);
    text(done ? 'both directions read' : (seen[i] ? 'one direction read' : 'untested'),
         x + 4, y + h - 24, w - 8);
  }
}

// The LED glows faintly while the meter is pushing its test current through it.
function lit(i) {
  return samples[i] === 'led';
}

function drawDiodeGlyph(x, y) {
  noStroke();
  fill('#2E2E2E');
  rect(x - 22, y - 10, 44, 20, 3);
  fill('gainsboro');
  rect(x + 12, y - 10, 7, 20);
  stroke('#9AA3AB');
  strokeWeight(3);
  line(x - 38, y, x - 22, y);
  line(x + 22, y, x + 38, y);
}

function drawLedGlyph(x, y, glowing) {
  noStroke();
  if (glowing) {
    fill(255, 110, 90, 120);
    circle(x, y - 2, 44);
  }
  fill(glowing ? '#FF6B5A' : '#E4A79F');
  arc(x, y + 4, 26, 30, PI, TWO_PI);
  rect(x - 13, y + 4, 26, 7);
  stroke('#9AA3AB');
  strokeWeight(3);
  line(x - 6, y + 11, x - 6, y + 26);
  line(x + 6, y + 11, x + 6, y + 20);
}

// ---------------------------------------------------------------------------
// The meter
// ---------------------------------------------------------------------------

function drawMeter(stacked, top) {
  const x = margin, y = top + 10;
  const w = stacked ? canvasWidth - 2 * margin : canvasWidth * 0.44 - margin;
  const h = 118;

  noStroke();
  fill('#E08E12');
  rect(x, y, w, h, 10);

  // display
  fill('#B8CBB2');
  rect(x + 14, y + 14, w - 28, 56, 6);
  textAlign(CENTER, CENTER);
  const r = currentReading();
  fill('#1E2A20');
  textSize(r === '- - -' ? 24 : 30);
  text(r, x + w / 2, y + 42);

  // mode marker and probe direction
  noStroke();
  fill('#3B2A08');
  textAlign(LEFT, TOP);
  textSize(12);
  text('diode-test mode', x + 16, y + 78);

  textAlign(RIGHT, TOP);
  fill(forward ? '#8B1A12' : '#22282E');
  text(forward ? 'red probe on the band-free end' : 'probes reversed',
       x + w - 16, y + 78);

  // two probe leads
  stroke(forward ? '#B02A1F' : '#22282E');
  strokeWeight(5);
  line(x + w * 0.34, y + h, x + w * 0.28, y + h + 16);
  stroke(forward ? '#22282E' : '#B02A1F');
  line(x + w * 0.66, y + h, x + w * 0.72, y + h + 16);
}

function currentReading() {
  if (selected < 0) return '- - -';
  const k = KINDS[samples[selected]];
  return forward ? k.fwd : k.rev;
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

  if (verdict) {
    fill(verdict.ok ? 'darkgreen' : 'crimson');
    textSize(15);
    text(verdict.title, padX, ty);
    ty += 22;
    fill('black');
    textSize(12);
    text(verdict.text, padX, ty, innerW);
    return;
  }

  if (selected < 0) {
    fill('dimgray');
    textSize(13);
    text('Pick a sample, then read it in both directions before you classify it.',
         padX, ty, innerW);
    return;
  }

  const s = seen[selected] || {};
  const k = KINDS[samples[selected]];

  fill('gray');
  textSize(11);
  text('SAMPLE ' + (selected + 1), padX, ty);
  ty += 18;

  // Both readings, side by side, so the pattern is the thing on screen
  fill('black');
  textSize(13);
  text('forward:  ' + (s.fwd ? k.fwd : '— not read yet —'), padX, ty);
  ty += 20;
  text('reversed: ' + (s.rev ? k.rev : '— not read yet —'), padX, ty);
  ty += 30;

  if (s.fwd && s.rev) {
    fill('mediumblue');
    textSize(12);
    text('Both directions are in. Now classify it using the buttons below.',
         padX, ty, innerW);
  } else {
    fill('sienna');
    textSize(12);
    text('A single reading is never enough. Press Reverse Probes and read it ' +
         'the other way before deciding.', padX, ty, innerW);
  }
  ty += 46;

  fill('gray');
  textSize(11);
  text('WHAT THE READINGS MEAN', padX, ty);
  ty += 16;
  fill('dimgray');
  textSize(11);
  text('a voltage one way and OL the other → good\n' +
       'near zero volts both ways → shorted\n' +
       'OL both ways → open', padX, ty, innerW);
}

function drawControlLabels() {
  const ready = selected >= 0 && seen[selected] && seen[selected].fwd && seen[selected].rev;
  for (const b of classifyButtons) {
    b.style('opacity', ready ? '1' : '0.45');
  }
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(12);
  text(ready ? 'classify it:' : 'read both directions first',
       240, drawHeight + 56);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  for (let i = 0; i < cardBoxes.length; i++) {
    const b = cardBoxes[i];
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      selected = i;
      verdict = null;
      noteSeen();
      return;
    }
  }
}

// Records which directions have been read for the selected sample.
function noteSeen() {
  if (selected < 0) return;
  if (!seen[selected]) seen[selected] = { fwd: false, rev: false };
  if (forward) seen[selected].fwd = true; else seen[selected].rev = true;
}

function classify(answer) {
  if (selected < 0) return;
  const s = seen[selected];
  if (!s || !s.fwd || !s.rev) {
    verdict = { ok: false, title: 'Not yet',
                text: 'Read this sample in both directions first. One reading ' +
                      'on its own cannot tell a good part from a shorted one.' };
    return;
  }
  const k = KINDS[samples[selected]];
  const right = answer === k.answer;
  verdict = {
    ok: right,
    title: right ? 'Correct — ' + k.answer : 'Not quite — this one is ' + k.answer,
    text: k.why + '  (forward ' + k.fwd + ', reversed ' + k.rev + ')'
  };
}

// A fresh set: always one good diode and one good LED, plus a shorted and an
// open part, shuffled so their positions are not memorised.
function newSet() {
  const list = ['good', 'led', 'short', 'open'];
  for (let i = list.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    const t = list[i]; list[i] = list[j]; list[j] = t;
  }
  samples = list;
  selected = -1;
  forward = true;
  seen = {};
  verdict = null;
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
