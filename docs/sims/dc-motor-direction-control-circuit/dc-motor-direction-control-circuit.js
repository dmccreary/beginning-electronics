// DC Motor Direction and Load Control
// CANVAS_HEIGHT: 520
// Bloom Level: Apply (L3) / Analyze (L4) - Verb: demonstrate, predict, examine
// Learning objective: Given a breadboard circuit with a 2N2222, a base switch,
// a flyback diode and a small hobby motor, predict how the switch starts and
// stops the motor, how swapping its leads reverses spin direction, and how
// rising load drives current up to a stall spike.
//
// Load model: a DC motor's current rises as it is loaded, because a slowing
// motor generates less back-EMF to oppose the supply. Fully stalled it draws
// its highest current of all - the shaft is not turning, so there is no
// back-EMF left at all. That is why a jammed motor cooks its driver.
//
//   current = lerp(freeRunning, stall, (load)^1.6)
//   speed   = 1 - load
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
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// ---- Controls ----
let switchButton, swapButton;
let loadSlider;

// ---- State ----
let baseOn = false;
let swapped = false;
let loadPct = 0;
let shaft = 0;
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverFlyback = false;
let flybackBox = null;
let panel = {};

const FREE_MA = 120;         // running freely
const STALL_MA = 750;        // shaft held still
const COLS = 20;
const SW_COL = 3;
const TR_COL = 9;
const MOTOR_COL = 15;

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
  switchButton.mousePressed(() => {
    baseOn = !baseOn;
    switchButton.html('Base Switch: ' + (baseOn ? 'ON' : 'OFF'));
  });

  swapButton = createButton('Swap Motor Leads');
  swapButton.position(160, drawHeight + 10);
  swapButton.mousePressed(() => swapped = !swapped);

  loadSlider = createSlider(0, 100, 0, 1);
  loadSlider.position(sliderLeftMargin, drawHeight + 45);
  loadSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A breadboard circuit with a 2N2222 transistor switching a small ' +
           'hobby motor, with a flyback diode across the motor. A base switch ' +
           'starts and stops it, a swap button reverses the spin direction, ' +
           'and a load slider slows the shaft while the current readout climbs ' +
           'toward a stall spike.', LABEL);
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

  loadPct = loadSlider.value();
  const load = loadPct / 100;

  // ---- The model ----
  const running = baseOn;
  const currentMa = running ? lerp(FREE_MA, STALL_MA, pow(load, 1.6)) : 0;
  const speed = running ? (1 - load) : 0;
  const stalled = running && loadPct >= 100;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Motor Direction and Load', canvasWidth / 2, 6);

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

  if (mouseOverCanvas) {
    flowPhase += 0.004 + constrain(currentMa / 6000, 0, 0.03);
    shaft += (swapped ? -1 : 1) * speed * 0.22;
  }

  drawCircuit(running, currentMa, speed, stalled);
  drawPanel(running, currentMa, speed, stalled);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(running, currentMa, speed, stalled) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const baseRow = bbRowY('b');
  const collRow = bbRowY('d');

  const xSw = bbColX(SW_COL);
  const xTr = bbColX(TR_COL);
  const xMot = bbColX(MOTOR_COL);

  // Base branch
  stroke(running ? 'crimson' : 'darkgray');
  strokeWeight(2);
  noFill();
  line(xSw, railPlus, xSw, baseRow);

  const swX = xSw + 30;
  noStroke();
  fill(running ? 'darkorange' : 'gainsboro');
  rect(swX - 14, baseRow - 11, 28, 22, 4);
  fill(running ? 'saddlebrown' : 'darkslategray');
  circle(swX, baseRow, 12);

  drawResistorGlyph((swX + xTr) / 2 + 6, baseRow);
  stroke(running ? 'crimson' : 'darkgray');
  strokeWeight(2);
  line(xSw, baseRow, swX - 14, baseRow);
  line(swX + 14, baseRow, xTr - 24, baseRow);

  // Collector branch: supply -> motor -> collector
  stroke('crimson');
  strokeWeight(3);
  line(xMot, railPlus, xMot, collRow - 42);
  drawMotor(xMot, collRow - 20, running, speed, stalled);
  drawFlyback(xMot + 54, collRow - 20);
  stroke(running ? 'crimson' : 'dimgray');
  strokeWeight(3);
  line(xMot, collRow + 2, xMot, collRow);
  line(xTr + 20, collRow, xMot, collRow);

  // Emitter to ground
  stroke(running ? 'crimson' : 'dimgray');
  strokeWeight(3);
  line(xTr, collRow + 32, xTr, railMinus);

  drawTransistor(xTr, baseRow, collRow, running, stalled);

  if (running) {
    drawFlow([[xSw, railPlus, xSw, baseRow], [xSw, baseRow, xTr - 24, baseRow]], 4, 'goldenrod');
    drawFlow([[xMot, railPlus, xMot, collRow], [xMot, collRow, xTr, collRow],
              [xTr, collRow, xTr, railMinus]],
             stalled ? 11 : 8, stalled ? 'crimson' : '#D64545');
  }

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('+V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  if (stalled) {
    const pulse = 150 + sin(flowPhase * 12) * 80;
    const by = min(BB.y + bbHeight() + 6, drawHeight - 24);
    noStroke();
    fill(220, 20, 60, pulse);
    rect(BB.x, by, BB.w, 20, 4);
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Stall current — the shaft is not turning and current has spiked',
         BB.x + BB.w / 2, by + 10);
  }
}

