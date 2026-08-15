---
title: Transistor Current Gain Explorer
description: Given a base current value and a selected transistor (BC547 or 2N2222), calculate the resulting collector current using \( I_C = \beta \times I_B \), and compare how the two transistors' different gain and current-rating values change that outcome.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate, demonstrate, compare.
---

# Transistor Current Gain Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 13: "Meet the Transistor"](../../chapters/13-meet-the-transistor/index.md).

```text
Type: microsim
**sim-id:** transistor-current-gain-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students adjust a base current slider and watch the resulting collector current calculated live using the current gain formula, comparing the BC547 and 2N2222's different typical gain values and seeing where each transistor's collector current caps out at saturation.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate, demonstrate, compare.

Learning objective: Given a base current value and a selected transistor (BC547 or 2N2222), calculate the resulting collector current using \( I_C = \beta \times I_B \), and compare how the two transistors' different gain and current-rating values change that outcome.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Transistor Current Gain and Saturation Cutoff Explorer | Topic: Transistor amplification, current gain, saturation region, cutoff region, base current versus collector current | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Predict how changing base current moves an NPN transistor between cutoff, active amplification, and saturation regions" returned a top match of "Transistor Driver and Dimmer Circuit" (dmccreary/moving-rainbow, WHAT score 0.5391, recommendation "generate") — below the 0.60 template threshold. That sim teaches duty-cycle LED dimming through a transistor rather than the current-gain formula and BC547/2N2222 comparison this chapter needs, so its objective does not transfer. This is a new specification.

Canvas layout: Left side shows a base-current slider (0-2 mA) and a transistor selector (BC547 / 2N2222); right side shows a live bar comparing base current (thin bar) to calculated collector current (thick bar), the gain formula with current numbers substituted in, and an infobox.

Components/elements involved: A base-current slider; a BC547/2N2222 selector; a live numeric readout of hFE, base current, and calculated collector current; a two-bar comparison chart (base current vs. collector current, drawn at very different scales to emphasize the amplification); a saturation warning indicator.

Required interactivity:
- Dragging the base-current slider recalculates collector current live using \( I_C = \beta \times I_B \) for the selected transistor's typical hFE, and updates both bars and the formula readout with the substituted numbers
- Selecting BC547 or 2N2222 changes the hFE used in the calculation and the maximum collector-current rating shown, so the same base current produces a different predicted collector current for each part
- When the calculated collector current would exceed the selected transistor's maximum rating, the collector bar flashes red and the infobox explains that the transistor has reached saturation and cannot supply more current no matter how much higher the base current climbs
- Hovering the formula or either bar opens an infobox explaining that term in plain language
- Button "Reset" returns to a base current of 0.5 mA with the BC547 selected

Default state: BC547 selected, base current at 0.5 mA, hFE shown as 100, calculated collector current readout "50 mA," both bars drawn at their respective heights, infobox reads "Active region — collector current is proportional to base current."

Data Visibility Requirements:
Stage 1: Show the selected transistor's hFE value
Stage 2: Show the current base-current value from the slider
Stage 3: Show the formula with those exact numbers substituted in
Stage 4: Show the calculated collector current as both a number and a bar height, next to the base-current bar for scale comparison

Instructional Rationale: An Apply-level "calculate/compare" objective calls for a parameter-exploration pattern with the formula's substituted values always visible, so students see the arithmetic happen rather than only the final answer, and directly compare how gain and current rating change the outcome between the two named transistors.

Color scheme: Thin blue bar for base current, thick orange bar for collector current (echoing the "small controls big" idea), red flash for the saturation warning, consistent with this chapter's other diagrams.

Responsive behavior: The slider/selector panel and the bar-chart/infobox panel stack vertically on narrow screens; the slider remains full-width and touch-draggable.

Implementation: Plain p5.js, not the breadboard-sim-generator — this is a calculator-style parameter explorer rather than a wired circuit, matching the standalone decoder pattern used by this book's other component-comparison sims.
```

## Related Resources

- [Chapter 13: "Meet the Transistor"](../../chapters/13-meet-the-transistor/index.md)
