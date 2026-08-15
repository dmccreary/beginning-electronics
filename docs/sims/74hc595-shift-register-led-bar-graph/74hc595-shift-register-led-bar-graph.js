// 74HC595 Shift Register LED Bar Graph
// CANVAS_HEIGHT: 565
// Bloom Level: Apply (L3) - Verb: demonstrate, apply, experiment
// Learning objective: Given a sequence of data bits and clock pulses,
// demonstrate how the 74HC595's shift register fills its eight outputs one
// pulse at a time, distinguish the effect of the Output Enable and Reset pins,
// and compare manual clocking to an automatic 555-driven clock.
//
// Why the register is modelled in plain JavaScript rather than by the DC
// solver in breadboard-lib.js: shifting is a discrete event, not a steady
// state. Each SRCLK pulse moves every stored bit one place along. A nodal
// solver has no notion of "one place along", so the register state lives in
// the `reg` array below and the board drawing simply reads it.
//
// The distinction the sim exists to teach:
//   SRCLR (Reset)       wipes the stored bits      - destructive
//   OE   (Output Enable) blanks the LEDs only      - the bits survive

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 450;
let controlHeight = 115;     // 3 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let clockButton, clearButton, resetViewButton;
let dataSelect;
let oeCheckbox, chainCheckbox, countCheckbox, autoCheckbox;

// ---- State ----
// reg[0] is the bit nearest the input (Q0); reg[7] is Q7, the far end.
let reg = [0, 0, 0, 0, 0, 0, 0, 0];
let reg2 = [0, 0, 0, 0, 0, 0, 0, 0];   // the daisy-chained second chip
let dataBit = 1;
let outputEnabled = true;
let chained = false;
let counting = false;
let autoClock = false;
let counter = 0;
let lastAuto = 0;
let lastCount = 0;
let moveHighlight = -1;      // which position the last bit moved into
let moveMsg = '';
let pulses = 0;
let flowPhase = 0;
let mouseOverCanvas = false;
let panel = {};

const COLS = 20;
const CHIP_COL = 3;          // leftmost tie column the DIP straddles
const LED_COL = 12;          // first LED column
const AUTO_PERIOD = 909;     // ms, the Chapter 14 blinker rate of about 1.1 Hz

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  // Row 1
  clockButton = createButton('Clock Pulse');
  clockButton.position(10, drawHeight + 8);
  clockButton.mousePressed(() => clockPulse(dataBit));

  clearButton = createButton('Reset (clear)');
  clearButton.position(110, drawHeight + 8);
  clearButton.mousePressed(clearRegister);

  resetViewButton = createButton('Reset View');
  resetViewButton.position(220, drawHeight + 8);
  resetViewButton.mousePressed(resetView);

  // Row 2
  dataSelect = createSelect();
  dataSelect.position(90, drawHeight + 43);
  dataSelect.option('1');
  dataSelect.option('0');
  dataSelect.selected('1');
  dataSelect.changed(() => dataBit = int(dataSelect.value()));

  oeCheckbox = createCheckbox('Output Enable', true);
  oeCheckbox.position(160, drawHeight + 45);
  oeCheckbox.changed(() => outputEnabled = oeCheckbox.checked());

  // Row 3
  chainCheckbox = createCheckbox('Daisy-chain 2nd chip', false);
  chainCheckbox.position(10, drawHeight + 80);
  chainCheckbox.changed(() => chained = chainCheckbox.checked());

  countCheckbox = createCheckbox('Binary counting', false);
  countCheckbox.position(200, drawHeight + 80);
  countCheckbox.changed(() => { counting = countCheckbox.checked(); counter = 0; });

  autoCheckbox = createCheckbox('555-driven clock', false);
  autoCheckbox.position(360, drawHeight + 80);
  autoCheckbox.changed(() => autoClock = autoCheckbox.checked());

  describe('A 74HC595 shift register on a breadboard driving eight LEDs as a ' +
           'bar graph. A clock button shifts the selected data bit one place ' +
           'along the register, an Output Enable checkbox blanks the LEDs ' +
           'without erasing the stored bits, and toggles add a daisy-chained ' +
           'second chip, a binary counting demo, and an automatic 555-driven ' +
           'clock.', LABEL);
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

  // Timed behaviours. Both only run while the pointer is over the canvas, so
  // the sim does not tick away while a student reads the page around it.
  const now = millis();
  if (mouseOverCanvas) {
    flowPhase += 0.02;
    if (counting && now - lastCount > 1000) {
      lastCount = now;
      counter = (counter + 1) % 256;
      loadByte(counter);
    }
    if (autoClock && !counting && now - lastAuto > AUTO_PERIOD) {
      lastAuto = now;
      clockPulse(dataBit);
    }
  }

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('74HC595 Shift Register', canvasWidth / 2, 6);

  const stacked = canvasWidth < 720;
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

  drawCircuit();
  drawPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Register behaviour
// ---------------------------------------------------------------------------

