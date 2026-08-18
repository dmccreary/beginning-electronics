// Pull-Up and Pull-Down Resistor Explorer
// CANVAS_HEIGHT: 490
// Bloom Level: Understand (L2) / Apply (L3) - Verb: explain, demonstrate
// Learning objective: Given a rendered breadboard circuit with a push button, a
// resistor, and a HIGH/LOW state indicator, and a toggle between pull-up and
// pull-down wiring, predict and then observe the indicator's state in each of
// the four combinations of wiring style and button state.
//
// The four cases:
//   pull-up,   released -> HIGH  (resistor holds the node at the supply)
//   pull-up,   pressed  -> LOW   (button ties the node straight to ground)
//   pull-down, released -> LOW   (resistor holds the node at ground)
//   pull-down, pressed  -> HIGH  (button ties the node straight to the supply)
//
// The point the sim has to land is that the node is NEVER floating: in all four
// cases something defines it. Board rendering comes from breadboard-lib.js.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let modeSelect;
let resetButton;

// ---- State ----
let mode = 'pullup';         // 'pullup' | 'pulldown'
let pressed = false;         // true only while the mouse is held on the button
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverPart = null;        // 'resistor' | 'buttonWire' | null
let buttonHit = null;
let spots = {};
let panel = {};

const COLS = 20;
const RES_COL = 6;
const NODE_COL = 10;
const BTN_COL = 14;

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
  canvas.mouseOut(() => { mouseOverCanvas = false; pressed = false; });

  modeSelect = createSelect();
  modeSelect.position(90, drawHeight + 10);
  modeSelect.option('Pull-Up');
  modeSelect.option('Pull-Down');
  modeSelect.selected('Pull-Up');
  modeSelect.changed(() => mode = modeSelect.value() === 'Pull-Up' ? 'pullup' : 'pulldown');

  resetButton = createButton('Reset');
  resetButton.position(230, drawHeight + 10);
  resetButton.mousePressed(resetAll);

  describe('A breadboard circuit with a push button, a resistor and a HIGH/LOW ' +
           'indicator. A menu switches between pull-up and pull-down wiring, ' +
           'redrawing the resistor to the supply rail or the ground rail. ' +
           'Holding the mouse on the push button changes the indicator and the ' +
           'animated current flow in real time.', LABEL);
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
  text('Pull-Up vs Pull-Down', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  let boardX, boardY, boardW, boardH;

  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.48;
    panel = { x: margin, y: boardY + boardH + 6, w: canvasWidth - 2 * margin,
              h: drawHeight - boardY - boardH - 12 };
  } else {
    boardX = margin; boardY = 30;
    boardW = canvasWidth * 0.58;
    boardH = drawHeight - 44;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 44 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  if (mouseOverCanvas) flowPhase += 0.014;

  const high = isHigh();
  drawCircuit(high);
  drawPanel(high);
  drawControlLabels();
}

// The whole logic of the sim, in one function.
function isHigh() {
  if (mode === 'pullup') return !pressed;
  return pressed;
}

// ---------------------------------------------------------------------------
// The circuit
// ---------------------------------------------------------------------------

function drawCircuit(high) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const rowY = bbRowY('c');

  const xRes = bbColX(RES_COL);
  const xNode = bbColX(NODE_COL);
  const xBtn = bbColX(BTN_COL);

  const pullUp = mode === 'pullup';

  // The resistor ties the node to whichever rail the mode names, and the
  // button ties it to the other rail when pressed.
  const resRail = pullUp ? railPlus : railMinus;
  const btnRail = pullUp ? railMinus : railPlus;
  const resColor = pullUp ? 'crimson' : 'dimgray';
  const btnColor = pullUp ? 'dimgray' : 'crimson';

  // Resistor leg: from its rail down to the node row
  stroke(hoverPart === 'resistor' ? '#E8710A' : resColor);
  strokeWeight(3);
  noFill();
  line(xRes, resRail, xRes, rowY);
  drawResistorGlyph(xRes, (resRail + rowY) / 2, hoverPart === 'resistor');
  spots.resistor = { x: xRes - 14, y: min(resRail, rowY), w: 28, h: abs(rowY - resRail) };

  // Node rail across row c
  stroke(high ? 'seagreen' : 'steelblue');
  strokeWeight(4);
  line(xRes, rowY, xBtn, rowY);

  // Button leg: from the node row to the other rail
  stroke(hoverPart === 'buttonWire' ? '#E8710A' : btnColor);
  strokeWeight(3);
  if (pressed) {
    line(xBtn, rowY, xBtn, btnRail);
  } else {
    // An open button shows a visible gap, so "not connected" is obvious
    const midY = (rowY + btnRail) / 2;
    line(xBtn, rowY, xBtn, midY - 7);
    line(xBtn, midY + 7, xBtn, btnRail);
  }
  spots.buttonWire = { x: xBtn - 14, y: min(rowY, btnRail), w: 28, h: abs(btnRail - rowY) };

  // The push button itself, drawn at the node row
  const btnY = (rowY + btnRail) / 2;
  buttonHit = { x: xBtn - 20, y: btnY - 16, w: 40, h: 32 };
  noStroke();
  fill(pressed ? 'darkorange' : 'gainsboro');
  rect(buttonHit.x, buttonHit.y, buttonHit.w, buttonHit.h, 5);
  fill(pressed ? 'saddlebrown' : 'darkslategray');
  circle(xBtn, btnY, 15);
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text(pressed ? 'pressed' : 'hold me', xBtn, buttonHit.y + buttonHit.h + 2);

  // Current only flows when the button completes a path between the rails.
  if (pressed) drawFlow(xRes, resRail, xBtn, btnRail, rowY);

  // The node tap and indicator
  noStroke();
  fill(high ? 'seagreen' : 'steelblue');
  circle(xNode, rowY, 12);
  drawIndicator(xNode, rowY - BB.pitch * 2.6, high);

  // Rail labels
  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('+V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  hoverPart = null;
  for (const k in spots) {
    const s = spots[k];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) hoverPart = k;
  }
}

