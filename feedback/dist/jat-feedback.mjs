var ql = Object.defineProperty;
var fi = (e) => {
  throw TypeError(e);
};
var Ol = (e, t, n) => t in e ? ql(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Ce = (e, t, n) => Ol(e, typeof t != "symbol" ? t + "" : t, n), ko = (e, t, n) => t.has(e) || fi("Cannot " + n);
var m = (e, t, n) => (ko(e, t, "read from private field"), n ? n.call(e) : t.get(e)), Z = (e, t, n) => t.has(e) ? fi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), Y = (e, t, n, r) => (ko(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), Me = (e, t, n) => (ko(e, t, "access private method"), n);
var qi;
typeof window < "u" && ((qi = window.__svelte ?? (window.__svelte = {})).v ?? (qi.v = /* @__PURE__ */ new Set())).add("5");
const zl = 1, Bl = 2, Vi = 4, Ul = 8, Hl = 16, Vl = 1, Wl = 4, Yl = 8, Kl = 16, Xl = 4, Wi = 1, Gl = 2, Vo = "[", io = "[!", Wo = "]", br = {}, qe = Symbol(), Yi = "http://www.w3.org/1999/xhtml", Co = !1;
var Yo = Array.isArray, Jl = Array.prototype.indexOf, Xr = Array.prototype.includes, ao = Array.from, Ws = Object.keys, Ys = Object.defineProperty, dr = Object.getOwnPropertyDescriptor, Zl = Object.getOwnPropertyDescriptors, Ql = Object.prototype, ec = Array.prototype, Ki = Object.getPrototypeOf, ui = Object.isExtensible;
function tc(e) {
  return typeof e == "function";
}
const qr = () => {
};
function nc(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Xi() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const Be = 2, bs = 4, lo = 8, Gi = 1 << 24, gn = 16, Xt = 32, Wn = 64, Ji = 128, Nt = 512, Pe = 1024, Ue = 2048, Kt = 4096, wt = 8192, Rn = 16384, Er = 32768, _r = 65536, di = 1 << 17, Zi = 1 << 18, Sr = 1 << 19, rc = 1 << 20, Tn = 1 << 25, wr = 65536, Ao = 1 << 21, Ko = 1 << 22, Un = 1 << 23, vr = Symbol("$state"), Qi = Symbol("legacy props"), sc = Symbol(""), rr = new class extends Error {
  constructor() {
    super(...arguments);
    Ce(this, "name", "StaleReactionError");
    Ce(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
var Oi, zi;
const oc = ((zi = (Oi = globalThis.document) == null ? void 0 : Oi.contentType) == null ? void 0 : /* @__PURE__ */ zi.includes("xml")) ?? !1, As = 3, $r = 8;
function ea(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function ic() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function ac(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function lc(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function cc() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function fc(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function uc() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function dc() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function vc(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function pc() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function hc() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function gc() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function mc() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function Ts(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function bc() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function _c() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let Q = !1;
function Nn(e) {
  Q = e;
}
let J;
function Xe(e) {
  if (e === null)
    throw Ts(), br;
  return J = e;
}
function yr() {
  return Xe(/* @__PURE__ */ Gt(J));
}
function y(e) {
  if (Q) {
    if (/* @__PURE__ */ Gt(J) !== null)
      throw Ts(), br;
    J = e;
  }
}
function Ks(e = 1) {
  if (Q) {
    for (var t = e, n = J; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ Gt(n);
    J = n;
  }
}
function Xs(e = !0) {
  for (var t = 0, n = J; ; ) {
    if (n.nodeType === $r) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Wo) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Vo || r === io || // "[1", "[2", etc. for if blocks
      r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
    }
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Gt(n)
    );
    e && n.remove(), n = s;
  }
}
function ta(e) {
  if (!e || e.nodeType !== $r)
    throw Ts(), br;
  return (
    /** @type {Comment} */
    e.data
  );
}
function na(e) {
  return e === this.v;
}
function wc(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function ra(e) {
  return !wc(e, this.v);
}
let yc = !1, ft = null;
function Gr(e) {
  ft = e;
}
function In(e, t = !1, n) {
  ft = {
    p: ft,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: null
  };
}
function Mn(e) {
  var t = (
    /** @type {ComponentContext} */
    ft
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ta(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, ft = t.p, e ?? /** @type {T} */
  {};
}
function sa() {
  return !0;
}
let sr = [];
function oa() {
  var e = sr;
  sr = [], nc(e);
}
function Yt(e) {
  if (sr.length === 0 && !ps) {
    var t = sr;
    queueMicrotask(() => {
      t === sr && oa();
    });
  }
  sr.push(e);
}
function xc() {
  for (; sr.length > 0; )
    oa();
}
function ia(e) {
  var t = le;
  if (t === null)
    return re.f |= Un, e;
  if ((t.f & Er) === 0 && (t.f & bs) === 0)
    throw e;
  Jr(e, t);
}
function Jr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ji) !== 0) {
      if ((t.f & Er) === 0)
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
const kc = -7169;
function Ae(e, t) {
  e.f = e.f & kc | t;
}
function Xo(e) {
  (e.f & Nt) !== 0 || e.deps === null ? Ae(e, Pe) : Ae(e, Kt);
}
function aa(e) {
  if (e !== null)
    for (const t of e)
      (t.f & Be) === 0 || (t.f & wr) === 0 || (t.f ^= wr, aa(
        /** @type {Derived} */
        t.deps
      ));
}
function la(e, t, n) {
  (e.f & Ue) !== 0 ? t.add(e) : (e.f & Kt) !== 0 && n.add(e), aa(e.deps), Ae(e, Pe);
}
const Ls = /* @__PURE__ */ new Set();
let G = null, Gs = null, Oe = null, it = [], co = null, To = !1, ps = !1;
var Br, Ur, ir, Hr, ks, Es, ar, kn, Vr, hn, No, Ro, ca;
const ci = class ci {
  constructor() {
    Z(this, hn);
    Ce(this, "committed", !1);
    /**
     * The current values of any sources that are updated in this batch
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Source, any>}
     */
    Ce(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any sources that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Source, any>}
     */
    Ce(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<() => void>}
     */
    Z(this, Br, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    Z(this, Ur, /* @__PURE__ */ new Set());
    /**
     * The number of async effects that are currently in flight
     */
    Z(this, ir, 0);
    /**
     * The number of async effects that are currently in flight, _not_ inside a pending boundary
     */
    Z(this, Hr, 0);
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    Z(this, ks, null);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    Z(this, Es, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    Z(this, ar, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    Z(this, kn, /* @__PURE__ */ new Map());
    Ce(this, "is_fork", !1);
    Z(this, Vr, !1);
  }
  is_deferred() {
    return this.is_fork || m(this, Hr) > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    m(this, kn).has(t) || m(this, kn).set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = m(this, kn).get(t);
    if (n) {
      m(this, kn).delete(t);
      for (var r of n.d)
        Ae(r, Ue), Vt(r);
      for (r of n.m)
        Ae(r, Kt), Vt(r);
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    var s;
    it = [], this.apply();
    var n = [], r = [];
    for (const o of t)
      Me(this, hn, No).call(this, o, n, r);
    if (this.is_deferred()) {
      Me(this, hn, Ro).call(this, r), Me(this, hn, Ro).call(this, n);
      for (const [o, i] of m(this, kn))
        va(o, i);
    } else {
      for (const o of m(this, Br)) o();
      m(this, Br).clear(), m(this, ir) === 0 && Me(this, hn, ca).call(this), Gs = this, G = null, vi(r), vi(n), Gs = null, (s = m(this, ks)) == null || s.resolve();
    }
    Oe = null;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    n !== qe && !this.previous.has(t) && this.previous.set(t, n), (t.f & Un) === 0 && (this.current.set(t, t.v), Oe == null || Oe.set(t, t.v));
  }
  activate() {
    G = this, this.apply();
  }
  deactivate() {
    G === this && (G = null, Oe = null);
  }
  flush() {
    if (this.activate(), it.length > 0) {
      if (fa(), G !== null && G !== this)
        return;
    } else m(this, ir) === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of m(this, Ur)) t(this);
    m(this, Ur).clear();
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    Y(this, ir, m(this, ir) + 1), t && Y(this, Hr, m(this, Hr) + 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    Y(this, ir, m(this, ir) - 1), t && Y(this, Hr, m(this, Hr) - 1), !m(this, Vr) && (Y(this, Vr, !0), Yt(() => {
      Y(this, Vr, !1), this.is_deferred() ? it.length > 0 && this.flush() : this.revive();
    }));
  }
  revive() {
    for (const t of m(this, Es))
      m(this, ar).delete(t), Ae(t, Ue), Vt(t);
    for (const t of m(this, ar))
      Ae(t, Kt), Vt(t);
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    m(this, Br).add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    m(this, Ur).add(t);
  }
  settled() {
    return (m(this, ks) ?? Y(this, ks, Xi())).promise;
  }
  static ensure() {
    if (G === null) {
      const t = G = new ci();
      Ls.add(G), ps || Yt(() => {
        G === t && t.flush();
      });
    }
    return G;
  }
  apply() {
  }
};
Br = new WeakMap(), Ur = new WeakMap(), ir = new WeakMap(), Hr = new WeakMap(), ks = new WeakMap(), Es = new WeakMap(), ar = new WeakMap(), kn = new WeakMap(), Vr = new WeakMap(), hn = new WeakSet(), /**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
No = function(t, n, r) {
  t.f ^= Pe;
  for (var s = t.first, o = null; s !== null; ) {
    var i = s.f, l = (i & (Xt | Wn)) !== 0, c = l && (i & Pe) !== 0, u = c || (i & wt) !== 0 || m(this, kn).has(s);
    if (!u && s.fn !== null) {
      l ? s.f ^= Pe : o !== null && (i & (bs | lo | Gi)) !== 0 ? o.b.defer_effect(s) : (i & bs) !== 0 ? n.push(s) : Ns(s) && ((i & gn) !== 0 && m(this, ar).add(s), Qr(s));
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
Ro = function(t) {
  for (var n = 0; n < t.length; n += 1)
    la(t[n], m(this, Es), m(this, ar));
}, ca = function() {
  var s;
  if (Ls.size > 1) {
    this.previous.clear();
    var t = Oe, n = !0;
    for (const o of Ls) {
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
        var r = it;
        it = [];
        const c = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (const f of i)
          ua(f, l, c, u);
        if (it.length > 0) {
          G = o, o.apply();
          for (const f of it)
            Me(s = o, hn, No).call(s, f, [], []);
          o.deactivate();
        }
        it = r;
      }
    }
    G = null, Oe = t;
  }
  this.committed = !0, Ls.delete(this);
};
let jn = ci;
function W(e) {
  var t = ps;
  ps = !0;
  try {
    for (var n; ; ) {
      if (xc(), it.length === 0 && (G == null || G.flush(), it.length === 0))
        return co = null, /** @type {T} */
        n;
      fa();
    }
  } finally {
    ps = t;
  }
}
function fa() {
  To = !0;
  var e = null;
  try {
    for (var t = 0; it.length > 0; ) {
      var n = jn.ensure();
      if (t++ > 1e3) {
        var r, s;
        Ec();
      }
      n.process(it), Hn.clear();
    }
  } finally {
    it = [], To = !1, co = null;
  }
}
function Ec() {
  try {
    uc();
  } catch (e) {
    Jr(e, co);
  }
}
let Ut = null;
function vi(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (Rn | wt)) === 0 && Ns(r) && (Ut = /* @__PURE__ */ new Set(), Qr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && ja(r), (Ut == null ? void 0 : Ut.size) > 0)) {
        Hn.clear();
        for (const s of Ut) {
          if ((s.f & (Rn | wt)) !== 0) continue;
          const o = [s];
          let i = s.parent;
          for (; i !== null; )
            Ut.has(i) && (Ut.delete(i), o.push(i)), i = i.parent;
          for (let l = o.length - 1; l >= 0; l--) {
            const c = o[l];
            (c.f & (Rn | wt)) === 0 && Qr(c);
          }
        }
        Ut.clear();
      }
    }
    Ut = null;
  }
}
function ua(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const o = s.f;
      (o & Be) !== 0 ? ua(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (o & (Ko | gn)) !== 0 && (o & Ue) === 0 && da(s, t, r) && (Ae(s, Ue), Vt(
        /** @type {Effect} */
        s
      ));
    }
}
function da(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (Xr.call(t, s))
        return !0;
      if ((s.f & Be) !== 0 && da(
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
function Vt(e) {
  for (var t = co = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (To && t === le && (n & gn) !== 0 && (n & Zi) === 0)
      return;
    if ((n & (Wn | Xt)) !== 0) {
      if ((n & Pe) === 0) return;
      t.f ^= Pe;
    }
  }
  it.push(t);
}
function va(e, t) {
  if (!((e.f & Xt) !== 0 && (e.f & Pe) !== 0)) {
    (e.f & Ue) !== 0 ? t.d.push(e) : (e.f & Kt) !== 0 && t.m.push(e), Ae(e, Pe);
    for (var n = e.first; n !== null; )
      va(n, t), n = n.next;
  }
}
function Sc(e) {
  let t = 0, n = xr(0), r;
  return () => {
    Qo() && (a(n), po(() => (t === 0 && (r = Cr(() => e(() => hs(n)))), t += 1, () => {
      Yt(() => {
        t -= 1, t === 0 && (r == null || r(), r = void 0, hs(n));
      });
    })));
  };
}
var $c = _r | Sr | Ji;
function Cc(e, t, n) {
  new Ac(e, t, n);
}
var mt, Ss, ln, lr, cn, St, ot, fn, En, Bn, cr, Sn, Wr, fr, Yr, Kr, $n, so, Ne, pa, ha, jo, Fs, qs, Io;
class Ac {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    Z(this, Ne);
    /** @type {Boundary | null} */
    Ce(this, "parent");
    Ce(this, "is_pending", !1);
    /** @type {TemplateNode} */
    Z(this, mt);
    /** @type {TemplateNode | null} */
    Z(this, Ss, Q ? J : null);
    /** @type {BoundaryProps} */
    Z(this, ln);
    /** @type {((anchor: Node) => void)} */
    Z(this, lr);
    /** @type {Effect} */
    Z(this, cn);
    /** @type {Effect | null} */
    Z(this, St, null);
    /** @type {Effect | null} */
    Z(this, ot, null);
    /** @type {Effect | null} */
    Z(this, fn, null);
    /** @type {DocumentFragment | null} */
    Z(this, En, null);
    /** @type {TemplateNode | null} */
    Z(this, Bn, null);
    Z(this, cr, 0);
    Z(this, Sn, 0);
    Z(this, Wr, !1);
    Z(this, fr, !1);
    /** @type {Set<Effect>} */
    Z(this, Yr, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    Z(this, Kr, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    Z(this, $n, null);
    Z(this, so, Sc(() => (Y(this, $n, xr(m(this, cr))), () => {
      Y(this, $n, null);
    })));
    Y(this, mt, t), Y(this, ln, n), Y(this, lr, r), this.parent = /** @type {Effect} */
    le.b, this.is_pending = !!m(this, ln).pending, Y(this, cn, ho(() => {
      if (le.b = this, Q) {
        const o = m(this, Ss);
        yr(), /** @type {Comment} */
        o.nodeType === $r && /** @type {Comment} */
        o.data === io ? Me(this, Ne, ha).call(this) : (Me(this, Ne, pa).call(this), m(this, Sn) === 0 && (this.is_pending = !1));
      } else {
        var s = Me(this, Ne, jo).call(this);
        try {
          Y(this, St, Ct(() => r(s)));
        } catch (o) {
          this.error(o);
        }
        m(this, Sn) > 0 ? Me(this, Ne, qs).call(this) : this.is_pending = !1;
      }
      return () => {
        var o;
        (o = m(this, Bn)) == null || o.remove();
      };
    }, $c)), Q && Y(this, mt, J);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    la(t, m(this, Yr), m(this, Kr));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!m(this, ln).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    Me(this, Ne, Io).call(this, t), Y(this, cr, m(this, cr) + t), !(!m(this, $n) || m(this, Wr)) && (Y(this, Wr, !0), Yt(() => {
      Y(this, Wr, !1), m(this, $n) && Zr(m(this, $n), m(this, cr));
    }));
  }
  get_effect_pending() {
    return m(this, so).call(this), a(
      /** @type {Source<number>} */
      m(this, $n)
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = m(this, ln).onerror;
    let r = m(this, ln).failed;
    if (m(this, fr) || !n && !r)
      throw t;
    m(this, St) && (et(m(this, St)), Y(this, St, null)), m(this, ot) && (et(m(this, ot)), Y(this, ot, null)), m(this, fn) && (et(m(this, fn)), Y(this, fn, null)), Q && (Xe(
      /** @type {TemplateNode} */
      m(this, Ss)
    ), Ks(), Xe(Xs()));
    var s = !1, o = !1;
    const i = () => {
      if (s) {
        _c();
        return;
      }
      s = !0, o && mc(), jn.ensure(), Y(this, cr, 0), m(this, fn) !== null && pr(m(this, fn), () => {
        Y(this, fn, null);
      }), this.is_pending = this.has_pending_snippet(), Y(this, St, Me(this, Ne, Fs).call(this, () => (Y(this, fr, !1), Ct(() => m(this, lr).call(this, m(this, mt)))))), m(this, Sn) > 0 ? Me(this, Ne, qs).call(this) : this.is_pending = !1;
    };
    Yt(() => {
      try {
        o = !0, n == null || n(t, i), o = !1;
      } catch (l) {
        Jr(l, m(this, cn) && m(this, cn).parent);
      }
      r && Y(this, fn, Me(this, Ne, Fs).call(this, () => {
        jn.ensure(), Y(this, fr, !0);
        try {
          return Ct(() => {
            r(
              m(this, mt),
              () => t,
              () => i
            );
          });
        } catch (l) {
          return Jr(
            l,
            /** @type {Effect} */
            m(this, cn).parent
          ), null;
        } finally {
          Y(this, fr, !1);
        }
      }));
    });
  }
}
mt = new WeakMap(), Ss = new WeakMap(), ln = new WeakMap(), lr = new WeakMap(), cn = new WeakMap(), St = new WeakMap(), ot = new WeakMap(), fn = new WeakMap(), En = new WeakMap(), Bn = new WeakMap(), cr = new WeakMap(), Sn = new WeakMap(), Wr = new WeakMap(), fr = new WeakMap(), Yr = new WeakMap(), Kr = new WeakMap(), $n = new WeakMap(), so = new WeakMap(), Ne = new WeakSet(), pa = function() {
  try {
    Y(this, St, Ct(() => m(this, lr).call(this, m(this, mt))));
  } catch (t) {
    this.error(t);
  }
}, ha = function() {
  const t = m(this, ln).pending;
  t && (Y(this, ot, Ct(() => t(m(this, mt)))), Yt(() => {
    var n = Me(this, Ne, jo).call(this);
    Y(this, St, Me(this, Ne, Fs).call(this, () => (jn.ensure(), Ct(() => m(this, lr).call(this, n))))), m(this, Sn) > 0 ? Me(this, Ne, qs).call(this) : (pr(
      /** @type {Effect} */
      m(this, ot),
      () => {
        Y(this, ot, null);
      }
    ), this.is_pending = !1);
  }));
}, jo = function() {
  var t = m(this, mt);
  return this.is_pending && (Y(this, Bn, ct()), m(this, mt).before(m(this, Bn)), t = m(this, Bn)), t;
}, /**
 * @param {() => Effect | null} fn
 */
Fs = function(t) {
  var n = le, r = re, s = ft;
  vn(m(this, cn)), jt(m(this, cn)), Gr(m(this, cn).ctx);
  try {
    return t();
  } catch (o) {
    return ia(o), null;
  } finally {
    vn(n), jt(r), Gr(s);
  }
}, qs = function() {
  const t = (
    /** @type {(anchor: Node) => void} */
    m(this, ln).pending
  );
  m(this, St) !== null && (Y(this, En, document.createDocumentFragment()), m(this, En).append(
    /** @type {TemplateNode} */
    m(this, Bn)
  ), La(m(this, St), m(this, En))), m(this, ot) === null && Y(this, ot, Ct(() => t(m(this, mt))));
}, /**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 */
Io = function(t) {
  var n;
  if (!this.has_pending_snippet()) {
    this.parent && Me(n = this.parent, Ne, Io).call(n, t);
    return;
  }
  if (Y(this, Sn, m(this, Sn) + t), m(this, Sn) === 0) {
    this.is_pending = !1;
    for (const r of m(this, Yr))
      Ae(r, Ue), Vt(r);
    for (const r of m(this, Kr))
      Ae(r, Kt), Vt(r);
    m(this, Yr).clear(), m(this, Kr).clear(), m(this, ot) && pr(m(this, ot), () => {
      Y(this, ot, null);
    }), m(this, En) && (m(this, mt).before(m(this, En)), Y(this, En, null));
  }
};
function Tc(e, t, n, r) {
  const s = fo;
  var o = e.filter((v) => !v.settled);
  if (n.length === 0 && o.length === 0) {
    r(t.map(s));
    return;
  }
  var i = G, l = (
    /** @type {Effect} */
    le
  ), c = Nc(), u = o.length === 1 ? o[0].promise : o.length > 1 ? Promise.all(o.map((v) => v.promise)) : null;
  function f(v) {
    c();
    try {
      r(v);
    } catch (p) {
      (l.f & Rn) === 0 && Jr(p, l);
    }
    i == null || i.deactivate(), Mo();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(s)));
    return;
  }
  function d() {
    c(), Promise.all(n.map((v) => /* @__PURE__ */ Rc(v))).then((v) => f([...t.map(s), ...v])).catch((v) => Jr(v, l));
  }
  u ? u.then(d) : d();
}
function Nc() {
  var e = le, t = re, n = ft, r = G;
  return function(o = !0) {
    vn(e), jt(t), Gr(n), o && (r == null || r.activate());
  };
}
function Mo() {
  vn(null), jt(null), Gr(null);
}
// @__NO_SIDE_EFFECTS__
function fo(e) {
  var t = Be | Ue, n = re !== null && (re.f & Be) !== 0 ? (
    /** @type {Derived} */
    re
  ) : null;
  return le !== null && (le.f |= Sr), {
    ctx: ft,
    deps: null,
    effects: null,
    equals: na,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      qe
    ),
    wv: 0,
    parent: n ?? le,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Rc(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    le
  );
  r === null && ic();
  var s = (
    /** @type {Boundary} */
    r.b
  ), o = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = xr(
    /** @type {V} */
    qe
  ), l = !re, c = /* @__PURE__ */ new Map();
  return zc(() => {
    var p;
    var u = Xi();
    o = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).then(() => {
        f === G && f.committed && f.deactivate(), Mo();
      });
    } catch (_) {
      u.reject(_), Mo();
    }
    var f = (
      /** @type {Batch} */
      G
    );
    if (l) {
      var d = s.is_rendered();
      s.update_pending_count(1), f.increment(d), (p = c.get(f)) == null || p.reject(rr), c.delete(f), c.set(f, u);
    }
    const v = (_, b = void 0) => {
      if (f.activate(), b)
        b !== rr && (i.f |= Un, Zr(i, b));
      else {
        (i.f & Un) !== 0 && (i.f ^= Un), Zr(i, _);
        for (const [h, g] of c) {
          if (c.delete(h), h === f) break;
          g.reject(rr);
        }
      }
      l && (s.update_pending_count(-1), f.decrement(d));
    };
    u.promise.then(v, (_) => v(null, _ || "unknown"));
  }), ei(() => {
    for (const u of c.values())
      u.reject(rr);
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
function At(e) {
  const t = /* @__PURE__ */ fo(e);
  return Pa(t), t;
}
// @__NO_SIDE_EFFECTS__
function ga(e) {
  const t = /* @__PURE__ */ fo(e);
  return t.equals = ra, t;
}
function jc(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      et(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Ic(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & Be) === 0)
      return (t.f & Rn) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Go(e) {
  var t, n = le;
  vn(Ic(e));
  try {
    e.f &= ~wr, jc(e), t = Oa(e);
  } finally {
    vn(n);
  }
  return t;
}
function ma(e) {
  var t = Go(e);
  if (!e.equals(t) && (e.wv = Fa(), (!(G != null && G.is_fork) || e.deps === null) && (e.v = t, e.deps === null))) {
    Ae(e, Pe);
    return;
  }
  Vn || (Oe !== null ? (Qo() || G != null && G.is_fork) && Oe.set(e, t) : Xo(e));
}
function Mc(e) {
  var t, n;
  if (e.effects !== null)
    for (const r of e.effects)
      (r.teardown || r.ac) && ((t = r.teardown) == null || t.call(r), (n = r.ac) == null || n.abort(rr), r.teardown = qr, r.ac = null, _s(r, 0), ti(r));
}
function ba(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Qr(t);
}
let Lo = /* @__PURE__ */ new Set();
const Hn = /* @__PURE__ */ new Map();
let _a = !1;
function xr(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: na,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function D(e, t) {
  const n = xr(e);
  return Pa(n), n;
}
// @__NO_SIDE_EFFECTS__
function wa(e, t = !1, n = !0) {
  const r = xr(e);
  return t || (r.equals = ra), r;
}
function w(e, t, n = !1) {
  re !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Wt || (re.f & di) !== 0) && sa() && (re.f & (Be | gn | Ko | di)) !== 0 && (Rt === null || !Xr.call(Rt, e)) && gc();
  let r = n ? Le(t) : t;
  return Zr(e, r);
}
function Zr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    Vn ? Hn.set(e, t) : Hn.set(e, n), e.v = t;
    var r = jn.ensure();
    if (r.capture(e, n), (e.f & Be) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & Ue) !== 0 && Go(s), Xo(s);
    }
    e.wv = Fa(), ya(e, Ue), le !== null && (le.f & Pe) !== 0 && (le.f & (Xt | Wn)) === 0 && (Et === null ? Uc([e]) : Et.push(e)), !r.is_fork && Lo.size > 0 && !_a && Lc();
  }
  return t;
}
function Lc() {
  _a = !1;
  for (const e of Lo)
    (e.f & Pe) !== 0 && Ae(e, Kt), Ns(e) && Qr(e);
  Lo.clear();
}
function hs(e) {
  w(e, e.v + 1);
}
function ya(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var o = n[s], i = o.f, l = (i & Ue) === 0;
      if (l && Ae(o, t), (i & Be) !== 0) {
        var c = (
          /** @type {Derived} */
          o
        );
        Oe == null || Oe.delete(c), (i & wr) === 0 && (i & Nt && (o.f |= wr), ya(c, Kt));
      } else l && ((i & gn) !== 0 && Ut !== null && Ut.add(
        /** @type {Effect} */
        o
      ), Vt(
        /** @type {Effect} */
        o
      ));
    }
}
function Le(e) {
  if (typeof e != "object" || e === null || vr in e)
    return e;
  const t = Ki(e);
  if (t !== Ql && t !== ec)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Yo(e), s = /* @__PURE__ */ D(0), o = hr, i = (l) => {
    if (hr === o)
      return l();
    var c = re, u = hr;
    jt(null), bi(o);
    var f = l();
    return jt(c), bi(u), f;
  };
  return r && n.set("length", /* @__PURE__ */ D(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, c, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && pc();
        var f = n.get(c);
        return f === void 0 ? i(() => {
          var d = /* @__PURE__ */ D(u.value);
          return n.set(c, d), d;
        }) : w(f, u.value, !0), !0;
      },
      deleteProperty(l, c) {
        var u = n.get(c);
        if (u === void 0) {
          if (c in l) {
            const f = i(() => /* @__PURE__ */ D(qe));
            n.set(c, f), hs(s);
          }
        } else
          w(u, qe), hs(s);
        return !0;
      },
      get(l, c, u) {
        var p;
        if (c === vr)
          return e;
        var f = n.get(c), d = c in l;
        if (f === void 0 && (!d || (p = dr(l, c)) != null && p.writable) && (f = i(() => {
          var _ = Le(d ? l[c] : qe), b = /* @__PURE__ */ D(_);
          return b;
        }), n.set(c, f)), f !== void 0) {
          var v = a(f);
          return v === qe ? void 0 : v;
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
          if (d !== void 0 && v !== qe)
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
        if (c === vr)
          return !0;
        var u = n.get(c), f = u !== void 0 && u.v !== qe || Reflect.has(l, c);
        if (u !== void 0 || le !== null && (!f || (v = dr(l, c)) != null && v.writable)) {
          u === void 0 && (u = i(() => {
            var p = f ? Le(l[c]) : qe, _ = /* @__PURE__ */ D(p);
            return _;
          }), n.set(c, u));
          var d = a(u);
          if (d === qe)
            return !1;
        }
        return f;
      },
      set(l, c, u, f) {
        var k;
        var d = n.get(c), v = c in l;
        if (r && c === "length")
          for (var p = u; p < /** @type {Source<number>} */
          d.v; p += 1) {
            var _ = n.get(p + "");
            _ !== void 0 ? w(_, qe) : p in l && (_ = i(() => /* @__PURE__ */ D(qe)), n.set(p + "", _));
          }
        if (d === void 0)
          (!v || (k = dr(l, c)) != null && k.writable) && (d = i(() => /* @__PURE__ */ D(void 0)), w(d, Le(u)), n.set(c, d));
        else {
          v = d.v !== qe;
          var b = i(() => Le(u));
          w(d, b);
        }
        var h = Reflect.getOwnPropertyDescriptor(l, c);
        if (h != null && h.set && h.set.call(f, u), !v) {
          if (r && typeof c == "string") {
            var g = (
              /** @type {Source<number>} */
              n.get("length")
            ), T = Number(c);
            Number.isInteger(T) && T >= g.v && w(g, T + 1);
          }
          hs(s);
        }
        return !0;
      },
      ownKeys(l) {
        a(s);
        var c = Reflect.ownKeys(l).filter((d) => {
          var v = n.get(d);
          return v === void 0 || v.v !== qe;
        });
        for (var [u, f] of n)
          f.v !== qe && !(u in l) && c.push(u);
        return c;
      },
      setPrototypeOf() {
        hc();
      }
    }
  );
}
function pi(e) {
  try {
    if (e !== null && typeof e == "object" && vr in e)
      return e[vr];
  } catch {
  }
  return e;
}
function Pc(e, t) {
  return Object.is(pi(e), pi(t));
}
var hi, xa, ka, Ea;
function Po() {
  if (hi === void 0) {
    hi = window, xa = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    ka = dr(t, "firstChild").get, Ea = dr(t, "nextSibling").get, ui(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ui(n) && (n.__t = void 0);
  }
}
function ct(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ze(e) {
  return (
    /** @type {TemplateNode | null} */
    ka.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Gt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ea.call(e)
  );
}
function x(e, t) {
  if (!Q)
    return /* @__PURE__ */ ze(e);
  var n = /* @__PURE__ */ ze(J);
  if (n === null)
    n = J.appendChild(ct());
  else if (t && n.nodeType !== As) {
    var r = ct();
    return n == null || n.before(r), Xe(r), r;
  }
  return t && uo(
    /** @type {Text} */
    n
  ), Xe(n), n;
}
function _t(e, t = !1) {
  if (!Q) {
    var n = /* @__PURE__ */ ze(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Gt(n) : n;
  }
  if (t) {
    if ((J == null ? void 0 : J.nodeType) !== As) {
      var r = ct();
      return J == null || J.before(r), Xe(r), r;
    }
    uo(
      /** @type {Text} */
      J
    );
  }
  return J;
}
function S(e, t = 1, n = !1) {
  let r = Q ? J : e;
  for (var s; t--; )
    s = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ Gt(r);
  if (!Q)
    return r;
  if (n) {
    if ((r == null ? void 0 : r.nodeType) !== As) {
      var o = ct();
      return r === null ? s == null || s.after(o) : r.before(o), Xe(o), o;
    }
    uo(
      /** @type {Text} */
      r
    );
  }
  return Xe(r), r;
}
function Jo(e) {
  e.textContent = "";
}
function Sa() {
  return !1;
}
function Zo(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Yi, e, void 0)
  );
}
function uo(e) {
  if (
    /** @type {string} */
    e.nodeValue.length < 65536
  )
    return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === As; )
    t.remove(), e.nodeValue += /** @type {string} */
    t.nodeValue, t = e.nextSibling;
}
function $a(e) {
  Q && /* @__PURE__ */ ze(e) !== null && Jo(e);
}
let gi = !1;
function Ca() {
  gi || (gi = !0, document.addEventListener(
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
function ns(e) {
  var t = re, n = le;
  jt(null), vn(null);
  try {
    return e();
  } finally {
    jt(t), vn(n);
  }
}
function Aa(e, t, n, r = n) {
  e.addEventListener(t, () => ns(n));
  const s = e.__on_r;
  s ? e.__on_r = () => {
    s(), r(!0);
  } : e.__on_r = () => r(!0), Ca();
}
function Dc(e) {
  le === null && (re === null && fc(), cc()), Vn && lc();
}
function Fc(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function mn(e, t, n) {
  var r = le;
  r !== null && (r.f & wt) !== 0 && (e |= wt);
  var s = {
    ctx: ft,
    deps: null,
    nodes: null,
    f: e | Ue | Nt,
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
      Qr(s);
    } catch (l) {
      throw et(s), l;
    }
  else t !== null && Vt(s);
  var o = s;
  if (n && o.deps === null && o.teardown === null && o.nodes === null && o.first === o.last && // either `null`, or a singular child
  (o.f & Sr) === 0 && (o = o.first, (e & gn) !== 0 && (e & _r) !== 0 && o !== null && (o.f |= _r)), o !== null && (o.parent = r, r !== null && Fc(o, r), re !== null && (re.f & Be) !== 0 && (e & Wn) === 0)) {
    var i = (
      /** @type {Derived} */
      re
    );
    (i.effects ?? (i.effects = [])).push(o);
  }
  return s;
}
function Qo() {
  return re !== null && !Wt;
}
function ei(e) {
  const t = mn(lo, null, !1);
  return Ae(t, Pe), t.teardown = e, t;
}
function Os(e) {
  Dc();
  var t = (
    /** @type {Effect} */
    le.f
  ), n = !re && (t & Xt) !== 0 && (t & Er) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      ft
    );
    (r.e ?? (r.e = [])).push(e);
  } else
    return Ta(e);
}
function Ta(e) {
  return mn(bs | rc, e, !1);
}
function qc(e) {
  jn.ensure();
  const t = mn(Wn | Sr, e, !0);
  return () => {
    et(t);
  };
}
function Oc(e) {
  jn.ensure();
  const t = mn(Wn | Sr, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? pr(t, () => {
      et(t), r(void 0);
    }) : (et(t), r(void 0));
  });
}
function vo(e) {
  return mn(bs, e, !1);
}
function zc(e) {
  return mn(Ko | Sr, e, !0);
}
function po(e, t = 0) {
  return mn(lo | t, e, !0);
}
function O(e, t = [], n = [], r = []) {
  Tc(r, t, n, (s) => {
    mn(lo, () => e(...s.map(a)), !0);
  });
}
function ho(e, t = 0) {
  var n = mn(gn | t, e, !0);
  return n;
}
function Ct(e) {
  return mn(Xt | Sr, e, !0);
}
function Na(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Vn, r = re;
    mi(!0), jt(null);
    try {
      t.call(null);
    } finally {
      mi(n), jt(r);
    }
  }
}
function ti(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && ns(() => {
      s.abort(rr);
    });
    var r = n.next;
    (n.f & Wn) !== 0 ? n.parent = null : et(n, t), n = r;
  }
}
function Bc(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Xt) === 0 && et(t), t = n;
  }
}
function et(e, t = !0) {
  var n = !1;
  (t || (e.f & Zi) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ra(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), ti(e, t && !n), _s(e, 0), Ae(e, Rn);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const o of r)
      o.stop();
  Na(e);
  var s = e.parent;
  s !== null && s.first !== null && ja(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Ra(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Gt(e);
    e.remove(), e = n;
  }
}
function ja(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function pr(e, t, n = !0) {
  var r = [];
  Ia(e, r, !0);
  var s = () => {
    n && et(e), t && t();
  }, o = r.length;
  if (o > 0) {
    var i = () => --o || s();
    for (var l of r)
      l.out(i);
  } else
    s();
}
function Ia(e, t, n) {
  if ((e.f & wt) === 0) {
    e.f ^= wt;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var s = e.first; s !== null; ) {
      var o = s.next, i = (s.f & _r) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & Xt) !== 0 && (e.f & gn) !== 0;
      Ia(s, t, i ? n : !1), s = o;
    }
  }
}
function ni(e) {
  Ma(e, !0);
}
function Ma(e, t) {
  if ((e.f & wt) !== 0) {
    e.f ^= wt, (e.f & Pe) === 0 && (Ae(e, Ue), Vt(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & _r) !== 0 || (n.f & Xt) !== 0;
      Ma(n, s ? t : !1), n = r;
    }
    var o = e.nodes && e.nodes.t;
    if (o !== null)
      for (const i of o)
        (i.is_global || t) && i.in();
  }
}
function La(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ Gt(n);
      t.append(n), n = s;
    }
}
let zs = !1, Vn = !1;
function mi(e) {
  Vn = e;
}
let re = null, Wt = !1;
function jt(e) {
  re = e;
}
let le = null;
function vn(e) {
  le = e;
}
let Rt = null;
function Pa(e) {
  re !== null && (Rt === null ? Rt = [e] : Rt.push(e));
}
let at = null, gt = 0, Et = null;
function Uc(e) {
  Et = e;
}
let Da = 1, or = 0, hr = or;
function bi(e) {
  hr = e;
}
function Fa() {
  return ++Da;
}
function Ns(e) {
  var t = e.f;
  if ((t & Ue) !== 0)
    return !0;
  if (t & Be && (e.f &= ~wr), (t & Kt) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var o = n[s];
      if (Ns(
        /** @type {Derived} */
        o
      ) && ma(
        /** @type {Derived} */
        o
      ), o.wv > e.wv)
        return !0;
    }
    (t & Nt) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Oe === null && Ae(e, Pe);
  }
  return !1;
}
function qa(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Rt !== null && Xr.call(Rt, e)))
    for (var s = 0; s < r.length; s++) {
      var o = r[s];
      (o.f & Be) !== 0 ? qa(
        /** @type {Derived} */
        o,
        t,
        !1
      ) : t === o && (n ? Ae(o, Ue) : (o.f & Pe) !== 0 && Ae(o, Kt), Vt(
        /** @type {Effect} */
        o
      ));
    }
}
function Oa(e) {
  var b;
  var t = at, n = gt, r = Et, s = re, o = Rt, i = ft, l = Wt, c = hr, u = e.f;
  at = /** @type {null | Value[]} */
  null, gt = 0, Et = null, re = (u & (Xt | Wn)) === 0 ? e : null, Rt = null, Gr(e.ctx), Wt = !1, hr = ++or, e.ac !== null && (ns(() => {
    e.ac.abort(rr);
  }), e.ac = null);
  try {
    e.f |= Ao;
    var f = (
      /** @type {Function} */
      e.fn
    ), d = f();
    e.f |= Er;
    var v = e.deps, p = G == null ? void 0 : G.is_fork;
    if (at !== null) {
      var _;
      if (p || _s(e, gt), v !== null && gt > 0)
        for (v.length = gt + at.length, _ = 0; _ < at.length; _++)
          v[gt + _] = at[_];
      else
        e.deps = v = at;
      if (Qo() && (e.f & Nt) !== 0)
        for (_ = gt; _ < v.length; _++)
          ((b = v[_]).reactions ?? (b.reactions = [])).push(e);
    } else !p && v !== null && gt < v.length && (_s(e, gt), v.length = gt);
    if (sa() && Et !== null && !Wt && v !== null && (e.f & (Be | Kt | Ue)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      Et.length; _++)
        qa(
          Et[_],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (or++, s.deps !== null)
        for (let h = 0; h < n; h += 1)
          s.deps[h].rv = or;
      if (t !== null)
        for (const h of t)
          h.rv = or;
      Et !== null && (r === null ? r = Et : r.push(.../** @type {Source[]} */
      Et));
    }
    return (e.f & Un) !== 0 && (e.f ^= Un), d;
  } catch (h) {
    return ia(h);
  } finally {
    e.f ^= Ao, at = t, gt = n, Et = r, re = s, Rt = o, Gr(i), Wt = l, hr = c;
  }
}
function Hc(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Jl.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & Be) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (at === null || !Xr.call(at, t))) {
    var o = (
      /** @type {Derived} */
      t
    );
    (o.f & Nt) !== 0 && (o.f ^= Nt, o.f &= ~wr), Xo(o), Mc(o), _s(o, 0);
  }
}
function _s(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Hc(e, n[r]);
}
function Qr(e) {
  var t = e.f;
  if ((t & Rn) === 0) {
    Ae(e, Pe);
    var n = le, r = zs;
    le = e, zs = !0;
    try {
      (t & (gn | Gi)) !== 0 ? Bc(e) : ti(e), Na(e);
      var s = Oa(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Da;
      var o;
      Co && yc && (e.f & Ue) !== 0 && e.deps;
    } finally {
      zs = r, le = n;
    }
  }
}
async function Vc() {
  await Promise.resolve(), W();
}
function a(e) {
  var t = e.f, n = (t & Be) !== 0;
  if (re !== null && !Wt) {
    var r = le !== null && (le.f & Rn) !== 0;
    if (!r && (Rt === null || !Xr.call(Rt, e))) {
      var s = re.deps;
      if ((re.f & Ao) !== 0)
        e.rv < or && (e.rv = or, at === null && s !== null && s[gt] === e ? gt++ : at === null ? at = [e] : at.push(e));
      else {
        (re.deps ?? (re.deps = [])).push(e);
        var o = e.reactions;
        o === null ? e.reactions = [re] : Xr.call(o, re) || o.push(re);
      }
    }
  }
  if (Vn && Hn.has(e))
    return Hn.get(e);
  if (n) {
    var i = (
      /** @type {Derived} */
      e
    );
    if (Vn) {
      var l = i.v;
      return ((i.f & Pe) === 0 && i.reactions !== null || Ba(i)) && (l = Go(i)), Hn.set(i, l), l;
    }
    var c = (i.f & Nt) === 0 && !Wt && re !== null && (zs || (re.f & Nt) !== 0), u = (i.f & Er) === 0;
    Ns(i) && (c && (i.f |= Nt), ma(i)), c && !u && (ba(i), za(i));
  }
  if (Oe != null && Oe.has(e))
    return Oe.get(e);
  if ((e.f & Un) !== 0)
    throw e.v;
  return e.v;
}
function za(e) {
  if (e.f |= Nt, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ?? (t.reactions = [])).push(e), (t.f & Be) !== 0 && (t.f & Nt) === 0 && (ba(
        /** @type {Derived} */
        t
      ), za(
        /** @type {Derived} */
        t
      ));
}
function Ba(e) {
  if (e.v === qe) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Hn.has(t) || (t.f & Be) !== 0 && Ba(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Cr(e) {
  var t = Wt;
  try {
    return Wt = !0, e();
  } finally {
    Wt = t;
  }
}
const Wc = ["touchstart", "touchmove"];
function Yc(e) {
  return Wc.includes(e);
}
const Bs = Symbol("events"), Ua = /* @__PURE__ */ new Set(), Do = /* @__PURE__ */ new Set();
function Kc(e, t, n, r = {}) {
  function s(o) {
    if (r.capture || Fo.call(t, o), !o.cancelBubble)
      return ns(() => n == null ? void 0 : n.call(this, o));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Yt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function Js(e, t, n, r, s) {
  var o = { capture: r, passive: s }, i = Kc(e, t, n, o);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && ei(() => {
    t.removeEventListener(e, i, o);
  });
}
function V(e, t, n) {
  (t[Bs] ?? (t[Bs] = {}))[e] = n;
}
function Rs(e) {
  for (var t = 0; t < e.length; t++)
    Ua.add(e[t]);
  for (var n of Do)
    n(e);
}
let _i = null;
function Fo(e) {
  var h, g;
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = ((h = e.composedPath) == null ? void 0 : h.call(e)) || [], o = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  _i = e;
  var i = 0, l = _i === e && e.__root;
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
    Ys(e, "currentTarget", {
      configurable: !0,
      get() {
        return o || n;
      }
    });
    var f = re, d = le;
    jt(null), vn(null);
    try {
      for (var v, p = []; o !== null; ) {
        var _ = o.assignedSlot || o.parentNode || /** @type {any} */
        o.host || null;
        try {
          var b = (g = o[Bs]) == null ? void 0 : g[r];
          b != null && (!/** @type {any} */
          o.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === o) && b.call(o, e);
        } catch (T) {
          v ? p.push(T) : v = T;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        o = _;
      }
      if (v) {
        for (let T of p)
          queueMicrotask(() => {
            throw T;
          });
        throw v;
      }
    } finally {
      e.__root = t, delete e.currentTarget, jt(f), vn(d);
    }
  }
}
var Bi, Ui;
const Eo = (Ui = (Bi = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : Bi.trustedTypes) == null ? void 0 : /* @__PURE__ */ Ui.createPolicy(
  "svelte-trusted-html",
  {
    /** @param {string} html */
    createHTML: (e) => e
  }
);
function Xc(e) {
  return (
    /** @type {string} */
    (Eo == null ? void 0 : Eo.createHTML(e)) ?? e
  );
}
function ri(e, t = !1) {
  var n = Zo("template");
  return e = e.replaceAll("<!>", "<!---->"), n.innerHTML = t ? Xc(e) : e, n.content;
}
function yt(e, t) {
  var n = (
    /** @type {Effect} */
    le
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function N(e, t) {
  var n = (t & Wi) !== 0, r = (t & Gl) !== 0, s, o = !e.startsWith("<!>");
  return () => {
    if (Q)
      return yt(J, null), J;
    s === void 0 && (s = ri(o ? e : "<!>" + e, !0), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ ze(s)));
    var i = (
      /** @type {TemplateNode} */
      r || xa ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var l = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ze(i)
      ), c = (
        /** @type {TemplateNode} */
        i.lastChild
      );
      yt(l, c);
    } else
      yt(i, i);
    return i;
  };
}
// @__NO_SIDE_EFFECTS__
function Gc(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), s = (t & Wi) !== 0, o = `<${n}>${r ? e : "<!>" + e}</${n}>`, i;
  return () => {
    if (Q)
      return yt(J, null), J;
    if (!i) {
      var l = (
        /** @type {DocumentFragment} */
        ri(o, !0)
      ), c = (
        /** @type {Element} */
        /* @__PURE__ */ ze(l)
      );
      if (s)
        for (i = document.createDocumentFragment(); /* @__PURE__ */ ze(c); )
          i.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ ze(c)
          );
      else
        i = /** @type {Element} */
        /* @__PURE__ */ ze(c);
    }
    var u = (
      /** @type {TemplateNode} */
      i.cloneNode(!0)
    );
    if (s) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ze(u)
      ), d = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      yt(f, d);
    } else
      yt(u, u);
    return u;
  };
}
// @__NO_SIDE_EFFECTS__
function bn(e, t) {
  return /* @__PURE__ */ Gc(e, t, "svg");
}
function wi(e = "") {
  if (!Q) {
    var t = ct(e + "");
    return yt(t, t), t;
  }
  var n = J;
  return n.nodeType !== As ? (n.before(n = ct()), Xe(n)) : uo(
    /** @type {Text} */
    n
  ), yt(n, n), n;
}
function Or() {
  if (Q)
    return yt(J, null), J;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = ct();
  return e.append(t, n), yt(t, n), e;
}
function $(e, t) {
  if (Q) {
    var n = (
      /** @type {Effect & { nodes: EffectNodes }} */
      le
    );
    ((n.f & Er) === 0 || n.nodes.end === null) && (n.nodes.end = J), yr();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let qo = !0;
function K(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ?? (e.__t = e.nodeValue)) && (e.__t = n, e.nodeValue = n + "");
}
function Ha(e, t) {
  return Va(e, t);
}
function Jc(e, t) {
  Po(), t.intro = t.intro ?? !1;
  const n = t.target, r = Q, s = J;
  try {
    for (var o = /* @__PURE__ */ ze(n); o && (o.nodeType !== $r || /** @type {Comment} */
    o.data !== Vo); )
      o = /* @__PURE__ */ Gt(o);
    if (!o)
      throw br;
    Nn(!0), Xe(
      /** @type {Comment} */
      o
    );
    const i = Va(e, { ...t, anchor: o });
    return Nn(!1), /**  @type {Exports} */
    i;
  } catch (i) {
    if (i instanceof Error && i.message.split(`
`).some((l) => l.startsWith("https://svelte.dev/e/")))
      throw i;
    return i !== br && console.warn("Failed to hydrate: ", i), t.recover === !1 && dc(), Po(), Jo(n), Nn(!1), Ha(e, t);
  } finally {
    Nn(r), Xe(s);
  }
}
const Ps = /* @__PURE__ */ new Map();
function Va(e, { target: t, anchor: n, props: r = {}, events: s, context: o, intro: i = !0 }) {
  Po();
  var l = /* @__PURE__ */ new Set(), c = (d) => {
    for (var v = 0; v < d.length; v++) {
      var p = d[v];
      if (!l.has(p)) {
        l.add(p);
        var _ = Yc(p);
        for (const g of [t, document]) {
          var b = Ps.get(g);
          b === void 0 && (b = /* @__PURE__ */ new Map(), Ps.set(g, b));
          var h = b.get(p);
          h === void 0 ? (g.addEventListener(p, Fo, { passive: _ }), b.set(p, 1)) : b.set(p, h + 1);
        }
      }
    }
  };
  c(ao(Ua)), Do.add(c);
  var u = void 0, f = Oc(() => {
    var d = n ?? t.appendChild(ct());
    return Cc(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (v) => {
        In({});
        var p = (
          /** @type {ComponentContext} */
          ft
        );
        if (o && (p.c = o), s && (r.$$events = s), Q && yt(
          /** @type {TemplateNode} */
          v,
          null
        ), qo = i, u = e(v, r) || {}, qo = !0, Q && (le.nodes.end = J, J === null || J.nodeType !== $r || /** @type {Comment} */
        J.data !== Wo))
          throw Ts(), br;
        Mn();
      }
    ), () => {
      var b;
      for (var v of l)
        for (const h of [t, document]) {
          var p = (
            /** @type {Map<string, number>} */
            Ps.get(h)
          ), _ = (
            /** @type {number} */
            p.get(v)
          );
          --_ == 0 ? (h.removeEventListener(v, Fo), p.delete(v), p.size === 0 && Ps.delete(h)) : p.set(v, _);
        }
      Do.delete(c), d !== n && ((b = d.parentNode) == null || b.removeChild(d));
    };
  });
  return Oo.set(u, f), u;
}
let Oo = /* @__PURE__ */ new WeakMap();
function Zc(e, t) {
  const n = Oo.get(e);
  return n ? (Oo.delete(e), n(t)) : Promise.resolve();
}
var Ht, un, bt, ur, $s, Cs, oo;
class Wa {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    /** @type {TemplateNode} */
    Ce(this, "anchor");
    /** @type {Map<Batch, Key>} */
    Z(this, Ht, /* @__PURE__ */ new Map());
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
    Z(this, un, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    Z(this, bt, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    Z(this, ur, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    Z(this, $s, !0);
    Z(this, Cs, () => {
      var t = (
        /** @type {Batch} */
        G
      );
      if (m(this, Ht).has(t)) {
        var n = (
          /** @type {Key} */
          m(this, Ht).get(t)
        ), r = m(this, un).get(n);
        if (r)
          ni(r), m(this, ur).delete(n);
        else {
          var s = m(this, bt).get(n);
          s && (m(this, un).set(n, s.effect), m(this, bt).delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
        }
        for (const [o, i] of m(this, Ht)) {
          if (m(this, Ht).delete(o), o === t)
            break;
          const l = m(this, bt).get(i);
          l && (et(l.effect), m(this, bt).delete(i));
        }
        for (const [o, i] of m(this, un)) {
          if (o === n || m(this, ur).has(o)) continue;
          const l = () => {
            if (Array.from(m(this, Ht).values()).includes(o)) {
              var u = document.createDocumentFragment();
              La(i, u), u.append(ct()), m(this, bt).set(o, { effect: i, fragment: u });
            } else
              et(i);
            m(this, ur).delete(o), m(this, un).delete(o);
          };
          m(this, $s) || !r ? (m(this, ur).add(o), pr(i, l, !1)) : l();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    Z(this, oo, (t) => {
      m(this, Ht).delete(t);
      const n = Array.from(m(this, Ht).values());
      for (const [r, s] of m(this, bt))
        n.includes(r) || (et(s.effect), m(this, bt).delete(r));
    });
    this.anchor = t, Y(this, $s, n);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      G
    ), s = Sa();
    if (n && !m(this, un).has(t) && !m(this, bt).has(t))
      if (s) {
        var o = document.createDocumentFragment(), i = ct();
        o.append(i), m(this, bt).set(t, {
          effect: Ct(() => n(i)),
          fragment: o
        });
      } else
        m(this, un).set(
          t,
          Ct(() => n(this.anchor))
        );
    if (m(this, Ht).set(r, t), s) {
      for (const [l, c] of m(this, un))
        l === t ? r.unskip_effect(c) : r.skip_effect(c);
      for (const [l, c] of m(this, bt))
        l === t ? r.unskip_effect(c.effect) : r.skip_effect(c.effect);
      r.oncommit(m(this, Cs)), r.ondiscard(m(this, oo));
    } else
      Q && (this.anchor = J), m(this, Cs).call(this);
  }
}
Ht = new WeakMap(), un = new WeakMap(), bt = new WeakMap(), ur = new WeakMap(), $s = new WeakMap(), Cs = new WeakMap(), oo = new WeakMap();
function si(e) {
  ft === null && ea(), Os(() => {
    const t = Cr(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Ya(e) {
  ft === null && ea(), si(() => () => Cr(e));
}
function U(e, t, n = !1) {
  Q && yr();
  var r = new Wa(e), s = n ? _r : 0;
  function o(i, l) {
    if (Q) {
      const f = ta(e);
      var c;
      if (f === Vo ? c = 0 : f === io ? c = !1 : c = parseInt(f.substring(1)), i !== c) {
        var u = Xs();
        Xe(u), r.anchor = u, Nn(!1), r.ensure(i, l), Nn(!0);
        return;
      }
    }
    r.ensure(i, l);
  }
  ho(() => {
    var i = !1;
    t((l, c = 0) => {
      i = !0, o(c, l);
    }), i || o(!1, null);
  }, s);
}
const Qc = Symbol("NaN");
function ef(e, t, n) {
  Q && yr();
  var r = new Wa(e);
  ho(() => {
    var s = t();
    s !== s && (s = /** @type {any} */
    Qc), r.ensure(s, n);
  });
}
function lt(e, t) {
  return t;
}
function tf(e, t, n) {
  for (var r = [], s = t.length, o, i = t.length, l = 0; l < s; l++) {
    let d = t[l];
    pr(
      d,
      () => {
        if (o) {
          if (o.pending.delete(d), o.done.add(d), o.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            zo(ao(o.done)), v.delete(o), v.size === 0 && (e.outrogroups = null);
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
      Jo(f), f.append(u), e.items.clear();
    }
    zo(t, !c);
  } else
    o = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ?? (e.outrogroups = /* @__PURE__ */ new Set())).add(o);
}
function zo(e, t = !0) {
  for (var n = 0; n < e.length; n++)
    et(e[n], t);
}
var yi;
function Ke(e, t, n, r, s, o = null) {
  var i = e, l = /* @__PURE__ */ new Map(), c = (t & Vi) !== 0;
  if (c) {
    var u = (
      /** @type {Element} */
      e
    );
    i = Q ? Xe(/* @__PURE__ */ ze(u)) : u.appendChild(ct());
  }
  Q && yr();
  var f = null, d = /* @__PURE__ */ ga(() => {
    var g = n();
    return Yo(g) ? g : g == null ? [] : ao(g);
  }), v, p = !0;
  function _() {
    h.fallback = f, nf(h, v, i, t, r), f !== null && (v.length === 0 ? (f.f & Tn) === 0 ? ni(f) : (f.f ^= Tn, vs(f, null, i)) : pr(f, () => {
      f = null;
    }));
  }
  var b = ho(() => {
    v = /** @type {V[]} */
    a(d);
    var g = v.length;
    let T = !1;
    if (Q) {
      var k = ta(i) === io;
      k !== (g === 0) && (i = Xs(), Xe(i), Nn(!1), T = !0);
    }
    for (var M = /* @__PURE__ */ new Set(), L = (
      /** @type {Batch} */
      G
    ), B = Sa(), ee = 0; ee < g; ee += 1) {
      Q && J.nodeType === $r && /** @type {Comment} */
      J.data === Wo && (i = /** @type {Comment} */
      J, T = !0, Nn(!1));
      var q = v[ee], se = r(q, ee), oe = p ? null : l.get(se);
      oe ? (oe.v && Zr(oe.v, q), oe.i && Zr(oe.i, ee), B && L.unskip_effect(oe.e)) : (oe = rf(
        l,
        p ? i : yi ?? (yi = ct()),
        q,
        se,
        ee,
        s,
        t,
        n
      ), p || (oe.e.f |= Tn), l.set(se, oe)), M.add(se);
    }
    if (g === 0 && o && !f && (p ? f = Ct(() => o(i)) : (f = Ct(() => o(yi ?? (yi = ct()))), f.f |= Tn)), g > M.size && ac(), Q && g > 0 && Xe(Xs()), !p)
      if (B) {
        for (const [De, Fe] of l)
          M.has(De) || L.skip_effect(Fe.e);
        L.oncommit(_), L.ondiscard(() => {
        });
      } else
        _();
    T && Nn(!0), a(d);
  }), h = { effect: b, items: l, outrogroups: null, fallback: f };
  p = !1, Q && (i = J);
}
function fs(e) {
  for (; e !== null && (e.f & Xt) === 0; )
    e = e.next;
  return e;
}
function nf(e, t, n, r, s) {
  var oe, De, Fe, tt, Jt, He, It, Zt, ut;
  var o = (r & Ul) !== 0, i = t.length, l = e.items, c = fs(e.effect.first), u, f = null, d, v = [], p = [], _, b, h, g;
  if (o)
    for (g = 0; g < i; g += 1)
      _ = t[g], b = s(_, g), h = /** @type {EachItem} */
      l.get(b).e, (h.f & Tn) === 0 && ((De = (oe = h.nodes) == null ? void 0 : oe.a) == null || De.measure(), (d ?? (d = /* @__PURE__ */ new Set())).add(h));
  for (g = 0; g < i; g += 1) {
    if (_ = t[g], b = s(_, g), h = /** @type {EachItem} */
    l.get(b).e, e.outrogroups !== null)
      for (const pe of e.outrogroups)
        pe.pending.delete(h), pe.done.delete(h);
    if ((h.f & Tn) !== 0)
      if (h.f ^= Tn, h === c)
        vs(h, null, n);
      else {
        var T = f ? f.next : c;
        h === e.effect.last && (e.effect.last = h.prev), h.prev && (h.prev.next = h.next), h.next && (h.next.prev = h.prev), zn(e, f, h), zn(e, h, T), vs(h, T, n), f = h, v = [], p = [], c = fs(f.next);
        continue;
      }
    if ((h.f & wt) !== 0 && (ni(h), o && ((tt = (Fe = h.nodes) == null ? void 0 : Fe.a) == null || tt.unfix(), (d ?? (d = /* @__PURE__ */ new Set())).delete(h))), h !== c) {
      if (u !== void 0 && u.has(h)) {
        if (v.length < p.length) {
          var k = p[0], M;
          f = k.prev;
          var L = v[0], B = v[v.length - 1];
          for (M = 0; M < v.length; M += 1)
            vs(v[M], k, n);
          for (M = 0; M < p.length; M += 1)
            u.delete(p[M]);
          zn(e, L.prev, B.next), zn(e, f, L), zn(e, B, k), c = k, f = B, g -= 1, v = [], p = [];
        } else
          u.delete(h), vs(h, c, n), zn(e, h.prev, h.next), zn(e, h, f === null ? e.effect.first : f.next), zn(e, f, h), f = h;
        continue;
      }
      for (v = [], p = []; c !== null && c !== h; )
        (u ?? (u = /* @__PURE__ */ new Set())).add(c), p.push(c), c = fs(c.next);
      if (c === null)
        continue;
    }
    (h.f & Tn) === 0 && v.push(h), f = h, c = fs(h.next);
  }
  if (e.outrogroups !== null) {
    for (const pe of e.outrogroups)
      pe.pending.size === 0 && (zo(ao(pe.done)), (Jt = e.outrogroups) == null || Jt.delete(pe));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (c !== null || u !== void 0) {
    var ee = [];
    if (u !== void 0)
      for (h of u)
        (h.f & wt) === 0 && ee.push(h);
    for (; c !== null; )
      (c.f & wt) === 0 && c !== e.fallback && ee.push(c), c = fs(c.next);
    var q = ee.length;
    if (q > 0) {
      var se = (r & Vi) !== 0 && i === 0 ? n : null;
      if (o) {
        for (g = 0; g < q; g += 1)
          (It = (He = ee[g].nodes) == null ? void 0 : He.a) == null || It.measure();
        for (g = 0; g < q; g += 1)
          (ut = (Zt = ee[g].nodes) == null ? void 0 : Zt.a) == null || ut.fix();
      }
      tf(e, ee, se);
    }
  }
  o && Yt(() => {
    var pe, j;
    if (d !== void 0)
      for (h of d)
        (j = (pe = h.nodes) == null ? void 0 : pe.a) == null || j.apply();
  });
}
function rf(e, t, n, r, s, o, i, l) {
  var c = (i & zl) !== 0 ? (i & Hl) === 0 ? /* @__PURE__ */ wa(n, !1, !1) : xr(n) : null, u = (i & Bl) !== 0 ? xr(s) : null;
  return {
    v: c,
    i: u,
    e: Ct(() => (o(t, c ?? n, u ?? s, l), () => {
      e.delete(r);
    }))
  };
}
function vs(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, o = t && (t.f & Tn) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var i = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Gt(r)
      );
      if (o.before(r), r === s)
        return;
      r = i;
    }
}
function zn(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function xi(e, t, n = !1, r = !1, s = !1) {
  var o = e, i = "";
  O(() => {
    var l = (
      /** @type {Effect} */
      le
    );
    if (i === (i = t() ?? "")) {
      Q && yr();
      return;
    }
    if (l.nodes !== null && (Ra(
      l.nodes.start,
      /** @type {TemplateNode} */
      l.nodes.end
    ), l.nodes = null), i !== "") {
      if (Q) {
        J.data;
        for (var c = yr(), u = c; c !== null && (c.nodeType !== $r || /** @type {Comment} */
        c.data !== ""); )
          u = c, c = /* @__PURE__ */ Gt(c);
        if (c === null)
          throw Ts(), br;
        yt(J, u), o = Xe(c);
        return;
      }
      var f = i + "";
      n ? f = `<svg>${f}</svg>` : r && (f = `<math>${f}</math>`);
      var d = ri(f);
      if ((n || r) && (d = /** @type {Element} */
      /* @__PURE__ */ ze(d)), yt(
        /** @type {TemplateNode} */
        /* @__PURE__ */ ze(d),
        /** @type {TemplateNode} */
        d.lastChild
      ), n || r)
        for (; /* @__PURE__ */ ze(d); )
          o.before(
            /** @type {TemplateNode} */
            /* @__PURE__ */ ze(d)
          );
      else
        o.before(d);
    }
  });
}
const sf = () => performance.now(), An = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => sf(),
  tasks: /* @__PURE__ */ new Set()
};
function Ka() {
  const e = An.now();
  An.tasks.forEach((t) => {
    t.c(e) || (An.tasks.delete(t), t.f());
  }), An.tasks.size !== 0 && An.tick(Ka);
}
function of(e) {
  let t;
  return An.tasks.size === 0 && An.tick(Ka), {
    promise: new Promise((n) => {
      An.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      An.tasks.delete(t);
    }
  };
}
function Zs(e, t) {
  ns(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function af(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function ki(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [s, o] = r.split(":");
    if (!s || o === void 0) break;
    const i = af(s.trim());
    t[i] = o.trim();
  }
  return t;
}
const lf = (e) => e;
function Qs(e, t, n, r) {
  var h;
  var s = (e & Xl) !== 0, o = "both", i, l = t.inert, c = t.style.overflow, u, f;
  function d() {
    return ns(() => i ?? (i = n()(t, (r == null ? void 0 : r()) ?? /** @type {P} */
    {}, {
      direction: o
    })));
  }
  var v = {
    is_global: s,
    in() {
      t.inert = l, u = Bo(t, d(), f, 1, () => {
        Zs(t, "introend"), u == null || u.abort(), u = i = void 0, t.style.overflow = c;
      });
    },
    out(g) {
      t.inert = !0, f = Bo(t, d(), u, 0, () => {
        Zs(t, "outroend"), g == null || g();
      });
    },
    stop: () => {
      u == null || u.abort(), f == null || f.abort();
    }
  }, p = (
    /** @type {Effect & { nodes: EffectNodes }} */
    le
  );
  if (((h = p.nodes).t ?? (h.t = [])).push(v), qo) {
    var _ = s;
    if (!_) {
      for (var b = (
        /** @type {Effect | null} */
        p.parent
      ); b && (b.f & _r) !== 0; )
        for (; (b = b.parent) && (b.f & gn) === 0; )
          ;
      _ = !b || (b.f & Er) !== 0;
    }
    _ && vo(() => {
      Cr(() => v.in());
    });
  }
}
function Bo(e, t, n, r, s) {
  var o = r === 1;
  if (tc(t)) {
    var i, l = !1;
    return Yt(() => {
      if (!l) {
        var h = t({ direction: o ? "in" : "out" });
        i = Bo(e, h, n, r, s);
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
    return Zs(e, o ? "introstart" : "outrostart"), s(), {
      abort: qr,
      deactivate: qr,
      reset: qr,
      t: () => r
    };
  const { delay: c = 0, css: u, tick: f, easing: d = lf } = t;
  var v = [];
  if (o && n === void 0 && (f && f(0, 1), u)) {
    var p = ki(u(0, 1));
    v.push(p, p);
  }
  var _ = () => 1 - r, b = e.animate(v, { duration: c, fill: "forwards" });
  return b.onfinish = () => {
    b.cancel(), Zs(e, o ? "introstart" : "outrostart");
    var h = (n == null ? void 0 : n.t()) ?? 1 - r;
    n == null || n.abort();
    var g = r - h, T = (
      /** @type {number} */
      t.duration * Math.abs(g)
    ), k = [];
    if (T > 0) {
      var M = !1;
      if (u)
        for (var L = Math.ceil(T / 16.666666666666668), B = 0; B <= L; B += 1) {
          var ee = h + g * d(B / L), q = ki(u(ee, 1 - ee));
          k.push(q), M || (M = q.overflow === "hidden");
        }
      M && (e.style.overflow = "hidden"), _ = () => {
        var se = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          b.currentTime
        );
        return h + g * d(se / T);
      }, f && of(() => {
        if (b.playState !== "running") return !1;
        var se = _();
        return f(se, 1 - se), !0;
      });
    }
    b = e.animate(k, { duration: T, fill: "forwards" }), b.onfinish = () => {
      _ = () => r, f == null || f(r, 1 - r), s();
    };
  }, {
    abort: () => {
      b && (b.cancel(), b.effect = null, b.onfinish = qr);
    },
    deactivate: () => {
      s = qr;
    },
    reset: () => {
      r === 0 && (f == null || f(1, 0));
    },
    t: () => _()
  };
}
function Yn(e, t) {
  vo(() => {
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
      const s = Zo("style");
      s.id = t.hash, s.textContent = t.code, r.appendChild(s);
    }
  });
}
const Ei = [...` 	
\r\f \v\uFEFF`];
function cf(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var s in n)
      if (n[s])
        r = r ? r + " " + s : s;
      else if (r.length)
        for (var o = s.length, i = 0; (i = r.indexOf(s, i)) >= 0; ) {
          var l = i + o;
          (i === 0 || Ei.includes(r[i - 1])) && (l === r.length || Ei.includes(r[l])) ? r = (i === 0 ? "" : r.substring(0, i)) + r.substring(l + 1) : i = l;
        }
  }
  return r === "" ? null : r;
}
function ff(e, t) {
  return e == null ? null : String(e);
}
function Qe(e, t, n, r, s, o) {
  var i = e.__className;
  if (Q || i !== n || i === void 0) {
    var l = cf(n, r, o);
    (!Q || l !== e.getAttribute("class")) && (l == null ? e.removeAttribute("class") : t ? e.className = l : e.setAttribute("class", l)), e.__className = n;
  } else if (o && s !== o)
    for (var c in o) {
      var u = !!o[c];
      (s == null || u !== !!s[c]) && e.classList.toggle(c, u);
    }
  return o;
}
function gr(e, t, n, r) {
  var s = e.__style;
  if (Q || s !== t) {
    var o = ff(t);
    (!Q || o !== e.getAttribute("style")) && (o == null ? e.removeAttribute("style") : e.style.cssText = o), e.__style = t;
  }
  return r;
}
function Xa(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Yo(t))
      return bc();
    for (var r of e.options)
      r.selected = t.includes(gs(r));
    return;
  }
  for (r of e.options) {
    var s = gs(r);
    if (Pc(s, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function uf(e) {
  var t = new MutationObserver(() => {
    Xa(e, e.__value);
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
  }), ei(() => {
    t.disconnect();
  });
}
function Si(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), s = !0;
  Aa(e, "change", (o) => {
    var i = o ? "[selected]" : ":checked", l;
    if (e.multiple)
      l = [].map.call(e.querySelectorAll(i), gs);
    else {
      var c = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      l = c && gs(c);
    }
    n(l), G !== null && r.add(G);
  }), vo(() => {
    var o = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Gs ?? G
      );
      if (r.has(i))
        return;
    }
    if (Xa(e, o, s), s && o === void 0) {
      var l = e.querySelector(":checked");
      l !== null && (o = gs(l), n(o));
    }
    e.__value = o, s = !1;
  }), uf(e);
}
function gs(e) {
  return "__value" in e ? e.__value : e.value;
}
const df = Symbol("is custom element"), vf = Symbol("is html"), pf = oc ? "link" : "LINK";
function Ga(e) {
  if (Q) {
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
    e.__on_r = n, Yt(n), Ca();
  }
}
function me(e, t, n, r) {
  var s = hf(e);
  Q && (s[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === pf) || s[t] !== (s[t] = n) && (t === "loading" && (e[sc] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && gf(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function hf(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ?? (e.__attributes = {
      [df]: e.nodeName.includes("-"),
      [vf]: e.namespaceURI === Yi
    })
  );
}
var $i = /* @__PURE__ */ new Map();
function gf(e) {
  var t = e.getAttribute("is") || e.nodeName, n = $i.get(t);
  if (n) return n;
  $i.set(t, n = []);
  for (var r, s = e, o = Element.prototype; o !== s; ) {
    r = Zl(s);
    for (var i in r)
      r[i].set && n.push(i);
    s = Ki(s);
  }
  return n;
}
function eo(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Aa(e, "input", async (s) => {
    var o = s ? e.defaultValue : e.value;
    if (o = So(e) ? $o(o) : o, n(o), G !== null && r.add(G), await Vc(), o !== (o = t())) {
      var i = e.selectionStart, l = e.selectionEnd, c = e.value.length;
      if (e.value = o ?? "", l !== null) {
        var u = e.value.length;
        i === l && l === c && u > c ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = i, e.selectionEnd = Math.min(l, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (Q && e.defaultValue !== e.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Cr(t) == null && e.value) && (n(So(e) ? $o(e.value) : e.value), G !== null && r.add(G)), po(() => {
    var s = t();
    if (e === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Gs ?? G
      );
      if (r.has(o))
        return;
    }
    So(e) && s === $o(e.value) || e.type === "date" && !s && !e.value || s !== e.value && (e.value = s ?? "");
  });
}
function So(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function $o(e) {
  return e === "" ? null : +e;
}
function Ci(e, t) {
  return e === t || (e == null ? void 0 : e[vr]) === t;
}
function mr(e = {}, t, n, r) {
  return vo(() => {
    var s, o;
    return po(() => {
      s = o, o = [], Cr(() => {
        e !== n(...o) && (t(e, ...o), s && Ci(n(...s), e) && t(null, ...s));
      });
    }), () => {
      Yt(() => {
        o && Ci(n(...o), e) && t(null, ...o);
      });
    };
  }), e;
}
let Ds = !1;
function mf(e) {
  var t = Ds;
  try {
    return Ds = !1, [e(), Ds];
  } finally {
    Ds = t;
  }
}
function X(e, t, n, r) {
  var T;
  var s = (n & Yl) !== 0, o = (n & Kl) !== 0, i = (
    /** @type {V} */
    r
  ), l = !0, c = () => (l && (l = !1, i = o ? Cr(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), i), u;
  if (s) {
    var f = vr in e || Qi in e;
    u = ((T = dr(e, t)) == null ? void 0 : T.set) ?? (f && t in e ? (k) => e[t] = k : void 0);
  }
  var d, v = !1;
  s ? [d, v] = mf(() => (
    /** @type {V} */
    e[t]
  )) : d = /** @type {V} */
  e[t], d === void 0 && r !== void 0 && (d = c(), u && (vc(), u(d)));
  var p;
  if (p = () => {
    var k = (
      /** @type {V} */
      e[t]
    );
    return k === void 0 ? c() : (l = !0, k);
  }, (n & Wl) === 0)
    return p;
  if (u) {
    var _ = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(k, M) {
        return arguments.length > 0 ? ((!M || _ || v) && u(M ? p() : k), k) : p();
      })
    );
  }
  var b = !1, h = ((n & Vl) !== 0 ? fo : ga)(() => (b = !1, p()));
  s && a(h);
  var g = (
    /** @type {Effect} */
    le
  );
  return (
    /** @type {() => V} */
    (function(k, M) {
      if (arguments.length > 0) {
        const L = M ? a(h) : s ? Le(k) : k;
        return w(h, L), b = !0, i !== void 0 && (i = L), k;
      }
      return Vn && b || (g.f & Rn) !== 0 ? h.v : a(h);
    })
  );
}
function bf(e) {
  return new _f(e);
}
var Cn, $t;
class _f {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    /** @type {any} */
    Z(this, Cn);
    /** @type {Record<string, any>} */
    Z(this, $t);
    var o;
    var n = /* @__PURE__ */ new Map(), r = (i, l) => {
      var c = /* @__PURE__ */ wa(l, !1, !1);
      return n.set(i, c), c;
    };
    const s = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(i, l) {
          return a(n.get(l) ?? r(l, Reflect.get(i, l)));
        },
        has(i, l) {
          return l === Qi ? !0 : (a(n.get(l) ?? r(l, Reflect.get(i, l))), Reflect.has(i, l));
        },
        set(i, l, c) {
          return w(n.get(l) ?? r(l, c), c), Reflect.set(i, l, c);
        }
      }
    );
    Y(this, $t, (t.hydrate ? Jc : Ha)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: s,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    })), (!((o = t == null ? void 0 : t.props) != null && o.$$host) || t.sync === !1) && W(), Y(this, Cn, s.$$events);
    for (const i of Object.keys(m(this, $t)))
      i === "$set" || i === "$destroy" || i === "$on" || Ys(this, i, {
        get() {
          return m(this, $t)[i];
        },
        /** @param {any} value */
        set(l) {
          m(this, $t)[i] = l;
        },
        enumerable: !0
      });
    m(this, $t).$set = /** @param {Record<string, any>} next */
    (i) => {
      Object.assign(s, i);
    }, m(this, $t).$destroy = () => {
      Zc(m(this, $t));
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    m(this, $t).$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    m(this, Cn)[t] = m(this, Cn)[t] || [];
    const r = (...s) => n.call(this, ...s);
    return m(this, Cn)[t].push(r), () => {
      m(this, Cn)[t] = m(this, Cn)[t].filter(
        /** @param {any} fn */
        (s) => s !== r
      );
    };
  }
  $destroy() {
    m(this, $t).$destroy();
  }
}
Cn = new WeakMap(), $t = new WeakMap();
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
    Ce(this, "$$ctor");
    /** Slots */
    Ce(this, "$$s");
    /** @type {any} The Svelte component instance */
    Ce(this, "$$c");
    /** Whether or not the custom element is connected */
    Ce(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    Ce(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    Ce(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    Ce(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    Ce(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    Ce(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    Ce(this, "$$me");
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    Ce(this, "$$shadowRoot", null);
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
          const i = Zo("slot");
          s !== "default" && (i.name = s), $(o, i);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const n = {}, r = wf(this);
      for (const s of this.$$s)
        s in r && (s === "default" && !this.$$d.children ? (this.$$d.children = t(s), n.default = !0) : n[s] = t(s));
      for (const s of this.attributes) {
        const o = this.$$g_p(s.name);
        o in this.$$d || (this.$$d[o] = Us(o, s.value, this.$$p_d, "toProp"));
      }
      for (const s in this.$$p_d)
        !(s in this.$$d) && this[s] !== void 0 && (this.$$d[s] = this[s], delete this[s]);
      this.$$c = bf({
        component: this.$$ctor,
        target: this.$$shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: n,
          $$host: this
        }
      }), this.$$me = qc(() => {
        po(() => {
          var s;
          this.$$r = !0;
          for (const o of Ws(this.$$c)) {
            if (!((s = this.$$p_d[o]) != null && s.reflect)) continue;
            this.$$d[o] = this.$$c[o];
            const i = Us(
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
    this.$$r || (t = this.$$g_p(t), this.$$d[t] = Us(t, r, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [t]: this.$$d[t] }));
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
    return Ws(this.$$p_d).find(
      (n) => this.$$p_d[n].attribute === t || !this.$$p_d[n].attribute && n.toLowerCase() === t
    ) || t;
  }
});
function Us(e, t, n, r) {
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
function wf(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function Kn(e, t, n, r, s, o) {
  let i = class extends Ja {
    constructor() {
      super(e, n, s), this.$$p_d = t;
    }
    static get observedAttributes() {
      return Ws(t).map(
        (l) => (t[l].attribute || l).toLowerCase()
      );
    }
  };
  return Ws(t).forEach((l) => {
    Ys(i.prototype, l, {
      get() {
        return this.$$c && l in this.$$c ? this.$$c[l] : this.$$d[l];
      },
      set(c) {
        var d;
        c = Us(l, c, t), this.$$d[l] = c;
        var u = this.$$c;
        if (u) {
          var f = (d = dr(u, l)) == null ? void 0 : d.get;
          f ? u[l] = c : u.$set({ [l]: c });
        }
      }
    });
  }), r.forEach((l) => {
    Ys(i.prototype, l, {
      get() {
        var c;
        return (c = this.$$c) == null ? void 0 : c[l];
      }
    });
  }), e.element = /** @type {any} */
  i, i;
}
const us = {
  endpoint: "",
  position: "bottom-right",
  theme: "dark",
  buttonColor: "#3b82f6",
  maxScreenshots: 5,
  maxConsoleLogs: 50,
  captureConsole: !0
}, yf = [
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
], xf = "[REDACTED]";
function kf(e) {
  let t = e;
  for (const n of yf)
    n.lastIndex = 0, t = t.replace(n, xf);
  return t;
}
let Za = 50;
const Hs = [];
let to = !1;
const Tt = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  trace: console.trace
};
function Ef(e) {
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
function Sf() {
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
function Dr(e, t, n) {
  const r = /* @__PURE__ */ new Date(), s = kf(t.map(Ef).join(" ")), o = {
    type: e,
    message: s,
    timestamp: r.toISOString(),
    timestampMs: r.getTime(),
    url: window.location.href
  };
  return (n || e === "error" || e === "warn" || e === "trace") && Object.assign(o, Sf()), o;
}
function Fr(e) {
  for (Hs.push(e); Hs.length > Za; )
    Hs.shift();
}
function $f(e) {
  to || (to = !0, e && (Za = e), console.log = (...t) => {
    Tt.log(...t), Fr(Dr("log", t, !1));
  }, console.error = (...t) => {
    Tt.error(...t), Fr(Dr("error", t, !0));
  }, console.warn = (...t) => {
    Tt.warn(...t), Fr(Dr("warn", t, !0));
  }, console.info = (...t) => {
    Tt.info(...t), Fr(Dr("info", t, !1));
  }, console.debug = (...t) => {
    Tt.debug(...t), Fr(Dr("debug", t, !1));
  }, console.trace = (...t) => {
    Tt.trace(...t), Fr(Dr("trace", t, !0));
  });
}
function Cf() {
  to && (to = !1, console.log = Tt.log, console.error = Tt.error, console.warn = Tt.warn, console.info = Tt.info, console.debug = Tt.debug, console.trace = Tt.trace);
}
function Af() {
  return [...Hs];
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
    const o = n[s];
    if (o === e)
      return Qa(e.parentElement) + "/" + e.tagName + "[" + (t + 1) + "]";
    o.nodeType === 1 && o.tagName === e.tagName && t++;
  }
  return "";
}
function Tf(e) {
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
  return Nf(e);
}
function Nf(e) {
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
let kr = !1, el = "", dn = null, Vs = null, oi = null;
function Rf() {
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
function jf() {
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
  if (!kr || !dn) return;
  const t = e.target;
  if (t === dn || t.id === "jat-feedback-picker-tooltip") return;
  const n = t.getBoundingClientRect();
  dn.style.top = `${n.top}px`, dn.style.left = `${n.left}px`, dn.style.width = `${n.width}px`, dn.style.height = `${n.height}px`;
}
function nl(e) {
  var o;
  if (!kr) return;
  e.preventDefault(), e.stopPropagation();
  const t = e.target, n = t.getBoundingClientRect(), r = oi;
  ol();
  const s = {
    tagName: t.tagName,
    className: typeof t.className == "string" ? t.className : "",
    id: t.id,
    textContent: ((o = t.textContent) == null ? void 0 : o.substring(0, 100)) || "",
    attributes: Array.from(t.attributes).reduce((i, l) => (i[l.name] = l.value, i), {}),
    xpath: Qa(t),
    selector: Tf(t),
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
  e.key === "Escape" && ol();
}
function sl(e) {
  kr || (kr = !0, oi = e, el = document.body.style.cursor, document.body.style.cursor = "crosshair", dn = Rf(), Vs = jf(), document.addEventListener("mousemove", tl, !0), document.addEventListener("click", nl, !0), document.addEventListener("keydown", rl, !0));
}
function ol() {
  kr && (kr = !1, oi = null, document.body.style.cursor = el, dn && (dn.remove(), dn = null), Vs && (Vs.remove(), Vs = null), document.removeEventListener("mousemove", tl, !0), document.removeEventListener("click", nl, !0), document.removeEventListener("keydown", rl, !0));
}
function If() {
  return kr;
}
const Ai = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ffffff", "#111827"], Ti = 3;
let il = !1;
function Ni(e) {
  il = e;
}
function Mf() {
  return il;
}
let Lf = 1;
function ds() {
  return Lf++;
}
function Pf(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n.x, n.y), e.lineTo(r.x, r.y), e.stroke();
  const i = Math.atan2(r.y - n.y, r.x - n.x), l = 14, c = Math.PI / 7;
  e.beginPath(), e.moveTo(r.x, r.y), e.lineTo(r.x - l * Math.cos(i - c), r.y - l * Math.sin(i - c)), e.moveTo(r.x, r.y), e.lineTo(r.x - l * Math.cos(i + c), r.y - l * Math.sin(i + c)), e.stroke();
}
function Df(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o, e.lineJoin = "round";
  const i = Math.min(n.x, r.x), l = Math.min(n.y, r.y), c = Math.abs(r.x - n.x), u = Math.abs(r.y - n.y);
  e.strokeRect(i, l, c, u);
}
function Ff(e, t) {
  const { start: n, end: r, color: s, strokeWidth: o } = t;
  e.strokeStyle = s, e.lineWidth = o;
  const i = (n.x + r.x) / 2, l = (n.y + r.y) / 2, c = Math.abs(r.x - n.x) / 2, u = Math.abs(r.y - n.y) / 2;
  c < 1 || u < 1 || (e.beginPath(), e.ellipse(i, l, c, u, 0, 0, Math.PI * 2), e.stroke());
}
function qf(e, t) {
  const { points: n, color: r, strokeWidth: s } = t;
  if (!(n.length < 2)) {
    e.strokeStyle = r, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.moveTo(n[0].x, n[0].y);
    for (let o = 1; o < n.length; o++)
      e.lineTo(n[o].x, n[o].y);
    e.stroke();
  }
}
function Of(e, t) {
  const { position: n, content: r, color: s, fontSize: o } = t;
  r && (e.font = `bold ${o}px sans-serif`, e.textBaseline = "top", e.strokeStyle = "#000000", e.lineWidth = 2, e.lineJoin = "round", e.strokeText(r, n.x, n.y), e.fillStyle = s, e.fillText(r, n.x, n.y));
}
function al(e, t) {
  switch (e.save(), t.type) {
    case "arrow":
      Pf(e, t);
      break;
    case "rectangle":
      Df(e, t);
      break;
    case "ellipse":
      Ff(e, t);
      break;
    case "freehand":
      qf(e, t);
      break;
    case "text":
      Of(e, t);
      break;
  }
  e.restore();
}
function ll(e, t) {
  for (const n of t)
    al(e, n);
}
function zf(e, t, n, r) {
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
      c.drawImage(i, 0, 0, n, r), ll(c, t), s(l.toDataURL("image/jpeg", 0.85));
    }, i.onerror = () => o(new Error("Failed to load image")), i.src = e;
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
async function Bf(e) {
  try {
    const t = `${e.replace(/\/$/, "")}/api/feedback/reports`, n = await fetch(t, {
      method: "GET",
      credentials: "same-origin"
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
async function Uf(e, t, n, r, s) {
  try {
    const o = `${e.replace(/\/$/, "")}/api/feedback/reports/${t}/respond`, i = { response: n };
    r && (i.reason = r), s != null && s.screenshots && s.screenshots.length > 0 && (i.screenshots = s.screenshots), s != null && s.elements && s.elements.length > 0 && (i.elements = s.elements);
    const l = await fetch(o, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(i)
    }), c = await l.json();
    return l.ok ? { ok: !0 } : { ok: !1, error: c.error || `HTTP ${l.status}` };
  } catch (o) {
    return { ok: !1, error: o instanceof Error ? o.message : "Failed to respond" };
  }
}
const fl = "jat-feedback-queue", Hf = 50, Vf = 3e4;
let ms = null;
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
function Ri(e, t) {
  const n = ul();
  for (n.push({
    report: t,
    endpoint: e,
    queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    attempts: 0
  }); n.length > Hf; )
    n.shift();
  dl(n);
}
async function ji() {
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
function Wf() {
  ms || (ji(), ms = setInterval(ji, Vf));
}
function Yf() {
  ms && (clearInterval(ms), ms = null);
}
var Kf = /* @__PURE__ */ bn('<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Xf = /* @__PURE__ */ bn('<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.36 17L2 22L7 20.64C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 10H8.01M12 10H12.01M16 10H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>'), Gf = /* @__PURE__ */ N("<button><!></button>");
const Jf = {
  hash: "svelte-joatup",
  code: ".jat-fb-btn.svelte-joatup {width:52px;height:52px;border-radius:50%;border:none;background:var(--jat-btn-color, #3b82f6);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0, 0, 0, 0.25);transition:transform 0.2s, box-shadow 0.2s, background 0.2s;}.jat-fb-btn.svelte-joatup:hover {transform:scale(1.08);box-shadow:0 6px 20px rgba(0, 0, 0, 0.3);}.jat-fb-btn.svelte-joatup:active {transform:scale(0.95);}.jat-fb-btn.open.svelte-joatup {background:#6b7280;}"
};
function vl(e, t) {
  In(t, !0), Yn(e, Jf);
  let n = X(t, "onmousedown", 7), r = X(t, "open", 7, !1);
  var s = {
    get onmousedown() {
      return n();
    },
    set onmousedown(f) {
      n(f), W();
    },
    get open() {
      return r();
    },
    set open(f = !1) {
      r(f), W();
    }
  }, o = Gf();
  let i;
  var l = x(o);
  {
    var c = (f) => {
      var d = Kf();
      $(f, d);
    }, u = (f) => {
      var d = Xf();
      $(f, d);
    };
    U(l, (f) => {
      r() ? f(c) : f(u, !1);
    });
  }
  return y(o), O(() => {
    i = Qe(o, 1, "jat-fb-btn svelte-joatup", null, i, { open: r() }), me(o, "aria-label", r() ? "Close feedback" : "Send feedback"), me(o, "title", r() ? "Close feedback" : "Send feedback");
  }), V("mousedown", o, function(...f) {
    var d;
    (d = n()) == null || d.apply(this, f);
  }), $(e, o), Mn(s);
}
Rs(["mousedown"]);
Kn(vl, { onmousedown: {}, open: {} }, [], [], { mode: "open" });
const pl = "[modern-screenshot]", es = typeof window < "u", Zf = es && "Worker" in window;
var Hi;
const ii = es ? (Hi = window.navigator) == null ? void 0 : Hi.userAgent : "", hl = ii.includes("Chrome"), no = ii.includes("AppleWebKit") && !hl, ai = ii.includes("Firefox"), Qf = (e) => e && "__CONTEXT__" in e, eu = (e) => e.constructor.name === "CSSFontFaceRule", tu = (e) => e.constructor.name === "CSSImportRule", nu = (e) => e.constructor.name === "CSSLayerBlockRule", pn = (e) => e.nodeType === 1, js = (e) => typeof e.className == "object", gl = (e) => e.tagName === "image", ru = (e) => e.tagName === "use", ws = (e) => pn(e) && typeof e.style < "u" && !js(e), su = (e) => e.nodeType === 8, ou = (e) => e.nodeType === 3, ts = (e) => e.tagName === "IMG", go = (e) => e.tagName === "VIDEO", iu = (e) => e.tagName === "CANVAS", au = (e) => e.tagName === "TEXTAREA", lu = (e) => e.tagName === "INPUT", cu = (e) => e.tagName === "STYLE", fu = (e) => e.tagName === "SCRIPT", uu = (e) => e.tagName === "SELECT", du = (e) => e.tagName === "SLOT", vu = (e) => e.tagName === "IFRAME", pu = (...e) => console.warn(pl, ...e);
function hu(e) {
  var n;
  const t = (n = e == null ? void 0 : e.createElement) == null ? void 0 : n.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Uo = (e) => e.startsWith("data:");
function ml(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (es && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !es)
    return e;
  const n = mo().implementation.createHTMLDocument(), r = n.createElement("base"), s = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(s), t && (r.href = t), s.href = e, s.href;
}
function mo(e) {
  return (e && pn(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const bo = "http://www.w3.org/2000/svg";
function gu(e, t, n) {
  const r = mo(n).createElementNS(bo, "svg");
  return r.setAttributeNS(null, "width", e.toString()), r.setAttributeNS(null, "height", t.toString()), r.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), r;
}
function mu(e, t) {
  let n = new XMLSerializer().serializeToString(e);
  return t && (n = n.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(n)}`;
}
function bu(e, t) {
  return new Promise((n, r) => {
    const s = new FileReader();
    s.onload = () => n(s.result), s.onerror = () => r(s.error), s.onabort = () => r(new Error(`Failed read blob to ${t}`)), s.readAsDataURL(e);
  });
}
const _u = (e) => bu(e, "dataUrl");
function zr(e, t) {
  const n = mo(t).createElement("img");
  return n.decoding = "sync", n.loading = "eager", n.src = e, n;
}
function ys(e, t) {
  return new Promise((n) => {
    const { timeout: r, ownerDocument: s, onError: o, onWarn: i } = t ?? {}, l = typeof e == "string" ? zr(e, mo(s)) : e;
    let c = null, u = null;
    function f() {
      n(l), c && clearTimeout(c), u == null || u();
    }
    if (r && (c = setTimeout(f, r)), go(l)) {
      const d = l.currentSrc || l.src;
      if (!d)
        return l.poster ? ys(l.poster, t).then(n) : f();
      if (l.readyState >= 2)
        return f();
      const v = f, p = (_) => {
        i == null || i(
          "Failed video load",
          d,
          _
        ), o == null || o(_), f();
      };
      u = () => {
        l.removeEventListener("loadeddata", v), l.removeEventListener("error", p);
      }, l.addEventListener("loadeddata", v, { once: !0 }), l.addEventListener("error", p, { once: !0 });
    } else {
      const d = gl(l) ? l.href.baseVal : l.currentSrc || l.src;
      if (!d)
        return f();
      const v = async () => {
        if (ts(l) && "decode" in l)
          try {
            await l.decode();
          } catch (_) {
            i == null || i(
              "Failed to decode image, trying to render anyway",
              l.dataset.originalSrc || d,
              _
            );
          }
        f();
      }, p = (_) => {
        i == null || i(
          "Failed image load",
          l.dataset.originalSrc || d,
          _
        ), f();
      };
      if (ts(l) && l.complete)
        return v();
      u = () => {
        l.removeEventListener("load", v), l.removeEventListener("error", p);
      }, l.addEventListener("load", v, { once: !0 }), l.addEventListener("error", p, { once: !0 });
    }
  });
}
async function wu(e, t) {
  ws(e) && (ts(e) || go(e) ? await ys(e, t) : await Promise.all(
    ["img", "video"].flatMap((n) => Array.from(e.querySelectorAll(n)).map((r) => ys(r, t)))
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
let Ii = 0;
function yu(e) {
  const t = `${pl}[#${Ii}]`;
  return Ii++, {
    // eslint-disable-next-line no-console
    time: (n) => e && console.time(`${t} ${n}`),
    // eslint-disable-next-line no-console
    timeEnd: (n) => e && console.timeEnd(`${t} ${n}`),
    warn: (...n) => e && pu(...n)
  };
}
function xu(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function wl(e, t) {
  return Qf(e) ? e : ku(e, { ...t, autoDestruct: !0 });
}
async function ku(e, t) {
  var p, _;
  const { scale: n = 1, workerUrl: r, workerNumber: s = 1 } = t || {}, o = !!(t != null && t.debug), i = (t == null ? void 0 : t.features) ?? !0, l = e.ownerDocument ?? (es ? window.document : void 0), c = ((p = e.ownerDocument) == null ? void 0 : p.defaultView) ?? (es ? window : void 0), u = /* @__PURE__ */ new Map(), f = {
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
      requestInit: xu((_ = t == null ? void 0 : t.fetch) == null ? void 0 : _.bypassingCache),
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
    log: yu(o),
    node: e,
    ownerDocument: l,
    ownerWindow: c,
    dpi: n === 1 ? null : 96 * n,
    svgStyleElement: yl(l),
    svgDefsElement: l == null ? void 0 : l.createElementNS(bo, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Zf && r && s ? s : 0
      })
    ].map(() => {
      try {
        const b = new Worker(r);
        return b.onmessage = async (h) => {
          var k, M, L, B;
          const { url: g, result: T } = h.data;
          T ? (M = (k = u.get(g)) == null ? void 0 : k.resolve) == null || M.call(k, T) : (B = (L = u.get(g)) == null ? void 0 : L.reject) == null || B.call(L, new Error(`Error receiving message from worker: ${g}`));
        }, b.onmessageerror = (h) => {
          var T, k;
          const { url: g } = h.data;
          (k = (T = u.get(g)) == null ? void 0 : T.reject) == null || k.call(T, new Error(`Error receiving message from worker: ${g}`));
        }, b;
      } catch (b) {
        return f.log.warn("Failed to new Worker", b), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      hu(l) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: u,
    drawImageCount: 0,
    tasks: [],
    features: i,
    isEnable: (b) => b === "restoreScrollPosition" ? typeof i == "boolean" ? !1 : i[b] ?? !1 : typeof i == "boolean" ? i : i[b] ?? !0,
    shadowRoots: []
  };
  f.log.time("wait until load"), await wu(e, { timeout: f.timeout, onWarn: f.log.warn }), f.log.timeEnd("wait until load");
  const { width: d, height: v } = Eu(e, f);
  return f.width = d, f.height = v, f;
}
function yl(e) {
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
function Eu(e, t) {
  let { width: n, height: r } = t;
  if (pn(e) && (!n || !r)) {
    const s = e.getBoundingClientRect();
    n = n || s.width || Number(e.getAttribute("width")) || 0, r = r || s.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: n, height: r };
}
async function Su(e, t) {
  const {
    log: n,
    timeout: r,
    drawImageCount: s,
    drawImageInterval: o
  } = t;
  n.time("image to canvas");
  const i = await ys(e, { timeout: r, onWarn: t.log.warn }), { canvas: l, context2d: c } = $u(e.ownerDocument, t), u = () => {
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
function $u(e, t) {
  const { width: n, height: r, scale: s, backgroundColor: o, maximumCanvasSize: i } = t, l = e.createElement("canvas");
  l.width = Math.floor(n * s), l.height = Math.floor(r * s), l.style.width = `${n}px`, l.style.height = `${r}px`, i && (l.width > i || l.height > i) && (l.width > i && l.height > i ? l.width > l.height ? (l.height *= i / l.width, l.width = i) : (l.width *= i / l.height, l.height = i) : l.width > i ? (l.height *= i / l.width, l.width = i) : (l.width *= i / l.height, l.height = i));
  const c = l.getContext("2d");
  return c && o && (c.fillStyle = o, c.fillRect(0, 0, l.width, l.height)), { canvas: l, context2d: c };
}
function xl(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return zr(o, e.ownerDocument);
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
function Cu(e, t) {
  var n;
  try {
    if ((n = e == null ? void 0 : e.contentDocument) != null && n.body)
      return li(e.contentDocument.body, t);
  } catch (r) {
    t.log.warn("Failed to clone iframe", r);
  }
  return e.cloneNode(!1);
}
function Au(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Tu(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return zr(e.poster, e.ownerDocument);
  const n = e.cloneNode(!1);
  n.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (n.src = e.currentSrc);
  const r = n.ownerDocument;
  if (r) {
    let s = !0;
    if (await ys(n, { onError: () => s = !1, onWarn: t.log.warn }), !s)
      return e.poster ? zr(e.poster, e.ownerDocument) : n;
    n.currentTime = e.currentTime, await new Promise((i) => {
      n.addEventListener("seeked", i, { once: !0 });
    });
    const o = r.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const i = o.getContext("2d");
      i && i.drawImage(n, 0, 0, o.width, o.height);
    } catch (i) {
      return t.log.warn("Failed to clone video", i), e.poster ? zr(e.poster, e.ownerDocument) : n;
    }
    return xl(o, t);
  }
  return n;
}
function Nu(e, t) {
  return iu(e) ? xl(e, t) : vu(e) ? Cu(e, t) : ts(e) ? Au(e) : go(e) ? Tu(e, t) : e.cloneNode(!1);
}
function Ru(e) {
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
const ju = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Iu = [
  "stroke",
  "fill"
];
function kl(e, t, n) {
  const { defaultComputedStyles: r } = n, s = e.nodeName.toLowerCase(), o = js(e) && s !== "svg", i = o ? Iu.map((b) => [b, e.getAttribute(b)]).filter(([, b]) => b !== null) : [], l = [
    o && "svg",
    s,
    i.map((b, h) => `${b}=${h}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (r.has(l))
    return r.get(l);
  const c = Ru(n), u = c == null ? void 0 : c.contentWindow;
  if (!u)
    return /* @__PURE__ */ new Map();
  const f = u == null ? void 0 : u.document;
  let d, v;
  o ? (d = f.createElementNS(bo, "svg"), v = d.ownerDocument.createElementNS(d.namespaceURI, s), i.forEach(([b, h]) => {
    v.setAttributeNS(null, b, h);
  }), d.appendChild(v)) : d = v = f.createElement(s), v.textContent = " ", f.body.appendChild(d);
  const p = u.getComputedStyle(v, t), _ = /* @__PURE__ */ new Map();
  for (let b = p.length, h = 0; h < b; h++) {
    const g = p.item(h);
    ju.includes(g) || _.set(g, p.getPropertyValue(g));
  }
  return f.body.removeChild(d), r.set(l, _), _;
}
function El(e, t, n) {
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
      let p = o.get(v);
      p || (p = /* @__PURE__ */ new Map(), o.set(v, p)), p.set(c, [u, f]);
    }
    t.get(c) === u && !f || (v ? s.push(v) : r.set(c, [u, f]));
  }
  return r;
}
function Mu(e, t, n, r) {
  var d, v, p, _;
  const { ownerWindow: s, includeStyleProperties: o, currentParentNodeStyle: i } = r, l = t.style, c = s.getComputedStyle(e), u = kl(e, null, r);
  i == null || i.forEach((b, h) => {
    u.delete(h);
  });
  const f = El(c, u, o);
  f.delete("transition-property"), f.delete("all"), f.delete("d"), f.delete("content"), n && (f.delete("margin-top"), f.delete("margin-right"), f.delete("margin-bottom"), f.delete("margin-left"), f.delete("margin-block-start"), f.delete("margin-block-end"), f.delete("margin-inline-start"), f.delete("margin-inline-end"), f.set("box-sizing", ["border-box", ""])), ((d = f.get("background-clip")) == null ? void 0 : d[0]) === "text" && t.classList.add("______background-clip--text"), hl && (f.has("font-kerning") || f.set("font-kerning", ["normal", ""]), (((v = f.get("overflow-x")) == null ? void 0 : v[0]) === "hidden" || ((p = f.get("overflow-y")) == null ? void 0 : p[0]) === "hidden") && ((_ = f.get("text-overflow")) == null ? void 0 : _[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && f.set("text-overflow", ["clip", ""]));
  for (let b = l.length, h = 0; h < b; h++)
    l.removeProperty(l.item(h));
  return f.forEach(([b, h], g) => {
    l.setProperty(g, b, h);
  }), f;
}
function Lu(e, t) {
  (au(e) || lu(e) || uu(e)) && t.setAttribute("value", e.value);
}
const Pu = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Du = [
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
function Fu(e, t, n, r, s) {
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
    const p = [bl()], _ = kl(e, f, r);
    c == null || c.forEach((M, L) => {
      _.delete(L);
    });
    const b = El(d, _, r.includeStyleProperties);
    b.delete("content"), b.delete("-webkit-locale"), ((k = b.get("background-clip")) == null ? void 0 : k[0]) === "text" && t.classList.add("______background-clip--text");
    const h = [
      `content: '${v}';`
    ];
    if (b.forEach(([M, L], B) => {
      h.push(`${B}: ${M}${L ? " !important" : ""};`);
    }), h.length === 1)
      return;
    try {
      t.className = [t.className, ...p].join(" ");
    } catch (M) {
      r.log.warn("Failed to copyPseudoClass", M);
      return;
    }
    const g = h.join(`
  `);
    let T = l.get(g);
    T || (T = [], l.set(g, T)), T.push(`.${p[0]}${f}`);
  }
  Pu.forEach(u), n && Du.forEach(u);
}
const Mi = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Li(e, t, n, r, s) {
  if (pn(n) && (cu(n) || fu(n)) || r.filter && !r.filter(n))
    return;
  Mi.has(t.nodeName) || Mi.has(n.nodeName) ? r.currentParentNodeStyle = void 0 : r.currentParentNodeStyle = r.currentNodeStyle;
  const o = await li(n, r, !1, s);
  r.isEnable("restoreScrollPosition") && qu(e, o), t.appendChild(o);
}
async function Pi(e, t, n, r) {
  var o;
  let s = e.firstChild;
  pn(e) && e.shadowRoot && (s = (o = e.shadowRoot) == null ? void 0 : o.firstChild, n.shadowRoots.push(e.shadowRoot));
  for (let i = s; i; i = i.nextSibling)
    if (!su(i))
      if (pn(i) && du(i) && typeof i.assignedNodes == "function") {
        const l = i.assignedNodes();
        for (let c = 0; c < l.length; c++)
          await Li(e, t, l[c], n, r);
      } else
        await Li(e, t, i, n, r);
}
function qu(e, t) {
  if (!ws(e) || !ws(t))
    return;
  const { scrollTop: n, scrollLeft: r } = e;
  if (!n && !r)
    return;
  const { transform: s } = t.style, o = new DOMMatrix(s), { a: i, b: l, c, d: u } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-r, -n), o.a = i, o.b = l, o.c = c, o.d = u, t.style.transform = o.toString();
}
function Ou(e, t) {
  const { backgroundColor: n, width: r, height: s, style: o } = t, i = e.style;
  if (n && i.setProperty("background-color", n, "important"), r && i.setProperty("width", `${r}px`, "important"), s && i.setProperty("height", `${s}px`, "important"), o)
    for (const l in o) i[l] = o[l];
}
const zu = /^[\w-:]+$/;
async function li(e, t, n = !1, r) {
  var u, f, d, v;
  const { ownerDocument: s, ownerWindow: o, fontFamilies: i, onCloneEachNode: l } = t;
  if (s && ou(e))
    return r && /\S/.test(e.data) && r(e.data), s.createTextNode(e.data);
  if (s && o && pn(e) && (ws(e) || js(e))) {
    const p = await Nu(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const k = p.getAttributeNames();
      for (let M = k.length, L = 0; L < M; L++) {
        const B = k[L];
        zu.test(B) || p.removeAttribute(B);
      }
    }
    const _ = t.currentNodeStyle = Mu(e, p, n, t);
    n && Ou(p, t);
    let b = !1;
    if (t.isEnable("copyScrollbar")) {
      const k = [
        (u = _.get("overflow-x")) == null ? void 0 : u[0],
        (f = _.get("overflow-y")) == null ? void 0 : f[0]
      ];
      b = k.includes("scroll") || (k.includes("auto") || k.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const h = (d = _.get("text-transform")) == null ? void 0 : d[0], g = _l((v = _.get("font-family")) == null ? void 0 : v[0]), T = g ? (k) => {
      h === "uppercase" ? k = k.toUpperCase() : h === "lowercase" ? k = k.toLowerCase() : h === "capitalize" && (k = k[0].toUpperCase() + k.substring(1)), g.forEach((M) => {
        let L = i.get(M);
        L || i.set(M, L = /* @__PURE__ */ new Set()), k.split("").forEach((B) => L.add(B));
      });
    } : void 0;
    return Fu(
      e,
      p,
      b,
      t,
      T
    ), Lu(e, p), go(e) || await Pi(
      e,
      p,
      t,
      T
    ), await (l == null ? void 0 : l(p)), p;
  }
  const c = e.cloneNode(!1);
  return await Pi(e, c, t), await (l == null ? void 0 : l(c)), c;
}
function Bu(e) {
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
function Uu(e) {
  const { url: t, timeout: n, responseType: r, ...s } = e, o = new AbortController(), i = n ? setTimeout(() => o.abort(), n) : void 0;
  return fetch(t, { signal: o.signal, ...s }).then((l) => {
    if (!l.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: l });
    switch (r) {
      case "arrayBuffer":
        return l.arrayBuffer();
      case "dataUrl":
        return l.blob().then(_u);
      case "text":
      default:
        return l.text();
    }
  }).finally(() => clearTimeout(i));
}
function xs(e, t) {
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
      placeholderImage: p
    },
    font: _,
    workers: b,
    fontFamilies: h
  } = e;
  r === "image" && (no || ai) && e.drawImageCount++;
  let g = u.get(n);
  if (!g) {
    v && v instanceof RegExp && v.test(i) && (i += (/\?/.test(i) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const T = r.startsWith("font") && _ && _.minify, k = /* @__PURE__ */ new Set();
    T && r.split(";")[1].split(",").forEach((ee) => {
      h.has(ee) && h.get(ee).forEach((q) => k.add(q));
    });
    const M = T && k.size, L = {
      url: i,
      timeout: l,
      responseType: M ? "arrayBuffer" : s,
      headers: r === "image" ? { accept: c } : void 0,
      ...d
    };
    g = {
      type: r,
      resolve: void 0,
      reject: void 0,
      response: null
    }, g.response = (async () => {
      if (f && r === "image") {
        const B = await f(n);
        if (B)
          return B;
      }
      return !no && n.startsWith("http") && b.length ? new Promise((B, ee) => {
        b[u.size & b.length - 1].postMessage({ rawUrl: n, ...L }), g.resolve = B, g.reject = ee;
      }) : Uu(L);
    })().catch((B) => {
      if (u.delete(n), r === "image" && p)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", i), typeof p == "string" ? p : p(o);
      throw B;
    }), u.set(n, g);
  }
  return g.response;
}
async function Sl(e, t, n, r) {
  if (!$l(e))
    return e;
  for (const [s, o] of Hu(e, t))
    try {
      const i = await xs(
        n,
        {
          url: o,
          requestType: r ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Vu(s), `$1${i}$3`);
    } catch (i) {
      n.log.warn("Failed to fetch css data url", s, i);
    }
  return e;
}
function $l(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Cl = /url\((['"]?)([^'"]+?)\1\)/g;
function Hu(e, t) {
  const n = [];
  return e.replace(Cl, (r, s, o) => (n.push([o, ml(o, t)]), r)), n.filter(([r]) => !Uo(r));
}
function Vu(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Wu = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Yu(e, t) {
  return Wu.map((n) => {
    const r = e.getPropertyValue(n);
    return !r || r === "none" ? null : ((no || ai) && t.drawImageCount++, Sl(r, null, t, !0).then((s) => {
      !s || r === s || e.setProperty(
        n,
        s,
        e.getPropertyPriority(n)
      );
    }));
  }).filter(Boolean);
}
function Ku(e, t) {
  if (ts(e)) {
    const n = e.currentSrc || e.src;
    if (!Uo(n))
      return [
        xs(t, {
          url: n,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((r) => {
          r && (e.srcset = "", e.dataset.originalSrc = n, e.src = r || "");
        })
      ];
    (no || ai) && t.drawImageCount++;
  } else if (js(e) && !Uo(e.href.baseVal)) {
    const n = e.href.baseVal;
    return [
      xs(t, {
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
function Xu(e, t) {
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
        xs(t, {
          url: o,
          responseType: "text"
        }).then((u) => {
          r == null || r.insertAdjacentHTML("beforeend", u);
        })
      ];
  }
  return [];
}
function Al(e, t) {
  const { tasks: n } = t;
  pn(e) && ((ts(e) || gl(e)) && n.push(...Ku(e, t)), ru(e) && n.push(...Xu(e, t))), ws(e) && n.push(...Yu(e.style, t)), e.childNodes.forEach((r) => {
    Al(r, t);
  });
}
async function Gu(e, t) {
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
      const c = Fi(l.cssText, t);
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
          if (tu(d)) {
            let p = v + 1;
            const _ = d.href;
            let b = "";
            try {
              b = await xs(t, {
                url: _,
                requestType: "text",
                responseType: "text"
              });
            } catch (g) {
              t.log.warn(`Error fetch remote css import from ${_}`, g);
            }
            const h = b.replace(
              Cl,
              (g, T, k) => g.replace(k, ml(k, _))
            );
            for (const g of Zu(h))
              try {
                f.insertRule(
                  g,
                  g.startsWith("@import") ? p += 1 : f.cssRules.length
                );
              } catch (T) {
                t.log.warn("Error inserting rule from remote css import", { rule: g, error: T });
              }
          }
        }))
      );
      const u = [];
      c.forEach((f) => {
        Ho(f.cssRules, u);
      }), u.filter((f) => {
        var d;
        return eu(f) && $l(f.style.getPropertyValue("src")) && ((d = _l(f.style.getPropertyValue("font-family"))) == null ? void 0 : d.some((v) => s.has(v)));
      }).forEach((f) => {
        const d = f, v = o.get(d.cssText);
        v ? r.appendChild(n.createTextNode(`${v}
`)) : i.push(
          Sl(
            d.cssText,
            d.parentStyleSheet ? d.parentStyleSheet.href : null,
            t
          ).then((p) => {
            p = Fi(p, t), o.set(d.cssText, p), r.appendChild(n.createTextNode(`${p}
`));
          })
        );
      });
    }
}
const Ju = /(\/\*[\s\S]*?\*\/)/g, Di = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Zu(e) {
  if (e == null)
    return [];
  const t = [];
  let n = e.replace(Ju, "");
  for (; ; ) {
    const o = Di.exec(n);
    if (!o)
      break;
    t.push(o[0]);
  }
  n = n.replace(Di, "");
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
const Qu = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, ed = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Fi(e, t) {
  const { font: n } = t, r = n ? n == null ? void 0 : n.preferredFormat : void 0;
  return r ? e.replace(ed, (s) => {
    for (; ; ) {
      const [o, , i] = Qu.exec(s) || [];
      if (!i)
        return "";
      if (i === r)
        return `src: ${o};`;
    }
  }) : e;
}
function Ho(e, t = []) {
  for (const n of Array.from(e))
    nu(n) ? t.push(...Ho(n.cssRules)) : "cssRules" in n ? Ho(n.cssRules, t) : t.push(n);
  return t;
}
async function td(e, t) {
  const n = await wl(e, t);
  if (pn(n.node) && js(n.node))
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
    onEmbedNode: p,
    onCreateForeignObjectSvg: _
  } = n;
  s.time("clone node");
  const b = await li(n.node, n, !0);
  if (i && r) {
    let M = "";
    c.forEach((L, B) => {
      M += `${L.join(`,
`)} {
  ${B}
}
`;
    }), i.appendChild(r.createTextNode(M));
  }
  s.timeEnd("clone node"), await (v == null ? void 0 : v(b)), u !== !1 && pn(b) && (s.time("embed web font"), await Gu(b, n), s.timeEnd("embed web font")), s.time("embed node"), Al(b, n);
  const h = o.length;
  let g = 0;
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
      f == null || f(++g, h);
    }
  };
  f == null || f(g, h), await Promise.all([...Array.from({ length: 4 })].map(T)), s.timeEnd("embed node"), await (p == null ? void 0 : p(b));
  const k = nd(b, n);
  return l && k.insertBefore(l, k.children[0]), i && k.insertBefore(i, k.children[0]), d && Bu(n), await (_ == null ? void 0 : _(k)), k;
}
function nd(e, t) {
  const { width: n, height: r } = t, s = gu(n, r, e.ownerDocument), o = s.ownerDocument.createElementNS(s.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), s.appendChild(o), s;
}
async function Tl(e, t) {
  var i;
  const n = await wl(e, t), r = await td(n), s = mu(r, n.isEnable("removeControlCharacter"));
  n.autoDestruct || (n.svgStyleElement = yl(n.ownerDocument), n.svgDefsElement = (i = n.ownerDocument) == null ? void 0 : i.createElementNS(bo, "defs"), n.svgStyles.clear());
  const o = zr(s, r.ownerDocument);
  return await Su(o, n);
}
const rd = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function sd(e) {
  try {
    const t = new URL(e, window.location.href);
    return t.origin === window.location.origin && t.pathname === window.location.pathname && !!t.hash;
  } catch {
    return !0;
  }
}
function Nl(e) {
  const t = window.fetch;
  return window.fetch = function(n, r) {
    const s = typeof n == "string" ? n : n instanceof URL ? n.toString() : n.url;
    return sd(s) ? Promise.resolve(new Response("", { status: 200 })) : t.call(window, n, r);
  }, e().finally(() => {
    window.fetch = t;
  });
}
const Rl = {
  fetch: {
    placeholderImage: rd
  },
  filter: (e) => {
    var t;
    return !(e instanceof HTMLElement && (e.tagName === "JAT-FEEDBACK" || (t = e.id) != null && t.startsWith("jat-feedback-")));
  }
};
async function jl() {
  return Nl(async () => (await Tl(document.documentElement, {
    ...Rl,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.8));
}
async function od() {
  return Nl(async () => (await Tl(document.documentElement, {
    ...Rl,
    scale: 0.5,
    width: window.innerWidth,
    height: window.innerHeight,
    style: {
      transform: `translate(-${window.scrollX}px, -${window.scrollY}px)`
    }
  })).toDataURL("image/jpeg", 0.6));
}
function id(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function ro(e, { delay: t = 0, duration: n = 400, easing: r = id, axis: s = "y" } = {}) {
  const o = getComputedStyle(e), i = +o.opacity, l = s === "y" ? "height" : "width", c = parseFloat(o[l]), u = s === "y" ? ["top", "bottom"] : ["left", "right"], f = u.map(
    (g) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${g[0].toUpperCase()}${g.slice(1)}`
    )
  ), d = parseFloat(o[`padding${f[0]}`]), v = parseFloat(o[`padding${f[1]}`]), p = parseFloat(o[`margin${f[0]}`]), _ = parseFloat(o[`margin${f[1]}`]), b = parseFloat(
    o[`border${f[0]}Width`]
  ), h = parseFloat(
    o[`border${f[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (g) => `overflow: hidden;opacity: ${Math.min(g * 20, 1) * i};${l}: ${g * c}px;padding-${u[0]}: ${g * d}px;padding-${u[1]}: ${g * v}px;margin-${u[0]}: ${g * p}px;margin-${u[1]}: ${g * _}px;border-${u[0]}-width: ${g * b}px;border-${u[1]}-width: ${g * h}px;min-${l}: 0`
  };
}
var ad = /* @__PURE__ */ N('<button class="thumb-edit svelte-1dhybq8" aria-label="Edit screenshot"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>'), ld = /* @__PURE__ */ N('<div class="thumb-wrap svelte-1dhybq8"><img class="thumb svelte-1dhybq8"/> <!> <button class="thumb-remove svelte-1dhybq8" aria-label="Remove screenshot">&times;</button></div>'), cd = /* @__PURE__ */ N('<span class="more-badge svelte-1dhybq8"> </span>'), fd = /* @__PURE__ */ N('<div class="thumb-strip svelte-1dhybq8"><!> <!></div>');
const ud = {
  hash: "svelte-1dhybq8",
  code: ".thumb-strip.svelte-1dhybq8 {display:flex;gap:6px;align-items:center;}.thumb-wrap.svelte-1dhybq8 {position:relative;}.thumb.svelte-1dhybq8 {width:60px;height:42px;object-fit:cover;border-radius:4px;border:1px solid #374151;}.thumb-edit.svelte-1dhybq8 {position:absolute;bottom:2px;right:2px;width:20px;height:20px;border-radius:3px;background:rgba(59, 130, 246, 0.85);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:0;transition:opacity 0.15s;}.thumb-wrap.svelte-1dhybq8:hover .thumb-edit:where(.svelte-1dhybq8) {opacity:1;}.thumb-edit.svelte-1dhybq8:hover {background:#2563eb;}.thumb-remove.svelte-1dhybq8 {position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:white;border:none;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}.more-badge.svelte-1dhybq8 {font-size:11px;color:#6b7280;padding:0 4px;}"
};
function Il(e, t) {
  In(t, !0), Yn(e, ud);
  let n = X(t, "screenshots", 23, () => []), r = X(t, "capturing", 7, !1), s = X(t, "oncapture", 7), o = X(t, "onremove", 7), i = X(t, "onedit", 7);
  var l = {
    get screenshots() {
      return n();
    },
    set screenshots(d = []) {
      n(d), W();
    },
    get capturing() {
      return r();
    },
    set capturing(d = !1) {
      r(d), W();
    },
    get oncapture() {
      return s();
    },
    set oncapture(d) {
      s(d), W();
    },
    get onremove() {
      return o();
    },
    set onremove(d) {
      o(d), W();
    },
    get onedit() {
      return i();
    },
    set onedit(d) {
      i(d), W();
    }
  }, c = Or(), u = _t(c);
  {
    var f = (d) => {
      var v = fd(), p = x(v);
      Ke(p, 17, () => n().slice(-3), lt, (h, g, T) => {
        const k = /* @__PURE__ */ At(() => n().length > 3 ? n().length - 3 + T : T);
        var M = ld(), L = x(M);
        me(L, "alt", `Screenshot ${T + 1}`);
        var B = S(L, 2);
        {
          var ee = (se) => {
            var oe = ad();
            V("click", oe, () => i()(a(k))), $(se, oe);
          };
          U(B, (se) => {
            i() && se(ee);
          });
        }
        var q = S(B, 2);
        y(M), O(() => me(L, "src", a(g))), V("click", q, () => o()(a(k))), $(h, M);
      });
      var _ = S(p, 2);
      {
        var b = (h) => {
          var g = cd(), T = x(g);
          y(g), O(() => K(T, `+${n().length - 3}`)), $(h, g);
        };
        U(_, (h) => {
          n().length > 3 && h(b);
        });
      }
      y(v), $(d, v);
    };
    U(u, (d) => {
      n().length > 0 && d(f);
    });
  }
  return $(e, c), Mn(l);
}
Rs(["click"]);
Kn(
  Il,
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
var dd = /* @__PURE__ */ bn('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"></ellipse></svg>'), vd = /* @__PURE__ */ bn('<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'), pd = /* @__PURE__ */ N('<button><!> <span class="tool-label svelte-yff65c"> </span></button>'), hd = /* @__PURE__ */ N("<button></button>"), gd = /* @__PURE__ */ N('<canvas class="base-canvas svelte-yff65c"></canvas> <canvas></canvas>', 1), md = /* @__PURE__ */ N('<div class="loading svelte-yff65c">Loading image...</div>'), bd = /* @__PURE__ */ N('<input type="text" class="text-overlay-input svelte-yff65c" placeholder="Type here..."/>'), _d = /* @__PURE__ */ N('<div class="annotation-backdrop svelte-yff65c"><div class="annotation-toolbar svelte-yff65c"><div class="tool-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="color-group svelte-yff65c"></div> <div class="divider svelte-yff65c"></div> <div class="action-group svelte-yff65c"><button class="action-btn svelte-yff65c" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Undo</button> <button class="action-btn svelte-yff65c" title="Clear all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Clear</button></div> <div class="spacer svelte-yff65c"></div> <div class="commit-group svelte-yff65c"><button class="cancel-btn svelte-yff65c">Cancel</button> <button class="done-btn svelte-yff65c">Done</button></div></div> <div class="canvas-container svelte-yff65c"><!></div> <!></div>');
const wd = {
  hash: "svelte-yff65c",
  code: `.annotation-backdrop.svelte-yff65c {position:fixed;inset:0;z-index:2147483647;background:rgba(0, 0, 0, 0.85);display:flex;flex-direction:column;align-items:center;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.annotation-toolbar.svelte-yff65c {display:flex;align-items:center;gap:6px;padding:8px 12px;background:#1f2937;border-bottom:1px solid #374151;width:100%;flex-shrink:0;flex-wrap:wrap;}.tool-group.svelte-yff65c, .color-group.svelte-yff65c, .action-group.svelte-yff65c, .commit-group.svelte-yff65c {display:flex;align-items:center;gap:4px;}.divider.svelte-yff65c {width:1px;height:24px;background:#374151;margin:0 4px;}.spacer.svelte-yff65c {flex:1;}.tool-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid transparent;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.tool-btn.svelte-yff65c:hover {color:#e5e7eb;background:#374151;}.tool-btn.active.svelte-yff65c {color:#fff;background:#3b82f6;border-color:#3b82f6;}.tool-label.svelte-yff65c {display:none;}
  @media (min-width: 640px) {.tool-label.svelte-yff65c {display:inline;}
  }.color-swatch.svelte-yff65c {width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 0.1s, border-color 0.1s;padding:0;}.color-swatch.svelte-yff65c:hover {transform:scale(1.15);}.color-swatch.active.svelte-yff65c {border-color:#fff;transform:scale(1.2);}.action-btn.svelte-yff65c {display:flex;align-items:center;gap:4px;padding:5px 8px;background:transparent;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.15s;}.action-btn.svelte-yff65c:hover:not(:disabled) {color:#e5e7eb;background:#374151;}.action-btn.svelte-yff65c:disabled {opacity:0.4;cursor:not-allowed;}.cancel-btn.svelte-yff65c {padding:6px 14px;background:#374151;border:1px solid #4b5563;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-yff65c:hover {background:#4b5563;}.done-btn.svelte-yff65c {padding:6px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;}.done-btn.svelte-yff65c:hover {background:#2563eb;}.canvas-container.svelte-yff65c {flex:1;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;}.base-canvas.svelte-yff65c, .overlay-canvas.svelte-yff65c {max-width:calc(100vw - 80px);max-height:calc(100vh - 120px);object-fit:contain;border-radius:4px;}.base-canvas.svelte-yff65c {display:block;}.overlay-canvas.svelte-yff65c {position:absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */}.cursor-crosshair.svelte-yff65c {cursor:crosshair;}.cursor-text.svelte-yff65c {cursor:text;}.text-overlay-input.svelte-yff65c {position:fixed;background:transparent;border:1px dashed rgba(255,255,255,0.5);outline:none;font-size:16px;font-weight:bold;font-family:sans-serif;padding:2px 4px;z-index:2147483647;min-width:80px;}.loading.svelte-yff65c {color:#9ca3af;font-size:14px;}`
};
function Ml(e, t) {
  In(t, !0), Yn(e, wd);
  let n = X(t, "imageDataUrl", 7), r = X(t, "onsave", 7), s = X(t, "oncancel", 7), o = /* @__PURE__ */ D("arrow"), i = /* @__PURE__ */ D(Le(Ai[0])), l = /* @__PURE__ */ D(Le([])), c = /* @__PURE__ */ D(void 0), u = /* @__PURE__ */ D(void 0), f = /* @__PURE__ */ D(0), d = /* @__PURE__ */ D(0), v = /* @__PURE__ */ D(!1), p = /* @__PURE__ */ D("idle"), _ = { x: 0, y: 0 }, b = [], h = /* @__PURE__ */ D(void 0), g = /* @__PURE__ */ D(Le(
    { x: 0, y: 0 }
    // canvas coords
  )), T = /* @__PURE__ */ D(Le({ left: "0px", top: "0px" })), k = /* @__PURE__ */ D("");
  si(() => {
    Ni(!0);
    const A = new Image();
    A.onload = () => {
      w(f, A.naturalWidth, !0), w(d, A.naturalHeight, !0), w(v, !0), requestAnimationFrame(() => L(A));
    }, A.src = n();
  }), Ya(() => {
    Ni(!1);
  });
  function M() {
    return new Promise((A, P) => {
      const F = new Image();
      F.onload = () => A(F), F.onerror = P, F.src = n();
    });
  }
  async function L(A) {
    if (!a(c)) return;
    const P = a(c).getContext("2d");
    P && (A || (A = await M()), a(c).width = a(f), a(c).height = a(d), P.drawImage(A, 0, 0, a(f), a(d)), ll(P, a(l)));
  }
  function B() {
    if (!a(u)) return;
    const A = a(u).getContext("2d");
    A && (a(u).width = a(f), a(u).height = a(d), A.clearRect(0, 0, a(f), a(d)));
  }
  function ee(A) {
    if (!a(u)) return { x: 0, y: 0 };
    const P = a(u).getBoundingClientRect(), F = a(f) / P.width, te = a(d) / P.height;
    return {
      x: (A.clientX - P.left) * F,
      y: (A.clientY - P.top) * te
    };
  }
  function q(A) {
    if (!a(u)) return { left: "0px", top: "0px" };
    const P = a(u).getBoundingClientRect();
    return {
      left: `${P.left + A.x / (a(f) / P.width)}px`,
      top: `${P.top + A.y / (a(d) / P.height)}px`
    };
  }
  function se(A) {
    const P = { color: a(i), strokeWidth: Ti };
    switch (a(o)) {
      case "arrow":
        return {
          ...P,
          id: ds(),
          type: "arrow",
          start: _,
          end: A
        };
      case "rectangle":
        return {
          ...P,
          id: ds(),
          type: "rectangle",
          start: _,
          end: A
        };
      case "ellipse":
        return {
          ...P,
          id: ds(),
          type: "ellipse",
          start: _,
          end: A
        };
      case "freehand":
        return {
          ...P,
          id: ds(),
          type: "freehand",
          points: [...b, A]
        };
      default:
        return null;
    }
  }
  function oe(A) {
    if (a(p) === "typing") {
      tt();
      return;
    }
    const P = ee(A);
    if (a(o) === "text") {
      w(p, "typing"), w(g, P, !0), w(T, q(P), !0), w(k, ""), requestAnimationFrame(() => {
        var F;
        return (F = a(h)) == null ? void 0 : F.focus();
      });
      return;
    }
    w(p, "drawing"), _ = P, b = [P];
  }
  function De(A) {
    if (a(p) !== "drawing") return;
    const P = ee(A);
    a(o) === "freehand" && b.push(P), B();
    const F = se(P);
    if (F && a(u)) {
      const te = a(u).getContext("2d");
      te && al(te, F);
    }
  }
  function Fe(A) {
    if (a(p) !== "drawing") return;
    const P = ee(A), F = se(P);
    F && w(l, [...a(l), F], !0), w(p, "idle"), b = [], B(), L();
  }
  function tt() {
    if (a(k).trim()) {
      const A = {
        id: ds(),
        type: "text",
        color: a(i),
        strokeWidth: Ti,
        position: a(g),
        content: a(k).trim(),
        fontSize: 20
      };
      w(l, [...a(l), A], !0), L();
    }
    w(k, ""), w(p, "idle");
  }
  function Jt(A) {
    A.key === "Enter" ? (A.preventDefault(), tt()) : A.key === "Escape" && (A.preventDefault(), w(k, ""), w(p, "idle"));
  }
  function He() {
    a(l).length !== 0 && (w(l, a(l).slice(0, -1), !0), L());
  }
  function It() {
    w(l, [], !0), L();
  }
  async function Zt() {
    if (a(l).length === 0) {
      r()(n());
      return;
    }
    const A = await zf(n(), a(l), a(f), a(d));
    r()(A);
  }
  function ut() {
    s()();
  }
  function pe(A) {
    A.stopPropagation(), A.key === "Escape" && a(p) !== "typing" && ut(), (A.ctrlKey || A.metaKey) && A.key === "z" && (A.preventDefault(), He());
  }
  const j = {
    arrow: "M5 19L19 5M19 5H9M19 5V15",
    rectangle: "M3 3h18v18H3z",
    ellipse: "",
    freehand: "M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4",
    text: "M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4"
  }, we = {
    arrow: "Arrow",
    rectangle: "Rect",
    ellipse: "Ellipse",
    freehand: "Draw",
    text: "Text"
  }, xe = ["arrow", "rectangle", "ellipse", "freehand", "text"];
  var Ve = {
    get imageDataUrl() {
      return n();
    },
    set imageDataUrl(A) {
      n(A), W();
    },
    get onsave() {
      return r();
    },
    set onsave(A) {
      r(A), W();
    },
    get oncancel() {
      return s();
    },
    set oncancel(A) {
      s(A), W();
    }
  }, Re = _d(), dt = x(Re), Mt = x(dt);
  Ke(Mt, 21, () => xe, lt, (A, P) => {
    var F = pd();
    let te;
    var Ee = x(F);
    {
      var R = (nt) => {
        var Ft = dd();
        $(nt, Ft);
      }, vt = (nt) => {
        var Ft = vd(), Pn = x(Ft);
        y(Ft), O(() => me(Pn, "d", j[a(P)])), $(nt, Ft);
      };
      U(Ee, (nt) => {
        a(P) === "ellipse" ? nt(R) : nt(vt, !1);
      });
    }
    var en = S(Ee, 2), Dt = x(en, !0);
    y(en), y(F), O(() => {
      te = Qe(F, 1, "tool-btn svelte-yff65c", null, te, { active: a(o) === a(P) }), me(F, "title", we[a(P)]), K(Dt, we[a(P)]);
    }), V("click", F, () => {
      w(o, a(P), !0);
    }), $(A, F);
  }), y(Mt);
  var Lt = S(Mt, 4);
  Ke(Lt, 21, () => Ai, lt, (A, P) => {
    var F = hd();
    let te;
    O(() => {
      te = Qe(F, 1, "color-swatch svelte-yff65c", null, te, { active: a(i) === a(P) }), gr(F, `background: ${a(P) ?? ""}; ${a(P) === "#111827" ? "border-color: #6b7280;" : ""}`), me(F, "title", a(P));
    }), V("click", F, () => {
      w(i, a(P), !0);
    }), $(A, F);
  }), y(Lt);
  var Ie = S(Lt, 4), Te = x(Ie), _n = S(Te, 2);
  y(Ie);
  var Ln = S(Ie, 4), Qt = x(Ln), rs = S(Qt, 2);
  y(Ln), y(dt);
  var C = S(dt, 2), ce = x(C);
  {
    var ke = (A) => {
      var P = gd(), F = _t(P);
      mr(F, (R) => w(c, R), () => a(c));
      var te = S(F, 2);
      let Ee;
      mr(te, (R) => w(u, R), () => a(u)), O(() => {
        me(F, "width", a(f)), me(F, "height", a(d)), me(te, "width", a(f)), me(te, "height", a(d)), Ee = Qe(te, 1, "overlay-canvas svelte-yff65c", null, Ee, {
          "cursor-crosshair": a(o) !== "text",
          "cursor-text": a(o) === "text"
        });
      }), V("mousedown", te, oe), V("mousemove", te, De), V("mouseup", te, Fe), $(A, P);
    }, wn = (A) => {
      var P = md();
      $(A, P);
    };
    U(ce, (A) => {
      a(v) ? A(ke) : A(wn, !1);
    });
  }
  y(C);
  var Pt = S(C, 2);
  {
    var We = (A) => {
      var P = bd();
      Ga(P), mr(P, (F) => w(h, F), () => a(h)), O(() => gr(P, `left: ${a(T).left ?? ""}; top: ${a(T).top ?? ""}; color: ${a(i) ?? ""};`)), V("keydown", P, Jt), Js("blur", P, tt), eo(P, () => a(k), (F) => w(k, F)), $(A, P);
    };
    U(Pt, (A) => {
      a(p) === "typing" && A(We);
    });
  }
  return y(Re), O(() => {
    Te.disabled = a(l).length === 0, _n.disabled = a(l).length === 0;
  }), V("keydown", Re, pe), V("keyup", Re, (A) => A.stopPropagation()), Js("keypress", Re, (A) => A.stopPropagation()), V("click", Te, He), V("click", _n, It), V("click", Qt, ut), V("click", rs, Zt), $(e, Re), Mn(Ve);
}
Rs([
  "keydown",
  "keyup",
  "click",
  "mousedown",
  "mousemove",
  "mouseup"
]);
Kn(Ml, { imageDataUrl: {}, onsave: {}, oncancel: {} }, [], [], { mode: "open" });
var yd = /* @__PURE__ */ N('<div class="log-entry svelte-x1hlqn"><span class="log-type svelte-x1hlqn"> </span> <span class="log-msg svelte-x1hlqn"> </span></div>'), xd = /* @__PURE__ */ N('<div class="log-more svelte-x1hlqn"> </div>'), kd = /* @__PURE__ */ N('<div class="log-list svelte-x1hlqn"><div class="log-header svelte-x1hlqn"> </div> <div class="log-scroll svelte-x1hlqn"><!> <!></div></div>');
const Ed = {
  hash: "svelte-x1hlqn",
  code: ".log-list.svelte-x1hlqn {border:1px solid #374151;border-radius:6px;overflow:hidden;}.log-header.svelte-x1hlqn {padding:6px 10px;background:#1f2937;font-size:11px;font-weight:600;color:#d1d5db;border-bottom:1px solid #374151;}.log-scroll.svelte-x1hlqn {max-height:140px;overflow-y:auto;background:#111827;}.log-entry.svelte-x1hlqn {padding:4px 10px;font-size:11px;font-family:'SF Mono', 'Fira Code', 'Cascadia Code', monospace;display:flex;gap:8px;border-bottom:1px solid #1f293780;line-height:1.4;}.log-type.svelte-x1hlqn {font-weight:600;text-transform:uppercase;font-size:10px;min-width:40px;flex-shrink:0;}.log-msg.svelte-x1hlqn {color:#d1d5db;word-break:break-word;}.log-more.svelte-x1hlqn {padding:4px 10px;font-size:10px;color:#6b7280;text-align:center;}"
};
function Ll(e, t) {
  In(t, !0), Yn(e, Ed);
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
    set logs(c = []) {
      n(c), W();
    }
  }, o = Or(), i = _t(o);
  {
    var l = (c) => {
      var u = kd(), f = x(u), d = x(f);
      y(f);
      var v = S(f, 2), p = x(v);
      Ke(p, 17, () => n().slice(-10), lt, (h, g) => {
        var T = yd(), k = x(T), M = x(k, !0);
        y(k);
        var L = S(k, 2), B = x(L);
        y(L), y(T), O(
          (ee) => {
            gr(k, `color: ${(r[a(g).type] || "#9ca3af") ?? ""}`), K(M, a(g).type), K(B, `${ee ?? ""}${a(g).message.length > 120 ? "..." : ""}`);
          },
          [() => a(g).message.substring(0, 120)]
        ), $(h, T);
      });
      var _ = S(p, 2);
      {
        var b = (h) => {
          var g = xd(), T = x(g);
          y(g), O(() => K(T, `+${n().length - 10} more`)), $(h, g);
        };
        U(_, (h) => {
          n().length > 10 && h(b);
        });
      }
      y(v), y(u), O(() => K(d, `Console Logs (${n().length ?? ""})`)), $(c, u);
    };
    U(i, (c) => {
      n().length > 0 && c(l);
    });
  }
  return $(e, o), Mn(s);
}
Kn(Ll, { logs: {} }, [], [], { mode: "open" });
var Sd = /* @__PURE__ */ bn('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), $d = /* @__PURE__ */ bn('<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"></circle><path d="M8 5V8.5M8 10.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>'), Cd = /* @__PURE__ */ N('<div><span class="icon svelte-1f5s7q1"><!></span> <span class="msg"> </span></div>');
const Ad = {
  hash: "svelte-1f5s7q1",
  code: `.jat-toast.svelte-1f5s7q1 {position:absolute;bottom:70px;right:0;padding:10px 16px;border-radius:8px;font-size:13px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);
    animation: svelte-1f5s7q1-toast-in 0.3s ease;white-space:nowrap;}.success.svelte-1f5s7q1 {background:#065f46;color:#d1fae5;border:1px solid #10b981;}.error.svelte-1f5s7q1 {background:#7f1d1d;color:#fecaca;border:1px solid #ef4444;}.icon.svelte-1f5s7q1 {display:flex;align-items:center;}
  @keyframes svelte-1f5s7q1-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }`
};
function Pl(e, t) {
  In(t, !0), Yn(e, Ad);
  let n = X(t, "message", 7), r = X(t, "type", 7, "success"), s = X(t, "visible", 7, !1);
  var o = {
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
  }, i = Or(), l = _t(i);
  {
    var c = (u) => {
      var f = Cd();
      let d;
      var v = x(f), p = x(v);
      {
        var _ = (T) => {
          var k = Sd();
          $(T, k);
        }, b = (T) => {
          var k = $d();
          $(T, k);
        };
        U(p, (T) => {
          r() === "success" ? T(_) : T(b, !1);
        });
      }
      y(v);
      var h = S(v, 2), g = x(h, !0);
      y(h), y(f), O(() => {
        d = Qe(f, 1, "jat-toast svelte-1f5s7q1", null, d, { error: r() === "error", success: r() === "success" }), K(g, n());
      }), $(u, f);
    };
    U(l, (u) => {
      s() && u(c);
    });
  }
  return $(e, i), Mn(o);
}
Kn(Pl, { message: {}, type: {}, visible: {} }, [], [], { mode: "open" });
var Td = /* @__PURE__ */ N('<span class="subtab-count svelte-1fnmin5"> </span>'), Nd = /* @__PURE__ */ N('<span class="subtab-count done-count svelte-1fnmin5"> </span>'), Rd = /* @__PURE__ */ N('<div class="loading svelte-1fnmin5"><span class="spinner svelte-1fnmin5"></span> <span>Loading your requests...</span></div>'), jd = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><p class="error-text svelte-1fnmin5"> </p> <button class="retry-btn svelte-1fnmin5">Retry</button></div>'), Id = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><div class="empty-icon svelte-1fnmin5"></div> <p>No requests yet</p> <p class="empty-sub svelte-1fnmin5">Submit feedback using the New Report tab</p></div>'), Md = /* @__PURE__ */ N('<div class="empty svelte-1fnmin5"><p class="empty-sub svelte-1fnmin5"> </p></div>'), Ld = /* @__PURE__ */ N('<a class="report-url svelte-1fnmin5" target="_blank" rel="noopener noreferrer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="svelte-1fnmin5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span class="svelte-1fnmin5"> </span></a>'), Pd = /* @__PURE__ */ N('<p class="revision-note svelte-1fnmin5"> </p>'), Dd = /* @__PURE__ */ N('<li class="svelte-1fnmin5"> </li>'), Fd = /* @__PURE__ */ N('<ul class="thread-summary svelte-1fnmin5"></ul>'), qd = /* @__PURE__ */ N('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Od = /* @__PURE__ */ N('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), zd = /* @__PURE__ */ N('<div class="thread-screenshots svelte-1fnmin5"></div> <!>', 1), Bd = /* @__PURE__ */ N('<span class="element-badge svelte-1fnmin5"> </span>'), Ud = /* @__PURE__ */ N('<div class="thread-elements svelte-1fnmin5"></div>'), Hd = /* @__PURE__ */ N('<div><div class="thread-entry-header svelte-1fnmin5"><span class="thread-from svelte-1fnmin5"> </span> <span> </span> <span class="thread-time svelte-1fnmin5"> </span></div> <p class="thread-message svelte-1fnmin5"><!></p> <!> <!> <!></div>'), Vd = /* @__PURE__ */ N('<div class="thread svelte-1fnmin5"></div>'), Wd = /* @__PURE__ */ N('<button class="thread-toggle svelte-1fnmin5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg> <span> </span></button> <!>', 1), Yd = /* @__PURE__ */ N('<p class="report-desc svelte-1fnmin5"> </p>'), Kd = /* @__PURE__ */ N('<button class="screenshot-thumb svelte-1fnmin5"><img loading="lazy" class="svelte-1fnmin5"/></button>'), Xd = /* @__PURE__ */ N('<div class="screenshot-expanded svelte-1fnmin5"><img alt="Screenshot" class="svelte-1fnmin5"/> <button class="screenshot-close svelte-1fnmin5" aria-label="Close">&times;</button></div>'), Gd = /* @__PURE__ */ N('<div class="report-screenshots svelte-1fnmin5"></div> <!>', 1), Jd = /* @__PURE__ */ N('<div class="dev-notes svelte-1fnmin5"><span class="dev-notes-label svelte-1fnmin5">Dev response:</span> <span class="dev-notes-content svelte-1fnmin5"><!></span></div>'), Zd = /* @__PURE__ */ N('<span class="status-pill accepted svelte-1fnmin5"></span>'), Qd = /* @__PURE__ */ N('<span class="status-pill rejected svelte-1fnmin5"></span>'), ev = /* @__PURE__ */ N('<div class="reject-preview-item svelte-1fnmin5"><img class="svelte-1fnmin5"/> <button class="reject-preview-remove svelte-1fnmin5" aria-label="Remove">&times;</button></div>'), tv = /* @__PURE__ */ N('<div class="reject-preview-strip svelte-1fnmin5"></div>'), nv = /* @__PURE__ */ N('<span class="element-badge removable svelte-1fnmin5"> <button class="element-remove svelte-1fnmin5">&times;</button></span>'), rv = /* @__PURE__ */ N('<div class="reject-element-strip svelte-1fnmin5"></div>'), sv = /* @__PURE__ */ N('<span class="char-hint svelte-1fnmin5"> </span>'), ov = /* @__PURE__ */ N('<div class="reject-reason-form svelte-1fnmin5"><textarea class="reject-reason-input svelte-1fnmin5" placeholder="Why are you rejecting? (min 10 characters)" rows="2"></textarea> <div class="reject-attachments svelte-1fnmin5"><button class="attach-btn svelte-1fnmin5" title="Capture screenshot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" stroke-width="2"></circle><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> </button> <button class="attach-btn svelte-1fnmin5" title="Pick an element"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v10M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Pick Element</button></div> <!> <!> <div class="reject-reason-actions svelte-1fnmin5"><button class="cancel-btn svelte-1fnmin5">Cancel</button> <button class="confirm-reject-btn svelte-1fnmin5"> </button></div> <!></div>'), iv = /* @__PURE__ */ N('<div class="response-actions svelte-1fnmin5"><button class="accept-btn svelte-1fnmin5"> </button> <button class="reject-btn svelte-1fnmin5"></button></div>'), av = /* @__PURE__ */ N('<div class="card-body svelte-1fnmin5"><!> <!> <!> <!> <!> <div class="report-footer svelte-1fnmin5"><span class="report-time svelte-1fnmin5"> </span> <!></div></div>'), lv = /* @__PURE__ */ N('<div><button class="card-toggle svelte-1fnmin5"><span class="report-type svelte-1fnmin5"> </span> <span class="report-title svelte-1fnmin5"> </span> <span class="report-status svelte-1fnmin5"> </span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <!></div>'), cv = /* @__PURE__ */ N('<div class="reports svelte-1fnmin5"></div>'), fv = /* @__PURE__ */ N("<div><!></div>"), uv = /* @__PURE__ */ N('<div class="request-list svelte-1fnmin5"><div class="subtabs svelte-1fnmin5"><button>In Progress <!></button> <button>Done <!></button></div> <div class="request-scroll svelte-1fnmin5"><!></div></div>');
const dv = {
  hash: "svelte-1fnmin5",
  code: `.request-list.svelte-1fnmin5 {display:flex;flex-direction:column;overflow:hidden;flex:1;min-height:0;}

  /* Subtabs */.subtabs.svelte-1fnmin5 {display:flex;border-bottom:1px solid #1f2937;padding:0 12px;flex-shrink:0;}.subtab.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:8px 10px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;text-transform:uppercase;letter-spacing:0.3px;}.subtab.svelte-1fnmin5:hover {color:#d1d5db;}.subtab.active.svelte-1fnmin5 {color:#f9fafb;border-bottom-color:#3b82f6;}.subtab-count.svelte-1fnmin5 {display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:#374151;color:#d1d5db;font-size:9px;font-weight:700;line-height:1;}.subtab.active.svelte-1fnmin5 .subtab-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.subtab-count.done-count.svelte-1fnmin5 {background:#10b98130;color:#34d399;}.subtab.active.svelte-1fnmin5 .subtab-count.done-count:where(.svelte-1fnmin5) {background:#3b82f6;color:#fff;}.request-scroll.svelte-1fnmin5 {padding:10px 12px;padding-bottom:80px;overflow-y:auto;flex:1;min-height:0;}.loading.svelte-1fnmin5 {display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 0;color:#9ca3af;font-size:13px;}.spinner.svelte-1fnmin5 {display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.15);border-top-color:#3b82f6;border-radius:50%;
    animation: svelte-1fnmin5-spin 0.6s linear infinite;}
  @keyframes svelte-1fnmin5-spin { to { transform: rotate(360deg); } }.empty.svelte-1fnmin5 {text-align:center;padding:40px 0;color:#6b7280;font-size:13px;}.empty-icon.svelte-1fnmin5 {font-size:32px;margin-bottom:8px;}.empty-sub.svelte-1fnmin5 {font-size:12px;color:#4b5563;margin-top:4px;}.error-text.svelte-1fnmin5 {color:#ef4444;margin-bottom:8px;}.retry-btn.svelte-1fnmin5 {padding:5px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;}.retry-btn.svelte-1fnmin5:hover {background:#374151;}.reports.svelte-1fnmin5 {display:flex;flex-direction:column;gap:6px;}.report-card.svelte-1fnmin5 {background:#1f2937;border:1px solid #374151;border-radius:8px;transition:border-color 0.15s;overflow:hidden;}.report-card.awaiting.svelte-1fnmin5 {border-color:#f59e0b40;box-shadow:0 0 0 1px #f59e0b20;}.report-card.expanded.svelte-1fnmin5 {border-color:#4b556380;}

  /* Collapsed card header (clickable toggle) */.card-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;width:100%;padding:9px 10px;background:none;border:none;cursor:pointer;font-family:inherit;text-align:left;color:inherit;}.card-toggle.svelte-1fnmin5:hover {background:#ffffff06;}.report-type.svelte-1fnmin5 {font-size:13px;flex-shrink:0;}.report-title.svelte-1fnmin5 {font-size:12px;font-weight:600;color:#f3f4f6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-status.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 6px;border-radius:10px;border:1px solid;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:0.3px;}.chevron.svelte-1fnmin5 {flex-shrink:0;color:#6b7280;transition:transform 0.15s;}.chevron-open.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Expanded card body */.card-body.svelte-1fnmin5 {padding:0 10px 10px;border-top:1px solid #ffffff08;}.report-url.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin:6px 0 0;font-size:11px;color:#60a5fa;text-decoration:none;overflow:hidden;transition:color 0.15s;}.report-url.svelte-1fnmin5:hover {color:#93c5fd;}.report-url.svelte-1fnmin5 svg:where(.svelte-1fnmin5) {flex-shrink:0;}.report-url.svelte-1fnmin5 span:where(.svelte-1fnmin5) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.report-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.screenshot-thumb.svelte-1fnmin5 {flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;background:#111827;cursor:pointer;padding:0;transition:border-color 0.15s;}.screenshot-thumb.svelte-1fnmin5:hover {border-color:#60a5fa;}.screenshot-thumb.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.screenshot-expanded.svelte-1fnmin5 {position:relative;margin-top:4px;border-radius:6px;overflow:hidden;border:1px solid #374151;}.screenshot-expanded.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;display:block;border-radius:5px;}.screenshot-close.svelte-1fnmin5 {position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:14px;line-height:1;display:flex;align-items:center;justify-content:center;}.screenshot-close.svelte-1fnmin5:hover {background:rgba(0,0,0,0.9);}.revision-note.svelte-1fnmin5 {font-size:10px;color:#f59e0b;margin:3px 0 0;font-weight:500;}.report-desc.svelte-1fnmin5 {font-size:12px;color:#9ca3af;margin:6px 0 0;line-height:1.4;}.dev-notes.svelte-1fnmin5 {margin-top:6px;padding:6px 8px;background:#111827;border-radius:5px;font-size:12px;color:#d1d5db;border-left:2px solid #3b82f6;}.dev-notes-label.svelte-1fnmin5 {font-weight:600;color:#60a5fa;margin-right:4px;font-size:11px;}.dev-notes-content.svelte-1fnmin5 {line-height:1.5;}

  /* Thread toggle button */.thread-toggle.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;margin-top:6px;padding:3px 6px;background:none;border:none;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;border-radius:4px;transition:color 0.15s, background 0.15s;}.thread-toggle.svelte-1fnmin5:hover {color:#d1d5db;background:#111827;}.thread-toggle-icon.svelte-1fnmin5 {transition:transform 0.15s;}.thread-toggle-icon.expanded.svelte-1fnmin5 {transform:rotate(90deg);}

  /* Thread container */.thread.svelte-1fnmin5 {margin-top:6px;display:flex;flex-direction:column;gap:4px;}.thread-entry.svelte-1fnmin5 {padding:6px 8px;border-radius:5px;font-size:12px;border-left:2px solid;}.thread-user.svelte-1fnmin5 {background:#111827;border-left-color:#6b7280;}.thread-dev.svelte-1fnmin5 {background:#0f172a;border-left-color:#3b82f6;}.thread-entry-header.svelte-1fnmin5 {display:flex;align-items:center;gap:6px;margin-bottom:3px;}.thread-from.svelte-1fnmin5 {font-weight:600;font-size:11px;color:#d1d5db;}.thread-type-badge.svelte-1fnmin5 {font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.3px;}.thread-type-badge.submission.svelte-1fnmin5 {background:#6b728020;color:#9ca3af;}.thread-type-badge.completion.svelte-1fnmin5 {background:#3b82f620;color:#60a5fa;}.thread-type-badge.rejection.svelte-1fnmin5 {background:#ef444420;color:#f87171;}.thread-type-badge.acceptance.svelte-1fnmin5 {background:#10b98120;color:#34d399;}.thread-time.svelte-1fnmin5 {font-size:10px;color:#4b5563;margin-left:auto;}.thread-message.svelte-1fnmin5 {color:#d1d5db;line-height:1.5;margin:0;word-break:break-word;}.thread-summary.svelte-1fnmin5 {margin:4px 0 0 0;padding:0 0 0 16px;font-size:11px;color:#9ca3af;}.thread-summary.svelte-1fnmin5 li:where(.svelte-1fnmin5) {margin:1px 0;}.thread-screenshots.svelte-1fnmin5 {display:flex;gap:4px;margin-top:4px;}.thread-elements.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:4px;}.element-badge.svelte-1fnmin5 {font-size:10px;font-family:'SF Mono', 'Fira Code', 'Consolas', monospace;padding:1px 5px;background:#1e293b;border:1px solid #334155;border-radius:3px;color:#94a3b8;}.element-badge.removable.svelte-1fnmin5 {display:inline-flex;align-items:center;gap:3px;}.element-remove.svelte-1fnmin5 {background:none;border:none;color:#6b7280;cursor:pointer;padding:0;font-size:12px;line-height:1;}.element-remove.svelte-1fnmin5:hover {color:#ef4444;}

  /* Enhanced rejection form */.reject-attachments.svelte-1fnmin5 {display:flex;gap:6px;margin-top:6px;}.attach-btn.svelte-1fnmin5 {display:flex;align-items:center;gap:4px;padding:3px 8px;background:#111827;border:1px solid #374151;border-radius:4px;color:#9ca3af;font-size:11px;cursor:pointer;font-family:inherit;transition:border-color 0.15s, color 0.15s;}.attach-btn.svelte-1fnmin5:hover:not(:disabled) {border-color:#60a5fa;color:#d1d5db;}.attach-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-preview-strip.svelte-1fnmin5 {display:flex;gap:4px;margin-top:6px;overflow-x:auto;}.reject-preview-item.svelte-1fnmin5 {position:relative;flex-shrink:0;width:52px;height:36px;border-radius:4px;overflow:hidden;border:1px solid #374151;}.reject-preview-item.svelte-1fnmin5 img:where(.svelte-1fnmin5) {width:100%;height:100%;object-fit:cover;display:block;}.reject-preview-remove.svelte-1fnmin5 {position:absolute;top:1px;right:1px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.7);color:#e5e7eb;border:none;cursor:pointer;font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center;}.reject-preview-remove.svelte-1fnmin5:hover {background:#ef4444;}.reject-element-strip.svelte-1fnmin5 {display:flex;gap:3px;flex-wrap:wrap;margin-top:6px;}.report-footer.svelte-1fnmin5 {display:flex;align-items:center;justify-content:space-between;margin-top:8px;}.report-time.svelte-1fnmin5 {font-size:11px;color:#6b7280;}.status-pill.svelte-1fnmin5 {font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;}.status-pill.accepted.svelte-1fnmin5 {color:#10b981;background:#10b98118;}.status-pill.rejected.svelte-1fnmin5 {color:#ef4444;background:#ef444418;}.response-actions.svelte-1fnmin5 {display:flex;gap:6px;}.accept-btn.svelte-1fnmin5, .reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;font-family:inherit;transition:background 0.15s;}.accept-btn.svelte-1fnmin5 {background:#10b98118;color:#10b981;border-color:#10b98140;}.accept-btn.svelte-1fnmin5:hover:not(:disabled) {background:#10b98130;}.reject-btn.svelte-1fnmin5 {background:#ef444418;color:#ef4444;border-color:#ef444440;}.reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.accept-btn.svelte-1fnmin5:disabled, .reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.reject-reason-form.svelte-1fnmin5 {width:100%;margin-top:6px;}.reject-reason-input.svelte-1fnmin5 {width:100%;padding:6px 8px;background:#111827;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;font-family:inherit;resize:vertical;min-height:40px;}.reject-reason-input.svelte-1fnmin5:focus {outline:none;border-color:#ef4444;}.reject-reason-actions.svelte-1fnmin5 {display:flex;justify-content:flex-end;gap:6px;margin-top:6px;}.cancel-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #374151;background:#1f2937;color:#9ca3af;font-family:inherit;transition:background 0.15s;}.cancel-btn.svelte-1fnmin5:hover {background:#374151;}.confirm-reject-btn.svelte-1fnmin5 {padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid #ef444440;background:#ef444418;color:#ef4444;font-family:inherit;transition:background 0.15s;}.confirm-reject-btn.svelte-1fnmin5:hover:not(:disabled) {background:#ef444430;}.confirm-reject-btn.svelte-1fnmin5:disabled {opacity:0.5;cursor:not-allowed;}.char-hint.svelte-1fnmin5 {display:block;font-size:10px;color:#6b7280;margin-top:3px;}`
};
function Dl(e, t) {
  In(t, !0), Yn(e, dv);
  let n = X(t, "endpoint", 7), r = X(t, "reports", 31, () => Le([])), s = X(t, "loading", 7), o = X(t, "error", 7), i = X(t, "onreload", 7), l = /* @__PURE__ */ D(null), c = /* @__PURE__ */ D(null), u = /* @__PURE__ */ D(null), f = /* @__PURE__ */ D(void 0), d = /* @__PURE__ */ D(""), v = /* @__PURE__ */ D(""), p = /* @__PURE__ */ D(""), _ = /* @__PURE__ */ D(Le([])), b = /* @__PURE__ */ D(Le([])), h = /* @__PURE__ */ D(!1), g = /* @__PURE__ */ D("active"), T = /* @__PURE__ */ At(() => a(g) === "active" ? r().filter((C) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(C.status)) : r().filter((C) => C.status === "accepted" || C.status === "closed")), k = /* @__PURE__ */ At(() => r().filter((C) => [
    "submitted",
    "in_progress",
    "rejected",
    "completed",
    "wontfix"
  ].includes(C.status)).length), M = /* @__PURE__ */ At(() => r().filter((C) => C.status === "accepted" || C.status === "closed").length);
  function L(C) {
    return C ? C.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/^#{1,3} (.+)$/gm, '<strong style="display:block;margin-top:6px;color:#f3f4f6">$1</strong>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^[-*] (.+)$/gm, '<span style="display:block;padding-left:10px">• $1</span>').replace(/\n/g, "<br>") : "";
  }
  function B(C) {
    const ce = a(u) === C;
    w(u, ce ? null : C, !0), ce ? (a(c) === C && w(c, null), w(l, null)) : setTimeout(
      () => {
        if (!a(f)) return;
        const ke = a(f).querySelector(`[data-card-id="${C}"]`);
        ke && ke.scrollIntoView({ behavior: "smooth", block: "nearest" });
      },
      220
    );
  }
  function ee(C) {
    w(v, C, !0), w(p, ""), w(_, [], !0), w(b, [], !0);
  }
  function q() {
    w(v, ""), w(p, ""), w(_, [], !0), w(b, [], !0);
  }
  async function se() {
    if (!a(h)) {
      w(h, !0);
      try {
        const C = await jl();
        w(_, [...a(_), C], !0);
      } catch (C) {
        console.error("Screenshot capture failed:", C);
      }
      w(h, !1);
    }
  }
  function oe(C) {
    w(_, a(_).filter((ce, ke) => ke !== C), !0);
  }
  function De() {
    sl((C) => {
      w(
        b,
        [
          ...a(b),
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
  function Fe(C) {
    w(b, a(b).filter((ce, ke) => ke !== C), !0);
  }
  async function tt(C, ce, ke) {
    w(d, C, !0);
    const wn = ce === "rejected" ? {
      screenshots: a(_).length > 0 ? a(_) : void 0,
      elements: a(b).length > 0 ? a(b) : void 0
    } : void 0;
    (await Uf(n(), C, ce, ke, wn)).ok ? (r(r().map((We) => We.id === C ? {
      ...We,
      status: ce === "rejected" ? "submitted" : "accepted",
      responded_at: (/* @__PURE__ */ new Date()).toISOString(),
      ...ce === "rejected" ? { revision_count: (We.revision_count || 0) + 1 } : {}
    } : We)), w(v, ""), w(p, ""), w(_, [], !0), w(b, [], !0), i()()) : w(v, ""), w(d, "");
  }
  function Jt(C) {
    w(c, a(c) === C ? null : C, !0);
  }
  function He(C) {
    return C ? C.length : 0;
  }
  function It(C) {
    return {
      submission: "Submitted",
      completion: "Completed",
      rejection: "Rejected",
      acceptance: "Accepted",
      note: "Note"
    }[C.type] || C.type;
  }
  function Zt(C) {
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
  function ut(C) {
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
  function pe(C) {
    return C === "bug" ? "🐛" : C === "enhancement" ? "✨" : "📝";
  }
  function j(C) {
    const ce = Date.now(), ke = new Date(C).getTime(), wn = ce - ke, Pt = Math.floor(wn / 6e4);
    if (Pt < 1) return "just now";
    if (Pt < 60) return `${Pt}m ago`;
    const We = Math.floor(Pt / 60);
    if (We < 24) return `${We}h ago`;
    const A = Math.floor(We / 24);
    return A < 30 ? `${A}d ago` : new Date(C).toLocaleDateString();
  }
  var we = {
    get endpoint() {
      return n();
    },
    set endpoint(C) {
      n(C), W();
    },
    get reports() {
      return r();
    },
    set reports(C = []) {
      r(C), W();
    },
    get loading() {
      return s();
    },
    set loading(C) {
      s(C), W();
    },
    get error() {
      return o();
    },
    set error(C) {
      o(C), W();
    },
    get onreload() {
      return i();
    },
    set onreload(C) {
      i(C), W();
    }
  }, xe = uv(), Ve = x(xe), Re = x(Ve);
  let dt;
  var Mt = S(x(Re));
  {
    var Lt = (C) => {
      var ce = Td(), ke = x(ce, !0);
      y(ce), O(() => K(ke, a(k))), $(C, ce);
    };
    U(Mt, (C) => {
      a(k) > 0 && C(Lt);
    });
  }
  y(Re);
  var Ie = S(Re, 2);
  let Te;
  var _n = S(x(Ie));
  {
    var Ln = (C) => {
      var ce = Nd(), ke = x(ce, !0);
      y(ce), O(() => K(ke, a(M))), $(C, ce);
    };
    U(_n, (C) => {
      a(M) > 0 && C(Ln);
    });
  }
  y(Ie), y(Ve);
  var Qt = S(Ve, 2), rs = x(Qt);
  return ef(rs, () => a(g), (C) => {
    var ce = fv(), ke = x(ce);
    {
      var wn = (F) => {
        var te = Rd();
        $(F, te);
      }, Pt = (F) => {
        var te = jd(), Ee = x(te), R = x(Ee, !0);
        y(Ee);
        var vt = S(Ee, 2);
        y(te), O(() => K(R, o())), V("click", vt, function(...en) {
          var Dt;
          (Dt = i()) == null || Dt.apply(this, en);
        }), $(F, te);
      }, We = (F) => {
        var te = Id(), Ee = x(te);
        Ee.textContent = "📋", Ks(4), y(te), $(F, te);
      }, A = (F) => {
        var te = Md(), Ee = x(te), R = x(Ee, !0);
        y(Ee), y(te), O(() => K(R, a(g) === "submitted" ? "No submitted requests" : a(g) === "review" ? "Nothing to review right now" : "No completed requests yet")), $(F, te);
      }, P = (F) => {
        var te = cv();
        Ke(te, 21, () => a(T), (Ee) => Ee.id, (Ee, R) => {
          var vt = lv();
          let en;
          var Dt = x(vt), nt = x(Dt), Ft = x(nt, !0);
          y(nt);
          var Pn = S(nt, 2), Ar = x(Pn, !0);
          y(Pn);
          var Xn = S(Pn, 2), _o = x(Xn, !0);
          y(Xn);
          var wo = S(Xn, 2);
          let Is;
          y(Dt);
          var Ms = S(Dt, 2);
          {
            var yo = (Dn) => {
              var Fn = av(), Tr = x(Fn);
              {
                var ss = (ne) => {
                  var ae = Ld(), he = S(x(ae), 2), rt = x(he, !0);
                  y(he), y(ae), O(
                    (nn) => {
                      me(ae, "href", a(R).page_url), K(rt, nn);
                    },
                    [
                      () => a(R).page_url.replace(/^https?:\/\//, "").split("?")[0]
                    ]
                  ), $(ne, ae);
                };
                U(Tr, (ne) => {
                  a(R).page_url && ne(ss);
                });
              }
              var Nr = S(Tr, 2);
              {
                var E = (ne) => {
                  var ae = Pd(), he = x(ae);
                  y(ae), O(() => K(he, `Revision ${a(R).revision_count ?? ""}`)), $(ne, ae);
                };
                U(Nr, (ne) => {
                  a(R).revision_count > 0 && a(R).status !== "accepted" && ne(E);
                });
              }
              var H = S(Nr, 2);
              {
                var ve = (ne) => {
                  var ae = Wd(), he = _t(ae), rt = x(he);
                  let nn;
                  var pt = S(rt, 2), Se = x(pt);
                  y(pt), y(he);
                  var $e = S(he, 2);
                  {
                    var Ge = (ge) => {
                      var xt = Vd();
                      Ke(xt, 21, () => a(R).thread, (qn) => qn.id, (qn, be) => {
                        var yn = Hd();
                        let Zn;
                        var On = x(yn), rn = x(On), Mr = x(rn, !0);
                        y(rn);
                        var qt = S(rn, 2);
                        let Qn;
                        var er = x(qt, !0);
                        y(qt);
                        var Lr = S(qt, 2), tr = x(Lr, !0);
                        y(Lr), y(On);
                        var ye = S(On, 2), Je = x(ye);
                        xi(Je, () => L(a(be).message)), y(ye);
                        var sn = S(ye, 2);
                        {
                          var Ot = (ie) => {
                            var de = Fd();
                            Ke(de, 21, () => a(be).summary, lt, (je, st) => {
                              var Ye = Dd(), ht = x(Ye, !0);
                              y(Ye), O(() => K(ht, a(st))), $(je, Ye);
                            }), y(de), $(ie, de);
                          };
                          U(sn, (ie) => {
                            a(be).summary && a(be).summary.length > 0 && ie(Ot);
                          });
                        }
                        var I = S(sn, 2);
                        {
                          var z = (ie) => {
                            var de = zd(), je = _t(de);
                            Ke(je, 21, () => a(be).screenshots, lt, (ht, kt, Ze) => {
                              var on = Or(), nr = _t(on);
                              {
                                var xn = (zt) => {
                                  var an = qd();
                                  me(an, "aria-label", `Screenshot ${Ze + 1}`);
                                  var Pr = x(an);
                                  me(Pr, "alt", `Screenshot ${Ze + 1}`), y(an), O(() => me(Pr, "src", `${n() ?? ""}${a(kt).url ?? ""}`)), V("click", an, () => w(l, a(l) === a(kt).url ? null : a(kt).url, !0)), $(zt, an);
                                };
                                U(nr, (zt) => {
                                  a(kt).url && zt(xn);
                                });
                              }
                              $(ht, on);
                            }), y(je);
                            var st = S(je, 2);
                            {
                              var Ye = (ht) => {
                                const kt = /* @__PURE__ */ At(() => a(be).screenshots.find((xn) => xn.url === a(l)));
                                var Ze = Or(), on = _t(Ze);
                                {
                                  var nr = (xn) => {
                                    var zt = Od(), an = x(zt), Pr = S(an, 2);
                                    y(zt), O(() => me(an, "src", `${n() ?? ""}${a(l) ?? ""}`)), V("click", Pr, () => w(l, null)), $(xn, zt);
                                  };
                                  U(on, (xn) => {
                                    a(kt) && xn(nr);
                                  });
                                }
                                $(ht, Ze);
                              };
                              U(st, (ht) => {
                                a(l) && ht(Ye);
                              });
                            }
                            $(ie, de);
                          };
                          U(I, (ie) => {
                            a(be).screenshots && a(be).screenshots.length > 0 && ie(z);
                          });
                        }
                        var fe = S(I, 2);
                        {
                          var _e = (ie) => {
                            var de = Ud();
                            Ke(de, 21, () => a(be).elements, lt, (je, st) => {
                              var Ye = Bd(), ht = x(Ye);
                              y(Ye), O(
                                (kt, Ze) => {
                                  me(Ye, "title", a(st).selector), K(ht, `<${kt ?? ""}${a(st).id ? `#${a(st).id}` : ""}${Ze ?? ""}>`);
                                },
                                [
                                  () => a(st).tagName.toLowerCase(),
                                  () => a(st).className ? `.${a(st).className.split(" ")[0]}` : ""
                                ]
                              ), $(je, Ye);
                            }), y(de), $(ie, de);
                          };
                          U(fe, (ie) => {
                            a(be).elements && a(be).elements.length > 0 && ie(_e);
                          });
                        }
                        y(yn), O(
                          (ie, de) => {
                            Zn = Qe(yn, 1, "thread-entry svelte-1fnmin5", null, Zn, {
                              "thread-user": a(be).from === "user",
                              "thread-dev": a(be).from === "dev"
                            }), K(Mr, a(be).from === "user" ? "You" : "Dev"), Qn = Qe(qt, 1, "thread-type-badge svelte-1fnmin5", null, Qn, {
                              submission: a(be).type === "submission",
                              completion: a(be).type === "completion",
                              rejection: a(be).type === "rejection",
                              acceptance: a(be).type === "acceptance"
                            }), K(er, ie), K(tr, de);
                          },
                          [
                            () => It(a(be)),
                            () => j(a(be).at)
                          ]
                        ), $(qn, yn);
                      }), y(xt), $(ge, xt);
                    };
                    U($e, (ge) => {
                      a(c) === a(R).id && ge(Ge);
                    });
                  }
                  O(
                    (ge, xt) => {
                      nn = Qe(rt, 0, "thread-toggle-icon svelte-1fnmin5", null, nn, { expanded: a(c) === a(R).id }), K(Se, `${ge ?? ""} ${xt ?? ""}`);
                    },
                    [
                      () => He(a(R).thread),
                      () => He(a(R).thread) === 1 ? "message" : "messages"
                    ]
                  ), V("click", he, () => Jt(a(R).id)), $(ne, ae);
                }, ue = (ne) => {
                  var ae = Yd(), he = x(ae, !0);
                  y(ae), O((rt) => K(he, rt), [
                    () => a(R).description.length > 120 ? a(R).description.slice(0, 120) + "..." : a(R).description
                  ]), $(ne, ae);
                };
                U(H, (ne) => {
                  a(R).thread && a(R).thread.length > 0 ? ne(ve) : a(R).description && ne(ue, 1);
                });
              }
              var tn = S(H, 2);
              {
                var os = (ne) => {
                  var ae = Gd(), he = _t(ae);
                  Ke(he, 21, () => a(R).screenshot_urls, lt, (Se, $e, Ge) => {
                    var ge = Kd();
                    me(ge, "aria-label", `Screenshot ${Ge + 1}`);
                    var xt = x(ge);
                    me(xt, "alt", `Screenshot ${Ge + 1}`), y(ge), O(() => me(xt, "src", `${n() ?? ""}${a($e) ?? ""}`)), V("click", ge, () => w(l, a(l) === a($e) ? null : a($e), !0)), $(Se, ge);
                  }), y(he);
                  var rt = S(he, 2);
                  {
                    var nn = (Se) => {
                      var $e = Xd(), Ge = x($e), ge = S(Ge, 2);
                      y($e), O(() => me(Ge, "src", `${n() ?? ""}${a(l) ?? ""}`)), V("click", ge, () => w(l, null)), $(Se, $e);
                    }, pt = /* @__PURE__ */ At(() => a(l) && a(R).screenshot_urls.includes(a(l)));
                    U(rt, (Se) => {
                      a(pt) && Se(nn);
                    });
                  }
                  $(ne, ae);
                };
                U(tn, (ne) => {
                  !a(R).thread && a(R).screenshot_urls && a(R).screenshot_urls.length > 0 && ne(os);
                });
              }
              var Rr = S(tn, 2);
              {
                var is = (ne) => {
                  var ae = Jd(), he = S(x(ae), 2), rt = x(he);
                  xi(rt, () => L(a(R).dev_notes)), y(he), y(ae), $(ne, ae);
                };
                U(Rr, (ne) => {
                  a(R).dev_notes && !a(R).thread && a(R).status !== "in_progress" && ne(is);
                });
              }
              var Gn = S(Rr, 2), jr = x(Gn), Ir = x(jr, !0);
              y(jr);
              var as = S(jr, 2);
              {
                var ls = (ne) => {
                  var ae = Zd();
                  ae.textContent = "✓ Accepted", $(ne, ae);
                }, Jn = (ne) => {
                  var ae = Qd();
                  ae.textContent = "✗ Rejected", $(ne, ae);
                }, xo = (ne) => {
                  var ae = Or(), he = _t(ae);
                  {
                    var rt = (pt) => {
                      var Se = ov(), $e = x(Se);
                      $a($e);
                      var Ge = S($e, 2), ge = x(Ge), xt = S(x(ge));
                      y(ge);
                      var qn = S(ge, 2);
                      y(Ge);
                      var be = S(Ge, 2);
                      {
                        var yn = (ye) => {
                          var Je = tv();
                          Ke(Je, 21, () => a(_), lt, (sn, Ot, I) => {
                            var z = ev(), fe = x(z);
                            me(fe, "alt", `Screenshot ${I + 1}`);
                            var _e = S(fe, 2);
                            y(z), O(() => me(fe, "src", a(Ot))), V("click", _e, () => oe(I)), $(sn, z);
                          }), y(Je), $(ye, Je);
                        };
                        U(be, (ye) => {
                          a(_).length > 0 && ye(yn);
                        });
                      }
                      var Zn = S(be, 2);
                      {
                        var On = (ye) => {
                          var Je = rv();
                          Ke(Je, 21, () => a(b), lt, (sn, Ot, I) => {
                            var z = nv(), fe = x(z), _e = S(fe);
                            y(z), O((ie) => K(fe, `<${ie ?? ""}${a(Ot).id ? `#${a(Ot).id}` : ""}> `), [() => a(Ot).tagName.toLowerCase()]), V("click", _e, () => Fe(I)), $(sn, z);
                          }), y(Je), $(ye, Je);
                        };
                        U(Zn, (ye) => {
                          a(b).length > 0 && ye(On);
                        });
                      }
                      var rn = S(Zn, 2), Mr = x(rn), qt = S(Mr, 2), Qn = x(qt, !0);
                      y(qt), y(rn);
                      var er = S(rn, 2);
                      {
                        var Lr = (ye) => {
                          var Je = sv(), sn = x(Je);
                          y(Je), O((Ot) => K(sn, `${Ot ?? ""} more characters needed`), [() => 10 - a(p).trim().length]), $(ye, Je);
                        }, tr = /* @__PURE__ */ At(() => a(p).trim().length > 0 && a(p).trim().length < 10);
                        U(er, (ye) => {
                          a(tr) && ye(Lr);
                        });
                      }
                      y(Se), O(
                        (ye) => {
                          ge.disabled = a(h), K(xt, ` ${a(h) ? "..." : "Screenshot"}`), qt.disabled = ye, K(Qn, a(d) === a(R).id ? "..." : "✗ Reject");
                        },
                        [
                          () => a(p).trim().length < 10 || a(d) === a(R).id
                        ]
                      ), eo($e, () => a(p), (ye) => w(p, ye)), V("click", ge, se), V("click", qn, De), V("click", Mr, q), V("click", qt, () => tt(a(R).id, "rejected", a(p).trim())), $(pt, Se);
                    }, nn = (pt) => {
                      var Se = iv(), $e = x(Se), Ge = x($e, !0);
                      y($e);
                      var ge = S($e, 2);
                      ge.textContent = "✗ Reject", y(Se), O(() => {
                        $e.disabled = a(d) === a(R).id, K(Ge, a(d) === a(R).id ? "..." : "✓ Accept"), ge.disabled = a(d) === a(R).id;
                      }), V("click", $e, () => tt(a(R).id, "accepted")), V("click", ge, () => ee(a(R).id)), $(pt, Se);
                    };
                    U(he, (pt) => {
                      a(v) === a(R).id ? pt(rt) : pt(nn, !1);
                    });
                  }
                  $(ne, ae);
                };
                U(as, (ne) => {
                  a(R).status === "accepted" ? ne(ls) : a(R).status === "rejected" ? ne(Jn, 1) : (a(R).status === "completed" || a(R).status === "wontfix") && ne(xo, 2);
                });
              }
              y(Gn), y(Fn), O((ne) => K(Ir, ne), [() => j(a(R).created_at)]), Qs(3, Fn, () => ro, () => ({ duration: 200 })), $(Dn, Fn);
            };
            U(Ms, (Dn) => {
              a(u) === a(R).id && Dn(yo);
            });
          }
          y(vt), O(
            (Dn, Fn, Tr, ss, Nr) => {
              en = Qe(vt, 1, "report-card svelte-1fnmin5", null, en, {
                awaiting: a(R).status === "completed",
                expanded: a(u) === a(R).id
              }), me(vt, "data-card-id", a(R).id), K(Ft, Dn), K(Ar, a(R).title), gr(Xn, `background: ${Fn ?? ""}20; color: ${Tr ?? ""}; border-color: ${ss ?? ""}40;`), K(_o, Nr), Is = Qe(wo, 0, "chevron svelte-1fnmin5", null, Is, { "chevron-open": a(u) === a(R).id });
            },
            [
              () => pe(a(R).type),
              () => ut(a(R).status),
              () => ut(a(R).status),
              () => ut(a(R).status),
              () => Zt(a(R).status)
            ]
          ), V("click", Dt, () => B(a(R).id)), $(Ee, vt);
        }), y(te), $(F, te);
      };
      U(ke, (F) => {
        s() ? F(wn) : o() && r().length === 0 ? F(Pt, 1) : r().length === 0 ? F(We, 2) : a(T).length === 0 ? F(A, 3) : F(P, !1);
      });
    }
    y(ce), Qs(3, ce, () => ro, () => ({ duration: 200 })), $(C, ce);
  }), y(Qt), mr(Qt, (C) => w(f, C), () => a(f)), y(xe), O(() => {
    dt = Qe(Re, 1, "subtab svelte-1fnmin5", null, dt, { active: a(g) === "active" }), Te = Qe(Ie, 1, "subtab svelte-1fnmin5", null, Te, { active: a(g) === "done" });
  }), V("click", Re, () => w(g, "active")), V("click", Ie, () => w(g, "done")), $(e, xe), Mn(we);
}
Rs(["click"]);
Kn(
  Dl,
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
var vv = /* @__PURE__ */ N('<div class="drag-handle svelte-nv4d5v"><svg width="10" height="16" viewBox="0 0 10 16" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor"></circle><circle cx="7" cy="3" r="1.5" fill="currentColor"></circle><circle cx="3" cy="8" r="1.5" fill="currentColor"></circle><circle cx="7" cy="8" r="1.5" fill="currentColor"></circle><circle cx="3" cy="13" r="1.5" fill="currentColor"></circle><circle cx="7" cy="13" r="1.5" fill="currentColor"></circle></svg></div>'), pv = /* @__PURE__ */ N('<span class="tab-badge svelte-nv4d5v"> </span>'), hv = /* @__PURE__ */ N("<option> </option>"), gv = /* @__PURE__ */ N("<option> </option>"), mv = /* @__PURE__ */ N('<span class="capture-spinner svelte-nv4d5v"></span> Capturing...', 1), bv = /* @__PURE__ */ N('<span class="tool-count svelte-nv4d5v"> </span>'), _v = /* @__PURE__ */ bn('<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle></svg> Screenshot<!>', 1), wv = /* @__PURE__ */ N('<span class="tool-count svelte-nv4d5v"> </span>'), yv = /* @__PURE__ */ N("Pick<!>", 1), xv = /* @__PURE__ */ N('<span class="tool-count svelte-nv4d5v"> </span>'), kv = /* @__PURE__ */ bn('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"></path></svg>'), Ev = /* @__PURE__ */ bn('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M7 15V9l3 4 3-4v6M17 12h-3v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'), Sv = /* @__PURE__ */ bn('<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"></path><path d="M14 2v6h6" stroke="currentColor" stroke-width="2"></path></svg>'), $v = /* @__PURE__ */ N('<div class="attachment-item svelte-nv4d5v"><span class="attachment-icon svelte-nv4d5v"><!></span> <span class="attachment-name svelte-nv4d5v"> </span> <span class="attachment-size svelte-nv4d5v"> </span> <button class="attachment-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), Cv = /* @__PURE__ */ N('<div class="attachments-list svelte-nv4d5v"></div>'), Av = /* @__PURE__ */ N('<div class="element-item svelte-nv4d5v"><span class="element-tag svelte-nv4d5v"> </span> <span class="element-text svelte-nv4d5v"> </span> <button class="element-remove svelte-nv4d5v" aria-label="Remove">&times;</button></div>'), Tv = /* @__PURE__ */ N('<div class="elements-list svelte-nv4d5v"></div>'), Nv = /* @__PURE__ */ N('<div class="attach-summary svelte-nv4d5v"> </div>'), Rv = /* @__PURE__ */ N('<span class="spinner svelte-nv4d5v"></span> Submitting...', 1), jv = /* @__PURE__ */ N('<form class="panel-body svelte-nv4d5v"><div class="field svelte-nv4d5v"><label for="jat-fb-title" class="svelte-nv4d5v">Title <span class="req svelte-nv4d5v">*</span></label> <input id="jat-fb-title" type="text" placeholder="Brief description" required="" class="svelte-nv4d5v"/></div> <div class="field svelte-nv4d5v"><label for="jat-fb-desc" class="svelte-nv4d5v">Description</label> <textarea id="jat-fb-desc" placeholder="Steps to reproduce, expected vs actual..." rows="3" class="svelte-nv4d5v"></textarea></div> <div class="field-row svelte-nv4d5v"><div class="field half svelte-nv4d5v"><label for="jat-fb-type" class="svelte-nv4d5v">Type</label> <select id="jat-fb-type" class="svelte-nv4d5v"></select></div> <div class="field half svelte-nv4d5v"><label for="jat-fb-priority" class="svelte-nv4d5v">Priority</label> <select id="jat-fb-priority" class="svelte-nv4d5v"></select></div></div> <div class="tools svelte-nv4d5v"><div class="tool-buttons svelte-nv4d5v"><button type="button" class="tool-btn svelte-nv4d5v"><!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 2L7 22M17 2V22M2 7H22M2 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> <!></button> <button type="button" class="tool-btn svelte-nv4d5v"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> Upload<!></button> <input type="file" multiple="" accept="image/*,video/*,.md,.txt,.pdf,.doc,.docx,.csv,.json,.xml,.html,.log" style="display:none" class="svelte-nv4d5v"/></div> <!></div> <!> <!> <!> <!> <div class="actions svelte-nv4d5v"><span class="panel-version svelte-nv4d5v"> </span> <button type="button" class="cancel-btn svelte-nv4d5v">Cancel</button> <button type="submit" class="submit-btn svelte-nv4d5v"><!></button></div></form>'), Iv = /* @__PURE__ */ N('<div class="requests-wrapper svelte-nv4d5v"><!></div>'), Mv = /* @__PURE__ */ N('<div class="panel svelte-nv4d5v"><div class="panel-header svelte-nv4d5v"><!> <div class="tabs svelte-nv4d5v"><button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg> New</button> <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg> History <!></button></div> <button class="close-btn svelte-nv4d5v" aria-label="Close">&times;</button></div> <!> <!> <!></div> <!>', 1);
const Lv = {
  hash: "svelte-nv4d5v",
  code: `.panel.svelte-nv4d5v {width:380px;max-height:702px;background:#111827;border:1px solid #374151;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;color:#e5e7eb;display:flex;flex-direction:column;overflow:hidden;position:relative;}.panel-header.svelte-nv4d5v {display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 0;border-bottom:1px solid #1f2937;}.drag-handle.svelte-nv4d5v {display:flex;align-items:center;justify-content:center;width:24px;padding:0 2px 0 8px;color:#6b7280;cursor:grab;flex-shrink:0;user-select:none;transition:color 0.15s;}.drag-handle.svelte-nv4d5v:hover {color:#d1d5db;}.drag-handle.svelte-nv4d5v:active {cursor:grabbing;color:#e5e7eb;}.tabs.svelte-nv4d5v {display:flex;flex:1;}.tab.svelte-nv4d5v {display:flex;align-items:center;gap:5px;padding:11px 14px;background:none;border:none;border-bottom:2px solid transparent;color:#6b7280;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:color 0.15s, border-color 0.15s;white-space:nowrap;}.tab.svelte-nv4d5v:hover {color:#d1d5db;}.tab.active.svelte-nv4d5v {color:#f9fafb;border-bottom-color:#3b82f6;}.tab-badge.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#f59e0b;color:#111827;font-size:10px;font-weight:700;line-height:1;}.close-btn.svelte-nv4d5v {background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0;}.close-btn.svelte-nv4d5v:hover {color:#e5e7eb;}.panel-body.svelte-nv4d5v {padding:14px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;}.field.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.field-row.svelte-nv4d5v {display:flex;gap:10px;}.half.svelte-nv4d5v {flex:1;}label.svelte-nv4d5v {font-weight:600;font-size:12px;color:#9ca3af;}.req.svelte-nv4d5v {color:#ef4444;}input.svelte-nv4d5v, textarea.svelte-nv4d5v, select.svelte-nv4d5v {padding:7px 10px;border:1px solid #374151;border-radius:5px;font-size:13px;font-family:inherit;color:#e5e7eb;background:#1f2937;transition:border-color 0.15s;}input.svelte-nv4d5v:focus, textarea.svelte-nv4d5v:focus, select.svelte-nv4d5v:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.2);}input.svelte-nv4d5v:disabled, textarea.svelte-nv4d5v:disabled, select.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}textarea.svelte-nv4d5v {resize:vertical;min-height:48px;}select.svelte-nv4d5v {appearance:auto;}.tools.svelte-nv4d5v {display:flex;flex-direction:column;gap:6px;}.tool-buttons.svelte-nv4d5v {display:flex;gap:6px;}.tool-buttons.svelte-nv4d5v .tool-btn:where(.svelte-nv4d5v) {flex:1;}.tool-btn.svelte-nv4d5v {display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:12px;cursor:pointer;font-family:inherit;transition:background 0.15s;}.tool-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.tool-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.capture-spinner.svelte-nv4d5v {display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-capture-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-capture-spin {
    to { transform: rotate(360deg); }
  }.tool-count.svelte-nv4d5v {display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3b82f6;color:white;font-size:10px;font-weight:700;margin-left:2px;}.elements-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.element-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e3a5f;border:1px solid #2563eb40;border-radius:5px;font-size:11px;color:#93c5fd;}.element-tag.svelte-nv4d5v {font-family:monospace;font-weight:600;color:#60a5fa;flex-shrink:0;}.element-text.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9ca3af;}.element-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.element-remove.svelte-nv4d5v:hover {color:#ef4444;}.attachments-list.svelte-nv4d5v {display:flex;flex-direction:column;gap:4px;}.attachment-item.svelte-nv4d5v {display:flex;align-items:center;gap:6px;padding:5px 8px;background:#1e2d3f;border:1px solid #374151;border-radius:5px;font-size:11px;color:#d1d5db;}.attachment-icon.svelte-nv4d5v {display:flex;align-items:center;color:#9ca3af;flex-shrink:0;}.attachment-name.svelte-nv4d5v {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.attachment-size.svelte-nv4d5v {color:#6b7280;font-size:10px;flex-shrink:0;}.attachment-remove.svelte-nv4d5v {background:none;border:none;color:#6b7280;cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;}.attachment-remove.svelte-nv4d5v:hover {color:#ef4444;}.attach-summary.svelte-nv4d5v {font-size:11px;color:#6b7280;text-align:center;}.actions.svelte-nv4d5v {display:flex;gap:8px;justify-content:flex-end;padding-top:4px;}.cancel-btn.svelte-nv4d5v {padding:7px 14px;background:#1f2937;border:1px solid #374151;border-radius:5px;color:#d1d5db;font-size:13px;cursor:pointer;font-family:inherit;}.cancel-btn.svelte-nv4d5v:hover:not(:disabled) {background:#374151;}.cancel-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.submit-btn.svelte-nv4d5v {padding:7px 16px;background:#3b82f6;border:none;border-radius:5px;color:white;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;transition:background 0.15s;}.submit-btn.svelte-nv4d5v:hover:not(:disabled) {background:#2563eb;}.submit-btn.svelte-nv4d5v:disabled {opacity:0.5;cursor:not-allowed;}.spinner.svelte-nv4d5v {display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;
    animation: svelte-nv4d5v-spin 0.6s linear infinite;}
  @keyframes svelte-nv4d5v-spin {
    to { transform: rotate(360deg); }
  }.requests-wrapper.svelte-nv4d5v {flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.panel-version.svelte-nv4d5v {font-size:10px;color:#4b5563;margin-right:auto;align-self:flex-end;padding-bottom:6px;}`
};
function Fl(e, t) {
  In(t, !0), Yn(e, Lv);
  const n = "1.7.1";
  let r = X(t, "endpoint", 7), s = X(t, "project", 7), o = X(t, "isOpen", 7, !1), i = X(t, "userId", 7, ""), l = X(t, "userEmail", 7, ""), c = X(t, "userName", 7, ""), u = X(t, "userRole", 7, ""), f = X(t, "orgId", 7, ""), d = X(t, "orgName", 7, ""), v = X(t, "onclose", 7), p = X(t, "ongrip", 7), _ = /* @__PURE__ */ D("new"), b = /* @__PURE__ */ D(Le([])), h = /* @__PURE__ */ D(!1), g = /* @__PURE__ */ D(""), T = /* @__PURE__ */ At(() => a(b).filter((E) => E.status === "completed").length);
  async function k() {
    w(h, !0), w(g, "");
    const E = await Bf(r());
    w(b, E.reports, !0), E.error && w(g, E.error, !0), w(h, !1);
  }
  Os(() => {
    r() && k();
  });
  let M = /* @__PURE__ */ D(""), L = /* @__PURE__ */ D(""), B = /* @__PURE__ */ D("bug"), ee = /* @__PURE__ */ D("medium"), q = /* @__PURE__ */ D(Le([])), se = /* @__PURE__ */ D(Le([])), oe = /* @__PURE__ */ D(Le([])), De = /* @__PURE__ */ D(Le([])), Fe = /* @__PURE__ */ D(void 0);
  const tt = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ];
  function Jt() {
    var E;
    (E = a(Fe)) == null || E.click();
  }
  async function He(E) {
    const H = E.target, ve = H.files;
    if (!(!ve || ve.length === 0)) {
      for (const ue of ve)
        try {
          const tn = await It(ue);
          tt.includes(ue.type) ? (w(q, [...a(q), tn], !0), Te(`Image added: ${ue.name}`, "success")) : (w(
            se,
            [
              ...a(se),
              {
                name: ue.name,
                type: ue.type || "application/octet-stream",
                data: tn,
                size: ue.size
              }
            ],
            !0
          ), Te(`File attached: ${ue.name}`, "success"));
        } catch {
          Te(`Failed to read: ${ue.name}`, "error");
        }
      H.value = "";
    }
  }
  function It(E) {
    return new Promise((H, ve) => {
      const ue = new FileReader();
      ue.onload = () => H(ue.result), ue.onerror = () => ve(ue.error), ue.readAsDataURL(E);
    });
  }
  function Zt(E) {
    w(se, a(se).filter((H, ve) => ve !== E), !0);
  }
  function ut(E) {
    return E < 1024 ? `${E}B` : E < 1024 * 1024 ? `${(E / 1024).toFixed(1)}KB` : `${(E / (1024 * 1024)).toFixed(1)}MB`;
  }
  let pe = /* @__PURE__ */ D(!1), j = /* @__PURE__ */ D(!1), we = /* @__PURE__ */ D(!1), xe = /* @__PURE__ */ D(null), Ve = /* @__PURE__ */ D(""), Re = /* @__PURE__ */ D(void 0), dt = !1;
  Os(() => {
    o() && !dt && (requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        var E;
        (E = a(Re)) == null || E.focus();
      });
    }), a(_) === "new" && a(q).length === 0 && setTimeout(
      () => {
        od().then((E) => {
          w(q, [...a(q), E], !0);
        }).catch(() => {
        });
      },
      300
    )), dt = o();
  });
  let Mt = /* @__PURE__ */ D(""), Lt = /* @__PURE__ */ D("success"), Ie = /* @__PURE__ */ D(!1);
  function Te(E, H) {
    w(Mt, E, !0), w(Lt, H, !0), w(Ie, !0), setTimeout(
      () => {
        w(Ie, !1);
      },
      3e3
    );
  }
  async function _n() {
    w(j, !0);
    try {
      const E = await jl();
      w(Ve, E, !0), w(xe, a(
        q
        // new index (not yet in array)
      ).length, !0);
    } catch (E) {
      console.error("[jat-feedback] Screenshot failed:", E), Te("Screenshot failed: " + (E instanceof Error ? E.message : "unknown error"), "error");
    } finally {
      w(j, !1);
    }
  }
  function Ln(E) {
    w(q, a(q).filter((H, ve) => ve !== E), !0);
  }
  function Qt(E) {
    w(Ve, a(q)[E], !0), w(xe, E, !0);
  }
  function rs(E) {
    a(xe) !== null && (a(xe) >= a(q).length ? (w(q, [...a(q), E], !0), Te(`Screenshot captured (${a(q).length})`, "success")) : (w(q, a(q).map((H, ve) => ve === a(xe) ? E : H), !0), Te("Screenshot updated", "success"))), w(xe, null), w(Ve, "");
  }
  function C() {
    a(xe) !== null && a(xe) >= a(q).length && (w(q, [...a(q), a(Ve)], !0), Te(`Screenshot captured (${a(q).length})`, "success")), w(xe, null), w(Ve, "");
  }
  function ce() {
    w(we, !0), sl((E) => {
      w(oe, [...a(oe), E], !0), w(we, !1), Te(`Element captured: <${E.tagName.toLowerCase()}>`, "success");
    });
  }
  function ke() {
    w(De, Af(), !0);
  }
  async function wn(E) {
    if (E.preventDefault(), !a(M).trim()) return;
    w(pe, !0), ke();
    const H = {};
    (i() || l() || c() || u()) && (H.reporter = {}, i() && (H.reporter.userId = i()), l() && (H.reporter.email = l()), c() && (H.reporter.name = c()), u() && (H.reporter.role = u())), (f() || d()) && (H.organization = {}, f() && (H.organization.id = f()), d() && (H.organization.name = d()));
    const ve = {
      title: a(M).trim(),
      description: a(L).trim(),
      type: a(B),
      priority: a(ee),
      project: s() || "",
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      console_logs: a(De).length > 0 ? a(De) : null,
      selected_elements: a(oe).length > 0 ? a(oe) : null,
      screenshots: a(q).length > 0 ? a(q) : null,
      attachments: a(se).length > 0 ? a(se) : null,
      metadata: Object.keys(H).length > 0 ? H : null
    };
    try {
      const ue = await cl(r(), ve);
      ue.ok ? (Te(`Report submitted (${ue.id})`, "success"), Pt(), setTimeout(
        () => {
          k(), w(_, "requests");
        },
        1200
      )) : (Ri(r(), ve), Te("Queued for retry (endpoint unreachable)", "error"));
    } catch {
      Ri(r(), ve), Te("Queued for retry (endpoint unreachable)", "error");
    } finally {
      w(pe, !1);
    }
  }
  function Pt() {
    w(M, ""), w(L, ""), w(B, "bug"), w(ee, "medium"), w(q, [], !0), w(se, [], !0), w(oe, [], !0), w(De, [], !0);
  }
  Os(() => {
    ke();
  });
  function We(E) {
    E.stopPropagation();
  }
  const A = [
    { value: "bug", label: "Bug" },
    { value: "enhancement", label: "Enhancement" },
    { value: "other", label: "Other" }
  ], P = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];
  function F() {
    return a(q).length + a(se).length + a(oe).length;
  }
  var te = {
    get endpoint() {
      return r();
    },
    set endpoint(E) {
      r(E), W();
    },
    get project() {
      return s();
    },
    set project(E) {
      s(E), W();
    },
    get isOpen() {
      return o();
    },
    set isOpen(E = !1) {
      o(E), W();
    },
    get userId() {
      return i();
    },
    set userId(E = "") {
      i(E), W();
    },
    get userEmail() {
      return l();
    },
    set userEmail(E = "") {
      l(E), W();
    },
    get userName() {
      return c();
    },
    set userName(E = "") {
      c(E), W();
    },
    get userRole() {
      return u();
    },
    set userRole(E = "") {
      u(E), W();
    },
    get orgId() {
      return f();
    },
    set orgId(E = "") {
      f(E), W();
    },
    get orgName() {
      return d();
    },
    set orgName(E = "") {
      d(E), W();
    },
    get onclose() {
      return v();
    },
    set onclose(E) {
      v(E), W();
    },
    get ongrip() {
      return p();
    },
    set ongrip(E) {
      p(E), W();
    }
  }, Ee = Mv(), R = _t(Ee), vt = x(R), en = x(vt);
  {
    var Dt = (E) => {
      var H = vv();
      V("mousedown", H, function(...ve) {
        var ue;
        (ue = p()) == null || ue.apply(this, ve);
      }), $(E, H);
    };
    U(en, (E) => {
      p() && E(Dt);
    });
  }
  var nt = S(en, 2), Ft = x(nt);
  let Pn;
  var Ar = S(Ft, 2);
  let Xn;
  var _o = S(x(Ar), 2);
  {
    var wo = (E) => {
      var H = pv(), ve = x(H, !0);
      y(H), O(() => K(ve, a(T))), $(E, H);
    };
    U(_o, (E) => {
      a(T) > 0 && E(wo);
    });
  }
  y(Ar), y(nt);
  var Is = S(nt, 2);
  y(vt);
  var Ms = S(vt, 2);
  {
    var yo = (E) => {
      var H = jv(), ve = x(H), ue = S(x(ve), 2);
      Ga(ue), mr(ue, (I) => w(Re, I), () => a(Re)), y(ve);
      var tn = S(ve, 2), os = S(x(tn), 2);
      $a(os), y(tn);
      var Rr = S(tn, 2), is = x(Rr), Gn = S(x(is), 2);
      Ke(Gn, 21, () => A, lt, (I, z) => {
        var fe = hv(), _e = x(fe, !0);
        y(fe);
        var ie = {};
        O(() => {
          K(_e, a(z).label), ie !== (ie = a(z).value) && (fe.value = (fe.__value = a(z).value) ?? "");
        }), $(I, fe);
      }), y(Gn), y(is);
      var jr = S(is, 2), Ir = S(x(jr), 2);
      Ke(Ir, 21, () => P, lt, (I, z) => {
        var fe = gv(), _e = x(fe, !0);
        y(fe);
        var ie = {};
        O(() => {
          K(_e, a(z).label), ie !== (ie = a(z).value) && (fe.value = (fe.__value = a(z).value) ?? "");
        }), $(I, fe);
      }), y(Ir), y(jr), y(Rr);
      var as = S(Rr, 2), ls = x(as), Jn = x(ls), xo = x(Jn);
      {
        var ne = (I) => {
          var z = mv();
          Ks(), $(I, z);
        }, ae = (I) => {
          var z = _v(), fe = S(_t(z), 2);
          {
            var _e = (ie) => {
              var de = bv(), je = x(de, !0);
              y(de), O(() => K(je, a(q).length)), $(ie, de);
            };
            U(fe, (ie) => {
              a(q).length > 0 && ie(_e);
            });
          }
          $(I, z);
        };
        U(xo, (I) => {
          a(j) ? I(ne) : I(ae, !1);
        });
      }
      y(Jn);
      var he = S(Jn, 2), rt = S(x(he), 2);
      {
        var nn = (I) => {
          var z = wi("Click an element...");
          $(I, z);
        }, pt = (I) => {
          var z = yv(), fe = S(_t(z));
          {
            var _e = (ie) => {
              var de = wv(), je = x(de, !0);
              y(de), O(() => K(je, a(oe).length)), $(ie, de);
            };
            U(fe, (ie) => {
              a(oe).length > 0 && ie(_e);
            });
          }
          $(I, z);
        };
        U(rt, (I) => {
          a(we) ? I(nn) : I(pt, !1);
        });
      }
      y(he);
      var Se = S(he, 2), $e = S(x(Se), 2);
      {
        var Ge = (I) => {
          var z = xv(), fe = x(z, !0);
          y(z), O(() => K(fe, a(se).length)), $(I, z);
        };
        U($e, (I) => {
          a(se).length > 0 && I(Ge);
        });
      }
      y(Se);
      var ge = S(Se, 2);
      mr(ge, (I) => w(Fe, I), () => a(Fe)), y(ls);
      var xt = S(ls, 2);
      Il(xt, {
        get screenshots() {
          return a(q);
        },
        get capturing() {
          return a(j);
        },
        oncapture: _n,
        onremove: Ln,
        onedit: Qt
      }), y(as);
      var qn = S(as, 2);
      {
        var be = (I) => {
          var z = Cv();
          Ke(z, 21, () => a(se), lt, (fe, _e, ie) => {
            var de = $v(), je = x(de), st = x(je);
            {
              var Ye = (Bt) => {
                var cs = kv();
                $(Bt, cs);
              }, ht = /* @__PURE__ */ At(() => a(_e).type.includes("pdf")), kt = (Bt) => {
                var cs = Ev();
                $(Bt, cs);
              }, Ze = /* @__PURE__ */ At(() => a(_e).type.includes("markdown") || a(_e).name.endsWith(".md")), on = (Bt) => {
                var cs = Sv();
                $(Bt, cs);
              };
              U(st, (Bt) => {
                a(ht) ? Bt(Ye) : a(Ze) ? Bt(kt, 1) : Bt(on, !1);
              });
            }
            y(je);
            var nr = S(je, 2), xn = x(nr, !0);
            y(nr);
            var zt = S(nr, 2), an = x(zt, !0);
            y(zt);
            var Pr = S(zt, 2);
            y(de), O(
              (Bt) => {
                K(xn, a(_e).name), K(an, Bt);
              },
              [() => ut(a(_e).size)]
            ), V("click", Pr, () => Zt(ie)), $(fe, de);
          }), y(z), $(I, z);
        };
        U(qn, (I) => {
          a(se).length > 0 && I(be);
        });
      }
      var yn = S(qn, 2);
      {
        var Zn = (I) => {
          var z = Tv();
          Ke(z, 21, () => a(oe), lt, (fe, _e, ie) => {
            var de = Av(), je = x(de), st = x(je);
            y(je);
            var Ye = S(je, 2), ht = x(Ye, !0);
            y(Ye);
            var kt = S(Ye, 2);
            y(de), O(
              (Ze, on) => {
                K(st, `<${Ze ?? ""}>`), K(ht, on);
              },
              [
                () => a(_e).tagName.toLowerCase(),
                () => {
                  var Ze;
                  return ((Ze = a(_e).textContent) == null ? void 0 : Ze.substring(0, 40)) || a(_e).selector;
                }
              ]
            ), V("click", kt, () => {
              w(oe, a(oe).filter((Ze, on) => on !== ie), !0);
            }), $(fe, de);
          }), y(z), $(I, z);
        };
        U(yn, (I) => {
          a(oe).length > 0 && I(Zn);
        });
      }
      var On = S(yn, 2);
      Ll(On, {
        get logs() {
          return a(De);
        }
      });
      var rn = S(On, 2);
      {
        var Mr = (I) => {
          var z = Nv(), fe = x(z);
          y(z), O((_e, ie) => K(fe, `${_e ?? ""} attachment${ie ?? ""} will be included`), [F, () => F() > 1 ? "s" : ""]), $(I, z);
        }, qt = /* @__PURE__ */ At(() => F() > 0);
        U(rn, (I) => {
          a(qt) && I(Mr);
        });
      }
      var Qn = S(rn, 2), er = x(Qn), Lr = x(er);
      y(er);
      var tr = S(er, 2), ye = S(tr, 2), Je = x(ye);
      {
        var sn = (I) => {
          var z = Rv();
          Ks(), $(I, z);
        }, Ot = (I) => {
          var z = wi("Submit");
          $(I, z);
        };
        U(Je, (I) => {
          a(pe) ? I(sn) : I(Ot, !1);
        });
      }
      y(ye), y(Qn), y(H), O(
        (I) => {
          ue.disabled = a(pe), os.disabled = a(pe), Gn.disabled = a(pe), Ir.disabled = a(pe), Jn.disabled = a(j), he.disabled = a(we), Se.disabled = a(pe), K(Lr, `v${n}`), tr.disabled = a(pe), ye.disabled = I;
        },
        [() => a(pe) || !a(M).trim()]
      ), Js("submit", H, wn), eo(ue, () => a(M), (I) => w(M, I)), eo(os, () => a(L), (I) => w(L, I)), Si(Gn, () => a(B), (I) => w(B, I)), Si(Ir, () => a(ee), (I) => w(ee, I)), V("click", Jn, _n), V("click", he, ce), V("click", Se, Jt), V("change", ge, He), V("click", tr, function(...I) {
        var z;
        (z = v()) == null || z.apply(this, I);
      }), Qs(3, H, () => ro, () => ({ duration: 200 })), $(E, H);
    };
    U(Ms, (E) => {
      a(_) === "new" && E(yo);
    });
  }
  var Dn = S(Ms, 2);
  {
    var Fn = (E) => {
      var H = Iv(), ve = x(H);
      Dl(ve, {
        get endpoint() {
          return r();
        },
        get loading() {
          return a(h);
        },
        get error() {
          return a(g);
        },
        onreload: k,
        get reports() {
          return a(b);
        },
        set reports(ue) {
          w(b, ue, !0);
        }
      }), y(H), Qs(3, H, () => ro, () => ({ duration: 200 })), $(E, H);
    };
    U(Dn, (E) => {
      a(_) === "requests" && E(Fn);
    });
  }
  var Tr = S(Dn, 2);
  Pl(Tr, {
    get message() {
      return a(Mt);
    },
    get type() {
      return a(Lt);
    },
    get visible() {
      return a(Ie);
    }
  }), y(R);
  var ss = S(R, 2);
  {
    var Nr = (E) => {
      Ml(E, {
        get imageDataUrl() {
          return a(Ve);
        },
        onsave: rs,
        oncancel: C
      });
    };
    U(ss, (E) => {
      a(xe) !== null && E(Nr);
    });
  }
  return O(() => {
    Pn = Qe(Ft, 1, "tab svelte-nv4d5v", null, Pn, { active: a(_) === "new" }), Xn = Qe(Ar, 1, "tab svelte-nv4d5v", null, Xn, { active: a(_) === "requests" });
  }), V("keydown", R, We), V("keyup", R, We), Js("keypress", R, We), V("click", Ft, () => w(_, "new")), V("click", Ar, () => w(_, "requests")), V("click", Is, function(...E) {
    var H;
    (H = v()) == null || H.apply(this, E);
  }), $(e, Ee), Mn(te);
}
Rs(["keydown", "keyup", "mousedown", "click", "change"]);
Kn(
  Fl,
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
var Pv = /* @__PURE__ */ N("<div><!></div>"), Dv = /* @__PURE__ */ N('<div class="jat-feedback-panel svelte-qpyrvv"><div class="no-endpoint svelte-qpyrvv"><p class="svelte-qpyrvv">No endpoint configured.</p> <p class="svelte-qpyrvv">Add the <code class="svelte-qpyrvv">endpoint</code> attribute:</p> <code class="example svelte-qpyrvv">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code></div></div>'), Fv = /* @__PURE__ */ N('<div class="jat-feedback-root svelte-qpyrvv"><!> <!></div>');
const qv = {
  hash: "svelte-qpyrvv",
  code: `.jat-feedback-root.svelte-qpyrvv {position:fixed;z-index:2147483647;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;}.jat-feedback-panel.svelte-qpyrvv {position:absolute;
    animation: svelte-qpyrvv-panel-in 0.2s ease;}.jat-feedback-panel.hidden.svelte-qpyrvv {display:none;}.jat-feedback-panel.dragging.svelte-qpyrvv {pointer-events:none;opacity:0.9;}.no-endpoint.svelte-qpyrvv {width:320px;background:#111827;border:1px solid #374151;border-radius:12px;padding:20px;color:#d1d5db;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,0.4);}.no-endpoint.svelte-qpyrvv p:where(.svelte-qpyrvv) {margin:0 0 8px;}.no-endpoint.svelte-qpyrvv code:where(.svelte-qpyrvv) {font-family:'SF Mono', 'Fira Code', monospace;font-size:11px;color:#93c5fd;}.no-endpoint.svelte-qpyrvv code.example:where(.svelte-qpyrvv) {display:block;background:#1f2937;padding:8px 10px;border-radius:4px;margin-top:4px;}
  @keyframes svelte-qpyrvv-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }`
};
function Ov(e, t) {
  In(t, !0), Yn(e, qv);
  let n = X(t, "endpoint", 7, ""), r = X(t, "project", 7, ""), s = X(t, "position", 7, "bottom-right"), o = X(t, "theme", 7, "dark"), i = X(t, "buttoncolor", 7, "#3b82f6"), l = X(t, "user-id", 7, ""), c = X(t, "user-email", 7, ""), u = X(t, "user-name", 7, ""), f = X(t, "user-role", 7, ""), d = X(t, "org-id", 7, ""), v = X(t, "org-name", 7, ""), p = /* @__PURE__ */ D(!1), _ = /* @__PURE__ */ D(!1), b = /* @__PURE__ */ D(!1), h = { x: 0, y: 0 }, g = /* @__PURE__ */ D(void 0);
  const T = 5;
  function k(j, { onDragEnd: we } = {}) {
    if (!a(g)) return;
    const xe = j.clientX, Ve = j.clientY, Re = a(g).getBoundingClientRect();
    h = { x: j.clientX - Re.left, y: j.clientY - Re.top };
    let dt = !1;
    function Mt(Ie) {
      if (!a(g)) return;
      const Te = Ie.clientX - xe, _n = Ie.clientY - Ve;
      if (!dt && Math.abs(Te) + Math.abs(_n) < T) return;
      dt = !0, w(b, !0), Ie.preventDefault();
      const Ln = Ie.clientX - h.x, Qt = Ie.clientY - h.y;
      a(g).style.top = `${Qt}px`, a(g).style.left = `${Ln}px`, a(g).style.bottom = "auto", a(g).style.right = "auto";
    }
    function Lt() {
      w(b, !1), window.removeEventListener("mousemove", Mt), window.removeEventListener("mouseup", Lt), we == null || we(dt);
    }
    window.addEventListener("mousemove", Mt), window.addEventListener("mouseup", Lt);
  }
  function M(j) {
    k(j);
  }
  function L(j) {
    j.button === 0 && (j.preventDefault(), k(j, {
      onDragEnd(we) {
        we || se();
      }
    }));
  }
  let B = null;
  function ee() {
    B = setInterval(
      () => {
        const j = If();
        j && !a(_) ? w(_, !0) : !j && a(_) && w(_, !1);
      },
      100
    );
  }
  let q = /* @__PURE__ */ At(() => ({
    ...us,
    endpoint: n() || us.endpoint,
    position: s() || us.position,
    theme: o() || us.theme,
    buttonColor: i() || us.buttonColor
  }));
  function se() {
    w(p, !a(p));
  }
  function oe() {
    w(p, !1);
  }
  const De = {
    "bottom-right": "bottom: 20px; right: 20px;",
    "bottom-left": "bottom: 20px; left: 20px;",
    "top-right": "top: 20px; right: 20px;",
    "top-left": "top: 20px; left: 20px;"
  }, Fe = {
    "bottom-right": "bottom: 80px; right: 0;",
    "bottom-left": "bottom: 80px; left: 0;",
    "top-right": "top: 80px; right: 0;",
    "top-left": "top: 80px; left: 0;"
  };
  function tt(j) {
    if (j.key === "Escape" && a(p)) {
      if (Mf()) return;
      j.stopPropagation(), j.stopImmediatePropagation(), oe();
    }
  }
  si(() => {
    a(q).captureConsole && $f(a(q).maxConsoleLogs), Wf(), ee(), window.addEventListener("keydown", tt, !0);
    const j = () => {
      w(p, !0);
    };
    return window.addEventListener("jat-feedback:open", j), () => window.removeEventListener("jat-feedback:open", j);
  }), Ya(() => {
    Cf(), Yf(), window.removeEventListener("keydown", tt, !0), B && clearInterval(B);
  });
  var Jt = {
    get endpoint() {
      return n();
    },
    set endpoint(j = "") {
      n(j), W();
    },
    get project() {
      return r();
    },
    set project(j = "") {
      r(j), W();
    },
    get position() {
      return s();
    },
    set position(j = "bottom-right") {
      s(j), W();
    },
    get theme() {
      return o();
    },
    set theme(j = "dark") {
      o(j), W();
    },
    get buttoncolor() {
      return i();
    },
    set buttoncolor(j = "#3b82f6") {
      i(j), W();
    },
    get "user-id"() {
      return l();
    },
    set "user-id"(j = "") {
      l(j), W();
    },
    get "user-email"() {
      return c();
    },
    set "user-email"(j = "") {
      c(j), W();
    },
    get "user-name"() {
      return u();
    },
    set "user-name"(j = "") {
      u(j), W();
    },
    get "user-role"() {
      return f();
    },
    set "user-role"(j = "") {
      f(j), W();
    },
    get "org-id"() {
      return d();
    },
    set "org-id"(j = "") {
      d(j), W();
    },
    get "org-name"() {
      return v();
    },
    set "org-name"(j = "") {
      v(j), W();
    }
  }, He = Fv(), It = x(He);
  {
    var Zt = (j) => {
      var we = Pv();
      let xe;
      var Ve = x(we);
      Fl(Ve, {
        get endpoint() {
          return a(q).endpoint;
        },
        get project() {
          return r();
        },
        get isOpen() {
          return a(p);
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
        onclose: oe,
        ongrip: M
      }), y(we), O(() => {
        xe = Qe(we, 1, "jat-feedback-panel svelte-qpyrvv", null, xe, { dragging: a(b), hidden: !a(p) }), gr(we, Fe[a(q).position] || Fe["bottom-right"]);
      }), $(j, we);
    }, ut = (j) => {
      var we = Dv();
      O(() => gr(we, Fe[a(q).position] || Fe["bottom-right"])), $(j, we);
    };
    U(It, (j) => {
      a(q).endpoint ? j(Zt) : a(p) && j(ut, 1);
    });
  }
  var pe = S(It, 2);
  return vl(pe, {
    onmousedown: L,
    get open() {
      return a(p);
    }
  }), y(He), mr(He, (j) => w(g, j), () => a(g)), O(() => gr(He, `${(De[a(q).position] || De["bottom-right"]) ?? ""}; --jat-btn-color: ${a(q).buttonColor ?? ""}; ${a(_) ? "display: none;" : ""}`)), $(e, He), Mn(Jt);
}
customElements.define("jat-feedback", Kn(
  Ov,
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
