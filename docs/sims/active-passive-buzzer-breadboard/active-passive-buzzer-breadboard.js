// Active vs Passive Buzzer
// CANVAS_HEIGHT: 520
// Bloom Level: Understand (L2) / Apply (L3) - Verb: compare, demonstrate
// Learning objective: Compare an active buzzer's fixed tone against a passive
// buzzer's frequency-controlled tone by switching each on a breadboard and
// adjusting a frequency slider that only affects the passive buzzer, and
// predict the effect of reversing buzzer polarity.
//
// The difference in one line: an active buzzer has its own oscillator inside,
// so DC alone makes it beep at one built-in pitch. A passive buzzer has no
// oscillator, so DC alone does nothing at all - it needs a changing signal,
// and whatever frequency you feed it is the pitch you hear.
//
// No audio is produced. Pitch is shown as the spacing of the expanding sound
// rings, which is legible in a silent classroom and needs no autoplay
// permission from the browser.
//
// Board rendering comes from breadboard-lib.js, shared across this book.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 280;
let defaultTextSize = 16;

// ---- Controls ----
let activeButton, passiveButton, polarityButton, resetButton;
let freqSlider;

// ---- State ----
let activeOn = false;
let passiveOn = false;
let reversed = false;        // passive buzzer leads swapped
let freq = 1000;
let phase = 0;
let mouseOverCanvas = false;
let hoverMark = null;        // 'active' | 'passive'
let markBoxes = {};
let panel = {};

