import type { RouterContext } from "./types";

/**
 * Create a new router context.
 */
export function createRouter<T = unknown>(): RouterContext<T> {
  const ctx: RouterContext<T> = {
    root: { key: "" },
    static: Object.create(null),
  };
  return ctx;
}
