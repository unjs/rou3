import type { RouterContext } from "../types";

export function splitPath(path: string) {
  return path.split("/").filter(Boolean);
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
