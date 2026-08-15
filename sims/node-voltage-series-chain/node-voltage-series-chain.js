// Node Voltage in a Series Chain
// CANVAS_HEIGHT: 585
// Bloom Level: Apply (L3) - Verb: calculate
// Learning objective: Calculate the total series resistance, the loop current,
// and the node voltage at each junction of a three-resistor series chain, by
// adjusting resistor-value sliders and reading live labeled readouts at each node.
//
// Model:
//   Rtotal = R1 + R2 + R3
//   I      = V / Rtotal                      (the same current everywhere in a series loop)
//   Node A = V                               (top of the chain, straight off the battery)
//   Node B = V - I*R1
//   Node C = V - I*R1 - I*R2
//   Node D = V - I*R1 - I*R2 - I*R3 = 0      (the ground reference)

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 400;
let controlHeight = 185;     // 5 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// ---- Controls ----
let r1Slider, r2Slider, r3Slider, voltsSlider;
let exampleButton;

// ---- Live values ----
let r1 = 100, r2 = 220, r3 = 330, volts = 9;

// Node hit boxes for hover tooltips
let nodeHits = [];
let hoverMsg = null;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  exampleButton = createButton('Load Example');
  exampleButton.position(10, drawHeight + 8);
  exampleButton.mousePressed(loadExample);

  r1Slider    = makeSlider(10, 1000, r1, 10, 1);
  r2Slider    = makeSlider(10, 1000, r2, 10, 2);
  r3Slider    = makeSlider(10, 1000, r3, 10, 3);
  voltsSlider = makeSlider(1.5, 9, volts, 0.5, 4);

  describe('A single-loop circuit with a battery and three resistors in series. ' +
           'Four labeled node dots show the live voltage at each junction. ' +
           'Sliders set each resistor value and the source voltage, and a ' +
           'summary box reports the total series resistance and loop current.', LABEL);
}

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

  r1 = r1Slider.value();
  r2 = r2Slider.value();
  r3 = r3Slider.value();
  volts = voltsSlider.value();

  // ---- The series-circuit model ----
  const rTotal = r1 + r2 + r3;
  const current = volts / rTotal;             // amps
  const vA = volts;
  const vB = volts - current * r1;
  const vC = volts - current * r1 - current * r2;
  const vD = 0;                               // ground reference

  hoverMsg = null;
  nodeHits = [];

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  text('Node Voltage in a Series Chain', canvasWidth / 2, 8);

  drawCircuit(vA, vB, vC, vD, current);
  drawSummary(rTotal, current);
  if (hoverMsg) drawTooltip(hoverMsg);

  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(vA, vB, vC, vD, current) {
  const lx = margin + 20;
  const rx = canvasWidth - margin - 20;
  const topY = 92;
  const botY = 250;

  // The chain runs left to right across the top wire. The battery sits on the
  // left edge, and the return path runs back along the bottom.
  const chainL = lx + 40;
  const chainR = rx - 10;
  const span = chainR - chainL;
  const rw = min(78, span / 4.4);

  // Node x positions: A before R1, B between R1 and R2, C between R2 and R3,
  // D after R3 (which is the ground / battery-negative reference).
  const xA = chainL;
  const xB = chainL + span * 0.34;
  const xC = chainL + span * 0.67;
  const xD = chainR;

  // Wires
  stroke('steelblue');
  strokeWeight(3);
  noFill();
  line(xA, topY, xD, topY);          // top rail carries all three resistors
  line(xD, topY, xD, botY);
  line(lx, botY, xD, botY);
  line(lx, topY, xA, topY);

  // Battery sits mid-way down the left edge, with a small gap between plates
  const midY = (topY + botY) / 2;
  line(lx, topY, lx, midY - 9);
  line(lx, midY + 9, lx, botY);

  stroke('darkorange');
  strokeWeight(4);
  line(lx - 17, midY - 9, lx + 17, midY - 9);   // long plate = positive
  stroke('dimgray');
  line(lx - 9, midY + 9, lx + 9, midY + 9);     // short plate = negative

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text(nf(volts, 1, 1) + ' V', lx + 23, midY);

  // Resistors sit between consecutive node pairs
  drawResistor((xA + xB) / 2, topY, rw, 'R1', r1);
  drawResistor((xB + xC) / 2, topY, rw, 'R2', r2);
  drawResistor((xC + xD) / 2, topY, rw, 'R3', r3);

  // Node dots and their live voltage bubbles
  drawNode(xA, topY, 'A', vA, 'Node A sits straight off the battery, so it is ' +
           'at the full source voltage.');
  drawNode(xB, topY, 'B', vB, 'Node B is the source voltage minus the drop ' +
           'across R1.');
  drawNode(xC, topY, 'C', vC, 'Node C is the source voltage minus the drops ' +
           'across R1 and R2.');
  drawNode(xD, topY, 'D', vD, 'Node D is the ground reference. Every drop has ' +
           'been used up, so it sits at 0 V.');

  // Loop-current reminder along the return path
  noStroke();
  fill('mediumblue');
  textAlign(CENTER, TOP);
  textSize(defaultTextSize);
  text('same current everywhere: ' + nf(current * 1000, 1, 2) + ' mA',
       (lx + xD) / 2, botY + 8);
}

