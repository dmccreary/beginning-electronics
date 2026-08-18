// Transistor Switch Breadboard Demo
// CANVAS_HEIGHT: 530
// Bloom Level: Understand (L2) / Apply (L3) - Verb: demonstrate, predict, identify
// Learning objective: Given a rendered breadboard circuit with an NPN
// transistor, a base-current push button, a base resistor and a collector LED,
// predict and observe whether the LED lights when the base switch is open
// (cutoff) versus closed (saturation), and identify the base, collector and
// emitter leads on the rendered part.
//
// The whole idea the sim has to land: a tiny base current controls a much
// larger collector current. So the base wire animates a thin trickle of dots
// and the collector-emitter path animates a thick stream, at the same time.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 450;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let switchButton;
let typeSelect;
let resetButton;

// ---- State ----
let baseOn = false;          // starts in cutoff
let npn = true;
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverLead = null;
let leadSpots = {};
let panel = {};

const COLS = 20;
const SW_COL = 4;
const TR_COL = 11;
const LED_COL = 16;

function setup() {
  updateCanvasSize();
  // Cap the backing store at one device pixel per CSS pixel. At the Retina
  // default a full-width canvas asks the compositor for 4x the pixels every
  // frame, which can stall the compositor on a loaded machine.
  pixelDensity(1);

  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  switchButton = createButton('Base Switch: OFF');
  switchButton.position(10, drawHeight + 10);
  switchButton.mousePressed(toggleSwitch);

  resetButton = createButton('Reset');
  resetButton.position(160, drawHeight + 10);
  resetButton.mousePressed(resetAll);

  typeSelect = createSelect();
  typeSelect.position(90, drawHeight + 45);
  typeSelect.option('NPN');
  typeSelect.option('PNP');
  typeSelect.selected('NPN');
  typeSelect.changed(() => npn = typeSelect.value() === 'NPN');

  describe('A breadboard circuit with an NPN transistor in a TO-92 package, a ' +
           'base resistor and push-button switch feeding the base, and an LED ' +
           'on the collector side. Toggling the base switch lights the LED and ' +
           'animates a thin base current alongside a thick collector current. ' +
           'Hovering each lead names it and states its role.', LABEL);
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

  const conducting = baseOn;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Transistor as a Switch', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  let boardX, boardY, boardW, boardH;
  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.46;
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

  if (mouseOverCanvas && conducting) flowPhase += 0.016;

  drawCircuit(conducting);
  drawPanel(conducting);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(conducting) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const baseRow = bbRowY('b');
  const collRow = bbRowY('d');

  const xSw = bbColX(SW_COL);
  const xTr = bbColX(TR_COL);
  const xLed = bbColX(LED_COL);

  // ---- Base side: supply -> switch -> base resistor -> base pin ----
  // The switch and resistor both sit ON the base row rather than on the
  // vertical supply leg: that is where they would really go in series, and
  // the vertical leg passes through the board's column-number strip, where
  // any component drawn on it would cover the numbers.
  stroke(conducting ? 'crimson' : 'darkgray');
  strokeWeight(2);
  noFill();
  line(xSw, railPlus, xSw, baseRow);

  const swX = xSw + 34;
  drawSwitch(swX, baseRow, conducting);

  // Base resistor between the switch and the transistor's base
  drawSmallResistor((swX + xTr) / 2 + 6, baseRow, conducting);
  stroke(conducting ? 'crimson' : 'darkgray');
  strokeWeight(2);
  line(xSw, baseRow, swX - 16, baseRow);
  line(swX + 16, baseRow, xTr - 26, baseRow);

  // ---- Collector side: supply -> LED -> collector ----
  stroke('crimson');
  strokeWeight(3);
  line(xLed, railPlus, xLed, collRow - 26);
  drawLed(xLed, collRow - 26, conducting);
  stroke(conducting ? 'crimson' : 'dimgray');
  strokeWeight(3);
  line(xLed, collRow - 6, xLed, collRow);
  line(xTr + 22, collRow, xLed, collRow);

  // ---- Emitter to ground ----
  stroke(conducting ? 'crimson' : 'dimgray');
  strokeWeight(3);
  line(xTr, collRow + 34, xTr, railMinus);

  drawTransistor(xTr, baseRow, collRow, conducting);

  // Current animations: thin on the base, thick on the collector path
  if (conducting) {
    drawFlow([[xSw, railPlus, xSw, baseRow], [xSw, baseRow, xTr - 26, baseRow]], 4, 'goldenrod');
    // (the base path is drawn as one straight run; the switch and resistor
    //  glyphs sit on top of it, so the dots read as passing through them)
    drawFlow([[xLed, railPlus, xLed, collRow], [xLed, collRow, xTr, collRow],
              [xTr, collRow, xTr, railMinus]], 9, 'crimson');
  }

  // Rail labels
  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('+V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  // Which lead is hovered
  hoverLead = null;
  for (const k in leadSpots) {
    const s = leadSpots[k];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) hoverLead = k;
  }
}

