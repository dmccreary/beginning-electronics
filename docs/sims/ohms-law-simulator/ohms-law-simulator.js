// Ohm's Law Circuit Simulator MicroSim
// CANVAS_HEIGHT: 450
// Interactive visualization of V = IR relationship
// Students manipulate voltage and resistance to observe current changes

// Canvas dimensions
let canvasWidth = 800;
let drawHeight = 400;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 20;

// Circuit parameters
let voltage = 12;       // Volts (1-24V)
let resistance = 4;     // Ohms (1-20 ohms)
let current = 3;        // Amps (calculated)

// UI controls
let voltageSlider, resistanceSlider;
let resetButton, showEquationToggle;
let showEquation = true;

// Animation
let particles = [];
let particleSpacing = 40;
let lastParticleTime = 0;

// Circuit geometry
let circuitLeft, circuitRight, circuitTop, circuitBottom;
let batteryX, batteryY;
let resistorX, resistorY;
let ammeterX, ammeterY;

// Colors
let wireColor = '#333333';
let batteryColor = '#4CAF50';
let resistorColdColor, resistorHotColor;
let ammeterColor = '#2196F3';
let particleColor = '#FFD700';
let overloadColor = '#FF0000';

// Overload state
let isOverload = false;
let overloadFlashTime = 0;

function setup() {
    updateCanvasSize();
    // Cap the backing store at one device pixel per CSS pixel. At the Retina
    // default a full-width canvas asks the compositor for 4x the pixels every
    // frame, which can stall the compositor on a loaded machine.
    pixelDensity(1);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent(document.querySelector('main'));

    resistorColdColor = color(100, 150, 255);
    resistorHotColor = color(255, 50, 50);

    calculateCircuitGeometry();
    createControls();

    textFont('Arial');

    describe('Interactive Ohm\'s Law circuit simulator with battery, resistor, and ammeter. Adjust voltage and resistance sliders to see how current changes according to V=IR.', LABEL);
}

function draw() {
    updateCanvasSize();
    calculateCircuitGeometry();

    // Calculate current
    current = voltage / resistance;
    isOverload = current > 20;

    // Drawing area background
    fill('#ffffff');
    stroke('#cccccc');
    strokeWeight(1);
    rect(0, 0, canvasWidth, drawHeight);

    // Control area background
    fill('#f5f5f5');
    noStroke();
    rect(0, drawHeight, canvasWidth, controlHeight);

    // Title
    fill('#333333');
    noStroke();
    textSize(20);
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    text("Ohm's Law Circuit Simulator", canvasWidth / 2, 10);
    textStyle(NORMAL);

    // Draw circuit
    drawCircuitWires();
    drawBattery();
    drawResistor();
    drawAmmeter();

    // Animate current flow
    updateParticles();
    drawParticles();

    // Draw equation display
    if (showEquation) {
        drawEquationDisplay();
    }

    // Update control positions
    updateControlPositions();

    // Draw control labels
    drawControlLabels();
}

function calculateCircuitGeometry() {
    // Circuit rectangle bounds
    let circuitWidth = min(canvasWidth - 100, 500);
    let circuitHeight = 200;

    circuitLeft = (canvasWidth - circuitWidth) / 2;
    circuitRight = circuitLeft + circuitWidth;
    circuitTop = 80;
    circuitBottom = circuitTop + circuitHeight;

    // Component positions
    batteryX = circuitLeft;
    batteryY = (circuitTop + circuitBottom) / 2;

    resistorX = (circuitLeft + circuitRight) / 2;
    resistorY = circuitTop;

    ammeterX = circuitRight;
    ammeterY = (circuitTop + circuitBottom) / 2;
}

function createControls() {
    // Voltage slider
    voltageSlider = createSlider(1, 24, 12, 0.5);
    voltageSlider.style('width', '120px');

    // Resistance slider
    resistanceSlider = createSlider(1, 20, 4, 0.5);
    resistanceSlider.style('width', '120px');

    // Reset button
    resetButton = createButton('Reset');
    resetButton.mousePressed(resetCircuit);
    resetButton.style('padding', '5px 15px');
    resetButton.style('cursor', 'pointer');

    // Show equation toggle
    showEquationToggle = createCheckbox('Show Equation', true);
    showEquationToggle.changed(() => {
        showEquation = showEquationToggle.checked();
    });
}

function updateControlPositions() {
    let controlY = drawHeight + 15;
    let spacing = canvasWidth / 5;

    // Position voltage slider
    voltageSlider.position(spacing - 60, controlY);
    voltage = voltageSlider.value();

    // Position resistance slider
    resistanceSlider.position(spacing * 2 - 60, controlY);
    resistance = resistanceSlider.value();

    // Position reset button
    resetButton.position(spacing * 3 - 30, controlY);

    // Position toggle
    showEquationToggle.position(spacing * 4 - 50, controlY);
}

