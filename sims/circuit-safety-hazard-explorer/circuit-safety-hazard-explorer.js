// Circuit Safety Hazard Explorer
// CANVAS_HEIGHT: 480
// Bloom Level: Understand (L2) - Verb: explain
// Learning objective: Explain how overcurrent, reverse polarity, static
// discharge, and short circuits damage components, and what protection or
// habit prevents each, by clicking each hazard icon to reveal cause,
// consequence, and protection.
//
// Every hazard uses the identical three-row breakdown so learners build one
// reusable "cause -> consequence -> protection" model instead of memorizing
// four unrelated warnings.

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
let resetButton;
let hazardSelect;

// ---- State ----
let selected = null;
let hoverIcon = null;
let iconBoxes = {};   // recomputed each frame for width responsiveness
let panel = {};

const HAZARDS = [
  {
    key: 'overcurrent',
    label: 'Overcurrent',
    tip: 'Too much current for the part',
    cause: 'More current flows than a component is rated for.',
    happens: 'Excess heat builds up and can permanently damage the part.',
    prevent: 'Correctly sized current-limiting resistors, and fuses in larger circuits.'
  },
  {
    key: 'reverse',
    label: 'Reverse Polarity',
    tip: 'Power connected backward',
    cause: 'Power is connected backward into a polarity-sensitive part.',
    happens: "Simple parts just don't work; sensitive chips can be permanently damaged.",
    prevent: 'Always check plus and minus marks before powering up.'
  },
  {
    key: 'static',
    label: 'Static Discharge',
    tip: 'Static jumps into a chip',
    cause: 'Built-up static charge jumps into a chip.',
    happens: 'Microscopic internal damage, often invisible until the part fails.',
    prevent: 'Touch a grounded metal object before handling chips; store ICs in anti-static packaging.'
  },
  {
    key: 'short',
    label: 'Short Circuit',
    tip: 'Current takes a shortcut',
    cause: 'Current finds a near-zero-resistance shortcut around the intended path.',
    happens: 'Current spikes rapidly, draining the battery fast and heating wires.',
    prevent: 'Double-check wiring before power-up; this is exactly what fuses protect against.'
  }
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
  resetButton.mousePressed(resetView);

  // Keyboard-accessible alternative to clicking an icon
  hazardSelect = createSelect();
  hazardSelect.position(140, drawHeight + 10);
  hazardSelect.option('-- pick a hazard --');
  for (const h of HAZARDS) hazardSelect.option(h.label);
  hazardSelect.changed(selectFromMenu);

  describe('Four circuit-safety hazard icons: overcurrent, reverse polarity, ' +
           'static discharge and short circuit. Clicking an icon fills an ' +
           'infobox with three rows explaining the cause, what happens, and ' +
           'how to prevent that hazard.', LABEL);
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
  text('Circuit Safety Hazards', canvasWidth / 2, 8);

  hoverIcon = hitIcon(mouseX, mouseY);

  drawIcons();
  drawInfoPanel();
  if (hoverIcon && hoverIcon !== selected) drawTip();

  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout - icons sit in one row when wide, a 2x2 grid when narrow
// ---------------------------------------------------------------------------

function computeLayout() {
  const wide = canvasWidth >= 620;
  const cols = wide ? 4 : 2;
  const rows = wide ? 1 : 2;

  const gap = 10;
  const avail = canvasWidth - 2 * margin;
  const bw = (avail - gap * (cols - 1)) / cols;
  const bh = 96;
  const topY = 44;

  iconBoxes = {};
  for (let i = 0; i < HAZARDS.length; i++) {
    const c = i % cols;
    const r = floor(i / cols);
    iconBoxes[HAZARDS[i].key] = {
      x: margin + c * (bw + gap),
      y: topY + r * (bh + gap),
      w: bw,
      h: bh
    };
  }

  const iconsBottom = topY + rows * bh + (rows - 1) * gap;
  panel = {
    x: margin,
    y: iconsBottom + 12,
    w: canvasWidth - 2 * margin,
    h: drawHeight - iconsBottom - 24
  };
}

function hitIcon(px, py) {
  for (const h of HAZARDS) {
    const b = iconBoxes[h.key];
    if (b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return h.key;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function drawIcons() {
  for (const h of HAZARDS) {
    const b = iconBoxes[h.key];
    const isSel = selected === h.key;

    // Rounded button background
    fill(isSel ? 'lightyellow' : 'white');
    stroke(isSel ? 'darkorange' : 'silver');
    strokeWeight(isSel ? 3 : 1);
    rect(b.x, b.y, b.w, b.h, 10);

    const cx = b.x + b.w / 2;
    const cy = b.y + 32;
    drawHazardIcon(h.key, cx, cy);

    noStroke();
    fill('black');
    textAlign(CENTER, TOP);
    textSize(15);
    text(h.label, b.x + 4, b.y + b.h - 30, b.w - 8);
  }
}

function drawHazardIcon(key, cx, cy) {
  push();
  translate(cx, cy);

  if (key === 'overcurrent') {
    // Flame
    noStroke();
    fill('orangered');
    beginShape();
    vertex(0, -20);
    bezierVertex(12, -6, 14, 4, 6, 14);
    bezierVertex(2, 18, -2, 18, -6, 14);
    bezierVertex(-14, 4, -12, -6, 0, -20);
    endShape(CLOSE);
    fill('gold');
    ellipse(0, 7, 10, 14);
  } else if (key === 'reverse') {
    // A battery drawn upside down, with a warning swap arrow
    stroke('dimgray');
    strokeWeight(2);
    fill('gainsboro');
    rect(-16, -12, 30, 22, 3);
    noStroke();
    fill('mediumblue');
    rect(14, -5, 5, 8, 2);
    fill('crimson');
    textAlign(CENTER, CENTER);
    textSize(15);
    text('−', -8, -1);
    fill('mediumblue');
    text('+', 6, -1);
    // swap arrows
    stroke('crimson');
    strokeWeight(2);
    noFill();
    arc(0, 16, 26, 14, PI, TWO_PI);
    line(13, 16, 9, 12);
    line(13, 16, 17, 12);
  } else if (key === 'static') {
    // Lightning bolt
    noStroke();
    fill('gold');
    beginShape();
    vertex(4, -22);
    vertex(-10, 2);
    vertex(-1, 2);
    vertex(-5, 20);
    vertex(11, -4);
    vertex(1, -4);
    endShape(CLOSE);
    stroke('goldenrod');
    strokeWeight(1);
    noFill();
    beginShape();
    vertex(4, -22);
    vertex(-10, 2);
    vertex(-1, 2);
    vertex(-5, 20);
    vertex(11, -4);
    vertex(1, -4);
    endShape(CLOSE);
  } else if (key === 'short') {
    // Two rails bridged by a red wire, with a spark
    stroke('dimgray');
    strokeWeight(3);
    line(-20, -12, 20, -12);
    line(-20, 12, 20, 12);
    stroke('crimson');
    strokeWeight(4);
    line(-2, -12, -2, 12);
    noStroke();
    fill('gold');
    beginShape();
    vertex(6, -6);
    vertex(0, 0);
    vertex(5, 0);
    vertex(1, 8);
    vertex(11, -1);
    vertex(6, -1);
    endShape(CLOSE);
  }
  pop();
}

// ---------------------------------------------------------------------------
// Infobox - identical three-row structure for every hazard
// ---------------------------------------------------------------------------

function drawInfoPanel() {
  fill(255, 255, 255, 235);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 14;
  const innerW = panel.w - 28;

  noStroke();
  textAlign(LEFT, TOP);

  if (!selected) {
    fill('dimgray');
    textSize(defaultTextSize);
    text('Click a hazard to learn about it.', padX, panel.y + 16);
    return;
  }

  const h = HAZARDS.find(x => x.key === selected);
  const rowH = (panel.h - 18) / 3;

  drawRow('Cause', h.cause, padX, panel.y + 10, innerW, rowH);
  drawRow('What Happens', h.happens, padX, panel.y + 10 + rowH, innerW, rowH);
  drawRow('How to Prevent It', h.prevent, padX, panel.y + 10 + 2 * rowH, innerW, rowH);
}

function drawRow(label, body, x, y, w, h) {
  noStroke();
  fill('darkorange');
  textAlign(LEFT, TOP);
  textSize(14);
  text(label.toUpperCase(), x, y);

  fill('black');
  textSize(defaultTextSize);
  text(body, x, y + 19, w);
}

function drawTip() {
  const h = HAZARDS.find(x => x.key === hoverIcon);
  if (!h) return;
  const msg = h.tip;
  textSize(14);
  const w = textWidth(msg) + 18;
  let x = mouseX + 14;
  let y = mouseY - 30;
  if (x + w > canvasWidth) x = canvasWidth - w - 4;
  if (y < 2) y = mouseY + 18;

  fill(255, 255, 255, 245);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, 25, 6);

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  text(msg, x + 9, y + 12);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Hazard:', 76, drawHeight + 22);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  const k = hitIcon(mouseX, mouseY);
  if (k) {
    selected = k;
    const h = HAZARDS.find(x => x.key === k);
    hazardSelect.selected(h.label);
  }
}

function selectFromMenu() {
  const v = hazardSelect.value();
  const h = HAZARDS.find(x => x.label === v);
  selected = h ? h.key : null;
}

function resetView() {
  selected = null;
  hazardSelect.selected('-- pick a hazard --');
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
