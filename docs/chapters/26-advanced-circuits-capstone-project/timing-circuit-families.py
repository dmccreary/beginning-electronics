#!/usr/bin/env python3
"""Render RC timer, 555 oscillator, and signal-generator families.

Prompt:
    Draw three simplified circuits that connect timing ideas across the book.
    RC TIMER shows a resistor charging a capacitor to create one changing
    voltage and one time constant. 555 OSCILLATOR shows an astable 555 block
    with R1, R2, timing capacitor, and square-wave output. SIGNAL GENERATOR
    shows an oscillator block with frequency control and a repeating waveform
    output. Label energy storage, feedback/retriggering, and one-shot versus
    continuous behavior before the terminology table.

Topology: RC +5V->R->VC->C->GND. 555 timing network connects R1/R2/C to an
astable block. Generator uses a controlled oscillator block driving OUT.
Assumptions: The latter two are intentionally simplified functional schematics.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    BLUE,
    GREEN,
    INK,
    ORANGE,
    PURPLE,
    RED,
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    text(d, "RC TIMER", (2.5, 7.2), color=BLUE, fontsize=11)
    r = d.add(elm.Resistor().right().at((0.6, 5.2)).to((3.2, 5.2)))
    wire(d, (0.1, 5.2), r.start, color=RED)
    text(d, "+5 V", (0.1, 5.8), color=RED)
    dot(d, r.end)
    c = d.add(elm.Capacitor().down().at(r.end).to((3.2, 2)))
    ground(d, c.end)
    text(d, "R", (1.9, 5.85))
    text(d, "VC", (3.7, 5.2), color=GREEN)
    text(d, "C stores energy", (4.2, 3.5), color=BLUE, fontsize=8)
    text(d, "one transition\nτ = R×C", (2.5, 1), color=BLUE, fontsize=9)
    text(d, "555 OSCILLATOR", (8.2, 7.2), color=ORANGE, fontsize=11)
    ic = d.add(
        elm.Ic(size=(2.8, 2.5)).right().at((6.8, 3.2)).label("555\nASTABLE").color(INK)
    )
    wire(d, (8.2, 6.3), (8.2, 5.7), color=RED)
    text(d, "+5 V", (8.2, 6.75), color=RED)
    text(d, "R1 + R2 + C\nset period", (6.0, 2.2), color=ORANGE, fontsize=8.5)
    wire(d, (9.6, 4.45), (10.7, 4.45), color=ORANGE)
    text(d, "OUT: square wave", (10.15, 5.05), color=ORANGE, fontsize=8.5)
    text(
        d,
        "feedback retriggers\ncontinuous oscillation",
        (8.2, 1),
        color=ORANGE,
        fontsize=9,
    )
    text(d, "SIGNAL GENERATOR", (15.2, 7.2), color=PURPLE, fontsize=11)
    box = d.add(
        elm.Ic(size=(3.0, 2.4))
        .right()
        .at((13.7, 3.3))
        .label("CONTROLLED\nOSCILLATOR")
        .color(PURPLE)
    )
    wire(d, (12.7, 4.5), (13.7, 4.5), color=BLUE)
    text(d, "frequency control", (12.15, 3.85), color=BLUE, fontsize=8)
    wire(d, (16.7, 4.5), (17.8, 4.5), color=PURPLE)
    text(d, "OUT  ~~~~~", (18.6, 4.5), color=PURPLE, fontsize=9)
    text(
        d,
        "repeating waveform\nwith adjustable frequency",
        (15.2, 1),
        color=PURPLE,
        fontsize=9,
    )
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
