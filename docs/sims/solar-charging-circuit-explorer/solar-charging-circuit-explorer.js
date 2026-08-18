// Solar Charging Circuit Explorer
// CANVAS_HEIGHT: 540
// Bloom Level: Apply (L3) / Analyze (L4) - Verb: demonstrate, examine, distinguish
// Learning objective: Given a rendered solar panel wired through a blocking
// diode and a TP4056-style charge module to a LiPo battery and LED load,
// adjust a sunlight-intensity slider and observe panel voltage/current, the
// charging current into the battery, the automatic overcharge cutoff once
// full, and the LED switching to battery power at night.
//
// Two behaviours the sim exists to show, both of which look like nothing is
// happening unless you point them out:
//
//   Overcharge cutoff — charge current falls to zero at 100%. The panel is
//   still lit, but the module stops pushing current in. A LiPo that keeps
//   being charged past full is a fire risk, so this is not an optional extra.
//
//   The blocking diode — at night a bare panel is a load, not a source, and
//   the battery would quietly drain backwards through it. The diode only lets
//   current run one way, so that cannot happen.
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
let sliderLeftMargin = 220;
let defaultTextSize = 16;

// ---- Controls ----
let sunSlider, nightButton, resetButton;

// ---- State ----
let sun = 70;                // percent
let charge = 45;             // battery percentage
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverPart = null;
let spots = {};
let panel = {};

