---
title: 74HC595 Datasheet Pinout Diagram Reader
description: Given a top-down datasheet-style pinout diagram of a 16-pin DIP chip with both a notch and a pin-1 dot, identify pin 1, count the remaining pins counter-clockwise, and locate each pin's printed function label.
status: scaffold
library: p5.js
bloom_level: Remember (L1) / Understand (L2). Bloom Verb: identify, describe, locate.
---

# 74HC595 Datasheet Pinout Diagram Reader



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 15: "Shift Registers and IC Handling"](../../chapters/15-shift-registers-ic-handling/index.md).

```text
Type: infographic
**sim-id:** 74hc595-datasheet-pinout-reader<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Teach the general skill of reading any DIP chip's datasheet pinout diagram, using the 74HC595's own 16 pins as the worked example, and reinforce the Pin 1 Dot Marker as a second orientation check alongside the notch from Chapter 14.

Bloom Taxonomy: Remember (L1) / Understand (L2). Bloom Verb: identify, describe, locate.

Learning objective: Given a top-down datasheet-style pinout diagram of a 16-pin DIP chip with both a notch and a pin-1 dot, identify pin 1, count the remaining pins counter-clockwise, and locate each pin's printed function label.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: 74HC595 Datasheet Pinout Diagram Reader | Topic: DIP package IC pin numbering from pin 1 dot marker, standard IC pin spacing, reading a datasheet pinout diagram | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Identify pin 1 of a 16-pin DIP chip from its dot marker and correctly read each pin's function from a datasheet pinout diagram" returned a top match of "Shift Register MicroSim" (dmccreary/digital-electronics, WHAT score 0.5169, recommendation "generate") — below the 0.60 template threshold, since that catalog entry is a working circuit simulation rather than a pinout-reading exercise. A keyword grep of `microsims-data.json` for "IC pinout" and "DIP package" found no direct matches; the closest keyword hit, "Pico Pinout Explorer" (dmccreary/learning-micropython, grade levels 5-12, "Students can identify the function of each pin... by name and number"), confirms strong topical and grade-level precedent for a click-to-reveal pinout exercise, but is Pico-board-specific with no DIP/notch/dot logic, so it is not reused. This is written as a new specification, modeled directly on this book's own Chapter 14 "ic-pin-numbering-notch-orientation" click-to-reveal infographic (same repository, same style), extended from an 8-pin chip to a 16-pin chip and from notch-only orientation to notch-plus-dot orientation.

Canvas layout: Main area shows a rendered 16-pin DIP chip with a semicircular notch at one end and a small pin-1 dot in the corner nearest pin 1, straddling a drawn breadboard center-channel outline for context; right side panel holds a "Rotate 180°" button and an infobox.

Components/elements involved: Chip body outline; notch marker; pin-1 dot marker; sixteen numbered, individually clickable pin pads that reveal their 74HC595 names (Q1-Q7, GND, QH′, SRCLR′, SRCLK, RCLK, OE′, SER, Q0, VCC) once clicked; a highlighted "Pin 1" indicator near the notch and dot; breadboard center-channel outline.

Required interactivity:
- Clicking any pin pad opens an infobox showing that pin's number, its counting position relative to the notch, and its 74HC595 function name pulled from the same pin table shown earlier in this chapter
- Clicking the "Rotate 180°" button spins the chip's orientation; when rotated, both the notch and the dot move to the opposite end together, and clicking any pin shows a warning infobox explaining which pins would land on the wrong breadboard columns
- Hovering the notch or the dot, in either orientation, highlights both together and displays "Notch and dot always agree — either one marks Pin 1"
- Button "Reset" returns the chip to its correct, un-rotated orientation

Default state: Chip correctly oriented with the notch and dot at the left end, no pin selected, infobox reads "Click a pin, the notch, or the dot to see how a datasheet pinout diagram works."

Data Visibility Requirements:
Stage 1: Show the notch and dot positions together with the label "Pin 1 starts here"
Stage 2: On pin click, show that pin's number and counting direction from pin 1
Stage 3: On pin click, show that pin's 74HC595 function name
Stage 4: On rotate, show which pins would be misaligned with their intended breadboard columns

Instructional Rationale: A Remember/Understand "identify/locate" objective calls for the same simple click-to-reveal exploration Chapter 14 used for the 555, matching this reading level's guidance to avoid unnecessary animation; extending it to 16 pins and a second orientation marker (the dot) gives students practice generalizing a skill they already trust to a less familiar chip.

Color scheme: Blue chip outline matching the site's primary theme color, orange notch and dot highlight matching the accent color, red highlight overlay when rotated to show pin mismatch — consistent with Chapter 14's IC pin numbering diagram.

Responsive behavior: The chip view and control panel stack vertically on narrow screens; pin pads remain large enough to tap comfortably on mobile.

Implementation: Plain p5.js, not the breadboard-sim-generator — a click-to-reveal orientation diagram, matching the approach of Chapter 14's IC pin numbering sim rather than a wired, solved circuit.
```

## Related Resources

- [Chapter 15: "Shift Registers and IC Handling"](../../chapters/15-shift-registers-ic-handling/index.md)
