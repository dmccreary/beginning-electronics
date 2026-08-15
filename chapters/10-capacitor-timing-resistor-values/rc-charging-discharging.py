#!/usr/bin/env python3
"""Render RC charging and discharging paths.

Prompt:
    Draw matched side-by-side RC circuits. The CHARGING panel shows a 5 V
    source, closed switch, resistor, capacitor to ground, capacitor-voltage
    node VC, and conventional current flowing from the source through R1 into
    C1. The DISCHARGING panel shows the source disconnected and the charged
    capacitor releasing current through the same resistor and a closed switch
    to ground. Use R1=10 kΩ and C1=10 µF, mark C1 polarity, show VC rising or
    falling, and keep all current arrows outside the wires and symbols.

Topology: charge +5V->S1->R1->VC->C1->GND. Discharge C1+ at VC->R1->S1->GND,
with the source disconnected. Panels repeat the same component values.
Assumptions: C1 is polarized with its positive terminal at VC.
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
    RED,
    arrow,
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    text(d, "CHARGING", (3.7, 7.5), color=BLUE, fontsize=13)
    text(d, "+5 V source", (0.8, 5.6), color=RED, fontsize=10)
    sw1 = d.add(elm.Switch(nc=True).right().at((1.5, 4.5)).to((3.2, 4.5)).color(INK))
    wire(d, (0.8, 4.5), sw1.start, color=RED)
    r1 = d.add(elm.Resistor().right().at(sw1.end).to((5.4, 4.5)).color(INK))
    dot(d, r1.end)
    cap1 = d.add(elm.Capacitor2(polar=True).down().at(r1.end).to((5.4, 1.2)).color(INK))
    ground(d, cap1.end)
    text(d, "S1 closed", (2.35, 3.85), fontsize=8.5)
    text(d, "R1  10 kΩ", (4.25, 5.05), fontsize=9)
    text(d, "VC rises\ntoward 5 V", (6.15, 4.1), color=GREEN, fontsize=8.5)
    text(d, "C1  10 µF\n+ at VC", (6.35, 2.65), fontsize=9)
    arrow(d, (1.1, 5.25), (4.9, 5.25), color=BLUE)
    arrow(d, (4.8, 4.0), (4.8, 2.0), color=BLUE)
    text(d, "conventional current →", (3.2, 6.15), color=BLUE, fontsize=9)

    text(d, "DISCHARGING", (11.0, 7.5), color=ORANGE, fontsize=13)
    cap2 = d.add(
        elm.Capacitor2(polar=True).down().at((9.0, 4.5)).to((9.0, 1.2)).color(INK)
    )
    ground(d, cap2.end)
    dot(d, cap2.start)
    r2 = d.add(elm.Resistor().right().at(cap2.start).to((11.3, 4.5)).color(INK))
    sw2 = d.add(elm.Switch(nc=True).right().at(r2.end).to((13.0, 4.5)).color(INK))
    wire(d, sw2.end, (13.8, 4.5))
    wire(d, (13.8, 4.5), (13.8, 1.2))
    ground(d, (13.8, 1.2))
    text(d, "VC falls\ntoward 0 V", (8.05, 4.1), color=GREEN, fontsize=8.5)
    text(d, "C1  10 µF\n+ at VC", (7.8, 2.55), fontsize=8.5)
    text(d, "R1  10 kΩ", (10.15, 5.05), fontsize=9)
    text(d, "S1 closed", (12.15, 3.85), fontsize=8.5)
    text(d, "source disconnected", (12.35, 5.85), color=RED, fontsize=8.5)
    arrow(d, (9.4, 5.25), (12.8, 5.25), color=ORANGE)
    arrow(d, (13.25, 4.0), (13.25, 2.0), color=ORANGE)
    text(d, "stored charge → current", (10.65, 6.25), color=ORANGE, fontsize=8.5)
    wire(d, (7.15, 7.0), (7.15, 0.7), color="#c8cdd1", ls="--")
    text(d, "Same R and C: τ = R × C = 0.10 s", (7.15, -0.35), fontsize=10)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
