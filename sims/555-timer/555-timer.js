// 555 Timer Simulation using p5.js
// CANVAS_HEIGHT: 500
// Two-column layout: Circuit/LED on left, Logic Analyzer on right
// Demonstrates both Astable and Monostable modes with accurate timing formulas

// Canvas dimensions
let canvasWidth = 580;
let drawHeight = 400;
let controlHeight = 100;
let canvasHeight = drawHeight + controlHeight;
let margin = 15;
let sliderLeftMargin = 130;

// Layout
let leftColWidth;
let rightColX;
let rightColWidth;

// Control-area row geometry. Sliders and their labels both read these, so the
// two can never drift apart. capRowIndex moves the capacitor slider up into
// R2's row in monostable mode, where R2 is hidden.
let sliderRowY = [];
let buttonRowY = 0;
let capRowIndex = 2;

// Components
let r1Slider, r2Slider, capacitanceSlider;
let runButton;
let modeButton;
let triggerButton;
let isAstableMode = true;
let ledState = false;
let monostableTriggered = false;
let monostablePulseEnd = 0;

// Simulation clock. Every timing decision reads simTime rather than millis(),
// so pausing freezes the trace and a slow frame costs a frame of animation
// instead of stretching the pulse that happened to be in flight.
let isRunning = false;   // sims start paused; the student presses Start
let simTime = 0;          // ms of simulated time elapsed
let lastFrameMs = 0;      // wall clock at the previous frame
let nextEdgeTime = 0;     // simTime of the next astable output transition
const MAX_FRAME_MS = 100; // ignore hitches longer than this (backgrounded tab)

// Logic analyzer data
let analyzerData = [];
let nextSampleTime = 0;
let timeWindowMs = 5000; // 5 second window
const SAMPLE_INTERVAL = 10; // Sample every 10ms

function setup() {
    updateCanvasSize();
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent(document.querySelector('main'));
    textSize(16);

    lastFrameMs = millis();
    createControls();

    describe('555 Timer simulation with logic analyzer display showing LED blinking and waveform in astable and monostable modes', LABEL);
}

function updateCanvasSize() {
    const container = document.querySelector('main');
    canvasWidth = container ? container.offsetWidth : 580;
    canvasWidth = max(canvasWidth, 500);

    // Calculate column widths
    leftColWidth = min(220, canvasWidth * 0.4);
    rightColX = leftColWidth + margin;
    rightColWidth = canvasWidth - rightColX - margin;
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvasWidth, canvasHeight);
    updateControlPositions();
}

function createControls() {
    r1Slider = createSlider(1, 100, 10, 1);
    r1Slider.parent(document.querySelector('main'));

    r2Slider = createSlider(1, 100, 47, 1);
    r2Slider.parent(document.querySelector('main'));

    capacitanceSlider = createSlider(1, 100, 10, 1);
    capacitanceSlider.parent(document.querySelector('main'));

    runButton = createButton('Start Simulation');
    runButton.parent(document.querySelector('main'));
    runButton.mousePressed(toggleRun);

    modeButton = createButton('Switch to Monostable');
    modeButton.parent(document.querySelector('main'));
    modeButton.mousePressed(toggleMode);

    triggerButton = createButton('Trigger');
    triggerButton.parent(document.querySelector('main'));
    triggerButton.mousePressed(triggerMonostable);

    updateControlPositions();
}

function updateControlPositions() {
    let sliderWidth = canvasWidth - sliderLeftMargin - margin;
    let top = drawHeight + 8;

    // Three slider rows plus a button row, all inside controlHeight.
    sliderRowY = [top, top + 24, top + 48];
    buttonRowY = drawHeight + 76;

    // Astable uses all three rows; monostable hides R2, so C takes its row.
    capRowIndex = isAstableMode ? 2 : 1;

    r1Slider.position(sliderLeftMargin, sliderRowY[0]);
    r1Slider.size(sliderWidth);

    r2Slider.position(sliderLeftMargin, sliderRowY[1]);
    r2Slider.size(sliderWidth);

    capacitanceSlider.position(sliderLeftMargin, sliderRowY[capRowIndex]);
    capacitanceSlider.size(sliderWidth);

    runButton.position(margin, buttonRowY);
    runButton.size(130, 22);

    modeButton.position(margin + 140, buttonRowY);
    modeButton.size(145, 22);

    triggerButton.position(margin + 295, buttonRowY);
    triggerButton.size(70, 22);

    updateModeUI();
}

