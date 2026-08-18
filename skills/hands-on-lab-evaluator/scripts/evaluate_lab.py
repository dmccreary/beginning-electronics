#!/usr/bin/env python3
"""Collect objective quality signals for a hands-on lab page.

This script does not assign the quality score - scoring needs judgment about
whether an explanation actually teaches. What it does is the mechanical work
that is tedious and easy to get wrong by eye: resolving every image and iframe
path the way MkDocs really resolves it, checking that referenced MicroSims
exist and are interactive, measuring reading level against the 8th grade
target, counting build steps and quiz questions, and flagging parts that are
not in the $50 kit.

Usage:
    python3 evaluate_lab.py docs/labs/10-led-circuit.md
    python3 evaluate_lab.py docs/labs/10-led-circuit.md --json
    python3 evaluate_lab.py docs/labs/10-led-circuit.md --set-score 87

A lab may be a flat file (docs/labs/NN-slug.md) or a directory containing
index.md (docs/labs/NN-slug/index.md). Both forms are accepted.
"""

import argparse
import json
import os
import re
import sys

# --------------------------------------------------------------------------
# Project layout
# --------------------------------------------------------------------------


def find_project_root(start):
    d = os.path.abspath(start)
    while d != os.path.dirname(d):
        if os.path.isfile(os.path.join(d, "mkdocs.yml")):
            return d
        d = os.path.dirname(d)
    return None


def resolve_lab_path(path):
    """Accept a .md file or a directory holding index.md."""
    if os.path.isdir(path):
        candidate = os.path.join(path, "index.md")
        if os.path.isfile(candidate):
            return candidate
        raise SystemExit(f"ERROR: {path} is a directory with no index.md")
    if os.path.isfile(path):
        return path
    raise SystemExit(f"ERROR: no such lab page: {path}")


# --------------------------------------------------------------------------
# Frontmatter
# --------------------------------------------------------------------------

FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n?", re.DOTALL)


def split_frontmatter(text):
    """Return (frontmatter_dict, raw_frontmatter, body). Order preserved."""
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}, None, text
    raw = m.group(1)
    data = {}
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line or line.startswith((" ", "\t", "-")):
            continue
        key, _, value = line.partition(":")
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data, raw, text[m.end():]


# Score band -> (status key, band name). The status key is what MkDocs Material
# turns into the coloured marker in the nav; the keys must stay in sync with
# `extra.status` in mkdocs.yml and the rules in docs/css/extra.css.
STATUS_BANDS = [
    (90, "complete", "Publish-ready"),
    (80, "almost-complete", "Classroom-ready"),
    (65, "in-progress", "Teachable but incomplete"),
    (40, "early-stage", "Draft"),
    (0, "stub", "Stub"),
]


def band_for(score):
    """Return (status_key, band_name) for a 0-100 score."""
    for threshold, status, band in STATUS_BANDS:
        if score >= threshold:
            return status, band
    return "stub", "Stub"


def title_from_filename(lab_file):
    """Readable placeholder title for a lab with no H1 yet - empty stubs, mostly."""
    name = os.path.basename(os.path.dirname(lab_file)) \
        if os.path.basename(lab_file) == "index.md" else os.path.splitext(os.path.basename(lab_file))[0]
    name = re.sub(r"^\d+[-_]", "", name).replace("-", " ").replace("_", " ")
    return name.strip().title() or "Untitled Lab"


def _upsert(lines, key, value):
    """Set key: value in frontmatter lines, keeping existing position if present."""
    for i, line in enumerate(lines):
        if re.match(rf"^{key}\s*:", line):
            lines[i] = f"{key}: {value}"
            return
    insert_at = len(lines)
    for i, line in enumerate(lines):
        if re.match(r"^(title|description|quality_score)\s*:", line):
            insert_at = i + 1
    lines.insert(insert_at, f"{key}: {value}")


