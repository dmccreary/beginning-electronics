// Voltage Divider Circuit Explorer
// CANVAS_HEIGHT: 535
// Bloom Level: Apply (L3) - Verb: calculate, demonstrate
// Learning objective: Given a rendered breadboard voltage divider with two
// adjustable resistors, predict and then verify the output voltage at the
// midpoint tap as R1 and R2 change, connecting the observed value to the
// voltage divider equation.
//
// Model:  Vout = Vin * R2 / (R1 + R2)
// The equation is shown with the learner's own numbers substituted in, not as
// abstract symbols - that substitution is the whole point of an Apply-level
// objective, so it updates on the same frame as the slider.
//
// Board rendering comes from breadboard-lib.js, shared with the other
// breadboard sims in this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 420;
let controlHeight = 115;     // 3 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 210;
let defaultTextSize = 16;

// ---- Controls ----
let r1Slider, r2Slider;
let splitButton, resetButton;

// ---- State ----
let r1 = 1000, r2 = 1000;
const VIN = 5;               // the supply is fixed so the two resistors are the only variables
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverProbe = false;
let probeXY = { x: 0, y: 0 };
let panel = {};

const COLS = 20;
const R1_COL = 5;            // R1 spans the top rail down to the tap
const TAP_COL = 10;          // the midpoint tap
const R2_COL = 15;           // R2 spans the tap down to ground

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

  splitButton = createButton('50/50 Split');
  splitButton.position(10, drawHeight + 8);
  splitButton.mousePressed(() => { r1Slider.value(50); r2Slider.value(50); });

  resetButton = createButton('Reset');
  resetButton.position(105, drawHeight + 8);
  resetButton.mousePressed(resetAll);

  // Sliders run on a 0-100 scale that maps logarithmically onto 10 ohms to
  // 100 kilohms, so the low end stays as controllable as the high end.
  r1Slider = createSlider(0, 100, 50, 1);
  r1Slider.position(sliderLeftMargin, drawHeight + 8 + 35);
  r1Slider.size(canvasWidth - sliderLeftMargin - margin);

  r2Slider = createSlider(0, 100, 50, 1);
  r2Slider.position(sliderLeftMargin, drawHeight + 8 + 70);
  r2Slider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A breadboard voltage divider with a 5 volt supply and two ' +
           'adjustable resistors in series, with a probe at the midpoint tap. ' +
           'Two sliders set each resistor value on a logarithmic scale, and a ' +
           'panel shows the voltage divider equation with the current numbers ' +
           'substituted in alongside the calculated output voltage.', LABEL);
}

