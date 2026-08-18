# Hands-On Lab Quality Rubric

103 points across 13 dimensions. Score every criterion, then sum, then apply
the caps at the bottom. Round to a whole number.

The weights are not arbitrary. A hands-on lab fails in a specific way: a
student sits down with a bag of parts and gets stuck. So the dimensions that
prevent getting stuck — the build procedure, the two pictures (schematic and
breadboard), and the simulation the student can run before touching a wire —
carry 48 of the 103 points. Prose quality matters, but a beautifully written
lab that a 13-year-old cannot physically build is worth less than a plain one
they can.

## Contents

| # | Dimension | Points |
|---|-----------|--------|
| 1 | [Framing and Objectives](#1-framing-and-objectives-8) | 8 |
| 2 | [Bill of Materials](#2-bill-of-materials-9) | 9 |
| 3 | [Safety](#3-safety-5) | 5 |
| 4 | [Circuit Diagram](#4-circuit-diagram-11) | 11 |
| 5 | [Breadboard Layout](#5-breadboard-layout-11) | 11 |
| 6 | [Build Procedure](#6-build-procedure-14) | 14 |
| 7 | [MicroSim with Current Animation](#7-microsim-with-current-animation-12) | 12 |
| 8 | [Concept Explanation and Math](#8-concept-explanation-and-math-7) | 7 |
| 9 | [Troubleshooting](#9-troubleshooting-6) | 6 |
| 10 | [Review Quiz](#10-review-quiz-8) | 8 |
| 11 | [Extensions and Additional Resources](#11-extensions-and-additional-resources-4) | 4 |
| 12 | [Voice, Reading Level, Accessibility](#12-voice-reading-level-accessibility-5) | 5 |
| 13 | [Discoverability and Presentation](#13-discoverability-and-presentation-3) | 3 |

**Scoring each criterion:** award full points when it is genuinely done, half
when it exists but is too thin to work for an 8th grader on their own, zero
when absent. Half-credit is for "present but inadequate," not for "I'm not
sure." When you cannot tell, read the lab again rather than splitting the
difference.

---

## 1. Framing and Objectives (8)

An 8th grader should know, before reading step 1, what they are about to build
and why it is worth 45 minutes of their life.

| # | Criterion | Pts |
|---|-----------|-----|
| 1.1 | YAML frontmatter with `title` and a one-sentence `description` (plus `quality_score` once evaluated) | 2 |
| 1.2 | 3-5 learning objectives using observable verbs — build, measure, predict, compare, explain — not "understand" or "be familiar with" | 3 |
| 1.3 | Prerequisites named as specific prior chapters or labs, plus a time estimate and difficulty | 2 |
| 1.4 | An opening hook that says in one sentence what the finished circuit *does* ("your LED turns itself on when the room gets dark") | 1 |

Why observable verbs: they are what the quiz at the end has to assess. If an
objective cannot be turned into a quiz question, it was not an objective.

## 2. Bill of Materials (9)

| # | Criterion | Pts |
|---|-----------|-----|
| 2.1 | Every part listed with quantity, value, and an identifying mark a student can match to the bag (color bands, body marking, lead length) | 3 |
| 2.2 | Every required part is in the $50 kit, or an in-kit substitution is stated in the list itself — see [kit-inventory.md](kit-inventory.md) | 3 |
| 2.3 | The list and the procedure agree exactly: nothing listed goes unused, nothing used is missing from the list | 2 |
| 2.4 | Parsimony — no part could be removed without losing a stated objective | 1 |

Criterion 2.3 is the one authors miss most, because materials lists get written
first and the procedure drifts. Check it by walking the steps and ticking parts
off the list.

## 3. Safety (5)

| # | Criterion | Pts |
|---|-----------|-----|
| 3.1 | Power off before rewiring, and what a short circuit is and why it matters | 2 |
| 3.2 | The hazards specific to *these* parts — LED without a current-limiting resistor, electrolytic capacitor polarity, a motor's inrush current, a regulator that gets hot | 2 |
| 3.3 | Proportionate: says plainly that 5V on a breadboard cannot hurt them, so the warnings that remain are believed | 1 |

Over-warning is a real defect. If everything is dangerous, nothing is, and
students stop reading the boxes.

## 4. Circuit Diagram (11)

| # | Criterion | Pts |
|---|-----------|-----|
| 4.1 | A schematic image exists, is referenced correctly, and renders | 3 |
| 4.2 | Standard symbols; every component labeled with its value and a reference designator (R1, D1, Q1) | 3 |
| 4.3 | Power and ground explicit, and the current path traceable from + to - without guessing | 2 |
| 4.4 | The regenerable source is committed beside the image — a Schemdraw `.py` next to the `.png`, per the `draw-schemdraw-circuit` skill | 2 |
| 4.5 | Figure caption and alt text that name the circuit | 1 |

Criterion 4.4 exists because an image with no source is a dead end: the next
person who needs to fix a label has to redraw the whole schematic.

## 5. Breadboard Layout (11)

The schematic teaches the idea; the breadboard picture is what the student
actually copies. A lab with only one of the two is half a lab.

| # | Criterion | Pts |
|---|-----------|-----|
| 5.1 | An image of this same circuit built on a breadboard (photo or rendered layout) | 3 |
| 5.2 | Placement is readable down to the hole — row and column callouts, or a picture at high enough resolution to count tie points | 3 |
| 5.3 | Wire color convention followed (red = +, black = ground) and consistent with what the text says | 2 |
| 5.4 | The schematic-to-breadboard correspondence is stated, not left implied ("R1 in the schematic is the resistor bridging rows 12 and 17") | 2 |
| 5.5 | Figure caption and alt text | 1 |

Criterion 5.4 is where beginners are actually lost. They can read a schematic
and they can see a photo; what they cannot do yet is map one onto the other.

## 6. Build Procedure (14)

| # | Criterion | Pts |
|---|-----------|-----|
| 6.1 | Numbered steps, one physical action per step, written as imperatives | 3 |
| 6.2 | Power is connected last and disconnected first, and the steps enforce that order | 2 |
| 6.3 | Each wiring step names the exact holes or rows, not just "connect the resistor to the LED" | 3 |
| 6.4 | Checkpoints with the expected observation after each stage ("the LED should be off — if it is already on, stop and check the transistor's flat side") | 3 |
| 6.5 | At least one predict-then-observe moment before a reveal | 2 |
| 6.6 | A stated success criterion: how the student knows they are done | 1 |

Criterion 6.4 is the highest-value thing in the whole rubric. Staged
checkpoints turn one big failure ("nothing works") into a series of small,
locatable ones, which is the difference between a student debugging and a
student giving up. A lab that builds the entire circuit and only then says
"apply power" should lose these points even if every other step is perfect.

## 7. MicroSim with Current Animation (12)

| # | Criterion | Pts |
|---|-----------|-----|
| 7.1 | At least one MicroSim embedded with a working iframe, an explicit height, and `scrolling="no"` | 3 |
| 7.2 | Current movement is animated, so the student sees *where* charge flows and where it does not | 3 |
| 7.3 | A student-driven control — a p5.js `createSlider`/`createButton`/`createCheckbox`/`createSelect` — so the student causes the change rather than watching a loop | 3 |
| 7.4 | The sim shows *this* lab's circuit, with the same parts and values as the breadboard build | 2 |
| 7.5 | "Try this in the simulator" prompts that connect a sim action to something they will do with real parts | 1 |

Criterion 7.3 is a project-wide rule, not a preference: an animation with no
control produces no evidence that any learning happened. A sim the student
operates produces interaction events that show what they explored.

Generate missing sims with the **`breadboard-sim-generator`** skill in this
repo — it draws components in real tie points and animates current along the
jumper wires, which is exactly what 7.2 and 7.4 ask for.

Embed path convention: raw HTML is resolved against the rendered page URL, so
from `docs/labs/NN-slug.md` (which renders at `/labs/NN-slug/`) the path is
`../../sims/<sim-name>/main.html`.

## 8. Concept Explanation and Math (7)

| # | Criterion | Pts |
|---|-----------|-----|
| 8.1 | Explains *why* the circuit behaves as it does in language an 8th grader uses, tied to what they just watched happen | 3 |
| 8.2 | The math is worked with this circuit's real numbers (5V, 2V across the LED, 20mA → 150Ω, use 220Ω) — not a formula in the abstract | 2 |
| 8.3 | Connects to a model or analogy already established in an earlier chapter | 1 |
| 8.4 | One concrete "where you have seen this" from the student's own world | 1 |

## 9. Troubleshooting (6)

| # | Criterion | Pts |
|---|-----------|-----|
| 9.1 | A symptom → likely cause → fix table | 2 |
| 9.2 | Covers at least four failures that are actually likely *for this circuit* — LED in backwards, wire in the wrong row, transistor pins swapped, power rail not bridged, missing ground | 3 |
| 9.3 | Teaches a method as well as a lookup: check power first, then continuity, then polarity, then one change at a time | 1 |

## 10. Review Quiz (8)

| # | Criterion | Pts |
|---|-----------|-----|
| 10.1 | At least 5 questions | 2 |
| 10.2 | Answers hidden behind collapsible blocks (`??? question` / `??? tip "Answer"`), so students think before they peek | 1 |
| 10.3 | Bloom spread: at least one recall, at least two apply/predict, at least one analyze ("the LED stays dark — which of these would explain it?") | 3 |
| 10.4 | Wrong answers are real misconceptions students hold, not filler | 1 |
| 10.5 | Every stated objective is assessed by at least one question | 1 |

A quiz that only asks recall grades whether the student read the page. The
apply and analyze questions are what grade whether they can build and debug —
which is what the lab was for.

## 11. Extensions and Additional Resources (4)

| # | Criterion | Pts |
|---|-----------|-----|
| 11.1 | At least one extension challenge with its own success criterion ("make it turn on in *bright* light instead") | 2 |
| 11.2 | At least three additional resources, each with a one-line note on why it is worth clicking, all links resolving | 1 |
| 11.3 | Cross-links to the chapter that teaches the theory and to related labs and sims | 1 |

## 12. Voice, Reading Level, Accessibility (5)

| # | Criterion | Pts |
|---|-----------|-----|
| 12.1 | Flesch-Kincaid grade ≤ 9.0 and few sentences over 25 words | 2 |
| 12.2 | Volt used per `CONTENT-GENERATION-GUIDE.md`: a welcome, at least one tip or warning at a real pitfall, a celebration at the end; at most 9 total; never back-to-back | 1 |
| 12.3 | Every piece of jargon defined the first time it appears | 1 |
| 12.4 | Alt text on every image, no meaning carried by color alone, tables used for data rather than layout | 1 |

Reading level is measured on prose only — `evaluate_lab.py` strips code,
tables, and HTML before measuring, because part numbers and code fences distort
the count.

## 13. Discoverability and Presentation (3)

A finished lab that nobody can find or preview is not finished. These three
points are the difference between a page that exists and a page a teacher or
student actually lands on.

| # | Criterion | Pts |
|---|-----------|-----|
| 13.1 | The lab is linked from `mkdocs.yml`'s `Hands-on Labs` nav, at the path MkDocs actually renders it at | 1 |
| 13.2 | The lab has a summary image suitable as a standalone thumbnail — typically its breadboard-layout render, or a real screenshot of the finished page — distinct from being merely present somewhere in the body | 1 |
| 13.3 | `docs/labs/index.md` has a card for this lab: title, the same thumbnail image, and a one-line description, in the same `grid cards` format the rest of the book's index pages use (see `docs/sims/index.md`) | 1 |

Score 13.1 and 13.3 by checking the actual files, not by trusting a claim in
the lab's own text. A lab can be excellent on every other dimension and still
be invisible to a student browsing the book if it never made it into the nav
or the labs index.

---

## Caps

Apply after summing. The final score is the lower of the sum and every cap that
applies. Caps exist because some defects are not "missing points" — they make
the lab unusable in a classroom, and a 90 next to a broken image tells the
reader the score cannot be trusted.

| Condition | Cap |
|-----------|-----|
| No numbered build procedure at all | 40 |
| Missing either the circuit diagram or the breadboard image | 70 |
| A required part is out-of-kit with no substitution offered | 75 |
| No MicroSim embedded | 80 |
| Any broken image, iframe, or internal link | 85 |
| No review quiz | 85 |
| Flesch-Kincaid grade above 11 | 85 |

## Bands and status markers

Each band maps to a `status:` value in the page frontmatter. MkDocs Material
renders it as a coloured marker beside the lab in the nav, so the whole book's
readiness is visible at a glance without opening anything. The keys are defined
under `extra.status` in `mkdocs.yml` and styled in `docs/css/extra.css`.

| Score | `status:` | Marker | Meaning |
|-------|-----------|--------|---------|
| 90-103 | `complete` | green check | Publish-ready. A teacher can hand it to students without preparation. |
| 80-89 | `almost-complete` | blue dot | Classroom-ready with minor gaps a teacher can absorb. |
| 65-79 | `in-progress` | amber dot | Teachable but incomplete — the teacher must supply something essential. |
| 40-64 | `early-stage` | red dot | Draft. Real content, but a student working alone would get stuck. |
| 0-39 | `stub` | grey ring | Stub. Links and images with no lab around them. |

`evaluate_lab.py --set-score N` derives the status from the score and writes
both, so the two cannot drift apart. Only override it (`--status`) when the
score genuinely misrepresents the page — and say why in the evaluation report.

Most labs in this book start in the 0-39 band, so scores there are a normal,
useful result, not a judgment on the author. The score's job is to rank what to
fix first.