def set_quality_score(lab_file, score, status=None):
    """Write quality_score and status into the page frontmatter, creating it if needed.

    Both go in the page itself rather than a side file so they travel with the
    content, show up in a diff when a lab improves, and - for status - drive the
    marker Material renders beside the lab in the nav.
    """
    status = status or band_for(score)[0]
    with open(lab_file, encoding="utf-8") as f:
        text = f.read()
    fm, raw, body = split_frontmatter(text)

    if raw is None:
        h1 = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
        title = h1.group(1).strip() if h1 else title_from_filename(lab_file)
        new = (f'---\ntitle: "{title}"\nquality_score: {score}\nstatus: {status}\n---\n\n'
               + body.lstrip("\n"))
    else:
        lines = raw.splitlines()
        _upsert(lines, "quality_score", score)
        _upsert(lines, "status", status)
        new = "---\n" + "\n".join(lines) + "\n---\n" + body

    with open(lab_file, "w", encoding="utf-8") as f:
        f.write(new)
    return new


# --------------------------------------------------------------------------
# Text cleaning
# --------------------------------------------------------------------------

FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
HTML_TAG_RE = re.compile(r"<[^>]+>")
MD_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)(?:\s+[^)]*)?\)")
MD_LINK_RE = re.compile(r"(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+[^)]*)?\)")
HTML_SRC_RE = re.compile(r"<(iframe|img)\b[^>]*?\bsrc=[\"']([^\"']+)[\"'][^>]*>", re.IGNORECASE)


def prose_only(body):
    """Strip code, HTML, tables and markup so readability reflects what students read."""
    text = FENCE_RE.sub(" ", body)
    text = re.sub(r"`[^`]*`", " ", text)
    text = re.sub(r"^\s*\|.*$", " ", text, flags=re.MULTILINE)  # tables
    text = re.sub(r"\$\$.*?\$\$", " ", text, flags=re.DOTALL)   # block math
    text = re.sub(r"^#{1,6}\s+.*$", " ", text, flags=re.MULTILINE)  # headings
    text = HTML_TAG_RE.sub(" ", text)
    text = MD_IMAGE_RE.sub(" ", text)
    text = MD_LINK_RE.sub(r"\1", text)
    text = re.sub(r"[*_>]+", " ", text)
    text = re.sub(r"^\s*(?:[-+*]|\d+[.)])\s+", " ", text, flags=re.MULTILINE)  # list markers
    # A list item or short line is a sentence even without a period. Without
    # this, consecutive lines merge and every readability number is inflated.
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped and not stripped.endswith((".", "!", "?", ":", ";")):
            stripped += "."
        lines.append(stripped)
    return "\n".join(lines)


# --------------------------------------------------------------------------
# Readability
# --------------------------------------------------------------------------

VOWEL_GROUP_RE = re.compile(r"[aeiouy]+")


def count_syllables(word):
    word = word.lower().strip("'’")
    if not word:
        return 0
    groups = VOWEL_GROUP_RE.findall(word)
    n = len(groups)
    if word.endswith("e") and not word.endswith(("le", "ee", "ye")) and n > 1:
        n -= 1
    return max(n, 1)


def readability(text):
    sentences = [s.strip() for s in re.split(r"[.!?]+(?:\s|$)", text) if len(s.split()) >= 3]
    words = re.findall(r"[A-Za-z][A-Za-z'’-]*", text)
    if not sentences or not words:
        return None
    syllables = sum(count_syllables(w) for w in words)
    wps = len(words) / len(sentences)
    spw = syllables / len(words)
    fk_grade = 0.39 * wps + 11.8 * spw - 15.59
    long_sentences = sorted(
        (s for s in sentences if len(s.split()) > 25),
        key=lambda s: -len(s.split()),
    )
    return {
        "words": len(words),
        "sentences": len(sentences),
        "words_per_sentence": round(wps, 1),
        "fk_grade": round(fk_grade, 1),
        "long_sentences": len(long_sentences),
        "longest_examples": [" ".join(s.split())[:150] for s in long_sentences[:3]],
    }


# --------------------------------------------------------------------------
# Kit inventory
# --------------------------------------------------------------------------


def load_kit_inventory(skill_dir):
    """Parse references/kit-inventory.md into (in_kit, out_of_kit) alias lists."""
    path = os.path.join(skill_dir, "references", "kit-inventory.md")
    in_kit, out_of_kit = [], []
    if not os.path.isfile(path):
        return in_kit, out_of_kit
    bucket = None
    with open(path, encoding="utf-8") as f:
        for line in f:
            heading = re.match(r"^##\s+(.*)$", line)
            if heading:
                title = heading.group(1).lower()
                bucket = "in" if "in-kit" in title else ("out" if "out-of-kit" in title else None)
                continue
            if bucket and line.lstrip().startswith("- "):
                aliases = [a.strip().lower() for a in line.lstrip()[2:].split("|") if a.strip()]
                if aliases:
                    (in_kit if bucket == "in" else out_of_kit).append(aliases)
    return in_kit, out_of_kit


