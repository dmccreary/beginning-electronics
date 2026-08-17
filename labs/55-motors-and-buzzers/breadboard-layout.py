#!/usr/bin/env python3
"""Render the breadboard layout for the "Driving a Motor and a Buzzer Safely" lab.

The hole positions drawn here are the same ones the lab's build steps name, so
a student can hold the picture beside the page and match them one for one. If
the steps ever change, change them here too.

Layout (columns numbered 1-24 left to right; rows a-e are the top half,
f-j the bottom half, split by the center channel):

    +5V jumper 1   + rail  ->  a5             (feeds SW1's west leg)
    SW1 push button        west leg col 5, east leg col 8 (straddles the
                            center channel like Chapter 16's 4-pin button;
                            only the row-e hole on each side is wired)
    R1  4.7 kOhm   b8      ->  b13             (SW1 east leg -> Q1 base)
    Q1  2N2222     d12 (E), d13 (B), d14 (C)   (flat side toward you)
    GND jumper     e12     ->  - rail          (Q1 emitter -> ground)
    M1  DC motor   - lead a14 (-> Q1 collector), + lead a18 (-> +5V)
    D1  flyback diode      anode b14, cathode b18 (straight across M1's
                            own two leads, same columns as M1's leads)
    +5V jumper 2   c18     ->  + rail          (feeds M1 + and D1 cathode)

Column 14 ties Q1's collector, M1's minus lead, and D1's anode into one
node. Column 18 ties M1's plus lead, D1's cathode, and the second +5V
jumper into the other node - exactly the "diode straight across the
motor's two leads" wiring the lab's build steps describe.

Usage:
    python3 breadboard-layout.py breadboard-layout.png
"""

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyBboxPatch, Rectangle, Wedge

COLS = 27
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
ORANGE = "#d35400"
GRAY = "#5f6b73"
TAN = "#e3c98f"
LEAD = "#9e9e9e"
BODY = "#37474f"

BAND_COLOR = {
    "yellow": "#f2c744", "violet": "#7b3fa0", "red": "#c62828", "gold": "#d4af37",
}


def col_x(c):
    return c * PITCH


def draw_board(ax):
    ax.add_patch(FancyBboxPatch(
        (col_x(1) - 1.4, Y_PLUS_BOT - 1.1), COLS * PITCH + 1.6, 16.6,
        boxstyle="round,pad=0.3", facecolor=BOARD, edgecolor="#c8cdd1", linewidth=1.4))

    # Centre channel - the gap that isolates the top half from the bottom
    # half. SW1 straddles it, same trick Chapter 15 taught for a DIP chip.
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
    for c in range(1, COLS + 1):
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
    ax.plot(xs, ys, color=colour, linewidth=3.2, solid_capstyle="round",
            solid_joinstyle="round", zorder=4)
    for p in (xy1, xy2):
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


