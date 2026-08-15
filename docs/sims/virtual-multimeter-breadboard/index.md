---
title: Virtual Multimeter Breadboard
description: Given a multimeter dial mode and a wired breadboard circuit with five labeled test-point pairs, select the correct mode for each measurement and read the resulting voltage, current, resistance, or continuity result, connecting each reading to the concept it demonstrates.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, measure, verify.
---

# Virtual Multimeter Breadboard



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 20: "Using a Multimeter"](../../chapters/20-using-a-multimeter/index.md).

```text
Type: microsim
**sim-id:** virtual-multimeter-breadboard<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students select a multimeter dial mode and touch virtual probes to labeled test points on a wired breadboard circuit, reading a live voltage, current, resistance, or continuity result for each one — practicing every mode this chapter taught before ever picking up a real meter.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, measure, verify.

Learning objective: Given a multimeter dial mode and a wired breadboard circuit with five labeled test-point pairs, select the correct mode for each measurement and read the resulting voltage, current, resistance, or continuity result, connecting each reading to the concept it demonstrates.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Virtual Multimeter Breadboard Probe | Topic: digital multimeter, dial settings, voltage measurement, current measurement, resistance measurement, continuity testing, probes | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a multimeter dial and probes on a wired breadboard circuit, select the correct measurement mode and touch probes to circuit points to read voltage, current, resistance, or continuity" topped out at "Breadboard" (dmccreary/microsims, WHAT score 0.5786, recommendation "generate") — below the 0.60 template threshold and not multimeter-aware. A keyword grep of the 3,764-entry MicroSim catalog for "multimeter," "voltmeter," "ammeter," "ohmmeter," and "probe" found no relevant matches. New specification, extending `breadboard-lib.js` with a new multimeter/probe component and five labeled test-point pairs on the existing rendered breadboard, reusing the resistor, LED, switch, and battery components already in the library. **Library/Implementation fit:** this is exactly the "virtual multimeter" use case the breadboard-sim-generator skill is built for — components sit in real tie-point holes and the multimeter probes touch those same holes, so the circuit-solver output (`bbVoltage()`, `bbCurrent()`) can drive every mode's reading directly instead of a separate calculation.

Canvas layout: Breadboard on the left with a battery, a resistor R1 (220 Ω) in series with a switch SW1 and a red LED D1, plus a second, unconnected resistor R2 (470 Ω) sitting off to one side of the board for out-of-circuit practice; right panel holds a mode selector (V / mA / Ω / Continuity buttons), five glowing test-point labels (A: battery terminals, B: across D1, C: a break point in the LED branch, D: across SW1, E: across R2), a reading display, and an infobox.

Components/elements involved: Breadboard with rails; battery (5 V); R1 220 Ω; SW1 switch; D1 red LED; R2 470 Ω (unconnected, for resistance practice); a drawn multimeter body with dial and two probes; five labeled bracket callouts marking valid test-point pairs; current-flow dots on energized branches.

Required interactivity:
- Clicking a mode button (V, mA, Ω, Continuity) sets the meter's active mode; only the test points valid for that mode glow and become clickable, the rest dim
- Clicking a glowing test point "touches" the probes there and shows the live reading: Test Point A in V mode reads battery voltage (~5.0 V); Test Point B in V mode reads the LED's forward-voltage drop (~1.9 V) when SW1 is closed; Test Point C in mA mode reads the branch current (~14 mA) when SW1 is closed; Test Point D in Continuity mode beeps (shown as an animated sound-wave icon) when SW1 is closed and stays silent when open; Test Point E in Ω mode reads ~470 Ω
- Clicking a dimmed (invalid-for-this-mode) test point opens an infobox explaining why that combination is wrong — for example, clicking Test Point B while in Ω mode explains that resistance can't be measured on a powered, in-circuit component
- Toggling SW1 on the board itself (click) opens or closes the LED branch, changing what Test Points B, C, and D report
- Button "Reset" returns the mode to OFF, SW1 to open, and clears the reading display

Default state: Mode OFF, SW1 open, no test point selected; infobox reads "Pick a mode, then click a glowing test point to take a measurement."

Data Visibility Requirements:
Stage 1: Show the selected dial mode
Stage 2: Show which test points are valid (glowing) versus invalid (dimmed) for that mode
Stage 3: Show the exact probe placement (red/black leads) at the selected test point
Stage 4: Show the resulting numeric reading (or beep) and its connection to the underlying circuit value

Instructional Rationale: An Apply-level "demonstrate/measure/verify" objective calls for a manipulable instrument paired with a real circuit, so students connect the abstract rule ("resistance mode needs no power") to a concrete, clickable consequence, rather than reading the rule as text alone.

Color scheme: Yellow-orange multimeter body consistent with the anatomy diagram above; green glow on valid test points, gray dimming on invalid ones; orange current-flow dots; red flash and shake on an invalid-mode click.

Responsive behavior: Breadboard and control panel stack vertically on narrow screens; mode buttons and test-point labels remain large and touch-friendly.

Implementation: p5.js, breadboard-sim-generator approach, extending `breadboard-lib.js` with a new multimeter/probe component, five labeled test-point hotspots tied to existing pin addresses, and a mode-aware validity check that reads `bbVoltage()` and `bbCurrent()` from the existing circuit solver.
```

## Related Resources

- [Chapter 20: "Using a Multimeter"](../../chapters/20-using-a-multimeter/index.md)
