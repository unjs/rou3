import type { RouterContext, Node } from "../types";
import { splitPath } from "./_utils";

/**
 * Find all route patterns that match the given path.
 */
export function matchAllRoutes<T>(
  ctx: RouterContext<T>,
  method: string = "",
  path: string,
): T[] {
  return _matchAll(ctx, ctx.root, method, splitPath(path), 0) as T[];
}

function _matchAll<T>(
  ctx: RouterContext<T>,
  node: Node<T>,
  method: string,
  segments: string[],
  index: number,
  matches: T[] = [],
): T[] {
  const segment = segments[index];

  // Wildcard
  if (node.wildcard && node.wildcard.methods) {
    const match = node.wildcard.methods[method] || node.wildcard.methods[""];
    if (match) {
      matches.push(match[0 /* data */]);
    }
  }

  // Param
  if (node.param) {
    _matchAll(ctx, node.param, method, segments, index + 1, matches);
    if (index === segments.length && node.param.methods) {
      const match = node.param.methods[method] || node.param.methods[""];
      if (match) {
        matches.push(match[0 /* data */]);
      }
    }
  }

  // Node self data (only if we reached the end of the path)
  if (index === segments.length && node.methods) {
    const match = node.methods[method] || node.methods[""];
    if (match) {
      matches.push(match[0 /* data */]);
    }
  }

  // Static
  const staticChild = node.static?.[segment];
  if (staticChild) {
    _matchAll(ctx, staticChild, method, segments, index + 1, matches);
  }

  return matches;
}
