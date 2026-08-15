// Relay Basics Explorer
// CANVAS_HEIGHT: 500
// Bloom Level: Apply (L3) - Verb: demonstrate, predict
// Learning objective: Given a control-side switch driving a relay's coil,
// predict and observe how energizing the coil pulls the armature to close a
// separate load-side circuit, and explain why the two sides stay electrically
// isolated.
//
// The whole point of a relay is the thing you cannot see in a schematic: the
// two circuits never touch. The coil moves the armature MAGNETICALLY, across
// an air gap. So the load side can run a different voltage, a different
// supply, even mains - and a fault on one side does not travel to the other.
//
// This is drawn as two schematic halves rather than on a breadboard, because
// the isolation gap between them is the subject.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let defaultTextSize = 16;

// ---- Controls ----
let switchButton, resetButton;

// ---- State ----
let energized = false;
let armature = 0;            // 0 = open (spring), 1 = closed (pulled down)
let flowPhase = 0;
let fieldPhase = 0;
let mouseOverCanvas = false;
let hoverPart = null;
let spots = {};
let panel = {};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);
  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  switchButton = createButton('Control Switch: OFF');
  switchButton.position(10, drawHeight + 10);
  switchButton.mousePressed(() => {
    energized = !energized;
    switchButton.html('Control Switch: ' + (energized ? 'ON' : 'OFF'));
  });

  resetButton = createButton('Reset');
  resetButton.position(170, drawHeight + 10);
  resetButton.mousePressed(() => {
    energized = false;
    switchButton.html('Control Switch: OFF');
  });

  describe('Two separate circuits drawn side by side and joined only by a ' +
           'dashed no-connection line: a control side with a battery, switch ' +
           'and relay coil, and a load side with its own battery, contacts and ' +
           'lamp. Switching the control side on energizes the coil, pulls the ' +
           'armature down, closes the contacts and lights the lamp.', LABEL);
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

  // The armature moves with a little travel time, so the mechanical action
  // reads as movement rather than an instant state change.
  const target = energized ? 1 : 0;
  armature += (target - armature) * 0.25;
  if (mouseOverCanvas) {
    flowPhase += 0.02;
    if (energized) fieldPhase += 0.04;
  }

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('How a Relay Works', canvasWidth / 2, 6);

  const stacked = canvasWidth < 700;
  let diagW;
  if (stacked) {
    diagW = canvasWidth;
    panel = { x: margin, y: drawHeight * 0.62, w: canvasWidth - 2 * margin,
              h: drawHeight * 0.36 };
  } else {
    diagW = canvasWidth * 0.62;
    panel = { x: diagW + 10, y: 34, w: canvasWidth - diagW - 10 - margin, h: drawHeight - 48 };
  }

  drawRelay(diagW, stacked);
  drawPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The two halves
// ---------------------------------------------------------------------------

