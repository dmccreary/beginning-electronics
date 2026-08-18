// Electron Flow vs Conventional Current
// CANVAS_HEIGHT: 480
// Bloom Level: Understand (L2) - Verb: explain
// Learning objective: Explain why conventional current is drawn from positive
// to negative even though electrons physically flow from negative to positive,
// by toggling between an animated electron-flow view and an animated
// conventional-current view of the same battery-and-resistor loop.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 400;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let sliderLeftMargin = 150;
let defaultTextSize = 16;

// ---- Controls ----
let playButton;
let viewSelect;
let speedSlider;

// ---- State ----
let isRunning = false;       // MicroSims must start paused
let view = 'electron';       // 'electron' or 'conventional'
let phase = 0;               // 0..1 position along the loop path
let speed = 3;
let hoverBattery = false;

// Loop geometry, recomputed each frame for width responsiveness
let loop = {};
let batteryBox = {};

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

  playButton = createButton('Play');
  playButton.position(10, drawHeight + 10);
  playButton.mousePressed(toggleSimulation);

  viewSelect = createSelect();
  viewSelect.position(95, drawHeight + 10);
  viewSelect.option('Show Electron Flow');
  viewSelect.option('Show Conventional Current');
  viewSelect.selected('Show Electron Flow');
  viewSelect.changed(changeView);

  speedSlider = createSlider(1, 10, speed, 1);
  speedSlider.position(sliderLeftMargin, drawHeight + 45);
  speedSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A battery and resistor wired into a single loop. A menu switches ' +
           'between an electron-flow view, where orange dots travel from the ' +
           'negative terminal to the positive terminal, and a conventional-current ' +
           'view, where a blue arrow travels from positive to negative. A play ' +
           'button and speed slider control the animation.', LABEL);
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

  speed = speedSlider.value();

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  text('Electron Flow vs Conventional Current', canvasWidth / 2, 8);

  if (isRunning) {
    phase += 0.0009 * speed;
    if (phase > 1) phase -= 1;
  }

  hoverBattery = inBox(batteryBox, mouseX, mouseY);

  drawLoop();
  drawResistor();
  drawBattery();
  drawMovers();
  drawExplanation();
  if (!isRunning && phase === 0) drawPressPlayPrompt();
  if (hoverBattery) drawBatteryTooltip();

  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function computeLayout() {
  const lx = margin + 30;
  const rx = canvasWidth - margin - 30;
  const ty = 78;
  const by = drawHeight - 96;
  loop = { lx: lx, rx: max(rx, lx + 160), ty: ty, by: by };
  loop.midY = (ty + by) / 2;
  loop.midX = (loop.lx + loop.rx) / 2;
  batteryBox = { x: loop.lx - 26, y: loop.midY - 40, w: 52, h: 80 };
}

function inBox(b, px, py) {
  return b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}

// ---------------------------------------------------------------------------
// Circuit drawing
// ---------------------------------------------------------------------------

function drawLoop() {
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  // Top edge is split around the resistor
  const rw = 84;
  line(loop.lx, loop.ty, loop.midX - rw / 2, loop.ty);
  line(loop.midX + rw / 2, loop.ty, loop.rx, loop.ty);
  // Right and bottom edges
  line(loop.rx, loop.ty, loop.rx, loop.by);
  line(loop.lx, loop.by, loop.rx, loop.by);
  // Left edge split around the battery
  line(loop.lx, loop.ty, loop.lx, batteryBox.y);
  line(loop.lx, batteryBox.y + batteryBox.h, loop.lx, loop.by);
}

function drawResistor() {
  const y = loop.ty;
  const rw = 84;
  const x0 = loop.midX - rw / 2;
  const x1 = loop.midX + rw / 2;
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  beginShape();
  vertex(x0, y);
  const zig = 6;
  const seg = (x1 - x0) / zig;
  for (let i = 0; i < zig; i++) {
    vertex(x0 + seg * (i + 0.5), y + (i % 2 === 0 ? -12 : 12));
  }
  vertex(x1, y);
  endShape();

  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(defaultTextSize);
  text('Resistor', loop.midX, y - 20);
}

// Battery with the positive (long) plate on top and negative (short) below.
function drawBattery() {
  const x = loop.lx;
  const yPos = batteryBox.y + 24;
  const yNeg = batteryBox.y + batteryBox.h - 24;

  stroke('steelblue');
  strokeWeight(3);
  line(x, batteryBox.y, x, yPos);
  line(x, yNeg, x, batteryBox.y + batteryBox.h);

  // Long plate = positive terminal
  stroke('darkorange');
  strokeWeight(4);
  line(x - 20, yPos, x + 20, yPos);
  // Short plate = negative terminal
  stroke('dimgray');
  line(x - 10, yNeg, x + 10, yNeg);

  noStroke();
  textSize(defaultTextSize);
  textAlign(RIGHT, CENTER);
  fill('darkorange');
  text('+', x - 26, yPos);
  fill('dimgray');
  text('−', x - 26, yNeg);
}

