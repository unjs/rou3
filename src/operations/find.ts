import type { RouterContext, MatchedRoute, Node, RouteData } from "../types";
import { _getParams, normalizeTrailingSlash, splitPath } from "./_utils";

/**
 * Find a route by path.
 */
export function findRoute<T extends RouteData = RouteData>(
  ctx: RouterContext<T>,
  _path: string,
  opts?: { ignoreParams?: boolean },
): MatchedRoute<T> | undefined {
  const path = normalizeTrailingSlash(ctx, _path);

  const staticNode = ctx.static[path];
  if (staticNode && staticNode.data !== undefined) {
    return { data: staticNode.data };
  }

  const segments = splitPath(path);

  const node = _find(ctx, ctx.root, segments, 0) as Node<T> | undefined;
  if (!node || node.data === undefined) {
    return;
  }

  const data = node.data;
  if (opts?.ignoreParams || (!node.paramNames && node.key !== "**")) {
    return { data };
  }

  const params = _getParams(segments, node);

  return {
    data,
    params,
  };
}

function _find(
  ctx: RouterContext,
  node: Node,
  segments: string[],
  index: number,
): Node | undefined {
  // End of path
  if (index === segments.length) {
    return node;
  }

  const segment = segments[index];

  // 1. Static
  const staticChild = node.static?.[segment];
  if (staticChild) {
    const matchedNode = _find(ctx, staticChild, segments, index + 1);
    if (matchedNode) {
      return matchedNode;
    }
  }

  // 2. Param
  if (node.param) {
    const nextNode = _find(ctx, node.param, segments, index + 1);
    if (nextNode) {
      return nextNode;
    }
  }

  // 3. Wildcard
  if (node.wildcard) {
    return node.wildcard;
  }

  // No match
  return;
}
