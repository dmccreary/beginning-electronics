// Transistor Motor Driver Explorer
// CANVAS_HEIGHT: 555
// Bloom Level: Apply (L3) - Verb: calculate, demonstrate, compare
// Learning objective: Given a target motor current and a selected transistor
// (BC547 or 2N2222) or a Darlington pair, calculate a safe base resistor value
// using Rb = (Vin - Vbe) / Ib and Ib = Ic / beta, and observe the resulting
// base current, collector current and heat-limit status.
//
// Model:
//   Ib = (Vin - Vbe) / Rb                base current the resistor allows
//   Ic = beta x Ib                       what the transistor would deliver
//   actual Ic = min(Ic, motor draw, transistor rating)
//
// Two honest details the sim keeps visible:
//   - A Darlington pair has TWO base-emitter junctions in the path, so Vbe is
//     about 1.4 V rather than 0.7 V. Its gain is beta1 x beta2, which is why
//     the same motor current needs a far smaller base current.
//   - The motor is a fixed load here. A real motor's stall and inrush currents
//     are much higher; this is a steady-state picture only.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 115;     // 3 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 230;
let defaultTextSize = 16;

// ---- Controls ----
let rbSlider;
let partSelect;
let darlingtonButton;
let resetButton;

// ---- State ----
// The sim opens on a circuit that WORKS: a 2N2222 at about 3.5 k, which lands
// the motor at full speed inside the part's rating. Switching to the BC547
// then reveals that a 100 mA part simply cannot drive a 180 mA motor - that
// discovery is the point of the comparison, so it should not be the first
// thing a learner sees.
let rb = 3500;
let partName = '2N2222';
let darlington = false;
let spin = 0;
let flowPhase = 0;
let mouseOverCanvas = false;
let panel = {};

const VIN = 5;
const MOTOR_DRAW_MA = 180;   // what this small motor pulls when running freely
const COLS = 20;
const SW_COL = 3;
const TR_COL = 9;
const MOTOR_COL = 15;

const PARTS = {
  'BC547':  { hfe: 100, maxIc: 100 },
  '2N2222': { hfe: 150, maxIc: 800 }
};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  darlingtonButton = createButton('Darlington: OFF');
  darlingtonButton.position(10, drawHeight + 8);
  darlingtonButton.mousePressed(toggleDarlington);

  resetButton = createButton('Reset');
  resetButton.position(150, drawHeight + 8);
  resetButton.mousePressed(resetAll);

  partSelect = createSelect();
  partSelect.position(120, drawHeight + 43);
  for (const k in PARTS) partSelect.option(k);
  partSelect.selected('2N2222');
  partSelect.changed(() => partName = partSelect.value());

  // Log-ish scale over 100 ohms to 10 kilohms
  rbSlider = createSlider(0, 100, 77, 1);   // 77 lands on about 3.5 k
  rbSlider.position(sliderLeftMargin, drawHeight + 78);
  rbSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A breadboard motor driver: a battery, a push button and base ' +
           'resistor feeding an NPN transistor, and a small DC motor with a ' +
           'flyback diode across it as the collector load. Sliders and a ' +
           'Darlington toggle change the base current, and readouts show the ' +
           'base current, collector current and whether the transistor is ' +
           'past its rating.', LABEL);
}

