// LED resistor calculator MicroSim
let voltageSlider, voltageDropSlider, currentSlider;
let resistorValue, resistorBands;
let voltage, voltageDrop, current;

function setup() {
  const canvas = createCanvas(500, 250);
  var mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(16);
  
  // Sliders
  // Typical voltage is between 3 and 12 volts
  voltageSlider = createSlider(3, 12, 3.3, 0.1);
  voltageSlider.size(270);
  voltageSlider.position(200, 20);
  
  // Typical LED voltage drops
  voltageDropSlider = createSlider(1.7, 3.3, 2.2, 0.1);
  voltageDropSlider.size(270);
  voltageDropSlider.position(200, 60);
  
  // Desired current in milliamps
  currentSlider = createSlider(2, 20, 5, 1);
  currentSlider.size(270);
  currentSlider.position(200, 100);
}

function draw() {
  background(235);
  
  // Read slider values
  voltage = voltageSlider.value();
  voltageDrop = voltageDropSlider.value();
  current = currentSlider.value();

  // Calculate resistor value
  idealResistorValue = (voltage - voltageDrop) / (current / 1000); // Ohm's Law, I in Amps
  resistorValue = findClosestStandardResistor(idealResistorValue);
  // Display circuit information

  fill(0);
  textSize(16);
  text("Input Voltage: " + voltage + "V", 10, 35);
  text("LED Voltage Drop: " + voltageDrop + "V", 10, 75);
  text("LED Current: " + current + "mA", 10, 115);
  
  // Calculate and display resistor value
  textSize(16);
  text("Ideal Resistor Value: " + idealResistorValue.toFixed(0) + " Ω", 20, 140);
  text("Nearest Resistor: " + resistorValue.toFixed(0) + " Ω", 20, 160);
  
  // Resistor Colors
  textSize(12);
  text('red          yellow         green          blue/white', 220,57);
  
  // Current Brightness
  text('very dim,       dim,      medium,      bright,      max', 210, 97);
  
  // Calculate resistor bands
  resistorBands = calculateResistorBands(resistorValue.toFixed(0));
  text("Band 1 Color: " + resistorBands[0], 120, 190);
  text("Band 2 Color: " + resistorBands[1], 120, 210);
  text("Multiplier: " + resistorBands[2], 120, 230);

  // Display resistor bands
  drawResistor(280, 160, 150, 50, resistorBands);
}

function calculateResistorBands(resistorValue) {
  // Resistor color coding logic
  let colors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"];
  let bands = [];
  
  if (resistorValue < 1) {
    bands = ["black", "black", "black"]; // For values less than 1 Ohm
  } else {
    rString = str(resistorValue)
    let firstBand = int(rString[0]);
    text("First Band: " + firstBand, 20, 190);
    let secondBand = int(rString[1]);
    text("Second Band: " + secondBand, 20, 210);
    let multiplier = rString.length - 2;
    text("Multiplier: " + multiplier, 20, 230);
    
    // Ensure the indices are within the colors array range
    firstBand = ensureIndexInRange(firstBand, colors);
    secondBand = ensureIndexInRange(secondBand, colors);
    multiplier = ensureIndexInRange(multiplier, colors);

    bands.push(colors[firstBand], colors[secondBand], colors[multiplier]);
  }

  return bands;
}

function ensureIndexInRange(index, array) {
  // Check if index is within the array range
  if (index >= 0 && index < array.length) {
    return index;
  } else {
    return 0; // Default to the first color if out of range
  }
}

function drawResistor(x, y, w, h, bands) {
  // Draw the resistor body
  fill("tan");
  rect(x, y, w, h);

  // Draw the bands
  for (let i = 0; i < bands.length; i++) {
    fill(bands[i]);
    rect(x + 10 + i * 30, y, 20, h);
  }
}

function findClosestStandardResistor(inputOhms) {
  const e12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  let standardValues = [];
  for (let factor = 0.1; factor <= 1000000; factor *= 10) {
    e12.forEach(value => {
      standardValues.push(value * factor);
    });
  }
  let closest = standardValues[0];
  let minDiff = Math.abs(inputOhms - closest);
  for (let i = 1; i < standardValues.length; i++) {
    let diff = Math.abs(inputOhms - standardValues[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = standardValues[i];
    }
  }
  return closest;
}