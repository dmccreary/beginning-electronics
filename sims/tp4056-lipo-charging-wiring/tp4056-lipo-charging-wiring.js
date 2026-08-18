// TP4056 LiPo Charging Circuit Wiring
// CANVAS_HEIGHT: 590
// Bloom Level: Understand (L2) / Apply (L3) - Verb: identify, demonstrate
// Learning objective: Given a wiring diagram of a TP4056 charger module, a
// single-cell LiPo battery and a project board, identify which pads the
// battery and the load connect to, plug and unplug the USB supply, and
// observe the charge current, the status LEDs and the cell voltage respond -
// including what goes wrong when the project board is wired to B+/B- instead
// of OUT+/OUT-.
//
// The three pad pairs the diagram exists to teach, in the order they actually
// appear on the board (see docs/img/tp4056-lipo-recharger.jpg):
//
//   + / -        (left edge, beside the USB jack) 5 V in. The same node as
//                the jack, so feed one or the other, never both.
//   B+ / B-      (inner pair, right edge) the cell itself. Red to B+, black
//                to B-. Nothing else belongs on these two pads.
//   OUT+ / OUT-  (outer pair, right edge) the project board. On a protected
//                module these sit behind the DW01A + FS8205 pair, so an empty
//                cell is disconnected before it is damaged. Wire the load to
//                B+ instead and that protection is bypassed - which is what
//                the "common mistake" checkbox demonstrates.
//
// Model:
//   I_BAT = 1200 / R_PROG        (R_PROG in ohms, I_BAT in amps)
//   constant current until the cell nears 4.2 V, then a tapering
//   constant-voltage phase, then charging stops on its own.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 150;     // 4 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let controlLeftMargin = 210;
let defaultTextSize = 16;

// ---- Controls ----
let usbButton, resetButton, drainButton, progSelect, loadCheckbox, mistakeCheckbox;

// ---- State ----
let usbPlugged = true;
let charge = 35;             // percent
let overDischarged = false;
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverPart = null;
let spots = {};
let geo = {};

const LOAD_MA = 120;         // a small project board: microcontroller + LED
const RATE = 0.00011;        // percent of a ~1000 mAh cell per frame per mA
const CC_END = 75;           // percent where the constant-voltage taper starts
const V_EMPTY = 3.30;
const V_FULL = 4.20;