// One SRCLK pulse: every bit moves one place toward Q7, and the bit falling
// off the end goes out of QH' - which is exactly what feeds a second chip.
function clockPulse(bit) {
  const overflow = reg[7];
  for (let i = 7; i > 0; i--) reg[i] = reg[i - 1];
  reg[0] = bit;

  if (chained) {
    for (let i = 7; i > 0; i--) reg2[i] = reg2[i - 1];
    reg2[0] = overflow;
  }

  pulses++;
  moveHighlight = 0;
  moveMsg = 'Shifted a ' + bit + ' into Q0. Every stored bit moved one place ' +
            'toward Q7' + (chained && overflow ? ', and a 1 spilled out of QH′ into chip 2' : '') + '.';
}

// SRCLR: wipes the stored bits. This is the destructive one.
function clearRegister() {
  reg = [0, 0, 0, 0, 0, 0, 0, 0];
  reg2 = [0, 0, 0, 0, 0, 0, 0, 0];
  counter = 0;
  pulses = 0;
  moveHighlight = -1;
  moveMsg = 'Reset cleared the register to all zeros. The stored bits are gone — ' +
            'this is not the same as Output Enable, which only blanks the LEDs.';
}

// Binary counting demo writes a whole byte at once, MSB at Q7.
function loadByte(v) {
  for (let i = 0; i < 8; i++) reg[7 - i] = (v >> i) & 1;
  moveHighlight = -1;
  moveMsg = 'Counting: the register now holds ' + v + '.';
}

function regValue(r) {
  let v = 0;
  for (let i = 0; i < 8; i++) v = (v << 1) | r[7 - i];
  return v;
}

