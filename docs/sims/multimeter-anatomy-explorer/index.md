---
title: Multimeter Anatomy Explorer
description: Given a labeled illustration of a digital multimeter, identify the display, the rotary dial and its measurement positions, the red and black probes, and the COM and VΩmA jacks, and describe what each part does.
status: scaffold
library: p5.js
bloom_level: Remember (L1) / Understand (L2). Bloom Verb: identify, describe.
---

# Multimeter Anatomy Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 20: "Using a Multimeter"](../../chapters/20-using-a-multimeter/index.md).

```text
Type: infographic
**sim-id:** multimeter-anatomy-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students click or hover every labeled part of a digital multimeter's body — display, dial, probes, and jacks — to build a mental map of the tool before they use it on a real or simulated circuit.

Bloom Taxonomy: Remember (L1) / Understand (L2). Bloom Verb: identify, describe.

Learning objective: Given a labeled illustration of a digital multimeter, identify the display, the rotary dial and its measurement positions, the red and black probes, and the COM and VΩmA jacks, and describe what each part does.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Multimeter Anatomy Explorer | Topic: digital multimeter display, dial settings, probes, COM jack, VOhmmA jack, auto-ranging | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Identify the parts of a digital multimeter (display, dial, probes, jacks) by clicking labeled hotspots" returned a top match of "Vertical Line Test Explorer" (dmccreary/pre-calc, WHAT score 0.6015, recommendation "template") — above the 0.60 template threshold on the numeric score alone, but a manual sanity check rejects it: the candidate is a High School Geometry sim about the vertical line test, with no topical, component, or interaction overlap with a multimeter's parts. Treated as `generate` rather than `template`, per the reuse-check rule that a clearly wrong subject/grade-level match overrides a borderline score. A keyword grep of the 3,764-entry MicroSim catalog for "multimeter," "voltmeter," "ammeter," "ohmmeter," and "probe" returned no relevant matches. New specification.

Canvas layout: A large, centered illustration of a handheld digital multimeter (rounded rectangular body, yellow or orange casing) fills most of the canvas, with a small infobox panel below or beside it.

Components/elements involved: The multimeter's LCD display (top of the body, showing a sample reading like "4.98" with a "V" unit label); the rotary dial (center of the body, with position marks for OFF, V (DC volts), mA, Ω, and a continuity speaker-wave icon); the black probe plugged into a jack labeled "COM"; the red probe plugged into a jack labeled "VΩmA"; the two probe tips, shown as separate wire leads trailing off the bottom of the illustration.

Required interactivity:
- Clicking or hovering the display opens an infobox explaining that it shows the numeric result and unit of the current measurement, and that "OL" means the value is too large for the range
- Clicking or hovering the dial opens an infobox explaining that its position selects which of the meter's jobs (voltage, current, resistance, continuity) is active, and that it must always match the measurement being attempted
- Clicking or hovering the COM jack opens an infobox explaining that the black probe always plugs in here, for every measurement mode
- Clicking or hovering the VΩmA jack opens an infobox explaining that the red probe plugs in here for voltage, resistance, and small-current measurements
- Clicking or hovering either probe tip opens an infobox reinforcing the red-positive, black-negative color convention
- Button "Reset" clears any selected hotspot and returns to the default state

Default state: No hotspot selected; infobox reads "Click any part of the multimeter to learn what it does."

Instructional Rationale: A Remember/Understand-level "identify/describe" objective is best served by a clickable labeled illustration with static, discoverable hotspots — not animation — so students can explore each part at their own pace and revisit any one of them before moving on to actual measurements.

Color scheme: Yellow-orange meter body (matching common real-world multimeter casings), blue highlight ring around the currently selected hotspot, red and black leads drawn in their true probe colors.

Responsive behavior: The multimeter illustration scales to canvas width; the infobox panel moves below the illustration on narrow screens instead of beside it.

Implementation: Plain p5.js, not the breadboard-sim-generator — this is a standalone labeled-component illustration, not a wired circuit. Static hotspot regions with hover/click detection and a single infobox panel.
```

## Related Resources

- [Chapter 20: "Using a Multimeter"](../../chapters/20-using-a-multimeter/index.md)
