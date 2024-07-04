import type { RouterContext, Node, RouteData } from "../types";
import { _getParams, normalizeTrailingSlash, splitPath } from "./_utils";

/**
 * Find all route patterns that match the given path.
 */
export function matchAllRoutes<T extends RouteData = RouteData>(
  ctx: RouterContext<T>,
  _path: string,
): RouteData<T>[] {
  const path = normalizeTrailingSlash(ctx, _path);
  return _matchAll(ctx, ctx.root, splitPath(path), 0) as RouteData<T>[];
}

function _matchAll(
  ctx: RouterContext,
  node: Node,
  segments: string[],
  index: number,
): RouteData[] {
  const matchedNodes: RouteData[] = [];

  const segment = segments[index];

  // 1. Node self data
  if (index === segments.length && node.data !== undefined) {
    matchedNodes.unshift(node.data);
  }

  // 2. Static
  const staticChild = node.staticChildren?.[segment];
  if (staticChild) {
    matchedNodes.unshift(..._matchAll(ctx, staticChild, segments, index + 1));
  }

  // 3. Param
  if (node.paramChild) {
    matchedNodes.unshift(
      ..._matchAll(ctx, node.paramChild, segments, index + 1),
    );
  }

  // 4. Wildcard
  if (node.wildcardChild?.data) {
    matchedNodes.unshift(node.wildcardChild.data);
  }

  // No match
  return matchedNodes;
}
