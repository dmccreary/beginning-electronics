# Breadboard MicroSim Quality Checklist

Walk this **in addition to** `microsim-utils/references/visual-checklist.md`,
which covers the general MicroSim defects (clipped text, residual strokes,
overlapping controls, missing backgrounds). This list covers only what is
specific to a breadboard sim.

Mark each item PASS / FAIL / N/A against a screenshot taken at the sim's iframe
height, plus a second one at ~400 px width. For each FAIL, note what you see and
apply the smallest fix.

---

## 1. Board rendering

**1.1 The whole board is visible.** All four rails, rows a-j, and both rows of
column numbers are inside the drawing region. A clipped bottom rail means
`bbLayout()` was given a width but no height, or the height budget
(`drawHeight − boardTop − readoutHeight`) is too small.

**1.2 Hole labels are legible.** Row letters and column numbers are readable at
the iframe's normal width. Below ~12 px pitch the library thins column numbers to
every fifth; if they are still unreadable, use 20 columns instead of 30 or
increase `drawHeight`.

**1.3 The supply badge is on the canvas.** The battery sits in the reserved strip
left of the board, fully inside the canvas, with its red and black leads reaching
their rail holes. If it is cut off at the left edge, the sim passed
`{supply: false}` to `bbLayout()` while still placing a battery.

**1.4 Rails read as rails.** Red stripe above each `+` row, blue below each `−`
row, `+` and `−` signs at both ends.

**1.5 The center channel is visible** between rows e and f, and any push button
straddles it.

---

## 2. Circuit correctness

These are the checks a screenshot alone cannot settle - verify them in the
browser console with the sim running.

**2.1 Every intended path conducts.** Close each button and switch in turn and
confirm the expected part carries current. `bbCurrent('D1')` should be non-zero.

**2.2 The numbers are right.** Check at least one current against
`I = (Vsupply − Vf) / R` by hand. A red LED at 5 V through 220 Ω is ≈13 mA.
Being lit is not the same as being correct.

**2.3 Nothing is shorted out.** For each two-pin part, its two pins must be in
different nets. `bbPart('R1').pins.map(p => p.net)` returning two identical
strings means the part does nothing.

**2.4 The rails are jumpered as intended.** If the supply is on the top rails and
loads return to the bottom `−` rail, a jumper must connect them. Its absence is
the single most common reason a breadboard sim stays dark.

**2.5 Open means open.** With every button released and every switch off, all
LED currents read 0 and every LED is drawn dark.

---

## 3. Animation and readout agree

**3.1 Dots appear only where current flows.** A wire with no current shows no
dots. A lit LED's supply wire shows dots.

**3.2 Dot speed tracks current.** Two branches carrying visibly different
currents must animate at visibly different speeds. If they look identical,
something is bypassing `bbSolve()`'s result.

**3.3 Direction matches the convention stated on screen.** Default is
conventional current, + to −, in orange. If `BB.electronFlow` is on, the dots run
− to + in blue **and the page says so** - an unlabelled reversal is worse than
either convention alone.

**3.4 The numeric readout matches the picture.** A brightly lit LED cannot read
0.0 mA. This catches a readout wired to the wrong label.

**3.5 Motion stops when paused.** With the sim paused, dots freeze and the scope
stops advancing. The default state on load is paused.

---

## 4. Scope panel

**4.1 Both axes are labelled with units.** Left axis in the first trace's color,
right axis in the second's. A current and a voltage sharing one unlabelled scale
is a correctness defect, not a cosmetic one.

**4.2 Tick values are clean.** Pick a `max` divisible by 4. `max: 30` yields a
22.5 tick, which is correct but ugly; `max: 20` or `40` reads better.

**4.3 The legend fits inside the panel.** Text must not spill past the panel
border. The library shortens entries automatically when it is tight - if it still
overflows, the panel is too narrow and the scope should be hidden at that width.

**4.4 Traces are visible against the gridlines** and distinguishable from each
other by color, not only by position.

**4.5 Reset clears the history.** The Reset button calls `bbClearTraces()`.

---

## 5. Responsive behavior

**5.1 At ~400 px width the board is still usable.** The scope should step aside
below ~640 px so the board gets the full width. Two panels do not fit on a phone.

**5.2 At wide widths nothing stretches oddly.** The board centers in its space
rather than distorting; sliders resize with the canvas.

**5.3 The readout strip does not clip.** Reduce text size at narrow widths rather
than letting the line run off the canvas.

---

## 6. Educational quality

**6.0 The student can operate something.** At least one interactive element -
an on-board switch or button, a slider, a dropdown, a checkbox, a hover target -
and operating it changes what the sim shows. This is a **blocking** check, not a
nice-to-have: MicroSims exist partly to emit xAPI interaction events into a
Learning Record Store, and those events are the evidence of concept mastery. A
sim with nothing to operate produces no evidence and cannot be assessed, however
good the picture is.

Also check that the interaction is *diagnostic*: operating the control should
require understanding the concept, not just clicking. A Start button alone does
not satisfy this - it controls the sim, not the circuit.

**6.1 One concept.** The board teaches one idea. Five parts and one control beats
fourteen parts and six.

**6.2 The default state demonstrates something.** On load, before any
interaction, the learner should see a circuit that makes sense - not a blank
board waiting for a click with no hint of what to click.

**6.3 The board says what to do.** A one-line instruction under the board
("Click a button on the board, or press 1, 2, 3") costs nothing and removes the
entire class of "I don't know what this is for."

**6.4 Values are decodable.** Resistor bands match the printed value, LED colors
match their forward voltages, polarity markings are visible. A student checking
the sim against a color chart should find it correct.

**6.5 Limitations are recorded.** `metadata.json` lists what the solver does not
model - transients, capacitance, AC, transistor gain. See
`circuit-simulation.md` for the list to copy.

---

## Writing up the review

```
Sim: button-led-breadboard
Iframe height: 602
Screenshots: wide (1280) and narrow (400)

FAILS:
  1.1 Board clipped - bottom power rails cut off below drawHeight.
      bbLayout() was called with a width only.
  3.4 Readout/picture mismatch - D2 is lit but reads 0.0 mA; the readout
      is reading label 'D3'.

PASSES: 1.2-1.5, 2.1-2.5, 3.1-3.3, 3.5, 4.1-4.5, 5.1-5.3, 6.1-6.5.
```

Fix, re-capture, re-walk. Stop after three cycles and report anything left
standing rather than over-tweaking.
