import type { RouterContext, Node } from "../types";
import { normalizeTrailingSlash, splitPath } from "./_utils";

/**
 * Find all route patterns that match the given path.
 */
export function matchAllRoutes<T>(
  ctx: RouterContext<T>,
  path: string,
  method?: string,
): T[] {
  const _path = normalizeTrailingSlash(ctx, path);
  return _matchAll(ctx, ctx.root, method || "", splitPath(_path), 0) as T[];
}

function _matchAll<T>(
  ctx: RouterContext<T>,
  node: Node<T>,
  method: string,
  segments: string[],
  index: number,
): T[] {
  const matchedNodes: T[] = [];

  const segment = segments[index];

  // 1. Node self data
  if (index === segments.length && node.methods) {
    const match = node.methods[method] || node.methods[""];
    if (match) {
      matchedNodes.unshift(match[0 /* data */]);
    }
  }

  // 2. Static
  const staticChild = node.static?.[segment];
  if (staticChild) {
    matchedNodes.unshift(
      ..._matchAll(ctx, staticChild, method, segments, index + 1),
    );
  }

  // 3. Param
  if (node.param) {
    matchedNodes.unshift(
      ..._matchAll(ctx, node.param, method, segments, index + 1),
    );
  }

  // 4. Wildcard
  if (node.wildcard && node.wildcard.methods) {
    const match = node.wildcard.methods[method] || node.wildcard.methods[""];
    if (match) {
      matchedNodes.unshift(match[0 /* data */]);
    }
  }

  // No match
  return matchedNodes;
}
