#!/usr/bin/env python3
"""Render the breadboard layout for the "Your First LED Circuit" lab.

The hole positions drawn here are the same ones the lab's build steps name, so
a student can hold the picture beside the page and match them one for one. If
the steps ever change, change them here too - a layout picture that disagrees
with the instructions is worse than no picture at all.

Layout:
    red jumper    + rail  ->  a3
    R1 220 ohm    b3      ->  b9
    D1 red LED    anode c9, cathode c10
    black jumper  a10     ->  - rail

Column 3's five holes (a3-e3) are one connected group, so the red jumper and the
resistor's left leg meet there without touching. Same for column 9, where the
resistor's right leg meets the LED's anode, and column 10, where the LED's
cathode meets the black jumper.

The two jumpers sit in different columns so their vertical runs never cross the
components, and the callouts are placed off the board - in the unused bottom
half and above the top rail - so no label sits on top of a hole a student is
trying to count.

Usage:
    python3 breadboard-layout.py breadboard-layout.png
"""

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyBboxPatch, Rectangle

COLS = 30
ROWS_TOP = ["a", "b", "c", "d", "e"]
ROWS_BOT = ["f", "g", "h", "i", "j"]

PITCH = 1.0
Y = {}
for i, r in enumerate(ROWS_TOP):
    Y[r] = 9.0 - i * PITCH
for i, r in enumerate(ROWS_BOT):
    Y[r] = 3.0 - i * PITCH
Y_PLUS_TOP, Y_MINUS_TOP = 11.6, 10.6
Y_PLUS_BOT, Y_MINUS_BOT = -2.6, -3.6

INK = "#17202a"
BOARD = "#f2f2ef"
HOLE = "#3b3b3b"
RED = "#c62828"
BLUE = "#1565c0"
GREEN = "#2e7d32"
GRAY = "#5f6b73"
TAN = "#e3c98f"


def col_x(c):
    return c * PITCH


def draw_board(ax):
    ax.add_patch(FancyBboxPatch(
        (col_x(1) - 1.4, Y_PLUS_BOT - 1.1), COLS * PITCH + 1.6, 16.6,
        boxstyle="round,pad=0.3", facecolor=BOARD, edgecolor="#c8cdd1", linewidth=1.4))

    # Centre channel - the gap that isolates the top half from the bottom half.
    # It must sit strictly between rows e and f; overlapping row e would tell a
    # student that row e is dead, which is the opposite of true.
    ax.add_patch(Rectangle((col_x(1) - 1.0, Y["f"] + 0.5), COLS * PITCH + 0.8,
                           Y["e"] - Y["f"] - 1.0, facecolor="#e2e2de", edgecolor="none"))

    for rail_y, colour, sign in ((Y_PLUS_TOP, RED, "+"), (Y_MINUS_TOP, BLUE, "−"),
                                 (Y_PLUS_BOT, RED, "+"), (Y_MINUS_BOT, BLUE, "−")):
        ax.plot([col_x(1) - 0.8, col_x(COLS) + 0.8], [rail_y + 0.62] * 2,
                color=colour, linewidth=1.6, zorder=1)
        for c in range(1, COLS + 1):
            ax.add_patch(Circle((col_x(c), rail_y), 0.19, facecolor=HOLE, edgecolor="none"))
        for x in (col_x(1) - 1.05, col_x(COLS) + 1.05):
            ax.text(x, rail_y, sign, color=colour, fontsize=11, ha="center", va="center",
                    fontweight="bold")

    for row in ROWS_TOP + ROWS_BOT:
        for c in range(1, COLS + 1):
            ax.add_patch(Circle((col_x(c), Y[row]), 0.19, facecolor=HOLE, edgecolor="none"))
        for x in (col_x(1) - 1.05, col_x(COLS) + 1.05):
            ax.text(x, Y[row], row, color=GRAY, fontsize=9, ha="center", va="center")

    # Row letters and column numbers are what the build steps refer to, so they
    # are drawn above the wires with an opaque halo - a jumper passing over a
    # column number must not be able to hide it.
    halo = dict(boxstyle="round,pad=0.12", facecolor="white", edgecolor="none", alpha=0.95)
    for c in range(1, COLS + 1, 5):
        for y in (Y["a"] + 0.8, Y["j"] - 0.8):
            ax.text(col_x(c), y, str(c), color=GRAY, fontsize=8.5, ha="center",
                    va="center", bbox=halo, zorder=11)


def jumper(ax, xy1, xy2, colour, bow=0.0):
    """A jumper wire, drawn with the seated ends a student should check.

    `bow` pushes the middle of the run sideways. It matters when a wire passes a
    rail it does not connect to: drawn dead straight, the wire looks like it is
    plugged into every hole it crosses.
    """
    if bow:
        mx = (xy1[0] + xy2[0]) / 2 + bow
        my = (xy1[1] + xy2[1]) / 2
        xs, ys = [xy1[0], mx, xy2[0]], [xy1[1], my, xy2[1]]
    else:
        xs, ys = [xy1[0], xy2[0]], [xy1[1], xy2[1]]
    ax.plot(xs, ys, color=colour, linewidth=3.4, solid_capstyle="round",
            solid_joinstyle="round", zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.26, facecolor=colour, edgecolor="white",
                            linewidth=0.9, zorder=5))


