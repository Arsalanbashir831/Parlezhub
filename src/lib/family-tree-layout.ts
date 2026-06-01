import { FamilyMember, FamilyRelationship } from '@/types/family-tree';

export interface NodePosition {
  x: number;
  y: number;
}

export type NodePositionsMap = Record<string, NodePosition>;

/**
 * Calculates 2D node coordinates for a Family Tree using a recursive subtree layout.
 *
 * Algorithm overview:
 * 1. Groups spouses into "clusters" (connected components via spouse edges).
 * 2. Computes each cluster's subtree width bottom-up — children's needs drive spacing.
 * 3. Lays out top-down: each cluster is centered above its children's total span.
 *
 * Key guarantees:
 * - Children are always directly below their parents (no crossing lines).
 * - Siblings from the same couple are placed adjacent to one another.
 * - Handles any number of spouses cleanly in a single horizontal row.
 * - Gracefully ignores circular relationships (e.g. a member who is both
 *   a spouse and a child of the same cluster due to inconsistent data).
 */
export function calculateNodePositions(
  nodes: FamilyMember[],
  edges: FamilyRelationship[],
  horizontalSpacing = 280,
  verticalSpacing = 200
): NodePositionsMap {
  if (nodes.length === 0) return {};

  // ─── 1. Build deduped relationship maps ──────────────────────────────────
  const spouseMap: Record<string, string[]> = {};
  const parentMap: Record<string, string[]> = {};

  nodes.forEach((n) => {
    spouseMap[n.id] = [];
    parentMap[n.id] = [];
  });

  edges.forEach((e) => {
    if (e.type === 'spouse') {
      if (spouseMap[e.from_id] && !spouseMap[e.from_id].includes(e.to_id)) {
        spouseMap[e.from_id].push(e.to_id);
      }
      if (spouseMap[e.to_id] && !spouseMap[e.to_id].includes(e.from_id)) {
        spouseMap[e.to_id].push(e.from_id);
      }
    } else if (e.type === 'parent') {
      // from_id = child, to_id = parent
      if (parentMap[e.from_id] && !parentMap[e.from_id].includes(e.to_id)) {
        parentMap[e.from_id].push(e.to_id);
      }
    }
  });

  // ─── 2. Find spouse clusters (BFS over spouse edges) ─────────────────────
  const visitedForClusters = new Set<string>();
  const clusterOf: Record<string, number> = {};
  const clusterMembers: string[][] = [];

  nodes.forEach((n) => {
    if (visitedForClusters.has(n.id)) return;
    const cluster: string[] = [];
    const queue = [n.id];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (visitedForClusters.has(curr)) continue;
      visitedForClusters.add(curr);
      cluster.push(curr);
      spouseMap[curr].forEach((sid) => {
        if (!visitedForClusters.has(sid)) queue.push(sid);
      });
    }
    const idx = clusterMembers.length;
    clusterMembers.push(cluster);
    cluster.forEach((id) => (clusterOf[id] = idx));
  });

  // ─── 3. Compute each cluster's children ──────────────────────────────────
  // IMPORTANT: Skip nodes that are in the SAME cluster as their parent.
  // This handles data where a member is simultaneously a spouse and a child
  // of the same hub (e.g. bad data from the backend), preventing infinite
  // recursion in the subtree-width calculation.
  const clusterChildren: string[][] = clusterMembers.map(() => []);

  nodes.forEach((n) => {
    const childCI = clusterOf[n.id];
    parentMap[n.id].forEach((pid) => {
      const parentCI = clusterOf[pid];
      if (
        parentCI !== undefined &&
        parentCI !== childCI && // ← key guard: exclude circular same-cluster refs
        !clusterChildren[parentCI].includes(n.id)
      ) {
        clusterChildren[parentCI].push(n.id);
      }
    });
  });

  // ─── 4. Subtree width (bottom-up, with cycle guard) ──────────────────────
  const subtreeWidthCache: Record<number, number> = {};
  const visitingWidth = new Set<number>();

  function getSubtreeWidth(ci: number): number {
    if (subtreeWidthCache[ci] !== undefined) return subtreeWidthCache[ci];
    if (visitingWidth.has(ci)) return 0; // cycle guard
    visitingWidth.add(ci);

    const selfWidth = Math.max(0, (clusterMembers[ci].length - 1) * horizontalSpacing);
    const childCIs = [...new Set(clusterChildren[ci].map((c) => clusterOf[c]))];
    const childrenTotalWidth =
      childCIs.reduce((sum, ci2) => sum + getSubtreeWidth(ci2), 0) +
      Math.max(0, childCIs.length - 1) * horizontalSpacing;

    visitingWidth.delete(ci);
    return (subtreeWidthCache[ci] = Math.max(selfWidth, childrenTotalWidth));
  }

  // ─── 5. Identify root clusters (no cluster is their parent) ──────────────
  const hasParentCluster = new Set<number>();
  clusterChildren.forEach((children, parentCI) => {
    children.forEach((childId) => {
      const childCI = clusterOf[childId];
      if (childCI !== parentCI) hasParentCluster.add(childCI);
    });
  });
  const rootClusterIdxs = clusterMembers
    .map((_, ci) => ci)
    .filter((ci) => !hasParentCluster.has(ci));

  // ─── 6. Recursive top-down layout ────────────────────────────────────────
  const positions: NodePositionsMap = {};
  const layoutVisited = new Set<number>();

  function layoutCluster(ci: number, centerX: number, y: number) {
    if (layoutVisited.has(ci)) return; // cycle guard
    layoutVisited.add(ci);

    const cluster = clusterMembers[ci];

    // Hub = member with the most spouses
    const hub = cluster.reduce(
      (best, id) => (spouseMap[id].length > spouseMap[best].length ? id : best),
      cluster[0]
    );
    const spouses = spouseMap[hub].filter((s) => cluster.includes(s));

    // Alternate spouses left / right from hub, closest pair first:
    // e.g. 3 spouses → [wife3, wife1, hub, wife2]
    const leftSpouses: string[] = [];
    const rightSpouses: string[] = [];
    spouses.forEach((s, i) => {
      if (i % 2 === 0) leftSpouses.unshift(s);
      else rightSpouses.push(s);
    });
    const ordered = [...leftSpouses, hub, ...rightSpouses];

    // Ensure all cluster members are included in ordered to prevent any unplaced nodes
    const missing = cluster.filter((id) => !ordered.includes(id));
    if (missing.length > 0) {
      ordered.push(...missing);
    }

    // Position cluster members centered on centerX
    const totalW = (ordered.length - 1) * horizontalSpacing;
    const startX = centerX - totalW / 2;
    ordered.forEach((id, i) => {
      positions[id] = { x: startX + i * horizontalSpacing, y };
    });

    // Layout children
    const children = clusterChildren[ci];
    if (children.length === 0) return;

    const childCIs = [...new Set(children.map((c) => clusterOf[c]))];

    // Sort child-clusters by their parents' average position in `ordered`.
    // This groups siblings with the same couple adjacent to one another,
    // and aligns each child roughly below their parents for clean connector lines.
    childCIs.sort((ci1, ci2) => {
      const getParentCenter = (childId: string): number => {
        const parentsHere = parentMap[childId].filter((p) => cluster.includes(p));
        if (parentsHere.length === 0) return ordered.length / 2;
        return (
          parentsHere.reduce((sum, p) => sum + ordered.indexOf(p), 0) /
          parentsHere.length
        );
      };
      // Use the representative child of each cluster (first member)
      return (
        getParentCenter(clusterMembers[ci1][0]) -
        getParentCenter(clusterMembers[ci2][0])
      );
    });

    const childrenTotalWidth =
      childCIs.reduce((sum, ci2) => sum + getSubtreeWidth(ci2), 0) +
      Math.max(0, childCIs.length - 1) * horizontalSpacing;

    let childX = centerX - childrenTotalWidth / 2;
    const childY = y + verticalSpacing;

    childCIs.forEach((ci2) => {
      const w = getSubtreeWidth(ci2);
      layoutCluster(ci2, childX + w / 2, childY);
      childX += w + horizontalSpacing;
    });
  }

  // Layout all root clusters side-by-side
  const rootTotalWidth =
    rootClusterIdxs.reduce((sum, ci) => sum + getSubtreeWidth(ci), 0) +
    Math.max(0, rootClusterIdxs.length - 1) * horizontalSpacing;

  let rootX = -rootTotalWidth / 2;
  rootClusterIdxs.forEach((ci) => {
    const w = getSubtreeWidth(ci);
    layoutCluster(ci, rootX + w / 2, 0);
    rootX += w + horizontalSpacing;
  });

  // Fallback for cycles/unvisited clusters: if there are any clusters that were not laid out,
  // lay them out side-by-side to ensure they are visible in the UI.
  const unvisitedCIs = clusterMembers
    .map((_, ci) => ci)
    .filter((ci) => !layoutVisited.has(ci));

  if (unvisitedCIs.length > 0) {
    const unvisitedTotalWidth =
      unvisitedCIs.reduce((sum, ci) => sum + getSubtreeWidth(ci), 0) +
      Math.max(0, unvisitedCIs.length - 1) * horizontalSpacing;

    let fallbackX = rootClusterIdxs.length > 0 ? rootX + horizontalSpacing : -unvisitedTotalWidth / 2;
    unvisitedCIs.forEach((ci) => {
      if (layoutVisited.has(ci)) return;
      const w = getSubtreeWidth(ci);
      layoutCluster(ci, fallbackX + w / 2, 0);
      fallbackX += w + horizontalSpacing;
    });
  }

  return positions;
}
