#!/usr/bin/env python3
"""
Analyze learning graph for quality metrics
"""

import csv
import json
from collections import defaultdict, deque

def analyze_graph(csv_filename):
    """Analyze graph quality and generate report"""

    # Read CSV and build graph structure
    graph = defaultdict(list)  # adjacency list: node -> [dependencies]
    reverse_graph = defaultdict(list)  # reverse: dependency -> [nodes that depend on it]
    all_nodes = set()
    edges = []

    with open(csv_filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            concept = row['Concept'].strip()
            dependency = row['Dependency'].strip()

            all_nodes.add(concept)

            if dependency:
                all_nodes.add(dependency)
                graph[concept].append(dependency)
                reverse_graph[dependency].append(concept)
                edges.append((dependency, concept))

    # Analysis metrics
    total_nodes = len(all_nodes)
    total_edges = len(edges)

    # 1. Find root nodes (no dependencies)
    root_nodes = [node for node in all_nodes if not graph[node]]

    # 2. Find leaf nodes (nothing depends on them)
    leaf_nodes = [node for node in all_nodes if not reverse_graph[node]]

    # 3. Find orphaned nodes (no incoming or outgoing edges)
    orphaned = [node for node in all_nodes if not graph[node] and not reverse_graph[node]]

    # 4. Calculate in-degree and out-degree
    indegree = defaultdict(int)
    outdegree = defaultdict(int)

    for node in all_nodes:
        outdegree[node] = len(graph[node])
        indegree[node] = len(reverse_graph[node])

    # 5. Find cycles using DFS
    cycles = find_cycles(graph, all_nodes)

    # 6. Find disconnected components
    components = find_connected_components(graph, reverse_graph, all_nodes)

    # 7. Calculate depth distribution
    depths = calculate_depths(graph, all_nodes)

    # Generate report
    report = generate_report(
        total_nodes, total_edges, root_nodes, leaf_nodes,
        orphaned, indegree, outdegree, cycles, components, depths
    )

    return report

def find_cycles(graph, nodes):
    """Detect cycles using DFS"""
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in nodes}
    cycles = []

    def dfs(node, path):
        if color[node] == BLACK:
            return
        if color[node] == GRAY:
            # Found a cycle
            cycle_start = path.index(node)
            cycles.append(path[cycle_start:] + [node])
            return

        color[node] = GRAY
        for neighbor in graph[node]:
            dfs(neighbor, path + [node])
        color[node] = BLACK

    for node in nodes:
        if color[node] == WHITE:
            dfs(node, [])

    return cycles

