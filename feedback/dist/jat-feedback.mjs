var fl = Object.defineProperty;
var Xi = (e) => {
  throw TypeError(e);
};
var ul = (e, t, n) => t in e ? fl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var ce = (e, t, n) => ul(e, typeof t != "symbol" ? t + "" : t, n), li = (e, t, n) => t.has(e) || Xi("Cannot " + n);
var g = (e, t, n) => (li(e, t, "read from private field"), n ? n.call(e) : t.get(e)), B = (e, t, n) => t.has(e) ? Xi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), P = (e, t, n, r) => (li(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), ge = (e, t, n) => (li(e, t, "access private method"), n);
var wo;
typeof window < "u" && ((wo = window.__svelte ?? (window.__svelte = {})).v ?? (wo.v = /* @__PURE__ */ new Set())).add("5");
const dl = 1, vl = 2, Co = 4, pl = 8, hl = 16, gl = 1, ml = 4, bl = 8, _l = 16, $o = 1, wl = 2, Ni = "[", Is = "[!", Ri = "]", fr = {}, we = Symbol(), Ao = "http://www.w3.org/1999/xhtml", di = !1;
var ji = Array.isArray, yl = Array.prototype.indexOf, ur = Array.prototype.includes, Ls = Array.from, Ss = Object.keys, Cs = Object.defineProperty, Mn = Object.getOwnPropertyDescriptor, xl = Object.getOwnPropertyDescriptors, kl = Object.prototype, El = Array.prototype, To = Object.getPrototypeOf, Ki = Object.isExtensible;
const Sl = () => {
};
function Cl(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function No() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const xe = 2, Br = 4, Ms = 8, Ro = 1 << 24, Zt = 16, gt = 32, dn = 64, jo = 128, rt = 512, be = 1024, ke = 2048, ht = 4096, Xe = 8192, Xt = 16384, _r = 32768, dr = 65536, Zi = 1 << 17, Io = 1 << 18, Bn = 1 << 19, $l = 1 << 20, Yt = 1 << 25, Fn = 65536, vi = 1 << 21, Ii = 1 << 22, cn = 1 << 23, qn = Symbol("$state"), Lo = Symbol("legacy props"), Al = Symbol(""), Cn = new class extends Error {
  constructor() {
    super(...arguments);
    ce(this, "name", "StaleReactionError");
    ce(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var yo, xo;
const Tl = ((xo = (yo = globalThis.document) == null ? void 0 : yo.contentType) == null ? void 0 : /* @__PURE__ */ xo.includes("xml")) ?? !1, Qr = 3, wr = 8;
function Mo(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Nl() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Rl(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function jl(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Il() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ll(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ml() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ql() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Pl(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Dl() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Fl() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ol() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function zl() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function qs(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Bl() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ul() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let K = !1;
function Gt(e) {
  K = e;
}
let Y;
function Te(e) {
  if (e === null)
    throw qs(), fr;
  return Y = e;
}
function Ps() {
  return Te(/* @__PURE__ */ Rt(Y));
}
function y(e) {
  if (K) {
    if (/* @__PURE__ */ Rt(Y) !== null)
      throw qs(), fr;
    Y = e;
  }
}
function Ur(e = 1) {
  if (K) {
    for (var t = e, n = Y; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Rt(n);
    Y = n;
  }
}
function $s(e = !0) {
  for (var t = 0, n = Y; ; ) {
    if (n.nodeType === wr) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Ri) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Ni || r === Is || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Rt(n)
    );
    e && n.remove(), n = s;
  }
}
function qo(e) {
  if (!e || e.nodeType !== wr)
    throw qs(), fr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Po(e) {
  return e === this.v;
}
function Hl(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Do(e) {
  return !Hl(e, this.v);
}
let Vl = !1, qe = null;
function vr(e) {
  qe = e;
}
function vn(e, t = !1, n) {
  qe = {
    p: qe,
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
    qe
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      fa(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, qe = t.p, e ?? /** @type {T} */
  {};
}
function Fo() {
  return !0;
}
let $n = [];
function Oo() {
  var e = $n;
  $n = [], Cl(e);
}
function $t(e) {
  if ($n.length === 0 && !qr) {
    var t = $n;
    queueMicrotask(() => {
      t === $n && Oo();
    });
  }
  $n.push(e);
}
function Wl() {
  for (; $n.length > 0; )
    Oo();
}
function zo(e) {
  var t = J;
  if (t === null)
    return G.f |= cn, e;
  if ((t.f & _r) === 0 && (t.f & Br) === 0)
    throw e;
  pr(e, t);
}
function pr(e, t) {
  for (; t !== null; ) {
    if ((t.f & jo) !== 0) {
      if ((t.f & _r) === 0)
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
const Yl = -7169;
function fe(e, t) {
  e.f = e.f & Yl | t;
}
function Li(e) {
  (e.f & rt) !== 0 || e.deps === null ? fe(e, be) : fe(e, ht);
}
function Bo(e) {
  if (e !== null)
    for (const t of e)
      (t.f & xe) === 0 || (t.f & Fn) === 0 || (t.f ^= Fn, Bo(
        /** @type {Derived} */
        t.deps
      ));
}
function Uo(e, t, n) {
  (e.f & ke) !== 0 ? t.add(e) : (e.f & ht) !== 0 && n.add(e), Bo(e.deps), fe(e, be);
}
const hs = /* @__PURE__ */ new Set();
let O = null, As = null, ye = null, Ie = [], Ds = null, pi = !1, qr = !1;
var rr, sr, Tn, ir, Gr, Xr, Nn, Bt, or, Nt, hi, gi, Ho;
const Gi = class Gi {
  constructor() {
    B(this, Nt);
    ce(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    ce(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    ce(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    B(this, rr, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    B(this, sr, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    B(this, Tn, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    B(this, ir, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    B(this, Gr, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    B(this, Xr, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    B(this, Nn, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    B(this, Bt, /* @__PURE__ */ new Map());
    ce(this, "is_fork", !1);
    B(this, or, !1);
  }
  is_deferred() {
    return this.is_fork || g(this, ir) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    g(this, Bt).has(t) || g(this, Bt).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = g(this, Bt).get(t);
    if (n) {
      g(this, Bt).delete(t);
      for (var r of n.d)
        fe(r, ke), dt(r);
      for (r of n.m)
        fe(r, ht), dt(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    Ie = [], this.apply();
    var n = [], r = [];
    for (const i of t)
      ge(this, Nt, hi).call(this, i, n, r);
    if (this.is_deferred()) {
      ge(this, Nt, gi).call(this, r), ge(this, Nt, gi).call(this, n);
      for (const [i, o] of g(this, Bt))
        Go(i, o);
    } else {
      for (const i of g(this, rr)) i();
      g(this, rr).clear(), g(this, Tn) === 0 && ge(this, Nt, Ho).call(this), As = this, O = null, Ji(r), Ji(n), As = null, (s = g(this, Gr)) == null || s.resolve();
    }
    ye = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== we && !this.previous.has(t) && this.previous.set(t, n), (t.f & cn) === 0 && (this.current.set(t, t.v), ye == null || ye.set(t, t.v));
  }
  activate() {
    O = this, this.apply();
  }
  deactivate() {
    O === this && (O = null, ye = null);
  }
  flush() {
    if (this.activate(), Ie.length > 0) {
      if (Vo(), O !== null && O !== this)
        return;
    } else g(this, Tn) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of g(this, sr)) t(this);
    g(this, sr).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    P(this, Tn, g(this, Tn) + 1), t && P(this, ir, g(this, ir) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    P(this, Tn, g(this, Tn) - 1), t && P(this, ir, g(this, ir) - 1), !g(this, or) && (P(this, or, !0), $t(() => {
      P(this, or, !1), this.is_deferred() ? Ie.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of g(this, Xr))
      g(this, Nn).delete(t), fe(t, ke), dt(t);
    for (const t of g(this, Nn))
      fe(t, ht), dt(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    g(this, rr).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    g(this, sr).add(t);
  }
  settled() {
    return (g(this, Gr) ?? P(this, Gr, No())).promise;
  }
  static ensure() {
    if (O === null) {
      const t = O = new Gi();
      hs.add(O), qr || $t(() => {
        O === t && t.flush();
      });
    }
    return O;
  }
  apply() {
  }
};
rr = new WeakMap(), sr = new WeakMap(), Tn = new WeakMap(), ir = new WeakMap(), Gr = new WeakMap(), Xr = new WeakMap(), Nn = new WeakMap(), Bt = new WeakMap(), or = new WeakMap(), Nt = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
hi = function(t, n, r) {
  t.f ^= be;
  for (var s = t.first, i = null; s !== null; ) {
    var o = s.f, a = (o & (gt | dn)) !== 0, l = a && (o & be) !== 0, u = l || (o & Xe) !== 0 || g(this, Bt).has(s);
    if (!u && s.fn !== null) {
      a ? s.f ^= be : i !== null && (o & (Br | Ms | Ro)) !== 0 ? i.b.defer_effect(s) : (o & Br) !== 0 ? n.push(s) : es(s) && ((o & Zt) !== 0 && g(this, Nn).add(s), gr(s));
      var f = s.first;
      if (f !== null) {
        s = f;
        continue;
      }
    }
    var v = s.parent;
    for (s = s.next; s === null && v !== null; )
      v === i && (i = null), s = v.next, v = v.parent;
  }
}, /**
 * @param {Effect[]} effects
 */
gi = function(t) {
  for (var n = 0; n < t.length; n += 1)
    Uo(t[n], g(this, Xr), g(this, Nn));
}, Ho = function() {
  var s;
  if (hs.size > 1) {
    this.previous.clear();
    var t = ye, n = !0;
    for (const i of hs) {
      if (i === this) {
        n = !1;
        continue;
      }
      const o = [];
      for (const [l, u] of this.current) {
        if (i.current.has(l))
          if (n && u !== i.current.get(l))
            i.current.set(l, u);
          else
            continue;
        o.push(l);
      }
      if (o.length === 0)
        continue;
      const a = [...i.current.keys()].filter((l) => !this.current.has(l));
      if (a.length > 0) {
        var r = Ie;
        Ie = [];
        const l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const f of o)
          Wo(f, a, l, u);
        if (Ie.length > 0) {
          O = i, i.apply();
          for (const f of Ie)
            ge(s = i, Nt, hi).call(s, f, [], []);
          i.deactivate();
        }
        Ie = r;
      }
    }
    O = null, ye = t;
  }
  this.committed = !0, hs.delete(this);
};
let Kt = Gi;
function W(e) {
  var t = qr;
  qr = !0;
  try {
    for (var n; ; ) {
      if (Wl(), Ie.length === 0 && (O == null || O.flush(), Ie.length === 0))
        return Ds = null, /** @type {T} */
        n;
      Vo();
    }
  } finally {
    qr = t;
  }
}
function Vo() {
  pi = !0;
  var e = null;
  try {
    for (var t = 0; Ie.length > 0; ) {
      var n = Kt.ensure();
      if (t++ > 1e3) {
        var r, s;
        Gl();
      }
      n.process(Ie), fn.clear();
    }
  } finally {
    Ie = [], pi = !1, Ds = null;
  }
}
function Gl() {
  try {
    Ml();
  } catch (e) {
    pr(e, Ds);
  }
}
let ct = null;
function Ji(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (Xt | Xe)) === 0 && es(r) && (ct = /* @__PURE__ */ new Set(), gr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && da(r), (ct == null ? void 0 : ct.size) > 0)) {
        fn.clear();
        for (const s of ct) {
          if ((s.f & (Xt | Xe)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            ct.has(o) && (ct.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const l = i[a];
            (l.f & (Xt | Xe)) === 0 && gr(l);
          }
        }
        ct.clear();
      }
    }
    ct = null;
  }
}
function Wo(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & xe) !== 0 ? Wo(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (Ii | Zt)) !== 0 && (i & ke) === 0 && Yo(s, t, r) && (fe(s, ke), dt(
        /** @type {Effect} */
        s
      ));
    }
}
function Yo(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (ur.call(t, s))
        return !0;
      if ((s.f & xe) !== 0 && Yo(
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
function dt(e) {
  for (var t = Ds = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (pi && t === J && (n & Zt) !== 0 && (n & Io) === 0)
      return;
    if ((n & (dn | gt)) !== 0) {
      if ((n & be) === 0) return;
      t.f ^= be;
    }
  }
  Ie.push(t);
}
function Go(e, t) {
  if (!((e.f & gt) !== 0 && (e.f & be) !== 0)) {
    (e.f & ke) !== 0 ? t.d.push(e) : (e.f & ht) !== 0 && t.m.push(e), fe(e, be);
    for (var n = e.first; n !== null; )
      Go(n, t), n = n.next;
  }
}
function Xl(e) {
  let t = 0, n = On(0), r;
  return () => {
    Di() && (c(n), Bs(() => (t === 0 && (r = yr(() => e(() => Pr(n)))), t += 1, () => {
      $t(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, Pr(n));
      });
    })));
  };
}
var Kl = dr | Bn | jo;
function Zl(e, t, n) {
  new Jl(e, t, n);
}
var Ue, Kr, xt, Rn, kt, Qe, je, Et, Ut, ln, jn, Ht, ar, In, lr, cr, Vt, Rs, ue, Xo, Ko, mi, bs, _s, bi;
class Jl {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    B(this, ue);
    /** @type {Boundary | null} */
    ce(this, "parent");
    ce(this, "is_pending", !1);
    /** @type {TemplateNode} */
    B(this, Ue);
    /** @type {TemplateNode | null} */
    B(this, Kr, K ? Y : null);
    /** @type {BoundaryProps} */
    B(this, xt);
    /** @type {((anchor: Node) => void)} */
    B(this, Rn);
    /** @type {Effect} */
    B(this, kt);
    /** @type {Effect | null} */
    B(this, Qe, null);
    /** @type {Effect | null} */
    B(this, je, null);
    /** @type {Effect | null} */
    B(this, Et, null);
    /** @type {DocumentFragment | null} */
    B(this, Ut, null);
    /** @type {TemplateNode | null} */
    B(this, ln, null);
    B(this, jn, 0);
    B(this, Ht, 0);
    B(this, ar, !1);
    B(this, In, !1);
    /** @type {Set<Effect>} */
    B(this, lr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    B(this, cr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    B(this, Vt, null);
    B(this, Rs, Xl(() => (P(this, Vt, On(g(this, jn))), () => {
      P(this, Vt, null);
    })));
    P(this, Ue, t), P(this, xt, n), P(this, Rn, r), this.parent = /** @type {Effect} */
    J.b, this.is_pending = !!g(this, xt).pending, P(this, kt, zi(() => {
      if (J.b = this, K) {
        const i = g(this, Kr);
        Ps(), /** @type {Comment} */
        i.nodeType === wr && /** @type {Comment} */
        i.data === Is ? ge(this, ue, Ko).call(this) : (ge(this, ue, Xo).call(this), g(this, Ht) === 0 && (this.is_pending = !1));
      } else {
        var s = ge(this, ue, mi).call(this);
        try {
          P(this, Qe, tt(() => r(s)));
        } catch (i) {
          this.error(i);
        }
        g(this, Ht) > 0 ? ge(this, ue, _s).call(this) : this.is_pending = !1;
      }
      return () => {
        var i;
        (i = g(this, ln)) == null || i.remove();
      };
    }, Kl)), K && P(this, Ue, Y);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Uo(t, g(this, lr), g(this, cr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!g(this, xt).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    ge(this, ue, bi).call(this, t), P(this, jn, g(this, jn) + t), !(!g(this, Vt) || g(this, ar)) && (P(this, ar, !0), $t(() => {
      P(this, ar, !1), g(this, Vt) && hr(g(this, Vt), g(this, jn));
    }));
  }
  get_effect_pending() {
    return g(this, Rs).call(this), c(
      /** @type {Source<number>} */
      g(this, Vt)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = g(this, xt).onerror;
    let r = g(this, xt).failed;
    if (g(this, In) || !n && !r)
      throw t;
    g(this, Qe) && (Ne(g(this, Qe)), P(this, Qe, null)), g(this, je) && (Ne(g(this, je)), P(this, je, null)), g(this, Et) && (Ne(g(this, Et)), P(this, Et, null)), K && (Te(
      /** @type {TemplateNode} */
      g(this, Kr)
    ), Ur(), Te($s()));
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        Ul();
        return;
      }
      s = !0, i && zl(), Kt.ensure(), P(this, jn, 0), g(this, Et) !== null && Pn(g(this, Et), () => {
        P(this, Et, null);
      }), this.is_pending = this.has_pending_snippet(), P(this, Qe, ge(this, ue, bs).call(this, () => (P(this, In, !1), tt(() => g(this, Rn).call(this, g(this, Ue)))))), g(this, Ht) > 0 ? ge(this, ue, _s).call(this) : this.is_pending = !1;
    };
    $t(() => {
      try {
        i = !0, n == null || n(t, o), i = !1;
      } catch (a) {
        pr(a, g(this, kt) && g(this, kt).parent);
      }
      r && P(this, Et, ge(this, ue, bs).call(this, () => {
        Kt.ensure(), P(this, In, !0);
        try {
          return tt(() => {
            r(
              g(this, Ue),
              () => t,
              () => o
            );
          });
        } catch (a) {
          return pr(
            a,
            /** @type {Effect} */
            g(this, kt).parent
          ), null;
        } finally {
          P(this, In, !1);
        }
      }));
    });
  }
}
Ue = new WeakMap(), Kr = new WeakMap(), xt = new WeakMap(), Rn = new WeakMap(), kt = new WeakMap(), Qe = new WeakMap(), je = new WeakMap(), Et = new WeakMap(), Ut = new WeakMap(), ln = new WeakMap(), jn = new WeakMap(), Ht = new WeakMap(), ar = new WeakMap(), In = new WeakMap(), lr = new WeakMap(), cr = new WeakMap(), Vt = new WeakMap(), Rs = new WeakMap(), ue = new WeakSet(), Xo = function() {
  try {
    P(this, Qe, tt(() => g(this, Rn).call(this, g(this, Ue))));
  } catch (t) {
    this.error(t);
  }
}, Ko = function() {
  const t = g(this, xt).pending;
  t && (P(this, je, tt(() => t(g(this, Ue)))), $t(() => {
    var n = ge(this, ue, mi).call(this);
    P(this, Qe, ge(this, ue, bs).call(this, () => (Kt.ensure(), tt(() => g(this, Rn).call(this, n))))), g(this, Ht) > 0 ? ge(this, ue, _s).call(this) : (Pn(
      /** @type {Effect} */
      g(this, je),
      () => {
        P(this, je, null);
      }
    ), this.is_pending = !1);
  }));
}, mi = function() {
  var t = g(this, Ue);
  return this.is_pending && (P(this, ln, Me()), g(this, Ue).before(g(this, ln)), t = g(this, ln)), t;
}, /**
 * @param {() => Effect | null} fn
 */
bs = function(t) {
  var n = J, r = G, s = qe;
  At(g(this, kt)), it(g(this, kt)), vr(g(this, kt).ctx);
  try {
    return t();
  } catch (i) {
    return zo(i), null;
  } finally {
    At(n), it(r), vr(s);
  }
}, _s = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    g(this, xt).pending
  );
  g(this, Qe) !== null && (P(this, Ut, document.createDocumentFragment()), g(this, Ut).append(
    /** @type {TemplateNode} */
    g(this, ln)
  ), ha(g(this, Qe), g(this, Ut))), g(this, je) === null && P(this, je, tt(() => t(g(this, Ue))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
bi = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && ge(n = this.parent, ue, bi).call(n, t);
    return;
  }
  if (P(this, Ht, g(this, Ht) + t), g(this, Ht) === 0) {
    this.is_pending = !1;
    for (const r of g(this, lr))
      fe(r, ke), dt(r);
    for (const r of g(this, cr))
      fe(r, ht), dt(r);
    g(this, lr).clear(), g(this, cr).clear(), g(this, je) && Pn(g(this, je), () => {
      P(this, je, null);
    }), g(this, Ut) && (g(this, Ue).before(g(this, Ut)), P(this, Ut, null));
  }
};
function Ql(e, t, n, r) {
  const s = Fs;
  var i = e.filter((d) => !d.settled);
  if (n.length === 0 && i.length === 0) {
    r(t.map(s));
    return;
  }
  var o = O, a = (
    /** @type {Effect} */
    J
  ), l = ec(), u = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((d) => d.promise)) : null;
  function f(d) {
    l();
    try {
      r(d);
    } catch (m) {
      (a.f & Xt) === 0 && pr(m, a);
    }
    o == null || o.deactivate(), _i();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(s)));
    return;
  }
  function v() {
    l(), Promise.all(n.map((d) => /* @__PURE__ */ tc(d))).then((d) => f([...t.map(s), ...d])).catch((d) => pr(d, a));
  }
  u ? u.then(v) : v();
}
function ec() {
  var e = J, t = G, n = qe, r = O;
  return function(i = !0) {
    At(e), it(t), vr(n), i && (r == null || r.activate());
  };
}
function _i() {
  At(null), it(null), vr(null);
}
// @__NO_SIDE_EFFECTS__
function Fs(e) {
  var t = xe | ke, n = G !== null && (G.f & xe) !== 0 ? (
    /** @type {Derived} */
    G
  ) : null;
  return J !== null && (J.f |= Bn), {
    ctx: qe,
    deps: null,
    effects: null,
    equals: Po,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      we
    ),
    wv: 0,
    parent: n ?? J,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function tc(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    J
  );
  r === null && Nl();
  var s = (
    /** @type {Boundary} */
    r.b
  ), i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), o = On(
    /** @type {V} */
    we
  ), a = !G, l = /* @__PURE__ */ new Map();
  return uc(() => {
    var m;
    var u = No();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).then(() => {
        f === O && f.committed && f.deactivate(), _i();
      });
    } catch (b) {
      u.reject(b), _i();
    }
    var f = (
      /** @type {Batch} */
      O
    );
    if (a) {
      var v = s.is_rendered();
      s.update_pending_count(1), f.increment(v), (m = l.get(f)) == null || m.reject(Cn), l.delete(f), l.set(f, u);
    }
    const d = (b, _ = void 0) => {
      if (f.activate(), _)
        _ !== Cn && (o.f |= cn, hr(o, _));
      else {
        (o.f & cn) !== 0 && (o.f ^= cn), hr(o, b);
        for (const [h, w] of l) {
          if (l.delete(h), h === f) break;
          w.reject(Cn);
        }
      }
      a && (s.update_pending_count(-1), f.decrement(v));
    };
    u.promise.then(d, (b) => d(null, b || "unknown"));
  }), Fi(() => {
    for (const u of l.values())
      u.reject(Cn);
  }), new Promise((u) => {
    function f(v) {
      function d() {
        v === i ? u(o) : f(i);
      }
      v.then(d, d);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function yt(e) {
  const t = /* @__PURE__ */ Fs(e);
  return ga(t), t;
}
// @__NO_SIDE_EFFECTS__
function Zo(e) {
  const t = /* @__PURE__ */ Fs(e);
  return t.equals = Do, t;
}
function nc(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      Ne(
        /** @type {Effect} */
        t[n]
      );
  }
}
function rc(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & xe) === 0)
      return (t.f & Xt) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Mi(e) {
  var t, n = J;
  At(rc(e));
  try {
    e.f &= ~Fn, nc(e), t = wa(e);
  } finally {
    At(n);
  }
  return t;
}
function Jo(e) {
  var t = Mi(e);
  if (!e.equals(t) && (e.wv = ba(), (!(O != null && O.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    fe(e, be);
    return;
  }
  un || (ye !== null ? (Di() || O != null && O.is_fork) && ye.set(e, t) : Li(e));
}
function sc(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(Cn), r.teardown = Sl, r.ac = null, Hr(r, 0), Bi(r));
}
function Qo(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && gr(t);
}
let wi = /* @__PURE__ */ new Set();
const fn = /* @__PURE__ */ new Map();
let ea = !1;
function On(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Po,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function U(e, t) {
  const n = On(e);
  return ga(n), n;
}
// @__NO_SIDE_EFFECTS__
function ta(e, t = !1, n = !0) {
  const r = On(e);
  return t || (r.equals = Do), r;
}
function E(e, t, n = !1) {
  G !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!vt || (G.f & Zi) !== 0) && Fo() && (G.f & (xe | Zt | Ii | Zi)) !== 0 && (st === null || !ur.call(st, e)) && Ol();
  let r = n ? Ge(t) : t;
  return hr(e, r);
}
function hr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    un ? fn.set(e, t) : fn.set(e, n), e.v = t;
    var r = Kt.ensure();
    if (r.capture(e, n), (e.f & xe) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & ke) !== 0 && Mi(s), Li(s);
    }
    e.wv = ba(), na(e, ke), J !== null && (J.f & be) !== 0 && (J.f & (gt | dn)) === 0 && (Je === null ? pc([e]) : Je.push(e)), !r.is_fork && wi.size > 0 && !ea && ic();
  }
  return t;
}
function ic() {
  ea = !1;
  for (const e of wi)
    (e.f & be) !== 0 && fe(e, ht), es(e) && gr(e);
  wi.clear();
}
function Pr(e) {
  E(e, e.v + 1);
}
function na(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var i = n[s], o = i.f, a = (o & ke) === 0;
      if (a && fe(i, t), (o & xe) !== 0) {
        var l = (
          /** @type {Derived} */
          i
        );
        ye == null || ye.delete(l), (o & Fn) === 0 && (o & rt && (i.f |= Fn), na(l, ht));
      } else a && ((o & Zt) !== 0 && ct !== null && ct.add(
        /** @type {Effect} */
        i
      ), dt(
        /** @type {Effect} */
        i
      ));
    }
}
function Ge(e) {
  if (typeof e != "object" || e === null || qn in e)
    return e;
  const t = To(e);
  if (t !== kl && t !== El)
    return e;
  var n = /* @__PURE__ */ new Map(), r = ji(e), s = /* @__PURE__ */ U(0), i = Dn, o = (a) => {
    if (Dn === i)
      return a();
    var l = G, u = Dn;
    it(null), ro(i);
    var f = a();
    return it(l), ro(u), f;
  };
  return r && n.set("length", /* @__PURE__ */ U(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Dl();
        var f = n.get(l);
        return f === void 0 ? o(() => {
          var v = /* @__PURE__ */ U(u.value);
          return n.set(l, v), v;
        }) : E(f, u.value, !0), !0;
      },
      deleteProperty(a, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in a) {
            const f = o(() => /* @__PURE__ */ U(we));
            n.set(l, f), Pr(s);
          }
        } else
          E(u, we), Pr(s);
        return !0;
      },
      get(a, l, u) {
        var m;
        if (l === qn)
          return e;
        var f = n.get(l), v = l in a;
        if (f === void 0 && (!v || (m = Mn(a, l)) != null && m.writable) && (f = o(() => {
          var b = Ge(v ? a[l] : we), _ = /* @__PURE__ */ U(b);
          return _;
        }), n.set(l, f)), f !== void 0) {
          var d = c(f);
          return d === we ? void 0 : d;
        }
        return Reflect.get(a, l, u);
      },
      getOwnPropertyDescriptor(a, l) {
        var u = Reflect.getOwnPropertyDescriptor(a, l);
        if (u && "value" in u) {
          var f = n.get(l);
          f && (u.value = c(f));
        } else if (u === void 0) {
          var v = n.get(l), d = v == null ? void 0 : v.v;
          if (v !== void 0 && d !== we)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return u;
      },
      has(a, l) {
        var d;
        if (l === qn)
          return !0;
        var u = n.get(l), f = u !== void 0 && u.v !== we || Reflect.has(a, l);
        if (u !== void 0 || J !== null && (!f || (d = Mn(a, l)) != null && d.writable)) {
          u === void 0 && (u = o(() => {
            var m = f ? Ge(a[l]) : we, b = /* @__PURE__ */ U(m);
            return b;
          }), n.set(l, u));
          var v = c(u);
          if (v === we)
            return !1;
        }
        return f;
      },
      set(a, l, u, f) {
        var k;
        var v = n.get(l), d = l in a;
        if (r && l === "length")
          for (var m = u; m < /** @type {Source<number>} */
          v.v; m += 1) {
            var b = n.get(m + "");
            b !== void 0 ? E(b, we) : m in a && (b = o(() => /* @__PURE__ */ U(we)), n.set(m + "", b));
          }
        if (v === void 0)
          (!d || (k = Mn(a, l)) != null && k.writable) && (v = o(() => /* @__PURE__ */ U(void 0)), E(v, Ge(u)), n.set(l, v));
        else {
          d = v.v !== we;
          var _ = o(() => Ge(u));
          E(v, _);
        }
        var h = Reflect.getOwnPropertyDescriptor(a, l);
        if (h != null && h.set && h.set.call(f, u), !d) {
          if (r && typeof l == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), A = Number(l);
            Number.isInteger(A) && A >= w.v && E(w, A + 1);
          }
          Pr(s);
        }
        return !0;
      },
      ownKeys(a) {
        c(s);
        var l = Reflect.ownKeys(a).filter((v) => {
          var d = n.get(v);
          return d === void 0 || d.v !== we;
        });
        for (var [u, f] of n)
          f.v !== we && !(u in a) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        Fl();
      }
    }
  );
}
function Qi(e) {
  try {
    if (e !== null && typeof e == "object" && qn in e)
      return e[qn];
  } catch {
  }
  return e;
}
function oc(e, t) {
  return Object.is(Qi(e), Qi(t));
}
var eo, ra, sa, ia;
function yi() {
  if (eo === void 0) {
    eo = window, ra = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    sa = Mn(t, "firstChild").get, ia = Mn(t, "nextSibling").get, Ki(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ki(n) && (n.__t = void 0);
  }
}
function Me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ye(e) {
  return (
    /** @type {TemplateNode | null} */
    sa.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
  return (
    /** @type {TemplateNode | null} */
    ia.call(e)
  );
}
function x(e, t) {
  if (!K)
    return /* @__PURE__ */ Ye(e);
  var n = /* @__PURE__ */ Ye(Y);
  if (n === null)
    n = Y.appendChild(Me());
  else if (t && n.nodeType !== Qr) {
    var r = Me();
    return n == null || n.before(r), Te(r), r;
  }
  return t && Os(
    /** @type {Text} */
    n
  ), Te(n), n;
}
function zt(e, t = !1) {
  if (!K) {
    var n = /* @__PURE__ */ Ye(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Rt(n) : n;
  }
  if (t) {
    if ((Y == null ? void 0 : Y.nodeType) !== Qr) {
      var r = Me();
      return Y == null || Y.before(r), Te(r), r;
    }
    Os(
      /** @type {Text} */
      Y
    );
  }
  return Y;
}
function C(e, t = 1, n = !1) {
  let r = K ? Y : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ Rt(r);
  if (!K)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== Qr) {
      var i = Me();
      return r === null ? s == null || s.after(i) : r.before(i), Te(i), i;
    }
    Os(
      /** @type {Text} */
      r
    );
  }
  return Te(r), r;
}
function qi(e) {
  e.textContent = "";
}
function oa() {
  return !1;
}
function Pi(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Ao, e, void 0)
  );
}
function Os(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === Qr; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function aa(e) {
  K && /* @__PURE__ */ Ye(e) !== null && qi(e);
}
let to = !1;
function la() {
  to || (to = !0, document.addEventListener(
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
function zs(e) {
  var t = G, n = J;
  it(null), At(null);
  try {
    return e();
  } finally {
    it(t), At(n);
  }
}
function ca(e, t, n, r = n) {
  e.addEventListener(t, () => zs(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), la();
}
function ac(e) {
  J === null && (G === null && Ll(), Il()), un && jl();
}
function lc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function jt(e, t, n) {
  var r = J;
  r !== null && (r.f & Xe) !== 0 && (e |= Xe);
  var s = {
    ctx: qe,
    deps: null,
    nodes: null,
    f: e | ke | rt,
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
      gr(s);
    } catch (a) {
      throw Ne(s), a;
    }
  else t !== null && dt(s);
  var i = s;
  if (n && i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
  (i.f & Bn) === 0 && (i = i.first, (e & Zt) !== 0 && (e & dr) !== 0 && i !== null && (i.f |= dr)), i !== null && (i.parent = r, r !== null && lc(i, r), G !== null && (G.f & xe) !== 0 && (e & dn) === 0)) {
    var o = (
      /** @type {Derived} */
      G
    );
    (o.effects ?? (o.effects = [])).push(i);
  }
  return s;
}
function Di() {
  return G !== null && !vt;
}
function Fi(e) {
  const t = jt(Ms, null, !1);
  return fe(t, be), t.teardown = e, t;
}
function xi(e) {
  ac();
  var t = (
    /** @type {Effect} */
    J.f
  ), n = !G && (t & gt) !== 0 && (t & _r) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      qe
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return fa(e);
}
function fa(e) {
  return jt(Br | $l, e, !1);
}
function cc(e) {
  Kt.ensure();
  const t = jt(dn | Bn, e, !0);
  return () => {
    Ne(t);
  };
}
function fc(e) {
  Kt.ensure();
  const t = jt(dn | Bn, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? Pn(t, () => {
      Ne(t), r(void 0);
    }) : (Ne(t), r(void 0));
  });
}
function Oi(e) {
  return jt(Br, e, !1);
}
function uc(e) {
  return jt(Ii | Bn, e, !0);
}
function Bs(e, t = 0) {
  return jt(Ms | t, e, !0);
}
function M(e, t = [], n = [], r = []) {
  Ql(r, t, n, (s) => {
    jt(Ms, () => e(...s.map(c)), !0);
  });
}
function zi(e, t = 0) {
  var n = jt(Zt | t, e, !0);
  return n;
}
function tt(e) {
  return jt(gt | Bn, e, !0);
}
function ua(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = un, r = G;
    no(!0), it(null);
    try {
      t.call(null);
    } finally {
      no(n), it(r);
    }
  }
}
function Bi(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && zs(() => {
      s.abort(Cn);
    });
    var r = n.next;
    (n.f & dn) !== 0 ? n.parent = null : Ne(n, t), n = r;
  }
}
function dc(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & gt) === 0 && Ne(t), t = n;
  }
}
function Ne(e, t = !0) {
  var n = !1;
  (t || (e.f & Io) !== 0) && e.nodes !== null && e.nodes.end !== null && (vc(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), Bi(e, t && !n), Hr(e, 0), fe(e, Xt);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  ua(e);
  var s = e.parent;
  s !== null && s.first !== null && da(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function vc(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Rt(e);
    e.remove(), e = n;
  }
}
function da(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Pn(e, t, n = !0) {
  var r = [];
  va(e, r, !0);
  var s = () => {
    n && Ne(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of r)
      a.out(o);
  } else
    s();
}
function va(e, t, n) {
  if ((e.f & Xe) === 0) {
    e.f ^= Xe;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & dr) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & gt) !== 0 && (e.f & Zt) !== 0;
      va(s, t, o ? n : !1), s = i;
    }
  }
}
function Ui(e) {
  pa(e, !0);
}
function pa(e, t) {
  if ((e.f & Xe) !== 0) {
    e.f ^= Xe, (e.f & be) === 0 && (fe(e, ke), dt(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & dr) !== 0 || (n.f & gt) !== 0;
      pa(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function ha(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ Rt(n);
      t.append(n), n = s;
    }
}
let ws = !1, un = !1;
function no(e) {
  un = e;
}
let G = null, vt = !1;
function it(e) {
  G = e;
}
let J = null;
function At(e) {
  J = e;
}
let st = null;
function ga(e) {
  G !== null && (st === null ? st = [e] : st.push(e));
}
let Le = null, Be = 0, Je = null;
function pc(e) {
  Je = e;
}
let ma = 1, An = 0, Dn = An;
function ro(e) {
  Dn = e;
}
function ba() {
  return ++ma;
}
function es(e) {
  var t = e.f;
  if ((t & ke) !== 0)
    return !0;
  if (t & xe && (e.f &= ~Fn), (t & ht) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (es(
        /** @type {Derived} */
        i
      ) && Jo(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & rt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    ye === null && fe(e, be);
  }
  return !1;
}
function _a(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(st !== null && ur.call(st, e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & xe) !== 0 ? _a(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? fe(i, ke) : (i.f & be) !== 0 && fe(i, ht), dt(
        /** @type {Effect} */
        i
      ));
    }
}
function wa(e) {
  var _;
  var t = Le, n = Be, r = Je, s = G, i = st, o = qe, a = vt, l = Dn, u = e.f;
  Le = /** @type {null | Value[]} */
  null, Be = 0, Je = null, G = (u & (gt | dn)) === 0 ? e : null, st = null, vr(e.ctx), vt = !1, Dn = ++An, e.ac !== null && (zs(() => {
    e.ac.abort(Cn);
  }), e.ac = null);
  try {
    e.f |= vi;
    var f = (
      /** @type {Function} */
      e.fn
    ), v = f();
    e.f |= _r;
    var d = e.deps, m = O == null ? void 0 : O.is_fork;
    if (Le !== null) {
      var b;
      if (m || Hr(e, Be), d !== null && Be > 0)
        for (d.length = Be + Le.length, b = 0; b < Le.length; b++)
          d[Be + b] = Le[b];
      else
        e.deps = d = Le;
      if (Di() && (e.f & rt) !== 0)
        for (b = Be; b < d.length; b++)
          ((_ = d[b]).reactions ?? (_.reactions = [])).push(e);
    } else !m && d !== null && Be < d.length && (Hr(e, Be), d.length = Be);
    if (Fo() && Je !== null && !vt && d !== null && (e.f & (xe | ht | ke)) === 0)
      for (b = 0; b < /** @type {Source[]} */
      Je.length; b++)
        _a(
          Je[b],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (An++, s.deps !== null)
        for (let h = 0; h < n; h += 1)
          s.deps[h].rv = An;
      if (t !== null)
        for (const h of t)
          h.rv = An;
      Je !== null && (r === null ? r = Je : r.push(.../** @type {Source[]} */
      Je));
    }
    return (e.f & cn) !== 0 && (e.f ^= cn), v;
  } catch (h) {
    return zo(h);
  } finally {
    e.f ^= vi, Le = t, Be = n, Je = r, G = s, st = i, vr(o), vt = a, Dn = l;
  }
}
function hc(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = yl.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & xe) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Le === null || !ur.call(Le, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & rt) !== 0 && (i.f ^= rt, i.f &= ~Fn), Li(i), sc(i), Hr(i, 0);
  }
}
function Hr(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      hc(e, n[r]);
}
function gr(e) {
  var t = e.f;
  if ((t & Xt) === 0) {
    fe(e, be);
    var n = J, r = ws;
    J = e, ws = !0;
    try {
      (t & (Zt | Ro)) !== 0 ? dc(e) : Bi(e), ua(e);
      var s = wa(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = ma;
      var i;
      di && Vl && (e.f & ke) !== 0 && e.deps;
    } finally {
      ws = r, J = n;
    }
  }
}
async function gc() {
  await Promise.resolve(), W();
}
function c(e) {
  var t = e.f, n = (t & xe) !== 0;
  if (G !== null && !vt) {
    var r = J !== null && (J.f & Xt) !== 0;
    if (!r && (st === null || !ur.call(st, e))) {
      var s = G.deps;
      if ((G.f & vi) !== 0)
        e.rv < An && (e.rv = An, Le === null && s !== null && s[Be] === e ? Be++ : Le === null ? Le = [e] : Le.push(e));
      else {
        (G.deps ?? (G.deps = [])).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [G] : ur.call(i, G) || i.push(G);
      }
    }
  }
  if (un && fn.has(e))
    return fn.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (un) {
      var a = o.v;
      return ((o.f & be) === 0 && o.reactions !== null || xa(o)) && (a = Mi(o)), fn.set(o, a), a;
    }
    var l = (o.f & rt) === 0 && !vt && G !== null && (ws || (G.f & rt) !== 0), u = (o.f & _r) === 0;
    es(o) && (l && (o.f |= rt), Jo(o)), l && !u && (Qo(o), ya(o));
  }
  if (ye != null && ye.has(e))
    return ye.get(e);
  if ((e.f & cn) !== 0)
    throw e.v;
  return e.v;
}
function ya(e) {
  if (e.f |= rt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & xe) !== 0 && (t.f & rt) === 0 && (Qo(
        /** @type {Derived} */
        t
      ), ya(
        /** @type {Derived} */
        t
      ));
}
function xa(e) {
  if (e.v === we) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (fn.has(t) || (t.f & xe) !== 0 && xa(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function yr(e) {
  var t = vt;
  try {
    return vt = !0, e();
  } finally {
    vt = t;
  }
}
const mc = ["touchstart", "touchmove"];
function bc(e) {
  return mc.includes(e);
}
const ys = Symbol("events"), ka = /* @__PURE__ */ new Set(), ki = /* @__PURE__ */ new Set();
function _c(e, t, n, r = {}) {
  function s(i) {
    if (r.capture || Ei.call(t, i), !i.cancelBubble)
      return zs(() => n == null ? void 0 : n.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? $t(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function wc(e, t, n, r, s) {
  var i = { capture: r, passive: s }, o = _c(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Fi(() => {
    t.removeEventListener(e, o, i);
  });
}
function ee(e, t, n) {
  (t[ys] ?? (t[ys] = {}))[e] = n;
}
function Us(e) {
  for (var t = 0; t < e.length; t++)
    ka.add(e[t]);
  for (var n of ki)
    n(e);
}
let so = null;
function Ei(e) {
  var h, w;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = ((h = e.composedPath) == null ? void 0 : h.call(e)) || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  so = e;
  var o = 0, a = so === e && e.__root;
  if (a) {
    var l = s.indexOf(a);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = s.indexOf(t);
    if (u === -1)
      return;
    l <= u && (o = l);
  }
  if (i = /** @type {Element} */
  s[o] || e.target, i !== t) {
    Cs(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var f = G, v = J;
    it(null), At(null);
    try {
      for (var d, m = []; i !== null; ) {
        var b = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var _ = (w = i[ys]) == null ? void 0 : w[r];
          _ != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && _.call(i, e);
        } catch (A) {
          d ? m.push(A) : d = A;
        }
        if (e.cancelBubble || b === t || b === null)
          break;
        i = b;
      }
      if (d) {
        for (let A of m)
          queueMicrotask(() => {
            throw A;
          });
        throw d;
      }
    } finally {
      e.__root = t, delete e.currentTarget, it(f), At(v);
    }
  }
}
var ko, Eo;
const ci = (Eo = (ko = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : ko.trustedTypes) == null ? void 0 : /* @__PURE__ */ Eo.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function yc(e) {
  return (
    /** @type {string} */
    (ci == null ? void 0 : ci.createHTML(e)) ?? e
  );
}
function Ea(e, t = !1) {
  var n = Pi("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? yc(e) : e, n.content;
}
function pt(e, t) {
  var n = (
    /** @type {Effect} */
    J
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var n = (t & $o) !== 0, r = (t & wl) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    if (K)
      return pt(Y, null), Y;
    s === void 0 && (s = Ea(i ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ Ye(s)));
    var o = (
      /** @type {TemplateNode} */
      r || ra ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(o)
      ), l = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      pt(a, l);
    } else
      pt(o, o);
    return o;
  };
}
// @__NO_SIDE_EFFECTS__
function xc(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & $o) !== 0, i = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
  return () => {
    if (K)
      return pt(Y, null), Y;
    if (!o) {
      var a = (
        /** @type {DocumentFragment} */
        Ea(i, !0)
      ), l = (
        /** @type {Element} */
        /* @__PURE__ */ Ye(a)
      );
      if (s)
        for (o = document.createDocumentFragment(); /* @__PURE__ */ Ye(l); )
          o.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ Ye(l)
          );
      else
        o = /** @type {Element} */
        /* @__PURE__ */ Ye(l);
    }
    var u = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    if (s) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(u)
      ), v = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      pt(f, v);
    } else
      pt(u, u);
    return u;
  };
}
// @__NO_SIDE_EFFECTS__
function ts(e, t) {
  return /* @__PURE__ */ xc(e, t, "svg");
}
function io(e = "") {
  if (!K) {
    var t = Me(e + "");
    return pt(t, t), t;
  }
  var n = Y;
  return n.nodeType !== Qr ? (n.before(n = Me()), Te(n)) : Os(
    /** @type {Text} */
    n
  ), pt(n, n), n;
}
function Dr() {
  if (K)
    return pt(Y, null), Y;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Me();
  return e.append(t, n), pt(t, n), e;
}
function S(e, t) {
  if (K) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      J
    );
    ((n.f & _r) === 0 || n.nodes.end === null) && (n.nodes.end = Y), Ps();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function V(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Sa(e, t) {
  return Ca(e, t);
}
function kc(e, t) {
  yi(), t.intro = t.intro ?? !1;
  const n = t.target, r = K, s = Y;
  try {
    for (var i = /* @__PURE__ */ Ye(n); i && (i.nodeType !== wr || /** @type {Comment} */
    i.data !== Ni); )
      i = /* @__PURE__ */ Rt(i);
    if (!i)
      throw fr;
    Gt(!0), Te(
      /** @type {Comment} */
      i
    );
    const o = Ca(e, { ...t, anchor: i });
    return Gt(!1), /**  @type {Exports} */
    o;
  } catch (o) {
    if (o instanceof Error && o.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw o;
    return o !== fr && console.warn("Failed to hydrate: ", o), t.recover === !1 && ql(), yi(), qi(n), Gt(!1), Sa(e, t);
  } finally {
    Gt(r), Te(s);
  }
}
const gs = /* @__PURE__ */ new Map();
function Ca(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: o = !0 }) {
  yi();
  var a = /* @__PURE__ */ new Set(), l = (v) => {
    for (var d = 0; d < v.length; d++) {
      var m = v[d];
      if (!a.has(m)) {
        a.add(m);
        var b = bc(m);
        for (const w of [t, document]) {
          var _ = gs.get(w);
          _ === void 0 && (_ = /* @__PURE__ */ new Map(), gs.set(w, _));
          var h = _.get(m);
          h === void 0 ? (w.addEventListener(m, Ei, { passive: b }), _.set(m, 1)) : _.set(m, h + 1);
        }
      }
    }
  };
  l(Ls(ka)), ki.add(l);
  var u = void 0, f = fc(() => {
    var v = n ?? t.appendChild(Me());
    return Zl(
      /** @type {TemplateNode} */
      v,
      {
        pending: () => {
        }
      },
      (d) => {
        vn({});
        var m = (
          /** @type {ComponentContext} */
          qe
        );
        if (i && (m.c = i), s && (r.$$events = s), K && pt(
          /** @type {TemplateNode} */
          d,
          null
        ), u = e(d, r) || {}, K && (J.nodes.end = Y, Y === null || Y.nodeType !== wr || /** @type {Comment} */
        Y.data !== Ri))
          throw qs(), fr;
        pn();
      }
    ), () => {
      var _;
      for (var d of a)
        for (const h of [t, document]) {
          var m = (
            /** @type {Map<string, number>} */
            gs.get(h)
          ), b = (
            /** @type {number} */
            m.get(d)
          );
          --b == 0 ? (h.removeEventListener(d, Ei), m.delete(d), m.size === 0 && gs.delete(h)) : m.set(d, b);
        }
      ki.delete(l), v !== n && ((_ = v.parentNode) == null || _.removeChild(v));
    };
  });
  return Si.set(u, f), u;
}
let Si = /* @__PURE__ */ new WeakMap();
function Ec(e, t) {
  const n = Si.get(e);
  return n ? (Si.delete(e), n(t)) : Promise.resolve();
}
var ft, St, He, Ln, Zr, Jr, js;
class Sc {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    ce(this, "anchor");
    /** @type {Map<Batch, Key>} */
    B(this, ft, /* @__PURE__ */ new Map());
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
    B(this, St, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    B(this, He, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    B(this, Ln, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    B(this, Zr, !0);
    B(this, Jr, () => {
      var t = (
        /** @type {Batch} */
        O
      );
      if (g(this, ft).has(t)) {
        var n = (
          /** @type {Key} */
          g(this, ft).get(t)
        ), r = g(this, St).get(n);
        if (r)
          Ui(r), g(this, Ln).delete(n);
        else {
          var s = g(this, He).get(n);
          s && (g(this, St).set(n, s.effect), g(this, He).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [i, o] of g(this, ft)) {
          if (g(this, ft).delete(i), i === t)
            break;
          const a = g(this, He).get(o);
          a && (Ne(a.effect), g(this, He).delete(o));
        }
        for (const [i, o] of g(this, St)) {
          if (i === n || g(this, Ln).has(i)) continue;
          const a = () => {
            if (Array.from(g(this, ft).values()).includes(i)) {
              var u = document.createDocumentFragment();
              ha(o, u), u.append(Me()), g(this, He).set(i, { effect: o, fragment: u });
            } else
              Ne(o);
            g(this, Ln).delete(i), g(this, St).delete(i);
          };
          g(this, Zr) || !r ? (g(this, Ln).add(i), Pn(o, a, !1)) : a();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    B(this, js, (t) => {
      g(this, ft).delete(t);
      const n = Array.from(g(this, ft).values());
      for (const [r, s] of g(this, He))
        n.includes(r) || (Ne(s.effect), g(this, He).delete(r));
    });
    this.anchor = t, P(this, Zr, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      O
    ), s = oa();
    if (n && !g(this, St).has(t) && !g(this, He).has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = Me();
        i.append(o), g(this, He).set(t, {
          effect: tt(() => n(o)),
          fragment: i
        });
      } else
        g(this, St).set(
          t,
          tt(() => n(this.anchor))
        );
    if (g(this, ft).set(r, t), s) {
      for (const [a, l] of g(this, St))
        a === t ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [a, l] of g(this, He))
        a === t ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(g(this, Jr)), r.ondiscard(g(this, js));
    } else
      K && (this.anchor = Y), g(this, Jr).call(this);
  }
}
ft = new WeakMap(), St = new WeakMap(), He = new WeakMap(), Ln = new WeakMap(), Zr = new WeakMap(), Jr = new WeakMap(), js = new WeakMap();
function $a(e) {
  qe === null && Mo(), xi(() => {
    const t = yr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Cc(e) {
  qe === null && Mo(), $a(() => () => yr(e));
}
function F(e, t, n = !1) {
  K && Ps();
  var r = new Sc(e), s = n ? dr : 0;
  function i(o, a) {
    if (K) {
      const f = qo(e);
      var l;
      if (f === Ni ? l = 0 : f === Is ? l = !1 : l = parseInt(f.substring(1)), o !== l) {
        var u = $s();
        Te(u), r.anchor = u, Gt(!1), r.ensure(o, a), Gt(!0);
        return;
      }
    }
    r.ensure(o, a);
  }
  zi(() => {
    var o = !1;
    t((a, l = 0) => {
      o = !0, i(l, a);
    }), o || i(!1, null);
  }, s);
}
function ut(e, t) {
  return t;
}
function $c(e, t, n) {
  for (var r = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let v = t[a];
    Pn(
      v,
      () => {
        if (i) {
          if (i.pending.delete(v), i.done.add(v), i.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Ci(Ls(i.done)), d.delete(i), d.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var l = r.length === 0 && n !== null;
    if (l) {
      var u = (
        /** @type {Element} */
        n
      ), f = (
        /** @type {Element} */
        u.parentNode
      );
      qi(f), f.append(u), e.items.clear();
    }
    Ci(t, !l);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(i);
}
function Ci(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    Ne(e[n], t);
}
var oo;
function Ve(e, t, n, r, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), l = (t & Co) !== 0;
  if (l) {
    var u = (
      /** @type {Element} */
      e
    );
    o = K ? Te(/* @__PURE__ */ Ye(u)) : u.appendChild(Me());
  }
  K && Ps();
  var f = null, v = /* @__PURE__ */ Zo(() => {
    var w = n();
    return ji(w) ? w : w == null ? [] : Ls(w);
  }), d, m = !0;
  function b() {
    h.fallback = f, Ac(h, d, o, t, r), f !== null && (d.length === 0 ? (f.f & Yt) === 0 ? Ui(f) : (f.f ^= Yt, Mr(f, null, o)) : Pn(f, () => {
      f = null;
    }));
  }
  var _ = zi(() => {
    d = /** @type {V[]} */
    c(v);
    var w = d.length;
    let A = !1;
    if (K) {
      var k = qo(o) === Is;
      k !== (w === 0) && (o = $s(), Te(o), Gt(!1), A = !0);
    }
    for (var j = /* @__PURE__ */ new Set(), R = (
      /** @type {Batch} */
      O
    ), L = oa(), q = 0; q < w; q += 1) {
      K && Y.nodeType === wr && /** @type {Comment} */
      Y.data === Ri && (o = /** @type {Comment} */
      Y, A = !0, Gt(!1));
      var te = d[q], ne = r(te, q), oe = m ? null : a.get(ne);
      oe ? (oe.v && hr(oe.v, te), oe.i && hr(oe.i, q), L && R.unskip_effect(oe.e)) : (oe = Tc(
        a,
        m ? o : oo ?? (oo = Me()),
        te,
        ne,
        q,
        s,
        t,
        n
      ), m || (oe.e.f |= Yt), a.set(ne, oe)), j.add(ne);
    }
    if (w === 0 && i && !f && (m ? f = tt(() => i(o)) : (f = tt(() => i(oo ?? (oo = Me()))), f.f |= Yt)), w > j.size && Rl(), K && w > 0 && Te($s()), !m)
      if (L) {
        for (const [Pe, Ee] of a)
          j.has(Pe) || R.skip_effect(Ee.e);
        R.oncommit(b), R.ondiscard(() => {
        });
      } else
        b();
    A && Gt(!0), c(v);
  }), h = { effect: _, items: a, outrogroups: null, fallback: f };
  m = !1, K && (o = Y);
}
function Ir(e) {
  for (; e !== null && (e.f & gt) === 0; )
    e = e.next;
  return e;
}
function Ac(e, t, n, r, s) {
  var oe, Pe, Ee, mt, ot, De, Jt, I, pe;
  var i = (r & pl) !== 0, o = t.length, a = e.items, l = Ir(e.effect.first), u, f = null, v, d = [], m = [], b, _, h, w;
  if (i)
    for (w = 0; w < o; w += 1)
      b = t[w], _ = s(b, w), h = /** @type {EachItem} */
      a.get(_).e, (h.f & Yt) === 0 && ((Pe = (oe = h.nodes) == null ? void 0 : oe.a) == null || Pe.measure(), (v ?? (v = /* @__PURE__ */ new Set())).add(h));
  for (w = 0; w < o; w += 1) {
    if (b = t[w], _ = s(b, w), h = /** @type {EachItem} */
    a.get(_).e, e.outrogroups !== null)
      for (const ae of e.outrogroups)
        ae.pending.delete(h), ae.done.delete(h);
    if ((h.f & Yt) !== 0)
      if (h.f ^= Yt, h === l)
        Mr(h, null, n);
      else {
        var A = f ? f.next : l;
        h === e.effect.last && (e.effect.last = h.prev), h.prev && (h.prev.next = h.next), h.next && (h.next.prev = h.prev), an(e, f, h), an(e, h, A), Mr(h, A, n), f = h, d = [], m = [], l = Ir(f.next);
        continue;
      }
    if ((h.f & Xe) !== 0 && (Ui(h), i && ((mt = (Ee = h.nodes) == null ? void 0 : Ee.a) == null || mt.unfix(), (v ?? (v = /* @__PURE__ */ new Set())).delete(h))), h !== l) {
      if (u !== void 0 && u.has(h)) {
        if (d.length < m.length) {
          var k = m[0], j;
          f = k.prev;
          var R = d[0], L = d[d.length - 1];
          for (j = 0; j < d.length; j += 1)
            Mr(d[j], k, n);
          for (j = 0; j < m.length; j += 1)
            u.delete(m[j]);
          an(e, R.prev, L.next), an(e, f, R), an(e, L, k), l = k, f = L, w -= 1, d = [], m = [];
        } else
          u.delete(h), Mr(h, l, n), an(e, h.prev, h.next), an(e, h, f === null ? e.effect.first : f.next), an(e, f, h), f = h;
        continue;
      }
      for (d = [], m = []; l !== null && l !== h; )
        (u ?? (u = /* @__PURE__ */ new Set())).add(l), m.push(l), l = Ir(l.next);
      if (l === null)
        continue;
    }
    (h.f & Yt) === 0 && d.push(h), f = h, l = Ir(h.next);
  }
  if (e.outrogroups !== null) {
    for (const ae of e.outrogroups)
      ae.pending.size === 0 && (Ci(Ls(ae.done)), (ot = e.outrogroups) == null || ot.delete(ae));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || u !== void 0) {
    var q = [];
    if (u !== void 0)
      for (h of u)
        (h.f & Xe) === 0 && q.push(h);
    for (; l !== null; )
      (l.f & Xe) === 0 && l !== e.fallback && q.push(l), l = Ir(l.next);
    var te = q.length;
    if (te > 0) {
      var ne = (r & Co) !== 0 && o === 0 ? n : null;
      if (i) {
        for (w = 0; w < te; w += 1)
          (Jt = (De = q[w].nodes) == null ? void 0 : De.a) == null || Jt.measure();
        for (w = 0; w < te; w += 1)
          (pe = (I = q[w].nodes) == null ? void 0 : I.a) == null || pe.fix();
      }
      $c(e, q, ne);
    }
  }
  i && $t(() => {
    var ae, at;
    if (v !== void 0)
      for (h of v)
        (at = (ae = h.nodes) == null ? void 0 : ae.a) == null || at.apply();
  });
}
function Tc(e, t, n, r, s, i, o, a) {
  var l = (o & dl) !== 0 ? (o & hl) === 0 ? /* @__PURE__ */ ta(n, !1, !1) : On(n) : null, u = (o & vl) !== 0 ? On(s) : null;
  return {
    v: l,
    i: u,
    e: tt(() => (i(t, l ?? n, u ?? s, a), () => {
      e.delete(r);
    }))
  };
}
function Mr(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & Yt) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Rt(r)
      );
      if (i.before(r), r === s)
        return;
      r = o;
    }
}
function an(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Un(e, t) {
  Oi(() => {
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
      const s = Pi("style");
      s.id = t.hash, s.textContent = t.code, r.appendChild(s);
    }
  });
}
const ao = [...` 	
\r\f \v\uFEFF`];
function Nc(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s in n)
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var i = s.length, o = 0; (o = r.indexOf(s, o)) >= 0; ) {
          var a = o + i;
          (o === 0 || ao.includes(r[o - 1])) && (a === r.length || ao.includes(r[a])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(a + 1) : o = a;
        }
  }
  return r === "" ? null : r;
}
function Rc(e, t) {
  return e == null ? null : String(e);
}
function We(e, t, n, r, s, i) {
  var o = e.__className;
  if (K || o !== n || o === void 0) {
    var a = Nc(n, r, i);
    (!K || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = n;
  } else if (i && s !== i)
    for (var l in i) {
      var u = !!i[l];
      (s == null || u !== !!s[l]) && e.classList.toggle(l, u);
    }
  return i;
}
function Fr(e, t, n, r) {
  var s = e.__style;
  if (K || s !== t) {
    var i = Rc(t);
    (!K || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  }
  return r;
}
function Aa(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ji(t))
      return Bl();
    for (var r of e.options)
      r.selected = t.includes(Or(r));
    return;
  }
  for (r of e.options) {
    var s = Or(r);
    if (oc(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function jc(e) {
  var t = new MutationObserver(() => {
    Aa(e, e.__value);
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
  }), Fi(() => {
    t.disconnect();
  });
}
function lo(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  ca(e, "change", (i) => {
    var o = i ? "[selected]" : ":checked", a;
    if (e.multiple)
      a = [].map.call(e.querySelectorAll(o), Or);
    else {
      var l = e.querySelector(o) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      a = l && Or(l);
    }
    n(a), O !== null && r.add(O);
  }), Oi(() => {
    var i = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        As ?? O
      );
      if (r.has(o))
        return;
    }
    if (Aa(e, i, s), s && i === void 0) {
      var a = e.querySelector(":checked");
      a !== null && (i = Or(a), n(i));
    }
    e.__value = i, s = !1;
  }), jc(e);
}
function Or(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ic = Symbol("is custom element"), Lc = Symbol("is html"), Mc = Tl ? "link" : "LINK";
function qc(e) {
  if (K) {
    var t = !1, n = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var r = e.value;
          me(e, "value", null), e.value = r;
        }
        if (e.hasAttribute("checked")) {
          var s = e.checked;
          me(e, "checked", null), e.checked = s;
        }
      }
    };
    e.__on_r = n, $t(n), la();
  }
}
function me(e, t, n, r) {
  var s = Pc(e);
  K && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Mc) || s[t] !== (s[t] = n) && (t === "loading" && (e[Al] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Dc(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Pc(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [Ic]: e.nodeName.includes("-"),
      [Lc]: e.namespaceURI === Ao
    })
  );
}
var co = /* @__PURE__ */ new Map();
function Dc(e) {
  var t = e.getAttribute("is") || e.nodeName, n = co.get(t);
  if (n) return n;
  co.set(t, n = []);
  for (var r, s = e, i = Element.prototype; i !== s; ) {
    r = xl(s);
    for (var o in r)
      r[o].set && n.push(o);
    s = To(s);
  }
  return n;
}
function $i(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  ca(e, "input", async (s) => {
    var i = s ? e.defaultValue : e.value;
    if (i = fi(e) ? ui(i) : i, n(i), O !== null && r.add(O), await gc(), i !== (i = t())) {
      var o = e.selectionStart, a = e.selectionEnd, l = e.value.length;
      if (e.value = i ?? "", a !== null) {
        var u = e.value.length;
        o === a && a === l && u > l ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = o, e.selectionEnd = Math.min(a, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (K && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  yr(t) == null && e.value) && (n(fi(e) ? ui(e.value) : e.value), O !== null && r.add(O)), Bs(() => {
    var s = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        As ?? O
      );
      if (r.has(i))
        return;
    }
    fi(e) && s === ui(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function fi(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function ui(e) {
  return e === "" ? null : +e;
}
function fo(e, t) {
  return e === t || (e == null ? void 0 : e[qn]) === t;
}
function Fc(e = {}, t, n, r) {
  return Oi(() => {
    var s, i;
    return Bs(() => {
      s = i, i = [], yr(() => {
        e !== n(...i) && (t(e, ...i), s && fo(n(...s), e) && t(null, ...s));
      });
    }), () => {
      $t(() => {
        i && fo(n(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
let ms = !1;
function Oc(e) {
  var t = ms;
  try {
    return ms = !1, [e(), ms];
  } finally {
    ms = t;
  }
}
function X(e, t, n, r) {
  var A;
  var s = (n & bl) !== 0, i = (n & _l) !== 0, o = (
    /** @type {V} */
    r
  ), a = !0, l = () => (a && (a = !1, o = i ? yr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), o), u;
  if (s) {
    var f = qn in e || Lo in e;
    u = ((A = Mn(e, t)) == null ? void 0 : A.set) ?? (f && t in e ? (k) => e[t] = k : void 0);
  }
  var v, d = !1;
  s ? [v, d] = Oc(() => (
    /** @type {V} */
    e[t]
  )) : v = /** @type {V} */
  e[t], v === void 0 && r !== void 0 && (v = l(), u && (Pl(), u(v)));
  var m;
  if (m = () => {
    var k = (
      /** @type {V} */
      e[t]
    );
    return k === void 0 ? l() : (a = !0, k);
  }, (n & ml) === 0)
    return m;
  if (u) {
    var b = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(k, j) {
        return arguments.length > 0 ? ((!j || b || d) && u(j ? m() : k), k) : m();
      })
    );
  }
  var _ = !1, h = ((n & gl) !== 0 ? Fs : Zo)(() => (_ = !1, m()));
  s && c(h);
  var w = (
    /** @type {Effect} */
    J
  );
  return (
    /** @type {() => V} */
    (function(k, j) {
      if (arguments.length > 0) {
        const R = j ? c(h) : s ? Ge(k) : k;
        return E(h, R), _ = !0, o !== void 0 && (o = R), k;
      }
      return un && _ || (w.f & Xt) !== 0 ? h.v : c(h);
    })
  );
}
function zc(e) {
  return new Bc(e);
}
var Wt, et;
class Bc {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    B(this, Wt);
    /** @type {Record<string, any>} */
    B(this, et);
    var i;
    var n = /* @__PURE__ */ new Map(), r = (o, a) => {
      var l = /* @__PURE__ */ ta(a, !1, !1);
      return n.set(o, l), l;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(o, a) {
          return c(n.get(a) ?? r(a, Reflect.get(o, a)));
        },
        has(o, a) {
          return a === Lo ? !0 : (c(n.get(a) ?? r(a, Reflect.get(o, a))), Reflect.has(o, a));
        },
        set(o, a, l) {
          return E(n.get(a) ?? r(a, l), l), Reflect.set(o, a, l);
        }
      }
    );
    P(this, et, (t.hydrate ? kc : Sa)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((i = t == null ? void 0 : t.props) != null && i.$$host) || t.sync === !1) && W(), P(this, Wt, s.$$events);
    for (const o of Object.keys(g(this, et)))
      o === "$set" || o === "$destroy" || o === "$on" || Cs(this, o, {
        get() {
          return g(this, et)[o];
        },
        /** @param {any} value */
        set(a) {
          g(this, et)[o] = a;
        },
        enumerable: !0
      });
    g(this, et).$set = /** @param {Record<string, any>} next */
    (o) => {
      Object.assign(s, o);
    }, g(this, et).$destroy = () => {
      Ec(g(this, et));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    g(this, et).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    g(this, Wt)[t] = g(this, Wt)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return g(this, Wt)[t].push(r), () => {
      g(this, Wt)[t] = g(this, Wt)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    g(this, et).$destroy();
  }
}
Wt = new WeakMap(), et = new WeakMap();
let Ta;
typeof HTMLElement == "function" && (Ta = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {ShadowRootInit | undefined} shadow_root_init
   */
  constructor(t, n, r) {
    super();
    /** The Svelte component constructor */
    ce(this, "$$ctor");
    /** Slots */
    ce(this, "$$s");
    /** @type {any} The Svelte component instance */
    ce(this, "$$c");
    /** Whether or not the custom element is connected */
    ce(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    ce(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    ce(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    ce(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    ce(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    ce(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    ce(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    ce(this, "$$shadowRoot", null);
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
          const o = Pi("slot");
          s !== "default" && (o.name = s), S(i, o);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = Uc(this);
      for (const s of this.$$s)
        s in r && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const i = this.$$g_p(s.name);
        i in this.$$d || (this.$$d[i] = xs(i, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = zc({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = cc(() => {
        Bs(() => {
          var s;
          this.$$r = !0;
          for (const i of Ss(this.$$c)) {
            if (!((s = this.$$p_d[i]) != null && s.reflect)) continue;
            this.$$d[i] = this.$$c[i];
            const o = xs(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = xs(t, r, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return Ss(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function xs(e, t, n, r) {
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
function Uc(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Hn(e, t, n, r, s, i) {
  let o = class extends Ta {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Ss(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return Ss(t).forEach((a) => {
    Cs(o.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(l) {
        var v;
        l = xs(a, l, t), this.$$d[a] = l;
        var u = this.$$c;
        if (u) {
          var f = (v = Mn(u, a)) == null ? void 0 : v.get;
          f ? u[a] = l : u.$set({ [a]: l });
        }
      }
    });
  }), r.forEach((a) => {
    Cs(o.prototype, a, {
      get() {
        var l;
        return (l = this.$$c) == null ? void 0 : l[a];
      }
    });
  }), e.element = /** @type {any} */
  o, o;
}
const Lr = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, Hc = [
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
], Vc = "[REDACTED]";
function Wc(e) {
  let t = e;
  for (const n of Hc)
    n.lastIndex = 0, t = t.replace(n, Vc);
  return t;
}
let Na = 50;
const ks = [];
let Ts = !1;
const nt = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function Yc(e) {
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
function Gc() {
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
function er(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = Wc(t.map(Yc).join(" ")), i = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(i, Gc()), i;
}
function tr(e) {
  for (ks.push(e); ks.length > Na; )
    ks.shift();
}
function Xc(e) {
  Ts || (Ts = !0, e && (Na = e), console.log = (...t) => {
    nt.log(...t), tr(er("log", t, !1));
  }, console.error = (...t) => {
    nt.error(...t), tr(er("error", t, !0));
  }, console.warn = (...t) => {
    nt.warn(...t), tr(er("warn", t, !0));
  }, console.info = (...t) => {
    nt.info(...t), tr(er("info", t, !1));
  }, console.debug = (...t) => {
    nt.debug(...t), tr(er("debug", t, !1));
  }, console.trace = (...t) => {
    nt.trace(...t), tr(er("trace", t, !0));
  });
}
function Kc() {
  Ts && (Ts = !1, console.log = nt.log, console.error = nt.error, console.warn = nt.warn, console.info = nt.info, console.debug = nt.debug, console.trace = nt.trace);
}
function Zc() {
  return [...ks];
}
function Ra(e) {
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
      return Ra(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    i.nodeType === 1 && i.tagName === e.tagName && t++;
  }
  return "";
}
function Jc(e) {
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
      const l = n.className.split(/\s+/).filter(
        (u) => u && !u.match(/^(ng-|v-|svelte-|css-|_|js-|is-|has-)/) && !u.match(/^\d/) && u.length > 1
      );
      l.length > 0 && (s += "." + l.slice(0, 2).map((u) => CSS.escape(u)).join("."));
    }
    const i = ["data-testid", "data-id", "data-name", "name", "role", "aria-label"];
    for (const l of i) {
      const u = n.getAttribute(l);
      if (u) {
        s += `[${l}="${CSS.escape(u)}"]`;
        break;
      }
    }
    const o = n.parentElement;
    if (o) {
      const l = Array.from(o.children).filter((u) => u.tagName === n.tagName);
      if (l.length > 1) {
        const u = l.indexOf(n) + 1;
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
  return Qc(e);
}
function Qc(e) {
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
let zn = !1, ja = "", Ct = null, Es = null, Hi = null;
function ef() {
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
function tf() {
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
function Ia(e) {
  if (!zn || !Ct) return;
  const t = e.target;
  if (t === Ct || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  Ct.style.top = `${n.top}px`, Ct.style.left = `${n.left}px`, Ct.style.width = `${n.width}px`, Ct.style.height = `${n.height}px`;
}
function La(e) {
  var i;
  if (!zn) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = Hi;
  Pa();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((i = t.textContent) == null ? void 0 : i.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((o, a) => (o[a.name] = a.value, o), {}),
    xpath: Ra(t),
    selector: Jc(t),
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
function Ma(e) {
  e.key === "Escape" && Pa();
}
function qa(e) {
  zn || (zn = !0, Hi = e, ja = document.body.style.cursor, document.body.style.cursor = "crosshair", Ct = ef(), Es = tf(), document.addEventListener("mousemove", Ia, !0), document.addEventListener("click", La, !0), document.addEventListener("keydown", Ma, !0));
}
function Pa() {
  zn && (zn = !1, Hi = null, document.body.style.cursor = ja, Ct && (Ct.remove(), Ct = null), Es && (Es.remove(), Es = null), document.removeEventListener("mousemove", Ia, !0), document.removeEventListener("click", La, !0), document.removeEventListener("keydown", Ma, !0));
}
function nf() {
  return zn;
}
async function Da(e, t) {
  const n = `${e.replace(/\/$/, "")}/api/feedback/report`, r = await fetch(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), s = await r.json();
  return r.ok ? { ok: !0, id: s.id } : { ok: !1, error: s.error || `HTTP ${r.status}` };
}
async function rf(e) {
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
async function sf(e, t, n, r, s) {
  try {
    const i = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, o = { response: n };
    r && (o.reason = r), s != null && s.screenshots && s.screenshots.length > 0 && (o.screenshots = s.screenshots), s != null && s.elements && s.elements.length > 0 && (o.elements = s.elements);
    const a = await fetch(i, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o)
    }), l = await a.json();
    return a.ok ? { ok: !0 } : { ok: !1, error: l.error || `HTTP ${a.status}` };
  } catch (i) {
    return { ok: !1, error: i instanceof Error ? i.message : "Failed to respond" };
  }
}
const Fa = "jat-feedback-queue", of = 50, af = 3e4;
let zr = null;
function Oa() {
  try {
    const e = localStorage.getItem(Fa);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function za(e) {
  try {
    localStorage.setItem(Fa, JSON.stringify(e));
  } catch {
  }
}
function uo(e, t) {
  const n = Oa();
  for (n.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); n.length > of; )
    n.shift();
  za(n);
}
async function vo() {
  const e = Oa();
  if (e.length === 0) return;
  const t = [];
  for (const n of e)
    try {
      (await Da(n.endpoint, n.report)).ok || (n.attempts++, t.push(n));
    } catch {
      n.attempts++, t.push(n);
    }
  za(t);
}
function lf() {
  zr || (vo(), zr = setInterval(vo, af));
}
function cf() {
  zr && (clearInterval(zr), zr = null);
}
var ff = /* @__PURE__ */ ts('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), uf = /* @__PURE__ */ ts('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), df = /* @__PURE__ */ N("<button><!></button>");
const vf = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function Ba(e, t) {
  vn(t, !0), Un(e, vf);
  let n = X(t, "onclick", 7), r = X(t, "open", 7, !1);
  var s = {
    get onclick() {
      return n();
    },
    set onclick(f) {
      n(f), W();
    },
    get open() {
      return r();
    },
    set open(f = !1) {
      r(f), W();
    }
  }, i = df();
  let o;
  var a = x(i);
  {
    var l = (f) => {
      var v = ff();
      S(f, v);
    }, u = (f) => {
      var v = uf();
      S(f, v);
    };
    F(a, (f) => {
      r() ? f(l) : f(u, !1);
    });
  }
  return y(i), M(() => {
    o = We(i, 1, "jat-fb-btn svelte-joatup", null, o, { open: r() }), me(i, "aria-label", r() ? "Close feedback" : "Send feedback"), me(i, "title", r() ? "Close feedback" : "Send feedback");
  }), ee("click", i, function(...f) {
    var v;
    (v = n()) == null || v.apply(this, f);
  }), S(e, i), pn(s);
}
Us(["click"]);
Hn(Ba, { onclick: {}, open: {} }, [], [], { mode: "open" });
const Ua = "[modern-screenshot]", mr = typeof window < "u", pf = mr && "Worker" in window;
var So;
const Vi = mr ? (So = window.navigator) == null ? void 0 : So.userAgent : "", Ha = Vi.includes("Chrome"), Ns = Vi.includes("AppleWebKit") && !Ha, Wi = Vi.includes("Firefox"), hf = (e) => e && "__CONTEXT__" in e, gf = (e) => e.constructor.name === "CSSFontFaceRule", mf = (e) => e.constructor.name === "CSSImportRule", bf = (e) => e.constructor.name === "CSSLayerBlockRule", Tt = (e) => e.nodeType === 1, ns = (e) => typeof e.className == "object", Va = (e) => e.tagName === "image", _f = (e) => e.tagName === "use", Vr = (e) => Tt(e) && typeof e.style < "u" && !ns(e), wf = (e) => e.nodeType === 8, yf = (e) => e.nodeType === 3, br = (e) => e.tagName === "IMG", Hs = (e) => e.tagName === "VIDEO", xf = (e) => e.tagName === "CANVAS", kf = (e) => e.tagName === "TEXTAREA", Ef = (e) => e.tagName === "INPUT", Sf = (e) => e.tagName === "STYLE", Cf = (e) => e.tagName === "SCRIPT", $f = (e) => e.tagName === "SELECT", Af = (e) => e.tagName === "SLOT", Tf = (e) => e.tagName === "IFRAME", Nf = (...e) => console.warn(Ua, ...e);
function Rf(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Ai = (e) => e.startsWith("data:");
function Wa(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (mr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !mr)
    return e;
  const n = Vs().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function Vs(e) {
  return (e && Tt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Ws = "http://www.w3.org/2000/svg";
function jf(e, t, n) {
  const r = Vs(n).createElementNS(Ws, "svg");
  return r.setAttributeNS(null, "width", e.toString()), r.setAttributeNS(null, "height", t.toString()), r.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), r;
}
function If(e, t) {
  let n = new XMLSerializer().serializeToString(e);
  return t && (n = n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`;
}
function Lf(e, t) {
  return new Promise((n, r) => {
    const s = new FileReader();
    s.onload = () => n(s.result), s.onerror = () => r(s.error), s.onabort = () => r(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const Mf = (e) => Lf(e, "dataUrl");
function nr(e, t) {
  const n = Vs(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function Wr(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: i, onWarn: o } = t ?? {}, a = typeof e == "string" ? nr(e, Vs(s)) : e;
    let l = null, u = null;
    function f() {
      n(a), l && clearTimeout(l), u == null || u();
    }
    if (r && (l = setTimeout(f, r)), Hs(a)) {
      const v = a.currentSrc || a.src;
      if (!v)
        return a.poster ? Wr(a.poster, t).then(n) : f();
      if (a.readyState >= 2)
        return f();
      const d = f, m = (b) => {
        o == null || o(
          "Failed video load",
          v,
          b
        ), i == null || i(b), f();
      };
      u = () => {
        a.removeEventListener("loadeddata", d), a.removeEventListener("error", m);
      }, a.addEventListener("loadeddata", d, { once: !0 }), a.addEventListener("error", m, { once: !0 });
    } else {
      const v = Va(a) ? a.href.baseVal : a.currentSrc || a.src;
      if (!v)
        return f();
      const d = async () => {
        if (br(a) && "decode" in a)
          try {
            await a.decode();
          } catch (b) {
            o == null || o(
              "Failed to decode image, trying to render anyway",
              a.dataset.originalSrc || v,
              b
            );
          }
        f();
      }, m = (b) => {
        o == null || o(
          "Failed image load",
          a.dataset.originalSrc || v,
          b
        ), f();
      };
      if (br(a) && a.complete)
        return d();
      u = () => {
        a.removeEventListener("load", d), a.removeEventListener("error", m);
      }, a.addEventListener("load", d, { once: !0 }), a.addEventListener("error", m, { once: !0 });
    }
  });
}
async function qf(e, t) {
  Vr(e) && (br(e) || Hs(e) ? await Wr(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => Wr(r, t)))
  ));
}
const Ya = /* @__PURE__ */ (function() {
  let t = 0;
  const n = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${n()}${t}`);
})();
function Ga(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let po = 0;
function Pf(e) {
  const t = `${Ua}[#${po}]`;
  return po++, {
    // eslint-disable-next-line no-console
    time: (n) => e && console.time(`${t} ${n}`),
    // eslint-disable-next-line no-console
    timeEnd: (n) => e && console.timeEnd(`${t} ${n}`),
    warn: (...n) => e && Nf(...n)
  };
}
function Df(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Xa(e, t) {
  return hf(e) ? e : Ff(e, { ...t, autoDestruct: !0 });
}
async function Ff(e, t) {
  var m, b;
  const { scale: n = 1, workerUrl: r, workerNumber: s = 1 } = t || {}, i = !!(t != null && t.debug), o = (t == null ? void 0 : t.features) ?? !0, a = e.ownerDocument ?? (mr ? window.document : void 0), l = ((m = e.ownerDocument) == null ? void 0 : m.defaultView) ?? (mr ? window : void 0), u = /* @__PURE__ */ new Map(), f = {
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
      requestInit: Df((b = t == null ? void 0 : t.fetch) == null ? void 0 : b.bypassingCache),
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
    log: Pf(i),
    node: e,
    ownerDocument: a,
    ownerWindow: l,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: Ka(a),
    svgDefsElement: a == null ? void 0 : a.createElementNS(Ws, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: pf && r && s ? s : 0
      })
    ].map(() => {
      try {
        const _ = new Worker(r);
        return _.onmessage = async (h) => {
          var k, j, R, L;
          const { url: w, result: A } = h.data;
          A ? (j = (k = u.get(w)) == null ? void 0 : k.resolve) == null || j.call(k, A) : (L = (R = u.get(w)) == null ? void 0 : R.reject) == null || L.call(R, new Error(`Error receiving message from worker: ${w}`));
        }, _.onmessageerror = (h) => {
          var A, k;
          const { url: w } = h.data;
          (k = (A = u.get(w)) == null ? void 0 : A.reject) == null || k.call(A, new Error(`Error receiving message from worker: ${w}`));
        }, _;
      } catch (_) {
        return f.log.warn("Failed to new Worker", _), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Rf(a) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: u,
    drawImageCount: 0,
    tasks: [],
    features: o,
    isEnable: (_) => _ === "restoreScrollPosition" ? typeof o == "boolean" ? !1 : o[_] ?? !1 : typeof o == "boolean" ? o : o[_] ?? !0,
    shadowRoots: []
  };
  f.log.time("wait until load"), await qf(e, { timeout: f.timeout, onWarn: f.log.warn }), f.log.timeEnd("wait until load");
  const { width: v, height: d } = Of(e, f);
  return f.width = v, f.height = d, f;
}
function Ka(e) {
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
function Of(e, t) {
  let { width: n, height: r } = t;
  if (Tt(e) && (!n || !r)) {
    const s = e.getBoundingClientRect();
    n = n || s.width || Number(e.getAttribute("width")) || 0, r = r || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: n, height: r };
}
async function zf(e, t) {
  const {
    log: n,
    timeout: r,
    drawImageCount: s,
    drawImageInterval: i
  } = t;
  n.time("image to canvas");
  const o = await Wr(e, { timeout: r, onWarn: t.log.warn }), { canvas: a, context2d: l } = Bf(e.ownerDocument, t), u = () => {
    try {
      l == null || l.drawImage(o, 0, 0, a.width, a.height);
    } catch (f) {
      t.log.warn("Failed to drawImage", f);
    }
  };
  if (u(), t.isEnable("fixSvgXmlDecode"))
    for (let f = 0; f < s; f++)
      await new Promise((v) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, a.width, a.height), u(), v();
        }, f + i);
      });
  return t.drawImageCount = 0, n.timeEnd("image to canvas"), a;
}
function Bf(e, t) {
  const { width: n, height: r, scale: s, backgroundColor: i, maximumCanvasSize: o } = t, a = e.createElement("canvas");
  a.width = Math.floor(n * s), a.height = Math.floor(r * s), a.style.width = `${n}px`, a.style.height = `${r}px`, o && (a.width > o || a.height > o) && (a.width > o && a.height > o ? a.width > a.height ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o) : a.width > o ? (a.height *= o / a.width, a.width = o) : (a.width *= o / a.height, a.height = o));
  const l = a.getContext("2d");
  return l && i && (l.fillStyle = i, l.fillRect(0, 0, a.width, a.height)), { canvas: a, context2d: l };
}
function Za(e, t) {
  if (e.ownerDocument)
    try {
      const i = e.toDataURL();
      if (i !== "data:,")
        return nr(i, e.ownerDocument);
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
function Uf(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return Yi(e.contentDocument.body, t);
  } catch (r) {
    t.log.warn("Failed to clone iframe", r);
  }
  return e.cloneNode(!1);
}
function Hf(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Vf(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return nr(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await Wr(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? nr(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((o) => {
      n.addEventListener("seeked", o, { once: !0 });
    });
    const i = r.createElement("canvas");
    i.width = e.offsetWidth, i.height = e.offsetHeight;
    try {
      const o = i.getContext("2d");
      o && o.drawImage(n, 0, 0, i.width, i.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? nr(e.poster, e.ownerDocument) : n;
    }
    return Za(i, t);
  }
  return n;
}
function Wf(e, t) {
  return xf(e) ? Za(e, t) : Tf(e) ? Uf(e, t) : br(e) ? Hf(e) : Hs(e) ? Vf(e, t) : e.cloneNode(!1);
}
function Yf(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: n } = e;
    try {
      n && (t = n.createElement("iframe"), t.id = `__SANDBOX__${Ya()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", n.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (r) {
      e.log.warn("Failed to getSandBox", r);
    }
  }
  return t;
}
const Gf = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Xf = [
  "stroke",
  "fill"
];
function Ja(e, t, n) {
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), i = ns(e) && s !== "svg", o = i ? Xf.map((_) => [_, e.getAttribute(_)]).filter(([, _]) => _ !== null) : [], a = [
    i && "svg",
    s,
    o.map((_, h) => `${_}=${h}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(a))
    return r.get(a);
  const l = Yf(n), u = l == null ? void 0 : l.contentWindow;
  if (!u)
    return /* @__PURE__ */ new Map();
  const f = u == null ? void 0 : u.document;
  let v, d;
  i ? (v = f.createElementNS(Ws, "svg"), d = v.ownerDocument.createElementNS(v.namespaceURI, s), o.forEach(([_, h]) => {
    d.setAttributeNS(null, _, h);
  }), v.appendChild(d)) : v = d = f.createElement(s), d.textContent = " ", f.body.appendChild(v);
  const m = u.getComputedStyle(d, t), b = /* @__PURE__ */ new Map();
  for (let _ = m.length, h = 0; h < _; h++) {
    const w = m.item(h);
    Gf.includes(w) || b.set(w, m.getPropertyValue(w));
  }
  return f.body.removeChild(v), r.set(a, b), b;
}
function Qa(e, t, n) {
  var a;
  const r = /* @__PURE__ */ new Map(), s = [], i = /* @__PURE__ */ new Map();
  if (n)
    for (const l of n)
      o(l);
  else
    for (let l = e.length, u = 0; u < l; u++) {
      const f = e.item(u);
      o(f);
    }
  for (let l = s.length, u = 0; u < l; u++)
    (a = i.get(s[u])) == null || a.forEach((f, v) => r.set(v, f));
  function o(l) {
    const u = e.getPropertyValue(l), f = e.getPropertyPriority(l), v = l.lastIndexOf("-"), d = v > -1 ? l.substring(0, v) : void 0;
    if (d) {
      let m = i.get(d);
      m || (m = /* @__PURE__ */ new Map(), i.set(d, m)), m.set(l, [u, f]);
    }
    t.get(l) === u && !f || (d ? s.push(d) : r.set(l, [u, f]));
  }
  return r;
}
function Kf(e, t, n, r) {
  var v, d, m, b;
  const { ownerWindow: s, includeStyleProperties: i, currentParentNodeStyle: o } = r, a = t.style, l = s.getComputedStyle(e), u = Ja(e, null, r);
  o == null || o.forEach((_, h) => {
    u.delete(h);
  });
  const f = Qa(l, u, i);
  f.delete("transition-property"), f.delete("all"), f.delete("d"), f.delete("content"), n && (f.delete("margin-top"), f.delete("margin-right"), f.delete("margin-bottom"), f.delete("margin-left"), f.delete("margin-block-start"), f.delete("margin-block-end"), f.delete("margin-inline-start"), f.delete("margin-inline-end"), f.set("box-sizing", ["border-box", ""])), ((v = f.get("background-clip")) == null ? void 0 : v[0]) === "text" && t.classList.add("______background-clip--text"), Ha && (f.has("font-kerning") || f.set("font-kerning", ["normal", ""]), (((d = f.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((m = f.get("overflow-y")) == null ? void 0 : m[0]) === "hidden") && ((b = f.get("text-overflow")) == null ? void 0 : b[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && f.set("text-overflow", ["clip", ""]));
  for (let _ = a.length, h = 0; h < _; h++)
    a.removeProperty(a.item(h));
  return f.forEach(([_, h], w) => {
    a.setProperty(w, _, h);
  }), f;
}
function Zf(e, t) {
  (kf(e) || Ef(e) || $f(e)) && t.setAttribute("value", e.value);
}
const Jf = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Qf = [
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
function eu(e, t, n, r, s) {
  const { ownerWindow: i, svgStyleElement: o, svgStyles: a, currentNodeStyle: l } = r;
  if (!o || !i)
    return;
  function u(f) {
    var k;
    const v = i.getComputedStyle(e, f);
    let d = v.getPropertyValue("content");
    if (!d || d === "none")
      return;
    s == null || s(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const m = [Ya()], b = Ja(e, f, r);
    l == null || l.forEach((j, R) => {
      b.delete(R);
    });
    const _ = Qa(v, b, r.includeStyleProperties);
    _.delete("content"), _.delete("-webkit-locale"), ((k = _.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const h = [
      `content: '${d}';`
    ];
    if (_.forEach(([j, R], L) => {
      h.push(`${L}: ${j}${R ? " !important" : ""};`);
    }), h.length === 1)
      return;
    try {
      t.className = [t.className, ...m].join(" ");
    } catch (j) {
      r.log.warn("Failed to copyPseudoClass", j);
      return;
    }
    const w = h.join(`
  `);
    let A = a.get(w);
    A || (A = [], a.set(w, A)), A.push(`.${m[0]}${f}`);
  }
  Jf.forEach(u), n && Qf.forEach(u);
}
const ho = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function go(e, t, n, r, s) {
  if (Tt(n) && (Sf(n) || Cf(n)) || r.filter && !r.filter(n))
    return;
  ho.has(t.nodeName) || ho.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const i = await Yi(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && tu(e, i), t.appendChild(i);
}
async function mo(e, t, n, r) {
  var i;
  let s = e.firstChild;
  Tt(e) && e.shadowRoot && (s = (i = e.shadowRoot) == null ? void 0 : i.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let o = s; o; o = o.nextSibling)
    if (!wf(o))
      if (Tt(o) && Af(o) && typeof o.assignedNodes == "function") {
        const a = o.assignedNodes();
        for (let l = 0; l < a.length; l++)
          await go(e, t, a[l], n, r);
      } else
        await go(e, t, o, n, r);
}
function tu(e, t) {
  if (!Vr(e) || !Vr(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, i = new DOMMatrix(s), { a: o, b: a, c: l, d: u } = i;
  i.a = 1, i.b = 0, i.c = 0, i.d = 1, i.translateSelf(-r, -n), i.a = o, i.b = a, i.c = l, i.d = u, t.style.transform = i.toString();
}
function nu(e, t) {
  const { backgroundColor: n, width: r, height: s, style: i } = t, o = e.style;
  if (n && o.setProperty("background-color", n, "important"), r && o.setProperty("width", `${r}px`, "important"), s && o.setProperty("height", `${s}px`, "important"), i)
    for (const a in i) o[a] = i[a];
}
const ru = /^[\w-:]+$/;
async function Yi(e, t, n = !1, r) {
  var u, f, v, d;
  const { ownerDocument: s, ownerWindow: i, fontFamilies: o, onCloneEachNode: a } = t;
  if (s && yf(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && i && Tt(e) && (Vr(e) || ns(e))) {
    const m = await Wf(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = m.getAttributeNames();
      for (let j = k.length, R = 0; R < j; R++) {
        const L = k[R];
        ru.test(L) || m.removeAttribute(L);
      }
    }
    const b = t.currentNodeStyle = Kf(e, m, n, t);
    n && nu(m, t);
    let _ = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (u = b.get("overflow-x")) == null ? void 0 : u[0],
        (f = b.get("overflow-y")) == null ? void 0 : f[0]
      ];
      _ = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const h = (v = b.get("text-transform")) == null ? void 0 : v[0], w = Ga((d = b.get("font-family")) == null ? void 0 : d[0]), A = w ? (k) => {
      h === "uppercase" ? k = k.toUpperCase() : h === "lowercase" ? k = k.toLowerCase() : h === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), w.forEach((j) => {
        let R = o.get(j);
        R || o.set(j, R = /* @__PURE__ */ new Set()), k.split("").forEach((L) => R.add(L));
      });
    } : void 0;
    return eu(
      e,
      m,
      _,
      t,
      A
    ), Zf(e, m), Hs(e) || await mo(
      e,
      m,
      t,
      A
    ), await (a == null ? void 0 : a(m)), m;
  }
  const l = e.cloneNode(!1);
  return await mo(e, l, t), await (a == null ? void 0 : a(l)), l;
}
function su(e) {
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
function iu(e) {
  const { url: t, timeout: n, responseType: r, ...s } = e, i = new AbortController(), o = n ? setTimeout(() => i.abort(), n) : void 0;
  return fetch(t, { signal: i.signal, ...s }).then((a) => {
    if (!a.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: a });
    switch (r) {
      case "arrayBuffer":
        return a.arrayBuffer();
      case "dataUrl":
        return a.blob().then(Mf);
      case "text":
      default:
        return a.text();
    }
  }).finally(() => clearTimeout(o));
}
function Yr(e, t) {
  const { url: n, requestType: r = "text", responseType: s = "text", imageDom: i } = t;
  let o = n;
  const {
    timeout: a,
    acceptOfImage: l,
    requests: u,
    fetchFn: f,
    fetch: {
      requestInit: v,
      bypassingCache: d,
      placeholderImage: m
    },
    font: b,
    workers: _,
    fontFamilies: h
  } = e;
  r === "image" && (Ns || Wi) && e.drawImageCount++;
  let w = u.get(n);
  if (!w) {
    d && d instanceof RegExp && d.test(o) && (o += (/\?/.test(o) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const A = r.startsWith("font") && b && b.minify, k = /* @__PURE__ */ new Set();
    A && r.split(";")[1].split(",").forEach((q) => {
      h.has(q) && h.get(q).forEach((te) => k.add(te));
    });
    const j = A && k.size, R = {
      url: o,
      timeout: a,
      responseType: j ? "arrayBuffer" : s,
      headers: r === "image" ? { accept: l } : void 0,
      ...v
    };
    w = {
      type: r,
      resolve: void 0,
      reject: void 0,
      response: null
    }, w.response = (async () => {
      if (f && r === "image") {
        const L = await f(n);
        if (L)
          return L;
      }
      return !Ns && n.startsWith("http") && _.length ? new Promise((L, q) => {
        _[u.size & _.length - 1].postMessage({ rawUrl: n, ...R }), w.resolve = L, w.reject = q;
      }) : iu(R);
    })().catch((L) => {
      if (u.delete(n), r === "image" && m)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof m == "string" ? m : m(i);
      throw L;
    }), u.set(n, w);
  }
  return w.response;
}
async function el(e, t, n, r) {
  if (!tl(e))
    return e;
  for (const [s, i] of ou(e, t))
    try {
      const o = await Yr(
        n,
        {
          url: i,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(au(s), `$1${o}$3`);
    } catch (o) {
      n.log.warn("Failed to fetch css data url", s, o);
    }
  return e;
}
function tl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const nl = /url\((['"]?)([^'"]+?)\1\)/g;
function ou(e, t) {
  const n = [];
  return e.replace(nl, (r, s, i) => (n.push([i, Wa(i, t)]), r)), n.filter(([r]) => !Ai(r));
}
function au(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const lu = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function cu(e, t) {
  return lu.map((n) => {
    const r = e.getPropertyValue(n);
    return !r || r === "none" ? null : ((Ns || Wi) && t.drawImageCount++, el(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function fu(e, t) {
  if (br(e)) {
    const n = e.currentSrc || e.src;
    if (!Ai(n))
      return [
        Yr(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (Ns || Wi) && t.drawImageCount++;
  } else if (ns(e) && !Ai(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      Yr(t, {
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
function uu(e, t) {
  const { ownerDocument: n, svgDefsElement: r } = t, s = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!s)
    return [];
  const [i, o] = s.split("#");
  if (o) {
    const a = `#${o}`, l = t.shadowRoots.reduce(
      (u, f) => u ?? f.querySelector(`svg ${a}`),
      n == null ? void 0 : n.querySelector(`svg ${a}`)
    );
    if (i && e.setAttribute("href", a), r != null && r.querySelector(a))
      return [];
    if (l)
      return r == null || r.appendChild(l.cloneNode(!0)), [];
    if (i)
      return [
        Yr(t, {
          url: i,
          responseType: "text"
        }).then((u) => {
          r == null || r.insertAdjacentHTML("beforeend", u);
        })
      ];
  }
  return [];
}
function rl(e, t) {
  const { tasks: n } = t;
  Tt(e) && ((br(e) || Va(e)) && n.push(...fu(e, t)), _f(e) && n.push(...uu(e, t))), Vr(e) && n.push(...cu(e.style, t)), e.childNodes.forEach((r) => {
    rl(r, t);
  });
}
async function du(e, t) {
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
      const l = _o(a.cssText, t);
      r.appendChild(n.createTextNode(`${l}
`));
    } else {
      const l = Array.from(n.styleSheets).filter((f) => {
        try {
          return "cssRules" in f && !!f.cssRules.length;
        } catch (v) {
          return t.log.warn(`Error while reading CSS rules from ${f.href}`, v), !1;
        }
      });
      await Promise.all(
        l.flatMap((f) => Array.from(f.cssRules).map(async (v, d) => {
          if (mf(v)) {
            let m = d + 1;
            const b = v.href;
            let _ = "";
            try {
              _ = await Yr(t, {
                url: b,
                requestType: "text",
                responseType: "text"
              });
            } catch (w) {
              t.log.warn(`Error fetch remote css import from ${b}`, w);
            }
            const h = _.replace(
              nl,
              (w, A, k) => w.replace(k, Wa(k, b))
            );
            for (const w of pu(h))
              try {
                f.insertRule(
                  w,
                  w.startsWith("@import") ? m += 1 : f.cssRules.length
                );
              } catch (A) {
                t.log.warn("Error inserting rule from remote css import", { rule: w, error: A });
              }
          }
        }))
      );
      const u = [];
      l.forEach((f) => {
        Ti(f.cssRules, u);
      }), u.filter((f) => {
        var v;
        return gf(f) && tl(f.style.getPropertyValue("src")) && ((v = Ga(f.style.getPropertyValue("font-family"))) == null ? void 0 : v.some((d) => s.has(d)));
      }).forEach((f) => {
        const v = f, d = i.get(v.cssText);
        d ? r.appendChild(n.createTextNode(`${d}
`)) : o.push(
          el(
            v.cssText,
            v.parentStyleSheet ? v.parentStyleSheet.href : null,
            t
          ).then((m) => {
            m = _o(m, t), i.set(v.cssText, m), r.appendChild(n.createTextNode(`${m}
`));
          })
        );
      });
    }
}
const vu = /(\/\*[\s\S]*?\*\/)/g, bo = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function pu(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(vu, "");
  for (; ; ) {
    const i = bo.exec(n);
    if (!i)
      break;
    t.push(i[0]);
  }
  n = n.replace(bo, "");
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
const hu = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, gu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function _o(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(gu, (s) => {
    for (; ; ) {
      const [i, , o] = hu.exec(s) || [];
      if (!o)
        return "";
      if (o === r)
        return `src: ${i};`;
    }
  }) : e;
}
function Ti(e, t = []) {
  for (const n of Array.from(e))
    bf(n) ? t.push(...Ti(n.cssRules)) : "cssRules" in n ? Ti(n.cssRules, t) : t.push(n);
  return t;
}
async function mu(e, t) {
  const n = await Xa(e, t);
  if (Tt(n.node) && ns(n.node))
    return n.node;
  const {
    ownerDocument: r,
    log: s,
    tasks: i,
    svgStyleElement: o,
    svgDefsElement: a,
    svgStyles: l,
    font: u,
    progress: f,
    autoDestruct: v,
    onCloneNode: d,
    onEmbedNode: m,
    onCreateForeignObjectSvg: b
  } = n;
  s.time("clone node");
  const _ = await Yi(n.node, n, !0);
  if (o && r) {
    let j = "";
    l.forEach((R, L) => {
      j += `${R.join(`,
`)} {
  ${L}
}
`;
    }), o.appendChild(r.createTextNode(j));
  }
  s.timeEnd("clone node"), await (d == null ? void 0 : d(_)), u !== !1 && Tt(_) && (s.time("embed web font"), await du(_, n), s.timeEnd("embed web font")), s.time("embed node"), rl(_, n);
  const h = i.length;
  let w = 0;
  const A = async () => {
    for (; ; ) {
      const j = i.pop();
      if (!j)
        break;
      try {
        await j;
      } catch (R) {
        n.log.warn("Failed to run task", R);
      }
      f == null || f(++w, h);
    }
  };
  f == null || f(w, h), await Promise.all([...Array.from({ length: 4 })].map(A)), s.timeEnd("embed node"), await (m == null ? void 0 : m(_));
  const k = bu(_, n);
  return a && k.insertBefore(a, k.children[0]), o && k.insertBefore(o, k.children[0]), v && su(n), await (b == null ? void 0 : b(k)), k;
}
function bu(e, t) {
  const { width: n, height: r } = t, s = jf(n, r, e.ownerDocument), i = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return i.setAttributeNS(null, "x", "0%"), i.setAttributeNS(null, "y", "0%"), i.setAttributeNS(null, "width", "100%"), i.setAttributeNS(null, "height", "100%"), i.append(e), s.appendChild(i), s;
}
async function _u(e, t) {
  var o;
  const n = await Xa(e, t), r = await mu(n), s = If(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = Ka(n.ownerDocument), n.svgDefsElement = (o = n.ownerDocument) == null ? void 0 : o.createElementNS(Ws, "defs"), n.svgStyles.clear());
  const i = nr(s, r.ownerDocument);
  return await zf(i, n);
}
const wu = {
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
async function sl() {
  return (await _u(document.documentElement, {
    ...wu,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8);
}
var yu = /* @__PURE__ */ N('<span class="spinner svelte-1dhybq8"></span> Capturing...', 1), xu = /* @__PURE__ */ ts('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot', 1), ku = /* @__PURE__ */ N('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), Eu = /* @__PURE__ */ N('<span class="more-badge svelte-1dhybq8"> </span>'), Su = /* @__PURE__ */ N('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>'), Cu = /* @__PURE__ */ N('<div class="screenshot-section svelte-1dhybq8"><button class="capture-btn svelte-1dhybq8"><!></button> <!></div>');
const $u = {
  hash: "svelte-1dhybq8",
  code: `.screenshot-section.svelte-1dhybq8 {display:flex;flex-direction:column;gap:8px;}.capture-btn.svelte-1dhybq8 {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.capture-btn.svelte-1dhybq8:hover:not(:disabled) {background:#374151;}.capture-btn.svelte-1dhybq8:disabled {opacity:0.5;cursor:not-allowed;}.thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}.spinner.svelte-1dhybq8 {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-1dhybq8-spin 0.6s linear infinite;}
  @keyframes svelte-1dhybq8-spin {
    to { transform: rotate(360deg); }
  }`
};
function il(e, t) {
  vn(t, !0), Un(e, $u);
  let n = X(t, "screenshots", 23, () => []), r = X(t, "capturing", 7, !1), s = X(t, "oncapture", 7), i = X(t, "onremove", 7);
  var o = {
    get screenshots() {
      return n();
    },
    set screenshots(b = []) {
      n(b), W();
    },
    get capturing() {
      return r();
    },
    set capturing(b = !1) {
      r(b), W();
    },
    get oncapture() {
      return s();
    },
    set oncapture(b) {
      s(b), W();
    },
    get onremove() {
      return i();
    },
    set onremove(b) {
      i(b), W();
    }
  }, a = Cu(), l = x(a), u = x(l);
  {
    var f = (b) => {
      var _ = yu();
      Ur(), S(b, _);
    }, v = (b) => {
      var _ = xu();
      Ur(), S(b, _);
    };
    F(u, (b) => {
      r() ? b(f) : b(v, !1);
    });
  }
  y(l);
  var d = C(l, 2);
  {
    var m = (b) => {
      var _ = Su(), h = x(_);
      Ve(h, 17, () => n().slice(-3), ut, (k, j, R) => {
        var L = ku(), q = x(L);
        me(q, "alt", `Screenshot ${R + 1}`);
        var te = C(q, 2);
        y(L), M(() => me(q, "src", c(j))), ee("click", te, () => i()(n().length - 3 + R < 0 ? R : n().length - 3 + R)), S(k, L);
      });
      var w = C(h, 2);
      {
        var A = (k) => {
          var j = Eu(), R = x(j);
          y(j), M(() => V(R, `+${n().length - 3}`)), S(k, j);
        };
        F(w, (k) => {
          n().length > 3 && k(A);
        });
      }
      y(_), S(b, _);
    };
    F(d, (b) => {
      n().length > 0 && b(m);
    });
  }
  return y(a), M(() => l.disabled = r()), ee("click", l, function(...b) {
    var _;
    (_ = s()) == null || _.apply(this, b);
  }), S(e, a), pn(o);
}
Us(["click"]);
Hn(il, { screenshots: {}, capturing: {}, oncapture: {}, onremove: {} }, [], [], { mode: "open" });
var Au = /* @__PURE__ */ N('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), Tu = /* @__PURE__ */ N('<div class="log-more svelte-x1hlqn"> </div>'), Nu = /* @__PURE__ */ N('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const Ru = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function ol(e, t) {
  vn(t, !0), Un(e, Ru);
  let n = X(t, "logs", 23, () => []);
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
    set logs(l = []) {
      n(l), W();
    }
  }, i = Dr(), o = zt(i);
  {
    var a = (l) => {
      var u = Nu(), f = x(u), v = x(f);
      y(f);
      var d = C(f, 2), m = x(d);
      Ve(m, 17, () => n().slice(-10), ut, (h, w) => {
        var A = Au(), k = x(A), j = x(k, !0);
        y(k);
        var R = C(k, 2), L = x(R);
        y(R), y(A), M(
          (q) => {
            Fr(k, `color: ${(r[c(w).type] || "#9ca3af") ?? ""}`), V(j, c(w).type), V(L, `${q ?? ""}${c(w).message.length > 120 ? "..." : ""}`);
          },
          [() => c(w).message.substring(0, 120)]
        ), S(h, A);
      });
      var b = C(m, 2);
      {
        var _ = (h) => {
          var w = Tu(), A = x(w);
          y(w), M(() => V(A, `+${n().length - 10} more`)), S(h, w);
        };
        F(b, (h) => {
          n().length > 10 && h(_);
        });
      }
      y(d), y(u), M(() => V(v, `Console Logs (${n().length ?? ""})`)), S(l, u);
    };
    F(o, (l) => {
      n().length > 0 && l(a);
    });
  }
  return S(e, i), pn(s);
}
Hn(ol, { logs: {} }, [], [], { mode: "open" });
var ju = /* @__PURE__ */ ts('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), Iu = /* @__PURE__ */ ts('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Lu = /* @__PURE__ */ N('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const Mu = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function al(e, t) {
  vn(t, !0), Un(e, Mu);
  let n = X(t, "message", 7), r = X(t, "type", 7, "success"), s = X(t, "visible", 7, !1);
  var i = {
    get message() {
      return n();
    },
    set message(u) {
      n(u), W();
    },
    get type() {
      return r();
    },
    set type(u = "success") {
      r(u), W();
    },
    get visible() {
      return s();
    },
    set visible(u = !1) {
      s(u), W();
    }
  }, o = Dr(), a = zt(o);
  {
    var l = (u) => {
      var f = Lu();
      let v;
      var d = x(f), m = x(d);
      {
        var b = (A) => {
          var k = ju();
          S(A, k);
        }, _ = (A) => {
          var k = Iu();
          S(A, k);
        };
        F(m, (A) => {
          r() === "success" ? A(b) : A(_, !1);
        });
      }
      y(d);
      var h = C(d, 2), w = x(h, !0);
      y(h), y(f), M(() => {
        v = We(f, 1, "jat-toast svelte-1f5s7q1", null, v, { error: r() === "error", success: r() === "success" }), V(w, n());
      }), S(u, f);
    };
    F(a, (u) => {
      s() && u(l);
    });
  }
  return S(e, o), pn(i);
}
Hn(al, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var qu = /* @__PURE__ */ N('<span class="subtab-count svelte-1fnmin5"> </span>'), Pu = /* @__PURE__ */ N('<span class="subtab-count active-count svelte-1fnmin5"> </span>'), Du = /* @__PURE__ */ N('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), Fu = /* @__PURE__ */ N('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), Ou = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), zu = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Bu = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), Uu = /* @__PURE__ */ N('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Hu = /* @__PURE__ */ N('<p class="revision-note svelte-1fnmin5"> </p>'), Vu = /* @__PURE__ */ N('<li class="svelte-1fnmin5"> </li>'), Wu = /* @__PURE__ */ N('<ul class="thread-summary svelte-1fnmin5"></ul>'), Yu = /* @__PURE__ */ N('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Gu = /* @__PURE__ */ N('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Xu = /* @__PURE__ */ N('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Ku = /* @__PURE__ */ N('<span class="element-badge svelte-1fnmin5"> </span>'), Zu = /* @__PURE__ */ N('<div class="thread-elements svelte-1fnmin5"></div>'), Ju = /* @__PURE__ */ N('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"> </p> <!> <!> <!></div>'), Qu = /* @__PURE__ */ N('<div class="thread svelte-1fnmin5"></div>'), ed = /* @__PURE__ */ N('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), td = /* @__PURE__ */ N('<p class="report-desc svelte-1fnmin5"> </p>'), nd = /* @__PURE__ */ N('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), rd = /* @__PURE__ */ N('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), sd = /* @__PURE__ */ N('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), id = /* @__PURE__ */ N('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span> </span></div>'), od = /* @__PURE__ */ N('<span class="status-pill accepted svelte-1fnmin5"></span>'), ad = /* @__PURE__ */ N('<span class="status-pill rejected svelte-1fnmin5"></span>'), ld = /* @__PURE__ */ N('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), cd = /* @__PURE__ */ N('<div class="reject-preview-strip svelte-1fnmin5"></div>'), fd = /* @__PURE__ */ N('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), ud = /* @__PURE__ */ N('<div class="reject-element-strip svelte-1fnmin5"></div>'), dd = /* @__PURE__ */ N('<span class="char-hint svelte-1fnmin5"> </span>'), vd = /* @__PURE__ */ N('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), pd = /* @__PURE__ */ N('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), hd = /* @__PURE__ */ N('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), gd = /* @__PURE__ */ N('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), md = /* @__PURE__ */ N('<div class="reports svelte-1fnmin5"></div>'), bd = /* @__PURE__ */ N('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>Pending <!></button> <button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const _d = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {display:flex;flex-direction:column;overflow:hidden;}

  /* Subtabs */.subtabs.svelte-1fnmin5 {display:flex;border-bottom:1px solid #1f2937;padding:0 12px;flex-shrink:0;}.subtab.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:8px 10px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;text-transform:uppercase;letter-spacing:0.3px;}.subtab.svelte-1fnmin5:hover {color:#d1d5db;}.subtab.active.svelte-1fnmin5 {color:#f9fafb;border-bottom-color:#3b82f6;}.subtab-count.svelte-1fnmin5 {display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:#374151;color:#d1d5db;font-size:9px;font-weight:700;line-height:1;}.subtab.active.svelte-1fnmin5 .subtab-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.subtab-count.active-count.svelte-1fnmin5 {background:#3b82f630;color:#60a5fa;}.subtab.active.svelte-1fnmin5 .subtab-count.active-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.subtab-count.done-count.svelte-1fnmin5 {background:#10b98130;color:#34d399;}.subtab.active.svelte-1fnmin5 .subtab-count.done-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.request-scroll.svelte-1fnmin5 {padding:10px 12px;overflow-y:auto;flex:1;min-height:0;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:6px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;transition:border-color 0.15s;overflow:hidden;}.report-card.awaiting.svelte-1fnmin5 {border-color:#f59e0b40;box-shadow:0 0 0 1px #f59e0b20;}.report-card.expanded.svelte-1fnmin5 {border-color:#4b556380;}

  /* Collapsed card header (clickable toggle) */.card-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;width:100%;padding:9px 10px;background:none;border:none;cursor:pointer;font-family:inherit;text-align:left;color:inherit;}.card-toggle.svelte-1fnmin5:hover {background:#ffffff06;}.report-type.svelte-1fnmin5 {font-size:13px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:12px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 6px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.chevron.svelte-1fnmin5 {flex-shrink:0;color:#6b7280;transition:transform 0.15s;}.chevron-open.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Expanded card body */.card-body.svelte-1fnmin5 {padding:0 10px 10px;border-top:1px solid #ffffff08;}.report-url.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin:6px 0 0;font-size:11px;color:#60a5fa;text-decoration:none;overflow:hidden;transition:color 0.15s;}.report-url.svelte-1fnmin5:hover {color:#93c5fd;}.report-url.svelte-1fnmin5 svg:where(.svelte-1fnmin5) {flex-shrink:0;}.report-url.svelte-1fnmin5 span:where(.svelte-1fnmin5) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.screenshot-thumb.svelte-1fnmin5 {flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;background:#111827;cursor:pointer;padding:0;transition:border-color 0.15s;}.screenshot-thumb.svelte-1fnmin5:hover {border-color:#60a5fa;}.screenshot-thumb.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.screenshot-expanded.svelte-1fnmin5 {position:relative;margin-top:4px;border-radius:6px;overflow:hidden;border:1px solid #374151;}.screenshot-expanded.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;display:block;border-radius:5px;}.screenshot-close.svelte-1fnmin5 {position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;}.screenshot-close.svelte-1fnmin5:hover {background:rgba(0,0,0,0.9);}.revision-note.svelte-1fnmin5 {font-size:10px;color:#f59e0b;margin:3px 0 0;font-weight:500;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}

  /* Thread toggle button */.thread-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin-top:6px;padding:3px 6px;background:none;border:none;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;border-radius:4px;transition:color 0.15s, background 0.15s;}.thread-toggle.svelte-1fnmin5:hover {color:#d1d5db;background:#111827;}.thread-toggle-icon.svelte-1fnmin5 {transition:transform 0.15s;}.thread-toggle-icon.expanded.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Thread container */.thread.svelte-1fnmin5 {margin-top:6px;display:flex;flex-direction:column;gap:4px;}.thread-entry.svelte-1fnmin5 {padding:6px 8px;border-radius:5px;font-size:12px;border-left:2px solid;}.thread-user.svelte-1fnmin5 {background:#111827;border-left-color:#6b7280;}.thread-dev.svelte-1fnmin5 {background:#0f172a;border-left-color:#3b82f6;}.thread-entry-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;margin-bottom:3px;}.thread-from.svelte-1fnmin5 {font-weight:600;font-size:11px;color:#d1d5db;}.thread-type-badge.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.3px;}.thread-type-badge.submission.svelte-1fnmin5 {background:#6b728020;color:#9ca3af;}.thread-type-badge.completion.svelte-1fnmin5 {background:#3b82f620;color:#60a5fa;}.thread-type-badge.rejection.svelte-1fnmin5 {background:#ef444420;color:#f87171;}.thread-type-badge.acceptance.svelte-1fnmin5 {background:#10b98120;color:#34d399;}.thread-time.svelte-1fnmin5 {font-size:10px;color:#4b5563;margin-left:auto;}.thread-message.svelte-1fnmin5 {color:#d1d5db;line-height:1.4;margin:0;white-space:pre-wrap;word-break:break-word;}.thread-summary.svelte-1fnmin5 {margin:4px 0 0 0;padding:0 0 0 16px;font-size:11px;color:#9ca3af;}.thread-summary.svelte-1fnmin5 li:where(.svelte-1fnmin5) {margin:1px 0;}.thread-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:4px;}.thread-elements.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:4px;}.element-badge.svelte-1fnmin5 {font-size:10px;font-family:'SF Mono', 'Fira Code', 'Consolas', monospace;padding:1px 5px;background:#1e293b;border:1px solid #334155;border-radius:3px;color:#94a3b8;}.element-badge.removable.svelte-1fnmin5 {display:inline-flex;align-items:center;gap:3px;}.element-remove.svelte-1fnmin5 {background:none;border:none;color:#6b7280;cursor:pointer;padding:0;font-size:12px;line-height:1;}.element-remove.svelte-1fnmin5:hover {color:#ef4444;}

  /* Enhanced rejection form */.reject-attachments.svelte-1fnmin5 {display:flex;gap:6px;margin-top:6px;}.attach-btn.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:3px 8px;background:#111827;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:border-color 0.15s, color 0.15s;}.attach-btn.svelte-1fnmin5:hover:not(:disabled) {border-color:#60a5fa;color:#d1d5db;}.attach-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-preview-strip.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.reject-preview-item.svelte-1fnmin5 {position:relative;flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;}.reject-preview-item.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.reject-preview-remove.svelte-1fnmin5 {position:absolute;top:1px;right:1px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center;}.reject-preview-remove.svelte-1fnmin5:hover {background:#ef4444;}.reject-element-strip.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.status-pill.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.status-pill.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.status-pill.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function ll(e, t) {
  vn(t, !0), Un(e, _d);
  let n = X(t, "endpoint", 7), r = X(t, "reports", 31, () => Ge([])), s = X(t, "loading", 7), i = X(t, "error", 7), o = X(t, "onreload", 7), a = /* @__PURE__ */ U(null), l = /* @__PURE__ */ U(null), u = /* @__PURE__ */ U(null), f = /* @__PURE__ */ U(""), v = /* @__PURE__ */ U(""), d = /* @__PURE__ */ U(""), m = /* @__PURE__ */ U(Ge([])), b = /* @__PURE__ */ U(Ge([])), _ = /* @__PURE__ */ U(!1), h = /* @__PURE__ */ U("pending"), w = /* @__PURE__ */ yt(() => c(h) === "pending" ? r().filter((p) => p.status === "submitted") : c(h) === "in_progress" ? r().filter((p) => p.status === "in_progress") : r().filter((p) => ["completed", "accepted", "rejected", "wontfix", "closed"].includes(p.status))), A = /* @__PURE__ */ yt(() => r().filter((p) => p.status === "submitted").length), k = /* @__PURE__ */ yt(() => r().filter((p) => p.status === "in_progress").length), j = /* @__PURE__ */ yt(() => r().filter((p) => ["completed", "accepted", "rejected", "wontfix", "closed"].includes(p.status)).length);
  function R(p) {
    E(u, c(u) === p ? null : p, !0), c(u) !== p && (c(l) === p && E(l, null), E(a, null));
  }
  function L(p) {
    E(v, p, !0), E(d, ""), E(m, [], !0), E(b, [], !0);
  }
  function q() {
    E(v, ""), E(d, ""), E(m, [], !0), E(b, [], !0);
  }
  async function te() {
    if (!c(_)) {
      E(_, !0);
      try {
        const p = await sl();
        E(m, [...c(m), p], !0);
      } catch (p) {
        console.error("Screenshot capture failed:", p);
      }
      E(_, !1);
    }
  }
  function ne(p) {
    E(m, c(m).filter(($, D) => D !== p), !0);
  }
  function oe() {
    qa((p) => {
      E(
        b,
        [
          ...c(b),
          {
            tagName: p.tagName,
            className: p.className,
            id: p.id,
            selector: p.selector,
            textContent: p.textContent
          }
        ],
        !0
      );
    });
  }
  function Pe(p) {
    E(b, c(b).filter(($, D) => D !== p), !0);
  }
  async function Ee(p, $, D) {
    E(f, p, !0);
    const T = $ === "rejected" ? {
      screenshots: c(m).length > 0 ? c(m) : void 0,
      elements: c(b).length > 0 ? c(b) : void 0
    } : void 0;
    (await sf(n(), p, $, D, T)).ok ? (r(r().map((_e) => _e.id === p ? {
      ..._e,
      status: $ === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...$ === "rejected" ? { revision_count: (_e.revision_count || 0) + 1 } : {}
    } : _e)), E(v, ""), E(d, ""), E(m, [], !0), E(b, [], !0), o()()) : E(v, ""), E(f, "");
  }
  function mt(p) {
    E(l, c(l) === p ? null : p, !0);
  }
  function ot(p) {
    return p ? p.length : 0;
  }
  function De(p) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[p.type] || p.type;
  }
  function Jt(p) {
    return {
      submitted: "Submitted",
      in_progress: "In Progress",
      completed: "Completed",
      accepted: "Accepted",
      rejected: "Rejected",
      wontfix: "Won't Fix",
      closed: "Closed"
    }[p] || p;
  }
  function I(p) {
    return {
      submitted: "#6b7280",
      in_progress: "#3b82f6",
      completed: "#f59e0b",
      accepted: "#10b981",
      rejected: "#ef4444",
      wontfix: "#6b7280",
      closed: "#6b7280"
    }[p] || "#6b7280";
  }
  function pe(p) {
    return p === "bug" ? "🐛" : p === "enhancement" ? "✨" : "📝";
  }
  function ae(p) {
    const $ = Date.now(), D = new Date(p).getTime(), T = $ - D, Se = Math.floor(T / 6e4);
    if (Se < 1) return "just now";
    if (Se < 60) return `${Se}m ago`;
    const _e = Math.floor(Se / 60);
    if (_e < 24) return `${_e}h ago`;
    const Re = Math.floor(_e / 24);
    return Re < 30 ? `${Re}d ago` : new Date(p).toLocaleDateString();
  }
  var at = {
    get endpoint() {
      return n();
    },
    set endpoint(p) {
      n(p), W();
    },
    get reports() {
      return r();
    },
    set reports(p = []) {
      r(p), W();
    },
    get loading() {
      return s();
    },
    set loading(p) {
      s(p), W();
    },
    get error() {
      return i();
    },
    set error(p) {
      i(p), W();
    },
    get onreload() {
      return o();
    },
    set onreload(p) {
      o(p), W();
    }
  }, It = bd(), hn = x(It), Lt = x(hn);
  let Vn;
  var Ys = C(x(Lt));
  {
    var xr = (p) => {
      var $ = qu(), D = x($, !0);
      y($), M(() => V(D, c(A))), S(p, $);
    };
    F(Ys, (p) => {
      c(A) > 0 && p(xr);
    });
  }
  y(Lt);
  var Mt = C(Lt, 2);
  let kr;
  var Gs = C(x(Mt));
  {
    var Er = (p) => {
      var $ = Pu(), D = x($, !0);
      y($), M(() => V(D, c(k))), S(p, $);
    };
    F(Gs, (p) => {
      c(k) > 0 && p(Er);
    });
  }
  y(Mt);
  var Qt = C(Mt, 2);
  let Sr;
  var Wn = C(x(Qt));
  {
    var rs = (p) => {
      var $ = Du(), D = x($, !0);
      y($), M(() => V(D, c(j))), S(p, $);
    };
    F(Wn, (p) => {
      c(j) > 0 && p(rs);
    });
  }
  y(Qt), y(hn);
  var ss = C(hn, 2), Xs = x(ss);
  {
    var Ks = (p) => {
      var $ = Fu();
      S(p, $);
    }, is = (p) => {
      var $ = Ou(), D = x($), T = x(D, !0);
      y(D);
      var Se = C(D, 2);
      y($), M(() => V(T, i())), ee("click", Se, function(..._e) {
        var Re;
        (Re = o()) == null || Re.apply(this, _e);
      }), S(p, $);
    }, Zs = (p) => {
      var $ = zu(), D = x($);
      D.textContent = "📋", Ur(4), y($), S(p, $);
    }, Js = (p) => {
      var $ = Bu(), D = x($), T = x(D);
      y(D), y($), M(() => V(T, `No ${c(h) === "pending" ? "pending" : c(h) === "in_progress" ? "in-progress" : "completed"} requests`)), S(p, $);
    }, Qs = (p) => {
      var $ = md();
      Ve($, 21, () => c(w), (D) => D.id, (D, T) => {
        var Se = gd();
        let _e;
        var Re = x(Se), gn = x(Re), Yn = x(gn, !0);
        y(gn);
        var Gn = C(gn, 2), Xn = x(Gn, !0);
        y(Gn);
        var en = C(Gn, 2), os = x(en, !0);
        y(en);
        var Kn = C(en, 2);
        let as;
        y(Re);
        var ei = C(Re, 2);
        {
          var ti = (tn) => {
            var mn = hd(), bn = x(mn);
            {
              var Zn = (H) => {
                var Z = Uu(), ie = C(x(Z), 2), he = x(ie, !0);
                y(ie), y(Z), M(
                  (Ke) => {
                    me(Z, "href", c(T).page_url), V(he, Ke);
                  },
                  [
                    () => c(T).page_url.replace(/^https?:\/\//, "").split("?")[0]
                  ]
                ), S(H, Z);
              };
              F(bn, (H) => {
                c(T).page_url && H(Zn);
              });
            }
            var Jn = C(bn, 2);
            {
              var ni = (H) => {
                var Z = Hu(), ie = x(Z);
                y(Z), M(() => V(ie, `Revision ${c(T).revision_count ?? ""}`)), S(H, Z);
              };
              F(Jn, (H) => {
                c(T).revision_count > 0 && c(T).status !== "accepted" && H(ni);
              });
            }
            var Cr = C(Jn, 2);
            {
              var $r = (H) => {
                var Z = ed(), ie = zt(Z), he = x(ie);
                let Ke;
                var lt = C(he, 2), $e = x(lt);
                y(lt), y(ie);
                var de = C(ie, 2);
                {
                  var Oe = (re) => {
                    var bt = Qu();
                    Ve(bt, 21, () => c(T).thread, (Tr) => Tr.id, (Tr, se) => {
                      var Qn = Ju();
                      let Nr;
                      var Rr = x(Qn), wn = x(Rr), fs = x(wn, !0);
                      y(wn);
                      var Pt = C(wn, 2);
                      let us;
                      var ii = x(Pt, !0);
                      y(Pt);
                      var ds = C(Pt, 2), oi = x(ds, !0);
                      y(ds), y(Rr);
                      var ve = C(Rr, 2), ze = x(ve, !0);
                      y(ve);
                      var nn = C(ve, 2);
                      {
                        var Dt = (Ae) => {
                          var Ze = Wu();
                          Ve(Ze, 21, () => c(se).summary, ut, (xn, _t) => {
                            var wt = Vu(), Ot = x(wt, !0);
                            y(wt), M(() => V(Ot, c(_t))), S(xn, wt);
                          }), y(Ze), S(Ae, Ze);
                        };
                        F(nn, (Ae) => {
                          c(se).summary && c(se).summary.length > 0 && Ae(Dt);
                        });
                      }
                      var yn = C(nn, 2);
                      {
                        var Ft = (Ae) => {
                          var Ze = Xu(), xn = zt(Ze);
                          Ve(xn, 21, () => c(se).screenshots, ut, (Ot, sn, kn) => {
                            var vs = Dr(), ai = zt(vs);
                            {
                              var En = (Sn) => {
                                var on = Yu();
                                me(on, "aria-label", `Screenshot ${kn + 1}`);
                                var ps = x(on);
                                me(ps, "alt", `Screenshot ${kn + 1}`), y(on), M(() => me(ps, "src", `${n() ?? ""}${c(sn).url ?? ""}`)), ee("click", on, () => E(a, c(a) === c(sn).url ? null : c(sn).url, !0)), S(Sn, on);
                              };
                              F(ai, (Sn) => {
                                c(sn).url && Sn(En);
                              });
                            }
                            S(Ot, vs);
                          }), y(xn);
                          var _t = C(xn, 2);
                          {
                            var wt = (Ot) => {
                              const sn = /* @__PURE__ */ yt(() => c(se).screenshots.find((En) => En.url === c(a)));
                              var kn = Dr(), vs = zt(kn);
                              {
                                var ai = (En) => {
                                  var Sn = Gu(), on = x(Sn), ps = C(on, 2);
                                  y(Sn), M(() => me(on, "src", `${n() ?? ""}${c(a) ?? ""}`)), ee("click", ps, () => E(a, null)), S(En, Sn);
                                };
                                F(vs, (En) => {
                                  c(sn) && En(ai);
                                });
                              }
                              S(Ot, kn);
                            };
                            F(_t, (Ot) => {
                              c(a) && Ot(wt);
                            });
                          }
                          S(Ae, Ze);
                        };
                        F(yn, (Ae) => {
                          c(se).screenshots && c(se).screenshots.length > 0 && Ae(Ft);
                        });
                      }
                      var rn = C(yn, 2);
                      {
                        var jr = (Ae) => {
                          var Ze = Zu();
                          Ve(Ze, 21, () => c(se).elements, ut, (xn, _t) => {
                            var wt = Ku(), Ot = x(wt);
                            y(wt), M(
                              (sn, kn) => {
                                me(wt, "title", c(_t).selector), V(Ot, `<${sn ?? ""}${c(_t).id ? `#${c(_t).id}` : ""}${kn ?? ""}>`);
                              },
                              [
                                () => c(_t).tagName.toLowerCase(),
                                () => c(_t).className ? `.${c(_t).className.split(" ")[0]}` : ""
                              ]
                            ), S(xn, wt);
                          }), y(Ze), S(Ae, Ze);
                        };
                        F(rn, (Ae) => {
                          c(se).elements && c(se).elements.length > 0 && Ae(jr);
                        });
                      }
                      y(Qn), M(
                        (Ae, Ze) => {
                          Nr = We(Qn, 1, "thread-entry svelte-1fnmin5", null, Nr, {
                            "thread-user": c(se).from === "user",
                            "thread-dev": c(se).from === "dev"
                          }), V(fs, c(se).from === "user" ? "You" : "Dev"), us = We(Pt, 1, "thread-type-badge svelte-1fnmin5", null, us, {
                            submission: c(se).type === "submission",
                            completion: c(se).type === "completion",
                            rejection: c(se).type === "rejection",
                            acceptance: c(se).type === "acceptance"
                          }), V(ii, Ae), V(oi, Ze), V(ze, c(se).message);
                        },
                        [
                          () => De(c(se)),
                          () => ae(c(se).at)
                        ]
                      ), S(Tr, Qn);
                    }), y(bt), S(re, bt);
                  };
                  F(de, (re) => {
                    c(l) === c(T).id && re(Oe);
                  });
                }
                M(
                  (re, bt) => {
                    Ke = We(he, 0, "thread-toggle-icon svelte-1fnmin5", null, Ke, { expanded: c(l) === c(T).id }), V($e, `${re ?? ""} ${bt ?? ""}`);
                  },
                  [
                    () => ot(c(T).thread),
                    () => ot(c(T).thread) === 1 ? "message" : "messages"
                  ]
                ), ee("click", ie, () => mt(c(T).id)), S(H, Z);
              }, Ar = (H) => {
                var Z = td(), ie = x(Z, !0);
                y(Z), M((he) => V(ie, he), [
                  () => c(T).description.length > 120 ? c(T).description.slice(0, 120) + "..." : c(T).description
                ]), S(H, Z);
              };
              F(Cr, (H) => {
                c(T).thread && c(T).thread.length > 0 ? H($r) : c(T).description && H(Ar, 1);
              });
            }
            var ls = C(Cr, 2);
            {
              var ri = (H) => {
                var Z = sd(), ie = zt(Z);
                Ve(ie, 21, () => c(T).screenshot_urls, ut, ($e, de, Oe) => {
                  var re = nd();
                  me(re, "aria-label", `Screenshot ${Oe + 1}`);
                  var bt = x(re);
                  me(bt, "alt", `Screenshot ${Oe + 1}`), y(re), M(() => me(bt, "src", `${n() ?? ""}${c(de) ?? ""}`)), ee("click", re, () => E(a, c(a) === c(de) ? null : c(de), !0)), S($e, re);
                }), y(ie);
                var he = C(ie, 2);
                {
                  var Ke = ($e) => {
                    var de = rd(), Oe = x(de), re = C(Oe, 2);
                    y(de), M(() => me(Oe, "src", `${n() ?? ""}${c(a) ?? ""}`)), ee("click", re, () => E(a, null)), S($e, de);
                  }, lt = /* @__PURE__ */ yt(() => c(a) && c(T).screenshot_urls.includes(c(a)));
                  F(he, ($e) => {
                    c(lt) && $e(Ke);
                  });
                }
                S(H, Z);
              };
              F(ls, (H) => {
                !c(T).thread && c(T).screenshot_urls && c(T).screenshot_urls.length > 0 && H(ri);
              });
            }
            var cs = C(ls, 2);
            {
              var z = (H) => {
                var Z = id(), ie = C(x(Z), 2), he = x(ie, !0);
                y(ie), y(Z), M(() => V(he, c(T).dev_notes)), S(H, Z);
              };
              F(cs, (H) => {
                c(T).dev_notes && !c(T).thread && H(z);
              });
            }
            var Q = C(cs, 2), le = x(Q), Fe = x(le, !0);
            y(le);
            var Ce = C(le, 2);
            {
              var qt = (H) => {
                var Z = od();
                Z.textContent = "✓ Accepted", S(H, Z);
              }, _n = (H) => {
                var Z = ad();
                Z.textContent = "✗ Rejected", S(H, Z);
              }, si = (H) => {
                var Z = Dr(), ie = zt(Z);
                {
                  var he = (lt) => {
                    var $e = vd(), de = x($e);
                    aa(de);
                    var Oe = C(de, 2), re = x(Oe), bt = C(x(re));
                    y(re);
                    var Tr = C(re, 2);
                    y(Oe);
                    var se = C(Oe, 2);
                    {
                      var Qn = (ve) => {
                        var ze = cd();
                        Ve(ze, 21, () => c(m), ut, (nn, Dt, yn) => {
                          var Ft = ld(), rn = x(Ft);
                          me(rn, "alt", `Screenshot ${yn + 1}`);
                          var jr = C(rn, 2);
                          y(Ft), M(() => me(rn, "src", c(Dt))), ee("click", jr, () => ne(yn)), S(nn, Ft);
                        }), y(ze), S(ve, ze);
                      };
                      F(se, (ve) => {
                        c(m).length > 0 && ve(Qn);
                      });
                    }
                    var Nr = C(se, 2);
                    {
                      var Rr = (ve) => {
                        var ze = ud();
                        Ve(ze, 21, () => c(b), ut, (nn, Dt, yn) => {
                          var Ft = fd(), rn = x(Ft), jr = C(rn);
                          y(Ft), M((Ae) => V(rn, `<${Ae ?? ""}${c(Dt).id ? `#${c(Dt).id}` : ""}> `), [() => c(Dt).tagName.toLowerCase()]), ee("click", jr, () => Pe(yn)), S(nn, Ft);
                        }), y(ze), S(ve, ze);
                      };
                      F(Nr, (ve) => {
                        c(b).length > 0 && ve(Rr);
                      });
                    }
                    var wn = C(Nr, 2), fs = x(wn), Pt = C(fs, 2), us = x(Pt, !0);
                    y(Pt), y(wn);
                    var ii = C(wn, 2);
                    {
                      var ds = (ve) => {
                        var ze = dd(), nn = x(ze);
                        y(ze), M((Dt) => V(nn, `${Dt ?? ""} more characters needed`), [() => 10 - c(d).trim().length]), S(ve, ze);
                      }, oi = /* @__PURE__ */ yt(() => c(d).trim().length > 0 && c(d).trim().length < 10);
                      F(ii, (ve) => {
                        c(oi) && ve(ds);
                      });
                    }
                    y($e), M(
                      (ve) => {
                        re.disabled = c(_), V(bt, ` ${c(_) ? "..." : "Screenshot"}`), Pt.disabled = ve, V(us, c(f) === c(T).id ? "..." : "✗ Reject");
                      },
                      [
                        () => c(d).trim().length < 10 || c(f) === c(T).id
                      ]
                    ), $i(de, () => c(d), (ve) => E(d, ve)), ee("click", re, te), ee("click", Tr, oe), ee("click", fs, q), ee("click", Pt, () => Ee(c(T).id, "rejected", c(d).trim())), S(lt, $e);
                  }, Ke = (lt) => {
                    var $e = pd(), de = x($e), Oe = x(de, !0);
                    y(de);
                    var re = C(de, 2);
                    re.textContent = "✗ Reject", y($e), M(() => {
                      de.disabled = c(f) === c(T).id, V(Oe, c(f) === c(T).id ? "..." : "✓ Accept"), re.disabled = c(f) === c(T).id;
                    }), ee("click", de, () => Ee(c(T).id, "accepted")), ee("click", re, () => L(c(T).id)), S(lt, $e);
                  };
                  F(ie, (lt) => {
                    c(v) === c(T).id ? lt(he) : lt(Ke, !1);
                  });
                }
                S(H, Z);
              };
              F(Ce, (H) => {
                c(T).status === "accepted" ? H(qt) : c(T).status === "rejected" ? H(_n, 1) : (c(T).status === "completed" || c(T).status === "wontfix") && H(si, 2);
              });
            }
            y(Q), y(mn), M((H) => V(Fe, H), [() => ae(c(T).created_at)]), S(tn, mn);
          };
          F(ei, (tn) => {
            c(u) === c(T).id && tn(ti);
          });
        }
        y(Se), M(
          (tn, mn, bn, Zn, Jn) => {
            _e = We(Se, 1, "report-card svelte-1fnmin5", null, _e, {
              awaiting: c(T).status === "completed",
              expanded: c(u) === c(T).id
            }), V(Yn, tn), V(Xn, c(T).title), Fr(en, `background: ${mn ?? ""}20; color: ${bn ?? ""}; border-color: ${Zn ?? ""}40;`), V(os, Jn), as = We(Kn, 0, "chevron svelte-1fnmin5", null, as, { "chevron-open": c(u) === c(T).id });
          },
          [
            () => pe(c(T).type),
            () => I(c(T).status),
            () => I(c(T).status),
            () => I(c(T).status),
            () => Jt(c(T).status)
          ]
        ), ee("click", Re, () => R(c(T).id)), S(D, Se);
      }), y($), S(p, $);
    };
    F(Xs, (p) => {
      s() ? p(Ks) : i() && r().length === 0 ? p(is, 1) : r().length === 0 ? p(Zs, 2) : c(w).length === 0 ? p(Js, 3) : p(Qs, !1);
    });
  }
  return y(ss), y(It), M(() => {
    Vn = We(Lt, 1, "subtab svelte-1fnmin5", null, Vn, { active: c(h) === "pending" }), kr = We(Mt, 1, "subtab svelte-1fnmin5", null, kr, { active: c(h) === "in_progress" }), Sr = We(Qt, 1, "subtab svelte-1fnmin5", null, Sr, { active: c(h) === "completed" });
  }), ee("click", Lt, () => E(h, "pending")), ee("click", Mt, () => E(h, "in_progress")), ee("click", Qt, () => E(h, "completed")), S(e, It), pn(at);
}
Us(["click"]);
Hn(
  ll,
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
var wd = /* @__PURE__ */ N('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), yd = /* @__PURE__ */ N('<span class="tab-badge svelte-nv4d5v"> </span>'), xd = /* @__PURE__ */ N("<option> </option>"), kd = /* @__PURE__ */ N("<option> </option>"), Ed = /* @__PURE__ */ N('<span class="tool-count svelte-nv4d5v"> </span>'), Sd = /* @__PURE__ */ N("Pick Element<!>", 1), Cd = /* @__PURE__ */ N('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), $d = /* @__PURE__ */ N('<div class="elements-list svelte-nv4d5v"></div>'), Ad = /* @__PURE__ */ N('<div class="attach-summary svelte-nv4d5v"> </div>'), Td = /* @__PURE__ */ N('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), Nd = /* @__PURE__ */ N('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><!> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button></div> <!> <!> <!> <div class="actions svelte-nv4d5v"><button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), Rd = /* @__PURE__ */ N('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New Report</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> My Requests <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!></div>');
const jd = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover {background:#374151;}.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }`
};
function cl(e, t) {
  vn(t, !0), Un(e, jd);
  let n = X(t, "endpoint", 7), r = X(t, "project", 7), s = X(t, "userId", 7, ""), i = X(t, "userEmail", 7, ""), o = X(t, "userName", 7, ""), a = X(t, "userRole", 7, ""), l = X(t, "orgId", 7, ""), u = X(t, "orgName", 7, ""), f = X(t, "onclose", 7), v = X(t, "ongrip", 7), d = /* @__PURE__ */ U("new"), m = /* @__PURE__ */ U(Ge([])), b = /* @__PURE__ */ U(!1), _ = /* @__PURE__ */ U(""), h = /* @__PURE__ */ yt(() => c(m).filter((p) => p.status === "completed").length);
  async function w() {
    E(b, !0), E(_, "");
    const p = await rf(n());
    E(m, p.reports, !0), p.error && E(_, p.error, !0), E(b, !1);
  }
  xi(() => {
    w();
  });
  let A = /* @__PURE__ */ U(""), k = /* @__PURE__ */ U(""), j = /* @__PURE__ */ U("bug"), R = /* @__PURE__ */ U("medium"), L = /* @__PURE__ */ U(Ge([])), q = /* @__PURE__ */ U(Ge([])), te = /* @__PURE__ */ U(Ge([])), ne = /* @__PURE__ */ U(!1), oe = /* @__PURE__ */ U(!1), Pe = /* @__PURE__ */ U(!1), Ee = /* @__PURE__ */ U(""), mt = /* @__PURE__ */ U("success"), ot = /* @__PURE__ */ U(!1);
  function De(p, $) {
    E(Ee, p, !0), E(mt, $, !0), E(ot, !0), setTimeout(
      () => {
        E(ot, !1);
      },
      3e3
    );
  }
  async function Jt() {
    E(oe, !0);
    try {
      const p = await sl();
      E(L, [...c(L), p], !0), De(`Screenshot captured (${c(L).length})`, "success");
    } catch (p) {
      console.error("[jat-feedback] Screenshot failed:", p), De("Screenshot failed: " + (p instanceof Error ? p.message : "unknown error"), "error");
    } finally {
      E(oe, !1);
    }
  }
  function I(p) {
    E(L, c(L).filter(($, D) => D !== p), !0);
  }
  function pe() {
    E(Pe, !0), qa((p) => {
      E(q, [...c(q), p], !0), E(Pe, !1), De(`Element captured: <${p.tagName.toLowerCase()}>`, "success");
    });
  }
  function ae() {
    E(te, Zc(), !0);
  }
  async function at(p) {
    if (p.preventDefault(), !c(A).trim()) return;
    E(ne, !0), ae();
    const $ = {};
    (s() || i() || o() || a()) && ($.reporter = {}, s() && ($.reporter.userId = s()), i() && ($.reporter.email = i()), o() && ($.reporter.name = o()), a() && ($.reporter.role = a())), (l() || u()) && ($.organization = {}, l() && ($.organization.id = l()), u() && ($.organization.name = u()));
    const D = {
      title: c(A).trim(),
      description: c(k).trim(),
      type: c(j),
      priority: c(R),
      project: r() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: c(te).length > 0 ? c(te) : null,
      selected_elements: c(q).length > 0 ? c(q) : null,
      screenshots: c(L).length > 0 ? c(L) : null,
      metadata: Object.keys($).length > 0 ? $ : null
    };
    try {
      const T = await Da(n(), D);
      T.ok ? (De(`Report submitted (${T.id})`, "success"), It(), setTimeout(
        () => {
          w(), E(d, "requests");
        },
        1200
      )) : (uo(n(), D), De("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      uo(n(), D), De("Queued for retry (endpoint unreachable)", "error");
    } finally {
      E(ne, !1);
    }
  }
  function It() {
    E(A, ""), E(k, ""), E(j, "bug"), E(R, "medium"), E(L, [], !0), E(q, [], !0), E(te, [], !0);
  }
  xi(() => {
    ae();
  });
  const hn = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], Lt = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function Vn() {
    return c(L).length + c(q).length;
  }
  var Ys = {
    get endpoint() {
      return n();
    },
    set endpoint(p) {
      n(p), W();
    },
    get project() {
      return r();
    },
    set project(p) {
      r(p), W();
    },
    get userId() {
      return s();
    },
    set userId(p = "") {
      s(p), W();
    },
    get userEmail() {
      return i();
    },
    set userEmail(p = "") {
      i(p), W();
    },
    get userName() {
      return o();
    },
    set userName(p = "") {
      o(p), W();
    },
    get userRole() {
      return a();
    },
    set userRole(p = "") {
      a(p), W();
    },
    get orgId() {
      return l();
    },
    set orgId(p = "") {
      l(p), W();
    },
    get orgName() {
      return u();
    },
    set orgName(p = "") {
      u(p), W();
    },
    get onclose() {
      return f();
    },
    set onclose(p) {
      f(p), W();
    },
    get ongrip() {
      return v();
    },
    set ongrip(p) {
      v(p), W();
    }
  }, xr = Rd(), Mt = x(xr), kr = x(Mt);
  {
    var Gs = (p) => {
      var $ = wd();
      ee("mousedown", $, function(...D) {
        var T;
        (T = v()) == null || T.apply(this, D);
      }), S(p, $);
    };
    F(kr, (p) => {
      v() && p(Gs);
    });
  }
  var Er = C(kr, 2), Qt = x(Er);
  let Sr;
  var Wn = C(Qt, 2);
  let rs;
  var ss = C(x(Wn), 2);
  {
    var Xs = (p) => {
      var $ = yd(), D = x($, !0);
      y($), M(() => V(D, c(h))), S(p, $);
    };
    F(ss, (p) => {
      c(h) > 0 && p(Xs);
    });
  }
  y(Wn), y(Er);
  var Ks = C(Er, 2);
  y(Mt);
  var is = C(Mt, 2);
  {
    var Zs = (p) => {
      var $ = Nd(), D = x($), T = C(x(D), 2);
      qc(T), y(D);
      var Se = C(D, 2), _e = C(x(Se), 2);
      aa(_e), y(Se);
      var Re = C(Se, 2), gn = x(Re), Yn = C(x(gn), 2);
      Ve(Yn, 21, () => hn, ut, (z, Q) => {
        var le = xd(), Fe = x(le, !0);
        y(le);
        var Ce = {};
        M(() => {
          V(Fe, c(Q).label), Ce !== (Ce = c(Q).value) && (le.value = (le.__value = c(Q).value) ?? "");
        }), S(z, le);
      }), y(Yn), y(gn);
      var Gn = C(gn, 2), Xn = C(x(Gn), 2);
      Ve(Xn, 21, () => Lt, ut, (z, Q) => {
        var le = kd(), Fe = x(le, !0);
        y(le);
        var Ce = {};
        M(() => {
          V(Fe, c(Q).label), Ce !== (Ce = c(Q).value) && (le.value = (le.__value = c(Q).value) ?? "");
        }), S(z, le);
      }), y(Xn), y(Gn), y(Re);
      var en = C(Re, 2), os = x(en);
      il(os, {
        get screenshots() {
          return c(L);
        },
        get capturing() {
          return c(oe);
        },
        oncapture: Jt,
        onremove: I
      });
      var Kn = C(os, 2), as = C(x(Kn), 2);
      {
        var ei = (z) => {
          var Q = io("Click an element...");
          S(z, Q);
        }, ti = (z) => {
          var Q = Sd(), le = C(zt(Q));
          {
            var Fe = (Ce) => {
              var qt = Ed(), _n = x(qt, !0);
              y(qt), M(() => V(_n, c(q).length)), S(Ce, qt);
            };
            F(le, (Ce) => {
              c(q).length > 0 && Ce(Fe);
            });
          }
          S(z, Q);
        };
        F(as, (z) => {
          c(Pe) ? z(ei) : z(ti, !1);
        });
      }
      y(Kn), y(en);
      var tn = C(en, 2);
      {
        var mn = (z) => {
          var Q = $d();
          Ve(Q, 21, () => c(q), ut, (le, Fe, Ce) => {
            var qt = Cd(), _n = x(qt), si = x(_n);
            y(_n);
            var H = C(_n, 2), Z = x(H, !0);
            y(H);
            var ie = C(H, 2);
            y(qt), M(
              (he, Ke) => {
                V(si, `<${he ?? ""}>`), V(Z, Ke);
              },
              [
                () => c(Fe).tagName.toLowerCase(),
                () => {
                  var he;
                  return ((he = c(Fe).textContent) == null ? void 0 : he.substring(0, 40)) || c(Fe).selector;
                }
              ]
            ), ee("click", ie, () => {
              E(q, c(q).filter((he, Ke) => Ke !== Ce), !0);
            }), S(le, qt);
          }), y(Q), S(z, Q);
        };
        F(tn, (z) => {
          c(q).length > 0 && z(mn);
        });
      }
      var bn = C(tn, 2);
      ol(bn, {
        get logs() {
          return c(te);
        }
      });
      var Zn = C(bn, 2);
      {
        var Jn = (z) => {
          var Q = Ad(), le = x(Q);
          y(Q), M((Fe, Ce) => V(le, `${Fe ?? ""} attachment${Ce ?? ""} will be included`), [Vn, () => Vn() > 1 ? "s" : ""]), S(z, Q);
        }, ni = /* @__PURE__ */ yt(() => Vn() > 0);
        F(Zn, (z) => {
          c(ni) && z(Jn);
        });
      }
      var Cr = C(Zn, 2), $r = x(Cr), Ar = C($r, 2), ls = x(Ar);
      {
        var ri = (z) => {
          var Q = Td();
          Ur(), S(z, Q);
        }, cs = (z) => {
          var Q = io("Submit");
          S(z, Q);
        };
        F(ls, (z) => {
          c(ne) ? z(ri) : z(cs, !1);
        });
      }
      y(Ar), y(Cr), y($), M(
        (z) => {
          T.disabled = c(ne), _e.disabled = c(ne), Yn.disabled = c(ne), Xn.disabled = c(ne), Kn.disabled = c(Pe), $r.disabled = c(ne), Ar.disabled = z;
        },
        [() => c(ne) || !c(A).trim()]
      ), wc("submit", $, at), $i(T, () => c(A), (z) => E(A, z)), $i(_e, () => c(k), (z) => E(k, z)), lo(Yn, () => c(j), (z) => E(j, z)), lo(Xn, () => c(R), (z) => E(R, z)), ee("click", Kn, pe), ee("click", $r, function(...z) {
        var Q;
        (Q = f()) == null || Q.apply(this, z);
      }), S(p, $);
    }, Js = (p) => {
      ll(p, {
        get endpoint() {
          return n();
        },
        get loading() {
          return c(b);
        },
        get error() {
          return c(_);
        },
        onreload: w,
        get reports() {
          return c(m);
        },
        set reports($) {
          E(m, $, !0);
        }
      });
    };
    F(is, (p) => {
      c(d) === "new" ? p(Zs) : p(Js, !1);
    });
  }
  var Qs = C(is, 2);
  return al(Qs, {
    get message() {
      return c(Ee);
    },
    get type() {
      return c(mt);
    },
    get visible() {
      return c(ot);
    }
  }), y(xr), M(() => {
    Sr = We(Qt, 1, "tab svelte-nv4d5v", null, Sr, { active: c(d) === "new" }), rs = We(Wn, 1, "tab svelte-nv4d5v", null, rs, { active: c(d) === "requests" });
  }), ee("click", Qt, () => E(d, "new")), ee("click", Wn, () => E(d, "requests")), ee("click", Ks, function(...p) {
    var $;
    ($ = f()) == null || $.apply(this, p);
  }), S(e, xr), pn(Ys);
}
Us(["mousedown", "click"]);
Hn(
  cl,
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
var Id = /* @__PURE__ */ N("<div><!></div>"), Ld = /* @__PURE__ */ N('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), Md = /* @__PURE__ */ N('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const qd = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.jat-feedback-panel.hidden.svelte-qpyrvv {display:none;}.jat-feedback-panel.dragging.svelte-qpyrvv {pointer-events:none;opacity:0.9;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function Pd(e, t) {
  vn(t, !0), Un(e, qd);
  let n = X(t, "endpoint", 7, ""), r = X(t, "project", 7, ""), s = X(t, "position", 7, "bottom-right"), i = X(t, "theme", 7, "dark"), o = X(t, "buttoncolor", 7, "#3b82f6"), a = X(t, "user-id", 7, ""), l = X(t, "user-email", 7, ""), u = X(t, "user-name", 7, ""), f = X(t, "user-role", 7, ""), v = X(t, "org-id", 7, ""), d = X(t, "org-name", 7, ""), m = /* @__PURE__ */ U(!1), b = /* @__PURE__ */ U(!1), _ = /* @__PURE__ */ U(!1), h = { x: 0, y: 0 }, w = /* @__PURE__ */ U(void 0);
  function A(I) {
    if (!c(w)) return;
    E(_, !0);
    const pe = c(w).getBoundingClientRect();
    h = { x: I.clientX - pe.left, y: I.clientY - pe.top };
    function ae(It) {
      if (!c(_) || !c(w)) return;
      It.preventDefault();
      const hn = It.clientX - h.x, Lt = It.clientY - h.y;
      c(w).style.top = `${Lt}px`, c(w).style.left = `${hn}px`, c(w).style.bottom = "auto", c(w).style.right = "auto";
    }
    function at() {
      E(_, !1), window.removeEventListener("mousemove", ae), window.removeEventListener("mouseup", at);
    }
    window.addEventListener("mousemove", ae), window.addEventListener("mouseup", at);
  }
  let k = null;
  function j() {
    k = setInterval(
      () => {
        const I = nf();
        I && !c(b) ? E(b, !0) : !I && c(b) && E(b, !1);
      },
      100
    );
  }
  let R = /* @__PURE__ */ yt(() => ({
    ...Lr,
    endpoint: n() || Lr.endpoint,
    position: s() || Lr.position,
    theme: i() || Lr.theme,
    buttonColor: o() || Lr.buttonColor
  }));
  function L() {
    E(m, !c(m));
  }
  function q() {
    E(m, !1);
  }
  const te = {
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
  function oe(I) {
    I.key === "Escape" && c(m) && (I.stopPropagation(), I.stopImmediatePropagation(), q());
  }
  $a(() => {
    c(R).captureConsole && Xc(c(R).maxConsoleLogs), lf(), j(), window.addEventListener("keydown", oe, !0);
    const I = () => {
      E(m, !0);
    };
    return window.addEventListener("jat-feedback:open", I), () => window.removeEventListener("jat-feedback:open", I);
  }), Cc(() => {
    Kc(), cf(), window.removeEventListener("keydown", oe, !0), k && clearInterval(k);
  });
  var Pe = {
    get endpoint() {
      return n();
    },
    set endpoint(I = "") {
      n(I), W();
    },
    get project() {
      return r();
    },
    set project(I = "") {
      r(I), W();
    },
    get position() {
      return s();
    },
    set position(I = "bottom-right") {
      s(I), W();
    },
    get theme() {
      return i();
    },
    set theme(I = "dark") {
      i(I), W();
    },
    get buttoncolor() {
      return o();
    },
    set buttoncolor(I = "#3b82f6") {
      o(I), W();
    },
    get "user-id"() {
      return a();
    },
    set "user-id"(I = "") {
      a(I), W();
    },
    get "user-email"() {
      return l();
    },
    set "user-email"(I = "") {
      l(I), W();
    },
    get "user-name"() {
      return u();
    },
    set "user-name"(I = "") {
      u(I), W();
    },
    get "user-role"() {
      return f();
    },
    set "user-role"(I = "") {
      f(I), W();
    },
    get "org-id"() {
      return v();
    },
    set "org-id"(I = "") {
      v(I), W();
    },
    get "org-name"() {
      return d();
    },
    set "org-name"(I = "") {
      d(I), W();
    }
  }, Ee = Md(), mt = x(Ee);
  {
    var ot = (I) => {
      var pe = Id();
      let ae;
      var at = x(pe);
      cl(at, {
        get endpoint() {
          return c(R).endpoint;
        },
        get project() {
          return r();
        },
        get userId() {
          return a();
        },
        get userEmail() {
          return l();
        },
        get userName() {
          return u();
        },
        get userRole() {
          return f();
        },
        get orgId() {
          return v();
        },
        get orgName() {
          return d();
        },
        onclose: q,
        ongrip: A
      }), y(pe), M(() => {
        ae = We(pe, 1, "jat-feedback-panel svelte-qpyrvv", null, ae, { dragging: c(_), hidden: !c(m) }), Fr(pe, ne[c(R).position] || ne["bottom-right"]);
      }), S(I, pe);
    }, De = (I) => {
      var pe = Ld();
      M(() => Fr(pe, ne[c(R).position] || ne["bottom-right"])), S(I, pe);
    };
    F(mt, (I) => {
      c(R).endpoint ? I(ot) : c(m) && I(De, 1);
    });
  }
  var Jt = C(mt, 2);
  return Ba(Jt, {
    onclick: L,
    get open() {
      return c(m);
    }
  }), y(Ee), Fc(Ee, (I) => E(w, I), () => c(w)), M(() => Fr(Ee, `${(te[c(R).position] || te["bottom-right"]) ?? ""}; --jat-btn-color: ${c(R).buttonColor ?? ""}; ${c(b) ? "display: none;" : ""}`)), S(e, Ee), pn(Pe);
}
customElements.define("jat-feedback", Hn(
  Pd,
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
