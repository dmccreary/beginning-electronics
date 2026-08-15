/*
 * breadboard-lib.js - Runtime library for Breadboard MicroSims
 *
 * Author: Dan McCreary
 * License: CC BY-NC-SA 4.0
 * Version: 2026.08
 *
 * WHAT THIS IS
 * ------------
 * Everything a breadboard MicroSim needs that is NOT specific to one circuit:
 *
 *   1. Board geometry   - hole coordinates from breadboard addresses like 'e12'
 *   2. Board rendering  - power rails, terminal strips, center channel, labels
 *   3. Components       - LED, resistor, button, switch, wire, battery, and more
 *   4. Circuit solver   - node-voltage analysis; real currents and voltages
 *   5. Wire animation   - moving dots whose speed follows the actual current
 *   6. Scope            - rolling strip chart of any voltage or current
 *
 * The sim author writes only the circuit: which parts, in which holes.
 *
 * HOW TO USE
 * ----------
 * Load this file BEFORE the sim file in main.html:
 *
 *   <script src="breadboard-lib.js"></script>
 *   <script src="my-sim.js"></script>
 *
 * Then in the sim:
 *
 *   function setup() {
 *     updateCanvasSize();
 *     const canvas = createCanvas(canvasWidth, canvasHeight);
 *     canvas.parent(document.querySelector('main'));
 *     bbReset();
 *     bbBattery({pos: 'T+1', neg: 'T-1', volts: 9, label: '9V'});
 *     bbWire({a: 'T+3', b: 'a3', color: 'red'});
 *     bbResistor({a: 'a3', b: 'a8', ohms: 470, label: 'R1'});
 *     bbLED({anode: 'e8', cathode: 'e12', color: 'red', label: 'D1'});
 *     bbWire({a: 'a12', b: 'T-12', color: 'black'});
 *   }
 *
 *   function draw() {
 *     ...standard MicroSim background...
 *     bbLayout(margin, 60, boardWidth, 20);   // where the board lives, how wide
 *     bbSolve();                              // one solve per frame
 *     bbDrawBoard();
 *     bbDrawParts();
 *   }
 *
 * ELECTRICAL MODEL - READ THIS BEFORE TRUSTING THE NUMBERS
 * -------------------------------------------------------
 * bbSolve() runs a real node-voltage (nodal analysis) solve over the resistive
 * network, so series and parallel currents are correct, not estimated. Diodes,
 * LEDs, buttons, switches and transistors are nonlinear, so the solve repeats
 * up to BB_MAX_PASSES times, re-deciding which of them conduct, until the set
 * of conducting parts stops changing.
 *
 * Deliberate simplifications, all of them appropriate for a first course:
 *   - Capacitors are open circuits (DC steady state). This is a teaching point,
 *     not a bug: it is why a capacitor blocks DC.
 *   - LEDs and diodes use a fixed forward voltage plus a small series
 *     resistance, not the Shockley equation.
 *   - No inductance, no transient response, no AC. Each frame is steady state.
 *
 * Document these in the sim's metadata.json under "limitations".
 */

// ============================================================================
// SECTION 1 - Board geometry
// ============================================================================

// Row labels, top to bottom. 'T' rows are the top power rails, 'B' rows the
// bottom ones. Rows a-e are the top terminal strip, f-j the bottom one.
const BB_ROWS = ['T+', 'T-', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'B+', 'B-'];

// Vertical position of each row measured from the top edge of the board, in
// units of one hole pitch (0.1 inch on a real board). The gaps encode the
// physical reality: space for the column numbers above row a and below row j,
// and the wider center channel between e and f that DIP chips straddle.
const BB_ROW_UNITS = {
  'T+': 1.0, 'T-': 2.0,
  'a': 4.3, 'b': 5.3, 'c': 6.3, 'd': 7.3, 'e': 8.3,
  'f': 10.5, 'g': 11.5, 'h': 12.5, 'i': 13.5, 'j': 14.5,
  'B+': 16.8, 'B-': 17.8
};

// Total board height in pitch units - used to size the board rectangle.
const BB_HEIGHT_UNITS = 18.8;

// Live layout state. bbLayout() rewrites this every frame so the board tracks
// the container width, which is what makes the MicroSim width-responsive.
let BB = {
  x: 0,              // left edge of the board rectangle
  y: 0,              // top edge of the board rectangle
  w: 400,            // board width in pixels
  pitch: 14,         // pixels between adjacent holes
  cols: 20,          // number of tie columns (20 or 30 are the common choices)
  padLeft: 0,        // space reserved left of the board for the supply badge
  showColNumbers: true,
  showRowLetters: true,
  electronFlow: false // false = conventional current (+ to -), the textbook default
};

// Space reserved to the left of the board for the power supply badge, in pitch
// units. bbLayout subtracts it before sizing the board.
const BB_SUPPLY_UNITS = 4.0;

// Simulation clock, advanced by bbSolve() only while the sim is running. Wire
// animation reads it, so dots freeze when the sim is paused.
let bbTime = 0;
let bbRunning = false;

/**
 * Fit the board into a rectangle. Call this at the top of draw(), before any
 * bbDraw* or bbSolve call, so the board re-scales when the window resizes.
 *
 * Pitch is chosen so the board fits the rectangle in BOTH directions, then the
 * board is centered in whatever space is left over. Sizing on width alone is
 * the single most common way a breadboard sim ends up with its bottom rows
 * clipped off below drawHeight.
 *
 * @param {number} x     left edge of the available rectangle
 * @param {number} y     top edge of the available rectangle
 * @param {number} w     available width  (includes room for the supply badge)
 * @param {number} h     available height
 * @param {number} cols  tie columns (default keeps the current value)
 * @param {object} opts  {supply: false} to reclaim the supply badge space
 */
function bbLayout(x, y, w, h, cols, opts) {
  if (cols) BB.cols = cols;
  const padUnits = (opts && opts.supply === false) ? 0 : BB_SUPPLY_UNITS;

  // Three extra pitch units of board width hold the row letters on both edges.
  const pitchFromWidth = w / (BB.cols + 3 + padUnits);
  const pitchFromHeight = h / BB_HEIGHT_UNITS;
  BB.pitch = max(4, min(pitchFromWidth, pitchFromHeight));

  BB.padLeft = BB.pitch * padUnits;
  BB.w = BB.pitch * (BB.cols + 3);
  BB.x = x + BB.padLeft + max(0, (w - BB.padLeft - BB.w) / 2);
  BB.y = y + max(0, (h - bbHeight()) / 2);
}

/** Height of the board in pixels at the current pitch. */
function bbHeight() {
  return BB.pitch * BB_HEIGHT_UNITS;
}

/** Canvas x of tie column `col` (1-based). */
function bbColX(col) {
  return BB.x + BB.pitch * (1.5 + (col - 1));
}

/** Canvas y of row `row` ('a'-'j', 'T+', 'T-', 'B+', 'B-'). */
function bbRowY(row) {
  return BB.y + BB.pitch * BB_ROW_UNITS[row];
}

/** True for the four power-rail rows. */
function bbIsRail(row) {
  return row === 'T+' || row === 'T-' || row === 'B+' || row === 'B-';
}

