import { expandGroupDelimiters } from "../_group-delimiters.ts";
import type { RouterContext, Node } from "../types.ts";
import { encodeEscapes, expandModifiers, segmentKey, splitRoute } from "./_utils.ts";

/**
 * Remove a route from the router context.
 */
export function removeRoute<T>(ctx: RouterContext<T>, method: string = "", path: string): void {
  // Normalize exactly like `addRoute`, or removal targets a different route
  method = method.toUpperCase();
  if (path.charCodeAt(0) !== 47 /* '/' */) {
    path = `/${path}`;
  }

  const groupExpanded = expandGroupDelimiters(path);
  if (groupExpanded) {
    for (const expandedPath of groupExpanded) {
      removeRoute(ctx, method, expandedPath);
    }
    return;
  }

  path = encodeEscapes(path);

  const segments = splitRoute(path);

  const modExpanded = expandModifiers(segments);
  if (modExpanded) {
    for (const expandedPath of modExpanded) {
      removeRoute(ctx, method, expandedPath);
    }
    return;
  }

  _remove(ctx, ctx.root, method, segments, 0, "/" + segments.join("/"));
}

function _remove(
  ctx: RouterContext,
  node: Node,
  method: string,
  segments: string[],
  index: number,
  route: string,
): void /* should delete */ {
  if (index === segments.length) {
    const entries = node.methods?.[method];
    if (entries) {
      const idx = entries.findIndex((e) => e.route === route);
      if (idx !== -1) {
        entries.splice(idx, 1);
      }
      if (entries.length === 0) {
        delete node.methods![method];
        if (Object.keys(node.methods!).length === 0) {
          node.methods = undefined;
          _forgetStatic(ctx, node);
        }
      }
    }
    return;
  }

  const segment = segments[index];
  const key = segmentKey(segment);

  // Wildcard (terminal: `addRoute` stops at `**`, so skip any trailing segments)
  if (key === 2) {
    if (node.wildcard) {
      _remove(ctx, node.wildcard, method, segments, segments.length, route);
      if (_isEmptyNode(node.wildcard)) {
        node.wildcard = undefined;
      }
    }
    return;
  }

  // Param
  if (key === 1) {
    if (node.param) {
      _remove(ctx, node.param, method, segments, index + 1, route);
      if (_isEmptyNode(node.param)) {
        node.param = undefined;
      }
    }
    return;
  }

  // Static
  const childNode = node.static?.[key];
  if (childNode) {
    _remove(ctx, childNode, method, segments, index + 1, route);
    if (_isEmptyNode(childNode)) {
      delete node.static![key];
      if (Object.keys(node.static!).length === 0) {
        node.static = undefined;
      }
    }
  }
}

function _isEmptyNode(node: Node) {
  return (
    node.methods === undefined &&
    node.static === undefined &&
    node.param === undefined &&
    node.wildcard === undefined
  );
}

function _forgetStatic(ctx: RouterContext, node: Node): void {
  const staticMap = ctx.static;
  for (const key in staticMap) {
    if (staticMap[key] === node) {
      delete staticMap[key];
    }
  }
}
