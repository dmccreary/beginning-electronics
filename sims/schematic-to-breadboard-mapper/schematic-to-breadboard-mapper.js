// Schematic to Breadboard Mapper
// CANVAS_HEIGHT: 540
// Bloom Level: Apply (L3) - Verb: construct, demonstrate
// Learning objective: Given a simple schematic (battery, resistor, LED, ground)
// shown side-by-side with a blank breadboard, correctly map each schematic
// symbol to its breadboard placement and each schematic connection to a jumper
// wire, demonstrating both wiring-diagram interpretation and
// schematic-to-breadboard mapping.
//
// The board is drawn by breadboard-lib.js, the same renderer used by the
// Breadboard Anatomy Explorer, so the board looks identical across chapters.
//
// Interaction is select-then-place rather than free dragging: it works with a
// mouse and with a touch screen without a separate code path, and it mirrors
// how you actually build - pick the part up, decide where it goes, seat it.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 490;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let checkButton;
let newButton;

// ---- State ----
let selectedSymbol = null;    // schematic symbol whose infobox is open
let trayPick = null;          // 'resistor' | 'led' | 'wire'
let placed = { resistor: null, led: null };   // row+col each part occupies
let wires = [];               // completed jumper connections
let wireStart = null;         // first endpoint while running a jumper
let feedback = null;
let variant = 0;              // which schematic is showing
let trayBoxes = {};
let symbolBoxes = {};

const COLS = 20;

// The two schematics the learner can be asked to build. Each answer key names
// the breadboard columns the parts must bridge and the jumpers required.
const CIRCUITS = [
  {
    name: 'Battery → resistor → LED → ground',
    parts: ['resistor', 'led'],
    // Each part must sit across the center gutter is NOT required here; what
    // matters is that the two parts land in different tie columns, so they are
    // in series rather than shorted together.
    connections: [
      { from: '+ rail', to: 'resistor', label: 'power to the resistor' },
      { from: 'resistor', to: 'led', label: 'resistor to the LED' },
      { from: 'led', to: '− rail', label: 'LED to ground' }
    ]
  },
  {
    name: 'Battery → resistor → two LEDs in series → ground',
    parts: ['resistor', 'led'],
    connections: [
      { from: '+ rail', to: 'resistor', label: 'power to the resistor' },
      { from: 'resistor', to: 'led', label: 'resistor to the first LED' },
      { from: 'led', to: '− rail', label: 'LED string to ground' }
    ]
  }
];

const SYMBOL_INFO = {
  battery: { title: 'Battery', body: 'The voltage source. On the breadboard it becomes the + and − power rails.' },
  resistor: { title: 'Resistor', body: 'Limits the current. It needs its own tie column so it sits in series with the LED, not across it.' },
  led: { title: 'LED', body: 'The load that lights up. Polarity matters — the flat-bar side is the negative lead.' },
  ground: { title: 'Ground', body: 'The return path. On the breadboard this is the − rail every circuit shares.' }
};

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

  checkButton = createButton('Check My Wiring');
  checkButton.position(10, drawHeight + 10);
  checkButton.mousePressed(checkWiring);

  newButton = createButton('New Circuit');
  newButton.position(140, drawHeight + 10);
  newButton.mousePressed(newCircuit);

  describe('A simple schematic with a battery, resistor, LED and ground on the ' +
           'left, and a blank breadboard on the right. Clicking a schematic ' +
           'symbol explains its role. Parts are picked from a tray and placed ' +
           'into breadboard columns, then jumper wires connect the rails and ' +
           'parts. A check button compares the built layout to the schematic.', LABEL);
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
  text('Schematic → Breadboard', canvasWidth / 2, 6);

  const stacked = canvasWidth < 720;
  const trayH = 54;
  const infoH = 56;
  const bodyTop = 32;
  const bodyH = drawHeight - bodyTop - trayH - infoH - 8;

  if (stacked) {
    drawSchematic(margin, bodyTop, canvasWidth - 2 * margin, bodyH * 0.42);
    layoutBoard(margin, bodyTop + bodyH * 0.44, canvasWidth - 2 * margin, bodyH * 0.56);
  } else {
    const halfW = (canvasWidth - 3 * margin) / 2;
    drawSchematic(margin, bodyTop, halfW, bodyH);
    layoutBoard(margin * 2 + halfW, bodyTop, halfW, bodyH);
  }

  drawTray(drawHeight - trayH - infoH, trayH);
  drawFeedback(drawHeight - infoH + 2, infoH);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Schematic side
// ---------------------------------------------------------------------------

