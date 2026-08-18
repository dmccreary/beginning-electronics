// Series vs Parallel Circuit Comparison MicroSim
// CANVAS_HEIGHT: 650
// Compare current, voltage, and power distribution in series vs parallel circuits

// Canvas dimensions
let canvasWidth = 900;
let drawHeight = 520;
let controlHeight = 130;
let canvasHeight = drawHeight + controlHeight;

// Circuit layout
let circuitWidth = 420;
let circuitHeight = 320;
let seriesX = 20;
let parallelX = 460;
let circuitY = 40;

// Electrical values
let batteryVoltage = 9;
let r1 = 100, r2 = 100, r3 = 100;
let componentRemoved = [false, false, false];  // Track removed components

// Display mode
let showAsBulbs = true;

// UI elements
let voltageSlider, r1Slider, r2Slider, r3Slider;
let bulbToggle;
let removeButtons = [];

// Particles for animation
let seriesParticles = [];
let parallelParticles = [];
let numParticles = 20;

function setup() {
    updateCanvasSize();
    // Cap the backing store below the Retina default. At density 2 a full-width
    // canvas asks the compositor for 4x the pixels every frame, which stalls a
    // machine whose compositor has no headroom. 1.5 cuts that ~44% while staying
    // visibly sharper than a full cap to 1.
    pixelDensity(1.5);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent(document.querySelector('main'));

    createControls();
    initParticles();

    describe('Side-by-side comparison of series and parallel circuits showing current flow, voltage distribution, and component behavior', LABEL);
}

function createControls() {
    let y1 = drawHeight + 15;
    let y2 = drawHeight + 45;
    let y3 = drawHeight + 75;
    let y4 = drawHeight + 105;

    // Voltage slider
    voltageSlider = createSlider(1, 12, 9, 0.5);
    voltageSlider.position(90, y1);
    voltageSlider.size(100);

    // Resistance sliders
    r1Slider = createSlider(10, 500, 100, 10);
    r1Slider.position(90, y2);
    r1Slider.size(100);

    r2Slider = createSlider(10, 500, 100, 10);
    r2Slider.position(280, y2);
    r2Slider.size(100);

    r3Slider = createSlider(10, 500, 100, 10);
    r3Slider.position(470, y2);
    r3Slider.size(100);

    // Bulb toggle
    bulbToggle = createCheckbox(' Show as Light Bulbs', true);
    bulbToggle.position(250, y1);
    bulbToggle.style('font-size', '13px');
    bulbToggle.changed(() => showAsBulbs = bulbToggle.checked());

    // Remove component buttons
    let removeBtn1 = createButton('Remove R₁');
    removeBtn1.position(600, y1);
    removeBtn1.mousePressed(() => toggleComponent(0));

    let removeBtn2 = createButton('Remove R₂');
    removeBtn2.position(690, y1);
    removeBtn2.mousePressed(() => toggleComponent(1));

    let removeBtn3 = createButton('Remove R₃');
    removeBtn3.position(780, y1);
    removeBtn3.mousePressed(() => toggleComponent(2));

    removeButtons = [removeBtn1, removeBtn2, removeBtn3];

    // Reset button
    let resetBtn = createButton('Reset All');
    resetBtn.position(600, y2);
    resetBtn.mousePressed(resetCircuit);
}

function toggleComponent(index) {
    componentRemoved[index] = !componentRemoved[index];
    removeButtons[index].html(componentRemoved[index] ? 'Restore R₁₊' + (index + 1) : 'Remove R₁₊' + (index + 1));
    removeButtons[index].html(componentRemoved[index] ? 'Restore R' + (index + 1) : 'Remove R' + (index + 1));
}

function resetCircuit() {
    componentRemoved = [false, false, false];
    for (let i = 0; i < 3; i++) {
        removeButtons[i].html('Remove R' + (i + 1));
    }
    voltageSlider.value(9);
    r1Slider.value(100);
    r2Slider.value(100);
    r3Slider.value(100);
}

function initParticles() {
    seriesParticles = [];
    parallelParticles = [];

    for (let i = 0; i < numParticles; i++) {
        seriesParticles.push({ pos: random(), speed: 0 });
    }
    for (let i = 0; i < numParticles * 3; i++) {
        parallelParticles.push({ pos: random(), branch: floor(random(3)), speed: 0 });
    }
}

