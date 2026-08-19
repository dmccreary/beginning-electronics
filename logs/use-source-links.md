# Internal Links Must Use Source Paths — Rule and Cleanup

Date: 2026-08-18

## Result

`mkdocs build` now completes with **zero warnings, errors, and link INFO messages**.

Two genuinely broken references were repaired, and **138 internal links** across 8 files
were converted from directory-style (`../list-of-symbols/`) to source-path style
(`../list-of-symbols/index.md`).

The rendered site did not change. MkDocs converts source paths back into site URLs at
build time, so every `href` in `site/` is byte-identical to what it was before. The only
difference is that the links are now **machine-checkable**.

## The rule

**Always write internal links as the path to the Markdown source file, never as the
published URL.**

| Target on disk | Write the link as | Not |
|---|---|---|
| `docs/setup/breadboard-kits.md` (flat file) | `../setup/breadboard-kits.md` | `../setup/breadboard-kits/` |
| `docs/appendices/list-of-symbols/index.md` (directory) | `../list-of-symbols/index.md` | `../list-of-symbols/` |
| the same, with an anchor | `../list-of-symbols/index.md#resistor` | `../list-of-symbols/#resistor` |

The suffix depends on the target's shape on disk, so check before writing:

- Target is a plain `.md` file → append `.md`
- Target is a directory holding an `index.md` → append `/index.md`

Both shapes exist in this book. `docs/labs/` mixes them: `09-power.md` is a flat file
while `10-led-circuit/index.md` is a directory. Guessing one form for the whole folder
will be wrong roughly half the time.

## Why this matters

MkDocs resolves links against **source files**, not built URLs. A source-path link is
therefore validated at build time: if the target is renamed, moved, or deleted, the build
tells you. A directory-style link is unverifiable — MkDocs logs
`unrecognized relative link ... left as is` and emits the link untouched.

"Left as is" is the dangerous part. The link happens to work today because
`use_directory_urls` defaults to `true`, which publishes every page at a directory-shaped
URL. But:

- It **silently rots**. Rename the target and the build stays green while the link 404s.
- It **breaks entirely if `use_directory_urls` is ever set to `false`**, since
  `/appendices/list-of-symbols/` stops being a real URL.
- It **buries real breakage in noise**. 138 INFO lines made the two actual `WARNING`s
  easy to miss — which is exactly how they survived until now.

## Exceptions — do NOT add `.md` to these

**Assets keep their real relative path.** Images, SVGs, and downloads point at the actual
file and are already validated:

```markdown
![555 timer circuit symbol](../list-of-symbols/symbols/555-timer.svg)
```

`docs/appendices/symbol-gallery/index.md` has 100 of these sitting alongside 100 page
links under the *same* `../list-of-symbols/` prefix. Only the page links change.

**Raw HTML attributes are never rewritten by MkDocs.** MicroSim iframes must keep the
literal path to the built file:

```html
<iframe src="../../sims/led-resistor-calc/main.html" ...></iframe>
```

`main.html` is a real file copied verbatim into `site/`, not a page MkDocs renders. Adding
`.md` there would break the embed.

**External `http(s)://` links** are untouched.

## How to check

```bash
mkdocs build 2>&1 | grep -E '^(WARNING|ERROR)|unrecognized relative link'
```

Silence means clean. Treat the INFO link messages as build failures, not noise — they are
the early-warning system for the rot described above.

## What was actually broken

Two `WARNING`s, both stale references left behind by earlier commits:

1. **`mkdocs.yml`** listed `sims/template/index.md` in `nav`, but that directory was
   deleted in `22afa12` ("removed template since the templates now live in the microsim
   generator skill"). The nav entry was never removed. Deleted.
2. **`docs/labs/index.md`** linked to `./14-rgb-led.md`, but that lab had become a
   directory, `14-rgb-led/index.md`. Corrected.

Neither was discoverable by eye at the time, because both scrolled past inside 138 lines
of INFO.

## Files changed in the sweep

| File | Links |
|---|---|
| `docs/appendices/symbol-gallery/index.md` | 101 |
| `docs/appendices/parts-list/index.md` | 22 |
| `docs/appendices/index.md` | 4 |
| `docs/setup/safe-power-for-learning/index.md` | 4 |
| `docs/setup/power-supplies.md` | 3 |
| `docs/chapters/16-switches-buttons-wired-logic/index.md` | 2 |
| `docs/labs/09-power.md` | 1 |
| `docs/setup/index.md` | 1 |

## Notes for anyone repeating this

The rewrite was driven off MkDocs' own `Did you mean '...'` output rather than a
hand-written guess at each path, so each link received the suffix MkDocs itself resolved.
That is the reliable way to do a bulk fix: let the tool decide flat-file vs. directory, and
only touch link strings it explicitly flagged. Asset paths were never at risk because
MkDocs never reported them.

One trap worth knowing: the `Did you mean` suggestion **carries the anchor**
(`...index.md#resistor`). Testing that string with `endswith('.md')` silently skips every
anchored link — 102 of the 138 here. Strip the anchor before inspecting the suffix.

`docs/labs/TODO.md` still references `14-rgb-led.md` in machine-parsed HTML comment
markers. It is listed in `exclude_docs`, so it does not affect the build, and its markers
were deliberately left alone.
