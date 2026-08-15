#!/usr/bin/env python3
"""Render a cross-coupled NAND RS latch.

Prompt:
    Draw two cross-coupled NAND gates as an active-low RS latch. Label the
    external inputs S-bar (SET) and R-bar (RESET), outputs Q and Q-bar, and
    both feedback paths. Route one feedback path clearly above and the other
    below the gates with orthogonal segments, junction dots only at true joins,
    and no ambiguous crossings. Note that S-bar=R-bar=1 holds state.

Topology: upper NAND output Q feeds lower NAND feedback input; lower NAND
output Q-bar feeds upper NAND feedback input.
Assumptions: The chapter's S/R names are shown with bars because NAND-latch
inputs are active LOW.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.logic as logic
from docs.schematic_utils import BLUE, GREEN, INK, ORANGE, drawing, save_cli, text, wire


def build_drawing():
    d = drawing()
    top = d.add(logic.Nand(inputs=2).right().at((5, 5.2)))
    bot = d.add(logic.Nand(inputs=2).right().at((5, 2.3)))
    wire(d, (2.2, top.in1[1]), top.in1, color=BLUE)
    wire(d, (2.2, bot.in2[1]), bot.in2, color=ORANGE)
    text(d, "S̅  SET (active LOW)", (2.25, top.in1[1] + 0.6), color=BLUE, fontsize=9)
    text(
        d, "R̅  RESET (active LOW)", (2.25, bot.in2[1] + 0.6), color=ORANGE, fontsize=9
    )
    wire(d, top.out, (9, top.out[1]), color=GREEN)
    wire(d, bot.out, (9, bot.out[1]), color=GREEN)
    text(d, "Q", (9.5, top.out[1]), color=GREEN, fontsize=12)
    text(d, "Q̅", (9.5, bot.out[1]), color=GREEN, fontsize=12)
    wire(d, (8.2, top.out[1]), (8.2, 6.7), color=BLUE)
    wire(d, (8.2, 6.7), (4.2, 6.7), color=BLUE)
    wire(d, (4.2, 6.7), (4.2, bot.in1[1]), color=BLUE)
    wire(d, (4.2, bot.in1[1]), bot.in1, color=BLUE)
    wire(d, (8.2, bot.out[1]), (8.2, 0.8), color=ORANGE)
    wire(d, (8.2, 0.8), (3.7, 0.8), color=ORANGE)
    wire(d, (3.7, 0.8), (3.7, top.in2[1]), color=ORANGE)
    wire(d, (3.7, top.in2[1]), top.in2, color=ORANGE)
    text(d, "Q feedback", (6.1, 6.95), color=BLUE, fontsize=8.5)
    text(d, "Q̅ feedback", (6.0, 0.45), color=ORANGE, fontsize=8.5)
    text(d, "S̅ = R̅ = 1  →  HOLD previous state", (5.7, 7.75), fontsize=10)
    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
