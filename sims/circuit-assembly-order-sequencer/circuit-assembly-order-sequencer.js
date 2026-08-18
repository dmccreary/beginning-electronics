// Circuit Assembly Order Sequencer
// CANVAS_HEIGHT: 520
// Bloom Level: Apply (L3) - Verb: sequence, construct
// Learning objective: Arrange a shuffled set of circuit-building step cards
// into a safe, correct incremental build order, and explain why each step
// precedes the next.
//
// The reasoning matters more than the order itself, so every card carries a
// "why here" explanation the learner can open at any time - before checking,
// not only after being marked wrong.

// ---- Standard MicroSim geometry ----
let containerWidth;
let canvasWidth = 400;
let drawHeight = 470;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 18;
let defaultTextSize = 16;

// ---- Controls ----
let checkButton;
let shuffleButton;
let whyCheckbox;

// ---- State ----
let stack = [];            // ids still waiting in the source stack
let slots = [null, null, null, null, null, null];
let held = null;           // id of the card currently picked up
let heldFrom = null;       // 'stack' or a slot index
let checkResult = null;    // array of booleans, one per slot
let selectedCard = null;   // card whose explanation is open
let showWhy = false;

// The safe reference order. Everything mechanical happens with the power off,
// the wiring is checked, and only then does power go on.
const STEPS = [
  { id: 0, label: 'Place the resistor (power off)',
    why: 'Components go in first, while nothing is energized. If a lead slips, ' +
         'nothing can be damaged because there is no current yet.' },
  { id: 1, label: 'Place the LED (power off)',
    why: 'Still power off. Seating the LED now means you can check its ' +
         'orientation before anything can push current through it backwards.' },
  { id: 2, label: 'Connect the ground wire',
    why: 'Ground first is the habit: it gives every later measurement a ' +
         'reference, and a stray touch against ground is harmless.' },
  { id: 3, label: 'Connect the power wire',
    why: 'The power wire is run to the board now, but the supply itself is ' +
         'still not connected, so the rail is not live yet.' },
  { id: 4, label: 'Double-check polarity and orientation',
    why: 'The last chance to catch a backwards LED or a reversed supply while ' +
         'a mistake still costs nothing.' },
  { id: 5, label: 'Connect the power source',
    why: 'Power always comes last. Every connection has been made and checked, ' +
         'so the first current that flows goes through a circuit you have ' +
         'already verified.' }
];

const WHY_ORDER =
  'If you connect power before checking polarity, a backwards LED sees reverse ' +
  'voltage the instant the rail goes live — and on a sensitive part, that damage ' +
  'is done before you can react. Building with the power off makes every mistake ' +
  'reversible.';

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

  checkButton = createButton('Check My Order');
  checkButton.position(10, drawHeight + 10);
  checkButton.mousePressed(checkOrder);

  shuffleButton = createButton('Shuffle Again');
  shuffleButton.position(130, drawHeight + 10);
  shuffleButton.mousePressed(shuffleCards);

  whyCheckbox = createCheckbox('Show Why Order Matters', false);
  whyCheckbox.position(240, drawHeight + 12);
  whyCheckbox.changed(() => showWhy = whyCheckbox.checked());

  shuffleCards();

  describe('Six shuffled circuit-building step cards and six numbered slots. ' +
           'Cards are moved into the slots to build a proposed assembly order, ' +
           'then checked against the safe reference order with each slot marked ' +
           'correct or out of place. Clicking any card explains why that step ' +
           'belongs where it does.', LABEL);
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
  textSize(20);
  text('Circuit Assembly Order', canvasWidth / 2, 6);

  drawColumns();
  drawInfoBox();
  if (held !== null) drawHeldCard();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout - source stack on the left, ordered slots on the right
// ---------------------------------------------------------------------------

function colGeom() {
  const infoH = 96;
  const top = 34;
  const colW = (canvasWidth - 3 * margin) / 2;
  const listH = drawHeight - top - infoH - 14;
  const cardH = min(46, (listH - 24) / 6);
  return {
    top: top,
    cardH: cardH,
    gap: 4,
    left:  { x: margin, y: top + 22, w: colW },
    right: { x: margin * 2 + colW, y: top + 22, w: colW },
    infoY: drawHeight - infoH - 6,
    infoH: infoH
  };
}

function slotRect(i) {
  const g = colGeom();
  return { x: g.right.x, y: g.right.y + i * (g.cardH + g.gap), w: g.right.w, h: g.cardH };
}

function stackRect(i) {
  const g = colGeom();
  return { x: g.left.x, y: g.left.y + i * (g.cardH + g.gap), w: g.left.w, h: g.cardH };
}

function drawColumns() {
  const g = colGeom();

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(14);
  text('Step cards', g.left.x, g.top);
  text('Your build order', g.right.x, g.top);

  // Source stack
  for (let i = 0; i < stack.length; i++) {
    if (held !== null && heldFrom === 'stack' && stack[i] === held) continue;
    drawCard(stack[i], stackRect(i), 'stack');
  }

  // Ordered slots
  for (let i = 0; i < 6; i++) {
    const r = slotRect(i);
    const id = slots[i];

    // Slot chrome
    let edge = 'lightgray';
    let weight = 1;
    if (checkResult) {
      edge = checkResult[i] ? 'seagreen' : 'crimson';
      weight = 3;
    }
    fill(id === null ? 'whitesmoke' : 'white');
    stroke(edge);
    strokeWeight(weight);
    rect(r.x, r.y, r.w, r.h, 6);

    // Slot number
    noStroke();
    fill('gray');
    textAlign(LEFT, CENTER);
    textSize(13);
    text(i + 1, r.x + 7, r.y + r.h / 2);

    if (id !== null && !(held !== null && heldFrom === i)) {
      drawCard(id, { x: r.x + 20, y: r.y, w: r.w - 20, h: r.h }, i, true);
    }
  }
}

