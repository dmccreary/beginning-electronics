#!/usr/bin/env python3
"""
Convert learning graph CSV to vis.js network JSON format
"""

import csv
import json
from collections import defaultdict

def csv_to_json(csv_filename, json_filename):
    """Convert dependency CSV to vis.js JSON format"""

    # Read CSV and build graph structure
    nodes = set()
    edges = []
    node_dependencies = defaultdict(list)

    with open(csv_filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            concept = row['Concept'].strip()
            dependency = row['Dependency'].strip()

            nodes.add(concept)

            if dependency:  # If there is a dependency
                nodes.add(dependency)
                edges.append({
                    'from': dependency,
                    'to': concept
                })
                node_dependencies[concept].append(dependency)

    # Create nodes list with metadata
    nodes_list = []
    for i, node in enumerate(sorted(nodes)):
        node_obj = {
            'id': i + 1,
            'label': node,
            'title': node,  # Tooltip
            'level': calculate_level(node, node_dependencies)
        }
        nodes_list.append(node_obj)

    # Create node name to ID mapping
    node_to_id = {node['label']: node['id'] for node in nodes_list}

    # Convert edges to use IDs
    edges_list = []
    for edge in edges:
        edges_list.append({
            'from': node_to_id[edge['from']],
            'to': node_to_id[edge['to']],
            'arrows': 'to'
        })

    # Create final JSON structure
    graph_data = {
        'nodes': nodes_list,
        'edges': edges_list
    }

    # Write JSON file
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(graph_data, f, indent=2)

    print(f"Converted {len(nodes_list)} nodes and {len(edges_list)} edges")
    print(f"Output written to {json_filename}")

    return graph_data

def calculate_level(node, dependencies, visited=None):
    """Calculate depth level of node in dependency tree"""
    if visited is None:
        visited = set()

    # Detect cycles
    if node in visited:
        return 0

    visited.add(node)

    if node not in dependencies or not dependencies[node]:
        return 0

    levels = []
    for dep in dependencies[node]:
        levels.append(calculate_level(dep, dependencies, visited.copy()))

    return 1 + max(levels) if levels else 0

if __name__ == '__main__':
    csv_file = 'concepts-dependencies.csv'
    json_file = 'learning-graph.json'

    csv_to_json(csv_file, json_file)