function drawSchematic(x, y, w, h) {
  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(13);
  text(CIRCUITS[variant].name, x, y);

  const lx = x + 26;
  const rx = x + w - 26;
  const ty = y + 34;
  const by = y + h - 30;
  const midY = (ty + by) / 2;

  // Loop wires
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  line(lx, ty, rx, ty);
  line(rx, ty, rx, by);
  line(lx, by, rx, by);
  line(lx, ty, lx, midY - 9);
  line(lx, midY + 9, lx, by);

  // Battery
  stroke('darkorange');
  strokeWeight(4);
  line(lx - 15, midY - 9, lx + 15, midY - 9);
  stroke('dimgray');
  line(lx - 8, midY + 9, lx + 8, midY + 9);
  symbolBoxes.battery = { x: lx - 20, y: midY - 18, w: 40, h: 36 };

  // Resistor on the top wire
  const rcx = x + w * 0.42;
  drawZigzag(rcx, ty, 62);
  symbolBoxes.resistor = { x: rcx - 36, y: ty - 16, w: 72, h: 32 };

  // LED on the right wire
  const lcy = midY;
  drawLedSymbol(rx, lcy);
  symbolBoxes.led = { x: rx - 20, y: lcy - 20, w: 40, h: 40 };

  // Ground stub off the bottom-left
  stroke('steelblue');
  strokeWeight(3);
  line(lx, by, lx, by + 12);
  stroke('dimgray');
  const widths = [16, 10, 5];
  for (let i = 0; i < 3; i++) line(lx - widths[i], by + 16 + i * 5, lx + widths[i], by + 16 + i * 5);
  symbolBoxes.ground = { x: lx - 20, y: by + 8, w: 40, h: 26 };

  // Highlight ring on whichever symbol is open
  if (selectedSymbol && symbolBoxes[selectedSymbol]) {
    const b = symbolBoxes[selectedSymbol];
    noFill();
    stroke('#E8710A');
    strokeWeight(3);
    rect(b.x - 3, b.y - 3, b.w + 6, b.h + 6, 6);
  }

  // Labels
  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text('resistor', rcx, ty - 18);
  textAlign(LEFT, CENTER);
  text('LED', rx - 34, lcy - 24);
}

function drawZigzag(cx, y, w) {
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  const x0 = cx - w / 2;
  beginShape();
  vertex(x0, y);
  const zig = 6;
  const s = w / zig;
  for (let i = 0; i < zig; i++) vertex(x0 + s * (i + 0.5), y + (i % 2 === 0 ? -9 : 9));
  vertex(cx + w / 2, y);
  endShape();
}

function drawLedSymbol(x, y) {
  noStroke();
  fill('lightsteelblue');
  triangle(x - 11, y - 10, x + 11, y - 10, x, y + 8);
  stroke('dimgray');
  strokeWeight(4);
  line(x - 12, y + 8, x + 12, y + 8);
}

// ---------------------------------------------------------------------------
// Breadboard side
// ---------------------------------------------------------------------------

function layoutBoard(x, y, w, h) {
  bbLayout(x, y, w, h, COLS, { supply: false });
  bbDrawBoard();

  // Parts already seated
  if (placed.resistor !== null) drawSeatedPart('resistor', placed.resistor);
  if (placed.led !== null) drawSeatedPart('led', placed.led);

  // Jumper wires already run
  for (const wr of wires) drawJumper(wr);

  // The endpoint currently waiting for its partner
  if (wireStart) {
    const p = endpointXY(wireStart);
    noFill();
    stroke('#E8710A');
    strokeWeight(3);
    circle(p.x, p.y, BB.pitch * 1.4);
  }

  // Column click affordance while a part or wire is picked up
  if (trayPick) {
    noStroke();
    fill(232, 113, 10, 40);
    for (let c = 2; c <= COLS - 1; c++) {
      circle(bbColX(c), bbRowY('c'), BB.pitch * 0.9);
    }
  }
}

// A part bridges rows b..d in one tie column, which is how a through-hole part
// actually sits when you want room for jumpers on either side of it.
function drawSeatedPart(kind, col) {
  const x = bbColX(col);
  const yTop = bbRowY('b');
  const yBot = bbRowY('d');

  if (kind === 'resistor') {
    stroke('peru');
    strokeWeight(3);
    line(x, yTop, x, yBot);
    noStroke();
    fill('wheat');
    rect(x - 7, (yTop + yBot) / 2 - 10, 14, 20, 3);
    fill('saddlebrown'); rect(x - 7, (yTop + yBot) / 2 - 7, 14, 3);
    fill('black');       rect(x - 7, (yTop + yBot) / 2 - 1, 14, 3);
    fill('firebrick');   rect(x - 7, (yTop + yBot) / 2 + 5, 14, 3);
  } else {
    stroke('gray');
    strokeWeight(3);
    line(x, yTop, x, yBot);
    noStroke();
    fill('lightcoral');
    circle(x, (yTop + yBot) / 2, 15);
  }

  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(11);
  text(kind, x, yTop - 5);
}