function drawResistorGlyph(x, y, active) {
  noStroke();
  fill('wheat');
  rect(x - 8, y - 16, 16, 32, 3);
  fill('saddlebrown'); rect(x - 8, y - 10, 16, 3);
  fill('black');       rect(x - 8, y - 2, 16, 3);
  fill('firebrick');   rect(x - 8, y + 6, 16, 3);
  if (active) {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(x - 11, y - 19, 22, 38, 4);
  }
}

function drawIndicator(x, y, high) {
  const col = high ? 'seagreen' : 'steelblue';
  noStroke();
  fill(high ? 'rgba(46,139,87,0.25)' : 'rgba(70,130,180,0.25)');
  circle(x, y, 42 + sin(flowPhase * 4) * 3);
  fill(col);
  circle(x, y, 26);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(12);
  text(high ? 'HIGH' : 'LOW', x, y);
}

function drawFlow(xRes, resRail, xBtn, btnRail, rowY) {
  const legs = [
    [xRes, resRail, xRes, rowY],
    [xRes, rowY, xBtn, rowY],
    [xBtn, rowY, xBtn, btnRail]
  ];
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);

  const dots = 8;
  noStroke();
  fill('darkorange');
  for (let i = 0; i < dots; i++) {
    let d = ((flowPhase + i / dots) % 1) * total;
    for (const l of legs) {
      const len = dist(l[0], l[1], l[2], l[3]);
      if (d <= len) {
        const t = len === 0 ? 0 : d / len;
        circle(lerp(l[0], l[2], t), lerp(l[1], l[3], t), 6);
        break;
      }
      d -= len;
    }
  }
}

// ---------------------------------------------------------------------------
// Side panel
// ---------------------------------------------------------------------------

function drawPanel(high) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(15);
  text(mode === 'pullup' ? 'Pull-Up wiring' : 'Pull-Down wiring', padX, ty);
  ty += 22;

  fill('dimgray');
  textSize(13);
  text(mode === 'pullup'
    ? 'The resistor connects this wire to +V, and the button connects it to ground.'
    : 'The resistor connects this wire to ground, and the button connects it to +V.',
    padX, ty, innerW);
  ty += 40;

  // The live state sentence
  fill(high ? 'darkgreen' : 'steelblue');
  textSize(17);
  text('The wire is ' + (high ? 'HIGH' : 'LOW'), padX, ty);
  ty += 24;

  fill('black');
  textSize(13);
  text(stateExplanation(), padX, ty, innerW);
  ty += 56;

  // Hover explanation for a specific part
  if (hoverPart) {
    fill('#E8710A');
    textSize(13);
    text(hoverExplanation(), padX, ty, innerW);
    ty += 56;
  }

  // The four-case table, with the current case marked
  fill('black');
  textSize(13);
  text('All four cases', padX, ty);
  ty += 18;
  const rows = [
    ['pull-up', 'released', 'HIGH'],
    ['pull-up', 'pressed', 'LOW'],
    ['pull-down', 'released', 'LOW'],
    ['pull-down', 'pressed', 'HIGH']
  ];
  const modeName = mode === 'pullup' ? 'pull-up' : 'pull-down';
  const btnName = pressed ? 'pressed' : 'released';
  textSize(12);
  for (const r of rows) {
    const isNow = r[0] === modeName && r[1] === btnName;
    fill(isNow ? '#E8710A' : 'gray');
    text((isNow ? '▸ ' : '   ') + r[0] + ', ' + r[1] + ' → ' + r[2], padX, ty, innerW);
    ty += 16;
  }
}

function stateExplanation() {
  if (mode === 'pullup') {
    return pressed
      ? 'The button is closed, so it ties the wire straight to ground. That beats the resistor, and the wire reads LOW.'
      : 'The resistor connects this wire to power, so it rests HIGH until the button pulls it to ground.';
  }
  return pressed
    ? 'The button is closed, so it ties the wire straight to +V. That beats the resistor, and the wire reads HIGH.'
    : 'The resistor connects this wire to ground, so it rests LOW until the button pulls it up to +V.';
}

function hoverExplanation() {
  if (hoverPart === 'resistor') {
    return mode === 'pullup'
      ? 'This resistor is the pull-up. When the button is open it is the only thing touching the wire, so it decides the state — the wire is never left floating.'
      : 'This resistor is the pull-down. When the button is open it is the only thing touching the wire, so it decides the state — the wire is never left floating.';
  }
  if (hoverPart === 'buttonWire') {
    return pressed
      ? 'With the button closed this wire is a near-zero-resistance path to the rail, which overrides the resistor completely.'
      : 'With the button open this wire goes nowhere, so it has no say in the state at all.';
  }
  return '';
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Wiring:', 10, drawHeight + 25);
  fill('dimgray');
  textSize(13);
  text('Hold the mouse on the push button to press it.', 300, drawHeight + 25);
}

// ---------------------------------------------------------------------------
// Interaction - press and hold
// ---------------------------------------------------------------------------

function mousePressed() {
  if (buttonHit && mouseX >= buttonHit.x && mouseX <= buttonHit.x + buttonHit.w &&
      mouseY >= buttonHit.y && mouseY <= buttonHit.y + buttonHit.h) {
    pressed = true;
  }
}

function mouseReleased() {
  pressed = false;
}

function resetAll() {
  mode = 'pullup';
  modeSelect.selected('Pull-Up');
  pressed = false;
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
