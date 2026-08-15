// Virtual Multimeter on a Breadboard
// CANVAS_HEIGHT: 540
// Bloom Level: Apply (L3) - Verb: demonstrate, measure, verify
// Learning objective: Given a multimeter dial mode and a wired breadboard
// circuit with five labeled test-point pairs, select the correct mode for each
// measurement and read the resulting voltage, current, resistance or
// continuity result, connecting each reading to the concept it demonstrates.
//
// The circuit: 5 V -> R1 (220 ohm) -> SW1 -> D1 (red LED, Vf 1.9 V) -> ground,
// plus R2 (470 ohm) sitting off the circuit for out-of-circuit practice.
//
//   branch current = (5 - 1.9) / 220 = 14.1 mA when SW1 is closed
//
// The mode gate is the teaching device. Picking a test point that the current
// mode cannot measure does not just fail silently - it explains why, because
// "wrong mode for this measurement" is the mistake beginners actually make.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 460;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let modeButtons = [];
let swButton, resetButton;

// ---- State ----
let mode = 'OFF';            // 'OFF' | 'V' | 'mA' | 'Ohm' | 'Cont'
let swClosed = false;
let selected = null;         // test point id
let message = '';
let flowPhase = 0;
let beepPhase = 0;
let mouseOverCanvas = false;
let tpBoxes = {};
let panel = {};

const VS = 5.0;
const VF = 1.9;              // a red LED's forward drop
const R1 = 220;
const R2 = 470;
const COLS = 20;

// Which modes each test point can legitimately be measured in, and why.
const POINTS = {
  A: { label: 'A', modes: ['V'], where: 'across the battery terminals',
       teaches: 'The supply voltage the whole circuit works from.' },
  B: { label: 'B', modes: ['V'], where: 'across the LED D1',
       teaches: 'An LED drops a roughly fixed forward voltage once it conducts — ' +
                'it does not behave like a resistor.' },
  C: { label: 'C', modes: ['mA'], where: 'at a break in the LED branch',
       teaches: 'Current is measured IN SERIES: the circuit must be opened and ' +
                'the meter placed in the gap so the current flows through it.' },
  D: { label: 'D', modes: ['Cont'], where: 'across the switch SW1',
       teaches: 'Continuity checks whether a path is joined. A closed switch ' +
                'beeps; an open one does not.' },
  E: { label: 'E', modes: ['Ohm'], where: 'across R2, off to one side',
       teaches: 'Resistance is measured OUT OF CIRCUIT. R2 is deliberately not ' +
                'wired to anything — measuring a resistor still in a live ' +
                'circuit gives a wrong answer.' }
};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  const modes = [['V', 'V'], ['mA', 'mA'], ['Ohm', 'Ω'], ['Cont', 'Continuity']];
  let x = 10;
  for (const [key, label] of modes) {
    const b = createButton(label);
    b.position(x, drawHeight + 8);
    b.size(key === 'Cont' ? 92 : 52, 24);
    b.mousePressed(() => { mode = key; selected = null; message = ''; });
    modeButtons.push({ key: key, el: b });
    x += (key === 'Cont' ? 100 : 60);
  }

  swButton = createButton('SW1: OPEN');
  swButton.position(10, drawHeight + 44);
  swButton.mousePressed(() => {
    swClosed = !swClosed;
    swButton.html('SW1: ' + (swClosed ? 'CLOSED' : 'OPEN'));
  });

  resetButton = createButton('Reset');
  resetButton.position(130, drawHeight + 44);
  resetButton.mousePressed(resetAll);

  describe('A breadboard circuit with a 5 volt supply, a 220 ohm resistor, a ' +
           'switch and a red LED, plus a separate 470 ohm resistor off to one ' +
           'side. Choosing a multimeter mode lights up only the test points ' +
           'valid for it; clicking one shows the reading a real meter would ' +
           'give.', LABEL);
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

  const conducting = swClosed;
  const currentMa = conducting ? (VS - VF) / R1 * 1000 : 0;

  if (mouseOverCanvas) {
    if (conducting) flowPhase += 0.02;
    beepPhase += 0.06;
  }

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Virtual Multimeter', canvasWidth / 2, 6);

  const stacked = canvasWidth < 720;
  let boardX, boardY, boardW, boardH;
  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.48;
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

  drawCircuit(conducting, currentMa);
  drawPanel(conducting, currentMa);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(conducting, currentMa) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('c');

  const xR1 = bbColX(4);
  const xSw = bbColX(9);
  const xLed = bbColX(14);
  const xR2 = bbColX(18);

  const wire = conducting ? 'crimson' : '#C3C9CF';

  // supply -> R1 -> SW1 -> D1 -> ground
  stroke(wire);
  strokeWeight(3);
  noFill();
  line(xR1, railPlus, xR1, row);
  drawResistorGlyph(xR1, row, '220 Ω', 'R1');
  line(xR1 + 18, row, xSw - 16, row);
  drawSwitch(xSw, row, swClosed);
  line(xSw + 16, row, xLed - 16, row);
  drawLed(xLed, row, conducting);
  line(xLed, row + 16, xLed, railMinus);

  // R2 sits off the circuit entirely, for out-of-circuit practice
  drawResistorGlyph(xR2, bbRowY('h'), '470 Ω', 'R2');
  noStroke();
  fill('gray');
  textAlign(CENTER, TOP);
  textSize(10);
  text('not connected', xR2, bbRowY('h') + 14);

  if (conducting) {
    drawFlow([[xR1, railPlus, xR1, row], [xR1, row, xLed, row],
              [xLed, row, xLed, railMinus]], 6, 'crimson');
  }

  // Test points, drawn as bracket callouts
  tpBoxes = {};
  drawTestPoint('A', (BB.x + xR1) / 2, railPlus - 16);
  drawTestPoint('B', xLed, row - 30);
  drawTestPoint('C', (xR1 + xSw) / 2, row - 26);
  drawTestPoint('D', xSw, row + 28);
  drawTestPoint('E', xR2, bbRowY('h') - 24);

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text(VS + ' V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);
}

