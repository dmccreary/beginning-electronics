#!/usr/bin/env python3
"""Render healthy, open, and shorted circuit measurements.

Prompt:
    Use the same 5 V source, 1 kΩ series resistor, load, ground, and test points
    TP1 before the resistor and TP2 at the load in three panels. HEALTHY shows
    expected TP1=5 V and TP2≈2.5 V. OPEN LOAD shows TP2≈5 V and zero current.
    SHORTED LOAD shows TP2≈0 V and excessive current limited by the resistor.
    Mark the substituted fault in red and keep meter predictions at consistent
    positions for comparison.

Topology: healthy +5V->1kΩ->1kΩ load->GND; open replaces load with break;
short replaces load with wire to ground.
Assumptions: Ideal 5 V supply and high-impedance voltmeter referenced to ground.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    BLUE,
    GREEN,
    INK,
    RED,
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def panel(d, x, mode):
    col = GREEN if mode == "healthy" else RED
    text(d, mode.upper(), (x + 1.8, 7), color=col, fontsize=11)
    wire(d, (x, 5.8), (x + 0.5, 5.8), color=RED)
    text(d, "+5 V\nTP1 = 5 V", (x, 6.45), color=BLUE, fontsize=8.5)
    r = d.add(elm.Resistor().right().at((x + 0.5, 5.8)).to((x + 3, 5.8)))
    dot(d, r.end, color=BLUE)
    text(d, "R1 1 kΩ", (x + 1.75, 5.15), fontsize=8)
    text(d, "TP2", (x + 3, 6.35), color=BLUE, fontsize=8)
    if mode == "healthy":
        load = d.add(elm.Resistor().down().at(r.end).to((x + 3, 2)))
        ground(d, load.end)
        text(d, "RL 1 kΩ", (x + 3.8, 3.9), fontsize=8)
        val = "TP2 ≈ 2.5 V\nI ≈ 2.5 mA"
    elif mode == "open load":
        br = d.add(elm.Switch().down().at(r.end).to((x + 3, 2)).color(RED))
        ground(d, br.end)
        text(d, "OPEN", (x + 3.8, 3.9), color=RED, fontsize=9)
        val = "TP2 ≈ 5 V\nI = 0"
    else:
        wire(d, r.end, (x + 3, 2), color=RED, lw=3)
        ground(d, (x + 3, 2))
        text(d, "SHORT", (x + 3.8, 3.9), color=RED, fontsize=9)
        val = "TP2 ≈ 0 V\nI ≈ 5 mA"
    text(d, val, (x + 1.8, 1), color=col, fontsize=9)


def build_drawing():
    d = drawing()
    panel(d, 0.5, "healthy")
    panel(d, 6, "open load")
    panel(d, 11.5, "shorted load")
    text(d, "All readings use the same ground reference.", (8, 0), fontsize=9)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
