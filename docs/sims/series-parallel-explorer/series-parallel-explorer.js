// Series vs Parallel Explorer - Breadboard MicroSim
// CANVAS_HEIGHT: 600
//
// Two identical LEDs, each with its own 220 ohm resistor, wired either in one
// series chain or as two independent parallel branches. The scope plots one
// branch's current against the total current the battery is supplying, so the
// difference between "the same current everywhere" and "the currents add up"
// is visible as two lines rather than as a formula.
//
// Circuit chapter: 04 - Series and Parallel Topology

let containerWidth;
let canvasWidth = 800;
let drawHeight = 520;
let controlHeight = 80;        // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let sliderLeftMargin = 200;
let defaultTextSize = 16;

let boardTop = 48;
let readoutHeight = 52;

let startButton, resetButton, modeSelect, scopeCheckbox, voltsSlider;
let isRunning = false;
let mode = 'Series';

const SERIES_OHMS = 220;

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

  startButton = createButton('Start');
  startButton.position(10, drawHeight + 8);
  startButton.mousePressed(toggleSimulation);

  resetButton = createButton('Reset');
  resetButton.position(80, drawHeight + 8);
  resetButton.mousePressed(resetSimulation);

  modeSelect = createSelect();
  modeSelect.position(150, drawHeight + 8);
  modeSelect.option('Series');
  modeSelect.option('Parallel');
  modeSelect.selected('Series');
  modeSelect.changed(changeMode);

  scopeCheckbox = createCheckbox(' Show scope', true);
  scopeCheckbox.position(255, drawHeight + 8);

  voltsSlider = createSlider(3, 9, 6, 0.1);
  voltsSlider.position(sliderLeftMargin, drawHeight + 45);
  voltsSlider.size(canvasWidth - sliderLeftMargin - margin);

  // Establish the column count before any hole address is parsed against it
  bbLayout(margin, boardTop, 400, 300, 18);
  buildCircuit();

  describe('A solderless breadboard with two LEDs that can be rewired between a ' +
    'series chain and two parallel branches. In series both LEDs share one small ' +
    'current; in parallel each draws its own and the battery supplies the sum. A ' +
    'scope plots branch current against total supply current.', LABEL);
}

/**
 * Build the whole circuit from scratch for the current mode.
 *
 * Rewiring is done by rebuilding rather than by switching parts in and out,
 * because that is what a student does at the bench: pull the parts and lay the
 * circuit out again. bbReset() drops the parts AND the scope traces, so the
 * traces are re-declared here - and the plot history clears with them, which is
 * correct, since the old readings came from a different circuit.
 */
