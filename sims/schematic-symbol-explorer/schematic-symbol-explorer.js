// Circuit Diagram and Schematic Symbol Explorer
// CANVAS_HEIGHT: 470
// Bloom Level: Remember (L1) - Verb: identify
// Learning objective: Identify the schematic symbols for a battery, resistor,
// LED, switch, and ground connection, and label the positive terminal,
// negative terminal, and component leads on a simple circuit diagram.
// Click any symbol to reveal what it is; click the switch to open/close the loop.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 420;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let defaultTextSize = 16;

// ---- Controls ----
let resetButton;
let symbolSelect;

// ---- Application state ----
let selected = null;        // which symbol the learner last clicked
let switchClosed = false;   // circuit starts OPEN so nothing is animating on load
let flowPhase = 0;          // animation phase for the current-flow dots
let mouseOverCanvas = false;
let hoverWire = false;      // true when the pointer is over a wire segment

// Layout values recomputed every frame so the sim stays width responsive.
// Each symbol gets a hit box so clicks can be matched to a symbol.
let stacked = false;        // narrow-screen layout flag
let loop = {};              // the circuit loop rectangle
let hit = {};               // hit boxes keyed by symbol name
let panel = {};             // infobox panel rectangle

// Infobox copy. Kept in one place so the text is easy for an author to edit.
const INFO = {
  battery: {
    title: 'Battery',
    body: 'The power source. The long line is the positive terminal; ' +
          'the short line is the negative terminal. Polarity matters!'
  },
  resistor: {
    title: 'Resistor',
    body: 'Limits current flow. Has two component leads; no polarity, ' +
          'so it can be wired either way.'
  },
  led: {
    title: 'LED (light-emitting diode)',
    body: 'Converts electrical power into light. Has two component leads. ' +
          'Polarity matters: the flat-bar side is the negative lead.'
  },
  switch: {
    title: 'Switch',
    body: 'Opens or closes the circuit. Click me to toggle between an ' +
          'open circuit and a closed circuit.'
  },
  ground: {
    title: 'Ground',
    body: 'The shared reference point that every voltage in the circuit ' +
          'is measured against.'
  }
};