function drawTransistor(x, baseRow, collRow, running, hot) {
  const cy = (baseRow + collRow) / 2 + 6;
  noStroke();
  if (hot) {
    fill(220, 60, 40, 70 + sin(flowPhase * 8) * 30);
    circle(x, cy - 6, 62);
  }
  fill(hot ? '#5A2020' : '#2E2E2E');
  arc(x, cy, 44, 44, PI, TWO_PI);
  rect(x - 22, cy, 44, 8);
  fill('#111111');
  rect(x - 22, cy - 2, 44, 4);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(10);
  text('2N2222', x, cy - 12);

  stroke(running ? 'crimson' : 'gray');
  strokeWeight(3);
  line(x - 24, baseRow, x, cy + 14);
  line(x + 20, collRow, x + 13, cy + 14);
  line(x, cy + 14, x, collRow + 32);

  noStroke();
  fill('black');
  textSize(11);
  textAlign(RIGHT, CENTER);
  text('B', x - 28, baseRow);
  textAlign(LEFT, CENTER);
  text('C', x + 26, collRow);
  textAlign(CENTER, TOP);
  text('E', x, collRow + 34);
}

// The motor: a body with a shaft whose blades turn, and a direction arrow.
function drawMotor(x, y, running, speed, stalled) {
  noStroke();
  fill('#8A939B');
  rect(x - 26, y - 22, 52, 44, 6);
  fill('#6E777E');
  rect(x - 26, y - 22, 52, 10, 6, 6, 0, 0);

  // Terminal marks, which swap when the leads are swapped
  fill(swapped ? '#3A6EA8' : '#C0392B');
  rect(x - 22, y + 16, 10, 6, 2);
  fill(swapped ? '#C0392B' : '#3A6EA8');
  rect(x + 12, y + 16, 10, 6, 2);

  push();
  translate(x, y + 2);
  rotate(shaft);
  noStroke();
  fill(running ? '#F0F0F0' : '#B8BEC4');
  for (let i = 0; i < 3; i++) {
    rotate(TWO_PI / 3);
    ellipse(0, -11, 9, 22);
  }
  fill('#4A5259');
  circle(0, 0, 9);
  pop();

  // Direction arrow, drawn only while actually turning
  if (running && speed > 0.02) {
    noFill();
    stroke('#1B7A7A');
    strokeWeight(2);
    const a0 = swapped ? PI * 0.35 : PI * 0.65;
    arc(x, y + 2, 46, 46, a0, a0 + PI * 0.5);
    noStroke();
    fill('#1B7A7A');
    const tip = a0 + (swapped ? 0 : PI * 0.5);
    push();
    translate(x + cos(tip) * 23, y + 2 + sin(tip) * 23);
    rotate(tip + (swapped ? -HALF_PI : HALF_PI));
    triangle(0, 0, -6, -4, -6, 4);
    pop();
  }

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('motor', x, y + 26);
  fill(swapped ? '#3A6EA8' : '#C0392B');
  textSize(10);
  text(running && speed > 0.02 ? (swapped ? 'reversed' : 'forward') : '', x, y + 38);
}

