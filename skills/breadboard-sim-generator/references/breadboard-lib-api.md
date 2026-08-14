# breadboard-lib.js API Reference

Every function the sim author calls, grouped by the order you use them in.
Read `component-catalog.md` for the components themselves and
`circuit-simulation.md` for what the solver actually models.

## Contents

- [Addresses](#addresses)
- [Layout](#layout)
- [Building the circuit](#building-the-circuit)
- [Solving and reading results](#solving-and-reading-results)
- [Drawing](#drawing)
- [Interaction](#interaction)
- [Scope](#scope)
- [Configuration](#configuration)

---

## Addresses

A hole is named the way it is printed on a real board: a row label followed by a
column number.

| Row label | Meaning |
|-----------|---------|
| `a` … `e` | top terminal strip |
| `f` … `j` | bottom terminal strip |
| `T+` `T-` | top power rails |
| `B+` `B-` | bottom power rails |

`'a1'`, `'e12'`, `'j30'`, `'T+5'`, `'B-14'`.

**`bbPin(ref)`** → `{row, col, net, x, y}`

Parses an address. `x` and `y` are live getters that re-read the current board
layout, so a pin created in `setup()` is still correct after a window resize.
Never copy `pin.x` into a variable that outlives the frame.

A malformed or out-of-range address logs a clear console error and falls back to
`a1` rather than throwing, so one typo does not blank the whole sim.

**`bbNetOf(row, col)`** → net id string

The net a hole belongs to: `'T<col>'` for rows a-e, `'B<col>'` for rows f-j,
and `'TP'` / `'TN'` / `'BP'` / `'BN'` for the four rails. Two pins with the same
net id are already wired together under the plastic.

---

## Layout

**`bbLayout(x, y, w, h, cols, opts)`**

Fit the board into the rectangle `(x, y, w, h)`. Call it once in `setup()` (to
establish the column count before any address is parsed) and again at the top of
every `draw()` (so the board tracks the container width).

| Parameter | Meaning |
|-----------|---------|
| `x, y, w, h` | the rectangle the board must fit inside |
| `cols` | tie columns, 20 or 30; omit to keep the current value |
| `opts.supply` | `false` reclaims the left strip reserved for the supply badge |

Pitch is `min(width-driven, height-driven)`, so the board fits in **both**
directions and the leftover space is split evenly. This is the function that
prevents the most common breadboard-sim defect: rows clipped off the bottom.

**`bbHeight()`** → pixels

The board's rendered height at the current pitch. Useful for placing a readout
directly beneath it.

**`bbColX(col)`**, **`bbRowY(row)`** → pixels

Raw coordinate lookups, for drawing annotations aligned to the grid.

---

## Building the circuit

Call `bbReset()` once, then add parts in current-path order - it reads like the
loop you traced in the design step.

**`bbReset()`** — clears all parts, nets, scope traces, and the animation clock.
Call it before adding parts *and* before adding traces.

**`bbBattery`, `bbWire`, `bbResistor`, `bbLED`, `bbButton`, `bbSwitch`,
`bbCapacitor`, `bbDiode`, `bbPotentiometer`, `bbBuzzer`, `bbTransistor`**

Each takes one options object and returns the part, so you can keep a reference:

```javascript
const pot = bbPotentiometer({a: 'a5', b: 'a9', maxOhms: 10000, label: 'RV1'});
// later, in draw():
pot.setting = potSlider.value();
```

See `component-catalog.md` for each one's parameters.

---

## Solving and reading results

**`bbSolve(running)`**

Solves the whole circuit for this frame: node voltages everywhere, current
through every part. Call it once per `draw()`, after `bbLayout()` and before the
drawing calls. Pass `isRunning` so the animation clock advances only while the
sim is running.

**`bbPart(label)`** → the part object, or `null`

**`bbCurrent(label)`** → milliamps through that part, as a magnitude - what a
meter in that branch would read. It is unsigned on purpose: the sign of a branch
current depends on which pin the author declared first, so a resistor wired
`'a18'` → `'T+18'` would otherwise report a negative current for a reason no
student could see.

**`bbCurrentSigned(label)`** → milliamps, positive when current flows from the
part's first declared pin toward its second. Use this only when direction is the
lesson.

`bbCurrent` on the **battery** returns total supply current - everything leaving
its positive terminal. In a parallel circuit that equals the sum of the branch
currents, which makes it the natural trace for a series-vs-parallel lesson:

```javascript
bbAddTrace({label: 'Total current', get: () => bbCurrent('BAT'),
            color: 'darkorange', max: 40, unit: 'mA'});
```

**`bbVoltage(ref)`** → volts at a hole, e.g. `bbVoltage('g6')`

**`bbVoltageAcross(label)`** → volts across a part's two main pins

**`bbIsOn(label, thresholdMilliamps)`** → boolean

The digital view of the circuit. Default threshold is 0.5 mA. Use it for logic:
`if (bbIsOn('D1')) { ... }`.

**`bbNets`** — the solved net-voltage map. `JSON.stringify(bbNets)` in the
console is the fastest way to find where a circuit is open.

---

## Drawing

**`bbDrawBoard()`** — the empty board: body, rails, holes, channel, labels.

**`bbDrawParts()`** — every part, wires first so component bodies sit on top of
them the way they do on a real board.

**`bbDrawAnimatedWire(p1, p2, current, color, arcUnits)`**

Used internally by `bbWire`. Call it directly only for wires that are not part
of the netlist (an annotation lead, say). Dot speed is proportional to current;
dots move from higher to lower voltage unless `BB.electronFlow` is set.

**`drawAnimatedWire(x1, y1, x2, y2, speed, spacing)`**

Signature-compatible with the same function in `p5-circuit-lib.js`, for
schematic drawings that are not placed on holes.

---

## Interaction

Wire all four into the sim; buttons need press *and* release to be momentary.

```javascript
function mousePressed()  { bbMousePressed(); }
function mouseReleased() { bbReleaseAll(); }
function keyPressed()    { bbKeyPressed(); }
function keyReleased()   { bbKeyReleased(); }
```

**`bbMousePressed(mx, my)`** → `true` if a part was hit. Presses buttons under
the cursor and toggles switches. Defaults to `mouseX`/`mouseY`.

**`bbReleaseAll()`** — releases every momentary button.

**`bbKeyPressed(k)`, `bbKeyReleased(k)`** — same, for parts given a `key`.

**`bbHovering(mx, my)`** → `true` when the cursor is over anything clickable.
Use it for `cursor(bbHovering() ? HAND : ARROW)` so the board advertises what
can be pressed.

---

## Scope

**`bbAddTrace({label, get, color, max, min, unit})`**

Declare a trace in `setup()`. `get` is called every sample and returns the
number to plot.

```javascript
bbAddTrace({label: 'D1 current', get: () => bbCurrent('D1'),
            color: 'crimson', max: 30, unit: 'mA'});
```

Choose a `max` divisible by 4 where you can - the panel draws five gridlines, so
20, 24, or 40 give clean tick labels.

The first trace gets the left axis, the second the right, each in its own color.
A current in mA and a voltage in V cannot share one scale, and an unlabelled
axis invites students to read the wrong number off the wrong line. More than two
traces still plot, but only the first two get axes - keep to two.

**`bbSampleTraces()`** — sample every trace. Call once per frame, after
`bbSolve()`, and only while running.

**`bbClearTraces()`** — throw away the history. Wire this to the Reset button.

**`bbDrawScope(x, y, w, h, title)`** — draw the panel. It clamps its own
internals, so a narrow panel degrades rather than breaking, but below about
640 px of canvas width you should hide the scope entirely and give the board the
full width.

---

## Configuration

The `BB` object holds live layout state. Two fields are meant to be set by the
sim; the rest are managed by `bbLayout()`.

| Field | Default | Meaning |
|-------|---------|---------|
| `BB.electronFlow` | `false` | `true` reverses the dots to electron flow (− to +) and colors them blue |
| `BB.showColNumbers` | `true` | column numbers above row a and below row j |
| `BB.showRowLetters` | `true` | row letters down both edges |
| `BB.cols` | `20` | tie columns - set through `bbLayout()`, not directly |
| `BB.pitch`, `BB.x`, `BB.y`, `BB.w`, `BB.padLeft` | computed | read-only in practice |

Column numbers thin out automatically to every fifth column when the pitch drops
below 13 px, which keeps a 30-column board legible on a phone.
