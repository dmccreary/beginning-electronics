---
title: Solder Joint Quality Classifier
description: Given eight vector-rendered solder joint examples on a perfboard pad, sort each one into a "Good Joint" or "Cold Joint" bin by judging its shine, shape, and coverage, and justify each judgment against a three-criteria rubric revealed in the feedback infobox.
status: scaffold
library: p5.js
bloom_level: Evaluate (L5). Bloom Verb: judge, assess.
---

# Solder Joint Quality Classifier



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 8: "Troubleshooting and Optional Perfboard Packaging"](../../chapters/08-troubleshooting-perfboard/index.md).

```text
Type: microsim
**sim-id:** solder-joint-quality-classifier<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students practice visually distinguishing a good solder joint from a cold solder joint using shine, shape, and coverage as judging criteria, reinforcing solder joint and cold solder joint before any real soldering activity.

Bloom Taxonomy: Evaluate (L5). Bloom Verb: judge, assess.

Learning objective: Given eight vector-rendered solder joint examples on a perfboard pad, sort each one into a "Good Joint" or "Cold Joint" bin by judging its shine, shape, and coverage, and justify each judgment against a three-criteria rubric revealed in the feedback infobox.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Solder Joint Quality Classifier" returned a top match of "Purpose Classification Sorter" (dmccreary/infographics, WHAT score 0.4369, recommendation "generate") — below the 0.60 template threshold, so no existing sim is a close enough starting point. A keyword grep of the 3,764-entry MicroSim catalog for "solder" and "solder joint" returned zero matches. This is a new specification.

Canvas layout: A tray of eight shuffled solder-joint icons across the top of the canvas; two labeled drop bins ("Good Joint" and "Cold Joint") below; a small infobox panel to the side or bottom.

Components/elements involved: Eight vector-rendered solder joint icons, each showing a wire lead soldered to a round copper perfboard pad, varying in shine (glossy vs. dull), shape (smooth cone vs. lumpy blob), and coverage (fully coated vs. partially bare); two sorting bins; a rubric card listing the three judging criteria.

Required interactivity:
- Drag (or tap-to-select, tap-to-place) each joint icon into the "Good Joint" or "Cold Joint" bin
- Immediate per-joint feedback: a green outline and a one-sentence explanation for a correct sort, a red outline and an explanation of the visual cue that was missed for an incorrect sort
- Hover any joint at any time, before sorting, to see a neutral callout labeling its shine/shape/coverage without revealing whether it's good or cold
- Button: "Check All" tallies the final score once all eight are sorted
- Button: "New Set" reshuffles a fresh set of eight joints, with a different mix of good and cold examples, for repeated practice

Default state: All eight joints unsorted in the top tray; both bins empty; "Check All" disabled until every joint has been placed in a bin.

Instructional Rationale: An Evaluate-level "judge/assess" objective calls for a classification-sorter pattern with rubric-based feedback rather than a passive description, so learners practice the exact visual judgment call — shine, shape, coverage — they will need before ever picking up a real soldering iron.

Color scheme: Warm orange for the currently dragged joint, green/red for correct/incorrect bin feedback, light neutral gray for the unsorted tray, consistent with the palette used across this chapter's other diagrams.

Responsive behavior: Tray and bins stack vertically on narrow screens; drag-and-drop also supports tap-to-select-then-tap-to-place as a touch-friendly alternative.

Implementation: p5.js, with solder joint icons as procedurally drawn vector shapes (not photographs) so shine, shape, and coverage can be adjusted parametrically; each icon keyed to a metadata table of {shine, shape, coverage, isGood} used both for rendering and for grading.
```

## Related Resources

- [Chapter 8: "Troubleshooting and Optional Perfboard Packaging"](../../chapters/08-troubleshooting-perfboard/index.md)