/**
 * Real power rails come in groups of five holes with a gap between groups, so
 * every sixth column has no rail hole. A pin addressed to a missing hole snaps
 * back one column - electrically identical (the whole rail is one net) and it
 * keeps every pin sitting on a hole you can actually see.
 */
function bbSnapRailCol(col) {
  return (col % 6 === 0) ? col - 1 : col;
}

/**
 * Parse a breadboard address into a pin object.
 *
 * Addresses read exactly like the silkscreen on a real board: a row label
 * followed by a column number. 'a1', 'e12', 'j30', 'T+5', 'B-14'.
 *
 * @returns {{row: string, col: number, x: number, y: number, net: string}}
 */
function bbPin(ref) {
  if (typeof ref === 'object' && ref !== null && ref.row) return ref;
  const m = /^([a-j]|[TB][+-])(\d+)$/.exec(String(ref).trim());
  if (!m) {
    console.error('bbPin: bad breadboard address "' + ref +
      '". Use a row letter a-j or a rail T+/T-/B+/B- followed by a column, e.g. "e12" or "T+5".');
    return {row: 'a', col: 1, x: bbColX(1), y: bbRowY('a'), net: 'T1'};
  }
  let row = m[1];
  let col = parseInt(m[2], 10);
  if (col < 1 || col > BB.cols) {
    console.error('bbPin: column ' + col + ' in "' + ref + '" is outside this ' +
      BB.cols + '-column board.');
    col = constrain(col, 1, BB.cols);
  }
  if (bbIsRail(row)) col = bbSnapRailCol(col);

  // x and y are getters, not stored numbers. Pins are created once in setup()
  // but the board is re-laid-out every frame as the container width changes, so
  // a pin that remembered its pixel position would be stale the moment the
  // window resized.
  const pin = {row: row, col: col, net: bbNetOf(row, col)};
  Object.defineProperty(pin, 'x', {get: () => bbColX(pin.col), enumerable: true});
  Object.defineProperty(pin, 'y', {get: () => bbRowY(pin.row), enumerable: true});
  return pin;
}

/**
 * The electrical net a hole belongs to. This one function encodes the single
 * most important thing a breadboard teaches: which holes are already wired
 * together underneath the plastic.
 *
 *   - Rows a-e of one column are one net; rows f-j of that column are another.
 *     The center channel keeps the two halves apart.
 *   - Each power rail is a single net running the whole length of the board.
 *     The top rails and the bottom rails are NOT connected to each other - a
 *     jumper has to do that, exactly as on a real board.
 */
function bbNetOf(row, col) {
  if (row === 'T+') return 'TP';
  if (row === 'T-') return 'TN';
  if (row === 'B+') return 'BP';
  if (row === 'B-') return 'BN';
  return (row <= 'e' ? 'T' : 'B') + col;
}

// ============================================================================
// SECTION 2 - Board rendering
// ============================================================================

/** Draw the empty breadboard: body, rails, holes, channel, and labels. */
function bbDrawBoard() {
  const p = BB.pitch;
  const h = bbHeight();

  push();
  rectMode(CORNER);

  // Board body
  noStroke();
  fill('whitesmoke');
  stroke('silver');
  strokeWeight(1);
  rect(BB.x, BB.y, BB.w, h, p * 0.4);

  // Center channel between rows e and f
  noStroke();
  fill('gainsboro');
  const chanTop = bbRowY('e') + p * 0.6;
  rect(BB.x + p * 0.5, chanTop, BB.w - p, bbRowY('f') - p * 0.6 - chanTop);

  // Power rail guide lines and their + / - end labels
  bbDrawRailLine('T+', 'red', -0.7);
  bbDrawRailLine('T-', 'blue', 0.7);
  bbDrawRailLine('B+', 'red', -0.7);
  bbDrawRailLine('B-', 'blue', 0.7);

  // Tie-point holes
  for (let col = 1; col <= BB.cols; col++) {
    for (const row of BB_ROWS) {
      if (bbIsRail(row) && bbSnapRailCol(col) !== col) continue; // rail group gap
      bbDrawHole(bbColX(col), bbRowY(row));
    }
  }

  // Column numbers above row a and below row j
  if (BB.showColNumbers) {
    const step = (p >= 13) ? 1 : 5;   // thin out the numbers on a narrow board
    noStroke();
    fill('gray');
    textAlign(CENTER, CENTER);
    textSize(max(8, p * 0.62));
    for (let col = 1; col <= BB.cols; col++) {
      if (col % step !== 0 && col !== 1 && step > 1) continue;
      text(col, bbColX(col), bbRowY('a') - p * 1.1);
      text(col, bbColX(col), bbRowY('j') + p * 1.1);
    }
  }

  // Row letters down both edges
  if (BB.showRowLetters) {
    noStroke();
    fill('gray');
    textAlign(CENTER, CENTER);
    textSize(max(8, p * 0.62));
    for (const row of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']) {
      text(row, BB.x + p * 0.6, bbRowY(row));
      text(row, BB.x + BB.w - p * 0.6, bbRowY(row));
    }
  }

  pop();
}

/** One power-rail stripe plus the + or - sign at each end. */
function bbDrawRailLine(row, col, offsetUnits) {
  const p = BB.pitch;
  const y = bbRowY(row) + p * offsetUnits;
  stroke(col);
  strokeWeight(max(1, p * 0.11));
  line(BB.x + p * 1.1, y, BB.x + BB.w - p * 1.1, y);

  noStroke();
  fill(col);
  textAlign(CENTER, CENTER);
  textSize(max(9, p * 0.8));
  const sign = row.charAt(1);
  text(sign, BB.x + p * 0.6, bbRowY(row));
  text(sign, BB.x + BB.w - p * 0.6, bbRowY(row));
}

/** A single tie point. Square holes read as "breadboard" at a glance. */
function bbDrawHole(x, y) {
  const s = BB.pitch * 0.42;
  noStroke();
  fill(55);
  rect(x - s / 2, y - s / 2, s, s, s * 0.2);
}

// ============================================================================
// SECTION 3 - Components
// ============================================================================
//
// Every component is a plain object in bbParts. Two methods matter:
//
//   branches()  -> the electrical branches it contributes to the solver
//   render()    -> what it looks like on the board
//
// A branch is {a, b, R, vf, oneWay}: current flows a -> b through resistance R
// against a forward voltage drop vf, and if oneWay it conducts in that
// direction only. Returning [] means "open circuit this pass".

let bbParts = [];
let bbNets = {};        // netId -> voltage in volts
let bbGroundNet = null; // the 0 V reference
const BB_MAX_PASSES = 8;

/**
 * Clear the circuit and the scope. Call once in setup(), before adding any
 * parts or traces - it drops both, so a sim that re-initializes does not end up
 * with two copies of everything.
 */
function bbReset() {
  bbParts = [];
  bbNets = {};
  bbGroundNet = null;
  bbTime = 0;
  bbScopeTraces = [];
  bbScopeSamples = 0;
}

/** Look up a part by its label, e.g. bbPart('D1'). */
function bbPart(label) {
  return bbParts.find(p => p.label === label) || null;
}

