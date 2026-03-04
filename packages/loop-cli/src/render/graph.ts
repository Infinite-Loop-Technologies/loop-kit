import type { WorkspaceGraph } from '@loop-kit/loop-kernel';

export function renderGraphSummary(graph: WorkspaceGraph): string {
    return `nodes=${graph.nodes.length} edges=${graph.edges.length}`;
}