// R_PROG sets the charge current: I = 1200 / R_PROG. Modules ship with 1.2 k.
const PROG = [
  { label: '1.2k ohm = 1000 mA (as shipped)', ma: 1000 },
  { label: '2k ohm = 600 mA', ma: 600 },
  { label: '5k ohm = 240 mA', ma: 240 },
  { label: '10k ohm = 120 mA', ma: 120 }
];

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
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  usbButton = createButton('Unplug USB');
  usbButton.position(10, drawHeight + 8);
  usbButton.mousePressed(() => {
    usbPlugged = !usbPlugged;
    usbButton.html(usbPlugged ? 'Unplug USB' : 'Plug in USB');
  });

  resetButton = createButton('Reset');
  resetButton.position(140, drawHeight + 8);
  resetButton.mousePressed(() => {
    usbPlugged = true;
    usbButton.html('Unplug USB');
    charge = 35;
    overDischarged = false;
    progSelect.selected(PROG[0].label);
    loadCheckbox.checked(true);
    mistakeCheckbox.checked(false);
  });

  // A 120 mA load takes minutes to flatten a cell in real time, so give the
  // learner a way to jump to the interesting moment.
  drainButton = createButton('Fast-forward to nearly empty');
  drainButton.position(215, drawHeight + 8);
  drainButton.mousePressed(() => { charge = 4; overDischarged = false; });

  progSelect = createSelect();
  progSelect.position(controlLeftMargin, drawHeight + 45);
  for (const p of PROG) progSelect.option(p.label);
  progSelect.selected(PROG[0].label);

  loadCheckbox = createCheckbox(' Project board switched on', true);
  loadCheckbox.position(10, drawHeight + 80);

  mistakeCheckbox = createCheckbox(' Wire the project board to B+/B- instead (common mistake)', false);
  mistakeCheckbox.position(10, drawHeight + 113);

  describe('A wiring diagram of a TP4056 charging module. A 5 V USB supply ' +
           'feeds the module through its micro-USB jack, a single-cell LiPo ' +
           'battery connects to the B+ and B- pads, and a project board ' +
           'connects to the OUT+ and OUT- pads. Buttons plug and unplug the ' +
           'USB supply, a menu sets the charge current, and a checkbox ' +
           'rewires the project board to the battery pads to show why that ' +
           'is unsafe.', LABEL);
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

  // ---- The model ----
  const prog = PROG[max(0, PROG.findIndex(p => p.label === progSelect.value()))];
  const loadOn = loadCheckbox.checked();
  const mistake = mistakeCheckbox.checked();
  const vbat = V_EMPTY + (V_FULL - V_EMPTY) * (charge / 100);
  const full = charge >= 99.5;

  // A protected module disconnects OUT when the cell runs empty. Wired
  // straight to B+, nothing does that job.
  const protectionCut = !mistake && !usbPlugged && charge <= 0.5;
  const loadMa = loadOn && !protectionCut ? LOAD_MA : 0;

  let chargeMa = 0;
  if (usbPlugged && !full) {
    const taper = charge <= CC_END
      ? 1
      : max(0.08, 1 - ((charge - CC_END) / (100 - CC_END)) * 0.92);
    chargeMa = prog.ma * taper;
  }

  // The charger's current is shared: whatever the project board draws is
  // current that never reaches the cell.
  const batteryMa = (usbPlugged ? chargeMa : 0) - loadMa;

  if (mouseOverCanvas) {
    flowPhase += 0.02;
    charge = constrain(charge + batteryMa * RATE, 0, 100);
    if (mistake && !usbPlugged && loadMa > 0 && charge <= 0) overDischarged = true;
    if (charge > 5) overDischarged = false;
  }

  layout();

  // Title
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(20);
  text('TP4056 Charging Circuit Wiring', canvasWidth / 2, 6);

  drawWiring(chargeMa, loadMa, mistake);
  drawUsbSupply();
  drawModule(chargeMa, full);
  drawBattery();
  drawProjectBoard(loadMa > 0);
  drawInfoPanel(chargeMa, loadMa, batteryMa, vbat, full, protectionCut, mistake);
  drawControlLabels();

  // Hover test runs against the hit boxes registered while drawing.
  hoverPart = null;
  for (const k in spots) {
    const s = spots[k];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) hoverPart = k;
  }
}

// ---------------------------------------------------------------------------
// Layout - USB on the left, module, cell, project board, left to right
// ---------------------------------------------------------------------------