/**
 * Current through a part in milliamps - what a meter in that branch would read.
 *
 * This is the magnitude on purpose. The sign of the underlying branch current
 * depends on which pin the author happened to declare first, so a resistor
 * wired 'a18' -> 'T+18' would report negative current for no reason a student
 * could see. Use bbCurrentSigned() when the direction genuinely matters.
 */
function bbCurrent(label) {
  const p = bbPart(label);
  return p ? Math.abs(p.current) * 1000 : 0;
}

/**
 * Current in milliamps, signed positive when it flows from the part's first
 * declared pin toward its second.
 */
function bbCurrentSigned(label) {
  const p = bbPart(label);
  return p ? p.current * 1000 : 0;
}

/** Voltage at a breadboard address, e.g. bbVoltage('e12'). */
function bbVoltage(ref) {
  const pin = bbPin(ref);
  return bbNets[pin.net] === undefined ? 0 : bbNets[pin.net];
}

/** Voltage across a part's two main pins. */
function bbVoltageAcross(label) {
  const p = bbPart(label);
  if (!p || !p.pins || p.pins.length < 2) return 0;
  const va = bbNets[p.pins[0].net] || 0;
  const vb = bbNets[p.pins[1].net] || 0;
  return va - vb;
}

/** True when a part is passing enough current to count as "on". */
function bbIsOn(label, thresholdMilliamps) {
  return Math.abs(bbCurrent(label)) >= (thresholdMilliamps === undefined ? 0.5 : thresholdMilliamps);
}

// --- shared plumbing --------------------------------------------------------

function bbAddPart(part) {
  part.current = 0;
  part.conducting = false;
  part.label = part.label || '';
  bbParts.push(part);
  return part;
}

/**
 * Set up a local coordinate frame running along the line between two pins:
 * the origin sits at the midpoint with +x pointing at pin b. Every component
 * body is then drawn in that frame, so one piece of drawing code handles
 * horizontal, vertical, and diagonal placement alike.
 *
 * @returns {number} the pin-to-pin distance, i.e. the body's available length
 */
function bbBeginBody(p1, p2) {
  const d = dist(p1.x, p1.y, p2.x, p2.y);
  push();
  translate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
  rotate(atan2(p2.y - p1.y, p2.x - p1.x));
  return d;
}

function bbEndBody() {
  pop();
}

/** The two bent leads that carry a through-hole part down into its holes. */
function bbDrawLeads(len, bodyLen) {
  stroke(90);
  strokeWeight(max(1.5, BB.pitch * 0.14));
  line(-len / 2, 0, -bodyLen / 2, 0);
  line(bodyLen / 2, 0, len / 2, 0);
}

/**
 * Small label drawn just above a component body, upright regardless of how the
 * body is rotated. The label sits on a translucent backing because it usually
 * lands over a row of holes, and dark text on black squares is unreadable.
 */
function bbDrawLabel(label, x, y, col) {
  if (!label) return;
  push();
  const ts = max(9, BB.pitch * 0.7);
  textSize(ts);
  textAlign(CENTER, BOTTOM);
  const w = textWidth(label) + 6;
  noStroke();
  fill(255, 255, 255, 215);
  rect(x - w / 2, y - ts - 2, w, ts + 4, 3);
  fill(col || 'black');
  text(label, x, y);
  pop();
}

// --- battery / power supply -------------------------------------------------

/**
 * The circuit's power source. It fixes the voltage of two nets, which is what
 * makes the whole solve possible: everything else is measured relative to them.
 *
 * @param {string} o.pos    address on the positive rail, e.g. 'T+1'
 * @param {string} o.neg    address on the negative rail, e.g. 'T-1'
 * @param {number} o.volts  supply voltage (default 9)
 */
function bbBattery(o) {
  const pos = bbPin(o.pos);
  const neg = bbPin(o.neg);
  const part = {
    type: 'battery',
    pins: [pos, neg],
    volts: o.volts === undefined ? 9 : o.volts,
    label: o.label || 'BAT',
    on: o.on === undefined ? true : o.on,
    branches: function () { return []; },  // handled as fixed nodes, not a branch
    render: function () {
      // The supply is drawn as a labelled pack in the reserved strip to the
      // left of the board, not as a part in the holes, because that is where
      // the leads from a battery pack or bench supply actually arrive.
      const p = BB.pitch;
      const pos = this.pins[0], neg = this.pins[1];
      const bodyW = max(p * 2.2, BB.padLeft * 0.6);
      const cx = BB.x - BB.padLeft + bodyW / 2;
      const yTop = min(pos.y, neg.y);
      const yBot = max(pos.y, neg.y);
      const bodyTop = yTop - p * 0.45;
      const bodyH = max(p * 2.4, (yBot - yTop) + p * 0.9);

      push();
      // Leads out to the rail holes, red for + and black for -
      strokeWeight(max(2, p * 0.18));
      stroke(this.on ? 'red' : 'gray');
      line(cx + bodyW / 2, pos.y, pos.x, pos.y);
      stroke(this.on ? 'black' : 'gray');
      line(cx + bodyW / 2, neg.y, neg.x, neg.y);

      // Battery pack
      stroke('gray');
      strokeWeight(1);
      fill(this.on ? 'gold' : 'lightgray');
      rect(cx - bodyW / 2, bodyTop, bodyW, bodyH, p * 0.25);
      noStroke();
      fill('black');
      textAlign(CENTER, CENTER);
      textSize(max(9, min(p * 0.7, bodyW * 0.42)));
      text(nf(this.volts, 0, this.volts % 1 ? 1 : 0) + 'V', cx, bodyTop + bodyH / 2);
      // + and - beside the terminals so polarity is unambiguous
      textSize(max(9, p * 0.7));
      fill('red');
      text('+', cx + bodyW / 2 - p * 0.35, pos.y - p * 0.55);
      fill('black');
      text('−', cx + bodyW / 2 - p * 0.35, neg.y + p * 0.55);
      pop();
    }
  };
  return bbAddPart(part);
}

// --- jumper wire ------------------------------------------------------------

/**
 * A jumper wire. Wires are where current flow is easiest to see, so this is
 * the part that carries the animation.
 *
 * @param {string} o.a, o.b   the two addresses it connects
 * @param {string} o.color    insulation color (red for +, black for ground, by convention)
 * @param {number} o.arc      how far the wire bows away from the board, in pitch
 *                            units (default 0 = straight). Use a small arc when
 *                            a wire would otherwise run across other parts.
 */
function bbWire(o) {
  const a = bbPin(o.a);
  const b = bbPin(o.b);
  const part = {
    type: 'wire',
    pins: [a, b],
    color: o.color || 'green',
    arc: o.arc || 0,
    label: o.label || '',
    branches: function () {
      return [{a: this.pins[0].net, b: this.pins[1].net, R: 0.01, vf: 0, oneWay: false}];
    },
    render: function () {
      bbDrawAnimatedWire(this.pins[0], this.pins[1], this.current, this.color, this.arc);
    }
  };
  return bbAddPart(part);
}

// --- resistor ---------------------------------------------------------------

const BB_BAND_COLORS = ['black', 'brown', 'red', 'orange', 'yellow',
                        'green', 'blue', 'purple', 'gray', 'white'];

