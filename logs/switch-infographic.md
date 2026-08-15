# Switch Family Interactive Infographic MicroSim

Date: 2026-08-15

## Session Goal

Create an interactive infographic MicroSim for the **Meet the Switch Family** section of Chapter 16. The requested layout placed each switch in its own column with an image, description, and guidance about when it should be used.

Target chapter section:

- `docs/chapters/16-switches-buttons-wired-logic/index.md#meet-the-switch-family`

## Skills and Approach

The session used the `microsim-generator` skill and routed the request to its **interactive infographic grid-overlay** workflow. The `imagegen` skill generated the five-column switch illustration.

Instructional design decision:

- Bloom level: Understand (L2)
- Learning action: compare and explain common switch types
- Interaction pattern: clickable five-column comparison with a short recognition quiz
- Animation: omitted because it did not add instructional value

## MicroSim Design

The infographic presents these components from left to right:

1. Tactile push button
2. Toggle switch
3. Slide switch
4. Rocker switch
5. DIP switch

Each interactive column provides:

- A recognizable physical illustration
- Momentary or latching behavior
- Typical SPST or SPDT wiring
- Recommended project uses

The tactile push-button column opens by default so learners immediately see how the descriptive panel works. Explore mode supports mouse, touch, and keyboard activation. Quiz mode contains five use-case questions—one for each switch type.

## Generated Artwork

ImageGen created a five-column technical product illustration with pastel column backgrounds. A second targeted generation pass removed printed ratings and power symbols so the final image complied with the overlay requirement of having no embedded text, labels, or annotations.

Final image:

- `docs/sims/switch-family-explorer/switch-family.png`

The complete generation prompt is preserved in:

- `docs/sims/switch-family-explorer/image-prompt.md`

## Files Created or Updated

MicroSim package:

- `docs/sims/switch-family-explorer/main.html`
- `docs/sims/switch-family-explorer/data.json`
- `docs/sims/switch-family-explorer/switch-family-explorer.js`
- `docs/sims/switch-family-explorer/index.md`
- `docs/sims/switch-family-explorer/metadata.json`
- `docs/sims/switch-family-explorer/image-prompt.md`
- `docs/sims/switch-family-explorer/switch-family.png`
- `docs/sims/switch-family-explorer/switch-family-explorer.png`

Shared grid-overlay assets installed:

- `docs/sims/shared-libs/grid-diagram.js`
- `docs/sims/shared-libs/grid-overlay.css`

Integration updates:

- Embedded the MicroSim in `docs/chapters/16-switches-buttons-wired-logic/index.md`
- Added the MicroSim to the generated navigation in `mkdocs.yml`
- Excluded `image-prompt.md` from the MkDocs build
- Added the MicroSim iframe resize listener in `docs/js/extras.js`

## Iframe and Accessibility

- Declared canvas height: 650 px
- Synced iframe height: 652 px, including the border allowance
- Added keyboard focus and Enter/Space activation to all five image zones
- Added descriptive ARIA labels and an `aria-live` detail panel
- Confirmed that controls do not extend beyond the iframe boundary

## Validation and QA

- MicroSim validator: 93/100, Grade A
- `mkdocs build`: successful
- Browser automation confirmed five zones, column selection, quiz startup, and visible controls
- A 800 × 652 px screenshot was captured for visual inspection
- Visual review confirmed that the title, images, controls, highlighted state, and description panel render without clipping or overlap

The MkDocs build reported unrelated pre-existing link warnings elsewhere in the project; none were introduced by this MicroSim.

## Final UI Refinement

The initial colored pill backgrounds behind the column labels appeared too short. The root cause was the labels inheriting `line-height: 0` from the image wrapper. The local `.zone-chip` override was updated to use:

- `font-size: 13px`
- `line-height: 1.2`
- `padding: 4px 10px`

The screenshot was recaptured and confirmed that all five label pills now have adequate height and spacing.

## Outcome

The completed MicroSim provides a compact, responsive, and approachable visual comparison of the switch family. The user approved the final result and specifically confirmed that the corrected label pills looked perfect.
