#!/usr/bin/env python3
"""
Generate taxonomy distribution report
"""

import csv
from collections import defaultdict

def generate_distribution_report(csv_filename):
    """Generate detailed taxonomy distribution analysis"""

    # Read CSV
    concepts_by_taxonomy = defaultdict(list)
    total_concepts = 0

    with open(csv_filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        seen_concepts = set()

        for row in reader:
            concept = row['Concept'].strip()
            taxonomy_id = row['TaxonomyID'].strip()

            if concept not in seen_concepts:
                concepts_by_taxonomy[taxonomy_id].append(concept)
                seen_concepts.add(concept)
                total_concepts += 1

    # Generate report
    report = []
    report.append("# Step 7: Taxonomy Distribution Report\n")
    report.append(f"## Overview\n")
    report.append(f"Total unique concepts analyzed: {total_concepts}\n")

    # Taxonomy descriptions
    taxonomy_info = {
        'FUND': ('Fundamentals', 'Core electrical concepts and laws'),
        'PASS': ('Passive Components', 'Resistors, capacitors, diodes'),
        'ACT': ('Active Components', 'Transistors and integrated circuits'),
        'IO': ('Input/Output', 'Sensors, buttons, LEDs, motors'),
        'BREAD': ('Breadboarding', 'Prototyping and circuit construction'),
        'MEAS': ('Measurement', 'Testing, debugging, multimeter use'),
        'PWR': ('Power Systems', 'Power supplies, regulation, efficiency'),
        'DIG': ('Digital Logic', 'Boolean logic, gates, truth tables'),
        'ADV': ('Advanced Circuits', 'Complex projects and applications'),
    }

    # Summary table
    report.append("## Distribution Summary\n")
    report.append("| Taxonomy | Category | Count | Percentage | Status |")
    report.append("|----------|----------|-------|------------|--------|")

    sorted_taxonomies = sorted(concepts_by_taxonomy.keys())

    for taxonomy_id in sorted_taxonomies:
        concepts = concepts_by_taxonomy[taxonomy_id]
        count = len(concepts)
        percentage = (count / total_concepts) * 100

        # Get taxonomy info
        if taxonomy_id in taxonomy_info:
            name, description = taxonomy_info[taxonomy_id]
        else:
            name = taxonomy_id
            description = "Unknown"

        # Check if within balance (<30%)
        status = "✓" if percentage < 30 else "⚠️"

        report.append(f"| {taxonomy_id} | {name} | {count} | {percentage:.1f}% | {status} |")

    report.append("")

    # Detailed breakdown
    report.append("## Detailed Breakdown by Category\n")

    for taxonomy_id in sorted_taxonomies:
        concepts = sorted(concepts_by_taxonomy[taxonomy_id])
        count = len(concepts)
        percentage = (count / total_concepts) * 100

        if taxonomy_id in taxonomy_info:
            name, description = taxonomy_info[taxonomy_id]
        else:
            name = taxonomy_id
            description = "Unknown"

        report.append(f"### {taxonomy_id} - {name} ({count} concepts, {percentage:.1f}%)\n")
        report.append(f"*{description}*\n")

        # List concepts
        for i, concept in enumerate(concepts, 1):
            report.append(f"{i}. {concept}")

        report.append("")

    # Balance assessment
    report.append("## Balance Assessment\n")

    max_percentage = max((len(concepts) / total_concepts) * 100
                        for concepts in concepts_by_taxonomy.values())

    if max_percentage < 30:
        report.append(f"✓ **PASS**: All categories are below 30% threshold")
        report.append(f"  - Maximum category percentage: {max_percentage:.1f}%")
    else:
        report.append(f"⚠️ **WARNING**: Some categories exceed 30% threshold")
        report.append(f"  - Maximum category percentage: {max_percentage:.1f}%")

    report.append("")

    # Recommendations
    report.append("## Observations\n")

    # Find largest and smallest categories
    largest = max(concepts_by_taxonomy.items(), key=lambda x: len(x[1]))
    smallest = min(concepts_by_taxonomy.items(), key=lambda x: len(x[1]))

    largest_pct = (len(largest[1]) / total_concepts) * 100
    smallest_pct = (len(smallest[1]) / total_concepts) * 100

    report.append(f"- **Largest Category**: {largest[0]} with {len(largest[1])} concepts ({largest_pct:.1f}%)")
    report.append(f"- **Smallest Category**: {smallest[0]} with {len(smallest[1])} concepts ({smallest_pct:.1f}%)")

    # Calculate standard deviation
    import statistics
    percentages = [(len(concepts) / total_concepts) * 100
                   for concepts in concepts_by_taxonomy.values()]
    std_dev = statistics.stdev(percentages)

    report.append(f"- **Distribution Spread (Std Dev)**: {std_dev:.2f}%")

    if std_dev < 7:
        report.append("  - Distribution is well-balanced ✓")
    else:
        report.append("  - Distribution shows moderate variation")

    report.append("")

    return "\n".join(report)

if __name__ == '__main__':
    csv_file = 'concepts-with-taxonomy.csv'
    output_file = 'step-07-distribution-report.md'

    report = generate_distribution_report(csv_file)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"Distribution report written to {output_file}")
    print("\n" + "="*60)
    print(report)
