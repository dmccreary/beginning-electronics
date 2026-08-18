// RCL Draw Test MicroSim
// CANVAS_HEIGHT: 470
// Tests the drawResistor, drawInductor, and drawCapacitor functions
// from the p5-circuit-lib.js library

// Define orientation constants (not provided by p5.js)
const HORIZONTAL = 0;
const VERTICAL = 1;

// Canvas dimensions
let canvasWidth = 670;
let drawHeight = 350;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 90;
let defaultTextSize = 16;

// Component parameters - initialized in setup() when p5.js constants are available
let compOrientation;
let compLabelPosition;
let componentSize = 1.0;

// UI Elements
let sizeSlider = null;
let orientationButtons = [];
let labelButtons = [];

function setup() {
  // Initialize with p5.js constants (now available)
  compOrientation = HORIZONTAL;
  compLabelPosition = TOP;

  // Cap the backing store below the Retina default. At density 2 a full-width
  // canvas asks the compositor for 4x the pixels every frame, which stalls a
  // machine whose compositor has no headroom. 1.5 cuts that ~44% while staying
  // visibly sharper than a full cap to 1.
  pixelDensity(1.5);

  const canvas = createCanvas(canvasWidth, canvasHeight);
  var container = document.querySelector('main');
  if (container) {
    canvas.parent(container);
  }

  // Create orientation buttons
  let btnY = drawHeight + 10;
  let btnX = 10;

  let orientLabel = createSpan('Orientation:');
  orientLabel.position(btnX, btnY + 3);
  orientLabel.style('font-weight', 'bold');
  orientLabel.style('font-size', '14px');

  btnX = 100;
  let hBtn = createButton('Horizontal');
  hBtn.position(btnX, btnY);
  hBtn.mousePressed(() => { compOrientation = HORIZONTAL; });
  orientationButtons.push(hBtn);

  btnX += 85;
  let vBtn = createButton('Vertical');
  vBtn.position(btnX, btnY);
  vBtn.mousePressed(() => { compOrientation = VERTICAL; });
  orientationButtons.push(vBtn);

  // Create label position buttons
  btnY += 35;
  btnX = 10;

  let posLabel = createSpan('Label Position:');
  posLabel.position(btnX, btnY + 3);
  posLabel.style('font-weight', 'bold');
  posLabel.style('font-size', '14px');

  btnX = 120;
  let topBtn = createButton('Top');
  topBtn.position(btnX, btnY);
  topBtn.mousePressed(() => { compLabelPosition = TOP; });
  labelButtons.push(topBtn);

  btnX += 50;
  let bottomBtn = createButton('Bottom');
  bottomBtn.position(btnX, btnY);
  bottomBtn.mousePressed(() => { compLabelPosition = BOTTOM; });
  labelButtons.push(bottomBtn);

  btnX += 70;
  let leftBtn = createButton('Left');
  leftBtn.position(btnX, btnY);
  leftBtn.mousePressed(() => { compLabelPosition = LEFT; });
  labelButtons.push(leftBtn);

  btnX += 50;
  let rightBtn = createButton('Right');
  rightBtn.position(btnX, btnY);
  rightBtn.mousePressed(() => { compLabelPosition = RIGHT; });
  labelButtons.push(rightBtn);

  // Create size slider
  btnY += 35;
  sizeSlider = createSlider(0.5, 2.0, 1.0, 0.1);
  sizeSlider.position(sliderLeftMargin, btnY);
  sizeSlider.size(canvasWidth - sliderLeftMargin - margin);

  // Now safe to call updateCanvasSize and resize the canvas
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);

  describe('Test visualization for resistor, inductor, and capacitor drawing functions with controls for orientation, label position, and size.');
}

function draw() {
  let prevWidth = canvasWidth;
  updateCanvasSize();
  if (canvasWidth !== prevWidth) {
    resizeCanvas(canvasWidth, canvasHeight);
  }

  // Drawing area background
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  fill('white');
  noStroke();
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  fill('black');
  noStroke();
  textSize(24);
  textAlign(CENTER, TOP);
  text('RCL Component Draw Test', canvasWidth / 2, 10);

  // Get current size
  if (sizeSlider) {
    componentSize = sizeSlider.value();
  }

  // Calculate component dimensions based on size
  let baseWidth = 120 * componentSize;
  let baseHeight = 50 * componentSize;
  let lineWidth = 2;

  // Swap width/height for vertical orientation
  let compWidth = compOrientation === HORIZONTAL ? baseWidth : baseHeight;
  let compHeight = compOrientation === HORIZONTAL ? baseHeight : baseWidth;

  // Calculate positions to center components
  let spacing = canvasWidth / 4;
  let centerY = drawHeight / 2 + 20;

  // Position 1: Resistor
  let x1 = spacing - compWidth / 2;
  let y1 = centerY - compHeight / 2;

  // Position 2: Inductor
  let x2 = spacing * 2 - compWidth / 2;
  let y2 = centerY - compHeight / 2;

  // Position 3: Capacitor
  let x3 = spacing * 3 - compWidth / 2;
  let y3 = centerY - compHeight / 2;

  // Draw component type labels above
  fill('black');
  textSize(16);
  textAlign(CENTER, BOTTOM);
  let typeY = centerY - compHeight / 2 - 40;
  text('Resistor', spacing, typeY);
  text('Inductor', spacing * 2, typeY);
  text('Capacitor', spacing * 3, typeY);

  // Draw the three components
  stroke('black');
  noFill();

  // Draw Resistor
  drawResistor(x1, y1, compWidth, compHeight, lineWidth, compOrientation, 'R1 10kΩ', compLabelPosition);

  // Draw Inductor
  drawInductor(x2, y2, compWidth, compHeight, lineWidth, compOrientation, 'L1 100mH', compLabelPosition);

  // Draw Capacitor
  drawCapacitor(x3, y3, compWidth, compHeight, lineWidth, compOrientation, 'C1 10µF', compLabelPosition);

  // Draw size slider label
  fill('black');
  noStroke();
  textSize(14);
  textAlign(LEFT, CENTER);
  text('Size: ' + componentSize.toFixed(1), 10, drawHeight + 92);

  // Draw current settings info
  textAlign(RIGHT, TOP);
  textSize(12);
  fill(100);
  let orientText = compOrientation === HORIZONTAL ? 'Horizontal' : 'Vertical';
  let posText = getLabelPositionText(compLabelPosition);
  text('Orientation: ' + orientText + ' | Label: ' + posText, canvasWidth - 10, drawHeight + 5);
}

function getLabelPositionText(pos) {
  // Use numeric values to ensure comparison works
  // TOP=101, BOTTOM=102, LEFT=37, RIGHT=39
  if (pos === 101 || pos === TOP) return 'Top';
  if (pos === 102 || pos === BOTTOM) return 'Bottom';
  if (pos === 37 || pos === LEFT) return 'Left';
  if (pos === 39 || pos === RIGHT) return 'Right';
  return 'Unknown (' + pos + ')';
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

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
