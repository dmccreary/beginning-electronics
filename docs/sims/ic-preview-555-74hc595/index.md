---
title: Two ICs Coming Soon — 555 Timer and 74HC595 Preview
description: Identify the 555 timer IC and the 74HC595 shift register by their pin count and package shape, and summarize in one sentence each what job every chip will perform later in the course.
status: scaffold
library: p5.js
bloom_level: Remember (L1) / Understand (L2). Bloom Verb: identify, describe, summarize.
---

# Two ICs Coming Soon — 555 Timer and 74HC595 Preview



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 13: "Meet the Transistor"](../../chapters/13-meet-the-transistor/index.md).

```text
Type: infographic
**sim-id:** ic-preview-555-74hc595<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Give students a light, survey-level preview of the 555 timer and 74HC595 shift register chips they will build with in Chapters 14 and 15, without teaching full wiring or timing formulas here.

Bloom Taxonomy: Remember (L1) / Understand (L2). Bloom Verb: identify, describe, summarize.

Learning objective: Identify the 555 timer IC and the 74HC595 shift register by their pin count and package shape, and summarize in one sentence each what job every chip will perform later in the course.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Meet the ICs Coming Soon: 555 Timer and 74HC595 Shift Register | Topic: Integrated circuit survey introduction, 555 timer astable and monostable modes, 555 pin configuration, 74HC595 shift register serial data input and parallel data output | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Identify the 555 timer IC and the 74HC595 shift register and summarize what each chip will be used for later in the course" returned two matches at "template" strength: "555 Timer" (dmccreary/microsims, WHAT score 0.6463) and "Shift Register MicroSim" (dmccreary/digital-electronics, WHAT score 0.6351). Both are full teaching simulations — the 555 Timer sim includes accurate RC timing formulas and a live waveform display, and the Shift Register sim includes a logic analyzer showing clock and latch timing — exactly the deep, formula-level content this chapter is intentionally deferring to Chapters 14 and 15. Reusing either sim here would duplicate those future chapters' central teaching tool before students have the RC-timing (Chapter 10) and clocked-logic background those sims assume. This is written as a new, deliberately shallow specification instead, and both existing sims are flagged here as the direct, ready-to-embed resources Chapters 14 and 15 should reuse when those chapters are generated.

Canvas layout: Two side-by-side chip panels on a single canvas — left panel shows an 8-pin DIP outline labeled "555 Timer," right panel shows a 16-pin DIP outline labeled "74HC595 Shift Register"; a small infobox sits below both panels.

Components/elements involved: A rendered 8-pin DIP chip silhouette; a rendered 16-pin DIP chip silhouette; a "Coming in Chapter 14" tag on the 555 panel; a "Coming in Chapter 15" tag on the 74HC595 panel; an infobox.

Required interactivity:
- Clicking the 555 Timer chip panel reveals an infobox with one sentence on astable mode, one sentence on monostable mode, and the note "Full wiring and timing math in Chapter 14"
- Clicking the 74HC595 chip panel reveals an infobox with one sentence on serial data input, one sentence on parallel data output, and the note "Full wiring and 8-LED project in Chapter 15"
- Hovering either chip silhouette gives it a highlight border to show it is clickable
- No sliders, waveforms, or timing simulation are included — this element is intentionally kept at preview depth

Default state: Neither panel expanded; infobox reads "Click a chip to preview what it does."

Data Visibility Requirements:
Stage 1: Show each chip's name and pin-count package shape
Stage 2: Show which future chapter teaches that chip in full
Stage 3: On click, show the one or two teaser sentences for that chip

Instructional Rationale: A Remember/Understand "identify/summarize" objective at survey depth calls for a simple click-to-reveal pattern with short teaser text, not a manipulable simulation — matching this chapter's intentional choice to name and preview these chips without teaching their internal timing or clocking behavior, which belongs to Chapters 14 and 15.

Color scheme: Blue chip outlines matching the site's primary theme color, orange highlight border on hover matching the accent color, consistent with this chapter's other diagrams.

Responsive behavior: The two chip panels stack vertically on narrow screens instead of sitting side by side; the infobox remains full-width beneath them.

Implementation: Plain p5.js, not the breadboard-sim-generator — this is a lightweight click-to-reveal preview, not a wired or timed circuit.
```

## Related Resources

- [Chapter 13: "Meet the Transistor"](../../chapters/13-meet-the-transistor/index.md)
