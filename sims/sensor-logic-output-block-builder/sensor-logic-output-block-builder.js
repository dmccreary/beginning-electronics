// Sensor → Control → Output Block Builder
// CANVAS_HEIGHT: 520
// Bloom Level: Apply (L3) - Verb: construct, arrange, demonstrate, predict
// Learning objective: Given a palette of sensor, control and output blocks,
// arrange one of each into a connected three-stage chain and predict, then
// verify, how the sensor's state propagates through the control stage to
// change the output.
//
// This is the block-diagram thinking students need for their own capstone: at
// this level you do not care what is inside each block, only that the signal
// leaves one and arrives at the next. The sensor slider decides whether the
// sensor's reading actually satisfies the control block's condition — so a
// complete chain can still produce nothing, which is the honest and useful
// case to show.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 80;      // 2 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 210;
let defaultTextSize = 16;

// ---- Controls ----
let runButton, clearButton;
let sensorSlider;

// ---- State ----
let slots = { sensor: null, control: null, output: null };
let dragging = null;         // { key, kind }
let dragXY = { x: 0, y: 0 };
let sensorLevel = 50;        // what the chosen sensor is currently reading
let signal = -1;             // 0..1 while the signal animates, -1 when idle
let message = '';
let slotBoxes = {};
let paletteBoxes = [];
let panel = {};

const BLOCKS = {
  sensor: [
    { key: 'button', name: 'Push button', reads: v => v > 50,
      how: 'reads pressed or not pressed', unit: '' },
    { key: 'ldr', name: 'Photoresistor', reads: v => v < 40,
      how: 'passes when it gets dark', unit: '% light' },
    { key: 'pot', name: 'Potentiometer', reads: v => v > 60,
      how: 'passes above about 60%', unit: '% turned' }
  ],
  control: [
    { key: 'transistor', name: 'Transistor switch',
      how: 'passes the signal straight through, amplified' },
    { key: 'timer', name: '555 timer',
      how: 'turns the signal into a repeating pulse' },
    { key: 'shift', name: 'Shift register',
      how: 'fans one signal out to several outputs' }
  ],
  output: [
    { key: 'led', name: 'LED', how: 'lights up' },
    { key: 'motor', name: 'Motor', how: 'spins' },
    { key: 'buzzer', name: 'Buzzer', how: 'sounds' }
  ]
};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  runButton = createButton('Run Signal');
  runButton.position(10, drawHeight + 10);
  runButton.mousePressed(runSignal);

  clearButton = createButton('Clear');
  clearButton.position(110, drawHeight + 10);
  clearButton.mousePressed(() => {
    slots = { sensor: null, control: null, output: null };
    signal = -1; message = '';
  });

  sensorSlider = createSlider(0, 100, sensorLevel, 1);
  sensorSlider.position(sliderLeftMargin, drawHeight + 45);
  sensorSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('Three empty slots labelled sensor, control and output, connected ' +
           'by wire segments, with a palette of nine draggable blocks below. ' +
           'Filling all three slots enables a Run Signal button that animates a ' +
           'dot travelling along the chain, and the output activates only if ' +
           'the sensor reading satisfies the control condition.', LABEL);
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

  sensorLevel = sensorSlider.value();

  if (signal >= 0) {
    signal += 0.012;
    if (signal > 1) signal = -1;
  }

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Sensor → Control → Output', canvasWidth / 2, 6);

  const complete = slots.sensor && slots.control && slots.output;
  const passes = complete ? slots.sensor.reads(sensorLevel) : false;
  const active = complete && passes && signal >= 0.66;

  drawChain(complete, passes, active);
  drawPalette();
  drawPanel(complete, passes);
  if (dragging) drawDragGhost();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The three-slot chain
// ---------------------------------------------------------------------------