function drawRelay(areaW, stacked) {
  const top = 40;
  const h = stacked ? drawHeight * 0.58 - top : drawHeight - top - 20;
  const midX = areaW / 2;

  // ---- Control side (left) ----
  const cl = margin, cr = midX - 26;
  const cTop = top + 20, cBot = top + h - 40;

  stroke(energized ? '#2878A8' : '#C3C9CF');
  strokeWeight(3);
  noFill();
  line(cl, cTop, cr, cTop);
  line(cl, cTop, cl, cBot);
  line(cl, cBot, cr, cBot);

  // control battery
  drawBattery(cl, (cTop + cBot) / 2, energized ? '#2878A8' : '#C3C9CF');

  // control switch
  drawSwitch((cl + cr) / 2, cTop, energized);

  // the coil
  drawCoil(cr, (cTop + cBot) / 2, energized);
  stroke(energized ? '#2878A8' : '#C3C9CF');
  strokeWeight(3);
  line(cr, cTop, cr, (cTop + cBot) / 2 - 30);
  line(cr, (cTop + cBot) / 2 + 30, cr, cBot);

  if (energized) {
    drawFlow([[cl, cTop, cr, cTop], [cr, cTop, cr, cBot],
              [cr, cBot, cl, cBot], [cl, cBot, cl, cTop]], 6, '#2878A8');
  }

  noStroke();
  fill('#2878A8');
  textAlign(LEFT, TOP);
  textSize(13);
  text('CONTROL SIDE — low voltage', cl, top - 6);

  // ---- The isolation gap ----
  stroke('#9AA3AB');
  strokeWeight(2);
  drawingContext.setLineDash([7, 6]);
  line(midX, top - 2, midX, top + h);
  drawingContext.setLineDash([]);
  spots.gap = { x: midX - 16, y: top, w: 32, h: h };

  noStroke();
  fill(hoverPart === 'gap' ? '#E8710A' : '#6E7A86');
  textAlign(CENTER, TOP);
  textSize(11);
  push();
  translate(midX, top + h / 2);
  rotate(-HALF_PI);
  text('no electrical connection', 0, -14);
  pop();

  // ---- Load side (right) ----
  const ll = midX + 26, lr = areaW - margin;
  const lTop = top + 44, lBot = top + h - 40;   // extra headroom for the armature
  const closed = armature > 0.6;

  stroke(closed ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  noFill();
  line(ll, lBot, lr, lBot);
  line(lr, lTop, lr, lBot);

  drawBattery(lr, (lTop + lBot) / 2, closed ? 'crimson' : '#C3C9CF');
  drawLamp((ll + lr) / 2, lBot, closed);

  // the contacts and the armature the coil pulls
  drawArmature(ll, lTop, closed);
  stroke(closed ? 'crimson' : '#C3C9CF');
  strokeWeight(3);
  line(ll, lTop, ll, lBot);
  line(ll + 46, lTop, lr, lTop);

  if (closed) {
    drawFlow([[ll, lTop, lr, lTop], [lr, lTop, lr, lBot],
              [lr, lBot, ll, lBot], [ll, lBot, ll, lTop]], 6, 'crimson');
  }

  noStroke();
  fill('crimson');
  textAlign(LEFT, TOP);
  textSize(13);
  text('LOAD SIDE — its own supply', ll, top - 6);

  // hover hit-testing
  hoverPart = null;
  for (const k in spots) {
    const s = spots[k];
    if (mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h) hoverPart = k;
  }
}

// The coil, with field lines that appear only while it is energized.
function drawCoil(x, y, on) {
  if (on) {
    noFill();
    for (let i = 0; i < 3; i++) {
      const r = 34 + ((fieldPhase * 30 + i * 14) % 42);
      stroke(40, 120, 200, map(r, 34, 76, 170, 0));
      strokeWeight(2);
      circle(x, y, r * 2);
    }
  }

  stroke(on ? '#2878A8' : '#8B95A0');
  strokeWeight(3);
  noFill();
  for (let i = 0; i < 4; i++) arc(x, y - 22 + i * 15, 20, 15, -HALF_PI, HALF_PI);

  noStroke();
  fill(on ? '#2878A8' : 'gray');
  textAlign(RIGHT, CENTER);
  textSize(11);
  text('coil', x - 16, y);

  spots.coil = { x: x - 18, y: y - 32, w: 36, h: 64 };
  if (hoverPart === 'coil') {
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(spots.coil.x, spots.coil.y, 36, 64, 4);
  }
}

// The armature: a pivoted arm the magnet pulls down onto the contacts.
function drawArmature(x, y, closed) {
  const lift = 22 * (1 - armature);

  // fixed contact
  noStroke();
  fill(closed ? 'crimson' : '#8B95A0');
  circle(x + 46, y, 9);

  // the moving arm, pivoting from the left
  stroke(closed ? 'crimson' : '#5F6B77');
  strokeWeight(4);
  line(x, y - lift * 0.2, x + 46, y - lift);

  // the spring that pulls it back open
  stroke('#9AA3AB');
  strokeWeight(2);
  const sx = x + 30;
  beginShape();
  noFill();
  for (let i = 0; i <= 5; i++) {
    vertex(sx + (i % 2 === 0 ? -5 : 5), y - lift - 8 - i * 3);
  }
  endShape();

  noStroke();
  fill(closed ? 'crimson' : 'gray');
  textAlign(LEFT, TOP);
  textSize(11);
  text('armature — ' + (closed ? 'contacts closed' : 'contacts open'), x + 2, y + 10);

  spots.armature = { x: x, y: y - 44, w: 54, h: 56 };
  spots.contacts = { x: x + 34, y: y - 12, w: 28, h: 24 };
  if (hoverPart === 'armature' || hoverPart === 'contacts') {
    const s = spots[hoverPart];
    noFill();
    stroke('#E8710A');
    strokeWeight(2);
    rect(s.x, s.y, s.w, s.h, 4);
  }
}

function drawBattery(x, y, col) {
  stroke(col);
  strokeWeight(4);
  line(x - 16, y - 8, x + 16, y - 8);
  strokeWeight(4);
  line(x - 8, y + 8, x + 8, y + 8);
}

function drawSwitch(x, y, closed) {
  noStroke();
  fill(closed ? 'darkorange' : 'gainsboro');
  rect(x - 15, y - 11, 30, 22, 4);
  fill(closed ? 'saddlebrown' : 'darkslategray');
  circle(x, y, 12);
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(10);
  text('switch', x, y + 14);
}

function drawLamp(x, y, lit) {
  noStroke();
  if (lit) {
    fill(255, 210, 80, 110);
    circle(x, y, 46);
  }
  fill(lit ? 'gold' : '#D8DDE2');
  circle(x, y, 24);
  stroke(lit ? 'goldenrod' : '#9AA3AB');
  strokeWeight(2);
  noFill();
  line(x - 8, y - 8, x + 8, y + 8);
  line(x + 8, y - 8, x - 8, y + 8);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(11);
  text('lamp', x, y + 16);
}

function drawFlow(legs, size, col) {
  let total = 0;
  for (const l of legs) total += dist(l[0], l[1], l[2], l[3]);
  const dots = max(6, floor(total / 40));
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

function drawPanel() {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 12;
  const innerW = panel.w - 24;
  let ty = panel.y + 12;
  const closed = armature > 0.6;

  noStroke();
  textAlign(LEFT, TOP);

  fill('gray');
  textSize(11);
  text('RELAY STATE', padX, ty);
  ty += 16;
  fill(closed ? 'darkgreen' : 'dimgray');
  textSize(18);
  text(energized ? 'Coil energized — contacts closed' : 'Coil off — contacts open',
       padX, ty, innerW);
  ty += 44;

  fill('black');
  textSize(13);
  if (energized) {
    text('Current through the coil makes it a magnet. It pulls the armature ' +
         'down against the spring, the contacts meet, and the load circuit ' +
         'completes — so the lamp lights from its own supply.', padX, ty, innerW);
  } else {
    text('Coil off — no magnetic pull, so the spring holds the contacts open ' +
         'and the load circuit stays broken.', padX, ty, innerW);
  }
  ty += 76;

  // Hover explanations
  const roles = {
    coil: 'The coil — a few hundred turns of wire. Current through it makes a ' +
          'magnetic field. This is the only thing the control side does.',
    armature: 'The armature — a hinged iron arm. The magnet pulls it down; the ' +
              'spring pulls it back up the moment the coil switches off.',
    contacts: 'The contacts — the actual switch. They are pushed together ' +
              'mechanically, which is why the load side can be a completely ' +
              'different voltage.',
    gap: 'Nothing crosses this line. The coil moves the armature across an air ' +
         'gap, magnetically. That is what electrical isolation means — a fault ' +
         'on one side cannot reach the other.'
  };
  if (hoverPart && roles[hoverPart]) {
    fill('#E8710A');
    textSize(12);
    text(roles[hoverPart], padX, ty, innerW);
    ty += 76;
  }

  fill('gray');
  textSize(12);
  text('A small, safe control current switches a much larger load — and because ' +
       'the link is magnetic rather than electrical, the two circuits never ' +
       'share a wire.', padX, ty, innerW);
}

function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  text('Hover the coil, armature, contacts or the dashed line for an explanation.',
       250, drawHeight + 25);
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
