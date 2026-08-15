// Capstone Project Planning Workflow
// CANVAS_HEIGHT: 500
// Bloom Level: Understand (L2) / Apply (L3) - Verb: explain, interpret, apply
// Learning objective: Given a flowchart of the eight capstone project stages,
// click each stage to reveal what a builder produces there and how it feeds the
// next one, then apply the sequence while planning an original project.
//
// Every stage names its OUTPUT and its INPUT, because the point of showing the
// whole chain at once is that each stage consumes what the previous one made.
// Prototype Iteration is the only one meant to repeat, and it is drawn with a
// loop arrow to say so.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 800;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 18;
let defaultTextSize = 16;

// ---- Controls ----
let walkButton, resetButton;

// ---- State ----
let selected = -1;
let walking = false;
let walkStart = 0;
let hoverBracket = false;
let boxes = [];
let bracketBox = null;
let loopBox = null;
let showLoopInfo = false;
let panel = {};

const STAGES = [
  { name: 'Project Proposal', icon: 'pencil',
    makes: 'a short written statement of what you intend to build and why anyone would want it.',
    from: 'your own idea — this is where the chain starts.' },
  { name: 'Requirements List', icon: 'checklist',
    makes: 'a numbered list of what the finished thing must actually do, specific enough to test against later.',
    from: 'the proposal, turned from a description into checkable statements.' },
  { name: 'Circuit Block Diagram', icon: 'blocks',
    makes: 'a sketch of the major blocks — sensor, control, output — and the signals between them, with no component values yet.',
    from: 'the requirements: each one has to be met by some block on this diagram.' },
  { name: 'Original Circuit Design', icon: 'schematic',
    makes: 'a full schematic with real parts and real values, chosen with the calculations from earlier chapters.',
    from: 'the block diagram, with every block replaced by an actual circuit.' },
  { name: 'Prototype Iteration', icon: 'loop',
    makes: 'a working breadboard build — and a list of the things that turned out wrong the first time.',
    from: 'the schematic. This is the stage that repeats: build, test, change one thing, build again.' },
  { name: 'Project Demonstration', icon: 'spotlight',
    makes: 'a live showing that the requirements list is genuinely met, in front of someone else.',
    from: 'a prototype that has stopped surprising you.' },
  { name: 'Project Documentation', icon: 'folder',
    makes: 'the schematic, the parts list, the photos and the notes on what you would do differently.',
    from: 'everything above — this is where it all gets written down so it survives.' }
];

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));

  textSize(defaultTextSize);

  walkButton = createButton('Walk Me Through It');
  walkButton.position(10, drawHeight + 10);
  walkButton.mousePressed(toggleWalk);

  resetButton = createButton('Reset');
  resetButton.position(160, drawHeight + 10);
  resetButton.mousePressed(() => { selected = -1; walking = false; showLoopInfo = false;
                                   walkButton.html('Walk Me Through It'); });

  describe('A flowchart of the seven capstone project stages under a Capstone ' +
           'Project Planning bracket, connected left to right by arrows. ' +
           'Clicking any stage explains what a builder produces there and what ' +
           'it consumes from the previous stage. Prototype Iteration carries a ' +
           'loop arrow marking it as the stage meant to repeat.', LABEL);
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

  // The guided tour advances on its own clock.
  if (walking && millis() - walkStart > 3000) {
    walkStart = millis();
    selected++;
    if (selected >= STAGES.length) { selected = STAGES.length - 1; toggleWalk(); }
  }

  // Title
  fill('black');
  noStroke();
  textAlign(CENTER, TOP);
  textSize(20);
  text('Capstone Project Planning', canvasWidth / 2, 6);

  panel = { x: margin, y: drawHeight - 152, w: canvasWidth - 2 * margin, h: 142 };

  drawBracket();
  drawFlow();
  drawPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Flowchart
// ---------------------------------------------------------------------------

