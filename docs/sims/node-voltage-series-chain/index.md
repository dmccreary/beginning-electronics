---
title: Node Voltage and Series Resistance Chain Builder
description: Calculate the total series resistance, the loop current, and the node voltage at each junction of a three-resistor series chain, by adjusting resistor-value sliders and reading live labeled readouts at each node.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate.
---

# Node Voltage and Series Resistance Chain Builder



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 3: "Circuit Analysis, Kirchhoff's Laws, and Energy"](../../chapters/03-circuit-analysis-kirchhoff/index.md).

```text
Type: microsim
**sim-id:** node-voltage-series-chain<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Template:** https://github.com/dmccreary/intro-to-physics-course/tree/main/docs/sims/series-parallel

Purpose: Let learners calculate total series resistance, loop current, and the node voltage at each point in a series chain, by manipulating a live circuit.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate.

Learning objective: Calculate the total series resistance, the loop current, and the node voltage at each junction of a three-resistor series chain, by adjusting resistor-value sliders and reading live labeled readouts at each node.

Canvas layout:
- Top: a single-loop circuit diagram — a battery and three resistors in series — with a labeled node dot (A, B, C) between each pair of components and after the last resistor
- Bottom: a control panel with three resistor sliders, a source-voltage slider, and a running summary readout

Visual elements:
- Battery symbol labeled with its source voltage
- Three resistors in series, each with a slider-driven value shown beside it
- Four labeled node dots along the loop, each displaying its live node voltage in a small readout bubble
- A summary box showing "Series Resistance: R1 + R2 + R3 = ___ Ω" and "Loop Current: ___ A"

Interactive controls:
- Sliders: Resistor 1, Resistor 2, Resistor 3 (10–1000 ohms each), and Source voltage (1.5–9 V)
- Hover over any node dot for a tooltip explaining what "node voltage" means at that point
- Button: "Load Example" sets the sliders to the chapter's worked example (100 Ω, 220 Ω, 330 Ω, 9 V)

Default parameters:
- Resistor 1: 100 Ω, Resistor 2: 220 Ω, Resistor 3: 330 Ω, Source voltage: 9 V

Data Visibility Requirements:
  Stage 1 (default circuit): Show the worked-example values with all four node voltages and the series-resistance/loop-current summary visible
  Stage 2 (slider adjusted): Recalculate every downstream node voltage immediately, so learners see how one resistor change shifts every node after it
  Stage 3 (node hovered): Show a tooltip stating that node's exact voltage and confirming it equals the source voltage minus every voltage drop before it

Instructional Rationale: This Apply-level objective calls for a parameter-exploration calculator with live numeric readouts, not a passive animation. Labeling every node and updating its voltage the instant a slider moves turns "node voltage" from an abstract term into something learners watch change.

Color scheme: Warm orange for node-voltage readouts, cool blue for resistor bars, matching this book's voltage/current color logic.

Responsive behavior: The diagram scales to fill the available width; sliders stack into a single touch-friendly column on narrow screens.

Implementation: p5.js, using a simple series-circuit math model (sum resistors, divide for loop current, subtract cumulative voltage drops for each node), redrawn each frame from the current slider values.
```

## Related Resources

- [Chapter 3: "Circuit Analysis, Kirchhoff's Laws, and Energy"](../../chapters/03-circuit-analysis-kirchhoff/index.md)
