---
title: Electron Flow vs. Conventional Current
description: Explain why conventional current is drawn from positive to negative even though electrons physically flow from negative to positive, by toggling between an animated electron-flow view and an animated conventional-current view of the same battery-and-resistor loop.
status: scaffold
library: p5.js
bloom_level: Understand (L2). Bloom Verb: explain.
---

# Electron Flow vs. Conventional Current



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 2: "Current, Charge, Units, and Electrical Safety"](../../chapters/02-current-charge-units-safety/index.md).

```text
Type: microsim
**sim-id:** electron-vs-conventional-current<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Template:** https://github.com/dmccreary/intro-to-physics-course/tree/main/docs/sims/current-animation

Purpose: Resolve the beginner confusion between electron flow and conventional current by showing both directions on the same simple circuit, under learner control.

Bloom Taxonomy: Understand (L2). Bloom Verb: explain.

Learning objective: Explain why conventional current is drawn from positive to negative even though electrons physically flow from negative to positive, by toggling between an animated electron-flow view and an animated conventional-current view of the same battery-and-resistor loop.

Canvas layout:
- Center (roughly 80% of width): a single closed-loop circuit diagram — a battery, a wire loop, and one resistor — drawn large enough for moving dots to be clearly visible
- Bottom strip (remaining height): a control bar with the view toggle, a play/pause button, and a speed slider

Visual elements:
- The battery drawn with its positive (long line) and negative (short line) terminals clearly labeled
- Small orange dots representing electrons, animated moving through the wire
- A separate, larger arrow representing conventional current, shown in blue, animated moving through the wire
- A label near the moving dots/arrow that updates to read either "Electron Flow (real motion)" or "Conventional Current (the arrow engineers draw)"

Interactive controls:
- Toggle switch or two buttons: "Show Electron Flow" and "Show Conventional Current"
- Button: Play/Pause the animation
- Slider: Animation speed (slow to fast)
- Hover over the battery to see a tooltip confirming which terminal is positive and which is negative

Default parameters:
- View starts on "Show Electron Flow," paused, with a "Press Play" prompt
- Medium animation speed

Data Visibility Requirements:
  Stage 1 (Electron Flow view): Show orange electron dots moving from the negative terminal, around the loop, into the positive terminal, with a label reading "Electrons move negative to positive — this is the real, physical motion"
  Stage 2 (toggle to Conventional Current view): Show the same loop with a blue arrow moving from the positive terminal, around the loop, into the negative terminal, with a label reading "Conventional current is drawn positive to negative — this is the direction engineers agreed to use on every diagram"
  Stage 3 (both views available on demand): Learner can toggle back and forth as many times as needed, always on the identical circuit, so the only thing that changes is direction and label

Instructional Rationale: This is an Understand-level objective, so the design deliberately uses a controlled toggle between two labeled, concrete views rather than showing both directions superimposed, which would be visually confusing for a first encounter. Letting the learner flip back and forth on demand, at a pace they control, is what makes the historical-convention explanation click instead of feeling like an arbitrary rule to memorize.

Color scheme: Orange dots for electron flow (matching Volt's eye color and this book's accent color), blue arrow for conventional current (matching the book's primary theme color), on a light circuit-diagram background.

Responsive behavior: The circuit diagram scales to fill the available width; the control bar reflows below the diagram on narrow screens, and all buttons remain reachable by touch on mobile devices.

Implementation: p5.js, with electron dots as an array of positions animated along a predefined loop path, and the conventional-current arrow drawn as a single animated segment moving along the same path in the opposite direction.
```

## Related Resources

- [Chapter 2: "Current, Charge, Units, and Electrical Safety"](../../chapters/02-current-charge-units-safety/index.md)
