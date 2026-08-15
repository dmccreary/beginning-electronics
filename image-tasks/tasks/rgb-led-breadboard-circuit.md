---
id: rgb-led-breadboard-circuit
title: RGB LED breadboard wiring diagram
status: open
priority: 1
output: docs/kits/rgb-led/rgb-circuit.png
requester: dan
created: 2026-08-15
chapter: kits/rgb-led
accept:
  format: png
  min_width: 1400
  min_height: 1000
  aspect: '4:3'
  aspect_tolerance: 0.12
  max_kb: 500
  alpha: any
  no_text: true
notes: 'Referenced by docs/kits/rgb-led/index.md under the "Circuit" heading. The
  page currently renders a broken image. The parts list on that page is authoritative:
  2 AA batteries, a battery holder, three 330 ohm resistors, one common-cathode RGB
  LED, hookup wire, solderless breadboard.'
---

Create a clean, accurate wiring illustration of an RGB LED circuit built on a
white solderless breadboard, drawn for beginning electronics students in grades
5-12 who will copy the wiring hole-for-hole.

**Viewpoint.** Slight three-quarter view from above and in front, so the
breadboard's grid of tie-point holes is clearly visible and every wire's
entry hole is unambiguous. The whole breadboard fits in frame with comfortable
margin on all four sides.

**The breadboard.** A standard full-size white solderless breadboard with a
visible grid of tie-point holes, a red stripe along one power rail and a blue
stripe along the other, and a center channel dividing the two banks of rows.

**The circuit — wire it exactly like this.**

- One **common-cathode RGB LED** stands upright near the center of the board
  with its four legs in four adjacent rows on one side of the center channel.
  The LED has a clear or lightly diffused dome. Its three color dies are
  suggested by a soft red, green, and blue glow inside the dome rather than by
  any label. The common cathode leg is visibly the longest of the four.
- The **common cathode leg** connects by a short black jumper wire to the blue
  negative power rail.
- Each of the other **three legs** connects through its **own 330 ohm resistor**
  (beige axial body, four color bands, silver leads) to the red positive rail.
  Draw all three resistors clearly separated, in parallel, so a student can see
  there is exactly one resistor per color channel.
- A **2 x AA battery holder** sits beside the breadboard with its red lead
  running to the red positive rail and its black lead to the blue negative
  rail. Show two AA cells seated in the holder.

**Wire colors.** Red for positive, black for negative, and let the three
resistor branches read clearly as three separate paths. Route jumper wires as
tidy right-angle or gently curved runs — no crossing tangles, no wire passing
behind a component in a way that hides where it lands.

**Style.** Flat vector illustration with clean bold outlines and bold flat
color fills. Soft gradients only for the LED's glow. Bright and optimistic,
warm and rounded, accurate but friendly. Consistent lighting across the whole
scene.

**Background.** Plain, very light neutral (near-white or the faintest warm
gray) so the illustration drops onto a textbook page cleanly. No desk scene,
no clutter, no props.

**Absolutely no text.** No letters, numbers, labels, titles, arrows, callout
lines, legends, watermarks, or logos anywhere in the image. Resistor color
bands are fine — they are stripes, not text. The LED's glow colors carry the
meaning; do not spell anything out.

**Do not include** any microcontroller, Arduino, Raspberry Pi, laptop, code, a
soldering iron, solder, smoke, sparks, or mains wiring. Do not draw hands or
people.
