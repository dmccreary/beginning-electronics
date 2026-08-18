// Breadboard Troubleshooting Detective
// CANVAS_HEIGHT: 530
// Bloom Level: Analyze (L4) - Verb: examine, distinguish
// Learning objective: Given a rendered breadboard circuit (battery, resistor,
// LED) with exactly one hidden fault — a loose connection, a bent component
// lead, wrong row placement, or breadboard contact wear — inspect the circuit,
// form a hypothesis about the cause, and use a virtual swap test to confirm or
// reject that hypothesis, changing only one variable at a time.
//
// The board comes from breadboard-lib.js, the same renderer used elsewhere in
// this book. A wrong swap test deliberately does NOT reveal the answer: it
// explains why the evidence does not fit that hypothesis and sends the learner
// back to inspect, which is the actual habit the chapter is teaching.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 450;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let defaultTextSize = 16;

// ---- Controls ----
let powerButton;
let swapButton;
let newFaultButton;
let hypothesisSelect;

// ---- State ----
let powered = false;
let fault = 'loose';
let fixed = false;
let inspecting = null;      // which spot the learner last inspected
let result = null;          // { ok, msg } from the last swap test
let flowPhase = 0;
let mouseOverCanvas = false;
let spots = {};             // inspectable regions, recomputed each frame
let panel = {};

const COLS = 20;

// Where each part sits. The circuit is battery rail -> resistor -> LED -> ground.
const RES_COL = 6;
const LED_COL = 13;

const FAULTS = {
  loose: {
    label: 'Loose Connection',
    // The spot whose close-up gives the fault away, and what it looks like.
    tell: 'powerWire',
    fix: 'You reseated the power jumper and it clicked home.',
    real: 'The power jumper was only half-inserted. It looked seated from above, ' +
          'but it never reached the metal clip inside the tie point.'
  },
  bent: {
    label: 'Bent Lead',
    tell: 'ledLead',
    fix: 'You straightened the LED lead and pushed it fully into the hole.',
    real: "The LED's lead was folded under the body, so it was resting against " +
          'the board instead of going into the hole.'
  },
  wrongRow: {
    label: 'Wrong Row',
    tell: 'resistor',
    fix: 'You moved the resistor into the row that actually joins the LED.',
    real: 'The resistor was one row away from the LED, so the two were never ' +
          'in the same tie point group — the circuit was open between them.'
  },
  wear: {
    label: 'Contact Wear',
    tell: 'ledHole',
    fix: 'You moved the LED to a fresh tie point and it gripped properly.',
    real: 'That tie point had been used too many times and its clip no longer ' +
          'gripped. The lead was in the hole but not making contact.'
  }
};

// What each inspectable spot looks like up close. The entry for the active
// fault's "tell" spot is the evidence; every other spot reads as normal.
const NORMAL_LOOK = {
  powerWire: 'The power jumper runs from the + rail to the resistor row. It sits flush against the board.',
  resistor: 'The resistor bridges two tie columns. Its leads are straight and fully seated.',
  ledLead: "Both of the LED's leads are straight and disappear cleanly into their holes.",
  ledHole: 'The tie point grips the lead firmly — there is no play when you nudge it.',
  groundWire: 'The ground jumper runs from the LED row to the − rail, fully seated.',
  battery: 'The battery pack reads a healthy voltage and its leads are firmly in the rails.'
};