function layout() {
  geo.tight = canvasWidth < 640;          // phone-width: fewer labels, tighter parts
  geo.stripH = geo.tight ? 150 : 118;
  geo.top = 30;
  geo.bot = drawHeight - geo.stripH - 12;
  const span = geo.bot - geo.top;
  geo.midY = (geo.top + geo.bot) / 2;

  geo.usbW = constrain(canvasWidth * 0.075, 34, 58);
  geo.usbX = margin + geo.usbW / 2 + 2;
  geo.usbY = geo.midY;

  geo.modW = constrain(canvasWidth * 0.25, 100, 200);
  geo.modH = min(128, span * 0.60);
  geo.modX = canvasWidth * (geo.tight ? 0.33 : 0.305);
  geo.modY = geo.midY;
  geo.modL = geo.modX - geo.modW / 2;
  geo.modR = geo.modX + geo.modW / 2;

  geo.batW = constrain(canvasWidth * 0.115, 58, 92);
  geo.batH = geo.batW * 0.66;
  geo.batX = canvasWidth * 0.585;
  geo.batY = geo.midY;
  geo.batL = geo.batX - geo.batW / 2;
  geo.batR = geo.batX + geo.batW / 2;

  geo.brdW = constrain(canvasWidth * 0.15, 74, 120);
  geo.brdH = min(96, span * 0.52);
  geo.brdX = canvasWidth - margin - geo.brdW / 2 - 4;
  geo.brdY = geo.midY;
  geo.brdL = geo.brdX - geo.brdW / 2;

  // Pads, in the order they sit on the real board's right edge
  geo.padOutPlus = geo.modY - geo.modH * 0.31;
  geo.padBPlus = geo.modY - geo.modH * 0.11;
  geo.padBMinus = geo.modY + geo.modH * 0.11;
  geo.padOutMinus = geo.modY + geo.modH * 0.31;
  geo.padInPlus = geo.modY - geo.modH * 0.34;
  geo.padInMinus = geo.modY + geo.modH * 0.34;
  geo.usbJack = geo.modY;

  // Where the project board's two pins sit
  geo.brdPlusY = geo.brdY - geo.brdH * 0.28;
  geo.brdMinusY = geo.brdY + geo.brdH * 0.28;
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

function drawWiring(chargeMa, loadMa, mistake) {
  const charging = chargeMa > 0.5;

  // USB cable into the module's micro-USB jack
  const cable = [
    [geo.usbX + geo.usbW / 2, geo.usbY],
    [geo.modL, geo.usbJack]
  ];
  drawWire(cable, usbPlugged ? '#5A6570' : '#C3C9CF', 5);

  // The cell: B+ and B- run straight across to it, and nothing else touches
  // these two pads.
  const batPlus = [[geo.modR, geo.padBPlus], [geo.batL - 12, geo.padBPlus]];
  const batMinus = [[geo.modR, geo.padBMinus], [geo.batL - 12, geo.padBMinus]];
  drawWire(batPlus, 'crimson', 3);
  drawWire(batMinus, '#2E2E2E', 3);

  // The project board: OUT+ arcs over the cell and OUT- under it, so the
  // module always sits between the cell and the load.
  const yOver = geo.top + 12;
  const yUnder = geo.bot - 12;
  const xa = lerp(geo.modR, geo.batL, 0.55);
  const xb = lerp(geo.modR, geo.batL, 0.30);
  const xc = lerp(geo.batR, geo.brdL, 0.55);
  const xd = lerp(geo.batR, geo.brdL, 0.30);

  let loadPlus, loadMinus;
  if (mistake) {
    loadPlus = [[geo.modR, geo.padBPlus], [xb, geo.padBPlus + 5], [xb, yUnder], [xc, yUnder], [xc, geo.brdPlusY], [geo.brdL, geo.brdPlusY]];
    loadMinus = [[geo.modR, geo.padBMinus], [xa, geo.padBMinus + 5], [xa, yUnder - 14], [xd, yUnder - 14], [xd, geo.brdMinusY], [geo.brdL, geo.brdMinusY]];
  } else {
    loadPlus = [[geo.modR, geo.padOutPlus], [xa, geo.padOutPlus], [xa, yOver], [xc, yOver], [xc, geo.brdPlusY], [geo.brdL, geo.brdPlusY]];
    loadMinus = [[geo.modR, geo.padOutMinus], [xb, geo.padOutMinus], [xb, yUnder], [xd, yUnder], [xd, geo.brdMinusY], [geo.brdL, geo.brdMinusY]];
  }
  drawWire(loadPlus, mistake ? '#D2452F' : 'crimson', 3);
  drawWire(loadMinus, '#2E2E2E', 3);

  // Say out loud where each pair of wires is going. On a phone-width canvas
  // these labels have nowhere to sit without landing on a part, so the pad
  // silkscreen and the hover notes carry that job instead.
  noStroke();
  fill('#5A6570');
  textSize(10);
  textAlign(CENTER, BOTTOM);
  if (!geo.tight) text('5 V in', (geo.usbX + geo.usbW / 2 + geo.modL) / 2, geo.usbY - 6);
  if (!mistake && !geo.tight) {
    textAlign(CENTER, TOP);
    text('to the cell', (geo.modR + geo.batL) / 2, geo.padBMinus + 7);
    textAlign(CENTER, BOTTOM);
    text('OUT+ to the project board', (xa + xc) / 2, yOver - 5);
    textAlign(CENTER, TOP);
    text('OUT- to the project board', (xb + xd) / 2, yUnder + 5);
  }

  if (mistake) {
    noFill();
    stroke('#D2452F');
    strokeWeight(2);
    drawingContext.setLineDash([5, 4]);
    rect(geo.modR - 10, geo.padBPlus - 12, 26, geo.padBMinus - geo.padBPlus + 24, 4);
    drawingContext.setLineDash([]);
    noStroke();
    fill('#C62828');
    textAlign(CENTER, BOTTOM);
    textSize(10);
    text('load on the cell - no protection', (geo.modR + geo.brdL) / 2, yUnder + 16);
  }

  // Animated current
  if (charging) drawFlow(legsFrom(cable).concat(legsFrom(batPlus)), 6, 'crimson');
  if (loadMa > 0) {
    const source = usbPlugged
      ? legsFrom(loadPlus)
      : legsFrom(batPlus.slice().reverse()).concat(legsFrom(loadPlus));
    drawFlow(source, 6, 'darkorange');
  }
}

function drawWire(pts, col, w) {
  stroke(col);
  strokeWeight(w);
  noFill();
  for (let i = 0; i < pts.length - 1; i++) line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
}

function legsFrom(pts) {
  const legs = [];
  for (let i = 0; i < pts.length - 1; i++) legs.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]]);
  return legs;
}

