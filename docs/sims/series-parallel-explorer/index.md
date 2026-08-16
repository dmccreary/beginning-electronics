---
title: "Series vs Parallel Explorer"
description: "Rewire two identical LEDs between a series chain and two parallel branches on a breadboard, and watch branch current and total supply current change."
image: /sims/series-parallel-explorer/series-parallel-explorer.png
og:image: /sims/series-parallel-explorer/series-parallel-explorer.png
twitter:image: /sims/series-parallel-explorer/series-parallel-explorer.png
social:
   cards: false
---
# Series vs Parallel Explorer

<iframe src="main.html" height="602px" scrolling="no"></iframe>

[Run the Series vs Parallel Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your own website with this `iframe`:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/series-parallel-explorer/main.html" height="602px" scrolling="no"></iframe>
```

## About this MicroSim

The same two LEDs and the same two 220 Ω resistors, wired two different ways.
Switch between them with the dropdown and watch what changes: in series both
LEDs are dim and share one small current; in parallel both are bright and the
battery has to supply twice as much.

## The Circuit

Power always arrives on the top rails and is jumpered down to the bottom rails,
so the only thing that changes between the two modes is the topology itself.

**Series** — one loop, crossing the center channel partway through:

```linenums="0"
T+ rail → a5 → R1 220Ω → D1 → across the channel (e12 → f12)
        → R2 220Ω → D2 → B− rail
```

**Parallel** — two independent branches, one in each half of the board:

```linenums="0"
T+ rail → a5 → R1 220Ω → D1 → T− rail
B+ rail → j5 → R2 220Ω → D2 → B− rail
```

| Component | Value | Purpose |
|-----------|-------|---------|
| BAT | 3–9 V, slider | supply |
| R1, R2 | 220 Ω | one current-limiting resistor per LED |
| D1, D2 | red | identical, so any difference comes from the wiring |

### The numbers at 6 V

**Series:** the two LEDs drop 1.9 V each, leaving 2.2 V across 440 Ω of
resistance. Every part carries **4.7 mA**, and so does the battery.

**Parallel:** each branch sees the full 6 V, so each carries
(6 − 1.9) / 235 ≈ **17.4 mA** — and the battery supplies **34.9 mA**, the sum of
the two.

That is a seven-fold difference in supply current from nothing but rewiring.

## How to Use It

1. Press **Start**, then read the three numbers under the board.
2. Switch the dropdown to **Parallel** and watch all three change.
3. Move the **Supply voltage** slider in each mode. In series the LEDs go dark
   below about 4 V; in parallel they stay lit much lower. Ask why.

## What the Animation Shows

Dot speed on each wire is proportional to the current in that wire, so the
parallel branches visibly move dots faster than the series loop. In parallel,
the wire feeding the two branches carries both branch currents — watch it run
faster than either branch.

The red rail jumper carries no current in series mode and shows no dots. It is
still correct to leave it in place, which is worth pointing out: a wire with no
current is not a wasted wire.

## Lesson Plan

### Grade Level, Subject and Topic

Middle school and high school. Electronics. Series and parallel topology,
Kirchhoff's current law.

### Learning Objective

Students will be able to predict how total current changes when identical loads
are rewired from series to parallel, by comparing branch current with supply
current in both configurations.

### Activities

#### Predict, then switch

Before touching the dropdown, ask: if we move from series to parallel, does the
battery supply more current, less, or the same? Most students say "the same"
or "less". Then switch.

#### Verify Kirchhoff

In parallel mode, read D1, D2 and the battery. Confirm that the battery current
is exactly the sum. Then ask what the battery current would be with a third
identical branch.

#### Find the cliff

In series mode, lower the supply until the LEDs go out. Two LEDs need 3.8 V
before any current flows at all. Ask students to predict that voltage from the
forward-voltage figures before they find it with the slider.

### Assessment

- In series mode, D1 reads 4.7 mA. What does D2 read, and how do you know without looking?
- You add a third LED and resistor in parallel. What happens to the battery current?
- Why does the series circuit stop working below about 4 V while the parallel one keeps going?

## Model Limitations

This simulation solves the circuit in DC steady state. It does not model
transient behavior, capacitance, inductance, AC, diode I-V curves, or transistor
gain. Component values are ideal — no tolerance, no temperature effects, and no
wire resistance.

## References

- [Push Button and LED Circuit](../button-led-breadboard/index.md) — the same parts in a simpler single-branch circuit
- [Solderless Breadboard Layout](../breadboard/index.md) — how rows, columns and rails are connected
