#!/usr/bin/env python3
"""Render the breadboard layout for the "Hunt Down a Hidden Fault" lab.

The seven test points TP0-TP6 marked here are the same ones the lab's Part A
build steps name and the same ones Chapter 21's Half-Split Fault Finder
MicroSim uses, so a student can hold this picture beside the real board (or
the sim) and match every hole one for one.

Layout (all six stages alternate rows b/c so no two legs ever share a hole):
    red jumper    + rail  ->  a2                       (TP0)
    SW1           b2      ->  b6                        (TP0 -> TP1)
    R1  330 ohm   c6      ->  c10                        (TP1 -> TP2)
    jumper wire   b10     ->  b14   (the R1-R2 wire)     (TP2 -> TP3)
    R2  220 ohm   c14     ->  c18                        (TP3 -> TP4)
    D1  diode     b18     ->  b22   anode(18) cathode(22) (TP4 -> TP5)
    D2  red LED   c22     ->  c26   anode(22) cathode(26) (TP5 -> TP6)
    black jumper  b26     ->  - rail                     (TP6)

Each test point sits at row d, directly above/below the two component legs
that share its column, so a student finds TPn by eye without counting holes.

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
ORANGE = "#d35400"
PURPLE = "#6a4c93"
DIODE_BODY = "#4a4f55"


def col_x(c):
    return c * PITCH


def draw_board(ax):
    ax.add_patch(FancyBboxPatch(
        (col_x(1) - 1.4, Y_PLUS_BOT - 1.1), COLS * PITCH + 1.6, 16.6,
        boxstyle="round,pad=0.3", facecolor=BOARD, edgecolor="#c8cdd1", linewidth=1.4))

    # Centre channel - the gap that isolates the top half from the bottom half.
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

    halo = dict(boxstyle="round,pad=0.12", facecolor="white", edgecolor="none", alpha=0.95)
    for c in range(1, COLS + 1, 5):
        for y in (Y["a"] + 0.8, Y["j"] - 0.8):
            ax.text(col_x(c), y, str(c), color=GRAY, fontsize=8.5, ha="center",
                    va="center", bbox=halo, zorder=11)


def jumper(ax, xy1, xy2, colour, bow=0.0):
    """A jumper wire, drawn with the seated ends a student should check."""
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


def resistor(ax, xy1, xy2, bands):
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.2, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = xy1[1]
    ax.add_patch(FancyBboxPatch((cx - 1.5, cy - 0.42), 3.0, 0.84,
                                boxstyle="round,pad=0.06", facecolor=TAN,
                                edgecolor="#b99b58", linewidth=0.9, zorder=6))
    for dx, colour in zip((-0.95, -0.5, -0.05, 0.95), bands):
        ax.add_patch(Rectangle((cx + dx, cy - 0.42), 0.24, 0.84,
                               facecolor=colour, edgecolor="none", zorder=7))


def switch_body(ax, xy1, xy2):
    """A slide switch bridging two columns: a small body with a toggle lever."""
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.2, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = xy1[1]
    ax.add_patch(FancyBboxPatch((cx - 1.6, cy - 0.4), 3.2, 0.8,
                                boxstyle="round,pad=0.05", facecolor="#e8eaf0",
                                edgecolor=BLUE, linewidth=1.1, zorder=6))
    # Toggle lever, drawn slid to the "on" (right / closed) side
    ax.plot([cx - 0.55, cx + 0.65], [cy, cy + 0.05], color=BLUE, linewidth=3.4,
            solid_capstyle="round", zorder=7)
    ax.add_patch(Circle((cx + 0.65, cy + 0.05), 0.14, facecolor=BLUE, edgecolor="none", zorder=8))


def diode_body(ax, anode_xy, cathode_xy, band_color=RED, glow=False):
    """A banded cylindrical diode body, same visual family as the LED helper.

    The dark band sits on the cathode side, matching the printed stripe on a
    real 1N4148/1N4001 - and matching the LED's flat-edge convention for
    marking the same lead on the same side of the drawing.
    """
    cx = (anode_xy[0] + cathode_xy[0]) / 2
    cy = anode_xy[1]
    for p in (anode_xy, cathode_xy):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    ax.add_patch(FancyBboxPatch((cx - 1.05, cy - 0.36), 2.1, 0.72,
                                boxstyle="round,pad=0.02", facecolor=DIODE_BODY,
                                edgecolor="#20242a", linewidth=1.0, zorder=6))
    band_x = cx + 0.65 if cathode_xy[0] > anode_xy[0] else cx - 0.65
    ax.add_patch(Rectangle((band_x - 0.12, cy - 0.36), 0.24, 0.72,
                           facecolor=band_color, edgecolor="none", zorder=7))
    ax.text(anode_xy[0] - 0.72, cy, "A", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)
    ax.text(cathode_xy[0] + 0.72, cy, "K", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)


def led(ax, anode_xy, cathode_xy):
    """Top-down 5 mm LED: the body sits over its two holes, flat edge on the K side."""
    cx = (anode_xy[0] + cathode_xy[0]) / 2
    cy = anode_xy[1]
    for p in (anode_xy, cathode_xy):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    ax.add_patch(Circle((cx, cy), 0.7, facecolor="#ef5350", edgecolor="#b71c1c",
                        linewidth=1.1, zorder=6))
    ax.plot([cathode_xy[0] - 0.3, cathode_xy[0] - 0.3], [cy - 0.42, cy + 0.42],
            color="#7f1d1d", linewidth=3.0, zorder=7)
    ax.text(anode_xy[0] - 0.72, cy, "A", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)
    ax.text(cathode_xy[0] + 0.72, cy, "K", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)


def callout(ax, text, xy, xytext, colour):
    """Labels get an opaque backing so they stay readable over the hole grid."""
    ax.annotate(text, xy=xy, xytext=xytext, color=colour, fontsize=9.5,
                ha="center", va="center", zorder=10,
                bbox=dict(boxstyle="round,pad=0.32", facecolor="white",
                          edgecolor=colour, linewidth=0.6, alpha=0.96),
                arrowprops=dict(arrowstyle="->", color=colour, linewidth=1.3,
                                shrinkA=2, shrinkB=6))


def test_point(ax, col, label):
    """A test point marker: an open ring at row d, with its TP label in the
    unused centre channel directly below - the same spot a probe tip goes."""
    xy = (col_x(col), Y["d"])
    ax.add_patch(Circle(xy, 0.34, facecolor="none", edgecolor=PURPLE,
                        linewidth=2.4, zorder=9))
    ax.add_patch(Circle(xy, 0.1, facecolor=PURPLE, edgecolor="none", zorder=9))
    ax.text(col_x(col), 4.35, label, color=PURPLE, fontsize=10, ha="center",
            va="center", fontweight="bold", zorder=10,
            bbox=dict(boxstyle="round,pad=0.18", facecolor="white",
                      edgecolor=PURPLE, linewidth=0.6, alpha=0.96))


def build(output):
    fig, ax = plt.subplots(figsize=(17.5, 8.6))

    draw_board(ax)

    # Node columns for TP0 .. TP6
    C = {"TP0": 2, "TP1": 6, "TP2": 10, "TP3": 14, "TP4": 18, "TP5": 22, "TP6": 26}

    a2 = (col_x(C["TP0"]), Y["a"])
    b2, b6 = (col_x(C["TP0"]), Y["b"]), (col_x(C["TP1"]), Y["b"])
    c6, c10 = (col_x(C["TP1"]), Y["c"]), (col_x(C["TP2"]), Y["c"])
    b10, b14 = (col_x(C["TP2"]), Y["b"]), (col_x(C["TP3"]), Y["b"])
    c14, c18 = (col_x(C["TP3"]), Y["c"]), (col_x(C["TP4"]), Y["c"])
    b18, b22 = (col_x(C["TP4"]), Y["b"]), (col_x(C["TP5"]), Y["b"])
    c22, c26 = (col_x(C["TP5"]), Y["c"]), (col_x(C["TP6"]), Y["c"])
    b26 = (col_x(C["TP6"]), Y["b"])

    # Power in: red jumper from the + rail, bowed aside so it does not cross the − rail.
    jumper(ax, (col_x(C["TP0"]), Y_PLUS_TOP), a2, RED, bow=0.42)

    switch_body(ax, b2, b6)                       # SW1: TP0 -> TP1
    resistor(ax, c6, c10, (ORANGE, ORANGE, "#6d4c1f", "#d4af37"))  # R1 330R: orange-orange-brown
    jumper(ax, b10, b14, ORANGE)                   # the R1-R2 wire: TP2 -> TP3
    resistor(ax, c14, c18, (RED, RED, "#6d4c1f", "#d4af37"))      # R2 220R: red-red-brown
    diode_body(ax, b18, b22, band_color="#e0e0e0") # D1 diode: TP4 -> TP5
    led(ax, c22, c26)                              # D2 red LED: TP5 -> TP6

    # Ground return: black jumper from D2's cathode column back to the − rail.
    jumper(ax, b26, (col_x(C["TP6"]), Y_MINUS_TOP), "#37474f")

    # Bridge the LED cathode leg (row c) up to the jumper's leg (row b) - both
    # column 26, so this is a short same-column hop, not a real extra wire.
    ax.plot([col_x(C["TP6"]), col_x(C["TP6"])], [Y["c"] - 0.24, Y["b"] + 0.24],
            color="#c8cdd1", linewidth=1.2, linestyle=":", zorder=2)

    for tp, col in C.items():
        test_point(ax, col, tp)

    # Component callouts, staggered across two tiers below the board so
    # neighbouring boxes never collide.
    tier1 = Y["g"] + 0.5     # nearer the board
    tier2 = Y["i"] + 0.3     # further down
    callout(ax, "red jumper\n+ rail → a2", (col_x(2), (Y_PLUS_TOP + Y["a"]) / 2),
            (col_x(1.5), Y_PLUS_TOP + 2.6), RED)
    callout(ax, "SW1 slide switch\nb2 → b6", (col_x(4), Y["b"]), (col_x(4), tier1), BLUE)
    callout(ax, "R1  330 Ω\nc6 → c10", (col_x(8), Y["c"]),
            (col_x(8), tier2), ORANGE)
    callout(ax, "jumper wire\n(R1 → R2), b10 → b14", (col_x(12), Y["b"]),
            (col_x(12), tier1), ORANGE)
    callout(ax, "R2  220 Ω\nc14 → c18", (col_x(16), Y["c"]),
            (col_x(16), tier2), RED)
    callout(ax, "D1 diode (1N4148)\nA: b18   K: b22", (col_x(20), Y["b"]),
            (col_x(20), tier1), GRAY)
    callout(ax, "D2 red LED\nA: c22   K: c26", (col_x(24), Y["c"]),
            (col_x(24), tier2), RED)
    callout(ax, "black jumper\nb26 → − rail", (col_x(26), (Y_MINUS_TOP + Y["b"]) / 2),
            (col_x(28.3), Y_PLUS_TOP + 2.6), "#37474f")

    ax.text(col_x(15.0), Y_PLUS_TOP + 4.6,
            "Hunt Down a Hidden Fault — breadboard layout",
            color=INK, fontsize=16, ha="center", va="center", fontweight="bold")
    ax.text(col_x(15.0), Y_PLUS_TOP + 3.5,
            "Purple rings mark the 7 test points TP0-TP6 - touch your meter's probe here.",
            color=PURPLE, fontsize=10.5, ha="center", va="center")

    ax.set_xlim(col_x(1) - 3.0, col_x(COLS) + 3.0)
    ax.set_ylim(Y["i"] - 0.8, Y_PLUS_TOP + 5.6)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout()
    fig.savefig(output, dpi=150, facecolor="white")
    print(f"wrote {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="output .png path")
    build(parser.parse_args().output)
