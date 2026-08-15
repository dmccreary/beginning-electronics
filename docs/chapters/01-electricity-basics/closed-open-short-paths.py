#!/usr/bin/env python3
"""Render closed, open, and short circuit paths.

Prompt:
    Draw three matched panels using the same 3 V battery and lamp. CLOSED has
    a complete loop and normal current through the lamp. OPEN has an open
    switch and no current. SHORT has a low-resistance wire bypassing the lamp;
    highlight the dangerous high-current path in red. Label each state and
    keep all conductors orthogonal with no crossings.

Topology: closed battery->closed switch->lamp->return; open battery->open
switch->lamp->return; short battery->wire bypass->return with lamp bypassed.
Assumptions: The battery is an ideal 3 V teaching source.
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
    arrow,
    drawing,
    save_cli,
    text,
    wire,
)


def panel(d, x, mode, color):
    text(d, mode.upper(), (x + 1.8, 6.7), color=color, fontsize=12)
    bat = d.add(elm.BatteryCell().up().at((x, 1.5)).to((x, 4.9)).color(INK))
    sw = d.add(
        elm.Switch(nc=mode == "closed")
        .right()
        .at(bat.end)
        .to((x + 2.0, 4.9))
        .color(color if mode != "closed" else INK)
    )
    lamp = d.add(elm.Lamp2().down().at((x + 3.6, 4.9)).to((x + 3.6, 1.5)).color(INK))
    wire(d, sw.end, lamp.start)
    wire(d, lamp.end, bat.start)
    text(d, "3 V", (x - 0.55, 3.2), fontsize=8.5)
    text(d, "L1", (x + 4.2, 3.2), fontsize=8.5)
    if mode == "closed":
        arrow(d, (x + 0.4, 5.65), (x + 3.1, 5.65), color=GREEN)
        text(d, "normal current", (x + 1.8, 0.65), color=GREEN, fontsize=8.5)
    elif mode == "open":
        text(d, "I = 0", (x + 1.8, 5.65), color=BLUE, fontsize=9)
        text(d, "broken path", (x + 1.8, 0.65), color=BLUE, fontsize=8.5)
    else:
        wire(d, (x + 0.05, 4.3), (x + 0.05, 1.0), color=RED, lw=3)
        wire(d, (x + 0.05, 1.0), (x + 3.55, 1.0), color=RED, lw=3)
        wire(d, (x + 3.55, 1.0), (x + 3.55, 4.3), color=RED, lw=3)
        arrow(d, (x + 0.4, 0.55), (x + 3.2, 0.55), color=RED)
        text(d, "DANGER: very high current", (x + 1.8, 0.1), color=RED, fontsize=8.5)
        text(d, "lamp bypassed", (x + 2.2, 3.8), color=RED, fontsize=8)


def build_drawing():
    d = drawing()
    panel(d, 1.0, "closed", GREEN)
    panel(d, 6.4, "open", BLUE)
    panel(d, 11.8, "short", RED)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
