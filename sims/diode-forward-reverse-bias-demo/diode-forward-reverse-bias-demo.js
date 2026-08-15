// Diode Forward and Reverse Bias Demo
// CANVAS_HEIGHT: 520
// Bloom Level: Understand (L2) / Apply (L3) - Verb: demonstrate, predict
// Learning objective: Given a rendered breadboard circuit with a diode, a
// battery and an LED current indicator, predict and observe whether current
// flows when the diode is forward-biased versus reverse-biased, and observe
// what happens as forward current approaches and exceeds the diode's rating.
//
// A diode conducts only when its anode is more positive than its cathode.
// Flipping the battery reverses that, and the current stops. At this course's
// low voltage nothing is damaged either way - the sim says so, because a
// beginner's first assumption on seeing a dark LED is that they broke it.
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
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// ---- Controls ----
let flipButton, resetButton;
let currentSlider;

// ---- State ----
let flipped = false;         // false = forward biased
let sourceMa = 15;
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverDiode = false;
let spots = {};
let panel = {};

const DIODE_RATING_MA = 20;  // a small signal diode's continuous forward rating
const COLS = 20;
const DIODE_COL = 7;
const LED_COL = 13;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  flipButton = createButton('Flip Battery');
  flipButton.position(10, drawHeight + 10);
  flipButton.mousePressed(() => flipped = !flipped);

  resetButton = createButton('Reset');
  resetButton.position(115, drawHeight + 10);
  resetButton.mousePressed(resetAll);

  currentSlider = createSlider(0, 30, sourceMa, 1);
  currentSlider.position(sliderLeftMargin, drawHeight + 45);
  currentSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A breadboard circuit with a battery, a diode with a visible band, ' +
           'and an LED current indicator. A Flip Battery button reverses the ' +
           'polarity so the diode blocks current and the LED goes dark. A ' +
           'current slider raises the source current, and a warning appears ' +
           'once it passes the diode rating.', LABEL);
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

  sourceMa = currentSlider.value();
  const forward = !flipped;
  const flowing = forward && sourceMa > 0;
  const over = flowing && sourceMa > DIODE_RATING_MA;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Forward and Reverse Bias', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  let boardX, boardY, boardW, boardH;
  if (stacked) {
    boardX = margin; boardY = 30;
    boardW = canvasWidth - 2 * margin;
    boardH = drawHeight * 0.46;
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

  if (mouseOverCanvas && flowing) flowPhase += 0.004 + constrain(sourceMa / 500, 0, 0.03);

  drawCircuit(forward, flowing, over);
  drawPanel(forward, flowing, over);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Circuit
// ---------------------------------------------------------------------------

function drawCircuit(forward, flowing, over) {
  const railPlus = bbRowY('T+');
  const railMinus = bbRowY('T-');
  const rowY = bbRowY('c');

  const xD = bbColX(DIODE_COL);
  const xL = bbColX(LED_COL);

  // Battery badge showing which way round it is
  drawBatteryBadge(forward);

  // Supply into the diode
  stroke(forward ? 'crimson' : 'dimgray');
  strokeWeight(3);
  noFill();
  line(xD, railPlus, xD, rowY);

  // Diode with its cathode band. Flipping the battery does not move the
  // diode - it changes which way the supply pushes, which is the point.
  drawDiode(xD, xL, rowY, forward);

  // Indicator LED, then down to ground
  drawIndicatorLed(xL, rowY, flowing, over);
  stroke('dimgray');
  strokeWeight(3);
  line(xL, rowY + 24, xL, railMinus);

  if (flowing) drawFlow(xD, railPlus, xL, railMinus, rowY);
  else drawBlockedMarker((xD + xL) / 2, rowY);

  // Rail labels reflect the flip
  noStroke();
  textAlign(LEFT, BOTTOM);
  textSize(12);
  fill(forward ? 'crimson' : 'dimgray');
  text(forward ? '+ supply' : '− supply', BB.x + 4, railPlus - 4);
  textAlign(LEFT, TOP);
  fill(forward ? 'dimgray' : 'crimson');
  text(forward ? '− return' : '+ return', BB.x + 4, railMinus + 4);

  // Over-rating banner, placed under the board so it never hits the title
  if (over) {
    const pulse = 150 + sin(flowPhase * 10) * 80;
    const by = min(BB.y + bbHeight() + 6, drawHeight - 24);
    noStroke();
    fill(220, 20, 60, pulse);
    rect(BB.x, by, BB.w, 20, 4);
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(12);
    text('above the diode\'s ' + DIODE_RATING_MA + ' mA rating — it would overheat',
         BB.x + BB.w / 2, by + 10);
  }
}

function drawBatteryBadge(forward) {
  const x = BB.x + 6;
  const y = bbRowY('T+') - 26;
  noStroke();
  fill('gainsboro');
  rect(x, y, 54, 18, 3);
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(11);
  text(forward ? '+ on top' : '− on top', x + 5, y + 9);
}

// A diode drawn as a triangle pointing into its cathode band.
function drawDiode(xD, xL, rowY, forward) {
  const cx = (xD + xL) / 2 - 30;

  stroke(forward ? 'crimson' : 'dimgray');
  strokeWeight(3);
  line(xD, rowY, cx - 16, rowY);
  line(cx + 16, rowY, xL, rowY);

  // Body
  noStroke();
  fill('#3A3A3A');
  rect(cx - 16, rowY - 11, 32, 22, 3);
  // Cathode band, always at the same physical end
  fill('gainsboro');
  rect(cx + 9, rowY - 11, 7, 22);

  // Direction arrow inside the body
  fill('white');
  triangle(cx - 7, rowY - 7, cx - 7, rowY + 7, cx + 6, rowY);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('diode', cx, rowY + 14);

  spots.diode = { x: cx - 22, y: rowY - 18, w: 44, h: 36 };
  hoverDiode = mouseX >= spots.diode.x && mouseX <= spots.diode.x + spots.diode.w &&
               mouseY >= spots.diode.y && mouseY <= spots.diode.y + spots.diode.h;
  if (hoverDiode) {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(spots.diode.x, spots.diode.y, spots.diode.w, spots.diode.h, 4);
  }
}

function drawIndicatorLed(x, y, flowing, over) {
  const brightness = flowing ? constrain(sourceMa / 15, 0, 1.4) : 0;
  noStroke();
  if (flowing) {
    fill(over ? color(255, 80, 60, 90 * brightness) : color(120, 230, 120, 90 * brightness));
    circle(x, y, 38 + brightness * 10);
  }
  fill(flowing ? (over ? color(255, 120, 90) : color(120, 220, 120)) : 'lightgray');
  arc(x, y, 24, 28, PI, TWO_PI);
  rect(x - 12, y, 24, 8);

  stroke('dimgray');
  strokeWeight(3);
  line(x + 3, y + 8, x + 12, y + 8);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('indicator', x, y + 26);
}

function drawFlow(xD, railPlus, xL, railMinus, rowY) {
  const legs = [
    [xD, railPlus, xD, rowY],
    [xD, rowY, xL, rowY],
    [xL, rowY + 24, xL, railMinus]
  ];
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);

  const dots = 9;
  noStroke();
  fill(sourceMa > DIODE_RATING_MA ? 'crimson' : 'seagreen');
  for (let i = 0; i < dots; i++) {
    let d = ((flowPhase + i / dots) % 1) * total;
    for (const l of legs) {
      const len = dist(l[0], l[1], l[2], l[3]);
      if (d <= len) {
        const t = len === 0 ? 0 : d / len;
        circle(lerp(l[0], l[2], t), lerp(l[1], l[3], t), 6);
        break;
      }
      d -= len;
    }
  }
}