/** The three color bands that spell out a resistance value. */
function bbResistorBands(ohms) {
  const digits = String(Math.round(ohms)).split('').map(Number);
  if (digits.length < 2) return ['black', BB_BAND_COLORS[digits[0]] || 'black', 'gold'];
  return [
    BB_BAND_COLORS[digits[0]],
    BB_BAND_COLORS[digits[1]],
    BB_BAND_COLORS[digits.length - 2] || 'black'
  ];
}

/** Human-readable resistance: 220 -> "220Ω", 4700 -> "4.7kΩ". */
function bbFormatOhms(ohms) {
  if (ohms >= 1e6) return (ohms / 1e6).toFixed(ohms % 1e6 ? 1 : 0) + 'MΩ';
  if (ohms >= 1000) return (ohms / 1000).toFixed(ohms % 1000 ? 1 : 0) + 'kΩ';
  return ohms + 'Ω';
}

function bbResistor(o) {
  const a = bbPin(o.a);
  const b = bbPin(o.b);
  const part = {
    type: 'resistor',
    pins: [a, b],
    ohms: o.ohms === undefined ? 220 : o.ohms,
    label: o.label || '',
    showValue: o.showValue !== false,
    branches: function () {
      return [{a: this.pins[0].net, b: this.pins[1].net, R: max(0.1, this.ohms), vf: 0, oneWay: false}];
    },
    render: function () {
      const p = BB.pitch;
      const len = bbBeginBody(this.pins[0], this.pins[1]);
      const bodyLen = min(len * 0.62, p * 3.6);
      const bodyH = p * 0.85;
      bbDrawLeads(len, bodyLen);
      noStroke();
      fill('tan');
      rect(-bodyLen / 2, -bodyH / 2, bodyLen, bodyH, bodyH * 0.35);
      const bands = bbResistorBands(this.ohms);
      const bw = bodyLen * 0.11;
      for (let i = 0; i < bands.length; i++) {
        fill(bands[i]);
        rect(-bodyLen / 2 + bodyLen * (0.18 + i * 0.2), -bodyH / 2, bw, bodyH);
      }
      bbEndBody();
      if (this.showValue) {
        const label = (this.label ? this.label + ' ' : '') + bbFormatOhms(this.ohms);
        bbDrawLabel(label, (this.pins[0].x + this.pins[1].x) / 2,
                    min(this.pins[0].y, this.pins[1].y) - p * 0.65);
      }
    }
  };
  return bbAddPart(part);
}

// --- LED --------------------------------------------------------------------

// Forward voltage really does depend on the die chemistry, and this is worth
// showing students: a blue LED needs a higher supply than a red one.
const BB_LED_VF = {red: 1.9, yellow: 2.1, orange: 2.0, green: 2.2, blue: 3.1, white: 3.2};

function bbLED(o) {
  const anode = bbPin(o.anode);
  const cathode = bbPin(o.cathode);
  const part = {
    type: 'led',
    pins: [anode, cathode],
    color: o.color || 'red',
    label: o.label || '',
    vf: o.vf === undefined ? (BB_LED_VF[o.color] || 2.0) : o.vf,
    branches: function () {
      return [{a: this.pins[0].net, b: this.pins[1].net, R: 15, vf: this.vf, oneWay: true}];
    },
    render: function () {
      const p = BB.pitch;
      const len = bbBeginBody(this.pins[0], this.pins[1]);
      // A 5 mm LED is a 5 mm LED however far apart its leads are bent, so the
      // body is sized from the hole pitch and only shrinks if the leads are
      // unusually close together.
      const d = min(len * 0.55, p * 1.5);
      bbDrawLeads(len, d);

      // Brightness tracks current, saturating around 20 mA - the point where a
      // typical 5 mm LED is at full output.
      const mA = Math.abs(this.current) * 1000;
      const lit = constrain(mA / 20, 0, 1);

      if (lit > 0.02) {
        // The glow is also sized from the pitch. Scaling it off the body would
        // make a long-legged LED wash out its neighbours on the board.
        noStroke();
        const g = color(this.color);
        g.setAlpha(90 * lit);
        fill(g);
        circle(0, 0, p * (2.0 + lit));
      }
      stroke(60);
      strokeWeight(1);
      fill(lit > 0.02 ? lerpColor(color('dimgray'), color(this.color), 0.35 + 0.65 * lit)
                      : lerpColor(color(this.color), color('dimgray'), 0.55));
      circle(0, 0, d);
      // Flat on the cathode side - the physical marking for polarity
      noFill();
      stroke(40);
      strokeWeight(max(1, p * 0.09));
      const fx = d * 0.34;
      line(fx, -d * 0.34, fx, d * 0.34);
      bbEndBody();

      bbDrawLabel(this.label, (this.pins[0].x + this.pins[1].x) / 2,
                  min(this.pins[0].y, this.pins[1].y) - p * 0.65);
    }
  };
  return bbAddPart(part);
}

// --- push button (momentary) ------------------------------------------------

/**
 * A tactile push button. Real ones straddle the center channel, so give it a
 * pin in the top half and one in the bottom half of the same or a nearby column.
 *
 * @param {string} o.key  optional keyboard key that also presses it
 */
function bbButton(o) {
  const a = bbPin(o.a);
  const b = bbPin(o.b);
  const part = {
    type: 'button',
    pins: [a, b],
    color: o.color || 'red',
    label: o.label || '',
    key: o.key || null,
    pressed: false,
    branches: function () {
      if (!this.pressed) return [];   // open contacts: no branch at all
      return [{a: this.pins[0].net, b: this.pins[1].net, R: 0.02, vf: 0, oneWay: false}];
    },
    hit: function (mx, my) {
      const c = this.center();
      return dist(mx, my, c.x, c.y) < BB.pitch * 1.4;
    },
    center: function () {
      return {x: (this.pins[0].x + this.pins[1].x) / 2,
              y: (this.pins[0].y + this.pins[1].y) / 2};
    },
    render: function () {
      const p = BB.pitch;
      const c = this.center();
      const s = p * 2.4;
      push();
      // Body
      stroke('gray');
      strokeWeight(1);
      fill('dimgray');
      rect(c.x - s / 2, c.y - s / 2, s, s, s * 0.15);
      // Cap - keeps its color when held down but shrinks and darkens, so it
      // reads as "pressed in" while still identifying which button it is.
      noStroke();
      if (this.pressed) {
        fill(lerpColor(color(this.color), color('black'), 0.35));
        circle(c.x, c.y, s * 0.6);
        noFill();
        stroke(255, 255, 255, 140);
        strokeWeight(max(1, p * 0.08));
        circle(c.x, c.y, s * 0.72);
      } else {
        fill(this.color);
        circle(c.x, c.y, s * 0.72);
      }
      pop();
      bbDrawLabel(this.label + (this.key ? ' [' + this.key + ']' : ''),
                  c.x, c.y - s * 0.62);
    }
  };
  return bbAddPart(part);
}

// --- slide switch (latching) ------------------------------------------------

