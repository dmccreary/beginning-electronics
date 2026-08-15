---
title: Circuit Safety Hazard Explorer
description: Explain how overcurrent, reverse polarity, static discharge, and short circuits damage components, and what protection or habit prevents each, by clicking each hazard icon to reveal cause, consequence, and protection.
status: scaffold
library: p5.js
bloom_level: Understand (L2). Bloom Verb: explain.
---

# Circuit Safety Hazard Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 3: "Circuit Analysis, Kirchhoff's Laws, and Energy"](../../chapters/03-circuit-analysis-kirchhoff/index.md).

```text
Type: infographic
**sim-id:** circuit-safety-hazard-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Help learners connect each of the four circuit hazards introduced in this chapter to its cause, its consequence, and the specific habit or component that protects against it.

Bloom Taxonomy: Understand (L2). Bloom Verb: explain.

Learning objective: Explain how overcurrent, reverse polarity, static discharge, and short circuits damage components, and what protection or habit prevents each, by clicking each hazard icon to reveal cause, consequence, and protection.

Canvas layout:
- Top: a row of four hazard icons — flame for Overcurrent, flipped battery for Reverse Polarity, lightning spark for Static Discharge, bridging wire for Short Circuit
- Bottom: an infobox panel that fills in with Cause / What Happens / Prevention text for whichever icon was last clicked

Visual elements:
- Each icon in a rounded button labeled underneath; the selected icon highlighted with an orange outline
- The infobox divided into three labeled rows: "Cause," "What Happens," and "How to Prevent It"

Interactive controls:
- Click any hazard icon to load its explanation into the infobox
- Hover over an icon for a one-line preview tooltip
- Button: "Reset" clears the infobox to a placeholder

Default parameters:
- No icon pre-selected; infobox shows a "Click a hazard to learn about it" placeholder

Behavior when an icon is clicked:
- Overcurrent: Cause — "More current flows than a component is rated for." What Happens — "Excess heat builds up and can permanently damage the part." Prevention — "Correctly sized current-limiting resistors, and fuses in larger circuits."
- Reverse Polarity: Cause — "Power is connected backward into a polarity-sensitive part." What Happens — "Simple parts just don't work; sensitive chips can be permanently damaged." Prevention — "Always check plus and minus marks before powering up."
- Static Discharge: Cause — "Built-up static charge jumps into a chip." What Happens — "Microscopic internal damage, often invisible until the part fails." Prevention — "Touch a grounded metal object before handling chips; store ICs in anti-static packaging."
- Short Circuit: Cause — "Current finds a near-zero-resistance shortcut around the intended path." What Happens — "Current spikes rapidly, draining the battery fast and heating wires." Prevention — "Double-check wiring before power-up; this is exactly what fuses protect against."

Data Visibility Requirements:
  Stage 1 (default): Show all four hazard icons with no selection
  Stage 2 (icon clicked): Show the three-row Cause / What Happens / Prevention breakdown, replacing the placeholder
  Stage 3 (all four explored): Reinforce that "cause → consequence → protection" is a repeatable pattern for reasoning about any hazard

Instructional Rationale: This Understand-level objective calls for a click-to-reveal comparison, not a simulation with moving parts. The same three-row structure for every hazard helps learners build one reusable mental model instead of memorizing four unrelated warnings.

Color scheme: Warm orange for the selected icon's highlight; each hazard icon in an intuitive color (red-orange flame, blue/red flipped arrows, yellow lightning bolt, red bridging wire) on a light background.

Responsive behavior: The four icons wrap to a 2x2 grid on narrow screens, with the infobox always appearing below the icon row.

Implementation: p5.js, four clickable icon regions bound to a lookup table of Cause/Consequence/Prevention strings, infobox rendered as an HTML panel below the canvas.
```

## Related Resources

- [Chapter 3: "Circuit Analysis, Kirchhoff's Laws, and Energy"](../../chapters/03-circuit-analysis-kirchhoff/index.md)
