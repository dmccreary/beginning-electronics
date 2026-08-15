---
title: Resistor Family Matching Sorter
description: Given five resistor-type cards and five shuffled behavior-description cards, match each resistor type to the one description that correctly explains how and why its resistance changes.
status: scaffold
library: p5.js
bloom_level: Understand (L2). Bloom Verb: classify, identify.
---

# Resistor Family Matching Sorter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 9: "Resistors and Capacitors"](../../chapters/09-resistors-and-capacitors/index.md).

```text
Type: microsim
**sim-id:** resistor-family-matching-sorter<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Reinforce the five resistor types just introduced (Fixed Resistor, Potentiometer, Trimmer Resistor, Photoresistor/LDR, Thermistor) by having students actively match each type to the behavior that defines it, immediately after the comparison table.

Bloom Taxonomy: Understand (L2). Bloom Verb: classify, identify.

Learning objective: Given five resistor-type cards and five shuffled behavior-description cards, match each resistor type to the one description that correctly explains how and why its resistance changes.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Resistor Family Matching Sorter | Topic: Resistor Types (Fixed, Variable, Potentiometer, Trimmer, Photoresistor, Thermistor) | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Identify and classify each resistor type by its defining characteristic and typical use case" returned a top match of "Photoresistor Component Visualization" (dmccreary/moving-rainbow, WHAT score 0.4948, recommendation "generate") — below the 0.60 template threshold. A keyword grep of the 3,764-entry MicroSim catalog for "potentiometer," "photoresistor," and "thermistor" found no existing matching game covering all five resistor types together. This is a new specification.

Canvas layout: Top row shows five resistor-type cards (icon + name) in a shuffled order; bottom row shows five behavior-description cards in a different shuffled order; a small infobox sits beneath both rows.

Components/elements involved: Five labeled resistor-type cards (Fixed Resistor, Potentiometer, Trimmer Resistor, Photoresistor/LDR, Thermistor), each with a simple icon; five behavior-description cards drawn from the comparison table above; connector lines drawn between matched pairs.

Required interactivity:
- Click a resistor-type card, then click a behavior-description card to propose a match; a connecting line is drawn between them
- Correct matches turn green and lock in place with a one-sentence confirmation in the infobox
- Incorrect matches flash red, unlock, and the infobox explains what's actually true about the resistor type that was clicked, without revealing the correct pairing
- Button: "Check All" reveals any remaining unmatched pairs once all five have been attempted
- Button: "Shuffle Again" re-randomizes both rows for repeated practice

Default state: All ten cards unmatched and shuffled; infobox reads "Click a resistor type, then click its matching behavior."

Instructional Rationale: An Understand-level "classify/identify" objective is well served by a matching-pairs pattern, which forces active recall of each resistor type's defining behavior rather than passive re-reading of the table above it.

Color scheme: Warm orange highlight for the currently selected card, green for a correct match, red flash for an incorrect attempt, light neutral gray for unmatched cards, consistent with this chapter's other diagrams.

Responsive behavior: The two card rows stack into a single scrollable column on narrow screens; tap-to-select works identically to click on touch devices.

Implementation: p5.js, with card data (name, icon, description, correct pairing) stored in a lookup array so the same sim can be reshuffled without reloading.
```

## Related Resources

- [Chapter 9: "Resistors and Capacitors"](../../chapters/09-resistors-and-capacitors/index.md)