const ACTIVE_HZ = 2300;      // a typical built-in pitch, fixed by design
const COLS = 20;
const ACT_COL = 5;
const PAS_COL = 14;

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

  activeButton = createButton('Active Switch: OFF');
  activeButton.position(10, drawHeight + 10);
  activeButton.mousePressed(() => {
    activeOn = !activeOn;
    activeButton.html('Active Switch: ' + (activeOn ? 'ON' : 'OFF'));
  });

  passiveButton = createButton('Passive Switch: OFF');
  passiveButton.position(160, drawHeight + 10);
  passiveButton.mousePressed(() => {
    passiveOn = !passiveOn;
    passiveButton.html('Passive Switch: ' + (passiveOn ? 'ON' : 'OFF'));
  });

  polarityButton = createButton('Reverse Passive Polarity');
  polarityButton.position(320, drawHeight + 10);
  polarityButton.mousePressed(() => reversed = !reversed);

  resetButton = createButton('Reset');
  resetButton.position(510, drawHeight + 10);
  resetButton.mousePressed(resetAll);

  freqSlider = createSlider(200, 2000, freq, 10);
  freqSlider.position(sliderLeftMargin, drawHeight + 45);
  freqSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('Two piezo buzzers side by side on a breadboard: an active buzzer ' +
           'wired straight to the battery, and a passive buzzer fed through an ' +
           'oscillator block. Switching each on shows expanding sound rings ' +
           'whose spacing represents pitch. A frequency slider changes the ' +
           'passive buzzer only, and reversing its polarity silences it.', LABEL);
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

  freq = freqSlider.value();

  // A reversed passive buzzer is silent even with its switch on: a piezo
  // element driven backwards through its own polarity mark does not sound.
  const activeSounds = activeOn;
  const passiveSounds = passiveOn && !reversed;

  if (mouseOverCanvas) phase += 0.02;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Active vs Passive Buzzer', canvasWidth / 2, 6);

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
    boardW = canvasWidth * 0.58;
    boardH = drawHeight - 44;
    panel = { x: boardX + boardW + 10, y: 30, w: canvasWidth - boardX - boardW - 26,
              h: drawHeight - 44 };
  }

  bbLayout(boardX, boardY, boardW, boardH, COLS, { supply: false });
  bbDrawBoard();

  drawCircuit(activeSounds, passiveSounds);
  drawPanel(activeSounds, passiveSounds);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(activeSounds, passiveSounds) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const row = bbRowY('d');

  const xa = bbColX(ACT_COL);
  const xp = bbColX(PAS_COL);

  // ---- Active branch: straight from the battery, no oscillator ----
  stroke(activeSounds ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  noFill();
  line(xa, railPlus, xa, row - 40);
  drawSwitch(xa, row - 46, activeOn);
  line(xa, row - 22, xa, row - 26);
  drawBuzzer(xa, row, activeSounds, ACTIVE_HZ, 'active', false);
  stroke(activeSounds ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(xa, row + 26, xa, railMinus);

  // ---- Passive branch: through an oscillator block ----
  stroke(passiveSounds ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(xp, railPlus, xp, row - 66);
  drawSwitch(xp, row - 72, passiveOn);
  drawOscillator(xp, row - 44, passiveOn);
  line(xp, row - 30, xp, row - 26);
  drawBuzzer(xp, row, passiveSounds, freq, 'passive', reversed);
  stroke(passiveSounds ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(xp, row + 26, xp, railMinus);

  noStroke();
  fill('crimson');
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text('+V', BB.x + 4, railPlus - 4);
  fill('dimgray');
  textAlign(LEFT, TOP);
  text('ground', BB.x + 4, railMinus + 4);

  // Which polarity mark is hovered
  hoverMark = null;
  for (const k in markBoxes) {
    const b = markBoxes[k];
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) hoverMark = k;
  }
}

// A piezo buzzer: a black disc with a + mark, and sound rings when sounding.
function drawBuzzer(x, y, sounding, hz, kind, flipped) {
  // Expanding rings. Higher pitch means the rings are packed closer together,
  // which is what makes the two buzzers visually different at a glance.
  if (sounding) {
    const spacing = map(hz, 200, 2400, 26, 8);
    noFill();
    for (let i = 0; i < 5; i++) {
      const r = 26 + ((phase * 60 + i * spacing) % (spacing * 5));
      const a = map(r, 26, 26 + spacing * 5, 190, 0);
      stroke(70, 130, 180, a);
      strokeWeight(2);
      circle(x, y, r * 2);
    }
  }

  noStroke();
  fill(sounding ? '#2E3742' : '#4A525B');
  circle(x, y, 40);
  fill('#1A2027');
  circle(x, y, 30);
  fill(sounding ? '#8FA8C8' : '#5F6B77');
  circle(x, y, 9);

  // Polarity mark, which swaps sides when the leads are reversed
  const px = x + (flipped ? -14 : 14);
  noStroke();
  fill(flipped ? '#3A6EA8' : '#C0392B');
  textAlign(CENTER, CENTER);
  textSize(13);
  text('+', px, y - 13);
  markBoxes[kind] = { x: x - 22, y: y - 24, w: 44, h: 22 };
  if (hoverMark === kind) {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(markBoxes[kind].x, markBoxes[kind].y, 44, 22, 4);
  }

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text(kind === 'active' ? 'active buzzer' : 'passive buzzer', x, y + 24);
  fill(sounding ? 'mediumblue' : 'gray');
  textSize(10);
  text(sounding ? nf(hz, 1, 0) + ' Hz' : (flipped ? 'reversed — silent' : 'silent'), x, y + 38);
}

// The oscillator block that the passive buzzer needs and the active one has
// built in.
function drawOscillator(x, y, on) {
  noStroke();
  fill(on ? '#2878A8' : '#B6BDC4');
  rect(x - 26, y - 12, 52, 24, 4);
  // a little square wave drawn on the block
  stroke('white');
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(x - 18, y + 5); vertex(x - 18, y - 5); vertex(x - 8, y - 5);
  vertex(x - 8, y + 5);  vertex(x + 2, y + 5);  vertex(x + 2, y - 5);
  vertex(x + 12, y - 5); vertex(x + 12, y + 5); vertex(x + 18, y + 5);
  endShape();

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(10);
  text('oscillator', x + 30, y);
}

function drawSwitch(x, y, closed) {
  noStroke();
  fill(closed ? 'darkorange' : 'gainsboro');
  rect(x - 13, y - 10, 26, 20, 4);
  fill(closed ? 'saddlebrown' : 'darkslategray');
  circle(x, y, 11);
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function drawPanel(activeSounds, passiveSounds) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // Side-by-side comparison, which is what the objective asks for
  fill('gray');
  textSize(11);
  text('ACTIVE BUZZER', padX, ty);
  ty += 16;
  fill(activeSounds ? 'darkgreen' : 'dimgray');
  textSize(14);
  text(activeSounds ? 'Sounding at ' + ACTIVE_HZ + ' Hz — its built-in pitch'
                    : 'Silent — switch is off', padX, ty, innerW);
  ty += 20;
  fill('black');
  textSize(12);
  text('It has its own oscillator inside, so plain DC is enough. The frequency ' +
       'slider does nothing to it.', padX, ty, innerW);
  ty += 46;

  fill('gray');
  textSize(11);
  text('PASSIVE BUZZER', padX, ty);
  ty += 16;
  fill(passiveSounds ? 'darkgreen' : (reversed && passiveOn ? 'crimson' : 'dimgray'));
  textSize(14);
  if (passiveSounds) text('Sounding at ' + freq + ' Hz — whatever you feed it', padX, ty, innerW);
  else if (passiveOn && reversed) text('Silent — leads are reversed', padX, ty, innerW);
  else text('Silent — switch is off', padX, ty, innerW);
  ty += 20;
  fill('black');
  textSize(12);
  text('It has no oscillator, so DC alone does nothing. The pitch you hear is ' +
       'exactly the frequency driving it.', padX, ty, innerW);
  ty += 50;

  // Hover explanation on the polarity marks
  if (hoverMark) {
    fill('#E8710A');
    textSize(12);
    text('Piezo buzzers are marked + on one lead. Wired backwards, the element ' +
         'is driven the wrong way and the buzzer stays quiet — it is not ' +
         'damaged, just silent. Check the mark before you power up.',
         padX, ty, innerW);
    ty += 66;
  }

  // The takeaway, stated once
  fill('gray');
  textSize(12);
  text('Active buzzers beep the instant they get power. Passive buzzers need a ' +
       'changing signal to make any sound at all — which is also what lets you ' +
       'choose the note.', padX, ty, innerW);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  // One label, so it cannot collide with the slider that follows it.
  text('Frequency (passive only): ' + freq + ' Hz', 10, drawHeight + 55);
}

function resetAll() {
  activeOn = false;
  passiveOn = false;
  reversed = false;
  freqSlider.value(1000);
  activeButton.html('Active Switch: OFF');
  passiveButton.html('Passive Switch: OFF');
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  freqSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
