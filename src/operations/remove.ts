import type { RouterContext, Node, RouteData } from "../types";
import {
  _getParams,
  _isEmptyNode,
  normalizeTrailingSlash,
  splitPath,
} from "./_utils";

/**
 * Remove a route from the router context.
 */
export function removeRoute<T extends RouteData = RouteData>(
  ctx: RouterContext<T>,
  _path: string,
) {
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
    if (node.paramChild) {
      _remove(node.paramChild, segments, index + 1);
      if (_isEmptyNode(node.paramChild)) {
        node.paramChild = undefined;
      }
    }
    return;
  }

  // Wildcard
  if (segment === "**") {
    if (node.wildcardChild) {
      _remove(node.wildcardChild, segments, index + 1);
      if (_isEmptyNode(node.wildcardChild)) {
        node.wildcardChild = undefined;
      }
    }
    return;
  }

  // Static
  const childNode = node.staticChildren?.[segment];
  if (childNode) {
    _remove(childNode, segments, index + 1);
    if (_isEmptyNode(childNode)) {
      delete node.staticChildren![segment];
      if (Object.keys(node.staticChildren!).length === 0) {
        node.staticChildren = undefined;
      }
    }
  }
}
