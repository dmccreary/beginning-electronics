// Unit Prefix Converter Ladder
// CANVAS_HEIGHT: 440
// Bloom Level: Apply (L3) - Verb: calculate
// Learning objective: Calculate the equivalent value of a current, resistance,
// or power reading across microampere/milliampere/ampere, ohm/kilohm/megohm,
// and milliwatt/watt scales, by entering a number and switching its prefix on
// an interactive ladder.
//
// Every rung updates at once rather than one conversion at a time, so the
// relationship between the prefixes stays visible instead of being computed
// in isolation.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 360;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let defaultTextSize = 16;

// ---- Controls ----
let quantitySelect;
let rungSelect;
let valueInput;
let exampleButton;

// ---- State ----
let quantity = 'Current';
let enteredValue = 20;
let enteredRung = 'milli';
let exampleIndex = 0;

// The five ladder rungs, largest first so the ladder reads top-down like a
// number line running from big units to small.
const RUNGS = [
  { key: 'mega',  symbol: 'M', name: 'mega',  factor: 1e6  },
  { key: 'kilo',  symbol: 'k', name: 'kilo',  factor: 1e3  },
  { key: 'base',  symbol: '',  name: 'base',  factor: 1    },
  { key: 'milli', symbol: 'm', name: 'milli', factor: 1e-3 },
  { key: 'micro', symbol: 'µ', name: 'micro', factor: 1e-6 }
];

// Base unit symbol per quantity type.
const UNITS = { Current: 'A', Resistance: 'Ω', Power: 'W' };

// The rungs a learner actually meets for each quantity in this course. Rungs
// outside this set still show a correct value, but are de-emphasized so the
// ladder does not imply that mega-amps or micro-ohms are everyday readings.
const COMMON = {
  Current:    ['micro', 'milli', 'base'],
  Resistance: ['base', 'kilo', 'mega'],
  Power:      ['milli', 'base']
};

// Real component values drawn from this chapter.
const EXAMPLES = [
  { quantity: 'Current',    value: 20, rung: 'milli', note: 'a typical LED current' },
  { quantity: 'Resistance', value: 1,  rung: 'kilo',  note: 'a common series resistor' },
  { quantity: 'Power',      value: 60, rung: 'milli', note: 'the power an LED dissipates' },
  { quantity: 'Current',    value: 5,  rung: 'micro', note: 'a sleeping chip' },
  { quantity: 'Resistance', value: 1,  rung: 'mega',  note: 'a pull-up resistor' }
];

let exampleNote = '';

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

  quantitySelect = createSelect();
  quantitySelect.position(90, drawHeight + 10);
  quantitySelect.option('Current');
  quantitySelect.option('Resistance');
  quantitySelect.option('Power');
  quantitySelect.selected('Current');
  quantitySelect.changed(() => { quantity = quantitySelect.value(); exampleNote = ''; });

  valueInput = createInput(str(enteredValue), 'number');
  valueInput.position(255, drawHeight + 10);
  valueInput.size(70);
  valueInput.input(readValue);

  rungSelect = createSelect();
  rungSelect.position(340, drawHeight + 10);
  for (const r of RUNGS) rungSelect.option(rungLabel(r));
  rungSelect.selected(rungLabel(RUNGS.find(r => r.key === 'milli')));
  rungSelect.changed(readRung);

  exampleButton = createButton('Try a Real Example');
  exampleButton.position(10, drawHeight + 45);
  exampleButton.mousePressed(nextExample);

  describe('A vertical ladder of five unit-prefix rungs — mega, kilo, base, ' +
           'milli and micro. Entering a value and choosing its prefix updates ' +
           'the equivalent value on every rung at once, for current, resistance ' +
           'or power.', LABEL);
}

