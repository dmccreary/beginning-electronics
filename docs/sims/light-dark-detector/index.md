---
title: "Light and Dark Detector"
description: "A light-dependent resistor drives a transistor through a voltage divider, switching an LED and buzzer as the light level crosses the 0.7 volt base threshold."
image: /sims/light-dark-detector/light-dark-detector.png
og:image: /sims/light-dark-detector/light-dark-detector.png
twitter:image: /sims/light-dark-detector/light-dark-detector.png
social:
   cards: false
---
# Light and Dark Detector

<iframe src="main.html" height="602px" scrolling="no"></iframe>

[Run the Light and Dark Detector MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your own website with this `iframe`:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/light-dark-detector/main.html" height="602px" scrolling="no"></iframe>
```

## About this MicroSim

A light-dependent resistor and a fixed resistor form a voltage divider. The
divider's output drives a transistor base through a resistor, and the transistor
switches an LED and a buzzer.

Sliding the light level changes the divider voltage **smoothly**, but the output
switches **abruptly**. That gap between a continuous input and an on-or-off
output is the whole point of the circuit, and it is what makes a transistor a
switch rather than a dimmer.

## The Circuit

```linenums="0"
9 V rail → LDR (0–100 kΩ) → divider junction → R2 4.7 kΩ → ground
divider junction → RB 4.7 kΩ → Q1 base
B+ rail → RL 470Ω → D1 → Q1 collector;  BZ1 in parallel with D1
Q1 emitter → ground
```

| Component | Value | Purpose |
|-----------|-------|---------|
| LDR | 0–100 kΩ | resistance falls as light rises |
| R2 | 4.7 kΩ | the divider's lower leg — sets the trip point |
| RB | 4.7 kΩ | limits base current |
| Q1 | NPN | switches the load |
| RL | 470 Ω | current-limiting for the LED |
| D1, BZ1 | red LED, buzzer | the two outputs, in parallel |

### Where the trip point comes from

The transistor needs about 0.7 V at its base. The divider delivers
9 × 4.7 kΩ / (R<sub>LDR</sub> + 4.7 kΩ), so it reaches 0.7 V when the LDR is
around 55 kΩ — a bit over half of its dark resistance. That is why the LED
switches near the middle of the slider. Change R2 and the trip point moves,
which is exactly how you calibrate a real detector.

## How to Use It

1. Press **Start**, then drag **Light level** slowly from 0% upward.
2. Watch the divider voltage climb steadily while the LED stays dark.
3. Somewhere near the middle, the LED and buzzer snap on together.
4. Keep going to 100%. Note that the LED does **not** get brighter — once the
   transistor is saturated, the load resistor sets the current, not the light.

## What the Animation Shows

Below the threshold, a small base current flows but the collector path carries
nothing, so the load wires show no dots. Above it, the collector wires come
alive. The scope makes the same point numerically: the blue divider-voltage
trace is a smooth ramp, and the red LED-current trace is a step.

## Lesson Plan

### Grade Level, Subject and Topic

High school. Electronics. Voltage dividers, transistor switching, sensor
interfacing.

### Learning Objective

Students will be able to explain how a voltage divider converts a sensor's
resistance into a voltage, and predict the light level at which a transistor
switch turns on, by sweeping the light level and reading the divider voltage
against the 0.7 V base threshold.

### Activities

#### Find the threshold

Sweep slowly and record the light percentage at which the LED comes on. Then
read the divider voltage at that instant. Students should find ≈0.7 V every
time, whatever path they took to get there.

#### Predict the calibration change

Ask: if we replaced R2 with a 10 kΩ resistor, would the light have to be
brighter or dimmer to trip the circuit? Reason it out from the divider formula
before checking.

#### Why doesn't it dim?

At 60% and at 100% light the LED current is identical. Ask students to explain
using the collector loop: once the transistor saturates, what sets the current?

### Assessment

- What is the divider voltage in complete darkness, and why is the LED off?
- The base sits at 0.72 V with the LED on. Why doesn't it rise to 5 V?
- Turn this into a *dark* detector instead. What single change do you make?

## Model Limitations

This simulation solves the circuit in DC steady state. The transistor is
modelled as a switch with a saturation drop, not with a current gain (beta)
curve, so it is suitable for switching lessons but not for amplifier design.
There is no transient response, no capacitance, no inductance and no AC.
Component values are ideal.

## References

- [Push Button and LED Circuit](../button-led-breadboard/index.md) — LEDs and current-limiting resistors on their own
- [Series vs Parallel Explorer](../series-parallel-explorer/index.md) — the parallel loads used here, in isolation