function drawFlyback(x, y) {
  stroke('dimgray');
  strokeWeight(2);
  noFill();
  line(x, y - 26, x, y - 12);
  line(x, y + 12, x, y + 26);

  noStroke();
  fill('#3A3A3A');
  rect(x - 8, y - 12, 16, 24, 2);
  fill('gainsboro');
  rect(x - 8, y - 12, 16, 5);
  fill('white');
  triangle(x - 5, y + 8, x + 5, y + 8, x, y - 4);

  flybackBox = { x: x - 14, y: y - 28, w: 28, h: 56 };
  hoverFlyback = mouseX >= flybackBox.x && mouseX <= flybackBox.x + flybackBox.w &&
                 mouseY >= flybackBox.y && mouseY <= flybackBox.y + flybackBox.h;
  if (hoverFlyback) {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(flybackBox.x, flybackBox.y, flybackBox.w, flybackBox.h, 4);
  }

  noStroke();
  fill('gray');
  textAlign(LEFT, CENTER);
  textSize(10);
  text('flyback', x + 12, y);
}

function drawResistorGlyph(cx, y) {
  noStroke();
  fill('wheat');
  rect(cx - 16, y - 7, 32, 14, 3);
  fill('saddlebrown'); rect(cx - 11, y - 7, 3, 14);
  fill('black');       rect(cx - 4, y - 7, 3, 14);
  fill('firebrick');   rect(cx + 3, y - 7, 3, 14);
}

function drawFlow(legs, size, col) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(4, floor(total / 32));
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

function drawPanel(running, currentMa, speed, stalled) {
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
  textSize(11);
  text('TRANSISTOR STATE', padX, ty);
  ty += 16;
  fill(running ? 'darkgreen' : 'dimgray');
  textSize(19);
  text(running ? 'Saturation — motor on' : 'Cutoff — motor off', padX, ty);
  ty += 30;

  fill('gray');
  textSize(11);
  text('MOTOR CURRENT', padX, ty);
  ty += 16;
  fill(stalled ? 'crimson' : 'black');
  textSize(22);
  text(nf(currentMa, 1, 0) + ' mA', padX, ty);
  ty += 28;

  // Current bar, scaled to the stall figure so the spike is visible
  noStroke();
  fill('gainsboro');
  rect(padX, ty, innerW, 12, 4);
  fill(stalled ? 'crimson' : (currentMa > FREE_MA * 2 ? 'darkorange' : 'seagreen'));
  rect(padX, ty, innerW * constrain(currentMa / STALL_MA, 0, 1), 12, 4);
  ty += 16;
  // free-running tick
  stroke('black');
  strokeWeight(1);
  const tick = padX + innerW * (FREE_MA / STALL_MA);
  line(tick, ty - 20, tick, ty - 2);
  noStroke();
  fill('gray');
  textSize(10);
  text('the mark is free-running current (' + FREE_MA + ' mA)', padX, ty);
  ty += 24;

  fill('gray');
  textSize(11);
  text('SHAFT', padX, ty);
  ty += 16;
  fill('black');
  textSize(13);
  if (!running) {
    text('Stopped — no base current, so the transistor blocks the motor path.',
         padX, ty, innerW);
  } else if (stalled) {
    text('Held still at 100% load. With no rotation there is no back-EMF ' +
         'opposing the supply, so current has spiked to roughly ' +
         nf(STALL_MA / FREE_MA, 1, 1) + '× its free-running value.', padX, ty, innerW);
  } else {
    text('Turning ' + (swapped ? 'in reverse' : 'forward') + ' at about ' +
         nf(speed * 100, 1, 0) + '% of free speed. Loading it down slows the ' +
         'shaft and pushes the current up.', padX, ty, innerW);
  }
  ty += 68;

  if (hoverFlyback) {
    fill('#E8710A');
    textSize(12);
    text('The flyback diode sits backwards across the motor. While the motor ' +
         'runs it does nothing, but the instant the transistor switches off, ' +
         'the motor\'s collapsing magnetic field drives a reverse voltage ' +
         'spike — and this diode gives that spike a safe path instead of ' +
         'letting it punch through the transistor.', padX, ty, innerW);
  } else {
    fill('gray');
    textSize(12);
    text('Direction depends only on which way the current runs through the ' +
         'motor — swapping its two leads reverses it. The transistor is just ' +
         'a switch and has no say in direction.', padX, ty, innerW);
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Load: ' + loadPct + '%', 10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  loadSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
