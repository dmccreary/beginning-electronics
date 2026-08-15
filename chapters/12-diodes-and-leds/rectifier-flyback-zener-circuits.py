#!/usr/bin/env python3
"""Render rectifier, flyback, and Zener diode applications.

Prompt:
    Draw three compact educational panels. RECTIFIER: a safe low-voltage AC
    source, forward diode, load resistor, and half-wave current path. FLYBACK:
    an inductive load switched on the low side with a diode directly across it,
    reverse-biased during normal operation and with cathode toward +5 V; show
    the switch-off current loop. ZENER CLAMP: VIN through a required series
    resistor to VOUT, with a reverse-biased 5.1 V Zener from VOUT to ground;
    show clamp current. Label anode/cathode orientation and avoid crossings.

Topology: rectifier VAC->D1->RL->return. Flyback +5V->L1->S1->GND with D2
parallel to L1, cathode at +5V. Zener VIN->RZ->VOUT and D3 Zener cathode at
VOUT, anode at GND.
Assumptions: The rectifier source is isolated low-voltage AC; the flyback switch
is conceptual; Zener input exceeds 5.1 V and RZ limits current safely.
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
    arrow,
    dot,
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing(fontsize=10)
    # Rectifier panel
    text(d, "1  RECTIFIER", (2.5, 7.2), color=BLUE, fontsize=12)
    ac = d.add(elm.SourceSin().up().at((0.7, 1.5)).to((0.7, 5.4)).color(BLUE))
    d1 = d.add(elm.Diode().right().at(ac.end).to((3.0, 5.4)).color(BLUE))
    rl = d.add(elm.Resistor().down().at(d1.end).to((3.0, 1.5)).color(INK))
    wire(d, rl.end, ac.start)
    text(d, "isolated low-voltage AC", (1.85, 2.35), color=BLUE, fontsize=7.8)
    text(d, "D1\nA → K", (2.0, 6.0), color=BLUE, fontsize=8.5)
    text(d, "RL", (3.75, 3.45), fontsize=9)
    arrow(d, (1.1, 6.15), (2.7, 6.15), color=BLUE)
    text(d, "passes one half-cycle", (2.0, 0.55), color=BLUE, fontsize=8.5)

    # Flyback panel
    text(d, "2  FLYBACK", (7.4, 7.2), color=ORANGE, fontsize=12)
    x, top_y, low_y = 6.4, 5.8, 2.0
    coil = d.add(elm.Inductor().down().at((x, top_y)).to((x, 3.3)).color(INK))
    switch = d.add(elm.Switch(nc=True).down().at(coil.end).to((x, low_y)).color(INK))
    ground(d, switch.end)
    wire(d, (x, top_y), (x, top_y + 0.45), color=RED)
    text(d, "+5 V", (x, top_y + 0.8), color=RED, fontsize=10)
    diode_x = 8.7
    d2 = d.add(
        elm.Diode().up().at((diode_x, coil.end[1])).to((diode_x, top_y)).color(ORANGE)
    )
    wire(d, coil.end, d2.start, color=ORANGE)
    wire(d, coil.start, d2.end, color=ORANGE)
    text(d, "L1\ncoil", (5.5, 4.5), fontsize=8.5)
    text(d, "D2\nflyback", (9.35, 4.5), color=ORANGE, fontsize=8.5)
    text(d, "K", (9.1, 5.65), color=ORANGE, fontsize=8)
    text(d, "A", (9.1, 3.25), color=ORANGE, fontsize=8)
    arrow(d, (8.1, 3.7), (8.1, 5.2), color=ORANGE)
    text(d, "safe switch-off loop", (7.5, 0.55), color=ORANGE, fontsize=8.5)

    # Zener panel
    text(d, "3  ZENER CLAMP", (12.7, 7.2), color=PURPLE, fontsize=12)
    rz = d.add(elm.Resistor().right().at((10.8, 5.2)).to((13.2, 5.2)).color(INK))
    dot(d, rz.end)
    wire(d, (10.1, 5.2), rz.start, color=RED)
    text(d, "VIN", (10.15, 5.75), color=RED, fontsize=9)
    text(d, "RZ\nrequired", (12.0, 5.95), fontsize=8.5)
    wire(d, rz.end, (14.8, 5.2), color=GREEN)
    dot(d, (14.8, 5.2), open=True, color=GREEN)
    text(d, "VOUT ≈ 5.1 V", (14.0, 5.75), color=GREEN, fontsize=9)
    zener = d.add(elm.Zener().up().at((13.2, 1.7)).to((13.2, 5.2)).color(PURPLE))
    ground(d, zener.start)
    text(d, "D3  5.1 V Zener\nK at VOUT", (15.0, 3.35), color=PURPLE, fontsize=8.5)
    arrow(d, (12.65, 4.7), (12.65, 2.4), color=PURPLE)
    text(d, "reverse current clamps VOUT", (13.4, 0.65), color=PURPLE, fontsize=8.5)

    wire(d, (4.8, 6.8), (4.8, 0.8), color="#c8cdd1", ls="--")
    wire(d, (10.0, 6.8), (10.0, 0.8), color="#c8cdd1", ls="--")
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
