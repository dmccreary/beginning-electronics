// 7805 Regulator and Dropout
// CANVAS_HEIGHT: 540
// Bloom Level: Apply (L3) - Verb: demonstrate, calculate
// Learning objective: Given a rendered breadboard circuit with a 7805
// regulator, a 334 input bypass capacitor, a 104 output bypass capacitor and
// an LED output indicator, adjust the input voltage and observe the point at
// which the regulated 5 V output stops holding steady, calculating the
// dropout voltage from the observed transition.
//
// Model:
//   Vin >= 7 V  ->  Vout = 5.00 V exactly      (regulating)
//   Vin <  7 V  ->  Vout = Vin - 2 V           (dropped out, just following)
//
// The 2 V gap IS the dropout voltage, and the learner is meant to read it off
// the transition rather than be told: the output holds at 5 V until the input
// falls to 7 V, and 7 - 5 = 2. A linear regulator can only ever step DOWN,
// and it needs that much headroom to do it.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 460;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 210;
let defaultTextSize = 16;

// ---- Controls ----
let vinSlider, powerButton, resetButton;

// ---- State ----
let vin = 9;
let powered = false;
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverPart = null;
let spots = {};
let panel = {};

const DROPOUT = 2.0;         // the 7805's headroom requirement
const VREG = 5.0;
const LED_VF = 1.9;
const RLED = 470;
const COLS = 20;
const REG_COL = 8;

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

  powerButton = createButton('Power On');
  powerButton.position(10, drawHeight + 10);
  powerButton.mousePressed(() => {
    powered = !powered;
    powerButton.html(powered ? 'Power Off' : 'Power On');
  });

  resetButton = createButton('Reset');
  resetButton.position(105, drawHeight + 10);
  resetButton.mousePressed(() => { powered = false; powerButton.html('Power On'); vinSlider.value(9); });

  vinSlider = createSlider(0, 15, vin, 0.1);
  vinSlider.position(sliderLeftMargin, drawHeight + 45);
  vinSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A breadboard circuit with a 7805 regulator, a 334 input bypass ' +
           'capacitor, a 104 output bypass capacitor and an LED output ' +
           'indicator. An input-voltage slider changes Vin while a two-line ' +
           'meter shows Vin and Vout, so the point where the regulated 5 volt ' +
           'output stops holding can be found.', LABEL);
}

