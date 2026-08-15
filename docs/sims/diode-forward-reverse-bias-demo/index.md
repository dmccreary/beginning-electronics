---
title: Forward vs. Reverse Bias Breadboard Demo
description: Given a rendered breadboard circuit with a diode, a battery, and an LED current indicator, predict and observe whether current flows when the diode is forward-biased versus reverse-biased, and observe what happens as forward current approaches and exceeds the diode's current rating.
status: scaffold
library: p5.js
bloom_level: Understand (L2) / Apply (L3). Bloom Verb: demonstrate, predict.
---

# Forward vs. Reverse Bias Breadboard Demo



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 12: "Diodes and LEDs"](../../chapters/12-diodes-and-leds/index.md).

```text
Type: microsim
**sim-id:** diode-forward-reverse-bias-demo<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students flip a battery's orientation on a rendered breadboard circuit and directly observe current flowing (forward bias, indicator LED lit) versus current being blocked (reverse bias, indicator dark), then push current past the diode's current rating to see why the rating matters.

Bloom Taxonomy: Understand (L2) / Apply (L3). Bloom Verb: demonstrate, predict.

Learning objective: Given a rendered breadboard circuit with a diode, a battery, and an LED current indicator, predict and observe whether current flows when the diode is forward-biased versus reverse-biased, and observe what happens as forward current approaches and exceeds the diode's current rating.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Forward vs Reverse Bias Diode Breadboard Demo | Topic: Diode forward bias and reverse bias, current flow through a diode on a breadboard, diode current rating | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Demonstrate how current flows through a forward-biased diode and is blocked by a reverse-biased diode on a breadboard circuit" returned a top match of "Breadboard" (dmccreary/microsims, WHAT score 0.5246, recommendation "generate") — below the 0.60 template threshold, though it is the closest structural match. The second match, "P-N Junction Voltage Explorer" (0.4908), is undergraduate-level depletion-region physics and out of scope. This is a new specification, and a strong candidate for the breadboard-sim-generator skill: this repository's existing `button-led-breadboard` and `light-dark-detector` sims already share a `breadboard-lib.js` rendering library with real tie-point positions and animated current flow that this sim can extend directly with a diode component and bias-direction logic.

Canvas layout: Main area shows a rendered half breadboard with a battery pack, a diode (band clearly visible), and a series LED current indicator; right side panel holds a "Flip Battery" button, a current-source slider (0-30 mA), and an infobox.

Components/elements involved: A rendered breadboard with power and ground rails; a battery pack with a visible polarity marking; a diode with a rendered band marking; a series LED that lights when current flows; connecting wires; an animated current-flow indicator along the wires.

Required interactivity:
- Clicking "Flip Battery" reverses the battery's polarity, toggling the diode between forward and reverse bias; forward bias animates current flow and lights the indicator LED, while reverse bias halts the animation and the infobox explains that the diode is blocking current with no damage at this course's low voltage
- Dragging the current-source slider raises the simulated source current; below the diode's current rating the indicator brightens normally, and past the rating a warning flash appears and the infobox explains the overheating risk, without actually damaging the simulated part
- Hovering the diode opens an infobox stating the current bias condition and the diode's current rating
- Button "Reset" returns to the default forward-biased, low-current state

Default state: Battery oriented for forward bias, current slider at 15 mA, indicator LED lit at normal brightness, infobox reads "Forward biased — current flows from anode to cathode, well under the rating."

Data Visibility Requirements:
Stage 1: Show the battery's current polarity orientation
Stage 2: Show the resulting bias condition label ("Forward Biased" or "Reverse Biased")
Stage 3: Show the animated current flow, or its absence, along the wires
Stage 4: Show the current-source value next to the diode's current rating for direct comparison

Instructional Rationale: An Understand/Apply "demonstrate/predict" objective calls for a manipulable breadboard simulation with concrete before-and-after states for each bias direction and current level, so students connect the abstract bias vocabulary to a visible, testable outcome rather than an animation they only watch.

Color scheme: Green current-flow dots and a lit indicator LED for forward bias, gray and dim for reverse bias, red warning flash when current exceeds the diode's rating, consistent with the palette used in this chapter's other diagrams.

Responsive behavior: Breadboard view and the control/infobox panel stack vertically on narrow screens; the current slider and Flip Battery button remain full-width and touch-friendly.

Implementation: p5.js, built using the breadboard-sim-generator skill's rendered tie-point approach, extending this repository's existing `breadboard-lib.js` (already used in `button-led-breadboard` and `light-dark-detector`) with a diode component and bias-direction logic.
```

## Related Resources

- [Chapter 12: "Diodes and LEDs"](../../chapters/12-diodes-and-leds/index.md)