def classify_parts(items, in_kit, out_of_kit):
    results = []
    for item in items:
        low = item.lower()
        matched_in = next((a[0] for a in in_kit if any(alias in low for alias in a)), None)
        matched_out = next((a[0] for a in out_of_kit if any(alias in low for alias in a)), None)
        if matched_out and not matched_in:
            status = "OUT-OF-KIT"
        elif matched_in:
            status = "in-kit"
        else:
            status = "unrecognized"
        results.append({"item": item, "status": status, "matched": matched_in or matched_out})
    return results


# --------------------------------------------------------------------------
# Section detection
# --------------------------------------------------------------------------

SECTION_PATTERNS = [
    ("objectives", r"objective|goal|what you.?ll learn|learning target|superpower you"),
    ("materials", r"material|parts list|part list|components?\b|bill of material|what you.?ll need|you will need"),
    ("safety", r"safety|before you power|be careful|handle with care"),
    ("circuit_diagram", r"circuit diagram|schematic|circuit symbol"),
    ("breadboard", r"breadboard|wiring layout|wire it up|layout"),
    ("procedure", r"procedure|step.by.step|build|instructions|assembl|construction"),
    ("microsim", r"microsim|simulat|interactive|try it|explore it|before you build"),
    ("explanation", r"how it works|why it works|what.?s happening|the science|behind the"),
    ("troubleshooting", r"troubleshoot|if it does|not working|does\s?n.?t work|won.?t work|"
                        r"nothing happens|common (mistake|problem)|when things go wrong|fix it"),
    ("quiz", r"quiz|check your understanding|review question|self.?check|test yourself|what did you learn"),
    ("extensions", r"extension|challenge|going further|take it further|on your own|experiment with|try this next"),
    ("resources", r"resource|reference|learn more|further reading|dig deeper|links"),
]


def detect_sections(headings):
    found = {}
    for key, pattern in SECTION_PATTERNS:
        rx = re.compile(pattern, re.IGNORECASE)
        match = next((h for _, h in headings if rx.search(h)), None)
        found[key] = match
    return found


# --------------------------------------------------------------------------
# Asset resolution
# --------------------------------------------------------------------------


def asset_report(body, lab_file, docs_dir):
    """Resolve every referenced asset the way MkDocs actually resolves it.

    Markdown links and images are rewritten by MkDocs relative to the SOURCE
    file. Raw HTML src attributes are not rewritten - the browser resolves them
    against the RENDERED page URL, which for both `labs/x.md` and
    `labs/x/index.md` is the directory `labs/x/`. Mixing the two conventions up
    is the single most common broken-asset bug in this book.
    """
    src_dir = os.path.dirname(lab_file)
    slug = os.path.basename(os.path.dirname(lab_file)) if os.path.basename(lab_file) == "index.md" \
        else os.path.splitext(os.path.basename(lab_file))[0]
    url_dir = src_dir if os.path.basename(lab_file) == "index.md" else os.path.join(src_dir, slug)

    def check(ref, base):
        if ref.startswith(("http://", "https://", "mailto:", "#")):
            return None
        target = os.path.normpath(os.path.join(base, ref.split("#")[0].split("?")[0]))
        return {"ref": ref, "path": os.path.relpath(target, docs_dir), "exists": os.path.exists(target)}

    images, links, embeds = [], [], []

    for alt, ref in MD_IMAGE_RE.findall(body):
        info = check(ref, src_dir)
        if info:
            info["alt"] = alt
            info["kind"] = "markdown-image"
            images.append(info)

    for text, ref in MD_LINK_RE.findall(body):
        if ref.startswith(("http://", "https://")):
            links.append({"ref": ref, "text": text, "external": True})
        else:
            info = check(ref, src_dir)
            if info:
                info["text"] = text
                info["external"] = False
                links.append(info)

    for tag, ref in HTML_SRC_RE.findall(body):
        info = check(ref, url_dir)
        if info is None:
            embeds.append({"ref": ref, "tag": tag.lower(), "external": True})
            continue
        info["tag"] = tag.lower()
        info["external"] = False
        # A frequent mistake: an author uses the source-relative depth in raw HTML.
        alt_info = check(ref, src_dir)
        info["would_exist_source_relative"] = bool(alt_info and alt_info["exists"])
        embeds.append(info)

    return images, links, embeds