function drawCard(id, r, from, inSlot) {
  const step = STEPS[id];
  const sel = selectedCard === id;

  if (!inSlot) {
    fill(sel ? 'lightyellow' : 'lavenderblush');
    stroke(sel ? '#E8710A' : 'gray');
    strokeWeight(sel ? 3 : 1);
    rect(r.x, r.y, r.w, r.h, 6);
  } else if (sel && !checkResult) {
    // Once the order has been checked, the green/red slot ring is the more
    // important signal, so the selection ring stands down rather than
    // painting over it.
    noFill();
    stroke('#E8710A');
    strokeWeight(3);
    rect(r.x + 1, r.y + 1, r.w - 2, r.h - 2, 6);
  }

  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(12);
  text(step.label, r.x + 8, r.y + r.h / 2, r.w - 14);
}

function drawHeldCard() {
  const g = colGeom();
  const r = { x: mouseX - 70, y: mouseY - g.cardH / 2, w: g.left.w, h: g.cardH };
  noStroke();
  fill(0, 0, 0, 30);
  rect(r.x + 3, r.y + 4, r.w, r.h, 6);
  fill('lightyellow');
  stroke('#E8710A');
  strokeWeight(3);
  rect(r.x, r.y, r.w, r.h, 6);
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(12);
  text(STEPS[held].label, r.x + 8, r.y + r.h / 2, r.w - 14);
}

// ---------------------------------------------------------------------------
// Infobox
// ---------------------------------------------------------------------------

function drawInfoBox() {
  const g = colGeom();
  const x = margin, w = canvasWidth - 2 * margin;

  fill(255, 255, 255, 240);
  stroke('silver');
  strokeWeight(1);
  rect(x, g.infoY, w, g.infoH, 8);

  noStroke();
  textAlign(LEFT, TOP);

  if (showWhy) {
    fill('crimson');
    textSize(13);
    text('Why order matters', x + 12, g.infoY + 8);
    fill('black');
    textSize(13);
    text(WHY_ORDER, x + 12, g.infoY + 28, w - 24);
    return;
  }

  if (selectedCard === null) {
    fill('dimgray');
    textSize(14);
    text('Drag a card into a numbered slot. Click any card to read why that ' +
         'step belongs where it does.', x + 12, g.infoY + 12, w - 24);
    return;
  }

  const step = STEPS[selectedCard];
  fill('black');
  textSize(14);
  text(step.label, x + 12, g.infoY + 8, w - 24);
  fill('dimgray');
  textSize(13);
  text(step.why, x + 12, g.infoY + 30, w - 24);
}

function drawControlLabels() {
  // All three controls carry their own labels.
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------

function mousePressed() {
  if (mouseY < 0 || mouseY > drawHeight) return;

  // Pick up from the source stack
  for (let i = 0; i < stack.length; i++) {
    if (inRect(stackRect(i), mouseX, mouseY)) {
      selectedCard = stack[i];
      held = stack[i];
      heldFrom = 'stack';
      return;
    }
  }

  // Pick up from a slot
  for (let i = 0; i < 6; i++) {
    if (slots[i] !== null && inRect(slotRect(i), mouseX, mouseY)) {
      selectedCard = slots[i];
      held = slots[i];
      heldFrom = i;
      return;
    }
  }
}

function mouseReleased() {
  if (held === null) return;

  // Which slot was it dropped on?
  let target = -1;
  for (let i = 0; i < 6; i++) {
    if (inRect(slotRect(i), mouseX, mouseY)) { target = i; break; }
  }

  if (target >= 0) {
    const displaced = slots[target];
    removeHeldFromSource();
    slots[target] = held;
    // A card already in that slot goes back to the stack
    if (displaced !== null && displaced !== held) stack.push(displaced);
    checkResult = null;
  } else if (heldFrom !== 'stack') {
    // Dropped outside any slot: send it back to the stack
    slots[heldFrom] = null;
    stack.push(held);
    checkResult = null;
  }

  held = null;
  heldFrom = null;
}

function removeHeldFromSource() {
  if (heldFrom === 'stack') {
    const i = stack.indexOf(held);
    if (i >= 0) stack.splice(i, 1);
  } else {
    slots[heldFrom] = null;
  }
}

function inRect(r, px, py) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Marks each slot green when the card in it matches the reference order.
function checkOrder() {
  if (slots.indexOf(null) >= 0) {
    selectedCard = null;
    checkResult = null;
    return;   // "Check" does nothing until all six slots are filled
  }
  checkResult = slots.map((id, i) => id === i);
}

function shuffleCards() {
  stack = STEPS.map(s => s.id);
  // Fisher-Yates
  for (let i = stack.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    const t = stack[i]; stack[i] = stack[j]; stack[j] = t;
  }
  slots = [null, null, null, null, null, null];
  checkResult = null;
  selectedCard = null;
  held = null;
  heldFrom = null;
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