function updateModeUI() {
    runButton.html(isRunning ? 'Pause Simulation' : 'Start Simulation');

    if (isAstableMode) {
        r2Slider.show();
        triggerButton.hide();
        modeButton.html('Switch to Monostable');
    } else {
        r2Slider.hide();
        triggerButton.show();
        modeButton.html('Switch to Astable');
    }
}

function toggleMode() {
    isAstableMode = !isAstableMode;
    resetSimulation();
    updateControlPositions();
}

function toggleRun() {
    isRunning = !isRunning;
    updateModeUI();
}

// Clear the trace and restart the clock. The astable output comes up HIGH at
// t = 0 because updateLED() resolves the edge scheduled at nextEdgeTime = 0.
function resetSimulation() {
    analyzerData = [];
    simTime = 0;
    nextSampleTime = 0;
    nextEdgeTime = 0;
    ledState = false;
    monostableTriggered = false;
}

function triggerMonostable() {
    if (!isAstableMode && !monostableTriggered) {
        monostableTriggered = true;
        ledState = true;
        let R = r1Slider.value() * 1000;
        let C = capacitanceSlider.value() / 1000000;
        let pulseWidth = 1.1 * R * C * 1000;
        monostablePulseEnd = simTime + pulseWidth;
    }
}

function draw() {
    // Drawing area
    fill('aliceblue');
    stroke('silver');
    strokeWeight(2);
    rect(0, 0, canvasWidth, drawHeight);

    // Control area
    fill('white');
    noStroke();
    rect(0, drawHeight, canvasWidth, controlHeight);

    // Title
    fill('black');
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    let modeText = isAstableMode ? 'Astable (Oscillator)' : 'Monostable (One-Shot)';
    text('555 Timer: ' + modeText, canvasWidth / 2, 18);

    // Advance the simulation clock and sample the output
    advanceSimulation();

    // Draw left column (circuit + LED)
    drawLeftColumn();

    // Draw right column (logic analyzer)
    drawLogicAnalyzer();

    // Draw slider labels
    drawSliderLabels();
}

function drawLeftColumn() {
    // Left column background
    fill(250);
    stroke('silver');
    strokeWeight(1);
    rect(margin, 38, leftColWidth - margin, drawHeight - 48, 5);

    // Draw 555 chip
    draw555Chip();

    // Draw LED
    drawLED();

    // Draw timing info below LED
    drawTimingInfo();
}

function draw555Chip() {
    let chipX = margin + (leftColWidth - margin) / 2;
    let chipY = 100;
    let chipW = 80;
    let chipH = 65;

    // Chip body
    fill(30);
    stroke(60);
    strokeWeight(2);
    rectMode(CENTER);
    rect(chipX, chipY, chipW, chipH, 3);

    // Notch
    fill(50);
    noStroke();
    arc(chipX, chipY - chipH/2, 12, 12, 0, PI);

    // Pin labels - left side
    fill(255);
    textSize(7);
    let pinNames = ['GND', 'TRIG', 'OUT', 'RST'];
    for (let i = 0; i < 4; i++) {
        let py = chipY - chipH/2 + 12 + i * 14;
        fill(200, 180, 100);
        noStroke();
        rect(chipX - chipW/2 - 6, py, 10, 5);
        fill(255);
        textAlign(LEFT, CENTER);
        textSize(6);
        text(pinNames[i], chipX - chipW/2 + 6, py);
    }

    // Pin labels - right side
    pinNames = ['VCC', 'DIS', 'THR', 'CTL'];
    for (let i = 0; i < 4; i++) {
        let py = chipY - chipH/2 + 12 + i * 14;
        fill(200, 180, 100);
        noStroke();
        rect(chipX + chipW/2 + 6, py, 10, 5);
        fill(255);
        textAlign(RIGHT, CENTER);
        textSize(6);
        text(pinNames[i], chipX + chipW/2 - 6, py);
    }

    // 555 label
    fill(255);
    textSize(11);
    textAlign(CENTER, CENTER);
    text('NE555', chipX, chipY + 18);

    rectMode(CORNER);

    // R1 symbol
    drawResistor(chipX - 55, chipY - 15, 'R1');

    // R2 symbol (astable only)
    if (isAstableMode) {
        drawResistor(chipX - 55, chipY + 20, 'R2');
    }

    // Capacitor symbol
    drawCapacitor(chipX + 55, chipY + 5, 'C');
}

