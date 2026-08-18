// Buck Converter Trimmer Explorer
// CANVAS_HEIGHT: 540
// Bloom Level: Apply (L3) / Analyze (L4) - Verb: demonstrate, examine, distinguish
// Learning objective: Given a rendered buck converter module fed by an
// adjustable input voltage and driving an LED load, turn the output trimmer
// and observe how the duty cycle and regulated output voltage change together,
// then compare the module's efficiency to a linear regulator doing the same
// step-down job.
//
// Model:
//   D = Vout / Vin                     duty cycle of the switching element
//   Vout = the trimmer's target, held steady as long as Vin stays above it
//
// Why this matters next to Chapter 22's 7805: a linear regulator BURNS the
// difference as heat, so its efficiency is Vout/Vin. A buck converter SWITCHES
// instead, storing energy in the inductor and handing it to the output, so it
// keeps most of the power regardless of the ratio. Dropping 12 V to 5 V, that
// is roughly 42% versus about 90%.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 425;
let controlHeight = 115;     // 3 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 210;
let defaultTextSize = 16;

// ---- Controls ----
let vinSlider, troutSlider, resetButton;

// ---- State ----
let vin = 9;
let target = 5;              // the trimmer's setting
let flowPhase = 0;
let mouseOverCanvas = false;
let hoverPart = null;
let spots = {};
let panel = {};

const LED_VF = 2.0;
const RLED = 220;
const BUCK_EFF = 0.90;       // a typical LM2596 module

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
  resetButton.position(10, drawHeight + 8);
  resetButton.mousePressed(() => { vinSlider.value(9); troutSlider.value(5); });

  vinSlider = createSlider(5, 20, vin, 0.1);
  vinSlider.position(sliderLeftMargin, drawHeight + 8 + 35);
  vinSlider.size(canvasWidth - sliderLeftMargin - margin);

  troutSlider = createSlider(1.5, 12, target, 0.1);
  troutSlider.position(sliderLeftMargin, drawHeight + 8 + 70);
  troutSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A rendered buck converter module with its IC, inductor, capacitors ' +
           'and adjustable trimmer, fed by an input-voltage slider and driving ' +
           'an LED load. Turning the trimmer changes the target output voltage ' +
           'and the duty cycle together, and a readout compares the module ' +
           'efficiency against a linear regulator.', LABEL);
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

  vin = vinSlider.value();
  target = troutSlider.value();

  // ---- The model ----
  // The module regulates only while it has headroom above the target.
  const headroom = vin - target;
  const regulating = headroom >= 1.0;
  const vout = regulating ? target : max(0, vin - 1.0);
  const duty = vin > 0 ? constrain(vout / vin, 0, 1) : 0;
  const iout = vout > LED_VF ? (vout - LED_VF) / RLED : 0;

  if (mouseOverCanvas) flowPhase += 0.02;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Buck Converter Trimmer', canvasWidth / 2, 6);

  const stacked = canvasWidth < 720;
  let modW;
  if (stacked) {
    modW = canvasWidth;
    panel = { x: margin, y: drawHeight * 0.54, w: canvasWidth - 2 * margin,
              h: drawHeight * 0.44 };
  } else {
    modW = canvasWidth * 0.56;
    panel = { x: modW + 10, y: 32, w: canvasWidth - modW - 10 - margin, h: drawHeight - 46 };
  }

  drawModule(modW, stacked, duty, vout, iout, regulating);
  drawPanel(duty, vout, iout, regulating, headroom);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The module
// ---------------------------------------------------------------------------

