---
title: Circuit Continuity and Fault Tester
description: Examine a simple circuit diagram containing a voltage source, one or more circuit elements, and a current path, and use a virtual multimeter continuity tester to identify which segment of the path contains a circuit fault, by clicking test-probe points and interpreting the tester's pass/fail feedback.
status: scaffold
library: p5.js
bloom_level: Analyze (L4). Bloom Verb: examine.
---

# Circuit Continuity and Fault Tester



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 5: "Conductors, Batteries, and Circuit Vocabulary Review"](../../chapters/05-conductors-batteries-review/index.md).

```text
Type: microsim
**sim-id:** circuit-continuity-fault-tester<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Give students hands-on practice identifying a voltage source, circuit load, and current path in a simple diagram, and using a virtual continuity tester to locate a circuit fault breaking the loop.

Bloom Taxonomy: Analyze (L4). Bloom Verb: examine.

Learning objective: Examine a simple circuit diagram containing a voltage source, one or more circuit elements, and a current path, and use a virtual multimeter continuity tester to identify which segment of the path contains a circuit fault, by clicking test-probe points and interpreting the tester's pass/fail feedback.

Canvas layout:
- Left/center (70%): a loop diagram — battery (voltage source), an LED and resistor (circuit elements acting as the circuit load), and wire segments forming the current path — with 5–6 labeled test points
- Right side (30%, stacking below on narrow screens): a virtual multimeter panel with continuity-test results and a running test log

Visual elements:
- A closed-loop diagram with battery, resistor, LED, and wire segments, redrawn with a new random fault each time "New Circuit" is pressed
- Small numbered test-point markers at each junction and wire segment
- A multimeter display showing "- - -" by default, a green check when a tested segment has continuity, a red X when it doesn't
- One randomly placed circuit fault per scenario: a broken wire segment or a disconnected component lead

Interactive controls:
- Click any two test points to place the probes and run a continuity test between them
- Button: "New Circuit" generates a fresh random fault and clears the test log
- Button: "Reveal Fault" (after at least two tests) highlights the fault location and explains the kind of circuit fault it is
- Running test log lists every pair of points tested and its pass/fail result

Default parameters:
- One fault present per scenario, placed randomly among 5–6 possible wire segments or lead connections
- No points pre-selected; multimeter shows "- - -" until the first test

Behavior when two test points are selected: a continuous segment shows a green checkmark and a "Continuity — this path is connected" message with a green highlight; a broken segment shows a red X and a "No continuity — this path is broken" message with a red highlight. Once the fault is located or revealed, an infobox explains what kind of circuit fault it was and how it would show up in real life (an LED that won't light despite a good battery).

Data Visibility Requirements:
  Stage 1 (default): Full circuit diagram with all test points visible and the multimeter idle, so the learner sees the whole current path first
  Stage 2 (test run): Tested segment highlighted with its pass/fail color, plus the updated multimeter message and growing test log
  Stage 3 (fault located or revealed): The faulted segment stays highlighted with an explanation, tying "circuit fault" to one concrete, visible break

Instructional Rationale: An Analyze-level objective (examine a circuit and locate a problem) calls for a diagnostic testing pattern — place probes, read feedback, narrow down the fault — rather than passive labeling, mirroring the real troubleshooting skill students will use on their first breadboard project in Chapter 6.

Color scheme: Blue circuit lines and symbols on a light background; green for confirmed continuity, red for confirmed faults.

Responsive behavior: Diagram and multimeter panel stack vertically on narrow screens; all test points and buttons remain tappable.

Implementation: p5.js, with the circuit modeled as segments between named nodes, one segment flagged as "faulted" per scenario; multimeter panel rendered as HTML beside (or below) the canvas.
```

## Related Resources

- [Chapter 5: "Conductors, Batteries, and Circuit Vocabulary Review"](../../chapters/05-conductors-batteries-review/index.md)
