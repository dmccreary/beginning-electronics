// Breadboard Anatomy Explorer
// CANVAS_HEIGHT: 560
//
// A bare half-size (400 tie point) breadboard the student clicks to identify
// every named region: power rails, five-hole terminal-strip rows, columns,
// single tie points, and the center gutter.
//
// No components and no circuit solver here - this sim uses breadboard-lib.js
// only for board geometry (bbLayout / bbColX / bbRowY / bbNetOf) and for
// drawing the empty board (bbDrawBoard). Everything else is the label layer.

// ---- Standard MicroSim canvas variables ------------------------------------
let containerWidth;
let canvasWidth = 800;
let drawHeight = 470;
let controlHeight = 90;      // 2 rows x 38 + padding
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let defaultTextSize = 16;

// Vertical budget inside the drawing region.
let boardTop = 44;
let hintHeight = 26;

// A half-size board: 30 tie columns x 10 rows = 300 terminal tie points,
// plus 25 holes on each of the 4 power rails = 400 tie points exactly.
const COLS = 30;
const TERMINAL_ROWS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const TOP_ROWS = ['a', 'b', 'c', 'd', 'e'];
const BOTTOM_ROWS = ['f', 'g', 'h', 'i', 'j'];

// ---- Colors ----------------------------------------------------------------
const HILITE = '#E8710A';       // warm orange - the book's accent
const HILITE_2 = '#1B7A7A';     // deep teal - the far side of the gutter
const HOVER = '#F6C08A';        // pale orange - hover preview
const WIRE_COL = '#B35309';     // hidden internal wiring

// ---- Controls --------------------------------------------------------------
let modeSelect, wiringCheckbox, resetButton;

// ---- Selection state -------------------------------------------------------
// A selection is one of:
//   {kind: 'rail',   row: 'T+'}            an entire power rail
//   {kind: 'group',  half: 'T', col: 12}   one five-hole terminal-strip row
//   {kind: 'column', col: 12}              a whole numbered column (two groups)
//   {kind: 'hole',   row: 'c', col: 12}    one single tie point
//   {kind: 'gutter'}                       the center channel
let selection = null;
let hover = null;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Five-hole row (a-e or f-j)');
  modeSelect.option('Whole column (a-j)');
  modeSelect.option('Single tie point');
  modeSelect.selected('Five-hole row (a-e or f-j)');
  modeSelect.changed(() => { selection = null; });

  wiringCheckbox = createCheckbox(' Show internal wiring', false);

  resetButton = createButton('Reset');
  resetButton.mousePressed(() => { selection = null; });

  layoutControls();

  describe('An interactive half-size solderless breadboard with 400 tie points. ' +
    'Clicking a power rail, a five-hole row, a column, a single hole, or the ' +
    'center gutter highlights every tie point in that group and shows its name, ' +
    'definition, and tie-point count in an information panel. A checkbox reveals ' +
    'the hidden internal wiring that connects each group.', LABEL);
}

// Controls are repositioned on every resize so they never drift off a narrow canvas.
function layoutControls() {
  modeSelect.position(margin + 108, drawHeight + 10);
  wiringCheckbox.position(margin, drawHeight + 50);
  resetButton.position(canvasWidth - margin - 60, drawHeight + 48);
}

