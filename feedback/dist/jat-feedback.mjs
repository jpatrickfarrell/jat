var Il = Object.defineProperty;
var si = (e) => {
  throw TypeError(e);
};
var Ml = (e, t, n) => t in e ? Il(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var ye = (e, t, n) => Ml(e, typeof t != "symbol" ? t + "" : t, n), bo = (e, t, n) => t.has(e) || si("Cannot " + n);
var g = (e, t, n) => (bo(e, t, "read from private field"), n ? n.call(e) : t.get(e)), G = (e, t, n) => t.has(e) ? si("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), V = (e, t, n, r) => (bo(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), Ae = (e, t, n) => (bo(e, t, "access private method"), n);
var ji;
typeof window < "u" && ((ji = window.__svelte ?? (window.__svelte = {})).v ?? (ji.v = /* @__PURE__ */ new Set())).add("5");
const Ll = 1, Pl = 2, Oi = 4, Dl = 8, Ol = 16, ql = 1, Fl = 4, zl = 8, Bl = 16, Ul = 4, qi = 1, Hl = 2, Fo = "[", Js = "[!", zo = "]", Lr = {}, Ie = Symbol(), Fi = "http://www.w3.org/1999/xhtml", xo = !1;
var Bo = Array.isArray, Vl = Array.prototype.indexOf, Pr = Array.prototype.includes, Zs = Array.from, Os = Object.keys, qs = Object.defineProperty, nr = Object.getOwnPropertyDescriptor, Wl = Object.getOwnPropertyDescriptors, Yl = Object.prototype, Kl = Array.prototype, zi = Object.getPrototypeOf, oi = Object.isExtensible;
function Xl(e) {
  return typeof e == "function";
}
const Sr = () => {
};
function Gl(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Bi() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const Pe = 2, as = 4, Qs = 8, Ui = 1 << 24, Zt = 16, Dt = 32, Mn = 64, Hi = 128, Et = 512, Te = 1024, De = 2048, Pt = 4096, pt = 8192, vn = 16384, ur = 32768, ar = 65536, ii = 1 << 17, Vi = 1 << 18, dr = 1 << 19, Jl = 1 << 20, un = 1 << 25, lr = 65536, ko = 1 << 21, Uo = 1 << 22, Rn = 1 << 23, rr = Symbol("$state"), Wi = Symbol("legacy props"), Zl = Symbol(""), Yn = new class extends Error {
  constructor() {
    super(...arguments);
    ye(this, "name", "StaleReactionError");
    ye(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Ii, Mi;
const Ql = ((Mi = (Ii = globalThis.document) == null ? void 0 : Ii.contentType) == null ? void 0 : /* @__PURE__ */ Mi.includes("xml")) ?? !1, ms = 3, Ur = 8;
function Yi(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ec() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function tc(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function nc(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function rc() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function sc(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function oc() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ic() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function ac(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function lc() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function cc() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function fc() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function uc() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function eo(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function dc() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function vc() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let te = !1;
function dn(e) {
  te = e;
}
let ee;
function Ke(e) {
  if (e === null)
    throw eo(), Lr;
  return ee = e;
}
function bs() {
  return Ke(/* @__PURE__ */ Qt(ee));
}
function w(e) {
  if (te) {
    if (/* @__PURE__ */ Qt(ee) !== null)
      throw eo(), Lr;
    ee = e;
  }
}
function Fs(e = 1) {
  if (te) {
    for (var t = e, n = ee; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Qt(n);
    ee = n;
  }
}
function zs(e = !0) {
  for (var t = 0, n = ee; ; ) {
    if (n.nodeType === Ur) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === zo) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Fo || r === Js || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Qt(n)
    );
    e && n.remove(), n = s;
  }
}
function Ki(e) {
  if (!e || e.nodeType !== Ur)
    throw eo(), Lr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Xi(e) {
  return e === this.v;
}
function pc(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Gi(e) {
  return !pc(e, this.v);
}
let hc = !1, ot = null;
function Dr(e) {
  ot = e;
}
function hn(e, t = !1, n) {
  ot = {
    p: ot,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function gn(e) {
  var t = (
    /** @type {ComponentContext} */
    ot
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      xa(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, ot = t.p, e ?? /** @type {T} */
  {};
}
function Ji() {
  return !0;
}
let Kn = [];
function Zi() {
  var e = Kn;
  Kn = [], Gl(e);
}
function Mt(e) {
  if (Kn.length === 0 && !ns) {
    var t = Kn;
    queueMicrotask(() => {
      t === Kn && Zi();
    });
  }
  Kn.push(e);
}
function gc() {
  for (; Kn.length > 0; )
    Zi();
}
function Qi(e) {
  var t = oe;
  if (t === null)
    return re.f |= Rn, e;
  if ((t.f & ur) === 0 && (t.f & as) === 0)
    throw e;
  Or(e, t);
}
function Or(e, t) {
  for (; t !== null; ) {
    if ((t.f & Hi) !== 0) {
      if ((t.f & ur) === 0)
        throw e;
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    }
    t = t.parent;
  }
  throw e;
}
const mc = -7169;
function we(e, t) {
  e.f = e.f & mc | t;
}
function Ho(e) {
  (e.f & Et) !== 0 || e.deps === null ? we(e, Te) : we(e, Pt);
}
function ea(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Pe) === 0 || (t.f & lr) === 0 || (t.f ^= lr, ea(
        /** @type {Derived} */
        t.deps
      ));
}
function ta(e, t, n) {
  (e.f & De) !== 0 ? t.add(e) : (e.f & Pt) !== 0 && n.add(e), ea(e.deps), we(e, Te);
}
const Cs = /* @__PURE__ */ new Set();
let K = null, Bs = null, Me = null, nt = [], to = null, Eo = !1, ns = !1;
var Ar, Tr, Gn, Nr, ds, vs, Jn, sn, Rr, Jt, So, $o, na;
const ri = class ri {
  constructor() {
    G(this, Jt);
    ye(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    ye(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    ye(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    G(this, Ar, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    G(this, Tr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    G(this, Gn, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    G(this, Nr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    G(this, ds, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    G(this, vs, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    G(this, Jn, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    G(this, sn, /* @__PURE__ */ new Map());
    ye(this, "is_fork", !1);
    G(this, Rr, !1);
  }
  is_deferred() {
    return this.is_fork || g(this, Nr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    g(this, sn).has(t) || g(this, sn).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = g(this, sn).get(t);
    if (n) {
      g(this, sn).delete(t);
      for (var r of n.d)
        we(r, De), jt(r);
      for (r of n.m)
        we(r, Pt), jt(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    nt = [], this.apply();
    var n = [], r = [];
    for (const o of t)
      Ae(this, Jt, So).call(this, o, n, r);
    if (this.is_deferred()) {
      Ae(this, Jt, $o).call(this, r), Ae(this, Jt, $o).call(this, n);
      for (const [o, i] of g(this, sn))
        ia(o, i);
    } else {
      for (const o of g(this, Ar)) o();
      g(this, Ar).clear(), g(this, Gn) === 0 && Ae(this, Jt, na).call(this), Bs = this, K = null, ai(r), ai(n), Bs = null, (s = g(this, ds)) == null || s.resolve();
    }
    Me = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== Ie && !this.previous.has(t) && this.previous.set(t, n), (t.f & Rn) === 0 && (this.current.set(t, t.v), Me == null || Me.set(t, t.v));
  }
  activate() {
    K = this, this.apply();
  }
  deactivate() {
    K === this && (K = null, Me = null);
  }
  flush() {
    if (this.activate(), nt.length > 0) {
      if (ra(), K !== null && K !== this)
        return;
    } else g(this, Gn) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of g(this, Tr)) t(this);
    g(this, Tr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    V(this, Gn, g(this, Gn) + 1), t && V(this, Nr, g(this, Nr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    V(this, Gn, g(this, Gn) - 1), t && V(this, Nr, g(this, Nr) - 1), !g(this, Rr) && (V(this, Rr, !0), Mt(() => {
      V(this, Rr, !1), this.is_deferred() ? nt.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of g(this, vs))
      g(this, Jn).delete(t), we(t, De), jt(t);
    for (const t of g(this, Jn))
      we(t, Pt), jt(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    g(this, Ar).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    g(this, Tr).add(t);
  }
  settled() {
    return (g(this, ds) ?? V(this, ds, Bi())).promise;
  }
  static ensure() {
    if (K === null) {
      const t = K = new ri();
      Cs.add(K), ns || Mt(() => {
        K === t && t.flush();
      });
    }
    return K;
  }
  apply() {
  }
};
Ar = new WeakMap(), Tr = new WeakMap(), Gn = new WeakMap(), Nr = new WeakMap(), ds = new WeakMap(), vs = new WeakMap(), Jn = new WeakMap(), sn = new WeakMap(), Rr = new WeakMap(), Jt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
So = function(t, n, r) {
  t.f ^= Te;
  for (var s = t.first, o = null; s !== null; ) {
    var i = s.f, l = (i & (Dt | Mn)) !== 0, c = l && (i & Te) !== 0, u = c || (i & pt) !== 0 || g(this, sn).has(s);
    if (!u && s.fn !== null) {
      l ? s.f ^= Te : o !== null && (i & (as | Qs | Ui)) !== 0 ? o.b.defer_effect(s) : (i & as) !== 0 ? n.push(s) : _s(s) && ((i & Zt) !== 0 && g(this, Jn).add(s), Fr(s));
      var f = s.first;
      if (f !== null) {
        s = f;
        continue;
      }
    }
    var d = s.parent;
    for (s = s.next; s === null && d !== null; )
      d === o && (o = null), s = d.next, d = d.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
$o = function(t) {
  for (var n = 0; n < t.length; n += 1)
    ta(t[n], g(this, vs), g(this, Jn));
}, na = function() {
  var s;
  if (Cs.size > 1) {
    this.previous.clear();
    var t = Me, n = !0;
    for (const o of Cs) {
      if (o === this) {
        n = !1;
        continue;
      }
      const i = [];
      for (const [c, u] of this.current) {
        if (o.current.has(c))
          if (n && u !== o.current.get(c))
            o.current.set(c, u);
          else
            continue;
        i.push(c);
      }
      if (i.length === 0)
        continue;
      const l = [...o.current.keys()].filter((c) => !this.current.has(c));
      if (l.length > 0) {
        var r = nt;
        nt = [];
        const c = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const f of i)
          sa(f, l, c, u);
        if (nt.length > 0) {
          K = o, o.apply();
          for (const f of nt)
            Ae(s = o, Jt, So).call(s, f, [], []);
          o.deactivate();
        }
        nt = r;
      }
    }
    K = null, Me = t;
  }
  this.committed = !0, Cs.delete(this);
};
let pn = ri;
function H(e) {
  var t = ns;
  ns = !0;
  try {
    for (var n; ; ) {
      if (gc(), nt.length === 0 && (K == null || K.flush(), nt.length === 0))
        return to = null, /** @type {T} */
        n;
      ra();
    }
  } finally {
    ns = t;
  }
}
function ra() {
  Eo = !0;
  var e = null;
  try {
    for (var t = 0; nt.length > 0; ) {
      var n = pn.ensure();
      if (t++ > 1e3) {
        var r, s;
        bc();
      }
      n.process(nt), jn.clear();
    }
  } finally {
    nt = [], Eo = !1, to = null;
  }
}
function bc() {
  try {
    oc();
  } catch (e) {
    Or(e, to);
  }
}
let Nt = null;
function ai(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (vn | pt)) === 0 && _s(r) && (Nt = /* @__PURE__ */ new Set(), Fr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ea(r), (Nt == null ? void 0 : Nt.size) > 0)) {
        jn.clear();
        for (const s of Nt) {
          if ((s.f & (vn | pt)) !== 0) continue;
          const o = [s];
          let i = s.parent;
          for (; i !== null; )
            Nt.has(i) && (Nt.delete(i), o.push(i)), i = i.parent;
          for (let l = o.length - 1; l >= 0; l--) {
            const c = o[l];
            (c.f & (vn | pt)) === 0 && Fr(c);
          }
        }
        Nt.clear();
      }
    }
    Nt = null;
  }
}
function sa(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const o = s.f;
      (o & Pe) !== 0 ? sa(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (o & (Uo | Zt)) !== 0 && (o & De) === 0 && oa(s, t, r) && (we(s, De), jt(
        /** @type {Effect} */
        s
      ));
    }
}
function oa(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (Pr.call(t, s))
        return !0;
      if ((s.f & Pe) !== 0 && oa(
        /** @type {Derived} */
        s,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          s,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function jt(e) {
  for (var t = to = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (Eo && t === oe && (n & Zt) !== 0 && (n & Vi) === 0)
      return;
    if ((n & (Mn | Dt)) !== 0) {
      if ((n & Te) === 0) return;
      t.f ^= Te;
    }
  }
  nt.push(t);
}
function ia(e, t) {
  if (!((e.f & Dt) !== 0 && (e.f & Te) !== 0)) {
    (e.f & De) !== 0 ? t.d.push(e) : (e.f & Pt) !== 0 && t.m.push(e), we(e, Te);
    for (var n = e.first; n !== null; )
      ia(n, t), n = n.next;
  }
}
function _c(e) {
  let t = 0, n = cr(0), r;
  return () => {
    Ko() && (a(n), oo(() => (t === 0 && (r = vr(() => e(() => rs(n)))), t += 1, () => {
      Mt(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, rs(n));
      });
    })));
  };
}
var yc = ar | dr | Hi;
function wc(e, t, n) {
  new xc(e, t, n);
}
var ct, ps, Ut, Zn, Ht, yt, tt, Vt, on, Nn, Qn, an, jr, er, Ir, Mr, ln, Xs, ke, aa, la, Co, Ns, Rs, Ao;
class xc {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    G(this, ke);
    /** @type {Boundary | null} */
    ye(this, "parent");
    ye(this, "is_pending", !1);
    /** @type {TemplateNode} */
    G(this, ct);
    /** @type {TemplateNode | null} */
    G(this, ps, te ? ee : null);
    /** @type {BoundaryProps} */
    G(this, Ut);
    /** @type {((anchor: Node) => void)} */
    G(this, Zn);
    /** @type {Effect} */
    G(this, Ht);
    /** @type {Effect | null} */
    G(this, yt, null);
    /** @type {Effect | null} */
    G(this, tt, null);
    /** @type {Effect | null} */
    G(this, Vt, null);
    /** @type {DocumentFragment | null} */
    G(this, on, null);
    /** @type {TemplateNode | null} */
    G(this, Nn, null);
    G(this, Qn, 0);
    G(this, an, 0);
    G(this, jr, !1);
    G(this, er, !1);
    /** @type {Set<Effect>} */
    G(this, Ir, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    G(this, Mr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    G(this, ln, null);
    G(this, Xs, _c(() => (V(this, ln, cr(g(this, Qn))), () => {
      V(this, ln, null);
    })));
    V(this, ct, t), V(this, Ut, n), V(this, Zn, r), this.parent = /** @type {Effect} */
    oe.b, this.is_pending = !!g(this, Ut).pending, V(this, Ht, io(() => {
      if (oe.b = this, te) {
        const o = g(this, ps);
        bs(), /** @type {Comment} */
        o.nodeType === Ur && /** @type {Comment} */
        o.data === Js ? Ae(this, ke, la).call(this) : (Ae(this, ke, aa).call(this), g(this, an) === 0 && (this.is_pending = !1));
      } else {
        var s = Ae(this, ke, Co).call(this);
        try {
          V(this, yt, xt(() => r(s)));
        } catch (o) {
          this.error(o);
        }
        g(this, an) > 0 ? Ae(this, ke, Rs).call(this) : this.is_pending = !1;
      }
      return () => {
        var o;
        (o = g(this, Nn)) == null || o.remove();
      };
    }, yc)), te && V(this, ct, ee);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ta(t, g(this, Ir), g(this, Mr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!g(this, Ut).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    Ae(this, ke, Ao).call(this, t), V(this, Qn, g(this, Qn) + t), !(!g(this, ln) || g(this, jr)) && (V(this, jr, !0), Mt(() => {
      V(this, jr, !1), g(this, ln) && qr(g(this, ln), g(this, Qn));
    }));
  }
  get_effect_pending() {
    return g(this, Xs).call(this), a(
      /** @type {Source<number>} */
      g(this, ln)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = g(this, Ut).onerror;
    let r = g(this, Ut).failed;
    if (g(this, er) || !n && !r)
      throw t;
    g(this, yt) && (Xe(g(this, yt)), V(this, yt, null)), g(this, tt) && (Xe(g(this, tt)), V(this, tt, null)), g(this, Vt) && (Xe(g(this, Vt)), V(this, Vt, null)), te && (Ke(
      /** @type {TemplateNode} */
      g(this, ps)
    ), Fs(), Ke(zs()));
    var s = !1, o = !1;
    const i = () => {
      if (s) {
        vc();
        return;
      }
      s = !0, o && uc(), pn.ensure(), V(this, Qn, 0), g(this, Vt) !== null && sr(g(this, Vt), () => {
        V(this, Vt, null);
      }), this.is_pending = this.has_pending_snippet(), V(this, yt, Ae(this, ke, Ns).call(this, () => (V(this, er, !1), xt(() => g(this, Zn).call(this, g(this, ct)))))), g(this, an) > 0 ? Ae(this, ke, Rs).call(this) : this.is_pending = !1;
    };
    Mt(() => {
      try {
        o = !0, n == null || n(t, i), o = !1;
      } catch (l) {
        Or(l, g(this, Ht) && g(this, Ht).parent);
      }
      r && V(this, Vt, Ae(this, ke, Ns).call(this, () => {
        pn.ensure(), V(this, er, !0);
        try {
          return xt(() => {
            r(
              g(this, ct),
              () => t,
              () => i
            );
          });
        } catch (l) {
          return Or(
            l,
            /** @type {Effect} */
            g(this, Ht).parent
          ), null;
        } finally {
          V(this, er, !1);
        }
      }));
    });
  }
}
ct = new WeakMap(), ps = new WeakMap(), Ut = new WeakMap(), Zn = new WeakMap(), Ht = new WeakMap(), yt = new WeakMap(), tt = new WeakMap(), Vt = new WeakMap(), on = new WeakMap(), Nn = new WeakMap(), Qn = new WeakMap(), an = new WeakMap(), jr = new WeakMap(), er = new WeakMap(), Ir = new WeakMap(), Mr = new WeakMap(), ln = new WeakMap(), Xs = new WeakMap(), ke = new WeakSet(), aa = function() {
  try {
    V(this, yt, xt(() => g(this, Zn).call(this, g(this, ct))));
  } catch (t) {
    this.error(t);
  }
}, la = function() {
  const t = g(this, Ut).pending;
  t && (V(this, tt, xt(() => t(g(this, ct)))), Mt(() => {
    var n = Ae(this, ke, Co).call(this);
    V(this, yt, Ae(this, ke, Ns).call(this, () => (pn.ensure(), xt(() => g(this, Zn).call(this, n))))), g(this, an) > 0 ? Ae(this, ke, Rs).call(this) : (sr(
      /** @type {Effect} */
      g(this, tt),
      () => {
        V(this, tt, null);
      }
    ), this.is_pending = !1);
  }));
}, Co = function() {
  var t = g(this, ct);
  return this.is_pending && (V(this, Nn, st()), g(this, ct).before(g(this, Nn)), t = g(this, Nn)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Ns = function(t) {
  var n = oe, r = re, s = ot;
  Xt(g(this, Ht)), $t(g(this, Ht)), Dr(g(this, Ht).ctx);
  try {
    return t();
  } catch (o) {
    return Qi(o), null;
  } finally {
    Xt(n), $t(r), Dr(s);
  }
}, Rs = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    g(this, Ut).pending
  );
  g(this, yt) !== null && (V(this, on, document.createDocumentFragment()), g(this, on).append(
    /** @type {TemplateNode} */
    g(this, Nn)
  ), Ca(g(this, yt), g(this, on))), g(this, tt) === null && V(this, tt, xt(() => t(g(this, ct))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Ao = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && Ae(n = this.parent, ke, Ao).call(n, t);
    return;
  }
  if (V(this, an, g(this, an) + t), g(this, an) === 0) {
    this.is_pending = !1;
    for (const r of g(this, Ir))
      we(r, De), jt(r);
    for (const r of g(this, Mr))
      we(r, Pt), jt(r);
    g(this, Ir).clear(), g(this, Mr).clear(), g(this, tt) && sr(g(this, tt), () => {
      V(this, tt, null);
    }), g(this, on) && (g(this, ct).before(g(this, on)), V(this, on, null));
  }
};
function kc(e, t, n, r) {
  const s = no;
  var o = e.filter((v) => !v.settled);
  if (n.length === 0 && o.length === 0) {
    r(t.map(s));
    return;
  }
  var i = K, l = (
    /** @type {Effect} */
    oe
  ), c = Ec(), u = o.length === 1 ? o[0].promise : o.length > 1 ? Promise.all(o.map((v) => v.promise)) : null;
  function f(v) {
    c();
    try {
      r(v);
    } catch (h) {
      (l.f & vn) === 0 && Or(h, l);
    }
    i == null || i.deactivate(), To();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(s)));
    return;
  }
  function d() {
    c(), Promise.all(n.map((v) => /* @__PURE__ */ Sc(v))).then((v) => f([...t.map(s), ...v])).catch((v) => Or(v, l));
  }
  u ? u.then(d) : d();
}
function Ec() {
  var e = oe, t = re, n = ot, r = K;
  return function(o = !0) {
    Xt(e), $t(t), Dr(n), o && (r == null || r.activate());
  };
}
function To() {
  Xt(null), $t(null), Dr(null);
}
// @__NO_SIDE_EFFECTS__
function no(e) {
  var t = Pe | De, n = re !== null && (re.f & Pe) !== 0 ? (
    /** @type {Derived} */
    re
  ) : null;
  return oe !== null && (oe.f |= dr), {
    ctx: ot,
    deps: null,
    effects: null,
    equals: Xi,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      Ie
    ),
    wv: 0,
    parent: n ?? oe,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Sc(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    oe
  );
  r === null && ec();
  var s = (
    /** @type {Boundary} */
    r.b
  ), o = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = cr(
    /** @type {V} */
    Ie
  ), l = !re, c = /* @__PURE__ */ new Map();
  return Lc(() => {
    var h;
    var u = Bi();
    o = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).then(() => {
        f === K && f.committed && f.deactivate(), To();
      });
    } catch (b) {
      u.reject(b), To();
    }
    var f = (
      /** @type {Batch} */
      K
    );
    if (l) {
      var d = s.is_rendered();
      s.update_pending_count(1), f.increment(d), (h = c.get(f)) == null || h.reject(Yn), c.delete(f), c.set(f, u);
    }
    const v = (b, _ = void 0) => {
      if (f.activate(), _)
        _ !== Yn && (i.f |= Rn, qr(i, _));
      else {
        (i.f & Rn) !== 0 && (i.f ^= Rn), qr(i, b);
        for (const [p, m] of c) {
          if (c.delete(p), p === f) break;
          m.reject(Yn);
        }
      }
      l && (s.update_pending_count(-1), f.decrement(d));
    };
    u.promise.then(v, (b) => v(null, b || "unknown"));
  }), Xo(() => {
    for (const u of c.values())
      u.reject(Yn);
  }), new Promise((u) => {
    function f(d) {
      function v() {
        d === o ? u(i) : f(o);
      }
      d.then(v, v);
    }
    f(o);
  });
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
  const t = /* @__PURE__ */ no(e);
  return Aa(t), t;
}
// @__NO_SIDE_EFFECTS__
function ca(e) {
  const t = /* @__PURE__ */ no(e);
  return t.equals = Gi, t;
}
function $c(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Xe(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Cc(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Pe) === 0)
      return (t.f & vn) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Vo(e) {
  var t, n = oe;
  Xt(Cc(e));
  try {
    e.f &= ~lr, $c(e), t = ja(e);
  } finally {
    Xt(n);
  }
  return t;
}
function fa(e) {
  var t = Vo(e);
  if (!e.equals(t) && (e.wv = Na(), (!(K != null && K.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    we(e, Te);
    return;
  }
  In || (Me !== null ? (Ko() || K != null && K.is_fork) && Me.set(e, t) : Ho(e));
}
function Ac(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(Yn), r.teardown = Sr, r.ac = null, ls(r, 0), Go(r));
}
function ua(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Fr(t);
}
let No = /* @__PURE__ */ new Set();
const jn = /* @__PURE__ */ new Map();
let da = !1;
function cr(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Xi,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
  const n = cr(e);
  return Aa(n), n;
}
// @__NO_SIDE_EFFECTS__
function va(e, t = !1, n = !0) {
  const r = cr(e);
  return t || (r.equals = Gi), r;
}
function y(e, t, n = !1) {
  re !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!It || (re.f & ii) !== 0) && Ji() && (re.f & (Pe | Zt | Uo | ii)) !== 0 && (St === null || !Pr.call(St, e)) && fc();
  let r = n ? Le(t) : t;
  return qr(e, r);
}
function qr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    In ? jn.set(e, t) : jn.set(e, n), e.v = t;
    var r = pn.ensure();
    if (r.capture(e, n), (e.f & Pe) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & De) !== 0 && Vo(s), Ho(s);
    }
    e.wv = Na(), pa(e, De), oe !== null && (oe.f & Te) !== 0 && (oe.f & (Dt | Mn)) === 0 && (_t === null ? Oc([e]) : _t.push(e)), !r.is_fork && No.size > 0 && !da && Tc();
  }
  return t;
}
function Tc() {
  da = !1;
  for (const e of No)
    (e.f & Te) !== 0 && we(e, Pt), _s(e) && Fr(e);
  No.clear();
}
function rs(e) {
  y(e, e.v + 1);
}
function pa(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var o = n[s], i = o.f, l = (i & De) === 0;
      if (l && we(o, t), (i & Pe) !== 0) {
        var c = (
          /** @type {Derived} */
          o
        );
        Me == null || Me.delete(c), (i & lr) === 0 && (i & Et && (o.f |= lr), pa(c, Pt));
      } else l && ((i & Zt) !== 0 && Nt !== null && Nt.add(
        /** @type {Effect} */
        o
      ), jt(
        /** @type {Effect} */
        o
      ));
    }
}
function Le(e) {
  if (typeof e != "object" || e === null || rr in e)
    return e;
  const t = zi(e);
  if (t !== Yl && t !== Kl)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Bo(e), s = /* @__PURE__ */ L(0), o = or, i = (l) => {
    if (or === o)
      return l();
    var c = re, u = or;
    $t(null), di(o);
    var f = l();
    return $t(c), di(u), f;
  };
  return r && n.set("length", /* @__PURE__ */ L(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, c, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && lc();
        var f = n.get(c);
        return f === void 0 ? i(() => {
          var d = /* @__PURE__ */ L(u.value);
          return n.set(c, d), d;
        }) : y(f, u.value, !0), !0;
      },
      deleteProperty(l, c) {
        var u = n.get(c);
        if (u === void 0) {
          if (c in l) {
            const f = i(() => /* @__PURE__ */ L(Ie));
            n.set(c, f), rs(s);
          }
        } else
          y(u, Ie), rs(s);
        return !0;
      },
      get(l, c, u) {
        var h;
        if (c === rr)
          return e;
        var f = n.get(c), d = c in l;
        if (f === void 0 && (!d || (h = nr(l, c)) != null && h.writable) && (f = i(() => {
          var b = Le(d ? l[c] : Ie), _ = /* @__PURE__ */ L(b);
          return _;
        }), n.set(c, f)), f !== void 0) {
          var v = a(f);
          return v === Ie ? void 0 : v;
        }
        return Reflect.get(l, c, u);
      },
      getOwnPropertyDescriptor(l, c) {
        var u = Reflect.getOwnPropertyDescriptor(l, c);
        if (u && "value" in u) {
          var f = n.get(c);
          f && (u.value = a(f));
        } else if (u === void 0) {
          var d = n.get(c), v = d == null ? void 0 : d.v;
          if (d !== void 0 && v !== Ie)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return u;
      },
      has(l, c) {
        var v;
        if (c === rr)
          return !0;
        var u = n.get(c), f = u !== void 0 && u.v !== Ie || Reflect.has(l, c);
        if (u !== void 0 || oe !== null && (!f || (v = nr(l, c)) != null && v.writable)) {
          u === void 0 && (u = i(() => {
            var h = f ? Le(l[c]) : Ie, b = /* @__PURE__ */ L(h);
            return b;
          }), n.set(c, u));
          var d = a(u);
          if (d === Ie)
            return !1;
        }
        return f;
      },
      set(l, c, u, f) {
        var k;
        var d = n.get(c), v = c in l;
        if (r && c === "length")
          for (var h = u; h < /** @type {Source<number>} */
          d.v; h += 1) {
            var b = n.get(h + "");
            b !== void 0 ? y(b, Ie) : h in l && (b = i(() => /* @__PURE__ */ L(Ie)), n.set(h + "", b));
          }
        if (d === void 0)
          (!v || (k = nr(l, c)) != null && k.writable) && (d = i(() => /* @__PURE__ */ L(void 0)), y(d, Le(u)), n.set(c, d));
        else {
          v = d.v !== Ie;
          var _ = i(() => Le(u));
          y(d, _);
        }
        var p = Reflect.getOwnPropertyDescriptor(l, c);
        if (p != null && p.set && p.set.call(f, u), !v) {
          if (r && typeof c == "string") {
            var m = (
              /** @type {Source<number>} */
              n.get("length")
            ), N = Number(c);
            Number.isInteger(N) && N >= m.v && y(m, N + 1);
          }
          rs(s);
        }
        return !0;
      },
      ownKeys(l) {
        a(s);
        var c = Reflect.ownKeys(l).filter((d) => {
          var v = n.get(d);
          return v === void 0 || v.v !== Ie;
        });
        for (var [u, f] of n)
          f.v !== Ie && !(u in l) && c.push(u);
        return c;
      },
      setPrototypeOf() {
        cc();
      }
    }
  );
}
function li(e) {
  try {
    if (e !== null && typeof e == "object" && rr in e)
      return e[rr];
  } catch {
  }
  return e;
}
function Nc(e, t) {
  return Object.is(li(e), li(t));
}
var ci, ha, ga, ma;
function Ro() {
  if (ci === void 0) {
    ci = window, ha = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    ga = nr(t, "firstChild").get, ma = nr(t, "nextSibling").get, oi(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), oi(n) && (n.__t = void 0);
  }
}
function st(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function vt(e) {
  return (
    /** @type {TemplateNode | null} */
    ga.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Qt(e) {
  return (
    /** @type {TemplateNode | null} */
    ma.call(e)
  );
}
function x(e, t) {
  if (!te)
    return /* @__PURE__ */ vt(e);
  var n = /* @__PURE__ */ vt(ee);
  if (n === null)
    n = ee.appendChild(st());
  else if (t && n.nodeType !== ms) {
    var r = st();
    return n == null || n.before(r), Ke(r), r;
  }
  return t && ro(
    /** @type {Text} */
    n
  ), Ke(n), n;
}
function ut(e, t = !1) {
  if (!te) {
    var n = /* @__PURE__ */ vt(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Qt(n) : n;
  }
  if (t) {
    if ((ee == null ? void 0 : ee.nodeType) !== ms) {
      var r = st();
      return ee == null || ee.before(r), Ke(r), r;
    }
    ro(
      /** @type {Text} */
      ee
    );
  }
  return ee;
}
function S(e, t = 1, n = !1) {
  let r = te ? ee : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ Qt(r);
  if (!te)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== ms) {
      var o = st();
      return r === null ? s == null || s.after(o) : r.before(o), Ke(o), o;
    }
    ro(
      /** @type {Text} */
      r
    );
  }
  return Ke(r), r;
}
function Wo(e) {
  e.textContent = "";
}
function ba() {
  return !1;
}
function Yo(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Fi, e, void 0)
  );
}
function ro(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === ms; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function _a(e) {
  te && /* @__PURE__ */ vt(e) !== null && Wo(e);
}
let fi = !1;
function ya() {
  fi || (fi = !0, document.addEventListener(
    "reset",
    (e) => {
      Promise.resolve().then(() => {
        var t;
        if (!e.defaultPrevented)
          for (
            const n of
            /**@type {HTMLFormElement} */
            e.target.elements
          )
            (t = n.__on_r) == null || t.call(n);
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
    { capture: !0 }
  ));
}
function Hr(e) {
  var t = re, n = oe;
  $t(null), Xt(null);
  try {
    return e();
  } finally {
    $t(t), Xt(n);
  }
}
function wa(e, t, n, r = n) {
  e.addEventListener(t, () => Hr(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), ya();
}
function Rc(e) {
  oe === null && (re === null && sc(), rc()), In && nc();
}
function jc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function en(e, t, n) {
  var r = oe;
  r !== null && (r.f & pt) !== 0 && (e |= pt);
  var s = {
    ctx: ot,
    deps: null,
    nodes: null,
    f: e | De | Et,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (n)
    try {
      Fr(s);
    } catch (l) {
      throw Xe(s), l;
    }
  else t !== null && jt(s);
  var o = s;
  if (n && o.deps === null && o.teardown === null && o.nodes === null && o.first === o.last && // either `null`, or a singular child
  (o.f & dr) === 0 && (o = o.first, (e & Zt) !== 0 && (e & ar) !== 0 && o !== null && (o.f |= ar)), o !== null && (o.parent = r, r !== null && jc(o, r), re !== null && (re.f & Pe) !== 0 && (e & Mn) === 0)) {
    var i = (
      /** @type {Derived} */
      re
    );
    (i.effects ?? (i.effects = [])).push(o);
  }
  return s;
}
function Ko() {
  return re !== null && !It;
}
function Xo(e) {
  const t = en(Qs, null, !1);
  return we(t, Te), t.teardown = e, t;
}
function js(e) {
  Rc();
  var t = (
    /** @type {Effect} */
    oe.f
  ), n = !re && (t & Dt) !== 0 && (t & ur) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      ot
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return xa(e);
}
function xa(e) {
  return en(as | Jl, e, !1);
}
function Ic(e) {
  pn.ensure();
  const t = en(Mn | dr, e, !0);
  return () => {
    Xe(t);
  };
}
function Mc(e) {
  pn.ensure();
  const t = en(Mn | dr, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? sr(t, () => {
      Xe(t), r(void 0);
    }) : (Xe(t), r(void 0));
  });
}
function so(e) {
  return en(as, e, !1);
}
function Lc(e) {
  return en(Uo | dr, e, !0);
}
function oo(e, t = 0) {
  return en(Qs | t, e, !0);
}
function q(e, t = [], n = [], r = []) {
  kc(r, t, n, (s) => {
    en(Qs, () => e(...s.map(a)), !0);
  });
}
function io(e, t = 0) {
  var n = en(Zt | t, e, !0);
  return n;
}
function xt(e) {
  return en(Dt | dr, e, !0);
}
function ka(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = In, r = re;
    ui(!0), $t(null);
    try {
      t.call(null);
    } finally {
      ui(n), $t(r);
    }
  }
}
function Go(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Hr(() => {
      s.abort(Yn);
    });
    var r = n.next;
    (n.f & Mn) !== 0 ? n.parent = null : Xe(n, t), n = r;
  }
}
function Pc(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Dt) === 0 && Xe(t), t = n;
  }
}
function Xe(e, t = !0) {
  var n = !1;
  (t || (e.f & Vi) !== 0) && e.nodes !== null && e.nodes.end !== null && (Dc(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), Go(e, t && !n), ls(e, 0), we(e, vn);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const o of r)
      o.stop();
  ka(e);
  var s = e.parent;
  s !== null && s.first !== null && Ea(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Dc(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Qt(e);
    e.remove(), e = n;
  }
}
function Ea(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function sr(e, t, n = !0) {
  var r = [];
  Sa(e, r, !0);
  var s = () => {
    n && Xe(e), t && t();
  }, o = r.length;
  if (o > 0) {
    var i = () => --o || s();
    for (var l of r)
      l.out(i);
  } else
    s();
}
function Sa(e, t, n) {
  if ((e.f & pt) === 0) {
    e.f ^= pt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var s = e.first; s !== null; ) {
      var o = s.next, i = (s.f & ar) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & Dt) !== 0 && (e.f & Zt) !== 0;
      Sa(s, t, i ? n : !1), s = o;
    }
  }
}
function Jo(e) {
  $a(e, !0);
}
function $a(e, t) {
  if ((e.f & pt) !== 0) {
    e.f ^= pt, (e.f & Te) === 0 && (we(e, De), jt(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & ar) !== 0 || (n.f & Dt) !== 0;
      $a(n, s ? t : !1), n = r;
    }
    var o = e.nodes && e.nodes.t;
    if (o !== null)
      for (const i of o)
        (i.is_global || t) && i.in();
  }
}
function Ca(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ Qt(n);
      t.append(n), n = s;
    }
}
let Is = !1, In = !1;
function ui(e) {
  In = e;
}
let re = null, It = !1;
function $t(e) {
  re = e;
}
let oe = null;
function Xt(e) {
  oe = e;
}
let St = null;
function Aa(e) {
  re !== null && (St === null ? St = [e] : St.push(e));
}
let rt = null, lt = 0, _t = null;
function Oc(e) {
  _t = e;
}
let Ta = 1, Xn = 0, or = Xn;
function di(e) {
  or = e;
}
function Na() {
  return ++Ta;
}
function _s(e) {
  var t = e.f;
  if ((t & De) !== 0)
    return !0;
  if (t & Pe && (e.f &= ~lr), (t & Pt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var o = n[s];
      if (_s(
        /** @type {Derived} */
        o
      ) && fa(
        /** @type {Derived} */
        o
      ), o.wv > e.wv)
        return !0;
    }
    (t & Et) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Me === null && we(e, Te);
  }
  return !1;
}
function Ra(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(St !== null && Pr.call(St, e)))
    for (var s = 0; s < r.length; s++) {
      var o = r[s];
      (o.f & Pe) !== 0 ? Ra(
        /** @type {Derived} */
        o,
        t,
        !1
      ) : t === o && (n ? we(o, De) : (o.f & Te) !== 0 && we(o, Pt), jt(
        /** @type {Effect} */
        o
      ));
    }
}
function ja(e) {
  var _;
  var t = rt, n = lt, r = _t, s = re, o = St, i = ot, l = It, c = or, u = e.f;
  rt = /** @type {null | Value[]} */
  null, lt = 0, _t = null, re = (u & (Dt | Mn)) === 0 ? e : null, St = null, Dr(e.ctx), It = !1, or = ++Xn, e.ac !== null && (Hr(() => {
    e.ac.abort(Yn);
  }), e.ac = null);
  try {
    e.f |= ko;
    var f = (
      /** @type {Function} */
      e.fn
    ), d = f();
    e.f |= ur;
    var v = e.deps, h = K == null ? void 0 : K.is_fork;
    if (rt !== null) {
      var b;
      if (h || ls(e, lt), v !== null && lt > 0)
        for (v.length = lt + rt.length, b = 0; b < rt.length; b++)
          v[lt + b] = rt[b];
      else
        e.deps = v = rt;
      if (Ko() && (e.f & Et) !== 0)
        for (b = lt; b < v.length; b++)
          ((_ = v[b]).reactions ?? (_.reactions = [])).push(e);
    } else !h && v !== null && lt < v.length && (ls(e, lt), v.length = lt);
    if (Ji() && _t !== null && !It && v !== null && (e.f & (Pe | Pt | De)) === 0)
      for (b = 0; b < /** @type {Source[]} */
      _t.length; b++)
        Ra(
          _t[b],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (Xn++, s.deps !== null)
        for (let p = 0; p < n; p += 1)
          s.deps[p].rv = Xn;
      if (t !== null)
        for (const p of t)
          p.rv = Xn;
      _t !== null && (r === null ? r = _t : r.push(.../** @type {Source[]} */
      _t));
    }
    return (e.f & Rn) !== 0 && (e.f ^= Rn), d;
  } catch (p) {
    return Qi(p);
  } finally {
    e.f ^= ko, rt = t, lt = n, _t = r, re = s, St = o, Dr(i), It = l, or = c;
  }
}
function qc(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Vl.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Pe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (rt === null || !Pr.call(rt, t))) {
    var o = (
      /** @type {Derived} */
      t
    );
    (o.f & Et) !== 0 && (o.f ^= Et, o.f &= ~lr), Ho(o), Ac(o), ls(o, 0);
  }
}
function ls(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      qc(e, n[r]);
}
function Fr(e) {
  var t = e.f;
  if ((t & vn) === 0) {
    we(e, Te);
    var n = oe, r = Is;
    oe = e, Is = !0;
    try {
      (t & (Zt | Ui)) !== 0 ? Pc(e) : Go(e), ka(e);
      var s = ja(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Ta;
      var o;
      xo && hc && (e.f & De) !== 0 && e.deps;
    } finally {
      Is = r, oe = n;
    }
  }
}
async function Fc() {
  await Promise.resolve(), H();
}
function a(e) {
  var t = e.f, n = (t & Pe) !== 0;
  if (re !== null && !It) {
    var r = oe !== null && (oe.f & vn) !== 0;
    if (!r && (St === null || !Pr.call(St, e))) {
      var s = re.deps;
      if ((re.f & ko) !== 0)
        e.rv < Xn && (e.rv = Xn, rt === null && s !== null && s[lt] === e ? lt++ : rt === null ? rt = [e] : rt.push(e));
      else {
        (re.deps ?? (re.deps = [])).push(e);
        var o = e.reactions;
        o === null ? e.reactions = [re] : Pr.call(o, re) || o.push(re);
      }
    }
  }
  if (In && jn.has(e))
    return jn.get(e);
  if (n) {
    var i = (
      /** @type {Derived} */
      e
    );
    if (In) {
      var l = i.v;
      return ((i.f & Te) === 0 && i.reactions !== null || Ma(i)) && (l = Vo(i)), jn.set(i, l), l;
    }
    var c = (i.f & Et) === 0 && !It && re !== null && (Is || (re.f & Et) !== 0), u = (i.f & ur) === 0;
    _s(i) && (c && (i.f |= Et), fa(i)), c && !u && (ua(i), Ia(i));
  }
  if (Me != null && Me.has(e))
    return Me.get(e);
  if ((e.f & Rn) !== 0)
    throw e.v;
  return e.v;
}
function Ia(e) {
  if (e.f |= Et, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & Pe) !== 0 && (t.f & Et) === 0 && (ua(
        /** @type {Derived} */
        t
      ), Ia(
        /** @type {Derived} */
        t
      ));
}
function Ma(e) {
  if (e.v === Ie) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (jn.has(t) || (t.f & Pe) !== 0 && Ma(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function vr(e) {
  var t = It;
  try {
    return It = !0, e();
  } finally {
    It = t;
  }
}
const zc = ["touchstart", "touchmove"];
function Bc(e) {
  return zc.includes(e);
}
const Ms = Symbol("events"), La = /* @__PURE__ */ new Set(), jo = /* @__PURE__ */ new Set();
function Uc(e, t, n, r = {}) {
  function s(o) {
    if (r.capture || Io.call(t, o), !o.cancelBubble)
      return Hr(() => n == null ? void 0 : n.call(this, o));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Mt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Pa(e, t, n, r, s) {
  var o = { capture: r, passive: s }, i = Uc(e, t, n, o);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Xo(() => {
    t.removeEventListener(e, i, o);
  });
}
function J(e, t, n) {
  (t[Ms] ?? (t[Ms] = {}))[e] = n;
}
function ys(e) {
  for (var t = 0; t < e.length; t++)
    La.add(e[t]);
  for (var n of jo)
    n(e);
}
let vi = null;
function Io(e) {
  var p, m;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = ((p = e.composedPath) == null ? void 0 : p.call(e)) || [], o = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  vi = e;
  var i = 0, l = vi === e && e.__root;
  if (l) {
    var c = s.indexOf(l);
    if (c !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = s.indexOf(t);
    if (u === -1)
      return;
    c <= u && (i = c);
  }
  if (o = /** @type {Element} */
  s[i] || e.target, o !== t) {
    qs(e, "currentTarget", {
      configurable: !0,
      get() {
        return o || n;
      }
    });
    var f = re, d = oe;
    $t(null), Xt(null);
    try {
      for (var v, h = []; o !== null; ) {
        var b = o.assignedSlot || o.parentNode || /** @type {any} */
        o.host || null;
        try {
          var _ = (m = o[Ms]) == null ? void 0 : m[r];
          _ != null && (!/** @type {any} */
          o.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === o) && _.call(o, e);
        } catch (N) {
          v ? h.push(N) : v = N;
        }
        if (e.cancelBubble || b === t || b === null)
          break;
        o = b;
      }
      if (v) {
        for (let N of h)
          queueMicrotask(() => {
            throw N;
          });
        throw v;
      }
    } finally {
      e.__root = t, delete e.currentTarget, $t(f), Xt(d);
    }
  }
}
var Li, Pi;
const _o = (Pi = (Li = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Li.trustedTypes) == null ? void 0 : /* @__PURE__ */ Pi.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function Hc(e) {
  return (
    /** @type {string} */
    (_o == null ? void 0 : _o.createHTML(e)) ?? e
  );
}
function Da(e, t = !1) {
  var n = Yo("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? Hc(e) : e, n.content;
}
function Lt(e, t) {
  var n = (
    /** @type {Effect} */
    oe
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function j(e, t) {
  var n = (t & qi) !== 0, r = (t & Hl) !== 0, s, o = !e.startsWith("<!>");
  return () => {
    if (te)
      return Lt(ee, null), ee;
    s === void 0 && (s = Da(o ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ vt(s)));
    var i = (
      /** @type {TemplateNode} */
      r || ha ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ vt(i)
      ), c = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      Lt(l, c);
    } else
      Lt(i, i);
    return i;
  };
}
// @__NO_SIDE_EFFECTS__
function Vc(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & qi) !== 0, o = `<${n}>${r ? e : "<!>" + e}</${n}>`, i;
  return () => {
    if (te)
      return Lt(ee, null), ee;
    if (!i) {
      var l = (
        /** @type {DocumentFragment} */
        Da(o, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ vt(l)
      );
      if (s)
        for (i = document.createDocumentFragment(); /* @__PURE__ */ vt(c); )
          i.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ vt(c)
          );
      else
        i = /** @type {Element} */
        /* @__PURE__ */ vt(c);
    }
    var u = (
      /** @type {TemplateNode} */
      i.cloneNode(!0)
    );
    if (s) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ vt(u)
      ), d = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      Lt(f, d);
    } else
      Lt(u, u);
    return u;
  };
}
// @__NO_SIDE_EFFECTS__
function pr(e, t) {
  return /* @__PURE__ */ Vc(e, t, "svg");
}
function pi(e = "") {
  if (!te) {
    var t = st(e + "");
    return Lt(t, t), t;
  }
  var n = ee;
  return n.nodeType !== ms ? (n.before(n = st()), Ke(n)) : ro(
    /** @type {Text} */
    n
  ), Lt(n, n), n;
}
function $r() {
  if (te)
    return Lt(ee, null), ee;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = st();
  return e.append(t, n), Lt(t, n), e;
}
function $(e, t) {
  if (te) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      oe
    );
    ((n.f & ur) === 0 || n.nodes.end === null) && (n.nodes.end = ee), bs();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let Mo = !0;
function Y(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Oa(e, t) {
  return qa(e, t);
}
function Wc(e, t) {
  Ro(), t.intro = t.intro ?? !1;
  const n = t.target, r = te, s = ee;
  try {
    for (var o = /* @__PURE__ */ vt(n); o && (o.nodeType !== Ur || /** @type {Comment} */
    o.data !== Fo); )
      o = /* @__PURE__ */ Qt(o);
    if (!o)
      throw Lr;
    dn(!0), Ke(
      /** @type {Comment} */
      o
    );
    const i = qa(e, { ...t, anchor: o });
    return dn(!1), /**  @type {Exports} */
    i;
  } catch (i) {
    if (i instanceof Error && i.message.split(`
`).some((l) => l.startsWith("https://svelte.dev/e/")))
      throw i;
    return i !== Lr && console.warn("Failed to hydrate: ", i), t.recover === !1 && ic(), Ro(), Wo(n), dn(!1), Oa(e, t);
  } finally {
    dn(r), Ke(s);
  }
}
const As = /* @__PURE__ */ new Map();
function qa(e, { target: t, anchor: n, props: r = {}, events: s, context: o, intro: i = !0 }) {
  Ro();
  var l = /* @__PURE__ */ new Set(), c = (d) => {
    for (var v = 0; v < d.length; v++) {
      var h = d[v];
      if (!l.has(h)) {
        l.add(h);
        var b = Bc(h);
        for (const m of [t, document]) {
          var _ = As.get(m);
          _ === void 0 && (_ = /* @__PURE__ */ new Map(), As.set(m, _));
          var p = _.get(h);
          p === void 0 ? (m.addEventListener(h, Io, { passive: b }), _.set(h, 1)) : _.set(h, p + 1);
        }
      }
    }
  };
  c(Zs(La)), jo.add(c);
  var u = void 0, f = Mc(() => {
    var d = n ?? t.appendChild(st());
    return wc(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (v) => {
        hn({});
        var h = (
          /** @type {ComponentContext} */
          ot
        );
        if (o && (h.c = o), s && (r.$$events = s), te && Lt(
          /** @type {TemplateNode} */
          v,
          null
        ), Mo = i, u = e(v, r) || {}, Mo = !0, te && (oe.nodes.end = ee, ee === null || ee.nodeType !== Ur || /** @type {Comment} */
        ee.data !== zo))
          throw eo(), Lr;
        gn();
      }
    ), () => {
      var _;
      for (var v of l)
        for (const p of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            As.get(p)
          ), b = (
            /** @type {number} */
            h.get(v)
          );
          --b == 0 ? (p.removeEventListener(v, Io), h.delete(v), h.size === 0 && As.delete(p)) : h.set(v, b);
        }
      jo.delete(c), d !== n && ((_ = d.parentNode) == null || _.removeChild(d));
    };
  });
  return Lo.set(u, f), u;
}
let Lo = /* @__PURE__ */ new WeakMap();
function Yc(e, t) {
  const n = Lo.get(e);
  return n ? (Lo.delete(e), n(t)) : Promise.resolve();
}
var Rt, Wt, ft, tr, hs, gs, Gs;
class Fa {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    ye(this, "anchor");
    /** @type {Map<Batch, Key>} */
    G(this, Rt, /* @__PURE__ */ new Map());
    /**
     * Map of keys to effects that are currently rendered in the DOM.
     * These effects are visible and actively part of the document tree.
     * Example:
     * ```
     * {#if condition}
     * 	foo
     * {:else}
     * 	bar
     * {/if}
     * ```
     * Can result in the entries `true->Effect` and `false->Effect`
     * @type {Map<Key, Effect>}
     */
    G(this, Wt, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    G(this, ft, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    G(this, tr, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    G(this, hs, !0);
    G(this, gs, () => {
      var t = (
        /** @type {Batch} */
        K
      );
      if (g(this, Rt).has(t)) {
        var n = (
          /** @type {Key} */
          g(this, Rt).get(t)
        ), r = g(this, Wt).get(n);
        if (r)
          Jo(r), g(this, tr).delete(n);
        else {
          var s = g(this, ft).get(n);
          s && (g(this, Wt).set(n, s.effect), g(this, ft).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [o, i] of g(this, Rt)) {
          if (g(this, Rt).delete(o), o === t)
            break;
          const l = g(this, ft).get(i);
          l && (Xe(l.effect), g(this, ft).delete(i));
        }
        for (const [o, i] of g(this, Wt)) {
          if (o === n || g(this, tr).has(o)) continue;
          const l = () => {
            if (Array.from(g(this, Rt).values()).includes(o)) {
              var u = document.createDocumentFragment();
              Ca(i, u), u.append(st()), g(this, ft).set(o, { effect: i, fragment: u });
            } else
              Xe(i);
            g(this, tr).delete(o), g(this, Wt).delete(o);
          };
          g(this, hs) || !r ? (g(this, tr).add(o), sr(i, l, !1)) : l();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    G(this, Gs, (t) => {
      g(this, Rt).delete(t);
      const n = Array.from(g(this, Rt).values());
      for (const [r, s] of g(this, ft))
        n.includes(r) || (Xe(s.effect), g(this, ft).delete(r));
    });
    this.anchor = t, V(this, hs, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      K
    ), s = ba();
    if (n && !g(this, Wt).has(t) && !g(this, ft).has(t))
      if (s) {
        var o = document.createDocumentFragment(), i = st();
        o.append(i), g(this, ft).set(t, {
          effect: xt(() => n(i)),
          fragment: o
        });
      } else
        g(this, Wt).set(
          t,
          xt(() => n(this.anchor))
        );
    if (g(this, Rt).set(r, t), s) {
      for (const [l, c] of g(this, Wt))
        l === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [l, c] of g(this, ft))
        l === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(g(this, gs)), r.ondiscard(g(this, Gs));
    } else
      te && (this.anchor = ee), g(this, gs).call(this);
  }
}
Rt = new WeakMap(), Wt = new WeakMap(), ft = new WeakMap(), tr = new WeakMap(), hs = new WeakMap(), gs = new WeakMap(), Gs = new WeakMap();
function Zo(e) {
  ot === null && Yi(), js(() => {
    const t = vr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function za(e) {
  ot === null && Yi(), Zo(() => () => vr(e));
}
function B(e, t, n = !1) {
  te && bs();
  var r = new Fa(e), s = n ? ar : 0;
  function o(i, l) {
    if (te) {
      const f = Ki(e);
      var c;
      if (f === Fo ? c = 0 : f === Js ? c = !1 : c = parseInt(f.substring(1)), i !== c) {
        var u = zs();
        Ke(u), r.anchor = u, dn(!1), r.ensure(i, l), dn(!0);
        return;
      }
    }
    r.ensure(i, l);
  }
  io(() => {
    var i = !1;
    t((l, c = 0) => {
      i = !0, o(c, l);
    }), i || o(!1, null);
  }, s);
}
const Kc = Symbol("NaN");
function Xc(e, t, n) {
  te && bs();
  var r = new Fa(e);
  io(() => {
    var s = t();
    s !== s && (s = /** @type {any} */
    Kc), r.ensure(s, n);
  });
}
function dt(e, t) {
  return t;
}
function Gc(e, t, n) {
  for (var r = [], s = t.length, o, i = t.length, l = 0; l < s; l++) {
    let d = t[l];
    sr(
      d,
      () => {
        if (o) {
          if (o.pending.delete(d), o.done.add(d), o.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Po(Zs(o.done)), v.delete(o), v.size === 0 && (e.outrogroups = null);
          }
        } else
          i -= 1;
      },
      !1
    );
  }
  if (i === 0) {
    var c = r.length === 0 && n !== null;
    if (c) {
      var u = (
        /** @type {Element} */
        n
      ), f = (
        /** @type {Element} */
        u.parentNode
      );
      Wo(f), f.append(u), e.items.clear();
    }
    Po(t, !c);
  } else
    o = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(o);
}
function Po(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    Xe(e[n], t);
}
var hi;
function We(e, t, n, r, s, o = null) {
  var i = e, l = /* @__PURE__ */ new Map(), c = (t & Oi) !== 0;
  if (c) {
    var u = (
      /** @type {Element} */
      e
    );
    i = te ? Ke(/* @__PURE__ */ vt(u)) : u.appendChild(st());
  }
  te && bs();
  var f = null, d = /* @__PURE__ */ ca(() => {
    var m = n();
    return Bo(m) ? m : m == null ? [] : Zs(m);
  }), v, h = !0;
  function b() {
    p.fallback = f, Jc(p, v, i, t, r), f !== null && (v.length === 0 ? (f.f & un) === 0 ? Jo(f) : (f.f ^= un, ts(f, null, i)) : sr(f, () => {
      f = null;
    }));
  }
  var _ = io(() => {
    v = /** @type {V[]} */
    a(d);
    var m = v.length;
    let N = !1;
    if (te) {
      var k = Ki(i) === Js;
      k !== (m === 0) && (i = zs(), Ke(i), dn(!1), N = !0);
    }
    for (var M = /* @__PURE__ */ new Set(), I = (
      /** @type {Batch} */
      K
    ), F = ba(), X = 0; X < m; X += 1) {
      te && ee.nodeType === Ur && /** @type {Comment} */
      ee.data === zo && (i = /** @type {Comment} */
      ee, N = !0, dn(!1));
      var z = v[X], Z = r(z, X), ae = h ? null : l.get(Z);
      ae ? (ae.v && qr(ae.v, z), ae.i && qr(ae.i, X), F && I.unskip_effect(ae.e)) : (ae = Zc(
        l,
        h ? i : hi ?? (hi = st()),
        z,
        Z,
        X,
        s,
        t,
        n
      ), h || (ae.e.f |= un), l.set(Z, ae)), M.add(Z);
    }
    if (m === 0 && o && !f && (h ? f = xt(() => o(i)) : (f = xt(() => o(hi ?? (hi = st()))), f.f |= un)), m > M.size && tc(), te && m > 0 && Ke(zs()), !h)
      if (F) {
        for (const [me, xe] of l)
          M.has(me) || I.skip_effect(xe.e);
        I.oncommit(b), I.ondiscard(() => {
        });
      } else
        b();
    N && dn(!0), a(d);
  }), p = { effect: _, items: l, outrogroups: null, fallback: f };
  h = !1, te && (i = ee);
}
function Zr(e) {
  for (; e !== null && (e.f & Dt) === 0; )
    e = e.next;
  return e;
}
function Jc(e, t, n, r, s) {
  var ae, me, xe, Ne, Ee, Oe, Ge, P, ve;
  var o = (r & Dl) !== 0, i = t.length, l = e.items, c = Zr(e.effect.first), u, f = null, d, v = [], h = [], b, _, p, m;
  if (o)
    for (m = 0; m < i; m += 1)
      b = t[m], _ = s(b, m), p = /** @type {EachItem} */
      l.get(_).e, (p.f & un) === 0 && ((me = (ae = p.nodes) == null ? void 0 : ae.a) == null || me.measure(), (d ?? (d = /* @__PURE__ */ new Set())).add(p));
  for (m = 0; m < i; m += 1) {
    if (b = t[m], _ = s(b, m), p = /** @type {EachItem} */
    l.get(_).e, e.outrogroups !== null)
      for (const he of e.outrogroups)
        he.pending.delete(p), he.done.delete(p);
    if ((p.f & un) !== 0)
      if (p.f ^= un, p === c)
        ts(p, null, n);
      else {
        var N = f ? f.next : c;
        p === e.effect.last && (e.effect.last = p.prev), p.prev && (p.prev.next = p.next), p.next && (p.next.prev = p.prev), Tn(e, f, p), Tn(e, p, N), ts(p, N, n), f = p, v = [], h = [], c = Zr(f.next);
        continue;
      }
    if ((p.f & pt) !== 0 && (Jo(p), o && ((Ne = (xe = p.nodes) == null ? void 0 : xe.a) == null || Ne.unfix(), (d ?? (d = /* @__PURE__ */ new Set())).delete(p))), p !== c) {
      if (u !== void 0 && u.has(p)) {
        if (v.length < h.length) {
          var k = h[0], M;
          f = k.prev;
          var I = v[0], F = v[v.length - 1];
          for (M = 0; M < v.length; M += 1)
            ts(v[M], k, n);
          for (M = 0; M < h.length; M += 1)
            u.delete(h[M]);
          Tn(e, I.prev, F.next), Tn(e, f, I), Tn(e, F, k), c = k, f = F, m -= 1, v = [], h = [];
        } else
          u.delete(p), ts(p, c, n), Tn(e, p.prev, p.next), Tn(e, p, f === null ? e.effect.first : f.next), Tn(e, f, p), f = p;
        continue;
      }
      for (v = [], h = []; c !== null && c !== p; )
        (u ?? (u = /* @__PURE__ */ new Set())).add(c), h.push(c), c = Zr(c.next);
      if (c === null)
        continue;
    }
    (p.f & un) === 0 && v.push(p), f = p, c = Zr(p.next);
  }
  if (e.outrogroups !== null) {
    for (const he of e.outrogroups)
      he.pending.size === 0 && (Po(Zs(he.done)), (Ee = e.outrogroups) == null || Ee.delete(he));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || u !== void 0) {
    var X = [];
    if (u !== void 0)
      for (p of u)
        (p.f & pt) === 0 && X.push(p);
    for (; c !== null; )
      (c.f & pt) === 0 && c !== e.fallback && X.push(c), c = Zr(c.next);
    var z = X.length;
    if (z > 0) {
      var Z = (r & Oi) !== 0 && i === 0 ? n : null;
      if (o) {
        for (m = 0; m < z; m += 1)
          (Ge = (Oe = X[m].nodes) == null ? void 0 : Oe.a) == null || Ge.measure();
        for (m = 0; m < z; m += 1)
          (ve = (P = X[m].nodes) == null ? void 0 : P.a) == null || ve.fix();
      }
      Gc(e, X, Z);
    }
  }
  o && Mt(() => {
    var he, Re;
    if (d !== void 0)
      for (p of d)
        (Re = (he = p.nodes) == null ? void 0 : he.a) == null || Re.apply();
  });
}
function Zc(e, t, n, r, s, o, i, l) {
  var c = (i & Ll) !== 0 ? (i & Ol) === 0 ? /* @__PURE__ */ va(n, !1, !1) : cr(n) : null, u = (i & Pl) !== 0 ? cr(s) : null;
  return {
    v: c,
    i: u,
    e: xt(() => (o(t, c ?? n, u ?? s, l), () => {
      e.delete(r);
    }))
  };
}
function ts(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, o = t && (t.f & un) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Qt(r)
      );
      if (o.before(r), r === s)
        return;
      r = i;
    }
}
function Tn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const Qc = () => performance.now(), fn = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => Qc(),
  tasks: /* @__PURE__ */ new Set()
};
function Ba() {
  const e = fn.now();
  fn.tasks.forEach((t) => {
    t.c(e) || (fn.tasks.delete(t), t.f());
  }), fn.tasks.size !== 0 && fn.tick(Ba);
}
function ef(e) {
  let t;
  return fn.tasks.size === 0 && fn.tick(Ba), {
    promise: new Promise((n) => {
      fn.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      fn.tasks.delete(t);
    }
  };
}
function Us(e, t) {
  Hr(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function tf(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function gi(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [s, o] = r.split(":");
    if (!s || o === void 0) break;
    const i = tf(s.trim());
    t[i] = o.trim();
  }
  return t;
}
const nf = (e) => e;
function Hs(e, t, n, r) {
  var p;
  var s = (e & Ul) !== 0, o = "both", i, l = t.inert, c = t.style.overflow, u, f;
  function d() {
    return Hr(() => i ?? (i = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
    {}, {
      direction: o
    })));
  }
  var v = {
    is_global: s,
    in() {
      t.inert = l, u = Do(t, d(), f, 1, () => {
        Us(t, "introend"), u == null || u.abort(), u = i = void 0, t.style.overflow = c;
      });
    },
    out(m) {
      t.inert = !0, f = Do(t, d(), u, 0, () => {
        Us(t, "outroend"), m == null || m();
      });
    },
    stop: () => {
      u == null || u.abort(), f == null || f.abort();
    }
  }, h = (
    /** @type {Effect & { nodes: EffectNodes }} */
    oe
  );
  if (((p = h.nodes).t ?? (p.t = [])).push(v), Mo) {
    var b = s;
    if (!b) {
      for (var _ = (
        /** @type {Effect | null} */
        h.parent
      ); _ && (_.f & ar) !== 0; )
        for (; (_ = _.parent) && (_.f & Zt) === 0; )
          ;
      b = !_ || (_.f & ur) !== 0;
    }
    b && so(() => {
      vr(() => v.in());
    });
  }
}
function Do(e, t, n, r, s) {
  var o = r === 1;
  if (Xl(t)) {
    var i, l = !1;
    return Mt(() => {
      if (!l) {
        var p = t({ direction: o ? "in" : "out" });
        i = Do(e, p, n, r, s);
      }
    }), {
      abort: () => {
        l = !0, i == null || i.abort();
      },
      deactivate: () => i.deactivate(),
      reset: () => i.reset(),
      t: () => i.t()
    };
  }
  if (n == null || n.deactivate(), !(t != null && t.duration) && !(t != null && t.delay))
    return Us(e, o ? "introstart" : "outrostart"), s(), {
      abort: Sr,
      deactivate: Sr,
      reset: Sr,
      t: () => r
    };
  const { delay: c = 0, css: u, tick: f, easing: d = nf } = t;
  var v = [];
  if (o && n === void 0 && (f && f(0, 1), u)) {
    var h = gi(u(0, 1));
    v.push(h, h);
  }
  var b = () => 1 - r, _ = e.animate(v, { duration: c, fill: "forwards" });
  return _.onfinish = () => {
    _.cancel(), Us(e, o ? "introstart" : "outrostart");
    var p = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var m = r - p, N = (
      /** @type {number} */
      t.duration * Math.abs(m)
    ), k = [];
    if (N > 0) {
      var M = !1;
      if (u)
        for (var I = Math.ceil(N / 16.666666666666668), F = 0; F <= I; F += 1) {
          var X = p + m * d(F / I), z = gi(u(X, 1 - X));
          k.push(z), M || (M = z.overflow === "hidden");
        }
      M && (e.style.overflow = "hidden"), b = () => {
        var Z = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return p + m * d(Z / N);
      }, f && ef(() => {
        if (_.playState !== "running") return !1;
        var Z = b();
        return f(Z, 1 - Z), !0;
      });
    }
    _ = e.animate(k, { duration: N, fill: "forwards" }), _.onfinish = () => {
      b = () => r, f == null || f(r, 1 - r), s();
    };
  }, {
    abort: () => {
      _ && (_.cancel(), _.effect = null, _.onfinish = Sr);
    },
    deactivate: () => {
      s = Sr;
    },
    reset: () => {
      r === 0 && (f == null || f(1, 0));
    },
    t: () => b()
  };
}
function Ln(e, t) {
  so(() => {
    var n = e.getRootNode(), r = (
      /** @type {ShadowRoot} */
      n.host ? (
        /** @type {ShadowRoot} */
        n
      ) : (
        /** @type {Document} */
        n.head ?? /** @type {Document} */
        n.ownerDocument.head
      )
    );
    if (!r.querySelector("#" + t.hash)) {
      const s = Yo("style");
      s.id = t.hash, s.textContent = t.code, r.appendChild(s);
    }
  });
}
const mi = [...` 	
\r\f \v\uFEFF`];
function rf(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s in n)
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var o = s.length, i = 0; (i = r.indexOf(s, i)) >= 0; ) {
          var l = i + o;
          (i === 0 || mi.includes(r[i - 1])) && (l === r.length || mi.includes(r[l])) ? r = (i === 0 ? "" : r.substring(0, i)) + r.substring(l + 1) : i = l;
        }
  }
  return r === "" ? null : r;
}
function sf(e, t) {
  return e == null ? null : String(e);
}
function Ye(e, t, n, r, s, o) {
  var i = e.__className;
  if (te || i !== n || i === void 0) {
    var l = rf(n, r, o);
    (!te || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : t ? e.className = l : e.setAttribute("class", l)), e.__className = n;
  } else if (o && s !== o)
    for (var c in o) {
      var u = !!o[c];
      (s == null || u !== !!s[c]) && e.classList.toggle(c, u);
    }
  return o;
}
function ir(e, t, n, r) {
  var s = e.__style;
  if (te || s !== t) {
    var o = sf(t);
    (!te || o !== e.getAttribute("style")) && (o == null ? e.removeAttribute("style") : e.style.cssText = o), e.__style = t;
  }
  return r;
}
function Ua(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Bo(t))
      return dc();
    for (var r of e.options)
      r.selected = t.includes(ss(r));
    return;
  }
  for (r of e.options) {
    var s = ss(r);
    if (Nc(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function of(e) {
  var t = new MutationObserver(() => {
    Ua(e, e.__value);
  });
  t.observe(e, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), Xo(() => {
    t.disconnect();
  });
}
function bi(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  wa(e, "change", (o) => {
    var i = o ? "[selected]" : ":checked", l;
    if (e.multiple)
      l = [].map.call(e.querySelectorAll(i), ss);
    else {
      var c = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      l = c && ss(c);
    }
    n(l), K !== null && r.add(K);
  }), so(() => {
    var o = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Bs ?? K
      );
      if (r.has(i))
        return;
    }
    if (Ua(e, o, s), s && o === void 0) {
      var l = e.querySelector(":checked");
      l !== null && (o = ss(l), n(o));
    }
    e.__value = o, s = !1;
  }), of(e);
}
function ss(e) {
  return "__value" in e ? e.__value : e.value;
}
const af = Symbol("is custom element"), lf = Symbol("is html"), cf = Ql ? "link" : "LINK";
function Ha(e) {
  if (te) {
    var t = !1, n = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var r = e.value;
          de(e, "value", null), e.value = r;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          de(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = n, Mt(n), ya();
  }
}
function de(e, t, n, r) {
  var s = ff(e);
  te && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === cf) || s[t] !== (s[t] = n) && (t === "loading" && (e[Zl] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && uf(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function ff(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [af]: e.nodeName.includes("-"),
      [lf]: e.namespaceURI === Fi
    })
  );
}
var _i = /* @__PURE__ */ new Map();
function uf(e) {
  var t = e.getAttribute("is") || e.nodeName, n = _i.get(t);
  if (n) return n;
  _i.set(t, n = []);
  for (var r, s = e, o = Element.prototype; o !== s; ) {
    r = Wl(s);
    for (var i in r)
      r[i].set && n.push(i);
    s = zi(s);
  }
  return n;
}
function Vs(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  wa(e, "input", async (s) => {
    var o = s ? e.defaultValue : e.value;
    if (o = yo(e) ? wo(o) : o, n(o), K !== null && r.add(K), await Fc(), o !== (o = t())) {
      var i = e.selectionStart, l = e.selectionEnd, c = e.value.length;
      if (e.value = o ?? "", l !== null) {
        var u = e.value.length;
        i === l && l === c && u > c ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = i, e.selectionEnd = Math.min(l, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (te && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  vr(t) == null && e.value) && (n(yo(e) ? wo(e.value) : e.value), K !== null && r.add(K)), oo(() => {
    var s = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Bs ?? K
      );
      if (r.has(o))
        return;
    }
    yo(e) && s === wo(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function yo(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function wo(e) {
  return e === "" ? null : +e;
}
function yi(e, t) {
  return e === t || (e == null ? void 0 : e[rr]) === t;
}
function os(e = {}, t, n, r) {
  return so(() => {
    var s, o;
    return oo(() => {
      s = o, o = [], vr(() => {
        e !== n(...o) && (t(e, ...o), s && yi(n(...s), e) && t(null, ...s));
      });
    }), () => {
      Mt(() => {
        o && yi(n(...o), e) && t(null, ...o);
      });
    };
  }), e;
}
let Ts = !1;
function df(e) {
  var t = Ts;
  try {
    return Ts = !1, [e(), Ts];
  } finally {
    Ts = t;
  }
}
function W(e, t, n, r) {
  var N;
  var s = (n & zl) !== 0, o = (n & Bl) !== 0, i = (
    /** @type {V} */
    r
  ), l = !0, c = () => (l && (l = !1, i = o ? vr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), i), u;
  if (s) {
    var f = rr in e || Wi in e;
    u = ((N = nr(e, t)) == null ? void 0 : N.set) ?? (f && t in e ? (k) => e[t] = k : void 0);
  }
  var d, v = !1;
  s ? [d, v] = df(() => (
    /** @type {V} */
    e[t]
  )) : d = /** @type {V} */
  e[t], d === void 0 && r !== void 0 && (d = c(), u && (ac(), u(d)));
  var h;
  if (h = () => {
    var k = (
      /** @type {V} */
      e[t]
    );
    return k === void 0 ? c() : (l = !0, k);
  }, (n & Fl) === 0)
    return h;
  if (u) {
    var b = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(k, M) {
        return arguments.length > 0 ? ((!M || b || v) && u(M ? h() : k), k) : h();
      })
    );
  }
  var _ = !1, p = ((n & ql) !== 0 ? no : ca)(() => (_ = !1, h()));
  s && a(p);
  var m = (
    /** @type {Effect} */
    oe
  );
  return (
    /** @type {() => V} */
    (function(k, M) {
      if (arguments.length > 0) {
        const I = M ? a(p) : s ? Le(k) : k;
        return y(p, I), _ = !0, i !== void 0 && (i = I), k;
      }
      return In && _ || (m.f & vn) !== 0 ? p.v : a(p);
    })
  );
}
function vf(e) {
  return new pf(e);
}
var cn, wt;
class pf {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    G(this, cn);
    /** @type {Record<string, any>} */
    G(this, wt);
    var o;
    var n = /* @__PURE__ */ new Map(), r = (i, l) => {
      var c = /* @__PURE__ */ va(l, !1, !1);
      return n.set(i, c), c;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(i, l) {
          return a(n.get(l) ?? r(l, Reflect.get(i, l)));
        },
        has(i, l) {
          return l === Wi ? !0 : (a(n.get(l) ?? r(l, Reflect.get(i, l))), Reflect.has(i, l));
        },
        set(i, l, c) {
          return y(n.get(l) ?? r(l, c), c), Reflect.set(i, l, c);
        }
      }
    );
    V(this, wt, (t.hydrate ? Wc : Oa)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((o = t == null ? void 0 : t.props) != null && o.$$host) || t.sync === !1) && H(), V(this, cn, s.$$events);
    for (const i of Object.keys(g(this, wt)))
      i === "$set" || i === "$destroy" || i === "$on" || qs(this, i, {
        get() {
          return g(this, wt)[i];
        },
        /** @param {any} value */
        set(l) {
          g(this, wt)[i] = l;
        },
        enumerable: !0
      });
    g(this, wt).$set = /** @param {Record<string, any>} next */
    (i) => {
      Object.assign(s, i);
    }, g(this, wt).$destroy = () => {
      Yc(g(this, wt));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    g(this, wt).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    g(this, cn)[t] = g(this, cn)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return g(this, cn)[t].push(r), () => {
      g(this, cn)[t] = g(this, cn)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    g(this, wt).$destroy();
  }
}
cn = new WeakMap(), wt = new WeakMap();
let Va;
typeof HTMLElement == "function" && (Va = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, n, r) {
    super();
    /** The Svelte component constructor */
    ye(this, "$$ctor");
    /** Slots */
    ye(this, "$$s");
    /** @type {any} The Svelte component instance */
    ye(this, "$$c");
    /** Whether or not the custom element is connected */
    ye(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    ye(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    ye(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    ye(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    ye(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    ye(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    ye(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    ye(this, "$$shadowRoot", null);
    this.$$ctor = t, this.$$s = n, r && (this.$$shadowRoot = this.attachShadow(r));
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(t, n, r) {
    if (this.$$l[t] = this.$$l[t] || [], this.$$l[t].push(n), this.$$c) {
      const s = this.$$c.$on(t, n);
      this.$$l_u.set(n, s);
    }
    super.addEventListener(t, n, r);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(t, n, r) {
    if (super.removeEventListener(t, n, r), this.$$c) {
      const s = this.$$l_u.get(n);
      s && (s(), this.$$l_u.delete(n));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let t = function(s) {
        return (o) => {
          const i = Yo("slot");
          s !== "default" && (i.name = s), $(o, i);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = hf(this);
      for (const s of this.$$s)
        s in r && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const o = this.$$g_p(s.name);
        o in this.$$d || (this.$$d[o] = Ls(o, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = vf({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = Ic(() => {
        oo(() => {
          var s;
          this.$$r = !0;
          for (const o of Os(this.$$c)) {
            if (!((s = this.$$p_d[o]) != null && s.reflect)) continue;
            this.$$d[o] = this.$$c[o];
            const i = Ls(
              o,
              this.$$d[o],
              this.$$p_d,
              "toAttribute"
            );
            i == null ? this.removeAttribute(this.$$p_d[o].attribute || o) : this.setAttribute(this.$$p_d[o].attribute || o, i);
          }
          this.$$r = !1;
        });
      });
      for (const s in this.$$l)
        for (const o of this.$$l[s]) {
          const i = this.$$c.$on(s, o);
          this.$$l_u.set(o, i);
        }
      this.$$l = {};
    }
  }
  // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
  // and setting attributes through setAttribute etc, this is helpful
  /**
   * @param {string} attr
   * @param {string} _oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(t, n, r) {
    var s;
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Ls(t, r, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
  }
  disconnectedCallback() {
    this.$$cn = !1, Promise.resolve().then(() => {
      !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
    });
  }
  /**
   * @param {string} attribute_name
   */
  $$g_p(t) {
    return Os(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function Ls(e, t, n, r) {
  var o;
  const s = (o = n[e]) == null ? void 0 : o.type;
  if (t = s === "Boolean" && typeof t != "boolean" ? t != null : t, !r || !n[e])
    return t;
  if (r === "toAttribute")
    switch (s) {
      case "Object":
      case "Array":
        return t == null ? null : JSON.stringify(t);
      case "Boolean":
        return t ? "" : null;
      case "Number":
        return t ?? null;
      default:
        return t;
    }
  else
    switch (s) {
      case "Object":
      case "Array":
        return t && JSON.parse(t);
      case "Boolean":
        return t;
      // conversion already handled above
      case "Number":
        return t != null ? +t : t;
      default:
        return t;
    }
}
function hf(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Pn(e, t, n, r, s, o) {
  let i = class extends Va {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Os(t).map(
        (l) => (t[l].attribute || l).toLowerCase()
      );
    }
  };
  return Os(t).forEach((l) => {
    qs(i.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(c) {
        var d;
        c = Ls(l, c, t), this.$$d[l] = c;
        var u = this.$$c;
        if (u) {
          var f = (d = nr(u, l)) == null ? void 0 : d.get;
          f ? u[l] = c : u.$set({ [l]: c });
        }
      }
    });
  }), r.forEach((l) => {
    qs(i.prototype, l, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[l];
      }
    });
  }), e.element = /** @type {any} */
  i, i;
}
const Qr = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, gf = [
  // API keys and tokens
  /\b(api[_-]?key|apikey|api[_-]?token|access[_-]?token|auth[_-]?token|bearer)\s*[:=]\s*["']?[\w\-\.]+["']?/gi,
  /\bBearer\s+[\w\-\.]+/gi,
  /\b(sk|pk|rk)[_-][a-zA-Z0-9]{20,}/gi,
  /\bghp_[a-zA-Z0-9]{36,}/gi,
  /\bsk-[a-zA-Z0-9]{20,}/gi,
  // Passwords and secrets
  /\b(password|passwd|pwd|secret|credential)\s*[:=]\s*["']?[^"'\s,}{]+["']?/gi,
  // JWT tokens
  /\beyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/gi,
  // Credit card numbers
  /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
  // Email addresses in sensitive contexts
  /\b(email|e-mail)\s*[:=]\s*["']?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}["']?/gi,
  // Private keys
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
  // AWS-style credentials
  /\b(AKIA|ABIA|ACCA|AGPA|AIDA|AIPA|AKIA|ANPA|ANVA|AROA|APKA|ASCA|ASIA)[A-Z0-9]{16}\b/g,
  /\b(aws[_-]?secret[_-]?access[_-]?key|aws[_-]?access[_-]?key[_-]?id)\s*[:=]\s*["']?[\w\/\+]+["']?/gi
], mf = "[REDACTED]";
function bf(e) {
  let t = e;
  for (const n of gf)
    n.lastIndex = 0, t = t.replace(n, mf);
  return t;
}
let Wa = 50;
const Ps = [];
let Ws = !1;
const kt = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function _f(e) {
  if (e === null) return "null";
  if (e === void 0) return "undefined";
  if (typeof e == "string") return e;
  if (typeof e == "number" || typeof e == "boolean") return String(e);
  if (typeof e == "symbol") return e.toString();
  if (typeof e == "function") return `[Function: ${e.name || "anonymous"}]`;
  if (e instanceof Error)
    return `${e.name}: ${e.message}${e.stack ? `
` + e.stack : ""}`;
  if (typeof e == "object")
    try {
      const t = /* @__PURE__ */ new WeakSet();
      return JSON.stringify(e, (n, r) => {
        if (typeof r == "object" && r !== null) {
          if (t.has(r)) return "[Circular]";
          t.add(r);
        }
        return typeof r == "function" ? `[Function: ${r.name || "anonymous"}]` : r instanceof Error ? `${r.name}: ${r.message}` : r;
      }, 2);
    } catch {
      return "[Object - stringify failed]";
    }
  return String(e);
}
function yf() {
  const e = new Error().stack;
  if (!e) return {};
  const n = e.split(`
`).slice(4), r = n.join(`
`), o = (n[0] || "").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);
  return o ? {
    stackTrace: r,
    fileName: o[1],
    lineNumber: parseInt(o[2], 10),
    columnNumber: parseInt(o[3], 10)
  } : { stackTrace: r };
}
function kr(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = bf(t.map(_f).join(" ")), o = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(o, yf()), o;
}
function Er(e) {
  for (Ps.push(e); Ps.length > Wa; )
    Ps.shift();
}
function wf(e) {
  Ws || (Ws = !0, e && (Wa = e), console.log = (...t) => {
    kt.log(...t), Er(kr("log", t, !1));
  }, console.error = (...t) => {
    kt.error(...t), Er(kr("error", t, !0));
  }, console.warn = (...t) => {
    kt.warn(...t), Er(kr("warn", t, !0));
  }, console.info = (...t) => {
    kt.info(...t), Er(kr("info", t, !1));
  }, console.debug = (...t) => {
    kt.debug(...t), Er(kr("debug", t, !1));
  }, console.trace = (...t) => {
    kt.trace(...t), Er(kr("trace", t, !0));
  });
}
function xf() {
  Ws && (Ws = !1, console.log = kt.log, console.error = kt.error, console.warn = kt.warn, console.info = kt.info, console.debug = kt.debug, console.trace = kt.trace);
}
function kf() {
  return [...Ps];
}
function Ya(e) {
  var r;
  if (e.id !== "")
    return 'id("' + e.id + '")';
  if (e === document.body)
    return e.tagName;
  let t = 0;
  const n = ((r = e.parentNode) == null ? void 0 : r.childNodes) || [];
  for (let s = 0; s < n.length; s++) {
    const o = n[s];
    if (o === e)
      return Ya(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    o.nodeType === 1 && o.tagName === e.tagName && t++;
  }
  return "";
}
function Ef(e) {
  if (e.id)
    return "#" + CSS.escape(e.id);
  const t = [];
  let n = e;
  for (; n && n !== document.body && n !== document.documentElement; ) {
    let s = n.tagName.toLowerCase();
    if (n.id) {
      s = "#" + CSS.escape(n.id), t.unshift(s);
      break;
    }
    if (n.className && typeof n.className == "string") {
      const c = n.className.split(/\s+/).filter(
        (u) => u && !u.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/) && !u.match(/^\d/) && u.length > 1
      );
      c.length > 0 && (s += "." + c.slice(0, 2).map((u) => CSS.escape(u)).join("."));
    }
    const o = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const c of o) {
      const u = n.getAttribute(c);
      if (u) {
        s += `[${c}="${CSS.escape(u)}"]`;
        break;
      }
    }
    const i = n.parentElement;
    if (i) {
      const c = Array.from(i.children).filter((u) => u.tagName === n.tagName);
      if (c.length > 1) {
        const u = c.indexOf(n) + 1;
        s += `:nth-of-type(${u})`;
      }
    }
    t.unshift(s);
    const l = t.join(" > ");
    try {
      if (document.querySelectorAll(l).length === 1)
        break;
    } catch {
    }
    n = n.parentElement;
  }
  const r = t.join(" > ");
  try {
    if (document.querySelectorAll(r).length === 1)
      return r;
  } catch {
  }
  return Sf(e);
}
function Sf(e) {
  const t = [];
  let n = e;
  for (; n && n !== document.body; ) {
    const r = n.parentElement;
    if (r) {
      const s = Array.from(r.children).indexOf(n) + 1;
      t.unshift(`*:nth-child(${s})`), n = r;
    } else
      break;
  }
  return "body > " + t.join(" > ");
}
let fr = !1, Ka = "", Kt = null, Ds = null, Qo = null;
function $f() {
  const e = document.createElement("div");
  return e.id = "jat-feedback-picker-overlay", e.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(59, 130, 246, 0.1);
    z-index: 2147483645;
    pointer-events: none;
    border: 2px solid #3b82f6;
    box-sizing: border-box;
    transition: all 0.1s ease;
  `, document.body.appendChild(e), e;
}
function Cf() {
  const e = document.createElement("div");
  return e.id = "jat-feedback-picker-tooltip", e.innerHTML = "Click an element to select it &bull; Press <strong>ESC</strong> to cancel", e.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 2147483646;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  `, document.body.appendChild(e), e;
}
function Xa(e) {
  if (!fr || !Kt) return;
  const t = e.target;
  if (t === Kt || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  Kt.style.top = `${n.top}px`, Kt.style.left = `${n.left}px`, Kt.style.width = `${n.width}px`, Kt.style.height = `${n.height}px`;
}
function Ga(e) {
  var o;
  if (!fr) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = Qo;
  Qa();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((o = t.textContent) == null ? void 0 : o.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((i, l) => (i[l.name] = l.value, i), {}),
    xpath: Ya(t),
    selector: Ef(t),
    boundingRect: {
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
      top: n.top,
      left: n.left,
      bottom: n.bottom,
      right: n.right
    },
    screenshot: null,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    url: window.location.href
  };
  r == null || r(s);
}
function Ja(e) {
  e.key === "Escape" && Qa();
}
function Za(e) {
  fr || (fr = !0, Qo = e, Ka = document.body.style.cursor, document.body.style.cursor = "crosshair", Kt = $f(), Ds = Cf(), document.addEventListener("mousemove", Xa, !0), document.addEventListener("click", Ga, !0), document.addEventListener("keydown", Ja, !0));
}
function Qa() {
  fr && (fr = !1, Qo = null, document.body.style.cursor = Ka, Kt && (Kt.remove(), Kt = null), Ds && (Ds.remove(), Ds = null), document.removeEventListener("mousemove", Xa, !0), document.removeEventListener("click", Ga, !0), document.removeEventListener("keydown", Ja, !0));
}
function Af() {
  return fr;
}
const wi = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], xi = 3;
let el = !1;
function ki(e) {
  el = e;
}
function Tf() {
  return el;
}
let Nf = 1;
function es() {
  return Nf++;
}
function Rf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const i = Math.atan2(r.y - n.y, r.x - n.x), l = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - l * Math.cos(i - c), r.y - l * Math.sin(i - c)), e.moveTo(r.x, r.y), e.lineTo(r.x - l * Math.cos(i + c), r.y - l * Math.sin(i + c)), e.stroke();
}
function jf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineJoin = "round";
  const i = Math.min(n.x, r.x), l = Math.min(n.y, r.y), c = Math.abs(r.x - n.x), u = Math.abs(r.y - n.y);
  e.strokeRect(i, l, c, u);
}
function If(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o;
  const i = (n.x + r.x) / 2, l = (n.y + r.y) / 2, c = Math.abs(r.x - n.x) / 2, u = Math.abs(r.y - n.y) / 2;
  c < 1 || u < 1 || (e.beginPath(), e.ellipse(i, l, c, u, 0, 0, Math.PI * 2), e.stroke());
}
function Mf(e, t) {
  const { points: n, color: r, strokeWidth: s } = t;
  if (!(n.length < 2)) {
    e.strokeStyle = r, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n[0].x, n[0].y);
    for (let o = 1; o < n.length; o++)
      e.lineTo(n[o].x, n[o].y);
    e.stroke();
  }
}
function Lf(e, t) {
  const { position: n, content: r, color: s, fontSize: o } = t;
  r && (e.font = `bold ${o}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(r, n.x, n.y), e.fillStyle = s, e.fillText(r, n.x, n.y));
}
function tl(e, t) {
  switch (e.save(), t.type) {
    case "arrow":
      Rf(e, t);
      break;
    case "rectangle":
      jf(e, t);
      break;
    case "ellipse":
      If(e, t);
      break;
    case "freehand":
      Mf(e, t);
      break;
    case "text":
      Lf(e, t);
      break;
  }
  e.restore();
}
function nl(e, t) {
  for (const n of t)
    tl(e, n);
}
function Pf(e, t, n, r) {
  return new Promise((s, o) => {
    const i = new Image();
    i.onload = () => {
      const l = document.createElement("canvas");
      l.width = n, l.height = r;
      const c = l.getContext("2d");
      if (!c) {
        o(new Error("Canvas context unavailable"));
        return;
      }
      c.drawImage(i, 0, 0, n, r), nl(c, t), s(l.toDataURL("image/jpeg", 0.85));
    }, i.onerror = () => o(new Error("Failed to load image")), i.src = e;
  });
}
async function rl(e, t) {
  const n = `${e.replace(/\/$/, "")}/api/feedback/report`, r = await fetch(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), s = await r.json();
  return r.ok ? { ok: !0, id: s.id } : { ok: !1, error: s.error || `HTTP ${r.status}` };
}
async function Df(e) {
  try {
    const t = `${e.replace(/\/$/, "")}/api/feedback/reports`, n = await fetch(t, {
      method: "GET",
      credentials: "include"
    });
    if (!n.ok) {
      const s = await n.json().catch(() => ({ error: `HTTP ${n.status}` }));
      return { reports: [], error: s.error || `HTTP ${n.status}` };
    }
    return { reports: (await n.json()).reports || [] };
  } catch (t) {
    return { reports: [], error: t instanceof Error ? t.message : "Failed to fetch" };
  }
}
async function Of(e, t, n, r, s) {
  try {
    const o = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, i = { response: n };
    r && (i.reason = r), s != null && s.screenshots && s.screenshots.length > 0 && (i.screenshots = s.screenshots), s != null && s.elements && s.elements.length > 0 && (i.elements = s.elements);
    const l = await fetch(o, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(i)
    }), c = await l.json();
    return l.ok ? { ok: !0 } : { ok: !1, error: c.error || `HTTP ${l.status}` };
  } catch (o) {
    return { ok: !1, error: o instanceof Error ? o.message : "Failed to respond" };
  }
}
const sl = "jat-feedback-queue", qf = 50, Ff = 3e4;
let is = null;
function ol() {
  try {
    const e = localStorage.getItem(sl);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function il(e) {
  try {
    localStorage.setItem(sl, JSON.stringify(e));
  } catch {
  }
}
function Ei(e, t) {
  const n = ol();
  for (n.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); n.length > qf; )
    n.shift();
  il(n);
}
async function Si() {
  const e = ol();
  if (e.length === 0) return;
  const t = [];
  for (const n of e)
    try {
      (await rl(n.endpoint, n.report)).ok || (n.attempts++, t.push(n));
    } catch {
      n.attempts++, t.push(n);
    }
  il(t);
}
function zf() {
  is || (Si(), is = setInterval(Si, Ff));
}
function Bf() {
  is && (clearInterval(is), is = null);
}
var Uf = /* @__PURE__ */ pr('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Hf = /* @__PURE__ */ pr('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Vf = /* @__PURE__ */ j("<button><!></button>");
const Wf = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function al(e, t) {
  hn(t, !0), Ln(e, Wf);
  let n = W(t, "onclick", 7), r = W(t, "open", 7, !1);
  var s = {
    get onclick() {
      return n();
    },
    set onclick(f) {
      n(f), H();
    },
    get open() {
      return r();
    },
    set open(f = !1) {
      r(f), H();
    }
  }, o = Vf();
  let i;
  var l = x(o);
  {
    var c = (f) => {
      var d = Uf();
      $(f, d);
    }, u = (f) => {
      var d = Hf();
      $(f, d);
    };
    B(l, (f) => {
      r() ? f(c) : f(u, !1);
    });
  }
  return w(o), q(() => {
    i = Ye(o, 1, "jat-fb-btn svelte-joatup", null, i, { open: r() }), de(o, "aria-label", r() ? "Close feedback" : "Send feedback"), de(o, "title", r() ? "Close feedback" : "Send feedback");
  }), J("click", o, function(...f) {
    var d;
    (d = n()) == null || d.apply(this, f);
  }), $(e, o), gn(s);
}
ys(["click"]);
Pn(al, { onclick: {}, open: {} }, [], [], { mode: "open" });
const ll = "[modern-screenshot]", zr = typeof window < "u", Yf = zr && "Worker" in window;
var Di;
const ei = zr ? (Di = window.navigator) == null ? void 0 : Di.userAgent : "", cl = ei.includes("Chrome"), Ys = ei.includes("AppleWebKit") && !cl, ti = ei.includes("Firefox"), Kf = (e) => e && "__CONTEXT__" in e, Xf = (e) => e.constructor.name === "CSSFontFaceRule", Gf = (e) => e.constructor.name === "CSSImportRule", Jf = (e) => e.constructor.name === "CSSLayerBlockRule", Gt = (e) => e.nodeType === 1, ws = (e) => typeof e.className == "object", fl = (e) => e.tagName === "image", Zf = (e) => e.tagName === "use", cs = (e) => Gt(e) && typeof e.style < "u" && !ws(e), Qf = (e) => e.nodeType === 8, eu = (e) => e.nodeType === 3, Br = (e) => e.tagName === "IMG", ao = (e) => e.tagName === "VIDEO", tu = (e) => e.tagName === "CANVAS", nu = (e) => e.tagName === "TEXTAREA", ru = (e) => e.tagName === "INPUT", su = (e) => e.tagName === "STYLE", ou = (e) => e.tagName === "SCRIPT", iu = (e) => e.tagName === "SELECT", au = (e) => e.tagName === "SLOT", lu = (e) => e.tagName === "IFRAME", cu = (...e) => console.warn(ll, ...e);
function fu(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Oo = (e) => e.startsWith("data:");
function ul(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (zr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !zr)
    return e;
  const n = lo().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function lo(e) {
  return (e && Gt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const co = "http://www.w3.org/2000/svg";
function uu(e, t, n) {
  const r = lo(n).createElementNS(co, "svg");
  return r.setAttributeNS(null, "width", e.toString()), r.setAttributeNS(null, "height", t.toString()), r.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), r;
}
function du(e, t) {
  let n = new XMLSerializer().serializeToString(e);
  return t && (n = n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`;
}
function vu(e, t) {
  return new Promise((n, r) => {
    const s = new FileReader();
    s.onload = () => n(s.result), s.onerror = () => r(s.error), s.onabort = () => r(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const pu = (e) => vu(e, "dataUrl");
function Cr(e, t) {
  const n = lo(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function fs(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: o, onWarn: i } = t ?? {}, l = typeof e == "string" ? Cr(e, lo(s)) : e;
    let c = null, u = null;
    function f() {
      n(l), c && clearTimeout(c), u == null || u();
    }
    if (r && (c = setTimeout(f, r)), ao(l)) {
      const d = l.currentSrc || l.src;
      if (!d)
        return l.poster ? fs(l.poster, t).then(n) : f();
      if (l.readyState >= 2)
        return f();
      const v = f, h = (b) => {
        i == null || i(
          "Failed video load",
          d,
          b
        ), o == null || o(b), f();
      };
      u = () => {
        l.removeEventListener("loadeddata", v), l.removeEventListener("error", h);
      }, l.addEventListener("loadeddata", v, { once: !0 }), l.addEventListener("error", h, { once: !0 });
    } else {
      const d = fl(l) ? l.href.baseVal : l.currentSrc || l.src;
      if (!d)
        return f();
      const v = async () => {
        if (Br(l) && "decode" in l)
          try {
            await l.decode();
          } catch (b) {
            i == null || i(
              "Failed to decode image, trying to render anyway",
              l.dataset.originalSrc || d,
              b
            );
          }
        f();
      }, h = (b) => {
        i == null || i(
          "Failed image load",
          l.dataset.originalSrc || d,
          b
        ), f();
      };
      if (Br(l) && l.complete)
        return v();
      u = () => {
        l.removeEventListener("load", v), l.removeEventListener("error", h);
      }, l.addEventListener("load", v, { once: !0 }), l.addEventListener("error", h, { once: !0 });
    }
  });
}
async function hu(e, t) {
  cs(e) && (Br(e) || ao(e) ? await fs(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => fs(r, t)))
  ));
}
const dl = /* @__PURE__ */ (function() {
  let t = 0;
  const n = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${n()}${t}`);
})();
function vl(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let $i = 0;
function gu(e) {
  const t = `${ll}[#${$i}]`;
  return $i++, {
    // eslint-disable-next-line no-console
    time: (n) => e && console.time(`${t} ${n}`),
    // eslint-disable-next-line no-console
    timeEnd: (n) => e && console.timeEnd(`${t} ${n}`),
    warn: (...n) => e && cu(...n)
  };
}
function mu(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function pl(e, t) {
  return Kf(e) ? e : bu(e, { ...t, autoDestruct: !0 });
}
async function bu(e, t) {
  var h, b;
  const { scale: n = 1, workerUrl: r, workerNumber: s = 1 } = t || {}, o = !!(t != null && t.debug), i = (t == null ? void 0 : t.features) ?? !0, l = e.ownerDocument ?? (zr ? window.document : void 0), c = ((h = e.ownerDocument) == null ? void 0 : h.defaultView) ?? (zr ? window : void 0), u = /* @__PURE__ */ new Map(), f = {
    // Options
    width: 0,
    height: 0,
    quality: 1,
    type: "image/png",
    scale: n,
    backgroundColor: null,
    style: null,
    filter: null,
    maximumCanvasSize: 0,
    timeout: 3e4,
    progress: null,
    debug: o,
    fetch: {
      requestInit: mu((b = t == null ? void 0 : t.fetch) == null ? void 0 : b.bypassingCache),
      placeholderImage: "data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      bypassingCache: !1,
      ...t == null ? void 0 : t.fetch
    },
    fetchFn: null,
    font: {},
    drawImageInterval: 100,
    workerUrl: null,
    workerNumber: s,
    onCloneEachNode: null,
    onCloneNode: null,
    onEmbedNode: null,
    onCreateForeignObjectSvg: null,
    includeStyleProperties: null,
    autoDestruct: !1,
    ...t,
    // InternalContext
    __CONTEXT__: !0,
    log: gu(o),
    node: e,
    ownerDocument: l,
    ownerWindow: c,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: hl(l),
    svgDefsElement: l == null ? void 0 : l.createElementNS(co, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Yf && r && s ? s : 0
      })
    ].map(() => {
      try {
        const _ = new Worker(r);
        return _.onmessage = async (p) => {
          var k, M, I, F;
          const { url: m, result: N } = p.data;
          N ? (M = (k = u.get(m)) == null ? void 0 : k.resolve) == null || M.call(k, N) : (F = (I = u.get(m)) == null ? void 0 : I.reject) == null || F.call(I, new Error(`Error receiving message from worker: ${m}`));
        }, _.onmessageerror = (p) => {
          var N, k;
          const { url: m } = p.data;
          (k = (N = u.get(m)) == null ? void 0 : N.reject) == null || k.call(N, new Error(`Error receiving message from worker: ${m}`));
        }, _;
      } catch (_) {
        return f.log.warn("Failed to new Worker", _), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      fu(l) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: u,
    drawImageCount: 0,
    tasks: [],
    features: i,
    isEnable: (_) => _ === "restoreScrollPosition" ? typeof i == "boolean" ? !1 : i[_] ?? !1 : typeof i == "boolean" ? i : i[_] ?? !0,
    shadowRoots: []
  };
  f.log.time("wait until load"), await hu(e, { timeout: f.timeout, onWarn: f.log.warn }), f.log.timeEnd("wait until load");
  const { width: d, height: v } = _u(e, f);
  return f.width = d, f.height = v, f;
}
function hl(e) {
  if (!e)
    return;
  const t = e.createElement("style"), n = t.ownerDocument.createTextNode(`
.______background-clip--text {
  background-clip: text;
  -webkit-background-clip: text;
}
`);
  return t.appendChild(n), t;
}
function _u(e, t) {
  let { width: n, height: r } = t;
  if (Gt(e) && (!n || !r)) {
    const s = e.getBoundingClientRect();
    n = n || s.width || Number(e.getAttribute("width")) || 0, r = r || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: n, height: r };
}
async function yu(e, t) {
  const {
    log: n,
    timeout: r,
    drawImageCount: s,
    drawImageInterval: o
  } = t;
  n.time("image to canvas");
  const i = await fs(e, { timeout: r, onWarn: t.log.warn }), { canvas: l, context2d: c } = wu(e.ownerDocument, t), u = () => {
    try {
      c == null || c.drawImage(i, 0, 0, l.width, l.height);
    } catch (f) {
      t.log.warn("Failed to drawImage", f);
    }
  };
  if (u(), t.isEnable("fixSvgXmlDecode"))
    for (let f = 0; f < s; f++)
      await new Promise((d) => {
        setTimeout(() => {
          c == null || c.clearRect(0, 0, l.width, l.height), u(), d();
        }, f + o);
      });
  return t.drawImageCount = 0, n.timeEnd("image to canvas"), l;
}
function wu(e, t) {
  const { width: n, height: r, scale: s, backgroundColor: o, maximumCanvasSize: i } = t, l = e.createElement("canvas");
  l.width = Math.floor(n * s), l.height = Math.floor(r * s), l.style.width = `${n}px`, l.style.height = `${r}px`, i && (l.width > i || l.height > i) && (l.width > i && l.height > i ? l.width > l.height ? (l.height *= i / l.width, l.width = i) : (l.width *= i / l.height, l.height = i) : l.width > i ? (l.height *= i / l.width, l.width = i) : (l.width *= i / l.height, l.height = i));
  const c = l.getContext("2d");
  return c && o && (c.fillStyle = o, c.fillRect(0, 0, l.width, l.height)), { canvas: l, context2d: c };
}
function gl(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return Cr(o, e.ownerDocument);
    } catch (o) {
      t.log.warn("Failed to clone canvas", o);
    }
  const n = e.cloneNode(!1), r = e.getContext("2d"), s = n.getContext("2d");
  try {
    return r && s && s.putImageData(
      r.getImageData(0, 0, e.width, e.height),
      0,
      0
    ), n;
  } catch (o) {
    t.log.warn("Failed to clone canvas", o);
  }
  return n;
}
function xu(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return ni(e.contentDocument.body, t);
  } catch (r) {
    t.log.warn("Failed to clone iframe", r);
  }
  return e.cloneNode(!1);
}
function ku(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Eu(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Cr(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await fs(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? Cr(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((i) => {
      n.addEventListener("seeked", i, { once: !0 });
    });
    const o = r.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const i = o.getContext("2d");
      i && i.drawImage(n, 0, 0, o.width, o.height);
    } catch (i) {
      return t.log.warn("Failed to clone video", i), e.poster ? Cr(e.poster, e.ownerDocument) : n;
    }
    return gl(o, t);
  }
  return n;
}
function Su(e, t) {
  return tu(e) ? gl(e, t) : lu(e) ? xu(e, t) : Br(e) ? ku(e) : ao(e) ? Eu(e, t) : e.cloneNode(!1);
}
function $u(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: n } = e;
    try {
      n && (t = n.createElement("iframe"), t.id = `__SANDBOX__${dl()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", n.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (r) {
      e.log.warn("Failed to getSandBox", r);
    }
  }
  return t;
}
const Cu = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Au = [
  "stroke",
  "fill"
];
function ml(e, t, n) {
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), o = ws(e) && s !== "svg", i = o ? Au.map((_) => [_, e.getAttribute(_)]).filter(([, _]) => _ !== null) : [], l = [
    o && "svg",
    s,
    i.map((_, p) => `${_}=${p}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(l))
    return r.get(l);
  const c = $u(n), u = c == null ? void 0 : c.contentWindow;
  if (!u)
    return /* @__PURE__ */ new Map();
  const f = u == null ? void 0 : u.document;
  let d, v;
  o ? (d = f.createElementNS(co, "svg"), v = d.ownerDocument.createElementNS(d.namespaceURI, s), i.forEach(([_, p]) => {
    v.setAttributeNS(null, _, p);
  }), d.appendChild(v)) : d = v = f.createElement(s), v.textContent = " ", f.body.appendChild(d);
  const h = u.getComputedStyle(v, t), b = /* @__PURE__ */ new Map();
  for (let _ = h.length, p = 0; p < _; p++) {
    const m = h.item(p);
    Cu.includes(m) || b.set(m, h.getPropertyValue(m));
  }
  return f.body.removeChild(d), r.set(l, b), b;
}
function bl(e, t, n) {
  var l;
  const r = /* @__PURE__ */ new Map(), s = [], o = /* @__PURE__ */ new Map();
  if (n)
    for (const c of n)
      i(c);
  else
    for (let c = e.length, u = 0; u < c; u++) {
      const f = e.item(u);
      i(f);
    }
  for (let c = s.length, u = 0; u < c; u++)
    (l = o.get(s[u])) == null || l.forEach((f, d) => r.set(d, f));
  function i(c) {
    const u = e.getPropertyValue(c), f = e.getPropertyPriority(c), d = c.lastIndexOf("-"), v = d > -1 ? c.substring(0, d) : void 0;
    if (v) {
      let h = o.get(v);
      h || (h = /* @__PURE__ */ new Map(), o.set(v, h)), h.set(c, [u, f]);
    }
    t.get(c) === u && !f || (v ? s.push(v) : r.set(c, [u, f]));
  }
  return r;
}
function Tu(e, t, n, r) {
  var d, v, h, b;
  const { ownerWindow: s, includeStyleProperties: o, currentParentNodeStyle: i } = r, l = t.style, c = s.getComputedStyle(e), u = ml(e, null, r);
  i == null || i.forEach((_, p) => {
    u.delete(p);
  });
  const f = bl(c, u, o);
  f.delete("transition-property"), f.delete("all"), f.delete("d"), f.delete("content"), n && (f.delete("margin-top"), f.delete("margin-right"), f.delete("margin-bottom"), f.delete("margin-left"), f.delete("margin-block-start"), f.delete("margin-block-end"), f.delete("margin-inline-start"), f.delete("margin-inline-end"), f.set("box-sizing", ["border-box", ""])), ((d = f.get("background-clip")) == null ? void 0 : d[0]) === "text" && t.classList.add("______background-clip--text"), cl && (f.has("font-kerning") || f.set("font-kerning", ["normal", ""]), (((v = f.get("overflow-x")) == null ? void 0 : v[0]) === "hidden" || ((h = f.get("overflow-y")) == null ? void 0 : h[0]) === "hidden") && ((b = f.get("text-overflow")) == null ? void 0 : b[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && f.set("text-overflow", ["clip", ""]));
  for (let _ = l.length, p = 0; p < _; p++)
    l.removeProperty(l.item(p));
  return f.forEach(([_, p], m) => {
    l.setProperty(m, _, p);
  }), f;
}
function Nu(e, t) {
  (nu(e) || ru(e) || iu(e)) && t.setAttribute("value", e.value);
}
const Ru = [
  "::before",
  "::after"
  // '::placeholder', TODO
], ju = [
  "::-webkit-scrollbar",
  "::-webkit-scrollbar-button",
  // '::-webkit-scrollbar:horizontal', TODO
  "::-webkit-scrollbar-thumb",
  "::-webkit-scrollbar-track",
  "::-webkit-scrollbar-track-piece",
  // '::-webkit-scrollbar:vertical', TODO
  "::-webkit-scrollbar-corner",
  "::-webkit-resizer"
];
function Iu(e, t, n, r, s) {
  const { ownerWindow: o, svgStyleElement: i, svgStyles: l, currentNodeStyle: c } = r;
  if (!i || !o)
    return;
  function u(f) {
    var k;
    const d = o.getComputedStyle(e, f);
    let v = d.getPropertyValue("content");
    if (!v || v === "none")
      return;
    s == null || s(v), v = v.replace(/(')|(")|(counter\(.+\))/g, "");
    const h = [dl()], b = ml(e, f, r);
    c == null || c.forEach((M, I) => {
      b.delete(I);
    });
    const _ = bl(d, b, r.includeStyleProperties);
    _.delete("content"), _.delete("-webkit-locale"), ((k = _.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const p = [
      `content: '${v}';`
    ];
    if (_.forEach(([M, I], F) => {
      p.push(`${F}: ${M}${I ? " !important" : ""};`);
    }), p.length === 1)
      return;
    try {
      t.className = [t.className, ...h].join(" ");
    } catch (M) {
      r.log.warn("Failed to copyPseudoClass", M);
      return;
    }
    const m = p.join(`
  `);
    let N = l.get(m);
    N || (N = [], l.set(m, N)), N.push(`.${h[0]}${f}`);
  }
  Ru.forEach(u), n && ju.forEach(u);
}
const Ci = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Ai(e, t, n, r, s) {
  if (Gt(n) && (su(n) || ou(n)) || r.filter && !r.filter(n))
    return;
  Ci.has(t.nodeName) || Ci.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const o = await ni(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && Mu(e, o), t.appendChild(o);
}
async function Ti(e, t, n, r) {
  var o;
  let s = e.firstChild;
  Gt(e) && e.shadowRoot && (s = (o = e.shadowRoot) == null ? void 0 : o.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let i = s; i; i = i.nextSibling)
    if (!Qf(i))
      if (Gt(i) && au(i) && typeof i.assignedNodes == "function") {
        const l = i.assignedNodes();
        for (let c = 0; c < l.length; c++)
          await Ai(e, t, l[c], n, r);
      } else
        await Ai(e, t, i, n, r);
}
function Mu(e, t) {
  if (!cs(e) || !cs(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, o = new DOMMatrix(s), { a: i, b: l, c, d: u } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-r, -n), o.a = i, o.b = l, o.c = c, o.d = u, t.style.transform = o.toString();
}
function Lu(e, t) {
  const { backgroundColor: n, width: r, height: s, style: o } = t, i = e.style;
  if (n && i.setProperty("background-color", n, "important"), r && i.setProperty("width", `${r}px`, "important"), s && i.setProperty("height", `${s}px`, "important"), o)
    for (const l in o) i[l] = o[l];
}
const Pu = /^[\w-:]+$/;
async function ni(e, t, n = !1, r) {
  var u, f, d, v;
  const { ownerDocument: s, ownerWindow: o, fontFamilies: i, onCloneEachNode: l } = t;
  if (s && eu(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && o && Gt(e) && (cs(e) || ws(e))) {
    const h = await Su(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = h.getAttributeNames();
      for (let M = k.length, I = 0; I < M; I++) {
        const F = k[I];
        Pu.test(F) || h.removeAttribute(F);
      }
    }
    const b = t.currentNodeStyle = Tu(e, h, n, t);
    n && Lu(h, t);
    let _ = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (u = b.get("overflow-x")) == null ? void 0 : u[0],
        (f = b.get("overflow-y")) == null ? void 0 : f[0]
      ];
      _ = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const p = (d = b.get("text-transform")) == null ? void 0 : d[0], m = vl((v = b.get("font-family")) == null ? void 0 : v[0]), N = m ? (k) => {
      p === "uppercase" ? k = k.toUpperCase() : p === "lowercase" ? k = k.toLowerCase() : p === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), m.forEach((M) => {
        let I = i.get(M);
        I || i.set(M, I = /* @__PURE__ */ new Set()), k.split("").forEach((F) => I.add(F));
      });
    } : void 0;
    return Iu(
      e,
      h,
      _,
      t,
      N
    ), Nu(e, h), ao(e) || await Ti(
      e,
      h,
      t,
      N
    ), await (l == null ? void 0 : l(h)), h;
  }
  const c = e.cloneNode(!1);
  return await Ti(e, c, t), await (l == null ? void 0 : l(c)), c;
}
function Du(e) {
  if (e.ownerDocument = void 0, e.ownerWindow = void 0, e.svgStyleElement = void 0, e.svgDefsElement = void 0, e.svgStyles.clear(), e.defaultComputedStyles.clear(), e.sandbox) {
    try {
      e.sandbox.remove();
    } catch (t) {
      e.log.warn("Failed to destroyContext", t);
    }
    e.sandbox = void 0;
  }
  e.workers = [], e.fontFamilies.clear(), e.fontCssTexts.clear(), e.requests.clear(), e.tasks = [], e.shadowRoots = [];
}
function Ou(e) {
  const { url: t, timeout: n, responseType: r, ...s } = e, o = new AbortController(), i = n ? setTimeout(() => o.abort(), n) : void 0;
  return fetch(t, { signal: o.signal, ...s }).then((l) => {
    if (!l.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: l });
    switch (r) {
      case "arrayBuffer":
        return l.arrayBuffer();
      case "dataUrl":
        return l.blob().then(pu);
      case "text":
      default:
        return l.text();
    }
  }).finally(() => clearTimeout(i));
}
function us(e, t) {
  const { url: n, requestType: r = "text", responseType: s = "text", imageDom: o } = t;
  let i = n;
  const {
    timeout: l,
    acceptOfImage: c,
    requests: u,
    fetchFn: f,
    fetch: {
      requestInit: d,
      bypassingCache: v,
      placeholderImage: h
    },
    font: b,
    workers: _,
    fontFamilies: p
  } = e;
  r === "image" && (Ys || ti) && e.drawImageCount++;
  let m = u.get(n);
  if (!m) {
    v && v instanceof RegExp && v.test(i) && (i += (/\?/.test(i) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const N = r.startsWith("font") && b && b.minify, k = /* @__PURE__ */ new Set();
    N && r.split(";")[1].split(",").forEach((X) => {
      p.has(X) && p.get(X).forEach((z) => k.add(z));
    });
    const M = N && k.size, I = {
      url: i,
      timeout: l,
      responseType: M ? "arrayBuffer" : s,
      headers: r === "image" ? { accept: c } : void 0,
      ...d
    };
    m = {
      type: r,
      resolve: void 0,
      reject: void 0,
      response: null
    }, m.response = (async () => {
      if (f && r === "image") {
        const F = await f(n);
        if (F)
          return F;
      }
      return !Ys && n.startsWith("http") && _.length ? new Promise((F, X) => {
        _[u.size & _.length - 1].postMessage({ rawUrl: n, ...I }), m.resolve = F, m.reject = X;
      }) : Ou(I);
    })().catch((F) => {
      if (u.delete(n), r === "image" && h)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", i), typeof h == "string" ? h : h(o);
      throw F;
    }), u.set(n, m);
  }
  return m.response;
}
async function _l(e, t, n, r) {
  if (!yl(e))
    return e;
  for (const [s, o] of qu(e, t))
    try {
      const i = await us(
        n,
        {
          url: o,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Fu(s), `$1${i}$3`);
    } catch (i) {
      n.log.warn("Failed to fetch css data url", s, i);
    }
  return e;
}
function yl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const wl = /url\((['"]?)([^'"]+?)\1\)/g;
function qu(e, t) {
  const n = [];
  return e.replace(wl, (r, s, o) => (n.push([o, ul(o, t)]), r)), n.filter(([r]) => !Oo(r));
}
function Fu(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const zu = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Bu(e, t) {
  return zu.map((n) => {
    const r = e.getPropertyValue(n);
    return !r || r === "none" ? null : ((Ys || ti) && t.drawImageCount++, _l(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function Uu(e, t) {
  if (Br(e)) {
    const n = e.currentSrc || e.src;
    if (!Oo(n))
      return [
        us(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (Ys || ti) && t.drawImageCount++;
  } else if (ws(e) && !Oo(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      us(t, {
        url: n,
        imageDom: e,
        requestType: "image",
        responseType: "dataUrl"
      }).then((r) => {
        r && (e.dataset.originalSrc = n, e.href.baseVal = r || "");
      })
    ];
  }
  return [];
}
function Hu(e, t) {
  const { ownerDocument: n, svgDefsElement: r } = t, s = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!s)
    return [];
  const [o, i] = s.split("#");
  if (i) {
    const l = `#${i}`, c = t.shadowRoots.reduce(
      (u, f) => u ?? f.querySelector(`svg ${l}`),
      n == null ? void 0 : n.querySelector(`svg ${l}`)
    );
    if (o && e.setAttribute("href", l), r != null && r.querySelector(l))
      return [];
    if (c)
      return r == null || r.appendChild(c.cloneNode(!0)), [];
    if (o)
      return [
        us(t, {
          url: o,
          responseType: "text"
        }).then((u) => {
          r == null || r.insertAdjacentHTML("beforeend", u);
        })
      ];
  }
  return [];
}
function xl(e, t) {
  const { tasks: n } = t;
  Gt(e) && ((Br(e) || fl(e)) && n.push(...Uu(e, t)), Zf(e) && n.push(...Hu(e, t))), cs(e) && n.push(...Bu(e.style, t)), e.childNodes.forEach((r) => {
    xl(r, t);
  });
}
async function Vu(e, t) {
  const {
    ownerDocument: n,
    svgStyleElement: r,
    fontFamilies: s,
    fontCssTexts: o,
    tasks: i,
    font: l
  } = t;
  if (!(!n || !r || !s.size))
    if (l && l.cssText) {
      const c = Ri(l.cssText, t);
      r.appendChild(n.createTextNode(`${c}
`));
    } else {
      const c = Array.from(n.styleSheets).filter((f) => {
        try {
          return "cssRules" in f && !!f.cssRules.length;
        } catch (d) {
          return t.log.warn(`Error while reading CSS rules from ${f.href}`, d), !1;
        }
      });
      await Promise.all(
        c.flatMap((f) => Array.from(f.cssRules).map(async (d, v) => {
          if (Gf(d)) {
            let h = v + 1;
            const b = d.href;
            let _ = "";
            try {
              _ = await us(t, {
                url: b,
                requestType: "text",
                responseType: "text"
              });
            } catch (m) {
              t.log.warn(`Error fetch remote css import from ${b}`, m);
            }
            const p = _.replace(
              wl,
              (m, N, k) => m.replace(k, ul(k, b))
            );
            for (const m of Yu(p))
              try {
                f.insertRule(
                  m,
                  m.startsWith("@import") ? h += 1 : f.cssRules.length
                );
              } catch (N) {
                t.log.warn("Error inserting rule from remote css import", { rule: m, error: N });
              }
          }
        }))
      );
      const u = [];
      c.forEach((f) => {
        qo(f.cssRules, u);
      }), u.filter((f) => {
        var d;
        return Xf(f) && yl(f.style.getPropertyValue("src")) && ((d = vl(f.style.getPropertyValue("font-family"))) == null ? void 0 : d.some((v) => s.has(v)));
      }).forEach((f) => {
        const d = f, v = o.get(d.cssText);
        v ? r.appendChild(n.createTextNode(`${v}
`)) : i.push(
          _l(
            d.cssText,
            d.parentStyleSheet ? d.parentStyleSheet.href : null,
            t
          ).then((h) => {
            h = Ri(h, t), o.set(d.cssText, h), r.appendChild(n.createTextNode(`${h}
`));
          })
        );
      });
    }
}
const Wu = /(\/\*[\s\S]*?\*\/)/g, Ni = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Yu(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(Wu, "");
  for (; ; ) {
    const o = Ni.exec(n);
    if (!o)
      break;
    t.push(o[0]);
  }
  n = n.replace(Ni, "");
  const r = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, s = new RegExp(
    // eslint-disable-next-line
    "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
    "gi"
  );
  for (; ; ) {
    let o = r.exec(n);
    if (o)
      s.lastIndex = r.lastIndex;
    else if (o = s.exec(n), o)
      r.lastIndex = s.lastIndex;
    else
      break;
    t.push(o[0]);
  }
  return t;
}
const Ku = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Xu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Ri(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(Xu, (s) => {
    for (; ; ) {
      const [o, , i] = Ku.exec(s) || [];
      if (!i)
        return "";
      if (i === r)
        return `src: ${o};`;
    }
  }) : e;
}
function qo(e, t = []) {
  for (const n of Array.from(e))
    Jf(n) ? t.push(...qo(n.cssRules)) : "cssRules" in n ? qo(n.cssRules, t) : t.push(n);
  return t;
}
async function Gu(e, t) {
  const n = await pl(e, t);
  if (Gt(n.node) && ws(n.node))
    return n.node;
  const {
    ownerDocument: r,
    log: s,
    tasks: o,
    svgStyleElement: i,
    svgDefsElement: l,
    svgStyles: c,
    font: u,
    progress: f,
    autoDestruct: d,
    onCloneNode: v,
    onEmbedNode: h,
    onCreateForeignObjectSvg: b
  } = n;
  s.time("clone node");
  const _ = await ni(n.node, n, !0);
  if (i && r) {
    let M = "";
    c.forEach((I, F) => {
      M += `${I.join(`,
`)} {
  ${F}
}
`;
    }), i.appendChild(r.createTextNode(M));
  }
  s.timeEnd("clone node"), await (v == null ? void 0 : v(_)), u !== !1 && Gt(_) && (s.time("embed web font"), await Vu(_, n), s.timeEnd("embed web font")), s.time("embed node"), xl(_, n);
  const p = o.length;
  let m = 0;
  const N = async () => {
    for (; ; ) {
      const M = o.pop();
      if (!M)
        break;
      try {
        await M;
      } catch (I) {
        n.log.warn("Failed to run task", I);
      }
      f == null || f(++m, p);
    }
  };
  f == null || f(m, p), await Promise.all([...Array.from({ length: 4 })].map(N)), s.timeEnd("embed node"), await (h == null ? void 0 : h(_));
  const k = Ju(_, n);
  return l && k.insertBefore(l, k.children[0]), i && k.insertBefore(i, k.children[0]), d && Du(n), await (b == null ? void 0 : b(k)), k;
}
function Ju(e, t) {
  const { width: n, height: r } = t, s = uu(n, r, e.ownerDocument), o = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), s.appendChild(o), s;
}
async function kl(e, t) {
  var i;
  const n = await pl(e, t), r = await Gu(n), s = du(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = hl(n.ownerDocument), n.svgDefsElement = (i = n.ownerDocument) == null ? void 0 : i.createElementNS(co, "defs"), n.svgStyles.clear());
  const o = Cr(s, r.ownerDocument);
  return await yu(o, n);
}
const Zu = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function Qu(e) {
  try {
    const t = new URL(e, window.location.href);
    return t.origin === window.location.origin && t.pathname === window.location.pathname && !!t.hash;
  } catch {
    return !0;
  }
}
function El(e) {
  const t = window.fetch;
  return window.fetch = function(n, r) {
    const s = typeof n == "string" ? n : n instanceof URL ? n.toString() : n.url;
    return Qu(s) ? Promise.resolve(new Response("", { status: 200 })) : t.call(window, n, r);
  }, e().finally(() => {
    window.fetch = t;
  });
}
const Sl = {
  fetch: {
    placeholderImage: Zu
  },
  filter: (e) => {
    var t;
    return !(e instanceof HTMLElement && (e.tagName === "JAT-FEEDBACK" || (t = e.id) != null && t.startsWith("jat-feedback-")));
  }
};
async function $l() {
  return El(async () => (await kl(document.documentElement, {
    ...Sl,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8));
}
async function ed() {
  return El(async () => (await kl(document.documentElement, {
    ...Sl,
    scale: 0.5,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.6));
}
function td(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Ks(e, { delay: t = 0, duration: n = 400, easing: r = td, axis: s = "y" } = {}) {
  const o = getComputedStyle(e), i = +o.opacity, l = s === "y" ? "height" : "width", c = parseFloat(o[l]), u = s === "y" ? ["top", "bottom"] : ["left", "right"], f = u.map(
    (m) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${m[0].toUpperCase()}${m.slice(1)}`
    )
  ), d = parseFloat(o[`padding${f[0]}`]), v = parseFloat(o[`padding${f[1]}`]), h = parseFloat(o[`margin${f[0]}`]), b = parseFloat(o[`margin${f[1]}`]), _ = parseFloat(
    o[`border${f[0]}Width`]
  ), p = parseFloat(
    o[`border${f[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (m) => `overflow: hidden;opacity: ${Math.min(m * 20, 1) * i};${l}: ${m * c}px;padding-${u[0]}: ${m * d}px;padding-${u[1]}: ${m * v}px;margin-${u[0]}: ${m * h}px;margin-${u[1]}: ${m * b}px;border-${u[0]}-width: ${m * _}px;border-${u[1]}-width: ${m * p}px;min-${l}: 0`
  };
}
var nd = /* @__PURE__ */ j('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), rd = /* @__PURE__ */ j('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), sd = /* @__PURE__ */ j('<span class="more-badge svelte-1dhybq8"> </span>'), od = /* @__PURE__ */ j('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>');
const id = {
  hash: "svelte-1dhybq8",
  code: ".thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}"
};
function Cl(e, t) {
  hn(t, !0), Ln(e, id);
  let n = W(t, "screenshots", 23, () => []), r = W(t, "capturing", 7, !1), s = W(t, "oncapture", 7), o = W(t, "onremove", 7), i = W(t, "onedit", 7);
  var l = {
    get screenshots() {
      return n();
    },
    set screenshots(d = []) {
      n(d), H();
    },
    get capturing() {
      return r();
    },
    set capturing(d = !1) {
      r(d), H();
    },
    get oncapture() {
      return s();
    },
    set oncapture(d) {
      s(d), H();
    },
    get onremove() {
      return o();
    },
    set onremove(d) {
      o(d), H();
    },
    get onedit() {
      return i();
    },
    set onedit(d) {
      i(d), H();
    }
  }, c = $r(), u = ut(c);
  {
    var f = (d) => {
      var v = od(), h = x(v);
      We(h, 17, () => n().slice(-3), dt, (p, m, N) => {
        const k = /* @__PURE__ */ Yt(() => n().length > 3 ? n().length - 3 + N : N);
        var M = rd(), I = x(M);
        de(I, "alt", `Screenshot ${N + 1}`);
        var F = S(I, 2);
        {
          var X = (Z) => {
            var ae = nd();
            J("click", ae, () => i()(a(k))), $(Z, ae);
          };
          B(F, (Z) => {
            i() && Z(X);
          });
        }
        var z = S(F, 2);
        w(M), q(() => de(I, "src", a(m))), J("click", z, () => o()(a(k))), $(p, M);
      });
      var b = S(h, 2);
      {
        var _ = (p) => {
          var m = sd(), N = x(m);
          w(m), q(() => Y(N, `+${n().length - 3}`)), $(p, m);
        };
        B(b, (p) => {
          n().length > 3 && p(_);
        });
      }
      w(v), $(d, v);
    };
    B(u, (d) => {
      n().length > 0 && d(f);
    });
  }
  return $(e, c), gn(l);
}
ys(["click"]);
Pn(
  Cl,
  {
    screenshots: {},
    capturing: {},
    oncapture: {},
    onremove: {},
    onedit: {}
  },
  [],
  [],
  { mode: "open" }
);
var ad = /* @__PURE__ */ pr('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), ld = /* @__PURE__ */ pr('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), cd = /* @__PURE__ */ j('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), fd = /* @__PURE__ */ j("<button></button>"), ud = /* @__PURE__ */ j('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), dd = /* @__PURE__ */ j('<div class="loading svelte-yff65c">Loading image...</div>'), vd = /* @__PURE__ */ j('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), pd = /* @__PURE__ */ j('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const hd = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function Al(e, t) {
  hn(t, !0), Ln(e, hd);
  let n = W(t, "imageDataUrl", 7), r = W(t, "onsave", 7), s = W(t, "oncancel", 7), o = /* @__PURE__ */ L("arrow"), i = /* @__PURE__ */ L(Le(wi[0])), l = /* @__PURE__ */ L(Le([])), c = /* @__PURE__ */ L(void 0), u = /* @__PURE__ */ L(void 0), f = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), v = /* @__PURE__ */ L(!1), h = /* @__PURE__ */ L("idle"), b = { x: 0, y: 0 }, _ = [], p = /* @__PURE__ */ L(void 0), m = /* @__PURE__ */ L(Le(
    { x: 0, y: 0 }
    // canvas coords
  )), N = /* @__PURE__ */ L(Le({ left: "0px", top: "0px" })), k = /* @__PURE__ */ L("");
  Zo(() => {
    ki(!0);
    const E = new Image();
    E.onload = () => {
      y(f, E.naturalWidth, !0), y(d, E.naturalHeight, !0), y(v, !0), requestAnimationFrame(() => I(E));
    }, E.src = n();
  }), za(() => {
    ki(!1);
  });
  function M() {
    return new Promise((E, R) => {
      const D = new Image();
      D.onload = () => E(D), D.onerror = R, D.src = n();
    });
  }
  async function I(E) {
    if (!a(c)) return;
    const R = a(c).getContext("2d");
    R && (E || (E = await M()), a(c).width = a(f), a(c).height = a(d), R.drawImage(E, 0, 0, a(f), a(d)), nl(R, a(l)));
  }
  function F() {
    if (!a(u)) return;
    const E = a(u).getContext("2d");
    E && (a(u).width = a(f), a(u).height = a(d), E.clearRect(0, 0, a(f), a(d)));
  }
  function X(E) {
    if (!a(u)) return { x: 0, y: 0 };
    const R = a(u).getBoundingClientRect(), D = a(f) / R.width, A = a(d) / R.height;
    return {
      x: (E.clientX - R.left) * D,
      y: (E.clientY - R.top) * A
    };
  }
  function z(E) {
    if (!a(u)) return { left: "0px", top: "0px" };
    const R = a(u).getBoundingClientRect();
    return {
      left: `${R.left + E.x / (a(f) / R.width)}px`,
      top: `${R.top + E.y / (a(d) / R.height)}px`
    };
  }
  function Z(E) {
    const R = { color: a(i), strokeWidth: xi };
    switch (a(o)) {
      case "arrow":
        return {
          ...R,
          id: es(),
          type: "arrow",
          start: b,
          end: E
        };
      case "rectangle":
        return {
          ...R,
          id: es(),
          type: "rectangle",
          start: b,
          end: E
        };
      case "ellipse":
        return {
          ...R,
          id: es(),
          type: "ellipse",
          start: b,
          end: E
        };
      case "freehand":
        return {
          ...R,
          id: es(),
          type: "freehand",
          points: [..._, E]
        };
      default:
        return null;
    }
  }
  function ae(E) {
    if (a(h) === "typing") {
      Ne();
      return;
    }
    const R = X(E);
    if (a(o) === "text") {
      y(h, "typing"), y(m, R, !0), y(N, z(R), !0), y(k, ""), requestAnimationFrame(() => {
        var D;
        return (D = a(p)) == null ? void 0 : D.focus();
      });
      return;
    }
    y(h, "drawing"), b = R, _ = [R];
  }
  function me(E) {
    if (a(h) !== "drawing") return;
    const R = X(E);
    a(o) === "freehand" && _.push(R), F();
    const D = Z(R);
    if (D && a(u)) {
      const A = a(u).getContext("2d");
      A && tl(A, D);
    }
  }
  function xe(E) {
    if (a(h) !== "drawing") return;
    const R = X(E), D = Z(R);
    D && y(l, [...a(l), D], !0), y(h, "idle"), _ = [], F(), I();
  }
  function Ne() {
    if (a(k).trim()) {
      const E = {
        id: es(),
        type: "text",
        color: a(i),
        strokeWidth: xi,
        position: a(m),
        content: a(k).trim(),
        fontSize: 20
      };
      y(l, [...a(l), E], !0), I();
    }
    y(k, ""), y(h, "idle");
  }
  function Ee(E) {
    E.key === "Enter" ? (E.preventDefault(), Ne()) : E.key === "Escape" && (E.preventDefault(), y(k, ""), y(h, "idle"));
  }
  function Oe() {
    a(l).length !== 0 && (y(l, a(l).slice(0, -1), !0), I());
  }
  function Ge() {
    y(l, [], !0), I();
  }
  async function P() {
    if (a(l).length === 0) {
      r()(n());
      return;
    }
    const E = await Pf(n(), a(l), a(f), a(d));
    r()(E);
  }
  function ve() {
    s()();
  }
  function he(E) {
    E.key === "Escape" && a(h) !== "typing" && (E.stopPropagation(), ve()), (E.ctrlKey || E.metaKey) && E.key === "z" && (E.preventDefault(), Oe());
  }
  const Re = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, Se = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, ht = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var mn = {
    get imageDataUrl() {
      return n();
    },
    set imageDataUrl(E) {
      n(E), H();
    },
    get onsave() {
      return r();
    },
    set onsave(E) {
      r(E), H();
    },
    get oncancel() {
      return s();
    },
    set oncancel(E) {
      s(E), H();
    }
  }, bn = pd(), Dn = x(bn), Ot = x(Dn);
  We(Ot, 21, () => ht, dt, (E, R) => {
    var D = cd();
    let A;
    var Ue = x(D);
    {
      var gt = (mt) => {
        var Ft = ad();
        $(mt, Ft);
      }, Ct = (mt) => {
        var Ft = ld(), xn = x(Ft);
        w(Ft), q(() => de(xn, "d", Re[a(R)])), $(mt, Ft);
      };
      B(Ue, (mt) => {
        a(R) === "ellipse" ? mt(gt) : mt(Ct, !1);
      });
    }
    var wn = S(Ue, 2), gr = x(wn, !0);
    w(wn), w(D), q(() => {
      A = Ye(D, 1, "tool-btn svelte-yff65c", null, A, { active: a(o) === a(R) }), de(D, "title", Se[a(R)]), Y(gr, Se[a(R)]);
    }), J("click", D, () => {
      y(o, a(R), !0);
    }), $(E, D);
  }), w(Ot);
  var _n = S(Ot, 4);
  We(_n, 21, () => wi, dt, (E, R) => {
    var D = fd();
    let A;
    q(() => {
      A = Ye(D, 1, "color-swatch svelte-yff65c", null, A, { active: a(i) === a(R) }), ir(D, `background: ${a(R) ?? ""}; ${a(R) === "#111827" ? "border-color: #6b7280;" : ""}`), de(D, "title", a(R));
    }), J("click", D, () => {
      y(i, a(R), !0);
    }), $(E, D);
  }), w(_n);
  var yn = S(_n, 4), On = x(yn), qn = S(On, 2);
  w(yn);
  var hr = S(yn, 4), T = x(hr), ie = S(T, 2);
  w(hr), w(Dn);
  var $e = S(Dn, 2), qt = x($e);
  {
    var it = (E) => {
      var R = ud(), D = ut(R);
      os(D, (gt) => y(c, gt), () => a(c));
      var A = S(D, 2);
      let Ue;
      os(A, (gt) => y(u, gt), () => a(u)), q(() => {
        de(D, "width", a(f)), de(D, "height", a(d)), de(A, "width", a(f)), de(A, "height", a(d)), Ue = Ye(A, 1, "overlay-canvas svelte-yff65c", null, Ue, {
          "cursor-crosshair": a(o) !== "text",
          "cursor-text": a(o) === "text"
        });
      }), J("mousedown", A, ae), J("mousemove", A, me), J("mouseup", A, xe), $(E, R);
    }, qe = (E) => {
      var R = dd();
      $(E, R);
    };
    B(qt, (E) => {
      a(v) ? E(it) : E(qe, !1);
    });
  }
  w($e);
  var tn = S($e, 2);
  {
    var Vr = (E) => {
      var R = vd();
      Ha(R), os(R, (D) => y(p, D), () => a(p)), q(() => ir(R, `left: ${a(N).left ?? ""}; top: ${a(N).top ?? ""}; color: ${a(i) ?? ""};`)), J("keydown", R, Ee), Pa("blur", R, Ne), Vs(R, () => a(k), (D) => y(k, D)), $(E, R);
    };
    B(tn, (E) => {
      a(h) === "typing" && E(Vr);
    });
  }
  return w(bn), q(() => {
    On.disabled = a(l).length === 0, qn.disabled = a(l).length === 0;
  }), J("keydown", bn, he), J("click", On, Oe), J("click", qn, Ge), J("click", T, ve), J("click", ie, P), $(e, bn), gn(mn);
}
ys(["keydown", "click", "mousedown", "mousemove", "mouseup"]);
Pn(Al, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var gd = /* @__PURE__ */ j('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), md = /* @__PURE__ */ j('<div class="log-more svelte-x1hlqn"> </div>'), bd = /* @__PURE__ */ j('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const _d = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function Tl(e, t) {
  hn(t, !0), Ln(e, _d);
  let n = W(t, "logs", 23, () => []);
  const r = {
    error: "#ef4444",
    warn: "#f59e0b",
    info: "#3b82f6",
    log: "#9ca3af",
    debug: "#8b5cf6",
    trace: "#6b7280"
  };
  var s = {
    get logs() {
      return n();
    },
    set logs(c = []) {
      n(c), H();
    }
  }, o = $r(), i = ut(o);
  {
    var l = (c) => {
      var u = bd(), f = x(u), d = x(f);
      w(f);
      var v = S(f, 2), h = x(v);
      We(h, 17, () => n().slice(-10), dt, (p, m) => {
        var N = gd(), k = x(N), M = x(k, !0);
        w(k);
        var I = S(k, 2), F = x(I);
        w(I), w(N), q(
          (X) => {
            ir(k, `color: ${(r[a(m).type] || "#9ca3af") ?? ""}`), Y(M, a(m).type), Y(F, `${X ?? ""}${a(m).message.length > 120 ? "..." : ""}`);
          },
          [() => a(m).message.substring(0, 120)]
        ), $(p, N);
      });
      var b = S(h, 2);
      {
        var _ = (p) => {
          var m = md(), N = x(m);
          w(m), q(() => Y(N, `+${n().length - 10} more`)), $(p, m);
        };
        B(b, (p) => {
          n().length > 10 && p(_);
        });
      }
      w(v), w(u), q(() => Y(d, `Console Logs (${n().length ?? ""})`)), $(c, u);
    };
    B(i, (c) => {
      n().length > 0 && c(l);
    });
  }
  return $(e, o), gn(s);
}
Pn(Tl, { logs: {} }, [], [], { mode: "open" });
var yd = /* @__PURE__ */ pr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), wd = /* @__PURE__ */ pr('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), xd = /* @__PURE__ */ j('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const kd = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function Nl(e, t) {
  hn(t, !0), Ln(e, kd);
  let n = W(t, "message", 7), r = W(t, "type", 7, "success"), s = W(t, "visible", 7, !1);
  var o = {
    get message() {
      return n();
    },
    set message(u) {
      n(u), H();
    },
    get type() {
      return r();
    },
    set type(u = "success") {
      r(u), H();
    },
    get visible() {
      return s();
    },
    set visible(u = !1) {
      s(u), H();
    }
  }, i = $r(), l = ut(i);
  {
    var c = (u) => {
      var f = xd();
      let d;
      var v = x(f), h = x(v);
      {
        var b = (N) => {
          var k = yd();
          $(N, k);
        }, _ = (N) => {
          var k = wd();
          $(N, k);
        };
        B(h, (N) => {
          r() === "success" ? N(b) : N(_, !1);
        });
      }
      w(v);
      var p = S(v, 2), m = x(p, !0);
      w(p), w(f), q(() => {
        d = Ye(f, 1, "jat-toast svelte-1f5s7q1", null, d, { error: r() === "error", success: r() === "success" }), Y(m, n());
      }), $(u, f);
    };
    B(l, (u) => {
      s() && u(c);
    });
  }
  return $(e, i), gn(o);
}
Pn(Nl, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Ed = /* @__PURE__ */ j('<span class="subtab-count svelte-1fnmin5"> </span>'), Sd = /* @__PURE__ */ j('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), $d = /* @__PURE__ */ j('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Cd = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Ad = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Td = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), Nd = /* @__PURE__ */ j('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Rd = /* @__PURE__ */ j('<p class="revision-note svelte-1fnmin5"> </p>'), jd = /* @__PURE__ */ j('<li class="svelte-1fnmin5"> </li>'), Id = /* @__PURE__ */ j('<ul class="thread-summary svelte-1fnmin5"></ul>'), Md = /* @__PURE__ */ j('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Ld = /* @__PURE__ */ j('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Pd = /* @__PURE__ */ j('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Dd = /* @__PURE__ */ j('<span class="element-badge svelte-1fnmin5"> </span>'), Od = /* @__PURE__ */ j('<div class="thread-elements svelte-1fnmin5"></div>'), qd = /* @__PURE__ */ j('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"> </p> <!> <!> <!></div>'), Fd = /* @__PURE__ */ j('<div class="thread svelte-1fnmin5"></div>'), zd = /* @__PURE__ */ j('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), Bd = /* @__PURE__ */ j('<p class="report-desc svelte-1fnmin5"> </p>'), Ud = /* @__PURE__ */ j('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Hd = /* @__PURE__ */ j('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Vd = /* @__PURE__ */ j('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), Wd = /* @__PURE__ */ j('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), Yd = /* @__PURE__ */ j('<span class="status-pill accepted svelte-1fnmin5"></span>'), Kd = /* @__PURE__ */ j('<span class="status-pill rejected svelte-1fnmin5"></span>'), Xd = /* @__PURE__ */ j('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), Gd = /* @__PURE__ */ j('<div class="reject-preview-strip svelte-1fnmin5"></div>'), Jd = /* @__PURE__ */ j('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), Zd = /* @__PURE__ */ j('<div class="reject-element-strip svelte-1fnmin5"></div>'), Qd = /* @__PURE__ */ j('<span class="char-hint svelte-1fnmin5"> </span>'), ev = /* @__PURE__ */ j('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), tv = /* @__PURE__ */ j('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), nv = /* @__PURE__ */ j('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), rv = /* @__PURE__ */ j('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), sv = /* @__PURE__ */ j('<div class="reports svelte-1fnmin5"></div>'), ov = /* @__PURE__ */ j("<div><!></div>"), iv = /* @__PURE__ */ j('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const av = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {display:flex;flex-direction:column;overflow:hidden;}

  /* Subtabs */.subtabs.svelte-1fnmin5 {display:flex;border-bottom:1px solid #1f2937;padding:0 12px;flex-shrink:0;}.subtab.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:8px 10px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;text-transform:uppercase;letter-spacing:0.3px;}.subtab.svelte-1fnmin5:hover {color:#d1d5db;}.subtab.active.svelte-1fnmin5 {color:#f9fafb;border-bottom-color:#3b82f6;}.subtab-count.svelte-1fnmin5 {display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:#374151;color:#d1d5db;font-size:9px;font-weight:700;line-height:1;}.subtab.active.svelte-1fnmin5 .subtab-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.subtab-count.done-count.svelte-1fnmin5 {background:#10b98130;color:#34d399;}.subtab.active.svelte-1fnmin5 .subtab-count.done-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.request-scroll.svelte-1fnmin5 {padding:10px 12px;overflow-y:auto;flex:1;min-height:0;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:6px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;transition:border-color 0.15s;overflow:hidden;}.report-card.awaiting.svelte-1fnmin5 {border-color:#f59e0b40;box-shadow:0 0 0 1px #f59e0b20;}.report-card.expanded.svelte-1fnmin5 {border-color:#4b556380;}

  /* Collapsed card header (clickable toggle) */.card-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;width:100%;padding:9px 10px;background:none;border:none;cursor:pointer;font-family:inherit;text-align:left;color:inherit;}.card-toggle.svelte-1fnmin5:hover {background:#ffffff06;}.report-type.svelte-1fnmin5 {font-size:13px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:12px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 6px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.chevron.svelte-1fnmin5 {flex-shrink:0;color:#6b7280;transition:transform 0.15s;}.chevron-open.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Expanded card body */.card-body.svelte-1fnmin5 {padding:0 10px 10px;border-top:1px solid #ffffff08;}.report-url.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin:6px 0 0;font-size:11px;color:#60a5fa;text-decoration:none;overflow:hidden;transition:color 0.15s;}.report-url.svelte-1fnmin5:hover {color:#93c5fd;}.report-url.svelte-1fnmin5 svg:where(.svelte-1fnmin5) {flex-shrink:0;}.report-url.svelte-1fnmin5 span:where(.svelte-1fnmin5) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.screenshot-thumb.svelte-1fnmin5 {flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;background:#111827;cursor:pointer;padding:0;transition:border-color 0.15s;}.screenshot-thumb.svelte-1fnmin5:hover {border-color:#60a5fa;}.screenshot-thumb.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.screenshot-expanded.svelte-1fnmin5 {position:relative;margin-top:4px;border-radius:6px;overflow:hidden;border:1px solid #374151;}.screenshot-expanded.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;display:block;border-radius:5px;}.screenshot-close.svelte-1fnmin5 {position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;}.screenshot-close.svelte-1fnmin5:hover {background:rgba(0,0,0,0.9);}.revision-note.svelte-1fnmin5 {font-size:10px;color:#f59e0b;margin:3px 0 0;font-weight:500;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}

  /* Thread toggle button */.thread-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin-top:6px;padding:3px 6px;background:none;border:none;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;border-radius:4px;transition:color 0.15s, background 0.15s;}.thread-toggle.svelte-1fnmin5:hover {color:#d1d5db;background:#111827;}.thread-toggle-icon.svelte-1fnmin5 {transition:transform 0.15s;}.thread-toggle-icon.expanded.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Thread container */.thread.svelte-1fnmin5 {margin-top:6px;display:flex;flex-direction:column;gap:4px;}.thread-entry.svelte-1fnmin5 {padding:6px 8px;border-radius:5px;font-size:12px;border-left:2px solid;}.thread-user.svelte-1fnmin5 {background:#111827;border-left-color:#6b7280;}.thread-dev.svelte-1fnmin5 {background:#0f172a;border-left-color:#3b82f6;}.thread-entry-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;margin-bottom:3px;}.thread-from.svelte-1fnmin5 {font-weight:600;font-size:11px;color:#d1d5db;}.thread-type-badge.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.3px;}.thread-type-badge.submission.svelte-1fnmin5 {background:#6b728020;color:#9ca3af;}.thread-type-badge.completion.svelte-1fnmin5 {background:#3b82f620;color:#60a5fa;}.thread-type-badge.rejection.svelte-1fnmin5 {background:#ef444420;color:#f87171;}.thread-type-badge.acceptance.svelte-1fnmin5 {background:#10b98120;color:#34d399;}.thread-time.svelte-1fnmin5 {font-size:10px;color:#4b5563;margin-left:auto;}.thread-message.svelte-1fnmin5 {color:#d1d5db;line-height:1.4;margin:0;white-space:pre-wrap;word-break:break-word;}.thread-summary.svelte-1fnmin5 {margin:4px 0 0 0;padding:0 0 0 16px;font-size:11px;color:#9ca3af;}.thread-summary.svelte-1fnmin5 li:where(.svelte-1fnmin5) {margin:1px 0;}.thread-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:4px;}.thread-elements.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:4px;}.element-badge.svelte-1fnmin5 {font-size:10px;font-family:'SF Mono', 'Fira Code', 'Consolas', monospace;padding:1px 5px;background:#1e293b;border:1px solid #334155;border-radius:3px;color:#94a3b8;}.element-badge.removable.svelte-1fnmin5 {display:inline-flex;align-items:center;gap:3px;}.element-remove.svelte-1fnmin5 {background:none;border:none;color:#6b7280;cursor:pointer;padding:0;font-size:12px;line-height:1;}.element-remove.svelte-1fnmin5:hover {color:#ef4444;}

  /* Enhanced rejection form */.reject-attachments.svelte-1fnmin5 {display:flex;gap:6px;margin-top:6px;}.attach-btn.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:3px 8px;background:#111827;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:border-color 0.15s, color 0.15s;}.attach-btn.svelte-1fnmin5:hover:not(:disabled) {border-color:#60a5fa;color:#d1d5db;}.attach-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-preview-strip.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.reject-preview-item.svelte-1fnmin5 {position:relative;flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;}.reject-preview-item.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.reject-preview-remove.svelte-1fnmin5 {position:absolute;top:1px;right:1px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center;}.reject-preview-remove.svelte-1fnmin5:hover {background:#ef4444;}.reject-element-strip.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.status-pill.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.status-pill.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.status-pill.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function Rl(e, t) {
  hn(t, !0), Ln(e, av);
  let n = W(t, "endpoint", 7), r = W(t, "reports", 31, () => Le([])), s = W(t, "loading", 7), o = W(t, "error", 7), i = W(t, "onreload", 7), l = /* @__PURE__ */ L(null), c = /* @__PURE__ */ L(null), u = /* @__PURE__ */ L(null), f = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(""), v = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(Le([])), b = /* @__PURE__ */ L(Le([])), _ = /* @__PURE__ */ L(!1), p = /* @__PURE__ */ L("active"), m = /* @__PURE__ */ Yt(() => a(p) === "active" ? r().filter((T) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(T.status)) : r().filter((T) => T.status === "accepted" || T.status === "closed")), N = /* @__PURE__ */ Yt(() => r().filter((T) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(T.status)).length), k = /* @__PURE__ */ Yt(() => r().filter((T) => T.status === "accepted" || T.status === "closed").length);
  function M(T) {
    y(u, a(u) === T ? null : T, !0), a(u) !== T && (a(c) === T && y(c, null), y(l, null));
  }
  function I(T) {
    y(d, T, !0), y(v, ""), y(h, [], !0), y(b, [], !0);
  }
  function F() {
    y(d, ""), y(v, ""), y(h, [], !0), y(b, [], !0);
  }
  async function X() {
    if (!a(_)) {
      y(_, !0);
      try {
        const T = await $l();
        y(h, [...a(h), T], !0);
      } catch (T) {
        console.error("Screenshot capture failed:", T);
      }
      y(_, !1);
    }
  }
  function z(T) {
    y(h, a(h).filter((ie, $e) => $e !== T), !0);
  }
  function Z() {
    Za((T) => {
      y(
        b,
        [
          ...a(b),
          {
            tagName: T.tagName,
            className: T.className,
            id: T.id,
            selector: T.selector,
            textContent: T.textContent
          }
        ],
        !0
      );
    });
  }
  function ae(T) {
    y(b, a(b).filter((ie, $e) => $e !== T), !0);
  }
  async function me(T, ie, $e) {
    y(f, T, !0);
    const qt = ie === "rejected" ? {
      screenshots: a(h).length > 0 ? a(h) : void 0,
      elements: a(b).length > 0 ? a(b) : void 0
    } : void 0;
    (await Of(n(), T, ie, $e, qt)).ok ? (r(r().map((qe) => qe.id === T ? {
      ...qe,
      status: ie === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...ie === "rejected" ? { revision_count: (qe.revision_count || 0) + 1 } : {}
    } : qe)), y(d, ""), y(v, ""), y(h, [], !0), y(b, [], !0), i()()) : y(d, ""), y(f, "");
  }
  function xe(T) {
    y(c, a(c) === T ? null : T, !0);
  }
  function Ne(T) {
    return T ? T.length : 0;
  }
  function Ee(T) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[T.type] || T.type;
  }
  function Oe(T) {
    return {
      submitted: "Submitted",
      in_progress: "Working On It",
      completed: "Ready for Review",
      accepted: "Done",
      rejected: "Revising",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[T] || T;
  }
  function Ge(T) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#f59e0b",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[T] || "#6b7280";
  }
  function P(T) {
    return T === "bug" ? "🐛" : T === "enhancement" ? "✨" : "📝";
  }
  function ve(T) {
    const ie = Date.now(), $e = new Date(T).getTime(), qt = ie - $e, it = Math.floor(qt / 6e4);
    if (it < 1) return "just now";
    if (it < 60) return `${it}m ago`;
    const qe = Math.floor(it / 60);
    if (qe < 24) return `${qe}h ago`;
    const tn = Math.floor(qe / 24);
    return tn < 30 ? `${tn}d ago` : new Date(T).toLocaleDateString();
  }
  var he = {
    get endpoint() {
      return n();
    },
    set endpoint(T) {
      n(T), H();
    },
    get reports() {
      return r();
    },
    set reports(T = []) {
      r(T), H();
    },
    get loading() {
      return s();
    },
    set loading(T) {
      s(T), H();
    },
    get error() {
      return o();
    },
    set error(T) {
      o(T), H();
    },
    get onreload() {
      return i();
    },
    set onreload(T) {
      i(T), H();
    }
  }, Re = iv(), Se = x(Re), ht = x(Se);
  let mn;
  var bn = S(x(ht));
  {
    var Dn = (T) => {
      var ie = Ed(), $e = x(ie, !0);
      w(ie), q(() => Y($e, a(N))), $(T, ie);
    };
    B(bn, (T) => {
      a(N) > 0 && T(Dn);
    });
  }
  w(ht);
  var Ot = S(ht, 2);
  let _n;
  var yn = S(x(Ot));
  {
    var On = (T) => {
      var ie = Sd(), $e = x(ie, !0);
      w(ie), q(() => Y($e, a(k))), $(T, ie);
    };
    B(yn, (T) => {
      a(k) > 0 && T(On);
    });
  }
  w(Ot), w(Se);
  var qn = S(Se, 2), hr = x(qn);
  return Xc(hr, () => a(p), (T) => {
    var ie = ov(), $e = x(ie);
    {
      var qt = (E) => {
        var R = $d();
        $(E, R);
      }, it = (E) => {
        var R = Cd(), D = x(R), A = x(D, !0);
        w(D);
        var Ue = S(D, 2);
        w(R), q(() => Y(A, o())), J("click", Ue, function(...gt) {
          var Ct;
          (Ct = i()) == null || Ct.apply(this, gt);
        }), $(E, R);
      }, qe = (E) => {
        var R = Ad(), D = x(R);
        D.textContent = "📋", Fs(4), w(R), $(E, R);
      }, tn = (E) => {
        var R = Td(), D = x(R), A = x(D, !0);
        w(D), w(R), q(() => Y(A, a(p) === "submitted" ? "No submitted requests" : a(p) === "review" ? "Nothing to review right now" : "No completed requests yet")), $(E, R);
      }, Vr = (E) => {
        var R = sv();
        We(R, 21, () => a(m), (D) => D.id, (D, A) => {
          var Ue = rv();
          let gt;
          var Ct = x(Ue), wn = x(Ct), gr = x(wn, !0);
          w(wn);
          var mt = S(wn, 2), Ft = x(mt, !0);
          w(mt);
          var xn = S(mt, 2), xs = x(xn, !0);
          w(xn);
          var ks = S(xn, 2);
          let Es;
          w(Ct);
          var fo = S(Ct, 2);
          {
            var uo = (C) => {
              var U = nv(), ge = x(U);
              {
                var Fe = (ne) => {
                  var se = Nd(), pe = S(x(se), 2), Je = x(pe, !0);
                  w(pe), w(se), q(
                    (At) => {
                      de(se, "href", a(A).page_url), Y(Je, At);
                    },
                    [
                      () => a(A).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), $(ne, se);
                };
                B(ge, (ne) => {
                  a(A).page_url && ne(Fe);
                });
              }
              var kn = S(ge, 2);
              {
                var Wr = (ne) => {
                  var se = Rd(), pe = x(se);
                  w(se), q(() => Y(pe, `Revision ${a(A).revision_count ?? ""}`)), $(ne, se);
                };
                B(kn, (ne) => {
                  a(A).revision_count > 0 && a(A).status !== "accepted" && ne(Wr);
                });
              }
              var mr = S(kn, 2);
              {
                var Yr = (ne) => {
                  var se = zd(), pe = ut(se), Je = x(pe);
                  let At;
                  var Ze = S(Je, 2), je = x(Ze);
                  w(Ze), w(pe);
                  var be = S(pe, 2);
                  {
                    var ze = (le) => {
                      var Qe = Fd();
                      We(Qe, 21, () => a(A).thread, (Fn) => Fn.id, (Fn, ue) => {
                        var Sn = qd();
                        let O;
                        var Q = x(Sn), ce = x(Q), Ce = x(ce, !0);
                        w(ce);
                        var fe = S(ce, 2);
                        let Be;
                        var Tt = x(fe, !0);
                        w(fe);
                        var xr = S(fe, 2), zn = x(xr, !0);
                        w(xr), w(Q);
                        var _e = S(Q, 2), He = x(_e, !0);
                        w(_e);
                        var et = S(_e, 2);
                        {
                          var at = (Ve) => {
                            var bt = Id();
                            We(bt, 21, () => a(ue).summary, dt, (Un, zt) => {
                              var Bt = jd(), rn = x(Bt, !0);
                              w(Bt), q(() => Y(rn, a(zt))), $(Un, Bt);
                            }), w(bt), $(Ve, bt);
                          };
                          B(et, (Ve) => {
                            a(ue).summary && a(ue).summary.length > 0 && Ve(at);
                          });
                        }
                        var Bn = S(et, 2);
                        {
                          var nn = (Ve) => {
                            var bt = Pd(), Un = ut(bt);
                            We(Un, 21, () => a(ue).screenshots, dt, (rn, Cn, Hn) => {
                              var Ss = $r(), mo = ut(Ss);
                              {
                                var Vn = (Wn) => {
                                  var An = Md();
                                  de(An, "aria-label", `Screenshot ${Hn + 1}`);
                                  var $s = x(An);
                                  de($s, "alt", `Screenshot ${Hn + 1}`), w(An), q(() => de($s, "src", `${n() ?? ""}${a(Cn).url ?? ""}`)), J("click", An, () => y(l, a(l) === a(Cn).url ? null : a(Cn).url, !0)), $(Wn, An);
                                };
                                B(mo, (Wn) => {
                                  a(Cn).url && Wn(Vn);
                                });
                              }
                              $(rn, Ss);
                            }), w(Un);
                            var zt = S(Un, 2);
                            {
                              var Bt = (rn) => {
                                const Cn = /* @__PURE__ */ Yt(() => a(ue).screenshots.find((Vn) => Vn.url === a(l)));
                                var Hn = $r(), Ss = ut(Hn);
                                {
                                  var mo = (Vn) => {
                                    var Wn = Ld(), An = x(Wn), $s = S(An, 2);
                                    w(Wn), q(() => de(An, "src", `${n() ?? ""}${a(l) ?? ""}`)), J("click", $s, () => y(l, null)), $(Vn, Wn);
                                  };
                                  B(Ss, (Vn) => {
                                    a(Cn) && Vn(mo);
                                  });
                                }
                                $(rn, Hn);
                              };
                              B(zt, (rn) => {
                                a(l) && rn(Bt);
                              });
                            }
                            $(Ve, bt);
                          };
                          B(Bn, (Ve) => {
                            a(ue).screenshots && a(ue).screenshots.length > 0 && Ve(nn);
                          });
                        }
                        var $n = S(Bn, 2);
                        {
                          var Jr = (Ve) => {
                            var bt = Od();
                            We(bt, 21, () => a(ue).elements, dt, (Un, zt) => {
                              var Bt = Dd(), rn = x(Bt);
                              w(Bt), q(
                                (Cn, Hn) => {
                                  de(Bt, "title", a(zt).selector), Y(rn, `<${Cn ?? ""}${a(zt).id ? `#${a(zt).id}` : ""}${Hn ?? ""}>`);
                                },
                                [
                                  () => a(zt).tagName.toLowerCase(),
                                  () => a(zt).className ? `.${a(zt).className.split(" ")[0]}` : ""
                                ]
                              ), $(Un, Bt);
                            }), w(bt), $(Ve, bt);
                          };
                          B($n, (Ve) => {
                            a(ue).elements && a(ue).elements.length > 0 && Ve(Jr);
                          });
                        }
                        w(Sn), q(
                          (Ve, bt) => {
                            O = Ye(Sn, 1, "thread-entry svelte-1fnmin5", null, O, {
                              "thread-user": a(ue).from === "user",
                              "thread-dev": a(ue).from === "dev"
                            }), Y(Ce, a(ue).from === "user" ? "You" : "Dev"), Be = Ye(fe, 1, "thread-type-badge svelte-1fnmin5", null, Be, {
                              submission: a(ue).type === "submission",
                              completion: a(ue).type === "completion",
                              rejection: a(ue).type === "rejection",
                              acceptance: a(ue).type === "acceptance"
                            }), Y(Tt, Ve), Y(zn, bt), Y(He, a(ue).message);
                          },
                          [
                            () => Ee(a(ue)),
                            () => ve(a(ue).at)
                          ]
                        ), $(Fn, Sn);
                      }), w(Qe), $(le, Qe);
                    };
                    B(be, (le) => {
                      a(c) === a(A).id && le(ze);
                    });
                  }
                  q(
                    (le, Qe) => {
                      At = Ye(Je, 0, "thread-toggle-icon svelte-1fnmin5", null, At, { expanded: a(c) === a(A).id }), Y(je, `${le ?? ""} ${Qe ?? ""}`);
                    },
                    [
                      () => Ne(a(A).thread),
                      () => Ne(a(A).thread) === 1 ? "message" : "messages"
                    ]
                  ), J("click", pe, () => xe(a(A).id)), $(ne, se);
                }, br = (ne) => {
                  var se = Bd(), pe = x(se, !0);
                  w(se), q((Je) => Y(pe, Je), [
                    () => a(A).description.length > 120 ? a(A).description.slice(0, 120) + "..." : a(A).description
                  ]), $(ne, se);
                };
                B(mr, (ne) => {
                  a(A).thread && a(A).thread.length > 0 ? ne(Yr) : a(A).description && ne(br, 1);
                });
              }
              var Kr = S(mr, 2);
              {
                var _r = (ne) => {
                  var se = Vd(), pe = ut(se);
                  We(pe, 21, () => a(A).screenshot_urls, dt, (je, be, ze) => {
                    var le = Ud();
                    de(le, "aria-label", `Screenshot ${ze + 1}`);
                    var Qe = x(le);
                    de(Qe, "alt", `Screenshot ${ze + 1}`), w(le), q(() => de(Qe, "src", `${n() ?? ""}${a(be) ?? ""}`)), J("click", le, () => y(l, a(l) === a(be) ? null : a(be), !0)), $(je, le);
                  }), w(pe);
                  var Je = S(pe, 2);
                  {
                    var At = (je) => {
                      var be = Hd(), ze = x(be), le = S(ze, 2);
                      w(be), q(() => de(ze, "src", `${n() ?? ""}${a(l) ?? ""}`)), J("click", le, () => y(l, null)), $(je, be);
                    }, Ze = /* @__PURE__ */ Yt(() => a(l) && a(A).screenshot_urls.includes(a(l)));
                    B(Je, (je) => {
                      a(Ze) && je(At);
                    });
                  }
                  $(ne, se);
                };
                B(Kr, (ne) => {
                  !a(A).thread && a(A).screenshot_urls && a(A).screenshot_urls.length > 0 && ne(_r);
                });
              }
              var yr = S(Kr, 2);
              {
                var Xr = (ne) => {
                  var se = Wd(), pe = S(x(se), 2), Je = x(pe, !0);
                  w(pe), w(se), q(() => Y(Je, a(A).dev_notes)), $(ne, se);
                };
                B(yr, (ne) => {
                  a(A).dev_notes && !a(A).thread && a(A).status !== "in_progress" && ne(Xr);
                });
              }
              var En = S(yr, 2), Gr = x(En), vo = x(Gr, !0);
              w(Gr);
              var po = S(Gr, 2);
              {
                var wr = (ne) => {
                  var se = Yd();
                  se.textContent = "✓ Accepted", $(ne, se);
                }, ho = (ne) => {
                  var se = Kd();
                  se.textContent = "✗ Rejected", $(ne, se);
                }, go = (ne) => {
                  var se = $r(), pe = ut(se);
                  {
                    var Je = (Ze) => {
                      var je = ev(), be = x(je);
                      _a(be);
                      var ze = S(be, 2), le = x(ze), Qe = S(x(le));
                      w(le);
                      var Fn = S(le, 2);
                      w(ze);
                      var ue = S(ze, 2);
                      {
                        var Sn = (_e) => {
                          var He = Gd();
                          We(He, 21, () => a(h), dt, (et, at, Bn) => {
                            var nn = Xd(), $n = x(nn);
                            de($n, "alt", `Screenshot ${Bn + 1}`);
                            var Jr = S($n, 2);
                            w(nn), q(() => de($n, "src", a(at))), J("click", Jr, () => z(Bn)), $(et, nn);
                          }), w(He), $(_e, He);
                        };
                        B(ue, (_e) => {
                          a(h).length > 0 && _e(Sn);
                        });
                      }
                      var O = S(ue, 2);
                      {
                        var Q = (_e) => {
                          var He = Zd();
                          We(He, 21, () => a(b), dt, (et, at, Bn) => {
                            var nn = Jd(), $n = x(nn), Jr = S($n);
                            w(nn), q((Ve) => Y($n, `<${Ve ?? ""}${a(at).id ? `#${a(at).id}` : ""}> `), [() => a(at).tagName.toLowerCase()]), J("click", Jr, () => ae(Bn)), $(et, nn);
                          }), w(He), $(_e, He);
                        };
                        B(O, (_e) => {
                          a(b).length > 0 && _e(Q);
                        });
                      }
                      var ce = S(O, 2), Ce = x(ce), fe = S(Ce, 2), Be = x(fe, !0);
                      w(fe), w(ce);
                      var Tt = S(ce, 2);
                      {
                        var xr = (_e) => {
                          var He = Qd(), et = x(He);
                          w(He), q((at) => Y(et, `${at ?? ""} more characters needed`), [() => 10 - a(v).trim().length]), $(_e, He);
                        }, zn = /* @__PURE__ */ Yt(() => a(v).trim().length > 0 && a(v).trim().length < 10);
                        B(Tt, (_e) => {
                          a(zn) && _e(xr);
                        });
                      }
                      w(je), q(
                        (_e) => {
                          le.disabled = a(_), Y(Qe, ` ${a(_) ? "..." : "Screenshot"}`), fe.disabled = _e, Y(Be, a(f) === a(A).id ? "..." : "✗ Reject");
                        },
                        [
                          () => a(v).trim().length < 10 || a(f) === a(A).id
                        ]
                      ), Vs(be, () => a(v), (_e) => y(v, _e)), J("click", le, X), J("click", Fn, Z), J("click", Ce, F), J("click", fe, () => me(a(A).id, "rejected", a(v).trim())), $(Ze, je);
                    }, At = (Ze) => {
                      var je = tv(), be = x(je), ze = x(be, !0);
                      w(be);
                      var le = S(be, 2);
                      le.textContent = "✗ Reject", w(je), q(() => {
                        be.disabled = a(f) === a(A).id, Y(ze, a(f) === a(A).id ? "..." : "✓ Accept"), le.disabled = a(f) === a(A).id;
                      }), J("click", be, () => me(a(A).id, "accepted")), J("click", le, () => I(a(A).id)), $(Ze, je);
                    };
                    B(pe, (Ze) => {
                      a(d) === a(A).id ? Ze(Je) : Ze(At, !1);
                    });
                  }
                  $(ne, se);
                };
                B(po, (ne) => {
                  a(A).status === "accepted" ? ne(wr) : a(A).status === "rejected" ? ne(ho, 1) : (a(A).status === "completed" || a(A).status === "wontfix") && ne(go, 2);
                });
              }
              w(En), w(U), q((ne) => Y(vo, ne), [() => ve(a(A).created_at)]), Hs(3, U, () => Ks, () => ({ duration: 200 })), $(C, U);
            };
            B(fo, (C) => {
              a(u) === a(A).id && C(uo);
            });
          }
          w(Ue), q(
            (C, U, ge, Fe, kn) => {
              gt = Ye(Ue, 1, "report-card svelte-1fnmin5", null, gt, {
                awaiting: a(A).status === "completed",
                expanded: a(u) === a(A).id
              }), Y(gr, C), Y(Ft, a(A).title), ir(xn, `background: ${U ?? ""}20; color: ${ge ?? ""}; border-color: ${Fe ?? ""}40;`), Y(xs, kn), Es = Ye(ks, 0, "chevron svelte-1fnmin5", null, Es, { "chevron-open": a(u) === a(A).id });
            },
            [
              () => P(a(A).type),
              () => Ge(a(A).status),
              () => Ge(a(A).status),
              () => Ge(a(A).status),
              () => Oe(a(A).status)
            ]
          ), J("click", Ct, () => M(a(A).id)), $(D, Ue);
        }), w(R), $(E, R);
      };
      B($e, (E) => {
        s() ? E(qt) : o() && r().length === 0 ? E(it, 1) : r().length === 0 ? E(qe, 2) : a(m).length === 0 ? E(tn, 3) : E(Vr, !1);
      });
    }
    w(ie), Hs(3, ie, () => Ks, () => ({ duration: 200 })), $(T, ie);
  }), w(qn), w(Re), q(() => {
    mn = Ye(ht, 1, "subtab svelte-1fnmin5", null, mn, { active: a(p) === "active" }), _n = Ye(Ot, 1, "subtab svelte-1fnmin5", null, _n, { active: a(p) === "done" });
  }), J("click", ht, () => y(p, "active")), J("click", Ot, () => y(p, "done")), $(e, Re), gn(he);
}
ys(["click"]);
Pn(
  Rl,
  {
    endpoint: {},
    reports: {},
    loading: {},
    error: {},
    onreload: {}
  },
  [],
  [],
  { mode: "open" }
);
var lv = /* @__PURE__ */ j('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), cv = /* @__PURE__ */ j('<span class="tab-badge svelte-nv4d5v"> </span>'), fv = /* @__PURE__ */ j("<option> </option>"), uv = /* @__PURE__ */ j("<option> </option>"), dv = /* @__PURE__ */ j('<span class="capture-spinner svelte-nv4d5v"></span> Capturing...', 1), vv = /* @__PURE__ */ j('<span class="tool-count svelte-nv4d5v"> </span>'), pv = /* @__PURE__ */ pr('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot<!>', 1), hv = /* @__PURE__ */ j('<span class="tool-count svelte-nv4d5v"> </span>'), gv = /* @__PURE__ */ j("Pick Element<!>", 1), mv = /* @__PURE__ */ j('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), bv = /* @__PURE__ */ j('<div class="elements-list svelte-nv4d5v"></div>'), _v = /* @__PURE__ */ j('<div class="attach-summary svelte-nv4d5v"> </div>'), yv = /* @__PURE__ */ j('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), wv = /* @__PURE__ */ j('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><div class="tool-buttons svelte-nv4d5v"><button type="button" class="tool-btn svelte-nv4d5v"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), xv = /* @__PURE__ */ j("<div><!></div>"), kv = /* @__PURE__ */ j('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!> <div class="panel-version svelte-nv4d5v"> </div></div> <!>', 1);
const Ev = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-buttons.svelte-nv4d5v {display:flex;gap:6px;}.tool-buttons.svelte-nv4d5v .tool-btn:where(.svelte-nv4d5v) {flex:1;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.tool-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.capture-spinner.svelte-nv4d5v {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-capture-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-capture-spin {
    to { transform: rotate(360deg); }
  }.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }.panel-version.svelte-nv4d5v {padding:4px 10px 6px;font-size:10px;color:#4b5563;line-height:1;}`
};
function jl(e, t) {
  hn(t, !0), Ln(e, Ev);
  const n = "1.6.2";
  let r = W(t, "endpoint", 7), s = W(t, "project", 7), o = W(t, "isOpen", 7, !1), i = W(t, "userId", 7, ""), l = W(t, "userEmail", 7, ""), c = W(t, "userName", 7, ""), u = W(t, "userRole", 7, ""), f = W(t, "orgId", 7, ""), d = W(t, "orgName", 7, ""), v = W(t, "onclose", 7), h = W(t, "ongrip", 7), b = /* @__PURE__ */ L("new"), _ = /* @__PURE__ */ L(Le([])), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L(""), N = /* @__PURE__ */ Yt(() => a(_).filter((C) => C.status === "completed").length);
  async function k() {
    y(p, !0), y(m, "");
    const C = await Df(r());
    y(_, C.reports, !0), C.error && y(m, C.error, !0), y(p, !1);
  }
  js(() => {
    r() && k();
  });
  let M = /* @__PURE__ */ L(""), I = /* @__PURE__ */ L(""), F = /* @__PURE__ */ L("bug"), X = /* @__PURE__ */ L("medium"), z = /* @__PURE__ */ L(Le([])), Z = /* @__PURE__ */ L(Le([])), ae = /* @__PURE__ */ L(Le([])), me = /* @__PURE__ */ L(!1), xe = /* @__PURE__ */ L(!1), Ne = /* @__PURE__ */ L(!1), Ee = /* @__PURE__ */ L(null), Oe = /* @__PURE__ */ L(""), Ge = /* @__PURE__ */ L(void 0), P = !1;
  js(() => {
    o() && !P && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var C;
        (C = a(Ge)) == null || C.focus();
      });
    }), a(b) === "new" && a(z).length === 0 && setTimeout(
      () => {
        ed().then((C) => {
          y(z, [...a(z), C], !0);
        }).catch(() => {
        });
      },
      300
    )), P = o();
  });
  let ve = /* @__PURE__ */ L(""), he = /* @__PURE__ */ L("success"), Re = /* @__PURE__ */ L(!1);
  function Se(C, U) {
    y(ve, C, !0), y(he, U, !0), y(Re, !0), setTimeout(
      () => {
        y(Re, !1);
      },
      3e3
    );
  }
  async function ht() {
    y(xe, !0);
    try {
      const C = await $l();
      y(Oe, C, !0), y(Ee, a(
        z
        // new index (not yet in array)
      ).length, !0);
    } catch (C) {
      console.error("[jat-feedback] Screenshot failed:", C), Se("Screenshot failed: " + (C instanceof Error ? C.message : "unknown error"), "error");
    } finally {
      y(xe, !1);
    }
  }
  function mn(C) {
    y(z, a(z).filter((U, ge) => ge !== C), !0);
  }
  function bn(C) {
    y(Oe, a(z)[C], !0), y(Ee, C, !0);
  }
  function Dn(C) {
    a(Ee) !== null && (a(Ee) >= a(z).length ? (y(z, [...a(z), C], !0), Se(`Screenshot captured (${a(z).length})`, "success")) : (y(z, a(z).map((U, ge) => ge === a(Ee) ? C : U), !0), Se("Screenshot updated", "success"))), y(Ee, null), y(Oe, "");
  }
  function Ot() {
    a(Ee) !== null && a(Ee) >= a(z).length && (y(z, [...a(z), a(Oe)], !0), Se(`Screenshot captured (${a(z).length})`, "success")), y(Ee, null), y(Oe, "");
  }
  function _n() {
    y(Ne, !0), Za((C) => {
      y(Z, [...a(Z), C], !0), y(Ne, !1), Se(`Element captured: <${C.tagName.toLowerCase()}>`, "success");
    });
  }
  function yn() {
    y(ae, kf(), !0);
  }
  async function On(C) {
    if (C.preventDefault(), !a(M).trim()) return;
    y(me, !0), yn();
    const U = {};
    (i() || l() || c() || u()) && (U.reporter = {}, i() && (U.reporter.userId = i()), l() && (U.reporter.email = l()), c() && (U.reporter.name = c()), u() && (U.reporter.role = u())), (f() || d()) && (U.organization = {}, f() && (U.organization.id = f()), d() && (U.organization.name = d()));
    const ge = {
      title: a(M).trim(),
      description: a(I).trim(),
      type: a(F),
      priority: a(X),
      project: s() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: a(ae).length > 0 ? a(ae) : null,
      selected_elements: a(Z).length > 0 ? a(Z) : null,
      screenshots: a(z).length > 0 ? a(z) : null,
      metadata: Object.keys(U).length > 0 ? U : null
    };
    try {
      const Fe = await rl(r(), ge);
      Fe.ok ? (Se(`Report submitted (${Fe.id})`, "success"), qn(), setTimeout(
        () => {
          k(), y(b, "requests");
        },
        1200
      )) : (Ei(r(), ge), Se("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      Ei(r(), ge), Se("Queued for retry (endpoint unreachable)", "error");
    } finally {
      y(me, !1);
    }
  }
  function qn() {
    y(M, ""), y(I, ""), y(F, "bug"), y(X, "medium"), y(z, [], !0), y(Z, [], !0), y(ae, [], !0);
  }
  js(() => {
    yn();
  });
  const hr = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], T = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function ie() {
    return a(z).length + a(Z).length;
  }
  var $e = {
    get endpoint() {
      return r();
    },
    set endpoint(C) {
      r(C), H();
    },
    get project() {
      return s();
    },
    set project(C) {
      s(C), H();
    },
    get isOpen() {
      return o();
    },
    set isOpen(C = !1) {
      o(C), H();
    },
    get userId() {
      return i();
    },
    set userId(C = "") {
      i(C), H();
    },
    get userEmail() {
      return l();
    },
    set userEmail(C = "") {
      l(C), H();
    },
    get userName() {
      return c();
    },
    set userName(C = "") {
      c(C), H();
    },
    get userRole() {
      return u();
    },
    set userRole(C = "") {
      u(C), H();
    },
    get orgId() {
      return f();
    },
    set orgId(C = "") {
      f(C), H();
    },
    get orgName() {
      return d();
    },
    set orgName(C = "") {
      d(C), H();
    },
    get onclose() {
      return v();
    },
    set onclose(C) {
      v(C), H();
    },
    get ongrip() {
      return h();
    },
    set ongrip(C) {
      h(C), H();
    }
  }, qt = kv(), it = ut(qt), qe = x(it), tn = x(qe);
  {
    var Vr = (C) => {
      var U = lv();
      J("mousedown", U, function(...ge) {
        var Fe;
        (Fe = h()) == null || Fe.apply(this, ge);
      }), $(C, U);
    };
    B(tn, (C) => {
      h() && C(Vr);
    });
  }
  var E = S(tn, 2), R = x(E);
  let D;
  var A = S(R, 2);
  let Ue;
  var gt = S(x(A), 2);
  {
    var Ct = (C) => {
      var U = cv(), ge = x(U, !0);
      w(U), q(() => Y(ge, a(N))), $(C, U);
    };
    B(gt, (C) => {
      a(N) > 0 && C(Ct);
    });
  }
  w(A), w(E);
  var wn = S(E, 2);
  w(qe);
  var gr = S(qe, 2);
  {
    var mt = (C) => {
      var U = wv(), ge = x(U), Fe = S(x(ge), 2);
      Ha(Fe), os(Fe, (O) => y(Ge, O), () => a(Ge)), w(ge);
      var kn = S(ge, 2), Wr = S(x(kn), 2);
      _a(Wr), w(kn);
      var mr = S(kn, 2), Yr = x(mr), br = S(x(Yr), 2);
      We(br, 21, () => hr, dt, (O, Q) => {
        var ce = fv(), Ce = x(ce, !0);
        w(ce);
        var fe = {};
        q(() => {
          Y(Ce, a(Q).label), fe !== (fe = a(Q).value) && (ce.value = (ce.__value = a(Q).value) ?? "");
        }), $(O, ce);
      }), w(br), w(Yr);
      var Kr = S(Yr, 2), _r = S(x(Kr), 2);
      We(_r, 21, () => T, dt, (O, Q) => {
        var ce = uv(), Ce = x(ce, !0);
        w(ce);
        var fe = {};
        q(() => {
          Y(Ce, a(Q).label), fe !== (fe = a(Q).value) && (ce.value = (ce.__value = a(Q).value) ?? "");
        }), $(O, ce);
      }), w(_r), w(Kr), w(mr);
      var yr = S(mr, 2), Xr = x(yr), En = x(Xr), Gr = x(En);
      {
        var vo = (O) => {
          var Q = dv();
          Fs(), $(O, Q);
        }, po = (O) => {
          var Q = pv(), ce = S(ut(Q), 2);
          {
            var Ce = (fe) => {
              var Be = vv(), Tt = x(Be, !0);
              w(Be), q(() => Y(Tt, a(z).length)), $(fe, Be);
            };
            B(ce, (fe) => {
              a(z).length > 0 && fe(Ce);
            });
          }
          $(O, Q);
        };
        B(Gr, (O) => {
          a(xe) ? O(vo) : O(po, !1);
        });
      }
      w(En);
      var wr = S(En, 2), ho = S(x(wr), 2);
      {
        var go = (O) => {
          var Q = pi("Click an element...");
          $(O, Q);
        }, ne = (O) => {
          var Q = gv(), ce = S(ut(Q));
          {
            var Ce = (fe) => {
              var Be = hv(), Tt = x(Be, !0);
              w(Be), q(() => Y(Tt, a(Z).length)), $(fe, Be);
            };
            B(ce, (fe) => {
              a(Z).length > 0 && fe(Ce);
            });
          }
          $(O, Q);
        };
        B(ho, (O) => {
          a(Ne) ? O(go) : O(ne, !1);
        });
      }
      w(wr), w(Xr);
      var se = S(Xr, 2);
      Cl(se, {
        get screenshots() {
          return a(z);
        },
        get capturing() {
          return a(xe);
        },
        oncapture: ht,
        onremove: mn,
        onedit: bn
      }), w(yr);
      var pe = S(yr, 2);
      {
        var Je = (O) => {
          var Q = bv();
          We(Q, 21, () => a(Z), dt, (ce, Ce, fe) => {
            var Be = mv(), Tt = x(Be), xr = x(Tt);
            w(Tt);
            var zn = S(Tt, 2), _e = x(zn, !0);
            w(zn);
            var He = S(zn, 2);
            w(Be), q(
              (et, at) => {
                Y(xr, `<${et ?? ""}>`), Y(_e, at);
              },
              [
                () => a(Ce).tagName.toLowerCase(),
                () => {
                  var et;
                  return ((et = a(Ce).textContent) == null ? void 0 : et.substring(0, 40)) || a(Ce).selector;
                }
              ]
            ), J("click", He, () => {
              y(Z, a(Z).filter((et, at) => at !== fe), !0);
            }), $(ce, Be);
          }), w(Q), $(O, Q);
        };
        B(pe, (O) => {
          a(Z).length > 0 && O(Je);
        });
      }
      var At = S(pe, 2);
      Tl(At, {
        get logs() {
          return a(ae);
        }
      });
      var Ze = S(At, 2);
      {
        var je = (O) => {
          var Q = _v(), ce = x(Q);
          w(Q), q((Ce, fe) => Y(ce, `${Ce ?? ""} attachment${fe ?? ""} will be included`), [ie, () => ie() > 1 ? "s" : ""]), $(O, Q);
        }, be = /* @__PURE__ */ Yt(() => ie() > 0);
        B(Ze, (O) => {
          a(be) && O(je);
        });
      }
      var ze = S(Ze, 2), le = x(ze), Qe = S(le, 2), Fn = x(Qe);
      {
        var ue = (O) => {
          var Q = yv();
          Fs(), $(O, Q);
        }, Sn = (O) => {
          var Q = pi("Submit");
          $(O, Q);
        };
        B(Fn, (O) => {
          a(me) ? O(ue) : O(Sn, !1);
        });
      }
      w(Qe), w(ze), w(U), q(
        (O) => {
          Fe.disabled = a(me), Wr.disabled = a(me), br.disabled = a(me), _r.disabled = a(me), En.disabled = a(xe), wr.disabled = a(Ne), le.disabled = a(me), Qe.disabled = O;
        },
        [() => a(me) || !a(M).trim()]
      ), Pa("submit", U, On), Vs(Fe, () => a(M), (O) => y(M, O)), Vs(Wr, () => a(I), (O) => y(I, O)), bi(br, () => a(F), (O) => y(F, O)), bi(_r, () => a(X), (O) => y(X, O)), J("click", En, ht), J("click", wr, _n), J("click", le, function(...O) {
        var Q;
        (Q = v()) == null || Q.apply(this, O);
      }), Hs(3, U, () => Ks, () => ({ duration: 200 })), $(C, U);
    };
    B(gr, (C) => {
      a(b) === "new" && C(mt);
    });
  }
  var Ft = S(gr, 2);
  {
    var xn = (C) => {
      var U = xv(), ge = x(U);
      Rl(ge, {
        get endpoint() {
          return r();
        },
        get loading() {
          return a(p);
        },
        get error() {
          return a(m);
        },
        onreload: k,
        get reports() {
          return a(_);
        },
        set reports(Fe) {
          y(_, Fe, !0);
        }
      }), w(U), Hs(3, U, () => Ks, () => ({ duration: 200 })), $(C, U);
    };
    B(Ft, (C) => {
      a(b) === "requests" && C(xn);
    });
  }
  var xs = S(Ft, 2);
  Nl(xs, {
    get message() {
      return a(ve);
    },
    get type() {
      return a(he);
    },
    get visible() {
      return a(Re);
    }
  });
  var ks = S(xs, 2), Es = x(ks);
  w(ks), w(it);
  var fo = S(it, 2);
  {
    var uo = (C) => {
      Al(C, {
        get imageDataUrl() {
          return a(Oe);
        },
        onsave: Dn,
        oncancel: Ot
      });
    };
    B(fo, (C) => {
      a(Ee) !== null && C(uo);
    });
  }
  return q(() => {
    D = Ye(R, 1, "tab svelte-nv4d5v", null, D, { active: a(b) === "new" }), Ue = Ye(A, 1, "tab svelte-nv4d5v", null, Ue, { active: a(b) === "requests" }), Y(Es, `v${n}`);
  }), J("click", R, () => y(b, "new")), J("click", A, () => y(b, "requests")), J("click", wn, function(...C) {
    var U;
    (U = v()) == null || U.apply(this, C);
  }), $(e, qt), gn($e);
}
ys(["mousedown", "click"]);
Pn(
  jl,
  {
    endpoint: {},
    project: {},
    isOpen: {},
    userId: {},
    userEmail: {},
    userName: {},
    userRole: {},
    orgId: {},
    orgName: {},
    onclose: {},
    ongrip: {}
  },
  [],
  [],
  { mode: "open" }
);
var Sv = /* @__PURE__ */ j("<div><!></div>"), $v = /* @__PURE__ */ j('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), Cv = /* @__PURE__ */ j('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const Av = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.jat-feedback-panel.hidden.svelte-qpyrvv {display:none;}.jat-feedback-panel.dragging.svelte-qpyrvv {pointer-events:none;opacity:0.9;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function Tv(e, t) {
  hn(t, !0), Ln(e, Av);
  let n = W(t, "endpoint", 7, ""), r = W(t, "project", 7, ""), s = W(t, "position", 7, "bottom-right"), o = W(t, "theme", 7, "dark"), i = W(t, "buttoncolor", 7, "#3b82f6"), l = W(t, "user-id", 7, ""), c = W(t, "user-email", 7, ""), u = W(t, "user-name", 7, ""), f = W(t, "user-role", 7, ""), d = W(t, "org-id", 7, ""), v = W(t, "org-name", 7, ""), h = /* @__PURE__ */ L(!1), b = /* @__PURE__ */ L(!1), _ = /* @__PURE__ */ L(!1), p = { x: 0, y: 0 }, m = /* @__PURE__ */ L(void 0);
  function N(P) {
    if (!a(m)) return;
    y(_, !0);
    const ve = a(m).getBoundingClientRect();
    p = { x: P.clientX - ve.left, y: P.clientY - ve.top };
    function he(Se) {
      if (!a(_) || !a(m)) return;
      Se.preventDefault();
      const ht = Se.clientX - p.x, mn = Se.clientY - p.y;
      a(m).style.top = `${mn}px`, a(m).style.left = `${ht}px`, a(m).style.bottom = "auto", a(m).style.right = "auto";
    }
    function Re() {
      y(_, !1), window.removeEventListener("mousemove", he), window.removeEventListener("mouseup", Re);
    }
    window.addEventListener("mousemove", he), window.addEventListener("mouseup", Re);
  }
  let k = null;
  function M() {
    k = setInterval(
      () => {
        const P = Af();
        P && !a(b) ? y(b, !0) : !P && a(b) && y(b, !1);
      },
      100
    );
  }
  let I = /* @__PURE__ */ Yt(() => ({
    ...Qr,
    endpoint: n() || Qr.endpoint,
    position: s() || Qr.position,
    theme: o() || Qr.theme,
    buttonColor: i() || Qr.buttonColor
  }));
  function F() {
    y(h, !a(h));
  }
  function X() {
    y(h, !1);
  }
  const z = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, Z = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function ae(P) {
    if (P.key === "Escape" && a(h)) {
      if (Tf()) return;
      P.stopPropagation(), P.stopImmediatePropagation(), X();
    }
  }
  Zo(() => {
    a(I).captureConsole && wf(a(I).maxConsoleLogs), zf(), M(), window.addEventListener("keydown", ae, !0);
    const P = () => {
      y(h, !0);
    };
    return window.addEventListener("jat-feedback:open", P), () => window.removeEventListener("jat-feedback:open", P);
  }), za(() => {
    xf(), Bf(), window.removeEventListener("keydown", ae, !0), k && clearInterval(k);
  });
  var me = {
    get endpoint() {
      return n();
    },
    set endpoint(P = "") {
      n(P), H();
    },
    get project() {
      return r();
    },
    set project(P = "") {
      r(P), H();
    },
    get position() {
      return s();
    },
    set position(P = "bottom-right") {
      s(P), H();
    },
    get theme() {
      return o();
    },
    set theme(P = "dark") {
      o(P), H();
    },
    get buttoncolor() {
      return i();
    },
    set buttoncolor(P = "#3b82f6") {
      i(P), H();
    },
    get "user-id"() {
      return l();
    },
    set "user-id"(P = "") {
      l(P), H();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"(P = "") {
      c(P), H();
    },
    get "user-name"() {
      return u();
    },
    set "user-name"(P = "") {
      u(P), H();
    },
    get "user-role"() {
      return f();
    },
    set "user-role"(P = "") {
      f(P), H();
    },
    get "org-id"() {
      return d();
    },
    set "org-id"(P = "") {
      d(P), H();
    },
    get "org-name"() {
      return v();
    },
    set "org-name"(P = "") {
      v(P), H();
    }
  }, xe = Cv(), Ne = x(xe);
  {
    var Ee = (P) => {
      var ve = Sv();
      let he;
      var Re = x(ve);
      jl(Re, {
        get endpoint() {
          return a(I).endpoint;
        },
        get project() {
          return r();
        },
        get isOpen() {
          return a(h);
        },
        get userId() {
          return l();
        },
        get userEmail() {
          return c();
        },
        get userName() {
          return u();
        },
        get userRole() {
          return f();
        },
        get orgId() {
          return d();
        },
        get orgName() {
          return v();
        },
        onclose: X,
        ongrip: N
      }), w(ve), q(() => {
        he = Ye(ve, 1, "jat-feedback-panel svelte-qpyrvv", null, he, { dragging: a(_), hidden: !a(h) }), ir(ve, Z[a(I).position] || Z["bottom-right"]);
      }), $(P, ve);
    }, Oe = (P) => {
      var ve = $v();
      q(() => ir(ve, Z[a(I).position] || Z["bottom-right"])), $(P, ve);
    };
    B(Ne, (P) => {
      a(I).endpoint ? P(Ee) : a(h) && P(Oe, 1);
    });
  }
  var Ge = S(Ne, 2);
  return al(Ge, {
    onclick: F,
    get open() {
      return a(h);
    }
  }), w(xe), os(xe, (P) => y(m, P), () => a(m)), q(() => ir(xe, `${(z[a(I).position] || z["bottom-right"]) ?? ""}; --jat-btn-color: ${a(I).buttonColor ?? ""}; ${a(b) ? "display: none;" : ""}`)), $(e, xe), gn(me);
}
customElements.define("jat-feedback", Pn(
  Tv,
  {
    endpoint: {},
    project: {},
    position: {},
    theme: {},
    buttoncolor: {},
    "user-id": {},
    "user-email": {},
    "user-name": {},
    "user-role": {},
    "org-id": {},
    "org-name": {}
  },
  [],
  [],
  { mode: "open" }
));