function drawResistor(x, y, label) {
    stroke(0);
    strokeWeight(1);
    line(x, y - 10, x, y - 5);
    line(x, y + 5, x, y + 10);

    noFill();
    beginShape();
    vertex(x, y - 5);
    for (let i = 0; i < 3; i++) {
        vertex(x + (i % 2 === 0 ? 4 : -4), y - 3 + i * 3);
    }
    vertex(x, y + 5);
    endShape();

    noStroke();
    fill(0);
    textSize(7);
    textAlign(CENTER, CENTER);
    text(label, x - 10, y);
}

function drawCapacitor(x, y, label) {
    stroke(0);
    strokeWeight(1);
    line(x, y - 10, x, y - 3);
    line(x, y + 3, x, y + 10);
    line(x - 5, y - 3, x + 5, y - 3);
    noFill();
    arc(x, y + 6, 10, 6, PI, TWO_PI);

    noStroke();
    fill(0);
    textSize(7);
    textAlign(CENTER, CENTER);
    text(label, x + 10, y);
}

function drawLED() {
    let ledX = margin + (leftColWidth - margin) / 2;
    let ledY = 195;

    // LED label
    fill(80);
    noStroke();
    textSize(9);
    textAlign(CENTER, CENTER);
    text('OUTPUT', ledX, ledY - 22);

    // Glow effect
    if (ledState) {
        noStroke();
        for (let r = 30; r > 0; r -= 4) {
            fill(255, 0, 0, map(r, 0, 30, 80, 5));
            ellipse(ledX, ledY, r, r);
        }
    }

    // LED body
    if (ledState) {
        fill(255, 0, 0);
    } else {
        fill(80, 40, 40);
    }
    stroke(60);
    strokeWeight(1);
    ellipse(ledX, ledY, 22, 22);

    // Highlight
    noStroke();
    fill(255, 255, 255, ledState ? 140 : 40);
    ellipse(ledX - 4, ledY - 4, 5, 5);

    // Status
    fill(0);
    textSize(10);
    text(ledState ? 'ON' : 'OFF', ledX, ledY + 20);
}

function drawTimingInfo() {
    let R1 = r1Slider.value();
    let R2 = r2Slider.value();
    let C = capacitanceSlider.value();
    let R1_ohm = R1 * 1000;
    let R2_ohm = R2 * 1000;
    let C_farad = C / 1000000;

    let infoY = 235;
    let infoX = margin + 10;
    let infoW = leftColWidth - margin - 20;

    fill(240);
    stroke('silver');
    strokeWeight(1);
    rect(infoX, infoY, infoW, isAstableMode ? 70 : 50, 3);

    fill(0);
    noStroke();
    textSize(8);
    textAlign(LEFT, CENTER);

    if (isAstableMode) {
        let tHigh = 0.693 * (R1_ohm + R2_ohm) * C_farad * 1000;
        let tLow = 0.693 * R2_ohm * C_farad * 1000;
        let period = tHigh + tLow;
        let frequency = 1000 / period;
        let dutyCycle = (tHigh / period) * 100;

        text('T_high: ' + tHigh.toFixed(0) + ' ms', infoX + 5, infoY + 12);
        text('T_low: ' + tLow.toFixed(0) + ' ms', infoX + 5, infoY + 26);
        text('Period: ' + period.toFixed(0) + ' ms', infoX + 5, infoY + 40);
        text('Freq: ' + frequency.toFixed(2) + ' Hz', infoX + 5, infoY + 54);
        textAlign(CENTER, CENTER);
        text('Duty: ' + dutyCycle.toFixed(0) + '%', infoX + infoW/2, infoY + 64);
    } else {
        let pulseWidth = 1.1 * R1_ohm * C_farad * 1000;
        text('Pulse: ' + pulseWidth.toFixed(0) + ' ms', infoX + 5, infoY + 15);
        text('t = 1.1 × R × C', infoX + 5, infoY + 32);
        if (!monostableTriggered) {
            fill(100);
            text('Press Trigger', infoX + 5, infoY + 45);
        }
    }

    // Formula at bottom of left column
    fill(60);
    textSize(7);
    textAlign(CENTER, CENTER);
    if (isAstableMode) {
        text('T = 0.693(R1+2R2)C', margin + (leftColWidth-margin)/2, drawHeight - 25);
        text('f = 1.44/((R1+2R2)C)', margin + (leftColWidth-margin)/2, drawHeight - 14);
    } else {
        text('t = 1.1 × R × C', margin + (leftColWidth-margin)/2, drawHeight - 18);
    }
}