const PANEL_VMAX = 6.0;      // open-circuit voltage in full sun
const PANEL_IMAX = 200;      // mA in full sun
const CHARGE_FLOOR = 20;     // panel voltage must beat the battery to charge
const COLS = 20;

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

  nightButton = createButton('Fast-forward to Night');
  nightButton.position(10, drawHeight + 10);
  nightButton.mousePressed(() => sunSlider.value(0));

  resetButton = createButton('Reset');
  resetButton.position(180, drawHeight + 10);
  resetButton.mousePressed(() => { sunSlider.value(70); charge = 45; });

  sunSlider = createSlider(0, 100, sun, 1);
  sunSlider.position(sliderLeftMargin, drawHeight + 45);
  sunSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A solar panel wired through a blocking diode and a TP4056-style ' +
           'charge module to a LiPo battery and an LED night-light. A sunlight ' +
           'slider changes panel voltage and current, the battery charge bar ' +
           'fills while charging and stops at full, and at night the LED runs ' +
           'from the battery instead of the panel.', LABEL);
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

  sun = sunSlider.value();
  const s = sun / 100;

  // ---- The model ----
  const panelV = PANEL_VMAX * (s > 0 ? 0.6 + 0.4 * s : 0);   // sags a little in weak light
  const panelI = PANEL_IMAX * s;
  const full = charge >= 100;
  const canCharge = panelV > 4.0 && !full;
  const chargeMa = canCharge ? panelI * 0.9 : 0;
  const night = sun < 8;
  const ledOn = night && charge > 2;

  // Battery level moves on its own clock, only while the learner is watching.
  if (mouseOverCanvas) {
    flowPhase += 0.02;
    if (chargeMa > 0) charge = min(100, charge + chargeMa * 0.00025);
    if (ledOn) charge = max(0, charge - 0.004);
  }

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Solar Charging Circuit', canvasWidth / 2, 6);

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

  drawCircuit(panelV, chargeMa, night, ledOn, full);
  drawPanel(panelV, panelI, chargeMa, night, ledOn, full);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(panelV, chargeMa, night, ledOn, full) {
  const row = bbRowY('c');
  const rail = bbRowY('T-');

  const xPan = bbColX(3);
  const xDio = bbColX(7);
  const xMod = bbColX(11);
  const xBat = bbColX(15);
  const xLed = bbColX(19);

  const charging = chargeMa > 0.5;

  drawSolarPanel(xPan, row - 34, night);

  // panel -> diode -> module
  stroke(charging ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  noFill();
  line(xPan, row - 4, xPan, row);
  line(xPan, row, xDio - 14, row);
  drawDiode(xDio, row, charging);
  line(xDio + 14, row, xMod - 22, row);

  drawModule(xMod, row, charging, full);
  line(xMod + 22, row, xBat - 20, row);

  drawBattery(xBat, row);
  stroke(ledOn ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(xBat + 20, row, xLed, row);
  drawLed(xLed, row, ledOn);
  line(xLed, row + 16, xLed, rail);

  if (charging) {
    drawFlow([[xPan, row, xMod - 22, row], [xMod + 22, row, xBat - 20, row]], 6, 'crimson');
  }
  if (ledOn) {
    drawFlow([[xBat + 20, row, xLed, row], [xLed, row, xLed, rail]], 6, 'darkorange');
  }

  hoverPart = null;
  for (const k in spots) {
    const s = spots[k];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) hoverPart = k;
  }
}

function drawSolarPanel(x, y, night) {
  noStroke();
  fill(night ? '#26313C' : '#1F4E86');
  rect(x - 30, y - 22, 60, 40, 3);
  stroke(night ? '#3A4650' : '#5C8FD0');
  strokeWeight(1);
  for (let i = 1; i < 4; i++) line(x - 30 + i * 15, y - 22, x - 30 + i * 15, y + 18);
  line(x - 30, y - 2, x + 30, y - 2);

  // sun or moon above it
  noStroke();
  if (!night) {
    fill('#F5C542');
    circle(x + 40, y - 26, 20);
    stroke('#F5C542');
    strokeWeight(2);
    for (let i = 0; i < 8; i++) {
      const a = i * TWO_PI / 8;
      line(x + 40 + cos(a) * 13, y - 26 + sin(a) * 13, x + 40 + cos(a) * 18, y - 26 + sin(a) * 18);
    }
  } else {
    fill('#C6CDD5');
    circle(x + 40, y - 26, 18);
    fill(night ? '#F0F4F7' : '#FBFCFD');
    circle(x + 45, y - 30, 15);
  }

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text('solar panel', x, y + 20);
}

function drawDiode(x, y, live) {
  noStroke();
  fill('#2E2E2E');
  rect(x - 14, y - 9, 28, 18, 2);
  fill('gainsboro');
  rect(x + 8, y - 9, 5, 18);
  fill('white');
  triangle(x - 6, y - 5, x - 6, y + 5, x + 5, y);

  spots.diode = { x: x - 18, y: y - 14, w: 36, h: 28 };
  if (hoverPart === 'diode') {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(spots.diode.x, spots.diode.y, 36, 28, 4);
  }
  noStroke();
  fill('gray');
  textAlign(CENTER, TOP);
  textSize(9);
  text('blocking', x, y + 12);
}

function drawModule(x, y, charging, full) {
  noStroke();
  fill('#1E6B3A');
  rect(x - 22, y - 18, 44, 36, 3);
  fill('#C6CDD5');
  textAlign(CENTER, CENTER);
  textSize(8);
  text('TP4056', x, y - 4);
  // status LED on the module
  fill(full ? '#4CD07A' : (charging ? '#E8710A' : '#4A5259'));
  circle(x, y + 9, 7);

  spots.module = { x: x - 26, y: y - 22, w: 52, h: 44 };
  if (hoverPart === 'module') {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(spots.module.x, spots.module.y, 52, 44, 4);
  }
}

function drawBattery(x, y) {
  noStroke();
  fill('#8A6FC4');
  rect(x - 20, y - 20, 40, 40, 4);
  // charge bar
  fill('#3A3050');
  rect(x - 13, y - 14, 26, 28, 2);
  const h = 28 * (charge / 100);
  fill(charge > 80 ? '#4CD07A' : (charge > 30 ? '#F5C542' : '#E5654B'));
  rect(x - 13, y - 14 + (28 - h), 26, h, 2);

  noStroke();
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(9);
  text(nf(charge, 1, 0) + '%', x, y);

  spots.battery = { x: x - 24, y: y - 24, w: 48, h: 48 };
  if (hoverPart === 'battery') {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(spots.battery.x, spots.battery.y, 48, 48, 4);
  }
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(9);
  text('LiPo', x, y + 22);
}

function drawLed(x, y, lit) {
  noStroke();
  if (lit) {
    fill(255, 210, 90, 120);
    circle(x, y, 34);
  }
  fill(lit ? 'gold' : '#D8DDE2');
  arc(x, y, 18, 22, PI, TWO_PI);
  rect(x - 9, y, 18, 6);
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(9);
  text('night light', x, y + 18);
}

function drawFlow(legs, size, col) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(3, floor(total / 30));
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

function drawPanel(panelV, panelI, chargeMa, night, ledOn, full) {
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
  text('PANEL', padX, ty);
  ty += 16;
  fill('black');
  textSize(14);
  text(nf(panelV, 1, 2) + ' V   ·   ' + nf(panelI, 1, 0) + ' mA', padX, ty);
  ty += 26;

  fill('gray');
  textSize(11);
  text('CHARGING INTO THE BATTERY', padX, ty);
  ty += 16;
  fill(chargeMa > 0.5 ? 'darkgreen' : 'dimgray');
  textSize(18);
  text(nf(chargeMa, 1, 0) + ' mA', padX, ty);
  ty += 26;

  fill('gray');
  textSize(11);
  text('BATTERY', padX, ty);
  ty += 16;
  noStroke();
  fill('gainsboro');
  rect(padX, ty, innerW, 14, 4);
  fill(charge > 80 ? 'seagreen' : (charge > 30 ? 'goldenrod' : 'indianred'));
  rect(padX, ty, innerW * (charge / 100), 14, 4);
  ty += 20;
  fill('black');
  textSize(13);
  text(nf(charge, 1, 0) + '% charged', padX, ty);
  ty += 28;

  // The two behaviours worth calling out explicitly
  textSize(12);
  if (full) {
    fill('darkgreen');
    text('Full — and the charge current has dropped to zero on its own. The ' +
         'panel is still lit, but the module has cut it off. A LiPo pushed ' +
         'past full is a fire risk, so this cutoff is not optional.',
         padX, ty, innerW);
    ty += 66;
  } else if (night) {
    fill('#B4650F');
    text('Night — the panel makes nothing, so the LED is running from the ' +
         'battery instead. Watch the charge percentage creep down.',
         padX, ty, innerW);
    ty += 50;
  } else if (chargeMa > 0.5) {
    fill('black');
    text('Charging. The brighter the light, the more current the panel makes ' +
         'and the faster the battery fills.', padX, ty, innerW);
    ty += 44;
  } else {
    fill('sienna');
    text('Too little light — the panel voltage has fallen below what the module ' +
         'needs to push charge into the battery.', padX, ty, innerW);
    ty += 44;
  }

  const notes = {
    diode: 'The blocking diode. At night a bare solar panel behaves as a load, ' +
           'not a source, and the battery would quietly drain backwards through ' +
           'it. A diode passes current one way only, so that cannot happen.',
    module: 'The TP4056-style charge module. It manages the charge and, ' +
            'critically, stops when the cell is full — a lithium cell must not ' +
            'be over-charged.',
    battery: 'A single LiPo cell. It stores what the panel makes during the day ' +
             'so the load can run after dark.'
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
  const label = sun < 8 ? 'Night' : (sun < 40 ? 'Overcast' : (sun < 80 ? 'Partly sunny' : 'Full sun'));
  text('Sunlight: ' + sun + '%  (' + label + ')', 10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  sunSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
