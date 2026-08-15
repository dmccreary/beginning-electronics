---
title: XR2206 Waveform Generator Explorer
description: Given a rendered XR2206 signal generator kit with a jumper-selectable waveform, a frequency slider (1 Hz–1 MHz, log scale), and an amplitude slider, select each waveform type and adjust both sliders, observing how the live scope trace's shape, speed, and height change together.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, examine.
---

# XR2206 Waveform Generator Explorer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 23: "Signal Generators and Solar Power"](../../chapters/23-signal-generators-solar-power/index.md).

```text
Type: microsim
**sim-id:** xr2206-waveform-generator-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students select among sine, square, and triangle waveforms on a rendered XR2206 kit and adjust frequency and amplitude, watching a live scope trace respond in real time so the abstract wave math connects to knobs they will actually turn on their own kit.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, examine.

Learning objective: Given a rendered XR2206 signal generator kit with a jumper-selectable waveform, a frequency slider (1 Hz–1 MHz, log scale), and an amplitude slider, select each waveform type and adjust both sliders, observing how the live scope trace's shape, speed, and height change together.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: XR2206 Waveform Generator Explorer | Topic: XR2206 function generator, sine wave, square wave, triangle wave, frequency adjustment, amplitude adjustment | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a rendered XR2206 signal generator kit, select a waveform type and adjust frequency and amplitude sliders to observe the resulting sine, square, or triangle wave" returned a top match of "Sine Wave" (dmccreary/signal-processing, WHAT score 0.596, recommendation "generate") — below the 0.60 template threshold and a generic math sine-wave demo (amplitude/period/phase on a Cartesian axis), not a selectable-waveform kit tied to real component knobs. A keyword search of the 3,764-entry MicroSim catalog for "waveform generator," "function generator," and "XR2206" found only that same generic sine-wave family, no function-generator-kit sim. New specification. **Library/Implementation fit:** an excellent, central candidate for the breadboard-sim-generator skill — the kit's IC socket, jumper caps (J1/J2), blue screw terminals, and AMP/FINE/COARSE potentiometers are rendered as real, labeled components exactly as a student would see them on their own board, adapting the same "rendered PCB with turnable knobs" approach Chapter 22 used for its buck converter module.

Canvas layout: A rendered XR2206 kit board occupying the left/main area — IC socket, jumper block (J1/J2), SIN/TRI and SQU blue terminals, and AMP/FINE/COARSE potentiometers; a right-side panel holds a waveform selector (Sine/Square/Triangle radio buttons tied to the jumper position), a frequency slider (log scale, 1 Hz–1 MHz), an amplitude slider, and a live oscilloscope-style plot with a numeric readout (frequency in Hz, peak amplitude in V).

Components/elements involved: Rendered XR2206 kit board; jumper cap toggling J1 (sine) vs. J2 (triangle) at the SIN/TRI terminal; SQU terminal always active; AMP potentiometer; COARSE range control; FINE frequency control; oscilloscope-style waveform plot.

Required interactivity:
- Selecting Sine, Square, or Triangle (radio buttons tied to a virtual jumper) redraws the scope with the correct shape and opens an infobox naming which physical jumper (J1, J2, or neither) a student would move on the real kit
- Moving the frequency slider (log scale, 1 Hz–1 MHz) changes the plotted wave's speed live, with the numeric readout updating in real time and the scope's time axis auto-scaling so both very slow and very fast waves stay visible
- Moving the amplitude slider changes the plotted wave's peak height, clamped to each waveform's realistic range (0–3 V for sine/triangle, up to 8 V for square) matching the kit's real spec sheet
- Hovering the AMP, FINE, or COARSE potentiometer opens an infobox naming its real-world function and which control on the physical kit it represents
- Clicking the XR2206 IC opens an infobox with a one-line description of its internal oscillator core — something the student controls, not something they need to build

Default state: Sine selected, frequency at 1 kHz, amplitude at 2 V; scope shows a smooth sine trace; infobox reads "Try switching to Square or Triangle and see how the shape changes."

Instructional Rationale: An Apply-level "demonstrate/examine" objective needs a manipulable parameter (waveform shape, frequency, amplitude) with an immediate, visible consequence on a live scope, letting students discover how each knob changes the wave before ever touching the real kit.

Color scheme: Green PCB matching real kit photos; black IC body; blue terminal blocks matching the kit's labeled blue screw terminals; amber scope trace on a dark scope background for contrast.

Responsive behavior: Kit rendering and control/scope panel stack vertically on narrow screens; sliders and radio buttons remain full-width and legible at any viewport size.

Implementation: p5.js, built using the breadboard-sim-generator skill's component-rendering conventions (labeled PCB parts, real-feel potentiometer knobs) adapted for a sealed kit board rather than a literal tie-point grid, plus a small waveform-plotting function driven by the current shape/frequency/amplitude state.
```

## Related Resources

- [Chapter 23: "Signal Generators and Solar Power"](../../chapters/23-signal-generators-solar-power/index.md)