function regBinary(r) {
  // Printed Q7 first, the way you would read the bar from the far end back
  let s = '';
  for (let i = 7; i >= 0; i--) s += r[i];
  return s;
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit() {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const rowE = bbRowY('e');
  const rowF = bbRowY('f');
  const ledRow = bbRowY('c');

  drawChip(CHIP_COL, rowE, rowF, 'chip 1');
  if (chained) drawChipSmall(CHIP_COL, bbRowY('i'), 'chip 2');

  // Eight LEDs in a row, one per output
  for (let i = 0; i < 8; i++) {
    const x = bbColX(LED_COL + i);
    const lit = outputEnabled && reg[i] === 1;
    // The move highlight is an output too, so Output Enable blanks it as well -
    // otherwise a "blanked" bar still shows a glowing ring.
    drawLed(x, ledRow, lit, outputEnabled && i === moveHighlight);

    // supply leg and return, drawn faintly so the LEDs stay the focus
    stroke(lit ? 'crimson' : '#C9CFD5');
    strokeWeight(2);
    line(x, railPlus, x, ledRow - 14);
    stroke('#C9CFD5');
    line(x, ledRow + 16, x, railMinus);

    noStroke();
    fill(lit ? 'black' : 'gray');
    textAlign(CENTER, TOP);
    textSize(10);
    text('Q' + i, x, ledRow + 20);
  }

  // The control wires, animated only while a clock source is running
  const clocking = mouseOverCanvas && (autoClock || counting);
  drawControlWire(bbColX(CHIP_COL + 1), rowF, bbColX(LED_COL) - 20, 'SRCLK', clocking);

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('+V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  // Output Enable blanking is worth calling out on the board itself
  if (!outputEnabled) {
    const by = min(BB.y + bbHeight() + 6, drawHeight - 24);
    noStroke();
    fill(90, 100, 115, 210);
    rect(BB.x, by, BB.w, 20, 4);
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Output Enable is off — the LEDs are blanked, but the bits are still stored',
         BB.x + BB.w / 2, by + 10);
  }
}

// The 74HC595 body straddling the centre channel, the way a DIP really sits.
function drawChip(col, rowE, rowF, label) {
  const x0 = bbColX(col) - BB.pitch * 0.6;
  const x1 = bbColX(col + 7) + BB.pitch * 0.6;
  const yTop = rowE - BB.pitch * 0.4;
  const yBot = rowF + BB.pitch * 0.4;

  noStroke();
  fill('#262E38');
  rect(x0, yTop, x1 - x0, yBot - yTop, 4);
  fill('#FBFCFD');
  arc(x0, (yTop + yBot) / 2, BB.pitch * 1.1, BB.pitch * 1.1, -HALF_PI, HALF_PI);

  fill('#E9EDF1');
  textAlign(CENTER, CENTER);
  textSize(min(13, BB.pitch * 0.9));
  text('74HC595', (x0 + x1) / 2, (yTop + yBot) / 2);

  noStroke();
  fill('gray');
  textAlign(LEFT, BOTTOM);
  textSize(10);
  text(label, x0, yTop - 3);
}

function drawChipSmall(col, row, label) {
  const x0 = bbColX(col) - BB.pitch * 0.6;
  const x1 = bbColX(col + 7) + BB.pitch * 0.6;
  noStroke();
  fill('#39424E');
  rect(x0, row - BB.pitch * 0.7, x1 - x0, BB.pitch * 1.4, 4);
  fill('#C6CDD5');
  textAlign(CENTER, CENTER);
  textSize(min(11, BB.pitch * 0.8));
  text('74HC595  ' + regBinary(reg2), (x0 + x1) / 2, row);

  noStroke();
  fill('gray');
  textAlign(LEFT, BOTTOM);
  textSize(10);
  text(label + ' — fed from QH′', x0, row - BB.pitch * 0.8);
}

function drawLed(x, y, lit, highlight) {
  if (highlight) {
    noStroke();
    fill(255, 215, 0, 120);
    circle(x, y, 30);
  }
  noStroke();
  if (lit) {
    fill(255, 190, 60, 110);
    circle(x, y, 26);
  }
  fill(lit ? 'gold' : '#D8DDE2');
  arc(x, y, 15, 18, PI, TWO_PI);
  rect(x - 7.5, y, 15, 5);
  stroke('#8B95A0');
  strokeWeight(2);
  line(x + 1, y + 5, x + 7, y + 5);
}

function drawControlWire(x0, y0, x1, label, active) {
  stroke(active ? 'mediumblue' : '#C9CFD5');
  strokeWeight(2);
  noFill();
  const midY = y0 + BB.pitch * 1.6;
  beginShape();
  vertex(x0, y0); vertex(x0, midY); vertex(x1, midY);
  endShape();

  if (active) {
    // Thin dots so the clock line reads as a signal, not a power path
    noStroke();
    fill('mediumblue');
    const total = abs(x1 - x0) + abs(midY - y0);
    for (let i = 0; i < 5; i++) {
      const t = (flowPhase * 0.3 + i / 5) % 1;
      let d = t * total;
      if (d < abs(midY - y0)) circle(x0, y0 + d, 5);
      else circle(x0 + (d - abs(midY - y0)) * (x1 > x0 ? 1 : -1), midY, 5);
    }
  }

  noStroke();
  fill(active ? 'mediumblue' : 'gray');
  textAlign(LEFT, BOTTOM);
  textSize(10);
  text(label, x0 + 4, midY - 3);
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
  let ty = panel.y + 10;

  noStroke();
  textAlign(LEFT, TOP);

  // Stage 1 - the register contents, as bits and as a number
  fill('gray');
  textSize(11);
  text('REGISTER CONTENTS   (Q7 … Q0)', padX, ty);
  ty += 16;
  fill('black');
  textSize(21);
  text(regBinary(reg), padX, ty);
  ty += 28;
  fill('mediumblue');
  textSize(13);
  text('decimal ' + regValue(reg) + '   ·   ' + pulses + ' clock pulse' +
       (pulses === 1 ? '' : 's'), padX, ty);
  ty += 26;

  if (chained) {
    fill('gray');
    textSize(11);
    text('CHIP 2   (fed from chip 1\'s QH′)', padX, ty);
    ty += 15;
    fill('#6953B8');
    textSize(15);
    text(regBinary(reg2), padX, ty);
    ty += 24;
  }

  // Stage 2 - what the last pulse actually did
  fill('gray');
  textSize(11);
  text('LAST ACTION', padX, ty);
  ty += 16;
  fill('black');
  textSize(12);
  text(moveMsg || 'Press Clock Pulse to shift a ' + dataBit +
       ' into the register and watch it move.', padX, ty, innerW);
  ty += 52;

  // Output Enable vs Reset, the distinction the chapter turns on
  fill('gray');
  textSize(11);
  text('OUTPUT ENABLE vs RESET', padX, ty);
  ty += 16;
  fill(outputEnabled ? 'darkgreen' : '#5A6472');
  textSize(12);
  text(outputEnabled
    ? 'Output Enable is on — the LEDs show what is stored.'
    : 'Output Enable is off — the LEDs are blank, but the bits above are ' +
      'untouched. Turn it back on and they reappear. Reset would have erased them.',
    padX, ty, innerW);
  ty += 54;

  // Stage 4 - which clock is driving it
  fill('gray');
  textSize(11);
  text('CLOCK SOURCE', padX, ty);
  ty += 16;
  if (counting) {
    fill('#B4650F');
    textSize(12);
    text('Binary counting demo — the whole byte is rewritten once a second, ' +
         'counting 0 to 255.', padX, ty, innerW);
  } else if (autoClock) {
    fill('darkgreen');
    textSize(12);
    text('The 555\'s clock signal is now stepping the shift register for you, ' +
         'at the same ≈1.1 Hz the Chapter 14 blinker used.', padX, ty, innerW);
  } else {
    fill('black');
    textSize(12);
    text('Manual — each press of Clock Pulse advances the register one step.',
         padX, ty, innerW);
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(14);
  text('Data bit:', 10, drawHeight + 55);
}

function resetView() {
  reg = [0, 0, 0, 0, 0, 0, 0, 0];
  reg2 = [0, 0, 0, 0, 0, 0, 0, 0];
  dataBit = 1;
  dataSelect.selected('1');
  outputEnabled = true;
  oeCheckbox.checked(true);
  chained = false;
  chainCheckbox.checked(false);
  counting = false;
  countCheckbox.checked(false);
  autoClock = false;
  autoCheckbox.checked(false);
  counter = 0;
  pulses = 0;
  moveHighlight = -1;
  moveMsg = '';
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