function bbSwitch(o) {
  const a = bbPin(o.a);
  const b = bbPin(o.b);
  const part = {
    type: 'switch',
    pins: [a, b],
    label: o.label || '',
    key: o.key || null,
    closed: o.closed === true,
    branches: function () {
      if (!this.closed) return [];
      return [{a: this.pins[0].net, b: this.pins[1].net, R: 0.02, vf: 0, oneWay: false}];
    },
    // Hit test matches the drawn body rather than a generous circle around it.
    // Two switches a few rows apart have overlapping circular zones, and one
    // click would then toggle both of them.
    hit: function (mx, my) {
      const c = this.center();
      const p = BB.pitch;
      return Math.abs(mx - c.x) <= p * 1.4 && Math.abs(my - c.y) <= p * 0.9;
    },
    center: function () {
      return {x: (this.pins[0].x + this.pins[1].x) / 2,
              y: (this.pins[0].y + this.pins[1].y) / 2};
    },
    render: function () {
      const p = BB.pitch;
      const c = this.center();
      const w = p * 2.6, h = p * 1.5;
      push();
      stroke('gray');
      strokeWeight(1);
      fill('gainsboro');
      rect(c.x - w / 2, c.y - h / 2, w, h, h * 0.2);
      noStroke();
      fill(this.closed ? 'limegreen' : 'darkgray');
      // The actuator slides to the side that is "on"
      rect(c.x + (this.closed ? 0 : -w * 0.45), c.y - h * 0.32, w * 0.45, h * 0.64, h * 0.15);
      pop();
      bbDrawLabel(this.label + (this.key ? ' [' + this.key + ']' : ''),
                  c.x, c.y - h * 0.8);
    }
  };
  return bbAddPart(part);
}

// --- capacitor --------------------------------------------------------------

/** An electrolytic capacitor. Open circuit at DC - which is the lesson. */
function bbCapacitor(o) {
  const a = bbPin(o.a);
  const b = bbPin(o.b);
  const part = {
    type: 'capacitor',
    pins: [a, b],
    uf: o.uf === undefined ? 10 : o.uf,
    label: o.label || '',
    branches: function () { return []; },
    render: function () {
      const p = BB.pitch;
      const len = bbBeginBody(this.pins[0], this.pins[1]);
      const d = min(len * 0.6, p * 2.0);
      bbDrawLeads(len, d);
      noStroke();
      fill('darkslateblue');
      circle(0, 0, d);
      fill('lightgray');
      arc(0, 0, d, d, HALF_PI, -HALF_PI);
      bbEndBody();
      bbDrawLabel((this.label ? this.label + ' ' : '') + this.uf + 'µF',
                  (this.pins[0].x + this.pins[1].x) / 2,
                  min(this.pins[0].y, this.pins[1].y) - p * 0.65);
    }
  };
  return bbAddPart(part);
}

// --- diode ------------------------------------------------------------------

function bbDiode(o) {
  const anode = bbPin(o.anode);
  const cathode = bbPin(o.cathode);
  const part = {
    type: 'diode',
    pins: [anode, cathode],
    label: o.label || '',
    vf: o.vf === undefined ? 0.7 : o.vf,
    branches: function () {
      return [{a: this.pins[0].net, b: this.pins[1].net, R: 5, vf: this.vf, oneWay: true}];
    },
    render: function () {
      const p = BB.pitch;
      const len = bbBeginBody(this.pins[0], this.pins[1]);
      const bodyLen = min(len * 0.5, p * 2.4);
      const bodyH = p * 0.7;
      bbDrawLeads(len, bodyLen);
      noStroke();
      fill('black');
      rect(-bodyLen / 2, -bodyH / 2, bodyLen, bodyH, bodyH * 0.2);
      fill('silver');   // the band marks the cathode
      rect(bodyLen * 0.22, -bodyH / 2, bodyLen * 0.15, bodyH);
      bbEndBody();
      bbDrawLabel(this.label, (this.pins[0].x + this.pins[1].x) / 2,
                  min(this.pins[0].y, this.pins[1].y) - p * 0.65);
    }
  };
  return bbAddPart(part);
}

// --- potentiometer ----------------------------------------------------------

/**
 * A potentiometer wired as a variable resistor. Drive `.setting` (0..1) from a
 * slider in the control region.
 */
function bbPotentiometer(o) {
  const a = bbPin(o.a);
  const b = bbPin(o.b);
  const part = {
    type: 'pot',
    pins: [a, b],
    maxOhms: o.maxOhms === undefined ? 10000 : o.maxOhms,
    setting: o.setting === undefined ? 0.5 : o.setting,
    label: o.label || '',
    ohms: function () { return max(1, this.maxOhms * this.setting); },
    branches: function () {
      return [{a: this.pins[0].net, b: this.pins[1].net, R: this.ohms(), vf: 0, oneWay: false}];
    },
    render: function () {
      const p = BB.pitch;
      const len = bbBeginBody(this.pins[0], this.pins[1]);
      const d = min(len * 0.7, p * 2.6);
      bbDrawLeads(len, d);
      stroke('gray');
      strokeWeight(1);
      fill('cornflowerblue');
      rect(-d / 2, -d / 2, d, d, d * 0.15);
      // Shaft pointer showing the wiper position
      stroke('white');
      strokeWeight(max(1.5, p * 0.13));
      const ang = map(this.setting, 0, 1, -PI * 0.75, PI * 0.75);
      line(0, 0, sin(ang) * d * 0.35, -cos(ang) * d * 0.35);
      bbEndBody();
      bbDrawLabel((this.label ? this.label + ' ' : '') + bbFormatOhms(Math.round(this.ohms())),
                  (this.pins[0].x + this.pins[1].x) / 2,
                  min(this.pins[0].y, this.pins[1].y) - p * 0.9);
    }
  };
  return bbAddPart(part);
}

// --- buzzer -----------------------------------------------------------------

function bbBuzzer(o) {
  const a = bbPin(o.a);
  const b = bbPin(o.b);
  const part = {
    type: 'buzzer',
    pins: [a, b],
    label: o.label || '',
    branches: function () {
      return [{a: this.pins[0].net, b: this.pins[1].net, R: 300, vf: 0, oneWay: false}];
    },
    render: function () {
      const p = BB.pitch;
      const c = {x: (this.pins[0].x + this.pins[1].x) / 2,
                 y: (this.pins[0].y + this.pins[1].y) / 2};
      const d = p * 2.6;
      push();
      stroke(60);
      strokeWeight(max(1.5, p * 0.14));
      line(this.pins[0].x, this.pins[0].y, c.x, c.y);
      line(this.pins[1].x, this.pins[1].y, c.x, c.y);
      noStroke();
      fill('black');
      circle(c.x, c.y, d);
      fill('dimgray');
      circle(c.x, c.y, d * 0.25);
      // Sound waves while it is being driven. Kept close to the body: arcs that
      // sweep a couple of columns out read as noise on a crowded board and can
      // hide a neighbouring component entirely.
      if (Math.abs(this.current) * 1000 > 1) {
        noFill();
        stroke('gray');
        strokeWeight(max(1, p * 0.09));
        for (let i = 1; i <= 3; i++) {
          const r = d * (0.45 + i * 0.16) + sin(bbTime * 8 + i) * p * 0.08;
          arc(c.x, c.y, r * 2, r * 2, -PI * 0.26, PI * 0.26);
        }
      }
      pop();
      bbDrawLabel(this.label, c.x, c.y - d * 0.7);
    }
  };
  return bbAddPart(part);
}

