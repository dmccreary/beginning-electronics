---
title: Schematic-to-Breadboard Mapper
description: Given a simple schematic (battery, resistor, LED, ground) shown side-by-side with a blank breadboard, correctly map each schematic symbol to its breadboard placement and each schematic connection to a jumper wire, demonstrating both wiring diagram interpretation and schematic-to-breadboard mapping.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: construct, demonstrate.
---

# Schematic-to-Breadboard Mapper



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 7: "Wiring Skills and Circuit Layout"](../../chapters/07-wiring-skills-layout/index.md).

```text
Type: microsim
**sim-id:** schematic-to-breadboard-mapper<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Help students translate a simple LED circuit wiring diagram into a correct physical breadboard layout by clicking each schematic symbol and identifying, or placing, its matching location on a rendered breadboard.

Bloom Taxonomy: Apply (L3). Bloom Verb: construct, demonstrate.

Learning objective: Given a simple schematic (battery, resistor, LED, ground) shown side-by-side with a blank breadboard, correctly map each schematic symbol to its breadboard placement and each schematic connection to a jumper wire, demonstrating both wiring diagram interpretation and schematic-to-breadboard mapping.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Schematic to Breadboard Mapping" returned a top match of "Breadboard" (dmccreary/microsims, WHAT score 0.6575, recommendation "template"). A second query for "Wiring Diagram Interpretation" returned "Ground Symbol Reference Guide" (dmccreary/circuits, WHAT score 0.6873, recommendation "template"). Both scores fall in the template range (0.60–0.75), below the 0.75 reuse threshold, so neither is a close enough fit to embed directly. A keyword grep of the 3,764-entry MicroSim catalog for "schematic," "wiring diagram," and "breadboard mapping" found no closer beginner-electronics match. This sim uses the Breadboard template as its visual base, since it already renders the exact half-size board graphic this chapter's other diagrams use.

**Template:** https://github.com/dmccreary/microsims/tree/main/docs/sims/breadboard<br/>

Canvas layout: Left half shows the wiring diagram (battery, resistor, LED, ground symbol, connected by schematic lines); right half shows a blank half-size breadboard graphic reusing the rendering approach from the Chapter 6 Breadboard Anatomy Explorer.

Components/elements involved: Four schematic symbols (battery, resistor, LED, ground) on the left; an unpopulated breadboard with power/ground rails and terminal-strip rows on the right; a small parts tray beneath the breadboard holding a resistor icon, an LED icon, and jumper wire icons.

Required interactivity:
- Click any schematic symbol on the left to highlight it and open an infobox naming the symbol and its role in the circuit
- Drag the matching component icon from the parts tray onto the correct breadboard row on the right; an incorrect row placement gives a red explanation ("A resistor and an LED both need their own row — sharing a row shorts them together")
- After both components are placed, drag jumper wire icons to connect power to the resistor, the resistor to the LED, and the LED to ground, matching the schematic's connections exactly
- Button: "Check My Wiring" compares the built layout to the schematic and highlights any missing or incorrect connection in red, with a one-sentence explanation of the mismatch
- Button: "New Circuit" swaps in a different simple schematic (for example, adding a second LED in series) for repeated practice

Default state: Blank breadboard on the right, complete schematic on the left, empty parts tray selections, "Check My Wiring" disabled until at least one component is placed.

Instructional Rationale: An Apply-level "construct/map" objective calls for a hands-on build-and-check pattern rather than passive viewing, so learners rehearse the exact translation step — schematic symbol to breadboard row to jumper wire — that they will repeat in every remaining chapter of this course.

Color scheme: Warm orange highlight for the currently selected schematic symbol, green/red for correct/incorrect feedback on "Check My Wiring," light neutral gray for the unpopulated board, matching the palette used in the Chapter 6 breadboard diagrams for visual consistency across chapters.

Responsive behavior: Schematic and breadboard panels stack vertically on narrow screens instead of sitting side-by-side; all drag targets remain touch-sized on mobile, with tap-to-select and tap-to-place as an alternative to dragging.

Implementation: p5.js, with the breadboard graphic reused from the Chapter 6 rendering approach; the schematic drawn as simple vector symbols; a small rules table validates each placement and connection against the active circuit's correct answer key.
```

## Related Resources

- [Chapter 7: "Wiring Skills and Circuit Layout"](../../chapters/07-wiring-skills-layout/index.md)
