// Battery Type Explorer
// CANVAS_HEIGHT: 500
// Bloom Level: Understand (L2) - Verb: compare
// Learning objective: Compare the nominal voltage, typical capacity range and
// common use of six battery types — AAA, AA, coin cell, single-cell LiPo, 9V
// and D cell — by clicking each battery illustration to reveal its
// specifications in an infobox.
//
// The battery-life readout uses  hours = capacity(mAh) / load(mA)  on the
// midpoint of each capacity range, which turns an abstract "mAh" number into
// a concrete "how long will this run" answer.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 420;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let sliderLeftMargin = 220;
let defaultTextSize = 16;

// ---- Controls ----
let loadSlider;
let resetButton;

// ---- State ----
let selected = null;
let showCells = false;      // exploded view of the 9V block
let loadMa = 40;
let cellsToggleBox = null;
let boxes = {};             // clickable region per battery
let panel = {};

// Relative size is drawn to scale so the row reads smallest to largest.
const BATTERIES = [
  { key: 'coin', label: 'Coin cell',  chem: 'lithium',  volts: 3.0, capLo: 200,   capHi: 240,   w: 34, h: 34,  use: 'watches, small boards, real-time clocks' },
  { key: 'aaa',  label: 'AAA',        chem: 'alkaline', volts: 1.5, capLo: 850,   capHi: 1200,  w: 22, h: 74,  use: 'small remotes and compact LED torches' },
  { key: 'aa',   label: 'AA',         chem: 'alkaline', volts: 1.5, capLo: 1800,  capHi: 2800,  w: 28, h: 90,  use: 'most battery packs used in this kit' },
  { key: 'lipo', label: 'LiPo cell',  chem: 'lithium',  volts: 3.7, capLo: 400,   capHi: 2000,  w: 62, h: 84,  use: 'rechargeable projects and portable boards' },
  { key: '9v',   label: '9V block',   chem: 'alkaline', volts: 9.0, capLo: 400,   capHi: 600,   w: 50, h: 90,  use: 'breadboard supplies, usually through a regulator' },
  { key: 'd',    label: 'D cell',     chem: 'alkaline', volts: 1.5, capLo: 12000, capHi: 18000, w: 50, h: 118, use: 'long-running, high-drain devices' }
];

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  resetButton = createButton('Reset');
  resetButton.position(10, drawHeight + 10);
  resetButton.mousePressed(resetView);

  loadSlider = createSlider(1, 500, loadMa, 1);
  loadSlider.position(sliderLeftMargin, drawHeight + 45);
  loadSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('Six battery illustrations drawn to relative scale — coin cell, ' +
           'AAA, AA, LiPo cell, 9V block and D cell. Clicking one shows its ' +
           'chemistry, nominal voltage, capacity range and common use, plus an ' +
           'estimated battery life that updates with a load-current slider. ' +
           'The 9V block can be opened to reveal the six cells in series inside.', LABEL);
}