// A test point glows when the current mode can measure it, dims otherwise.
function drawTestPoint(id, x, y) {
  const p = POINTS[id];
  const valid = mode !== 'OFF' && p.modes.indexOf(mode) >= 0;
  const isSel = selected === id;

  const r = 15;
  tpBoxes[id] = { x: x - r, y: y - r, w: r * 2, h: r * 2 };

  noStroke();
  if (valid) {
    fill(232, 113, 10, 60 + sin(beepPhase) * 25);
    circle(x, y, r * 2.4);
  }
  fill(isSel ? '#E8710A' : (valid ? '#F6C08A' : '#D8DDE2'));
  circle(x, y, r * 2);

  fill(valid || isSel ? 'black' : 'gray');
  textAlign(CENTER, CENTER);
  textSize(13);
  text(id, x, y);
}

function drawSwitch(x, y, closed) {
  noStroke();
  fill(closed ? 'darkorange' : 'gainsboro');
  rect(x - 15, y - 11, 30, 22, 4);
  fill(closed ? 'saddlebrown' : 'darkslategray');
  circle(x, y, 11);
  noStroke();
  fill('black');
  textAlign(CENTER, BOTTOM);
  textSize(10);
  text('SW1', x, y - 14);
}

function drawLed(x, y, lit) {
  noStroke();
  if (lit) {
    fill(255, 120, 90, 100);
    circle(x, y, 34);
  }
  fill(lit ? '#FF5A4A' : '#D8DDE2');
  arc(x, y, 20, 24, PI, TWO_PI);
  rect(x - 10, y, 20, 6);
  stroke('#8B95A0');
  strokeWeight(2);
  line(x + 2, y + 6, x + 9, y + 6);
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text('D1', x, y + 18);
}

function drawResistorGlyph(cx, y, label, name) {
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
  text(name + '  ' + label, cx, y - 10);
}

function drawFlow(legs, size, col) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(5, floor(total / 34));
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
// Meter panel
// ---------------------------------------------------------------------------

function reading(id, conducting, currentMa) {
  if (id === 'A') return { text: nf(VS, 1, 2) + ' V', ok: true };
  if (id === 'B') return conducting
    ? { text: nf(VF, 1, 2) + ' V', ok: true }
    : { text: '0.00 V', ok: true, note: 'SW1 is open, so no current flows and the LED drops nothing.' };
  if (id === 'C') return conducting
    ? { text: nf(currentMa, 1, 1) + ' mA', ok: true }
    : { text: '0.0 mA', ok: true, note: 'SW1 is open, so the branch carries no current.' };
  if (id === 'D') return conducting
    ? { text: 'beep — continuous', ok: true, beep: true }
    : { text: 'no continuity', ok: true };
  if (id === 'E') return { text: nf(R2, 1, 0) + ' Ω', ok: true };
  return { text: '- - -', ok: false };
}

