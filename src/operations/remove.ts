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

  _remove(ctx.root, method, segments, 0);
}

function _remove(
  node: Node,
  method: string,
  segments: string[],
  index: number,
): void /* should delete */ {
  if (index === segments.length) {
    if (node.methods && method in node.methods) {
      delete node.methods[method];
      if (Object.keys(node.methods).length === 0) {
        node.methods = undefined;
      }
    }
    return;
  }

  const segment = segments[index];
  const key = segmentKey(segment);

  // Wildcard (terminal: `addRoute` stops at `**`, so skip any trailing segments)
  if (key === 2) {
    if (node.wildcard) {
      _remove(node.wildcard, method, segments, segments.length);
      if (_isEmptyNode(node.wildcard)) {
        node.wildcard = undefined;
      }
    }
    return;
  }

  // Param
  if (key === 1) {
    if (node.param) {
      _remove(node.param, method, segments, index + 1);
      if (_isEmptyNode(node.param)) {
        node.param = undefined;
      }
    }
    return;
  }

  // Static
  const childNode = node.static?.[key];
  if (childNode) {
    _remove(childNode, method, segments, index + 1);
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
