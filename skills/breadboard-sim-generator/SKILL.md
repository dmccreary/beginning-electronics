---
name: breadboard-sim-generator
description: Creates interactive p5.js MicroSims drawn on a solderless breadboard - components placed in real tie-point holes, animated current flowing along the jumper wires, on/off digital circuit simulation, and an optional voltage/current scope panel. Use this skill whenever the user asks for a breadboard, a circuit simulation, a wiring diagram, or a MicroSim involving LEDs, resistors, push buttons, switches, capacitors, diodes, potentiometers, buzzers, or transistors - and also when they describe a hands-on electronics lab, an Arduino or Raspberry Pi wiring exercise, "show current flowing", "light the LED when the button is pressed", or any beginning-electronics concept that students would normally build by hand. Prefer this over the general microsim-generator for anything that would sit on a breadboard.
model: opus
---

# Breadboard MicroSim Generator

## Overview

This skill builds MicroSims whose drawing region is a solderless breadboard. A
student sees the same thing they would see on their desk: a board, components
pushed into numbered holes, jumper wires, and current visibly moving along those
wires when a button closes the circuit.

Everything reusable lives in `assets/breadboard-lib.js` - geometry, board
rendering, the component catalog, a real node-voltage circuit solver, wire
animation, and a scope panel. **You copy that file into the sim directory and
write only the circuit.** A typical sim is 120-180 lines, most of it the
standard MicroSim scaffolding.

Two features define the format, and every sim should have both:

1. **A circuit the learner operates** - buttons and switches on the board itself,
   on the left side of the drawing region.
2. **An optional scope on the right** - voltage and current plotted over time,
   toggled by a checkbox, so the numbers behind the animation are visible.

## When to Use This Skill

Use it for anything a beginner would breadboard: LED and resistor circuits,
push-button and switch logic, series vs parallel comparisons, Ohm's law
exploration, voltage dividers, transistor switching, RC intuition, and the
wiring half of any microcontroller lesson.

Route elsewhere when the request is about a **schematic symbol diagram** rather
than a physical board (use `microsim-generator` → `p5-guide.md` with
`p5-circuit-lib.js`), or about **plotting data** with no circuit
(`chartjs-guide.md` / `plotly-guide.md`).

---

## Step 0: Set Paths and Check Prerequisites

```bash
PROJECT=$(python3 -c "
import os, sys
d = os.path.abspath('.')
while d != os.path.dirname(d):
    if os.path.isfile(os.path.join(d, 'mkdocs.yml')): print(d); sys.exit()
    d = os.path.dirname(d)
print('ERROR: mkdocs.yml not found', file=sys.stderr); sys.exit(1)
")

SKILL="$PROJECT/skills/breadboard-sim-generator"
```

This skill lives **inside the Beginning Electronics repository**, not in the
shared `claude-skills` repo, because the breadboard format is specific to this
book. `$SKILL` is therefore always a path within `$PROJECT`.

Warn the user if `$PROJECT/docs/sims` does not exist - the sim has nowhere to go.
If `$SKILL` does not exist, you are being run against a different project and the
breadboard library is not available there.

---

## Step 1: Instructional Design Checkpoint

Answer these before writing code, and put the answers in your response. A
breadboard sim is expensive to build; being wrong about the objective is the
costly mistake, not being wrong about a hole number.

1. **Learning objective**, one sentence: "Students will be able to [verb]
   [concept] by [interaction]."
2. **Bloom level**, and whether the interaction matches it. Understand-level
   objectives want step-through and visible values; Apply-level objectives want
   parameter sliders and immediate feedback. Continuous animation with nothing
   to manipulate serves neither.
3. **What must the learner see?** Not "current flowing" but "that the same
   current passes through the resistor and the LED, because they are in series."
4. **What can they change, and what should that reveal?** Every control earns
   its place by revealing something. Aim for 2-5 controls total.

If the request asks for animation at an Understand level with nothing to
manipulate, say so and propose a step-through or a comparison instead.