function drawFlow() {
  // Boxes wrap onto two rows so the labels stay readable at any width.
  const perRow = canvasWidth < 700 ? 2 : 4;
  const rows = ceil(STAGES.length / perRow);
  const gap = 14;
  const bw = (canvasWidth - 2 * margin - gap * (perRow - 1)) / perRow;
  const bh = 66;
  const top = 84;

  boxes = [];
  for (let i = 0; i < STAGES.length; i++) {
    const c = i % perRow, r = floor(i / perRow);
    const x = margin + c * (bw + gap);
    const y = top + r * (bh + 34);
    boxes.push({ x: x, y: y, w: bw, h: bh });

    const sel = selected === i;
    fill(sel ? 'lightyellow' : 'white');
    stroke(sel ? '#E8710A' : 'silver');
    strokeWeight(sel ? 3 : 1);
    rect(x, y, bw, bh, 8);

    drawIcon(STAGES[i].icon, x + 20, y + bh / 2);

    noStroke();
    fill('black');
    textAlign(LEFT, CENTER);
    textSize(12);
    text(STAGES[i].name, x + 38, y + bh / 2, bw - 46);

    // step number
    noStroke();
    fill('gray');
    textAlign(LEFT, TOP);
    textSize(10);
    text(i + 1, x + 5, y + 4);

    // arrow to the next box
    if (i < STAGES.length - 1) {
      const nextSameRow = (c + 1) < perRow;
      stroke('#9AA3AB');
      strokeWeight(2);
      if (nextSameRow) {
        line(x + bw, y + bh / 2, x + bw + gap - 4, y + bh / 2);
        noStroke(); fill('#9AA3AB');
        triangle(x + bw + gap, y + bh / 2, x + bw + gap - 6, y + bh / 2 - 4,
                 x + bw + gap - 6, y + bh / 2 + 4);
      } else {
        // wrap down to the start of the next row
        line(x + bw / 2, y + bh, x + bw / 2, y + bh + 14);
        line(x + bw / 2, y + bh + 14, margin + bw / 2, y + bh + 14);
        line(margin + bw / 2, y + bh + 14, margin + bw / 2, y + bh + 34);
        noStroke(); fill('#9AA3AB');
        triangle(margin + bw / 2, y + bh + 34, margin + bw / 2 - 4, y + bh + 28,
                 margin + bw / 2 + 4, y + bh + 28);
      }
    }

    // the loop arrow on Prototype Iteration
    if (STAGES[i].icon === 'loop') {
      noFill();
      stroke('#E8710A');
      strokeWeight(2);
      arc(x + bw / 2, y, 40, 26, PI, TWO_PI);
      noStroke(); fill('#E8710A');
      triangle(x + bw / 2 + 20, y, x + bw / 2 + 14, y - 5, x + bw / 2 + 14, y + 5);
      loopBox = { x: x + bw / 2 - 24, y: y - 16, w: 48, h: 18 };
    }
  }
}

function drawIcon(kind, x, y) {
  push();
  translate(x, y);
  strokeWeight(2);
  noFill();
  if (kind === 'pencil') {
    stroke('#B4650F'); line(-6, 6, 5, -5);
    noStroke(); fill('#B4650F'); triangle(5, -5, 8, -8, 8, -2);
  } else if (kind === 'checklist') {
    stroke('#2878A8');
    for (let i = -1; i <= 1; i++) { line(-2, i * 6, 7, i * 6); line(-8, i * 6 - 2, -6, i * 6 + 1); line(-6, i * 6 + 1, -3, i * 6 - 3); }
  } else if (kind === 'blocks') {
    stroke('#168779'); noFill();
    rect(-9, -4, 7, 8); rect(2, -4, 7, 8); line(-2, 0, 2, 0);
  } else if (kind === 'schematic') {
    stroke('#6953B8'); line(-9, 0, -4, 0);
    beginShape(); vertex(-4, 0); vertex(-2, -5); vertex(1, 5); vertex(3, -5); vertex(5, 0); endShape();
    line(5, 0, 9, 0);
  } else if (kind === 'loop') {
    stroke('#E8710A'); arc(0, 0, 16, 16, -HALF_PI, PI);
    noStroke(); fill('#E8710A'); triangle(-8, 0, -11, -4, -5, -4);
  } else if (kind === 'spotlight') {
    noStroke(); fill('#F5C542'); triangle(0, -7, -8, 8, 8, 8);
    fill('#C89B18'); circle(0, -7, 6);
  } else {
    noStroke(); fill('#5F8D35'); rect(-9, -5, 18, 12, 2); rect(-9, -8, 8, 4, 1);
  }
  pop();
}

