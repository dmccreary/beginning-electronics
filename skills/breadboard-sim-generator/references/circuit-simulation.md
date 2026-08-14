# How the Circuit Simulation Works

Read this before writing a sim whose lesson depends on the numbers being right,
and before telling a student what the sim is showing them.

## The short version

`bbSolve()` runs a real node-voltage analysis over the resistive network every
frame. Series and parallel currents come out correct because they are solved
simultaneously, not estimated branch by branch. Nonlinear parts - LEDs, diodes,
buttons, switches, transistors - are decided by repeating the solve with
different on/off assumptions until the set of conducting parts stops changing.

The "digital" layer the skill advertises is a thin reading of that result:
`bbIsOn(label)` is true when the current through a part exceeds a threshold.
So on/off logic and quantitative Ohm's law both come from the same solve, and
they can never disagree with each other or with the wire animation.

---

## The three ideas

### 1. Nets, not wires

A breadboard's whole trick is that some holes are already connected. The library
collapses each group of connected holes into a single **net**:

- rows `a`-`e` of column *n* → net `T`*n*
- rows `f`-`j` of column *n* → net `B`*n*
- the four rails → `TP`, `TN`, `BP`, `BN`

Two pins in the same net are the same electrical point. This is why a resistor
from `a5` to `c5` does nothing: both ends are net `T5`.

### 2. Branches

Each component contributes zero or more **branches**. A branch is:

```
{a, b, R, vf, oneWay}
```

meaning current flows from net `a` to net `b` through resistance `R`, against a
forward voltage drop `vf`, and if `oneWay` it conducts in that direction only.

- A resistor returns one branch with its resistance.
- An LED returns one one-way branch with `vf` set by its color.
- An open button returns **no branches at all** - that is what "open circuit"
  means here.
- A capacitor always returns no branches, because at DC it blocks.
- A transistor returns two: base-emitter always, collector-emitter only when on.

### 3. Node-voltage analysis

The battery pins two nets to known voltages. For every other net, Kirchhoff's
current law says the currents leaving must sum to zero. Each branch contributes
`I = (Va − Vb − vf) / R`, which is linear in the unknown voltages, so the whole
circuit becomes one system of linear equations - one equation per unknown net.
Gaussian elimination with partial pivoting solves it, and then every branch
current follows directly.

Solving all nets at once is what makes parallel branches correct. A path-tracing
approach - "find a route from + to −, divide voltage by total resistance" -
double-counts current through a shared element and quietly reports the wrong
answer for exactly the circuits a lesson on parallel resistance cares about.

A tiny leakage conductance to ground is added at every node so a floating net
(one with no path to the supply) settles at ~0 V instead of making the matrix
singular.

---

## Handling the nonlinear parts

Diodes and transistors do not have a single linear model - whether they conduct
depends on the answer you are trying to compute. The solver handles this by
iterating, up to eight passes:

1. Assume every one-way branch conducts.
2. Solve.
3. Any one-way branch carrying negative current is opened.
   Any opened branch whose forward bias now exceeds its threshold is closed.
   Any transistor whose base sits 0.65 V above its emitter switches on.
4. If anything changed, solve again.

Small circuits settle in two or three passes. The cap exists so a pathological
circuit degrades to a slightly wrong answer rather than hanging the browser.

---

## What is deliberately not modelled

Say these plainly in the sim's `metadata.json` under `limitations`, and on the
page if the lesson comes near them.

| Not modelled | Consequence | What to do |
|--------------|-------------|------------|
| **Transients** | Every frame is DC steady state. There is no charge, discharge, or settling time. | For an RC curve, compute the exponential in the sim and label it as a model. |
| **Capacitance** | A capacitor is an open circuit, full stop. | Use it to teach "caps block DC". Do not use it for timing. |
| **Inductance** | No inductors at all. | Out of scope for a beginning course. |
| **AC** | No sources other than DC. | Out of scope. |
| **Diode curve** | Fixed forward voltage plus a small series resistance, not the Shockley equation. | Fine to within a few percent at LED currents; do not teach the I-V curve from it. |
| **Transistor beta** | Modelled as a switch with a saturation drop, not a current amplifier. | Good for switching lessons; do not teach gain from it. |
| **Component tolerance, temperature, wire resistance** | Everything is ideal. | Mention it if the lesson is about measurement error. |

None of these are accidents. A beginning-electronics student needs a model that
gets Ohm's law, series, parallel, polarity, and switching exactly right and
stays silent about everything else. Adding transient analysis would make the
sim's behavior harder to predict without teaching anything the course covers.

---

## Debugging a circuit that does not work

Work in the browser console with the sim running.

**Nothing lights up.** Dump the solved nets:

```javascript
JSON.stringify(bbNets)
```

Every net on the intended current path should have a sensible voltage. The first
one reading 0 V that should not be is where the break is. Common causes: no
jumper between the top and bottom ground rails; a pin one column off; a button
whose pins are both in the same half of the board.

**A part seems to have no effect.** Check whether its pins share a net:

```javascript
const p = bbPart('R1'); [p.pins[0].net, p.pins[1].net]
```

Two identical strings mean it is shorted out.

**The current is implausible.** Check it against the arithmetic by hand:
`I = (Vsupply − ΣVf) / ΣR`. A red LED at 5 V through 220 Ω is ≈13 mA. Hundreds of
milliamps means a missing series resistor. Microamps means an unintended high
resistance in the path.

**A one-way part conducts backwards.** `bbLED` and `bbDiode` take `anode` first.
Swapped arguments give a reverse-biased part that correctly stays dark - which
looks like a bug and is not.

**Forcing a state to test.** Set it directly and read the result:

```javascript
bbPart('SW1').pressed = true;
bbCurrent('D1');       // mA
bbVoltageAcross('D1'); // V
```
