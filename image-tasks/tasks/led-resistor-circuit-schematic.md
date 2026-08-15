---
id: led-resistor-circuit-schematic
title: LED + current-limiting resistor schematic (calculator header)
status: open
priority: 2
output: docs/sims/img/LED-circuit-v2.png
requester: dan
created: 2026-08-15
chapter: sims/led-resistor-calc
accept:
  format: png
  min_width: 1200
  min_height: 700
  max_kb: 400
  alpha: any
  no_text: false
notes: Referenced by docs/sims/led-resistor-calc/led-circuit-calculator.md as the
  header image. Currently a broken link. This is one of the rare tasks where a small,
  exactly specified set of symbols IS allowed in the image, because the schematic
  labels the three quantities the calculator solves for. The allowed symbols are listed
  in the prompt; nothing else may appear.
---

Create a clean, textbook-quality **schematic diagram** (not a breadboard
photo-illustration) of the simplest possible LED circuit: a voltage source, a
current-limiting resistor, and an LED in a single series loop. This is the
header image for a calculator that finds the right resistor value, so the
three quantities the student plugs in must be visually obvious.

**Layout.** A single rectangular series loop, drawn wide rather than tall,
centered with generous margin. Standard schematic conventions, clean
right-angle wire runs, uniform line weight.

**Components, going clockwise from the lower left.**

- A **DC voltage source** on the left side of the loop, drawn as the standard
  battery symbol (alternating long thin and short thick plates), positive
  terminal at the top.
- A **resistor** along the top wire, drawn as the standard zigzag (US-style)
  symbol.
- An **LED** on the right side of the loop, drawn as the standard diode
  triangle-and-bar symbol with two small parallel arrows pointing away from it
  to indicate emitted light. Give it a soft warm red glow so it reads as lit.
  The triangle must point in the direction of conventional current flow, from
  the positive terminal around to the negative — anode at top, cathode at
  bottom.
- The bottom wire returns to the negative terminal of the source.

**Current direction.** Place one small arrowhead on the top wire pointing
clockwise (left to right) to show conventional current flow.

**The only text allowed in this image.** These three labels, in a clean
sans-serif font, placed beside their component and nothing else:

- `Vs` beside the battery
- `R` above the resistor
- `Vf` beside the LED

That is the complete list. Do **not** add a title, a caption, units, numeric
values, an equation, axis text, a legend, a watermark, a logo, component
reference designators, or any other lettering anywhere in the image. If you
cannot render those three labels crisply and legibly, omit them entirely
rather than shrinking or crowding the schematic.

**Style.** Flat vector, clean bold outlines, bold flat fills, soft gradient
only for the LED glow. Schematic lines in a dark slate blue-black. Accent the
LED glow in warm orange-red. Bright, friendly, and precise — approachable for
a grade 5-12 student meeting schematic symbols for the first time.

**Background.** Plain white or the faintest warm gray. No frame, no border,
no drop shadow, no card edge.

**Do not include** a breadboard, jumper wires, a microcontroller, Arduino,
Raspberry Pi, laptop, code, a soldering iron, solder, sparks, hands, or
people.