function drawModule(areaW, stacked, duty, vout, iout, regulating) {
  const bx = margin + 40, by = 54;
  const bw = areaW - margin * 2 - 80, bh = stacked ? drawHeight * 0.40 : 210;

  // PCB
  noStroke();
  fill('#1E6B3A');
  rect(bx, by, bw, bh, 6);
  fill('#2C7D48');
  rect(bx + 5, by + 5, bw - 10, bh - 10, 4);

  // input wiring on the left
  stroke('crimson');
  strokeWeight(3);
  line(bx - 34, by + bh * 0.35, bx, by + bh * 0.35);
  stroke('dimgray');
  line(bx - 34, by + bh * 0.75, bx, by + bh * 0.75);
  noStroke();
  fill('black');
  textAlign(RIGHT, CENTER);
  textSize(11);
  text(nf(vin, 1, 1) + ' V in', bx - 38, by + bh * 0.35);

  // components on the board
  const icX = bx + bw * 0.30, icY = by + bh * 0.34;
  drawIc(icX, icY);
  drawInductor(bx + bw * 0.56, by + bh * 0.32);
  drawCapCan(bx + bw * 0.14, by + bh * 0.70, 'Cin');
  drawCapCan(bx + bw * 0.74, by + bh * 0.70, 'Cout');
  drawDiodeChip(bx + bw * 0.44, by + bh * 0.72);
  drawTrimmer(bx + bw * 0.88, by + bh * 0.36);

  // output wiring on the right, to the LED load
  const outY = by + bh * 0.55;
  stroke(vout > 0.2 ? 'crimson' : '#9AA3AB');
  strokeWeight(3);
  line(bx + bw, outY, bx + bw + 34, outY);
  drawResistorGlyph(bx + bw + 52, outY);
  drawLed(bx + bw + 84, outY, iout * 1000);

  if (vout > 0.2) {
    drawFlow([[bx + bw, outY, bx + bw + 34, outY]], 5, 'crimson');
  }

  noStroke();
  fill('white');
  textAlign(LEFT, TOP);
  textSize(11);
  text('LM2596 buck module', bx + 10, by + bh - 20);

  hoverPart = null;
  for (const k in spots) {
    const s = spots[k];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) hoverPart = k;
  }
}

function drawIc(x, y) {
  noStroke();
  fill('#1A2027');
  rect(x - 26, y - 14, 52, 28, 3);
  fill('#C6CDD5');
  textAlign(CENTER, CENTER);
  textSize(10);
  text('LM2596', x, y);
  spots.ic = { x: x - 30, y: y - 18, w: 60, h: 36 };
  markHover('ic');
}

function drawInductor(x, y) {
  noStroke();
  fill('#3A3A3A');
  rect(x - 20, y - 16, 40, 32, 8);
  fill('#5A5A5A');
  for (let i = 0; i < 3; i++) rect(x - 14 + i * 10, y - 12, 6, 24, 2);
  spots.inductor = { x: x - 24, y: y - 20, w: 48, h: 40 };
  markHover('inductor');
  noStroke();
  fill('white');
  textAlign(CENTER, TOP);
  textSize(9);
  text('L', x, y + 18);
}

function drawCapCan(x, y, label) {
  noStroke();
  fill('#2A3440');
  circle(x, y, 30);
  fill('#8B939B');
  arc(x, y, 30, 30, PI * 0.75, PI * 1.25);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(9);
  text(label, x, y);
}

function drawDiodeChip(x, y) {
  noStroke();
  fill('#1A2027');
  rect(x - 14, y - 8, 28, 16, 2);
  fill('gainsboro');
  rect(x + 8, y - 8, 5, 16);
  spots.diode = { x: x - 18, y: y - 12, w: 36, h: 24 };
  markHover('diode');
}

// The blue trimmer, whose screw slot rotates with the target setting.
function drawTrimmer(x, y) {
  noStroke();
  fill('#2D5FA8');
  rect(x - 18, y - 18, 36, 36, 4);
  fill('#D8DDE2');
  circle(x, y, 24);
  const ang = map(target, 1.5, 12, -PI * 0.7, PI * 0.7);
  stroke('#3A4650');
  strokeWeight(4);
  line(x - cos(ang) * 9, y - sin(ang) * 9, x + cos(ang) * 9, y + sin(ang) * 9);
  spots.trimmer = { x: x - 22, y: y - 22, w: 44, h: 44 };
  markHover('trimmer');
  noStroke();
  fill('white');
  textAlign(CENTER, TOP);
  textSize(9);
  text('adj', x, y + 20);
}

function markHover(key) {
  if (hoverPart === key && spots[key]) {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(spots[key].x, spots[key].y, spots[key].w, spots[key].h, 4);
  }
}