function draw() {
  updateCanvasSize();

  // Standard MicroSim regions
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  push();
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 560 ? 19 : 24);
  text('Breadboard Anatomy Explorer', canvasWidth / 2, 10);
  pop();

  // Wide screens put the info panel beside the board; narrow screens stack it
  // underneath, which is why drawHeight is budgeted for the taller stacked case.
  const wide = canvasWidth >= 720;
  const avail = drawHeight - boardTop - hintHeight;
  let boardX, boardY, boardW, boardH, infoX, infoY, infoW, infoH;

  if (wide) {
    boardW = (canvasWidth - margin * 3) * 0.63;
    boardH = avail;
    boardX = margin;
    boardY = boardTop;
    infoX = margin * 2 + boardW;
    infoY = boardTop;
    infoW = canvasWidth - infoX - margin;
    infoH = avail;
  } else {
    infoH = 150;
    boardW = canvasWidth - margin * 2;
    boardH = avail - infoH - 8;
    boardX = margin;
    boardY = boardTop;
    infoX = margin;
    infoY = boardTop + boardH + 8;
    infoW = canvasWidth - margin * 2;
  }

  // supply:false reclaims the space the library reserves for a battery badge -
  // this sim has no components, so the board gets the full width.
  bbLayout(boardX, boardY, boardW, boardH, COLS, {supply: false});

  // Hover preview follows the mouse only while it is over the board.
  hover = regionAt(mouseX, mouseY);

  bbDrawBoard();
  drawGutterLabel();
  if (wiringCheckbox.checked()) drawInternalWiring(selection || hover);
  drawHighlight(hover, true);
  drawHighlight(selection, false);
  drawInfoBox(infoX, infoY, infoW, infoH);

  // Hint line under the board
  push();
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(canvasWidth < 560 ? 12 : 14);
  text('Click a power rail, a hole, or the center gutter to identify it.',
       margin, drawHeight - hintHeight / 2);
  pop();

  // Control labels
  push();
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Click selects:', margin, drawHeight + 22);
  pop();

  cursor(hover ? HAND : ARROW);
}

// ---- Hit testing -----------------------------------------------------------

/** The region under a canvas point, or null. */
function regionAt(mx, my) {
  const hole = holeAt(mx, my);
  if (hole) {
    if (bbIsRail(hole.row)) return {kind: 'rail', row: hole.row};
    const mode = modeSelect.value();
    if (mode === 'Single tie point') return {kind: 'hole', row: hole.row, col: hole.col};
    if (mode === 'Whole column (a-j)') return {kind: 'column', col: hole.col};
    return {kind: 'group', half: hole.row <= 'e' ? 'T' : 'B', col: hole.col};
  }
  if (inGutter(mx, my)) return {kind: 'gutter'};
  return null;
}

/**
 * The tie point nearest a canvas point, within a touch-friendly radius.
 * Nearest-wins rather than a strict per-hole box, so the targets stay tappable
 * on a phone where one hole pitch can be under 11 pixels.
 */
function holeAt(mx, my) {
  const rad = max(BB.pitch * 0.6, 11);
  let best = null;
  let bestD = rad * rad;
  for (let col = 1; col <= BB.cols; col++) {
    for (const row of BB_ROWS) {
      if (bbIsRail(row) && bbSnapRailCol(col) !== col) continue;
      const dx = mx - bbColX(col);
      const dy = my - bbRowY(row);
      const d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = {row: row, col: col}; }
    }
  }
  return best;
}

/** True when a canvas point falls inside the center channel. */
function inGutter(mx, my) {
  const top = bbRowY('e') + BB.pitch * 0.6;
  const bot = bbRowY('f') - BB.pitch * 0.6;
  return my >= top && my <= bot && mx >= BB.x && mx <= BB.x + BB.w;
}

// ---- Region contents -------------------------------------------------------

/** Every tie point belonging to a selection, as {row, col} objects. */
function holesOf(sel) {
  if (!sel) return [];
  const out = [];
  if (sel.kind === 'rail') {
    for (let c = 1; c <= BB.cols; c++) {
      if (bbSnapRailCol(c) === c) out.push({row: sel.row, col: c});
    }
  } else if (sel.kind === 'group') {
    (sel.half === 'T' ? TOP_ROWS : BOTTOM_ROWS).forEach(r => out.push({row: r, col: sel.col}));
  } else if (sel.kind === 'column') {
    TERMINAL_ROWS.forEach(r => out.push({row: r, col: sel.col}));
  } else if (sel.kind === 'hole') {
    out.push({row: sel.row, col: sel.col});
  }
  return out;
}

/** Holes on the far side of the gutter get the second color in column mode. */
function holeColor(sel, hole) {
  if (sel.kind === 'column' && hole.row >= 'f') return HILITE_2;
  return HILITE;
}

// ---- Drawing ---------------------------------------------------------------

function drawHighlight(sel, isHover) {
  if (!sel) return;
  if (isHover && selection && sameRegion(sel, selection)) return;

  push();
  if (sel.kind === 'gutter') {
    const top = bbRowY('e') + BB.pitch * 0.6;
    const bot = bbRowY('f') - BB.pitch * 0.6;
    noStroke();
    fill(isHover ? HOVER : HILITE);
    rect(BB.x + BB.pitch * 0.5, top, BB.w - BB.pitch, bot - top);
  } else {
    const s = BB.pitch * 0.62;
    noStroke();
    holesOf(sel).forEach(h => {
      fill(isHover ? HOVER : holeColor(sel, h));
      rect(bbColX(h.col) - s / 2, bbRowY(h.row) - s / 2, s, s, s * 0.25);
    });
  }
  pop();
}

