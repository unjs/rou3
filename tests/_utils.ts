import type { Node, RouterContext } from "../src/types";
import { createRouter as _createRouter, addRoute } from "../src";

export function createRouter<
  T extends Record<string, string> = Record<string, string>,
>(routes: string[] | Record<string, T>): RouterContext<T> {
  const router = _createRouter<T>();
  if (Array.isArray(routes)) {
    for (const route of routes) {
      addRoute(router, route, "", { path: route } as unknown as T);
    }
  } else {
    for (const [route, data] of Object.entries(routes)) {
      addRoute(router, route, "", data);
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
    `${prefix}${depth === 0 ? "" : "├── "}${node.key ? `/${node.key}` : (depth === 0 ? "<root>" : "<?>")}${_formatMethods(node)}`,
  );

  const childrenArray = [
    ...Object.values(node.static || []),
    node.param,
    node.wildcard,
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

function _formatMethods(node: Node) {
  if (!node.methods) {
    return "";
  }
  return ` ┈> [${Object.entries(node.methods)
    // @ts-expect-error
    .map(([method, [data, _params]]) => {
      const val = (data as any)?.path || JSON.stringify(data);
      return method ? `[${method}]: ${val}` : val;
    })
    .join(", ")}]`;
}