function calculateSeriesCircuit() {
    let activeResistors = [];
    let resistances = [r1, r2, r3];

    for (let i = 0; i < 3; i++) {
        if (!componentRemoved[i]) {
            activeResistors.push({ index: i, r: resistances[i] });
        }
    }

    if (activeResistors.length === 0) {
        return { rTotal: Infinity, current: 0, voltages: [0, 0, 0], powers: [0, 0, 0], broken: true };
    }

    // In series, if any component is removed, circuit is broken
    if (componentRemoved.some(x => x)) {
        return { rTotal: Infinity, current: 0, voltages: [0, 0, 0], powers: [0, 0, 0], broken: true };
    }

    let rTotal = r1 + r2 + r3;
    let current = batteryVoltage / rTotal;
    let voltages = [current * r1, current * r2, current * r3];
    let powers = [current * current * r1, current * current * r2, current * current * r3];

    return { rTotal, current, voltages, powers, broken: false };
}

function calculateParallelCircuit() {
    let resistances = [r1, r2, r3];
    let currents = [0, 0, 0];
    let voltages = [0, 0, 0];
    let powers = [0, 0, 0];

    // Calculate equivalent resistance (only active branches)
    let invRTotal = 0;
    for (let i = 0; i < 3; i++) {
        if (!componentRemoved[i]) {
            invRTotal += 1 / resistances[i];
        }
    }

    if (invRTotal === 0) {
        return { rTotal: Infinity, totalCurrent: 0, currents, voltages, powers };
    }

    let rTotal = 1 / invRTotal;
    let totalCurrent = batteryVoltage / rTotal;

    // In parallel, voltage is same across all active branches
    for (let i = 0; i < 3; i++) {
        if (!componentRemoved[i]) {
            voltages[i] = batteryVoltage;
            currents[i] = batteryVoltage / resistances[i];
            powers[i] = batteryVoltage * currents[i];
        }
    }

    return { rTotal, totalCurrent, currents, voltages, powers };
}

function updateParticles(seriesData, parallelData) {
    // Series particles
    let seriesSpeed = seriesData.broken ? 0 : map(seriesData.current, 0, 0.2, 0.002, 0.02);
    for (let p of seriesParticles) {
        p.speed = seriesSpeed;
        p.pos += p.speed;
        if (p.pos > 1) p.pos -= 1;
    }

    // Parallel particles - different speeds per branch
    for (let p of parallelParticles) {
        let branchCurrent = parallelData.currents[p.branch];
        p.speed = componentRemoved[p.branch] ? 0 : map(branchCurrent, 0, 0.15, 0.002, 0.025);
        p.pos += p.speed;
        if (p.pos > 1) p.pos -= 1;
    }
}

function draw() {
    updateCanvasSize();

    // Get current values
    batteryVoltage = voltageSlider.value();
    r1 = r1Slider.value();
    r2 = r2Slider.value();
    r3 = r3Slider.value();

    // Calculate circuit values
    let seriesData = calculateSeriesCircuit();
    let parallelData = calculateParallelCircuit();

    // Update particle animation
    updateParticles(seriesData, parallelData);

    // Background
    background(250);

    // Title
    fill(30);
    noStroke();
    textSize(18);
    textAlign(CENTER, TOP);
    text('Series vs Parallel Circuit Comparison', canvasWidth / 2, 8);

    // Draw circuits
    drawSeriesCircuit(seriesData);
    drawParallelCircuit(parallelData);

    // Draw comparison table
    drawComparisonTable(seriesData, parallelData);

    // Control area
    fill(245);
    noStroke();
    rect(0, drawHeight, canvasWidth, controlHeight);

    // Control labels
    drawControlLabels();
}

