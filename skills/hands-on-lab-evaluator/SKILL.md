---
name: hands-on-lab-evaluator
description: Scores a hands-on electronics lab against a 103-point rubric for 8th grade readers and $50-kit buildability, writes the score into the page frontmatter, records every gap as a work item in docs/labs/TODO.md, and names the skill that generates each missing piece. Use this skill whenever the user asks to evaluate, grade, score, review, audit, rate, or improve a lab, lesson, or hands-on activity - and also when they ask "is this lab complete?", "what's missing from this lab?", "which labs need work?", "are these labs good enough for students?", or want a quality_score written into a lab's frontmatter. Use it before publishing a new lab and before generating content for an existing one, so the gaps are known first.
model: opus
---

# Hands-On Lab Evaluator

## Overview

A hands-on lab in this book succeeds or fails on one question: can a 13-year-old
sit down with a $50 parts kit, follow the page alone, build the circuit, and
know why it works? This skill measures how close a lab is to that, produces a
`quality_score` from 0-103, and turns every lost point into a specific piece of
content someone can go write.

The score is a means, not the product. The valuable output is the ranked list of
what to add — because "this lab is a 34" helps nobody, while "no breadboard
image, no checkpoints in the build steps, and the 470Ω resistor isn't in the
kit" is a work order.

## When to Use This Skill

Reach for it when evaluating one lab, comparing all the labs in `docs/labs/` to
decide what to fix first, or checking a lab you just wrote before publishing.
Also use it as the *first* step when someone asks to improve or finish a lab —
the gap list tells you what to generate and in what order.

This skill judges labs. For chapters, quizzes, or MicroSims in isolation, other
skills apply; a MicroSim's own quality is checked by
`microsim-utils`, and this skill only asks whether the lab embeds one that
animates current and gives the student a control.

---

## Step 0: Locate the lab and the project

```bash
PROJECT=$(python3 -c "
import os, sys
d = os.path.abspath('.')
while d != os.path.dirname(d):
    if os.path.isfile(os.path.join(d, 'mkdocs.yml')): print(d); sys.exit()
    d = os.path.dirname(d)
print('ERROR: mkdocs.yml not found', file=sys.stderr); sys.exit(1)
")

SKILL="$PROJECT/skills/hands-on-lab-evaluator"
```

Labs live in `$PROJECT/docs/labs/`, either as flat files (`NN-slug.md`) or as
directories holding `index.md`. Both are supported everywhere in this skill.

## Step 1: Run the signal collector

```bash
python3 "$SKILL/scripts/evaluate_lab.py" docs/labs/10-led-circuit.md
```

This does the mechanical checking so your reading can stay on substance. It
resolves every image, iframe, and internal link the way MkDocs actually
resolves them (markdown paths source-relative, raw HTML paths URL-relative —
mixing those up is the most common broken-asset bug here), inspects each
embedded MicroSim for p5 controls and current-flow animation, measures
Flesch-Kincaid grade on prose alone, counts build steps, checkpoints, quiz
questions and troubleshooting rows, and flags materials that are not in the
$50 kit.

Add `--json` when you want the raw structure to work from.

## Step 2: Read the lab yourself

The script cannot tell you whether an explanation explains. Read the whole page
with one question in mind at each section: *would a 13-year-old get stuck
here?* Pay particular attention to the things no regex catches:

- Do the build steps name actual holes, or do they say "connect the resistor to
  the LED" and leave the student guessing which row?
- Does the schematic match the breadboard picture, and does the text say which
  part in one is which part in the other?
- Do the quiz's wrong answers name misconceptions students actually hold?
- Is every part in the list used, and every part used in the list?
- Does the lab explain the concept, or only the procedure? A student who
  follows 12 steps and lights an LED has not necessarily learned anything.

## Step 3: Score against the rubric

Read `references/rubric.md` and score all 12 dimensions criterion by criterion.
Full points when it is genuinely done, half when present but too thin for an
8th grader working alone, zero when absent. Sum, then apply the caps — a lab
with a broken image cannot score above 85 no matter how good the prose is,
because a reader who hits the broken image stops trusting the page.

Keep the scoring honest. These labs are mostly stubs today; scores in the teens
are the correct answer for a page that is three links and a picture, and
inflating them wastes the ranking that makes this skill useful. State the score
plainly and move to what would raise it.

## Step 4: Write the evaluation report

Use this structure exactly — the consistency is what makes scores comparable
across labs and across time:

