import type { RadixNode } from "../src";

export function formatTree(
  node: RadixNode,
  depth = 0,
  result = [] as string[],
  prefix = "",
) {
  result.push(
    // prettier-ignore
    `${prefix}${depth === 0 ? "" : "├── "}${node.key ? `/${node.key}` : (depth === 0 ? "<root>" : "<?>")}${node.data === undefined ? "" : ` ┈> [${node.data.path}]`}`,
  );

  const childrenArray = [
    ...(node.staticChildren?.values() || []),
    node.paramChild,
    node.wildcardChild,
  ].filter(Boolean) as RadixNode[];
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
