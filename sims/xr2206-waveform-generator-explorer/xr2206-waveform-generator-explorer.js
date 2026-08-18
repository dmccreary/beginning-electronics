// XR2206 Waveform Generator Explorer
// CANVAS_HEIGHT: 540
// Bloom Level: Apply (L3) - Verb: demonstrate, examine
// Learning objective: Given a rendered XR2206 signal generator kit with a
// jumper-selectable waveform, a frequency slider (1 Hz – 1 MHz, log scale) and
// an amplitude slider, select each waveform type and adjust both sliders,
// observing how the live scope trace's shape, speed and height change together.
//
// The scope's time axis auto-scales to always show about three cycles. Without
// that, a 1 Hz wave would sit as a flat line and a 1 MHz wave as a solid block
// - the shape would be invisible at both ends of the range, which is exactly
// what the sim is meant to show.
//
// The waveform is chosen with a physical jumper cap on the real kit, so the
// selector names which jumper a student would actually move.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 425;
let controlHeight = 115;     // 3 rows x 35 + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 16;
let sliderLeftMargin = 220;
let defaultTextSize = 16;

// ---- Controls ----
let waveSelect, freqSlider, ampSlider;

// ---- State ----
let wave = 'Sine';
let freq = 1000;
let amp = 2.0;
let phase = 0;
let mouseOverCanvas = false;
let plot = {};

// Which jumper a student moves on the real board for each shape.
const JUMPERS = {
  Sine:     { j: 'J1 fitted (SIN/TRI terminal)', max: 3.0,
              note: 'A jumper cap on J1 rounds the triangle into a sine. Take it off and you get the triangle back.' },
  Triangle: { j: 'J2 fitted (SIN/TRI terminal)', max: 3.0,
              note: 'With J2 fitted instead, the shaping circuit is bypassed and the raw triangle comes through.' },
  Square:   { j: 'no jumper — use the SQU terminal', max: 5.0,
              note: 'The square output has its own terminal and is always live, whatever the jumper is doing.' }
};

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

  waveSelect = createSelect();
  waveSelect.position(120, drawHeight + 8);
  for (const k in JUMPERS) waveSelect.option(k);
  waveSelect.selected('Sine');
  waveSelect.changed(() => {
    wave = waveSelect.value();
    ampSlider.elt.max = JUMPERS[wave].max;
    if (amp > JUMPERS[wave].max) ampSlider.value(JUMPERS[wave].max);
  });

  // Log scale: slider 0..100 maps onto 1 Hz .. 1 MHz
  freqSlider = createSlider(0, 100, 50, 1);
  freqSlider.position(sliderLeftMargin, drawHeight + 8 + 35);
  freqSlider.size(canvasWidth - sliderLeftMargin - margin);

  ampSlider = createSlider(0, 3, amp, 0.1);
  ampSlider.position(sliderLeftMargin, drawHeight + 8 + 70);
  ampSlider.size(canvasWidth - sliderLeftMargin - margin);

  describe('A rendered XR2206 signal generator kit beside an oscilloscope-style ' +
           'plot. A selector switches between sine, square and triangle and ' +
           'names the jumper a student would move on the real board. Frequency ' +
           'and amplitude sliders change the trace speed and height live, and ' +
           'the time axis auto-scales so the shape stays visible across the ' +
           'whole 1 Hz to 1 MHz range.', LABEL);
}

