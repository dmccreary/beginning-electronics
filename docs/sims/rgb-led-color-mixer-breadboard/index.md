---
title: RGB LED Color Mixing Breadboard
description: Given three brightness sliders wired to a common-cathode RGB LED on a breadboard, predict and observe the resulting blended color, and reproduce the common mixes (yellow, magenta, cyan, white) from the chapter text.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, predict, apply.
---

# RGB LED Color Mixing Breadboard



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 18: "LEDs, RGB Color, and Motors"](../../chapters/18-leds-rgb-color-motors/index.md).

```text
Type: microsim
**sim-id:** rgb-led-color-mixer-breadboard<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students drag three brightness sliders for a rendered common-cathode RGB LED and directly observe additive color mixing on a wired breadboard circuit.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, predict, apply.

Learning objective: Given three brightness sliders wired to a common-cathode RGB LED on a breadboard, predict and observe the resulting blended color, and reproduce the common mixes (yellow, magenta, cyan, white) from the chapter text.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: RGB LED Color Mixing Breadboard | Topic: RGB LED, common cathode RGB, common anode RGB, color mixing with LEDs, LED brightness control | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given three sliders for red, green, and blue LED brightness, predict and observe the resulting mixed color on a breadboard-rendered RGB LED, demonstrating additive color mixing" returned a top match of "RGB Color Mixer" (dmccreary/learning-python, WHAT score 0.6062, "template") — a bare color swatch mixer from a Geometry repo, with no wired circuit or resistors. "NeoPixel Color Mixer" (0.5757) and "Rainbow Color Picker" (0.5485) scored lower and are also unwired. Per this course's guidance to prefer breadboard-rendered circuits, this is a new specification, extending this repository's `breadboard-lib.js` (already used by `button-led-breadboard`, `light-dark-detector`, `wired-logic-and-or`) with three resistor-and-LED branches sharing one RGB LED's common lead.

Canvas layout: Main area shows a rendered breadboard with a battery, three resistors (one per color anode), and one RGB LED rendered as three overlapping colored dies inside a single lens; right panel holds three vertical brightness sliders (R, G, B, 0-255), a color swatch, a Common Cathode / Common Anode toggle, and four presets (Yellow, Magenta, Cyan, White).

Components/elements involved: Breadboard with rails; battery; three resistors; one RGB LED with three hoverable dies; connecting wires; animated current-flow dots on each color branch, moving faster as that channel's slider rises.

Required interactivity:
- Dragging a brightness slider changes that die's glow, that branch's current speed, and the blended swatch color live
- Clicking a preset (Yellow, Magenta, Cyan, White) snaps all three sliders to that color's values
- Toggling Common Cathode / Common Anode redraws the wiring and flips the on-state logic in the infobox
- Hovering a die opens an infobox naming that color channel and its current slider value
- Button "Reset" returns all sliders to 0 with Common Cathode selected

Default state: Common Cathode, all sliders at 0, LED dark, infobox reads "All three channels off — no current, no light."

Data Visibility Requirements:
Stage 1: Show all three slider values at once
Stage 2: Show each die's glow matching its slider
Stage 3: Show the additively blended swatch color
Stage 4: Show current speed on each branch, scaled to brightness

Instructional Rationale: An Apply-level "demonstrate/predict" objective calls for parameter exploration where dragging a slider produces an immediate color change, building intuition for additive mixing rather than memorizing a rule.

Color scheme: True RGB glow colors on sliders and dies; swatch at true computed color; green current dots scaled by brightness, consistent with this chapter's other diagrams.

Responsive behavior: Breadboard and slider/swatch panel stack vertically on narrow screens; sliders stay full-width and touch-draggable.

Implementation: p5.js, breadboard-sim-generator approach, extending `breadboard-lib.js` with three resistor-and-LED branches feeding one shared RGB LED lead.
```

## Related Resources

- [Chapter 18: "LEDs, RGB Color, and Motors"](../../chapters/18-leds-rgb-color-motors/index.md)
