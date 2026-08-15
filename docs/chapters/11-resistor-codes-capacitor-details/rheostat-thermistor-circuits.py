#!/usr/bin/env python3
"""Render safe rheostat wiring and an NTC thermistor divider.

Prompt:
    Draw two side-by-side application circuits. First show a potentiometer used
    safely as a two-terminal rheostat by tying its wiper to one outer terminal,
    leaving no floating wiper failure, and placing it in series with a load.
    Second show a 5 V voltage divider with a 10 kΩ fixed resistor above the
    output node and an NTC thermistor below it, so warming the NTC lowers its
    resistance and lowers VOUT. Label all three potentiometer terminals, the
    tied connection, the thermistor output, and current or voltage behavior.

Topology: rheostat +5V->RHEO(start)->RHEO(end+tied wiper)->load->GND;
thermistor +5V->R1->TEMP_OUT->TH1(NTC)->GND.
Assumptions: The rheostat load is a generic low-current lamp and the NTC's
nominal value is 10 kΩ at 25°C.
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
    text(d, "SAFE TWO-TERMINAL RHEOSTAT", (3.8, 7.6), color=BLUE, fontsize=12)
    pot = d.add(elm.Potentiometer().right().at((1.6, 4.8)).length(3.2).color(BLUE))
    wire(d, (0.8, 4.8), pot.start, color=RED)
    text(d, "+5 V", (0.85, 5.35), color=RED, fontsize=11)
    wire(d, pot.tap, (pot.tap[0], 6.1), color=BLUE)
    wire(d, (pot.tap[0], 6.1), (pot.end[0], 6.1), color=BLUE)
    wire(d, (pot.end[0], 6.1), pot.end, color=BLUE)
    lamp = d.add(elm.Lamp2().down().at((6.2, 4.8)).to((6.2, 1.4)).color(INK))
    wire(d, pot.end, lamp.start)
    ground(d, lamp.end)
    text(d, "terminal 1", (1.5, 4.15), fontsize=8)
    text(d, "terminal 3", (4.8, 4.15), fontsize=8)
    text(
        d, "terminal 2 wiper\ntied to terminal 3", (4.2, 6.65), color=BLUE, fontsize=8.5
    )
    text(d, "LOAD", (7.05, 3.1), fontsize=9)
    arrow(d, (1.0, 5.45), (2.0, 5.45), color=BLUE)
    text(d, "adjust resistance → adjust current", (3.4, 0.35), color=BLUE, fontsize=9)

    text(d, "NTC THERMISTOR DIVIDER", (11.3, 7.8), color=ORANGE, fontsize=12)
    x, top_y, node_y = 10.4, 6.55, 4.0
    r1 = d.add(elm.Resistor().down().at((x, top_y)).to((x, node_y)).color(INK))
    ntc = d.add(elm.Thermistor().down().at(r1.end).to((x, 1.2)).color(ORANGE))
    ground(d, ntc.end)
    wire(d, (x, top_y), (x, top_y + 0.4), color=RED)
    text(d, "+5 V", (x, top_y + 0.62), color=RED, fontsize=11)
    dot(d, r1.end)
    wire(d, r1.end, (13.2, node_y), color=GREEN)
    dot(d, (13.2, node_y), open=True, color=GREEN)
    text(d, "R1\n10 kΩ", (9.2, 5.45), fontsize=9)
    text(d, "TH1  NTC\n10 kΩ @ 25°C", (8.8, 2.55), color=ORANGE, fontsize=9)
    text(d, "TEMP OUT", (12.2, node_y + 0.45), color=GREEN, fontsize=9)
    text(d, "warmer → RNTC falls → VOUT falls", (11.2, 0.35), color=ORANGE, fontsize=9)
    wire(d, (7.3, 7.0), (7.3, 0.8), color="#c8cdd1", ls="--")
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
