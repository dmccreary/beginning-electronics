// Transistor Gate Explorer — NOT, NAND, NOR, XOR
// CANVAS_HEIGHT: 545
// Bloom Level: Apply (L3) - Verb: demonstrate, predict, verify
// Learning objective: Given a breadboard with a transistor-based NOT, NAND,
// NOR or XOR gate selected from a dropdown, predict and then verify the output
// LED's state and the matching truth-table row for every input combination.
//
// How each gate is built from what Chapter 13 taught:
//   NOT   one transistor. The LED hangs off the collector, so when the
//         transistor conducts it pulls that node LOW and the LED goes OUT.
//         Conducting = output low is the whole trick of inversion.
//   NAND  two in SERIES (an AND) feeding an inverting stage.
//   NOR   two in PARALLEL (an OR) feeding an inverting stage.
//   XOR   true only when the inputs DIFFER - the one gate that cannot be
//         built from a single series or parallel pair.
//
// The bubble on a gate symbol means exactly one thing: the output is inverted.
// NAND is AND with a bubble, NOR is OR with a bubble, and that is why their
// truth tables are the AND and OR tables turned upside down.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 465;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let gateSelect, resetButton;

// ---- State ----
let gate = 'NAND';
let a = false, b = false;
let btnBoxes = {};
let showSymbolInfo = false;
let symbolBox = null;
let mouseOverCanvas = false;
let panel = {};

const COLS = 20;