def diode(ax, anode_xy, cathode_xy):
    """An axial diode spanning two holes, cathode marked with a dark band."""
    ax.plot([anode_xy[0], cathode_xy[0]], [anode_xy[1], cathode_xy[1]],
            color=LEAD, linewidth=2.2, zorder=4)
    for p in (anode_xy, cathode_xy):
        ax.add_patch(Circle(p, 0.24, facecolor=LEAD, edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (anode_xy[0] + cathode_xy[0]) / 2
    cy = anode_xy[1]
    sign = 1 if cathode_xy[0] > anode_xy[0] else -1
    ax.add_patch(FancyBboxPatch((cx - 1.3, cy - 0.34), 2.6, 0.68,
                                boxstyle="round,pad=0.05", facecolor=ORANGE,
                                edgecolor="#9a3c00", linewidth=0.9, zorder=6))
    # Cathode band: a dark stripe near the cathode end of the body.
    band_x = cx + sign * 0.95
    ax.add_patch(Rectangle((band_x - 0.12, cy - 0.34), 0.24, 0.68,
                           facecolor="#2c1400", edgecolor="none", zorder=7))
    ax.text(anode_xy[0] - sign * 0.8, cy + 0.55, "A", color=INK, fontsize=10,
            ha="center", va="center", fontweight="bold", zorder=8)
    ax.text(cathode_xy[0] + sign * 0.8, cy + 0.55, "K", color=INK, fontsize=10,
            ha="center", va="center", fontweight="bold", zorder=8)


def motor(ax, minus_xy, plus_xy, body_y, radius=0.7):
    """A small DC hobby motor: round body floating above the board, two
    short flying leads (not 0.1"-spaced pins) into their holes. Sized to
    clear the +5V rail directly above it."""
    cx = (minus_xy[0] + plus_xy[0]) / 2
    for xy, colour in ((minus_xy, INK), (plus_xy, RED)):
        xs = [xy[0], xy[0] + (cx - xy[0]) * 0.35]
        ys = [xy[1], body_y - radius * 0.9]
        ax.plot(xs, ys, color=colour, linewidth=2.6, zorder=4,
                solid_capstyle="round")
        ax.add_patch(Circle(xy, 0.24, facecolor=colour, edgecolor="white",
                            linewidth=0.9, zorder=5))
    ax.add_patch(Circle((cx, body_y), radius, facecolor="#b0bec5", edgecolor=INK,
                        linewidth=1.4, zorder=6))
    ax.add_patch(Circle((cx, body_y), radius * 0.32, facecolor="#78909c", edgecolor=INK,
                        linewidth=1.0, zorder=7))
    ax.add_patch(Rectangle((cx - 0.09, body_y + radius), 0.18, radius * 0.4,
                           facecolor="#78909c", edgecolor=INK, linewidth=0.8, zorder=7))
    ax.text(minus_xy[0] - 0.05, minus_xy[1] + 0.5, "−", color=INK, fontsize=13,
            ha="center", va="center", fontweight="bold", zorder=8)
    ax.text(plus_xy[0] + 0.05, plus_xy[1] + 0.5, "+", color=RED, fontsize=13,
            ha="center", va="center", fontweight="bold", zorder=8)


def to92_transistor(ax, e_xy, b_xy, c_xy):
    """TO-92 transistor: rounded back, flat front face, legs read E-B-C."""
    cx = b_xy[0]
    top_y = e_xy[1]
    body_bottom = top_y + 0.55
    body_top = top_y + 1.55
    ax.add_patch(Wedge((cx, body_top), 0.62, 180, 360, facecolor=BODY,
                       edgecolor="#0d1318", linewidth=1.0, zorder=6))
    ax.add_patch(Rectangle((cx - 0.62, body_bottom), 1.24, body_top - body_bottom,
                           facecolor=BODY, edgecolor="#0d1318", linewidth=1.0, zorder=6))
    # The flat front face - the marking a student checks before inserting Q1.
    ax.plot([cx - 0.62, cx + 0.62], [body_bottom, body_bottom],
            color="#eceff1", linewidth=2.6, zorder=7)
    for xy in (e_xy, b_xy, c_xy):
        ax.plot([xy[0], xy[0]], [xy[1], body_bottom], color=LEAD, linewidth=2.0, zorder=5)
        ax.add_patch(Circle(xy, 0.19, facecolor=LEAD, edgecolor="white",
                            linewidth=0.7, zorder=7))
    for xy, letter in ((e_xy, "E"), (b_xy, "B"), (c_xy, "C")):
        ax.text(xy[0], xy[1] - 0.55, letter, color=INK, fontsize=10, ha="center",
                va="center", fontweight="bold", zorder=8)


def push_button(ax, west_col, east_col):
    """4-pin tactile push button straddling the center channel.

    Chapter 16: the two legs on the west side are permanently tied together
    inside the case, and so are the two legs on the east side - pressing the
    button is what joins the two sides. Each side's pair spans row e and row
    f of its own column, so only the row-e hole of each side needs a wire.
    """
    top_y = Y["e"] + 0.55
    bot_y = Y["f"] - 0.55
    left_x = col_x(west_col) - 0.9
    right_x = col_x(east_col) + 0.9
    ax.add_patch(FancyBboxPatch((left_x, bot_y), right_x - left_x, top_y - bot_y,
                                boxstyle="round,pad=0.05", facecolor="#cfd8dc",
                                edgecolor="#546e7a", linewidth=1.2, zorder=6))
    cap_cx, cap_cy = (left_x + right_x) / 2, (top_y + bot_y) / 2
    ax.add_patch(Circle((cap_cx, cap_cy), 0.6, facecolor="#90a4ae",
                        edgecolor="#37474f", linewidth=1.3, zorder=7))
    for c in (west_col, east_col):
        ax.plot([col_x(c), col_x(c)], [Y["e"], top_y], color=LEAD, linewidth=2.0, zorder=6)
        ax.plot([col_x(c), col_x(c)], [Y["f"], bot_y], color=LEAD, linewidth=2.0, zorder=6)
        ax.add_patch(Circle((col_x(c), Y["e"]), 0.19, facecolor=LEAD, edgecolor="white",
                            linewidth=0.7, zorder=7))
        ax.add_patch(Circle((col_x(c), Y["f"]), 0.19, facecolor=LEAD, edgecolor="white",
                            linewidth=0.7, zorder=7))
    ax.text(cap_cx, top_y + 0.5, "SW1", color=INK, fontsize=10.5, ha="center",
            va="center", fontweight="bold", zorder=8)
    return (col_x(west_col), Y["e"]), (col_x(east_col), Y["e"])


def callout(ax, text_str, xy, xytext, colour):
    ax.annotate(text_str, xy=xy, xytext=xytext, color=colour, fontsize=9.5,
                ha="center", va="center", zorder=10,
                bbox=dict(boxstyle="round,pad=0.32", facecolor="white",
                          edgecolor="none", alpha=0.94),
                arrowprops=dict(arrowstyle="->", color=colour, linewidth=1.3,
                                shrinkA=2, shrinkB=6))


def build(output):
    fig, ax = plt.subplots(figsize=(16.5, 8.6))

    draw_board(ax)

    # --- SW1, R1: button and base resistor branch ---------------------------
    jumper(ax, (col_x(5), Y_PLUS_TOP), (col_x(5), Y["a"]), RED, bow=0.32)
    west_pt, east_pt = push_button(ax, 5, 8)
    resistor(ax, (col_x(8), Y["b"]), (col_x(13), Y["b"]), ["yellow", "violet", "red", "gold"])

    # --- Q1: the switching transistor ---------------------------------------
    e_xy, b_xy, c_xy = (col_x(12), Y["d"]), (col_x(13), Y["d"]), (col_x(14), Y["d"])
    to92_transistor(ax, e_xy, b_xy, c_xy)
    jumper(ax, (col_x(12), Y["e"]), (col_x(12), Y_MINUS_TOP), "#37474f", bow=-0.3)

    # --- M1, D1: motor and flyback diode across its two leads ---------------
    motor(ax, (col_x(14), Y["a"]), (col_x(18), Y["a"]), Y["a"] + 1.75)
    diode(ax, (col_x(14), Y["b"]), (col_x(18), Y["b"]))
    jumper(ax, (col_x(18), Y_PLUS_TOP), (col_x(18), Y["c"]), RED, bow=0.32)

    # --- Callouts -------------------------------------------------------------
    callout(ax, "+5V jumper 1\n+ rail → a5 (SW1 west leg)", (col_x(5), (Y_PLUS_TOP + Y["a"]) / 2),
            (col_x(2.2), Y_PLUS_TOP + 2.9), RED)
    callout(ax, "SW1 push button\nstraddles the gap - west col 5, east col 8",
            ((col_x(5) + col_x(8)) / 2, Y["f"] - 1.1), (col_x(3.6), Y["j"] - 0.2), BLUE)
    callout(ax, "R1  4.7 kΩ  yellow-violet-red\nb8 → b13", (col_x(10.5), Y["b"] - 0.55),
            (col_x(9.5), Y["a"] - 1.7), BLUE)
    callout(ax, "Q1  2N2222 - flat side toward you\nE d12, B d13, C d14", (col_x(13.4), Y["d"] + 1.2),
            (col_x(20.5), Y["c"] - 0.2), BLUE)
    callout(ax, "GND jumper\ne12 → − rail", (col_x(12), (Y_MINUS_TOP + Y["e"]) / 2),
            (col_x(9), Y["h"] + 0.5), "#37474f")
    callout(ax, "M1 DC motor\n− lead a14 (Q1 collector node)\n+ lead a18 (+5V node)",
            (col_x(15.3), Y["a"] + 1.75), (col_x(9.7), Y_PLUS_TOP + 3.0), RED)
    callout(ax, "D1 flyback diode - straight across\nM1's leads: anode b14, cathode b18",
            (col_x(16), Y["b"]), (col_x(25.5), Y_PLUS_TOP + 1.6), ORANGE)
    callout(ax, "+5V jumper 2\n+ rail → c18 (feeds M1 + and D1 cathode)",
            (col_x(18), (Y_PLUS_TOP + Y["c"]) / 2), (col_x(22.2), Y_PLUS_TOP + 3.5), RED)

    ax.text(col_x(17), Y["h"] + 0.3,
            "Rows f-j are unused except SW1's other\ntwo legs, straddling the gap below its top legs.",
            color=GRAY, fontsize=9.5, ha="center", va="center",
            bbox=dict(boxstyle="round,pad=0.34", facecolor="white",
                      edgecolor="none", alpha=0.94), zorder=10)
    ax.text(col_x(13.5), Y_PLUS_TOP + 4.9,
            "Driving a Motor and a Buzzer Safely — breadboard layout",
            color=INK, fontsize=16, ha="center", va="center", fontweight="bold")

    ax.set_xlim(col_x(1) - 3.2, col_x(COLS) + 3.6)
    ax.set_ylim(Y_MINUS_BOT - 1.6, Y_PLUS_TOP + 5.8)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout()
    fig.savefig(output, dpi=150, facecolor="white")
    print(f"wrote {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="output .png path")
    build(parser.parse_args().output)