function drawChain(complete, passes, active) {
  const y = 44, h = 92;
  const gap = 40;
  const w = (canvasWidth - 2 * margin - gap * 2) / 3;
  const names = ['sensor', 'control', 'output'];
  const labels = ['SENSOR', 'CONTROL', 'OUTPUT'];

  slotBoxes = {};
  for (let i = 0; i < 3; i++) {
    const x = margin + i * (w + gap);
    const key = names[i];
    slotBoxes[key] = { x: x, y: y, w: w, h: h };
    const filled = slots[key];

    // slot
    fill(filled ? 'white' : '#F2F5F7');
    stroke(filled ? '#2878A8' : '#B6BDC4');
    strokeWeight(filled ? 2 : 1);
    if (!filled) drawingContext.setLineDash([6, 5]);
    rect(x, y, w, h, 8);
    drawingContext.setLineDash([]);

    noStroke();
    fill('gray');
    textAlign(CENTER, TOP);
    textSize(10);
    text(labels[i], x, y + 6, w);

    if (filled) {
      drawBlockGlyph(filled.key, x + w / 2, y + h / 2 - 4,
                     key === 'output' && active);
      noStroke();
      fill('black');
      textAlign(CENTER, TOP);
      textSize(12);
      text(filled.name, x + 4, y + h - 24, w - 8);
    } else {
      noStroke();
      fill('#B6BDC4');
      textAlign(CENTER, CENTER);
      textSize(12);
      text('drag a block here', x + w / 2, y + h / 2);
    }

    // wire to the next slot
    if (i < 2) {
      const wx = x + w, wy = y + h / 2;
      stroke(complete ? (passes ? 'crimson' : '#C3C9CF') : '#D8DDE2');
      strokeWeight(3);
      line(wx, wy, wx + gap, wy);
      noStroke();
      fill(complete ? (passes ? 'crimson' : '#C3C9CF') : '#D8DDE2');
      triangle(wx + gap, wy, wx + gap - 7, wy - 5, wx + gap - 7, wy + 5);
    }
  }

  // the travelling signal dot
  if (signal >= 0 && complete) {
    const t = signal;
    const total = canvasWidth - 2 * margin;
    const px = margin + t * total;
    noStroke();
    fill(passes ? 'crimson' : '#9AA3AB');
    circle(px, y + h / 2, 14);
  }
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

function drawPalette() {
  const top = 156;
  const rowH = 84;
  const kinds = ['sensor', 'control', 'output'];

  paletteBoxes = [];
  for (let r = 0; r < 3; r++) {
    const kind = kinds[r];
    const y = top + r * rowH;

    noStroke();
    fill('gray');
    textAlign(LEFT, TOP);
    textSize(11);
    text(kind.toUpperCase() + ' BLOCKS', margin, y);

    const list = BLOCKS[kind];
    const bw = min(150, (canvasWidth - 2 * margin - 20) / 3);
    for (let i = 0; i < list.length; i++) {
      const x = margin + i * (bw + 10);
      const by = y + 16;
      const box = { x: x, y: by, w: bw, h: 50, kind: kind, block: list[i] };
      paletteBoxes.push(box);

      const used = slots[kind] && slots[kind].key === list[i].key;
      fill(used ? '#EAF2F8' : 'white');
      stroke(used ? '#2878A8' : 'silver');
      strokeWeight(used ? 2 : 1);
      rect(x, by, bw, 50, 6);

      drawBlockGlyph(list[i].key, x + 22, by + 25, false);

      noStroke();
      fill(used ? '#2878A8' : 'black');
      textAlign(LEFT, CENTER);
      textSize(11);
      text(list[i].name, x + 40, by + 25, bw - 46);
    }
  }
}

function drawBlockGlyph(key, x, y, active) {
  push();
  translate(x, y);
  noStroke();
  if (key === 'button') {
    fill('gainsboro'); rect(-12, -9, 24, 18, 3);
    fill('darkslategray'); circle(0, 0, 11);
  } else if (key === 'ldr') {
    fill('lightgoldenrodyellow'); circle(0, 0, 20);
    stroke('saddlebrown'); strokeWeight(2); noFill();
    beginShape(); vertex(-7, -3); vertex(-2, 3); vertex(2, -3); vertex(7, 3); endShape();
  } else if (key === 'pot') {
    fill('gainsboro'); circle(0, 0, 20);
    stroke('dimgray'); strokeWeight(3); line(0, 0, 6, -7);
  } else if (key === 'transistor') {
    fill('#2E2E2E'); arc(0, 0, 22, 22, PI, TWO_PI); rect(-11, 0, 22, 5);
  } else if (key === 'timer') {
    fill('#1A2027'); rect(-13, -8, 26, 16, 2);
    fill('#C6CDD5'); textAlign(CENTER, CENTER); textSize(8); text('555', 0, 0);
  } else if (key === 'shift') {
    fill('#1A2027'); rect(-15, -7, 30, 14, 2);
    fill('#C6CDD5'); textAlign(CENTER, CENTER); textSize(7); text('595', 0, 0);
  } else if (key === 'led') {
    if (active) { fill(255, 200, 60, 130); circle(0, 0, 30); }
    fill(active ? 'gold' : '#D8DDE2');
    arc(0, 2, 17, 20, PI, TWO_PI); rect(-8.5, 2, 17, 5);
  } else if (key === 'motor') {
    fill('#8A939B'); rect(-12, -10, 24, 20, 3);
    push(); if (active) rotate(frameCount * 0.3);
    fill(active ? '#F0F0F0' : '#B8BEC4');
    for (let i = 0; i < 3; i++) { rotate(TWO_PI / 3); ellipse(0, -6, 5, 12); }
    pop();
  } else {
    fill(active ? '#2E3742' : '#4A525B'); circle(0, 0, 22);
    fill('#1A2027'); circle(0, 0, 15);
    if (active) {
      noFill(); stroke(70, 130, 180, 160); strokeWeight(2);
      circle(0, 0, 28 + (frameCount % 20));
    }
  }
  pop();
}

function drawDragGhost() {
  const b = dragging.block;
  noStroke();
  fill(0, 0, 0, 30);
  rect(dragXY.x - 60, dragXY.y - 22, 124, 46, 6);
  fill('lightyellow');
  stroke('#E8710A');
  strokeWeight(2);
  rect(dragXY.x - 62, dragXY.y - 24, 124, 46, 6);
  drawBlockGlyph(b.key, dragXY.x - 40, dragXY.y - 1, false);
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(11);
  text(b.name, dragXY.x - 22, dragXY.y - 1, 80);
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function drawPanel(complete, passes) {
  const x = margin, y = drawHeight - 74, w = canvasWidth - 2 * margin;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, 64, 8);

  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);

  if (message) {
    fill(passes ? 'darkgreen' : 'sienna');
    text(message, x + 12, y + 10, w - 24);
    return;
  }
  if (!complete) {
    fill('dimgray');
    text('Drag one block into each slot — sensor, control, output — then press ' +
         'Run Signal.', x + 12, y + 10, w - 24);
    return;
  }

  fill('black');
  text(slots.sensor.name + ' ' + slots.sensor.how + '. It feeds the ' +
       slots.control.name + ', which ' + slots.control.how + ', and that drives ' +
       'the ' + slots.output.name + ', which ' + slots.output.how + '.',
       x + 12, y + 10, w - 24);
  fill(passes ? 'darkgreen' : 'sienna');
  text(passes
    ? 'At the current sensor reading the condition is met — press Run Signal.'
    : 'At the current sensor reading the condition is NOT met, so the signal ' +
      'will stop at the control block. Move the sensor slider.',
    x + 12, y + 34, w - 24);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  const unit = slots.sensor ? slots.sensor.unit : '';
  text('Sensor reading: ' + sensorLevel + (unit ? ' ' + unit : '%'),
       10, drawHeight + 55);
}