```markdown
# Lab Evaluation: <Lab Title>

**File:** docs/labs/<file>
**Score:** <N>/103 — <band name>
**Caps applied:** <which, or "none">

## Scores by dimension

| # | Dimension | Score | Notes |
|---|-----------|-------|-------|
| 1 | Framing and Objectives | 3/8 | Title only; no objectives |
| ... | | | |
| | **Total** | **N/103** | |

## What works

<2-4 bullets. Real strengths only — if the lab is a stub, say so instead of
inventing praise. An author who gets false credit for a missing section will
not go write it.>

## What's missing, highest impact first

### 1. <Gap> (+<points> available)
**Why it matters:** <what happens to a student without it>
**What to add:** <the specific content, concrete enough to act on>
**How to make it:** <skill to invoke, or "write directly">

### 2. ...

## Fastest path to <next band>

<The 2-4 fixes that move the most points for the least work, with the
projected score if they are done.>
```

Order the gaps by points available, not by where they appear on the page. A
missing build procedure and a missing figure caption are not the same problem,
and the report should not make them look alike.

## Step 5: Write the score and status into the frontmatter

```bash
python3 "$SKILL/scripts/evaluate_lab.py" docs/labs/10-led-circuit.md --set-score 34
```

This writes two keys into the lab page's YAML frontmatter, creating the
frontmatter block if the page has none and updating the values in place if it
already has them. For a lab organized as a directory, it writes into that lab's
`index.md`, which is the page MkDocs renders.

```yaml
quality_score: 34
status: early-stage
```

`status` is derived from the score, so the two cannot drift apart:

| Score | `status:` | Marker in the nav |
|-------|-----------|-------------------|
| 90-103 | `complete` | green check |
| 80-89 | `almost-complete` | blue dot |
| 65-79 | `in-progress` | amber dot |
| 40-64 | `early-stage` | red dot |
| 0-39 | `stub` | grey ring |

MkDocs Material renders that marker beside the lab in the nav — the keys are
declared under `extra.status` in `mkdocs.yml` and styled in
`docs/css/extra.css`. The effect is that the whole book's readiness is legible
from the sidebar without opening a single page, which is what makes the sweep
in the next section worth running across every lab.

Both keys live in the page rather than a side file so they travel with the
content and show up in a diff when a lab improves — a rise from 34 to 78, and a
red dot turning amber, is a visible and reviewable claim in a pull request.

`--status` overrides the derived value. Use it only when the score genuinely
misrepresents the page, and say why in the report.

## Step 5b: Ship it — nav, thumbnail, index card

Dimension 13 is easy to forget because it lives outside the lab page itself.
Before calling a lab done, confirm all three, following
`references/lab-template.md`'s "Shipping a lab" section:

1. A line for this lab under `- Hands-on Labs:` in `mkdocs.yml`, pointing at
   the exact doc-relative path MkDocs renders.
2. A summary thumbnail the lab already owns — usually its breadboard-layout
   image, or a real screenshot of the rendered page.
3. A card for it on `docs/labs/index.md`, in the same `grid cards` format
   `docs/sims/index.md` uses — title, that same thumbnail, one factual
   sentence.

`evaluate_lab.py`'s report includes a "Discoverability" section that checks
all three automatically; a lab that is otherwise a 95 but missing all of them
caps out at 92.

## Step 6: Record the gaps in `docs/labs/TODO.md`

Whenever a lab has gaps, they go into the shared work queue at
`docs/labs/TODO.md`. A report in a chat window disappears when the window
closes; a checkbox list in the repo survives, shows up in a diff, and can be
picked up by whoever has an hour free.

Write the gap list to a temporary file as markdown checkboxes, then merge it:

```bash
cat > /tmp/gaps.md <<'EOF'
- [ ] **Build procedure** (+14) — no numbered steps at all; a student has no
  path from a bag of parts to a lit LED.
  - How: write directly, following `references/lab-template.md`
- [ ] **MicroSim with current animation** (+12) — links to two sims but embeds
  neither, so nothing shows current moving.
  - How: `breadboard-sim-generator`
EOF

python3 "$SKILL/scripts/update_todo.py" docs/labs/10-led-circuit.md \
    --score 7 --band Stub --gaps /tmp/gaps.md
```

Each item needs the bold gap name, the points it is worth, one line on what is
actually wrong, and a `- How:` line naming the skill or the writing job. Order
them highest-points-first — that ordering is the whole value of the file.