// TO-92 package: a half-round body with a flat face and three leads.
function drawTransistor(x, baseRow, collRow, conducting) {
  const cy = (baseRow + collRow) / 2 + 6;

  // Body
  noStroke();
  fill('#2E2E2E');
  arc(x, cy, 56, 56, PI, TWO_PI);
  rect(x - 28, cy, 56, 10);
  // The flat face, which is the orientation cue on a real part
  fill('#111111');
  rect(x - 28, cy - 2, 56, 5);

  noStroke();
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(11);
  text(npn ? 'BC547' : 'BC557', x, cy - 16);

  // Three leads. Base to the left, collector up-right, emitter down.
  stroke(conducting ? 'crimson' : 'gray');
  strokeWeight(3);
  line(x - 26, baseRow, x, cy + 10);          // base
  line(x + 22, collRow, x + 14, cy + 10);     // collector
  line(x, cy + 10, x, collRow + 34);          // emitter

  leadSpots.base = { x: x - 34, y: baseRow - 12, w: 34, h: 26 };
  leadSpots.collector = { x: x + 8, y: collRow - 14, w: 30, h: 28 };
  leadSpots.emitter = { x: x - 12, y: collRow + 8, w: 24, h: 30 };

  // Lead letters
  noStroke();
  fill('black');
  textSize(12);
  textAlign(RIGHT, CENTER);
  text('B', x - 36, baseRow);
  textAlign(LEFT, CENTER);
  text('C', x + 40, collRow);
  textAlign(CENTER, TOP);
  text('E', x, collRow + 36);

  // Highlight whichever lead is hovered
  if (hoverLead && leadSpots[hoverLead]) {
    const s = leadSpots[hoverLead];
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(s.x, s.y, s.w, s.h, 4);
  }

  // Schematic symbol beside the part, with the arrow that distinguishes NPN
  // from PNP - the one visual difference the chapter's table turns on.
  drawSymbol(x + 62, cy - 6);
}

function drawSymbol(x, y) {
  stroke('dimgray');
  strokeWeight(2);
  noFill();
  line(x, y - 16, x, y + 16);          // the bar
  line(x - 14, y, x, y);               // base lead
  line(x, y - 8, x + 16, y - 20);      // collector
  line(x, y + 8, x + 16, y + 20);      // emitter

  // Arrow on the emitter: outward for NPN, inward for PNP
  noStroke();
  fill('dimgray');
  push();
  translate(x + (npn ? 12 : 4), y + (npn ? 16 : 10));
  rotate(npn ? radians(38) : radians(-142));
  triangle(0, 0, -8, -4, -8, 4);
  pop();

  noStroke();
  fill('gray');
  textAlign(CENTER, TOP);
  textSize(11);
  text(npn ? 'NPN' : 'PNP', x + 4, y + 26);
}

function drawSwitch(x, y, closed) {
  noStroke();
  fill(closed ? 'darkorange' : 'gainsboro');
  rect(x - 16, y - 12, 32, 24, 4);
  fill(closed ? 'saddlebrown' : 'darkslategray');
  circle(x, y, 13);
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(11);
  text(closed ? 'closed' : 'open', x + 20, y);
}

function drawSmallResistor(cx, y, active) {
  noStroke();
  fill('wheat');
  rect(cx - 16, y - 7, 32, 14, 3);
  fill('saddlebrown'); rect(cx - 11, y - 7, 3, 14);
  fill('black');       rect(cx - 4, y - 7, 3, 14);
  fill('firebrick');   rect(cx + 3, y - 7, 3, 14);
  noStroke();
  fill('gray');
  textAlign(CENTER, BOTTOM);
  textSize(10);
  text('base R', cx, y - 10);
}

function drawLed(x, y, lit) {
  noStroke();
  if (lit) {
    fill(255, 215, 0, 90);
    circle(x, y + 10, 36);
  }
  fill(lit ? 'gold' : 'lightcoral');
  arc(x, y + 10, 22, 26, PI, TWO_PI);
  rect(x - 11, y + 10, 22, 7);
  stroke('dimgray');
  strokeWeight(3);
  line(x + 2, y + 17, x + 11, y + 17);
}

// Dots along a multi-leg path. `size` sets how thick the stream reads.
function drawFlow(legs, size, col) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(4, floor(total / 34));

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
// Panel
// ---------------------------------------------------------------------------

function drawPanel(conducting) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  fill('gray');
  textSize(12);
  text('TRANSISTOR STATE', padX, ty);
  ty += 18;
  fill(conducting ? 'darkgreen' : 'dimgray');
  textSize(20);
  text(conducting ? 'Saturation' : 'Cutoff', padX, ty);
  ty += 28;

  fill('black');
  textSize(13);
  if (conducting) {
    text('Base current is flowing, so the transistor is turned fully on. A ' +
         'much larger collector current runs through the LED and lights it.',
         padX, ty, innerW);
  } else {
    text('Cutoff — no base current, no collector current. The transistor acts ' +
         'like an open switch and the LED stays dark.', padX, ty, innerW);
  }
  ty += 62;

  // The point of the whole sim, stated in numbers
  fill('gray');
  textSize(12);
  text('THE IDEA', padX, ty);
  ty += 18;
  fill('mediumblue');
  textSize(13);
  text('The thin gold trickle on the base wire is a fraction of a milliamp. ' +
       'The thick red stream through the LED is tens of milliamps. A small ' +
       'current is controlling a much larger one.', padX, ty, innerW);
  ty += 76;

  if (hoverLead) {
    const roles = {
      base: 'Base — the control lead. A small current in here decides whether ' +
            'the transistor conducts at all.',
      collector: 'Collector — where the larger controlled current enters the ' +
                 'transistor, on its way to the load.',
      emitter: 'Emitter — where both currents leave the transistor. On an NPN ' +
               'the emitter arrow points out, toward ground.'
    };
    fill('#E8710A');
    textSize(13);
    text(roles[hoverLead], padX, ty, innerW);
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Type:', 10, drawHeight + 57);
  fill('dimgray');
  textSize(12);
  text('hover a lead to identify it', 200, drawHeight + 57);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function toggleSwitch() {
  baseOn = !baseOn;
  switchButton.html('Base Switch: ' + (baseOn ? 'ON' : 'OFF'));
}

function resetAll() {
  baseOn = false;
  npn = true;
  switchButton.html('Base Switch: OFF');
  typeSelect.selected('NPN');
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
