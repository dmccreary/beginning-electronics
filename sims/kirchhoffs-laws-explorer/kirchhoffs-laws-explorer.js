// Kirchhoff's Laws Circuit Explorer
// CANVAS_HEIGHT: 650
// Bloom Level: Apply (L3) - Verb: calculate
// Learning objective: Calculate the voltage drop across each resistor in a
// series section and the current in each branch of a parallel section, by
// adjusting resistor-value sliders and confirming that voltage drops sum to
// the source voltage and that branch currents sum to the total current.
//
// Model:
//   Series section  - I = V / (R1 + R2), then V1 = I*R1 and V2 = I*R2
//                     Kirchhoff's Voltage Law: V1 + V2 = V
//   Parallel section - IA = V / RA, IB = V / RB
//                     Kirchhoff's Current Law: IA + IB = Itotal

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 430;
let controlHeight = 220;     // 6 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let sliderLeftMargin = 210;
let defaultTextSize = 16;

// ---- Controls ----
let r1Slider, r2Slider, raSlider, rbSlider, voltsSlider;
let randomizeButton;

// ---- Live values ----
let r1 = 300, r2 = 600, ra = 500, rb = 1000, volts = 9;

// Hit boxes for hover tooltips, recomputed each frame
let hitR1 = {}, hitR2 = {}, hitRA = {}, hitRB = {}, hitNode = {};
let hoverMsg = null;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  randomizeButton = createButton('Randomize Resistors');
  randomizeButton.position(10, drawHeight + 8);
  randomizeButton.mousePressed(randomizeResistors);

  r1Slider    = makeSlider(10, 1000, r1, 10, 1);
  r2Slider    = makeSlider(10, 1000, r2, 10, 2);
  raSlider    = makeSlider(10, 1000, ra, 10, 3);
  rbSlider    = makeSlider(10, 1000, rb, 10, 4);
  voltsSlider = makeSlider(1.5, 9, volts, 0.5, 5);

  describe('A circuit with a series section containing two resistors and a ' +
           'parallel section containing two branch resistors. Sliders set each ' +
           'resistor value and the source voltage. Live readouts show each ' +
           'voltage drop and each branch current, plus running totals ' +
           'confirming that voltage drops sum to the source voltage and branch ' +
           'currents sum to the total current.', LABEL);
}