---

## Step 2: Circuit Design Checkpoint

This is the breadboard-specific planning step, and skipping it is what produces
sims where nothing lights up. Write the netlist out **before** writing code.

### 2.1 Draw the current path in words

Trace the loop from the positive rail back to the negative rail, naming every
hole:

```
T+3 (rail) → wire → a3 → button SW1 (e3/f3) → j3 → R1 220Ω → j6
           → LED D1 (g6 → g8) → j8 → wire → B-8 (ground rail)
```

If you cannot write this line, you cannot write the circuit.

### 2.2 Check the connectivity rules

The whole point of a breadboard is which holes are already connected. Get this
wrong and the circuit is silently open or silently shorted:

| Rule | Consequence |
|------|-------------|
| Rows **a-e** of one column are one net; rows **f-j** are a *different* net | A part with both pins in `a5` and `c5` is **shorted out** - it does nothing |
| The center channel separates the two halves | A part spanning `e5`→`f5` is a real connection between two nets |
| Each power rail is one net along the whole board | `T+1` and `T+19` are the same node |
| Top rails and bottom rails are **not** connected | Add a jumper (e.g. `T-2`→`B-2`), exactly as on a real board |
| Every rail's 6th hole is missing (holes come in groups of five) | The library snaps such a pin back one column automatically |

### 2.3 Size the resistor

Compute the current before you pick a value, and put the arithmetic in a code
comment. `I = (Vsupply - Vf) / R`. A red LED at 5 V through 220 Ω draws
(5 − 1.9) / 235 ≈ 13 mA, which is right. The same LED with no resistor draws
hundreds of milliamps - the sim will happily show that, and if that is the
lesson, make it the lesson deliberately.

### 2.4 Budget the board

20 columns is the default and fits comfortably. Use 30 only when the circuit
genuinely needs the width - at 30 columns on a narrow canvas the hole pitch
drops below 12 px and the labels get cramped.

---

## Step 3: Scaffold the Sim Directory

```bash
SIM=<sim-id-in-kebab-case>
mkdir -p $PROJECT/docs/sims/$SIM
cp $SKILL/assets/breadboard-lib.js $PROJECT/docs/sims/$SIM/
```

Then create these three files from `assets/`, substituting the sim name and
title:

| File | Template |
|------|----------|
| `main.html` | `assets/main-template.html` |
| `index.md` | `assets/index-template.md` |
| `metadata.json` | `assets/metadata-template.json` |

`main.html` must load `breadboard-lib.js` **before** the sim's own script:

```html
<script src="breadboard-lib.js"></script>
<script src="my-sim.js"></script>
```

`breadboard-lib.js` is copied per sim rather than shared from one location, so
each sim stays self-contained and keeps working when copied into the p5.js
editor or another project.

---

## Step 4: Write the Sim's .js File

**Start from `assets/examples/button-led-breadboard.js`.** It is a working
reference with the structure every breadboard sim shares; change the circuit in
`setup()` and the traces, and leave the scaffolding alone.

Read `references/breadboard-lib-api.md` for the full API and
`references/component-catalog.md` for each component's parameters and
electrical behavior.

### 4.1 The required skeleton

