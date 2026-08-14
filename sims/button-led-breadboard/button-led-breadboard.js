// Button and LED Breadboard MicroSim - reference implementation
// CANVAS_HEIGHT: 600
//
// Three push buttons, each lighting one LED through its own current-limiting
// resistor. The learner presses a button, watches current flow along the wires,
// and reads the resulting current and voltage on the scope.
//
// This file is the template for every breadboard MicroSim: copy its structure
// and change only the circuit built in setup() and the traces on the scope.
// It loads breadboard-lib.js, which supplies bbLayout / bbSolve / bbDraw*.

// ---- Standard MicroSim canvas variables ------------------------------------
let containerWidth;
let canvasWidth = 800;
let drawHeight = 520;        // breadboard and scope live here - no controls
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// Vertical budget inside the drawing region: title strip on top, a two-line
// numeric readout at the bottom, and whatever is left over for the board.
let boardTop = 48;
let readoutHeight = 52;

// ---- Controls --------------------------------------------------------------
let startButton, resetButton, scopeCheckbox, voltsSlider;
let isRunning = false;       // every MicroSim starts paused

// ---- Circuit constants -----------------------------------------------------
const CHANNELS = [
  {col: 3,  color: 'red',   key: '1'},
  {col: 9,  color: 'green', key: '2'},
  {col: 15, color: 'blue',  key: '3'}
];
const SERIES_OHMS = 220;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  // --- Controls ---
  startButton = createButton('Start');
  startButton.position(10, drawHeight + 8);
  startButton.mousePressed(toggleSimulation);

  resetButton = createButton('Reset');
  resetButton.position(80, drawHeight + 8);
  resetButton.mousePressed(resetSimulation);

  scopeCheckbox = createCheckbox(' Show scope', true);
  scopeCheckbox.position(150, drawHeight + 8);

  voltsSlider = createSlider(3, 9, 5, 0.1);
  voltsSlider.position(sliderLeftMargin, drawHeight + 45);
  voltsSlider.size(canvasWidth - sliderLeftMargin - margin);

  // --- Circuit ---
  // Give the board its column count before any address is used, because 'e12'
  // is validated against it.
  bbLayout(margin, boardTop, 400, 300, 20);
  bbReset();

  // Supply on the top rails, then a jumper carrying ground down to the bottom
  // rail - the same jumper a student has to add on a real board.
  bbBattery({pos: 'T+1', neg: 'T-1', volts: 5, label: 'BAT'});
  bbWire({a: 'T-2', b: 'B-2', color: 'black'});

  // One identical branch per channel: rail -> button -> resistor -> LED -> ground
  CHANNELS.forEach((ch, i) => {
    const c = ch.col;
    bbWire({a: 'T+' + c, b: 'a' + c, color: 'red'});
    bbButton({a: 'e' + c, b: 'f' + c, color: ch.color,
              label: 'SW' + (i + 1), key: ch.key});
    bbResistor({a: 'j' + c, b: 'j' + (c + 3), ohms: SERIES_OHMS,
                label: 'R' + (i + 1)});
    bbLED({anode: 'g' + (c + 3), cathode: 'g' + (c + 5),
           color: ch.color, label: 'D' + (i + 1)});
    bbWire({a: 'j' + (c + 5), b: 'B-' + (c + 5), color: 'black'});
  });

  // --- Scope traces ---
  bbAddTrace({label: 'D1 current', get: () => bbCurrent('D1'),
              color: 'crimson', max: 30, unit: 'mA'});
  bbAddTrace({label: 'D1 voltage', get: () => bbVoltageAcross('D1'),
              color: 'royalblue', max: 6, unit: 'V'});

  describe('A solderless breadboard with three push buttons, each lighting an LED ' +
    'through a 220 ohm resistor. Pressing a button completes the circuit, animated ' +
    'dots show current flowing along the wires, and a scope plots LED current and ' +
    'voltage over time.', LABEL);
}

function draw() {
  updateCanvasSize();

  // Standard MicroSim regions
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(24);
  text('Push Button and LED Circuit', canvasWidth / 2, 10);

  // Split the drawing region: board on the left, scope on the right.
  // The board gets a height as well as a width so it can never grow past
  // drawHeight and clip its bottom rows.
  const showScope = scopeCheckbox.checked();
  const boardW = showScope ? (canvasWidth - margin * 3) * 0.60
                           : (canvasWidth - margin * 2);
  const boardH = drawHeight - boardTop - readoutHeight;
  bbLayout(margin, boardTop, boardW, boardH, 20);

  // Keep the supply in step with the slider, then solve this frame's circuit
  bbPart('BAT').volts = voltsSlider.value();
  bbSolve(isRunning);
  bbDrawBoard();
  bbDrawParts();

  if (isRunning) bbSampleTraces();

  if (showScope) {
    const sx = margin * 2 + boardW;
    bbDrawScope(sx, boardTop, canvasWidth - sx - margin, boardH,
                'LED Current and Voltage');
  }

  // A readout under the board, so the numbers are visible even with the scope off
  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
  const y = drawHeight - readoutHeight + 6;
  let readout = '';
  CHANNELS.forEach((ch, i) => {
    readout += 'D' + (i + 1) + ': ' + nf(bbCurrent('D' + (i + 1)), 0, 1) + ' mA    ';
  });
  text(readout, margin, y);
  fill('dimgray');
  text('Click a button on the board (or press 1, 2, 3) to close its circuit.',
       margin, y + 22);

  // Control labels
  fill('black');
  noStroke();
  textAlign(LEFT, CENTER);
  text('Supply voltage: ' + nf(voltsSlider.value(), 0, 1) + ' V',
       10, drawHeight + 55);

  cursor(bbHovering() ? HAND : ARROW);
}

function toggleSimulation() {
  isRunning = !isRunning;
  startButton.html(isRunning ? 'Pause' : 'Start');
}

function resetSimulation() {
  bbClearTraces();
  bbReleaseAll();
}

function mousePressed()  { bbMousePressed(); }
function mouseReleased() { bbReleaseAll(); }
function keyPressed()    { bbKeyPressed(); }
function keyReleased()   { bbKeyReleased(); }

// These two functions must be present for width responsiveness
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
