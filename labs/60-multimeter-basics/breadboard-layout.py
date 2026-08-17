#!/usr/bin/env python3
"""Render the breadboard layout for the "Meet Your Multimeter" lab.

This is Lab 10's LED circuit with a slide switch added in series, plus a
second resistor (R2, 470 ohm) sitting in free holes with both legs
completely unconnected - used only for the out-of-circuit resistance
measurement later in the lab. The hole positions drawn here are the exact
ones the lab's build steps name, so a student can hold the picture beside
the page and match them one for one.

Layout (top half of the board, rows a-e):
    red jumper     + rail  ->  a3
    SW1 slide sw   b3      ->  b6
    R1 220 ohm     c6      ->  c12
    D1 red LED     anode d12, cathode d13
    black jumper   a13     ->  - rail

Layout (bottom half, rows f-j - unused by the live circuit):
    R2 470 ohm     f20     ->  f24   (both legs free, wired to nothing)

Column groups a-e (or f-j) at the same column number are one electrically
connected node, so the red jumper's end and SW1's left leg both land in
column 3, SW1's right leg and R1's left leg both land in column 6, R1's
right leg and the LED's anode both land in column 12, and the LED's
cathode and the black jumper's end both land in column 13.

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
SLATE = "#37474f"


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


def resistor(ax, xy1, xy2, bands=((RED, RED, "#6d4c1f", "#d4af37"))):
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.2, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = xy1[1]
    body_w = min(3.0, abs(xy2[0] - xy1[0]) * 0.7)
    ax.add_patch(FancyBboxPatch((cx - body_w / 2, cy - 0.42), body_w, 0.84,
                                boxstyle="round,pad=0.06", facecolor=TAN,
                                edgecolor="#b99b58", linewidth=0.9, zorder=6))
    offsets = [-0.95, -0.5, -0.05, 0.95]
    if body_w < 2.6:
        offsets = [o * (body_w / 3.0) for o in offsets]
    for dx, colour in zip(offsets, bands):
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
    ax.plot([cathode_xy[0] + 0.3, cathode_xy[0] + 0.3], [cy - 0.42, cy + 0.42],
            color="#7f1d1d", linewidth=3.0, zorder=7)
    ax.text(anode_xy[0] - 0.72, cy, "A", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)
    ax.text(cathode_xy[0] + 0.85, cy, "K", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)


def switch(ax, left_xy, right_xy):
    """A small slide switch body bridging its two used legs.

    Drawn as a rectangular plastic body with a sliding lever on top, closed
    (pushed toward the right leg) - matching how the lab asks students to
    leave it while they take voltage and current readings.
    """
    cx = (left_xy[0] + right_xy[0]) / 2
    cy = left_xy[1]
    for p in (left_xy, right_xy):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    body_w = abs(right_xy[0] - left_xy[0]) * 0.85
    ax.add_patch(FancyBboxPatch((cx - body_w / 2, cy - 0.36), body_w, 0.72,
                                boxstyle="round,pad=0.05", facecolor="#cfd8dc",
                                edgecolor=SLATE, linewidth=1.0, zorder=6))
    # The lever: a small dark rectangle slid toward the "on" (right) side.
    lever_w = body_w * 0.34
    ax.add_patch(Rectangle((cx + body_w * 0.06, cy - 0.16), lever_w, 0.32,
                           facecolor=SLATE, edgecolor="none", zorder=7))
    ax.text(cx, cy + 0.62, "ON", color=GREEN, fontsize=8, ha="center",
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
    fig, ax = plt.subplots(figsize=(14.5, 8.6))

    draw_board(ax)

    a3 = (col_x(3), Y["a"])
    b3, b6 = (col_x(3), Y["b"]), (col_x(6), Y["b"])
    c6, c12 = (col_x(6), Y["c"]), (col_x(12), Y["c"])
    d12, d13 = (col_x(12), Y["d"]), (col_x(13), Y["d"])
    a13 = (col_x(13), Y["a"])
    f20, f24 = (col_x(20), Y["f"]), (col_x(24), Y["f"])

    # The red jumper crosses the - rail on its way down, so it is bowed aside.
    jumper(ax, (col_x(3), Y_PLUS_TOP), a3, RED, bow=0.42)
    switch(ax, b3, b6)
    resistor(ax, c6, c12)
    led(ax, d12, d13)
    jumper(ax, a13, (col_x(13), Y_MINUS_TOP), SLATE)

    # R2 sits in the unused bottom half, both legs in free holes wired to
    # nothing else - the resistance-practice component from the schematic.
    resistor(ax, f20, f24, bands=("#f2c14e", "#7e57c2", "#6d4c1f", "#d4af37"))

    # Callouts live off the board or in the unused half, so no label sits on
    # top of a hole a student is trying to count.
    callout(ax, "red jumper\n+ rail → a3", (col_x(3.4), (Y_PLUS_TOP + Y["a"]) / 2),
            (col_x(2.2), Y_PLUS_TOP + 2.8), RED)
    callout(ax, "SW1 slide switch\nb3 → b6", (col_x(4.5), Y["b"] - 0.5),
            (col_x(4.5), Y["d"] - 0.35), INK)
    callout(ax, "R1  220 Ω  red-red-brown\nc6 → c12", (col_x(9), Y["c"] - 0.55),
            (col_x(8.6), Y["g"] + 0.35), BLUE)
    callout(ax, "D1  red LED\nlong leg (A) in d12\nshort leg (K) in d13",
            (col_x(12.5), Y["d"] - 0.85), (col_x(19.0), Y["h"] + 0.6), RED)
    callout(ax, "black jumper\na13 → − rail", (col_x(13), (Y_MINUS_TOP + Y["a"]) / 2),
            (col_x(16.0), Y_PLUS_TOP + 2.8), SLATE)
    callout(ax, "R2  470 Ω  yellow-violet-brown\nUNCONNECTED — f20 → f24\nfor resistance practice only",
            (col_x(22), Y["f"] - 0.55), (col_x(22.5), Y["i"] - 0.2), GRAY)

    ax.text(col_x(15.5), Y_PLUS_TOP + 4.8,
            "Meet Your Multimeter — breadboard layout",
            color=INK, fontsize=16, ha="center", va="center", fontweight="bold")

    ax.set_xlim(col_x(1) - 3.0, col_x(COLS) + 3.0)
    ax.set_ylim(Y_MINUS_BOT - 2.6, Y_PLUS_TOP + 5.8)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout()
    fig.savefig(output, dpi=150, facecolor="white")
    print(f"wrote {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="output .png path")
    build(parser.parse_args().output)