function drawResistorGlyph(cx, y) {
  noStroke();
  fill('wheat');
  rect(cx - 14, y - 6, 28, 12, 3);
  fill('firebrick'); rect(cx - 3, y - 6, 3, 12);
}

function drawLed(x, y, ma) {
  const b = constrain(ma / 13.6, 0, 1);
  noStroke();
  if (b > 0.02) {
    fill(255, 110, 90, 120 * b);
    circle(x, y, 32 + b * 10);
  }
  fill(b > 0.02 ? color(255, 90 + 60 * b, 70) : '#D8DDE2');
  arc(x, y, 20, 24, PI, TWO_PI);
  rect(x - 10, y, 20, 6);
}

function drawFlow(legs, size, col) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(3, floor(total / 22));
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

function drawPanel(duty, vout, iout, regulating, headroom) {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 10;

  noStroke();
  textAlign(LEFT, TOP);

  // The four-line readout
  fill('gray');
  textSize(11);
  text('READOUT', padX, ty);
  ty += 16;
  fill('black');
  textSize(14);
  text('Duty cycle:  ' + nf(duty * 100, 1, 0) + '%', padX, ty); ty += 20;
  text('Vin:         ' + nf(vin, 1, 1) + ' V', padX, ty); ty += 20;
  fill(regulating ? 'darkgreen' : 'crimson');
  text('Vout:        ' + nf(vout, 1, 2) + ' V', padX, ty); ty += 20;
  fill('black');
  text('Iout:        ' + nf(iout * 1000, 1, 1) + ' mA', padX, ty);
  ty += 30;

  // Duty cycle explained with the learner's own numbers
  fill('gray');
  textSize(11);
  text('WHERE THE DUTY CYCLE COMES FROM', padX, ty);
  ty += 16;
  fill('mediumblue');
  textSize(12);
  text('D = Vout ÷ Vin = ' + nf(vout, 1, 2) + ' ÷ ' + nf(vin, 1, 1) + ' = ' +
       nf(duty * 100, 1, 0) + '%. The switch is closed that fraction of each ' +
       'cycle; the inductor carries the load through the rest.', padX, ty, innerW);
  ty += 58;

  if (!regulating) {
    fill('crimson');
    textSize(12);
    text('Vin is only ' + nf(headroom, 1, 1) + ' V above the target, which is not ' +
         'enough headroom. The output has stopped holding and is drifting down ' +
         'with the input.', padX, ty, innerW);
    ty += 46;
  }

  // The comparison against a linear regulator - the Analyze-level payoff
  fill('gray');
  textSize(11);
  text('BUCK vs LINEAR, SAME JOB', padX, ty);
  ty += 16;
  const linEff = vin > 0 ? vout / vin : 0;
  fill('black');
  textSize(12);
  text('A linear regulator burns the difference as heat, so its efficiency is ' +
       'just Vout/Vin — about ' + nf(linEff * 100, 1, 0) + '% here. This module ' +
       'switches instead of burning, and keeps roughly ' +
       nf(BUCK_EFF * 100, 1, 0) + '%.', padX, ty, innerW);
  ty += 58;

  // Hover notes
  const notes = {
    inductor: 'The inductor stores energy in a magnetic field while the switch ' +
              'is closed and releases it to the output while the switch is open. ' +
              'That store-and-release is what lets a buck converter step down ' +
              'without burning the difference.',
    ic: 'The LM2596 does the switching and the regulating: it watches the ' +
        'output and adjusts the duty cycle to hold it at the target.',
    diode: 'The catch diode gives the inductor current somewhere to go during ' +
           'the part of each cycle when the switch is open.',
    trimmer: 'The adjustment trimmer sets the target output voltage. Turn it ' +
             'with a small screwdriver, and check the output with a meter before ' +
             'connecting anything you care about.'
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
  text('Vin: ' + nf(vin, 1, 1) + ' V', 10, drawHeight + 18 + 35);
  text('Trimmer target: ' + nf(target, 1, 1) + ' V', 10, drawHeight + 18 + 70);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  const w = canvasWidth - sliderLeftMargin - margin;
  vinSlider.size(w);
  troutSlider.size(w);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