function sliderToOhms(v) {
  const ohms = 100 * pow(10, (v / 100) * 2);   // 100 .. 10000
  if (ohms >= 1000) return round(ohms / 100) * 100;
  return round(ohms / 10) * 10;
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

  rb = sliderToOhms(rbSlider.value());
  const part = PARTS[partName];

  // ---- The model ----
  const vbe = darlington ? 1.4 : 0.7;
  const beta = darlington ? part.hfe * PARTS['BC547'].hfe : part.hfe;
  const ibMa = max(0, (VIN - vbe) / rb) * 1000;
  const predictedIcMa = beta * ibMa;
  const ceiling = min(MOTOR_DRAW_MA, part.maxIc);
  const actualIcMa = min(predictedIcMa, ceiling);
  const overRating = predictedIcMa > part.maxIc;
  const atSpeed = actualIcMa >= MOTOR_DRAW_MA - 0.5;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Transistor Motor Driver', canvasWidth / 2, 6);

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
    flowPhase += 0.004 + constrain(actualIcMa / 3000, 0, 0.03);
    spin += actualIcMa / 900;   // the fan turns faster with more current
  }

  drawCircuit(ibMa, actualIcMa, overRating);
  drawPanel(part, vbe, beta, ibMa, predictedIcMa, actualIcMa, overRating, atSpeed);
  drawControlLabels(part, beta);
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(ibMa, icMa, overRating) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const baseRow = bbRowY('b');
  const collRow = bbRowY('d');

  const xSw = bbColX(SW_COL);
  const xTr = bbColX(TR_COL);
  const xMot = bbColX(MOTOR_COL);

  const conducting = icMa > 0.5;

  // Base branch: supply -> button -> base resistor -> base
  stroke(conducting ? 'crimson' : 'darkgray');
  strokeWeight(2);
  noFill();
  line(xSw, railPlus, xSw, baseRow);

  const swX = xSw + 30;
  noStroke();
  fill(conducting ? 'darkorange' : 'gainsboro');
  rect(swX - 14, baseRow - 11, 28, 22, 4);
  fill(conducting ? 'saddlebrown' : 'darkslategray');
  circle(swX, baseRow, 12);

  drawResistorGlyph((swX + xTr) / 2 + 6, baseRow, rb);
  stroke(conducting ? 'crimson' : 'darkgray');
  strokeWeight(2);
  line(xSw, baseRow, swX - 14, baseRow);
  line(swX + 14, baseRow, xTr - 26, baseRow);

  // Collector branch: supply -> motor (with flyback diode) -> collector
  stroke('crimson');
  strokeWeight(3);
  line(xMot, railPlus, xMot, collRow - 40);
  drawMotor(xMot, collRow - 18, icMa);
  drawFlyback(xMot + 52, collRow - 18);
  stroke(conducting ? 'crimson' : 'dimgray');
  strokeWeight(3);
  line(xMot, collRow + 4, xMot, collRow);
  line(xTr + 22, collRow, xMot, collRow);

  // Emitter to ground
  stroke(conducting ? 'crimson' : 'dimgray');
  strokeWeight(3);
  line(xTr, collRow + 34, xTr, railMinus);

  drawTransistorPair(xTr, baseRow, collRow, conducting, overRating);

  if (conducting) {
    drawFlow([[xSw, railPlus, xSw, baseRow], [xSw, baseRow, xTr - 26, baseRow]], 4, 'goldenrod');
    drawFlow([[xMot, railPlus, xMot, collRow], [xMot, collRow, xTr, collRow],
              [xTr, collRow, xTr, railMinus]], 9, 'crimson');
  }

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(VIN + ' V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  // Heat warning under the board, clear of the title
  if (overRating) {
    const pulse = 150 + sin(flowPhase * 10) * 80;
    const by = min(BB.y + bbHeight() + 6, drawHeight - 24);
    noStroke();
    fill(220, 20, 60, pulse);
    rect(BB.x, by, BB.w, 20, 4);
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(12);
    text('base current is driving the transistor past its rating — it would overheat',
         BB.x + BB.w / 2, by + 10);
  }
}

// One transistor, or two chained as a Darlington pair.
function drawTransistorPair(x, baseRow, collRow, conducting, hot) {
  drawTo92(x, (baseRow + collRow) / 2 + 6, conducting, hot, darlington ? 'Q1' : '');
  if (darlington) {
    drawTo92(x + 42, (baseRow + collRow) / 2 + 6, conducting, hot, 'Q2');
    // Q1's emitter feeds Q2's base - that is what makes it a Darlington
    stroke('gray');
    strokeWeight(2);
    line(x + 16, (baseRow + collRow) / 2 + 16, x + 26, (baseRow + collRow) / 2 + 16);
  }

  stroke(conducting ? 'crimson' : 'gray');
  strokeWeight(3);
  line(x - 26, baseRow, x, (baseRow + collRow) / 2 + 16);
  line(x + 22, collRow, x + 14, (baseRow + collRow) / 2 + 16);
  line(x, (baseRow + collRow) / 2 + 16, x, collRow + 34);
}

function drawTo92(x, cy, conducting, hot, label) {
  noStroke();
  fill(hot ? '#5A2020' : '#2E2E2E');
  arc(x, cy, 44, 44, PI, TWO_PI);
  rect(x - 22, cy, 44, 8);
  fill('#111111');
  rect(x - 22, cy - 2, 44, 4);

  if (hot) {
    // A faint heat halo, so "too much current" is felt as well as read
    noStroke();
    fill(220, 60, 40, 60 + sin(flowPhase * 8) * 30);
    circle(x, cy - 6, 62);
  }

  noStroke();
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(10);
  text(label || 'Q1', x, cy - 12);
}

// A small DC motor: a cylindrical body with a fan that turns with current.
function drawMotor(x, y, icMa) {
  noStroke();
  fill('#8A939B');
  rect(x - 26, y - 22, 52, 44, 6);
  fill('#6E777E');
  rect(x - 26, y - 22, 52, 10, 6, 6, 0, 0);

  // Fan blades
  push();
  translate(x, y + 2);
  rotate(spin);
  noStroke();
  fill(icMa > 0.5 ? '#E8E8E8' : '#B8BEC4');
  for (let i = 0; i < 3; i++) {
    rotate(TWO_PI / 3);
    ellipse(0, -10, 8, 20);
  }
  fill('#4A5259');
  circle(0, 0, 8);
  pop();

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('motor', x, y + 24);
}

// A flyback diode across the motor, band toward the supply.
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

  noStroke();
  fill('gray');
  textAlign(LEFT, CENTER);
  textSize(10);
  text('flyback', x + 12, y);
}

