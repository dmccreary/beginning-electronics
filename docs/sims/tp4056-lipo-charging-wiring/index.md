---
title: TP4056 Charging Circuit Wiring
description: Interactive p5.js wiring diagram of a TP4056 charger module connected to a single-cell LiPo battery and a project board.
image: /sims/tp4056-lipo-charging-wiring/tp4056-lipo-charging-wiring.png
og:image: /sims/tp4056-lipo-charging-wiring/tp4056-lipo-charging-wiring.png
twitter:image: /sims/tp4056-lipo-charging-wiring/tp4056-lipo-charging-wiring.png
social:
   cards: false
quality_score: 0
---

# TP4056 Charging Circuit Wiring

<iframe src="main.html" height="592px" width="100%" scrolling="no"></iframe>

[Run the TP4056 Charging Circuit Wiring MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
<br/>
[Edit in the p5.js Editor](https://editor.p5js.org/)

## About This MicroSim

A TP4056 module has six solder pads, and every beginner mix-up with one comes
down to putting a wire on the wrong pair. This diagram lays all three pairs out
in the same order they appear on the real board:

- **+ / −** beside the micro-USB jack — 5 V in. These are the same electrical
  node as the jack, so you feed one *or* the other, never both.
- **B+ / B−** — the LiPo cell, and nothing else.
- **OUT+ / OUT−** — your project. On a protected module these pads sit behind
  the DW01A and FS8205 protection pair, which is why the load belongs here.

Current animates along the wires as the cell charges, the CHRG and STDBY status
LEDs behave the way they do on a real module, and the charge current tapers off
and stops by itself as the cell approaches 4.2 V.

## How to Use

1. **Watch it charge.** With the USB plugged in, the red CHRG LED is lit and
   current flows from the supply, through the module, into the cell. Time only
   advances while your pointer is over the diagram.
2. **Hover any part** — the chip, the protection pair, R_PROG, either status
   LED, any pad, the cell, the project board — to read what it does.
3. **Change the charge current.** The menu swaps R_PROG. Charge current is
   `I = 1200 / R_PROG`, so the 1.2 kΩ resistor modules ship with gives 1000 mA,
   and a 5 kΩ resistor slows it to about 240 mA for a small cell.
4. **Unplug the USB** with the project board switched on, and the board runs
   from the cell instead. Keep watching: when the cell empties, the protection
   chips disconnect OUT before the cell is damaged.
5. **Tick the mis-wiring box** to move the project board onto B+/B− alongside
   the battery, unplug the USB, and watch what happens with no protection in
   the path.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/tp4056-lipo-charging-wiring/main.html"
        height="592px"
        width="100%"
        scrolling="no"></iframe>
```

## Lesson Plan

### Grade Level

7-10 (Beginning Electronics)

### Duration

10-15 minutes

### Prerequisites

- LiPo battery basics and safe-handling rules
- Series and parallel battery pack wiring
- Reading a simple circuit diagram

### Activities

1. **Exploration** (5 min): Students hover every labeled part and write down,
   in their own words, what each of the three pad pairs is for.
2. **Guided Practice** (5 min): Students set the charge current with the R_PROG
   menu and predict, before switching the project board on, whether the cell
   will still charge. The 120 mA setting with a 120 mA load is the interesting
   case — the cell stops gaining charge even though USB is connected.
3. **Assessment** (5 min): Students tick the mis-wiring box, unplug the USB,
   and explain what the protection chips would have done had the load been on
   OUT+/OUT− instead.

### Assessment

- Can the student label B+, B−, OUT+ and OUT− on a photograph of a real module?
- Can the student explain why the battery and the load do not share a pad pair?
- Can the student calculate charge current from R_PROG using `I = 1200 / R_PROG`?

## References

1. [TP4056 Datasheet (NanJing Top Power ASIC Corp.)](https://dlnmh9ip6v2uc.cloudfront.net/datasheets/Prototyping/TP4056.pdf) - the source for the `I = 1200 / R_PROG` charge-current relationship and the 4.2 V termination voltage.
2. [Lithium polymer battery - Wikipedia](https://en.wikipedia.org/wiki/Lithium_polymer_battery) - chemistry, voltage range, and handling background for single-cell LiPo batteries.
3. [Battery charger - Wikipedia](https://en.wikipedia.org/wiki/Battery_charger#Constant_current_/_constant_voltage) - the constant-current / constant-voltage charging profile this MicroSim models.