function endpointXY(ep) {
  if (ep.kind === 'rail') {
    return { x: bbColX(ep.col), y: bbRowY(ep.row) };
  }
  return { x: bbColX(placed[ep.kind]), y: bbRowY('c') };
}

function drawJumper(wr) {
  const a = endpointXY(wr.a);
  const b = endpointXY(wr.b);
  const laneY = min(a.y, b.y) - BB.pitch * 1.1;

  stroke(wr.bad ? 'crimson' : '#1B7A7A');
  strokeWeight(3);
  noFill();
  beginShape();
  vertex(a.x, a.y);
  vertex(a.x, laneY);
  vertex(b.x, laneY);
  vertex(b.x, b.y);
  endShape();

  noStroke();
  fill(wr.bad ? 'crimson' : '#1B7A7A');
  circle(a.x, a.y, 7);
  circle(b.x, b.y, 7);
}

// ---------------------------------------------------------------------------
// Parts tray
// ---------------------------------------------------------------------------

function drawTray(y, h) {
  const items = [
    { key: 'resistor', label: 'Resistor' },
    { key: 'led', label: 'LED' },
    { key: 'wire', label: 'Jumper wire' }
  ];
  const w = min(150, (canvasWidth - 2 * margin - 20) / 3);

  trayBoxes = {};
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const b = { x: margin + i * (w + 10), y: y + 4, w: w, h: h - 12 };
    trayBoxes[it.key] = b;

    const sel = trayPick === it.key;
    const used = (it.key !== 'wire') && placed[it.key] !== null;

    fill(used ? 'gainsboro' : (sel ? 'lightyellow' : 'white'));
    stroke(sel ? '#E8710A' : 'silver');
    strokeWeight(sel ? 3 : 1);
    rect(b.x, b.y, b.w, b.h, 8);

    noStroke();
    fill(used ? 'gray' : 'black');
    textAlign(LEFT, CENTER);
    textSize(13);
    text(used ? it.label + ' (placed)' : it.label, b.x + 34, b.y + b.h / 2, b.w - 40);

    // Glyph
    const gx = b.x + 18, gy = b.y + b.h / 2;
    if (it.key === 'resistor') {
      noStroke(); fill('wheat'); rect(gx - 8, gy - 5, 16, 10, 2);
      fill('firebrick'); rect(gx - 3, gy - 5, 3, 10);
    } else if (it.key === 'led') {
      noStroke(); fill('lightcoral'); circle(gx, gy, 13);
    } else {
      stroke('#1B7A7A'); strokeWeight(3); noFill();
      line(gx - 9, gy + 4, gx + 9, gy - 4);
    }
  }
}

function drawFeedback(y, h) {
  noStroke();
  textAlign(LEFT, TOP);
  textSize(13);

  if (feedback) {
    fill(feedback.ok ? 'darkgreen' : 'crimson');
    text(feedback.msg, margin, y, canvasWidth - 2 * margin);
    return;
  }

  if (selectedSymbol) {
    const info = SYMBOL_INFO[selectedSymbol];
    fill('black');
    text(info.title + ' — ' + info.body, margin, y, canvasWidth - 2 * margin);
    return;
  }

  fill('dimgray');
  let msg;
  if (trayPick === 'wire') {
    msg = wireStart
      ? 'Now click the other end of this jumper — a part, the + rail or the − rail.'
      : 'Jumper selected. Click one end, then the other. Ends can be a placed part or a power rail.';
  } else if (trayPick) {
    msg = 'Click a tie column on the board to seat the ' + trayPick + '.';
  } else {
    msg = 'Click a schematic symbol to read its role, or pick a part from the tray to place it.';
  }
  text(msg, margin, y, canvasWidth - 2 * margin);
}

function drawControlLabels() {
  // Both controls carry their own labels.
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0 || mouseY > drawHeight) return;

  // Tray
  for (const key in trayBoxes) {
    const b = trayBoxes[key];
    if (inRect(b, mouseX, mouseY)) {
      if (key !== 'wire' && placed[key] !== null) return;   // already seated
      trayPick = (trayPick === key) ? null : key;
      wireStart = null;
      feedback = null;
      return;
    }
  }

  // Schematic symbols
  for (const key in symbolBoxes) {
    if (inRect(symbolBoxes[key], mouseX, mouseY)) {
      selectedSymbol = (selectedSymbol === key) ? null : key;
      feedback = null;
      return;
    }
  }

  // Board interactions
  if (trayPick === 'resistor' || trayPick === 'led') {
    const col = columnAt(mouseX, mouseY);
    if (col > 0) placePart(trayPick, col);
    return;
  }

  if (trayPick === 'wire') {
    const ep = endpointAt(mouseX, mouseY);
    if (!ep) return;
    if (!wireStart) {
      wireStart = ep;
    } else if (!sameEndpoint(wireStart, ep)) {
      wires.push({ a: wireStart, b: ep });
      wireStart = null;
      feedback = null;
    }
  }
}