function drawBracket() {
  const y = 46;
  stroke('#6E7A86');
  strokeWeight(2);
  noFill();
  line(margin, y + 10, margin, y);
  line(margin, y, canvasWidth - margin, y);
  line(canvasWidth - margin, y, canvasWidth - margin, y + 10);

  noStroke();
  fill(hoverBracket ? '#E8710A' : '#4A5560');
  textAlign(CENTER, BOTTOM);
  textSize(13);
  text('Capstone Project Planning — the whole chain', canvasWidth / 2, y - 4);

  bracketBox = { x: margin, y: y - 18, w: canvasWidth - 2 * margin, h: 22 };
  hoverBracket = mouseX >= bracketBox.x && mouseX <= bracketBox.x + bracketBox.w &&
                 mouseY >= bracketBox.y && mouseY <= bracketBox.y + bracketBox.h;
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function drawPanel() {
  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(panel.x, panel.y, panel.w, panel.h, 10);

  const padX = panel.x + 14;
  const innerW = panel.w - 28;
  let ty = panel.y + 12;

  noStroke();
  textAlign(LEFT, TOP);

  if (showLoopInfo) {
    fill('#E8710A');
    textSize(14);
    text('Prototype Iteration — the one stage meant to repeat', padX, ty);
    ty += 24;
    fill('black');
    textSize(13);
    text('Every other stage you pass through once. This one you go round: build ' +
         'it, test it, change ONE thing, build it again. Changing one variable ' +
         'at a time is the same discipline as Chapter 21\'s troubleshooting — ' +
         'change two and you will not know which one helped.', padX, ty, innerW);
    return;
  }

  if (hoverBracket) {
    fill('#E8710A');
    textSize(14);
    text('Capstone Project Planning', padX, ty);
    ty += 24;
    fill('black');
    textSize(13);
    text('The umbrella over all seven stages. The order matters because each ' +
         'stage consumes what the one before it produced — you cannot design a ' +
         'circuit before you know what it has to do.', padX, ty, innerW);
    return;
  }

  if (selected < 0) {
    fill('dimgray');
    textSize(14);
    text('Click Project Proposal to start — or press Walk Me Through It for a ' +
         'guided tour of all seven stages.', padX, ty, innerW);
    return;
  }

  const s = STAGES[selected];
  fill('black');
  textSize(16);
  text((selected + 1) + '. ' + s.name, padX, ty);
  ty += 26;

  fill('gray');
  textSize(11);
  text('WHAT YOU PRODUCE HERE', padX, ty);
  ty += 15;
  fill('black');
  textSize(13);
  text(s.makes, padX, ty, innerW);
  ty += 44;

  fill('gray');
  textSize(11);
  text('WHAT IT FEEDS ON', padX, ty);
  ty += 15;
  fill('mediumblue');
  textSize(13);
  text(s.from, padX, ty, innerW);
}

function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  text(walking ? 'touring — press again to stop' : 'Click any stage, or the loop arrow on Prototype Iteration.',
       230, drawHeight + 25);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (loopBox && mouseX >= loopBox.x && mouseX <= loopBox.x + loopBox.w &&
      mouseY >= loopBox.y && mouseY <= loopBox.y + loopBox.h) {
    showLoopInfo = !showLoopInfo;
    return;
  }
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) {
      selected = i;
      showLoopInfo = false;
      walking = false;
      walkButton.html('Walk Me Through It');
      return;
    }
  }
}

function toggleWalk() {
  walking = !walking;
  walkButton.html(walking ? 'Stop the Tour' : 'Walk Me Through It');
  if (walking) { selected = 0; walkStart = millis(); showLoopInfo = false; }
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
