---
title: "Boolean Logic and Transistor Gates"
description: "Students formalize Boolean AND, OR, and NOT reasoning with truth tables, then rebuild Chapter 16's switch-based AND and OR gates using real NPN transistors wired in series and parallel."
generated_by: claude skill chapter-content-generator
date: 2026-08-14 20:32:07
version: 0.09
---

# Boolean Logic and Transistor Gates

## Summary

This chapter formalizes Boolean AND/OR/NOT reasoning with truth tables, then shows students how to build their first transistor-based logic gates — connecting back to the wired-switch logic from the Switches chapter, now built from active components.

## Concepts Covered

This chapter covers the following 15 concepts from the learning graph:

1. Binary State
2. Digital Signal
3. Boolean Logic
4. Logical AND Operation
5. Logical OR Operation
6. Logical NOT Operation
7. Truth Table
8. Reading a Truth Table
9. Building a Truth Table
10. Logic Input Combination
11. Logic Gate Symbol
12. AND Gate
13. Transistor AND Gate
14. OR Gate
15. Transistor OR Gate

## Prerequisites

This chapter builds on concepts from:

- [1. Electricity Basics: Voltage, Current, and Resistance](../01-electricity-basics/index.md)
- [13. Meet the Transistor](../13-meet-the-transistor/index.md)
- [16. Switches, Buttons, and Wired Logic](../16-switches-buttons-wired-logic/index.md)

---

Chapter 23 closed with a promise: every signal you'd built up to that point was analog — sine waves, sunlight, voltages that slide smoothly from one value to another. That promise ends right here. From this chapter on, a signal is either fully on or fully off, with nothing in between, and that's not a step down. It's the exact language every computer chip on Earth speaks, and you already know the punchline: you built this same logic with switches back in Chapter 16, wiring buttons in series for AND and in parallel for OR. This chapter hands you the transistor version of that same trick, plus the tidy notation — the truth table — that real engineers use to describe it instead of writing paragraphs.

