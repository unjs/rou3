import type { RouterContext } from "./types";

const RouterStaticMap = /* @__PURE__ */ (() => {
  const C = function () {};
  C.prototype = Object.create(null);
  return C;
})() as unknown as { new (): Record<string, any> };

/**
 * Create a new router context.
 */
export function createRouter<T = unknown>(): RouterContext<T> {
  const ctx: RouterContext<T> = {
    root: { key: "" },
    static: new RouterStaticMap(),
  };
  return ctx;
}
