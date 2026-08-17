#!/usr/bin/env python3
"""Render the breadboard layout for the "555 Timer LED Blinker" lab.

The hole positions drawn here are the same ones the lab's build steps name,
so a student can hold the picture beside the page and match them one for
one. If the steps ever change, change them here too.

Layout (columns are numbered 1-30 left to right; the NE555 straddles the
centre channel at columns 15-18, notch toward column 15):

    +5V jumper 1       + rail  ->  a5             (feeds R1)
    R1  1 kOhm         a5/b5   ->  b9              (node A / DISCHARGE node)
    R2  68 kOhm        b9/c9   ->  c13             (node A -> timing node)
    node A wire        d9 -> h16                   (node A -> pin 7 DISCHARGE)
    timing node wire 1 d13 -> g17                  (timing node -> pin 6 THRESHOLD)
    timing node wire 2 b13 -> d16                  (timing node -> pin 2 TRIGGER)
    C1  10 uF          a13 (+) -> - rail            (timing node -> ground)
    NE555              e15-e18 (pins 1-4), f15-f18 (pins 8-5)
    GND jumper         - rail  ->  d15             (pin 1 GND)
    +5V jumper 2       + rail  ->  b18             (pin 4 RESET)
    +5V jumper 3       + rail  ->  i15 (via col 3)  (pin 8 VCC)
    R3  330 Ohm        d17     ->  d21             (pin 3 OUTPUT node -> LED)
    LED D1             anode c21, cathode c22
    ground jumper      c22     ->  - rail

Column 9's five top-half holes are one connected group (node A); column 13's
top-half holes are a second group (the timing node, which also feeds pin 2
TRIGGER directly since e16 shares column 16 with the trigger-tie jumper's
landing spot, d16). The chip's bottom-half pins (5-8) sit in a *separate* bus
from their own column's top half - that separation is exactly why pin 7
(DISCHARGE) and pin 6 (THRESHOLD) need their own wires down from the timing
network even though they are electrically part of the same nodes.

Usage:
    python3 breadboard-layout.py breadboard-layout.png
"""

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyBboxPatch, Rectangle, Wedge

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
LEAD = "#9e9e9e"

BAND_COLOR = {
    "black": "#1a1a1a", "brown": "#7a4a1e", "red": "#c62828",
    "orange": "#d35400", "gray": "#8a8f96", "gold": "#d4af37",
    "blue": "#1565c0",
}


def col_x(c):
    return c * PITCH


def draw_board(ax):
    ax.add_patch(FancyBboxPatch(
        (col_x(1) - 1.4, Y_PLUS_BOT - 1.1), COLS * PITCH + 1.6, 16.6,
        boxstyle="round,pad=0.3", facecolor=BOARD, edgecolor="#c8cdd1", linewidth=1.4))

    # Centre channel - the gap that isolates the top half from the bottom
    # half. The NE555 straddles it; nothing else does.
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
    """A two-point jumper wire, drawn with the seated ends a student should check."""
    if bow:
        mx = (xy1[0] + xy2[0]) / 2 + bow
        my = (xy1[1] + xy2[1]) / 2
        xs, ys = [xy1[0], mx, xy2[0]], [xy1[1], my, xy2[1]]
    else:
        xs, ys = [xy1[0], xy2[0]], [xy1[1], xy2[1]]
    ax.plot(xs, ys, color=colour, linewidth=3.0, solid_capstyle="round",
            solid_joinstyle="round", zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.26, facecolor=colour, edgecolor="white",
                            linewidth=0.9, zorder=5))


