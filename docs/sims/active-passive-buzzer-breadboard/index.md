---
title: Active vs. Passive Buzzer Tone Comparison
description: Compare an active buzzer's fixed tone against a passive buzzer's frequency-controlled tone by switching each on a breadboard and adjusting a frequency slider that only affects the passive buzzer, and predict the effect of reversing buzzer polarity.
status: scaffold
library: p5.js
bloom_level: Understand (L2) / Apply (L3). Bloom Verb: compare, demonstrate.
---

# Active vs. Passive Buzzer Tone Comparison



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 19: "Driving Outputs: Motors, Buzzers, and More"](../../chapters/19-driving-outputs-motors-buzzers/index.md).

```text
Type: microsim
**sim-id:** active-passive-buzzer-breadboard<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students switch an active buzzer and a passive buzzer on a shared breadboard and directly compare a fixed built-in tone against a frequency-controlled tone, including what happens when polarity is reversed.

Bloom Taxonomy: Understand (L2) / Apply (L3). Bloom Verb: compare, demonstrate.

Learning objective: Compare an active buzzer's fixed tone against a passive buzzer's frequency-controlled tone by switching each on a breadboard and adjusting a frequency slider that only affects the passive buzzer, and predict the effect of reversing buzzer polarity.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Active vs Passive Buzzer Tone Comparison Breadboard | Topic: piezo buzzer, active buzzer, passive buzzer, buzzer tone, buzzer polarity, audio output | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Compare an active buzzer's fixed tone against a passive buzzer's frequency-controlled tone on a wired breadboard circuit, and predict the audio output produced by each" topped out at "Tone Generator" (dmccreary/signal-processing, WHAT score 0.4897, "generate") — below the 0.60 template threshold and not wired or polarity-aware. New specification, extending `breadboard-lib.js`'s existing `bbBuzzer({a, b})` component with an active/passive mode and an oscillator block.

Canvas layout: Breadboard with two buzzers side by side, each with its own switch and polarity-marked leads: left wired straight to the battery (active), right through an "oscillator" block (passive); right panel holds "Active Switch" and "Passive Switch" toggles, a frequency slider (200-2000 Hz, passive only), a "Reverse Passive Polarity" button, and an infobox.

Components/elements involved: Breadboard with rails; battery; two labeled piezo buzzers with +/- markings; oscillator block feeding the passive buzzer; switches; wires; animated sound-wave rings expanding from whichever buzzer sounds, spacing matching pitch.

Required interactivity:
- Clicking "Active Switch" immediately sounds the active buzzer at one fixed pitch, regardless of the frequency slider
- Clicking "Passive Switch" sounds the passive buzzer only at the slider's frequency; dragging it changes the pitch and ring spacing live
- Clicking "Reverse Passive Polarity" flips the passive buzzer's leads and silences it even with switch and slider active
- Hovering either buzzer's polarity markings opens an infobox explaining buzzer polarity
- Button "Reset" turns both switches off and resets polarity and slider

Default state: Both switches off, silent, standard polarity, infobox reads "Active buzzers beep the instant they get power. Passive buzzers need a changing signal to make any sound at all."

Data Visibility Requirements:
Stage 1: Show each buzzer's switch state
Stage 2: Show the frequency slider's value and whether it affects sound
Stage 3: Show the animated ring spacing matching pitch
Stage 4: Show silence when the passive buzzer's polarity is reversed

Instructional Rationale: An Understand/Apply "compare/demonstrate" objective calls for a side-by-side toggle so the active/passive distinction, and buzzer polarity's effect, are directly observable.

Color scheme: Orange expanding sound-wave rings, green current dots, red flash when polarity is reversed and no sound plays.

Responsive behavior: Breadboard and controls stack vertically on narrow screens; sliders and buttons stay full-width and touch-friendly.

Implementation: p5.js, breadboard-sim-generator approach, extending `breadboard-lib.js`'s `bbBuzzer` component with active/passive modes and animated sound-wave rendering.
```

## Related Resources

- [Chapter 19: "Driving Outputs: Motors, Buzzers, and More"](../../chapters/19-driving-outputs-motors-buzzers/index.md)
