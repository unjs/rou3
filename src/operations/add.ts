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
      if (!node.wildcardChild) {
        node.wildcardChild = { key: "**" };
      }
      node = node.wildcardChild;
      nodeParams.push({
        index: i,
        name: segment.split(":")[1] || "_",
      });
      break;
    }

    // Param
    if (segment === "*" || segment.includes(":")) {
      if (!node.paramChild) {
        node.paramChild = { key: "*" };
      }
      node = node.paramChild;
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
    const child = node.staticChildren?.[segment];
    if (child) {
      node = child;
    } else {
      const staticNode = { key: segment };
      if (!node.staticChildren) {
        node.staticChildren = Object.create(null);
      }
      node.staticChildren![segment] = staticNode;
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
