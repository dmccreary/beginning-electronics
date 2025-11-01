#!/usr/bin/env python3
"""
Add taxonomy IDs to the concepts-dependencies.csv file
"""

import csv

# Taxonomy mapping based on step-05-taxonomy.md
TAXONOMY = {
    # FUND - Fundamentals (1-40)
    'Electric Current': 'FUND',
    'Voltage': 'FUND',
    'Resistance': 'FUND',
    "Ohm's Law": 'FUND',
    'Power': 'FUND',
    'Direct Current': 'FUND',
    'Circuit': 'FUND',
    'Open Circuit': 'FUND',
    'Closed Circuit': 'FUND',
    'Short Circuit': 'FUND',
    'Series Circuit': 'FUND',
    'Parallel Circuit': 'FUND',
    'Ground': 'FUND',
    'Polarity': 'FUND',
    'Circuit Diagram': 'FUND',
    'Schematic Symbol': 'FUND',
    'Component Lead': 'FUND',
    'Positive Terminal': 'FUND',
    'Negative Terminal': 'FUND',
    'Voltage Drop': 'FUND',
    'Current Flow': 'FUND',
    'Electron Flow': 'FUND',
    'Conventional Current': 'FUND',
    'Electric Charge': 'FUND',
    'Potential Difference': 'FUND',
    'Electrical Safety': 'FUND',
    'Power Rating': 'FUND',
    'Heat Dissipation': 'FUND',
    'Current Limiting': 'FUND',
    'Voltage Division': 'FUND',
    "Kirchhoff's Current Law": 'FUND',
    "Kirchhoff's Voltage Law": 'FUND',
    'AC vs DC': 'FUND',
    'Battery Polarity': 'FUND',
    'Power Supply Voltage': 'FUND',
    'Circuit Node': 'FUND',
    'Common Ground': 'FUND',
    'Forward Voltage': 'FUND',
    'Reverse Voltage': 'FUND',
    'Conductivity': 'FUND',

    # PASS - Passive Components (41-70)
    'Resistor': 'PASS',
    'Resistor Color Code': 'PASS',
    'Resistor Tolerance': 'PASS',
    'Fixed Resistor': 'PASS',
    'Variable Resistor': 'PASS',
    'Potentiometer': 'PASS',
    'Trimmer Resistor': 'PASS',
    'Photoresistor': 'PASS',
    'Light Dependent Resistor': 'PASS',
    'Thermistor': 'PASS',
    'Pull-Up Resistor': 'PASS',
    'Pull-Down Resistor': 'PASS',
    'Current Limiting Resistor': 'PASS',
    'Voltage Divider Circuit': 'PASS',
    'Capacitor': 'PASS',
    'Electrolytic Capacitor': 'PASS',
    'Ceramic Capacitor': 'PASS',
    'Capacitor Polarity': 'PASS',
    'Capacitance': 'PASS',
    'RC Time Constant': 'PASS',
    'RC Circuit': 'PASS',
    'Charging Capacitor': 'PASS',
    'Discharging Capacitor': 'PASS',
    'Inductor': 'PASS',
    'Diode': 'PASS',
    'LED Polarity': 'PASS',
    'LED Forward Voltage': 'PASS',
    'LED Current Rating': 'PASS',
    'Anode': 'PASS',
    'Cathode': 'PASS',

    # ACT - Active Components (71-95)
    'Transistor': 'ACT',
    'NPN Transistor': 'ACT',
    'PNP Transistor': 'ACT',
    'Transistor Base': 'ACT',
    'Transistor Collector': 'ACT',
    'Transistor Emitter': 'ACT',
    'Transistor Switching': 'ACT',
    'Transistor Amplification': 'ACT',
    'Transistor Saturation': 'ACT',
    'Transistor Cutoff': 'ACT',
    '2N2222 Transistor': 'ACT',
    'BC547 Transistor': 'ACT',
    'Integrated Circuit': 'ACT',
    '555 Timer IC': 'ACT',
    '555 Astable Mode': 'ACT',
    '555 Monostable Mode': 'ACT',
    '555 Pin Configuration': 'ACT',
    'Shift Register': 'ACT',
    '74595 Shift Register': 'ACT',
    'Serial Data Input': 'ACT',
    'Parallel Data Output': 'ACT',
    'Clock Signal': 'ACT',
    'Latch Signal': 'ACT',
    'IC Pin Numbering': 'ACT',
    'IC Notch Orientation': 'ACT',

    # IO - Input/Output (96-125)
    'Push Button': 'IO',
    'Momentary Switch': 'IO',
    'Toggle Switch': 'IO',
    'SPST Switch': 'IO',
    'SPDT Switch': 'IO',
    'Normally Open': 'IO',
    'Normally Closed': 'IO',
    'Button Debouncing': 'IO',
    'Light Sensor': 'IO',
    'Photocell Circuit': 'IO',
    'Dark Detector': 'IO',
    'Sensor Threshold': 'IO',
    'Analog Input': 'IO',
    'Digital Input': 'IO',
    'Input Pullup': 'IO',
    'Light Emitting Diode': 'IO',
    'RGB LED': 'IO',
    'Common Cathode RGB': 'IO',
    'Common Anode RGB': 'IO',
    'LED Brightness Control': 'IO',
    'LED Series Resistor': 'IO',
    'LED Resistor Calculator': 'IO',
    'DC Motor': 'IO',
    'Motor Control Circuit': 'IO',
    'Motor Speed Control': 'IO',
    'PWM Control': 'IO',
    'Duty Cycle': 'IO',
    'Visual Output': 'IO',
    'Audio Output': 'IO',
    'Actuator': 'IO',

    # BREAD - Breadboarding (126-150)
    'Solderless Breadboard': 'BREAD',
    'Breadboard Power Rails': 'BREAD',
    'Breadboard Tie Points': 'BREAD',
    'Breadboard Rows': 'BREAD',
    'Breadboard Columns': 'BREAD',
    'Breadboard Internal Connections': 'BREAD',
    'Component Placement': 'BREAD',
    'Wire Routing': 'BREAD',
    'Jumper Wire': 'BREAD',
    'Solid Core Wire': 'BREAD',
    'Wire Stripping': 'BREAD',
    'Wire Length Management': 'BREAD',
    'Circuit Layout': 'BREAD',
    'Component Orientation': 'BREAD',
    'Power Rail Connection': 'BREAD',
    'Ground Rail Connection': 'BREAD',
    'Breadboard Bridge Wire': 'BREAD',
    'Neat Wiring Practice': 'BREAD',
    'Component Lead Bending': 'BREAD',
    'Breadboard Limitations': 'BREAD',
    'Temporary Circuits': 'BREAD',
    'Prototyping': 'BREAD',
    'Circuit Testing': 'BREAD',
    'Breadboard Troubleshooting': 'BREAD',
    'Component Removal': 'BREAD',

    # MEAS - Measurement (151-165)
    'Multimeter': 'MEAS',
    'Voltage Measurement': 'MEAS',
    'Current Measurement': 'MEAS',
    'Resistance Measurement': 'MEAS',
    'Continuity Testing': 'MEAS',
    'Multimeter Probes': 'MEAS',
    'Voltage Range Selection': 'MEAS',
    'Current Range Selection': 'MEAS',
    'Diode Testing Mode': 'MEAS',
    'Circuit Debugging': 'MEAS',
    'Troubleshooting Strategy': 'MEAS',
    'Component Testing': 'MEAS',
    'Power Supply Testing': 'MEAS',
    'Signal Tracing': 'MEAS',
    'Visual Inspection': 'MEAS',

    # PWR - Power Systems (166-180)
    'USB Power Supply': 'PWR',
    '5 Volt Power': 'PWR',
    'Battery Power': 'PWR',
    '9 Volt Battery': 'PWR',
    'Power Supply Selection': 'PWR',
    'Voltage Regulator': 'PWR',
    '7805 Voltage Regulator': 'PWR',
    'Buck Converter': 'PWR',
    'Boost Converter': 'PWR',
    'Linear Regulator': 'PWR',
    'Switching Regulator': 'PWR',
    'Power Efficiency': 'PWR',
    'Input Voltage': 'PWR',
    'Output Voltage': 'PWR',
    'Current Capacity': 'PWR',

    # DIG - Digital Logic (181-192)
    'Boolean Logic': 'DIG',
    'Truth Table': 'DIG',
    'AND Gate': 'DIG',
    'OR Gate': 'DIG',
    'NOT Gate': 'DIG',
    'NAND Gate': 'DIG',
    'NOR Gate': 'DIG',
    'XOR Gate': 'DIG',
    'Logic Level High': 'DIG',
    'Logic Level Low': 'DIG',
    'Combinational Logic': 'DIG',
    'Sequential Logic': 'DIG',

    # ADV - Advanced Circuits (193-200)
    'Flip Flop Circuit': 'ADV',
    'Memory Cell': 'ADV',
    'Bistable Circuit': 'ADV',
    'Timing Circuit': 'ADV',
    'Oscillator Circuit': 'ADV',
    'LED Flasher': 'ADV',
    'Signal Generator': 'ADV',
    'Night Light Circuit': 'ADV',
}