/**
 * The hidden metal clips, made visible. This is the chapter's "x-ray vision"
 * moment, so the break at the gutter is drawn as a real gap rather than a
 * continuous line - the gap IS the lesson.
 */
function drawInternalWiring(sel) {
  if (!sel) return;
  push();
  stroke(WIRE_COL);
  strokeWeight(max(1.5, BB.pitch * 0.16));
  noFill();

  if (sel.kind === 'gutter') {
    // Every column's two halves at once, so the split reads across the board.
    for (let c = 1; c <= BB.cols; c++) {
      halfLine(c, TOP_ROWS);
      halfLine(c, BOTTOM_ROWS);
    }
  } else if (sel.kind === 'rail') {
    const y = bbRowY(sel.row);
    line(bbColX(1), y, bbColX(bbSnapRailCol(BB.cols)), y);
  } else if (sel.kind === 'group') {
    halfLine(sel.col, sel.half === 'T' ? TOP_ROWS : BOTTOM_ROWS);
  } else if (sel.kind === 'column') {
    halfLine(sel.col, TOP_ROWS);
    halfLine(sel.col, BOTTOM_ROWS);
  } else if (sel.kind === 'hole') {
    // Show the group this single tie point belongs to.
    if (bbIsRail(sel.row)) {
      const y = bbRowY(sel.row);
      line(bbColX(1), y, bbColX(bbSnapRailCol(BB.cols)), y);
    } else {
      halfLine(sel.col, sel.row <= 'e' ? TOP_ROWS : BOTTOM_ROWS);
    }
  }
  pop();
}

/** One five-hole clip: a vertical line down one half of a column. */
function halfLine(col, rows) {
  const x = bbColX(col);
  line(x, bbRowY(rows[0]), x, bbRowY(rows[rows.length - 1]));
}

/** The word "gutter" printed into the center channel. */
function drawGutterLabel() {
  push();
  noStroke();
  fill('gray');
  textAlign(CENTER, CENTER);
  textSize(max(7, BB.pitch * 0.62));
  const y = (bbRowY('e') + bbRowY('f')) / 2;
  text('gutter', BB.x + BB.w / 2, y);
  pop();
}

// ---- Info box --------------------------------------------------------------