// Nearest tie column to the pointer, if the pointer is over the terminal strip.
function columnAt(px, py) {
  const yTop = bbRowY('a') - BB.pitch;
  const yBot = bbRowY('e') + BB.pitch;
  if (py < yTop || py > yBot) return -1;
  for (let c = 2; c <= COLS - 1; c++) {
    if (abs(px - bbColX(c)) <= BB.pitch * 0.6) return c;
  }
  return -1;
}

// A jumper end is either a seated part's column or a point on a power rail.
function endpointAt(px, py) {
  for (const kind of ['resistor', 'led']) {
    if (placed[kind] === null) continue;
    if (dist(px, py, bbColX(placed[kind]), bbRowY('c')) <= BB.pitch) {
      return { kind: kind };
    }
  }
  for (const row of ['T+', 'T-', 'B+', 'B-']) {
    if (abs(py - bbRowY(row)) <= BB.pitch * 0.7) {
      for (let c = 2; c <= COLS - 1; c++) {
        if (abs(px - bbColX(c)) <= BB.pitch * 0.6) {
          return { kind: 'rail', row: row, col: c };
        }
      }
    }
  }
  return null;
}

function sameEndpoint(a, b) {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'rail') return a.row === b.row && a.col === b.col;
  return true;
}

// Placing a part: the one rule that actually matters here is that the resistor
// and the LED cannot share a tie column, because that shorts them together.
function placePart(kind, col) {
  const other = kind === 'resistor' ? 'led' : 'resistor';
  if (placed[other] === col) {
    feedback = { ok: false, msg: 'A resistor and an LED both need their own row — ' +
                                 'sharing a row shorts them together.' };
    return;
  }
  placed[kind] = col;
  trayPick = null;
  feedback = null;
}

// ---------------------------------------------------------------------------
// Checking
// ---------------------------------------------------------------------------

function checkWiring() {
  if (placed.resistor === null || placed.led === null) {
    feedback = { ok: false, msg: 'Place both the resistor and the LED before checking.' };
    return;
  }

  // Reset any previous red marks
  for (const w of wires) w.bad = false;

  const missing = [];

  if (!hasWire(ep => ep.kind === 'rail' && isPlus(ep.row), ep => ep.kind === 'resistor')) {
    missing.push('power (+ rail) to the resistor');
  }
  if (!hasWire(ep => ep.kind === 'resistor', ep => ep.kind === 'led')) {
    missing.push('the resistor to the LED');
  }
  if (!hasWire(ep => ep.kind === 'led', ep => ep.kind === 'rail' && isMinus(ep.row))) {
    missing.push('the LED to ground (− rail)');
  }

  // A jumper straight from + to − is the classic short
  for (const w of wires) {
    const a = w.a, b = w.b;
    if (a.kind === 'rail' && b.kind === 'rail' &&
        ((isPlus(a.row) && isMinus(b.row)) || (isMinus(a.row) && isPlus(b.row)))) {
      w.bad = true;
      feedback = { ok: false, msg: 'That jumper connects + straight to − — a short across ' +
                                   'the supply. Remove it before powering anything.' };
      return;
    }
  }

  if (missing.length === 0) {
    feedback = { ok: true, msg: 'Correct — this layout matches the schematic: power to the ' +
                                'resistor, the resistor to the LED, the LED to ground.' };
  } else {
    feedback = { ok: false, msg: 'Not finished yet. Still missing: ' + missing.join('; ') + '.' };
  }
}

function hasWire(matchA, matchB) {
  return wires.some(w => (matchA(w.a) && matchB(w.b)) || (matchA(w.b) && matchB(w.a)));
}

function isPlus(row)  { return row === 'T+' || row === 'B+'; }
function isMinus(row) { return row === 'T-' || row === 'B-'; }

function newCircuit() {
  variant = (variant + 1) % CIRCUITS.length;
  placed = { resistor: null, led: null };
  wires = [];
  wireStart = null;
  trayPick = null;
  selectedSymbol = null;
  feedback = null;
}

function inRect(r, px, py) {
  return r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
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
