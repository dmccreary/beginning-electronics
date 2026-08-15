---
title: Full Resistor Color Code Decoder
description: Given a rendered resistor showing four color bands drawn from the complete ten-color digit code, the multiplier band, and a gold or silver tolerance band, calculate the resistor's exact value in ohms and its tolerance range.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: calculate, decode.
---

# Full Resistor Color Code Decoder



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 11: "Resistor Codes and Capacitor Details"](../../chapters/11-resistor-codes-capacitor-details/index.md).

```text
Type: microsim
**sim-id:** full-resistor-color-code-decoder<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students decode any resistor's value and tolerance from any combination of the full ten-color digit code, the multiplier band, and the gold/silver tolerance band — the complete system promised back in Chapter 9 and narrowed to four values in Chapter 10.

Bloom Taxonomy: Apply (L3). Bloom Verb: calculate, decode.

Learning objective: Given a rendered resistor showing four color bands drawn from the complete ten-color digit code, the multiplier band, and a gold or silver tolerance band, calculate the resistor's exact value in ohms and its tolerance range.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Full Resistor Color Code Decoder | Topic: Reading all ten resistor color code digit colors (black brown red orange yellow green blue violet gray white), multiplier band, and gold/silver tolerance band to determine a resistor's value | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Given a resistor showing any of the ten color bands plus multiplier and tolerance bands, decode the full resistance value and tolerance range" returned a top match of "Resistor Color Code Calculator" (dmccreary/learning-micropython, WHAT score 0.6601, recommendation "template") — above the 0.60 template threshold but below the 0.75 reuse threshold, so this sim is a strong starting point to adapt rather than embed as-is. **Template:** https://github.com/dmccreary/learning-micropython/tree/main/docs/sims/resistor-color-code-calculator<br/> A keyword grep of the 3,764-entry MicroSim catalog for "resistor color code" returned the same single match. Note for implementation: this repository's `docs/sims/resistor-physical/draw-resistors.js` already computes color bands FROM a resistance value (the reverse of what's needed here) and `docs/sims/resistor/resistor.js` draws the schematic zig-zag symbol rather than a physical banded body — both are library/reference documentation pages, not student-facing sims (confirmed the same finding Chapter 10 made), so they should be adapted as rendering building blocks rather than reused directly.

Canvas layout: Top area shows one large rendered resistor (tan body, four color bands, lead wires) centered on the canvas; below it, four clickable band-selector swatches, one per band position; a computed-value readout and infobox sit beneath the selectors.

Components/elements involved: A rendered physical resistor with four bands (digit 1, digit 2, multiplier, tolerance); four clickable color swatches, each cycling through its band's valid colors; a "Random Resistor" quiz button; a "Reveal Value" button; a computed-value readout.

Required interactivity:
- Clicking any band's swatch cycles it through its valid colors (all ten digit colors for bands 1 and 2, ten multiplier colors plus gold/silver for band 3, gold/silver only for band 4); the rendered resistor and the computed-value readout update live with every click
- Hovering any band on the rendered resistor opens an infobox stating that band's position and what its current color means (digit, multiplier power of ten, or tolerance percent)
- Button "Random Resistor" sets all four bands to a random valid combination and hides the computed readout behind the "Reveal Value" button, so students can practice decoding by eye first
- Button "Reveal Value" displays the computed resistance and tolerance range, formatted as "4,700 Ω ± 5% (4,465–4,935 Ω)"
- Button "Reset" returns to the default state

Default state: Bands set to yellow-violet-red-gold (4,700 Ω ± 5%); infobox reads "Click any band to change its color, or hit Random Resistor to test yourself."

Instructional Rationale: An Apply-level "calculate/decode" objective is best served by a manipulable calculator where every band is independently adjustable, so students connect each individual color choice to its exact contribution to the final value, reinforcing the complete ten-color system after Chapter 10's four-color subset.

Color scheme: Accurate, true-to-life band colors for all ten digit/multiplier colors plus gold and silver; warm orange highlight on the currently hovered or selected band; green flash on "Reveal Value" consistent with this chapter's other diagrams.

Responsive behavior: The resistor illustration scales to canvas width; the four band selectors wrap into a single row on wide screens and a 2×2 grid on narrow screens; hover feedback also triggers on tap for touch devices.

Implementation: Plain p5.js, not the breadboard-sim-generator — this is a standalone component decoder rather than a wired circuit, the same choice Chapter 10 made for its kit-resistor-band-matcher sim. Extends the tan-body rendering approach from `docs/sims/resistor-physical/` with a fourth (tolerance) band and the full ten-color set, plus click-to-cycle band selectors and computed-value logic.
```

## Related Resources

- [Chapter 11: "Resistor Codes and Capacitor Details"](../../chapters/11-resistor-codes-capacitor-details/index.md)