// ---------------------------------------------------------------------------
// The moving charge carriers
// ---------------------------------------------------------------------------

// The loop path is the rectangle perimeter. Distance 0 starts at the battery's
// positive plate and runs CLOCKWISE (up the left edge, across the top, down
// the right, back along the bottom to the negative plate).
function pathLength() {
  const w = loop.rx - loop.lx;
  const h = loop.by - loop.ty;
  return 2 * (w + h);
}

function pointOnPath(d) {
  const w = loop.rx - loop.lx;
  const h = loop.by - loop.ty;
  const total = 2 * (w + h);
  d = ((d % total) + total) % total;

  // Start at top-left corner, go clockwise
  if (d < w) return { x: loop.lx + d, y: loop.ty, ang: 0 };
  d -= w;
  if (d < h) return { x: loop.rx, y: loop.ty + d, ang: HALF_PI };
  d -= h;
  if (d < w) return { x: loop.rx - d, y: loop.by, ang: PI };
  d -= w;
  return { x: loop.lx, y: loop.by - d, ang: -HALF_PI };
}

function drawMovers() {
  if (view === 'electron') {
    // Electrons physically move from the negative terminal toward the
    // positive terminal, which on this layout is counter-clockwise.
    const n = 16;
    const total = pathLength();
    noStroke();
    fill('darkorange');
    for (let i = 0; i < n; i++) {
      const t = (1 - ((phase + i / n) % 1));
      const p = pointOnPath(t * total);
      circle(p.x, p.y, 11);
    }
    // Minus glyphs on a couple of the dots so they read as electrons
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(11);
    for (let i = 0; i < n; i += 4) {
      const t = (1 - ((phase + i / n) % 1));
      const p = pointOnPath(t * total);
      noStroke();
      text('−', p.x, p.y);
    }
  } else {
    // Conventional current: one large arrow leaving the positive terminal
    // and travelling clockwise back to the negative terminal.
    const total = pathLength();
    const t = phase % 1;
    const p = pointOnPath(t * total);
    push();
    translate(p.x, p.y);
    rotate(p.ang);
    noStroke();
    fill('mediumblue');
    triangle(16, 0, -10, -11, -10, 11);
    rect(-20, -4, 12, 8);
    pop();
  }
}

// ---------------------------------------------------------------------------
// Explanation and prompts
// ---------------------------------------------------------------------------

function drawExplanation() {
  const isElectron = view === 'electron';
  const heading = isElectron ? 'Electron Flow (real motion)'
                             : 'Conventional Current (the arrow engineers draw)';
  const body = isElectron
    ? 'Electrons move negative to positive — this is the real, physical motion.'
    : 'Conventional current is drawn positive to negative — this is the ' +
      'direction engineers agreed to use on every diagram.';
  const accent = isElectron ? 'darkorange' : 'mediumblue';

  const boxX = margin;
  const boxW = canvasWidth - 2 * margin;
  const boxY = drawHeight - 78;

  fill(255, 255, 255, 235);
  stroke('silver');
  strokeWeight(1);
  rect(boxX, boxY, boxW, 60, 10);

  noStroke();
  fill(accent);
  textAlign(LEFT, TOP);
  textSize(17);
  text(heading, boxX + 12, boxY + 9);

  fill('black');
  textSize(defaultTextSize);
  text(body, boxX + 12, boxY + 32, boxW - 24);
}

function drawPressPlayPrompt() {
  const msg = 'Press Play to start';
  textSize(defaultTextSize);
  const w = textWidth(msg) + 24;
  const x = loop.midX - w / 2;
  const y = loop.midY - 16;

  fill('lightyellow');
  stroke('goldenrod');
  strokeWeight(1);
  rect(x, y, w, 32, 8);

  noStroke();
  fill('darkgoldenrod');
  textAlign(CENTER, CENTER);
  text(msg, loop.midX, y + 16);
}

function drawBatteryTooltip() {
  const msg = 'Long line = positive (+), short line = negative (−)';
  textSize(14);
  const w = textWidth(msg) + 18;
  let x = mouseX + 14;
  let y = mouseY - 32;
  if (x + w > canvasWidth) x = canvasWidth - w - 4;
  if (y < 2) y = mouseY + 18;

  fill(255, 255, 255, 245);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, 26, 6);

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  text(msg, x + 9, y + 13);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Speed: ' + speed, 10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function toggleSimulation() {
  isRunning = !isRunning;
  playButton.html(isRunning ? 'Pause' : 'Play');
}

function changeView() {
  view = viewSelect.value() === 'Show Electron Flow' ? 'electron' : 'conventional';
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  speedSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
