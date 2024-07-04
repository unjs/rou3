import type { Node, MatchedRoute, RouterContext } from "../types";

export function splitPath(path: string) {
  return path.split("/").filter(Boolean);
}

export function getParamMatcher(segment: string): string | RegExp {
  const PARAMS_RE = /:\w+|[^:]+/g;
  const params = [...segment.matchAll(PARAMS_RE)];
  if (params.length === 1) {
    return params[0][0].slice(1);
  }
  const sectionRegexString = segment.replace(
    /:(\w+)/g,
    (_, id) => `(?<${id}>\\w+)`,
  );
  return new RegExp(`^${sectionRegexString}$`);
}

export function _isEmptyNode(node: Node) {
  return (
    node.data === undefined &&
    node.staticChildren === undefined &&
    node.paramChild === undefined &&
    node.wildcardChild === undefined
  );
}

export function _getParams(
  segments: string[],
  node: Node,
): MatchedRoute["params"] {
  const params = Object.create(null);
  for (const param of node.paramNames || []) {
    const segment = segments[param.index];
    if (typeof param.name === "string") {
      params[param.name] = segment;
    } else {
      const match = segment.match(param.name);
      if (match) {
        for (const key in match.groups) {
          params[key] = match.groups[key];
        }
      }
    }
  }
  if (node.key === "**") {
    const paramName =
      (node.paramNames?.[node.paramNames.length - 1].name as string) || "_";
    params[paramName] = segments.slice(node.index).join("/");
  }
  return params;
}

export function normalizeTrailingSlash(ctx: RouterContext, path: string = "/") {
  if (!ctx.options.strictTrailingSlash) {
    return path;
  }
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}
