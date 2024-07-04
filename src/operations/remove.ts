import type { RouterContext, Node } from "../types";
import {
  _getParams,
  _isEmptyNode,
  normalizeTrailingSlash,
  splitPath,
} from "./_utils";

/**
 * Remove a route from the router context.
 */
export function removeRoute<T>(ctx: RouterContext<T>, _path: string) {
  const path = normalizeTrailingSlash(ctx, _path);

  const segments = splitPath(path);
  ctx.static[path] = undefined;
  return _remove(ctx.root, segments, 0);
}

function _remove(
  node: Node,
  segments: string[],
  index: number,
): void /* should delete */ {
  if (index === segments.length) {
    node.data = undefined;
    node.index = undefined;
    node.paramNames = undefined;
    return;
  }

  const segment = segments[index];

  // Param
  if (segment === "*") {
    if (node.param) {
      _remove(node.param, segments, index + 1);
      if (_isEmptyNode(node.param)) {
        node.param = undefined;
      }
    }
    return;
  }

  // Wildcard
  if (segment === "**") {
    if (node.wildcard) {
      _remove(node.wildcard, segments, index + 1);
      if (_isEmptyNode(node.wildcard)) {
        node.wildcard = undefined;
      }
    }
    return;
  }

  // Static
  const childNode = node.static?.[segment];
  if (childNode) {
    _remove(childNode, segments, index + 1);
    if (_isEmptyNode(childNode)) {
      delete node.static![segment];
      if (Object.keys(node.static!).length === 0) {
        node.static = undefined;
      }
    }
  }
}