def resistor(ax, xy1, xy2):
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.2, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = xy1[1]
    ax.add_patch(FancyBboxPatch((cx - 1.5, cy - 0.42), 3.0, 0.84,
                                boxstyle="round,pad=0.06", facecolor=TAN,
                                edgecolor="#b99b58", linewidth=0.9, zorder=6))
    # red-red-brown-gold = 220 ohm, 5%
    for dx, colour in ((-0.95, RED), (-0.5, RED), (-0.05, "#6d4c1f"), (0.95, "#d4af37")):
        ax.add_patch(Rectangle((cx + dx, cy - 0.42), 0.24, 0.84,
                               facecolor=colour, edgecolor="none", zorder=7))


def led(ax, anode_xy, cathode_xy):
    """Top-down 5 mm LED: the body sits over its two holes, flat edge on the K side."""
    cx = (anode_xy[0] + cathode_xy[0]) / 2
    cy = anode_xy[1]
    for p in (anode_xy, cathode_xy):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    ax.add_patch(Circle((cx, cy), 0.7, facecolor="#ef5350", edgecolor="#b71c1c",
                        linewidth=1.1, zorder=6))
    # The flat edge on the rim marks the cathode side
    ax.plot([cathode_xy[0] + 0.3, cathode_xy[0] + 0.3], [cy - 0.42, cy + 0.42],
            color="#7f1d1d", linewidth=3.0, zorder=7)
    ax.text(anode_xy[0] - 0.72, cy, "A", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)
    ax.text(cathode_xy[0] + 0.85, cy, "K", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)


def callout(ax, text, xy, xytext, colour):
    """Labels get an opaque backing so they stay readable over the hole grid."""
    ax.annotate(text, xy=xy, xytext=xytext, color=colour, fontsize=10,
                ha="center", va="center", zorder=10,
                bbox=dict(boxstyle="round,pad=0.34", facecolor="white",
                          edgecolor="none", alpha=0.94),
                arrowprops=dict(arrowstyle="->", color=colour, linewidth=1.4,
                                shrinkA=2, shrinkB=6))


def build(output):
    fig, ax = plt.subplots(figsize=(13.5, 7.2))

    draw_board(ax)

    a3 = (col_x(3), Y["a"])
    b3, b10 = (col_x(3), Y["b"]), (col_x(10), Y["b"])
    c10, c11 = (col_x(10), Y["c"]), (col_x(11), Y["c"])
    a11 = (col_x(11), Y["a"])

    # The red jumper crosses the - rail on its way down, so it is bowed aside.
    jumper(ax, (col_x(3), Y_PLUS_TOP), a3, RED, bow=0.42)
    resistor(ax, b3, b10)
    led(ax, c10, c11)
    jumper(ax, a11, (col_x(11), Y_MINUS_TOP), "#37474f")

    # Callouts live off the board: the jumpers above the top rail, the two
    # components below in the half of the board this lab never uses.
    callout(ax, "red jumper\n+ rail → a3", (col_x(3.4), (Y_PLUS_TOP + Y["a"]) / 2),
            (col_x(2.6), Y_PLUS_TOP + 2.8), RED)
    callout(ax, "black jumper\na11 → − rail", (col_x(11), (Y_MINUS_TOP + Y["a"]) / 2),
            (col_x(13.5), Y_PLUS_TOP + 2.8), "#37474f")
    callout(ax, "R1   220 Ω   red-red-brown\nb3 → b10",
            (col_x(6.5), Y["b"] - 0.55), (col_x(6.0), Y["g"] + 0.3), BLUE)
    callout(ax, "D1  red LED\nlong leg (A) in c10\nshort leg (K) in c11",
            (col_x(10.5), Y["c"] - 0.85), (col_x(16.0), Y["h"] + 0.5), RED)

    ax.text(col_x(25.0), Y["g"] + 0.3,
            "The bottom half of the board\nis not used in this lab.",
            color=GRAY, fontsize=10, ha="center", va="center",
            bbox=dict(boxstyle="round,pad=0.34", facecolor="white",
                      edgecolor="none", alpha=0.94), zorder=10)
    ax.text(col_x(15.5), Y_PLUS_TOP + 4.6,
            "Your First LED Circuit — breadboard layout",
            color=INK, fontsize=15, ha="center", va="center", fontweight="bold")

    ax.set_xlim(col_x(1) - 3.0, col_x(COLS) + 3.0)
    ax.set_ylim(Y_MINUS_BOT - 1.6, Y_PLUS_TOP + 5.6)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout()
    fig.savefig(output, dpi=150, facecolor="white")
    print(f"wrote {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="output .png path")
    build(parser.parse_args().output)
