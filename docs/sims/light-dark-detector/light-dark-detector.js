// Light and Dark Detector - Breadboard MicroSim
// CANVAS_HEIGHT: 600
//
// A light-dependent resistor and a fixed resistor form a voltage divider. The
// divider's output feeds a transistor base through a resistor; the transistor
// switches an LED and a buzzer. Sweeping the light level walks the divider
// voltage up through the transistor's 0.7 V turn-on threshold, so the learner
// can watch a smoothly varying input produce an abrupt output.
//
// Circuit chapter: 17 - Sensing Light and Dark Detectors

let containerWidth;
let canvasWidth = 800;
let drawHeight = 520;
let controlHeight = 80;        // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let sliderLeftMargin = 210;
let defaultTextSize = 16;

let boardTop = 48;
let readoutHeight = 52;

let startButton, resetButton, scopeCheckbox, lightSlider;
let isRunning = false;
let ldr;                       // the potentiometer standing in for the LDR

const LDR_MAX_OHMS = 100000;   // resistance in complete darkness

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  startButton = createButton('Start');
  startButton.position(10, drawHeight + 8);
  startButton.mousePressed(toggleSimulation);

  resetButton = createButton('Reset');
  resetButton.position(80, drawHeight + 8);
  resetButton.mousePressed(resetSimulation);

  scopeCheckbox = createCheckbox(' Show scope', true);
  scopeCheckbox.position(150, drawHeight + 8);

  lightSlider = createSlider(0, 100, 20, 1);
  lightSlider.position(sliderLeftMargin, drawHeight + 45);
  lightSlider.size(canvasWidth - sliderLeftMargin - margin);

  // 24 columns - this circuit needs the room, and every address below is
  // validated against this count.
  bbLayout(margin, boardTop, 400, 300, 24);
  bbReset();

  // --- Supply, on the top rails, jumpered down to the bottom rails ---
  bbBattery({pos: 'T+1', neg: 'T-1', volts: 9, label: 'BAT'});
  bbWire({a: 'T+4', b: 'B+4', color: 'red'});
  bbWire({a: 'T-5', b: 'B-5', color: 'black'});

  // --- Voltage divider in the top half ---
  // The LDR is on top and the fixed resistor below, so MORE light means LESS
  // LDR resistance and a HIGHER voltage at the junction.
  bbWire({a: 'T+2', b: 'a2', color: 'red'});
  ldr = bbPotentiometer({a: 'b2', b: 'b7', maxOhms: LDR_MAX_OHMS,
                         setting: 0.8, label: 'LDR'});
  bbResistor({a: 'b7', b: 'b12', ohms: 4700, label: 'R2'});
  bbWire({a: 'c12', b: 'T-12', color: 'black'});

  // --- Base drive: divider junction (net T7) across to the bottom half ---
  // The jumper lands well to the right of the transistor so the base resistor
  // has room without either part sitting on top of Q1's body.
  bbWire({a: 'd7', b: 'h22', color: 'blue'});
  bbResistor({a: 'h22', b: 'h15', ohms: 4700, label: 'RB'});

  // --- Transistor: three legs in three adjacent columns, like a real TO-92 ---
  bbTransistor({collector: 'f14', base: 'f15', emitter: 'f16', label: 'Q1'});
  bbWire({a: 'i16', b: 'B-16', color: 'black'});

  // --- Collector load: an LED and a buzzer in parallel ---
  // The LED sits in row g and the buzzer in row j. A buzzer is a fat cylinder,
  // and in adjacent rows its body would cover the LED completely.
  bbWire({a: 'j7', b: 'B+7', color: 'red'});
  bbResistor({a: 'i7', b: 'i11', ohms: 470, label: 'RL'});
  bbLED({anode: 'g11', cathode: 'g14', color: 'red', label: 'D1'});
  bbBuzzer({a: 'j11', b: 'j14', label: 'BZ1'});

  // Voltage on the left axis, current on the right - the threshold crossing is
  // the whole lesson, and it only reads clearly with both on screen at once.
  bbAddTrace({label: 'Divider voltage', get: () => bbVoltage('b7'),
              color: 'royalblue', max: 12, unit: 'V'});
  bbAddTrace({label: 'LED current', get: () => bbCurrent('D1'),
              color: 'crimson', max: 20, unit: 'mA'});

  describe('A light dependent resistor and a fixed resistor form a voltage divider ' +
    'on a breadboard. The divider drives a transistor base through a resistor, and ' +
    'the transistor switches an LED and a buzzer. A slider sets the light level; a ' +
    'scope plots the divider voltage against the LED current.', LABEL);
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
  text('Light Detector: Transistor Switch', canvasWidth / 2, 10);

  const showScope = scopeCheckbox.checked() && canvasWidth >= 640;
  const boardW = showScope ? (canvasWidth - margin * 3) * 0.60
                           : (canvasWidth - margin * 2);
  const boardH = drawHeight - boardTop - readoutHeight;
  bbLayout(margin, boardTop, boardW, boardH, 24);

  // Bright light drives the LDR's resistance down, which is why the setting is
  // the complement of the slider rather than the slider itself.
  const light = lightSlider.value() / 100;
  ldr.setting = 1 - light;

  bbSolve(isRunning);
  bbDrawBoard();
  bbDrawParts();

  if (isRunning) bbSampleTraces();

  if (showScope) {
    const sx = margin * 2 + boardW;
    bbDrawScope(sx, boardTop, canvasWidth - sx - margin, boardH,
                'Divider Voltage vs LED Current');
  }

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(canvasWidth < 560 ? 13 : defaultTextSize);
  const y = drawHeight - readoutHeight + 6;
  const vDiv = bbVoltage('b7');
  text('Divider: ' + nf(vDiv, 0, 2) + ' V    ' +
       'Base: ' + nf(bbVoltage('f15'), 0, 2) + ' V    ' +
       'LED: ' + nf(bbCurrent('D1'), 0, 1) + ' mA', margin, y);
  fill(bbIsOn('D1', 1) ? 'darkgreen' : 'dimgray');
  text(bbIsOn('D1', 1)
       ? 'Q1 is ON - the divider is above the 0.7 V base threshold.'
       : 'Q1 is OFF - the divider is below the 0.7 V base threshold.',
       margin, y + 22);

  fill('black');
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Light level: ' + lightSlider.value() + '%  (' +
       bbFormatOhms(Math.round(ldr.ohms())) + ')', 10, drawHeight + 55);

  cursor(bbHovering() ? HAND : ARROW);
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
  lightSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