const GATES = {
  NOT:  { inputs: 1, fn: (x) => !x,
          build: 'One transistor. The LED sits on its collector, so when the ' +
                 'transistor conducts it pulls that point LOW and the LED goes out.',
          bubble: true, base: 'buffer' },
  NAND: { inputs: 2, fn: (x, y) => !(x && y),
          build: 'Two transistors in SERIES — an AND — feeding an inverting stage.',
          bubble: true, base: 'AND' },
  NOR:  { inputs: 2, fn: (x, y) => !(x || y),
          build: 'Two transistors in PARALLEL — an OR — feeding an inverting stage.',
          bubble: true, base: 'OR' },
  XOR:  { inputs: 2, fn: (x, y) => x !== y,
          build: 'True only when the inputs DIFFER. This is the one gate here ' +
                 'that cannot be made from a single series or parallel pair.',
          bubble: false, base: 'XOR' }
};

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

  gateSelect = createSelect();
  gateSelect.position(90, drawHeight + 10);
  for (const k in GATES) gateSelect.option(k);
  gateSelect.selected('NAND');
  gateSelect.changed(() => { gate = gateSelect.value(); a = false; b = false; showSymbolInfo = false; });

  resetButton = createButton('Reset');
  resetButton.position(200, drawHeight + 10);
  resetButton.mousePressed(() => { a = false; b = false; showSymbolInfo = false; });

  describe('A breadboard holding a transistor-built logic gate, selectable ' +
           'between NOT, NAND, NOR and XOR. Latching input buttons drive it, ' +
           'the output LED shows the result, and a live truth table fills in ' +
           'the row matching the current inputs beside a schematic gate symbol.', LABEL);
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

  const g = GATES[gate];
  const out = g.inputs === 1 ? g.fn(a) : g.fn(a, b);

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Transistor Gate Explorer', canvasWidth / 2, 6);

  const stacked = canvasWidth < 720;
  let boardX, boardY, boardW, boardH;
  if (stacked) {
    boardX = margin; boardY = 32;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.46;
    panel = { x: margin, y: boardY + boardH + 6, w: canvasWidth - 2 * margin,
              h: drawHeight - boardY - boardH - 12 };
  } else {
    boardX = margin; boardY = 32;
    boardW = canvasWidth * 0.55;
    boardH = drawHeight - 46;
    panel = { x: boardX + boardW + 10, y: 32, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 46 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  drawCircuit(g, out);
  drawPanel(g, out);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(g, out) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('c');

  const xT1 = bbColX(8), xT2 = bbColX(12);
  const xLed = bbColX(17);

  // Output side: LED and its resistor from the supply
  stroke(out ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  noFill();
  line(xLed, railPlus, xLed, row - 24);
  drawResistorGlyph(xLed, row - 16);
  drawLed(xLed, row, out);
  line(xLed, row + 14, xLed, railMinus);

  // The transistor arrangement for the selected gate
  btnBoxes = {};
  if (gate === 'NOT') {
    drawTransistorAt(xT1, row, a, 'A');
    stroke(a ? 'crimson' : '#C3C9CF');
    strokeWeight(3);
    line(xT1 + 16, row, xLed, row);
    drawInputButton(bbColX(4), row, 'A', a);
  } else if (gate === 'NAND') {
    // two in series, then the inverting stage
    drawTransistorAt(xT1, row + 26, a, 'A');
    drawTransistorAt(xT2, row + 26, b, 'B');
    stroke((a && b) ? 'crimson' : '#C3C9CF');
    strokeWeight(3);
    line(xT1 + 16, row + 26, xT2 - 16, row + 26);
    line(xT2 + 16, row + 26, xLed, row + 26);
    line(xLed, row + 14, xLed, row + 26);
    drawInputButton(bbColX(3), row - 20, 'A', a);
    drawInputButton(bbColX(6), row - 20, 'B', b);
    drawInverterTag(xLed, row + 40);
  } else if (gate === 'NOR') {
    // two in parallel, then the inverting stage
    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? xT1 : xT2;
      const on = i === 0 ? a : b;
      drawTransistorAt(x, row + 26, on, i === 0 ? 'A' : 'B');
      stroke(on ? 'crimson' : '#C3C9CF');
      strokeWeight(3);
      line(x, row + 34, x, row + 44);
      line(x, row + 44, xLed, row + 44);
    }
    stroke((a || b) ? 'crimson' : '#C3C9CF');
    line(xLed, row + 14, xLed, row + 44);
    drawInputButton(bbColX(3), row - 20, 'A', a);
    drawInputButton(bbColX(6), row - 20, 'B', b);
    drawInverterTag(xLed, row + 54);
  } else {
    // XOR: drawn as a labelled block, because a discrete XOR needs more
    // transistors than this board usefully shows.
    noStroke();
    fill('#3A4650');
    rect(xT1 - 24, row - 18, 72, 44, 5);
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(13);
    text('XOR', xT1 + 12, row + 4);
    stroke(out ? 'crimson' : '#C3C9CF');
    strokeWeight(3);
    line(xT1 + 48, row + 4, xLed, row + 4);
    line(xLed, row + 14, xLed, row + 4);
    drawInputButton(bbColX(3), row - 12, 'A', a);
    drawInputButton(bbColX(3), row + 22, 'B', b);
    stroke(a ? 'crimson' : '#C3C9CF');
    line(bbColX(3) + 16, row - 12, xT1 - 24, row - 6);
    stroke(b ? 'crimson' : '#C3C9CF');
    line(bbColX(3) + 16, row + 22, xT1 - 24, row + 14);
  }

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('+V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);
}

function drawInverterTag(x, y) {
  noStroke();
  fill('#6953B8');
  textAlign(CENTER, TOP);
  textSize(10);
  text('inverting stage', x, y);
}

function drawTransistorAt(x, y, on, label) {
  noStroke();
  fill(on ? '#3A4A3A' : '#2E2E2E');
  arc(x, y, 32, 32, PI, TWO_PI);
  rect(x - 16, y, 32, 8);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(9);
  text(label, x, y - 8);
}

function drawInputButton(x, y, key, down) {
  const w = 32, h = 26;
  btnBoxes[key] = { x: x - w / 2, y: y - h / 2, w: w, h: h };
  noStroke();
  fill(down ? 'darkorange' : 'gainsboro');
  rect(x - w / 2, y - h / 2, w, h, 4);
  fill(down ? 'saddlebrown' : 'darkslategray');
  circle(x, y, 12);
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text(key + ' = ' + (down ? '1' : '0'), x, y + h / 2 + 2);
}

function drawResistorGlyph(x, y) {
  noStroke();
  fill('wheat');
  rect(x - 7, y - 9, 14, 18, 2);
  fill('firebrick'); rect(x - 7, y - 3, 14, 3);
}

function drawLed(x, y, lit) {
  noStroke();
  if (lit) {
    fill(255, 200, 60, 130);
    circle(x, y, 34);
  }
  fill(lit ? 'gold' : '#D8DDE2');
  arc(x, y, 19, 22, PI, TWO_PI);
  rect(x - 9.5, y, 19, 5);
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text('Y = ' + (lit ? '1' : '0'), x, y + 16);
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function drawPanel(g, out) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 10;

  noStroke();
  textAlign(LEFT, TOP);

  fill('gray');
  textSize(11);
  text('HOW IT IS BUILT', padX, ty);
  ty += 15;
  fill('black');
  textSize(12);
  text(g.build, padX, ty, innerW);
  ty += 56;

  // gate symbol, clickable
  drawGateSymbol(padX + 40, ty + 22, g);
  symbolBox = { x: padX, y: ty, w: 96, h: 46 };
  noStroke();
  fill('dimgray');
  textAlign(LEFT, TOP);
  textSize(10);
  text('click the symbol', padX + 100, ty + 16);
  ty += 56;

  if (showSymbolInfo) {
    fill('#E8710A');
    textSize(11);
    text(g.bubble
      ? 'The small circle on the output is a bubble, and it means exactly one ' +
        'thing: the output is inverted. ' + gate + ' is ' + g.base + ' with a ' +
        'bubble, which is why its truth table is the ' + g.base + ' table turned ' +
        'upside down.'
      : 'No bubble on this one — XOR is not an inverted version of anything. ' +
        'It is true whenever the two inputs disagree.', padX, ty, innerW);
    ty += 68;
  }

  // truth table
  ty = drawTruthTable(g, padX, ty, innerW);

  fill('dimgray');
  textSize(11);
  const hint = gate === 'NAND' && !(a && b)
    ? 'Press A and B together — this is the one row where NAND disagrees with plain AND.'
    : 'Try every combination to fill in the whole table.';
  text(hint, padX, ty + 6, innerW);
}

function drawGateSymbol(x, y, g) {
  stroke('#3A4650');
  strokeWeight(2);
  fill('white');
  if (g.base === 'AND' || g.base === 'buffer') {
    beginShape();
    vertex(x - 20, y - 16); vertex(x + 2, y - 16);
    bezierVertex(x + 20, y - 16, x + 20, y + 16, x + 2, y + 16);
    vertex(x - 20, y + 16);
    endShape(CLOSE);
  } else {
    beginShape();
    vertex(x - 22, y - 16);
    bezierVertex(x - 10, y, x - 10, y, x - 22, y + 16);
    bezierVertex(x + 4, y + 16, x + 18, y + 8, x + 22, y);
    bezierVertex(x + 18, y - 8, x + 4, y - 16, x - 22, y - 16);
    endShape(CLOSE);
    if (g.base === 'XOR') {
      noFill();
      beginShape();
      vertex(x - 28, y - 16);
      bezierVertex(x - 16, y, x - 16, y, x - 28, y + 16);
      endShape();
    }
  }
  if (g.bubble) {
    fill('white');
    circle(x + 27, y, 9);
  }
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text(gate, x, y + 20);
}

function drawTruthTable(g, x, y, w) {
  const two = g.inputs === 2;
  const cols = two ? 3 : 2;
  const colW = w / cols;
  const rowH = 19;

  noStroke();
  fill('gray');
  textAlign(CENTER, TOP);
  textSize(11);
  text('A', x + colW * 0.5, y);
  if (two) text('B', x + colW * 1.5, y);
  text('Y', x + colW * (two ? 2.5 : 1.5), y);
  y += 16;

  const rows = two ? [[0, 0], [0, 1], [1, 0], [1, 1]] : [[0], [1]];
  const nowA = a ? 1 : 0, nowB = b ? 1 : 0;

  for (const r of rows) {
    const isNow = two ? (r[0] === nowA && r[1] === nowB) : (r[0] === nowA);
    const out = two ? (g.fn(r[0] === 1, r[1] === 1) ? 1 : 0)
                    : (g.fn(r[0] === 1) ? 1 : 0);

    if (isNow) {
      noStroke();
      fill(255, 236, 200);
      rect(x - 4, y - 2, w + 8, rowH, 3);
      fill('#E8710A');
      textAlign(LEFT, TOP);
      textSize(11);
      text('▸', x - 13, y);
    }
    noStroke();
    fill(isNow ? 'black' : '#98A1A9');
    textAlign(CENTER, TOP);
    textSize(12);
    text(r[0], x + colW * 0.5, y);
    if (two) text(r[1], x + colW * 1.5, y);
    // only the live row reveals its output; the rest are the learner's to find
    fill(isNow ? (out ? 'darkgreen' : 'crimson') : '#C3C9CF');
    text(isNow ? out : '?', x + colW * (two ? 2.5 : 1.5), y);
    y += rowH;
  }
  return y;
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Gate:', 10, drawHeight + 22);
  fill('dimgray');
  textSize(12);
  text('Click the A and B buttons on the board to toggle each input.',
       280, drawHeight + 22);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (symbolBox && mouseX >= symbolBox.x && mouseX <= symbolBox.x + symbolBox.w &&
      mouseY >= symbolBox.y && mouseY <= symbolBox.y + symbolBox.h) {
    showSymbolInfo = !showSymbolInfo;
    return;
  }
  for (const k in btnBoxes) {
    const bx = btnBoxes[k];
    if (mouseX >= bx.x && mouseX <= bx.x + bx.w && mouseY >= bx.y && mouseY <= bx.y + bx.h) {
      if (k === 'A') a = !a; else b = !b;
      return;
    }
  }
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