function drawFlow(legs, size, col) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(3, floor(total / 34));
  noStroke();
  fill(col);
  for (let i = 0; i < dots; i++) {
    let d = ((flowPhase + i / dots) % 1) * total;
    for (const l of legs) {
      const len = dist(l[0], l[1], l[2], l[3]);
      if (d <= len) {
        const t = len === 0 ? 0 : d / len;
        circle(lerp(l[0], l[2], t), lerp(l[1], l[3], t), size);
        break;
      }
      d -= len;
    }
  }
}

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

function drawUsbSupply() {
  const w = geo.usbW, h = w * 1.1;
  const x = geo.usbX, y = geo.usbY;

  fill(usbPlugged ? '#F0F2F5' : '#E2E5E9');
  stroke('#9AA3AC');
  strokeWeight(1);
  rect(x - w / 2, y - h / 2, w, h, 4);
  strokeWeight(3);
  line(x - w / 2 - 7, y - 6, x - w / 2, y - 6);
  line(x - w / 2 - 7, y + 6, x - w / 2, y + 6);

  noStroke();
  fill(usbPlugged ? '#2E7D32' : '#9AA3AC');
  circle(x, y - 6, 7);
  fill('#3A4650');
  textAlign(CENTER, CENTER);
  textSize(9);
  text('5 V', x, y + 8);

  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text(usbPlugged ? 'USB supply' : 'unplugged', x, y + h / 2 + 5);

  spots.usb = { x: x - w / 2 - 7, y: y - h / 2, w: w + 14, h: h };
  if (hoverPart === 'usb') highlight(spots.usb);
}