P5_CONTROLS = ["createSlider", "createButton", "createCheckbox", "createSelect",
               "createInput", "mousePressed", "mouseDragged", "keyPressed", "touchStarted"]
FLOW_TOKENS = ["flowPhase", "currentFlow", "animateCurrent", "electron", "dashOffset",
               "flowOffset", "current", "animatePhase", "chargeFlow"]


def inspect_microsim(embed, docs_dir):
    """Report whether an embedded sim exists, is interactive, and animates current."""
    if embed.get("external") or not embed.get("path"):
        return None
    sim_dir = os.path.dirname(os.path.join(docs_dir, embed["path"]))
    if not os.path.isdir(sim_dir):
        return {"sim_dir": embed["path"], "exists": False}
    source = ""
    for name in sorted(os.listdir(sim_dir)):
        if name.endswith((".js", ".html")):
            try:
                with open(os.path.join(sim_dir, name), encoding="utf-8", errors="ignore") as f:
                    source += f.read()
            except OSError:
                pass
    return {
        "sim_dir": os.path.relpath(sim_dir, docs_dir),
        "exists": True,
        "controls": sorted({c for c in P5_CONTROLS if c in source}),
        "flow_tokens": sorted({t for t in FLOW_TOKENS if t in source}),
        "has_index_md": os.path.isfile(os.path.join(sim_dir, "index.md")),
    }


# --------------------------------------------------------------------------
# Content counts
# --------------------------------------------------------------------------

CHECKPOINT_RE = re.compile(
    r"you should (see|hear|notice|now)|the led should|check that|confirm that|"
    r"if nothing happens|stop and check|does it work|verify|checkpoint|"
    r"stop here|before you power|you are done when|you.?re done when",
    re.IGNORECASE)
SAFETY_RE = re.compile(
    r"short circuit|polarity|backwards|unplug|disconnect the power|power off|"
    r"never connect|current.limiting|too much current|magic smoke|hot to the touch",
    re.IGNORECASE)


def section_body(body, heading_text):
    """Return the text under a heading, up to the next heading of any level."""
    if not heading_text:
        return ""
    pattern = re.compile(r"^#{1,6}\s+.*" + re.escape(heading_text[:40]) + r".*$", re.MULTILINE)
    m = pattern.search(body)
    if not m:
        return ""
    rest = body[m.end():]
    nxt = re.search(r"^#{1,6}\s+", rest, re.MULTILINE)
    return rest[:nxt.start()] if nxt else rest


def list_items(text):
    """Items from a section, whether written as a list or as a table.

    The reference lab format asks for the parts list as a table with quantity
    and identifying marks, so a parser that only understood bullets would
    report zero parts for exactly the labs that did it right.
    """
    items = []
    for line in text.splitlines():
        m = re.match(r"^\s*(?:[-*+]|\d+[.)])\s+(.*)$", line)
        if m and m.group(1).strip():
            items.append(m.group(1).strip())
            continue
        if line.strip().startswith("|") and not re.match(r"^\s*\|[\s:|-]+\|?\s*$", line):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            # Skip the header row: it labels the columns rather than naming a part.
            if any(re.search(r"^(qty|quantity|part|component|item|value|how to spot)$", c, re.I)
                   for c in cells):
                continue
            joined = " ".join(c for c in cells if c)
            if joined:
                items.append(joined)
    return items


def count_quiz(body, quiz_heading):
    scope = section_body(body, quiz_heading) or body
    collapsible = len(re.findall(r"^\?{3}\+?\s+\w+", scope, re.MULTILINE))
    numbered = len(re.findall(r"^\s*\d+[.)]\s+.*\?\s*$", scope, re.MULTILINE))
    question_marks = scope.count("?")
    answers = len(re.findall(r"answer|correct", scope, re.IGNORECASE))
    options = len(re.findall(r"^\s*[-*]?\s*\(?[A-Da-d][).]\s+\S", scope, re.MULTILINE))
    return {
        "collapsible_blocks": collapsible,
        "numbered_questions": numbered,
        "question_marks": question_marks,
        "answer_mentions": answers,
        "option_lines": options,
    }