```javascript
// <Title> - Breadboard MicroSim
// CANVAS_HEIGHT: 600

let containerWidth;
let canvasWidth = 800;
let drawHeight = 520;          // board + scope; never put controls here
let controlHeight = 80;        // (rows x 35) + 10
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 20;
let sliderLeftMargin = 200;
let boardTop = 48;             // room for the title
let readoutHeight = 52;        // room for the numeric readout under the board
let isRunning = false;         // every MicroSim starts paused

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));   // never canvas.parent('main')

  // controls first...

  // Sizes here do not matter - draw() re-lays-out every frame. This call exists
  // to fix the column count before any hole address is parsed against it.
  bbLayout(margin, boardTop, 400, 300, 20);
  bbReset();                   // clears parts AND traces
  // ...then the circuit, added in current-path order, then the scope traces
  describe('...', LABEL);
}

function draw() {
  updateCanvasSize();
  // standard aliceblue drawing region + white control region
  // title
  const showScope = scopeCheckbox.checked() && canvasWidth >= 640;
  const boardW = showScope ? (canvasWidth - margin * 3) * 0.60
                           : (canvasWidth - margin * 2);
  bbLayout(margin, boardTop, boardW, drawHeight - boardTop - readoutHeight, 20);
  bbSolve(isRunning);
  bbDrawBoard();
  bbDrawParts();
  if (isRunning) bbSampleTraces();
  if (showScope) bbDrawScope(...);
  // numeric readout, then control labels
}

function mousePressed()  { bbMousePressed(); }
function mouseReleased() { bbReleaseAll(); }
function keyPressed()    { bbKeyPressed(); }
function keyReleased()   { bbKeyReleased(); }
```

### 4.2 Layout rules that are specific to breadboards

- **`bbLayout()` takes a width *and* a height.** It picks the hole pitch that
  fits both and centers the board in what is left. Passing only a width is how
  bottom rows end up clipped below `drawHeight`.
- **Leave `boardTop` ≈ 48 px** for the title and `readoutHeight` ≈ 52 px for the
  numeric readout. The library reserves the left strip for the supply badge on
  its own - do not budget for it.
- **`drawHeight` of 500-560** gives a comfortable pitch. Lower than 420 and the
  hole labels stop being readable.
- **Below ~640 px canvas width, hide the scope** and give the board the full
  width. Two panels do not fit on a phone, and the circuit is the point.

### 4.3 Make the animation carry information

Dot speed on a wire is proportional to the current through it, so a dim LED
visibly moves fewer dots than a bright one. That is the payoff of solving the
circuit properly instead of faking it - do not add decorative motion that
contradicts it. Dots default to conventional current (+ to −); set
`BB.electronFlow = true` only if the lesson is specifically about electron flow,
and say so on screen.

### 4.4 Always show the numbers

Animation shows *that* current flows; the readout shows *how much*. Print
current in mA and the relevant voltages either in the readout strip under the
board or on the scope legend. A student who cannot read a number cannot check
their own Ohm's law arithmetic.

### 4.5 The CANVAS_HEIGHT comment is mandatory

`// CANVAS_HEIGHT: <integer>` within the first 10 lines, equal to
`drawHeight + controlHeight`. The iframe height is that value + 2. Downstream
tooling (`sync-iframe-heights.py`) treats it as the single source of truth.

---

## Step 5: Verify in the Browser

Static review does not catch a circuit that never lights up. Verify it running.

1. The user runs `mkdocs serve` in their own terminal - **never start or kill
   it yourself.** Open the sim with the preview tools at
   `http://localhost:8000/<repo-name>/sims/<sim-id>/main.html`.
2. Check the console for errors first. A bad hole address logs a clear message
   from `bbPin()`.
3. Close each switch or button and confirm current appears. From the console:

   ```javascript
   bbPart('SW1').pressed = true;
   bbCurrent('D1');            // milliamps
   bbVoltage('g6');            // volts at a hole
   ```

4. **Check the arithmetic**, do not just check that something lit up. A red LED
   at 5 V through 220 Ω must read ≈13 mA. If it reads 0, the netlist is open; if
   it reads hundreds, something is shorted - re-read Step 2.2.
5. Screenshot at a wide width and at ~400 px. Both must be legible.

---

## Step 6: Quality Checks

Run the standard MicroSim checks, then the breadboard-specific ones.

These validators are the shared, general-purpose MicroSim tooling and live in
the `claude-skills` repo - this skill uses them, it does not own them. If that
repo is not checked out, skip these three commands and rely on the visual review
below; nothing else in the workflow depends on them.