function drawModule(chargeMa, full) {
  const x = geo.modX, y = geo.modY, w = geo.modW, h = geo.modH;

  // PCB, drawn to match the photograph: blue board, micro-USB jack on the
  // left edge, charge chip in the middle, protection pair on the right.
  noStroke();
  fill('#1567A8');
  rect(geo.modL, y - h / 2, w, h, 4);
  fill('#0E4D80');
  rect(geo.modL, y - h / 2, w, 14, 4);
  fill('#E4EDF5');
  textAlign(CENTER, CENTER);
  textSize(10);
  text(geo.tight ? 'TP4056 module' : 'TP4056 charger module', x, y - h / 2 + 7);

  // micro-USB jack
  fill('#C6CDD5');
  rect(geo.modL - 5, geo.usbJack - 9, 18, 18, 2);
  fill('#8B949C');
  rect(geo.modL - 2, geo.usbJack - 5, 11, 10, 1);

  // TP4056 chip
  fill('#22262B');
  rect(x - w * 0.14, y - 12, w * 0.24, 24, 2);
  fill('#C6CDD5');
  textSize(8);
  text('4056E', x - w * 0.02, y);

  // protection pair (DW01A + FS8205) between the chip and the OUT pads.
  // At phone width the pad silkscreen needs that space more than the chips do.
  if (!geo.tight) {
    fill('#22262B');
    rect(x + w * 0.17, y - 20, w * 0.16, 15, 2);
    rect(x + w * 0.17, y + 5, w * 0.16, 15, 2);
    fill('#8B949C');
    textSize(7);
    text('DW01', x + w * 0.25, y - 12);
    text('8205', x + w * 0.25, y + 13);
  }

  // R_PROG
  fill('#D8C9A8');
  rect(x - w * 0.13, y + 22, 20, 9, 2);
  fill('#3A2E1E');
  textSize(7);
  text('121', x - w * 0.13 + 10, y + 26);
  if (!geo.tight) {
    fill('#E4EDF5');
    textSize(8);
    textAlign(LEFT, CENTER);
    text('R_PROG', x - w * 0.13 + 24, y + 26);
  }

  // Status LEDs
  const charging = chargeMa > 0.5;
  const ledSpread = w * (geo.tight ? 0.20 : 0.10);
  drawStatusLed(x - ledSpread, y - h / 2 + 26, charging ? '#E5342A' : '#4A5259', 'CHRG');
  drawStatusLed(x + ledSpread, y - h / 2 + 26, (usbPlugged && full) ? '#3FA9F5' : '#4A5259', 'STDBY');

  // Pads, in the board's real order
  pad(geo.modL, geo.padInPlus, '+', 'left');
  pad(geo.modL, geo.padInMinus, '-', 'left');
  pad(geo.modR, geo.padOutPlus, 'OUT+', 'right');
  pad(geo.modR, geo.padBPlus, 'B+', 'right');
  pad(geo.modR, geo.padBMinus, 'B-', 'right');
  pad(geo.modR, geo.padOutMinus, 'OUT-', 'right');

  spots.chip = { x: x - w * 0.16, y: y - 14, w: w * 0.28, h: 28 };
  spots.protect = { x: x + w * 0.15, y: y - 22, w: w * 0.20, h: 44 };
  spots.rprog = { x: x - w * 0.15, y: y + 20, w: 24, h: 14 };
  spots.leds = { x: x - w * 0.18, y: y - h / 2 + 18, w: w * 0.36, h: 20 };
  spots.padsIn = { x: geo.modL - 9, y: geo.padInPlus - 8, w: 30, h: geo.padInMinus - geo.padInPlus + 16 };
  spots.padsB = { x: geo.modR - 24, y: geo.padBPlus - 8, w: 32, h: geo.padBMinus - geo.padBPlus + 16 };
  spots.padsOutTop = { x: geo.modR - 30, y: geo.padOutPlus - 8, w: 38, h: 16 };
  spots.padsOutBot = { x: geo.modR - 30, y: geo.padOutMinus - 8, w: 38, h: 16 };
  for (const k of ['chip', 'protect', 'rprog', 'leds', 'padsIn', 'padsB', 'padsOutTop', 'padsOutBot']) {
    if (hoverPart === k) highlight(spots[k]);
  }
}

function drawStatusLed(x, y, col, label) {
  noStroke();
  fill(col);
  circle(x, y, 8);
  fill('#E4EDF5');
  textAlign(CENTER, CENTER);
  textSize(7);
  text(label, x, y + 10);
}

function pad(x, y, label, side) {
  noStroke();
  fill('#D4A93C');
  rect(x - 7, y - 5, 14, 10, 2);
  fill('#E4EDF5');
  textSize(9);
  textAlign(side === 'left' ? LEFT : RIGHT, CENTER);
  text(label, side === 'left' ? x + 10 : x - 10, y);
}