function drawLogicAnalyzer() {
    let anaX = rightColX;
    let anaY = 38;
    let anaW = rightColWidth;
    let anaH = drawHeight - 48;

    // Background
    fill(20);
    stroke('silver');
    strokeWeight(1);
    rect(anaX, anaY, anaW, anaH, 5);

    // Title
    fill(0, 255, 0);
    noStroke();
    textSize(11);
    textAlign(LEFT, CENTER);
    text('Logic Analyzer - Output (Pin 3)', anaX + 10, anaY + 15);

    // Waveform area
    let waveX = anaX + 50;
    let waveY = anaY + 35;
    let waveW = anaW - 60;
    let waveH = anaH - 100;
    let windowStart = max(0, simTime - timeWindowMs);

    // Grid background
    fill(30);
    stroke(50);
    strokeWeight(1);
    rect(waveX, waveY, waveW, waveH);

    // Draw time grid lines and labels
    drawTimeGrid(waveX, waveY, waveW, waveH);

    // Draw HIGH/LOW labels
    fill(100);
    textSize(9);
    textAlign(RIGHT, CENTER);
    text('HIGH', waveX - 5, waveY + 15);
    text('LOW', waveX - 5, waveY + waveH - 15);

    // Draw voltage scale
    fill(80);
    textSize(8);
    text('5V', waveX - 5, waveY + 5);
    text('0V', waveX - 5, waveY + waveH - 5);

    // Draw waveform
    if (analyzerData.length > 1) {
        stroke(0, 255, 0);
        strokeWeight(2);
        noFill();

        let highY = waveY + 20;
        let lowY = waveY + waveH - 20;

        beginShape();
        let prevX = null;
        let prevY = null;

        for (let i = 0; i < analyzerData.length; i++) {
            let sample = analyzerData[i];
            let x = map(sample.time, windowStart, windowStart + timeWindowMs, waveX, waveX + waveW);
            let y = sample.state === 1 ? highY : lowY;

            if (x >= waveX && x <= waveX + waveW) {
                // Draw vertical transition line for square wave
                if (prevX !== null && prevY !== null && prevY !== y) {
                    vertex(x, prevY);
                }
                vertex(x, y);
                prevX = x;
                prevY = y;
            }
        }
        endShape();
    }

    // Draw current time marker; it tracks the pen while the window still fills
    stroke(255, 100, 0);
    strokeWeight(1);
    let markerX = min(map(simTime, windowStart, windowStart + timeWindowMs,
                          waveX, waveX + waveW), waveX + waveW - 2);
    line(markerX, waveY, markerX, waveY + waveH);

    // Time window info
    fill(150);
    noStroke();
    textSize(9);
    textAlign(CENTER, CENTER);
    text('Time Window: ' + (timeWindowMs/1000).toFixed(1) + 's', anaX + anaW/2, anaY + anaH - 35);

    // Current state indicator
    if (!isRunning) {
        fill(255, 180, 0);
    } else if (ledState) {
        fill(0, 255, 0);
    } else {
        fill(100);
    }
    textSize(10);
    let stateText = 'Current: ' + (ledState ? 'HIGH' : 'LOW');
    text(isRunning ? stateText : stateText + '  (PAUSED)', anaX + anaW/2, anaY + anaH - 18);
}

