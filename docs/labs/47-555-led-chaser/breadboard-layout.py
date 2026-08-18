#!/usr/bin/env python3
"""Render the breadboard layout for the "555-Driven LED Bar Graph" lab.

The hole positions drawn here are the same ones the lab's build steps name,
so a student can hold the picture beside the page and match them one for
one. Both DIP chips straddle the centre channel (columns 3-6 for the 555,
columns 10-17 for the 74HC595), notch to the left, exactly as Chapter 15
teaches. This is the widest, most parts-heavy board in the book, so it uses
every column of the standard 30-column half-size board and both the top and
bottom power rails - the 555's VCC/RESET/timing network and both chips'
control pins are easiest to reach from whichever rail is physically closer.

Layout (column : contents):
    1        GND rail bridge (top rail <-> bottom rail)
    2        +5V rail bridge (top rail <-> bottom rail)
    3-6      555 timer, straddling the centre channel, notch left
    10-17    74HC595 shift register, straddling the centre channel, notch left
    16       also carries R9 (10k pull-up) and SW1 (reset button) below SRCLR'
    19-20    Q0 (bottom half) and Q1 (top half) LED + resistor branches
    21-22    Q2 LED + resistor branch
    23-24    Q7 LED + resistor branch
    12-15    Q3-Q6 - same pattern, not drawn individually (see build table)

Only 4 of the 8 LED branches (Q0, Q1, Q2, Q7) are drawn in full so the board
stays readable; a labeled bracket stands in for Q3-Q6, whose holes are still
named in the lab's build table.

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
PURPLE = "#6a4c93"
CHIP_BODY = "#2b2f33"


def col_x(c):
    return c * PITCH


def draw_board(ax):
    ax.add_patch(FancyBboxPatch(
        (col_x(1) - 1.4, Y_MINUS_BOT - 1.1), COLS * PITCH + 1.6, (Y_PLUS_TOP + 1.1) - (Y_MINUS_BOT - 1.1),
        boxstyle="round,pad=0.3", facecolor=BOARD, edgecolor="#c8cdd1", linewidth=1.4))

    # Centre channel - the gap the two chips straddle. It must sit strictly
    # between rows e and f so neither row looks connected across it.
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


def jumper(ax, xy1, xy2, colour, waypoints=None, lw=3.4):
    """A jumper wire. `waypoints` gives extra elbow points between the ends,
    used for long runs that must visibly clear other holes and components
    instead of cutting straight across them."""
    pts = [xy1] + (waypoints or []) + [xy2]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    ax.plot(xs, ys, color=colour, linewidth=lw, solid_capstyle="round",
            solid_joinstyle="round", zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.26, facecolor=colour, edgecolor="white",
                            linewidth=0.9, zorder=5))


def resistor(ax, xy1, xy2, band_colours=("#d35400", "#d35400", "#c62828", "#d4af37")):
    """A resistor body, oriented horizontally or vertically. `band_colours`
    defaults to orange-orange-red-gold (330 ohm); pass 4 colours to override."""
    horizontal = abs(xy2[0] - xy1[0]) >= abs(xy2[1] - xy1[1])
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.2, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = (xy1[1] + xy2[1]) / 2
    length = max(abs(xy2[0] - xy1[0]), abs(xy2[1] - xy1[1]))
    half = max(0.45, min(0.8, length / 2 - 0.15))
    if horizontal:
        box_xy, box_w, box_h = (cx - half, cy - 0.36), half * 2, 0.72
    else:
        box_xy, box_w, box_h = (cx - 0.36, cy - half), 0.72, half * 2
    ax.add_patch(FancyBboxPatch(box_xy, box_w, box_h,
                                boxstyle="round,pad=0.05", facecolor=TAN,
                                edgecolor="#b99b58", linewidth=0.9, zorder=6))
    offsets = (-half * 0.6, -half * 0.2, half * 0.25, half * 0.65)
    for off, colour in zip(offsets, band_colours):
        if horizontal:
            ax.add_patch(Rectangle((cx + off, cy - 0.36), 0.16, 0.72,
                                   facecolor=colour, edgecolor="none", zorder=7))
        else:
            ax.add_patch(Rectangle((cx - 0.36, cy + off), 0.72, 0.16,
                                   facecolor=colour, edgecolor="none", zorder=7))


def capacitor(ax, xy1, xy2, polarized=True):
    """A small electrolytic capacitor body, oriented horizontally or vertically."""
    horizontal = abs(xy2[0] - xy1[0]) >= abs(xy2[1] - xy1[1])
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.2, zorder=4)
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    cx = (xy1[0] + xy2[0]) / 2
    cy = (xy1[1] + xy2[1]) / 2
    if horizontal:
        ax.add_patch(Rectangle((cx - 0.4, cy - 0.55), 0.8, 1.1, facecolor="#1565c0",
                               edgecolor="#0d3c78", linewidth=1.0, zorder=6))
        if polarized:
            plus_xy = (cx - 0.62, cy)
        else:
            plus_xy = None
    else:
        ax.add_patch(Rectangle((cx - 0.55, cy - 0.4), 1.1, 0.8, facecolor="#1565c0",
                               edgecolor="#0d3c78", linewidth=1.0, zorder=6))
        if polarized:
            plus_xy = (cx, cy + 0.62)
        else:
            plus_xy = None
    if plus_xy:
        ax.text(*plus_xy, "+", color="white", fontsize=11, ha="center", va="center",
                fontweight="bold", zorder=7)


def led(ax, anode_xy, cathode_xy):
    """Top-down 5 mm LED: body over its two holes, flat edge on the K side."""
    cx = (anode_xy[0] + cathode_xy[0]) / 2
    cy = anode_xy[1]
    for p in (anode_xy, cathode_xy):
        ax.add_patch(Circle(p, 0.24, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.9, zorder=5))
    ax.add_patch(Circle((cx, cy), 0.62, facecolor="#66bb6a", edgecolor="#1b5e20",
                        linewidth=1.1, zorder=6))
    ax.plot([cathode_xy[0] + 0.26, cathode_xy[0] + 0.26], [cy - 0.38, cy + 0.38],
            color="#0d3311", linewidth=2.6, zorder=7)
    ax.text(anode_xy[0] - 0.62, cy, "A", color=INK, fontsize=9, ha="center",
            va="center", fontweight="bold", zorder=8)
    ax.text(cathode_xy[0] + 0.72, cy, "K", color=INK, fontsize=9, ha="center",
            va="center", fontweight="bold", zorder=8)


def pushbutton(ax, xy1, xy2):
    """A momentary push button drawn as a small square straddling its 2 legs."""
    cx = (xy1[0] + xy2[0]) / 2
    cy = (xy1[1] + xy2[1]) / 2
    for p in (xy1, xy2):
        ax.add_patch(Circle(p, 0.22, facecolor="#9e9e9e", edgecolor="white",
                            linewidth=0.8, zorder=5))
    ax.plot([xy1[0], xy2[0]], [xy1[1], xy2[1]], color="#9e9e9e", linewidth=2.0, zorder=4)
    ax.add_patch(FancyBboxPatch((cx - 0.4, cy - 0.4), 0.8, 0.8,
                                boxstyle="round,pad=0.04", facecolor="#455a64",
                                edgecolor="white", linewidth=1.0, zorder=6))
    ax.add_patch(Circle((cx, cy), 0.18, facecolor="#cfd8dc", edgecolor="#263238",
                        linewidth=0.8, zorder=7))


def ic_dip(ax, col_start, n, top_labels, bottom_labels, ref, part_name):
    """Draw an n-pin-per-side DIP chip straddling the centre channel.

    top_labels[i] / bottom_labels[i] are (pin_number, name) for column
    col_start + i, matching this book's counter-clockwise-from-the-notch
    pin numbering (Chapter 14/15).
    """
    col_end = col_start + n - 1
    x0, x1 = col_x(col_start) - 0.55, col_x(col_end) + 0.55
    y0, y1 = Y["f"] - 0.55, Y["e"] + 0.55
    ax.add_patch(FancyBboxPatch((x0, y0), x1 - x0, y1 - y0,
                                boxstyle="round,pad=0.02", facecolor=CHIP_BODY,
                                edgecolor="#0a0c0d", linewidth=1.3, zorder=8))
    # Notch: a semicircle bite out of the left edge, marking pin 1.
    ax.add_patch(Wedge((x0, (y0 + y1) / 2), 0.32, -90, 90, facecolor=BOARD,
                       edgecolor="#0a0c0d", linewidth=1.0, zorder=9))
    ax.text((x0 + x1) / 2, (y0 + y1) / 2, f"{ref}\n{part_name}", color="white",
            fontsize=9.5, ha="center", va="center", fontweight="bold", zorder=10)

    for i in range(n):
        c = col_start + i
        pin_no, name = top_labels[i]
        ax.add_patch(Circle((col_x(c), Y["e"]), 0.2, facecolor="#f4c430", edgecolor="white",
                            linewidth=0.6, zorder=9))
        ax.text(col_x(c), y1 + 0.32, f"{pin_no}", color=INK, fontsize=7.5,
                ha="center", va="center", fontweight="bold", zorder=10)
        ax.text(col_x(c), y1 + 0.68, name, color=GRAY, fontsize=6.5,
                ha="center", va="center", zorder=10)

        pin_no_b, name_b = bottom_labels[i]
        ax.add_patch(Circle((col_x(c), Y["f"]), 0.2, facecolor="#f4c430", edgecolor="white",
                            linewidth=0.6, zorder=9))
        ax.text(col_x(c), y0 - 0.32, f"{pin_no_b}", color=INK, fontsize=7.5,
                ha="center", va="center", fontweight="bold", zorder=10)
        ax.text(col_x(c), y0 - 0.68, name_b, color=GRAY, fontsize=6.5,
                ha="center", va="center", zorder=10)


def callout(ax, text, xy, xytext, colour, fontsize=9.5):
    ax.annotate(text, xy=xy, xytext=xytext, color=colour, fontsize=fontsize,
                ha="center", va="center", zorder=12,
                bbox=dict(boxstyle="round,pad=0.3", facecolor="white",
                          edgecolor=colour, linewidth=0.6, alpha=0.96),
                arrowprops=dict(arrowstyle="->", color=colour, linewidth=1.3,
                                shrinkA=2, shrinkB=6))


def led_branch(ax, pin_xy, carry_col, orientation, gnd_rail_y):
    """A resistor + LED branch from a chip pin (possibly many columns away)
    to a ground rail: a jumper wire carries the signal to `carry_col`, a
    short 330 ohm resistor bridges to the next column (the anode), the LED
    bridges to the column after that (the cathode), and a jumper drops the
    cathode to the ground rail.

    orientation: "top" uses rows a-e and the top rail; "bottom" uses rows
    f-j and the bottom rail.
    """
    row_res = "c" if orientation == "top" else "h"
    row_jump = "a" if orientation == "top" else "j"
    wire_colour = GREEN if orientation == "top" else "#1b5e20"
    y_res = Y[row_res]
    anode_col, cath_col = carry_col + 1, carry_col + 2

    carry_xy = (col_x(carry_col), y_res)
    jumper(ax, pin_xy, carry_xy, wire_colour, waypoints=[(pin_xy[0], y_res)])
    anode = (col_x(anode_col), y_res)
    resistor(ax, carry_xy, anode)
    cathode = (col_x(cath_col), y_res)
    led(ax, anode, cathode)
    jump_xy = (col_x(cath_col), Y[row_jump])
    jumper(ax, cathode, jump_xy, wire_colour)
    jumper(ax, jump_xy, (col_x(cath_col), gnd_rail_y), wire_colour)
    return carry_col, anode_col, cath_col


def build(output):
    fig, ax = plt.subplots(figsize=(24, 10.5))
    draw_board(ax)

    # ------------------------------------------------------------------
    # Rail bridges: without these the top and bottom rails are two
    # separate, unconnected power buses. Placed at the far right edge.
    # ------------------------------------------------------------------
    jumper(ax, (col_x(29), Y_MINUS_TOP), (col_x(29), Y_MINUS_BOT), BLUE,
           waypoints=[(col_x(29.6), (Y_MINUS_TOP + Y_MINUS_BOT) / 2)])
    jumper(ax, (col_x(30), Y_PLUS_TOP), (col_x(30), Y_PLUS_BOT), RED,
           waypoints=[(col_x(30.6), (Y_PLUS_TOP + Y_PLUS_BOT) / 2)])
    callout(ax, "GND rail bridge\ntop − rail → bottom − rail", (col_x(29), 3.5),
            (col_x(28.3), 5.3), BLUE, fontsize=8.5)
    callout(ax, "+5V rail bridge\ntop + rail → bottom + rail", (col_x(30), 4.2),
            (col_x(28.4), -5.6), RED, fontsize=8.5)

    # ------------------------------------------------------------------
    # 555 timer, columns 3-6, notch left.
    # ------------------------------------------------------------------
    ic_dip(
        ax, 3, 4,
        top_labels=[("1", "GND"), ("2", "TRIG"), ("3", "OUT"), ("4", "RST")],
        bottom_labels=[("8", "VCC"), ("7", "DIS"), ("6", "THR"), ("5", "CTL")],
        ref="U2", part_name="555",
    )

    # Pin 1 GND -> top GND rail.
    jumper(ax, (col_x(3), Y["a"]), (col_x(3), Y_MINUS_TOP), INK)
    # Pin 4 RESET -> top +5V rail (tied high, never resets).
    jumper(ax, (col_x(6), Y["a"]), (col_x(6), Y_PLUS_TOP), RED)
    # Pin 8 VCC -> bottom +5V rail.
    jumper(ax, (col_x(3), Y["j"]), (col_x(3), Y_PLUS_BOT), RED)

    # R1 (1k): bottom +5V rail -> pin 7 DISCHARGE's column (col 4).
    resistor(ax, (col_x(4), Y_PLUS_BOT), (col_x(4), Y["i"]))
    # R2 (13k): DISCHARGE's column (col4, row h) -> THRESHOLD's column (col5, row h).
    resistor(ax, (col_x(4), Y["h"]), (col_x(5), Y["h"]))
    # Jumper: pin 2 TRIGGER (col4, top half) -> timing node (col5, bottom half).
    jumper(ax, (col_x(4), Y["d"]), (col_x(5), Y["i"]), BLUE,
           waypoints=[(col_x(4.5), Y["f"] - 0.2)])
    # C1 (10uF electrolytic): timing node (col5, row j) -> bottom GND rail.
    capacitor(ax, (col_x(5), Y["j"]), (col_x(5), Y_MINUS_BOT))

    callout(ax, "R1  1 kΩ\n+5V rail → col 4", (col_x(4), (Y_PLUS_BOT + Y["i"]) / 2),
            (col_x(1.2), -0.6), RED, fontsize=8.5)
    callout(ax, "R2  13 kΩ\ncol 4 → col 5, row h", (col_x(4.5), Y["h"]),
            (col_x(1.3), Y["h"] + 1.3), BLUE, fontsize=8.5)
    callout(ax, "jumper: pin 2 TRIG (d4)\n→ timing node (i5)", (col_x(4), Y["d"]),
            (col_x(0.8), Y["c"] + 0.4), BLUE, fontsize=8.5)
    callout(ax, "C1  10 µF electrolytic\ntiming node → GND rail\n+ lead toward col 5, row j", (col_x(5), Y["j"] - 0.3),
            (col_x(1.3), Y_MINUS_BOT - 1.3), BLUE, fontsize=8.5)
    callout(ax, "pin 1 GND → top − rail (a3)", (col_x(3), Y["a"]),
            (col_x(3.2), Y["a"] + 1.9), INK, fontsize=8.5)
    callout(ax, "pin 4 RESET → top + rail (a6)\ntied high, never resets", (col_x(6), Y["a"]),
            (col_x(7.6), Y["b"] + 1.9), RED, fontsize=8.5)
    callout(ax, "pin 8 VCC → bottom + rail (j3)", (col_x(3), Y["j"]),
            (col_x(4.6), Y_PLUS_BOT - 1.0), RED, fontsize=8.5)

    # ------------------------------------------------------------------
    # 74HC595, columns 10-17, notch left.
    # ------------------------------------------------------------------
    ic_dip(
        ax, 10, 8,
        top_labels=[("1", "Q1"), ("2", "Q2"), ("3", "Q3"), ("4", "Q4"),
                    ("5", "Q5"), ("6", "Q6"), ("7", "Q7"), ("8", "GND")],
        bottom_labels=[("16", "VCC"), ("15", "Q0"), ("14", "SER"), ("13", "OE'"),
                       ("12", "RCLK"), ("11", "SRCLK"), ("10", "SRCLR'"), ("9", "QH'")],
        ref="U1", part_name="74HC595",
    )

    # Pin 8 GND -> top GND rail.
    jumper(ax, (col_x(17), Y["a"]), (col_x(17), Y_MINUS_TOP), INK)
    # Pin 16 VCC -> bottom +5V rail.
    jumper(ax, (col_x(10), Y["j"]), (col_x(10), Y_PLUS_BOT), RED)
    # Pin 14 SER -> bottom +5V rail (tied high, a 1 is always waiting).
    jumper(ax, (col_x(12), Y["j"]), (col_x(12), Y_PLUS_BOT), RED)
    # Pin 13 OE' -> bottom GND rail (outputs always enabled).
    jumper(ax, (col_x(13), Y["j"]), (col_x(13), Y_MINUS_BOT), INK)
    # Pin 12 RCLK <-> pin 11 SRCLK: short bridge, same row.
    jumper(ax, (col_x(14), Y["g"]), (col_x(15), Y["g"]), GREEN)

    # Pin 10 SRCLR': R9 pull-up to bottom +5V rail, SW1 to bottom GND rail.
    resistor(ax, (col_x(16), Y_PLUS_BOT), (col_x(16), Y["h"]))
    pushbutton(ax, (col_x(16), Y["j"]), (col_x(16), Y_MINUS_BOT))

    # Pin 3 OUTPUT (555) -> pin 11 SRCLK (74HC595): routed above the top
    # rail so the long run never looks like it plugs into the columns it
    # passes over.
    fly_y = Y_PLUS_TOP + 2.2
    jumper(ax, (col_x(5), Y["a"]), (col_x(15), Y["h"]), GREEN,
           waypoints=[(col_x(5), fly_y), (col_x(15), fly_y)])

    callout(ax, "pin 8 GND → top − rail (a17)", (col_x(17), Y["a"]),
            (col_x(19.2), 11.5), INK, fontsize=8.5)
    callout(ax, "pin 16 VCC → bottom\n+ rail (j10)", (col_x(10), Y["j"]),
            (col_x(9.0), Y_PLUS_BOT - 1.1), RED, fontsize=8.5)
    callout(ax, "pin 14 SER → bottom\n+ rail (j12) - tied high", (col_x(12), Y["j"]),
            (col_x(12.6), Y_PLUS_BOT - 1.5), RED, fontsize=8.5)
    callout(ax, "pin 13 OE' → bottom\n− rail (j13) - tied low", (col_x(13), Y["j"]),
            (col_x(14.6), Y_MINUS_BOT - 1.5), INK, fontsize=8.5)
    callout(ax, "pins 11+12 bridged (g14-g15):\nevery pulse shifts AND latches", (col_x(14.5), Y["g"]),
            (col_x(14.5), Y["g"] - 1.5), GREEN, fontsize=8.5)
    callout(ax, "R9  10 kΩ pull-up\n+5V rail → h16", (col_x(16), (Y_PLUS_BOT + Y["h"]) / 2),
            (col_x(23.2), -1.6), PURPLE, fontsize=8.5)
    callout(ax, "SW1 push button\nj16 → bottom − rail\npress to clear the register", (col_x(16), (Y["j"] + Y_MINUS_BOT) / 2),
            (col_x(19.8), Y_MINUS_BOT - 0.6), PURPLE, fontsize=8.5)
    callout(ax, "555 pin 3 OUT → 74HC595\npin 11 SRCLK (a5 → h15)", (col_x(10), fly_y),
            (col_x(8.0), fly_y + 1.3), GREEN, fontsize=8.5)

    # Q3-Q6 grouped note - same pattern, not drawn, to keep the board readable.
    callout(
        ax,
        "Q3-Q6 (pins 3-6, columns 12-15):\nsame 330 Ω resistor + LED pattern\nrepeats - see the build table for holes",
        (col_x(13.5), Y["c"]), (col_x(13.5), Y["a"] + 2.6), GRAY, fontsize=9,
    )

    # ------------------------------------------------------------------
    # LED branches - Q0, Q1, Q2 (full detail) and Q7 (bookend). Each carries
    # its pin out to a dedicated 3-column lane (wire, resistor, LED) instead
    # of stretching one long resistor across the whole board.
    # ------------------------------------------------------------------
    led_branch(ax, (col_x(11), Y["f"]), 18, "bottom", Y_MINUS_BOT)  # Q0, pin 15
    led_branch(ax, (col_x(10), Y["e"]), 18, "top", Y_MINUS_TOP)     # Q1, pin 1
    led_branch(ax, (col_x(11), Y["e"]), 21, "top", Y_MINUS_TOP)     # Q2, pin 2
    led_branch(ax, (col_x(16), Y["e"]), 25, "top", Y_MINUS_TOP)     # Q7, pin 7

    callout(ax, "Q0  pin 15 (bottom half)\n330 Ω + LED, cols 18-20", (col_x(18.5), Y["h"]),
            (col_x(21.8), -5.2), "#1b5e20", fontsize=8.5)
    callout(ax, "Q1  pin 1\n330 Ω + LED, cols 18-20", (col_x(18.5), Y["c"]),
            (col_x(17.6), 9.9), GREEN, fontsize=8.5)
    callout(ax, "Q2  pin 2\n330 Ω + LED, cols 21-23", (col_x(21.5), Y["c"]),
            (col_x(21.6), 9.9), GREEN, fontsize=8.5)
    callout(ax, "Q7  pin 7\n330 Ω + LED, cols 25-27", (col_x(25.5), Y["c"]),
            (col_x(26.6), 9.9), GREEN, fontsize=8.5)

    ax.text(col_x(15.5), Y_PLUS_TOP + 5.0,
            "555-Driven LED Bar Graph — breadboard layout",
            color=INK, fontsize=17, ha="center", va="center", fontweight="bold")
    ax.text(col_x(15.5), Y_PLUS_TOP + 4.1,
            "U2 (555) columns 3-6  •  U1 (74HC595) columns 10-17  •  LEDs columns 19-24  •  notch = pin 1, always to the left",
            color=GRAY, fontsize=10.5, ha="center", va="center")

    ax.set_xlim(col_x(1) - 3.0, col_x(COLS) + 4.5)
    ax.set_ylim(Y_MINUS_BOT - 2.6, Y_PLUS_TOP + 6.2)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout()
    fig.savefig(output, dpi=150, facecolor="white")
    print(f"wrote {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="output .png path")
    build(parser.parse_args().output)
