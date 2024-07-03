import type {
  RadixRouterContext,
  RadixNode,
  MatchedRoute,
  RadixRouter,
  RadixNodeData,
  RadixRouterOptions,
} from "./types";

export function createRouter<T extends RadixNodeData = RadixNodeData>(
  options: RadixRouterOptions = {},
): RadixRouter<T> {
  const ctx: RadixRouterContext<T> = {
    options,
    root: { key: "" },
    staticRoutesMap: {},
  };

  const normalizeTrailingSlash = (p: string) =>
    options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";

  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }

  return {
    ctx,
    lookup: (path: string) =>
      lookup(ctx, normalizeTrailingSlash(path)) as MatchedRoute<T> | undefined,
    insert: (path: string, data: any) =>
      insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path: string) => remove(ctx, normalizeTrailingSlash(path)),
  };
}

// --- tree operations ---

// --- Insert ---

function insert(ctx: RadixRouterContext, path: string, data: any) {
  const segments = _splitPath(path);

  let node = ctx.root;

  let _unnamedParamIndex = 0;

  const nodeParams: RadixNode["paramNames"] = [];

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
            : (_getParamMatcher(segment) as string),
      });
      continue;
    }

    // Static
    const child = node.staticChildren?.get(segment);
    if (child) {
      node = child;
    } else {
      const staticNode = { key: segment };
      if (!node.staticChildren) {
        node.staticChildren = new Map();
      }
      node.staticChildren.set(segment, staticNode);
      node = staticNode;
    }
  }

  // Assign data and params to the final node
  node.index = segments.length - 1;
  node.data = data;
  if (nodeParams.length > 0) {
    node.paramNames = nodeParams;
  }
}

// --- Lookup ---

function lookup(
  ctx: RadixRouterContext,
  path: string,
): MatchedRoute | undefined {
  const segments = _splitPath(path);
  const matchedNode = _lookup(ctx, ctx.root, segments, 0);
  if (!matchedNode) {
    return;
  }
  const data = matchedNode.data;
  if (!matchedNode.paramNames && matchedNode.key !== "**") {
    return data;
  }
  const params = _getParams(segments, matchedNode);
  if (matchedNode.key === "**") {
    const paramName =
      (matchedNode.paramNames?.[matchedNode.paramNames.length - 1]
        .name as string) || "_";
    params[paramName] = segments.slice(matchedNode.index).join("/");
  }
  return { ...data, params };
}

function _lookup(
  ctx: RadixRouterContext,
  node: RadixNode,
  segments: string[],
  index: number,
): RadixNode | undefined {
  // End of path
  if (index === segments.length) {
    return node;
  }

  const segment = segments[index];

  // 1. Static
  const staticChild = node.staticChildren?.get(segment);
  if (staticChild) {
    const matchedNode = _lookup(ctx, staticChild, segments, index + 1);
    if (matchedNode) {
      return matchedNode;
    }
  }

  // 2. Param
  if (node.paramChild) {
    const nextNode = _lookup(ctx, node.paramChild, segments, index + 1);
    if (nextNode) {
      return nextNode;
    }
  }

  // 3. Wildcard
  if (node.wildcardChild) {
    return node.wildcardChild;
  }

  // No match
  return;
}

// --- Remove ---

function remove(ctx: RadixRouterContext, path: string) {
  const segments = _splitPath(path);
  return _remove(ctx.root, segments, 0);
}

function _remove(node: RadixNode, segments: string[], index: number): boolean {
  if (index === segments.length) {
    if (node.data === undefined) {
      return false;
    }
    node.data = undefined;
    return !(
      node.staticChildren?.size ||
      node.paramChild ||
      node.wildcardChild
    );
  }

  const segment = segments[index];

  // Param
  if (segment === "*") {
    if (!node.paramChild) {
      return false;
    }
    const shouldDelete = _remove(node.paramChild, segments, index + 1);
    if (shouldDelete) {
      node.paramChild = undefined;
      return (
        node.staticChildren?.size === 0 && node.wildcardChild === undefined
      );
    }
    return false;
  }

  // Wildcard
  if (segment === "**") {
    if (!node.wildcardChild) {
      return false;
    }
    const shouldDelete = _remove(node.wildcardChild, segments, index + 1);
    if (shouldDelete) {
      node.wildcardChild = undefined;
      return node.staticChildren?.size === 0 && node.paramChild === undefined;
    }
    return false;
  }

  // Static
  const childNode = node.staticChildren?.get(segment);
  if (!childNode) {
    return false;
  }
  const shouldDelete = _remove(childNode, segments, index + 1);
  if (shouldDelete) {
    node.staticChildren?.delete(segment);
    return node.staticChildren?.size === 0 && node.data === undefined;
  }

  return false;
}

// --- shared utils ---

function _splitPath(path: string) {
  return path.split("/").filter(Boolean);
}

function _getParamMatcher(segment: string): string | RegExp {
  const PARAMS_RE = /:\w+|[^:]+/g;
  const params = [...segment.matchAll(PARAMS_RE)];
  if (params.length === 1) {
    return params[0][0].slice(1);
  }
  const sectionRegexString = segment.replace(
    /:(\w+)/g,
    (_, id) => `(?<${id}>\\w+)`,
  );
  console.log(segment);
  return new RegExp(`^${sectionRegexString}$`);
}

function _getParams(
  segments: string[],
  node: RadixNode,
): Record<string, string> {
  const res = Object.create(null);
  for (const param of node.paramNames || []) {
    const segment = segments[param.index];
    if (typeof param.name === "string") {
      res[param.name] = segment;
    } else {
      const match = segment.match(param.name);
      if (match) {
        for (const key in match.groups) {
          res[key] = match.groups[key];
        }
      }
    }
  }
  return res;
}