function rungLabel(r) {
  return r.key === 'base' ? 'base (no prefix)' : r.name + ' (' + r.symbol + ')';
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
  textSize(22);
  text('Unit Prefix Converter', canvasWidth / 2, 8);

  // Convert the entered value into the base unit once, then express that
  // single base value on every rung.
  const active = RUNGS.find(r => r.key === enteredRung);
  const baseValue = enteredValue * active.factor;

  drawLadder(baseValue);
  drawCaption(baseValue);

  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The ladder
// ---------------------------------------------------------------------------

function drawLadder(baseValue) {
  const unit = UNITS[quantity];
  const topY = 46;
  const rungH = 46;
  const gap = 8;
  const barX = margin + 132;
  const barW = canvasWidth - barX - margin;

  for (let i = 0; i < RUNGS.length; i++) {
    const r = RUNGS[i];
    const y = topY + i * (rungH + gap);
    const isActive = r.key === enteredRung;
    const isCommon = COMMON[quantity].indexOf(r.key) >= 0;
    const bw = max(barW, 90);

    // Rung bar. Uncommon rungs are drawn faintly so the eye lands on the
    // scales this course actually uses.
    fill(isActive ? 'papayawhip' : (isCommon ? 'white' : 'whitesmoke'));
    stroke(isActive ? 'darkorange' : (isCommon ? 'steelblue' : 'lightgray'));
    strokeWeight(isActive ? 3 : 1);
    rect(barX, y, bw, rungH, 8);

    // Prefix label to the left of the bar
    noStroke();
    fill(isActive ? 'saddlebrown' : (isCommon ? 'black' : 'darkgray'));
    textAlign(RIGHT, CENTER);
    textSize(defaultTextSize);
    const prefixText = r.key === 'base'
      ? unit + '  (base)'
      : r.symbol + unit + '  (' + r.name + ')';
    text(prefixText, barX - 12, y + rungH / 2);

    // The same quantity expressed at this rung's scale
    const scaled = baseValue / r.factor;
    noStroke();
    fill(isActive ? 'saddlebrown' : (isCommon ? 'dimgray' : 'darkgray'));
    textAlign(LEFT, CENTER);
    textSize(isActive ? 18 : defaultTextSize);
    text(formatValue(scaled) + ' ' + r.symbol + unit, barX + 14, y + rungH / 2);

    // Right-hand marker: which rung was typed into, or a note that this
    // scale is not one you meet in practice for this quantity.
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(13);
    if (isActive) {
      fill('darkorange');
      text('you entered this', barX + bw - 12, y + rungH / 2);
    } else if (!isCommon) {
      fill('darkgray');
      text('rarely used for ' + quantity.toLowerCase(), barX + bw - 12, y + rungH / 2);
    }
  }
}

// Format a number so every rung stays readable: thousands separators for big
// values, and enough decimals for small ones without a wall of zeros.
function formatValue(v) {
  if (v === 0) return '0';
  const a = abs(v);
  let s;
  if (a >= 1000)      s = nf(v, 1, 0);
  else if (a >= 100)  s = nf(v, 1, 1);
  else if (a >= 1)    s = nf(v, 1, 2);
  else if (a >= 0.001) s = nf(v, 1, 5);
  else                 s = v.toExponential(2);

  // Trim trailing zeros so "20.00" reads as "20"
  if (s.indexOf('.') >= 0 && s.indexOf('e') < 0) {
    s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return addThousands(s);
}

function addThousands(s) {
  const neg = s.charAt(0) === '-';
  if (neg) s = s.substring(1);
  const parts = s.split('.');
  let intPart = parts[0];
  let out = '';
  let count = 0;
  for (let i = intPart.length - 1; i >= 0; i--) {
    out = intPart.charAt(i) + out;
    count++;
    if (count % 3 === 0 && i > 0) out = ',' + out;
  }
  const res = parts.length > 1 ? out + '.' + parts[1] : out;
  return (neg ? '-' : '') + res;
}

function drawCaption(baseValue) {
  const unit = UNITS[quantity];
  const active = RUNGS.find(r => r.key === enteredRung);
  const entered = formatValue(enteredValue) + ' ' + active.symbol + unit;
  const inBase = formatValue(baseValue) + ' ' + unit;

  let msg = entered + '  =  ' + inBase + '   — same quantity, different prefix.';
  if (exampleNote) msg += '   (' + exampleNote + ')';

  const y = drawHeight - 30;
  noStroke();
  fill('black');
  textAlign(CENTER, CENTER);
  textSize(defaultTextSize);
  text(msg, canvasWidth / 2, y);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Quantity:', 10, drawHeight + 22);
  text('Value:', 205, drawHeight + 22);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function readValue() {
  const v = parseFloat(valueInput.value());
  if (!isNaN(v)) {
    enteredValue = v;
    exampleNote = '';
  }
}

function readRung() {
  const v = rungSelect.value();
  const r = RUNGS.find(x => rungLabel(x) === v);
  if (r) {
    enteredRung = r.key;
    exampleNote = '';
  }
}

// Cycle through real component values from this chapter.
function nextExample() {
  const ex = EXAMPLES[exampleIndex];
  exampleIndex = (exampleIndex + 1) % EXAMPLES.length;

  quantity = ex.quantity;
  enteredValue = ex.value;
  enteredRung = ex.rung;
  exampleNote = ex.note;

  quantitySelect.selected(ex.quantity);
  valueInput.value(str(ex.value));
  rungSelect.selected(rungLabel(RUNGS.find(r => r.key === ex.rung)));
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
