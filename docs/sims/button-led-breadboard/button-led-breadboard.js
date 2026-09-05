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
//
// One entry per channel. Every column here is fixed by the board's layout
// rules, so read them together with the comment in setup() before moving any
// of them:
//
//   sw    upper-left leg of the push button, always row e. A 6 mm tactile
//         switch covers three columns, so SW1 at 'e1' owns columns 1-3 and
//         column 2 can never hold anything.
//   flip  which diagonal of the button carries the circuit. SW1 takes +5 V on
//         its upper LEFT leg because column 1 is the board's left edge; SW2 and
//         SW3 take it on the upper RIGHT so their resistors stay put.
//   rail  column of the red jumper down from the +5 V rail. It always lands on
//         row d of the button's powered leg column.
//   res   column of the resistor's left end, which is the button's other leg.
const CHANNELS = [
  {sw: 'e1',  flip: false, rail: 1,  res: 3,  color: 'red',   key: '1'},
  {sw: 'e9',  flip: true,  rail: 11, res: 9,  color: 'green', key: '2'},
  {sw: 'e15', flip: true,  rail: 17, res: 15, color: 'blue',  key: '3'}
];
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

  // The supply frames the board: + on the TOP rail, - on the BOTTOM rail, and
  // nothing else on either of the other two rails. Every channel below then
  // runs strictly downhill - rail, button, resistor, LED, ground - so a student
  // watching the dots sees current enter at the top edge and leave at the
  // bottom. No jumper carries + down or ground up. (Layout rules 1-4.)
  bbBattery({pos: 'T+1', neg: 'B-1', volts: 5, label: 'BAT'});

  // One identical branch per channel:
  //   T+ -> red jumper -> d{rail} -> button -> j{res} -> resistor -> LED
  //      -> black jumper -> B- (bottom ground rail)
  CHANNELS.forEach((ch, i) => {
    const r = ch.res;
    bbWire({a: 'T+' + ch.rail, b: 'd' + ch.rail, color: 'red'});
    bbButton({at: ch.sw, flip: ch.flip, color: ch.color,
              label: 'SW' + (i + 1), key: ch.key});
    bbResistor({a: 'j' + r, b: 'j' + (r + 3), ohms: SERIES_OHMS,
                label: 'R' + (i + 1)});
    bbLED({anode: 'g' + (r + 3), cathode: 'g' + (r + 5),
           color: ch.color, label: 'D' + (i + 1)});
    bbWire({a: 'j' + (r + 5), b: 'B-' + (r + 5), color: 'black'});
  });

  // --- Scope traces ---
  // Maxes are divisible by 4 so the five gridlines land on whole numbers
  // (40/30/20/10/0 and 4/3/2/1/0) instead of values like 22.5.
  bbAddTrace({label: 'D1 current', get: () => bbCurrent('D1'),
              color: 'crimson', max: 40, unit: 'mA'});
  bbAddTrace({label: 'D1 voltage', get: () => bbVoltageAcross('D1'),
              color: 'royalblue', max: 4, unit: 'V'});

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
  //
  // Below about 640px there is not enough width for both panels - the board
  // shrinks to the point of being unusable - so the circuit wins and the scope
  // steps aside, regardless of the checkbox.
  const showScope = scopeCheckbox.checked() && canvasWidth >= 640;
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
  textSize(canvasWidth < 560 ? 13 : defaultTextSize);
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