function drawSeriesCircuit(data) {
    let cx = seriesX + circuitWidth / 2;
    let cy = circuitY + 150;

    // Title
    fill(30);
    noStroke();
    textSize(14);
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    text('SERIES CIRCUIT', cx, circuitY);
    textStyle(NORMAL);

    // Circuit background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(seriesX, circuitY + 20, circuitWidth, circuitHeight, 5);

    // Draw wires
    let wireColor = data.broken ? color(150) : color(60, 60, 180);
    stroke(wireColor);
    strokeWeight(3);
    noFill();

    // Circuit path: Battery -> R1 -> R2 -> R3 -> back
    let bx = seriesX + 40;
    let by = cy;
    let spacing = 90;

    // Top wire
    line(bx + 20, cy - 60, seriesX + circuitWidth - 40, cy - 60);
    // Right wire
    line(seriesX + circuitWidth - 40, cy - 60, seriesX + circuitWidth - 40, cy + 60);
    // Bottom wire
    line(bx + 20, cy + 60, seriesX + circuitWidth - 40, cy + 60);
    // Left wire segments
    line(bx + 20, cy - 60, bx + 20, cy - 25);
    line(bx + 20, cy + 25, bx + 20, cy + 60);

    // Draw battery
    drawBattery(bx, by, batteryVoltage);

    // Draw resistors/bulbs
    let resistances = [r1, r2, r3];
    let resistorX = [seriesX + 120, seriesX + 220, seriesX + 320];

    for (let i = 0; i < 3; i++) {
        if (componentRemoved[i]) {
            // Show broken connection
            stroke(255, 100, 100);
            strokeWeight(2);
            line(resistorX[i] - 10, cy - 60 - 5, resistorX[i] + 10, cy - 60 + 5);
            line(resistorX[i] - 10, cy - 60 + 5, resistorX[i] + 10, cy - 60 - 5);
        } else if (showAsBulbs) {
            drawBulb(resistorX[i], cy - 60, data.powers[i], 'R' + (i + 1));
        } else {
            drawResistor(resistorX[i], cy - 60, resistances[i], 'R' + (i + 1));
        }
    }

    // Draw particles (if circuit working)
    if (!data.broken) {
        drawSeriesParticles(seriesX, cy, circuitWidth, data.current);
    }

    // Show current value
    fill(data.broken ? color(200, 50, 50) : color(30, 100, 30));
    textSize(11);
    textAlign(LEFT, TOP);
    let currentText = data.broken ? 'I = 0 (OPEN)' : 'I = ' + (data.current * 1000).toFixed(1) + ' mA';
    text(currentText, seriesX + 10, circuitY + 25);

    // Voltage drops
    if (!data.broken) {
        textSize(10);
        fill(100, 50, 150);
        for (let i = 0; i < 3; i++) {
            text('V' + (i + 1) + '=' + data.voltages[i].toFixed(1) + 'V', resistorX[i] - 20, cy - 95);
        }
    }
}

function drawParallelCircuit(data) {
    let cx = parallelX + circuitWidth / 2;
    let cy = circuitY + 150;

    // Title
    fill(30);
    noStroke();
    textSize(14);
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    text('PARALLEL CIRCUIT', cx, circuitY);
    textStyle(NORMAL);

    // Circuit background
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(parallelX, circuitY + 20, circuitWidth, circuitHeight, 5);

    // Draw wires
    stroke(60, 60, 180);
    strokeWeight(3);
    noFill();

    let bx = parallelX + 40;
    let by = cy;

    // Main wires
    line(bx + 20, cy - 80, parallelX + circuitWidth - 40, cy - 80);  // Top
    line(bx + 20, cy + 80, parallelX + circuitWidth - 40, cy + 80);  // Bottom
    line(bx + 20, cy - 80, bx + 20, cy - 25);  // Left top
    line(bx + 20, cy + 25, bx + 20, cy + 80);  // Left bottom

    // Branch connections
    let branchX = [parallelX + 140, parallelX + 230, parallelX + 320];
    for (let i = 0; i < 3; i++) {
        if (!componentRemoved[i]) {
            stroke(60, 60, 180);
            line(branchX[i], cy - 80, branchX[i], cy - 30);
            line(branchX[i], cy + 30, branchX[i], cy + 80);
        }
    }

    // Right vertical
    stroke(60, 60, 180);
    line(parallelX + circuitWidth - 40, cy - 80, parallelX + circuitWidth - 40, cy + 80);

    // Draw battery
    drawBattery(bx, by, batteryVoltage);

    // Draw resistors/bulbs in each branch
    let resistances = [r1, r2, r3];
    for (let i = 0; i < 3; i++) {
        if (componentRemoved[i]) {
            // Show removed (open) connection
            stroke(200);
            strokeWeight(1);
            setLineDash([4, 4]);
            line(branchX[i], cy - 80, branchX[i], cy + 80);
            setLineDash([]);
            fill(180);
            textSize(9);
            textAlign(CENTER, CENTER);
            text('OPEN', branchX[i], cy);
        } else if (showAsBulbs) {
            drawBulb(branchX[i], cy, data.powers[i], 'R' + (i + 1));
        } else {
            drawResistor(branchX[i], cy, resistances[i], 'R' + (i + 1));
        }
    }

    // Draw particles
    drawParallelParticles(parallelX, cy, branchX, data.currents);

    // Show branch currents
    textSize(10);
    fill(30, 100, 30);
    textAlign(CENTER, TOP);
    for (let i = 0; i < 3; i++) {
        if (!componentRemoved[i]) {
            text('I' + (i + 1) + '=' + (data.currents[i] * 1000).toFixed(0) + 'mA', branchX[i], cy + 45);
        }
    }

    // Total current
    fill(30, 100, 30);
    textSize(11);
    textAlign(LEFT, TOP);
    text('I_total = ' + (data.totalCurrent * 1000).toFixed(1) + ' mA', parallelX + 10, circuitY + 25);

    // Voltage (same across all)
    fill(100, 50, 150);
    textSize(10);
    text('V = ' + batteryVoltage.toFixed(1) + ' V (same for all)', parallelX + 10, circuitY + 40);
}

