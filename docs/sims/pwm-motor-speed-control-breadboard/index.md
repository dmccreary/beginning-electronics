---
title: PWM Motor Speed Control Breadboard
description: Given a duty-cycle slider driving a transistor-switched DC motor on a breadboard, predict and observe how PWM duty cycle changes average motor speed, connecting the result to Chapter 14's 555 duty cycle.
status: scaffold
library: p5.js
bloom_level: Apply (L3). Bloom Verb: demonstrate, predict, adjust.
---

# PWM Motor Speed Control Breadboard



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 19: "Driving Outputs: Motors, Buzzers, and More"](../../chapters/19-driving-outputs-motors-buzzers/index.md).

```text
Type: microsim
**sim-id:** pwm-motor-speed-control-breadboard<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students drag a duty-cycle slider driving a transistor-switched DC motor on a rendered breadboard, and directly observe how the on/off pulse ratio changes average motor speed.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, predict, adjust.

Learning objective: Given a duty-cycle slider driving a transistor-switched DC motor on a breadboard, predict and observe how PWM duty cycle changes average motor speed, connecting the result to Chapter 14's 555 duty cycle.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: PWM Motor Speed Control Breadboard | Topic: PWM control, duty cycle, motor speed control, motor back-EMF, motor noise suppression | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a duty cycle slider driving a transistor-switched DC motor on a breadboard, predict and observe how PWM duty cycle percentage controls average motor speed" topped out at "Pwm" (dmccreary/microsims, WHAT score 0.582, "generate") — below the 0.60 template threshold and an unwired abstract waveform demo. New specification, extending `breadboard-lib.js` with a PWM signal-source component and a duty-cycle-driven speed model, reusing Chapter 18's spinning-motor component.

Canvas layout: Breadboard with a battery, 2N2222, base resistor fed by a "PWM Source" block, flyback diode across the motor, and a motor with an animated spinning shaft; right panel holds a duty-cycle slider (0-100%), a pulse-train mini-graph, a speed readout, and an infobox.

Components/elements involved: Breadboard with rails; battery; labeled 2N2222; base resistor; PWM source block; flyback diode; motor with rotating shaft; wires; current-flow dots that pulse on/off with duty cycle instead of flowing steadily.

Required interactivity:
- Dragging the duty-cycle slider (0-100%) changes the pulse-train graph's on/off ratio and the shaft's spin speed proportionally
- At 0% the motor stays stopped; at 100% it spins at full speed, identical to Chapter 18's plain switch
- Hovering the pulse-train graph or the flyback diode opens an infobox defining duty cycle or reinforcing back-EMF protection
- Button "Reset" returns the duty cycle to 0%

Default state: Duty cycle 0%, motor stopped, infobox reads "0% duty cycle — power is never on, so the motor stays still."

Data Visibility Requirements:
Stage 1: Show the duty-cycle slider's percentage
Stage 2: Show the pulse-train graph's on/off ratio
Stage 3: Show the resulting shaft spin speed
Stage 4: Show current readout scaling with duty cycle

Instructional Rationale: An Apply-level "demonstrate/predict" objective calls for a continuous slider with immediate visible feedback, connecting the abstract duty-cycle percentage to a concrete, observable motor speed.

Color scheme: Green current dots pulsing with duty cycle, blue shaft spinning faster as duty cycle rises, orange pulse-train highlight.

Responsive behavior: Breadboard and controls stack vertically on narrow screens; the slider stays full-width and touch-draggable.

Implementation: p5.js, breadboard-sim-generator approach, extending `breadboard-lib.js` with a PWM signal-source component and a duty-cycle-driven motor speed model.
```

## Related Resources

- [Chapter 19: "Driving Outputs: Motors, Buzzers, and More"](../../chapters/19-driving-outputs-motors-buzzers/index.md)
