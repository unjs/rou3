import type { RouterContext, RouteData, RouterOptions } from "./types";

/**
 * Create a new router context.
 */
export function createRouter<T extends RouteData = RouteData>(
  options: RouterOptions = {},
): RouterContext<T> {
  const ctx: RouterContext<T> = {
    options,
    root: { key: "" },
    static: Object.create(null),
  };
  return ctx;
}