function drawBattery(x, y, v) {
    fill(80);
    stroke(60);
    strokeWeight(2);
    rect(x - 10, y - 20, 20, 40, 2);

    fill(200, 50, 50);
    noStroke();
    rect(x - 6, y - 25, 12, 6);

    fill(50, 50, 200);
    rect(x - 6, y + 19, 12, 6);

    fill(255);
    textSize(9);
    textAlign(CENTER, CENTER);
    text(v.toFixed(1) + 'V', x, y);
}

function drawResistor(x, y, r, label) {
    push();
    translate(x, y);
    rotate(HALF_PI);

    fill(220, 200, 180);
    stroke(150);
    strokeWeight(1);
    rect(-20, -8, 40, 16, 2);

    pop();

    fill(60);
    textSize(9);
    textAlign(CENTER, TOP);
    noStroke();
    text(label + ': ' + r + 'Ω', x, y + 22);
}

function drawBulb(x, y, power, label) {
    // Bulb base
    fill(100);
    stroke(80);
    strokeWeight(1);
    rect(x - 8, y + 10, 16, 12, 2);

    // Glass bulb
    let brightness = map(power, 0, 0.5, 50, 255);
    brightness = constrain(brightness, 50, 255);

    // Glow effect
    if (power > 0.01) {
        noStroke();
        for (let r = 30; r > 15; r -= 3) {
            fill(255, 255, 100, map(r, 30, 15, 20, 80) * (brightness / 255));
            ellipse(x, y, r, r);
        }
    }

    fill(brightness, brightness, brightness * 0.8);
    stroke(180);
    strokeWeight(1);
    ellipse(x, y, 24, 24);

    // Filament
    stroke(brightness > 150 ? color(255, 200, 50) : color(100));
    strokeWeight(brightness > 150 ? 2 : 1);
    noFill();
    beginShape();
    vertex(x - 5, y + 8);
    vertex(x - 3, y - 2);
    vertex(x, y + 4);
    vertex(x + 3, y - 2);
    vertex(x + 5, y + 8);
    endShape();

    // Label
    fill(60);
    textSize(9);
    textAlign(CENTER, TOP);
    noStroke();
    text(label, x, y + 25);
}

function drawSeriesParticles(startX, cy, width, current) {
    let speed = map(current, 0, 0.15, 0.5, 3);
    fill(255, 255, 100);
    noStroke();

    for (let p of seriesParticles) {
        let pathPos = p.pos;
        let px, py;

        // Simplified rectangular path
        let hw = width - 80;
        let hh = 120;
        let totalPath = 2 * hw + 2 * hh;
        let dist = pathPos * totalPath;

        let cx = startX + width / 2;

        if (dist < hw) {
            px = startX + 60 + dist;
            py = cy - 60;
        } else if (dist < hw + hh) {
            px = startX + width - 40;
            py = cy - 60 + (dist - hw);
        } else if (dist < 2 * hw + hh) {
            px = startX + width - 40 - (dist - hw - hh);
            py = cy + 60;
        } else {
            px = startX + 60;
            py = cy + 60 - (dist - 2 * hw - hh);
        }

        ellipse(px, py, 6, 6);
    }
}

