---
title: Potentiometer Taper Explorer
description: Given a potentiometer with an adjustable wiper position, predict and observe how a linear taper and a logarithmic taper produce different resistance values for the same wiper rotation, and locate the trim pot adjustment screw on a rendered trimmer potentiometer.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, predict.
---

# Potentiometer Taper Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 12: "Diodes and LEDs"](../../chapters/12-diodes-and-leds/index.md).

```text
Type: microsim
**sim-id:** potentiometer-taper-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students drag a potentiometer's wiper and watch how a linear taper and a logarithmic taper produce different resistance curves for the same wiper motion, then locate the adjustment screw on a rendered trimmer potentiometer.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, predict.

Learning objective: Given a potentiometer with an adjustable wiper position, predict and observe how a linear taper and a logarithmic taper produce different resistance values for the same wiper rotation, and locate the trim pot adjustment screw on a rendered trimmer potentiometer.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Potentiometer Taper and Trim Pot Explorer | Topic: Potentiometer wiper position, linear taper versus logarithmic taper resistance curve, trim pot adjustment screw | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Demonstrate how a potentiometer wiper position changes output and compare a linear taper to a logarithmic taper resistance curve" returned a top match of "ADC and Potentiometer Explorer" (dmccreary/learning-micropython, WHAT score 0.4777, recommendation "generate") — below the 0.60 template threshold, and out of scope regardless, since it teaches reading a potentiometer through a microcontroller's ADC, which this no-code course explicitly excludes. A keyword grep of the 3,764-entry catalog for "potentiometer" returned only that same result; grep for "taper" and "trim pot" returned zero hits. This is a new specification.

Canvas layout: Left side shows a rendered potentiometer with a draggable wiper position, plus a rendered trimmer potentiometer variant showing an adjustment screw slot; right side holds a resistance-vs-position graph plotting both taper curves, a taper-type toggle, and an infobox.

Components/elements involved: A rendered rotary potentiometer with a visible wiper indicator; a rendered trim pot with a screw-slot adjustment point; a wiper-position slider (0-100%); a taper toggle (Linear / Logarithmic); a dual-curve resistance graph.

Required interactivity:
- Dragging the wiper-position slider moves the wiper on the rendered potentiometer and moves a marker along the currently selected curve on the graph
- Toggling Linear/Logarithmic switches which curve is active and updates the resistance readout to match
- Hovering the graph at any point shows the wiper percentage and the corresponding resistance value on both curves at once, for direct comparison
- Clicking the trim pot's adjustment screw opens an infobox explaining that it is turned with a small screwdriver for an infrequent, precise calibration adjustment, not everyday hands-on control
- Button "Reset" returns to a 50% wiper position with Linear taper selected

Default state: Wiper at 50%, Linear taper selected, readout reads "50% rotation = 50% of total resistance," graph showing both curves with the linear curve highlighted.

Data Visibility Requirements:
Stage 1: Show the wiper position as a percentage of full rotation
Stage 2: Show which taper curve (Linear or Logarithmic) is currently active
Stage 3: Show the resulting resistance value read directly off that curve
Stage 4: Show both curves overlaid on the same graph for direct visual comparison

Instructional Rationale: An Apply-level "demonstrate/predict" objective calls for a parameter-exploration pattern where dragging the wiper produces an immediate, concrete resistance value on a visible curve, letting students predict the logarithmic curve's unevenness before dragging confirms it.

Color scheme: Blue curve for Linear taper, orange curve for Logarithmic taper, warm orange highlight on the active wiper marker, consistent with the palette used in this chapter's other diagrams.

Responsive behavior: The potentiometer rendering and graph panel stack vertically on narrow screens; the wiper slider remains full-width and touch-draggable.

Implementation: Plain p5.js, not the breadboard-sim-generator — this is a component-behavior explorer rather than a wired circuit, matching the pattern used by this book's other component decoder sims in Chapters 10 and 11.
```

## Related Resources

- [Chapter 12: "Diodes and LEDs"](../../chapters/12-diodes-and-leds/index.md)
