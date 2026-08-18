// PWM Motor Speed Control
// CANVAS_HEIGHT: 520
// Bloom Level: Apply (L3) - Verb: demonstrate, predict, adjust
// Learning objective: Given a duty-cycle slider driving a transistor-switched
// DC motor on a breadboard, predict and observe how PWM duty cycle changes
// average motor speed, connecting the result to Chapter 14's 555 duty cycle.
//
// The idea PWM rests on: the supply is never dimmed, only switched fully on
// and fully off, very fast. What the motor responds to is the AVERAGE, and the
// average is set purely by the fraction of each cycle that is "on".
//
//   average voltage = supply x duty
//   speed           = duty            (as a fraction of free speed)
//
// So 100% duty is identical to Chapter 18's plain always-on switch, and 0% is
// identical to the switch being off. Everything interesting is in between.
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
let dutySlider, resetButton;

// ---- State ----
let duty = 0;                // percent
let shaft = 0;
let pwmPhase = 0;            // 0..1 position within one PWM cycle
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverTarget = null;      // 'graph' | 'flyback'
let graphBox = null, flybackBox = null;
let panel = {};

const VIN = 5;
const COLS = 20;
const TR_COL = 8;
const MOTOR_COL = 15;

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

  resetButton = createButton('Reset');
  resetButton.position(10, drawHeight + 10);
  resetButton.mousePressed(() => dutySlider.value(0));

  dutySlider = createSlider(0, 100, 0, 1);
  dutySlider.position(sliderLeftMargin, drawHeight + 45);
  dutySlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A breadboard circuit with a PWM source driving a 2N2222 that ' +
           'switches a DC motor, with a flyback diode across the motor. A ' +
           'duty-cycle slider changes the on/off ratio shown on a pulse-train ' +
           'graph, and the motor shaft spins at a speed proportional to that ' +
           'duty cycle.', LABEL);
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

  duty = dutySlider.value();
  const frac = duty / 100;

  // The PWM cycle runs on its own clock so the "on" phase can be shown
  // pulsing rather than described.
  if (mouseOverCanvas) {
    pwmPhase = (pwmPhase + 0.035) % 1;
    flowPhase += 0.03;
    shaft += frac * 0.3;
  }
  const pulseHigh = pwmPhase < frac;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('PWM Motor Speed Control', canvasWidth / 2, 6);

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
    boardW = canvasWidth * 0.55;
    boardH = drawHeight - 44;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 44 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  drawCircuit(frac, pulseHigh);
  drawPanel(frac, pulseHigh);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(frac, pulseHigh) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const baseRow = bbRowY('b');
  const collRow = bbRowY('d');

  const xTr = bbColX(TR_COL);
  const xMot = bbColX(MOTOR_COL);
  const xSrc = bbColX(3);

  const driving = frac > 0 && pulseHigh;

  // PWM source block feeding the base through its resistor
  drawPwmSource(xSrc, baseRow, frac, pulseHigh);
  stroke(driving ? 'crimson' : '#C3C9CF');
  strokeWeight(2);
  noFill();
  drawResistorGlyph((xSrc + xTr) / 2 + 10, baseRow);
  line(xSrc + 26, baseRow, xTr - 24, baseRow);

  // Collector side
  stroke('crimson');
  strokeWeight(3);
  line(xMot, railPlus, xMot, collRow - 42);
  drawMotor(xMot, collRow - 20, frac);
  drawFlyback(xMot + 54, collRow - 20);
  stroke(driving ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(xMot, collRow + 2, xMot, collRow);
  line(xTr + 20, collRow, xMot, collRow);
  line(xTr, collRow + 32, xTr, railMinus);

  drawTransistor(xTr, baseRow, collRow, driving);

  // Current dots appear only during the "on" part of each cycle, which is
  // what makes PWM look different from a plain steady switch.
  if (driving) {
    drawFlow([[xSrc + 26, baseRow, xTr - 24, baseRow]], 4, 'goldenrod');
    drawFlow([[xMot, railPlus, xMot, collRow], [xMot, collRow, xTr, collRow],
              [xTr, collRow, xTr, railMinus]], 8, 'crimson');
  }

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(VIN + ' V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);
}

function drawPwmSource(x, y, frac, pulseHigh) {
  noStroke();
  fill(frac > 0 ? (pulseHigh ? '#2878A8' : '#8FA8C8') : '#B6BDC4');
  rect(x - 26, y - 14, 52, 28, 4);

  // a square wave whose mark-space ratio tracks the duty cycle
  stroke('white');
  strokeWeight(2);
  noFill();
  const w = 40, x0 = x - 20;
  const on = w * frac;
  beginShape();
  vertex(x0, y + 7);
  vertex(x0, y - 7);
  vertex(x0 + on, y - 7);
  vertex(x0 + on, y + 7);
  vertex(x0 + w, y + 7);
  endShape();

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text('PWM source', x, y + 17);
}

function drawTransistor(x, baseRow, collRow, driving) {
  const cy = (baseRow + collRow) / 2 + 6;
  noStroke();
  fill('#2E2E2E');
  arc(x, cy, 42, 42, PI, TWO_PI);
  rect(x - 21, cy, 42, 8);
  fill('#111111');
  rect(x - 21, cy - 2, 42, 4);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(10);
  text('2N2222', x, cy - 11);

  stroke(driving ? 'crimson' : '#B6BDC4');
  strokeWeight(3);
  line(x - 24, baseRow, x, cy + 14);
  line(x + 20, collRow, x + 13, cy + 14);
  line(x, cy + 14, x, collRow + 32);
}

function drawMotor(x, y, frac) {
  noStroke();
  fill('#8A939B');
  rect(x - 26, y - 22, 52, 44, 6);
  fill('#6E777E');
  rect(x - 26, y - 22, 52, 10, 6, 6, 0, 0);

  push();
  translate(x, y + 2);
  rotate(shaft);
  noStroke();
  fill(frac > 0 ? '#F0F0F0' : '#B8BEC4');
  for (let i = 0; i < 3; i++) {
    rotate(TWO_PI / 3);
    ellipse(0, -11, 9, 22);
  }
  fill('#4A5259');
  circle(0, 0, 9);
  pop();

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('motor', x, y + 26);
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
  if (hoverTarget === 'flyback') {
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
  rect(cx - 14, y - 6, 28, 12, 3);
  fill('firebrick'); rect(cx - 3, y - 6, 3, 12);
}

function drawFlow(legs, size, col) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(3, floor(total / 32));
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
// Panel: the pulse train is the teaching object here
// ---------------------------------------------------------------------------

function drawPanel(frac, pulseHigh) {
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
  text('DUTY CYCLE', padX, ty);
  ty += 16;
  fill('black');
  textSize(28);
  text(duty + '%', padX, ty);
  ty += 36;

  // The pulse train, drawn over three cycles so the ratio is readable
  const gh = 56;
  graphBox = { x: padX, y: ty, w: innerW, h: gh };
  noStroke();
  fill('#F4F6F8');
  rect(padX, ty, innerW, gh, 4);

  stroke('#C3C9CF');
  strokeWeight(1);
  line(padX, ty + gh - 10, padX + innerW, ty + gh - 10);

  stroke('mediumblue');
  strokeWeight(2.5);
  noFill();
  const cycles = 3;
  const cw = innerW / cycles;
  beginShape();
  for (let c = 0; c < cycles; c++) {
    const x0 = padX + c * cw;
    const on = cw * frac;
    vertex(x0, ty + gh - 10);
    vertex(x0, ty + 10);
    vertex(x0 + on, ty + 10);
    vertex(x0 + on, ty + gh - 10);
    vertex(x0 + cw, ty + gh - 10);
  }
  endShape();

  // The average line, which is what the motor actually feels
  stroke('darkorange');
  strokeWeight(2);
  drawingContext.setLineDash([5, 4]);
  const avgY = ty + gh - 10 - (gh - 20) * frac;
  line(padX, avgY, padX + innerW, avgY);
  drawingContext.setLineDash([]);
  noStroke();
  fill('darkorange');
  textAlign(RIGHT, BOTTOM);
  textSize(11);
  text('average ' + nf(VIN * frac, 1, 2) + ' V', padX + innerW - 4, avgY - 2);

  ty += gh + 12;

  fill('gray');
  textSize(11);
  text('MOTOR SPEED', padX, ty);
  ty += 16;
  noStroke();
  fill('gainsboro');
  rect(padX, ty, innerW, 12, 4);
  fill(frac > 0 ? 'seagreen' : 'gainsboro');
  rect(padX, ty, innerW * frac, 12, 4);
  ty += 20;
  fill('black');
  textSize(13);
  text(nf(frac * 100, 1, 0) + '% of full speed', padX, ty);
  ty += 28;

  // The explanation, keyed to where the slider is
  fill('black');
  textSize(12);
  if (hoverTarget === 'graph') {
    fill('#E8710A');
    text('Duty cycle is the fraction of each cycle the supply is switched ON. ' +
         'The supply itself is never reduced — it is full voltage or nothing, ' +
         'and the motor responds to the average.', padX, ty, innerW);
  } else if (hoverTarget === 'flyback') {
    fill('#E8710A');
    text('At every switch-off the motor\'s collapsing field drives a reverse ' +
         'voltage spike. PWM switches off hundreds of times a second, so this ' +
         'diode is working constantly here — far harder than with a plain ' +
         'on/off switch.', padX, ty, innerW);
  } else if (duty === 0) {
    text('0% duty cycle — power is never on, so the motor stays still.', padX, ty, innerW);
  } else if (duty === 100) {
    text('100% duty cycle — the supply is on the whole time. This is exactly ' +
         'Chapter 18\'s plain always-on switch.', padX, ty, innerW);
  } else {
    text('The supply is switched fully on for ' + duty + '% of each cycle and ' +
         'fully off for the rest. The motor feels the average, ' +
         nf(VIN * frac, 1, 2) + ' V of ' + VIN + ' V.', padX, ty, innerW);
  }

  // hover hit-testing for the two explainable regions
  hoverTarget = null;
  if (graphBox && inBox(graphBox, mouseX, mouseY)) hoverTarget = 'graph';
  else if (flybackBox && inBox(flybackBox, mouseX, mouseY)) hoverTarget = 'flyback';
}

function inBox(b, px, py) {
  return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Duty cycle: ' + duty + '%', 10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  dutySlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
