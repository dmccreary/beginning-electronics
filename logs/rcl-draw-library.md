# RCL Draw Library Development Session

**Date:** December 21, 2025

## Summary

Enhanced the `p5-circuit-lib.js` library to provide consistent drawing functions for resistors, inductors, and capacitors, then created an interactive test MicroSim to validate the implementations.

## Tasks Completed

### 1. Enhanced drawInductor() and drawCapacitor() Functions

**Before:** Simple functions with minimal parameters
```js
function drawInductor(x, y, angle)
function drawCapacitor(x, y, vertical)
```

**After:** Robust functions matching drawResistor() signature
```js
function drawInductor(x, y, width, height, lineWidth, orientation, label, labelPosition)
function drawCapacitor(x, y, width, height, lineWidth, orientation, label, labelPosition)
```

**Features added:**
- Configurable width, height, and line weight
- HORIZONTAL/VERTICAL orientation support
- Optional labels with TOP/BOTTOM/LEFT/RIGHT positioning
- Auto-scaling font size based on component dimensions
- End wires proportional to component length

### 2. Created RCL Draw Test MicroSim

**Files created:**
- `docs/sims/rcl-draw-test/main.html` - HTML wrapper
- `docs/sims/rcl-draw-test/rcl-draw-test.js` - MicroSim code
- `docs/sims/rcl-draw-test/p5-circuit-lib.js` - Library copy
- `docs/sims/rcl-draw-test/index.md` - Documentation

**Features:**
- Displays resistor, inductor, and capacitor side-by-side
- Orientation toggle buttons (Horizontal/Vertical)
- Label position buttons (Top/Bottom/Left/Right)
- Size slider (0.5x to 2.0x)
- Width-responsive design

### 3. Updated mkdocs.yml Navigation

Added entry for the new MicroSim in the Micro Simulations section.

## Issues Encountered and Solutions

### Issue 1: p5.js Reserved Variable Conflict

**Error:** `"RIGHT" is being redeclared`

**Cause:** Library tried to define constants that p5.js already provides.

**Solution:** Only define HORIZONTAL and VERTICAL (not p5.js constants), using window assignment:
```js
if (typeof HORIZONTAL === 'undefined') window.HORIZONTAL = 0;
if (typeof VERTICAL === 'undefined') window.VERTICAL = 1;
```

### Issue 2: Variable Used Before Declaration

**Error:** `"sizeSlider" is used before declaration`

**Cause:** `updateCanvasSize()` called at start of `setup()` before slider created.

**Solution:** Move `updateCanvasSize()` call to end of `setup()` after all UI elements created.

### Issue 3: Constants Not Available at Script Load Time

**Error:** `"HORIZONTAL" is not defined in the current scope`

**Cause:** Variables initialized with p5.js constants at global scope before p5.js fully loaded.

**Solution:** Declare variables without initialization, set values inside `setup()`:
```js
// Global scope
let compOrientation;
let compLabelPosition;

function setup() {
  compOrientation = HORIZONTAL;
  compLabelPosition = TOP;
  // ...
}
```

### Issue 4: Width-Responsive Not Working

**Problem:** Canvas right edge getting clipped.

**Cause:**
1. No `<main>` element in p5.js editor
2. Canvas not resized after width update

**Solution:**
```js
function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    canvasWidth = container.offsetWidth;
  } else {
    canvasWidth = windowWidth; // Fallback for p5.js editor
  }
}

function draw() {
  let prevWidth = canvasWidth;
  updateCanvasSize();
  if (canvasWidth !== prevWidth) {
    resizeCanvas(canvasWidth, canvasHeight);
  }
  // ...
}
```

### Issue 5: Label Position Display Showing "Unknown"

**Problem:** `getLabelPositionText()` returning "Unknown" for valid positions.

**Cause:** Constant values at initialization time differed from runtime values.

**Solution:** Compare against both symbolic and numeric values:
```js
function getLabelPositionText(pos) {
  if (pos === 101 || pos === TOP) return 'Top';
  if (pos === 102 || pos === BOTTOM) return 'Bottom';
  if (pos === 37 || pos === LEFT) return 'Left';
  if (pos === 39 || pos === RIGHT) return 'Right';
  return 'Unknown (' + pos + ')';
}
```

## Key Learnings

### JavaScript Load Order
Scripts must load in correct order:
1. p5.js (provides constants and functions)
2. Circuit library (defines HORIZONTAL, VERTICAL, drawing functions)
3. MicroSim code (uses all above)

### p5.js Constants
- **Provided by p5.js:** TOP (101), BOTTOM (102), LEFT (37), RIGHT (39), CENTER, BASELINE
- **NOT provided by p5.js:** HORIZONTAL, VERTICAL (must define ourselves)

### Avoiding Redeclaration Errors
Use `window.VARIABLE = value` instead of `var VARIABLE = value` to avoid hoisting issues:
```js
if (typeof HORIZONTAL === 'undefined') window.HORIZONTAL = 0;
```

### Width-Responsive Pattern
Check for container existence and provide fallback:
```js
const container = document.querySelector('main');
canvasWidth = container ? container.offsetWidth : windowWidth;
```

## Files Modified

| File | Changes |
|------|---------|
| `src/p5-circuit-lib/p5-circuit-lib.js` | Enhanced drawInductor(), drawCapacitor(), added HORIZONTAL/VERTICAL constants |
| `docs/sims/rcl-draw-test/main.html` | Created - HTML wrapper |
| `docs/sims/rcl-draw-test/rcl-draw-test.js` | Created - Interactive test MicroSim |
| `docs/sims/rcl-draw-test/p5-circuit-lib.js` | Created - Library copy |
| `docs/sims/rcl-draw-test/index.md` | Created - Comprehensive documentation |
| `mkdocs.yml` | Added navigation entry for RCL Draw Test |

## Testing Instructions

### Local Testing with mkdocs
```bash
cd /Users/dan/Documents/ws/beginning-electronics
mkdocs serve
```
Visit: http://127.0.0.1:8000/beginning-electronics/sims/rcl-draw-test/

### Testing in p5.js Editor
1. Go to https://editor.p5js.org/
2. Paste contents of `p5-circuit-lib.js`
3. Paste contents of `rcl-draw-test.js` below
4. Click Play

## Component Specifications

### drawResistor()
- 6-peak zig-zag symbol (international standard)
- End wires: 15% of total length
- Peak height: 1/3 of component height

### drawInductor()
- 4 semicircular coil humps
- End wires: 15% of total length
- Coil height: 1/3 of component height

### drawCapacitor()
- Two parallel plates
- End wires: 35% of total length
- Plate size: 50% of component width/height
