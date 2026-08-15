// Kit Resistor Band Matcher
// CANVAS_HEIGHT: 480
// Bloom Level: Remember (L1) - Verb: identify, recognize
// Learning objective: Given a rendered resistor showing three color bands drawn
// from {brown, red, orange, black}, identify which of the four kit resistor
// values (220 Ω, 330 Ω, 1K, 10K) it represents.
//
// Scope is deliberately narrow: only the four band patterns taught in this
// chapter, and only the four colors those patterns use. The full ten-color
// system belongs to Chapter 11.
//
// How the bands decode:
//   220 Ω  red-red-brown      2, 2, x10
//   330 Ω  orange-orange-brown 3, 3, x10
//   1K     brown-black-red    1, 0, x100
//   10K    brown-black-orange 1, 0, x1000

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 400;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let defaultTextSize = 16;

// ---- Controls ----
let answerButtons = [];
let newButton;

// ---- State ----
let current = 0;             // index into KIT
let hoverBand = -1;
let flash = null;            // { ok, until }
let message = null;
let attempted = 0;
let correct = 0;
let bandBoxes = [];

// Digit value of each color, and the swatch used to draw it.
const COLORS = {
  black:  { value: 0, mult: 1,    swatch: 'black' },
  brown:  { value: 1, mult: 10,   swatch: '#7B3F00' },
  red:    { value: 2, mult: 100,  swatch: '#C62828' },
  orange: { value: 3, mult: 1000, swatch: '#EF6C00' }
};

const KIT = [
  { label: '220 Ω', bands: ['red', 'red', 'brown'] },
  { label: '330 Ω', bands: ['orange', 'orange', 'brown'] },
  { label: '1K',    bands: ['brown', 'black', 'red'] },
  { label: '10K',   bands: ['brown', 'black', 'orange'] }
];

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  for (let i = 0; i < KIT.length; i++) {
    const b = createButton(KIT[i].label);
    b.mousePressed(() => guess(i));
    answerButtons.push(b);
  }

  newButton = createButton('New Resistor');
  newButton.mousePressed(newResistor);

  layoutControls();
  current = 0;   // the chapter's first example, 220 Ω

  describe('A large rendered resistor showing three color bands, with four ' +
           'answer buttons for the kit values 220 ohms, 330 ohms, 1K and 10K. ' +
           'Hovering a band explains what that position and color mean. ' +
           'Choosing an answer gives immediate right or wrong feedback and ' +
           'updates a running score.', LABEL);
}

