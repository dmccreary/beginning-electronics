---
title: 555 Pin Numbering and IC Notch Orientation
description: Given a top-down view of an 8-pin DIP chip with a notch, identify pin 1 and correctly count the remaining pins counter-clockwise, and describe what happens electrically when the chip is inserted rotated 180 degrees from its intended orientation.
status: scaffold
library: p5.js
bloom_level: Remember (L1) / Understand (L2). Bloom Verb: identify, describe, locate.
---

# 555 Pin Numbering and IC Notch Orientation



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 14: "The 555 Timer Chip"](../../chapters/14-555-timer-chip/index.md).

```text
Type: infographic
**sim-id:** ic-pin-numbering-notch-orientation<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Teach the general skill of reading any DIP chip's pin numbers from its notch, using the 555 timer's own eight pins as the worked example, and show what goes electrically wrong when a chip is inserted backward.

Bloom Taxonomy: Remember (L1) / Understand (L2). Bloom Verb: identify, describe, locate.

Learning objective: Given a top-down view of an 8-pin DIP chip with a notch, identify pin 1 and correctly count the remaining pins counter-clockwise, and describe what happens electrically when the chip is inserted rotated 180 degrees from its intended orientation.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: IC Pin Numbering and Notch Orientation | Topic: DIP integrated circuit pin numbering counterclockwise from notch, IC notch orientation on a breadboard | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Identify pin 1 of a DIP integrated circuit from its notch and correctly orient the chip when inserting it into a breadboard" returned a top match of "Breadboard" (dmccreary/microsims, WHAT score 0.4414, recommendation "generate") — a generic empty breadboard renderer with no chip or pin-numbering logic — below the 0.60 template threshold. This is written as a new specification, modeled on Chapter 13's "ic-preview-555-74hc595" click-to-reveal infographic pattern (same catalog, same style) but focused specifically on the 555's own eight pin names instead of a generic chip preview.

Canvas layout: Main area shows a rendered 8-pin DIP chip with a semicircular notch at one end, straddling a drawn breadboard center-channel outline for context; right side panel holds a "Rotate 180°" button and an infobox.

Components/elements involved: Chip body outline; notch marker; eight numbered, individually clickable pin pads that reveal their 555 names (GND, TRIGGER, OUTPUT, RESET, CONTROL VOLTAGE, THRESHOLD, DISCHARGE, VCC) once clicked; a highlighted "Pin 1" indicator near the notch; breadboard center-channel outline.

Required interactivity:
- Clicking any pin pad opens an infobox showing that pin's number, its counting position relative to the notch (for example, "2 pins counter-clockwise from the notch"), and its 555 function name
- Clicking the "Rotate 180°" button spins the chip's orientation; when rotated, the notch moves to the opposite end, and clicking any pin now shows a warning infobox explaining that pin 1 (GND) would sit where pin 5 (CONTROL VOLTAGE) belongs — the chip's power, ground, and signal pins would all be swapped
- Hovering the notch itself, in either orientation, highlights it and displays "This notch marks Pin 1 — always start counting here, going counter-clockwise"
- Button "Reset" returns the chip to its correct, un-rotated orientation

Default state: Chip correctly oriented with the notch at the left end, no pin selected, infobox reads "Click a pin, or the notch, to see how IC pin numbering works."

Data Visibility Requirements:
Stage 1: Show the notch position and the label "Pin 1 starts here"
Stage 2: On pin click, show that pin's number and counting direction from the notch
Stage 3: On pin click, show that pin's 555 function name
Stage 4: On rotate, show the mismatch between the chip's physical pins and the breadboard holes it would actually be plugged into

Instructional Rationale: A Remember/Understand "identify/describe" objective calls for a simple click-to-reveal exploration rather than a manipulated simulation, matching this reading level's guidance to avoid unnecessary animation; the rotate control turns the abstract warning "line up the notch" into a concrete, visible consequence.

Color scheme: Blue chip outline matching the site's primary theme color, orange notch highlight matching the accent color, red highlight overlay when rotated to show the pin mismatch — consistent with Chapter 13's IC preview diagram.

Responsive behavior: The chip view and control panel stack vertically on narrow screens; pin pads remain large enough to tap comfortably on mobile.

Implementation: Plain p5.js, not the breadboard-sim-generator — a click-to-reveal orientation diagram, matching the approach of Chapter 13's IC-preview sim rather than a wired, solved circuit.
```

## Related Resources

- [Chapter 14: "The 555 Timer Chip"](../../chapters/14-555-timer-chip/index.md)
