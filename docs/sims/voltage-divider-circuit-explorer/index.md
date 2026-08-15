---
title: Voltage Divider Circuit Explorer
description: Given a rendered breadboard voltage divider circuit with two adjustable resistors, predict and then verify the output voltage at the midpoint tap as \( R_1 \) and \( R_2 \) change, connecting the observed value to the voltage divider equation.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate, demonstrate.
---

# Voltage Divider Circuit Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 9: "Resistors and Capacitors"](../../chapters/09-resistors-and-capacitors/index.md).

```text
Type: microsim
**sim-id:** voltage-divider-circuit-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students adjust the two resistor values in a rendered breadboard voltage divider circuit and watch the calculated output voltage update live, connecting the abstract equation above to a concrete, wireable circuit.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate, demonstrate.

Learning objective: Given a rendered breadboard voltage divider circuit with two adjustable resistors, predict and then verify the output voltage at the midpoint tap as \( R_1 \) and \( R_2 \) change, connecting the observed value to the voltage divider equation.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Voltage Divider Circuit Explorer | Topic: Voltage Divider Circuit built from two resistors or a potentiometer on a breadboard | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Calculate and predict the output voltage of a voltage divider circuit as resistor values change" returned a top match of "Ohm's Law Circuit Simulator" (dmccreary/automating-instructional-design, WHAT score 0.5607, recommendation "generate") — below the 0.60 template threshold, and that existing sim teaches single-resistor Ohm's Law rather than a two-resistor divider, so it is not a close enough fit to reuse. A keyword grep of the microsim catalog for "voltage divider" found no matches. This is a new specification, and it is a strong candidate for the breadboard-sim-generator skill since it needs a rendered breadboard with two resistors in real tie-point positions, animated current flow, and a live-updating voltage readout.

Canvas layout: Left/main area shows a rendered half-size breadboard with a battery pack, \( R_1 \), and \( R_2 \) wired in series, with a probe clipped at the midpoint tap; right side panel holds two resistor-value sliders, a numeric \( V_{out} \) readout, the equation with live numbers substituted in, and an infobox.

Components/elements involved: A rendered breadboard with power and ground rails; a battery pack; two resistors with visible leads; a probe or voltmeter icon at the tap point; two sliders labeled \( R_1 \) and \( R_2 \).

Required interactivity:
- Drag the \( R_1 \) slider (10 ohms to 100,000 ohms, logarithmic scale) and watch the breadboard's resistor, the animated current flow, and the \( V_{out} \) readout update immediately
- Drag the \( R_2 \) slider across the same range with the same live update
- Hover the probe point to open an infobox showing the equation with the current \( R_1 \), \( R_2 \), and \( V_{in} \) values filled in, alongside the calculated \( V_{out} \)
- Button: "50/50 Split" resets both sliders to equal values so students can confirm the output lands at exactly half of \( V_{in} \)
- Button: "Reset" returns to the default state

Default state: \( V_{in} \) fixed at 5 volts, \( R_1 \) = 1,000 ohms, \( R_2 \) = 1,000 ohms, \( V_{out} \) readout shows 2.5 V.

Data Visibility Requirements:
Stage 1: Show the fixed \( V_{in} \) value and the two current slider values
Stage 2: Show the equation with those exact numbers substituted in place of \( R_1 \), \( R_2 \), and \( V_{in} \)
Stage 3: Show the calculated \( V_{out} \) result, updating instantly as either slider moves

Instructional Rationale: An Apply-level "calculate/demonstrate" objective calls for a parameter-exploration calculator pattern with concrete, visible data at every stage, not a continuous animation — students need to see the actual numbers driving each new \( V_{out} \) value so they can connect slider movement directly to the equation above.

Color scheme: Warm orange for the currently dragged slider and its corresponding resistor on the breadboard, blue glow at the probe point, consistent with the palette used in this chapter's other diagrams.

Responsive behavior: Breadboard view and the slider/readout panel stack vertically on narrow screens; sliders remain full-width and touch-draggable.

Implementation: p5.js, built on the breadboard-sim-generator rendering approach (real tie-point hole grid, component placement, and animated current flow); well suited to breadboard-sim-generator since it needs an accurately rendered breadboard with two resistors in real tie-point positions and a live numeric readout tied to slider values.
```

## Related Resources

- [Chapter 9: "Resistors and Capacitors"](../../chapters/09-resistors-and-capacitors/index.md)