// --- NPN transistor ---------------------------------------------------------

/**
 * An NPN transistor used as a switch - the classic "small current controls a
 * big current" demonstration. Collector-emitter conducts once base current
 * flows, which the multi-pass solver discovers on its own.
 */
function bbTransistor(o) {
  const c = bbPin(o.collector);
  const b = bbPin(o.base);
  const e = bbPin(o.emitter);
  const part = {
    type: 'npn',
    pins: [c, e, b],
    collector: c, base: b, emitter: e,
    label: o.label || '',
    baseOn: false,
    branches: function () {
      // The base-emitter junction is a forward drop plus a small series
      // resistance. Keeping that resistance low matters: a real BJT's base sits
      // near 0.7-0.8 V however hard it is driven, and a large series resistance
      // would let the displayed base voltage climb to a couple of volts, which
      // is a number no student would ever measure on a bench.
      const out = [{a: this.base.net, b: this.emitter.net, R: 120, vf: 0.7, oneWay: true}];
      if (this.baseOn) {
        out.push({a: this.collector.net, b: this.emitter.net, R: 0.2, vf: 0.2, oneWay: true});
      }
      return out;
    },
    render: function () {
      const p = BB.pitch;
      const cx = (this.collector.x + this.base.x + this.emitter.x) / 3;
      const cy = (this.collector.y + this.base.y + this.emitter.y) / 3 - p * 0.9;
      push();
      stroke(60);
      strokeWeight(max(1.5, p * 0.14));
      for (const pin of [this.collector, this.base, this.emitter]) {
        line(pin.x, pin.y, cx, cy);
      }
      noStroke();
      fill(this.baseOn ? 'darkslategray' : 'black');
      arc(cx, cy, p * 2.6, p * 2.6, PI, TWO_PI);
      rect(cx - p * 1.3, cy, p * 2.6, p * 0.5);
      pop();
      bbDrawLabel(this.label, cx, cy - p * 1.5);
    }
  };
  return bbAddPart(part);
}

// ============================================================================
// SECTION 4 - Circuit solver
// ============================================================================

/**
 * Solve the circuit for this frame: node voltages everywhere, current through
 * every part. Call once per draw(), before rendering.
 *
 * @param {boolean} running  advance the animation clock (default: keep current state)
 */
function bbSolve(running) {
  if (running !== undefined) bbRunning = running;
  if (bbRunning) bbTime += deltaTime / 1000;

  // Fixed nodes come from the battery: everything else is solved relative to them.
  const fixed = {};
  for (const part of bbParts) {
    if (part.type === 'battery' && part.on) {
      fixed[part.pins[0].net] = part.volts;
      fixed[part.pins[1].net] = 0;
      if (bbGroundNet === null) bbGroundNet = part.pins[1].net;
    }
  }

  // Nonlinear parts (diodes, LEDs, transistors) are decided by trial: assume a
  // state, solve, check whether the result is consistent, adjust, repeat. Small
  // circuits settle in two or three passes; the cap is a safety net.
  let openBranches = {};
  let voltages = {};
  for (let pass = 0; pass < BB_MAX_PASSES; pass++) {
    const branches = bbCollectBranches(openBranches);
    voltages = bbSolveNodes(branches, fixed);
    const changed = bbUpdateNonlinearStates(branches, voltages, openBranches);
    if (!changed) break;
  }

  bbNets = voltages;
  bbApplyCurrents(bbCollectBranches(openBranches), voltages);
}

/** Gather every conducting branch, skipping ones ruled open by a previous pass. */
function bbCollectBranches(openBranches) {
  const list = [];
  for (let i = 0; i < bbParts.length; i++) {
    const part = bbParts[i];
    const bs = part.branches();
    for (let j = 0; j < bs.length; j++) {
      const key = i + ':' + j;
      if (openBranches[key]) continue;
      const br = bs[j];
      list.push({a: br.a, b: br.b, R: max(br.R, 1e-3), vf: br.vf || 0,
                 oneWay: !!br.oneWay, part: part, key: key, index: j});
    }
  }
  return list;
}

/**
 * Node-voltage analysis.
 *
 * Each branch carries I = (Va - Vb - vf) / R from a to b. Applying Kirchhoff's
 * current law at every node with an unknown voltage gives one linear equation
 * per unknown; nodes the battery pins down are known, so their terms move to
 * the right-hand side. Solving the system gives every node voltage at once,
 * which is why series and parallel currents come out right instead of being
 * approximated branch by branch.
 */
function bbSolveNodes(branches, fixed) {
  // Index every net that appears anywhere in the circuit.
  const nets = {};
  const addNet = n => { if (nets[n] === undefined) nets[n] = -1; };
  for (const br of branches) { addNet(br.a); addNet(br.b); }
  for (const n in fixed) addNet(n);

  const unknowns = [];
  for (const n in nets) {
    if (fixed[n] === undefined) { nets[n] = unknowns.length; unknowns.push(n); }
  }

  const N = unknowns.length;
  const V = {};
  for (const n in fixed) V[n] = fixed[n];
  if (N === 0) return V;

  // A * v = rhs
  const A = [];
  const rhs = new Array(N).fill(0);
  for (let i = 0; i < N; i++) A.push(new Array(N).fill(0));

  // A floating net with no path to ground makes the matrix singular. A tiny
  // leakage conductance to ground pins it at ~0 V instead of blowing up.
  for (let i = 0; i < N; i++) A[i][i] += 1e-9;

  for (const br of branches) {
    const G = 1 / br.R;
    const ia = nets[br.a], ib = nets[br.b];
    const aFixed = fixed[br.a] !== undefined;
    const bFixed = fixed[br.b] !== undefined;

    if (!aFixed) {
      A[ia][ia] += G;
      if (bFixed) rhs[ia] += G * fixed[br.b];
      else A[ia][ib] -= G;
      rhs[ia] += G * br.vf;
    }
    if (!bFixed) {
      A[ib][ib] += G;
      if (aFixed) rhs[ib] += G * fixed[br.a];
      else A[ib][ia] -= G;
      rhs[ib] -= G * br.vf;
    }
  }

  const sol = bbGaussianSolve(A, rhs);
  for (let i = 0; i < N; i++) V[unknowns[i]] = sol[i];
  return V;
}

/** Gaussian elimination with partial pivoting. */
function bbGaussianSolve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => row.concat([b[i]]));
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    if (Math.abs(M[piv][col]) < 1e-14) continue;   // singular column: leave at 0
    const tmp = M[col]; M[col] = M[piv]; M[piv] = tmp;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      if (!f) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    x[i] = Math.abs(M[i][i]) < 1e-14 ? 0 : M[i][n] / M[i][i];
  }
  return x;
}

/**
 * Check every one-way branch against the solution and flip the ones that got it
 * wrong: a conducting diode carrying negative current must open, and an open
 * diode with enough forward voltage across it must close.
 *
 * @returns {boolean} true if anything changed, meaning another pass is needed
 */
