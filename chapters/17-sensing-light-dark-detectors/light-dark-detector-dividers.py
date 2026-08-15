#!/usr/bin/env python3
"""Render light- and dark-detector photoresistor dividers.

Prompt:
    Draw matched side-by-side 5 V photoresistor voltage dividers. In the light
    detector, place the LDR above the output node and a 10 kΩ resistor below,
    so brighter light raises the voltage sent to an NPN transistor base. In
    the dark detector, place the 10 kΩ resistor above and the LDR below, so
    darker conditions raise the transistor-base voltage. Label supply, ground,
    LDR, fixed resistor, output node, direction of voltage change, and the
    approximately 0.7 V transistor threshold. Use vertical branches and clear
    labels with no crossings.

Topology: light panel +5V->LDR1->LIGHT_OUT->R1->GND; dark panel
+5V->R2->DARK_OUT->LDR2->GND. Each OUT feeds a high-impedance NPN base.
Assumptions: Both fixed resistors are 10 kΩ and the transistor stage is shown
as a labeled input terminal rather than a complete output driver.
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


def panel(d, x: float, *, ldr_top: bool) -> None:
    top_y, node_y, bottom_y = 7.2, 4.2, 1.0
    top_cls = elm.Photoresistor if ldr_top else elm.Resistor
    bottom_cls = elm.Resistor if ldr_top else elm.Photoresistor
    top = d.add(
        top_cls().down().at((x, top_y)).to((x, node_y)).color(BLUE if ldr_top else INK)
    )
    bottom = d.add(
        bottom_cls()
        .down()
        .at((x, node_y))
        .to((x, bottom_y))
        .color(INK if ldr_top else ORANGE)
    )
    ground(d, bottom.end)
    dot(d, top.end)
    wire(d, (x, top_y), (x, top_y + 0.45), color=RED)
    text(d, "+5 V", (x, top_y + 0.80), color=RED, fontsize=12)
    wire(d, top.end, (x + 2.0, node_y))
    dot(d, (x + 2.0, node_y), open=True, color=GREEN)
    text(
        d,
        "TO NPN BASE\n≈0.7 V threshold",
        (x + 2.0, node_y + 0.65),
        color=GREEN,
        fontsize=9,
    )
    if ldr_top:
        text(d, "LDR1\nless R in light", (x - 1.25, 5.75), color=BLUE, fontsize=9)
        text(d, "R1\n10 kΩ", (x - 1.05, 2.55), fontsize=9)
        text(d, "LIGHT OUT", (x + 0.85, node_y - 0.40), color=BLUE, fontsize=9)
        arrow(d, (x + 0.45, 4.75), (x + 0.45, 5.75), color=BLUE)
        text(d, "brighter → VOUT rises", (x, 0.15), color=BLUE, fontsize=10)
    else:
        text(d, "R2\n10 kΩ", (x - 1.05, 5.75), fontsize=9)
        text(d, "LDR2\nmore R in dark", (x - 1.25, 2.55), color=ORANGE, fontsize=9)
        text(d, "DARK OUT", (x + 0.85, node_y - 0.40), color=ORANGE, fontsize=9)
        arrow(d, (x + 0.45, 4.75), (x + 0.45, 5.75), color=ORANGE)
        text(d, "darker → VOUT rises", (x, 0.15), color=ORANGE, fontsize=10)


def build_drawing():
    d = drawing()
    text(d, "LIGHT DETECTOR", (3.6, 8.25), color=BLUE, fontsize=13)
    text(d, "DARK DETECTOR", (10.2, 8.25), color=ORANGE, fontsize=13)
    panel(d, 3.0, ldr_top=True)
    panel(d, 9.6, ldr_top=False)
    wire(d, (6.6, 7.85), (6.6, 0.65), color="#c8cdd1", ls="--")
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