function setup() {
  updateCanvasSize();
  // Cap the backing store at one device pixel per CSS pixel. At the Retina
  // default a full-width canvas asks the compositor for 4x the pixels every
  // frame, which can stall the compositor on a loaded machine.
  pixelDensity(1);

  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  // Animation only advances while the pointer is over the canvas so the
  // sim does not distract a student reading the surrounding chapter text.
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  resetButton = createButton('Reset View');
  resetButton.position(10, drawHeight + 10);
  resetButton.mousePressed(resetView);

  // Keyboard-accessible alternative to clicking a symbol in the diagram.
  symbolSelect = createSelect();
  symbolSelect.position(185, drawHeight + 10);
  symbolSelect.option('-- pick one --');
  symbolSelect.option('Battery');
  symbolSelect.option('Resistor');
  symbolSelect.option('LED');
  symbolSelect.option('Switch');
  symbolSelect.option('Ground');
  symbolSelect.changed(selectFromMenu);

  describe('An interactive circuit schematic showing a battery, resistor, LED, ' +
           'switch and ground symbol wired into one loop. Clicking a symbol ' +
           'displays its name and description. Clicking the switch opens or ' +
           'closes the circuit and shows whether current flows.', LABEL);
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

  // Title first (no grid or axes in this sim to draw underneath it)
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  text('Schematic Symbol Explorer', canvasWidth / 2, 8);

  // Advance the flow animation only when the loop is closed and the
  // learner is actually looking at the sim.
  if (switchClosed && mouseOverCanvas) {
    flowPhase += 0.012;
    if (flowPhase > 1) flowPhase -= 1;
  }

  hoverWire = isOverWire(mouseX, mouseY);

  drawCircuit();
  drawGround();
  drawInfoPanel();
  drawStatusBadge();
  if (hoverWire) drawWireTooltip();

  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

// Recompute every frame so the sim reflows as the container width changes.
// Wide screens put the infobox to the right of the diagram; narrow screens
// stack the infobox underneath it.
function computeLayout() {
  stacked = canvasWidth < 640;

  let diagramRight, diagramBottom;

  if (stacked) {
    diagramRight = canvasWidth;
    diagramBottom = drawHeight * 0.58;
    panel = { x: 10, y: diagramBottom + 6, w: canvasWidth - 20, h: drawHeight - diagramBottom - 16 };
  } else {
    diagramRight = canvasWidth * 0.64;
    diagramBottom = drawHeight;
    panel = { x: diagramRight + 10, y: 46, w: canvasWidth - diagramRight - 20, h: drawHeight - 62 };
  }

  // The circuit loop is a rectangle inset inside the diagram area.
  // Extra bottom room is reserved for the ground stub.
  let lx = margin + 20;
  let rx = diagramRight - margin - 20;
  let ty = 52;
  let by = diagramBottom - (stacked ? 34 : 96);
  if (rx - lx < 140) rx = lx + 140;   // keep the loop usable at tiny widths
  loop = { lx: lx, rx: rx, ty: ty, by: by, midY: (ty + by) / 2, midX: (lx + rx) / 2 };

  // Hit boxes: one per clickable symbol, centered on where it is drawn.
  hit.resistor = boxAround(loop.midX, loop.ty, 74, 34);
  hit.battery  = boxAround(loop.lx, loop.midY, 44, 60);
  hit.led      = boxAround(loop.rx, loop.midY, 44, 56);
  hit.switch   = boxAround(loop.midX, loop.by, 74, 38);
  hit.ground   = boxAround(loop.lx, loop.by + 46, 54, 40);
}

function boxAround(cx, cy, w, h) {
  return { x: cx - w / 2, y: cy - h / 2, w: w, h: h };
}

function inBox(b, px, py) {
  return b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}

// ---------------------------------------------------------------------------
// Circuit drawing
// ---------------------------------------------------------------------------

function drawCircuit() {
  // Wires are drawn first so the symbols sit on top of them.
  stroke('royalblue');
  strokeWeight(3);
  noFill();

  // Top edge, split around the resistor
  line(loop.lx, loop.ty, hit.resistor.x, loop.ty);
  line(hit.resistor.x + hit.resistor.w, loop.ty, loop.rx, loop.ty);
  // Left edge, split around the battery
  line(loop.lx, loop.ty, loop.lx, hit.battery.y);
  line(loop.lx, hit.battery.y + hit.battery.h, loop.lx, loop.by);
  // Right edge, split around the LED
  line(loop.rx, loop.ty, loop.rx, hit.led.y);
  line(loop.rx, hit.led.y + hit.led.h, loop.rx, loop.by);
  // Bottom edge, split around the switch
  line(loop.lx, loop.by, hit.switch.x, loop.by);
  line(hit.switch.x + hit.switch.w, loop.by, loop.rx, loop.by);

  if (switchClosed) drawCurrentFlow();

  drawResistor();
  drawBattery();
  drawLed();
  drawSwitch();

  // Highlight ring around whichever symbol is selected
  if (selected && hit[selected]) {
    const b = hit[selected];
    noFill();
    stroke('darkorange');
    strokeWeight(2);
    rect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 6);
  }
}

// Small dots travelling clockwise around the loop show conventional current.
function drawCurrentFlow() {
  const perim = 2 * ((loop.rx - loop.lx) + (loop.by - loop.ty));
  const dots = 12;
  noStroke();
  fill('darkorange');
  for (let i = 0; i < dots; i++) {
    const t = (flowPhase + i / dots) % 1;
    const p = pointOnLoop(t * perim);
    circle(p.x, p.y, 8);
  }
}

// Map a distance along the loop perimeter to an (x, y) point.
// Order is clockwise starting at the top-left corner.
function pointOnLoop(d) {
  const w = loop.rx - loop.lx;
  const h = loop.by - loop.ty;
  if (d < w) return { x: loop.lx + d, y: loop.ty };
  d -= w;
  if (d < h) return { x: loop.rx, y: loop.ty + d };
  d -= h;
  if (d < w) return { x: loop.rx - d, y: loop.by };
  d -= w;
  return { x: loop.lx, y: loop.by - d };
}

// Zigzag resistor with two leads, drawn horizontally on the top wire.
function drawResistor() {
  const b = hit.resistor;
  const y = loop.ty;
  const x0 = b.x, x1 = b.x + b.w;
  stroke('royalblue');
  strokeWeight(3);
  noFill();
  beginShape();
  vertex(x0, y);
  const zig = 6;
  const seg = (x1 - x0) / zig;
  for (let i = 0; i < zig; i++) {
    const px = x0 + seg * (i + 0.5);
    vertex(px, y + (i % 2 === 0 ? -11 : 11));
  }
  vertex(x1, y);
  endShape();
}

