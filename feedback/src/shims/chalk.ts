// Browser-safe chalk stub — page-agent uses chalk for Node.js terminal colors
// which are meaningless in browser context. This noop shim saves ~5KB.
const identity = (s: string) => s;
const handler: ProxyHandler<typeof identity> = {
  get: () => new Proxy(identity, handler)
};
export default new Proxy(identity, handler);