const FAULT_LOOK = {
  loose: { powerWire: 'The power jumper looks seated from directly above, but from the side there is a ' +
                      'visible gap — the pin is not all the way down in the hole.' },
  bent: { ledLead: "One of the LED's leads is folded back under the body of the LED. It is pressed " +
                   'against the surface of the board rather than going into a hole.' },
  wrongRow: { resistor: 'The resistor ends one row short of the LED. Its lead and the LED lead are in ' +
                        'adjacent rows, which are separate tie point groups — not connected.' },
  wear: { ledHole: 'The lead slides in and out of this tie point with almost no resistance. The clip ' +
                   'inside has been splayed open by repeated use.' }
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

  powerButton = createButton('Power On');
  powerButton.position(10, drawHeight + 10);
  powerButton.mousePressed(togglePower);

  swapButton = createButton('Swap Test');
  swapButton.position(105, drawHeight + 10);
  swapButton.mousePressed(swapTest);

  newFaultButton = createButton('New Fault');
  newFaultButton.position(195, drawHeight + 10);
  newFaultButton.mousePressed(newFault);

  hypothesisSelect = createSelect();
  hypothesisSelect.position(110, drawHeight + 45);
  hypothesisSelect.option('-- choose a hypothesis --');
  for (const k in FAULTS) hypothesisSelect.option(FAULTS[k].label);
  hypothesisSelect.changed(() => result = null);

  newFault();

  describe('A breadboard circuit with a battery, resistor and LED that does ' +
           'not light. Clicking parts of the board opens a close-up description ' +
           'of that spot. After choosing one of four hypotheses about the cause, ' +
           'a swap test either fixes the circuit and lights the LED, or explains ' +
           'why the evidence does not fit that hypothesis.', LABEL);
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

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Troubleshooting Detective', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  let boardW, boardH, boardX, boardY;

  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.48;
    panel = { x: margin, y: boardY + boardH + 8, w: canvasWidth - 2 * margin,
              h: drawHeight - boardY - boardH - 16 };
  } else {
    boardX = margin; boardY = 30;
    boardW = canvasWidth * 0.60;
    boardH = drawHeight - 46;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 46 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  if (powered && fixed && mouseOverCanvas) flowPhase += 0.015;

  drawCircuit();
  drawPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The circuit on the board
// ---------------------------------------------------------------------------

function drawCircuit() {
  const railPlusY = bbRowY('T+');
  const railMinusY = bbRowY('T-');
  const rowTop = bbRowY('b');
  const rowBot = bbRowY('d');
  const midY = bbRowY('c');

  // The resistor's actual column shifts when the wrong-row fault is active,
  // so the break is visible to anyone who looks closely.
  const resCol = RES_COL;
  const ledCol = LED_COL;

  // Power jumper: + rail down to the resistor column
  const looseGap = (fault === 'loose' && !fixed) ? 5 : 0;
  stroke('crimson');
  strokeWeight(3);
  noFill();
  line(bbColX(resCol), railPlusY, bbColX(resCol), rowTop - looseGap);
  spots.powerWire = { x: bbColX(resCol) - 8, y: railPlusY, w: 16, h: rowTop - railPlusY };

  // Resistor between resCol and (ledCol - 1), or one row short when faulted
  const resEnd = (fault === 'wrongRow' && !fixed) ? ledCol - 2 : ledCol;
  stroke('peru');
  strokeWeight(3);
  line(bbColX(resCol), midY, bbColX(resEnd), midY);
  noStroke();
  fill('wheat');
  const rcx = (bbColX(resCol) + bbColX(resEnd)) / 2;
  rect(rcx - 16, midY - 7, 32, 14, 3);
  fill('saddlebrown'); rect(rcx - 10, midY - 7, 4, 14);
  fill('black');       rect(rcx - 2, midY - 7, 4, 14);
  fill('firebrick');   rect(rcx + 6, midY - 7, 4, 14);
  spots.resistor = { x: rcx - 24, y: midY - 14, w: 48, h: 28 };

  // The gap left by a wrong-row resistor
  if (fault === 'wrongRow' && !fixed) {
    stroke('crimson');
    strokeWeight(2);
    drawingContext.setLineDash([4, 4]);
    line(bbColX(resEnd), midY, bbColX(ledCol), midY);
    drawingContext.setLineDash([]);
  }

  // LED at ledCol, bridging rows b..d
  const lit = powered && fixed;
  const bentLead = (fault === 'bent' && !fixed);
  stroke('gray');
  strokeWeight(3);
  line(bbColX(ledCol), rowTop, bbColX(ledCol), midY - 8);
  if (bentLead) {
    // The folded lead: it curls sideways instead of entering the hole
    stroke('crimson');
    noFill();
    arc(bbColX(ledCol) + 8, midY + 10, 22, 16, PI, TWO_PI);
  } else {
    line(bbColX(ledCol), midY + 8, bbColX(ledCol), rowBot);
  }
  noStroke();
  fill(lit ? 'gold' : 'lightcoral');
  circle(bbColX(ledCol), midY, 17);
  if (lit) {
    // A glow ring so "it works now" is unmistakable
    noFill();
    stroke(255, 215, 0, 140);
    strokeWeight(3);
    circle(bbColX(ledCol), midY, 30 + sin(flowPhase * 4) * 4);
  }
  spots.ledLead = { x: bbColX(ledCol) - 14, y: midY + 2, w: 34, h: 26 };
  spots.ledHole = { x: bbColX(ledCol) - 10, y: rowBot - 8, w: 20, h: 18 };

  // Ground jumper: LED column down to the − rail
  stroke('dimgray');
  strokeWeight(3);
  line(bbColX(ledCol), rowBot, bbColX(ledCol), railMinusY);
  spots.groundWire = { x: bbColX(ledCol) - 8, y: rowBot, w: 16, h: railMinusY - rowBot };

  // Worn tie point gets a subtle marker once inspected
  if (fault === 'wear' && !fixed && inspecting === 'ledHole') {
    noFill();
    stroke('crimson');
    strokeWeight(2);
    circle(bbColX(ledCol), rowBot, BB.pitch * 1.3);
  }

  // Battery badge at the left of the rails
  spots.battery = { x: BB.x - 4, y: railPlusY - 8, w: 40, h: 26 };
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(11);
  text(powered ? '9V ON' : '9V off', BB.x + 2, railPlusY - 12);

  // Highlight whichever spot is being inspected
  if (inspecting && spots[inspecting]) {
    const s = spots[inspecting];
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(s.x - 2, s.y - 2, s.w + 4, s.h + 4, 4);
  }
}

// ---------------------------------------------------------------------------
// Side panel
// ---------------------------------------------------------------------------

function drawPanel() {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // Symptom line
  fill('black');
  textSize(15);
  text('Symptom', padX, ty);
  ty += 20;
  fill(powered ? (fixed ? 'darkgreen' : 'crimson') : 'dimgray');
  textSize(13);
  const symptom = !powered
    ? 'Power is off. Switch it on to see what the circuit does.'
    : (fixed ? 'The LED is lit. The circuit works.'
             : 'Power is on, but the LED stays dark.');
  text(symptom, padX, ty, innerW);
  ty += 44;

  // Close-up of whatever is being inspected
  fill('black');
  textSize(15);
  text('Close-up', padX, ty);
  ty += 20;
  fill('dimgray');
  textSize(13);
  if (!inspecting) {
    text('Click any wire, lead or tie point on the board to look at it closely.',
         padX, ty, innerW);
  } else {
    const look = (!fixed && FAULT_LOOK[fault] && FAULT_LOOK[fault][inspecting])
      ? FAULT_LOOK[fault][inspecting]
      : NORMAL_LOOK[inspecting];
    text(look, padX, ty, innerW);
  }
  ty += 92;

  // Swap-test result
  if (result) {
    fill(result.ok ? 'darkgreen' : 'crimson');
    textSize(13);
    text(result.msg, padX, ty, innerW);
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Hypothesis:', 10, drawHeight + 57);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0 || mouseY > drawHeight) return;
  for (const key in spots) {
    const s = spots[key];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) {
      inspecting = key;
      return;
    }
  }
}

function togglePower() {
  powered = !powered;
  powerButton.html(powered ? 'Power Off' : 'Power On');
}

// One swap test changes exactly one thing - the suspect the learner named.
function swapTest() {
  const choice = hypothesisSelect.value();
  const key = Object.keys(FAULTS).find(k => FAULTS[k].label === choice);

  if (!key) {
    result = { ok: false, msg: 'Choose a hypothesis first, then run the swap test.' };
    return;
  }
  if (fixed) {
    result = { ok: true, msg: 'Already fixed — press New Fault to try another one.' };
    return;
  }

  if (key === fault) {
    fixed = true;
    powered = true;
    powerButton.html('Power Off');
    result = { ok: true, msg: FAULTS[key].fix + ' The LED lights. ' + FAULTS[key].real };
  } else {
    // Deliberately does not name the real fault.
    result = { ok: false, msg: 'You swapped that out and the LED is still dark, so ' +
               FAULTS[key].label.toLowerCase() + ' was not the cause. ' +
               'Go back and inspect the parts you have not looked at yet — ' +
               'change only one thing at a time.' };
  }
}

function newFault() {
  const keys = Object.keys(FAULTS);
  fault = keys[floor(random(keys.length))];
  fixed = false;
  powered = false;
  inspecting = null;
  result = null;
  flowPhase = 0;
  powerButton.html('Power On');
  hypothesisSelect.selected('-- choose a hypothesis --');
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