def add_taxonomy_to_csv(input_file, output_file):
    """Add TaxonomyID column to CSV"""

    rows = []

    # Read existing CSV
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            concept = row['Concept'].strip()
            dependency = row['Dependency'].strip()

            # Get taxonomy ID
            taxonomy_id = TAXONOMY.get(concept, 'UNKNOWN')

            rows.append({
                'Concept': concept,
                'Dependency': dependency,
                'TaxonomyID': taxonomy_id
            })

    # Write new CSV with taxonomy
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['Concept', 'Dependency', 'TaxonomyID']
        writer = csv.DictWriter(f, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(rows)

    # Print statistics
    taxonomy_counts = {}
    for row in rows:
        tid = row['TaxonomyID']
        taxonomy_counts[tid] = taxonomy_counts.get(tid, 0) + 1

    print(f"Added taxonomy IDs to {len(rows)} concepts")
    print(f"Output written to {output_file}\n")
    print("Taxonomy Distribution:")
    for tid in sorted(taxonomy_counts.keys()):
        count = taxonomy_counts[tid]
        pct = (count / len(rows)) * 100
        print(f"  {tid}: {count} concepts ({pct:.1f}%)")

    return rows

if __name__ == '__main__':
    input_file = 'concepts-dependencies.csv'
    output_file = 'concepts-with-taxonomy.csv'

    add_taxonomy_to_csv(input_file, output_file)
