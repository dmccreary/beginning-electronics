// LED Current-Limiting Resistor Circuit
// CANVAS_HEIGHT: 520
// Bloom Level: Understand (L2) / Apply (L3) - Verb: identify, demonstrate, calculate
// Learning objective: Given a rendered breadboard LED circuit with a swappable
// current-limiting resistor, identify the LED's anode and cathode, predict what
// happens when the LED is wired backwards, and calculate the resulting current
// for different resistor choices using the current-limiting resistor equation.
//
// Model:  I = (Vsupply - Vforward) / R
// With a 5 V supply and a 2.0 V red LED, a 220 ohm resistor gives
// (5 - 2.0) / 220 = 13.6 mA, which is the "about 14 mA" the chapter quotes.
//
// Reversed LED: a diode blocks current in reverse. At 5 V this is harmless -
// the sim says so explicitly, because a beginner's first instinct on seeing a
// dark LED is to assume they have destroyed it.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let flipButton;
let resistorSelect;
let resetButton;

// ---- State ----
let reversed = false;
let resistorChoice = '220 Ω';
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverPart = null;
let spots = {};
let panel = {};

const VSUPPLY = 5;
const VFORWARD = 2.0;        // a red LED
const LED_SAFE_MA = 20;      // typical maximum continuous forward current

const RESISTORS = {
  '220 Ω': 220,
  '330 Ω': 330,
  '1K': 1000,
  '10K': 10000,
  'no resistor': 0
};

const COLS = 20;
const RES_COL = 6;
const LED_COL = 12;

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

  flipButton = createButton('Flip LED');
  flipButton.position(10, drawHeight + 10);
  flipButton.mousePressed(() => reversed = !reversed);

  resetButton = createButton('Reset');
  resetButton.position(95, drawHeight + 10);
  resetButton.mousePressed(resetAll);

  resistorSelect = createSelect();
  resistorSelect.position(105, drawHeight + 45);
  for (const k in RESISTORS) resistorSelect.option(k);
  resistorSelect.selected('220 Ω');
  resistorSelect.changed(() => resistorChoice = resistorSelect.value());

  describe('A breadboard LED circuit with a swappable current-limiting resistor. ' +
           'A Flip LED button reverses the LED so it blocks current and stays ' +
           'dark. A dropdown swaps between 220 ohm, 330 ohm, 1K, 10K and no ' +
           'resistor, with the calculated current and the LED brightness ' +
           'updating live, and a warning when no resistor is fitted.', LABEL);
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

  const r = RESISTORS[resistorChoice];
  // With no resistor the only thing limiting current is the LED's own tiny
  // internal resistance, so the current runs far past its rating.
  const current = reversed ? 0 : (r > 0 ? (VSUPPLY - VFORWARD) / r : (VSUPPLY - VFORWARD) / 8);
  const mA = current * 1000;
  const unsafe = !reversed && mA > LED_SAFE_MA;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('LED and Current-Limiting Resistor', canvasWidth / 2, 6);

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
    boardW = canvasWidth * 0.56;
    boardH = drawHeight - 44;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 44 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  if (mouseOverCanvas && !reversed) flowPhase += 0.004 + constrain(mA / 400, 0, 0.03);

  drawCircuit(mA, unsafe);
  drawPanel(r, mA, unsafe);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The circuit
// ---------------------------------------------------------------------------

