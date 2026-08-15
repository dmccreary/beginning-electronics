#!/usr/bin/env python3
"""Render a transistor inverter and derived NAND and NOR gates.

Prompt:
    Draw a complete one-transistor NOT gate with +5 V, 10 kΩ collector pull-up,
    NPN transistor, 1 kΩ base resistor, input, output, and ground. Beside it,
    show compact block-level signal derivations AND followed by NOT equals
    NAND, and OR followed by NOT equals NOR. Label A, B, intermediate nodes,
    outputs, and inversion bubbles so the later truth tables map to signal flow.

Topology: inverter +5V->RC->OUT->Q1 collector, emitter->GND, IN->RB->base.
Derived blocks: NAND=NOT(AND(A,B)); NOR=NOT(OR(A,B)).
Assumptions: Logic blocks omit transistor internals intentionally.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
import schemdraw.logic as logic
from docs.schematic_utils import (
    BLUE,
    GREEN,
    INK,
    ORANGE,
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
    text(d, "TRANSISTOR NOT", (3.1, 7.2), color=BLUE, fontsize=12)
    q = d.add(elm.BjtNpn(circle=True).at((4.0, 2.5)))
    ground(d, q.emitter)
    rc = d.add(elm.Resistor().down().at((q.collector[0], 6.2)).to(q.collector))
    wire(d, (q.collector[0], 6.2), (q.collector[0], 6.6), color=RED)
    text(d, "+5 V", (q.collector[0], 7.0), color=RED)
    rb = d.add(elm.Resistor().right().at((0.6, q.base[1])).to(q.base))
    text(d, "IN", (0.35, q.base[1]), color=BLUE)
    text(d, "RB 1 kΩ", (2.2, q.base[1] - 0.55), fontsize=8)
    text(d, "RC 10 kΩ", (4.9, 5.1), fontsize=8)
    dot(d, q.collector, color=GREEN)
    wire(d, q.collector, (5.5, q.collector[1]), color=GREEN)
    text(d, "OUT = NOT(IN)", (6.2, q.collector[1]), color=GREEN, fontsize=9)
    text(d, "DERIVED GATES", (10.8, 7.2), color=ORANGE, fontsize=12)
    a = d.add(logic.And(inputs=2).right().at((8.0, 5.2)))
    n1 = d.add(logic.Not().right().at((10.4, 5.2)))
    wire(d, a.out, n1.in1)
    text(d, "A", (7.3, 5.65))
    text(d, "B", (7.3, 4.75))
    text(d, "A·B", (9.65, 5.65), fontsize=8)
    text(d, "NAND = ¬(A·B)", (13.5, 5.2), color=ORANGE, fontsize=9)
    wire(d, n1.out, (12.6, n1.out[1]), color=ORANGE)
    o = d.add(logic.Or(inputs=2).right().at((8.0, 2.5)))
    n2 = d.add(logic.Not().right().at((10.4, 2.5)))
    wire(d, o.out, n2.in1)
    text(d, "A", (7.3, 2.95))
    text(d, "B", (7.3, 2.05))
    text(d, "A+B", (9.65, 2.95), fontsize=8)
    text(d, "NOR = ¬(A+B)", (13.5, 2.5), color=ORANGE, fontsize=9)
    wire(d, n2.out, (12.6, n2.out[1]), color=ORANGE)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
