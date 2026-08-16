# Image Generation Queue — START HERE

**You are an image-generation agent.** This directory is a work queue of
images the *Beginning Electronics* textbook needs. This file is your
complete contract: read it, pick a task, make the image, drop the file.

Repository root: `/Users/dan/Documents/ws/beginning-electronics`
All paths below are relative to that root.

---

## Windows

`igq` does not run natively on Windows — it exits immediately with
instructions rather than half-working. Install **Windows Subsystem for
Linux**, then clone the repo and run everything from the WSL shell:

```
wsl --install
```

Run that in PowerShell as Administrator, restart when prompted, and work
from the Linux shell it installs. The entire queue behaves normally under
WSL, including `igq watch`.

macOS and Linux run it directly, no setup.

## The one rule

> **Save your finished image to `image-tasks/inbox/<task-id>.png`**

That is the entire delivery protocol. The filename *is* the message.
Nothing else is required — no forms, no JSON, no commit, no API call.
A watcher validates the file, records a receipt, and notifies Claude Code
automatically the moment it appears.

If you can only produce an image and save a file, you can participate.

---

## Workflow

### 1. See what needs making

```bash
image-tasks/bin/igq list
```

```
PRI STATUS     ID                                TITLE
----------------------------------------------------------------------
1   open       rgb-led-breadboard-circuit        RGB LED breadboard wiring diagram
2   open       led-resistor-calc-circuit         LED + current-limiting resistor schematic
```

Or just read [`QUEUE.md`](QUEUE.md), or browse [`tasks/`](tasks/) — each
task is one self-contained markdown file.

### 2. Claim it (optional but polite)

```bash
image-tasks/bin/igq claim rgb-led-breadboard-circuit --agent antigravity
```

This stops a second agent from duplicating your work. Skip it if you
can't run shell commands — claiming is a courtesy, not a gate.

### 3. Get the prompt

```bash
image-tasks/bin/igq brief rgb-led-breadboard-circuit
```

This prints a single self-contained block containing the prompt text
**and** the hard output requirements (exact dimensions, format,
transparency, the no-text rule). Paste the whole thing into your image
tool. On macOS, `--copy` puts it straight on the clipboard:

```bash
image-tasks/bin/igq brief rgb-led-breadboard-circuit --copy
```

### 4. Generate the image

Follow the brief exactly. See **House rules** below — the two that get
images rejected most often are *text leaking into the image* and *fake
transparency*.

### 5. Deliver

Save the file as `image-tasks/inbox/<task-id>.png`. Either drag it there,
or:

```bash
image-tasks/bin/igq deliver rgb-led-breadboard-circuit ~/Downloads/whatever.png
```

`deliver` copies the file under the right name and immediately runs the
checks, so you see pass/fail right away and can retry before handing off.

That's it. You're done. Claude takes it from there.

---

## House rules

These apply to every task unless its brief says otherwise.

**No text in the image. Ever.** No letters, numbers, labels, titles,
arrows, callout lines, legends, watermarks, or logos. Most of these
images are backgrounds for an *interactive overlay* — the textbook draws
the labels itself in HTML, on top of your image. Baked-in text collides
with the overlay and makes the image unusable. This is the single most
common reason work gets rejected, and no automated check can catch it —
look at your own output before delivering.

**Real transparency means a real alpha channel.** When a brief says
transparent background, it must be an RGBA PNG whose background pixels
have alpha 0. A white background, a black background, or a drawn
checkerboard pattern all fail. Many image tools silently flatten;
verify before delivering.

**House visual style.** Flat vector illustration, clean bold outlines,
bold flat color fills, soft gradients only for glow effects. Warm,
rounded, approachable — a well-lit maker bench, not a datasheet.
Accurate components, friendly shapes.

**Palette.** Material blue `#2196F3` dominant, warm orange `#FF9800`
accent/glow, deep navy `#0D1B2A`–`#12263A` backgrounds where a background
is wanted. Use true component colors where accuracy demands it (beige
resistor bodies, black IC packages, red/blue breadboard rails,
multi-colored jumper wires).

**Never show.** Microcontrollers, Arduino, Raspberry Pi, laptops, code
editors, or source code — this course contains no programming and no
microcontrollers, so showing them misrepresents the book. Also never show
soldering irons, solder, smoke, sparks, or mains/wall wiring — it is a
no-soldering, low-voltage-only course and those contradict its safety
message.

**Volt, the mascot.** A small chibi robot: rounded blue chassis
(`#2196F3`), stubby rounded limbs, no sharp edges, big round LED-style
eyes glowing warm orange (`#FF9800`), simple closed-mouth smile on a
light-gray faceplate, coiled silver spring antenna with a glowing orange
bulb tip, brown tool belt with a mini orange-handled screwdriver and wire
clip, round glowing orange emitter on the chest. The canonical
definition is [`docs/img/mascot/character-sheet.md`](../docs/img/mascot/character-sheet.md)
and the per-pose prompts are in
[`docs/img/mascot/image-prompts.md`](../docs/img/mascot/image-prompts.md).
Do not redesign Volt.

**Audience.** Students in grades 5–12 building real circuits on a
solderless breadboard. Bright, playful, confidently technical. The image
should read as an invitation.

---

## What happens after you deliver

1. The file lands in `inbox/`.
2. `igq scan` validates it — format, exact dimensions, aspect ratio,
   alpha channel, transparent corners, trim border, file size.
3. A receipt is written to `receipts/<task-id>.json` with every check.
4. A line is appended to [`NOTIFY.md`](NOTIFY.md) and a macOS notification
   fires.
