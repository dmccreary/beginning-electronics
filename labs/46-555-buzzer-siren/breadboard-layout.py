#!/usr/bin/env python3
"""Render the breadboard layout for the "555 Timer Buzzer and Siren" lab.

The hole positions drawn here are the exact ones the lab's build steps name,
so a student can hold the picture beside the page and match them one for
one. If the steps ever change, change them here too.

Layout (all holes are column/row pairs; a-e is the top half, f-j the
bottom half, split by the center channel the NE555 straddles):

    NE555         notch at pin 1, columns 10-13
                  pin 1 GND    -> e10      pin 8 VCC    -> f10
                  pin 2 TRIG   -> e11      pin 7 DIS    -> f11
                  pin 3 OUT    -> e12      pin 6 THR    -> f12
                  pin 4 RESET  -> e13      pin 5 CTRL   -> f13 (unused)
    R1  1 kOhm    h10 -> h11    (VCC net to DIS net)
    R2  6.8 kOhm  i11 -> i12    (DIS net to the timing node)
    C1  0.1 uF    j12 -> j16    (timing node to a free column, then to GND)
    Buzzer        c18 (+) -> c19 (-)

    J1 blue   c11 -> g12    ties TRIG (pin 2) into the timing node
    J2 red    b13 -> + rail RESET (pin 4) to +5 V
    J3 red    g10 -> + rail VCC (pin 8) to +5 V
    J4 black  b10 -> - rail GND (pin 1) to ground
    J5 black  g16 -> - rail C1's far leg to ground
    J6 green  b12 -> c18   OUT (pin 3) straight to the buzzer's + leg
    J7 black  d19 -> - rail buzzer's - leg to ground

Every jumper lands in a hole that shares a column (and half) with the net
it is joining, never in the exact hole a chip pin or component leg already
occupies. The bottom power rails are not used in this lab - every ground
and +5 V connection is routed to the top rails, so students only ever have
to find one + and one - strip.

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
BLACK_WIRE = "#37474f"
GREEN = "#2e7d32"
GRAY = "#5f6b73"
TAN = "#e3c98f"
GOLD = "#d4af37"
BROWN = "#6d4c1f"
BLACKBAND = "#1a1a1a"
BANDGRAY = "#757575"
CERAMIC = "#8ecae6"
CERAMIC_EDGE = "#1b6ca8"


def col_x(c):
    return c * PITCH


def draw_board(ax):
    ax.add_patch(FancyBboxPatch(
        (col_x(1) - 1.4, Y_PLUS_BOT - 1.1), COLS * PITCH + 1.6, 16.6,
        boxstyle="round,pad=0.3", facecolor=BOARD, edgecolor="#c8cdd1", linewidth=1.4))

    # Centre channel - the gap an 8-pin DIP straddles. It sits strictly
    # between rows e and f so neither row looks connected to the other.
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
    ax.plot(xs, ys, color=colour, linewidth=3.0, solid_capstyle="round",
            solid_joinstyle="round", zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.24, facecolor=colour, edgecolor="white",
                            linewidth=0.9, zorder=5))


def resistor(ax, xy1, xy2, bands, ref):
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.2, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.22, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = xy1[1]
    ax.add_patch(FancyBboxPatch((cx - 0.42, cy - 0.30), 0.84, 0.60,
                                boxstyle="round,pad=0.04", facecolor=TAN,
                                edgecolor="#b99b58", linewidth=0.8, zorder=6))
    for dx, colour in ((-0.28, bands[0]), (-0.10, bands[1]), (0.08, bands[2]), (0.28, bands[3])):
        ax.add_patch(Rectangle((cx + dx, cy - 0.30), 0.07, 0.60,
                               facecolor=colour, edgecolor="none", zorder=7))
    ax.text(cx, cy - 0.55, ref, color=INK, fontsize=8, ha="center", va="top",
            fontweight="bold", zorder=8)


def capacitor(ax, xy1, xy2, ref):
    """A small non-polarized ceramic disc capacitor, leads spanning xy1-xy2."""
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.0, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.20, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.8, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = xy1[1]
    ax.add_patch(Circle((cx, cy), 0.36, facecolor=CERAMIC, edgecolor=CERAMIC_EDGE,
                        linewidth=1.1, zorder=6))
    ax.text(cx, cy + 0.62, ref, color=CERAMIC_EDGE, fontsize=8, ha="center",
            va="bottom", fontweight="bold", zorder=8)


def dip8(ax, col_start):
    """An 8-pin DIP straddling the centre channel, notch marking pin 1.

    Pins 1-4 run left to right along the top row (row e); pins 8-5 mirror
    them left to right along the bottom row (row f), so pin 8 sits directly
    below pin 1 and pin 5 directly below pin 4 - the real NE555 pinout.
    """
    y_top, y_bot = Y["e"], Y["f"]
    x0 = col_x(col_start) - 0.55
    x1 = col_x(col_start + 3) + 0.55
    ax.add_patch(FancyBboxPatch((x0, y_bot), x1 - x0, y_top - y_bot,
                                boxstyle="round,pad=0.02,rounding_size=0.06",
                                facecolor="#2b2b2b", edgecolor="#0d0d0d",
                                linewidth=1.3, zorder=6))
    # Notch at the pin-1 end, plus a pin-1 dot for the second orientation check.
    ax.add_patch(Wedge((x0, (y_top + y_bot) / 2), 0.24, 90, 270,
                       facecolor=BOARD, edgecolor="#0d0d0d", linewidth=1.1, zorder=7))
    ax.add_patch(Circle((x0 + 0.42, y_top - 0.32), 0.09, facecolor=BOARD,
                        edgecolor="none", zorder=8))

    top_pins = [1, 2, 3, 4]
    bot_pins = [8, 7, 6, 5]
    for i, col in enumerate(range(col_start, col_start + 4)):
        x = col_x(col)
        ax.add_patch(Circle((x, y_top), 0.19, facecolor=GOLD, edgecolor="#0d0d0d",
                            linewidth=0.7, zorder=8))
        ax.text(x, y_top - 0.38, str(top_pins[i]), color="white", fontsize=8,
                ha="center", va="center", zorder=9, fontweight="bold")
        ax.add_patch(Circle((x, y_bot), 0.19, facecolor=GOLD, edgecolor="#0d0d0d",
                            linewidth=0.7, zorder=8))
        ax.text(x, y_bot + 0.38, str(bot_pins[i]), color="white", fontsize=8,
                ha="center", va="center", zorder=9, fontweight="bold")

    ax.text((x0 + x1) / 2, (y_top + y_bot) / 2 + 0.05, "NE555", color="white",
            fontsize=9.5, ha="center", va="center", fontweight="bold", zorder=9)
    ax.text((x0 + x1) / 2, (y_top + y_bot) / 2 - 0.35, "8-pin DIP", color="#c9c9c9",
            fontsize=6.5, ha="center", va="center", zorder=9)


def piezo_buzzer(ax, plus_xy, minus_xy):
    """A small two-lead piezo buzzer, + lead toward the 555's output."""
    for p in (plus_xy, minus_xy):
        ax.add_patch(Circle(p, 0.20, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.8, zorder=5))
    cx = (plus_xy[0] + minus_xy[0]) / 2
    cy = plus_xy[1]
    ax.add_patch(Circle((cx, cy), 0.58, facecolor="#37474f", edgecolor="#0d0d0d",
                        linewidth=1.2, zorder=6))
    ax.add_patch(Circle((cx, cy), 0.30, facecolor="#78909c", edgecolor="none", zorder=7))
    ax.text(plus_xy[0], cy + 0.9, "+", color=RED, fontsize=13, ha="center",
            va="center", fontweight="bold", zorder=8)
    ax.text(minus_xy[0], cy + 0.9, "−", color=INK, fontsize=13, ha="center",
            va="center", fontweight="bold", zorder=8)


