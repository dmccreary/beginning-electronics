---
title: Battery Type Explorer
description: Compare the nominal voltage, typical capacity range, and common use of six battery types — AAA, AA, coin cell, single-cell LiPo, 9V, and D cell — by clicking each battery illustration to reveal its specifications in an infobox.
status: scaffold
library: p5.js
bloom_level: Understand (L2). Bloom Verb: compare.
---

# Battery Type Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 5: "Conductors, Batteries, and Circuit Vocabulary Review"](../../chapters/05-conductors-batteries-review/index.md).

```text
Type: microsim
**sim-id:** battery-type-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Help students compare the nominal voltage, capacity, and typical use of common battery types, reinforcing the comparison table with an interactive, click-to-reveal exploration.

Bloom Taxonomy: Understand (L2). Bloom Verb: compare.

Learning objective: Compare the nominal voltage, typical capacity range, and common use of six battery types — AAA, AA, coin cell, single-cell LiPo, 9V, and D cell — by clicking each battery illustration to reveal its specifications in an infobox.

Canvas layout:
- Top/center (70%): six battery illustrations to relative scale, smallest (coin cell) to largest (D cell)
- Right side (30%, stacking below on narrow screens): infobox showing the specs of whichever battery was last clicked

Visual elements:
- Six battery illustrations — AAA, AA, coin cell, LiPo pouch, 9V block, D cell — tinted by chemistry (alkaline gray-blue, lithium orange)
- A "cells inside" toggle on the 9V battery revealing an exploded view of six 1.5V cells in series, reinforcing the Chapter 4 series-circuit connection
- A comparison bar beneath each battery showing relative capacity at a glance

Interactive controls:
- Click a battery for its infobox (chemistry, nominal voltage, capacity range, common use)
- Click the 9V "cells inside" toggle for the exploded animation
- Slider: "Load Current (mA)" live-updates an estimated battery life readout once a battery is selected
- Button: "Reset" clears the selection

Default parameters:
- No battery pre-selected; infobox shows "Click a battery to see its specs" placeholder
- Load Current slider defaults to 40 mA once a battery is selected

Behavior when a battery is clicked: Infobox displays chemistry, nominal voltage, capacity range, common use, and a live-calculated estimated battery life using the Load Current slider and the midpoint of the capacity range.

Data Visibility Requirements:
  Stage 1 (default): All six batteries shown unselected with empty comparison bars
  Stage 2 (battery clicked): Selected battery highlighted, comparison bar filled to scale, full spec in the infobox
  Stage 3 (slider moved): Estimated battery life updates live, connecting capacity to a concrete "how long will this last" answer

Instructional Rationale: An Understand-level comparison objective calls for click-to-reveal specification cards rather than a passive image, so learners compare batteries side by side. The live battery-life slider makes capacity tangible and reinforces load current from earlier in the chapter.

Color scheme: Cool gray-blue for alkaline chemistry, warm orange for lithium chemistry, matching the book's accent-color convention.

Responsive behavior: Battery row scrolls horizontally on narrow screens with the infobox stacking below; all controls remain touch-operable.

Implementation: p5.js, with each battery a clickable region tied to a specification lookup table; infobox and slider rendered as HTML beside (or below) the canvas.
```

## Related Resources

- [Chapter 5: "Conductors, Batteries, and Circuit Vocabulary Review"](../../chapters/05-conductors-batteries-review/index.md)
