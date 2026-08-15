// Transistor Current Gain Explorer
// CANVAS_HEIGHT: 500
// Bloom Level: Apply (L3) - Verb: calculate, demonstrate, compare
// Learning objective: Given a base current value and a selected transistor
// (BC547 or 2N2222), calculate the resulting collector current using
// Ic = beta x Ib, and compare how the two transistors' different gain and
// current-rating values change that outcome.
//
// Saturation is the honest part of this model. Ic = beta x Ib only holds in
// the active region; once the calculation exceeds what the part (and the rest
// of the circuit) can actually supply, the real collector current stops
// rising. The sim shows both numbers so the learner sees the formula's limit
// rather than trusting an impossible answer.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 415;
let controlHeight = 85;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let sliderLeftMargin = 210;
let defaultTextSize = 16;

// ---- Controls ----
let baseSlider;
let partSelect;
let resetButton;

// ---- State ----
let baseMa = 0.5;
let partName = 'BC547';
let hoverTarget = null;
let flashPhase = 0;
let barBoxes = {};

const PARTS = {
  'BC547':  { hfe: 100, maxIc: 100, note: 'a small-signal NPN, common in kits' },
  '2N2222': { hfe: 150, maxIc: 800, note: 'a tougher NPN that can switch much more current' }
};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  partSelect = createSelect();
  partSelect.position(120, drawHeight + 8);
  for (const k in PARTS) partSelect.option(k);
  partSelect.selected('BC547');
  partSelect.changed(() => partName = partSelect.value());

  resetButton = createButton('Reset');
  resetButton.position(240, drawHeight + 8);
  resetButton.mousePressed(resetAll);

  baseSlider = createSlider(0, 2, baseMa, 0.05);
  baseSlider.position(sliderLeftMargin, drawHeight + 45);
  baseSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A base-current slider and a transistor selector for the BC547 and ' +
           '2N2222. A thin bar shows base current beside a thick bar showing ' +
           'the calculated collector current, with the current-gain formula ' +
           'shown with real numbers substituted in and a saturation warning ' +
           'when the result passes the part rating.', LABEL);
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

  baseMa = baseSlider.value();
  const part = PARTS[partName];

  // ---- The model ----
  const predictedIc = part.hfe * baseMa;              // what the formula says
  const actualIc = min(predictedIc, part.maxIc);      // what the part can do
  const saturated = predictedIc > part.maxIc;

  flashPhase += 0.12;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Transistor Current Gain', canvasWidth / 2, 6);

  drawFormula(part, predictedIc, actualIc, saturated);
  drawBars(part, actualIc, saturated);
  drawInfo(part, predictedIc, actualIc, saturated);
  drawControlLabels(part);
}

// ---------------------------------------------------------------------------
// The formula, with this learner's numbers in it
// ---------------------------------------------------------------------------

function drawFormula(part, predictedIc, actualIc, saturated) {
  const x = margin, w = canvasWidth - 2 * margin;
  const y = 36, h = 84;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  textAlign(LEFT, TOP);

  fill('gray');
  textSize(12);
  text('COLLECTOR CURRENT = GAIN × BASE CURRENT', x + 12, y + 8);

  fill('black');
  textSize(15);
  text('Ic = β × Ib', x + 12, y + 26);

  fill('mediumblue');
  textSize(17);
  text('Ic = ' + part.hfe + ' × ' + nf(baseMa, 1, 2) + ' mA = ' +
       nf(predictedIc, 1, 1) + ' mA', x + 12, y + 48);

  // When the formula outruns the part, say so right next to the number
  if (saturated) {
    fill('crimson');
    textSize(12);
    textAlign(RIGHT, TOP);
    text('but the part tops out at ' + part.maxIc + ' mA', x + w - 12, y + 54);
  }

  const fbox = { x: x, y: y, w: w, h: h };
  if (inBox(fbox, mouseX, mouseY)) hoverTarget = 'formula';
}

// ---------------------------------------------------------------------------
// The two bars, drawn at very different scales on purpose
// ---------------------------------------------------------------------------