function drawParallelParticles(startX, cy, branchX, currents) {
    fill(255, 255, 100);
    noStroke();

    for (let p of parallelParticles) {
        if (componentRemoved[p.branch]) continue;
        if (currents[p.branch] < 0.001) continue;

        let pathPos = p.pos;
        let bx = branchX[p.branch];
        let px, py;

        // Path: down through branch, across bottom, up left, across top
        let pathLen = 160 + 300;  // Simplified
        let dist = pathPos * pathLen;

        if (dist < 80) {
            // Down through component
            px = bx;
            py = cy - 80 + dist * 2;
        } else if (dist < 180) {
            // Across bottom to left
            px = bx - (dist - 80);
            py = cy + 80;
        } else if (dist < 280) {
            // Up left side (skip battery area)
            px = startX + 60;
            let upDist = dist - 180;
            if (upDist < 55) {
                py = cy + 80 - upDist;
            } else {
                py = cy - 80 + (100 - upDist);
            }
        } else {
            // Across top to branch
            px = startX + 60 + (dist - 280);
            py = cy - 80;
        }

        ellipse(px, py, 5, 5);
    }
}

function drawComparisonTable(seriesData, parallelData) {
    let tableY = circuitY + circuitHeight + 35;
    let tableHeight = 120;

    // Table background
    fill(255);
    stroke(180);
    strokeWeight(1);
    rect(20, tableY, canvasWidth - 40, tableHeight, 5);

    // Headers
    fill(30);
    textSize(12);
    textStyle(BOLD);
    textAlign(CENTER, TOP);

    let col1 = 100, col2 = 250, col3 = 420, col4 = 590, col5 = 760;

    text('Property', col1, tableY + 8);
    text('Series', col2, tableY + 8);
    text('Parallel', col3, tableY + 8);
    text('Series Formula', col4, tableY + 8);
    text('Parallel Formula', col5, tableY + 8);

    textStyle(NORMAL);
    textSize(11);

    // Line
    stroke(200);
    line(30, tableY + 28, canvasWidth - 50, tableY + 28);

    // Data rows
    let rows = [
        ['Total R', formatR(seriesData.rTotal), formatR(parallelData.rTotal), 'R₁ + R₂ + R₃', '1/(1/R₁ + 1/R₂ + 1/R₃)'],
        ['Total I', formatI(seriesData.current), formatI(parallelData.totalCurrent), 'V / R_total', 'I₁ + I₂ + I₃'],
        ['Voltage', seriesData.broken ? '—' : 'V₁+V₂+V₃=' + batteryVoltage.toFixed(1) + 'V', 'V₁=V₂=V₃=' + batteryVoltage.toFixed(1) + 'V', 'Adds up to V_source', 'Same across all'],
        ['Current', seriesData.broken ? 'OPEN' : 'Same: ' + formatI(seriesData.current), 'Divides: varies', 'Same through all', 'Divides by R']
    ];

    noStroke();
    let rowY = tableY + 35;
    for (let row of rows) {
        fill(60);
        textAlign(CENTER, TOP);
        text(row[0], col1, rowY);
        fill(seriesData.broken && row[0] !== 'Total R' ? color(200, 50, 50) : color(30, 100, 150));
        text(row[1], col2, rowY);
        fill(30, 150, 100);
        text(row[2], col3, rowY);
        fill(100);
        textSize(10);
        text(row[3], col4, rowY);
        text(row[4], col5, rowY);
        textSize(11);
        rowY += 22;
    }
}

function formatR(r) {
    if (r === Infinity) return '∞';
    if (r >= 1000) return (r / 1000).toFixed(2) + ' kΩ';
    return r.toFixed(1) + ' Ω';
}

function formatI(i) {
    if (i === 0) return '0';
    if (i < 0.001) return (i * 1000000).toFixed(1) + ' μA';
    return (i * 1000).toFixed(1) + ' mA';
}

function setLineDash(pattern) {
    drawingContext.setLineDash(pattern);
}

function drawControlLabels() {
    fill(60);
    textSize(12);
    textAlign(LEFT, CENTER);
    noStroke();

    text('Voltage: ' + batteryVoltage.toFixed(1) + ' V', 10, drawHeight + 27);
    text('R₁: ' + r1 + ' Ω', 10, drawHeight + 57);
    text('R₂: ' + r2 + ' Ω', 200, drawHeight + 57);
    text('R₃: ' + r3 + ' Ω', 390, drawHeight + 57);

    // Instructions
    fill(100);
    textSize(11);
    text('Click "Remove" buttons to see what happens when a component fails', 10, drawHeight + 115);
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
    const container = document.querySelector('main');
    if (container) {
        canvasWidth = min(container.offsetWidth, 950);
    }
}