def mascot_report(body, images):
    uses = re.findall(r"^!!!\s+mascot-(\w+)", body, re.MULTILINE)
    lines = body.splitlines()
    back_to_back = 0
    last = None
    for i, line in enumerate(lines):
        if line.startswith("!!! mascot-"):
            if last is not None and i - last < 6:
                back_to_back += 1
            last = i
    missing_img = [i["ref"] for i in images if "mascot" in i["ref"] and not i["exists"]]
    return {"total": len(uses), "types": sorted(set(uses)),
            "possible_back_to_back": back_to_back, "missing_images": missing_img}


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------


def analyze(lab_file, project_root, skill_dir):
    docs_dir = os.path.join(project_root, "docs")
    with open(lab_file, encoding="utf-8") as f:
        text = f.read()
    fm, _, body = split_frontmatter(text)

    headings = [(len(m.group(1)), m.group(2).strip())
                for m in re.finditer(r"^(#{1,6})\s+(.+)$", body, re.MULTILINE)]
    sections = detect_sections(headings)
    images, links, embeds = asset_report(body, lab_file, docs_dir)
    sims = [s for s in (inspect_microsim(e, docs_dir) for e in embeds if e.get("tag") == "iframe") if s]

    materials_text = section_body(body, sections["materials"])
    in_kit, out_of_kit = load_kit_inventory(skill_dir)
    parts = classify_parts(list_items(materials_text), in_kit, out_of_kit)

    procedure_text = section_body(body, sections["procedure"])
    build_steps = len(re.findall(r"^\s*\d+[.)]\s+", procedure_text, re.MULTILINE))
    if build_steps == 0:
        build_steps = len(re.findall(r"^\s*\d+[.)]\s+", body, re.MULTILINE))

    trouble_text = section_body(body, sections["troubleshooting"])
    trouble_rows = len([l for l in trouble_text.splitlines()
                        if l.strip().startswith("|") and not re.match(r"^\s*\|[\s:|-]+\|\s*$", l)])

    prose = prose_only(body)
    return {
        "file": os.path.relpath(lab_file, project_root),
        "frontmatter": {
            "present": bool(fm),
            "title": fm.get("title"),
            "description": fm.get("description"),
            "quality_score": fm.get("quality_score"),
        },
        "headings": [{"level": lv, "text": t} for lv, t in headings],
        "sections": sections,
        "missing_sections": [k for k, v in sections.items() if not v],
        "images": images,
        "broken_images": [i for i in images if not i["exists"]],
        "images_without_alt": [i["ref"] for i in images if not i["alt"].strip()],
        "embeds": embeds,
        "broken_embeds": [e for e in embeds if not e.get("external") and not e.get("exists")],
        "microsims": sims,
        "links": {
            "internal_broken": [l for l in links if not l.get("external") and not l.get("exists")],
            "external_count": len([l for l in links if l.get("external")]),
            "external": [l["ref"] for l in links if l.get("external")][:25],
        },
        "materials": {"items": len(parts), "parts": parts},
        "procedure": {
            "numbered_steps": build_steps,
            "checkpoint_phrases": len(CHECKPOINT_RE.findall(body)),
        },
        "safety_phrases": len(SAFETY_RE.findall(body)),
        "troubleshooting_rows": trouble_rows,
        "quiz": count_quiz(body, sections["quiz"]),
        "mascot": mascot_report(body, images),
        "tables": len(re.findall(r"^\s*\|.*\|\s*$", body, re.MULTILINE)),
        "readability": readability(prose),
        "body_words": len(prose.split()),
    }