function drawBattery() {
  const w = geo.batW, h = geo.batH, x = geo.batX, y = geo.batY;

  // JST plug and the cell's two wire tails
  fill('#EFEFEF');
  stroke('#9AA3AC');
  strokeWeight(1);
  rect(geo.batL - 12, y - 14, 12, 28, 2);

  noStroke();
  fill(overDischarged ? '#7A4B58' : '#8A6FC4');
  rect(x - w / 2, y - h / 2, w, h, 4);
  fill('#3A3050');
  rect(x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12, 2);
  fill(charge > 80 ? '#4CD07A' : (charge > 25 ? '#F5C542' : '#E5654B'));
  rect(x - w / 2 + 6, y - h / 2 + 6, (w - 12) * (charge / 100), h - 12, 2);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(10);
  text(nf(charge, 1, 0) + '%', x, y);

  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text('3.7 V LiPo cell', x, y + h / 2 + 5);

  spots.battery = { x: geo.batL - 14, y: y - h / 2 - 4, w: w + 20, h: h + 8 };
  if (hoverPart === 'battery') highlight(spots.battery);
}

function drawProjectBoard(powered) {
  const w = geo.brdW, h = geo.brdH, x = geo.brdX, y = geo.brdY;

  noStroke();
  fill('#1E6B3A');
  rect(x - w / 2, y - h / 2, w, h, 3);

  // header pins the OUT wires land on
  fill('#D4A93C');
  rect(geo.brdL - 3, geo.brdPlusY - 4, 8, 8, 1);
  rect(geo.brdL - 3, geo.brdMinusY - 4, 8, 8, 1);

  fill('#22262B');
  rect(x - 10, y - 9, 24, 18, 2);
  if (powered) {
    fill(255, 210, 90, 110);
    circle(x + w * 0.28, y, 20);
  }
  fill(powered ? 'gold' : '#7E8891');
  circle(x + w * 0.28, y, 8);

  fill('#D8E2EC');
  textAlign(LEFT, CENTER);
  textSize(8);
  text('V+', geo.brdL + 8, geo.brdPlusY);
  text('GND', geo.brdL + 8, geo.brdMinusY);

  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text('your project board', x, y + h / 2 + 5);

  spots.board = { x: geo.brdL - 6, y: y - h / 2 - 4, w: w + 12, h: h + 8 };
  if (hoverPart === 'board') highlight(spots.board);
}

function highlight(s) {
  noFill();
  stroke('#E8710A');
  strokeWeight(2);
  rect(s.x, s.y, s.w, s.h, 4);
}

// ---------------------------------------------------------------------------
// Readouts
// ---------------------------------------------------------------------------

