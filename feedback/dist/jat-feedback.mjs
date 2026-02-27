var ql = Object.defineProperty;
var co = (e) => {
  throw TypeError(e);
};
var Pl = (e, t, n) => t in e ? ql(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var ye = (e, t, n) => Pl(e, typeof t != "symbol" ? t + "" : t, n), ki = (e, t, n) => t.has(e) || co("Cannot " + n);
var m = (e, t, n) => (ki(e, t, "read from private field"), n ? n.call(e) : t.get(e)), J = (e, t, n) => t.has(e) ? co("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), V = (e, t, n, r) => (ki(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), Ae = (e, t, n) => (ki(e, t, "access private method"), n);
var Do;
typeof window < "u" && ((Do = window.__svelte ?? (window.__svelte = {})).v ?? (Do.v = /* @__PURE__ */ new Set())).add("5");
const Dl = 1, Fl = 2, Ho = 4, Ol = 8, zl = 16, Bl = 1, Ul = 4, Hl = 8, Vl = 16, Wl = 4, Vo = 1, Yl = 2, Vi = "[", si = "[!", Wi = "]", Nr = {}, je = Symbol(), Wo = "http://www.w3.org/1999/xhtml", Ci = !1;
var Yi = Array.isArray, Kl = Array.prototype.indexOf, Rr = Array.prototype.includes, ii = Array.from, Vs = Object.keys, Ws = Object.defineProperty, Qn = Object.getOwnPropertyDescriptor, Gl = Object.getOwnPropertyDescriptors, Xl = Object.prototype, Jl = Array.prototype, Yo = Object.getPrototypeOf, fo = Object.isExtensible;
function Zl(e) {
  return typeof e == "function";
}
const wr = () => {
};
function Ql(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Ko() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const Le = 2, ls = 4, oi = 8, Go = 1 << 24, Wt = 16, Rt = 32, Nn = 64, Xo = 128, gt = 512, Te = 1024, qe = 2048, Nt = 4096, lt = 8192, un = 16384, lr = 32768, sr = 65536, uo = 1 << 17, Jo = 1 << 18, cr = 1 << 19, ec = 1 << 20, cn = 1 << 25, ir = 65536, Ai = 1 << 21, Ki = 1 << 22, Cn = 1 << 23, er = Symbol("$state"), Zo = Symbol("legacy props"), tc = Symbol(""), Hn = new class extends Error {
  constructor() {
    super(...arguments);
    ye(this, "name", "StaleReactionError");
    ye(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Fo, Oo;
const nc = ((Oo = (Fo = globalThis.document) == null ? void 0 : Fo.contentType) == null ? void 0 : /* @__PURE__ */ Oo.includes("xml")) ?? !1, _s = 3, Dr = 8;
function Qo(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function rc() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function sc(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function ic(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function oc() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ac(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function lc() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function cc() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function fc(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function uc() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function dc() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function vc() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function pc() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function ai(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function hc() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function gc() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let ee = !1;
function fn(e) {
  ee = e;
}
let Q;
function Be(e) {
  if (e === null)
    throw ai(), Nr;
  return Q = e;
}
function ys() {
  return Be(/* @__PURE__ */ Yt(Q));
}
function w(e) {
  if (ee) {
    if (/* @__PURE__ */ Yt(Q) !== null)
      throw ai(), Nr;
    Q = e;
  }
}
function cs(e = 1) {
  if (ee) {
    for (var t = e, n = Q; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Yt(n);
    Q = n;
  }
}
function Ys(e = !0) {
  for (var t = 0, n = Q; ; ) {
    if (n.nodeType === Dr) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Wi) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Vi || r === si || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Yt(n)
    );
    e && n.remove(), n = s;
  }
}
function ea(e) {
  if (!e || e.nodeType !== Dr)
    throw ai(), Nr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function ta(e) {
  return e === this.v;
}
function mc(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function na(e) {
  return !mc(e, this.v);
}
let bc = !1, Je = null;
function jr(e) {
  Je = e;
}
function vn(e, t = !1, n) {
  Je = {
    p: Je,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function pn(e) {
  var t = (
    /** @type {ComponentContext} */
    Je
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Aa(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Je = t.p, e ?? /** @type {T} */
  {};
}
function ra() {
  return !0;
}
let Vn = [];
function sa() {
  var e = Vn;
  Vn = [], Ql(e);
}
function At(e) {
  if (Vn.length === 0 && !rs) {
    var t = Vn;
    queueMicrotask(() => {
      t === Vn && sa();
    });
  }
  Vn.push(e);
}
function _c() {
  for (; Vn.length > 0; )
    sa();
}
function ia(e) {
  var t = se;
  if (t === null)
    return te.f |= Cn, e;
  if ((t.f & lr) === 0 && (t.f & ls) === 0)
    throw e;
  Ir(e, t);
}
function Ir(e, t) {
  for (; t !== null; ) {
    if ((t.f & Xo) !== 0) {
      if ((t.f & lr) === 0)
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
const yc = -7169;
function we(e, t) {
  e.f = e.f & yc | t;
}
function Gi(e) {
  (e.f & gt) !== 0 || e.deps === null ? we(e, Te) : we(e, Nt);
}
function oa(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Le) === 0 || (t.f & ir) === 0 || (t.f ^= ir, oa(
        /** @type {Derived} */
        t.deps
      ));
}
function aa(e, t, n) {
  (e.f & qe) !== 0 ? t.add(e) : (e.f & Nt) !== 0 && n.add(e), oa(e.deps), we(e, Te);
}
const Ms = /* @__PURE__ */ new Set();
let K = null, Ks = null, Ie = null, Ke = [], li = null, Ti = !1, rs = !1;
var kr, Er, Yn, Sr, ps, hs, Kn, nn, $r, Vt, Ni, Ri, la;
const lo = class lo {
  constructor() {
    J(this, Vt);
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
    J(this, kr, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    J(this, Er, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    J(this, Yn, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    J(this, Sr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    J(this, ps, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    J(this, hs, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    J(this, Kn, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    J(this, nn, /* @__PURE__ */ new Map());
    ye(this, "is_fork", !1);
    J(this, $r, !1);
  }
  is_deferred() {
    return this.is_fork || m(this, Sr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    m(this, nn).has(t) || m(this, nn).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = m(this, nn).get(t);
    if (n) {
      m(this, nn).delete(t);
      for (var r of n.d)
        we(r, qe), $t(r);
      for (r of n.m)
        we(r, Nt), $t(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    Ke = [], this.apply();
    var n = [], r = [];
    for (const i of t)
      Ae(this, Vt, Ni).call(this, i, n, r);
    if (this.is_deferred()) {
      Ae(this, Vt, Ri).call(this, r), Ae(this, Vt, Ri).call(this, n);
      for (const [i, o] of m(this, nn))
        da(i, o);
    } else {
      for (const i of m(this, kr)) i();
      m(this, kr).clear(), m(this, Yn) === 0 && Ae(this, Vt, la).call(this), Ks = this, K = null, vo(r), vo(n), Ks = null, (s = m(this, ps)) == null || s.resolve();
    }
    Ie = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== je && !this.previous.has(t) && this.previous.set(t, n), (t.f & Cn) === 0 && (this.current.set(t, t.v), Ie == null || Ie.set(t, t.v));
  }
  activate() {
    K = this, this.apply();
  }
  deactivate() {
    K === this && (K = null, Ie = null);
  }
  flush() {
    if (this.activate(), Ke.length > 0) {
      if (ca(), K !== null && K !== this)
        return;
    } else m(this, Yn) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of m(this, Er)) t(this);
    m(this, Er).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    V(this, Yn, m(this, Yn) + 1), t && V(this, Sr, m(this, Sr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    V(this, Yn, m(this, Yn) - 1), t && V(this, Sr, m(this, Sr) - 1), !m(this, $r) && (V(this, $r, !0), At(() => {
      V(this, $r, !1), this.is_deferred() ? Ke.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of m(this, hs))
      m(this, Kn).delete(t), we(t, qe), $t(t);
    for (const t of m(this, Kn))
      we(t, Nt), $t(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    m(this, kr).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    m(this, Er).add(t);
  }
  settled() {
    return (m(this, ps) ?? V(this, ps, Ko())).promise;
  }
  static ensure() {
    if (K === null) {
      const t = K = new lo();
      Ms.add(K), rs || At(() => {
        K === t && t.flush();
      });
    }
    return K;
  }
  apply() {
  }
};
kr = new WeakMap(), Er = new WeakMap(), Yn = new WeakMap(), Sr = new WeakMap(), ps = new WeakMap(), hs = new WeakMap(), Kn = new WeakMap(), nn = new WeakMap(), $r = new WeakMap(), Vt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
Ni = function(t, n, r) {
  t.f ^= Te;
  for (var s = t.first, i = null; s !== null; ) {
    var o = s.f, a = (o & (Rt | Nn)) !== 0, c = a && (o & Te) !== 0, f = c || (o & lt) !== 0 || m(this, nn).has(s);
    if (!f && s.fn !== null) {
      a ? s.f ^= Te : i !== null && (o & (ls | oi | Go)) !== 0 ? i.b.defer_effect(s) : (o & ls) !== 0 ? n.push(s) : ws(s) && ((o & Wt) !== 0 && m(this, Kn).add(s), Lr(s));
      var u = s.first;
      if (u !== null) {
        s = u;
        continue;
      }
    }
    var p = s.parent;
    for (s = s.next; s === null && p !== null; )
      p === i && (i = null), s = p.next, p = p.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
Ri = function(t) {
  for (var n = 0; n < t.length; n += 1)
    aa(t[n], m(this, hs), m(this, Kn));
}, la = function() {
  var s;
  if (Ms.size > 1) {
    this.previous.clear();
    var t = Ie, n = !0;
    for (const i of Ms) {
      if (i === this) {
        n = !1;
        continue;
      }
      const o = [];
      for (const [c, f] of this.current) {
        if (i.current.has(c))
          if (n && f !== i.current.get(c))
            i.current.set(c, f);
          else
            continue;
        o.push(c);
      }
      if (o.length === 0)
        continue;
      const a = [...i.current.keys()].filter((c) => !this.current.has(c));
      if (a.length > 0) {
        var r = Ke;
        Ke = [];
        const c = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (const u of o)
          fa(u, a, c, f);
        if (Ke.length > 0) {
          K = i, i.apply();
          for (const u of Ke)
            Ae(s = i, Vt, Ni).call(s, u, [], []);
          i.deactivate();
        }
        Ke = r;
      }
    }
    K = null, Ie = t;
  }
  this.committed = !0, Ms.delete(this);
};
let dn = lo;
function W(e) {
  var t = rs;
  rs = !0;
  try {
    for (var n; ; ) {
      if (_c(), Ke.length === 0 && (K == null || K.flush(), Ke.length === 0))
        return li = null, /** @type {T} */
        n;
      ca();
    }
  } finally {
    rs = t;
  }
}
function ca() {
  Ti = !0;
  var e = null;
  try {
    for (var t = 0; Ke.length > 0; ) {
      var n = dn.ensure();
      if (t++ > 1e3) {
        var r, s;
        wc();
      }
      n.process(Ke), An.clear();
    }
  } finally {
    Ke = [], Ti = !1, li = null;
  }
}
function wc() {
  try {
    lc();
  } catch (e) {
    Ir(e, li);
  }
}
let xt = null;
function vo(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (un | lt)) === 0 && ws(r) && (xt = /* @__PURE__ */ new Set(), Lr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Na(r), (xt == null ? void 0 : xt.size) > 0)) {
        An.clear();
        for (const s of xt) {
          if ((s.f & (un | lt)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            xt.has(o) && (xt.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const c = i[a];
            (c.f & (un | lt)) === 0 && Lr(c);
          }
        }
        xt.clear();
      }
    }
    xt = null;
  }
}
function fa(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & Le) !== 0 ? fa(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (Ki | Wt)) !== 0 && (i & qe) === 0 && ua(s, t, r) && (we(s, qe), $t(
        /** @type {Effect} */
        s
      ));
    }
}
function ua(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (Rr.call(t, s))
        return !0;
      if ((s.f & Le) !== 0 && ua(
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
function $t(e) {
  for (var t = li = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (Ti && t === se && (n & Wt) !== 0 && (n & Jo) === 0)
      return;
    if ((n & (Nn | Rt)) !== 0) {
      if ((n & Te) === 0) return;
      t.f ^= Te;
    }
  }
  Ke.push(t);
}
function da(e, t) {
  if (!((e.f & Rt) !== 0 && (e.f & Te) !== 0)) {
    (e.f & qe) !== 0 ? t.d.push(e) : (e.f & Nt) !== 0 && t.m.push(e), we(e, Te);
    for (var n = e.first; n !== null; )
      da(n, t), n = n.next;
  }
}
function xc(e) {
  let t = 0, n = or(0), r;
  return () => {
    Qi() && (l(n), di(() => (t === 0 && (r = fr(() => e(() => ss(n)))), t += 1, () => {
      At(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, ss(n));
      });
    })));
  };
}
var kc = sr | cr | Xo;
function Ec(e, t, n) {
  new Sc(e, t, n);
}
var st, gs, Dt, Gn, Ft, dt, Ye, Ot, rn, $n, Xn, sn, Cr, Jn, Ar, Tr, on, ni, ke, va, pa, ji, Ps, Ds, Ii;
class Sc {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    J(this, ke);
    /** @type {Boundary | null} */
    ye(this, "parent");
    ye(this, "is_pending", !1);
    /** @type {TemplateNode} */
    J(this, st);
    /** @type {TemplateNode | null} */
    J(this, gs, ee ? Q : null);
    /** @type {BoundaryProps} */
    J(this, Dt);
    /** @type {((anchor: Node) => void)} */
    J(this, Gn);
    /** @type {Effect} */
    J(this, Ft);
    /** @type {Effect | null} */
    J(this, dt, null);
    /** @type {Effect | null} */
    J(this, Ye, null);
    /** @type {Effect | null} */
    J(this, Ot, null);
    /** @type {DocumentFragment | null} */
    J(this, rn, null);
    /** @type {TemplateNode | null} */
    J(this, $n, null);
    J(this, Xn, 0);
    J(this, sn, 0);
    J(this, Cr, !1);
    J(this, Jn, !1);
    /** @type {Set<Effect>} */
    J(this, Ar, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    J(this, Tr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    J(this, on, null);
    J(this, ni, xc(() => (V(this, on, or(m(this, Xn))), () => {
      V(this, on, null);
    })));
    V(this, st, t), V(this, Dt, n), V(this, Gn, r), this.parent = /** @type {Effect} */
    se.b, this.is_pending = !!m(this, Dt).pending, V(this, Ft, vi(() => {
      if (se.b = this, ee) {
        const i = m(this, gs);
        ys(), /** @type {Comment} */
        i.nodeType === Dr && /** @type {Comment} */
        i.data === si ? Ae(this, ke, pa).call(this) : (Ae(this, ke, va).call(this), m(this, sn) === 0 && (this.is_pending = !1));
      } else {
        var s = Ae(this, ke, ji).call(this);
        try {
          V(this, dt, pt(() => r(s)));
        } catch (i) {
          this.error(i);
        }
        m(this, sn) > 0 ? Ae(this, ke, Ds).call(this) : this.is_pending = !1;
      }
      return () => {
        var i;
        (i = m(this, $n)) == null || i.remove();
      };
    }, kc)), ee && V(this, st, Q);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    aa(t, m(this, Ar), m(this, Tr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!m(this, Dt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    Ae(this, ke, Ii).call(this, t), V(this, Xn, m(this, Xn) + t), !(!m(this, on) || m(this, Cr)) && (V(this, Cr, !0), At(() => {
      V(this, Cr, !1), m(this, on) && Mr(m(this, on), m(this, Xn));
    }));
  }
  get_effect_pending() {
    return m(this, ni).call(this), l(
      /** @type {Source<number>} */
      m(this, on)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = m(this, Dt).onerror;
    let r = m(this, Dt).failed;
    if (m(this, Jn) || !n && !r)
      throw t;
    m(this, dt) && (Ue(m(this, dt)), V(this, dt, null)), m(this, Ye) && (Ue(m(this, Ye)), V(this, Ye, null)), m(this, Ot) && (Ue(m(this, Ot)), V(this, Ot, null)), ee && (Be(
      /** @type {TemplateNode} */
      m(this, gs)
    ), cs(), Be(Ys()));
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        gc();
        return;
      }
      s = !0, i && pc(), dn.ensure(), V(this, Xn, 0), m(this, Ot) !== null && tr(m(this, Ot), () => {
        V(this, Ot, null);
      }), this.is_pending = this.has_pending_snippet(), V(this, dt, Ae(this, ke, Ps).call(this, () => (V(this, Jn, !1), pt(() => m(this, Gn).call(this, m(this, st)))))), m(this, sn) > 0 ? Ae(this, ke, Ds).call(this) : this.is_pending = !1;
    };
    At(() => {
      try {
        i = !0, n == null || n(t, o), i = !1;
      } catch (a) {
        Ir(a, m(this, Ft) && m(this, Ft).parent);
      }
      r && V(this, Ot, Ae(this, ke, Ps).call(this, () => {
        dn.ensure(), V(this, Jn, !0);
        try {
          return pt(() => {
            r(
              m(this, st),
              () => t,
              () => o
            );
          });
        } catch (a) {
          return Ir(
            a,
            /** @type {Effect} */
            m(this, Ft).parent
          ), null;
        } finally {
          V(this, Jn, !1);
        }
      }));
    });
  }
}
st = new WeakMap(), gs = new WeakMap(), Dt = new WeakMap(), Gn = new WeakMap(), Ft = new WeakMap(), dt = new WeakMap(), Ye = new WeakMap(), Ot = new WeakMap(), rn = new WeakMap(), $n = new WeakMap(), Xn = new WeakMap(), sn = new WeakMap(), Cr = new WeakMap(), Jn = new WeakMap(), Ar = new WeakMap(), Tr = new WeakMap(), on = new WeakMap(), ni = new WeakMap(), ke = new WeakSet(), va = function() {
  try {
    V(this, dt, pt(() => m(this, Gn).call(this, m(this, st))));
  } catch (t) {
    this.error(t);
  }
}, pa = function() {
  const t = m(this, Dt).pending;
  t && (V(this, Ye, pt(() => t(m(this, st)))), At(() => {
    var n = Ae(this, ke, ji).call(this);
    V(this, dt, Ae(this, ke, Ps).call(this, () => (dn.ensure(), pt(() => m(this, Gn).call(this, n))))), m(this, sn) > 0 ? Ae(this, ke, Ds).call(this) : (tr(
      /** @type {Effect} */
      m(this, Ye),
      () => {
        V(this, Ye, null);
      }
    ), this.is_pending = !1);
  }));
}, ji = function() {
  var t = m(this, st);
  return this.is_pending && (V(this, $n, Xe()), m(this, st).before(m(this, $n)), t = m(this, $n)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Ps = function(t) {
  var n = se, r = te, s = Je;
  Ut(m(this, Ft)), bt(m(this, Ft)), jr(m(this, Ft).ctx);
  try {
    return t();
  } catch (i) {
    return ia(i), null;
  } finally {
    Ut(n), bt(r), jr(s);
  }
}, Ds = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    m(this, Dt).pending
  );
  m(this, dt) !== null && (V(this, rn, document.createDocumentFragment()), m(this, rn).append(
    /** @type {TemplateNode} */
    m(this, $n)
  ), Ia(m(this, dt), m(this, rn))), m(this, Ye) === null && V(this, Ye, pt(() => t(m(this, st))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Ii = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && Ae(n = this.parent, ke, Ii).call(n, t);
    return;
  }
  if (V(this, sn, m(this, sn) + t), m(this, sn) === 0) {
    this.is_pending = !1;
    for (const r of m(this, Ar))
      we(r, qe), $t(r);
    for (const r of m(this, Tr))
      we(r, Nt), $t(r);
    m(this, Ar).clear(), m(this, Tr).clear(), m(this, Ye) && tr(m(this, Ye), () => {
      V(this, Ye, null);
    }), m(this, rn) && (m(this, st).before(m(this, rn)), V(this, rn, null));
  }
};
function $c(e, t, n, r) {
  const s = ci;
  var i = e.filter((d) => !d.settled);
  if (n.length === 0 && i.length === 0) {
    r(t.map(s));
    return;
  }
  var o = K, a = (
    /** @type {Effect} */
    se
  ), c = Cc(), f = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((d) => d.promise)) : null;
  function u(d) {
    c();
    try {
      r(d);
    } catch (h) {
      (a.f & un) === 0 && Ir(h, a);
    }
    o == null || o.deactivate(), Mi();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(s)));
    return;
  }
  function p() {
    c(), Promise.all(n.map((d) => /* @__PURE__ */ Ac(d))).then((d) => u([...t.map(s), ...d])).catch((d) => Ir(d, a));
  }
  f ? f.then(p) : p();
}
function Cc() {
  var e = se, t = te, n = Je, r = K;
  return function(i = !0) {
    Ut(e), bt(t), jr(n), i && (r == null || r.activate());
  };
}
function Mi() {
  Ut(null), bt(null), jr(null);
}
// @__NO_SIDE_EFFECTS__
function ci(e) {
  var t = Le | qe, n = te !== null && (te.f & Le) !== 0 ? (
    /** @type {Derived} */
    te
  ) : null;
  return se !== null && (se.f |= cr), {
    ctx: Je,
    deps: null,
    effects: null,
    equals: ta,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      je
    ),
    wv: 0,
    parent: n ?? se,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Ac(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    se
  );
  r === null && rc();
  var s = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), o = or(
    /** @type {V} */
    je
  ), a = !te, c = /* @__PURE__ */ new Map();
  return Dc(() => {
    var h;
    var f = Ko();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).then(() => {
        u === K && u.committed && u.deactivate(), Mi();
      });
    } catch (_) {
      f.reject(_), Mi();
    }
    var u = (
      /** @type {Batch} */
      K
    );
    if (a) {
      var p = s.is_rendered();
      s.update_pending_count(1), u.increment(p), (h = c.get(u)) == null || h.reject(Hn), c.delete(u), c.set(u, f);
    }
    const d = (_, g = void 0) => {
      if (u.activate(), g)
        g !== Hn && (o.f |= Cn, Mr(o, g));
      else {
        (o.f & Cn) !== 0 && (o.f ^= Cn), Mr(o, _);
        for (const [v, b] of c) {
          if (c.delete(v), v === u) break;
          b.reject(Hn);
        }
      }
      a && (s.update_pending_count(-1), u.decrement(p));
    };
    f.promise.then(d, (_) => d(null, _ || "unknown"));
  }), eo(() => {
    for (const f of c.values())
      f.reject(Hn);
  }), new Promise((f) => {
    function u(p) {
      function d() {
        p === i ? f(o) : u(i);
      }
      p.then(d, d);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Et(e) {
  const t = /* @__PURE__ */ ci(e);
  return Ma(t), t;
}
// @__NO_SIDE_EFFECTS__
function ha(e) {
  const t = /* @__PURE__ */ ci(e);
  return t.equals = na, t;
}
function Tc(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Ue(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Nc(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Le) === 0)
      return (t.f & un) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Xi(e) {
  var t, n = se;
  Ut(Nc(e));
  try {
    e.f &= ~ir, Tc(e), t = Da(e);
  } finally {
    Ut(n);
  }
  return t;
}
function ga(e) {
  var t = Xi(e);
  if (!e.equals(t) && (e.wv = qa(), (!(K != null && K.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    we(e, Te);
    return;
  }
  Tn || (Ie !== null ? (Qi() || K != null && K.is_fork) && Ie.set(e, t) : Gi(e));
}
function Rc(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(Hn), r.teardown = wr, r.ac = null, fs(r, 0), to(r));
}
function ma(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Lr(t);
}
let Li = /* @__PURE__ */ new Set();
const An = /* @__PURE__ */ new Map();
let ba = !1;
function or(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ta,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = or(e);
  return Ma(n), n;
}
// @__NO_SIDE_EFFECTS__
function _a(e, t = !1, n = !0) {
  const r = or(e);
  return t || (r.equals = na), r;
}
function y(e, t, n = !1) {
  te !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Ct || (te.f & uo) !== 0) && ra() && (te.f & (Le | Wt | Ki | uo)) !== 0 && (mt === null || !Rr.call(mt, e)) && vc();
  let r = n ? Me(t) : t;
  return Mr(e, r);
}
function Mr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    Tn ? An.set(e, t) : An.set(e, n), e.v = t;
    var r = dn.ensure();
    if (r.capture(e, n), (e.f & Le) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & qe) !== 0 && Xi(s), Gi(s);
    }
    e.wv = qa(), ya(e, qe), se !== null && (se.f & Te) !== 0 && (se.f & (Rt | Nn)) === 0 && (ut === null ? zc([e]) : ut.push(e)), !r.is_fork && Li.size > 0 && !ba && jc();
  }
  return t;
}
function jc() {
  ba = !1;
  for (const e of Li)
    (e.f & Te) !== 0 && we(e, Nt), ws(e) && Lr(e);
  Li.clear();
}
function ss(e) {
  y(e, e.v + 1);
}
function ya(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var i = n[s], o = i.f, a = (o & qe) === 0;
      if (a && we(i, t), (o & Le) !== 0) {
        var c = (
          /** @type {Derived} */
          i
        );
        Ie == null || Ie.delete(c), (o & ir) === 0 && (o & gt && (i.f |= ir), ya(c, Nt));
      } else a && ((o & Wt) !== 0 && xt !== null && xt.add(
        /** @type {Effect} */
        i
      ), $t(
        /** @type {Effect} */
        i
      ));
    }
}
function Me(e) {
  if (typeof e != "object" || e === null || er in e)
    return e;
  const t = Yo(e);
  if (t !== Xl && t !== Jl)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Yi(e), s = /* @__PURE__ */ P(0), i = nr, o = (a) => {
    if (nr === i)
      return a();
    var c = te, f = nr;
    bt(null), bo(i);
    var u = a();
    return bt(c), bo(f), u;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, c, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && uc();
        var u = n.get(c);
        return u === void 0 ? o(() => {
          var p = /* @__PURE__ */ P(f.value);
          return n.set(c, p), p;
        }) : y(u, f.value, !0), !0;
      },
      deleteProperty(a, c) {
        var f = n.get(c);
        if (f === void 0) {
          if (c in a) {
            const u = o(() => /* @__PURE__ */ P(je));
            n.set(c, u), ss(s);
          }
        } else
          y(f, je), ss(s);
        return !0;
      },
      get(a, c, f) {
        var h;
        if (c === er)
          return e;
        var u = n.get(c), p = c in a;
        if (u === void 0 && (!p || (h = Qn(a, c)) != null && h.writable) && (u = o(() => {
          var _ = Me(p ? a[c] : je), g = /* @__PURE__ */ P(_);
          return g;
        }), n.set(c, u)), u !== void 0) {
          var d = l(u);
          return d === je ? void 0 : d;
        }
        return Reflect.get(a, c, f);
      },
      getOwnPropertyDescriptor(a, c) {
        var f = Reflect.getOwnPropertyDescriptor(a, c);
        if (f && "value" in f) {
          var u = n.get(c);
          u && (f.value = l(u));
        } else if (f === void 0) {
          var p = n.get(c), d = p == null ? void 0 : p.v;
          if (p !== void 0 && d !== je)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return f;
      },
      has(a, c) {
        var d;
        if (c === er)
          return !0;
        var f = n.get(c), u = f !== void 0 && f.v !== je || Reflect.has(a, c);
        if (f !== void 0 || se !== null && (!u || (d = Qn(a, c)) != null && d.writable)) {
          f === void 0 && (f = o(() => {
            var h = u ? Me(a[c]) : je, _ = /* @__PURE__ */ P(h);
            return _;
          }), n.set(c, f));
          var p = l(f);
          if (p === je)
            return !1;
        }
        return u;
      },
      set(a, c, f, u) {
        var k;
        var p = n.get(c), d = c in a;
        if (r && c === "length")
          for (var h = f; h < /** @type {Source<number>} */
          p.v; h += 1) {
            var _ = n.get(h + "");
            _ !== void 0 ? y(_, je) : h in a && (_ = o(() => /* @__PURE__ */ P(je)), n.set(h + "", _));
          }
        if (p === void 0)
          (!d || (k = Qn(a, c)) != null && k.writable) && (p = o(() => /* @__PURE__ */ P(void 0)), y(p, Me(f)), n.set(c, p));
        else {
          d = p.v !== je;
          var g = o(() => Me(f));
          y(p, g);
        }
        var v = Reflect.getOwnPropertyDescriptor(a, c);
        if (v != null && v.set && v.set.call(u, f), !d) {
          if (r && typeof c == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), A = Number(c);
            Number.isInteger(A) && A >= b.v && y(b, A + 1);
          }
          ss(s);
        }
        return !0;
      },
      ownKeys(a) {
        l(s);
        var c = Reflect.ownKeys(a).filter((p) => {
          var d = n.get(p);
          return d === void 0 || d.v !== je;
        });
        for (var [f, u] of n)
          u.v !== je && !(f in a) && c.push(f);
        return c;
      },
      setPrototypeOf() {
        dc();
      }
    }
  );
}
function po(e) {
  try {
    if (e !== null && typeof e == "object" && er in e)
      return e[er];
  } catch {
  }
  return e;
}
function Ic(e, t) {
  return Object.is(po(e), po(t));
}
var ho, wa, xa, ka;
function qi() {
  if (ho === void 0) {
    ho = window, wa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    xa = Qn(t, "firstChild").get, ka = Qn(t, "nextSibling").get, fo(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), fo(n) && (n.__t = void 0);
  }
}
function Xe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function at(e) {
  return (
    /** @type {TemplateNode | null} */
    xa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
  return (
    /** @type {TemplateNode | null} */
    ka.call(e)
  );
}
function x(e, t) {
  if (!ee)
    return /* @__PURE__ */ at(e);
  var n = /* @__PURE__ */ at(Q);
  if (n === null)
    n = Q.appendChild(Xe());
  else if (t && n.nodeType !== _s) {
    var r = Xe();
    return n == null || n.before(r), Be(r), r;
  }
  return t && fi(
    /** @type {Text} */
    n
  ), Be(n), n;
}
function St(e, t = !1) {
  if (!ee) {
    var n = /* @__PURE__ */ at(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Yt(n) : n;
  }
  if (t) {
    if ((Q == null ? void 0 : Q.nodeType) !== _s) {
      var r = Xe();
      return Q == null || Q.before(r), Be(r), r;
    }
    fi(
      /** @type {Text} */
      Q
    );
  }
  return Q;
}
function $(e, t = 1, n = !1) {
  let r = ee ? Q : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ Yt(r);
  if (!ee)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== _s) {
      var i = Xe();
      return r === null ? s == null || s.after(i) : r.before(i), Be(i), i;
    }
    fi(
      /** @type {Text} */
      r
    );
  }
  return Be(r), r;
}
function Ji(e) {
  e.textContent = "";
}
function Ea() {
  return !1;
}
function Zi(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Wo, e, void 0)
  );
}
function fi(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === _s; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function Sa(e) {
  ee && /* @__PURE__ */ at(e) !== null && Ji(e);
}
let go = !1;
function $a() {
  go || (go = !0, document.addEventListener(
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
function Fr(e) {
  var t = te, n = se;
  bt(null), Ut(null);
  try {
    return e();
  } finally {
    bt(t), Ut(n);
  }
}
function Ca(e, t, n, r = n) {
  e.addEventListener(t, () => Fr(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), $a();
}
function Mc(e) {
  se === null && (te === null && ac(), oc()), Tn && ic();
}
function Lc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Kt(e, t, n) {
  var r = se;
  r !== null && (r.f & lt) !== 0 && (e |= lt);
  var s = {
    ctx: Je,
    deps: null,
    nodes: null,
    f: e | qe | gt,
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
      Lr(s);
    } catch (a) {
      throw Ue(s), a;
    }
  else t !== null && $t(s);
  var i = s;
  if (n && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & cr) === 0 && (i = i.first, (e & Wt) !== 0 && (e & sr) !== 0 && i !== null && (i.f |= sr)), i !== null && (i.parent = r, r !== null && Lc(i, r), te !== null && (te.f & Le) !== 0 && (e & Nn) === 0)) {
    var o = (
      /** @type {Derived} */
      te
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return s;
}
function Qi() {
  return te !== null && !Ct;
}
function eo(e) {
  const t = Kt(oi, null, !1);
  return we(t, Te), t.teardown = e, t;
}
function Gs(e) {
  Mc();
  var t = (
    /** @type {Effect} */
    se.f
  ), n = !te && (t & Rt) !== 0 && (t & lr) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Je
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return Aa(e);
}
function Aa(e) {
  return Kt(ls | ec, e, !1);
}
function qc(e) {
  dn.ensure();
  const t = Kt(Nn | cr, e, !0);
  return () => {
    Ue(t);
  };
}
function Pc(e) {
  dn.ensure();
  const t = Kt(Nn | cr, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? tr(t, () => {
      Ue(t), r(void 0);
    }) : (Ue(t), r(void 0));
  });
}
function ui(e) {
  return Kt(ls, e, !1);
}
function Dc(e) {
  return Kt(Ki | cr, e, !0);
}
function di(e, t = 0) {
  return Kt(oi | t, e, !0);
}
function D(e, t = [], n = [], r = []) {
  $c(r, t, n, (s) => {
    Kt(oi, () => e(...s.map(l)), !0);
  });
}
function vi(e, t = 0) {
  var n = Kt(Wt | t, e, !0);
  return n;
}
function pt(e) {
  return Kt(Rt | cr, e, !0);
}
function Ta(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Tn, r = te;
    mo(!0), bt(null);
    try {
      t.call(null);
    } finally {
      mo(n), bt(r);
    }
  }
}
function to(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Fr(() => {
      s.abort(Hn);
    });
    var r = n.next;
    (n.f & Nn) !== 0 ? n.parent = null : Ue(n, t), n = r;
  }
}
function Fc(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Rt) === 0 && Ue(t), t = n;
  }
}
function Ue(e, t = !0) {
  var n = !1;
  (t || (e.f & Jo) !== 0) && e.nodes !== null && e.nodes.end !== null && (Oc(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), to(e, t && !n), fs(e, 0), we(e, un);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  Ta(e);
  var s = e.parent;
  s !== null && s.first !== null && Na(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Oc(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Yt(e);
    e.remove(), e = n;
  }
}
function Na(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function tr(e, t, n = !0) {
  var r = [];
  Ra(e, r, !0);
  var s = () => {
    n && Ue(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of r)
      a.out(o);
  } else
    s();
}
function Ra(e, t, n) {
  if ((e.f & lt) === 0) {
    e.f ^= lt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & sr) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & Rt) !== 0 && (e.f & Wt) !== 0;
      Ra(s, t, o ? n : !1), s = i;
    }
  }
}
function no(e) {
  ja(e, !0);
}
function ja(e, t) {
  if ((e.f & lt) !== 0) {
    e.f ^= lt, (e.f & Te) === 0 && (we(e, qe), $t(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & sr) !== 0 || (n.f & Rt) !== 0;
      ja(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function Ia(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ Yt(n);
      t.append(n), n = s;
    }
}
let Fs = !1, Tn = !1;
function mo(e) {
  Tn = e;
}
let te = null, Ct = !1;
function bt(e) {
  te = e;
}
let se = null;
function Ut(e) {
  se = e;
}
let mt = null;
function Ma(e) {
  te !== null && (mt === null ? mt = [e] : mt.push(e));
}
let Ge = null, rt = 0, ut = null;
function zc(e) {
  ut = e;
}
let La = 1, Wn = 0, nr = Wn;
function bo(e) {
  nr = e;
}
function qa() {
  return ++La;
}
function ws(e) {
  var t = e.f;
  if ((t & qe) !== 0)
    return !0;
  if (t & Le && (e.f &= ~ir), (t & Nt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (ws(
        /** @type {Derived} */
        i
      ) && ga(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & gt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Ie === null && we(e, Te);
  }
  return !1;
}
function Pa(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(mt !== null && Rr.call(mt, e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & Le) !== 0 ? Pa(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? we(i, qe) : (i.f & Te) !== 0 && we(i, Nt), $t(
        /** @type {Effect} */
        i
      ));
    }
}
function Da(e) {
  var g;
  var t = Ge, n = rt, r = ut, s = te, i = mt, o = Je, a = Ct, c = nr, f = e.f;
  Ge = /** @type {null | Value[]} */
  null, rt = 0, ut = null, te = (f & (Rt | Nn)) === 0 ? e : null, mt = null, jr(e.ctx), Ct = !1, nr = ++Wn, e.ac !== null && (Fr(() => {
    e.ac.abort(Hn);
  }), e.ac = null);
  try {
    e.f |= Ai;
    var u = (
      /** @type {Function} */
      e.fn
    ), p = u();
    e.f |= lr;
    var d = e.deps, h = K == null ? void 0 : K.is_fork;
    if (Ge !== null) {
      var _;
      if (h || fs(e, rt), d !== null && rt > 0)
        for (d.length = rt + Ge.length, _ = 0; _ < Ge.length; _++)
          d[rt + _] = Ge[_];
      else
        e.deps = d = Ge;
      if (Qi() && (e.f & gt) !== 0)
        for (_ = rt; _ < d.length; _++)
          ((g = d[_]).reactions ?? (g.reactions = [])).push(e);
    } else !h && d !== null && rt < d.length && (fs(e, rt), d.length = rt);
    if (ra() && ut !== null && !Ct && d !== null && (e.f & (Le | Nt | qe)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      ut.length; _++)
        Pa(
          ut[_],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (Wn++, s.deps !== null)
        for (let v = 0; v < n; v += 1)
          s.deps[v].rv = Wn;
      if (t !== null)
        for (const v of t)
          v.rv = Wn;
      ut !== null && (r === null ? r = ut : r.push(.../** @type {Source[]} */
      ut));
    }
    return (e.f & Cn) !== 0 && (e.f ^= Cn), p;
  } catch (v) {
    return ia(v);
  } finally {
    e.f ^= Ai, Ge = t, rt = n, ut = r, te = s, mt = i, jr(o), Ct = a, nr = c;
  }
}
function Bc(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Kl.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Le) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Ge === null || !Rr.call(Ge, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & gt) !== 0 && (i.f ^= gt, i.f &= ~ir), Gi(i), Rc(i), fs(i, 0);
  }
}
function fs(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Bc(e, n[r]);
}
function Lr(e) {
  var t = e.f;
  if ((t & un) === 0) {
    we(e, Te);
    var n = se, r = Fs;
    se = e, Fs = !0;
    try {
      (t & (Wt | Go)) !== 0 ? Fc(e) : to(e), Ta(e);
      var s = Da(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = La;
      var i;
      Ci && bc && (e.f & qe) !== 0 && e.deps;
    } finally {
      Fs = r, se = n;
    }
  }
}
async function Uc() {
  await Promise.resolve(), W();
}
function l(e) {
  var t = e.f, n = (t & Le) !== 0;
  if (te !== null && !Ct) {
    var r = se !== null && (se.f & un) !== 0;
    if (!r && (mt === null || !Rr.call(mt, e))) {
      var s = te.deps;
      if ((te.f & Ai) !== 0)
        e.rv < Wn && (e.rv = Wn, Ge === null && s !== null && s[rt] === e ? rt++ : Ge === null ? Ge = [e] : Ge.push(e));
      else {
        (te.deps ?? (te.deps = [])).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [te] : Rr.call(i, te) || i.push(te);
      }
    }
  }
  if (Tn && An.has(e))
    return An.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Tn) {
      var a = o.v;
      return ((o.f & Te) === 0 && o.reactions !== null || Oa(o)) && (a = Xi(o)), An.set(o, a), a;
    }
    var c = (o.f & gt) === 0 && !Ct && te !== null && (Fs || (te.f & gt) !== 0), f = (o.f & lr) === 0;
    ws(o) && (c && (o.f |= gt), ga(o)), c && !f && (ma(o), Fa(o));
  }
  if (Ie != null && Ie.has(e))
    return Ie.get(e);
  if ((e.f & Cn) !== 0)
    throw e.v;
  return e.v;
}
function Fa(e) {
  if (e.f |= gt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & Le) !== 0 && (t.f & gt) === 0 && (ma(
        /** @type {Derived} */
        t
      ), Fa(
        /** @type {Derived} */
        t
      ));
}
function Oa(e) {
  if (e.v === je) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (An.has(t) || (t.f & Le) !== 0 && Oa(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function fr(e) {
  var t = Ct;
  try {
    return Ct = !0, e();
  } finally {
    Ct = t;
  }
}
const Hc = ["touchstart", "touchmove"];
function Vc(e) {
  return Hc.includes(e);
}
const Os = Symbol("events"), za = /* @__PURE__ */ new Set(), Pi = /* @__PURE__ */ new Set();
function Wc(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || Di.call(t, i), !i.cancelBubble)
      return Fr(() => n == null ? void 0 : n.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? At(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Ba(e, t, n, r, s) {
  var i = { capture: r, passive: s }, o = Wc(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && eo(() => {
    t.removeEventListener(e, o, i);
  });
}
function Y(e, t, n) {
  (t[Os] ?? (t[Os] = {}))[e] = n;
}
function xs(e) {
  for (var t = 0; t < e.length; t++)
    za.add(e[t]);
  for (var n of Pi)
    n(e);
}
let _o = null;
function Di(e) {
  var v, b;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = ((v = e.composedPath) == null ? void 0 : v.call(e)) || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  _o = e;
  var o = 0, a = _o === e && e.__root;
  if (a) {
    var c = s.indexOf(a);
    if (c !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var f = s.indexOf(t);
    if (f === -1)
      return;
    c <= f && (o = c);
  }
  if (i = /** @type {Element} */
  s[o] || e.target, i !== t) {
    Ws(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var u = te, p = se;
    bt(null), Ut(null);
    try {
      for (var d, h = []; i !== null; ) {
        var _ = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var g = (b = i[Os]) == null ? void 0 : b[r];
          g != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && g.call(i, e);
        } catch (A) {
          d ? h.push(A) : d = A;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        i = _;
      }
      if (d) {
        for (let A of h)
          queueMicrotask(() => {
            throw A;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, bt(u), Ut(p);
    }
  }
}
var zo, Bo;
const Ei = (Bo = (zo = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : zo.trustedTypes) == null ? void 0 : /* @__PURE__ */ Bo.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function Yc(e) {
  return (
    /** @type {string} */
    (Ei == null ? void 0 : Ei.createHTML(e)) ?? e
  );
}
function Ua(e, t = !1) {
  var n = Zi("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? Yc(e) : e, n.content;
}
function Tt(e, t) {
  var n = (
    /** @type {Effect} */
    se
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var n = (t & Vo) !== 0, r = (t & Yl) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    if (ee)
      return Tt(Q, null), Q;
    s === void 0 && (s = Ua(i ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ at(s)));
    var o = (
      /** @type {TemplateNode} */
      r || wa ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ at(o)
      ), c = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      Tt(a, c);
    } else
      Tt(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function Kc(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & Vo) !== 0, i = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
  return () => {
    if (ee)
      return Tt(Q, null), Q;
    if (!o) {
      var a = (
        /** @type {DocumentFragment} */
        Ua(i, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ at(a)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ at(c); )
          o.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ at(c)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ at(c);
    }
    var f = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ at(f)
      ), p = (
        /** @type {TemplateNode} */
        f.lastChild
      );
      Tt(u, p);
    } else
      Tt(f, f);
    return f;
  };
}
// @__NO_SIDE_EFFECTS__
function ur(e, t) {
  return /* @__PURE__ */ Kc(e, t, "svg");
}
function yo(e = "") {
  if (!ee) {
    var t = Xe(e + "");
    return Tt(t, t), t;
  }
  var n = Q;
  return n.nodeType !== _s ? (n.before(n = Xe()), Be(n)) : fi(
    /** @type {Text} */
    n
  ), Tt(n, n), n;
}
function is() {
  if (ee)
    return Tt(Q, null), Q;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Xe();
  return e.append(t, n), Tt(t, n), e;
}
function C(e, t) {
  if (ee) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      se
    );
    ((n.f & lr) === 0 || n.nodes.end === null) && (n.nodes.end = Q), ys();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let Fi = !0;
function Z(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Ha(e, t) {
  return Va(e, t);
}
function Gc(e, t) {
  qi(), t.intro = t.intro ?? !1;
  const n = t.target, r = ee, s = Q;
  try {
    for (var i = /* @__PURE__ */ at(n); i && (i.nodeType !== Dr || /** @type {Comment} */
    i.data !== Vi); )
      i = /* @__PURE__ */ Yt(i);
    if (!i)
      throw Nr;
    fn(!0), Be(
      /** @type {Comment} */
      i
    );
    const o = Va(e, { ...t, anchor: i });
    return fn(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== Nr && console.warn("Failed to hydrate: ", o), t.recover === !1 && cc(), qi(), Ji(n), fn(!1), Ha(e, t);
  } finally {
    fn(r), Be(s);
  }
}
const Ls = /* @__PURE__ */ new Map();
function Va(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: o = !0 }) {
  qi();
  var a = /* @__PURE__ */ new Set(), c = (p) => {
    for (var d = 0; d < p.length; d++) {
      var h = p[d];
      if (!a.has(h)) {
        a.add(h);
        var _ = Vc(h);
        for (const b of [t, document]) {
          var g = Ls.get(b);
          g === void 0 && (g = /* @__PURE__ */ new Map(), Ls.set(b, g));
          var v = g.get(h);
          v === void 0 ? (b.addEventListener(h, Di, { passive: _ }), g.set(h, 1)) : g.set(h, v + 1);
        }
      }
    }
  };
  c(ii(za)), Pi.add(c);
  var f = void 0, u = Pc(() => {
    var p = n ?? t.appendChild(Xe());
    return Ec(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (d) => {
        vn({});
        var h = (
          /** @type {ComponentContext} */
          Je
        );
        if (i && (h.c = i), s && (r.$$events = s), ee && Tt(
          /** @type {TemplateNode} */
          d,
          null
        ), Fi = o, f = e(d, r) || {}, Fi = !0, ee && (se.nodes.end = Q, Q === null || Q.nodeType !== Dr || /** @type {Comment} */
        Q.data !== Wi))
          throw ai(), Nr;
        pn();
      }
    ), () => {
      var g;
      for (var d of a)
        for (const v of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Ls.get(v)
          ), _ = (
            /** @type {number} */
            h.get(d)
          );
          --_ == 0 ? (v.removeEventListener(d, Di), h.delete(d), h.size === 0 && Ls.delete(v)) : h.set(d, _);
        }
      Pi.delete(c), p !== n && ((g = p.parentNode) == null || g.removeChild(p));
    };
  });
  return Oi.set(f, u), f;
}
let Oi = /* @__PURE__ */ new WeakMap();
function Xc(e, t) {
  const n = Oi.get(e);
  return n ? (Oi.delete(e), n(t)) : Promise.resolve();
}
var kt, zt, it, Zn, ms, bs, ri;
class Wa {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    ye(this, "anchor");
    /** @type {Map<Batch, Key>} */
    J(this, kt, /* @__PURE__ */ new Map());
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
    J(this, zt, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    J(this, it, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    J(this, Zn, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    J(this, ms, !0);
    J(this, bs, () => {
      var t = (
        /** @type {Batch} */
        K
      );
      if (m(this, kt).has(t)) {
        var n = (
          /** @type {Key} */
          m(this, kt).get(t)
        ), r = m(this, zt).get(n);
        if (r)
          no(r), m(this, Zn).delete(n);
        else {
          var s = m(this, it).get(n);
          s && (m(this, zt).set(n, s.effect), m(this, it).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [i, o] of m(this, kt)) {
          if (m(this, kt).delete(i), i === t)
            break;
          const a = m(this, it).get(o);
          a && (Ue(a.effect), m(this, it).delete(o));
        }
        for (const [i, o] of m(this, zt)) {
          if (i === n || m(this, Zn).has(i)) continue;
          const a = () => {
            if (Array.from(m(this, kt).values()).includes(i)) {
              var f = document.createDocumentFragment();
              Ia(o, f), f.append(Xe()), m(this, it).set(i, { effect: o, fragment: f });
            } else
              Ue(o);
            m(this, Zn).delete(i), m(this, zt).delete(i);
          };
          m(this, ms) || !r ? (m(this, Zn).add(i), tr(o, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    J(this, ri, (t) => {
      m(this, kt).delete(t);
      const n = Array.from(m(this, kt).values());
      for (const [r, s] of m(this, it))
        n.includes(r) || (Ue(s.effect), m(this, it).delete(r));
    });
    this.anchor = t, V(this, ms, n);
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
    ), s = Ea();
    if (n && !m(this, zt).has(t) && !m(this, it).has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = Xe();
        i.append(o), m(this, it).set(t, {
          effect: pt(() => n(o)),
          fragment: i
        });
      } else
        m(this, zt).set(
          t,
          pt(() => n(this.anchor))
        );
    if (m(this, kt).set(r, t), s) {
      for (const [a, c] of m(this, zt))
        a === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [a, c] of m(this, it))
        a === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(m(this, bs)), r.ondiscard(m(this, ri));
    } else
      ee && (this.anchor = Q), m(this, bs).call(this);
  }
}
kt = new WeakMap(), zt = new WeakMap(), it = new WeakMap(), Zn = new WeakMap(), ms = new WeakMap(), bs = new WeakMap(), ri = new WeakMap();
function ro(e) {
  Je === null && Qo(), Gs(() => {
    const t = fr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Ya(e) {
  Je === null && Qo(), ro(() => () => fr(e));
}
function B(e, t, n = !1) {
  ee && ys();
  var r = new Wa(e), s = n ? sr : 0;
  function i(o, a) {
    if (ee) {
      const u = ea(e);
      var c;
      if (u === Vi ? c = 0 : u === si ? c = !1 : c = parseInt(u.substring(1)), o !== c) {
        var f = Ys();
        Be(f), r.anchor = f, fn(!1), r.ensure(o, a), fn(!0);
        return;
      }
    }
    r.ensure(o, a);
  }
  vi(() => {
    var o = !1;
    t((a, c = 0) => {
      o = !0, i(c, a);
    }), o || i(!1, null);
  }, s);
}
const Jc = Symbol("NaN");
function Zc(e, t, n) {
  ee && ys();
  var r = new Wa(e);
  vi(() => {
    var s = t();
    s !== s && (s = /** @type {any} */
    Jc), r.ensure(s, n);
  });
}
function ot(e, t) {
  return t;
}
function Qc(e, t, n) {
  for (var r = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let p = t[a];
    tr(
      p,
      () => {
        if (i) {
          if (i.pending.delete(p), i.done.add(p), i.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            zi(ii(i.done)), d.delete(i), d.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var c = r.length === 0 && n !== null;
    if (c) {
      var f = (
        /** @type {Element} */
        n
      ), u = (
        /** @type {Element} */
        f.parentNode
      );
      Ji(u), u.append(f), e.items.clear();
    }
    zi(t, !c);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(i);
}
function zi(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    Ue(e[n], t);
}
var wo;
function ze(e, t, n, r, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), c = (t & Ho) !== 0;
  if (c) {
    var f = (
      /** @type {Element} */
      e
    );
    o = ee ? Be(/* @__PURE__ */ at(f)) : f.appendChild(Xe());
  }
  ee && ys();
  var u = null, p = /* @__PURE__ */ ha(() => {
    var b = n();
    return Yi(b) ? b : b == null ? [] : ii(b);
  }), d, h = !0;
  function _() {
    v.fallback = u, ef(v, d, o, t, r), u !== null && (d.length === 0 ? (u.f & cn) === 0 ? no(u) : (u.f ^= cn, ns(u, null, o)) : tr(u, () => {
      u = null;
    }));
  }
  var g = vi(() => {
    d = /** @type {V[]} */
    l(p);
    var b = d.length;
    let A = !1;
    if (ee) {
      var k = ea(o) === si;
      k !== (b === 0) && (o = Ys(), Be(o), fn(!1), A = !0);
    }
    for (var L = /* @__PURE__ */ new Set(), R = (
      /** @type {Batch} */
      K
    ), j = Ea(), F = 0; F < b; F += 1) {
      ee && Q.nodeType === Dr && /** @type {Comment} */
      Q.data === Wi && (o = /** @type {Comment} */
      Q, A = !0, fn(!1));
      var oe = d[F], ne = r(oe, F), ue = h ? null : a.get(ne);
      ue ? (ue.v && Mr(ue.v, oe), ue.i && Mr(ue.i, F), j && R.unskip_effect(ue.e)) : (ue = tf(
        a,
        h ? o : wo ?? (wo = Xe()),
        oe,
        ne,
        F,
        s,
        t,
        n
      ), h || (ue.e.f |= cn), a.set(ne, ue)), L.add(ne);
    }
    if (b === 0 && i && !u && (h ? u = pt(() => i(o)) : (u = pt(() => i(wo ?? (wo = Xe()))), u.f |= cn)), b > L.size && sc(), ee && b > 0 && Be(Ys()), !h)
      if (j) {
        for (const [Ne, ce] of a)
          L.has(Ne) || R.skip_effect(ce.e);
        R.oncommit(_), R.ondiscard(() => {
        });
      } else
        _();
    A && fn(!0), l(p);
  }), v = { effect: g, items: a, outrogroups: null, fallback: u };
  h = !1, ee && (o = Q);
}
function Qr(e) {
  for (; e !== null && (e.f & Rt) === 0; )
    e = e.next;
  return e;
}
function ef(e, t, n, r, s) {
  var ue, Ne, ce, ve, He, Ze, ct, q, pe;
  var i = (r & Ol) !== 0, o = t.length, a = e.items, c = Qr(e.effect.first), f, u = null, p, d = [], h = [], _, g, v, b;
  if (i)
    for (b = 0; b < o; b += 1)
      _ = t[b], g = s(_, b), v = /** @type {EachItem} */
      a.get(g).e, (v.f & cn) === 0 && ((Ne = (ue = v.nodes) == null ? void 0 : ue.a) == null || Ne.measure(), (p ?? (p = /* @__PURE__ */ new Set())).add(v));
  for (b = 0; b < o; b += 1) {
    if (_ = t[b], g = s(_, b), v = /** @type {EachItem} */
    a.get(g).e, e.outrogroups !== null)
      for (const me of e.outrogroups)
        me.pending.delete(v), me.done.delete(v);
    if ((v.f & cn) !== 0)
      if (v.f ^= cn, v === c)
        ns(v, null, n);
      else {
        var A = u ? u.next : c;
        v === e.effect.last && (e.effect.last = v.prev), v.prev && (v.prev.next = v.next), v.next && (v.next.prev = v.prev), Sn(e, u, v), Sn(e, v, A), ns(v, A, n), u = v, d = [], h = [], c = Qr(u.next);
        continue;
      }
    if ((v.f & lt) !== 0 && (no(v), i && ((ve = (ce = v.nodes) == null ? void 0 : ce.a) == null || ve.unfix(), (p ?? (p = /* @__PURE__ */ new Set())).delete(v))), v !== c) {
      if (f !== void 0 && f.has(v)) {
        if (d.length < h.length) {
          var k = h[0], L;
          u = k.prev;
          var R = d[0], j = d[d.length - 1];
          for (L = 0; L < d.length; L += 1)
            ns(d[L], k, n);
          for (L = 0; L < h.length; L += 1)
            f.delete(h[L]);
          Sn(e, R.prev, j.next), Sn(e, u, R), Sn(e, j, k), c = k, u = j, b -= 1, d = [], h = [];
        } else
          f.delete(v), ns(v, c, n), Sn(e, v.prev, v.next), Sn(e, v, u === null ? e.effect.first : u.next), Sn(e, u, v), u = v;
        continue;
      }
      for (d = [], h = []; c !== null && c !== v; )
        (f ?? (f = /* @__PURE__ */ new Set())).add(c), h.push(c), c = Qr(c.next);
      if (c === null)
        continue;
    }
    (v.f & cn) === 0 && d.push(v), u = v, c = Qr(v.next);
  }
  if (e.outrogroups !== null) {
    for (const me of e.outrogroups)
      me.pending.size === 0 && (zi(ii(me.done)), (He = e.outrogroups) == null || He.delete(me));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || f !== void 0) {
    var F = [];
    if (f !== void 0)
      for (v of f)
        (v.f & lt) === 0 && F.push(v);
    for (; c !== null; )
      (c.f & lt) === 0 && c !== e.fallback && F.push(c), c = Qr(c.next);
    var oe = F.length;
    if (oe > 0) {
      var ne = (r & Ho) !== 0 && o === 0 ? n : null;
      if (i) {
        for (b = 0; b < oe; b += 1)
          (ct = (Ze = F[b].nodes) == null ? void 0 : Ze.a) == null || ct.measure();
        for (b = 0; b < oe; b += 1)
          (pe = (q = F[b].nodes) == null ? void 0 : q.a) == null || pe.fix();
      }
      Qc(e, F, ne);
    }
  }
  i && At(() => {
    var me, Ve;
    if (p !== void 0)
      for (v of p)
        (Ve = (me = v.nodes) == null ? void 0 : me.a) == null || Ve.apply();
  });
}
function tf(e, t, n, r, s, i, o, a) {
  var c = (o & Dl) !== 0 ? (o & zl) === 0 ? /* @__PURE__ */ _a(n, !1, !1) : or(n) : null, f = (o & Fl) !== 0 ? or(s) : null;
  return {
    v: c,
    i: f,
    e: pt(() => (i(t, c ?? n, f ?? s, a), () => {
      e.delete(r);
    }))
  };
}
function ns(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & cn) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Yt(r)
      );
      if (i.before(r), r === s)
        return;
      r = o;
    }
}
function Sn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const nf = () => performance.now(), ln = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => nf(),
  tasks: /* @__PURE__ */ new Set()
};
function Ka() {
  const e = ln.now();
  ln.tasks.forEach((t) => {
    t.c(e) || (ln.tasks.delete(t), t.f());
  }), ln.tasks.size !== 0 && ln.tick(Ka);
}
function rf(e) {
  let t;
  return ln.tasks.size === 0 && ln.tick(Ka), {
    promise: new Promise((n) => {
      ln.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      ln.tasks.delete(t);
    }
  };
}
function Xs(e, t) {
  Fr(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function sf(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function xo(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [s, i] = r.split(":");
    if (!s || i === void 0) break;
    const o = sf(s.trim());
    t[o] = i.trim();
  }
  return t;
}
const of = (e) => e;
function Js(e, t, n, r) {
  var v;
  var s = (e & Wl) !== 0, i = "both", o, a = t.inert, c = t.style.overflow, f, u;
  function p() {
    return Fr(() => o ?? (o = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
    {}, {
      direction: i
    })));
  }
  var d = {
    is_global: s,
    in() {
      t.inert = a, f = Bi(t, p(), u, 1, () => {
        Xs(t, "introend"), f == null || f.abort(), f = o = void 0, t.style.overflow = c;
      });
    },
    out(b) {
      t.inert = !0, u = Bi(t, p(), f, 0, () => {
        Xs(t, "outroend"), b == null || b();
      });
    },
    stop: () => {
      f == null || f.abort(), u == null || u.abort();
    }
  }, h = (
    /** @type {Effect & { nodes: EffectNodes }} */
    se
  );
  if (((v = h.nodes).t ?? (v.t = [])).push(d), Fi) {
    var _ = s;
    if (!_) {
      for (var g = (
        /** @type {Effect | null} */
        h.parent
      ); g && (g.f & sr) !== 0; )
        for (; (g = g.parent) && (g.f & Wt) === 0; )
          ;
      _ = !g || (g.f & lr) !== 0;
    }
    _ && ui(() => {
      fr(() => d.in());
    });
  }
}
function Bi(e, t, n, r, s) {
  var i = r === 1;
  if (Zl(t)) {
    var o, a = !1;
    return At(() => {
      if (!a) {
        var v = t({ direction: i ? "in" : "out" });
        o = Bi(e, v, n, r, s);
      }
    }), {
      abort: () => {
        a = !0, o == null || o.abort();
      },
      deactivate: () => o.deactivate(),
      reset: () => o.reset(),
      t: () => o.t()
    };
  }
  if (n == null || n.deactivate(), !(t != null && t.duration) && !(t != null && t.delay))
    return Xs(e, i ? "introstart" : "outrostart"), s(), {
      abort: wr,
      deactivate: wr,
      reset: wr,
      t: () => r
    };
  const { delay: c = 0, css: f, tick: u, easing: p = of } = t;
  var d = [];
  if (i && n === void 0 && (u && u(0, 1), f)) {
    var h = xo(f(0, 1));
    d.push(h, h);
  }
  var _ = () => 1 - r, g = e.animate(d, { duration: c, fill: "forwards" });
  return g.onfinish = () => {
    g.cancel(), Xs(e, i ? "introstart" : "outrostart");
    var v = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var b = r - v, A = (
      /** @type {number} */
      t.duration * Math.abs(b)
    ), k = [];
    if (A > 0) {
      var L = !1;
      if (f)
        for (var R = Math.ceil(A / 16.666666666666668), j = 0; j <= R; j += 1) {
          var F = v + b * p(j / R), oe = xo(f(F, 1 - F));
          k.push(oe), L || (L = oe.overflow === "hidden");
        }
      L && (e.style.overflow = "hidden"), _ = () => {
        var ne = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          g.currentTime
        );
        return v + b * p(ne / A);
      }, u && rf(() => {
        if (g.playState !== "running") return !1;
        var ne = _();
        return u(ne, 1 - ne), !0;
      });
    }
    g = e.animate(k, { duration: A, fill: "forwards" }), g.onfinish = () => {
      _ = () => r, u == null || u(r, 1 - r), s();
    };
  }, {
    abort: () => {
      g && (g.cancel(), g.effect = null, g.onfinish = wr);
    },
    deactivate: () => {
      s = wr;
    },
    reset: () => {
      r === 0 && (u == null || u(1, 0));
    },
    t: () => _()
  };
}
function Rn(e, t) {
  ui(() => {
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
      const s = Zi("style");
      s.id = t.hash, s.textContent = t.code, r.appendChild(s);
    }
  });
}
const ko = [...` 	
\r\f \v\uFEFF`];
function af(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s in n)
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, o = 0; (o = r.indexOf(s, o)) >= 0; ) {
          var a = o + i;
          (o === 0 || ko.includes(r[o - 1])) && (a === r.length || ko.includes(r[a])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(a + 1) : o = a;
        }
  }
  return r === "" ? null : r;
}
function lf(e, t) {
  return e == null ? null : String(e);
}
function De(e, t, n, r, s, i) {
  var o = e.__className;
  if (ee || o !== n || o === void 0) {
    var a = af(n, r, i);
    (!ee || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = n;
  } else if (i && s !== i)
    for (var c in i) {
      var f = !!i[c];
      (s == null || f !== !!s[c]) && e.classList.toggle(c, f);
    }
  return i;
}
function rr(e, t, n, r) {
  var s = e.__style;
  if (ee || s !== t) {
    var i = lf(t);
    (!ee || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return r;
}
function Ga(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Yi(t))
      return hc();
    for (var r of e.options)
      r.selected = t.includes(os(r));
    return;
  }
  for (r of e.options) {
    var s = os(r);
    if (Ic(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function cf(e) {
  var t = new MutationObserver(() => {
    Ga(e, e.__value);
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
  }), eo(() => {
    t.disconnect();
  });
}
function Eo(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  Ca(e, "change", (i) => {
    var o = i ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(o), os);
    else {
      var c = e.querySelector(o) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = c && os(c);
    }
    n(a), K !== null && r.add(K);
  }), ui(() => {
    var i = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Ks ?? K
      );
      if (r.has(o))
        return;
    }
    if (Ga(e, i, s), s && i === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (i = os(a), n(i));
    }
    e.__value = i, s = !1;
  }), cf(e);
}
function os(e) {
  return "__value" in e ? e.__value : e.value;
}
const ff = Symbol("is custom element"), uf = Symbol("is html"), df = nc ? "link" : "LINK";
function Xa(e) {
  if (ee) {
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
    e.__on_r = n, At(n), $a();
  }
}
function de(e, t, n, r) {
  var s = vf(e);
  ee && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === df) || s[t] !== (s[t] = n) && (t === "loading" && (e[tc] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && pf(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function vf(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [ff]: e.nodeName.includes("-"),
      [uf]: e.namespaceURI === Wo
    })
  );
}
var So = /* @__PURE__ */ new Map();
function pf(e) {
  var t = e.getAttribute("is") || e.nodeName, n = So.get(t);
  if (n) return n;
  So.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = Gl(s);
    for (var o in r)
      r[o].set && n.push(o);
    s = Yo(s);
  }
  return n;
}
function Zs(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Ca(e, "input", async (s) => {
    var i = s ? e.defaultValue : e.value;
    if (i = Si(e) ? $i(i) : i, n(i), K !== null && r.add(K), await Uc(), i !== (i = t())) {
      var o = e.selectionStart, a = e.selectionEnd, c = e.value.length;
      if (e.value = i ?? "", a !== null) {
        var f = e.value.length;
        o === a && a === c && f > c ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = o, e.selectionEnd = Math.min(a, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (ee && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  fr(t) == null && e.value) && (n(Si(e) ? $i(e.value) : e.value), K !== null && r.add(K)), di(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Ks ?? K
      );
      if (r.has(i))
        return;
    }
    Si(e) && s === $i(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function Si(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function $i(e) {
  return e === "" ? null : +e;
}
function $o(e, t) {
  return e === t || (e == null ? void 0 : e[er]) === t;
}
function zs(e = {}, t, n, r) {
  return ui(() => {
    var s, i;
    return di(() => {
      s = i, i = [], fr(() => {
        e !== n(...i) && (t(e, ...i), s && $o(n(...s), e) && t(null, ...s));
      });
    }), () => {
      At(() => {
        i && $o(n(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
let qs = !1;
function hf(e) {
  var t = qs;
  try {
    return qs = !1, [e(), qs];
  } finally {
    qs = t;
  }
}
function G(e, t, n, r) {
  var A;
  var s = (n & Hl) !== 0, i = (n & Vl) !== 0, o = (
    /** @type {V} */
    r
  ), a = !0, c = () => (a && (a = !1, o = i ? fr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), o), f;
  if (s) {
    var u = er in e || Zo in e;
    f = ((A = Qn(e, t)) == null ? void 0 : A.set) ?? (u && t in e ? (k) => e[t] = k : void 0);
  }
  var p, d = !1;
  s ? [p, d] = hf(() => (
    /** @type {V} */
    e[t]
  )) : p = /** @type {V} */
  e[t], p === void 0 && r !== void 0 && (p = c(), f && (fc(), f(p)));
  var h;
  if (h = () => {
    var k = (
      /** @type {V} */
      e[t]
    );
    return k === void 0 ? c() : (a = !0, k);
  }, (n & Ul) === 0)
    return h;
  if (f) {
    var _ = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(k, L) {
        return arguments.length > 0 ? ((!L || _ || d) && f(L ? h() : k), k) : h();
      })
    );
  }
  var g = !1, v = ((n & Bl) !== 0 ? ci : ha)(() => (g = !1, h()));
  s && l(v);
  var b = (
    /** @type {Effect} */
    se
  );
  return (
    /** @type {() => V} */
    (function(k, L) {
      if (arguments.length > 0) {
        const R = L ? l(v) : s ? Me(k) : k;
        return y(v, R), g = !0, o !== void 0 && (o = R), k;
      }
      return Tn && g || (b.f & un) !== 0 ? v.v : l(v);
    })
  );
}
function gf(e) {
  return new mf(e);
}
var an, vt;
class mf {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    J(this, an);
    /** @type {Record<string, any>} */
    J(this, vt);
    var i;
    var n = /* @__PURE__ */ new Map(), r = (o, a) => {
      var c = /* @__PURE__ */ _a(a, !1, !1);
      return n.set(o, c), c;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(o, a) {
          return l(n.get(a) ?? r(a, Reflect.get(o, a)));
        },
        has(o, a) {
          return a === Zo ? !0 : (l(n.get(a) ?? r(a, Reflect.get(o, a))), Reflect.has(o, a));
        },
        set(o, a, c) {
          return y(n.get(a) ?? r(a, c), c), Reflect.set(o, a, c);
        }
      }
    );
    V(this, vt, (t.hydrate ? Gc : Ha)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && W(), V(this, an, s.$$events);
    for (const o of Object.keys(m(this, vt)))
      o === "$set" || o === "$destroy" || o === "$on" || Ws(this, o, {
        get() {
          return m(this, vt)[o];
        },
        /** @param {any} value */
        set(a) {
          m(this, vt)[o] = a;
        },
        enumerable: !0
      });
    m(this, vt).$set = /** @param {Record<string, any>} next */
    (o) => {
      Object.assign(s, o);
    }, m(this, vt).$destroy = () => {
      Xc(m(this, vt));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    m(this, vt).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    m(this, an)[t] = m(this, an)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return m(this, an)[t].push(r), () => {
      m(this, an)[t] = m(this, an)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    m(this, vt).$destroy();
  }
}
an = new WeakMap(), vt = new WeakMap();
let Ja;
typeof HTMLElement == "function" && (Ja = class extends HTMLElement {
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
        return (i) => {
          const o = Zi("slot");
          s !== "default" && (o.name = s), C(i, o);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = bf(this);
      for (const s of this.$$s)
        s in r && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const i = this.$$g_p(s.name);
        i in this.$$d || (this.$$d[i] = Bs(i, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = gf({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = qc(() => {
        di(() => {
          var s;
          this.$$r = !0;
          for (const i of Vs(this.$$c)) {
            if (!((s = this.$$p_d[i]) != null && s.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const o = Bs(
              i,
              this.$$d[i],
              this.$$p_d,
              "toAttribute"
            );
            o == null ? this.removeAttribute(this.$$p_d[i].attribute || i) : this.setAttribute(this.$$p_d[i].attribute || i, o);
          }
          this.$$r = !1;
        });
      });
      for (const s in this.$$l)
        for (const i of this.$$l[s]) {
          const o = this.$$c.$on(s, i);
          this.$$l_u.set(i, o);
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Bs(t, r, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return Vs(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function Bs(e, t, n, r) {
  var i;
  const s = (i = n[e]) == null ? void 0 : i.type;
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
function bf(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function jn(e, t, n, r, s, i) {
  let o = class extends Ja {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Vs(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return Vs(t).forEach((a) => {
    Ws(o.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(c) {
        var p;
        c = Bs(a, c, t), this.$$d[a] = c;
        var f = this.$$c;
        if (f) {
          var u = (p = Qn(f, a)) == null ? void 0 : p.get;
          u ? f[a] = c : f.$set({ [a]: c });
        }
      }
    });
  }), r.forEach((a) => {
    Ws(o.prototype, a, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[a];
      }
    });
  }), e.element = /** @type {any} */
  o, o;
}
const es = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, _f = [
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
], yf = "[REDACTED]";
function wf(e) {
  let t = e;
  for (const n of _f)
    n.lastIndex = 0, t = t.replace(n, yf);
  return t;
}
let Za = 50;
const Us = [];
let Qs = !1;
const ht = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function xf(e) {
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
function kf() {
  const e = new Error().stack;
  if (!e) return {};
  const n = e.split(`
`).slice(4), r = n.join(`
`), i = (n[0] || "").match(/(?:at\s+(?:\S+\s+)?\()?([^()]+):(\d+):(\d+)\)?/);
  return i ? {
    stackTrace: r,
    fileName: i[1],
    lineNumber: parseInt(i[2], 10),
    columnNumber: parseInt(i[3], 10)
  } : { stackTrace: r };
}
function _r(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = wf(t.map(xf).join(" ")), i = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(i, kf()), i;
}
function yr(e) {
  for (Us.push(e); Us.length > Za; )
    Us.shift();
}
function Ef(e) {
  Qs || (Qs = !0, e && (Za = e), console.log = (...t) => {
    ht.log(...t), yr(_r("log", t, !1));
  }, console.error = (...t) => {
    ht.error(...t), yr(_r("error", t, !0));
  }, console.warn = (...t) => {
    ht.warn(...t), yr(_r("warn", t, !0));
  }, console.info = (...t) => {
    ht.info(...t), yr(_r("info", t, !1));
  }, console.debug = (...t) => {
    ht.debug(...t), yr(_r("debug", t, !1));
  }, console.trace = (...t) => {
    ht.trace(...t), yr(_r("trace", t, !0));
  });
}
function Sf() {
  Qs && (Qs = !1, console.log = ht.log, console.error = ht.error, console.warn = ht.warn, console.info = ht.info, console.debug = ht.debug, console.trace = ht.trace);
}
function $f() {
  return [...Us];
}
function Qa(e) {
  var r;
  if (e.id !== "")
    return 'id("' + e.id + '")';
  if (e === document.body)
    return e.tagName;
  let t = 0;
  const n = ((r = e.parentNode) == null ? void 0 : r.childNodes) || [];
  for (let s = 0; s < n.length; s++) {
    const i = n[s];
    if (i === e)
      return Qa(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    i.nodeType === 1 && i.tagName === e.tagName && t++;
  }
  return "";
}
function Cf(e) {
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
        (f) => f && !f.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/) && !f.match(/^\d/) && f.length > 1
      );
      c.length > 0 && (s += "." + c.slice(0, 2).map((f) => CSS.escape(f)).join("."));
    }
    const i = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const c of i) {
      const f = n.getAttribute(c);
      if (f) {
        s += `[${c}="${CSS.escape(f)}"]`;
        break;
      }
    }
    const o = n.parentElement;
    if (o) {
      const c = Array.from(o.children).filter((f) => f.tagName === n.tagName);
      if (c.length > 1) {
        const f = c.indexOf(n) + 1;
        s += `:nth-of-type(${f})`;
      }
    }
    t.unshift(s);
    const a = t.join(" > ");
    try {
      if (document.querySelectorAll(a).length === 1)
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
  return Af(e);
}
function Af(e) {
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
let ar = !1, el = "", Bt = null, Hs = null, so = null;
function Tf() {
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
function Nf() {
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
function tl(e) {
  if (!ar || !Bt) return;
  const t = e.target;
  if (t === Bt || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  Bt.style.top = `${n.top}px`, Bt.style.left = `${n.left}px`, Bt.style.width = `${n.width}px`, Bt.style.height = `${n.height}px`;
}
function nl(e) {
  var i;
  if (!ar) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = so;
  il();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((i = t.textContent) == null ? void 0 : i.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((o, a) => (o[a.name] = a.value, o), {}),
    xpath: Qa(t),
    selector: Cf(t),
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
function rl(e) {
  e.key === "Escape" && il();
}
function sl(e) {
  ar || (ar = !0, so = e, el = document.body.style.cursor, document.body.style.cursor = "crosshair", Bt = Tf(), Hs = Nf(), document.addEventListener("mousemove", tl, !0), document.addEventListener("click", nl, !0), document.addEventListener("keydown", rl, !0));
}
function il() {
  ar && (ar = !1, so = null, document.body.style.cursor = el, Bt && (Bt.remove(), Bt = null), Hs && (Hs.remove(), Hs = null), document.removeEventListener("mousemove", tl, !0), document.removeEventListener("click", nl, !0), document.removeEventListener("keydown", rl, !0));
}
function Rf() {
  return ar;
}
const Co = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], Ao = 3;
let ol = !1;
function To(e) {
  ol = e;
}
function jf() {
  return ol;
}
let If = 1;
function ts() {
  return If++;
}
function Mf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const o = Math.atan2(r.y - n.y, r.x - n.x), a = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(o - c), r.y - a * Math.sin(o - c)), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(o + c), r.y - a * Math.sin(o + c)), e.stroke();
}
function Lf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i, e.lineJoin = "round";
  const o = Math.min(n.x, r.x), a = Math.min(n.y, r.y), c = Math.abs(r.x - n.x), f = Math.abs(r.y - n.y);
  e.strokeRect(o, a, c, f);
}
function qf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: i } = t;
  e.strokeStyle = s, e.lineWidth = i;
  const o = (n.x + r.x) / 2, a = (n.y + r.y) / 2, c = Math.abs(r.x - n.x) / 2, f = Math.abs(r.y - n.y) / 2;
  c < 1 || f < 1 || (e.beginPath(), e.ellipse(o, a, c, f, 0, 0, Math.PI * 2), e.stroke());
}
function Pf(e, t) {
  const { points: n, color: r, strokeWidth: s } = t;
  if (!(n.length < 2)) {
    e.strokeStyle = r, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n[0].x, n[0].y);
    for (let i = 1; i < n.length; i++)
      e.lineTo(n[i].x, n[i].y);
    e.stroke();
  }
}
function Df(e, t) {
  const { position: n, content: r, color: s, fontSize: i } = t;
  r && (e.font = `bold ${i}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(r, n.x, n.y), e.fillStyle = s, e.fillText(r, n.x, n.y));
}
function al(e, t) {
  switch (e.save(), t.type) {
    case "arrow":
      Mf(e, t);
      break;
    case "rectangle":
      Lf(e, t);
      break;
    case "ellipse":
      qf(e, t);
      break;
    case "freehand":
      Pf(e, t);
      break;
    case "text":
      Df(e, t);
      break;
  }
  e.restore();
}
function ll(e, t) {
  for (const n of t)
    al(e, n);
}
function Ff(e, t, n, r) {
  return new Promise((s, i) => {
    const o = new Image();
    o.onload = () => {
      const a = document.createElement("canvas");
      a.width = n, a.height = r;
      const c = a.getContext("2d");
      if (!c) {
        i(new Error("Canvas context unavailable"));
        return;
      }
      c.drawImage(o, 0, 0, n, r), ll(c, t), s(a.toDataURL("image/jpeg", 0.85));
    }, o.onerror = () => i(new Error("Failed to load image")), o.src = e;
  });
}
async function cl(e, t) {
  const n = `${e.replace(/\/$/, "")}/api/feedback/report`, r = await fetch(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), s = await r.json();
  return r.ok ? { ok: !0, id: s.id } : { ok: !1, error: s.error || `HTTP ${r.status}` };
}
async function Of(e) {
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
async function zf(e, t, n, r, s) {
  try {
    const i = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, o = { response: n };
    r && (o.reason = r), s != null && s.screenshots && s.screenshots.length > 0 && (o.screenshots = s.screenshots), s != null && s.elements && s.elements.length > 0 && (o.elements = s.elements);
    const a = await fetch(i, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o)
    }), c = await a.json();
    return a.ok ? { ok: !0 } : { ok: !1, error: c.error || `HTTP ${a.status}` };
  } catch (i) {
    return { ok: !1, error: i instanceof Error ? i.message : "Failed to respond" };
  }
}
const fl = "jat-feedback-queue", Bf = 50, Uf = 3e4;
let as = null;
function ul() {
  try {
    const e = localStorage.getItem(fl);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function dl(e) {
  try {
    localStorage.setItem(fl, JSON.stringify(e));
  } catch {
  }
}
function No(e, t) {
  const n = ul();
  for (n.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); n.length > Bf; )
    n.shift();
  dl(n);
}
async function Ro() {
  const e = ul();
  if (e.length === 0) return;
  const t = [];
  for (const n of e)
    try {
      (await cl(n.endpoint, n.report)).ok || (n.attempts++, t.push(n));
    } catch {
      n.attempts++, t.push(n);
    }
  dl(t);
}
function Hf() {
  as || (Ro(), as = setInterval(Ro, Uf));
}
function Vf() {
  as && (clearInterval(as), as = null);
}
var Wf = /* @__PURE__ */ ur('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Yf = /* @__PURE__ */ ur('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Kf = /* @__PURE__ */ N("<button><!></button>");
const Gf = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function vl(e, t) {
  vn(t, !0), Rn(e, Gf);
  let n = G(t, "onclick", 7), r = G(t, "open", 7, !1);
  var s = {
    get onclick() {
      return n();
    },
    set onclick(u) {
      n(u), W();
    },
    get open() {
      return r();
    },
    set open(u = !1) {
      r(u), W();
    }
  }, i = Kf();
  let o;
  var a = x(i);
  {
    var c = (u) => {
      var p = Wf();
      C(u, p);
    }, f = (u) => {
      var p = Yf();
      C(u, p);
    };
    B(a, (u) => {
      r() ? u(c) : u(f, !1);
    });
  }
  return w(i), D(() => {
    o = De(i, 1, "jat-fb-btn svelte-joatup", null, o, { open: r() }), de(i, "aria-label", r() ? "Close feedback" : "Send feedback"), de(i, "title", r() ? "Close feedback" : "Send feedback");
  }), Y("click", i, function(...u) {
    var p;
    (p = n()) == null || p.apply(this, u);
  }), C(e, i), pn(s);
}
xs(["click"]);
jn(vl, { onclick: {}, open: {} }, [], [], { mode: "open" });
const pl = "[modern-screenshot]", qr = typeof window < "u", Xf = qr && "Worker" in window;
var Uo;
const io = qr ? (Uo = window.navigator) == null ? void 0 : Uo.userAgent : "", hl = io.includes("Chrome"), ei = io.includes("AppleWebKit") && !hl, oo = io.includes("Firefox"), Jf = (e) => e && "__CONTEXT__" in e, Zf = (e) => e.constructor.name === "CSSFontFaceRule", Qf = (e) => e.constructor.name === "CSSImportRule", eu = (e) => e.constructor.name === "CSSLayerBlockRule", Ht = (e) => e.nodeType === 1, ks = (e) => typeof e.className == "object", gl = (e) => e.tagName === "image", tu = (e) => e.tagName === "use", us = (e) => Ht(e) && typeof e.style < "u" && !ks(e), nu = (e) => e.nodeType === 8, ru = (e) => e.nodeType === 3, Pr = (e) => e.tagName === "IMG", pi = (e) => e.tagName === "VIDEO", su = (e) => e.tagName === "CANVAS", iu = (e) => e.tagName === "TEXTAREA", ou = (e) => e.tagName === "INPUT", au = (e) => e.tagName === "STYLE", lu = (e) => e.tagName === "SCRIPT", cu = (e) => e.tagName === "SELECT", fu = (e) => e.tagName === "SLOT", uu = (e) => e.tagName === "IFRAME", du = (...e) => console.warn(pl, ...e);
function vu(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Ui = (e) => e.startsWith("data:");
function ml(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (qr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !qr)
    return e;
  const n = hi().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function hi(e) {
  return (e && Ht(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const gi = "http://www.w3.org/2000/svg";
function pu(e, t, n) {
  const r = hi(n).createElementNS(gi, "svg");
  return r.setAttributeNS(null, "width", e.toString()), r.setAttributeNS(null, "height", t.toString()), r.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), r;
}
function hu(e, t) {
  let n = new XMLSerializer().serializeToString(e);
  return t && (n = n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`;
}
function gu(e, t) {
  return new Promise((n, r) => {
    const s = new FileReader();
    s.onload = () => n(s.result), s.onerror = () => r(s.error), s.onabort = () => r(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const mu = (e) => gu(e, "dataUrl");
function xr(e, t) {
  const n = hi(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function ds(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: i, onWarn: o } = t ?? {}, a = typeof e == "string" ? xr(e, hi(s)) : e;
    let c = null, f = null;
    function u() {
      n(a), c && clearTimeout(c), f == null || f();
    }
    if (r && (c = setTimeout(u, r)), pi(a)) {
      const p = a.currentSrc || a.src;
      if (!p)
        return a.poster ? ds(a.poster, t).then(n) : u();
      if (a.readyState >= 2)
        return u();
      const d = u, h = (_) => {
        o == null || o(
          "Failed video load",
          p,
          _
        ), i == null || i(_), u();
      };
      f = () => {
        a.removeEventListener("loadeddata", d), a.removeEventListener("error", h);
      }, a.addEventListener("loadeddata", d, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    } else {
      const p = gl(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!p)
        return u();
      const d = async () => {
        if (Pr(a) && "decode" in a)
          try {
            await a.decode();
          } catch (_) {
            o == null || o(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || p,
              _
            );
          }
        u();
      }, h = (_) => {
        o == null || o(
          "Failed image load",
          a.dataset.originalSrc || p,
          _
        ), u();
      };
      if (Pr(a) && a.complete)
        return d();
      f = () => {
        a.removeEventListener("load", d), a.removeEventListener("error", h);
      }, a.addEventListener("load", d, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    }
  });
}
async function bu(e, t) {
  us(e) && (Pr(e) || pi(e) ? await ds(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => ds(r, t)))
  ));
}
const bl = /* @__PURE__ */ (function() {
  let t = 0;
  const n = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${n()}${t}`);
})();
function _l(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let jo = 0;
function _u(e) {
  const t = `${pl}[#${jo}]`;
  return jo++, {
    // eslint-disable-next-line no-console
    time: (n) => e && console.time(`${t} ${n}`),
    // eslint-disable-next-line no-console
    timeEnd: (n) => e && console.timeEnd(`${t} ${n}`),
    warn: (...n) => e && du(...n)
  };
}
function yu(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function yl(e, t) {
  return Jf(e) ? e : wu(e, { ...t, autoDestruct: !0 });
}
async function wu(e, t) {
  var h, _;
  const { scale: n = 1, workerUrl: r, workerNumber: s = 1 } = t || {}, i = !!(t != null && t.debug), o = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (qr ? window.document : void 0), c = ((h = e.ownerDocument) == null ? void 0 : h.defaultView) ?? (qr ? window : void 0), f = /* @__PURE__ */ new Map(), u = {
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
    debug: i,
    fetch: {
      requestInit: yu((_ = t == null ? void 0 : t.fetch) == null ? void 0 : _.bypassingCache),
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
    log: _u(i),
    node: e,
    ownerDocument: a,
    ownerWindow: c,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: wl(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(gi, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Xf && r && s ? s : 0
      })
    ].map(() => {
      try {
        const g = new Worker(r);
        return g.onmessage = async (v) => {
          var k, L, R, j;
          const { url: b, result: A } = v.data;
          A ? (L = (k = f.get(b)) == null ? void 0 : k.resolve) == null || L.call(k, A) : (j = (R = f.get(b)) == null ? void 0 : R.reject) == null || j.call(R, new Error(`Error receiving message from worker: ${b}`));
        }, g.onmessageerror = (v) => {
          var A, k;
          const { url: b } = v.data;
          (k = (A = f.get(b)) == null ? void 0 : A.reject) == null || k.call(A, new Error(`Error receiving message from worker: ${b}`));
        }, g;
      } catch (g) {
        return u.log.warn("Failed to new Worker", g), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      vu(a) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: f,
    drawImageCount: 0,
    tasks: [],
    features: o,
    isEnable: (g) => g === "restoreScrollPosition" ? typeof o == "boolean" ? !1 : o[g] ?? !1 : typeof o == "boolean" ? o : o[g] ?? !0,
    shadowRoots: []
  };
  u.log.time("wait until load"), await bu(e, { timeout: u.timeout, onWarn: u.log.warn }), u.log.timeEnd("wait until load");
  const { width: p, height: d } = xu(e, u);
  return u.width = p, u.height = d, u;
}
function wl(e) {
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
function xu(e, t) {
  let { width: n, height: r } = t;
  if (Ht(e) && (!n || !r)) {
    const s = e.getBoundingClientRect();
    n = n || s.width || Number(e.getAttribute("width")) || 0, r = r || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: n, height: r };
}
async function ku(e, t) {
  const {
    log: n,
    timeout: r,
    drawImageCount: s,
    drawImageInterval: i
  } = t;
  n.time("image to canvas");
  const o = await ds(e, { timeout: r, onWarn: t.log.warn }), { canvas: a, context2d: c } = Eu(e.ownerDocument, t), f = () => {
    try {
      c == null || c.drawImage(o, 0, 0, a.width, a.height);
    } catch (u) {
      t.log.warn("Failed to drawImage", u);
    }
  };
  if (f(), t.isEnable("fixSvgXmlDecode"))
    for (let u = 0; u < s; u++)
      await new Promise((p) => {
        setTimeout(() => {
          c == null || c.clearRect(0, 0, a.width, a.height), f(), p();
        }, u + i);
      });
  return t.drawImageCount = 0, n.timeEnd("image to canvas"), a;
}
function Eu(e, t) {
  const { width: n, height: r, scale: s, backgroundColor: i, maximumCanvasSize: o } = t, a = e.createElement("canvas");
  a.width = Math.floor(n * s), a.height = Math.floor(r * s), a.style.width = `${n}px`, a.style.height = `${r}px`, o && (a.width > o || a.height > o) && (a.width > o && a.height > o ? a.width > a.height ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o) : a.width > o ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o));
  const c = a.getContext("2d");
  return c && i && (c.fillStyle = i, c.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: c };
}
function xl(e, t) {
  if (e.ownerDocument)
    try {
      const i = e.toDataURL();
      if (i !== "data:,")
        return xr(i, e.ownerDocument);
    } catch (i) {
      t.log.warn("Failed to clone canvas", i);
    }
  const n = e.cloneNode(!1), r = e.getContext("2d"), s = n.getContext("2d");
  try {
    return r && s && s.putImageData(
      r.getImageData(0, 0, e.width, e.height),
      0,
      0
    ), n;
  } catch (i) {
    t.log.warn("Failed to clone canvas", i);
  }
  return n;
}
function Su(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return ao(e.contentDocument.body, t);
  } catch (r) {
    t.log.warn("Failed to clone iframe", r);
  }
  return e.cloneNode(!1);
}
function $u(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Cu(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return xr(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await ds(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? xr(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((o) => {
      n.addEventListener("seeked", o, { once: !0 });
    });
    const i = r.createElement("canvas");
    i.width = e.offsetWidth, i.height = e.offsetHeight;
    try {
      const o = i.getContext("2d");
      o && o.drawImage(n, 0, 0, i.width, i.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? xr(e.poster, e.ownerDocument) : n;
    }
    return xl(i, t);
  }
  return n;
}
function Au(e, t) {
  return su(e) ? xl(e, t) : uu(e) ? Su(e, t) : Pr(e) ? $u(e) : pi(e) ? Cu(e, t) : e.cloneNode(!1);
}
function Tu(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: n } = e;
    try {
      n && (t = n.createElement("iframe"), t.id = `__SANDBOX__${bl()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", n.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (r) {
      e.log.warn("Failed to getSandBox", r);
    }
  }
  return t;
}
const Nu = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Ru = [
  "stroke",
  "fill"
];
function kl(e, t, n) {
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), i = ks(e) && s !== "svg", o = i ? Ru.map((g) => [g, e.getAttribute(g)]).filter(([, g]) => g !== null) : [], a = [
    i && "svg",
    s,
    o.map((g, v) => `${g}=${v}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(a))
    return r.get(a);
  const c = Tu(n), f = c == null ? void 0 : c.contentWindow;
  if (!f)
    return /* @__PURE__ */ new Map();
  const u = f == null ? void 0 : f.document;
  let p, d;
  i ? (p = u.createElementNS(gi, "svg"), d = p.ownerDocument.createElementNS(p.namespaceURI, s), o.forEach(([g, v]) => {
    d.setAttributeNS(null, g, v);
  }), p.appendChild(d)) : p = d = u.createElement(s), d.textContent = " ", u.body.appendChild(p);
  const h = f.getComputedStyle(d, t), _ = /* @__PURE__ */ new Map();
  for (let g = h.length, v = 0; v < g; v++) {
    const b = h.item(v);
    Nu.includes(b) || _.set(b, h.getPropertyValue(b));
  }
  return u.body.removeChild(p), r.set(a, _), _;
}
function El(e, t, n) {
  var a;
  const r = /* @__PURE__ */ new Map(), s = [], i = /* @__PURE__ */ new Map();
  if (n)
    for (const c of n)
      o(c);
  else
    for (let c = e.length, f = 0; f < c; f++) {
      const u = e.item(f);
      o(u);
    }
  for (let c = s.length, f = 0; f < c; f++)
    (a = i.get(s[f])) == null || a.forEach((u, p) => r.set(p, u));
  function o(c) {
    const f = e.getPropertyValue(c), u = e.getPropertyPriority(c), p = c.lastIndexOf("-"), d = p > -1 ? c.substring(0, p) : void 0;
    if (d) {
      let h = i.get(d);
      h || (h = /* @__PURE__ */ new Map(), i.set(d, h)), h.set(c, [f, u]);
    }
    t.get(c) === f && !u || (d ? s.push(d) : r.set(c, [f, u]));
  }
  return r;
}
function ju(e, t, n, r) {
  var p, d, h, _;
  const { ownerWindow: s, includeStyleProperties: i, currentParentNodeStyle: o } = r, a = t.style, c = s.getComputedStyle(e), f = kl(e, null, r);
  o == null || o.forEach((g, v) => {
    f.delete(v);
  });
  const u = El(c, f, i);
  u.delete("transition-property"), u.delete("all"), u.delete("d"), u.delete("content"), n && (u.delete("margin-top"), u.delete("margin-right"), u.delete("margin-bottom"), u.delete("margin-left"), u.delete("margin-block-start"), u.delete("margin-block-end"), u.delete("margin-inline-start"), u.delete("margin-inline-end"), u.set("box-sizing", ["border-box", ""])), ((p = u.get("background-clip")) == null ? void 0 : p[0]) === "text" && t.classList.add("______background-clip--text"), hl && (u.has("font-kerning") || u.set("font-kerning", ["normal", ""]), (((d = u.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((h = u.get("overflow-y")) == null ? void 0 : h[0]) === "hidden") && ((_ = u.get("text-overflow")) == null ? void 0 : _[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && u.set("text-overflow", ["clip", ""]));
  for (let g = a.length, v = 0; v < g; v++)
    a.removeProperty(a.item(v));
  return u.forEach(([g, v], b) => {
    a.setProperty(b, g, v);
  }), u;
}
function Iu(e, t) {
  (iu(e) || ou(e) || cu(e)) && t.setAttribute("value", e.value);
}
const Mu = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Lu = [
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
function qu(e, t, n, r, s) {
  const { ownerWindow: i, svgStyleElement: o, svgStyles: a, currentNodeStyle: c } = r;
  if (!o || !i)
    return;
  function f(u) {
    var k;
    const p = i.getComputedStyle(e, u);
    let d = p.getPropertyValue("content");
    if (!d || d === "none")
      return;
    s == null || s(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const h = [bl()], _ = kl(e, u, r);
    c == null || c.forEach((L, R) => {
      _.delete(R);
    });
    const g = El(p, _, r.includeStyleProperties);
    g.delete("content"), g.delete("-webkit-locale"), ((k = g.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const v = [
      `content: '${d}';`
    ];
    if (g.forEach(([L, R], j) => {
      v.push(`${j}: ${L}${R ? " !important" : ""};`);
    }), v.length === 1)
      return;
    try {
      t.className = [t.className, ...h].join(" ");
    } catch (L) {
      r.log.warn("Failed to copyPseudoClass", L);
      return;
    }
    const b = v.join(`
  `);
    let A = a.get(b);
    A || (A = [], a.set(b, A)), A.push(`.${h[0]}${u}`);
  }
  Mu.forEach(f), n && Lu.forEach(f);
}
const Io = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Mo(e, t, n, r, s) {
  if (Ht(n) && (au(n) || lu(n)) || r.filter && !r.filter(n))
    return;
  Io.has(t.nodeName) || Io.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const i = await ao(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && Pu(e, i), t.appendChild(i);
}
async function Lo(e, t, n, r) {
  var i;
  let s = e.firstChild;
  Ht(e) && e.shadowRoot && (s = (i = e.shadowRoot) == null ? void 0 : i.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let o = s; o; o = o.nextSibling)
    if (!nu(o))
      if (Ht(o) && fu(o) && typeof o.assignedNodes == "function") {
        const a = o.assignedNodes();
        for (let c = 0; c < a.length; c++)
          await Mo(e, t, a[c], n, r);
      } else
        await Mo(e, t, o, n, r);
}
function Pu(e, t) {
  if (!us(e) || !us(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, i = new DOMMatrix(s), { a: o, b: a, c, d: f } = i;
  i.a = 1, i.b = 0, i.c = 0, i.d = 1, i.translateSelf(-r, -n), i.a = o, i.b = a, i.c = c, i.d = f, t.style.transform = i.toString();
}
function Du(e, t) {
  const { backgroundColor: n, width: r, height: s, style: i } = t, o = e.style;
  if (n && o.setProperty("background-color", n, "important"), r && o.setProperty("width", `${r}px`, "important"), s && o.setProperty("height", `${s}px`, "important"), i)
    for (const a in i) o[a] = i[a];
}
const Fu = /^[\w-:]+$/;
async function ao(e, t, n = !1, r) {
  var f, u, p, d;
  const { ownerDocument: s, ownerWindow: i, fontFamilies: o, onCloneEachNode: a } = t;
  if (s && ru(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && i && Ht(e) && (us(e) || ks(e))) {
    const h = await Au(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = h.getAttributeNames();
      for (let L = k.length, R = 0; R < L; R++) {
        const j = k[R];
        Fu.test(j) || h.removeAttribute(j);
      }
    }
    const _ = t.currentNodeStyle = ju(e, h, n, t);
    n && Du(h, t);
    let g = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (f = _.get("overflow-x")) == null ? void 0 : f[0],
        (u = _.get("overflow-y")) == null ? void 0 : u[0]
      ];
      g = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const v = (p = _.get("text-transform")) == null ? void 0 : p[0], b = _l((d = _.get("font-family")) == null ? void 0 : d[0]), A = b ? (k) => {
      v === "uppercase" ? k = k.toUpperCase() : v === "lowercase" ? k = k.toLowerCase() : v === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), b.forEach((L) => {
        let R = o.get(L);
        R || o.set(L, R = /* @__PURE__ */ new Set()), k.split("").forEach((j) => R.add(j));
      });
    } : void 0;
    return qu(
      e,
      h,
      g,
      t,
      A
    ), Iu(e, h), pi(e) || await Lo(
      e,
      h,
      t,
      A
    ), await (a == null ? void 0 : a(h)), h;
  }
  const c = e.cloneNode(!1);
  return await Lo(e, c, t), await (a == null ? void 0 : a(c)), c;
}
function Ou(e) {
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
function zu(e) {
  const { url: t, timeout: n, responseType: r, ...s } = e, i = new AbortController(), o = n ? setTimeout(() => i.abort(), n) : void 0;
  return fetch(t, { signal: i.signal, ...s }).then((a) => {
    if (!a.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: a });
    switch (r) {
      case "arrayBuffer":
        return a.arrayBuffer();
      case "dataUrl":
        return a.blob().then(mu);
      case "text":
      default:
        return a.text();
    }
  }).finally(() => clearTimeout(o));
}
function vs(e, t) {
  const { url: n, requestType: r = "text", responseType: s = "text", imageDom: i } = t;
  let o = n;
  const {
    timeout: a,
    acceptOfImage: c,
    requests: f,
    fetchFn: u,
    fetch: {
      requestInit: p,
      bypassingCache: d,
      placeholderImage: h
    },
    font: _,
    workers: g,
    fontFamilies: v
  } = e;
  r === "image" && (ei || oo) && e.drawImageCount++;
  let b = f.get(n);
  if (!b) {
    d && d instanceof RegExp && d.test(o) && (o += (/\?/.test(o) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const A = r.startsWith("font") && _ && _.minify, k = /* @__PURE__ */ new Set();
    A && r.split(";")[1].split(",").forEach((F) => {
      v.has(F) && v.get(F).forEach((oe) => k.add(oe));
    });
    const L = A && k.size, R = {
      url: o,
      timeout: a,
      responseType: L ? "arrayBuffer" : s,
      headers: r === "image" ? { accept: c } : void 0,
      ...p
    };
    b = {
      type: r,
      resolve: void 0,
      reject: void 0,
      response: null
    }, b.response = (async () => {
      if (u && r === "image") {
        const j = await u(n);
        if (j)
          return j;
      }
      return !ei && n.startsWith("http") && g.length ? new Promise((j, F) => {
        g[f.size & g.length - 1].postMessage({ rawUrl: n, ...R }), b.resolve = j, b.reject = F;
      }) : zu(R);
    })().catch((j) => {
      if (f.delete(n), r === "image" && h)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof h == "string" ? h : h(i);
      throw j;
    }), f.set(n, b);
  }
  return b.response;
}
async function Sl(e, t, n, r) {
  if (!$l(e))
    return e;
  for (const [s, i] of Bu(e, t))
    try {
      const o = await vs(
        n,
        {
          url: i,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Uu(s), `$1${o}$3`);
    } catch (o) {
      n.log.warn("Failed to fetch css data url", s, o);
    }
  return e;
}
function $l(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Cl = /url\((['"]?)([^'"]+?)\1\)/g;
function Bu(e, t) {
  const n = [];
  return e.replace(Cl, (r, s, i) => (n.push([i, ml(i, t)]), r)), n.filter(([r]) => !Ui(r));
}
function Uu(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Hu = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Vu(e, t) {
  return Hu.map((n) => {
    const r = e.getPropertyValue(n);
    return !r || r === "none" ? null : ((ei || oo) && t.drawImageCount++, Sl(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function Wu(e, t) {
  if (Pr(e)) {
    const n = e.currentSrc || e.src;
    if (!Ui(n))
      return [
        vs(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (ei || oo) && t.drawImageCount++;
  } else if (ks(e) && !Ui(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      vs(t, {
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
function Yu(e, t) {
  const { ownerDocument: n, svgDefsElement: r } = t, s = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!s)
    return [];
  const [i, o] = s.split("#");
  if (o) {
    const a = `#${o}`, c = t.shadowRoots.reduce(
      (f, u) => f ?? u.querySelector(`svg ${a}`),
      n == null ? void 0 : n.querySelector(`svg ${a}`)
    );
    if (i && e.setAttribute("href", a), r != null && r.querySelector(a))
      return [];
    if (c)
      return r == null || r.appendChild(c.cloneNode(!0)), [];
    if (i)
      return [
        vs(t, {
          url: i,
          responseType: "text"
        }).then((f) => {
          r == null || r.insertAdjacentHTML("beforeend", f);
        })
      ];
  }
  return [];
}
function Al(e, t) {
  const { tasks: n } = t;
  Ht(e) && ((Pr(e) || gl(e)) && n.push(...Wu(e, t)), tu(e) && n.push(...Yu(e, t))), us(e) && n.push(...Vu(e.style, t)), e.childNodes.forEach((r) => {
    Al(r, t);
  });
}
async function Ku(e, t) {
  const {
    ownerDocument: n,
    svgStyleElement: r,
    fontFamilies: s,
    fontCssTexts: i,
    tasks: o,
    font: a
  } = t;
  if (!(!n || !r || !s.size))
    if (a && a.cssText) {
      const c = Po(a.cssText, t);
      r.appendChild(n.createTextNode(`${c}
`));
    } else {
      const c = Array.from(n.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (p) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, p), !1;
        }
      });
      await Promise.all(
        c.flatMap((u) => Array.from(u.cssRules).map(async (p, d) => {
          if (Qf(p)) {
            let h = d + 1;
            const _ = p.href;
            let g = "";
            try {
              g = await vs(t, {
                url: _,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${_}`, b);
            }
            const v = g.replace(
              Cl,
              (b, A, k) => b.replace(k, ml(k, _))
            );
            for (const b of Xu(v))
              try {
                u.insertRule(
                  b,
                  b.startsWith("@import") ? h += 1 : u.cssRules.length
                );
              } catch (A) {
                t.log.warn("Error inserting rule from remote css import", { rule: b, error: A });
              }
          }
        }))
      );
      const f = [];
      c.forEach((u) => {
        Hi(u.cssRules, f);
      }), f.filter((u) => {
        var p;
        return Zf(u) && $l(u.style.getPropertyValue("src")) && ((p = _l(u.style.getPropertyValue("font-family"))) == null ? void 0 : p.some((d) => s.has(d)));
      }).forEach((u) => {
        const p = u, d = i.get(p.cssText);
        d ? r.appendChild(n.createTextNode(`${d}
`)) : o.push(
          Sl(
            p.cssText,
            p.parentStyleSheet ? p.parentStyleSheet.href : null,
            t
          ).then((h) => {
            h = Po(h, t), i.set(p.cssText, h), r.appendChild(n.createTextNode(`${h}
`));
          })
        );
      });
    }
}
const Gu = /(\/\*[\s\S]*?\*\/)/g, qo = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Xu(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(Gu, "");
  for (; ; ) {
    const i = qo.exec(n);
    if (!i)
      break;
    t.push(i[0]);
  }
  n = n.replace(qo, "");
  const r = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, s = new RegExp(
    // eslint-disable-next-line
    "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
    "gi"
  );
  for (; ; ) {
    let i = r.exec(n);
    if (i)
      s.lastIndex = r.lastIndex;
    else if (i = s.exec(n), i)
      r.lastIndex = s.lastIndex;
    else
      break;
    t.push(i[0]);
  }
  return t;
}
const Ju = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Zu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Po(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(Zu, (s) => {
    for (; ; ) {
      const [i, , o] = Ju.exec(s) || [];
      if (!o)
        return "";
      if (o === r)
        return `src: ${i};`;
    }
  }) : e;
}
function Hi(e, t = []) {
  for (const n of Array.from(e))
    eu(n) ? t.push(...Hi(n.cssRules)) : "cssRules" in n ? Hi(n.cssRules, t) : t.push(n);
  return t;
}
async function Qu(e, t) {
  const n = await yl(e, t);
  if (Ht(n.node) && ks(n.node))
    return n.node;
  const {
    ownerDocument: r,
    log: s,
    tasks: i,
    svgStyleElement: o,
    svgDefsElement: a,
    svgStyles: c,
    font: f,
    progress: u,
    autoDestruct: p,
    onCloneNode: d,
    onEmbedNode: h,
    onCreateForeignObjectSvg: _
  } = n;
  s.time("clone node");
  const g = await ao(n.node, n, !0);
  if (o && r) {
    let L = "";
    c.forEach((R, j) => {
      L += `${R.join(`,
`)} {
  ${j}
}
`;
    }), o.appendChild(r.createTextNode(L));
  }
  s.timeEnd("clone node"), await (d == null ? void 0 : d(g)), f !== !1 && Ht(g) && (s.time("embed web font"), await Ku(g, n), s.timeEnd("embed web font")), s.time("embed node"), Al(g, n);
  const v = i.length;
  let b = 0;
  const A = async () => {
    for (; ; ) {
      const L = i.pop();
      if (!L)
        break;
      try {
        await L;
      } catch (R) {
        n.log.warn("Failed to run task", R);
      }
      u == null || u(++b, v);
    }
  };
  u == null || u(b, v), await Promise.all([...Array.from({ length: 4 })].map(A)), s.timeEnd("embed node"), await (h == null ? void 0 : h(g));
  const k = ed(g, n);
  return a && k.insertBefore(a, k.children[0]), o && k.insertBefore(o, k.children[0]), p && Ou(n), await (_ == null ? void 0 : _(k)), k;
}
function ed(e, t) {
  const { width: n, height: r } = t, s = pu(n, r, e.ownerDocument), i = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return i.setAttributeNS(null, "x", "0%"), i.setAttributeNS(null, "y", "0%"), i.setAttributeNS(null, "width", "100%"), i.setAttributeNS(null, "height", "100%"), i.append(e), s.appendChild(i), s;
}
async function td(e, t) {
  var o;
  const n = await yl(e, t), r = await Qu(n), s = hu(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = wl(n.ownerDocument), n.svgDefsElement = (o = n.ownerDocument) == null ? void 0 : o.createElementNS(gi, "defs"), n.svgStyles.clear());
  const i = xr(s, r.ownerDocument);
  return await ku(i, n);
}
const nd = {
  // Don't try to fetch fragment-only URLs (SVG <use href="#id"> references)
  // or cross-origin resources that will 404
  fetch: {
    requestInit: { mode: "no-cors" },
    placeholderImage: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  },
  filter: (e) => {
    var t;
    return !(e instanceof HTMLElement && (e.tagName === "JAT-FEEDBACK" || (t = e.id) != null && t.startsWith("jat-feedback-")));
  }
};
async function Tl() {
  return (await td(document.documentElement, {
    ...nd,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8);
}
function rd(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function ti(e, { delay: t = 0, duration: n = 400, easing: r = rd, axis: s = "y" } = {}) {
  const i = getComputedStyle(e), o = +i.opacity, a = s === "y" ? "height" : "width", c = parseFloat(i[a]), f = s === "y" ? ["top", "bottom"] : ["left", "right"], u = f.map(
    (b) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${b[0].toUpperCase()}${b.slice(1)}`
    )
  ), p = parseFloat(i[`padding${u[0]}`]), d = parseFloat(i[`padding${u[1]}`]), h = parseFloat(i[`margin${u[0]}`]), _ = parseFloat(i[`margin${u[1]}`]), g = parseFloat(
    i[`border${u[0]}Width`]
  ), v = parseFloat(
    i[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (b) => `overflow: hidden;opacity: ${Math.min(b * 20, 1) * o};${a}: ${b * c}px;padding-${f[0]}: ${b * p}px;padding-${f[1]}: ${b * d}px;margin-${f[0]}: ${b * h}px;margin-${f[1]}: ${b * _}px;border-${f[0]}-width: ${b * g}px;border-${f[1]}-width: ${b * v}px;min-${a}: 0`
  };
}
var sd = /* @__PURE__ */ N('<span class="spinner svelte-1dhybq8"></span> Capturing...', 1), id = /* @__PURE__ */ ur('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot', 1), od = /* @__PURE__ */ N('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), ad = /* @__PURE__ */ N('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), ld = /* @__PURE__ */ N('<span class="more-badge svelte-1dhybq8"> </span>'), cd = /* @__PURE__ */ N('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'), fd = /* @__PURE__ */ N('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>');
const ud = {
  hash: "svelte-1dhybq8",
  code: `.screenshot-section.svelte-1dhybq8 {display:flex;flex-direction:column;gap:8px;}.capture-btn.svelte-1dhybq8 {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.capture-btn.svelte-1dhybq8:hover:not(:disabled) {background:#374151;}.capture-btn.svelte-1dhybq8:disabled {opacity:0.5;cursor:not-allowed;}.thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}.spinner.svelte-1dhybq8 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;}
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }`
};
function Nl(e, t) {
  vn(t, !0), Rn(e, ud);
  let n = G(t, "screenshots", 23, () => []), r = G(t, "capturing", 7, !1), s = G(t, "oncapture", 7), i = G(t, "onremove", 7), o = G(t, "onedit", 7);
  var a = {
    get screenshots() {
      return n();
    },
    set screenshots(g = []) {
      n(g), W();
    },
    get capturing() {
      return r();
    },
    set capturing(g = !1) {
      r(g), W();
    },
    get oncapture() {
      return s();
    },
    set oncapture(g) {
      s(g), W();
    },
    get onremove() {
      return i();
    },
    set onremove(g) {
      i(g), W();
    },
    get onedit() {
      return o();
    },
    set onedit(g) {
      o(g), W();
    }
  }, c = fd(), f = x(c), u = x(f);
  {
    var p = (g) => {
      var v = sd();
      cs(), C(g, v);
    }, d = (g) => {
      var v = id();
      cs(), C(g, v);
    };
    B(u, (g) => {
      r() ? g(p) : g(d, !1);
    });
  }
  w(f);
  var h = $(f, 2);
  {
    var _ = (g) => {
      var v = cd(), b = x(v);
      ze(b, 17, () => n().slice(-3), ot, (L, R, j) => {
        const F = /* @__PURE__ */ Et(() => n().length > 3 ? n().length - 3 + j : j);
        var oe = ad(), ne = x(oe);
        de(ne, "alt", `Screenshot ${j + 1}`);
        var ue = $(ne, 2);
        {
          var Ne = (ve) => {
            var He = od();
            Y("click", He, () => o()(l(F))), C(ve, He);
          };
          B(ue, (ve) => {
            o() && ve(Ne);
          });
        }
        var ce = $(ue, 2);
        w(oe), D(() => de(ne, "src", l(R))), Y("click", ce, () => i()(l(F))), C(L, oe);
      });
      var A = $(b, 2);
      {
        var k = (L) => {
          var R = ld(), j = x(R);
          w(R), D(() => Z(j, `+${n().length - 3}`)), C(L, R);
        };
        B(A, (L) => {
          n().length > 3 && L(k);
        });
      }
      w(v), C(g, v);
    };
    B(h, (g) => {
      n().length > 0 && g(_);
    });
  }
  return w(c), D(() => f.disabled = r()), Y("click", f, function(...g) {
    var v;
    (v = s()) == null || v.apply(this, g);
  }), C(e, c), pn(a);
}
xs(["click"]);
jn(
  Nl,
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
var dd = /* @__PURE__ */ ur('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), vd = /* @__PURE__ */ ur('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), pd = /* @__PURE__ */ N('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), hd = /* @__PURE__ */ N("<button></button>"), gd = /* @__PURE__ */ N('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), md = /* @__PURE__ */ N('<div class="loading svelte-yff65c">Loading image...</div>'), bd = /* @__PURE__ */ N('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), _d = /* @__PURE__ */ N('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const yd = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function Rl(e, t) {
  vn(t, !0), Rn(e, yd);
  let n = G(t, "imageDataUrl", 7), r = G(t, "onsave", 7), s = G(t, "oncancel", 7), i = /* @__PURE__ */ P("arrow"), o = /* @__PURE__ */ P(Me(Co[0])), a = /* @__PURE__ */ P(Me([])), c = /* @__PURE__ */ P(void 0), f = /* @__PURE__ */ P(void 0), u = /* @__PURE__ */ P(0), p = /* @__PURE__ */ P(0), d = /* @__PURE__ */ P(!1), h = /* @__PURE__ */ P("idle"), _ = { x: 0, y: 0 }, g = [], v = /* @__PURE__ */ P(void 0), b = /* @__PURE__ */ P(Me(
    { x: 0, y: 0 }
    // canvas coords
  )), A = /* @__PURE__ */ P(Me({ left: "0px", top: "0px" })), k = /* @__PURE__ */ P("");
  ro(() => {
    To(!0);
    const S = new Image();
    S.onload = () => {
      y(u, S.naturalWidth, !0), y(p, S.naturalHeight, !0), y(d, !0), requestAnimationFrame(() => R(S));
    }, S.src = n();
  }), Ya(() => {
    To(!1);
  });
  function L() {
    return new Promise((S, M) => {
      const O = new Image();
      O.onload = () => S(O), O.onerror = M, O.src = n();
    });
  }
  async function R(S) {
    if (!l(c)) return;
    const M = l(c).getContext("2d");
    M && (S || (S = await L()), l(c).width = l(u), l(c).height = l(p), M.drawImage(S, 0, 0, l(u), l(p)), ll(M, l(a)));
  }
  function j() {
    if (!l(f)) return;
    const S = l(f).getContext("2d");
    S && (l(f).width = l(u), l(f).height = l(p), S.clearRect(0, 0, l(u), l(p)));
  }
  function F(S) {
    if (!l(f)) return { x: 0, y: 0 };
    const M = l(f).getBoundingClientRect(), O = l(u) / M.width, ie = l(p) / M.height;
    return {
      x: (S.clientX - M.left) * O,
      y: (S.clientY - M.top) * ie
    };
  }
  function oe(S) {
    if (!l(f)) return { left: "0px", top: "0px" };
    const M = l(f).getBoundingClientRect();
    return {
      left: `${M.left + S.x / (l(u) / M.width)}px`,
      top: `${M.top + S.y / (l(p) / M.height)}px`
    };
  }
  function ne(S) {
    const M = { color: l(o), strokeWidth: Ao };
    switch (l(i)) {
      case "arrow":
        return {
          ...M,
          id: ts(),
          type: "arrow",
          start: _,
          end: S
        };
      case "rectangle":
        return {
          ...M,
          id: ts(),
          type: "rectangle",
          start: _,
          end: S
        };
      case "ellipse":
        return {
          ...M,
          id: ts(),
          type: "ellipse",
          start: _,
          end: S
        };
      case "freehand":
        return {
          ...M,
          id: ts(),
          type: "freehand",
          points: [...g, S]
        };
      default:
        return null;
    }
  }
  function ue(S) {
    if (l(h) === "typing") {
      ve();
      return;
    }
    const M = F(S);
    if (l(i) === "text") {
      y(h, "typing"), y(b, M, !0), y(A, oe(M), !0), y(k, ""), requestAnimationFrame(() => {
        var O;
        return (O = l(v)) == null ? void 0 : O.focus();
      });
      return;
    }
    y(h, "drawing"), _ = M, g = [M];
  }
  function Ne(S) {
    if (l(h) !== "drawing") return;
    const M = F(S);
    l(i) === "freehand" && g.push(M), j();
    const O = ne(M);
    if (O && l(f)) {
      const ie = l(f).getContext("2d");
      ie && al(ie, O);
    }
  }
  function ce(S) {
    if (l(h) !== "drawing") return;
    const M = F(S), O = ne(M);
    O && y(a, [...l(a), O], !0), y(h, "idle"), g = [], j(), R();
  }
  function ve() {
    if (l(k).trim()) {
      const S = {
        id: ts(),
        type: "text",
        color: l(o),
        strokeWidth: Ao,
        position: l(b),
        content: l(k).trim(),
        fontSize: 20
      };
      y(a, [...l(a), S], !0), R();
    }
    y(k, ""), y(h, "idle");
  }
  function He(S) {
    S.key === "Enter" ? (S.preventDefault(), ve()) : S.key === "Escape" && (S.preventDefault(), y(k, ""), y(h, "idle"));
  }
  function Ze() {
    l(a).length !== 0 && (y(a, l(a).slice(0, -1), !0), R());
  }
  function ct() {
    y(a, [], !0), R();
  }
  async function q() {
    if (l(a).length === 0) {
      r()(n());
      return;
    }
    const S = await Ff(n(), l(a), l(u), l(p));
    r()(S);
  }
  function pe() {
    s()();
  }
  function me(S) {
    S.key === "Escape" && l(h) !== "typing" && (S.stopPropagation(), pe()), (S.ctrlKey || S.metaKey) && S.key === "z" && (S.preventDefault(), Ze());
  }
  const Ve = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, jt = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, Gt = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var Xt = {
    get imageDataUrl() {
      return n();
    },
    set imageDataUrl(S) {
      n(S), W();
    },
    get onsave() {
      return r();
    },
    set onsave(S) {
      r(S), W();
    },
    get oncancel() {
      return s();
    },
    set oncancel(S) {
      s(S), W();
    }
  }, Qe = _d(), hn = x(Qe), In = x(hn);
  ze(In, 21, () => Gt, ot, (S, M) => {
    var O = pd();
    let ie;
    var et = x(O);
    {
      var Jt = (I) => {
        var We = dd();
        C(I, We);
      }, xe = (I) => {
        var We = vd(), T = x(We);
        w(We), D(() => de(T, "d", Ve[l(M)])), C(I, We);
      };
      B(et, (I) => {
        l(M) === "ellipse" ? I(Jt) : I(xe, !1);
      });
    }
    var ge = $(et, 2), Pe = x(ge, !0);
    w(ge), w(O), D(() => {
      ie = De(O, 1, "tool-btn svelte-yff65c", null, ie, { active: l(i) === l(M) }), de(O, "title", jt[l(M)]), Z(Pe, jt[l(M)]);
    }), Y("click", O, () => {
      y(i, l(M), !0);
    }), C(S, O);
  }), w(In);
  var Mn = $(In, 4);
  ze(Mn, 21, () => Co, ot, (S, M) => {
    var O = hd();
    let ie;
    D(() => {
      ie = De(O, 1, "color-swatch svelte-yff65c", null, ie, { active: l(o) === l(M) }), rr(O, `background: ${l(M) ?? ""}; ${l(M) === "#111827" ? "border-color: #6b7280;" : ""}`), de(O, "title", l(M));
    }), Y("click", O, () => {
      y(o, l(M), !0);
    }), C(S, O);
  }), w(Mn);
  var _t = $(Mn, 4), It = x(_t), dr = $(It, 2);
  w(_t);
  var Ln = $(_t, 4), yt = x(Ln), gn = $(yt, 2);
  w(Ln), w(hn);
  var mn = $(hn, 2), Or = x(mn);
  {
    var bn = (S) => {
      var M = gd(), O = St(M);
      zs(O, (Jt) => y(c, Jt), () => l(c));
      var ie = $(O, 2);
      let et;
      zs(ie, (Jt) => y(f, Jt), () => l(f)), D(() => {
        de(O, "width", l(u)), de(O, "height", l(p)), de(ie, "width", l(u)), de(ie, "height", l(p)), et = De(ie, 1, "overlay-canvas svelte-yff65c", null, et, {
          "cursor-crosshair": l(i) !== "text",
          "cursor-text": l(i) === "text"
        });
      }), Y("mousedown", ie, ue), Y("mousemove", ie, Ne), Y("mouseup", ie, ce), C(S, M);
    }, qn = (S) => {
      var M = md();
      C(S, M);
    };
    B(Or, (S) => {
      l(d) ? S(bn) : S(qn, !1);
    });
  }
  w(mn);
  var E = $(mn, 2);
  {
    var re = (S) => {
      var M = bd();
      Xa(M), zs(M, (O) => y(v, O), () => l(v)), D(() => rr(M, `left: ${l(A).left ?? ""}; top: ${l(A).top ?? ""}; color: ${l(o) ?? ""};`)), Y("keydown", M, He), Ba("blur", M, ve), Zs(M, () => l(k), (O) => y(k, O)), C(S, M);
    };
    B(E, (S) => {
      l(h) === "typing" && S(re);
    });
  }
  return w(Qe), D(() => {
    It.disabled = l(a).length === 0, dr.disabled = l(a).length === 0;
  }), Y("keydown", Qe, me), Y("click", It, Ze), Y("click", dr, ct), Y("click", yt, pe), Y("click", gn, q), C(e, Qe), pn(Xt);
}
xs(["keydown", "click", "mousedown", "mousemove", "mouseup"]);
jn(Rl, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var wd = /* @__PURE__ */ N('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), xd = /* @__PURE__ */ N('<div class="log-more svelte-x1hlqn"> </div>'), kd = /* @__PURE__ */ N('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const Ed = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function jl(e, t) {
  vn(t, !0), Rn(e, Ed);
  let n = G(t, "logs", 23, () => []);
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
      n(c), W();
    }
  }, i = is(), o = St(i);
  {
    var a = (c) => {
      var f = kd(), u = x(f), p = x(u);
      w(u);
      var d = $(u, 2), h = x(d);
      ze(h, 17, () => n().slice(-10), ot, (v, b) => {
        var A = wd(), k = x(A), L = x(k, !0);
        w(k);
        var R = $(k, 2), j = x(R);
        w(R), w(A), D(
          (F) => {
            rr(k, `color: ${(r[l(b).type] || "#9ca3af") ?? ""}`), Z(L, l(b).type), Z(j, `${F ?? ""}${l(b).message.length > 120 ? "..." : ""}`);
          },
          [() => l(b).message.substring(0, 120)]
        ), C(v, A);
      });
      var _ = $(h, 2);
      {
        var g = (v) => {
          var b = xd(), A = x(b);
          w(b), D(() => Z(A, `+${n().length - 10} more`)), C(v, b);
        };
        B(_, (v) => {
          n().length > 10 && v(g);
        });
      }
      w(d), w(f), D(() => Z(p, `Console Logs (${n().length ?? ""})`)), C(c, f);
    };
    B(o, (c) => {
      n().length > 0 && c(a);
    });
  }
  return C(e, i), pn(s);
}
jn(jl, { logs: {} }, [], [], { mode: "open" });
var Sd = /* @__PURE__ */ ur('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), $d = /* @__PURE__ */ ur('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Cd = /* @__PURE__ */ N('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const Ad = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function Il(e, t) {
  vn(t, !0), Rn(e, Ad);
  let n = G(t, "message", 7), r = G(t, "type", 7, "success"), s = G(t, "visible", 7, !1);
  var i = {
    get message() {
      return n();
    },
    set message(f) {
      n(f), W();
    },
    get type() {
      return r();
    },
    set type(f = "success") {
      r(f), W();
    },
    get visible() {
      return s();
    },
    set visible(f = !1) {
      s(f), W();
    }
  }, o = is(), a = St(o);
  {
    var c = (f) => {
      var u = Cd();
      let p;
      var d = x(u), h = x(d);
      {
        var _ = (A) => {
          var k = Sd();
          C(A, k);
        }, g = (A) => {
          var k = $d();
          C(A, k);
        };
        B(h, (A) => {
          r() === "success" ? A(_) : A(g, !1);
        });
      }
      w(d);
      var v = $(d, 2), b = x(v, !0);
      w(v), w(u), D(() => {
        p = De(u, 1, "jat-toast svelte-1f5s7q1", null, p, { error: r() === "error", success: r() === "success" }), Z(b, n());
      }), C(f, u);
    };
    B(a, (f) => {
      s() && f(c);
    });
  }
  return C(e, o), pn(i);
}
jn(Il, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Td = /* @__PURE__ */ N('<span class="subtab-count svelte-1fnmin5"> </span>'), Nd = /* @__PURE__ */ N('<span class="subtab-count review-count svelte-1fnmin5"> </span>'), Rd = /* @__PURE__ */ N('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), jd = /* @__PURE__ */ N('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Id = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Md = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Ld = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), qd = /* @__PURE__ */ N('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Pd = /* @__PURE__ */ N('<p class="revision-note svelte-1fnmin5"> </p>'), Dd = /* @__PURE__ */ N('<li class="svelte-1fnmin5"> </li>'), Fd = /* @__PURE__ */ N('<ul class="thread-summary svelte-1fnmin5"></ul>'), Od = /* @__PURE__ */ N('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), zd = /* @__PURE__ */ N('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Bd = /* @__PURE__ */ N('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Ud = /* @__PURE__ */ N('<span class="element-badge svelte-1fnmin5"> </span>'), Hd = /* @__PURE__ */ N('<div class="thread-elements svelte-1fnmin5"></div>'), Vd = /* @__PURE__ */ N('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"> </p> <!> <!> <!></div>'), Wd = /* @__PURE__ */ N('<div class="thread svelte-1fnmin5"></div>'), Yd = /* @__PURE__ */ N('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), Kd = /* @__PURE__ */ N('<p class="report-desc svelte-1fnmin5"> </p>'), Gd = /* @__PURE__ */ N('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Xd = /* @__PURE__ */ N('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Jd = /* @__PURE__ */ N('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), Zd = /* @__PURE__ */ N('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), Qd = /* @__PURE__ */ N('<span class="status-pill accepted svelte-1fnmin5"></span>'), ev = /* @__PURE__ */ N('<span class="status-pill rejected svelte-1fnmin5"></span>'), tv = /* @__PURE__ */ N('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), nv = /* @__PURE__ */ N('<div class="reject-preview-strip svelte-1fnmin5"></div>'), rv = /* @__PURE__ */ N('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), sv = /* @__PURE__ */ N('<div class="reject-element-strip svelte-1fnmin5"></div>'), iv = /* @__PURE__ */ N('<span class="char-hint svelte-1fnmin5"> </span>'), ov = /* @__PURE__ */ N('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), av = /* @__PURE__ */ N('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), lv = /* @__PURE__ */ N('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), cv = /* @__PURE__ */ N('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), fv = /* @__PURE__ */ N('<div class="reports svelte-1fnmin5"></div>'), uv = /* @__PURE__ */ N("<div><!></div>"), dv = /* @__PURE__ */ N('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>Submitted <!></button> <button>Review <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const vv = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {display:flex;flex-direction:column;overflow:hidden;}

  /* Subtabs */.subtabs.svelte-1fnmin5 {display:flex;border-bottom:1px solid #1f2937;padding:0 12px;flex-shrink:0;}.subtab.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:8px 10px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;text-transform:uppercase;letter-spacing:0.3px;}.subtab.svelte-1fnmin5:hover {color:#d1d5db;}.subtab.active.svelte-1fnmin5 {color:#f9fafb;border-bottom-color:#3b82f6;}.subtab-count.svelte-1fnmin5 {display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:#374151;color:#d1d5db;font-size:9px;font-weight:700;line-height:1;}.subtab.active.svelte-1fnmin5 .subtab-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.subtab-count.review-count.svelte-1fnmin5 {background:#f59e0b30;color:#fbbf24;}.subtab.active.svelte-1fnmin5 .subtab-count.review-count:where(.svelte-1fnmin5) {background:#f59e0b;color:#000;}.subtab-count.done-count.svelte-1fnmin5 {background:#10b98130;color:#34d399;}.subtab.active.svelte-1fnmin5 .subtab-count.done-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.request-scroll.svelte-1fnmin5 {padding:10px 12px;overflow-y:auto;flex:1;min-height:0;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:6px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;transition:border-color 0.15s;overflow:hidden;}.report-card.awaiting.svelte-1fnmin5 {border-color:#f59e0b40;box-shadow:0 0 0 1px #f59e0b20;}.report-card.expanded.svelte-1fnmin5 {border-color:#4b556380;}

  /* Collapsed card header (clickable toggle) */.card-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;width:100%;padding:9px 10px;background:none;border:none;cursor:pointer;font-family:inherit;text-align:left;color:inherit;}.card-toggle.svelte-1fnmin5:hover {background:#ffffff06;}.report-type.svelte-1fnmin5 {font-size:13px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:12px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 6px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.chevron.svelte-1fnmin5 {flex-shrink:0;color:#6b7280;transition:transform 0.15s;}.chevron-open.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Expanded card body */.card-body.svelte-1fnmin5 {padding:0 10px 10px;border-top:1px solid #ffffff08;}.report-url.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin:6px 0 0;font-size:11px;color:#60a5fa;text-decoration:none;overflow:hidden;transition:color 0.15s;}.report-url.svelte-1fnmin5:hover {color:#93c5fd;}.report-url.svelte-1fnmin5 svg:where(.svelte-1fnmin5) {flex-shrink:0;}.report-url.svelte-1fnmin5 span:where(.svelte-1fnmin5) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.screenshot-thumb.svelte-1fnmin5 {flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;background:#111827;cursor:pointer;padding:0;transition:border-color 0.15s;}.screenshot-thumb.svelte-1fnmin5:hover {border-color:#60a5fa;}.screenshot-thumb.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.screenshot-expanded.svelte-1fnmin5 {position:relative;margin-top:4px;border-radius:6px;overflow:hidden;border:1px solid #374151;}.screenshot-expanded.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;display:block;border-radius:5px;}.screenshot-close.svelte-1fnmin5 {position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;}.screenshot-close.svelte-1fnmin5:hover {background:rgba(0,0,0,0.9);}.revision-note.svelte-1fnmin5 {font-size:10px;color:#f59e0b;margin:3px 0 0;font-weight:500;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}

  /* Thread toggle button */.thread-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin-top:6px;padding:3px 6px;background:none;border:none;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;border-radius:4px;transition:color 0.15s, background 0.15s;}.thread-toggle.svelte-1fnmin5:hover {color:#d1d5db;background:#111827;}.thread-toggle-icon.svelte-1fnmin5 {transition:transform 0.15s;}.thread-toggle-icon.expanded.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Thread container */.thread.svelte-1fnmin5 {margin-top:6px;display:flex;flex-direction:column;gap:4px;}.thread-entry.svelte-1fnmin5 {padding:6px 8px;border-radius:5px;font-size:12px;border-left:2px solid;}.thread-user.svelte-1fnmin5 {background:#111827;border-left-color:#6b7280;}.thread-dev.svelte-1fnmin5 {background:#0f172a;border-left-color:#3b82f6;}.thread-entry-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;margin-bottom:3px;}.thread-from.svelte-1fnmin5 {font-weight:600;font-size:11px;color:#d1d5db;}.thread-type-badge.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.3px;}.thread-type-badge.submission.svelte-1fnmin5 {background:#6b728020;color:#9ca3af;}.thread-type-badge.completion.svelte-1fnmin5 {background:#3b82f620;color:#60a5fa;}.thread-type-badge.rejection.svelte-1fnmin5 {background:#ef444420;color:#f87171;}.thread-type-badge.acceptance.svelte-1fnmin5 {background:#10b98120;color:#34d399;}.thread-time.svelte-1fnmin5 {font-size:10px;color:#4b5563;margin-left:auto;}.thread-message.svelte-1fnmin5 {color:#d1d5db;line-height:1.4;margin:0;white-space:pre-wrap;word-break:break-word;}.thread-summary.svelte-1fnmin5 {margin:4px 0 0 0;padding:0 0 0 16px;font-size:11px;color:#9ca3af;}.thread-summary.svelte-1fnmin5 li:where(.svelte-1fnmin5) {margin:1px 0;}.thread-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:4px;}.thread-elements.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:4px;}.element-badge.svelte-1fnmin5 {font-size:10px;font-family:'SF Mono', 'Fira Code', 'Consolas', monospace;padding:1px 5px;background:#1e293b;border:1px solid #334155;border-radius:3px;color:#94a3b8;}.element-badge.removable.svelte-1fnmin5 {display:inline-flex;align-items:center;gap:3px;}.element-remove.svelte-1fnmin5 {background:none;border:none;color:#6b7280;cursor:pointer;padding:0;font-size:12px;line-height:1;}.element-remove.svelte-1fnmin5:hover {color:#ef4444;}

  /* Enhanced rejection form */.reject-attachments.svelte-1fnmin5 {display:flex;gap:6px;margin-top:6px;}.attach-btn.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:3px 8px;background:#111827;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:border-color 0.15s, color 0.15s;}.attach-btn.svelte-1fnmin5:hover:not(:disabled) {border-color:#60a5fa;color:#d1d5db;}.attach-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-preview-strip.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.reject-preview-item.svelte-1fnmin5 {position:relative;flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;}.reject-preview-item.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.reject-preview-remove.svelte-1fnmin5 {position:absolute;top:1px;right:1px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center;}.reject-preview-remove.svelte-1fnmin5:hover {background:#ef4444;}.reject-element-strip.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.status-pill.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.status-pill.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.status-pill.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function Ml(e, t) {
  vn(t, !0), Rn(e, vv);
  let n = G(t, "endpoint", 7), r = G(t, "reports", 31, () => Me([])), s = G(t, "loading", 7), i = G(t, "error", 7), o = G(t, "onreload", 7), a = /* @__PURE__ */ P(null), c = /* @__PURE__ */ P(null), f = /* @__PURE__ */ P(null), u = /* @__PURE__ */ P(""), p = /* @__PURE__ */ P(""), d = /* @__PURE__ */ P(""), h = /* @__PURE__ */ P(Me([])), _ = /* @__PURE__ */ P(Me([])), g = /* @__PURE__ */ P(!1), v = /* @__PURE__ */ P("submitted"), b = /* @__PURE__ */ P(!1);
  Gs(() => {
    !l(b) && l(L) > 0 && l(k) === 0 && (y(v, "review"), y(b, !0));
  });
  let A = /* @__PURE__ */ Et(() => l(v) === "submitted" ? r().filter((E) => ["submitted", "in_progress", "rejected"].includes(E.status)) : l(v) === "review" ? r().filter((E) => E.status === "completed" || E.status === "wontfix") : r().filter((E) => E.status === "accepted" || E.status === "closed")), k = /* @__PURE__ */ Et(() => r().filter((E) => ["submitted", "in_progress", "rejected"].includes(E.status)).length), L = /* @__PURE__ */ Et(() => r().filter((E) => E.status === "completed" || E.status === "wontfix").length), R = /* @__PURE__ */ Et(() => r().filter((E) => E.status === "accepted" || E.status === "closed").length);
  function j(E) {
    y(f, l(f) === E ? null : E, !0), l(f) !== E && (l(c) === E && y(c, null), y(a, null));
  }
  function F(E) {
    y(p, E, !0), y(d, ""), y(h, [], !0), y(_, [], !0);
  }
  function oe() {
    y(p, ""), y(d, ""), y(h, [], !0), y(_, [], !0);
  }
  async function ne() {
    if (!l(g)) {
      y(g, !0);
      try {
        const E = await Tl();
        y(h, [...l(h), E], !0);
      } catch (E) {
        console.error("Screenshot capture failed:", E);
      }
      y(g, !1);
    }
  }
  function ue(E) {
    y(h, l(h).filter((re, S) => S !== E), !0);
  }
  function Ne() {
    sl((E) => {
      y(
        _,
        [
          ...l(_),
          {
            tagName: E.tagName,
            className: E.className,
            id: E.id,
            selector: E.selector,
            textContent: E.textContent
          }
        ],
        !0
      );
    });
  }
  function ce(E) {
    y(_, l(_).filter((re, S) => S !== E), !0);
  }
  async function ve(E, re, S) {
    y(u, E, !0);
    const M = re === "rejected" ? {
      screenshots: l(h).length > 0 ? l(h) : void 0,
      elements: l(_).length > 0 ? l(_) : void 0
    } : void 0;
    (await zf(n(), E, re, S, M)).ok ? (r(r().map((ie) => ie.id === E ? {
      ...ie,
      status: re === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...re === "rejected" ? { revision_count: (ie.revision_count || 0) + 1 } : {}
    } : ie)), y(p, ""), y(d, ""), y(h, [], !0), y(_, [], !0), o()()) : y(p, ""), y(u, "");
  }
  function He(E) {
    y(c, l(c) === E ? null : E, !0);
  }
  function Ze(E) {
    return E ? E.length : 0;
  }
  function ct(E) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[E.type] || E.type;
  }
  function q(E) {
    return {
      submitted: "Submitted",
      in_progress: "Working On It",
      completed: "Ready for Review",
      accepted: "Done",
      rejected: "Revising",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[E] || E;
  }
  function pe(E) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#f59e0b",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[E] || "#6b7280";
  }
  function me(E) {
    return E === "bug" ? "🐛" : E === "enhancement" ? "✨" : "📝";
  }
  function Ve(E) {
    const re = Date.now(), S = new Date(E).getTime(), M = re - S, O = Math.floor(M / 6e4);
    if (O < 1) return "just now";
    if (O < 60) return `${O}m ago`;
    const ie = Math.floor(O / 60);
    if (ie < 24) return `${ie}h ago`;
    const et = Math.floor(ie / 24);
    return et < 30 ? `${et}d ago` : new Date(E).toLocaleDateString();
  }
  var jt = {
    get endpoint() {
      return n();
    },
    set endpoint(E) {
      n(E), W();
    },
    get reports() {
      return r();
    },
    set reports(E = []) {
      r(E), W();
    },
    get loading() {
      return s();
    },
    set loading(E) {
      s(E), W();
    },
    get error() {
      return i();
    },
    set error(E) {
      i(E), W();
    },
    get onreload() {
      return o();
    },
    set onreload(E) {
      o(E), W();
    }
  }, Gt = dv(), Xt = x(Gt), Qe = x(Xt);
  let hn;
  var In = $(x(Qe));
  {
    var Mn = (E) => {
      var re = Td(), S = x(re, !0);
      w(re), D(() => Z(S, l(k))), C(E, re);
    };
    B(In, (E) => {
      l(k) > 0 && E(Mn);
    });
  }
  w(Qe);
  var _t = $(Qe, 2);
  let It;
  var dr = $(x(_t));
  {
    var Ln = (E) => {
      var re = Nd(), S = x(re, !0);
      w(re), D(() => Z(S, l(L))), C(E, re);
    };
    B(dr, (E) => {
      l(L) > 0 && E(Ln);
    });
  }
  w(_t);
  var yt = $(_t, 2);
  let gn;
  var mn = $(x(yt));
  {
    var Or = (E) => {
      var re = Rd(), S = x(re, !0);
      w(re), D(() => Z(S, l(R))), C(E, re);
    };
    B(mn, (E) => {
      l(R) > 0 && E(Or);
    });
  }
  w(yt), w(Xt);
  var bn = $(Xt, 2), qn = x(bn);
  return Zc(qn, () => l(v), (E) => {
    var re = uv(), S = x(re);
    {
      var M = (xe) => {
        var ge = jd();
        C(xe, ge);
      }, O = (xe) => {
        var ge = Id(), Pe = x(ge), I = x(Pe, !0);
        w(Pe);
        var We = $(Pe, 2);
        w(ge), D(() => Z(I, i())), Y("click", We, function(...T) {
          var H;
          (H = o()) == null || H.apply(this, T);
        }), C(xe, ge);
      }, ie = (xe) => {
        var ge = Md(), Pe = x(ge);
        Pe.textContent = "📋", cs(4), w(ge), C(xe, ge);
      }, et = (xe) => {
        var ge = Ld(), Pe = x(ge), I = x(Pe, !0);
        w(Pe), w(ge), D(() => Z(I, l(v) === "submitted" ? "No submitted requests" : l(v) === "review" ? "Nothing to review right now" : "No completed requests yet")), C(xe, ge);
      }, Jt = (xe) => {
        var ge = fv();
        ze(ge, 21, () => l(A), (Pe) => Pe.id, (Pe, I) => {
          var We = cv();
          let T;
          var H = x(We), be = x(H), tt = x(be, !0);
          w(be);
          var Pn = $(be, 2), zr = x(Pn, !0);
          w(Pn);
          var _n = $(Pn, 2), Br = x(_n, !0);
          w(_n);
          var vr = $(_n, 2);
          let Ur;
          w(H);
          var pr = $(H, 2);
          {
            var Hr = (yn) => {
              var wt = lv(), hr = x(wt);
              {
                var Vr = (z) => {
                  var U = qd(), le = $(x(U), 2), Ce = x(le, !0);
                  w(le), w(U), D(
                    (Mt) => {
                      de(U, "href", l(I).page_url), Z(Ce, Mt);
                    },
                    [
                      () => l(I).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), C(z, U);
                };
                B(hr, (z) => {
                  l(I).page_url && z(Vr);
                });
              }
              var gr = $(hr, 2);
              {
                var Es = (z) => {
                  var U = Pd(), le = x(U);
                  w(U), D(() => Z(le, `Revision ${l(I).revision_count ?? ""}`)), C(z, U);
                };
                B(gr, (z) => {
                  l(I).revision_count > 0 && l(I).status !== "accepted" && z(Es);
                });
              }
              var Ss = $(gr, 2);
              {
                var $s = (z) => {
                  var U = Yd(), le = St(U), Ce = x(le);
                  let Mt;
                  var Fe = $(Ce, 2), Re = x(Fe);
                  w(Fe), w(le);
                  var _e = $(le, 2);
                  {
                    var Se = (fe) => {
                      var Lt = Wd();
                      ze(Lt, 21, () => l(I).thread, (Gr) => Gr.id, (Gr, he) => {
                        var br = Vd();
                        let Xr;
                        var Jr = x(br), Dn = x(Jr), Ts = x(Dn, !0);
                        w(Dn);
                        var Zt = $(Dn, 2);
                        let Ns;
                        var yi = x(Zt, !0);
                        w(Zt);
                        var Rs = $(Zt, 2), wi = x(Rs, !0);
                        w(Rs), w(Jr);
                        var $e = $(Jr, 2), nt = x($e, !0);
                        w($e);
                        var wn = $($e, 2);
                        {
                          var Qt = (Oe) => {
                            var ft = Fd();
                            ze(ft, 21, () => l(he).summary, ot, (On, qt) => {
                              var Pt = Dd(), tn = x(Pt, !0);
                              w(Pt), D(() => Z(tn, l(qt))), C(On, Pt);
                            }), w(ft), C(Oe, ft);
                          };
                          B(wn, (Oe) => {
                            l(he).summary && l(he).summary.length > 0 && Oe(Qt);
                          });
                        }
                        var Fn = $(wn, 2);
                        {
                          var en = (Oe) => {
                            var ft = Bd(), On = St(ft);
                            ze(On, 21, () => l(he).screenshots, ot, (tn, kn, zn) => {
                              var js = is(), xi = St(js);
                              {
                                var Bn = (Un) => {
                                  var En = Od();
                                  de(En, "aria-label", `Screenshot ${zn + 1}`);
                                  var Is = x(En);
                                  de(Is, "alt", `Screenshot ${zn + 1}`), w(En), D(() => de(Is, "src", `${n() ?? ""}${l(kn).url ?? ""}`)), Y("click", En, () => y(a, l(a) === l(kn).url ? null : l(kn).url, !0)), C(Un, En);
                                };
                                B(xi, (Un) => {
                                  l(kn).url && Un(Bn);
                                });
                              }
                              C(tn, js);
                            }), w(On);
                            var qt = $(On, 2);
                            {
                              var Pt = (tn) => {
                                const kn = /* @__PURE__ */ Et(() => l(he).screenshots.find((Bn) => Bn.url === l(a)));
                                var zn = is(), js = St(zn);
                                {
                                  var xi = (Bn) => {
                                    var Un = zd(), En = x(Un), Is = $(En, 2);
                                    w(Un), D(() => de(En, "src", `${n() ?? ""}${l(a) ?? ""}`)), Y("click", Is, () => y(a, null)), C(Bn, Un);
                                  };
                                  B(js, (Bn) => {
                                    l(kn) && Bn(xi);
                                  });
                                }
                                C(tn, zn);
                              };
                              B(qt, (tn) => {
                                l(a) && tn(Pt);
                              });
                            }
                            C(Oe, ft);
                          };
                          B(Fn, (Oe) => {
                            l(he).screenshots && l(he).screenshots.length > 0 && Oe(en);
                          });
                        }
                        var xn = $(Fn, 2);
                        {
                          var Zr = (Oe) => {
                            var ft = Hd();
                            ze(ft, 21, () => l(he).elements, ot, (On, qt) => {
                              var Pt = Ud(), tn = x(Pt);
                              w(Pt), D(
                                (kn, zn) => {
                                  de(Pt, "title", l(qt).selector), Z(tn, `<${kn ?? ""}${l(qt).id ? `#${l(qt).id}` : ""}${zn ?? ""}>`);
                                },
                                [
                                  () => l(qt).tagName.toLowerCase(),
                                  () => l(qt).className ? `.${l(qt).className.split(" ")[0]}` : ""
                                ]
                              ), C(On, Pt);
                            }), w(ft), C(Oe, ft);
                          };
                          B(xn, (Oe) => {
                            l(he).elements && l(he).elements.length > 0 && Oe(Zr);
                          });
                        }
                        w(br), D(
                          (Oe, ft) => {
                            Xr = De(br, 1, "thread-entry svelte-1fnmin5", null, Xr, {
                              "thread-user": l(he).from === "user",
                              "thread-dev": l(he).from === "dev"
                            }), Z(Ts, l(he).from === "user" ? "You" : "Dev"), Ns = De(Zt, 1, "thread-type-badge svelte-1fnmin5", null, Ns, {
                              submission: l(he).type === "submission",
                              completion: l(he).type === "completion",
                              rejection: l(he).type === "rejection",
                              acceptance: l(he).type === "acceptance"
                            }), Z(yi, Oe), Z(wi, ft), Z(nt, l(he).message);
                          },
                          [
                            () => ct(l(he)),
                            () => Ve(l(he).at)
                          ]
                        ), C(Gr, br);
                      }), w(Lt), C(fe, Lt);
                    };
                    B(_e, (fe) => {
                      l(c) === l(I).id && fe(Se);
                    });
                  }
                  D(
                    (fe, Lt) => {
                      Mt = De(Ce, 0, "thread-toggle-icon svelte-1fnmin5", null, Mt, { expanded: l(c) === l(I).id }), Z(Re, `${fe ?? ""} ${Lt ?? ""}`);
                    },
                    [
                      () => Ze(l(I).thread),
                      () => Ze(l(I).thread) === 1 ? "message" : "messages"
                    ]
                  ), Y("click", le, () => He(l(I).id)), C(z, U);
                }, Cs = (z) => {
                  var U = Kd(), le = x(U, !0);
                  w(U), D((Ce) => Z(le, Ce), [
                    () => l(I).description.length > 120 ? l(I).description.slice(0, 120) + "..." : l(I).description
                  ]), C(z, U);
                };
                B(Ss, (z) => {
                  l(I).thread && l(I).thread.length > 0 ? z($s) : l(I).description && z(Cs, 1);
                });
              }
              var As = $(Ss, 2);
              {
                var mi = (z) => {
                  var U = Jd(), le = St(U);
                  ze(le, 21, () => l(I).screenshot_urls, ot, (Re, _e, Se) => {
                    var fe = Gd();
                    de(fe, "aria-label", `Screenshot ${Se + 1}`);
                    var Lt = x(fe);
                    de(Lt, "alt", `Screenshot ${Se + 1}`), w(fe), D(() => de(Lt, "src", `${n() ?? ""}${l(_e) ?? ""}`)), Y("click", fe, () => y(a, l(a) === l(_e) ? null : l(_e), !0)), C(Re, fe);
                  }), w(le);
                  var Ce = $(le, 2);
                  {
                    var Mt = (Re) => {
                      var _e = Xd(), Se = x(_e), fe = $(Se, 2);
                      w(_e), D(() => de(Se, "src", `${n() ?? ""}${l(a) ?? ""}`)), Y("click", fe, () => y(a, null)), C(Re, _e);
                    }, Fe = /* @__PURE__ */ Et(() => l(a) && l(I).screenshot_urls.includes(l(a)));
                    B(Ce, (Re) => {
                      l(Fe) && Re(Mt);
                    });
                  }
                  C(z, U);
                };
                B(As, (z) => {
                  !l(I).thread && l(I).screenshot_urls && l(I).screenshot_urls.length > 0 && z(mi);
                });
              }
              var Wr = $(As, 2);
              {
                var Yr = (z) => {
                  var U = Zd(), le = $(x(U), 2), Ce = x(le, !0);
                  w(le), w(U), D(() => Z(Ce, l(I).dev_notes)), C(z, U);
                };
                B(Wr, (z) => {
                  l(I).dev_notes && !l(I).thread && l(I).status !== "in_progress" && z(Yr);
                });
              }
              var mr = $(Wr, 2), Kr = x(mr), bi = x(Kr, !0);
              w(Kr);
              var _i = $(Kr, 2);
              {
                var X = (z) => {
                  var U = Qd();
                  U.textContent = "✓ Accepted", C(z, U);
                }, ae = (z) => {
                  var U = ev();
                  U.textContent = "✗ Rejected", C(z, U);
                }, Ee = (z) => {
                  var U = is(), le = St(U);
                  {
                    var Ce = (Fe) => {
                      var Re = ov(), _e = x(Re);
                      Sa(_e);
                      var Se = $(_e, 2), fe = x(Se), Lt = $(x(fe));
                      w(fe);
                      var Gr = $(fe, 2);
                      w(Se);
                      var he = $(Se, 2);
                      {
                        var br = ($e) => {
                          var nt = nv();
                          ze(nt, 21, () => l(h), ot, (wn, Qt, Fn) => {
                            var en = tv(), xn = x(en);
                            de(xn, "alt", `Screenshot ${Fn + 1}`);
                            var Zr = $(xn, 2);
                            w(en), D(() => de(xn, "src", l(Qt))), Y("click", Zr, () => ue(Fn)), C(wn, en);
                          }), w(nt), C($e, nt);
                        };
                        B(he, ($e) => {
                          l(h).length > 0 && $e(br);
                        });
                      }
                      var Xr = $(he, 2);
                      {
                        var Jr = ($e) => {
                          var nt = sv();
                          ze(nt, 21, () => l(_), ot, (wn, Qt, Fn) => {
                            var en = rv(), xn = x(en), Zr = $(xn);
                            w(en), D((Oe) => Z(xn, `<${Oe ?? ""}${l(Qt).id ? `#${l(Qt).id}` : ""}> `), [() => l(Qt).tagName.toLowerCase()]), Y("click", Zr, () => ce(Fn)), C(wn, en);
                          }), w(nt), C($e, nt);
                        };
                        B(Xr, ($e) => {
                          l(_).length > 0 && $e(Jr);
                        });
                      }
                      var Dn = $(Xr, 2), Ts = x(Dn), Zt = $(Ts, 2), Ns = x(Zt, !0);
                      w(Zt), w(Dn);
                      var yi = $(Dn, 2);
                      {
                        var Rs = ($e) => {
                          var nt = iv(), wn = x(nt);
                          w(nt), D((Qt) => Z(wn, `${Qt ?? ""} more characters needed`), [() => 10 - l(d).trim().length]), C($e, nt);
                        }, wi = /* @__PURE__ */ Et(() => l(d).trim().length > 0 && l(d).trim().length < 10);
                        B(yi, ($e) => {
                          l(wi) && $e(Rs);
                        });
                      }
                      w(Re), D(
                        ($e) => {
                          fe.disabled = l(g), Z(Lt, ` ${l(g) ? "..." : "Screenshot"}`), Zt.disabled = $e, Z(Ns, l(u) === l(I).id ? "..." : "✗ Reject");
                        },
                        [
                          () => l(d).trim().length < 10 || l(u) === l(I).id
                        ]
                      ), Zs(_e, () => l(d), ($e) => y(d, $e)), Y("click", fe, ne), Y("click", Gr, Ne), Y("click", Ts, oe), Y("click", Zt, () => ve(l(I).id, "rejected", l(d).trim())), C(Fe, Re);
                    }, Mt = (Fe) => {
                      var Re = av(), _e = x(Re), Se = x(_e, !0);
                      w(_e);
                      var fe = $(_e, 2);
                      fe.textContent = "✗ Reject", w(Re), D(() => {
                        _e.disabled = l(u) === l(I).id, Z(Se, l(u) === l(I).id ? "..." : "✓ Accept"), fe.disabled = l(u) === l(I).id;
                      }), Y("click", _e, () => ve(l(I).id, "accepted")), Y("click", fe, () => F(l(I).id)), C(Fe, Re);
                    };
                    B(le, (Fe) => {
                      l(p) === l(I).id ? Fe(Ce) : Fe(Mt, !1);
                    });
                  }
                  C(z, U);
                };
                B(_i, (z) => {
                  l(I).status === "accepted" ? z(X) : l(I).status === "rejected" ? z(ae, 1) : (l(I).status === "completed" || l(I).status === "wontfix") && z(Ee, 2);
                });
              }
              w(mr), w(wt), D((z) => Z(bi, z), [() => Ve(l(I).created_at)]), Js(3, wt, () => ti, () => ({ duration: 200 })), C(yn, wt);
            };
            B(pr, (yn) => {
              l(f) === l(I).id && yn(Hr);
            });
          }
          w(We), D(
            (yn, wt, hr, Vr, gr) => {
              T = De(We, 1, "report-card svelte-1fnmin5", null, T, {
                awaiting: l(I).status === "completed",
                expanded: l(f) === l(I).id
              }), Z(tt, yn), Z(zr, l(I).title), rr(_n, `background: ${wt ?? ""}20; color: ${hr ?? ""}; border-color: ${Vr ?? ""}40;`), Z(Br, gr), Ur = De(vr, 0, "chevron svelte-1fnmin5", null, Ur, { "chevron-open": l(f) === l(I).id });
            },
            [
              () => me(l(I).type),
              () => pe(l(I).status),
              () => pe(l(I).status),
              () => pe(l(I).status),
              () => q(l(I).status)
            ]
          ), Y("click", H, () => j(l(I).id)), C(Pe, We);
        }), w(ge), C(xe, ge);
      };
      B(S, (xe) => {
        s() ? xe(M) : i() && r().length === 0 ? xe(O, 1) : r().length === 0 ? xe(ie, 2) : l(A).length === 0 ? xe(et, 3) : xe(Jt, !1);
      });
    }
    w(re), Js(3, re, () => ti, () => ({ duration: 200 })), C(E, re);
  }), w(bn), w(Gt), D(() => {
    hn = De(Qe, 1, "subtab svelte-1fnmin5", null, hn, { active: l(v) === "submitted" }), It = De(_t, 1, "subtab svelte-1fnmin5", null, It, { active: l(v) === "review" }), gn = De(yt, 1, "subtab svelte-1fnmin5", null, gn, { active: l(v) === "done" });
  }), Y("click", Qe, () => y(v, "submitted")), Y("click", _t, () => y(v, "review")), Y("click", yt, () => y(v, "done")), C(e, Gt), pn(jt);
}
xs(["click"]);
jn(
  Ml,
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
var pv = /* @__PURE__ */ N('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), hv = /* @__PURE__ */ N('<span class="tab-badge svelte-nv4d5v"> </span>'), gv = /* @__PURE__ */ N("<option> </option>"), mv = /* @__PURE__ */ N("<option> </option>"), bv = /* @__PURE__ */ N('<span class="tool-count svelte-nv4d5v"> </span>'), _v = /* @__PURE__ */ N("Pick Element<!>", 1), yv = /* @__PURE__ */ N('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), wv = /* @__PURE__ */ N('<div class="elements-list svelte-nv4d5v"></div>'), xv = /* @__PURE__ */ N('<div class="attach-summary svelte-nv4d5v"> </div>'), kv = /* @__PURE__ */ N('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), Ev = /* @__PURE__ */ N('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), Sv = /* @__PURE__ */ N("<div><!></div>"), $v = /* @__PURE__ */ N('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!></div> <!>', 1);
const Cv = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover {background:#374151;}.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }`
};
function Ll(e, t) {
  vn(t, !0), Rn(e, Cv);
  let n = G(t, "endpoint", 7), r = G(t, "project", 7), s = G(t, "userId", 7, ""), i = G(t, "userEmail", 7, ""), o = G(t, "userName", 7, ""), a = G(t, "userRole", 7, ""), c = G(t, "orgId", 7, ""), f = G(t, "orgName", 7, ""), u = G(t, "onclose", 7), p = G(t, "ongrip", 7), d = /* @__PURE__ */ P("new"), h = /* @__PURE__ */ P(Me([])), _ = /* @__PURE__ */ P(!1), g = /* @__PURE__ */ P(""), v = /* @__PURE__ */ Et(() => l(h).filter((T) => T.status === "completed").length);
  async function b() {
    y(_, !0), y(g, "");
    const T = await Of(n());
    y(h, T.reports, !0), T.error && y(g, T.error, !0), y(_, !1);
  }
  Gs(() => {
    n() && b();
  });
  let A = /* @__PURE__ */ P(""), k = /* @__PURE__ */ P(""), L = /* @__PURE__ */ P("bug"), R = /* @__PURE__ */ P("medium"), j = /* @__PURE__ */ P(Me([])), F = /* @__PURE__ */ P(Me([])), oe = /* @__PURE__ */ P(Me([])), ne = /* @__PURE__ */ P(!1), ue = /* @__PURE__ */ P(!1), Ne = /* @__PURE__ */ P(!1), ce = /* @__PURE__ */ P(null), ve = /* @__PURE__ */ P(""), He = /* @__PURE__ */ P(""), Ze = /* @__PURE__ */ P("success"), ct = /* @__PURE__ */ P(!1);
  function q(T, H) {
    y(He, T, !0), y(Ze, H, !0), y(ct, !0), setTimeout(
      () => {
        y(ct, !1);
      },
      3e3
    );
  }
  async function pe() {
    y(ue, !0);
    try {
      const T = await Tl();
      y(ve, T, !0), y(ce, l(
        j
        // new index (not yet in array)
      ).length, !0);
    } catch (T) {
      console.error("[jat-feedback] Screenshot failed:", T), q("Screenshot failed: " + (T instanceof Error ? T.message : "unknown error"), "error");
    } finally {
      y(ue, !1);
    }
  }
  function me(T) {
    y(j, l(j).filter((H, be) => be !== T), !0);
  }
  function Ve(T) {
    y(ve, l(j)[T], !0), y(ce, T, !0);
  }
  function jt(T) {
    l(ce) !== null && (l(ce) >= l(j).length ? (y(j, [...l(j), T], !0), q(`Screenshot captured (${l(j).length})`, "success")) : (y(j, l(j).map((H, be) => be === l(ce) ? T : H), !0), q("Screenshot updated", "success"))), y(ce, null), y(ve, "");
  }
  function Gt() {
    l(ce) !== null && l(ce) >= l(j).length && (y(j, [...l(j), l(ve)], !0), q(`Screenshot captured (${l(j).length})`, "success")), y(ce, null), y(ve, "");
  }
  function Xt() {
    y(Ne, !0), sl((T) => {
      y(F, [...l(F), T], !0), y(Ne, !1), q(`Element captured: <${T.tagName.toLowerCase()}>`, "success");
    });
  }
  function Qe() {
    y(oe, $f(), !0);
  }
  async function hn(T) {
    if (T.preventDefault(), !l(A).trim()) return;
    y(ne, !0), Qe();
    const H = {};
    (s() || i() || o() || a()) && (H.reporter = {}, s() && (H.reporter.userId = s()), i() && (H.reporter.email = i()), o() && (H.reporter.name = o()), a() && (H.reporter.role = a())), (c() || f()) && (H.organization = {}, c() && (H.organization.id = c()), f() && (H.organization.name = f()));
    const be = {
      title: l(A).trim(),
      description: l(k).trim(),
      type: l(L),
      priority: l(R),
      project: r() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: l(oe).length > 0 ? l(oe) : null,
      selected_elements: l(F).length > 0 ? l(F) : null,
      screenshots: l(j).length > 0 ? l(j) : null,
      metadata: Object.keys(H).length > 0 ? H : null
    };
    try {
      const tt = await cl(n(), be);
      tt.ok ? (q(`Report submitted (${tt.id})`, "success"), In(), setTimeout(
        () => {
          b(), y(d, "requests");
        },
        1200
      )) : (No(n(), be), q("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      No(n(), be), q("Queued for retry (endpoint unreachable)", "error");
    } finally {
      y(ne, !1);
    }
  }
  function In() {
    y(A, ""), y(k, ""), y(L, "bug"), y(R, "medium"), y(j, [], !0), y(F, [], !0), y(oe, [], !0);
  }
  Gs(() => {
    Qe();
  });
  const Mn = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], _t = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function It() {
    return l(j).length + l(F).length;
  }
  var dr = {
    get endpoint() {
      return n();
    },
    set endpoint(T) {
      n(T), W();
    },
    get project() {
      return r();
    },
    set project(T) {
      r(T), W();
    },
    get userId() {
      return s();
    },
    set userId(T = "") {
      s(T), W();
    },
    get userEmail() {
      return i();
    },
    set userEmail(T = "") {
      i(T), W();
    },
    get userName() {
      return o();
    },
    set userName(T = "") {
      o(T), W();
    },
    get userRole() {
      return a();
    },
    set userRole(T = "") {
      a(T), W();
    },
    get orgId() {
      return c();
    },
    set orgId(T = "") {
      c(T), W();
    },
    get orgName() {
      return f();
    },
    set orgName(T = "") {
      f(T), W();
    },
    get onclose() {
      return u();
    },
    set onclose(T) {
      u(T), W();
    },
    get ongrip() {
      return p();
    },
    set ongrip(T) {
      p(T), W();
    }
  }, Ln = $v(), yt = St(Ln), gn = x(yt), mn = x(gn);
  {
    var Or = (T) => {
      var H = pv();
      Y("mousedown", H, function(...be) {
        var tt;
        (tt = p()) == null || tt.apply(this, be);
      }), C(T, H);
    };
    B(mn, (T) => {
      p() && T(Or);
    });
  }
  var bn = $(mn, 2), qn = x(bn);
  let E;
  var re = $(qn, 2);
  let S;
  var M = $(x(re), 2);
  {
    var O = (T) => {
      var H = hv(), be = x(H, !0);
      w(H), D(() => Z(be, l(v))), C(T, H);
    };
    B(M, (T) => {
      l(v) > 0 && T(O);
    });
  }
  w(re), w(bn);
  var ie = $(bn, 2);
  w(gn);
  var et = $(gn, 2);
  {
    var Jt = (T) => {
      var H = Ev(), be = x(H), tt = $(x(be), 2);
      Xa(tt), w(be);
      var Pn = $(be, 2), zr = $(x(Pn), 2);
      Sa(zr), w(Pn);
      var _n = $(Pn, 2), Br = x(_n), vr = $(x(Br), 2);
      ze(vr, 21, () => Mn, ot, (X, ae) => {
        var Ee = gv(), z = x(Ee, !0);
        w(Ee);
        var U = {};
        D(() => {
          Z(z, l(ae).label), U !== (U = l(ae).value) && (Ee.value = (Ee.__value = l(ae).value) ?? "");
        }), C(X, Ee);
      }), w(vr), w(Br);
      var Ur = $(Br, 2), pr = $(x(Ur), 2);
      ze(pr, 21, () => _t, ot, (X, ae) => {
        var Ee = mv(), z = x(Ee, !0);
        w(Ee);
        var U = {};
        D(() => {
          Z(z, l(ae).label), U !== (U = l(ae).value) && (Ee.value = (Ee.__value = l(ae).value) ?? "");
        }), C(X, Ee);
      }), w(pr), w(Ur), w(_n);
      var Hr = $(_n, 2), yn = x(Hr);
      Nl(yn, {
        get screenshots() {
          return l(j);
        },
        get capturing() {
          return l(ue);
        },
        oncapture: pe,
        onremove: me,
        onedit: Ve
      });
      var wt = $(yn, 2), hr = $(x(wt), 2);
      {
        var Vr = (X) => {
          var ae = yo("Click an element...");
          C(X, ae);
        }, gr = (X) => {
          var ae = _v(), Ee = $(St(ae));
          {
            var z = (U) => {
              var le = bv(), Ce = x(le, !0);
              w(le), D(() => Z(Ce, l(F).length)), C(U, le);
            };
            B(Ee, (U) => {
              l(F).length > 0 && U(z);
            });
          }
          C(X, ae);
        };
        B(hr, (X) => {
          l(Ne) ? X(Vr) : X(gr, !1);
        });
      }
      w(wt), w(Hr);
      var Es = $(Hr, 2);
      {
        var Ss = (X) => {
          var ae = wv();
          ze(ae, 21, () => l(F), ot, (Ee, z, U) => {
            var le = yv(), Ce = x(le), Mt = x(Ce);
            w(Ce);
            var Fe = $(Ce, 2), Re = x(Fe, !0);
            w(Fe);
            var _e = $(Fe, 2);
            w(le), D(
              (Se, fe) => {
                Z(Mt, `<${Se ?? ""}>`), Z(Re, fe);
              },
              [
                () => l(z).tagName.toLowerCase(),
                () => {
                  var Se;
                  return ((Se = l(z).textContent) == null ? void 0 : Se.substring(0, 40)) || l(z).selector;
                }
              ]
            ), Y("click", _e, () => {
              y(F, l(F).filter((Se, fe) => fe !== U), !0);
            }), C(Ee, le);
          }), w(ae), C(X, ae);
        };
        B(Es, (X) => {
          l(F).length > 0 && X(Ss);
        });
      }
      var $s = $(Es, 2);
      jl($s, {
        get logs() {
          return l(oe);
        }
      });
      var Cs = $($s, 2);
      {
        var As = (X) => {
          var ae = xv(), Ee = x(ae);
          w(ae), D((z, U) => Z(Ee, `${z ?? ""} attachment${U ?? ""} will be included`), [It, () => It() > 1 ? "s" : ""]), C(X, ae);
        }, mi = /* @__PURE__ */ Et(() => It() > 0);
        B(Cs, (X) => {
          l(mi) && X(As);
        });
      }
      var Wr = $(Cs, 2), Yr = x(Wr), mr = $(Yr, 2), Kr = x(mr);
      {
        var bi = (X) => {
          var ae = kv();
          cs(), C(X, ae);
        }, _i = (X) => {
          var ae = yo("Submit");
          C(X, ae);
        };
        B(Kr, (X) => {
          l(ne) ? X(bi) : X(_i, !1);
        });
      }
      w(mr), w(Wr), w(H), D(
        (X) => {
          tt.disabled = l(ne), zr.disabled = l(ne), vr.disabled = l(ne), pr.disabled = l(ne), wt.disabled = l(Ne), Yr.disabled = l(ne), mr.disabled = X;
        },
        [() => l(ne) || !l(A).trim()]
      ), Ba("submit", H, hn), Zs(tt, () => l(A), (X) => y(A, X)), Zs(zr, () => l(k), (X) => y(k, X)), Eo(vr, () => l(L), (X) => y(L, X)), Eo(pr, () => l(R), (X) => y(R, X)), Y("click", wt, Xt), Y("click", Yr, function(...X) {
        var ae;
        (ae = u()) == null || ae.apply(this, X);
      }), Js(3, H, () => ti, () => ({ duration: 200 })), C(T, H);
    };
    B(et, (T) => {
      l(d) === "new" && T(Jt);
    });
  }
  var xe = $(et, 2);
  {
    var ge = (T) => {
      var H = Sv(), be = x(H);
      Ml(be, {
        get endpoint() {
          return n();
        },
        get loading() {
          return l(_);
        },
        get error() {
          return l(g);
        },
        onreload: b,
        get reports() {
          return l(h);
        },
        set reports(tt) {
          y(h, tt, !0);
        }
      }), w(H), Js(3, H, () => ti, () => ({ duration: 200 })), C(T, H);
    };
    B(xe, (T) => {
      l(d) === "requests" && T(ge);
    });
  }
  var Pe = $(xe, 2);
  Il(Pe, {
    get message() {
      return l(He);
    },
    get type() {
      return l(Ze);
    },
    get visible() {
      return l(ct);
    }
  }), w(yt);
  var I = $(yt, 2);
  {
    var We = (T) => {
      Rl(T, {
        get imageDataUrl() {
          return l(ve);
        },
        onsave: jt,
        oncancel: Gt
      });
    };
    B(I, (T) => {
      l(ce) !== null && T(We);
    });
  }
  return D(() => {
    E = De(qn, 1, "tab svelte-nv4d5v", null, E, { active: l(d) === "new" }), S = De(re, 1, "tab svelte-nv4d5v", null, S, { active: l(d) === "requests" });
  }), Y("click", qn, () => y(d, "new")), Y("click", re, () => y(d, "requests")), Y("click", ie, function(...T) {
    var H;
    (H = u()) == null || H.apply(this, T);
  }), C(e, Ln), pn(dr);
}
xs(["mousedown", "click"]);
jn(
  Ll,
  {
    endpoint: {},
    project: {},
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
var Av = /* @__PURE__ */ N("<div><!></div>"), Tv = /* @__PURE__ */ N('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), Nv = /* @__PURE__ */ N('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const Rv = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.jat-feedback-panel.hidden.svelte-qpyrvv {display:none;}.jat-feedback-panel.dragging.svelte-qpyrvv {pointer-events:none;opacity:0.9;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function jv(e, t) {
  vn(t, !0), Rn(e, Rv);
  let n = G(t, "endpoint", 7, ""), r = G(t, "project", 7, ""), s = G(t, "position", 7, "bottom-right"), i = G(t, "theme", 7, "dark"), o = G(t, "buttoncolor", 7, "#3b82f6"), a = G(t, "user-id", 7, ""), c = G(t, "user-email", 7, ""), f = G(t, "user-name", 7, ""), u = G(t, "user-role", 7, ""), p = G(t, "org-id", 7, ""), d = G(t, "org-name", 7, ""), h = /* @__PURE__ */ P(!1), _ = /* @__PURE__ */ P(!1), g = /* @__PURE__ */ P(!1), v = { x: 0, y: 0 }, b = /* @__PURE__ */ P(void 0);
  function A(q) {
    if (!l(b)) return;
    y(g, !0);
    const pe = l(b).getBoundingClientRect();
    v = { x: q.clientX - pe.left, y: q.clientY - pe.top };
    function me(jt) {
      if (!l(g) || !l(b)) return;
      jt.preventDefault();
      const Gt = jt.clientX - v.x, Xt = jt.clientY - v.y;
      l(b).style.top = `${Xt}px`, l(b).style.left = `${Gt}px`, l(b).style.bottom = "auto", l(b).style.right = "auto";
    }
    function Ve() {
      y(g, !1), window.removeEventListener("mousemove", me), window.removeEventListener("mouseup", Ve);
    }
    window.addEventListener("mousemove", me), window.addEventListener("mouseup", Ve);
  }
  let k = null;
  function L() {
    k = setInterval(
      () => {
        const q = Rf();
        q && !l(_) ? y(_, !0) : !q && l(_) && y(_, !1);
      },
      100
    );
  }
  let R = /* @__PURE__ */ Et(() => ({
    ...es,
    endpoint: n() || es.endpoint,
    position: s() || es.position,
    theme: i() || es.theme,
    buttonColor: o() || es.buttonColor
  }));
  function j() {
    y(h, !l(h));
  }
  function F() {
    y(h, !1);
  }
  const oe = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, ne = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function ue(q) {
    if (q.key === "Escape" && l(h)) {
      if (jf()) return;
      q.stopPropagation(), q.stopImmediatePropagation(), F();
    }
  }
  ro(() => {
    l(R).captureConsole && Ef(l(R).maxConsoleLogs), Hf(), L(), window.addEventListener("keydown", ue, !0);
    const q = () => {
      y(h, !0);
    };
    return window.addEventListener("jat-feedback:open", q), () => window.removeEventListener("jat-feedback:open", q);
  }), Ya(() => {
    Sf(), Vf(), window.removeEventListener("keydown", ue, !0), k && clearInterval(k);
  });
  var Ne = {
    get endpoint() {
      return n();
    },
    set endpoint(q = "") {
      n(q), W();
    },
    get project() {
      return r();
    },
    set project(q = "") {
      r(q), W();
    },
    get position() {
      return s();
    },
    set position(q = "bottom-right") {
      s(q), W();
    },
    get theme() {
      return i();
    },
    set theme(q = "dark") {
      i(q), W();
    },
    get buttoncolor() {
      return o();
    },
    set buttoncolor(q = "#3b82f6") {
      o(q), W();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"(q = "") {
      a(q), W();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"(q = "") {
      c(q), W();
    },
    get "user-name"() {
      return f();
    },
    set "user-name"(q = "") {
      f(q), W();
    },
    get "user-role"() {
      return u();
    },
    set "user-role"(q = "") {
      u(q), W();
    },
    get "org-id"() {
      return p();
    },
    set "org-id"(q = "") {
      p(q), W();
    },
    get "org-name"() {
      return d();
    },
    set "org-name"(q = "") {
      d(q), W();
    }
  }, ce = Nv(), ve = x(ce);
  {
    var He = (q) => {
      var pe = Av();
      let me;
      var Ve = x(pe);
      Ll(Ve, {
        get endpoint() {
          return l(R).endpoint;
        },
        get project() {
          return r();
        },
        get userId() {
          return a();
        },
        get userEmail() {
          return c();
        },
        get userName() {
          return f();
        },
        get userRole() {
          return u();
        },
        get orgId() {
          return p();
        },
        get orgName() {
          return d();
        },
        onclose: F,
        ongrip: A
      }), w(pe), D(() => {
        me = De(pe, 1, "jat-feedback-panel svelte-qpyrvv", null, me, { dragging: l(g), hidden: !l(h) }), rr(pe, ne[l(R).position] || ne["bottom-right"]);
      }), C(q, pe);
    }, Ze = (q) => {
      var pe = Tv();
      D(() => rr(pe, ne[l(R).position] || ne["bottom-right"])), C(q, pe);
    };
    B(ve, (q) => {
      l(R).endpoint ? q(He) : l(h) && q(Ze, 1);
    });
  }
  var ct = $(ve, 2);
  return vl(ct, {
    onclick: j,
    get open() {
      return l(h);
    }
  }), w(ce), zs(ce, (q) => y(b, q), () => l(b)), D(() => rr(ce, `${(oe[l(R).position] || oe["bottom-right"]) ?? ""}; --jat-btn-color: ${l(R).buttonColor ?? ""}; ${l(_) ? "display: none;" : ""}`)), C(e, ce), pn(Ne);
}
customElements.define("jat-feedback", jn(
  jv,
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