// Sliders share one layout, one per control row.
function makeSlider(lo, hi, value, step, row) {
  const s = createSlider(lo, hi, value, step);
  s.position(sliderLeftMargin, drawHeight + 8 + row * 35);
  s.size(canvasWidth - sliderLeftMargin - margin);
  return s;
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

  // Read the controls
  r1 = r1Slider.value();
  r2 = r2Slider.value();
  ra = raSlider.value();
  rb = rbSlider.value();
  volts = voltsSlider.value();

  // ---- The circuit model ----
  const seriesI = volts / (r1 + r2);      // amps
  const v1 = seriesI * r1;
  const v2 = seriesI * r2;
  const iA = volts / ra;                  // amps
  const iB = volts / rb;
  const iTotal = iA + iB;

  hoverMsg = null;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  text("Kirchhoff's Laws Explorer", canvasWidth / 2, 8);

  drawSeriesSection(v1, v2, seriesI);
  drawParallelSection(iA, iB, iTotal);
  drawTotalsBox(v1, v2, iA, iB, iTotal);

  if (hoverMsg) drawTooltip(hoverMsg);

  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Series section - Kirchhoff's Voltage Law
// ---------------------------------------------------------------------------

function drawSeriesSection(v1, v2, seriesI) {
  const topY = 44;
  const secH = 150;
  const lx = margin + 10;
  const rx = canvasWidth - margin - 10;

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(17);
  text('Series section — voltage divides', lx, topY);

  const wireY = topY + 46;
  const botY = topY + secH - 26;

  // Wire loop
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  const battX = lx + 14;
  line(battX, wireY, rx - 10, wireY);
  line(rx - 10, wireY, rx - 10, botY);
  line(battX, botY, rx - 10, botY);
  line(battX, wireY, battX, wireY + 14);
  line(battX, botY - 14, battX, botY);

  // Battery plates
  stroke('darkorange');
  strokeWeight(4);
  line(battX - 16, wireY + 14, battX + 16, wireY + 14);
  stroke('dimgray');
  line(battX - 8, botY - 14, battX + 8, botY - 14);

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text(nf(volts, 1, 1) + ' V', battX + 22, (wireY + botY) / 2);

  // Two resistors sitting on the top wire
  const span = rx - 10 - (battX + 90);
  const rw = 78;
  const x1 = battX + 90 + span * 0.18;
  const x2 = battX + 90 + span * 0.62;

  hitR1 = drawSeriesResistor(x1, wireY, rw, 'R1', r1, v1, 'orange');
  hitR2 = drawSeriesResistor(x2, wireY, rw, 'R2', r2, v2, 'orange');

  // Voltage-share bars underneath each resistor
  const barY = wireY + 40;
  const barMax = span * 0.30;
  drawShareBar(x1, barY, barMax * (volts > 0 ? v1 / volts : 0), barMax, nf(v1, 1, 2) + ' V');
  drawShareBar(x2, barY, barMax * (volts > 0 ? v2 / volts : 0), barMax, nf(v2, 1, 2) + ' V');

  // Loop current readout
  noStroke();
  fill('dimgray');
  textAlign(RIGHT, CENTER);
  textSize(defaultTextSize);
  text('loop current: ' + nf(seriesI * 1000, 1, 1) + ' mA', rx - 14, botY + 12);

  if (inBox(hitR1, mouseX, mouseY)) {
    hoverMsg = 'R1 — a series resistor. Voltage divides across series ' +
               'resistors in proportion to resistance.';
  } else if (inBox(hitR2, mouseX, mouseY)) {
    hoverMsg = 'R2 — a series resistor. Voltage divides across series ' +
               'resistors in proportion to resistance.';
  }
}

// Draws a zigzag resistor centered at (cx, y). Returns its hit box.
function drawSeriesResistor(cx, y, w, label, ohms, drop, tint) {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;

  stroke('steelblue');
  strokeWeight(3);
  noFill();
  beginShape();
  vertex(x0, y);
  const zig = 6;
  const seg = w / zig;
  for (let i = 0; i < zig; i++) {
    vertex(x0 + seg * (i + 0.5), y + (i % 2 === 0 ? -11 : 11));
  }
  vertex(x1, y);
  endShape();

  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(defaultTextSize);
  text(label + ' = ' + ohms + ' Ω', cx, y - 18);

  return { x: x0 - 6, y: y - 18, w: w + 12, h: 36 };
}

// Horizontal bar showing this resistor's share of the source voltage.
function drawShareBar(cx, y, filled, full, label) {
  const x = cx - full / 2;
  noStroke();
  fill('gainsboro');
  rect(x, y, full, 16, 4);
  fill('darkorange');
  rect(x, y, constrain(filled, 0, full), 16, 4);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(14);
  text(label, cx, y + 19);
}

// ---------------------------------------------------------------------------
// Parallel section - Kirchhoff's Current Law
// ---------------------------------------------------------------------------

function drawParallelSection(iA, iB, iTotal) {
  const topY = 208;
  const lx = margin + 10;
  const rx = canvasWidth - margin - 10;

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(17);
  text('Parallel section — current splits', lx, topY);

  const nodeX = lx + 90;
  const nodeY = topY + 60;
  const branchAY = nodeY - 26;
  const branchBY = nodeY + 34;
  const endX = rx - 16;

  // Incoming wire and the junction node
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  line(lx + 6, nodeY, nodeX, nodeY);
  line(nodeX, branchAY, nodeX, branchBY);
  line(nodeX, branchAY, endX, branchAY);
  line(nodeX, branchBY, endX, branchBY);

  // Branch resistors
  hitRA = drawBranchResistor((nodeX + endX) / 2, branchAY, 72, 'RA', ra);
  hitRB = drawBranchResistor((nodeX + endX) / 2, branchBY, 72, 'RB', rb);

  // Current arrows in - and the two branches out
  drawCurrentArrow(lx + 20, nodeY, 1, nf(iTotal * 1000, 1, 1) + ' mA in');
  drawCurrentArrow(nodeX + 26, branchAY, 1, nf(iA * 1000, 1, 1) + ' mA');
  drawCurrentArrow(nodeX + 26, branchBY, 1, nf(iB * 1000, 1, 1) + ' mA');

  // The junction node itself, drawn last so it sits on top
  noStroke();
  fill('mediumblue');
  circle(nodeX, nodeY, 14);
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text('junction', nodeX, nodeY - 12);

  hitNode = { x: nodeX - 16, y: nodeY - 16, w: 32, h: 32 };

  if (inBox(hitRA, mouseX, mouseY)) {
    hoverMsg = 'RA — a parallel branch resistor. Each branch sees the full ' +
               'source voltage, so the smaller resistor carries more current.';
  } else if (inBox(hitRB, mouseX, mouseY)) {
    hoverMsg = 'RB — a parallel branch resistor. Each branch sees the full ' +
               'source voltage, so the smaller resistor carries more current.';
  } else if (inBox(hitNode, mouseX, mouseY)) {
    hoverMsg = 'Junction node — current entering a junction equals the total ' +
               'current leaving it.';
  }
}

function drawBranchResistor(cx, y, w, label, ohms) {
  const x0 = cx - w / 2;
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  beginShape();
  vertex(x0, y);
  const zig = 6;
  const seg = w / zig;
  for (let i = 0; i < zig; i++) {
    vertex(x0 + seg * (i + 0.5), y + (i % 2 === 0 ? -9 : 9));
  }
  vertex(cx + w / 2, y);
  endShape();

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(14);
  text(label + ' = ' + ohms + ' Ω', cx + w / 2 + 8, y);

  return { x: x0 - 6, y: y - 14, w: w + 12, h: 28 };
}

// Small blue arrow marking current direction, with a value label above it.
function drawCurrentArrow(x, y, dir, label) {
  push();
  translate(x, y);
  noStroke();
  fill('mediumblue');
  triangle(9 * dir, 0, -5 * dir, -6, -5 * dir, 6);
  pop();

  noStroke();
  fill('mediumblue');
  textAlign(CENTER, BOTTOM);
  textSize(14);
  text(label, x + 4, y - 8);
}

// ---------------------------------------------------------------------------
// Running totals - the payoff panel
// ---------------------------------------------------------------------------

function drawTotalsBox(v1, v2, iA, iB, iTotal) {
  const x = margin;
  const y = drawHeight - 84;
  const w = canvasWidth - 2 * margin;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, 72, 10);

  const vSum = v1 + v2;
  const iSum = iA + iB;

  noStroke();
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);

  fill('black');
  const vLine = 'Voltage drops: ' + nf(v1, 1, 2) + ' + ' + nf(v2, 1, 2) +
                ' = ' + nf(vSum, 1, 2) + ' V   (source: ' + nf(volts, 1, 1) + ' V)';
  text(vLine, x + 12, y + 22);

  const iLine = 'Branch currents: ' + nf(iA * 1000, 1, 1) + ' + ' + nf(iB * 1000, 1, 1) +
                ' = ' + nf(iSum * 1000, 1, 1) + ' mA   (total: ' + nf(iTotal * 1000, 1, 1) + ' mA)';
  text(iLine, x + 12, y + 50);

  // The balance check. These are real physical laws, so they always balance -
  // which is exactly the point the learner should notice.
  drawCheck(x + w - 30, y + 22, abs(vSum - volts) < 0.001);
  drawCheck(x + w - 30, y + 50, abs(iSum - iTotal) < 1e-9);
}

