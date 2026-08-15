---
title: RC Charge and Discharge Curve Explorer
description: Given an RC circuit with adjustable resistor and capacitor values, calculate the resulting RC time constant and predict, then verify, how long the capacitor takes to reach roughly 63%, 86%, 95%, and 99% of its final voltage while charging or discharging.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate, demonstrate.
---

# RC Charge and Discharge Curve Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 10: "Capacitor Timing and Resistor Values"](../../chapters/10-capacitor-timing-resistor-values/index.md).

```text
Type: microsim
**sim-id:** rc-charge-discharge-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students adjust resistor and capacitor values in a simple RC circuit and watch the voltage-vs-time charge and discharge curve update live, connecting the RC time constant equation and the percent-charged rule-of-thumb table above to a concrete, visible graph.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate, demonstrate.

Learning objective: Given an RC circuit with adjustable resistor and capacitor values, calculate the resulting RC time constant and predict, then verify, how long the capacitor takes to reach roughly 63%, 86%, 95%, and 99% of its final voltage while charging or discharging.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: RC Charge and Discharge Curve | Topic: RC time constant, capacitor charging and discharging through a resistor over time | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Predict and observe how a capacitor's voltage rises during charging and falls during discharging through a resistor, and how changing R or C changes the RC time constant" returned a top match of "Capacitor Charging and Discharging" (dmccreary/intro-to-physics-course, WHAT score 0.6571, recommendation "template") — above the 0.60 template threshold but below the 0.75 reuse threshold, so this sim's exponential charge/discharge graphing approach is a strong starting point but needs its controls simplified to this chapter's junior-high, non-calculus framing (rule-of-thumb percentages instead of the exponential formula). **Template:** https://github.com/dmccreary/intro-to-physics-course/tree/main/docs/sims/capacitor-charging-discharging<br/>

Canvas layout: Left/main area shows a voltage-vs-time line graph with vertical dashed markers at 1τ, 2τ, 3τ, and 5τ; right side panel holds an R slider, a C slider, a live τ readout with the equation substituted in, a Charge/Discharge toggle, and an infobox.

Components/elements involved: A labeled voltage-vs-time graph (Y-axis: Voltage, X-axis: Time); a small capacitor icon showing current charge level as a fill bar; a Charge/Discharge toggle switch; two sliders for \( R \) and \( C \).

Required interactivity:
- Drag the \( R \) slider with snap points at this chapter's kit values (220 Ω, 330 Ω, 1K, 10K); the graph curve and τ readout update immediately
- Drag the \( C \) slider (1 µF to 1,000 µF); the graph curve and τ readout update immediately
- Toggle between "Charge" and "Discharge" to animate the curve rising toward the supply voltage or falling back toward zero
- Hover any point on the curve to open an infobox showing elapsed time in multiples of τ and the approximate percent charged, matching the rule-of-thumb table above
- Button: "Reset" returns to the default state

Default state: \( R \) = 1,000 ohms (1K resistor), \( C \) = 100 µF, \( \tau \) readout shows "τ = 1,000 Ω × 0.0001 F = 0.1 seconds," curve in Charge mode.

Data Visibility Requirements:
Stage 1: Show the current \( R \) and \( C \) slider values
Stage 2: Show the equation \( \tau = R \times C \) with those exact numbers substituted in
Stage 3: Show the resulting \( \tau \) value and the animated curve, with the 1τ/2τ/3τ/5τ markers and their percent-charged values labeled on the graph

Instructional Rationale: An Apply-level "calculate/demonstrate" objective calls for a parameter-exploration pattern with the equation's real numbers visible at every stage, so students can connect each slider movement directly to a changing τ value and a changing curve shape, rather than watching an unlabeled animation.

Color scheme: Warm orange for the currently dragged slider, blue curve while charging, gray curve while discharging, consistent with the palette used in this chapter's other diagrams.

Responsive behavior: Graph area and the slider/readout panel stack vertically on narrow screens; sliders remain full-width and touch-draggable.

Implementation: p5.js, adapting the graphing approach from the template referenced above, simplified to rule-of-thumb percentage markers instead of the full exponential charging formula to match this course's non-calculus, junior-high framing.
```

## Related Resources

- [Chapter 10: "Capacitor Timing and Resistor Values"](../../chapters/10-capacitor-timing-resistor-values/index.md)
