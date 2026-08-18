# The Reference Lab Structure

This is the shape a full-credit lab has. Use it two ways: as the section
checklist when scoring, and as the source of copy-pasteable scaffolding when
recommending what to add.

Do not impose the exact headings on a lab that already works — a lab that calls
its troubleshooting section "When Things Go Wrong" loses nothing. What matters
is that the *content* is present and in a sensible order: understand the goal,
gather parts, see it simulated, build it in stages, understand why, fix it when
it breaks, prove you learned it.

## Section order and purpose

| Section | Purpose | Rubric dimension |
|---------|---------|------------------|
| Frontmatter | title, description, quality_score, status | 1 |
| Title + hook | what you're about to build and what it does | 1 |
| What You'll Learn | 3-5 observable objectives | 1 |
| Before You Start | prerequisite chapters/labs, time, difficulty | 1 |
| What You'll Need | parts table with quantity, value, identifying mark | 2 |
| Safety First | short circuits, polarity, power-off habit | 3 |
| Try It in the Simulator | MicroSim with animated current + a control | 7 |
| The Circuit Diagram | schematic with labeled values | 4 |
| The Breadboard Layout | same circuit in real tie points + mapping to schematic | 5 |
| Build It | numbered steps with staged checkpoints | 6 |
| How It Works | the why, with this circuit's numbers | 8 |
| When It Doesn't Work | symptom → cause → fix | 9 |
| Check Your Understanding | 5+ questions, answers collapsed | 10 |
| Take It Further | extension challenge with a success criterion | 11 |
| Learn More | 3+ resources with relevance notes, cross-links | 11 |

## Scaffolding

### Frontmatter

```yaml
---
title: "Your First LED Circuit"
description: "Light an LED on a breadboard with a current-limiting resistor, and learn why the resistor is what keeps it alive."
quality_score: 0
status: stub
---
```

`quality_score` and `status` are written by `evaluate_lab.py --set-score`, not
by hand — `status` drives the coloured marker Material shows beside the lab in
the nav, and deriving it from the score keeps the two honest.

### Objectives

```markdown
## What You'll Learn

By the end of this lab you will be able to:

- **Build** a working LED circuit on a breadboard from a schematic
- **Identify** an LED's anode and cathode without powering it up
- **Calculate** the current-limiting resistor for a 5V supply
- **Predict** what happens when the LED is inserted backwards, and test it
```

Observable verbs only. "Understand Ohm's Law" cannot be checked; "calculate the
resistor for a 5V supply" can.

### Parts table

```markdown
## What You'll Need

| Qty | Part | Value / marking | How to spot it |
|-----|------|-----------------|----------------|
| 1 | Breadboard | half-size, 400 tie points | the white plastic board |
| 1 | LED | red, 5mm | one leg longer than the other |
| 1 | Resistor | 220Ω (red-red-brown-gold) | tan body, four color bands |
| 2 | Jumper wires | 1 red, 1 black | |
| 1 | USB power supply | 5V | any phone charger |
```

Every row needs a quantity and something a student can match against a bag of
parts. Anything not in [kit-inventory.md](kit-inventory.md) needs a substitution
in the same table.

### MicroSim embed

```markdown
## Try It in the Simulator

<iframe src="../../sims/led-resistor-explorer/main.html" width="100%" height="502px" scrolling="no"></iframe>

Drag the resistor slider all the way down and watch the current arrows speed
up. That is exactly what happens to a real LED with no resistor — except a real
one only does it once.
```

The path is URL-relative because raw HTML is not rewritten by MkDocs: from
`docs/labs/NN-slug.md` (rendered at `/labs/NN-slug/`) it is `../../sims/...`.
Set the height to the sim's actual canvas height and keep `scrolling="no"`.

Place the simulator **before** the build when it lets students predict, and
after when it explains a result they just saw. Either is fine; having it in
neither place is not.

### Figures

```markdown
<figure markdown>
![Schematic of a 5V supply, 220 ohm resistor, and red LED in series](./led-circuit.png){ width="500" }
<figcaption>The complete LED circuit. R1 limits current to about 14 mA.</figcaption>
</figure>
```

Markdown image paths are source-relative — MkDocs rewrites them. Commit the
Schemdraw `.py` next to the `.png` so the figure can be regenerated.

### Build steps with checkpoints

```markdown
## Build It

1. **Leave the power unplugged.** Every wire goes in before any power does.
2. Push the LED's **long leg** into hole **e12** and the short leg into **e15**.
3. Bridge the resistor from **a12** to the **red (+) rail**.
4. Run a black jumper from **a15** to the **blue (-) rail**.

!!! mascot-tip "Checkpoint"
    ![Volt giving a tip](../img/mascot/tip.png){ class="mascot-admonition-img" }
    Before you plug anything in: is the long leg on the resistor's side? If not,
    swap the LED now — it is much easier than debugging later.

5. **Predict first:** how bright do you think it will be? Write it down.
6. Plug in the USB supply. The LED should light immediately.
```