function drawControlLabels() {
    fill('#333333');
    noStroke();
    textSize(12);
    textAlign(CENTER, TOP);

    let controlY = drawHeight + 5;
    let spacing = canvasWidth / 5;

    text('Voltage: ' + voltage.toFixed(1) + 'V', spacing, controlY - 2);
    text('Resistance: ' + resistance.toFixed(1) + '\u03A9', spacing * 2, controlY - 2);
}

function drawCircuitWires() {
    stroke(wireColor);
    strokeWeight(4);
    noFill();

    // Top wire (battery to resistor to ammeter)
    line(batteryX, batteryY - 30, batteryX, circuitTop);
    line(batteryX, circuitTop, resistorX - 40, circuitTop);
    line(resistorX + 40, circuitTop, circuitRight, circuitTop);
    line(circuitRight, circuitTop, ammeterX, ammeterY - 25);

    // Bottom wire (battery to ammeter)
    line(batteryX, batteryY + 30, batteryX, circuitBottom);
    line(batteryX, circuitBottom, circuitRight, circuitBottom);
    line(circuitRight, circuitBottom, ammeterX, ammeterY + 25);
}

function drawBattery() {
    let x = batteryX;
    let y = batteryY;

    // Battery body
    stroke(batteryColor);
    strokeWeight(3);

    // Positive terminal (longer line)
    line(x - 15, y - 20, x + 15, y - 20);

    // Negative terminal (shorter line)
    line(x - 8, y + 20, x + 8, y + 20);

    // Battery body lines
    line(x - 10, y - 10, x + 10, y - 10);
    line(x - 5, y, x + 5, y);
    line(x - 10, y + 10, x + 10, y + 10);

    // Labels
    fill(batteryColor);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text('+', x - 25, y - 20);
    text('-', x - 25, y + 20);

    // Voltage label
    textSize(14);
    textStyle(BOLD);
    text(voltage.toFixed(1) + 'V', x, y + 50);
    textStyle(NORMAL);
}

function drawResistor() {
    let x = resistorX;
    let y = resistorY;
    let zigzagWidth = 60;
    let zigzagHeight = 12;

    // Color based on current (heat)
    let heatLevel = constrain(current / 20, 0, 1);
    let resistorColor = lerpColor(resistorColdColor, resistorHotColor, heatLevel);

    stroke(resistorColor);
    strokeWeight(3);
    noFill();

    // Draw zigzag pattern
    beginShape();
    vertex(x - 40, y);
    for (let i = 0; i < 6; i++) {
        let xPos = x - 30 + i * 10;
        let yOffset = (i % 2 === 0) ? -zigzagHeight : zigzagHeight;
        vertex(xPos, y + yOffset);
    }
    vertex(x + 40, y);
    endShape();

    // Resistance label
    fill(resistorColor);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(resistance.toFixed(1) + '\u03A9', x, y - 25);
    textStyle(NORMAL);

    // Heat indicator text
    textSize(10);
    if (heatLevel > 0.5) {
        fill(resistorHotColor);
        text('HOT!', x, y + 25);
    }
}

function drawAmmeter() {
    let x = ammeterX;
    let y = ammeterY;
    let radius = 30;

    // Determine if flashing due to overload
    let showOverload = false;
    if (isOverload) {
        overloadFlashTime += deltaTime / 1000;
        showOverload = (sin(overloadFlashTime * 10) > 0);
    } else {
        overloadFlashTime = 0;
    }

    // Ammeter circle
    if (showOverload) {
        fill(overloadColor);
        stroke('#AA0000');
    } else {
        fill('#E3F2FD');
        stroke(ammeterColor);
    }
    strokeWeight(3);
    ellipse(x, y, radius * 2, radius * 2);

    // "A" symbol
    fill(showOverload ? '#FFFFFF' : ammeterColor);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text('A', x, y - 8);
    textStyle(NORMAL);

    // Current reading
    textSize(12);
    if (isOverload) {
        fill(showOverload ? '#FFFFFF' : overloadColor);
        text('OVERLOAD!', x, y + 12);
    } else {
        fill('#333333');
        text(current.toFixed(2) + ' A', x, y + 12);
    }

    // Current label below
    fill(isOverload ? overloadColor : ammeterColor);
    textSize(14);
    textStyle(BOLD);
    text('I = ' + current.toFixed(2) + ' A', x, y + 55);
    textStyle(NORMAL);
}

function updateParticles() {
    // Calculate particle speed based on current
    let speed = map(current, 0, 25, 0.5, 8);

    // Add new particles periodically
    let timeBetweenParticles = 500 / max(current, 0.5);
    if (millis() - lastParticleTime > timeBetweenParticles && !isOverload) {
        addParticle();
        lastParticleTime = millis();
    }

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].progress += speed * 0.005;

        // Remove particles that completed the circuit
        if (particles[i].progress > 1) {
            particles.splice(i, 1);
        }
    }

    // Limit particle count
    while (particles.length > 50) {
        particles.shift();
    }
}

