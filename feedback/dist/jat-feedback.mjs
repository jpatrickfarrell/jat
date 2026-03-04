var Il = Object.defineProperty;
var si = (e) => {
  throw TypeError(e);
};
var Ml = (e, t, n) => t in e ? Il(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var _e = (e, t, n) => Ml(e, typeof t != "symbol" ? t + "" : t, n), bo = (e, t, n) => t.has(e) || si("Cannot " + n);
var g = (e, t, n) => (bo(e, t, "read from private field"), n ? n.call(e) : t.get(e)), X = (e, t, n) => t.has(e) ? si("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), H = (e, t, n, r) => (bo(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), Ne = (e, t, n) => (bo(e, t, "access private method"), n);
var ji;
typeof window < "u" && ((ji = window.__svelte ?? (window.__svelte = {})).v ?? (ji.v = /* @__PURE__ */ new Set())).add("5");
const Ll = 1, Dl = 2, Oi = 4, Pl = 8, Ol = 16, ql = 1, Fl = 4, zl = 8, Bl = 16, Ul = 4, qi = 1, Hl = 2, Fo = "[", Gs = "[!", zo = "]", Dr = {}, Ie = Symbol(), Fi = "http://www.w3.org/1999/xhtml", xo = !1;
var Bo = Array.isArray, Vl = Array.prototype.indexOf, Pr = Array.prototype.includes, Js = Array.from, Ps = Object.keys, Os = Object.defineProperty, ir = Object.getOwnPropertyDescriptor, Wl = Object.getOwnPropertyDescriptors, Yl = Object.prototype, Xl = Array.prototype, zi = Object.getPrototypeOf, oi = Object.isExtensible;
function Kl(e) {
  return typeof e == "function";
}
const $r = () => {
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
const De = 2, is = 4, Zs = 8, Ui = 1 << 24, rn = 16, zt = 32, qn = 64, Hi = 128, St = 512, Re = 1024, Pe = 2048, Ft = 4096, gt = 8192, yn = 16384, hr = 32768, ur = 65536, ii = 1 << 17, Vi = 1 << 18, gr = 1 << 19, Jl = 1 << 20, bn = 1 << 25, dr = 65536, ko = 1 << 21, Uo = 1 << 22, Dn = 1 << 23, ar = Symbol("$state"), Wi = Symbol("legacy props"), Zl = Symbol(""), Jn = new class extends Error {
  constructor() {
    super(...arguments);
    _e(this, "name", "StaleReactionError");
    _e(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Ii, Mi;
const Ql = ((Mi = (Ii = globalThis.document) == null ? void 0 : Ii.contentType) == null ? void 0 : /* @__PURE__ */ Mi.includes("xml")) ?? !1, gs = 3, Hr = 8;
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
function Qs(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function dc() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function vc() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let te = !1;
function _n(e) {
  te = e;
}
let Q;
function Ke(e) {
  if (e === null)
    throw Qs(), Dr;
  return Q = e;
}
function ms() {
  return Ke(/* @__PURE__ */ sn(Q));
}
function w(e) {
  if (te) {
    if (/* @__PURE__ */ sn(Q) !== null)
      throw Qs(), Dr;
    Q = e;
  }
}
function qs(e = 1) {
  if (te) {
    for (var t = e, n = Q; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ sn(n);
    Q = n;
  }
}
function Fs(e = !0) {
  for (var t = 0, n = Q; ; ) {
    if (n.nodeType === Hr) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === zo) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Fo || r === Gs || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ sn(n)
    );
    e && n.remove(), n = s;
  }
}
function Xi(e) {
  if (!e || e.nodeType !== Hr)
    throw Qs(), Dr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Ki(e) {
  return e === this.v;
}
function pc(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Gi(e) {
  return !pc(e, this.v);
}
let hc = !1, st = null;
function Or(e) {
  st = e;
}
function xn(e, t = !1, n) {
  st = {
    p: st,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function kn(e) {
  var t = (
    /** @type {ComponentContext} */
    st
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      xa(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, st = t.p, e ?? /** @type {T} */
  {};
}
function Ji() {
  return !0;
}
let Zn = [];
function Zi() {
  var e = Zn;
  Zn = [], Gl(e);
}
function Ot(e) {
  if (Zn.length === 0 && !ts) {
    var t = Zn;
    queueMicrotask(() => {
      t === Zn && Zi();
    });
  }
  Zn.push(e);
}
function gc() {
  for (; Zn.length > 0; )
    Zi();
}
function Qi(e) {
  var t = oe;
  if (t === null)
    return ne.f |= Dn, e;
  if ((t.f & hr) === 0 && (t.f & is) === 0)
    throw e;
  qr(e, t);
}
function qr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Hi) !== 0) {
      if ((t.f & hr) === 0)
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
function ye(e, t) {
  e.f = e.f & mc | t;
}
function Ho(e) {
  (e.f & St) !== 0 || e.deps === null ? ye(e, Re) : ye(e, Ft);
}
function ea(e) {
  if (e !== null)
    for (const t of e)
      (t.f & De) === 0 || (t.f & dr) === 0 || (t.f ^= dr, ea(
        /** @type {Derived} */
        t.deps
      ));
}
function ta(e, t, n) {
  (e.f & Pe) !== 0 ? t.add(e) : (e.f & Ft) !== 0 && n.add(e), ea(e.deps), ye(e, Re);
}
const $s = /* @__PURE__ */ new Set();
let Y = null, zs = null, Me = null, tt = [], eo = null, Eo = !1, ts = !1;
var Tr, Nr, er, Rr, us, ds, tr, dn, jr, nn, So, $o, na;
const ri = class ri {
  constructor() {
    X(this, nn);
    _e(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    _e(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    _e(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    X(this, Tr, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    X(this, Nr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    X(this, er, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    X(this, Rr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    X(this, us, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    X(this, ds, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    X(this, tr, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    X(this, dn, /* @__PURE__ */ new Map());
    _e(this, "is_fork", !1);
    X(this, jr, !1);
  }
  is_deferred() {
    return this.is_fork || g(this, Rr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    g(this, dn).has(t) || g(this, dn).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = g(this, dn).get(t);
    if (n) {
      g(this, dn).delete(t);
      for (var r of n.d)
        ye(r, Pe), Dt(r);
      for (r of n.m)
        ye(r, Ft), Dt(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    tt = [], this.apply();
    var n = [], r = [];
    for (const o of t)
      Ne(this, nn, So).call(this, o, n, r);
    if (this.is_deferred()) {
      Ne(this, nn, $o).call(this, r), Ne(this, nn, $o).call(this, n);
      for (const [o, i] of g(this, dn))
        ia(o, i);
    } else {
      for (const o of g(this, Tr)) o();
      g(this, Tr).clear(), g(this, er) === 0 && Ne(this, nn, na).call(this), zs = this, Y = null, ai(r), ai(n), zs = null, (s = g(this, us)) == null || s.resolve();
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
    n !== Ie && !this.previous.has(t) && this.previous.set(t, n), (t.f & Dn) === 0 && (this.current.set(t, t.v), Me == null || Me.set(t, t.v));
  }
  activate() {
    Y = this, this.apply();
  }
  deactivate() {
    Y === this && (Y = null, Me = null);
  }
  flush() {
    if (this.activate(), tt.length > 0) {
      if (ra(), Y !== null && Y !== this)
        return;
    } else g(this, er) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of g(this, Nr)) t(this);
    g(this, Nr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    H(this, er, g(this, er) + 1), t && H(this, Rr, g(this, Rr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    H(this, er, g(this, er) - 1), t && H(this, Rr, g(this, Rr) - 1), !g(this, jr) && (H(this, jr, !0), Ot(() => {
      H(this, jr, !1), this.is_deferred() ? tt.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of g(this, ds))
      g(this, tr).delete(t), ye(t, Pe), Dt(t);
    for (const t of g(this, tr))
      ye(t, Ft), Dt(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    g(this, Tr).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    g(this, Nr).add(t);
  }
  settled() {
    return (g(this, us) ?? H(this, us, Bi())).promise;
  }
  static ensure() {
    if (Y === null) {
      const t = Y = new ri();
      $s.add(Y), ts || Ot(() => {
        Y === t && t.flush();
      });
    }
    return Y;
  }
  apply() {
  }
};
Tr = new WeakMap(), Nr = new WeakMap(), er = new WeakMap(), Rr = new WeakMap(), us = new WeakMap(), ds = new WeakMap(), tr = new WeakMap(), dn = new WeakMap(), jr = new WeakMap(), nn = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
So = function(t, n, r) {
  t.f ^= Re;
  for (var s = t.first, o = null; s !== null; ) {
    var i = s.f, a = (i & (zt | qn)) !== 0, c = a && (i & Re) !== 0, u = c || (i & gt) !== 0 || g(this, dn).has(s);
    if (!u && s.fn !== null) {
      a ? s.f ^= Re : o !== null && (i & (is | Zs | Ui)) !== 0 ? o.b.defer_effect(s) : (i & is) !== 0 ? n.push(s) : bs(s) && ((i & rn) !== 0 && g(this, tr).add(s), zr(s));
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
    ta(t[n], g(this, ds), g(this, tr));
}, na = function() {
  var s;
  if ($s.size > 1) {
    this.previous.clear();
    var t = Me, n = !0;
    for (const o of $s) {
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
      const a = [...o.current.keys()].filter((c) => !this.current.has(c));
      if (a.length > 0) {
        var r = tt;
        tt = [];
        const c = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const f of i)
          sa(f, a, c, u);
        if (tt.length > 0) {
          Y = o, o.apply();
          for (const f of tt)
            Ne(s = o, nn, So).call(s, f, [], []);
          o.deactivate();
        }
        tt = r;
      }
    }
    Y = null, Me = t;
  }
  this.committed = !0, $s.delete(this);
};
let wn = ri;
function U(e) {
  var t = ts;
  ts = !0;
  try {
    for (var n; ; ) {
      if (gc(), tt.length === 0 && (Y == null || Y.flush(), tt.length === 0))
        return eo = null, /** @type {T} */
        n;
      ra();
    }
  } finally {
    ts = t;
  }
}
function ra() {
  Eo = !0;
  var e = null;
  try {
    for (var t = 0; tt.length > 0; ) {
      var n = wn.ensure();
      if (t++ > 1e3) {
        var r, s;
        bc();
      }
      n.process(tt), Pn.clear();
    }
  } finally {
    tt = [], Eo = !1, eo = null;
  }
}
function bc() {
  try {
    oc();
  } catch (e) {
    qr(e, eo);
  }
}
let Mt = null;
function ai(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (yn | gt)) === 0 && bs(r) && (Mt = /* @__PURE__ */ new Set(), zr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ea(r), (Mt == null ? void 0 : Mt.size) > 0)) {
        Pn.clear();
        for (const s of Mt) {
          if ((s.f & (yn | gt)) !== 0) continue;
          const o = [s];
          let i = s.parent;
          for (; i !== null; )
            Mt.has(i) && (Mt.delete(i), o.push(i)), i = i.parent;
          for (let a = o.length - 1; a >= 0; a--) {
            const c = o[a];
            (c.f & (yn | gt)) === 0 && zr(c);
          }
        }
        Mt.clear();
      }
    }
    Mt = null;
  }
}
function sa(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const o = s.f;
      (o & De) !== 0 ? sa(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (o & (Uo | rn)) !== 0 && (o & Pe) === 0 && oa(s, t, r) && (ye(s, Pe), Dt(
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
      if ((s.f & De) !== 0 && oa(
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
function Dt(e) {
  for (var t = eo = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (Eo && t === oe && (n & rn) !== 0 && (n & Vi) === 0)
      return;
    if ((n & (qn | zt)) !== 0) {
      if ((n & Re) === 0) return;
      t.f ^= Re;
    }
  }
  tt.push(t);
}
function ia(e, t) {
  if (!((e.f & zt) !== 0 && (e.f & Re) !== 0)) {
    (e.f & Pe) !== 0 ? t.d.push(e) : (e.f & Ft) !== 0 && t.m.push(e), ye(e, Re);
    for (var n = e.first; n !== null; )
      ia(n, t), n = n.next;
  }
}
function _c(e) {
  let t = 0, n = vr(0), r;
  return () => {
    Xo() && (l(n), so(() => (t === 0 && (r = mr(() => e(() => ns(n)))), t += 1, () => {
      Ot(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, ns(n));
      });
    })));
  };
}
var yc = ur | gr | Hi;
function wc(e, t, n) {
  new xc(e, t, n);
}
var ut, vs, Xt, nr, Kt, wt, et, Gt, vn, Ln, rr, pn, Ir, sr, Mr, Lr, hn, Xs, xe, aa, la, Co, Ts, Ns, Ao;
class xc {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    X(this, xe);
    /** @type {Boundary | null} */
    _e(this, "parent");
    _e(this, "is_pending", !1);
    /** @type {TemplateNode} */
    X(this, ut);
    /** @type {TemplateNode | null} */
    X(this, vs, te ? Q : null);
    /** @type {BoundaryProps} */
    X(this, Xt);
    /** @type {((anchor: Node) => void)} */
    X(this, nr);
    /** @type {Effect} */
    X(this, Kt);
    /** @type {Effect | null} */
    X(this, wt, null);
    /** @type {Effect | null} */
    X(this, et, null);
    /** @type {Effect | null} */
    X(this, Gt, null);
    /** @type {DocumentFragment | null} */
    X(this, vn, null);
    /** @type {TemplateNode | null} */
    X(this, Ln, null);
    X(this, rr, 0);
    X(this, pn, 0);
    X(this, Ir, !1);
    X(this, sr, !1);
    /** @type {Set<Effect>} */
    X(this, Mr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    X(this, Lr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    X(this, hn, null);
    X(this, Xs, _c(() => (H(this, hn, vr(g(this, rr))), () => {
      H(this, hn, null);
    })));
    H(this, ut, t), H(this, Xt, n), H(this, nr, r), this.parent = /** @type {Effect} */
    oe.b, this.is_pending = !!g(this, Xt).pending, H(this, Kt, oo(() => {
      if (oe.b = this, te) {
        const o = g(this, vs);
        ms(), /** @type {Comment} */
        o.nodeType === Hr && /** @type {Comment} */
        o.data === Gs ? Ne(this, xe, la).call(this) : (Ne(this, xe, aa).call(this), g(this, pn) === 0 && (this.is_pending = !1));
      } else {
        var s = Ne(this, xe, Co).call(this);
        try {
          H(this, wt, kt(() => r(s)));
        } catch (o) {
          this.error(o);
        }
        g(this, pn) > 0 ? Ne(this, xe, Ns).call(this) : this.is_pending = !1;
      }
      return () => {
        var o;
        (o = g(this, Ln)) == null || o.remove();
      };
    }, yc)), te && H(this, ut, Q);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ta(t, g(this, Mr), g(this, Lr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!g(this, Xt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    Ne(this, xe, Ao).call(this, t), H(this, rr, g(this, rr) + t), !(!g(this, hn) || g(this, Ir)) && (H(this, Ir, !0), Ot(() => {
      H(this, Ir, !1), g(this, hn) && Fr(g(this, hn), g(this, rr));
    }));
  }
  get_effect_pending() {
    return g(this, Xs).call(this), l(
      /** @type {Source<number>} */
      g(this, hn)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = g(this, Xt).onerror;
    let r = g(this, Xt).failed;
    if (g(this, sr) || !n && !r)
      throw t;
    g(this, wt) && (Ge(g(this, wt)), H(this, wt, null)), g(this, et) && (Ge(g(this, et)), H(this, et, null)), g(this, Gt) && (Ge(g(this, Gt)), H(this, Gt, null)), te && (Ke(
      /** @type {TemplateNode} */
      g(this, vs)
    ), qs(), Ke(Fs()));
    var s = !1, o = !1;
    const i = () => {
      if (s) {
        vc();
        return;
      }
      s = !0, o && uc(), wn.ensure(), H(this, rr, 0), g(this, Gt) !== null && lr(g(this, Gt), () => {
        H(this, Gt, null);
      }), this.is_pending = this.has_pending_snippet(), H(this, wt, Ne(this, xe, Ts).call(this, () => (H(this, sr, !1), kt(() => g(this, nr).call(this, g(this, ut)))))), g(this, pn) > 0 ? Ne(this, xe, Ns).call(this) : this.is_pending = !1;
    };
    Ot(() => {
      try {
        o = !0, n == null || n(t, i), o = !1;
      } catch (a) {
        qr(a, g(this, Kt) && g(this, Kt).parent);
      }
      r && H(this, Gt, Ne(this, xe, Ts).call(this, () => {
        wn.ensure(), H(this, sr, !0);
        try {
          return kt(() => {
            r(
              g(this, ut),
              () => t,
              () => i
            );
          });
        } catch (a) {
          return qr(
            a,
            /** @type {Effect} */
            g(this, Kt).parent
          ), null;
        } finally {
          H(this, sr, !1);
        }
      }));
    });
  }
}
ut = new WeakMap(), vs = new WeakMap(), Xt = new WeakMap(), nr = new WeakMap(), Kt = new WeakMap(), wt = new WeakMap(), et = new WeakMap(), Gt = new WeakMap(), vn = new WeakMap(), Ln = new WeakMap(), rr = new WeakMap(), pn = new WeakMap(), Ir = new WeakMap(), sr = new WeakMap(), Mr = new WeakMap(), Lr = new WeakMap(), hn = new WeakMap(), Xs = new WeakMap(), xe = new WeakSet(), aa = function() {
  try {
    H(this, wt, kt(() => g(this, nr).call(this, g(this, ut))));
  } catch (t) {
    this.error(t);
  }
}, la = function() {
  const t = g(this, Xt).pending;
  t && (H(this, et, kt(() => t(g(this, ut)))), Ot(() => {
    var n = Ne(this, xe, Co).call(this);
    H(this, wt, Ne(this, xe, Ts).call(this, () => (wn.ensure(), kt(() => g(this, nr).call(this, n))))), g(this, pn) > 0 ? Ne(this, xe, Ns).call(this) : (lr(
      /** @type {Effect} */
      g(this, et),
      () => {
        H(this, et, null);
      }
    ), this.is_pending = !1);
  }));
}, Co = function() {
  var t = g(this, ut);
  return this.is_pending && (H(this, Ln, rt()), g(this, ut).before(g(this, Ln)), t = g(this, Ln)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Ts = function(t) {
  var n = oe, r = ne, s = st;
  en(g(this, Kt)), Ct(g(this, Kt)), Or(g(this, Kt).ctx);
  try {
    return t();
  } catch (o) {
    return Qi(o), null;
  } finally {
    en(n), Ct(r), Or(s);
  }
}, Ns = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    g(this, Xt).pending
  );
  g(this, wt) !== null && (H(this, vn, document.createDocumentFragment()), g(this, vn).append(
    /** @type {TemplateNode} */
    g(this, Ln)
  ), Ca(g(this, wt), g(this, vn))), g(this, et) === null && H(this, et, kt(() => t(g(this, ut))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Ao = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && Ne(n = this.parent, xe, Ao).call(n, t);
    return;
  }
  if (H(this, pn, g(this, pn) + t), g(this, pn) === 0) {
    this.is_pending = !1;
    for (const r of g(this, Mr))
      ye(r, Pe), Dt(r);
    for (const r of g(this, Lr))
      ye(r, Ft), Dt(r);
    g(this, Mr).clear(), g(this, Lr).clear(), g(this, et) && lr(g(this, et), () => {
      H(this, et, null);
    }), g(this, vn) && (g(this, ut).before(g(this, vn)), H(this, vn, null));
  }
};
function kc(e, t, n, r) {
  const s = to;
  var o = e.filter((v) => !v.settled);
  if (n.length === 0 && o.length === 0) {
    r(t.map(s));
    return;
  }
  var i = Y, a = (
    /** @type {Effect} */
    oe
  ), c = Ec(), u = o.length === 1 ? o[0].promise : o.length > 1 ? Promise.all(o.map((v) => v.promise)) : null;
  function f(v) {
    c();
    try {
      r(v);
    } catch (h) {
      (a.f & yn) === 0 && qr(h, a);
    }
    i == null || i.deactivate(), To();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(s)));
    return;
  }
  function d() {
    c(), Promise.all(n.map((v) => /* @__PURE__ */ Sc(v))).then((v) => f([...t.map(s), ...v])).catch((v) => qr(v, a));
  }
  u ? u.then(d) : d();
}
function Ec() {
  var e = oe, t = ne, n = st, r = Y;
  return function(o = !0) {
    en(e), Ct(t), Or(n), o && (r == null || r.activate());
  };
}
function To() {
  en(null), Ct(null), Or(null);
}
// @__NO_SIDE_EFFECTS__
function to(e) {
  var t = De | Pe, n = ne !== null && (ne.f & De) !== 0 ? (
    /** @type {Derived} */
    ne
  ) : null;
  return oe !== null && (oe.f |= gr), {
    ctx: st,
    deps: null,
    effects: null,
    equals: Ki,
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
  ), i = vr(
    /** @type {V} */
    Ie
  ), a = !ne, c = /* @__PURE__ */ new Map();
  return Lc(() => {
    var h;
    var u = Bi();
    o = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).then(() => {
        f === Y && f.committed && f.deactivate(), To();
      });
    } catch (b) {
      u.reject(b), To();
    }
    var f = (
      /** @type {Batch} */
      Y
    );
    if (a) {
      var d = s.is_rendered();
      s.update_pending_count(1), f.increment(d), (h = c.get(f)) == null || h.reject(Jn), c.delete(f), c.set(f, u);
    }
    const v = (b, _ = void 0) => {
      if (f.activate(), _)
        _ !== Jn && (i.f |= Dn, Fr(i, _));
      else {
        (i.f & Dn) !== 0 && (i.f ^= Dn), Fr(i, b);
        for (const [p, m] of c) {
          if (c.delete(p), p === f) break;
          m.reject(Jn);
        }
      }
      a && (s.update_pending_count(-1), f.decrement(d));
    };
    u.promise.then(v, (b) => v(null, b || "unknown"));
  }), Ko(() => {
    for (const u of c.values())
      u.reject(Jn);
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
function Zt(e) {
  const t = /* @__PURE__ */ to(e);
  return Aa(t), t;
}
// @__NO_SIDE_EFFECTS__
function ca(e) {
  const t = /* @__PURE__ */ to(e);
  return t.equals = Gi, t;
}
function $c(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Ge(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Cc(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & De) === 0)
      return (t.f & yn) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Vo(e) {
  var t, n = oe;
  en(Cc(e));
  try {
    e.f &= ~dr, $c(e), t = ja(e);
  } finally {
    en(n);
  }
  return t;
}
function fa(e) {
  var t = Vo(e);
  if (!e.equals(t) && (e.wv = Na(), (!(Y != null && Y.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    ye(e, Re);
    return;
  }
  On || (Me !== null ? (Xo() || Y != null && Y.is_fork) && Me.set(e, t) : Ho(e));
}
function Ac(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(Jn), r.teardown = $r, r.ac = null, as(r, 0), Go(r));
}
function ua(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && zr(t);
}
let No = /* @__PURE__ */ new Set();
const Pn = /* @__PURE__ */ new Map();
let da = !1;
function vr(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ki,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function D(e, t) {
  const n = vr(e);
  return Aa(n), n;
}
// @__NO_SIDE_EFFECTS__
function va(e, t = !1, n = !0) {
  const r = vr(e);
  return t || (r.equals = Gi), r;
}
function y(e, t, n = !1) {
  ne !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Pt || (ne.f & ii) !== 0) && Ji() && (ne.f & (De | rn | Uo | ii)) !== 0 && ($t === null || !Pr.call($t, e)) && fc();
  let r = n ? Le(t) : t;
  return Fr(e, r);
}
function Fr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    On ? Pn.set(e, t) : Pn.set(e, n), e.v = t;
    var r = wn.ensure();
    if (r.capture(e, n), (e.f & De) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Pe) !== 0 && Vo(s), Ho(s);
    }
    e.wv = Na(), pa(e, Pe), oe !== null && (oe.f & Re) !== 0 && (oe.f & (zt | qn)) === 0 && (yt === null ? Oc([e]) : yt.push(e)), !r.is_fork && No.size > 0 && !da && Tc();
  }
  return t;
}
function Tc() {
  da = !1;
  for (const e of No)
    (e.f & Re) !== 0 && ye(e, Ft), bs(e) && zr(e);
  No.clear();
}
function ns(e) {
  y(e, e.v + 1);
}
function pa(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var o = n[s], i = o.f, a = (i & Pe) === 0;
      if (a && ye(o, t), (i & De) !== 0) {
        var c = (
          /** @type {Derived} */
          o
        );
        Me == null || Me.delete(c), (i & dr) === 0 && (i & St && (o.f |= dr), pa(c, Ft));
      } else a && ((i & rn) !== 0 && Mt !== null && Mt.add(
        /** @type {Effect} */
        o
      ), Dt(
        /** @type {Effect} */
        o
      ));
    }
}
function Le(e) {
  if (typeof e != "object" || e === null || ar in e)
    return e;
  const t = zi(e);
  if (t !== Yl && t !== Xl)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Bo(e), s = /* @__PURE__ */ D(0), o = cr, i = (a) => {
    if (cr === o)
      return a();
    var c = ne, u = cr;
    Ct(null), di(o);
    var f = a();
    return Ct(c), di(u), f;
  };
  return r && n.set("length", /* @__PURE__ */ D(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, c, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && lc();
        var f = n.get(c);
        return f === void 0 ? i(() => {
          var d = /* @__PURE__ */ D(u.value);
          return n.set(c, d), d;
        }) : y(f, u.value, !0), !0;
      },
      deleteProperty(a, c) {
        var u = n.get(c);
        if (u === void 0) {
          if (c in a) {
            const f = i(() => /* @__PURE__ */ D(Ie));
            n.set(c, f), ns(s);
          }
        } else
          y(u, Ie), ns(s);
        return !0;
      },
      get(a, c, u) {
        var h;
        if (c === ar)
          return e;
        var f = n.get(c), d = c in a;
        if (f === void 0 && (!d || (h = ir(a, c)) != null && h.writable) && (f = i(() => {
          var b = Le(d ? a[c] : Ie), _ = /* @__PURE__ */ D(b);
          return _;
        }), n.set(c, f)), f !== void 0) {
          var v = l(f);
          return v === Ie ? void 0 : v;
        }
        return Reflect.get(a, c, u);
      },
      getOwnPropertyDescriptor(a, c) {
        var u = Reflect.getOwnPropertyDescriptor(a, c);
        if (u && "value" in u) {
          var f = n.get(c);
          f && (u.value = l(f));
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
      has(a, c) {
        var v;
        if (c === ar)
          return !0;
        var u = n.get(c), f = u !== void 0 && u.v !== Ie || Reflect.has(a, c);
        if (u !== void 0 || oe !== null && (!f || (v = ir(a, c)) != null && v.writable)) {
          u === void 0 && (u = i(() => {
            var h = f ? Le(a[c]) : Ie, b = /* @__PURE__ */ D(h);
            return b;
          }), n.set(c, u));
          var d = l(u);
          if (d === Ie)
            return !1;
        }
        return f;
      },
      set(a, c, u, f) {
        var k;
        var d = n.get(c), v = c in a;
        if (r && c === "length")
          for (var h = u; h < /** @type {Source<number>} */
          d.v; h += 1) {
            var b = n.get(h + "");
            b !== void 0 ? y(b, Ie) : h in a && (b = i(() => /* @__PURE__ */ D(Ie)), n.set(h + "", b));
          }
        if (d === void 0)
          (!v || (k = ir(a, c)) != null && k.writable) && (d = i(() => /* @__PURE__ */ D(void 0)), y(d, Le(u)), n.set(c, d));
        else {
          v = d.v !== Ie;
          var _ = i(() => Le(u));
          y(d, _);
        }
        var p = Reflect.getOwnPropertyDescriptor(a, c);
        if (p != null && p.set && p.set.call(f, u), !v) {
          if (r && typeof c == "string") {
            var m = (
              /** @type {Source<number>} */
              n.get("length")
            ), T = Number(c);
            Number.isInteger(T) && T >= m.v && y(m, T + 1);
          }
          ns(s);
        }
        return !0;
      },
      ownKeys(a) {
        l(s);
        var c = Reflect.ownKeys(a).filter((d) => {
          var v = n.get(d);
          return v === void 0 || v.v !== Ie;
        });
        for (var [u, f] of n)
          f.v !== Ie && !(u in a) && c.push(u);
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
    if (e !== null && typeof e == "object" && ar in e)
      return e[ar];
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
    ga = ir(t, "firstChild").get, ma = ir(t, "nextSibling").get, oi(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), oi(n) && (n.__t = void 0);
  }
}
function rt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ht(e) {
  return (
    /** @type {TemplateNode | null} */
    ga.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function sn(e) {
  return (
    /** @type {TemplateNode | null} */
    ma.call(e)
  );
}
function x(e, t) {
  if (!te)
    return /* @__PURE__ */ ht(e);
  var n = /* @__PURE__ */ ht(Q);
  if (n === null)
    n = Q.appendChild(rt());
  else if (t && n.nodeType !== gs) {
    var r = rt();
    return n == null || n.before(r), Ke(r), r;
  }
  return t && no(
    /** @type {Text} */
    n
  ), Ke(n), n;
}
function vt(e, t = !1) {
  if (!te) {
    var n = /* @__PURE__ */ ht(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ sn(n) : n;
  }
  if (t) {
    if ((Q == null ? void 0 : Q.nodeType) !== gs) {
      var r = rt();
      return Q == null || Q.before(r), Ke(r), r;
    }
    no(
      /** @type {Text} */
      Q
    );
  }
  return Q;
}
function S(e, t = 1, n = !1) {
  let r = te ? Q : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ sn(r);
  if (!te)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== gs) {
      var o = rt();
      return r === null ? s == null || s.after(o) : r.before(o), Ke(o), o;
    }
    no(
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
function no(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === gs; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function _a(e) {
  te && /* @__PURE__ */ ht(e) !== null && Wo(e);
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
function Vr(e) {
  var t = ne, n = oe;
  Ct(null), en(null);
  try {
    return e();
  } finally {
    Ct(t), en(n);
  }
}
function wa(e, t, n, r = n) {
  e.addEventListener(t, () => Vr(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), ya();
}
function Rc(e) {
  oe === null && (ne === null && sc(), rc()), On && nc();
}
function jc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function on(e, t, n) {
  var r = oe;
  r !== null && (r.f & gt) !== 0 && (e |= gt);
  var s = {
    ctx: st,
    deps: null,
    nodes: null,
    f: e | Pe | St,
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
      zr(s);
    } catch (a) {
      throw Ge(s), a;
    }
  else t !== null && Dt(s);
  var o = s;
  if (n && o.deps === null && o.teardown === null && o.nodes === null && o.first === o.last && // either `null`, or a singular child
  (o.f & gr) === 0 && (o = o.first, (e & rn) !== 0 && (e & ur) !== 0 && o !== null && (o.f |= ur)), o !== null && (o.parent = r, r !== null && jc(o, r), ne !== null && (ne.f & De) !== 0 && (e & qn) === 0)) {
    var i = (
      /** @type {Derived} */
      ne
    );
    (i.effects ?? (i.effects = [])).push(o);
  }
  return s;
}
function Xo() {
  return ne !== null && !Pt;
}
function Ko(e) {
  const t = on(Zs, null, !1);
  return ye(t, Re), t.teardown = e, t;
}
function Rs(e) {
  Rc();
  var t = (
    /** @type {Effect} */
    oe.f
  ), n = !ne && (t & zt) !== 0 && (t & hr) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      st
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return xa(e);
}
function xa(e) {
  return on(is | Jl, e, !1);
}
function Ic(e) {
  wn.ensure();
  const t = on(qn | gr, e, !0);
  return () => {
    Ge(t);
  };
}
function Mc(e) {
  wn.ensure();
  const t = on(qn | gr, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? lr(t, () => {
      Ge(t), r(void 0);
    }) : (Ge(t), r(void 0));
  });
}
function ro(e) {
  return on(is, e, !1);
}
function Lc(e) {
  return on(Uo | gr, e, !0);
}
function so(e, t = 0) {
  return on(Zs | t, e, !0);
}
function z(e, t = [], n = [], r = []) {
  kc(r, t, n, (s) => {
    on(Zs, () => e(...s.map(l)), !0);
  });
}
function oo(e, t = 0) {
  var n = on(rn | t, e, !0);
  return n;
}
function kt(e) {
  return on(zt | gr, e, !0);
}
function ka(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = On, r = ne;
    ui(!0), Ct(null);
    try {
      t.call(null);
    } finally {
      ui(n), Ct(r);
    }
  }
}
function Go(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Vr(() => {
      s.abort(Jn);
    });
    var r = n.next;
    (n.f & qn) !== 0 ? n.parent = null : Ge(n, t), n = r;
  }
}
function Dc(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & zt) === 0 && Ge(t), t = n;
  }
}
function Ge(e, t = !0) {
  var n = !1;
  (t || (e.f & Vi) !== 0) && e.nodes !== null && e.nodes.end !== null && (Pc(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), Go(e, t && !n), as(e, 0), ye(e, yn);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const o of r)
      o.stop();
  ka(e);
  var s = e.parent;
  s !== null && s.first !== null && Ea(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Pc(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ sn(e);
    e.remove(), e = n;
  }
}
function Ea(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function lr(e, t, n = !0) {
  var r = [];
  Sa(e, r, !0);
  var s = () => {
    n && Ge(e), t && t();
  }, o = r.length;
  if (o > 0) {
    var i = () => --o || s();
    for (var a of r)
      a.out(i);
  } else
    s();
}
function Sa(e, t, n) {
  if ((e.f & gt) === 0) {
    e.f ^= gt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var o = s.next, i = (s.f & ur) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & zt) !== 0 && (e.f & rn) !== 0;
      Sa(s, t, i ? n : !1), s = o;
    }
  }
}
function Jo(e) {
  $a(e, !0);
}
function $a(e, t) {
  if ((e.f & gt) !== 0) {
    e.f ^= gt, (e.f & Re) === 0 && (ye(e, Pe), Dt(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & ur) !== 0 || (n.f & zt) !== 0;
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
      var s = n === r ? null : /* @__PURE__ */ sn(n);
      t.append(n), n = s;
    }
}
let js = !1, On = !1;
function ui(e) {
  On = e;
}
let ne = null, Pt = !1;
function Ct(e) {
  ne = e;
}
let oe = null;
function en(e) {
  oe = e;
}
let $t = null;
function Aa(e) {
  ne !== null && ($t === null ? $t = [e] : $t.push(e));
}
let nt = null, ft = 0, yt = null;
function Oc(e) {
  yt = e;
}
let Ta = 1, Qn = 0, cr = Qn;
function di(e) {
  cr = e;
}
function Na() {
  return ++Ta;
}
function bs(e) {
  var t = e.f;
  if ((t & Pe) !== 0)
    return !0;
  if (t & De && (e.f &= ~dr), (t & Ft) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var o = n[s];
      if (bs(
        /** @type {Derived} */
        o
      ) && fa(
        /** @type {Derived} */
        o
      ), o.wv > e.wv)
        return !0;
    }
    (t & St) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Me === null && ye(e, Re);
  }
  return !1;
}
function Ra(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !($t !== null && Pr.call($t, e)))
    for (var s = 0; s < r.length; s++) {
      var o = r[s];
      (o.f & De) !== 0 ? Ra(
        /** @type {Derived} */
        o,
        t,
        !1
      ) : t === o && (n ? ye(o, Pe) : (o.f & Re) !== 0 && ye(o, Ft), Dt(
        /** @type {Effect} */
        o
      ));
    }
}
function ja(e) {
  var _;
  var t = nt, n = ft, r = yt, s = ne, o = $t, i = st, a = Pt, c = cr, u = e.f;
  nt = /** @type {null | Value[]} */
  null, ft = 0, yt = null, ne = (u & (zt | qn)) === 0 ? e : null, $t = null, Or(e.ctx), Pt = !1, cr = ++Qn, e.ac !== null && (Vr(() => {
    e.ac.abort(Jn);
  }), e.ac = null);
  try {
    e.f |= ko;
    var f = (
      /** @type {Function} */
      e.fn
    ), d = f();
    e.f |= hr;
    var v = e.deps, h = Y == null ? void 0 : Y.is_fork;
    if (nt !== null) {
      var b;
      if (h || as(e, ft), v !== null && ft > 0)
        for (v.length = ft + nt.length, b = 0; b < nt.length; b++)
          v[ft + b] = nt[b];
      else
        e.deps = v = nt;
      if (Xo() && (e.f & St) !== 0)
        for (b = ft; b < v.length; b++)
          ((_ = v[b]).reactions ?? (_.reactions = [])).push(e);
    } else !h && v !== null && ft < v.length && (as(e, ft), v.length = ft);
    if (Ji() && yt !== null && !Pt && v !== null && (e.f & (De | Ft | Pe)) === 0)
      for (b = 0; b < /** @type {Source[]} */
      yt.length; b++)
        Ra(
          yt[b],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (Qn++, s.deps !== null)
        for (let p = 0; p < n; p += 1)
          s.deps[p].rv = Qn;
      if (t !== null)
        for (const p of t)
          p.rv = Qn;
      yt !== null && (r === null ? r = yt : r.push(.../** @type {Source[]} */
      yt));
    }
    return (e.f & Dn) !== 0 && (e.f ^= Dn), d;
  } catch (p) {
    return Qi(p);
  } finally {
    e.f ^= ko, nt = t, ft = n, yt = r, ne = s, $t = o, Or(i), Pt = a, cr = c;
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
  if (n === null && (t.f & De) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (nt === null || !Pr.call(nt, t))) {
    var o = (
      /** @type {Derived} */
      t
    );
    (o.f & St) !== 0 && (o.f ^= St, o.f &= ~dr), Ho(o), Ac(o), as(o, 0);
  }
}
function as(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      qc(e, n[r]);
}
function zr(e) {
  var t = e.f;
  if ((t & yn) === 0) {
    ye(e, Re);
    var n = oe, r = js;
    oe = e, js = !0;
    try {
      (t & (rn | Ui)) !== 0 ? Dc(e) : Go(e), ka(e);
      var s = ja(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Ta;
      var o;
      xo && hc && (e.f & Pe) !== 0 && e.deps;
    } finally {
      js = r, oe = n;
    }
  }
}
async function Fc() {
  await Promise.resolve(), U();
}
function l(e) {
  var t = e.f, n = (t & De) !== 0;
  if (ne !== null && !Pt) {
    var r = oe !== null && (oe.f & yn) !== 0;
    if (!r && ($t === null || !Pr.call($t, e))) {
      var s = ne.deps;
      if ((ne.f & ko) !== 0)
        e.rv < Qn && (e.rv = Qn, nt === null && s !== null && s[ft] === e ? ft++ : nt === null ? nt = [e] : nt.push(e));
      else {
        (ne.deps ?? (ne.deps = [])).push(e);
        var o = e.reactions;
        o === null ? e.reactions = [ne] : Pr.call(o, ne) || o.push(ne);
      }
    }
  }
  if (On && Pn.has(e))
    return Pn.get(e);
  if (n) {
    var i = (
      /** @type {Derived} */
      e
    );
    if (On) {
      var a = i.v;
      return ((i.f & Re) === 0 && i.reactions !== null || Ma(i)) && (a = Vo(i)), Pn.set(i, a), a;
    }
    var c = (i.f & St) === 0 && !Pt && ne !== null && (js || (ne.f & St) !== 0), u = (i.f & hr) === 0;
    bs(i) && (c && (i.f |= St), fa(i)), c && !u && (ua(i), Ia(i));
  }
  if (Me != null && Me.has(e))
    return Me.get(e);
  if ((e.f & Dn) !== 0)
    throw e.v;
  return e.v;
}
function Ia(e) {
  if (e.f |= St, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & De) !== 0 && (t.f & St) === 0 && (ua(
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
    if (Pn.has(t) || (t.f & De) !== 0 && Ma(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function mr(e) {
  var t = Pt;
  try {
    return Pt = !0, e();
  } finally {
    Pt = t;
  }
}
const zc = ["touchstart", "touchmove"];
function Bc(e) {
  return zc.includes(e);
}
const Is = Symbol("events"), La = /* @__PURE__ */ new Set(), jo = /* @__PURE__ */ new Set();
function Uc(e, t, n, r = {}) {
  function s(o) {
    if (r.capture || Io.call(t, o), !o.cancelBubble)
      return Vr(() => n == null ? void 0 : n.call(this, o));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ot(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Da(e, t, n, r, s) {
  var o = { capture: r, passive: s }, i = Uc(e, t, n, o);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Ko(() => {
    t.removeEventListener(e, i, o);
  });
}
function K(e, t, n) {
  (t[Is] ?? (t[Is] = {}))[e] = n;
}
function _s(e) {
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
  var i = 0, a = vi === e && e.__root;
  if (a) {
    var c = s.indexOf(a);
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
    Os(e, "currentTarget", {
      configurable: !0,
      get() {
        return o || n;
      }
    });
    var f = ne, d = oe;
    Ct(null), en(null);
    try {
      for (var v, h = []; o !== null; ) {
        var b = o.assignedSlot || o.parentNode || /** @type {any} */
        o.host || null;
        try {
          var _ = (m = o[Is]) == null ? void 0 : m[r];
          _ != null && (!/** @type {any} */
          o.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === o) && _.call(o, e);
        } catch (T) {
          v ? h.push(T) : v = T;
        }
        if (e.cancelBubble || b === t || b === null)
          break;
        o = b;
      }
      if (v) {
        for (let T of h)
          queueMicrotask(() => {
            throw T;
          });
        throw v;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Ct(f), en(d);
    }
  }
}
var Li, Di;
const _o = (Di = (Li = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Li.trustedTypes) == null ? void 0 : /* @__PURE__ */ Di.createPolicy(
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
function Pa(e, t = !1) {
  var n = Yo("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? Hc(e) : e, n.content;
}
function qt(e, t) {
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
      return qt(Q, null), Q;
    s === void 0 && (s = Pa(o ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ ht(s)));
    var i = (
      /** @type {TemplateNode} */
      r || ha ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ht(i)
      ), c = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      qt(a, c);
    } else
      qt(i, i);
    return i;
  };
}
// @__NO_SIDE_EFFECTS__
function Vc(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & qi) !== 0, o = `<${n}>${r ? e : "<!>" + e}</${n}>`, i;
  return () => {
    if (te)
      return qt(Q, null), Q;
    if (!i) {
      var a = (
        /** @type {DocumentFragment} */
        Pa(o, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ ht(a)
      );
      if (s)
        for (i = document.createDocumentFragment(); /* @__PURE__ */ ht(c); )
          i.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ ht(c)
          );
      else
        i = /** @type {Element} */
        /* @__PURE__ */ ht(c);
    }
    var u = (
      /** @type {TemplateNode} */
      i.cloneNode(!0)
    );
    if (s) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ht(u)
      ), d = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      qt(f, d);
    } else
      qt(u, u);
    return u;
  };
}
// @__NO_SIDE_EFFECTS__
function br(e, t) {
  return /* @__PURE__ */ Vc(e, t, "svg");
}
function pi(e = "") {
  if (!te) {
    var t = rt(e + "");
    return qt(t, t), t;
  }
  var n = Q;
  return n.nodeType !== gs ? (n.before(n = rt()), Ke(n)) : no(
    /** @type {Text} */
    n
  ), qt(n, n), n;
}
function Cr() {
  if (te)
    return qt(Q, null), Q;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = rt();
  return e.append(t, n), qt(t, n), e;
}
function $(e, t) {
  if (te) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      oe
    );
    ((n.f & hr) === 0 || n.nodes.end === null) && (n.nodes.end = Q), ms();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let Mo = !0;
function W(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Oa(e, t) {
  return qa(e, t);
}
function Wc(e, t) {
  Ro(), t.intro = t.intro ?? !1;
  const n = t.target, r = te, s = Q;
  try {
    for (var o = /* @__PURE__ */ ht(n); o && (o.nodeType !== Hr || /** @type {Comment} */
    o.data !== Fo); )
      o = /* @__PURE__ */ sn(o);
    if (!o)
      throw Dr;
    _n(!0), Ke(
      /** @type {Comment} */
      o
    );
    const i = qa(e, { ...t, anchor: o });
    return _n(!1), /**  @type {Exports} */
    i;
  } catch (i) {
    if (i instanceof Error && i.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw i;
    return i !== Dr && console.warn("Failed to hydrate: ", i), t.recover === !1 && ic(), Ro(), Wo(n), _n(!1), Oa(e, t);
  } finally {
    _n(r), Ke(s);
  }
}
const Cs = /* @__PURE__ */ new Map();
function qa(e, { target: t, anchor: n, props: r = {}, events: s, context: o, intro: i = !0 }) {
  Ro();
  var a = /* @__PURE__ */ new Set(), c = (d) => {
    for (var v = 0; v < d.length; v++) {
      var h = d[v];
      if (!a.has(h)) {
        a.add(h);
        var b = Bc(h);
        for (const m of [t, document]) {
          var _ = Cs.get(m);
          _ === void 0 && (_ = /* @__PURE__ */ new Map(), Cs.set(m, _));
          var p = _.get(h);
          p === void 0 ? (m.addEventListener(h, Io, { passive: b }), _.set(h, 1)) : _.set(h, p + 1);
        }
      }
    }
  };
  c(Js(La)), jo.add(c);
  var u = void 0, f = Mc(() => {
    var d = n ?? t.appendChild(rt());
    return wc(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (v) => {
        xn({});
        var h = (
          /** @type {ComponentContext} */
          st
        );
        if (o && (h.c = o), s && (r.$$events = s), te && qt(
          /** @type {TemplateNode} */
          v,
          null
        ), Mo = i, u = e(v, r) || {}, Mo = !0, te && (oe.nodes.end = Q, Q === null || Q.nodeType !== Hr || /** @type {Comment} */
        Q.data !== zo))
          throw Qs(), Dr;
        kn();
      }
    ), () => {
      var _;
      for (var v of a)
        for (const p of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Cs.get(p)
          ), b = (
            /** @type {number} */
            h.get(v)
          );
          --b == 0 ? (p.removeEventListener(v, Io), h.delete(v), h.size === 0 && Cs.delete(p)) : h.set(v, b);
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
var Lt, Jt, dt, or, ps, hs, Ks;
class Fa {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    _e(this, "anchor");
    /** @type {Map<Batch, Key>} */
    X(this, Lt, /* @__PURE__ */ new Map());
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
    X(this, Jt, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    X(this, dt, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    X(this, or, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    X(this, ps, !0);
    X(this, hs, () => {
      var t = (
        /** @type {Batch} */
        Y
      );
      if (g(this, Lt).has(t)) {
        var n = (
          /** @type {Key} */
          g(this, Lt).get(t)
        ), r = g(this, Jt).get(n);
        if (r)
          Jo(r), g(this, or).delete(n);
        else {
          var s = g(this, dt).get(n);
          s && (g(this, Jt).set(n, s.effect), g(this, dt).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [o, i] of g(this, Lt)) {
          if (g(this, Lt).delete(o), o === t)
            break;
          const a = g(this, dt).get(i);
          a && (Ge(a.effect), g(this, dt).delete(i));
        }
        for (const [o, i] of g(this, Jt)) {
          if (o === n || g(this, or).has(o)) continue;
          const a = () => {
            if (Array.from(g(this, Lt).values()).includes(o)) {
              var u = document.createDocumentFragment();
              Ca(i, u), u.append(rt()), g(this, dt).set(o, { effect: i, fragment: u });
            } else
              Ge(i);
            g(this, or).delete(o), g(this, Jt).delete(o);
          };
          g(this, ps) || !r ? (g(this, or).add(o), lr(i, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    X(this, Ks, (t) => {
      g(this, Lt).delete(t);
      const n = Array.from(g(this, Lt).values());
      for (const [r, s] of g(this, dt))
        n.includes(r) || (Ge(s.effect), g(this, dt).delete(r));
    });
    this.anchor = t, H(this, ps, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      Y
    ), s = ba();
    if (n && !g(this, Jt).has(t) && !g(this, dt).has(t))
      if (s) {
        var o = document.createDocumentFragment(), i = rt();
        o.append(i), g(this, dt).set(t, {
          effect: kt(() => n(i)),
          fragment: o
        });
      } else
        g(this, Jt).set(
          t,
          kt(() => n(this.anchor))
        );
    if (g(this, Lt).set(r, t), s) {
      for (const [a, c] of g(this, Jt))
        a === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [a, c] of g(this, dt))
        a === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(g(this, hs)), r.ondiscard(g(this, Ks));
    } else
      te && (this.anchor = Q), g(this, hs).call(this);
  }
}
Lt = new WeakMap(), Jt = new WeakMap(), dt = new WeakMap(), or = new WeakMap(), ps = new WeakMap(), hs = new WeakMap(), Ks = new WeakMap();
function Zo(e) {
  st === null && Yi(), Rs(() => {
    const t = mr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function za(e) {
  st === null && Yi(), Zo(() => () => mr(e));
}
function B(e, t, n = !1) {
  te && ms();
  var r = new Fa(e), s = n ? ur : 0;
  function o(i, a) {
    if (te) {
      const f = Xi(e);
      var c;
      if (f === Fo ? c = 0 : f === Gs ? c = !1 : c = parseInt(f.substring(1)), i !== c) {
        var u = Fs();
        Ke(u), r.anchor = u, _n(!1), r.ensure(i, a), _n(!0);
        return;
      }
    }
    r.ensure(i, a);
  }
  oo(() => {
    var i = !1;
    t((a, c = 0) => {
      i = !0, o(c, a);
    }), i || o(!1, null);
  }, s);
}
const Xc = Symbol("NaN");
function Kc(e, t, n) {
  te && ms();
  var r = new Fa(e);
  oo(() => {
    var s = t();
    s !== s && (s = /** @type {any} */
    Xc), r.ensure(s, n);
  });
}
function pt(e, t) {
  return t;
}
function Gc(e, t, n) {
  for (var r = [], s = t.length, o, i = t.length, a = 0; a < s; a++) {
    let d = t[a];
    lr(
      d,
      () => {
        if (o) {
          if (o.pending.delete(d), o.done.add(d), o.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Do(Js(o.done)), v.delete(o), v.size === 0 && (e.outrogroups = null);
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
    Do(t, !c);
  } else
    o = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(o);
}
function Do(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    Ge(e[n], t);
}
var hi;
function Ye(e, t, n, r, s, o = null) {
  var i = e, a = /* @__PURE__ */ new Map(), c = (t & Oi) !== 0;
  if (c) {
    var u = (
      /** @type {Element} */
      e
    );
    i = te ? Ke(/* @__PURE__ */ ht(u)) : u.appendChild(rt());
  }
  te && ms();
  var f = null, d = /* @__PURE__ */ ca(() => {
    var m = n();
    return Bo(m) ? m : m == null ? [] : Js(m);
  }), v, h = !0;
  function b() {
    p.fallback = f, Jc(p, v, i, t, r), f !== null && (v.length === 0 ? (f.f & bn) === 0 ? Jo(f) : (f.f ^= bn, es(f, null, i)) : lr(f, () => {
      f = null;
    }));
  }
  var _ = oo(() => {
    v = /** @type {V[]} */
    l(d);
    var m = v.length;
    let T = !1;
    if (te) {
      var k = Xi(i) === Gs;
      k !== (m === 0) && (i = Fs(), Ke(i), _n(!1), T = !0);
    }
    for (var M = /* @__PURE__ */ new Set(), L = (
      /** @type {Batch} */
      Y
    ), F = ba(), G = 0; G < m; G += 1) {
      te && Q.nodeType === Hr && /** @type {Comment} */
      Q.data === zo && (i = /** @type {Comment} */
      Q, T = !0, _n(!1));
      var P = v[G], re = r(P, G), le = h ? null : a.get(re);
      le ? (le.v && Fr(le.v, P), le.i && Fr(le.i, G), F && L.unskip_effect(le.e)) : (le = Zc(
        a,
        h ? i : hi ?? (hi = rt()),
        P,
        re,
        G,
        s,
        t,
        n
      ), h || (le.e.f |= bn), a.set(re, le)), M.add(re);
    }
    if (m === 0 && o && !f && (h ? f = kt(() => o(i)) : (f = kt(() => o(hi ?? (hi = rt()))), f.f |= bn)), m > M.size && tc(), te && m > 0 && Ke(Fs()), !h)
      if (F) {
        for (const [me, ke] of a)
          M.has(me) || L.skip_effect(ke.e);
        L.oncommit(b), L.ondiscard(() => {
        });
      } else
        b();
    T && _n(!0), l(d);
  }), p = { effect: _, items: a, outrogroups: null, fallback: f };
  h = !1, te && (i = Q);
}
function Jr(e) {
  for (; e !== null && (e.f & zt) === 0; )
    e = e.next;
  return e;
}
function Jc(e, t, n, r, s) {
  var le, me, ke, je, Ee, we, Fe, At, ot;
  var o = (r & Pl) !== 0, i = t.length, a = e.items, c = Jr(e.effect.first), u, f = null, d, v = [], h = [], b, _, p, m;
  if (o)
    for (m = 0; m < i; m += 1)
      b = t[m], _ = s(b, m), p = /** @type {EachItem} */
      a.get(_).e, (p.f & bn) === 0 && ((me = (le = p.nodes) == null ? void 0 : le.a) == null || me.measure(), (d ?? (d = /* @__PURE__ */ new Set())).add(p));
  for (m = 0; m < i; m += 1) {
    if (b = t[m], _ = s(b, m), p = /** @type {EachItem} */
    a.get(_).e, e.outrogroups !== null)
      for (const Ce of e.outrogroups)
        Ce.pending.delete(p), Ce.done.delete(p);
    if ((p.f & bn) !== 0)
      if (p.f ^= bn, p === c)
        es(p, null, n);
      else {
        var T = f ? f.next : c;
        p === e.effect.last && (e.effect.last = p.prev), p.prev && (p.prev.next = p.next), p.next && (p.next.prev = p.prev), Mn(e, f, p), Mn(e, p, T), es(p, T, n), f = p, v = [], h = [], c = Jr(f.next);
        continue;
      }
    if ((p.f & gt) !== 0 && (Jo(p), o && ((je = (ke = p.nodes) == null ? void 0 : ke.a) == null || je.unfix(), (d ?? (d = /* @__PURE__ */ new Set())).delete(p))), p !== c) {
      if (u !== void 0 && u.has(p)) {
        if (v.length < h.length) {
          var k = h[0], M;
          f = k.prev;
          var L = v[0], F = v[v.length - 1];
          for (M = 0; M < v.length; M += 1)
            es(v[M], k, n);
          for (M = 0; M < h.length; M += 1)
            u.delete(h[M]);
          Mn(e, L.prev, F.next), Mn(e, f, L), Mn(e, F, k), c = k, f = F, m -= 1, v = [], h = [];
        } else
          u.delete(p), es(p, c, n), Mn(e, p.prev, p.next), Mn(e, p, f === null ? e.effect.first : f.next), Mn(e, f, p), f = p;
        continue;
      }
      for (v = [], h = []; c !== null && c !== p; )
        (u ?? (u = /* @__PURE__ */ new Set())).add(c), h.push(c), c = Jr(c.next);
      if (c === null)
        continue;
    }
    (p.f & bn) === 0 && v.push(p), f = p, c = Jr(p.next);
  }
  if (e.outrogroups !== null) {
    for (const Ce of e.outrogroups)
      Ce.pending.size === 0 && (Do(Js(Ce.done)), (Ee = e.outrogroups) == null || Ee.delete(Ce));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || u !== void 0) {
    var G = [];
    if (u !== void 0)
      for (p of u)
        (p.f & gt) === 0 && G.push(p);
    for (; c !== null; )
      (c.f & gt) === 0 && c !== e.fallback && G.push(c), c = Jr(c.next);
    var P = G.length;
    if (P > 0) {
      var re = (r & Oi) !== 0 && i === 0 ? n : null;
      if (o) {
        for (m = 0; m < P; m += 1)
          (Fe = (we = G[m].nodes) == null ? void 0 : we.a) == null || Fe.measure();
        for (m = 0; m < P; m += 1)
          (ot = (At = G[m].nodes) == null ? void 0 : At.a) == null || ot.fix();
      }
      Gc(e, G, re);
    }
  }
  o && Ot(() => {
    var Ce, I;
    if (d !== void 0)
      for (p of d)
        (I = (Ce = p.nodes) == null ? void 0 : Ce.a) == null || I.apply();
  });
}
function Zc(e, t, n, r, s, o, i, a) {
  var c = (i & Ll) !== 0 ? (i & Ol) === 0 ? /* @__PURE__ */ va(n, !1, !1) : vr(n) : null, u = (i & Dl) !== 0 ? vr(s) : null;
  return {
    v: c,
    i: u,
    e: kt(() => (o(t, c ?? n, u ?? s, a), () => {
      e.delete(r);
    }))
  };
}
function es(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, o = t && (t.f & bn) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ sn(r)
      );
      if (o.before(r), r === s)
        return;
      r = i;
    }
}
function Mn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const Qc = () => performance.now(), mn = {
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
  const e = mn.now();
  mn.tasks.forEach((t) => {
    t.c(e) || (mn.tasks.delete(t), t.f());
  }), mn.tasks.size !== 0 && mn.tick(Ba);
}
function ef(e) {
  let t;
  return mn.tasks.size === 0 && mn.tick(Ba), {
    promise: new Promise((n) => {
      mn.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      mn.tasks.delete(t);
    }
  };
}
function Bs(e, t) {
  Vr(() => {
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
function Us(e, t, n, r) {
  var p;
  var s = (e & Ul) !== 0, o = "both", i, a = t.inert, c = t.style.overflow, u, f;
  function d() {
    return Vr(() => i ?? (i = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
    {}, {
      direction: o
    })));
  }
  var v = {
    is_global: s,
    in() {
      t.inert = a, u = Po(t, d(), f, 1, () => {
        Bs(t, "introend"), u == null || u.abort(), u = i = void 0, t.style.overflow = c;
      });
    },
    out(m) {
      t.inert = !0, f = Po(t, d(), u, 0, () => {
        Bs(t, "outroend"), m == null || m();
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
      ); _ && (_.f & ur) !== 0; )
        for (; (_ = _.parent) && (_.f & rn) === 0; )
          ;
      b = !_ || (_.f & hr) !== 0;
    }
    b && ro(() => {
      mr(() => v.in());
    });
  }
}
function Po(e, t, n, r, s) {
  var o = r === 1;
  if (Kl(t)) {
    var i, a = !1;
    return Ot(() => {
      if (!a) {
        var p = t({ direction: o ? "in" : "out" });
        i = Po(e, p, n, r, s);
      }
    }), {
      abort: () => {
        a = !0, i == null || i.abort();
      },
      deactivate: () => i.deactivate(),
      reset: () => i.reset(),
      t: () => i.t()
    };
  }
  if (n == null || n.deactivate(), !(t != null && t.duration) && !(t != null && t.delay))
    return Bs(e, o ? "introstart" : "outrostart"), s(), {
      abort: $r,
      deactivate: $r,
      reset: $r,
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
    _.cancel(), Bs(e, o ? "introstart" : "outrostart");
    var p = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var m = r - p, T = (
      /** @type {number} */
      t.duration * Math.abs(m)
    ), k = [];
    if (T > 0) {
      var M = !1;
      if (u)
        for (var L = Math.ceil(T / 16.666666666666668), F = 0; F <= L; F += 1) {
          var G = p + m * d(F / L), P = gi(u(G, 1 - G));
          k.push(P), M || (M = P.overflow === "hidden");
        }
      M && (e.style.overflow = "hidden"), b = () => {
        var re = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          _.currentTime
        );
        return p + m * d(re / T);
      }, f && ef(() => {
        if (_.playState !== "running") return !1;
        var re = b();
        return f(re, 1 - re), !0;
      });
    }
    _ = e.animate(k, { duration: T, fill: "forwards" }), _.onfinish = () => {
      b = () => r, f == null || f(r, 1 - r), s();
    };
  }, {
    abort: () => {
      _ && (_.cancel(), _.effect = null, _.onfinish = $r);
    },
    deactivate: () => {
      s = $r;
    },
    reset: () => {
      r === 0 && (f == null || f(1, 0));
    },
    t: () => b()
  };
}
function Fn(e, t) {
  ro(() => {
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
          var a = i + o;
          (i === 0 || mi.includes(r[i - 1])) && (a === r.length || mi.includes(r[a])) ? r = (i === 0 ? "" : r.substring(0, i)) + r.substring(a + 1) : i = a;
        }
  }
  return r === "" ? null : r;
}
function sf(e, t) {
  return e == null ? null : String(e);
}
function Xe(e, t, n, r, s, o) {
  var i = e.__className;
  if (te || i !== n || i === void 0) {
    var a = rf(n, r, o);
    (!te || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = n;
  } else if (o && s !== o)
    for (var c in o) {
      var u = !!o[c];
      (s == null || u !== !!s[c]) && e.classList.toggle(c, u);
    }
  return o;
}
function fr(e, t, n, r) {
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
      r.selected = t.includes(rs(r));
    return;
  }
  for (r of e.options) {
    var s = rs(r);
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
  }), Ko(() => {
    t.disconnect();
  });
}
function bi(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  wa(e, "change", (o) => {
    var i = o ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(i), rs);
    else {
      var c = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = c && rs(c);
    }
    n(a), Y !== null && r.add(Y);
  }), ro(() => {
    var o = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        zs ?? Y
      );
      if (r.has(i))
        return;
    }
    if (Ua(e, o, s), s && o === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (o = rs(a), n(o));
    }
    e.__value = o, s = !1;
  }), of(e);
}
function rs(e) {
  return "__value" in e ? e.__value : e.value;
}
const af = Symbol("is custom element"), lf = Symbol("is html"), cf = Ql ? "link" : "LINK";
function Ha(e) {
  if (te) {
    var t = !1, n = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var r = e.value;
          ve(e, "value", null), e.value = r;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          ve(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = n, Ot(n), ya();
  }
}
function ve(e, t, n, r) {
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
function Hs(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  wa(e, "input", async (s) => {
    var o = s ? e.defaultValue : e.value;
    if (o = yo(e) ? wo(o) : o, n(o), Y !== null && r.add(Y), await Fc(), o !== (o = t())) {
      var i = e.selectionStart, a = e.selectionEnd, c = e.value.length;
      if (e.value = o ?? "", a !== null) {
        var u = e.value.length;
        i === a && a === c && u > c ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = i, e.selectionEnd = Math.min(a, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (te && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  mr(t) == null && e.value) && (n(yo(e) ? wo(e.value) : e.value), Y !== null && r.add(Y)), so(() => {
    var s = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        zs ?? Y
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
  return e === t || (e == null ? void 0 : e[ar]) === t;
}
function ss(e = {}, t, n, r) {
  return ro(() => {
    var s, o;
    return so(() => {
      s = o, o = [], mr(() => {
        e !== n(...o) && (t(e, ...o), s && yi(n(...s), e) && t(null, ...s));
      });
    }), () => {
      Ot(() => {
        o && yi(n(...o), e) && t(null, ...o);
      });
    };
  }), e;
}
let As = !1;
function df(e) {
  var t = As;
  try {
    return As = !1, [e(), As];
  } finally {
    As = t;
  }
}
function V(e, t, n, r) {
  var T;
  var s = (n & zl) !== 0, o = (n & Bl) !== 0, i = (
    /** @type {V} */
    r
  ), a = !0, c = () => (a && (a = !1, i = o ? mr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), i), u;
  if (s) {
    var f = ar in e || Wi in e;
    u = ((T = ir(e, t)) == null ? void 0 : T.set) ?? (f && t in e ? (k) => e[t] = k : void 0);
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
    return k === void 0 ? c() : (a = !0, k);
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
  var _ = !1, p = ((n & ql) !== 0 ? to : ca)(() => (_ = !1, h()));
  s && l(p);
  var m = (
    /** @type {Effect} */
    oe
  );
  return (
    /** @type {() => V} */
    (function(k, M) {
      if (arguments.length > 0) {
        const L = M ? l(p) : s ? Le(k) : k;
        return y(p, L), _ = !0, i !== void 0 && (i = L), k;
      }
      return On && _ || (m.f & yn) !== 0 ? p.v : l(p);
    })
  );
}
function vf(e) {
  return new pf(e);
}
var gn, xt;
class pf {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    X(this, gn);
    /** @type {Record<string, any>} */
    X(this, xt);
    var o;
    var n = /* @__PURE__ */ new Map(), r = (i, a) => {
      var c = /* @__PURE__ */ va(a, !1, !1);
      return n.set(i, c), c;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(i, a) {
          return l(n.get(a) ?? r(a, Reflect.get(i, a)));
        },
        has(i, a) {
          return a === Wi ? !0 : (l(n.get(a) ?? r(a, Reflect.get(i, a))), Reflect.has(i, a));
        },
        set(i, a, c) {
          return y(n.get(a) ?? r(a, c), c), Reflect.set(i, a, c);
        }
      }
    );
    H(this, xt, (t.hydrate ? Wc : Oa)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((o = t == null ? void 0 : t.props) != null && o.$$host) || t.sync === !1) && U(), H(this, gn, s.$$events);
    for (const i of Object.keys(g(this, xt)))
      i === "$set" || i === "$destroy" || i === "$on" || Os(this, i, {
        get() {
          return g(this, xt)[i];
        },
        /** @param {any} value */
        set(a) {
          g(this, xt)[i] = a;
        },
        enumerable: !0
      });
    g(this, xt).$set = /** @param {Record<string, any>} next */
    (i) => {
      Object.assign(s, i);
    }, g(this, xt).$destroy = () => {
      Yc(g(this, xt));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    g(this, xt).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    g(this, gn)[t] = g(this, gn)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return g(this, gn)[t].push(r), () => {
      g(this, gn)[t] = g(this, gn)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    g(this, xt).$destroy();
  }
}
gn = new WeakMap(), xt = new WeakMap();
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
    _e(this, "$$ctor");
    /** Slots */
    _e(this, "$$s");
    /** @type {any} The Svelte component instance */
    _e(this, "$$c");
    /** Whether or not the custom element is connected */
    _e(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    _e(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    _e(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    _e(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    _e(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    _e(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    _e(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    _e(this, "$$shadowRoot", null);
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
        o in this.$$d || (this.$$d[o] = Ms(o, s.value, this.$$p_d, "toProp"));
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
        so(() => {
          var s;
          this.$$r = !0;
          for (const o of Ps(this.$$c)) {
            if (!((s = this.$$p_d[o]) != null && s.reflect)) continue;
            this.$$d[o] = this.$$c[o];
            const i = Ms(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Ms(t, r, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return Ps(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function Ms(e, t, n, r) {
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
function zn(e, t, n, r, s, o) {
  let i = class extends Va {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Ps(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return Ps(t).forEach((a) => {
    Os(i.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(c) {
        var d;
        c = Ms(a, c, t), this.$$d[a] = c;
        var u = this.$$c;
        if (u) {
          var f = (d = ir(u, a)) == null ? void 0 : d.get;
          f ? u[a] = c : u.$set({ [a]: c });
        }
      }
    });
  }), r.forEach((a) => {
    Os(i.prototype, a, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[a];
      }
    });
  }), e.element = /** @type {any} */
  i, i;
}
const Zr = {
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
const Ls = [];
let Vs = !1;
const Et = {
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
function Er(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = bf(t.map(_f).join(" ")), o = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(o, yf()), o;
}
function Sr(e) {
  for (Ls.push(e); Ls.length > Wa; )
    Ls.shift();
}
function wf(e) {
  Vs || (Vs = !0, e && (Wa = e), console.log = (...t) => {
    Et.log(...t), Sr(Er("log", t, !1));
  }, console.error = (...t) => {
    Et.error(...t), Sr(Er("error", t, !0));
  }, console.warn = (...t) => {
    Et.warn(...t), Sr(Er("warn", t, !0));
  }, console.info = (...t) => {
    Et.info(...t), Sr(Er("info", t, !1));
  }, console.debug = (...t) => {
    Et.debug(...t), Sr(Er("debug", t, !1));
  }, console.trace = (...t) => {
    Et.trace(...t), Sr(Er("trace", t, !0));
  });
}
function xf() {
  Vs && (Vs = !1, console.log = Et.log, console.error = Et.error, console.warn = Et.warn, console.info = Et.info, console.debug = Et.debug, console.trace = Et.trace);
}
function kf() {
  return [...Ls];
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
let pr = !1, Xa = "", Qt = null, Ds = null, Qo = null;
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
function Ka(e) {
  if (!pr || !Qt) return;
  const t = e.target;
  if (t === Qt || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  Qt.style.top = `${n.top}px`, Qt.style.left = `${n.left}px`, Qt.style.width = `${n.width}px`, Qt.style.height = `${n.height}px`;
}
function Ga(e) {
  var o;
  if (!pr) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = Qo;
  Qa();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((o = t.textContent) == null ? void 0 : o.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((i, a) => (i[a.name] = a.value, i), {}),
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
  pr || (pr = !0, Qo = e, Xa = document.body.style.cursor, document.body.style.cursor = "crosshair", Qt = $f(), Ds = Cf(), document.addEventListener("mousemove", Ka, !0), document.addEventListener("click", Ga, !0), document.addEventListener("keydown", Ja, !0));
}
function Qa() {
  pr && (pr = !1, Qo = null, document.body.style.cursor = Xa, Qt && (Qt.remove(), Qt = null), Ds && (Ds.remove(), Ds = null), document.removeEventListener("mousemove", Ka, !0), document.removeEventListener("click", Ga, !0), document.removeEventListener("keydown", Ja, !0));
}
function Af() {
  return pr;
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
function Qr() {
  return Nf++;
}
function Rf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const i = Math.atan2(r.y - n.y, r.x - n.x), a = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(i - c), r.y - a * Math.sin(i - c)), e.moveTo(r.x, r.y), e.lineTo(r.x - a * Math.cos(i + c), r.y - a * Math.sin(i + c)), e.stroke();
}
function jf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineJoin = "round";
  const i = Math.min(n.x, r.x), a = Math.min(n.y, r.y), c = Math.abs(r.x - n.x), u = Math.abs(r.y - n.y);
  e.strokeRect(i, a, c, u);
}
function If(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o;
  const i = (n.x + r.x) / 2, a = (n.y + r.y) / 2, c = Math.abs(r.x - n.x) / 2, u = Math.abs(r.y - n.y) / 2;
  c < 1 || u < 1 || (e.beginPath(), e.ellipse(i, a, c, u, 0, 0, Math.PI * 2), e.stroke());
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
function Df(e, t, n, r) {
  return new Promise((s, o) => {
    const i = new Image();
    i.onload = () => {
      const a = document.createElement("canvas");
      a.width = n, a.height = r;
      const c = a.getContext("2d");
      if (!c) {
        o(new Error("Canvas context unavailable"));
        return;
      }
      c.drawImage(i, 0, 0, n, r), nl(c, t), s(a.toDataURL("image/jpeg", 0.85));
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
async function Pf(e) {
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
    const a = await fetch(o, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(i)
    }), c = await a.json();
    return a.ok ? { ok: !0 } : { ok: !1, error: c.error || `HTTP ${a.status}` };
  } catch (o) {
    return { ok: !1, error: o instanceof Error ? o.message : "Failed to respond" };
  }
}
const sl = "jat-feedback-queue", qf = 50, Ff = 3e4;
let os = null;
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
  os || (Si(), os = setInterval(Si, Ff));
}
function Bf() {
  os && (clearInterval(os), os = null);
}
var Uf = /* @__PURE__ */ br('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Hf = /* @__PURE__ */ br('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Vf = /* @__PURE__ */ j("<button><!></button>");
const Wf = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function al(e, t) {
  xn(t, !0), Fn(e, Wf);
  let n = V(t, "onmousedown", 7), r = V(t, "open", 7, !1);
  var s = {
    get onmousedown() {
      return n();
    },
    set onmousedown(f) {
      n(f), U();
    },
    get open() {
      return r();
    },
    set open(f = !1) {
      r(f), U();
    }
  }, o = Vf();
  let i;
  var a = x(o);
  {
    var c = (f) => {
      var d = Uf();
      $(f, d);
    }, u = (f) => {
      var d = Hf();
      $(f, d);
    };
    B(a, (f) => {
      r() ? f(c) : f(u, !1);
    });
  }
  return w(o), z(() => {
    i = Xe(o, 1, "jat-fb-btn svelte-joatup", null, i, { open: r() }), ve(o, "aria-label", r() ? "Close feedback" : "Send feedback"), ve(o, "title", r() ? "Close feedback" : "Send feedback");
  }), K("mousedown", o, function(...f) {
    var d;
    (d = n()) == null || d.apply(this, f);
  }), $(e, o), kn(s);
}
_s(["mousedown"]);
zn(al, { onmousedown: {}, open: {} }, [], [], { mode: "open" });
const ll = "[modern-screenshot]", Br = typeof window < "u", Yf = Br && "Worker" in window;
var Pi;
const ei = Br ? (Pi = window.navigator) == null ? void 0 : Pi.userAgent : "", cl = ei.includes("Chrome"), Ws = ei.includes("AppleWebKit") && !cl, ti = ei.includes("Firefox"), Xf = (e) => e && "__CONTEXT__" in e, Kf = (e) => e.constructor.name === "CSSFontFaceRule", Gf = (e) => e.constructor.name === "CSSImportRule", Jf = (e) => e.constructor.name === "CSSLayerBlockRule", tn = (e) => e.nodeType === 1, ys = (e) => typeof e.className == "object", fl = (e) => e.tagName === "image", Zf = (e) => e.tagName === "use", ls = (e) => tn(e) && typeof e.style < "u" && !ys(e), Qf = (e) => e.nodeType === 8, eu = (e) => e.nodeType === 3, Ur = (e) => e.tagName === "IMG", io = (e) => e.tagName === "VIDEO", tu = (e) => e.tagName === "CANVAS", nu = (e) => e.tagName === "TEXTAREA", ru = (e) => e.tagName === "INPUT", su = (e) => e.tagName === "STYLE", ou = (e) => e.tagName === "SCRIPT", iu = (e) => e.tagName === "SELECT", au = (e) => e.tagName === "SLOT", lu = (e) => e.tagName === "IFRAME", cu = (...e) => console.warn(ll, ...e);
function fu(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Oo = (e) => e.startsWith("data:");
function ul(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Br && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Br)
    return e;
  const n = ao().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function ao(e) {
  return (e && tn(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const lo = "http://www.w3.org/2000/svg";
function uu(e, t, n) {
  const r = ao(n).createElementNS(lo, "svg");
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
function Ar(e, t) {
  const n = ao(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function cs(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: o, onWarn: i } = t ?? {}, a = typeof e == "string" ? Ar(e, ao(s)) : e;
    let c = null, u = null;
    function f() {
      n(a), c && clearTimeout(c), u == null || u();
    }
    if (r && (c = setTimeout(f, r)), io(a)) {
      const d = a.currentSrc || a.src;
      if (!d)
        return a.poster ? cs(a.poster, t).then(n) : f();
      if (a.readyState >= 2)
        return f();
      const v = f, h = (b) => {
        i == null || i(
          "Failed video load",
          d,
          b
        ), o == null || o(b), f();
      };
      u = () => {
        a.removeEventListener("loadeddata", v), a.removeEventListener("error", h);
      }, a.addEventListener("loadeddata", v, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    } else {
      const d = fl(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!d)
        return f();
      const v = async () => {
        if (Ur(a) && "decode" in a)
          try {
            await a.decode();
          } catch (b) {
            i == null || i(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || d,
              b
            );
          }
        f();
      }, h = (b) => {
        i == null || i(
          "Failed image load",
          a.dataset.originalSrc || d,
          b
        ), f();
      };
      if (Ur(a) && a.complete)
        return v();
      u = () => {
        a.removeEventListener("load", v), a.removeEventListener("error", h);
      }, a.addEventListener("load", v, { once: !0 }), a.addEventListener("error", h, { once: !0 });
    }
  });
}
async function hu(e, t) {
  ls(e) && (Ur(e) || io(e) ? await cs(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => cs(r, t)))
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
  return Xf(e) ? e : bu(e, { ...t, autoDestruct: !0 });
}
async function bu(e, t) {
  var h, b;
  const { scale: n = 1, workerUrl: r, workerNumber: s = 1 } = t || {}, o = !!(t != null && t.debug), i = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (Br ? window.document : void 0), c = ((h = e.ownerDocument) == null ? void 0 : h.defaultView) ?? (Br ? window : void 0), u = /* @__PURE__ */ new Map(), f = {
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
    ownerDocument: a,
    ownerWindow: c,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: hl(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(lo, "defs"),
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
          var k, M, L, F;
          const { url: m, result: T } = p.data;
          T ? (M = (k = u.get(m)) == null ? void 0 : k.resolve) == null || M.call(k, T) : (F = (L = u.get(m)) == null ? void 0 : L.reject) == null || F.call(L, new Error(`Error receiving message from worker: ${m}`));
        }, _.onmessageerror = (p) => {
          var T, k;
          const { url: m } = p.data;
          (k = (T = u.get(m)) == null ? void 0 : T.reject) == null || k.call(T, new Error(`Error receiving message from worker: ${m}`));
        }, _;
      } catch (_) {
        return f.log.warn("Failed to new Worker", _), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      fu(a) && "image/webp",
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
  if (tn(e) && (!n || !r)) {
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
  const i = await cs(e, { timeout: r, onWarn: t.log.warn }), { canvas: a, context2d: c } = wu(e.ownerDocument, t), u = () => {
    try {
      c == null || c.drawImage(i, 0, 0, a.width, a.height);
    } catch (f) {
      t.log.warn("Failed to drawImage", f);
    }
  };
  if (u(), t.isEnable("fixSvgXmlDecode"))
    for (let f = 0; f < s; f++)
      await new Promise((d) => {
        setTimeout(() => {
          c == null || c.clearRect(0, 0, a.width, a.height), u(), d();
        }, f + o);
      });
  return t.drawImageCount = 0, n.timeEnd("image to canvas"), a;
}
function wu(e, t) {
  const { width: n, height: r, scale: s, backgroundColor: o, maximumCanvasSize: i } = t, a = e.createElement("canvas");
  a.width = Math.floor(n * s), a.height = Math.floor(r * s), a.style.width = `${n}px`, a.style.height = `${r}px`, i && (a.width > i || a.height > i) && (a.width > i && a.height > i ? a.width > a.height ? (a.height *= i / a.width, a.width = i) : (a.width *= i / a.height, a.height = i) : a.width > i ? (a.height *= i / a.width, a.width = i) : (a.width *= i / a.height, a.height = i));
  const c = a.getContext("2d");
  return c && o && (c.fillStyle = o, c.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: c };
}
function gl(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return Ar(o, e.ownerDocument);
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
    return Ar(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await cs(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? Ar(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((i) => {
      n.addEventListener("seeked", i, { once: !0 });
    });
    const o = r.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const i = o.getContext("2d");
      i && i.drawImage(n, 0, 0, o.width, o.height);
    } catch (i) {
      return t.log.warn("Failed to clone video", i), e.poster ? Ar(e.poster, e.ownerDocument) : n;
    }
    return gl(o, t);
  }
  return n;
}
function Su(e, t) {
  return tu(e) ? gl(e, t) : lu(e) ? xu(e, t) : Ur(e) ? ku(e) : io(e) ? Eu(e, t) : e.cloneNode(!1);
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
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), o = ys(e) && s !== "svg", i = o ? Au.map((_) => [_, e.getAttribute(_)]).filter(([, _]) => _ !== null) : [], a = [
    o && "svg",
    s,
    i.map((_, p) => `${_}=${p}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(a))
    return r.get(a);
  const c = $u(n), u = c == null ? void 0 : c.contentWindow;
  if (!u)
    return /* @__PURE__ */ new Map();
  const f = u == null ? void 0 : u.document;
  let d, v;
  o ? (d = f.createElementNS(lo, "svg"), v = d.ownerDocument.createElementNS(d.namespaceURI, s), i.forEach(([_, p]) => {
    v.setAttributeNS(null, _, p);
  }), d.appendChild(v)) : d = v = f.createElement(s), v.textContent = " ", f.body.appendChild(d);
  const h = u.getComputedStyle(v, t), b = /* @__PURE__ */ new Map();
  for (let _ = h.length, p = 0; p < _; p++) {
    const m = h.item(p);
    Cu.includes(m) || b.set(m, h.getPropertyValue(m));
  }
  return f.body.removeChild(d), r.set(a, b), b;
}
function bl(e, t, n) {
  var a;
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
    (a = o.get(s[u])) == null || a.forEach((f, d) => r.set(d, f));
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
  const { ownerWindow: s, includeStyleProperties: o, currentParentNodeStyle: i } = r, a = t.style, c = s.getComputedStyle(e), u = ml(e, null, r);
  i == null || i.forEach((_, p) => {
    u.delete(p);
  });
  const f = bl(c, u, o);
  f.delete("transition-property"), f.delete("all"), f.delete("d"), f.delete("content"), n && (f.delete("margin-top"), f.delete("margin-right"), f.delete("margin-bottom"), f.delete("margin-left"), f.delete("margin-block-start"), f.delete("margin-block-end"), f.delete("margin-inline-start"), f.delete("margin-inline-end"), f.set("box-sizing", ["border-box", ""])), ((d = f.get("background-clip")) == null ? void 0 : d[0]) === "text" && t.classList.add("______background-clip--text"), cl && (f.has("font-kerning") || f.set("font-kerning", ["normal", ""]), (((v = f.get("overflow-x")) == null ? void 0 : v[0]) === "hidden" || ((h = f.get("overflow-y")) == null ? void 0 : h[0]) === "hidden") && ((b = f.get("text-overflow")) == null ? void 0 : b[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && f.set("text-overflow", ["clip", ""]));
  for (let _ = a.length, p = 0; p < _; p++)
    a.removeProperty(a.item(p));
  return f.forEach(([_, p], m) => {
    a.setProperty(m, _, p);
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
  const { ownerWindow: o, svgStyleElement: i, svgStyles: a, currentNodeStyle: c } = r;
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
    c == null || c.forEach((M, L) => {
      b.delete(L);
    });
    const _ = bl(d, b, r.includeStyleProperties);
    _.delete("content"), _.delete("-webkit-locale"), ((k = _.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const p = [
      `content: '${v}';`
    ];
    if (_.forEach(([M, L], F) => {
      p.push(`${F}: ${M}${L ? " !important" : ""};`);
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
    let T = a.get(m);
    T || (T = [], a.set(m, T)), T.push(`.${h[0]}${f}`);
  }
  Ru.forEach(u), n && ju.forEach(u);
}
const Ci = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Ai(e, t, n, r, s) {
  if (tn(n) && (su(n) || ou(n)) || r.filter && !r.filter(n))
    return;
  Ci.has(t.nodeName) || Ci.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const o = await ni(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && Mu(e, o), t.appendChild(o);
}
async function Ti(e, t, n, r) {
  var o;
  let s = e.firstChild;
  tn(e) && e.shadowRoot && (s = (o = e.shadowRoot) == null ? void 0 : o.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let i = s; i; i = i.nextSibling)
    if (!Qf(i))
      if (tn(i) && au(i) && typeof i.assignedNodes == "function") {
        const a = i.assignedNodes();
        for (let c = 0; c < a.length; c++)
          await Ai(e, t, a[c], n, r);
      } else
        await Ai(e, t, i, n, r);
}
function Mu(e, t) {
  if (!ls(e) || !ls(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, o = new DOMMatrix(s), { a: i, b: a, c, d: u } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-r, -n), o.a = i, o.b = a, o.c = c, o.d = u, t.style.transform = o.toString();
}
function Lu(e, t) {
  const { backgroundColor: n, width: r, height: s, style: o } = t, i = e.style;
  if (n && i.setProperty("background-color", n, "important"), r && i.setProperty("width", `${r}px`, "important"), s && i.setProperty("height", `${s}px`, "important"), o)
    for (const a in o) i[a] = o[a];
}
const Du = /^[\w-:]+$/;
async function ni(e, t, n = !1, r) {
  var u, f, d, v;
  const { ownerDocument: s, ownerWindow: o, fontFamilies: i, onCloneEachNode: a } = t;
  if (s && eu(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && o && tn(e) && (ls(e) || ys(e))) {
    const h = await Su(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = h.getAttributeNames();
      for (let M = k.length, L = 0; L < M; L++) {
        const F = k[L];
        Du.test(F) || h.removeAttribute(F);
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
    const p = (d = b.get("text-transform")) == null ? void 0 : d[0], m = vl((v = b.get("font-family")) == null ? void 0 : v[0]), T = m ? (k) => {
      p === "uppercase" ? k = k.toUpperCase() : p === "lowercase" ? k = k.toLowerCase() : p === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), m.forEach((M) => {
        let L = i.get(M);
        L || i.set(M, L = /* @__PURE__ */ new Set()), k.split("").forEach((F) => L.add(F));
      });
    } : void 0;
    return Iu(
      e,
      h,
      _,
      t,
      T
    ), Nu(e, h), io(e) || await Ti(
      e,
      h,
      t,
      T
    ), await (a == null ? void 0 : a(h)), h;
  }
  const c = e.cloneNode(!1);
  return await Ti(e, c, t), await (a == null ? void 0 : a(c)), c;
}
function Pu(e) {
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
  return fetch(t, { signal: o.signal, ...s }).then((a) => {
    if (!a.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: a });
    switch (r) {
      case "arrayBuffer":
        return a.arrayBuffer();
      case "dataUrl":
        return a.blob().then(pu);
      case "text":
      default:
        return a.text();
    }
  }).finally(() => clearTimeout(i));
}
function fs(e, t) {
  const { url: n, requestType: r = "text", responseType: s = "text", imageDom: o } = t;
  let i = n;
  const {
    timeout: a,
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
  r === "image" && (Ws || ti) && e.drawImageCount++;
  let m = u.get(n);
  if (!m) {
    v && v instanceof RegExp && v.test(i) && (i += (/\?/.test(i) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const T = r.startsWith("font") && b && b.minify, k = /* @__PURE__ */ new Set();
    T && r.split(";")[1].split(",").forEach((G) => {
      p.has(G) && p.get(G).forEach((P) => k.add(P));
    });
    const M = T && k.size, L = {
      url: i,
      timeout: a,
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
      return !Ws && n.startsWith("http") && _.length ? new Promise((F, G) => {
        _[u.size & _.length - 1].postMessage({ rawUrl: n, ...L }), m.resolve = F, m.reject = G;
      }) : Ou(L);
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
      const i = await fs(
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
    return !r || r === "none" ? null : ((Ws || ti) && t.drawImageCount++, _l(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function Uu(e, t) {
  if (Ur(e)) {
    const n = e.currentSrc || e.src;
    if (!Oo(n))
      return [
        fs(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (Ws || ti) && t.drawImageCount++;
  } else if (ys(e) && !Oo(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      fs(t, {
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
    const a = `#${i}`, c = t.shadowRoots.reduce(
      (u, f) => u ?? f.querySelector(`svg ${a}`),
      n == null ? void 0 : n.querySelector(`svg ${a}`)
    );
    if (o && e.setAttribute("href", a), r != null && r.querySelector(a))
      return [];
    if (c)
      return r == null || r.appendChild(c.cloneNode(!0)), [];
    if (o)
      return [
        fs(t, {
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
  tn(e) && ((Ur(e) || fl(e)) && n.push(...Uu(e, t)), Zf(e) && n.push(...Hu(e, t))), ls(e) && n.push(...Bu(e.style, t)), e.childNodes.forEach((r) => {
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
    font: a
  } = t;
  if (!(!n || !r || !s.size))
    if (a && a.cssText) {
      const c = Ri(a.cssText, t);
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
              _ = await fs(t, {
                url: b,
                requestType: "text",
                responseType: "text"
              });
            } catch (m) {
              t.log.warn(`Error fetch remote css import from ${b}`, m);
            }
            const p = _.replace(
              wl,
              (m, T, k) => m.replace(k, ul(k, b))
            );
            for (const m of Yu(p))
              try {
                f.insertRule(
                  m,
                  m.startsWith("@import") ? h += 1 : f.cssRules.length
                );
              } catch (T) {
                t.log.warn("Error inserting rule from remote css import", { rule: m, error: T });
              }
          }
        }))
      );
      const u = [];
      c.forEach((f) => {
        qo(f.cssRules, u);
      }), u.filter((f) => {
        var d;
        return Kf(f) && yl(f.style.getPropertyValue("src")) && ((d = vl(f.style.getPropertyValue("font-family"))) == null ? void 0 : d.some((v) => s.has(v)));
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
const Xu = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Ku = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Ri(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(Ku, (s) => {
    for (; ; ) {
      const [o, , i] = Xu.exec(s) || [];
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
  if (tn(n.node) && ys(n.node))
    return n.node;
  const {
    ownerDocument: r,
    log: s,
    tasks: o,
    svgStyleElement: i,
    svgDefsElement: a,
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
    c.forEach((L, F) => {
      M += `${L.join(`,
`)} {
  ${F}
}
`;
    }), i.appendChild(r.createTextNode(M));
  }
  s.timeEnd("clone node"), await (v == null ? void 0 : v(_)), u !== !1 && tn(_) && (s.time("embed web font"), await Vu(_, n), s.timeEnd("embed web font")), s.time("embed node"), xl(_, n);
  const p = o.length;
  let m = 0;
  const T = async () => {
    for (; ; ) {
      const M = o.pop();
      if (!M)
        break;
      try {
        await M;
      } catch (L) {
        n.log.warn("Failed to run task", L);
      }
      f == null || f(++m, p);
    }
  };
  f == null || f(m, p), await Promise.all([...Array.from({ length: 4 })].map(T)), s.timeEnd("embed node"), await (h == null ? void 0 : h(_));
  const k = Ju(_, n);
  return a && k.insertBefore(a, k.children[0]), i && k.insertBefore(i, k.children[0]), d && Pu(n), await (b == null ? void 0 : b(k)), k;
}
function Ju(e, t) {
  const { width: n, height: r } = t, s = uu(n, r, e.ownerDocument), o = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), s.appendChild(o), s;
}
async function kl(e, t) {
  var i;
  const n = await pl(e, t), r = await Gu(n), s = du(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = hl(n.ownerDocument), n.svgDefsElement = (i = n.ownerDocument) == null ? void 0 : i.createElementNS(lo, "defs"), n.svgStyles.clear());
  const o = Ar(s, r.ownerDocument);
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
function Ys(e, { delay: t = 0, duration: n = 400, easing: r = td, axis: s = "y" } = {}) {
  const o = getComputedStyle(e), i = +o.opacity, a = s === "y" ? "height" : "width", c = parseFloat(o[a]), u = s === "y" ? ["top", "bottom"] : ["left", "right"], f = u.map(
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
    css: (m) => `overflow: hidden;opacity: ${Math.min(m * 20, 1) * i};${a}: ${m * c}px;padding-${u[0]}: ${m * d}px;padding-${u[1]}: ${m * v}px;margin-${u[0]}: ${m * h}px;margin-${u[1]}: ${m * b}px;border-${u[0]}-width: ${m * _}px;border-${u[1]}-width: ${m * p}px;min-${a}: 0`
  };
}
var nd = /* @__PURE__ */ j('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), rd = /* @__PURE__ */ j('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), sd = /* @__PURE__ */ j('<span class="more-badge svelte-1dhybq8"> </span>'), od = /* @__PURE__ */ j('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>');
const id = {
  hash: "svelte-1dhybq8",
  code: ".thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}"
};
function Cl(e, t) {
  xn(t, !0), Fn(e, id);
  let n = V(t, "screenshots", 23, () => []), r = V(t, "capturing", 7, !1), s = V(t, "oncapture", 7), o = V(t, "onremove", 7), i = V(t, "onedit", 7);
  var a = {
    get screenshots() {
      return n();
    },
    set screenshots(d = []) {
      n(d), U();
    },
    get capturing() {
      return r();
    },
    set capturing(d = !1) {
      r(d), U();
    },
    get oncapture() {
      return s();
    },
    set oncapture(d) {
      s(d), U();
    },
    get onremove() {
      return o();
    },
    set onremove(d) {
      o(d), U();
    },
    get onedit() {
      return i();
    },
    set onedit(d) {
      i(d), U();
    }
  }, c = Cr(), u = vt(c);
  {
    var f = (d) => {
      var v = od(), h = x(v);
      Ye(h, 17, () => n().slice(-3), pt, (p, m, T) => {
        const k = /* @__PURE__ */ Zt(() => n().length > 3 ? n().length - 3 + T : T);
        var M = rd(), L = x(M);
        ve(L, "alt", `Screenshot ${T + 1}`);
        var F = S(L, 2);
        {
          var G = (re) => {
            var le = nd();
            K("click", le, () => i()(l(k))), $(re, le);
          };
          B(F, (re) => {
            i() && re(G);
          });
        }
        var P = S(F, 2);
        w(M), z(() => ve(L, "src", l(m))), K("click", P, () => o()(l(k))), $(p, M);
      });
      var b = S(h, 2);
      {
        var _ = (p) => {
          var m = sd(), T = x(m);
          w(m), z(() => W(T, `+${n().length - 3}`)), $(p, m);
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
  return $(e, c), kn(a);
}
_s(["click"]);
zn(
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
var ad = /* @__PURE__ */ br('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), ld = /* @__PURE__ */ br('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), cd = /* @__PURE__ */ j('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), fd = /* @__PURE__ */ j("<button></button>"), ud = /* @__PURE__ */ j('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), dd = /* @__PURE__ */ j('<div class="loading svelte-yff65c">Loading image...</div>'), vd = /* @__PURE__ */ j('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), pd = /* @__PURE__ */ j('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const hd = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function Al(e, t) {
  xn(t, !0), Fn(e, hd);
  let n = V(t, "imageDataUrl", 7), r = V(t, "onsave", 7), s = V(t, "oncancel", 7), o = /* @__PURE__ */ D("arrow"), i = /* @__PURE__ */ D(Le(wi[0])), a = /* @__PURE__ */ D(Le([])), c = /* @__PURE__ */ D(void 0), u = /* @__PURE__ */ D(void 0), f = /* @__PURE__ */ D(0), d = /* @__PURE__ */ D(0), v = /* @__PURE__ */ D(!1), h = /* @__PURE__ */ D("idle"), b = { x: 0, y: 0 }, _ = [], p = /* @__PURE__ */ D(void 0), m = /* @__PURE__ */ D(Le(
    { x: 0, y: 0 }
    // canvas coords
  )), T = /* @__PURE__ */ D(Le({ left: "0px", top: "0px" })), k = /* @__PURE__ */ D("");
  Zo(() => {
    ki(!0);
    const E = new Image();
    E.onload = () => {
      y(f, E.naturalWidth, !0), y(d, E.naturalHeight, !0), y(v, !0), requestAnimationFrame(() => L(E));
    }, E.src = n();
  }), za(() => {
    ki(!1);
  });
  function M() {
    return new Promise((E, N) => {
      const O = new Image();
      O.onload = () => E(O), O.onerror = N, O.src = n();
    });
  }
  async function L(E) {
    if (!l(c)) return;
    const N = l(c).getContext("2d");
    N && (E || (E = await M()), l(c).width = l(f), l(c).height = l(d), N.drawImage(E, 0, 0, l(f), l(d)), nl(N, l(a)));
  }
  function F() {
    if (!l(u)) return;
    const E = l(u).getContext("2d");
    E && (l(u).width = l(f), l(u).height = l(d), E.clearRect(0, 0, l(f), l(d)));
  }
  function G(E) {
    if (!l(u)) return { x: 0, y: 0 };
    const N = l(u).getBoundingClientRect(), O = l(f) / N.width, A = l(d) / N.height;
    return {
      x: (E.clientX - N.left) * O,
      y: (E.clientY - N.top) * A
    };
  }
  function P(E) {
    if (!l(u)) return { left: "0px", top: "0px" };
    const N = l(u).getBoundingClientRect();
    return {
      left: `${N.left + E.x / (l(f) / N.width)}px`,
      top: `${N.top + E.y / (l(d) / N.height)}px`
    };
  }
  function re(E) {
    const N = { color: l(i), strokeWidth: xi };
    switch (l(o)) {
      case "arrow":
        return {
          ...N,
          id: Qr(),
          type: "arrow",
          start: b,
          end: E
        };
      case "rectangle":
        return {
          ...N,
          id: Qr(),
          type: "rectangle",
          start: b,
          end: E
        };
      case "ellipse":
        return {
          ...N,
          id: Qr(),
          type: "ellipse",
          start: b,
          end: E
        };
      case "freehand":
        return {
          ...N,
          id: Qr(),
          type: "freehand",
          points: [..._, E]
        };
      default:
        return null;
    }
  }
  function le(E) {
    if (l(h) === "typing") {
      je();
      return;
    }
    const N = G(E);
    if (l(o) === "text") {
      y(h, "typing"), y(m, N, !0), y(T, P(N), !0), y(k, ""), requestAnimationFrame(() => {
        var O;
        return (O = l(p)) == null ? void 0 : O.focus();
      });
      return;
    }
    y(h, "drawing"), b = N, _ = [N];
  }
  function me(E) {
    if (l(h) !== "drawing") return;
    const N = G(E);
    l(o) === "freehand" && _.push(N), F();
    const O = re(N);
    if (O && l(u)) {
      const A = l(u).getContext("2d");
      A && tl(A, O);
    }
  }
  function ke(E) {
    if (l(h) !== "drawing") return;
    const N = G(E), O = re(N);
    O && y(a, [...l(a), O], !0), y(h, "idle"), _ = [], F(), L();
  }
  function je() {
    if (l(k).trim()) {
      const E = {
        id: Qr(),
        type: "text",
        color: l(i),
        strokeWidth: xi,
        position: l(m),
        content: l(k).trim(),
        fontSize: 20
      };
      y(a, [...l(a), E], !0), L();
    }
    y(k, ""), y(h, "idle");
  }
  function Ee(E) {
    E.key === "Enter" ? (E.preventDefault(), je()) : E.key === "Escape" && (E.preventDefault(), y(k, ""), y(h, "idle"));
  }
  function we() {
    l(a).length !== 0 && (y(a, l(a).slice(0, -1), !0), L());
  }
  function Fe() {
    y(a, [], !0), L();
  }
  async function At() {
    if (l(a).length === 0) {
      r()(n());
      return;
    }
    const E = await Df(n(), l(a), l(f), l(d));
    r()(E);
  }
  function ot() {
    s()();
  }
  function Ce(E) {
    E.key === "Escape" && l(h) !== "typing" && (E.stopPropagation(), ot()), (E.ctrlKey || E.metaKey) && E.key === "z" && (E.preventDefault(), we());
  }
  const I = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, ie = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, ze = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var Bt = {
    get imageDataUrl() {
      return n();
    },
    set imageDataUrl(E) {
      n(E), U();
    },
    get onsave() {
      return r();
    },
    set onsave(E) {
      r(E), U();
    },
    get oncancel() {
      return s();
    },
    set oncancel(E) {
      s(E), U();
    }
  }, Tt = pd(), Nt = x(Tt), it = x(Nt);
  Ye(it, 21, () => ze, pt, (E, N) => {
    var O = cd();
    let A;
    var Be = x(O);
    {
      var mt = (bt) => {
        var Ht = ad();
        $(bt, Ht);
      }, jt = (bt) => {
        var Ht = ld(), $n = x(Ht);
        w(Ht), z(() => ve($n, "d", I[l(N)])), $(bt, Ht);
      };
      B(Be, (bt) => {
        l(N) === "ellipse" ? bt(mt) : bt(jt, !1);
      });
    }
    var Sn = S(Be, 2), _r = x(Sn, !0);
    w(Sn), w(O), z(() => {
      A = Xe(O, 1, "tool-btn svelte-yff65c", null, A, { active: l(o) === l(N) }), ve(O, "title", ie[l(N)]), W(_r, ie[l(N)]);
    }), K("click", O, () => {
      y(o, l(N), !0);
    }), $(E, O);
  }), w(it);
  var Rt = S(it, 4);
  Ye(Rt, 21, () => wi, pt, (E, N) => {
    var O = fd();
    let A;
    z(() => {
      A = Xe(O, 1, "color-swatch svelte-yff65c", null, A, { active: l(i) === l(N) }), fr(O, `background: ${l(N) ?? ""}; ${l(N) === "#111827" ? "border-color: #6b7280;" : ""}`), ve(O, "title", l(N));
    }), K("click", O, () => {
      y(i, l(N), !0);
    }), $(E, O);
  }), w(Rt);
  var Je = S(Rt, 4), an = x(Je), ln = S(an, 2);
  w(Je);
  var En = S(Je, 4), C = x(En), ae = S(C, 2);
  w(En), w(Nt);
  var Se = S(Nt, 2), Ut = x(Se);
  {
    var at = (E) => {
      var N = ud(), O = vt(N);
      ss(O, (mt) => y(c, mt), () => l(c));
      var A = S(O, 2);
      let Be;
      ss(A, (mt) => y(u, mt), () => l(u)), z(() => {
        ve(O, "width", l(f)), ve(O, "height", l(d)), ve(A, "width", l(f)), ve(A, "height", l(d)), Be = Xe(A, 1, "overlay-canvas svelte-yff65c", null, Be, {
          "cursor-crosshair": l(o) !== "text",
          "cursor-text": l(o) === "text"
        });
      }), K("mousedown", A, le), K("mousemove", A, me), K("mouseup", A, ke), $(E, N);
    }, Oe = (E) => {
      var N = dd();
      $(E, N);
    };
    B(Ut, (E) => {
      l(v) ? E(at) : E(Oe, !1);
    });
  }
  w(Se);
  var cn = S(Se, 2);
  {
    var Wr = (E) => {
      var N = vd();
      Ha(N), ss(N, (O) => y(p, O), () => l(p)), z(() => fr(N, `left: ${l(T).left ?? ""}; top: ${l(T).top ?? ""}; color: ${l(i) ?? ""};`)), K("keydown", N, Ee), Da("blur", N, je), Hs(N, () => l(k), (O) => y(k, O)), $(E, N);
    };
    B(cn, (E) => {
      l(h) === "typing" && E(Wr);
    });
  }
  return w(Tt), z(() => {
    an.disabled = l(a).length === 0, ln.disabled = l(a).length === 0;
  }), K("keydown", Tt, Ce), K("click", an, we), K("click", ln, Fe), K("click", C, ot), K("click", ae, At), $(e, Tt), kn(Bt);
}
_s(["keydown", "click", "mousedown", "mousemove", "mouseup"]);
zn(Al, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var gd = /* @__PURE__ */ j('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), md = /* @__PURE__ */ j('<div class="log-more svelte-x1hlqn"> </div>'), bd = /* @__PURE__ */ j('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const _d = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function Tl(e, t) {
  xn(t, !0), Fn(e, _d);
  let n = V(t, "logs", 23, () => []);
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
      n(c), U();
    }
  }, o = Cr(), i = vt(o);
  {
    var a = (c) => {
      var u = bd(), f = x(u), d = x(f);
      w(f);
      var v = S(f, 2), h = x(v);
      Ye(h, 17, () => n().slice(-10), pt, (p, m) => {
        var T = gd(), k = x(T), M = x(k, !0);
        w(k);
        var L = S(k, 2), F = x(L);
        w(L), w(T), z(
          (G) => {
            fr(k, `color: ${(r[l(m).type] || "#9ca3af") ?? ""}`), W(M, l(m).type), W(F, `${G ?? ""}${l(m).message.length > 120 ? "..." : ""}`);
          },
          [() => l(m).message.substring(0, 120)]
        ), $(p, T);
      });
      var b = S(h, 2);
      {
        var _ = (p) => {
          var m = md(), T = x(m);
          w(m), z(() => W(T, `+${n().length - 10} more`)), $(p, m);
        };
        B(b, (p) => {
          n().length > 10 && p(_);
        });
      }
      w(v), w(u), z(() => W(d, `Console Logs (${n().length ?? ""})`)), $(c, u);
    };
    B(i, (c) => {
      n().length > 0 && c(a);
    });
  }
  return $(e, o), kn(s);
}
zn(Tl, { logs: {} }, [], [], { mode: "open" });
var yd = /* @__PURE__ */ br('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), wd = /* @__PURE__ */ br('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), xd = /* @__PURE__ */ j('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
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
  xn(t, !0), Fn(e, kd);
  let n = V(t, "message", 7), r = V(t, "type", 7, "success"), s = V(t, "visible", 7, !1);
  var o = {
    get message() {
      return n();
    },
    set message(u) {
      n(u), U();
    },
    get type() {
      return r();
    },
    set type(u = "success") {
      r(u), U();
    },
    get visible() {
      return s();
    },
    set visible(u = !1) {
      s(u), U();
    }
  }, i = Cr(), a = vt(i);
  {
    var c = (u) => {
      var f = xd();
      let d;
      var v = x(f), h = x(v);
      {
        var b = (T) => {
          var k = yd();
          $(T, k);
        }, _ = (T) => {
          var k = wd();
          $(T, k);
        };
        B(h, (T) => {
          r() === "success" ? T(b) : T(_, !1);
        });
      }
      w(v);
      var p = S(v, 2), m = x(p, !0);
      w(p), w(f), z(() => {
        d = Xe(f, 1, "jat-toast svelte-1f5s7q1", null, d, { error: r() === "error", success: r() === "success" }), W(m, n());
      }), $(u, f);
    };
    B(a, (u) => {
      s() && u(c);
    });
  }
  return $(e, i), kn(o);
}
zn(Nl, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Ed = /* @__PURE__ */ j('<span class="subtab-count svelte-1fnmin5"> </span>'), Sd = /* @__PURE__ */ j('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), $d = /* @__PURE__ */ j('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Cd = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Ad = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Td = /* @__PURE__ */ j('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), Nd = /* @__PURE__ */ j('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Rd = /* @__PURE__ */ j('<p class="revision-note svelte-1fnmin5"> </p>'), jd = /* @__PURE__ */ j('<li class="svelte-1fnmin5"> </li>'), Id = /* @__PURE__ */ j('<ul class="thread-summary svelte-1fnmin5"></ul>'), Md = /* @__PURE__ */ j('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Ld = /* @__PURE__ */ j('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Dd = /* @__PURE__ */ j('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Pd = /* @__PURE__ */ j('<span class="element-badge svelte-1fnmin5"> </span>'), Od = /* @__PURE__ */ j('<div class="thread-elements svelte-1fnmin5"></div>'), qd = /* @__PURE__ */ j('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"> </p> <!> <!> <!></div>'), Fd = /* @__PURE__ */ j('<div class="thread svelte-1fnmin5"></div>'), zd = /* @__PURE__ */ j('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), Bd = /* @__PURE__ */ j('<p class="report-desc svelte-1fnmin5"> </p>'), Ud = /* @__PURE__ */ j('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Hd = /* @__PURE__ */ j('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Vd = /* @__PURE__ */ j('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), Wd = /* @__PURE__ */ j('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), Yd = /* @__PURE__ */ j('<span class="status-pill accepted svelte-1fnmin5"></span>'), Xd = /* @__PURE__ */ j('<span class="status-pill rejected svelte-1fnmin5"></span>'), Kd = /* @__PURE__ */ j('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), Gd = /* @__PURE__ */ j('<div class="reject-preview-strip svelte-1fnmin5"></div>'), Jd = /* @__PURE__ */ j('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), Zd = /* @__PURE__ */ j('<div class="reject-element-strip svelte-1fnmin5"></div>'), Qd = /* @__PURE__ */ j('<span class="char-hint svelte-1fnmin5"> </span>'), ev = /* @__PURE__ */ j('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), tv = /* @__PURE__ */ j('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), nv = /* @__PURE__ */ j('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), rv = /* @__PURE__ */ j('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), sv = /* @__PURE__ */ j('<div class="reports svelte-1fnmin5"></div>'), ov = /* @__PURE__ */ j("<div><!></div>"), iv = /* @__PURE__ */ j('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
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
  xn(t, !0), Fn(e, av);
  let n = V(t, "endpoint", 7), r = V(t, "reports", 31, () => Le([])), s = V(t, "loading", 7), o = V(t, "error", 7), i = V(t, "onreload", 7), a = /* @__PURE__ */ D(null), c = /* @__PURE__ */ D(null), u = /* @__PURE__ */ D(null), f = /* @__PURE__ */ D(""), d = /* @__PURE__ */ D(""), v = /* @__PURE__ */ D(""), h = /* @__PURE__ */ D(Le([])), b = /* @__PURE__ */ D(Le([])), _ = /* @__PURE__ */ D(!1), p = /* @__PURE__ */ D("active"), m = /* @__PURE__ */ Zt(() => l(p) === "active" ? r().filter((C) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(C.status)) : r().filter((C) => C.status === "accepted" || C.status === "closed")), T = /* @__PURE__ */ Zt(() => r().filter((C) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(C.status)).length), k = /* @__PURE__ */ Zt(() => r().filter((C) => C.status === "accepted" || C.status === "closed").length);
  function M(C) {
    y(u, l(u) === C ? null : C, !0), l(u) !== C && (l(c) === C && y(c, null), y(a, null));
  }
  function L(C) {
    y(d, C, !0), y(v, ""), y(h, [], !0), y(b, [], !0);
  }
  function F() {
    y(d, ""), y(v, ""), y(h, [], !0), y(b, [], !0);
  }
  async function G() {
    if (!l(_)) {
      y(_, !0);
      try {
        const C = await $l();
        y(h, [...l(h), C], !0);
      } catch (C) {
        console.error("Screenshot capture failed:", C);
      }
      y(_, !1);
    }
  }
  function P(C) {
    y(h, l(h).filter((ae, Se) => Se !== C), !0);
  }
  function re() {
    Za((C) => {
      y(
        b,
        [
          ...l(b),
          {
            tagName: C.tagName,
            className: C.className,
            id: C.id,
            selector: C.selector,
            textContent: C.textContent
          }
        ],
        !0
      );
    });
  }
  function le(C) {
    y(b, l(b).filter((ae, Se) => Se !== C), !0);
  }
  async function me(C, ae, Se) {
    y(f, C, !0);
    const Ut = ae === "rejected" ? {
      screenshots: l(h).length > 0 ? l(h) : void 0,
      elements: l(b).length > 0 ? l(b) : void 0
    } : void 0;
    (await Of(n(), C, ae, Se, Ut)).ok ? (r(r().map((Oe) => Oe.id === C ? {
      ...Oe,
      status: ae === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...ae === "rejected" ? { revision_count: (Oe.revision_count || 0) + 1 } : {}
    } : Oe)), y(d, ""), y(v, ""), y(h, [], !0), y(b, [], !0), i()()) : y(d, ""), y(f, "");
  }
  function ke(C) {
    y(c, l(c) === C ? null : C, !0);
  }
  function je(C) {
    return C ? C.length : 0;
  }
  function Ee(C) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[C.type] || C.type;
  }
  function we(C) {
    return {
      submitted: "Submitted",
      in_progress: "Working On It",
      completed: "Ready for Review",
      accepted: "Done",
      rejected: "Revising",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[C] || C;
  }
  function Fe(C) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#f59e0b",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[C] || "#6b7280";
  }
  function At(C) {
    return C === "bug" ? "🐛" : C === "enhancement" ? "✨" : "📝";
  }
  function ot(C) {
    const ae = Date.now(), Se = new Date(C).getTime(), Ut = ae - Se, at = Math.floor(Ut / 6e4);
    if (at < 1) return "just now";
    if (at < 60) return `${at}m ago`;
    const Oe = Math.floor(at / 60);
    if (Oe < 24) return `${Oe}h ago`;
    const cn = Math.floor(Oe / 24);
    return cn < 30 ? `${cn}d ago` : new Date(C).toLocaleDateString();
  }
  var Ce = {
    get endpoint() {
      return n();
    },
    set endpoint(C) {
      n(C), U();
    },
    get reports() {
      return r();
    },
    set reports(C = []) {
      r(C), U();
    },
    get loading() {
      return s();
    },
    set loading(C) {
      s(C), U();
    },
    get error() {
      return o();
    },
    set error(C) {
      o(C), U();
    },
    get onreload() {
      return i();
    },
    set onreload(C) {
      i(C), U();
    }
  }, I = iv(), ie = x(I), ze = x(ie);
  let Bt;
  var Tt = S(x(ze));
  {
    var Nt = (C) => {
      var ae = Ed(), Se = x(ae, !0);
      w(ae), z(() => W(Se, l(T))), $(C, ae);
    };
    B(Tt, (C) => {
      l(T) > 0 && C(Nt);
    });
  }
  w(ze);
  var it = S(ze, 2);
  let Rt;
  var Je = S(x(it));
  {
    var an = (C) => {
      var ae = Sd(), Se = x(ae, !0);
      w(ae), z(() => W(Se, l(k))), $(C, ae);
    };
    B(Je, (C) => {
      l(k) > 0 && C(an);
    });
  }
  w(it), w(ie);
  var ln = S(ie, 2), En = x(ln);
  return Kc(En, () => l(p), (C) => {
    var ae = ov(), Se = x(ae);
    {
      var Ut = (E) => {
        var N = $d();
        $(E, N);
      }, at = (E) => {
        var N = Cd(), O = x(N), A = x(O, !0);
        w(O);
        var Be = S(O, 2);
        w(N), z(() => W(A, o())), K("click", Be, function(...mt) {
          var jt;
          (jt = i()) == null || jt.apply(this, mt);
        }), $(E, N);
      }, Oe = (E) => {
        var N = Ad(), O = x(N);
        O.textContent = "📋", qs(4), w(N), $(E, N);
      }, cn = (E) => {
        var N = Td(), O = x(N), A = x(O, !0);
        w(O), w(N), z(() => W(A, l(p) === "submitted" ? "No submitted requests" : l(p) === "review" ? "Nothing to review right now" : "No completed requests yet")), $(E, N);
      }, Wr = (E) => {
        var N = sv();
        Ye(N, 21, () => l(m), (O) => O.id, (O, A) => {
          var Be = rv();
          let mt;
          var jt = x(Be), Sn = x(jt), _r = x(Sn, !0);
          w(Sn);
          var bt = S(Sn, 2), Ht = x(bt, !0);
          w(bt);
          var $n = S(bt, 2), co = x($n, !0);
          w($n);
          var fo = S($n, 2);
          let ws;
          w(jt);
          var R = S(jt, 2);
          {
            var J = (pe) => {
              var $e = nv(), Cn = x($e);
              {
                var Bn = (ee) => {
                  var se = Nd(), he = S(x(se), 2), Ue = x(he, !0);
                  w(he), w(se), z(
                    (Vt) => {
                      ve(se, "href", l(A).page_url), W(Ue, Vt);
                    },
                    [
                      () => l(A).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), $(ee, se);
                };
                B(Cn, (ee) => {
                  l(A).page_url && ee(Bn);
                });
              }
              var An = S(Cn, 2);
              {
                var Yr = (ee) => {
                  var se = Rd(), he = x(se);
                  w(se), z(() => W(he, `Revision ${l(A).revision_count ?? ""}`)), $(ee, se);
                };
                B(An, (ee) => {
                  l(A).revision_count > 0 && l(A).status !== "accepted" && ee(Yr);
                });
              }
              var Un = S(An, 2);
              {
                var xs = (ee) => {
                  var se = zd(), he = vt(se), Ue = x(he);
                  let Vt;
                  var lt = S(Ue, 2), Ae = x(lt);
                  w(lt), w(he);
                  var ge = S(he, 2);
                  {
                    var He = (ce) => {
                      var Ze = Fd();
                      Ye(Ze, 21, () => l(A).thread, (Hn) => Hn.id, (Hn, de) => {
                        var Nn = qd();
                        let q;
                        var Z = x(Nn), fe = x(Z), Te = x(fe, !0);
                        w(fe);
                        var ue = S(fe, 2);
                        let qe;
                        var It = x(ue, !0);
                        w(ue);
                        var kr = S(ue, 2), Vn = x(kr, !0);
                        w(kr), w(Z);
                        var be = S(Z, 2), Ve = x(be, !0);
                        w(be);
                        var Qe = S(be, 2);
                        {
                          var ct = (We) => {
                            var _t = Id();
                            Ye(_t, 21, () => l(de).summary, pt, (Yn, Wt) => {
                              var Yt = jd(), un = x(Yt, !0);
                              w(Yt), z(() => W(un, l(Wt))), $(Yn, Yt);
                            }), w(_t), $(We, _t);
                          };
                          B(Qe, (We) => {
                            l(de).summary && l(de).summary.length > 0 && We(ct);
                          });
                        }
                        var Wn = S(Qe, 2);
                        {
                          var fn = (We) => {
                            var _t = Dd(), Yn = vt(_t);
                            Ye(Yn, 21, () => l(de).screenshots, pt, (un, jn, Xn) => {
                              var Es = Cr(), mo = vt(Es);
                              {
                                var Kn = (Gn) => {
                                  var In = Md();
                                  ve(In, "aria-label", `Screenshot ${Xn + 1}`);
                                  var Ss = x(In);
                                  ve(Ss, "alt", `Screenshot ${Xn + 1}`), w(In), z(() => ve(Ss, "src", `${n() ?? ""}${l(jn).url ?? ""}`)), K("click", In, () => y(a, l(a) === l(jn).url ? null : l(jn).url, !0)), $(Gn, In);
                                };
                                B(mo, (Gn) => {
                                  l(jn).url && Gn(Kn);
                                });
                              }
                              $(un, Es);
                            }), w(Yn);
                            var Wt = S(Yn, 2);
                            {
                              var Yt = (un) => {
                                const jn = /* @__PURE__ */ Zt(() => l(de).screenshots.find((Kn) => Kn.url === l(a)));
                                var Xn = Cr(), Es = vt(Xn);
                                {
                                  var mo = (Kn) => {
                                    var Gn = Ld(), In = x(Gn), Ss = S(In, 2);
                                    w(Gn), z(() => ve(In, "src", `${n() ?? ""}${l(a) ?? ""}`)), K("click", Ss, () => y(a, null)), $(Kn, Gn);
                                  };
                                  B(Es, (Kn) => {
                                    l(jn) && Kn(mo);
                                  });
                                }
                                $(un, Xn);
                              };
                              B(Wt, (un) => {
                                l(a) && un(Yt);
                              });
                            }
                            $(We, _t);
                          };
                          B(Wn, (We) => {
                            l(de).screenshots && l(de).screenshots.length > 0 && We(fn);
                          });
                        }
                        var Rn = S(Wn, 2);
                        {
                          var Gr = (We) => {
                            var _t = Od();
                            Ye(_t, 21, () => l(de).elements, pt, (Yn, Wt) => {
                              var Yt = Pd(), un = x(Yt);
                              w(Yt), z(
                                (jn, Xn) => {
                                  ve(Yt, "title", l(Wt).selector), W(un, `<${jn ?? ""}${l(Wt).id ? `#${l(Wt).id}` : ""}${Xn ?? ""}>`);
                                },
                                [
                                  () => l(Wt).tagName.toLowerCase(),
                                  () => l(Wt).className ? `.${l(Wt).className.split(" ")[0]}` : ""
                                ]
                              ), $(Yn, Yt);
                            }), w(_t), $(We, _t);
                          };
                          B(Rn, (We) => {
                            l(de).elements && l(de).elements.length > 0 && We(Gr);
                          });
                        }
                        w(Nn), z(
                          (We, _t) => {
                            q = Xe(Nn, 1, "thread-entry svelte-1fnmin5", null, q, {
                              "thread-user": l(de).from === "user",
                              "thread-dev": l(de).from === "dev"
                            }), W(Te, l(de).from === "user" ? "You" : "Dev"), qe = Xe(ue, 1, "thread-type-badge svelte-1fnmin5", null, qe, {
                              submission: l(de).type === "submission",
                              completion: l(de).type === "completion",
                              rejection: l(de).type === "rejection",
                              acceptance: l(de).type === "acceptance"
                            }), W(It, We), W(Vn, _t), W(Ve, l(de).message);
                          },
                          [
                            () => Ee(l(de)),
                            () => ot(l(de).at)
                          ]
                        ), $(Hn, Nn);
                      }), w(Ze), $(ce, Ze);
                    };
                    B(ge, (ce) => {
                      l(c) === l(A).id && ce(He);
                    });
                  }
                  z(
                    (ce, Ze) => {
                      Vt = Xe(Ue, 0, "thread-toggle-icon svelte-1fnmin5", null, Vt, { expanded: l(c) === l(A).id }), W(Ae, `${ce ?? ""} ${Ze ?? ""}`);
                    },
                    [
                      () => je(l(A).thread),
                      () => je(l(A).thread) === 1 ? "message" : "messages"
                    ]
                  ), K("click", he, () => ke(l(A).id)), $(ee, se);
                }, yr = (ee) => {
                  var se = Bd(), he = x(se, !0);
                  w(se), z((Ue) => W(he, Ue), [
                    () => l(A).description.length > 120 ? l(A).description.slice(0, 120) + "..." : l(A).description
                  ]), $(ee, se);
                };
                B(Un, (ee) => {
                  l(A).thread && l(A).thread.length > 0 ? ee(xs) : l(A).description && ee(yr, 1);
                });
              }
              var wr = S(Un, 2);
              {
                var Xr = (ee) => {
                  var se = Vd(), he = vt(se);
                  Ye(he, 21, () => l(A).screenshot_urls, pt, (Ae, ge, He) => {
                    var ce = Ud();
                    ve(ce, "aria-label", `Screenshot ${He + 1}`);
                    var Ze = x(ce);
                    ve(Ze, "alt", `Screenshot ${He + 1}`), w(ce), z(() => ve(Ze, "src", `${n() ?? ""}${l(ge) ?? ""}`)), K("click", ce, () => y(a, l(a) === l(ge) ? null : l(ge), !0)), $(Ae, ce);
                  }), w(he);
                  var Ue = S(he, 2);
                  {
                    var Vt = (Ae) => {
                      var ge = Hd(), He = x(ge), ce = S(He, 2);
                      w(ge), z(() => ve(He, "src", `${n() ?? ""}${l(a) ?? ""}`)), K("click", ce, () => y(a, null)), $(Ae, ge);
                    }, lt = /* @__PURE__ */ Zt(() => l(a) && l(A).screenshot_urls.includes(l(a)));
                    B(Ue, (Ae) => {
                      l(lt) && Ae(Vt);
                    });
                  }
                  $(ee, se);
                };
                B(wr, (ee) => {
                  !l(A).thread && l(A).screenshot_urls && l(A).screenshot_urls.length > 0 && ee(Xr);
                });
              }
              var Tn = S(wr, 2);
              {
                var uo = (ee) => {
                  var se = Wd(), he = S(x(se), 2), Ue = x(he, !0);
                  w(he), w(se), z(() => W(Ue, l(A).dev_notes)), $(ee, se);
                };
                B(Tn, (ee) => {
                  l(A).dev_notes && !l(A).thread && l(A).status !== "in_progress" && ee(uo);
                });
              }
              var ks = S(Tn, 2), Kr = x(ks), xr = x(Kr, !0);
              w(Kr);
              var vo = S(Kr, 2);
              {
                var po = (ee) => {
                  var se = Yd();
                  se.textContent = "✓ Accepted", $(ee, se);
                }, ho = (ee) => {
                  var se = Xd();
                  se.textContent = "✗ Rejected", $(ee, se);
                }, go = (ee) => {
                  var se = Cr(), he = vt(se);
                  {
                    var Ue = (lt) => {
                      var Ae = ev(), ge = x(Ae);
                      _a(ge);
                      var He = S(ge, 2), ce = x(He), Ze = S(x(ce));
                      w(ce);
                      var Hn = S(ce, 2);
                      w(He);
                      var de = S(He, 2);
                      {
                        var Nn = (be) => {
                          var Ve = Gd();
                          Ye(Ve, 21, () => l(h), pt, (Qe, ct, Wn) => {
                            var fn = Kd(), Rn = x(fn);
                            ve(Rn, "alt", `Screenshot ${Wn + 1}`);
                            var Gr = S(Rn, 2);
                            w(fn), z(() => ve(Rn, "src", l(ct))), K("click", Gr, () => P(Wn)), $(Qe, fn);
                          }), w(Ve), $(be, Ve);
                        };
                        B(de, (be) => {
                          l(h).length > 0 && be(Nn);
                        });
                      }
                      var q = S(de, 2);
                      {
                        var Z = (be) => {
                          var Ve = Zd();
                          Ye(Ve, 21, () => l(b), pt, (Qe, ct, Wn) => {
                            var fn = Jd(), Rn = x(fn), Gr = S(Rn);
                            w(fn), z((We) => W(Rn, `<${We ?? ""}${l(ct).id ? `#${l(ct).id}` : ""}> `), [() => l(ct).tagName.toLowerCase()]), K("click", Gr, () => le(Wn)), $(Qe, fn);
                          }), w(Ve), $(be, Ve);
                        };
                        B(q, (be) => {
                          l(b).length > 0 && be(Z);
                        });
                      }
                      var fe = S(q, 2), Te = x(fe), ue = S(Te, 2), qe = x(ue, !0);
                      w(ue), w(fe);
                      var It = S(fe, 2);
                      {
                        var kr = (be) => {
                          var Ve = Qd(), Qe = x(Ve);
                          w(Ve), z((ct) => W(Qe, `${ct ?? ""} more characters needed`), [() => 10 - l(v).trim().length]), $(be, Ve);
                        }, Vn = /* @__PURE__ */ Zt(() => l(v).trim().length > 0 && l(v).trim().length < 10);
                        B(It, (be) => {
                          l(Vn) && be(kr);
                        });
                      }
                      w(Ae), z(
                        (be) => {
                          ce.disabled = l(_), W(Ze, ` ${l(_) ? "..." : "Screenshot"}`), ue.disabled = be, W(qe, l(f) === l(A).id ? "..." : "✗ Reject");
                        },
                        [
                          () => l(v).trim().length < 10 || l(f) === l(A).id
                        ]
                      ), Hs(ge, () => l(v), (be) => y(v, be)), K("click", ce, G), K("click", Hn, re), K("click", Te, F), K("click", ue, () => me(l(A).id, "rejected", l(v).trim())), $(lt, Ae);
                    }, Vt = (lt) => {
                      var Ae = tv(), ge = x(Ae), He = x(ge, !0);
                      w(ge);
                      var ce = S(ge, 2);
                      ce.textContent = "✗ Reject", w(Ae), z(() => {
                        ge.disabled = l(f) === l(A).id, W(He, l(f) === l(A).id ? "..." : "✓ Accept"), ce.disabled = l(f) === l(A).id;
                      }), K("click", ge, () => me(l(A).id, "accepted")), K("click", ce, () => L(l(A).id)), $(lt, Ae);
                    };
                    B(he, (lt) => {
                      l(d) === l(A).id ? lt(Ue) : lt(Vt, !1);
                    });
                  }
                  $(ee, se);
                };
                B(vo, (ee) => {
                  l(A).status === "accepted" ? ee(po) : l(A).status === "rejected" ? ee(ho, 1) : (l(A).status === "completed" || l(A).status === "wontfix") && ee(go, 2);
                });
              }
              w(ks), w($e), z((ee) => W(xr, ee), [() => ot(l(A).created_at)]), Us(3, $e, () => Ys, () => ({ duration: 200 })), $(pe, $e);
            };
            B(R, (pe) => {
              l(u) === l(A).id && pe(J);
            });
          }
          w(Be), z(
            (pe, $e, Cn, Bn, An) => {
              mt = Xe(Be, 1, "report-card svelte-1fnmin5", null, mt, {
                awaiting: l(A).status === "completed",
                expanded: l(u) === l(A).id
              }), W(_r, pe), W(Ht, l(A).title), fr($n, `background: ${$e ?? ""}20; color: ${Cn ?? ""}; border-color: ${Bn ?? ""}40;`), W(co, An), ws = Xe(fo, 0, "chevron svelte-1fnmin5", null, ws, { "chevron-open": l(u) === l(A).id });
            },
            [
              () => At(l(A).type),
              () => Fe(l(A).status),
              () => Fe(l(A).status),
              () => Fe(l(A).status),
              () => we(l(A).status)
            ]
          ), K("click", jt, () => M(l(A).id)), $(O, Be);
        }), w(N), $(E, N);
      };
      B(Se, (E) => {
        s() ? E(Ut) : o() && r().length === 0 ? E(at, 1) : r().length === 0 ? E(Oe, 2) : l(m).length === 0 ? E(cn, 3) : E(Wr, !1);
      });
    }
    w(ae), Us(3, ae, () => Ys, () => ({ duration: 200 })), $(C, ae);
  }), w(ln), w(I), z(() => {
    Bt = Xe(ze, 1, "subtab svelte-1fnmin5", null, Bt, { active: l(p) === "active" }), Rt = Xe(it, 1, "subtab svelte-1fnmin5", null, Rt, { active: l(p) === "done" });
  }), K("click", ze, () => y(p, "active")), K("click", it, () => y(p, "done")), $(e, I), kn(Ce);
}
_s(["click"]);
zn(
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
var lv = /* @__PURE__ */ j('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), cv = /* @__PURE__ */ j('<span class="tab-badge svelte-nv4d5v"> </span>'), fv = /* @__PURE__ */ j("<option> </option>"), uv = /* @__PURE__ */ j("<option> </option>"), dv = /* @__PURE__ */ j('<span class="capture-spinner svelte-nv4d5v"></span> Capturing...', 1), vv = /* @__PURE__ */ j('<span class="tool-count svelte-nv4d5v"> </span>'), pv = /* @__PURE__ */ br('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot<!>', 1), hv = /* @__PURE__ */ j('<span class="tool-count svelte-nv4d5v"> </span>'), gv = /* @__PURE__ */ j("Pick Element<!>", 1), mv = /* @__PURE__ */ j('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), bv = /* @__PURE__ */ j('<div class="elements-list svelte-nv4d5v"></div>'), _v = /* @__PURE__ */ j('<div class="attach-summary svelte-nv4d5v"> </div>'), yv = /* @__PURE__ */ j('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), wv = /* @__PURE__ */ j('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><div class="tool-buttons svelte-nv4d5v"><button type="button" class="tool-btn svelte-nv4d5v"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><span class="panel-version svelte-nv4d5v"> </span> <button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), xv = /* @__PURE__ */ j("<div><!></div>"), kv = /* @__PURE__ */ j('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!></div> <!>', 1);
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
  }.panel-version.svelte-nv4d5v {font-size:10px;color:#4b5563;margin-right:auto;align-self:flex-end;padding-bottom:6px;}`
};
function jl(e, t) {
  xn(t, !0), Fn(e, Ev);
  const n = "1.6.3";
  let r = V(t, "endpoint", 7), s = V(t, "project", 7), o = V(t, "isOpen", 7, !1), i = V(t, "userId", 7, ""), a = V(t, "userEmail", 7, ""), c = V(t, "userName", 7, ""), u = V(t, "userRole", 7, ""), f = V(t, "orgId", 7, ""), d = V(t, "orgName", 7, ""), v = V(t, "onclose", 7), h = V(t, "ongrip", 7), b = /* @__PURE__ */ D("new"), _ = /* @__PURE__ */ D(Le([])), p = /* @__PURE__ */ D(!1), m = /* @__PURE__ */ D(""), T = /* @__PURE__ */ Zt(() => l(_).filter((R) => R.status === "completed").length);
  async function k() {
    y(p, !0), y(m, "");
    const R = await Pf(r());
    y(_, R.reports, !0), R.error && y(m, R.error, !0), y(p, !1);
  }
  Rs(() => {
    r() && k();
  });
  let M = /* @__PURE__ */ D(""), L = /* @__PURE__ */ D(""), F = /* @__PURE__ */ D("bug"), G = /* @__PURE__ */ D("medium"), P = /* @__PURE__ */ D(Le([])), re = /* @__PURE__ */ D(Le([])), le = /* @__PURE__ */ D(Le([])), me = /* @__PURE__ */ D(!1), ke = /* @__PURE__ */ D(!1), je = /* @__PURE__ */ D(!1), Ee = /* @__PURE__ */ D(null), we = /* @__PURE__ */ D(""), Fe = /* @__PURE__ */ D(void 0), At = !1;
  Rs(() => {
    o() && !At && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var R;
        (R = l(Fe)) == null || R.focus();
      });
    }), l(b) === "new" && l(P).length === 0 && setTimeout(
      () => {
        ed().then((R) => {
          y(P, [...l(P), R], !0);
        }).catch(() => {
        });
      },
      300
    )), At = o();
  });
  let ot = /* @__PURE__ */ D(""), Ce = /* @__PURE__ */ D("success"), I = /* @__PURE__ */ D(!1);
  function ie(R, J) {
    y(ot, R, !0), y(Ce, J, !0), y(I, !0), setTimeout(
      () => {
        y(I, !1);
      },
      3e3
    );
  }
  async function ze() {
    y(ke, !0);
    try {
      const R = await $l();
      y(we, R, !0), y(Ee, l(
        P
        // new index (not yet in array)
      ).length, !0);
    } catch (R) {
      console.error("[jat-feedback] Screenshot failed:", R), ie("Screenshot failed: " + (R instanceof Error ? R.message : "unknown error"), "error");
    } finally {
      y(ke, !1);
    }
  }
  function Bt(R) {
    y(P, l(P).filter((J, pe) => pe !== R), !0);
  }
  function Tt(R) {
    y(we, l(P)[R], !0), y(Ee, R, !0);
  }
  function Nt(R) {
    l(Ee) !== null && (l(Ee) >= l(P).length ? (y(P, [...l(P), R], !0), ie(`Screenshot captured (${l(P).length})`, "success")) : (y(P, l(P).map((J, pe) => pe === l(Ee) ? R : J), !0), ie("Screenshot updated", "success"))), y(Ee, null), y(we, "");
  }
  function it() {
    l(Ee) !== null && l(Ee) >= l(P).length && (y(P, [...l(P), l(we)], !0), ie(`Screenshot captured (${l(P).length})`, "success")), y(Ee, null), y(we, "");
  }
  function Rt() {
    y(je, !0), Za((R) => {
      y(re, [...l(re), R], !0), y(je, !1), ie(`Element captured: <${R.tagName.toLowerCase()}>`, "success");
    });
  }
  function Je() {
    y(le, kf(), !0);
  }
  async function an(R) {
    if (R.preventDefault(), !l(M).trim()) return;
    y(me, !0), Je();
    const J = {};
    (i() || a() || c() || u()) && (J.reporter = {}, i() && (J.reporter.userId = i()), a() && (J.reporter.email = a()), c() && (J.reporter.name = c()), u() && (J.reporter.role = u())), (f() || d()) && (J.organization = {}, f() && (J.organization.id = f()), d() && (J.organization.name = d()));
    const pe = {
      title: l(M).trim(),
      description: l(L).trim(),
      type: l(F),
      priority: l(G),
      project: s() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: l(le).length > 0 ? l(le) : null,
      selected_elements: l(re).length > 0 ? l(re) : null,
      screenshots: l(P).length > 0 ? l(P) : null,
      metadata: Object.keys(J).length > 0 ? J : null
    };
    try {
      const $e = await rl(r(), pe);
      $e.ok ? (ie(`Report submitted (${$e.id})`, "success"), ln(), setTimeout(
        () => {
          k(), y(b, "requests");
        },
        1200
      )) : (Ei(r(), pe), ie("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      Ei(r(), pe), ie("Queued for retry (endpoint unreachable)", "error");
    } finally {
      y(me, !1);
    }
  }
  function ln() {
    y(M, ""), y(L, ""), y(F, "bug"), y(G, "medium"), y(P, [], !0), y(re, [], !0), y(le, [], !0);
  }
  Rs(() => {
    Je();
  });
  const En = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], C = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function ae() {
    return l(P).length + l(re).length;
  }
  var Se = {
    get endpoint() {
      return r();
    },
    set endpoint(R) {
      r(R), U();
    },
    get project() {
      return s();
    },
    set project(R) {
      s(R), U();
    },
    get isOpen() {
      return o();
    },
    set isOpen(R = !1) {
      o(R), U();
    },
    get userId() {
      return i();
    },
    set userId(R = "") {
      i(R), U();
    },
    get userEmail() {
      return a();
    },
    set userEmail(R = "") {
      a(R), U();
    },
    get userName() {
      return c();
    },
    set userName(R = "") {
      c(R), U();
    },
    get userRole() {
      return u();
    },
    set userRole(R = "") {
      u(R), U();
    },
    get orgId() {
      return f();
    },
    set orgId(R = "") {
      f(R), U();
    },
    get orgName() {
      return d();
    },
    set orgName(R = "") {
      d(R), U();
    },
    get onclose() {
      return v();
    },
    set onclose(R) {
      v(R), U();
    },
    get ongrip() {
      return h();
    },
    set ongrip(R) {
      h(R), U();
    }
  }, Ut = kv(), at = vt(Ut), Oe = x(at), cn = x(Oe);
  {
    var Wr = (R) => {
      var J = lv();
      K("mousedown", J, function(...pe) {
        var $e;
        ($e = h()) == null || $e.apply(this, pe);
      }), $(R, J);
    };
    B(cn, (R) => {
      h() && R(Wr);
    });
  }
  var E = S(cn, 2), N = x(E);
  let O;
  var A = S(N, 2);
  let Be;
  var mt = S(x(A), 2);
  {
    var jt = (R) => {
      var J = cv(), pe = x(J, !0);
      w(J), z(() => W(pe, l(T))), $(R, J);
    };
    B(mt, (R) => {
      l(T) > 0 && R(jt);
    });
  }
  w(A), w(E);
  var Sn = S(E, 2);
  w(Oe);
  var _r = S(Oe, 2);
  {
    var bt = (R) => {
      var J = wv(), pe = x(J), $e = S(x(pe), 2);
      Ha($e), ss($e, (q) => y(Fe, q), () => l(Fe)), w(pe);
      var Cn = S(pe, 2), Bn = S(x(Cn), 2);
      _a(Bn), w(Cn);
      var An = S(Cn, 2), Yr = x(An), Un = S(x(Yr), 2);
      Ye(Un, 21, () => En, pt, (q, Z) => {
        var fe = fv(), Te = x(fe, !0);
        w(fe);
        var ue = {};
        z(() => {
          W(Te, l(Z).label), ue !== (ue = l(Z).value) && (fe.value = (fe.__value = l(Z).value) ?? "");
        }), $(q, fe);
      }), w(Un), w(Yr);
      var xs = S(Yr, 2), yr = S(x(xs), 2);
      Ye(yr, 21, () => C, pt, (q, Z) => {
        var fe = uv(), Te = x(fe, !0);
        w(fe);
        var ue = {};
        z(() => {
          W(Te, l(Z).label), ue !== (ue = l(Z).value) && (fe.value = (fe.__value = l(Z).value) ?? "");
        }), $(q, fe);
      }), w(yr), w(xs), w(An);
      var wr = S(An, 2), Xr = x(wr), Tn = x(Xr), uo = x(Tn);
      {
        var ks = (q) => {
          var Z = dv();
          qs(), $(q, Z);
        }, Kr = (q) => {
          var Z = pv(), fe = S(vt(Z), 2);
          {
            var Te = (ue) => {
              var qe = vv(), It = x(qe, !0);
              w(qe), z(() => W(It, l(P).length)), $(ue, qe);
            };
            B(fe, (ue) => {
              l(P).length > 0 && ue(Te);
            });
          }
          $(q, Z);
        };
        B(uo, (q) => {
          l(ke) ? q(ks) : q(Kr, !1);
        });
      }
      w(Tn);
      var xr = S(Tn, 2), vo = S(x(xr), 2);
      {
        var po = (q) => {
          var Z = pi("Click an element...");
          $(q, Z);
        }, ho = (q) => {
          var Z = gv(), fe = S(vt(Z));
          {
            var Te = (ue) => {
              var qe = hv(), It = x(qe, !0);
              w(qe), z(() => W(It, l(re).length)), $(ue, qe);
            };
            B(fe, (ue) => {
              l(re).length > 0 && ue(Te);
            });
          }
          $(q, Z);
        };
        B(vo, (q) => {
          l(je) ? q(po) : q(ho, !1);
        });
      }
      w(xr), w(Xr);
      var go = S(Xr, 2);
      Cl(go, {
        get screenshots() {
          return l(P);
        },
        get capturing() {
          return l(ke);
        },
        oncapture: ze,
        onremove: Bt,
        onedit: Tt
      }), w(wr);
      var ee = S(wr, 2);
      {
        var se = (q) => {
          var Z = bv();
          Ye(Z, 21, () => l(re), pt, (fe, Te, ue) => {
            var qe = mv(), It = x(qe), kr = x(It);
            w(It);
            var Vn = S(It, 2), be = x(Vn, !0);
            w(Vn);
            var Ve = S(Vn, 2);
            w(qe), z(
              (Qe, ct) => {
                W(kr, `<${Qe ?? ""}>`), W(be, ct);
              },
              [
                () => l(Te).tagName.toLowerCase(),
                () => {
                  var Qe;
                  return ((Qe = l(Te).textContent) == null ? void 0 : Qe.substring(0, 40)) || l(Te).selector;
                }
              ]
            ), K("click", Ve, () => {
              y(re, l(re).filter((Qe, ct) => ct !== ue), !0);
            }), $(fe, qe);
          }), w(Z), $(q, Z);
        };
        B(ee, (q) => {
          l(re).length > 0 && q(se);
        });
      }
      var he = S(ee, 2);
      Tl(he, {
        get logs() {
          return l(le);
        }
      });
      var Ue = S(he, 2);
      {
        var Vt = (q) => {
          var Z = _v(), fe = x(Z);
          w(Z), z((Te, ue) => W(fe, `${Te ?? ""} attachment${ue ?? ""} will be included`), [ae, () => ae() > 1 ? "s" : ""]), $(q, Z);
        }, lt = /* @__PURE__ */ Zt(() => ae() > 0);
        B(Ue, (q) => {
          l(lt) && q(Vt);
        });
      }
      var Ae = S(Ue, 2), ge = x(Ae), He = x(ge);
      w(ge);
      var ce = S(ge, 2), Ze = S(ce, 2), Hn = x(Ze);
      {
        var de = (q) => {
          var Z = yv();
          qs(), $(q, Z);
        }, Nn = (q) => {
          var Z = pi("Submit");
          $(q, Z);
        };
        B(Hn, (q) => {
          l(me) ? q(de) : q(Nn, !1);
        });
      }
      w(Ze), w(Ae), w(J), z(
        (q) => {
          $e.disabled = l(me), Bn.disabled = l(me), Un.disabled = l(me), yr.disabled = l(me), Tn.disabled = l(ke), xr.disabled = l(je), W(He, `v${n}`), ce.disabled = l(me), Ze.disabled = q;
        },
        [() => l(me) || !l(M).trim()]
      ), Da("submit", J, an), Hs($e, () => l(M), (q) => y(M, q)), Hs(Bn, () => l(L), (q) => y(L, q)), bi(Un, () => l(F), (q) => y(F, q)), bi(yr, () => l(G), (q) => y(G, q)), K("click", Tn, ze), K("click", xr, Rt), K("click", ce, function(...q) {
        var Z;
        (Z = v()) == null || Z.apply(this, q);
      }), Us(3, J, () => Ys, () => ({ duration: 200 })), $(R, J);
    };
    B(_r, (R) => {
      l(b) === "new" && R(bt);
    });
  }
  var Ht = S(_r, 2);
  {
    var $n = (R) => {
      var J = xv(), pe = x(J);
      Rl(pe, {
        get endpoint() {
          return r();
        },
        get loading() {
          return l(p);
        },
        get error() {
          return l(m);
        },
        onreload: k,
        get reports() {
          return l(_);
        },
        set reports($e) {
          y(_, $e, !0);
        }
      }), w(J), Us(3, J, () => Ys, () => ({ duration: 200 })), $(R, J);
    };
    B(Ht, (R) => {
      l(b) === "requests" && R($n);
    });
  }
  var co = S(Ht, 2);
  Nl(co, {
    get message() {
      return l(ot);
    },
    get type() {
      return l(Ce);
    },
    get visible() {
      return l(I);
    }
  }), w(at);
  var fo = S(at, 2);
  {
    var ws = (R) => {
      Al(R, {
        get imageDataUrl() {
          return l(we);
        },
        onsave: Nt,
        oncancel: it
      });
    };
    B(fo, (R) => {
      l(Ee) !== null && R(ws);
    });
  }
  return z(() => {
    O = Xe(N, 1, "tab svelte-nv4d5v", null, O, { active: l(b) === "new" }), Be = Xe(A, 1, "tab svelte-nv4d5v", null, Be, { active: l(b) === "requests" });
  }), K("click", N, () => y(b, "new")), K("click", A, () => y(b, "requests")), K("click", Sn, function(...R) {
    var J;
    (J = v()) == null || J.apply(this, R);
  }), $(e, Ut), kn(Se);
}
_s(["mousedown", "click"]);
zn(
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
  xn(t, !0), Fn(e, Av);
  let n = V(t, "endpoint", 7, ""), r = V(t, "project", 7, ""), s = V(t, "position", 7, "bottom-right"), o = V(t, "theme", 7, "dark"), i = V(t, "buttoncolor", 7, "#3b82f6"), a = V(t, "user-id", 7, ""), c = V(t, "user-email", 7, ""), u = V(t, "user-name", 7, ""), f = V(t, "user-role", 7, ""), d = V(t, "org-id", 7, ""), v = V(t, "org-name", 7, ""), h = /* @__PURE__ */ D(!1), b = /* @__PURE__ */ D(!1), _ = /* @__PURE__ */ D(!1), p = { x: 0, y: 0 }, m = /* @__PURE__ */ D(void 0);
  const T = 5;
  function k(I, { onDragEnd: ie } = {}) {
    if (!l(m)) return;
    const ze = I.clientX, Bt = I.clientY, Tt = l(m).getBoundingClientRect();
    p = { x: I.clientX - Tt.left, y: I.clientY - Tt.top };
    let Nt = !1;
    function it(Je) {
      if (!l(m)) return;
      const an = Je.clientX - ze, ln = Je.clientY - Bt;
      if (!Nt && Math.abs(an) + Math.abs(ln) < T) return;
      Nt = !0, y(_, !0), Je.preventDefault();
      const En = Je.clientX - p.x, C = Je.clientY - p.y;
      l(m).style.top = `${C}px`, l(m).style.left = `${En}px`, l(m).style.bottom = "auto", l(m).style.right = "auto";
    }
    function Rt() {
      y(_, !1), window.removeEventListener("mousemove", it), window.removeEventListener("mouseup", Rt), ie == null || ie(Nt);
    }
    window.addEventListener("mousemove", it), window.addEventListener("mouseup", Rt);
  }
  function M(I) {
    k(I);
  }
  function L(I) {
    I.button === 0 && (I.preventDefault(), k(I, {
      onDragEnd(ie) {
        ie || re();
      }
    }));
  }
  let F = null;
  function G() {
    F = setInterval(
      () => {
        const I = Af();
        I && !l(b) ? y(b, !0) : !I && l(b) && y(b, !1);
      },
      100
    );
  }
  let P = /* @__PURE__ */ Zt(() => ({
    ...Zr,
    endpoint: n() || Zr.endpoint,
    position: s() || Zr.position,
    theme: o() || Zr.theme,
    buttonColor: i() || Zr.buttonColor
  }));
  function re() {
    y(h, !l(h));
  }
  function le() {
    y(h, !1);
  }
  const me = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, ke = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function je(I) {
    if (I.key === "Escape" && l(h)) {
      if (Tf()) return;
      I.stopPropagation(), I.stopImmediatePropagation(), le();
    }
  }
  Zo(() => {
    l(P).captureConsole && wf(l(P).maxConsoleLogs), zf(), G(), window.addEventListener("keydown", je, !0);
    const I = () => {
      y(h, !0);
    };
    return window.addEventListener("jat-feedback:open", I), () => window.removeEventListener("jat-feedback:open", I);
  }), za(() => {
    xf(), Bf(), window.removeEventListener("keydown", je, !0), F && clearInterval(F);
  });
  var Ee = {
    get endpoint() {
      return n();
    },
    set endpoint(I = "") {
      n(I), U();
    },
    get project() {
      return r();
    },
    set project(I = "") {
      r(I), U();
    },
    get position() {
      return s();
    },
    set position(I = "bottom-right") {
      s(I), U();
    },
    get theme() {
      return o();
    },
    set theme(I = "dark") {
      o(I), U();
    },
    get buttoncolor() {
      return i();
    },
    set buttoncolor(I = "#3b82f6") {
      i(I), U();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"(I = "") {
      a(I), U();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"(I = "") {
      c(I), U();
    },
    get "user-name"() {
      return u();
    },
    set "user-name"(I = "") {
      u(I), U();
    },
    get "user-role"() {
      return f();
    },
    set "user-role"(I = "") {
      f(I), U();
    },
    get "org-id"() {
      return d();
    },
    set "org-id"(I = "") {
      d(I), U();
    },
    get "org-name"() {
      return v();
    },
    set "org-name"(I = "") {
      v(I), U();
    }
  }, we = Cv(), Fe = x(we);
  {
    var At = (I) => {
      var ie = Sv();
      let ze;
      var Bt = x(ie);
      jl(Bt, {
        get endpoint() {
          return l(P).endpoint;
        },
        get project() {
          return r();
        },
        get isOpen() {
          return l(h);
        },
        get userId() {
          return a();
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
        onclose: le,
        ongrip: M
      }), w(ie), z(() => {
        ze = Xe(ie, 1, "jat-feedback-panel svelte-qpyrvv", null, ze, { dragging: l(_), hidden: !l(h) }), fr(ie, ke[l(P).position] || ke["bottom-right"]);
      }), $(I, ie);
    }, ot = (I) => {
      var ie = $v();
      z(() => fr(ie, ke[l(P).position] || ke["bottom-right"])), $(I, ie);
    };
    B(Fe, (I) => {
      l(P).endpoint ? I(At) : l(h) && I(ot, 1);
    });
  }
  var Ce = S(Fe, 2);
  return al(Ce, {
    onmousedown: L,
    get open() {
      return l(h);
    }
  }), w(we), ss(we, (I) => y(m, I), () => l(m)), z(() => fr(we, `${(me[l(P).position] || me["bottom-right"]) ?? ""}; --jat-btn-color: ${l(P).buttonColor ?? ""}; ${l(b) ? "display: none;" : ""}`)), $(e, we), kn(Ee);
}
customElements.define("jat-feedback", zn(
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
