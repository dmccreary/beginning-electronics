#!/usr/bin/env python3
"""Render the "what stops the fault current" schematic.

Prompt:
    Draw the same breadboard power chain with a dead short across the power
    rails instead of a working circuit, and label the three things that limit
    the fault current in the order they act: the PTC fuse tripping at about one
    amp, the regulator's internal current limit of 0.9 to 1.5 amps, and the
    regulator's thermal shutdown at 165 degrees C. Show the fault current
    looping around the circuit.

Topology: adapter -> MB102 -> F1(PTC) -> + rail -> SHORT -> - rail -> MB102 GND.
Assumptions: figures are from the AMS1117 datasheet (current limit 900-1500 mA,
thermal shutdown at 165 C junction, 1.2 W maximum dissipation in SOT-223).

Usage:
    python3 short-circuit-protection.py short-circuit-protection.png
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
import schemdraw.elements as elm
from docs.schematic_utils import (
    GRAY,
    GREEN,
    INK,
    ORANGE,
    PURPLE,
    RED,
    arrow,
    dot,
    drawing,
    save_cli,
    text,
    wire,
)

BOX_L, BOX_R = 0.6, 4.0
BOX_B, BOX_T = 1.4, 5.8

Y_POS = 5.0
Y_NEG = 2.0
X_FUSE_L, X_FUSE_R = 5.9, 7.9
X_SHORT = 12.0


def build_drawing():
    d = drawing()

    # ---- The regulator module ----
    d.add(elm.Rect(corner1=(BOX_L, BOX_B), corner2=(BOX_R, BOX_T)).color(GRAY))
    text(d, "MB102", ((BOX_L + BOX_R) / 2, 4.9), color=INK, fontsize=13)
    text(d, "AMS1117-5.0 inside", ((BOX_L + BOX_R) / 2, 4.35), color=GRAY, fontsize=9)

    text(d, "② current limit", ((BOX_L + BOX_R) / 2, 3.55), color=PURPLE, fontsize=10)
    text(d, "0.9 – 1.5 A", ((BOX_L + BOX_R) / 2, 3.1), color=PURPLE, fontsize=10)
    text(d, "③ thermal shutdown", ((BOX_L + BOX_R) / 2, 2.5), color=PURPLE, fontsize=10)
    text(d, "at 165 °C, self-resetting", ((BOX_L + BOX_R) / 2, 2.05), color=PURPLE, fontsize=9)

    # ---- Input ----
    arrow(d, (BOX_L - 2.3, Y_POS), (BOX_L, Y_POS), color=ORANGE)
    text(d, "7.5–9 V DC", (BOX_L - 2.3, Y_POS + 0.5), color=ORANGE, fontsize=10)

    # ---- +5 V rail through the fuse ----
    dot(d, (BOX_R, Y_POS))
    wire(d, (BOX_R, Y_POS), (X_FUSE_L, Y_POS), color=RED)
    fuse = d.add(elm.Fuse().at((X_FUSE_L, Y_POS)).to((X_FUSE_R, Y_POS)).color(GREEN))
    text(d, "① F1 trips at about 1 A", ((X_FUSE_L + X_FUSE_R) / 2, Y_POS + 1.5), color=GREEN, fontsize=11)
    text(d, "goes high-resistance in milliseconds,", ((X_FUSE_L + X_FUSE_R) / 2, Y_POS + 1.02), color=GREEN, fontsize=9)
    text(d, "resets by itself once it cools", ((X_FUSE_L + X_FUSE_R) / 2, Y_POS + 0.6), color=GREEN, fontsize=9)

    wire(d, fuse.end, (X_SHORT, Y_POS), color=RED)
    dot(d, (X_SHORT, Y_POS))

    # ---- The fault: a dead short straight across the rails ----
    wire(d, (X_SHORT, Y_POS), (X_SHORT, Y_NEG), color=RED, lw=4.5)
    text(d, "SHORT", (X_SHORT + 1.5, 3.9), color=RED, fontsize=13)
    text(d, "a stray jumper", (X_SHORT + 1.6, 3.4), color=RED, fontsize=9)
    text(d, "across the rails", (X_SHORT + 1.63, 3.0), color=RED, fontsize=9)
    dot(d, (X_SHORT, Y_NEG))

    # ---- Return ----
    wire(d, (X_SHORT, Y_NEG), (BOX_R, Y_NEG), color=INK)
    dot(d, (BOX_R, Y_NEG))

    # ---- Fault current loop ----
    arrow(d, (8.6, Y_POS - 0.55), (10.9, Y_POS - 0.55), color=RED)
    text(d, "fault current", (9.75, Y_POS - 1.05), color=RED, fontsize=9.5)

    # ---- The point of the whole diagram ----
    text(
        d,
        "Without ①, stages ② and ③ must swallow the entire fault:",
        (7.4, 0.95),
        color=INK,
        fontsize=10.5,
    )
    text(
        d,
        "9 V × 1.1 A ≈ 10 W, inside a package rated for 1.2 W.",
        (7.4, 0.48),
        color=INK,
        fontsize=10.5,
    )

    return d


if __name__ == "__main__":
    save_cli(build_drawing, __doc__)