def print_report(r):
    def head(t):
        print(f"\n{t}\n" + "-" * len(t))

    print(f"SIGNALS FOR {r['file']}")
    print(f"  words: {r['body_words']}   headings: {len(r['headings'])}   tables: {r['tables']}")

    fm = r["frontmatter"]
    head("Frontmatter")
    print(f"  present: {fm['present']}   title: {fm['title']}")
    print(f"  description: {'yes' if fm['description'] else 'MISSING'}   quality_score: {fm['quality_score'] or 'MISSING'}")

    head("Sections")
    for key, _ in SECTION_PATTERNS:
        found = r["sections"][key]
        print(f"  {'[x]' if found else '[ ]'} {key:<16} {found or '-- not found --'}")

    head("Assets")
    print(f"  images: {len(r['images'])} ({len(r['broken_images'])} broken, "
          f"{len(r['images_without_alt'])} missing alt text)")
    for i in r["broken_images"]:
        print(f"    BROKEN IMAGE  {i['ref']}  ->  docs/{i['path']}")
    for e in r["broken_embeds"]:
        hint = "  (path depth looks source-relative; raw HTML needs URL-relative depth)" \
            if e.get("would_exist_source_relative") else ""
        print(f"    BROKEN {e['tag'].upper():<6} {e['ref']}  ->  docs/{e['path']}{hint}")
    for l in r["links"]["internal_broken"]:
        print(f"    BROKEN LINK   {l['ref']}  ->  docs/{l['path']}")
    print(f"  external links: {r['links']['external_count']}")

    head("MicroSims")
    if not r["microsims"]:
        print("  none embedded")
    for s in r["microsims"]:
        if not s["exists"]:
            print(f"  MISSING SIM  {s['sim_dir']}")
            continue
        print(f"  {s['sim_dir']}")
        print(f"    controls: {', '.join(s['controls']) or 'NONE FOUND - sim may not be interactive'}")
        print(f"    current-flow tokens: {', '.join(s['flow_tokens']) or 'NONE FOUND - check for animation'}")

    head("Materials")
    print(f"  listed items: {r['materials']['items']}")
    for p in r["materials"]["parts"]:
        if p["status"] != "in-kit":
            print(f"    {p['status']:<13} {p['item'][:80]}")

    head("Procedure and assessment")
    print(f"  numbered build steps: {r['procedure']['numbered_steps']}")
    print(f"  checkpoint phrases ('you should see...'): {r['procedure']['checkpoint_phrases']}")
    print(f"  safety phrases: {r['safety_phrases']}")
    print(f"  troubleshooting table rows: {r['troubleshooting_rows']}")
    q = r["quiz"]
    print(f"  quiz: {q['collapsible_blocks']} collapsible blocks, "
          f"{q['numbered_questions']} numbered questions, {q['option_lines']} option lines")

    head("Voice and reading level")
    m = r["mascot"]
    print(f"  mascot admonitions: {m['total']} {m['types']}")
    if m["possible_back_to_back"]:
        print(f"    WARNING: {m['possible_back_to_back']} may be back-to-back")
    for ref in m["missing_images"]:
        print(f"    MISSING MASCOT IMAGE {ref}")
    rd = r["readability"]
    if rd:
        flag = "  <-- above 8th grade target" if rd["fk_grade"] > 8.9 else ""
        print(f"  Flesch-Kincaid grade: {rd['fk_grade']}{flag}")
        print(f"  words/sentence: {rd['words_per_sentence']}   sentences over 25 words: {rd['long_sentences']}")
        for ex in rd["longest_examples"]:
            print(f"    long: {ex}")
    else:
        print("  not enough prose to measure")
    print()


def main():
    ap = argparse.ArgumentParser(description="Collect quality signals for a hands-on lab page.")
    ap.add_argument("lab", help="path to the lab .md file or its directory")
    ap.add_argument("--json", action="store_true", help="emit raw JSON instead of the report")
    ap.add_argument("--set-score", type=int, metavar="N",
                    help="write quality_score: N and the matching status into the frontmatter, then exit")
    ap.add_argument("--status", choices=[s for _, s, _ in STATUS_BANDS],
                    help="override the status derived from the score")
    args = ap.parse_args()

    lab_file = resolve_lab_path(args.lab)
    project_root = find_project_root(lab_file)
    if not project_root:
        raise SystemExit("ERROR: could not find mkdocs.yml above the lab file")
    skill_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    if args.set_score is not None:
        if not 0 <= args.set_score <= 100:
            raise SystemExit("ERROR: --set-score must be between 0 and 100")
        derived, band = band_for(args.set_score)
        status = args.status or derived
        label = band if status == derived else f"{band} band, status overridden"
        set_quality_score(lab_file, args.set_score, status)
        print(f"quality_score: {args.set_score}, status: {status} ({label}) "
              f"written to {os.path.relpath(lab_file, project_root)}")
        return

    report = analyze(lab_file, project_root, skill_dir)
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print_report(report)


if __name__ == "__main__":
    main()
