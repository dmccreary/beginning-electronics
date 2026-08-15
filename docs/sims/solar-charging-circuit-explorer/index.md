---
title: Solar Panel Charging Circuit Explorer
description: Given a rendered solar panel wired through a blocking diode and a TP4056-style charge module to a LiPo battery and LED load, adjust a sunlight-intensity slider and observe panel voltage/current, charging current into the battery, the automatic overcharge cutoff once full, and the LED switching to battery power at night.
status: scaffold
library: p5.js
bloom_level: Apply (L3) / Analyze (L4). Bloom Verb: demonstrate, examine, distinguish.
---

# Solar Panel Charging Circuit Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 23: "Signal Generators and Solar Power"](../../chapters/23-signal-generators-solar-power/index.md).

```text
Type: microsim
**sim-id:** solar-charging-circuit-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students adjust a simulated sunlight-intensity level on a rendered solar charging circuit and observe panel voltage/current, battery charge level rising over time, automatic overcharge cutoff at full charge, and the battery taking over to power an LED once sunlight drops to zero.

Bloom Taxonomy: Apply (L3) / Analyze (L4). Bloom Verb: demonstrate, examine, distinguish.

Learning objective: Given a rendered solar panel wired through a blocking diode and a TP4056-style charge module to a LiPo battery and LED load, adjust a sunlight-intensity slider and observe panel voltage/current, charging current into the battery, the automatic overcharge cutoff once full, and the LED switching to battery power at night.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Solar Panel Charging Circuit Explorer | Topic: solar cell, photovoltaic effect, solar panel wiring, charging circuit, battery overcharge protection, power budget | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a rendered solar panel wired to a charging circuit and rechargeable battery, adjust simulated sunlight intensity and observe voltage, current, and charging behavior including overcharge protection" returned "Solar Cell" (dmccreary/microsims, WHAT score 0.6437, recommendation "template") and "Solar Battery" (dmccreary/microsims, WHAT score 0.6118, recommendation "template") — both above the 0.60 threshold on general topic, but neither models this chapter's specific wiring (blocking diode, TP4056-style overcharge cutoff) or its junior-high reading level; reviewed as reference inspiration for the sunlight-to-output-current relationship, not directly reused. A keyword search of the catalog for "solar panel," "photovoltaic," and "charging circuit" found the same two entries and no closer match. New specification informed by that precedent. **Library/Implementation fit:** a strong second candidate for breadboard-sim-generator — the panel, blocking diode, charge module, and battery all sit in real tie-point holes exactly as a student would wire them, continuing the tie-point rendering approach Chapter 22 used for its 7805 sim.

Canvas layout: A rendered breadboard with a solar panel symbol wired through a blocking diode into a TP4056-style charge module, then to a LiPo battery symbol and an LED night-light load; a right-side panel holds a sunlight-intensity slider (0–100%, labeled "Night" to "Full Sun"), a "Fast-forward to Night" button, and readouts for panel voltage, charging current, and battery charge percentage.

Components/elements involved: Rendered breadboard with rails; solar panel (small blue-paneled rectangle with a sun icon); blocking diode; TP4056-style charge module; LiPo battery with a charge-level bar; LED load with resistor; sunlight-intensity slider; a virtual meter reading panel voltage and charging current.

Required interactivity:
- Moving the sunlight-intensity slider changes simulated panel voltage/current live (0% → 0 V/0 A, 100% → the panel's full rated output), driving a charging-current readout into the battery
- The battery's charge-percentage bar fills over simulated time while charging current flows, and holds steady rather than overfilling once it reaches 100% — visibly demonstrating overcharge protection cutting the charge current automatically
- Hovering the blocking diode opens an infobox explaining it prevents the battery from draining backward through the panel at night, connecting to Chapter 12's diode polarity concept
- Clicking the charge module opens an infobox describing its overcharge-protection role, explicitly naming the TP4056 module from Chapter 22
- Clicking "Fast-forward to Night" drops sunlight to 0% and shows the LED switching on, now powered from the battery instead of the panel

Default state: Sunlight slider at 70% ("Partly Sunny"), battery at 45% charge and rising, LED off (daytime); infobox reads "Slide toward Night and watch the LED turn on, powered by the battery instead of the panel."

Instructional Rationale: An Apply/Analyze-level objective needs a manipulable environmental parameter (sunlight) whose consequences — voltage, charging current, battery percentage, overcharge cutoff, and the nighttime handoff to battery power — are all visible together, letting students trace energy from sunlight to stored charge to nighttime light in one interactive view.

Color scheme: Blue solar panel with a yellow sun icon; red/black diode body; green charge-module PCB echoing the TP4056's real color from Chapter 22; LiPo battery rendered as a silver pouch with a green-to-red charge bar; warm yellow LED glow at night.

Responsive behavior: Breadboard rendering and control/readout panel stack vertically on narrow screens; slider and readouts remain full-width and legible at any viewport size.

Implementation: p5.js, built on the breadboard-sim-generator rendering approach (real tie-point hole grid, `bbVoltage()`-style solver) extended with a simple time-based charge accumulator for the battery percentage and a clamped overcharge cutoff.
```

## Related Resources

- [Chapter 23: "Signal Generators and Solar Power"](../../chapters/23-signal-generators-solar-power/index.md)