def find_connected_components(graph, reverse_graph, nodes):
    """Find weakly connected components"""
    visited = set()
    components = []

    # Build undirected graph
    undirected = defaultdict(set)
    for node in nodes:
        for dep in graph[node]:
            undirected[node].add(dep)
            undirected[dep].add(node)
        for dependent in reverse_graph[node]:
            undirected[node].add(dependent)
            undirected[dependent].add(node)

    def bfs(start):
        component = set()
        queue = deque([start])
        visited.add(start)
        component.add(start)

        while queue:
            node = queue.popleft()
            for neighbor in undirected[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    component.add(neighbor)
                    queue.append(neighbor)

        return component

    for node in nodes:
        if node not in visited:
            component = bfs(node)
            components.append(component)

    return components

def calculate_depths(graph, nodes):
    """Calculate depth of each node (longest path from root)"""
    depths = {}

    def get_depth(node, visited):
        if node in visited:
            return 0
        if node in depths:
            return depths[node]

        visited.add(node)
        if not graph[node]:
            depths[node] = 0
        else:
            depths[node] = 1 + max(get_depth(dep, visited.copy()) for dep in graph[node])

        return depths[node]

    for node in nodes:
        get_depth(node, set())

    return depths

def generate_report(total_nodes, total_edges, root_nodes, leaf_nodes,
                   orphaned, indegree, outdegree, cycles, components, depths):
    """Generate comprehensive analysis report"""

    report = []
    report.append("# Learning Graph Quality Analysis Report\n")
    report.append("## Graph Statistics\n")
    report.append(f"- **Total Nodes**: {total_nodes}")
    report.append(f"- **Total Edges**: {total_edges}")
    report.append(f"- **Average Edges per Node**: {total_edges / total_nodes:.2f}")
    report.append(f"- **Root Nodes** (no dependencies): {len(root_nodes)}")
    report.append(f"- **Leaf Nodes** (no dependents): {len(leaf_nodes)}")
    report.append(f"- **Orphaned Nodes** (isolated): {len(orphaned)}\n")

    # Root nodes
    report.append("## Root Nodes (Foundation Concepts)\n")
    if root_nodes:
        for node in sorted(root_nodes)[:20]:  # Show first 20
            report.append(f"- {node}")
        if len(root_nodes) > 20:
            report.append(f"- ... and {len(root_nodes) - 20} more\n")
    else:
        report.append("No root nodes found.\n")

    # Orphaned nodes
    report.append("## Orphaned Nodes\n")
    if orphaned:
        for node in sorted(orphaned):
            report.append(f"- {node}")
        report.append("")
    else:
        report.append("No orphaned nodes. ✓\n")

    # Cycles
    report.append("## Cycles Detected\n")
    if cycles:
        report.append(f"**WARNING**: Found {len(cycles)} cycle(s) in the graph!\n")
        for i, cycle in enumerate(cycles[:5], 1):  # Show first 5
            report.append(f"### Cycle {i}")
            report.append(" → ".join(cycle))
            report.append("")
    else:
        report.append("No cycles detected. Graph is a valid DAG. ✓\n")

    # Connected components
    report.append("## Connected Components\n")
    report.append(f"- **Number of Components**: {len(components)}")
    if len(components) > 1:
        report.append("\n**WARNING**: Graph has disconnected components!\n")
        for i, comp in enumerate(sorted(components, key=len, reverse=True), 1):
            report.append(f"### Component {i} ({len(comp)} nodes)")
            if len(comp) <= 10:
                for node in sorted(comp):
                    report.append(f"- {node}")
            else:
                report.append(f"Large component with {len(comp)} nodes")
            report.append("")
    else:
        report.append("\nGraph is fully connected. ✓\n")

    # Degree distribution
    report.append("## In-Degree Distribution\n")
    indegree_dist = defaultdict(int)
    for deg in indegree.values():
        indegree_dist[deg] += 1

    report.append("| In-Degree | Node Count |")
    report.append("|-----------|------------|")
    for deg in sorted(indegree_dist.keys()):
        report.append(f"| {deg} | {indegree_dist[deg]} |")
    report.append("")

    # Nodes with highest in-degree
    report.append("## Most Depended-Upon Concepts (High In-Degree)\n")
    top_indegree = sorted(indegree.items(), key=lambda x: x[1], reverse=True)[:15]
    report.append("| Concept | Dependents |")
    report.append("|---------|------------|")
    for node, deg in top_indegree:
        report.append(f"| {node} | {deg} |")
    report.append("")

    # Depth distribution
    report.append("## Depth Distribution\n")
    depth_dist = defaultdict(int)
    for depth in depths.values():
        depth_dist[depth] += 1

    report.append("| Depth | Node Count |")
    report.append("|-------|------------|")
    for depth in sorted(depth_dist.keys()):
        report.append(f"| {depth} | {depth_dist[depth]} |")
    report.append("")

    max_depth = max(depths.values()) if depths else 0
    report.append(f"**Maximum Depth**: {max_depth}\n")

    # Overall assessment
    report.append("## Overall Assessment\n")
    issues = []
    if cycles:
        issues.append(f"- ⚠️ **CRITICAL**: {len(cycles)} cycle(s) detected - DAG requirement violated")
    if orphaned:
        issues.append(f"- ⚠️ {len(orphaned)} orphaned node(s) - should be connected to graph")
    if len(components) > 1:
        issues.append(f"- ⚠️ {len(components)} disconnected component(s) - should be single connected graph")

    if issues:
        report.append("### Issues Found\n")
        report.extend(issues)
        report.append("")
    else:
        report.append("✓ **PASS**: Graph is a valid, connected DAG with no orphaned nodes.\n")

    return "\n".join(report)

if __name__ == '__main__':
    csv_file = 'concepts-dependencies.csv'
    output_file = 'step-04-quality-analysis.md'

    report = analyze_graph(csv_file)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"Analysis complete. Report written to {output_file}")
    print("\n" + "="*60)
    print(report)
