#!/usr/bin/env python3
"""Perform deterministic structural checks on rendered circuit images."""

from __future__ import annotations

import argparse
import ast
import re
import struct
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


MIN_FILE_BYTES = 500
VISIBLE_SVG_TAGS = {
    "circle",
    "ellipse",
    "image",
    "line",
    "path",
    "polygon",
    "polyline",
    "rect",
    "text",
    "use",
}


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def positive_svg_length(value: str | None) -> bool:
    if not value:
        return False
    match = re.match(r"\s*([0-9]+(?:\.[0-9]+)?)", value)
    return bool(match and float(match.group(1)) > 0)


def validate_svg(path: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as exc:
        return [f"invalid SVG XML: {exc}"], warnings

    if local_name(root.tag) != "svg":
        errors.append("root element is not <svg>")

    view_box = root.get("viewBox")
    has_positive_view_box = False
    if view_box:
        try:
            values = [float(item) for item in view_box.replace(",", " ").split()]
            has_positive_view_box = len(values) == 4 and values[2] > 0 and values[3] > 0
        except ValueError:
            pass
    if not has_positive_view_box and not (
        positive_svg_length(root.get("width")) and positive_svg_length(root.get("height"))
    ):
        errors.append("SVG has no positive dimensions or viewBox")

    visible = [node for node in root.iter() if local_name(node.tag) in VISIBLE_SVG_TAGS]
    if len(visible) < 3:
        errors.append(f"SVG has too few visible primitives ({len(visible)})")

    text_nodes = ["".join(node.itertext()).strip() for node in root.iter() if local_name(node.tag) == "text"]
    if not any(text_nodes):
        warnings.append("SVG has no searchable text nodes; labels may have been converted to paths")

    serialized_text = " ".join(root.itertext()).lower()
    if "traceback" in serialized_text or "error:" in serialized_text:
        errors.append("SVG appears to contain an error message")
    return errors, warnings


def validate_png(path: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    with path.open("rb") as stream:
        header = stream.read(24)
    if len(header) < 24 or header[:8] != b"\x89PNG\r\n\x1a\n":
        return ["invalid PNG signature or truncated header"], warnings
    width, height = struct.unpack(">II", header[16:24])
    if width < 100 or height < 100:
        errors.append(f"PNG dimensions are suspiciously small ({width}x{height})")
    if width > 12000 or height > 12000:
        warnings.append(f"PNG dimensions are unusually large ({width}x{height})")

    try:
        from PIL import Image, ImageStat

        with Image.open(path) as image:
            image.verify()
        with Image.open(path).convert("RGB") as image:
            extrema = ImageStat.Stat(image).extrema
            if all(low == high for low, high in extrema):
                errors.append("PNG appears blank or single-color")
    except ImportError:
        warnings.append("Pillow unavailable; skipped decoded-pixel blank-image check")
    except Exception as exc:  # Pillow provides format-specific exception classes.
        errors.append(f"PNG decode failed: {exc}")
    return errors, warnings


def validate(path: Path) -> tuple[list[str], list[str]]:
    if not path.is_file():
        return ["file does not exist"], []
    size = path.stat().st_size
    if size < MIN_FILE_BYTES:
        return [f"file is too small ({size} bytes)"], []
    suffix = path.suffix.lower()
    if suffix == ".svg":
        return validate_svg(path)
    if suffix == ".png":
        return validate_png(path)
    return [f"unsupported image type: {suffix or '(none)'}"], []


def validate_source(path: Path) -> tuple[list[str], list[str]]:
    """Check that a Python source file has the required prompt contract."""
    if not path.is_file():
        return ["source file does not exist"], []
    try:
        module = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    except (OSError, UnicodeError, SyntaxError) as exc:
        return [f"cannot parse Python source: {exc}"], []

    docstring = ast.get_docstring(module, clean=False)
    if not docstring:
        return ["first module statement must be a docstring containing Prompt:"], []
    match = re.search(
        r"(?:^|\n)Prompt:\s*(.+?)(?=\n(?:Topology|Assumptions):|\Z)",
        docstring,
        flags=re.DOTALL,
    )
    if not match or not match.group(1).strip():
        return ["module docstring has no non-empty Prompt: block"], []
    prompt = match.group(1).strip()
    if "<" in prompt or ">" in prompt:
        return ["Prompt: block appears to contain template placeholders"], []
    if len(prompt) < 30:
        return ["Prompt: block is too short to be a complete circuit description"], []
    return [], []


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, help="Python circuit program to validate")
    parser.add_argument("images", nargs="+", type=Path, help="SVG or PNG files to validate")
    args = parser.parse_args()
    failed = False
    if args.source:
        errors, warnings = validate_source(args.source)
        status = "FAIL" if errors else "PASS"
        print(f"[{status}] {args.source} (prompt contract)")
        for warning in warnings:
            print(f"  warning: {warning}")
        for error in errors:
            print(f"  error: {error}")
        failed = failed or bool(errors)
    for path in args.images:
        errors, warnings = validate(path)
        status = "FAIL" if errors else "PASS"
        print(f"[{status}] {path}")
        for warning in warnings:
            print(f"  warning: {warning}")
        for error in errors:
            print(f"  error: {error}")
        failed = failed or bool(errors)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
