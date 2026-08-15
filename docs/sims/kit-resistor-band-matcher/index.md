---
title: Kit Resistor Band Matcher
description: Given a rendered resistor showing three color bands drawn from the set {brown, red, orange, black}, identify which of the four kit resistor values (220 Ω, 330 Ω, 1K, 10K) it represents, restricted to only the four band patterns taught in this chapter.
status: scaffold
library: p5.js
bloom_level: Remember (L1). Bloom Verb: identify, recognize.
---

# Kit Resistor Band Matcher



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 10: "Capacitor Timing and Resistor Values"](../../chapters/10-capacitor-timing-resistor-values/index.md).

```text
Type: microsim
**sim-id:** kit-resistor-band-matcher<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Build fast, reliable recognition of this chapter's four kit resistor values (220 Ω, 330 Ω, 1K, 10K) from their color bands alone, immediately after the reading process and comparison table above.

Bloom Taxonomy: Remember (L1). Bloom Verb: identify, recognize.

Learning objective: Given a rendered resistor showing three color bands drawn from the set {brown, red, orange, black}, identify which of the four kit resistor values (220 Ω, 330 Ω, 1K, 10K) it represents, restricted to only the four band patterns taught in this chapter.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Kit Resistor Color Band Identifier | Topic: Reading resistor color bands for four specific resistor values 220 ohm 330 ohm 1K 10K, brown black orange red bands, multiplier band | Subjects: Electronics, Beginning Electronics | Grade Level: Junior High | Learning Objectives: Identify the four go-to kit resistor values from their color bands" returned a top match of "Resistor Color Code Calculator" (dmccreary/learning-micropython, WHAT score 0.595, recommendation "generate") — below the 0.60 template threshold, so no existing sim is a close enough starting point. This is a new specification. Note for implementation: this repository already has a `drawResistor()`-style rendering function documented at `docs/sims/resistor/resistor.js` (physical tan-body resistor with colored bands) that can be reused as the rendering foundation instead of writing band-drawing code from scratch.

Canvas layout: Top area shows one large rendered resistor (tan body, three color bands, lead wires) centered on the canvas; below it, four large buttons labeled "220 Ω," "330 Ω," "1K," and "10K"; a small infobox and a score tracker sit beneath the buttons.

Components/elements involved: A rendered physical resistor with accurate band colors (brown, red, orange, black only, per this chapter's scope); four answer buttons; a "New Resistor" button; a score display ("3/5 correct").

Required interactivity:
- On load, and whenever "New Resistor" is clicked, render a resistor showing the bands for a randomly chosen one of the four kit values
- Hovering any band on the rendered resistor opens an infobox stating that band's position (first digit, second digit, or multiplier) and its color's meaning
- Clicking one of the four value buttons checks the answer: correct answers flash the resistor green and the infobox restates the full digit-and-multiplier breakdown; incorrect answers flash red and the infobox explains what that band pattern actually shows, without naming the correct answer outright
- The score tracker increments attempted/correct counts after each guess
- Button: "New Resistor" loads a fresh random resistor and clears the flash state

Default state: A 220 Ω resistor (red-red-brown) is shown; infobox reads "Hover a band to learn what it means, or pick an answer below."; score shows "0/0."

Instructional Rationale: A Remember-level "identify/recognize" objective is best served by a flashcard-and-quiz pattern with immediate right/wrong feedback, reinforcing the four specific band patterns just taught rather than testing the full ten-color system, which is out of scope until Chapter 11.

Color scheme: Accurate resistor band colors (brown, red, orange, black) rendered true-to-life; green flash for correct, red flash for incorrect, warm orange highlight on the currently hovered band, consistent with this chapter's other diagrams.

Responsive behavior: The resistor illustration scales to the canvas width; the four answer buttons wrap into a 2×2 grid on narrow screens; hover feedback also triggers on tap for touch devices.

Implementation: p5.js, extending the existing `drawResistor()` rendering approach from `docs/sims/resistor/` in this repository, with quiz logic and scorekeeping layered on top.
```

## Related Resources

- [Chapter 10: "Capacitor Timing and Resistor Values"](../../chapters/10-capacitor-timing-resistor-values/index.md)