function bbUpdateNonlinearStates(branches, V, openBranches) {
  let changed = false;
  const current = {};

  for (const br of branches) {
    const va = V[br.a] === undefined ? 0 : V[br.a];
    const vb = V[br.b] === undefined ? 0 : V[br.b];
    const i = (va - vb - br.vf) / br.R;
    current[br.key] = i;
    if (br.oneWay && i < -1e-9) { openBranches[br.key] = true; changed = true; }
  }

  // Re-close any branch whose forward bias now exceeds its threshold.
  for (let i = 0; i < bbParts.length; i++) {
    const part = bbParts[i];
    const bs = part.branches();
    for (let j = 0; j < bs.length; j++) {
      const key = i + ':' + j;
      if (!openBranches[key]) continue;
      const br = bs[j];
      const va = V[br.a] === undefined ? 0 : V[br.a];
      const vb = V[br.b] === undefined ? 0 : V[br.b];
      if (va - vb > (br.vf || 0) + 1e-6) { delete openBranches[key]; changed = true; }
    }
  }

  // A transistor turns on when base CURRENT flows, not merely when the
  // base-emitter voltage looks high enough. The distinction matters: an
  // unconnected base-emitter junction floats to exactly its own forward voltage
  // while carrying no current at all, and a voltage test would read that as
  // "on" and switch a transistor nobody wired up.
  for (let i = 0; i < bbParts.length; i++) {
    const part = bbParts[i];
    if (part.type !== 'npn') continue;
    const baseCurrent = current[i + ':0'] || 0;   // branch 0 is base-emitter
    const on = baseCurrent > 1e-6;                // 1 microamp
    if (on !== part.baseOn) { part.baseOn = on; changed = true; }
  }

  return changed;
}

/** Copy the solved branch currents back onto their parts, in amps. */
function bbApplyCurrents(branches, V) {
  for (const part of bbParts) { part.current = 0; part.conducting = false; }
  for (const br of branches) {
    const va = V[br.a] === undefined ? 0 : V[br.a];
    const vb = V[br.b] === undefined ? 0 : V[br.b];
    let i = (va - vb - br.vf) / br.R;
    if (br.oneWay && i < 0) i = 0;
    // A part's reported current is its largest branch current: for a transistor
    // that is the collector current, which is the one worth showing.
    if (Math.abs(i) > Math.abs(br.part.current)) br.part.current = i;
    if (Math.abs(i) > 1e-6) br.part.conducting = true;
  }

  // The battery reports total supply current - everything leaving its positive
  // terminal. That is the number a parallel-circuit lesson needs, because it
  // should equal the sum of the branch currents.
  for (const part of bbParts) {
    if (part.type !== 'battery' || !part.on) continue;
    const posNet = part.pins[0].net;
    let total = 0;
    for (const br of branches) {
      const va = V[br.a] === undefined ? 0 : V[br.a];
      const vb = V[br.b] === undefined ? 0 : V[br.b];
      let i = (va - vb - br.vf) / br.R;
      if (br.oneWay && i < 0) i = 0;
      if (br.a === posNet) total += i;
      else if (br.b === posNet) total -= i;
    }
    part.current = total;
    part.conducting = Math.abs(total) > 1e-6;
  }
}

// ============================================================================
// SECTION 5 - Rendering parts and animating current
// ============================================================================

/**
 * Draw every part. Wires go down first so component bodies sit on top of them,
 * the way they do on a real board.
 */
function bbDrawParts() {
  for (const part of bbParts) if (part.type === 'wire') part.render();
  for (const part of bbParts) if (part.type !== 'wire') part.render();
}

/**
 * A wire with dots showing current flow. Dot speed is proportional to current,
 * so a student can see a dim LED's smaller current directly - the animation
 * carries information rather than just decoration.
 *
 * Dots move from the higher-voltage pin to the lower one (conventional
 * current). Set BB.electronFlow = true to reverse them.
 */
function bbDrawAnimatedWire(p1, p2, current, col, arcUnits) {
  const p = BB.pitch;
  const bow = (arcUnits || 0) * p;

  push();
  noFill();
  stroke(col || 'green');
  strokeWeight(max(2, p * 0.22));
  if (bow === 0) {
    line(p1.x, p1.y, p2.x, p2.y);
  } else {
    // Quadratic bow, pulled perpendicular to the wire's own direction
    const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = max(1, sqrt(dx * dx + dy * dy));
    const cx = mx - (dy / len) * bow * 2, cy = my + (dx / len) * bow * 2;
    beginShape();
    vertex(p1.x, p1.y);
    quadraticVertex(cx, cy, p2.x, p2.y);
    endShape();
  }

  // Insulation ends where the wire enters the hole
  noStroke();
  fill(col || 'green');
  circle(p1.x, p1.y, p * 0.5);
  circle(p2.x, p2.y, p * 0.5);

  const mA = Math.abs(current || 0) * 1000;
  if (mA > 0.05) {
    // 20 mA - a fully lit LED - moves dots at about one hole per second.
    const pixelsPerSecond = constrain(mA / 20, 0.15, 3) * p * 3.5;
    const spacing = p * 1.6;
    let a = p1, b = p2;
    const forward = (current > 0) !== !!BB.electronFlow;
    if (!forward) { a = p2; b = p1; }
    const d = dist(a.x, a.y, b.x, b.y);
    const offset = (bbTime * pixelsPerSecond) % spacing;
    fill(BB.electronFlow ? 'deepskyblue' : 'orangered');
    noStroke();
    for (let s = offset; s < d; s += spacing) {
      const t = s / d;
      circle(lerp(a.x, b.x, t), lerp(a.y, b.y, t), p * 0.42);
    }
  }
  pop();
}

/**
 * Compatible with drawAnimatedWire() from p5-circuit-lib.js, for schematic
 * drawings that are not placed on breadboard holes.
 */
function drawAnimatedWire(x1, y1, x2, y2, speed, spacing) {
  push();
  stroke('black');
  strokeWeight(typeof lineWidth === 'undefined' ? 4 : lineWidth);
  line(x1, y1, x2, y2);
  const spacingPixels = spacing * 50;
  const d = dist(x1, y1, x2, y2);
  if (spacingPixels > 0 && d > 0) {
    noStroke();
    fill('red');
    const first = (bbTime * speed) % spacingPixels;
    for (let s = first; s < d; s += spacingPixels) {
      const t = s / d;
      circle(lerp(x1, x2, t), lerp(y1, y2, t), 8);
    }
  }
  pop();
}

// ============================================================================
// SECTION 6 - Mouse and keyboard interaction
// ============================================================================

/**
 * Route a click to any button or switch under the cursor. Call from the sim's
 * mousePressed(). Buttons are momentary, so also call bbReleaseAll() from
 * mouseReleased().
 *
 * @returns {boolean} true if a part was hit (useful for suppressing other handling)
 */
function bbMousePressed(mx, my) {
  const x = mx === undefined ? mouseX : mx;
  const y = my === undefined ? mouseY : my;
  let hit = false;
  for (const part of bbParts) {
    if (!part.hit || !part.hit(x, y)) continue;
    if (part.type === 'button') { part.pressed = true; hit = true; }
    if (part.type === 'switch') { part.closed = !part.closed; hit = true; }
  }
  return hit;
}

