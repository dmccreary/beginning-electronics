#!/usr/bin/env python3
"""Render active and passive buzzer driver circuits.

Prompt:
    Draw side-by-side buzzer circuits with vertical buzzer symbols and straight
    top/bottom connections. ACTIVE BUZZER uses switched DC and produces its
    own tone. PASSIVE PIEZO uses a 555 or square-wave source and requires an
    alternating signal. Mark positive polarity, driver input, ground, and the
    distinction between on/off control and tone frequency. Avoid any diagonal
    wire crossing a symbol.

Topology: active +5V->active buzzer->low-side switch->GND; passive square-wave
OUT->passive piezo->GND.
Assumptions: Both are small low-current devices within the source rating.
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
    drawing,
    ground,
    save_cli,
    text,
    wire,
)


def build_drawing():
    d = drawing()
    text(d, "ACTIVE BUZZER", (3.2, 7.2), color=BLUE, fontsize=12)
    wire(d, (3.2, 6.4), (3.2, 5.8), color=RED)
    text(d, "+5 V", (3.2, 6.85), color=RED)
    bz = d.add(elm.Speaker().down().at((3.2, 5.8)).color(BLUE))
    sw = d.add(elm.Switch(nc=True).down().at(bz.in2).to((bz.in2[0], 1.5)))
    ground(d, sw.end)
    text(d, "BZ1  +", (4.2, 4.65), color=BLUE)
    text(d, "DC ON/OFF", (1.4, 2.5), color=BLUE, fontsize=9)
    text(d, "internal oscillator makes tone", (3.2, 0.55), color=BLUE, fontsize=9)
    text(d, "PASSIVE PIEZO", (9.8, 7.2), color=ORANGE, fontsize=12)
    wire(d, (9.8, 6.0), (9.8, 5.5), color=ORANGE)
    text(d, "555 / square wave OUT", (9.8, 6.55), color=ORANGE, fontsize=9)
    p = d.add(elm.Speaker().down().at((9.8, 5.5)).color(ORANGE))
    ground(d, p.in2)
    text(d, "BZ2  +", (10.8, 4.0), color=ORANGE)
    text(d, "frequency sets pitch", (9.8, 0.55), color=ORANGE, fontsize=9)
    text(d, "alternating drive", (7.6, 3.8), color=GREEN, fontsize=9)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