// ---------------------------------------------------------------------------
// Interaction - drag from palette into a slot
// ---------------------------------------------------------------------------

function mousePressed() {
  for (const p of paletteBoxes) {
    if (mouseX >= p.x && mouseX <= p.x + p.w && mouseY >= p.y && mouseY <= p.y + p.h) {
      dragging = { kind: p.kind, block: p.block };
      dragXY = { x: mouseX, y: mouseY };
      return;
    }
  }
}

function mouseDragged() {
  if (dragging) dragXY = { x: mouseX, y: mouseY };
}

function mouseReleased() {
  if (!dragging) return;
  const b = slotBoxes[dragging.kind];
  // A block only drops into the slot of its own kind - a sensor cannot be an
  // output, and saying so is more use than silently refusing.
  if (b && mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
    slots[dragging.kind] = dragging.block;
    message = '';
    signal = -1;
  } else {
    let onWrong = null;
    for (const k in slotBoxes) {
      const s = slotBoxes[k];
      if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) onWrong = k;
    }
    if (onWrong) {
      message = dragging.block.name + ' is a ' + dragging.kind + ' block, so it ' +
                'belongs in the ' + dragging.kind + ' slot — not the ' + onWrong +
                ' slot. Every chain needs one of each, in order.';
    }
  }
  dragging = null;
}

function runSignal() {
  if (!(slots.sensor && slots.control && slots.output)) {
    message = 'Fill all three slots first — a chain needs a sensor, something ' +
              'to control with, and something to drive.';
    return;
  }
  message = '';
  signal = 0;
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  sensorSlider.size(canvasWidth - sliderLeftMargin - margin);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
