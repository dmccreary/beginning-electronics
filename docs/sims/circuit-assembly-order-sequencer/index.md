---
title: Circuit Assembly Order Sequencer
description: Arrange a shuffled set of circuit-building step cards (such as "place the resistor," "place the LED," "connect ground wire," "connect power wire," "check polarity," "apply power") into a safe, correct incremental build order, and explain in a follow-up infobox why each step precedes the next.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: sequence, construct.
---

# Circuit Assembly Order Sequencer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 7: "Wiring Skills and Circuit Layout"](../../chapters/07-wiring-skills-layout/index.md).

```text
Type: microsim
**sim-id:** circuit-assembly-order-sequencer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students practice arranging the steps of building a simple LED circuit into a safe, incremental order, reinforcing circuit assembly order and incremental circuit building before their first hands-on build.

Bloom Taxonomy: Apply (L3). Bloom Verb: sequence, construct.

Learning objective: Arrange a shuffled set of circuit-building step cards (such as "place the resistor," "place the LED," "connect ground wire," "connect power wire," "check polarity," "apply power") into a safe, correct incremental build order, and explain in a follow-up infobox why each step precedes the next.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Circuit Assembly Order Sequencer" returned a top match of "Breadboard Layout Explorer" (dmccreary/stem-robots, WHAT score 0.5139, recommendation "generate") — below the 0.60 template threshold, so no existing sim is a close enough starting point. A keyword grep of the 3,764-entry MicroSim catalog for "assembly order" and "circuit layout" found no closer match (one unrelated hit for "Circuit Component Library Test"). This is a new specification.

Canvas layout: A shuffled stack of six step cards along the left or top of the canvas; a numbered sequence of six empty slots along the right or bottom where the learner drags cards into order.

Components/elements involved: Six step cards — "Place the resistor (power off)," "Place the LED (power off)," "Connect the ground wire," "Connect the power wire," "Double-check polarity and orientation," "Connect the power source" — each shown as a labeled icon-and-text card.

Required interactivity:
- Drag each step card into one of six ordered slots to build a proposed sequence
- Button: "Check My Order" compares the learner's sequence to the safe reference order and marks each slot green (correct position) or red (out of place)
- Click any card, at any time, to open an infobox explaining why that step belongs where it does (for example, clicking "Connect the power source" explains why power always comes last, after every other connection is checked)
- Button: "Shuffle Again" reshuffles the six cards for repeated practice
- Toggle: "Show Why Order Matters" reveals a short cause-and-effect example, such as what happens if power is connected before polarity is checked

Default state: Six step cards shuffled into a random order in the source stack; all six destination slots empty; "Check My Order" disabled until all slots are filled.

Instructional Rationale: An Apply-level "sequence/construct" objective calls for a hands-on ordering task with immediate right/wrong feedback per step, rather than a passive description of the order, so learners internalize the reasoning behind "components and wiring before power" rather than memorizing it as an arbitrary rule.

Color scheme: Warm orange for cards currently being dragged, green/red for correct/incorrect slot feedback, light neutral gray for empty slots, consistent with the palette used across this chapter's other diagrams.

Responsive behavior: Card stack and destination slots stack vertically on narrow screens; drag-and-drop also supports tap-to-select-then-tap-to-place as a touch-friendly alternative.

Implementation: p5.js, with step cards as simple rectangle-and-icon objects; sequence validated against a fixed reference order stored as an array; infobox text stored in a lookup table keyed by card id.
```

## Related Resources

- [Chapter 7: "Wiring Skills and Circuit Layout"](../../chapters/07-wiring-skills-layout/index.md)
