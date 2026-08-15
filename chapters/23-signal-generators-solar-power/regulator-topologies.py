#!/usr/bin/env python3
"""Render linear, buck, and boost regulator topologies.

Prompt:
    Draw three simplified regulator panels. LINEAR shows a series pass element
    between VIN and VOUT with input/output capacitors and input above output. BUCK shows
    VIN, high-side switch, switch node, inductor, catch diode from ground to
    the switch node, and output capacitor with VOUT lower than VIN. BOOST shows VIN,
    inductor, switch to ground, diode to VOUT, and output capacitor with
    VOUT higher than VIN. Label switch, diode, inductor, capacitor, ground, and voltage
    relationships; use orthogonal wires and clear polarity.

Topology: linear VIN->pass->VOUT. Buck VIN->S->SW->L->VOUT, D anode GND and
cathode SW, C VOUT-GND. Boost VIN->L->SW, S SW-GND, D anode SW/cathode VOUT,
C VOUT-GND.
Assumptions: Simplified nonsynchronous teaching topologies with common ground.
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


def linear(d, x):
    text(d, "LINEAR", (x + 2, 7.2), color=BLUE, fontsize=12)
    text(d, "VIN > VOUT", (x + 2, 6.65), color=BLUE, fontsize=9)
    wire(d, (x, 5.2), (x + 0.8, 5.2), color=RED)
    reg = d.add(
        elm.Resistor().right().at((x + 0.8, 5.2)).to((x + 3.2, 5.2)).color(BLUE)
    )
    wire(d, reg.end, (x + 4, 5.2), color=GREEN)
    text(d, "SERIES PASS", (x + 2, 5.9), color=BLUE, fontsize=8)
    text(d, "VIN", (x, 5.75), color=RED)
    text(d, "VOUT", (x + 4, 5.75), color=GREEN)
    for xx, n in [(x + 0.5, "CIN"), (x + 3.5, "COUT")]:
        c = d.add(elm.Capacitor().down().at((xx, 5.2)).to((xx, 2.0)))
        ground(d, c.end)
        text(d, n, (xx + 0.55, 3.6), fontsize=8)
    text(d, "excess voltage → heat", (x + 2, 1.1), color=ORANGE, fontsize=8.5)


def buck(d, x):
    text(d, "BUCK", (x + 2.2, 7.2), color=GREEN, fontsize=12)
    text(d, "VOUT < VIN", (x + 2.2, 6.65), color=GREEN, fontsize=9)
    sw = d.add(elm.Switch(nc=True).right().at((x, 5.2)).to((x + 1.6, 5.2)).color(RED))
    dot(d, sw.end)
    ind = d.add(elm.Inductor().right().at(sw.end).to((x + 3.7, 5.2)))
    wire(d, ind.end, (x + 4.5, 5.2), color=GREEN)
    text(d, "VIN", (x, 5.75), color=RED)
    text(d, "S", (x + 0.8, 5.85), color=RED)
    text(d, "L", (x + 2.65, 5.85))
    text(d, "VOUT", (x + 4.5, 5.75), color=GREEN)
    dio = d.add(elm.Diode().up().at((x + 1.6, 2)).to((x + 1.6, 5.2)))
    ground(d, dio.start)
    text(d, "D\nA bottom, K at SW", (x + 0.5, 3.2), fontsize=7.5)
    c = d.add(elm.Capacitor().down().at((x + 4, 5.2)).to((x + 4, 2)))
    ground(d, c.end)
    text(d, "COUT", (x + 4.65, 3.5), fontsize=8)


def boost(d, x):
    text(d, "BOOST", (x + 2.2, 7.2), color=PURPLE, fontsize=12)
    text(d, "VOUT > VIN", (x + 2.2, 6.65), color=PURPLE, fontsize=9)
    ind = d.add(elm.Inductor().right().at((x, 5.2)).to((x + 2, 5.2)))
    dot(d, ind.end)
    dio = d.add(elm.Diode().right().at(ind.end).to((x + 4, 5.2)).color(PURPLE))
    wire(d, dio.end, (x + 4.6, 5.2), color=GREEN)
    text(d, "VIN", (x, 5.75), color=RED)
    text(d, "L", (x + 1, 5.85))
    text(d, "D", (x + 3, 5.85), color=PURPLE)
    text(d, "VOUT", (x + 4.6, 5.75), color=GREEN)
    sw = d.add(elm.Switch(nc=True).down().at(ind.end).to((x + 2, 2)).color(RED))
    ground(d, sw.end)
    text(d, "S", (x + 2.65, 3.4), color=RED)
    c = d.add(elm.Capacitor().down().at((x + 4.1, 5.2)).to((x + 4.1, 2)))
    ground(d, c.end)
    text(d, "COUT", (x + 4.75, 3.5), fontsize=8)


def build_drawing():
    d = drawing(fontsize=9)
    linear(d, 0.4)
    buck(d, 6.2)
    boost(d, 12.2)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