function drawCircuit(mA, unsafe) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const rowY = bbRowY('c');

  const xRes = bbColX(RES_COL);
  const xLed = bbColX(LED_COL);

  // Supply into the resistor
  stroke('crimson');
  strokeWeight(3);
  noFill();
  line(xRes, railPlus, xRes, rowY);

  // The resistor, or a plain wire when "no resistor" is chosen
  if (RESISTORS[resistorChoice] > 0) {
    drawResistorGlyph((xRes + xLed) / 2, rowY, hoverPart === 'resistor');
    stroke('peru');
    strokeWeight(3);
    line(xRes, rowY, xLed, rowY);
  } else {
    stroke('crimson');
    strokeWeight(4);
    line(xRes, rowY, xLed, rowY);
    noStroke();
    fill('crimson');
    textAlign(CENTER, BOTTOM);
    textSize(12);
    text('no resistor!', (xRes + xLed) / 2, rowY - 14);
  }
  spots.resistor = { x: min(xRes, xLed), y: rowY - 18, w: abs(xLed - xRes), h: 36 };

  // The LED, drawn with its polarity cues, then down to ground
  drawLed(xLed, rowY, mA);
  stroke('dimgray');
  strokeWeight(3);
  line(xLed, rowY + 26, xLed, railMinus);
  spots.led = { x: xLed - 24, y: rowY - 30, w: 48, h: 60 };

  // Current dots, only when the LED is forward-biased
  if (!reversed) drawFlow(xRes, railPlus, xLed, railMinus, rowY);
  else drawBlockedMarker(xLed, rowY);

  // Rail labels
  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(VSUPPLY + ' V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  // Unsafe-current banner, placed under the board so it never collides with
  // the title at the top of the canvas.
  if (unsafe) {
    const pulse = 150 + sin(flowPhase * 10) * 80;
    const by = min(BB.y + bbHeight() + 6, drawHeight - 24);
    noStroke();
    fill(220, 20, 60, pulse);
    rect(BB.x, by, BB.w, 20, 4);
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(12);
    text('current is above the LED\'s ' + LED_SAFE_MA + ' mA rating', BB.x + BB.w / 2, by + 10);
  }

  hoverPart = null;
  for (const k in spots) {
    const s = spots[k];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) hoverPart = k;
  }
}

// The LED with a long anode lead and a short cathode lead with a flat edge.
function drawLed(x, y, mA) {
  const lit = !reversed && mA > 0.5;
  const brightness = constrain(mA / 15, 0, 1.4);

  // Leads: the longer one is the anode. Flipping swaps which side it is on.
  const anodeUp = !reversed;
  stroke('silver');
  strokeWeight(3);
  line(x, y - 30, x, y - 10);            // upper lead
  line(x, y + 10, x, y + 26);            // lower lead

  // Lead-length cue: the anode lead is drawn longer
  stroke('goldenrod');
  strokeWeight(4);
  if (anodeUp) line(x, y - 30, x, y - 18);
  else line(x, y + 18, x, y + 26);

  // Body
  noStroke();
  if (lit) {
    fill(255, 220, 80, 90 * brightness);
    circle(x, y, 40 + brightness * 12);
  }
  fill(lit ? color(255, 210, 60) : 'lightcoral');
  arc(x, y, 26, 30, PI, TWO_PI);
  rect(x - 13, y, 26, 8);

  // The flat edge marking the cathode side
  stroke('dimgray');
  strokeWeight(3);
  if (anodeUp) line(x + 4, y + 8, x + 13, y + 8);
  else line(x - 13, y - 8, x - 4, y - 8);

  // Terminal letters
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(11);
  text(anodeUp ? 'A' : 'K', x + 16, y - 22);
  text(anodeUp ? 'K' : 'A', x + 16, y + 20);
}

function drawResistorGlyph(cx, y, active) {
  noStroke();
  fill('wheat');
  rect(cx - 20, y - 8, 40, 16, 3);
  fill('saddlebrown'); rect(cx - 14, y - 8, 4, 16);
  fill('black');       rect(cx - 6, y - 8, 4, 16);
  fill('firebrick');   rect(cx + 2, y - 8, 4, 16);
  if (active) {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(cx - 23, y - 11, 46, 22, 4);
  }
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(12);
  text(resistorChoice, cx, y + 12);
}

function drawFlow(xRes, railPlus, xLed, railMinus, rowY) {
  const legs = [
    [xRes, railPlus, xRes, rowY],
    [xRes, rowY, xLed, rowY],
    [xLed, rowY + 26, xLed, railMinus]
  ];
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);

  const dots = 9;
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