function addParticle() {
    particles.push({
        progress: 0
    });
}

function drawParticles() {
    fill(particleColor);
    noStroke();

    for (let p of particles) {
        let pos = getParticlePosition(p.progress);

        // Glow effect
        for (let i = 3; i > 0; i--) {
            fill(255, 215, 0, 50);
            ellipse(pos.x, pos.y, 8 + i * 2, 8 + i * 2);
        }

        fill(particleColor);
        ellipse(pos.x, pos.y, 8, 8);
    }
}

function getParticlePosition(progress) {
    // Define circuit path segments and their lengths
    // Path: battery top -> top wire -> resistor -> ammeter top -> ammeter bottom -> bottom wire -> battery bottom

    let totalLength = 1.0;
    let pos = {x: 0, y: 0};

    // Segment proportions (approximate)
    let segments = [
        {start: 0, end: 0.08},      // Battery to top-left corner
        {start: 0.08, end: 0.25},   // Top-left to resistor start
        {start: 0.25, end: 0.35},   // Through resistor
        {start: 0.35, end: 0.50},   // Resistor to ammeter top
        {start: 0.50, end: 0.58},   // Ammeter top to center to bottom
        {start: 0.58, end: 0.75},   // Ammeter bottom to bottom-right
        {start: 0.75, end: 0.92},   // Bottom wire
        {start: 0.92, end: 1.0}     // Back up to battery
    ];

    if (progress < segments[0].end) {
        // Battery top to top-left corner
        let t = map(progress, segments[0].start, segments[0].end, 0, 1);
        pos.x = batteryX;
        pos.y = lerp(batteryY - 30, circuitTop, t);
    } else if (progress < segments[1].end) {
        // Top-left to resistor start
        let t = map(progress, segments[1].start, segments[1].end, 0, 1);
        pos.x = lerp(batteryX, resistorX - 40, t);
        pos.y = circuitTop;
    } else if (progress < segments[2].end) {
        // Through resistor (simplified as straight line)
        let t = map(progress, segments[2].start, segments[2].end, 0, 1);
        pos.x = lerp(resistorX - 40, resistorX + 40, t);
        pos.y = circuitTop;
    } else if (progress < segments[3].end) {
        // Resistor to top-right corner
        let t = map(progress, segments[3].start, segments[3].end, 0, 1);
        pos.x = lerp(resistorX + 40, circuitRight, t);
        pos.y = circuitTop;
    } else if (progress < segments[4].end) {
        // Top-right corner down to ammeter
        let t = map(progress, segments[4].start, segments[4].end, 0, 1);
        pos.x = ammeterX;
        pos.y = lerp(circuitTop, ammeterY + 25, t);
    } else if (progress < segments[5].end) {
        // Ammeter bottom to bottom-right corner
        let t = map(progress, segments[5].start, segments[5].end, 0, 1);
        pos.x = lerp(circuitRight, circuitRight, t);
        pos.y = lerp(ammeterY + 25, circuitBottom, t);
    } else if (progress < segments[6].end) {
        // Bottom wire right to left
        let t = map(progress, segments[6].start, segments[6].end, 0, 1);
        pos.x = lerp(circuitRight, batteryX, t);
        pos.y = circuitBottom;
    } else {
        // Bottom-left up to battery
        let t = map(progress, segments[7].start, segments[7].end, 0, 1);
        pos.x = batteryX;
        pos.y = lerp(circuitBottom, batteryY + 30, t);
    }

    return pos;
}

function drawEquationDisplay() {
    let eqX = canvasWidth / 2;
    let eqY = drawHeight - 45;
    let boxWidth = 350;
    let boxHeight = 40;

    // Background box
    fill(255, 255, 255, 230);
    stroke('#2196F3');
    strokeWeight(2);
    rectMode(CENTER);
    rect(eqX, eqY, boxWidth, boxHeight, 8);
    rectMode(CORNER);

    // Equation text
    fill('#333333');
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);

    // V = I x R format
    let vText = voltage.toFixed(1) + 'V';
    let iText = current.toFixed(2) + 'A';
    let rText = resistance.toFixed(1) + '\u03A9';

    textStyle(BOLD);
    text('V = I \u00D7 R    \u2192    ' + vText + ' = ' + iText + ' \u00D7 ' + rText, eqX, eqY);
    textStyle(NORMAL);
}

function resetCircuit() {
    voltage = 12;
    resistance = 4;
    voltageSlider.value(12);
    resistanceSlider.value(4);
    particles = [];
    showEquation = true;
    showEquationToggle.checked(true);
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    calculateCircuitGeometry();
}

function updateCanvasSize() {
    const container = document.querySelector('main');
    if (container) {
        canvasWidth = container.offsetWidth;
    }
}
