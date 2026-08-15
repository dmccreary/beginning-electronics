---
title: Breadboard Troubleshooting Detective
description: Given a rendered breadboard circuit (battery, resistor, LED) with exactly one hidden fault — a loose connection, a bent component lead, wrong row placement, or breadboard contact wear — inspect the circuit, form a hypothesis about the cause, and use a virtual swap test to confirm or reject that hypothesis, changing only one variable at a time.
status: scaffold
library: p5.js
bloom_level: Analyze (L4). Bloom Verb: examine, distinguish.
---

# Breadboard Troubleshooting Detective



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 8: "Troubleshooting and Optional Perfboard Packaging"](../../chapters/08-troubleshooting-perfboard/index.md).

```text
Type: microsim
**sim-id:** breadboard-troubleshooting-detective<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Give students hands-on practice diagnosing a non-working breadboard LED circuit by applying power-on verification, error symptom diagnosis, faulty component isolation, and single-change debugging to find one of four hidden faults.

Bloom Taxonomy: Analyze (L4). Bloom Verb: examine, distinguish.

Learning objective: Given a rendered breadboard circuit (battery, resistor, LED) with exactly one hidden fault — a loose connection, a bent component lead, wrong row placement, or breadboard contact wear — inspect the circuit, form a hypothesis about the cause, and use a virtual swap test to confirm or reject that hypothesis, changing only one variable at a time.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Breadboard Troubleshooting Detective" returned a top match of "Breadboard" (dmccreary/microsims, WHAT score 0.643, recommendation "template") — in the template range (0.60–0.75) but below the 0.75 reuse threshold, so it is not a close enough fit to embed directly. A keyword grep of the 3,764-entry MicroSim catalog for "troubleshoot" and "breadboard fault" found no closer beginner-electronics match. This sim reuses the Breadboard template as its rendered board graphic and is a strong candidate for the breadboard-sim-generator skill, since it needs a rendered breadboard with real tie-point holes and a deliberately introduced fault for a "find the bug" exercise.

**Template:** https://github.com/dmccreary/microsims/tree/main/docs/sims/breadboard<br/>

Canvas layout: Left/main area shows a rendered half-size breadboard with a battery pack, resistor, and LED wired in a simple series circuit; right side panel holds a power switch, four hypothesis buttons (Loose Connection, Bent Lead, Wrong Row, Contact Wear), a "Swap Test" button, and an infobox.

Components/elements involved: A rendered breadboard with power rails and terminal-strip rows; battery, resistor, and LED components with visible leads; a magnifying "inspect" cursor; four labeled hypothesis buttons; a "New Fault" button.

Required interactivity:
- Click the power switch to energize the circuit; the LED stays dark because a hidden fault is active
- Hover or click any wire, lead, or row on the breadboard to "inspect" it, opening a zoomed infobox describing what that specific spot looks like up close
- Select one of the four hypothesis buttons based on what the inspection revealed
- Click "Swap Test" to virtually replace or fix the selected suspect; a correct hypothesis lights the LED and shows a green infobox explaining the real fault and why the symptom matched it; an incorrect hypothesis shows a red infobox explaining why that guess doesn't match the evidence, without revealing the answer
- Button: "New Fault" randomly activates a different one of the four faults for repeated practice

Default state: Circuit powered off, LED dark, no hypothesis selected, "Swap Test" disabled until a hypothesis is chosen.

Instructional Rationale: An Analyze-level "examine/distinguish" objective calls for comparing observable evidence against multiple candidate causes, which a find-the-fault interactive pattern delivers far better than a passive animation — learners must actually inspect, hypothesize, and single-change test exactly as described in this chapter's three-step method.

Color scheme: Warm orange for the currently inspected element, green/red for correct/incorrect swap-test feedback, light neutral gray for unselected hypothesis buttons, consistent with the palette used in this chapter's other diagrams.

Responsive behavior: Breadboard view and the hypothesis/control panel stack vertically on narrow screens; inspection works via tap on touch devices as an alternative to hover.

Implementation: p5.js, built on the breadboard-sim-generator rendering approach (real tie-point hole grid, component placement, and animated current flow once the fault is fixed); fault state and evidence text stored in a lookup table keyed by fault id.
```

## Related Resources

- [Chapter 8: "Troubleshooting and Optional Perfboard Packaging"](../../chapters/08-troubleshooting-perfboard/index.md)