function drawBars(part, actualIc, saturated) {
  const x = margin;
  const w = canvasWidth - 2 * margin;
  const top = 134;

  // Base current bar - thin, scaled 0..2 mA
  const bH = 16;
  const bY = top + 22;
  noStroke();
  fill('gray');
  textAlign(LEFT, BOTTOM);
  textSize(13);
  text('base current — scale 0 to 2 mA', x, bY - 4);

  fill('gainsboro');
  rect(x, bY, w, bH, 4);
  fill('mediumblue');
  rect(x, bY, w * constrain(baseMa / 2, 0, 1), bH, 4);
  barBoxes.base = { x: x, y: bY - 18, w: w, h: bH + 20 };

  noStroke();
  fill('mediumblue');
  textAlign(LEFT, TOP);
  textSize(15);
  text(nf(baseMa, 1, 2) + ' mA', x, bY + bH + 4);

  // Collector current bar - thick, scaled to this part's own maximum
  const cH = 34;
  const cY = bY + bH + 46;
  noStroke();
  fill('gray');
  textAlign(LEFT, BOTTOM);
  textSize(13);
  text('collector current — scale 0 to ' + part.maxIc + ' mA', x, cY - 4);

  fill('gainsboro');
  rect(x, cY, w, cH, 5);
  const frac = constrain(actualIc / part.maxIc, 0, 1);
  if (saturated) {
    // Flash red while pinned at the ceiling
    const a = 160 + sin(flashPhase) * 80;
    fill(220, 20, 60, a);
  } else {
    fill('seagreen');
  }
  rect(x, cY, w * frac, cH, 5);
  barBoxes.collector = { x: x, y: cY - 18, w: w, h: cH + 24 };

  noStroke();
  fill(saturated ? 'crimson' : 'darkgreen');
  textAlign(LEFT, TOP);
  textSize(17);
  text(nf(actualIc, 1, 1) + ' mA' + (saturated ? '  (pinned at the maximum)' : ''),
       x, cY + cH + 4);

  // The amplification, stated plainly
  noStroke();
  fill('black');
  textAlign(RIGHT, TOP);
  textSize(13);
  if (baseMa > 0) {
    text('that is ' + nf(actualIc / baseMa, 1, 0) + '× the base current',
         x + w, cY + cH + 6);
  }

  hoverTarget = null;
  if (inBox(barBoxes.base, mouseX, mouseY)) hoverTarget = 'base';
  else if (inBox(barBoxes.collector, mouseX, mouseY)) hoverTarget = 'collector';
}

// ---------------------------------------------------------------------------
// Infobox
// ---------------------------------------------------------------------------

function drawInfo(part, predictedIc, actualIc, saturated) {
  const x = margin, w = canvasWidth - 2 * margin;
  const y = drawHeight - 88, h = 78;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  textAlign(LEFT, TOP);
  textSize(13);

  // A hovered element takes priority - that is the explain-this affordance
  if (hoverTarget === 'formula') {
    fill('#E8710A');
    text('β (beta, also written hFE) is the current gain: how many times bigger ' +
         'the collector current is than the base current. For the ' + partName +
         ' a typical value is ' + part.hfe + '.', x + 12, y + 10, w - 24);
    return;
  }
  if (hoverTarget === 'base') {
    fill('#E8710A');
    text('Base current is the small control current you feed into the base pin. ' +
         'A fraction of a milliamp here is enough to steer a much larger ' +
         'collector current.', x + 12, y + 10, w - 24);
    return;
  }
  if (hoverTarget === 'collector') {
    fill('#E8710A');
    text('Collector current is the large current the transistor lets through ' +
         'from collector to emitter. It follows the base current until the ' +
         'part reaches its limit.', x + 12, y + 10, w - 24);
    return;
  }

  if (saturated) {
    fill('crimson');
    text('Saturation — the formula predicts ' + nf(predictedIc, 1, 0) + ' mA, but the ' +
         partName + ' tops out around ' + part.maxIc + ' mA. Past this point ' +
         'raising the base current changes nothing: the transistor is already ' +
         'as far open as it goes.', x + 12, y + 10, w - 24);
  } else {
    fill('darkgreen');
    text('Active region — collector current is proportional to base current. ' +
         'The ' + partName + ' is ' + part.note + '.', x + 12, y + 10, w - 24);
  }
}

function drawControlLabels(part) {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Transistor:', 10, drawHeight + 20);
  text('Base: ' + nf(baseMa, 1, 2) + ' mA', 10, drawHeight + 57);

  fill('gray');
  textSize(12);
  text('β = ' + part.hfe + ', max ' + part.maxIc + ' mA', 300, drawHeight + 20);
}

function inBox(b, px, py) {
  return b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}

function resetAll() {
  baseSlider.value(0.5);
  partName = 'BC547';
  partSelect.selected('BC547');
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  baseSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
