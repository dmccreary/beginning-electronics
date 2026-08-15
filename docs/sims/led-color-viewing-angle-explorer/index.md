---
title: LED Color, Viewing Angle, and Lens Shape Explorer
description: Compare forward voltage across red, green, and blue LEDs using a live bar chart, and explain how a rounded dome lens versus a flat, diffused lens changes an LED's viewing angle.
status: scaffold
library: p5.js
bloom_level: Understand (L2). Bloom Verb: compare, explain.
---

# LED Color, Viewing Angle, and Lens Shape Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 12: "Diodes and LEDs"](../../chapters/12-diodes-and-leds/index.md).

```text
Type: microsim
**sim-id:** led-color-viewing-angle-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students compare forward voltage across red, green, and blue LEDs, and see how switching between a rounded-dome lens and a flat, diffused lens changes an LED's viewing angle.

Bloom Taxonomy: Understand (L2). Bloom Verb: compare, explain.

Learning objective: Compare forward voltage across red, green, and blue LEDs using a live bar chart, and explain how a rounded dome lens versus a flat, diffused lens changes an LED's viewing angle.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: LED Color Forward Voltage and Viewing Angle Explorer | Topic: Red green and blue LED forward voltage comparison, LED viewing angle cone, LED lens shape effect on light spread | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Compare forward voltage across red green and blue LEDs and explain how lens shape changes an LED's viewing angle" returned three matches, all below the 0.60 template threshold: "Brightness Envelopes for Advanced Patterns" (0.5652, Chart.js, moving-rainbow repo), "HSV Color Space Explorer" (0.5549), and "LED Nightlight Circuit" (0.5382) — all built around LED animation effects or color theory rather than forward-voltage or lens-shape comparisons. A keyword grep of the 3,764-entry catalog for "led color," "forward voltage," and "viewing angle" returned zero hits. This is a new specification. Per this course's MicroSim guidance, a breadboard-based rendering was also considered for this concept, but a side-by-side comparison chart better serves the compare/explain objective than a single wired LED circuit would.

Canvas layout: Left side shows a rendered LED with an adjustable lens-shape toggle and an animated light-cone graphic showing beam spread; right side holds a color selector (red/green/blue), a live forward-voltage readout, a small bar chart comparing all three colors' forward voltages, and an infobox.

Components/elements involved: A rendered LED with a swappable lens shape (rounded dome or flat/diffused); an animated light-cone graphic whose spread angle changes with lens shape; a three-color selector; a bar chart of forward voltage by color; a viewing-angle readout in degrees.

Required interactivity:
- Selecting a color (red, green, or blue) updates the rendered LED's glow color, the forward-voltage readout, and the highlighted bar on the chart
- Toggling lens shape between rounded dome and flat/diffused animates the light cone narrowing to about 20-30 degrees or widening to 100 degrees or more, with the angle readout updating live
- Hovering any bar on the chart shows that color's exact forward-voltage range
- Hovering the light cone opens an infobox stating the LED viewing angle definition
- Button "Reset" returns to the default state

Default state: Red LED selected, rounded dome lens, light cone at approximately 30 degrees, forward-voltage readout "≈ 2.0 V," bar chart highlighting the red bar.

Data Visibility Requirements:
Stage 1: Show the selected color and its forward-voltage readout
Stage 2: Show that color's bar highlighted against the other two on the comparison chart
Stage 3: Show the selected lens shape and the resulting light-cone angle
Stage 4: Show the light cone redrawn at its new angle when the lens shape is toggled

Instructional Rationale: An Understand-level "compare/explain" objective benefits from side-by-side, live-updating visuals — a bar chart plus a beam-angle cone — so students connect a discrete choice (color, lens shape) directly to a concrete visual and numeric consequence, rather than reading the same facts as static text.

Color scheme: True LED glow colors (red, green, blue) for the rendered LED; warm orange outline for the light cone; blue bars on the forward-voltage chart with the active color's bar highlighted in orange.

Responsive behavior: The LED/cone illustration and the chart/selector panel stack vertically on narrow screens; the color selector and lens-shape toggle remain large, touch-friendly buttons.

Implementation: Plain p5.js, not the breadboard-sim-generator — this is a component-comparison exercise rather than a wired circuit, matching the standalone decoder pattern used by Chapters 10 and 11's component sims.
```

## Related Resources

- [Chapter 12: "Diodes and LEDs"](../../chapters/12-diodes-and-leds/index.md)
