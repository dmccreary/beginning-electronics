---
title: "Breadboard Power Supply Comparison"
description: "Compare a 3×AA pack, a USB wall charger, an MB102 module, and a bench supply — with every specification traced to its source."
image: /sims/breadboard-power-supply-comparison/breadboard-power-supply-comparison.png
og:image: /sims/breadboard-power-supply-comparison/breadboard-power-supply-comparison.png
twitter:image: /sims/breadboard-power-supply-comparison/breadboard-power-supply-comparison.png
social:
   cards: false
hide:
  - toc
quality_score: 0
---

# Breadboard Power Supply Comparison

<iframe src="main.html" height="842px" width="100%" scrolling="no"></iframe>

[Run the Breadboard Power Supply Comparison MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

## About This MicroSim

Four things can power a breadboard, and they fail in four completely different
ways. This table puts them side by side: a 3 × AA battery pack, a USB wall
charger, the MB102 module that plugs onto the power rails, and a bench supply
with an adjustable current limit.

What makes this table different from most comparison charts is that **every
specification is clickable**, and clicking it shows you where the number came
from — the datasheet, the manual, or the safety bulletin — along with the exact
wording in that source and how much confidence it deserves.

!!! mascot-thinking "Ask Where the Number Came From"
    ![Volt thinking about a key concept](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Any table can print "1.5 A" in a box. The useful question is *who measured
    that, and where can I read it myself?* Click a cell and find out. Getting
    into that habit is a genuine engineering superpower — and it will save you
    from a lot of confidently wrong numbers on the internet.

## How to Use

1. Use the **Who is building?** menu to pick a situation. The table highlights
   the supply this book recommends and explains the reasoning.
2. **Click any specification cell** — the ones with a dotted underline — to open
   the source panel beneath the table.
3. Read the colored dot on each cell. It tells you how solid that number is
   before you rely on it.

### What the Colors Mean

| Dot | Verdict | What it means |
|-----|---------|---------------|
| 🟢 | **Verified** | The exact number appears in a primary source, quoted in the panel. |
| 🟩 | **Derived** | Calculated from a primary-source number; the arithmetic is shown. |
| 🟠 | **Directional** | The effect is real but the exact figure varies by board or brand. |
| 🟧 | **Qualitative only** | Supported in words but not reliably quantified. No number is claimed. |
| ⚪ | **Project estimate** | This book's own classroom pricing. Check current prices. |

## The Comparison at a Glance

| Supply | On a short circuit | Settable limit | Replace cost |
|--------|-------------------|----------------|--------------|
| **3 × AA pack** | Several amps briefly, then the cells sag | None | ~$1 + cells |
| **USB wall charger** | Depends entirely on the charger | None | ~$1.20 each |
| **MB102 module** | Limits at 0.9–1.5 A, then shuts down above 165 °C | Fixed | ~$2 |
| **Bench supply** | Clamped at whatever you dialed in | **Yes — you set it** | $50–100 |

!!! mascot-warning "A Battery Pack Is Not Automatically Safe"
    ![Volt pointing out a common mistake](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    It is easy to assume batteries are harmless because they are small. A fresh
    alkaline AA has only about 0.15–0.3 Ω of internal resistance, so three of
    them in series can push several amps into a dead short — enough to make
    wires and holders hot. Batteries are a fine place to start; they are not a
    substitute for finding the short.

## Lesson Plan

### Grade Level

Grades 7–12; beginning electronics

### Duration

15–20 minutes

### Prerequisites

- Ohm's law, well enough to compute current from voltage and resistance
- Knowing what a short circuit is
- Chapter 5 power-supply vocabulary

### Learning Objective

Students will **evaluate** four breadboard power supplies against a situation
and justify a choice using cited specifications rather than assumptions.

### Activities

1. **Explore (5 min):** Open every cell in the "On a Short Circuit" column.
   Which supply is the only one where *you* decide the fault current?
2. **Trace a claim (5 min):** Open the MB102 short-circuit cell and follow the
   link to the AMS1117 datasheet. Find the current-limit row yourself.
3. **Judge the evidence (5 min):** Find the one cell marked *Qualitative only*.
   Why does this book refuse to print a number there? What would it take to
   turn it into a verified number?
4. **Apply (5 min):** Pick a scenario from the menu and argue for a *different*
   supply than the one recommended. Which cells support your case?

### Assessment

Give students a situation not in the menu — a robot that must run untethered
for an hour, or a class of twenty beginners sharing one supply — and ask them
to choose a supply and cite two specifications from the table that justify it.
Full credit requires naming the source, not just the number.

## References

Every figure in this MicroSim traces to one of these sources:

1. **AMS1117 1A Low Dropout Voltage Regulator datasheet**, Advanced Monolithic
   Systems — current limit, thermal shutdown, dropout voltage, package power
   rating. <http://www.advanced-monolithic.com/pdf/ds1117.pdf>
2. **Energizer E91 (AA alkaline) Product Datasheet**, Energizer Brands LLC —
   nominal voltage and internal resistance. <https://data.energizer.com/pdfs/e91.pdf>
3. **"High Powered AA Batteries," Health & Safety Bulletin HSB18**, Lincolnshire
   County Council, April 2013 — short-circuit hazards of alkaline cells in
   school circuit work.
4. **DP800 Series Programmable Linear DC Power Supply User Guide**, RIGOL
   Technologies — constant-current crossover behavior.
5. **"USB in a NutShell — Chapter 2,"** Craig Peacock, beyondlogic.org,
   summarizing USB 2.0 bus-power limits. <https://www.beyondlogic.org/usbnutshell/usb2.shtml>
6. [Parts List for a $50 Kit](../../appendices/parts-list/index.md) — this
   book's own classroom pricing estimates.

## Iframe Embed Code

You can add this MicroSim to any web page by adding this to your HTML:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/breadboard-power-supply-comparison/main.html"
        height="842px"
        width="100%"
        scrolling="no"></iframe>
```

## Related Pages

- [Safe Power for Learning](../../setup/safe-power-for-learning/index.md) — the full
  argument, including how to add a PTC resettable fuse
- [Finding the Right Power Supplies](../../setup/power-supplies.md) — where to buy
- [Power Source Chooser](../power-source-chooser/index.md) — the companion sim comparing
  USB, 9 V, AA pack, and LiPo for *project* power
- [Power Lab](../../labs/09-power.md) — the hands-on version