// Map the 0-100 slider position onto 10 ohms .. 100 kilohms.
function sliderToOhms(v) {
  const ohms = 10 * pow(10, (v / 100) * 4);
  // Round to something a learner could actually buy
  if (ohms >= 10000) return round(ohms / 1000) * 1000;
  if (ohms >= 1000) return round(ohms / 100) * 100;
  if (ohms >= 100) return round(ohms / 10) * 10;
  return round(ohms);
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

  r1 = sliderToOhms(r1Slider.value());
  r2 = sliderToOhms(r2Slider.value());

  // ---- The voltage divider model ----
  const vOut = VIN * r2 / (r1 + r2);
  const current = VIN / (r1 + r2);

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Voltage Divider Explorer', canvasWidth / 2, 6);

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
    boardW = canvasWidth * 0.56;
    boardH = drawHeight - 44;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 44 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  if (mouseOverCanvas) flowPhase += 0.004 + constrain(current * 40, 0, 0.04);

  drawDivider(vOut, current);
  drawPanel(vOut, current);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The divider on the board
// ---------------------------------------------------------------------------

function drawDivider(vOut, current) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const rowY = bbRowY('c');

  const xR1 = bbColX(R1_COL);
  const xTap = bbColX(TAP_COL);
  const xR2 = bbColX(R2_COL);

  // Supply rail down into R1, R1 across to the tap, R2 across to ground
  stroke('crimson');
  strokeWeight(3);
  noFill();
  line(xR1, railPlus, xR1, rowY);

  drawResistorOn(xR1, xTap, rowY, 'R1', r1, r1Slider);
  drawResistorOn(xTap, xR2, rowY, 'R2', r2, r2Slider);

  stroke('dimgray');
  strokeWeight(3);
  line(xR2, rowY, xR2, railMinus);

  // Current dots along the series path, speed tied to the actual current
  drawFlow(xR1, xTap, xR2, rowY, railPlus, railMinus);

  // The probe clipped at the midpoint tap
  probeXY = { x: xTap, y: rowY };
  const glow = 18 + sin(flowPhase * 5) * 3;
  noStroke();
  fill(70, 130, 180, 90);
  circle(xTap, rowY, glow);
  fill('mediumblue');
  circle(xTap, rowY, 11);

  stroke('mediumblue');
  strokeWeight(2);
  line(xTap, rowY, xTap, rowY - BB.pitch * 2.2);
  noStroke();
  fill('mediumblue');
  textAlign(CENTER, BOTTOM);
  textSize(13);
  text('Vout = ' + nf(vOut, 1, 2) + ' V', xTap, rowY - BB.pitch * 2.4);

  hoverProbe = dist(mouseX, mouseY, xTap, rowY) <= 16;
  if (hoverProbe) drawProbeTooltip(vOut);

  // Rail labels
  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('Vin = ' + nf(VIN, 1, 1) + ' V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);
}

function drawResistorOn(x0, x1, y, label, ohms, slider) {
  // The resistor being dragged right now is highlighted warm orange.
  const active = slider && slider.elt === document.activeElement;
  const cx = (x0 + x1) / 2;
  const w = min(52, abs(x1 - x0) * 0.55);

  stroke(active ? '#E8710A' : 'peru');
  strokeWeight(3);
  noFill();
  line(x0, y, x1, y);

  noStroke();
  fill('wheat');
  rect(cx - w / 2, y - 8, w, 16, 3);
  fill('saddlebrown'); rect(cx - w / 2 + 5, y - 8, 3, 16);
  fill('black');       rect(cx - w / 2 + 12, y - 8, 3, 16);
  fill('firebrick');   rect(cx - w / 2 + 19, y - 8, 3, 16);

  noStroke();
  fill(active ? '#E8710A' : 'black');
  textAlign(CENTER, TOP);
  textSize(12);
  text(label + ' = ' + formatOhms(ohms), cx, y + 12);
}

// Dots travelling the series path so the shared current is visible.
function drawFlow(xR1, xTap, xR2, rowY, railPlus, railMinus) {
  const legs = [
    [xR1, railPlus, xR1, rowY],
    [xR1, rowY, xTap, rowY],
    [xTap, rowY, xR2, rowY],
    [xR2, rowY, xR2, railMinus]
  ];
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);

  const dots = 10;
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

function drawProbeTooltip(vOut) {
  const lines = [
    'Vout = Vin × R2 / (R1 + R2)',
    'Vout = ' + nf(VIN, 1, 1) + ' × ' + formatOhms(r2) + ' / (' + formatOhms(r1) + ' + ' + formatOhms(r2) + ')',
    'Vout = ' + nf(vOut, 1, 3) + ' V'
  ];
  textSize(13);
  let w = 0;
  for (const l of lines) w = max(w, textWidth(l));
  w += 20;
  const h = 18 * lines.length + 12;
  let x = mouseX + 14;
  let y = mouseY - h - 8;
  if (x + w > canvasWidth) x = canvasWidth - w - 4;
  if (y < 2) y = mouseY + 18;

  fill(255, 255, 255, 248);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, h, 6);

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  for (let i = 0; i < lines.length; i++) text(lines[i], x + 10, y + 7 + i * 18);
}

// ---------------------------------------------------------------------------
// Results panel - the equation with real numbers in it
// ---------------------------------------------------------------------------

function drawPanel(vOut, current) {
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
  text('Stage 1 — the inputs', padX, ty);
  ty += 20;
  fill('dimgray');
  textSize(13);
  text('Vin = ' + nf(VIN, 1, 1) + ' V     R1 = ' + formatOhms(r1) +
       '     R2 = ' + formatOhms(r2), padX, ty, innerW);
  ty += 34;

  fill('black');
  textSize(15);
  text('Stage 2 — the equation', padX, ty);
  ty += 20;
  fill('dimgray');
  textSize(13);
  text('Vout = Vin × R2 / (R1 + R2)', padX, ty, innerW);
  ty += 18;
  fill('mediumblue');
  text('Vout = ' + nf(VIN, 1, 1) + ' × ' + formatOhms(r2) + ' / (' +
       formatOhms(r1) + ' + ' + formatOhms(r2) + ')', padX, ty, innerW);
  ty += 34;

  fill('black');
  textSize(15);
  text('Stage 3 — the result', padX, ty);
  ty += 22;
  fill('darkorange');
  textSize(26);
  text(nf(vOut, 1, 2) + ' V', padX, ty);
  ty += 34;

  fill('gray');
  textSize(12);
  text('series current: ' + formatCurrent(current), padX, ty, innerW);
  ty += 20;

  // The one relationship worth naming out loud
  fill('dimgray');
  textSize(12);
  const pct = 100 * r2 / (r1 + r2);
  text('R2 is ' + nf(pct, 1, 0) + '% of the total resistance, so it takes ' +
       nf(pct, 1, 0) + '% of the supply voltage.', padX, ty, innerW);
}

function formatOhms(v) {
  if (v >= 1000) {
    const k = v / 1000;
    return (k === floor(k) ? k : nf(k, 1, 1)) + ' kΩ';
  }
  return v + ' Ω';
}

function formatCurrent(a) {
  const ma = a * 1000;
  if (ma >= 1) return nf(ma, 1, 2) + ' mA';
  return nf(ma * 1000, 1, 1) + ' µA';
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('R1: ' + formatOhms(r1), 10, drawHeight + 18 + 35);
  text('R2: ' + formatOhms(r2), 10, drawHeight + 18 + 70);
}

function resetAll() {
  r1Slider.value(50);
  r2Slider.value(50);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  const w = canvasWidth - sliderLeftMargin - margin;
  r1Slider.size(w);
  r2Slider.size(w);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