// Battery: long line = positive terminal, short line = negative terminal.
function drawBattery() {
  const b = hit.battery;
  const x = loop.lx;
  const yTop = b.y + 16;      // long plate (positive)
  const yBot = b.y + b.h - 16; // short plate (negative)

  stroke('royalblue');
  strokeWeight(3);
  line(x, b.y, x, yTop);
  line(x, yBot, x, b.y + b.h);

  // Long plate - positive
  stroke('darkorange');
  strokeWeight(4);
  line(x - 18, yTop, x + 18, yTop);
  // Short plate - negative
  stroke('dimgray');
  line(x - 9, yBot, x + 9, yBot);

  // Terminal labels appear once the learner has selected the battery
  if (selected === 'battery') {
    noStroke();
    textSize(defaultTextSize);
    textAlign(LEFT, CENTER);
    fill('darkorange');
    text('+', x + 24, yTop);
    fill('dimgray');
    text('−', x + 24, yBot);
  }
}

// LED: diode triangle and bar, plus two little emission arrows.
function drawLed() {
  const b = hit.led;
  const x = loop.rx;
  const yA = b.y + 12;              // anode side (triangle base)
  const yK = b.y + b.h - 12;        // cathode side (flat bar)

  stroke('royalblue');
  strokeWeight(3);
  line(x, b.y, x, yA);
  line(x, yK, x, b.y + b.h);

  // Triangle pointing down toward the cathode bar
  noStroke();
  fill(switchClosed ? 'gold' : 'lightsteelblue');
  triangle(x - 13, yA, x + 13, yA, x, yK);
  // Cathode bar - the negative lead
  stroke('dimgray');
  strokeWeight(4);
  line(x - 14, yK, x + 14, yK);

  // Emission arrows
  stroke(switchClosed ? 'goldenrod' : 'lightsteelblue');
  strokeWeight(2);
  for (let i = 0; i < 2; i++) {
    const ay = yA + 6 + i * 11;
    line(x + 17, ay, x + 29, ay - 8);
    line(x + 29, ay - 8, x + 24, ay - 7);
    line(x + 29, ay - 8, x + 28, ay - 3);
  }

  if (selected === 'led') {
    noStroke();
    fill('dimgray');
    textSize(defaultTextSize);
    textAlign(RIGHT, CENTER);
    text('− lead', x - 20, yK);
  }
}

// Switch drawn on the bottom wire. Open shows a visible gap in the loop.
function drawSwitch() {
  const b = hit.switch;
  const y = loop.by;
  const x0 = b.x, x1 = b.x + b.w;

  stroke('royalblue');
  strokeWeight(3);
  if (switchClosed) {
    line(x0, y, x1, y);
  } else {
    // Hinged lever tilted up, leaving an obvious gap
    line(x0, y, x0 + 8, y);
    line(x0 + 8, y, x1 - 6, y - 22);
    line(x1 - 6, y, x1, y);
  }
  // Contact dots
  noStroke();
  fill('royalblue');
  circle(x0 + 8, y, 7);
  circle(x1 - 6, y, 7);
}

// Ground symbol: three shrinking horizontal lines below the battery corner.
function drawGround() {
  const b = hit.ground;
  const x = loop.lx;
  const yTop = loop.by;

  stroke('royalblue');
  strokeWeight(3);
  line(x, yTop, x, yTop + 20);
  stroke('dimgray');
  const widths = [22, 14, 7];
  for (let i = 0; i < widths.length; i++) {
    const gy = yTop + 24 + i * 7;
    line(x - widths[i], gy, x + widths[i], gy);
  }

  if (selected === 'ground') {
    noStroke();
    fill('dimgray');
    textSize(defaultTextSize);
    textAlign(LEFT, CENTER);
    text('ground', x + 30, yTop + 30);
  }
}

// ---------------------------------------------------------------------------
// Panels and labels
// ---------------------------------------------------------------------------

function drawInfoPanel() {
  // Panel background
  fill(255, 255, 255, 230);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  let ty = panel.y + 14;

  noStroke();
  textAlign(LEFT, TOP);

  if (!selected) {
    fill('dimgray');
    textSize(defaultTextSize);
    text('Click a symbol to learn about it.', padX, ty, panel.w - 24);
    return;
  }

  const info = INFO[selected];

  fill('black');
  textSize(18);
  text(info.title, padX, ty, panel.w - 24);
  ty += 26;

  fill('dimgray');
  textSize(defaultTextSize);
  text(info.body, padX, ty, panel.w - 24);

  // A simple drawing of the real-world part, so the learner links the
  // abstract symbol to the physical component.
  const thumbY = panel.y + panel.h - 62;
  if (thumbY > ty + 40) drawRealPart(selected, padX + 26, thumbY);
}