def jumper_path(ax, points, colour):
    """A jumper wire with one or more bends. Only the first and last point
    get seated-end circles; the interior points are just bends in one wire,
    not extra connections, so they get no marker."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    ax.plot(xs, ys, color=colour, linewidth=3.0, solid_capstyle="round",
            solid_joinstyle="round", zorder=4)
    for p in (points[0], points[-1]):
        ax.add_patch(Circle(p, 0.26, facecolor=colour, edgecolor="white",
                            linewidth=0.9, zorder=5))


def resistor(ax, xy1, xy2, bands):
    """A resistor spanning two holes, with real color-code bands."""
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color=LEAD, linewidth=2.2, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.24, facecolor=LEAD, edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = xy1[1]
    ax.add_patch(FancyBboxPatch((cx - 1.5, cy - 0.42), 3.0, 0.84,
                                boxstyle="round,pad=0.06", facecolor=TAN,
                                edgecolor="#b99b58", linewidth=0.9, zorder=6))
    n = len(bands)
    span = 2.0
    start = -span / 2
    for i, name in enumerate(bands):
        dx = start + (span * i / (n - 1) if n > 1 else 0)
        ax.add_patch(Rectangle((cx + dx, cy - 0.42), 0.22, 0.84,
                               facecolor=BAND_COLOR[name], edgecolor="none", zorder=7))


def capacitor(ax, plus_xy, minus_xy):
    """A small polarized electrolytic capacitor, plus lead marked.

    Drawn as a plain two-lead component (no wide body blob) so it never
    competes for space with the column-number labels along the rail.
    """
    ax.plot([plus_xy[0], minus_xy[0]], [plus_xy[1], minus_xy[1]], color=BLUE,
            linewidth=3.0, zorder=4)
    for p in (plus_xy, minus_xy):
        ax.add_patch(Circle(p, 0.24, facecolor=BLUE, edgecolor="white",
                            linewidth=0.9, zorder=5))
    plus_offset = 0.34 if plus_xy[1] > minus_xy[1] else -0.34
    ax.text(plus_xy[0] + 0.45, plus_xy[1] - plus_offset * 0.2, "+", color=BLUE,
            fontsize=13, ha="center", va="center", fontweight="bold", zorder=7)


def led(ax, anode_xy, cathode_xy):
    """Top-down 5 mm LED: the body sits over its two holes, flat edge on the K side."""
    cx = (anode_xy[0] + cathode_xy[0]) / 2
    cy = anode_xy[1]
    for p in (anode_xy, cathode_xy):
        ax.add_patch(Circle(p, 0.24, facecolor=LEAD, edgecolor="white",
                            linewidth=0.9, zorder=5))
    ax.add_patch(Circle((cx, cy), 0.7, facecolor="#ef5350", edgecolor="#b71c1c",
                        linewidth=1.1, zorder=6))
    ax.plot([cathode_xy[0] + 0.3, cathode_xy[0] + 0.3], [cy - 0.42, cy + 0.42],
            color="#7f1d1d", linewidth=3.0, zorder=7)
    ax.text(anode_xy[0] - 0.72, cy, "A", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)
    ax.text(cathode_xy[0] + 0.85, cy, "K", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)


def dip_chip(ax, first_col, top_pins, bot_pins):
    """An 8-pin DIP body straddling the centre channel.

    top_pins / bot_pins: 4 (number, short_name) tuples, left to right, for
    the row-e and row-f pins. Pin 1 is top_pins[0]; the notch marks that end.
    """
    left_x = col_x(first_col) - 0.65
    right_x = col_x(first_col + 3) + 0.65
    top_y = Y["e"] + 0.45
    bot_y = Y["f"] - 0.45

    ax.add_patch(FancyBboxPatch((left_x, bot_y), right_x - left_x, top_y - bot_y,
                                boxstyle="round,pad=0.02", facecolor=INK,
                                edgecolor="#000000", linewidth=1.0, zorder=6))

    # Notch: a bite out of the left edge, centred vertically, marking pin 1.
    ax.add_patch(Wedge((left_x, (top_y + bot_y) / 2), 0.3, 260, 100,
                       facecolor=BOARD, edgecolor="none", zorder=7))

    ax.text((left_x + right_x) / 2, (top_y + bot_y) / 2 + 0.35, "NE555",
            color="white", fontsize=12, ha="center", va="center",
            fontweight="bold", zorder=8)
    ax.text((left_x + right_x) / 2, (top_y + bot_y) / 2 - 0.35, "8-pin DIP",
            color="#c8cdd1", fontsize=8, ha="center", va="center", zorder=8)

    for i, (num, name) in enumerate(top_pins):
        c = first_col + i
        hole = (col_x(c), Y["e"])
        ax.plot([col_x(c), col_x(c)], [top_y, Y["e"]], color=LEAD, linewidth=2.0, zorder=6)
        ax.add_patch(Circle(hole, 0.19, facecolor=LEAD, edgecolor="white",
                            linewidth=0.7, zorder=7))
        ax.text(col_x(c), top_y + 1.0, f"{num}\n{name}", color=INK, fontsize=7.6,
                ha="center", va="center", zorder=9,
                bbox=dict(boxstyle="round,pad=0.16", facecolor="white",
                          edgecolor="none", alpha=0.92))

    for i, (num, name) in enumerate(bot_pins):
        c = first_col + i
        hole = (col_x(c), Y["f"])
        ax.plot([col_x(c), col_x(c)], [bot_y, Y["f"]], color=LEAD, linewidth=2.0, zorder=6)
        ax.add_patch(Circle(hole, 0.19, facecolor=LEAD, edgecolor="white",
                            linewidth=0.7, zorder=7))
        ax.text(col_x(c), bot_y - 1.0, f"{num}\n{name}", color=INK, fontsize=7.6,
                ha="center", va="center", zorder=9,
                bbox=dict(boxstyle="round,pad=0.16", facecolor="white",
                          edgecolor="none", alpha=0.92))


def callout(ax, text_str, xy, xytext, colour):
    ax.annotate(text_str, xy=xy, xytext=xytext, color=colour, fontsize=9.5,
                ha="center", va="center", zorder=10,
                bbox=dict(boxstyle="round,pad=0.32", facecolor="white",
                          edgecolor="none", alpha=0.94),
                arrowprops=dict(arrowstyle="->", color=colour, linewidth=1.3,
                                shrinkA=2, shrinkB=6))


def build(output):
    fig, ax = plt.subplots(figsize=(19.5, 8.6))

    draw_board(ax)

    # --- +5 V feeds ---------------------------------------------------------
    jumper(ax, (col_x(5), Y_PLUS_TOP), (col_x(5), Y["a"]), RED, bow=0.32)
    jumper(ax, (col_x(18), Y_PLUS_TOP), (col_x(18), Y["b"]), RED, bow=-0.32)
    jumper_path(ax, [(col_x(3), Y_PLUS_TOP), (col_x(3), Y["i"]), (col_x(15), Y["i"])], RED)

    # --- Ground feeds ---------------------------------------------------------
    jumper(ax, (col_x(15), Y_MINUS_TOP), (col_x(15), Y["d"]), "#37474f")
    jumper(ax, (col_x(22), Y_MINUS_TOP), (col_x(22), Y["c"]), "#37474f")

    # --- Timing network: R1, R2, node wires, C1 --------------------------
    resistor(ax, (col_x(5), Y["b"]), (col_x(9), Y["b"]), ["brown", "black", "red", "gold"])
    resistor(ax, (col_x(9), Y["c"]), (col_x(13), Y["c"]), ["blue", "gray", "orange", "gold"])
    jumper_path(ax, [(col_x(9), Y["d"]), (col_x(9), Y["h"]), (col_x(16), Y["h"])], BLUE)
    jumper_path(ax, [(col_x(13), Y["d"]), (col_x(13), Y["g"]), (col_x(17), Y["g"])], BLUE)
    jumper(ax, (col_x(13), Y["b"]), (col_x(16), Y["d"]), BLUE, bow=0.25)
    capacitor(ax, (col_x(13), Y["a"]), (col_x(13), Y_MINUS_TOP))

    # --- NE555 ----------------------------------------------------------------
    dip_chip(ax, 15,
             top_pins=[("1", "GND"), ("2", "TRIG"), ("3", "OUT"), ("4", "RST")],
             bot_pins=[("8", "VCC"), ("7", "DIS"), ("6", "THR"), ("5", "CTL")])

    # --- Output branch: R3 + D1 -----------------------------------------------
    resistor(ax, (col_x(17), Y["d"]), (col_x(21), Y["d"]), ["orange", "orange", "brown", "gold"])
    led(ax, (col_x(21), Y["c"]), (col_x(22), Y["c"]))

    # --- Callouts: top margin, left to right ----------------------------------
    callout(ax, "+5V jumper\n+ rail → a5", (col_x(5), (Y_PLUS_TOP + Y["a"]) / 2),
            (col_x(2.2), Y_PLUS_TOP + 2.6), RED)
    callout(ax, "GND jumper\n− rail → d15 (pin 1 GND)", (col_x(15), (Y_MINUS_TOP + Y["d"]) / 2),
            (col_x(9.5), Y_PLUS_TOP + 3.2), "#37474f")
    callout(ax, "C1  10 µF electrolytic\n+ lead a13 → − rail", (col_x(13), (Y["a"] + Y_MINUS_TOP) / 2),
            (col_x(13.0), Y_PLUS_TOP + 1.1), BLUE)
    callout(ax, "+5V jumper\n+ rail → b18 (pin 4 RESET)", (col_x(18), (Y_PLUS_TOP + Y["b"]) / 2),
            (col_x(21.5), Y_PLUS_TOP + 3.2), RED)
    callout(ax, "R3  330 Ω  orange-orange-brown\nd17 → d21", (col_x(19), Y["d"] + 0.55),
            (col_x(24.3), Y_PLUS_TOP + 1.1), GREEN)

    # --- Callouts: inside the board, near their own components -----------------
    callout(ax, "R1  1 kΩ  brown-black-red\na5 → b9 (node A)", (col_x(7), Y["b"] - 0.55),
            (col_x(4.4), Y["a"] - 1.8), BLUE)
    callout(ax, "R2  68 kΩ  blue-gray-orange\nnode A → c13 (timing node)", (col_x(11), Y["c"] - 0.55),
            (col_x(10.6), Y["a"] - 1.8), BLUE)

    # --- Callouts: right margin, stacked top to bottom --------------------------
    callout(ax, "timing node → pin 2 TRIGGER\nb13 → d16", (col_x(14.3), Y["c"] + 0.2),
            (col_x(27.5), Y["b"] + 0.5), BLUE)
    callout(ax, "D1  red LED\nlong leg (A) c21, short leg (K) c22", (col_x(21.5), Y["c"] - 0.85),
            (col_x(27.5), Y["d"] + 0.2), RED)
    callout(ax, "ground jumper\nc22 → − rail", (col_x(22), (Y_MINUS_TOP + Y["c"]) / 2),
            (col_x(27.5), Y["e"] - 0.6), "#37474f")

    # --- Callouts: below the board, spread out ----------------------------------
    callout(ax, "+5V jumper\n+ rail → i15 (pin 8 VCC)", (col_x(3), Y["i"]),
            (col_x(4.0), Y_MINUS_BOT - 1.3), RED)
    callout(ax, "node A → pin 7 DISCHARGE\nd9 → h16", (col_x(11), Y["h"]),
            (col_x(11.5), Y_MINUS_BOT - 1.3), BLUE)
    callout(ax, "timing node → pin 6 THRESHOLD\nd13 → g17", (col_x(15), Y["g"]),
            (col_x(20.5), Y_MINUS_BOT - 1.3), BLUE)

    ax.text(col_x(27.5), Y["g"] - 0.4,
            "Bottom power rails are not\nused. The 5V jumper at column 3\nbrings power down to pin 8.",
            color=GRAY, fontsize=9.5, ha="center", va="center",
            bbox=dict(boxstyle="round,pad=0.34", facecolor="white",
                      edgecolor="none", alpha=0.94), zorder=10)
    ax.text(col_x(15.5), Y_PLUS_TOP + 4.6,
            "555 Timer LED Blinker — breadboard layout",
            color=INK, fontsize=16, ha="center", va="center", fontweight="bold")

    ax.set_xlim(col_x(1) - 3.0, col_x(COLS) + 3.0)
    ax.set_ylim(Y_MINUS_BOT - 3.2, Y_PLUS_TOP + 5.6)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout()
    fig.savefig(output, dpi=150, facecolor="white")
    print(f"wrote {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="output .png path")
    build(parser.parse_args().output)
