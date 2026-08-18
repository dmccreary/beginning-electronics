# Image Generation Prompts: Safe Power for Learning

Prompts for the photographic and illustrative images on the
[Safe Power for Learning](./index.md) page. The two circuit schematics on
that page are *not* generated this way — they are drawn programmatically by
`ptc-fuse-schematic.py` and `short-circuit-protection.py` in this same
directory, so that their values stay in sync with the text.

Each prompt below is fully self-contained — paste any single one into your
AI image tool without needing the others. Generate at 1536×864 (16:9) unless
the prompt says otherwise, then save into this directory under the filename
given at the end of the prompt.

## House Style for This Page

All images on this page share one look: clean educational product
photography on a warm neutral background, soft even lighting, gentle
shadows, realistic scale, shallow depth of field only where noted. No logos,
no brand marks, no readable text or numbers on any component, no captions,
no borders, no watermarks, no hands unless the prompt asks for them. Labels
are added afterwards in the page itself, so leave calm empty space where the
prompt says to.

!!! warning "Why no text in the images"
    AI image tools render text unreliably, and a mislabeled voltage on a
    safety page is worse than no label at all. Every number a reader needs is
    in the page's prose, tables, or the two generated schematics.

## 1. Hero: A Safe Classroom Power Setup

Create a wide 16:9 educational product photograph of a complete, tidy,
low-voltage breadboard power setup arranged left to right on a warm
neutral-gray surface: a small unbranded black plug-in wall adapter with a
thin cable ending in a round barrel connector; that cable running to a small
rectangular black circuit board module with a barrel socket, a tiny toggle
switch, a green indicator light, and two rows of pins along its long edges;
the module seated on the power rails at one end of a full-size white
solderless breadboard with red and blue rail stripes; and a simple circuit of
one resistor and one glowing red LED wired on the breadboard. Soft even
lighting, gentle shadows, realistic scale, shallow depth of field on the far
end. Leave generous calm empty space along the top third for labels. No
logos, readable text, numbers, captions, borders, or watermark.

Filename: `safe-power-hero.png`

## 2. The PTC Resettable Fuse, Close Up

Create a 16:9 macro product photograph of three small radial-leaded PTC
resettable fuses on a warm neutral-gray surface. Each is a flat disc about
seven millimeters across, coated in pale yellow-ochre epoxy with a slightly
irregular hand-dipped edge, with two straight tinned copper wire leads
emerging parallel from the bottom edge, spaced about five millimeters apart.
One lies flat facing the camera, one stands upright on its leads, one rests
at a three-quarter angle. Sharp macro focus on the upright one, soft falloff
behind. Include a plain unmarked 5 mm red LED beside them for scale. Soft
even lighting, gentle shadows. Leave calm empty space on the right third for
labels. No logos, readable text, numbers, printed markings, captions,
borders, or watermark.

Filename: `ptc-fuse-part.png`

## 3. The Fuse Installed on the Breadboard

Create a wide 16:9 educational photograph looking down at a slight angle onto
the left end of a full-size white solderless breadboard with red and blue
power-rail stripes. A small rectangular black power-supply circuit board is
seated across the power rails at the top. A short jumper wire runs from a pin
on that board down into a row of the main terminal strip. A small pale
yellow-ochre disc component with two wire leads bridges from that row across
to a second row. A red jumper wire runs from the second row up into the red
power rail. The wiring is neat, deliberate, and easy to trace. Soft even
lighting, gentle shadows, sharp focus across the wiring, realistic scale. No
logos, readable text, numbers, captions, borders, or watermark.

Filename: `ptc-fuse-on-breadboard.png`

## 4. Choosing the Right Adapter Voltage

Create a wide 16:9 educational product photograph with exactly two equal
halves separated by generous empty space, both on the same warm neutral-gray
background. On the left, a small unbranded black plug-in wall adapter with a
barrel-connector cable, lit brightly and cleanly, sitting upright and looking
inviting. On the right, an identical-looking but visibly larger and bulkier
black wall adapter, lit slightly cooler and more dimly, sitting at a
discouraging tilt. Identical framing, scale, and shadow treatment otherwise,
so the only differences a reader notices are size and lighting mood. Leave
calm empty space above each adapter for a label. No logos, readable text,
numbers, captions, borders, checkmarks, crosses, or watermark.

Filename: `adapter-voltage-choice.png`

## 5. Power Options as Students Gain Experience

Create a wide 16:9 educational product photograph with exactly three equal
columns on a warm neutral-gray background, evenly spaced with clear gaps.
Left column: a black plastic battery holder for two AA cells with red and
black wire leads, cells seated. Center column: a small rectangular black
power-supply circuit board with a barrel socket, a small toggle switch, a
green indicator light, and pin rows along both long edges. Right column: a
small unbranded black plug-in wall adapter with a coiled barrel-connector
cable. Identical lighting, scale treatment, and soft shadows across all
three. Leave generous calm empty space along the top for column headings. No
logos, readable text, numbers, captions, borders, or watermark.

Filename: `power-options-progression.png`

## 6. Volt Checks the Power Rail

Please generate a new pose for Volt the Robot.

A flat cartoon / vector illustration of Volt, a friendly pedagogical mascot
for a beginning electronics textbook. Volt is a small, compact robot with a
rounded blue chassis (hex #2196F3), stubby rounded limbs, and no sharp edges.
Volt has big round LED-style eyes that glow warm orange (hex #FF9800) and a
simple friendly closed-mouth smile. On top of Volt's head is a coiled spring
antenna with a glowing orange bulb tip. Volt wears a small tool belt holding
a mini screwdriver and a wire clip. Volt is small and compact with chibi-style
proportions. Style: flat cartoon / vector, clean lines, bold flat colors,
transparent background, suitable for embedding in educational content. No
text in image.

Volt stands beside a simple stylized white breadboard that is taller than
Volt, holding up a small multimeter probe in one hand and touching it to the
breadboard's red power rail, head tilted slightly in careful concentration
with a focused, satisfied expression. The pose reads as "checking before
powering up" — deliberate and unhurried, not alarmed.

Filename: `volt-checks-the-rail.png`

Please generate a new RGBA PNG image now with a fully transparent
alpha-channel background. The background MUST be fully transparent with an
alpha channel. DO NOT use a white, black, or checkered background.

After saving, run the padding trimmer:

```sh
python $BK_HOME/src/image-utils/trim-padding-from-image.py docs/setup/safe-power-for-learning/volt-checks-the-rail.png
```
