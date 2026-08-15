---
title: 7805 Voltage Regulator Breadboard Circuit
description: Given a rendered breadboard circuit with a 7805 regulator, a 334 input bypass capacitor, a 104 output bypass capacitor, and an LED output indicator, adjust the input voltage with a slider and observe the point at which the regulated 5V output stops holding steady, calculating the dropout voltage from the observed transition.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, calculate.
---

# 7805 Voltage Regulator Breadboard Circuit



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 22: "Batteries, Regulators, and Buck Converters"](../../chapters/22-batteries-regulators-buck-converters/index.md).

```text
Type: microsim
**sim-id:** 7805-regulator-breadboard<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students build intuition for how a 7805 linear regulator responds to changing input voltage — holding a steady 5V output across a range of inputs, then visibly failing to regulate once input drops below the dropout floor — using a rendered breadboard circuit with bypass capacitors and a virtual meter.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, calculate.

Learning objective: Given a rendered breadboard circuit with a 7805 regulator, a 334 input bypass capacitor, a 104 output bypass capacitor, and an LED output indicator, adjust the input voltage with a slider and observe the point at which the regulated 5V output stops holding steady, calculating the dropout voltage from the observed transition.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: 7805 Voltage Regulator Breadboard Circuit | Topic: 7805 linear voltage regulator, bypass capacitors, dropout voltage, heat sink | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a breadboard-mounted 7805 voltage regulator circuit with input and output bypass capacitors, adjust the input voltage and observe the regulated output and dropout behavior" returned a top match of "Breadboard" (dmccreary/microsims, WHAT score 0.4449, recommendation "generate") — well below the 0.60 template threshold. A keyword search of the 3,764-entry MicroSim catalog for "voltage regulator," "7805," "buck converter," and "TP4056" found nothing relevant. New specification. **Library/Implementation fit:** a strong fit for the breadboard-sim-generator skill — the 7805, its two bypass capacitors, and an LED indicator sit in real tie-point holes on a rendered breadboard exactly as a student would wire them, and the input-voltage slider drives the same `bbVoltage()` solver used elsewhere in this course, clamped to model dropout.

Canvas layout: A rendered breadboard occupying the left/main area with a 7805 (TO-220 body) straddling the center channel, a 334 capacitor at the input pin and a 104 capacitor at the output pin, and a 470 Ω-resistor-plus-LED output indicator; a right-side panel holds an input-voltage slider, an on/off power switch, and a two-line voltmeter readout (Vin, Vout).

Components/elements involved: Rendered breadboard with rails; 7805 regulator (3 pins: Vin, GND, Vout); 334 input bypass capacitor (0.33 µF); 104 output bypass capacitor (0.1 µF); 470 Ω resistor; red LED indicator; a virtual voltmeter reading both Vin and Vout simultaneously; an input-voltage slider (0–15 V); a power switch.

Required interactivity:
- Moving the input-voltage slider changes Vin live; Vout tracks a regulated model: exactly 5.00 V whenever Vin is 7 V or higher, and equal to (Vin − 2 V), falling below 5 V, whenever Vin is below 7 V — visibly demonstrating dropout
- The LED indicator brightens with Vout up to full brightness at 5 V, and visibly dims once Vout sags below its own forward-voltage threshold during dropout
- Hovering the 334 or 104 capacitor opens an infobox recalling its capacitor value code (Chapter 11) and its bypass role at that specific pin
- Clicking the 7805 body opens an infobox showing its three-pin layout (Vin, GND, Vout) and a one-line reminder of the dropout-voltage relationship
- A "Show Dropout Zone" checkbox shades the slider's 0–7 V range in red, letting students predict the dropout boundary before sliding into it

Default state: Power off, slider at 9 V, LED dark; once switched on, Vout reads 5.00 V and the LED lights at full brightness; infobox reads "Slide Vin down below about 7 V and watch what happens to Vout."

Instructional Rationale: An Apply-level "demonstrate/calculate" objective needs a manipulable parameter with an immediately visible, quantifiable consequence — sliding Vin and watching Vout and the LED respond in real time lets a student discover the dropout boundary experimentally instead of only reading about it, then confirm it against the chapter's equation.

Color scheme: Black 7805 body with a silver metal tab; blue capacitor bodies labeled with their printed codes; red LED; green "regulated" state vs. amber "dropout" state on the Vout readout.

Responsive behavior: Breadboard and control panel stack vertically on narrow screens; slider and readouts remain full-width and legible at any viewport size.

Implementation: p5.js, built on the breadboard-sim-generator rendering approach (real tie-point hole grid, `bbVoltage()` for readouts); the regulator's clamped dropout response is a small function layered on top of the standard solver rather than a full SPICE-accurate model.
```

## Related Resources

- [Chapter 22: "Batteries, Regulators, and Buck Converters"](../../chapters/22-batteries-regulators-buck-converters/index.md)