```bash
UTILS="$HOME/Documents/ws/claude-skills/src/microsim-utils"

python3 $UTILS/validate-sims.py --project-dir $PROJECT --sim $SIM --verbose
python3 $UTILS/sync-iframe-heights.py --project-dir $PROJECT --sim $SIM --verbose

# Playwright check that no control is clipped at the iframe height
python3 $HOME/.claude/skills/microsim-utils/scripts/test-iframe-heights.py \
    --sims-dir $PROJECT/docs/sims --sim $SIM
```

Then capture a screenshot and walk the visual checklist:

```bash
bk-capture-screenshot $PROJECT/docs/sims/$SIM 3 <iframe-height>
```

Read the screenshot with the Read tool and walk **both**
`microsim-utils/references/visual-checklist.md` (the general one) and
`references/quality-checklist.md` in this skill (the breadboard-specific one:
clipped rails, parts shorted across a single net, unreadable hole labels,
current animation that contradicts the readout). Fix each FAIL and re-capture,
stopping after three cycles and reporting anything left.

Finally, offer to add the sim to `mkdocs.yml` navigation - do not edit the nav
without asking.

---

## Component Quick Reference

Full parameters in `references/component-catalog.md`.

| Function | Pins | Conducts when | Typical use |
|----------|------|---------------|-------------|
| `bbBattery({pos, neg, volts})` | rail holes | always (`.on`) | fixes the supply and ground nets |
| `bbWire({a, b, color, arc})` | any two holes | always | jumpers; carries the current animation |
| `bbResistor({a, b, ohms, label})` | any two holes | always | current limiting, dividers |
| `bbLED({anode, cathode, color})` | any two holes | forward biased above Vf | the output a student watches |
| `bbButton({a, b, color, key})` | straddle the channel | while held | momentary input |
| `bbSwitch({a, b, key, closed})` | any two holes | while closed | latching input |
| `bbCapacitor({a, b, uf})` | any two holes | never (DC) | showing that caps block DC |
| `bbDiode({anode, cathode})` | any two holes | forward biased | polarity, reverse protection |
| `bbPotentiometer({a, b, maxOhms})` | any two holes | always, variable | slider-driven resistance |
| `bbBuzzer({a, b})` | any two holes | always | audible output indicator |
| `bbTransistor({collector, base, emitter})` | three holes | base above 0.65 V | small current switches a large one |

Addresses are written the way they are printed on a real board: a row (`a`-`j`,
or a rail `T+`, `T-`, `B+`, `B-`) followed by a column number. `'e12'`, `'T+5'`,
`'B-14'`.

---

## Common Bugs

**Nothing lights up.** Almost always an open netlist. Print the solved nets with
`JSON.stringify(bbNets)` - any net reading 0 V that should not be is where the
break is. Check that a jumper connects the top and bottom ground rails.

**A component does nothing but the circuit still works.** Both its pins are in
the same net (e.g. `a5` and `c5`), so it is shorted out. Span *different*
columns, or cross the channel.

**Bottom rows clipped.** `bbLayout()` was given a width but no height, or
`drawHeight` minus `boardTop` minus `readoutHeight` is smaller than the board
needs.

**The board is drawn but pins are in the wrong place after a resize.** Pins
resolve their pixel positions lazily, so this only happens if a sim caches
`pin.x` in its own variable. Read `pin.x` at use time.

**Current flows the wrong way.** `bbLED` takes `anode` first, `cathode` second.
Reversed, the LED is reverse biased and correctly stays dark.

**Text has an outline halo.** A `stroke()` was active when `text()` was called.
`noStroke()` before every `text()`, no exceptions.

---

## Reference Files

- `references/breadboard-lib-api.md` - every function, its parameters, and what it returns
- `references/component-catalog.md` - each component's electrical model and drawing
- `references/circuit-simulation.md` - how the solver works, what it models, what it does not
- `references/quality-checklist.md` - breadboard-specific visual review items
- `assets/breadboard-lib.js` - the runtime library, copied into each sim
- `assets/examples/button-led-breadboard.js` - working reference sim; start here
- `assets/main-template.html`, `assets/index-template.md`, `assets/metadata-template.json`
