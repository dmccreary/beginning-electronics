---
name: draw-schemdraw-circuit
description: Convert a plain-language electrical or electronic circuit description into a high-quality Python Schemdraw program and a verified SVG or PNG schematic. Use when Codex is asked to draw, render, illustrate, or visualize a circuit diagram, including series, parallel, mixed, analog, digital, transistor, op-amp, filter, power, and educational circuits, and the requested output is an image file.
---

# Draw a Schemdraw Circuit

Create both a maintainable Python source file and a rendered circuit image. Interpret the user's prose yourself; do not build a generic natural-language parser.

## Workflow

1. Consolidate the user's initial request and all later revisions into one current canonical prompt. Include every active requirement and remove superseded wording.
2. Parse that canonical prompt into a circuit specification: components and unique reference designators, values, named nets, source polarity/type, junctions, crossings, inputs, outputs, grounds, and explicit or implied topology.
3. Resolve only harmless presentation details yourself. If an electrical ambiguity materially changes topology, state the assumption in the Python docstring; ask only when no defensible interpretation exists.
4. Read [references/schemdraw-patterns.md](references/schemdraw-patterns.md) for the required program contract, layout rules, and topology patterns.
5. Check the installed API before guessing an unfamiliar element: use Python introspection or the official Schemdraw docs. Never silently substitute an electrically different symbol.
6. Write a custom, high-quality Python program next to the requested output. Put the canonical prompt in the required top module docstring. Give components meaningful variable names and comments describing circuit sections. Keep topology visible in the program.
7. Whenever the user changes the circuit or its presentation, update the `Prompt:` block before changing code or rerendering. Never preserve a stale original prompt as provenance; it must describe the latest intended result.
8. Compile and execute the program. Render the requested image, defaulting to SVG. Also render a PNG preview from the same program for visual inspection when the primary output is SVG.
9. Run `scripts/validate_diagram.py --source circuit_name.py` on every rendered file. Treat warnings as prompts for inspection, not automatic success.
10. Inspect the PNG with the local image-viewing tool. Compare the image against the canonical prompt and the verification checklist below. Revise and rerender until it passes.
11. When a textbook chapter is in scope, place the verified image into the correct chapter section using the chapter integration rules below.
12. Return links to the final image and Python source. Briefly disclose any topology assumptions and identify the chapter placement when applicable.

## Chapter integration

Apply these rules whenever the circuit belongs in a textbook chapter:

- Inspect the chapter structure and choose the section where the diagram most directly supports the surrounding explanation. Prefer placing it after the concept is introduced and before equations, procedures, exercises, or interactive simulations that depend on it.
- For a standalone circuit-diagram request, state the exact proposed chapter file, section heading, and placement, then obtain or recognize the user's confirmation before editing the chapter. An explicit chapter URL with an anchor, a named section, or an instruction such as “put it under X” counts as confirmation. If none is provided, ask for confirmation after rendering the diagram.
- When invoked as part of a chapter-generation process, do not pause for confirmation. Insert the diagram in the pedagogically correct location and add a descriptive level-4 heading immediately above it using `#### Diagram: <Diagram Name>`.
- Use Markdown image syntax inside `<figure markdown="span">` and add a concise `<figcaption>` beneath it. Write meaningful alt text that describes the topology rather than repeating the filename.
- Use a relative image path that resolves from the chapter Markdown file. Keep the Python source and image in the location requested by the surrounding workflow.
- Avoid duplicate headings or figures. If the chapter already contains a diagram heading for the same concept, update that figure in place.

The `#### Diagram: ...` heading is also a classroom navigation feature: it creates a direct section anchor that an instructor can share in a Zoom, Google Meet, or Microsoft Teams chat so every student opens the same diagram on their local computer. Use a unique, descriptive heading and keep its wording stable so previously shared links continue to work.

Use this chapter-generation pattern:

```markdown
#### Diagram: Voltage Divider

<figure markdown="span">
  ![Two series resistors forming a voltage divider with a center output tap](voltage-divider.png)
  <figcaption>Two equal resistors divide the supply voltage equally at the center tap.</figcaption>
</figure>
```

## Render commands

Use a non-GUI environment. Prefer the Python interpreter already configured for the project.

```bash
export MPLBACKEND=Agg
python circuit_name.py circuit_name.svg
python circuit_name.py circuit_name-preview.png
python /Users/dan/.codex/skills/draw-schemdraw-circuit/scripts/validate_diagram.py --source circuit_name.py circuit_name.svg circuit_name-preview.png
```

If imports fail, install the documented dependency into an appropriate project environment:

```bash
python -m pip install "schemdraw[matplotlib]"
```

Do not install packages globally when a project environment exists.

## Verification checklist

Require all of the following before reporting success:

- The program compiles and exits successfully, and every expected output exists and is non-empty.
- The validator reports no errors.
- The first Python module docstring contains a `Prompt:` block that fully and accurately describes the current circuit, including all active revisions to topology, values, labels, orientation, and presentation.
- The `Prompt:` block contains no obsolete requirement superseded by later feedback.
- Every requested component appears exactly once unless repetition was requested; its reference, value, polarity, and orientation are correct.
- Every series connection, branch, junction, crossover, source terminal, return path, named net, input, output, and ground matches the description.
- Junction dots appear at electrical joins and do not imply a connection at mere crossings.
- Wires meet component anchors without visible gaps, overshoot, or false connections.
- Two-terminal devices used in vertical signal-to-ground or supply-to-ground branches have top-and-bottom terminal orientation, with straight vertical entry and return paths unless the circuit convention requires otherwise.
- No wire unnecessarily crosses or overlays a component symbol or label; every unavoidable crossing is visually unambiguous and topologically justified.
- Wires follow clean horizontal or vertical routes by default. Diagonal or skewed segments appear only when required by a conventional symbol or the actual topology, never as an accidental result of inherited element orientation.
- Labels are legible, not clipped, and do not collide with symbols or other labels.
- The diagram has balanced spacing, an obvious signal/power flow, consistent symbol style, and no excessive empty canvas.
- The PNG preview contains the same diagram as the primary output and shows no blank, truncated, corrupted, or error-message image.
- When inserted into a chapter, the image appears in the confirmed or pedagogically correct section, its relative path resolves, and its alt text and caption match the rendered circuit.
- During chapter generation, a descriptive `#### Diagram: ...` heading appears immediately above the figure.

Structural validation cannot prove electrical correctness. Visual inspection and comparison with the parsed circuit specification are mandatory.

## Output rules

- Default to SVG for scalable line art; honor PNG when explicitly requested.
- Use a white background for a PNG intended for documents unless transparency is requested.
- Preserve Unicode units such as `Ω`, `µF`, and `°` when the selected font renders them reliably.
- Do not return only a code snippet. Create and verify the actual files.
- Keep preview files when they help the user review the result; otherwise identify them clearly as previews.
