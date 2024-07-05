export const noop = () => undefined;

export class BaseRouter {
  constructor(routes, withParams = true) {
    this.routes = routes;
    this.withParams = withParams;
  }
}
