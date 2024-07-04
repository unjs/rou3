import type { RouterContext, Node } from "../types";
import { _getParams, normalizeTrailingSlash, splitPath } from "./_utils";

/**
 * Find all route patterns that match the given path.
 */
export function matchAllRoutes<T>(ctx: RouterContext<T>, _path: string): T[] {
  const path = normalizeTrailingSlash(ctx, _path);
  return _matchAll(ctx, ctx.root, splitPath(path), 0) as T[];
}

function _matchAll<T>(
  ctx: RouterContext<T>,
  node: Node<T>,
  segments: string[],
  index: number,
): T[] {
  const matchedNodes: T[] = [];

  const segment = segments[index];

  // 1. Node self data
  if (index === segments.length && node.data !== undefined) {
    matchedNodes.unshift(node.data);
  }

  // 2. Static
  const staticChild = node.static?.[segment];
  if (staticChild) {
    matchedNodes.unshift(..._matchAll(ctx, staticChild, segments, index + 1));
  }

  // 3. Param
  if (node.param) {
    matchedNodes.unshift(..._matchAll(ctx, node.param, segments, index + 1));
  }

  // 4. Wildcard
  if (node.wildcard?.data) {
    matchedNodes.unshift(node.wildcard.data);
  }

  // No match
  return matchedNodes;
}
