import type { RouterContext, Node, RouteData } from "../types";
import { getParamMatcher, normalizeTrailingSlash, splitPath } from "./_utils";

/**
 * Add a route to the router context.
 */
export function addRoute<T extends RouteData = RouteData>(
  ctx: RouterContext<T>,
  _path: string,
  data: T,
) {
  const path = normalizeTrailingSlash(ctx, _path);
  const segments = splitPath(path);

  let node = ctx.root;

  let _unnamedParamIndex = 0;

  const nodeParams: Node["paramNames"] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    // Wildcard
    if (segment.startsWith("**")) {
      if (!node.wildcard) {
        node.wildcard = { key: "**" };
      }
      node = node.wildcard;
      nodeParams.push({
        index: i,
        name: segment.split(":")[1] || "_",
      });
      break;
    }

    // Param
    if (segment === "*" || segment.includes(":")) {
      if (!node.param) {
        node.param = { key: "*" };
      }
      node = node.param;
      nodeParams.push({
        index: i,
        name:
          segment === "*"
            ? `_${_unnamedParamIndex++}`
            : (getParamMatcher(segment) as string),
      });
      continue;
    }

    // Static
    const child = node.static?.[segment];
    if (child) {
      node = child;
    } else {
      const staticNode = { key: segment };
      if (!node.static) {
        node.static = Object.create(null);
      }
      node.static![segment] = staticNode;
      node = staticNode;
    }
  }

  // Assign data and params to the final node
  node.index = segments.length - 1;
  node.data = data;
  if (nodeParams.length > 0) {
    // Dynamic route
    node.paramNames = nodeParams;
  } else {
    // Static route
    ctx.static[path] = node;
  }
}