Named holes (`e12`, not "the row with the LED"), one action per step, power
last, and a checkpoint before the moment where a mistake becomes invisible.

Mascot image paths in a flat lab file are `../img/mascot/…`; in a lab organized
as a directory (`labs/NN-slug/index.md`) they are `../../img/mascot/…`.

### Troubleshooting

```markdown
## When It Doesn't Work

Work down this list in order — check power before you check anything clever.

| What you see | Likely cause | Fix |
|--------------|--------------|-----|
| Nothing at all | No power reaching the rails | Check the USB supply and that both rail jumpers are seated |
| Still nothing | LED is backwards | Long leg toward the resistor and +5V |
| Still nothing | A leg is in the wrong row | Both LED legs must be in different 5-hole groups |
| Very dim | Resistor too large | 220Ω is right for 5V; 10kΩ will barely glow |
| Bright flash, then dark | No resistor in the path | The LED is gone — replace it, and check the resistor is in series |
```

### Quiz

```markdown
## Check Your Understanding

??? question "1. Which leg of an LED is the anode?"
    The **longer** leg. It connects toward the positive side of the circuit.
    (The flat notch on the plastic rim marks the cathode, which is useful once
    the legs have been trimmed.)

??? question "2. You have a 5V supply and a red LED that drops about 2V and wants 20 mA. What resistor do you need?"
    3V across the resistor ÷ 0.02 A = **150Ω**. There is no 150Ω in the kit, so
    use the next size up — 220Ω — which gives about 14 mA. Slightly dimmer,
    perfectly safe.

??? question "3. Your LED lit up for a moment and then went dark forever. What most likely happened?"
    It was wired with no current-limiting resistor. Nothing held the current
    back, so the LED drew far more than 20 mA and burned out.
```

Use `??? question` for the prompt and put the answer *with its reasoning* in the
body. `pymdownx.details` is enabled in `mkdocs.yml`, so these collapse by
default.

## Mascot placement in a lab

Per `CONTENT-GENERATION-GUIDE.md`: `mascot-welcome` at the top,
`mascot-warning` at the one place students most often break something,
`mascot-tip` at a checkpoint, `mascot-celebration` at the end. Four to six in a
lab is right; nine is the ceiling; back-to-back is a defect.

## Shipping a lab: nav, index card, thumbnail

A lab with a 95 on every content dimension still scores zero on
[Dimension 13](rubric.md#13-discoverability-and-presentation-3) if nobody can
find it. Three things, every time a lab is added or finished:

1. **`mkdocs.yml` nav** — add a line under `- Hands-on Labs:` pointing at the
   doc-relative path MkDocs actually renders (`labs/NN-slug/index.md` for a
   directory lab, `labs/NN-slug.md` for a flat one). `evaluate_lab.py` checks
   for this path as a plain substring of the file, so the path has to match
   exactly.

2. **A summary thumbnail** — the lab's own breadboard-layout render is
   usually the right choice, since it already exists, already lives in the
   lab's own directory, and already shows what the lab builds. A real
   screenshot of the rendered page is also fine when one is available. What
   does not count: a generic shared icon with no connection to this specific
   lab.

3. **A card on `docs/labs/index.md`** — in the same `grid cards` format
   `docs/sims/index.md` uses:

   ```markdown
   -   **[Lab Title](./NN-slug/index.md)**

       ![Lab Title](./NN-slug/breadboard-layout.png)

       One sentence describing what the student builds and the concept it
       teaches — not marketing copy, just what's true about the page.
   ```

   Keep entries sorted the same way the nav is ordered, so the index page and
   the sidebar agree with each other.

## Which skill fills which gap

| Missing content | Skill to invoke |
|-----------------|-----------------|
| Circuit diagram | `draw-schemdraw-circuit` (in this repo) |
| Breadboard image or current-flow MicroSim | `breadboard-sim-generator` (in this repo) |
| Any other MicroSim | `microsim-generator` |
| Review quiz | `quiz-generator` |
| Additional resources | `reference-generator` |
| Prose, objectives, explanation | write it directly, following `CONTENT-GENERATION-GUIDE.md` |

Before generating a new MicroSim, search the 3,200+ existing ones in
`/Users/dan/Documents/ws/search-microsims/docs/search/microsim-data.json` for
"Electronics" and "Electric Circuits" — reusing one is faster and keeps the
book consistent.
