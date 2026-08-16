#!/usr/bin/env python3
"""
trim-padding-from-image.py — trim transparent padding from a PNG, leaving a
uniform border of a few pixels around the visible content.

Referenced by docs/img/mascot/image-prompts.md. AI image tools return the
mascot centered in a large mostly-empty square; without trimming, the mascot
renders tiny inside an admonition because most of the PNG is empty space.

Usage:
    python3 src/image-utils/trim-padding-from-image.py docs/img/mascot/welcome.png
    python3 src/image-utils/trim-padding-from-image.py docs/img/mascot/*.png
    python3 src/image-utils/trim-padding-from-image.py --border 8 --dry-run img/foo.png

The defaults (4 px border, alpha threshold 10) are the values the mascot test
page at docs/learning-graph/mascot-test.md asserts, so changing them here will
make that page report failures.
"""

import argparse
import os
import sys

# Same guard as image-tasks/bin/igq — this script is part of the same image
# pipeline. Python inside WSL reports sys.platform == "linux", so running it
# from a WSL shell works normally.
if sys.platform == "win32" or os.name == "nt":
    sys.exit(
        "\n"
        "This script does not run natively on Windows.\n"
        "\n"
        "Install Windows Subsystem for Linux (WSL), then run it from inside\n"
        "the WSL shell. In PowerShell as Administrator:\n"
        "\n"
        "    wsl --install\n"
    )

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip3 install pillow")

DEFAULT_BORDER = 4
DEFAULT_THRESHOLD = 10


def trim(path, border=DEFAULT_BORDER, threshold=DEFAULT_THRESHOLD,
         dry_run=False, optimize=True):
    im = Image.open(path)
    if im.mode != "RGBA":
        im = im.convert("RGBA")

    w, h = im.size
    alpha = im.getchannel("A")

    # Content = anything more opaque than the threshold.
    mask = alpha.point(lambda v: 255 if v > threshold else 0)
    bbox = mask.getbbox()

    if bbox is None:
        print(f"  {os.path.basename(path)}: fully transparent — skipped")
        return False

    cur_border = min(bbox[0], bbox[1], w - bbox[2], h - bbox[3])
    if cur_border == border:
        print(f"  {os.path.basename(path)}: already has a {border}px border — unchanged")
        return False

    left = max(bbox[0] - border, 0)
    top = max(bbox[1] - border, 0)
    right = min(bbox[2] + border, w)
    bottom = min(bbox[3] + border, h)
    out = im.crop((left, top, right, bottom))

    # If the content ran to the edge, pad back out so the border is uniform.
    need_l = border - (bbox[0] - left)
    need_t = border - (bbox[1] - top)
    need_r = border - (right - bbox[2])
    need_b = border - (bottom - bbox[3])
    if any(n > 0 for n in (need_l, need_t, need_r, need_b)):
        padded = Image.new("RGBA",
                           (out.width + max(need_l, 0) + max(need_r, 0),
                            out.height + max(need_t, 0) + max(need_b, 0)),
                           (0, 0, 0, 0))
        padded.paste(out, (max(need_l, 0), max(need_t, 0)))
        out = padded

    before_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {w}x{h} -> {out.width}x{out.height} "
          f"(border {cur_border}px -> {border}px)", end="")

    if dry_run:
        print("  [dry run]")
        return False

    out.save(path, "PNG", optimize=optimize)
    after_kb = os.path.getsize(path) / 1024
    print(f", {before_kb:.0f} KB -> {after_kb:.0f} KB")
    return True


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("images", nargs="+", help="PNG file(s) to trim, in place")
    p.add_argument("--border", type=int, default=DEFAULT_BORDER,
                   help=f"pixels of transparent margin to leave (default {DEFAULT_BORDER})")
    p.add_argument("--threshold", type=int, default=DEFAULT_THRESHOLD,
                   help=f"alpha above which a pixel counts as content (default {DEFAULT_THRESHOLD})")
    p.add_argument("--dry-run", action="store_true", help="report what would change")
    args = p.parse_args()

    print(f"Trimming to a {args.border}px border (alpha threshold {args.threshold}):")
    changed = 0
    for path in args.images:
        if not os.path.exists(path):
            print(f"  {path}: not found — skipped")
            continue
        try:
            if trim(path, args.border, args.threshold, args.dry_run):
                changed += 1
        except Exception as e:
            print(f"  {path}: ERROR {e}")
    print(f"\n{changed} file(s) changed.")


if __name__ == "__main__":
    main()
