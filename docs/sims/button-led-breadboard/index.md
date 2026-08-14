---
title: Push Button and LED Circuit
description: A breadboard MicroSim where three push buttons each light an LED through a 220 ohm resistor, with animated current flow and a live current and voltage plot.
image: /sims/button-led-breadboard/button-led-breadboard.png
og:image: /sims/button-led-breadboard/button-led-breadboard.png
twitter:image: /sims/button-led-breadboard/button-led-breadboard.png
social:
   cards: false
---
# Push Button and LED Circuit

<iframe src="main.html" height="602px" scrolling="no"></iframe>

[Run the Push Button and LED Circuit MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your own website with this `iframe`:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/button-led-breadboard/main.html" height="602px" scrolling="no"></iframe>
```

## About this MicroSim

Three identical branches sit on one breadboard. Each has a push button, a
220 Ω current-limiting resistor, and an LED. Press a button and that branch's
circuit closes: dots start moving along its wires and its LED lights up.

The three branches are identical except for the LED color, and that is the
point. A red, a green, and a blue LED share the same supply and the same
resistor but draw different currents, because each color has a different
forward voltage.

## The Circuit

Each branch traces the same path from the positive rail back to ground:

```linenums="0"
T+3 (positive rail) → red wire → a3
  → SW1, straddling the channel at e3/f3 → j3
  → R1 220Ω → j6
  → D1, anode g6 to cathode g8 → j8
  → black wire → B-8 (ground rail)
```

A single black jumper from `T-2` to `B-2` carries ground from the top rail down
to the bottom rail. Without it, none of the three branches would have a return
path — the same jumper you have to remember on a real board.

| Component | Value | Purpose |
|-----------|-------|---------|
| BAT | 3–9 V, slider | supply; fixes the rail voltages |
| SW1, SW2, SW3 | momentary | close each branch while held |
| R1, R2, R3 | 220 Ω | limit current to a safe level for the LED |
| D1, D2, D3 | red, green, blue | the output, brightness follows current |

### Why 220 Ω?

At 5 V with a red LED, the resistor sees the supply minus the LED's forward
voltage: (5 − 1.9) / 235 ≈ 13 mA. That is comfortably inside the 20 mA a
standard 5 mm LED is rated for. Raise the supply to 9 V and the same resistor
lets through about 30 mA — over the limit, which is exactly what the slider lets
students discover.

## How to Use It

1. Press **Start** so the animation and the plot begin running.
2. Click a button on the board, or press the **1**, **2**, or **3** key, and
   hold it. Watch the dots move and the LED light.
3. Move the **Supply voltage** slider while holding a button and watch the
   current on the scope change with it.

## What the Animation Shows

The moving dots are current. They travel from the positive rail toward ground
(conventional current), and their **speed is proportional to the actual
current** — a dimmer LED visibly moves fewer dots. The milliamp readout under
the board and the traces on the scope come from the same circuit solution, so
the picture and the arithmetic always agree.

## Lesson Plan

### Grade Level, Subject and Topic

Middle school and high school. Electronics. Complete circuits, Ohm's law, and
LED forward voltage.

### Learning Objective

Students will be able to explain why a series resistor sets the current in an
LED circuit by changing the supply voltage and reading the resulting current.

### Activities

#### Predict, then test

Before pressing anything, ask: with all three buttons up, how much current
flows? (None — every branch is an open circuit.) Then press one button and ask
what changes about the *other* two branches. (Nothing. They are independent
parallel branches.)

#### Check the arithmetic

Have students compute the expected current with `I = (V − Vf) / R` for the red
LED at 5 V, then hold button 1 and compare with the readout. Then set the supply
to 7 V, predict the new current, and check.

#### Compare the colors

Hold all three buttons at once. Why does the blue LED draw the least current
with the same resistor and the same supply? (Its forward voltage is 3.1 V, so
less voltage is left across the resistor.) At what supply voltage does the blue
LED stop lighting at all?

### Assessment

- If you removed R1 entirely, what would happen to D1, and why?
- Two of the three LEDs are lit. How much current is the battery supplying?
- You want the red LED to run at 10 mA on a 5 V supply. What resistor do you need?

## Model Limitations

This simulation solves the circuit in DC steady state. It does not model
transient behavior, capacitance, inductance, AC, diode I-V curves, or transistor
gain. Component values are ideal — no tolerance, no temperature effects, and no
wire resistance.

## References

- [Solderless Breadboard Layout](../breadboard/index.md) — how the rows, columns and rails are wired
- [LED and Resistor Calculator](../led-resistor-calc/index.md) — pick a resistor for a target current
