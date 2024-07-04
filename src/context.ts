import type { RouterContext, RouterOptions } from "./types";

/**
 * Create a new router context.
 */
export function createRouter<T = unknown>(
  options: RouterOptions = {},
): RouterContext<T> {
  const ctx: RouterContext<T> = {
    options,
    root: { key: "" },
    static: Object.create(null),
  };
  return ctx;
}