function drawCheck(x, y, ok) {
  if (!ok) return;
  stroke('green');
  strokeWeight(3);
  noFill();
  line(x - 7, y, x - 2, y + 6);
  line(x - 2, y + 6, x + 8, y - 7);
}

// ---------------------------------------------------------------------------
// Tooltip and control labels
// ---------------------------------------------------------------------------

function drawTooltip(msg) {
  textSize(14);
  const w = min(300, textWidth(msg) + 20);
  const lines = ceil(textWidth(msg) / (w - 20));
  const h = 14 + lines * 18;
  let x = mouseX + 14;
  let y = mouseY - h - 8;
  if (x + w > canvasWidth) x = canvasWidth - w - 4;
  if (y < 2) y = mouseY + 18;

  fill(255, 255, 255, 245);
  stroke('gray');
  strokeWeight(1);
  rect(x, y, w, h, 6);

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  text(msg, x + 10, y + 7, w - 20);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('R1 (series): ' + r1 + ' Ω',    10, drawHeight + 18 + 1 * 35);
  text('R2 (series): ' + r2 + ' Ω',    10, drawHeight + 18 + 2 * 35);
  text('RA (parallel): ' + ra + ' Ω',  10, drawHeight + 18 + 3 * 35);
  text('RB (parallel): ' + rb + ' Ω',  10, drawHeight + 18 + 4 * 35);
  text('Source: ' + nf(volts, 1, 1) + ' V', 10, drawHeight + 18 + 5 * 35);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

// Jump to a fresh combination so learners test the laws on new numbers.
function randomizeResistors() {
  r1Slider.value(round(random(1, 100)) * 10);
  r2Slider.value(round(random(1, 100)) * 10);
  raSlider.value(round(random(1, 100)) * 10);
  rbSlider.value(round(random(1, 100)) * 10);
}

function inBox(b, px, py) {
  return b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
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
  raSlider.size(w);
  rbSlider.size(w);
  voltsSlider.size(w);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
