import type { RouterContext, MatchedRoute, Node, Params } from "../types";
import { normalizeTrailingSlash, splitPath } from "./_utils";

/**
 * Find a route by path.
 */
export function findRoute<T = unknown>(
  ctx: RouterContext<T>,
  path: string,
  method: string = "",
  opts?: { ignoreParams?: boolean },
): MatchedRoute<T> | undefined {
  const _path = normalizeTrailingSlash(ctx, path);

  // Static
  const staticNode = ctx.static[_path];
  if (staticNode && staticNode.methods) {
    const staticMatch = staticNode.methods[method] || staticNode.methods[""];
    if (staticMatch !== undefined) {
      return { data: staticMatch[0] };
    }
  }

  // Lookup tree
  const segments = splitPath(_path);
  const match = _lookupTree(ctx, ctx.root, method, segments, 0);
  if (match === undefined) {
    return;
  }

  const [data, paramNames] = match;
  if (opts?.ignoreParams || !paramNames) {
    return { data };
  }

  const params = _getParams(segments, paramNames);

  return {
    data,
    params,
  };
}

function _lookupTree<T>(
  ctx: RouterContext,
  node: Node<T>,
  method: string,
  segments: string[],
  index: number,
): [Data: T, Params?: Params] | undefined {
  // End of path
  if (index === segments.length) {
    if (!node.methods) {
      return undefined;
    }
    return node.methods[method] || node.methods[""];
  }

  const segment = segments[index];

  // 1. Static
  const staticChild = node.static?.[segment];
  if (staticChild) {
    const match = _lookupTree(ctx, staticChild, method, segments, index + 1);
    if (match) {
      return match;
    }
  }

  // 2. Param
  if (node.param) {
    const match = _lookupTree(ctx, node.param, method, segments, index + 1);
    if (match) {
      return match;
    }
  }

  // 3. Wildcard
  if (node.wildcard && node.wildcard.methods) {
    return node.wildcard.methods[method];
  }

  // No match
  return;
}

function _getParams(
  segments: string[],
  paramsNames: Params,
): MatchedRoute["params"] {
  const params = Object.create(null);
  for (const [index, name] of paramsNames) {
    const segment =
      index < 0 ? segments.slice(-1 * index).join("/") : segments[index];
    if (typeof name === "string") {
      params[name] = segment;
    } else {
      const match = segment.match(name);
      if (match) {
        for (const key in match.groups) {
          params[key] = match.groups[key];
        }
      }
    }
  }
  return params;
}