// The regulator model. This is the whole physics of the sim.
function vout(v) {
  if (!powered) return 0;
  return v >= VREG + DROPOUT ? VREG : max(0, v - DROPOUT);
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

  vin = vinSlider.value();
  const vo = vout(vin);
  const regulating = powered && vin >= VREG + DROPOUT;
  const ledMa = vo > LED_VF ? (vo - LED_VF) / RLED * 1000 : 0;

  if (mouseOverCanvas && powered) flowPhase += 0.02;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('7805 Regulator and Dropout', canvasWidth / 2, 6);

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

  drawCircuit(vo, regulating, ledMa);
  drawPanel(vo, regulating, ledMa);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(vo, regulating, ledMa) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('d');

  const xIn = bbColX(3);
  const xReg = bbColX(REG_COL);
  const xOut = bbColX(13);
  const xLed = bbColX(17);

  const inLive = powered && vin > 0.1;
  const outLive = vo > 0.1;

  // input rail into the regulator, with the 334 bypass to ground
  stroke(inLive ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  noFill();
  line(xIn, railPlus, xIn, row);
  line(xIn, row, xReg - 26, row);
  drawCap(xIn, row, railMinus, '334', 'capIn', inLive);

  drawRegulator(xReg, row);

  // output side, with the 104 bypass, then the LED indicator
  stroke(outLive ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(xReg + 26, row, xLed, row);
  drawCap(xOut, row, railMinus, '104', 'capOut', outLive);

  drawResistorGlyph((xReg + 26 + xLed) / 2 + 10, row);
  drawLed(xLed, row, ledMa);
  stroke(outLive ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(xLed, row + 18, xLed, railMinus);

  if (inLive) drawFlow([[xIn, railPlus, xIn, row], [xIn, row, xReg - 26, row]], 6, 'crimson');
  if (ledMa > 0.2) {
    drawFlow([[xReg + 26, row, xLed, row], [xLed, row, xLed, railMinus]], 6, 'crimson');
  }

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(powered ? nf(vin, 1, 1) + ' V in' : 'off', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  // Which part is hovered
  hoverPart = null;
  for (const k in spots) {
    const s = spots[k];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) hoverPart = k;
  }
}

// A TO-220 body with its tab, straddling the board.
function drawRegulator(x, y) {
  noStroke();
  fill('#3A3A3A');
  rect(x - 26, y - 30, 52, 40, 3);
  fill('#8B939B');
  rect(x - 26, y - 40, 52, 12, 2);
  fill('#2A2A2A');
  circle(x, y - 34, 7);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(11);
  text('7805', x, y - 12);

  // three legs: Vin, GND, Vout
  stroke('#9AA3AB');
  strokeWeight(3);
  for (let i = -1; i <= 1; i++) line(x + i * 20, y + 10, x + i * 20, y + 20);

  // Vin and Vout sit on one line, GND drops to a second, or the three names
  // run into each other at this scale.
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(9);
  text('Vin', x - 20, y + 22);
  text('Vout', x + 20, y + 22);
  text('GND', x, y + 33);

  spots.reg = { x: x - 30, y: y - 44, w: 60, h: 70 };
  if (hoverPart === 'reg') {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(spots.reg.x, spots.reg.y, spots.reg.w, spots.reg.h, 4);
  }
}

// A ceramic bypass capacitor from the rail down to ground.
function drawCap(x, y, groundY, code, key, live) {
  stroke(live ? 'crimson' : '#C3C9CF');
  strokeWeight(2);
  line(x, y, x, y + 22);
  line(x, y + 34, x, groundY);

  noStroke();
  fill('#C8A66B');
  ellipse(x, y + 28, 26, 20);
  fill('black');
  textAlign(CENTER, CENTER);
  textSize(10);
  text(code, x, y + 28);

  spots[key] = { x: x - 16, y: y + 16, w: 32, h: 26 };
  if (hoverPart === key) {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(spots[key].x, spots[key].y, 32, 26, 4);
  }
}

function drawResistorGlyph(cx, y) {
  noStroke();
  fill('wheat');
  rect(cx - 16, y - 7, 32, 14, 3);
  fill('firebrick'); rect(cx - 4, y - 7, 3, 14);
  noStroke();
  fill('gray');
  textAlign(CENTER, BOTTOM);
  textSize(9);
  text('470 Ω', cx, y - 10);
}

function drawLed(x, y, ma) {
  const b = constrain(ma / 6.6, 0, 1);   // 6.6 mA is full brightness at 5 V
  noStroke();
  if (b > 0.02) {
    fill(255, 110, 90, 120 * b);
    circle(x, y, 34 + b * 10);
  }
  fill(b > 0.02 ? color(255, 90 + 60 * b, 70) : '#D8DDE2');
  arc(x, y, 20, 24, PI, TWO_PI);
  rect(x - 10, y, 20, 6);
  stroke('#8B95A0');
  strokeWeight(2);
  line(x + 2, y + 6, x + 9, y + 6);
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

function drawPanel(vo, regulating, ledMa) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // Two-line meter, the core readout
  fill('gray');
  textSize(11);
  text('VOLTMETER', padX, ty);
  ty += 16;
  noStroke();
  fill('darkslategray');
  rect(padX, ty, innerW, 74, 6);
  fill('#DCEBF5');
  textAlign(LEFT, CENTER);
  textSize(19);
  text('Vin   ' + (powered ? nf(vin, 1, 2) + ' V' : '— off —'), padX + 14, ty + 22);
  fill(regulating ? 'lightgreen' : (powered ? 'lightcoral' : '#DCEBF5'));
  text('Vout  ' + (powered ? nf(vo, 1, 2) + ' V' : '— off —'), padX + 14, ty + 52);
  ty += 84;

  textAlign(LEFT, TOP);

  // The state, and the number the learner is meant to derive
  fill('gray');
  textSize(11);
  text('REGULATOR STATE', padX, ty);
  ty += 16;
  if (!powered) {
    fill('dimgray');
    textSize(13);
    text('Power is off. Switch it on, then slide Vin down below about 7 V and ' +
         'watch what happens to Vout.', padX, ty, innerW);
    ty += 44;
  } else if (regulating) {
    fill('darkgreen');
    textSize(15);
    text('Regulating', padX, ty);
    ty += 22;
    fill('black');
    textSize(12);
    text('Vout is locked at ' + nf(VREG, 1, 2) + ' V and does not move, however ' +
         'much you raise Vin. The extra voltage is burned off as heat inside ' +
         'the 7805.', padX, ty, innerW);
    ty += 56;
  } else {
    fill('crimson');
    textSize(15);
    text('Dropped out', padX, ty);
    ty += 22;
    fill('black');
    textSize(12);
    text('Vin is too low for the regulator to hold 5 V, so Vout simply follows ' +
         'it down, about ' + nf(DROPOUT, 1, 1) + ' V below. A linear regulator ' +
         'can only step DOWN — it cannot make voltage it was never given.',
         padX, ty, innerW);
    ty += 68;
  }

  // The dropout figure, derived from the transition
  fill('gray');
  textSize(11);
  text('DROPOUT VOLTAGE', padX, ty);
  ty += 16;
  fill('mediumblue');
  textSize(13);
  text('Vout holds until Vin falls to ' + nf(VREG + DROPOUT, 1, 1) + ' V, and ' +
       nf(VREG + DROPOUT, 1, 1) + ' − ' + nf(VREG, 1, 1) + ' = ' +
       nf(DROPOUT, 1, 1) + ' V. That gap is the headroom the 7805 needs.',
       padX, ty, innerW);
  ty += 56;

  // Hover explanations
  const notes = {
    capIn: 'The 334 input bypass capacitor — 33 followed by 4 zeros = 330,000 pF ' +
           '= 0.33 µF. It steadies the input against the dips a long supply lead ' +
           'introduces.',
    capOut: 'The 104 output bypass capacitor — 10 followed by 4 zeros = 100,000 pF ' +
            '= 0.1 µF. It keeps the output stable when the load current changes ' +
            'suddenly.',
    reg: 'The 7805 in a TO-220 package. Three pins, left to right: Vin, GND, ' +
         'Vout. The metal tab is a heatsink — everything it drops gets burned ' +
         'off there as heat.'
  };
  if (hoverPart && notes[hoverPart]) {
    fill('#E8710A');
    textSize(12);
    text(notes[hoverPart], padX, ty, innerW);
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Vin: ' + nf(vin, 1, 1) + ' V', 10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  vinSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
