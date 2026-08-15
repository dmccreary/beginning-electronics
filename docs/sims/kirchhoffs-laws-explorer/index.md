---
title: Kirchhoff's Laws Circuit Explorer
description: Calculate the voltage drop across each resistor in a series section of a circuit and the current in each branch of a parallel section, by adjusting resistor-value sliders and confirming that voltage drops sum to the source voltage and that branch currents sum to the total current.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate.
---

# Kirchhoff's Laws Circuit Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 2: "Current, Charge, Units, and Electrical Safety"](../../chapters/02-current-charge-units-safety/index.md).

```text
Type: microsim
**sim-id:** kirchhoffs-laws-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Template:** https://github.com/dmccreary/automating-instructional-design/tree/main/docs/sims/ohms-law-simulator

Purpose: Let learners verify Kirchhoff's Voltage Law and Kirchhoff's Current Law for themselves, by adjusting a circuit and watching the numbers stay balanced.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate.

Learning objective: Calculate the voltage drop across each resistor in a series section of a circuit and the current in each branch of a parallel section, by adjusting resistor-value sliders and confirming that voltage drops sum to the source voltage and that branch currents sum to the total current.

Canvas layout:
- Top half: a series loop with a battery and two resistors, each labeled with a live voltage-drop readout
- Bottom half: a parallel section with two branch resistors, each labeled with a live current readout, joined at a labeled junction node
- Right-side control panel: sliders and a running-totals readout

Visual elements:
- Battery symbol labeled with its fixed source voltage
- Two series resistors, each with a slider-driven value and a colored bar showing its share of the total voltage
- A junction node in the parallel section, drawn as a highlighted dot, with arrows showing current entering and current splitting into two branches
- Running-totals box: "Voltage drops: __ + __ = __ V (source: __ V)" and "Branch currents: __ + __ = __ A (total: __ A)"

Interactive controls:
- Slider: Resistor 1 value (series section), 10–1000 ohms
- Slider: Resistor 2 value (series section), 10–1000 ohms
- Slider: Resistor A value (parallel section), 10–1000 ohms
- Slider: Resistor B value (parallel section), 10–1000 ohms
- Slider: Source voltage, 1.5–9 volts
- Button: "Randomize Resistors" to jump to a new combination
- Hover over any resistor or the junction node for a tooltip explaining what it represents

Default parameters:
- Source voltage: 9V
- Series resistors: 300 ohms and 600 ohms
- Parallel resistors: 500 ohms and 1000 ohms

Behavior when a slider moves:
- Voltage-drop bars and readouts update immediately for the series section, and the running total always recalculates to match the source voltage exactly
- Branch-current readouts update immediately for the parallel section, and the running total always recalculates to match the total current into the junction exactly
- A small green checkmark appears next to each running total whenever it balances, which, since these are the real laws of physics, is always — reinforcing that the "law" is not optional

Data Visibility Requirements:
  Stage 1 (default circuit): Show both the series section and parallel section with their default values and correct running totals visible
  Stage 2 (learner adjusts a slider): Show the changed value immediately reflected in that section's bars/arrows and its running-total equation
  Stage 3 (learner hovers a component): Show a tooltip naming the component and stating the specific rule it demonstrates — voltage division for series resistors, current splitting for parallel resistors

Instructional Rationale: This is an Apply-level objective, so the design centers on a parameter-exploration calculator rather than a passive animation. Showing the running-total equation update live, with an always-true checkmark, lets learners discover Kirchhoff's Laws as a pattern through repeated experimentation rather than being told the rule once and moving on.

Color scheme: Warm orange bars for voltage drops in the series section, cool blue arrows for currents in the parallel section, matching the positive/negative and voltage/current color logic used throughout this book.

Responsive behavior: The series section and parallel section stack vertically on narrow screens, with the control panel moving below both; all sliders remain full-width and touch-friendly on mobile.

Implementation: p5.js, using five numeric sliders bound to a simple circuit-math model (series voltage division and parallel current division), with bars and arrows redrawn each frame from the current slider values.
```

## Related Resources

- [Chapter 2: "Current, Charge, Units, and Electrical Safety"](../../chapters/02-current-charge-units-safety/index.md)