function drawBlockedMarker(x, y) {
  stroke('crimson');
  strokeWeight(3);
  noFill();
  circle(x + 34, y - 26, 18);
  line(x + 28, y - 32, x + 40, y - 20);
  noStroke();
  fill('crimson');
  textAlign(LEFT, CENTER);
  textSize(11);
  text('blocked', x + 46, y - 26);
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function drawPanel(forward, flowing, over) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  // Stage 1 and 2 - polarity, then the resulting bias condition
  fill('gray');
  textSize(12);
  text('BATTERY ORIENTATION', padX, ty);
  ty += 16;
  fill('black');
  textSize(14);
  text(forward ? 'Positive side feeding the diode\'s anode' :
                 'Positive side feeding the diode\'s cathode', padX, ty, innerW);
  ty += 36;

  fill('gray');
  textSize(12);
  text('BIAS CONDITION', padX, ty);
  ty += 16;
  fill(forward ? 'darkgreen' : 'dimgray');
  textSize(19);
  text(forward ? 'Forward Biased' : 'Reverse Biased', padX, ty);
  ty += 30;

  fill('black');
  textSize(13);
  if (forward) {
    text('Current flows from anode to cathode' +
         (over ? ', but it is past the rating.' : ', well under the rating.'),
         padX, ty, innerW);
  } else {
    text('The diode blocks current in this direction, so the indicator stays ' +
         'dark. At this course\'s low voltage nothing is damaged — flip the ' +
         'battery back and it conducts again.', padX, ty, innerW);
  }
  ty += forward ? 34 : 74;

  // Stage 4 - the numbers side by side
  fill('gray');
  textSize(12);
  text('CURRENT vs RATING', padX, ty);
  ty += 18;
  fill(over ? 'crimson' : 'mediumblue');
  textSize(17);
  text((flowing ? sourceMa : 0) + ' mA  /  ' + DIODE_RATING_MA + ' mA rated', padX, ty);
  ty += 26;

  // Bar comparing the two
  const barW = innerW;
  noStroke();
  fill('gainsboro');
  rect(padX, ty, barW, 12, 4);
  fill(over ? 'crimson' : 'seagreen');
  rect(padX, ty, barW * constrain((flowing ? sourceMa : 0) / 30, 0, 1), 12, 4);
  // Rating tick
  stroke('black');
  strokeWeight(2);
  const tick = padX + barW * (DIODE_RATING_MA / 30);
  line(tick, ty - 3, tick, ty + 15);
  ty += 22;
  noStroke();
  fill('gray');
  textSize(11);
  text('the mark is the ' + DIODE_RATING_MA + ' mA rating', padX, ty);
  ty += 24;

  if (hoverDiode) {
    fill('#E8710A');
    textSize(13);
    text('This diode is ' + (forward ? 'forward biased' : 'reverse biased') +
         ' right now. Its continuous forward rating is ' + DIODE_RATING_MA +
         ' mA — the band marks the cathode.', padX, ty, innerW);
  }
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Source current: ' + sourceMa + ' mA', 10, drawHeight + 55);
}

function resetAll() {
  flipped = false;
  currentSlider.value(15);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  currentSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
