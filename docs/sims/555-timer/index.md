---
title: "555 Timer Astable and Monostable Simulator"
description: "555 Timer Astable and Monostable Simulator"
status: scaffold
library: p5.js
bloom_level: TBD
---

# 555 Timer Astable and Monostable Simulator



<iframe src="main.html" width="100%" height="502px"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 14: "The 555 Timer Chip"](../../chapters/14-555-timer-chip/index.md).

```text
Type: microsim
**sim-id:** 555-timer<br/>
**Library:** p5.js<br/>
**Status:** Reused<br/>
**Source:** https://dmccreary.github.io/microsims/sims/555-timer/<br/>
**Source Repo:** https://github.com/dmccreary/microsims/tree/main/docs/sims/555-timer

Reused from the MicroSim catalog (WHAT match score 0.8136). This simulation demonstrates the 555 timer's astable (oscillator) and monostable (one-shot) modes with accurate RC timing formulas, a real-time waveform display, and an LED output indicator. Learning objective: Given resistor and capacitor values, calculate the 555 timer's astable frequency and duty cycle using \( f = 1.44 / ((R_1 + 2R_2) C) \) and \( D = (R_1 + R_2) / (R_1 + 2R_2) \), and compare the resulting behavior against monostable mode's single timed pulse.
```

## Related Resources

- [Chapter 14: "The 555 Timer Chip"](../../chapters/14-555-timer-chip/index.md)