function drawResistor(cx, y, w, label, ohms) {
  const x0 = cx - w / 2;
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
  vertex(cx + w / 2, y);
  endShape();

  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(15);
  text(label + ' = ' + ohms + ' Ω', cx, y - 18);
}

// A node dot with its voltage in a bubble below the wire.
function drawNode(x, y, label, v, tip) {
  noStroke();
  fill('darkorange');
  circle(x, y, 13);

  // Voltage bubble
  const txt = nf(v, 1, 2) + ' V';
  textSize(15);
  const w = textWidth(txt) + 16;
  const bx = x - w / 2;
  const by = y + 14;

  fill('papayawhip');
  stroke('darkorange');
  strokeWeight(1);
  rect(bx, by, w, 24, 6);

  noStroke();
  fill('saddlebrown');
  textAlign(CENTER, CENTER);
  text(txt, x, by + 12);

  // Node letter above the wire
  fill('black');
  textSize(15);
  textAlign(CENTER, BOTTOM);
  text(label, x, y - 34);

  const hb = { x: x - 14, y: y - 14, w: 28, h: 28 };
  nodeHits.push(hb);
  if (mouseX >= hb.x && mouseX <= hb.x + hb.w && mouseY >= hb.y && mouseY <= hb.y + hb.h) {
    hoverMsg = 'Node ' + label + ' = ' + nf(v, 1, 2) + ' V. ' + tip;
  }
}

// ---------------------------------------------------------------------------
// Summary box
// ---------------------------------------------------------------------------

function drawSummary(rTotal, current) {
  const x = margin;
  const y = drawHeight - 96;
  const w = canvasWidth - 2 * margin;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, 84, 10);

  noStroke();
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);

  fill('black');
  text('Series Resistance:  ' + r1 + ' + ' + r2 + ' + ' + r3 + ' = ' + rTotal + ' Ω',
       x + 14, y + 24);
  text('Loop Current:  ' + nf(volts, 1, 1) + ' V ÷ ' + rTotal + ' Ω = ' +
       nf(current * 1000, 1, 2) + ' mA', x + 14, y + 56);
}

function drawTooltip(msg) {
  textSize(14);
  const w = min(320, canvasWidth - 20);
  const h = 54;
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
  text(msg, x + 10, y + 8, w - 20);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('R1: ' + r1 + ' Ω', 10, drawHeight + 18 + 1 * 35);
  text('R2: ' + r2 + ' Ω', 10, drawHeight + 18 + 2 * 35);
  text('R3: ' + r3 + ' Ω', 10, drawHeight + 18 + 3 * 35);
  text('Source: ' + nf(volts, 1, 1) + ' V', 10, drawHeight + 18 + 4 * 35);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

// The chapter's worked example.
function loadExample() {
  r1Slider.value(100);
  r2Slider.value(220);
  r3Slider.value(330);
  voltsSlider.value(9);
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
  r3Slider.size(w);
  voltsSlider.size(w);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