// Buttons wrap into a 2x2 grid when the canvas is too narrow for one row.
function layoutControls() {
  const narrow = canvasWidth < 460;
  const bw = narrow ? 90 : 78;

  for (let i = 0; i < answerButtons.length; i++) {
    if (narrow) {
      const col = i % 2, row = floor(i / 2);
      answerButtons[i].position(10 + col * (bw + 8), drawHeight + 6 + row * 32);
    } else {
      answerButtons[i].position(10 + i * (bw + 8), drawHeight + 10);
    }
    answerButtons[i].size(bw, 26);
  }

  if (narrow) newButton.position(10 + 2 * (bw + 8) + 10, drawHeight + 6);
  else newButton.position(10 + 4 * (bw + 8) + 10, drawHeight + 10);
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
  text('Which Kit Resistor Is This?', canvasWidth / 2, 8);

  drawResistor();
  drawInfoBox();
  drawScore();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The resistor
// ---------------------------------------------------------------------------

function drawResistor() {
  const cx = canvasWidth / 2;
  const cy = 150;
  const bodyW = min(canvasWidth - 2 * margin - 90, 320);
  const bodyH = 84;
  const x0 = cx - bodyW / 2;

  // Leads
  stroke('silver');
  strokeWeight(6);
  line(x0 - 42, cy, x0, cy);
  line(x0 + bodyW, cy, x0 + bodyW + 42, cy);

  // Body, with the flash tint applied when feedback is showing
  const flashing = flash && millis() < flash.until;
  noStroke();
  if (flashing) fill(flash.ok ? 'palegreen' : 'lightpink');
  else fill('wheat');
  rect(x0, cy - bodyH / 2, bodyW, bodyH, 18);

  // Slightly darker end caps so it reads as a physical part
  fill(flashing ? (flash.ok ? 'darkseagreen' : 'lightcoral') : 'burlywood');
  rect(x0, cy - bodyH / 2, 14, bodyH, 18, 0, 0, 18);
  rect(x0 + bodyW - 14, cy - bodyH / 2, 14, bodyH, 0, 18, 18, 0);

  // The three bands. They spread across most of the body and leave a wider
  // gap at the right, the way a real resistor leaves room for its tolerance
  // band — and the spacing also keeps the position captions from colliding.
  const bands = KIT[current].bands;
  const bandW = 20;
  const startX = x0 + bodyW * 0.12;
  const step = (bodyW * 0.58) / 2;

  bandBoxes = [];
  for (let i = 0; i < bands.length; i++) {
    const bx = startX + i * step;
    noStroke();
    fill(COLORS[bands[i]].swatch);
    rect(bx, cy - bodyH / 2, bandW, bodyH);

    const box = { x: bx, y: cy - bodyH / 2, w: bandW, h: bodyH };
    bandBoxes.push(box);

    if (hoverBand === i) {
      noFill();
      stroke('#E8710A');
      strokeWeight(3);
      rect(bx - 3, cy - bodyH / 2 - 3, bandW + 6, bodyH + 6, 3);
    }
  }

  hoverBand = -1;
  for (let i = 0; i < bandBoxes.length; i++) {
    const b = bandBoxes[i];
    if (mouseX >= b.x - 4 && mouseX <= b.x + b.w + 4 && mouseY >= b.y && mouseY <= b.y + b.h) {
      hoverBand = i;
    }
  }

  // Position captions under each band
  noStroke();
  fill('gray');
  textAlign(CENTER, TOP);
  textSize(12);
  const captions = ['1st digit', '2nd digit', 'multiplier'];
  for (let i = 0; i < 3; i++) {
    text(captions[i], bandBoxes[i].x + bandW / 2, cy + bodyH / 2 + 8);
  }
}

// ---------------------------------------------------------------------------
// Infobox and score
// ---------------------------------------------------------------------------

function drawInfoBox() {
  const x = margin, w = canvasWidth - 2 * margin;
  const y = 250, h = 84;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  textAlign(LEFT, TOP);
  textSize(14);

  // Hovering a band always wins - it is the learning affordance
  if (hoverBand >= 0) {
    const bands = KIT[current].bands;
    const color = bands[hoverBand];
    const c = COLORS[color];
    const roles = [
      'the first digit',
      'the second digit',
      'the multiplier'
    ];
    const meaning = hoverBand < 2
      ? color + ' means ' + c.value
      : color + ' means × ' + c.mult;
    fill('#E8710A');
    text('Band ' + (hoverBand + 1) + ' — ' + roles[hoverBand], x + 12, y + 10);
    fill('black');
    text(meaning, x + 12, y + 32, w - 24);
    return;
  }

  if (message) {
    fill(message.ok ? 'darkgreen' : 'crimson');
    text(message.text, x + 12, y + 10, w - 24);
    return;
  }

  fill('dimgray');
  text('Hover a band to learn what it means, or pick an answer below.',
       x + 12, y + 10, w - 24);
}

function drawScore() {
  noStroke();
  fill('black');
  textAlign(RIGHT, TOP);
  textSize(defaultTextSize);
  text(correct + '/' + attempted + ' correct', canvasWidth - margin, 44);
}

function drawControlLabels() {
  // Every control is a labeled button.
}

// ---------------------------------------------------------------------------
// Quiz logic
// ---------------------------------------------------------------------------

function guess(i) {
  attempted++;
  const ok = i === current;
  if (ok) correct++;
  flash = { ok: ok, until: millis() + 700 };

  const bands = KIT[current].bands;
  const d1 = COLORS[bands[0]].value;
  const d2 = COLORS[bands[1]].value;
  const mult = COLORS[bands[2]].mult;

  if (ok) {
    message = { ok: true, text: 'Correct — ' + bands[0] + ' (' + d1 + '), ' +
      bands[1] + ' (' + d2 + '), ' + bands[2] + ' (× ' + mult + ') = ' +
      (d1 * 10 + d2) + ' × ' + mult + ' = ' + KIT[current].label + '.' };
  } else {
    // Explains the pattern in front of the learner without naming the answer.
    message = { ok: false, text: 'Not that one. Read the bands again: ' +
      bands[0] + ' is ' + d1 + ', ' + bands[1] + ' is ' + d2 +
      ', and ' + bands[2] + ' multiplies by ' + mult + '.' };
  }
}

function newResistor() {
  // Avoid repeating the same resistor twice in a row
  let next = current;
  while (next === current && KIT.length > 1) next = floor(random(KIT.length));
  current = next;
  flash = null;
  message = null;
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  layoutControls();
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