/** Release every momentary button. Call from mouseReleased(). */
function bbReleaseAll() {
  for (const part of bbParts) if (part.type === 'button') part.pressed = false;
}

/** Press buttons and flip switches bound to a keyboard key. Call from keyPressed(). */
function bbKeyPressed(k) {
  const kk = String(k === undefined ? key : k).toLowerCase();
  for (const part of bbParts) {
    if (!part.key || String(part.key).toLowerCase() !== kk) continue;
    if (part.type === 'button') part.pressed = true;
    if (part.type === 'switch') part.closed = !part.closed;
  }
}

/** Release keyboard-held buttons. Call from keyReleased(). */
function bbKeyReleased(k) {
  const kk = String(k === undefined ? key : k).toLowerCase();
  for (const part of bbParts) {
    if (part.type === 'button' && part.key &&
        String(part.key).toLowerCase() === kk) part.pressed = false;
  }
}

/** True when the cursor is over any clickable part - use it to set the cursor. */
function bbHovering(mx, my) {
  const x = mx === undefined ? mouseX : mx;
  const y = my === undefined ? mouseY : my;
  return bbParts.some(p => p.hit && p.hit(x, y));
}

// ============================================================================
// SECTION 7 - Scope (rolling strip chart)
// ============================================================================

let bbScopeTraces = [];
let bbScopeSamples = 0;
const BB_SCOPE_POINTS = 220;

/**
 * Declare a scope trace. Call once per trace in setup().
 *
 * @param {string}   o.label  legend text, e.g. 'LED current'
 * @param {function} o.get    called every frame, returns the value to plot
 * @param {string}   o.color  line color
 * @param {number}   o.max    top of the y axis
 * @param {string}   o.unit   axis unit, e.g. 'mA' or 'V'
 */
function bbAddTrace(o) {
  const t = {label: o.label || '', get: o.get, color: o.color || 'red',
             max: o.max === undefined ? 10 : o.max, min: o.min || 0,
             unit: o.unit || '', data: []};
  bbScopeTraces.push(t);
  return t;
}

/** Sample every trace. Call once per frame, after bbSolve(). */
function bbSampleTraces() {
  for (const t of bbScopeTraces) {
    t.data.push(t.get());
    if (t.data.length > BB_SCOPE_POINTS) t.data.shift();
  }
  bbScopeSamples++;
}

/** Throw away the history - wire this to the Reset button. */
function bbClearTraces() {
  for (const t of bbScopeTraces) t.data = [];
  bbScopeSamples = 0;
}

/** Axis tick text. Halves stay visible: a "22.5" tick must not round to "23". */
function bbAxisLabel(v) {
  return (Math.abs(v - Math.round(v)) < 1e-6) ? nf(v, 0, 0) : nf(v, 0, 1);
}

/**
 * Draw the scope panel: axes, gridlines, one line per trace, and a legend.
 * Traces share the x axis (time) and each is scaled to its own max, with the
 * unit printed in the legend so the two y scales cannot be confused.
 */
function bbDrawScope(x, y, w, h, title) {
  push();
  rectMode(CORNER);
  // Two traces get two y axes - a current in mA and a voltage in V cannot share
  // one scale, and a single unlabelled axis would invite students to read the
  // wrong numbers off the wrong line.
  const padL = 44, padR = (bbScopeTraces.length > 1) ? 44 : 12, padT = 26, padB = 22;
  const plotX = x + padL, plotY = y + padT;
  const plotW = max(10, w - padL - padR), plotH = max(10, h - padT - padB);

  // Panel
  stroke('silver');
  strokeWeight(1);
  fill('white');
  rect(x, y, w, h, 4);

  // Title
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(14);
  text(title || 'Voltage and Current', x + w / 2, y + 5);

  // Gridlines and y labels, normalized 0-100% so both traces share one grid
  stroke('gainsboro');
  strokeWeight(1);
  for (let i = 0; i <= 4; i++) {
    const gy = plotY + (plotH * i) / 4;
    line(plotX, gy, plotX + plotW, gy);
  }
  stroke('gray');
  line(plotX, plotY, plotX, plotY + plotH);
  line(plotX, plotY + plotH, plotX + plotW, plotY + plotH);

  // Left axis = first trace, right axis = second trace, each in its own color
  noStroke();
  textSize(11);
  if (bbScopeTraces.length > 0) {
    const t0 = bbScopeTraces[0];
    fill(t0.color);
    textAlign(RIGHT, CENTER);
    for (let i = 0; i <= 4; i++) {
      const v = t0.max - ((t0.max - t0.min) * i) / 4;
      text(bbAxisLabel(v) + (i === 0 ? ' ' + t0.unit : ''), plotX - 4,
           plotY + (plotH * i) / 4);
    }
  }
  if (bbScopeTraces.length > 1) {
    const t1 = bbScopeTraces[1];
    fill(t1.color);
    textAlign(LEFT, CENTER);
    for (let i = 0; i <= 4; i++) {
      const v = t1.max - ((t1.max - t1.min) * i) / 4;
      text(bbAxisLabel(v) + (i === 0 ? ' ' + t1.unit : ''), plotX + plotW + 4,
           plotY + (plotH * i) / 4);
    }
  }
  noStroke();
  fill('gray');
  textAlign(CENTER, TOP);
  textSize(11);
  text('time', plotX + plotW / 2, plotY + plotH + 5);

  // Traces. The newest sample is pinned to the right edge and older samples
  // trail off to the left, the way a chart recorder works: the line grows in
  // from the right instead of sitting squashed against the left axis while the
  // buffer fills.
  const dx = plotW / (BB_SCOPE_POINTS - 1);
  for (const t of bbScopeTraces) {
    if (t.data.length < 2) continue;
    noFill();
    stroke(t.color);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i < t.data.length; i++) {
      const px = plotX + plotW - (t.data.length - 1 - i) * dx;
      const py = map(constrain(t.data[i], t.min, t.max), t.min, t.max,
                     plotY + plotH, plotY);
      vertex(px, py);
    }
    endShape();
  }

  // Legend with each trace's live value - the number students actually read.
  // It sits on a white backing so a trace crossing beneath it stays legible,
  // and each entry drops the trace name before it would spill off the panel,
  // because a clipped legend is worse than a short one.
  if (bbScopeTraces.length && plotW > 90) {
    textSize(12);
    const entries = bbScopeTraces.map(t => {
      const last = t.data.length ? t.data[t.data.length - 1] : 0;
      const value = nf(last, 0, 1) + ' ' + t.unit;
      const full = t.label + ': ' + value;
      return {color: t.color, text: (textWidth(full) + 34 <= plotW) ? full : value};
    });
    let legendW = 0;
    for (const e of entries) legendW = max(legendW, textWidth(e.text) + 34);
    noStroke();
    fill(255, 255, 255, 225);
    rect(plotX + 4, plotY + 3, min(legendW, plotW - 8), entries.length * 17 + 5, 3);
    textAlign(LEFT, CENTER);
    let ly = plotY + 14;
    for (const e of entries) {
      fill(e.color);
      rect(plotX + 9, ly - 2, 14, 3);
      fill('black');
      text(e.text, plotX + 28, ly);
      ly += 17;
    }
  }
  pop();
}