function drawPanel(conducting, currentMa) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // The meter display
  fill('gray');
  textSize(11);
  text('MODE: ' + (mode === 'OFF' ? 'OFF' : mode === 'Ohm' ? 'Ω' :
                   mode === 'Cont' ? 'CONTINUITY' : mode), padX, ty);
  ty += 16;

  const dispH = 56;
  noStroke();
  fill('darkslategray');
  rect(padX, ty, innerW, dispH, 6);
  textAlign(CENTER, CENTER);
  if (!selected) {
    fill('lightgray');
    textSize(24);
    text('- - -', padX + innerW / 2, ty + dispH / 2);
  } else {
    const r = reading(selected, conducting, currentMa);
    fill(r.beep ? 'lightgreen' : '#DCEBF5');
    textSize(r.text.length > 12 ? 19 : 26);
    text(r.text, padX + innerW / 2, ty + dispH / 2);
  }
  ty += dispH + 12;

  // Sound-wave marks while continuity beeps
  if (selected === 'D' && conducting) {
    noFill();
    for (let i = 0; i < 3; i++) {
      const rr = 10 + ((beepPhase * 14 + i * 9) % 27);
      stroke(60, 160, 90, map(rr, 10, 37, 200, 0));
      strokeWeight(2);
      arc(padX + 16, ty + 8, rr * 2, rr * 2, -QUARTER_PI, QUARTER_PI);
    }
    noStroke();
    fill('darkgreen');
    textAlign(LEFT, CENTER);
    textSize(12);
    text('the meter is beeping', padX + 44, ty + 8);
    ty += 30;
  }

  // What this measurement teaches
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  if (message) {
    fill('crimson');
    text(message, padX, ty, innerW);
  } else if (!selected) {
    fill('dimgray');
    text(mode === 'OFF'
      ? 'Pick a mode, then click a glowing test point to take a measurement.'
      : 'Only the test points valid for ' + mode + ' mode are lit. Click one.',
      padX, ty, innerW);
  } else {
    const p = POINTS[selected];
    const r = reading(selected, conducting, currentMa);
    fill('black');
    text('Test point ' + selected + ' — ' + p.where + '.', padX, ty, innerW);
    ty += 32;
    fill('mediumblue');
    text(p.teaches, padX, ty, innerW);
    ty += 56;
    if (r.note) {
      fill('sienna');
      text(r.note, padX, ty, innerW);
    }
  }
}

function drawControlLabels() {
  // Highlight whichever mode button is active by redrawing its label bold
  for (const m of modeButtons) {
    m.el.style('font-weight', mode === m.key ? 'bold' : 'normal');
    m.el.style('background-color', mode === m.key ? '#F6C08A' : '');
  }
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(12);
  text('pick a mode, then a glowing point', 210, drawHeight + 56);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0 || mouseY > drawHeight) return;
  for (const id in tpBoxes) {
    const b = tpBoxes[id];
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      if (mode === 'OFF') {
        message = 'The dial is OFF. Choose a mode first — a meter measures ' +
                  'nothing until you tell it what to measure.';
        selected = null;
      } else if (POINTS[id].modes.indexOf(mode) < 0) {
        // The instructive failure: name the right mode without just doing it
        const want = POINTS[id].modes[0];
        const nice = { V: 'volts', mA: 'milliamps', Ohm: 'ohms', Cont: 'continuity' };
        message = 'Test point ' + id + ' is ' + POINTS[id].where + ', so it needs ' +
                  nice[want] + ' mode, not ' + nice[mode] + '. Matching the dial ' +
                  'to the measurement is half of using a meter correctly.';
        selected = null;
      } else {
        selected = id;
        message = '';
      }
      return;
    }
  }
}

function resetAll() {
  mode = 'OFF';
  swClosed = false;
  selected = null;
  message = '';
  swButton.html('SW1: OPEN');
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
