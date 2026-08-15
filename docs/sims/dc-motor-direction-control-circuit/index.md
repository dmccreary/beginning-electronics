---
title: DC Motor Control and Stall Current Explorer
description: Given a breadboard circuit with a 2N2222, a base switch, a flyback diode, and a small hobby motor, predict how the switch starts and stops the motor, how swapping its leads reverses spin direction, and how rising load drives current up to a stall spike.
status: scaffold
library: p5.js
bloom_level: Apply (L3) / Analyze (L4). Bloom Verb: demonstrate, predict, examine.
---

# DC Motor Control and Stall Current Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 18: "LEDs, RGB Color, and Motors"](../../chapters/18-leds-rgb-color-motors/index.md).

```text
Type: microsim
**sim-id:** dc-motor-direction-control-circuit<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students switch a rendered small hobby motor on and off through a 2N2222 transistor circuit, reverse its two leads to flip motor direction, and drag a mechanical-load slider up to a full stall and watch current spike far above the motor's normal running current.

Bloom Taxonomy: Apply (L3) / Analyze (L4). Bloom Verb: demonstrate, predict, examine.

Learning objective: Given a breadboard circuit with a 2N2222, a base switch, a flyback diode, and a small hobby motor, predict how the switch starts and stops the motor, how swapping its leads reverses spin direction, and how rising load drives current up to a stall spike.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: DC Motor Direction Control Circuit | Topic: DC motor, motor direction, motor control circuit, transistor driving a motor, motor load, motor stall current | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a rendered breadboard circuit with a transistor switch controlling a small DC motor, predict and observe how a control input starts, stops, and reverses the motor's spin direction" returned "Circuits" (dmccreary/microsims, WHAT score 0.5193, "generate") and "H Bridge" (dmccreary/microsims, 0.5138, "generate"), both below the 0.60 template threshold. H Bridge is the closer topical match but teaches four-transistor bidirectional switching aimed at a more advanced audience than this chapter's single-transistor, load/stall focus — flagged here as a reuse candidate once this course reaches full electronic direction reversal. This is a new, simpler specification, a strong candidate for the breadboard-sim-generator skill, extending `breadboard-lib.js` (already home to the transistor component from Chapter 13's `transistor-switch-breadboard-demo`) with a spinning-motor component and a load/stall current model.

Canvas layout: Main area shows a breadboard with a battery, a 2N2222 transistor, a base resistor and push-button, a flyback diode across the motor, and a small hobby motor with an animated spinning shaft; right panel holds a "Base Switch" toggle, a "Swap Motor Leads" button, a load slider (0% free-spinning to 100% stalled), a live current readout, and an infobox.

Components/elements involved: Breadboard with rails; battery; a labeled 2N2222 (base, collector, emitter); base resistor and push-button; flyback diode; a motor with an animated rotating shaft; wires; animated current-flow dots on the base and collector-emitter paths.

Required interactivity:
- Clicking "Base Switch" toggles base current; on spins the shaft and shows running current at the current load; off stops the shaft and drops current to zero
- Clicking "Swap Motor Leads" reverses the motor's polarity, reversing spin direction next time the switch is on, with the infobox noting direction depends only on current direction, not the transistor
- Dragging the load slider from 0% toward 100% slows the shaft and raises the current readout; at 100% the shaft stops, current spikes several times over, and a red "Stall current" warning flashes
- Hovering the flyback diode opens an infobox explaining it protects the transistor from the motor's switch-off voltage spike, reinforcing Chapter 12
- Button "Reset" returns to switch off, 0% load, standard lead orientation

Default state: Base switch off, motor stopped, load 0%, current readout "0 mA," infobox reads "Cutoff — no base current, motor off."

Data Visibility Requirements:
Stage 1: Show the base switch state and resulting motor spin state
Stage 2: Show the load percentage and shaft spin speed at that load
Stage 3: Show current rising with load, up to the stall spike at 100%
Stage 4: Show spin direction flipping after "Swap Motor Leads"

Instructional Rationale: An Apply/Analyze objective calls for a manipulable simulation with a continuously adjustable load, so students can push a safe, simulated motor to a stall and see the current spike without risk to a real part.

Color scheme: Green current dots on the base and collector-emitter paths, scaling with current; blue shaft graphic that slows and reddens near stall; red warning at 100% load, consistent with this chapter's other diagrams.

Responsive behavior: Breadboard and control panel stack vertically on narrow screens; the slider and toggle buttons stay full-width and touch-friendly.

Implementation: p5.js, breadboard-sim-generator approach, extending `breadboard-lib.js` (already home to Chapter 13's transistor component) with a spinning-motor component and a load/stall current model.
```

## Related Resources

- [Chapter 18: "LEDs, RGB Color, and Motors"](../../chapters/18-leds-rgb-color-motors/index.md)
