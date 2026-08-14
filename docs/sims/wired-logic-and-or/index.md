---
title: "Wired Logic: AND and OR"
description: Two switches in series make an AND gate and two in parallel make an OR gate, with live truth tables that fill in as the student flips the switches.
image: /sims/wired-logic-and-or/wired-logic-and-or.png
og:image: /sims/wired-logic-and-or/wired-logic-and-or.png
twitter:image: /sims/wired-logic-and-or/wired-logic-and-or.png
social:
   cards: false
---
# Wired Logic: AND and OR

<iframe src="main.html" height="547px" scrolling="no"></iframe>

[Run the Wired Logic MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your own website with this `iframe`:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/wired-logic-and-or/main.html" height="547px" scrolling="no"></iframe>
```

## About this MicroSim

Long before any chip is involved, a logic gate is just a wiring pattern. Two
switches in **series** make an AND gate: current has one path, so it needs both
switches closed. Two switches in **parallel** make an OR gate: there are two
paths, so either one on its own is enough.

Both circuits are on the board at once, and the truth tables beside them fill in
live as you flip switches.

## The Circuit

**AND** — series, in the top half:

```linenums="0"
T+ rail → a5 → SW A → SW B → R1 220Ω → D1 (red) → T− rail
```

**OR** — parallel, in the bottom half:

```linenums="0"
B+ rail → j5 → SW C ┐
                    ├→ R2 220Ω → D2 (green) → B− rail
B+ rail → j5 → SW D ┘
```

Switches C and D both bridge the same pair of columns, which is what puts them
in parallel. On the board you can see it directly: two switches stacked one
above the other, spanning the same span of holes.

| Component | Value | Purpose |
|-----------|-------|---------|
| BAT | 5 V | supply |
| A, B | latching switches | the AND inputs |
| C, D | latching switches | the OR inputs |
| R1, R2 | 220 Ω | current limiting |
| D1, D2 | red, green | the two gate outputs |

## How to Use It

1. Click a switch on the board, or press **1**, **2**, **3**, **4**. The
   switches latch, so you can set any combination.
2. Work through all four input combinations on the AND side and watch which
   row of the truth table highlights.
3. Do the same on the OR side. Compare the two output columns.

## What the Animation Shows

Current only flows on a completed path, so the wires themselves show you which
gate is satisfied. With only switch A closed, the current stops at the open B
contact and no dots appear past it — the "0" in the truth table is visible on
the board as a path that goes nowhere.

## Lesson Plan

### Grade Level, Subject and Topic

Middle school and high school. Electronics and digital logic. Series and
parallel paths as Boolean operations.

### Learning Objective

Students will be able to construct the truth table for an AND gate and an OR
gate by setting switch combinations on a breadboard and observing which
configuration completes a circuit.

### Activities

#### Fill in the table on paper first

Before touching the sim, have students predict all four rows for each gate.
Then verify. The OR row `1 1` is the one most often predicted wrong — many
students expect two closed switches to somehow be "more on".

#### Name the pattern

Ask which physical arrangement corresponds to which operation, and why series
means AND. The answer — one path, so every switch must be closed — generalizes
to three and four inputs.

#### Extend it

How would you wire a three-input AND? A three-input OR? What arrangement would
give you "A and (B or C)"?

### Assessment

- Switch A is closed and B is open. Is any current flowing in the top circuit? Where does it stop?
- Which gate would you use for a garage door that opens only when a button is pressed *and* a safety sensor is clear?
- Draw the switch arrangement for a lamp controlled from either end of a hallway.

## Model Limitations

This simulation solves the circuit in DC steady state. It does not model
transient behavior, contact bounce, capacitance, inductance or AC. Component
values are ideal — no tolerance, no contact resistance, no wire resistance.
Real switches bounce for a few milliseconds on closing, which matters in digital
circuits and is not shown here.

## References

- [Series vs Parallel Explorer](../series-parallel-explorer/index.md) — the same two topologies measured quantitatively
- [Light and Dark Detector](../light-dark-detector/index.md) — a transistor replacing a switch as the control element