function sliderToHz(v) {
  return pow(10, (v / 100) * 6);   // 1 .. 1,000,000
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

  freq = sliderToHz(freqSlider.value());
  amp = ampSlider.value();

  if (mouseOverCanvas) phase += 0.03;

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('XR2206 Waveform Generator', canvasWidth / 2, 6);

  const stacked = canvasWidth < 720;
  let kitW;
  if (stacked) {
    kitW = canvasWidth;
    plot = { x: margin + 34, y: drawHeight * 0.52, w: canvasWidth - margin * 2 - 40,
             h: drawHeight * 0.36 };
  } else {
    kitW = canvasWidth * 0.42;
    plot = { x: kitW + 44, y: 46, w: canvasWidth - kitW - 44 - margin, h: drawHeight - 132 };
  }

  drawKit(kitW, stacked);
  drawScope();
  drawReadout();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The kit board
// ---------------------------------------------------------------------------

function drawKit(areaW, stacked) {
  const bx = margin, by = 40;
  const bw = areaW - margin * 2, bh = stacked ? drawHeight * 0.40 : drawHeight - 100;

  noStroke();
  fill('#1E6B3A');
  rect(bx, by, bw, bh, 6);
  fill('#2C7D48');
  rect(bx + 5, by + 5, bw - 10, bh - 10, 4);

  // IC socket
  const icX = bx + bw * 0.5, icY = by + bh * 0.30;
  fill('#1A2027');
  rect(icX - 34, icY - 16, 68, 32, 3);
  fill('#C6CDD5');
  textAlign(CENTER, CENTER);
  textSize(11);
  text('XR2206', icX, icY);
  fill('#8B939B');
  for (let i = 0; i < 8; i++) {
    rect(icX - 30 + i * 8, icY - 22, 4, 6, 1);
    rect(icX - 30 + i * 8, icY + 16, 4, 6, 1);
  }

  // Jumper block J1 / J2 — the cap sits on whichever the waveform needs
  const jx = bx + bw * 0.22, jy = by + bh * 0.60;
  noStroke();
  fill('#22282E');
  rect(jx - 22, jy - 12, 44, 24, 3);
  for (let i = 0; i < 2; i++) {
    const px = jx - 10 + i * 20;
    fill('#D4AF37');
    rect(px - 3, jy - 8, 6, 16, 1);
    fill('white');
    textAlign(CENTER, TOP);
    textSize(9);
    text('J' + (i + 1), px, jy + 14);
  }
  // the cap
  if (wave !== 'Square') {
    const capX = jx + (wave === 'Sine' ? -10 : 10);
    noStroke();
    fill('#2D5FA8');
    rect(capX - 6, jy - 11, 12, 22, 2);
  }

  // output terminals
  drawTerminal(bx + bw * 0.5, by + bh * 0.62, 'SIN/TRI', wave !== 'Square');
  drawTerminal(bx + bw * 0.78, by + bh * 0.62, 'SQU', wave === 'Square');

  // pots
  drawPot(bx + bw * 0.22, by + bh * 0.86, 'AMP', map(amp, 0, 3, -0.7, 0.7));
  drawPot(bx + bw * 0.5, by + bh * 0.86, 'COARSE', map(freqSlider.value(), 0, 100, -0.7, 0.7));
  drawPot(bx + bw * 0.78, by + bh * 0.86, 'FINE', 0.1);

  noStroke();
  fill('white');
  textAlign(LEFT, TOP);
  textSize(10);
  text('XR2206 function generator kit', bx + 10, by + 8);
}

function drawTerminal(x, y, label, live) {
  noStroke();
  fill(live ? '#2D5FA8' : '#4A5259');
  rect(x - 18, y - 10, 36, 20, 3);
  fill(live ? '#F5F7F9' : '#9AA3AB');
  circle(x - 8, y, 7);
  circle(x + 8, y, 7);
  noStroke();
  fill('white');
  textAlign(CENTER, TOP);
  textSize(9);
  text(label, x, y + 12);
}

function drawPot(x, y, label, ang) {
  noStroke();
  fill('#2D5FA8');
  rect(x - 15, y - 15, 30, 30, 3);
  fill('#D8DDE2');
  circle(x, y, 20);
  stroke('#3A4650');
  strokeWeight(3);
  line(x - cos(ang) * 8, y - sin(ang) * 8, x + cos(ang) * 8, y + sin(ang) * 8);
  noStroke();
  fill('white');
  textAlign(CENTER, TOP);
  textSize(9);
  text(label, x, y + 16);
}

// ---------------------------------------------------------------------------
// The scope
// ---------------------------------------------------------------------------

function drawScope() {
  // graticule
  noStroke();
  fill('#10201A');
  rect(plot.x, plot.y, plot.w, plot.h, 4);
  stroke(70, 140, 100, 90);
  strokeWeight(1);
  for (let i = 1; i < 6; i++) {
    line(plot.x + (i / 6) * plot.w, plot.y, plot.x + (i / 6) * plot.w, plot.y + plot.h);
  }
  for (let i = 1; i < 4; i++) {
    line(plot.x, plot.y + (i / 4) * plot.h, plot.x + plot.w, plot.y + (i / 4) * plot.h);
  }
  stroke(70, 140, 100, 160);
  line(plot.x, plot.y + plot.h / 2, plot.x + plot.w, plot.y + plot.h / 2);

  // The trace. Three cycles are always drawn, whatever the frequency, so the
  // shape stays readable; the time axis label carries the real scale.
  const cycles = 3;
  const maxAmp = JUMPERS[wave].max;
  const half = (plot.h / 2 - 8) * (amp / maxAmp);

  stroke('#6FE39B');
  strokeWeight(2.5);
  noFill();
  beginShape();
  const steps = 400;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = (t * cycles + phase) % 1;    // position within one cycle
    let v;
    if (wave === 'Sine') v = sin(u * TWO_PI);
    else if (wave === 'Square') v = u < 0.5 ? 1 : -1;
    else v = u < 0.5 ? (4 * u - 1) : (3 - 4 * u);   // triangle
    vertex(plot.x + t * plot.w, plot.y + plot.h / 2 - v * half);
  }
  endShape();

  // axis labels
  noStroke();
  fill('#8FBFA4');
  textAlign(LEFT, TOP);
  textSize(11);
  text(formatTime(cycles / freq) + ' across the screen', plot.x + 6, plot.y + plot.h - 18);
  textAlign(RIGHT, TOP);
  text(nf(amp, 1, 1) + ' V peak', plot.x + plot.w - 6, plot.y + 6);
}

function formatTime(s) {
  if (s >= 1) return nf(s, 1, 2) + ' s';
  if (s >= 1e-3) return nf(s * 1e3, 1, 2) + ' ms';
  return nf(s * 1e6, 1, 1) + ' µs';
}

function formatHz(v) {
  if (v >= 1e6) return nf(v / 1e6, 1, 2) + ' MHz';
  if (v >= 1e3) return nf(v / 1e3, 1, 2) + ' kHz';
  return nf(v, 1, 1) + ' Hz';
}

function drawReadout() {
  const x = plot.x, y = plot.y + plot.h + 10;
  const w = plot.w;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, 62, 8);

  noStroke();
  textAlign(LEFT, TOP);
  fill('black');
  textSize(15);
  text(wave + '   ·   ' + formatHz(freq) + '   ·   ' + nf(amp, 1, 1) + ' V peak',
       x + 12, y + 8);

  fill('#B4650F');
  textSize(12);
  text('On the real kit: ' + JUMPERS[wave].j, x + 12, y + 32);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Waveform:', 10, drawHeight + 20);
  text('Frequency: ' + formatHz(freq), 10, drawHeight + 20 + 35);
  text('Amplitude: ' + nf(amp, 1, 1) + ' V', 10, drawHeight + 20 + 70);

  fill('gray');
  textSize(11);
  text(JUMPERS[wave].note, 260, drawHeight + 20, canvasWidth - 280);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these two functions at the end
// ---------------------------------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  const w = canvasWidth - sliderLeftMargin - margin;
  freqSlider.size(w);
  ampSlider.size(w);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