function drawInfoPanel(chargeMa, loadMa, batteryMa, vbat, full, protectionCut, mistake) {
  const px = margin, py = drawHeight - geo.stripH - 4;
  const pw = canvasWidth - 2 * margin, ph = geo.stripH;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(px, py, pw, ph, 8);

  const narrow = canvasWidth < 640;
  const cols = narrow ? 2 : 4;
  const colW = (pw - 24) / cols;
  const readouts = [
    ['USB INPUT', usbPlugged ? '5.0 V' : 'unplugged', usbPlugged ? 'black' : 'dimgray'],
    ['INTO THE CELL', nf(batteryMa, 1, 0) + ' mA', batteryMa > 0.5 ? 'darkgreen' : (batteryMa < -0.5 ? 'sienna' : 'dimgray')],
    ['CELL VOLTAGE', nf(vbat, 1, 2) + ' V', 'black'],
    ['PROJECT BOARD', loadMa > 0 ? loadMa + ' mA' : 'off', loadMa > 0 ? 'black' : 'dimgray']
  ];
  noStroke();
  for (let i = 0; i < readouts.length; i++) {
    const cx = px + 12 + (i % cols) * colW;
    const cy = py + 8 + floor(i / cols) * 34;
    textAlign(LEFT, TOP);
    fill('gray');
    textSize(10);
    text(readouts[i][0], cx, cy);
    fill(readouts[i][2]);
    textSize(15);
    text(readouts[i][1], cx, cy + 13);
  }

  const ty = py + 8 + (narrow ? 2 : 1) * 34 + 6;
  const tw = pw - 24;
  textAlign(LEFT, TOP);
  textSize(12);

  const notes = {
    usb: 'Any 5 V USB supply - a phone charger, a laptop port, a power bank. ' +
         'The module asks nothing else of it.',
    chip: 'The TP4056 chip itself. It watches the cell voltage and stops at ' +
          '4.2 V on its own, which is the whole reason a LiPo gets a charger ' +
          'built for its chemistry instead of any spare wall wart.',
    protect: 'The protection pair (DW01A + FS8205) that sits between the cell ' +
             'and the OUT pads. It disconnects the load when the cell runs ' +
             'empty and disconnects the cell if the load draws too much.',
    rprog: 'R_PROG sets the charge current: I = 1200 / R_PROG. The 1.2k ' +
           'resistor modules ship with (marked 121) means 1000 mA.',
    leds: 'Red CHRG means charging. Blue STDBY means done. Neither lit means ' +
          'no USB power is reaching the board.',
    padsIn: 'The + and - pads beside the jack are the same 5 V node as the ' +
            'jack itself - a solder-pad alternative to it, not an addition. ' +
            'Feed one or the other.',
    padsB: 'B+ / B- go to the cell and nothing else. Red wire to B+, black to ' +
           'B-. Reverse those two and the module is usually destroyed the ' +
           'instant power is applied.',
    padsOutTop: 'OUT+ / OUT- feed your project. They sit behind the ' +
                'protection chips, so the cell gets cut off before it is ' +
                'over-discharged.',
    padsOutBot: 'OUT+ / OUT- feed your project. They sit behind the ' +
                'protection chips, so the cell gets cut off before it is ' +
                'over-discharged.',
    battery: 'A single-cell LiPo: about 3.7 V nominal, 4.2 V full, and never ' +
             'to be run below roughly 3.0 V.',
    board: 'Whatever the battery is powering. It runs from OUT+/OUT-, so the ' +
           'module stays between your project and the cell.'
  };

  if (hoverPart && notes[hoverPart]) {
    fill('#E8710A');
    text(notes[hoverPart], px + 12, ty, tw);
    return;
  }

  if (overDischarged) {
    fill('#C62828');
    text('Over-discharged. Wired to B+/B-, the project board pulled the cell ' +
         'flat and kept pulling - the protection chips were never in the ' +
         'path. This is how a LiPo gets permanently damaged. Move the load ' +
         'to OUT+/OUT-.', px + 12, ty, tw);
  } else if (mistake) {
    fill('#B4650F');
    text('The project board is wired straight to B+/B-, bypassing the ' +
         'protection chips. It works - right up until the cell runs empty ' +
         'and nothing stops the load. Unplug the USB and watch.',
         px + 12, ty, tw);
  } else if (protectionCut) {
    fill('darkgreen');
    text('Empty - and the protection chips disconnected OUT+/OUT- on their ' +
         'own, before the cell was damaged. That is what wiring the load to ' +
         'OUT buys you. Plug the USB back in.', px + 12, ty, tw);
  } else if (usbPlugged && full) {
    fill('darkgreen');
    text('Charged. CHRG is off, STDBY is blue, and the charge current fell ' +
         'to zero on its own - the module stopped, not you.', px + 12, ty, tw);
  } else if (usbPlugged && chargeMa > 0.5 && batteryMa <= 0.5) {
    fill('sienna');
    text('The project board is drawing more than the charge current, so the ' +
         'cell is going down even with USB plugged in. Raise the charge ' +
         'current or switch the board off while it charges.', px + 12, ty, tw);
  } else if (usbPlugged) {
    fill('black');
    text('Charging. Current runs USB -> the module -> B+ -> the cell, and ' +
         'tapers off by itself as the cell nears 4.2 V.', px + 12, ty, tw);
  } else if (loadMa > 0) {
    fill('black');
    text('Unplugged - the project board is running from the cell, out ' +
         'through OUT+/OUT-. Watch the cell percentage fall.', px + 12, ty, tw);
  } else {
    fill('dimgray');
    text('Nothing plugged in, nothing switched on. Hover any part of the ' +
         'diagram to read what it does.', px + 12, ty, tw);
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Charge current (R_PROG):', 10, drawHeight + 57);
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