function drawResistorGlyph(cx, y, ohms) {
  noStroke();
  fill('wheat');
  rect(cx - 18, y - 7, 36, 14, 3);
  fill('saddlebrown'); rect(cx - 13, y - 7, 3, 14);
  fill('black');       rect(cx - 6, y - 7, 3, 14);
  fill('firebrick');   rect(cx + 1, y - 7, 3, 14);
  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(10);
  text(formatOhms(ohms), cx, y - 10);
}

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

function drawPanel(part, vbe, beta, ibMa, predictedIcMa, actualIcMa, overRating, atSpeed) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 10;

  noStroke();
  textAlign(LEFT, TOP);

  // Base current
  fill('gray');
  textSize(11);
  text('BASE CURRENT   Ib = (Vin − Vbe) / Rb', padX, ty);
  ty += 15;
  fill('mediumblue');
  textSize(13);
  text('Ib = (' + VIN + ' − ' + nf(vbe, 1, 1) + ') / ' + formatOhms(rb) + ' = ' +
       formatMa(ibMa), padX, ty, innerW);
  ty += 32;

  // Collector current
  fill('gray');
  textSize(11);
  text('COLLECTOR CURRENT   Ic = β × Ib', padX, ty);
  ty += 15;
  fill(overRating ? 'crimson' : 'darkgreen');
  textSize(13);
  text('Ic = ' + addThousands(str(beta)) + ' × ' + formatMa(ibMa) + ' = ' +
       formatMa(predictedIcMa), padX, ty, innerW);
  ty += 30;

  // What actually reaches the motor
  fill('gray');
  textSize(11);
  text('WHAT THE MOTOR ACTUALLY GETS', padX, ty);
  ty += 16;
  fill('black');
  textSize(19);
  text(formatMa(actualIcMa), padX, ty);
  ty += 26;

  // Motor speed bar
  noStroke();
  fill('gainsboro');
  rect(padX, ty, innerW, 12, 4);
  fill(atSpeed ? 'seagreen' : 'goldenrod');
  rect(padX, ty, innerW * constrain(actualIcMa / MOTOR_DRAW_MA, 0, 1), 12, 4);
  ty += 18;
  fill('gray');
  textSize(11);
  text('full speed needs ' + MOTOR_DRAW_MA + ' mA', padX, ty);
  ty += 24;

  // The verdict
  textSize(12);
  if (overRating) {
    fill('crimson');
    text('The base resistor is too small. The formula asks the ' + partName +
         ' for ' + formatMa(predictedIcMa) + ', well past its ' + part.maxIc +
         ' mA rating — it would overheat. Use a larger base resistor.',
         padX, ty, innerW);
  } else if (!atSpeed) {
    fill('darkgoldenrod');
    text('The base resistor is too large. Only ' + formatMa(actualIcMa) +
         ' reaches the motor, so it turns slowly. Lower the resistor to raise ' +
         'the base current.', padX, ty, innerW);
  } else {
    fill('darkgreen');
    text('Good sizing. The motor gets the ' + MOTOR_DRAW_MA + ' mA it needs, and ' +
         'the ' + partName + ' is inside its ' + part.maxIc + ' mA rating.',
         padX, ty, innerW);
  }
  ty += 58;

  if (darlington) {
    fill('#6953B8');
    textSize(11);
    text('Darlington: two transistors chained, so the gain multiplies ' +
         '(' + part.hfe + ' × 100) and Vbe doubles to about 1.4 V. The same ' +
         'motor current now needs a far smaller base current.', padX, ty, innerW);
  }
}

function formatMa(v) {
  if (v >= 1000) return nf(v / 1000, 1, 2) + ' A';
  if (v >= 1) return nf(v, 1, 1) + ' mA';
  return nf(v * 1000, 1, 0) + ' µA';
}

function formatOhms(v) {
  if (v >= 1000) {
    const k = v / 1000;
    return (k === floor(k) ? k : nf(k, 1, 1)) + ' kΩ';
  }
  return v + ' Ω';
}

function addThousands(s) {
  let out = '', count = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    out = s.charAt(i) + out;
    count++;
    if (count % 3 === 0 && i > 0) out = ',' + out;
  }
  return out;
}

function drawControlLabels(part, beta) {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Transistor:', 10, drawHeight + 55);
  text('Base R: ' + formatOhms(rb), 10, drawHeight + 90);

  fill('gray');
  textSize(12);
  text('β = ' + addThousands(str(beta)) + ', max ' + part.maxIc + ' mA',
       230, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function toggleDarlington() {
  darlington = !darlington;
  darlingtonButton.html('Darlington: ' + (darlington ? 'ON' : 'OFF'));
}

function resetAll() {
  rbSlider.value(77);
  partName = '2N2222';
  partSelect.selected('2N2222');
  darlington = false;
  darlingtonButton.html('Darlington: OFF');
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  rbSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