!!! mascot-welcome "Yes, No, and Nothing In Between"
    ![Volt waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Welcome back, builder! This is a genuine "it all clicks" chapter — you're about to see that a computer's logic is just circuits you've already built, wearing a new outfit. It's a yes/no kind of chapter, and I promise it's more fun than that sounds. Let's light it up!

## Two States, No In-Between: Binary State and Digital Signal

Every circuit you've built so far cared about a range of values: a dimmer LED, a slowly charging capacitor, a sine wave sliding smoothly up and down. Those were analog signals, free to sit anywhere in between two extremes. This chapter's signals refuse that freedom completely.

A **Binary State** is a condition that can only ever be one of exactly two possible values — usually labeled 0 and 1, off and on, or LOW and HIGH. There's no "sort of on." A binary state is fully one value or fully the other, full stop, every single time.

A **Digital Signal** is an electrical signal built entirely out of binary states — a voltage that only ever sits near 0 V (LOW, or 0) or near the full supply voltage (HIGH, or 1), with no meaningful values in between. Every circuit in this chapter reads and produces digital signals, not the smooth, sliding voltages of Chapter 23's waveforms.

- A closed switch, or a saturated transistor (Chapter 13), produces a HIGH digital signal
- An open switch, or a cutoff transistor, produces a LOW digital signal
- There's no "half-pressed button" reading in a digital world — a signal snaps to one state or the other

## Boolean Logic: The Math of Yes and No

Writing out "the LED turns on only when both switches are closed" in a full sentence works fine for one circuit. It gets unwieldy fast once a circuit has three, four, or a hundred inputs. Mathematicians solved that problem more than 150 years before the first computer chip existed to use it.

**Boolean Logic** is a branch of mathematics that works with only two values — true and false, or 1 and 0 — using a small set of operations to combine them into new true-or-false answers, instead of the addition and multiplication you already know from arithmetic. It's named after George Boole, a 19th-century mathematician who worked out these rules roughly a century before anyone built a circuit to run them automatically.

Boolean logic has exactly three basic operations, and you've already met the behavior of two of them — you just didn't have the notation yet.

**Logical AND Operation** combines two inputs into one output that's true only when *every* input is true — the exact all-or-nothing agreement Chapter 16's series switches enforced.

#### Boolean AND Operation

\[ Y = A \cdot B \]

where:

- \( Y \) is the output
- \( A \) is the first input
- \( B \) is the second input
- \( \cdot \) is read as "AND" — the output is 1 only when both \( A \) and \( B \) are 1

**Logical OR Operation** combines two inputs into one output that's true when *at least one* input is true — the same generous, any-path-works agreement Chapter 16's parallel switches enforced.

#### Boolean OR Operation

\[ Y = A + B \]

where:

- \( Y \) is the output
- \( A \) is the first input
- \( B \) is the second input
- \( + \) is read as "OR" here, not addition — the output is 1 when \( A \), \( B \), or both are 1

**Logical NOT Operation** takes a single input and flips it to the opposite value — true becomes false, false becomes true. NOT is the odd one out: it's the only one of the three that works on just one input instead of two.

#### Boolean NOT Operation

\[ Y = \overline{A} \]

where:

- \( Y \) is the output
- \( A \) is the input
- the bar drawn over \( A \) is read as "NOT" — it flips a 1 to a 0 and a 0 to a 1

!!! mascot-thinking "Same Logic, New Notation"
    ![Volt thinking about it](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Notice something? "Series switches equal AND" and "parallel switches equal OR" from Chapter 16 are the exact same rules as \( Y = A \cdot B \) and \( Y = A + B \) above — just written in a shorthand that works no matter what's doing the switching: wires, transistors, or a chip with a billion gates inside it.

## Truth Tables: Reading, Building, and Counting Combinations

Writing "true only when both inputs are true" in words gets old fast. Engineers solved that with a simple grid instead of a sentence.

A **Truth Table** is a table that lists every possible combination of a circuit's inputs alongside the output that combination produces, giving a complete, at-a-glance picture of a logic operation's behavior with no sentences required.

**Reading a Truth Table** means finding a specific row — a specific combination of input values — and reading off the output listed in that same row, the same way you'd look up a word in a dictionary by its first letters. **Building a Truth Table** means constructing one from scratch: listing every possible input combination first, in order, and then working out the correct output for each row, one row at a time.

Before filling in a single row, it helps to know exactly how many rows you'll need.

A **Logic Input Combination** is one specific pairing of HIGH and LOW values across all of a circuit's inputs at a given moment — "A LOW, B HIGH" is one combination; "A HIGH, B HIGH" is a completely different one.

#### Counting Logic Input Combinations

\[ N = 2^n \]

where:

- \( N \) is the total number of possible input combinations
- \( n \) is the number of binary inputs
- the base of 2 shows up because every single input can only ever be one of two values — 0 or 1

A gate with 2 inputs needs \( 2^2 = 4 \) rows — exactly what you already predicted twice in Chapter 16. A gate with 3 inputs would need \( 2^3 = 8 \) rows. Every one of those rows has to appear in a properly built truth table, in order, with no combination skipped.

Here are the complete truth tables for all three Boolean operations, ready to check yourself against.

| A | B | Y = A AND B |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | **1** |

| A | B | Y = A OR B |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | **1** |
| 1 | 0 | **1** |
| 1 | 1 | **1** |

| A | Y = NOT A |
|---|---|
| 0 | **1** |
| 1 | 0 |

!!! mascot-tip "Build Truth Tables in Binary Counting Order"
    ![Volt giving a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Notice the AND and OR tables above both go 00, 01, 10, 11 — that's just counting in binary! Building every truth table in that same order means you'll never accidentally skip a combination, and any engineer reading your table instantly knows where to look.

## From Wires to Transistors: AND and OR Gates

Chapter 16 built AND and OR logic using nothing but switches and wire — series wiring demanded every switch agree, and parallel wiring only needed one. That was a real logic gate, built entirely by hand. This section builds the exact same two gates again, this time with the transistor you met in Chapter 13 doing the switching instead of your finger.

A **Logic Gate Symbol** is the standardized schematic shape engineers use to represent a gate's job without drawing what's actually wired inside it — a flat-backed, D-shaped symbol always means AND, and a curved, pointed shield shape always means OR, whether the real circuit inside is built from switches, transistors, or a chip packed with billions of them. Learn these two shapes once, and you'll recognize them in every schematic you ever read.

An **AND Gate** is any real circuit — switches, transistors, or otherwise — that implements the Logical AND Operation, outputting HIGH only when every one of its inputs is HIGH. An **OR Gate** is any real circuit that implements the Logical OR Operation, outputting HIGH when at least one of its inputs is HIGH. Chapter 16's series and parallel switch circuits were both real gates by this definition — they just used mechanical contacts instead of a semiconductor.

A **Transistor AND Gate** builds AND logic by wiring two NPN transistors in series — bases driven independently by two separate inputs, but collector-to-emitter chained one after another — the exact transistor switching behavior from Chapter 13, arranged the very same way Chapter 16 arranged mechanical switches for AND.

Picture the current's path: from the positive rail, through a resistor and an LED, into transistor Q1's collector, out Q1's emitter and straight into transistor Q2's collector, out Q2's emitter, and finally to ground. That's one single path, and every transistor sitting on it has to be saturated (Chapter 13) for current to get through. Input A drives Q1's base through its own base resistor; input B drives Q2's base through a separate base resistor. If either input is LOW, that transistor sits in cutoff, the one and only path is blocked, and the LED stays dark — precisely Chapter 16's series AND logic, with a transistor's cutoff standing in for an open switch.

A **Transistor OR Gate** builds OR logic by wiring two NPN transistors in parallel instead. Both transistors' collectors tie to the very same LED, and both emitters tie to the very same ground rail, but each transistor's base is driven by its own independent input.

Saturating either transistor alone gives current a complete path to ground, lighting the LED — Chapter 16's parallel OR logic, with a transistor's saturation standing in for a closed switch. Saturate both at once, and current simply has two parallel paths instead of one; the LED lights exactly the same either way, just like a garage door that opens for the wall button or the remote — either one, on its own, gets the job done.

!!! mascot-encourage "You Already Know This Circuit"
    ![Volt encouraging you](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Don't let "two transistors" sound harder than "two switches." Every wire in this section follows the identical series-or-parallel shape you mastered in Chapter 16 — the only thing that changed is what's doing the switching. Trust what you already know.

!!! mascot-warning "Series Is AND, Parallel Is OR — Every Single Time"
    ![Volt giving a warning](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    It's an easy slip to mix these up under pressure. If you ever forget which arrangement builds which gate, go back to Chapter 16's rule: one path demanding full agreement is AND, and multiple paths settling for just one is OR. That rule never changes, whether it's switches or transistors doing the agreeing.

Flip the inputs yourself and watch both gates — and both truth tables — come alive in the simulation below.

#### Diagram: Transistor AND and OR Logic Gates with Live Truth Table

<iframe src="../../sims/transistor-and-or-logic-gates/main.html" width="100%" height="587px" scrolling="no"></iframe>

<details markdown="1">
<summary>Transistor AND and OR Logic Gates with Live Truth Table</summary>
Type: microsim
**sim-id:** transistor-and-or-logic-gates<br/>
**Library:** p5.js<br/>
**Status:** Specified

Purpose: Let students press independent input buttons on a rendered breadboard holding a series-wired transistor AND gate and a parallel-wired transistor OR gate, and directly watch each gate's output LED and its own self-filling truth table respond to every input combination, so the abstract \( Y = A \cdot B \) and \( Y = A + B \) notation connects to a real, physical circuit built from the exact transistor behavior learned in Chapter 13.

Bloom Taxonomy: Apply (L3). Bloom Verb: demonstrate, predict, verify.

Learning objective: Given a rendered breadboard with two NPN transistors wired in series (AND) and two NPN transistors wired in parallel (OR), predict and then verify the output LED's state and the corresponding row of a live truth table for every possible combination of two input buttons on each gate.

Reuse check: An embeddings search (find-similar-templates, mode=reuse) for "Title: Transistor AND and OR Logic Gates with Live Truth Table | Topic: Transistor AND gate, Transistor OR gate, truth table, boolean logic, NPN transistor switching | Subjects: Electronics, Electric Circuits | Grade Level: Junior High | Learning Objectives: Given a rendered breadboard circuit with two NPN transistors wired as an AND gate and an OR gate, toggle each input switch and observe the output LED and a live, self-filling truth table" returned a top match of "Logic Gates" (dmccreary/microsims, WHAT score 0.6475, recommendation "template"), followed by "Interactive Truth Table Builder" (dmccreary/computer-science, WHAT score 0.5877, "generate") and "Logic Gates MicroSim" (dmccreary/digital-electronics, WHAT score 0.5736, "generate"). All three teach logic gates through abstract IEEE schematic symbols with clickable inputs, not a physical breadboard circuit built from real NPN transistors in series or parallel — exactly the gap this chapter needs to fill, since the whole point of this MicroSim is showing the *same* transistor switching behavior from Chapter 13 arranged into the *same* series/parallel wiring shapes from Chapter 16. A keyword search of the catalog for "transistor logic gate," "truth table," and "boolean AND OR" surfaced the same three schematic-symbol sims and no breadboard-based match. New specification. **Library/Implementation fit:** an excellent, central candidate for the breadboard-sim-generator skill — both gates reuse this repository's existing `bbTransistor()` component (already built for Chapter 13's transistor-switch demo) and extend `breadboard-lib.js` with a small self-filling truth-table panel, directly continuing the reused `wired-logic-and-or` sim's AND-on-top/OR-on-bottom layout from Chapter 16, now with transistors standing in for the switches.

Canvas layout: A rendered breadboard split into two halves stacked vertically — top half labeled "Transistor AND Gate," with two NPN transistors wired in series, a collector-side resistor and LED, and two input push buttons (A, B) each feeding its own base resistor; bottom half labeled "Transistor OR Gate," with two NPN transistors wired in parallel, its own resistor and LED, and two input push buttons (C, D). A right-side panel holds two live truth tables (AND on top, OR on bottom) that highlight and fill in the matching row as buttons are pressed, plus two small clickable schematic gate-symbol icons (D-shaped AND, shield-shaped OR).

Components/elements involved: Rendered breadboard with power and ground rails; two NPN transistors (TO-92 package, base/collector/emitter individually labeled and hoverable) wired in series for the AND circuit; two NPN transistors wired in parallel for the OR circuit; four input push buttons (A, B, C, D), each with its own base resistor; two collector-side resistors and LEDs, one per gate; connecting wires; two live truth-table panels; two clickable IEEE-style gate-symbol icons.

Required interactivity:
- Pressing input button A and/or B toggles that transistor's base current on or off in the AND circuit; the AND LED lights only when both A and B are held down together, and the matching row of the AND truth table highlights and fills in with the live output value
- Pressing input button C and/or D toggles that transistor's base current on or off in the OR circuit; the OR LED lights whenever C, D, or both are held down, and the matching row of the OR truth table highlights and fills in with the live output value
- Hovering any transistor's base, collector, or emitter lead opens an infobox naming that lead, reinforcing Chapter 13's vocabulary
- Clicking the AND or OR schematic gate-symbol icon opens an infobox describing that icon's shape (flat-backed D vs. curved shield) and stating that the same shape is used no matter what is physically switching, reinforcing the Logic Gate Symbol concept
- Animated current dots move only along the completed path, exactly as in Chapter 16's wired-logic-and-or sim, so a learner can see the AND circuit's single series path versus the OR circuit's two parallel paths

Default state: All four buttons released, both LEDs dark, both truth tables empty except a highlighted arrow pointing at the all-LOW row; infobox reads "Press A and B together to fill in the AND gate's last row."

Instructional Rationale: An Apply-level "demonstrate/predict/verify" objective needs a manipulable circuit with an immediate, checkable consequence — pressing each input combination and watching both the LED and the matching truth-table row respond lets students verify their own predictions instead of only reading someone else's finished table, directly continuing the predict-then-verify pattern Chapter 16 used for its own wired-logic-and-or sim.

Color scheme: Same green current-flow dots and dim gray off-state used in Chapter 13's transistor-switch demo; blue highlight on the truth-table row currently being demonstrated; AND/OR panel colors carried over from Chapter 16's reused sim.

Responsive behavior: Breadboard halves and the truth-table/infobox panel stack vertically on narrow screens; all four buttons remain full-width and touch-friendly; both gate-symbol icons scale down but stay tappable.

Implementation: p5.js, built on the breadboard-sim-generator skill's rendered tie-point approach, extending this repository's existing `breadboard-lib.js` `bbTransistor()` component (introduced for Chapter 13) with a new self-filling truth-table panel, reusing the current-path animation logic from Chapter 16's `wired-logic-and-or` sim.
</details>

## Chapter Summary: Key Takeaways

You started this chapter with a promise from Chapter 23 — signals that only ever go fully on or fully off — and you're ending it having built the two most fundamental logic circuits in every computer chip ever made.

- A **Binary State** and a **Digital Signal** work with exactly two values — HIGH/1 or LOW/0 — no in-between allowed
- **Boolean Logic** formalizes the **Logical AND Operation**, **Logical OR Operation**, and **Logical NOT Operation** into simple, precise math instead of full sentences
- A **Truth Table** lists every **Logic Input Combination** and its output; **Reading a Truth Table** looks up a row, **Building a Truth Table** constructs one from scratch, always \( 2^n \) rows for \( n \) inputs
- A **Logic Gate Symbol** lets any engineer recognize an **AND Gate** or **OR Gate**'s job at a glance, no matter what's wired inside it
- A **Transistor AND Gate** wires two transistors in series, and a **Transistor OR Gate** wires two transistors in parallel — the exact same shapes Chapter 16 built with switches, now built with the active components from Chapter 13

Two gates down, four more logic ideas to go. Chapter 25 builds the NAND and NOR gates — AND and OR's stubborn opposite cousins — meets the XOR gate, which only agrees when its inputs disagree, and uses that whole toolkit to build something genuinely new: an RS latch, a circuit that remembers a single bit even after you let go of the button that set it.

!!! mascot-celebration "Logic Gate Engineer: Unlocked"
    ![Volt celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    This is a huge one, builder! You just built the exact same AND and OR logic running inside every computer chip on the planet — with transistors, with truth tables, with the real notation engineers use. That's not just a new skill, that's literally how every processor thinks. Current's flowing your way — see you in Chapter 25!
