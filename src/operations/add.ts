import type { RouterContext, ParamsIndexMap } from "../types";
import { splitPath } from "./_utils";

const NodeStaticMap = /* @__PURE__ */ (() => {
  const C = function () {};
  C.prototype = Object.create(null);
  return C;
})() as unknown as { new (): Record<string, any> };

const NodeMethodsMap = /* @__PURE__ */ (() => {
  const C = function () {};
  C.prototype = Object.create(null);
  return C;
})() as unknown as { new (): Record<string, any> };

/**
 * Add a route to the router context.
 */
export function addRoute<T>(
  ctx: RouterContext<T>,
  method: string = "",
  path: string,
  data?: T,
) {
  const segments = splitPath(path);

  let node = ctx.root;

  let _unnamedParamIndex = 0;

  const paramsMap: ParamsIndexMap = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    // Wildcard
    if (segment.startsWith("**")) {
      if (!node.wildcard) {
        node.wildcard = { key: "**" };
      }
      node = node.wildcard;
      paramsMap.push([-i, segment.split(":")[1] || "_"]);
      break;
    }

    // Param
    if (segment === "*" || segment.includes(":")) {
      if (!node.param) {
        node.param = { key: "*" };
      }
      node = node.param;
      paramsMap.push([
        i,
        segment === "*"
          ? `_${_unnamedParamIndex++}`
          : (_getParamMatcher(segment) as string),
      ]);
      continue;
    }

    // Static
    const child = node.static?.[segment];
    if (child) {
      node = child;
    } else {
      const staticNode = { key: segment };
      if (!node.static) {
        node.static = new NodeStaticMap();
      }
      node.static![segment] = staticNode;
      node = staticNode;
    }
  }

  // Assign index, params and data to the node
  const hasParams = paramsMap.length > 0;
  if (!node.methods) {
    node.methods = new NodeMethodsMap();
  }
  if (!node.methods![method]) {
    node.methods![method] = [];
  }
  node.methods![method].push({
    data: data || (null as T),
    paramsMap: hasParams ? paramsMap : undefined,
  });

  // Static
  if (!hasParams) {
    ctx.static[path] = node;
  }
}

function _getParamMatcher(segment: string): string | RegExp {
  if (!segment.includes(":", 1)) {
    // Single param
    return segment.slice(1);
  }
  const regex = segment.replace(/:(\w+)/g, (_, id) => `(?<${id}>\\w+)`);
  return new RegExp(`^${regex}$`);
}
