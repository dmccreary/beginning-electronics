# Content Generation Guide: Beginning Electronics

Guidance for generating student-facing content (chapters, lesson plans,
quizzes, FAQ, etc.) for the Beginning Electronics textbook. Instructor-facing
content (teacher's guide, instructor's guide) does not need to follow the
tone or mascot rules below.

## Tone and Theme

Every chapter, lesson, and mascot line should read as **fun, helpful,
optimistic, and encouraging** — never dry, dense, or intimidating. Write as
if you're cheering the reader on, not lecturing at them.

**Central theme: understanding electronics is your personal superpower.**
Frame new skills and concepts as abilities the student is unlocking, not
just facts to memorize. A few ways to work this in:

- Chapter openings can cast the chapter's topic as the next "power" the
  student is about to gain (e.g., "You're about to unlock the power to read
  any resistor's value at a glance.")
- Chapter closings/celebrations can name the specific superpower just earned
  ("You've now got X-ray vision for circuits!")
- Keep it occasional and earned, not on every page — a theme repeated too
  often stops feeling special. One superpower framing per chapter (usually
  the opening or the closing) is plenty.
- The superpower framing is about capability and confidence, not literal
  superhero costumes or comic-book styling — keep the visuals grounded in
  Volt's actual character design.

This tone applies to all prose, not just mascot admonitions — section
introductions, explanations, and transitions should also sound warm and
encouraging.

## Learning Mascot: Volt the Robot

### Mascot File Index

The canonical files for this mascot. When editing any of these, update the
others in the same turn so they stay in sync.

| File | Purpose |
|------|---------|
| [`docs/img/mascot/character-sheet.md`](docs/img/mascot/character-sheet.md) | Canonical identity document (name, species, colors, voice). Source of truth. |
| [`docs/img/mascot/image-prompts.md`](docs/img/mascot/image-prompts.md) | Self-contained AI prompts for regenerating each pose. |
| [`docs/img/mascot/neutral.png`](docs/img/mascot/neutral.png) | Default / general-purpose pose. |
| [`docs/img/mascot/welcome.png`](docs/img/mascot/welcome.png) | Chapter-opening pose. |
| [`docs/img/mascot/thinking.png`](docs/img/mascot/thinking.png) | Key-concept pose. |
| [`docs/img/mascot/tip.png`](docs/img/mascot/tip.png) | Hint / helpful-guidance pose. |
| [`docs/img/mascot/warning.png`](docs/img/mascot/warning.png) | Common-mistake / pitfall pose. |
| [`docs/img/mascot/encouraging.png`](docs/img/mascot/encouraging.png) | Difficult-content / struggle pose. |
| [`docs/img/mascot/celebration.png`](docs/img/mascot/celebration.png) | End-of-chapter / achievement pose. |
| [`docs/css/mascot.css`](docs/css/mascot.css) | Custom admonition styles for the seven pose contexts. |
| [`docs/learning-graph/mascot-test.md`](docs/learning-graph/mascot-test.md) | Rendering test page that exercises every admonition style. |

**Note:** the seven `.png` pose files listed above must be generated from the
prompts in `image-prompts.md` using an AI image tool, then trimmed with the
padding-trim script (see `docs/img/mascot/image-prompts.md`), before they
will render on the site.

### Character Overview

- **Name**: Volt
- **Species**: Small, compact robot
- **Personality**: Friendly, patient, encouraging, slightly goofy
- **Catchphrase**: "Let's light it up!"
- **Visual**: Rounded blue chassis (#2196F3), big round LED-style eyes that
  glow orange (#FF9800), a coiled spring antenna with a glowing orange bulb
  tip, a small tool belt with a mini screwdriver and wire clip

### Voice Characteristics

- Uses simple, direct language — explain jargon in plain language the moment it appears
- Fun, optimistic, and encouraging — Volt's default mood is delighted to be here
- Occasionally makes light electronics puns ("shocking," "short," "spark," "current")
- May tell a short joke when the moment fits (a chapter opening, a celebration,
  or right after a tricky idea clicks) — one clean, groan-worthy pun or
  one-liner is enough; don't stack more than one joke per admonition
- Frames new skills as a "superpower" the student is unlocking, especially in
  welcome and celebration admonitions — but sparingly (see Tone and Theme above)
- Refers to students as "builders" or "young engineers"
- Signature phrases: "Let's light it up!", "Current's flowing your way!",
  "Nice wiring, builder!", "That's your superpower in action!"

### Mascot Admonition Format

Always place mascot images in the admonition body, never in the title bar.
Image paths are relative to the **rendered page URL** (MkDocs uses directory
URLs), not the markdown file's own folder — count directories from the
rendered page to `docs/img/mascot/`. For a chapter page at
`chapters/NN-slug/index.md` (which renders at `chapters/NN-slug/`), use
`../../img/mascot/`.

```markdown
!!! mascot-welcome "Title Here"
    ![Volt waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Admonition text goes here after the image.
```

### Placement Rules

| Context | Admonition Type | Frequency |
|---------|----------------|-----------|
| General note / sidebar | `mascot-neutral` | As needed |
| Chapter opening | `mascot-welcome` | Every chapter |
| Key concept | `mascot-thinking` | 2-3 per chapter |
| Helpful tip | `mascot-tip` | As needed |
| Common mistake | `mascot-warning` | As needed |
| Difficult content | `mascot-encourage` | Where students may struggle |
| Section completion | `mascot-celebration` | End of major sections |

### Do's and Don'ts

**Do:**

- Use Volt to introduce new topics warmly
- Include the catchphrase ("Let's light it up!") in welcome admonitions
- Keep dialogue brief (1-3 sentences)
- Match the pose/image to the content type
- Let Volt crack a joke when it fits naturally — chapter openings and
  celebrations are the easiest spots

**Don't:**

- Use Volt more than 9 times per chapter
- Put mascot admonitions back-to-back
- Use the mascot for purely decorative purposes
- Change Volt's personality or speech patterns
- Force a joke or the superpower framing into every admonition — both land
  best when they're not constant