// Stylized sketches of the physical components (no photo assets in the repo).
function drawRealPart(name, cx, cy) {
  push();
  translate(cx, cy);
  strokeWeight(2);

  if (name === 'battery') {
    stroke('dimgray');
    fill('gainsboro');
    rect(-24, -12, 44, 24, 3);
    fill('darkorange');
    noStroke();
    rect(20, -5, 5, 10, 2);
  } else if (name === 'resistor') {
    stroke('dimgray');
    line(-32, 0, -18, 0);
    line(18, 0, 32, 0);
    fill('wheat');
    rect(-18, -9, 36, 18, 4);
    noStroke();
    fill('saddlebrown'); rect(-10, -9, 4, 18);
    fill('black');       rect(-2, -9, 4, 18);
    fill('firebrick');   rect(6, -9, 4, 18);
  } else if (name === 'led') {
    stroke('dimgray');
    line(-6, 10, -6, 24);
    line(6, 10, 6, 20);
    fill('lightcoral');
    arc(0, 0, 26, 30, PI, TWO_PI);
    rect(-13, 0, 26, 10);
  } else if (name === 'switch') {
    stroke('dimgray');
    fill('gainsboro');
    rect(-20, -12, 40, 24, 3);
    fill('darkslategray');
    rect(-6, -18, 12, 14, 2);
  } else if (name === 'ground') {
    stroke('dimgray');
    fill('gainsboro');
    rect(-22, -8, 44, 16, 2);
    noStroke();
    fill('dimgray');
    textSize(12);
    textAlign(CENTER, CENTER);
    text('GND', 0, 0);
  }
  pop();

  noStroke();
  fill('gray');
  textSize(13);
  textAlign(LEFT, CENTER);
  text('the real part', cx + 44, cy);
}

// A badge stating plainly whether the loop is open or closed.
function drawStatusBadge() {
  const label = switchClosed ? 'Closed circuit - current flows' :
                               'Open circuit - no current flowing';
  const bg = switchClosed ? 'honeydew' : 'seashell';
  const fg = switchClosed ? 'darkgreen' : 'sienna';

  textSize(defaultTextSize);
  const w = textWidth(label) + 22;
  const x = 12;
  const y = drawHeight - 30;

  fill(bg);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, 24, 8);

  noStroke();
  fill(fg);
  textAlign(LEFT, CENTER);
  text(label, x + 11, y + 12);
}

// Tooltip shown while hovering a wire segment.
function drawWireTooltip() {
  const msg = switchClosed ? 'Current flows through this wire' :
                             'No current - the switch is open';
  textSize(14);
  const w = textWidth(msg) + 18;
  let x = mouseX + 14;
  let y = mouseY - 30;
  if (x + w > canvasWidth) x = canvasWidth - w - 4;
  if (y < 2) y = mouseY + 18;

  fill(255, 255, 255, 240);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, 24, 6);

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
  text('Symbol:', 118, drawHeight + 22);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  // Ignore clicks outside the drawing region
  if (mouseY < 0 || mouseY > drawHeight || mouseX < 0 || mouseX > canvasWidth) return;

  // The switch both selects itself and toggles the circuit.
  if (inBox(hit.switch, mouseX, mouseY)) {
    switchClosed = !switchClosed;
    selected = 'switch';
    syncMenu();
    return;
  }

  const names = ['battery', 'resistor', 'led', 'ground'];
  for (const n of names) {
    if (inBox(hit[n], mouseX, mouseY)) {
      selected = n;
      syncMenu();
      return;
    }
  }
}

// True when the pointer is within a few pixels of any loop wire segment.
function isOverWire(px, py) {
  if (py < 0 || py > drawHeight) return false;
  const tol = 6;
  const onTop    = abs(py - loop.ty) <= tol && px >= loop.lx && px <= loop.rx;
  const onBottom = abs(py - loop.by) <= tol && px >= loop.lx && px <= loop.rx;
  const onLeft   = abs(px - loop.lx) <= tol && py >= loop.ty && py <= loop.by;
  const onRight  = abs(px - loop.rx) <= tol && py >= loop.ty && py <= loop.by;
  return onTop || onBottom || onLeft || onRight;
}

function selectFromMenu() {
  const v = symbolSelect.value();
  const map = {
    'Battery': 'battery', 'Resistor': 'resistor', 'LED': 'led',
    'Switch': 'switch', 'Ground': 'ground'
  };
  selected = map[v] || null;
}

function syncMenu() {
  const map = {
    battery: 'Battery', resistor: 'Resistor', led: 'LED',
    switch: 'Switch', ground: 'Ground'
  };
  if (selected && map[selected]) symbolSelect.selected(map[selected]);
}

function resetView() {
  selected = null;
  switchClosed = false;
  flowPhase = 0;
  symbolSelect.selected('-- pick one --');
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
