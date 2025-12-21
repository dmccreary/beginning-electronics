---
title: RCL Draw Test
description: An interactive MicroSim for testing the uniformity of drawResistor, drawInductor, and drawCapacitor functions from the p5-circuit-lib.js library.
image: /sims/rcl-draw-test/rcl-draw-test.png
og:image: /sims/rcl-draw-test/rcl-draw-test.png
twitter:image: /sims/rcl-draw-test/rcl-draw-test.png
social:
   cards: false
---

# RCL Draw Test

<iframe src="main.html" height="472px" width="100%" scrolling="no"></iframe>

[Run the RCL Draw Test MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }
[Edit the RCL Draw Test MicroSim Using the p5.js Editor](https://editor.p5js.org/dmccreary/sketches/gHQDlxcJe)

## About This MicroSim

This MicroSim is designed to test the uniformity and consistency of the three schematic component drawing functions from the `p5-circuit-lib.js` library:

- **drawResistor()** - Draws the international zig-zag resistor symbol
- **drawInductor()** - Draws the inductor coil symbol with semicircular humps
- **drawCapacitor()** - Draws the capacitor symbol with two parallel plates

All three functions share the same parameter signature for consistency:

```js
drawComponent(x, y, width, height, lineWidth, orientation, label, labelPosition)
```

## Controls

### Orientation Buttons
- **Horizontal** - Draws all components in horizontal orientation
- **Vertical** - Draws all components in vertical orientation

### Label Position Buttons
- **Top** - Places component labels above the component
- **Bottom** - Places component labels below the component
- **Left** - Places component labels to the left of the component
- **Right** - Places component labels to the right of the component

### Size Slider
Adjusts the size of all three components uniformly from 0.5x to 2.0x scale.

## Architecture

This MicroSim consists of three files:

### 1. main.html
The HTML wrapper that loads the required scripts in order:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.11.10/lib/p5.js"></script>
<script src="p5-circuit-lib.js"></script>
<script src="rcl-draw-test.js"></script>
```

**Load order is critical:**

1. **p5.js** loads first and provides constants like `TOP`, `BOTTOM`, `LEFT`, `RIGHT`
2. **p5-circuit-lib.js** loads second and defines `HORIZONTAL`, `VERTICAL` plus the drawing functions
3. **rcl-draw-test.js** loads last and uses all the above

### 2. p5-circuit-lib.js
The circuit component library containing:

- Drawing functions: `drawResistor()`, `drawInductor()`, `drawCapacitor()`, and others
- Orientation constants: `HORIZONTAL` (0) and `VERTICAL` (1)

The library defines orientation constants using a safe pattern that avoids redeclaration errors:

```js
if (typeof HORIZONTAL === 'undefined') window.HORIZONTAL = 0;
if (typeof VERTICAL === 'undefined') window.VERTICAL = 1;
```

### 3. rcl-draw-test.js
The MicroSim code that:

- Creates the interactive UI (buttons, sliders)
- Draws all three components side-by-side
- Handles width-responsive resizing

## Constants

### Orientation Constants (defined by p5-circuit-lib.js)

| Constant | Value | Description |
|----------|-------|-------------|
| `HORIZONTAL` | 0 | Component oriented left-to-right |
| `VERTICAL` | 1 | Component oriented top-to-bottom |

### Label Position Constants (provided by p5.js)

| Constant | Value | Description |
|----------|-------|-------------|
| `TOP` | 101 | Label above component |
| `BOTTOM` | 102 | Label below component |
| `LEFT` | 37 | Label to the left |
| `RIGHT` | 39 | Label to the right |

## Function Signatures

### drawResistor()

```js
drawResistor(x, y, width, height, lineWidth, orientation, label, labelPosition)
```

Draws the international 6-peak zig-zag resistor symbol with end wires (15% of length) and optional label.

### drawInductor()

```js
drawInductor(x, y, width, height, lineWidth, orientation, label, labelPosition)
```

Draws an inductor symbol with 4 semicircular coil humps, end wires (15% of length), and optional label.

### drawCapacitor()

```js
drawCapacitor(x, y, width, height, lineWidth, orientation, label, labelPosition)
```

Draws a capacitor symbol with two parallel plates (50% of width/height), end wires (35% of length), and optional label.

## Common Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | number | X coordinate of the upper-left corner of the bounding box |
| `y` | number | Y coordinate of the upper-left corner of the bounding box |
| `width` | number | Width of the component bounding box |
| `height` | number | Height of the component bounding box |
| `lineWidth` | number | Stroke weight for drawing the component |
| `orientation` | constant | `HORIZONTAL` (0) or `VERTICAL` (1) |
| `label` | string | Text label to display (e.g., `'R1 10kΩ'`, `'L1 100mH'`, `'C1 10µF'`) |
| `labelPosition` | constant | Position of the label: `TOP`, `BOTTOM`, `LEFT`, or `RIGHT` |

## Width-Responsive Design

The MicroSim automatically adjusts to the container width:

```js
function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    canvasWidth = container.offsetWidth;
  } else {
    // Fallback for p5.js editor (no main element)
    canvasWidth = windowWidth;
  }
  if (sizeSlider) {
    sizeSlider.size(canvasWidth - sliderLeftMargin - margin);
  }
}
```

The `draw()` function detects width changes and resizes the canvas:

```js
function draw() {
  let prevWidth = canvasWidth;
  updateCanvasSize();
  if (canvasWidth !== prevWidth) {
    resizeCanvas(canvasWidth, canvasHeight);
  }
  // ... drawing code
}
```

## Testing in p5.js Editor

To test in the [p5.js editor](https://editor.p5js.org/):

1. Create a new sketch
2. Paste the contents of `p5-circuit-lib.js` first
3. Then paste the contents of `rcl-draw-test.js` below it
4. Click Play

The MicroSim will use `windowWidth` as a fallback when no `<main>` container exists.

## Embedding This MicroSim

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/rcl-draw-test/main.html"
        height="472px"
        width="100%"
        scrolling="no"></iframe>
```

## Source Code

| File | Location |
|------|----------|
| Circuit Library (source) | `src/p5-circuit-lib/p5-circuit-lib.js` |
| Circuit Library (MicroSim copy) | `docs/sims/rcl-draw-test/p5-circuit-lib.js` |
| MicroSim Code | `docs/sims/rcl-draw-test/rcl-draw-test.js` |
| HTML Wrapper | `docs/sims/rcl-draw-test/main.html` |

## Lesson Plan

This MicroSim can be used to:

1. **Verify Visual Consistency** - Ensure all three component types render with similar proportions and styling
2. **Test Orientation Behavior** - Verify that horizontal and vertical orientations work correctly for all components
3. **Test Label Placement** - Confirm that labels are positioned correctly in all four positions for both orientations
4. **Test Scaling** - Verify that components scale uniformly without distortion
5. **Understand Library Architecture** - Learn how to structure a reusable p5.js component library