5. Claude reviews the things a machine cannot judge — mainly *is there
   text in this image* and *does it actually depict the right thing* —
   then runs `igq accept`, which compresses the PNG and installs it at
   the task's declared `output:` path in the repo.
6. If it's wrong, `igq reject <id> --reason "..."` puts the task back in
   the queue with your feedback appended to the task file, so the next
   attempt knows what went wrong.

You will never be blocked waiting for this. Deliver and move on.

---

## Notifying Claude — how the signal actually travels

Three channels, all triggered by the same file drop. Pick whichever
matches how Claude is running.

**A. Claude is live in a session (zero setup).** Claude watches the inbox
itself using its Monitor tool and is notified in-conversation the instant
a file appears. Nothing for you to do.

**B. Claude is not running — leave a watcher going.** In any terminal:

```bash
image-tasks/bin/igq watch
```

It polls every 3 seconds, validates arrivals, appends to `NOTIFY.md`, and
raises a macOS banner. Add `--wake` to *also* launch a headless Claude
that reviews and installs the images without a human present. `--wake`
spends tokens autonomously, so it is off by default.

**C. Nothing is running.** The file still sits in `inbox/`. Next time
Claude starts, `igq status` shows exactly what's waiting. Nothing is ever
lost — the queue is just files on disk.

---

## Working across two computers

The queue is designed to travel through git, so you can start a task on one
machine and pick it up on another.

**Tracked (travels with the repo):** `tasks/` — including each task's
`status`, `claimed_by`, and rejection `feedback` — plus `receipts/`,
`QUEUE.md`, `README.md`, and `bin/igq`. Accepted images travel too, because
`igq accept` installs them into `docs/`, which is tracked.

**Not tracked (stays local):** `inbox/`, `archive/`, and `NOTIFY.md`. These
are transient — unreviewed binaries and rollback copies don't belong in the
repo's history.

The ritual is just git:

```bash
git pull                        # pick up tasks and claims from the other machine
image-tasks/bin/igq status      # see what's open, claimed, or waiting
# ... do work ...
git add image-tasks docs && git commit -m "images: ..." && git push
```

`igq status` knows about the split and warns you about the two states it
creates:

- **Claimed on another machine.** Each claim records its hostname, so a task
  claimed on your Mac Studio shows as such when you're on the MacBook.
  `igq claim <id> --agent NAME --force` takes it over.
- **Delivered elsewhere.** Because `inbox/` is local, a task whose committed
  status says `delivered` may have no file on this machine. `igq status`
  flags it rather than letting you wonder where the image went. Either the
  image was already accepted (pull it from git), or re-deliver it here, or
  `igq reject <id> --reason "lost in transit"` to reopen it.

The practical rule: **accept before you switch machines.** Once accepted, the
image is in `docs/` and travels with everything else. A delivery left sitting
in `inbox/` does not.

## Notes for specific tools

**Google Antigravity** — you have shell and filesystem access, so use the
full loop: `igq list` → `igq claim` → `igq brief` → generate →
`igq deliver`. You can work several tasks in one session. Claim each one
so parallel agents don't collide.

**ChatGPT desktop** — you generally can't write to arbitrary paths, so
the human courier path is expected and fully supported:

1. Dan runs `igq brief <id> --copy`
2. Pastes into ChatGPT, gets the image
3. Saves it to `image-tasks/inbox/<task-id>.png`

Step 3 is the whole protocol. The filename does all the work — no
metadata to fill in, nothing to remember.

**Any other tool** — if it can save a PNG to a path, it can participate.

---

## Command reference

| Command | What it does |
|---------|--------------|
| `igq list` | Show open tasks (`--all` includes accepted) |
| `igq status` | Counts by status + what's sitting in the inbox |
| `igq brief <id>` | Print the full copy-paste prompt (`--copy` for clipboard) |
| `igq claim <id> --agent NAME` | Mark a task as being worked on |
| `igq deliver <id> <file>` | Copy a finished image into the inbox and check it |
| `igq scan` | Validate everything in the inbox, write receipts, notify |
| `igq accept <id>` | Compress and install into the repo (`--all` for every pass) |
| `igq reject <id> --reason "..."` | Return a task to the queue with feedback |
| `igq new <id> --title ... --output ...` | Create a new task |
| `igq queue` | Regenerate `QUEUE.md` from the task files |
| `igq watch` | Poll the inbox and react (`--wake` to launch headless Claude) |
| `igq optimize docs/img` | Shrink oversized PNGs already in the repo |

---

## Anatomy of a task file

`tasks/<task-id>.md` — YAML frontmatter for the machine, markdown body
for the prompt.

```yaml
---
id: rgb-led-breadboard-circuit
title: RGB LED breadboard wiring diagram
status: open              # open | claimed | delivered | accepted | rejected
priority: 1               # 1 = highest
output: docs/kits/rgb-led/rgb-circuit.png   # where it gets installed
prompt_file: docs/img/mascot/image-prompts.md#2-welcome-pose   # optional
accept:
  format: png
  width: 1200             # or min_width / min_height
  height: 900
  aspect: "4:3"
  max_kb: 500
  alpha: required         # required | forbidden | any
  transparent_corners: true
  trim_border_px: 4
  no_text: true           # flags the task for human review
---

Everything below the frontmatter is the prompt, verbatim.
```

`prompt_file` lets a task point at a prompt that already lives in the
repo (like the mascot pose prompts) instead of duplicating it. `igq brief`
inlines that section automatically, so the agent still gets one
self-contained block.

`accept:` drives the automated checks. Only `no_text` can't be machine-
verified — it marks the task for human review instead.
