import type { Node, RouteData } from "../src/types";
import { createRouter as _createRouter, addRoute } from "../src";

export function createRouter(routes: string[] | Record<string, RouteData>) {
  const router = _createRouter();
  if (Array.isArray(routes)) {
    for (const route of routes) {
      addRoute(router, route, { path: route });
    }
  } else {
    for (const [route, data] of Object.entries(routes)) {
      addRoute(router, route, data);
    }
  }
  return router;
}

export function formatTree(
  node: Node,
  depth = 0,
  result = [] as string[],
  prefix = "",
) {
  result.push(
    // prettier-ignore
    `${prefix}${depth === 0 ? "" : "├── "}${node.key ? `/${node.key}` : (depth === 0 ? "<root>" : "<?>")}${node.data === undefined ? "" : ` ┈> [${node.data.path || JSON.stringify(node.data)}]`}`,
  );

  const childrenArray = [
    ...Object.values(node.staticChildren || []),
    node.paramChild,
    node.wildcardChild,
  ].filter(Boolean) as Node[];
  for (const [index, child] of childrenArray.entries()) {
    const lastChild = index === childrenArray.length - 1;
    formatTree(
      child,
      depth + 1,
      result,
      (depth === 0 ? "" : prefix + (depth > 0 ? "│   " : "    ")) +
        (lastChild ? "    " : "    "),
    );
  }

  return depth === 0 ? result.join("\n") : result;
}
