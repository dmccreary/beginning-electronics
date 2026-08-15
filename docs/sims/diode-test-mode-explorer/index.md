---
title: Diode Test Mode Explorer
description: Given a multimeter set to diode-test mode and four out-of-circuit diode/LED samples, probe each sample in both directions and interpret the resulting reading (a forward voltage, an overload indicator, or a low voltage in both directions) to classify the part as good, shorted, or open.
status: scaffold
library: p5.js
bloom_level: Understand (L2) / Apply (L3). Bloom Verb: interpret, demonstrate, classify.
---

# Diode Test Mode Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 21: "Systematic Troubleshooting"](../../chapters/21-systematic-troubleshooting/index.md).

```text
Type: infographic
**sim-id:** diode-test-mode-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students select one of four out-of-circuit diode/LED samples (good diode, good red LED, shorted diode, open diode), touch a virtual meter set to diode-test mode to it in both directions, and read the resulting voltage or overload indicator so they can classify the part as normal, shorted, or open.

Bloom Taxonomy: Understand (L2) / Apply (L3). Bloom Verb: interpret, demonstrate, classify.

Learning objective: Given a multimeter set to diode-test mode and four out-of-circuit diode/LED samples, probe each sample in both directions and interpret the resulting reading (a forward voltage, an overload indicator, or a low voltage in both directions) to classify the part as good, shorted, or open.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Diode Testing Mode and LED Forward Voltage Explorer | Topic: multimeter diode test mode, LED forward voltage, open circuit reading, short circuit reading, overload indicator | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Identify what a multimeter's diode-test mode reading means for a good diode, a reversed diode, an open diode, and a shorted diode" returned a top match of "Transistor Driver and Dimmer Circuit" (dmccreary/moving-rainbow, WHAT score 0.4722, recommendation "generate") — well below the 0.60 template threshold and topically about PWM dimming, not diode-test diagnosis. A keyword grep of the catalog for "multimeter," "voltmeter," "diode test," and "forward voltage" found nothing relevant. New specification.

Canvas layout: A row of four labeled sample cards along the top (Good Diode, Good Red LED, Shorted Diode, Open Diode); a drawn multimeter fixed on the diode-test symbol with two probes and a "Reverse Probes" toggle below; a reading display with an infobox beneath.

Components/elements involved: Four out-of-circuit sample cards; a multimeter body with red/black probes; a "Reverse Probes" button; a numeric/OL reading display; an infobox panel.

Required interactivity:
- Clicking a sample card probes it in the current orientation: Good Diode forward ≈ 0.6 V / reverse OL; Good Red LED forward ≈ 1.9 V (faint glow) / reverse OL; Shorted Diode ≈ 0.05 V both ways; Open Diode reads OL both ways
- "Reverse Probes" swaps polarity and re-reads the selected sample, so both directions can be compared
- Once both directions are checked, an infobox prompts a Good/Shorted/Open classification via three buttons, with green/red feedback and a one-sentence explanation
- Button "New Set" reshuffles which sample is Shorted vs. Open, for repeated practice

Default state: No sample selected, probes forward, display empty; infobox reads "Pick a sample, then read it in both directions before you classify it."

Instructional Rationale: An Understand/Apply-level "interpret/classify" objective needs a manipulable instrument producing a number or overload indicator the student reasons about, not an animation — requiring both probe directions before classifying is the actual diagnostic skill.

Color scheme: Yellow-orange multimeter body matching Chapter 20's diagrams; green/red classification feedback; blue highlight on the active probe.

Responsive behavior: Sample cards wrap to two rows on narrow screens; meter and infobox stack below instead of beside them.

Implementation: Plain p5.js, not the breadboard-sim-generator — a standalone out-of-circuit tester, not a wired breadboard circuit. A lookup table of {sampleId, forwardReading, reverseReading, trueClass} drives display and grading.
```

## Related Resources

- [Chapter 21: "Systematic Troubleshooting"](../../chapters/21-systematic-troubleshooting/index.md)
