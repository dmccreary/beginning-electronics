---
title: Transistor Motor Driver — Base Resistor and Darlington Pair Explorer
description: Given a target motor current and a selected transistor (BC547 or 2N2222) or a Darlington pair of two BC547s, calculate a safe base resistor value using \( R_B = (V_{in} - V_{BE}) / I_B \) and \( I_B = I_C / \beta \), and observe the resulting base current, collector current, and heat-limit status.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate, demonstrate, compare.
---

# Transistor Motor Driver — Base Resistor and Darlington Pair Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 14: "The 555 Timer Chip"](../../chapters/14-555-timer-chip/index.md).

```text
Type: microsim
**sim-id:** transistor-motor-driver-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students size a base resistor for an NPN transistor switching a small DC motor, watch what happens when the resistor is too small (excess base current, heat-limit warning) or too large (motor doesn't reach full speed), and toggle between a single transistor and a Darlington pair to see the base-current savings.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate, demonstrate, compare.

Learning objective: Given a target motor current and a selected transistor (BC547 or 2N2222) or a Darlington pair of two BC547s, calculate a safe base resistor value using \( R_B = (V_{in} - V_{BE}) / I_B \) and \( I_B = I_C / \beta \), and observe the resulting base current, collector current, and heat-limit status.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Transistor Motor Driver Breadboard Demo | Topic: NPN transistor switching a DC motor, base resistor sizing, transistor heat limit, Darlington pair | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Size a base resistor to safely switch a DC motor with an NPN transistor and observe the effect of exceeding current and heat limits" returned a top match of "LED Dimmer Circuit" (dmccreary/moving-rainbow, WHAT score 0.4779, recommendation "generate") — below the 0.60 template threshold, and topically centered on PWM brightness dimming rather than base-resistor sizing or a motor load. This is written as a new specification.

Canvas layout: Rendered half breadboard on the left with a battery pack, a push-button control, a base-resistor slider feeding an NPN transistor (Q1, plus a second chained transistor Q2 when Darlington mode is on), a DC motor as the collector-side load, and a flyback diode wired backward across the motor terminals; right side panel holds a base-resistor slider, a BC547/2N2222 selector, a "Darlington Mode" toggle, numeric readouts, and an infobox.

Components/elements involved: A rendered breadboard with power and ground rails; a battery pack; a base-resistor slider (100 Ω-10 kΩ); one or two `bbTransistor` NPN transistors wired base-to-collector for Darlington mode; a new `bbMotor` component (a small cylindrical motor body with a spinning fan-blade icon whose rotation speed animates proportional to current through it, electrically modeled as a fixed low-resistance load like `bbBuzzer` so the existing DC solver handles it without a transient model); a flyback diode across the motor; a red heat-limit warning indicator near the transistor body.

Required interactivity:
- Dragging the base-resistor slider recalculates \( I_B = (V_{in} - V_{BE}) / R_B \) live, then \( I_C = \beta \times I_B \) (capped at the selected transistor's maximum rated current and the motor's maximum draw), and updates both the motor's spin speed and the numeric readouts
- Toggling "Darlington Mode" chains a second transistor's collector-base internally, multiplying the effective gain rating (\( \beta_1 \times \beta_2 \)), so the same motor speed is reached with a far smaller base current, matching the chapter's worked numbers
- Selecting BC547 or 2N2222 changes the maximum collector current and heat limit used for the warning check
- When calculated collector current or power (\( I_C \times V_{CE} \)) exceeds the selected transistor's rating, a red "Heat Limit Exceeded" indicator flashes near the transistor body and the infobox explains why
- Hovering the flyback diode opens an infobox explaining that it protects the transistor from the motor's voltage spike when current is switched off
- Button "Reset" returns to BC547, single-transistor mode, base resistor at 4.7 kΩ

Default state: BC547 selected, single-transistor mode, base resistor at 4.7 kΩ, motor spinning at partial speed, infobox reads "Active region — base current is controlling collector current safely, under the heat limit."

Data Visibility Requirements:
Stage 1: Show the base resistor's current value from the slider
Stage 2: Show the calculated base current using the substituted formula
Stage 3: Show the calculated collector current using the substituted formula, with the gain rating used (single or Darlington)
Stage 4: Show the motor's resulting spin speed and the heat-limit status (safe or exceeded)

Instructional Rationale: An Apply-level "calculate/demonstrate" objective calls for a parameter-exploration pattern where every slider move immediately shows the arithmetic and its physical consequence, so students connect the base-resistor formula to a real safety decision instead of memorizing it in the abstract.

Color scheme: Thin blue current-flow dots on the base wire, thick orange dots on the collector-emitter/motor path, red flash for the heat-limit warning, green spinning motor blades — consistent with this book's other transistor diagrams.

Responsive behavior: Breadboard view and the control/infobox panel stack vertically on narrow screens; the slider and toggle remain full-width and touch-friendly; the scope panel, if shown, hides below 640 px per this book's standard breadboard-sim rule.

Implementation: p5.js, built with the breadboard-sim-generator skill, extending this repository's `breadboard-lib.js` with a new `bbMotor` component (a fixed-resistance load, consistent with the library's DC-steady-state solver) and reusing the existing `bbTransistor` component twice for Darlington mode.
```

## Related Resources

- [Chapter 14: "The 555 Timer Chip"](../../chapters/14-555-timer-chip/index.md)
