# Drawing Resistor Symbols in a MicroSim

<iframe src="main.html" width="100%" height="402px" scrolling="no"></iframe>

[Run the Resistors MicroSim Fullscreen](main.html){ .md-button .md-button--primary }
[Edit MicroSim](https://editor.p5js.org/dmccreary/sketches/0-_CXuiVK)

## Drawing Resistors Symbols

The `drawResistor()` function draws the international zig-zag resistor symbol with optional labels.

```js
function setup() {
  const canvas = createCanvas(660, 400);
  background('aliceblue');

  // Horizontal resistor with label on top
  drawResistor(50, 50, 150, 50, 2, 'horizontal', '220 Ω', TOP);

  // Horizontal resistor with label on bottom
  drawResistor(300, 50, 150, 50, 2, 'horizontal', '220 Ω', BOTTOM);

  // Vertical resistor with label on the right
  drawResistor(50, 200, 100, 200, 2, 'vertical', '10K Ω', RIGHT);

  // Vertical resistor with label on the left
  drawResistor(300, 200, 100, 200, 2, 'vertical', '10K Ω', LEFT);
}
```

## Drawing Resistor Schematic Symbols

This version of the `drawResistor()` function draws the international zig-zag resistor symbol (used in circuit schematics) with optional labels. This is different from the physical resistor drawing function above.

### Function Signature

```js
drawResistor(x, y, rwidth, rheight, lineWidth, orientation, label, labelPosition)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | number | X coordinate of the upper-left corner of the bounding box |
| `y` | number | Y coordinate of the upper-left corner of the bounding box |
| `rwidth` | number | Width of the resistor bounding box |
| `rheight` | number | Height of the resistor bounding box |
| `lineWidth` | number | Stroke weight for drawing the resistor symbol |
| `orientation` | string | Either `'horizontal'` or `'vertical'` |
| `label` | string | Text label to display (e.g., `'220 Ω'`, `'10K Ω'`) |
| `labelPosition` | constant | Position of the label: `TOP`, `BOTTOM`, `LEFT`, or `RIGHT` |

### Constants

The following constants are available for use:

```js
// Orientation constants
const HORIZONTAL = "horizontal";
const VERTICAL = "vertical";

// Label position constants
const TOP = "top";
const BOTTOM = "bottom";
const LEFT = "left";
const RIGHT = "right";
```

### Example Usage

```js
// Horizontal resistor with label on top
drawResistor(50, 50, 150, 50, 2, 'horizontal', '220 Ω', TOP);

// Vertical resistor with label on the right
drawResistor(150, 200, 100, 200, 2, 'vertical', '10K Ω', RIGHT);

// Horizontal resistor with label on bottom
drawResistor(50, 150, 120, 40, 2, HORIZONTAL, '4.7K Ω', BOTTOM);

// Vertical resistor with label on left
drawResistor(300, 50, 80, 160, 3, VERTICAL, '1M Ω', LEFT);
```

### Features

- **International Symbol**: Draws the 6-peak zig-zag resistor symbol used in international standards
- **Automatic Font Scaling**: Label font size automatically scales based on the resistor dimensions (between 8px and 24px)
- **Flexible Label Positioning**: Labels can be placed on any of the four sides
- **End Wires**: Each end has a short lead wire (15% of the resistor length)