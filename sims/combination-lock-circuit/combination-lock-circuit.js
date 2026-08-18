// Three-Button Combination Lock
// CANVAS_HEIGHT: 490
// Bloom Level: Understand (L2) / Apply (L3) - Verb: demonstrate, predict
// Learning objective: Given a series-wired, three-button combination lock
// circuit, predict and verify which combinations of held-down buttons light
// the "Unlocked" LED, and observe that the LED goes dark the instant any
// single button is released.
//
// This is Chapter 16's two-switch series-AND idea with a third switch added.
// Three switches in series means the path is complete only when ALL three are
// closed - there is no ordering, no memory, and no partial credit, which is
// exactly the point a learner should discover by trying combinations.
//
// Interaction note: the specification asks for press-and-hold, but a mouse has
// only one pointer, so three buttons could never be held at once and the lock
// could never open. Each button therefore LATCHES on click. The behaviour the
// objective actually cares about is unchanged: the LED lights only while all
// three are down, and clicking any one of them off breaks the path instantly.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let resetButton;

// ---- State ----
let held = [false, false, false];
let btnBoxes = [];
let flowPhase = 0;
let mouseOverCanvas = false;
let panel = {};

const COLS = 20;
const BTN_COLS = [4, 8, 12];
const LED_COL = 17;

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

  resetButton = createButton('Reset');
  resetButton.position(10, drawHeight + 10);
  resetButton.mousePressed(() => held = [false, false, false]);

  describe('A breadboard circuit with three momentary push buttons wired in ' +
           'series between the battery and an Unlocked LED. Holding all three ' +
           'buttons at once completes the path and lights the LED; releasing ' +
           'any one of them breaks it immediately.', LABEL);
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

  const count = held.filter(Boolean).length;
  const unlocked = count === 3;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Three-Button Combination Lock', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  let boardX, boardY, boardW, boardH;
  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.48;
    panel = { x: margin, y: boardY + boardH + 6, w: canvasWidth - 2 * margin,
              h: drawHeight - boardY - boardH - 12 };
  } else {
    boardX = margin; boardY = 30;
    boardW = canvasWidth * 0.60;
    boardH = drawHeight - 44;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 44 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  if (mouseOverCanvas && unlocked) flowPhase += 0.016;

  drawCircuit(unlocked);
  drawPanel(count, unlocked);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(unlocked) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('c');

  const xs = BTN_COLS.map(c => bbColX(c));
  const xLed = bbColX(LED_COL);
  const wireCol = unlocked ? 'crimson' : '#B9C0C7';

  // Supply down into the first button
  stroke(wireCol);
  strokeWeight(3);
  noFill();
  line(xs[0], railPlus, xs[0], row);

  // The three buttons in series along row c
  btnBoxes = [];
  for (let i = 0; i < 3; i++) {
    drawButton(xs[i], row, i);
    // wire from this button to the next thing along
    const nextX = (i < 2) ? xs[i + 1] : xLed;
    // a released button leaves a visible gap in its own segment
    if (held[i]) {
      stroke(wireCol);
      strokeWeight(3);
      line(xs[i] + 18, row, nextX - (i < 2 ? 18 : 16), row);
    } else {
      stroke('#B9C0C7');
      strokeWeight(3);
      line(xs[i] + 18, row, nextX - (i < 2 ? 18 : 16), row);
    }
  }

  // The Unlocked LED and its resistor, then down to ground
  drawResistorGlyph(xLed - 42, row);
  drawLed(xLed, row, unlocked);
  stroke(unlocked ? 'crimson' : '#B9C0C7');
  strokeWeight(3);
  line(xLed, row + 16, xLed, railMinus);

  if (unlocked) {
    drawFlow([[xs[0], railPlus, xs[0], row],
              [xs[0], row, xLed, row],
              [xLed, row, xLed, railMinus]], 6, 'crimson');
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

function drawButton(x, y, i) {
  const down = held[i];
  const w = 36, h = 30;
  const box = { x: x - w / 2, y: y - h / 2, w: w, h: h };
  btnBoxes.push(box);

  noStroke();
  fill(down ? 'darkorange' : 'gainsboro');
  rect(box.x, box.y, w, h, 5);
  fill(down ? 'saddlebrown' : 'darkslategray');
  circle(x, y, down ? 14 : 17);

  // A released button shows its contacts apart, so "open" is visible
  if (!down) {
    stroke('#8B95A0');
    strokeWeight(2);
    line(x - 14, y, x - 8, y);
    line(x + 8, y, x + 14, y);
  }

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('Button ' + (i + 1), x, y + h / 2 + 4);
  fill(down ? 'darkorange' : 'gray');
  textSize(10);
  text(down ? 'held' : 'click to hold', x, y + h / 2 + 18);
}

function drawResistorGlyph(cx, y) {
  noStroke();
  fill('wheat');
  rect(cx - 16, y - 7, 32, 14, 3);
  fill('saddlebrown'); rect(cx - 11, y - 7, 3, 14);
  fill('black');       rect(cx - 4, y - 7, 3, 14);
  fill('firebrick');   rect(cx + 3, y - 7, 3, 14);
}

function drawLed(x, y, lit) {
  noStroke();
  if (lit) {
    fill(120, 230, 140, 100);
    circle(x, y, 40);
  }
  fill(lit ? 'limegreen' : 'lightgray');
  arc(x, y, 24, 28, PI, TWO_PI);
  rect(x - 12, y, 24, 8);
  stroke('dimgray');
  strokeWeight(3);
  line(x + 3, y + 8, x + 12, y + 8);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('Unlocked', x, y + 22);
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
// Panel
// ---------------------------------------------------------------------------

function drawPanel(count, unlocked) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // The headline state
  fill(unlocked ? 'darkgreen' : 'sienna');
  textSize(24);
  text(unlocked ? 'UNLOCKED' : 'LOCKED', padX, ty);
  ty += 30;
  fill('gray');
  textSize(13);
  text(count + ' of 3 buttons held', padX, ty);
  ty += 28;

  // Each button's live state
  for (let i = 0; i < 3; i++) {
    const down = held[i];
    noStroke();
    fill(down ? 'darkorange' : '#C9CFD5');
    circle(padX + 8, ty + 7, 14);
    fill('black');
    textSize(13);
    textAlign(LEFT, TOP);
    text('Button ' + (i + 1) + ' — ' + (down ? 'held down' : 'released'), padX + 24, ty);
    ty += 24;
  }
  ty += 12;

  fill('black');
  textSize(13);
  if (unlocked) {
    text('All three are closed, so the path from + to ground is complete and ' +
         'the LED lights. Click any one of them off and it goes dark immediately.',
         padX, ty, innerW);
  } else {
    const missing = [];
    for (let i = 0; i < 3; i++) if (!held[i]) missing.push(i + 1);
    text('Buttons in series make one single path. Button' +
         (missing.length > 1 ? 's ' : ' ') + missing.join(' and ') +
         (missing.length > 1 ? ' are' : ' is') + ' still open, so the path is ' +
         'broken and no current flows.', padX, ty, innerW);
  }
  ty += 66;

  fill('gray');
  textSize(12);
  text('Order does not matter and nothing is remembered — the lock is open ' +
       'only during the moment all three are held together.', padX, ty, innerW);
}

function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  text('Click each button to hold it down. Try two, then all three, then release one.',
       80, drawHeight + 25);
}

// ---------------------------------------------------------------------------
// Interaction - press and hold
// ---------------------------------------------------------------------------

function mousePressed() {
  for (let i = 0; i < btnBoxes.length; i++) {
    const b = btnBoxes[i];
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      held[i] = !held[i];   // latches, so all three can be down at once
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