/** Name, definition, and tie-point count for the current selection. */
function infoFor(sel) {
  if (!sel) {
    return {
      title: 'Click a region to learn what it does',
      sub: '',
      body: 'Every hole on this board belongs to a group that is already wired ' +
            'together underneath the plastic. Click a power rail, a five-hole row, ' +
            'a column, or the center gutter to see which holes are teammates. ' +
            'Turn on "Show internal wiring" to see the hidden metal clips.',
      count: ''
    };
  }
  if (sel.kind === 'rail') {
    const isPlus = sel.row.charAt(1) === '+';
    const where = sel.row.charAt(0) === 'T' ? 'top' : 'bottom';
    return {
      title: 'Power rail (' + where + ' ' + (isPlus ? '+' : '−') + ')',
      sub: 'Marked ' + (isPlus ? '"+" in red' : '"−" in blue') +
           ' along the ' + where + ' edge',
      body: 'A long line of holes running the full length of the board, all ' +
            'connected end to end. Power rails distribute one voltage to many ' +
            'components at once. The top rails and the bottom rails are NOT ' +
            'connected to each other - a jumper wire has to do that.',
      count: holesOf(sel).length + ' tie points, all one connection'
    };
  }
  if (sel.kind === 'group') {
    const rows = sel.half === 'T' ? 'a–e' : 'f–j';
    return {
      title: 'Five-hole row (rows ' + rows + ', column ' + sel.col + ')',
      sub: 'One breadboard row',
      body: 'A group of five holes running across the narrow width of the board, ' +
            'tied together by a single metal clip underneath. Anything plugged ' +
            'into any one of these five holes connects to the other four - which ' +
            'is why two leads sharing a row are shorted together.',
      count: '5 tie points, all one connection'
    };
  }
  if (sel.kind === 'column') {
    return {
      title: 'Column ' + sel.col,
      sub: 'Two separate groups, not one',
      body: 'A column is the numbered direction running the length of the board. ' +
            'It names a hole, but it is NOT a single connection: the gutter splits ' +
            'it into rows a–e (orange) and rows f–j (teal), which are never ' +
            'connected to each other. Two colors here means two separate nets.',
      count: '10 tie points in 2 unconnected groups of 5'
    };
  }
  if (sel.kind === 'hole') {
    const net = bbIsRail(sel.row)
      ? 'the ' + (sel.row.charAt(0) === 'T' ? 'top' : 'bottom') + ' ' +
        (sel.row.charAt(1) === '+' ? '"+"' : '"−"') + ' power rail'
      : 'the five-hole row at rows ' + (sel.row <= 'e' ? 'a–e' : 'f–j') +
        ', column ' + sel.col;
    return {
      title: 'One tie point — row ' + sel.row + ', column ' + sel.col,
      sub: 'Grid address: row letter + column number',
      body: 'A tie point is one single hole: one connection point inside a larger, ' +
            'internally-wired group. This one belongs to ' + net + '. Naming holes ' +
            'this way works like a spreadsheet cell or a seat number, so a wiring ' +
            'diagram can point at one exact hole with no confusion.',
      count: '1 of 400 tie points on this board'
    };
  }
  return {
    title: 'The gutter (center channel)',
    sub: 'Separates rows a–e from rows f–j',
    body: 'A narrow plastic channel splitting the terminal area into two halves ' +
          'that are never connected to each other, even at the same column number. ' +
          'Its job is to give a multi-legged chip a place to straddle, with legs in ' +
          'both halves at once, without shorting one side of the chip to the other.',
    count: 'No tie points - nothing plugged in here connects to anything'
  };
}

function drawInfoBox(x, y, w, h) {
  const info = infoFor(selection);
  const small = canvasWidth < 560;

  push();
  // Panel
  stroke('silver');
  strokeWeight(1);
  fill('white');
  rect(x, y, w, h, 8);

  const pad = 12;
  let ty = y + pad;
  const tw = w - pad * 2;

  // Title
  noStroke();
  fill(selection ? HILITE : 'black');
  textAlign(LEFT, TOP);
  textSize(small ? 15 : 17);
  textStyle(BOLD);
  text(info.title, x + pad, ty, tw);
  ty += textHeightOf(info.title, tw, small ? 15 : 17) + 4;
  textStyle(NORMAL);

  // Subtitle
  if (info.sub) {
    fill('dimgray');
    textSize(small ? 12 : 13);
    text(info.sub, x + pad, ty, tw);
    ty += textHeightOf(info.sub, tw, small ? 12 : 13) + 8;
  } else {
    ty += 4;
  }

  // Definition
  fill(40);
  textSize(small ? 12 : 14);
  const bodyH = h - (ty - y) - pad - (info.count ? 24 : 0);
  text(info.body, x + pad, ty, tw, max(20, bodyH));

  // Tie-point count, pinned to the bottom of the panel
  if (info.count) {
    fill(selection ? HILITE : 'gray');
    textSize(small ? 12 : 13);
    textStyle(BOLD);
    textAlign(LEFT, BOTTOM);
    text(info.count, x + pad, y + h - pad, tw);
    textStyle(NORMAL);
  }
  pop();
}

/** Rough wrapped-text height, used to stack the panel's lines. */
function textHeightOf(str, w, size) {
  push();
  textSize(size);
  const perLine = max(1, floor(w / (size * 0.52)));
  const lines = max(1, ceil(str.length / perLine));
  pop();
  return lines * size * 1.25;
}

// ---- Interaction -----------------------------------------------------------

function sameRegion(a, b) {
  return a && b && a.kind === b.kind && a.row === b.row &&
         a.col === b.col && a.half === b.half;
}

function mousePressed() {
  if (mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY > drawHeight) return;
  const hit = regionAt(mouseX, mouseY);
  if (hit) selection = sameRegion(hit, selection) ? null : hit;
}

// These two functions must be present for width responsiveness
function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  layoutControls();
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
}