function buildCircuit() {
  bbReset();

  // Supply arrives on the top rails only - the bottom rails are fed by jumpers,
  // exactly as they would be on a real board.
  bbBattery({pos: 'T+1', neg: 'T-1', volts: voltsSlider ? voltsSlider.value() : 6,
             label: 'BAT'});

  // Power distribution is identical in both modes, so the only thing that
  // changes on screen is the topology itself.
  bbWire({a: 'T+2', b: 'B+2', color: 'red'});      // carry + down to the bottom rail
  bbWire({a: 'T-3', b: 'B-3', color: 'black'});    // and ground with it

  // Parts alternate between rows b/d in the top half and rows g/i in the
  // bottom half. Staggering them by two rows keeps each part's value label
  // clear of its neighbour's - all labels sit just above their own part.
  if (mode === 'Series') {
    // One loop: + rail -> R1 -> D1 -> across the channel -> R2 -> D2 -> ground.
    // The same current passes through every part because there is nowhere else
    // for it to go.
    bbWire({a: 'T+5', b: 'a5', color: 'red'});
    bbResistor({a: 'b5', b: 'b9', ohms: SERIES_OHMS, label: 'R1'});
    bbLED({anode: 'd9', cathode: 'd12', color: 'red', label: 'D1'});
    bbWire({a: 'e12', b: 'f12', color: 'green'});   // the halves are separate nets
    bbResistor({a: 'g12', b: 'g15', ohms: SERIES_OHMS, label: 'R2'});
    bbLED({anode: 'i15', cathode: 'i18', color: 'red', label: 'D2'});
    bbWire({a: 'j18', b: 'B-18', color: 'black'});
  } else {
    // Two independent branches, one in each half of the board, each running
    // from a + rail to a - rail. Neither branch knows the other exists, which
    // is exactly the point.
    bbWire({a: 'T+5', b: 'a5', color: 'red'});
    bbResistor({a: 'b5', b: 'b9', ohms: SERIES_OHMS, label: 'R1'});
    bbLED({anode: 'd9', cathode: 'd13', color: 'red', label: 'D1'});
    bbWire({a: 'a13', b: 'T-13', color: 'black'});

    bbWire({a: 'B+5', b: 'j5', color: 'red'});
    bbResistor({a: 'i5', b: 'i9', ohms: SERIES_OHMS, label: 'R2'});
    bbLED({anode: 'g9', cathode: 'g13', color: 'red', label: 'D2'});
    bbWire({a: 'j13', b: 'B-13', color: 'black'});
  }

  // Both traces are currents in mA on the same scale, so the two lines can be
  // compared directly: they sit on top of each other in series and separate by
  // a factor of two in parallel.
  bbAddTrace({label: 'D1 branch', get: () => bbCurrent('D1'),
              color: 'crimson', max: 40, unit: 'mA'});
  bbAddTrace({label: 'Total supply', get: () => bbCurrent('BAT'),
              color: 'darkorange', max: 40, unit: 'mA'});
}

function draw() {
  updateCanvasSize();

  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(24);
  text(mode + ' Circuit: Two LEDs', canvasWidth / 2, 10);

  const showScope = scopeCheckbox.checked() && canvasWidth >= 640;
  const boardW = showScope ? (canvasWidth - margin * 3) * 0.60
                           : (canvasWidth - margin * 2);
  const boardH = drawHeight - boardTop - readoutHeight;
  bbLayout(margin, boardTop, boardW, boardH, 18);

  bbPart('BAT').volts = voltsSlider.value();
  bbSolve(isRunning);
  bbDrawBoard();
  bbDrawParts();

  if (isRunning) bbSampleTraces();

  if (showScope) {
    const sx = margin * 2 + boardW;
    bbDrawScope(sx, boardTop, canvasWidth - sx - margin, boardH,
                'Branch Current vs Total Current');
  }

  // Readout: the two branch currents and the total, which is the whole lesson
  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(canvasWidth < 560 ? 13 : defaultTextSize);
  const y = drawHeight - readoutHeight + 6;
  text('D1: ' + nf(bbCurrent('D1'), 0, 1) + ' mA    ' +
       'D2: ' + nf(bbCurrent('D2'), 0, 1) + ' mA    ' +
       'Battery: ' + nf(bbCurrent('BAT'), 0, 1) + ' mA', margin, y);
  fill('dimgray');
  text(mode === 'Series'
       ? 'One loop: the same current passes through both LEDs.'
       : 'Two branches: each LED draws its own current, and the battery supplies both.',
       margin, y + 22);

  fill('black');
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Supply voltage: ' + nf(voltsSlider.value(), 0, 1) + ' V',
       10, drawHeight + 55);

  cursor(bbHovering() ? HAND : ARROW);
}

function changeMode() {
  mode = modeSelect.value();
  buildCircuit();
}

function toggleSimulation() {
  isRunning = !isRunning;
  startButton.html(isRunning ? 'Pause' : 'Start');
}

function resetSimulation() {
  bbClearTraces();
}

function mousePressed()  { bbMousePressed(); }
function mouseReleased() { bbReleaseAll(); }
function keyPressed()    { bbKeyPressed(); }
function keyReleased()   { bbKeyReleased(); }

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  voltsSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