function draw() {
  updateCanvasSize();
  computeLayout();

  // Background regions - required MicroSim standard
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  loadMa = loadSlider.value();

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  text('Battery Type Explorer', canvasWidth / 2, 8);

  drawBatteries();
  drawInfoPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function computeLayout() {
  const stacked = canvasWidth < 660;
  let rowRight, rowBottom;

  if (stacked) {
    rowRight = canvasWidth;
    rowBottom = drawHeight * 0.56;
    panel = { x: 10, y: rowBottom + 6, w: canvasWidth - 20, h: drawHeight - rowBottom - 16 };
  } else {
    rowRight = canvasWidth * 0.63;
    rowBottom = drawHeight;
    panel = { x: rowRight + 10, y: 44, w: canvasWidth - rowRight - 20, h: drawHeight - 60 };
  }

  // Batteries sit on a shared baseline so their relative heights are the
  // visual comparison. Capacity bars go underneath.
  const baseline = rowBottom - (stacked ? 66 : 150);
  const avail = rowRight - 2 * margin;
  const totalW = BATTERIES.reduce((s, b) => s + b.w, 0);
  const gap = max(8, (avail - totalW) / (BATTERIES.length - 1));

  let x = margin;
  boxes = {};
  for (const b of BATTERIES) {
    boxes[b.key] = { x: x, y: baseline - b.h, w: b.w, h: b.h, baseline: baseline };
    x += b.w + gap;
  }
}

// ---------------------------------------------------------------------------
// Batteries
// ---------------------------------------------------------------------------

function drawBatteries() {
  const maxCap = 15000;   // D-cell midpoint, used to scale the capacity bars

  for (const b of BATTERIES) {
    const r = boxes[b.key];
    const sel = selected === b.key;
    const body = b.chem === 'lithium' ? 'sandybrown' : 'lightsteelblue';

    // Selection halo
    if (sel) {
      noStroke();
      fill(255, 165, 0, 70);
      rect(r.x - 7, r.y - 7, r.w + 14, r.h + 14, 8);
    }

    drawBatteryBody(b, r, body, sel);

    // Name under the baseline
    noStroke();
    fill('black');
    textAlign(CENTER, TOP);
    textSize(13);
    text(b.label, r.x + r.w / 2, r.baseline + 8);

    // Capacity comparison bar - filled only once this battery is selected,
    // matching the spec's staged reveal
    const barY = r.baseline + 26;
    const barW = max(r.w, 30);
    const barX = r.x + r.w / 2 - barW / 2;
    noStroke();
    fill('gainsboro');
    rect(barX, barY, barW, 8, 3);
    if (sel) {
      const mid = (b.capLo + b.capHi) / 2;
      fill('darkorange');
      rect(barX, barY, barW * constrain(mid / maxCap, 0.03, 1), 8, 3);
    }
  }

  if (showCells) drawExplodedCells();
}

function drawBatteryBody(b, r, body, sel) {
  stroke(sel ? 'darkorange' : 'gray');
  strokeWeight(sel ? 2 : 1);

  if (b.key === 'coin') {
    fill(body);
    circle(r.x + r.w / 2, r.y + r.h / 2, r.w);
    noStroke();
    fill('dimgray');
    textAlign(CENTER, CENTER);
    textSize(10);
    text('3V', r.x + r.w / 2, r.y + r.h / 2);
  } else if (b.key === 'lipo') {
    fill(body);
    rect(r.x, r.y, r.w, r.h, 4);
    noStroke();
    fill('gray');
    rect(r.x + 8, r.y - 5, 10, 6, 2);
    rect(r.x + r.w - 18, r.y - 5, 10, 6, 2);
  } else if (b.key === '9v') {
    fill(body);
    rect(r.x, r.y, r.w, r.h, 3);
    // Snap terminals on top
    noStroke();
    fill('darkgray');
    circle(r.x + r.w * 0.32, r.y - 4, 11);
    circle(r.x + r.w * 0.68, r.y - 4, 9);

    // "cells inside" toggle
    cellsToggleBox = { x: r.x, y: r.baseline + 40, w: max(r.w, 74), h: 20 };
    noStroke();
    fill(showCells ? 'darkorange' : 'steelblue');
    textAlign(CENTER, TOP);
    textSize(11);
    text(showCells ? 'hide cells' : 'cells inside', cellsToggleBox.x + cellsToggleBox.w / 2, cellsToggleBox.y);
  } else {
    // Cylindrical cells: AAA, AA, D
    fill(body);
    rect(r.x, r.y, r.w, r.h, 3);
    noStroke();
    fill('darkgray');
    rect(r.x + r.w * 0.3, r.y - 4, r.w * 0.4, 5, 2);
    // A band near the base so the cells read as batteries
    fill(255, 255, 255, 160);
    rect(r.x, r.y + r.h - 12, r.w, 6);
  }
}

// Exploded view: six 1.5 V cells in series inside the 9V block, tying back to
// the series-circuit rule from Chapter 4.
function drawExplodedCells() {
  const r = boxes['9v'];
  const cx = r.x + r.w / 2;
  const topY = r.y - 96;

  fill(255, 255, 255, 245);
  stroke('darkorange');
  strokeWeight(2);
  const bw = 156, bh = 86;
  const bx = constrain(cx - bw / 2, 4, canvasWidth - bw - 4);
  rect(bx, topY, bw, bh, 8);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(12);
  text('six 1.5 V cells in series', bx + bw / 2, topY + 6);

  // Six little cells wired end to end
  const n = 6;
  const cw = 16, ch = 26;
  const gap = 6;
  const startX = bx + (bw - (n * cw + (n - 1) * gap)) / 2;
  const cy = topY + 30;
  for (let i = 0; i < n; i++) {
    const x = startX + i * (cw + gap);
    fill('lightsteelblue');
    stroke('gray');
    strokeWeight(1);
    rect(x, cy, cw, ch, 2);
    if (i < n - 1) {
      stroke('dimgray');
      strokeWeight(2);
      line(x + cw, cy + ch / 2, x + cw + gap, cy + ch / 2);
    }
  }

  noStroke();
  fill('darkorange');
  textAlign(CENTER, TOP);
  textSize(13);
  text('1.5 V × 6 = 9 V', bx + bw / 2, cy + ch + 6);
}

// ---------------------------------------------------------------------------
// Infobox
// ---------------------------------------------------------------------------

function drawInfoPanel() {
  fill(255, 255, 255, 235);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 14;

  noStroke();
  textAlign(LEFT, TOP);

  if (!selected) {
    fill('dimgray');
    textSize(defaultTextSize);
    text('Click a battery to see its specs.', padX, ty, innerW);
    return;
  }

  const b = BATTERIES.find(x => x.key === selected);
  const mid = (b.capLo + b.capHi) / 2;
  const hours = mid / loadMa;

  fill('black');
  textSize(18);
  text(b.label, padX, ty, innerW);
  ty += 26;

  fill(b.chem === 'lithium' ? 'chocolate' : 'steelblue');
  textSize(14);
  text(b.chem, padX, ty);
  ty += 24;

  fill('black');
  textSize(defaultTextSize);
  text('Nominal voltage: ' + nf(b.volts, 1, 1) + ' V', padX, ty, innerW);
  ty += 24;
  text('Capacity: ' + b.capLo + '–' + b.capHi + ' mAh', padX, ty, innerW);
  ty += 24;

  fill('dimgray');
  textSize(14);
  text('Common use: ' + b.use, padX, ty, innerW);
  ty += 44;

  // Live battery-life estimate
  fill('black');
  textSize(defaultTextSize);
  text('At ' + loadMa + ' mA:', padX, ty);
  ty += 22;
  fill('darkorange');
  textSize(18);
  text(formatHours(hours), padX, ty);
  ty += 26;
  fill('gray');
  textSize(12);
  text('(using the ' + mid + ' mAh midpoint)', padX, ty, innerW);
}

function formatHours(h) {
  if (h >= 48) return nf(h / 24, 1, 1) + ' days';
  if (h >= 1)  return nf(h, 1, 1) + ' hours';
  return nf(h * 60, 1, 0) + ' minutes';
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Load Current: ' + loadMa + ' mA', 10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0 || mouseY > drawHeight) return;

  // The 9V "cells inside" toggle takes priority over the battery hit box
  if (cellsToggleBox && inBox(cellsToggleBox, mouseX, mouseY)) {
    showCells = !showCells;
    selected = '9v';
    return;
  }

  for (const b of BATTERIES) {
    const r = boxes[b.key];
    // Include the label and capacity bar in the clickable area
    const hit = { x: r.x - 6, y: r.y - 6, w: r.w + 12, h: r.h + 40 };
    if (inBox(hit, mouseX, mouseY)) {
      selected = b.key;
      return;
    }
  }
}

function inBox(b, px, py) {
  return b && px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}

function resetView() {
  selected = null;
  showCells = false;
  loadSlider.value(40);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  loadSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