// A stop marker where the reversed diode blocks the current.
function drawBlockedMarker(x, y) {
  stroke('crimson');
  strokeWeight(3);
  noFill();
  circle(x - 30, y, 18);
  line(x - 36, y - 6, x - 24, y + 6);
  noStroke();
  fill('crimson');
  textAlign(RIGHT, CENTER);
  textSize(12);
  text('blocked', x - 42, y);
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function drawPanel(r, mA, unsafe) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // Headline state
  if (reversed) {
    fill('crimson');
    textSize(16);
    text('LED is backwards', padX, ty);
    ty += 22;
    fill('black');
    textSize(13);
    text('A diode only conducts one way. Wired like this it blocks the current, ' +
         'so the LED stays dark. At ' + VSUPPLY + ' V nothing is damaged — flip it ' +
         'back and it lights again.', padX, ty, innerW);
    ty += 78;
  } else if (r === 0) {
    fill('crimson');
    textSize(16);
    text('No current-limiting resistor', padX, ty);
    ty += 22;
    fill('black');
    textSize(13);
    text('With nothing to limit it, the current runs far past the LED\'s ' +
         LED_SAFE_MA + ' mA rating. On a real board this is how an LED gets ' +
         'destroyed in the first second.', padX, ty, innerW);
    ty += 70;
  } else {
    fill('darkgreen');
    textSize(16);
    text('Wired correctly', padX, ty);
    ty += 22;
    fill('black');
    textSize(13);
    text('Current flows from anode to cathode — this LED is wired correctly, ' +
         'drawing about ' + nf(mA, 1, 0) + ' mA.', padX, ty, innerW);
    ty += 56;
  }

  // The equation, always with real numbers in it
  fill('black');
  textSize(14);
  text('I = (Vsupply − Vforward) / R', padX, ty);
  ty += 20;
  fill('mediumblue');
  textSize(13);
  if (reversed) {
    // The equation does not apply while the diode is blocking - saying
    // otherwise would contradict the "no current flows" headline above.
    text('I = 0 mA — the diode blocks current in this direction, so the ' +
         'equation does not apply until the LED is turned around.', padX, ty, innerW);
  } else if (r > 0) {
    text('I = (' + VSUPPLY + ' − ' + nf(VFORWARD, 1, 1) + ') / ' + r +
         ' = ' + nf(mA, 1, 1) + ' mA', padX, ty, innerW);
  } else {
    text('I = (' + VSUPPLY + ' − ' + nf(VFORWARD, 1, 1) + ') / (almost nothing) ' +
         '= far too much', padX, ty, innerW);
  }
  ty += 34;

  // Brightness bar
  fill('black');
  textSize(13);
  text('Brightness', padX, ty);
  ty += 18;
  const barW = innerW;
  noStroke();
  fill('gainsboro');
  rect(padX, ty, barW, 12, 4);
  fill(unsafe ? 'crimson' : 'goldenrod');
  rect(padX, ty, barW * constrain(mA / LED_SAFE_MA, 0, 1), 12, 4);
  ty += 22;
  fill('gray');
  textSize(11);
  text('safe limit is ' + LED_SAFE_MA + ' mA', padX, ty);
  ty += 26;

  // Hover explanations
  if (hoverPart === 'led') {
    fill('#E8710A');
    textSize(13);
    text('The longer lead is the anode (A), the positive side. The shorter lead ' +
         'with the flat edge beside it is the cathode (K). This LED\'s forward ' +
         'voltage is ' + nf(VFORWARD, 1, 1) + ' V.', padX, ty, innerW);
  } else if (hoverPart === 'resistor' && r > 0) {
    fill('#E8710A');
    textSize(13);
    text('This resistor drops ' + nf(VSUPPLY - VFORWARD, 1, 1) + ' V — the part of ' +
         'the supply the LED does not use — which sets the current to ' +
         nf(mA, 1, 1) + ' mA.', padX, ty, innerW);
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Resistor:', 10, drawHeight + 57);
}

function resetAll() {
  reversed = false;
  resistorChoice = '220 Ω';
  resistorSelect.selected('220 Ω');
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
