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

## About This MicroSim

This MicroSim is designed to test the uniformity and consistency of the three schematic component drawing functions from the `p5-circuit-lib.js` library:

- **drawResistor()** - Draws the international zig-zag resistor symbol
- **drawInductor()** - Draws the inductor coil symbol with semicircular humps
- **drawCapacitor()** - Draws the capacitor symbol with two parallel plates

All three functions now share the same parameter signature for consistency:

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

## Embedding This MicroSim

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/beginning-electronics/sims/rcl-draw-test/main.html" height="472px" scrolling="no"></iframe>
```

## Function Signatures

### drawResistor()

```js
drawResistor(x, y, width, height, lineWidth, orientation, label, labelPosition)
```

Draws the international 6-peak zig-zag resistor symbol with end wires and optional label.

### drawInductor()

```js
drawInductor(x, y, width, height, lineWidth, orientation, label, labelPosition)
```

Draws an inductor symbol with 4 semicircular coil humps, end wires, and optional label.

### drawCapacitor()

```js
drawCapacitor(x, y, width, height, lineWidth, orientation, label, labelPosition)
```

Draws a capacitor symbol with two parallel plates, end wires, and optional label.

## Common Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | number | X coordinate of the upper-left corner of the bounding box |
| `y` | number | Y coordinate of the upper-left corner of the bounding box |
| `width` | number | Width of the component bounding box |
| `height` | number | Height of the component bounding box |
| `lineWidth` | number | Stroke weight for drawing the component |
| `orientation` | constant | `HORIZONTAL` or `VERTICAL` |
| `label` | string | Text label to display (e.g., `'R1 10kΩ'`, `'L1 100mH'`, `'C1 10µF'`) |
| `labelPosition` | constant | Position of the label: `TOP`, `BOTTOM`, `LEFT`, or `RIGHT` |

## Source Code

The circuit component library source is located at:
`src/p5-circuit-lib/p5-circuit-lib.js`

## Lesson Plan

This MicroSim can be used to:

1. **Verify Visual Consistency** - Ensure all three component types render with similar proportions and styling
2. **Test Orientation Behavior** - Verify that horizontal and vertical orientations work correctly for all components
3. **Test Label Placement** - Confirm that labels are positioned correctly in all four positions for both orientations
4. **Test Scaling** - Verify that components scale uniformly without distortion