function drawTimeGrid(x, y, w, h) {
    let windowStart = max(0, simTime - timeWindowMs);

    // Vertical grid lines (time divisions)
    stroke(50);
    strokeWeight(1);

    let numDivisions = 10;
    let msPerDiv = timeWindowMs / numDivisions;

    fill(80);
    textSize(8);
    textAlign(CENTER, TOP);

    for (let i = 0; i <= numDivisions; i++) {
        let divX = x + (w * i / numDivisions);

        // Grid line
        if (i === numDivisions) {
            stroke(255, 100, 0, 100);
        } else {
            stroke(50);
        }
        line(divX, y, divX, y + h);

        // Time label
        let timeAtDiv = windowStart + (i * msPerDiv);
        noStroke();
        fill(80);
        if (i % 2 === 0) {
            let labelText;
            if (timeAtDiv >= 1000) {
                labelText = (timeAtDiv / 1000).toFixed(1) + 's';
            } else {
                labelText = timeAtDiv.toFixed(0) + 'ms';
            }
            text(labelText, divX, y + h + 3);
        }
    }

    // Horizontal grid lines
    stroke(50);
    line(x, y + h/2, x + w, y + h/2);

    // Division label
    fill(100);
    textSize(8);
    textAlign(LEFT, CENTER);
    text((msPerDiv).toFixed(0) + 'ms/div', x + 5, y + h + 15);
}

// Convert elapsed wall-clock time into simulated time, then step the sim on a
// fixed 10 ms grid. Sampling on the grid rather than once per frame keeps the
// trace at constant density and the pulse widths true however the browser
// schedules frames.
function advanceSimulation() {
    let now = millis();
    let delta = now - lastFrameMs;
    lastFrameMs = now;

    if (!isRunning) {
        return;
    }

    // A backgrounded tab or a GC pause would otherwise fast-forward the trace.
    simTime += constrain(delta, 0, MAX_FRAME_MS);

    while (nextSampleTime <= simTime) {
        updateLED(nextSampleTime);
        analyzerData.push({ time: nextSampleTime, state: ledState ? 1 : 0 });
        nextSampleTime += SAMPLE_INTERVAL;
    }

    trimAnalyzerData();
}

// Resolve every output transition due at or before time t. Advancing
// nextEdgeTime by whole half-cycles, instead of restarting it from the current
// time, means a late frame is absorbed rather than added to the pulse width.
function updateLED(t) {
    if (isAstableMode) {
        let R1 = r1Slider.value() * 1000;
        let R2 = r2Slider.value() * 1000;
        let C = capacitanceSlider.value() / 1000000;

        // The 1 ms floor bounds this loop; the slider minimums never reach it.
        let tHigh = max(1, 0.693 * (R1 + R2) * C * 1000);
        let tLow = max(1, 0.693 * R2 * C * 1000);

        while (t >= nextEdgeTime) {
            ledState = !ledState;
            nextEdgeTime += ledState ? tHigh : tLow;
        }
    } else if (monostableTriggered && t >= monostablePulseEnd) {
        ledState = false;
        monostableTriggered = false;
    }
}

// Drop samples that have scrolled off the left edge. One splice beats a shift()
// per sample, which reindexes the whole array every time.
function trimAnalyzerData() {
    let cutoff = simTime - timeWindowMs;
    let drop = 0;
    while (drop < analyzerData.length && analyzerData[drop].time < cutoff) {
        drop++;
    }
    if (drop > 0) {
        analyzerData.splice(0, drop);
    }
}

function drawSliderLabels() {
    fill('black');
    noStroke();
    textSize(11);
    textAlign(RIGHT, CENTER);
    let labelX = sliderLeftMargin - 8;

    // +8 centers the label on the 16px-tall slider in that row.
    let r1Label = isAstableMode ? 'R1: ' : 'R: ';
    text(r1Label + r1Slider.value() + ' k\u03A9', labelX, sliderRowY[0] + 8);

    if (isAstableMode) {
        text('R2: ' + r2Slider.value() + ' k\u03A9', labelX, sliderRowY[1] + 8);
    }

    text('C: ' + capacitanceSlider.value() + ' \u00B5F', labelX, sliderRowY[capRowIndex] + 8);
}