The script owns the merge so that evaluating labs one at a time does not
clobber the file: each lab gets its own section keyed by filename, sections are
sorted worst-score-first, the summary table is rebuilt, and any item a human
has already ticked stays ticked on the next run. When every item for a lab is
checked, that lab's section is removed automatically.

```bash
python3 "$SKILL/scripts/update_todo.py" --list                     # current queue
python3 "$SKILL/scripts/update_todo.py" docs/labs/10-led-circuit.md --clear
```

`docs/labs/TODO.md` is listed in `exclude_docs` in `mkdocs.yml`, so it stays out
of the built site — it is an author's work file, not a student page. If a lab
has no gaps, do not create or touch the file.

## Step 7: Ask before filling the gaps — then stop

Show the score, the top gaps, and the path to `docs/labs/TODO.md`, then **ask
whether to proceed** and wait for the answer. Do not start generating.

This is a real decision, not a formality: closing the gaps on one stub lab
means new schematics, a breadboard sim, a quiz, and several hundred words of
prose. The user may want only the top item, or a different lab first, or just
the queue for later. Ask something specific enough to act on — "Want me to
start with the build procedure and the MicroSim for this lab, do all four
items, or leave the TODO for later?" — rather than a bare "shall I proceed?".

| Missing content | Skill |
|-----------------|-------|
| Circuit diagram | `draw-schemdraw-circuit` |
| Breadboard image, current-flow MicroSim | `breadboard-sim-generator` |
| Other MicroSims | `microsim-generator` |
| Review quiz | `quiz-generator` |
| Additional resources | `reference-generator` |

When the user does say go, work highest-impact-first from the TODO, tick items
off as they land, then re-run Steps 1-6 so `quality_score` and the queue both
reflect the new state. Search the existing 3,200+ MicroSims in
`/Users/dan/Documents/ws/search-microsims/docs/search/microsim-data.json`
before generating a new one.

---

## Evaluating every lab at once

When the question is "which labs need work," run the collector across the
directory and score from the signals plus a skim, rather than a deep read of
each:

```bash
for f in docs/labs/*.md; do
  echo "=== $f ==="
  python3 "$SKILL/scripts/evaluate_lab.py" "$f"
done
```

Report a ranked table — file, score, band, and the single biggest gap — sorted
by score ascending, so the worst labs are at the top where the work is. Then
recommend an order to fix them in. That order is usually not the score order:
a lab early in the course sequence blocks more students than a late one with
the same score, and labs whose chapter is already written are cheaper to
finish.

Write `quality_score` into each lab's frontmatter as you go, and merge each
lab's gaps into `docs/labs/TODO.md` with `update_todo.py`, so the next run
starts from a known baseline. After a full sweep, `docs/labs/TODO.md` is the
book's lab backlog in priority order — that file, not the chat transcript, is
the deliverable. Then ask which lab to start on rather than starting on one.

## Scripts

- `scripts/evaluate_lab.py` — collects the objective signals (Step 1) and
  writes `quality_score` into the page frontmatter (`--set-score`, Step 5).
- `scripts/update_todo.py` — merges one lab's gap list into
  `docs/labs/TODO.md` without disturbing other labs' sections or a human's
  checkmarks (Step 6). `--list` prints the queue; `--clear` drops a lab.

## Reference files

- `references/rubric.md` — the 103-point rubric, all 13 dimensions, caps, and
  score bands. Read it every time you score; do not score from memory.
- `references/kit-inventory.md` — what is and is not in the $50 kit, plus
  substitution rules. The script parses this file, so edit it (not the script)
  when the kit changes.
- `references/lab-template.md` — the reference lab structure and
  copy-pasteable scaffolding for each section. Use it when recommending or
  writing missing content.

## Things worth getting right

**Half credit is for "thin," not for "unsure."** If you cannot tell whether a
criterion is met, read the lab again. Splitting the difference on everything
produces a meaningless 50 for every lab.

**Score the lab in front of you, not the lab you would write.** A lab that
teaches its concept with three parts and no photos of a multimeter is not
missing a multimeter section — it is being appropriately parsimonious, which
the rubric rewards. Only call something missing if a student would be stuck
without it.

**Every gap needs a fix a person can act on.** "Improve the explanation" is not
a recommendation. "Explain why the 220Ω resistor comes from (5V − 2V) ÷ 20mA,
using the numbers already in the parts table" is.
