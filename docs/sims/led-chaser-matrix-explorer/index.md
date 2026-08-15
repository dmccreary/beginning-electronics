---
title: LED Chaser and Matrix Wiring Explorer
description: Compare how six LEDs are wired under parallel LED wiring versus an LED matrix layout, and demonstrate a blinking output pattern by starting a chaser sequence and observing which single LED is lit at each step.
status: scaffold
library: p5.js
bloom_level: Understand (L2) / Apply (L3). Bloom Verb: compare, demonstrate, differentiate.
---

# LED Chaser and Matrix Wiring Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 18: "LEDs, RGB Color, and Motors"](../../chapters/18-leds-rgb-color-motors/index.md).

```text
Type: microsim
**sim-id:** led-chaser-matrix-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students compare parallel LED wiring against an LED matrix's row/column wiring, and run a chaser effect, so the wire-count trade-off and chaser timing both become visible.

Bloom Taxonomy: Understand (L2) / Apply (L3). Bloom Verb: compare, demonstrate, differentiate.

Learning objective: Compare how six LEDs are wired under parallel LED wiring versus an LED matrix layout, and demonstrate a blinking output pattern by starting a chaser sequence and observing which single LED is lit at each step.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: LED Chaser and LED Matrix Blinking Pattern | Topic: LED strip, LED matrix, LED chaser effect, blinking output pattern, driving multiple LEDs, parallel LED wiring | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Compare wiring multiple LEDs in parallel versus as an LED strip or matrix, and predict the lit pattern produced by a chaser or blinking sequence" returned a top match of "Animation Pattern Comparison" (dmccreary/moving-rainbow, WHAT score 0.5816, "generate") — below the 0.60 template threshold, naming pre-recorded animation algorithms rather than comparing wiring topologies. Two lower matches (linear-algebra matrix visualizers) are unrelated despite the word "matrix." This is a new specification, a strong candidate for the breadboard-sim-generator skill, extending `breadboard-lib.js` with a six-LED row redrawable as a grid for the matrix view.

Canvas layout: Main area shows a breadboard with six LEDs in a row, each with its own resistor, wired in parallel; a mode toggle switches the same six LEDs into a 2x3 grid labeled with row/column wires; right panel holds a "Play Chaser" button, a speed slider, a wire-count readout, and an infobox.

Components/elements involved: Breadboard with rails; battery; six LEDs, each with its own resistor in parallel mode or at row/column intersections in matrix mode; wires that redraw between modes; animated current-flow and lit-LED indicators.

Required interactivity:
- Toggling Parallel/Matrix mode redraws the wiring and updates a live wire-count readout ("12 wires" parallel, "5 wires" matrix)
- Clicking "Play Chaser" lights the six LEDs one at a time in a looping sequence, with the lit LED's position named in the infobox
- Dragging the speed slider changes how fast the chaser steps
- Hovering any LED opens an infobox stating its wiring role in the current mode
- Button "Reset" stops the chaser, returns to Parallel mode, all LEDs off

Default state: Parallel mode, chaser stopped, wire-count readout "12 wires," infobox reads "Parallel LED wiring — each LED is its own independent branch."

Data Visibility Requirements:
Stage 1: Show which mode is active
Stage 2: Show the live wire-count readout for that mode
Stage 3: Show which single LED is lit at each chaser step
Stage 4: Show the chaser looping back to the first LED

Instructional Rationale: An Understand/Apply "compare/demonstrate" objective calls for a toggleable layout with a live wire-count readout, so students see the wiring trade-off directly, plus a running chaser to make "blinking output pattern" concrete.

Color scheme: Green current dots on lit branches, orange highlight on the lit chaser LED, gray for off LEDs, consistent with this chapter's other diagrams.

Responsive behavior: Breadboard and control panel stack vertically on narrow screens; buttons and sliders stay full-width and touch-friendly.

Implementation: p5.js, breadboard-sim-generator approach, extending `breadboard-lib.js` with a redrawable parallel/matrix layout and a chaser timing loop.
```

## Related Resources

- [Chapter 18: "LEDs, RGB Color, and Motors"](../../chapters/18-leds-rgb-color-motors/index.md)