def wire_path(ax, points, colour):
    """A jumper routed through explicit bend points, e.g. to detour around the chip."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    ax.plot(xs, ys, color=colour, linewidth=3.0, solid_capstyle="round",
            solid_joinstyle="round", zorder=4)
    for p in (points[0], points[-1]):
        ax.add_patch(Circle(p, 0.24, facecolor=colour, edgecolor="white",
                            linewidth=0.9, zorder=5))


def callout(ax, text, xy, xytext, colour):
    ax.annotate(text, xy=xy, xytext=xytext, color=colour, fontsize=9.5,
                ha="center", va="center", zorder=10,
                bbox=dict(boxstyle="round,pad=0.32", facecolor="white",
                          edgecolor="none", alpha=0.95),
                arrowprops=dict(arrowstyle="->", color=colour, linewidth=1.3,
                                shrinkA=2, shrinkB=6))


def tag(ax, text, xy, colour):
    """A short in-place label, for jumpers where an arrow would be clutter."""
    ax.text(xy[0], xy[1], text, color="white", fontsize=7.5, ha="center", va="center",
            fontweight="bold", zorder=10,
            bbox=dict(boxstyle="round,pad=0.16", facecolor=colour, edgecolor="none"))


def build(output):
    fig, ax = plt.subplots(figsize=(20.5, 9.2))

    draw_board(ax)
    dip8(ax, 10)

    # R1, R2, C1 - the timing network, tucked under the chip in free rows.
    h10, h11 = (col_x(10), Y["h"]), (col_x(11), Y["h"])
    i11, i12 = (col_x(11), Y["i"]), (col_x(12), Y["i"])
    j12, j16 = (col_x(12), Y["j"]), (col_x(16), Y["j"])
    resistor(ax, h10, h11, [BROWN, BLACKBAND, RED, GOLD], "R1")
    resistor(ax, i11, i12, [BLUE, BANDGRAY, RED, GOLD], "R2")
    capacitor(ax, j12, j16, "C1")

    # Buzzer, + leg closest to the 555's output side.
    c18, c19 = (col_x(18), Y["c"]), (col_x(19), Y["c"])
    piezo_buzzer(ax, c18, c19)

    # Jumpers. J1 and J3 are routed with explicit bend points so they detour
    # around the chip body instead of crossing over its pins.
    c11, g12 = (col_x(11), Y["c"]), (col_x(12), Y["g"])
    b13 = (col_x(13), Y["b"])
    g10 = (col_x(10), Y["g"])
    b10 = (col_x(10), Y["b"])
    g16 = (col_x(16), Y["g"])
    b12 = (col_x(12), Y["b"])
    d19 = (col_x(19), Y["d"])

    wire_path(ax, [c11, (col_x(14.3), Y["c"]), (col_x(14.3), Y["g"]), g12], BLUE)
    jumper(ax, b13, (col_x(13), Y_PLUS_TOP), RED)
    wire_path(ax, [g10, (col_x(8.5), Y["g"]), (col_x(8.5), Y_PLUS_TOP)], RED)
    jumper(ax, b10, (col_x(10), Y_MINUS_TOP), BLACK_WIRE)
    jumper(ax, g16, (col_x(16), Y_MINUS_TOP), BLACK_WIRE)
    jumper(ax, b12, c18, GREEN)
    jumper(ax, d19, (col_x(19), Y_MINUS_TOP), BLACK_WIRE)

    for label, xy, colour in (
        ("J1", (col_x(14.3), 4.5), BLUE),
        ("J2", (col_x(13.0), 9.7), RED),
        ("J3", (col_x(8.5), 6.5), RED),
        ("J4", (col_x(10.0), 9.3), BLACK_WIRE),
        ("J5", (col_x(16.0), 6.0), BLACK_WIRE),
        ("J6", (col_x(15.0), 7.5), GREEN),
        ("J7", (col_x(19.0), 9.9), BLACK_WIRE),
    ):
        tag(ax, label, xy, colour)

    # Callouts for the three timing parts and the buzzer, kept in the open
    # margins so no arrow has to cross a wire or the chip body.
    callout(ax, "R1  1 kΩ\nbrown-black-red\nh10 → h11", (col_x(10.5), Y["h"] - 0.35),
            (col_x(4.0), Y["h"] + 1.2), BROWN)
    callout(ax, "R2  6.8 kΩ\nblue-gray-red\ni11 → i12", (col_x(11.5), Y["i"] - 0.35),
            (col_x(4.0), Y["i"] - 1.5), BLUE)
    callout(ax, "C1  0.1 µF ceramic\nj12 → j16", (col_x(14), Y["j"] - 0.4),
            (col_x(14), Y["j"] - 1.75), CERAMIC_EDGE)
    callout(ax, "BZ1 piezo buzzer\nc18 (+) → c19 (−)", (col_x(18.5), Y["c"] + 0.65),
            (col_x(18.5), Y["c"] + 2.6), GREEN)
    ax.text(col_x(9.55), Y["e"] + 0.55, "notch = pin 1", color=INK, fontsize=8.5,
            ha="left", va="center", zorder=10,
            bbox=dict(boxstyle="round,pad=0.22", facecolor="white", edgecolor="none",
                      alpha=0.94))

    # Wiring legend for the seven jumpers - the board would be too busy with
    # seven individual arrows, so each jumper gets a short tag on the board
    # and its full description lives here, in the unused right margin.
    legend_lines = [
        "Jumper wiring",
        "J1  c11 → g12",
        "     ties TRIG (pin 2) into the timing node",
        "J2  b13 → + rail",
        "     RESET (pin 4) to +5 V",
        "J3  g10 → + rail",
        "     VCC (pin 8) to +5 V",
        "J4  b10 → − rail",
        "     GND (pin 1) to ground",
        "J5  g16 → − rail",
        "     C1's far leg to ground",
        "J6  b12 → c18",
        "     OUT (pin 3) to the buzzer's + leg",
        "J7  d19 → − rail",
        "     buzzer's − leg to ground",
    ]
    ax.text(col_x(23.0), 9.6, "\n".join(legend_lines), color=INK, fontsize=9.5,
            ha="left", va="top", linespacing=1.55, zorder=10,
            bbox=dict(boxstyle="round,pad=0.5", facecolor="white", edgecolor="#c8cdd1",
                      alpha=0.96))

    ax.text(col_x(1.0), Y_MINUS_BOT - 0.5,
            "The bottom power rails are not used - every ground and +5 V\n"
            "jumper in this lab runs to the top rails.",
            color=GRAY, fontsize=9, ha="left", va="top",
            bbox=dict(boxstyle="round,pad=0.34", facecolor="white",
                      edgecolor="none", alpha=0.94), zorder=10)

    ax.text(col_x(15.0), Y_PLUS_TOP + 3.3,
            "555 Timer Buzzer and Siren — breadboard layout",
            color=INK, fontsize=16, ha="center", va="center", fontweight="bold")

    ax.set_xlim(col_x(1) - 2.2, col_x(30) + 2.2)
    ax.set_ylim(Y_MINUS_BOT - 2.6, Y_PLUS_TOP + 4.4)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout()
    fig.savefig(output, dpi=150, facecolor="white")
    print(f"wrote {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="output .png path")
    build(parser.parse_args().output)
